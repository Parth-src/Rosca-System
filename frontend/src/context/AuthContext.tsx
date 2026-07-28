import * as React from "react"
import { authApi, clearToken, getToken, setToken } from "@/lib/api"
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types"

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (req: LoginRequest) => Promise<void>
  register: (req: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: (partial: Partial<AuthUser>) => void
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)
const USER_KEY = "circl_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null
      if (raw && getToken()) setUser(JSON.parse(raw) as AuthUser)
    } catch {
      // ignore
    }
    setIsReady(true)
  }, [])

  const persist = React.useCallback((u: AuthUser) => {
    setToken(u.token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const login = React.useCallback(async (req: LoginRequest) => {
    const u = await authApi.login(req); persist(u)
  }, [persist])

  const register = React.useCallback(async (req: RegisterRequest) => {
    const u = await authApi.register(req); persist(u)
  }, [persist])

  const logout = React.useCallback(() => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const refreshUser = React.useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...partial }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = React.useMemo(
    () => ({ user, isAuthenticated: !!user, isReady, login, register, logout, refreshUser }),
    [user, isReady, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}