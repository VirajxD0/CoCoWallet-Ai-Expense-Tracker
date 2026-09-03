/**
 * Unit tests for expenses repository — mock DB pool
 */
const mockExecute = jest.fn()
const mockQuery = jest.fn()
const mockQueryOne = jest.fn()

jest.mock('../../src/config/database', () => ({
  query: (...a: any[]) => mockQuery(...a),
  queryOne: (...a: any[]) => mockQueryOne(...a),
  insert: jest.fn().mockResolvedValue('id'),
  execute: (...a: any[]) => mockExecute(...a),
  getPool: () => ({ execute: mockExecute }),
  initDatabase: jest.fn(),
}))

import { expensesRepository } from '../../src/modules/expenses/expenses.repository'

describe('ExpensesRepository', () => {
  beforeEach(() => jest.clearAllMocks())

  it('findAll builds WHERE and paginates', async () => {
    mockQueryOne.mockResolvedValue({ total: 2 })
    mockQuery.mockResolvedValue([{ id: '1', amount: 10 }])
    const res = await expensesRepository.findAll('u1', {
      page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc',
    } as any)
    expect(res.total).toBe(2)
    expect(res.expenses).toHaveLength(1)
    expect(mockQueryOne).toHaveBeenCalledWith(expect.stringContaining('COUNT'), expect.any(Array))
  })

  it('findAll with search and filters', async () => {
    mockQueryOne.mockResolvedValue({ total: 0 })
    mockQuery.mockResolvedValue([])
    await expensesRepository.findAll('u1', {
      page: 1, limit: 5, search: 'coffee', category: 'Food', startDate: '2026-01-01', endDate: '2026-01-31', sortBy: 'amount', sortOrder: 'asc'
    } as any)
    expect(mockQuery).toHaveBeenCalled()
    const sql = mockQuery.mock.calls[0][0]
    expect(sql).toContain('ORDER BY amount ASC')
  })

  it('findById throws NotFound when missing', async () => {
    mockQueryOne.mockResolvedValue(null)
    await expect(expensesRepository.findById('id', 'u1')).rejects.toThrow('Expense')
  })

  it('create inserts and returns', async () => {
    mockQueryOne.mockResolvedValue({ id: 'new', amount: 10, description: 'test', category: 'Food', date: '2026-01-01' })
    const res = await expensesRepository.create('u1', { amount: 10, description: 'test', category: 'Food' } as any)
    expect(res.id).toBe('new')
  })

  it('update with no fields returns existing', async () => {
    mockQueryOne.mockResolvedValue({ id: '1', amount: 10 })
    const res = await expensesRepository.update('1', 'u1', {} as any)
    expect(res.id).toBe('1')
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('getStats aggregates', async () => {
    mockQueryOne.mockResolvedValue({ totalSpent: '100.50', totalTransactions: 2 })
    mockQuery.mockResolvedValue([{ category: 'Food', total: 100, count: 2 }])
    const s = await expensesRepository.getStats('u1')
    expect(s.totalSpent).toBeCloseTo(100.5)
    expect(s.averagePerTransaction).toBeCloseTo(50.25)
  })
})
