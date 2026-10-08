import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { getShipments } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { PageIntro } from '../components/ui/Layout'
import { TableSkeleton } from '../components/ui/Skeleton'
import { ErrorState, NoShipments } from '../components/ui/States'
import { Pagination } from '../components/ui/Pagination'
import { EventTypeTag, RiskBadge, StatusBadge } from '../components/ui/Badge'
import { ALL_STATUSES, RISK_LEVELS } from '../utils/constants'
import { relativeTime } from '../utils/format'
import type { RiskLevel, Shipment, ShipmentStatus } from '../types'

type SortKey = 'updated' | 'id' | 'risk' | 'status'
const PAGE_SIZE = 8
const RISK_ORDER: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 }

function sortShipments(list: Shipment[], key: SortKey): Shipment[] {
  const copy = [...list]
  switch (key) {
    case 'id': return copy.sort((a, b) => a.id.localeCompare(b.id))
    case 'risk': return copy.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || b.lastUpdated.localeCompare(a.lastUpdated))
    case 'status': return copy.sort((a, b) => a.status.localeCompare(b.status))
    default: return copy.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
  }
}

export default function ShipmentsPage() {
  usePageTitle('Shipments')
  const { data, loading, error, reload } = useAsync(getShipments, [])
  const navigate = useNavigate()
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ShipmentStatus | 'all'>('all')
  const [risk, setRisk] = useState<RiskLevel | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('updated')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const list = data.filter((s) =>
      (status === 'all' || s.status === status) &&
      (risk === 'all' || s.risk === risk) &&
      (!q || [s.id, s.containerId, s.origin, s.destination, s.lastEvent, s.cargo].some((v) => v.toLowerCase().includes(q))),
    )
    return sortShipments(list, sort)
  }, [data, query, status, risk, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const filtersActive = query !== '' || status !== 'all' || risk !== 'all'

  const apply = <T,>(setter: (v: T) => void, label: string) => (v: T) => {
    setter(v)
    setPage(1)
    if (v !== 'all') notify(`Filter applied: ${label}`, 'info')
  }
  const clear = () => { setQuery(''); setStatus('all'); setRisk('all'); setPage(1) }

  return (
    <div>
      <PageIntro title="Shipments" description="Each row is a read-model projection of an event stream. Open a shipment to see the events behind its current state." />

      <div className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <label htmlFor="ship-search" className="sr-only">Search shipments</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input id="ship-search" className="input pl-9" placeholder="Search ID, container, port, cargo" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label htmlFor="f-status" className="sr-only">Filter by status</label>
          <select id="f-status" className="input" value={status} onChange={(e) => apply<ShipmentStatus | 'all'>(setStatus, `status ${e.target.value}`)(e.target.value as ShipmentStatus | 'all')}>
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-risk" className="sr-only">Filter by risk</label>
          <select id="f-risk" className="input" value={risk} onChange={(e) => apply<RiskLevel | 'all'>(setRisk, `${e.target.value} risk`)(e.target.value as RiskLevel | 'all')}>
            <option value="all">All risk levels</option>
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r} risk</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-sort" className="sr-only">Sort shipments</label>
          <select id="f-sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="updated">Sort: Last updated</option>
            <option value="id">Sort: Shipment ID</option>
            <option value="risk">Sort: Risk (high first)</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
        <button type="button" className="btn-ghost" onClick={clear} disabled={!filtersActive}><X className="h-4 w-4" aria-hidden="true" /> Clear</button>
      </div>

      {error ? (
        <ErrorState title="Unable to load shipment data" message={error} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : (
        <div className="card overflow-hidden">
          {rows.length === 0 ? (
            <NoShipments action={<button type="button" className="btn-secondary" onClick={clear}>Clear filters</button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-800">
                <caption className="sr-only">Shipments</caption>
                <thead className="bg-slate-50 dark:bg-ink-800/50">
                  <tr>
                    {['Shipment ID', 'Container', 'Origin', 'Destination', 'Status', 'Last Event', 'Last Updated', 'Risk'].map((h) => <th key={h} scope="col" className="th">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-ink-800">
                  {rows.map((s) => (
                    <tr key={s.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-ink-800/50" onClick={() => navigate(`/shipments/${s.id}`)}>
                      <td className="td">
                        <a href={`/shipments/${s.id}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/shipments/${s.id}`) }} className="rounded font-medium text-brand-600 hover:underline dark:text-brand-300">{s.id}</a>
                      </td>
                      <td className="td font-mono text-xs">{s.containerId}</td>
                      <td className="td">{s.origin}</td>
                      <td className="td">{s.destination}</td>
                      <td className="td"><StatusBadge status={s.status} /></td>
                      <td className="td"><EventTypeTag type={s.lastEvent} /></td>
                      <td className="td muted">{relativeTime(s.lastUpdated)}</td>
                      <td className="td"><RiskBadge risk={s.risk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />}
        </div>
      )}
    </div>
  )
}
