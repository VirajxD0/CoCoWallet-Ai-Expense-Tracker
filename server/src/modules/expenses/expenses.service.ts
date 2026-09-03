import { expensesRepository } from './expenses.repository';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryInput } from './expenses.schema';
import { ExpenseListResponse, ExpenseStatsResponse } from './expenses.types';
import { Expense } from '../../common/types';
import logger from '../../config/logger';

/**
 * Expenses service — contains all business logic for expenses.
 * Framework-agnostic: no req/res, no Express dependencies.
 */
export class ExpensesService {
  /**
   * Get all expenses with pagination and filters.
   */
  async getAll(userId: string, query: ExpenseQueryInput): Promise<ExpenseListResponse> {
    return expensesRepository.findAll(userId, query);
  }

  /**
   * Get a single expense by ID.
   */
  async getById(id: string, userId: string): Promise<Expense> {
    return expensesRepository.findById(id, userId);
  }

  /**
   * Create a new expense.
   */
  async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    return expensesRepository.create(userId, input);
  }

  /**
   * Update an existing expense.
   */
  async update(id: string, userId: string, input: UpdateExpenseInput): Promise<Expense> {
    return expensesRepository.update(id, userId, input);
  }

  /**
   * Delete an expense.
   */
  async delete(id: string, userId: string): Promise<void> {
    return expensesRepository.delete(id, userId);
  }

  /**
   * Bulk import expenses from CSV data.
   */
  async bulkImport(userId: string, expenses: CreateExpenseInput[]): Promise<{ imported: number }> {
    if (!expenses.length) {
      return { imported: 0 };
    }

    const imported = await expensesRepository.bulkCreate(userId, expenses);
    logger.info({ userId, count: imported }, 'Expenses imported');

    return { imported };
  }

  /**
   * Get expense statistics.
   */
  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseStatsResponse> {
    return expensesRepository.getStats(userId, startDate, endDate);
  }

  /**
   * Get all distinct categories for a user.
   */
  async getCategories(userId: string): Promise<string[]> {
    return expensesRepository.getCategories(userId);
  }
}

export const expensesService = new ExpensesService();
