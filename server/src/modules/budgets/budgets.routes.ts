import { Router } from 'express';
import { budgetsController } from './budgets.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import { createBudgetSchema, updateBudgetSchema, budgetQuerySchema } from './budgets.schema';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Get all budgets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get('/', validate(budgetQuerySchema, 'query'), budgetsController.getAll);

/**
 * @swagger
 * /budgets/spending/{month}:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budgets with actual spending for a month
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-01
 *     responses:
 *       200:
 *         description: Budgets with spending data
 */
router.get('/spending/:month', budgetsController.getSpending);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget by ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget details
 */
router.get('/:id', budgetsController.getById);

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Create or update a budget (upsert)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, monthly_limit, month]
 *             properties:
 *               category:
 *                 type: string
 *               monthly_limit:
 *                 type: number
 *               month:
 *                 type: string
 *                 example: 2026-01
 *     responses:
 *       201:
 *         description: Budget created/updated
 */
router.post('/', validate(createBudgetSchema), budgetsController.upsert);

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Update budget limit
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget updated
 */
router.put('/:id', validate(updateBudgetSchema), budgetsController.update);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete a budget
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget deleted
 */
router.delete('/:id', budgetsController.delete);

export default router;
