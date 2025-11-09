"use client"

import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, Ticket, Trophy, ArrowUpRight, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { getTransactions } from "@/lib/wallet"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      const transactions = getTransactions(user.id)
      setRecentTransactions(transactions.slice(0, 5))
    }
  }, [user])

  if (!user) return null

  const stats = [
    {
      label: t("dashboard.totalBalance"),
      value: `${user.balance.toFixed(2)} USDT`,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/20",
      href: "/dashboard/wallet",
    },
    {
      label: t("dashboard.activeTickets"),
      value: "12",
      icon: Ticket,
      color: "text-accent",
      bgColor: "bg-accent/20",
      href: "/dashboard/lottery",
    },
    {
      label: t("dashboard.prizesWon"),
      value: "3",
      icon: Trophy,
      color: "text-chart-4",
      bgColor: "bg-chart-4/20",
      href: "/dashboard/results",
    },
    {
      label: t("dashboard.totalWon"),
      value: "450 USDT",
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/20",
      href: "/dashboard/history",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("dashboard.welcome")}, {user.name}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("dashboard.summary")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="glass-card border-primary/20 p-4 sm:p-6 hover:border-primary/40 transition-all cursor-pointer hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{t("dashboard.quickActions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/dashboard/lottery">
            <Button className="w-full h-auto py-6 flex-col gap-2 bg-primary hover:bg-primary/90 glow-effect">
              <Ticket className="w-6 h-6" />
              <span className="font-semibold">{t("dashboard.buyTickets")}</span>
              <span className="text-xs opacity-80">{t("dashboard.buyTickets.desc")}</span>
            </Button>
          </Link>

          <Link href="/dashboard/wallet">
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex-col gap-2 border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <Wallet className="w-6 h-6" />
              <span className="font-semibold">{t("dashboard.depositUSDT")}</span>
              <span className="text-xs opacity-80">{t("dashboard.depositUSDT.desc")}</span>
            </Button>
          </Link>

          <Link href="/dashboard/history">
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex-col gap-2 border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <Clock className="w-6 h-6" />
              <span className="font-semibold">{t("dashboard.viewHistory")}</span>
              <span className="text-xs opacity-80">{t("dashboard.viewHistory.desc")}</span>
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Lotteries */}
        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">{t("dashboard.activeLotteries")}</h2>
            <Link href="/dashboard/lottery">
              <Button variant="ghost" size="sm" className="text-primary">
                {t("dashboard.viewAll")}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              { id: 1, prize: "500 USDT", time: "23:45", participants: 45 },
              { id: 2, prize: "1000 USDT", time: "47:12", participants: 89 },
              { id: 3, prize: "250 USDT", time: "15:30", participants: 32 },
            ].map((lottery) => (
              <Link key={lottery.id} href="/dashboard/lottery" className="block">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center glow-effect">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-primary">{lottery.prize}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {lottery.participants} {t("dashboard.participants")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-mono text-accent">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {lottery.time}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{t("dashboard.timeRemaining")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">{t("dashboard.recentActivity")}</h2>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="text-primary">
                {t("dashboard.viewAll")}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === "prize_won" || tx.type === "deposit"
                          ? "bg-chart-2/20 text-chart-2"
                          : "bg-chart-1/20 text-chart-1"
                      }`}
                    >
                      {tx.type === "prize_won" ? (
                        <Trophy className="w-5 h-5" />
                      ) : tx.type === "deposit" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <Ticket className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium">{tx.description}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      tx.type === "prize_won" || tx.type === "deposit" ? "text-chart-2" : "text-chart-1"
                    }`}
                  >
                    {tx.type === "prize_won" || tx.type === "deposit" ? "+" : "-"}
                    {tx.amount} USDT
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">{t("dashboard.noActivity")}</p>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{t("dashboard.startBuying")}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
