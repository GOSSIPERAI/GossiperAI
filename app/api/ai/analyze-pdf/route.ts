import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { callGemini, userTextWithPdf, AIError } from "@/lib/ai/gemini-client"
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/syllabus"

// Gemini accepts PDFs natively as inline_data (base64), same approach as
// Claude's document blocks — no separate text-extraction library needed.
const MAX_PDF_SIZE_MB = 20

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

    const formData = await request.formData()
    const pdfFile = formData.get("pdf") as File
    const question = (formData.get("question") as string) || ""

    if (!pdfFile) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 })
    }

    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const sizeMB = pdfFile.size / (1024 * 1024)
    if (sizeMB > MAX_PDF_SIZE_MB) {
      return NextResponse.json(
        { error: `PDF too large. Maximum size is ${MAX_PDF_SIZE_MB}MB` },
        { status: 413 }
      )
    }

    const arrayBuffer = await pdfFile.arrayBuffer()
    const base64Pdf = Buffer.from(arrayBuffer).toString("base64")

    const userPrompt = question.trim()
      ? question
      : "Summarize this document and highlight anything relevant to the Web3 Academy syllabus."

    const answer = await callGemini({
      systemPrompt: TUTOR_SYSTEM_PROMPT,
      messages: [userTextWithPdf(userPrompt, base64Pdf)],
      maxOutputTokens: 1500,
    })

    return NextResponse.json({
      success: true,
      fileName: pdfFile.name,
      question: userPrompt,
      answer,
    })
  } catch (error: any) {
    console.error("❌ [ANALYZE PDF] Error:", error)
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
