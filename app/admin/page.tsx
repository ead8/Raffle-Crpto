"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAdminStats, type AdminStats } from "@/lib/admin"
import { getLotteries } from "@/lib/lottery"
import { Users, Trophy, TrendingUp, Ticket, DollarSign, Zap, Activity, Gift, Settings } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function AdminPage() {
  const { t } = useI18n()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLotteries: 0,
    activeLotteries: 0,
    totalRevenue: 0,
    totalPrizesPaid: 0,
    totalTicketsSold: 0,
  })
  const [recentLotteries, setRecentLotteries] = useState<any[]>([])

  useEffect(() => {
    const loadData = () => {
      setStats(getAdminStats())
      const lotteries = getLotteries()
      setRecentLotteries(lotteries.slice(0, 5))
    }

    loadData()
    const interval = setInterval(loadData, 5000)

    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      label: t("admin.dashboard.totalUsers"),
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20",
      change: "+12%",
      href: "/admin/users",
    },
    {
      label: t("admin.dashboard.activeRaffles"),
      value: stats.activeLotteries,
      icon: Activity,
      color: "text-chart-2",
      bgColor: "bg-chart-2/20",
      change: `${stats.activeLotteries} ${t("admin.dashboard.live")}`,
      href: "/admin/lotteries",
    },
    {
      label: t("admin.dashboard.totalRevenue"),
      value: `${stats.totalRevenue.toFixed(0)} USDT`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/20",
      change: "+8.2%",
      href: "/admin/finances",
    },
    {
      label: t("admin.dashboard.ticketsSold"),
      value: stats.totalTicketsSold,
      icon: Ticket,
      color: "text-chart-4",
      bgColor: "bg-chart-4/20",
      change: t("admin.dashboard.total"),
      href: "/admin/lotteries",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("admin.dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
        </div>
        <Link href="/admin/lotteries/create">
          <Button className="bg-primary hover:bg-primary/90 glow-effect">
            <Zap className="w-4 h-4 mr-2" />
            {t("admin.dashboard.createRaffle")}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="block">
              <Card className="glass-card border-primary/20 p-6 hover:border-primary/40 transition-all cursor-pointer group relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-chart-2/20 text-chart-2">{stat.change}</span>
                    <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/tasks">
          <Card className="glass-card border-primary/20 p-6 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-chart-4/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-7 h-7 text-chart-4" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t("admin.tasks.manageTasks")}</h3>
                <p className="text-sm text-muted-foreground">{t("admin.tasks.manageTasks.desc")}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/referrals">
          <Card className="glass-card border-primary/20 p-6 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t("admin.referrals.manageReferrals")}</h3>
                <p className="text-sm text-muted-foreground">{t("admin.referrals.manageReferrals.desc")}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="glass-card border-primary/20 p-6 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t("admin.dashboard.configuration")}</h3>
                <p className="text-sm text-muted-foreground">{t("admin.dashboard.configuration.desc")}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Lotteries */}
      <Card className="glass-card border-primary/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("admin.dashboard.recentRaffles")}</h2>
          <Link href="/admin/lotteries">
            <Button variant="ghost" size="sm" className="text-primary">
              {t("admin.dashboard.viewAll")}
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentLotteries.map((lottery) => (
            <div
              key={lottery.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{lottery.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {lottery.soldTickets} / {lottery.maxTickets} {t("admin.dashboard.ticketsSoldOf")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{lottery.prizeAmount} USDT</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    lottery.status === "active"
                      ? "bg-chart-2/20 text-chart-2"
                      : lottery.status === "upcoming"
                        ? "bg-chart-4/20 text-chart-4"
                        : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {lottery.status === "active"
                    ? t("admin.dashboard.active")
                    : lottery.status === "upcoming"
                      ? t("admin.dashboard.upcoming")
                      : t("admin.dashboard.completed")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
