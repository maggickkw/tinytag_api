// middlewares/errorMiddleware.ts

import { errorResponse } from "../utils/response";
import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
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

  return errorResponse(res, message, statusCode);
};
