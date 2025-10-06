"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Languages, DollarSign, Plus, X, ArrowRight, Headphones, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { createSessionClient, type CreateSessionData } from "@/lib/session-service-client"

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
]

const SESSION_MODES = [
  { value: "classroom", label: "Classroom Lecture", description: "Traditional academic setting" },
  { value: "conference", label: "Conference", description: "Professional conferences and seminars" },
  { value: "podcast", label: "Podcast Recording", description: "Audio content creation" },
  { value: "livestream", label: "Live Stream", description: "Online streaming events" },
]

export default function CreateSessionPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    originalLanguage: "en",
    mode: "classroom",
    paymentGoal: 50,
    enablePayments: true,
  })
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(langCode)) {
        return prev.filter((code) => code !== langCode)
      } else {
        return [...prev, langCode]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (selectedLanguages.length === 0) {
      setError("Please select at least one language")
      setIsLoading(false)
      return
    }

    try {
      // Prepare session data for API
      const sessionData: CreateSessionData = {
        title: formData.title,
        description: formData.description || undefined,
        startTime: formData.startTime || undefined,
        originalLanguage: formData.originalLanguage,
        availableLanguages: selectedLanguages,
        mode: formData.mode as 'classroom' | 'conference' | 'podcast' | 'livestream',
        paymentGoal: formData.enablePayments ? formData.paymentGoal * 100 : 0, // Convert to cents
      }

      // Try to create session via API first
      const { session, error: apiError } = await createSessionClient(sessionData)

      if (apiError || !session) {
        console.warn('API session creation failed, falling back to mock:', apiError)
        
        // Fallback to mock data if API fails
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const sessionId = `session_${Date.now()}`
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        // Mock session creation
        const mockSessionData = {
          id: sessionId,
          ...formData,
          availableLanguages: selectedLanguages,
          joinCode,
          status: "scheduled",
          participants: [],
          createdAt: new Date(),
        }

        // Store session data in localStorage as fallback
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(mockSessionData))

        router.push(`/session/${sessionId}`)
        return
      }

      // Success - redirect to real session
      console.log('✅ Session created successfully:', session)
      router.push(`/session/${session.id}`)

    } catch (err) {
      console.error('Error creating session:', err)
      setError("Failed to create session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard allowedRoles={["lecturer", "admin"]}>
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
                  <Button variant="outline" size="icon" title="Settings">
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
              <h1 className="text-3xl font-bold text-balance">Create New Session</h1>
              <p className="text-muted-foreground text-pretty">
                Set up a new captioning session for your lecture, conference, or event
              </p>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Session Details</span>
                </CardTitle>
                <CardDescription>Configure your session settings and language preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Session Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Physics 101 - Newton's Laws"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the session content..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="startTime"
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => handleInputChange("startTime", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mode">Session Mode</Label>
                        <Select value={formData.mode} onValueChange={(value) => handleInputChange("mode", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SESSION_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                <div>
                                  <div className="font-medium">{mode.label}</div>
                                  <div className="text-xs text-muted-foreground">{mode.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Languages className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Language Settings</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originalLanguage">Original Language</Label>
                      <Select
                        value={formData.originalLanguage}
                        onValueChange={(value) => handleInputChange("originalLanguage", value)}
                      >
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

                    <div className="space-y-3">
                      <Label>Available Translation Languages</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AVAILABLE_LANGUAGES.map((lang) => (
                          <div key={lang.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={`lang-${lang.code}`}
                              checked={selectedLanguages.includes(lang.code)}
                              onCheckedChange={() => toggleLanguage(lang.code)}
                            />
                            <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                              {lang.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedLanguages.map((langCode) => {
                          const lang = AVAILABLE_LANGUAGES.find((l) => l.code === langCode)
                          return (
                            <Badge key={langCode} variant="secondary" className="flex items-center space-x-1">
                              <span>{lang?.name}</span>
                              <button
                                type="button"
                                onClick={() => toggleLanguage(langCode)}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                title={`Remove ${lang?.name} language`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Payment Settings</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enablePayments"
                        checked={formData.enablePayments}
                        onCheckedChange={(checked) => handleInputChange("enablePayments", checked)}
                      />
                      <Label htmlFor="enablePayments">Enable student contributions via Solana Pay</Label>
                    </div>

                    {formData.enablePayments && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="paymentGoal">Class Pool Goal (₦)</Label>
                        <div className="relative max-w-xs">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="paymentGoal"
                            type="number"
                            min="10"
                            max="1000"
                            value={formData.paymentGoal}
                            onChange={(e) => handleInputChange("paymentGoal", Number.parseInt(e.target.value))}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Suggested amount for the class to collectively contribute (≈ $
                          {(formData.paymentGoal * 0.002).toFixed(2)} USD)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        "Creating Session..."
                      ) : (
                        <>
                          Create Session
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
