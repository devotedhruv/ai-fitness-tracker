-- ==============================================================================
-- Exercise Database Architecture for Personal Fitness & AI Pose App
-- Target Platform: Supabase PostgreSQL (15+)
-- Extensions: uuid-ossp, pgcrypto, pg_trgm, unaccent
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ==============================================================================
-- 2. Utility Functions & Triggers
-- ==============================================================================

-- Automated updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- URL/App-friendly slug generator with fraction conversion and collision resolution
-- e.g. "3/4 sit-up" -> "three-quarter-sit-up", "Push-Up" -> "push-up"
CREATE OR REPLACE FUNCTION generate_exercise_slug(raw_text TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_text TEXT;
BEGIN
    IF raw_text IS NULL OR trim(raw_text) = '' THEN
        RETURN 'exercise-' || substr(md5(random()::text), 1, 8);
    END IF;

    clean_text := lower(unaccent(trim(raw_text)));

    -- Expand common fractions used in exercise naming
    clean_text := replace(clean_text, '3/4', 'three-quarter');
    clean_text := replace(clean_text, '1/2', 'half');
    clean_text := replace(clean_text, '1/4', 'quarter');
    clean_text := replace(clean_text, '1/3', 'one-third');
    clean_text := replace(clean_text, '2/3', 'two-third');
    clean_text := replace(clean_text, '%', ' percent');
    clean_text := replace(clean_text, '&', ' and ');
    clean_text := replace(clean_text, '+', ' plus ');

    -- Replace special symbols and non-alphanumeric chars with hyphen
    clean_text := regexp_replace(clean_text, '[^a-z0-9]+', '-', 'g');

    -- Strip leading and trailing hyphens
    clean_text := trim(both '-' from clean_text);

    IF clean_text = '' THEN
        clean_text := 'exercise-' || substr(md5(random()::text), 1, 8);
    END IF;

    RETURN clean_text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-assign unique slug for exercises
CREATE OR REPLACE FUNCTION set_unique_exercise_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    candidate_slug TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
        base_slug := generate_exercise_slug(NEW.name);
    ELSE
        base_slug := generate_exercise_slug(NEW.slug);
    END IF;

    candidate_slug := base_slug;

    -- Guarantee slug uniqueness on insertion/update
    WHILE EXISTS (
        SELECT 1 FROM exercises 
        WHERE slug = candidate_slug AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
        counter := counter + 1;
        candidate_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := candidate_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. Core Reference Tables
-- ==============================================================================

-- 3.1 Muscle Groups (Normalized)
CREATE TABLE IF NOT EXISTS muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Equipment (Normalized)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Exercise Categories (Normalized)
CREATE TABLE IF NOT EXISTS exercise_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. Exercises Table (Master Catalog)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE, -- ID from hasaneyldrm/exercises-dataset (e.g., '0001')
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),           -- Denormalized primary category for fast queries
    body_part VARCHAR(100),          -- Body region: chest, waist, back, upper legs, etc.
    equipment VARCHAR(100),          -- Denormalized primary equipment
    target_muscle VARCHAR(100),      -- Denormalized prime agonist muscle
    secondary_muscles TEXT[] DEFAULT '{}', -- Denormalized array of supporting synergists
    difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    exercise_type VARCHAR(50) DEFAULT 'strength' CHECK (exercise_type IN (
        'strength', 'cardio', 'calisthenics', 'stretching', 'plyometrics',
        'olympic_weightlifting', 'powerlifting', 'mobility', 'isometric'
    )),
    instructions TEXT[] DEFAULT '{}', -- Default / fallback ordered instructions
    benefits TEXT[] DEFAULT '{}',
    precautions TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Full-Text Search Vector (Weighted: A=Name, B=Description, C=Target/Equipment)
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(target_muscle, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(body_part, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(equipment, '')), 'C')
    ) STORED
);

-- Triggers for exercises
CREATE TRIGGER trg_exercise_slug
BEFORE INSERT OR UPDATE OF name, slug ON exercises
FOR EACH ROW EXECUTE FUNCTION set_unique_exercise_slug();

CREATE TRIGGER trg_exercise_updated_at
BEFORE UPDATE ON exercises
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ==============================================================================
-- 5. Multi-Language Exercise Instructions
-- ==============================================================================

CREATE TABLE IF NOT EXISTS exercise_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'tr', 'zh', 'ja'
    instruction_steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Ordered list of steps with metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_exercise_instruction_lang UNIQUE (exercise_id, language_code)
);

CREATE TRIGGER trg_exercise_instructions_updated_at
BEFORE UPDATE ON exercise_instructions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ==============================================================================
-- 6. Exercise Media & Copyright/Attribution Tracking
-- ==============================================================================

