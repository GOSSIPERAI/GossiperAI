Session Page (App Router)
    ↓ calls
/app/api/transcription/transcribe (App Router)
    ↓ imports and uses
services/transcription/lib/assemblyai.ts (Service Functions)
    ↓ calls
AssemblyAI API
    ↓ sends results to
/app/api/transcription/webhook (App Router)
    ↓ imports and uses
services/transcription/lib/assemblyai.ts (HttpClient)
    ↓ forwards to
Your Callback URL.
