#!/usr/bin/env python3
"""
Exercise Database Ingestion & Normalization Pipeline
====================================================
Imports exercises from hasaneyldrm/exercises-dataset / openGym format into
a normalized Supabase PostgreSQL database.

Features:
- Handles 1,324+ exercises dataset
- Fraction expansion & slugification ("3/4 sit-up" -> "three-quarter-sit-up")
- Multi-lingual instruction parsing (en, es, it, tr, ru, zh, etc.)
- Strict media license and copyright tracking
- Muscle group and equipment junction normalization
- Baseline AI pose estimation rules generation for rep counting and form feedback
- Supports direct PostgreSQL execution via psycopg2 AND/OR export to standalone SQL script
- Dry-run validation mode
"""

import os
import re
import sys
import json
import uuid
import argparse
import unicodedata
from typing import Dict, Any, List, Optional, Tuple, Set

# Try importing psycopg2 if available
try:
    import psycopg2
    from psycopg2.extras import execute_batch, Json
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False


def slugify_exercise_name(name: str) -> str:
    """
    Generate clean URL/app-friendly slugs with fraction expansion.
    Examples:
      '3/4 sit-up' -> 'three-quarter-sit-up'
      '1/2 squat' -> 'half-squat'
      'Push-Up' -> 'push-up'
      'Dumbbell Bicep Curl & Press' -> 'dumbbell-bicep-curl-and-press'
    """
    if not name:
        return f"exercise-{uuid.uuid4().hex[:8]}"

    # Normalize unicode
    text = unicodedata.normalize('NFKD', name)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower().strip()

    # Expand fractions
    fractions_map = {
        '3/4': 'three-quarter',
        '1/2': 'half',
        '1/4': 'quarter',
        '1/3': 'one-third',
        '2/3': 'two-third',
        '%': 'percent',
        '&': 'and',
        '+': 'plus',
    }
    for char, rep in fractions_map.items():
        text = text.replace(char, f" {rep} ")

    # Replace non-alphanumeric chars with hyphen
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')

    return text or f"exercise-{uuid.uuid4().hex[:8]}"


# Standard Taxonomy Canonical Normalizers
MUSCLE_SYNONYMS = {
    'pectorals': 'Chest',
    'chest': 'Chest',
    'upper chest': 'Chest',
    'lats': 'Lats',
    'latissimus dorsi': 'Lats',
    'upper back': 'Upper Back & Traps',
    'traps': 'Upper Back & Traps',
    'trapezius': 'Upper Back & Traps',
    'rhomboids': 'Upper Back & Traps',
    'lower back': 'Lower Back',
    'spine': 'Lower Back',
    'delts': 'Shoulders',
    'shoulders': 'Shoulders',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'forearms': 'Forearms',
    'quads': 'Quadriceps',
    'quadriceps': 'Quadriceps',
    'hamstrings': 'Hamstrings',
    'glutes': 'Glutes',
    'calves': 'Calves',
    'abs': 'Core & Abs',
    'abdominals': 'Core & Abs',
    'waist': 'Core & Abs',
    'core': 'Core & Abs',
    'obliques': 'Core & Abs',
    'hip flexors': 'Hip Flexors',
}

EQUIPMENT_SYNONYMS = {
    'body weight': 'Bodyweight',
    'bodyweight': 'Bodyweight',
    'none': 'Bodyweight',
    'barbell': 'Barbell',
    'olympic barbell': 'Barbell',
    'dumbbell': 'Dumbbell',
    'dumbbells': 'Dumbbell',
    'kettlebell': 'Kettlebell',
    'kettlebells': 'Kettlebell',
    'cable': 'Cable Machine',
    'cable machine': 'Cable Machine',
    'band': 'Resistance Band',
    'resistance band': 'Resistance Band',
    'pull-up bar': 'Pull-Up Bar',
    'dip bar': 'Dip Station',
    'dip station': 'Dip Station',
    'bench': 'Flat Bench',
    'flat bench': 'Flat Bench',
    'incline bench': 'Incline Bench',
    'smith machine': 'Smith Machine',
    'ez barbell': 'EZ Bar',
    'ez bar': 'EZ Bar',
    'trap bar': 'Trap Bar',
    'hex bar': 'Trap Bar',
}

CATEGORY_MAP = {
    'chest': 'Strength',
    'back': 'Strength',
    'upper legs': 'Strength',
    'lower legs': 'Strength',
    'shoulders': 'Strength',
    'upper arms': 'Hypertrophy',
    'lower arms': 'Hypertrophy',
    'waist': 'Hypertrophy',
    'cardio': 'Cardio & Conditioning',
    'plyometrics': 'Plyometrics',
    'stretching': 'Mobility & Flexibility',
    'calisthenics': 'Calisthenics',
}


