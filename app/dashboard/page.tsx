"use client"

import { useState, useEffect } from "react"
import type { Session, User, SessionParticipant, PaymentPool } from "@/lib/types"

// TypeScript interfaces for dashboard-specific data
interface DashboardStats {
  totalSessions: number
  totalHours?: number
  totalStudents?: number
  totalEarnings?: number
  totalContributions?: number
  favoriteLanguage?: string
  avgEngagement?: number
}

interface DashboardData {
  activeSessions: Session[]
  upcomingSessions?: Session[]
  recentSessions?: Session[]
  stats: DashboardStats
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Headphones,
  Plus,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Settings,
  History,
  Play,
  BarChart3,
  Languages,
  Accessibility,
  Bell,
  Search,
  Wallet,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { useSolana } from "@/hooks/use-solana"
import { SessionCard } from "@/components/session-card"
import { Input } from "@/components/ui/input"

// There is a lint error: Property 'profile' does not exist on type 'AuthContextType'.
// Best practice: Only destructure properties that exist on the returned object from useAuth().
// Proposal: Remove 'profile' from the destructuring assignment.
// If you need 'profile', ensure it is provided by useAuth() or fetch it separately.

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { connected, publicKey, getBalance } = useSolana()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          // Add a small delay to not block the initial render
          await new Promise(resolve => setTimeout(resolve, 100))
          const balance = await getBalance()
          if (isMounted) {
            setWalletBalance(balance)
          }
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error)
          if (isMounted) {
            setWalletBalance(null)
          }
        }
      }
    }
    
    // Use setTimeout to make this non-blocking
    const timeoutId = setTimeout(fetchBalance, 0)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [connected, publicKey, getBalance])

  // Helper function to create mock sessions
  const createMockSession = (id: string, title: string, description: string, lecturerName: string, lecturerId: string, status: "active" | "scheduled" | "ended", participantCount: number, startTime: Date, languages: string[], paymentGoal: number, currentAmount: number, contributions: number): Session => ({
    id,
    title,
    description,
    lecturerId,
    lecturer: { 
      id: lecturerId, 
      full_name: lecturerName, 
      email: `${lecturerName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      role: "lecturer" as const,
      walletAddress: undefined,
      walletConnected: true,
      preferredLanguage: "en"
    },
    status,
    joinCode: title.split(' ')[0].toUpperCase(),
    originalLanguage: "en",
    participants: Array.from({ length: participantCount }, (_, i) => ({ 
      id: `p${i}`, 
      userId: `user${i}`,
      user: { 
        id: `user${i}`, 
        full_name: `Student ${i}`,
        email: `student${i}@email.com`,
        role: "student" as const,
        walletAddress: undefined,
        walletConnected: false,
        preferredLanguage: "en"
      },
      sessionId: id,
      selectedLanguage: "en",
      joinedAt: new Date(),
      hasContributed: i < contributions
    })),
    startTime,
    availableLanguages: languages,
    paymentPool: {
      id: `pool${id}`,
      sessionId: id,
      goalAmount: paymentGoal,
      currentAmount: currentAmount,
      currency: "USDC" as const,
      contributions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    captions: [],
    mode: "classroom" as const,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  useEffect(() => {
    // Mock dashboard data Camp Networkd on user role
    if (!user?.role) return
    
    // Use setTimeout to make this non-blocking
    const timeoutId = setTimeout(() => {
      const mockData = {
      student: {
        activeSessions: [
          createMockSession(
            "1", 
            "Physics 101 - Newton's Laws", 
            "Understanding the fundamental laws of motion",
            "Dr. Sarah Johnson", 
            "lecturer1", 
            "active", 
            24, 
            new Date(), 
            ["en", "yo", "fr"], 
            500000, 
            450000, 
            18
          ),
          createMockSession(
            "2", 
            "Mathematics - Calculus Basics", 
            "Introduction to differential and integral calculus",
            "Prof. Michael Chen", 
            "lecturer2", 
            "scheduled", 
            15, 
            new Date(Date.now() + 2 * 60 * 60 * 1000), 
            ["en", "yo"], 
            400000, 
            230000, 
            12
          ),
        ],
        recentSessions: [
          createMockSession(
            "3", 
            "Chemistry - Organic Compounds", 
            "Study of carbon-Camp Networkd compounds and their reactions",
            "Dr. Emily Rodriguez", 
            "lecturer3", 
            "ended", 
            32, 
            new Date(Date.now() - 24 * 60 * 60 * 1000), 
            ["en", "yo", "fr", "es"], 
            600000, 
            580000, 
            25
          ),
        ],
        stats: {
          totalSessions: 12,
          totalHours: 28.5,
          totalContributions: 0.15,
          favoriteLanguage: "Yoruba",
        },
      },
      lecturer: {
        activeSessions: [
          createMockSession(
            "1", 
            "Physics 101 - Newton's Laws", 
            "Understanding the fundamental laws of motion",
            user?.full_name || "Current User", 
            user?.id || "current", 
            "active", 
            24, 
            new Date(), 
            ["en", "yo", "fr"], 
            500000, 
            450000, 
            18
          ),
        ],
        upcomingSessions: [
          createMockSession(
            "4", 
            "Advanced Physics - Quantum Mechanics", 
            "Exploring quantum theory and its applications",
            user?.full_name || "Current User", 
            user?.id || "current", 
            "scheduled", 
            18, 
            new Date(Date.now() + 3 * 60 * 60 * 1000), 
            ["en", "yo"], 
            350000, 
            120000, 
            8
          ),
        ],
        stats: {
          totalSessions: 45,
          totalStudents: 340,
          totalEarnings: 2.45,
          avgEngagement: 87,
        },
      },
    }

      setDashboardData(user?.role === "lecturer" ? mockData.lecturer : mockData.student)
    }, 0) // Execute on next tick
    
    return () => clearTimeout(timeoutId)
  }, [user?.role, user?.full_name, user?.id])

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isLecturer = user?.role === "lecturer"

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
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
                {user?.wallet_connected && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Connected"}
                    </span>
                  </div>
                )}
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4 hover:text-foreground" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{user?.full_name?.charAt(0) || "U"}</span>
                  </div>
                  <span className="text-sm font-medium">{user?.full_name}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-col md:flex-row !gap[30px]">
            <div>
              <h1 className="text-3xl font-bold text-balance">Welcome back, {user?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}</h1>
              <p className="text-muted-foreground mt-1">
                {user?.role === "lecturer"
                  ? "Manage your sessions and track student engagement"
                  : "Continue learning with AI-powered captions and translations"}
              </p>
              {!user?.wallet_connected && (
                <p className="text-amber-600 text-sm mt-1">
                  💡 Connect your Camp Network wallet to participate in payment pools
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3 ">
              {isLecturer && (
                <Link href="/create-session">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Session</span>
                  </Button>
                </Link>
              )}
              <Link href="/join-session">
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent hover:text-foreground">
                  <Users className="h-4 w-4" />
                  <span>Join Session</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLecturer ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalSessions}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalStudents}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalEarnings} SOL</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.avgEngagement}%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sessions Attended</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalSessions}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Learning Hours</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalHours}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contributions</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.totalContributions} SOL</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                        <p className="text-2xl font-bold">{dashboardData.stats.favoriteLanguage}</p>
                      </div>
                      <Languages className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-primary" />
                    <span>{isLecturer ? "Active Sessions" : "Current Sessions"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.activeSessions?.length > 0 ? (
                    <div className="grid gap-4">
                      {dashboardData.activeSessions.map((session: Session) => (
                        <SessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active sessions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming/Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{isLecturer ? "Upcoming Sessions" : "Recent Sessions"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {((dashboardData.upcomingSessions || dashboardData.recentSessions)?.length ?? 0) > 0 ? (
                    <div className="grid gap-4">
                      {(dashboardData.upcomingSessions || dashboardData.recentSessions || []).map((session: Session) => (
                        <SessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {isLecturer ? "No upcoming sessions" : "No recent sessions"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      ...dashboardData.activeSessions,
                      ...(dashboardData.upcomingSessions || dashboardData.recentSessions || []),
                    ].map((session: Session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Languages className="h-5 w-5 text-primary" />
                      <span>Language Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="default-language" className="text-sm font-medium">Default Caption Language</label>
                      <select id="default-language" className="w-full mt-1 p-2 rounded-md">
                        <option value="en">English</option>
                        <option value="yo">Yoruba</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="translation-language" className="text-sm font-medium">Translation Language</label>
                      <select id="translation-language" className="w-full mt-1 p-2 rounded-md">
                        <option value="yo">Yoruba</option>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Accessibility className="h-5 w-5 text-primary" />
                      <span>Accessibility</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Contrast Mode</span>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Large Font Size</span>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Screen Reader Support</span>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
