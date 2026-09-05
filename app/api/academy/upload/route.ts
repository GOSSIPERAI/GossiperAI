import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const DEV_FALLBACK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@gossiper.ai",
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    let currentUser = DEV_FALLBACK_USER

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) currentUser = user
    } catch {
      // Dev mode fallback
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name
    const ext = path.extname(filename).toLowerCase()
    const allowedVideoExts = [".mp4", ".webm", ".mov", ".m4v", ".mkv"]
    const allowedDocExts = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".md"]

    const isVideo = allowedVideoExts.includes(ext) || file.type.startsWith("video/")
    const isDoc = allowedDocExts.includes(ext) || file.type.startsWith("application/pdf") || file.type.startsWith("text/")

    if (!isVideo && !isDoc) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files and documents are allowed." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const safeFilename = `${uniqueSuffix}${ext}`

    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses")
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeFilename)
    await writeFile(filePath, buffer)

    const mediaUrl = `/api/academy/media/${safeFilename}`
    const fileType = isVideo ? "video" : "doc"

    return NextResponse.json({
      success: true,
      file: {
        originalName: filename,
        filename: safeFilename,
        url: mediaUrl,
        fileType,
        size: file.size,
      },
    })
  } catch (error: any) {
    console.error("❌ [COURSE UPLOAD API] Error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
