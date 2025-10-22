this is the actual flow below:                                                                                                                                                         New Transcription Flow (Realtime, no polling)

Client (Session Page)
  ↓ renders
RealtimeTranscriptionDisplay (uses useRealtimeTranscriptions)
  ↓ subscribes via Supabase Realtime
Channel: postgres_changes on table "transcriptions" filtered by session_id

Starting a transcription job
  ↓ calls
/app/api/transcription/transcribe (App Router)
  ↓ uses
services/transcription/lib/assemblyai.ts to start job (real or simulated)
  ↓ AssemblyAI processes audio and POSTs webhook payload

Server receives transcription
  ↓ endpoint
/app/api/transcription/callback (App Router)
  ↓ validates payload and inserts row into
Supabase table: transcriptions (includes session_id, text, confidence, metrics)
  ↓ triggers
Supabase Realtime postgress broadcast to subscribed clients

Client update (no polling)
  ↓ useRealtimeTranscriptions receives change payload
  ↓ updates local state and UI in RealtimeTranscriptionDisplay

Notes
- The old polling hook (useTranscription) and component (TranscriptionDisplay) are deprecated.
- All live updates now flow from DB inserts → Supabase Realtime → client subscription.                                                               Below is what starts the transcription job:  /app/api/transcription/transcribe (App Router)                                                                                                                                    import { NextRequest, NextResponse } from 'next/server' 
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
       Below is the callback /app/api/transcription/callback (App Router)                                                                              import { type NextRequest, NextResponse } from "next/server" 
import type { WebhookPayload } from "../../../../services/transcription/lib/types"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { TranscriptionValidator } from "@/lib/validation/transcription-validation"

// TODO: REVERT FOR LIVE DATA - Remove in-memory store when using real AssemblyAI
// In-memory store for transcription results (kept for fallback)
const transcriptionStore = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    console.log("📞 [CALLBACK] Request received via App Router")
    console.log("📞 [CALLBACK] Headers:", Object.fromEntries(request.headers.entries()))
    console.log("📞 [CALLBACK] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"

    console.log("📞 [CALLBACK] Extracted session ID:", sessionId)

    const payload: WebhookPayload = await request.json()

    console.log("📞 [CALLBACK] Payload received:", {
      transcriptId: payload.transcript_id,
      status: payload.status,
      hasText: !!payload.text,
      confidence: payload.confidence,
      textLength: payload.text?.length || 0,
      textPreview: payload.text?.substring(0, 100) + (payload.text && payload.text.length > 100 ? "..." : ""),
    })

    if (payload.status === "completed" && payload.text) {
      // Validate text quality
      const textValidation = TranscriptionValidator.validateTextQuality(payload.text)
      if (textValidation.warnings.length > 0) {
        console.warn("📞 [CALLBACK] Text quality warnings:", textValidation.warnings)
      }

      // Calculate text metrics
      const { wordCount, characterCount } = TranscriptionValidator.calculateTextMetrics(payload.text)

      try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
          .from("transcriptions")
          .insert({
            session_id: sessionId,
            text: payload.text,
            status: payload.status,
            assembly_ai_job_id: payload.transcript_id,
            confidence: payload.confidence || null,
            language_code: "en", // Default to English, can be enhanced later
            word_count: wordCount,
            character_count: characterCount,
          })
          .select()

        if (error) {
          console.error("📞 [CALLBACK] Supabase insert error:", error)
          throw error
        }

        console.log("📞 [CALLBACK] Transcription stored in Supabase with metrics:", {
          sessionId,
          transcriptionId: data[0]?.id,
          wordCount,
          characterCount,
          confidence: payload.confidence,
          textPreview: payload.text?.substring(0, 100) + "...",
        })

        // No need for manual WebSocket or polling - clients subscribed to this session will receive the update instantly
      } catch (dbError) {
        console.error("📞 [CALLBACK] Database error:", dbError)
        // Return success to AssemblyAI even if DB fails to avoid retries
      }
    } else if (payload.status === "error") {
      console.error("📞 [CALLBACK] Transcription failed:", payload.error)

      try {
        const supabase = createServerSupabaseClient()
        await supabase.from("transcriptions").insert({
          session_id: sessionId,
          text: null,
          status: "error",
          assembly_ai_job_id: payload.transcript_id,
          error_message: payload.error || "Unknown error",
        })
      } catch (dbError) {
        console.error("📞 [CALLBACK] Failed to store error status:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transcription callback processed successfully",
    })
  } catch (error) {
    console.error("📞 [CALLBACK] Error processing transcription callback:", error)

    return NextResponse.json({
      success: true,
      message: "Callback received but processing failed",
    })
  }
}

