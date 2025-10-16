// Enhanced Transcription Types
// Provides comprehensive type definitions for transcription data

export type TranscriptionStatus = "queued" | "processing" | "completed" | "error"

export interface Transcription {
  id: string
  session_id: string
  text: string | null
  status: TranscriptionStatus
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

export interface TranscriptionQualityMetrics {
  averageConfidence: number
  totalTranscriptions: number
  successRate: number
  averageProcessingTime: number
  languageDistribution: Record<string, number>
}

export interface TranscriptionValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface TranscriptionAnalytics {
  sessionId: string
  totalTranscriptions: number
  totalWords: number
  totalCharacters: number
  averageConfidence: number
  languageDistribution: Record<string, number>
  processingTimeStats: {
    min: number
    max: number
    average: number
  }
}
