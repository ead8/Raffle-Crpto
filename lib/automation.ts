import { getLotteries, updateLottery, createLottery, type Lottery } from "./lottery"
import { addTransaction } from "./wallet"
import { updateUserBalance } from "./auth"
import { addNotification } from "./notifications"

const USERS_KEY = "usdt_lottery_users"
const USER_TICKETS_KEY = "usdt_lottery_user_tickets"

export interface LotteryResult {
  lotteryId: string
  lotteryTitle: string
  winnerId: string
  winnerName: string
  winnerEmail: string
  winningTicket: string
  prizeAmount: number
  timestamp: string
  totalParticipants: number
  totalTickets: number
}

const RESULTS_KEY = "usdt_lottery_results"

export const getResults = (): LotteryResult[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(RESULTS_KEY)
  if (!stored) return []

  return JSON.parse(stored)
}

export const saveResult = (result: LotteryResult) => {
  if (typeof window === "undefined") return

  const results = getResults()
  results.unshift(result)
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
}

export const selectWinner = (lottery: Lottery): LotteryResult | null => {
  if (lottery.participants.length === 0) {
    console.log("[v0] No participants in lottery", lottery.id)
    return null
  }

  // Create array of all ticket numbers with their owners
  const allTickets: Array<{ ticketNumber: string; userId: string; userName: string }> = []

  lottery.participants.forEach((participant) => {
    participant.ticketNumbers.forEach((ticketNumber) => {
      allTickets.push({
        ticketNumber,
        userId: participant.userId,
        userName: participant.userName,
      })
    })
  })

  // Select random winning ticket
  const randomIndex = Math.floor(Math.random() * allTickets.length)
  const winner = allTickets[randomIndex]

  console.log("[v0] Winner selected:", winner)

  const usersData = typeof window !== "undefined" ? localStorage.getItem("usdt_lottery_users") : null
  const users = usersData ? JSON.parse(usersData) : []
  const winnerUser = users.find((u: any) => u.id === winner.userId)
  const winnerEmail = winnerUser?.email || "unknown@example.com"

  const result: LotteryResult = {
    lotteryId: lottery.id,
    lotteryTitle: lottery.title,
    winnerId: winner.userId,
    winnerName: winner.userName,
    winnerEmail: winnerEmail,
    winningTicket: winner.ticketNumber,
    prizeAmount: lottery.prizeAmount,
    timestamp: new Date().toISOString(),
    totalParticipants: lottery.participants.length,
    totalTickets: lottery.soldTickets,
  }

  return result
}

export const distributePrize = (result: LotteryResult) => {
  if (typeof window === "undefined") return

  // Get winner's current balance
  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return

  const users = JSON.parse(usersData)
  const winner = users.find((u: any) => u.id === result.winnerId)

  if (!winner) {
    console.log("[v0] Winner not found:", result.winnerId)
    return
  }

  // Add prize to winner's balance
  const newBalance = winner.balance + result.prizeAmount
  updateUserBalance(result.winnerId, newBalance)

  // Add transaction
  addTransaction(result.winnerId, {
    type: "prize_won",
    amount: result.prizeAmount,
    description: `Premio ganado - ${result.lotteryTitle} (Ticket #${result.winningTicket})`,
    status: "completed",
  })

  // Send notification to winner
  addNotification(result.winnerId, {
    type: "prize",
    title: "🎉 ¡Felicidades! Has ganado",
    message: `Ganaste ${result.prizeAmount} USDT en ${result.lotteryTitle} con el ticket #${result.winningTicket}`,
    link: "/dashboard/results",
  })

  console.log("[v0] Prize distributed to", result.winnerName, "- Amount:", result.prizeAmount)
}

export const updateUserTicketsStatus = (lotteryId: string, winnerId: string) => {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(USER_TICKETS_KEY)
  if (!stored) return

  const allUserTickets = JSON.parse(stored)

  // Update all tickets for this lottery
  Object.keys(allUserTickets).forEach((userId) => {
    allUserTickets[userId] = allUserTickets[userId].map((ticket: any) => {
      if (ticket.lotteryId === lotteryId && ticket.status === "active") {
        return {
          ...ticket,
          status: userId === winnerId ? "won" : "lost",
          prizeAmount: userId === winnerId ? ticket.prizeAmount : undefined,
        }
      }
      return ticket
    })
  })

  localStorage.setItem(USER_TICKETS_KEY, JSON.stringify(allUserTickets))
}