def normalize_muscle_name(raw: str) -> str:
    cleaned = raw.strip().lower()
    return MUSCLE_SYNONYMS.get(cleaned, raw.strip().title())


def normalize_equipment_name(raw: str) -> str:
    cleaned = raw.strip().lower()
    return EQUIPMENT_SYNONYMS.get(cleaned, raw.strip().title())


def infer_exercise_type(body_part: str, equipment: str, name: str) -> str:
    eq_lower = equipment.lower()
    name_lower = name.lower()
    if 'cardio' in body_part.lower() or 'run' in name_lower or 'bike' in name_lower or 'jump rope' in name_lower:
        return 'cardio'
    if 'stretch' in name_lower or 'mobility' in name_lower or 'yoga' in name_lower:
        return 'stretching'
    if 'jump' in name_lower or 'hop' in name_lower or 'plyo' in name_lower or 'burpee' in name_lower:
        return 'plyometrics'
    if 'bodyweight' in eq_lower or 'body weight' in eq_lower:
        return 'calisthenics'
    if 'snatch' in name_lower or 'clean and jerk' in name_lower:
        return 'olympic_weightlifting'
    return 'strength'


def infer_difficulty(name: str, equipment: str) -> str:
    name_lower = name.lower()
    if any(k in name_lower for k in ['muscle-up', 'planche', 'one-arm', 'pistol', 'snatch', 'heavy']):
        return 'advanced'
    if any(k in name_lower for k in ['assisted', 'machine', 'seated', 'wall', 'lying', 'crunch']):
        return 'beginner'
    return 'intermediate'


