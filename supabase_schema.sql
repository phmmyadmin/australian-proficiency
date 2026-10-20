-- ==========================================================
-- Australian Proficiency (PTE Academic & Aussie English Suite)
-- Multi-Tenant Schema: australian_proficiency
-- ==========================================================

CREATE SCHEMA IF NOT EXISTS australian_proficiency;

GRANT USAGE ON SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA australian_proficiency TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA australian_proficiency GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 1. PTE Question Bank Items (Custom & AI-Generated)
CREATE TABLE IF NOT EXISTS australian_proficiency.pte_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'C1',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PTE Practice & Mock Attempts
CREATE TABLE IF NOT EXISTS australian_proficiency.pte_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  section TEXT NOT NULL,
  mode TEXT DEFAULT 'practice',
  mock_session_id UUID,
  user_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_percentage NUMERIC DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Mock Test Sessions
CREATE TABLE IF NOT EXISTS australian_proficiency.mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  overall_score INTEGER NOT NULL DEFAULT 10,
  speaking_score INTEGER NOT NULL DEFAULT 10,
  writing_score INTEGER NOT NULL DEFAULT 10,
  reading_score INTEGER NOT NULL DEFAULT 10,
  listening_score INTEGER NOT NULL DEFAULT 10,
  enabling_skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  item_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Australian Accent YouTube Videos & Segments
CREATE TABLE IF NOT EXISTS australian_proficiency.youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  channel TEXT DEFAULT 'Aussie English',
  accent_region TEXT DEFAULT 'General Australian',
  difficulty TEXT DEFAULT 'C1',
  topic TEXT DEFAULT 'Australian Culture & News',
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  comprehension_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  vocabulary JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Vocabulary Flashcards (FSRS-5 Spaced Repetition)
CREATE TABLE IF NOT EXISTS australian_proficiency.vocab_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  ipa TEXT DEFAULT '',
  part_of_speech TEXT DEFAULT 'noun',
  definition TEXT NOT NULL,
  example_sentence TEXT DEFAULT '',
  collocations JSONB DEFAULT '[]'::jsonb,
  topic TEXT DEFAULT 'Academic',
  level TEXT DEFAULT 'C1',
  is_aussie_slang BOOLEAN DEFAULT false,
  stability NUMERIC DEFAULT 0,
  difficulty NUMERIC DEFAULT 0,
  reps INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  state TEXT DEFAULT 'new',
  due TIMESTAMPTZ DEFAULT now(),
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. User Settings & Study Progress
CREATE TABLE IF NOT EXISTS australian_proficiency.user_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  target_score INTEGER DEFAULT 79,
  exam_date TEXT DEFAULT '',
  daily_goal_minutes INTEGER DEFAULT 45,
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE australian_proficiency.pte_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_proficiency.pte_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_proficiency.mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_proficiency.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_proficiency.vocab_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE australian_proficiency.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public pte_items" ON australian_proficiency.pte_items;
CREATE POLICY "Public pte_items" ON australian_proficiency.pte_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public pte_attempts" ON australian_proficiency.pte_attempts;
CREATE POLICY "Public pte_attempts" ON australian_proficiency.pte_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public mock_sessions" ON australian_proficiency.mock_sessions;
CREATE POLICY "Public mock_sessions" ON australian_proficiency.mock_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public youtube_videos" ON australian_proficiency.youtube_videos;
CREATE POLICY "Public youtube_videos" ON australian_proficiency.youtube_videos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public vocab_cards" ON australian_proficiency.vocab_cards;
CREATE POLICY "Public vocab_cards" ON australian_proficiency.vocab_cards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public user_settings" ON australian_proficiency.user_settings;
CREATE POLICY "Public user_settings" ON australian_proficiency.user_settings FOR ALL USING (true) WITH CHECK (true);
