import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, ShieldCheck, History, GitBranch } from 'lucide-react'
import { BrandMark } from '../components/ui/Brand'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function LoginPage() {
  usePageTitle()
  const { isAuthenticated, signIn } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const enter = (address: string, keep: boolean) => {
    signIn(address, keep)
    notify(`Signed in as ${address}`)
    navigate('/dashboard')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address, for example demo@audittrail.com.'
    if (password.length < 6) next.password = 'Password must be at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length === 0) enter(email.trim(), remember)
  }

  const points = [
    { icon: History, title: 'Immutable event history', text: 'Every change is appended as an event. Nothing is edited or deleted.' },
    { icon: GitBranch, title: 'State by replay', text: 'Rebuild any shipment as it was at any moment by replaying its events.' },
    { icon: ShieldCheck, title: 'Audit-ready by design', text: 'Versioned, timestamped and attributed records for regulated logistics.' },
  ]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <span className="text-xl font-semibold tracking-tight">AuditTrail</span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">Know exactly what happened to every container, and when.</h2>
          <ul className="mt-10 space-y-6">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-0.5 max-w-sm text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">Static demonstration. Data is simulated in your browser.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark className="h-10 w-10" />
            <span className="text-xl font-semibold tracking-tight">AuditTrail</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to AuditTrail</h1>
          <p className="mt-1 text-sm muted">Event-Sourced Inventory &amp; Logistics Ledger</p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@audittrail.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink-700 dark:text-slate-300">Password</label>
                <button type="button" className="rounded text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300" onClick={() => notify('Password reset is disabled in this static demo. Use any password with 6 or more characters.', 'info')}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="input pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              Remember me
            </label>
            <button type="submit" className="btn-primary w-full">
              <Lock className="h-4 w-4" aria-hidden="true" /> Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs muted" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200 dark:bg-ink-800" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-ink-800" />
          </div>
          <button type="button" className="btn-secondary w-full" onClick={() => enter('demo@audittrail.com', true)}>
            Continue as Demo User
          </button>
          <p className="mt-6 rounded-md bg-slate-100 p-3 text-xs muted dark:bg-ink-800">
            Demo credentials: <span className="font-mono">demo@audittrail.com</span> / <span className="font-mono">password123</span>. Any valid-looking email and a password of 6+ characters also works. There is no real authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
