import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi, aiApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Plus, Sparkles, Trash2, Pencil } from 'lucide-react'

export default function Budgets() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any|null>(null)
  const [form, setForm] = useState({ category:'', monthly_limit:'', month: new Date().toISOString().slice(0,7) })
  const [suggestions, setSuggestions] = useState<any[]|null>(null)
  const [suggestOpen, setSuggestOpen] = useState(false)

  const { data: budgets, isLoading } = useQuery({ queryKey:['budgets', month], queryFn: async()=> (await budgetsApi.spending(month)).data.data })
  const list = (budgets as any) || []

  const upsertMut = useMutation({ mutationFn: (d:any)=> budgetsApi.upsert(d), onSuccess:()=>{ qc.invalidateQueries({queryKey:['budgets']}); setOpen(false); setEditing(null); setForm({ category:'', monthly_limit:'', month })} })
  const updateMut = useMutation({ mutationFn: ({id,d}:any)=> budgetsApi.update(id,d), onSuccess:()=>{ qc.invalidateQueries({queryKey:['budgets']}); setOpen(false); setEditing(null)} })
  const deleteMut = useMutation({ mutationFn: (id:string)=> budgetsApi.remove(id), onSuccess:()=> qc.invalidateQueries({queryKey:['budgets']}) })

  const handleSubmit=()=>{
    const payload={ category: form.category, monthly_limit: Number(form.monthly_limit), month: form.month }
    if(editing) updateMut.mutate({id: editing.id, d:{ monthly_limit: payload.monthly_limit }}); else upsertMut.mutate(payload)
  }
  const handleSuggest= async()=>{
    const res = await aiApi.suggestBudgets(3)
    setSuggestions(res.data.data)
    setSuggestOpen(true)
  }
  const applyAll= async()=>{
    if(!suggestions) return
    for(const s of suggestions){ await budgetsApi.upsert({ category: s.category, monthly_limit: s.suggestedLimit, month }) }
    qc.invalidateQueries({queryKey:['budgets']}); setSuggestOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Budgets</h1><p className="text-muted-foreground text-sm">Track spending vs limits</p></div>
        <div className="flex gap-2">
          <Input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="w-40"/>
          <Button variant="secondary" onClick={handleSuggest}><Sparkles className="h-4 w-4 mr-2"/>AI Suggest</Button>
          <Button onClick={()=>{setEditing(null); setForm({ category:'', monthly_limit:'', month }); setOpen(true)}}><Plus className="h-4 w-4 mr-2"/>New</Button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : list.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((b:any)=>(
            <Card key={b.id} className={b.status==='over' ? 'border-destructive/50' : b.status==='warning' ? 'border-amber-500/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start"><CardTitle className="text-base">{b.category}</CardTitle>
                <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>{setEditing(b); setForm({ category:b.category, monthly_limit:String(b.monthly_limit), month:b.month }); setOpen(true)}}><Pencil className="h-3 w-3"/></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>{ if(confirm('Delete budget?')) deleteMut.mutate(b.id)}}><Trash2 className="h-3 w-3 text-destructive"/></Button></div>
                </div>
                <CardDescription>{b.month} • {b.status==='over' ? 'Over budget' : b.status==='warning' ? 'Near limit' : 'On track'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Spent</span><span className="font-semibold">{formatCurrency(b.spent)} / {formatCurrency(b.monthly_limit)}</span></div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.status==='over' ? 'bg-destructive' : b.status==='warning' ? 'bg-amber-500' : 'bg-primary'}`} style={{width:`${Math.min(b.percentage,100)}%`}}/></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>{b.percentage.toFixed(0)}% used</span><span className={b.remaining<0 ? 'text-destructive': 'text-emerald-600'}>{formatCurrency(b.remaining)} {b.remaining>=0 ? 'left' : 'over'}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground mb-4">No budgets for {month}</p><Button onClick={()=>setOpen(true)}>Create first budget</Button></CardContent></Card>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={()=>setOpen(false)}>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Budget</DialogTitle><DialogDescription>Set monthly limit for a category</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Category</Label><Input placeholder="Food & Dining" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} disabled={!!editing}/></div>
            <div className="space-y-2"><Label>Monthly Limit</Label><Input type="number" placeholder="500" value={form.monthly_limit} onChange={e=>setForm({...form, monthly_limit:e.target.value})}/></div>
            <div className="space-y-2"><Label>Month</Label><Input type="month" value={form.month} onChange={e=>setForm({...form, month:e.target.value})} disabled={!!editing}/></div>
            <Button className="w-full" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent onClose={()=>setSuggestOpen(false)} className="max-w-lg">
          <DialogHeader><DialogTitle>AI Budget Suggestions</DialogTitle><DialogDescription>Based on last 3 months spending</DialogDescription></DialogHeader>
          <div className="space-y-3 max-h-80 overflow-auto">
            {suggestions?.length ? suggestions.map((s:any)=>(
              <div key={s.category} className="p-3 border rounded-lg">
                <div className="flex justify-between"><span className="font-medium">{s.category}</span><span className="font-bold">{formatCurrency(s.suggestedLimit)}</span></div>
                <p className="text-xs text-muted-foreground">{s.reasoning} • avg {formatCurrency(s.averageMonthlySpend)}/mo</p>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No suggestions — add more expense history first</p>}
          </div>
          {suggestions?.length ? <Button className="w-full" onClick={applyAll}>Apply all to {month}</Button> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
