import * as React from "react"

export interface Countdown {
  totalMs: number
  minutes: number
  hours: number
  days: number
  label: string
  isSoon: boolean // starts within 30 minutes
  isPast: boolean
}

export function useCountdown(target: string | Date | undefined): Countdown {
  const compute = React.useCallback((): Countdown => {
    if (!target) {
      return { totalMs: 0, minutes: 0, hours: 0, days: 0, label: "—", isSoon: false, isPast: true }
    }
    const end = typeof target === "string" ? new Date(target).getTime() : target.getTime()
    const totalMs = Math.max(0, end - Date.now())
    const totalMinutes = Math.floor(totalMs / 60000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    let label: string
    if (totalMs <= 0) label = "Live now"
    else if (days > 0) label = `${days}d ${hours}h`
    else if (hours > 0) label = `${hours}h ${minutes}m`
    else label = `${minutes}m`

    return {
      totalMs,
      minutes,
      hours,
      days,
      label,
      isSoon: totalMs > 0 && totalMs <= 30 * 60000,
      isPast: totalMs <= 0,
    }
  }, [target])

  const [state, setState] = React.useState<Countdown>(compute)

  React.useEffect(() => {
    setState(compute())
    const id = setInterval(() => setState(compute()), 1000)
    return () => clearInterval(id)
  }, [compute])

  return state
}
