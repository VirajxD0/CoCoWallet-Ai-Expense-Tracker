import { Request, Response } from 'express';
import { goalsService } from './goals.service';
import { sendSuccess, paginateMeta } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import {
  createGoalSchema,
  updateGoalSchema,
  allocateSchema,
  goalQuerySchema,
} from './goals.schema';

export class GoalsController {
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await goalsService.getAll(req.user!.userId, req.query as any);
    res.json({
      status: 'success',
      data: result.goals,
      meta: paginateMeta(result.total, result.page, result.limit),
    });
  });

  getWithProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const goals = await goalsService.getWithProgress(req.user!.userId);
    sendSuccess(res, goals, 200);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const goal = await goalsService.getById(id, req.user!.userId);
    sendSuccess(res, goal, 200);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const goal = await goalsService.create(req.user!.userId, req.body);
    sendSuccess(res, goal, 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const goal = await goalsService.update(id, req.user!.userId, req.body);
    sendSuccess(res, goal, 200);
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await goalsService.delete(id, req.user!.userId);
    sendSuccess(res, { message: 'Goal deleted' }, 200);
  });

  allocate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const allocation = await goalsService.allocate(id, req.user!.userId, req.body);
    sendSuccess(res, allocation, 201);
  });

  getAllocations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const allocations = await goalsService.getAllocations(id, req.user!.userId);
    sendSuccess(res, allocations, 200);
  });

  calculateSurplus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const month = req.query.month as string || new Date().toISOString().slice(0, 7);
    const calc = await goalsService.calculateSurplus(req.user!.userId, month);
    sendSuccess(res, calc, 200);
  });

  autoAllocateSurplus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const month = req.query.month as string || new Date().toISOString().slice(0, 7);
    const allocations = await goalsService.autoAllocateSurplus(req.user!.userId, month);
    sendSuccess(res, allocations, 200);
  });
}

export const goalsController = new GoalsController();