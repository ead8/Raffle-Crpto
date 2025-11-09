export interface Lottery {
  id: string
  title: string
  prizeAmount: number
  ticketPrice: number
  maxTickets: number
  soldTickets: number
  startTime: string
  endTime: string
  status: "active" | "completed" | "upcoming"
  winnerId?: string
  winnerName?: string
  winningTicket?: string
  participants: LotteryParticipant[]
  autoRecreate?: boolean // Added autoRecreate property for automatic lottery recreation
}

export interface LotteryParticipant {
  userId: string
  userName: string
  ticketCount: number
  ticketNumbers: string[] // Updated to string[]
}

export interface UserTicket {
  id: string
  lotteryId: string
  lotteryTitle: string
  ticketNumbers: string[]
  purchaseDate: string
  endDate: string // Added to track when the raffle ends
  status: "active" | "won" | "lost"
  prizeAmount?: number
}

const LOTTERIES_KEY = "usdt_lottery_lotteries"
const USER_TICKETS_KEY = "usdt_lottery_user_tickets"

// Initialize with demo lotteries
export const initializeLotteries = () => {
  if (typeof window === "undefined") return

  const existing = localStorage.getItem(LOTTERIES_KEY)
  if (!existing) {
    const now = new Date()
    const demoLotteries: Lottery[] = [
      {
        id: "lottery-1",
        title: "Sorteo Rápido",
        prizeAmount: 500,
        ticketPrice: 5,
        maxTickets: 100,
        soldTickets: 45,
        startTime: new Date(now.getTime() - 30 * 60000).toISOString(),
        endTime: new Date(now.getTime() + 30 * 60000).toISOString(),
        status: "active",
        participants: [],
      },
      {
        id: "lottery-2",
        title: "Mega Sorteo",
        prizeAmount: 1000,
        ticketPrice: 10,
        maxTickets: 150,
        soldTickets: 89,
        startTime: new Date(now.getTime() - 15 * 60000).toISOString(),
        endTime: new Date(now.getTime() + 45 * 60000).toISOString(),
        status: "active",
        participants: [],
      },
      {
        id: "lottery-3",
        title: "Sorteo Express",
        prizeAmount: 250,
        ticketPrice: 2,
        maxTickets: 80,
        soldTickets: 32,
        startTime: new Date(now.getTime() - 45 * 60000).toISOString(),
        endTime: new Date(now.getTime() + 15 * 60000).toISOString(),
        status: "active",
        participants: [],
      },
      {
        id: "lottery-4",
        title: "Sorteo Premium",
        prizeAmount: 2000,
        ticketPrice: 20,
        maxTickets: 200,
        soldTickets: 0,
        startTime: new Date(now.getTime() + 60 * 60000).toISOString(),
        endTime: new Date(now.getTime() + 120 * 60000).toISOString(),
        status: "upcoming",
        participants: [],
      },
    ]
    localStorage.setItem(LOTTERIES_KEY, JSON.stringify(demoLotteries))
  }
}

export const initializeDemoUserTickets = (userId: string) => {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(USER_TICKETS_KEY)
  const allUserTickets: Record<string, UserTicket[]> = stored ? JSON.parse(stored) : {}

  // Only initialize if user has no tickets yet
  if (!allUserTickets[userId] || allUserTickets[userId].length === 0) {
    const now = new Date()

    allUserTickets[userId] = [
      {
        id: "demo-ticket-1",
        lotteryId: "lottery-1",
        lotteryTitle: "Sorteo Rápido",
        ticketNumbers: ["123456", "789012", "345678"],
        purchaseDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 30 * 60000).toISOString(),
        status: "active",
      },
      {
        id: "demo-ticket-2",
        lotteryId: "lottery-2",
        lotteryTitle: "Mega Sorteo",
        ticketNumbers: ["456789", "901234"],
        purchaseDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 45 * 60000).toISOString(),
        status: "active",
      },
      {
        id: "demo-ticket-3",
        lotteryId: "completed-1",
        lotteryTitle: "Sorteo Semanal #45",
        ticketNumbers: ["112233", "445566"],
        purchaseDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "won",
        prizeAmount: 500,
      },
      {
        id: "demo-ticket-4",
        lotteryId: "completed-2",
        lotteryTitle: "Sorteo Diario #89",
        ticketNumbers: ["778899"],
        purchaseDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "lost",
      },
    ]

    localStorage.setItem(USER_TICKETS_KEY, JSON.stringify(allUserTickets))
  }
}

export const getLotteries = (): Lottery[] => {
  if (typeof window === "undefined") return []

  initializeLotteries()
  const stored = localStorage.getItem(LOTTERIES_KEY)
  if (!stored) return []

  const lotteries: Lottery[] = JSON.parse(stored)

  // Update lottery statuses based on current time
  const now = new Date()
  const updated = lotteries.map((lottery) => {
    const endTime = new Date(lottery.endTime)
    const startTime = new Date(lottery.startTime)

    if (now > endTime && lottery.status === "active") {
      return { ...lottery, status: "completed" as const }
    }
    if (now >= startTime && now <= endTime && lottery.status === "upcoming") {
      return { ...lottery, status: "active" as const }
    }
    return lottery
  })

  localStorage.setItem(LOTTERIES_KEY, JSON.stringify(updated))
  return updated
}

