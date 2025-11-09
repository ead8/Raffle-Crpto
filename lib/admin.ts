import type { User } from "./auth"
import type { Lottery } from "./lottery"

const USERS_KEY = "usdt_lottery_users"
const TRANSACTIONS_KEY = "usdt_lottery_transactions"

export interface AdminStats {
  totalUsers: number
  totalLotteries: number
  activeLotteries: number
  totalRevenue: number
  totalPrizesPaid: number
  totalTicketsSold: number
}

export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalDeposits: number
  totalWithdrawals: number
  totalTicketSales: number
  totalPrizesPaid: number
  platformBalance: number
  userBalances: number
  bonusBalances: number
}

export interface FinancialTransaction {
  id: string
  userId: string
  userName: string
  type: "deposit" | "withdrawal" | "ticket_purchase" | "prize_won"
  amount: number
  timestamp: string
  status: "completed" | "pending" | "failed"
  description: string
}

export const getAllUsers = (): User[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) return []

  return JSON.parse(stored)
}

export const updateUser = (userId: string, updates: Partial<User>) => {
  if (typeof window === "undefined") return

  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const event = new CustomEvent("storage-sync", {
      detail: { key: USERS_KEY, value: users },
    })
    window.dispatchEvent(event)
  }
}

export const deleteUser = (userId: string) => {
  if (typeof window === "undefined") return

  const users = getAllUsers()
  const filtered = users.filter((u) => u.id !== userId)
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered))

  const event = new CustomEvent("storage-sync", {
    detail: { key: USERS_KEY, value: filtered },
  })
  window.dispatchEvent(event)
}

export const getAdminStats = (): AdminStats => {
  if (typeof window === "undefined") {
    return {
      totalUsers: 0,
      totalLotteries: 0,
      activeLotteries: 0,
      totalRevenue: 0,
      totalPrizesPaid: 0,
      totalTicketsSold: 0,
    }
  }

  const users = getAllUsers()
  const lotteriesData = localStorage.getItem("usdt_lottery_lotteries")
  const lotteries: Lottery[] = lotteriesData ? JSON.parse(lotteriesData) : []

  const totalTicketsSold = lotteries.reduce((sum, l) => sum + l.soldTickets, 0)
  const totalRevenue = lotteries.reduce((sum, l) => sum + l.soldTickets * l.ticketPrice, 0)
  const totalPrizesPaid = lotteries.filter((l) => l.status === "completed" && l.winnerId).length * 100 // Simplified

  return {
    totalUsers: users.length,
    totalLotteries: lotteries.length,
    activeLotteries: lotteries.filter((l) => l.status === "active").length,
    totalRevenue,
    totalPrizesPaid,
    totalTicketsSold,
  }
}

export const getFinancialStats = (): FinancialStats => {
  if (typeof window === "undefined") {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTicketSales: 0,
      totalPrizesPaid: 0,
      platformBalance: 0,
      userBalances: 0,
      bonusBalances: 0,
    }
  }

  const users = getAllUsers()
  const transactionsData = localStorage.getItem(TRANSACTIONS_KEY)
  const allTransactions: Record<string, any[]> = transactionsData ? JSON.parse(transactionsData) : {}

  let totalDeposits = 0
  let totalWithdrawals = 0
  let totalTicketSales = 0
  let totalPrizesPaid = 0
  let userBalances = 0
  let bonusBalances = 0

  // Calculate from all user transactions
  Object.values(allTransactions).forEach((userTxs) => {
    userTxs.forEach((tx) => {
      if (tx.status === "completed") {
        switch (tx.type) {
          case "deposit":
            totalDeposits += tx.amount
            break
          case "withdrawal":
            totalWithdrawals += tx.amount
            break
          case "ticket_purchase":
            totalTicketSales += tx.amount
            break
          case "prize_won":
            totalPrizesPaid += tx.amount
            break
        }
      }
    })
  })

  // Calculate user balances
  users.forEach((user) => {
    userBalances += user.balance || 0
    bonusBalances += user.bonusBalance || 0
  })

  const totalRevenue = totalDeposits + totalTicketSales
  const totalExpenses = totalWithdrawals + totalPrizesPaid
  const netProfit = totalRevenue - totalExpenses
  const platformBalance = totalDeposits - totalWithdrawals

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    totalDeposits,
    totalWithdrawals,
    totalTicketSales,
    totalPrizesPaid,
    platformBalance,
    userBalances,
    bonusBalances,
  }
}

export const getAllTransactions = (): FinancialTransaction[] => {
  if (typeof window === "undefined") return []

  const users = getAllUsers()
  const transactionsData = localStorage.getItem(TRANSACTIONS_KEY)
  const allTransactions: Record<string, any[]> = transactionsData ? JSON.parse(transactionsData) : {}

  const transactions: FinancialTransaction[] = []

  Object.entries(allTransactions).forEach(([userId, userTxs]) => {
    const user = users.find((u) => u.id === userId)
    const userName = user?.name || "Usuario Desconocido"

    userTxs.forEach((tx) => {
      transactions.push({
        id: tx.id,
        userId,
        userName,
        type: tx.type,
        amount: tx.amount,
        timestamp: tx.timestamp,
        status: tx.status,
        description: tx.description,
      })
    })
  })

  // Sort by timestamp descending
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const getTransactionsByDateRange = (startDate: Date, endDate: Date): FinancialTransaction[] => {
  const allTxs = getAllTransactions()
  return allTxs.filter((tx) => {
    const txDate = new Date(tx.timestamp)
    return txDate >= startDate && txDate <= endDate
  })
}

export const getTransactionsByType = (type: string): FinancialTransaction[] => {
  const allTxs = getAllTransactions()
  return allTxs.filter((tx) => tx.type === type)
}
