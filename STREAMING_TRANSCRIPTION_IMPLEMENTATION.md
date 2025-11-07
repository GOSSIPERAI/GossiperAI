# Streaming Transcription Implementation

## Overview

This implementation adds a **toggleable streaming transcription mode** to the existing Gossiper codebase, which already uses a pre-recorded (serverless) transcription flow. Both modes are fully compatible and can be switched via environment variable.

## Key Features

✅ **Dual Mode Support**: Streaming and pre-recorded modes coexist  
✅ **Environment Toggle**: `NEXT_PUBLIC_USE_STREAMING=true/false`  
✅ **Shared Components**: Uses existing `RealtimeTranscriptionDisplay` and Supabase Realtime  
✅ **Same Database Table**: Both modes save to `transcriptions` table  
✅ **Session-based**: Uses `session_id` to group transcripts  
✅ **Full Compatibility**: Pre-recorded flow remains 100% intact when streaming is disabled  

## Files Created/Modified

### New Files

1. **`lib/config.ts`** - Toggle configuration
2. **`lib/assembly.ts`** - AssemblyAI Realtime WebSocket connection
3. **`app/api/transcription/token/route.ts`** - Token generation endpoint
4. **`app/api/transcription/ingest/route.ts`** - Streaming webhook ingestion
5. **`hooks/use-streaming-transcription.ts`** - Unified transcription hook for audio input (handles WebSocket streaming or blob upload)
6. **`components/debug-toggle.tsx`** - Debug mode indicator
7. **`Database_Schema/streaming_transcription_support.sql`** - Database migration

### Modified Files

1. **`app/session/[id]/page.tsx`** - Updated to support both modes

### Existing Files (Used by Both Modes)

1. **`hooks/use-realtime-transcriptions.ts`** - Supabase Realtime subscription hook (displays transcripts)
2. **`components/realtime-transcription-display.tsx`** - UI component for displaying transcripts

## How It Works

### Streaming Mode (`USE_STREAMING=true`)

1. User clicks mic button → `startRecording()` called
2. Hook fetches token from `/api/transcription/token`
3. WebSocket connection established to AssemblyAI Realtime API
4. Audio chunks sent directly via WebSocket (250ms intervals)
5. AssemblyAI sends transcripts to `/api/transcription/ingest` webhook
6. Webhook saves to `transcriptions` table
7. Supabase Realtime broadcasts to clients via `postgres_changes`
8. `RealtimeTranscriptionDisplay` shows live updates

### Pre-Recorded Mode (`USE_STREAMING=false`)

1. User clicks mic button → `startRecording()` called
2. Audio recorded in 5-second chunks
3. On stop, audio blob uploaded to `/api/transcription/transcribe`
4. AssemblyAI processes audio asynchronously
5. Webhook callback saves to `transcriptions` table
6. Supabase Realtime broadcasts to clients
7. `RealtimeTranscriptionDisplay` shows updates

## Environment Variables

Add to `.env.local` and Vercel:

```bash
# Toggle between streaming and pre-recorded modes
NEXT_PUBLIC_USE_STREAMING=false   # Set to true for streaming mode

# Required for both modes
ASSEMBLYAI_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or your production URL
```

## Database Setup

Run the migration script:

```sql
-- Run: Database_Schema/streaming_transcription_support.sql
```

This ensures:
- `transcriptions` table has all required columns
- Proper indexes exist
- Realtime publication is enabled
- Anon users can insert (for webhook)

## Usage

### In Session Page

The session page automatically detects the mode based on `USE_STREAMING`:

- **Streaming**: Audio sent in real-time, low latency (~250ms chunks)
- **Pre-recorded**: Audio recorded, then uploaded when stopped

Both modes use the same UI components and display logic.

### Debug Toggle

Add `<DebugToggle />` to any page to see current mode:

```tsx
import { DebugToggle } from '@/components/debug-toggle';

// Shows badge indicating current mode
<DebugToggle />
```

## Architecture Notes

### Hook Architecture

The transcription system uses two complementary hooks that work together:

#### 1. `use-streaming-transcription.ts` (Audio Input Hook)
**Purpose**: Handles audio capture and transmission to AssemblyAI

**Responsibilities**:
- **Streaming Mode**: 
  - Fetches token from `/api/transcription/token`
  - Establishes WebSocket connection to AssemblyAI Realtime API
  - Sends audio chunks directly via WebSocket (250ms intervals)
  - Manages WebSocket lifecycle (connect, send, disconnect)
  
- **Pre-Recorded Mode**:
  - Handles audio blob upload to `/api/transcription/transcribe`
  - Manages upload state and error handling

**Returns**:
- `startStreaming()` / `uploadPrerecorded()` - Start transcription
- `sendAudio()` - Send audio chunks (streaming only)
- `stopStreaming()` - Stop transcription
- `isActive` - Whether transcription is currently active
- `error` - Any errors during transcription
- `isStreaming` - Current mode flag

**Note**: This hook does NOT handle displaying transcripts. It only handles the audio input side.

