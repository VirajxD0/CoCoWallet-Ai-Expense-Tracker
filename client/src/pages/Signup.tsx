import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/Logo'
import logo from '@/assets/icons/CoCoWalletLogo-512.png'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck, Check, Gift, Home, Star } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 chars').regex(/[A-Z]/, 'Uppercase required').regex(/[a-z]/, 'Lowercase required').regex(/[0-9]/, 'Number required'),
})
type Form = z.infer<typeof schema>

export default function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })
  const onSubmit = async (data: Form) => {
    setError('')
    try {
      await authApi.signup(data)
      navigate('/login', { state: { justRegistered: true } })
    } catch (e:any) { setError(e.response?.data?.message || e.response?.data?.errors?.[0]?.message || 'Signup failed') }
  }
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* LEFT — Panda brand */}
      <div className="hidden lg:flex lg:w-[54%] relative overflow-hidden gradient-navy text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-accent/20 blur-[90px]" />
          <div className="absolute -bottom-32 -left-32 w-[650px] h-[650px] rounded-full bg-gold/15 blur-[90px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        </div>
        <img src={logo} alt="" aria-hidden className="absolute right-[-70px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] object-cover rounded-full opacity-[0.06] pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col w-full p-8 xl:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group">
            <span className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors"><Home className="h-4 w-4" /></span>
            Back to Website
          </Link>

          <div className="flex-1 flex flex-col justify-center py-6 max-w-[560px] mx-auto w-full">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold tracking-widest backdrop-blur w-fit">
              <Gift className="h-3.5 w-3.5 text-gold" /> FREE FOREVER • NO CREDIT CARD
            </div>

            <div className="relative mt-6 mb-6">
              <img src={logo} alt="CoCo panda" className="h-[132px] w-[132px] rounded-full object-cover border-[5px] border-white/20 shadow-2xl animate-float" />
              <span className="absolute -bottom-1 left-[88px] bg-gold text-gold-foreground rounded-full px-3 py-1 text-xs font-extrabold shadow-lg border border-white/50">🎉 Join 10k+</span>
            </div>

            <h1 className="font-display font-extrabold text-[36px] xl:text-[42px] leading-[0.95] tracking-tight">
              Start saving<br />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">with CoCo today</span>
            </h1>
            <p className="text-white/65 text-[15px] leading-7 mt-3">Create your wallet in 30 seconds. Auto-categorize, budget smart, chat with your money.</p>

            <div className="space-y-3 mt-6">
              {[
                { t: 'AI auto-categorization', d: '“Coffee at Starbucks” → Food & Dining in 0.8s, 98% accuracy' },
                { t: 'Smart budgets that work', d: 'Monthly limits, real-time bars, over-budget alerts' },
                { t: 'Chat with your money', d: '“How much on Swiggy last month?” — instant answer' },
              ].map(f=> (
                <div key={f.t} className="flex gap-3 rounded-2xl bg-white/[0.07] backdrop-blur border border-white/10 p-3">
                  <span className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3.5 w-3.5" /></span>
                  <div><p className="text-sm font-bold leading-none">{f.t}</p><p className="text-xs text-white/65 mt-1 leading-relaxed">{f.d}</p></div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white text-foreground p-4 flex items-center gap-3 shadow-xl">
              <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold">CoCo’s promise</p>
                <p className="text-xs text-muted-foreground">Your panda guards your coins. Bank-grade security.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/60 text-xs">
            <div className="flex -space-x-1.5">
              {[1,2,3,4].map(i=> <img key={i} src={`https://i.pravatar.cc/100?img=${i+12}`} alt="" className="h-6 w-6 rounded-full border-2 border-[#0f2a44] object-cover" />)}
            </div>
            <span>Trusted by <span className="font-bold text-white">10,000+</span> savers • <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-amber-400"/>4.9/5</span></span>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 gradient-mesh overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[80px]" />
          <div className="absolute -bottom-24 left-[5%] w-[600px] h-[600px] rounded-full bg-gold/10 blur-[85px]" />
          <img src={logo} alt="" aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] object-cover rounded-full opacity-[0.035] pointer-events-none select-none" />
        </div>

        <div className="lg:hidden w-full max-w-[440px] flex items-center justify-between mb-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <span className="h-8 w-8 rounded-full bg-white border shadow-sm flex items-center justify-center"><Home className="h-4 w-4" /></span> Home
          </Link>
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground bg-white border rounded-full px-3 py-1">Create account</span>
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          <div className="rounded-[28px] bg-white border shadow-premium overflow-hidden">
            <div className="px-7 sm:px-8 pt-7 pb-6 text-center border-b bg-gradient-to-b from-white to-secondary/20">
              <Link to="/" className="inline-flex"><Logo size={52} /></Link>
              <div className="mt-4">
                <h2 className="font-display font-extrabold text-[26px] tracking-tight leading-none">Create account</h2>
                <p className="text-sm text-muted-foreground mt-2">Start your journey with CoCoWallet — free forever</p>
              </div>
              <div className="lg:hidden flex justify-center mt-4">
                <img src={logo} alt="CoCo" className="h-[86px] w-[86px] rounded-full object-cover border-4 border-white shadow-glow" />
              </div>
            </div>

            <div className="px-7 sm:px-8 py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20"><span>⚠️</span><span>{error}</span></div>}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Ada Lovelace" {...register('name')} className="h-11 rounded-xl pl-10 bg-secondary/30 border-transparent focus:bg-white focus:border-input transition-colors" />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="h-11 rounded-xl pl-10 bg-secondary/30 border-transparent focus:bg-white focus:border-input transition-colors" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPw ? 'text':'password'} placeholder="••••••••" {...register('password')} className="h-11 rounded-xl pl-10 pr-10 bg-secondary/30 border-transparent focus:bg-white focus:border-input transition-colors" />
                    <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                      {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-3 w-3"/> 8+ chars, uppercase, lowercase, number</p>
                </div>

                <div className="flex items-start gap-2 text-xs leading-relaxed">
                  <input id="terms" type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-input" />
                  <label htmlFor="terms" className="font-medium text-muted-foreground">I agree to the <a href="#" className="underline hover:text-foreground">Terms</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>. CoCo never sells your data. 🐼</label>
                </div>

                <Button type="submit" className="w-full h-[46px] rounded-full shadow-premium text-[15px] font-bold gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : <>Create account <ArrowRight className="h-4 w-4" /></>}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="rounded-full h-11 font-semibold gap-2 bg-white"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-4 w-4"/> Google</Button>
                  <Button type="button" variant="outline" className="rounded-full h-11 font-semibold gap-2 bg-white"><img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="" className="h-4 w-4"/> GitHub</Button>
                </div>

                <p className="text-center text-sm text-muted-foreground pt-2">Already have account? <Link to="/login" className="text-primary hover:underline font-bold inline-flex items-center gap-1">Sign in <ArrowRight className="h-3.5 w-3.5"/></Link></p>
                <p className="text-center"><Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">← Back to home</Link></p>
              </form>

              <div className="mt-6 rounded-2xl bg-gold/15 border border-gold/20 p-3 flex gap-3">
                <div className="h-9 w-9 rounded-xl bg-gold text-gold-foreground flex items-center justify-center shrink-0"><Gift className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-bold leading-none">Free forever, setup in 30s</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">No credit card • Cancel anytime • Your panda guards your coins</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4 px-4 leading-relaxed">Protected by bank-grade security. Encrypted • Helmet • Rate-limited. 🐼</p>
        </div>
      </div>
    </div>
  )
}
