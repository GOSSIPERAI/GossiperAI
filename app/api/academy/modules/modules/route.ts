import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

// Mirrors Alpha DAO's "My modules" view: each module with the user's
// progress (submissions marked so far, average score, pass mark).
export async function GET(request: NextRequest) {
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

    const { data: modules, error: modulesError } = await db
      .from("academy_modules")
      .select("id, title, description, syllabus_topic, order_index, pass_mark_percent")
      .order("order_index", { ascending: true })

    if (modulesError) {
      console.error("❌ [ACADEMY MODULES] Failed to fetch modules:", modulesError)
      return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
    }

    // Assignment counts + this user's marked submissions, per module,
    // computed in application code since it's a handful of modules —
    // simpler and clearer than a single mega-join for this scale.
    const moduleIds = (modules || []).map((m) => m.id)

    const { data: assignments } = await db
      .from("academy_assignments")
      .select("id, module_id, max_score")
      .in("module_id", moduleIds)

    const { data: submissions } = await db
      .from("academy_submissions")
      .select("assignment_id, ai_score, status")
      .eq("user_id", user.id)

    const submissionByAssignment = new Map((submissions || []).map((s) => [s.assignment_id, s]))

    const result = (modules || []).map((mod) => {
      const modAssignments = (assignments || []).filter((a) => a.module_id === mod.id)
      const totalRequired = modAssignments.length

      let markedCount = 0
      let scoreSum = 0
      let maxSum = 0

      modAssignments.forEach((a) => {
        const sub = submissionByAssignment.get(a.id)
        if (sub && sub.status === "marked" && sub.ai_score !== null) {
          markedCount += 1
          scoreSum += sub.ai_score
          maxSum += a.max_score
        }
      })

      const averagePercent = maxSum > 0 ? Math.round((scoreSum / maxSum) * 100) : 0

      return {
        ...mod,
        totalAssignments: totalRequired,
        markedCount,
        averagePercent,
        inProgress: markedCount > 0 && markedCount < totalRequired,
      }
    })

    return NextResponse.json({ success: true, modules: result })
  } catch (error: any) {
    console.error("❌ [ACADEMY MODULES] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
