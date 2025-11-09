"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getResults, type LotteryResult } from "@/lib/automation"
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AdminResultsPage() {
  const { t } = useI18n()
  const [results, setResults] = useState<LotteryResult[]>([])

  useEffect(() => {
    const loadResults = () => {
      setResults(getResults())
    }

    loadResults()
    const interval = setInterval(loadResults, 5000)

    return () => clearInterval(interval)
  }, [])

  const totalPrizes = results.reduce((sum, r) => sum + r.prizeAmount, 0)
  const totalParticipants = results.reduce((sum, r) => sum + r.totalParticipants, 0)
  const totalTickets = results.reduce((sum, r) => sum + r.totalTickets, 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("admin.results.title")}</h1>
        <p className="text-muted-foreground">{t("admin.results.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.results.completedRaffles")}</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.results.prizesDistributed")}</p>
              <p className="text-2xl font-bold">{totalPrizes.toFixed(0)} USDT</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.results.totalParticipants")}</p>
              <p className="text-2xl font-bold">{totalParticipants}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.results.ticketsSold")}</p>
              <p className="text-2xl font-bold">{totalTickets}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="glass-card border-primary/20 p-6">
        <h2 className="text-xl font-bold mb-6">{t("admin.results.history")}</h2>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.lotteryId + result.timestamp}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{result.lotteryTitle}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>
                        {t("admin.results.winner")}: {result.winnerName}
                      </span>
                      <span>
                        {t("admin.results.ticket")} #{result.winningTicket}
                      </span>
                      <span>
                        {result.totalParticipants} {t("admin.results.participants")}
                      </span>
                      <span>{new Date(result.timestamp).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{result.prizeAmount} USDT</p>
                  <p className="text-xs text-muted-foreground">
                    {result.totalTickets} {t("admin.results.tickets")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">{t("admin.results.noResults")}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
