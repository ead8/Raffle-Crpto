"use client"

import { useAuth } from "@/components/auth-provider"
import { logout } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, Ticket, History, Wallet, Settings, LogOut, Award, Menu, Bell, Users, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "@/lib/notifications"
import Image from "next/image"

export function DashboardNav() {
  const { user, setAuth } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const { t } = useI18n()
  const balance = user?.balance || 0

  useEffect(() => {
    if (user) {
      const notifs = getNotifications(user.id)
      setNotifications(notifs.slice(0, 5))
      setUnreadCount(getUnreadCount(user.id))
    }
  }, [user])

  const handleLogout = () => {
    logout()
    setAuth(null)
    router.push("/")
  }

  const handleNotificationClick = (notificationId: string, link?: string) => {
    if (user) {
      markAsRead(user.id, notificationId)
      setUnreadCount(getUnreadCount(user.id))
      if (link) {
        router.push(link)
      }
    }
  }

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.id)
      setUnreadCount(0)
      const notifs = getNotifications(user.id)
      setNotifications(notifs.slice(0, 5))
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  const navItems = [
    { href: "/dashboard", name: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/lottery", name: t("nav.lotteries"), icon: Ticket },
    { href: "/dashboard/wallet", name: t("nav.wallet"), icon: Wallet },
    { href: "/dashboard/results", name: t("nav.results"), icon: Award },
    { href: "/dashboard/history", name: t("nav.history"), icon: History },
    { href: "/dashboard/tasks", name: t("nav.tasks"), icon: Award },
    { href: "/dashboard/referrals", name: t("nav.referrals"), icon: Users },
    { href: "/dashboard/settings", name: t("nav.settings"), icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-primary/20 backdrop-blur-xl bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Raffle USDT" width={32} height={32} className="w-8 h-8" />
                <span className="font-bold text-lg">
                  Raffle <span className="usdt-gradient">USDT</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/dashboard/wallet" className="hidden lg:flex">
                <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{balance.toFixed(2)} USDT</span>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 bg-background/95 backdrop-blur-md border-primary/30 mr-4 shadow-xl z-[9999]"
                  align="end"
                >
                  <DropdownMenuLabel className="flex items-center justify-between pb-2">
                    <span className="text-base font-semibold">{t("notifications.title")}</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
                        {t("notifications.markAllRead")}
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">{t("notifications.noNotifications")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("notifications.noNotifications.desc")}</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`cursor-pointer py-3 px-3 ${!notif.read ? "bg-primary/5" : ""}`}
                          onClick={() => handleNotificationClick(notif.id, notif.link)}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary rounded-full absolute left-1 top-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <LanguageSelector />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hidden lg:flex">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-background/95 backdrop-blur-md border-primary/30 mr-4 shadow-xl"
                  align="end"
                >
                  <DropdownMenuLabel className="pb-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-base font-semibold leading-none text-foreground">{user?.name}</p>
                      <p className="text-sm leading-none text-muted-foreground pt-1">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer py-2.5">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-sm">{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center gap-1 py-3 mt-3 pt-3 border-t border-primary/10">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-primary/20 text-primary font-medium" : "hover:bg-primary/10 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed inset-0 bg-background flex flex-col min-h-screen">
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                  <h2 className="text-lg font-semibold">Menú</h2>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-4 border-b border-primary/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-primary/20">
                  <Link href="/dashboard/wallet" onClick={() => setMobileMenuOpen(false)}>
                    <div className="glass-card px-4 py-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{balance.toFixed(2)} USDT</span>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary/20 text-primary font-medium"
                            : "hover:bg-primary/10 text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>

                <div className="p-4 border-t border-primary/20">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("nav.logout")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
