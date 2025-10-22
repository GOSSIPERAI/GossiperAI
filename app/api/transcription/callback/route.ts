//import { type NextRequest, NextResponse } from "next/server"
//import type { WebhookPayload } from "../../../../services/transcription/lib/types"
//import { createServiceRoleSupabaseClient } from "@/lib/supabase-server"
//import { TranscriptionValidator } from "@/lib/validation/transcription-validation"

// TODO: REVERT FOR LIVE DATA - Remove in-memory store when using real AssemblyAI
// In-memory store for transcription results (kept for fallback)
/*const transcriptionStore = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    console.log("📞 [CALLBACK] Request received via App Router")
    console.log("📞 [CALLBACK] Headers:", Object.fromEntries(request.headers.entries()))
    console.log("📞 [CALLBACK] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"

    console.log("📞 [CALLBACK] Extracted session ID:", sessionId)

    const payload: WebhookPayload = await request.json()

    console.log("📞 [CALLBACK] Payload received:", {
      transcriptId: payload.transcript_id,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
      textLength: payload.text?.length || 0,
      textPreview: payload.text?.substring(0, 100) + (payload.text && payload.text.length > 100 ? "..." : ""),
    })

    if (payload.status === "completed" && payload.text) {
      // Validate text quality
      const textValidation = TranscriptionValidator.validateTextQuality(payload.text)
      if (textValidation.warnings.length > 0) {
        console.warn("📞 [CALLBACK] Text quality warnings:", textValidation.warnings)
      }

      // Calculate text metrics
      const { wordCount, characterCount } = TranscriptionValidator.calculateTextMetrics(payload.text)

      try {
        const supabase = createServiceRoleSupabaseClient()

        const { data, error } = await supabase
          .from("transcriptions")
          .insert({
            session_id: sessionId,
            text: payload.text,
            status: payload.status,
            assembly_ai_job_id: payload.transcript_id,
            confidence: payload.confidence || null,
            language_code: "en", // Default to English, can be enhanced later
            word_count: wordCount,
            character_count: characterCount,
          })
          .select()

        if (error) {
          console.error("📞 [CALLBACK] Supabase insert error:", error)
          throw error
        }

        console.log("📞 [CALLBACK] Transcription stored in Supabase with metrics:", {
          sessionId,
          transcriptionId: data[0]?.id,
          wordCount,
          characterCount,
          confidence: payload.confidence,
          textPreview: payload.text?.substring(0, 100) + "...",
        })

        // No need for manual WebSocket or polling - clients subscribed to this session will receive the update instantly
      } catch (dbError) {
        console.error("📞 [CALLBACK] Database error:", dbError)
        // Return success to AssemblyAI even if DB fails to avoid retries
      }
    } else if (payload.status === "error") {
      console.error("📞 [CALLBACK] Transcription failed:", payload.error)

      try {
        const supabase = createServiceRoleSupabaseClient()
        await supabase.from("transcriptions").insert({
          session_id: sessionId,
          text: null,
          status: "error",
          assembly_ai_job_id: payload.transcript_id,
          error_message: payload.error || "Unknown error",
        })
      } catch (dbError) {
        console.error("📞 [CALLBACK] Failed to store error status:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transcription callback processed successfully",
    })
  } catch (error) {
    console.error("📞 [CALLBACK] Error processing transcription callback:", error)

    return NextResponse.json({
      success: true,
      message: "Callback received but processing failed",
    })
  }
}

// GET endpoint to retrieve transcription results
export async function GET(request: NextRequest) {
  try {
    console.log("📥 [CALLBACK-GET] Request received via App Router")
    console.log("📥 [CALLBACK-GET] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"

    console.log("📥 [CALLBACK-GET] Session ID:", sessionId)

    try {
      // Try to get results from Supabase first
      const supabase = createServiceRoleSupabaseClient()

      const { data: dbResults, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("📥 [CALLBACK-GET] Supabase query error:", error)
        throw error
      }

      // Transform Supabase results to match expected format
      const results = dbResults.map((row) => ({
        id: row.assembly_ai_job_id,
        text: row.text,
        confidence: row.confidence || 0.9, // Default confidence for database results
        timestamp: new Date(row.created_at),
        status: row.status,
        audioUrl: null, // Not stored in database
      }))

      console.log("📥 [CALLBACK-GET] Returning Supabase results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    } catch (dbError) {
      console.error("📥 [CALLBACK-GET] Database error, falling back to memory:", dbError)

      // Fallback to in-memory storage
      const results = transcriptionStore.get(sessionId) || []

      console.log("📥 [CALLBACK-GET] Returning memory results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    }
  } catch (error) {
    console.error("📥 [CALLBACK-GET] Error retrieving transcription results:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve results",
      },
      { status: 500 },
    )
  }
}
*/