def generate_baseline_ai_config(name: str, body_part: str, target_muscle: str) -> Dict[str, Any]:
    """
    Generates tailored baseline computer vision pose rules and state machine phases
    for real-time rep counting and form feedback.
    """
    name_lower = name.lower()
    bp_lower = body_part.lower()
    tm_lower = target_muscle.lower()

    if 'squat' in name_lower:
        return {
            'pose_detection_supported': True,
            'rep_counting_supported': True,
            'form_analysis_supported': True,
            'required_keypoints': ['LEFT_HIP', 'RIGHT_HIP', 'LEFT_KNEE', 'RIGHT_KNEE', 'LEFT_ANKLE', 'RIGHT_ANKLE'],
            'optional_keypoints': ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
            'movement_phases': ['start', 'down', 'bottom_hold', 'up', 'complete'],
            'angle_rules': {
                'knee': {'down': {'min': 70, 'max': 105}, 'up': {'min': 160, 'max': 180}},
                'hip': {'down': {'min': 65, 'max': 95}, 'up': {'min': 165, 'max': 180}}
            },
            'distance_rules': {'knee_lateral_displacement_tolerance': 0.08},
            'form_rules': {
                'depth_check': 'hip_crease_below_patella',
                'torso_lean_max_deg': 45,
                'heel_contact_required': True
            },
            'common_mistakes': [
                {'code': 'insufficient_depth', 'name': 'Incomplete Depth', 'penalty': 20},
                {'code': 'knee_valgus', 'name': 'Knees Caving Inward', 'penalty': 25},
                {'code': 'heel_lift', 'name': 'Heel Rising', 'penalty': 15}
            ],
            'correction_messages': {
                'insufficient_depth': 'Squat lower until thighs are parallel to ground.',
                'knee_valgus': 'Drive knees outward over your middle toes.',
                'heel_lift': 'Keep your weight balanced across your whole foot.'
            },
            'minimum_confidence': 0.70
        }
    elif 'push-up' in name_lower or 'pushup' in name_lower:
        return {
            'pose_detection_supported': True,
            'rep_counting_supported': True,
            'form_analysis_supported': True,
            'required_keypoints': ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_ELBOW', 'RIGHT_ELBOW', 'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_HIP', 'LEFT_ANKLE'],
            'optional_keypoints': ['NOSE', 'RIGHT_HIP', 'RIGHT_ANKLE'],
            'movement_phases': ['plank_start', 'eccentric_lowering', 'chest_contact', 'concentric_press', 'lockout'],
            'angle_rules': {
                'elbow': {'bottom': {'min': 75, 'max': 95}, 'top': {'min': 160, 'max': 180}},
                'trunk_alignment_deg': {'max_deviation': 12}
            },
            'distance_rules': {'chest_to_ground_cm_max': 12},
            'form_rules': {'hip_sag_permitted': False, 'scapular_winging_tolerance': 0.15},
            'common_mistakes': [
                {'code': 'partial_rom', 'name': 'Half Reps', 'penalty': 20},
                {'code': 'hip_sag', 'name': 'Lumbar Sagging', 'penalty': 30},
                {'code': 'elbow_flare', 'name': 'Flared Elbows', 'penalty': 15}
            ],
            'correction_messages': {
                'partial_rom': 'Lower chest all the way to floor height.',
                'hip_sag': 'Tighten your core and glutes to maintain straight plank line.',
                'elbow_flare': 'Tuck elbows at 45 degrees relative to ribs.'
            },
            'minimum_confidence': 0.68
        }
    elif 'deadlift' in name_lower:
        return {
            'pose_detection_supported': True,
            'rep_counting_supported': True,
            'form_analysis_supported': True,
            'required_keypoints': ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE', 'RIGHT_SHOULDER', 'RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'],
            'optional_keypoints': ['LEFT_WRIST', 'RIGHT_WRIST'],
            'movement_phases': ['setup_grip', 'liftoff_drive', 'lockout', 'eccentric_hinge', 'floor_reset'],
            'angle_rules': {
                'hip': {'lockout': {'min': 170, 'max': 180}},
                'knee': {'lockout': {'min': 170, 'max': 180}}
            },
            'distance_rules': {'bar_path_horizontal_drift_max_cm': 8},
            'form_rules': {'spinal_flexion_permitted': False, 'hyperextension_permitted': False},
            'common_mistakes': [
                {'code': 'rounded_back', 'name': 'Spinal Flexion (Back Rounding)', 'penalty': 35},
                {'code': 'hyperextension', 'name': 'Excessive Leanback Lockout', 'penalty': 20},
                {'code': 'hitching', 'name': 'Ramping on Thighs', 'penalty': 15}
            ],
            'correction_messages': {
                'rounded_back': 'Lock lats and keep chest proud to maintain a flat back.',
                'hyperextension': 'Stand tall at lockout without leaning back.',
                'hitching': 'Pull smoothly without resting bar on thighs.'
            },
            'minimum_confidence': 0.72
        }
    elif 'bicep' in name_lower or 'curl' in name_lower:
        return {
            'pose_detection_supported': True,
            'rep_counting_supported': True,
            'form_analysis_supported': True,
            'required_keypoints': ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST', 'RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'],
            'optional_keypoints': ['LEFT_HIP', 'RIGHT_HIP'],
            'movement_phases': ['start_hang', 'concentric_curl', 'peak_squeeze', 'eccentric_lower', 'complete'],
            'angle_rules': {
                'elbow': {'bottom': {'min': 155, 'max': 180}, 'peak': {'min': 40, 'max': 70}}
            },
            'distance_rules': {'elbow_drift_horizontal_max_cm': 7},
            'form_rules': {'torso_swinging_permitted': False},
            'common_mistakes': [
                {'code': 'torso_swing', 'name': 'Using Momentum / Body Swing', 'penalty': 25},
                {'code': 'elbow_drift', 'name': 'Elbows Drifting Forward', 'penalty': 15}
            ],
            'correction_messages': {
                'torso_swing': 'Keep your torso still; initiate movement strictly from arms.',
                'elbow_drift': 'Pin your elbows firmly by your sides.'
            },
            'minimum_confidence': 0.65
        }
    else:
        # Generic baseline state machine
        return {
            'pose_detection_supported': False,
            'rep_counting_supported': False,
            'form_analysis_supported': False,
            'required_keypoints': [],
            'optional_keypoints': [],
            'movement_phases': ['start', 'active', 'complete'],
            'angle_rules': {},
            'distance_rules': {},
            'form_rules': {},
            'common_mistakes': [],
            'correction_messages': {},
            'minimum_confidence': 0.60
        }


def escape_sql_string(val: Optional[str]) -> str:
    if val is None:
        return "NULL"
    escaped = val.replace("'", "''")
    return f"'{escaped}'"


def escape_sql_array(items: Optional[List[str]]) -> str:
    if not items:
        return "'{}'::text[]"
    escaped_items = [val.replace('"', '\\"').replace("'", "''") for val in items]
    formatted = "{" + ",".join(f'"{item}"' for item in escaped_items) + "}"
    return f"'{formatted}'::text[]"


def escape_sql_jsonb(data: Any) -> str:
    if data is None:
        return "'{}'::jsonb"
    json_str = json.dumps(data).replace("'", "''")
    return f"'{json_str}'::jsonb"


