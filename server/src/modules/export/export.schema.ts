import { z } from 'zod';

export const exportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  includeExpenses: z.coerce.boolean().default(true),
  includeBudgets: z.coerce.boolean().default(true),
  includeRecurring: z.coerce.boolean().default(true),
  includeGoals: z.coerce.boolean().default(true),
  includeAllocations: z.coerce.boolean().default(true),
});

export const importSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  skipExisting: z.coerce.boolean().default(true),
});

export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
export type ImportInput = z.infer<typeof importSchema>;