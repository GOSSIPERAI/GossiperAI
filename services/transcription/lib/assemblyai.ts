// services/transcription/utils/index.ts

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
