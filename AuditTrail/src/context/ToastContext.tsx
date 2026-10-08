import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

type ToastKind = 'success' | 'info' | 'error'
interface Toast { id: number; kind: ToastKind; message: string }
interface ToastValue { notify: (message: string, kind?: ToastKind) => void }

const ToastContext = createContext<ToastValue | null>(null)

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert }
const TONES: Record<ToastKind, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-brand-600 dark:text-brand-400',
  error: 'text-red-600 dark:text-red-400',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId.current++
    setToasts((t) => [...t.slice(-2), { id, kind, message }])
    window.setTimeout(() => dismiss(id), 3800)
  }, [dismiss])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-ink-700 dark:bg-ink-800">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${TONES[t.kind]}`} aria-hidden="true" />
              <p className="flex-1 text-sm text-ink-800 dark:text-slate-100">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} className="rounded text-ink-400 hover:text-ink-700 dark:hover:text-slate-200" aria-label="Dismiss notification">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
