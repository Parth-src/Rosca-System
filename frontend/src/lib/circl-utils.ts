export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatDateTime(value: string | Date) {
  let d: Date
  if (typeof value === "string") {
    const isRawLocal = !value.endsWith("Z") && !value.includes("+") && !value.match(/-\d{2}:\d{2}$/);
    d = new Date(isRawLocal ? value + "Z" : value)
  } else {
    d = value
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d)
}

export function formatFrequency(f: string) {
  const map: Record<string, string> = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly" }
  return map[f] ?? f
}