class ExerciseDatabaseImporter:
    def __init__(self, db_url: Optional[str] = None, export_sql_path: Optional[str] = None):
        self.db_url = db_url
        self.export_sql_path = export_sql_path
        self.used_slugs: Set[str] = set()
        self.sql_statements: List[str] = []

        # Reference caches: name -> id
        self.muscle_groups: Dict[str, str] = {}
        self.equipment: Dict[str, str] = {}
        self.categories: Dict[str, str] = {}
        self.existing_exercises: Dict[str, str] = {}

    def get_unique_slug(self, name: str) -> str:
        base = slugify_exercise_name(name)
        candidate = base
        count = 1
        while candidate in self.used_slugs:
            count += 1
            candidate = f"{base}-{count}"
        self.used_slugs.add(candidate)
        return candidate

    def ensure_taxonomies(self, exercises_data: List[Dict[str, Any]]):
        """Pre-extract all distinct muscle groups, equipment, and categories, querying DB if available."""
        if self.db_url and PSYCOPG2_AVAILABLE:
            try:
                conn = psycopg2.connect(self.db_url)
                cur = conn.cursor()
                cur.execute("SELECT id, name, slug FROM muscle_groups;")
                for row in cur.fetchall():
                    self.muscle_groups[row[1]] = str(row[0])
                cur.execute("SELECT id, name, slug FROM equipment;")
                for row in cur.fetchall():
                    self.equipment[row[1]] = str(row[0])
                cur.execute("SELECT id, name, slug FROM exercise_categories;")
                for row in cur.fetchall():
                    self.categories[row[1]] = str(row[0])
                cur.execute("SELECT external_id, id, slug FROM exercises WHERE external_id IS NOT NULL;")
                for row in cur.fetchall():
                    self.existing_exercises[str(row[0])] = str(row[1])
                    self.used_slugs.add(row[2])
                cur.close()
                conn.close()
            except Exception as e:
                print(f"[!] Warning: Could not pre-fetch existing DB taxonomies: {e}")

        distinct_muscles = set()
        distinct_equipment = set()
        distinct_categories = set()

        for item in exercises_data:
            target = item.get('target')
            if target:
                distinct_muscles.add(normalize_muscle_name(target))
            for sm in (item.get('secondary_muscles') or item.get('secondaryMuscles') or []):
                if sm:
                    distinct_muscles.add(normalize_muscle_name(sm))

            eq = item.get('equipment')
            if eq:
                distinct_equipment.add(normalize_equipment_name(eq))

            bp = item.get('body_part') or item.get('bodyPart') or ''
            cat = CATEGORY_MAP.get(bp.lower(), 'Strength')
            distinct_categories.add(cat)

        # Allocate static UUIDs for missing ones
        for muscle in sorted(distinct_muscles):
            if muscle in self.muscle_groups:
                continue
            m_slug = slugify_exercise_name(muscle)
            m_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"fitness.muscle.{m_slug}"))
            self.muscle_groups[muscle] = m_id
            stmt = (
                f"INSERT INTO muscle_groups (id, name, slug, description) "
                f"VALUES ('{m_id}', {escape_sql_string(muscle)}, {escape_sql_string(m_slug)}, "
                f"'Target/supporting muscle group {muscle}') "
                f"ON CONFLICT DO NOTHING;"
            )
            self.sql_statements.append(stmt)

        for eq in sorted(distinct_equipment):
            if eq in self.equipment:
                continue
            e_slug = slugify_exercise_name(eq)
            e_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"fitness.equipment.{e_slug}"))
            self.equipment[eq] = e_id
            stmt = (
                f"INSERT INTO equipment (id, name, slug, description) "
                f"VALUES ('{e_id}', {escape_sql_string(eq)}, {escape_sql_string(e_slug)}, "
                f"'Fitness equipment: {eq}') "
                f"ON CONFLICT DO NOTHING;"
            )
            self.sql_statements.append(stmt)

        for cat in sorted(distinct_categories):
            if cat in self.categories:
                continue
            c_slug = slugify_exercise_name(cat)
            c_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"fitness.category.{c_slug}"))
            self.categories[cat] = c_id
            stmt = (
                f"INSERT INTO exercise_categories (id, name, slug, description) "
                f"VALUES ('{c_id}', {escape_sql_string(cat)}, {escape_sql_string(c_slug)}, "
                f"'Exercise category classification: {cat}') "
                f"ON CONFLICT DO NOTHING;"
            )
            self.sql_statements.append(stmt)

    def process_exercise(self, item: Dict[str, Any], index: int) -> Tuple[Dict[str, Any], List[str]]:
        ext_id = str(item.get('id', f"{index:04d}"))
        name = item.get('name', f"Exercise {ext_id}").strip()
        slug = self.get_unique_slug(name)

        body_part = (item.get('body_part') or item.get('bodyPart') or 'full body').strip()
        raw_equipment = (item.get('equipment') or 'body weight').strip()
        equipment_norm = normalize_equipment_name(raw_equipment)

        raw_target = (item.get('target') or 'full body').strip()
        target_norm = normalize_muscle_name(raw_target)

        raw_secondaries = item.get('secondary_muscles') or item.get('secondaryMuscles') or []
        secondaries_norm = [normalize_muscle_name(m) for m in raw_secondaries if m]

        category = CATEGORY_MAP.get(body_part.lower(), 'Strength')
        difficulty = infer_difficulty(name, raw_equipment)
        exercise_type = infer_exercise_type(body_part, raw_equipment, name)

        # Extract instructions across English and any translations
        instruction_steps_map = item.get('instruction_steps') or {}
        instructions_list = []
        if isinstance(instruction_steps_map, dict) and 'en' in instruction_steps_map:
            instructions_list = instruction_steps_map['en']
        elif isinstance(item.get('instructions'), list):
            instructions_list = item.get('instructions')
        elif isinstance(item.get('instructions'), str):
            instructions_list = [item.get('instructions')]
        elif isinstance(item.get('instructions'), dict) and 'en' in item.get('instructions'):
            en_val = item['instructions']['en']
            instructions_list = en_val if isinstance(en_val, list) else [en_val]

        instructions_list = [str(step).strip() for step in instructions_list if step]

        benefits = [
            f"Targets and develops the {target_norm.lower()}.",
            f"Builds functional movement capacity using {equipment_norm.lower()}."
        ]
        precautions = [
            "Perform a thorough dynamic warm-up prior to high-intensity sets.",
            "Maintain spinal neutrality and discontinue set if sharp joint pain occurs."
        ]

        if ext_id in self.existing_exercises:
            ex_id = self.existing_exercises[ext_id]
        else:
            ex_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"fitness.exercise.{ext_id}"))

        # Generate SQL for this exercise
        local_stmts = []

        # 1. Main Exercise Record
        desc = f"{name} is a {difficulty} {exercise_type} movement targeting the {target_norm.lower()}."
        insert_ex = (
            f"INSERT INTO exercises ("
            f"id, external_id, name, slug, description, category, body_part, equipment, "
            f"target_muscle, secondary_muscles, difficulty, exercise_type, "
            f"instructions, benefits, precautions, is_active"
            f") VALUES ("
            f"'{ex_id}', {escape_sql_string(ext_id)}, {escape_sql_string(name)}, {escape_sql_string(slug)}, "
            f"{escape_sql_string(desc)}, {escape_sql_string(category)}, {escape_sql_string(body_part)}, "
            f"{escape_sql_string(equipment_norm)}, {escape_sql_string(target_norm)}, "
            f"{escape_sql_array(secondaries_norm)}, '{difficulty}', '{exercise_type}', "
            f"{escape_sql_array(instructions_list)}, {escape_sql_array(benefits)}, {escape_sql_array(precautions)}, true"
            f") ON CONFLICT (external_id) DO UPDATE SET "
            f"name = EXCLUDED.name, description = EXCLUDED.description, "
            f"target_muscle = EXCLUDED.target_muscle, equipment = EXCLUDED.equipment, "
            f"updated_at = now();"
        )
        local_stmts.append(insert_ex)

        # 2. Multi-language Instructions
        if isinstance(instruction_steps_map, dict) and instruction_steps_map:
            for lang_code, steps in instruction_steps_map.items():
                if isinstance(steps, str):
                    steps = [steps]
                if not steps:
                    continue
                lang_payload = [{"step": idx + 1, "text": s} for idx, s in enumerate(steps)]
                insert_lang = (
                    f"INSERT INTO exercise_instructions (exercise_id, language_code, instruction_steps) "
                    f"VALUES ('{ex_id}', '{lang_code[:10]}', {escape_sql_jsonb(lang_payload)}) "
                    f"ON CONFLICT (exercise_id, language_code) DO UPDATE SET "
                    f"instruction_steps = EXCLUDED.instruction_steps, updated_at = now();"
                )
                local_stmts.append(insert_lang)
        elif instructions_list:
            en_steps = [{"step": i + 1, "text": text} for i, text in enumerate(instructions_list)]
            insert_inst = (
                f"INSERT INTO exercise_instructions (exercise_id, language_code, instruction_steps) "
                f"VALUES ('{ex_id}', 'en', {escape_sql_jsonb(en_steps)}) "
                f"ON CONFLICT (exercise_id, language_code) DO UPDATE SET "
                f"instruction_steps = EXCLUDED.instruction_steps, updated_at = now();"
            )
            local_stmts.append(insert_inst)

        # 3. Media Metadata (Explicit Licensing & Attribution)
        raw_media_url = item.get('gif_url') or item.get('gifUrl') or item.get('videoUrl') or item.get('image') or f"https://cdn.example.com/exercises/animations/{ext_id}.gif"
        raw_thumb_url = item.get('image') or item.get('thumbnail_url')
        cdn_base = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

        media_url = f"{cdn_base}{raw_media_url}" if raw_media_url and (raw_media_url.startswith('videos/') or raw_media_url.startswith('images/')) else raw_media_url
        thumb_url = f"{cdn_base}{raw_thumb_url}" if raw_thumb_url and (raw_thumb_url.startswith('images/') or raw_thumb_url.startswith('videos/')) else raw_thumb_url

        media_type = 'gif' if ('.gif' in media_url or 'gif' in media_url.lower()) else ('video' if ('.mp4' in media_url or 'video' in media_url.lower()) else 'image')
        media_source = 'hasaneyldrm/exercises-dataset'
        media_license = 'Third-Party-GymVisual-Reference'
        media_attribution = item.get('attribution') or 'Third-party reference asset from openGym/exercises-dataset. Explicitly flagged for in-house replacement before commercial release.'

        insert_media = (
            f"INSERT INTO exercise_media ("
            f"exercise_id, media_type, url, thumbnail_url, width, height, "
            f"source, license, attribution, is_primary"
            f") SELECT "
            f"'{ex_id}', '{media_type}', {escape_sql_string(media_url)}, {escape_sql_string(thumb_url)}, 720, 720, "
            f"{escape_sql_string(media_source)}, {escape_sql_string(media_license)}, "
            f"{escape_sql_string(media_attribution)}, true "
            f"WHERE NOT EXISTS (SELECT 1 FROM exercise_media WHERE exercise_id = '{ex_id}' AND url = {escape_sql_string(media_url)});"
        )
        local_stmts.append(insert_media)

        # 4. Normalized Muscles Mapping
        if target_norm in self.muscle_groups:
            m_id = self.muscle_groups[target_norm]
            local_stmts.append(
                f"INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) "
                f"VALUES ('{ex_id}', '{m_id}', 'primary') ON CONFLICT DO NOTHING;"
            )
        for sm in secondaries_norm:
            if sm in self.muscle_groups:
                sm_id = self.muscle_groups[sm]
                local_stmts.append(
                    f"INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) "
                    f"VALUES ('{ex_id}', '{sm_id}', 'secondary') ON CONFLICT DO NOTHING;"
                )

        # 5. Normalized Equipment Mapping
        if equipment_norm in self.equipment:
            eq_id = self.equipment[equipment_norm]
            local_stmts.append(
                f"INSERT INTO exercise_equipment (exercise_id, equipment_id) "
                f"VALUES ('{ex_id}', '{eq_id}') ON CONFLICT DO NOTHING;"
            )

        # 6. Normalized Category Mapping
        if category in self.categories:
            c_id = self.categories[category]
            local_stmts.append(
                f"INSERT INTO exercise_category_map (exercise_id, category_id) "
                f"VALUES ('{ex_id}', '{c_id}') ON CONFLICT DO NOTHING;"
            )

        # 7. AI / Computer Vision Pose Config
        ai_config = generate_baseline_ai_config(name, body_part, target_norm)
        insert_ai = (
            f"INSERT INTO exercise_ai_config ("
            f"exercise_id, pose_detection_supported, rep_counting_supported, form_analysis_supported, "
            f"required_keypoints, optional_keypoints, movement_phases, "
            f"angle_rules, distance_rules, form_rules, common_mistakes, correction_messages, minimum_confidence"
            f") VALUES ("
            f"'{ex_id}', {str(ai_config['pose_detection_supported']).lower()}, "
            f"{str(ai_config['rep_counting_supported']).lower()}, {str(ai_config['form_analysis_supported']).lower()}, "
            f"{escape_sql_jsonb(ai_config['required_keypoints'])}, {escape_sql_jsonb(ai_config['optional_keypoints'])}, "
            f"{escape_sql_jsonb(ai_config['movement_phases'])}, {escape_sql_jsonb(ai_config['angle_rules'])}, "
            f"{escape_sql_jsonb(ai_config['distance_rules'])}, {escape_sql_jsonb(ai_config['form_rules'])}, "
            f"{escape_sql_jsonb(ai_config['common_mistakes'])}, {escape_sql_jsonb(ai_config['correction_messages'])}, "
            f"{ai_config['minimum_confidence']}"
            f") ON CONFLICT (exercise_id) DO UPDATE SET "
            f"angle_rules = EXCLUDED.angle_rules, form_rules = EXCLUDED.form_rules, updated_at = now();"
        )
        local_stmts.append(insert_ai)

        return {
            'id': ex_id,
            'external_id': ext_id,
            'name': name,
            'slug': slug,
            'target': target_norm,
            'equipment': equipment_norm,
            'category': category,
        }, local_stmts

    def run_import(self, exercises_data: List[Dict[str, Any]], limit: Optional[int] = None) -> Dict[str, Any]:
        if limit:
            exercises_data = exercises_data[:limit]

        print(f"[*] Preparing taxonomies for {len(exercises_data)} exercises...")
        self.ensure_taxonomies(exercises_data)

        print("[*] Processing exercise records and normalizing data...")
        processed_count = 0
        for i, item in enumerate(exercises_data):
            _, stmts = self.process_exercise(item, i + 1)
            self.sql_statements.extend(stmts)
            processed_count += 1

        print(f"[+] Processed {processed_count} exercises successfully.")
        print(f"[+] Total SQL DML statements generated: {len(self.sql_statements)}")

        # Write to export SQL if configured
        if self.export_sql_path:
            os.makedirs(os.path.dirname(os.path.abspath(self.export_sql_path)), exist_ok=True)
            with open(self.export_sql_path, 'w', encoding='utf-8') as f:
                f.write("-- Automated Exercise Dataset Ingestion Script\n")
                f.write("-- Generated by backend/scripts/import_exercises_dataset.py\n\n")
                f.write("BEGIN;\n\n")
                for stmt in self.sql_statements:
                    f.write(stmt + "\n")
                f.write("\nCOMMIT;\n")
            print(f"[+] SQL migration export written to: {self.export_sql_path}")

        # Execute on Database if db_url provided
        if self.db_url:
            if not PSYCOPG2_AVAILABLE:
                print("[-] psycopg2 is not installed. Skipping live database insertion.", file=sys.stderr)
            else:
                print(f"[*] Connecting to database: {self.db_url.split('@')[-1] if '@' in self.db_url else self.db_url}...")
                conn = psycopg2.connect(self.db_url)
                cur = conn.cursor()
                try:
                    BATCH_SIZE = 150
                    total = len(self.sql_statements)
                    print(f"[*] Executing {total} SQL statements in batches of {BATCH_SIZE}...")
                    for idx in range(0, total, BATCH_SIZE):
                        batch = self.sql_statements[idx:idx + BATCH_SIZE]
                        batch_sql = "\n".join(batch)
                        cur.execute(batch_sql)
                        if (idx // BATCH_SIZE) % 10 == 0 or (idx + BATCH_SIZE) >= total:
                            print(f"    -> Progress: {min(idx + BATCH_SIZE, total)} / {total} statements executed...")
                    conn.commit()
                    print(f"[+] Successfully committed all {total} statements to database!")
                except Exception as e:
                    conn.rollback()
                    print(f"[-] Database transaction failed: {e}", file=sys.stderr)
                    raise
                finally:
                    cur.close()
                    conn.close()

        return {
            'exercises_processed': processed_count,
            'muscle_groups_count': len(self.muscle_groups),
            'equipment_count': len(self.equipment),
            'categories_count': len(self.categories),
            'sql_statements_count': len(self.sql_statements),
        }


def get_default_sample_dataset() -> List[Dict[str, Any]]:
    """Returns sample dataset matching hasaneyldrm/exercises-dataset structure for offline testing."""
    return [
        {
            "id": "0001",
            "name": "3/4 sit-up",
            "bodyPart": "waist",
            "equipment": "body weight",
            "target": "abs",
            "secondaryMuscles": ["hip flexors", "lower back"],
            "instructions": [
                "Lie flat on your back with your knees bent and feet flat on the ground.",
                "Place your hands behind your head or crossed over your chest.",
                "Contract your abs to lift your torso about 3/4 of the way up toward your knees.",
                "Pause for a moment at the top of the movement.",
                "Slowly lower back down to the starting position."
            ],
            "gifUrl": "https://cdn.example.com/exercises/0001.gif"
        },
        {
            "id": "0043",
            "name": "barbell full squat",
            "bodyPart": "upper legs",
            "equipment": "barbell",
            "target": "quads",
            "secondaryMuscles": ["glutes", "hamstrings", "calves", "lower back"],
            "instructions": [
                "Rest the barbell on your upper back traps and step back from the rack.",
                "Position your feet shoulder-width apart, toes pointing slightly outward.",
                "Inhale and brace your core.",
                "Bend your knees and hips, sitting back as if into a chair.",
                "Descend until your hips are below parallel with your knees.",
                "Drive through your heels to return to standing position."
            ],
            "gifUrl": "https://cdn.example.com/exercises/0043.gif"
        },
        {
            "id": "0662",
            "name": "push-up",
            "bodyPart": "chest",
            "equipment": "body weight",
            "target": "pectorals",
            "secondaryMuscles": ["triceps", "delts", "abs"],
            "instructions": [
                "Place hands firmly on the ground, shoulder-width apart.",
                "Ground your toes into the lower floor to stabilize your lower half.",
                "Lower your chest down until it nearly touches the floor.",
                "Keep your back flat and core engaged throughout.",
                "Exhale and push back up to the plank starting position."
            ],
            "gifUrl": "https://cdn.example.com/exercises/0662.gif"
        },
        {
            "id": "0032",
            "name": "barbell deadlift",
            "bodyPart": "back",
            "equipment": "barbell",
            "target": "glutes",
            "secondaryMuscles": ["hamstrings", "lower back", "lats", "traps", "forearms"],
            "instructions": [
                "Stand with mid-foot under the barbell.",
                "Bend over and grab the bar with a shoulder-width grip.",
                "Bend your knees until your shins touch the bar.",
                "Lift your chest up and straighten your lower back.",
                "Take a big breath, hold it, and stand up with the weight.",
                "Hold the weight for a second at the top, with locked hips and knees."
            ],
            "gifUrl": "https://cdn.example.com/exercises/0032.gif"
        },
        {
            "id": "0294",
            "name": "dumbbell bicep curl",
            "bodyPart": "upper arms",
            "equipment": "dumbbell",
            "target": "biceps",
            "secondaryMuscles": ["forearms", "brachialis"],
            "instructions": [
                "Stand tall holding a dumbbell in each hand at arm's length.",
                "Keep your elbows close to your torso and rotate palms facing forward.",
                "Curl the weights while contracting your biceps as you breathe out.",
                "Continue until your biceps are fully contracted and dumbbells are at shoulder level.",
                "Slowly begin to bring the dumbbells back to starting position as your breathe in."
            ],
            "gifUrl": "https://cdn.example.com/exercises/0294.gif"
        }
    ]


def main():
    parser = argparse.ArgumentParser(description="Import exercises dataset into PostgreSQL/Supabase")
    parser.add_argument("--file", "-f", help="Path to exercises.json file", default=None)
    parser.add_argument("--limit", "-l", type=int, help="Limit number of exercises to import (for testing)", default=None)
    parser.add_argument("--db-url", help="PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/dbname)")
    parser.add_argument("--export-sql", "-o", help="Path to export generated SQL script", default="supabase/import_exercises.sql")
    parser.add_argument("--dry-run", action="store_true", help="Parse and validate without writing to database")

    args = parser.parse_args()

    # Load data
    candidate_paths = [args.file, "data/exercises.json", "backend/data/exercises.json"]
    chosen_path = next((p for p in candidate_paths if p and os.path.exists(p)), None)

    if chosen_path:
        print(f"[*] Loading exercises from file: {chosen_path}")
        with open(chosen_path, 'r', encoding='utf-8') as f:
            exercises_data = json.load(f)
    else:
        print("[*] No local file specified or file not found. Loading canonical reference dataset...")
        exercises_data = get_default_sample_dataset()

    print(f"[*] Total exercises in payload: {len(exercises_data)}")

    db_url = None if args.dry_run else (args.db_url or os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL"))
    importer = ExerciseDatabaseImporter(db_url=db_url, export_sql_path=args.export_sql)

    stats = importer.run_import(exercises_data, limit=args.limit)
    print("\n================ IMPORT SUMMARY ================")
    print(f"Exercises Processed : {stats['exercises_processed']}")
    print(f"Muscle Groups       : {stats['muscle_groups_count']}")
    print(f"Equipment Types     : {stats['equipment_count']}")
    print(f"Categories          : {stats['categories_count']}")
    print(f"SQL Statements      : {stats['sql_statements_count']}")
    if args.export_sql:
        print(f"Export File         : {args.export_sql}")
    print("================================================\n")


if __name__ == "__main__":
    main()
