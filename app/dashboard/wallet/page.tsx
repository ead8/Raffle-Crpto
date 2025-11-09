"use client"

import type React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { addTransaction, getTransactions, getUserWalletAddress, type Transaction } from "@/lib/wallet"
import { updateUserBalance } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import QRCode from "qrcode"
import Image from "next/image"

export default function WalletPage() {
  const { user, refreshAuth } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()

  // Dialog states
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  // Deposit states
  const [depositCurrency, setDepositCurrency] = useState("")
  const [depositNetwork, setDepositNetwork] = useState<"trx" | "sol" | "bsc" | "">("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [addressCopied, setAddressCopied] = useState(false)
  const [currentDepositAddress, setCurrentDepositAddress] = useState("")

  // Withdraw states
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawCurrency, setWithdrawCurrency] = useState("")
  const [withdrawNetwork, setWithdrawNetwork] = useState<"trx" | "sol" | "bsc" | "">("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionFilter, setTransactionFilter] = useState<"all" | "deposit" | "withdrawal">("all")

  useEffect(() => {
    if (user) {
      setTransactions(getTransactions(user.id))
    }
  }, [user])

  // Update QR code and address when network changes
  useEffect(() => {
    if (depositDialogOpen && user && depositNetwork) {
      const address = getUserWalletAddress(user, depositNetwork as "trx" | "sol" | "bsc")
      setCurrentDepositAddress(address)
      if (address) {
        QRCode.toDataURL(address, { width: 200, margin: 1 }).then(setQrCodeUrl).catch(console.error)
      }
    }
  }, [depositDialogOpen, user, depositNetwork])

  if (!user) return null

  const handleCopyAddress = () => {
    const addressToCopy = currentDepositAddress || (depositNetwork ? getUserWalletAddress(user, depositNetwork as "trx" | "sol" | "bsc") : user.walletAddress)
    navigator.clipboard.writeText(addressToCopy)
    setAddressCopied(true)
    toast({
      title: t("wallet.success.addressCopied"),
    })
    setTimeout(() => setAddressCopied(false), 2000)
  }

  const handleWithdraw = () => {
    if (!withdrawAddress || withdrawAddress.length < 20) {
      toast({
        title: t("wallet.error.invalidAddress"),
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(withdrawAmount)
    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      toast({
        title: t("wallet.error.invalidAmount"),
        variant: "destructive",
      })
      return
    }

    if (amount < 10) {
      toast({
        title: t("wallet.error.minAmount"),
        variant: "destructive",
      })
      return
    }

    const totalAmount = amount + 1 // Including 1 USDT fee
    if (totalAmount > user.balance) {
      toast({
        title: t("wallet.error.insufficientBalance"),
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setWithdrawSuccess(false)

    if (!withdrawNetwork) {
      toast({
        title: t("wallet.error"),
        description: "Please select a network",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    setTimeout(() => {
      const newBalance = user.balance - totalAmount

      addTransaction(user.id, {
        type: "withdrawal",
        amount: totalAmount,
        description: `${t("wallet.transaction.withdrawal")} - ${withdrawNetwork.toUpperCase()}`,
        status: "pending",
        network: withdrawNetwork as "trx" | "sol" | "bsc",
        destinationAddress: withdrawAddress,
      })

      updateUserBalance(user.id, newBalance)
      refreshAuth()

      setIsProcessing(false)
      setWithdrawSuccess(true)

      setTimeout(() => {
        toast({
          title: t("wallet.withdraw.pendingTitle"),
          description: t("wallet.withdraw.pendingDesc"),
        })

        setWithdrawAddress("")
        setWithdrawAmount("")
        setWithdrawNetwork("")
        setWithdrawDialogOpen(false)
        setWithdrawSuccess(false)
        setTransactions(getTransactions(user.id))
      }, 2000)
    }, 2000)
  }

  const handleMaxAmount = () => {
    const maxWithdrawable = Math.max(0, user.balance - 1) // Reserve 1 USDT for fee
    setWithdrawAmount(maxWithdrawable.toFixed(2))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (Number.parseFloat(value) >= 0 && !Number.isNaN(Number.parseFloat(value)))) {
      setWithdrawAmount(value)
    }
  }

  const withdrawalFee = 1
  const amountToReceive = Number.parseFloat(withdrawAmount) || 0

  const filteredTransactions = transactions.filter((transaction) => {
    if (transaction.type !== "deposit" && transaction.type !== "withdrawal") return false
    if (transactionFilter === "all") return true
    return transaction.type === transactionFilter
  })

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("wallet.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("wallet.subtitle")}</p>
        </div>

        {/* Balance Card with Action Buttons */}
        <Card className="glass-card border-primary/30 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/20 flex items-center justify-center glow-effect">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("wallet.totalBalance")}</p>
              <p className="text-4xl sm:text-5xl font-bold text-primary text-glow">{user.balance.toFixed(2)} USDT</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
              <Button
                onClick={() => setDepositDialogOpen(true)}
                className="flex-1 bg-chart-2 hover:bg-chart-2/90 text-white h-11 sm:h-12"
              >
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("wallet.deposit")}
              </Button>
              <Button
                onClick={() => setWithdrawDialogOpen(true)}
                className="flex-1 bg-chart-1 hover:bg-chart-1/90 text-white h-11 sm:h-12"
              >
                <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("wallet.withdraw")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="glass-card border-primary/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold">{t("wallet.transactionHistory")}</h2>

            <Tabs
              value={transactionFilter}
              onValueChange={(v) => setTransactionFilter(v as "all" | "deposit" | "withdrawal")}
            >
              <TabsList className="glass-card border-primary/20 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  {t("wallet.filter.all")}
                </TabsTrigger>
                <TabsTrigger value="deposit" className="text-xs sm:text-sm">
                  {t("wallet.filter.deposits")}
                </TabsTrigger>
                <TabsTrigger value="withdrawal" className="text-xs sm:text-sm">
                  {t("wallet.filter.withdrawals")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">{t("wallet.noTransactions")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("wallet.noTransactions.desc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "deposit" ? "bg-chart-2/20" : "bg-chart-1/20"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
                      ) : (
                        <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 text-chart-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold">
                        {t(`wallet.transaction.${transaction.type}`)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-base sm:text-lg ${transaction.type === "deposit" ? "text-chart-2" : "text-chart-1"}`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}
                      {transaction.amount.toFixed(2)} USDT
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("wallet.deposit.title")}</DialogTitle>
              <DialogDescription>{t("wallet.deposit.selectNetwork")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                {/* Currency Selector (Only USDT) */}
                <div className="space-y-2">
                  <Label>{t("wallet.deposit.selectCurrency")}</Label>
                  <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("wallet.deposit.selectCurrency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdt">
                        <div className="flex items-center gap-2">
                          <Image src="/images/tether-logo.webp" alt="USDT" width={16} height={16} className="w-4 h-4" />
                          <span>USDT</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Network Selector */}
                <div className="space-y-2">
                  <Label>{t("wallet.deposit.selectNetwork")}</Label>
                  <Select value={depositNetwork} onValueChange={(v) => setDepositNetwork(v as "trx" | "sol" | "bsc")}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("wallet.deposit.selectNetwork")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bsc">{t("wallet.deposit.network.bsc")}</SelectItem>
                      <SelectItem value="trx">{t("wallet.deposit.network.trc20")}</SelectItem>
                      <SelectItem value="sol">Solana (SOL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-secondary/30 border border-primary/10">
                <p className="text-sm font-medium">{t("wallet.deposit.scanQR")}</p>
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="QR Code"
                    className="w-48 h-48 rounded-lg bg-white p-2"
                  />
                )}
              </div>

              {/* Wallet Address */}
              {depositNetwork && (
                <div className="space-y-2">
                  <Label>{t("wallet.deposit.address")}</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={currentDepositAddress || getUserWalletAddress(user, depositNetwork as "trx" | "sol" | "bsc")} 
                      readOnly 
                      className="font-mono text-sm" 
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                      {addressCopied ? <CheckCircle2 className="w-4 h-4 text-chart-2" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("wallet.deposit.confirmationTime")}:</span>
                  <span className="font-medium">
                    {depositNetwork === "bsc"
                      ? t("wallet.deposit.confirmationTime.bsc")
                      : depositNetwork === "trc20"
                        ? t("wallet.deposit.confirmationTime.trc20")
                        : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{t("wallet.deposit.minAmount")}:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex">
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t("wallet.deposit.minAmountTooltip")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-medium">10 USDT</span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">{t("wallet.deposit.important")}</p>
                  <p className="text-xs text-muted-foreground">{t("wallet.deposit.warning")}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("wallet.withdraw.title")}</DialogTitle>
            </DialogHeader>

            {isProcessing || withdrawSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                {isProcessing && (
                  <>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <ArrowUpFromLine className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">{t("wallet.withdraw.processingTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("wallet.withdraw.processingDesc")}</p>
                    </div>
                  </>
                )}
                {withdrawSuccess && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-chart-4/20 flex items-center justify-center animate-in zoom-in duration-300">
                      <ArrowUpCircle className="w-12 h-12 text-chart-4" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-chart-4">{t("wallet.withdraw.pendingTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("wallet.withdraw.pendingDesc")}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recipient Address */}
                <div className="space-y-2">
                  <Label>{t("wallet.withdraw.recipientAddress")}</Label>
                  <Input
                    placeholder={t("wallet.withdraw.recipientPlaceholder")}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label>{t("wallet.withdraw.amount")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t("wallet.withdraw.minAmountPlaceholder")}
                      value={withdrawAmount}
                      onChange={handleAmountChange}
                      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button variant="outline" onClick={handleMaxAmount}>
                      {t("wallet.withdraw.all")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("wallet.withdraw.availableBalance")}: {user.balance.toFixed(2)} USDT
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Token Selector (Only USDT) */}
                  <div className="space-y-2">
                    <Label>{t("wallet.withdraw.selectToken")}</Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("wallet.withdraw.selectToken")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdt">
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/tether-logo.webp"
                              alt="USDT"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span>USDT</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Network Selector */}
                  <div className="space-y-2">
                    <Label>{t("wallet.withdraw.selectNetwork")}</Label>
                    <Select value={withdrawNetwork} onValueChange={(v) => setWithdrawNetwork(v as "trx" | "sol" | "bsc")}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("wallet.withdraw.selectNetwork")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bsc">{t("wallet.withdraw.network.bsc")}</SelectItem>
                        <SelectItem value="trx">{t("wallet.withdraw.network.trc20")}</SelectItem>
                        <SelectItem value="sol">Solana (SOL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-primary/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("wallet.withdraw.youWillReceive")}:</span>
                    <span className="font-bold text-primary">{amountToReceive.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("wallet.withdraw.fee")}:</span>
                    <span className="font-medium">{withdrawalFee} USDT</span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <Button
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="w-full bg-chart-1 hover:bg-chart-1/90 text-white"
                >
                  {t("wallet.withdraw.button")}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
