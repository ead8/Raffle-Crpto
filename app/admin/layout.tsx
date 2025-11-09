"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AdminNav } from "@/components/admin-nav"
import { AutomationMonitor } from "@/components/automation-monitor"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) return

    if (!isAuthenticated) {
      router.push("/admin/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#26A17B] rounded-full blur-[120px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#50AF95] rounded-full blur-[120px] opacity-10 animate-pulse delay-1000"></div>
      </div>

      <AutomationMonitor />
      <AdminNav />
      <main className="relative z-10">{children}</main>
    </div>
  )
}
