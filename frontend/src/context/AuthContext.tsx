import * as React from "react"
import { authApi, clearToken, getToken, setToken } from "@/lib/api"
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types"

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (req: LoginRequest) => Promise<void>
  register: (req: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

const USER_KEY = "circl_user"

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw && getToken()) return JSON.parse(raw) as AuthUser
  } catch {
    // ignore
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => loadStoredUser())
  const [isLoading] = React.useState(false)

  const persist = React.useCallback((u: AuthUser) => {
    setToken(u.token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const login = React.useCallback(
    async (req: LoginRequest) => {
      const u = await authApi.login(req)
      persist(u)
    },
    [persist],
  )

  const register = React.useCallback(
    async (req: RegisterRequest) => {
      const u = await authApi.register(req)
      persist(u)
    },
    [persist],
  )

  const logout = React.useCallback(() => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = React.useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