CREATE TABLE IF NOT EXISTS exercise_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'gif', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT,                 -- Path if hosted on Supabase Storage bucket
    duration_seconds NUMERIC(6,2),      -- For videos or animated GIF loops
    width INTEGER,
    height INTEGER,
    source VARCHAR(255) NOT NULL,      -- e.g. 'openGym/exercises-dataset', 'in-house-shoot', 'custom-render'
    license VARCHAR(100) NOT NULL,     -- e.g. 'CC-BY-4.0', 'Proprietary', 'Public-Domain', 'Unlicensed-Reference'
    attribution TEXT,                  -- Explicit author attribution string
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_exercise_primary_media 
ON exercise_media (exercise_id) 
WHERE is_primary = true;

-- ==============================================================================
-- 7. Junction & Normalization Tables
-- ==============================================================================

-- 7.1 Exercise <-> Muscle Groups Mapping
CREATE TABLE IF NOT EXISTS exercise_muscles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('primary', 'secondary')),
    CONSTRAINT uq_exercise_muscle_role UNIQUE (exercise_id, muscle_group_id, role)
);

-- 7.2 Exercise <-> Equipment Mapping (Supports multiple equipment types)
CREATE TABLE IF NOT EXISTS exercise_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    CONSTRAINT uq_exercise_equipment UNIQUE (exercise_id, equipment_id)
);

-- 7.3 Exercise <-> Category Mapping (Can belong to multiple categories)
CREATE TABLE IF NOT EXISTS exercise_category_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES exercise_categories(id) ON DELETE CASCADE,
    CONSTRAINT uq_exercise_category UNIQUE (exercise_id, category_id)
);

-- ==============================================================================
-- 8. AI & Computer Vision Pose Estimation Config
-- ==============================================================================

CREATE TABLE IF NOT EXISTS exercise_ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL UNIQUE REFERENCES exercises(id) ON DELETE CASCADE,
    pose_detection_supported BOOLEAN NOT NULL DEFAULT false,
    rep_counting_supported BOOLEAN NOT NULL DEFAULT false,
    form_analysis_supported BOOLEAN NOT NULL DEFAULT false,
    required_keypoints JSONB NOT NULL DEFAULT '[]'::jsonb,      -- Keypoints required in camera frame
    optional_keypoints JSONB NOT NULL DEFAULT '[]'::jsonb,      -- Keypoints tracked if visible
    movement_phases JSONB NOT NULL DEFAULT '["start", "down", "up", "complete"]'::jsonb, -- State machine phases
    angle_rules JSONB NOT NULL DEFAULT '{}'::jsonb,          -- Joint angle thresholds (e.g. knee min/max)
    distance_rules JSONB NOT NULL DEFAULT '{}'::jsonb,       -- Relative distance constraints
    form_rules JSONB NOT NULL DEFAULT '{}'::jsonb,           -- Postural integrity checks (e.g. back neutrality)
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,      -- Known faulty execution patterns
    correction_messages JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Real-time audio/visual cues
    minimum_confidence NUMERIC(4,3) NOT NULL DEFAULT 0.650 CHECK (minimum_confidence BETWEEN 0.1 AND 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_exercise_ai_config_updated_at
BEFORE UPDATE ON exercise_ai_config
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ==============================================================================
-- 9. Exercise Variations & Cross-Relationships
-- ==============================================================================

-- 9.1 Variations (e.g. Jump Squat, Bulgarian Split Squat, Goblet Squat)
CREATE TABLE IF NOT EXISTS exercise_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    variation_name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_change VARCHAR(50) CHECK (difficulty_change IN ('easier', 'harder', 'same', 'lateral')),
    equipment_change VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9.2 Relationships (Progressions, Regressions, Alternatives, Variations, Similar)
CREATE TABLE IF NOT EXISTS exercise_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    related_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (
        relationship_type IN ('progression', 'regression', 'alternative', 'variation', 'similar')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_exercise_no_self_relation CHECK (exercise_id <> related_exercise_id),
    CONSTRAINT uq_exercise_relationship UNIQUE (exercise_id, related_exercise_id, relationship_type)
);

-- ==============================================================================
-- 10. User Workout Tracking System
-- ==============================================================================

-- 10.1 Workouts
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id) in Supabase Auth
    name VARCHAR(255) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
    calories_burned NUMERIC(7,2) DEFAULT 0 CHECK (calories_burned >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10.2 Workout Exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER CHECK (target_sets > 0),
    target_reps INTEGER CHECK (target_reps > 0),
    target_duration_seconds INTEGER CHECK (target_duration_seconds > 0),
    CONSTRAINT uq_workout_exercise_order UNIQUE (workout_id, order_index)
);

