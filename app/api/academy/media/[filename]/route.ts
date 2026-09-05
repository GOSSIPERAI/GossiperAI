import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createReadStream, existsSync, statSync } from "fs"
import path from "path"

const DEV_FALLBACK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@gossiper.ai",
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
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

    const { filename } = params
    const sanitizedFilename = path.basename(filename)
    const filePath = path.join(process.cwd(), "public", "uploads", "courses", sanitizedFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const stat = statSync(filePath)
    const ext = path.extname(sanitizedFilename).toLowerCase()

    let contentType = "application/octet-stream"
    if (ext === ".mp4") contentType = "video/mp4"
    else if (ext === ".webm") contentType = "video/webm"
    else if (ext === ".mov" || ext === ".m4v") contentType = "video/mp4"
    else if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".txt") contentType = "text/plain; charset=utf-8"
    else if (ext === ".md") contentType = "text/markdown; charset=utf-8"

    const nodeStream = createReadStream(filePath)

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer | string) => {
          const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk
          controller.enqueue(new Uint8Array(buf))
        })
        nodeStream.on("end", () => {
          controller.close()
        })
        nodeStream.on("error", (err) => {
          controller.error(err)
        })
      },
      cancel() {
        nodeStream.destroy()
      },
    })

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-transform, max-age=3600",
      },
    })
  } catch (error: any) {
    console.error("❌ [MEDIA STREAM API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
