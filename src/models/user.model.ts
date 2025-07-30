import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/hashing";
import {
  baseProfileSchema,
  registerSchema,
  UserDocument,
} from "../schema/auth.schema";

// Mongoose schema definition
const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (email: string) =>
          registerSchema._def.schema.shape.email.safeParse(email).success,
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (password: string) {
          return registerSchema._def?.schema?.shape.password.safeParse(password)
            .success;
        },
        message:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["users", "admin"],
      validate: {
        validator: (role: string) =>
          registerSchema._def.schema.shape.role.safeParse(role).success,
        message: "Invalid role",
      },
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        validate: {
          validator: (name: string) =>
            baseProfileSchema.shape.firstName.safeParse(name).success,
          message: "First name must be at least 2 characters",
        },
      },
      lastName: {
        type: String,
        required: true,
        validate: {
          validator: (name: string) =>
            baseProfileSchema.shape.lastName.safeParse(name).success,
          message: "Last name must be at least 2 characters",
        },
      },
      dateOfBirth: {
        type: Date,
        required: true,
        validate: {
          validator: function (dob: Date) {
            const dateValue =
              dob instanceof Date ? dob : new Date(dob as string);
            // Check if it's a valid date first
            if (isNaN(dateValue.getTime())) {
              return false;
            }
            return baseProfileSchema.shape.dateOfBirth.safeParse(dateValue)
              .success;
          },
          message: "Date of birth must be in the past",
        },
      },
      phoneNumber: {
        type: String,
        required: true,
        validate: {
          validator: (phone: string) =>
            baseProfileSchema.shape.phoneNumber.safeParse(phone).success,
          message: "Invalid phone number",
        },
      },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    verified: {
      type: Boolean,
      required: true,
      default: function (this: any) {
        return this.role === "admin";
      },
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await hashValue(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};
//!! uncomment later
// Add method to validate user data against Zod schema
userSchema.methods.validateUser = function () {
  return registerSchema.safeParse(this.toObject());
};

// Method to omit sensitive fields
userSchema.methods.omitSensitive = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v; // Optional: remove version key
  return user;
};

// Method to get public profile (even more restrictive)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.isActive;
  delete user.lastLogin;
  delete user.createdAt;
  return user;
};

// Static method to format user for response (alternative approach)
userSchema.statics.formatForResponse = function (user: any) {
  const { password, __v, ...userData } = user.toObject ? user.toObject() : user;
  return userData;
};

// Method to validate user data against Zod schema (updated to omit password)
userSchema.methods.validateUser = function () {
  const userData = this.omitSensitive();
  return registerSchema.safeParse(userData);
};

// Static method for Zod validation before saving
userSchema.statics.zodValidate = function (data: any) {
  return registerSchema.safeParse(data);
};

// userSchema.methods.omitPassword = function () {
//     const user = this.toObject();
//     delete user.password;
//     return user;
//   };

// Create the model
const UserModel = mongoose.model("User", userSchema);

export default UserModel;
