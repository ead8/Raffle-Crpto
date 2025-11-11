import { getAllUsers, type User } from "./auth"
import { getTransactions, type Transaction } from "./wallet"
import { getLotteries, type Lottery } from "./lottery"
import { getAllReferrals } from "./referrals"
import { getResults, type LotteryResult } from "./automation"

export interface AnalyticsData {
  // User Analytics
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number

  // Financial Analytics
  totalRevenue: number
  totalDeposits: number
  totalWithdrawals: number
  totalTicketSales: number
  totalPrizesPaid: number
  netProfit: number
  averageDeposit: number
  averageWithdrawal: number
  averageTicketPurchase: number

  // Lottery Analytics
  totalLotteries: number
  activeLotteries: number
  completedLotteries: number
  totalTicketsSold: number
  averageTicketsPerLottery: number
  averagePrizeAmount: number
  lotteryCompletionRate: number

  // Transaction Analytics
  totalTransactions: number
  depositsCount: number
  withdrawalsCount: number
  ticketPurchasesCount: number
  prizesWonCount: number
  pendingWithdrawals: number
  pendingWithdrawalsAmount: number

  // Referral Analytics
  totalReferrals: number
  completedReferrals: number
  referralConversionRate: number
  totalReferralRewards: number

  // Time-based Analytics
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  transactionsToday: number
  transactionsThisWeek: number
  transactionsThisMonth: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  labels: string[]
  values: number[]
  dataPoints: ChartDataPoint[]
}

// Get analytics data
export function getAnalyticsData(): AnalyticsData {
  if (typeof window === "undefined") {
    return getEmptyAnalytics()
  }

  const users = getAllUsers()
  const transactions = getAllTransactions()
  const lotteries = getLotteries()
  const referrals = getAllReferrals()
  const results = getResults()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // User Analytics
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status !== "suspended").length
  const newUsersToday = users.filter((u) => new Date(u.createdAt) >= today).length
  const newUsersThisWeek = users.filter((u) => new Date(u.createdAt) >= weekAgo).length
  const newUsersThisMonth = users.filter((u) => new Date(u.createdAt) >= monthAgo).length

  // Financial Analytics
  let totalDeposits = 0
  let totalWithdrawals = 0
  let totalTicketSales = 0
  let totalPrizesPaid = 0
  let depositsCount = 0
  let withdrawalsCount = 0
  let ticketPurchasesCount = 0
  let prizesWonCount = 0
  let pendingWithdrawals = 0
  let pendingWithdrawalsAmount = 0

  transactions.forEach((tx) => {
    if (tx.status === "completed") {
      switch (tx.type) {
        case "deposit":
          totalDeposits += tx.amount
          depositsCount++
          break
        case "withdrawal":
          totalWithdrawals += tx.amount
          withdrawalsCount++
          break
        case "ticket_purchase":
          totalTicketSales += tx.amount
          ticketPurchasesCount++
          break
        case "prize_won":
          totalPrizesPaid += tx.amount
          prizesWonCount++
          break
      }
    } else if (tx.type === "withdrawal" && tx.status === "pending") {
      pendingWithdrawals++
      pendingWithdrawalsAmount += tx.amount
    }
  })

  const totalRevenue = totalDeposits + totalTicketSales
  const netProfit = totalRevenue - totalWithdrawals - totalPrizesPaid
  const averageDeposit = depositsCount > 0 ? totalDeposits / depositsCount : 0
  const averageWithdrawal = withdrawalsCount > 0 ? totalWithdrawals / withdrawalsCount : 0
  const averageTicketPurchase = ticketPurchasesCount > 0 ? totalTicketSales / ticketPurchasesCount : 0

  // Lottery Analytics
  const totalLotteries = lotteries.length
  const activeLotteries = lotteries.filter((l) => l.status === "active").length
  const completedLotteries = lotteries.filter((l) => l.status === "completed").length
  const totalTicketsSold = lotteries.reduce((sum, l) => sum + l.soldTickets, 0)
  const averageTicketsPerLottery = totalLotteries > 0 ? totalTicketsSold / totalLotteries : 0
  const averagePrizeAmount =
    lotteries.length > 0 ? lotteries.reduce((sum, l) => sum + l.prizeAmount, 0) / lotteries.length : 0
  const lotteryCompletionRate = totalLotteries > 0 ? (completedLotteries / totalLotteries) * 100 : 0

  // Referral Analytics
  const totalReferrals = referrals.length
  const completedReferrals = referrals.filter((r) => r.status === "completed").length
  const referralConversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0
  const totalReferralRewards = referrals
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.reward + r.commissionEarned, 0)

  // Time-based Analytics
  const revenueToday = transactions
    .filter((tx) => new Date(tx.timestamp) >= today && (tx.type === "deposit" || tx.type === "ticket_purchase"))
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const revenueThisWeek = transactions
    .filter((tx) => new Date(tx.timestamp) >= weekAgo && (tx.type === "deposit" || tx.type === "ticket_purchase"))
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const revenueThisMonth = transactions
    .filter((tx) => new Date(tx.timestamp) >= monthAgo && (tx.type === "deposit" || tx.type === "ticket_purchase"))
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const transactionsToday = transactions.filter((tx) => new Date(tx.timestamp) >= today).length
  const transactionsThisWeek = transactions.filter((tx) => new Date(tx.timestamp) >= weekAgo).length
  const transactionsThisMonth = transactions.filter((tx) => new Date(tx.timestamp) >= monthAgo).length

  return {
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    totalRevenue,
    totalDeposits,
    totalWithdrawals,
    totalTicketSales,
    totalPrizesPaid,
    netProfit,
    averageDeposit,
    averageWithdrawal,
    averageTicketPurchase,
    totalLotteries,
    activeLotteries,
    completedLotteries,
    totalTicketsSold,
    averageTicketsPerLottery,
    averagePrizeAmount,
    lotteryCompletionRate,
    totalTransactions: transactions.length,
    depositsCount,
    withdrawalsCount,
    ticketPurchasesCount,
    prizesWonCount,
    pendingWithdrawals,
    pendingWithdrawalsAmount,
    totalReferrals,
    completedReferrals,
    referralConversionRate,
    totalReferralRewards,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    transactionsToday,
    transactionsThisWeek,
    transactionsThisMonth,
  }
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalRevenue: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTicketSales: 0,
    totalPrizesPaid: 0,
    netProfit: 0,
    averageDeposit: 0,
    averageWithdrawal: 0,
    averageTicketPurchase: 0,
    totalLotteries: 0,
    activeLotteries: 0,
    completedLotteries: 0,
    totalTicketsSold: 0,
    averageTicketsPerLottery: 0,
    averagePrizeAmount: 0,
    lotteryCompletionRate: 0,
    totalTransactions: 0,
    depositsCount: 0,
    withdrawalsCount: 0,
    ticketPurchasesCount: 0,
    prizesWonCount: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalsAmount: 0,
    totalReferrals: 0,
    completedReferrals: 0,
    referralConversionRate: 0,
    totalReferralRewards: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    transactionsToday: 0,
    transactionsThisWeek: 0,
    transactionsThisMonth: 0,
  }
}

