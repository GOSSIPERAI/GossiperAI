"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Session } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Settings,
  Play,
  Languages,
  Accessibility,
  Search,
  Wallet,
  LogOut,
  UserPlus,
  Presentation,
} from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { SessionCard } from "@/components/session-card"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

// TypeScript interfaces for dashboard-specific data
interface DashboardStats {
  totalCreatedSessions: number
  totalJoinedSessions: number
  totalHours: number
  totalContributions: number
  favoriteLanguage: string
}

interface DashboardData {
  createdSessions: Session[]
  joinedSessions: Session[]
  stats: DashboardStats
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut, connectWallet, disconnectWallet } = useAuth()
  const { address: walletAddress, isConnected } = useAccount()
  const { getBalance } = useWallet()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchBalance = async () => {
      if (isConnected && walletAddress) {
        try {
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
    
    fetchBalance()
    
    return () => {
      isMounted = false
    }
  }, [isConnected, walletAddress, getBalance])

  // Helper function to create mock sessions
  const createMockSession = (id: string, title: string, description: string, lecturerName: string, lecturerId: string, status: "active" | "scheduled" | "ended", participantCount: number, startTime: Date, languages: string[], paymentGoal: number, currentAmount: number, contributions: number): Session => ({
    id,
    title,
    description,
    lecturerId,
    lecturer: { 
      id: lecturerId, 
      name: lecturerName || "Unknown", 
      email: `${(lecturerName || "unknown").toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      role: "lecturer" as const,
      preferredLanguage: "en",
      walletConnected: true
    },
    status,
    joinCode: title.split(' ')[0].toUpperCase(),
    originalLanguage: "en",
    participants: Array.from({ length: participantCount }, (_, i) => ({ 
      id: `p${i}`, 
      userId: `user${i}`,
      user: { 
        id: `user${i}`, 
        name: `Student ${i}`, 
        email: `student${i}@email.com`,
        role: "student" as const,
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
    // Fetch real dashboard data from database
    if (!user) return
    
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/sessions/my-sessions', {
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }
        
        const result = await response.json()
        
        // Transform API data to match dashboard structure
        const transformedData: DashboardData = {
          createdSessions: result.data.createdSessions.map((session: any) => 
            createMockSession(
              session.id,
              session.title,
              session.description || '',
              session.creatorName,
              user.id,
              session.status,
              session.participantCount,
              new Date(session.startTime || session.createdAt),
              session.availableLanguages || ['en'],
              session.paymentGoal * 100, // Convert to cents
              0, // Current amount - to be implemented
              0  // Contributions count - to be implemented
            )
          ),
          joinedSessions: result.data.joinedSessions.map((session: any) =>
            createMockSession(
              session.id,
              session.title,
              session.description || '',
              session.creatorName,
              session.id, // Different creator
              session.status,
              session.participantCount,
              new Date(session.startTime || session.joinedAt),
              session.availableLanguages || ['en'],
              session.paymentGoal * 100,
              0,
              0
            )
          ),
          stats: result.data.stats,
        }
        
        setDashboardData(transformedData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set empty data on error
        setDashboardData({
          createdSessions: [],
          joinedSessions: [],
          stats: {
            totalCreatedSessions: 0,
            totalJoinedSessions: 0,
            totalHours: 0,
            totalContributions: 0,
            favoriteLanguage: 'English',
          },
        })
      }
    }
    
    fetchDashboardData()
  }, [user])

  // Connect wallet handler
  const handleConnectWallet = async () => {
    if (isConnected && walletAddress) {
      try {
        const result = await connectWallet(walletAddress)
        if (result.success) {
          // Refresh the page to show updated wallet status
          window.location.reload()
        } else {
          alert(result.error || 'Failed to connect wallet')
        }
      } catch (error: any) {
        console.error('Failed to connect wallet:', error)
        alert(error.message || 'Failed to connect wallet')
      }
    }
  }

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
          <p className="text-muted-foreground">Please sign in to access your dashboard</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
                <span className="text-lg sm:text-xl font-bold">gossiper</span>
              </Link>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* User Info */}
                <div className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="hidden sm:inline text-sm font-medium text-primary">
                    {user?.display_name || user?.username}
                  </span>
                  <span className="sm:inline text-xs font-medium text-muted-foreground">
                    ({user?.email})
                  </span>
                </div>
                
                {/* Wallet Status */}
                {user?.wallet_address && (
                  <div className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Wallet className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="hidden sm:inline text-sm font-medium text-green-600">
                      {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                    </span>
                  </div>
                )}
                
                {/* Sign Out Button */}
                <>
                  {/* Desktop version */}
                  <Button variant="outline" onClick={signOut} className="hidden sm:flex text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  {/* Mobile version - icon only */}
                  <Button variant="outline" size="icon" onClick={signOut} className="sm:hidden text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Wallet Connection Banner */}
          {!user?.wallet_address && (
            <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Connect Your Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to contribute to session payments on Base and unlock full features
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="#settings" onClick={() => setActiveTab('settings')}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Header with Action Buttons */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">
                  Welcome back, {user?.display_name?.split(" ")[0] || user?.username}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                  Create sessions or join existing ones with real-time AI captions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Link href="/create-session" className="flex-1 sm:flex-none">
                  <Button size="default" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Presentation className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Create Session</span>
                  </Button>
                </Link>
                <Link href="/join-session" className="flex-1 sm:flex-none">
                  <Button size="default" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Join Session</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards - Unified for all users */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Created</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{dashboardData.stats.totalCreatedSessions}</p>
                  </div>
                  <Presentation className="h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Joined</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{dashboardData.stats.totalJoinedSessions}</p>
                  </div>
                  <UserPlus className="h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Hours</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">{dashboardData.stats.totalHours}h</p>
                  </div>
                  <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Contrib.</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">${dashboardData.stats.totalContributions.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Language</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{dashboardData.stats.favoriteLanguage}</p>
                  </div>
                  <Languages className="h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
              <TabsTrigger value="all-sessions" className="text-xs sm:text-sm py-2">All Sessions</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* My Created Sessions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Presentation className="h-5 w-5 text-primary" />
                        <span>My Sessions</span>
                      </CardTitle>
                      <CardDescription>Sessions you've created and manage</CardDescription>
                    </div>
                    <Link href="/create-session">
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>New</span>
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData.createdSessions?.length > 0 ? (
                    <div className="grid gap-4">
                      {dashboardData.createdSessions.map((session: Session) => (
                        <SessionCard 
                          key={session.id} 
                          session={session} 
                          userRole="creator"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Presentation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No sessions created yet</p>
                      <Link href="/create-session">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Session
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Joined Sessions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <span>Joined Sessions</span>
                      </CardTitle>
                      <CardDescription>Sessions you're participating in</CardDescription>
                    </div>
                    <Link href="/join-session">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Join</span>
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData.joinedSessions?.length > 0 ? (
                    <div className="grid gap-4">
                      {dashboardData.joinedSessions.map((session: Session) => (
                        <SessionCard 
                          key={session.id} 
                          session={session}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No sessions joined yet</p>
                      <Link href="/join-session">
                        <Button variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join a Session
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-sessions" className="space-y-6">
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
                  <CardDescription>Complete view of all your sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dashboardData.createdSessions?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Presentation className="h-4 w-4" />
                          My Created Sessions
                        </h3>
                        <div className="grid gap-4">
                          {dashboardData.createdSessions.map((session: Session) => (
                            <SessionCard 
                              key={session.id} 
                              session={session}
                              userRole="creator"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {dashboardData.joinedSessions?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Joined Sessions
                        </h3>
                        <div className="grid gap-4">
                          {dashboardData.joinedSessions.map((session: Session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                        </div>
                      </div>
                    )}
                    {(!dashboardData.createdSessions?.length && !dashboardData.joinedSessions?.length) && (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No sessions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Wallet Connection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span>Wallet Connection</span>
                  </CardTitle>
                  <CardDescription>
                    Connect a wallet to make payments for sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.wallet_address ? (
                    <>
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">Wallet Connected</p>
                          <p className="text-xs text-green-700 dark:text-green-300 font-mono">
                            {user.wallet_address}
                          </p>
                          {user.wallet_connected_at && (
                            <p className="text-xs text-muted-foreground">
                              Connected {new Date(user.wallet_connected_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to disconnect your wallet?')) {
                              await disconnectWallet();
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          No wallet connected. Connect a wallet to contribute to session payments.
                        </p>
                        <WalletConnectButton className="!w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground" />
                      </div>
                      {isConnected && walletAddress && (
                        <Button 
                          onClick={handleConnectWallet} 
                          className="w-full"
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Link Wallet to Account
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                      <select id="default-language" className="w-full mt-1 p-2 border rounded-md">
                        <option value="en">English</option>
                        <option value="yo">Yoruba</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="translation-language" className="text-sm font-medium">Translation Language</label>
                      <select id="translation-language" className="w-full mt-1 p-2 border rounded-md">
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
  )
}
