-- Sessions Management Schema
DROP TABLE IF EXISTS session_participants CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  original_language VARCHAR(5) DEFAULT 'en',
  available_languages VARCHAR(5)[] DEFAULT ARRAY['en'],
  mode VARCHAR(20) DEFAULT 'classroom',
  status VARCHAR(20) DEFAULT 'scheduled',
  
  -- Timing
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  
  -- Payment
  payment_enabled BOOLEAN DEFAULT TRUE,
  payment_goal DECIMAL(10,2) DEFAULT 50.00,
  payment_currency VARCHAR(10) DEFAULT 'USDC',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  CONSTRAINT valid_mode CHECK (mode IN ('classroom', 'conference', 'podcast', 'livestream'))
);

-- Session participants (many-to-many)
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_language VARCHAR(5) DEFAULT 'en',
  has_contributed BOOLEAN DEFAULT FALSE,
  contribution_amount DECIMAL(10,2) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  
  UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX idx_sessions_creator ON sessions(creator_id);
CREATE INDEX idx_sessions_join_code ON sessions(join_code);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_participants_user ON session_participants(user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_timestamp
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- View for session details with creator info
CREATE OR REPLACE VIEW session_details AS
SELECT 
  s.id,
  s.title,
  s.description,
  s.join_code,
  s.original_language,
  s.available_languages,
  s.mode,
  s.status,
  s.start_time,
  s.end_time,
  s.payment_enabled,
  s.payment_goal,
  s.payment_currency,
  s.created_at,
  s.updated_at,
  u.id as creator_id,
  u.username as creator_username,
  u.display_name as creator_name,
  u.email as creator_email,
  (SELECT COUNT(*) FROM session_participants WHERE session_id = s.id) as participant_count
FROM sessions s
INNER JOIN users u ON s.creator_id = u.id;

COMMENT ON TABLE sessions IS 'Stores caption sessions created by users';
COMMENT ON TABLE session_participants IS 'Tracks which users joined which sessions';