-- 10.3 Exercise Sets
CREATE TABLE IF NOT EXISTS exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL CHECK (set_number > 0),
    reps INTEGER CHECK (reps >= 0),
    duration_seconds NUMERIC(7,2) CHECK (duration_seconds >= 0),
    weight NUMERIC(7,2) CHECK (weight >= 0),
    rest_seconds INTEGER CHECK (rest_seconds >= 0),
    form_score NUMERIC(5,2) CHECK (form_score BETWEEN 0.00 AND 100.00),
    ai_confidence NUMERIC(4,3) CHECK (ai_confidence BETWEEN 0.000 AND 1.000),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_workout_exercise_set UNIQUE (workout_exercise_id, set_number)
);

-- ==============================================================================
-- 11. AI Computer Vision Workout & Rep Analysis
-- ==============================================================================

-- 11.1 Exercise Analysis Sessions (Overall Session Summary)
CREATE TABLE IF NOT EXISTS exercise_analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    total_reps INTEGER NOT NULL DEFAULT 0 CHECK (total_reps >= 0),
    correct_reps INTEGER NOT NULL DEFAULT 0 CHECK (correct_reps >= 0),
    incorrect_reps INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_reps >= 0),
    average_form_score NUMERIC(5,2) CHECK (average_form_score BETWEEN 0.00 AND 100.00),
    average_confidence NUMERIC(4,3) CHECK (average_confidence BETWEEN 0.000 AND 1.000),
    calories_estimated NUMERIC(7,2) DEFAULT 0,
    feedback JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11.2 Exercise Rep Analysis (Turn-by-turn Rep telemetry and errors)
CREATE TABLE IF NOT EXISTS exercise_rep_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL REFERENCES exercise_analysis_sessions(id) ON DELETE CASCADE,
    rep_number INTEGER NOT NULL CHECK (rep_number > 0),
    form_score NUMERIC(5,2) NOT NULL CHECK (form_score BETWEEN 0.00 AND 100.00),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.000 AND 1.000),
    is_valid BOOLEAN NOT NULL DEFAULT true,
    detected_errors JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Array of specific faults: ["knee_valgus", "insufficient_depth"]
    correction_feedback JSONB NOT NULL DEFAULT '{}'::jsonb, -- Actionable coaching prompts
    keypoint_data JSONB NOT NULL DEFAULT '{}'::jsonb,       -- Temporal landmarks / joint trajectories
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_session_rep UNIQUE (analysis_session_id, rep_number)
);

-- ==============================================================================
-- 12. Search & Performance Indexes
-- ==============================================================================

-- 12.1 Full-Text Search GIN index
CREATE INDEX IF NOT EXISTS idx_exercises_search_vector 
ON exercises USING gin (search_vector);

-- 12.2 Trigram GIN index for typo-tolerant autocomplete search
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm 
ON exercises USING gin (name gin_trgm_ops);

