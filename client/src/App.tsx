import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Expenses from '@/pages/Expenses'
import Budgets from '@/pages/Budgets'
import AIAssistant from '@/pages/AIAssistant'

const qc = new QueryClient({ defaultOptions:{ queries:{ retry:1, refetchOnWindowFocus:false } } })

function AppRoutes(){
  const init = useAuthStore(s=>s.init)
  useEffect(()=>{ init() },[init])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login/></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup/></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard/></AppShell></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><AppShell><Expenses/></AppShell></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><AppShell><Budgets/></AppShell></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AppShell><AIAssistant/></AppShell></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace/>} />
        <Route path="*" element={<div className="p-8 text-center">404 — <a href="/dashboard" className="text-primary underline">Go home</a></div>} />
      </Routes>
    </BrowserRouter>
  )
}
export default function App(){ return <QueryClientProvider client={qc}><AppRoutes/></QueryClientProvider> }
