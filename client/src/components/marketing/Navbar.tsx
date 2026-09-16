import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/', { replace: true })
    setOpen(false)
  }

  const links = [
    { label: 'Features', href: '/#features', id: 'features' },
    { label: 'How it works', href: '/#how', id: 'how' },
    { label: 'AI', href: '/#ai', id: 'ai' },
    { label: 'Security', href: '/#security', id: 'security' },
  ]

  const handleNav = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    if (location.pathname !== '/') {
      navigate(`/#${id}`)
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', `/#${id}`)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ${scrolled ? 'bg-white/85 shadow-premium border-transparent' : 'bg-white/70'}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo size={42} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={(e) => handleNav(e, l.id)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard"><Button variant="ghost" className="rounded-full px-5 font-semibold gap-1.5"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
              <Button variant="outline" className="rounded-full px-5 font-semibold gap-1.5" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className="rounded-full px-5 font-semibold">Log in</Button></Link>
              <Link to="/signup"><Button className="rounded-full px-5 shadow-premium font-semibold gap-1.5">Register <ArrowRight className="h-4 w-4" /></Button></Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2.5 rounded-xl bg-secondary">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={(e) => handleNav(e, l.id)} className="px-3 py-3 rounded-xl text-[15px] font-medium hover:bg-secondary">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}><Button className="w-full rounded-full h-11 font-semibold gap-1.5"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
                <Button variant="outline" className="w-full rounded-full h-11 font-semibold gap-1.5" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-full h-11 font-semibold">Log in</Button></Link>
                <Link to="/signup" onClick={() => setOpen(false)}><Button className="w-full rounded-full h-11 font-semibold gap-1.5">Register <ArrowRight className="h-4 w-4" /></Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
