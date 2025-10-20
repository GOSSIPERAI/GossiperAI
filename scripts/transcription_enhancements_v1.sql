-- Transcription Table Enhancements
-- Adds quality metrics, language support, and status tracking to transcriptions table

-- Add new columns to transcriptions table for enhanced features
ALTER TABLE transcriptions
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('queued', 'processing', 'completed', 'error')),
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS audio_duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS character_count INTEGER;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_status ON transcriptions(status);

-- Add index for language queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_language ON transcriptions(language_code);

-- Update existing rows to have default status
UPDATE transcriptions SET status = 'completed' WHERE status IS NULL;

-- Add comment to table
COMMENT ON TABLE transcriptions IS 'Stores transcription results from AssemblyAI with quality metrics and language support';
