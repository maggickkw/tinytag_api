// middleware/auth.ts (you may need to create this)
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService";
import { errorResponse } from "../utils/response";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    errorResponse(res, "Access token required", 401);
    return;
  }

  try {
    const decoded = verifyToken(token) as any;

    console.log(decoded);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    errorResponse(res, "Invalid or expired token", 403);
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    errorResponse(res, "Authentication required", 401);
    return;
  }

  if (req.user.role !== "ADMIN") {
    errorResponse(res, "Admin access required", 403);
    return;
  }

  next();
};
