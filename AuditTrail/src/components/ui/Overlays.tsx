import { useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface OverlayProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ title, subtitle, onClose, children }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, onClose)
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl dark:border-ink-800 dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-ink-800">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-sm muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 px-2" aria-label="Close panel">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, footer }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl dark:border-ink-800 dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-ink-800">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 px-2" aria-label="Close dialog">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-ink-800">{footer}</div>}
      </div>
    </div>
  )
}
