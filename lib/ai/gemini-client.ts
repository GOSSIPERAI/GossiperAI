// Shared Gemini client for chat, summarization, PDF Q&A, and AI grading.
// Uses Gemini's REST API directly (no SDK package needed) since Google's
// free tier requires no billing setup, unlike Claude/OpenAI.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
export const GEMINI_MODEL = "gemini-flash-latest"

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set — AI features will fail until it is configured.")
}

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

export class AIError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = "AIError"
    this.status = status
  }
}

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }

export type GeminiMessage = {
  role: "user" | "model"
  parts: GeminiPart[]
}

/**
 * Calls Gemini's generateContent endpoint with consistent error handling,
 * mirroring the shape callClaude() used to have so route code barely changes.
 */
export async function callGemini(params: {
  systemPrompt: string
  messages: GeminiMessage[]
  maxOutputTokens?: number
}): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new AIError("Gemini is not configured. Check GEMINI_API_KEY.", 500)
  }

  const response = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.systemPrompt }] },
        contents: params.messages,
        generationConfig: {
          maxOutputTokens: params.maxOutputTokens ?? 1500,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    console.error("❌ [GEMINI] API call failed:", response.status, errorBody)
    if (response.status === 429) {
      throw new AIError("Gemini rate limit reached. Please try again shortly.", 429)
    }
    throw new AIError(errorBody?.error?.message || "AI request failed", response.status)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || ""

  if (!text) {
    console.error("❌ [GEMINI] Empty response:", JSON.stringify(data))
    throw new AIError("AI returned an empty response. Please try again.", 500)
  }

  return text.trim()
}

/** Helper for building a single-turn user message (text only). */
export function userText(text: string): GeminiMessage {
  return { role: "user", parts: [{ text }] }
}

/** Helper for building a user message that includes a base64 PDF alongside text. */
export function userTextWithPdf(text: string, base64Pdf: string): GeminiMessage {
  return {
    role: "user",
    parts: [
      { inline_data: { mime_type: "application/pdf", data: base64Pdf } },
      { text },
    ],
  }
}
