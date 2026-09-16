import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/Logo'
import { Navbar } from '@/components/marketing/Navbar'
import logo from '@/assets/icons/CoCoWalletLogo-512.png'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Check, Home, Copy, FlaskConical, KeyRound } from 'lucide-react'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type Form = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const justRegistered = !!location.state?.justRegistered
  const setAuth = useAuthStore(s=>s.setAuth)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const { register, handleSubmit, setValue, formState:{ errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })
  const TEST_EMAIL = 'deshmukhviraj654@gmail.com'
  const TEST_PASS = 'Test@1234'
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(null), 1500) } catch {}
  }
  const fillTest = () => { setValue('email', TEST_EMAIL); setValue('password', TEST_PASS) }
  const onSubmit = async (data: Form) => {
    setError('')
    try {
      const res = await authApi.login(data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens.accessToken, tokens.refreshToken)
      navigate('/dashboard')
    } catch (e:any) { setError(e.response?.data?.message || 'Login failed') }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* LEFT — Panda brand (desktop) */}
      <div className="hidden lg:flex lg:w-[54%] relative overflow-hidden gradient-navy text-white">
        {/* pattern & glows */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-accent/20 blur-[90px]" />
          <div className="absolute -bottom-32 -left-32 w-[650px] h-[650px] rounded-full bg-gold/15 blur-[90px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        </div>
        {/* faint panda watermark */}
        <img src={logo} alt="" aria-hidden className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] object-cover rounded-full opacity-[0.06] blur-[1px] pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col w-full p-8 xl:p-10">
          {/* top nav */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group">
            <span className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors"><Home className="h-4 w-4" /></span>
            Back to Website
          </Link>

          <div className="flex-1 flex flex-col justify-center py-8 max-w-[520px] mx-auto w-full">
            {/* panda hero */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-full bg-white/10 blur-2xl" />
              <img src={logo} alt="CoCo panda" className="relative h-[148px] w-[148px] rounded-full object-cover border-[5px] border-white/20 shadow-2xl animate-float" />
              <span className="absolute bottom-1 left-[112px] bg-white text-primary rounded-full px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 border">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> CoCo is online
              </span>
            </div>

            <h1 className="font-display font-extrabold text-[38px] xl:text-[44px] leading-[0.95] tracking-tight">
              Welcome back,<br />
              <span className="text-white/90">CoCo missed you</span> <span className="inline-block animate-float">🐼</span>
            </h1>
            <p className="text-white/65 text-[15px] leading-7 mt-4">Sign in to see what you saved, where you splurged, and what CoCo thinks you should do next.</p>

            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { v: '₹4,200', l: 'saved this week' },
                { v: '98%', l: 'AI accuracy' },
                { v: '<1s', l: 'answers' },
              ].map(s=> (
                <div key={s.l} className="rounded-2xl bg-white/[0.08] backdrop-blur border border-white/10 p-3 text-center">
                  <p className="font-display font-extrabold text-lg">{s.v}</p>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-white/60">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Bank-grade security</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5"><Check className="h-3.5 w-3.5 text-emerald-300" /> No spam, ever</span>
            </div>
          </div>

          <p className="text-xs text-white/40">© {new Date().getFullYear()} CoCoWallet • AI Expense Tracker • Made with 💛 for savers</p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 gradient-mesh overflow-hidden">
        {/* bg glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[80px]" />
          <div className="absolute -bottom-24 left-[5%] w-[600px] h-[600px] rounded-full bg-gold/10 blur-[85px]" />
          <img src={logo} alt="" aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] object-cover rounded-full opacity-[0.035] pointer-events-none select-none" />
        </div>

        {/* mobile top */}
        <div className="lg:hidden w-full max-w-[440px] flex items-center justify-between mb-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <span className="h-8 w-8 rounded-full bg-white border shadow-sm flex items-center justify-center"><Home className="h-4 w-4" /></span> Home
          </Link>
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground bg-white border rounded-full px-3 py-1">Welcome back</span>
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          <div className="rounded-[28px] bg-white border shadow-premium overflow-hidden">
            {/* header */}
            <div className="px-7 sm:px-8 pt-7 pb-6 text-center border-b bg-gradient-to-b from-white to-secondary/20">
              <Link to="/" className="inline-flex">
                <Logo size={54} />
              </Link>
              <div className="mt-4">
                <h2 className="font-display font-extrabold text-[26px] tracking-tight leading-none">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-2">Sign in to continue to CoCoWallet</p>
              </div>
              {/* panda mini for mobile */}
              <div className="lg:hidden flex justify-center mt-4">
                <img src={logo} alt="CoCo" className="h-[86px] w-[86px] rounded-full object-cover border-4 border-white shadow-glow" />
              </div>
            </div>

            <div className="px-7 sm:px-8 py-6">
              {/* Test credentials */}
              <div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-800">
                    <span className="h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center"><FlaskConical className="h-3.5 w-3.5" /></span>
                    For testing — use below
                  </span>
                  <button type="button" onClick={fillTest} className="text-xs font-bold text-primary hover:text-primary/80 bg-white border border-amber-200 rounded-full px-3 py-1 shadow-sm hover:shadow transition-all">Fill →</button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-white border border-amber-200/70 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Mail className="h-3.5 w-3.5 text-primary" /></span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground leading-none">Email</p>
                        <p className="text-sm font-semibold truncate">{TEST_EMAIL}</p>
                      </div>
                    </div>
                    <button type="button" onClick={()=>copy(TEST_EMAIL, 'email')} className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center shrink-0 transition-colors" aria-label="Copy email">
                      {copied==='email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-white border border-amber-200/70 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0"><KeyRound className="h-3.5 w-3.5 text-amber-700" /></span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground leading-none">Password</p>
                        <p className="text-sm font-semibold truncate font-mono">{TEST_PASS}</p>
                      </div>
                    </div>
                    <button type="button" onClick={()=>copy(TEST_PASS, 'pass')} className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center shrink-0 transition-colors" aria-label="Copy password">
                      {copied==='pass' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {justRegistered && !error && <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200"><span className="mt-0.5">✓</span><span>Account created successfully — please sign in.</span></div>}
                {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20"><span className="mt-0.5">⚠️</span><span>{error}</span></div>}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="h-11 rounded-xl pl-10 bg-secondary/30 border-transparent focus:bg-white focus:border-input transition-colors" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPw ? 'text':'password'} placeholder="••••••••" {...register('password')} className="h-11 rounded-xl pl-10 pr-10 bg-secondary/30 border-transparent focus:bg-white focus:border-input transition-colors" />
                    <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                      {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input id="remember" type="checkbox" className="h-4 w-4 rounded border-input" />
                  <label htmlFor="remember" className="font-medium text-muted-foreground">Remember me for 30 days</label>
                  <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-semibold"><ShieldCheck className="h-3.5 w-3.5"/> Secure</span>
                </div>

                <Button type="submit" className="w-full h-[46px] rounded-full shadow-premium text-[15px] font-bold gap-2 mt-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="rounded-full h-11 font-semibold gap-2 bg-white"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-4 w-4"/> Google</Button>
                  <Button type="button" variant="outline" className="rounded-full h-11 font-semibold gap-2 bg-white"><img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="" className="h-4 w-4"/> GitHub</Button>
                </div>

                <p className="text-center text-sm text-muted-foreground pt-2">No account? <Link to="/signup" className="text-primary hover:underline font-bold inline-flex items-center gap-1">Create account <ArrowRight className="h-3.5 w-3.5"/></Link></p>
                <p className="text-center"><Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">← Back to home</Link></p>
              </form>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-4 px-4 leading-relaxed">By signing in you agree to our <a href="#" className="underline hover:text-foreground">Terms</a> & <a href="#" className="underline hover:text-foreground">Privacy</a>. CoCo never sells your data. 🐼</p>
        </div>
      </div>
      </div>
    </div>
  )
}
