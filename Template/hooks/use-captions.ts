"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useWebSocket } from "./use-websocket"

export interface Caption {
  id: string
  originalText: string
  translations: Record<string, string>
  timestamp: Date
  speakerId: string
  confidence: number
  isLive?: boolean
}

interface UseCaptionsOptions {
  sessionId: string
  maxCaptions?: number
  autoScroll?: boolean
}

export function useCaptions({ sessionId, maxCaptions = 100, autoScroll = true }: UseCaptionsOptions) {
  const [captions, setCaptions] = useState<Caption[]>([])
  const [isReceiving, setIsReceiving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captionsContainerRef = useRef<HTMLDivElement>(null)

  const handleWebSocketMessage = useCallback(
    (message: any) => {
      if (message.type === "caption" && message.sessionId === sessionId) {
        const newCaption: Caption = {
          ...message.data,
          isLive: true,
        }

        setCaptions((prev) => {
          const updated = [...prev, newCaption]
          // Keep only the most recent captions
          if (updated.length > maxCaptions) {
            return updated.slice(-maxCaptions)
          }
          return updated
        })

        setIsReceiving(true)
        // Reset receiving indicator after a delay
        setTimeout(() => setIsReceiving(false), 2000)
      }
    },
    [sessionId, maxCaptions],
  )

  const handleWebSocketError = useCallback((error: Event) => {
    setError("Connection lost. Attempting to reconnect...")
    setTimeout(() => setError(null), 5000)
  }, [])

  const handleWebSocketConnect = useCallback(() => {
    setError(null)
  }, [])

  const { isConnected, connectionStatus, sendMessage } = useWebSocket(
    `wss://api.gossiper.com/ws/captions/${sessionId}`,
    {
      onMessage: handleWebSocketMessage,
      onError: handleWebSocketError,
      onConnect: handleWebSocketConnect,
    },
  )

  // Auto-scroll to latest caption
  useEffect(() => {
    if (autoScroll && captionsContainerRef.current) {
      const container = captionsContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [captions, autoScroll])

  const clearCaptions = useCallback(() => {
    setCaptions([])
  }, [])

  const exportCaptions = useCallback(
    (language = "en") => {
      const exportData = captions.map((caption) => ({
        timestamp: caption.timestamp.toISOString(),
        text: language === "en" ? caption.originalText : caption.translations[language] || caption.originalText,
        speaker: caption.speakerId,
        confidence: caption.confidence,
      }))

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `captions-${sessionId}-${language}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [captions, sessionId],
  )

  const searchCaptions = useCallback(
    (query: string, language = "en") => {
      if (!query.trim()) return captions

      return captions.filter((caption) => {
        const text = language === "en" ? caption.originalText : caption.translations[language] || caption.originalText
        return text.toLowerCase().includes(query.toLowerCase())
      })
    },
    [captions],
  )

  return {
    captions,
    isConnected,
    connectionStatus,
    isReceiving,
    error,
    captionsContainerRef,
    clearCaptions,
    exportCaptions,
    searchCaptions,
    sendMessage,
  }
}
