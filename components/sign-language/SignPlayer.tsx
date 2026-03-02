'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Play, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock dictionary - in a real app this would be a large JSON or API
const VIDEO_DICTIONARY: Record<string, string> = {
    // "hello": "/assets/signs/hello.mp4", 
    // "welcome": "/assets/signs/welcome.mp4",
    // "yes": "/assets/signs/yes.mp4",
    // "no": "/assets/signs/no.mp4"
    // Commented out until assets are available to ensure functionality
}

interface SignPlayerProps {
    text: string
    isPlaying: boolean
    onComplete?: () => void
}

export function SignPlayer({ text, isPlaying, onComplete }: SignPlayerProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null)
    const [isFingerSpelling, setIsFingerSpelling] = useState(false)
    const [spellingCharIndex, setSpellingCharIndex] = useState(0)

    const words = text.toLowerCase().split(' ').filter(w => w.length > 0)

    useEffect(() => {
        if (isPlaying && words.length > 0) {
            playNextWord()
        } else {
            // Reset
            setCurrentWordIndex(0)
            setSpellingCharIndex(0)
            setIsFingerSpelling(false)
        }
    }, [isPlaying, text])

    const playNextWord = () => {
        if (currentWordIndex >= words.length) {
            onComplete?.()
            return
        }

        const word = words[currentWordIndex]

        // Check if we have a video for this word
        if (VIDEO_DICTIONARY[word]) {
            setIsFingerSpelling(false)
            setCurrentVideoSrc(VIDEO_DICTIONARY[word])
            // Video onEnded will trigger next word
        } else {
            // Fallback to fingerspelling
            setIsFingerSpelling(true)
            setSpellingCharIndex(0)
        }
    }

    // Handle fingerspelling timing
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isFingerSpelling && isPlaying) {
            const word = words[currentWordIndex]
            if (!word) return
            if (spellingCharIndex < word.length) {
                timer = setTimeout(() => {
                    setSpellingCharIndex(prev => prev + 1)
                }, 800) // Speed of spelling
            } else {
                // Word complete
                timer = setTimeout(() => {
                    setIsFingerSpelling(false)
                    setCurrentWordIndex(prev => prev + 1)
                    playNextWord() // Trigger next word
                }, 1000) // Pause between words
            }
        }
        return () => clearTimeout(timer)
    }, [isFingerSpelling, spellingCharIndex, isPlaying, currentWordIndex])

    const handleVideoEnded = () => {
        setCurrentWordIndex(prev => prev + 1)
        // Small delay before next word
        setTimeout(playNextWord, 500)
    }

    const currentWord = words[currentWordIndex] || ""
    const currentChar = (isFingerSpelling && currentWord) ? currentWord[spellingCharIndex] : ""

    return (
        <div className="w-full h-full bg-muted flex items-center justify-center relative overflow-hidden">
            {!isPlaying ? (
                <div className="flex flex-col items-center text-muted-foreground p-6 text-center">
                    <Play className="w-12 h-12 mb-2 opacity-50" />
                    <p>Waiting for text input...</p>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {isFingerSpelling ? (
                        <div className="flex flex-col items-center justify-center text-white h-full w-full p-4">
                            <div className="text-6xl md:text-8xl font-bold bg-primary w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-xl mb-4 shadow-lg shrink-0">
                                {currentChar ? currentChar.toUpperCase() : "_"}
                            </div>
                            <p className="text-lg md:text-xl text-center">Fingerspelling: <span className="font-bold text-primary break-all">{currentWord}</span></p>
                        </div>
                    ) : (
                        currentVideoSrc ? (
                            <video
                                src={currentVideoSrc}
                                autoPlay
                                onEnded={handleVideoEnded}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-white">Loading sign...</div>
                        )
                    )}

                    <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                        <span className="bg-black/80 text-white px-4 py-1.5 rounded-full text-xs md:text-sm shadow-sm inline-block max-w-full truncate">
                            Signing: {text}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
