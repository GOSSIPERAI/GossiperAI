// lib/assembly.ts
// AssemblyAI Realtime Streaming WebSocket Connection
// Used only when USE_STREAMING=true (streaming mode)

export interface StreamingMessage {
  text: string;
  isFinal: boolean;
}

export const connectStream = (
  token: string,
  sessionId: string,
  onMessage: (msg: StreamingMessage) => void
) => {
  // Build webhook URL for streaming transcripts
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '');
  const webhookUrl = `${baseUrl}/api/transcription/ingest?sessionId=${sessionId}`;

  const ws = new WebSocket(
    `wss://streaming.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}` +
    `&webhook_url=${encodeURIComponent(webhookUrl)}`
  );

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // Handle both PartialTranscript and FinalTranscript message types
    if (data.message_type?.includes('Transcript')) {
      onMessage({
        text: data.text || '',
        isFinal: data.message_type === 'FinalTranscript',
      });
    }
  };

  ws.onopen = () => {
    // Send configuration to keep session alive
    ws.send(JSON.stringify({ terminate_session: false }));
  };

  ws.onerror = (error) => {
    console.error('[STREAMING] WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('[STREAMING] WebSocket closed:', event.code, event.reason);
  };

  return {
    send: (buf: ArrayBuffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(buf);
      }
    },
    close: () => {
      ws.close();
    },
    readyState: () => ws.readyState,
  };
};

