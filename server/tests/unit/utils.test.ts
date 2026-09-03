import { paginateMeta, sendSuccess } from '../../src/common/utils/apiResponse'

describe('paginateMeta', () => {
  it('calculates totalPages correctly', () => {
    expect(paginateMeta(100, 1, 20)).toEqual({ page: 1, limit: 20, total: 100, totalPages: 5 })
    expect(paginateMeta(0, 1, 20)).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 })
    expect(paginateMeta(21, 2, 10)).toEqual({ page: 2, limit: 10, total: 21, totalPages: 3 })
  })
})

describe('sendSuccess', () => {
  it('sends JSON with status success', () => {
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    sendSuccess(res, { id: 1 }, 201)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: { id: 1 } })
  })
})
