// app/api/transcription/token/route.ts
// AssemblyAI Realtime Token Generation Endpoint
// Used only in streaming mode (USE_STREAMING=true)

import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for better performance

export async function GET() {
  try {
    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
    
    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: 'ASSEMBLYAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Request a temporary token from AssemblyAI Realtime API
    const res = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_in: 3600 }), // Token expires in 1 hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[STREAMING] Token generation failed:', res.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate token' },
        { status: res.status }
      );
    }

    const { token } = await res.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token received from AssemblyAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[STREAMING] Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

