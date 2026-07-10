import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as api from '../api/client'

export interface AuthUser {
  id: string; username: string; email: string; full_name: string; role_id: string; user_type: string; is_active: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, login: async () => {}, logout: async () => {}, refreshUser: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = api.getStoredUser()
    if (stored && api.getToken()) { setUser(stored); api.getMe().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)) }
    else setLoading(false)
  }, [])

  const loginFn = useCallback(async (username: string, password: string) => { const u = await api.login(username, password); setUser(u) }, [])
  const logoutFn = useCallback(async () => { await api.logout(); setUser(null) }, [])
  const refreshUser = useCallback(async () => { try { setUser(await api.getMe()) } catch {} }, [])

  return <AuthContext.Provider value={{ user, loading, login: loginFn, logout: logoutFn, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
