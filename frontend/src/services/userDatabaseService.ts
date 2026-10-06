/**
 * User Database & Analytics Service for React Native / Supabase
 * ==============================================================
 * Comprehensive service for:
 * 1. User Profiles & ID Registration persistence in Supabase PostgreSQL
 * 2. Custom User Exercise creation, indexing, and retrieval
 * 3. Atomic Workout Tracking & Rep Telemetry persistence for future analytics
 * 4. User Streaks, Gamification (XP, Levels), and Activity Heatmap Matrix
 * 5. Community Social Feed (Posts, Likes, Comments)
 * 6. Analytics Engine (1RM PRs, Muscle Volume Logs, Heatmaps)
 */

import { supabase as defaultSupabase } from './supabaseClient';
import {
  UserProfile,
  UserStreak,
  CustomExercise,
  CustomExerciseInput,
  CommunityPost,
  CommunityPostInput,
  CommunityPostComment,
  UserPersonalRecord,
  UserMuscleVolumeLog,
  CompletedWorkoutSessionInput,
  WorkoutStreakSummary,
  DayActivityData,
} from '../types/userDatabase';

export class UserDatabaseService {
  private client: any;

  constructor(supabaseClient?: any) {
    this.client = supabaseClient || defaultSupabase;
  }

  // --------------------------------------------------------------------------
  // Helper: Slug generator
  // --------------------------------------------------------------------------
  private generateSlug(name: string): string {
    const clean = name
      .toLowerCase()
      .trim()
      .replace(/3\/4/g, 'three-quarter')
      .replace(/1\/2/g, 'half')
      .replace(/1\/4/g, 'quarter')
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return clean ? `${clean}-${randomSuffix}` : `exercise-${randomSuffix}`;
  }

  // ==========================================================================
  // 1. User Profile Management
  // ==========================================================================

