"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Ticket, Trophy, Wallet, Zap, Shield, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { LanguageSelector } from "@/components/language-selector"

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-[#26A17B] rounded-full blur-[120px] sm:blur-[180px] opacity-20 sm:opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-[#50AF95] rounded-full blur-[120px] sm:blur-[180px] opacity-20 sm:opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#26A17B] rounded-full blur-[150px] sm:blur-[200px] opacity-15 sm:opacity-20"></div>
      </div>

      <header className="relative z-10 border-b border-primary/20 backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
            <Image
              src="/logo.png"
              alt="Raffle USDT"
              width={40}
              height={40}
              className="w-6 h-6 sm:w-10 sm:h-10 flex-shrink-0"
            />
            <span className="text-sm sm:text-2xl font-bold whitespace-nowrap">
              Raffle <span className="usdt-gradient">USDT</span>
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <LanguageSelector />
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary text-xs sm:text-base px-2 sm:px-4 h-7 sm:h-10"
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white glow-effect text-xs sm:text-base px-2.5 sm:px-4 h-7 sm:h-10 whitespace-nowrap">
                {t("auth.register")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 container mx-auto px-4 py-8 sm:py-16 md:py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card border border-primary/30 mb-2 sm:mb-4">
            <span className="text-primary font-semibold text-xs sm:text-base">{t("landing.tagline")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight px-2">
            {t("landing.hero.title")} <span className="usdt-gradient">USDT</span> {t("landing.hero.subtitle")}
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty px-2 sm:px-4">
            {t("landing.hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6 glow-effect h-12 sm:h-auto"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("landing.cta.start")}
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-primary/30 hover:bg-primary/10 bg-transparent h-12 sm:h-auto"
              >
                {t("landing.cta.viewRaffles")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-6 sm:pt-10 md:pt-12 max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="glass-card p-2 sm:p-4 md:p-6 border-primary/20">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-primary text-glow">$50K+</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                {t("landing.stats.prizesDelivered")}
              </div>
            </Card>
            <Card className="glass-card p-2 sm:p-4 md:p-6 border-primary/20">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-primary text-glow">24/7</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                {t("landing.stats.activeRaffles")}
              </div>
            </Card>
            <Card className="glass-card p-2 sm:p-4 md:p-6 border-primary/20">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-primary text-glow">1,500+</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                {t("landing.stats.activeUsers")}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - Made responsive grid */}
      <section className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("features.title")}</h2>
          <p className="text-muted-foreground text-base sm:text-lg">{t("features.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.hourly.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.hourly.description")}
            </p>
          </Card>

          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.wallet.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.wallet.description")}
            </p>
          </Card>

          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.transparent.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.transparent.description")}
            </p>
          </Card>

          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.prizes.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.prizes.description")}
            </p>
          </Card>

          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.instant.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.instant.description")}
            </p>
          </Card>

          <Card className="glass-card p-6 sm:p-8 border-primary/20 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 sm:mb-6 glow-effect">
              <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t("features.accessible.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("features.accessible.description")}
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section - Made responsive */}
      <section className="relative z-10 container mx-auto px-4 py-12 sm:py-20">
        <Card className="glass-card border-primary/30 p-8 sm:p-12 text-center max-w-4xl mx-auto glow-effect">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6"
            >
              {t("cta.button")}
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/20 backdrop-blur-sm mt-12 sm:mt-20">
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
              &copy; 2025 Raffle <span className="usdt-gradient">USDT</span>. {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
