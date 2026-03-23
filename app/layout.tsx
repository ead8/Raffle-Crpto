import type React from "react"
import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Sans } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import { I18nProvider } from "@/lib/i18n"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
})

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-body",
})

export const metadata: Metadata = {
  title: "Raffle USDT — Hourly USDT raffles",
  description: "Buy tickets, join hourly raffles, and win USDT with transparent draws and fast payouts.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
