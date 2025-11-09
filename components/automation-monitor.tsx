"use client"

import { useEffect, useState } from "react"
import { startAutomation } from "@/lib/automation"

export function AutomationMonitor() {
  const [isActive, setIsActive] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    setIsActive(true)
    setLastCheck(new Date())

    const cleanup = startAutomation()

    // Update last check time every 10 seconds
    const checkInterval = setInterval(() => {
      setLastCheck(new Date())
    }, 10000)

    return () => {
      cleanup()
      clearInterval(checkInterval)
      setIsActive(false)
    }
  }, [])

  // This component doesn't render anything visible
  // It just runs the automation in the background
  return null
}
