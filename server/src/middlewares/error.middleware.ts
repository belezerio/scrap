import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';
import { config } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (config.NODE_ENV === 'development') {
    console.error('💥 Express Error Handler:', err);
  }

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    errorResponse(res, 'Validation Error', 400, formattedErrors, 'VALIDATION_ERROR');
    return;
  }

  // Handle Custom Operational AppErrors
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode, undefined, 'OPERATIONAL_ERROR');
    return;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid authentication token', 401, undefined, 'TOKEN_INVALID');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Authentication token expired', 401, undefined, 'TOKEN_EXPIRED');
    return;
  }

  // Default to 500 Internal Server Error
  const message = config.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  errorResponse(res, message, 500, undefined, 'INTERNAL_SERVER_ERROR');
};
