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
    //transcript_id: string;
    //status: 'queued' | 'processing' | 'completed' | 'error';
    //text?: string;
    //confidence?: number;
    //error?: string;
    //audio_url?: string;
   
      id?: string;
      transcript_id?: string;
      status: string; // was: 'queued' | 'processing' | 'completed' | 'error'
      text?: string;
      confidence?: number;
      error?: string;
      audio_url?: string;
    /*🔒 Optional: Stricter Enum + Fallback

If you want partial type safety but still allow unknown statuses without breaking, you can do this instead:

export interface WebhookPayload {
  id?: string;
  transcript_id?: string;
  status: 'queued' | 'processing' | 'completed' | 'error' | string; // allow unknown status strings
  text?: string;
  confidence?: number;
  error?: string;
  audio_url?: string;
}*/
    
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
