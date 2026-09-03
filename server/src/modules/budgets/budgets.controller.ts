import { Request, Response } from 'express';
import { budgetsService } from './budgets.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

/**
 * Budgets controller — handles HTTP request/response for budget routes.
 */
export class BudgetsController {
  /**
   * GET /api/v1/budgets
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const budgets = await budgetsService.getAll(req.user!.userId, req.query as any);
    sendSuccess(res, budgets, 200);
  });

  /**
   * GET /api/v1/budgets/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const budget = await budgetsService.getById(id, req.user!.userId);
    sendSuccess(res, budget, 200);
  });

  /**
   * POST /api/v1/budgets
   */
  upsert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const budget = await budgetsService.upsert(req.user!.userId, req.body);
    sendSuccess(res, budget, 201);
  });

  /**
   * PUT /api/v1/budgets/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const budget = await budgetsService.update(id, req.user!.userId, req.body);
    sendSuccess(res, budget, 200);
  });

  /**
   * DELETE /api/v1/budgets/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await budgetsService.delete(id, req.user!.userId);
    sendSuccess(res, { message: 'Budget deleted' }, 200);
  });

  /**
   * GET /api/v1/budgets/spending/:month
   */
  getSpending = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const month = req.params.month as string;
    const result = await budgetsService.getBudgetsWithSpending(
      req.user!.userId,
      month
    );
    sendSuccess(res, result, 200);
  });
}

export const budgetsController = new BudgetsController();
