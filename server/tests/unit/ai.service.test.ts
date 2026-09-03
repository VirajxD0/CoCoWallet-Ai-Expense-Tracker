/**
 * Unit tests for AiService — mock fetch and database
 */
const mockQuery = jest.fn()
jest.mock('../../src/config/database', () => ({
  query: (...args: any[]) => mockQuery(...args),
  queryOne: jest.fn(),
  insert: jest.fn(),
  execute: jest.fn(),
  getPool: jest.fn(),
  initDatabase: jest.fn(),
}))

describe('AiService', () => {
  let aiService: any
  let originalFetch: any

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    originalFetch = global.fetch
    // Mock fetch for Gemini
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"category":"Food & Dining","confidence":0.92,"reasoning":"Uber Eats"}' }] } }],
      }),
      text: async () => 'error',
    }) as any
  })
  afterEach(() => { global.fetch = originalFetch })

  async function getService() {
    const mod = await import('../../src/modules/ai/ai.service')
    return mod.aiService
  }

  it('categorize returns parsed JSON', async () => {
    aiService = await getService()
    const res = await aiService.categorize({ description: 'Uber Eats delivery', amount: 24 })
    expect(res.category).toBe('Food & Dining')
    expect(res.confidence).toBeCloseTo(0.92)
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('generativelanguage'), expect.any(Object))
  })

  it('categorize fallback to Other on invalid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'not json at all' }] } }] }),
    } as any)
    aiService = await getService()
    const res = await aiService.categorize({ description: 'random' })
    expect(res.category).toBe('Other')
    expect(res.confidence).toBe(0.5)
  })

  it('categorize throws on API error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limit' } as any)
    aiService = await getService()
    await expect(aiService.categorize({ description: 'test' })).rejects.toThrow()
  })

  it('naturalQuery returns answer from Gemini', async () => {
    mockQuery.mockResolvedValue([{ amount: 20, description: 'Coffee', category: 'Food & Dining', date: '2026-01-01' }])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'You spent $20 on coffee' }] } }] }),
    } as any)
    aiService = await getService()
    const res = await aiService.naturalQuery('user-1', { query: 'how much coffee?' })
    expect(res.answer).toContain('20')
  })

  it('naturalQuery handles no expenses', async () => {
    mockQuery.mockResolvedValue([])
    aiService = await getService()
    const res = await aiService.naturalQuery('user-1', { query: 'anything' })
    expect(res.answer).toMatch(/No expense data/)
  })

  it('suggestBudgets returns fallback when Gemini JSON invalid', async () => {
    mockQuery.mockResolvedValue([
      { category: 'Food & Dining', amount: 100, date: '2026-01-10' },
      { category: 'Food & Dining', amount: 200, date: '2026-02-10' },
    ])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }),
    } as any)
    aiService = await getService()
    const res = await aiService.suggestBudgets('user-1', { months: 2 })
    expect(Array.isArray(res)).toBe(true)
    expect(res[0].category).toBe('Food & Dining')
    expect(res[0].suggestedLimit).toBeGreaterThan(0)
  })
})
