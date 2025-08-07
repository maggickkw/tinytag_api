"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const response_1 = require("../utils/response");
const authService_1 = require("../services/authService");
const prisma_1 = require("../utils/prisma");
const login = async (req, res) => {
    console.log("PAINNNNNN");
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, response_1.validationErrorResponse)(res, "Username and password are required!");
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
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
            (0, response_1.errorResponse)(res, "Invalid credentials", 401);
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            (0, response_1.errorResponse)(res, "Invalid credentials", 401);
            return;
        }
        const token = (0, authService_1.generateToken)({ userId: user.id, role: user.role });
        const tokenExpiry = 24 * 60 * 60;
        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        // Add application status to the volunteer profile if volunteer
        let userResponse = userWithoutPassword;
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
        (0, response_1.successResponse)(res, {
            token,
            tokenExpiry,
            user: userResponse,
        }, "Login successful");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        (0, response_1.errorResponse)(res, "Error logging in", 500, errorMessage);
    }
};
exports.login = login;
