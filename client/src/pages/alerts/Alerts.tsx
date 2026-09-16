import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Bell, Check, CheckCircle, AlertTriangle, AlertCircle, TrendingUp, Repeat, Target, MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import { ALERT_TYPES } from '@/lib/types/alerts'

const ALERT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Repeat,
  Target,
  CheckCircle,
}

export function AlertBell() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data: countData } = useQuery({ queryKey: ['alerts', 'unread-count'], queryFn: async () => (await alertsApi.unreadCount()).data.data, refetchInterval: 30000 })
  const { data: alertsData } = useQuery({ queryKey: ['alerts', 'list', { limit: 10 }], queryFn: async () => (await alertsApi.list({ limit: 10, is_read: false })).data.data, enabled: open })
  const markReadMut = useMutation({ mutationFn: (id: string) => alertsApi.markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) })
  const markAllReadMut = useMutation({ mutationFn: () => alertsApi.markAllRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) })

  const count = countData?.count || 0
  const alerts = alertsData?.alerts || []

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        {count > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">{count > 9 ? '9+' : count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border shadow-premium rounded-xl overflow-hidden z-50 animate-fade-in">
          <CardHeader className="p-4 border-b flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Alerts</CardTitle>
            <div className="flex items-center gap-2">
              {count > 0 && <Button variant="ghost" size="sm" onClick={() => markAllReadMut.mutate()}>Mark all read</Button>}
              <button onClick={() => setOpen(false)} className="p-1"><X className="h-4 w-4"/></button>
            </div>
          </CardHeader>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground"><Bell className="h-10 w-10 mx-auto mb-2 opacity-50"/><p>No unread alerts</p></div>
            ) : (
              <div className="divide-y">
                {alerts.map((a: any) => {
                  const typeInfo = ALERT_TYPES[a.type as keyof typeof ALERT_TYPES] || { icon: 'MessageCircle', color: 'text-muted-foreground', label: 'Alert' }
                  const Icon = ALERT_ICONS[typeInfo.icon] || MessageCircle
                  return (
                    <div key={a.id} className="p-4 hover:bg-muted/30">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${typeInfo.color}/10`}>
                          <Icon className={`h-4 w-4 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.triggered_at).toLocaleString()}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => markReadMut.mutate(a.id)}><Check className="h-3.5 w-3.5"/></Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="p-3 border-t text-center">
            <a href="/alerts" onClick={() => setOpen(false)} className="text-sm text-primary hover:underline">View all alerts →</a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Alerts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all'|'unread'|'read'>('all')
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', page, filter],
    queryFn: async () => (await alertsApi.list({ page, limit, is_read: filter === 'unread' ? false : filter === 'read' ? true : undefined })).data,
  })

  const markReadMut = useMutation({ mutationFn: (id: string) => alertsApi.markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) })
  const markAllReadMut = useMutation({ mutationFn: () => alertsApi.markAllRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) })
  const checkMut = useMutation({ mutationFn: () => alertsApi.check(), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) })

  const alerts = (data as any)?.alerts || []
  const meta = (data as any)?.meta || { total: 0, totalPages: 0, page: 1 }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Alerts</h1><p className="text-muted-foreground text-sm">Stay informed about your finances</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => checkMut.mutate()} disabled={checkMut.isPending}><ChevronDown className="h-4 w-4 mr-2"/>Check Now</Button>
          <Button onClick={() => markAllReadMut.mutate()} disabled={markAllReadMut.isPending}><Check className="h-4 w-4 mr-2"/>Mark All Read</Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'unread', 'read'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => { setFilter(f as 'all' | 'unread' | 'read'); setPage(1) }} className="rounded-full">
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0">
          {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : alerts.length ? (
            <div className="divide-y">
              {alerts.map((a: any) => {
                const typeInfo = ALERT_TYPES[a.type as keyof typeof ALERT_TYPES] || { icon: 'MessageCircle', color: 'text-muted-foreground', label: 'Alert' }
                const Icon = ALERT_ICONS[typeInfo.icon] || MessageCircle
                return (
                  <div key={a.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${typeInfo.color}/10`}>
                        <Icon className={`h-4.5 w-4.5 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{typeInfo.label}</Badge>
                          {!a.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="font-medium text-sm mt-1">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{new Date(a.triggered_at).toLocaleString()}</p>
                      </div>
                      {!a.is_read && <Button size="icon" variant="ghost" onClick={() => markReadMut.mutate(a.id)} title="Mark as read"><Check className="h-4 w-4"/></Button>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-4 opacity-50"/><p>No alerts found</p></div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages || 1}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  )
}