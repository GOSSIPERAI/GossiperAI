"use client"

/**
 * Optimized Supabase Realtime Transcriptions Hook
 * Enhanced with better error handling, reconnection logic, and performance optimizations
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RealtimeTranscription {
  id: string
  session_id: string
  text: string | null
  status: string
  assembly_ai_job_id: string
  confidence?: number
  language_code: string
  error_message?: string
  processing_time_ms?: number
  audio_duration_ms?: number
  word_count?: number
  character_count?: number
  created_at: string
  updated_at: string
}

interface UseRealtimeTranscriptionsOptions {
  sessionId: string
  enabled?: boolean
  onTranscriptionReceived?: (transcription: RealtimeTranscription) => void
  onError?: (error: string) => void
}

export function useRealtimeTranscriptions({
  sessionId,
  enabled = true,
  onTranscriptionReceived,
  onError,
}: UseRealtimeTranscriptionsOptions) {
  const [transcriptions, setTranscriptions] = useState<RealtimeTranscription[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // Use refs to track channel and prevent duplicate subscriptions
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(
    createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )

  // Fetch initial transcriptions
  const fetchInitialTranscriptions = useCallback(async () => {
    try {
      console.log("[Realtime] Fetching initial transcriptions for session:", sessionId)

      const { data, error: fetchError } = await supabaseRef.current
        .from("transcriptions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (fetchError) {
        console.error("[Realtime] Error fetching initial transcriptions:", fetchError)
        const errorMsg = `Failed to load transcriptions: ${fetchError.message}`
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      setTranscriptions(data || [])
      console.log("[Realtime] Initial transcriptions loaded:", data?.length || 0)
    } catch (err) {
      console.error("[Realtime] Error in fetchInitialTranscriptions:", err)
      const errorMsg = err instanceof Error ? err.message : "Unknown error loading transcriptions"
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [sessionId, onError])

  // Handle realtime payload with deduplication
  const handleRealtimeChange = useCallback(
    (payload: any) => {
      console.log("[Realtime] Received change:", payload.eventType, payload.new?.id)

      if (payload.eventType === "INSERT") {
        const newTranscription = payload.new as RealtimeTranscription
        console.log("[Realtime] New transcription:", {
          id: newTranscription.id,
          text: newTranscription.text?.substring(0, 50),
          status: newTranscription.status,
          confidence: newTranscription.confidence,
        })

        setTranscriptions((prev) => {
          // Avoid duplicates
          if (prev.some((t) => t.id === newTranscription.id)) {
            console.log("[Realtime] Duplicate transcription ignored:", newTranscription.id)
            return prev
          }
          return [...prev, newTranscription]
        })

        onTranscriptionReceived?.(newTranscription)
      } else if (payload.eventType === "UPDATE") {
        const updatedTranscription = payload.new as RealtimeTranscription
        console.log("[Realtime] Transcription updated:", updatedTranscription.id)

        setTranscriptions((prev) => prev.map((t) => (t.id === updatedTranscription.id ? updatedTranscription : t)))
      } else if (payload.eventType === "DELETE") {
        const deletedId = payload.old.id
        console.log("[Realtime] Transcription deleted:", deletedId)

        setTranscriptions((prev) => prev.filter((t) => t.id !== deletedId))
      }
    },
    [onTranscriptionReceived],
  )

  // Setup realtime subscription with reconnection logic
  useEffect(() => {
    if (!enabled) {
      console.log("[Realtime] Hook disabled, skipping subscription")
      return
    }

    console.log("[Realtime] Setting up realtime subscription for session:", sessionId)

    // Fetch initial data
    fetchInitialTranscriptions()

    // Clean up existing channel if any
    if (channelRef.current) {
      console.log("[Realtime] Cleaning up existing channel")
      supabaseRef.current.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Create new channel with unique name
    const channelName = `transcriptions:${sessionId}:${Date.now()}`
    const channel = supabaseRef.current
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transcriptions",
          filter: `session_id=eq.${sessionId}`,
        },
        handleRealtimeChange,
      )
      .subscribe((status) => {
        console.log("[Realtime] Subscription status:", status)

        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          setError(null)
          setReconnectAttempts(0)
          console.log("[Realtime] Successfully subscribed to transcriptions channel")
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false)
          const errorMsg = "Failed to connect to realtime channel"
          setError(errorMsg)
          onError?.(errorMsg)
          console.error("[Realtime] Channel error")

          // Attempt reconnection with exponential backoff
          const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          console.log(`[Realtime] Attempting reconnection in ${backoffDelay}ms`)
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1)
          }, backoffDelay)
        } else if (status === "TIMED_OUT") {
          setIsConnected(false)
          const errorMsg = "Connection timed out"
          setError(errorMsg)
          onError?.(errorMsg)
          console.error("[Realtime] Connection timed out")
        } else if (status === "CLOSED") {
          setIsConnected(false)
          console.log("[Realtime] Channel closed")
        }
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      console.log("[Realtime] Cleaning up subscription for session:", sessionId)
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [sessionId, enabled, handleRealtimeChange, fetchInitialTranscriptions, reconnectAttempts, onError])

  const clearTranscriptions = useCallback(() => {
    setTranscriptions([])
  }, [])

  const refetch = useCallback(() => {
    fetchInitialTranscriptions()
  }, [fetchInitialTranscriptions])

  return {
    transcriptions,
    isConnected,
    error,
    reconnectAttempts,
    clearTranscriptions,
    refetch,
  }
}