import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { TranscriptionValidator } from "@/lib/validation/transcription-validation"

// Flexible webhook payload type to avoid runtime errors
type WebhookPayload = {
  id?: string
  transcript_id?: string
  status: string
  text?: string
  confidence?: number
  error?: string
}

// TODO: REVERT FOR LIVE DATA - Remove in-memory store when using real AssemblyAI
const transcriptionStore = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    console.log("📞 [CALLBACK] Request received via App Router")
    console.log("📞 [CALLBACK] Headers:", Object.fromEntries(request.headers.entries()))
    console.log("📞 [CALLBACK] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"
    console.log("📞 [CALLBACK] Extracted session ID:", sessionId)

    const payload: WebhookPayload = await request.json()
    const jobId = payload.transcript_id || payload.id || "unknown"

    console.log("📞 [CALLBACK] Raw payload:", payload)
    console.log("📞 [CALLBACK] Payload received:", {
      transcriptId: jobId,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
      textLength: payload.text?.length || 0,
      textPreview: payload.text?.substring(0, 100) + (payload.text && payload.text.length > 100 ? "..." : ""),
    })

    if (payload.status === "completed" && payload.text) {
      const textValidation = TranscriptionValidator.validateTextQuality(payload.text)
      if (textValidation.warnings.length > 0) {
        console.warn("📞 [CALLBACK] Text quality warnings:", textValidation.warnings)
      }

      const { wordCount, characterCount } = TranscriptionValidator.calculateTextMetrics(payload.text)

      try {
        const supabase = createServiceRoleSupabaseClient()

        const { data, error } = await supabase
          .from("transcriptions")
          .insert({
            session_id: sessionId,
            text: payload.text,
            status: payload.status,
            assembly_ai_job_id: jobId,
            confidence: payload.confidence || null,
            language_code: "en",
            word_count: wordCount,
            character_count: characterCount,
          })
          .select()

        if (error) {
          console.error("📞 [CALLBACK] Supabase insert error:", error)
          throw error
        }

        console.log("📞 [CALLBACK] Transcription stored in Supabase with metrics:", {
          sessionId,
          transcriptionId: data[0]?.id,
          wordCount,
          characterCount,
          confidence: payload.confidence,
          textPreview: payload.text?.substring(0, 100) + "...",
        })
      } catch (dbError) {
        console.error("📞 [CALLBACK] Database error:", dbError)
      }
    } else if (payload.status === "error") {
      console.error("📞 [CALLBACK] Transcription failed:", payload.error)

      try {
        const supabase = createServiceRoleSupabaseClient()

        await supabase.from("transcriptions").insert({
          session_id: sessionId,
          text: null,
          status: "error",
          assembly_ai_job_id: jobId,
          error_message: payload.error || "Unknown error",
        })
      } catch (dbError) {
        console.error("📞 [CALLBACK] Failed to store error status:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transcription callback processed successfully",
    })
  } catch (error) {
    console.error("📞 [CALLBACK] Error processing transcription callback:", error)

    return NextResponse.json({
      success: true,
      message: "Callback received but processing failed",
    })
  }
}

// GET endpoint to retrieve transcription results
export async function GET(request: NextRequest) {
  try {
    console.log("📥 [CALLBACK-GET] Request received via App Router")
    console.log("📥 [CALLBACK-GET] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"
    console.log("📥 [CALLBACK-GET] Session ID:", sessionId)

    try {
      const supabase = createServiceRoleSupabaseClient()

      const { data: dbResults, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("📥 [CALLBACK-GET] Supabase query error:", error)
        throw error
      }

      const results = dbResults.map((row) => ({
        id: row.assembly_ai_job_id,
        text: row.text,
        confidence: row.confidence || 0.9,
        timestamp: new Date(row.created_at),
        status: row.status,
        audioUrl: null,
      }))

      console.log("📥 [CALLBACK-GET] Returning Supabase results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    } catch (dbError) {
      console.error("📥 [CALLBACK-GET] Database error, falling back to memory:", dbError)

      const results = transcriptionStore.get(sessionId) || []

      console.log("📥 [CALLBACK-GET] Returning memory results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    }
  } catch (error) {
    console.error("📥 [CALLBACK-GET] Error retrieving transcription results:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve results",
      },
      { status: 500 },
    )
  }
}
