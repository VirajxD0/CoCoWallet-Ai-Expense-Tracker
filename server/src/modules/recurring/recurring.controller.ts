import { Request, Response } from 'express';
import { recurringService } from './recurring.service';
import { sendSuccess, paginateMeta } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import {
  createRecurringSchema,
  updateRecurringSchema,
  recurringQuerySchema,
} from './recurring.schema';
import { z } from 'zod';

export class RecurringController {
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await recurringService.getAll(req.user!.userId, req.query as any);
    res.json({
      status: 'success',
      data: result.recurring,
      meta: paginateMeta(result.total, result.page, result.limit),
    });
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const recurring = await recurringService.getById(id, req.user!.userId);
    sendSuccess(res, recurring, 200);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const recurring = await recurringService.create(req.user!.userId, req.body);
    sendSuccess(res, recurring, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const recurring = await recurringService.update(id, req.user!.userId, req.body);
    sendSuccess(res, recurring, 200);
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await recurringService.delete(id, req.user!.userId);
    sendSuccess(res, { message: 'Recurring expense deleted' }, 200);
  });

  runOne = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const result = await recurringService.runOne(id, req.user!.userId);
    sendSuccess(res, result, 200);
  });

  getUpcoming = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const upcoming = await recurringService.getUpcoming(req.user!.userId, days);
    sendSuccess(res, upcoming, 200);
  });

  getWithNextRun = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const recurring = await recurringService.getWithNextRun(req.user!.userId);
    sendSuccess(res, recurring, 200);
  });
}

export const recurringController = new RecurringController();