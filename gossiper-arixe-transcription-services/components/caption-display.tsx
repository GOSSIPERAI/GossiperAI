"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  Trash2,
  Settings,
  Volume2,
  Maximize2,
  Minimize2,
  Copy,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useCaptions, type Caption } from "@/hooks/use-captions"

interface CaptionDisplayProps {
  sessionId: string
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  availableLanguages: { code: string; name: string }[]
  className?: string
}

export function CaptionDisplay({
  sessionId,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  className = "",
}: CaptionDisplayProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [fontSize, setFontSize] = useState("medium")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const {
    captions,
    isConnected,
    connectionStatus,
    isReceiving,
    error,
    captionsContainerRef,
    clearCaptions,
    exportCaptions,
    searchCaptions,
  } = useCaptions({ sessionId, autoScroll })

  const displayedCaptions = searchQuery ? searchCaptions(searchQuery, selectedLanguage) : captions

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm"
      case "large":
        return "text-xl"
      default:
        return "text-base"
    }
  }

  const copyCaption = async (caption: Caption) => {
    const text =
      selectedLanguage === "en" ? caption.originalText : caption.translations[selectedLanguage] || caption.originalText
    await navigator.clipboard.writeText(text)
    setCopiedId(caption.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp)
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "connecting":
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
      case "error":
      case "disconnected":
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`} role="region" aria-label="Live captions display">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2" role="status" aria-live="polite">
            {getConnectionStatusIcon()}
            <span className="text-sm text-muted-foreground capitalize">{connectionStatus}</span>
            {isReceiving && (
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            )}
          </div>

          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-48" aria-label="Select caption language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              aria-label="Search through captions"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Caption display settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowTimestamps(!showTimestamps)}>
                {showTimestamps ? "Hide" : "Show"} Timestamps
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAutoScroll(!autoScroll)}>
                {autoScroll ? "Disable" : "Enable"} Auto-scroll
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFontSize("small")}>Small Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("medium")}>Medium Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("large")}>Large Text</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportCaptions(selectedLanguage)}>
                <Download className="h-4 w-4 mr-2" />
                Export Captions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearCaptions} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20" role="alert" aria-live="assertive">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Captions Display */}
      <div
        ref={captionsContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
        role="log"
        aria-live="polite"
        aria-label="Live captions feed"
        tabIndex={0}
      >
        {displayedCaptions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <Volume2 className="h-8 w-8 mx-auto opacity-50" aria-hidden="true" />
              <p>Waiting for captions...</p>
              <p className="text-sm">Captions will appear here when the session starts</p>
            </div>
          </div>
        ) : (
          displayedCaptions.map((caption) => (
            <Card key={caption.id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="space-y-2">
                {/* Caption Header */}
                {showTimestamps && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <time className="text-xs text-muted-foreground" dateTime={caption.timestamp.toISOString()}>
                        {formatTimestamp(caption.timestamp)}
                      </time>
                      {caption.isLive && (
                        <Badge variant="secondary" className="text-xs">
                          Live
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {Math.round(caption.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCaption(caption)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Copy caption: ${caption.originalText.substring(0, 50)}...`}
                    >
                      {copiedId === caption.id ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Caption Text */}
                <div className={`${getFontSizeClass()} leading-relaxed text-pretty caption-text`}>
                  {selectedLanguage === "en"
                    ? caption.originalText
                    : caption.translations[selectedLanguage] || caption.originalText}
                </div>

                {/* Translation Indicator */}
                {selectedLanguage !== "en" && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      Translated from English
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Caption Count */}
      <div className="p-2 border-t border-border bg-muted/30 text-center" role="status" aria-live="polite">
        <span className="text-xs text-muted-foreground">
          {displayedCaptions.length} caption{displayedCaptions.length !== 1 ? "s" : ""}
          {searchQuery && ` (filtered from ${captions.length})`}
        </span>
      </div>
    </div>
  )
}
