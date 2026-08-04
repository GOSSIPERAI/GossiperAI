import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { callGemini, userText, AIError } from "@/lib/ai/gemini-client"
import { z } from "zod"

const SummarizeRequestSchema = z.object({
  sessionId: z.string().uuid(),
})

const SUMMARY_SYSTEM_PROMPT = `You summarize lecture/session transcripts for the Gossiper platform.
Produce:
1. A 2-4 sentence overview
2. Key points as a bullet list
3. Any action items or follow-ups mentioned, if present

Keep it concise and skip filler. If the transcript is very short or fragmentary, say so rather than inventing content.`

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = SummarizeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { sessionId } = parsed.data
    const db = createServiceRoleSupabaseClient()

    const { data: participant } = await db
      .from("session_participants")
      .select("session_id")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    const { data: session } = await db
      .from("sessions")
      .select("id, created_by")
      .eq("id", sessionId)
      .maybeSingle()

    const isHost = session?.created_by === user.id
    if (!isHost && !participant) {
      return NextResponse.json({ error: "You do not have access to this session" }, { status: 403 })
    }

    const { data: transcripts, error: transcriptError } = await db
      .from("transcriptions")
      .select("text, created_at")
      .eq("session_id", sessionId)
      .eq("status", "completed")
      .order("created_at", { ascending: true })

    if (transcriptError) {
      console.error("❌ [SUMMARIZE] Failed to fetch transcripts:", transcriptError)
      return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 })
    }

    const fullText = (transcripts || [])
      .map((t) => t.text)
      .filter(Boolean)
      .join(" ")
      .trim()

    if (!fullText) {
      return NextResponse.json(
        { error: "No completed transcript found for this session yet" },
        { status: 404 }
      )
    }

    const summaryText = await callGemini({
      systemPrompt: SUMMARY_SYSTEM_PROMPT,
      messages: [userText(`Transcript:\n\n${fullText}`)],
      maxOutputTokens: 1000,
    })

    const { error: insertError } = await db.from("ai_recording_summaries").upsert(
      { session_id: sessionId, summary_text: summaryText },
      { onConflict: "session_id" }
    )

    if (insertError) {
      console.error("⚠️ [SUMMARIZE] Failed to cache summary (non-fatal):", insertError)
    }

    return NextResponse.json({ success: true, sessionId, summary: summaryText })
  } catch (error: any) {
    console.error("❌ [SUMMARIZE] Error:", error)
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
