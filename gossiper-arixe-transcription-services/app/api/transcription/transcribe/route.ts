import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAIService, ErrorHandler, Logger, Config } from '../../../../services/transcription/lib/assemblyai'
import { TranscriptionResponse } from '../../../../services/transcription/lib/types'

// Mock webhook simulation function
async function simulateAssemblyAIWebhook(callbackUrl: string, jobId: string, languageCode?: string) {
  try {
    console.log('🎭 [MOCK] Simulating AssemblyAI webhook:', { callbackUrl, jobId, languageCode })
    
    // Create mock transcription results
    const mockTranscriptions = [
      "Hello everyone, welcome to today's lecture on physics.",
      "Today we'll be discussing Newton's laws of motion.",
      "The first law states that an object at rest stays at rest.",
      "The second law relates force, mass, and acceleration.",
      "The third law states that for every action, there is an equal and opposite reaction."
    ]
    
    // Extract session_id from callback URL for mock payload
    const callbackUrlObj = new URL(callbackUrl)
    const sessionId = callbackUrlObj.searchParams.get('sessionId') || 'default'
    
    // Send multiple mock results to simulate real-time transcription
    for (let i = 0; i < mockTranscriptions.length; i++) {
      // Generate unique ID for each transcription to avoid React key conflicts
      const uniqueTranscriptionId = `${jobId}-${i + 1}`
      
      const mockPayload = {
        transcript_id: uniqueTranscriptionId,
        status: 'completed' as const,
        text: mockTranscriptions[i],
        confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
        audio_url: `mock-audio-${jobId}.webm`,
        // TODO: REVERT FOR LIVE DATA - Remove session_id from mock payload when using real AssemblyAI
        // Real AssemblyAI webhooks don't include session_id, it comes from callback URL only
        session_id: sessionId
      }
      
      console.log(`🎭 [MOCK] Sending mock result ${i + 1}/${mockTranscriptions.length}:`, {
        transcriptId: mockPayload.transcript_id,
        text: mockPayload.text.substring(0, 50) + '...',
        confidence: mockPayload.confidence
      })
      
      // Send the mock webhook
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockPayload),
      })
      
      if (response.ok) {
        console.log(`🎭 [MOCK] Mock result ${i + 1} sent successfully`)
      } else {
        console.error(`🎭 [MOCK] Failed to send mock result ${i + 1}:`, response.status)
      }
      
      // Wait 1 second between each mock result
      if (i < mockTranscriptions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('🎭 [MOCK] All mock results sent successfully')
    
  } catch (error) {
    console.error('🎭 [MOCK] Error simulating webhook:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [TRANSCRIBE] Request received via App Router')
    console.log('🎯 [TRANSCRIBE] Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🎯 [TRANSCRIBE] URL:', request.url)
    
    // Check if we're in mock mode (explicitly enabled in non-production only)
    const isMockMode = process.env.ENABLE_MOCK_TRANSCRIPTION === 'true' && process.env.NODE_ENV !== 'production'
    console.log('🎯 [TRANSCRIBE] Mock mode enabled:', isMockMode)

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const callbackUrl = formData.get('callbackUrl') as string
    const languageCode = formData.get('languageCode') as string
    const sessionId = formData.get('sessionId') as string

    console.log('🎯 [TRANSCRIBE] Form data received:', {
      hasAudioFile: !!audioFile,
      audioFileName: audioFile?.name,
      audioFileSize: audioFile?.size,
      callbackUrl,
      languageCode,
      sessionId
    })

    if (!audioFile) {
      return NextResponse.json(
        ErrorHandler.createErrorResponse('No audio file provided'),
        { status: 400 }
      )
    }

    if (!callbackUrl) {
      return NextResponse.json(
        ErrorHandler.createErrorResponse('callbackUrl is required'),
        { status: 400 }
      )
    }

    // Validate callback URL format
    try {
      new URL(callbackUrl)
    } catch {
      return NextResponse.json(
        ErrorHandler.createErrorResponse('Invalid callbackUrl format'),
        { status: 400 }
      )
    }

    // Add session ID to callback URL so it gets passed through
    const callbackUrlWithSession = `${callbackUrl}?sessionId=${sessionId}`
    
    if (isMockMode) {
      // Mock mode: simulate AssemblyAI response (skip file upload)
      console.log('🎯 [TRANSCRIBE] MOCK MODE: Simulating AssemblyAI response')
      
      const mockJobId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Simulate the webhook call after a short delay
      setTimeout(async () => {
        await simulateAssemblyAIWebhook(callbackUrlWithSession, mockJobId, languageCode)
      }, 2000) // 2 second delay to simulate processing
      
      return NextResponse.json({
        success: true,
        jobId: mockJobId,
        message: 'Mock transcription job submitted successfully',
      })
    } else {
      // Real mode: upload to AssemblyAI
      console.log('🎯 [TRANSCRIBE] REAL MODE: Uploading to AssemblyAI')
      
      // Convert File to Buffer for AssemblyAI
      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Use existing service to upload file
      const audioUrl = await AssemblyAIService.uploadFile(
        buffer,
        audioFile.name
      )

      Logger.info('File uploaded and ready for transcription', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        audioUrl
      })
      
      console.log('🎯 [TRANSCRIBE] Submitting to AssemblyAI:', {
        audioUrl,
        callbackUrl: callbackUrlWithSession,
        languageCode,
        sessionId
      })
      
      const result = await AssemblyAIService.submitTranscriptionJob(
        audioUrl,
        callbackUrlWithSession,
        languageCode
      )

      console.log('🎯 [TRANSCRIBE] AssemblyAI job created successfully:', { jobId: result.id })

      return NextResponse.json({
        success: true,
        jobId: result.id,
        message: 'Transcription job submitted successfully',
      })
    }

  } catch (error: any) {
    Logger.error('Transcription request failed', error)

    // Handle specific file size errors
    if (error.message?.includes('too large')) {
      return NextResponse.json(
        ErrorHandler.createErrorResponse(
          `File too large. Maximum size is ${Config.getMaxFileSizeMB()}MB`
        ),
        { status: 413 }
      )
    }

    const errorResponse = ErrorHandler.handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
