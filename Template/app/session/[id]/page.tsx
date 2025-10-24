"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Headphones,
  Users,
  Languages,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Share,
  DollarSign,
  Clock,
  User,
  Maximize2,
  Minimize2,
  LogOut,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { CaptionDisplay } from "@/components/caption-display"
import { TranscriptionDisplay } from "@/components/transcription-display"
import { RealtimeTranscriptionDisplay } from "@/components/realtime-transcription-display"
import { LecturerTranscriptionDisplay } from "@/components/lecturer-transcription-display"
import { PaymentModal } from "@/components/payment-modal"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/hooks/use-auth"

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "yo", name: "Yoruba" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
]

export default function SessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user: authUser, loading, signOut } = useAuth()
  const { isConnected } = useAccount()
  const sessionId = params.id as string
  const initialLang = searchParams.get("lang") || "en"

  const handleLogout = async () => {
    await signOut()
  }

  const [selectedLanguage, setSelectedLanguage] = useState(initialLang)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  
  // Check if current user is the session creator (lecturer role)
  // For now using mock check - will be replaced with real session data
  const userRole = sessionData?.lecturerId === authUser?.id ? "lecturer" : "student"

  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
  const [recordingTimeRemaining, setRecordingTimeRemaining] = useState<number>(0)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop()
      }
      if (recordingTimer) {
        clearTimeout(recordingTimer)
      }
    }
  }, [mediaRecorder, isRecording, recordingTimer])

  // Countdown timer effect for recording
  useEffect(() => {
    if (recordingTimeRemaining > 0) {
      const countdownTimer = setTimeout(() => {
        setRecordingTimeRemaining(recordingTimeRemaining - 1)
      }, 1000)
      return () => clearTimeout(countdownTimer)
    }
  }, [recordingTimeRemaining])

  // Fetch real session data from database
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }
        
        const data = await response.json()
        
        // Transform API data to match component's expected structure
        setSessionData({
          id: data.session.id,
          title: data.session.title,
          lecturer: data.session.creatorName || data.session.creatorUsername,
          lecturerId: data.session.creatorId,
          startTime: new Date(data.session.startTime || data.session.createdAt),
          mode: data.session.mode,
          participants: [], // Will be populated by real-time updates later
          availableLanguages: data.session.availableLanguages || ["en"],
          originalLanguage: data.session.originalLanguage || "en",
          joinCode: data.session.joinCode,
          description: data.session.description,
          status: data.session.status,
          paymentPool: {
            goalAmount: (data.session.paymentGoal || 50) * 100, // Convert to cents
            currentAmount: 0, // Will be calculated from contributions
            contributions: 0,
          },
        })
      } catch (error) {
        console.error('Error fetching session:', error)
        setSessionData(null)
      }
    }
    
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionData?.joinCode || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy join code:', error)
    }
  }

  const shareSession = async () => {
    try {
      const url = `${window.location.origin}/join-session?code=${sessionData?.joinCode}`
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (error) {
      console.error('Failed to copy session URL:', error)
    }
  }

  const handlePaymentSuccess = (amount: number) => {
    // Update payment pool with new contribution
    setSessionData((prev: any) => ({
      ...prev,
      paymentPool: {
        ...prev.paymentPool,
        currentAmount: prev.paymentPool.currentAmount + amount * 100 * 3000000, // Convert ETH to Naira cents (approx rate)
        contributions: prev.paymentPool.contributions + 1,
      },
    }))
  }

  // Audio recording functions
  const startRecording = async () => {
    try {
      setRecordingError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      })
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        await sendAudioToTranscription(audioBlob)
        setAudioChunks([])
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start(5000) // Record in 5-second chunks
      setMediaRecorder(recorder)
      setIsRecording(true)
      
      // Set 60-second auto-stop timer
      setRecordingTimeRemaining(60)
      const timer = setTimeout(() => {
        stopRecording()
        setIsMicOn(false)
        setRecordingTimeRemaining(0)
      }, 60000) // 60 seconds
      setRecordingTimer(timer)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setRecordingError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
    
    // Clear the recording timer
    if (recordingTimer) {
      clearTimeout(recordingTimer)
      setRecordingTimer(null)
    }
    setRecordingTimeRemaining(0)
  }

  const sendAudioToTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording_${Date.now()}.webm`)
      formData.append('callbackUrl', `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/transcription/callback`)
      formData.append('languageCode', selectedLanguage)

      // Use the existing transcription service
      const response = await fetch('/api/transcription/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to send audio for transcription')
      }

      const result = await response.json()
      console.log('Transcription job submitted:', result.jobId)
      
    } catch (error) {
      console.error('Error sending audio to transcription:', error)
      setRecordingError('Failed to send audio for transcription')
    }
  }

  // Handle mic toggle
  const handleMicToggle = () => {
    if (isMicOn) {
      stopRecording()
    } else {
      startRecording()
    }
    setIsMicOn(!isMicOn)
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Please sign in to access this session</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-background flex flex-col`}>
        {/* Navigation */}
        {!isFullscreen && (
          <nav className="border-b border-border bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Image
                    src="/gossiper-logo-white.png"
                    alt="Gossiper Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                  <span className="text-xl font-bold">gossiper</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Live</span>
                  </Badge>
                  <Badge variant={userRole === "lecturer" ? "default" : "outline"} className="text-xs">
                    {userRole === "lecturer" ? "Host" : "Participant"}
                  </Badge>
                  <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Session Header */}
            <div className="border-b border-border bg-card py-4">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between" style={{ paddingLeft: '48px' }}>
                  <div className="space-y-1">
                    <h1 className="text-xl font-bold">{sessionData.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{sessionData.lecturer}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{sessionData.startTime.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{sessionData.participants.length} participants</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userRole === "lecturer" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyJoinCode}
                          className={copied ? "bg-green-50 border-green-500" : ""}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {sessionData.joinCode}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={shareSession}
                          className={shared ? "bg-green-50 border-green-500" : ""}
                          title={shared ? "Link copied!" : "Share session link"}
                        >
                          {shared ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Share className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="border-b border-border bg-muted/30 py-4">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between" style={{ paddingLeft: '48px' }}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Caption Language:</span>
                    </div>
                    {userRole === "lecturer" && isRecording && isMicOn && (
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm text-red-600 font-medium">
                          Recording...{recordingTimeRemaining > 0 ? ` (${recordingTimeRemaining}s)` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    {userRole === "lecturer" && (
                      <Button 
                        variant={isMicOn ? "default" : "outline"} 
                        size="sm" 
                        onClick={handleMicToggle}
                        disabled={recordingError !== null}
                        title={isMicOn ? "Stop Recording" : "Start Recording"}
                      >
                        {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                {recordingError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600" style={{ marginLeft: '48px' }}>
                    {recordingError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              {userRole === "lecturer" ? (
                <LecturerTranscriptionDisplay
                  sessionId={sessionId}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  availableLanguages={AVAILABLE_LANGUAGES}
                  className="h-full"
                />
              ) : (
                <RealtimeTranscriptionDisplay
                  sessionId={sessionId}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  availableLanguages={AVAILABLE_LANGUAGES}
                  className="h-full"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          {!isFullscreen && (
            <div className="w-80 border-l border-border bg-card">
              <div className="p-4 space-y-6">
                {/* Payment Pool */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span>{userRole === "lecturer" ? "Class Pool" : "Contribute to Session"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          ₦{(sessionData.paymentPool.currentAmount / 100).toFixed(0)} / ₦
                          {(sessionData.paymentPool.goalAmount / 100).toFixed(0)}
                        </span>
                      </div>
                      <Progress
                        value={(sessionData.paymentPool.currentAmount / sessionData.paymentPool.goalAmount) * 100}
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userRole === "lecturer" 
                        ? `${sessionData.paymentPool.contributions} participants contributed`
                        : `Help fund this session with ${sessionData.paymentPool.contributions} other participants`
                      }
                    </p>
                    {userRole === "student" && (
                      isConnected ? (
                        <Button size="sm" className="w-full" onClick={() => setIsPaymentModalOpen(true)}>
                          Contribute with ETH
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground text-center">Connect wallet to contribute</p>
                          <WalletConnectButton className="!w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !text-sm !py-2 !px-4 !rounded-md" />
                        </div>
                      )
                    )}
                    {userRole === "lecturer" && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Share the join code to let students contribute
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Participants ({sessionData.participants.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sessionData.participants.map((participant: any) => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <span className="text-sm">{participant.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {participant.language.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          sessionId={sessionId}
          sessionTitle={sessionData.title}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
  )
}
