import * as React from "react"
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, Gavel, Users, CalendarClock, ShieldCheck, Settings2, Loader2 } from "lucide-react"
import { groupApi, membershipApi, auctionApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
  const navigate = useNavigate()

  const group = useQuery({ queryKey: ["group", groupId], queryFn: () => groupApi.getOne(groupId) })
  const roster = useQuery({ queryKey: ["roster", groupId], queryFn: () => membershipApi.getGroupRoster(groupId) })
  const myMemberships = useQuery({
    queryKey: ["memberships", user?.userId],
    queryFn: () => membershipApi.getUserMemberships(user!.userId),
    enabled: !!user,
  })
  
  const history = useQuery({ 
    queryKey: ["history", groupId], 
    queryFn: () => auctionApi.history(groupId) 
  })

  const isMember = !!myMemberships.data?.some((m) => m.groupId === groupId)
  const isAdmin = user?.userId === group.data?.adminUserId
  const isStarted = !!group.data?.nextAuctionTime

  const cd = useCountdown(group.data?.nextAuctionTime ?? undefined)

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
            {isMember && isStarted ? (
              <a href={`/groups/${id}/auction`} className={buttonVariants({ variant: "default" })}>
                <Gavel className="h-4 w-4 mr-2" /> {cd.isPast ? "Enter live auction" : "Auction room"}
              </a>
            ) : !isMember ? (
              <Button onClick={() => join.mutate()} disabled={join.isPending}>Join circle</Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={CalendarClock} label="Next auction" value={isStarted ? cd.label : "Pending start"} />
        <StatCard icon={Users} label="Contribution" value={formatCurrency(g.contributionAmount)} />
        <StatCard icon={Gavel} label="Pool per cycle" value={formatCurrency(g.contributionAmount * g.groupSize)} />
        <StatCard icon={ShieldCheck} label="Trust threshold" value={`${g.riskThreshold}/100`} />
      </div>

      {!isStarted && isAdmin && (
        <StartCircleCard groupId={groupId} groupSize={g.groupSize} currentMembers={roster.data?.length ?? 0} />
      )}

      {isStarted && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Cycle progress</span>
              <span className="tabular-nums text-muted-foreground">{g.currentCycle}/{g.numberOfCycles}</span>
            </div>
            <Progress value={progress} />
            <p className="mt-3 text-xs text-muted-foreground">
              Next auction starts {formatDateTime(g.nextAuctionTime!)} · runs for {g.auctionDurationMinutes} minutes
            </p>
          </CardContent>
        </Card>
      )}

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
                  <TableHead>Current Trust Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(roster.data ?? []).map((m) => (
                  <TableRow key={m.membershipId}>
                    <TableCell className="font-medium">{m.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={m.currentTrustScore} className="w-24" indicatorClassName={
                          m.currentTrustScore >= 75 ? "bg-success" : m.currentTrustScore >= 50 ? "bg-warning" : "bg-destructive"
                        } />
                        <span className="text-sm tabular-nums text-muted-foreground">{Math.round(m.currentTrustScore)}</span>
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

      {history.data && history.data.length > 0 && (
        <section className="mt-10 mb-20">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">Past Auctions</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Payout Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.data.filter(a => a.auctionStatus === "CLOSED").map((a) => (
                    <TableRow key={a.auctionId}>
                      <TableCell className="font-medium">Cycle {a.cycle ?? a.cycleNumber}</TableCell>
                      <TableCell>{formatDateTime(a.endTime || a.startTime)}</TableCell>
                      <TableCell className="font-semibold text-success">{a.winnerName}</TableCell>
                      <TableCell className="font-serif tabular-nums">
                        {formatCurrency(a.winningDiscountBid === 0 ? g.contributionAmount * g.groupSize : a.winningDiscountBid)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-success/20 text-success">Closed</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}
    </>
  )
}

function StartCircleCard({ groupId, groupSize, currentMembers }: { groupId: number, groupSize: number, currentMembers: number }) {
  const [firstAuctionTime, setFirstAuctionTime] = React.useState("")
  const [reduceSize, setReduceSize] = React.useState(false)
  const qc = useQueryClient()
  
  const isFull = currentMembers >= groupSize
  const isTooSmall = currentMembers < 3

  const start = useMutation({
    mutationFn: () => {
      if (!firstAuctionTime) throw new Error("Select a start time")
      const localDate = new Date(firstAuctionTime)
      if (localDate < new Date()) throw new Error("Start time cannot be in the past")
      if (!isFull && !reduceSize) throw new Error("Group is not full. Wait for members or check the reduce size option.")
      
      const utcString = localDate.toISOString().slice(0, 19)
      return groupApi.start({ groupId, firstAuctionTime: utcString, reduceSizeIfNeeded: reduceSize })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId] })
      toast.success("Circle successfully started!")
    },
    onError: (e) => toast.error((e as Error).message),
  })

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-serif">
          <Settings2 className="h-5 w-5 text-primary" /> Start Circle
        </CardTitle>
        <CardDescription>
          As the creator, you can set the first auction time and start the cycle once you're ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>First Auction Time</Label>
            <Input 
              type="datetime-local" 
              value={firstAuctionTime}
              onChange={e => setFirstAuctionTime(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex flex-col justify-end space-y-4">
            {!isFull && (
              <div className="flex items-start space-x-3 rounded-lg border border-warning/20 bg-warning/10 p-3">
                <Checkbox 
                  id="reduce-size" 
                  checked={reduceSize}
                  onCheckedChange={(c) => setReduceSize(c as boolean)}
                  disabled={isTooSmall}
                />
                <div className="space-y-1 leading-none">
                  <label htmlFor="reduce-size" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Reduce circle size to start now
                  </label>
                  <p className="text-xs text-muted-foreground">
                    You currently have {currentMembers} members out of {groupSize}. 
                    {isTooSmall ? " You need at least 3 members to start." : ` This will permanently reduce the circle capacity to ${currentMembers}.`}
                  </p>
                </div>
              </div>
            )}
            <Button onClick={() => start.mutate()} disabled={start.isPending || (!isFull && !reduceSize && !isTooSmall)}>
              {start.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Launch First Cycle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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