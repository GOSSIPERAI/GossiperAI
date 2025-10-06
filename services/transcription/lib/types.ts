// types/index.ts

export interface TranscriptionRequest {
    audioUrl?: string;
    callbackUrl: string;
    languageCode?: string;
  }
  
  export interface TranscriptionResponse {
    success: boolean;
    jobId?: string;
    message?: string;
    error?: string;
  }
  
  export interface WebhookPayload {
    transcript_id: string;
    status: 'queued' | 'processing' | 'completed' | 'error';
    text?: string;
    confidence?: number;
    error?: string;
    audio_url?: string;
  }
  
  export interface ErrorResponse {
    success: false;
    error: string;
    message?: string;
  }
  
  export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
  }
  
  export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;