  /**
   * Fetch user profile from Supabase user_profiles table
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[UserDatabaseService] getUserProfile error:', error);
      throw error;
    }

    return data as UserProfile | null;
  }

  /**
   * Create or update user profile with fitness details, biometrics, and preferences
   */
  async upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const payload = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('user_profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[UserDatabaseService] upsertUserProfile error:', error);
      throw error;
    }

    return data as UserProfile;
  }

  // ==========================================================================
  // 2. Custom Exercises Created by User
  // ==========================================================================

  /**
   * Save a custom exercise created by the user into the Supabase database
   */
  async createCustomExercise(userId: string, input: CustomExerciseInput): Promise<CustomExercise> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const slug = this.generateSlug(input.name);

    const exercisePayload = {
      name: input.name,
      slug,
      user_id: userId,
      is_custom: true,
      is_active: true,
      body_part: (input.body_part || 'other').toLowerCase(),
      target_muscle: (input.target_muscle || 'other').toLowerCase(),
      secondary_muscles: (input.secondary_muscles || []).map((m) => m.toLowerCase()),
      equipment: (input.equipment || 'bodyweight').toLowerCase(),
      category: input.category || 'General',
      difficulty: (input.difficulty || 'intermediate').toLowerCase(),
      exercise_type: (input.exercise_type || 'strength').toLowerCase(),
      instructions: input.instructions,
      tips: input.tips || [],
    };

    const { data: exerciseData, error: exError } = await this.client
      .from('exercises')
      .insert(exercisePayload)
      .select()
      .single();

    if (exError || !exerciseData) {
      console.error('[UserDatabaseService] createCustomExercise error:', exError);
      throw exError;
    }

    // If media URL is provided, also insert into exercise_media
    if (input.media_url) {
      const mediaPayload = {
        exercise_id: exerciseData.id,
        media_url: input.media_url,
        media_type: 'video',
        is_primary: true,
        license: 'user_uploaded',
      };
      await this.client.from('exercise_media').insert(mediaPayload).catch((e: any) => {
        console.warn('[UserDatabaseService] Warning inserting exercise_media:', e);
      });
    }

    return exerciseData as CustomExercise;
  }

  /**
   * Retrieve all custom exercises created by a specific user
   */
  async getCustomExercises(userId: string): Promise<CustomExercise[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .eq('is_custom', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[UserDatabaseService] getCustomExercises error:', error);
      throw error;
    }

    return (data || []) as CustomExercise[];
  }

  /**
   * Delete or archive a custom exercise created by user
   */
  async deleteCustomExercise(exerciseId: string, userId: string): Promise<boolean> {
    if (!this.client) return false;

    const { error } = await this.client
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('user_id', userId)
      .eq('is_custom', true);

    if (error) {
      console.error('[UserDatabaseService] deleteCustomExercise error:', error);
      throw error;
    }

    return true;
  }

  // ==========================================================================
  // 3. User Streaks & Gamification Progression
  // ==========================================================================

  /**
   * Fetch current streak, XP, level, and 365-day activity matrix heatmap
   */
  async getUserStreak(userId: string): Promise<UserStreak | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[UserDatabaseService] getUserStreak error:', error);
      throw error;
    }

    return data as UserStreak | null;
  }

  /**
   * Complete a workout session and atomically update streak, XP, level, and heatmap
   */
  async recordWorkoutCompletion(params: {
    workoutId?: string | null;
    userId: string;
    totalVolumeKg: number;
    durationSeconds: number;
    xpEarned?: number;
  }): Promise<WorkoutStreakSummary> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client.rpc('record_completed_workout', {
      p_workout_id: params.workoutId || null,
      p_user_id: params.userId,
      p_total_volume_kg: params.totalVolumeKg,
      p_duration_seconds: params.durationSeconds,
      p_xp_earned: params.xpEarned || 50,
    });

    if (error) {
      console.error('[UserDatabaseService] recordWorkoutCompletion RPC error:', error);
      throw error;
    }

    return data as WorkoutStreakSummary;
  }

  // ==========================================================================
  // 4. End-to-End Workout Session Persistence (Workouts, Sets & PR Tracking)
  // ==========================================================================

  /**
   * Save a complete workout session with all exercises, sets, volume, and automatic PR calculations
   */
  async saveCompletedWorkoutSession(
    session: CompletedWorkoutSessionInput
  ): Promise<{ workoutId: string; streakSummary: WorkoutStreakSummary }> {
    if (!this.client) throw new Error('Supabase client not initialized');

    // 1. Calculate total session volume
    let totalVolumeKg = 0;
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        if (s.weight && s.reps) {
          totalVolumeKg += Number(s.weight) * Number(s.reps);
        }
      }
    }
    totalVolumeKg = Math.round(totalVolumeKg * 100) / 100;

    // 2. Insert main workout record
    const workoutPayload: Record<string, any> = {
      user_id: session.user_id,
      name: session.name,
      started_at: session.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: session.duration_seconds,
      calories_burned: session.calories_burned || 0,
      notes: session.notes || null,
      status: 'completed',
      total_volume_kg: totalVolumeKg,
    };

    if (session.id) {
      workoutPayload.id = session.id;
    }

    const { data: workoutData, error: wError } = await this.client
      .from('workouts')
      .insert(workoutPayload)
      .select('id')
      .single();

    if (wError || !workoutData) {
      console.error('[UserDatabaseService] saveCompletedWorkoutSession workout insert error:', wError);
      throw wError;
    }

    const workoutId = workoutData.id;

    // 3. Insert workout exercises & sets
    for (const ex of session.exercises) {
      const { data: weData, error: weError } = await this.client
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          target_sets: ex.sets.length,
        })
        .select('id')
        .single();

      if (weError || !weData) {
        console.error('[UserDatabaseService] workout_exercises insert error:', weError);
        continue;
      }

      const workoutExerciseId = weData.id;

      // Insert sets
      const setPayloads = ex.sets.map((s) => ({
        workout_exercise_id: workoutExerciseId,
        set_number: s.set_number,
        reps: s.reps || 0,
        weight: s.weight || 0,
        duration_seconds: s.duration_seconds || 0,
        form_score: s.form_score || null,
        ai_confidence: s.ai_confidence || null,
        completed_at: s.completed_at || new Date().toISOString(),
      }));

      const { data: insertedSets, error: setErr } = await this.client
        .from('exercise_sets')
        .insert(setPayloads)
        .select();

      if (setErr) {
        console.error('[UserDatabaseService] exercise_sets insert error:', setErr);
      } else if (insertedSets) {
        // 4. Check for Personal Records on heavy lifts
        for (const setRow of insertedSets) {
          if (setRow.weight > 0 && setRow.reps > 0) {
            await this.evaluatePersonalRecord(
              session.user_id,
              ex.exercise_id,
              setRow.weight,
              setRow.reps,
              setRow.id
            );
          }
        }
      }
    }

    // 5. Update user streak, XP, and heatmap matrix via RPC
    const streakSummary = await this.recordWorkoutCompletion({
      workoutId,
      userId: session.user_id,
      totalVolumeKg,
      durationSeconds: session.duration_seconds,
      xpEarned: session.xp_earned || 50,
    });

    return { workoutId, streakSummary };
  }

  /**
   * Helper: Check if a set establishes a new 1RM Personal Record, and persist it
   */
  private async evaluatePersonalRecord(
    userId: string,
    exerciseId: string,
    weight: number,
    reps: number,
    setId?: string
  ): Promise<void> {
    try {
      // Epley Formula: 1RM = Weight * (1 + Reps / 30)
      const est1RM = Math.round(weight * (1 + reps / 30) * 100) / 100;

      const { data: existingPR } = await this.client
        .from('user_personal_records')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('one_rep_max_est', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingPR || est1RM > Number(existingPR.one_rep_max_est)) {
        await this.client.from('user_personal_records').insert({
          user_id: userId,
          exercise_id: exerciseId,
          one_rep_max_est: est1RM,
          best_weight_kg: weight,
          best_reps: reps,
          achieved_at: new Date().toISOString(),
          workout_set_id: setId || null,
        });
      }
    } catch (err) {
      console.warn('[UserDatabaseService] Warning evaluating personal record:', err);
    }
  }

  // ==========================================================================
  // 5. Community Posts & Social Feed
  // ==========================================================================

  /**
   * Create a community post in Supabase database
   */
  async createCommunityPost(
    userId: string,
    input: CommunityPostInput
  ): Promise<CommunityPost> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const postPayload = {
      user_id: userId,
      caption: input.caption || null,
      media_url: input.media_url || null,
      media_type: input.media_type || 'NONE',
      thumbnail_url: input.thumbnail_url || null,
      post_type: input.post_type || 'TEXT',
      workout_id: input.workout_id || null,
      xp_earned: input.xp_earned || 0,
      metadata: input.metadata || {},
    };

    const { data, error } = await this.client
      .from('community_posts')
      .insert(postPayload)
      .select('*, author:user_profiles!user_id(username, display_name, avatar_url)')
      .single();

    if (error) {
      console.error('[UserDatabaseService] createCommunityPost error:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  /**
   * Retrieve community feed with optional filters, pagination, and user like status
   */
  async getCommunityFeed(params: {
    limit?: number;
    offset?: number;
    postType?: string;
    userId?: string;
    currentUserId?: string;
  } = {}): Promise<CommunityPost[]> {
    if (!this.client) return [];

    let query = this.client
      .from('community_posts')
      .select('*, author:user_profiles!user_id(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

    if (params.postType) {
      query = query.eq('post_type', params.postType);
    }

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('[UserDatabaseService] getCommunityFeed error:', error);
      throw error;
    }

    if (!posts || posts.length === 0) return [];

    // If currentUserId provided, check which posts the user has liked
    if (params.currentUserId) {
      const postIds = posts.map((p: any) => p.id);
      const { data: userLikes } = await this.client
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', params.currentUserId)
        .in('post_id', postIds);

      const likedSet = new Set((userLikes || []).map((l: any) => l.post_id));
      return posts.map((p: any) => ({
        ...p,
        has_liked: likedSet.has(p.id),
      })) as CommunityPost[];
    }

    return posts as CommunityPost[];
  }

  /**
   * Like or unlike a community post
   */
  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Check if like exists
    const { data: existingLike } = await this.client
      .from('community_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      // Remove like
      const { error: delError } = await this.client
        .from('community_post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (delError) {
        console.error('[UserDatabaseService] togglePostLike delete error:', delError);
        throw delError;
      }
      return { liked: false };
    } else {
      // Add like
      const { error: insError } = await this.client
        .from('community_post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insError) {
        console.error('[UserDatabaseService] togglePostLike insert error:', insError);
        throw insError;
      }
      return { liked: true };
    }
  }

  /**
   * Add a comment to a community post
   */
  async addPostComment(
    postId: string,
    userId: string,
    commentText: string
  ): Promise<CommunityPostComment> {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client
      .from('community_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        comment_text: commentText.trim(),
      })
      .select('*, author:user_profiles!user_id(username, display_name, avatar_url)')
      .single();

    if (error) {
      console.error('[UserDatabaseService] addPostComment error:', error);
      throw error;
    }

    return data as CommunityPostComment;
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string): Promise<CommunityPostComment[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('community_post_comments')
      .select('*, author:user_profiles!user_id(username, display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[UserDatabaseService] getPostComments error:', error);
      throw error;
    }

    return (data || []) as CommunityPostComment[];
  }

  // ==========================================================================
  // 6. Future AI Analytics & Progression Engine
  // ==========================================================================

  /**
   * Fetch user Personal Records (1RM history) for analytics
   */
  async getUserPersonalRecords(userId: string, exerciseId?: string): Promise<UserPersonalRecord[]> {
    if (!this.client) return [];

    let query = this.client
      .from('user_personal_records')
      .select('*, exercise:exercises!exercise_id(name, target_muscle, body_part)')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[UserDatabaseService] getUserPersonalRecords error:', error);
      throw error;
    }

    return (data || []) as UserPersonalRecord[];
  }

  /**
   * Fetch muscle volume logs for fatigue, recovery, and hypertrophy distribution analysis
   */
  async getUserMuscleVolumeLogs(
    userId: string,
    periodStart?: string
  ): Promise<UserMuscleVolumeLog[]> {
    if (!this.client) return [];

    let query = this.client
      .from('user_muscle_volume_logs')
      .select('*, muscle_group:muscle_groups!muscle_group_id(name, body_part)')
      .eq('user_id', userId)
      .order('period_start', { ascending: false });

    if (periodStart) {
      query = query.eq('period_start', periodStart);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[UserDatabaseService] getUserMuscleVolumeLogs error:', error);
      throw error;
    }

    return (data || []) as UserMuscleVolumeLog[];
  }

  /**
   * Aggregate high-level analytics summary for dashboards and AI coaching models
   */
  async getUserAnalyticsSummary(userId: string): Promise<{
    streak: UserStreak | null;
    personalRecordsCount: number;
    totalWorkouts: number;
    totalVolumeKg: number;
    currentLevel: number;
    totalXP: number;
    activityHeatmap: Record<string, DayActivityData>;
  }> {
    const [streak, prs] = await Promise.all([
      this.getUserStreak(userId),
      this.getUserPersonalRecords(userId),
    ]);

    return {
      streak,
      personalRecordsCount: prs.length,
      totalWorkouts: streak?.total_workouts || 0,
      totalVolumeKg: Number(streak?.total_volume_kg || 0),
      currentLevel: streak?.current_level || 1,
      totalXP: streak?.total_xp || 0,
      activityHeatmap: streak?.activity_matrix || {},
    };
  }
}

export const userDatabaseService = new UserDatabaseService();
