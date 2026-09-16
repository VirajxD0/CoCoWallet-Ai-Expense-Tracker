import { goalsRepository } from './goals.repository';
import { expensesRepository } from '../expenses/expenses.repository';
import { CreateGoalInput, UpdateGoalInput, AllocateInput } from './goals.schema';
import { Goal, GoalWithProgress, GoalAllocation, SurplusCalculation } from './goals.types';
import logger from '../../config/logger';

export class GoalsService {
  async getAll(userId: string, query: { page: number; limit: number; include_completed: boolean }) {
    return goalsRepository.findAll(userId, query);
  }

  async getWithProgress(userId: string): Promise<GoalWithProgress[]> {
    return goalsRepository.getWithProgress(userId);
  }

  async getById(id: string, userId: string): Promise<Goal> {
    return goalsRepository.findById(id, userId);
  }

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    return goalsRepository.create(userId, input);
  }

  async update(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    return goalsRepository.update(id, userId, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    return goalsRepository.delete(id, userId);
  }

  async allocate(id: string, userId: string, input: AllocateInput): Promise<GoalAllocation> {
    return goalsRepository.allocate(id, userId, input.amount, input.source);
  }

  async getAllocations(id: string, userId: string): Promise<GoalAllocation[]> {
    return goalsRepository.getAllocations(id, userId);
  }

  async calculateSurplus(userId: string, month: string): Promise<SurplusCalculation> {
    return goalsRepository.calculateSurplus(userId, month);
  }

  async autoAllocateSurplus(userId: string, month: string): Promise<GoalAllocation[]> {
    return goalsRepository.autoAllocateSurplus(userId, month);
  }
}

export const goalsService = new GoalsService();