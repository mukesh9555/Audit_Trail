import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ScrollText, Search, Activity } from 'lucide-react'
import { search } from '../services/mockApi'
import type { SearchResults } from '../types'
import { useDebounce } from '../hooks/useDebounce'
import { useClickOutside } from '../hooks/useClickOutside'
import { humanizeEvent } from '../utils/format'

interface Item {
  key: string
  group: string
  title: string
  subtitle: string
  to: string
  kind: 'shipment' | 'event' | 'log'
}

function flatten(r: SearchResults): Item[] {
  return [
    ...r.shipments.map<Item>((s) => ({ key: `s-${s.id}`, group: 'Shipments & containers', title: `${s.id} · ${s.containerId}`, subtitle: `${s.origin} → ${s.destination} · ${s.status}`, to: `/shipments/${s.id}`, kind: 'shipment' })),
    ...r.events.map<Item>((e) => ({ key: `e-${e.id}`, group: 'Events', title: `${humanizeEvent(e.type)} (v${e.version})`, subtitle: `${e.shipmentId} · ${e.actor}`, to: `/shipments/${e.shipmentId}`, kind: 'event' })),
    ...r.logs.map<Item>((l) => ({ key: `l-${l.id}`, group: 'Audit logs', title: l.action, subtitle: `${l.id} · ${l.actor}`, to: `/audit-logs?log=${l.id}`, kind: 'log' })),
  ]
}

const ICON = { shipment: Package, event: Activity, log: ScrollText }

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const debounced = useDebounce(query, 220)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  useClickOutside(wrapRef, () => setOpen(false), open)

  useEffect(() => {
    let cancelled = false
    if (!debounced.trim()) {
      setResults(null)
      setLoading(false)
      return
    }
    setLoading(true)
    search(debounced)
      .then((r) => {
        if (!cancelled) {
          setResults(r)
          setActive(0)
        }
      })
      .catch(() => {
        if (!cancelled) setResults({ shipments: [], events: [], logs: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(() => (results ? flatten(results) : []), [results])

  const go = (item: Item) => {
    setOpen(false)
    setQuery('')
    navigate(item.to)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(items.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault()
      go(items[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showPanel = open && query.trim().length > 0
  let lastGroup = ''

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1 sm:w-72 sm:flex-none lg:w-96">
      <label htmlFor="global-search" className="sr-only">Search shipments, containers, events and audit logs</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        aria-activedescendant={items[active] ? `gs-${items[active].key}` : undefined}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search shipments, events, logs"
        className="input pl-9"
      />
      {showPanel && (
        <div id="global-search-results" role="listbox" aria-label="Search results" className="absolute left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-ink-700 dark:bg-ink-800 sm:min-w-[24rem]">
          {loading && <p className="px-4 py-3 text-sm muted">Searching…</p>}
          {!loading && items.length === 0 && <p className="px-4 py-6 text-center text-sm muted">No results for “{query}”. Try a shipment ID such as SHP-2026-001.</p>}
          {!loading &&
            items.map((item, i) => {
              const Icon = ICON[item.kind]
              const header = item.group !== lastGroup ? item.group : null
              lastGroup = item.group
              return (
                <div key={item.key}>
                  {header && <p className="px-4 pb-1 pt-2 text-xs font-semibold muted">{header}</p>}
                  <div
                    id={`gs-${item.key}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-2 ${i === active ? 'bg-brand-50 dark:bg-ink-700' : ''}`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-500 dark:text-slate-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs muted">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
