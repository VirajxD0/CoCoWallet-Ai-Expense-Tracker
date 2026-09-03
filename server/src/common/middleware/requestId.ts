import { Request, Response, NextFunction } from 'express';
import rTracer from 'cls-rtracer';

/**
 * Request ID middleware.
 * Attaches a unique ID to each request for tracing across logs.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  rTracer.expressMiddleware()(req, res, next);
}
