import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "KTM Transit - Kathmandu Valley Public Transport",
  description: "Navigate Kathmandu Valley with confidence. Find bus routes, calculate fares, and plan your journey.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="pb-20 md:pb-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
