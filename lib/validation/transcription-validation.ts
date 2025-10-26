import { optional, z } from "zod";
import type { Transcription, TranscriptionValidationResult } from "@/lib/types/transcription"

export const TranscriptionValidator = {
  schema: z.object({
    id: z.string().optional(),
    status: z.string().optional(),
    text: z.string().optional(),
    confidence: z.number().optional(),
    language_code: z.string().optional(),
    audio_duration: z.number().optional(),
    audio_url: z.string().optional(),
    transcript_id: z.string().optional(),
    words: z.array(
      z.object({
        text: z.string(),
        start: z.number(),
        end: z.number(),
        confidence: z.number(),
        speaker: z.string().nullable()
      })
    ).optional(),
    webhook_url: z.string().optional(),
    webhook_status_code: z.number().nullable().optional(),
    error: z.string().optional()
  }).passthrough(), // Allow additional fields from AssemblyAI

  validateTranscription(data: Partial<Transcription>): TranscriptionValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!data.session_id) {
      errors.push("session_id is required")
    }

    if (!data.assembly_ai_job_id) {
      errors.push("assembly_ai_job_id is required")
    }

    // Status validation
    if (data.status && !["queued", "processing", "completed", "error"].includes(data.status)) {
      errors.push("Invalid status value")
    }

    // Confidence validation
    if (data.confidence !== undefined) {
      if (data.confidence < 0 || data.confidence > 1) {
        errors.push("Confidence must be between 0 and 1")
      }
      if (data.confidence < 0.5) {
        warnings.push("Low confidence score detected")
      }
    }

    // Text validation
    if (data.status === "completed" && !data.text) {
      warnings.push("Completed transcription has no text")
    }

    // Language code validation
    if (data.language_code && data.language_code.length > 10) {
      errors.push("Language code too long")
    }

    // Processing time validation
    if (data.processing_time_ms !== undefined && data.processing_time_ms < 0) {
      errors.push("Processing time cannot be negative")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  },

  validateTextQuality(text: string): TranscriptionValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!text || text.trim().length === 0) {
      errors.push("Text is empty")
      return { isValid: false, errors, warnings }
    }

    // Check for minimum length
    if (text.length < 10) {
      warnings.push("Text is very short")
    }

    // Check for excessive length
    if (text.length > 50000) {
      warnings.push("Text is very long")
    }

    // Check for repeated characters (potential error)
    const repeatedPattern = /(.)\1{10,}/
    if (repeatedPattern.test(text)) {
      warnings.push("Text contains repeated characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  },

  calculateTextMetrics(text: string): { wordCount: number; characterCount: number } {
    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    const characterCount = text.length

    return { wordCount, characterCount }
  },

  safeParse(data: unknown) {
    return this.schema.safeParse(data);
  }
}
