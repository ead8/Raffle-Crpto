"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("register.backToHome")}
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("privacy.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("privacy.lastUpdated")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.intro.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.intro.content")}</p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.collection.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t("privacy.collection.personal")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.collection.personal.content")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("privacy.collection.wallet")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.collection.wallet.content")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("privacy.collection.activity")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.collection.activity.content")}</p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.use.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.use.content")}</p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.security.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.security.content")}</p>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.sharing.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.sharing.content")}</p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.rights.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.rights.content")}</p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("privacy.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("privacy.contact.content")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
