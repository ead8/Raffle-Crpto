// Helper function to trigger sync from anywhere
export function triggerSync(key: string) {
  if (typeof window === "undefined") return // Skip on server-side

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
