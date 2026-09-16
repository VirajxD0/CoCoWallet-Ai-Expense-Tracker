import { Expense } from '../../common/types';

export interface RecurringExpense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  last_run_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringWithNextRun extends RecurringExpense {
  days_until_next: number;
}

export interface RunResult {
  expense: Expense;
  recurring: RecurringExpense;
}

export interface UpcomingRecurring {
  recurring: RecurringExpense;
  expense_preview: {
    amount: number;
    description: string;
    category: string | null;
    date: string;
  };
}