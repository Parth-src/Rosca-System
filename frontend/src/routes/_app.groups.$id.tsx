import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, Gavel, Users, CalendarClock, ShieldCheck } from "lucide-react"
import { groupApi, membershipApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime, formatFrequency } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"

export const Route = createFileRoute("/_app/groups/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Circle #${params.id} — Circl` },
      { name: "description", content: "Circle details, roster, and upcoming auction on Circl." },
      { property: "og:title", content: `Circle #${params.id} — Circl` },
      { property: "og:description", content: "Circle details on Circl." },
    ],
  }),
  component: GroupDetailPage,
})

function GroupDetailPage() {
  const { id } = useParams({ from: "/_app/groups/$id" })
  const groupId = Number(id)
  const { user } = useAuth()
  const qc = useQueryClient()

  const group = useQuery({ queryKey: ["group", groupId], queryFn: () => groupApi.getOne(groupId) })
  const roster = useQuery({ queryKey: ["roster", groupId], queryFn: () => membershipApi.getGroupRoster(groupId) })
  const myMemberships = useQuery({
    queryKey: ["memberships", user?.userId],
    queryFn: () => membershipApi.getUserMemberships(user!.userId),
    enabled: !!user,
  })

  const isMember = !!myMemberships.data?.some((m) => m.groupId === groupId)
  const cd = useCountdown(group.data?.nextAuctionTime)

  const join = useMutation({
    mutationFn: () => membershipApi.join({ groupId, userId: user!.userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memberships"] })
      qc.invalidateQueries({ queryKey: ["roster", groupId] })
      toast.success("Joined the circle")
    },
    onError: (e) => toast.error((e as Error).message ?? "Could not join"),
  })

  if (group.isLoading || !group.data) {
    return (
      <>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      </>
    )
  }

  const g = group.data
  const progress = (g.currentCycle / g.numberOfCycles) * 100

  return (
    <>
      <PageHeader
        title={g.groupName}
        description={`Cycle ${g.currentCycle} of ${g.numberOfCycles} · ${formatFrequency(g.groupFrequency)} · ${g.groupSize} members`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="ghost"><Link to="/groups"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
            {isMember ? (
              <Button asChild>
                <Link to="/groups/$id/auction" params={{ id }}>
                  <Gavel className="h-4 w-4" /> {cd.isPast ? "Enter live auction" : "Auction room"}
                </Link>
              </Button>
            ) : (
              <Button onClick={() => join.mutate()} disabled={join.isPending}>Join circle</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={CalendarClock} label="Next auction" value={cd.label} />
        <StatCard icon={Users} label="Contribution" value={formatCurrency(g.contributionAmount)} />
        <StatCard icon={Gavel} label="Pool per cycle" value={formatCurrency(g.contributionAmount * g.groupSize)} />
        <StatCard icon={ShieldCheck} label="Trust threshold" value={`${g.riskThreshold}/100`} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Cycle progress</span>
            <span className="tabular-nums text-muted-foreground">{g.currentCycle}/{g.numberOfCycles}</span>
          </div>
          <Progress value={progress} />
          <p className="mt-3 text-xs text-muted-foreground">
            Next auction starts {formatDateTime(g.nextAuctionTime)} · runs for {g.auctionDurationMinutes} minutes
          </p>
        </CardContent>
      </Card>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Roster</h2>
          <RiskBadge threshold={g.riskThreshold} />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Trust at joining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(roster.data ?? []).map((m) => (
                  <TableRow key={m.membershipId}>
                    <TableCell className="font-medium">{m.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={m.trustScoreAtJoining} className="w-24" indicatorClassName={
                          m.trustScoreAtJoining >= 75 ? "bg-success" : m.trustScoreAtJoining >= 50 ? "bg-warning" : "bg-destructive"
                        } />
                        <span className="text-sm tabular-nums text-muted-foreground">{m.trustScoreAtJoining}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                  </TableRow>
                ))}
                {roster.data?.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">No members yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-lg font-semibold tabular-nums">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  )
}