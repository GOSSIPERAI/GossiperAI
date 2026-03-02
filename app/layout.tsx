import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { SolanaWalletProvider } from "@/components/solana-wallet-provider"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { SkipNavigation } from "@/components/skip-navigation"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"

const nohemi = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-nohemi",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gossiper - AI-Powered Real-Time Captions & Translation",
  description:
    "Enhance classroom accessibility with AI-powered real-time captioning and translation. Supporting deaf, hard-of-hearing, and international students.",
  generator: "v0.app",
  keywords: ["AI captions", "real-time translation", "accessibility", "education", "Solana Pay"],
  icons: "/gossiper-logo-white.png",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${nohemi.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <AuthProvider>
              <SolanaWalletProvider>
                <SkipNavigation />
                <div id="live-region-polite" className="live-region polite" aria-live="polite" aria-atomic="true"></div>
                <div
                  id="live-region-assertive"
                  className="live-region assertive"
                  aria-live="assertive"
                  aria-atomic="true"
                ></div>
                <Suspense fallback={
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }>{children}</Suspense>
                <AccessibilityToolbar />
              </SolanaWalletProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
