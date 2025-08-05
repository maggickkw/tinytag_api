"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
const response_1 = require("../utils/response");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
        (0, response_1.errorResponse)(res, "Access token required", 401);
        return;
    }
    try {
        const decoded = (0, authService_1.verifyToken)(token);
        console.log(decoded);
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        (0, response_1.errorResponse)(res, "Invalid or expired token", 403);
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        (0, response_1.errorResponse)(res, "Authentication required", 401);
        return;
    }
    if (req.user.role !== "ADMIN") {
        (0, response_1.errorResponse)(res, "Admin access required", 403);
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
