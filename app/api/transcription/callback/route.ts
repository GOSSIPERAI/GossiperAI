import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase-server";
import { TranscriptionValidator } from "@/lib/validation/transcription-validation";
import { z } from "zod";

// Validate required environment variables
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
if (!ASSEMBLYAI_API_KEY) {
  throw new Error("ASSEMBLYAI_API_KEY environment variable is not set");
}

interface AssemblyAIResponse {
  id: string;
  transcript_id: string;
  status: string;
  text: string;
  words?: Array<{ text: string }>;
  error?: string;
  confidence?: number;
  language_code?: string;
  audio_duration?: number;
  audio_url?: string;
  webhook_status_code?: number | null;
}

// Minimal webhook payload validation schema
const WebhookPayloadSchema = z.object({
  transcript_id: z.string(),
  status: z.string()
});

// Utility function for delayed retry
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch transcript with retry logic
async function fetchTranscript(jobId: string, maxRetries = 3): Promise<AssemblyAIResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [Attempt ${attempt}] Fetching transcript ${jobId}`);
      
      // Ensure API key is defined
      if (!ASSEMBLYAI_API_KEY) {
        throw new Error("AssemblyAI API key is not defined");
      }

      const response = await fetch(`https://api.assemblyai.com/v2/transcript/${jobId}`, {
        headers: {
          "Authorization": ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json"
        } as const
      });

      if (!response.ok) {
        throw new Error(`AssemblyAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as AssemblyAIResponse;
      
      if (data.status === "error") {
        throw new Error(data.error || "Unknown AssemblyAI error");
      }

      return data;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await sleep(1000); // Wait 1 second between retries
        continue;
      }
    }
  }
  
  throw lastError;
}

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

    // 🔍 Validate the minimal webhook payload
    const webhookValidation = WebhookPayloadSchema.safeParse(payload);
    if (!webhookValidation.success) {
      console.error("❌ Invalid webhook payload:", webhookValidation.error.format());
      return NextResponse.json(
        { error: "Invalid webhook payload", details: webhookValidation.error.format() },
        { status: 400 }
      );
    }

    const webhookData = webhookValidation.data;
    console.log("✅ Received webhook:", { 
      transcript_id: webhookData.transcript_id,
      status: webhookData.status 
    });

    // Fetch full transcript if status is completed
    let fullTranscript;
    if (webhookData.status === "completed") {
      try {
        fullTranscript = await fetchTranscript(webhookData.transcript_id);
        console.log("✅ Fetched full transcript");
      } catch (error) {
        console.error("❌ Failed to fetch full transcript:", error);
        return NextResponse.json(
          { error: "Failed to fetch transcript data" },
          { status: 500 }
        );
      }
    }

    // Validate the full transcript data
    const validation = TranscriptionValidator.safeParse(fullTranscript || payload);
    if (!validation.success) {
      console.error("❌ Invalid AssemblyAI data:", validation.error.format());
      return NextResponse.json(
        { error: "Invalid transcript data", details: validation.error.format() },
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

    // � Debug AssemblyAI payload before upsert
    console.log("🔍 [DEBUG] Pre-upsert field validation:", {
      assemblyAI: {
        id: validatedPayload.id,
        transcript_id: validatedPayload.transcript_id,
        status: validatedPayload.status,
        raw_text: validatedPayload.text,
        computed_text: text,
        confidence: validatedPayload.confidence,
        language_code: validatedPayload.language_code,
        audio_duration: validatedPayload.audio_duration,
        has_words: !!validatedPayload.words,
        word_count: validatedPayload.words?.length,
        audio_url: validatedPayload.audio_url,
        webhook_status_code: validatedPayload.webhook_status_code
      }
    });

    // �💾 Insert or update transcription with upsert
    const upsertData = {
      session_id: sessionId,
      text,
      status: validatedPayload.status,
      assembly_ai_job_id: jobId,
      confidence: validatedPayload.confidence ?? null,
      language_code: validatedPayload.language_code ?? "en",
      word_count: wordCount,
      character_count: characterCount,
      audio_duration_ms: validatedPayload.audio_duration
        ? Math.round(validatedPayload.audio_duration * 1000)
        : null,
      error_message: validatedPayload.error ?? null,
      raw_words: validatedPayload.words
        ? JSON.stringify(validatedPayload.words)
        : null,
      audio_url: validatedPayload.audio_url ?? null,
      webhook_status_code: validatedPayload.webhook_status_code ?? null,
    };

    console.log("💾 [DEBUG] Upserting data:", JSON.stringify(upsertData, null, 2));

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
      { 
        onConflict: "assembly_ai_job_id",
        ignoreDuplicates: false // Force update on conflict
      }
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
    
    // Detailed debug logging for Vercel
    console.log("📝 [DEBUG] Callback payload:", {
      sessionId,
      jobId,
      status: validatedPayload.status,
      text: text?.substring(0, 100) + "...",
      metrics: {
        wordCount,
        characterCount
      },
      words: {
        present: !!validatedPayload.words,
        count: validatedPayload.words?.length ?? 0
      },
      fullPayload: JSON.stringify(payload, null, 2)
    });

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
