/**
 * Integration tests — supertest against app with mocked DB + mocked Gemini
 */

const mockQuery = jest.fn()
const mockQueryOne = jest.fn()
const mockInsert = jest.fn().mockResolvedValue('mock-id')
const mockExecute = jest.fn().mockResolvedValue(1)
const mockPoolExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }])
const mockPoolQuery = jest.fn().mockResolvedValue([{ affectedRows: 2 }])

jest.mock('../../src/config/database', () => ({
  query: (...a: any[]) => mockQuery(...a),
  queryOne: (...a: any[]) => mockQueryOne(...a),
  insert: (...a: any[]) => mockInsert(...a),
  execute: (...a: any[]) => mockExecute(...a),
  getPool: () => ({ execute: mockPoolExecute, query: mockPoolQuery }),
  initDatabase: jest.fn(),
}))

// Mock Gemini fetch globally
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ candidates: [{ content: { parts: [{ text: '{"category":"Food & Dining","confidence":0.95,"reasoning":"Food"}' }] } }] }),
} as any)
// @ts-ignore
global.fetch = mockFetch

import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app'

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

function authHeader(userId = 'user-123', email = 'test@example.com') {
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' })
  return `Bearer ${token}`
}

describe('Health & 404', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
  it('unknown route 404', async () => {
    const res = await request(app).get('/unknown')
    expect(res.status).toBe(404)
  })
})

describe('Auth routes', () => {
  beforeEach(()=> { jest.clearAllMocks(); mockQueryOne.mockReset(); mockInsert.mockClear() })

  it('POST /api/v1/auth/signup validates and succeeds', async () => {
    mockQueryOne.mockResolvedValueOnce(null) // no existing user
    const res = await request(app).post('/api/v1/auth/signup').send({ email: 'a@b.com', password: 'Strong1Pass', name: 'A' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data.user.email).toBe('a@b.com')
    expect(res.body.data.tokens.accessToken).toBeDefined()
  })

  it('POST /api/v1/auth/signup duplicate email 400', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'u1' })
    const res = await request(app).post('/api/v1/auth/signup').send({ email: 'a@b.com', password: 'Strong1Pass', name: 'A' })
    expect(res.status).toBe(400)
  })

  it('POST /api/v1/auth/login invalid email 401', async () => {
    mockQueryOne.mockResolvedValueOnce(null)
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'notfound@x.com', password: 'Strong1Pass' })
    expect(res.status).toBe(401)
  })

  it('POST /api/v1/auth/login success (mock bcrypt)', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('Strong1Pass', 4)
    mockQueryOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.com', name: 'A', password_hash: hash })
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'Strong1Pass' })
    expect(res.status).toBe(200)
    expect(res.body.data.tokens).toBeDefined()
  })

  it('POST /api/v1/auth/refresh validates', async () => {
    const refreshToken = jwt.sign({ userId: 'u1', email: 'a@b.com' }, REFRESH_SECRET, { expiresIn: '7d' })
    mockQueryOne.mockResolvedValueOnce({ id: 't1', expires_at: new Date(Date.now()+ 86400000).toISOString() })
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })
})

describe('Expenses routes (authenticated)', () => {
  const header = authHeader()

  beforeEach(()=> { jest.clearAllMocks(); mockQuery.mockReset(); mockQueryOne.mockReset(); mockPoolExecute.mockReset(); mockPoolQuery.mockReset() })

  it('GET /api/v1/expenses requires auth 401', async () => {
    const res = await request(app).get('/api/v1/expenses')
    expect(res.status).toBe(401)
  })

  it('GET /api/v1/expenses returns paginated', async () => {
    mockQueryOne.mockResolvedValueOnce({ total: 1 })
    mockQuery.mockResolvedValueOnce([{ id: 'e1', amount: 10, description: 'coffee', category: 'Food', date: '2026-01-01' }])
    const res = await request(app).get('/api/v1/expenses').set('Authorization', header)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta.total).toBe(1)
  })

  it('POST /api/v1/expenses validates amount positive', async () => {
    const res = await request(app).post('/api/v1/expenses').set('Authorization', header).send({ amount: -5, description: 'x' })
    expect(res.status).toBe(400)
  })

  it('POST /api/v1/expenses creates', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'e1', amount: 20, description: 'Lunch', category: 'Food', date: '2026-01-01', user_id: 'user-123' })
    const res = await request(app).post('/api/v1/expenses').set('Authorization', header).send({ amount: 20, description: 'Lunch', category: 'Food' })
    expect(res.status).toBe(201)
  })

  it('GET /api/v1/expenses/stats', async () => {
    mockQueryOne.mockResolvedValueOnce({ totalSpent: '100', totalTransactions: 2 })
    mockQuery.mockResolvedValueOnce([{ category: 'Food', total: 100, count: 2 }])
    const res = await request(app).get('/api/v1/expenses/stats').set('Authorization', header)
    expect(res.status).toBe(200)
    expect(res.body.data.totalSpent).toBe(100)
  })

  it('POST /api/v1/expenses/import bulk', async () => {
    mockInsert.mockResolvedValueOnce('mock-id')
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 2 }])
    const res = await request(app).post('/api/v1/expenses/import').set('Authorization', header).send({ expenses: [{ amount: 10, description: 'a' }, { amount: 20, description: 'b' }] })
    if (res.status !== 201) console.log('Error:', JSON.stringify(res.body, null, 2))
    expect(res.status).toBe(201)
  })

  it('GET /api/v1/expenses/categories', async () => {
    mockQuery.mockResolvedValueOnce([{ category: 'Food' }, { category: 'Transport' }])
    const res = await request(app).get('/api/v1/expenses/categories').set('Authorization', header)
    expect(res.status).toBe(200)
  })
})

