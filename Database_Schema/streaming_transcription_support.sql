-- Database Schema Support for Streaming Transcription
-- This migration ensures the transcriptions table supports both streaming and pre-recorded modes
-- The existing transcriptions table structure is compatible, but we add a comment for clarity

-- Ensure the transcriptions table exists (should already exist from previous migrations)
-- This is a safety check - won't create if already exists
CREATE TABLE IF NOT EXISTS transcriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    text TEXT,
    assembly_ai_job_id TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('queued', 'processing', 'completed', 'error')),
    confidence DECIMAL(3,2),
    language_code VARCHAR(10) DEFAULT 'en',
    error_message TEXT,
    processing_time_ms INTEGER,
    audio_duration_ms INTEGER,
    word_count INTEGER,
    character_count INTEGER,
    raw_words JSONB,
    audio_url TEXT,
    webhook_status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_transcriptions_session_id ON transcriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_assembly_ai_job_id ON transcriptions(assembly_ai_job_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions(status);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_transcriptions_language ON transcriptions(language_code);

-- Grant insert permissions for anon users (needed for streaming webhook)
-- Note: This allows the ingest endpoint to insert transcripts
GRANT INSERT ON transcriptions TO anon;

-- Ensure Supabase Realtime is enabled for the transcriptions table
-- This allows clients to receive real-time updates via postgres_changes
ALTER PUBLICATION supabase_realtime ADD TABLE transcriptions;

-- Add comment to table explaining dual-mode support
COMMENT ON TABLE transcriptions IS 'Stores transcription results from both AssemblyAI streaming (realtime) and pre-recorded modes. Streaming transcripts have assembly_ai_job_id starting with "streaming_".';

