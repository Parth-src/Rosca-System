import * as React from "react"

export interface Countdown {
  totalMs: number
  seconds: number
  minutes: number
  hours: number
  days: number
  label: string
  isSoon: boolean
  isPast: boolean
}

export function useCountdown(target: string | Date | null | undefined): Countdown {
  const compute = React.useCallback((): Countdown => {
    if (!target) return { totalMs: 0, seconds: 0, minutes: 0, hours: 0, days: 0, label: "—", isSoon: false, isPast: true }
    let end: number
    if (typeof target === "string") {
      const isRawLocal = !target.endsWith("Z") && !target.includes("+") && !target.match(/-\d{2}:\d{2}$/);
      end = new Date(isRawLocal ? target + "Z" : target).getTime()
    } else {
      end = target.getTime()
    }
    const totalMs = Math.max(0, end - Date.now())
    const totalSec = Math.floor(totalMs / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    let label: string
    if (totalMs <= 0) label = "Live now"
    else if (days > 0) label = `${days}d ${hours}h`
    else if (hours > 0) label = `${hours}h ${minutes}m`
    else if (minutes > 0) label = `${minutes}m ${seconds.toString().padStart(2, "0")}s`
    else label = `${seconds}s`
    return { totalMs, seconds, minutes, hours, days, label, isSoon: totalMs > 0 && totalMs <= 30 * 60000, isPast: totalMs <= 0 }
  }, [target])

  const [state, setState] = React.useState<Countdown>(compute)
  React.useEffect(() => {
    setState(compute())
    const id = setInterval(() => setState(compute()), 1000)
    return () => clearInterval(id)
  }, [compute])
  return state
}