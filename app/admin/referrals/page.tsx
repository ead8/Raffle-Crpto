"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import {
  getReferralSettings,
  updateReferralSettings,
  getAdminReferralStats,
  getAllReferrals,
  type ReferralSettings,
  type Referral,
} from "@/lib/referrals"
import { DollarSign, Percent, Users, CheckCircle, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSync } from "@/hooks/use-sync"
import { getAllUsers } from "@/lib/auth"

export default function AdminReferralsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [settings, setSettings] = useState<ReferralSettings>({
    signupReward: 5,
    commissionRate: 10,
  })
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewardsPaid: 0,
    totalCommissionPaid: 0,
  })
  const [referrals, setReferrals] = useState<Referral[]>([])

  const loadData = () => {
    setSettings(getReferralSettings())
    setStats(getAdminReferralStats())
    setReferrals(getAllReferrals())
  }

  useEffect(() => {
    loadData()
  }, [])

  useSync("referrals", loadData)
  useSync("referral-settings", loadData)

  const handleSave = () => {
    updateReferralSettings(settings)
    toast({
      title: t("admin.settings.saveChanges"),
      description: t("admin.referrals.settings.saved"),
    })
  }

  const getUserName = (userId: string) => {
    const users = getAllUsers()
    const user = users.find((u) => u.id === userId)
    return user?.name || "Usuario Desconocido"
  }

  const getUserEmail = (userId: string) => {
    const users = getAllUsers()
    const user = users.find((u) => u.id === userId)
    return user?.email || ""
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("admin.referrals.title")}</h1>
        <p className="text-muted-foreground">{t("admin.referrals.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.referrals.totalReferrals")}</p>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.referrals.completedReferrals")}</p>
              <p className="text-2xl font-bold">{stats.completedReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.referrals.pendingReferrals")}</p>
              <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.referrals.signupRewards")}</p>
              <p className="text-2xl font-bold text-accent">{stats.totalRewardsPaid} USDT</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-1/20 flex items-center justify-center">
              <Percent className="w-6 h-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("admin.referrals.commissionPaid")}</p>
              <p className="text-2xl font-bold text-chart-1">{stats.totalCommissionPaid} USDT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings */}
      <Card className="glass-card border-primary/20 p-6">
        <h2 className="text-xl font-bold mb-6">{t("admin.referrals.settings")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("admin.referrals.signupRewardAmount")}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={settings.signupReward}
                onChange={(e) => setSettings({ ...settings, signupReward: Number(e.target.value) })}
                className="pl-10"
                min="0"
                step="1"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("admin.referrals.signupRewardDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("admin.referrals.commissionRate")}</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                className="pl-10"
                min="0"
                max="100"
                step="1"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("admin.referrals.commissionRateDesc")}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            {t("admin.settings.saveChanges")}
          </Button>
        </div>
      </Card>

      {/* Referral History */}
      <Card className="glass-card border-primary/20 p-6">
        <h2 className="text-xl font-bold mb-6">{t("admin.referrals.allReferrals")}</h2>

        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("admin.referrals.noReferrals")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{getUserName(referral.referrerId)}</p>
                    <span className="text-muted-foreground">→</span>
                    <p className="text-muted-foreground">{getUserName(referral.referredId)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                    <span>Código: {referral.referralCode}</span>
                    <span>Email: {getUserEmail(referral.referredId)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Bono</p>
                    <p className="font-bold text-accent">{referral.reward} USDT</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Comisión</p>
                    <p className="font-bold text-chart-1">{referral.commissionEarned.toFixed(2)} USDT</p>
                  </div>
                  <div>
                    {referral.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-sm">
                        <CheckCircle className="w-3 h-3" />
                        {t("referrals.status.completed")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-chart-4/20 text-chart-4 text-sm">
                        <Clock className="w-3 h-3" />
                        {t("referrals.status.pending")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
