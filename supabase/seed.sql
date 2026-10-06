-- ==============================================================================
-- Exercise Database Seed Data
-- Standard Muscle Groups, Equipment, Categories, and Baseline Exercises
-- with AI Pose Landmark Configs, Multi-Lingual Instructions & Licensing Info
-- ==============================================================================

-- 1. Muscle Groups Seed
INSERT INTO muscle_groups (id, name, slug, description) VALUES
('10000000-0000-0000-0000-000000000001', 'Chest', 'chest', 'Pectoralis major and pectoralis minor muscles of the upper torso.'),
('10000000-0000-0000-0000-000000000002', 'Lats', 'lats', 'Latissimus dorsi, wide back muscles providing V-taper pull strength.'),
('10000000-0000-0000-0000-000000000003', 'Upper Back & Traps', 'upper-back-traps', 'Trapezius, rhomboids, and rear rotator cuff stabilizers.'),
('10000000-0000-0000-0000-000000000004', 'Lower Back', 'lower-back', 'Erector spinae providing spinal stabilization and posterior hinge support.'),
('10000000-0000-0000-0000-000000000005', 'Shoulders', 'shoulders', 'Deltoids (anterior, lateral, posterior heads) and rotator cuffs.'),
('10000000-0000-0000-0000-000000000006', 'Biceps', 'biceps', 'Biceps brachii and brachialis responsible for elbow flexion.'),
('10000000-0000-0000-0000-000000000007', 'Triceps', 'triceps', 'Triceps brachii (long, lateral, and medial heads) for elbow extension.'),
('10000000-0000-0000-0000-000000000008', 'Forearms', 'forearms', 'Wrist flexors, extensors, and brachioradialis for grip strength.'),
('10000000-0000-0000-0000-000000000009', 'Quadriceps', 'quadriceps', 'Front thigh muscles responsible for knee extension.'),
('10000000-0000-0000-0000-000000000010', 'Hamstrings', 'hamstrings', 'Posterior thigh muscles for knee flexion and hip extension.'),
('10000000-0000-0000-0000-000000000011', 'Glutes', 'glutes', 'Gluteus maximus, medius, and minimus for hip extension and abduction.'),
('10000000-0000-0000-0000-000000000012', 'Calves', 'calves', 'Gastrocnemius and soleus responsible for ankle plantarflexion.'),
('10000000-0000-0000-0000-000000000013', 'Core & Abs', 'core-abs', 'Rectus abdominis, transverse abdominis, and internal/external obliques.'),
('10000000-0000-0000-0000-000000000014', 'Hip Flexors', 'hip-flexors', 'Iliopsoas, tensor fasciae latae, and rectus femoris.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Equipment Seed
INSERT INTO equipment (id, name, slug, description) VALUES
('20000000-0000-0000-0000-000000000001', 'Bodyweight', 'bodyweight', 'No equipment required; uses gravity and athlete body weight.'),
('20000000-0000-0000-0000-000000000002', 'Barbell', 'barbell', 'Standard 20kg Olympic or 15kg training barbell with weight plates.'),
('20000000-0000-0000-0000-000000000003', 'Dumbbell', 'dumbbell', 'Fixed or adjustable handheld free weights for unilateral movements.'),
('20000000-0000-0000-0000-000000000004', 'Kettlebell', 'kettlebell', 'Cast-iron or steel ball with handle for ballistic and hinge movements.'),
('20000000-0000-0000-0000-000000000005', 'Cable Machine', 'cable-machine', 'Adjustable pulley stack providing continuous resistance across angles.'),
('20000000-0000-0000-0000-000000000006', 'Resistance Band', 'resistance-band', 'Elastic loop or handled tube bands providing variable progressive tension.'),
('20000000-0000-0000-0000-000000000007', 'Pull-Up Bar', 'pull-up-bar', 'Horizontal overhead bar for vertical pulling and hanging core exercises.'),
('20000000-0000-0000-0000-000000000008', 'Dip Station', 'dip-station', 'Parallel or converging bars for upper body pressing and knee raises.'),
('20000000-0000-0000-0000-000000000009', 'Flat Bench', 'flat-bench', 'Standard horizontal utility workout bench.'),
('20000000-0000-0000-0000-000000000010', 'Incline Bench', 'incline-bench', 'Adjustable utility bench angled upward (usually 30 to 45 degrees).'),
('20000000-0000-0000-0000-000000000011', 'Smith Machine', 'smith-machine', 'Barbell fixed on vertical or slightly angled guide rails with safety catches.'),
('20000000-0000-0000-0000-000000000012', 'EZ Bar', 'ez-bar', 'Ergonomic undulating barbell designed to reduce wrist torque.'),
('20000000-0000-0000-0000-000000000013', 'Trap Bar', 'trap-bar', 'Hexagonal barbell allowing neutral grip deadlifts and farmer walks.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Exercise Categories Seed
INSERT INTO exercise_categories (id, name, slug, description) VALUES
('30000000-0000-0000-0000-000000000001', 'Strength', 'strength', 'Foundational compound resistance training for maximal force development.'),
('30000000-0000-0000-0000-000000000002', 'Hypertrophy', 'hypertrophy', 'Targeted muscle isolation and tension for muscular growth and size.'),
('30000000-0000-0000-0000-000000000003', 'Calisthenics', 'calisthenics', 'Gymnastic bodyweight mastery, leverage manipulation, and kinetic control.'),
('30000000-0000-0000-0000-000000000004', 'Cardio & Conditioning', 'cardio-conditioning', 'Metabolic conditioning, heart rate elevation, and aerobic capacity.'),
('30000000-0000-0000-0000-000000000005', 'Mobility & Flexibility', 'mobility-flexibility', 'Active joint range of motion, myofascial release, and postural restoration.'),
('30000000-0000-0000-0000-000000000006', 'Plyometrics', 'plyometrics', 'Explosive stretch-shortening cycle movements for power and rate of force development.')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 4. Baseline Canonical Exercises with Complete Metadata
-- ==============================================================================

-- 4.1 Barbell Back Squat
INSERT INTO exercises (
    id, external_id, name, slug, description, category, body_part, equipment,
    target_muscle, secondary_muscles, difficulty, exercise_type,
    instructions, benefits, precautions, is_active
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    '0043',
    'Barbell Back Squat',
    'barbell-back-squat',
    'The king of lower body compound exercises. Places a barbell across the upper back and descends through hip and knee flexion to below parallel.',
    'Strength', 'upper legs', 'barbell',
    'Quadriceps', ARRAY['Glutes', 'Hamstrings', 'Lower Back', 'Core & Abs', 'Calves'],
    'intermediate', 'strength',
    ARRAY[
        'Rest the barbell comfortably across your upper traps or rear deltoids, keeping elbows pulled back.',
        'Set feet slightly wider than shoulder-width apart with toes flared 15 to 30 degrees.',
        'Brace your core with a deep diaphragmatic breath (Valsalva maneuver) before descending.',
        'Break simultaneously at the hips and knees, sitting down and between your heels.',
        'Descend until hip crease drops below the top of the patella (parallel depth) without spinal rounding.',
        'Drive through midfoot and heel, extending knees and hips concurrently to return to standing.'
    ],
    ARRAY[
        'Builds raw maximal lower-body strength and muscular hypertrophy.',
        'Stimulates high systemic hormonal and neurological response.',
        'Strengthens connective tissues around hips, knees, and ankles.'
    ],
    ARRAY[
        'Avoid letting knees collapse inward (valgus collapse) on the ascent.',
        'Maintain lumbar lordosis; do not round lower back into a "butt wink".',
        'Always set safety pins inside a power rack when squatting heavy.'
    ],
    true
) ON CONFLICT (external_id) DO UPDATE SET name = EXCLUDED.name;

-- 4.2 Standard Push-Up
INSERT INTO exercises (
    id, external_id, name, slug, description, category, body_part, equipment,
    target_muscle, secondary_muscles, difficulty, exercise_type,
    instructions, benefits, precautions, is_active
) VALUES (
    '40000000-0000-0000-0000-000000000002',
    '0662',
    'Standard Push-Up',
    'push-up',
    'Fundamental calisthenic upper body pressing exercise developing chest, anterior delts, and core stabilization.',
    'Calisthenics', 'chest', 'bodyweight',
    'Chest', ARRAY['Triceps', 'Shoulders', 'Core & Abs', 'Serratus Anterior'],
    'beginner', 'calisthenics',
    ARRAY[
        'Begin in a high plank position with hands slightly wider than shoulder-width, fingers spread.',
        'Form a straight kinetic line from head to heels, squeezing glutes and bracing abs.',
        'Lower your torso with controlled tempo until your chest grazes 1 inch above the floor.',
        'Keep elbows tracking back at approximately 45 degrees to the torso (arrowhead pattern).',
        'Press explosively through palms to full lockout, maintaining a rigid spine.'
    ],
    ARRAY[
        'Builds functional pressing strength anywhere with zero equipment.',
        'Teaches full-body tension and anti-extension core stabilization.'
    ],
    ARRAY[
        'Avoid flaring elbows out to 90 degrees, which impinge subacromial tissues.',
        'Do not let hips sag or pike upward.'
    ],
    true
) ON CONFLICT (external_id) DO UPDATE SET name = EXCLUDED.name;

-- 4.3 3/4 Sit-Up (Demonstrating fraction slug expansion: "three-quarter-sit-up")
INSERT INTO exercises (
    id, external_id, name, slug, description, category, body_part, equipment,
    target_muscle, secondary_muscles, difficulty, exercise_type,
    instructions, benefits, precautions, is_active
) VALUES (
    '40000000-0000-0000-0000-000000000003',
    '0001',
    '3/4 Sit-Up',
    'three-quarter-sit-up',
    'Abdominal flexion movement performed through three-quarters of the full sit-up arc to maintain constant tension on the rectus abdominis.',
    'Hypertrophy', 'waist', 'bodyweight',
    'Core & Abs', ARRAY['Hip Flexors', 'Obliques'],
    'beginner', 'strength',
    ARRAY[
        'Lie supine on a mat with knees bent at 90 degrees and feet flat on the floor.',
        'Cross arms over chest or gently support the sides of your temples without pulling the neck.',
        'Curl your shoulders and torso forward until you reach 75% of a full sit-up posture.',
        'Pause momentarily to contract the rectus abdominis at the peak.',
        'Lower slowly under control without resting back flat on the floor to maintain tension.'
    ],
    ARRAY[
        'Isolates abdominal musculature while minimizing hip flexor takeover.',
        'Keeps continuous mechanical tension throughout the repetition.'
    ],
    ARRAY[
        'Do not yank or jerk your cervical spine with your hands.',
        'Stop if you experience lumbar disc pain.'
    ],
    true
) ON CONFLICT (external_id) DO UPDATE SET name = EXCLUDED.name;

-- ==============================================================================
-- 5. Multi-Language Instructions Seed
-- ==============================================================================

-- English instructions for Barbell Back Squat
INSERT INTO exercise_instructions (exercise_id, language_code, instruction_steps) VALUES (
    '40000000-0000-0000-0000-000000000001',
    'en',
    '[
        {"step": 1, "text": "Position barbell across upper trapezius, grip bar firmly with chest upright.", "cue": "Create shelf with traps"},
        {"step": 2, "text": "Set stance slightly wider than shoulder width with toes angled outward 20 degrees.", "cue": "Tripod foot balance"},
        {"step": 3, "text": "Inhale deeply into belly and brace abdominal wall.", "cue": "360-degree core brace"},
        {"step": 4, "text": "Descend by hinging hips back and opening knees outward.", "cue": "Knees track over toes"},
        {"step": 5, "text": "Reach parallel depth where hip crease sits just below knee joint.", "cue": "Hit parallel"},
        {"step": 6, "text": "Drive aggressively up through midfoot to full standing lockout.", "cue": "Drive floor away"}
    ]'::jsonb
) ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Spanish instructions for Barbell Back Squat
INSERT INTO exercise_instructions (exercise_id, language_code, instruction_steps) VALUES (
    '40000000-0000-0000-0000-000000000001',
    'es',
    '[
        {"step": 1, "text": "Coloca la barra sobre la parte superior del trapecio con el pecho erguido.", "cue": "Crea una base firme con los trapecios"},
        {"step": 2, "text": "Abre los pies ligeramente más anchos que los hombros con las puntas hacia afuera 20 grados.", "cue": "Apoyo de trípode en el pie"},
        {"step": 3, "text": "Inhala profundamente en el abdomen y aprieta el core.", "cue": "Contracción abdominal total"},
        {"step": 4, "text": "Baja flexionando caderas y rodillas hacia afuera de manera controlada.", "cue": "Rodillas en línea con las puntas"},
        {"step": 5, "text": "Alcanza la profundidad paralela con las caderas debajo de las rodillas.", "cue": "Rompe el paralelo"},
        {"step": 6, "text": "Empuja con fuerza el suelo a través del mediopié para volver a ponerte de pie.", "cue": "Empuja el suelo"}
    ]'::jsonb
) ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Turkish instructions for 3/4 Sit-Up
INSERT INTO exercise_instructions (exercise_id, language_code, instruction_steps) VALUES (
    '40000000-0000-0000-0000-000000000003',
    'tr',
    '[
        {"step": 1, "text": "Dizleriniz bükülü, ayak tabanlarınız yerde olacak şekilde matın üzerine sırtüstü uzanın.", "cue": "Ayaklar sabit"},
        {"step": 2, "text": "Ellerinizi göğsünüzün üzerinde çaprazlayın veya şakaklarınıza hafifçe dokundurun.", "cue": "Boynunuzu çekmeyin"},
        {"step": 3, "text": "Karın kaslarınızı sıkarak gövdenizi hareketin 3/4 açısına kadar kaldırın.", "cue": "Karından güç alın"},
        {"step": 4, "text": "Tepe noktasında bir saniye bekleyip kontrollü şekilde geri inin.", "cue": "Gerilimi kaybetmeyin"}
    ]'::jsonb
) ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- ==============================================================================
-- 6. Exercise Media with Rigorous License & Attribution Tracking
-- ==============================================================================

