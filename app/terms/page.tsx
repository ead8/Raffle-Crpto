"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("terms.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("terms.lastUpdated")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Acceptance of Terms */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.acceptance.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.acceptance.content")}</p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.eligibility.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.eligibility.content")}</p>
            </CardContent>
          </Card>

          {/* Geographic Restrictions */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.restrictions.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.restrictions.content")}</p>
            </CardContent>
          </Card>

          {/* User Account */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.account.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.account.content")}</p>
            </CardContent>
          </Card>

          {/* Raffles and Tickets */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.raffles.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.raffles.content")}</p>
            </CardContent>
          </Card>

          {/* Payments and Transactions */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.payments.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.payments.content")}</p>
            </CardContent>
          </Card>

          {/* Prohibited Conduct */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.prohibited.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.prohibited.content")}</p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.liability.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.liability.content")}</p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.termination.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.termination.content")}</p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.changes.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.changes.content")}</p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>{t("terms.contact.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("terms.contact.content")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
