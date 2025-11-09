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
            <h2 className="text-xl font-bold">Configuración de Sorteos</h2>
            <p className="text-sm text-muted-foreground">Parámetros por defecto para nuevos sorteos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-duration">Duración por Defecto (minutos)</Label>
              <Input
                id="default-duration"
                type="number"
                defaultValue={lotterySettings.defaultDuration}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                onChange={(e) => setLotterySettings({ ...lotterySettings, defaultDuration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-ticket-price">Precio Mínimo de Ticket (USDT)</Label>
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
              <Label htmlFor="max-tickets-per-user">Máximo Tickets por Usuario</Label>
              <Input
                id="max-tickets-per-user"
                type="number"
                defaultValue={lotterySettings.maxTicketsPerUser}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                onChange={(e) => setLotterySettings({ ...lotterySettings, maxTicketsPerUser: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-start">Inicio Automático de Sorteos</Label>
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
            <h2 className="text-xl font-bold">Configuración Financiera</h2>
            <p className="text-sm text-muted-foreground">Comisiones y límites de transacciones</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform-fee">Comisión de Plataforma (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                step="0.1"
                defaultValue="5"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal-fee">Comisión de Retiro (USDT)</Label>
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
              <Label htmlFor="min-deposit">Depósito Mínimo (USDT)</Label>
              <Input
                id="min-deposit"
                type="number"
                step="0.01"
                defaultValue="10"
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-withdrawal">Retiro Mínimo (USDT)</Label>
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
            <h2 className="text-xl font-bold">Seguridad de Usuarios</h2>
            <p className="text-sm text-muted-foreground">Configuración de seguridad y verificación para usuarios</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div>
              <p className="font-medium">Verificación de Email</p>
              <p className="text-sm text-muted-foreground">Requiere verificación de email para nuevos usuarios</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 bg-transparent">
              Activado
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Autenticación de Dos Factores (Google Authenticator)</p>
                <p className="text-sm text-muted-foreground">
                  Los usuarios podrán activar 2FA con Google Authenticator después de iniciar sesión
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`border-primary/30 ${twoFactorEnabled ? "bg-primary/20 text-primary" : "opacity-50 bg-transparent"}`}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? "Activado" : "Desactivado"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div>
              <p className="font-medium">Límite de Intentos de Login</p>
              <p className="text-sm text-muted-foreground">Bloqueo temporal después de 5 intentos fallidos</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary/30 bg-transparent">
              Activado
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1 bg-primary hover:bg-primary/90 glow-effect">
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
        <Button variant="outline" className="flex-1 border-primary/30 hover:bg-primary/10 bg-transparent">
          Restablecer
        </Button>
      </div>
    </div>
  )
}
