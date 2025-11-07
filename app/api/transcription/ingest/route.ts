// app/api/transcription/ingest/route.ts
// AssemblyAI Realtime Streaming Webhook Endpoint
// Receives streaming transcripts from AssemblyAI and saves to Supabase
// Used only in streaming mode (USE_STREAMING=true)

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase-server';

export const runtime = 'edge'; // Use Edge runtime for better performance

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      console.error('[STREAMING] Missing sessionId in webhook');
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Validate sessionId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      console.error('[STREAMING] Invalid sessionId format:', sessionId);
      return NextResponse.json(
        { error: 'Invalid sessionId format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Only process transcript messages
    if (!body.message_type?.includes('Transcript')) {
      return NextResponse.json({ ok: true }); // Ignore non-transcript messages
    }

    const supabase = createServiceRoleSupabaseClient();
    if (!supabase) {
      console.error('[STREAMING] Failed to initialize Supabase client');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Extract transcript data
    const text = body.text || '';
    const isFinal = body.message_type === 'FinalTranscript';
    const words = body.words || null;
    const confidence = body.confidence || null;

    // Calculate text metrics
    const wordCount = text ? text.split(/\s+/).filter((w: string) => w.length > 0).length : 0;
    const characterCount = text ? text.length : 0;

    // Generate a unique job ID for this streaming transcript chunk
    // Use timestamp + random to ensure uniqueness
    const assemblyAiJobId = `streaming_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Insert into transcription table (same table as pre-recorded flow)
    const { error: insertError } = await supabase
      .from('transcriptions')
      .insert({
        session_id: sessionId,
        text: text,
        assembly_ai_job_id: assemblyAiJobId,
        status: isFinal ? 'completed' : 'processing',
        confidence: confidence,
        language_code: body.language_code || 'en',
        word_count: wordCount,
        character_count: characterCount,
        raw_words: words ? JSON.stringify(words) : null,
        // Mark as streaming transcript (we can add a column for this if needed)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[STREAMING] Database insertion failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to save transcript' },
        { status: 500 }
      );
    }

    console.log('[STREAMING] Transcript saved:', {
      sessionId,
      isFinal,
      textLength: text.length,
      wordCount,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[STREAMING] Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

