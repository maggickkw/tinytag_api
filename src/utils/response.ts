import { Response } from "express";

type ErrorDetail = Record<string, any> | string | null;
type Data = Record<string, any> | any[] | null;

const successResponse = (
  res: Response,
  data: Data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

const errorResponse = (
  res: Response,
  message = "Internal Server Error",
  statusCode = 500,
  errors: ErrorDetail = null
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }),
  });
};

const validationErrorResponse = (res: Response, errors: ErrorDetail) => {
  return res.status(400).json({
    status: "error",
    message: "Validation failed",
    errors,
  });
};

export { successResponse, errorResponse, validationErrorResponse };
