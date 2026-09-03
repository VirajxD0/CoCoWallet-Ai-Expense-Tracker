import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

export const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
          .catch((e) => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) { isRefreshing = false; window.location.href = '/login'; return Promise.reject(error) }
      try {
        const res = await axios.post(`${API_URL}/api/${API_VERSION}/auth/refresh`, { refreshToken })
        const newToken = res.data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (e) {
        processQueue(e, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  signup: (data: { email: string; password: string; name: string }) => api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}
export const expensesApi = {
  list: (params?: Record<string, unknown>) => api.get('/expenses', { params }),
  get: (id: string) => api.get(`/expenses/${id}`),
  create: (data: unknown) => api.post('/expenses', data),
  update: (id: string, data: unknown) => api.put(`/expenses/${id}`, data),
  remove: (id: string) => api.delete(`/expenses/${id}`),
  stats: (params?: Record<string,string>) => api.get('/expenses/stats', { params }),
  categories: () => api.get('/expenses/categories'),
  import: (expenses: unknown[]) => api.post('/expenses/import', { expenses }),
}
export const budgetsApi = {
  list: (params?: Record<string,string>) => api.get('/budgets', { params }),
  spending: (month: string) => api.get(`/budgets/spending/${month}`),
  upsert: (data: unknown) => api.post('/budgets', data),
  update: (id: string, data: unknown) => api.put(`/budgets/${id}`, data),
  remove: (id: string) => api.delete(`/budgets/${id}`),
}
export const aiApi = {
  categorize: (data: { description: string; amount?: number }) => api.post('/ai/categorize', data),
  suggestBudgets: (months?: number) => api.post('/ai/suggest-budgets', { months }),
  query: (query: string) => api.post('/ai/query', { query }),
}
