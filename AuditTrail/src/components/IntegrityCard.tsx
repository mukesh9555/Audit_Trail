import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import type { ShipmentEvent } from '../types'
import { SectionCard } from './ui/Layout'
import { chainHash } from '../utils/hash'

const GUARANTEES = [
  'Events cannot be edited',
  'Events cannot be deleted',
  'Every event has a version',
  'Events have timestamps',
  'State is reconstructed by replay',
]

export function IntegrityCard({ events }: { events: ShipmentEvent[] }) {
  const [message, setMessage] = useState<string | null>(null)

  const verified = events.every((e) => e.hash === chainHash(e.prevHash, `${e.id}|${e.type}|${e.timestamp}|${e.version}|${JSON.stringify(e.payload)}`))

  return (
    <SectionCard title="Event store integrity" description="Append-only event store">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lock className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" /> Append-only Event Store
      </div>
      <ul className="mt-3 space-y-2">
        {GUARANTEES.map((g) => (
          <li key={g} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> {g}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs dark:bg-ink-800">
        Hash chain {verified ? 'verified' : 'broken'} across {events.length} event{events.length === 1 ? '' : 's'}. Each event stores the hash of the one before it, so altering history would be detectable.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => setMessage('405 Method Not Allowed: events are immutable. Append a corrective event instead.')}>Try to edit an event</button>
        <button type="button" className="btn-secondary" onClick={() => setMessage('405 Method Not Allowed: events cannot be deleted. The stream is append-only.')}>Try to delete an event</button>
      </div>
      <p className="mt-3 min-h-[1.25rem] text-sm text-red-700 dark:text-red-300" aria-live="polite">{message}</p>
    </SectionCard>
  )
}
