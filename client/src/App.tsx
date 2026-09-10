import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import Home from '@/pages/Home'
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
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<GuestRoute><Login/></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup/></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard/></AppShell></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><AppShell><Expenses/></AppShell></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><AppShell><Budgets/></AppShell></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AppShell><AIAssistant/></AppShell></ProtectedRoute>} />
        <Route path="*" element={<div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4"><p className="text-2xl font-display font-bold">404 — Not found</p><a href="/" className="text-primary underline font-medium">Go home</a></div>} />
      </Routes>
    </BrowserRouter>
  )
}
export default function App(){ return <QueryClientProvider client={qc}><AppRoutes/></QueryClientProvider> }
