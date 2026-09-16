import { Router } from 'express';
import { recurringController } from './recurring.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import {
  createRecurringSchema,
  updateRecurringSchema,
  recurringQuerySchema,
} from './recurring.schema';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get('/', validate(recurringQuerySchema, 'query'), recurringController.getAll);
router.get('/upcoming', recurringController.getUpcoming);
router.get('/with-next-run', recurringController.getWithNextRun);
router.get('/:id', recurringController.getById);
router.post('/', validate(createRecurringSchema), recurringController.create);
router.put('/:id', validate(updateRecurringSchema), recurringController.update);
router.delete('/:id', recurringController.delete);
router.post('/:id/run', recurringController.runOne);

export default router;