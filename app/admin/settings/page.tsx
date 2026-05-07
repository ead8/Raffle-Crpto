"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, DollarSign, Shield, Save } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AdminSettingsPage() {
  const { t } = useI18n()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [lotterySettings, setLotterySettings] = useState({
    defaultDuration: "7",
    minTicketPrice: "1",
    maxTicketsPerUser: "100",
    autoStartEnabled: true,
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("admin.settings.title")}</h1>
          <p className="text-muted-foreground">{t("admin.settings.description")}</p>
        </div>
      </div>

      {/* Lottery Settings */}
      <Card className="glass-card border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
            <Settings className="w-6 h-6 text-chart-2" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Draw Configuration</h2>
            <p className="text-sm text-muted-foreground">Default parameters for new draws</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-duration">Default Duration (minutes)</Label>
              <Input
                id="default-duration"
                type="number"
                defaultValue={lotterySettings.defaultDuration}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                onChange={(e) => setLotterySettings({ ...lotterySettings, defaultDuration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-ticket-price">Minimum Ticket Price (USDT)</Label>
              <Input
                id="min-ticket-price"
                type="number"
                step="0.01"
                defaultValue={lotterySettings.minTicketPrice}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                onChange={(e) => setLotterySettings({ ...lotterySettings, minTicketPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tickets-per-user">Maximum Tickets per User</Label>
              <Input
                id="max-tickets-per-user"
                type="number"
                defaultValue={lotterySettings.maxTicketsPerUser}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                onChange={(e) => setLotterySettings({ ...lotterySettings, maxTicketsPerUser: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-start">Automatic Draw Start</Label>
              <Switch
                id="auto-start"
                checked={lotterySettings.autoStartEnabled}
                onCheckedChange={(checked) => setLotterySettings({ ...lotterySettings, autoStartEnabled: checked })}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Settings */}
      <Card className="glass-card border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Financial Configuration</h2>
            <p className="text-sm text-muted-foreground">Fees and transaction limits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform-fee">Platform Fee (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                step="0.1"
                defaultValue="5"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal-fee">Withdrawal Fee (USDT)</Label>
              <Input
                id="withdrawal-fee"
                type="number"
                step="0.01"
                defaultValue="1"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-deposit">Minimum Deposit (USDT)</Label>
              <Input
                id="min-deposit"
                type="number"
                step="0.01"
                defaultValue="10"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-withdrawal">Minimum Withdrawal (USDT)</Label>
              <Input
                id="min-withdrawal"
                type="number"
                step="0.01"
                defaultValue="20"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="glass-card border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-chart-1/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-chart-1" />
          </div>
          <div>
            <h2 className="text-xl font-bold">User Security</h2>
            <p className="text-sm text-muted-foreground">Security and verification settings for users</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div>
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">Requires email verification for new users</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 bg-transparent">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication (Google Authenticator)</p>
                <p className="text-sm text-muted-foreground">
                  Users will be able to enable 2FA with Google Authenticator after logging in
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`border-primary/30 ${twoFactorEnabled ? "bg-primary/20 text-primary" : "opacity-50 bg-transparent"}`}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div>
              <p className="font-medium">Login Attempt Limit</p>
              <p className="text-sm text-muted-foreground">Temporary lockout after 5 failed attempts</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 bg-transparent">
              Enabled
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1 bg-primary hover:bg-primary/90 glow-effect">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button variant="outline" className="flex-1 border-primary/30 hover:bg-primary/10 bg-transparent">
          Reset
        </Button>
      </div>
    </div>
  )
}