INSERT INTO exercise_media (
    id, exercise_id, media_type, url, thumbnail_url, duration_seconds,
    width, height, source, license, attribution, is_primary
) VALUES (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'video',
    'https://cdn.example.com/exercises/videos/barbell-squat-technique.mp4',
    'https://cdn.example.com/exercises/thumbs/barbell-squat.jpg',
    4.50,
    1080,
    1920,
    'in-house-motion-capture-studio',
    'Proprietary-App-License',
    'Copyright (c) 2026 Fitness App Media Lab. All rights reserved.',
    true
),
(
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    'gif',
    'https://cdn.example.com/exercises/animations/push-up-reference.gif',
    'https://cdn.example.com/exercises/thumbs/push-up.jpg',
    2.80,
    720,
    720,
    'openGym/exercises-dataset-reference',
    'Unlicensed-Third-Party-Placeholder',
    'Placeholder media from exercises-dataset. Flagged for scheduled in-house replacement before commercial release.',
    true
) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 7. Exercise Junction Mappings (Muscles, Equipment, Categories)
-- ==============================================================================

-- Barbell Squat Mappings
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'primary'),   -- Quadriceps
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'secondary'), -- Glutes
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'secondary'), -- Hamstrings
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'secondary')  -- Lower Back
ON CONFLICT DO NOTHING;

INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002') -- Barbell
ON CONFLICT DO NOTHING;

INSERT INTO exercise_category_map (exercise_id, category_id) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'), -- Strength
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002')  -- Hypertrophy
ON CONFLICT DO NOTHING;

-- Push-Up Mappings
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'primary'),   -- Chest
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'secondary'), -- Triceps
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'secondary')  -- Shoulders
ON CONFLICT DO NOTHING;

INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001') -- Bodyweight
ON CONFLICT DO NOTHING;

INSERT INTO exercise_category_map (exercise_id, category_id) VALUES
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'), -- Calisthenics
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001')  -- Strength
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 8. AI & Computer Vision Pose Estimation Config Seed
-- ==============================================================================

-- Barbell Back Squat AI Rules (Knee angle, hip depth, trunk angle state machine)
INSERT INTO exercise_ai_config (
    exercise_id, pose_detection_supported, rep_counting_supported, form_analysis_supported,
    required_keypoints, optional_keypoints, movement_phases,
    angle_rules, distance_rules, form_rules,
    common_mistakes, correction_messages, minimum_confidence
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    true, true, true,
    '["LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE"]'::jsonb,
    '["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_WRIST", "RIGHT_WRIST"]'::jsonb,
    '["start", "down", "inflection_bottom", "up", "complete"]'::jsonb,
    '{
        "knee": {
            "down": {"min": 65, "max": 95},
            "up": {"min": 160, "max": 180}
        },
        "hip": {
            "down": {"min": 60, "max": 90},
            "up": {"min": 165, "max": 180}
        }
    }'::jsonb,
    '{
        "feet_to_shoulder_width_ratio": {"min": 1.05, "max": 1.45},
        "knee_lateral_displacement_tolerance": 0.08
    }'::jsonb,
    '{
        "depth_criteria": "hip_y_greater_than_or_equal_to_knee_y",
        "torso_neutrality": {"max_forward_lean_degrees": 45},
        "heel_contact": "maintained_on_floor"
    }'::jsonb,
    '[
        {"code": "insufficient_depth", "name": "Shallow Squat", "penalty": 20},
        {"code": "knee_valgus", "name": "Knees Collapsing Inward", "penalty": 25},
        {"code": "excessive_forward_lean", "name": "Good Morning Squat", "penalty": 15},
        {"code": "heel_lift", "name": "Heels Leaving Ground", "penalty": 15}
    ]'::jsonb,
    '{
        "insufficient_depth": "Squat deeper until hip crease reaches parallel.",
        "knee_valgus": "Push your knees out in line with your toes.",
        "excessive_forward_lean": "Keep your chest tall and proud through the ascent.",
        "heel_lift": "Drive through your whole foot and keep heels glued to the floor."
    }'::jsonb,
    0.720
) ON CONFLICT (exercise_id) DO UPDATE SET angle_rules = EXCLUDED.angle_rules;

