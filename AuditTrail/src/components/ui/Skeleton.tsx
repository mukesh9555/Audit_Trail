export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} aria-hidden="true" />
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5" role="status" aria-label="Loading">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      {Array.from({ length: Math.max(0, lines - 2) }, (_, i) => (
        <Skeleton key={i} className="mt-3 h-3 w-full" />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Loading table">
      <div className="border-b border-slate-200 p-4 dark:border-ink-800">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }, (_, c) => (
              <Skeleton key={c} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const BAR_HEIGHTS = [40, 65, 50, 80, 60, 90, 55, 75, 45, 85]

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="card p-5" role="status" aria-label="Loading chart">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className="mt-5 flex items-end gap-2" style={{ height }}>
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded" style={{ height: `${h}%` }} aria-hidden="true" />
        ))}
      </div>
    </div>
  )
}
