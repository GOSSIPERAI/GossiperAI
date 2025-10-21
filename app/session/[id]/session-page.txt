"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
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
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { CaptionDisplay } from "@/components/caption-display"
import { RealtimeTranscriptionDisplay } from "@/components/realtime-transcription-display"
import { PaymentModal } from "@/components/payment-modal"
import { useBase } from "@/hooks/use-base"
import { getSessionClient, getSessionParticipantsClient, type Session, type SessionParticipant } from "@/lib/session-service-client"
import { toast } from "sonner"
import { formatEther } from "ethers"

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
  const { user, signOut } = useAuth()
  const sessionId = params.id as string
  const initialLang = searchParams.get("lang") || "en"

  // Base blockchain hook
  const {
    isConnected,
    address,
    chainId,
    isProcessing,
    connectWallet,
    disconnectWallet,
    switchToBaseNetwork,
    sendPayment,
    createSession,
    getSessionData,
    getBalance,
  } = useBase()

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  const [selectedLanguage, setSelectedLanguage] = useState(initialLang)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const [blockchainSessionData, setBlockchainSessionData] = useState<any>(null)

  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
  const [recordingTimeRemaining, setRecordingTimeRemaining] = useState<number>(0)

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

  // Load wallet balance when connected
  useEffect(() => {
    if (isConnected) {
      const loadBalance = async () => {
        const balance = await getBalance()
        setWalletBalance(balance)
      }
      loadBalance()
    } else {
      setWalletBalance(null)
    }
  }, [isConnected, getBalance])

  // Load blockchain session data and create session if needed
  useEffect(() => {
    if (isConnected && sessionId && sessionData) {
      const loadBlockchainData = async () => {
        const data = await getSessionData(sessionId)
        if (data) {
          setBlockchainSessionData(data)
          console.log('Blockchain session data:', data)
        } else {
          // Session doesn't exist on blockchain, create it
          console.log('Session not found on blockchain, creating...')
          
          // Default goal amount: 0.05 ETH (approximately $150-200 USD)
          const goalAmount = 0.05
          
          const created = await createSession(sessionId, goalAmount)
          if (created) {
            // Reload blockchain data after creation
            const newData = await getSessionData(sessionId)
            if (newData) {
              setBlockchainSessionData(newData)
            }
          }
        }
      }
      loadBlockchainData()
    }
  }, [isConnected, sessionId, sessionData, getSessionData, createSession])

  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      setIsLoadingSession(true)
      
      try {
        // Try to load real session data first
        const { session, error: sessionError } = await getSessionClient(sessionId)
        
        if (sessionError || !session) {
          console.warn('API session fetch failed, falling back to mock data:', sessionError)
          
          // Fallback to mock data if API fails
          const mockSessionId = sessionId === 'session_123' ? '550e8400-e29b-41d4-a716-446655440000' : sessionId
          
          const mockSession = {
            id: mockSessionId,
            title: "Physics 101 - Newton's Laws of Motion",
            lecturer: "Dr. Sarah Johnson",
            startTime: new Date(),
            mode: "classroom",
            participants: [
              { id: "1", name: "Alice Johnson", language: "en" },
              { id: "2", name: "Bob Smith", language: "yo" },
              { id: "3", name: "Carlos Rodriguez", language: "es" },
              { id: "4", name: "Diana Chen", language: "fr" },
            ],
            availableLanguages: ["en", "yo", "fr", "es"],
            originalLanguage: "en",
            joinCode: "ABC123",
            paymentPool: {
              goalAmount: 5000, // 50 Naira in cents
              currentAmount: 4000, // 40 Naira in cents
              contributions: 8,
            },
          }
          setSessionData(mockSession as any)
          setParticipants([])
          setIsLoadingSession(false)
          return
        }

        // Load real session data
        setSessionData(session)

        // Load participants
        const { participants: sessionParticipants, error: participantsError } = await getSessionParticipantsClient(sessionId)
        
        if (participantsError) {
          console.warn('Failed to load participants:', participantsError)
          setParticipants([])
        } else {
          setParticipants(sessionParticipants)
        }

        console.log('✅ Session data loaded successfully:', session)
        
      } catch (error) {
        console.error('Error loading session data:', error)
      } finally {
        setIsLoadingSession(false)
      }
    }

    loadSessionData()
  }, [sessionId])

  const copyJoinCode = () => {
    navigator.clipboard.writeText(sessionData?.code || "")
    toast.success("Join code copied to clipboard")
  }

  const shareSession = () => {
    const url = `${window.location.origin}/join-session?code=${sessionData?.code}`
    navigator.clipboard.writeText(url)
    toast.success("Session link copied to clipboard")
  }

  const handleConnectWallet = async () => {
    const connected = await connectWallet()
    if (connected) {
      // Check if on Base network, if not switch
      const BASE_SEPOLIA_CHAIN_ID = "0x14a34" // 84532 in hex
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseNetwork("sepolia")
      }
    }
  }

  const handlePaymentSuccess = async (amount: number) => {
    try {
      // Send payment through smart contract
      const result = await sendPayment({
        amount,
        sessionId,
        description: `Contribution to ${sessionData?.title}`,
      })

      if (result) {
        toast.success(`Payment successful! Transaction: ${result.transactionHash.slice(0, 10)}...`)
        
        // Reload blockchain session data to get updated amounts
        const updatedData = await getSessionData(sessionId)
        if (updatedData) {
          setBlockchainSessionData(updatedData)
        }

        // Update local session data
        setSessionData((prev: any) => ({
          ...prev,
          paymentPool: {
            ...prev.paymentPool,
            currentAmount: prev.paymentPool.currentAmount + amount * 100 * 650, // Convert ETH to Naira cents
            contributions: prev.paymentPool.contributions + 1,
          },
        }))

        // Refresh wallet balance
        const newBalance = await getBalance()
        setWalletBalance(newBalance)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    }
  }

  // Audio recording functions
  const startRecording = async () => {
    try {
      setRecordingError(null)
      
      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setRecordingError('Microphone access requires HTTPS. Please use a secure connection.')
        return
      }
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        setRecordingError('MediaDevices API not available. Use a modern browser over HTTPS.')
        return
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      })

      // Pick a supported mime type for the current browser
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg'
      ]
      const supportedType = preferredTypes.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) || ''
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream)
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const blobType = supportedType || 'audio/webm'
        const audioBlob = new Blob(chunks, { type: blobType })
        await sendAudioToTranscription(audioBlob)
        setAudioChunks([])
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start(5000)
      setMediaRecorder(recorder)
      setIsRecording(true)
      
      setRecordingTimeRemaining(60)
      const timer = setTimeout(() => {
        stopRecording()
        setIsMicOn(false)
        setRecordingTimeRemaining(0)
      }, 60000)
      setRecordingTimer(timer)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setRecordingError('Microphone permission denied. Please allow microphone access and try again.')
        } else if (error.name === 'NotFoundError') {
          setRecordingError('No microphone found. Please connect a microphone and try again.')
        } else if (error.name === 'NotReadableError') {
          setRecordingError('Microphone is being used by another application. Please close other apps and try again.')
        } else if (error.name === 'OverconstrainedError') {
          setRecordingError('Microphone constraints cannot be satisfied. Please try with different settings.')
        } else {
          setRecordingError(`Microphone error: ${error.message}`)
        }
      } else {
        setRecordingError('Failed to access microphone. Please check permissions and try again.')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
    
    if (recordingTimer) {
      clearTimeout(recordingTimer)
      setRecordingTimer(null)
    }
    setRecordingTimeRemaining(0)
  }

  const sendAudioToTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording_${Date.now()}`)
      formData.append('callbackUrl', `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/transcription/callback`)
      formData.append('languageCode', selectedLanguage)
      // Always send the actual session id
      formData.append('sessionId', sessionId)

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

  const handleMicToggle = () => {
    if (isMicOn) {
      stopRecording()
    } else {
      startRecording()
    }
    setIsMicOn(!isMicOn)
  }

  if (isLoadingSession || !sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className={`${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-background flex flex-col`}>
        {/* Navigation */}
        {!isFullscreen && (
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
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Live</span>
                  </Badge>
                  <Badge variant={user?.role === "lecturer" ? "default" : "outline"} className="text-xs">
                    {user?.role === "lecturer" ? "Lecturer" : "Student"}
                  </Badge>
                  {isConnected && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Wallet className="h-3 w-3" />
                      <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </Badge>
                  )}
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
            <div className="border-b border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold">{sessionData.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{sessionData.lecturer || 'Session Creator'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{sessionData.startTime ? new Date(sessionData.startTime).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{sessionData.participants?.length || participants.length} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.role === "lecturer" && (
                    <>
                      <Button variant="outline" size="sm" onClick={copyJoinCode}>
                        <Copy className="h-4 w-4 mr-2" />
                        {sessionData.code}
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareSession}>
                        <Share className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="border-b border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Caption Language:</span>
                  </div>
                  {user?.role === "lecturer" && isRecording && isMicOn && (
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
                  {user?.role === "lecturer" && (
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
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {recordingError}
                </div>
              )}
            </div>

            <div className="flex-1">
              {user?.role === "lecturer" ? (
                <CaptionDisplay
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
                      <span>{user?.role === "lecturer" ? "Class Pool" : "Contribute to Session"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Blockchain Session Info */}
                    {blockchainSessionData && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-blue-600">On-chain Amount:</span>
                          <span className="font-medium">{formatEther(blockchainSessionData.currentAmount)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Contributors:</span>
                          <span className="font-medium">{blockchainSessionData.contributionCount.toString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          ₦{((sessionData.paymentPool?.currentAmount || 0) / 100).toFixed(0)} / ₦
                          {((sessionData.paymentPool?.goalAmount || 0) / 100).toFixed(0)}
                        </span>
                      </div>
                      <Progress
                        value={((sessionData.paymentPool?.currentAmount || 0) / (sessionData.paymentPool?.goalAmount || 1)) * 100}
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === "lecturer" 
                        ? `${sessionData.paymentPool?.contributions || 0} students contributed`
                        : `Help fund this session with ${sessionData.paymentPool?.contributions || 0} other students`
                      }
                    </p>

                    {/* Wallet Info */}
                    {isConnected && walletBalance && (
                      <div className="text-xs text-muted-foreground">
                        Balance: {parseFloat(walletBalance).toFixed(4)} ETH
                      </div>
                    )}

                    {user?.role === "student" && (
                      <>
                        {!isConnected ? (
                          <Button size="sm" className="w-full" onClick={handleConnectWallet}>
                            <Wallet className="h-4 w-4 mr-2" />
                            Connect Wallet
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Button 
                              size="sm" 
                              className="w-full" 
                              onClick={() => setIsPaymentModalOpen(true)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Contribute with ETH"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full" 
                              onClick={disconnectWallet}
                            >
                              Disconnect Wallet
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {user?.role === "lecturer" && (
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
                      <span>Participants ({sessionData.participants?.length || participants.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(sessionData.participants || participants).map((participant: any) => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <span className="text-sm">
                            {participant.user?.full_name || participant.name || 'Anonymous'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {(participant.selected_language || participant.language || 'en').toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                      {(!sessionData.participants || sessionData.participants.length === 0) && participants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No participants yet
                        </p>
                      )}
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
    </AuthGuard>
  )
}