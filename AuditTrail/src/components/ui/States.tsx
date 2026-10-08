import type { ReactNode } from 'react'
import { AlertTriangle, FileText, Package, Search, ScrollText, type LucideIcon } from 'lucide-react'

interface EmptyProps {
  icon?: LucideIcon
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Search, title, message, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-500 dark:bg-ink-800 dark:text-slate-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm muted">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export const NoShipments = ({ action }: { action?: ReactNode }) => (
  <EmptyState icon={Package} title="No shipments match your filters" message="Try a different search term, or clear the status and risk filters to see every shipment." action={action} />
)
export const NoLogs = ({ action }: { action?: ReactNode }) => (
  <EmptyState icon={ScrollText} title="No audit records found" message="No log entries match the current filters. Widen the date range or clear a filter to see more." action={action} />
)
export const NoReports = () => (
  <EmptyState icon={FileText} title="No reports available" message="Reports appear here once they have been generated from the event store." />
)

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Unable to load data', message = 'The request did not complete. Check your connection and try again.', onRetry }: ErrorProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center" role="alert">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}
