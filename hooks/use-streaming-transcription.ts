// hooks/use-streaming-transcription.ts
// Unified transcription hook supporting both streaming and pre-recorded modes
// Automatically switches based on NEXT_PUBLIC_USE_STREAMING environment variable

'use client';

import { useState, useRef, useCallback } from 'react';
import { USE_STREAMING } from '@/lib/config';
import { connectStream } from '@/lib/assembly';

export interface StreamingTranscriptionHook {
  // Display text (final + partial for streaming, final only for pre-recorded)
  fullText: string;
  partialText: string;
  
  // Mode information
  isStreaming: boolean;
  
  // Streaming mode functions (only active when USE_STREAMING=true)
  startStreaming: () => Promise<void>;
  sendAudio: (buf: ArrayBuffer) => void;
  stopStreaming: () => void;
  
  // Pre-recorded mode functions (only active when USE_STREAMING=false)
  uploadPrerecorded: (blob: Blob) => Promise<void>;
  
  // Status
  isActive: boolean;
  error: string | null;
}

export function useStreamingTranscription(sessionId: string): StreamingTranscriptionHook {
  const [text, setText] = useState('');
  const [partial, setPartial] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket reference for streaming mode
  const wsRef = useRef<ReturnType<typeof connectStream> | null>(null);

  // === STREAMING MODE ===
  // Only used when USE_STREAMING=true
  const startStreaming = useCallback(async () => {
    if (!USE_STREAMING) {
      console.warn('[STREAMING] Streaming mode disabled, use uploadPrerecorded instead');
      return;
    }

    try {
      setError(null);
      setIsActive(true);

      // Fetch token from our API
      const response = await fetch('/api/transcription/token');
      if (!response.ok) {
        throw new Error('Failed to get streaming token');
      }

      const { token } = await response.json();
      if (!token) {
        throw new Error('No token received');
      }

      // Connect to AssemblyAI Realtime WebSocket
      wsRef.current = connectStream(token, sessionId, (msg) => {
        if (msg.isFinal) {
          // Final transcript - append to full text and save to database
          setText((prev) => (prev ? prev + ' ' + msg.text : msg.text));
          setPartial('');

          // Send final transcript to database via ingest API
          if (msg.raw) {
            fetch('/api/transcription/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                text: msg.text,
                is_final: true,
                words: msg.raw.words,
                confidence: msg.raw.confidence
              })
            }).catch(err => console.error('[INGEST] Failed:', err));
          }

          
        } else {
          // Partial transcript - show as temporary text
          setPartial(msg.text);
        }
      });

      console.log('[STREAMING] Started streaming transcription');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start streaming';
      setError(errorMsg);
      setIsActive(false);
      console.error('[STREAMING] Error starting stream:', err);
    }
  }, [sessionId]);

  const sendAudio = useCallback((buf: ArrayBuffer) => {
    if (!USE_STREAMING || !wsRef.current) {
      return;
    }
    // Only send if WebSocket is ready
    if (wsRef.current.isReady && wsRef.current.isReady()) {
      wsRef.current.send(buf);
    } else {
      console.warn('[STREAMING] WebSocket not ready, skipping audio chunk');
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsActive(false);
    setPartial('');
    console.log('[STREAMING] Stopped streaming transcription');
  }, []);

  // === PRE-RECORDED MODE ===
  // Only used when USE_STREAMING=false
  const uploadPrerecorded = useCallback(async (blob: Blob) => {
    if (USE_STREAMING) {
      console.warn('[PRERECORDED] Pre-recorded mode disabled, use streaming instead');
      return;
    }

    try {
      setError(null);
      setIsActive(true);

      const formData = new FormData();
      formData.append('audio', blob, `session-${sessionId}.webm`);
      formData.append('callbackUrl', `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/transcription/callback`);
      formData.append('languageCode', 'en'); // Default, can be made configurable
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/transcription/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio for transcription');
      }

      const result = await response.json();
      console.log('[PRERECORDED] Transcription job submitted:', result.jobId);
      
      // Note: The actual transcription text will come via Supabase Realtime
      // through the useRealtimeTranscriptions hook, not through this hook
      // This hook just handles the upload
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload audio';
      setError(errorMsg);
      setIsActive(false);
      console.error('[PRERECORDED] Error uploading audio:', err);
    }
  }, [sessionId]);

  return {
    fullText: USE_STREAMING ? (text + (partial ? ' ' + partial : '')) : text,
    partialText: USE_STREAMING ? partial : '',
    isStreaming: USE_STREAMING,
    startStreaming: USE_STREAMING ? startStreaming : async () => {},
    sendAudio: USE_STREAMING ? sendAudio : () => {},
    stopStreaming: USE_STREAMING ? stopStreaming : () => {},
    uploadPrerecorded: USE_STREAMING ? async () => {} : uploadPrerecorded,
    isActive,
    error,
  };
}

