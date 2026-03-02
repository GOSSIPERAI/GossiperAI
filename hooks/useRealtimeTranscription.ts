import { useState, useEffect, useRef, useCallback } from 'react'

export function useRealtimeTranscription() {
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const socketRef = useRef<WebSocket | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const recorderRef = useRef<ScriptProcessorNode | null>(null)

    const startRecording = async () => {
        setError(null)
        try {
            const response = await fetch('/api/token')
            const data = await response.json()

            if (data.error) {
                console.error('Error fetching token:', data.error)
                setError(data.error)
                return
            }

            // Request Mic Permission FIRST before opening socket to fail fast
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            } catch (err) {
                console.error('Microphone access denied:', err)
                setError("Microphone access denied. Please allow microphone access.")
                return
            }

            const socket = new WebSocket(
                `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${data.token}`
            )

            socket.onmessage = (message) => {
                const res = JSON.parse(message.data)
                if (res.message_type === 'FinalTranscript') {
                    setTranscript((prev) => [...prev, res.text])
                } else if (res.message_type === 'PartialTranscript') {
                    // We don't need partial transcript for now
                }
            }

            socket.onerror = (event) => {
                console.error('WebSocket error:', event)
                setError("Connection to transcription service failed.")
                stopRecording()
            }

            socket.onclose = (event) => {
                console.log('WebSocket closed:', event)
                setIsRecording(false)
                // stopRecording() // Don't recursive call, just cleanup
            }

            socket.onopen = async () => {
                setIsRecording(true)
                socketRef.current = socket

                mediaStreamRef.current = stream
                audioContextRef.current = new window.AudioContext({ sampleRate: 16000 })
                const source = audioContextRef.current.createMediaStreamSource(stream)
                const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

                source.connect(processor)
                processor.connect(audioContextRef.current.destination)

                processor.onaudioprocess = (e) => {
                    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

                    const inputData = e.inputBuffer.getChannelData(0)
                    // Convert float32 to int16
                    const buffer = new ArrayBuffer(inputData.length * 2)
                    const outputView = new DataView(buffer)
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]))
                        outputView.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
                    }

                    const base64Data = btoa(
                        new Uint8Array(buffer).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    )

                    socketRef.current.send(JSON.stringify({ audio_data: base64Data }))
                }

                recorderRef.current = processor
            }

        } catch (error) {
            console.error('Error starting recording:', error)
            setError("Failed to start recording.")
            stopRecording()
        }
    }

    const stopRecording = useCallback(() => {
        setIsRecording(false)

        if (socketRef.current) {
            // Check state before closing to avoid errors
            if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
                socketRef.current.close()
            }
            socketRef.current = null
        }

        if (recorderRef.current) {
            recorderRef.current.disconnect()
            recorderRef.current = null
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop())
            mediaStreamRef.current = null
        }

        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
    }, [])

    return {
        isRecording,
        startRecording,
        stopRecording,
        transcript,
        error
    }
}
