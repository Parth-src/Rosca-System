import * as React from "react"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, Gavel, Loader2, User } from "lucide-react"
import { auctionApi, groupApi, membershipApi } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/circl-utils"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export const Route = createFileRoute("/_app/groups_/$id/auction")({
  component: AuctionRoom,
})

function AuctionRoom() {
  const { id } = useParams({ from: "/_app/groups_/$id/auction" })
  const groupId = Number(id)
  const qc = useQueryClient()
  const { user } = useAuth()

  const group = useQuery({ queryKey: ["group", groupId], queryFn: () => groupApi.getOne(groupId) })
  const roster = useQuery({ queryKey: ["roster", groupId], queryFn: () => membershipApi.getGroupRoster(groupId) })
  
  const auction = useQuery({
    queryKey: ["auction", groupId],
    queryFn: () => auctionApi.getCurrent(groupId),
    refetchInterval: 3000,
  })

  // Poll winning bid
  const winningBidQuery = useQuery({
    queryKey: ["winningBid", auction.data?.auctionId],
    queryFn: () => auctionApi.getWinningBid(auction.data!.auctionId),
    enabled: !!auction.data?.auctionId,
    refetchInterval: 1000,
  })

  const cd = useCountdown(auction.data?.endTime ?? group.data?.nextAuctionTime)
  const [bid, setBid] = React.useState<number>(10)

  // In the real system, bid is the payout amount requested, not the discount percent.
  // Wait, let's treat the bid amount as what the user is bidding (payout requested).
  // The lowest payout request wins.
  const currentLowestPayout = winningBidQuery.data?.bidAmount ?? (group.data?.contributionAmount! * group.data?.groupSize!)
  
  const place = useMutation({
    mutationFn: (v: number) => {
      const myMem = members.find(m => m.username === user?.name)
      if (!myMem) throw new Error("Membership not found")
      if (!auction.data?.auctionId) throw new Error("Auction not active")
      return auctionApi.placeBid({ auctionId: auction.data.auctionId, membershipId: myMem.membershipId, bidAmount: v })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winningBid", auction.data?.auctionId] })
      toast.success("Bid placed successfully!")
    },
    onError: (e) => toast.error((e as Error).message ?? "Could not place bid"),
  })

  if (group.isLoading || !group.data || roster.isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  const g = group.data
  const members = roster.data ?? []
  const isLive = auction.data?.auctionStatus === "OPEN" && !cd.isPast

  if (!cd.isPast && auction.data?.auctionStatus !== "OPEN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold font-serif">Auction Not Started</h2>
        <p className="text-muted-foreground text-center max-w-md">
          The auction for this cycle has not started yet. Please wait for the countdown to finish.
        </p>
        <Button asChild variant="outline">
          <Link to="/groups/$id" params={{ id }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to circle
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Live Auction Room"
        description={`${g.groupName} · Cycle ${auction.data?.cycleNumber ?? g.currentCycle}`}
        actions={<Button asChild variant="ghost"><Link to="/groups/$id" params={{ id }}><ArrowLeft className="h-4 w-4" /> Back to circle</Link></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Round Table Area */}
        <Card className={cn("relative overflow-hidden min-h-[600px] flex items-center justify-center bg-muted/30", isLive && "border-success/40")}>
          <div className="relative w-[500px] h-[500px]">
             {/* The Table */}
            <div className="absolute inset-16 rounded-full border-8 border-border bg-card shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-4">
               {auction.data?.auctionStatus === "CLOSED" ? (
                 <div className="flex flex-col items-center space-y-2 w-full animate-in fade-in zoom-in duration-500">
                    <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center mb-2">
                       <Gavel className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-lg font-bold font-serif text-success uppercase tracking-widest">Auction Closed</p>
                    <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20 w-full">
                      <p className="text-xs text-success-foreground font-semibold uppercase tracking-wider mb-1">Winner</p>
                      <p className="font-serif text-2xl font-bold text-success-foreground">{auction.data.winnerName}</p>
                      <p className="text-xs text-success-foreground mt-3 font-semibold uppercase tracking-wider">Final Payout</p>
                      <p className="font-serif text-2xl font-bold text-success-foreground">
                        {formatCurrency(auction.data.winningDiscountBid === 0 ? g.contributionAmount * g.groupSize : auction.data.winningDiscountBid)}
                      </p>
                    </div>
                 </div>
               ) : (
                 <>
                   <Badge variant={isLive ? "success" : "outline"}>
                     {isLive ? "Live" : cd.isPast ? "Settling" : "Scheduled"}
                   </Badge>
                   
                   <div>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ends In</p>
                     <p className="mt-1 font-serif text-5xl font-semibold tabular-nums tracking-tight">
                       {cd.label}
                     </p>
                   </div>

                   {winningBidQuery.data && (
                     <div className="mt-6 p-5 rounded-2xl bg-success text-success-foreground border border-success-foreground/20 w-full shadow-lg">
                       <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">Current Winning Bid</p>
                       <p className="font-serif text-4xl font-extrabold tabular-nums drop-shadow-sm">
                         {formatCurrency(winningBidQuery.data.bidAmount)}
                       </p>
                       <div className="mt-3 inline-flex items-center gap-1.5 bg-background/20 backdrop-blur rounded-full px-3 py-1 border border-background/20">
                         <User className="h-3.5 w-3.5" />
                         <span className="text-sm font-medium">{winningBidQuery.data.username}</span>
                       </div>
                     </div>
                   )}
                   
                   {!winningBidQuery.data && isLive && (
                      <p className="text-muted-foreground text-sm mt-4">Waiting for first bid...</p>
                   )}
                 </>
               )}
            </div>

            {/* Members seated around the table */}
            {members.map((m, i) => {
              const angle = (i / members.length) * 2 * Math.PI - Math.PI / 2
              const radius = 230
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              
              const isWinner = auction.data?.auctionStatus === "CLOSED" 
                ? auction.data.winnerName === m.username
                : winningBidQuery.data?.username === m.username
              
              return (
                <div 
                  key={m.membershipId}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ 
                    left: `calc(50% + ${x}px)`, 
                    top: `calc(50% + ${y}px)` 
                  }}
                >
                  <div className={cn(
                    "flex flex-col items-center gap-2",
                    isWinner && "scale-110"
                  )}>
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full border-4 shadow-lg bg-background",
                      isWinner ? "border-success text-success shadow-success/20" : "border-border text-muted-foreground"
                    )}>
                      <User className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm whitespace-nowrap shadow-sm border",
                      isWinner ? "border-success text-success" : "border-border text-muted-foreground"
                    )}>
                      {m.username} {m.username === user?.name && "(You)"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Bidding Controls */}
        <Card>
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="font-serif text-xl font-semibold mb-2">Place your bid</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Total Pool: <span className="font-medium text-foreground">{formatCurrency(g.contributionAmount * g.groupSize)}</span>
            </p>

            <div className="space-y-4 flex-1">
              <div className="grid gap-2">
                <Label htmlFor="bid">Payout Amount (₹)</Label>
                <Input
                  id="bid"
                  type="number"
                  min={1}
                  max={currentLowestPayout - 1}
                  value={bid}
                  onChange={(e) => setBid(Number(e.target.value))}
                  className="font-serif text-2xl tabular-nums py-6"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You must bid lower than {formatCurrency(currentLowestPayout)} to take the lead.
                </p>
              </div>
              
              <Button
                size="lg"
                className="w-full text-lg h-14"
                onClick={() => place.mutate(bid)}
                disabled={!isLive || place.isPending || bid >= currentLowestPayout}
              >
                {place.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Gavel className="h-5 w-5 mr-2" />}
                Submit Bid
              </Button>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <h4 className="text-sm font-semibold mb-2">How it works:</h4>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>You are bidding on the payout amount you wish to receive.</li>
                <li>The lowest bid wins. The difference between the pool and the winning bid is shared as dividends.</li>
                <li>You can place multiple bids to compete until the timer runs out!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={auction.data?.auctionStatus === "CLOSED"}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-3xl text-success tracking-tight">Auction Finished!</DialogTitle>
            <DialogDescription className="text-center text-base">
              The cycle has concluded and the pool has been distributed.
            </DialogDescription>
          </DialogHeader>
          {auction.data?.auctionStatus === "CLOSED" && (
            <div className="flex flex-col items-center justify-center space-y-6 py-6">
              <div className="flex flex-col items-center justify-center bg-success/10 rounded-full w-24 h-24 border-4 border-success/20">
                <Gavel className="h-10 w-10 text-success" />
              </div>
              <div className="w-full space-y-4 rounded-xl border p-4 bg-muted/30">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Winner</span>
                  <span className="font-serif text-xl font-bold">{auction.data.winnerName}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Final Payout</span>
                  <span className="font-serif text-xl font-bold text-success">
                    {formatCurrency(auction.data.winningDiscountBid === 0 ? g.contributionAmount * g.groupSize : auction.data.winningDiscountBid)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Dividend per member</span>
                  <span className="font-serif text-xl font-bold text-primary">
                    {formatCurrency(
                      ((g.contributionAmount * g.groupSize) - (auction.data.winningDiscountBid === 0 ? g.contributionAmount * g.groupSize : auction.data.winningDiscountBid)) / g.groupSize
                    )}
                  </span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/groups/$id" params={{ id }}>Back to Circle Dashboard</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}