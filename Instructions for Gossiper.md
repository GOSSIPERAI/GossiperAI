LLM Instruction Prompt

Instruction for the LLM:
You are tasked with generating a plug-and-play transcription service using AssemblyAI’s API.
This service must be stateless, serverless, and deployable directly on Vercel.
Do not generate a single Express.js or Nest.js server — instead, implement separate serverless function files under /api.
Do not include any database logic.

🧩 Required Modules

Auth & Config Module

Read AssemblyAI API key from environment variables (process.env.ASSEMBLYAI_API_KEY).

Provide a helper to attach correct headers for API requests.

Request Handler Module (/api/transcribe)

Accepts audio input (file URL or raw file stream).

Accepts a callbackUrl parameter provided by the client.

Submits a transcription job to AssemblyAI with that callback URL.

Responds immediately with a job ID.

Webhook Module (/api/webhook)

This is the callback endpoint AssemblyAI will call when transcription is complete.

Validate authenticity (optional API secret check).

Parse the transcription result payload.

Forward the result to the client-provided callbackUrl.

Return 200 OK to AssemblyAI.

Utilities Module

Reusable functions for making API calls to AssemblyAI.

Shared error-handling helper (always return structured JSON errors).

Logging with console.log for debugging.

🔑 Deployment Notes

The entire service must be deployable on Vercel without modification.

Each API route is a separate file under /api.

No app.listen(), no persistent state, no background workers.

No database — state must come only from the request payload.

Keep responses clean JSON.

✅ Self-Check Before Output

Use TypeScript instead of plain JavaScript, and ensure type safety for request/response payloads.

Before finalizing code, double-check that:

All endpoints are independent serverless functions.

Nothing relies on a running server or Express/Nest boilerplate.

No database connections or persistent state are included.

The code can be deployed directly to Vercel as-is.

And if there are any question pause and ask me before continuing





// In app/api/transcription/transcribe/route.ts
   const isMockMode = false // or set NODE_ENV=production
