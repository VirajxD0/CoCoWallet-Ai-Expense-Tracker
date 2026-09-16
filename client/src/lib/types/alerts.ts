export type AlertType = 
  | 'budget_warning'
  | 'budget_exceeded'
  | 'unusual_spending'
  | 'recurring_due'
  | 'goal_milestone'
  | 'goal_completed';

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  is_read: boolean;
  triggered_at: string;
  read_at: string | null;
}

export const ALERT_TYPES: Record<AlertType, { icon: string; color: string; label: string }> = {
  budget_warning: { icon: 'AlertTriangle', color: 'text-amber-500', label: 'Budget Warning' },
  budget_exceeded: { icon: 'AlertCircle', color: 'text-destructive', label: 'Budget Exceeded' },
  unusual_spending: { icon: 'TrendingUp', color: 'text-orange-500', label: 'Unusual Spending' },
  recurring_due: { icon: 'Repeat', color: 'text-blue-500', label: 'Recurring Due' },
  goal_milestone: { icon: 'Target', color: 'text-emerald-500', label: 'Goal Milestone' },
  goal_completed: { icon: 'CheckCircle', color: 'text-emerald-600', label: 'Goal Completed' },
};