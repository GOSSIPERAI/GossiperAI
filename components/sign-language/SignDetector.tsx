'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Camera } from '@mediapipe/camera_utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CameraOff } from 'lucide-react'

// Import Fingerpose
import * as fp from 'fingerpose'
import { alphabets } from '@/lib/gestures/Alphabet'
import { commonGestures } from '@/lib/gestures/Common'

interface SignDetectorProps {
    onSignDetected: (sign: string) => void
}

export function SignDetector({ onSignDetected }: SignDetectorProps) {
    const webcamRef = useRef<Webcam>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isReady, setIsReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [detectedSign, setDetectedSign] = useState<string | null>(null)
    const lastSignTimeRef = useRef<number>(0)
    const cameraRef = useRef<Camera | null>(null)
    const estimatorRef = useRef<fp.GestureEstimator | null>(null)

    // Initialize Estimator
    useEffect(() => {
        const knownGestures = [...alphabets, ...commonGestures];
        estimatorRef.current = new fp.GestureEstimator(knownGestures);
        console.log("Fingerpose estimator initialized with " + knownGestures.length + " gestures");
    }, [])

    // We use a history window to smooth out predictions:
    const historyRef = useRef<string[]>([])
    // We keep track of the last emitted sign to avoid spamming the same sign:
    const lastEmittedRef = useRef<{ sign: string, time: number }>({ sign: '', time: 0 })

    const onResults = useCallback(async (results: Results) => {
        if (!canvasRef.current || !webcamRef.current?.video) return

        const videoWidth = webcamRef.current.video.videoWidth
        const videoHeight = webcamRef.current.video.videoHeight

        canvasRef.current.width = videoWidth
        canvasRef.current.height = videoHeight

        const canvasCtx = canvasRef.current.getContext('2d')
        if (!canvasCtx) return

        canvasCtx.save()
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 })
                drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 })

                if (estimatorRef.current) {
                    // Fingerpose expects [x, y, z] nested arrays
                    const estimatedGestures = await estimatorRef.current.estimate(
                        landmarks.map(l => [l.x, l.y, l.z]),
                        8.0 // Lowered slightly to capture continuous streaming better
                    );

                    let detected = null;
                    if (estimatedGestures.gestures.length > 0) {
                        const best = estimatedGestures.gestures.reduce((p, c) => p.score > c.score ? p : c);
                        detected = best.name;
                    }

                    // Sliding window mechanism for stabilization
                    historyRef.current.push(detected || "");
                    if (historyRef.current.length > 15) {
                        historyRef.current.shift(); // Keep last 15 frames
                    }

                    // Count occurrences of the most popular non-empty gesture
                    const counts: Record<string, number> = {};
                    let mostFrequent = "";
                    let maxCount = 0;

                    for (const sign of historyRef.current) {
                        if (!sign) continue;
                        counts[sign] = (counts[sign] || 0) + 1;
                        if (counts[sign] > maxCount) {
                            maxCount = counts[sign];
                            mostFrequent = sign;
                        }
                    }

                    // Real-time confidence threshold: 7 out of 15 frames must agree
                    if (maxCount >= 7) {
                        setDetectedSign(mostFrequent);

                        const now = Date.now();
                        // Only emit if it's a new sign or sufficient time has passed (to allow repeated words if needed)
                        if (
                            mostFrequent !== lastEmittedRef.current.sign ||
                            (now - lastEmittedRef.current.time > 2000)
                        ) {
                            onSignDetected(mostFrequent);
                            lastEmittedRef.current = { sign: mostFrequent, time: now };

                            // Optional: clear history after an emit to require a fresh streak for the next sign
                            historyRef.current = [];
                        }
                    } else {
                        // If bouncing around, fall back to best single-frame guess visually, but don't emit
                        setDetectedSign(detected);
                    }
                }
            }
        } else {
            // No hands detected
            setDetectedSign(null)
            historyRef.current = [];
        }
        canvasCtx.restore()
    }, [onSignDetected])

    useEffect(() => {
        let hands: Hands | null = null;
        let camera: Camera | null = null;

        const initMediaPipe = async () => {
            if (!webcamRef.current?.video) return;

            hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                }
            })

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            })

            hands.onResults(onResults)

            if (webcamRef.current?.video) {
                camera = new Camera(webcamRef.current.video, {
                    onFrame: async () => {
                        if (webcamRef.current?.video && hands) {
                            await hands.send({ image: webcamRef.current.video })
                        }
                    },
                    width: 640,
                    height: 480
                })
                camera.start()
                cameraRef.current = camera
                setIsReady(true)
            }
        }

        // Poll for video element readiness
        const intervalId = setInterval(() => {
            if (webcamRef.current?.video && webcamRef.current.video.readyState === 4 && !isReady) {
                initMediaPipe();
                clearInterval(intervalId);
            }
        }, 500);

        return () => {
            clearInterval(intervalId);
            if (hands) hands.close();
            if (camera) camera.stop();
        }
    }, [onResults, isReady])

    const handleUserMediaError = useCallback((error: string | DOMException) => {
        console.error("Webcam error:", error)
        setCameraError("Camera access denied or not available.")
    }, [])

    return (
        <div className="relative overflow-hidden w-full h-full bg-black flex items-center justify-center">
            {cameraError ? (
                <div className="flex flex-col items-center justify-center text-destructive gap-2 p-4 text-center z-10">
                    <CameraOff className="w-12 h-12" />
                    <p className="font-bold">Camera Error</p>
                    <p className="text-sm">{cameraError}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            ) : !isReady ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-white gap-2 z-20 bg-black">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Initializing Camera & AI...</p>
                </div>
            ) : null}

            <Webcam
                ref={webcamRef}
                className="hidden" // Hiding the raw video since we draw on canvas
                mirrored
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
                onUserMediaError={handleUserMediaError}
            />

            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover ${!isReady ? 'opacity-0' : 'opacity-100'}`}
            />

            {detectedSign && isReady && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-lg font-bold animate-in fade-in zoom-in duration-300 z-10">
                    Scanning: {detectedSign}
                </div>
            )}
        </div>
    )
}
