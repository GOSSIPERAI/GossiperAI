+"use client"

import React, { useState, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, ShieldAlert, FileText, Video, Eye, Lock, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProtectedMediaPlayerProps {
  id?: string
  url: string
  title: string
  resourceType: "video" | "doc" | "article" | "tool" | string
  onDelete?: () => void
}

export function ProtectedMediaPlayer({ id, url, title, resourceType, onDelete }: ProtectedMediaPlayerProps) {
  const isVideo = resourceType === "video" || url.includes("video") || url.endsWith(".mp4") || url.endsWith(".webm")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to take down "${title}"? This will permanently delete the video file.`)) {
      return
    }
    setIsDeleting(true)
    try {
      if (id) {
        await fetch(`/api/academy/resources/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
      }
      onDelete?.()
    } catch (err) {
      console.error("Failed to delete resource:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Protected Header Badge */}
      <div className="bg-muted/60 px-4 py-2 flex items-center justify-between border-b border-border text-xs">
        <div className="flex items-center gap-2 font-medium">
          {isVideo ? (
            <Video className="h-4 w-4 text-primary" />
          ) : (
            <FileText className="h-4 w-4 text-primary" />
          )}
          <span className="truncate max-w-xs">{title}</span>
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            Protected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
            <Lock className="h-3 w-3 text-amber-500" />
            <span>Non-downloadable</span>
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Take Down
            </Button>
          )}
        </div>
      </div>

      {/* Media Viewer Body */}
      <div
        className="relative w-full bg-black/95 flex items-center justify-center min-h-[280px]"
        onContextMenu={(e) => {
          e.preventDefault()
          return false
        }}
      >
        {isVideo ? (
          <div className="relative w-full flex flex-col items-center">
            <video
              ref={videoRef}
              src={url}
              className="w-full max-h-[480px] object-contain rounded-none select-none pointer-events-auto"
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              controls
              onContextMenu={(e) => e.preventDefault()}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support HTML5 video streaming.
            </video>

            {/* Protective Overlay Banner */}
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground px-2 py-1 rounded text-[10px] flex items-center gap-1 pointer-events-none z-10 border border-border/50">
              <ShieldAlert className="h-3 w-3 text-amber-500" /> Protected Video
            </div>
          </div>
        ) : (
          <div className="w-full h-[450px] relative flex flex-col">
            <div className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 border border-border shadow-sm">
              <Lock className="h-3 w-3 text-amber-500" /> Watermarked Document Preview
            </div>
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0 select-none"
              title={title}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        )}
      </div>

      {/* Protection Footer Note */}
      <div className="p-3 bg-card border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 text-primary" /> View-only mode active
        </span>
        <span className="text-[11px]">Downloads and export actions are restricted</span>
      </div>
    </div>
  )
}
