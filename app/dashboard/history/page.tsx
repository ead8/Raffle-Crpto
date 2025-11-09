"use client"

import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { getTransactions } from "@/lib/wallet"
import { useEffect, useState } from "react"
import { Trophy, TrendingUp, TrendingDown, Ticket, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export default function HistoryPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [filter, setFilter] = useState<string>("all")
  const { t } = useI18n()

  useEffect(() => {
    if (user) {
      const allTransactions = getTransactions(user.id)
      setTransactions(allTransactions)
    }
  }, [user])

  if (!user) return null

  const filteredTransactions = filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="w-5 h-5" />
      case "withdrawal":
        return <TrendingDown className="w-5 h-5" />
      case "ticket_purchase":
        return <Ticket className="w-5 h-5" />
      case "prize_won":
        return <Trophy className="w-5 h-5" />
      default:
        return <TrendingUp className="w-5 h-5" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "prize_won":
        return "bg-chart-2/20 text-chart-2"
      case "withdrawal":
      case "ticket_purchase":
        return "bg-chart-1/20 text-chart-1"
      default:
        return "bg-primary/20 text-primary"
    }
  }

  const filters = [
    { value: "all", label: t("history.filter.all") },
    { value: "deposit", label: t("history.filter.deposits") },
    { value: "withdrawal", label: t("history.filter.withdrawals") },
    { value: "ticket_purchase", label: t("history.filter.tickets") },
    { value: "prize_won", label: t("history.filter.prizes") },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("history.title")}</h1>
        <p className="text-muted-foreground">{t("history.subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/20 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("history.totalDeposited")}</p>
          <p className="text-2xl font-bold text-chart-2">
            {transactions
              .filter((tx) => tx.type === "deposit")
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toFixed(2)}{" "}
            USDT
          </p>
        </Card>
        <Card className="glass-card border-primary/20 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("history.totalWithdrawn")}</p>
          <p className="text-2xl font-bold text-chart-1">
            {transactions
              .filter((tx) => tx.type === "withdrawal")
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toFixed(2)}{" "}
            USDT
          </p>
        </Card>
        <Card className="glass-card border-primary/20 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("history.spentOnTickets")}</p>
          <p className="text-2xl font-bold text-primary">
            {transactions
              .filter((tx) => tx.type === "ticket_purchase")
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toFixed(2)}{" "}
            USDT
          </p>
        </Card>
        <Card className="glass-card border-primary/20 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("history.prizesWon")}</p>
          <p className="text-2xl font-bold text-accent">
            {transactions
              .filter((tx) => tx.type === "prize_won")
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toFixed(2)}{" "}
            USDT
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-primary/20 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">{t("history.filterBy")}</span>
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={
                filter === f.value
                  ? "bg-primary hover:bg-primary/90"
                  : "border-primary/30 hover:bg-primary/10 bg-transparent"
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="glass-card border-primary/20 p-6">
        <h2 className="text-xl font-bold mb-6">
          {t("history.transactions")} ({filteredTransactions.length})
        </h2>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTransactionColor(tx.type)}`}
                  >
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.description}</p>
                    {tx.type === "prize_won" && (tx.lotteryTitle || tx.ticketNumber) && (
                      <div className="flex items-center gap-2 mt-1">
                        {tx.lotteryTitle && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            {tx.lotteryTitle}
                          </span>
                        )}
                        {tx.ticketNumber && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                            {t("history.ticket")}: {tx.ticketNumber}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "completed"
                            ? "bg-chart-2/20 text-chart-2"
                            : tx.status === "pending"
                              ? "bg-chart-4/20 text-chart-4"
                              : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {tx.status === "completed"
                          ? t("history.status.completed")
                          : tx.status === "pending"
                            ? t("history.status.pending")
                            : t("history.status.failed")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "deposit" || tx.type === "prize_won" ? "text-chart-2" : "text-chart-1"
                    }`}
                  >
                    {tx.type === "deposit" || tx.type === "prize_won" ? "+" : "-"}
                    {tx.amount.toFixed(2)} USDT
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{tx.id}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("history.noTransactions")}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
