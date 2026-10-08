import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-ink-800"><Compass className="h-5 w-5" aria-hidden="true" /></div>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm muted">The page you are looking for does not exist or has moved. Go back to the dashboard to continue.</p>
      <Link to="/dashboard" className="btn-primary mt-5">Go to dashboard</Link>
    </div>
  )
}
