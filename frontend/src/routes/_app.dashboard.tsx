import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Wallet, Users, CalendarClock, ShieldCheck, ArrowRight, Plus, Receipt, Sparkles } from "lucide-react"
import { dashboardApi, membershipApi, groupApi, transactionApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatFrequency, formatDateTime } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import type { Group } from "@/types"

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Circl" },
      { name: "description", content: "Your savings snapshot: active circles, upcoming contributions, and trust score." },
      { property: "og:title", content: "Dashboard — Circl" },
      { property: "og:description", content: "Your savings snapshot on Circl." },
    ],
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardApi.getSummary() })
  const memberships = useQuery({
    queryKey: ["memberships", user?.userId],
    queryFn: () => membershipApi.getUserMemberships(user!.userId),
    enabled: !!user,
  })
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => groupApi.getAll() })
  const txs = useQuery({
    queryKey: ["transactions", user?.userId],
    queryFn: () => transactionApi.getForUser(user!.userId),
    enabled: !!user,
  })

  const myGroupIds = new Set((memberships.data ?? []).map((m) => m.groupId))

  // My Circles & Latest 4
  const myGroups: Group[] = (memberships.data ?? [])
    .map((m) => groups.data?.find((g) => g.id === m.groupId))
    .filter((g): g is Group => !!g)

  const latestMyGroups = myGroups.slice(0, 4)

  // Discover Circles & Latest 4
  const discoverGroups = (groups.data ?? []).filter((g) => !myGroupIds.has(g.id))
  const latestDiscoverGroups = discoverGroups.slice(0, 4)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "friend"}.`}
        description="Your circles, contributions, and trust score at a glance."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Small Available Balance Pill Top-Right */}
            <div className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/10 px-3.5 py-1.5 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available Balance</span>
                <span className="font-serif text-sm font-bold text-foreground tabular-nums">{formatCurrency(user?.accountBalance ?? 0)}</span>
              </div>
            </div>

            <Button asChild size="sm">
              <Link to="/groups/create"><Plus className="h-4 w-4" /> New Circle</Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Wallet} label="Total savings" value={formatCurrency(summary.data?.totalSavings ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={Users} label="Active circles" value={String(summary.data?.activeGroupsCount ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={CalendarClock} label="Upcoming contribution" value={formatCurrency(summary.data?.upcomingContribution ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={ShieldCheck} label="Trust score" value={`${summary.data?.riskScore ?? 0}/100`} loading={summary.isLoading} accent />
      </div>

      {/* Main Grid: Circles on Left (Span 2), Sidebar Cards on Right (Span 1) */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: My Circles & Discover Circles */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* MY CIRCLES SECTION (MAX 4) */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight">My circles</h2>
                <p className="text-sm text-muted-foreground">Circles you are actively participating in.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/groups">View all ({myGroups.length}) <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            {memberships.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
            ) : myGroups.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {latestMyGroups.map((g) => {
                  const m = memberships.data!.find((x) => x.groupId === g.id)!
                  return (
                    <Card key={g.id} className="border-border transition-all hover:shadow-sm">
                      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                        <div>
                          <CardTitle className="font-serif text-base">{g.groupName}</CardTitle>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cycle {g.currentCycle}/{g.numberOfCycles} · {formatFrequency(g.groupFrequency)}
                          </p>
                        </div>
                        <StatusBadge status={m.status} />
                      </CardHeader>
                      <CardContent className="flex items-end justify-between pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Contribution</p>
                          <p className="font-serif text-lg font-semibold tabular-nums">
                            {formatCurrency(g.contributionAmount)}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/groups/$id" params={{ id: String(g.id) }}>Open</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* DISCOVER CIRCLES SECTION (MAX 4) */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight">Discover circles</h2>
                <p className="text-sm text-muted-foreground">Open pools accepting members right now.</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/groups">View all ({discoverGroups.length}) <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            {groups.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
            ) : latestDiscoverGroups.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No new circles available right now.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {latestDiscoverGroups.map((g) => (
                  <DiscoverCard key={g.id} group={g} />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: RECENT TRANSACTIONS + SAVINGS HEALTH WIDGET */}
        <div className="space-y-6 lg:col-span-1">
          {/* RECENT TRANSACTIONS CARD */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Receipt className="h-4.5 w-4.5 text-muted-foreground" />
                <CardTitle className="font-serif text-lg">Recent transactions</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Link to="/wallet">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {txs.isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (txs.data ?? []).length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No recent transactions yet.</p>
              ) : (
                (txs.data ?? []).slice(0, 5).map((t) => {
                  const raw = String(t.transactionType || t.type || "").toUpperCase()
                  const label =
                    raw === "CONTRIBUTION"
                      ? "Contribution"
                      : raw === "ALLOCATION" || raw === "PAYOUT"
                      ? "Pool"
                      : raw === "DIVIDEND"
                      ? "Dividend"
                      : raw === "PENALTY"
                      ? "Penalty"
                      : "Transaction"
                  const desc = t.description || (t.groupName ? `${label} — ${t.groupName}` : label)

                  return (
                    <div key={t.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors text-sm">
                      <div className="space-y-0.5 max-w-[170px]">
                        <p className="font-medium text-foreground truncate">{desc}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-serif font-semibold tabular-nums",
                            t.amount >= 0 ? "text-success" : "text-foreground"
                          )}
                        >
                          {t.amount >= 0 ? "+" : ""}
                          {formatCurrency(t.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* SAVINGS HEALTH & QUICK LINKS WIDGET */}
          <SavingsHealthCard trustScore={summary.data?.riskScore} />
        </div>

      </div>
    </>
  )
}

function SavingsHealthCard({ trustScore }: { trustScore?: number }) {
  const score = trustScore ?? 75
  const isHigh = score >= 70
  return (
    <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="font-serif text-base">Account & Trust Status</CardTitle>
          </div>
          <Badge variant={isHigh ? "outline" : "secondary"} className={isHigh ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium" : ""}>
            {isHigh ? "High Trust" : "Good Standing"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Community Trust Score</p>
            <p className="font-serif text-xl font-bold tabular-nums text-foreground mt-0.5">{score} / 100</p>
          </div>
          <ShieldCheck className="h-8 w-8 text-primary/80" />
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Navigation</p>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm" className="justify-start gap-1.5 text-xs">
              <Link to="/wallet"><Wallet className="h-3.5 w-3.5 text-primary" /> My Wallet</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start gap-1.5 text-xs">
              <Link to="/groups"><Users className="h-3.5 w-3.5 text-primary" /> All Circles</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KpiCard({ icon: Icon, label, value, loading, accent }: { icon: React.ElementType; label: string; value: string; loading?: boolean; accent?: boolean }) {
  return (
    <Card className={accent ? "border-accent/40 bg-accent/10" : ""}>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading
            ? <Skeleton className="mt-3 h-8 w-24" />
            : <p className="mt-2 font-serif text-2xl font-semibold tabular-nums">{value}</p>
          }
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function DiscoverCard({ group }: { group: Group }) {
  const cd = useCountdown(group.nextAuctionTime)
  return (
    <Card className="border-border transition-all hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="font-serif text-base">{group.groupName}</CardTitle>
          <RiskBadge threshold={group.riskThreshold} />
        </div>
        <p className="text-xs text-muted-foreground">{group.groupSize} members · {formatFrequency(group.groupFrequency)}</p>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Contribution</p>
          <p className="font-serif text-lg font-semibold tabular-nums">{formatCurrency(group.contributionAmount)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Next auction · <span className="text-foreground">{cd.label}</span></p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/groups/$id" params={{ id: String(group.id) }}>View</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <p className="font-serif text-lg font-semibold">You haven't joined a circle yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">Browse the discovery board below or start a new circle for your community.</p>
        <div className="mt-2 flex gap-2">
          <Button asChild><Link to="/groups">Browse circles</Link></Button>
          <Button asChild variant="outline"><Link to="/groups/create">Create a circle</Link></Button>
        </div>
      </CardContent>
    </Card>
  )
}