"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { register } from "@/lib/auth"
import { validateReferralCode, createReferral } from "@/lib/referrals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, ArrowLeft, Check, Eye, EyeOff, X, Gift, Mail } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { refreshAuth } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const passwordRequirements = {
    length: password.length >= 10 && password.length <= 128,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every((req) => req)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      validateCode(refCode)
    }
  }, [])

  const validateCode = (code: string) => {
    if (!code) {
      setReferralValid(null)
      return
    }

    const referrerId = validateReferralCode(code)
    setReferralValid(referrerId !== null)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      toast({
        title: t("register.error"),
        description: t("register.mustAcceptTerms"),
        variant: "destructive",
      })
      return
    }

    if (!isPasswordValid) {
      toast({
        title: t("register.error"),
        description: t("register.password.weak"),
        variant: "destructive",
      })
      return
    }

    if (referralCode && !referralValid) {
      toast({
        title: t("register.error"),
        description: t("register.referralCode.invalid"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await register(email, password, name)

      if (result.needsEmailConfirmation) {
        setEmailSent(true)
        toast({
          title: t("verification.codeSent"),
          description: t("verification.codeSent.desc"),
        })
        return
      }

      if (result.user) {
        if (referralCode && referralValid) {
          const referrerId = validateReferralCode(referralCode)
          if (referrerId) {
            createReferral(referrerId, result.user.id, referralCode)
          }
        }
        await refreshAuth()
        toast({
          title: t("register.success"),
          description: t("register.success.desc", { name: result.user.name }),
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: t("register.error"),
        description: error instanceof Error ? error.message : t("register.error.desc"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#26A17B] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#50AF95] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"></div>
        </div>

        <Card className="glass-card border-primary/30 p-8 w-full max-w-md relative z-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("verification.title")}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
            Click the link in the email to activate your account, then come back and log in.
          </p>
          <Link href="/login">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              {t("login.button")}
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative overflow-hidden flex items-center justify-center p-4">
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
          {t("register.backToHome")}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center glow-effect">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("register.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("register.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("register.name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("register.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("register.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("register.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("register.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("register.passwordPlaceholder")}
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

            {password && (
              <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-2">{t("register.password.requirements")}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                        passwordRequirements.length ? "bg-primary text-white" : "bg-secondary border border-primary/20"
                      }`}
                    >
                      {passwordRequirements.length && <Check className="w-3 h-3" />}
                    </div>
                    <span className={passwordRequirements.length ? "text-primary" : "text-muted-foreground"}>
                      {t("register.password.length")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                        passwordRequirements.letter ? "bg-primary text-white" : "bg-secondary border border-primary/20"
                      }`}
                    >
                      {passwordRequirements.letter && <Check className="w-3 h-3" />}
                    </div>
                    <span className={passwordRequirements.letter ? "text-primary" : "text-muted-foreground"}>
                      {t("register.password.letter")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                        passwordRequirements.number ? "bg-primary text-white" : "bg-secondary border border-primary/20"
                      }`}
                    >
                      {passwordRequirements.number && <Check className="w-3 h-3" />}
                    </div>
                    <span className={passwordRequirements.number ? "text-primary" : "text-muted-foreground"}>
                      {t("register.password.number")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                        passwordRequirements.special ? "bg-primary text-white" : "bg-secondary border border-primary/20"
                      }`}
                    >
                      {passwordRequirements.special && <Check className="w-3 h-3" />}
                    </div>
                    <span className={passwordRequirements.special ? "text-primary" : "text-muted-foreground"}>
                      {t("register.password.special")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">{t("register.referralCode")}</Label>
            <div className="relative">
              <Input
                id="referralCode"
                type="text"
                placeholder={t("register.referralCodePlaceholder")}
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase())
                  validateCode(e.target.value.toUpperCase())
                }}
                className={`bg-secondary/50 border-primary/20 focus:border-primary uppercase ${
                  referralValid === true ? "border-chart-2" : referralValid === false ? "border-destructive" : ""
                }`}
              />
              {referralValid === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-chart-2" />
                </div>
              )}
              {referralValid === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-5 h-5 text-destructive" />
                </div>
              )}
            </div>
            {referralValid === true && <p className="text-xs text-chart-2">{t("register.referralCode.valid")}</p>}
            {referralValid === false && (
              <p className="text-xs text-destructive">{t("register.referralCode.invalid")}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1 data-[state=unchecked]:border-white data-[state=unchecked]:bg-white/10"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              {t("register.acceptTerms")}{" "}
              <Link href="/terms" className="text-primary hover:underline" target="_blank">
                {t("register.termsOfUse")}
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white glow-effect"
            disabled={loading}
          >
            {loading ? (
              t("register.buttonLoading")
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 animate-bounce" />
                {t("register.button")}
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("register.haveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("register.loginHere")}
          </Link>
        </p>
      </Card>
    </div>
  )
}
