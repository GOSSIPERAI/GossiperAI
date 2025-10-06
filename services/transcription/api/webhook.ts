// api/webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { HttpClient, Logger, ErrorHandler } from '../lib/assemblyai';
import { WebhookPayload } from '../lib/types';

interface AssemblyAIWebhookPayload {
  transcript_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  confidence?: number;
  error?: string;
  audio_url?: string;
  webhook_status_code?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    Logger.warn('Non-POST request received on webhook endpoint');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    Logger.info('Webhook received from AssemblyAI');

    const payload: AssemblyAIWebhookPayload = req.body;

    // Validate required fields
    if (!payload.transcript_id || !payload.status) {
      Logger.error('Invalid webhook payload - missing required fields', payload);
      return res.status(400).json({ error: 'Invalid payload' });
    }

    Logger.info('Processing webhook payload', {
      transcriptId: payload.transcript_id,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
    });

    // Extract callback URL from headers or query params
    // AssemblyAI doesn't provide the original callback URL in the webhook,
    // but we can extract it from custom headers if needed
    const callbackUrl = req.headers['x-callback-url'] as string || 
                       req.query.callbackUrl as string;

    if (!callbackUrl) {
      Logger.error('No callback URL found in webhook request');
      // Still return 200 to AssemblyAI to acknowledge receipt
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook processed but no callback URL to forward to' 
      });
    }

    // Prepare the payload to forward to client
    const forwardPayload: WebhookPayload = {
      transcript_id: payload.transcript_id,
      status: payload.status,
      text: payload.text,
      confidence: payload.confidence,
      error: payload.error,
      audio_url: payload.audio_url,
    };

    // Forward to client's callback URL
    const forwardSuccess = await HttpClient.forwardToCallback(
      callbackUrl,
      forwardPayload
    );

    if (!forwardSuccess) {
      Logger.warn('Failed to forward webhook to client callback URL', {
        callbackUrl,
        transcriptId: payload.transcript_id,
      });
      // Still return 200 to AssemblyAI - we received the webhook successfully
    }

    // Always return 200 to AssemblyAI to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      transcriptId: payload.transcript_id,
      forwardedToCallback: forwardSuccess,
    });

  } catch (error) {
    Logger.error('Error processing webhook', error);
    
    // Always return 200 to AssemblyAI to acknowledge receipt
    // Log the error but don't fail the webhook
    return res.status(200).json({
      success: true,
      message: 'Webhook acknowledged but processing encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Alternative implementation with callback URL stored in custom header approach
export async function handleWebhookWithCustomCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: AssemblyAIWebhookPayload = req.body;
    const callbackUrl = req.headers['x-original-callback'] as string;

    if (!callbackUrl) {
      Logger.info('Webhook received but no callback URL in headers');
      return res.status(200).json({ success: true, message: 'No callback to forward to' });
    }

    Logger.info('Webhook with custom callback header', {
      transcriptId: payload.transcript_id,
      status: payload.status,
      callbackUrl,
    });

    // Forward the complete AssemblyAI payload to client
    await HttpClient.forwardToCallback(callbackUrl, payload);

    return res.status(200).json({
      success: true,
      message: 'Webhook processed and forwarded',
    });

  } catch (error) {
    Logger.error('Error in webhook with custom callback', error);
    return res.status(200).json({
      success: true,
      message: 'Webhook acknowledged',
    });
  }
}