#### 2. `use-realtime-transcriptions.ts` (Display Hook)
**Purpose**: Handles receiving and displaying transcripts from Supabase

**Responsibilities**:
- Subscribes to Supabase Realtime `postgres_changes` on `transcriptions` table
- Fetches initial transcriptions for the session
- Updates local state when new transcripts arrive
- Handles reconnection logic and error states
- Provides transcript list to UI components

**Returns**:
- `transcriptions` - Array of all transcripts for the session
- `isConnected` - Supabase Realtime connection status
- `error` - Connection or fetch errors
- `clearTranscriptions()` - Clear the transcript list
- `refetch()` - Manually reload transcripts

**Note**: This hook works for BOTH streaming and pre-recorded modes since both save to the same table.

#### 3. `RealtimeTranscriptionDisplay.tsx` (UI Component)
**Purpose**: Renders the transcription UI

**Responsibilities**:
- Uses `use-realtime-transcriptions` to get transcript data
- Displays transcripts in a scrollable list
- Shows connection status, confidence scores, timestamps
- Provides controls (refresh, clear, language selector)
- Handles auto-scrolling to latest transcript

**Note**: This component is mode-agnostic - it works the same for both streaming and pre-recorded modes.

### How They Work Together

```
┌─────────────────────────────────────────────────────────┐
│ Session Page (app/session/[id]/page.tsx)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │ use-streaming-       │    │ use-realtime-        │  │
│  │ transcription        │    │ transcriptions       │  │
│  │                      │    │                      │  │
│  │ • Audio Input        │    │ • Supabase Realtime  │  │
│  │ • WebSocket/Upload   │    │ • Display Updates    │  │
│  └──────────────────────┘    └──────────────────────┘  │
│           │                            │                │
│           │                            │                │
│           ▼                            ▼                │
│  ┌──────────────────────────────────────────────┐     │
│  │ RealtimeTranscriptionDisplay                  │     │
│  │ • Renders UI                                  │     │
│  │ • Uses use-realtime-transcriptions            │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Flow**:
1. User clicks mic → `use-streaming-transcription` starts recording/streaming
2. Audio sent to AssemblyAI (via WebSocket or upload)
3. AssemblyAI processes → Webhook → Saves to Supabase `transcriptions` table
4. Supabase Realtime broadcasts change → `use-realtime-transcriptions` receives update
5. `RealtimeTranscriptionDisplay` re-renders with new transcript

### Why Both Modes Use Same Table?

- **Consistency**: Same data structure for both modes
- **Reusability**: `RealtimeTranscriptionDisplay` works for both
- **Simplicity**: No need for separate tables or components
- **History**: All transcripts in one place, searchable by `session_id`

### Streaming Transcript Identification

Streaming transcripts have `assembly_ai_job_id` starting with `streaming_`:
- Format: `streaming_{timestamp}_{random}`
- Pre-recorded: Uses AssemblyAI's actual job ID

### WebSocket vs Webhook

- **Streaming**: Direct WebSocket from browser → AssemblyAI → Webhook → Supabase
- **Pre-recorded**: Upload → AssemblyAI → Webhook → Supabase

Both end up in the same table and use Supabase Realtime for client updates.

## Testing

### Test Streaming Mode

1. Set `NEXT_PUBLIC_USE_STREAMING=true`
2. Start a session as lecturer
3. Click mic button
4. Speak - should see live transcripts appear
5. Check browser console for `[STREAMING]` logs

### Test Pre-Recorded Mode

1. Set `NEXT_PUBLIC_USE_STREAMING=false`
2. Start a session as lecturer
3. Click mic button
4. Record for a few seconds
5. Stop recording
6. Wait for transcription to process
7. Check browser console for `[PRERECORDED]` logs

## Troubleshooting

### Streaming Not Working

- Check `NEXT_PUBLIC_USE_STREAMING=true` is set
- Verify token endpoint returns valid token
- Check browser console for WebSocket errors
- Ensure webhook URL is accessible (not localhost in production)

### Pre-Recorded Not Working

- Check `NEXT_PUBLIC_USE_STREAMING=false` is set
- Verify `/api/transcription/transcribe` endpoint works
- Check AssemblyAI webhook is configured correctly
- Verify callback URL is accessible

### No Transcripts Appearing

- Check Supabase Realtime is enabled for `transcriptions` table
- Verify `useRealtimeTranscriptions` hook is subscribed
- Check database for inserted rows
- Verify `session_id` matches between insert and subscription

## Comments in Code

All new code includes comments distinguishing:
- `[STREAMING]` - Streaming mode specific
- `[PRERECORDED]` - Pre-recorded mode specific
- `=== STREAMING MODE ===` - Section markers

This makes it easy to identify which code path is active.

## Future Enhancements

- Add mode switching UI (toggle in settings)
- Support for multiple languages in streaming mode
- Better error handling and reconnection logic
- Analytics to track which mode is used more
- Hybrid mode (streaming with fallback to pre-recorded)

