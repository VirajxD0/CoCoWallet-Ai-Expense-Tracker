/**
 * AI-specific type definitions.
 */

export interface CategorizeResponse {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface BudgetSuggestion {
  category: string;
  suggestedLimit: number;
  reasoning: string;
  averageMonthlySpend: number;
  basedOnMonths: number;
}

export interface NaturalQueryResponse {
  answer: string;
  data?: unknown;
}
