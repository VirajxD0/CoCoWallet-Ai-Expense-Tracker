export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  icon: string;
  color: string;
  auto_allocate_pct: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  progress_percentage: number;
  remaining_amount: number;
  days_remaining: number | null;
  is_overdue: boolean;
}

export interface GoalAllocation {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  source: 'manual' | 'auto_surplus' | 'recurring';
  allocated_at: string;
}

export interface SurplusCalculation {
  monthly_income: number;
  monthly_expenses: number;
  surplus: number;
  allocations: { goal_id: string; amount: number }[];
}