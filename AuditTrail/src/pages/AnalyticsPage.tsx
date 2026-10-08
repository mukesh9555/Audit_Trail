import { useState } from 'react'
import { getAnalytics } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { PageIntro, SectionCard } from '../components/ui/Layout'
import { ChartSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { EventTypeChart, ExceptionsChart, StatusDonut, TemperatureTrendChart, VolumeChart } from '../components/charts/Charts'
import { formatNumber } from '../utils/format'
import type { RangeDays } from '../types'

const RANGES: RangeDays[] = [7, 30, 90]

export default function AnalyticsPage() {
  usePageTitle('Analytics')
  const [range, setRange] = useState<RangeDays>(30)
  const { data, loading, error, reload } = useAsync(() => getAnalytics(range), [range])

  const selector = (
    <div role="group" aria-label="Date range" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 dark:border-ink-700 dark:bg-ink-900">
      {RANGES.map((r) => (
        <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} className={`rounded px-3 py-1.5 text-sm font-medium ${range === r ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800'}`}>
          {r} Days
        </button>
      ))}
    </div>
  )

  const total = data ? data.volume.reduce((s, v) => s + v.events, 0) : 0

  return (
    <div>
      <PageIntro title="Analytics" description="Temporal analysis across the event store. Every figure is computed from appended events, so any period can be re-analysed." actions={selector} />
      {error ? (
        <ErrorState title="Unable to load analytics" message={error} onRetry={reload} />
      ) : loading || !data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <ChartSkeleton key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Event volume over time" description={`${formatNumber(total)} events in the last ${data.range} days`}><VolumeChart data={data.volume} /></SectionCard>
          <SectionCard title="Temperature trend" description="Average and peak container temperature"><TemperatureTrendChart data={data.temperature} /></SectionCard>
          <SectionCard title="Exceptions over time" description="Temperature and risk exceptions per day"><ExceptionsChart data={data.exceptions} /></SectionCard>
          <SectionCard title="Shipment status distribution" description="Including delivered shipments in this period"><StatusDonut data={data.statusDistribution} /></SectionCard>
          <SectionCard title="Events by type" description={`Last ${data.range} days`} className="lg:col-span-2"><EventTypeChart data={data.eventsByType} /></SectionCard>
        </div>
      )}
    </div>
  )
}
