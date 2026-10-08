import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageIntro({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm muted">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function SectionCard({ title, description, actions, children, className = '' }: { title: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card min-w-0 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-5 py-3.5 dark:border-ink-800">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs muted">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: { label: string; value: string; hint: string; icon: LucideIcon; tone?: 'default' | 'danger' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${tone === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200'}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs muted">{hint}</p>
    </div>
  )
}

export function Field({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium muted">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm font-medium text-ink-900 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
