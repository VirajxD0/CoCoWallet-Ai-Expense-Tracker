import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute, getPool } from '../../config/database';
import { RecurringExpense, RecurringWithNextRun, UpcomingRecurring } from './recurring.types';
import { CreateRecurringInput, UpdateRecurringInput, RecurringQueryInput } from './recurring.schema';
import { NotFoundError } from '../../common/errors';
import logger from '../../config/logger';

export class RecurringRepository {
  async findAll(userId: string, query_: RecurringQueryInput): Promise<{ recurring: RecurringExpense[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, is_active } = query_;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(is_active);
    }

    const where = conditions.join(' AND ');

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM recurring_expenses WHERE ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const recurring = await query<RecurringExpense>(
      `SELECT * FROM recurring_expenses WHERE ${where} ORDER BY next_run_date ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { recurring, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, userId: string): Promise<RecurringExpense> {
    const recurring = await queryOne<RecurringExpense>(
      'SELECT * FROM recurring_expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!recurring) {
      throw new NotFoundError('Recurring expense');
    }

    return recurring;
  }

  async create(userId: string, input: CreateRecurringInput): Promise<RecurringExpense> {
    const id = uuidv4();

    await insert(
      `INSERT INTO recurring_expenses (id, user_id, amount, description, category, frequency, start_date, end_date, next_run_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, input.amount, input.description, input.category || null, input.frequency, input.start_date, input.end_date || null, input.start_date, input.notes || null]
    );

    return this.findById(id, userId);
  }

  async update(id: string, userId: string, input: UpdateRecurringInput): Promise<RecurringExpense> {
    await this.findById(id, userId);

    const fields: string[] = [];
    const params: any[] = [];

    if (input.amount !== undefined) { fields.push('amount = ?'); params.push(input.amount); }
    if (input.description !== undefined) { fields.push('description = ?'); params.push(input.description); }
    if (input.category !== undefined) { fields.push('category = ?'); params.push(input.category); }
    if (input.frequency !== undefined) { fields.push('frequency = ?'); params.push(input.frequency); }
    if (input.start_date !== undefined) { fields.push('start_date = ?'); params.push(input.start_date); }
    if (input.end_date !== undefined) { fields.push('end_date = ?'); params.push(input.end_date); }
    if (input.is_active !== undefined) { fields.push('is_active = ?'); params.push(input.is_active); }
    if (input.notes !== undefined) { fields.push('notes = ?'); params.push(input.notes); }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    await execute(
      `UPDATE recurring_expenses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      [...params, id, userId]
    );

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await execute(
      'DELETE FROM recurring_expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  async findDue(userId: string): Promise<RecurringExpense[]> {
    const today = new Date().toISOString().split('T')[0];
    return query<RecurringExpense>(
      `SELECT * FROM recurring_expenses 
       WHERE user_id = ? AND is_active = TRUE AND next_run_date <= ? 
       AND (end_date IS NULL OR end_date >= ?)`,
      [userId, today, today]
    );
  }

  async updateNextRun(id: string, nextRunDate: string, lastRunDate: string): Promise<void> {
    await execute(
      'UPDATE recurring_expenses SET next_run_date = ?, last_run_date = ? WHERE id = ?',
      [nextRunDate, lastRunDate, id]
    );
  }

  async getUpcoming(userId: string, days: number = 30): Promise<UpcomingRecurring[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const recurring = await query<RecurringExpense>(
      `SELECT * FROM recurring_expenses 
       WHERE user_id = ? AND is_active = TRUE AND next_run_date <= ? 
       AND (end_date IS NULL OR end_date >= ?)
       ORDER BY next_run_date ASC`,
      [userId, futureDateStr, today]
    );

    return recurring.map(r => ({
      recurring: r,
      expense_preview: {
        amount: Number(r.amount),
        description: r.description,
        category: r.category,
        date: r.next_run_date,
      },
    }));
  }

  async getWithNextRun(userId: string): Promise<RecurringWithNextRun[]> {
    const recurring = await query<RecurringExpense>(
      'SELECT * FROM recurring_expenses WHERE user_id = ? ORDER BY next_run_date ASC',
      [userId]
    );

    const today = new Date().toISOString().split('T')[0];
    return recurring.map(r => {
      const nextRun = new Date(r.next_run_date);
      const todayDate = new Date(today);
      const diffTime = nextRun.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...r, days_until_next: diffDays };
    });
  }
}

export const recurringRepository = new RecurringRepository();