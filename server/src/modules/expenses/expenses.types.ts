import { Expense } from '../../common/types';

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseStatsResponse {
  totalSpent: number;
  totalTransactions: number;
  averagePerTransaction: number;
  topCategories: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}
