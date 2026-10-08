import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { getAuditLogs } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../context/ToastContext'
import { PageIntro, Field } from '../components/ui/Layout'
import { TableSkeleton } from '../components/ui/Skeleton'
import { ErrorState, NoLogs } from '../components/ui/States'
import { Pagination } from '../components/ui/Pagination'
import { Drawer } from '../components/ui/Overlays'
import { EventTypeTag, StateBadge } from '../components/ui/Badge'
import { DEMO_NOW, EVENT_SEQUENCE } from '../utils/constants'
import { formatDateTime } from '../utils/format'
import type { AuditLog, LogStatus } from '../types'

const PAGE_SIZE = 10
const DATE_OPTIONS = [
  { value: 'all', label: 'All time', hours: Infinity },
  { value: '1h', label: 'Last hour', hours: 1 },
  { value: '24h', label: 'Last 24 hours', hours: 24 },
  { value: '7d', label: 'Last 7 days', hours: 168 },
  { value: '30d', label: 'Last 30 days', hours: 720 },
]

export default function AuditLogsPage() {
  usePageTitle('Audit Logs')
  const { data, loading, error, reload } = useAsync(getAuditLogs, [])
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<LogStatus | 'all'>('all')
  const [eventType, setEventType] = useState('all')
  const [actor, setActor] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [page, setPage] = useState(1)

  const actors = useMemo(() => Array.from(new Set((data ?? []).map((l) => l.actor))).sort(), [data])
  const selected = data?.find((l) => l.id === params.get('log')) ?? null

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const hours = DATE_OPTIONS.find((o) => o.value === dateRange)?.hours ?? Infinity
    const cutoff = DEMO_NOW.getTime() - hours * 3600000
    return data.filter((l) =>
      (status === 'all' || l.status === status) &&
      (eventType === 'all' || l.eventType === eventType) &&
      (actor === 'all' || l.actor === actor) &&
      new Date(l.timestamp).getTime() >= cutoff &&
      (!q || [l.id, l.actor, l.action, l.resource, l.source, l.eventType ?? ''].some((v) => v.toLowerCase().includes(q))),
    )
  }, [data, query, status, eventType, actor, dateRange])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const active = query !== '' || status !== 'all' || eventType !== 'all' || actor !== 'all' || dateRange !== 'all'

  const filter = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); notify('Filter applied', 'info') }
  const clear = () => { setQuery(''); setStatus('all'); setEventType('all'); setActor('all'); setDateRange('all'); setPage(1) }
  const open = (l: AuditLog) => setParams({ log: l.id })
  const close = () => setParams({})

  return (
    <div>
      <PageIntro title="Audit logs" description="A chronological record of every action taken against the system. Select a row to inspect its payload and the state before and after." />

      <div className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <label htmlFor="log-search" className="sr-only">Search audit logs</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input id="log-search" className="input pl-9" placeholder="Search actor, action, resource, IP" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label htmlFor="log-date" className="sr-only">Date filter</label>
          <select id="log-date" className="input" value={dateRange} onChange={(e) => filter<string>(setDateRange)(e.target.value)}>
            {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="log-status" className="sr-only">Status filter</label>
          <select id="log-status" className="input" value={status} onChange={(e) => filter<LogStatus | 'all'>(setStatus)(e.target.value as LogStatus | 'all')}>
            <option value="all">All statuses</option>
            {(['SUCCESS', 'WARNING', 'FAILED'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="log-type" className="sr-only">Event type filter</label>
          <select id="log-type" className="input" value={eventType} onChange={(e) => filter<string>(setEventType)(e.target.value)}>
            <option value="all">All event types</option>
            {EVENT_SEQUENCE.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="log-actor" className="sr-only">Actor filter</label>
          <select id="log-actor" className="input" value={actor} onChange={(e) => filter<string>(setActor)(e.target.value)}>
            <option value="all">All actors</option>
            {actors.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {active && <button type="button" className="btn-ghost justify-self-start" onClick={clear}><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button>}
      </div>

      {error ? (
        <ErrorState title="Unable to load audit logs" message={error} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={10} cols={8} />
      ) : (
        <div className="card overflow-hidden">
          {rows.length === 0 ? (
            <NoLogs action={<button type="button" className="btn-secondary" onClick={clear}>Clear filters</button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-800">
                <caption className="sr-only">Audit log entries</caption>
                <thead className="bg-slate-50 dark:bg-ink-800/50">
                  <tr>{['Timestamp', 'User / Actor', 'Action', 'Resource', 'Event Type', 'Status', 'IP / Source', 'Version'].map((h) => <th key={h} scope="col" className="th">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-ink-800">
                  {rows.map((l) => (
                    <tr key={l.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-ink-800/50" onClick={() => open(l)}>
                      <td className="td tabular-nums">{formatDateTime(l.timestamp)}</td>
                      <td className="td">{l.actor}</td>
                      <td className="td max-w-[18rem] truncate">
                        <button type="button" className="max-w-full truncate rounded text-left font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={(e) => { e.stopPropagation(); open(l) }} aria-label={`View details for ${l.id}: ${l.action}`}>{l.action}</button>
                      </td>
                      <td className="td font-mono text-xs">{l.resource}</td>
                      <td className="td">{l.eventType ? <EventTypeTag type={l.eventType} /> : <span className="muted">—</span>}</td>
                      <td className="td"><StateBadge status={l.status} /></td>
                      <td className="td font-mono text-xs">{l.source}</td>
                      <td className="td tabular-nums">{l.version === null ? <span className="muted">—</span> : `v${l.version}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />}
        </div>
      )}

      {selected && (
        <Drawer title={selected.action} subtitle={`${selected.id} · ${formatDateTime(selected.timestamp)}`} onClose={close}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Actor" value={selected.actor} />
            <Field label="Status" value={<StateBadge status={selected.status} />} />
            <Field label="Resource" value={selected.resource} mono />
            <Field label="Event type" value={selected.eventType ?? 'Not an event append'} />
            <Field label="Version" value={selected.version === null ? 'n/a' : `v${selected.version}`} mono />
            <Field label="IP / Source" value={selected.source} mono />
            <Field label="Timestamp" value={formatDateTime(selected.timestamp)} />
            <Field label="Log ID" value={selected.id} mono />
          </dl>

          <h3 className="mb-2 mt-6 text-sm font-semibold">State change</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3 dark:border-ink-700"><p className="text-xs muted">Previous state</p><p className="mt-1 text-sm font-medium">{selected.previousState ?? 'Not applicable'}</p></div>
            <div className="rounded-md border border-slate-200 p-3 dark:border-ink-700"><p className="text-xs muted">Resulting state</p><p className="mt-1 text-sm font-medium">{selected.resultingState ?? 'Not applicable'}</p></div>
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold">Event metadata</h3>
          <dl className="rounded-md bg-slate-50 p-3 text-sm dark:bg-ink-800">
            {Object.entries(selected.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-1"><dt className="muted">{k}</dt><dd className="break-all text-right font-mono text-xs">{String(v)}</dd></div>
            ))}
          </dl>

          <h3 className="mb-2 mt-6 text-sm font-semibold">Payload</h3>
          {selected.payload ? (
            <pre className="overflow-x-auto rounded-md bg-ink-900 p-3 font-mono text-xs leading-relaxed text-slate-100">{JSON.stringify(selected.payload, null, 2)}</pre>
          ) : (
            <p className="text-sm muted">This action carried no payload.</p>
          )}
        </Drawer>
      )}
    </div>
  )
}
