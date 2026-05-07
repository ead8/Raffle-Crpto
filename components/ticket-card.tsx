"use client"

import { Ticket, QrCode, Calendar, Trophy } from "lucide-react"
import type { UserTicket } from "@/lib/lottery"
import { useEffect, useRef } from "react"

interface TicketCardProps {
  ticket: UserTicket
  userName?: string
}

export function TicketCard({ ticket, userName }: TicketCardProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!qrRef.current) return
    // Use the qrcode library if available
    try {
      const QRCode = require("qrcode")
      const canvas = document.createElement("canvas")
      QRCode.toCanvas(canvas, `TICKET:${ticket.id}:${ticket.ticketNumbers.join(",")}`, {
        width: 64,
        margin: 1,
        color: { dark: "#a78bfa", light: "#0a0a0a" },
      })
      qrRef.current.innerHTML = ""
      qrRef.current.appendChild(canvas)
    } catch {
      // Fallback: show QR placeholder
      if (qrRef.current) {
        qrRef.current.innerHTML = `<div class="w-16 h-16 flex items-center justify-center text-primary/40 text-xs font-mono border border-primary/20 rounded">QR</div>`
      }
    }
  }, [ticket.id, ticket.ticketNumbers])

  const statusColor = {
    active: "text-chart-2 border-chart-2/40 bg-chart-2/10",
    won: "text-primary border-primary/40 bg-primary/10",
    lost: "text-muted-foreground border-border bg-secondary/20",
  }[ticket.status]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-secondary/20 to-primary/5 shadow-lg">
      {/* Top stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-primary/60" />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="font-display text-base font-semibold tracking-tight">{ticket.lotteryTitle}</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
            {ticket.status.toUpperCase()}
          </span>
        </div>

        {/* Ticket numbers */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Ticket Numbers</p>
          <div className="flex flex-wrap gap-1.5">
            {ticket.ticketNumbers.map((num) => (
              <span
                key={num}
                className="font-mono text-xs font-bold bg-primary/15 border border-primary/25 text-primary px-2 py-0.5 rounded"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between gap-3 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            {userName && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{userName}</span>
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Ends {new Date(ticket.endDate).toLocaleDateString()}</span>
            </div>
            {ticket.status === "won" && ticket.prizeAmount && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                <Trophy className="w-3 h-3" />
                <span>Won {ticket.prizeAmount} USDT</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="shrink-0" />
        </div>
      </div>

      {/* Perforated edge effect */}
      <div className="flex justify-between px-4 pb-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-border/60" />
        ))}
      </div>
    </div>
  )
}
