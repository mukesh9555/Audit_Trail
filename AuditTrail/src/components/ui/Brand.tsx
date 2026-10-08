export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center rounded-lg bg-brand-600 text-white ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M5 7h14M5 12h14M5 17h8" />
      </svg>
    </span>
  )
}