describe('Budgets routes', () => {
  const header = authHeader()
  beforeEach(()=> { jest.clearAllMocks(); mockQuery.mockReset(); mockQueryOne.mockReset() })

  it('GET /api/v1/budgets requires auth', async()=> {
    const res= await request(app).get('/api/v1/budgets')
    expect(res.status).toBe(401)
  })

  it('POST /api/v1/budgets upsert', async()=>{
    mockQueryOne.mockResolvedValueOnce(null) // not exists
    mockQueryOne.mockResolvedValueOnce({ id:'b1', user_id:'user-123', category:'Food', monthly_limit:500, month:'2026-01'})
    const res= await request(app).post('/api/v1/budgets').set('Authorization', header).send({ category:'Food', monthly_limit:500, month:'2026-01'})
    expect(res.status).toBe(201)
  })

  it('GET /api/v1/budgets/spending/:month', async()=>{
    // first query: budgets, second: expenses for spending calculation
    mockQuery
      .mockResolvedValueOnce([{ id:'b1', category:'Food', monthly_limit:500, month:'2026-01', user_id:'user-123'}])
      .mockResolvedValueOnce([{ category:'Food', amount: 100 }])
    const res= await request(app).get('/api/v1/budgets/spending/2026-01').set('Authorization', header)
    expect(res.status).toBe(200)
    expect(res.body.data[0].spent).toBe(100)
  })
})

describe('AI routes', () => {
  const header = authHeader()
  beforeEach(()=> { jest.clearAllMocks(); mockQuery.mockReset() })

  it('POST /api/v1/ai/categorize', async()=>{
    const res= await request(app).post('/api/v1/ai/categorize').set('Authorization', header).send({ description:'Uber ride' })
    expect(res.status).toBe(200)
    expect(res.body.data.category).toBeDefined()
  })

  it('POST /api/v1/ai/suggest-budgets', async()=>{
    mockQuery.mockResolvedValueOnce([
      { category:'Food', amount:100, date:'2026-01-10'},
      { category:'Food', amount:150, date:'2026-02-10'},
    ])
    mockFetch.mockResolvedValueOnce({ ok:true, json: async()=> ({ candidates:[{ content:{ parts:[{ text:'[{"category":"Food","suggestedLimit":200,"reasoning":"avg","averageMonthlySpend":125}]' }] } }] }) } as any)
    const res= await request(app).post('/api/v1/ai/suggest-budgets').set('Authorization', header).send({ months: 3 })
    expect(res.status).toBe(200)
  })

  it('POST /api/v1/ai/query', async()=>{
    mockQuery.mockResolvedValueOnce([{ amount:20, description:'Coffee', category:'Food', date:'2026-01-01'}])
    mockFetch.mockResolvedValueOnce({ ok:true, json: async()=> ({ candidates:[{ content:{ parts:[{ text:'You spent $20 on coffee'}] } }] }) } as any)
    const res= await request(app).post('/api/v1/ai/query').set('Authorization', header).send({ query:'how much coffee?' })
    expect(res.status).toBe(200)
    expect(res.body.data.answer).toBeDefined()
  })

  it('validates query empty 400', async()=>{
    const res= await request(app).post('/api/v1/ai/query').set('Authorization', header).send({ query:'' })
    expect(res.status).toBe(400)
  })
})
