import { ArrowDown, ArrowRight, Database, Layers, PenLine, Repeat2, Send } from 'lucide-react'
import type { ReactNode } from 'react'
import { SectionCard } from './ui/Layout'

function Box({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'muted' | 'accent' | 'danger' }) {
  const tones = {
    plain: 'border-slate-300 bg-white dark:border-ink-700 dark:bg-ink-900',
    muted: 'border-slate-200 bg-slate-50 text-ink-500 dark:border-ink-800 dark:bg-ink-800 dark:text-slate-400',
    accent: 'border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-900/40 dark:text-brand-100',
    danger: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  }
  return <div className={`rounded-md border px-3 py-2 text-center text-sm font-medium ${tones[tone]}`}>{children}</div>
}

const Down = () => <div className="flex justify-center py-1 text-ink-400" aria-hidden="true"><ArrowDown className="h-4 w-4" /></div>

export function CrudVsEventSourcing() {
  return (
    <SectionCard title="Why events, not overwrites" description="Traditional CRUD loses history. An event store keeps every step and derives the current state.">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold">Traditional CRUD</p>
          <div className="flex flex-col items-stretch sm:flex-row sm:items-center">
            <div className="flex-1"><Box tone="muted">Previous state</Box></div>
            <div className="flex flex-col items-center px-3 py-2 text-xs text-red-700 dark:text-red-300 sm:py-0">
              <PenLine className="h-4 w-4" aria-hidden="true" />
              <span className="my-0.5">overwritten</span>
              <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
              <ArrowDown className="h-4 w-4 sm:hidden" aria-hidden="true" />
            </div>
            <div className="flex-1"><Box tone="danger">Current state</Box></div>
          </div>
          <p className="mt-3 text-xs muted">The earlier value is gone. There is no proof of what the record said yesterday.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">AuditTrail (event sourcing)</p>
          <div className="mx-auto max-w-xs">
            {['Event 1', 'Event 2', 'Event 3', 'Event 4'].map((e) => (
              <div key={e}><Box tone="plain">{e}</Box><Down /></div>
            ))}
            <Box tone="accent"><span className="inline-flex items-center gap-2"><Repeat2 className="h-4 w-4" aria-hidden="true" /> Replay events</span></Box>
            <Down />
            <Box tone="accent">Current state</Box>
          </div>
          <p className="mt-3 text-xs muted">Events are appended, never changed. Any past state can be rebuilt by replaying events up to that point.</p>
        </div>
      </div>
    </SectionCard>
  )
}

export function CqrsFlow() {
  const steps = [
    { icon: Send, title: 'Command side', text: 'AppendEvent is validated, version-checked (OCC) and accepted or rejected.' },
    { icon: Database, title: 'Event store', text: 'Accepted events are appended to the stream. Immutable and ordered.' },
    { icon: Layers, title: 'Projection', text: 'Workers fold events into read models such as the shipments table.' },
    { icon: Repeat2, title: 'Query side', text: 'Screens read the projections. Reads never touch the write path.' },
  ]
  return (
    <SectionCard title="CQRS: separate writes from reads" description="Commands change history. Queries read a view derived from that history.">
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative rounded-md border border-slate-200 p-3 dark:border-ink-700">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200"><Icon className="h-4 w-4" aria-hidden="true" /></span>
              {title}
            </div>
            <p className="mt-2 text-xs muted">{text}</p>
            {i < steps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-white text-ink-400 dark:bg-ink-950 md:block" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
