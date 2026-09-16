import { alertsRepository } from './alerts.repository';
import { expensesRepository } from '../expenses/expenses.repository';
import { budgetsRepository } from '../budgets/budgets.repository';
import { goalsRepository } from '../goals/goals.repository';
import { recurringRepository } from '../recurring/recurring.repository';
import { query } from '../../config/database';
import { Alert, AlertType } from './alerts.types';
import { MILESTONE_PERCENTAGES } from './alerts.types';
import logger from '../../config/logger';

export class AlertsService {
  async getAll(userId: string, query: { page?: number; limit?: number; is_read?: boolean; type?: AlertType }) {
    return alertsRepository.findAll(userId, query);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return alertsRepository.getUnreadCount(userId);
  }

  async markRead(id: string, userId: string): Promise<Alert> {
    return alertsRepository.markRead(id, userId);
  }

  async markAllRead(userId: string): Promise<number> {
    return alertsRepository.markAllRead(userId);
  }

  async checkAndCreateAlerts(userId: string): Promise<Alert[]> {
    const newAlerts: Alert[] = [];

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    newAlerts.push(...await this.checkBudgetAlerts(userId, currentMonth));
    newAlerts.push(...await this.checkAnomalyAlerts(userId));
    newAlerts.push(...await this.checkRecurringAlerts(userId));
    newAlerts.push(...await this.checkGoalAlerts(userId));

    return newAlerts;
  }

  private async checkBudgetAlerts(userId: string, month: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const budgets = await budgetsRepository.getBudgetsWithSpending(userId, month);

    for (const b of budgets) {
      const pct = b.percentage;

      if (pct >= 100) {
        const exists = await alertsRepository.exists(userId, 'budget_exceeded', b.id);
        if (!exists) {
          const alert = await alertsRepository.create(userId, 'budget_exceeded',
            `Budget exceeded: ${b.category}`,
            `You've spent ${pct.toFixed(0)}% of your ${b.category} budget (₹${b.spent.toLocaleString()} / ₹${b.monthly_limit.toLocaleString()})`,
            { budgetId: b.id, category: b.category, percentage: pct, spent: b.spent, limit: b.monthly_limit }
          );
          alerts.push(alert);
        }
      } else if (pct >= 80) {
        const exists = await alertsRepository.exists(userId, 'budget_warning', b.id);
        if (!exists) {
          const alert = await alertsRepository.create(userId, 'budget_warning',
            `Budget warning: ${b.category}`,
            `You've used ${pct.toFixed(0)}% of your ${b.category} budget (₹${b.spent.toLocaleString()} / ₹${b.monthly_limit.toLocaleString()})`,
            { budgetId: b.id, category: b.category, percentage: pct, spent: b.spent, limit: b.monthly_limit }
          );
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }

  private async checkAnomalyAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const days = 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const dailyByCategory = await query<{ category: string; date: string; total: number }>(
      `SELECT category, date, SUM(amount) as total 
       FROM expenses WHERE user_id = ? AND date >= ? AND category IS NOT NULL 
       GROUP BY category, date ORDER BY category, date`,
      [userId, startDateStr]
    );

    const byCategory = new Map<string, { daily: number[]; dates: string[] }>();
    dailyByCategory.forEach(d => {
      if (!byCategory.has(d.category)) byCategory.set(d.category, { daily: [], dates: [] });
      const cat = byCategory.get(d.category)!;
      cat.daily.push(Number(d.total));
      cat.dates.push(d.date);
    });

    for (const [category, data] of byCategory.entries()) {
      if (data.daily.length < 7) continue;

      const mean = data.daily.reduce((a, b) => a + b, 0) / data.daily.length;
      const stdDev = Math.sqrt(data.daily.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.daily.length);
      
      if (stdDev === 0) continue;

      const lastDay = data.daily[data.daily.length - 1];
      const zScore = (lastDay - mean) / stdDev;

      if (zScore > 2 && lastDay > mean * 1.5) {
        const exists = await alertsRepository.exists(userId, 'unusual_spending', category);
        if (!exists) {
          const alert = await alertsRepository.create(userId, 'unusual_spending',
            `Unusual spending detected: ${category}`,
            `Yesterday you spent ₹${lastDay.toLocaleString()} on ${category}, which is ${zScore.toFixed(1)} standard deviations above your average of ₹${mean.toLocaleString()}`,
            { category, amount: lastDay, average: mean, zScore, date: data.dates[data.dates.length - 1] }
          );
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }

  private async checkRecurringAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const due = await recurringRepository.findDue(userId);

    for (const r of due) {
      const exists = await alertsRepository.exists(userId, 'recurring_due', r.id);
      if (!exists) {
        const alert = await alertsRepository.create(userId, 'recurring_due',
          `Recurring expense due: ${r.description}`,
          `₹${Number(r.amount).toLocaleString()} for "${r.description}" (${r.category || 'Uncategorized'}) is due today`,
          { recurringId: r.id, amount: r.amount, description: r.description, category: r.category, nextRunDate: r.next_run_date }
        );
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private async checkGoalAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const goals = await goalsRepository.getWithProgress(userId);

    for (const g of goals) {
      if (g.is_completed) {
        const exists = await alertsRepository.exists(userId, 'goal_completed', g.id);
        if (!exists) {
          const alert = await alertsRepository.create(userId, 'goal_completed',
            `Goal completed: ${g.name}!`,
            `Congratulations! You've reached your target of ₹${Number(g.target_amount).toLocaleString()} for "${g.name}"`,
            { goalId: g.id, name: g.name, targetAmount: g.target_amount, currentAmount: g.current_amount }
          );
          alerts.push(alert);
        }
      } else {
        for (const pct of MILESTONE_PERCENTAGES) {
          if (g.progress_percentage >= pct) {
            const milestoneKey = `goal_${pct}`;
            const exists = await alertsRepository.exists(userId, 'goal_milestone', `${g.id}_${pct}`);
            if (!exists) {
              const alert = await alertsRepository.create(userId, 'goal_milestone',
                `Goal milestone: ${g.name} (${pct}%)`,
                `You're ${pct}% towards your goal of ₹${Number(g.target_amount).toLocaleString()} (₹${Number(g.current_amount).toLocaleString()} saved)`,
                { goalId: g.id, name: g.name, milestone: pct, progress: g.progress_percentage }
              );
              alerts.push(alert);
            }
          }
        }
      }
    }

    return alerts;
  }
}

export const alertsService = new AlertsService();