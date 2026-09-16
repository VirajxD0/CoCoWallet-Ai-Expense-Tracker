import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const alertQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_read: z.coerce.boolean().optional(),
  type: z.enum(['budget_warning', 'budget_exceeded', 'unusual_spending', 'recurring_due', 'goal_milestone', 'goal_completed']).optional(),
});

router.get('/', validate(alertQuerySchema, 'query'), alertsController.getAll);
router.get('/unread-count', alertsController.getUnreadCount);
router.put('/read-all', alertsController.markAllRead);
router.post('/check', alertsController.check);
router.put('/:id/read', alertsController.markRead);

export default router;