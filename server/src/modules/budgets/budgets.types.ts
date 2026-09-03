import { Budget } from '../../common/types';

export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'warning' | 'over';
}
