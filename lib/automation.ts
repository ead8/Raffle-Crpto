import { getLotteries, getLotteryById, updateLottery, createLottery, type Lottery } from "./lottery"
import { addTransaction } from "./wallet"
import { updateUserBalance } from "./auth"
import { addNotification } from "./notifications"

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

const RESULTS_KEY = "drixx_draw_results"

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
  if (lottery.participants.length === 0) return null

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

  const randomIndex = Math.floor(Math.random() * allTickets.length)
  const winner = allTickets[randomIndex]

  return {
    lotteryId: lottery.id,
    lotteryTitle: lottery.title,
    winnerId: winner.userId,
    winnerName: winner.userName,
    winnerEmail: "",
    winningTicket: winner.ticketNumber,
    prizeAmount: lottery.prizeAmount,
    timestamp: new Date().toISOString(),
    totalParticipants: lottery.participants.length,
    totalTickets: lottery.soldTickets,
  }
}

export const distributePrize = (result: LotteryResult, winnerCurrentBalance: number) => {
  const newBalance = winnerCurrentBalance + result.prizeAmount
  updateUserBalance(result.winnerId, newBalance)

  addTransaction(result.winnerId, {
    type: "prize_won",
    amount: result.prizeAmount,
    description: `Prize won - ${result.lotteryTitle} (Ticket #${result.winningTicket})`,
    status: "completed",
  })

  addNotification(result.winnerId, {
    type: "prize",
    title: "🎉 Congratulations! You won",
    message: `You won ${result.prizeAmount} USDT in ${result.lotteryTitle} with ticket #${result.winningTicket}`,
    link: "/dashboard/results",
  })
}

export const processCompletedLotteries = async (): Promise<void> => {
  const lotteries = await getLotteries()
  const now = new Date()

  for (const lottery of lotteries) {
    const endTime = new Date(lottery.endTime)
    if (!(now > endTime && lottery.status === "active" && !lottery.winnerId)) continue

    // Re-fetch with participants populated for the winner-selection step.
    const fullLottery = await getLotteryById(lottery.id)
    if (!fullLottery) continue

    const result = selectWinner(fullLottery)

    if (result) {
      await updateLottery({
        ...fullLottery,
        status: "completed",
        winnerId: result.winnerId,
        winnerName: result.winnerName,
        winningTicket: result.winningTicket,
      })
      saveResult(result)

      fullLottery.participants
        .map((p) => p.userId)
        .filter((id) => id !== result.winnerId)
        .forEach((participantId) => {
          addNotification(participantId, {
            type: "lottery_end",
            title: "Draw ended",
            message: `${fullLottery.title} has ended. Check the results to see the winner.`,
            link: "/dashboard/results",
          })
        })
    } else {
      await updateLottery({ ...fullLottery, status: "completed" })
    }

    if (fullLottery.autoRecreate) {
      const duration =
        new Date(fullLottery.endTime).getTime() - new Date(fullLottery.startTime).getTime()
      const newStartTime = new Date(Date.now() + duration)
      const newEndTime = new Date(newStartTime.getTime() + duration)

      await createLottery({
        title: fullLottery.title,
        prizeAmount: fullLottery.prizeAmount,
        ticketPrice: fullLottery.ticketPrice,
        maxTickets: fullLottery.maxTickets,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        status: "upcoming",
        autoRecreate: true,
      })
    }
  }
}

export const startAutomation = () => {
  if (typeof window === "undefined") return

  void processCompletedLotteries()
  const interval = setInterval(() => {
    void processCompletedLotteries()
  }, 10000)

  return () => clearInterval(interval)
}
