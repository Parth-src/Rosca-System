import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/context/AuthContext"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isReady && !isAuthenticated) navigate({ to: "/login" })
  }, [isReady, isAuthenticated, navigate])

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }
  return <>{children}</>
}