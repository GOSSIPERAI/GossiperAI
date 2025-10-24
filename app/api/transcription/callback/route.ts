
import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase-server";
import { TranscriptionValidator } from "@/lib/validation/transcription-validation";
import fs from "fs/promises";
import path from "path";

// UUID validation helper
function isValidUUID(uuid: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export async function POST(req: NextRequest) {
  // Initialize Supabase client with validation
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    console.error("❌ Failed to initialize Supabase client");
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // Validate sessionId format
    if (!sessionId || !isValidUUID(sessionId)) {
      console.error("❌ Invalid sessionId format:", sessionId);
      return NextResponse.json({ error: "Invalid sessionId format" }, { status: 400 });
    }

    const payload = await req.json();

    // 🔍 Validate the webhook payload with Zod
    const validation = TranscriptionValidator.schema.safeParse(payload);
    if (!validation.success) {
      console.error("❌ Invalid AssemblyAI payload:", validation.error.format());
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedPayload = validation.data;

    // ✅ Ensure the session exists before inserting
    console.log("🔍 [DEBUG] Checking session existence:", sessionId);
    const { data: existingSession, error: sessionError } = await supabase
      .from("sessions")
      .select("id, created_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) {
      console.error("❌ Failed to check session:", {
        error: sessionError,
        sessionId
      });
      throw sessionError;
    }

    if (!existingSession) {
      console.warn("⚠️ Session not found — auto-creating:", sessionId);
      const timestamp = new Date().toISOString();
      const { data: newSession, error: createErr } = await supabase
        .from("sessions")
        .insert({ 
          id: sessionId, 
          created_at: timestamp,
          updated_at: timestamp,
          status: 'active'  // Add default status if your sessions table has this
        })
        .select()
        .single();

      if (createErr) {
        console.error("❌ Failed to create session:", {
          error: createErr,
          sessionId
        });
        throw createErr;
      }

      console.log("✅ Created new session:", {
        sessionId,
        timestamp,
        session: newSession
      });
    } else {
      console.log("✅ Found existing session:", {
        sessionId,
        createdAt: existingSession.created_at
      });
    }

    // Extract job ID and full text from payload
    const jobId = validatedPayload.transcript_id || validatedPayload.id || "unknown";
    const text =
      validatedPayload.text ||
      (validatedPayload.words
        ? validatedPayload.words.map((w) => w.text).join(" ")
        : null);

    // 🔍 Debug log the text content
    console.log("🔍 [DEBUG] Extracted text content:", {
      jobId,
      hasText: !!text,
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 100) + "...",
      fromWords: !validatedPayload.text && !!validatedPayload.words,
      wordCount: validatedPayload.words?.length || 0
    });

    // 🧮 Compute text metrics
    const { wordCount, characterCount } = text
      ? TranscriptionValidator.calculateTextMetrics(text)
      : { wordCount: 0, characterCount: 0 };

    // 💾 Insert or update transcription with upsert
    const { error: insertError } = await supabase.from("transcriptions").upsert(
      {
        session_id: sessionId,
        text,
        status: validatedPayload.status,
        assembly_ai_job_id: jobId,
        confidence: validatedPayload.confidence ?? null,
        language_code: validatedPayload.language_code ?? "en",
        word_count: wordCount,
        character_count: characterCount,
        audio_duration_ms: validatedPayload.audio_duration
          ? validatedPayload.audio_duration * 1000
          : null,
        error_message: validatedPayload.error || null,
        raw_words: validatedPayload.words
          ? JSON.stringify(validatedPayload.words)
          : null,
        audio_url: validatedPayload.audio_url ?? null,
        webhook_status_code: validatedPayload.webhook_status_code ?? null,
      },
      { onConflict: "assembly_ai_job_id" }
    );

    if (insertError) {
      console.error("❌ Database insertion failed:", {
        error: insertError,
        payload: {
          session_id: sessionId,
          text: text?.substring(0, 100),
          status: validatedPayload.status,
          assembly_ai_job_id: jobId
        }
      });
      throw insertError;
    }

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
