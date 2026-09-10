import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Wallet, Sparkles, LogOut, Menu, X, Globe, Home } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
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
  const handleLogout = async () => {
    try{ await authApi.logout() } catch{}
    logout()
    navigate('/', { replace: true })
  }
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* desktop sidebar */}
      <aside className="hidden md:flex w-[280px] flex-col border-r bg-white shadow-premium shrink-0">
        <div className="p-6 border-b bg-gradient-to-br from-white to-secondary/30">
          <Link to="/dashboard" className="flex items-center">
            <Logo size={44} />
          </Link>
          <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border shadow-sm hover:bg-secondary transition-colors">
            <Home className="h-3.5 w-3.5" /> Back to Website
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(i=> {
            const active = loc.pathname.startsWith(i.to)
            return <Link key={i.to} to={i.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary text-primary-foreground shadow-premium' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}>
              <i.icon className="h-4 w-4"/>{i.label}
            </Link>
          })}
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mt-2 border-t pt-3">
            <Globe className="h-4 w-4"/> Website Home
          </Link>
        </nav>
        <div className="p-4 border-t bg-muted/30 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border shadow-sm">
            <div className="h-9 w-9 rounded-full gradient-navy flex items-center justify-center font-bold text-white text-sm shrink-0">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{user?.name}</p><p className="text-xs text-muted-foreground truncate">{user?.email}</p></div>
          </div>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full rounded-xl gap-2 bg-white hover:bg-secondary">
              <Globe className="h-4 w-4"/> Visit Website
            </Button>
          </Link>
          <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleLogout}><LogOut className="h-4 w-4"/> Sign out</Button>
          <p className="text-[11px] text-center text-muted-foreground">Logout takes you to home</p>
        </div>
      </aside>

      {/* mobile + main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-3 border-b bg-white/80 backdrop-blur-xl sticky top-0 z-20 gap-2">
          <Link to="/dashboard" className="flex items-center shrink-0"><Logo size={34} /></Link>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 px-3 text-xs font-semibold"><Globe className="h-3.5 w-3.5"/> Home</Button></Link>
            <button onClick={()=>setOpen(!open)} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button>
          </div>
        </header>
        {open && <div className="md:hidden border-b bg-white p-4 space-y-1 animate-fade-in">
          {nav.map(i=> <Link key={i.to} to={i.to} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${loc.pathname.startsWith(i.to) ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}><i.icon className="h-4 w-4"/>{i.label}</Link>)}
          <Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary border-t mt-2 pt-3"><Globe className="h-4 w-4"/> Website Home</Link>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link to="/" onClick={()=>setOpen(false)}><Button variant="outline" className="w-full rounded-xl gap-1.5"><Globe className="h-4 w-4"/> Website</Button></Link>
            <Button variant="outline" className="w-full rounded-xl gap-1.5" onClick={handleLogout}><LogOut className="h-4 w-4"/> Sign out</Button>
          </div>
        </div>}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
