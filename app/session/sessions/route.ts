import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

// Lightweight session list for the current user — used by the AI Tutor's
// "Summarize Recording" picker. Returns sessions the user hosts or has
// joined as a participant. Kept separate from /api/sessions/[id] which
// returns full session detail for one session.
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

    const { data: hosted, error: hostedError } = await db
      .from("sessions")
      .select("id, title, created_at, status")
      .eq("created_by", user.id)

    if (hostedError) {
      console.error("❌ [SESSIONS LIST] Failed to fetch hosted sessions:", hostedError)
    }

    const { data: joinedRows, error: joinedError } = await db
      .from("sessions_participants")
      .select("sessions(id, title, created_at, status)")
      .eq("user_id", user.id)

    if (joinedError) {
      console.error("❌ [SESSIONS LIST] Failed to fetch joined sessions:", joinedError)
    }

    const joined = (joinedRows || [])
      .map((row: any) => row.sessions)
      .filter(Boolean)

    // De-dupe in case the user hosts a session they're also listed as a participant in
    const byId = new Map<string, any>()
    ;[...(hosted || []), ...joined].forEach((s) => byId.set(s.id, s))

    const sessions = Array.from(byId.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ success: true, sessions })
  } catch (error: any) {
    console.error("❌ [SESSIONS LIST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
