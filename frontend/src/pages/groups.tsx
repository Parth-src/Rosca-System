import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import useSWR from "swr"
import { Plus, Search, Users, Wallet, Calendar, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import type { Group } from "@/types"
import { formatMoney, formatFrequency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { GroupStatusBadge } from "@/components/shared/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function GroupCard({ group }: { group: Group }) {
  const filled = group.currentMembers / group.maxMembers
  return (
    <Link to={`/app/groups/${group.id}`}>
      <Card className="group h-full transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-semibold text-foreground">
              {group.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{group.region}</p>
          </div>
          <GroupStatusBadge status={group.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="size-4 shrink-0 text-primary" />
              <span className="font-medium text-foreground">
                {formatMoney(group.contributionAmount, group.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4 shrink-0 text-primary" />
              <span>{formatFrequency(group.frequency)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4 shrink-0 text-primary" />
              <span>
                {group.currentMembers}/{group.maxMembers} members
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="size-4 shrink-0 text-primary" />
              <span>Round {group.currentRound}</span>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Seats filled</span>
              <span>{Math.round(filled * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${filled * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function GroupsPage() {
  const { data: groups, isLoading } = useSWR<Group[]>("/groups", () =>
    api.getGroups(),
  )
  const [tab, setTab] = useState("all")
  const [query, setQuery] = useState("")
  const [frequency, setFrequency] = useState("ALL")

  const filtered = useMemo(() => {
    if (!groups) return []
    return groups.filter((g) => {
      const matchesTab =
        tab === "all" ? true : tab === "mine" ? g.isMember : !g.isMember
      const matchesQuery =
        !query ||
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.region.toLowerCase().includes(query.toLowerCase())
      const matchesFreq = frequency === "ALL" || g.frequency === frequency
      return matchesTab && matchesQuery && matchesFreq
    })
  }, [groups, tab, query, frequency])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Circles
          </h1>
          <p className="mt-1 text-muted-foreground">
            Discover savings circles or manage the ones you&apos;ve joined.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/groups/new">
            <Plus className="size-4" />
            Start a circle
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">My circles</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 gap-3 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or region"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All cycles</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">No circles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or start your own circle.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
