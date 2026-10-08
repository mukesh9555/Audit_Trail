import { useState } from 'react'
import { CheckCircle2, Minus, Plus, XCircle } from 'lucide-react'
import { SectionCard } from './ui/Layout'

type Outcome = { kind: 'accepted'; newVersion: number } | { kind: 'conflict'; expected: number } | null

/** Frontend-only simulation of optimistic concurrency control on an event stream. */
export function OccDemo({ currentVersion }: { currentVersion: number }) {
  const [expected, setExpected] = useState(currentVersion)
  const [outcome, setOutcome] = useState<Outcome>(null)

  const submit = () => setOutcome(expected === currentVersion ? { kind: 'accepted', newVersion: currentVersion + 1 } : { kind: 'conflict', expected })
  const set = (v: number) => { setExpected(Math.max(0, v)); setOutcome(null) }

  return (
    <SectionCard title="Optimistic concurrency control" description="A command only succeeds if the caller saw the latest version of the stream. Simulated in your browser.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3 dark:border-ink-700">
          <p className="text-xs muted">Current version (event store)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{currentVersion}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3 dark:border-ink-700">
          <label htmlFor="expected-version" className="text-xs muted">Expected version (sent by the command)</label>
          <div className="mt-1 flex items-center gap-2">
            <button type="button" className="btn-secondary px-2" onClick={() => set(expected - 1)} aria-label="Decrease expected version"><Minus className="h-4 w-4" aria-hidden="true" /></button>
            <input id="expected-version" type="number" min={0} className="input w-20 text-center tabular-nums" value={expected} onChange={(e) => set(Number(e.target.value) || 0)} />
            <button type="button" className="btn-secondary px-2" onClick={() => set(expected + 1)} aria-label="Increase expected version"><Plus className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={submit}>Send AppendEvent command</button>
        <button type="button" className="btn-secondary" onClick={() => set(currentVersion)}>Use current (v{currentVersion})</button>
        <button type="button" className="btn-secondary" onClick={() => set(Math.max(0, currentVersion - 1))}>Use stale (v{Math.max(0, currentVersion - 1)})</button>
      </div>

      <div className="mt-4 min-h-[4.5rem]" aria-live="polite">
        {outcome?.kind === 'accepted' && (
          <div className="flex gap-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div><p className="font-semibold">Command accepted</p><p>Expected v{expected} matches the stream. The event would be appended as v{outcome.newVersion}. Nothing is written in this demo.</p></div>
          </div>
        )}
        {outcome?.kind === 'conflict' && (
          <div className="flex gap-3 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div><p className="font-semibold">409 CONFLICT</p><p>Stale version detected. The command expected v{outcome.expected} but the stream is at v{currentVersion}. Reload the stream, review the new events, and retry.</p></div>
          </div>
        )}
        {!outcome && <p className="text-sm muted">Send the command with the current version to see it accepted, or set the expected version lower to trigger a conflict.</p>}
      </div>
    </SectionCard>
  )
}