// GET endpoint to retrieve transcription results
export async function GET(request: NextRequest) {
  try {
    console.log("📥 [CALLBACK-GET] Request received via App Router")
    console.log("📥 [CALLBACK-GET] URL:", request.url)

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"

    console.log("📥 [CALLBACK-GET] Session ID:", sessionId)

    try {
      // Try to get results from Supabase first
      const supabase = createServerSupabaseClient()

      const { data: dbResults, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("📥 [CALLBACK-GET] Supabase query error:", error)
        throw error
      }

      // Transform Supabase results to match expected format
      const results = dbResults.map((row) => ({
        id: row.assembly_ai_job_id,
        text: row.text,
        confidence: row.confidence || 0.9, // Default confidence for database results
        timestamp: new Date(row.created_at),
        status: row.status,
        audioUrl: null, // Not stored in database
      }))

      console.log("📥 [CALLBACK-GET] Returning Supabase results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    } catch (dbError) {
      console.error("📥 [CALLBACK-GET] Database error, falling back to memory:", dbError)

      // Fallback to in-memory storage
      const results = transcriptionStore.get(sessionId) || []

      console.log("📥 [CALLBACK-GET] Returning memory results:", {
        sessionId,
        resultCount: results.length,
        results: results.map((r) => ({ id: r.id, text: r.text?.substring(0, 50) + "...", timestamp: r.timestamp })),
      })

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
      })
    }
  } catch (error) {
    console.error("📥 [CALLBACK-GET] Error retrieving transcription results:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve results",
      },
      { status: 500 },
    )
  }
}
 Below is transcription table schema:                                                                                                                                        CREATE TABLE transcriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    text TEXT,
    assembly_ai_job_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_transcriptions_session_id ON transcriptions(session_id); 
CREATE INDEX idx_transcriptions_assembly_ai_job_id ON transcriptions(assembly_ai_job_id);                                     Added some enhancements too:                                                                                                                                              -- Transcription Table Enhancements
-- Adds quality metrics, language support, and status tracking to transcriptions table

-- Add new columns to transcriptions table for enhanced features
ALTER TABLE transcriptions
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('queued', 'processing', 'completed', 'error')),
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS audio_duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS character_count INTEGER;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions(status);

-- Add index for language queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_language ON transcriptions(language_code);

-- Update existing rows to have default status
UPDATE transcriptions SET status = 'completed' WHERE status IS NULL;

-- Add comment to table
COMMENT ON TABLE transcriptions IS 'Stores transcription results from AssemblyAI with quality metrics and language support';
Below is assemblyai related code:                                                                                                                                      // services/transcription/utils/index.ts

import { AssemblyAI } from 'assemblyai';
import Config from './config';
import { ApiResponse, ErrorResponse, SuccessResponse } from './types';

export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }
}

export class AssemblyAIService {
  private static client: AssemblyAI;

  static getClient(): AssemblyAI {
    if (!this.client) {
      this.client = new AssemblyAI({
        apiKey: Config.getAssemblyAIApiKey(),
      });
    }
    return this.client;
  }

  static async submitTranscriptionJob(
    audioUrl: string,
    callbackUrl: string,
    languageCode?: string
  ): Promise<{ id: string }> {
    const client = this.getClient();
    
    const config: any = {
      audio_url: audioUrl,
      webhook_url: callbackUrl,
    };

    if (languageCode) {
      config.language_code = languageCode;
    }

    console.log('🎤 [ASSEMBLYAI] Submitting transcription job with config:', {
      audioUrl,
      callbackUrl,
      languageCode,
      fullConfig: config
    });
    
    const transcript = await client.transcripts.create(config);
    
    console.log('🎤 [ASSEMBLYAI] Transcription job submitted successfully:', { 
      jobId: transcript.id,
      status: transcript.status,
      webhookUrl: transcript.webhook_url
    });
    
    return { id: transcript.id };
  }

