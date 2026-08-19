-- ============================================================
-- Golden Generation Community Feature Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add GG membership flag to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_golden_generation BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Update auth trigger to map is_golden_generation from signup metadata
--    Replace YOUR_EXISTING_TRIGGER_FUNCTION with the actual trigger function name
--    if you have one. Otherwise, update profiles manually after signup,
--    or adjust the trigger below to your existing function.
--
-- Example: if your trigger function is named handle_new_user:
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, first_name, last_name, email, role, is_golden_generation)
--   VALUES (
--     NEW.id,
--     NEW.raw_user_meta_data->>'first_name',
--     NEW.raw_user_meta_data->>'last_name',
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
--     COALESCE((NEW.raw_user_meta_data->>'is_golden_generation')::boolean, false)
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Curriculum structure table
CREATE TABLE IF NOT EXISTS gg_curriculum (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phase             INTEGER     NOT NULL,
  week              INTEGER     NOT NULL,
  day               INTEGER,
  title             TEXT        NOT NULL,
  description       TEXT,
  topic_type        TEXT        NOT NULL DEFAULT 'lesson',
  order_index       INTEGER     NOT NULL,
  estimated_minutes INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Per-user progress table
CREATE TABLE IF NOT EXISTS gg_progress (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id UUID        NOT NULL REFERENCES gg_curriculum(id) ON DELETE CASCADE,
  completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, curriculum_id)
);

-- 5. Enable RLS
ALTER TABLE gg_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE gg_progress   ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies
DROP POLICY IF EXISTS "GG members can read curriculum" ON gg_curriculum;
CREATE POLICY "GG members can read curriculum"
  ON gg_curriculum FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_golden_generation = TRUE
    )
  );

DROP POLICY IF EXISTS "Users manage own progress" ON gg_progress;
CREATE POLICY "Users manage own progress"
  ON gg_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. Enable Realtime on notifications (run separately if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
