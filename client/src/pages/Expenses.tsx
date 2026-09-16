import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi, budgetsApi, aiApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CategorySelect } from '@/components/expenses/CategorySelect'
import { Plus, Search, Trash2, Pencil, Sparkles, Upload, ChevronLeft, ChevronRight, Receipt, Tag, Calendar, Wallet } from 'lucide-react'
import Papa from 'papaparse'

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#3b82f6',
  'Transport': '#10b981',
  'Shopping': '#f59e0b',
  'Entertainment': '#ef4444',
  'Bills & Utilities': '#8b5cf6',
  'Health': '#06b6d4',
  'Travel': '#6366f1',
  'Savings': '#84cc16',
}
const FALLBACK_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#6366f1']
function getCategoryColor(cat: string) {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat]
  let h = 0; for (let i=0;i<cat.length;i++) h = (h*31 + cat.charCodeAt(i))|0
  return FALLBACK_COLORS[Math.abs(h)%FALLBACK_COLORS.length]
}

export default function Expenses() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any|null>(null)
  const [form, setForm] = useState({ amount:'', description:'', category:'', date: new Date().toISOString().slice(0,10) })
  const [aiCat, setAiCat] = useState<any|null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<any[]>([])
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey:['expenses', page, search, category],
    queryFn: async()=> (await expensesApi.list({ page, limit, search: search||undefined, category: category||undefined, sortBy:'date', sortOrder:'desc' })).data
  })
  const { data: budgetCategories } = useQuery({ queryKey:['budgetCategories'], queryFn: async()=> (await budgetsApi.categories()).data.data })

  const createMut = useMutation({ mutationFn: (d:any)=> expensesApi.create(d), onSuccess:()=>{ qc.invalidateQueries({queryKey:['expenses']}); qc.invalidateQueries({queryKey:['stats']}); setOpen(false); reset() } })
  const updateMut = useMutation({ mutationFn: ({id,d}:any)=> expensesApi.update(id,d), onSuccess:()=>{ qc.invalidateQueries({queryKey:['expenses']}); setOpen(false); setEditing(null); reset() } })
  const deleteMut = useMutation({ mutationFn: (id:string)=> expensesApi.remove(id), onSuccess:()=> qc.invalidateQueries({queryKey:['expenses']}) })
  const bulkMut = useMutation({ mutationFn: (rows:any[])=> expensesApi.import(rows), onSuccess:()=>{ qc.invalidateQueries({queryKey:['expenses']}); setImportOpen(false); setImportRows([]) } })

  const reset=()=>{ setForm({ amount:'', description:'', category:'', date: new Date().toISOString().slice(0,10) }); setEditing(null); setAiCat(null) }
  const openEdit=(e:any)=>{ setEditing(e); setForm({ amount:String(e.amount), description:e.description, category:e.category||'', date:e.date.slice(0,10)}); setOpen(true) }
  const handleSubmit=()=> {
    const payload={ amount:Number(form.amount), description:form.description, category: form.category||undefined, date: form.date }
    if(editing) updateMut.mutate({id: editing.id, d: payload}); else createMut.mutate(payload)
  }
  const handleAiCategorize= async()=>{
    if(!form.description) return
    const res = await aiApi.categorize({ description: form.description, amount: form.amount ? Number(form.amount) : undefined })
    setAiCat(res.data.data)
    setForm(f=>({...f, category: res.data.data.category}))
  }
  const onFile=(e:any)=>{
    const file=e.target.files?.[0]; if(!file) return
    Papa.parse(file, { header:true, complete:(r)=>{
      const rows = r.data.map((row:any)=> ({ amount:Number(row.amount), description: row.description, category: row.category || undefined, date: row.date || undefined })).filter((x:any)=> x.amount && x.description)
      setImportRows(rows.slice(0,1000))
    }})
  }

  const list = (data as any)?.data || []
  const meta = (data as any)?.meta || { total:0, totalPages:0, page:1 }
  const cats = (budgetCategories as string[]) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Expenses</h1><p className="text-muted-foreground text-sm">Track every rupee, beautifully</p></div>
        <div className="flex gap-2"><Button variant="outline" className="rounded-full bg-white shadow-sm" onClick={()=>setImportOpen(true)}><Upload className="h-4 w-4 mr-2"/>Import CSV</Button><Button className="rounded-full shadow-premium gap-2" onClick={()=>{reset(); setOpen(true)}}><Plus className="h-4 w-4"/>Add Expense</Button></div>
      </div>

      <Card className="rounded-[20px] border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search description or category..." className="pl-10 h-11 rounded-full bg-muted/40 border-0 focus:bg-white focus:ring-2 focus:ring-primary/10" value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}}/>
            </div>
            <div className="flex items-center gap-2 sm:w-auto w-full">
              <div className="relative flex-1 sm:flex-none">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"/>
                <select className="h-11 rounded-full border-0 bg-muted/40 pl-9 pr-8 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none appearance-none w-full sm:w-[180px]" value={category} onChange={e=>{setCategory(e.target.value); setPage(1)}}>
                  <option value="">All categories</option>
                  {cats.map((c:string)=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {category && <Button variant="ghost" size="sm" className="rounded-full h-11 px-4 whitespace-nowrap" onClick={()=>{setCategory(''); setPage(1)}}>Clear</Button>}
            </div>
          </div>
          {meta.total > 0 && <p className="text-xs text-muted-foreground mt-3 px-1">{meta.total} total • {list.length} shown {category ? `• filtered by ${category}` : ''} {search ? `• search "${search}"` : ''}</p>}
        </CardContent>
      </Card>

      <Card className="rounded-[20px] overflow-hidden">
        <CardHeader className="pb-3 border-b bg-gradient-to-b from-white to-muted/20">
          <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4 text-primary"/> Expenses <span className="ml-2 inline-flex items-center rounded-full bg-primary text-white px-2.5 py-0.5 text-xs font-bold">{meta.total}</span></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : list.length ? (
            <div className="divide-y divide-border/50">
              {list.map((e:any)=>{
                const color = e.category ? getCategoryColor(e.category) : '#94a3b8'
                const initial = (e.category || e.description || '?')[0].toUpperCase()
                return (
                  <div key={e.id} className="group relative flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{background: color}} />
                    <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 border text-sm font-bold" style={{background: `${color}14`, color, borderColor: `${color}20`}}>{initial}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] truncate leading-tight">{e.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3"/> {formatDate(e.date)}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30"/>
                        {e.category ? <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold" style={{background: `${color}0f`, color, borderColor: `${color}20`}}>{e.category}</span> : <span className="text-muted-foreground">Uncategorized</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[16px] tracking-tight">{formatCurrency(Number(e.amount))}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Spent</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white border shadow-sm hover:bg-muted" onClick={()=>openEdit(e)} title="Edit"><Pencil className="h-3.5 w-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white border shadow-sm hover:bg-destructive/10 hover:text-destructive" onClick={()=>{ if(confirm('Delete?')) deleteMut.mutate(e.id)}} title="Delete"><Trash2 className="h-3.5 w-3.5"/></Button>
                    </div>
                    <div className="flex items-center gap-1 sm:hidden opacity-100">
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={()=>openEdit(e)}><Pencil className="h-3.5 w-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={()=>{ if(confirm('Delete?')) deleteMut.mutate(e.id)}}><Trash2 className="h-3.5 w-3.5 text-destructive"/></Button>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <Button variant="outline" size="sm" className="rounded-full bg-white" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="h-4 w-4"/>Prev</Button>
                <span className="text-sm font-medium bg-white border rounded-full px-4 py-1.5 shadow-sm">Page {meta.page} of {meta.totalPages || 1}</span>
                <Button variant="outline" size="sm" className="rounded-full bg-white" disabled={page>=meta.totalPages} onClick={()=>setPage(p=>p+1)}>Next<ChevronRight className="h-4 w-4"/></Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-muted flex items-center justify-center"><Receipt className="h-7 w-7 text-muted-foreground"/></div>
              <h3 className="font-semibold">No expenses found</h3>
              <p className="text-sm text-muted-foreground mt-1">Add your first expense or import a CSV</p>
              <Button className="rounded-full mt-4" onClick={()=>{reset(); setOpen(true)}}><Plus className="h-4 w-4 mr-2"/>Add Expense</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset()}}>
        <DialogContent onClose={()=>setOpen(false)}>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Expense</DialogTitle><DialogDescription>AI can auto-categorize your expense</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" placeholder="25.00" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} className="h-11 rounded-xl"/></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Coffee at Starbucks" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="rounded-xl"/><Button type="button" variant="secondary" size="sm" onClick={handleAiCategorize} className="w-full rounded-full"><Sparkles className="h-3 w-3 mr-1"/> AI Categorize</Button>{aiCat && <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs"><span className="font-bold" style={{color: getCategoryColor(aiCat.category)}}>{aiCat.category}</span> <span className="ml-1 bg-white border rounded-full px-2 py-0.5">{(aiCat.confidence*100).toFixed(0)}%</span><p className="text-muted-foreground mt-1">{aiCat.reasoning}</p></div>}</div>
            <div className="space-y-2"><Label>Category</Label><CategorySelect value={form.category} onChange={c=>setForm({...form, category:c})} categories={cats} placeholder="Select category"/></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="h-11 rounded-xl"/></div>
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent onClose={()=>setImportOpen(false)} className="max-w-2xl">
          <DialogHeader><DialogTitle>Bulk Import CSV</DialogTitle><DialogDescription>Upload CSV with columns: amount, description, category, date (YYYY-MM-DD). Max 1000 rows.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept=".csv" onChange={onFile} className="rounded-xl"/>
            {importRows.length>0 && <div className="max-h-64 overflow-auto border rounded-xl p-3 text-xs bg-muted/20"><p className="font-semibold mb-2">{importRows.length} rows preview (first 5):</p><div className="space-y-1">{importRows.slice(0,5).map((r,i)=><div key={i} className="flex justify-between bg-white border rounded-lg px-3 py-2"><span className="truncate">{r.description}</span><span className="font-bold">{formatCurrency(r.amount)}</span></div>)}</div></div>}
            <Button className="w-full rounded-full h-11" disabled={!importRows.length || bulkMut.isPending} onClick={()=>bulkMut.mutate(importRows)}>{bulkMut.isPending ? 'Importing...' : `Import ${importRows.length} expenses`}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
