"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationById = exports.updateApplicationStatus = exports.getPendingVolunteers = exports.registerVolunteer = void 0;
const response_1 = require("../utils/response");
const authService_1 = require("../services/authService");
const prisma_1 = require("../utils/prisma");
const registerVolunteer = async (req, res) => {
    try {
        const { email, password, fullName, dateOfBirth, gender, phoneNumber, address, country = "GH", school, startYear, endYear, degree, nationalId, profilePhotoUrl, idPhotoFrontUrl, idPhotoBackUrl, } = req.body;
        // Basic validation
        if (!email || !password || !fullName || !dateOfBirth || !gender ||
            !phoneNumber || !address) {
            (0, response_1.validationErrorResponse)(res, "Required fields are missing");
            return;
        }
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            (0, response_1.errorResponse)(res, "User with this email already exists", 409);
            return;
        }
        // Create user and volunteer profile in a transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Create user
            const hashedPassword = await (0, authService_1.hashPassword)(password);
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
        (0, response_1.successResponse)(res, {
            user: result.user,
            applicationStatus: result.application.status,
            applicationId: result.application.id,
        }, "Volunteer registration successful. Your application is pending review.", 201);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        (0, response_1.errorResponse)(res, "Error registering volunteer", 500, errorMessage);
    }
};
exports.registerVolunteer = registerVolunteer;
const getPendingVolunteers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'PENDING' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Get pending applications with volunteer profiles
        const applications = await prisma_1.prisma.volunteerApplication.findMany({
            where: {
                status: status,
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
        const total = await prisma_1.prisma.volunteerApplication.count({
            where: {
                status: status,
            },
        });
        const totalPages = Math.ceil(total / Number(limit));
        (0, response_1.successResponse)(res, {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        (0, response_1.errorResponse)(res, "Error fetching pending volunteers", 500, errorMessage);
    }
};
exports.getPendingVolunteers = getPendingVolunteers;
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId, status, adminNotes, rejectionReason } = req.body;
        const adminId = req.user?.userId;
        if (!applicationId || !status) {
            (0, response_1.validationErrorResponse)(res, "Application ID and status are required");
            return;
        }
        if (!adminId) {
            (0, response_1.errorResponse)(res, "Admin authentication required", 401);
            return;
        }
        // Find the application
        const application = await prisma_1.prisma.volunteerApplication.findUnique({
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
            (0, response_1.errorResponse)(res, "Application not found", 404);
            return;
        }
        if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
            (0, response_1.errorResponse)(res, "Application has already been processed", 400);
            return;
        }
        // Update application in a transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const updateData = {
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
            }
            else if (status === 'REJECTED') {
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
        (0, response_1.successResponse)(res, result, message);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        (0, response_1.errorResponse)(res, "Error updating application status", 500, errorMessage);
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma_1.prisma.volunteerApplication.findUnique({
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
            (0, response_1.errorResponse)(res, "Application not found", 404);
            return;
        }
        // Get status history
        const statusHistory = await prisma_1.prisma.applicationStatusHistory.findMany({
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
        (0, response_1.successResponse)(res, {
            application,
            statusHistory,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        (0, response_1.errorResponse)(res, "Error fetching application", 500, errorMessage);
    }
};
exports.getApplicationById = getApplicationById;
