import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/auth';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from './expenses.schema';
import { z } from 'zod';

const router = Router();

// All expense routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /expenses:
 *   get:
 *     tags: [Expenses]
 *     summary: Get all expenses (paginated, filterable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get('/', validate(expenseQuerySchema, 'query'), expensesController.getAll);

/**
 * @swagger
 * /expenses/stats:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense stats
 */
router.get('/stats', expensesController.stats);

/**
 * @swagger
 * /expenses/categories:
 *   get:
 *     tags: [Expenses]
 *     summary: Get all distinct categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', expensesController.categories);

/**
 * @swagger
 * /expenses/import:
 *   post:
 *     tags: [Expenses]
 *     summary: Bulk import expenses from CSV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenses:
 *                 type: array
 *     responses:
 *       201:
 *         description: Expenses imported
 */
router.post(
  '/import',
  validate(
    z.object({
      expenses: z.array(createExpenseSchema).min(1).max(1000),
    })
  ),
  expensesController.import
);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 */
router.get('/:id', expensesController.getById);

/**
 * @swagger
 * /expenses:
 *   post:
 *     tags: [Expenses]
 *     summary: Create a new expense
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, description]
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Expense created
 */
router.post('/', validate(createExpenseSchema), expensesController.create);

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     tags: [Expenses]
 *     summary: Update an expense
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense updated
 */
router.put('/:id', validate(updateExpenseSchema), expensesController.update);

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     tags: [Expenses]
 *     summary: Delete an expense
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense deleted
 */
router.delete('/:id', expensesController.delete);

export default router;
