import { cn } from "@/lib/utils"

export function Logo({
  className,
  imageClassName,
  textClassName,
  showWordmark = true,
}: {
  className?: string
  imageClassName?: string
  textClassName?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className={cn("relative flex items-center justify-center overflow-hidden rounded-full border border-border/40 bg-background shrink-0 shadow-sm h-11 w-11", imageClassName)}>
        <img
          src="/logo.png"
          alt="Circl Logo"
          className="h-full w-full object-cover object-center scale-105"
        />
      </span>
      {showWordmark && (
        <span className={cn("font-serif text-2xl font-bold tracking-tight text-foreground", textClassName)}>
          Circl
        </span>
      )}
    </span>
  )
}