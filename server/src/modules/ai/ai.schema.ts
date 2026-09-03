import { z } from 'zod';

/**
 * AI validation schemas.
 */
export const categorizeSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive().optional(),
});

export const suggestBudgetsSchema = z.object({
  months: z.number().int().min(1).max(12).default(3),
});

export const naturalQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500),
});

export type CategorizeInput = z.infer<typeof categorizeSchema>;
export type SuggestBudgetsInput = z.infer<typeof suggestBudgetsSchema>;
export type NaturalQueryInput = z.infer<typeof naturalQuerySchema>;
