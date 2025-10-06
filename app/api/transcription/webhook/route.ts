import { NextRequest, NextResponse } from 'next/server'
import { HttpClient, Logger, ErrorHandler } from '../../../../services/transcription/lib/assemblyai'
import { WebhookPayload } from '../../../../services/transcription/lib/types'

interface AssemblyAIWebhookPayload {
  transcript_id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  confidence?: number
  error?: string
  audio_url?: string
  webhook_status_code?: number
}

export async function POST(request: NextRequest) {
  try {
    Logger.info('Webhook received from AssemblyAI via App Router')

    const payload: AssemblyAIWebhookPayload = await request.json()

    // Validate required fields
    if (!payload.transcript_id || !payload.status) {
      Logger.error('Invalid webhook payload - missing required fields', payload)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    Logger.info('Processing webhook payload', {
      transcriptId: payload.transcript_id,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
    })

    // Extract callback URL from headers or query params
    const callbackUrl = request.headers.get('x-callback-url') || 
                       request.nextUrl.searchParams.get('callbackUrl')

    if (!callbackUrl) {
      Logger.error('No callback URL found in webhook request')
      // Still return 200 to AssemblyAI to acknowledge receipt
      return NextResponse.json({
        success: true,
        message: 'Webhook processed but no callback URL to forward to'
      })
    }

    // Prepare the payload to forward to client using existing service
    const forwardPayload: WebhookPayload = {
      transcript_id: payload.transcript_id,
      status: payload.status,
      text: payload.text,
      confidence: payload.confidence,
      error: payload.error,
      audio_url: payload.audio_url,
    }

    // Use existing service to forward to client's callback URL
    const forwardSuccess = await HttpClient.forwardToCallback(
      callbackUrl,
      forwardPayload
    )

    if (!forwardSuccess) {
      Logger.warn('Failed to forward webhook to client callback URL', {
        callbackUrl,
        transcriptId: payload.transcript_id,
      })
      // Still return 200 to AssemblyAI - we received the webhook successfully
    }

    // Always return 200 to AssemblyAI to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      transcriptId: payload.transcript_id,
      forwardedToCallback: forwardSuccess,
    })

  } catch (error) {
    Logger.error('Error processing webhook', error)
    
    // Always return 200 to AssemblyAI to acknowledge receipt
    // Log the error but don't fail the webhook
    return NextResponse.json({
      success: true,
      message: 'Webhook acknowledged but processing encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
