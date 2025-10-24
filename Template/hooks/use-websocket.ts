"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WebSocketMessage {
  type: string
  sessionId: string
  data: any
  timestamp: Date
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnectAttempts?: number
  reconnectInterval?: number
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { onMessage, onConnect, onDisconnect, onError, reconnectAttempts = 5, reconnectInterval = 3000 } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus("connecting")

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate a WebSocket connection
      const mockWs = {
        readyState: WebSocket.OPEN,
        send: (data: string) => {
          console.log("[WebSocket] Sending:", data)
        },
        close: () => {
          setIsConnected(false)
          setConnectionStatus("disconnected")
          onDisconnect?.()
        },
        addEventListener: (event: string, handler: Function) => {
          // Mock event listeners
        },
        removeEventListener: (event: string, handler: Function) => {
          // Mock event listeners
        },
      } as any

      wsRef.current = mockWs
      setIsConnected(true)
      setConnectionStatus("connected")
      reconnectCountRef.current = 0
      onConnect?.()

      // Simulate receiving messages
      const messageInterval = setInterval(
        () => {
          if (wsRef.current && isConnected) {
            const mockMessage: WebSocketMessage = {
              type: "caption",
              sessionId: "current",
              data: {
                id: Date.now().toString(),
                originalText: generateMockCaption(),
                translations: generateMockTranslations(),
                timestamp: new Date(),
                speakerId: "lecturer",
                confidence: 0.95,
              },
              timestamp: new Date(),
            }
            onMessage?.(mockMessage)
          }
        },
        8000 + Math.random() * 4000,
      ) // Random interval between 8-12 seconds

      // Store interval reference for cleanup
      ;(mockWs as any)._messageInterval = messageInterval
    } catch (error) {
      console.error("[WebSocket] Connection error:", error)
      setConnectionStatus("error")
      onError?.(error as Event)
      attemptReconnect()
    }
  }, [onConnect, onDisconnect, onError, onMessage, isConnected])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      // Clear mock interval
      if ((wsRef.current as any)._messageInterval) {
        clearInterval((wsRef.current as any)._messageInterval)
      }
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus("disconnected")
  }, [])

  const attemptReconnect = useCallback(() => {
    if (reconnectCountRef.current < reconnectAttempts) {
      reconnectCountRef.current++
      console.log(`[WebSocket] Reconnecting... Attempt ${reconnectCountRef.current}/${reconnectAttempts}`)

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, reconnectInterval)
    } else {
      console.error("[WebSocket] Max reconnection attempts reached")
      setConnectionStatus("error")
    }
  }, [connect, reconnectAttempts, reconnectInterval])

  const sendMessage = useCallback((message: Omit<WebSocketMessage, "timestamp">) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: new Date(),
      }
      wsRef.current.send(JSON.stringify(fullMessage))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
  }
}

// Mock caption generation for demo
function generateMockCaption(): string {
  const captions = [
    "Now let's examine the relationship between force and acceleration in Newton's second law.",
    "The equation F equals m times a shows us how force, mass, and acceleration are connected.",
    "Can anyone tell me what happens when we increase the mass while keeping force constant?",
    "That's correct! The acceleration decreases proportionally to the increase in mass.",
    "This principle is fundamental to understanding motion in classical mechanics.",
    "Let's look at some real-world examples of this law in action.",
    "Consider a car accelerating from a traffic light - what forces are at play here?",
    "The engine provides the driving force, while friction and air resistance oppose motion.",
    "Now, let's move on to Newton's third law - for every action, there's an equal and opposite reaction.",
    "This law explains how rockets work in the vacuum of space.",
  ]
  return captions[Math.floor(Math.random() * captions.length)]
}

function generateMockTranslations(): Record<string, string> {
  const translations: Record<string, string[]> = {
    yo: [
      "Bayi jẹ ki a ṣayẹwo ibatan laarin agbara ati isare ni ofin keji Newton.",
      "Idogba F dogba m ni a fi han wa bi agbara, iwuwo, ati isare ṣe ni asopọ.",
      "Ṣe ẹnikẹni le sọ fun mi ohun ti yoo ṣẹlẹ nigbati a ba mu iwuwo pọ si lakoko ti a fi agbara silẹ?",
      "O tọ! Isare dinku ni iwọn si alekun iwuwo.",
      "Ilana yii jẹ ipilẹ si oye iṣipopada ni ẹrọ ayeraye.",
    ],
    fr: [
      "Examinons maintenant la relation entre la force et l'accélération dans la deuxième loi de Newton.",
      "L'équation F égale m fois a nous montre comment la force, la masse et l'accélération sont liées.",
      "Quelqu'un peut-il me dire ce qui se passe quand on augmente la masse en gardant la force constante?",
      "C'est correct! L'accélération diminue proportionnellement à l'augmentation de la masse.",
      "Ce principe est fondamental pour comprendre le mouvement en mécanique classique.",
    ],
    es: [
      "Ahora examinemos la relación entre fuerza y aceleración en la segunda ley de Newton.",
      "La ecuación F igual a m por a nos muestra cómo están conectadas la fuerza, masa y aceleración.",
      "¿Alguien puede decirme qué pasa cuando aumentamos la masa manteniendo la fuerza constante?",
      "¡Correcto! La aceleración disminuye proporcionalmente al aumento de masa.",
      "Este principio es fundamental para entender el movimiento en mecánica clásica.",
    ],
  }

  const result: Record<string, string> = {}
  Object.keys(translations).forEach((lang) => {
    const langTranslations = translations[lang]
    result[lang] = langTranslations[Math.floor(Math.random() * langTranslations.length)]
  })

  return result
}
