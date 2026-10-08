import { NavLink } from 'react-router-dom'
import { Activity, BarChart3, ChevronsLeft, ChevronsRight, FileText, LayoutDashboard, LogOut, Package, ScrollText, Settings as SettingsIcon, X, type LucideIcon } from 'lucide-react'
import { BrandMark } from '../components/ui/Brand'
import { NAV_ITEMS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { initials } from '../utils/format'

const ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/shipments': Package,
  '/timeline': Activity,
  '/audit-logs': ScrollText,
  '/reports': FileText,
  '/analytics': BarChart3,
  '/settings': SettingsIcon,
}

interface Props {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: Props) {
  const { signOut } = useAuth()
  const { settings } = useSettings()
  const { notify } = useToast()
  // On mobile the drawer is always expanded; the collapsed state only applies from lg up.
  const narrow = collapsed

  const handleSignOut = () => {
    signOut()
    notify('You have been signed out.', 'info')
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />}
      <aside
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-ink-800 dark:bg-ink-900 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${narrow ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        <div className={`flex h-16 items-center border-b border-slate-200 px-4 dark:border-ink-800 ${narrow ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className={`text-lg font-semibold tracking-tight ${narrow ? 'lg:hidden' : ''}`}>AuditTrail</span>
          </div>
          <button type="button" onClick={onCloseMobile} className="btn-ghost px-2 lg:hidden" aria-label="Close navigation menu">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.to]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={narrow ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${narrow ? 'lg:justify-center lg:px-0' : ''} ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'text-ink-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className={narrow ? 'lg:sr-only' : ''}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-ink-800">
          <button type="button" onClick={onToggleCollapse} className={`btn-ghost mb-2 hidden w-full lg:flex ${narrow ? 'px-0' : 'justify-start'}`} aria-label={narrow ? 'Expand sidebar' : 'Collapse sidebar'}>
            {narrow ? <ChevronsRight className="h-4 w-4" aria-hidden="true" /> : <ChevronsLeft className="h-4 w-4" aria-hidden="true" />}
            <span className={narrow ? 'hidden' : ''}>Collapse</span>
          </button>
          <div className={`flex items-center gap-3 ${narrow ? 'lg:justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white dark:bg-slate-700" aria-hidden="true">
              {initials(settings.account.name)}
            </span>
            <div className={`min-w-0 flex-1 ${narrow ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-medium">{settings.account.name}</p>
              <p className="truncate text-xs muted">{settings.account.role}</p>
            </div>
            <button type="button" onClick={handleSignOut} className={`btn-ghost px-2 ${narrow ? 'lg:hidden' : ''}`} aria-label="Log out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {narrow && (
            <button type="button" onClick={handleSignOut} className="btn-ghost mt-2 hidden w-full px-0 lg:flex" aria-label="Log out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