-- 12.3 Filtering & Sorting B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_exercises_external_id ON exercises (external_id);
CREATE INDEX IF NOT EXISTS idx_exercises_slug ON exercises (slug);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises (body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_target_muscle ON exercises (target_muscle);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises (difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises (exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_is_active ON exercises (is_active);

-- 12.4 Foreign Key Indexes for High-Velocity Joins
CREATE INDEX IF NOT EXISTS idx_exercise_instructions_lookup ON exercise_instructions (exercise_id, language_code);
CREATE INDEX IF NOT EXISTS idx_exercise_media_exercise ON exercise_media (exercise_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_exercise ON exercise_muscles (exercise_id, role);
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_group ON exercise_muscles (muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercise_equipment_exercise ON exercise_equipment (exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_equipment_equip ON exercise_equipment (equipment_id);
CREATE INDEX IF NOT EXISTS idx_exercise_cat_map_cat ON exercise_category_map (category_id);
CREATE INDEX IF NOT EXISTS idx_exercise_variations_ex ON exercise_variations (exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_rel_source ON exercise_relationships (exercise_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_exercise_rel_target ON exercise_relationships (related_exercise_id);

-- 12.5 User Workouts & Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON workouts (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises (workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises (exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_ex ON exercise_sets (workout_exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user ON exercise_analysis_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_exercise ON exercise_analysis_sessions (exercise_id);
CREATE INDEX IF NOT EXISTS idx_rep_analysis_session ON exercise_rep_analysis (analysis_session_id, rep_number);

-- 12.6 JSONB GIN Indexes for deep query inspection
CREATE INDEX IF NOT EXISTS idx_ai_config_rules ON exercise_ai_config USING gin (angle_rules jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_rep_analysis_errors ON exercise_rep_analysis USING gin (detected_errors jsonb_path_ops);

-- ==============================================================================
-- 13. Supabase Row-Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_muscles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_category_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_rep_analysis ENABLE ROW LEVEL SECURITY;

-- 13.1 Public Read Catalog Policies (Exercises, Instructions, Media, Taxonomies, AI Configs)
CREATE POLICY "Public read for active exercises"
ON exercises FOR SELECT
USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "Public read for muscle groups"
ON muscle_groups FOR SELECT
USING (true);

CREATE POLICY "Public read for equipment"
ON equipment FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise categories"
ON exercise_categories FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise instructions"
ON exercise_instructions FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise media"
ON exercise_media FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise muscles"
ON exercise_muscles FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise equipment"
ON exercise_equipment FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise category map"
ON exercise_category_map FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise AI config"
ON exercise_ai_config FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise variations"
ON exercise_variations FOR SELECT
USING (true);

CREATE POLICY "Public read for exercise relationships"
ON exercise_relationships FOR SELECT
USING (true);

-- 13.2 Authenticated User Isolated Workout Policies (CRUD on own data only)
CREATE POLICY "Users can manage their own workouts"
ON workouts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their workout exercises"
ON workout_exercises FOR ALL
USING (EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()));

CREATE POLICY "Users can manage their exercise sets"
ON exercise_sets FOR ALL
USING (EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = exercise_sets.workout_exercise_id AND w.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = exercise_sets.workout_exercise_id AND w.user_id = auth.uid()
));

CREATE POLICY "Users can manage their exercise analysis sessions"
ON exercise_analysis_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their exercise rep analysis"
ON exercise_rep_analysis FOR ALL
USING (EXISTS (
    SELECT 1 FROM exercise_analysis_sessions eas
    WHERE eas.id = exercise_rep_analysis.analysis_session_id AND eas.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM exercise_analysis_sessions eas
    WHERE eas.id = exercise_rep_analysis.analysis_session_id AND eas.user_id = auth.uid()
));

-- ==============================================================================
-- 14. Full-Text Search RPC Function with Fuzzy Trigram & Multi-Filter Support
-- ==============================================================================

CREATE OR REPLACE FUNCTION search_exercises(
    search_query TEXT DEFAULT NULL,
    filter_body_part TEXT DEFAULT NULL,
    filter_equipment TEXT DEFAULT NULL,
    filter_target_muscle TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL,
    filter_difficulty TEXT DEFAULT NULL,
    filter_exercise_type TEXT DEFAULT NULL,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    external_id VARCHAR,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    category VARCHAR,
    body_part VARCHAR,
    equipment VARCHAR,
    target_muscle VARCHAR,
    secondary_muscles TEXT[],
    difficulty VARCHAR,
    exercise_type VARCHAR,
    instructions TEXT[],
    is_active BOOLEAN,
    primary_media_url TEXT,
    primary_media_type VARCHAR,
    pose_detection_supported BOOLEAN,
    rep_counting_supported BOOLEAN,
    form_analysis_supported BOOLEAN,
    rank_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.external_id,
        e.name,
        e.slug,
        e.description,
        e.category,
        e.body_part,
        e.equipment,
        e.target_muscle,
        e.secondary_muscles,
        e.difficulty,
        e.exercise_type,
        e.instructions,
        e.is_active,
        em.url AS primary_media_url,
        em.media_type AS primary_media_type,
        COALESCE(ai.pose_detection_supported, false) AS pose_detection_supported,
        COALESCE(ai.rep_counting_supported, false) AS rep_counting_supported,
        COALESCE(ai.form_analysis_supported, false) AS form_analysis_supported,
        CASE
            WHEN search_query IS NOT NULL AND trim(search_query) <> '' THEN
                (ts_rank_cd(e.search_vector, websearch_to_tsquery('english', search_query)) * 2.0 +
                 similarity(e.name, search_query))::REAL
            ELSE 1.0::REAL
        END AS rank_score
    FROM exercises e
    LEFT JOIN LATERAL (
        SELECT url, media_type
        FROM exercise_media
        WHERE exercise_id = e.id AND is_primary = true
        ORDER BY created_at DESC
        LIMIT 1
    ) em ON true
    LEFT JOIN exercise_ai_config ai ON ai.exercise_id = e.id
    WHERE e.is_active = true
      AND (search_query IS NULL OR trim(search_query) = '' OR 
           e.search_vector @@ websearch_to_tsquery('english', search_query) OR
           e.name ILIKE '%' || search_query || '%' OR
           similarity(e.name, search_query) > 0.25)
      AND (filter_body_part IS NULL OR e.body_part ILIKE filter_body_part)
      AND (filter_equipment IS NULL OR e.equipment ILIKE filter_equipment)
      AND (filter_target_muscle IS NULL OR e.target_muscle ILIKE filter_target_muscle)
      AND (filter_category IS NULL OR e.category ILIKE filter_category)
      AND (filter_difficulty IS NULL OR e.difficulty = filter_difficulty)
      AND (filter_exercise_type IS NULL OR e.exercise_type = filter_exercise_type)
    ORDER BY rank_score DESC, e.name ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

