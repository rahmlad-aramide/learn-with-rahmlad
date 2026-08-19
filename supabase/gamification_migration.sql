-- =============================================================================
-- Gamification Migration
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add gamification columns to profiles
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- ---------------------------------------------------------------------------
-- 2. XP event audit (UNIQUE constraint prevents double-awarding)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_xp_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'resource' | 'course_complete' | 'badge'
  source_id   UUID NOT NULL,
  xp_amount   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, source_type, source_id)
);

-- ---------------------------------------------------------------------------
-- 3. Course completion dedup (prevents bonus XP on re-completion)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_course_completions (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- ---------------------------------------------------------------------------
-- 4. Badges reference table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  icon            TEXT NOT NULL,
  condition_type  TEXT NOT NULL, -- 'resources_completed' | 'streak' | 'courses_completed'
  condition_value INTEGER NOT NULL,
  xp_reward       INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- 5. Per-user earned badges
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- 6. Announcements (platform-wide "What's New" posts by admins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. Per-user announcement dismissals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcement_dismissals (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  dismissed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, announcement_id)
);

-- ---------------------------------------------------------------------------
-- 8. Seed badges
-- ---------------------------------------------------------------------------
INSERT INTO badges (name, description, icon, condition_type, condition_value, xp_reward) VALUES
  ('First Step',      'Complete your first resource',     '🎯', 'resources_completed', 1,   50),
  ('Quick Learner',   'Complete 10 resources',            '⚡', 'resources_completed', 10,  50),
  ('Scholar',         'Complete 25 resources',            '📚', 'resources_completed', 25,  100),
  ('Dedicated',       'Maintain a 7-day learning streak', '🔥', 'streak',              7,   75),
  ('Iron Will',       'Maintain a 30-day streak',         '💪', 'streak',              30,  200),
  ('Course Champion', 'Complete your first full course',  '🏆', 'courses_completed',   1,   100),
  ('Path Walker',     'Complete a full learning path',    '🛤️', 'paths_completed',     1,   250)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. Core gamification trigger function
--    Fires AFTER INSERT OR UPDATE OF completed ON user_progress
--    Handles: streak, XP award, course completion bonus, badge checks
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_resource_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        UUID;
  v_resource_id    UUID;
  v_course_id      UUID;
  v_today          DATE := CURRENT_DATE;
  v_last_active    DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_resources_done INTEGER;
  v_course_total   INTEGER;
  v_course_done    INTEGER;
  v_xp_gained      INTEGER := 0;
  v_badge          RECORD;
  v_qualifies      BOOLEAN;
  v_courses_done   INTEGER;
BEGIN
  -- Only act when completed flips to TRUE
  IF NOT (NEW.completed = TRUE AND (OLD IS NULL OR OLD.completed = FALSE)) THEN
    RETURN NEW;
  END IF;

  v_user_id     := NEW.user_id;
  v_resource_id := NEW.resource_id;

  -- ── Streak logic ────────────────────────────────────────────────────────
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM profiles WHERE id = v_user_id FOR UPDATE;

  IF v_last_active IS NULL OR v_last_active < v_today - INTERVAL '1 day' THEN
    v_current_streak := 1;
  ELSIF v_last_active = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  END IF;
  -- If v_last_active = v_today: already counted, leave current_streak unchanged

  v_longest_streak := GREATEST(v_longest_streak, v_current_streak);

  UPDATE profiles SET
    last_active_date = v_today,
    current_streak   = v_current_streak,
    longest_streak   = v_longest_streak
  WHERE id = v_user_id;

  -- ── Resource XP (+10) ───────────────────────────────────────────────────
  -- ON CONFLICT DO NOTHING means FOUND = false when already awarded
  INSERT INTO user_xp_events (user_id, source_type, source_id, xp_amount)
  VALUES (v_user_id, 'resource', v_resource_id, 10)
  ON CONFLICT (user_id, source_type, source_id) DO NOTHING;

  IF FOUND THEN
    v_xp_gained := v_xp_gained + 10;
  END IF;

  -- ── Course completion bonus (+50) ────────────────────────────────────────
  SELECT r.course_id INTO v_course_id FROM resources r WHERE r.id = v_resource_id;

  IF v_course_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_course_total FROM resources WHERE course_id = v_course_id;

    SELECT COUNT(*) INTO v_course_done
    FROM user_progress up
    JOIN resources r ON r.id = up.resource_id
    WHERE up.user_id = v_user_id
      AND r.course_id = v_course_id
      AND up.completed = TRUE;

    IF v_course_total > 0 AND v_course_done >= v_course_total THEN
      INSERT INTO user_course_completions (user_id, course_id)
      VALUES (v_user_id, v_course_id)
      ON CONFLICT (user_id, course_id) DO NOTHING;

      IF FOUND THEN
        INSERT INTO user_xp_events (user_id, source_type, source_id, xp_amount)
        VALUES (v_user_id, 'course_complete', v_course_id, 50)
        ON CONFLICT (user_id, source_type, source_id) DO NOTHING;

        IF FOUND THEN
          v_xp_gained := v_xp_gained + 50;
        END IF;
      END IF;
    END IF;
  END IF;

  -- ── Apply total XP ───────────────────────────────────────────────────────
  IF v_xp_gained > 0 THEN
    UPDATE profiles SET total_xp = total_xp + v_xp_gained WHERE id = v_user_id;
  END IF;

  -- ── Badge checks ─────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_resources_done
  FROM user_progress WHERE user_id = v_user_id AND completed = TRUE;

  SELECT COUNT(*) INTO v_courses_done
  FROM user_course_completions WHERE user_id = v_user_id;

  FOR v_badge IN SELECT * FROM badges LOOP
    v_qualifies := FALSE;

    CASE v_badge.condition_type
      WHEN 'resources_completed' THEN
        v_qualifies := v_resources_done >= v_badge.condition_value;
      WHEN 'streak' THEN
        v_qualifies := v_current_streak >= v_badge.condition_value;
      WHEN 'courses_completed' THEN
        v_qualifies := v_courses_done >= v_badge.condition_value;
      ELSE
        v_qualifies := FALSE;
    END CASE;

    IF v_qualifies THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (v_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      IF FOUND THEN
        -- Award badge XP bonus
        IF v_badge.xp_reward > 0 THEN
          INSERT INTO user_xp_events (user_id, source_type, source_id, xp_amount)
          VALUES (v_user_id, 'badge', v_badge.id, v_badge.xp_reward)
          ON CONFLICT (user_id, source_type, source_id) DO NOTHING;

          IF FOUND THEN
            UPDATE profiles
            SET total_xp = total_xp + v_badge.xp_reward
            WHERE id = v_user_id;
          END IF;
        END IF;

        -- Insert achievement notification
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          v_user_id,
          'Badge Unlocked: ' || v_badge.icon || ' ' || v_badge.name,
          v_badge.description,
          'achievement'
        );
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach trigger (idempotent)
DROP TRIGGER IF EXISTS on_resource_completed ON user_progress;
CREATE TRIGGER on_resource_completed
  AFTER INSERT OR UPDATE OF completed ON user_progress
  FOR EACH ROW EXECUTE FUNCTION handle_resource_completion();

-- ---------------------------------------------------------------------------
-- 10. GG Leaderboard RPC
--     Returns top 10 GG members by completed curriculum items.
--     Caller must be a GG member (checked inside function).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_gg_leaderboard()
RETURNS TABLE (
  user_id          UUID,
  first_name       TEXT,
  last_name        TEXT,
  total_xp         INTEGER,
  completed_count  BIGINT,
  completion_pct   NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id             AS user_id,
    p.first_name,
    p.last_name,
    p.total_xp,
    COUNT(gp.curriculum_id) FILTER (WHERE gp.completed = TRUE) AS completed_count,
    ROUND(
      COUNT(gp.curriculum_id) FILTER (WHERE gp.completed = TRUE)::NUMERIC
      / NULLIF(COUNT(gp.curriculum_id), 0) * 100,
      1
    ) AS completion_pct
  FROM profiles p
  JOIN gg_progress gp ON gp.user_id = p.id
  WHERE p.is_golden_generation = TRUE
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_golden_generation = TRUE
    )
  GROUP BY p.id, p.first_name, p.last_name, p.total_xp
  ORDER BY completed_count DESC, MIN(gp.completed_at) ASC NULLS LAST
  LIMIT 10;
$$;

-- ---------------------------------------------------------------------------
-- 11. RLS policies
-- ---------------------------------------------------------------------------

-- user_xp_events
ALTER TABLE user_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own xp events"
  ON user_xp_events FOR SELECT
  USING (user_id = auth.uid());

-- user_course_completions
ALTER TABLE user_course_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own course completions"
  ON user_course_completions FOR SELECT
  USING (user_id = auth.uid());

-- badges (all authenticated users can read the full list)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read badges"
  ON badges FOR SELECT
  USING (auth.role() = 'authenticated');

-- user_badges (SELECT own; INSERT handled by SECURITY DEFINER trigger)
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own badges"
  ON user_badges FOR SELECT
  USING (user_id = auth.uid());

-- announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read active announcements"
  ON announcements FOR SELECT
  USING (is_active = TRUE AND auth.role() = 'authenticated');
CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- announcement_dismissals
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dismissals"
  ON announcement_dismissals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
