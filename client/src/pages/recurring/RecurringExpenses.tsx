import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recurringApi, budgetsApi } from '@/lib/api'
import { CategorySelect } from '@/components/expenses/CategorySelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Calendar, Play, Trash2, Pencil, Clock, Repeat, AlertTriangle, ChevronLeft, ChevronRight, Sparkles, Timer, Wallet } from 'lucide-react'

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const
const FREQ_COLOR: Record<string, string> = { daily: '#3b82f6', weekly: '#10b981', monthly: '#f59e0b', yearly: '#8b5cf6' }
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#3b82f6',
  'Transport': '#10b981',
  'Shopping': '#f59e0b',
  'Entertainment': '#ef4444',
  'Bills & Utilities': '#8b5cf6',
  'Health': '#06b6d4',
}
const FALLBACK = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']
function catColor(c: string){ if(CATEGORY_COLORS[c]) return CATEGORY_COLORS[c]; let h=0; for(let i=0;i<c.length;i++) h=(h*31+c.charCodeAt(i))|0; return FALLBACK[Math.abs(h)%FALLBACK.length] }

export default function RecurringExpenses() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any|null>(null)
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    notes: '',
  })
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['recurring', page],
    queryFn: async () => (await recurringApi.list({ page, limit, is_active: true })).data,
  })

  const { data: upcoming } = useQuery({
    queryKey: ['recurring', 'upcoming'],
    queryFn: async () => (await recurringApi.upcoming(30)).data.data,
  })

  const { data: budgetCategories } = useQuery({
    queryKey: ['budgetCategories'],
    queryFn: async () => (await budgetsApi.categories()).data.data,
  })

  const createMut = useMutation({
    mutationFn: (d: any) => recurringApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setOpen(false); reset() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }: any) => recurringApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setOpen(false); setEditing(null); reset() },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => recurringApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
  const runMut = useMutation({
    mutationFn: (id: string) => recurringApi.run(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  })

  const reset = () => {
    setForm({ amount: '', description: '', category: '', frequency: 'monthly', start_date: new Date().toISOString().slice(0, 10), end_date: '', notes: '' })
    setEditing(null)
  }
  const openEdit = (e: any) => {
    setEditing(e)
    setForm({ amount: String(e.amount), description: e.description, category: e.category || '', frequency: e.frequency, start_date: e.start_date, end_date: e.end_date || '', notes: e.notes || '' })
    setOpen(true)
  }
  const handleSubmit = () => {
    const payload = {
      amount: Number(form.amount),
      description: form.description,
      category: form.category || undefined,
      frequency: form.frequency,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      notes: form.notes || undefined,
    }
    if (editing) updateMut.mutate({ id: editing.id, d: payload })
    else createMut.mutate(payload)
  }

  const list = (data as any)?.recurring || []
  const meta = (data as any)?.meta || { total: 0, totalPages: 0, page: 1 }
  const up = (upcoming as any) || []
  const cats = (budgetCategories as string[]) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1><p className="text-muted-foreground text-sm">Automate subscriptions & regular payments</p></div>
        <Button className="rounded-full shadow-premium gap-2" onClick={() => { reset(); setOpen(true) }}><Plus className="h-4 w-4"/>Add Recurring</Button>
      </div>

      {up.length > 0 && (
        <Card className="rounded-[20px] overflow-hidden border shadow-sm">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-accent/10 via-primary/5 to-gold/10">
            <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-accent"/> Upcoming <span className="text-muted-foreground font-normal">(next 30 days)</span> <span className="ml-2 inline-flex items-center rounded-full bg-accent text-white px-2.5 py-0.5 text-xs font-bold">{up.length}</span></CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/50">
              {up.map((u: any) => {
                const overdue = u.days_until_next <= 0
                const soon = u.days_until_next > 0 && u.days_until_next <= 3
                const color = overdue ? '#ef4444' : soon ? '#f59e0b' : '#06b6d4'
                const badge = overdue ? 'Due today' : u.days_until_next === 1 ? 'Tomorrow' : `In ${u.days_until_next} days`
                const catC = catColor(u.expense_preview.category || 'Other')
                return (
                  <div key={u.recurring.id} className="group relative flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{background: color}} />
                    <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 border" style={{background: `${color}14`, color, borderColor: `${color}20`}}>
                      {overdue ? <AlertTriangle className="h-4 w-4"/> : <Calendar className="h-4 w-4"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] truncate">{u.expense_preview.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1">{formatDate(u.expense_preview.date)} <span className="h-1 w-1 rounded-full bg-muted-foreground/30"/> <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold" style={{background:`${catC}10`, color:catC, borderColor:`${catC}20`}}>{u.expense_preview.category || 'Uncategorized'}</span></span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold border ${overdue ? 'bg-destructive text-white border-destructive' : soon ? 'bg-amber-500 text-white border-amber-500' : 'bg-accent/10 text-accent border-accent/20'}`}>{badge}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[15px]">{formatCurrency(u.expense_preview.amount)}</p>
                      <p className="text-[11px] text-muted-foreground">{u.recurring.frequency}</p>
                    </div>
                    {overdue && <Button size="sm" className="rounded-full gap-1.5 shadow-sm" style={{background: color}} onClick={() => runMut.mutate(u.recurring.id)} disabled={runMut.isPending}><Play className="h-3.5 w-3.5"/>Run Now</Button>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[20px] overflow-hidden">
        <CardHeader className="pb-3 border-b bg-gradient-to-b from-white to-muted/20">
          <CardTitle className="flex items-center gap-2 text-base"><Repeat className="h-4 w-4 text-primary"/> All Recurring <span className="ml-2 inline-flex items-center rounded-full bg-primary text-white px-2.5 py-0.5 text-xs font-bold">{meta.total}</span></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : list.length ? (
            <div className="divide-y divide-border/50">
              {list.map((r: any) => {
                const fColor = FREQ_COLOR[r.frequency] || '#64748b'
                const cColor = r.category ? catColor(r.category) : '#94a3b8'
                const isOverdue = new Date(r.next_run_date) <= new Date(new Date().toISOString().slice(0,10))
                return (
                  <div key={r.id} className="group relative flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{background: fColor}} />
                    <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 border" style={{background: r.is_active ? `${fColor}14` : '#f1f5f9', color: r.is_active ? fColor : '#64748b', borderColor: r.is_active ? `${fColor}20` : '#e2e8f0'}}>
                      <Repeat className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] truncate">{r.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold" style={{background:`${fColor}10`, color:fColor, borderColor:`${fColor}20`}}><Timer className="h-3 w-3 mr-1"/>{r.frequency}</span>
                        <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}><Calendar className="h-3 w-3"/> Next: {formatDate(r.next_run_date)} {isOverdue && <span className="bg-destructive text-white rounded-full px-1.5 py-0.5 text-[10px]">Due</span>}</span>
                        {r.end_date && <span>Ends: {formatDate(r.end_date)}</span>}
                        {r.category ? <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold" style={{background:`${cColor}10`, color:cColor, borderColor:`${cColor}20`}}>{r.category}</span> : <span className="text-muted-foreground">Uncategorized</span>}
                      </p>
                      {r.notes && <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1"><Sparkles className="h-3 w-3"/> {r.notes}</p>}
                    </div>
                    <div className="text-right hidden sm:block shrink-0">
                      <p className="font-extrabold text-[16px]">{formatCurrency(Number(r.amount))}</p>
                      <p className={`text-xs font-bold inline-flex rounded-full px-2 py-0.5 ${r.is_active ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>{r.is_active ? 'Active' : 'Paused'}</p>
                    </div>
                    <div className="sm:hidden text-right shrink-0">
                      <p className="font-extrabold">{formatCurrency(Number(r.amount))}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-white shadow-sm hover:bg-primary/90" onClick={() => runMut.mutate(r.id)} disabled={runMut.isPending} title="Run now"><Play className="h-3.5 w-3.5 fill-white"/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white border shadow-sm" onClick={() => openEdit(r)} title="Edit"><Pencil className="h-3.5 w-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white border shadow-sm hover:bg-destructive hover:text-white" onClick={() => { if (confirm('Delete this recurring expense?')) deleteMut.mutate(r.id) }} title="Delete"><Trash2 className="h-3.5 w-3.5"/></Button>
                    </div>
                    <div className="flex sm:hidden items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => runMut.mutate(r.id)}><Play className="h-3.5 w-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(r.id)}}><Trash2 className="h-3.5 w-3.5 text-destructive"/></Button>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <Button variant="outline" size="sm" className="rounded-full bg-white shadow-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4"/>Prev</Button>
                <span className="text-sm font-medium bg-white border rounded-full px-4 py-1.5 shadow-sm">Page {meta.page} of {meta.totalPages || 1}</span>
                <Button variant="outline" size="sm" className="rounded-full bg-white shadow-sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next<ChevronRight className="h-4 w-4"/></Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-muted flex items-center justify-center"><Wallet className="h-7 w-7 text-muted-foreground"/></div>
              <h3 className="font-semibold">No recurring expenses yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Automate your subscriptions and bills</p>
              <Button className="rounded-full mt-4" onClick={()=>{reset(); setOpen(true)}}><Plus className="h-4 w-4 mr-2"/>Add Recurring</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
        <DialogContent onClose={() => setOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Recurring Expense</DialogTitle>
            <DialogDescription>Set up automatic expense creation on a schedule</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" placeholder="25.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="h-11 rounded-xl"/></div>
            <div className="space-y-2"><Label>Description *</Label><Input placeholder="Netflix subscription" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-11 rounded-xl"/></div>
            <div className="space-y-2"><Label>Category</Label><CategorySelect value={form.category} onChange={c => setForm({ ...form, category: c })} categories={cats} placeholder="Select budget category" /></div>
            <div className="space-y-2"><Label>Frequency *</Label>
              <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="h-11 rounded-xl"/></div>
            <div className="space-y-2"><Label>End Date (optional)</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="h-11 rounded-xl"/></div>
            <div className="space-y-2"><Label>Notes</Label><Input placeholder="Monthly Netflix plan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="h-11 rounded-xl"/></div>
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
