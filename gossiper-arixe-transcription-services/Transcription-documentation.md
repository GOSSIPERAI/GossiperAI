📋 Documentation: Current Mock Flow Behavior
✅ What's Working:
Mock transcription is being triggered (no more 500 errors)
Student page is receiving mock data (showing confidence levels)
Data is being stored somewhere (likely in-memory fallback)
❌ What's Not Working:
Database writes are failing (no rows in Supabase)
System is falling back to in-memory storage
🔍 Debugging Questions:
I need to see the server console logs to understand what's happening. Can you:
Check your terminal/server console for these specific logs:
�� [TRANSCRIBE] MOCK MODE: Simulating AssemblyAI response
🎭 [MOCK] Simulating AssemblyAI webhook
📞 [CALLBACK] Request received via App Router
�� [CALLBACK] Transcription result stored in Supabase OR 📞 [CALLBACK] Supabase insert error:
Check browser console (student page) for:
    Any error messages
    The polling logs: �� [CLIENT] Fetching transcription results
Check browser console (lecturer page) for:
   Any error messages when triggering transcription
🎯 My Hypothesis:
The system is working like this:
Mock transcription triggers ✅
Mock webhook sends data to callback ✅
Callback tries to write to Supabase ❌ (fails silently)
Falls back to in-memory storage ✅
Student page polls and gets in-memory data ✅


## Mock mode toggle (enable/disable via env)

- To DISABLE mock mode (recommended for production):
  - Do not set `ENABLE_MOCK_TRANSCRIPTION` or set it to `false`.
- To ENABLE mock mode locally (development only):
  - Add `ENABLE_MOCK_TRANSCRIPTION=true` to your `.env.local` and ensure `NODE_ENV` is not `production`.
- The server route `app/api/transcription/transcribe/route.ts` checks:
  - `ENABLE_MOCK_TRANSCRIPTION === 'true'` AND `NODE_ENV !== 'production'`.
  - In production, mock mode is always off.

Env variables used by live transcription:
- `ASSEMBLYAI_API_KEY` (server) — required; read by `services/transcription/lib/config.ts`.
- `NEXT_PUBLIC_APP_URL` (client) — used to build callback URL in `app/session/[id]/page.tsx`.

Run the manual test in browser console:

fetch('/api/transcription/transcribe', {
  method: 'POST',
  body: (() => {
    const formData = new FormData();
    formData.append('audio', new Blob(['test'], {type: 'audio/webm'}), 'test.webm');
    formData.append('callbackUrl', `${window.location.origin}/api/transcription/callback`);
    formData.append('languageCode', 'en');
    formData.append('sessionId', 'session_123');
    return formData;
  })()
}).then(r => r.json()).then(console.log);


Updated:

fetch('/api/transcription/transcribe', {
  method: 'POST',
  body: (() => {
    const formData = new FormData();
    formData.append('audio', new Blob(['test'], {type: 'audio/webm'}), 'test.webm');
    formData.append('callbackUrl', `${window.location.origin}/api/transcription/callback`);
    formData.append('languageCode', 'en');
    formData.append('sessionId', '550e8400-e29b-41d4-a716-446655440000');
    return formData;
  })()
}).then(r => r.json()).then(console.log);




//Dev console logs below//
 GET /api/transcription/callback?sessionId=session_123 200 in 256ms
📥 [CALLBACK-GET] Request received via App Router
📥 [CALLBACK-GET] URL: http://localhost:3000/api/transcription/callback?sessionId=session_123
📥 [CALLBACK-GET] Session ID: session_123
📥 [CALLBACK-GET] Supabase query error: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "session_123"'
}
📥 [CALLBACK-GET] Database error, falling back to memory: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "session_123"'
}
📥 [CALLBACK-GET] Returning memory results: {
  sessionId: 'session_123',
  resultCount: 5,
  results: [
    {
      id: 'mock-1758672864602-g32hacr8v',
      text: "Hello everyone, welcome to today's lecture on phys...",
      timestamp: 2025-09-24T00:14:31.767Z
    },
    {
      id: 'mock-1758672864602-g32hacr8v',
      text: "Today we'll be discussing Newton's laws of motion....",
      timestamp: 2025-09-24T00:14:33.170Z
    },
    {
      id: 'mock-1758672864602-g32hacr8v',
      text: 'The first law states that an object at rest stays ...',
      timestamp: 2025-09-24T00:14:34.571Z
    },
    {
      id: 'mock-1758672864602-g32hacr8v',
      text: 'The second law relates force, mass, and accelerati...',
      timestamp: 2025-09-24T00:14:35.955Z
    },
    {
      id: 'mock-1758672864602-g32hacr8v',
      text: 'The third law states that for every action, there ...',
      timestamp: 2025-09-24T00:14:37.384Z
    }
  ]
}

//Lecturers page console logs below//

Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
{success: true, jobId: 'mock-1758672864602-g32hacr8v', message: 'Mock transcription job submitted successfully'}jobId: "mock-1758672864602-g32hacr8v"message: "Mock transcription job submitted successfully"success: true[[Prototype]]: Object
page.tsx:225 Transcription job submitted: mock-1758672918829-zzisvaaa6




Student page console logs below

Warning: Encountered two children with the same key, `mock-1758672864602-g32hacr8v`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
    at div
    at div
    at TranscriptionDisplay (webpack-internal:///(app-pages-browser)/./components/transcription-display.tsx:30:11)
    at div
    at div
    at div
    at div
    at AuthGuard (webpack-internal:///(app-pages-browser)/./components/auth-guard.tsx:16:11)
    at SessionPage (webpack-internal:///(app-pages-browser)/./app/session/[id]/page.tsx:74:78)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:14:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at Suspense
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at Suspense
    at WalletModalProvider (webpack-internal:///(app-pages-browser)/./node_modules/@solana/wallet-adapter-react-ui/lib/esm/WalletModalProvider.js:11:32)
    at WalletProviderBase (webpack-internal:///(app-pages-browser)/./node_modules/@solana/wallet-adapter-react/lib/esm/WalletProviderBase.js:14:31)
    at WalletProvider (webpack-internal:///(app-pages-browser)/./node_modules/@solana/wallet-adapter-react/lib/esm/WalletProvider.js:38:27)
    at ConnectionProvider (webpack-internal:///(app-pages-browser)/./node_modules/@solana/wallet-adapter-react/lib/esm/ConnectionProvider.js:11:31)
    at SolanaWalletProvider (webpack-internal:///(app-pages-browser)/./components/solana-wallet-provider.tsx:25:11)
    at AccessibilityProvider (webpack-internal:///(app-pages-browser)/./components/accessibility-provider.tsx:22:11)
    at body
    at html
    at RootLayout (Server)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at DevRootNotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/dev-root-not-found-boundary.js:33:11)
    at ReactDevOverlay (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/ReactDevOverlay.js:87:9)
    at HotReload (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/hot-reloader-client.js:321:11)
    at Router (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:207:11)
    at ErrorBoundaryHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:113:9)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at AppRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:585:13)
    at ServerRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:112:27)
    at Root (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:117:11)