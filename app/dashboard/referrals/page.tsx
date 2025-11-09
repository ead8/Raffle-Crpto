"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"
import {
  getReferralStats,
  getUserReferrals,
  getReferralSettings,
  type Referral,
  type ReferralStats,
} from "@/lib/referrals"
import { Copy, Users, CheckCircle, Clock, DollarSign, Share2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSync } from "@/hooks/use-sync"
import { getAllUsers } from "@/lib/auth"

export default function ReferralsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    commissionEarned: 0,
    referralCode: "",
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [settings, setSettings] = useState({ signupReward: 5, commissionRate: 10 })

  const loadData = () => {
    if (!user) return
    setStats(getReferralStats(user.id))
    setReferrals(getUserReferrals(user.id))
    setSettings(getReferralSettings())
  }

  useEffect(() => {
    loadData()
  }, [user])

  useSync("referrals", loadData)
  useSync("referral-settings", loadData)

  const copyCode = () => {
    navigator.clipboard.writeText(stats.referralCode)
    toast({
      title: t("referrals.codeCopied"),
      description: t("referrals.codeCopied.desc"),
    })
  }

  const shareLink = () => {
    const link = `${window.location.origin}/register?ref=${stats.referralCode}`
    navigator.clipboard.writeText(link)
    toast({
      title: t("referrals.linkCopied"),
      description: t("referrals.linkCopied.desc"),
    })
  }

  const getUserName = (userId: string) => {
    const users = getAllUsers()
    const user = users.find((u) => u.id === userId)
    return user ? user.name : "Usuario"
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 border-primary/20">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("referrals.totalReferrals")}</p>
              <p className="text-lg font-bold">{stats.totalReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-primary/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-chart-2" />
            <div>
              <p className="text-xs text-muted-foreground">{t("referrals.completed")}</p>
              <p className="text-lg font-bold">{stats.completedReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-primary/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-chart-4" />
            <div>
              <p className="text-xs text-muted-foreground">{t("referrals.pending")}</p>
              <p className="text-lg font-bold">{stats.pendingReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-primary/20">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">{t("referrals.totalEarned")}</p>
              <p className="text-lg font-bold text-accent">{stats.totalEarned} USDT</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">{t("referrals.howYouEarn")}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                • {t("referrals.signupReward")}:{" "}
                <span className="text-primary font-semibold">{settings.signupReward} USDT</span>
              </p>
              <p>
                • {t("referrals.commission")}:{" "}
                <span className="text-accent font-semibold">{settings.commissionRate}%</span>{" "}
                {t("referrals.commissionDesc")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">{t("referrals.commissionEarned")}</p>
            <p className="text-xl font-bold text-accent">{stats.commissionEarned} USDT</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-primary/20">
        <div className="flex items-center gap-3">
          <Input value={stats.referralCode} readOnly className="text-center text-lg font-mono bg-secondary/50 flex-1" />
          <Button onClick={copyCode} size="icon" variant="outline">
            <Copy className="w-4 h-4" />
          </Button>
          <Button onClick={shareLink} variant="default" className="gap-2">
            <Share2 className="w-4 h-4" />
            {t("referrals.shareLink")}
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-primary/20">
        <h3 className="font-semibold mb-3">{t("referrals.yourReferrals")}</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t("referrals.noReferrals.desc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getUserName(referral.referredId)}</p>
                    <p className="text-xs text-muted-foreground">{referral.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t("referrals.earned")}</p>
                    <p className="font-semibold text-sm text-primary">
                      {referral.reward + referral.commissionEarned} USDT
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      referral.status === "completed" ? "bg-chart-2/20 text-chart-2" : "bg-chart-4/20 text-chart-4"
                    }`}
                  >
                    {referral.status === "completed" ? t("referrals.status.completed") : t("referrals.status.pending")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 border-primary/20 bg-secondary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Términos y Condiciones del Programa de Referidos</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                • El bono de registro de {settings.signupReward} USDT se otorga cuando tu referido completa su{" "}
                <span className="font-semibold text-foreground">primer depósito de 100 USDT o más</span>.
              </p>
              <p>
                • Si el primer depósito del referido es menor a 100 USDT, no recibirás el bono de registro y depósitos
                posteriores no califican.
              </p>
              <p>
                • Ganarás una comisión del {settings.commissionRate}% en cada compra de tickets que realice tu referido,
                de por vida.
              </p>
              <p>• Las comisiones se acreditan automáticamente en tu billetera después de cada compra del referido.</p>
              <p>• Los bonos y comisiones pueden ser usados para comprar tickets o retirados a tu billetera externa.</p>
              <p>• El programa de referidos está sujeto a revisión por actividad fraudulenta o abuso del sistema.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
