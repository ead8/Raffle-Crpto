"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllUsers, type User } from "@/lib/auth"
import { updateUser, deleteUser } from "@/lib/admin"
import { getTransactions } from "@/lib/wallet"
import { getUserTickets } from "@/lib/lottery"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Mail,
  Wallet,
  Calendar,
  Shield,
  UserIcon,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  History,
  Ticket,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"

export default function AdminUsersPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOption, setFilterOption] = useState("none")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditBalanceDialog, setShowEditBalanceDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newBalance, setNewBalance] = useState("")
  const [newBonusBalance, setNewBonusBalance] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers(getAllUsers())
  }

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.numericId?.toString().includes(searchTerm) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (filterOption) {
        case "balance-high":
          return b.balance - a.balance
        case "balance-low":
          return a.balance - b.balance
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "active":
          return a.status === "active" ? -1 : 1
        case "suspended":
          return a.status === "suspended" ? -1 : 1
        default:
          return 0
      }
    })

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailsDialog(true)
  }

  const handleEditBalance = (user: User) => {
    setSelectedUser(user)
    setNewBalance(user.balance.toString())
    setNewBonusBalance((user.bonusBalance ?? 0).toString())
    setShowEditBalanceDialog(true)
  }

  const handleSaveBalance = () => {
    if (!selectedUser) return

    const balance = Number.parseFloat(newBalance)
    const bonusBalance = Number.parseFloat(newBonusBalance)
    if (isNaN(balance) || balance < 0 || isNaN(bonusBalance) || bonusBalance < 0) {
      toast({
        title: t("wallet.error"),
        description: t("wallet.error.invalidAmount"),
        variant: "destructive",
      })
      return
    }

    updateUser(selectedUser.id, { balance, bonusBalance })
    loadUsers()
    setShowEditBalanceDialog(false)
    toast({
      title: "Balance actualizado",
      description: `El balance de ${selectedUser.name} ha sido actualizado a ${balance} USDT y el balance bonus a ${bonusBalance} USDT`,
    })
  }

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "active" ? "suspended" : "active"
    updateUser(user.id, { status: newStatus })
    loadUsers()
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, status: newStatus })
    }
    toast({
      title: newStatus === "active" ? "Usuario activado" : "Usuario suspendido",
      description: `${user.name} ha sido ${newStatus === "active" ? "activado" : "suspendido"}`,
    })
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return

    deleteUser(selectedUser.id)
    loadUsers()
    setShowDeleteDialog(false)
    setShowDetailsDialog(false)
    toast({
      title: "Usuario eliminado",
      description: `${selectedUser.name} ha sido eliminado del sistema`,
    })
  }

  const getUserTransactions = (userId: string) => {
    return getTransactions(userId)
  }

  const getUserTicketsData = (userId: string) => {
    return getUserTickets(userId)
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("admin.users.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("admin.users.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("admin.users.totalUsers")}</p>
              <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("admin.users.administrators")}</p>
              <p className="text-xl sm:text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("admin.users.totalBalance")}</p>
              <p className="text-xl sm:text-2xl font-bold">
                {users.reduce((sum, u) => sum + u.balance, 0).toFixed(0)} USDT
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Card className="glass-card border-primary/20 p-3 sm:p-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>
        </Card>

        <Card className="glass-card border-primary/20 p-3 sm:p-4 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={filterOption} onValueChange={setFilterOption}>
              <SelectTrigger className="pl-10 pr-4 w-full sm:w-[200px] bg-secondary/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Filtrar..." />
              </SelectTrigger>
              <SelectContent className="glass-card border-primary/30">
                <SelectItem value="none">Sin filtro</SelectItem>
                <SelectItem value="balance-high">Mayor balance</SelectItem>
                <SelectItem value="balance-low">Menor balance</SelectItem>
                <SelectItem value="newest">Más nuevos</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="active">Solo activos</SelectItem>
                <SelectItem value="suspended">Solo suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-primary/20 p-3 sm:p-6">
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/30 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-base sm:text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm sm:text-base">{user.name}</p>
                    {user.role === "admin" && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        {t("admin.users.admin")}
                      </span>
                    )}
                    {user.status === "suspended" && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
                        Suspendido
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span>ID:</span>
                      <span className="font-mono">{user.numericId || 999999}</span>
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3 h-3 shrink-0" />
                      {user.balance.toFixed(2)} USDT
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 shrink-0" />
                      {user.referralCount || 0} referidos
                    </span>
                    <span className="hidden lg:flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {new Date(user.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 hover:bg-primary/10 bg-transparent w-full sm:w-auto"
                onClick={() => handleViewDetails(user)}
              >
                {t("admin.users.viewDetails")}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-primary/30 w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Detalles del Usuario</DialogTitle>
            <DialogDescription className="text-sm">Información completa y acciones disponibles</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="glass-card border-primary/20 w-full grid grid-cols-4">
                <TabsTrigger value="info" className="text-xs sm:text-sm">
                  Info
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm">
                  Trans.
                </TabsTrigger>
                <TabsTrigger value="tickets" className="text-xs sm:text-sm">
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-xs sm:text-sm">
                  Acciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/30 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-2xl sm:text-3xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold truncate">{selectedUser.name}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground truncate">{selectedUser.email}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      ID: {selectedUser.numericId || 999999}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedUser.role === "admin" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Admin</span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedUser.status === "active" ? "bg-chart-2/20 text-chart-2" : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {selectedUser.status === "active" ? "Activo" : "Suspendido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="glass-card border-primary/20 p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Balance Regular</p>
                        <p className="text-lg sm:text-xl font-bold truncate">{selectedUser.balance.toFixed(2)} USDT</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card border-primary/20 p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Balance Bonus</p>
                        <p className="text-lg sm:text-xl font-bold truncate">
                          {(selectedUser.bonusBalance ?? 0).toFixed(2)} USDT
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card border-primary/20 p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-chart-2" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Registro</p>
                        <p className="text-base sm:text-lg font-semibold truncate">
                          {new Date(selectedUser.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card border-primary/20 p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center shrink-0">
                        <History className="w-5 h-5 text-chart-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Transacciones</p>
                        <p className="text-lg sm:text-xl font-bold">{getUserTransactions(selectedUser.id).length}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card border-primary/20 p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-chart-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Referrals</p>
                        <p className="text-lg sm:text-xl font-bold">{selectedUser.referralCount || 0}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3 mt-4">
                {getUserTransactions(selectedUser.id).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-primary/10"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === "deposit"
                            ? "bg-chart-2/20"
                            : tx.type === "withdrawal"
                              ? "bg-red-500/20"
                              : tx.type === "prize_won"
                                ? "bg-accent/20"
                                : "bg-primary/20"
                        }`}
                      >
                        {tx.type === "deposit" ? (
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
                        ) : tx.type === "withdrawal" ? (
                          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        ) : tx.type === "prize_won" ? (
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                        ) : (
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold truncate">{tx.description}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold text-sm sm:text-base shrink-0 ${
                        tx.type === "deposit" || tx.type === "prize_won" ? "text-chart-2" : "text-red-500"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "prize_won" ? "+" : "-"}
                      {tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
                {getUserTransactions(selectedUser.id).length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No hay transacciones</p>
                )}
              </TabsContent>

              <TabsContent value="tickets" className="space-y-3 mt-4">
                {getUserTicketsData(selectedUser.id).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm sm:text-base truncate flex-1">{ticket.lotteryTitle}</p>
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-1 rounded-full shrink-0 ${
                          ticket.status === "won"
                            ? "bg-chart-2/20 text-chart-2"
                            : ticket.status === "active"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {ticket.status === "won" ? "Ganado" : ticket.status === "active" ? "Activo" : "Perdido"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ticket.ticketNumbers.map((num) => (
                        <span key={num} className="px-2 py-1 rounded bg-primary/10 text-xs sm:text-sm font-mono">
                          #{num}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Comprado: {new Date(ticket.purchaseDate).toLocaleString("es-ES")}
                    </p>
                  </div>
                ))}
                {getUserTicketsData(selectedUser.id).length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No hay tickets</p>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 mt-4">
                <Card className="glass-card border-primary/20 p-4 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">Acciones Administrativas</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Gestiona el usuario y su cuenta</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleEditBalance(selectedUser)}
                      className="w-full justify-start gap-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-sm sm:text-base"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                      Editar Balance
                    </Button>

                    <Button
                      onClick={() => handleToggleStatus(selectedUser)}
                      className={`w-full justify-start gap-3 border text-sm sm:text-base ${
                        selectedUser.status === "active"
                          ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                          : "bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 border-chart-2/30"
                      }`}
                      variant="outline"
                    >
                      {selectedUser.status === "active" ? (
                        <>
                          <Ban className="w-4 h-4" />
                          Suspender Usuario
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Activar Usuario
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full justify-start gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-sm sm:text-base"
                      variant="outline"
                      disabled={selectedUser.role === "admin"}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Usuario
                    </Button>
                  </div>

                  {selectedUser.role === "admin" && (
                    <p className="text-xs text-muted-foreground">* No se pueden eliminar cuentas de administrador</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditBalanceDialog} onOpenChange={setShowEditBalanceDialog}>
        <DialogContent className="glass-card border-primary/30 w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Balance</DialogTitle>
            <DialogDescription className="text-sm">Actualiza el balance de {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Balance Regular Actual</Label>
              <p className="text-xl sm:text-2xl font-bold text-primary">{selectedUser?.balance.toFixed(2)} USDT</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBalance" className="text-sm">
                Nuevo Balance Regular (USDT)
              </Label>
              <Input
                id="newBalance"
                type="number"
                step="0.01"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0.00"
                className="bg-secondary/50 border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Balance Bonus Actual</Label>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {(selectedUser?.bonusBalance ?? 0).toFixed(2)} USDT
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBonusBalance" className="text-sm">
                Nuevo Balance Bonus (USDT)
              </Label>
              <Input
                id="newBonusBalance"
                type="number"
                step="0.01"
                value={newBonusBalance}
                onChange={(e) => setNewBonusBalance(e.target.value)}
                placeholder="0.00"
                className="bg-secondary/50 border-primary/20"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditBalanceDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveBalance} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-card border-primary/30 w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que deseas eliminar a {selectedUser?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleDeleteUser} variant="destructive" className="w-full sm:w-auto">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
