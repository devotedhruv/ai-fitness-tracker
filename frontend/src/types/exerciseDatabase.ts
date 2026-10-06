/**
 * TypeScript Interfaces for Exercise Database Architecture (Supabase PostgreSQL)
 */

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ExerciseType =
  | 'strength'
  | 'cardio'
  | 'calisthenics'
  | 'stretching'
  | 'plyometrics'
  | 'olympic_weightlifting'
  | 'powerlifting'
  | 'mobility'
  | 'isometric';

export type MediaType = 'image' | 'gif' | 'video';

export type MuscleRole = 'primary' | 'secondary';

export type ExerciseRelationshipType =
  | 'progression'
  | 'regression'
  | 'alternative'
  | 'variation'
  | 'similar';

export interface Exercise {
  id: string;
  external_id?: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  body_part?: string;
  equipment?: string;
  target_muscle?: string;
  secondary_muscles: string[];
  difficulty: ExerciseDifficulty;
  exercise_type: ExerciseType;
  instructions: string[];
  benefits: string[];
  precautions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstructionStep {
  step: number;
  text: string;
  cue?: string;
}

export interface ExerciseInstruction {
  id: string;
  exercise_id: string;
  language_code: string;
  instruction_steps: InstructionStep[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseMedia {
  id: string;
  exercise_id: string;
  media_type: MediaType;
  url: string;
  thumbnail_url?: string;
  storage_path?: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  source: string;
  license: string;
  attribution?: string;
  is_primary: boolean;
  created_at: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Equipment {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AngleThreshold {
  min?: number;
  max?: number;
}

export interface JointAngleRules {
  down?: AngleThreshold;
  up?: AngleThreshold;
  inflection_bottom?: AngleThreshold;
  lockout?: AngleThreshold;
  [phase: string]: AngleThreshold | undefined;
}

export interface CommonMistake {
  code: string;
  name: string;
  penalty: number;
}

export interface ExerciseAIConfig {
  id: string;
  exercise_id: string;
  pose_detection_supported: boolean;
  rep_counting_supported: boolean;
  form_analysis_supported: boolean;
  required_keypoints: string[];
  optional_keypoints: string[];
  movement_phases: string[];
  angle_rules: Record<string, JointAngleRules>;
  distance_rules: Record<string, any>;
  form_rules: Record<string, any>;
  common_mistakes: CommonMistake[];
  correction_messages: Record<string, string>;
  minimum_confidence: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseVariation {
  id: string;
  exercise_id: string;
  variation_name: string;
  description?: string;
  difficulty_change?: 'easier' | 'harder' | 'same' | 'lateral';
  equipment_change?: string;
  instructions?: string;
  created_at: string;
}

export interface ExerciseRelationship {
  id: string;
  exercise_id: string;
  related_exercise_id: string;
  relationship_type: ExerciseRelationshipType;
  related_exercise?: Partial<Exercise>;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
  calories_burned: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_sets?: number;
  target_reps?: number;
  target_duration_seconds?: number;
}

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps?: number;
  duration_seconds?: number;
  weight?: number;
  rest_seconds?: number;
  form_score?: number;
  ai_confidence?: number;
  completed_at?: string;
}

export interface ExerciseAnalysisSession {
  id: string;
  user_id: string;
  workout_id?: string;
  exercise_id: string;
  started_at: string;
  ended_at?: string;
  total_reps: number;
  correct_reps: number;
  incorrect_reps: number;
  average_form_score?: number;
  average_confidence?: number;
  calories_estimated?: number;
  feedback?: Record<string, any>;
  created_at: string;
}

export interface ExerciseRepAnalysis {
  id: string;
  analysis_session_id: string;
  rep_number: number;
  form_score: number;
  confidence: number;
  is_valid: boolean;
  detected_errors: string[];
  correction_feedback: Record<string, string>;
  keypoint_data: Record<string, any>;
  started_at?: string;
  completed_at?: string;
}

export interface ExerciseSearchResult {
  id: string;
  external_id?: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  body_part?: string;
  equipment?: string;
  target_muscle?: string;
  secondary_muscles: string[];
  difficulty: ExerciseDifficulty;
  exercise_type: ExerciseType;
  instructions: string[];
  is_active: boolean;
  primary_media_url?: string;
  primary_media_type?: MediaType;
  pose_detection_supported: boolean;
  rep_counting_supported: boolean;
  form_analysis_supported: boolean;
  rank_score: number;
}
