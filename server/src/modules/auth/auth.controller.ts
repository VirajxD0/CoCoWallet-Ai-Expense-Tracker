import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

/**
 * Auth controller — handles HTTP request/response for auth routes.
 * Thin layer: parses request, calls service, sends response.
 */
export class AuthController {
  /**
   * POST /api/v1/auth/signup
   */
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.signup(req.body);
    sendSuccess(res, result, 201);
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 200);
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.refreshToken(req.body.refreshToken);
    sendSuccess(res, result, 200);
  });

  /**
   * POST /api/v1/auth/logout (requires auth)
   */
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.logout(req.user!.userId);
    sendSuccess(res, { message: 'Logged out successfully' }, 200);
  });

  /**
   * GET /api/v1/auth/me (requires auth)
   */
  me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, { user: req.user }, 200);
  });

  /**
   * PUT /api/v1/auth/change-password (requires auth)
   */
  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, { message: 'Password changed successfully. Please log in again.' }, 200);
  });
}

export const authController = new AuthController();
