import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ChevronDown, Plus, Check, FolderOpen } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
  placeholder?: string
  className?: string
}

export function CategorySelect({ value, onChange, categories, placeholder = 'Select category', className }: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (open) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])

  const filtered = (categories || []).filter(c => c.toLowerCase().includes(search.toLowerCase()))
  const hasExactMatch = categories?.some(c => c.toLowerCase() === search.toLowerCase())

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Add New Category — top */}
          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/budgets') }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground rounded-t-md cursor-pointer border-b"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </button>

          {/* Search input */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or type custom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && search && !hasExactMatch) {
                  onChange(search)
                  setOpen(false)
                }
                if (e.key === 'Escape') setOpen(false)
              }}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-auto p-1 border-t">
            {/* No category option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer',
                !value && 'bg-accent'
              )}
            >
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 text-left">No category</span>
              {!value && <Check className="h-3.5 w-3.5" />}
            </button>

            {/* Budget categories */}
            {filtered.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  value === c && 'bg-accent'
                )}
              >
                <span className="flex-1 text-left truncate">{c}</span>
                {value === c && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}

            {/* Custom type-in option */}
            {search && !hasExactMatch && (
              <button
                type="button"
                onClick={() => { onChange(search); setOpen(false) }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">Use "{search}"</span>
              </button>
            )}

            {filtered.length === 0 && !search && (
              <p className="px-2 py-3 text-xs text-muted-foreground text-center">No budget categories yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
