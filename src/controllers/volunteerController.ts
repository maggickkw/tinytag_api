import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../utils/response";
import { hashPassword } from "../services/authService";
import { RegisterVolunteerInput, UpdateApplicationStatusInput } from "../types/volunteer.types";
import { prisma } from "../utils/prisma";


export const registerVolunteer = async (
  req: Request<{}, {}, RegisterVolunteerInput>,
  res: Response
): Promise<void> => {
  try {
    const {
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      country = "GH",
      school,
      startYear,
      endYear,
      degree,
      nationalId,
      profilePhotoUrl,
      idPhotoFrontUrl,
      idPhotoBackUrl,
    } = req.body;

    // Basic validation
    if (!email || !password || !fullName || !dateOfBirth || !gender || 
        !phoneNumber || !address) {
      validationErrorResponse(res, "Required fields are missing");
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      errorResponse(res, "User with this email already exists", 409);
      return;
    }

    // Create user and volunteer profile in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "VOLUNTEER",
        },
      });

      // Create volunteer profile
      const volunteerProfile = await tx.volunteerProfile.create({
        data: {
          userId: user.id,
          fullName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          email, // Store in profile as well for easy access
          phoneNumber,
          address,
          country,
          school,
          startYear,
          endYear,
          degree,
          nationalId,
          profilePhotoUrl,
          idPhotoFrontUrl,
          idPhotoBackUrl,
        },
      });

      // Create volunteer application
      const application = await tx.volunteerApplication.create({
        data: {
          volunteerProfileId: volunteerProfile.id,
          status: "PENDING",
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        volunteerProfile,
        application,
      };
    });

    successResponse(
      res,
      {
        user: result.user,
        applicationStatus: result.application.status,
        applicationId: result.application.id,
      },
      "Volunteer registration successful. Your application is pending review.",
      201
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    errorResponse(res, "Error registering volunteer", 500, errorMessage);
  }
};

export const getPendingVolunteers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, status = 'PENDING' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get pending applications with volunteer profiles
    const applications = await prisma.volunteerApplication.findMany({
      where: {
        status: status as any,
      },
      include: {
        volunteerProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    // Get total count for pagination
    const total = await prisma.volunteerApplication.count({
      where: {
        status: status as any,
      },
    });

    const totalPages = Math.ceil(total / Number(limit));

    successResponse(res, {
      applications,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit),
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    errorResponse(res, "Error fetching pending volunteers", 500, errorMessage);
  }
};

export const updateApplicationStatus = async (
  req: Request<{}, {}, UpdateApplicationStatusInput> & { user?: any },
  res: Response
): Promise<void> => {
  try {
    const { applicationId, status, adminNotes, rejectionReason } = req.body;
    const adminId = req.user?.userId;

    if (!applicationId || !status) {
      validationErrorResponse(res, "Application ID and status are required");
      return;
    }

    if (!adminId) {
      errorResponse(res, "Admin authentication required", 401);
      return;
    }

    // Find the application
    const application = await prisma.volunteerApplication.findUnique({
      where: { id: applicationId },
      include: {
        volunteerProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      errorResponse(res, "Application not found", 404);
      return;
    }

    if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
      errorResponse(res, "Application has already been processed", 400);
      return;
    }

    // Update application in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updateData: any = {
        status,
        reviewedAt: new Date(),
        reviewedById: adminId,
        adminNotes,
        updatedAt: new Date(),
      };

      if (status === 'APPROVED') {
        updateData.approvedAt = new Date();
        // Activate the user account
        await tx.user.update({
          where: { id: application.volunteerProfile.userId },
          data: { isActive: true },
        });
      } else if (status === 'REJECTED') {
        updateData.rejectedAt = new Date();
        updateData.rejectedById = adminId;
        updateData.rejectionReason = rejectionReason;
        // Deactivate the user account
        await tx.user.update({
          where: { id: application.volunteerProfile.userId },
          data: { isActive: false },
        });
      }

      const updatedApplication = await tx.volunteerApplication.update({
        where: { id: applicationId },
        data: updateData,
        include: {
          volunteerProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  isActive: true,
                },
              },
            },
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Create status history record
      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: application.status,
          newStatus: status,
          changedById: adminId,
          notes: adminNotes,
        },
      });

      return updatedApplication;
    });

    const message = status === 'APPROVED' 
      ? 'Volunteer application approved successfully'
      : status === 'REJECTED'
      ? 'Volunteer application rejected'
      : 'Application status updated';

    successResponse(res, result, message);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    errorResponse(res, "Error updating application status", 500, errorMessage);
  }
};

export const getApplicationById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await prisma.volunteerApplication.findUnique({
      where: { id },
      include: {
        volunteerProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
          },
        },
        rejectedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      errorResponse(res, "Application not found", 404);
      return;
    }

    // Get status history
    const statusHistory = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: id },
      include: {
        changedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    successResponse(res, {
      application,
      statusHistory,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    errorResponse(res, "Error fetching application", 500, errorMessage);
  }
};