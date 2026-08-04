import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { z } from "zod"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const GenerateImageSchema = z.object({
  prompt: z.string().min(3).max(1000),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
})

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      console.error("❌ [GENERATE IMAGE] OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "Image generation is not configured" }, { status: 500 })
    }

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = GenerateImageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { prompt, size } = parsed.data

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size,
        n: 1,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      console.error("❌ [GENERATE IMAGE] OpenAI error:", response.status, errorBody)
      return NextResponse.json(
        { error: "Image generation failed", details: errorBody },
        { status: response.status }
      )
    }

    const data = await response.json()
    // gpt-image-1 returns base64 by default; expose both possibilities so the
    // frontend can handle either a URL or inline base64 without guessing.
    const image = data?.data?.[0]

    return NextResponse.json({
      success: true,
      prompt,
      imageUrl: image?.url ?? null,
      imageBase64: image?.b64_json ?? null,
    })
  } catch (error: any) {
    console.error("❌ [GENERATE IMAGE] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
