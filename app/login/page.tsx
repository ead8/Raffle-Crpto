"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { login, generatePasswordResetCode, verifyPasswordResetCode, resetPassword } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft, Eye, EyeOff, X, Info, Check, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetStep, setResetStep] = useState<"email" | "code" | "password" | "success">("email")
  const [resetEmail, setResetEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [show2FAHelpModal, setShow2FAHelpModal] = useState(false)
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState<string[]>(["", "", "", "", "", ""])
  const [emailVerificationCode, setEmailVerificationCode] = useState<string[]>(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(58)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setAuth } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const [secretKey, setSecretKey] = useState("")
  const [copied, setCopied] = useState(false)

  const generateSecretKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    let secret = ""
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = login(email, password)
      if (user) {
        const has2FAEnabled = Math.random() > 0.5 // Simulate 50% of users having 2FA

        if (has2FAEnabled) {
          // Show 2FA modal instead of logging in directly
          setPendingUser(user)
          const secret = generateSecretKey()
          setSecretKey(secret)
          setShow2FAModal(true)
          setLoading(false)
        } else {
          // Normal login flow
          setAuth(user)
          toast({
            title: t("login.welcomeBack"),
            description: t("login.welcomeBack.desc", { name: user.name }),
          })
          router.push(user.role === "admin" ? "/admin" : "/dashboard")
        }
      } else {
        toast({
          title: t("login.error"),
          description: t("login.error.desc"),
          variant: "destructive",
        })
        setLoading(false)
      }
    } catch (error) {
      toast({
        title: t("login.error"),
        description: t("login.error.generic"),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...twoFactorCode]
    newCode[index] = value.slice(-1)
    setTwoFactorCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify2FA = () => {
    const code = twoFactorCode.join("")
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor ingresa un código de 6 dígitos",
        variant: "destructive",
      })
      return
    }

    setAuth(pendingUser)
    setShow2FAModal(false)
    toast({
      title: "Verificación exitosa",
      description: "Has iniciado sesión correctamente",
    })
    router.push(pendingUser.role === "admin" ? "/admin" : "/dashboard")
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey)
    setCopied(true)
    toast({
      title: "Copiado",
      description: "Clave secreta copiada al portapapeles",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendCode = () => {
    if (!resetEmail) {
      toast({
        title: t("login.error"),
        description: t("login.resetPassword.error.invalidEmail.desc"),
        variant: "destructive",
      })
      return
    }

    const code = generatePasswordResetCode(resetEmail)
    if (!code) {
      toast({
        title: t("login.resetPassword.error.invalidEmail"),
        description: t("login.resetPassword.error.invalidEmail.desc"),
        variant: "destructive",
      })
      return
    }

    setGeneratedCode(code)
    setResetStep("code")
    toast({
      title: t("login.resetPassword.codeSentSuccess"),
      description: t("login.resetPassword.codeSentSuccess.desc"),
    })
  }

  const handleVerifyCode = () => {
    if (!verifyPasswordResetCode(resetEmail, resetCode)) {
      toast({
        title: t("login.resetPassword.error.invalidCode"),
        description: t("login.resetPassword.error.invalidCode.desc"),
        variant: "destructive",
      })
      return
    }

    setResetStep("password")
  }

  const newPasswordRequirements = {
    length: newPassword.length >= 10 && newPassword.length <= 128,
    letter: /[a-zA-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }

  const isNewPasswordValid = Object.values(newPasswordRequirements).every((req) => req)

  const handleResetPassword = () => {
    if (!isNewPasswordValid) {
      toast({
        title: t("login.error"),
        description: t("register.password.weak"),
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("login.resetPassword.error.passwordMismatch"),
        description: t("login.resetPassword.error.passwordMismatch.desc"),
        variant: "destructive",
      })
      return
    }

    if (resetPassword(resetEmail, resetCode, newPassword)) {
      setResetStep("success")
    } else {
      toast({
        title: t("login.error"),
        description: t("login.resetPassword.error.invalidCode.desc"),
        variant: "destructive",
      })
    }
  }

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false)
    setResetStep("email")
    setResetEmail("")
    setResetCode("")
    setGeneratedCode("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleReset2FA = () => {
    setShow2FAHelpModal(false)
    setShowEmailVerificationModal(true)
    setResendTimer(58)
  }

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@")
    const maskedUsername = username.slice(0, 3) + "****" + username.slice(-1)
    return `${maskedUsername}@${domain}`
  }

  useEffect(() => {
    if (showEmailVerificationModal && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showEmailVerificationModal, resendTimer])

  const handleEmailCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...emailVerificationCode]
    newCode[index] = value.slice(-1)
    setEmailVerificationCode(newCode)

    if (value && index < 5) {
      emailInputRefs.current[index + 1]?.focus()
    }
  }

  const handleEmailKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !emailVerificationCode[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyEmailCode = () => {
    const code = emailVerificationCode.join("")
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor ingresa un código de 6 dígitos",
        variant: "destructive",
      })
      return
    }

    // Simulate successful verification
    setShowEmailVerificationModal(false)
    setShow2FAHelpModal(false)
    setShow2FAModal(false)
    setEmailVerificationCode(["", "", "", "", "", ""])
    toast({
      title: "2FA restablecido",
      description: "Tu autenticación de dos factores ha sido restablecida exitosamente",
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#26A17B] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#50AF95] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"></div>
      </div>

      <Card className="glass-card border-primary/30 p-8 w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("login.backToHome")}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center glow-effect">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("login.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("login.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-primary/20 focus:border-primary pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword("")}
                    className="p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
                    aria-label="Clear password"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white glow-effect"
            disabled={loading}
          >
            {loading ? t("login.buttonLoading") : t("login.button")}
          </Button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:underline"
            >
              {t("login.forgotPassword")}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">{t("login.testAccounts")}</p>
          <div className="space-y-1 text-xs font-mono">
            <p className="text-primary">{t("login.admin")}</p>
            <p className="text-primary">{t("login.user")}</p>
            <p className="text-muted-foreground">{t("login.anyPassword")}</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("login.noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("login.registerHere")}
          </Link>
        </p>
      </Card>

      {/* 2FA Verification Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Verificación de seguridad</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Código de verificación de Google
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* 6 separate input boxes */}
            <div className="flex gap-2 justify-center">
              {twoFactorCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold bg-secondary/50 border-2 border-primary/20 focus:border-primary rounded-lg"
                />
              ))}
            </div>

            {/* Help text */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShow2FAHelpModal(true)}
                className="text-sm text-primary hover:underline"
              >
                ¿Tienes problemas con la verificación?
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShow2FAModal(false)
                setTwoFactorCode(["", "", "", "", "", ""])
                setLoading(false)
              }}
              className="flex-1 border-primary/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerify2FA}
              disabled={twoFactorCode.some((digit) => !digit)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Verificar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30">
          {resetStep === "email" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("login.resetPassword")}</DialogTitle>
                <DialogDescription>{t("login.resetPassword.enterEmail.desc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t("login.email")}</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder={t("login.resetPassword.emailPlaceholder")}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="bg-secondary/50 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <Button onClick={handleSendCode} className="w-full bg-primary hover:bg-primary/90">
                {t("login.resetPassword.sendCode")}
              </Button>
            </>
          )}

          {resetStep === "code" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("login.resetPassword.verifyCode")}</DialogTitle>
                <DialogDescription>
                  {t("login.resetPassword.verifyCode.desc")} <span className="font-semibold">{resetEmail}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reset-code">{t("login.resetPassword.codeLabel")}</Label>
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t("login.resetPassword.codeSent")}
                    </span>
                  </div>
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder={t("login.resetPassword.codePlaceholder")}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="bg-secondary/50 border-primary/20 focus:border-primary text-center text-2xl tracking-widest"
                  />
                </div>

                {/* Demo code display */}
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-xs text-yellow-500">
                    {t("login.resetPassword.demoCode")} <span className="font-mono font-bold">{generatedCode}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setResetStep("email")}
                  className="flex-1 border-primary/20 hover:bg-secondary/50"
                >
                  {t("login.resetPassword.back")}
                </Button>
                <Button onClick={handleVerifyCode} className="flex-1 bg-primary hover:bg-primary/90">
                  {t("login.resetPassword.submit")}
                </Button>
              </div>
            </>
          )}

          {resetStep === "password" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("login.resetPassword.newPassword")}</DialogTitle>
                <DialogDescription>{t("login.resetPassword.newPassword.desc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("login.resetPassword.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("login.resetPassword.newPasswordPlaceholder")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-secondary/50 border-primary/20 focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password requirements checklist */}
                {newPassword && (
                  <div className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                    <p className="text-xs text-muted-foreground mb-2">{t("register.password.requirements")}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                            newPasswordRequirements.length
                              ? "bg-primary text-white"
                              : "bg-secondary border border-primary/20"
                          }`}
                        >
                          {newPasswordRequirements.length && <Check className="w-3 h-3" />}
                        </div>
                        <span className={newPasswordRequirements.length ? "text-primary" : "text-muted-foreground"}>
                          {t("register.password.length")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                            newPasswordRequirements.letter
                              ? "bg-primary text-white"
                              : "bg-secondary border border-primary/20"
                          }`}
                        >
                          {newPasswordRequirements.letter && <Check className="w-3 h-3" />}
                        </div>
                        <span className={newPasswordRequirements.letter ? "text-primary" : "text-muted-foreground"}>
                          {t("register.password.letter")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                            newPasswordRequirements.number
                              ? "bg-primary text-white"
                              : "bg-secondary border border-primary/20"
                          }`}
                        >
                          {newPasswordRequirements.number && <Check className="w-3 h-3" />}
                        </div>
                        <span className={newPasswordRequirements.number ? "text-primary" : "text-muted-foreground"}>
                          {t("register.password.number")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                            newPasswordRequirements.special
                              ? "bg-primary text-white"
                              : "bg-secondary border border-primary/20"
                          }`}
                        >
                          {newPasswordRequirements.special && <Check className="w-3 h-3" />}
                        </div>
                        <span className={newPasswordRequirements.special ? "text-primary" : "text-muted-foreground"}>
                          {t("register.password.special")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("login.resetPassword.confirmPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("login.resetPassword.confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-secondary/50 border-primary/20 focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setResetStep("code")}
                  className="flex-1 border-primary/20 hover:bg-secondary/50"
                >
                  {t("login.resetPassword.back")}
                </Button>
                <Button
                  onClick={handleResetPassword}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!isNewPasswordValid || newPassword !== confirmPassword}
                >
                  {t("login.resetPassword.resetButton")}
                </Button>
              </div>
            </>
          )}

          {resetStep === "success" && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <DialogTitle className="text-2xl mb-2">{t("login.resetPassword.success")}</DialogTitle>
                    <DialogDescription>{t("login.resetPassword.success.desc")}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Button onClick={handleCloseForgotPassword} className="w-full bg-primary hover:bg-primary/90">
                {t("login.button")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={show2FAHelpModal} onOpenChange={setShow2FAHelpModal}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Restablecer la configuración de seguridad</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm">Google Authenticator no funciona. Me gustaría restablecerlo.</p>
            </div>
          </div>

          <Button onClick={handleReset2FA} className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
            Confirmar
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailVerificationModal} onOpenChange={setShowEmailVerificationModal}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30">
          <button
            onClick={() => setShowEmailVerificationModal(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Verificación de seguridad</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Email info */}
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                Se enviará un código de verificación a{" "}
                <span className="font-semibold text-foreground">
                  {maskEmail(pendingUser?.email || "test@email.com")}
                </span>
              </p>
            </div>

            {/* 6 separate input boxes */}
            <div className="flex gap-2 justify-center">
              {emailVerificationCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    emailInputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleEmailCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleEmailKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold bg-secondary/50 border-2 border-primary/20 focus:border-primary rounded-lg"
                />
              ))}
            </div>

            {/* Resend timer */}
            <div className="text-center text-sm text-muted-foreground">
              ¿No puede recibir el código de verificación?{" "}
              <span className="text-foreground font-medium">{resendTimer}s</span>
            </div>
          </div>

          <Button
            onClick={handleVerifyEmailCode}
            disabled={emailVerificationCode.some((digit) => !digit)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Verificar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
