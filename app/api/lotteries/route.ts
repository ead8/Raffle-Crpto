import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type DbLotteryRow = {
  id: string
  title: string
  prize_amount: number
  ticket_price: number
  max_tickets: number
  sold_tickets: number
  start_time: string
  end_time: string
  status: "active" | "completed" | "upcoming"
  winner_id: string | null
  winner_name: string | null
  winning_ticket: string | null
}

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from("lotteries")
      .select(
        "id,title,prize_amount,ticket_price,max_tickets,sold_tickets,start_time,end_time,status,winner_id,winner_name,winning_ticket",
      )
      .order("start_time", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const lotteries = (data as DbLotteryRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      prizeAmount: row.prize_amount,
      ticketPrice: row.ticket_price,
      maxTickets: row.max_tickets,
      soldTickets: row.sold_tickets,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      winnerId: row.winner_id ?? undefined,
      winnerName: row.winner_name ?? undefined,
      winningTicket: row.winning_ticket ?? undefined,
      participants: [],
    }))

    return NextResponse.json({ lotteries })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

