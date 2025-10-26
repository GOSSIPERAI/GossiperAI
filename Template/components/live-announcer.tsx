"use client"

import { useEffect } from "react"

interface LiveAnnouncerProps {
  message: string
  priority?: "polite" | "assertive"
  clear?: boolean
}

export function LiveAnnouncer({ message, priority = "polite", clear = false }: LiveAnnouncerProps) {
  useEffect(() => {
    if (!message && !clear) return

    const regionId = priority === "assertive" ? "live-region-assertive" : "live-region-polite"
    const region = document.getElementById(regionId)

    if (region) {
      if (clear) {
        region.textContent = ""
      } else {
        region.textContent = message
        // Clear after announcement to allow repeated messages
        setTimeout(() => {
          region.textContent = ""
        }, 1000)
      }
    }
  }, [message, priority, clear])

  return null
}

// Hook for easier usage
export function useLiveAnnouncer() {
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const regionId = priority === "assertive" ? "live-region-assertive" : "live-region-polite"
    const region = document.getElementById(regionId)

    if (region) {
      region.textContent = message
      setTimeout(() => {
        region.textContent = ""
      }, 1000)
    }
  }

  return { announce }
}
