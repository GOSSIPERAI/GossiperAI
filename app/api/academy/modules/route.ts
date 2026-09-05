import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

const DEV_FALLBACK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@gossiper.ai",
}

const DEFAULT_ACADEMY_MODULES = [
  {
    id: "mod-1",
    title: "1. Introduction to Decentralized Finance (DeFi)",
    description: "Learn liquidity pools, automated market makers (AMMs), and yield farming fundamentals.",
    syllabus_topic: "DeFi & AMMs",
    order_index: 1,
    pass_mark_percent: 70,
    totalAssignments: 2,
    markedCount: 0,
    averagePercent: 0,
    inProgress: false,
  },
  {
    id: "mod-2",
    title: "2. Smart Contract Auditing & Security",
    description: "Explore reentrancy attacks, flash loan exploits, and security best practices.",
    syllabus_topic: "Security & Audits",
    order_index: 2,
    pass_mark_percent: 75,
    totalAssignments: 3,
    markedCount: 0,
    averagePercent: 0,
    inProgress: false,
  },
]

// In-memory module storage fallback for uploaded courses in dev mode
let devCreatedModules: any[] = []

export async function GET(request: NextRequest) {
  try {
    let currentUser = DEV_FALLBACK_USER
    try {
      const supabase = createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) currentUser = user
    } catch {
      // Dev mode fallback
    }

    let modules: any[] | null = null

    try {
      const db = createServiceRoleSupabaseClient()
      const { data, error } = await db
        .from("academy_modules")
        .select("id, title, description, syllabus_topic, order_index, pass_mark_percent")
        .order("order_index", { ascending: true })

      if (!error && data && data.length > 0) {
        modules = data
      }
    } catch (dbError) {
      console.warn("⚠️ [ACADEMY MODULES] Supabase DB unreachable, using local fallback modules")
    }

    if (!modules || modules.length === 0) {
      return NextResponse.json({
        success: true,
        modules: [...DEFAULT_ACADEMY_MODULES, ...devCreatedModules],
      })
    }

    // Process module stats if DB succeeded
    const moduleIds = modules.map((m) => m.id)
    let assignments: any[] = []
    let submissions: any[] = []

    try {
      const db = createServiceRoleSupabaseClient()
      const [aRes, sRes] = await Promise.all([
        db.from("academy_assignments").select("id, module_id, max_score").in("module_id", moduleIds),
        db.from("academy_submissions").select("assignment_id, ai_score, status").eq("user_id", currentUser.id),
      ])
      assignments = aRes.data || []
      submissions = sRes.data || []
    } catch {
      // Ignore DB stats error
    }

    const submissionByAssignment = new Map((submissions || []).map((s) => [s.assignment_id, s]))

    const result = modules.map((mod) => {
      const modAssignments = assignments.filter((a) => a.module_id === mod.id)
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

    return NextResponse.json({ success: true, modules: [...result, ...devCreatedModules] })
  } catch (error: any) {
    console.error("❌ [ACADEMY MODULES GET] Safe Fallback:", error)
    return NextResponse.json({
      success: true,
      modules: [...DEFAULT_ACADEMY_MODULES, ...devCreatedModules],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, syllabus_topic, pass_mark_percent, lessons, resources } = body

    if (!title || !syllabus_topic) {
      return NextResponse.json({ error: "Title and Syllabus Topic are required" }, { status: 400 })
    }

    const nextOrder = DEFAULT_ACADEMY_MODULES.length + devCreatedModules.length + 1
    const newModule = {
      id: `custom-mod-${Date.now()}`,
      title,
      description: description || null,
      syllabus_topic,
      order_index: nextOrder,
      pass_mark_percent: pass_mark_percent || 70,
      totalAssignments: (lessons || []).length || 1,
      markedCount: 0,
      averagePercent: 0,
      inProgress: false,
      lessons: lessons || [],
      resources: resources || [],
    }

    try {
      const db = createServiceRoleSupabaseClient()
      const { data: dbModule, error: insertError } = await db
        .from("academy_modules")
        .insert({
          title,
          description: description || null,
          syllabus_topic,
          pass_mark_percent: pass_mark_percent || 70,
          order_index: nextOrder,
        })
        .select()
        .single()

      if (!insertError && dbModule) {
        if (Array.isArray(lessons) && lessons.length > 0) {
          await db.from("academy_lessons").insert(lessons.map((l: any, idx: number) => ({
            module_id: dbModule.id,
            title: l.title || `Lesson ${idx + 1}`,
            content: l.content || "",
            order_index: idx + 1,
          })))
        }
        if (Array.isArray(resources) && resources.length > 0) {
          await db.from("academy_resources").insert(resources.map((r: any, idx: number) => ({
            module_id: dbModule.id,
            title: r.title || r.name || "Course Resource",
            url: r.url,
            resource_type: r.resource_type || "video",
            order_index: idx + 1,
          })))
        }
        return NextResponse.json({ success: true, module: dbModule })
      }
    } catch {
      // In dev fallback mode
    }

    devCreatedModules.push(newModule)
    return NextResponse.json({ success: true, module: newModule })
  } catch (error: any) {
    console.error("❌ [ACADEMY MODULES POST] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
