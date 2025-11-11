"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, Shield, Bell, Globe, Trash2, Check, X, Copy, Mail, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getAllUsers } from "@/lib/auth"
import { triggerSync } from "@/lib/sync"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const { t, language, setLanguage } = useI18n()
  const { toast } = useToast()

  // Profile state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [showSaveProfileDialog, setShowSaveProfileDialog] = useState(false)

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorVerified, setTwoFactorVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [secretKey, setSecretKey] = useState("JBSWY3DPEHPK3PXP2JBSWY3DPEHPK3PXP")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  // Notification state
  const [notifications, setNotifications] = useState({
    raffles: true,
    deposits: true,
    withdrawals: true,
    newsletter: false,
  })

  const [show2FAVerifyDelete, setShow2FAVerifyDelete] = useState(false)
  const [deleteVerificationCode, setDeleteVerificationCode] = useState(["", "", "", "", "", ""])
  const deleteInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [showResetSecurity, setShowResetSecurity] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [emailCode, setEmailCode] = useState(["", "", "", "", "", ""])
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [countdown, setCountdown] = useState(58)

  useEffect(() => {
    if (showEmailVerification && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showEmailVerification, countdown])

  const passwordRequirements = {
    length: newPassword.length >= 10 && newPassword.length <= 128,
    letter: /[a-zA-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }

  const isPasswordValid =
    passwordRequirements.length &&
    passwordRequirements.letter &&
    passwordRequirements.number &&
    passwordRequirements.special

  if (!user) return null

  const handleSaveProfile = () => {
    setIsSavingProfile(true)

    try {
      // Update user in localStorage
      const users = getAllUsers()
      const userIndex = users.findIndex((u) => u.id === user.id)

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, email }
        localStorage.setItem("usdt_lottery_users", JSON.stringify(users))

        // Update auth state
        const updatedUser = users[userIndex]
        setUser(updatedUser)
        localStorage.setItem("usdt_lottery_auth", JSON.stringify({ user: updatedUser, isAuthenticated: true }))

        triggerSync("users")

        toast({
          title: t("settings.profile.saved"),
          description: t("settings.profile.saved.desc"),
        })
      }
    } catch (error) {
      toast({
        title: t("wallet.error"),
        description: t("settings.profile.error"),
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
      setShowSaveProfileDialog(false)
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast({
        title: t("wallet.error"),
        description: t("settings.security.error.currentPassword"),
        variant: "destructive",
      })
      return
    }

    if (!isPasswordValid) {
      toast({
        title: t("wallet.error"),
        description: t("register.password.weak"),
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("wallet.error"),
        description: t("login.resetPassword.error.passwordMismatch"),
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      // In a real app, we would verify the current password and update it
      // For this demo, we just show success
      setTimeout(() => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsChangingPassword(false)
        setShowChangePasswordDialog(false)

        toast({
          title: t("settings.security.passwordChanged"),
          description: t("settings.security.passwordChanged.desc"),
        })
      }, 1000)
    } catch (error) {
      setIsChangingPassword(false)
      toast({
        title: t("wallet.error"),
        description: t("settings.security.error.generic"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(false)
    setShow2FAVerifyDelete(true)
  }

  const handleVerifyDeleteAccount = () => {
    const code = deleteVerificationCode.join("")
    if (code.length === 6) {
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada exitosamente",
        variant: "destructive",
      })
      setShow2FAVerifyDelete(false)
      setDeleteVerificationCode(["", "", "", "", "", ""])
    } else {
      toast({
        title: "Error",
        description: "Por favor ingresa un código válido de 6 dígitos",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...deleteVerificationCode]
    newCode[index] = value.slice(-1)
    setDeleteVerificationCode(newCode)

    if (value && index < 5) {
      deleteInputRefs.current[index + 1]?.focus()
    }
  }

  const handleDeleteCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !deleteVerificationCode[index] && index > 0) {
      deleteInputRefs.current[index - 1]?.focus()
    }
  }

  const handleTroublesWithVerification = () => {
    setShow2FAVerifyDelete(false)
    setShowResetSecurity(true)
  }

  const handleConfirmResetSecurity = () => {
    setShowResetSecurity(false)
    setShowEmailVerification(true)
    setCountdown(58)
  }

  const handleEmailCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...emailCode]
    newCode[index] = value.slice(-1)
    setEmailCode(newCode)

    if (value && index < 5) {
      emailInputRefs.current[index + 1]?.focus()
    }
  }

  const handleEmailCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !emailCode[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendCode = () => {
    if (countdown === 0) {
      setCountdown(58)
      toast({
        title: "Código reenviado",
        description: "Se ha enviado un nuevo código a tu correo electrónico",
      })
    }
  }

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem("notification_preferences", JSON.stringify(updated))
      return updated
    })

    toast({
      title: t("settings.notifications.updated"),
      description: t("settings.notifications.updated.desc"),
    })
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText((user.numericId || 999999).toString())
    toast({
      title: "ID copiado",
      description: "ID copiado al portapapeles",
    })
  }

  const handle2FAToggle = () => {
    if (!twoFactorEnabled) {
      // Generate QR code when enabling 2FA
      const email = "usuario@example.com"
      const issuer = "USDT Sorteo"
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secretKey}&issuer=${encodeURIComponent(issuer)}`
      setQrCodeUrl(qrUrl)
      setShow2FASetup(true)
    } else {
      setTwoFactorEnabled(false)
      toast({
        title: "2FA desactivado",
        description: "La autenticación de dos factores ha sido desactivada",
      })
    }
  }

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true)
      setShow2FASetup(false)
      setVerificationCode("")
      toast({
        title: "2FA activado",
        description: "La autenticación de dos factores ha sido configurada correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de 6 dígitos válido",
        variant: "destructive",
      })
    }
  }

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey)
    toast({
      title: "Copiado",
      description: "Clave secreta copiada al portapapeles",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("settings.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("settings.profile.title")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.profile.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs sm:text-sm text-muted-foreground">ID:</p>
            <p className="font-mono text-xs sm:text-sm">{user.numericId || 999999}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId} className="hover:bg-primary/10 h-7 sm:h-8">
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.account.memberSince")}</p>
              <p className="text-xs sm:text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.account.status")}</p>
              <p className="text-xs sm:text-sm text-green-500 font-medium">{t("wallet.active")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t("settings.profile.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("settings.profile.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <Button
            onClick={() => setShowSaveProfileDialog(true)}
            disabled={isSavingProfile || (name === user.name && email === user.email)}
            className="bg-primary hover:bg-primary/90"
          >
            {isSavingProfile ? t("settings.profile.saving") : t("settings.profile.save")}
          </Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-chart-1/20 flex items-center justify-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-chart-1" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("settings.security.title")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.security.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">Autenticación de dos factores (2FA)</span>
              </div>
              <p className="text-sm text-muted-foreground">Configura Google Authenticator para mayor seguridad</p>
            </div>
            <button
              onClick={handle2FAToggle}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                twoFactorEnabled ? "bg-primary" : "bg-gray-300",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  twoFactorEnabled ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Cambiar Contraseña</h3>

            <div className="space-y-2">
              <Label htmlFor="current-password">{t("settings.security.currentPassword")}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t("settings.security.newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("settings.security.confirmPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
              />
            </div>

            {newPassword && (
              <div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-primary/10">
                <p className="text-sm font-medium mb-2">{t("register.password.requirements")}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    {passwordRequirements.length ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={passwordRequirements.length ? "text-green-500" : "text-muted-foreground"}>
                      {t("register.password.length")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordRequirements.letter ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={passwordRequirements.letter ? "text-green-500" : "text-muted-foreground"}>
                      {t("register.password.letter")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordRequirements.number ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={passwordRequirements.number ? "text-green-500" : "text-muted-foreground"}>
                      {t("register.password.number")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordRequirements.special ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={passwordRequirements.special ? "text-green-500" : "text-muted-foreground"}>
                      {t("register.password.special")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowChangePasswordDialog(true)}
              disabled={isChangingPassword || !currentPassword || !isPasswordValid || newPassword !== confirmPassword}
              className="bg-chart-1 hover:bg-chart-1/90"
            >
              {isChangingPassword ? t("settings.security.changing") : t("settings.security.changePassword")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-chart-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("settings.language.title")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.language.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.language.select")}</Label>
            <Select value={language} onValueChange={(value: "es" | "en") => setLanguage(value)}>
              <SelectTrigger className="bg-secondary/50 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card border-primary/20 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-chart-2" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("settings.notifications.title")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.notifications.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex-1 pr-4">
              <p className="text-sm sm:text-base font-medium">{t("settings.notifications.raffles")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.notifications.raffles.desc")}</p>
            </div>
            <Switch checked={notifications.raffles} onCheckedChange={() => handleToggleNotification("raffles")} />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex-1 pr-4">
              <p className="text-sm sm:text-base font-medium">{t("settings.notifications.deposits")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.notifications.deposits.desc")}</p>
            </div>
            <Switch checked={notifications.deposits} onCheckedChange={() => handleToggleNotification("deposits")} />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex-1 pr-4">
              <p className="text-sm sm:text-base font-medium">{t("settings.notifications.withdrawals")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.notifications.withdrawals.desc")}</p>
            </div>
            <Switch
              checked={notifications.withdrawals}
              onCheckedChange={() => handleToggleNotification("withdrawals")}
            />
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex-1 pr-4">
              <p className="text-sm sm:text-base font-medium">{t("settings.notifications.newsletter")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.notifications.newsletter.desc")}</p>
            </div>
            <Switch checked={notifications.newsletter} onCheckedChange={() => handleToggleNotification("newsletter")} />
          </div>

          {/* Browser Notifications */}
          {typeof window !== "undefined" && "Notification" in window && (
            <div className="p-3 sm:p-4 rounded-lg bg-secondary/30 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 pr-4">
                  <p className="text-sm sm:text-base font-medium">Browser Notifications</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive notifications even when the app is closed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {Notification.permission === "granted" ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-chart-2/20 text-chart-2">Enabled</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const { requestNotificationPermission } = await import("@/lib/notifications")
                        await requestNotificationPermission()
                        toast({
                          title: Notification.permission === "granted" ? "Notifications enabled" : "Permission denied",
                          description:
                            Notification.permission === "granted"
                              ? "You'll receive browser notifications"
                              : "Please enable notifications in your browser settings",
                        })
                      }}
                      className="text-xs"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-red-500/20 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-red-500">{t("settings.danger.title")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("settings.danger.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-muted-foreground mb-4">{t("settings.danger.deleteAccount.desc")}</p>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setShowDeleteAccountDialog(true)}
            >
              {t("settings.danger.deleteAccount")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation dialogs */}
      {/* Save Profile Confirmation */}
      <AlertDialog open={showSaveProfileDialog} onOpenChange={setShowSaveProfileDialog}>
        <AlertDialogContent className="glass-card border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambios</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas guardar los cambios en tu perfil?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
              Guardar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Confirmation */}
      <AlertDialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <AlertDialogContent className="glass-card border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cambiar tu contraseña? Deberás usar la nueva contraseña en tu próximo inicio
              de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePassword} className="bg-chart-1 hover:bg-chart-1/90">
              Cambiar contraseña
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent className="glass-card border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Eliminar cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, incluyendo tu balance,
              historial de transacciones y participaciones en sorteos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
              Eliminar cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {show2FAVerifyDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Verificación de seguridad</h2>
              <button
                onClick={() => {
                  setShow2FAVerifyDelete(false)
                  setDeleteVerificationCode(["", "", "", "", "", ""])
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>Código de verificación de Google</p>
              </div>

              {/* 6-digit code input boxes */}
              <div className="flex gap-2 justify-center">
                {deleteVerificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (deleteInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDeleteCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleDeleteCodeKeyDown(index, e)}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-semibold rounded-lg",
                      "bg-secondary border-2 border-primary/20 focus:border-primary",
                      "focus:outline-none transition-colors",
                    )}
                  />
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleTroublesWithVerification}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Tienes problemas con la verificación?
                </button>
              </div>

              <Button
                onClick={handleVerifyDeleteAccount}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={deleteVerificationCode.join("").length !== 6}
              >
                Verificar y eliminar cuenta
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResetSecurity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Restablecer la configuración de seguridad</h2>
              <button
                onClick={() => setShowResetSecurity(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">Google Authenticator no funciona. Me gustaría restablecerlo.</p>
            </div>

            <Button onClick={handleConfirmResetSecurity} className="w-full bg-primary hover:bg-primary/90">
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Verificación de seguridad</h2>
              <button
                onClick={() => {
                  setShowEmailVerification(false)
                  setEmailCode(["", "", "", "", "", ""])
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>
                  Se enviará un código de verificación a{" "}
                  <span className="font-medium text-foreground">
                    {email.slice(0, 3)}****{email.slice(email.indexOf("@"))}
                  </span>
                </p>
              </div>

              {/* 6-digit code input boxes */}
              <div className="flex gap-2 justify-center">
                {emailCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (emailInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleEmailCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleEmailCodeKeyDown(index, e)}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-semibold rounded-lg",
                      "bg-secondary border-2 border-primary/20 focus:border-primary",
                      "focus:outline-none transition-colors",
                    )}
                  />
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  className={cn(
                    "text-sm hover:underline",
                    countdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary",
                  )}
                >
                  ¿No puede recibir el código de verificación? {countdown > 0 && `${countdown}s`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {show2FASetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full space-y-6 border border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Configurar 2FA</h2>
              <button
                onClick={() => {
                  setShow2FASetup(false)
                  setVerificationCode("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Escanea el código QR con Google Authenticator</p>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Clave secreta (manual)</Label>
                <div className="flex gap-2">
                  <Input value={secretKey} readOnly className="font-mono text-sm" />
                  <Button onClick={copySecretKey} variant="outline" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Código de verificación</Label>
                <Input
                  type="text"
                  placeholder="Ingresa el código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-wider"
                />
              </div>

              <Button onClick={handleVerify2FA} className="w-full" disabled={verificationCode.length !== 6}>
                Verificar y activar 2FA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}