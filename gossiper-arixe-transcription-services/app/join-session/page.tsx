"use client"

import type React from "react"

import { useState } from "react"
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
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { joinSessionClient, getSessionClient } from "@/lib/session-service-client"

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

  const handleCodeChange = async (value: string) => {
    const formattedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setJoinCode(formattedCode)

    // Look up session when code is complete
    if (formattedCode.length === 6) {
      try {
        // Try to get session preview via API first
        const { session, error } = await getSessionClient(formattedCode)
        
        if (error || !session) {
          console.warn('API session lookup failed, using mock data:', error)
          
          // Fallback to mock session data
          setTimeout(() => {
            setSessionPreview({
              id: "session_123",
              title: "Physics 101 - Newton's Laws of Motion",
              lecturer: "Dr. Sarah Johnson",
              startTime: "2024-01-15T14:00:00",
              mode: "classroom",
              participantCount: 12,
              availableLanguages: ["en", "yo", "fr", "es"],
              originalLanguage: "en",
            })
          }, 500)
          return
        }

        // Use real session data
        setSessionPreview({
          id: session.id,
          title: session.title,
          lecturer: "Session Creator", // We'll need to fetch lecturer name separately
          startTime: session.start_time || new Date().toISOString(),
          mode: session.mode,
          participantCount: 0, // We'll need to fetch this separately
          availableLanguages: session.available_languages,
          originalLanguage: session.original_language,
        })
      } catch (err) {
        console.error('Error looking up session:', err)
        // Keep session preview as null on error
      }
    } else {
      setSessionPreview(null)
    }
  }

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Try to join session via API first
      const { session, error: apiError } = await joinSessionClient(joinCode, preferredLanguage)

      if (apiError || !session) {
        console.warn('API join session failed, falling back to mock:', apiError)
        
        // Fallback to mock joining if API fails
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (sessionPreview) {
          // Mock joining session
          router.push(`/session/${sessionPreview.id}?lang=${preferredLanguage}`)
          return
        } else {
          setError("Invalid session code. Please check and try again.")
          return
        }
      }

      // Success - redirect to real session
      console.log('✅ Successfully joined session:', session)
      router.push(`/session/${session.id}?lang=${preferredLanguage}`)

    } catch (err) {
      console.error('Error joining session:', err)
      setError("Failed to join session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
                  <div className="w-full h-full rounded-md bg-primary/80 flex items-center justify-center">
                    <Image
                      src="/gossiper-logo-white.png"
                      alt="Gossiper Logo"
                      width={128}
                      height={128}
                      className="w-20 h-20 object-contain scale-[2.5]"
                    />
                  </div>
                </div>
                <span className="text-xl font-bold">Gossiper</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-balance">Join Session</h1>
              <p className="text-muted-foreground text-pretty">
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

            {/* Quick Access */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
                <CardDescription>Recent and popular sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium">Mathematics 201</p>
                      <p className="text-sm text-muted-foreground">Dr. Michael Chen • 15 participants</p>
                    </div>
                    <Badge variant="secondary">MATH01</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium">Computer Science Seminar</p>
                      <p className="text-sm text-muted-foreground">Prof. Lisa Wang • 8 participants</p>
                    </div>
                    <Badge variant="secondary">CS2024</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