-- Standard Push-Up AI Rules (Elbow angle, core anti-extension spine vector)
INSERT INTO exercise_ai_config (
    exercise_id, pose_detection_supported, rep_counting_supported, form_analysis_supported,
    required_keypoints, optional_keypoints, movement_phases,
    angle_rules, distance_rules, form_rules,
    common_mistakes, correction_messages, minimum_confidence
) VALUES (
    '40000000-0000-0000-0000-000000000002',
    true, true, true,
    '["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST", "LEFT_HIP", "LEFT_ANKLE"]'::jsonb,
    '["NOSE", "RIGHT_HIP", "RIGHT_ANKLE"]'::jsonb,
    '["plank_start", "eccentric_lowering", "bottom_chest_reach", "concentric_press", "lockout"]'::jsonb,
    '{
        "elbow": {
            "bottom": {"min": 75, "max": 95},
            "top": {"min": 160, "max": 180}
        },
        "shoulder_hip_ankle_alignment": {
            "deviation_max_degrees": 12
        }
    }'::jsonb,
    '{
        "chest_to_ground_proximity_cm": {"max": 10}
    }'::jsonb,
    '{
        "pelvis_sag": {"forbidden": true},
        "cervical_reach": {"forbidden": true}
    }'::jsonb,
    '[
        {"code": "half_reps", "name": "Partial Elbow Range", "penalty": 20},
        {"code": "hip_sag", "name": "Lumbar Hyperextension", "penalty": 30},
        {"code": "elbow_flare", "name": "Elbows Flared 90 Degrees", "penalty": 15}
    ]'::jsonb,
    '{
        "half_reps": "Lower all the way down until your chest is near the floor.",
        "hip_sag": "Squeeze glutes and pull navel toward your spine.",
        "elbow_flare": "Tuck elbows back to a 45-degree arrow shape."
    }'::jsonb,
    0.680
) ON CONFLICT (exercise_id) DO UPDATE SET angle_rules = EXCLUDED.angle_rules;

