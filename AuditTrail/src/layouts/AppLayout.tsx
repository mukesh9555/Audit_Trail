import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const COLLAPSE_KEY = 'audittrail.sidebar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1')
      } catch {
        /* ignore */
      }
      return !c
    })

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main id="main" className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-4 py-4 text-xs muted dark:border-ink-800 sm:px-6 lg:px-8">
          Static demonstration: all data is simulated by a mock service layer. No backend or database is in use.
        </footer>
      </div>
    </div>
  )
}
