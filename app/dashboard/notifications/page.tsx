"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, requestNotificationPermission } from "@/lib/notifications"
import { useAuth } from "@/components/auth-provider"
import { Bell, CheckCircle2, Settings } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function NotificationsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (user) {
      loadNotifications()
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(Notification.permission)
      }

      // Listen for real-time notification updates
      const handleNotificationUpdate = (e: CustomEvent) => {
        if (e.detail.userId === user.id) {
          loadNotifications()
        }
      }

      window.addEventListener("notification-update" as any, handleNotificationUpdate as any)

      return () => {
        window.removeEventListener("notification-update" as any, handleNotificationUpdate as any)
      }
    }
  }, [user])

  const loadNotifications = () => {
    if (!user) return
    const notifs = getNotifications(user.id)
    setNotifications(notifs)
    setUnreadCount(getUnreadCount(user.id))
  }

  const handleMarkAsRead = (notificationId: string) => {
    if (!user) return
    markAsRead(user.id, notificationId)
    loadNotifications()
  }

  const handleMarkAllRead = () => {
    if (!user) return
    markAllAsRead(user.id)
    loadNotifications()
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setNotificationPermission("granted")
    } else {
      setNotificationPermission("denied")
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prize":
        return "🎉"
      case "lottery_end":
        return "🏁"
      case "deposit":
        return "💰"
      case "withdrawal":
        return "💸"
      default:
        return "ℹ️"
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("notifications.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {notificationPermission !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPermission}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Browser Notifications
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="border-primary/30 hover:bg-primary/10">
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
      </div>

      {notificationPermission === "granted" && (
        <Card className="glass-card border-chart-2/30 p-4 bg-chart-2/5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-chart-2" />
            <div>
              <p className="text-sm font-semibold">Browser notifications enabled</p>
              <p className="text-xs text-muted-foreground">You'll receive notifications even when the app is closed</p>
            </div>
          </div>
        </Card>
      )}

      {notifications.length === 0 ? (
        <Card className="glass-card border-primary/20 p-12">
          <div className="text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">{t("notifications.noNotifications")}</p>
            <p className="text-sm text-muted-foreground">{t("notifications.noNotifications.desc")}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`glass-card border-primary/20 p-4 sm:p-6 cursor-pointer transition-all hover:border-primary/40 ${
                !notif.read ? "bg-primary/5 border-primary/30" : ""
              }`}
              onClick={() => {
                if (!notif.read) {
                  handleMarkAsRead(notif.id)
                }
                if (notif.link) {
                  router.push(notif.link)
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg">{notif.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.read && <Badge className="bg-primary text-white text-xs">New</Badge>}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(notif.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">{notif.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {t(`notifications.type.${notif.type}`)}
                    </span>
                    {notif.link && (
                      <span className="text-xs text-primary hover:underline">View details →</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

