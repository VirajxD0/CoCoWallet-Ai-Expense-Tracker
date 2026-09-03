import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { env } from '../../config/env';

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
});

/**
 * Auth rate limiter — stricter for login/signup.
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts, please try again later',
  },
});

/**
 * Speed limiter — progressive slowdown after threshold.
 * Starts slowing down after 50 requests, adds 500ms delay per request.
 */
export const speedLimiter = slowDown({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  delayAfter: 50,
  delayMs: (hits) => hits * 500,
});
