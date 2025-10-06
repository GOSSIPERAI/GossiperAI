"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 text-2xl font-bold group">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Image
                    src="/gossiper-logo-white.png"
                    alt="Gossiper Logo"
                    width={160}
                    height={160}
                    className="w-32 h-32 object-contain scale-[3.2]"
                  />
                </div>
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Gossiper</span>
            </Link>
          </div>

          <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6 pb-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Check your email
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground/80 max-w-sm mx-auto">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-primary">{email}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
                  >
                    try again
                  </button>
                </p>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full h-12 text-base font-medium">
                  <Link href="/login" className="group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to sign in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-12 text-base">
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    Return to homepage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 text-2xl font-bold group">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={160}
                  height={160}
                  className="w-32 h-32 object-contain scale-[3.2]"
                />
              </div>
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Gossiper</span>
          </Link>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Lock className="h-6 w-6 text-primary/60" />
              <Sparkles className="h-4 w-4 text-primary/40 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Reset your password
            </h1>
            <p className="text-muted-foreground/80 text-pretty max-w-sm mx-auto leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your password
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold">Forgot your password?</CardTitle>
              <CardDescription className="text-base text-muted-foreground/80">
                No worries, we'll send you reset instructions to get you back in
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending instructions...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send reset instructions</span>
                    </div>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground/60">or</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full h-12 text-base border-border/50 hover:bg-muted/30">
                  <Link href="/login" className="group text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground/60">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all duration-200">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
