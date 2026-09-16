import { recurringRepository } from './recurring.repository';
import { expensesRepository } from '../expenses/expenses.repository';
import { expensesService } from '../expenses/expenses.service';
import { CreateRecurringInput, UpdateRecurringInput } from './recurring.schema';
import { RecurringExpense, RunResult, UpcomingRecurring, RecurringWithNextRun } from './recurring.types';
import { Expense } from '../../common/types';
import logger from '../../config/logger';

function addFrequency(dateStr: string, frequency: string): string {
  const date = new Date(dateStr);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

export class RecurringService {
  async getAll(userId: string, query: { page: number; limit: number; is_active?: boolean }) {
    return recurringRepository.findAll(userId, query);
  }

  async getById(id: string, userId: string): Promise<RecurringExpense> {
    return recurringRepository.findById(id, userId);
  }

  async create(userId: string, input: CreateRecurringInput): Promise<RecurringExpense> {
    return recurringRepository.create(userId, input);
  }

  async update(id: string, userId: string, input: UpdateRecurringInput): Promise<RecurringExpense> {
    return recurringRepository.update(id, userId, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    return recurringRepository.delete(id, userId);
  }

  async runOne(id: string, userId: string): Promise<RunResult> {
    const recurring = await recurringRepository.findById(id, userId);

    if (!recurring.is_active) {
      throw new Error('Recurring expense is not active');
    }

    const today = new Date().toISOString().split('T')[0];
    const nextRun = recurring.next_run_date;

    if (nextRun > today) {
      throw new Error('Not due yet');
    }

    if (recurring.end_date && nextRun > recurring.end_date) {
      throw new Error('Recurring expense has ended');
    }

    const expense = await expensesService.create(userId, {
      amount: Number(recurring.amount),
      description: recurring.description,
      category: recurring.category || undefined,
      date: nextRun,
    });

    const newNextRun = addFrequency(nextRun, recurring.frequency);

    if (recurring.end_date && newNextRun > recurring.end_date) {
      await recurringRepository.updateNextRun(id, newNextRun, nextRun);
      await recurringRepository.update(id, userId, { is_active: false });
    } else {
      await recurringRepository.updateNextRun(id, newNextRun, nextRun);
    }

    logger.info({ recurringId: id, expenseId: expense.id, nextRun: newNextRun }, 'Recurring expense executed');

    return { expense, recurring: { ...recurring, next_run_date: newNextRun, last_run_date: nextRun } };
  }

  async runDue(userId: string): Promise<RunResult[]> {
    const due = await recurringRepository.findDue(userId);
    const results: RunResult[] = [];

    for (const r of due) {
      try {
        const result = await this.runOne(r.id, userId);
        results.push(result);
      } catch (e: any) {
        logger.error({ recurringId: r.id, error: e.message }, 'Failed to run recurring expense');
      }
    }

    return results;
  }

  async getUpcoming(userId: string, days: number = 30): Promise<UpcomingRecurring[]> {
    return recurringRepository.getUpcoming(userId, days);
  }

  async getWithNextRun(userId: string): Promise<RecurringWithNextRun[]> {
    return recurringRepository.getWithNextRun(userId);
  }
}

export const recurringService = new RecurringService();