import { Link } from 'react-router-dom'
import type { ShipmentEvent } from '../types'
import { EventTypeTag, StateBadge } from './ui/Badge'
import { formatDateTime, relativeTime } from '../utils/format'

/** Compact one-line event representation, used in recent-event lists. */
export function EventEnvelope({ event }: { event: ShipmentEvent }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <EventTypeTag type={event.type} />
        <p className="mt-1 truncate text-sm">
          <Link to={`/shipments/${event.shipmentId}`} className="rounded font-medium text-brand-600 hover:underline dark:text-brand-300">{event.shipmentId}</Link>
          <span className="muted"> · v{event.version} · {event.actor}</span>
        </p>
      </div>
      <p className="shrink-0 text-xs muted">{relativeTime(event.timestamp)}</p>
    </li>
  )
}

function payloadEntries(event: ShipmentEvent): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const p = event.payload
  const t = p.temperatureC
  if (typeof t === 'number') out.push(['Temperature', `${t}°C`])
  if (typeof p.expectedMinC === 'number' && typeof p.expectedMaxC === 'number') out.push(['Expected range', `${p.expectedMinC}°C – ${p.expectedMaxC}°C`])
  Object.entries(p).forEach(([k, v]) => {
    if (['temperatureC', 'expectedMinC', 'expectedMaxC', 'riskLevel'].includes(k)) return
    out.push([k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), String(v)])
  })
  if (typeof p.riskLevel === 'string') out.push(['Risk after event', p.riskLevel])
  return out
}

/** Full event card shown in the shipment timeline. */
export function EventCard({ event, dimmed = false }: { event: ShipmentEvent; dimmed?: boolean }) {
  const entries = payloadEntries(event)
  return (
    <article className={`card p-4 ${dimmed ? 'opacity-45' : ''}`} aria-label={`Event version ${event.version}: ${event.type}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeTag type={event.type} />
          <StateBadge status={event.status} />
        </div>
        <span className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-xs dark:border-ink-700">v{event.version}</span>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div><dt className="text-xs muted">Time</dt><dd className="font-medium">{formatDateTime(event.timestamp)}</dd></div>
        <div><dt className="text-xs muted">Actor</dt><dd className="font-medium">{event.actor}</dd></div>
        <div><dt className="text-xs muted">Location</dt><dd className="font-medium">{event.location}</dd></div>
      </dl>
      <details className="group mt-3" open>
        <summary className="cursor-pointer rounded text-xs font-medium text-brand-600 dark:text-brand-300">Payload ({entries.length} fields)</summary>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-md bg-slate-50 p-3 text-sm dark:bg-ink-800 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="muted">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-2 break-all font-mono text-[11px] muted">hash {event.hash} ← prev {event.prevHash}</p>
      </details>
    </article>
  )
}
