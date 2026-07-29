import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ShieldCheck, Trophy, AlertOctagon, TrendingUp, TrendingDown } from "lucide-react"
import { riskApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/circl-utils"

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Circl" },
      { name: "description", content: "Your trust score, contribution history, and Circl profile." },
      { property: "og:title", content: "Profile — Circl" },
      { property: "og:description", content: "Your Circl profile and trust score." },
    ],
  }),
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = useAuth()
  const report = useQuery({ queryKey: ["risk", user?.userId], queryFn: () => riskApi.getReport(user!.userId), enabled: !!user })

  const bandTone = report.data?.band === "LOW" ? "success" : report.data?.band === "MEDIUM" ? "warning" : "destructive"
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U"

  return (
    <>
      <PageHeader title="Profile" description="Your trust profile, built from every on-time contribution." />

      <Card>
        <CardContent className="flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent font-serif text-3xl font-semibold text-accent-foreground">
            {initials}
          </div>
          <div className="flex-1">
            <p className="font-serif text-2xl font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">Wallet balance · <span className="text-foreground">{formatCurrency(user?.accountBalance ?? 0)}</span></p>
          </div>
          {report.isLoading ? (
            <Skeleton className="h-24 w-40 rounded-2xl" />
          ) : report.data && (
            <div className="rounded-2xl border border-border bg-background p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trust score</p>
              <p className="mt-1 font-serif text-4xl font-semibold tabular-nums">{report.data.trustScore}</p>
              <Badge variant={bandTone as any} className="mt-2">{report.data.band}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {report.data && (
        <>
          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">On-time contribution rate</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(report.data.onTimeRate * 100)}%</span>
                </div>
                <Progress
                  value={report.data.onTimeRate * 100}
                  indicatorClassName={
                    report.data.onTimeRate >= 0.9 ? "bg-success"
                    : report.data.onTimeRate >= 0.7 ? "bg-warning"
                    : "bg-destructive"
                  }
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Consistent on-time contributions raise your trust score and unlock stricter circles.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={ShieldCheck} label="Defaults" value={String(report.data.defaults)} tone="success" />
            <StatTile icon={Trophy} label="Auctions won" value={String(report.data.auctionsWon)} tone="accent" />
            <StatTile icon={TrendingUp} label="Total contributed" value={formatCurrency(report.data.totalContributed)} tone="primary" />
            <StatTile icon={TrendingDown} label="Total received" value={formatCurrency(report.data.totalReceived)} tone="warning" />
          </div>

          <Card className="mt-6">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold">How your score is calculated</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your trust score blends on-time payment rate, defaults, cycles completed, and dispute history.
                  Trust rises with every completed cycle; missed contributions lower it and may restrict access to circles.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "primary" | "success" | "warning" | "accent" }) {
  const toneClass = tone === "primary" ? "bg-primary text-primary-foreground"
    : tone === "success" ? "bg-success text-success-foreground"
    : tone === "warning" ? "bg-warning text-warning-foreground"
    : "bg-accent text-accent-foreground"
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  )
}