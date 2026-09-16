import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, insert, execute, getPool } from '../../config/database';
import { expensesRepository } from '../expenses/expenses.repository';
import { budgetsRepository } from '../budgets/budgets.repository';
import { goalsRepository } from '../goals/goals.repository';
import { recurringRepository } from '../recurring/recurring.repository';
import { ExportQueryInput, ImportInput } from './export.schema';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import logger from '../../config/logger';

const UPLOAD_DIR = join(process.cwd(), 'uploads/exports');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface ExportJob {
  id: string;
  user_id: string;
  format: 'json' | 'csv';
  status: 'pending' | 'completed' | 'failed';
  file_path: string | null;
  record_count: number;
  error_message: string | null;
  filters: Record<string, any>;
  created_at: string;
  completed_at: string | null;
}

interface ExpenseRecord {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string | null;
  receipt_url: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export class ExportService {
  async exportData(userId: string, input: ExportQueryInput): Promise<{ jobId: string; downloadUrl: string }> {
    const jobId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `export_${userId}_${timestamp}.${input.format}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await insert(
      `INSERT INTO export_jobs (id, user_id, format, status, file_path, filters, record_count)
       VALUES (?, ?, ?, 'pending', ?, ?, 0)`,
      [jobId, userId, input.format, fileName, JSON.stringify(input)]
    );

    try {
      let recordCount = 0;
      let content: string;

      if (input.format === 'json') {
        content = await this.exportJson(userId, input);
        recordCount = JSON.parse(content).expenses?.length || 0;
      } else {
        content = await this.exportCsv(userId, input);
        recordCount = content.split('\n').length - 1;
      }

      writeFileSync(filePath, content, 'utf-8');

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await execute(
        'UPDATE export_jobs SET status = ?, record_count = ?, completed_at = ? WHERE id = ?',
        ['completed', recordCount, now, jobId]
      );

      logger.info({ jobId, userId, format: input.format, recordCount, fileName }, 'Export completed');

      return { jobId, downloadUrl: `/api/v1/export/download/${jobId}` };
    } catch (error: any) {
      await execute(
        'UPDATE export_jobs SET status = ?, error_message = ? WHERE id = ?',
        ['failed', error.message, jobId]
      );
      logger.error({ jobId, userId, error: error.message }, 'Export failed');
      throw error;
    }
  }

  private async exportJson(userId: string, input: ExportQueryInput): Promise<string> {
    const data: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      user: await queryOne('SELECT id, email, name FROM users WHERE id = ?', [userId]),
    };

    if (input.includeExpenses) {
      data.expenses = await expensesRepository.findAll(userId, {
        page: 1,
        limit: 10000,
        startDate: input.startDate,
        endDate: input.endDate,
        sortBy: 'date',
        sortOrder: 'desc',
      });
    }

    if (input.includeBudgets) {
      const budgets = await query('SELECT * FROM budgets WHERE user_id = ?', [userId]);
      data.budgets = budgets;
    }

    if (input.includeRecurring) {
      data.recurringExpenses = await recurringRepository.getWithNextRun(userId);
    }

    if (input.includeGoals) {
      data.goals = await goalsRepository.getWithProgress(userId);
    }

    if (input.includeAllocations) {
      const goals = await query('SELECT id FROM goals WHERE user_id = ?', [userId]);
      const allocations: any[] = [];
      for (const g of goals) {
        const allocs = await goalsRepository.getAllocations(g.id, userId);
        allocations.push(...allocs);
      }
      data.goalAllocations = allocations;
    }

    return JSON.stringify(data, null, 2);
  }

  private async exportCsv(userId: string, input: ExportQueryInput): Promise<string> {
    let csv = '';
    const expensesResult = await expensesRepository.findAll(userId, {
      page: 1,
      limit: 10000,
      startDate: input.startDate,
      endDate: input.endDate,
      sortBy: 'date',
      sortOrder: 'desc',
    });

    const expenses = expensesResult.expenses as ExpenseRecord[];
    if (expenses.length > 0) {
      const headers = Object.keys(expenses[0]);
      csv += headers.join(',') + '\n';
      expenses.forEach(e => {
        csv += headers.map(h => `"${String((e as any)[h] || '').replace(/"/g, '""')}"`).join(',') + '\n';
      });
    }

    return csv;
  }

  async importData(userId: string, filePath: string, input: ImportInput): Promise<{ imported: number; errors: string[] }> {
    const content = readFileSync(filePath, 'utf-8');
    const errors: string[] = [];
    let imported = 0;

    if (input.format === 'json') {
      try {
        const data = JSON.parse(content);
        
        if (data.expenses && Array.isArray(data.expenses)) {
          for (const e of data.expenses) {
            try {
              await expensesRepository.create(userId, {
                amount: e.amount,
                description: e.description,
                category: e.category,
                date: e.date,
                receipt_url: e.receipt_url,
              });
              imported++;
            } catch (e: any) {
              if (!input.skipExisting) errors.push(e.message);
            }
          }
        }

        if (data.recurringExpenses && Array.isArray(data.recurringExpenses)) {
          for (const r of data.recurringExpenses) {
            try {
              await recurringRepository.create(userId, {
                amount: r.amount,
                description: r.description,
                category: r.category,
                frequency: r.frequency,
                start_date: r.start_date,
                end_date: r.end_date,
                notes: r.notes,
              });
              imported++;
            } catch (e: any) {
              if (!input.skipExisting) errors.push(e.message);
            }
          }
        }

        if (data.goals && Array.isArray(data.goals)) {
          for (const g of data.goals) {
            try {
              await goalsRepository.create(userId, {
                name: g.name,
                target_amount: g.target_amount,
                current_amount: g.current_amount,
                target_date: g.target_date,
                category: g.category,
                icon: g.icon,
                color: g.color,
                auto_allocate_pct: g.auto_allocate_pct,
              });
              imported++;
            } catch (e: any) {
              if (!input.skipExisting) errors.push(e.message);
            }
          }
        }
      } catch (e: any) {
        errors.push(`JSON parse error: ${e.message}`);
      }

    } else {
      // CSV import - basic expenses only
      const lines = content.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.replace(/"/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h: string, idx: number) => row[h] = values[idx] || '');
          
          if (row.amount && row.description) {
            try {
              await expensesRepository.create(userId, {
                amount: parseFloat(row.amount),
                description: row.description,
                category: row.category || undefined,
                date: row.date || new Date().toISOString().split('T')[0],
              });
              imported++;
            } catch (e: any) {
              if (!input.skipExisting) errors.push(e.message);
            }
          }
        }
      }
    }

    return { imported, errors };
  }

  async getHistory(userId: string): Promise<ExportJob[]> {
    return query<ExportJob>(
      'SELECT * FROM export_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
  }

  async getJob(jobId: string, userId: string): Promise<ExportJob | null> {
    return queryOne<ExportJob>(
      'SELECT * FROM export_jobs WHERE id = ? AND user_id = ?',
      [jobId, userId]
    );
  }
}

export const exportService = new ExportService();