"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFinancialStats, getAllTransactions, type FinancialStats, type FinancialTransaction } from "@/lib/admin"
import { getTransactions, type Transaction } from "@/lib/wallet"
import { getAllUsers, getStoredAuth } from "@/lib/auth"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Ticket,
  Trophy,
  Users,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useSync } from "@/hooks/use-sync"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminFinancesPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTicketSales: 0,
    totalPrizesPaid: 0,
    platformBalance: 0,
    userBalances: 0,
    bonusBalances: 0,
  })
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([])
  const [filterType, setFilterType] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [pendingWithdrawals, setPendingWithdrawals] = useState<
    Array<Transaction & { userName: string; userEmail: string }>
  >([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<
    (Transaction & { userName: string; userEmail: string }) | null
  >(null)
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)

  const loadData = () => {
    setStats(getFinancialStats())
    const allTxs = getAllTransactions()
    setTransactions(allTxs)
    setFilteredTransactions(allTxs)

    loadPendingWithdrawals()
  }

  const loadPendingWithdrawals = () => {
    const users = getAllUsers()
    const pending: Array<Transaction & { userName: string; userEmail: string }> = []

    users.forEach((user) => {
      const userTransactions = getTransactions(user.id)
      const userPending = userTransactions.filter((tx) => tx.type === "withdrawal" && tx.status === "pending")
      userPending.forEach((tx) => {
        pending.push({
          ...tx,
          userName: user.name,
          userEmail: user.email,
        })
      })
    })

    // Sort by timestamp (newest first)
    pending.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setPendingWithdrawals(pending)
  }

  const approveWithdrawal = (withdrawal: Transaction & { userName: string; userEmail: string }) => {
    if (typeof window === "undefined") return

    const auth = getStoredAuth()
    const adminId = auth.user?.id || "admin-unknown"

    const users = getAllUsers()
    const user = users.find((u) => u.email === withdrawal.userEmail)
    if (!user) return

    const userTransactions = getTransactions(user.id)
    const txIndex = userTransactions.findIndex((tx) => tx.id === withdrawal.id)
    if (txIndex === -1) return

    // Update transaction status to completed with approval details
    userTransactions[txIndex].status = "completed"
    userTransactions[txIndex].approvedBy = adminId
    userTransactions[txIndex].approvedAt = new Date().toISOString()

    // Save back to localStorage
    const stored = localStorage.getItem("usdt_lottery_transactions")
    const allTransactions: Record<string, Transaction[]> = stored ? JSON.parse(stored) : {}
    allTransactions[user.id] = userTransactions
    localStorage.setItem("usdt_lottery_transactions", JSON.stringify(allTransactions))

    // Trigger sync
    const event = new CustomEvent("storage-sync", {
      detail: { key: "usdt_lottery_transactions", value: allTransactions },
    })
    window.dispatchEvent(event)

    toast({
      title: "Retiro Aprobado",
      description: `El retiro de ${withdrawal.amount.toFixed(2)} USDT ha sido aprobado`,
    })

    setWithdrawalDialogOpen(false)
    loadData()
  }

  const rejectWithdrawal = (withdrawal: Transaction & { userName: string; userEmail: string }, reason?: string) => {
    if (typeof window === "undefined") return

    const auth = getStoredAuth()
    const adminId = auth.user?.id || "admin-unknown"

    const users = getAllUsers()
    const user = users.find((u) => u.email === withdrawal.userEmail)
    if (!user) return

    const userTransactions = getTransactions(user.id)
    const txIndex = userTransactions.findIndex((tx) => tx.id === withdrawal.id)
    if (txIndex === -1) return

    // Update transaction status to failed with rejection details
    userTransactions[txIndex].status = "failed"
    userTransactions[txIndex].approvedBy = adminId
    userTransactions[txIndex].approvedAt = new Date().toISOString()
    if (reason) {
      userTransactions[txIndex].rejectionReason = reason
    }

    // Refund the full amount (including fee) back to user's balance
    const stored = localStorage.getItem("usdt_lottery_users")
    const allUsers = stored ? JSON.parse(stored) : []
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      allUsers[userIndex].balance += withdrawal.amount
      localStorage.setItem("usdt_lottery_users", JSON.stringify(allUsers))

      // Update auth state if this is the current user
      const currentAuth = getStoredAuth()
      if (currentAuth.user?.id === user.id) {
        currentAuth.user.balance = allUsers[userIndex].balance
        localStorage.setItem("usdt_lottery_auth", JSON.stringify(currentAuth))
      }
    }

    // Save transactions back to localStorage
    const txStored = localStorage.getItem("usdt_lottery_transactions")
    const allTransactions: Record<string, Transaction[]> = txStored ? JSON.parse(txStored) : {}
    allTransactions[user.id] = userTransactions
    localStorage.setItem("usdt_lottery_transactions", JSON.stringify(allTransactions))

    // Trigger sync
    const event = new CustomEvent("storage-sync", {
      detail: { key: "usdt_lottery_transactions", value: allTransactions },
    })
    window.dispatchEvent(event)

    const userEvent = new CustomEvent("storage-sync", {
      detail: { key: "usdt_lottery_users", value: allUsers },
    })
    window.dispatchEvent(userEvent)

    toast({
      title: "Retiro Rechazado",
      description: `El retiro ha sido rechazado y los fondos devueltos al usuario`,
    })

    setWithdrawalDialogOpen(false)
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  useSync("usdt_lottery_transactions", loadData)
  useSync("usdt_lottery_users", loadData)

  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType)
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.timestamp)
        return txDate >= start && txDate <= end
      })
    }

    setFilteredTransactions(filtered)
  }, [filterType, startDate, endDate, transactions])

  const exportToCSV = () => {
    const headers = ["ID", "Usuario", "Tipo", "Monto", "Fecha", "Estado", "Descripción"]
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.userName,
      tx.type,
      tx.amount,
      new Date(tx.timestamp).toLocaleString(),
      tx.status,
      tx.description,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacciones_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const statCards = [
    {
      label: "Ingresos Totales",
      value: `${stats.totalRevenue.toFixed(2)} USDT`,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/20",
      change: "+12.5%",
    },
    {
      label: "Gastos Totales",
      value: `${stats.totalExpenses.toFixed(2)} USDT`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      change: "-8.2%",
    },
    {
      label: "Beneficio Neto",
      value: `${stats.netProfit.toFixed(2)} USDT`,
      icon: DollarSign,
      color: stats.netProfit >= 0 ? "text-chart-2" : "text-red-500",
      bgColor: stats.netProfit >= 0 ? "bg-chart-2/20" : "bg-red-500/20",
      change: stats.netProfit >= 0 ? "Positivo" : "Negativo",
    },
    {
      label: "Balance Plataforma",
      value: `${stats.platformBalance.toFixed(2)} USDT`,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/20",
      change: "Disponible",
    },
  ]

  const detailCards = [
    {
      label: "Total Depósitos",
      value: `${stats.totalDeposits.toFixed(2)} USDT`,
      icon: ArrowDownCircle,
      color: "text-chart-2",
    },
    {
      label: "Total Retiros",
      value: `${stats.totalWithdrawals.toFixed(2)} USDT`,
      icon: ArrowUpCircle,
      color: "text-red-500",
    },
    {
      label: "Ventas de Tickets",
      value: `${stats.totalTicketSales.toFixed(2)} USDT`,
      icon: Ticket,
      color: "text-accent",
    },
    {
      label: "Premios Pagados",
      value: `${stats.totalPrizesPaid.toFixed(2)} USDT`,
      icon: Trophy,
      color: "text-chart-4",
    },
    {
      label: "Balance Usuarios",
      value: `${stats.userBalances.toFixed(2)} USDT`,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Balance Bonos",
      value: `${stats.bonusBalances.toFixed(2)} USDT`,
      icon: DollarSign,
      color: "text-chart-3",
    },
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-chart-2" />
      case "withdrawal":
        return <ArrowUpCircle className="w-5 h-5 text-red-500" />
      case "ticket_purchase":
        return <Ticket className="w-5 h-5 text-accent" />
      case "prize_won":
        return <Trophy className="w-5 h-5 text-chart-4" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-chart-2"
      case "withdrawal":
        return "text-red-500"
      case "ticket_purchase":
        return "text-accent"
      case "prize_won":
        return "text-chart-4"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contabilidad y Finanzas</h1>
          <p className="text-muted-foreground">Seguimiento completo de todas las transacciones y finanzas</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Volver al Panel</Button>
        </Link>
      </div>

      {pendingWithdrawals.length > 0 && (
        <Card className="glass-card border-chart-4/30 p-6 bg-chart-4/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Retiros Pendientes</h2>
                <p className="text-sm text-muted-foreground">
                  {pendingWithdrawals.length} retiros esperando aprobación
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pendingWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background border border-chart-4/20 hover:border-chart-4/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{withdrawal.userName}</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.userEmail}</p>
                    <p className="text-xs text-muted-foreground">{new Date(withdrawal.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-chart-4">{withdrawal.amount.toFixed(2)} USDT</p>
                    <p className="text-xs text-muted-foreground">Pendiente</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-chart-2 text-chart-2 hover:bg-chart-2/10 bg-transparent"
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal)
                        setWithdrawalDialogOpen(true)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                      onClick={() => rejectWithdrawal(withdrawal)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="glass-card border-primary/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">{stat.change}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Detail Stats */}
      <Card className="glass-card border-primary/20 p-6">
        <h2 className="text-xl font-bold mb-6">Desglose Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {detailCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-primary/10"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Transactions */}
      <Card className="glass-card border-primary/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Historial de Transacciones</h2>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Tipo de Transacción</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="deposit">Depósitos</SelectItem>
                <SelectItem value="withdrawal">Retiros</SelectItem>
                <SelectItem value="ticket_purchase">Compra de Tickets</SelectItem>
                <SelectItem value="prize_won">Premios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Fecha Fin</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay transacciones para mostrar</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.userName}</p>
                    <p className="text-sm text-muted-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(tx.type)}`}>
                    {tx.type === "withdrawal" || tx.type === "ticket_purchase" ? "-" : "+"}
                    {tx.amount.toFixed(2)} USDT
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === "completed"
                        ? "bg-chart-2/20 text-chart-2"
                        : tx.status === "pending"
                          ? "bg-chart-4/20 text-chart-4"
                          : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {tx.status === "completed" ? "Completado" : tx.status === "pending" ? "Pendiente" : "Fallido"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Retiro</DialogTitle>
            <DialogDescription>Revisa los detalles del retiro antes de aprobar</DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Usuario:</span>
                  <span className="font-semibold">{selectedWithdrawal.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-mono text-sm">{selectedWithdrawal.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto:</span>
                  <span className="text-lg font-bold text-chart-4">{selectedWithdrawal.amount.toFixed(2)} USDT</span>
                </div>
                {selectedWithdrawal.network && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Red:</span>
                    <span className="text-sm font-mono uppercase">{selectedWithdrawal.network}</span>
                  </div>
                )}
                {selectedWithdrawal.destinationAddress && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Dirección de Destino:</span>
                    <span className="text-sm font-mono break-all bg-primary/10 p-2 rounded">{selectedWithdrawal.destinationAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="text-sm">{new Date(selectedWithdrawal.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Descripción:</span>
                  <span className="text-sm">{selectedWithdrawal.description}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-chart-2 hover:bg-chart-2/90"
                  onClick={() => approveWithdrawal(selectedWithdrawal)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Retiro
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                  onClick={() => rejectWithdrawal(selectedWithdrawal)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
