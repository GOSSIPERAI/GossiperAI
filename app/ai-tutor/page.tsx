"use client"

import { useState, useRef, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Send,
  Paperclip,
  ImageIcon,
  Mic,
  Sparkles,
  Loader2,
  FileText,
  Bot,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl?: string | null
  kind?: "text" | "pdf" | "image" | "summary"
  createdAt: number
}

type SessionOption = {
  id: string
  title: string
}

export default function AITutorPage() {
  return (
    <AuthGuard requireAuth>
      <AITutorChat />
    </AuthGuard>
  )
}

function AITutorChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your Web3 Academy tutor. Ask me anything about blockchain, DeFi, or the class syllabus — I can also summarize a recorded session, read a PDF for you, or generate an image.",
      kind: "text",
      createdAt: Date.now(),
    },
  ])
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfQuestion, setPdfQuestion] = useState("")
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false)

  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const [summarizeDialogOpen, setSummarizeDialogOpen] = useState(false)
  const [sessionOptions, setSessionOptions] = useState<SessionOption[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function appendMessage(msg: Omit<ChatMessage, "id" | "createdAt">) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() },
    ])
  }

  // --- Core chat send ---
  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    appendMessage({ role: "user", content: trimmed, kind: "text" })
    setInput("")
    setIsSending(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) {
        appendMessage({
          role: "assistant",
          content: `Sorry, something went wrong: ${data.error || "please try again."}`,
          kind: "text",
        })
        return
      }

      setConversationId(data.conversationId)
      appendMessage({ role: "assistant", content: data.reply, kind: "text" })
    } catch (err) {
      appendMessage({
        role: "assistant",
        content: "Network error — couldn't reach the tutor. Please try again.",
        kind: "text",
      })
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // --- PDF analysis ---
  async function handleAnalyzePdf() {
    if (!pdfFile) return
    setIsAnalyzingPdf(true)

    const questionText = pdfQuestion.trim() || "Summarize this document."
    appendMessage({
      role: "user",
      content: `📄 ${pdfFile.name} — ${questionText}`,
      kind: "pdf",
    })

    try {
      const formData = new FormData()
      formData.append("pdf", pdfFile)
      formData.append("question", questionText)

      const res = await fetch("/api/ai/analyze-pdf", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        appendMessage({ role: "assistant", content: `Couldn't read that PDF: ${data.error}`, kind: "text" })
      } else {
        appendMessage({ role: "assistant", content: data.answer, kind: "pdf" })
      }
    } catch {
      appendMessage({ role: "assistant", content: "Network error while analyzing the PDF.", kind: "text" })
    } finally {
      setIsAnalyzingPdf(false)
      setPdfDialogOpen(false)
      setPdfFile(null)
      setPdfQuestion("")
    }
  }

  // --- Image generation ---
  async function handleGenerateImage() {
    const prompt = imagePrompt.trim()
    if (!prompt) return
    setIsGeneratingImage(true)

    appendMessage({ role: "user", content: `🎨 Generate image: "${prompt}"`, kind: "image" })

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()

      if (!res.ok) {
        appendMessage({ role: "assistant", content: `Image generation failed: ${data.error}`, kind: "text" })
      } else {
        const src = data.imageUrl || (data.imageBase64 ? `data:image/png;base64,${data.imageBase64}` : null)
        appendMessage({
          role: "assistant",
          content: prompt,
          imageUrl: src,
          kind: "image",
        })
      }
    } catch {
      appendMessage({ role: "assistant", content: "Network error while generating the image.", kind: "text" })
    } finally {
      setIsGeneratingImage(false)
      setImageDialogOpen(false)
      setImagePrompt("")
    }
  }

  // --- Recording summarization ---
  async function openSummarizeDialog() {
    setSummarizeDialogOpen(true)
    setIsLoadingSessions(true)
    try {
      // Reuses the existing sessions list endpoint — the user's own sessions/participations
      const res = await fetch("/api/sessions")
      if (res.ok) {
        const data = await res.json()
        const options: SessionOption[] = (data.sessions || []).map((s: any) => ({
          id: s.id,
          title: s.title,
        }))
        setSessionOptions(options)
      }
    } catch {
      // Non-fatal — dialog just shows an empty list, user can retry
    } finally {
      setIsLoadingSessions(false)
    }
  }

  async function handleSummarizeRecording() {
    if (!selectedSessionId) return
    setIsSummarizing(true)

    const sessionTitle =
      sessionOptions.find((s) => s.id === selectedSessionId)?.title || "this session"
    appendMessage({ role: "user", content: `🎙️ Summarize recording: ${sessionTitle}`, kind: "summary" })

    try {
      const res = await fetch("/api/ai/summarize-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSessionId }),
      })
      const data = await res.json()

      if (!res.ok) {
        appendMessage({ role: "assistant", content: `Couldn't summarize that session: ${data.error}`, kind: "text" })
      } else {
        appendMessage({ role: "assistant", content: data.summary, kind: "summary" })
      }
    } catch {
      appendMessage({ role: "assistant", content: "Network error while summarizing.", kind: "text" })
    } finally {
      setIsSummarizing(false)
      setSummarizeDialogOpen(false)
      setSelectedSessionId("")
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">Web3 Tutor</h1>
              <p className="text-xs text-muted-foreground">AI-powered · Gossiper Academy</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {user?.role === "lecturer" ? "Lecturer" : "Student"}
          </Badge>
        </div>
      </div>

      {/* Chat area — this whole section takes the remaining height and never grows past it */}
      <div className="flex-1 min-h-0 container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col max-w-3xl w-full overflow-hidden">
        {/* Only this scrolls; the composer below stays fixed in place */}
        <ScrollArea className="flex-1 min-h-0 pr-2" ref={scrollRef as any}>
          <div className="space-y-4 pb-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm pl-11">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Composer */}
        <Card className="mt-4 p-3 shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about blockchain, DeFi, staking, NFTs…"
              className="min-h-[52px] max-h-40 resize-none border-0 focus-visible:ring-0 shadow-none"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPdfDialogOpen(true)}>
              <Paperclip className="h-3.5 w-3.5 mr-1.5" />
              Analyze PDF
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={openSummarizeDialog}>
              <Mic className="h-3.5 w-3.5 mr-1.5" />
              Summarize Recording
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setImageDialogOpen(true)}>
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Generate Image
            </Button>
          </div>
        </Card>
      </div>

      {/* PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Analyze a PDF
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
            <Textarea
              placeholder="What do you want to know? (optional — defaults to a summary)"
              value={pdfQuestion}
              onChange={(e) => setPdfQuestion(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAnalyzePdf} disabled={!pdfFile || isAnalyzingPdf}>
              {isAnalyzingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Generate an image
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="e.g. a simple diagram showing how a liquidity pool works"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button onClick={handleGenerateImage} disabled={!imagePrompt.trim() || isGeneratingImage}>
              {isGeneratingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summarize Recording Dialog */}
      <Dialog open={summarizeDialogOpen} onOpenChange={setSummarizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-4 w-4" /> Summarize a recording
            </DialogTitle>
          </DialogHeader>
          {isLoadingSessions ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your sessions…
            </div>
          ) : sessionOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No sessions with a completed transcript found yet.
            </p>
          ) : (
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a session" />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button
              onClick={handleSummarizeRecording}
              disabled={!selectedSessionId || isSummarizing}
            >
              {isSummarizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Summarize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? "bg-secondary" : "bg-primary text-primary-foreground"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {message.kind === "image" && message.imageUrl ? (
          <div className="space-y-2">
            {!isUser && <p className="text-xs text-muted-foreground">{message.content}</p>}
            <img
              src={message.imageUrl}
              alt={message.content}
              className="rounded-lg max-w-full border border-border"
            />
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}
