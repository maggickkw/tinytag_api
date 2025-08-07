import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../utils/response";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../services/authService";
import { LoginInput } from "../types/auth.types";
import { prisma } from "../utils/prisma";


export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<void> => {
  console.log("PAINNNNNN")
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      validationErrorResponse(res, "Username and password are required!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        volunteerProfile: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
            gender: true,
            phoneNumber: true,
            address: true,
            country: true,
            school: true,
            startYear: true,
            endYear: true,
            degree: true,
            nationalId: true,
            profilePhotoUrl: true,
            idPhotoFrontUrl: true,
            idPhotoBackUrl: true,
            createdAt: true,
            updatedAt: true,
            application: {
              select: {
                id: true,
                status: true,
                appliedAt: true,
                reviewedAt: true,
                approvedAt: true,
                rejectedAt: true,
                adminNotes: true,
                rejectionReason: true,
              }
            }
          }
        }
      },
    });

    if (!user) {
      errorResponse(res, "Invalid credentials", 401);
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      errorResponse(res, "Invalid credentials", 401);
      return;
    }

    const token = generateToken({ userId: user.id, role: user.role});
    const tokenExpiry = 24 * 60 * 60; 

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Add application status to the volunteer profile if volunteer
    let userResponse: any = userWithoutPassword;
    if (user.role === 'VOLUNTEER' && user.volunteerProfile?.application) {
      const { application, ...profileWithoutApplication } = user.volunteerProfile;
      userResponse = {
        ...userWithoutPassword,
        volunteerProfile: {
          ...profileWithoutApplication,
          applicationStatus: application.status
        }
      };
    }

    successResponse(res, {
      token,
      tokenExpiry,
      user: userResponse,
    }, "Login successful");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    errorResponse(res, "Error logging in", 500, errorMessage);
  }
};