import { z } from "zod";

const zIsoDate = () =>
  z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO datetime string",
  });

const ChildRegistrationSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  otherNames: z.string().optional(),
  dateOfBirth: zIsoDate(),
  gender: z.enum(["male", "female"]),
  hospital: z.string().min(1, "Hospital is required"),
  town: z.string().min(1, "Town is required"),
  fathersName: z.string().min(1, "Father's name is required"),
  fathersNationality: z.string().min(1, "Father's nationality is required"),
  fathersPhone: z.string().min(1, "Father's phone is required"),
  fathersPlaceOfBirth: z.string().min(1, "Father's place of birth is required"),
  mothersName: z.string().min(1, "Mother's name is required"),
  mothersNationality: z.string().min(1, "Mother's nationality is required"),
  mothersPhone: z.string().min(1, "Mother's phone is required"),
  mothersPlaceOfBirth: z.string().min(1, "Mother's place of birth is required"),
  witnessName: z.string().min(1, "Witness name is required"),
  registrationDate: zIsoDate().optional(),
  clientId: z.string().optional(),
  tempId: z.string().optional(),
});


export const bulkRegistrationSchema = z.object({
  registrations: z.array(ChildRegistrationSchema).min(1).max(100), 
});

export interface ChildRegistrationData {
  lastName: string;
  firstName: string;
  otherNames?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  hospital: string;
  town: string;
  fathersName: string;
  fathersNationality: string;
  fathersPhone: string;
  fathersPlaceOfBirth: string;
  mothersName: string;
  mothersNationality: string;
  mothersPhone: string;
  mothersPlaceOfBirth: string;
  witnessName: string;
  registrationDate?: string;
  clientId?: string;
  tempId?: string;
}

export interface BulkRegistrationData {
  registrations: ChildRegistrationData[];
}