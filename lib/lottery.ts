import { createClient } from "@/utils/supabase/client"

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
  autoRecreate?: boolean
  drawHash?: string
  type?: "standard" | "no-loss"
}

export interface LotteryParticipant {
  userId: string
  userName: string
  ticketCount: number
  ticketNumbers: string[]
}

export interface UserTicket {
  id: string
  lotteryId: string
  lotteryTitle: string
  ticketNumbers: string[]
  purchaseDate: string
  endDate: string
  status: "active" | "won" | "lost"
  prizeAmount?: number
}

interface LotteryRow {
  id: string
  title: string
  prize_amount: number | string
  ticket_price: number | string
  max_tickets: number
  sold_tickets: number
  start_time: string
  end_time: string
  status: "active" | "completed" | "upcoming"
  winner_id: string | null
  winning_ticket: string | null
  auto_recreate: boolean | null
  winner?: { name: string | null } | null
}

interface TicketRow {
  id: string
  lottery_id: string
  user_id: string
  ticket_number: string
  purchase_date: string
  status: "active" | "won" | "lost"
  user?: { name: string | null } | null
}

function rowToLottery(row: LotteryRow, participants: LotteryParticipant[] = []): Lottery {
  return {
    id: row.id,
    title: row.title,
    prizeAmount: Number(row.prize_amount),
    ticketPrice: Number(row.ticket_price),
    maxTickets: row.max_tickets,
    soldTickets: row.sold_tickets,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    winnerId: row.winner_id ?? undefined,
    winnerName: row.winner?.name ?? undefined,
    winningTicket: row.winning_ticket ?? undefined,
    autoRecreate: row.auto_recreate ?? undefined,
    participants,
  }
}

const LOTTERY_COLUMNS =
  "id,title,prize_amount,ticket_price,max_tickets,sold_tickets,start_time,end_time,status,winner_id,winning_ticket,auto_recreate"

export async function getLotteries(): Promise<Lottery[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lotteries")
    .select(`${LOTTERY_COLUMNS},winner:profiles!winner_id(name)`)
    .order("start_time", { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as LotteryRow[]).map((r) => rowToLottery(r))
}

export async function getActiveLotteries(): Promise<Lottery[]> {
  return (await getLotteries()).filter((l) => l.status === "active")
}

export async function getUpcomingLotteries(): Promise<Lottery[]> {
  return (await getLotteries()).filter((l) => l.status === "upcoming")
}

export async function getCompletedLotteries(): Promise<Lottery[]> {
  return (await getLotteries()).filter((l) => l.status === "completed")
}

export async function getLotteryById(id: string): Promise<Lottery | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lotteries")
    .select(`${LOTTERY_COLUMNS},winner:profiles!winner_id(name)`)
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null

  const { data: ticketsData } = await supabase
    .from("lottery_tickets")
    .select("ticket_number,user_id,user:profiles!user_id(name)")
    .eq("lottery_id", id)

  const grouped = new Map<string, LotteryParticipant>()
  ;((ticketsData ?? []) as unknown as TicketRow[]).forEach((t) => {
    const existing = grouped.get(t.user_id)
    if (existing) {
      existing.ticketCount += 1
      existing.ticketNumbers.push(t.ticket_number)
    } else {
      grouped.set(t.user_id, {
        userId: t.user_id,
        userName: t.user?.name ?? "Player",
        ticketCount: 1,
        ticketNumbers: [t.ticket_number],
      })
    }
  })

  return rowToLottery(data as unknown as LotteryRow, Array.from(grouped.values()))
}

