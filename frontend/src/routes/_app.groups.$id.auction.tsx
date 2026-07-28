import * as React from "react"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, Gavel, Loader2 } from "lucide-react"
import { auctionApi, groupApi } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/groups/$id/auction")({
  head: ({ params }) => ({
    meta: [
      { title: `Live auction — Circl #${params.id}` },
      { name: "description", content: "Bid the lowest discount to win the pool payout in this 30-minute auction." },
      { property: "og:title", content: `Live auction — Circl #${params.id}` },
      { property: "og:description", content: "Live ROSCA auction on Circl." },
    ],
  }),
  component: AuctionRoom,
})

function AuctionRoom() {
  const { id } = useParams({ from: "/_app/groups/$id/auction" })
  const groupId = Number(id)
  const qc = useQueryClient()

  const group = useQuery({ queryKey: ["group", groupId], queryFn: () => groupApi.getOne(groupId) })
  const auction = useQuery({
    queryKey: ["auction", groupId],
    queryFn: () => auctionApi.getCurrent(groupId),
    refetchInterval: 3000,
  })

  const cd = useCountdown(auction.data?.endTime ?? group.data?.nextAuctionTime)

  const [bid, setBid] = React.useState<number>(10)
  const lowest = auction.data?.bids.reduce((m, b) => (b.discountPercent > m ? b.discountPercent : m), 0) ?? 0
  const sortedBids = [...(auction.data?.bids ?? [])].sort((a, b) => b.discountPercent - a.discountPercent)
  const winning = sortedBids[0]

  const place = useMutation({
    mutationFn: (v: number) => auctionApi.placeBid(groupId, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", groupId] })
      toast.success("Bid placed")
    },
    onError: (e) => toast.error((e as Error).message ?? "Could not place bid"),
  })

  if (group.isLoading || !group.data) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  const g = group.data
  const isLive = auction.data?.status === "LIVE" && !cd.isPast

  return (
    <>
      <PageHeader
        title="Live auction"
        description={`${g.groupName} · Cycle ${auction.data?.cycle ?? g.currentCycle + 1}`}
        actions={<Button asChild variant="ghost"><Link to="/groups/$id" params={{ id }}><ArrowLeft className="h-4 w-4" /> Back to circle</Link></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className={cn("relative overflow-hidden", isLive && "border-success/40")}>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Badge variant={isLive ? "success" : "outline"}>
                {isLive ? "Live" : cd.isPast ? "Settling" : "Scheduled"}
              </Badge>
              <p className="text-xs text-muted-foreground">Ends in</p>
            </div>
            <p className="mt-3 font-serif text-6xl font-semibold tabular-nums tracking-tight">
              {cd.label}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pool: <span className="font-medium text-foreground">{formatCurrency(auction.data?.poolAmount ?? g.contributionAmount * g.groupSize)}</span>
            </p>

            <div className="mt-8 grid gap-3">
              <Label htmlFor="bid">Your discount (%)</Label>
              <div className="flex items-end gap-3">
                <div className="relative flex-1">
                  <Input
                    id="bid"
                    type="number"
                    min={lowest + 1}
                    max={40}
                    value={bid}
                    onChange={(e) => setBid(Number(e.target.value))}
                    className="pr-10 font-serif text-2xl tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <Button
                  size="lg"
                  onClick={() => place.mutate(bid)}
                  disabled={!isLive || place.isPending || bid <= lowest}
                >
                  {place.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                  Place bid
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Highest discount wins. Bid at least {lowest + 1}% to beat the current leader.
              </p>
            </div>

            {!isLive && (
              <Alert className="mt-6" variant="default">
                <AlertTitle>{cd.isPast ? "Auction ended" : "Not started yet"}</AlertTitle>
                <AlertDescription>
                  {cd.isPast ? "Bids are being settled and the pool will pay out shortly." : "Check back once the auction opens."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-serif text-lg font-semibold">Live bids</h3>
            <p className="text-xs text-muted-foreground">Sorted by discount · highest wins.</p>
            <ol className="mt-4 space-y-2">
              {sortedBids.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No bids yet — be the first.
                </li>
              )}
              {sortedBids.map((b, i) => (
                <li key={b.bidId} className={cn(
                  "flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3",
                  b === winning && "border-success/60 bg-success/5",
                )}>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      i === 0 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground",
                    )}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{b.username}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.placedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-semibold tabular-nums">-{b.discountPercent}%</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  )
}