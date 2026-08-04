import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { z } from "zod"

// answers: { [questionId]: selectedIndex }
const AttemptSchema = z.object({
  answers: z.record(z.string(), z.number()),
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
    const parsed = AttemptSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const quizId = params.id
    const db = createServiceRoleSupabaseClient()

    const { data: quiz, error: quizError } = await db
      .from("academy_quizzes")
      .select("*")
      .eq("id", quizId)
      .maybeSingle()

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Server-side has the answer key — only place correct_index is ever read.
    const { data: questions, error: questionsError } = await db
      .from("academy_quiz_questions")
      .select("id, correct_index, explanation")
      .eq("quiz_id", quizId)

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 })
    }

    const { answers } = parsed.data
    let correctCount = 0

    const results = questions.map((q) => {
      const selected = answers[q.id]
      const isCorrect = selected === q.correct_index
      if (isCorrect) correctCount += 1
      return {
        questionId: q.id,
        selected: selected ?? null,
        correctIndex: q.correct_index,
        isCorrect,
        explanation: q.explanation,
      }
    })

    const scorePercent = Math.round((correctCount / questions.length) * 100)
    const passed = scorePercent >= quiz.pass_mark_percent

    const { data: attempt, error: insertError } = await db
      .from("academy_quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        answers,
        score_percent: scorePercent,
        passed,
      })
      .select()
      .single()

    if (insertError) {
      console.error("❌ [QUIZ ATTEMPT] Failed to save attempt:", insertError)
      return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      attempt,
      scorePercent,
      passed,
      results,
    })
  } catch (error: any) {
    console.error("❌ [QUIZ ATTEMPT] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}