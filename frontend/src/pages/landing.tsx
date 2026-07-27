import { Link } from "react-router-dom"
import { ArrowUpRight, PiggyBank, Users, Globe, ShieldCheck, Gavel, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { RotatingText } from "@/components/shared/rotating-text"
import { useAuth } from "@/context/AuthContext"

const FEATURES = [
  {
    icon: PiggyBank,
    title: "Save together",
    body: "Pool fixed contributions with people you trust and receive a lump-sum payout when it's your turn.",
  },
  {
    icon: Gavel,
    title: "Bid transparently",
    body: "Every cycle runs a live 30-minute auction. The lowest bid wins the pool — no hidden middlemen.",
  },
  {
    icon: ShieldCheck,
    title: "Trust, scored",
    body: "A dynamic trust score protects every circle, flagging risk before it reaches your savings.",
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#global" className="transition-colors hover:text-foreground">Global</a>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-center md:px-8 md:pt-20">
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success" />
          Community savings, reinvented for the world
        </div>

        <h1 className="mx-auto max-w-4xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          The world has always saved in circles.
        </h1>

        <div className="mx-auto mt-6 flex min-h-[5.5rem] max-w-2xl flex-col items-center justify-center text-2xl font-medium md:text-3xl">
          <span className="text-muted-foreground">Known as</span>
          <RotatingText className="mt-1 items-center text-center font-serif text-4xl font-semibold md:text-5xl" />
        </div>

        <p className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Circl brings rotating savings and credit associations online — transparent auctions,
          trust scoring, and instant payouts for pools everywhere.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/register">
              Start a circle
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-balance font-serif text-3xl font-semibold md:text-4xl">
                One pool. Every member wins — once.
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Members contribute a set amount each cycle. In each auction the participant willing
                to take the largest discount wins the pool that round; the discount is shared back
                as a dividend to everyone else. Over the full term, every member receives a payout.
              </p>
              <div className="mt-6 flex flex-wrap gap-6">
                <Stat icon={Users} value="6–15" label="members per circle" />
                <Stat icon={Globe} value="5+" label="savings traditions" />
                <Stat icon={LineChart} value="0–100" label="trust score" />
              </div>
            </div>
            <div id="global" className="grid grid-cols-2 gap-3">
              {[
                { native: "चिट फंड", region: "India" },
                { native: "Tanda", region: "Mexico" },
                { native: "Susu", region: "West Africa" },
                { native: "會", region: "China" },
                { native: "Paluwagan", region: "Philippines" },
                { native: "Circl", region: "Everywhere" },
              ].map((item) => (
                <div key={item.region} className="rounded-2xl border border-border bg-background p-5">
                  <p className="font-serif text-2xl font-semibold">{item.native}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.region}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <Logo />
          <p>Built for communities that save together.</p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-serif text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
