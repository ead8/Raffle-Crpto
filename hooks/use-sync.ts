"use client"

import { useEffect, useState } from "react"

// Custom hook to sync data across components
export function useSync<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [data, setData] = useState<T>(initialValue)

  // Load initial data
  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (e) {
        console.error(`[v0] Error parsing ${key}:`, e)
      }
    }
  }, [key])

  // Listen for changes from other components
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setData(e.detail.value)
      }
    }

    window.addEventListener("storage-sync" as any, handleStorageChange as any)
    return () => {
      window.removeEventListener("storage-sync" as any, handleStorageChange as any)
    }
  }, [key])

  // Update function that syncs across components
  const updateData = (value: T) => {
    setData(value)
    localStorage.setItem(key, JSON.stringify(value))

    // Dispatch custom event to notify other components
    const event = new CustomEvent("storage-sync", {
      detail: { key, value },
    })
    window.dispatchEvent(event)
  }

  return [data, updateData]
}

// Helper function to trigger sync from anywhere
export function triggerSync(key: string) {
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      const value = JSON.parse(stored)
      const event = new CustomEvent("storage-sync", {
        detail: { key, value },
      })
      window.dispatchEvent(event)
    } catch (e) {
      console.error(`[v0] Error triggering sync for ${key}:`, e)
    }
  }
}
