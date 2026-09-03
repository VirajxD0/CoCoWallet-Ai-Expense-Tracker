import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute } from '../../config/database';
import { Budget } from '../../common/types';
import { CreateBudgetInput, UpdateBudgetInput, BudgetQueryInput } from './budgets.schema';
import { BudgetWithSpending } from './budgets.types';
import { NotFoundError } from '../../common/errors';
import logger from '../../config/logger';

/**
 * Budgets repository — handles all MySQL database operations for budgets.
 */
export class BudgetsRepository {
  /**
   * Find all budgets for a user, optionally filtered by month.
   */
  async findAll(userId: string, query_: BudgetQueryInput): Promise<Budget[]> {
    let sql = 'SELECT * FROM budgets WHERE user_id = ?';
    const params: any[] = [userId];

    if (query_.month) {
      sql += ' AND month = ?';
      params.push(query_.month);
    }

    sql += ' ORDER BY category ASC';

    return query<Budget>(sql, params);
  }

  /**
   * Find a single budget by ID and user ID.
   */
  async findById(id: string, userId: string): Promise<Budget> {
    const budget = await queryOne<Budget>(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!budget) {
      throw new NotFoundError('Budget');
    }

    return budget;
  }

  /**
   * Create or update a budget (upsert by user_id + category + month).
   */
  async upsert(userId: string, input: CreateBudgetInput): Promise<Budget> {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ?',
      [userId, input.category, input.month]
    );

    if (existing) {
      await execute(
        'UPDATE budgets SET monthly_limit = ? WHERE id = ?',
        [input.monthly_limit, existing.id]
      );
      return this.findById(existing.id, userId);
    }

    const id = uuidv4();
    await insert(
      'INSERT INTO budgets (id, user_id, category, monthly_limit, month) VALUES (?, ?, ?, ?, ?)',
      [id, userId, input.category, input.monthly_limit, input.month]
    );

    return this.findById(id, userId);
  }

  /**
   * Update a budget's limit.
   */
  async update(id: string, userId: string, input: UpdateBudgetInput): Promise<Budget> {
    await this.findById(id, userId);

    if (input.monthly_limit !== undefined) {
      await execute(
        'UPDATE budgets SET monthly_limit = ? WHERE id = ? AND user_id = ?',
        [input.monthly_limit, id, userId]
      );
    }

    return this.findById(id, userId);
  }

  /**
   * Delete a budget.
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  /**
   * Get budgets with spending data for a given month.
   */
  async getBudgetsWithSpending(userId: string, month: string): Promise<BudgetWithSpending[]> {
    // Get budgets for the month
    const budgets = await query<Budget>(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ?',
      [userId, month]
    );

    if (!budgets.length) {
      return [];
    }

    // Get spending for each category in that month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const expenses = await query<{ category: string; amount: number }>(
      `SELECT category, amount FROM expenses
       WHERE user_id = ? AND date >= ? AND date <= ? AND category IS NOT NULL`,
      [userId, startDate, endDate]
    );

    // Calculate spending per category
    const spendingMap = new Map<string, number>();
    expenses.forEach((e) => {
      const cat = e.category;
      spendingMap.set(cat, (spendingMap.get(cat) || 0) + Number(e.amount));
    });

    // Combine budgets with spending
    return budgets.map((budget) => {
      const spent = spendingMap.get(budget.category) || 0;
      const remaining = Number(budget.monthly_limit) - spent;
      const percentage = Number(budget.monthly_limit) > 0
        ? (spent / Number(budget.monthly_limit)) * 100
        : 0;

      let status: 'under' | 'warning' | 'over' = 'under';
      if (percentage >= 100) status = 'over';
      else if (percentage >= 80) status = 'warning';

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        status,
      };
    });
  }
}

export const budgetsRepository = new BudgetsRepository();
