interface Props {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
  id: string
}

export function Toggle({ checked, onChange, label, description, id }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink-900 dark:text-slate-100">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-ink-700'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
