import jwt from 'jsonwebtoken'
import { authenticate } from '../../src/common/middleware/auth'
import { errorHandler } from '../../src/common/middleware/errorHandler'
import { AppError } from '../../src/common/errors/AppError'
import { ValidationError } from '../../src/common/errors/ValidationError'

const JWT_SECRET = process.env.JWT_SECRET!

describe('auth middleware', () => {
  const mockNext = jest.fn()
  const mockRes = {} as any

  beforeEach(() => jest.clearAllMocks())

  it('should attach user when valid Bearer token', () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, JWT_SECRET, { expiresIn: '1h' })
    const req = { headers: { authorization: `Bearer ${token}` } } as any
    authenticate(req, mockRes, mockNext)
    expect(req.user?.userId).toBe('u1')
    expect(mockNext).toHaveBeenCalledWith()
  })

  it('should call next with UnauthorizedError when missing header', () => {
    const req = { headers: {} } as any
    authenticate(req, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('should handle expired token', () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, JWT_SECRET, { expiresIn: '0s' })
    // small delay to expire
    const req = { headers: { authorization: `Bearer ${token}` } } as any
    authenticate(req, mockRes, mockNext)
    // Token may be expired or invalid depending on timing; ensure error
    expect(mockNext).toHaveBeenCalled()
    const err = mockNext.mock.calls[0][0]
    expect(err.statusCode).toBe(401)
  })

  it('should handle invalid token string', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } } as any
    authenticate(req, mockRes, mockNext)
    expect(mockNext.mock.calls[0][0].statusCode).toBe(401)
  })
})

describe('errorHandler', () => {
  it('should return operational error message', () => {
    const err = new ValidationError('Bad input')
    const req = { method: 'POST', url: '/api/v1/auth/signup' } as any
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    errorHandler(err, req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'error', message: 'Bad input' }))
  })

  it('should hide non-operational errors in production', () => {
    const err = new Error('secret stack')
    ;(err as any).isOperational = false
    const req = { method: 'GET', url: '/' } as any
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    errorHandler(err, req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    const body = res.json.mock.calls[0][0]
    expect(body.message).toBe('Internal server error')
  })
})

describe('AppError', () => {
  it('should set statusCode and code', () => {
    const e = new AppError('oops', 422, 'UNPROCESSABLE')
    expect(e.statusCode).toBe(422)
    expect(e.code).toBe('UNPROCESSABLE')
    expect(e.isOperational).toBe(true)
  })
})
