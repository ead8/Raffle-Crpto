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
import {
  LayoutDashboard,
  Users,
  Ticket,
  DollarSign,
  Award,
  Settings,
  LogOut,
  Shield,
  Menu,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function AdminNav() {
  const { user, setAuth } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  const handleLogout = () => {
    logout()
    setAuth(null)
    router.push("/")
  }

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/lotteries", label: "Sorteos", icon: Ticket },
    { href: "/admin/finances", label: "Finanzas", icon: DollarSign },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/tasks", label: "Tareas", icon: Award },
    { href: "/admin/referrals", label: "Referidos", icon: TrendingUp },
    { href: "/admin/results", label: "Resultados", icon: Award },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
  ]

  return (
    <nav className="border-b border-primary/20 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-9 h-9 text-primary" />
              <span className="text-lg md:text-xl font-bold">
                <span className="text-primary">Admin</span> Panel
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
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
                    <div className="flex items-center gap-2 pt-2 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Administrador</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer py-2.5">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm">{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Panel del menú - pantalla completa */}
          <div className="absolute inset-0 bg-background flex flex-col min-h-screen">
            {/* Header del menú móvil con botón de cerrar */}
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-lg font-bold">
                  <span className="text-primary">Admin</span> Panel
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Información del usuario */}
            <div className="p-4 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Administrador</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 py-6 text-base",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Botón de logout */}
            <div className="p-4 border-t border-primary/20">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 py-6 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base">{t("nav.logout")}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
