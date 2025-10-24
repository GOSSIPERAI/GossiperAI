"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Volume2,
  Copy,
  CheckCircle,
  Mic,
  MicOff,
  Trash2,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react"
import { useRealtimeTranscription, type RealtimeTranscriptionResult } from "@/hooks/use-realtime-transcription"

interface RealtimeTranscriptionDisplayProps {
  sessionId: string
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  availableLanguages: { code: string; name: string }[]
  className?: string
}

export function RealtimeTranscriptionDisplay({
  sessionId,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  className = "",
}: RealtimeTranscriptionDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    results,
    currentPartial,
    isConnected,
    isConnecting,
    isRecording,
    error,
    startRecording,
    stopRecording,
    disconnect,
    clearResults,
    initializeTranscriber,
  } = useRealtimeTranscription({
    sessionId,
    languageCode: selectedLanguage,
    enabled: true,
    onTranscript: (result) => {
      console.log('🎤 [DISPLAY] New transcript received:', result)
    }
  })

  // Debug logging
  useEffect(() => {
    console.log('🎤 [DISPLAY] Results updated:', { count: results.length, results })
  }, [results])

  // Auto-scroll to latest result
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [results, currentPartial, autoScroll])

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
      setShowScrollButton(!isAtBottom)
      
      // Auto-disable auto-scroll if user scrolls up
      if (!isAtBottom && autoScroll) {
        setAutoScroll(false)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [autoScroll])

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      setAutoScroll(true)
    }
  }

  const copyText = async (result: RealtimeTranscriptionResult) => {
    await navigator.clipboard.writeText(result.text)
    setCopiedId(result.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      if (!isConnected) {
        await initializeTranscriber()
      }
      await startRecording()
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage)
    // The hook will automatically reinitialize when languageCode changes
    // No need to manually disconnect and reconnect here
  }

  const getConnectionStatus = () => {
    if (isConnecting) return { icon: Loader2, text: "Connecting...", color: "text-blue-500" }
    if (isConnected) return { icon: Wifi, text: "Connected", color: "text-green-500" }
    return { icon: WifiOff, text: "Disconnected", color: "text-red-500" }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  return (
    <div className={`flex flex-col h-full ${className}`} role="region" aria-label="Real-time transcription display">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card" style={{ paddingLeft: '72px' }}>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-4 w-4 ${connectionStatus.color} ${isConnecting ? 'animate-spin' : ''}`} />
            <span className="text-sm text-muted-foreground">
              {connectionStatus.text}
            </span>
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">Recording</span>
              </div>
            )}
            {results.length > 0 && (
              <Badge variant="secondary" className={isRecording ? "animate-pulse" : ""}>
                {results.length} transcript{results.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-48" aria-label="Select transcription language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={handleRecordToggle}
            disabled={isConnecting}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            title={isRecording ? "Stop recording audio" : "Start recording audio"}
            className={isRecording ? "animate-pulse" : ""}
          >
            {isRecording ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={autoScroll ? "bg-green-50 border-green-300 text-green-700" : ""}
            aria-label={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            title={autoScroll ? "Auto-scroll is ON - new messages will automatically scroll into view" : "Auto-scroll is OFF - click to enable"}
          >
            {autoScroll ? (
              <ArrowDown className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
            aria-label="Clear all transcription results"
            title="Clear all transcription results"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20" role="alert">
          <div className="flex items-center space-x-2 text-destructive">
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initializeTranscriber()}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Transcription Results Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-8 py-6"
        style={{ paddingLeft: '72px' }}
        role="log"
        aria-live="polite"
        aria-label="Real-time transcription results feed"
        tabIndex={0}
      >
        {results.length === 0 && !currentPartial && !isConnecting && !isRecording ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-4">
              {!isConnected ? (
                <WifiOff className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              ) : (
                <Mic className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              )}
              <p className="text-lg">
                {isConnected 
                  ? "Click the microphone button above to start recording" 
                  : "Connecting to transcription service..."
                }
              </p>
              <p className="text-sm">
                {isConnected 
                  ? `Real-time transcription will appear here in ${availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage} as you speak`
                  : "Please wait while we establish the connection"
                }
              </p>
            </div>
          </div>
        ) : results.length === 0 && !currentPartial && isRecording ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="relative">
                <Mic className="h-16 w-16 text-red-500 mx-auto animate-pulse" aria-hidden="true" />
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <p className="text-lg text-gray-900">
                Listening for speech...
              </p>
              <p className="text-sm text-gray-600">
                Speak clearly into your microphone. Transcriptions will appear here.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Recording in {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Display completed results */}
            {results.map((result, index) => {
              // Check if this result is similar to the previous one (likely a duplicate)
              const isDuplicate = index > 0 && 
                results[index - 1] && 
                result.text.toLowerCase().trim() === results[index - 1].text.toLowerCase().trim()
              
              // Check if this result is a continuation of the previous one
              const isContinuation = index > 0 && 
                results[index - 1] && 
                result.text.toLowerCase().startsWith(results[index - 1].text.toLowerCase().substring(0, 20))

              if (isDuplicate) {
                // Don't display exact duplicates, just update the timestamp
                return null
              }

              return (
                <Card 
                  key={result.id} 
                  className={`p-4 hover:shadow-md transition-all duration-200 group mb-3 ${
                    isContinuation 
                      ? 'border-l-4 border-l-blue-400 bg-blue-50/30' 
                      : 'border-l-4 border-l-green-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Result Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <time className="text-xs text-muted-foreground font-mono" dateTime={result.timestamp.toISOString()}>
                          {formatTimestamp(result.timestamp)}
                        </time>
                        <Badge variant="outline" className="text-xs bg-white">
                          {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getConfidenceColor(result.confidence)}`}
                        >
                          {Math.round(result.confidence * 100)}%
                        </Badge>
                        {isContinuation && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            Update
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyText(result)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Copy transcription: ${result.text.substring(0, 50)}...`}
                      >
                        {copiedId === result.id ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Transcription Text */}
                    <div className={`text-base leading-relaxed text-pretty ${
                      isContinuation ? 'text-blue-900 font-medium' : 'text-gray-900'
                    }`}>
                      {result.text}
                    </div>

                    {/* Confidence indicator */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            result.confidence >= 0.8 ? 'bg-green-500' :
                            result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {result.status === 'final' ? '✓ Final' : '⏳ Partial'}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            }).filter(Boolean)}

            {/* Display current partial transcript */}
            {currentPartial && (
              <Card className="p-6 border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 mb-4 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs animate-pulse bg-blue-100 border-blue-300 text-blue-700">
                      🔴 Live
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(new Date())}
                    </span>
                  </div>
                  <div className="text-lg leading-relaxed text-blue-900 font-medium">
                    {currentPartial}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">Transcribing...</span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-6 right-6 z-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          aria-label="Scroll to latest transcription"
          title="Scroll to latest transcription"
        >
          <ArrowDown className="h-5 w-5 mr-2" />
          New Messages
        </Button>
      )}

      {/* Result Count and Status */}
      <div className="p-2 border-t border-border bg-muted/30 text-center" role="status" aria-live="polite">
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <span>
            {results.length} transcription result{results.length !== 1 ? "s" : ""}
          </span>
          {isRecording && (
            <span className="flex items-center space-x-1">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span>Live transcription active</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
