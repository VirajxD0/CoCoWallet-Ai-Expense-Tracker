import { budgetsRepository } from './budgets.repository';
import { CreateBudgetInput, UpdateBudgetInput, BudgetQueryInput } from './budgets.schema';
import { BudgetWithSpending } from './budgets.types';
import { Budget } from '../../common/types';

/**
 * Budgets service — contains all business logic for budgets.
 */
export class BudgetsService {
  /**
   * Get all budgets for a user.
   */
  async getAll(userId: string, query: BudgetQueryInput): Promise<Budget[]> {
    return budgetsRepository.findAll(userId, query);
  }

  /**
   * Get a single budget by ID.
   */
  async getById(id: string, userId: string): Promise<Budget> {
    return budgetsRepository.findById(id, userId);
  }

  /**
   * Create or update a budget.
   */
  async upsert(userId: string, input: CreateBudgetInput): Promise<Budget> {
    return budgetsRepository.upsert(userId, input);
  }

  /**
   * Update a budget.
   */
  async update(id: string, userId: string, input: UpdateBudgetInput): Promise<Budget> {
    return budgetsRepository.update(id, userId, input);
  }

  /**
   * Delete a budget.
   */
  async delete(id: string, userId: string): Promise<void> {
    return budgetsRepository.delete(id, userId);
  }

  /**
   * Get budgets with actual spending for comparison.
   */
  async getBudgetsWithSpending(userId: string, month: string): Promise<BudgetWithSpending[]> {
    return budgetsRepository.getBudgetsWithSpending(userId, month);
  }
}

export const budgetsService = new BudgetsService();
