import * as React from "react"
import { cn } from "@/lib/utils"

interface RotatingWord {
  label: string
  native: string
  region: string
}

const WORDS: RotatingWord[] = [
  { label: "Chit Fund", native: "चिट फंड", region: "India" },
  { label: "Tanda", native: "Tanda", region: "Mexico" },
  { label: "Susu", native: "Susu", region: "West Africa" },
  { label: "Hui", native: "會", region: "China" },
  { label: "Paluwagan", native: "Paluwagan", region: "Philippines" },
]

export function RotatingText({ className }: { className?: string }) {
  const [index, setIndex] = React.useState(0)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const fadeOut = setTimeout(() => setVisible(false), 2200)
    const swap = setTimeout(() => {
      setIndex((i) => (i + 1) % WORDS.length)
      setVisible(true)
    }, 2500)
    return () => {
      clearTimeout(fadeOut)
      clearTimeout(swap)
    }
  }, [index])

  const word = WORDS[index]

  return (
    <span
      className={cn(
        "inline-flex flex-col transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className,
      )}
      aria-live="polite"
    >
      <span className="text-accent">{word.native}</span>
      <span className="text-base font-normal text-muted-foreground md:text-lg">
        {word.label} · {word.region}
      </span>
    </span>
  )
}
