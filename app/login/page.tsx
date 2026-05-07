"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, requestPasswordReset } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft, Eye, EyeOff, X, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)
      toast({
        title: t("login.welcomeBack"),
        description: t("login.welcomeBack.desc", { name: user.name }),
      })
      router.push(user.role === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      const description =
        error instanceof Error ? error.message : t("login.error.generic")
      toast({
        title: t("login.error"),
        description,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast({
        title: t("login.error"),
        description: t("login.resetPassword.error.invalidEmail.desc"),
        variant: "destructive",
      })
      return
    }
    setResetLoading(true)
    try {
      await requestPasswordReset(resetEmail)
      setResetSent(true)
    } catch (error) {
      toast({
        title: t("login.error"),
        description: error instanceof Error ? error.message : t("login.error.generic"),
        variant: "destructive",
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false)
    setResetEmail("")
    setResetSent(false)
  }

  return (
    <div className="min-h-screen mesh-bg relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/60 rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"></div>
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

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("login.noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("login.registerHere")}
          </Link>
        </p>
      </Card>

      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/30">
          {!resetSent ? (
            <>
              <DialogHeader>
                <DialogTitle>{t("login.resetPassword")}</DialogTitle>
                <DialogDescription>
                  {t("login.resetPassword.enterEmail.desc")}
                </DialogDescription>
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
              <Button
                onClick={handleSendResetEmail}
                disabled={resetLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {resetLoading ? "Sending..." : t("login.resetPassword.sendCode")}
              </Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <DialogTitle className="text-2xl mb-2">
                      {t("login.resetPassword.codeSentSuccess")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("login.resetPassword.codeSentSuccess.desc")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Button
                onClick={handleCloseForgotPassword}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {t("login.button")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
