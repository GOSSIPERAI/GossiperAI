"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButtonWrapper } from "@/components/wallet-multi-button"
import { useAuth } from "@/hooks/use-auth"
import { getDefaultRedirect } from "@/lib/auth-utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [walletAuthenticating, setWalletAuthenticating] = useState(false)
  const [walletAuthTimeout, setWalletAuthTimeout] = useState<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, signInWithWallet } = useAuth()
  const { publicKey, connected } = useWallet()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || getDefaultRedirect(user.role as any)
      router.replace(redirect)
    }
  }, [user, router, searchParams])


  // Handle wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey && !user && !walletAuthenticating) {
        setWalletAuthenticating(true)
        setError("")
        
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          setWalletAuthenticating(false)
          setError("Wallet authentication timed out. Please try again.")
        }, 10000) // 10 second timeout
        
        setWalletAuthTimeout(timeout)
        
        try {
          console.log('Attempting wallet authentication with:', publicKey.toString())
          // Try to authenticate with wallet (this will create account if needed)
          const result = await signInWithWallet(publicKey.toString())
          console.log('Wallet authentication result:', result)
          
          // Clear timeout on success or error
          if (timeout) clearTimeout(timeout)
          setWalletAuthTimeout(null)
          
          if (!result.error) {
            console.log('Wallet authentication successful, redirecting...')
            const redirect = searchParams.get('redirect') || getDefaultRedirect(result.user?.role as any || 'student')
            // Clear loading state immediately
            setWalletAuthenticating(false)
            // Small delay to ensure state is updated, then redirect
            setTimeout(() => {
              router.replace(redirect)
            }, 100)
          } else {
            console.error('Wallet authentication error:', result.error)
            setError(`Wallet authentication failed: ${result.error.message}`)
            setWalletAuthenticating(false)
          }
        } catch (error) {
          console.error('Error with wallet authentication:', error)
          setError("Wallet authentication failed. Please try again.")
          setWalletAuthenticating(false)
          if (timeout) clearTimeout(timeout)
          setWalletAuthTimeout(null)
        }
      }
    }

    handleWalletConnection()
  }, [connected, publicKey, user, signInWithWallet, router, searchParams, walletAuthenticating])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (walletAuthTimeout) {
        clearTimeout(walletAuthTimeout)
      }
    }
  }, [walletAuthTimeout])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message || "Invalid credentials. Please try again.")
      } else {
        // Auth state change and redirect are handled by the AuthProvider's user effect
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
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
            <h1 className="text-2xl font-bold text-balance">Welcome back</h1>
            <p className="text-muted-foreground text-pretty">
              Sign in to your account to continue
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Choose your preferred sign-in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Wallet Login */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Connect with your Camp Network wallet</p>
                {walletAuthenticating ? (
                  <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating with wallet...
                  </Button>
                ) : (
                  <WalletMultiButtonWrapper className="!w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !text-sm !py-3 !px-4 !rounded-lg !font-medium" />
                )}
                {connected && publicKey && !walletAuthenticating && (
                  <Button 
                    onClick={async () => {
                      setWalletAuthenticating(true)
                      setError("")
                      
                      // Set a timeout to prevent infinite loading
                      const timeout = setTimeout(() => {
                        setWalletAuthenticating(false)
                        setError("Wallet authentication timed out. Please try again.")
                      }, 10000) // 10 second timeout
                      
                      setWalletAuthTimeout(timeout)
                      
                      try {
                        const result = await signInWithWallet(publicKey.toString())
                        
                        // Clear timeout on success or error
                        if (timeout) clearTimeout(timeout)
                        setWalletAuthTimeout(null)
                        
                        if (!result.error) {
                          const redirect = searchParams.get('redirect') || getDefaultRedirect(result.user?.role as any || 'student')
                          setWalletAuthenticating(false)
                          setTimeout(() => {
                            router.replace(redirect)
                          }, 100)
                        } else {
                          setError(`Wallet authentication failed: ${result.error.message}`)
                          setWalletAuthenticating(false)
                        }
                      } catch (error) {
                        console.error('Error with wallet authentication:', error)
                        setError("Wallet authentication failed. Please try again.")
                        setWalletAuthenticating(false)
                        if (timeout) clearTimeout(timeout)
                        setWalletAuthTimeout(null)
                      }
                    }}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    Sign in with wallet
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {connected && publicKey ? (
                    walletAuthenticating ? (
                      "Processing wallet authentication..."
                    ) : (
                      `Connected: ${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}`
                    )
                  ) : (
                    "Connect your wallet to sign in or create an account"
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

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="text-primary hover:text-primary/80 underline underline-offset-4"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