export const processCompletedLotteries = () => {
  if (typeof window === "undefined") return

  const lotteries = getLotteries()
  const now = new Date()

  lotteries.forEach((lottery) => {
    const endTime = new Date(lottery.endTime)

    // Check if lottery has ended and hasn't been processed yet
    if (now > endTime && lottery.status === "active" && !lottery.winnerId) {
      console.log("[v0] Processing completed lottery:", lottery.id)

      // Select winner
      const result = selectWinner(lottery)

      if (result) {
        // Update lottery with winner info
        const updatedLottery: Lottery = {
          ...lottery,
          status: "completed",
          winnerId: result.winnerId,
          winnerName: result.winnerName,
          winningTicket: result.winningTicket,
        }
        updateLottery(updatedLottery)

        // Distribute prize
        distributePrize(result)

        // Update user tickets status
        updateUserTicketsStatus(lottery.id, result.winnerId)

        // Save result
        saveResult(result)

        // Notify all participants that lottery ended
        const allParticipants = lottery.participants.map((p) => p.userId)
        allParticipants.forEach((participantId) => {
          if (participantId !== result.winnerId) {
            addNotification(participantId, {
              type: "lottery_end",
              title: "Sorteo finalizado",
              message: `${lottery.title} ha finalizado. Revisa los resultados para ver el ganador.`,
              link: "/dashboard/results",
            })
          }
        })

        console.log("[v0] Lottery processed successfully:", lottery.id)

        if (lottery.autoRecreate) {
          console.log("[v0] Auto-recreating lottery:", lottery.title)

          // Calculate duration from original lottery
          const duration = new Date(lottery.endTime).getTime() - new Date(lottery.startTime).getTime()

          // Check if there's already an upcoming lottery with the same title
          const existingUpcoming = lotteries.find((l) => l.title === lottery.title && l.status === "upcoming")

          if (existingUpcoming) {
            // Activate the existing upcoming lottery
            const updatedUpcoming: Lottery = {
              ...existingUpcoming,
              status: "active",
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + duration).toISOString(),
            }
            updateLottery(updatedUpcoming)
            console.log("[v0] Activated upcoming lottery:", existingUpcoming.id)
          }

          // Create new upcoming lottery that will start when current one ends
          const newStartTime = new Date(Date.now() + duration)
          const newEndTime = new Date(newStartTime.getTime() + duration)

          createLottery({
            title: lottery.title,
            prizeAmount: lottery.prizeAmount,
            ticketPrice: lottery.ticketPrice,
            maxTickets: lottery.maxTickets,
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
            status: "upcoming",
            autoRecreate: true,
          })

          console.log("[v0] New upcoming lottery created:", lottery.title)
        }
      } else {
        // No participants, just mark as completed
        const updatedLottery: Lottery = {
          ...lottery,
          status: "completed",
        }
        updateLottery(updatedLottery)
        console.log("[v0] Lottery completed with no participants:", lottery.id)

        if (lottery.autoRecreate) {
          console.log("[v0] Auto-recreating lottery (no participants):", lottery.title)

          const duration = new Date(lottery.endTime).getTime() - new Date(lottery.startTime).getTime()

          const existingUpcoming = lotteries.find((l) => l.title === lottery.title && l.status === "upcoming")

          if (existingUpcoming) {
            const updatedUpcoming: Lottery = {
              ...existingUpcoming,
              status: "active",
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + duration).toISOString(),
            }
            updateLottery(updatedUpcoming)
            console.log("[v0] Activated upcoming lottery:", existingUpcoming.id)
          }

          const newStartTime = new Date(Date.now() + duration)
          const newEndTime = new Date(newStartTime.getTime() + duration)

          createLottery({
            title: lottery.title,
            prizeAmount: lottery.prizeAmount,
            ticketPrice: lottery.ticketPrice,
            maxTickets: lottery.maxTickets,
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
            status: "upcoming",
            autoRecreate: true,
          })

          console.log("[v0] New upcoming lottery created:", lottery.title)
        }
      }
    }
  })
}

// Auto-start function that runs periodically
export const startAutomation = () => {
  if (typeof window === "undefined") return

  console.log("[v0] Automation system started")

  // Process immediately
  processCompletedLotteries()

  // Then process every 10 seconds
  const interval = setInterval(() => {
    processCompletedLotteries()
  }, 10000)

  return () => clearInterval(interval)
}
