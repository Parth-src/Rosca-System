import { Badge } from "@/components/ui/badge"
import type { MembershipStatus } from "@/types"

const STATUS_MAP: Record<MembershipStatus, { label: string; variant: "success" | "secondary" | "warning" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  POOL_RECEIVED: { label: "Pool Received", variant: "secondary" },
  RESTRICTED: { label: "Restricted", variant: "warning" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "outline" },
  LEFT: { label: "Left", variant: "outline" },
}

export function StatusBadge({ status }: { status: MembershipStatus }) {
  const cfg = STATUS_MAP[status] ?? { label: status, variant: "outline" as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function RiskBadge({ threshold }: { threshold: number }) {
  if (threshold >= 70) return <Badge variant="destructive">High Risk</Badge>
  if (threshold >= 45) return <Badge variant="warning">Medium Risk</Badge>
  return <Badge variant="success">Low Risk</Badge>
}