export const getLotteryById = (id: string): Lottery | null => {
  const lotteries = getLotteries()
  return lotteries.find((l) => l.id === id) || null
}

export const purchaseTickets = (lotteryId: string, userId: string, userName: string, ticketCount: number): string[] => {
  if (typeof window === "undefined") return []

  const lotteries = getLotteries()
  const lotteryIndex = lotteries.findIndex((l) => l.id === lotteryId)

  if (lotteryIndex === -1) return []

  const lottery = lotteries[lotteryIndex]

  // Validate lottery is active
  if (lottery.status !== "active") {
    throw new Error("Lottery is not active")
  }

  // Validate available tickets
  const availableTickets = lottery.maxTickets - lottery.soldTickets
  if (ticketCount > availableTickets) {
    throw new Error(`Only ${availableTickets} tickets available`)
  }

  // Validate ticket count
  if (ticketCount <= 0) {
    throw new Error("Invalid ticket count")
  }

  // Generate 6-digit ticket numbers
  const ticketNumbers: string[] = []
  for (let i = 0; i < ticketCount; i++) {
    // Generate random 6-digit number (100000-999999)
    const randomTicket = Math.floor(100000 + Math.random() * 900000).toString()
    ticketNumbers.push(randomTicket)
  }

  // Update lottery
  const existingParticipant = lottery.participants.find((p) => p.userId === userId)
  if (existingParticipant) {
    existingParticipant.ticketCount += ticketCount
    existingParticipant.ticketNumbers.push(...ticketNumbers)
  } else {
    lottery.participants.push({
      userId,
      userName,
      ticketCount,
      ticketNumbers,
    })
  }

  lottery.soldTickets += ticketCount
  lotteries[lotteryIndex] = lottery
  localStorage.setItem(LOTTERIES_KEY, JSON.stringify(lotteries))

  // Trigger sync event for lotteries
  const lotteryEvent = new CustomEvent("storage-sync", {
    detail: { key: LOTTERIES_KEY, value: lotteries },
  })
  window.dispatchEvent(lotteryEvent)

  const purchaseAmount = lottery.ticketPrice * ticketCount
  const { addReferralCommission } = require("./referrals")
  addReferralCommission(userId, purchaseAmount)

  // Save user tickets
  const userTicketsData = localStorage.getItem(USER_TICKETS_KEY)
  const allUserTickets: Record<string, UserTicket[]> = userTicketsData ? JSON.parse(userTicketsData) : {}

  if (!allUserTickets[userId]) {
    allUserTickets[userId] = []
  }

  const existingTicket = allUserTickets[userId].find((t) => t.lotteryId === lotteryId && t.status === "active")
  if (existingTicket) {
    existingTicket.ticketNumbers.push(...ticketNumbers)
  } else {
    allUserTickets[userId].push({
      id: "ticket-" + Date.now(),
      lotteryId,
      lotteryTitle: lottery.title,
      ticketNumbers,
      purchaseDate: new Date().toISOString(),
      endDate: lottery.endTime,
      status: "active",
    })
  }

  localStorage.setItem(USER_TICKETS_KEY, JSON.stringify(allUserTickets))

  const ticketsEvent = new CustomEvent("storage-sync", {
    detail: { key: USER_TICKETS_KEY, value: allUserTickets },
  })
  window.dispatchEvent(ticketsEvent)

  return ticketNumbers
}

export const getUserTickets = (userId: string): UserTicket[] => {
  if (typeof window === "undefined") return []

  initializeDemoUserTickets(userId)

  const stored = localStorage.getItem(USER_TICKETS_KEY)
  if (!stored) return []

  const allUserTickets: Record<string, UserTicket[]> = JSON.parse(stored)
  return allUserTickets[userId] || []
}

export const getActiveLotteries = (): Lottery[] => {
  return getLotteries().filter((l) => l.status === "active")
}

export const getUpcomingLotteries = (): Lottery[] => {
  return getLotteries().filter((l) => l.status === "upcoming")
}

export const getCompletedLotteries = (): Lottery[] => {
  return getLotteries().filter((l) => l.status === "completed")
}

export const updateLottery = (lottery: Lottery) => {
  if (typeof window === "undefined") return

  const lotteries = getLotteries()
  const index = lotteries.findIndex((l) => l.id === lottery.id)

  if (index !== -1) {
    lotteries[index] = lottery
    localStorage.setItem(LOTTERIES_KEY, JSON.stringify(lotteries))

    const event = new CustomEvent("storage-sync", {
      detail: { key: LOTTERIES_KEY, value: lotteries },
    })
    window.dispatchEvent(event)
  }
}

export const createLottery = (lottery: Omit<Lottery, "id" | "soldTickets" | "participants">) => {
  if (typeof window === "undefined") return

  const lotteries = getLotteries()
  const newLottery: Lottery = {
    ...lottery,
    id: "lottery-" + Date.now(),
    soldTickets: 0,
    participants: [],
  }

  lotteries.push(newLottery)
  localStorage.setItem(LOTTERIES_KEY, JSON.stringify(lotteries))

  const event = new CustomEvent("storage-sync", {
    detail: { key: LOTTERIES_KEY, value: lotteries },
  })
  window.dispatchEvent(event)
}
