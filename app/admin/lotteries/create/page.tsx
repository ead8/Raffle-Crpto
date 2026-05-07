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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date()
      const durationMs = Number.parseInt(formData.durationMinutes) * 60000
      const endTime = new Date(now.getTime() + durationMs)

      await createLottery({
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

        await createLottery({
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
        title: "Draw created",
        description: formData.autoRecreate
          ? "The active draw and the next draw have been created automatically"
          : "The draw has been created successfully",
      })

      router.push("/admin/lotteries")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create draw",
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
        Back to draws
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Create New Draw</h1>
        <p className="text-muted-foreground">Configure draw details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-primary/20 p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Draw Title</Label>
            <Input
              id="title"
              placeholder="Ex: Mega Premium Draw"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Prize (USDT)</Label>
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
              <Label htmlFor="ticketPrice">Price per Ticket (USDT)</Label>
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
              <Label htmlFor="maxTickets">Maximum Tickets</Label>
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
              <Label htmlFor="duration">Duration (minutes)</Label>
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
                  Auto-recreate
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  When this draw ends, a new one will be created automatically with the same settings
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Total prize: <span className="text-primary font-semibold">{formData.prizeAmount || "0"} USDT</span>
              </p>
              <p className="text-muted-foreground">
                Potential revenue:{" "}
                <span className="text-primary font-semibold">
                  {(
                    Number.parseFloat(formData.ticketPrice || "0") * Number.parseInt(formData.maxTickets || "0")
                  ).toFixed(2)}{" "}
                  USDT
                </span>
              </p>
              <p className="text-muted-foreground">
                Duration: <span className="text-primary font-semibold">{formData.durationMinutes} minutes</span>
              </p>
              <p className="text-muted-foreground">
                Auto-recreation:{" "}
                <span className={`font-semibold ${formData.autoRecreate ? "text-green-500" : "text-muted-foreground"}`}>
                  {formData.autoRecreate ? "Enabled" : "Disabled"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 glow-effect">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Draw"}
            </Button>
            <Link href="/admin/lotteries" className="flex-1">
              <Button type="button" variant="outline" className="w-full border-primary/30 bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </Card>
      </form>
    </div>
  )
}
