import type { EventStatus, LogStatus, RiskLevel, ShipmentStatus } from '../../types'

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium'

const STATUS_TONE: Record<ShipmentStatus, string> = {
  Created: 'bg-slate-100 text-slate-700 dark:bg-ink-800 dark:text-slate-300',
  Loaded: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'In Transit': 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  'Temperature Alert': 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'At Port': 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'Under Inspection': 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Cleared: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const RISK_TONE: Record<RiskLevel, { cls: string; dot: string }> = {
  Low: { cls: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Medium: { cls: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  High: { cls: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
}

const EVENT_TONE: Record<EventStatus | LogStatus, string> = {
  OK: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  SUCCESS: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  WARNING: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CRITICAL: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  FAILED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return <span className={`${base} ${STATUS_TONE[status]}`}>{status}</span>
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const t = RISK_TONE[risk]
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${t.cls}`}>
      <span className={`h-2 w-2 rounded-full ${t.dot}`} aria-hidden="true" />
      {risk}
    </span>
  )
}

export function StateBadge({ status }: { status: EventStatus | LogStatus }) {
  return <span className={`${base} ${EVENT_TONE[status]}`}>{status}</span>
}

export function EventTypeTag({ type }: { type: string }) {
  return (
    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-ink-700 dark:bg-ink-800 dark:text-slate-300">{type}</span>
  )
}
