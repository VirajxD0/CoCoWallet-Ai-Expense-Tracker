import { useState } from 'react'
import { aiApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, Lightbulb, MessageCircle, Tag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AIAssistant() {
  const [tab, setTab] = useState<'categorize'|'budgets'|'query'>('categorize')
  const [catForm, setCatForm] = useState({ description:'', amount:'' })
  const [catRes, setCatRes] = useState<any>(null)
  const [catLoading, setCatLoading] = useState(false)
  const [budgetRes, setBudgetRes] = useState<any[]|null>(null)
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{role:'user'|'ai', text:string}>>([])
  const [queryLoading, setQueryLoading] = useState(false)

  const handleCategorize = async()=>{
    setCatLoading(true); setCatRes(null)
    try{ const r=await aiApi.categorize({ description: catForm.description, amount: catForm.amount ? Number(catForm.amount) : undefined }); setCatRes(r.data.data)} catch(e:any){ setCatRes({error:e.response?.data?.message})} finally{ setCatLoading(false)}
  }
  const handleSuggest = async()=>{
    setBudgetLoading(true); setBudgetRes(null)
    try{ const r=await aiApi.suggestBudgets(3); setBudgetRes(r.data.data)} catch(e:any){ setBudgetRes([])} finally{ setBudgetLoading(false)}
  }
  const handleQuery = async()=>{
    if(!query.trim()) return
    const q=query; setQuery(''); setMessages(m=>[...m, {role:'user', text:q}]); setQueryLoading(true)
    try{ const r=await aiApi.query(q); setMessages(m=>[...m, {role:'ai', text:r.data.data.answer}])} catch(e:any){ setMessages(m=>[...m, {role:'ai', text: e.response?.data?.message || 'Error'}])} finally{ setQueryLoading(false)}
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary"/>AI Assistant</h1><p className="text-muted-foreground text-sm">Powered by Gemini 2.0 Flash • 3 intelligent features</p></div>

      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button onClick={()=>setTab('categorize')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${tab==='categorize' ? 'bg-background shadow' : 'hover:bg-background/50'}`}><Tag className="h-4 w-4"/>Categorize</button>
        <button onClick={()=>setTab('budgets')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${tab==='budgets' ? 'bg-background shadow' : 'hover:bg-background/50'}`}><Lightbulb className="h-4 w-4"/>Budget Suggest</button>
        <button onClick={()=>setTab('query')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${tab==='query' ? 'bg-background shadow' : 'hover:bg-background/50'}`}><MessageCircle className="h-4 w-4"/>Ask AI</button>
      </div>

      {tab==='categorize' && <Card><CardHeader><CardTitle>Smart Categorization</CardTitle><CardDescription>AI predicts category from description with confidence score</CardDescription></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Uber ride to airport, $34" value={catForm.description} onChange={e=>setCatForm({...catForm, description:e.target.value})}/></div>
        <div className="space-y-2"><Label>Amount (optional)</Label><Input type="number" placeholder="34.00" value={catForm.amount} onChange={e=>setCatForm({...catForm, amount:e.target.value})}/></div>
        <Button onClick={handleCategorize} disabled={!catForm.description || catLoading} className="w-full">{catLoading ? 'Thinking...' : 'Categorize with AI'}</Button>
        {catRes && !catRes.error && <div className="p-4 bg-primary/5 border rounded-lg space-y-2"><div className="flex items-center gap-2"><Badge>{catRes.category}</Badge><span className="text-sm text-muted-foreground">{(catRes.confidence*100).toFixed(0)}% confidence</span></div><p className="text-sm">{catRes.reasoning}</p></div>}
        {catRes?.error && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{catRes.error}</div>}
      </CardContent></Card>}

      {tab==='budgets' && <Card><CardHeader><CardTitle>AI Budget Suggestions</CardTitle><CardDescription>Analyzes last 3 months spending to suggest realistic limits</CardDescription></CardHeader><CardContent className="space-y-4">
        <Button onClick={handleSuggest} disabled={budgetLoading} className="w-full">{budgetLoading ? 'Analyzing...' : 'Generate Suggestions'}</Button>
        {budgetRes && <div className="space-y-2">{budgetRes.length ? budgetRes.map((s:any)=>(
          <div key={s.category} className="p-3 border rounded-lg flex justify-between items-start">
            <div><p className="font-medium">{s.category}</p><p className="text-xs text-muted-foreground">{s.reasoning}</p><p className="text-xs text-muted-foreground">avg {formatCurrency(s.averageMonthlySpend)}/mo over {s.basedOnMonths} months</p></div>
            <Badge variant="secondary" className="text-sm">{formatCurrency(s.suggestedLimit)}</Badge>
          </div>
        )) : <p className="text-sm text-muted-foreground text-center py-4">Not enough data — add expenses first</p>}</div>}
      </CardContent></Card>}

      {tab==='query' && <Card className="flex flex-col h-[560px]"><CardHeader><CardTitle>Natural Language Query</CardTitle><CardDescription>Ask questions like “How much did I spend on food last month?”</CardDescription></CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto space-y-3 mb-4 p-2">
            {messages.length===0 && <div className="text-center py-12 text-muted-foreground text-sm"><p>Try:</p><p className="mt-2 space-y-1">“What’s my biggest expense this month?”<br/>“How much did I spend on transport?”<br/>“Am I over budget on groceries?”</p></div>}
            {messages.map((m,i)=><div key={i} className={`p-3 rounded-lg max-w-[85%] ${m.role==='user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}><p className="text-sm whitespace-pre-wrap">{m.text}</p></div>)}
            {queryLoading && <div className="p-3 bg-muted rounded-lg max-w-[85%] text-sm animate-pulse">AI is thinking…</div>}
          </div>
          <div className="flex gap-2"><Input placeholder="Ask about your expenses..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=> e.key==='Enter' && handleQuery()}/><Button onClick={handleQuery} disabled={!query.trim() || queryLoading}><Send className="h-4 w-4"/></Button></div>
        </CardContent>
      </Card>}
    </div>
  )
}
