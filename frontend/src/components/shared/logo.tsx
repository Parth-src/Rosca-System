import { cn } from "@/lib/utils"

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground" />
      </span>
      {showWordmark && <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Circl</span>}
    </span>
  )
}
