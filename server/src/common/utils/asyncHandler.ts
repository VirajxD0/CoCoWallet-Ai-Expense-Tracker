import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to catch errors and pass them to Express error handler.
 * Eliminates repetitive try/catch blocks in every controller.
 *
 * Usage:
 *   router.get('/expenses', asyncHandler(controller.getAll));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
