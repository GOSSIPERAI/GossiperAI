"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Copy, CheckCircle, RefreshCw, Trash2, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useRealtimeTranscriptions } from "@/hooks/use-realtime-transcriptions"

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
  const containerRef = useRef<HTMLDivElement>(null)

  const { transcriptions, isConnected, error, reconnectAttempts, clearTranscriptions, refetch } =
    useRealtimeTranscriptions({
      sessionId,
      enabled: true,
      onTranscriptionReceived: (transcription) => {
        console.log("[UI] New transcription received:", transcription.text?.substring(0, 50))
      },
      onError: (errorMsg) => {
        console.error("[UI] Realtime error:", errorMsg)
      },
    })

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [transcriptions, autoScroll])

  const copyText = async (transcription: any) => {
    await navigator.clipboard.writeText(transcription.text)
    setCopiedId(transcription.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp))
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500"
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={`flex flex-col h-full ${className}`} role="region" aria-label="Real-time transcription display">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <span className="text-sm text-muted-foreground">
              {isConnected
                ? "Connected"
                : reconnectAttempts > 0
                  ? `Reconnecting (${reconnectAttempts})...`
                  : "Disconnected"}
            </span>
            {transcriptions.length > 0 && (
              <Badge variant="secondary" className={isConnected ? "animate-pulse" : ""}>
                {transcriptions.length} result{transcriptions.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
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
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            aria-label="Refresh transcription results"
            title="Manually refresh transcription results"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearTranscriptions}
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
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Transcription Results Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Real-time transcription feed"
        tabIndex={0}
      >
        {transcriptions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              {isConnected ? (
                <Volume2 className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              ) : (
                <WifiOff className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              )}
              <p>{isConnected ? "Waiting for transcription..." : "Connecting to real-time feed..."}</p>
              <p className="text-sm">
                {isConnected
                  ? "Transcription results will appear here instantly when the lecturer starts speaking"
                  : "Establishing connection to receive live transcriptions"}
              </p>
            </div>
          </div>
        ) : (
          transcriptions.map((transcription) => (
            <Card key={transcription.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="space-y-2">
                {/* Result Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <time className="text-xs text-muted-foreground" dateTime={transcription.created_at}>
                      {formatTimestamp(transcription.created_at)}
                    </time>
                    {transcription.confidence !== undefined && transcription.confidence !== null && (
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(transcription.confidence)}`}>
                        {Math.round(transcription.confidence * 100)}% confidence
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {transcription.status}
                    </Badge>
                    {isConnected && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        Live
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(transcription)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Copy transcription: ${transcription.text?.substring(0, 50)}...`}
                  >
                    {copiedId === transcription.id ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Transcription Text */}
                <div className="text-base leading-relaxed text-pretty">{transcription.text || "(No text)"}</div>

                {transcription.word_count !== undefined && transcription.word_count !== null && (
                  <div className="text-xs text-muted-foreground">{transcription.word_count} words</div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Result Count */}
      <div className="p-2 border-t border-border bg-muted/30 text-center" role="status" aria-live="polite">
        <span className="text-xs text-muted-foreground">
          {transcriptions.length} transcription result{transcriptions.length !== 1 ? "s" : ""}
          {isConnected && " • Real-time updates enabled"}
        </span>
      </div>
    </div>
  )
}
