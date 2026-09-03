import { z } from 'zod';

/**
 * Budgets validation schemas.
 */
export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
  monthly_limit: z.number().positive('Limit must be positive').max(99999999.99),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
});

export const updateBudgetSchema = z.object({
  monthly_limit: z.number().positive('Limit must be positive').max(99999999.99).optional(),
});

export const budgetQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetQueryInput = z.infer<typeof budgetQuerySchema>;
