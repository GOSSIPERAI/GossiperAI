"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Headphones, Mail, ArrowLeft, CheckCircle } from "lucide-react"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold">
              <Image
                src="/gossiper-logo-white.png"
                alt="Gossiper Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span>Gossiper</span>
            </Link>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription className="text-pretty">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
                  try again
                </button>
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold">
            <Image
              src="/gossiper-logo-white.png"
              alt="Gossiper Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <span>Gossiper</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-balance">Reset your password</h1>
            <p className="text-muted-foreground text-pretty">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>No worries, we'll send you reset instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset instructions"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
