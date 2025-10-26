"use client"

import { useState, useEffect, useCallback } from 'react'

export interface TranscriptionResult {
  id: string
  text: string
  confidence: number
  timestamp: Date
  status: string
  audioUrl?: string
}

/**
 * @deprecated This hook uses polling and has been replaced by useRealtimeTranscriptions
 * which uses Supabase Realtime for instant updates. Use useRealtimeTranscriptions instead.
 */
interface UseTranscriptionOptions {
  sessionId: string
  enabled?: boolean
  pollInterval?: number
}

export function useTranscription({ 
  sessionId, 
  enabled = true, 
  pollInterval = 2000 
}: UseTranscriptionOptions) {
  const [results, setResults] = useState<TranscriptionResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTranscriptionResults = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 [CLIENT] Fetching transcription results for session:', sessionId)
      const url = `/api/transcription/callback?sessionId=${sessionId}`
      console.log('🔄 [CLIENT] Fetch URL:', url)

      const response = await fetch(url)
      
      console.log('🔄 [CLIENT] Response status:', response.status)
      console.log('🔄 [CLIENT] Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔄 [CLIENT] Response not OK:', { status: response.status, errorText })
        throw new Error(`Failed to fetch transcription results: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('🔄 [CLIENT] Response data:', data)
      
      if (data.success && data.results) {
        // Convert timestamp strings back to Date objects
        const processedResults = data.results.map((result: any) => ({
          ...result,
          timestamp: new Date(result.timestamp)
        }))
        
        console.log('🔄 [CLIENT] Processed results:', processedResults)
        setResults(processedResults)
      } else {
        console.log('🔄 [CLIENT] No results in response or not successful')
      }
    } catch (err) {
      console.error('🔄 [CLIENT] Error fetching transcription results:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, enabled])

  // Poll for new results
  useEffect(() => {
    if (!enabled) return

    // Fetch immediately
    fetchTranscriptionResults()

    // Set up polling
    const interval = setInterval(fetchTranscriptionResults, pollInterval)

    return () => clearInterval(interval)
  }, [fetchTranscriptionResults, enabled, pollInterval])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  const getLatestResult = useCallback(() => {
    return results.length > 0 ? results[results.length - 1] : null
  }, [results])

  return {
    results,
    isLoading,
    error,
    clearResults,
    getLatestResult,
    refetch: fetchTranscriptionResults
  }
}
