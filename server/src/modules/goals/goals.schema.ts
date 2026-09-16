import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  target_amount: z.number().positive('Target must be positive').max(999999999.99),
  current_amount: z.number().min(0).max(999999999.99).default(0),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  category: z.string().max(100).optional(),
  icon: z.string().max(50).default('target'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  auto_allocate_pct: z.number().min(0).max(100).default(0),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target_amount: z.number().positive().max(999999999.99).optional(),
  current_amount: z.number().min(0).max(999999999.99).optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  category: z.string().max(100).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  auto_allocate_pct: z.number().min(0).max(100).optional(),
  is_completed: z.boolean().optional(),
});

export const allocateSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(999999999.99),
  source: z.enum(['manual', 'auto_surplus', 'recurring']).default('manual'),
});

export const goalQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  include_completed: z.coerce.boolean().default(false),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type AllocateInput = z.infer<typeof allocateSchema>;
export type GoalQueryInput = z.infer<typeof goalQuerySchema>;