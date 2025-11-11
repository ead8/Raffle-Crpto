import { getAllUsers, type User } from "./auth"
import { getTransactions, type Transaction } from "./wallet"
import { getResults, type LotteryResult } from "./automation"
import { getAllReferrals } from "./referrals"

export interface LeaderboardEntry {
  userId: string
  userName: string
  userEmail: string
  value: number
  rank: number
  additionalData?: Record<string, any>
}

export interface TopWinner extends LeaderboardEntry {
  totalWon: number
  winsCount: number
  averageWin: number
  lastWinDate?: string
}

export interface TopSpender extends LeaderboardEntry {
  totalSpent: number
  ticketsPurchased: number
  lotteriesParticipated: number
}

export interface TopReferrer extends LeaderboardEntry {
  totalReferrals: number
  completedReferrals: number
  totalEarned: number
  conversionRate: number
}

export interface TopActiveUser extends LeaderboardEntry {
  totalTransactions: number
  totalActivity: number
  lastActivityDate: string
}

// Get top winners leaderboard
export function getTopWinners(limit: number = 10): TopWinner[] {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const results = getResults()
  const userWins: Map<string, { totalWon: number; wins: LotteryResult[] }> = new Map()

  // Calculate wins per user
  results.forEach((result) => {
    const existing = userWins.get(result.winnerId) || { totalWon: 0, wins: [] }
    existing.totalWon += result.prizeAmount
    existing.wins.push(result)
    userWins.set(result.winnerId, existing)
  })

  // Convert to leaderboard entries
  const leaderboard: TopWinner[] = Array.from(userWins.entries())
    .map(([userId, data]) => {
      const user = users.find((u) => u.id === userId)
      if (!user) return null

      const winsSorted = data.wins.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      return {
        userId,
        userName: user.name,
        userEmail: user.email,
        value: data.totalWon,
        rank: 0, // Will be set after sorting
        totalWon: data.totalWon,
        winsCount: data.wins.length,
        averageWin: data.wins.length > 0 ? data.totalWon / data.wins.length : 0,
        lastWinDate: winsSorted[0]?.timestamp,
      }
    })
    .filter((entry): entry is TopWinner => entry !== null)
    .sort((a, b) => b.totalWon - a.totalWon)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return leaderboard
}

// Get top spenders leaderboard
export function getTopSpenders(limit: number = 10): TopSpender[] {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const userSpending: Map<
    string,
    { totalSpent: number; ticketsPurchased: number; lotteriesParticipated: Set<string> }
  > = new Map()

  // Calculate spending per user
  users.forEach((user) => {
    const transactions = getTransactions(user.id)
    let totalSpent = 0
    let ticketsPurchased = 0
    const lotteriesParticipated = new Set<string>()

    transactions.forEach((tx) => {
      if (tx.type === "ticket_purchase" && tx.status === "completed") {
        totalSpent += tx.amount
        ticketsPurchased += 1
        if (tx.lotteryId) {
          lotteriesParticipated.add(tx.lotteryId)
        }
      }
    })

    if (totalSpent > 0) {
      userSpending.set(user.id, {
        totalSpent,
        ticketsPurchased,
        lotteriesParticipated,
      })
    }
  })

  // Convert to leaderboard entries
  const leaderboard: TopSpender[] = Array.from(userSpending.entries())
    .map(([userId, data]) => {
      const user = users.find((u) => u.id === userId)
      if (!user) return null

      return {
        userId,
        userName: user.name,
        userEmail: user.email,
        value: data.totalSpent,
        rank: 0,
        totalSpent: data.totalSpent,
        ticketsPurchased: data.ticketsPurchased,
        lotteriesParticipated: data.lotteriesParticipated.size,
      }
    })
    .filter((entry): entry is TopSpender => entry !== null)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return leaderboard
}

// Get top referrers leaderboard
export function getTopReferrers(limit: number = 10): TopReferrer[] {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const referrals = getAllReferrals()

  // Group referrals by referrer
  const referrerStats: Map<
    string,
    { totalReferrals: number; completedReferrals: number; totalEarned: number }
  > = new Map()

  referrals.forEach((referral) => {
    const existing = referrerStats.get(referral.referrerId) || {
      totalReferrals: 0,
      completedReferrals: 0,
      totalEarned: 0,
    }

    existing.totalReferrals++
    if (referral.status === "completed") {
      existing.completedReferrals++
      existing.totalEarned += referral.reward + referral.commissionEarned
    }

    referrerStats.set(referral.referrerId, existing)
  })

  // Convert to leaderboard entries
  const leaderboard: TopReferrer[] = Array.from(referrerStats.entries())
    .map(([userId, stats]) => {
      const user = users.find((u) => u.id === userId)
      if (!user) return null

      return {
        userId,
        userName: user.name,
        userEmail: user.email,
        value: stats.totalEarned,
        rank: 0,
        totalReferrals: stats.totalReferrals,
        completedReferrals: stats.completedReferrals,
        totalEarned: stats.totalEarned,
        conversionRate: stats.totalReferrals > 0 ? (stats.completedReferrals / stats.totalReferrals) * 100 : 0,
      }
    })
    .filter((entry): entry is TopReferrer => entry !== null)
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return leaderboard
}

// Get top active users leaderboard
export function getTopActiveUsers(limit: number = 10): TopActiveUser[] {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const userActivity: Map<string, { transactions: number; lastActivity: Date }> = new Map()

  // Calculate activity per user
  users.forEach((user) => {
    const transactions = getTransactions(user.id)
    const completedTransactions = transactions.filter((tx) => tx.status === "completed")

    if (completedTransactions.length > 0) {
      const lastActivity = completedTransactions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0]

      userActivity.set(user.id, {
        transactions: completedTransactions.length,
        lastActivity: new Date(lastActivity.timestamp),
      })
    }
  })

  // Convert to leaderboard entries
  const leaderboard: TopActiveUser[] = Array.from(userActivity.entries())
    .map(([userId, data]) => {
      const user = users.find((u) => u.id === userId)
      if (!user) return null

      return {
        userId,
        userName: user.name,
        userEmail: user.email,
        value: data.transactions,
        rank: 0,
        totalTransactions: data.transactions,
        totalActivity: data.transactions,
        lastActivityDate: data.lastActivity.toISOString(),
      }
    })
    .filter((entry): entry is TopActiveUser => entry !== null)
    .sort((a, b) => b.totalTransactions - a.totalTransactions)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return leaderboard
}

// Get user's rank in a leaderboard
export function getUserRank(userId: string, leaderboard: LeaderboardEntry[]): number {
  const entry = leaderboard.find((e) => e.userId === userId)
  return entry ? entry.rank : 0
}

