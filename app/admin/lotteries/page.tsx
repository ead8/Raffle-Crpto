"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Lottery } from "@/lib/lottery"
import { fetchLotteries } from "@/lib/lotteries-api"
import { Trophy, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"

export default function AdminLotteriesPage() {
  const { t } = useI18n()
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadLotteries = async () => {
      try {
        setLoadError(null)
        const data = await fetchLotteries()
        setLotteries(data)
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load lotteries")
      }
    }

    loadLotteries()
    const interval = setInterval(loadLotteries, 5000)

    return () => clearInterval(interval)
  }, [])

  const activeLotteries = lotteries.filter((l) => l.status === "active")
  const upcomingLotteries = lotteries.filter((l) => l.status === "upcoming")
  const completedLotteries = lotteries.filter((l) => l.status === "completed")

  const LotteryRow = ({ lottery }: { lottery: Lottery }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/60 hover:border-primary/25 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{lottery.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-sm text-muted-foreground">
              {t("admin.lotteries.prize")}: {lottery.prizeAmount} USDT
            </span>
            <span className="text-sm text-muted-foreground">
              {t("admin.lotteries.price")}: {lottery.ticketPrice} USDT
            </span>
            <span className="text-sm text-muted-foreground">
              {t("admin.lotteries.tickets")}: {lottery.soldTickets}/{lottery.maxTickets}
            </span>
          </div>
        </div>
      </div>
      {lottery.status !== "completed" && (
        <div className="flex items-center gap-2">
          <Link href={`/admin/lotteries/${lottery.id}`}>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="hover:bg-destructive/10 text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">{t("admin.lotteries.title")}</h1>
          <p className="text-muted-foreground">{t("admin.lotteries.subtitle")}</p>
          {loadError && <p className="text-sm text-destructive mt-2">{loadError}</p>}
        </div>
        <Link href="/admin/lotteries/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.lotteries.createRaffle")}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card border-border/60 p-1 h-auto flex-wrap">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            {t("admin.dashboard.active")} ({activeLotteries.length})
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            {t("admin.lotteries.upcoming")} ({upcomingLotteries.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            {t("admin.lotteries.completed")} ({completedLotteries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="glass-card border-border/60 p-6">
            <div className="space-y-3">
              {activeLotteries.length > 0 ? (
                activeLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">{t("admin.lotteries.noActive")}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="glass-card border-border/60 p-6">
            <div className="space-y-3">
              {upcomingLotteries.length > 0 ? (
                upcomingLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">{t("admin.lotteries.noUpcoming")}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="glass-card border-border/60 p-6">
            <div className="space-y-3">
              {completedLotteries.length > 0 ? (
                completedLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">{t("admin.lotteries.noCompleted")}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
