"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRegistrationSchema = void 0;
const zod_1 = require("zod");
const zIsoDate = () => zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO datetime string",
});
const ChildRegistrationSchema = zod_1.z.object({
    lastName: zod_1.z.string().min(1, "Last name is required"),
    firstName: zod_1.z.string().min(1, "First name is required"),
    otherNames: zod_1.z.string().optional(),
    dateOfBirth: zIsoDate(),
    gender: zod_1.z.enum(["male", "female"]),
    hospital: zod_1.z.string().min(1, "Hospital is required"),
    town: zod_1.z.string().min(1, "Town is required"),
    fathersName: zod_1.z.string().min(1, "Father's name is required"),
    fathersNationality: zod_1.z.string().min(1, "Father's nationality is required"),
    fathersPhone: zod_1.z.string().min(1, "Father's phone is required"),
    fathersPlaceOfBirth: zod_1.z.string().min(1, "Father's place of birth is required"),
    mothersName: zod_1.z.string().min(1, "Mother's name is required"),
    mothersNationality: zod_1.z.string().min(1, "Mother's nationality is required"),
    mothersPhone: zod_1.z.string().min(1, "Mother's phone is required"),
    mothersPlaceOfBirth: zod_1.z.string().min(1, "Mother's place of birth is required"),
    witnessName: zod_1.z.string().min(1, "Witness name is required"),
    registrationDate: zIsoDate().optional(),
    clientId: zod_1.z.string().optional(),
    tempId: zod_1.z.string().optional(),
});
exports.bulkRegistrationSchema = zod_1.z.object({
    registrations: zod_1.z.array(ChildRegistrationSchema).min(1).max(100),
});
