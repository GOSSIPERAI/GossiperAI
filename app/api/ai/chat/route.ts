import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { callGemini, userText, AIError, type GeminiMessage } from "@/lib/ai/gemini-client"
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/syllabus"
import { z } from "zod"

const ChatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(8000),
})

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
    const parsed = ChatRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { message } = parsed.data
    let { conversationId } = parsed.data

    const db = createServiceRoleSupabaseClient()

    if (!conversationId) {
      const { data: newConvo, error: convoError } = await db
        .from("ai_chat_conversations")
        .insert({ user_id: user.id, title: message.slice(0, 60) })
        .select("id")
        .single()

      if (convoError || !newConvo) {
        console.error("❌ [AI CHAT] Failed to create conversation:", convoError)
        return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 })
      }
      conversationId = newConvo.id
    } else {
      const { data: existing, error: fetchError } = await db
        .from("ai_chat_conversations")
        .select("id, user_id")
        .eq("id", conversationId)
        .maybeSingle()

      if (fetchError || !existing || existing.user_id !== user.id) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
    }

    const { data: history, error: historyError } = await db
      .from("ai_chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30)

    if (historyError) {
      console.error("❌ [AI CHAT] Failed to load history:", historyError)
    }

    // Gemini uses "model" instead of "assistant" for the AI's turns.
    const geminiMessages: GeminiMessage[] = (history || []).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }))
    geminiMessages.push(userText(message))

    await db.from("ai_chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    })

    const replyText = await callGemini({
      systemPrompt: TUTOR_SYSTEM_PROMPT,
      messages: geminiMessages,
      maxOutputTokens: 1500,
    })

    await db.from("ai_chat_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: replyText,
    })

    return NextResponse.json({
      success: true,
      conversationId,
      reply: replyText,
    })
  } catch (error: any) {
    console.error("❌ [AI CHAT] Error:", error)
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
