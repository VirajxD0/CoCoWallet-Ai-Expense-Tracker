import { create } from 'zustand'
import { api } from '@/lib/api'

interface User { id: string; email: string; name: string }

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  init: () => {
    const u = localStorage.getItem('user')
    const at = localStorage.getItem('accessToken')
    const rt = localStorage.getItem('refreshToken')

    if (!at) {
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      return
    }

    // Optimistically set auth from localStorage
    if (u) {
      try {
        set({ user: JSON.parse(u), accessToken: at, refreshToken: rt, isAuthenticated: true })
      } catch {
        set({ user: null, accessToken: at, refreshToken: rt, isAuthenticated: true })
      }
    }

    // Validate token server-side
    set({ loading: true })
    api.get('/auth/me')
      .then((res) => {
        const user = res.data.data
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, isAuthenticated: true, loading: false })
      })
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, loading: false })
      })
  },
}))
