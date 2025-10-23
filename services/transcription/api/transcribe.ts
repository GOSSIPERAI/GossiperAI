// api/transcribe.ts

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

    // Submit transcription job with our existing callback route
    // AssemblyAI will call our callback route, which stores in database
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/transcription/callback?sessionId=${encodeURIComponent(callbackUrl)}`;
    
    const result = await AssemblyAIService.submitTranscriptionJob(
      audioUrl!,
      webhookUrl,
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
