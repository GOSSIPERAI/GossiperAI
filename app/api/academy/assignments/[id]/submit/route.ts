import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { callGemini, userText, AIError } from "@/lib/ai/gemini-client"
import { GRADING_SYSTEM_PROMPT } from "@/lib/ai/syllabus"
import { z } from "zod"

const SubmitSchema = z.object({
  content: z.string().min(1).max(20000),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const parsed = SubmitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const assignmentId = params.id
    const db = createServiceRoleSupabaseClient()

    const { data: assignment, error: assignmentError } = await db
      .from("academy_assignments")
      .select("*")
      .eq("id", assignmentId)
      .maybeSingle()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Insert or overwrite this student's submission for this assignment
    const { data: submission, error: insertError } = await db
      .from("academy_submissions")
      .upsert(
        {
          assignment_id: assignmentId,
          user_id: user.id,
          content: parsed.data.content,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          ai_score: null,
          ai_strengths: null,
          ai_corrections: null,
          ai_suggested_improvement: null,
          marked_at: null,
        },
        { onConflict: "assignment_id,user_id" }
      )
      .select()
      .single()

    if (insertError || !submission) {
      console.error("❌ [ASSIGNMENT SUBMIT] Failed to save submission:", insertError)
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
    }

    // Grade immediately with Claude, synchronously — assignments here are short
    // enough that a single request/response cycle is fine (no queue needed).
    const gradingPrompt = `Assignment title: ${assignment.title}
Assignment prompt: ${assignment.prompt}
Rubric: ${assignment.rubric}
Max score: ${assignment.max_score}

Student submission:
${parsed.data.content}`

    let gradeResult: {
      score: number
      strengths: string[]
      corrections: string[]
      suggested_improvement: string
    } | null = null

    try {
      const raw = await callGemini({
        systemPrompt: GRADING_SYSTEM_PROMPT,
        messages: [userText(gradingPrompt)],
        maxOutputTokens: 1000,
      })
      // Gemini occasionally wraps JSON in ```json fences despite instructions not to.
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
      gradeResult = JSON.parse(cleaned)
    } catch (err) {
      console.error("❌ [ASSIGNMENT SUBMIT] Grading failed:", err)
      // Submission is saved either way — mark as error so the UI can show
      // "we'll grade this shortly" rather than losing the student's work.
      await db
        .from("academy_submissions")
        .update({ status: "error" })
        .eq("id", submission.id)

      return NextResponse.json({
        success: true,
        submission: { ...submission, status: "error" },
        warning: "Submission saved, but automatic grading failed. It will need to be graded manually or retried.",
      })
    }

    // gradeResult is guaranteed non-null here — the catch block above
    // returns early on failure, so execution only reaches this point on success.
    const grade = gradeResult!

    const { data: updatedSubmission, error: updateError } = await db
      .from("academy_submissions")
      .update({
        status: "marked",
        ai_score: grade.score,
        ai_strengths: grade.strengths,
        ai_corrections: grade.corrections,
        ai_suggested_improvement: grade.suggested_improvement,
        marked_at: new Date().toISOString(),
      })
      .eq("id", submission.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ [ASSIGNMENT SUBMIT] Failed to save grade:", updateError)
      return NextResponse.json({ error: "Failed to save grade" }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission: updatedSubmission })
  } catch (error: any) {
    console.error("❌ [ASSIGNMENT SUBMIT] Error:", error)
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
