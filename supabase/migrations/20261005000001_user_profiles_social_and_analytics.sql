-- ==============================================================================
-- Supabase PostgreSQL Migration: User Profiles, Custom Exercises, Streaks,
-- Community Posts & Future AI Analytics Engine
-- Migration ID: 20261005000001
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. User Profiles Table (Extends auth.users)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    birth_date DATE,
    gender VARCHAR(20),
    units VARCHAR(10) NOT NULL DEFAULT 'METRIC' CHECK (units IN ('METRIC', 'IMPERIAL')),
    experience_level VARCHAR(20) NOT NULL DEFAULT 'INTERMEDIATE' CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE')),
    fitness_goals TEXT[] DEFAULT '{}',
    days_per_week INT DEFAULT 4,
    preferred_equipment TEXT[] DEFAULT '{}',
    social_links JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Automatically provision profile and streak record when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        display_name, 
        username
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Athlete'),
        LOWER(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)))
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_streaks (
        user_id
    ) VALUES (
        NEW.id
    ) ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and attach trigger to auth.users if available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_on_auth_user_created') THEN
        DROP TRIGGER trg_on_auth_user_created ON auth.users;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        CREATE TRIGGER trg_on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user_registration();
    END IF;
END $$;


-- ==============================================================================
-- 2. Custom User Exercises (Extends exercises table)
-- ==============================================================================

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exercises_is_custom ON exercises(is_custom);

-- Alter workouts to ensure status and total_volume_kg exist
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'in_progress';
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS total_volume_kg NUMERIC(12, 2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(status);


-- ==============================================================================
-- 3. User Streaks & Gamification Progression
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_workout_date DATE,
    total_workouts INT NOT NULL DEFAULT 0,
    total_volume_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_time_seconds INT NOT NULL DEFAULT 0,
    total_xp INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    streak_freezes_available INT NOT NULL DEFAULT 1,
    streak_freezes_used INT NOT NULL DEFAULT 0,
    activity_matrix JSONB NOT NULL DEFAULT '{}'::jsonb, -- 'YYYY-MM-DD' -> { volume_kg, duration_sec, workouts, xp }
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER trg_user_streaks_updated_at
BEFORE UPDATE ON user_streaks
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();


-- ==============================================================================
-- 4. Community Posts & Social Feed
-- ==============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caption TEXT,
    media_url TEXT,
    media_type VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (media_type IN ('NONE', 'IMAGE', 'VIDEO')),
    thumbnail_url TEXT,
    post_type VARCHAR(30) NOT NULL DEFAULT 'TEXT' CHECK (post_type IN (
        'TEXT', 'IMAGE', 'VIDEO', 'WORKOUT', 'RUN', 'PERSONAL_RECORD', 'STREAK', 'RANK_PROMOTION', 'MILESTONE'
    )),
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    xp_earned INT DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);

DROP TRIGGER IF EXISTS trg_community_posts_updated_at ON community_posts;
CREATE TRIGGER trg_community_posts_updated_at
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();


-- 4.1 Post Likes (Normalized)
CREATE TABLE IF NOT EXISTS community_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON community_post_likes(user_id);

-- Counter trigger function for likes
CREATE OR REPLACE FUNCTION update_post_likes_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_likes_counter ON community_post_likes;
CREATE TRIGGER trg_post_likes_counter
AFTER INSERT OR DELETE ON community_post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_counter();


-- 4.2 Post Comments (Normalized)
CREATE TABLE IF NOT EXISTS community_post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON community_post_comments(post_id);

-- Counter trigger function for comments
CREATE OR REPLACE FUNCTION update_post_comments_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_comments_counter ON community_post_comments;
CREATE TRIGGER trg_post_comments_counter
AFTER INSERT OR DELETE ON community_post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_counter();


-- ==============================================================================
-- 5. Future AI Analytics & Progression Engine
-- ==============================================================================

