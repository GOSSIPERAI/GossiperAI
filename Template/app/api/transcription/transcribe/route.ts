import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAIService, ErrorHandler, Logger, Config } from '../../../../services/transcription/lib/assemblyai'
import { TranscriptionResponse } from '../../../../services/transcription/lib/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [TRANSCRIBE] Request received via App Router')
    console.log('🎯 [TRANSCRIBE] Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🎯 [TRANSCRIBE] URL:', request.url)

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

    // Use existing service to submit transcription job
    // Add session ID to callback URL so it gets passed through
    const callbackUrlWithSession = `${callbackUrl}?sessionId=${sessionId}`
    
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
