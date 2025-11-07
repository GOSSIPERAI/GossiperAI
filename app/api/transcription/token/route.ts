// app/api/transcription/token/route.ts
// AssemblyAI Realtime Token Generation Endpoint
// Used only in streaming mode (USE_STREAMING=true)

import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function GET() {
  try {
    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
    
    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: 'ASSEMBLYAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Create AssemblyAI client and generate temporary token using SDK
    const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
    
    // expires_in_seconds must be between 1 and 600 seconds
    const expiresInSeconds = 600; // Token expires in 10 minutes (maximum allowed)
    
    const token = await client.streaming.createTemporaryToken({ 
      expires_in_seconds: expiresInSeconds 
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token received from AssemblyAI' },
        { status: 500 }
      );
    }

    console.log('[STREAMING] Token generated successfully');
    return NextResponse.json({ token });
  } catch (error) {
    console.error('[STREAMING] Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

