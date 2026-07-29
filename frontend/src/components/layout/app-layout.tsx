import * as React from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { LayoutDashboard, UsersRound, Wallet, UserRound, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/shared/logo"
import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/circl-utils"

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/groups", label: "Groups", icon: UsersRound },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const

function BalanceRefresher() {
  const { user, refreshUser } = useAuth()
  
  const q = useQuery({
    queryKey: ["currentUser", user?.userId],
    queryFn: () => userApi.get(user!.userId),
    enabled: !!user?.userId,
    refetchInterval: 3000,
  })

  React.useEffect(() => {
    if (q.data && user && q.data.accountBalance !== user.accountBalance) {
      refreshUser({ accountBalance: q.data.accountBalance })
    }
  }, [q.data, user, refreshUser])

  return null
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const isActive = pathname === to || pathname.startsWith(to + "/")
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function UserCard({ name, balance, onLogout }: { name?: string; balance?: number; onLogout: () => void }) {
  const initials = name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U"
  return (
    <div className="mt-4 rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name ?? "Guest"}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(balance ?? 0)}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Log out" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: "/login" })
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      <BalanceRefresher />
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/60 p-4 lg:flex">
        <Link to="/dashboard" className="px-2 py-3">
          <Logo />
        </Link>
        <div className="mt-6 flex-1">
          <NavItems />
        </div>
        <UserCard name={user?.name} balance={user?.accountBalance} onLogout={handleLogout} />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard"><Logo /></Link>
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card p-4">
            <div className="flex items-center justify-between px-2 py-3">
              <Logo />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 flex-1">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
            <UserCard name={user?.name} balance={user?.accountBalance} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <main className="flex-1 pt-16 lg:ml-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  )
}