import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Wallet, Users, CalendarClock, ShieldCheck, ArrowRight, Plus } from "lucide-react"
import { dashboardApi, membershipApi, groupApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatFrequency, formatDateTime } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"
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

  const myGroups: Group[] = (memberships.data ?? [])
    .map((m) => groups.data?.find((g) => g.id === m.groupId))
    .filter((g): g is Group => !!g)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "friend"}.`}
        description="Your circles, contributions, and trust score at a glance."
        actions={
          <Button asChild><Link to="/groups/create"><Plus className="h-4 w-4" /> New Circle</Link></Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Wallet} label="Total savings" value={formatCurrency(summary.data?.totalSavings ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={Users} label="Active circles" value={String(summary.data?.activeGroupsCount ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={CalendarClock} label="Upcoming contribution" value={formatCurrency(summary.data?.upcomingContribution ?? 0)} loading={summary.isLoading} />
        <KpiCard icon={ShieldCheck} label="Trust score" value={`${summary.data?.riskScore ?? 0}/100`} loading={summary.isLoading} accent />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">My circles</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/groups">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        {memberships.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : myGroups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myGroups.map((g) => {
              const m = memberships.data!.find((x) => x.groupId === g.id)!
              return (
                <Card key={g.id} className="border-border">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                    <div>
                      <CardTitle className="font-serif text-lg">{g.groupName}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cycle {g.currentCycle} of {g.numberOfCycles} · {formatFrequency(g.groupFrequency)}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Contribution</p>
                      <p className="font-serif text-2xl font-semibold tabular-nums">
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

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Discover circles</h2>
        <p className="mt-1 text-sm text-muted-foreground">Open pools accepting members right now.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(groups.data ?? []).slice(0, 6).map((g) => <DiscoverCard key={g.id} group={g} />)}
        </div>
      </section>
    </>
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
    <Card className="border-border">
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