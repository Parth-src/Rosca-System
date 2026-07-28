import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { groupApi, membershipApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatFrequency } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"
import type { Group } from "@/types"

export const Route = createFileRoute("/_app/groups/")({
  head: () => ({
    meta: [
      { title: "Circles — Circl" },
      { name: "description", content: "Browse open savings circles and track the ones you're part of." },
      { property: "og:title", content: "Circles — Circl" },
      { property: "og:description", content: "Browse and manage savings circles on Circl." },
    ],
  }),
  component: GroupsIndex,
})

function GroupsIndex() {
  const { user } = useAuth()
  const [query, setQuery] = React.useState("")
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => groupApi.getAll() })
  const memberships = useQuery({
    queryKey: ["memberships", user?.userId],
    queryFn: () => membershipApi.getUserMemberships(user!.userId),
    enabled: !!user,
  })

  const filtered = (groups.data ?? []).filter((g) =>
    g.groupName.toLowerCase().includes(query.toLowerCase()),
  )
  const myGroupIds = new Set((memberships.data ?? []).map((m) => m.groupId))
  const mine = filtered.filter((g) => myGroupIds.has(g.id))
  const discover = filtered.filter((g) => !myGroupIds.has(g.id))

  return (
    <>
      <PageHeader
        title="Circles"
        description="Auction-based savings pools you can join or lead."
        actions={<Button asChild><Link to="/groups/create"><Plus className="h-4 w-4" /> New Circle</Link></Button>}
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover">Discover ({discover.length})</TabsTrigger>
          <TabsTrigger value="mine">My circles ({mine.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="discover" className="mt-6">
          <GroupGrid groups={discover} loading={groups.isLoading} />
        </TabsContent>
        <TabsContent value="mine" className="mt-6">
          <GroupGrid groups={mine} loading={memberships.isLoading || groups.isLoading} memberships={memberships.data} />
        </TabsContent>
      </Tabs>
    </>
  )
}

function GroupGrid({ groups, loading, memberships }: { groups: Group[]; loading?: boolean; memberships?: { groupId: number; status: any }[] }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    )
  }
  if (groups.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No circles match your search.</p>
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => {
        const m = memberships?.find((x) => x.groupId === g.id)
        return <GroupCard key={g.id} group={g} status={m?.status} />
      })}
    </div>
  )
}

function GroupCard({ group, status }: { group: Group; status?: any }) {
  const cd = useCountdown(group.nextAuctionTime)
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-serif text-lg">{group.groupName}</CardTitle>
          {status ? <StatusBadge status={status} /> : <RiskBadge threshold={group.riskThreshold} />}
        </div>
        <p className="text-xs text-muted-foreground">
          {group.groupSize} members · {formatFrequency(group.groupFrequency)} · Cycle {group.currentCycle}/{group.numberOfCycles}
        </p>
      </CardHeader>
      <CardContent className="mt-auto flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Contribution</p>
          <p className="font-serif text-xl font-semibold tabular-nums">{formatCurrency(group.contributionAmount)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {cd.isPast ? "Auction live" : "Next auction"} · <span className="text-foreground">{cd.label}</span>
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/groups/$id" params={{ id: String(group.id) }}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  )
}