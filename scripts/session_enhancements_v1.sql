-- Session Management and User Role Enhancement Migration
-- Version 1.0
-- This script adds new columns to the sessions table to support enhanced session management

-- Add new columns to sessions table for enhanced functionality
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS accessibility_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recording_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}'::jsonb;

-- Add new session statuses (draft, paused, cancelled) to existing CHECK constraint
ALTER TABLE sessions 
DROP CONSTRAINT IF EXISTS sessions_status_check;

ALTER TABLE sessions 
ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'cancelled', 'ended'));

-- Create index for new status values
CREATE INDEX IF NOT EXISTS idx_sessions_status_enhanced ON sessions(status) 
WHERE status IN ('draft', 'paused', 'cancelled');

-- Add comment to document the enhancement
COMMENT ON COLUMN sessions.description IS 'Detailed description of the session content and objectives';
COMMENT ON COLUMN sessions.start_time IS 'Scheduled start time for the session';
COMMENT ON COLUMN sessions.end_time IS 'Actual or scheduled end time for the session';
COMMENT ON COLUMN sessions.max_participants IS 'Maximum number of participants allowed (NULL = unlimited)';
COMMENT ON COLUMN sessions.accessibility_settings IS 'JSON object containing accessibility preferences (high_contrast, font_size, etc.)';
COMMENT ON COLUMN sessions.recording_settings IS 'JSON object containing recording preferences (enabled, auto_record, etc.)';
COMMENT ON COLUMN sessions.notification_settings IS 'JSON object containing notification preferences (email, push, etc.)';

-- Update existing sessions to have default values for new columns
UPDATE sessions 
SET 
  description = COALESCE(description, ''),
  accessibility_settings = COALESCE(accessibility_settings, '{}'::jsonb),
  recording_settings = COALESCE(recording_settings, '{}'::jsonb),
  notification_settings = COALESCE(notification_settings, '{}'::jsonb)
WHERE description IS NULL 
   OR accessibility_settings IS NULL 
   OR recording_settings IS NULL 
   OR notification_settings IS NULL;
