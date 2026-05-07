"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  endTime: string
  onComplete?: () => void
  compact?: boolean
}

export function CountdownTimer({ endTime, onComplete, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime()
      const now = new Date().getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
        if (onComplete) onComplete()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, total: difference })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [endTime, onComplete])

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 5 * 60 * 1000 // < 5 mins
  const colorClass = isUrgent ? "text-destructive" : "text-accent"
  const iconClass = isUrgent ? "text-destructive animate-pulse" : "text-accent"

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${iconClass}`} />
        <span className={`font-mono font-semibold text-sm ${colorClass}`}>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    )
  }

  const segments = [
    ...(timeLeft.days > 0 ? [{ label: "Days", value: timeLeft.days }] : []),
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-2">
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className={`font-mono text-xl font-bold tabular-nums ${colorClass}`}>
              {String(seg.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{seg.label}</span>
          </div>
          {i < segments.length - 1 && (
            <span className={`font-mono text-lg font-bold mb-3 ${colorClass}`}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}
