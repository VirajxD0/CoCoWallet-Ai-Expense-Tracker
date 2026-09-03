import { Router } from 'express';
import { aiController } from './ai.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import { categorizeSchema, suggestBudgetsSchema, naturalQuerySchema } from './ai.schema';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /ai/categorize:
 *   post:
 *     tags: [AI]
 *     summary: Categorize an expense using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Category suggestion
 */
router.post('/categorize', validate(categorizeSchema), aiController.categorize);

/**
 * @swagger
 * /ai/suggest-budgets:
 *   post:
 *     tags: [AI]
 *     summary: Get AI budget suggestions based on past spending
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               months:
 *                 type: integer
 *                 default: 3
 *     responses:
 *       200:
 *         description: Budget suggestions
 */
router.post('/suggest-budgets', validate(suggestBudgetsSchema), aiController.suggestBudgets);

/**
 * @swagger
 * /ai/query:
 *   post:
 *     tags: [AI]
 *     summary: Ask a natural language question about your expenses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/query', validate(naturalQuerySchema), aiController.query);

export default router;
