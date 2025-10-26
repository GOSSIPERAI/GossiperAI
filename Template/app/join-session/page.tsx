"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Headphones, Users, Languages, ArrowRight, Settings, Hash, Clock, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
]

export default function JoinSessionPage() {
  const [joinCode, setJoinCode] = useState("")
  const [preferredLanguage, setPreferredLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sessionPreview, setSessionPreview] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-populate session code from URL parameters
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      const formattedCode = codeFromUrl.toUpperCase().replace(/[^A-Z0-9]/g, "")
      if (formattedCode.length === 6) {
        setJoinCode(formattedCode)
        // Trigger validation for the auto-populated code
        validateSessionCode(formattedCode)
      }
    }
  }, [searchParams])

  // Separate validation function to avoid dependency issues
  const validateSessionCode = async (formattedCode: string) => {
    setError("")

    try {
      const response = await fetch('/api/sessions/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ joinCode: formattedCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setSessionPreview(data.session)
        setError("")
      } else {
        setSessionPreview(null)
        setError(data.error || "Invalid session code")
      }
    } catch (err) {
      console.error('Error validating code:', err)
      setSessionPreview(null)
      setError("Failed to validate code. Please try again.")
    }
  }

  const handleCodeChange = async (value: string) => {
    const formattedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setJoinCode(formattedCode)

    // Validate session code when complete
    if (formattedCode.length === 6) {
      await validateSessionCode(formattedCode)
    } else {
      setSessionPreview(null)
      setError("")
    }
  }

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!sessionPreview) {
        setError("Please enter a valid session code")
        setIsLoading(false)
        return
      }

      // Join the session via API
      const response = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionPreview.id,
          selectedLanguage: preferredLanguage,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Successfully joined, redirect to session
        router.push(`/session/${sessionPreview.id}?lang=${preferredLanguage}`)
      } else {
        setError(data.error || "Failed to join session")
      }
    } catch (err: any) {
      console.error('Join session error:', err)
      setError(err.message || "Failed to join session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const { user, loading } = useAuth()

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Please sign in to join a session</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
                <span className="text-lg sm:text-xl font-bold">gossiper</span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="icon" className="sm:hidden" asChild>
                  <Link href="/dashboard">
                    <Users className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Join Session</h1>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                Enter the session code provided by your lecturer to access real-time captions
              </p>
            </div>

            <div className="grid gap-8">
              {/* Join Form */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>Session Code</span>
                  </CardTitle>
                  <CardDescription>Enter the 6-character code to join the session</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleJoinSession} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="joinCode">Session Code</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="joinCode"
                          placeholder="ABC123"
                          value={joinCode}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          className="pl-10 text-center text-lg font-mono tracking-widest uppercase"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Ask your lecturer for the session code</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                      <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name} ({lang.nativeName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || joinCode.length !== 6}>
                      {isLoading ? (
                        "Joining Session..."
                      ) : (
                        <>
                          Join Session
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Session Preview */}
              {sessionPreview && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Session Preview</span>
                    </CardTitle>
                    <CardDescription>You're about to join this session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{sessionPreview.title}</h3>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{sessionPreview.lecturer}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(sessionPreview.startTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{sessionPreview.participantCount} participants</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Languages className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Available Languages:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sessionPreview.availableLanguages.map((langCode: string) => {
                            const lang = AVAILABLE_LANGUAGES.find((l) => l.code === langCode)
                            return (
                              <Badge key={langCode} variant={langCode === preferredLanguage ? "default" : "secondary"}>
                                {lang?.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>
      </div>
  )
}
