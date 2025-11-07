import { NextRequest, NextResponse } from 'next/server'
import { connectStream } from '@/lib/assembly-ai/assemblyai'
import { AssemblyAIService, ErrorHandler, Logger, Config } from '../../../../services/transcription/lib/assemblyai'
import { TranscriptionResponse } from '../../../../services/transcription/lib/types'

// 🚫 MOCK WEBHOOK SIMULATION DISABLED - Commented out for real AssemblyAI usage
// async function simulateAssemblyAIWebhook(callbackUrl: string, jobId: string, languageCode?: string) {
//   try {
//     console.log('🎭 [MOCK] Simulating AssemblyAI webhook:', { callbackUrl, jobId, languageCode })
//     
//     // Create mock transcription results
//     const mockTranscriptions = [
//       "Hello everyone, welcome to today's lecture on physics.",
//       "Today we'll be discussing Newton's laws of motion.",
//       "The first law states that an object at rest stays at rest.",
//       "The second law relates force, mass, and acceleration.",
//       "The third law states that for every action, there is an equal and opposite reaction."
//     ]
//     
//     // Extract session_id from callback URL for mock payload
//     const callbackUrlObj = new URL(callbackUrl)
//     const sessionId = callbackUrlObj.searchParams.get('sessionId') || 'default'
//     
//     // Send multiple mock results to simulate real-time transcription
//     for (let i = 0; i < mockTranscriptions.length; i++) {
//       // Generate unique ID for each transcription to avoid React key conflicts
//       const uniqueTranscriptionId = `${jobId}-${i + 1}`
//       
//       const mockPayload = {
//         transcript_id: uniqueTranscriptionId,
//         status: 'completed' as const,
//         text: mockTranscriptions[i],
//         confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
//         audio_url: `mock-audio-${jobId}.webm`,
//         // TODO: REVERT FOR LIVE DATA - Remove session_id from mock payload when using real AssemblyAI
//         // Real AssemblyAI webhooks don't include session_id, it comes from callback URL only
//         session_id: sessionId
//       }
//       
//       console.log(`🎭 [MOCK] Sending mock result ${i + 1}/${mockTranscriptions.length}:`, {
//         transcriptId: mockPayload.transcript_id,
//         text: mockPayload.text.substring(0, 50) + '...',
//         confidence: mockPayload.confidence
//       })
//       
//       // Send the mock webhook
//       const response = await fetch(callbackUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(mockPayload),
//       })
//       
//       if (response.ok) {
//         console.log(`🎭 [MOCK] Mock result ${i + 1} sent successfully`)
//       } else {
//         console.error(`🎭 [MOCK] Failed to send mock result ${i + 1}:`, response.status)
//       }
//       
//       // Wait 1 second between each mock result
//       if (i < mockTranscriptions.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 1000))
//       }
//     }
//     
//     console.log('🎭 [MOCK] All mock results sent successfully')
//     
//   } catch (error) {
//     console.error('🎭 [MOCK] Error simulating webhook:', error)
//   }
// }

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [TRANSCRIBE] ===== TRANSCRIPTION REQUEST RECEIVED =====')
    console.log('🎯 [TRANSCRIBE] Request received via App Router')
    console.log('🎯 [TRANSCRIBE] Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🎯 [TRANSCRIBE] URL:', request.url)
    console.log('🎯 [TRANSCRIBE] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_MOCK_TRANSCRIPTION: process.env.ENABLE_MOCK_TRANSCRIPTION,
      ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY ? 'SET' : 'NOT SET'
    })
    
    // Check if we're in mock mode (explicitly enabled in non-production only)
    // const isMockMode = process.env.ENABLE_MOCK_TRANSCRIPTION === 'true' && process.env.NODE_ENV !== 'production'
    const isMockMode = false // 🚫 DISABLED: Force real AssemblyAI usage
    console.log('🎯 [TRANSCRIBE] Mock mode enabled:', isMockMode)
    console.log('🎯 [TRANSCRIBE] ⚠️ Mock mode is DISABLED - using real AssemblyAI')

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const callbackUrl = formData.get('callbackUrl') as string
    const languageCode = formData.get('languageCode') as string
    const sessionId = formData.get('sessionId') as string

    console.log('🎯 [TRANSCRIBE] ===== FORM DATA ANALYSIS =====')
    console.log('🎯 [TRANSCRIBE] Form data received:', {
      hasAudioFile: !!audioFile,
      audioFileName: audioFile?.name,
      audioFileSize: audioFile?.size,
      audioFileType: audioFile?.type,
      callbackUrl,
      languageCode,
      sessionId
    })
    console.log('🎯 [TRANSCRIBE] Audio file details:', {
      name: audioFile?.name,
      size: audioFile?.size,
      type: audioFile?.type,
      lastModified: audioFile?.lastModified
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
    console.log('🎯 [TRANSCRIBE] ===== CALLBACK URL PREPARATION =====')
    console.log('🎯 [TRANSCRIBE] Original callback URL:', callbackUrl)
    console.log('🎯 [TRANSCRIBE] Callback URL with session:', callbackUrlWithSession)
    
    // 🚫 MOCK MODE DISABLED - Commented out mock functionality
    // if (isMockMode) {
    //   // Mock mode: simulate AssemblyAI response (skip file upload)
    //   console.log('🎯 [TRANSCRIBE] MOCK MODE: Simulating AssemblyAI response')
    //   
    //   const mockJobId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    //   
    //   // Simulate the webhook call after a short delay
    //   setTimeout(async () => {
    //     await simulateAssemblyAIWebhook(callbackUrlWithSession, mockJobId, languageCode)
    //   }, 2000) // 2 second delay to simulate processing
    //   
    //   return NextResponse.json({
    //     success: true,
    //     jobId: mockJobId,
    //     message: 'Mock transcription job submitted successfully',
    //   })
    // } else {
      // Real mode: upload to AssemblyAI
      console.log('🎯 [TRANSCRIBE] ===== REAL MODE: ASSEMBLYAI PROCESSING =====')
      console.log('🎯 [TRANSCRIBE] REAL MODE: Uploading to AssemblyAI')
      
      // Convert File to Buffer for AssemblyAI
      console.log('🎯 [TRANSCRIBE] Converting audio file to buffer...')
      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log('🎯 [TRANSCRIBE] Buffer created:', {
        bufferSize: buffer.length,
        originalSize: audioFile.size
      })

      // Use existing service to upload file
      console.log('🎯 [TRANSCRIBE] 🔗 Uploading file to AssemblyAI...')
      const audioUrl = await AssemblyAIService.uploadFile(
        buffer,
        audioFile.name
      )

      console.log('🎯 [TRANSCRIBE] ✅ File uploaded successfully to AssemblyAI')
      Logger.info('File uploaded and ready for transcription', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        audioUrl
      })
      
      console.log('🎯 [TRANSCRIBE] ===== SUBMITTING TO ASSEMBLYAI =====')
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

      console.log('🎯 [TRANSCRIBE] ✅ AssemblyAI job created successfully:', { 
        jobId: result.id,
        callbackUrl: callbackUrlWithSession,
        sessionId
      })
      console.log('🎯 [TRANSCRIBE] ===== TRANSCRIPTION JOB SUBMITTED =====')
      console.log('🎯 [TRANSCRIBE] ⏳ Waiting for AssemblyAI to process and call webhook...')

      return NextResponse.json({
        success: true,
        jobId: result.id,
        message: 'Transcription job submitted successfully',
        callbackUrl: callbackUrlWithSession
      })
    // } // 🚫 MOCK MODE DISABLED - End of commented mock block

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


// This is for AssemblyAi streaming
export const useTranscript = () => {
  const [text, setText] = useState('');
  const [partials, setPartials] = useState<string[]>([]);
  const wsRef = useRef<ReturnType<typeof connectStream> | null>(null);

  const start = async () => {
    const res = await fetch('/api/token');
    const { token } = await res.json();

    wsRef.current = connectStream(token, (msg) => {
      if (!msg.isFinal) setPartials((p) => [...p.slice(-4), msg.text]);
      else {
        setText((t) => t + ' ' + msg.text);
        setPartials([]);
      }
    });
  };

  const send = (chunk: ArrayBuffer) => wsRef.current?.send(chunk);
  const stop = () => wsRef.current?.close();

  return { text, partials, start, send, stop };
};
// In useTranscript.ts → start()
const { token } = await (await fetch('/api/token')).json();

ws = new WebSocket(
  `wss://streaming.assemblyai.com/v2/realtime/ws?sample_rate=16000` +
  `&token=${token}` +
  `&webhook_url=https://your-app.vercel.app/api/ingest`
);