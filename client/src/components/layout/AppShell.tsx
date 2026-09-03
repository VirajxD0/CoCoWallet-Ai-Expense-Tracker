import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Wallet, Sparkles, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const nav = [
  { to:'/dashboard', label:'Dashboard', icon: LayoutDashboard },
  { to:'/expenses', label:'Expenses', icon: Receipt },
  { to:'/budgets', label:'Budgets', icon: Wallet },
  { to:'/ai', label:'AI Assistant', icon: Sparkles },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const loc = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleLogout = async () => { try{ await authApi.logout() } catch{}; logout(); navigate('/login') }
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6 border-b">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">₿</div> ExpenseAI
          </Link>
          <p className="text-xs text-muted-foreground mt-1">AI-Powered Finance</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(i=> {
            const active = loc.pathname.startsWith(i.to)
            return <Link key={i.to} to={i.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
              <i.icon className="h-4 w-4"/>{i.label}
            </Link>
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-muted-foreground truncate">{user?.email}</p></div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2"/>Sign out</Button>
        </div>
      </aside>

      {/* mobile */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-20">
          <Link to="/dashboard" className="font-bold flex items-center gap-2"><div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center">₿</div>ExpenseAI</Link>
          <button onClick={()=>setOpen(!open)} className="p-2">{open ? <X/> : <Menu/>}</button>
        </header>
        {open && <div className="md:hidden border-b bg-background p-4 space-y-1">
          {nav.map(i=> <Link key={i.to} to={i.to} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${loc.pathname.startsWith(i.to) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}><i.icon className="h-4 w-4"/>{i.label}</Link>)}
          <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>Sign out</Button>
        </div>}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
