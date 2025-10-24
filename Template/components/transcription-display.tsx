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
  RefreshCw,
  Trash2,
  Play,
  Pause,
} from "lucide-react"
import { useTranscription, type TranscriptionResult } from "@/hooks/use-transcription"

interface TranscriptionDisplayProps {
  sessionId: string
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  availableLanguages: { code: string; name: string }[]
  className?: string
}

export function TranscriptionDisplay({
  sessionId,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  className = "",
}: TranscriptionDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [isPollingEnabled, setIsPollingEnabled] = useState(false) // Default to paused
  const [autoPauseTimer, setAutoPauseTimer] = useState<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    results,
    isLoading,
    error,
    clearResults,
    getLatestResult,
    refetch
  } = useTranscription({ 
    sessionId, 
    enabled: isPollingEnabled,
    pollInterval: 3000 // Poll every 3 seconds
  })

  // Auto-scroll to latest result
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [results, autoScroll])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoPauseTimer) {
        clearTimeout(autoPauseTimer)
      }
    }
  }, [autoPauseTimer])

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const countdownTimer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(countdownTimer)
    }
  }, [timeRemaining])

  const copyText = async (result: TranscriptionResult) => {
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

  const togglePolling = () => {
    const newPollingState = !isPollingEnabled
    setIsPollingEnabled(newPollingState)
    
    if (newPollingState) {
      // Start polling - set auto-pause timer for 60 seconds
      setTimeRemaining(60)
      const timer = setTimeout(() => {
        setIsPollingEnabled(false)
        setAutoPauseTimer(null)
        setTimeRemaining(0)
      }, 60000) // 60 seconds
      setAutoPauseTimer(timer)
    } else {
      // Stop polling - clear any existing timer
      if (autoPauseTimer) {
        clearTimeout(autoPauseTimer)
        setAutoPauseTimer(null)
      }
      setTimeRemaining(0)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`} role="region" aria-label="Transcription display">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card" style={{ paddingLeft: '72px' }}>
        <div className="flex items-center space-x-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            {isPollingEnabled ? (
              isLoading ? (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-500" />
              )
            ) : (
              <Pause className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isPollingEnabled 
                ? (isLoading ? "Processing..." : `Live Transcription${timeRemaining > 0 ? ` (${timeRemaining}s)` : ""}`) 
                : "Polling Paused"
              }
            </span>
            {results.length > 0 && (
              <Badge variant="secondary" className={isPollingEnabled ? "animate-pulse" : ""}>
                {results.length} result{results.length !== 1 ? "s" : ""}
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
            onClick={togglePolling}
            aria-label={isPollingEnabled ? "Pause polling" : "Resume polling"}
            title={isPollingEnabled ? "Pause automatic updates" : "Resume automatic updates"}
          >
            {isPollingEnabled ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            aria-label="Refresh transcription results"
            title="Manually refresh transcription results"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
          </div>
        </div>
      )}

      {/* Transcription Results Display - with left spacing */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-8 py-6"
        style={{ paddingLeft: '72px' }}
        role="log"
        aria-live="polite"
        aria-label="Transcription results feed"
        tabIndex={0}
      >
        {results.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              {isPollingEnabled ? (
                <Volume2 className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              ) : (
                <Pause className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              )}
              <p>
                {isPollingEnabled 
                  ? "Waiting for transcription..." 
                  : "Polling paused"
                }
              </p>
              <p className="text-sm">
                {isPollingEnabled 
                  ? "Transcription results will appear here when the lecturer starts speaking"
                  : "Click the play button to start listening for transcription (auto-pauses after 60s)"
                }
              </p>
            </div>
          </div>
        ) : (
          results.map((result) => (
            <Card key={result.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="space-y-2">
                {/* Result Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <time className="text-xs text-muted-foreground" dateTime={result.timestamp.toISOString()}>
                      {formatTimestamp(result.timestamp)}
                    </time>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(result.confidence * 100)}% confidence
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getConfidenceColor(result.confidence)}`}
                    >
                      {result.status}
                    </Badge>
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
                <div className="text-base leading-relaxed text-pretty">
                  {result.text}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Result Count */}
      <div className="p-2 border-t border-border bg-muted/30 text-center" role="status" aria-live="polite">
        <span className="text-xs text-muted-foreground">
          {results.length} transcription result{results.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}
