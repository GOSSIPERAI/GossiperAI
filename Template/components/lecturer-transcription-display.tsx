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
  Download,
  Settings,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { useRealtimeTranscription, type RealtimeTranscriptionResult } from "@/hooks/use-realtime-transcription"

interface LecturerTranscriptionDisplayProps {
  sessionId: string
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  availableLanguages: { code: string; name: string }[]
  className?: string
}

export function LecturerTranscriptionDisplay({
  sessionId,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  className = "",
}: LecturerTranscriptionDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
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
      console.log('🎤 [LECTURER] New transcript received:', result)
    }
  })

  // Auto-scroll to latest result
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [results, currentPartial, autoScroll])

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

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-lg"
      case "large":
        return "text-3xl"
      default:
        return "text-2xl"
    }
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

  const exportTranscripts = () => {
    const transcriptText = results
      .map(result => `[${formatTimestamp(result.timestamp)}] ${result.text}`)
      .join('\n\n')
    
    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${sessionId}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getConnectionStatus = () => {
    if (isConnecting) return { icon: Loader2, text: "Connecting...", color: "text-blue-500" }
    if (isConnected) return { icon: Wifi, text: "Connected", color: "text-green-500" }
    return { icon: WifiOff, text: "Disconnected", color: "text-red-500" }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  return (
    <div className={`flex flex-col h-full ${className}`} role="region" aria-label="Lecturer transcription display">
      {/* Controls Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/95 backdrop-blur" style={{ paddingLeft: '72px' }}>
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
            onClick={exportTranscripts}
            disabled={results.length === 0}
            aria-label="Export transcripts"
            title="Export transcripts to text file"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFontSize(fontSize === "small" ? "medium" : fontSize === "medium" ? "large" : "small")}
            aria-label="Toggle font size"
            title="Toggle font size"
          >
            <Settings className="h-4 w-4" />
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
        className={`flex-1 overflow-y-auto pr-8 py-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
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
              ) : null}
              <p className="text-lg font-medium">Click the microphone button above to start recording</p>
              <p className="text-sm">
                Real-time transcription will appear here in {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Display completed results */}
            {results.map((result, index) => (
              <div key={result.id} className="group">
                {/* Transcription Text - Large and readable */}
                <div className={`${getFontSizeClass()} leading-relaxed font-medium text-foreground mb-2`}>
                  {result.text}
                </div>
                
                {/* Result metadata - Subtle */}
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <time className="text-xs text-muted-foreground" dateTime={result.timestamp.toISOString()}>
                    {formatTimestamp(result.timestamp)}
                  </time>
                  <Badge variant="outline" className="text-xs">
                    {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getConfidenceColor(result.confidence)}`}
                  >
                    {result.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(result)}
                    className="h-6 px-2"
                    aria-label="Copy transcription"
                  >
                    {copiedId === result.id ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                
                {/* Divider */}
                {index < results.length - 1 && (
                  <div className="mt-6 border-b border-border/30"></div>
                )}
              </div>
            ))}

            {/* Display current partial transcript */}
            {currentPartial && (
              <div className="group">
                <div className={`${getFontSizeClass()} leading-relaxed font-medium text-primary/80 mb-2`}>
                  {currentPartial}
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Live
                  </Badge>
                  <time className="text-xs text-muted-foreground" dateTime={new Date().toISOString()}>
                    {formatTimestamp(new Date())}
                  </time>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