  static async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const client = this.getClient();
    
    Logger.info('Uploading file to AssemblyAI', { fileName, size: fileBuffer.length });
    
    const uploadUrl = await client.files.upload(fileBuffer);
    
    Logger.info('File uploaded successfully', { uploadUrl });
    
    return uploadUrl;
  }
}

export class ErrorHandler {
  static createErrorResponse(message: string, error?: any): ErrorResponse {
    Logger.error(message, error);
    return {
      success: false,
      error: message,
      message: error?.message || 'An unexpected error occurred',
    };
  }

  static createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static handleApiError(error: any): ErrorResponse {
    if (error.name === 'ValidationError') {
      return this.createErrorResponse('Invalid request data', error);
    }
    
    if (error.status >= 400 && error.status < 500) {
      return this.createErrorResponse('Client error', error);
    }
    
    if (error.status >= 500) {
      return this.createErrorResponse('Server error', error);
    }
    
    return this.createErrorResponse('Unknown error', error);
  }
}

export { Config };
and still another assemblyai code:                                                                                                                               // api/transcribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { AssemblyAIService, ErrorHandler, Logger, Config } from '../lib/assemblyai';
import { TranscriptionResponse } from '../lib/types';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Config.getMaxFileSizeBytes(),
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Helper to promisify multer
const uploadMiddleware = upload.single('audio');
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(
  req: NextApiRequest & { file?: any },
  res: NextApiResponse<TranscriptionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json(
      ErrorHandler.createErrorResponse('Method not allowed')
    );
  }

  try {
    Logger.info('Transcription request received');

    // Parse multipart/form-data if present
    let audioUrl: string | undefined;
    let callbackUrl: string;
    let languageCode: string | undefined;

    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle file upload
      await runMiddleware(req, res, uploadMiddleware);
      
      if (!req.file) {
        return res.status(400).json(
          ErrorHandler.createErrorResponse('No audio file provided')
        );
      }

      if (!req.body.callbackUrl) {
        return res.status(400).json(
          ErrorHandler.createErrorResponse('callbackUrl is required')
        );
      }

      // Upload file to AssemblyAI
      audioUrl = await AssemblyAIService.uploadFile(
        req.file.buffer,
        req.file.originalname
      );
      callbackUrl = req.body.callbackUrl;
      languageCode = req.body.languageCode;

      Logger.info('File uploaded and ready for transcription', { 
        fileName: req.file.originalname,
        fileSize: req.file.size,
        audioUrl 
      });
    } else {
      // Handle JSON request with audio URL
      const { audioUrl: providedUrl, callbackUrl: providedCallback, languageCode: providedLang } = req.body;
      
      if (!providedUrl) {
        return res.status(400).json(
          ErrorHandler.createErrorResponse('audioUrl is required when not uploading a file')
        );
      }

      if (!providedCallback) {
        return res.status(400).json(
          ErrorHandler.createErrorResponse('callbackUrl is required')
        );
      }

      audioUrl = providedUrl;
      callbackUrl = providedCallback;
      languageCode = providedLang;

      Logger.info('URL-based transcription request', { audioUrl });
    }

    // Validate callback URL format
    try {
      new URL(callbackUrl);
    } catch {
      return res.status(400).json(
        ErrorHandler.createErrorResponse('Invalid callbackUrl format')
      );
    }

    // Submit transcription job
    const result = await AssemblyAIService.submitTranscriptionJob(
      audioUrl!,
      callbackUrl,
      languageCode
    );

    Logger.info('Transcription job created successfully', { jobId: result.id });

    return res.status(200).json({
      success: true,
      jobId: result.id,
      message: 'Transcription job submitted successfully',
    });

  } catch (error: any) {
    Logger.error('Transcription request failed', error);

    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json(
        ErrorHandler.createErrorResponse(
          `File too large. Maximum size is ${Config.getMaxFileSizeMB()}MB`
        )
      );
    }

    if (error.message === 'Only audio files are allowed') {
      return res.status(400).json(
        ErrorHandler.createErrorResponse('Only audio files are allowed')
      );
    }

    const errorResponse = ErrorHandler.handleApiError(error);
    return res.status(500).json(errorResponse);
  }
}
                                                   