import { createExpenseSchema, expenseQuerySchema } from '../../src/modules/expenses/expenses.schema'
import { signupSchema } from '../../src/modules/auth/auth.schema'
import { createBudgetSchema } from '../../src/modules/budgets/budgets.schema'
import { categorizeSchema } from '../../src/modules/ai/ai.schema'

describe('Zod validation', () => {
  it('createExpense valid', () => {
    expect(() => createExpenseSchema.parse({ amount: 10, description: 'coffee' })).not.toThrow()
  })
  it('createExpense invalid amount', () => {
    expect(() => createExpenseSchema.parse({ amount: -5, description: 'x' })).toThrow()
  })
  it('signup password complexity', () => {
    expect(() => signupSchema.parse({ email: 'a@b.com', password: 'weak', name: 'A' })).toThrow()
    expect(() => signupSchema.parse({ email: 'a@b.com', password: 'Strong1pass', name: 'A' })).not.toThrow()
  })
  it('budget month format', () => {
    expect(() => createBudgetSchema.parse({ category: 'Food', monthly_limit: 500, month: '2026-01' })).not.toThrow()
    expect(() => createBudgetSchema.parse({ category: 'Food', monthly_limit: 500, month: '2026/01' })).toThrow()
  })
  it('expense query defaults', () => {
    const parsed = expenseQuerySchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(20)
    expect(parsed.sortBy).toBe('date')
  })
  it('categorize requires description', () => {
    expect(() => categorizeSchema.parse({ description: '' })).toThrow()
    expect(() => categorizeSchema.parse({ description: 'Uber' })).not.toThrow()
  })
})
