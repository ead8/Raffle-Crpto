"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { getUserTickets, type UserTicket } from "@/lib/lottery"
import { TicketCard } from "@/components/ticket-card"
import { Ticket, Inbox } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "won" | "lost">("all")

  useEffect(() => {
    if (!user) return
    let cancelled = false
    getUserTickets(user.id).then((userTickets) => {
      if (!cancelled) setTickets(userTickets)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
          <Ticket className="w-7 h-7 text-primary" />
          My Tickets
        </h1>
        <p className="text-sm text-muted-foreground">
          All your draw tickets — active, won, and past entries
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", count: tickets.filter((t) => t.status === "active").length, color: "text-chart-2" },
          { label: "Won", count: tickets.filter((t) => t.status === "won").length, color: "text-primary" },
          { label: "Total", count: tickets.length, color: "text-foreground" },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="glass-card border border-border/70 rounded-xl p-4 text-center"
          >
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "won", "lost"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={filter === f ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Ticket Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} userName={user.name} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <Inbox className="w-14 h-14 mx-auto text-muted-foreground/40" />
          <div>
            <p className="text-muted-foreground font-medium">No tickets found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all" ? "Buy tickets from an active draw to get started." : `No ${filter} tickets yet.`}
            </p>
          </div>
          {filter === "all" && (
            <Link href="/dashboard/lottery">
              <Button className="bg-primary">Browse Draws</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
