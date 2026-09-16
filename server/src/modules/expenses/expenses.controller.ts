import { Request, Response } from 'express';
import { expensesService } from './expenses.service';
import { alertsService } from '../alerts/alerts.service';
import { sendSuccess, paginateMeta } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

/**
 * Expenses controller — handles HTTP request/response for expense routes.
 */
export class ExpensesController {
  /**
   * GET /api/v1/expenses
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await expensesService.getAll(req.user!.userId, req.query as any);
    // Attach pagination meta
    res.json({
      status: 'success',
      data: result.expenses,
      meta: paginateMeta(result.total, result.page, result.limit),
    });
  });

  /**
   * GET /api/v1/expenses/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const expense = await expensesService.getById(id, req.user!.userId);
    sendSuccess(res, expense, 200);
  });

  /**
   * POST /api/v1/expenses
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const expense = await expensesService.create(req.user!.userId, req.body);
    // fire-and-forget budget/anomaly alerts so Health-type overspend shows immediately
    alertsService.checkAndCreateAlerts(req.user!.userId).catch(() => {});
    sendSuccess(res, expense, 201);
  });

  /**
   * PUT /api/v1/expenses/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const expense = await expensesService.update(id, req.user!.userId, req.body);
    alertsService.checkAndCreateAlerts(req.user!.userId).catch(() => {});
    sendSuccess(res, expense, 200);
  });

  /**
   * DELETE /api/v1/expenses/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await expensesService.delete(id, req.user!.userId);
    alertsService.checkAndCreateAlerts(req.user!.userId).catch(() => {});
    sendSuccess(res, { message: 'Expense deleted' }, 200);
  });

  /**
   * POST /api/v1/expenses/import
   */
  import = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await expensesService.bulkImport(req.user!.userId, req.body.expenses);
    alertsService.checkAndCreateAlerts(req.user!.userId).catch(() => {});
    sendSuccess(res, result, 201);
  });

  /**
   * GET /api/v1/expenses/stats
   */
  stats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await expensesService.getStats(req.user!.userId, startDate, endDate);
    sendSuccess(res, result, 200);
  });

  /**
   * GET /api/v1/expenses/categories
   */
  categories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categories = await expensesService.getCategories(req.user!.userId);
    sendSuccess(res, categories, 200);
  });
}

export const expensesController = new ExpensesController();
