"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getResults, type LotteryResult } from "@/lib/automation"
import { Trophy, Users, Ticket, Calendar, Award } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@")
  if (!localPart || !domain) return email

  // Show first letter + *** + @domain
  return `${localPart[0]}***@${domain}`
}

export default function ResultsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [results, setResults] = useState<LotteryResult[]>([])
  const [filter, setFilter] = useState<"all" | "won">("all")

  useEffect(() => {
    const loadResults = () => {
      const storedResults = getResults()

      if (storedResults.length === 0 && user) {
        const mockResults: LotteryResult[] = [
          {
            lotteryId: "mock-1",
            lotteryTitle: "Sorteo Semanal Premium",
            winnerId: user.id, // Current user wins this one
            winnerName: user.name,
            winnerEmail: user.email,
            winningTicket: "00542",
            prizeAmount: 500,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            totalParticipants: 45,
            totalTickets: 120,
          },
          {
            lotteryId: "mock-2",
            lotteryTitle: "Mega Sorteo USDT",
            winnerId: "other-user-1",
            winnerName: "Carlos Rodríguez",
            winnerEmail: "carlos.rodriguez@gmail.com",
            winningTicket: "01234",
            prizeAmount: 1000,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            totalParticipants: 89,
            totalTickets: 250,
          },
          {
            lotteryId: "mock-3",
            lotteryTitle: "Sorteo Diario Express",
            winnerId: "other-user-2",
            winnerName: "María González",
            winnerEmail: "maria.gonzalez@hotmail.com",
            winningTicket: "00789",
            prizeAmount: 250,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            totalParticipants: 32,
            totalTickets: 85,
          },
          {
            lotteryId: "mock-4",
            lotteryTitle: "Super Sorteo Nocturno",
            winnerId: user.id, // Current user wins this one too
            winnerName: user.name,
            winnerEmail: user.email,
            winningTicket: "00156",
            prizeAmount: 750,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            totalParticipants: 67,
            totalTickets: 180,
          },
          {
            lotteryId: "mock-5",
            lotteryTitle: "Sorteo Especial Fin de Semana",
            winnerId: "other-user-3",
            winnerName: "Juan Pérez",
            winnerEmail: "juan.perez@yahoo.com",
            winningTicket: "02468",
            prizeAmount: 1500,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            totalParticipants: 125,
            totalTickets: 350,
          },
        ]
        setResults(mockResults)
      } else {
        setResults(storedResults)
      }
    }

    loadResults()
    const interval = setInterval(loadResults, 5000)

    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  const userWins = results.filter((r) => r.winnerId === user.id)
  const filteredResults = filter === "won" ? userWins : results

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("results.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("results.subtitle")}</p>
      </div>

      {/* User Stats - Made responsive */}
      {userWins.length > 0 && (
        <Card className="glass-card border-primary/30 p-4 sm:p-6 glow-effect">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("results.yourWins")}</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary text-glow">{userWins.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("results.totalWon")}: {userWins.reduce((sum, r) => sum + r.prizeAmount, 0).toFixed(2)} USDT
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Results List - Made responsive */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold">
            {t("results.allResults")} ({filteredResults.length})
          </h2>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary hover:bg-primary/90" : ""}
            >
              {t("results.filter.all")}
            </Button>
            <Button
              variant={filter === "won" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("won")}
              className={filter === "won" ? "bg-primary hover:bg-primary/90" : ""}
            >
              {t("results.filter.won")}
            </Button>
          </div>
        </div>

        {filteredResults.length > 0 ? (
          <div className="space-y-4">
            {filteredResults.map((result) => {
              const isUserWinner = result.winnerId === user.id
              return (
                <Card
                  key={result.lotteryId + result.timestamp}
                  className={`p-4 sm:p-6 border ${
                    isUserWinner
                      ? "glass-card border-primary/40 bg-primary/5 glow-effect"
                      : "glass-card border-primary/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${
                          isUserWinner ? "bg-primary/30 glow-effect" : "bg-primary/20"
                        }`}
                      >
                        <Trophy className={`w-6 h-6 sm:w-7 sm:h-7 ${isUserWinner ? "text-primary" : "text-primary"}`} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">{result.lotteryTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isUserWinner && (
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 border border-primary/30 animate-pulse">
                        <span className="text-xs sm:text-sm font-semibold text-primary">{t("results.youWon")}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t("results.prize")}</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-primary">{result.prizeAmount} USDT</p>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t("results.winningTicket")}</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold font-mono">#{result.winningTicket}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t("results.participants")}</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold">{result.totalParticipants}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t("results.totalTickets")}</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold">{result.totalTickets}</p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("results.winner")}</p>
                        <p className="text-base sm:text-lg font-bold text-primary font-mono">
                          {maskEmail(result.winnerEmail)}
                        </p>
                      </div>
                      {isUserWinner && (
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t("results.prizeReceived")}</p>
                          <p className="text-xl sm:text-2xl font-bold text-primary text-glow">
                            +{result.prizeAmount} USDT
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base text-muted-foreground">{t("results.noResults")}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("results.noResults.desc")}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
