"use client"

import { Button } from "@/components/ui/button"

export function SkipNavigation() {
  const skipToMain = () => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView()
    }
  }

  const skipToNav = () => {
    const navigation = document.getElementById("main-navigation")
    if (navigation) {
      navigation.focus()
      navigation.scrollIntoView()
    }
  }

  return (
    <div className="sr-only focus-within:not-sr-only fixed top-4 left-4 z-50 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={skipToMain}
        className="bg-background border-2 border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={skipToNav}
        className="bg-background border-2 border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to navigation
      </Button>
    </div>
  )
}
