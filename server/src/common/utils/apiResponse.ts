import { Response } from 'express';

/**
 * Standard API response format.
 * Used across all controllers for consistent responses.
 */

interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  meta?: PaginatedMeta;
}

/**
 * Send a success response.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
  };
  res.status(statusCode).json(response);
}



/**
 * Send a success response with pagination metadata.
 */
export function sendPaginatedSuccess<T>(
  res: Response,
  data: T[],
  meta: PaginatedMeta
): void {
  const response: ApiResponse<T[]> = {
    status: 'success',
    data,
    meta,
  };
  res.status(200).json(response);
}

/**
 * Send a success response with a message (e.g., for DELETE).
 */
export function sendSuccessMessage(res: Response, message: string, statusCode: number = 200): void {
  const response: ApiResponse = {
    status: 'success',
    message,
  };
  res.status(statusCode).json(response);
}

/**
 * Calculate pagination metadata.
 */
export function paginateMeta(total: number, page: number, limit: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
