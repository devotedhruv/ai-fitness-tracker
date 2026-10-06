/**
 * Supabase User Database & Analytics Data Types
 * =============================================
 * Types for user profiles, custom exercises, streaks & progression,
 * community posts & comments, 1RM personal records, and muscle volume analytics.
 */

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
export type UnitSystem = 'METRIC' | 'IMPERIAL';
export type PostType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'WORKOUT'
  | 'RUN'
  | 'PERSONAL_RECORD'
  | 'STREAK'
  | 'RANK_PROMOTION'
  | 'MILESTONE';

export type MediaType = 'NONE' | 'IMAGE' | 'VIDEO';

export interface UserProfile {
  id: string; // References auth.users(id)
  email?: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  birth_date?: string | null;
  gender?: string | null;
  units: UnitSystem;
  experience_level: ExperienceLevel;
  fitness_goals: string[];
  days_per_week: number;
  preferred_equipment: string[];
  social_links?: Record<string, string>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DayActivityData {
  workouts: number;
  volume_kg: number;
  duration_seconds: number;
  xp: number;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string | null;
  total_workouts: number;
  total_volume_kg: number;
  total_time_seconds: number;
  total_xp: number;
  current_level: number;
  streak_freezes_available: number;
  streak_freezes_used: number;
  activity_matrix: Record<string, DayActivityData>;
  created_at?: string;
  updated_at?: string;
}

export interface CustomExerciseInput {
  name: string;
  body_part: string;
  target_muscle: string;
  secondary_muscles?: string[];
  equipment: string;
  category?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  exercise_type?: 'STRENGTH' | 'CARDIO' | 'HYPERTROPHY' | 'MOBILITY' | 'ENDURANCE';
  instructions: string[];
  tips?: string[];
  media_url?: string;
}

export interface CustomExercise extends CustomExerciseInput {
  id: string;
  user_id: string;
  slug: string;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostInput {
  caption?: string;
  media_url?: string;
  media_type?: MediaType;
  thumbnail_url?: string;
  post_type?: PostType;
  workout_id?: string | null;
  xp_earned?: number;
  metadata?: Record<string, any>;
}

export interface CommunityPost extends CommunityPostInput {
  id: string;
  user_id: string;
  media_type: MediaType;
  post_type: PostType;
  likes_count: number;
  comments_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
  };
  has_liked?: boolean;
}

export interface CommunityPostComment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
  };
}

export interface UserPersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  one_rep_max_est: number; // Epley formula: weight * (1 + reps / 30)
  best_weight_kg: number;
  best_reps: number;
  achieved_at: string;
  workout_set_id?: string | null;
  notes?: string | null;
  created_at?: string;
  exercise?: {
    name: string;
    target_muscle: string;
    body_part: string;
  };
}

export interface UserMuscleVolumeLog {
  id: string;
  user_id: string;
  muscle_group_id: string;
  period_start: string; // YYYY-MM-DD
  total_sets: number;
  total_volume_kg: number;
  average_rpe?: number | null;
  created_at?: string;
  muscle_group?: {
    name: string;
    body_part: string;
  };
}

export interface CompletedWorkoutSetInput {
  set_number: number;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
  form_score?: number;
  ai_confidence?: number;
  completed_at?: string;
}

export interface CompletedWorkoutExerciseInput {
  exercise_id: string;
  order_index: number;
  sets: CompletedWorkoutSetInput[];
}

export interface CompletedWorkoutSessionInput {
  id?: string;
  user_id: string;
  name: string;
  duration_seconds: number;
  calories_burned?: number;
  notes?: string;
  exercises: CompletedWorkoutExerciseInput[];
  xp_earned?: number;
  started_at?: string;
}

export interface WorkoutStreakSummary {
  success: boolean;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  current_level: number;
}
