"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, User, GraduationCap, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButtonWrapper } from "@/components/wallet-multi-button"
import { useAuth } from "@/hooks/use-auth"
import { getDefaultRedirect } from "@/lib/auth-utils"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "lecturer">("student")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signUp, signInWithWallet } = useAuth()
  const { publicKey, connected } = useWallet()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || getDefaultRedirect(user.role as any)
      router.push(redirect)
    }
  }, [user, router, searchParams])


  // Handle immediate wallet authentication
  useEffect(() => {
    const handleWalletAuth = async () => {
      if (connected && publicKey && !user && !isWalletLoading) {
        setIsWalletLoading(true)
        setError("")
        
        try {
          const result = await signInWithWallet(publicKey.toString())
          if (result.error) {
            setError(`Wallet authentication failed: ${result.error.message}`)
          } else {
            // Success! Redirect immediately
            const redirect = searchParams.get('redirect') || getDefaultRedirect('student')
            console.log('Wallet authentication successful, redirecting...')
            // Use replace instead of push for immediate redirect
            router.replace(redirect)
          }
        } catch (error) {
          console.error('Error with wallet authentication:', error)
          setError("Failed to authenticate with wallet")
        } finally {
          setIsWalletLoading(false)
        }
      }
    }

    handleWalletAuth()
  }, [connected, publicKey, user, signInWithWallet, router, searchParams, isWalletLoading])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, { name, role })
      if (error) {
        setError(error.message || "Failed to create account. Please try again.")
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.")
        // Clear form
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setName("")
        // Note: User will need to verify email before they can sign in
        // No automatic redirect since email verification is required
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4 text-foreground">
          <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold">
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
              <div className="w-full h-full rounded-lg bg-primary/80 flex items-center justify-center">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={160}
                  height={160}
                  className="w-28 h-28 object-contain scale-[3]"
                />
              </div>
            </div>
            <span>Gossiper</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-balance">Create your account</h1>
            <p className="text-muted-foreground text-pretty">
              Join thousands of students and lecturers using AI-powered captions
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>Choose your preferred sign-up method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Wallet Signup - Simplified */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Sign up with your Camp Network wallet</p>
                {isWalletLoading ? (
                  <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </Button>
                ) : (
                  <WalletMultiButtonWrapper className="!w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !text-sm !py-3 !px-4 !rounded-lg !font-medium" />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {connected && publicKey ? (
                    isWalletLoading ? (
                      "Creating your account..."
                    ) : (
                      `Connected: ${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}`
                    )
                  ) : (
                    "Connect your wallet to create an account instantly"
                  )}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="role-select">I am a...</Label>
                <Select value={role} onValueChange={(value: "student" | "lecturer") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lecturer">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Lecturer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-4">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-4">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
