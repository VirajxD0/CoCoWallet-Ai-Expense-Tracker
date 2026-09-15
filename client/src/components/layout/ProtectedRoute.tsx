import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s=>s.isAuthenticated)
  if(!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
export function GuestRoute({ children }: { children: React.ReactNode }) {
  // No longer redirects authenticated users — allows logged-in users to visit /login and /signup from Home without being forced to /dashboard
  return <>{children}</>
}
