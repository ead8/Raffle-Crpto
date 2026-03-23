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
    <div className="min-h-screen mesh-bg relative">
      <AutomationMonitor />
      <AdminNav />
      <main className="relative z-10">{children}</main>
    </div>
  )
}
