import { z } from 'zod';

/**
 * Expenses validation schemas.
 */
export const createExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(99999999.99, 'Amount too large'),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  receipt_url: z.string().url('Invalid URL').optional(),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(99999999.99).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  receipt_url: z.string().url().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['date', 'amount', 'created_at']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
