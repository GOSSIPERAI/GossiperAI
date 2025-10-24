"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export interface RealtimeTranscriptionResult {
  id: string
  text: string
  confidence: number
  timestamp: Date
  status: 'partial' | 'final'
  sessionId: string
}

interface UseRealtimeTranscriptionOptions {
  sessionId: string
  languageCode?: string
  enabled?: boolean
  onTranscript?: (result: RealtimeTranscriptionResult) => void
}

export function useRealtimeTranscription({
  sessionId,
  languageCode = 'en',
  enabled = true,
  onTranscript
}: UseRealtimeTranscriptionOptions) {
  const [results, setResults] = useState<RealtimeTranscriptionResult[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPartial, setCurrentPartial] = useState<string>('')
  
  const transcriberRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioBufferRef = useRef<Int16Array[]>([])
  const resultIdCounter = useRef(0)
  const isInitializingRef = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLanguageRef = useRef(languageCode)

  // Initialize AssemblyAI streaming transcriber
  const initializeTranscriber = useCallback(async () => {
    if (!enabled || !sessionId) return
    
    // Prevent multiple simultaneous initialization attempts
    if (isInitializingRef.current) {
      console.log('🎤 [REALTIME] Already initializing, skipping...')
      return
    }

    // If already connected and language hasn't changed, don't reinitialize
    if (transcriberRef.current && isConnected && lastLanguageRef.current === languageCode) {
      console.log('🎤 [REALTIME] Already connected with same language, skipping initialization')
      return
    }

    // Clean up any existing transcriber first
    if (transcriberRef.current) {
      console.log('🎤 [REALTIME] Cleaning up existing transcriber before creating new one')
      try {
        await transcriberRef.current.close()
      } catch (err) {
        console.warn('🎤 [REALTIME] Error closing existing transcriber:', err)
      }
      transcriberRef.current = null
      setIsConnected(false)
    }

    try {
      isInitializingRef.current = true
      setIsConnecting(true)
      setError(null)

      // Get streaming token from our API
      const response = await fetch('/api/transcription/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, languageCode })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('🎤 [REALTIME] Token request failed:', { status: response.status, error: errorData })
        throw new Error(`Failed to get streaming token: ${response.status} ${errorData}`)
      }

      const data = await response.json()
      console.log('🎤 [REALTIME] Token response received:', { success: data.success, hasToken: !!data.token })
      
      if (!data.success || !data.token) {
        throw new Error('Invalid token response from server')
      }
      
      const { token } = data

      // Dynamically import AssemblyAI SDK
      const { StreamingTranscriber } = await import('assemblyai')
      
      console.log('🎤 [REALTIME] Creating transcriber instance with token:', token ? 'present' : 'missing')
      
      // Create transcriber instance using recommended configuration
      const transcriber = new StreamingTranscriber({
        token,
        sampleRate: 16000,
        languageCode: languageCode,
        formatTurns: true,
        wordBoost: ['lecture', 'class', 'student', 'teacher', 'professor'],
        // Add additional configuration for better stability
        disablePunctuation: false,
        disableEntityDetection: false,
      })

      // Set up event listeners
      transcriber.on('open', ({ id, expires_at }) => {
        console.log('🎤 [REALTIME] Session opened:', { id, expires_at })
        
        // Connection is ready when 'open' event fires
        console.log('🎤 [REALTIME] Connection established successfully')
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        lastLanguageRef.current = languageCode
        
        // Clear any pending reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      })

      transcriber.on('close', (code: number, reason: string) => {
        console.log('🎤 [REALTIME] Session closed:', { code, reason })
        setIsConnected(false)
        setIsConnecting(false)
        
        // Clean up transcriber reference
        transcriberRef.current = null
        
        // Auto-reconnect unless it's a user-initiated disconnect or language change
        if (enabled && sessionId && code !== 1000 && !reason.includes('Language changed')) {
          console.log('🎤 [REALTIME] Attempting to reconnect in 2 seconds...')
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeTranscriber()
          }, 2000)
        }
      })

      transcriber.on('turn', ({ transcript, confidence }) => {
        console.log('🎤 [REALTIME] Turn received:', { transcript, confidence })
        
        // Only skip if transcript is completely empty or just whitespace
        if (!transcript || transcript.trim().length === 0) {
          console.log('🎤 [REALTIME] Empty transcript received, skipping')
          return
        }
        
        const result: RealtimeTranscriptionResult = {
          id: `realtime-${resultIdCounter.current++}`,
          text: transcript.trim(),
          confidence: confidence || 0.9,
          timestamp: new Date(),
          status: 'final',
          sessionId,
        }

        console.log('🎤 [REALTIME] Adding result to state:', result)
        setResults(prev => {
          const newResults = [...prev, result]
          console.log('🎤 [REALTIME] Updated results count:', newResults.length)
          return newResults
        })
        setCurrentPartial('')
        onTranscript?.(result)
      })

      transcriber.on('turn.partial', ({ transcript }) => {
        console.log('🎤 [REALTIME] Partial turn:', transcript)
        setCurrentPartial(transcript || '')
      })

      transcriber.on('error', (error: Error) => {
        console.error('🎤 [REALTIME] Error:', error)
        
        // Handle specific "too many concurrent sessions" error
        if (error.message.includes('Too many concurrent sessions')) {
          setError('Too many active sessions. Please wait a moment and try again.')
          // Clean up and wait before allowing reconnection
          transcriberRef.current = null
          setIsConnected(false)
          setTimeout(() => {
            setIsConnecting(false)
            isInitializingRef.current = false
          }, 5000)
        } else {
          setError(error.message)
          setIsConnecting(false)
          setIsConnected(false)
        }
      })

      transcriberRef.current = transcriber

      // Connect to AssemblyAI
      await transcriber.connect()

    } catch (err) {
      console.error('🎤 [REALTIME] Failed to initialize:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize transcription')
      setIsConnecting(false)
    } finally {
      isInitializingRef.current = false
    }
  }, [sessionId, languageCode, enabled, onTranscript])

  // Start audio capture and streaming
  const startRecording = useCallback(async () => {
    if (!transcriberRef.current || !isConnected) {
      console.warn('🎤 [REALTIME] Cannot start recording - not connected')
      return
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      })

      streamRef.current = stream

      // Create AudioContext for proper audio processing
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      // Create audio source from microphone
      const source = audioContext.createMediaStreamSource(stream)
      
      // Create script processor for real-time audio processing
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      // Process audio in real-time
      processor.onaudioprocess = (event) => {
        if (!transcriberRef.current || !isConnected) return

        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        
        // Convert float32 to int16
        const int16Array = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        // Buffer audio data
        audioBufferRef.current.push(int16Array)
        
        // Send buffered audio when we have enough data (at least 8000 samples = 500ms at 16kHz)
        const minSamples = 8000 // 500ms worth of samples
        let totalSamples = 0
        for (const buffer of audioBufferRef.current) {
          totalSamples += buffer.length
        }

        if (totalSamples >= minSamples) {
          // Combine all buffered audio
          const combinedBuffer = new Int16Array(totalSamples)
          let offset = 0
          for (const buffer of audioBufferRef.current) {
            combinedBuffer.set(buffer, offset)
            offset += buffer.length
          }

          try {
            console.log('🎤 [REALTIME] Sending audio to transcriber:', { 
              samples: combinedBuffer.length, 
              duration_ms: (combinedBuffer.length / 16000) * 1000 
            })
            transcriberRef.current.sendAudio(combinedBuffer.buffer)
            
            // Clear buffer after sending
            audioBufferRef.current = []
          } catch (err) {
            console.warn('🎤 [REALTIME] Error sending audio:', err)
            if (err.message.includes('Socket is not open')) {
              console.log('🎤 [REALTIME] Socket closed, marking as disconnected')
              setIsConnected(false)
              transcriberRef.current = null
            }
          }
        }
      }

      // Connect audio nodes
      source.connect(processor)
      processor.connect(audioContext.destination)

      setIsRecording(true)
      console.log('🎤 [REALTIME] Recording started')

    } catch (err) {
      console.error('🎤 [REALTIME] Failed to start recording:', err)
      setError('Failed to access microphone')
    }
  }, [isConnected])

  // Stop recording
  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    // Clean up AudioContext
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Clear audio buffer
    audioBufferRef.current = []

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
    console.log('🎤 [REALTIME] Recording stopped')
  }, [])

  // Disconnect transcriber
  const disconnect = useCallback(async () => {
    stopRecording()
    
    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (transcriberRef.current) {
      try {
        await transcriberRef.current.close()
      } catch (err) {
        console.error('🎤 [REALTIME] Error closing transcriber:', err)
      }
      transcriberRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    isInitializingRef.current = false
  }, [stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Initialize when enabled (with debouncing to prevent rapid reconnections)
  useEffect(() => {
    if (enabled && sessionId) {
      // Add a small delay to prevent rapid reconnections
      const timer = setTimeout(() => {
        initializeTranscriber()
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      disconnect()
    }
  }, [enabled, sessionId, initializeTranscriber, disconnect])

  // Reinitialize when language changes
  useEffect(() => {
    if (enabled && sessionId && transcriberRef.current && isConnected && lastLanguageRef.current !== languageCode) {
      console.log('🎤 [REALTIME] Language changed, reinitializing transcriber')
      disconnect()
      setTimeout(() => {
        initializeTranscriber()
      }, 500)
    }
  }, [languageCode])

  const clearResults = useCallback(() => {
    setResults([])
    setCurrentPartial('')
  }, [])

  const retryConnection = useCallback(async () => {
    console.log('🎤 [REALTIME] Manual retry connection requested')
    await disconnect()
    // Wait a moment before reconnecting
    setTimeout(() => {
      initializeTranscriber()
    }, 1000)
  }, [disconnect, initializeTranscriber])

  return {
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
    retryConnection,
  }
}
