import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { Config } from '../../../../services/transcription/lib/config'

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 [STREAM-TOKEN] Request received for temporary token')
    
    const { sessionId, languageCode } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Initialize AssemblyAI client using existing config
    const client = new AssemblyAI({
      apiKey: Config.getAssemblyAIApiKey(),
    })

    // Generate temporary token for real-time transcription using new Universal Streaming API
    const token = await client.streaming.createTemporaryToken({
      expires_in_seconds: 480, // 8 minutes
    })

    console.log('🎤 [STREAM-TOKEN] Generated temporary token for session:', sessionId)

    return NextResponse.json({
      success: true,
      token,
      sessionId,
      languageCode,
      expires_in: 480
    })

  } catch (error: any) {
    console.error('🎤 [STREAM-TOKEN] Failed to generate token:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate streaming token',
        details: error.message 
      },
      { status: 500 }
    )
  }
}