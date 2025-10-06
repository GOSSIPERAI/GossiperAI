CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Indexes 
CREATE INDEX idx_sessions_code ON sessions(code); 
CREATE INDEX idx_sessions_created_by ON sessions(created_by);
-- Index for filtering/sorting by session recency
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at DESC);

-- Index for filtering sessions by status (active, ended, etc.)
CREATE INDEX idx_sessions_status ON sessions(status);

-- Index for filtering sessions by available languages (array lookup)
CREATE INDEX idx_sessions_available_languages 
ON sessions USING GIN (available_languages);



ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended'));
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS original_language TEXT DEFAULT 'en';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['en'];
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'classroom' CHECK (mode IN ('classroom', 'conference', 'podcast', 'livestream'));
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_goal INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
