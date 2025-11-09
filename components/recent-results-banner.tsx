"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getResults, type LotteryResult } from "@/lib/automation"
import { Trophy, Ticket, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RecentResultsBanner() {
  const { t } = useI18n()
  const [results, setResults] = useState<LotteryResult[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const loadResults = () => {
      const allResults = getResults()
      // Show only the 3 most recent results
      setResults(allResults.slice(0, 3))
    }

    loadResults()
    const interval = setInterval(loadResults, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible || results.length === 0) return null

  return (
    <div className="container mx-auto px-4 pt-4">
      <Card className="glass-card border-primary/30 p-4 relative overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t("results.recentWinners")}</h3>
            <p className="text-xs text-muted-foreground">{t("results.recentWinners.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.lotteryId + result.timestamp}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-primary/10"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Ticket className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{result.lotteryTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("results.winner")}: <span className="text-primary font-medium">{result.winnerName}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-bold text-primary">{result.prizeAmount} USDT</p>
                <p className="text-xs text-muted-foreground">#{result.winningTicket}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/dashboard/results">
          <Button variant="outline" className="w-full mt-3 border-primary/30 hover:bg-primary/10 bg-transparent">
            {t("results.viewAll")}
          </Button>
        </Link>
      </Card>
    </div>
  )
}
