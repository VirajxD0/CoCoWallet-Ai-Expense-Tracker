import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute, getPool } from '../../config/database';
import { Goal, GoalWithProgress, GoalAllocation, SurplusCalculation } from './goals.types';
import { CreateGoalInput, UpdateGoalInput, AllocateInput, GoalQueryInput } from './goals.schema';
import { NotFoundError } from '../../common/errors';
import logger from '../../config/logger';

export class GoalsRepository {
  async findAll(userId: string, query_: GoalQueryInput): Promise<{ goals: Goal[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, include_completed } = query_;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (!include_completed) {
      conditions.push('is_completed = FALSE');
    }

    const where = conditions.join(' AND ');

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM goals WHERE ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const goals = await query<Goal>(
      `SELECT * FROM goals WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { goals, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, userId: string): Promise<Goal> {
    const goal = await queryOne<Goal>(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!goal) {
      throw new NotFoundError('Goal');
    }

    return goal;
  }

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    const id = uuidv4();

    await insert(
      `INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date, category, icon, color, auto_allocate_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, input.name, input.target_amount, input.current_amount, input.target_date || null, input.category || null, input.icon, input.color, input.auto_allocate_pct]
    );

    return this.findById(id, userId);
  }

  async update(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    await this.findById(id, userId);

    const fields: string[] = [];
    const params: any[] = [];

    if (input.name !== undefined) { fields.push('name = ?'); params.push(input.name); }
    if (input.target_amount !== undefined) { fields.push('target_amount = ?'); params.push(input.target_amount); }
    if (input.current_amount !== undefined) { fields.push('current_amount = ?'); params.push(input.current_amount); }
    if (input.target_date !== undefined) { fields.push('target_date = ?'); params.push(input.target_date); }
    if (input.category !== undefined) { fields.push('category = ?'); params.push(input.category); }
    if (input.icon !== undefined) { fields.push('icon = ?'); params.push(input.icon); }
    if (input.color !== undefined) { fields.push('color = ?'); params.push(input.color); }
    if (input.auto_allocate_pct !== undefined) { fields.push('auto_allocate_pct = ?'); params.push(input.auto_allocate_pct); }
    if (input.is_completed !== undefined) { 
      fields.push('is_completed = ?'); 
      params.push(input.is_completed); 
      if (input.is_completed) {
        fields.push('completed_at = ?');
        params.push(new Date().toISOString().split('T')[0]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    await execute(
      `UPDATE goals SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      [...params, id, userId]
    );

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await execute(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  async getWithProgress(userId: string): Promise<GoalWithProgress[]> {
    const goals = await query<Goal>(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const today = new Date().toISOString().split('T')[0];

    return goals.map(g => {
      const progress = g.target_amount > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0;
      const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
      let daysRemaining: number | null = null;
      let isOverdue = false;

      if (g.target_date) {
        const target = new Date(g.target_date);
        const todayDate = new Date(today);
        const diffTime = target.getTime() - todayDate.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysRemaining < 0 && !g.is_completed;
      }

      return {
        ...g,
        progress_percentage: Math.min(100, progress),
        remaining_amount: remaining,
        days_remaining: daysRemaining,
        is_overdue: isOverdue,
      };
    });
  }

  async allocate(goalId: string, userId: string, amount: number, source: 'manual' | 'auto_surplus' | 'recurring'): Promise<GoalAllocation> {
    const goal = await this.findById(goalId, userId);

    const newAmount = Number(goal.current_amount) + amount;
    const isCompleted = newAmount >= Number(goal.target_amount);

    const fields: string[] = ['current_amount = ?'];
    const params: any[] = [newAmount];

    if (isCompleted && !goal.is_completed) {
      fields.push('is_completed = ?', 'completed_at = ?');
      params.push(true, new Date().toISOString().split('T')[0]);
    }

    await execute(
      `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`,
      [...params, goalId]
    );

    const allocationId = uuidv4();
    await insert(
      'INSERT INTO goal_allocations (id, goal_id, user_id, amount, source) VALUES (?, ?, ?, ?, ?)',
      [allocationId, goalId, userId, amount, source]
    );

    logger.info({ goalId, userId, amount, source, newAmount }, 'Goal allocated');

    return {
      id: allocationId,
      goal_id: goalId,
      user_id: userId,
      amount,
      source,
      allocated_at: new Date().toISOString(),
    };
  }

  async getAllocations(goalId: string, userId: string): Promise<GoalAllocation[]> {
    await this.findById(goalId, userId);
    return query<GoalAllocation>(
      'SELECT * FROM goal_allocations WHERE goal_id = ? AND user_id = ? ORDER BY allocated_at DESC',
      [goalId, userId]
    );
  }

  async calculateSurplus(userId: string, month: string): Promise<SurplusCalculation> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const incomeResult = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND amount > 0 AND date >= ? AND date <= ?`,
      [userId, startDate, endDate]
    );

    const expenseResult = await queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM expenses WHERE user_id = ? AND amount < 0 AND date >= ? AND date <= ?`,
      [userId, startDate, endDate]
    );

    const monthlyIncome = Number(incomeResult?.total) || 0;
    const monthlyExpenses = Number(expenseResult?.total) || 0;
    const surplus = Math.max(0, monthlyIncome - monthlyExpenses);

    const goals = await query<Goal>(
      'SELECT * FROM goals WHERE user_id = ? AND is_completed = FALSE AND auto_allocate_pct > 0',
      [userId]
    );

    const allocations = goals.map(g => ({
      goal_id: g.id,
      amount: Math.round((surplus * Number(g.auto_allocate_pct) / 100) * 100) / 100,
    }));

    return { monthly_income: monthlyIncome, monthly_expenses: monthlyExpenses, surplus, allocations };
  }

  async autoAllocateSurplus(userId: string, month: string): Promise<GoalAllocation[]> {
    const calc = await this.calculateSurplus(userId, month);
    const results: GoalAllocation[] = [];

    for (const a of calc.allocations) {
      if (a.amount > 0) {
        const allocation = await this.allocate(a.goal_id, userId, a.amount, 'auto_surplus');
        results.push(allocation);
      }
    }

    return results;
  }
}

export const goalsRepository = new GoalsRepository();