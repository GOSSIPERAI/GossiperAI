/*import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { TranscriptionValidator } from "@/lib/validation/transcription-validation"
import fs from 'fs/promises'
import path from 'path'

// In-memory store for debug payloads
const debugPayloadStore = new Map<string, any[]>()

// Utility function to store debug payload
async function storeDebugPayload(sessionId: string, payload: any) {
  // Store in memory
  const sessionPayloads = debugPayloadStore.get(sessionId) || []
  sessionPayloads.push({
    timestamp: new Date().toISOString(),
    payload
  })
  debugPayloadStore.set(sessionId, sessionPayloads)

  // Store to file system (in a logs directory)
  try {
    const logDir = path.join(process.cwd(), 'logs', 'callbacks')
    await fs.mkdir(logDir, { recursive: true })
    
    const filename = `callback-${sessionId}-${Date.now()}.json`
    await fs.writeFile(
      path.join(logDir, filename),
      JSON.stringify({ timestamp: new Date().toISOString(), payload }, null, 2)
    )
  } catch (error) {
    console.error('Failed to write debug payload to file:', error)
  }
}

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
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log("🚀 [CALLBACK] ===== ASSEMBLYAI WEBHOOK RECEIVED =====")
    console.log("📞 [CALLBACK] Request received via App Router")
    console.log("📞 [CALLBACK] Request ID:", requestId)
    console.log("📞 [CALLBACK] Timestamp:", timestamp)
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
      
      // Store payload for debugging
      await storeDebugPayload(sessionId, payload)
      console.log("📞 [CALLBACK] ✅ Debug payload stored successfully")

      // IMMEDIATE RAW PAYLOAD LOGGING FOR DEBUGGING
      console.log("🔍 [CALLBACK] ===== RAW PAYLOAD DEBUG =====")
      console.log("🔍 [CALLBACK] Request ID:", requestId)
      console.log("🔍 [CALLBACK] Timestamp:", timestamp)
      console.log("🔍 [CALLBACK] Session ID:", sessionId)
      console.log("🔍 [CALLBACK] Raw payload (stringified):", JSON.stringify(payload, null, 2))
      console.log("🔍 [CALLBACK] Payload keys:", Object.keys(payload))
      console.log("🔍 [CALLBACK] Payload transcript_id:", payload.transcript_id || payload.id)
      console.log("🔍 [CALLBACK] Payload status:", payload.status)
      console.log("🔍 [CALLBACK] ===== END RAW PAYLOAD DEBUG =====")
      
    } catch (parseError) {
      console.error("📞 [CALLBACK] ❌ Failed to parse JSON payload:", parseError)
      console.error("📞 [CALLBACK] Raw request body (if available):", await request.text().catch(() => "Could not read body"))
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
    console.log("📞 [CALLBACK] Request ID:", requestId)
    console.log("📞 [CALLBACK] Returning 200 OK to AssemblyAI")
    
    return NextResponse.json({
      success: true,
      message: "Transcription callback processed successfully",
      sessionId,
      status: payload.status,
      processed: true,
      requestId,
      timestamp
    })
  } catch (error) {
    console.error("📞 [CALLBACK] ❌ Error processing transcription callback:", error)
    console.error("📞 [CALLBACK] Request ID:", requestId)
    console.error("📞 [CALLBACK] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })

    // Still return 200 to AssemblyAI to prevent retries
    console.log("📞 [CALLBACK] Returning 200 OK to AssemblyAI despite error")
    return NextResponse.json({
      success: true,
      message: "Callback received but processing failed",
      error: error instanceof Error ? error.message : "Unknown error",
      requestId,
      timestamp
    })
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
*/                                                                        



import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase-server";
import { TranscriptionValidator } from "@/lib/validation/transcription-validation";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const supabase = createServiceRoleSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const payload = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 🔍 Validate the webhook payload with Zod
    const validation = TranscriptionValidator.safeParse(payload);
    if (!validation.success) {
      console.error("❌ Invalid AssemblyAI payload:", validation.error.format());
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedPayload = validation.data;

    // ✅ Ensure the session exists before inserting
    const { data: existingSession, error: sessionError } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!existingSession) {
      console.warn("⚠️ Session not found — auto-creating session for:", sessionId);
      const { error: createErr } = await supabase
        .from("sessions")
        .insert({ id: sessionId, created_at: new Date().toISOString() });
      if (createErr) throw createErr;
    }

    // 🔍 Debug log the text content
    console.log("🔍 [DEBUG] Validated payload text content:", {
      hasText: !!validatedPayload.text,
      textLength: validatedPayload.text?.length || 0,
      textPreview: validatedPayload.text?.substring(0, 100) + "...",
      status: validatedPayload.status
    });

    // 🧮 Compute text metrics if text is available
    const { wordCount, characterCount } = validatedPayload.text
      ? TranscriptionValidator.calculateTextMetrics(validatedPayload.text)
      : { wordCount: 0, characterCount: 0 };

    // 💾 Insert or update transcription with complete data
    const { error: insertError } = await supabase.from("transcriptions").insert({
      session_id: sessionId,
      text: validatedPayload.text, // Complete transcription text
      status: validatedPayload.status,
      assembly_ai_job_id: validatedPayload.id || validatedPayload.transcript_id,
      confidence: validatedPayload.confidence,
      language_code: validatedPayload.language_code,
      word_count: wordCount,
      character_count: characterCount,
      audio_duration_ms: validatedPayload.audio_duration * 1000,
      audio_url: validatedPayload.audio_url,
      raw_words: validatedPayload.words, // Store word-level data
      webhook_status_code: validatedPayload.webhook_status_code,
      error_message: validatedPayload.error
    });

    if (insertError) throw insertError;

    console.log("✅ Transcription inserted successfully:", validatedPayload.id);

    // (Optional) Log locally for debugging
    const logPath = path.join(process.cwd(), "logs");
    await fs.mkdir(logPath, { recursive: true });
    await fs.writeFile(
      path.join(logPath, `callback-${sessionId}.json`),
      JSON.stringify(payload, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: "Transcription saved",
      sessionId,
      jobId: validatedPayload.id,
      status: validatedPayload.status,
    });
  } catch (err) {
    console.error("❌ Callback processing error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
