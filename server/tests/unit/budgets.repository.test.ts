const mockQuery = jest.fn()
const mockQueryOne = jest.fn()
const mockInsert = jest.fn()
const mockExecute = jest.fn()

jest.mock('../../src/config/database', () => ({
  query: (...a:any[])=> mockQuery(...a),
  queryOne: (...a:any[])=> mockQueryOne(...a),
  insert: (...a:any[])=> mockInsert(...a),
  execute: (...a:any[])=> mockExecute(...a),
  getPool: jest.fn(),
  initDatabase: jest.fn(),
}))

import { budgetsRepository } from '../../src/modules/budgets/budgets.repository'

describe('BudgetsRepository', () => {
  beforeEach(()=> jest.clearAllMocks())

  it('findAll without month', async()=>{
    mockQuery.mockResolvedValue([{id:'1'}])
    const r= await budgetsRepository.findAll('u1', {} as any)
    expect(r).toHaveLength(1)
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM budgets WHERE user_id'), ['u1'])
  })

  it('findAll with month filter', async()=>{
    mockQuery.mockResolvedValue([])
    await budgetsRepository.findAll('u1', { month:'2026-01'} as any)
    expect(mockQuery.mock.calls[0][1]).toContain('2026-01')
  })

  it('findById throws if not found', async()=>{
    mockQueryOne.mockResolvedValue(null)
    await expect(budgetsRepository.findById('x','u1')).rejects.toThrow('Budget')
  })

  it('upsert creates when not exists', async()=>{
    mockQueryOne.mockResolvedValueOnce(null) // existing check
    mockInsert.mockResolvedValue('id')
    mockQueryOne.mockResolvedValueOnce({ id:'new', user_id:'u1', category:'Food', monthly_limit:500, month:'2026-01'})
    const r= await budgetsRepository.upsert('u1', { category:'Food', monthly_limit:500, month:'2026-01'} as any)
    expect(r.category).toBe('Food')
    expect(mockInsert).toHaveBeenCalled()
  })

  it('getBudgetsWithSpending joins correctly', async()=>{
    // first query: budgets, second: expenses
    mockQuery
      .mockResolvedValueOnce([{ id:'1', category:'Food', monthly_limit:500, month:'2026-01', user_id:'u1'}])
      .mockResolvedValueOnce([{ category:'Food', amount: 200 }])
    const r= await budgetsRepository.getBudgetsWithSpending('u1','2026-01')
    expect(r[0].spent).toBe(200)
    expect(r[0].remaining).toBe(300)
    expect(r[0].percentage).toBe(40)
  })

  it('getBudgetsWithSpending returns empty when no budgets', async()=>{
    mockQuery.mockResolvedValueOnce([])
    const r= await budgetsRepository.getBudgetsWithSpending('u1','2026-01')
    expect(r).toEqual([])
  })
})
