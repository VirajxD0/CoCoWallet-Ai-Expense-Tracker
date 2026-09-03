import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';
import logger from '../../config/logger';

/**
 * Global error handler middleware.
 * Catches all thrown errors and returns consistent JSON responses.
 * In production: never leaks stack traces to clients.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 if not an AppError
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log the error
  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, 'Server error');
  } else {
    logger.warn({ err, req: { method: req.method, url: req.url } }, 'Client error');
  }

  // Build response
  const response: Record<string, unknown> = {
    status: 'error',
    code,
    message: isOperational ? err.message : 'Internal server error',
  };

  // Include validation errors if present
  if (err instanceof AppError && 'errors' in err) {
    response.errors = (err as any).errors;
  }

  // Include stack trace in development only
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
