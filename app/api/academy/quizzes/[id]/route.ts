import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

// Returns quiz questions WITHOUT correct_index or explanation — those are
// only revealed after the attempt is scored, via the attempt response.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const db = createServiceRoleSupabaseClient()

    const { data: quiz, error: quizError } = await db
      .from("academy_quizzes")
      .select("*")
      .eq("id", params.id)
      .maybeSingle()

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const { data: questions, error: questionsError } = await db
      .from("academy_quiz_questions")
      .select("id, question, options, order_index")
      .eq("quiz_id", params.id)
      .order("order_index")

    if (questionsError) {
      console.error("❌ [QUIZ DETAIL] Failed to fetch questions:", questionsError)
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }

    return NextResponse.json({ success: true, quiz, questions: questions || [] })
  } catch (error: any) {
    console.error("❌ [QUIZ DETAIL] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}