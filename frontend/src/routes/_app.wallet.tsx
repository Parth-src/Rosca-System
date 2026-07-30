import { useState, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Download, Filter } from "lucide-react"
import { transactionApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/circl-utils"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types"

export const Route = createFileRoute("/_app/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Circl" },
      { name: "description", content: "Your Circl wallet balance, contributions, payouts, and dividends." },
      { property: "og:title", content: "Wallet — Circl" },
      { property: "og:description", content: "Your Circl wallet ledger." },
    ],
  }),
  component: WalletPage,
})

const TYPE_LABEL: Record<string, string> = {
  CONTRIBUTION: "Contribution",
  ALLOCATION: "Pool",
  PAYOUT: "Pool",
  DIVIDEND: "Dividend",
  PENALTY: "Penalty",
  RECOVERY: "Recovery",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  FEE: "Fee",
}

function getRawType(t: Transaction | string): string {
  if (typeof t === "string") return t.toUpperCase()
  return String(t.transactionType || t.type || "").toUpperCase()
}

function getTypeLabel(t: Transaction | string): string {
  const upper = getRawType(t)
  return TYPE_LABEL[upper] ?? (upper || "Transaction")
}

function TypeBadge({ tx }: { tx: Transaction }) {
  const upper = getRawType(tx)
  const label = getTypeLabel(tx)

  if (upper === "CONTRIBUTION") {
    return <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-medium">Contribution</Badge>
  }
  if (upper === "ALLOCATION" || upper === "PAYOUT") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Pool</Badge>
  }
  if (upper === "DIVIDEND") {
    return <Badge variant="outline" className="border-blue-500/35 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-medium">Dividend</Badge>
  }
  if (upper === "PENALTY") {
    return <Badge variant="destructive">Penalty</Badge>
  }
  return <Badge variant="secondary" className="font-medium">{label}</Badge>
}

type TransactionTypeFilter = "ALL" | "CONTRIBUTION" | "POOL" | "DIVIDEND" | "PENALTY"

function WalletPage() {
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("ALL")
  
  const txs = useQuery({
    queryKey: ["transactions", user?.userId],
    queryFn: () => transactionApi.getForUser(user!.userId),
    enabled: !!user,
  })
  const tableRef = useRef<HTMLDivElement>(null)

  const allTxs = txs.data ?? []

  const inflow = allTxs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflow = allTxs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  const counts = {
    ALL: allTxs.length,
    CONTRIBUTION: allTxs.filter((t) => getRawType(t) === "CONTRIBUTION").length,
    POOL: allTxs.filter((t) => getRawType(t) === "ALLOCATION" || getRawType(t) === "PAYOUT").length,
    DIVIDEND: allTxs.filter((t) => getRawType(t) === "DIVIDEND").length,
    PENALTY: allTxs.filter((t) => getRawType(t) === "PENALTY").length,
  }

  const filteredTxs = allTxs.filter((t) => {
    if (typeFilter === "ALL") return true
    const upper = getRawType(t)
    if (typeFilter === "CONTRIBUTION") return upper === "CONTRIBUTION"
    if (typeFilter === "POOL") return upper === "ALLOCATION" || upper === "PAYOUT"
    if (typeFilter === "DIVIDEND") return upper === "DIVIDEND"
    if (typeFilter === "PENALTY") return upper === "PENALTY"
    return true
  })

  const handleExportCSV = () => {
    if (filteredTxs.length === 0) return

    const headers = ["Date", "Description", "Circle", "Type", "Amount"]
    const rows = filteredTxs.map(t => [
      new Date(t.createdAt).toLocaleString(),
      `"${t.description || getTypeLabel(t)}"`,
      `"${t.groupName || ''}"`,
      getTypeLabel(t),
      t.amount
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "circl-transactions.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <PageHeader title="Wallet" description="Every payment across your circles, in one ledger." />

      <div className="grid gap-4 md:grid-cols-3">
        <BalanceCard label="Available balance" value={formatCurrency(user?.accountBalance ?? 0)} tone="primary" />
        <BalanceCard label="Total inflow" value={formatCurrency(inflow)} tone="success" icon={ArrowDown} />
        <BalanceCard label="Total outflow" value={formatCurrency(Math.abs(outflow))} tone="warning" icon={ArrowUp} />
      </div>

      <Card className="mt-6" ref={tableRef}>
        <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-serif">Transactions</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 self-start sm:self-auto">
            <Download className="h-4 w-4" /> Export as CSV
          </Button>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-1.5 px-6 pb-3 pt-1 border-b border-border/60">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter by type:
          </span>
          <Button
            size="sm"
            variant={typeFilter === "ALL" ? "default" : "outline"}
            onClick={() => setTypeFilter("ALL")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            All ({counts.ALL})
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "CONTRIBUTION" ? "default" : "outline"}
            onClick={() => setTypeFilter("CONTRIBUTION")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Contribution ({counts.CONTRIBUTION})
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "POOL" ? "default" : "outline"}
            onClick={() => setTypeFilter("POOL")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Pool ({counts.POOL})
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "DIVIDEND" ? "default" : "outline"}
            onClick={() => setTypeFilter("DIVIDEND")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Dividend ({counts.DIVIDEND})
          </Button>
          {counts.PENALTY > 0 && (
            <Button
              size="sm"
              variant={typeFilter === "PENALTY" ? "default" : "outline"}
              onClick={() => setTypeFilter("PENALTY")}
              className="h-7 text-xs px-2.5 rounded-lg"
            >
              Penalty ({counts.PENALTY})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {txs.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxs.map((t) => {
                  const typeLabel = getTypeLabel(t)
                  const desc = t.description || (t.groupName ? `${typeLabel} — ${t.groupName}` : typeLabel)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6 text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{desc}</p>
                          {t.groupName && t.description && <p className="text-xs text-muted-foreground">{t.groupName}</p>}
                        </div>
                      </TableCell>
                      <TableCell><TypeBadge tx={t} /></TableCell>
                      <TableCell className={cn(
                        "pr-6 text-right font-serif text-base font-semibold tabular-nums",
                        t.amount >= 0 ? "text-success" : "text-foreground",
                      )}>
                        {t.amount >= 0 ? "+" : ""}{formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredTxs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No transactions found for the selected type filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function BalanceCard({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "primary" | "success" | "warning"; icon?: React.ElementType }) {
  const toneClass = tone === "primary" ? "bg-primary text-primary-foreground" : tone === "success" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}