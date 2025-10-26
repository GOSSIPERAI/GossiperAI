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
import { useAuth } from "@/hooks/use-auth"

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
      // Call API to create session in database
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          originalLanguage: formData.originalLanguage,
          availableLanguages: selectedLanguages,
          mode: formData.mode,
          paymentGoal: formData.paymentGoal,
          enablePayments: formData.enablePayments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      // Redirect to the newly created session
      router.push(`/session/${data.session.id}`);
    } catch (err: any) {
      console.error('Create session error:', err);
      setError(err.message || "Failed to create session. Please try again.");
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
          <p className="text-muted-foreground">Please sign in to create a session</p>
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
                    <Calendar className="h-4 w-4" />
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
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Create New Session</h1>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
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
                  <div className="flex flex-col gap-3 pt-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        "Creating Session..."
                      ) : (
                        <>
                          Create Session
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <Link href="/dashboard">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
