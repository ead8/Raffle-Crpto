"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getAnalyticsData,
  getRevenueTimeSeries,
  getUserGrowthTimeSeries,
  type AnalyticsData,
  type TimeSeriesData,
} from "@/lib/analytics"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Ticket,
  Trophy,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Wallet,
  BarChart3,
  LineChart,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function AdminAnalyticsPage() {
  const { t } = useI18n()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [revenueData, setRevenueData] = useState<TimeSeriesData | null>(null)
  const [userGrowthData, setUserGrowthData] = useState<TimeSeriesData | null>(null)
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30")

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = () => {
    setAnalytics(getAnalyticsData())
    setRevenueData(getRevenueTimeSeries(Number.parseInt(timeRange)))
    setUserGrowthData(getUserGrowthTimeSeries(Number.parseInt(timeRange)))
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      change: analytics.revenueToday > 0 ? `+$${analytics.revenueToday.toFixed(2)} today` : "No change today",
      icon: DollarSign,
      color: "text-chart-2",
      bgColor: "bg-chart-2/20",
    },
    {
      title: "Total Users",
      value: analytics.totalUsers.toString(),
      change: `+${analytics.newUsersToday} today`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Active Lotteries",
      value: analytics.activeLotteries.toString(),
      change: `${analytics.completedLotteries} completed`,
      icon: Ticket,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "Net Profit",
      value: `$${analytics.netProfit.toFixed(2)}`,
      change: analytics.netProfit > 0 ? "Positive" : "Negative",
      icon: TrendingUp,
      color: analytics.netProfit > 0 ? "text-chart-2" : "text-chart-1",
      bgColor: analytics.netProfit > 0 ? "bg-chart-2/20" : "bg-chart-1/20",
    },
  ]

  const chartData = revenueData
    ? revenueData.dataPoints.map((point) => ({
        date: point.label || point.date,
        revenue: point.value,
      }))
    : []

  const userGrowthChartData = userGrowthData
    ? userGrowthData.dataPoints.map((point) => ({
        date: point.label || point.date,
        users: point.value,
      }))
    : []

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "7" | "30" | "90")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="glass-card border-primary/20 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card border-primary/20 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="lotteries">Lotteries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Chart */}
          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground">Daily revenue over the selected period</p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-primary/20" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(38, 161, 123, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#26A17B" strokeWidth={2} dot={{ r: 4 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>

          {/* User Growth Chart */}
          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">User Growth</h2>
              <p className="text-sm text-muted-foreground">Cumulative user count over time</p>
            </div>
            {userGrowthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={userGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-primary/20" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(38, 161, 123, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#26A17B" strokeWidth={2} dot={{ r: 4 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Deposits & Withdrawals</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowDownCircle className="w-5 h-5 text-chart-2" />
                    <span className="text-sm">Total Deposits</span>
                  </div>
                  <span className="font-bold">${analytics.totalDeposits.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="w-5 h-5 text-chart-1" />
                    <span className="text-sm">Total Withdrawals</span>
                  </div>
                  <span className="font-bold">${analytics.totalWithdrawals.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="text-sm">Pending Withdrawals</span>
                  </div>
                  <span className="font-bold">${analytics.pendingWithdrawalsAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <span className="text-sm">Average Deposit</span>
                  </div>
                  <span className="font-bold">${analytics.averageDeposit.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Ticket Sales & Prizes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-primary" />
                    <span className="text-sm">Total Ticket Sales</span>
                  </div>
                  <span className="font-bold">${analytics.totalTicketSales.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-chart-4" />
                    <span className="text-sm">Total Prizes Paid</span>
                  </div>
                  <span className="font-bold">${analytics.totalPrizesPaid.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <span className="text-sm">Average Purchase</span>
                  </div>
                  <span className="font-bold">${analytics.averageTicketPurchase.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-chart-2" />
                    <span className="text-sm">Net Profit</span>
                  </div>
                  <span className={`font-bold ${analytics.netProfit > 0 ? "text-chart-2" : "text-chart-1"}`}>
                    ${analytics.netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">User Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="font-bold">{analytics.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-bold">{analytics.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Today</span>
                  <span className="font-bold text-chart-2">+{analytics.newUsersToday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New This Week</span>
                  <span className="font-bold text-chart-2">+{analytics.newUsersThisWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New This Month</span>
                  <span className="font-bold text-chart-2">+{analytics.newUsersThisMonth}</span>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Transaction Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Transactions</span>
                  <span className="font-bold">{analytics.totalTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Deposits</span>
                  <span className="font-bold">{analytics.depositsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Withdrawals</span>
                  <span className="font-bold">{analytics.withdrawalsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ticket Purchases</span>
                  <span className="font-bold">{analytics.ticketPurchasesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prizes Won</span>
                  <span className="font-bold text-chart-2">{analytics.prizesWonCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lotteries" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Lottery Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Lotteries</span>
                  <span className="font-bold">{analytics.totalLotteries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active</span>
                  <span className="font-bold text-chart-2">{analytics.activeLotteries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-bold">{analytics.completedLotteries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tickets Sold</span>
                  <span className="font-bold">{analytics.totalTicketsSold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Tickets/Lottery</span>
                  <span className="font-bold">{analytics.averageTicketsPerLottery.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Prize Amount</span>
                  <span className="font-bold">${analytics.averagePrizeAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-bold">{analytics.lotteryCompletionRate.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-primary/20 p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Referral Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Referrals</span>
                  <span className="font-bold">{analytics.totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-bold text-chart-2">{analytics.completedReferrals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-bold">{analytics.referralConversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Rewards Paid</span>
                  <span className="font-bold">${analytics.totalReferralRewards.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

