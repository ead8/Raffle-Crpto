export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "ticket_purchase" | "prize_won"
  amount: number
  description: string
  timestamp: string
  status: "completed" | "pending" | "failed"
  lotteryTitle?: string
  ticketNumber?: string
  lotteryId?: string
  network?: "trx" | "sol" | "bsc" // Network for deposits/withdrawals
  destinationAddress?: string // Destination address for withdrawals
  approvedBy?: string // Admin ID who approved the withdrawal
  approvedAt?: string // Timestamp of approval
  rejectionReason?: string // Reason if withdrawal was rejected
}

const TRANSACTIONS_KEY = "usdt_lottery_transactions"

const generateTransactionId = (): string => {
  const chars = "0123456789abcdef"
  let id = ""
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export const initializeDemoTransactions = (userId: string) => {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  const allTransactions: Record<string, Transaction[]> = stored ? JSON.parse(stored) : {}

  const userTransactions = allTransactions[userId] || []

  const hasDemoData = userTransactions.some((tx) => tx.id.length === 8 && /^[0-9a-f]{8}$/.test(tx.id))

  // Only add demo data if it doesn't exist yet
  if (!hasDemoData) {
    const now = new Date()

    const demoTransactions: Transaction[] = [
      {
        id: generateTransactionId(),
        type: "deposit",
        amount: 100,
        description: "Depósito USDT - BSC",
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
      {
        id: generateTransactionId(),
        type: "ticket_purchase",
        amount: 15,
        description: "Compra de tickets - Sorteo Rápido",
        timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        lotteryTitle: "Sorteo Rápido",
      },
      {
        id: generateTransactionId(),
        type: "prize_won",
        amount: 500,
        description: "Premio ganado - Sorteo Semanal #45",
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        lotteryTitle: "Sorteo Semanal #45",
        ticketNumber: "112233",
      },
      {
        id: generateTransactionId(),
        type: "deposit",
        amount: 250,
        description: "Depósito USDT - TRC-20",
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
      {
        id: generateTransactionId(),
        type: "ticket_purchase",
        amount: 20,
        description: "Compra de tickets - Mega Sorteo",
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        lotteryTitle: "Mega Sorteo",
      },
      {
        id: generateTransactionId(),
        type: "withdrawal",
        amount: 51,
        description: "Retiro USDT - BSC",
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
      {
        id: generateTransactionId(),
        type: "prize_won",
        amount: 1000,
        description: "Premio ganado - Mega Sorteo #12",
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        lotteryTitle: "Mega Sorteo #12",
        ticketNumber: "445566",
      },
      {
        id: generateTransactionId(),
        type: "deposit",
        amount: 150,
        description: "Depósito USDT - BSC",
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
    ]

    // Add demo transactions to the beginning of the array
    allTransactions[userId] = [...demoTransactions, ...userTransactions]
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions))
  }
}

export const getTransactions = (userId: string): Transaction[] => {
  if (typeof window === "undefined") return []

  initializeDemoTransactions(userId)

  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  if (!stored) return []

  const allTransactions: Record<string, Transaction[]> = JSON.parse(stored)
  return allTransactions[userId] || []
}

export const addTransaction = (userId: string, transaction: Omit<Transaction, "id" | "timestamp">) => {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  const allTransactions: Record<string, Transaction[]> = stored ? JSON.parse(stored) : {}

  if (!allTransactions[userId]) {
    allTransactions[userId] = []
  }

  const newTransaction: Transaction = {
    ...transaction,
    id: generateTransactionId(),
    timestamp: new Date().toISOString(),
  }

  allTransactions[userId].unshift(newTransaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions))

  if (transaction.type === "deposit" && transaction.status === "completed") {
    // Get user's transaction history (excluding the one we just added)
    const userTransactions = allTransactions[userId].slice(1) // Skip the current transaction
    const previousDeposits = userTransactions.filter((t) => t.type === "deposit" && t.status === "completed")

    // If this is the first deposit and it's >= 100 USDT, complete the registration bonus task
    if (previousDeposits.length === 0 && transaction.amount >= 100) {
      const { completeTaskForUser, getActiveTask } = require("./tasks")
      const activeTask = getActiveTask()

      if (activeTask && activeTask.id === "task-registration-bonus") {
        completeTaskForUser(userId, activeTask.id, new Date())
      }
    }
  }

  const event = new CustomEvent("storage-sync", {
    detail: { key: TRANSACTIONS_KEY, value: allTransactions },
  })
  window.dispatchEvent(event)

  // Send notification for completed deposits
  if (transaction.type === "deposit" && transaction.status === "completed") {
    const { addNotification } = require("./notifications")
    addNotification(userId, {
      type: "deposit",
      title: "Depósito confirmado",
      message: `Tu depósito de ${transaction.amount} USDT ha sido confirmado y añadido a tu balance`,
      link: "/dashboard/wallet",
    })
  }
}

export const generateWalletAddress = (): string => {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// Helper to get wallet address for a specific network
export const getUserWalletAddress = (user: { walletAddress?: string; wallets?: { trx?: string; sol?: string; bsc?: string } }, network: "trx" | "sol" | "bsc"): string => {
  if (user.wallets) {
    switch (network) {
      case "trx":
        return user.wallets.trx || user.walletAddress || ""
      case "sol":
        return user.wallets.sol || user.walletAddress || ""
      case "bsc":
        return user.wallets.bsc || user.walletAddress || ""
      default:
        return user.walletAddress || ""
    }
  }
  return user.walletAddress || ""
}
