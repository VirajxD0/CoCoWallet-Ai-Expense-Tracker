import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s=>s.isAuthenticated)
  if(!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s=>s.isAuthenticated)
  if(isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
