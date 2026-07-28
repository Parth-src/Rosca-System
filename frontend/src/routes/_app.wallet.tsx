import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp } from "lucide-react"
import { transactionApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/circl-utils"
import { cn } from "@/lib/utils"
import type { TransactionType } from "@/types"

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

const TYPE_LABEL: Record<TransactionType, string> = {
  CONTRIBUTION: "Contribution",
  PAYOUT: "Payout",
  DIVIDEND: "Dividend",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  FEE: "Fee",
}

function WalletPage() {
  const { user } = useAuth()
  const txs = useQuery({
    queryKey: ["transactions", user?.userId],
    queryFn: () => transactionApi.getForUser(user!.userId),
    enabled: !!user,
  })

  const inflow = (txs.data ?? []).filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflow = (txs.data ?? []).filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <PageHeader title="Wallet" description="Every payment across your circles, in one ledger." />

      <div className="grid gap-4 md:grid-cols-3">
        <BalanceCard label="Available balance" value={formatCurrency(user?.accountBalance ?? 0)} tone="primary" />
        <BalanceCard label="Total inflow" value={formatCurrency(inflow)} tone="success" icon={ArrowDown} />
        <BalanceCard label="Total outflow" value={formatCurrency(Math.abs(outflow))} tone="warning" icon={ArrowUp} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {txs.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(txs.data ?? []).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{t.description}</p>
                        {t.groupName && <p className="text-xs text-muted-foreground">{t.groupName}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{TYPE_LABEL[t.type]}</Badge></TableCell>
                    <TableCell className={cn(
                      "text-right font-serif text-base font-semibold tabular-nums",
                      t.amount >= 0 ? "text-success" : "text-foreground",
                    )}>
                      {t.amount >= 0 ? "+" : ""}{formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {txs.data?.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No transactions yet</TableCell></TableRow>
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