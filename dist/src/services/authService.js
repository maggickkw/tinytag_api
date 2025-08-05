"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = exports.createUser = exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, 12);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateToken = ({ userId, role }) => {
    const secret = process.env.JWT_SECRET;
    const rawExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const expiresIn = /^\d+$/.test(rawExpiry)
        ? parseInt(rawExpiry, 10) // interpret as seconds
        : rawExpiry; // interpret as string (e.g., '7d', '24h')
    const payload = { userId, role };
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
};
exports.verifyToken = verifyToken;
const createUser = async (userData) => {
    const hashedPassword = await (0, exports.hashPassword)(userData.password);
    return await prisma.user.create({
        data: {
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });
};
exports.createUser = createUser;
const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            volunteerProfile: {
                include: {
                    application: true
                }
            }
        }
    });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            volunteerProfile: {
                include: {
                    application: true
                }
            }
        }
    });
};
exports.findUserById = findUserById;
