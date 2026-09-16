import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportApi, api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Download, Upload, FileJson, FileSpreadsheet, RefreshCw, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ExportImport() {
  const qc = useQueryClient()
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeExpenses, setIncludeExpenses] = useState(true)
  const [includeBudgets, setIncludeBudgets] = useState(true)
  const [includeRecurring, setIncludeRecurring] = useState(true)
  const [includeGoals, setIncludeGoals] = useState(true)
  const [includeAllocations, setIncludeAllocations] = useState(true)
  const [importFile, setImportFile] = useState<File|null>(null)
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json')
  const [skipExisting, setSkipExisting] = useState(true)

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['export', 'history'],
    queryFn: async () => (await exportApi.history()).data.data,
  })

  const exportMut = useMutation({
    mutationFn: (params: Record<string, unknown>) => exportApi.export(params),
    onSuccess: (res) => {
      const { jobId, downloadUrl } = res.data.data
      // Poll for completion
      const poll = setInterval(async () => {
        const history = await exportApi.history()
        const job = history.data.data.find((j: any) => j.id === jobId)
        if (job && job.status === 'completed') {
          clearInterval(poll)
          window.open(downloadUrl, '_blank')
          qc.invalidateQueries({ queryKey: ['export', 'history'] })
        } else if (job && job.status === 'failed') {
          clearInterval(poll)
          alert('Export failed: ' + job.error_message)
        }
      }, 1000)
    },
  })

  const importMut = useMutation({
    mutationFn: ({ file, params }: { file: File; params: Record<string, unknown> }) => exportApi.import(file, params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['export', 'history'] }); setImportFile(null) },
  })

  const deleteMut = useMutation({
    mutationFn: (jobId: string) => api.delete(`/export/${jobId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['export', 'history'] }),
  })

  const handleExport = () => {
    exportMut.mutate({
      format: exportFormat,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      includeExpenses,
      includeBudgets,
      includeRecurring,
      includeGoals,
      includeAllocations,
    })
  }

  const handleImport = () => {
    if (!importFile) return
    importMut.mutate({
      file: importFile,
      params: { format: importFormat, skipExisting },
    })
  }

  const jobs = (historyData as any) || []

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Export & Import</h1><p className="text-muted-foreground text-sm">Backup and restore your financial data</p></div>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5"/> Export Data</CardTitle>
          <CardDescription>Download your data as JSON (complete) or CSV (expenses only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={() => setExportFormat('json')} className="h-4 w-4" />
                  <FileJson className="h-4 w-4 text-primary"/> JSON (Full backup)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} className="h-4 w-4" />
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600"/> CSV (Expenses only)
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Input type="date" placeholder="Start" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full" />
                <Input type="date" placeholder="End" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full" />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="font-semibold">Include Modules</Label>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={includeExpenses} onChange={e => setIncludeExpenses(e.target.checked)} />
                <span>Expenses</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={includeBudgets} onChange={e => setIncludeBudgets(e.target.checked)} />
                <span>Budgets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={includeRecurring} onChange={e => setIncludeRecurring(e.target.checked)} />
                <span>Recurring</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={includeGoals} onChange={e => setIncludeGoals(e.target.checked)} />
                <span>Goals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={includeAllocations} onChange={e => setIncludeAllocations(e.target.checked)} />
                <span>Allocations</span>
              </label>
            </div>
          </div>

          <Button className="w-full md:w-auto" onClick={handleExport} disabled={exportMut.isPending}>
            {exportMut.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : <Download className="h-4 w-4 mr-2"/>}
            {exportMut.isPending ? 'Preparing...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Import Data</CardTitle>
          <CardDescription>Restore from a previous JSON or CSV export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>File</Label>
            <Input type="file" accept=".json,.csv" onChange={e => setImportFile(e.target.files?.[0] || null)} />
            {importFile && <p className="text-sm text-muted-foreground">{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</p>}
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <select value={importFormat} onChange={e => setImportFormat(e.target.value as 'json' | 'csv')} className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full md:w-48">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={skipExisting} onChange={e => setSkipExisting(e.target.checked)} />
            <Label className="font-normal">Skip existing records (prevent duplicates)</Label>
          </div>
          <Button variant="outline" className="w-full md:w-auto" onClick={handleImport} disabled={importMut.isPending || !importFile}>
            {importMut.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : <Upload className="h-4 w-4 mr-2"/>}
            {importMut.isPending ? 'Importing...' : 'Import'}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle>Export History</CardTitle></CardHeader>
        <CardContent>
          {historyLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p> : jobs.length ? (
            <div className="space-y-2">
              {jobs.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${j.format === 'json' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {j.format === 'json' ? <FileJson className="h-4 w-4"/> : <FileSpreadsheet className="h-4 w-4"/>}
                    </div>
                    <div>
                      <p className="font-medium">{j.file_path}</p>
                      <p className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()} • {j.record_count} records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {j.status === 'completed' && (
                      <a href={exportApi.download(j.id)} className="text-sm text-primary hover:underline flex items-center gap-1"><Download className="h-3.5 w-3.5"/> Download</a>
                    )}
                    {j.status === 'pending' && <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3"/> Processing...</span>}
                    {j.status === 'failed' && <span className="text-xs text-destructive flex items-center gap-1"><XCircle className="h-3 w-3"/> Failed: {j.error_message}</span>}
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete this export record?')) deleteMut.mutate(j.id) }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No export history yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}