"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Ticket, TrendingUp, Sparkles } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import type { Lottery } from "@/lib/lottery"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"

interface LotteryCardProps {
  lottery: Lottery
}

export function LotteryCard({ lottery }: LotteryCardProps) {
  const { t } = useI18n()
  const progress = (lottery.soldTickets / lottery.maxTickets) * 100
  const isAlmostFull = progress >= 80
  const isNoLoss = lottery.type === "no-loss"

  return (
    <Card className="glass-card border-border/70 p-6 hover:border-primary/30 transition-colors duration-300 group relative overflow-hidden">
      {/* No-loss shimmer bar */}
      {isNoLoss && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chart-2 to-transparent animate-shimmer" />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-xl font-semibold tracking-tight">{lottery.title}</h3>
              {isNoLoss && (
                <Badge className="text-[10px] bg-chart-2/20 text-chart-2 border-chart-2/30 px-1.5 py-0" variant="outline">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  No-Loss
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} />
              <span className="text-2xl font-semibold text-primary tabular-nums">{lottery.prizeAmount} USDT</span>
            </div>
          </div>
          {lottery.status === "active" && (
            <div className="px-3 py-1 rounded-full bg-chart-2/20 border border-chart-2/30 shrink-0">
              <span className="text-xs font-semibold text-chart-2">{t("lotteryCard.live")}</span>
            </div>
          )}
          {lottery.status === "upcoming" && (
            <div className="px-3 py-1 rounded-full bg-chart-4/20 border border-chart-4/30 shrink-0">
              <span className="text-xs font-semibold text-chart-4">{t("lotteryCard.soon")}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("lotteryCard.ticketPrice")}</span>
            </div>
            <p className="text-lg font-bold">{lottery.ticketPrice} USDT</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("lotteryCard.participants")}</span>
            </div>
            <p className="text-lg font-bold">{lottery.participants.length}</p>
          </div>
        </div>

        {/* Live Prize Pool Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("lotteryCard.ticketsSold")}</span>
            <span className="font-semibold tabular-nums">
              {lottery.soldTickets} / {lottery.maxTickets}
            </span>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-700" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Prize pool: <span className="text-primary font-semibold">{(lottery.soldTickets * lottery.ticketPrice).toFixed(0)} USDT</span>
            </span>
            {isAlmostFull && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {t("lotteryCard.lastTickets")}
              </p>
            )}
          </div>
        </div>

        {/* Timer */}
        {lottery.status === "active" && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-2">{t("lotteryCard.timeRemaining")}</p>
            <CountdownTimer endTime={lottery.endTime} compact />
          </div>
        )}

        {lottery.status === "upcoming" && (
          <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
            <p className="text-xs text-muted-foreground mb-2">{t("lotteryCard.startsIn")}</p>
            <CountdownTimer endTime={lottery.startTime} compact />
          </div>
        )}

        {/* Action Button */}
        <Link href={`/dashboard/lottery/${lottery.id}`}>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-transform duration-200 group-hover:translate-y-[-1px]"
            disabled={lottery.status !== "active"}
          >
            {lottery.status === "active" ? t("lotteryCard.buyTickets") : t("lotteryCard.viewDetails")}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

