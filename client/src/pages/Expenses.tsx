import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi, aiApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Trash2, Pencil, Sparkles, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import Papa from 'papaparse'

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
  const { data: categories } = useQuery({ queryKey:['categories'], queryFn: async()=> (await expensesApi.categories()).data.data })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Expenses</h1><p className="text-muted-foreground text-sm">Manage your spending</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={()=>setImportOpen(true)}><Upload className="h-4 w-4 mr-2"/>Import CSV</Button><Button onClick={()=>{reset(); setOpen(true)}}><Plus className="h-4 w-4 mr-2"/>Add Expense</Button></div>
      </div>

      <Card><CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search description or category..." className="pl-9" value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}}/></div>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={e=>{setCategory(e.target.value); setPage(1)}}>
            <option value="">All categories</option>
            {(categories as any)?.map((c:string)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </CardContent></Card>

      <Card>
        <CardHeader><CardTitle>Transactions <span className="text-muted-foreground font-normal text-sm">({meta.total} total)</span></CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : list.length ? (
            <div className="space-y-2">
              {list.map((e:any)=>(
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)} • {e.category ? <Badge variant="secondary">{e.category}</Badge> : <span>Uncategorized</span>}</p>
                  </div>
                  <span className="font-bold whitespace-nowrap">{formatCurrency(Number(e.amount))}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={()=>openEdit(e)}><Pencil className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" onClick={()=>{ if(confirm('Delete?')) deleteMut.mutate(e.id)}}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="h-4 w-4"/>Prev</Button>
                <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages || 1}</span>
                <Button variant="outline" size="sm" disabled={page>=meta.totalPages} onClick={()=>setPage(p=>p+1)}>Next<ChevronRight className="h-4 w-4"/></Button>
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-12">No expenses found. Add your first one!</p>}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset()}}>
        <DialogContent onClose={()=>setOpen(false)}>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Expense</DialogTitle><DialogDescription>AI can auto-categorize your expense</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" placeholder="25.00" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Coffee at Starbucks" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/><Button type="button" variant="secondary" size="sm" onClick={handleAiCategorize} className="w-full"><Sparkles className="h-3 w-3 mr-1"/> AI Categorize</Button>{aiCat && <div className="p-2 bg-primary/5 rounded text-xs"><span className="font-medium">{aiCat.category}</span> ({(aiCat.confidence*100).toFixed(0)}%) — {aiCat.reasoning}</div>}</div>
            <div className="space-y-2"><Label>Category</Label><Input placeholder="Food & Dining" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} list="cats"/><datalist id="cats">{(categories as any)?.map((c:string)=><option key={c} value={c}/>)}</datalist></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/></div>
            <Button className="w-full" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent onClose={()=>setImportOpen(false)} className="max-w-2xl">
          <DialogHeader><DialogTitle>Bulk Import CSV</DialogTitle><DialogDescription>Upload CSV with columns: amount, description, category, date (YYYY-MM-DD). Max 1000 rows.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept=".csv" onChange={onFile}/>
            {importRows.length>0 && <div className="max-h-64 overflow-auto border rounded p-2 text-xs"><p className="font-medium mb-1">{importRows.length} rows preview (first 5):</p>{importRows.slice(0,5).map((r,i)=><div key={i} className="flex justify-between border-b py-1"><span>{r.description}</span><span>{formatCurrency(r.amount)}</span></div>)}</div>}
            <Button className="w-full" disabled={!importRows.length || bulkMut.isPending} onClick={()=>bulkMut.mutate(importRows)}>{bulkMut.isPending ? 'Importing...' : `Import ${importRows.length} expenses`}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
