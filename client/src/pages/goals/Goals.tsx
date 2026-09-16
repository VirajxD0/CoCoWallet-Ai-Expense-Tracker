import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Plus, Target, Trash2, Pencil, ArrowRight, CheckCircle, Calculator, RefreshCw } from 'lucide-react'

const ICONS = ['target', 'piggy-bank', 'home', 'car', 'plane', 'graduation-cap', 'heart', 'gift', 'coffee', 'shopping-bag']
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1']

function ProgressRing({ progress, color, size = 96, strokeWidth = 8 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  return (
    <svg width={size} height={size} className="transform -rotate-90 block">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={strokeWidth} fill="none" className="opacity-80" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

export default function Goals() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [allocating, setAllocating] = useState<string | null>(null)
  const [allocForm, setAllocForm] = useState({ amount: '', source: 'manual' })
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    category: '',
    icon: 'target',
    color: '#3b82f6',
    auto_allocate_pct: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['goals', 'progress'],
    queryFn: async () => (await goalsApi.withProgress()).data.data,
  })

  const createMut = useMutation({
    mutationFn: (d: any) => goalsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setOpen(false)
      reset()
    },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, d }: any) => goalsApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setOpen(false)
      setEditing(null)
      reset()
    },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
  const allocateMut = useMutation({
    mutationFn: ({ id, d }: any) => goalsApi.allocate(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setAllocating(null)
    },
  })
  const autoAllocMut = useMutation({
    mutationFn: (month?: string) => goalsApi.autoAllocate(month),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const reset = () => {
    setForm({ name: '', target_amount: '', current_amount: '0', target_date: '', category: '', icon: 'target', color: '#3b82f6', auto_allocate_pct: 0 })
    setEditing(null)
  }
  const openEdit = (g: any) => {
    setEditing(g)
    setForm({
      name: g.name,
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      target_date: g.target_date || '',
      category: g.category || '',
      icon: g.icon,
      color: g.color,
      auto_allocate_pct: g.auto_allocate_pct,
    })
    setOpen(true)
  }
  const openAllocate = (goalId: string) => {
    setAllocating(goalId)
    setAllocForm({ amount: '', source: 'manual' })
  }
  const handleSubmit = () => {
    const payload = {
      name: form.name,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount),
      target_date: form.target_date || undefined,
      category: form.category || undefined,
      icon: form.icon,
      color: form.color,
      auto_allocate_pct: form.auto_allocate_pct,
    }
    if (editing) updateMut.mutate({ id: editing.id, d: payload })
    else createMut.mutate(payload)
  }
  const handleAllocate = () => {
    if (!allocating) return
    allocateMut.mutate({ id: allocating, d: { amount: Number(allocForm.amount), source: allocForm.source } })
  }

  const goals = (data as any) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground text-sm">Track progress toward your financial targets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full bg-white shadow-sm" onClick={() => autoAllocMut.mutate()} disabled={autoAllocMut.isPending}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto-Allocate Surplus
          </Button>
          <Button className="rounded-full shadow-premium gap-2" onClick={() => { reset(); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : goals.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {goals.map((g: any) => {
            const progress = Math.min(100, Number(g.progress_percentage ?? 0))
            const isComplete = g.is_completed
            const daysText =
              g.target_date && g.days_remaining !== null && g.days_remaining !== undefined
                ? g.days_remaining > 0
                  ? `${g.days_remaining} days left`
                  : g.days_remaining === 0
                    ? 'Due today'
                    : 'Overdue'
                : null

            return (
              <Card
                key={g.id}
                className={`group relative overflow-hidden rounded-[22px] border bg-card transition-all duration-300 hover:shadow-premium hover:-translate-y-1 ${isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'hover:border-primary/15'}`}
              >
                {/* top color accent */}
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: g.color }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 pt-5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase"
                    style={{ backgroundColor: `${g.color}14`, color: g.color, borderColor: `${g.color}22` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: g.color }} />
                    {g.category || 'General'}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-muted/60 hover:bg-muted"
                      onClick={() => openEdit(g)}
                      aria-label="Edit goal"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-muted/60 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm('Delete this goal?')) deleteMut.mutate(g.id)
                      }}
                      aria-label="Delete goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-5 pt-4">
                  {/* progress */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <ProgressRing progress={progress} color={g.color} size={112} strokeWidth={10} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[22px] font-extrabold tracking-tight leading-none">{progress.toFixed(0)}%</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-0.5">complete</span>
                      </div>
                    </div>

                    <h3 className="mt-4 text-center font-bold text-[17px] leading-tight line-clamp-2 min-h-[1.5rem]">{g.name}</h3>

                    {g.target_date && (
                      <p className="mt-1.5 text-center text-xs text-muted-foreground">
                        Target • {new Date(g.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {daysText && <span className={`ml-1 font-medium ${g.days_remaining < 0 ? 'text-destructive' : g.days_remaining !== null && g.days_remaining <= 7 ? 'text-amber-600' : ''}`}>• {daysText}</span>}
                      </p>
                    )}
                  </div>

                  {/* stats */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-muted/40 p-3 text-center">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Saved</p>
                      <p className="mt-1 font-extrabold text-[15px] tracking-tight">{formatCurrency(Number(g.current_amount))}</p>
                    </div>
                    <div className="rounded-2xl border bg-muted/40 p-3 text-center">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Target</p>
                      <p className="mt-1 font-extrabold text-[15px] tracking-tight">{formatCurrency(Number(g.target_amount))}</p>
                    </div>
                  </div>

                  {/* remaining + mini bar */}
                  <div className="mt-3 flex items-center justify-between rounded-2xl border bg-card px-3.5 py-3">
                    <div>
                      <p className="text-sm font-bold leading-none">{formatCurrency(Number(g.remaining_amount ?? g.target_amount - g.current_amount))} left</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{g.remaining_amount !== undefined ? 'Remaining' : 'To go'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: g.color }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: g.color }}>{progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  {Number(g.auto_allocate_pct) > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full border bg-primary/[0.06] border-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                      <Calculator className="h-3.5 w-3.5" /> Auto: {g.auto_allocate_pct}% of surplus
                    </div>
                  )}

                  {/* primary CTA - arrow FIX */}
                  <Button
                    onClick={() => openAllocate(g.id)}
                    className="group/btn mt-4 w-full rounded-full h-11 font-semibold gap-2 shadow-sm hover:shadow-md transition-all text-white"
                    style={{ background: g.color }}
                  >
                    Add Funds
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover/btn:bg-white/30 transition-colors">
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </span>
                  </Button>

                  {isComplete && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 text-white px-3 py-2 text-xs font-bold shadow-sm">
                      <CheckCircle className="h-4 w-4" /> Goal Completed!
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="rounded-[22px] border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Target className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No goals yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first savings goal to start tracking</p>
            <Button className="rounded-full mt-4" onClick={() => { reset(); setOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
        <DialogContent onClose={() => setOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Create'} Goal</DialogTitle>
            <DialogDescription>Set a target amount and deadline to track your progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Target Amount *</Label>
              <Input type="number" step="0.01" placeholder="10000" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Current Amount</Label>
              <Input type="number" step="0.01" placeholder="0" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Target Date (optional)</Label>
              <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <Input placeholder="Emergency" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Auto-allocate % of monthly surplus</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="0"
                value={form.auto_allocate_pct}
                onChange={(e) => setForm({ ...form, auto_allocate_pct: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, icon: i })}
                    className={`p-2 rounded-lg border-2 ${form.icon === i ? 'border-primary bg-primary/10' : 'border-input hover:border-primary'}`}
                    title={i}
                  >
                    <i className={`lucide lucide-${i} h-5 w-5`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`h-8 w-8 rounded-full border-2 ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allocate Dialog */}
      {allocating && (
        <Dialog open={true} onOpenChange={() => setAllocating(null)}>
          <DialogContent onClose={() => setAllocating(null)} className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Funds to Goal</DialogTitle>
              <DialogDescription>Allocate money toward this savings goal</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input type="number" step="0.01" placeholder="500" value={allocForm.amount} onChange={(e) => setAllocForm({ ...allocForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <select
                  value={allocForm.source}
                  onChange={(e) => setAllocForm({ ...allocForm, source: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="auto_surplus">Auto Surplus</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
              <Button className="w-full rounded-full h-11 gap-2" onClick={handleAllocate} disabled={allocateMut.isPending}>
                {allocateMut.isPending ? 'Adding...' : 'Add Funds'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
