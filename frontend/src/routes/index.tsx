import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  ShieldCheck,
  Gavel,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Percent,
  Users,
  ShieldAlert,
  RefreshCw
} from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { RotatingText } from "@/components/shared/rotating-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { formatCurrency } from "@/lib/circl-utils"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Circl — Save together, transparently" },
      { name: "description", content: "Circl reimagines chit funds, tandas, susus, and paluwagans as transparent auction-based savings circles with trust scoring and instant payouts." },
      { property: "og:title", content: "Circl — Save together, transparently" },
      { property: "og:description", content: "Auction-based ROSCA savings circles with transparent bidding and trust scoring." },
    ],
  }),
  component: Landing,
})

function Landing() {
  const [activeStep, setActiveStep] = useState<number>(1)

  // Interactive Profit Calculator State
  const [calcPool, setCalcPool] = useState<number>(10000)
  const [calcDiscount, setCalcDiscount] = useState<number>(15)
  const [calcMembers, setCalcMembers] = useState<number>(10)

  // Interactive Trust Simulator State
  const [onTimePayments, setOnTimePayments] = useState<number>(8)
  const [hasDefaulted, setHasDefaulted] = useState<boolean>(false)

  // Calculate Profit values
  const totalDiscount = (calcPool * calcDiscount) / 100
  const winnerPayout = calcPool - totalDiscount
  const dividendPerMember = totalDiscount / (calcMembers - 1)

  // Calculate Trust Score
  const trustScore = Math.min(100, Math.max(20, 50 + onTimePayments * 5 - (hasDefaulted ? 30 : 0)))
  const trustBand = trustScore >= 80 ? "HIGH" : trustScore >= 60 ? "MEDIUM" : "LOW"

  const roadmapSteps = [
    { step: 1, title: "1. Join Circle", icon: Users, label: "Form Pool" },
    { step: 2, title: "2. Pool Funds", icon: Layers, label: "Deposit" },
    { step: 3, title: "3. Bid Auction", icon: Gavel, label: "Auction" },
    { step: 4, title: "4. Win Payout", icon: Wallet, label: "Payout" },
    { step: 5, title: "5. Earn Dividend", icon: TrendingUp, label: "Dividend" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-8">
          <a href="#" className="cursor-pointer hover:opacity-90 transition-opacity">
            <Logo />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#interactive-features" className="text-muted-foreground hover:text-foreground transition-colors">Profit & Calculator</a>
            <a href="#trust-system" className="text-muted-foreground hover:text-foreground transition-colors">Trust & Penalties</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-center md:px-8 md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          A modern ROSCA platform
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Save together as a<br />
          <RotatingText className="mt-2 text-4xl sm:text-5xl md:text-6xl" />
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Circl turns a centuries-old tradition into a transparent, auction-based savings
          experience. Contribute together, bid for the pool, and grow your trust score with
          every on-time payment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/register">Start your first Circl <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">I have an account</Link>
          </Button>
        </div>
      </section>

      {/* 3. DIAGRAMMATIC ROADMAP WALKWAY SECTION */}
      <section id="how-it-works" className="border-t border-border bg-card/30 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">How Circl Works</Badge>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              From Contribution to Payout & Dividend
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hover over any stage on the walkway roadmap below to expand its details and see how money flows.
            </p>
          </div>

          {/* ROADMAP CONNECTED WALKWAY */}
          <div className="relative mt-16 mb-8">
            {/* Walkway Connecting Line */}
            <div className="absolute top-1/2 left-4 right-4 hidden -translate-y-1/2 h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 sm:block -z-0" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 relative z-10">
              {roadmapSteps.map((s) => {
                const isActive = activeStep === s.step
                return (
                  <div
                    key={s.step}
                    onMouseEnter={() => setActiveStep(s.step)}
                    onClick={() => setActiveStep(s.step)}
                    className={cn(
                      "group cursor-pointer flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-300",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-xl scale-105"
                        : "border-border bg-card hover:border-primary/50 hover:bg-card/80 text-muted-foreground"
                    )}
                  >
                    {/* Circle Node Badge */}
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-110",
                      isActive
                        ? "bg-primary-foreground text-primary shadow-sm"
                        : "bg-muted text-foreground"
                    )}>
                      {s.step}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold tracking-tight">{s.title}</p>
                      <p className={cn("text-[11px]", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>{s.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* EXPANDABLE HOVER DETAIL CARD */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm transition-all duration-300">
            {activeStep === 1 && (
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground">Stage 1</Badge>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">Form or Join a Savings Circle</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    Members form a group with fixed parameters: number of members (e.g. 10), contribution amount (e.g. ₹1,000/cycle), and frequency.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Verified trust score requirements</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Flexible weekly or monthly cycles</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Transparent member roster</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Circle Parameters</span>
                    <Badge variant="outline">Active Group</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-xl bg-muted/40 border">
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="font-serif text-lg font-bold">10 Saver Seats</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border">
                      <p className="text-xs text-muted-foreground">Contribution</p>
                      <p className="font-serif text-lg font-bold">₹1,000 / cycle</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground">Stage 2</Badge>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">Pool Monthly Contributions</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    At the start of each cycle, every member deposits their required contribution into the secure circle wallet pool.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 10 members × ₹1,000 = ₹10,000 Pool</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Automated ledger tracking</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Instant verification</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-6 text-center space-y-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Cycle Pool Aggregation</p>
                  <div className="py-4 border-y border-border/60">
                    <p className="text-xs text-muted-foreground">Total Pool Collected</p>
                    <p className="font-serif text-4xl font-bold text-success mt-1">₹10,000</p>
                  </div>
                  <p className="text-xs text-muted-foreground">10 out of 10 contributions collected on time</p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground">Stage 3</Badge>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">Transparent Auction Bidding</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    Members needing lump-sum funds submit discount bids during the auction window. The highest discount bid wins the pool payout!
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Real-time competitive bidding</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Transparent live leaderboard</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Immutable timestamp records</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-6 space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Auction Status</span>
                    <span className="text-warning font-mono font-bold">14:32 remaining</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-card flex justify-between items-center">
                    <span className="text-sm font-medium">User A Bid</span>
                    <span className="font-serif font-bold text-base text-primary">-15% (₹1,500 Discount)</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-card flex justify-between items-center">
                    <span className="text-sm font-medium">User B Bid</span>
                    <span className="font-serif font-bold text-base text-muted-foreground">-10% (₹1,000 Discount)</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground">Stage 4</Badge>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">Winning Member Receives Pool</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    The winning bidder receives the pool payout immediately (Pool Amount minus Winning Discount).
                  </p>
                  <div className="mt-4 rounded-xl bg-muted/40 p-4 border space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Pool:</span><span className="font-bold">₹10,000</span></div>
                    <div className="flex justify-between"><span>Winning Discount (-15%):</span><span className="font-bold text-warning">-₹1,500</span></div>
                    <div className="flex justify-between border-t pt-2 font-serif text-base font-bold text-success">
                      <span>Winner Payout:</span><span>₹8,500</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-6 text-center space-y-3">
                  <Wallet className="h-12 w-12 text-emerald-500 mx-auto" />
                  <p className="font-serif text-xl font-bold">Payout Settled Instantly</p>
                  <p className="text-xs text-muted-foreground">Winner receives ₹8,500 directly in their wallet balance.</p>
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground">Stage 5</Badge>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">Dividend Shared to Savers</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                    The ₹1,500 discount surrendered by the winner is distributed equally among the remaining 9 non-bidding members!
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> ₹1,500 ÷ 9 Non-bidders = ₹166.67 Dividend per member</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Any non-divisible extra remainder goes to group creator</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 100% transparent dividend allocation</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3">
                  <TrendingUp className="h-12 w-12 text-emerald-500 mx-auto" />
                  <p className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">+₹166.67 Dividend</p>
                  <p className="text-xs text-muted-foreground">Credited to every non-bidding member's wallet for this cycle.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE CARDS SECTION (PROFIT CALCULATOR + TRUST & PENALTY SYSTEM) */}
      <section id="interactive-features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">Platform Mechanics</Badge>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Savers Profits & Trust System
            </h2>
            <p className="mt-3 text-muted-foreground">
              Interact with our live profit calculator and trust scoring system below.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            
            {/* INTERACTIVE CARD 1: PROFIT & DIVIDEND CALCULATOR */}
            <Card className="border-border shadow-sm flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-emerald-500" />
                    <CardTitle className="font-serif text-xl">Profit & Dividend Calculator</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Interactive</Badge>
                </div>
                <CardDescription>Simulate how much non-bidders earn from winning auction discounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Pool Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Pool Amount:</span>
                    <span className="font-serif font-bold text-foreground">{formatCurrency(calcPool)}</span>
                  </div>
                  <Slider value={[calcPool]} min={2000} max={50000} step={1000} onValueChange={(v) => setCalcPool(v[0])} />
                </div>

                {/* Discount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Winning Discount Bid Rate:</span>
                    <span className="font-serif font-bold text-primary">{calcDiscount}%</span>
                  </div>
                  <Slider value={[calcDiscount]} min={5} max={35} step={1} onValueChange={(v) => setCalcDiscount(v[0])} />
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border bg-muted/30 p-3.5">
                    <p className="text-xs text-muted-foreground">Winner Payout</p>
                    <p className="font-serif text-lg font-bold text-foreground mt-0.5">{formatCurrency(winnerPayout)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Dividend per Savers Seat</p>
                    <p className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{formatCurrency(dividendPerMember)}</p>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* INTERACTIVE CARD 2: TRUST SCORE SIMULATOR */}
            <Card className="border-border shadow-sm flex flex-col justify-between" id="trust-system">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="font-serif text-xl">Trust Score Simulator</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">Interactive</Badge>
                </div>
                <CardDescription>See how on-time contributions raise your score and unlock higher pool limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Controls */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">On-Time Contributions:</span>
                    <span className="font-bold">{onTimePayments} cycles</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setOnTimePayments(Math.max(1, onTimePayments - 1))}>- 1 Cycle</Button>
                    <Button size="sm" variant="outline" onClick={() => setOnTimePayments(Math.min(12, onTimePayments + 1))}>+ 1 Cycle</Button>
                    <Button size="sm" variant={hasDefaulted ? "destructive" : "secondary"} onClick={() => setHasDefaulted(!hasDefaulted)}>
                      {hasDefaulted ? "Defaulted!" : "Simulate Default"}
                    </Button>
                  </div>
                </div>

                {/* Simulated Score Output */}
                <div className="rounded-2xl border p-4 bg-background space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulated Score</span>
                    <Badge className={trustBand === "HIGH" ? "bg-emerald-600 text-white" : trustBand === "MEDIUM" ? "bg-amber-600 text-white" : "bg-red-600 text-white"}>
                      {trustBand} TRUST BAND
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-3xl font-bold">{trustScore} / 100</span>
                    <span className="text-xs text-muted-foreground">{trustScore >= 80 ? "Unlocked Premium Circles" : "Standard Pool Access"}</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full transition-all duration-300", trustScore >= 80 ? "bg-emerald-500" : trustScore >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${trustScore}%` }} />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* INTERACTIVE CARD 3: DEFAULT PENALTY & RECOVERY SYSTEM */}
            <Card className="border-border shadow-sm flex flex-col justify-between md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    <CardTitle className="font-serif text-xl">Penalty & Auto-Recovery Protection</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600">Discipline Rules</Badge>
                </div>
                <CardDescription>Strict default penalties protect pool winners and maintain community trust.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-background">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Late Contribution Penalty</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Overdue members incur 5% late penalty fees, which flow back into pool winner of the defaulted cycle.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-background">
                  <RefreshCw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Auto-Recovery System</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Overdue defaults automatically deduct trust points and place overdue balances in recovery tracking until cleared.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* INTERACTIVE CARD 4: PEER TO PEER DIRECT SAVINGS (NO MIDDLEMAN) */}
            <Card className="border-border shadow-sm flex flex-col justify-between md:col-span-2 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="font-serif text-xl">Peer-to-Peer Circles — Zero Middlemen</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">100% Direct</Badge>
                </div>
                <CardDescription>Direct community pooling without bank cutbacks, hidden broker fees, or intermediary commissions.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background/80">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">Direct Peer Pooling</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contributions move directly between verified circle members without intermediate bank holds or agent locks.
                  </p>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background/80">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Percent className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">0% Agent Commission</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Traditional chit funds charge 5% foreman fees. On Circl, 100% of auction discounts stay with group members.
                  </p>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background/80">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">Self-Governing Circles</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Transparent ledger rules enforced automatically—no central authority can withhold payouts or alter bid results.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-8">
          <a href="#" className="cursor-pointer hover:opacity-90 transition-opacity">
            <Logo />
          </a>
          <p>{new Date().getFullYear()} Circl. Community savings, transparently reinvented.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground">Sign In</Link>
            <Link to="/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
