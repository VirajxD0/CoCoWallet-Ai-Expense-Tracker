import { z } from 'zod';

export const createRecurringSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(99999999.99),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().max(100).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRecurringSchema = z.object({
  amount: z.number().positive().max(99999999.99).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().max(100).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  is_active: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const recurringQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_active: z.coerce.boolean().optional(),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
export type RecurringQueryInput = z.infer<typeof recurringQuerySchema>;