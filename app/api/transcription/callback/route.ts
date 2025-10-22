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

// AssemblyAI webhook payload type based on actual response
type WebhookPayload = {
  id?: string
  transcript_id?: string
  status: string
  text?: string
  confidence?: number
  error?: string
  language_code?: string
  audio_duration?: number
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
    speaker: string | null
  }>
  webhook_url?: string
  webhook_status_code?: number
}

// TODO: REVERT FOR LIVE DATA - Remove in-memory store when using real AssemblyAI
const transcriptionStore = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [CALLBACK] ===== ASSEMBLYAI WEBHOOK RECEIVED =====")
    console.log("📞 [CALLBACK] Request received via App Router")
    console.log("📞 [CALLBACK] Headers:", Object.fromEntries(request.headers.entries()))
    console.log("📞 [CALLBACK] URL:", request.url)
    console.log("📞 [CALLBACK] Method:", request.method)
    console.log("📞 [CALLBACK] Content-Type:", request.headers.get("content-type"))

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"
    console.log("📞 [CALLBACK] Extracted session ID:", sessionId)

    // Parse the request body
    let payload: WebhookPayload
    try {
      payload = await request.json()
      console.log("📞 [CALLBACK] ✅ Successfully parsed JSON payload")
    } catch (parseError) {
      console.error("📞 [CALLBACK] ❌ Failed to parse JSON payload:", parseError)
      return NextResponse.json({
        success: false,
        error: "Invalid JSON payload"
      }, { status: 400 })
    }

    const jobId = payload.transcript_id || payload.id || "unknown"

    console.log("📞 [CALLBACK] ===== PAYLOAD ANALYSIS =====")
    console.log("📞 [CALLBACK] Raw payload:", JSON.stringify(payload, null, 2))
    console.log("📞 [CALLBACK] Payload summary:", {
      transcriptId: jobId,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
      textLength: payload.text?.length || 0,
      textPreview: payload.text?.substring(0, 100) + (payload.text && payload.text.length > 100 ? "..." : ""),
      languageCode: payload.language_code,
      audioDuration: payload.audio_duration,
      wordCount: payload.words?.length || 0,
      webhookUrl: payload.webhook_url,
      webhookStatusCode: payload.webhook_status_code
    })

    console.log("📞 [CALLBACK] ===== PROCESSING TRANSCRIPTION =====")
    
    if (payload.status === "completed" && payload.text) {
      console.log("📞 [CALLBACK] ✅ Processing completed transcription")
      
      const textValidation = TranscriptionValidator.validateTextQuality(payload.text)
      if (textValidation.warnings.length > 0) {
        console.warn("📞 [CALLBACK] ⚠️ Text quality warnings:", textValidation.warnings)
      }

      const { wordCount, characterCount } = TranscriptionValidator.calculateTextMetrics(payload.text)
      console.log("📞 [CALLBACK] Text metrics calculated:", { wordCount, characterCount })

      try {
        console.log("📞 [CALLBACK] 🔗 Creating Supabase service-role client...")
        const supabase = createServiceRoleSupabaseClient()
        console.log("📞 [CALLBACK] ✅ Supabase client created successfully")

        console.log("📞 [CALLBACK] 💾 Inserting transcription into database...")
        console.log("📞 [CALLBACK] Insert data:", {
          session_id: sessionId,
          text: payload.text?.substring(0, 50) + "...",
          status: payload.status,
          assembly_ai_job_id: jobId,
          confidence: payload.confidence,
          language_code: payload.language_code || "en",
          word_count: wordCount,
          character_count: characterCount,
        })

        const { data, error } = await supabase
          .from("transcriptions")
          .insert({
            session_id: sessionId,
            text: payload.text,
            status: payload.status,
            assembly_ai_job_id: jobId,
            confidence: payload.confidence || null,
            language_code: payload.language_code || "en",
            word_count: wordCount,
            character_count: characterCount,
          })
          .select()

        if (error) {
          console.error("📞 [CALLBACK] ❌ Supabase insert error:", error)
          console.error("📞 [CALLBACK] Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }

        console.log("📞 [CALLBACK] ✅ Transcription successfully stored in Supabase!")
        console.log("📞 [CALLBACK] Database response:", {
          sessionId,
          transcriptionId: data[0]?.id,
          wordCount,
          characterCount,
          confidence: payload.confidence,
          textPreview: payload.text.substring(0, 100) + "...",
          insertedRows: data.length
        })
      } catch (dbError) {
        console.error("📞 [CALLBACK] ❌ Database error:", dbError)
        console.error("📞 [CALLBACK] Database error details:", {
          message: dbError instanceof Error ? dbError.message : "Unknown error",
          stack: dbError instanceof Error ? dbError.stack : undefined
        })
      }
    } else if (payload.status === "error") {
      console.error("📞 [CALLBACK] ❌ Transcription failed:", payload.error)

      try {
        console.log("📞 [CALLBACK] 🔗 Creating Supabase service-role client for error storage...")
        const supabase = createServiceRoleSupabaseClient()

        console.log("📞 [CALLBACK] 💾 Storing error status in database...")
        const { data, error } = await supabase.from("transcriptions").insert({
          session_id: sessionId,
          text: null,
          status: "error",
          assembly_ai_job_id: jobId,
          error_message: payload.error || "Unknown error",
        }).select()

        if (error) {
          console.error("📞 [CALLBACK] ❌ Failed to store error status:", error)
        } else {
          console.log("📞 [CALLBACK] ✅ Error status stored successfully:", data)
        }
      } catch (dbError) {
        console.error("📞 [CALLBACK] ❌ Failed to store error status:", dbError)
      }
    } else {
      console.log("📞 [CALLBACK] ⚠️ Unknown status received:", payload.status)
      console.log("📞 [CALLBACK] Full payload for unknown status:", payload)
    }

    console.log("📞 [CALLBACK] ===== CALLBACK PROCESSING COMPLETE =====")
    return NextResponse.json({
      success: true,
      message: "Transcription callback processed successfully",
      sessionId,
      status: payload.status,
      processed: true
    })
  } catch (error) {
    console.error("📞 [CALLBACK] ❌ Error processing transcription callback:", error)
    console.error("📞 [CALLBACK] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({
      success: false,
      message: "Callback received but processing failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// GET endpoint to retrieve transcription results
export async function GET(request: NextRequest) {
  try {
    console.log("📥 [CALLBACK-GET] ===== RETRIEVING TRANSCRIPTION RESULTS =====")
    console.log("📥 [CALLBACK-GET] Request received via App Router")
    console.log("📥 [CALLBACK-GET] URL:", request.url)
    console.log("📥 [CALLBACK-GET] Headers:", Object.fromEntries(request.headers.entries()))

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"
    console.log("📥 [CALLBACK-GET] Session ID:", sessionId)

    try {
      console.log("📥 [CALLBACK-GET] 🔗 Creating Supabase service-role client...")
      const supabase = createServiceRoleSupabaseClient()
      console.log("📥 [CALLBACK-GET] ✅ Supabase client created successfully")

      console.log("📥 [CALLBACK-GET] 🔍 Querying transcriptions for session:", sessionId)
      const { data: dbResults, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("📥 [CALLBACK-GET] ❌ Supabase query error:", error)
        console.error("📥 [CALLBACK-GET] Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("📥 [CALLBACK-GET] ✅ Database query successful")
      console.log("📥 [CALLBACK-GET] Raw database results:", dbResults)

      const results = dbResults.map((row) => ({
        id: row.assembly_ai_job_id,
        text: row.text,
        confidence: row.confidence || 0.9,
        timestamp: new Date(row.created_at),
        status: row.status,
        audioUrl: null,
      }))

      console.log("📥 [CALLBACK-GET] ✅ Returning Supabase results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ 
          id: r.id, 
          text: r.text?.substring(0, 50) + "...", 
          timestamp: r.timestamp,
          status: r.status,
          confidence: r.confidence
        })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
        source: "database"
      })
    } catch (dbError) {
      console.error("📥 [CALLBACK-GET] ❌ Database error, falling back to memory:", dbError)
      console.error("📥 [CALLBACK-GET] Database error details:", {
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : undefined
      })

      const results = transcriptionStore.get(sessionId) || []

      console.log("📥 [CALLBACK-GET] ⚠️ Returning memory results (fallback):", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ 
          id: r.id, 
          text: r.text?.substring(0, 50) + "...", 
          timestamp: r.timestamp 
        })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
        source: "memory"
      })
    }
  } catch (error) {
    console.error("📥 [CALLBACK-GET] ❌ Error retrieving transcription results:", error)
    console.error("📥 [CALLBACK-GET] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve results",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}
