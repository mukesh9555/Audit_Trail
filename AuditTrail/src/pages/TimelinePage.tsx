import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { getShipmentEvents, getShipments, reconstructState } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../context/ToastContext'
import { PageIntro, SectionCard } from '../components/ui/Layout'
import { CardSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { RiskBadge, StatusBadge } from '../components/ui/Badge'
import { CqrsFlow, CrudVsEventSourcing } from '../components/ConceptDiagrams'
import { formatDateTime, humanizeEvent } from '../utils/format'
import type { ReconstructedState, ShipmentEvent } from '../types'

const DEFAULT_SHIPMENT = 'SHP-2026-005'

export default function TimelinePage() {
  usePageTitle('Shipment State Reconstruction')
  const { notify } = useToast()
  const shipments = useAsync(getShipments, [])
  const [shipmentId, setShipmentId] = useState(DEFAULT_SHIPMENT)
  const events = useAsync(() => getShipmentEvents(shipmentId), [shipmentId])
  const [index, setIndex] = useState(1)
  const [state, setState] = useState<ReconstructedState | null>(null)
  const [stateError, setStateError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const requestId = useRef(0)
  const toastTimer = useRef<number | null>(null)

  const list: ShipmentEvent[] = events.data ?? []
  const total = list.length

  // Reset position when a different stream loads.
  useEffect(() => {
    if (events.data) setIndex(events.data.length)
  }, [events.data])

  // Ask the "server" to replay events up to the selected event's timestamp.
  useEffect(() => {
    if (!events.data || events.data.length === 0) return
    const target = events.data[Math.min(index, events.data.length) - 1]
    const id = ++requestId.current
    reconstructState(shipmentId, target.timestamp)
      .then((s) => { if (id === requestId.current) { setState(s); setStateError(null) } })
      .catch((e: unknown) => { if (id === requestId.current) setStateError(e instanceof Error ? e.message : 'Unable to reconstruct state.') })
  }, [index, events.data, shipmentId])

  // Auto-play replay.
  useEffect(() => {
    if (!playing) return
    if (index >= total) { setPlaying(false); return }
    const t = window.setTimeout(() => setIndex((i) => Math.min(total, i + 1)), 1100)
    return () => window.clearTimeout(t)
  }, [playing, index, total])

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current) }, [])

  const move = (next: number) => {
    setIndex(next)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => notify(`State reconstructed from ${next} event${next === 1 ? '' : 's'}`, 'info'), 700)
  }

  const replayFromStart = () => { setIndex(1); setPlaying(true) }

  if (events.error || shipments.error) {
    return <ErrorState title="Unable to load event stream" message={events.error ?? shipments.error ?? undefined} onRetry={() => { events.reload(); shipments.reload() }} />
  }

  const historical = state !== null && state.version < total

  return (
    <div className="space-y-6">
      <PageIntro
        title="Shipment State Reconstruction"
        description="The current state of a shipment is never stored. It is rebuilt by replaying its events. Move the slider to see the state at any point in its history."
        actions={
          <div>
            <label htmlFor="tl-shipment" className="sr-only">Select shipment</label>
            <select id="tl-shipment" className="input" value={shipmentId} onChange={(e) => { setPlaying(false); setState(null); setShipmentId(e.target.value) }}>
              {(shipments.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.id} · {s.origin} → {s.destination}</option>)}
              {!shipments.data && <option value={DEFAULT_SHIPMENT}>{DEFAULT_SHIPMENT}</option>}
            </select>
          </div>
        }
      />

      {events.loading || total === 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div className="lg:col-span-2"><CardSkeleton lines={6} /></div><CardSkeleton lines={7} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard title="Event timeline" description="Drag the scrubber or select an event" className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => (playing ? setPlaying(false) : index >= total ? replayFromStart() : setPlaying(true))}>
                {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                {playing ? 'Pause' : index >= total ? 'Replay' : 'Play'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => { setPlaying(false); move(1) }}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset</button>
              <span className="ml-auto text-sm muted" aria-live="polite">Event {index} of {total}</span>
            </div>

            <div className="mt-5 px-1">
              <label htmlFor="scrubber" className="sr-only">Time scrubber: choose how many events to replay</label>
              <input
                id="scrubber"
                type="range"
                min={1}
                max={total}
                step={1}
                value={index}
                onChange={(e) => { setPlaying(false); move(Number(e.target.value)) }}
                aria-valuetext={`Event ${index} of ${total}: ${humanizeEvent(list[index - 1].type)}`}
                className="h-2 w-full cursor-pointer accent-brand-600"
              />
            </div>

            <ol className="mt-4 space-y-1.5" aria-label="Events in order">
              {list.map((e, i) => {
                const applied = i < index
                const isCurrent = i === index - 1
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => { setPlaying(false); move(i + 1) }}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        isCurrent ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30' : 'border-slate-200 hover:bg-slate-50 dark:border-ink-800 dark:hover:bg-ink-800'
                      } ${applied ? '' : 'opacity-50'}`}
                    >
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${applied ? 'bg-brand-600 text-white' : 'bg-slate-200 text-ink-600 dark:bg-ink-700 dark:text-slate-300'}`}>{e.version}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs font-medium">{e.type}</span>
                        <span className="block truncate text-xs muted">{formatDateTime(e.timestamp)} · {e.actor} · {e.location}</span>
                      </span>
                      <span className="shrink-0 text-xs muted">{applied ? 'applied' : 'not yet applied'}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </SectionCard>

          <section className="card h-fit lg:sticky lg:top-24" aria-label="Current reconstructed state">
            <div className="border-b border-slate-200 px-5 py-3.5 dark:border-ink-800">
              <h3 className="text-sm font-semibold">Current reconstructed state</h3>
              <p className="mt-0.5 text-xs muted">As of {state ? formatDateTime(state.asOf) : '…'}</p>
            </div>
            {stateError ? (
              <p className="p-5 text-sm text-red-700 dark:text-red-300" role="alert">{stateError}</p>
            ) : !state ? (
              <div className="p-5"><CardSkeleton lines={5} /></div>
            ) : (
              <div className="p-5" aria-live="polite">
                {historical && <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">Viewing historical state. The latest version is v{total}.</p>}
                <dl className="space-y-3 text-sm">
                  {[
                    ['Shipment', state.shipmentId],
                    ['Container', state.containerId],
                    ['Location', state.location],
                    ['Temperature', state.temperatureC === null ? 'n/a' : `${state.temperatureC}°C`],
                    ['Version', `v${state.version}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4"><dt className="muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                  ))}
                  <div className="flex items-center justify-between gap-4"><dt className="muted">Status</dt><dd><StatusBadge status={state.status} /></dd></div>
                  <div className="flex items-center justify-between gap-4"><dt className="muted">Risk</dt><dd><RiskBadge risk={state.risk} /></dd></div>
                </dl>
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-xs dark:bg-ink-800">State reconstructed from <strong>{state.eventCount}</strong> event{state.eventCount === 1 ? '' : 's'}</p>
              </div>
            )}
          </section>
        </div>
      )}

      <CrudVsEventSourcing />
      <CqrsFlow />
    </div>
  )
}
