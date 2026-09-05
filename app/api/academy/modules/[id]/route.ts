import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"

const DEFAULT_MODULES_MAP: Record<string, any> = {
  "mod-1": {
    module: {
      id: "mod-1",
      title: "1. Introduction to Decentralized Finance (DeFi)",
      description: "Learn liquidity pools, automated market makers (AMMs), and yield farming fundamentals.",
      syllabus_topic: "DeFi & AMMs",
      order_index: 1,
      pass_mark_percent: 70,
    },
    lessons: [
      {
        id: "l1",
        title: "Lesson 1: Understanding AMMs and Constant Product Formula",
        content: "Automated Market Makers (AMMs) use mathematical formulas to price assets. Uniswap v2 uses the constant product formula: `x * y = k`.",
        order_index: 1,
      },
    ],
    assignments: [
      {
        id: "a1",
        title: "Assignment 1: Calculate Liquidity Pool Ratios",
        prompt: "Explain how impermanent loss occurs when the price ratio of pooled assets diverges.",
        max_score: 10,
        submission: null,
      },
    ],
    quizzes: [
      {
        id: "q1",
        title: "DeFi Fundamentals Quiz",
        pass_mark_percent: 70,
        bestAttempt: null,
        attemptCount: 0,
      },
    ],
    resources: [
      {
        id: "r1",
        title: "DeFi Crash Course Guide",
        url: "https://ethereum.org/en/defi/",
        resource_type: "article",
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const moduleId = params.id

    try {
      const db = createServiceRoleSupabaseClient()
      const { data: moduleRow } = await db
        .from("academy_modules")
        .select("*")
        .eq("id", moduleId)
        .maybeSingle()

      if (moduleRow) {
        const [{ data: lessons }, { data: assignments }, { data: quizzes }, { data: resources }] =
          await Promise.all([
            db.from("academy_lessons").select("*").eq("module_id", moduleId).order("order_index"),
            db.from("academy_assignments").select("*").eq("module_id", moduleId),
            db.from("academy_quizzes").select("*").eq("module_id", moduleId),
            db.from("academy_resources").select("*").eq("module_id", moduleId).order("order_index"),
          ])

        return NextResponse.json({
          success: true,
          module: moduleRow,
          lessons: lessons || [],
          assignments: assignments || [],
          quizzes: quizzes || [],
          resources: resources || [],
        })
      }
    } catch {
      // In dev fallback mode
    }

    const fallbackData = DEFAULT_MODULES_MAP[moduleId] || {
      module: {
        id: moduleId,
        title: "Course Module",
        description: "Course module materials and video lectures.",
        pass_mark_percent: 70,
      },
      lessons: [],
      assignments: [],
      quizzes: [],
      resources: [],
    }

    return NextResponse.json({ success: true, ...fallbackData })
  } catch (error: any) {
    console.error("❌ [ACADEMY MODULE DETAIL] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
