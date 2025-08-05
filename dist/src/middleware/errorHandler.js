"use strict";
// middlewares/errorMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const response_1 = require("../utils/response");
const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    // Prisma errors
    if (err.code === "P2002") {
        statusCode = 400;
        message = "Duplicate field value entered";
    }
    if (err.code === "P2025") {
        statusCode = 404;
        message = "Record not found";
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File size too large";
    }
    console.error("Error:", err);
    return (0, response_1.errorResponse)(res, message, statusCode);
};
exports.errorHandler = errorHandler;
