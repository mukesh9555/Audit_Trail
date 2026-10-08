import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

interface AuthValue {
  isAuthenticated: boolean
  signIn: (email: string, remember: boolean) => void
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function readSession(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.session) ?? sessionStorage.getItem(STORAGE_KEYS.session))
  } catch {
    return false
  }
}

/** Demo-only session flag. There is no server and no credential check. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(readSession)

  const signIn = useCallback((email: string, remember: boolean) => {
    try {
      const store = remember ? localStorage : sessionStorage
      store.setItem(STORAGE_KEYS.session, email)
    } catch {
      /* ignore storage errors */
    }
    setAuthenticated(true)
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.session)
      sessionStorage.removeItem(STORAGE_KEYS.session)
    } catch {
      /* ignore storage errors */
    }
    setAuthenticated(false)
  }, [])

  const value = useMemo(() => ({ isAuthenticated, signIn, signOut }), [isAuthenticated, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
