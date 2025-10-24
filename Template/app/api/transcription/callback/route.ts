import { NextRequest, NextResponse } from 'next/server'
import { WebhookPayload } from '../../../../services/transcription/lib/types'

// In-memory store for transcription results
// In production, you'd use a database or Redis
const transcriptionStore = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    console.log('📞 [CALLBACK] Request received via App Router')
    console.log('📞 [CALLBACK] Headers:', Object.fromEntries(request.headers.entries()))
    console.log('📞 [CALLBACK] URL:', request.url)
    
    // Extract session ID from the callback URL that AssemblyAI used
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'default'
    
    console.log('📞 [CALLBACK] Extracted session ID:', sessionId)
    
    const payload: WebhookPayload = await request.json()
    
    console.log('📞 [CALLBACK] Payload received:', {
      transcriptId: payload.transcript_id,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
      textLength: payload.text?.length || 0,
      fullPayload: payload
    })

    // Handle completed transcription
    if (payload.status === 'completed' && payload.text) {
      // For now, we'll store in memory and broadcast to all connected clients
      // In production, you'd use WebSockets or Server-Sent Events
      
      const transcriptionResult = {
        id: payload.transcript_id,
        text: payload.text,
        confidence: payload.confidence || 0.9,
        timestamp: new Date(),
        status: payload.status,
        audioUrl: payload.audio_url,
      }

      // Store the result using the extracted session ID
      if (!transcriptionStore.has(sessionId)) {
        transcriptionStore.set(sessionId, [])
      }
      
      const sessionResults = transcriptionStore.get(sessionId) || []
      sessionResults.push(transcriptionResult)
      transcriptionStore.set(sessionId, sessionResults)

      console.log('📞 [CALLBACK] Transcription result stored:', {
        sessionId,
        resultCount: sessionResults.length,
        transcriptionResult: {
          id: transcriptionResult.id,
          text: transcriptionResult.text?.substring(0, 100) + '...',
          confidence: transcriptionResult.confidence,
          timestamp: transcriptionResult.timestamp
        }
      })
      
      // TODO: Broadcast to connected clients via WebSocket or SSE
      // For now, we'll return success and the client can poll for results
      
    } else if (payload.status === 'error') {
      console.error('Transcription failed:', payload.error)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transcription callback processed successfully' 
    })
    
  } catch (error) {
    console.error('Error processing transcription callback:', error)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Callback received but processing failed' 
    })
  }
}

// GET endpoint to retrieve transcription results
export async function GET(request: NextRequest) {
  try {
    console.log('📥 [CALLBACK-GET] Request received via App Router')
    console.log('📥 [CALLBACK-GET] URL:', request.url)
    
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'default'
    
    console.log('📥 [CALLBACK-GET] Session ID:', sessionId)
    
    const results = transcriptionStore.get(sessionId) || []
    
    console.log('📥 [CALLBACK-GET] Returning results:', {
      sessionId,
      resultCount: results.length,
      results: results.map(r => ({ id: r.id, text: r.text?.substring(0, 50) + '...', timestamp: r.timestamp }))
    })
    
    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })
    
  } catch (error) {
    console.error('📥 [CALLBACK-GET] Error retrieving transcription results:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve results' 
    }, { status: 500 })
  }
}
