export interface Notification {
  id: string
  type: "prize" | "lottery_end" | "deposit" | "withdrawal" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

const STORAGE_KEY = "notifications"

export function getNotifications(userId: string): Notification[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
  if (!stored) {
    const demoNotifications = initializeDemoNotifications(userId)
    return demoNotifications
  }

  const notifications = JSON.parse(stored)
  return notifications.map((n: any) => ({
    ...n,
    timestamp: new Date(n.timestamp),
  }))
}

export function addNotification(
  userId: string,
  notification: Omit<Notification, "id" | "timestamp" | "read">,
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false,
  }

  const notifications = getNotifications(userId)
  notifications.unshift(newNotification)

  // Keep only last 100 notifications (increased from 50)
  const trimmed = notifications.slice(0, 100)

  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(trimmed))

    // Trigger sync event for real-time updates
    const event = new CustomEvent("notification-update", {
      detail: { userId, notifications: trimmed },
    })
    window.dispatchEvent(event)

    // Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.png",
          tag: newNotification.id,
        })
      } catch (e) {
        console.log("Browser notification failed:", e)
      }
    }
  }

  return newNotification
}

export function markAsRead(userId: string, notificationId: string): void {
  const notifications = getNotifications(userId)
  const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))

  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated))

    // Trigger sync event
    const event = new CustomEvent("notification-update", {
      detail: { userId, notifications: updated },
    })
    window.dispatchEvent(event)
  }
}

export function markAllAsRead(userId: string): void {
  const notifications = getNotifications(userId)
  const updated = notifications.map((n) => ({ ...n, read: true }))

  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated))

    // Trigger sync event
    const event = new CustomEvent("notification-update", {
      detail: { userId, notifications: updated },
    })
    window.dispatchEvent(event)
  }
}

// Request browser notification permission
export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(false)
  }

  if (Notification.permission === "granted") {
    return Promise.resolve(true)
  }

  if (Notification.permission === "denied") {
    return Promise.resolve(false)
  }

  return Notification.requestPermission().then((permission) => {
    return permission === "granted"
  })
}

export function getUnreadCount(userId: string): number {
  const notifications = getNotifications(userId)
  return notifications.filter((n) => !n.read).length
}

function initializeDemoNotifications(userId: string): Notification[] {
  const demoNotifications: Notification[] = [
    {
      id: "demo-notif-1",
      type: "prize",
      title: "¡Felicidades! Has ganado",
      message: "Ganaste 500 USDT en el Sorteo Semanal #45",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      link: "/dashboard/results",
    },
    {
      id: "demo-notif-2",
      type: "lottery_end",
      title: "Sorteo finalizado",
      message: "El Mega Sorteo #12 ha finalizado. Revisa los resultados",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: false,
      link: "/dashboard/results",
    },
    {
      id: "demo-notif-3",
      type: "deposit",
      title: "Depósito confirmado",
      message: "Tu depósito de 100 USDT ha sido confirmado",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      link: "/dashboard/wallet",
    },
    {
      id: "demo-notif-4",
      type: "info",
      title: "Nuevo sorteo disponible",
      message: "Participa en el Sorteo Diario #90 - Premio: 1000 USDT",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      link: "/dashboard/lottery",
    },
  ]

  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(demoNotifications))
  }

  return demoNotifications
}
