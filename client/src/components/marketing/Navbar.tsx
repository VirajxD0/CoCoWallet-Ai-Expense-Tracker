import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useAuthStore } from '@/stores/authStore'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'AI', href: '#ai' },
    { label: 'Security', href: '#security' },
  ]

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ${scrolled ? 'bg-white/85 shadow-premium border-transparent' : 'bg-white/70'}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo size={42} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" className="rounded-full px-5 font-semibold">Log in</Button></Link>
          <Link to="/signup"><Button className="rounded-full px-5 shadow-premium font-semibold gap-1.5">Register <ArrowRight className="h-4 w-4" /></Button></Link>
          {isAuthenticated && (
            <Link to="/dashboard"><Button variant="outline" className="rounded-full px-5 font-semibold gap-1.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><LayoutDashboard className="h-4 w-4" /> Go to Dashboard</Button></Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2.5 rounded-xl bg-secondary">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl text-[15px] font-medium hover:bg-secondary">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-full h-11 font-semibold">Log in</Button></Link>
            <Link to="/signup" onClick={() => setOpen(false)}><Button className="w-full rounded-full h-11 font-semibold gap-1.5">Register <ArrowRight className="h-4 w-4" /></Button></Link>
            {isAuthenticated && (
              <Link to="/dashboard" onClick={() => setOpen(false)}><Button variant="secondary" className="w-full rounded-full h-11 font-semibold gap-1.5"><LayoutDashboard className="h-4 w-4" /> Go to Dashboard</Button></Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
