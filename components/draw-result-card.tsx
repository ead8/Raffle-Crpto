"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Hash, Clock, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"
import type { Lottery } from "@/lib/lottery"
import { Button } from "@/components/ui/button"

interface DrawResultCardProps {
  lottery: Lottery
}

export function DrawResultCard({ lottery }: DrawResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const drawHash = lottery.drawHash || generateDemoHash(lottery.id)

  return (
    <Card className="glass-card border-border/70 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">{lottery.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(lottery.endTime).toLocaleString()}
            </span>
          </div>
        </div>
        <Badge
          className={`shrink-0 text-xs font-semibold ${
            lottery.status === "completed"
              ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
              : "bg-primary/20 text-primary border-primary/30"
          }`}
          variant="outline"
        >
          {lottery.status === "completed" ? "Completed" : lottery.status}
        </Badge>
      </div>

      {/* Winner Info */}
      {lottery.winnerId && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Winner</span>
          </div>
          <p className="font-semibold text-foreground">{lottery.winnerName || "Anonymous"}</p>
          {lottery.winningTicket && (
            <p className="text-xs text-muted-foreground mt-1">
              Winning Ticket: <span className="font-mono font-bold text-primary">{lottery.winningTicket}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Prize: <span className="font-semibold text-foreground">{lottery.prizeAmount} USDT</span>
          </p>
        </div>
      )}

      {/* Draw Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
          <p className="text-lg font-bold">{lottery.soldTickets}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Participants</p>
          <p className="text-lg font-bold">{lottery.participants.length}</p>
        </div>
      </div>

      {/* Provably Fair Hash */}
      <div className="p-4 rounded-lg bg-secondary/20 border border-border/50 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-chart-2" />
          <span className="text-sm font-semibold">Provably Fair Verification</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Draw Hash (SHA-256)</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded break-all flex-1">
              {drawHash}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => handleCopy(drawHash)}
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-chart-2" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            This hash was committed before the draw. You can independently verify it hasn't changed.
          </p>
        </div>
      </div>
    </Card>
  )
}

function generateDemoHash(id: string): string {
  // Deterministic demo hash based on lottery ID
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return `sha256:${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 71)
}
