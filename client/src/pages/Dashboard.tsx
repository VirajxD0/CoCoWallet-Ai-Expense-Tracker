import { useQuery } from '@tanstack/react-query'
import { expensesApi, budgetsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, Wallet, Receipt, PiggyBank, ArrowUpRight, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey:['stats'], queryFn: async()=> (await expensesApi.stats()).data.data })
  const currentMonth = new Date().toISOString().slice(0,7)
  const { data: budgets } = useQuery({ queryKey:['budgets', currentMonth], queryFn: async()=> (await budgetsApi.spending(currentMonth)).data.data })
  const { data: recent } = useQuery({ queryKey:['recent'], queryFn: async()=> (await expensesApi.list({ limit:5, sortBy:'date', sortOrder:'desc' })).data.data })

  const s = stats as any
  const b = (budgets as any) || []
  const r = (recent as any) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your finances • {currentMonth}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Spent</CardTitle><Wallet className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(s?.totalSpent || 0)}</div><p className="text-xs text-muted-foreground">{s?.totalTransactions || 0} transactions • avg {formatCurrency(s?.averagePerTransaction || 0)}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Transactions</CardTitle><Receipt className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{s?.totalTransactions || 0}</div><p className="text-xs text-muted-foreground">all time</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Budgets</CardTitle><PiggyBank className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{b.length}</div><p className="text-xs text-muted-foreground">{b.filter((x:any)=>x.status==='over').length} over budget</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-primary-foreground">AI Insights</CardTitle><Sparkles className="h-4 w-4"/></CardHeader><CardContent><div className="text-sm">Ask natural questions about spending</div><Link to="/ai" className="text-xs underline mt-1 inline-flex items-center gap-1">Try AI <ArrowUpRight className="h-3 w-3"/></Link></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Top Categories</CardTitle><CardDescription>Spending by category</CardDescription></CardHeader><CardContent className="h-[280px]">
          {s?.topCategories?.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={s.topCategories.slice(0,6)}><XAxis dataKey="category" tick={{fontSize:11}} interval={0} angle={-15} textAnchor="end" height={60}/><YAxis tickFormatter={(v)=>`$${v}`}/><Tooltip formatter={(v:any)=>formatCurrency(Number(v))}/><Bar dataKey="total" radius={[6,6,0,0]} fill="#3b82f6"/></BarChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground text-center py-16">No data yet. Add expenses to see insights.</p>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Budget vs Actual</CardTitle><CardDescription>{currentMonth} • {b.length ? `${b.length} budgets` : 'No budgets set'}</CardDescription></CardHeader><CardContent className="space-y-3">
          {b.length ? b.slice(0,5).map((x:any)=> (
            <div key={x.id} className="space-y-1">
              <div className="flex justify-between text-sm"><span className="font-medium">{x.category}</span><span className={x.status==='over' ? 'text-destructive font-semibold' : 'text-muted-foreground'}>{formatCurrency(x.spent)} / {formatCurrency(x.monthly_limit)}</span></div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${x.status==='over' ? 'bg-destructive' : x.status==='warning' ? 'bg-amber-500' : 'bg-primary'}`} style={{width:`${Math.min(x.percentage,100)}%`}} /></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>{x.percentage.toFixed(0)}% used</span><span>{formatCurrency(x.remaining)} remaining</span></div>
            </div>
          )) : <div className="text-center py-10"><p className="text-sm text-muted-foreground mb-3">Create budgets to track spending</p><Link to="/budgets" className="text-sm text-primary hover:underline">Go to Budgets →</Link></div>}
        </CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2"><CardHeader className="flex-row items-center justify-between"><CardTitle>Recent Expenses</CardTitle><Link to="/expenses" className="text-sm text-primary hover:underline">View all</Link></CardHeader><CardContent>
          {r.length ? <div className="space-y-3">{r.map((e:any)=> <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"><div><p className="font-medium text-sm">{e.description}</p><p className="text-xs text-muted-foreground">{formatDate(e.date)} • {e.category || 'Uncategorized'}</p></div><span className="font-semibold">{formatCurrency(Number(e.amount))}</span></div>)}</div> : <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Category Split</CardTitle></CardHeader><CardContent className="h-[220px]">
          {s?.topCategories?.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={s.topCategories.slice(0,6)} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({name, percent})=>`${name} ${(percent*100).toFixed(0)}%`}>{s.topCategories.slice(0,6).map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(v:any)=>formatCurrency(Number(v))}/></PieChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground text-center py-16">No data</p>}
        </CardContent></Card>
      </div>
    </div>
  )
}
