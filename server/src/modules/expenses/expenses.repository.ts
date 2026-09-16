import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute, getPool } from '../../config/database';
import { Expense } from '../../common/types';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryInput } from './expenses.schema';
import { ExpenseListResponse } from './expenses.types';
import { NotFoundError } from '../../common/errors';
import logger from '../../config/logger';

/**
 * Expenses repository — handles all MySQL database operations.
 */
export class ExpensesRepository {
  /**
   * Find all expenses for a user with pagination, search, and filters.
   */
  async findAll(userId: string, query_: ExpenseQueryInput): Promise<ExpenseListResponse> {
    const { page, limit, search, category, startDate, endDate, sortBy, sortOrder } = query_;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause dynamically
    const conditions: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (search) {
      conditions.push('(description LIKE ? OR category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (startDate) {
      conditions.push('date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('date <= ?');
      params.push(endDate);
    }

    const where = conditions.join(' AND ');
    const allowedSorts = ['date', 'amount', 'created_at'];
    const sortColumn = allowedSorts.includes(sortBy) ? sortBy : 'date';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Count total
    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM expenses WHERE ${where}`,
      params
    );
    const total = countResult?.total || 0;

    // Fetch expenses
    const expenses = await query<Expense>(
      `SELECT * FROM expenses WHERE ${where} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return {
      expenses,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Find a single expense by ID and user ID.
   */
  async findById(id: string, userId: string): Promise<Expense> {
    const expense = await queryOne<Expense>(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    return expense;
  }

  /**
   * Create a new expense.
   */
  async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    const id = uuidv4();
    const date = input.date || new Date().toISOString().split('T')[0];

    await insert(
      `INSERT INTO expenses (id, user_id, amount, description, category, date, receipt_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, input.amount, input.description, input.category || null, date, input.receipt_url || null]
    );

    return this.findById(id, userId);
  }

  /**
   * Update an existing expense.
   */
  async update(id: string, userId: string, input: UpdateExpenseInput): Promise<Expense> {
    await this.findById(id, userId);

    const fields: string[] = [];
    const params: any[] = [];

    if (input.amount !== undefined) { fields.push('amount = ?'); params.push(input.amount); }
    if (input.description !== undefined) { fields.push('description = ?'); params.push(input.description); }
    if (input.category !== undefined) { fields.push('category = ?'); params.push(input.category); }
    if (input.date !== undefined) { fields.push('date = ?'); params.push(input.date); }
    if (input.receipt_url !== undefined) { fields.push('receipt_url = ?'); params.push(input.receipt_url); }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    await execute(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      [...params, id, userId]
    );

    return this.findById(id, userId);
  }

  /**
   * Delete an expense.
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  /**
   * Bulk create expenses (for CSV import).
   */
  async bulkCreate(userId: string, expenses: CreateExpenseInput[]): Promise<number> {
    if (!expenses.length) return 0;

    const values = expenses.map((input) => [
      uuidv4(),
      userId,
      input.amount,
      input.description,
      input.category || null,
      input.date || new Date().toISOString().split('T')[0],
      input.receipt_url || null,
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flat = values.flat();

    const [result] = await getPool().query(
      `INSERT INTO expenses (id, user_id, amount, description, category, date, receipt_url) VALUES ${placeholders}`,
      flat
    ) as any;

    return result.affectedRows;
  }

  /**
   * Get expense stats for a user.
   */
  async getStats(userId: string, startDate?: string, endDate?: string) {
    const conditions: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (startDate) { conditions.push('date >= ?'); params.push(startDate); }
    if (endDate) { conditions.push('date <= ?'); params.push(endDate); }

    const where = conditions.join(' AND ');

    const stats = await queryOne<{ totalSpent: number; totalTransactions: number }>(
      `SELECT COALESCE(SUM(amount), 0) as totalSpent, COUNT(*) as totalTransactions
       FROM expenses WHERE ${where}`,
      params
    );

    const topCategories = await query<{ category: string; total: number; count: number }>(
      `SELECT COALESCE(category, 'Uncategorized') as category, SUM(amount) as total, COUNT(*) as count
       FROM expenses WHERE ${where}
       GROUP BY category
       ORDER BY total DESC
       LIMIT 10`,
      params
    );

    return {
      totalSpent: Number(stats?.totalSpent) || 0,
      totalTransactions: stats?.totalTransactions || 0,
      averagePerTransaction: stats?.totalTransactions
        ? (Number(stats.totalSpent) / stats.totalTransactions)
        : 0,
      topCategories,
    };
  }

  /**
   * Get distinct categories for a user.
   */
  async getCategories(userId: string): Promise<string[]> {
    const rows = await query<{ category: string }>(
      'SELECT DISTINCT category FROM expenses WHERE user_id = ? AND category IS NOT NULL ORDER BY category',
      [userId]
    );
    return rows.map((r) => r.category);
  }
}

export const expensesRepository = new ExpensesRepository();
