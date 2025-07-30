// models/User.ts
import { z } from "zod";
import mongoose from "mongoose";

const dateSchema = z.preprocess(
  // Convert string to Date if it's not already a Date
  (val) => (val instanceof Date ? val : new Date(val as string)),
  z
    .date()
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    // Add other validations as needed
    .refine((date) => date < new Date(), {
      message: "Date cannot be in the future",
    })
);

// Define Zod schemas for validation
export const baseProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: dateSchema,
  // dateOfBirth: z.date().refine((dob) => dob < new Date(), {
  //   message: "Date of birth must be in the past",
  // }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  userAgent: z.string().optional(),
});

export const patientProfileSchema = baseProfileSchema.extend({
  patientId: z
    .string()
    .min(4, "Patient ID must be at least 4 characters")
    .optional(),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  allergies: z.array(z.string()).optional(),
  guardianFullName: z
    .string()
    .min(2, "Full name must be at least 5 characters"),
  relationShip: z.string().min(2, "text must be at least 5 characters"),
  guardianPhone: z
    .string()
    .min(7, "phone number must be at least 7 characters"),
});

export const passwordSchema = z.string().min(4).max(20);

//!! uncomment later
// export const passwordSchema = z
//   .string()
//   .min(8, "Password must be at least 8 characters")
//   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//   .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//   .regex(/[0-9]/, "Password must contain at least one number");

export const emailSchema = z.string().email().min(1).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

// Main user schema with role discrimination
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    userAgent: z.string().optional(),
    role: z.enum([
      "doctor",
      "nurse",
      "social_worker",
      "lab_scientist",
      "patient",
      "admin",
    ]),
    profile: z.discriminatedUnion("role", [
      z.object({ role: z.literal("patient") }).merge(patientProfileSchema),
    ]),
    lastLogin: z.date().optional(),
    createdAt: z.date().default(() => new Date()),
    isActive: z.boolean().default(true),
    verified: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
// Export types and model
// export type UserDocument = mongoose.Document & z.infer<typeof userSchemaZ>;

// Export types and model
export type UserDocument = mongoose.Document &
  z.infer<typeof registerSchema> & {
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    omitSensitive: () => Omit<z.infer<typeof registerSchema>, "password">;
    getPublicProfile: () => Omit<
      z.infer<typeof registerSchema>,
      "password" | "__v" | "isActive" | "lastLogin" | "createdAt"
    >;
  };

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});
