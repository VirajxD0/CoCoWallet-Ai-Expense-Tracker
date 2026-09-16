import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute } from '../../config/database';
import { Alert, AlertType } from './alerts.types';
import logger from '../../config/logger';

export class AlertsRepository {
  async create(userId: string, type: AlertType, title: string, message: string, data: Record<string, any> = {}): Promise<Alert> {
    const id = uuidv4();
    await insert(
      'INSERT INTO alerts (id, user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, type, title, message, JSON.stringify(data)]
    );
    return this.findById(id, userId);
  }

  async findById(id: string, userId: string): Promise<Alert> {
    const alert = await queryOne<Alert>(
      'SELECT * FROM alerts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!alert) {
      throw new Error('Alert not found');
    }

    return alert;
  }

  async findAll(userId: string, query_: { page?: number; limit?: number; is_read?: boolean; type?: AlertType } = {}): Promise<{ alerts: Alert[]; total: number }> {
    const { page = 1, limit = 20, is_read, type } = query_;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (is_read !== undefined) {
      conditions.push('is_read = ?');
      params.push(is_read);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    const where = conditions.join(' AND ');

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM alerts WHERE ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const alerts = await query<Alert>(
      `SELECT * FROM alerts WHERE ${where} ORDER BY triggered_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { alerts, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result?.count || 0;
  }

  private toMySQLDateTime(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  async markRead(id: string, userId: string): Promise<Alert> {
    await execute(
      'UPDATE alerts SET is_read = TRUE, read_at = ? WHERE id = ? AND user_id = ?',
      [this.toMySQLDateTime(new Date()), id, userId]
    );
    return this.findById(id, userId);
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await execute(
      'UPDATE alerts SET is_read = TRUE, read_at = ? WHERE user_id = ? AND is_read = FALSE',
      [this.toMySQLDateTime(new Date()), userId]
    );
    return (result as any).affectedRows || 0;
  }

  async exists(userId: string, type: AlertType, refId: string): Promise<boolean> {
    const data = JSON.stringify({ budgetId: refId, goalId: refId, recurringId: refId });
    const alert = await queryOne<Alert>(
      `SELECT * FROM alerts WHERE user_id = ? AND type = ? AND (data LIKE ? OR data LIKE ? OR data LIKE ?) AND is_read = FALSE`,
      [userId, type, `%${refId}%`, `%${refId}%`, `%${refId}%`]
    );
    return !!alert;
  }

  async getRecent(userId: string, hours: number = 24): Promise<Alert[]> {
    const since = this.toMySQLDateTime(new Date(Date.now() - hours * 60 * 60 * 1000));
    return query<Alert>(
      'SELECT * FROM alerts WHERE user_id = ? AND triggered_at >= ? ORDER BY triggered_at DESC',
      [userId, since]
    );
  }
}

export const alertsRepository = new AlertsRepository();