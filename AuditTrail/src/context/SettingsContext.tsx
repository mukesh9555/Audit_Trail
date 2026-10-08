import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants'

interface SettingsValue {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsValue | null>(null)

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    if (!raw) return DEFAULT_SETTINGS
    const p = JSON.parse(raw) as Partial<Settings>
    return {
      theme: p.theme === 'dark' ? 'dark' : 'light',
      notifications: { ...DEFAULT_SETTINGS.notifications, ...p.notifications },
      account: { ...DEFAULT_SETTINGS.account, ...p.account },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function persist(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s))
  } catch {
    /* storage unavailable (private mode); settings stay in memory */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    persist(DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
