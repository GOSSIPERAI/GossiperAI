# Transcription System Debugging Notes

## Current Status: Mock Flow Working with Database Issues

### ✅ What's Working:
1. **Mock transcription triggers successfully** - No more 500 errors
2. **Mock webhook simulation works** - Sends 5 mock transcriptions
3. **Student page receives data** - Shows transcriptions with confidence levels
4. **Fallback system works** - Falls back to in-memory storage when DB fails

### ❌ Issues Identified:

#### 1. **Database Issue: UUID Format Mismatch**
**Error:** `invalid input syntax for type uuid: "session_123"`
**Root Cause:** Supabase expects UUID format, but we're using string `"session_123"`
**Solution:** Use proper UUID format for session IDs

#### 2. **React Key Warning: Duplicate Keys**
**Error:** `Encountered two children with the same key, 'mock-1758672864602-g32hacr8v'`
**Root Cause:** All mock transcriptions use the same `transcript_id` (job ID)
**Solution:** Generate unique IDs for each transcription result

### 🔍 Current Flow Analysis:

\`\`\`
1. Lecturer triggers mock transcription ✅
   → Returns: {success: true, jobId: 'mock-1758672864602-g32hacr8v'}

2. Mock webhook simulation runs ✅
   → Sends 5 mock transcriptions to callback

3. Callback tries to write to Supabase ❌
   → Error: invalid input syntax for type uuid: "session_123"
   → Falls back to in-memory storage ✅

4. Student page polls for results ✅
   → Gets data from in-memory storage
   → Shows 5 transcriptions with confidence levels

5. React renders transcriptions ⚠️
   → Warning: duplicate keys (same job ID used for all)
\`\`\`

### 🛠️ Fixes Needed:

#### Fix 1: Use Proper UUID for Session ID
**Current:** `sessionId = "session_123"`
**Should be:** `sessionId = "550e8400-e29b-41d4-a716-446655440000"` (UUID format)

#### Fix 2: Generate Unique IDs for Each Transcription
**Current:** All use same `transcript_id`
**Should be:** Each transcription gets unique ID

#### Fix 3: Update Mock Data Structure
**Current:** Single job ID for all transcriptions
**Should be:** Unique ID per transcription result

### 📋 Next Steps:
1. Fix UUID format issue
2. Fix duplicate key issue
3. Test database writes
4. Document final working flow

### 🎯 For Live AssemblyAI Integration:
- Remove mock-specific session_id from payload
- Use real AssemblyAI job IDs
- Handle real webhook format
- Remove fallback to in-memory storage
