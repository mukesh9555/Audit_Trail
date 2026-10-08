import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Boxes, Truck } from 'lucide-react'
import { getDashboard } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { PageIntro, SectionCard, StatCard } from '../components/ui/Layout'
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { EventEnvelope } from '../components/EventCard'
import { ActivityChart, EventTypeChart, StatusDonut } from '../components/charts/Charts'
import { RiskBadge } from '../components/ui/Badge'
import { formatNumber, relativeTime } from '../utils/format'

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { data, loading, error, reload } = useAsync(getDashboard, [])

  if (error) return <ErrorState title="Unable to load dashboard" message={error} onRetry={reload} />

  if (loading || !data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><ChartSkeleton /></div><ChartSkeleton /></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><CardSkeleton lines={8} /><CardSkeleton lines={8} /></div>
      </div>
    )
  }

  const { stats } = data
  return (
    <div>
      <PageIntro title="Operations overview" description="Fleet-wide figures are simulated. The shipment lists in this demo contain a 15-shipment sample." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Shipments" value={formatNumber(stats.totalShipments)} hint="All streams in the event store" icon={Boxes} />
        <StatCard label="Active Shipments" value={formatNumber(stats.activeShipments)} hint="Not yet delivered" icon={Truck} />
        <StatCard label="Events Today" value={formatNumber(stats.eventsToday)} hint="Appended since 00:00 UTC" icon={Activity} />
        <StatCard label="Exceptions" value={formatNumber(stats.exceptions)} hint="Open temperature or risk alerts" icon={AlertTriangle} tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Shipment activity" description="Events appended per day, last 14 days" className="xl:col-span-2">
          <ActivityChart data={data.activity} />
        </SectionCard>
        <SectionCard title="Shipment status distribution" description="Active shipments by current state">
          <StatusDonut data={data.statusDistribution} />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Events by type" description="Today" className="xl:col-span-2">
          <EventTypeChart data={data.eventsByType} />
        </SectionCard>
        <SectionCard title="System health" description="Event store and read side">
          <ul className="divide-y divide-slate-200 dark:divide-ink-800">
            {data.health.map((h) => (
              <li key={h.name} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs muted">{h.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`flex items-center justify-end gap-1.5 text-sm font-medium ${h.status === 'Operational' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    <span className={`h-2 w-2 rounded-full ${h.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                    {h.status}
                  </p>
                  <p className="text-xs muted">{h.metric}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent events" description="Latest appended to any stream" actions={<Link to="/audit-logs" className="text-sm font-medium text-brand-600 dark:text-brand-300">View audit logs</Link>}>
          <ul className="-my-2 divide-y divide-slate-200 dark:divide-ink-800">
            {data.recentEvents.map((e) => <EventEnvelope key={e.id} event={e} />)}
          </ul>
        </SectionCard>
        <SectionCard title="Active exceptions" description="Shipments needing attention" actions={<Link to="/shipments" className="text-sm font-medium text-brand-600 dark:text-brand-300">All shipments</Link>}>
          <ul className="-my-2 divide-y divide-slate-200 dark:divide-ink-800">
            {data.exceptions.map((x) => (
              <li key={x.shipmentId} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link to={`/shipments/${x.shipmentId}`} className="rounded text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">{x.shipmentId} · {x.containerId}</Link>
                  <RiskBadge risk={x.severity} />
                </div>
                <p className="mt-0.5 text-sm">{x.message}</p>
                <p className="text-xs muted">Detected {relativeTime(x.since)}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
