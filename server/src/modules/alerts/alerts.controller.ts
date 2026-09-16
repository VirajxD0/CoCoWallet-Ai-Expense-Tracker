import { Request, Response } from 'express';
import { alertsService } from './alerts.service';
import { sendSuccess, paginateMeta } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { z } from 'zod';

const alertQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_read: z.coerce.boolean().optional(),
  type: z.enum(['budget_warning', 'budget_exceeded', 'unusual_spending', 'recurring_due', 'goal_milestone', 'goal_completed']).optional(),
});

export class AlertsController {
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await alertsService.getAll(req.user!.userId, req.query as any);
    res.json({
      status: 'success',
      data: result.alerts,
      meta: paginateMeta(result.total, req.query.page ? parseInt(req.query.page as string) : 1, req.query.limit ? parseInt(req.query.limit as string) : 20),
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // auto-create budget/recurring/goal alerts so bell is never stale — user saw Health 1425% without alert
    try { await alertsService.checkAndCreateAlerts(req.user!.userId); } catch {}
    const count = await alertsService.getUnreadCount(req.user!.userId);
    sendSuccess(res, { count }, 200);
  });

  markRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const alert = await alertsService.markRead(id, req.user!.userId);
    sendSuccess(res, alert, 200);
  });

  markAllRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const count = await alertsService.markAllRead(req.user!.userId);
    sendSuccess(res, { count }, 200);
  });

  check = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const alerts = await alertsService.checkAndCreateAlerts(req.user!.userId);
    sendSuccess(res, { created: alerts.length, alerts }, 200);
  });
}

export const alertsController = new AlertsController();