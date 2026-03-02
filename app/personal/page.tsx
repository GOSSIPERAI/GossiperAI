'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, HandMetal, MessageSquare, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { SignDetector } from "@/components/sign-language/SignDetector"
import { SignPlayer } from "@/components/sign-language/SignPlayer"
import { Textarea } from "@/components/ui/textarea"

import { useRealtimeTranscription } from "@/hooks/useRealtimeTranscription"
import { useEffect } from "react"

export default function PersonalModePage() {
    const [mode, setMode] = useState<'voice' | 'sign'>('voice')
    const { isRecording, startRecording, stopRecording, transcript: liveTranscript, error } = useRealtimeTranscription()

    const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hi! I'm Gossiper. I can translate your voice or sign language. How can I help you today?" }
    ])
    const [inputText, setInputText] = useState("")
    const [isAiActive, setIsAiActive] = useState(false)

    // Sync live transcription to transcript history
    useEffect(() => {
        if (liveTranscript.length > 0) {
            // Get the latest finalized sentence
            const latestSentence = liveTranscript[liveTranscript.length - 1]
            // Add to transcript if it's new (simple check, in production use IDs)
            setTranscript(prev => {
                // Avoid duplicates if re-rendering
                if (prev[prev.length - 1]?.content === latestSentence) return prev
                return [...prev, { role: 'user', content: latestSentence }]
            })

            // Trigger AI response only if active
            if (isAiActive) {
                setTimeout(() => {
                    setTranscript(prev => [...prev, { role: 'ai', content: "I heard you! Processing..." }])
                }, 500)
            }
        }
    }, [liveTranscript, isAiActive])

    const handleSignDetected = (sign: string) => {
        // In a real app, this would accumulate phrases
        // For demo, we just add it to input
        setInputText(prev => prev + (prev ? " " : "") + sign)
    }

    const handleSendMessage = () => {
        if (!inputText.trim()) return

        // Add user message
        setTranscript(prev => [...prev, { role: 'user', content: inputText }])

        // Simulate AI response (Mock for now) if active
        if (isAiActive) {
            setTimeout(() => {
                const responses = [
                    "I understand. That sounds interesting!",
                    "Could you tell me more about that?",
                    "Yes, I can help with translation.",
                    "That's great!"
                ]
                const randomResponse = responses[Math.floor(Math.random() * responses.length)]
                setTranscript(prev => [...prev, { role: 'ai', content: randomResponse }])
            }, 1000)
        }

        setInputText("")
    }

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    return (
        <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b px-4 md:px-6 py-3 flex items-center justify-between shrink-0 h-[60px] md:h-[70px]">
                <Link href="/" className="flex items-center text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    <div className="flex items-center gap-1.5 md:gap-2 bg-muted/50 p-1 md:p-1.5 rounded-lg border border-border/50">
                        <Label htmlFor="mode-toggle" className={`cursor-pointer text-xs md:text-sm px-2 py-1 rounded-md transition-colors ${mode === 'voice' ? 'bg-background shadow-sm font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Voice</Label>
                        <Switch
                            id="mode-toggle"
                            checked={mode === 'sign'}
                            onCheckedChange={(checked) => setMode(checked ? 'sign' : 'voice')}
                            className="data-[state=checked]:bg-primary h-5 w-9 md:h-6 md:w-11"
                        />
                        <Label htmlFor="mode-toggle" className={`cursor-pointer text-xs md:text-sm px-2 py-1 rounded-md transition-colors ${mode === 'sign' ? 'bg-background shadow-sm font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Sign</Label>
                    </div>

                    <div className="h-6 w-px bg-border mx-1 md:mx-2 hidden sm:block" />

                    <Button
                        variant={isAiActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsAiActive(!isAiActive)}
                        className={`gap-2 h-8 md:h-9 ${isAiActive ? 'shadow-md shadow-primary/20' : ''}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">{isAiActive ? "AI Active" : "AI Reply"}</span>
                        <span className="sm:hidden">{isAiActive ? "On" : "Off"}</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-3 md:p-6 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 min-h-0 overflow-hidden">

                {/* Left Column: User Input */}
                <div className="flex flex-col gap-3 md:gap-4 h-[40%] md:h-full md:min-h-0 min-h-[40%]">
                    <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                            You {mode === 'sign' ? <HandMetal className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" /> : <Mic className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />}
                        </h2>
                        {mode === 'voice' && (
                            <Button
                                variant={isRecording ? "destructive" : "default"}
                                size="sm"
                                onClick={toggleRecording}
                                className={`rounded-full shadow-sm transition-all ${isRecording ? 'animate-pulse ring-2 ring-destructive/50 ring-offset-2 ring-offset-background' : ''}`}
                            >
                                {isRecording ? <><MicOff className="w-4 h-4 mr-2" /> Stop</> : <><Mic className="w-4 h-4 mr-2" /> Start</>}
                            </Button>
                        )}
                    </div>

                    {mode === 'sign' ? (
                        <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-border shadow-sm">
                            <SignDetector onSignDetected={handleSignDetected} />
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-muted/20 rounded-xl p-4 md:p-8 text-center text-muted-foreground relative border border-border shadow-inner">
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center mb-4 md:mb-6 transition-all duration-500 ${isRecording ? 'border-primary animate-pulse scale-110 bg-primary/5' : 'border-muted bg-background shadow-sm'}`}>
                                <Mic className={`w-10 h-10 md:w-12 md:h-12 ${isRecording ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            </div>
                            <p className="text-sm md:text-base font-medium">{isRecording ? "Listening..." : "Tap Start to speak"}</p>

                            {error && (
                                <div className="absolute top-4 left-4 right-4 bg-destructive/10 text-destructive px-4 py-2 rounded-lg border border-destructive/20 text-xs md:text-sm text-center animate-in fade-in slide-in-from-top-2 shadow-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}



                    {/* Input Area */}
                    <div className="flex gap-2 shrink-0 h-12 md:h-[52px]">
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={mode === 'sign' ? "Detected signs..." : "Type or speak..."}
                            className="resize-none h-full min-h-full py-2.5 md:py-3 text-sm md:text-base shadow-sm"
                        />
                        <Button className="h-full px-4 md:px-6 shadow-sm" onClick={handleSendMessage}>
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: AI Output */}
                <div className="flex flex-col gap-3 md:gap-4 h-[60%] md:h-full md:min-h-0 flex-1 border-t md:border-t-0 border-border pt-4 md:pt-0 mt-2 md:mt-0">
                    <h2 className="text-lg md:text-2xl font-bold text-primary shrink-0 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> Gossiper AI
                    </h2>

                    <div className="flex-1 flex flex-col gap-3 md:gap-6 min-h-0">
                        {/* Visual Output (Sign Player) */}
                        <div className="shrink-0 h-[30%] md:h-auto md:aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
                            <SignPlayer
                                text={transcript.filter(t => t.role === 'ai').slice(-1)[0]?.content || "Waiting..."}
                                isPlaying={true}
                            />
                        </div>

                        {/* Transcript History */}
                        <Card className="flex-1 bg-muted/30 border border-border/50 shadow-inner flex flex-col min-h-0 overflow-hidden mb-safe">
                            <ScrollArea className="flex-1 p-3 md:p-4">
                                <div className="space-y-4">
                                    {transcript.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[80%] px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-background border border-border rounded-tl-none'
                                                }`}>
                                                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>
                    </div>
                </div>

            </main>
        </div>
    )
}
