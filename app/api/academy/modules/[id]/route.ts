import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

// Module detail — mirrors Alpha DAO's Work / Quizzes / Compete tabs.
// "Compete" here maps to the leaderboard, fetched separately via
// /api/academy/leaderboard rather than duplicated here.
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

    const moduleId = params.id
    const db = createServiceRoleSupabaseClient()

    const { data: moduleRow, error: moduleError } = await db
      .from("academy_modules")
      .select("*")
      .eq("id", moduleId)
      .maybeSingle()

    if (moduleError || !moduleRow) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const [{ data: lessons }, { data: assignments }, { data: quizzes }, { data: resources }] =
      await Promise.all([
        db.from("academy_lessons").select("*").eq("module_id", moduleId).order("order_index"),
        db.from("academy_assignments").select("*").eq("module_id", moduleId),
        db.from("academy_quizzes").select("*").eq("module_id", moduleId),
        db.from("academy_resources").select("*").eq("module_id", moduleId).order("order_index"),
      ])

    // Attach this user's submission (if any) to each assignment, and
    // this user's best attempt to each quiz, so the frontend doesn't
    // need extra round trips to show "already submitted / already passed."
    const assignmentIds = (assignments || []).map((a) => a.id)
    const quizIds = (quizzes || []).map((q) => q.id)

    const { data: userSubmissions } = assignmentIds.length
      ? await db
          .from("academy_submissions")
          .select("*")
          .eq("user_id", user.id)
          .in("assignment_id", assignmentIds)
      : { data: [] }

    const { data: userAttempts } = quizIds.length
      ? await db
          .from("academy_quiz_attempts")
          .select("*")
          .eq("user_id", user.id)
          .in("quiz_id", quizIds)
      : { data: [] }

    const assignmentsWithStatus = (assignments || []).map((a) => ({
      ...a,
      submission: (userSubmissions || []).find((s) => s.assignment_id === a.id) || null,
    }))

    const quizzesWithStatus = (quizzes || []).map((q) => {
      const attempts = (userAttempts || []).filter((a) => a.quiz_id === q.id)
      const bestAttempt = attempts.sort((a, b) => b.score_percent - a.score_percent)[0] || null
      return { ...q, bestAttempt, attemptCount: attempts.length }
    })

    return NextResponse.json({
      success: true,
      module: moduleRow,
      lessons: lessons || [],
      assignments: assignmentsWithStatus,
      quizzes: quizzesWithStatus,
      resources: resources || [],
    })
  } catch (error: any) {
    console.error("❌ [ACADEMY MODULE DETAIL] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
