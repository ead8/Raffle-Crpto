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
    <div className="min-h-screen mesh-bg relative overflow-hidden">
      <header className="relative z-10 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt="Raffle USDT" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
            <span className="text-base sm:text-xl font-semibold tracking-tight truncate">
              Raffle <span className="usdt-gradient">USDT</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                {t("auth.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm">
                {t("auth.register")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.14em] text-primary/90">
              <span className="h-px w-8 bg-primary/50" aria-hidden />
              {t("landing.tagline")}
            </p>

            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-balance">
              {t("landing.hero.title")}{" "}
              <span className="usdt-gradient not-italic">USDT</span>{" "}
              <span className="text-muted-foreground font-normal">{t("landing.hero.subtitle")}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("landing.hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/register" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold px-8 h-12">
                  <Zap className="w-4 h-4 mr-2 opacity-90" />
                  {t("landing.cta.start")}
                </Button>
              </Link>
              <Link href="/login" className="sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 border-border bg-transparent hover:bg-secondary/50"
                >
                  {t("landing.cta.viewRaffles")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="glass-card p-6 sm:p-8 border-border/80">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-6">At a glance</p>
              <dl className="space-y-6">
                <div className="flex justify-between items-baseline gap-4 border-b border-border/50 pb-5">
                  <dt className="text-sm text-muted-foreground max-w-[55%]">{t("landing.stats.prizesDelivered")}</dt>
                  <dd className="font-display text-3xl sm:text-4xl font-semibold text-primary tabular-nums">$50K+</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4 border-b border-border/50 pb-5">
                  <dt className="text-sm text-muted-foreground max-w-[55%]">{t("landing.stats.activeRaffles")}</dt>
                  <dd className="font-display text-3xl sm:text-4xl font-semibold tabular-nums">24/7</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <dt className="text-sm text-muted-foreground max-w-[55%]">{t("landing.stats.activeUsers")}</dt>
                  <dd className="font-display text-3xl sm:text-4xl font-semibold tabular-nums">1,500+</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-border/40">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3">{t("features.title")}</h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{t("features.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl">
          {[
            { icon: Clock, titleKey: "features.hourly.title", descKey: "features.hourly.description" },
            { icon: Wallet, titleKey: "features.wallet.title", descKey: "features.wallet.description" },
            { icon: Shield, titleKey: "features.transparent.title", descKey: "features.transparent.description" },
            { icon: Trophy, titleKey: "features.prizes.title", descKey: "features.prizes.description" },
            { icon: Zap, titleKey: "features.instant.title", descKey: "features.instant.description" },
            { icon: Ticket, titleKey: "features.accessible.title", descKey: "features.accessible.description" },
          ].map(({ icon: Icon, titleKey, descKey }) => (
            <Card
              key={titleKey}
              className="glass-card p-6 sm:p-7 border-border/70 hover:border-primary/35 transition-colors duration-300"
            >
              <Icon className="w-5 h-5 text-primary mb-4 opacity-90" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-semibold mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center glass-card border-border/80 p-10 sm:p-14">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">{t("cta.title")}</h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t("cta.description")}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-10 h-12">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60 mt-8">
        <div className="container mx-auto px-4 sm:px-6 py-10 text-center space-y-5">
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">{t("footer.description")}</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              {t("footer.privacy")}
            </Link>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Raffle <span className="usdt-gradient">USDT</span>. {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  )
}
