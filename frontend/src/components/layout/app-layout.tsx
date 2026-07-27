import * as React from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, UsersRound, Wallet, UserRound, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/groups", label: "Groups", icon: UsersRound },
  { to: "/wallet", label: "Wallet", icon: Wallet, soon: true },
  { to: "/profile", label: "Profile", icon: UserRound, soon: true },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, soon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <span className="flex items-center gap-3">
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </span>
          {soon && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Soon</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/60 p-4 lg:flex">
        <Link to="/dashboard" className="px-2 py-3">
          <Logo />
        </Link>
        <div className="mt-6 flex-1">
          <NavItems />
        </div>
        <UserCard name={user?.name} balance={user?.accountBalance} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
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

      {/* Main content */}
      <main className="flex-1 pt-16 lg:ml-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function UserCard({
  name,
  balance,
  onLogout,
}: {
  name?: string
  balance?: number
  onLogout: () => void
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(balance ?? 0)}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Log out" onClick={onLogout}>
          <LogOut className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </div>
  )
}