-- 5.1 Personal Records & 1RM Progression
CREATE TABLE IF NOT EXISTS user_personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    one_rep_max_est NUMERIC(6, 2) NOT NULL, -- Epley calculation: weight * (1 + reps/30)
    best_weight_kg NUMERIC(6, 2) NOT NULL,
    best_reps INT NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    workout_set_id UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_prs_user ON user_personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prs_exercise ON user_personal_records(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_prs_achieved_at ON user_personal_records(achieved_at DESC);


-- 5.2 Muscle Volume Aggregation Logs (For fatigue & hypertrophy balance analysis)
CREATE TABLE IF NOT EXISTS user_muscle_volume_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    total_sets INT NOT NULL DEFAULT 0,
    total_volume_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    average_rpe NUMERIC(3, 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_muscle_period UNIQUE (user_id, muscle_group_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_muscle_volume_user ON user_muscle_volume_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_volume_period ON user_muscle_volume_logs(period_start DESC);


-- ==============================================================================
-- 6. RPC: Complete Workout & Atomically Update Streaks & Telemetry
-- ==============================================================================

CREATE OR REPLACE FUNCTION record_completed_workout(
    p_workout_id UUID,
    p_user_id UUID,
    p_total_volume_kg NUMERIC,
    p_duration_seconds INT,
    p_xp_earned INT DEFAULT 50
)
RETURNS JSONB AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_streak RECORD;
    v_new_current_streak INT := 1;
    v_new_longest_streak INT := 1;
    v_matrix JSONB;
    v_day_key TEXT := to_char(v_today, 'YYYY-MM-DD');
    v_day_data JSONB;
    v_new_level INT;
    v_new_xp INT;
BEGIN
    -- 1. Ensure workout is marked completed (if workout ID provided)
    IF p_workout_id IS NOT NULL THEN
        UPDATE workouts
        SET status = 'completed',
            completed_at = now(),
            total_volume_kg = p_total_volume_kg,
            duration_seconds = p_duration_seconds
        WHERE id = p_workout_id AND user_id = p_user_id;
    END IF;

    -- 2. Fetch or initialize user streak row
    INSERT INTO user_streaks (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;

    -- 3. Calculate streak progression
    IF v_streak.last_workout_date IS NULL THEN
        v_new_current_streak := 1;
    ELSIF v_streak.last_workout_date = v_today THEN
        -- Already worked out today, maintain streak
        v_new_current_streak := v_streak.current_streak;
    ELSIF v_streak.last_workout_date = (v_today - 1) THEN
        -- Consecutive day
        v_new_current_streak := v_streak.current_streak + 1;
    ELSE
        -- Streak broken
        v_new_current_streak := 1;
    END IF;

    v_new_longest_streak := GREATEST(v_new_current_streak, v_streak.longest_streak);
    v_new_xp := v_streak.total_xp + p_xp_earned;
    v_new_level := 1 + FLOOR(v_new_xp / 500); -- Level up every 500 XP

    -- 4. Update activity matrix for heatmap analytics
    v_matrix := COALESCE(v_streak.activity_matrix, '{}'::jsonb);
    v_day_data := jsonb_build_object(
        'workouts', COALESCE((v_matrix->v_day_key->>'workouts')::int, 0) + 1,
        'volume_kg', COALESCE((v_matrix->v_day_key->>'volume_kg')::numeric, 0) + p_total_volume_kg,
        'duration_seconds', COALESCE((v_matrix->v_day_key->>'duration_seconds')::int, 0) + p_duration_seconds,
        'xp', COALESCE((v_matrix->v_day_key->>'xp')::int, 0) + p_xp_earned
    );
    v_matrix := jsonb_set(v_matrix, ARRAY[v_day_key], v_day_data, true);

    -- 5. Update user_streaks record
    UPDATE user_streaks
    SET current_streak = v_new_current_streak,
        longest_streak = v_new_longest_streak,
        last_workout_date = v_today,
        total_workouts = total_workouts + 1,
        total_volume_kg = total_volume_kg + p_total_volume_kg,
        total_time_seconds = total_time_seconds + p_duration_seconds,
        total_xp = v_new_xp,
        current_level = v_new_level,
        activity_matrix = v_matrix,
        updated_at = now()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'current_streak', v_new_current_streak,
        'longest_streak', v_new_longest_streak,
        'total_xp', v_new_xp,
        'current_level', v_new_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_muscle_volume_logs ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles: Public read, owner update
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;
CREATE POLICY "Public read profiles"
ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 7.2 Streaks: Public read for leaderboard, owner update
DROP POLICY IF EXISTS "Public read user streaks" ON user_streaks;
CREATE POLICY "Public read user streaks"
ON user_streaks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
CREATE POLICY "Users can update own streak"
ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- 7.3 Community Posts: Public read, authenticated creation
DROP POLICY IF EXISTS "Public read community posts" ON community_posts;
CREATE POLICY "Public read community posts"
ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
CREATE POLICY "Authenticated users can create posts"
ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit or delete own posts" ON community_posts;
CREATE POLICY "Users can edit or delete own posts"
ON community_posts FOR ALL USING (auth.uid() = user_id);

-- 7.4 Likes: Public read, authenticated toggle
DROP POLICY IF EXISTS "Public read post likes" ON community_post_likes;
CREATE POLICY "Public read post likes"
ON community_post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can toggle own likes" ON community_post_likes;
CREATE POLICY "Users can toggle own likes"
ON community_post_likes FOR ALL USING (auth.uid() = user_id);

-- 7.5 Comments: Public read, authenticated comments
DROP POLICY IF EXISTS "Public read comments" ON community_post_comments;
CREATE POLICY "Public read comments"
ON community_post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON community_post_comments;
CREATE POLICY "Authenticated users can comment"
ON community_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON community_post_comments;
CREATE POLICY "Users can delete own comments"
ON community_post_comments FOR DELETE USING (auth.uid() = user_id);

-- 7.6 Exercises: Update policy for custom exercises
DROP POLICY IF EXISTS "Public read for active exercises" ON exercises;
DROP POLICY IF EXISTS "Read active catalog and own custom exercises" ON exercises;
CREATE POLICY "Read active catalog and own custom exercises"
ON exercises FOR SELECT
USING (
    is_active = true 
    AND (user_id IS NULL OR user_id = auth.uid() OR auth.role() = 'service_role')
);

DROP POLICY IF EXISTS "Users can create own custom exercises" ON exercises;
CREATE POLICY "Users can create own custom exercises"
ON exercises FOR INSERT
WITH CHECK (user_id = auth.uid() AND is_custom = true);

DROP POLICY IF EXISTS "Users can manage own custom exercises" ON exercises;
CREATE POLICY "Users can manage own custom exercises"
ON exercises FOR ALL
USING (user_id = auth.uid() AND is_custom = true);

-- 7.7 Personal Records & Muscle Logs: User isolated
DROP POLICY IF EXISTS "User personal records private access" ON user_personal_records;
CREATE POLICY "User personal records private access"
ON user_personal_records FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User muscle volume logs private access" ON user_muscle_volume_logs;
CREATE POLICY "User muscle volume logs private access"
ON user_muscle_volume_logs FOR ALL USING (auth.uid() = user_id);

COMMIT;

