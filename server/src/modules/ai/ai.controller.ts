import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

/**
 * AI controller — handles HTTP request/response for AI routes.
 */
export class AiController {
  /**
   * POST /api/v1/ai/categorize
   */
  categorize = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await aiService.categorize(req.body);
    sendSuccess(res, result, 200);
  });

  /**
   * POST /api/v1/ai/suggest-budgets
   */
  suggestBudgets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await aiService.suggestBudgets(req.user!.userId, req.body);
    sendSuccess(res, result, 200);
  });

  /**
   * POST /api/v1/ai/query
   */
  query = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await aiService.naturalQuery(req.user!.userId, req.body);
    sendSuccess(res, result, 200);
  });
}

export const aiController = new AiController();
