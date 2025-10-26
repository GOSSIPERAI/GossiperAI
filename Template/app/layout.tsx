import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Web3Provider } from "@/components/wagmi-provider"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { SkipNavigation } from "@/components/skip-navigation"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"
import { AuthProvider } from "@/hooks/use-auth"

const nohemi = localFont({
  src: [
    {
      path: "./fonts/Nohemi-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Nohemi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-nohemi",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gossiper - AI-Powered Real-Time Captions & Translation",
  description:
    "Enhance classroom accessibility with AI-powered real-time captioning and translation. Supporting deaf, hard-of-hearing, and international students.",
  generator: "v0.app",
  keywords: ["AI captions", "real-time translation", "accessibility", "education", "Solana Pay"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${nohemi.variable} antialiased`}>
        <AccessibilityProvider>
          <AuthProvider>
            <Web3Provider>
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
            </Web3Provider>
          </AuthProvider>
        </AccessibilityProvider>
        <Analytics />
      </body>
    </html>
  )
}
