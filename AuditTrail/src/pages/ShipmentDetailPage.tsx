import { Link, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, Activity } from 'lucide-react'
import { getSensorData, getShipmentById, getShipmentEvents } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { Field, SectionCard } from '../components/ui/Layout'
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { RiskBadge, StatusBadge } from '../components/ui/Badge'
import { EventCard } from '../components/EventCard'
import { OccDemo } from '../components/OccDemo'
import { IntegrityCard } from '../components/IntegrityCard'
import { SensorChart } from '../components/charts/Charts'

export default function ShipmentDetailPage() {
  const { id = '' } = useParams()
  usePageTitle(id || 'Shipment')
  const shipment = useAsync(() => getShipmentById(id), [id])
  const events = useAsync(() => getShipmentEvents(id), [id])
  const sensors = useAsync(() => getSensorData(id), [id])

  const back = (
    <Link to="/shipments" className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand-600 dark:text-brand-300">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All shipments
    </Link>
  )

  if (shipment.error || events.error) {
    return (
      <div>
        {back}
        <ErrorState title="Unable to load shipment data" message={shipment.error ?? events.error ?? undefined} onRetry={() => { shipment.reload(); events.reload(); sensors.reload() }} />
      </div>
    )
  }

  if (shipment.loading || events.loading || !shipment.data || !events.data) {
    return (
      <div aria-busy="true">
        {back}
        <CardSkeleton lines={5} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"><CardSkeleton lines={8} /><ChartSkeleton /></div>
      </div>
    )
  }

  const s = shipment.data
  const list = events.data
  const lastTemp = list[list.length - 1].payload.temperatureC

  return (
    <div>
      {back}
      <section className="card p-5" aria-label="Shipment summary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">{s.id}</h2>
            <p className="mt-0.5 text-sm muted">{s.cargo} · {s.vessel}</p>
          </div>
          <div className="flex items-center gap-4"><StatusBadge status={s.status} /><RiskBadge risk={s.risk} /></div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Shipment ID" value={s.id} mono />
          <Field label="Container ID" value={s.containerId} mono />
          <Field label="Origin" value={s.origin} />
          <Field label="Destination" value={s.destination} />
          <Field label="Current version" value={`v${s.version}`} mono />
          <Field label="Latest temperature" value={typeof lastTemp === 'number' ? `${lastTemp}°C` : 'n/a'} />
        </dl>
        <p className="mt-4 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs dark:bg-ink-800">
          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>This summary is a read model (query side). It is derived by replaying the {list.length} events below. <Link to="/timeline" className="font-medium text-brand-600 dark:text-brand-300">Scrub through history</Link></span>
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="xl:col-span-3" aria-labelledby="timeline-heading">
          <h3 id="timeline-heading" className="mb-3 text-sm font-semibold">Event-sourced timeline</h3>
          <ol className="space-y-2">
            {list.map((e, i) => (
              <li key={e.id}>
                <EventCard event={e} />
                {i < list.length - 1 && <div className="flex justify-center py-1 text-ink-400" aria-hidden="true"><ArrowDown className="h-4 w-4" /></div>}
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6 xl:col-span-2">
          <SectionCard title="Sensor readings" description={`Expected range ${s.expectedRange.min}°C – ${s.expectedRange.max}°C`}>
            {sensors.loading || !sensors.data ? (
              sensors.error ? <ErrorState title="Unable to load sensor data" message={sensors.error} onRetry={sensors.reload} /> : <ChartSkeleton height={220} />
            ) : (
              <SensorChart data={sensors.data} min={s.expectedRange.min} max={s.expectedRange.max} />
            )}
          </SectionCard>
          <OccDemo currentVersion={s.version} />
          <IntegrityCard events={list} />
        </div>
      </div>
    </div>
  )
}
