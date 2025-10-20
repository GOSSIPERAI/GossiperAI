-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    selected_language TEXT DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id);