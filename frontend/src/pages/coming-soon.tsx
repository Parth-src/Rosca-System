import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <Sparkles className="h-6 w-6 text-accent" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-sm text-pretty text-muted-foreground">
        This part of Circl is coming in the next release. The live auction room, wallet ledger, and
        risk profile are on the way.
      </p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
