// lib/assembly.ts
// AssemblyAI Realtime Streaming WebSocket Connection
// Used only when USE_STREAMING=true (streaming mode)

export interface StreamingMessage {
  text: string;
  isFinal: boolean;
  raw?: any; // Raw transcript data for final messages
}

export const connectStream = (
  token: string,
  onMessage: (msg: StreamingMessage) => void
) => {
  const ws = new WebSocket(
    `wss://streaming.assemblyai.com/v3/realtime/ws?sample_rate=16000&token=${token}`
    // NO webhook_url — v3 pushes over WS only
  );

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.message_type === 'PartialTranscript') {
      onMessage({ text: data.text, isFinal: false });
    }
    if (data.message_type === 'FinalTranscript') {
      onMessage({ text: data.text, isFinal: true, raw: data });
    }
  };

  ws.onopen = () => {
    console.log('[v3] Connected');
    ws.send(JSON.stringify({ terminate_session: false }));
  };

  ws.onerror = (e) => console.error('[v3] WS error:', e);
  ws.onclose = (e) => console.log('[v3] WS closed:', e.code, e.reason);

  return {
    send: (buf: ArrayBuffer) => ws.readyState === WebSocket.OPEN && ws.send(buf),
    close: () => ws.close(),
    isReady: () => ws.readyState === WebSocket.OPEN,
  };
};

