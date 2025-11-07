NOTE:This is an example Template for adding assemblyai streaming transcription using client websocket compartible for browsers to a codebase alrready using the serverless prerecorded transcription approach with supabase realtime, everything here is subject to change or customization to suite your use case or codebasee.The file paths may need adjustments.

1. lib/config.ts
// Toggle: true = streaming, false = prerecorded
export const USE_STREAMING = process.env.NEXT_PUBLIC_USE_STREAMING === 'true';

2. lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type TranscriptRow = {
  id: number;
  session_id: string;
  text: string;
  is_final: boolean;
  created_at: string;
};

3. lib/assembly.ts

export const connectStream = (
  token: string,
  onMessage: (msg: { text: string; isFinal: boolean }) => void
) => {
  const ws = new WebSocket(
    `wss://streaming.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}` +
    `&webhook_url=https://${process.env.VERCEL_URL}/api/ingest`
  );

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.message_type?.includes('Transcript')) {
      onMessage({
        text: data.text,
        isFinal: data.message_type === 'FinalTranscript',
      });
    }
  };

  ws.onopen = () => ws.send(JSON.stringify({ terminate_session: false }));

  return {
    send: (buf: ArrayBuffer) => ws.readyState === WebSocket.OPEN && ws.send(buf),
    close: () => ws.close(),
  };
};

4. app/api/token/route.ts (Edge)

import { NextResponse } from 'next/server';

export const GET = async () => {
  const res = await fetch('https://api.assemblyai.com/v2/realtime/token', {
    method: 'POST',
    headers: {
      Authorization: process.env.ASSEMBLYAI_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expires_in: 3600 }),
  });
  const { token } = await res.json();
  return NextResponse.json({ token });
};

5. app/api/ingest/route.ts (Edge → Supabase)

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const body = await req.json();

  if (body.message_type?.includes('Transcript')) {
    const sessionId = body.audio_start_ms?.toString() || crypto.randomUUID();

    await supabase.from('transcripts').insert({
      session_id: sessionId,
      text: body.text,
      is_final: body.message_type === 'FinalTranscript',
      words: body.words,
    });
  }

  return new NextResponse('ok');
};

6. hooks\use-realtime-transcriptions.ts (Unified)

'use client';
import { USE_STREAMING } from '@/lib/config';
import { connectStream } from '@/lib/assembly';
import { useState, useRef } from 'react';

export const useTranscription = (sessionId: string) => {
  const [text, setText] = useState('');
  const [partial, setPartial] = useState('');
  const ws = useRef<ReturnType<typeof connectStream> | null>(null);

  // === STREAMING ===
  const startStreaming = async () => {
    const { token } = await (await fetch('/api/token')).json();
    ws.current = connectStream(token, (msg) => {
      if (msg.isFinal) {
        setText((t) => t + ' ' + msg.text);
        setPartial('');
      } else {
        setPartial(msg.text);
      }
    });
  };

  const send = (buf: ArrayBuffer) => ws.current?.send(buf);
  const stopStreaming = () => ws.current?.close();

  // === PRERECORDED (fallback) ===
  const startPrerecorded = async (blob: Blob) => {
    const form = new FormData();
    form.append('file', blob, `session-${sessionId}.webm`);
    const res = await fetch('/api/prerecorded/upload', {
      method: 'POST',
      body: form,
    });
    const { transcript_id } = await res.json();

    const poll = setInterval(async () => {
      const t = await fetch(`/api/prerecorded/transcript/${transcript_id}`).then(r => r.json());
      if (t.status === 'completed') {
        setText(t.text);
        clearInterval(poll);
      }
    }, 1000);
  };

  return {
    fullText: USE_STREAMING ? text + ' ' + partial : text,
    isStreaming: USE_STREAMING,
    start: USE_STREAMING ? startStreaming : () => {},
    send: USE_STREAMING ? send : () => {},
    stop: USE_STREAMING ? stopStreaming : () => {},
    uploadPrerecorded: USE_STREAMING ? () => {} : startPrerecorded,
  };
};

7. components/MicButton.tsx

'use client';
import { useTranscription } from '@/hooks/useTranscription';
import { useRef, useState } from 'react';

export const MicButton = ({ sessionId }: { sessionId: string }) => {
  const { isStreaming, start, send, stop, uploadPrerecorded } = useTranscription(sessionId);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const toggle = async () => {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      if (!isStreaming) {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        uploadPrerecorded(blob);
      } else stop();
      chunks.current = [];
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

    if (isStreaming) {
      rec.ondataavailable = (e) => e.data.size && send(e.data);
      rec.start(250);
      await start();
    } else {
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.start();
    }

    recorder.current = rec;
    setRecording(true);
  };

  return (
    <button
      onClick={toggle}
      className={`w-20 h-20 rounded-full text-white text-4xl ${recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
    >
      {recording ? 'Stop' : 'Mic'}
    </button>
  );
};

8. components/TranscriptDisplay.tsx (Live via Supabase Realtime)

'use client';
import { supabase, TranscriptRow } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { USE_STREAMING } from '@/lib/config';

export const TranscriptDisplay = ({ sessionId }: { sessionId: string }) => {
  const [lines, setLines] = useState<TranscriptRow[]>([]);

  useEffect(() => {
    // Initial load
    supabase
      .from('transcripts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setLines(data || []));

    // Realtime
    const channel = supabase
      .channel('transcripts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcripts',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setLines((l) => [...l, payload.new as TranscriptRow]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const finalText = lines
    .filter((l) => l.is_final)
    .map((l) => l.text)
    .join(' ');

  const partial = lines
    .filter((l) => !l.is_final)
    .pop()?.text || '';

  return (
    <div className="bg-gray-50 rounded-xl p-6 min-h-48">
      <p className="text-xl leading-relaxed">
        {finalText}{' '}
        <span className="text-gray-500 animate-pulse">{partial}</span>
      </p>
      {USE_STREAMING && <small className="text-xs text-green-600">Streaming</small>}
    </div>
  );
};

9. app/page.tsx

'use client';
import { MicButton } from '@/components/MicButton';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { DebugToggle } from '@/components/DebugToggle';
import { useId } from 'react';

export default function Home() {
  const sessionId = useId(); // unique per tab

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Transcription</h1>
        <DebugToggle />
      </div>
      <MicButton sessionId={sessionId} />
      <TranscriptDisplay sessionId={sessionId} />
    </main>
  );
}

11. Supabase SQL (run once)

create table transcripts (
  id          bigint generated by default as identity primary key,
  session_id  text,
  text        text,
  is_final    boolean,
  words       jsonb,
  created_at  timestamptz default now()
);

-- Allow anon insert
grant insert on transcripts to anon;

-- Realtime
alter publication supabase_realtime add table transcripts;

Toggle Control

# Vercel Dashboard → Environment Variables
NEXT_PUBLIC_USE_STREAMING=true   → streaming
NEXT_PUBLIC_USE_STREAMING=false  → prerecorded (safe fallback)

Note: Use proper commenting to distinguish between the two systems where posible.
- Refer to this document as often as needed.