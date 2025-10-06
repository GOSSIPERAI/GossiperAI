import { NextRequest, NextResponse } from 'next/server'
import { WebhookPayload } from '../../../../services/transcription/lib/types'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// TODO: REVERT FOR LIVE DATA - Remove in-memory store when using real AssemblyAI
// In-memory store for transcription results (kept for fallback)
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
      textPreview: payload.text?.substring(0, 100) + (payload.text && payload.text.length > 100 ? '...' : ''),
      fullPayload: payload
    })

    // Handle completed transcription
    if (payload.status === 'completed' && payload.text) {
      try {
        // Store in Supabase database
        const supabase = createServerSupabaseClient()
        
        const { data, error } = await supabase
          .from('transcriptions')
          .insert({
            session_id: sessionId,
            text: payload.text,
            status: payload.status,
            assembly_ai_job_id: payload.transcript_id,
          })
          .select()

        if (error) {
          console.error('📞 [CALLBACK] Supabase insert error:', error)
          throw error
        }

        console.log('📞 [CALLBACK] Transcription result stored in Supabase:', {
          sessionId,
          transcriptionId: data[0]?.id,
          text: payload.text?.substring(0, 100) + '...',
          assemblyAiJobId: payload.transcript_id
        })

        // Fallback: Also store in memory for backward compatibility
        const transcriptionResult = {
          id: payload.transcript_id,
          text: payload.text,
          confidence: payload.confidence || 0.9,
          timestamp: new Date(),
          status: payload.status,
          audioUrl: payload.audio_url,
        }

        if (!transcriptionStore.has(sessionId)) {
          transcriptionStore.set(sessionId, [])
        }
        
        const sessionResults = transcriptionStore.get(sessionId) || []
        sessionResults.push(transcriptionResult)
        transcriptionStore.set(sessionId, sessionResults)

      } catch (dbError) {
        console.error('📞 [CALLBACK] Database error, falling back to memory storage:', dbError)
        
        // Fallback to in-memory storage
        const transcriptionResult = {
          id: payload.transcript_id,
          text: payload.text,
          confidence: payload.confidence || 0.9,
          timestamp: new Date(),
          status: payload.status,
          audioUrl: payload.audio_url,
        }

        if (!transcriptionStore.has(sessionId)) {
          transcriptionStore.set(sessionId, [])
        }
        
        const sessionResults = transcriptionStore.get(sessionId) || []
        sessionResults.push(transcriptionResult)
        transcriptionStore.set(sessionId, sessionResults)
      }
      
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
    
    try {
      // Try to get results from Supabase first
      const supabase = createServerSupabaseClient()
      
      const { data: dbResults, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('📥 [CALLBACK-GET] Supabase query error:', error)
        throw error
      }

      // Transform Supabase results to match expected format
      const results = dbResults.map(row => ({
        id: row.assembly_ai_job_id,
        text: row.text,
        confidence: 0.9, // Default confidence for database results
        timestamp: new Date(row.created_at),
        status: row.status,
        audioUrl: null, // Not stored in database
      }))

      console.log('📥 [CALLBACK-GET] Returning Supabase results:', {
        sessionId,
        resultCount: results.length,
        results: results.map(r => ({ id: r.id, text: r.text?.substring(0, 50) + '...', timestamp: r.timestamp }))
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length
      })

    } catch (dbError) {
      console.error('📥 [CALLBACK-GET] Database error, falling back to memory:', dbError)
      
      // Fallback to in-memory storage
      const results = transcriptionStore.get(sessionId) || []
      
      console.log('📥 [CALLBACK-GET] Returning memory results:', {
        sessionId,
        resultCount: results.length,
        results: results.map(r => ({ id: r.id, text: r.text?.substring(0, 50) + '...', timestamp: r.timestamp }))
      })
      
      return NextResponse.json({
        success: true,
        results,
        count: results.length
      })
    }
    
  } catch (error) {
    console.error('📥 [CALLBACK-GET] Error retrieving transcription results:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve results' 
    }, { status: 500 })
  }
}
