import { Link } from "react-router-dom"
import useSWR from "swr"
import {
  Wallet,
  ShieldCheck,
  UsersRound,
  CalendarClock,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"
import { dashboardApi, groupApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useCountdown } from "@/hooks/use-countdown"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Group } from "@/types"

export function DashboardPage() {
  const { user } = useAuth()
  const { data: summary, isLoading } = useSWR("dashboard-summary", dashboardApi.getSummary)
  const { data: groups } = useSWR("groups", groupApi.getAll)

  const upcoming = (groups ?? [])
    .slice()
    .sort((a, b) => new Date(a.nextAuctionTime).getTime() - new Date(b.nextAuctionTime).getTime())
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          {user?.name?.split(" ")[0] ?? "there"}, here&apos;s your snapshot
        </h1>
      </header>

      {/* KPI widgets */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Total savings"
          icon={Wallet}
          loading={isLoading}
          value={formatCurrency(summary?.totalSavings ?? 0)}
          hint="Across all active circles"
          tone="primary"
        />
        <KpiCard
          label="Trust score"
          icon={ShieldCheck}
          loading={isLoading}
          value={`${Math.round(summary?.riskScore ?? 0)}`}
          hint={
            <Progress
              className="mt-3"
              value={summary?.riskScore ?? 0}
              indicatorClassName={scoreColor(summary?.riskScore ?? 0)}
            />
          }
        />
        <KpiCard
          label="Active groups"
          icon={UsersRound}
          loading={isLoading}
          value={`${summary?.activeGroupsCount ?? 0}`}
          hint={
            <span className="inline-flex items-center gap-1 text-success">
              <TrendingUp className="h-3.5 w-3.5" /> Contributing regularly
            </span>
          }
        />
      </section>

      {/* Upcoming contribution + alerts */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Upcoming contribution
            </div>
            <div>
              <p className="font-serif text-4xl font-semibold">
                {formatCurrency(summary?.upcomingContribution ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Due this cycle across your circles</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/groups">
                Manage circles
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Upcoming auctions</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/groups">View all</Link>
            </Button>
          </div>
          {!groups ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No scheduled auctions yet. Join or create a circle to get started.
              </CardContent>
            </Card>
          ) : (
            upcoming.map((g) => <AuctionAlert key={g.id} group={g} />)
          )}
        </div>
      </section>
    </div>
  )
}

function AuctionAlert({ group }: { group: Group }) {
  const countdown = useCountdown(group.nextAuctionTime)

  return (
    <Alert variant={countdown.isSoon ? "warning" : "default"}>
      <Clock className={countdown.isSoon ? "animate-pulse" : ""} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle>{group.groupName}</AlertTitle>
          <AlertDescription>
            Cycle {group.currentCycle + 1} of {group.numberOfCycles} ·{" "}
            {countdown.isPast ? "Auction is live" : `Starts in ${countdown.label}`}
          </AlertDescription>
        </div>
        <Button asChild size="sm" variant={countdown.isSoon ? "accent" : "outline"}>
          <Link to={`/groups/${group.id}`}>{countdown.isSoon ? "Join room" : "View"}</Link>
        </Button>
      </div>
    </Alert>
  )
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-success"
  if (score >= 40) return "bg-accent"
  return "bg-destructive"
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  tone = "default",
}: {
  label: string
  value: string
  hint?: React.ReactNode
  icon: typeof Wallet
  loading?: boolean
  tone?: "default" | "primary"
}) {
  return (
    <Card className={tone === "primary" ? "bg-primary text-primary-foreground" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${tone === "primary" ? "opacity-80" : "text-muted-foreground"}`}>
            {label}
          </span>
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
              tone === "primary" ? "bg-primary-foreground/15" : "bg-secondary"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>
        {loading ? (
          <Skeleton className="mt-4 h-9 w-28" />
        ) : (
          <p className="mt-4 font-serif text-4xl font-semibold leading-none">{value}</p>
        )}
        {hint && <div className={`mt-2 text-sm ${tone === "primary" ? "opacity-80" : "text-muted-foreground"}`}>{hint}</div>}
      </CardContent>
    </Card>
  )
}
