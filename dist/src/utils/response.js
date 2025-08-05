"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = "Internal Server Error", statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        status: "error",
        message,
        ...(errors && { errors }),
    });
};
exports.errorResponse = errorResponse;
const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
    });
};
exports.validationErrorResponse = validationErrorResponse;
