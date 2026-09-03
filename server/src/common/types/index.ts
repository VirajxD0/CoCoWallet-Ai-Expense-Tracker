/**
 * Shared type definitions.
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string | null;
  receipt_url: string | null;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  month: string;
  created_at: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface AiCategorizeResponse {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface AiBudgetSuggestion {
  category: string;
  suggestedLimit: number;
  reasoning: string;
  basedOnMonths: number;
}

export interface AiQueryResponse {
  answer: string;
  data?: unknown;
}
