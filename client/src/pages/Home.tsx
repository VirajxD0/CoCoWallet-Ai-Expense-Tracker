import { Link } from 'react-router-dom'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { LogoMark } from '@/components/brand/Logo'
import logo from '@/assets/icons/CoCoWalletLogo-512.png'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Sparkles,
  Receipt,
  Wallet,
  BarChart3,
  ShieldCheck,
  Upload,
  MessageCircle,
  PiggyBank,
  TrendingUp,
  Check,
  Zap,
  Bot,
  LineChart,
  ArrowUpRight,
  Star,
  Play,
  Quote,
  Layers,
  Lock,
  Globe,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden gradient-mesh">
        {/* glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-[10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[80px]" />
          <div className="absolute top-[30%] -left-24 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[90px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-t from-primary/[0.04] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* left */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm text-xs font-semibold tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                AI POWERED BY GEMINI 2.0 FLASH
                <span className="hidden sm:inline-flex ml-1 rounded-full bg-gold text-gold-foreground px-2 py-0.5 text-[10px]">NEW</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display font-extrabold tracking-tight text-[36px] sm:text-[48px] lg:text-[56px] leading-[0.95] text-balance">
                  Your money,
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">finally</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-gold/30 -rotate-1 -z-0 hidden lg:block" />
                  </span>{' '}
                  makes sense.
                </h1>
                <p className="text-[17px] leading-7 text-muted-foreground max-w-[560px] text-balance">
                  CoCoWallet is the AI expense tracker that auto-categorizes, budgets smart, and lets you <span className="font-semibold text-foreground">chat with your money</span> in plain English.
                  <span className="hidden sm:inline"> Built for India, designed for everywhere.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-[52px] px-8 text-[15px] font-bold shadow-premium gap-2">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-[52px] px-8 text-[15px] font-semibold gap-2 bg-white">
                    <Play className="h-4 w-4" /> See how it works
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 rounded-full bg-emerald-500 text-white p-0.5" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 rounded-full bg-emerald-500 text-white p-0.5" /> Free forever</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 rounded-full bg-emerald-500 text-white p-0.5" /> Bank-grade security</span>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t max-w-md">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i=> <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />)}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9/5 <span className="font-normal text-muted-foreground">from 2,000+ reviews</span></div>
                  <p className="text-xs text-muted-foreground">Trusted by 10,000+ smart savers</p>
                </div>
              </div>
            </div>

            {/* right — panda hero card */}
            <div className="relative lg:pl-8">
              {/* main card */}
              <div className="relative mx-auto w-full max-w-[520px]">
                <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-primary/20 via-accent/20 to-gold/20 blur-2xl" />
                <div className="relative rounded-[28px] bg-white border shadow-premium overflow-hidden">
                  {/* top bar */}
                  <div className="h-12 flex items-center justify-between px-5 border-b bg-gradient-to-r from-secondary/50 to-white">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE DASHBOARD</span>
                    <LogoMark size={28} />
                  </div>

                  <div className="p-6 sm:p-7 space-y-6">
                    {/* mascot row */}
                    <div className="flex gap-5 items-center">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent to-primary opacity-20 blur" />
                        <img src={logo} alt="CoCo panda" className="relative h-[88px] w-[88px] rounded-full object-cover border-4 border-white shadow-glow animate-float" />
                        <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-[0.12em] text-accent uppercase">CoCo says</p>
                        <p className="font-display font-bold text-[17px] leading-tight">“You saved ₹4,200 this week!” 🎉</p>
                        <p className="text-xs text-muted-foreground mt-1">AI insight • 2 minutes ago</p>
                      </div>
                    </div>

                    {/* mini stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Spent', value: '₹24,580', sub: 'this month', icon: Receipt, color: 'text-primary', bg: 'bg-secondary' },
                        { label: 'Saved', value: '₹8,420', sub: '+12%', icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Budgets', value: '3/4', sub: 'on track', icon: Wallet, color: 'text-accent', bg: 'bg-accent/10' },
                      ].map(s => (
                        <div key={s.label} className={`rounded-2xl border p-3 ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{s.label}</p>
                          <p className="font-bold text-[15px]">{s.value}</p>
                          <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* bars */}
                    <div className="space-y-3">
                      {[
                        { cat: 'Food & Dining', spent: 6200, limit: 8000, pct: 78, color: 'bg-primary' },
                        { cat: 'Transport', spent: 3200, limit: 5000, pct: 64, color: 'bg-accent' },
                        { cat: 'Shopping', spent: 4100, limit: 4000, pct: 102, color: 'bg-amber-500' },
                      ].map(b => (
                        <div key={b.cat} className="space-y-1.5">
                          <div className="flex justify-between text-xs"><span className="font-semibold">{b.cat}</span><span className={b.pct>100? 'text-destructive font-bold':'text-muted-foreground'}>₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}</span></div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.color}`} style={{ width: `${Math.min(b.pct,100)}%` }} /></div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-primary text-primary-foreground p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center"><MessageCircle className="h-5 w-5" /></div>
                        <div><p className="text-sm font-semibold">Ask CoCo anything</p><p className="text-xs text-white/70">“How much did I spend on coffee?”</p></div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 opacity-70" />
                    </div>
                  </div>
                </div>

                {/* floating badges */}
                <div className="hidden sm:flex absolute -left-6 top-[18%] bg-white border shadow-premium rounded-2xl px-3 py-2.5 items-center gap-2.5 animate-float">
                  <div className="h-8 w-8 rounded-xl gradient-teal flex items-center justify-center text-white"><Sparkles className="h-4 w-4" /></div>
                  <div><p className="text-xs font-bold">AI categorized</p><p className="text-[11px] text-muted-foreground">Starbucks → Food • 98%</p></div>
                </div>
                <div className="hidden sm:flex absolute -right-4 bottom-[22%] bg-white border shadow-premium rounded-2xl px-3 py-2.5 items-center gap-2.5 animate-float-slow">
                  <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-white"><Upload className="h-4 w-4" /></div>
                  <div><p className="text-xs font-bold">1,000 rows imported</p><p className="text-[11px] text-muted-foreground">CSV • 2.3s</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x-0 lg:divide-x">
            {[
              { k: '10,000+', v: 'active savers' },
              { k: '₹2.4Cr+', v: 'expenses tracked' },
              { k: '98.2%', v: 'AI accuracy' },
              { k: '< 800ms', v: 'avg. AI response' },
            ].map(s => (
              <div key={s.k} className="text-center lg:text-left lg:px-8 first:pl-0">
                <p className="font-display font-extrabold text-2xl tracking-tight">{s.k}</p>
                <p className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 lg:py-24 bg-muted/20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs font-bold tracking-widest">FEATURES</div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-balance">Everything you need to <span className="text-accent">master money</span></h2>
            <p className="text-muted-foreground">From AI categorization to natural language queries — CoCoWallet replaces 4 apps in one premium experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Auto-Categorization',
                desc: 'Describe any expense — “Coffee at Starbucks ₹450” — CoCo instantly tags it with 98% accuracy using Gemini 2.0 Flash.',
                accent: 'from-accent to-teal-400',
                badge: '12 categories',
              },
              {
                icon: Wallet,
                title: 'Smart Budgets',
                desc: 'Monthly limits per category with real-time progress, warnings & over-budget alerts. Upsert in one click.',
                accent: 'from-primary to-blue-700',
                badge: 'Real-time',
              },
              {
                icon: MessageCircle,
                title: 'Chat with your money',
                desc: 'Ask “How much did I spend on Swiggy last month?” — answers over your last 500 expenses instantly.',
                accent: 'from-gold to-amber-500',
                badge: 'Natural language',
              },
              {
                icon: BarChart3,
                title: 'Visual Insights',
                desc: 'Recharts-powered Bar + Pie, top categories, and spending trends. See where money actually goes.',
                accent: 'from-violet-600 to-indigo-500',
                badge: 'Recharts',
              },
              {
                icon: Upload,
                title: 'Bulk CSV Import',
                desc: 'Upload up to 1,000 expenses at once. PapaParse preview, validation, and one-tap import.',
                accent: 'from-emerald-600 to-teal-500',
                badge: '1,000 rows',
              },
              {
                icon: ShieldCheck,
                title: 'Secure by default',
                desc: 'JWT access+refresh rotation, bcrypt 12 rounds, Helmet, rate-limit & HttpOnly-ready. Your data stays yours.',
                accent: 'from-slate-800 to-slate-600',
                badge: 'Bank-grade',
              },
            ].map(f => (
              <div key={f.title} className="group relative rounded-[24px] bg-white border p-6 lg:p-7 shadow-premium hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white shadow-md mb-4`}><f.icon className="h-5 w-5" /></div>
                <div className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold tracking-wide mb-3">{f.badge}</div>
                <h3 className="font-bold text-[17px] leading-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-6">{f.desc}</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more <ArrowRight className="h-3.5 w-3.5 ml-1" /></div>
              </div>
            ))}
          </div>

          {/* secondary feature row */}
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            {[
              { icon: Layers, title: 'Pagination & Search', desc: 'Instant search, category/date filters, sort by date or amount.' },
              { icon: PiggyBank, title: 'Spending vs Limit', desc: 'Spent, remaining, percentage & status (under/warning/over).' },
              { icon: Zap, title: 'Auto-refresh', desc: 'Zustand + Axios interceptor — silent token refresh, never lose work.' },
            ].map(c => (
              <div key={c.title} className="rounded-2xl bg-white/70 backdrop-blur border px-5 py-5 flex gap-4">
                <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0"><c.icon className="h-4 w-4" /></div>
                <div><p className="font-semibold text-sm">{c.title}</p><p className="text-xs text-muted-foreground mt-1 leading-5">{c.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-widest">HOW IT WORKS</div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">From chaos to clarity in <span className="bg-gold px-2 rounded-lg">3 steps</span></h2>
              <p className="text-muted-foreground">No spreadsheets. No manual tagging. Just CoCo.</p>

              <div className="space-y-5 pt-2">
                {[
                  { n: '01', title: 'Add anything', desc: 'Type “Uber to airport ₹892” or upload a CSV with 1,000 rows. CoCo parses amount, date & description.', icon: Receipt },
                  { n: '02', title: 'CoCo categorizes', desc: 'Gemini 2.0 Flash tags it (Food, Transport, Shopping…) with reasoning & confidence. Edit or approve.', icon: Bot },
                  { n: '03', title: 'Budget & chat', desc: 'Set monthly limits, watch progress bars, then ask “Am I over on shopping?” — instant answer.', icon: LineChart },
                ].map(s => (
                  <div key={s.n} className="flex gap-4 group">
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold text-sm group-hover:scale-105 transition-transform">{s.n}</div>
                    <div className="flex-1 border rounded-2xl p-4 bg-white shadow-sm group-hover:shadow-premium transition-shadow">
                      <div className="flex items-center gap-2"><s.icon className="h-4 w-4 text-accent" /><h3 className="font-bold">{s.title}</h3></div>
                      <p className="text-sm text-muted-foreground mt-1 leading-6">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/signup"><Button className="rounded-full h-11 px-7 gap-2">Create your wallet <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-secondary via-white to-accent/10 rounded-[32px] blur-2xl" />
              <div className="relative rounded-[28px] bg-white border shadow-premium overflow-hidden">
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Live demo</h4>
                    <span className="text-xs rounded-full bg-emerald-500 text-white px-2.5 py-1 font-bold">● Tracking</span>
                  </div>

                  <div className="rounded-2xl border bg-muted/40 p-4 space-y-3">
                    <div className="flex gap-2">
                      <img src={logo} alt="CoCo" className="h-7 w-7 rounded-full object-cover shrink-0" />
                      <div className="rounded-2xl bg-white border px-3 py-2.5 text-sm shadow-sm flex-1">Add: “Dinner at Social ₹1,240 — team outing”</div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="rounded-2xl bg-primary text-primary-foreground px-3 py-2.5 text-sm max-w-[80%]">
                        <p className="font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Categorized: Food & Dining • 96%</p>
                        <p className="text-xs text-white/80 mt-1">Evening dining with colleagues → Food & Dining</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-2xl bg-white border px-3 py-2.5 text-sm shadow-sm">Suggest budgets for next month?</div>
                    </div>
                    <div className="rounded-2xl bg-gold/20 border border-gold/30 p-3">
                      <p className="text-xs font-bold flex items-center gap-1.5"><PiggyBank className="h-3.5 w-3.5" /> Suggested: Food ₹9,200 • Transport ₹5,500</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on your last 3 months avg.</p>
                      <Button size="sm" className="mt-2 rounded-full h-7 text-xs">Apply all</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border p-4 bg-gradient-to-br from-white to-secondary/40"><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Time saved</p><p className="font-display font-extrabold text-2xl">3.5h<span className="text-sm font-sans font-bold text-muted-foreground"> / month</span></p><p className="text-xs text-emerald-600 font-medium">vs manual sheets</p></div>
                    <div className="rounded-2xl border p-4 bg-primary text-primary-foreground"><p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Avg. categorize</p><p className="font-display font-extrabold text-2xl">0.8s</p><p className="text-xs text-white/70">Gemini 2.0 Flash</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI DARK */}
      <section id="ai" className="relative overflow-hidden gradient-navy text-white py-16 lg:py-20">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent/20 blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-gold/15 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold tracking-widest backdrop-blur">
              <Bot className="h-3.5 w-3.5" /> AI ASSISTANT • GEMINI 2.0 FLASH
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] leading-tight mt-4">Talk to your expenses like you talk to a friend.</h2>
            <p className="text-white/70 mt-4 text-[17px] leading-7 max-w-2xl">Three AI endpoints. One delightful experience. Strict JSON, low temperature, mocked in tests — deterministic when you need it, magical when you don’t.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {[
              { title: 'categorize', desc: '“Lunch at Truffles” → Food & Dining (97%) with reasoning. Falls back to Other, never hallucinates.', code: 'POST /ai/categorize\n{ description, amount? }', icon: Sparkles },
              { title: 'suggest-budgets', desc: 'Analyzes last N months avg spend per category → suggestedLimit + reasoning for each.', code: 'POST /ai/suggest-budgets\n{ months: 3 }', icon: PiggyBank },
              { title: 'query', desc: 'Natural language over last 500 expenses. “You spent ₹8,200 on Food vs ₹5,400 last month, up 52%.”', code: 'POST /ai/query\n{ query: "how much on coffee?" }', icon: MessageCircle },
            ].map(c => (
              <div key={c.title} className="rounded-[20px] bg-white/[0.06] backdrop-blur border border-white/10 p-6 hover:bg-white/[0.08] transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white text-primary flex items-center justify-center mb-4"><c.icon className="h-5 w-5" /></div>
                <h3 className="font-mono text-sm font-bold">/ai/{c.title}</h3>
                <p className="text-sm text-white/70 mt-2 leading-6">{c.desc}</p>
                <pre className="mt-4 rounded-xl bg-black/40 border border-white/10 p-3 text-[11px] font-mono leading-relaxed text-white/90 overflow-x-auto">{c.code}</pre>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[20px] bg-white text-foreground p-6 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-premium">
            <div className="flex-1">
              <p className="font-display font-extrabold text-xl">Try the AI Assistant now</p>
              <p className="text-sm text-muted-foreground mt-1">Categorize, get budget tips, or chat — no setup needed after login.</p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Link to="/login" className="flex-1 lg:flex-none"><Button variant="outline" className="w-full rounded-full">Log in</Button></Link>
              <Link to="/signup" className="flex-1 lg:flex-none"><Button className="w-full rounded-full gap-2">Try free <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-[28px] blur-xl" />
              <div className="relative rounded-[28px] border bg-white shadow-premium overflow-hidden">
                <div className="grid grid-cols-3 gap-3 p-5 border-b bg-muted/30">
                  {[
                    { label: 'Total Spent', value: '₹42,830', icon: Wallet },
                    { label: 'Transactions', value: '127', icon: Receipt },
                    { label: 'Budgets', value: '5', icon: PiggyBank },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-white border p-3">
                      <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                      <p className="font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 space-y-4">
                  <div className="h-32 rounded-2xl bg-gradient-to-br from-secondary to-white border flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(188_78%_41%/0.15),transparent_50%)]" />
                    <div className="flex items-end gap-2 relative">
                      {[35, 62, 48, 85, 58, 74, 42].map((h, i) => (
                        <div key={i} className="w-6 sm:w-8 rounded-t-lg bg-primary" style={{ height: h }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { d: 'Starbucks Reserve', a: '₹650', c: 'Food' },
                      { d: 'Uber Premium', a: '₹320', c: 'Transport' },
                      { d: 'Nike Store', a: '₹8,499', c: 'Shopping' },
                    ].map(r => (
                      <div key={r.d} className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50">
                        <div><p className="text-sm font-semibold">{r.d}</p><p className="text-xs text-muted-foreground">{r.c}</p></div>
                        <span className="font-bold text-sm">{r.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-widest">DASHBOARD</div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">A dashboard that <br /> <span className="text-primary">actually helps</span></h2>
              <p className="text-muted-foreground leading-7">Stats cards, top categories bar chart, spending split pie, budget-vs-actual with progress, and your 5 most recent expenses — all in one glance. No clutter.</p>
              <ul className="space-y-3">
                {['Top categories & split in Recharts', 'Budget progress with under / warning / over states', 'Recent 5 with search & filters'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm font-medium"><span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="h-3.5 w-3.5" /></span>{t}</li>
                ))}
              </ul>
              <div className="flex gap-3 pt-2">
                <Link to="/signup"><Button className="rounded-full px-7 h-11 gap-2">Start tracking <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link to="/login"><Button variant="outline" className="rounded-full px-7 h-11">See live demo</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-14 bg-muted/30 border-y">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-white border shadow-premium p-6 sm:p-8 lg:p-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold tracking-widest"><ShieldCheck className="h-3.5 w-3.5" /> SECURITY FIRST</div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">Your data is yours. Period.</h3>
              <p className="text-muted-foreground leading-7">We treat security like a feature, not an afterthought. From JWT rotation to Helmet, HPP, CORS and rate-limiting — CoCoWallet is built for production.</p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Lock, title: 'JWT rotation', desc: 'Access 15m + refresh 7d, revoke on logout' },
                  { icon: ShieldCheck, title: 'Bcrypt 12 rounds', desc: 'Passwords never touch logs' },
                  { icon: Globe, title: 'Helmet & CORS', desc: 'Hardened headers & origin control' },
                  { icon: Layers, title: 'Rate limit', desc: '100/15m general, 10/15m auth + slowdown' },
                ].map(f => (
                  <div key={f.title} className="flex gap-3 rounded-2xl bg-muted/50 p-3 border">
                    <f.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div><p className="text-sm font-semibold">{f.title}</p><p className="text-xs text-muted-foreground leading-5">{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[20px] bg-primary text-primary-foreground p-6 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center"><Lock className="h-5 w-5" /></div>
              <h4 className="font-bold text-lg">We never sell your data</h4>
              <p className="text-sm text-white/70 leading-6">No ads. No trackers. Your expenses stay in your Aiven MySQL, encrypted in transit. Export anytime, delete anytime.</p>
              <div className="rounded-xl bg-white/10 border border-white/10 p-3 flex items-center gap-3">
                <img src={logo} alt="" className="h-8 w-8 rounded-full object-cover" />
                <div className="text-sm"><p className="font-semibold">CoCo promise</p><p className="text-xs text-white/70">“Your panda guards your coins.”</p></div>
              </div>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">SOC2-ready architecture • Request ID tracing • Pino logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-secondary/40 border p-8 lg:p-10">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <Quote className="h-8 w-8 text-primary" />
                <p className="font-display font-bold text-xl sm:text-2xl leading-snug">“CoCoWallet saved me ₹18,000 in 2 months. The AI actually gets it — no more tagging Swiggy as ‘Other’.”</p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/100?img=32" alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div><p className="font-semibold text-sm">Ananya S.</p><p className="text-xs text-muted-foreground">Product designer, Bengaluru • Pro user since Jan 2025</p></div>
                  <div className="ml-auto hidden sm:flex gap-1">{[1,2,3,4,5].map(i=> <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:pl-6">
                {[
                  { v: '4.9/5', l: 'avg rating' },
                  { v: '2k+', l: 'reviews' },
                  { v: '10k+', l: 'users' },
                ].map(s=> <div key={s.v} className="rounded-2xl bg-white border p-4 text-center"><p className="font-display font-extrabold text-xl">{s.v}</p><p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">{s.l}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden gradient-navy p-8 sm:p-10 lg:p-12">
            <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-gold/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur">READY IN 30 SECONDS</div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white leading-tight">Start building better<br />money habits today.</h2>
                <p className="text-white/70 max-w-xl">Join 10,000+ people who finally love looking at their expenses. Free forever. No credit card.</p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/signup"><Button size="lg" className="rounded-full h-12 px-8 bg-white text-primary hover:bg-white/90 font-bold gap-2 shadow-xl">Create free account <ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link to="/login"><Button size="lg" variant="outline" className="rounded-full h-12 px-8 bg-transparent border-white/30 text-white hover:bg-white/10">Sign in</Button></Link>
                </div>
                <p className="text-xs text-white/50">By signing up you agree to our Terms & Privacy • Cancel anytime</p>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-full bg-white/20 blur-2xl" />
                  <img src={logo} alt="CoCo big" className="relative h-[200px] w-[200px] rounded-full object-cover border-4 border-white/20 shadow-2xl animate-float" />
                  <div className="absolute -bottom-2 -right-2 bg-gold text-gold-foreground rounded-full px-3 py-1.5 text-xs font-extrabold shadow-lg flex items-center gap-1.5">₹ Saved <span className="bg-white/20 rounded-full px-1.5">+12%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
