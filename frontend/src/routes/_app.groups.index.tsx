import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search, Filter, X, Trophy, Clock, Layers } from "lucide-react"
import { groupApi, membershipApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type MyStatusFilter = "ALL" | "WON" | "REMAINING"
type PriceFilter = "ALL" | "UNDER_200" | "200_500" | "500_1000" | "OVER_1000"

function GroupsIndex() {
  const { user } = useAuth()
  const [query, setQuery] = React.useState("")
  const [priceFilter, setPriceFilter] = React.useState<PriceFilter>("ALL")
  const [freqFilter, setFreqFilter] = React.useState<string>("ALL")
  const [myStatusFilter, setMyStatusFilter] = React.useState<MyStatusFilter>("ALL")

  const groups = useQuery({ queryKey: ["groups"], queryFn: () => groupApi.getAll() })
  const memberships = useQuery({
    queryKey: ["memberships", user?.userId],
    queryFn: () => membershipApi.getUserMemberships(user!.userId),
    enabled: !!user,
  })

  // 1. Global search across EVERY group (name, frequency, amount)
  const searchLower = query.trim().toLowerCase()
  const searchMatchingGroups = (groups.data ?? []).filter((g) => {
    if (!searchLower) return true
    const nameMatch = g.groupName.toLowerCase().includes(searchLower)
    const freqMatch = formatFrequency(g.groupFrequency).toLowerCase().includes(searchLower)
    const amountMatch = String(g.contributionAmount).includes(searchLower)
    return nameMatch || freqMatch || amountMatch
  })

  // 2. Price filter applied to ALL groups (both Discover & My Circles)
  const priceMatchingGroups = searchMatchingGroups.filter((g) => {
    if (priceFilter === "UNDER_200") return g.contributionAmount <= 200
    if (priceFilter === "200_500") return g.contributionAmount > 200 && g.contributionAmount <= 500
    if (priceFilter === "500_1000") return g.contributionAmount > 500 && g.contributionAmount <= 1000
    if (priceFilter === "OVER_1000") return g.contributionAmount > 1000
    return true
  })

  // 3. Frequency filter applied to ALL groups
  const fullyFilteredGroups = priceMatchingGroups.filter((g) => {
    if (freqFilter !== "ALL") return g.groupFrequency === freqFilter
    return true
  })

  const myGroupIds = new Set((memberships.data ?? []).map((m) => m.groupId))

  // Discover tab groups
  const discoverGroups = fullyFilteredGroups.filter((g) => !myGroupIds.has(g.id))

  // My Circles groups (filtered by price & frequency as well)
  const allMyGroups = fullyFilteredGroups.filter((g) => myGroupIds.has(g.id))

  // Helper for checking if a membership status means "Bid Won"
  const isWonStatus = (status?: string) => {
    if (!status) return false
    const s = String(status).toUpperCase()
    return s === "POOL_RECEIVED" || s === "COMPLETED" || s === "WON"
  }

  const wonCount = allMyGroups.filter((g) => {
    const m = memberships.data?.find((x) => x.groupId === g.id)
    return isWonStatus(m?.status)
  }).length

  const remainingCount = allMyGroups.filter((g) => {
    const m = memberships.data?.find((x) => x.groupId === g.id)
    return !isWonStatus(m?.status)
  }).length

  const myFilteredGroups = allMyGroups.filter((g) => {
    const m = memberships.data?.find((x) => x.groupId === g.id)
    if (myStatusFilter === "WON") {
      return isWonStatus(m?.status)
    }
    if (myStatusFilter === "REMAINING") {
      return !isWonStatus(m?.status)
    }
    return true
  })

  const hasActiveFilters = priceFilter !== "ALL" || freqFilter !== "ALL" || query !== ""
  const clearAllFilters = () => {
    setQuery("")
    setPriceFilter("ALL")
    setFreqFilter("ALL")
  }

  return (
    <>
      <PageHeader
        title="Circles"
        description="Auction-based savings pools you can join or lead."
        actions={<Button asChild><Link to="/groups/create"><Plus className="h-4 w-4" /> New Circle</Link></Button>}
      />

      {/* Global Search & Filters Control Bar (Applies to both Discover & My Circles) */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar searching every group */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all circles by name, price, frequency…"
            className="pl-9 pr-8"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Global Filters (Price & Frequency) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Filter */}
          <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as PriceFilter)}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Prices</SelectItem>
              <SelectItem value="UNDER_200">Under ₹200</SelectItem>
              <SelectItem value="200_500">₹200 – ₹500</SelectItem>
              <SelectItem value="500_1000">₹500 – ₹1,000</SelectItem>
              <SelectItem value="OVER_1000">Over ₹1,000</SelectItem>
            </SelectContent>
          </Select>

          {/* Frequency Filter */}
          <Select value={freqFilter} onValueChange={setFreqFilter}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Frequencies</SelectItem>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 px-2 text-xs">
              <X className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="discover">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover ({discoverGroups.length})</TabsTrigger>
          <TabsTrigger value="mine">My circles ({allMyGroups.length})</TabsTrigger>
        </TabsList>

        {/* DISCOVER TAB */}
        <TabsContent value="discover">
          <GroupGrid groups={discoverGroups} loading={groups.isLoading} />
        </TabsContent>

        {/* MY CIRCLES TAB */}
        <TabsContent value="mine" className="space-y-4">
          {/* My Circles Sub-Filter Bar (Bid Won vs Remaining) */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-1.5 border border-border/60">
            <span className="text-xs font-medium text-muted-foreground px-2 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter status:
            </span>
            <Button
              size="sm"
              variant={myStatusFilter === "ALL" ? "default" : "ghost"}
              onClick={() => setMyStatusFilter("ALL")}
              className="h-8 text-xs font-medium"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              All Joined ({allMyGroups.length})
            </Button>
            <Button
              size="sm"
              variant={myStatusFilter === "WON" ? "default" : "ghost"}
              onClick={() => setMyStatusFilter("WON")}
              className="h-8 text-xs font-medium"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5 text-success" />
              Bid Won ({wonCount})
            </Button>
            <Button
              size="sm"
              variant={myStatusFilter === "REMAINING" ? "default" : "ghost"}
              onClick={() => setMyStatusFilter("REMAINING")}
              className="h-8 text-xs font-medium"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5 text-warning" />
              Remaining ({remainingCount})
            </Button>
          </div>

          <GroupGrid
            groups={myFilteredGroups}
            loading={memberships.isLoading || groups.isLoading}
            memberships={memberships.data}
            emptyMessage={
              myStatusFilter === "WON"
                ? "No circles found where you've won a bid."
                : myStatusFilter === "REMAINING"
                ? "No pending bid circles found."
                : "You haven't joined any circles matching the current filters."
            }
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

function GroupGrid({
  groups,
  loading,
  memberships,
  emptyMessage = "No circles match your search or filter.",
}: {
  groups: Group[]
  loading?: boolean
  memberships?: { groupId: number; status: any }[]
  emptyMessage?: string
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  }
  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
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
    <Card className="flex h-full flex-col transition-all hover:shadow-md border-border/80">
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