"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createLottery } from "@/lib/lottery"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CreateLotteryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    prizeAmount: "",
    ticketPrice: "",
    maxTickets: "",
    durationMinutes: "60",
    autoRecreate: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date()
      const durationMs = Number.parseInt(formData.durationMinutes) * 60000
      const endTime = new Date(now.getTime() + durationMs)

      createLottery({
        title: formData.title,
        prizeAmount: Number.parseFloat(formData.prizeAmount),
        ticketPrice: Number.parseFloat(formData.ticketPrice),
        maxTickets: Number.parseInt(formData.maxTickets),
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        status: "active",
        autoRecreate: formData.autoRecreate,
      })

      if (formData.autoRecreate) {
        const upcomingStartTime = new Date(endTime.getTime())
        const upcomingEndTime = new Date(upcomingStartTime.getTime() + durationMs)

        createLottery({
          title: formData.title,
          prizeAmount: Number.parseFloat(formData.prizeAmount),
          ticketPrice: Number.parseFloat(formData.ticketPrice),
          maxTickets: Number.parseInt(formData.maxTickets),
          startTime: upcomingStartTime.toISOString(),
          endTime: upcomingEndTime.toISOString(),
          status: "upcoming",
          autoRecreate: true,
        })
      }

      toast({
        title: "Sorteo creado",
        description: formData.autoRecreate
          ? "Se han creado el sorteo activo y el próximo sorteo automáticamente"
          : "El sorteo ha sido creado exitosamente",
      })

      router.push("/admin/lotteries")
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el sorteo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
      <Link
        href="/admin/lotteries"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a sorteos
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Sorteo</h1>
        <p className="text-muted-foreground">Configura los detalles del sorteo</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-primary/20 p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Sorteo</Label>
            <Input
              id="title"
              placeholder="Ej: Sorteo Mega Premium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Premio (USDT)</Label>
              <Input
                id="prizeAmount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.prizeAmount}
                onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                required
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Precio por Ticket (USDT)</Label>
              <Input
                id="ticketPrice"
                type="number"
                step="0.01"
                placeholder="10"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                required
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxTickets">Máximo de Tickets</Label>
              <Input
                id="maxTickets"
                type="number"
                placeholder="100"
                value={formData.maxTickets}
                onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
                required
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                required
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="autoRecreate"
                checked={formData.autoRecreate}
                onCheckedChange={(checked) => setFormData({ ...formData, autoRecreate: checked as boolean })}
                className="mt-1 border-white"
              />
              <div className="flex-1">
                <label htmlFor="autoRecreate" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  Recrear automáticamente
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando este sorteo termine, se creará automáticamente uno nuevo con la misma configuración
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h3 className="font-semibold mb-2">Resumen</h3>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Premio total: <span className="text-primary font-semibold">{formData.prizeAmount || "0"} USDT</span>
              </p>
              <p className="text-muted-foreground">
                Ingresos potenciales:{" "}
                <span className="text-primary font-semibold">
                  {(
                    Number.parseFloat(formData.ticketPrice || "0") * Number.parseInt(formData.maxTickets || "0")
                  ).toFixed(2)}{" "}
                  USDT
                </span>
              </p>
              <p className="text-muted-foreground">
                Duración: <span className="text-primary font-semibold">{formData.durationMinutes} minutos</span>
              </p>
              <p className="text-muted-foreground">
                Recreación automática:{" "}
                <span className={`font-semibold ${formData.autoRecreate ? "text-green-500" : "text-muted-foreground"}`}>
                  {formData.autoRecreate ? "Activada" : "Desactivada"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 glow-effect">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Creando..." : "Crear Sorteo"}
            </Button>
            <Link href="/admin/lotteries" className="flex-1">
              <Button type="button" variant="outline" className="w-full border-primary/30 bg-transparent">
                Cancelar
              </Button>
            </Link>
          </div>
        </Card>
      </form>
    </div>
  )
}
