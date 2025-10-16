// Transcription Analytics Utilities
// Foundation for future analytics and reporting

import type { Transcription, TranscriptionAnalytics, TranscriptionQualityMetrics } from "@/lib/types/transcription"

export class TranscriptionAnalyticsService {
  /**
   * Calculates quality metrics for a set of transcriptions
   */
  static calculateQualityMetrics(transcriptions: Transcription[]): TranscriptionQualityMetrics {
    if (transcriptions.length === 0) {
      return {
        averageConfidence: 0,
        totalTranscriptions: 0,
        successRate: 0,
        averageProcessingTime: 0,
        languageDistribution: {},
      }
    }

    const completedTranscriptions = transcriptions.filter((t) => t.status === "completed")
    const confidenceValues = transcriptions
      .filter((t) => t.confidence !== undefined && t.confidence !== null)
      .map((t) => t.confidence!)

    const processingTimes = transcriptions
      .filter((t) => t.processing_time_ms !== undefined && t.processing_time_ms !== null)
      .map((t) => t.processing_time_ms!)

    const languageDistribution: Record<string, number> = {}
    transcriptions.forEach((t) => {
      const lang = t.language_code || "unknown"
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
    })

    return {
      averageConfidence:
        confidenceValues.length > 0 ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length : 0,
      totalTranscriptions: transcriptions.length,
      successRate: transcriptions.length > 0 ? completedTranscriptions.length / transcriptions.length : 0,
      averageProcessingTime:
        processingTimes.length > 0 ? processingTimes.reduce((sum, val) => sum + val, 0) / processingTimes.length : 0,
      languageDistribution,
    }
  }

  /**
   * Generates comprehensive analytics for a session
   */
  static generateSessionAnalytics(sessionId: string, transcriptions: Transcription[]): TranscriptionAnalytics {
    const totalWords = transcriptions.reduce((sum, t) => sum + (t.word_count || 0), 0)
    const totalCharacters = transcriptions.reduce((sum, t) => sum + (t.character_count || 0), 0)

    const confidenceValues = transcriptions
      .filter((t) => t.confidence !== undefined && t.confidence !== null)
      .map((t) => t.confidence!)

    const processingTimes = transcriptions
      .filter((t) => t.processing_time_ms !== undefined && t.processing_time_ms !== null)
      .map((t) => t.processing_time_ms!)

    const languageDistribution: Record<string, number> = {}
    transcriptions.forEach((t) => {
      const lang = t.language_code || "unknown"
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
    })

    return {
      sessionId,
      totalTranscriptions: transcriptions.length,
      totalWords,
      totalCharacters,
      averageConfidence:
        confidenceValues.length > 0 ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length : 0,
      languageDistribution,
      processingTimeStats: {
        min: processingTimes.length > 0 ? Math.min(...processingTimes) : 0,
        max: processingTimes.length > 0 ? Math.max(...processingTimes) : 0,
        average:
          processingTimes.length > 0 ? processingTimes.reduce((sum, val) => sum + val, 0) / processingTimes.length : 0,
      },
    }
  }

  /**
   * Identifies potential quality issues
   */
  static identifyQualityIssues(transcriptions: Transcription[]): string[] {
    const issues: string[] = []

    const lowConfidenceCount = transcriptions.filter((t) => t.confidence && t.confidence < 0.6).length
    if (lowConfidenceCount > transcriptions.length * 0.3) {
      issues.push("High percentage of low-confidence transcriptions")
    }

    const errorCount = transcriptions.filter((t) => t.status === "error").length
    if (errorCount > 0) {
      issues.push(`${errorCount} transcription(s) failed`)
    }

    const emptyTextCount = transcriptions.filter(
      (t) => t.status === "completed" && (!t.text || t.text.trim().length === 0),
    ).length
    if (emptyTextCount > 0) {
      issues.push(`${emptyTextCount} completed transcription(s) have no text`)
    }

    return issues
  }
}
