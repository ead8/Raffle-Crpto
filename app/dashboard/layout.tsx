"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { AutomationMonitor } from "@/components/automation-monitor"
import { RecentResultsBanner } from "@/components/recent-results-banner"
import { Toaster } from "@/components/ui/toaster"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen mesh-bg relative">
      <AutomationMonitor />
      <DashboardNav />
      <RecentResultsBanner />
      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-border/60 mt-12 sm:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">{t("footer.description")}</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {t("footer.privacy")}
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                {t("footer.terms")}
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Raffle <span className="usdt-gradient">USDT</span>.{" "}
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
