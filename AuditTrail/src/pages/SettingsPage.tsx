import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { PageIntro, SectionCard, Field } from '../components/ui/Layout'
import { Toggle } from '../components/ui/Toggle'
import { armFailure } from '../services/mockApi'
import { DEMO_NOW } from '../utils/constants'
import { formatDateTime } from '../utils/format'
import type { Settings } from '../types'

export default function SettingsPage() {
  usePageTitle('Settings')
  const { settings, update, reset } = useSettings()
  const { notify } = useToast()
  const [notifications, setNotifications] = useState<Settings['notifications']>(settings.notifications)
  const [account, setAccount] = useState<Settings['account']>(settings.account)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const save = () => {
    const next: typeof errors = {}
    if (!account.name.trim()) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(account.email.trim())) next.email = 'Enter a valid email address.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    update({ notifications, account: { ...account, name: account.name.trim(), email: account.email.trim() } })
    notify('Settings saved')
  }

  const restore = () => {
    reset()
    setNotifications(settings.notifications)
    setAccount(settings.account)
    notify('Defaults restored', 'info')
    window.setTimeout(() => window.location.reload(), 400)
  }

  const flag = (key: keyof Settings['notifications']) => (v: boolean) => setNotifications((n) => ({ ...n, [key]: v }))
  const themes = [
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'dark', label: 'Dark Mode', icon: Moon },
  ] as const

  return (
    <div className="max-w-3xl space-y-6">
      <PageIntro title="Settings" description="Preferences are stored in this browser using localStorage." />

      <SectionCard title="Appearance" description="Theme changes apply immediately.">
        <fieldset>
          <legend className="sr-only">Theme</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themes.map(({ value, label, icon: Icon }) => (
              <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${settings.theme === value ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30' : 'border-slate-200 dark:border-ink-700'}`}>
                <input type="radio" name="theme" value={value} checked={settings.theme === value} onChange={() => update({ theme: value })} className="h-4 w-4 text-brand-600" />
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </SectionCard>

      <SectionCard title="Notifications">
        <div className="-my-3 divide-y divide-slate-200 dark:divide-ink-800">
          <Toggle id="n-email" label="Email Notifications" description="Receive shipment updates by email." checked={notifications.email} onChange={flag('email')} />
          <Toggle id="n-login" label="Failed Login Alerts" description="Alert when sign-in attempts fail repeatedly." checked={notifications.failedLogin} onChange={flag('failedLogin')} />
          <Toggle id="n-critical" label="Critical Shipment Alerts" description="Alert on high-risk temperature exceptions." checked={notifications.critical} onChange={flag('critical')} />
          <Toggle id="n-digest" label="Weekly Digest" description="A summary of events and exceptions every Monday." checked={notifications.digest} onChange={flag('digest')} />
        </div>
      </SectionCard>

      <SectionCard title="Account">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-name" className="label">Name</label>
            <input id="acc-name" className="input" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="acc-email" className="label">Email</label>
            <input id="acc-email" type="email" className="input" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="acc-role" className="label">Role</label>
            <select id="acc-role" className="input" value={account.role} onChange={(e) => setAccount({ ...account, role: e.target.value })}>
              {['Administrator', 'Compliance Auditor', 'Logistics Operator', 'Read-only Viewer'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="System" description="Read-only. This build is a static demonstration.">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Environment" value="Demo" />
          <Field label="Database" value="Simulated" />
          <Field label="Event Store" value="Static Mock" />
        </dl>
        <p className="mt-4 text-xs muted">Demo clock is fixed at {formatDateTime(DEMO_NOW.toISOString())} so relative times stay consistent with the sample data.</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => { armFailure(); notify('The next data request will fail once, so you can see the error state.', 'info') }}>
          Simulate a failed request
        </button>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={save}>Save Changes</button>
        <button type="button" className="btn-ghost" onClick={restore}>Restore defaults</button>
      </div>
    </div>
  )
}
