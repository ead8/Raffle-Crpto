"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Copy, Check, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function Verify2FAPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [secretKey, setSecretKey] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Generate a random 32-character secret key (Base32 format)
    const generateSecret = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
      let secret = ""
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return secret
    }

    const secret = generateSecret()
    setSecretKey(secret)

    // Generate QR code URL for Google Authenticator
    // Format: otpauth://totp/USDT Lottery:user@example.com?secret=SECRET&issuer=USDT Lottery
    const email = "user@example.com" // This would come from the logged-in user
    const issuer = "USDT Lottery"
    const otpUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`

    // Use Google Charts API to generate QR code
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(otpUrl)}&choe=UTF-8`
    setQrCodeUrl(qrUrl)
  }, [])

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey)
    setCopied(true)
    toast({
      title: "Código copiado",
      description: "La clave secreta ha sido copiada al portapapeles",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor ingresa un código de 6 dígitos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate verification (in production, this would verify against the server)
    setTimeout(() => {
      // For demo purposes, accept any 6-digit code
      toast({
        title: "Verificación exitosa",
        description: "2FA ha sido configurado correctamente",
      })

      // Redirect to dashboard after successful verification
      router.push("/dashboard")
    }, 1000)
  }

  const handleSkip = () => {
    // Allow skipping for now (in production, this might not be allowed)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f1a] via-[#0d1b16] to-[#0a1410] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#26A17B] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#50AF95] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"></div>
      </div>

      <Card className="glass-card border-primary/30 p-8 w-full max-w-lg relative z-10">
        <button
          onClick={handleSkip}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Omitir por ahora
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center glow-effect">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Verificación 2FA</h1>
            <p className="text-sm text-muted-foreground">Configura Google Authenticator</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold">Escanea el código QR</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Abre Google Authenticator en tu teléfono y escanea este código QR
            </p>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg ml-8">
              {qrCodeUrl && (
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code for 2FA"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Step 2: Manual Entry */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="font-semibold">O ingresa la clave manualmente</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Si no puedes escanear el código, ingresa esta clave en Google Authenticator
            </p>

            <div className="ml-8 p-4 bg-secondary/30 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-primary break-all">{secretKey}</code>
                <Button variant="ghost" size="sm" onClick={handleCopySecret} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Enter Verification Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="font-semibold">Ingresa el código de verificación</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Ingresa el código de 6 dígitos que aparece en Google Authenticator
            </p>

            <div className="ml-8 space-y-2">
              <Label htmlFor="verification-code">Código de verificación</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="bg-secondary/50 border-primary/20 focus:border-primary text-center text-2xl tracking-widest"
              />
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full bg-primary hover:bg-primary/90 text-white glow-effect"
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? "Verificando..." : "Verificar y Activar 2FA"}
          </Button>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400">
              <strong>Nota:</strong> Una vez activado, necesitarás ingresar el código de Google Authenticator cada vez
              que inicies sesión para mayor seguridad.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
