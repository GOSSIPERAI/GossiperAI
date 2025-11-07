"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter } from "next/navigation"
import { SessionCard } from "@/components/session-card"
import { DashboardNavigation } from "@/components/dashboard/navigation"
import { DashboardStats } from "@/components/dashboard/stats"
import { Play, History, Search, Languages, Accessibility } from "lucide-react"
import type { Session } from "@/lib/types"
import { USER_ROLES } from "@/lib/constants"

interface DashboardData {
  activeSessions: Session[]
  pastSessions: Session[]
  stats: {
    totalSessions: number
    totalHours: number
    totalContributions: number
    avgEngagement: number
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    // Mock data loading - replace with real API call
    setTimeout(() => {
      setDashboardData({
        activeSessions: [],
        pastSessions: [],
        stats: {
          totalSessions: 12,
          totalHours: 24,
          totalContributions: 8,
          avgEngagement: 92
        }
      })
    }, 1000)
  }, [])

  const handleSignOut = () => {
    // Handle sign out
    router.push('/login')
  }

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

  return (
    <AuthGuard allowedRoles={[USER_ROLES.STUDENT]}>
      <div className="min-h-screen bg-background">
        <DashboardNavigation walletBalance={walletBalance} onSignOut={handleSignOut} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-balance">Student Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Join sessions and access transcripts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/join-session">
                <Button className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Join Session</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats userRole={USER_ROLES.STUDENT} stats={dashboardData.stats} />

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 space-y-6">
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
                    <span>Active Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {dashboardData.activeSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Past Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>Past Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {dashboardData.pastSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
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
                    {[...dashboardData.activeSessions, ...dashboardData.pastSessions].map((session) => (
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
                      <span>Language Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Language settings content */}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Accessibility className="h-5 w-5 text-primary" />
                      <span>Accessibility</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Accessibility settings content */}
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