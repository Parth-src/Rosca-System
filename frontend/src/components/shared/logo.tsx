import { cn } from "@/lib/utils"

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/logo.png" alt="Circl Logo" className="h-8 w-8 object-contain" />
      {showWordmark && <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Circl</span>}
    </span>
  )
}