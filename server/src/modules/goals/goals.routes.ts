import { Router } from 'express';
import { goalsController } from './goals.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import {
  createGoalSchema,
  updateGoalSchema,
  allocateSchema,
  goalQuerySchema,
} from './goals.schema';

const router = Router();

router.use(authenticate);

router.get('/', validate(goalQuerySchema, 'query'), goalsController.getAll);
router.get('/with-progress', goalsController.getWithProgress);
router.get('/surplus', goalsController.calculateSurplus);
router.post('/auto-allocate', goalsController.autoAllocateSurplus);
router.get('/:id', goalsController.getById);
router.post('/', validate(createGoalSchema), goalsController.create);
router.put('/:id', validate(updateGoalSchema), goalsController.update);
router.delete('/:id', goalsController.delete);
router.post('/:id/allocate', validate(allocateSchema), goalsController.allocate);
router.get('/:id/allocations', goalsController.getAllocations);

export default router;