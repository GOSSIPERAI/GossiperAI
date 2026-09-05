import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase-server"
import { unlink, existsSync } from "fs"
import path from "path"

const DEV_FALLBACK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@gossiper.ai",
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    let currentUser = DEV_FALLBACK_USER

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) currentUser = user
    } catch {
      // Dev mode fallback
    }

    const resourceId = params.id
    let fileUrl: string | null = null

    try {
      const db = createServiceRoleSupabaseClient()
      const { data: resourceRow } = await db
        .from("academy_resources")
        .select("*")
        .eq("id", resourceId)
        .maybeSingle()

      if (resourceRow) {
        fileUrl = resourceRow.url
        await db.from("academy_resources").delete().eq("id", resourceId)
      }
    } catch (dbErr) {
      console.warn("⚠️ Supabase delete warning:", dbErr)
    }

    // Check if body passed mediaUrl directly
    const body = await request.json().catch(() => ({}))
    const targetUrl = body.url || fileUrl

    // If local media file, delete physical file from disk
    if (targetUrl && targetUrl.includes("/api/academy/media/")) {
      const filename = path.basename(targetUrl)
      const filePath = path.join(process.cwd(), "public", "uploads", "courses", filename)
      if (existsSync(filePath)) {
        unlink(filePath, (err) => {
          if (err) console.error("Failed to delete physical media file:", err)
        })
      }
    }

    return NextResponse.json({ success: true, message: "Resource taken down successfully" })
  } catch (error: any) {
    console.error("❌ [DELETE RESOURCE API] Error:", error)
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}