// Get all transactions for analytics
function getAllTransactions(): Transaction[] {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const allTransactions: Transaction[] = []

  users.forEach((user) => {
    const userTransactions = getTransactions(user.id)
    allTransactions.push(...userTransactions)
  })

  return allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get revenue time series data
export function getRevenueTimeSeries(days: number = 30): TimeSeriesData {
  if (typeof window === "undefined") {
    return { labels: [], values: [], dataPoints: [] }
  }

  const transactions = getAllTransactions()
  const dataPoints: ChartDataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const dayRevenue = transactions
      .filter(
        (tx) =>
          new Date(tx.timestamp) >= dayStart &&
          new Date(tx.timestamp) < dayEnd &&
          (tx.type === "deposit" || tx.type === "ticket_purchase") &&
          tx.status === "completed",
      )
      .reduce((sum, tx) => sum + tx.amount, 0)

    dataPoints.push({
      date: dateStr,
      value: dayRevenue,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })
  }

  return {
    labels: dataPoints.map((d) => d.label || d.date),
    values: dataPoints.map((d) => d.value),
    dataPoints,
  }
}

// Get user growth time series
export function getUserGrowthTimeSeries(days: number = 30): TimeSeriesData {
  if (typeof window === "undefined") {
    return { labels: [], values: [], dataPoints: [] }
  }

  const users = getAllUsers()
  const dataPoints: ChartDataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    const usersByDate = users.filter((u) => new Date(u.createdAt) <= dayEnd).length

    dataPoints.push({
      date: dateStr,
      value: usersByDate,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })
  }

  return {
    labels: dataPoints.map((d) => d.label || d.date),
    values: dataPoints.map((d) => d.value),
    dataPoints,
  }
}

