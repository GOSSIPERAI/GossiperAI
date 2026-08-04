-- Web3 Academy: modules, lessons, assignments, quizzes, resources, leaderboard.
-- Follows the same structure/index/RLS conventions as 001_wallet_auth.sql and
-- 002_ai_tutor_tables.sql.

CREATE TABLE academy_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    syllabus_topic TEXT NOT NULL, -- maps to the class outline section, e.g. "1. Introduction to DeFi"
    order_index INTEGER NOT NULL DEFAULT 0,
    pass_mark_percent INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_academy_modules_order ON academy_modules(order_index);

CREATE TABLE academy_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT, -- markdown
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_academy_lessons_module_id ON academy_lessons(module_id);

CREATE TABLE academy_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    rubric TEXT NOT NULL, -- fed to the AI grader alongside the submission
    max_score INTEGER NOT NULL DEFAULT 10,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_academy_assignments_module_id ON academy_assignments(module_id);

CREATE TABLE academy_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES academy_assignments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'marked', 'error')),
    ai_score INTEGER,
    ai_strengths JSONB,
    ai_corrections JSONB,
    ai_suggested_improvement TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    marked_at TIMESTAMPTZ,
    UNIQUE (assignment_id, user_id) -- one submission per student per assignment; resubmission overwrites
);

CREATE INDEX idx_academy_submissions_assignment_id ON academy_submissions(assignment_id);
CREATE INDEX idx_academy_submissions_user_id ON academy_submissions(user_id);

CREATE TABLE academy_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    pass_mark_percent INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_academy_quizzes_module_id ON academy_quizzes(module_id);

CREATE TABLE academy_quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES academy_quizzes(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- e.g. ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_index INTEGER NOT NULL, -- index into options
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_academy_quiz_questions_quiz_id ON academy_quiz_questions(quiz_id);

CREATE TABLE academy_quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES academy_quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL, -- { questionId: selectedIndex }
    score_percent INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_academy_quiz_attempts_quiz_id ON academy_quiz_attempts(quiz_id);
CREATE INDEX idx_academy_quiz_attempts_user_id ON academy_quiz_attempts(user_id);

CREATE TABLE academy_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'article' CHECK (resource_type IN ('article', 'video', 'doc', 'tool')),
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_academy_resources_module_id ON academy_resources(module_id);

-- Row Level Security
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_resources ENABLE ROW LEVEL SECURITY;

-- Modules/lessons/assignments/quizzes/resources are readable by any logged-in user
-- (course content isn't private); writes happen via the service-role client only.
CREATE POLICY "Authenticated users can view modules" ON academy_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view lessons" ON academy_lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view assignments" ON academy_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view quizzes" ON academy_quizzes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view resources" ON academy_resources FOR SELECT USING (auth.role() = 'authenticated');

-- Quiz questions expose correct_index — deliberately NOT readable directly by
-- students via RLS. Only the server (service-role client) can read the answer
-- key; the client fetches questions/options through an API route that strips it.
CREATE POLICY "Service role only for quiz questions" ON academy_quiz_questions FOR SELECT USING (false);

-- Submissions and quiz attempts: users see only their own.
CREATE POLICY "Users can view their own submissions" ON academy_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own quiz attempts" ON academy_quiz_attempts FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard is computed server-side (service role) from submissions + quiz_attempts
-- and returned as aggregated, non-identifying-beyond-name data via an API route,
-- rather than exposing raw submission/attempt tables broadly.
