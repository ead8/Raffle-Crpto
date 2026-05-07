"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getStoredAuth, setStoredAuth } from "@/lib/auth"

export function ComplianceModal() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show modal if user has not accepted terms yet
    const auth = getStoredAuth()
    if (auth.isAuthenticated && auth.user && !auth.user.hasAcceptedTerms) {
      setShow(true)
    }
  }, [user])

  const handleAccept = () => {
    const auth = getStoredAuth()
    if (auth.user) {
      auth.user.hasAcceptedTerms = true
      setStoredAuth(auth)
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md glass-card border border-primary/30 rounded-2xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl font-semibold">Age & Terms Verification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To continue, please confirm that you meet the requirements to participate on this platform.
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {[
            "I am 18 years of age or older",
            "Participation in crypto raffles is legal in my jurisdiction",
            "I have read and agree to the Terms of Service and Privacy Policy",
            "I understand that participation involves financial risk",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed border-t border-border/50 pt-4">
          By clicking "I Agree & Continue" you confirm all of the above statements are true.
        </p>

        {/* Action */}
        <Button
          className="w-full bg-primary text-primary-foreground font-semibold h-12"
          onClick={handleAccept}
        >
          <Shield className="w-4 h-4 mr-2" />
          I Agree &amp; Continue
        </Button>
      </div>
    </div>
  )
}
