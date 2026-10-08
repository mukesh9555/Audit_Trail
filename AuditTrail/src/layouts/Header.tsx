import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, Menu, Moon, Settings as SettingsIcon, Sun, User } from 'lucide-react'
import { GlobalSearch } from '../components/GlobalSearch'
import { NAV_ITEMS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { useClickOutside } from '../hooks/useClickOutside'
import { SHIPMENTS } from '../data/shipments'
import { initials, relativeTime } from '../utils/format'

function useCrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const base = NAV_ITEMS.find((n) => n.to === `/${parts[0]}`)
  const crumbs: Array<{ label: string; to?: string }> = [{ label: 'AuditTrail', to: '/dashboard' }]
  if (base) crumbs.push({ label: base.label, to: parts.length > 1 ? base.to : undefined })
  if (parts[0] === 'shipments' && parts[1]) crumbs.push({ label: parts[1] })
  const title = parts[0] === 'shipments' && parts[1] ? parts[1] : (base?.title ?? 'AuditTrail')
  return { crumbs, title }
}

const ALERTS = SHIPMENTS.filter((s) => s.risk === 'High' || s.status === 'Temperature Alert')
  .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
  .slice(0, 4)

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { crumbs, title } = useCrumbs()
  const { settings, update } = useSettings()
  const { signOut } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<'profile' | 'alerts' | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setMenu(null), menu !== null)

  const dark = settings.theme === 'dark'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onOpenMenu} className="btn-ghost px-2 lg:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="hidden min-w-0 md:block">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-xs muted">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                  {c.to ? (
                    <Link to={c.to} className="rounded hover:text-ink-900 dark:hover:text-slate-100">{c.label}</Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-ink-700 dark:text-slate-200">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
        </div>
        <h1 className="min-w-0 truncate text-base font-semibold md:hidden">{title}</h1>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2" ref={ref}>
          <GlobalSearch />

          <button type="button" onClick={() => update({ theme: dark ? 'light' : 'dark' })} className="btn-ghost px-2" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>

          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === 'alerts' ? null : 'alerts')} className="btn-ghost relative px-2" aria-label={`Notifications, ${ALERTS.length} unread`} aria-expanded={menu === 'alerts'} aria-haspopup="menu">
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            </button>
            {menu === 'alerts' && (
              <div role="menu" aria-label="Notifications" className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white shadow-lg dark:border-ink-700 dark:bg-ink-800">
                <p className="border-b border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-ink-700">Critical shipment alerts</p>
                <ul>
                  {ALERTS.map((s) => (
                    <li key={s.id}>
                      <button type="button" role="menuitem" onClick={() => { setMenu(null); navigate(`/shipments/${s.id}`) }} className="block w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-ink-700">
                        <span className="block text-sm font-medium">{s.id} · {s.containerId}</span>
                        <span className="block text-xs muted">{s.status}, risk {s.risk} · {relativeTime(s.lastUpdated)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === 'profile' ? null : 'profile')} className="flex items-center rounded-full" aria-label="Open profile menu" aria-expanded={menu === 'profile'} aria-haspopup="menu">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white dark:bg-slate-700">{initials(settings.account.name)}</span>
            </button>
            {menu === 'profile' && (
              <div role="menu" aria-label="Profile" className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-ink-700 dark:bg-ink-800">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-ink-700">
                  <p className="truncate text-sm font-medium">{settings.account.name}</p>
                  <p className="truncate text-xs muted">{settings.account.email}</p>
                </div>
                <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-ink-700" onClick={() => { setMenu(null); navigate('/settings') }}>
                  <User className="h-4 w-4" aria-hidden="true" /> Account
                </button>
                <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-ink-700" onClick={() => { setMenu(null); navigate('/settings') }}>
                  <SettingsIcon className="h-4 w-4" aria-hidden="true" /> Settings
                </button>
                <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:text-red-300 dark:hover:bg-ink-700" onClick={() => { setMenu(null); signOut(); notify('You have been signed out.', 'info') }}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
