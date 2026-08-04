-- AI Tutor tables: chat conversations/messages, cached recording summaries.
-- Academy tables (modules, assignments, quizzes, leaderboard) come in a
-- separate migration once that phase starts.

CREATE TABLE ai_chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX idx_ai_chat_conversations_updated_at ON ai_chat_conversations(updated_at DESC);

CREATE TABLE ai_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    attachments_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);

CREATE TABLE ai_recording_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    summary_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_recording_summaries_session_id ON ai_recording_summaries(session_id);

-- Row Level Security: users can only see/create their own conversations and messages.
-- Service-role client (used server-side in the API routes) bypasses these,
-- same pattern as the transcription callback route already uses.

ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recording_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON ai_chat_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their own conversations"
    ON ai_chat_messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM ai_chat_conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view summaries for sessions they participated in"
    ON ai_recording_summaries FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE created_by = auth.uid()
            UNION
            SELECT session_id FROM sessions_participants WHERE user_id = auth.uid()
        )
    );
