"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getLotteries, type Lottery } from "@/lib/lottery"
import { Trophy, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminLotteriesPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([])

  useEffect(() => {
    const loadLotteries = () => {
      setLotteries(getLotteries())
    }

    loadLotteries()
    const interval = setInterval(loadLotteries, 5000)

    return () => clearInterval(interval)
  }, [])

  const activeLotteries = lotteries.filter((l) => l.status === "active")
  const upcomingLotteries = lotteries.filter((l) => l.status === "upcoming")
  const completedLotteries = lotteries.filter((l) => l.status === "completed")

  const LotteryRow = ({ lottery }: { lottery: Lottery }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{lottery.title}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-muted-foreground">Premio: {lottery.prizeAmount} USDT</span>
            <span className="text-sm text-muted-foreground">Precio: {lottery.ticketPrice} USDT</span>
            <span className="text-sm text-muted-foreground">
              Tickets: {lottery.soldTickets}/{lottery.maxTickets}
            </span>
          </div>
        </div>
      </div>
      {lottery.status !== "completed" && (
        <div className="flex items-center gap-2">
          <Link href={`/admin/lotteries/${lottery.id}`}>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="hover:bg-destructive/10 text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Sorteos</h1>
          <p className="text-muted-foreground">Administra todos los sorteos de la plataforma</p>
        </div>
        <Link href="/admin/lotteries/create">
          <Button className="bg-primary hover:bg-primary/90 glow-effect">
            <Plus className="w-4 h-4 mr-2" />
            Crear Sorteo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card border-primary/20 p-1">
          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Activos ({activeLotteries.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Próximos ({upcomingLotteries.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Completados ({completedLotteries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="glass-card border-primary/20 p-6">
            <div className="space-y-3">
              {activeLotteries.length > 0 ? (
                activeLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay sorteos activos</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="glass-card border-primary/20 p-6">
            <div className="space-y-3">
              {upcomingLotteries.length > 0 ? (
                upcomingLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay sorteos próximos</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="glass-card border-primary/20 p-6">
            <div className="space-y-3">
              {completedLotteries.length > 0 ? (
                completedLotteries.map((lottery) => <LotteryRow key={lottery.id} lottery={lottery} />)
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No hay sorteos completados</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
