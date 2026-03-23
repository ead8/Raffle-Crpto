"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LotteryCard } from "@/components/lottery-card"
import {
  type Lottery,
  type UserTicket,
} from "@/lib/lottery"
import { Ticket, Trophy, Clock, Sparkles, User } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { fetchLotteries } from "@/lib/lotteries-api"

export default function LotteryPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [activeLotteries, setActiveLotteries] = useState<Lottery[]>([])
  const [upcomingLotteries, setUpcomingLotteries] = useState<Lottery[]>([])
  const [completedLotteries, setCompletedLotteries] = useState<Lottery[]>([])
  const [userTickets, setUserTickets] = useState<UserTicket[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadLotteries = async () => {
      try {
        setLoadError(null)
        const all = await fetchLotteries()
        setActiveLotteries(all.filter((l) => l.status === "active"))
        setUpcomingLotteries(all.filter((l) => l.status === "upcoming"))
        setCompletedLotteries(all.filter((l) => l.status === "completed"))
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load lotteries")
      }

      // TODO: migrate user tickets from local demo storage to DB.
      if (user) setUserTickets([])
    }

    loadLotteries()
    const interval = setInterval(loadLotteries, 5000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("lottery.title")}</h1>
        <p className="text-muted-foreground">{t("lottery.subtitle")}</p>
        {loadError && <p className="text-sm text-destructive mt-2">{loadError}</p>}
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("lottery.activeRaffles")}</p>
              <p className="text-2xl font-bold">{activeLotteries.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("lottery.totalPrize")}</p>
              <p className="text-2xl font-bold text-primary">
                {activeLotteries.reduce((sum, l) => sum + l.prizeAmount, 0)} USDT
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("lottery.upcomingRaffles")}</p>
              <p className="text-2xl font-bold">{upcomingLotteries.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lottery Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card border-primary/20 p-1">
          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Ticket className="w-4 h-4 mr-2" />
            {t("lottery.active")} ({activeLotteries.length})
          </TabsTrigger>
          <TabsTrigger value="myTickets" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            {t("lottery.myTickets")} ({userTickets.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            {t("lottery.upcoming")} ({upcomingLotteries.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            {t("lottery.completed")} ({completedLotteries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeLotteries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLotteries.map((lottery) => (
                <LotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          ) : (
            <Card className="glass-card border-primary/20 p-12 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{t("lottery.noActive")}</h3>
              <p className="text-muted-foreground">{t("lottery.noActive.desc")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="myTickets" className="space-y-6">
          {userTickets.length > 0 ? (
            <div className="space-y-4">
              {userTickets.map((ticket) => {
                const now = new Date()
                const endDate = new Date(ticket.endDate)
                const hasEnded = now > endDate

                return (
                  <Card key={ticket.id} className="glass-card border-primary/20 p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
                            <Ticket className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{ticket.lotteryTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {t("lottery.myTickets.purchaseDate")}:{" "}
                              {new Date(ticket.purchaseDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("lottery.myTickets.drawDate")}: {endDate.toLocaleDateString()}{" "}
                              {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={hasEnded ? "default" : "secondary"}
                          className={
                            hasEnded
                              ? "bg-gray-500/20 text-gray-500 border-gray-500/30"
                              : "bg-primary/20 text-primary border-primary/30"
                          }
                        >
                          {hasEnded ? t("lottery.myTickets.status.finished") : t("lottery.myTickets.status.active")}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {t("lottery.myTickets.ticketNumbers")}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.ticketNumbers.map((number, index) => (
                            <Badge key={index} variant="outline" className="font-mono text-base px-3 py-1">
                              {number}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {hasEnded && ticket.status === "won" && (
                        <div className="pt-4 border-t border-primary/20">
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-green-500" />
                                <div>
                                  <p className="font-bold text-green-500 text-lg">{t("lottery.myTickets.youWon")}</p>
                                  <p className="text-sm text-muted-foreground">{t("lottery.prize")}</p>
                                </div>
                              </div>
                              <span className="text-2xl font-bold text-green-500">{ticket.prizeAmount} USDT</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {hasEnded && ticket.status === "lost" && (
                        <div className="pt-4 border-t border-primary/20">
                          <div className="bg-muted/10 border border-muted/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Clock className="w-6 h-6 text-muted-foreground" />
                              <div>
                                <p className="font-bold text-muted-foreground">{t("lottery.myTickets.raffleEnded")}</p>
                                <p className="text-sm text-muted-foreground">{t("lottery.myTickets.tryAgain")}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {hasEnded && (
                        <div className="pt-4 border-t border-primary/20">
                          <Link href="/dashboard/results">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                              <Trophy className="w-4 h-4 mr-2" />
                              {t("lottery.myTickets.viewResults")}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="glass-card border-primary/20 p-12 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{t("lottery.myTickets.noTickets")}</h3>
              <p className="text-muted-foreground">{t("lottery.myTickets.noTickets.desc")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingLotteries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLotteries.map((lottery) => (
                <LotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          ) : (
            <Card className="glass-card border-primary/20 p-12 text-center">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{t("lottery.noUpcoming")}</h3>
              <p className="text-muted-foreground">{t("lottery.noUpcoming.desc")}</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedLotteries.length > 0 ? (
            <div className="space-y-4">
              {completedLotteries.map((lottery) => (
                <Card key={lottery.id} className="glass-card border-primary/20 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">{lottery.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t("lottery.prize")}: {lottery.prizeAmount} USDT • {lottery.soldTickets}{" "}
                            {t("lottery.ticketsSold")}
                          </p>
                        </div>
                      </div>
                      {lottery.winnerId && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t("lottery.winner")}</p>
                          <p className="font-semibold text-primary">{lottery.winnerName}</p>
                        </div>
                      )}
                    </div>

                    {lottery.winningTicket && (
                      <div className="pt-4 border-t border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t("lottery.winningTicket")}:</span>
                          <Badge
                            variant="outline"
                            className="font-mono text-lg px-4 py-2 bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                          >
                            {lottery.winningTicket}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-primary/20 p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{t("lottery.noCompleted")}</h3>
              <p className="text-muted-foreground">{t("lottery.noCompleted.desc")}</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
