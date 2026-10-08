import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-ink-800" aria-label="Pagination">
      <p className="text-sm muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary px-2.5" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-sm muted" aria-live="polite">
          Page {page} of {pages}
        </span>
        <button type="button" className="btn-secondary px-2.5" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