export async function getUserTickets(userId: string): Promise<UserTicket[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lottery_tickets")
    .select(
      `id,lottery_id,ticket_number,purchase_date,status,
       lottery:lotteries!lottery_id(title,end_time,prize_amount)`,
    )
    .eq("user_id", userId)
    .order("purchase_date", { ascending: false })
  if (error || !data) return []

  type Row = {
    id: string
    lottery_id: string
    ticket_number: string
    purchase_date: string
    status: "active" | "won" | "lost"
    lottery: { title: string; end_time: string; prize_amount: number | string } | null
  }

  const grouped = new Map<string, UserTicket>()
  ;(data as unknown as Row[]).forEach((row) => {
    const key = `${row.lottery_id}:${row.status}`
    const existing = grouped.get(key)
    if (existing) {
      existing.ticketNumbers.push(row.ticket_number)
    } else {
      grouped.set(key, {
        id: row.id,
        lotteryId: row.lottery_id,
        lotteryTitle: row.lottery?.title ?? "Draw",
        ticketNumbers: [row.ticket_number],
        purchaseDate: row.purchase_date,
        endDate: row.lottery?.end_time ?? row.purchase_date,
        status: row.status,
        prizeAmount:
          row.status === "won" && row.lottery ? Number(row.lottery.prize_amount) : undefined,
      })
    }
  })

  return Array.from(grouped.values())
}

function generateTicketNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function purchaseTickets(
  lotteryId: string,
  userId: string,
  _userName: string,
  ticketCount: number,
): Promise<string[]> {
  if (ticketCount <= 0) throw new Error("Invalid ticket count")
  const supabase = createClient()

  const { data: lotteryRow, error: lotteryError } = await supabase
    .from("lotteries")
    .select("id,status,max_tickets,sold_tickets,ticket_price")
    .eq("id", lotteryId)
    .maybeSingle()
  if (lotteryError) throw new Error(lotteryError.message)
  if (!lotteryRow) throw new Error("Draw not found")
  if (lotteryRow.status !== "active") throw new Error("Draw is not active")

  const available = lotteryRow.max_tickets - lotteryRow.sold_tickets
  if (ticketCount > available) throw new Error(`Only ${available} tickets available`)

  const { data: existing } = await supabase
    .from("lottery_tickets")
    .select("ticket_number")
    .eq("lottery_id", lotteryId)
  const taken = new Set<string>(((existing ?? []) as { ticket_number: string }[]).map((r) => r.ticket_number))

  const ticketNumbers: string[] = []
  while (ticketNumbers.length < ticketCount) {
    const candidate = generateTicketNumber()
    if (!taken.has(candidate)) {
      ticketNumbers.push(candidate)
      taken.add(candidate)
    }
  }

  const rows = ticketNumbers.map((n) => ({
    lottery_id: lotteryId,
    user_id: userId,
    ticket_number: n,
  }))

  const { error: insertError } = await supabase.from("lottery_tickets").insert(rows)
  if (insertError) throw new Error(insertError.message)

  return ticketNumbers
}

export async function createLottery(
  lottery: Omit<Lottery, "id" | "soldTickets" | "participants">,
): Promise<Lottery> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lotteries")
    .insert({
      title: lottery.title,
      prize_amount: lottery.prizeAmount,
      ticket_price: lottery.ticketPrice,
      max_tickets: lottery.maxTickets,
      start_time: lottery.startTime,
      end_time: lottery.endTime,
      status: lottery.status,
      auto_recreate: lottery.autoRecreate ?? false,
    })
    .select(LOTTERY_COLUMNS)
    .single()
  if (error || !data) throw new Error(error?.message ?? "Failed to create draw")
  return rowToLottery(data as unknown as LotteryRow)
}

export async function updateLottery(lottery: Lottery): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("lotteries")
    .update({
      title: lottery.title,
      prize_amount: lottery.prizeAmount,
      ticket_price: lottery.ticketPrice,
      max_tickets: lottery.maxTickets,
      start_time: lottery.startTime,
      end_time: lottery.endTime,
      status: lottery.status,
      winner_id: lottery.winnerId ?? null,
      winning_ticket: lottery.winningTicket ?? null,
      auto_recreate: lottery.autoRecreate ?? false,
    })
    .eq("id", lottery.id)
  if (error) throw new Error(error.message)
}