-- ==============================================================================
-- 9. Exercise Variations & Cross-Relationships Seed
-- ==============================================================================

-- Variations for Barbell Back Squat
INSERT INTO exercise_variations (
    exercise_id, variation_name, description, difficulty_change, equipment_change, instructions
) VALUES
('40000000-0000-0000-0000-000000000001', 'Barbell Front Squat', 'Bar resting on anterior deltoids and clavicles, emphasizing quadriceps and upright posture.', 'harder', 'barbell', 'Clean bar to front rack, keep elbows high and descend with vertical torso.'),
('40000000-0000-0000-0000-000000000001', 'Goblet Squat', 'Holding a single dumbbell or kettlebell against the chest, excellent regression for motor learning.', 'easier', 'dumbbell', 'Hold weight against sternum, squat between knees with natural posture.'),
('40000000-0000-0000-0000-000000000001', 'Bulgarian Split Squat', 'Rear foot elevated unilateral squat targeting quad and glute stability.', 'harder', 'bodyweight', 'Elevate rear foot on bench, descend until front thigh is parallel.')
ON CONFLICT DO NOTHING;

-- Relationships for Barbell Back Squat
INSERT INTO exercise_relationships (exercise_id, related_exercise_id, relationship_type) VALUES
('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'similar')
ON CONFLICT DO NOTHING;
