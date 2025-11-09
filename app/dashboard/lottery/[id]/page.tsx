"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLotteryById, purchaseTickets, type Lottery } from "@/lib/lottery"
import { addTransaction } from "@/lib/wallet"
import { updateUserBalance } from "@/lib/auth"
import { CountdownTimer } from "@/components/countdown-timer"
import { Trophy, Users, Ticket, ShoppingCart, ArrowLeft, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function LotteryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, refreshAuth } = useAuth()
  const { toast } = useToast()
  const [lottery, setLottery] = useState<Lottery | null>(null)
  const [ticketCount, setTicketCount] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadLottery = () => {
      const lotteryData = getLotteryById(params.id as string)
      setLottery(lotteryData)
    }

    loadLottery()
    const interval = setInterval(loadLottery, 5000)

    return () => clearInterval(interval)
  }, [params.id])

  if (!lottery || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card border-primary/20 p-12 text-center">
          <p className="text-muted-foreground">Cargando sorteo...</p>
        </Card>
      </div>
    )
  }

  const totalCost = lottery.ticketPrice * ticketCount
  const canAfford = user.balance >= totalCost
  const availableTickets = lottery.maxTickets - lottery.soldTickets
  const maxPurchase = Math.min(availableTickets, Math.floor(user.balance / lottery.ticketPrice))
  const progress = (lottery.soldTickets / lottery.maxTickets) * 100

  const handlePurchase = () => {
    if (!canAfford) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficiente balance para esta compra",
        variant: "destructive",
      })
      return
    }

    if (ticketCount > availableTickets) {
      toast({
        title: "Tickets no disponibles",
        description: "No hay suficientes tickets disponibles",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const ticketNumbers = purchaseTickets(lottery.id, user.id, user.name, ticketCount)

      addTransaction(user.id, {
        type: "ticket_purchase",
        amount: totalCost,
        description: `Compra de ${ticketCount} ticket(s) - ${lottery.title}`,
        status: "completed",
      })

      updateUserBalance(user.id, user.balance - totalCost)
      refreshAuth()

      toast({
        title: "Compra exitosa",
        description: `Has comprado ${ticketCount} ticket(s). Números: ${ticketNumbers.join(", ")}`,
      })

      // Refresh lottery data
      const updatedLottery = getLotteryById(lottery.id)
      setLottery(updatedLottery)
      setTicketCount(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la compra",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const userParticipation = lottery.participants.find((p) => p.userId === user.id)

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      <Link
        href="/dashboard/lottery"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a sorteos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-primary/30 p-6 md:p-8 glow-effect">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{lottery.title}</h1>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold text-primary text-glow">
                    {lottery.prizeAmount} USDT
                  </span>
                </div>
              </div>
              {lottery.status === "active" && (
                <div className="px-4 py-2 rounded-full bg-chart-2/20 border border-chart-2/30 animate-pulse">
                  <span className="text-sm font-semibold text-chart-2">En Vivo</span>
                </div>
              )}
            </div>

            {lottery.status === "active" && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Tiempo restante para participar</p>
                <CountdownTimer endTime={lottery.endTime} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Precio por Ticket</span>
                </div>
                <p className="text-2xl font-bold">{lottery.ticketPrice} USDT</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Participantes</span>
                </div>
                <p className="text-2xl font-bold">{lottery.participants.length}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tickets Vendidos</span>
                </div>
                <p className="text-2xl font-bold">{lottery.soldTickets}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso de venta</span>
                <span className="font-semibold">
                  {lottery.soldTickets} / {lottery.maxTickets} tickets
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </Card>

          {/* How it Works */}
          <Card className="glass-card border-primary/20 p-6">
            <h2 className="text-xl font-bold mb-4">¿Cómo funciona?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Compra tus tickets</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Selecciona cuántos tickets quieres comprar. Cada ticket aumenta tus probabilidades de ganar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Espera el sorteo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    El sorteo se realiza automáticamente cuando termina el tiempo. El sistema selecciona un ganador al
                    azar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recibe tu premio</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Si ganas, el premio se deposita automáticamente en tu billetera. Sin esperas ni complicaciones.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Participants */}
          {lottery.participants.length > 0 && (
            <Card className="glass-card border-primary/20 p-6">
              <h2 className="text-xl font-bold mb-4">Participantes ({lottery.participants.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lottery.participants.map((participant, index) => (
                  <div key={participant.userId} className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{participant.userName}</p>
                          <p className="text-xs text-muted-foreground">{participant.ticketCount} tickets</p>
                        </div>
                      </div>
                      {participant.userId === user.id && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="mt-2 p-2 rounded bg-background/50 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Números de tickets:</p>
                      <div className="flex flex-wrap gap-1">
                        {participant.ticketNumbers.map((ticketNum) => (
                          <span
                            key={ticketNum}
                            className={cn(
                              "text-xs font-mono px-2 py-1 rounded border",
                              participant.userId === user.id
                                ? "bg-primary/20 border-primary/30 text-primary font-semibold"
                                : "bg-secondary/50 border-primary/10",
                            )}
                          >
                            #{ticketNum}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Purchase Panel */}
        <div className="space-y-6">
          <Card className="glass-card border-primary/30 p-6 lg:sticky lg:top-20">
            <h2 className="text-xl font-bold mb-6">Comprar Tickets</h2>

            {lottery.status === "active" ? (
              <div className="space-y-6">
                {userParticipation && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Tus tickets actuales</p>
                    <p className="text-2xl font-bold text-primary mb-2">{userParticipation.ticketCount}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tus números:</p>
                      <div className="flex flex-wrap gap-1">
                        {userParticipation.ticketNumbers.map((n) => (
                          <span
                            key={n}
                            className="text-xs font-mono px-2 py-1 rounded bg-primary/20 border border-primary/30 text-primary font-semibold"
                          >
                            #{n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ticket-count">Cantidad de tickets</Label>
                  <Input
                    id="ticket-count"
                    type="number"
                    min="1"
                    max={maxPurchase}
                    value={ticketCount}
                    onChange={(e) =>
                      setTicketCount(Math.max(1, Math.min(maxPurchase, Number.parseInt(e.target.value))))
                    }
                    className="bg-secondary/50 border-primary/20 focus:border-primary text-lg"
                  />
                  <p className="text-xs text-muted-foreground">Máximo disponible: {maxPurchase} tickets</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Precio por ticket</span>
                    <span className="font-semibold">{lottery.ticketPrice} USDT</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Cantidad</span>
                    <span className="font-semibold">{ticketCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">{totalCost.toFixed(2)} USDT</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Tu balance</p>
                  <p className="text-lg font-bold">{user.balance.toFixed(2)} USDT</p>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={loading || !canAfford || availableTickets === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-white glow-effect py-6 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {loading ? "Procesando..." : !canAfford ? "Fondos Insuficientes" : "Comprar Tickets"}
                </Button>

                {!canAfford && (
                  <Link href="/dashboard/wallet">
                    <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10 bg-transparent">
                      <Zap className="w-4 h-4 mr-2" />
                      Depositar Fondos
                    </Button>
                  </Link>
                )}
              </div>
            ) : lottery.status === "upcoming" ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Este sorteo aún no ha comenzado</p>
                <CountdownTimer endTime={lottery.startTime} />
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Este sorteo ha finalizado</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
