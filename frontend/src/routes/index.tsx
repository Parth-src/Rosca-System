import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, ShieldCheck, Gavel, Wallet, TrendingUp } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { RotatingText } from "@/components/shared/rotating-text"
import { Button } from "@/components/ui/button"

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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild><Link to="/register">Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:px-8 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              A modern ROSCA platform
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold tracking-tight md:text-6xl">
              Save together as a<br />
              <RotatingText className="mt-2 text-5xl md:text-6xl" />
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Circl turns a centuries-old tradition into a transparent, auction-based savings
              experience. Contribute together, bid for the pool, and grow your trust score with
              every on-time payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">Start your first Circl <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Live auction</p>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">Live</span>
            </div>
            <p className="mt-3 font-serif text-2xl font-semibold">Mumbai Merchants Chit · Cycle 4</p>
            <p className="mt-1 text-sm text-muted-foreground">Pool of $6,000 · 12 members</p>
            <div className="mt-6 space-y-3">
              {[
                { name: "Arjun Mehta", bid: 18 },
                { name: "Sana Kapoor", bid: 15 },
                { name: "Priya Nair", bid: 12 },
              ].map((b, i) => (
                <div key={b.name} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                  <span className="font-serif text-lg font-semibold tabular-nums">-{b.bid}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4 md:px-8">
          {[
            { icon: Gavel, title: "Transparent auctions", body: "Every 30-minute cycle is public and time-stamped." },
            { icon: ShieldCheck, title: "Trust scoring", body: "Members earn trust with each on-time contribution." },
            { icon: Wallet, title: "Instant payouts", body: "Winning bids settle directly into your wallet." },
            { icon: TrendingUp, title: "Dividend sharing", body: "Discounts from bids flow back to members." },
          ].map((f) => (
            <div key={f.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:px-8">
        <Logo />
        <p>© {new Date().getFullYear()} Circl. Community savings, reimagined.</p>
      </footer>
    </div>
  )
}
