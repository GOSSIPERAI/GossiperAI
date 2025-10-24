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
      {/* Simplified Controls - Clean and minimal */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/95 backdrop-blur" style={{ paddingLeft: '72px' }}>
        <div className="flex items-center gap-3">
          {/* Language Selector - Compact */}
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-36 h-9 border-none bg-muted/50" aria-label="Select caption language">
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

          {/* Connection Status - Subtle */}
          {isReceiving && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFontSize("small")}>Small Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("medium")}>Medium Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize("large")}>Large Text</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAutoScroll(!autoScroll)}>
                {autoScroll ? "Disable" : "Enable"} Auto-scroll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCaptions(selectedLanguage)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Captions Display - Clean, minimal design with left spacing */}
      <div
        ref={captionsContainerRef}
        className={`flex-1 overflow-y-auto pr-8 py-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
        style={{ paddingLeft: '72px' }}
        role="log"
        aria-live="polite"
        aria-label="Live captions feed"
        tabIndex={0}
      >
        {displayedCaptions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 max-w-md">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Waiting for captions...</h3>
              <p className="text-sm text-muted-foreground">
                Captions will appear here in real-time when the host starts speaking
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {displayedCaptions.map((caption, index) => (
              <div key={caption.id} className="group">
                {/* Caption Text - Large and readable */}
                <div className={`${getFontSizeClass() === 'text-sm' ? 'text-xl' : getFontSizeClass() === 'text-base' ? 'text-2xl' : 'text-3xl'} leading-relaxed font-medium text-foreground mb-2`}>
                  {selectedLanguage === "en"
                    ? caption.originalText
                    : caption.translations[selectedLanguage] || caption.originalText}
                </div>
                
                {/* Caption metadata - Subtle */}
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <time className="text-xs text-muted-foreground" dateTime={caption.timestamp.toISOString()}>
                    {formatTimestamp(caption.timestamp)}
                  </time>
                  {caption.isLive && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Live
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCaption(caption)}
                    className="h-6 px-2"
                    aria-label="Copy caption"
                  >
                    {copiedId === caption.id ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                
                {/* Divider */}
                {index < displayedCaptions.length - 1 && (
                  <div className="mt-6 border-b border-border/30"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
