/**
 * Exercise Database Service for React Native & Supabase Client
 * ==============================================================
 * Connects React Native app to normalized Supabase PostgreSQL database
 * with full-text search, multi-language instructions, AI configs, and workout tracking.
 */

import {
  Exercise,
  ExerciseSearchResult,
  ExerciseInstruction,
  ExerciseMedia,
  ExerciseAIConfig,
  ExerciseVariation,
  ExerciseRelationship,
  ExerciseAnalysisSession,
  ExerciseRepAnalysis,
  MuscleGroup,
  Equipment,
  ExerciseCategory,
} from '../types/exerciseDatabase';

export interface ExerciseSearchFilters {
  query?: string;
  bodyPart?: string;
  equipment?: string;
  targetMuscle?: string;
  category?: string;
  difficulty?: string;
  exerciseType?: string;
  limit?: number;
  offset?: number;
}

export interface DetailedExerciseView extends Exercise {
  instructions_localized: string[];
  media: ExerciseMedia[];
  primary_media?: ExerciseMedia;
  ai_config?: ExerciseAIConfig;
  variations: ExerciseVariation[];
  progressions: ExerciseRelationship[];
  regressions: ExerciseRelationship[];
  alternatives: ExerciseRelationship[];
}

/**
 * Exercise Database API Service
 * Can be initialized with any Supabase client instance or REST fallback
 */
export class ExerciseDatabaseService {
  private supabaseClient: any;

  constructor(supabaseClient?: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Search exercises with full-text ranking, trigram fuzzy matching, and multi-filters
   */
  async searchExercises(filters: ExerciseSearchFilters = {}): Promise<ExerciseSearchResult[]> {
    if (!this.supabaseClient) {
      console.warn('[ExerciseDatabaseService] No Supabase client initialized. Returning empty results.');
      return [];
    }

    const { data, error } = await this.supabaseClient.rpc('search_exercises', {
      search_query: filters.query || null,
      filter_body_part: filters.bodyPart || null,
      filter_equipment: filters.equipment || null,
      filter_target_muscle: filters.targetMuscle || null,
      filter_category: filters.category || null,
      filter_difficulty: filters.difficulty || null,
      filter_exercise_type: filters.exerciseType || null,
      limit_count: filters.limit || 50,
      offset_count: filters.offset || 0,
    });

    if (error) {
      console.error('[ExerciseDatabaseService] searchExercises error:', error);
      throw error;
    }

    return (data || []) as ExerciseSearchResult[];
  }

  /**
   * Retrieve full details of an exercise by slug, with localized instructions and AI config
   */
  async getExerciseBySlug(slug: string, languageCode: string = 'en'): Promise<DetailedExerciseView | null> {
    if (!this.supabaseClient) return null;

    // 1. Fetch main exercise record
    const { data: exData, error: exError } = await this.supabaseClient
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (exError || !exData) {
      console.error('[ExerciseDatabaseService] getExerciseBySlug error:', exError);
      return null;
    }

    const exerciseId = exData.id;

    // 2. Fetch parallel relations: localized instructions, media, AI config, variations, relationships
    const [instResult, mediaResult, aiResult, varResult, relResult] = await Promise.all([
      this.supabaseClient
        .from('exercise_instructions')
        .select('*')
        .eq('exercise_id', exerciseId)
        .in('language_code', [languageCode, 'en']),

      this.supabaseClient
        .from('exercise_media')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('is_primary', { ascending: false }),

      this.supabaseClient
        .from('exercise_ai_config')
        .select('*')
        .eq('exercise_id', exerciseId)
        .maybeSingle(),

      this.supabaseClient
        .from('exercise_variations')
        .select('*')
        .eq('exercise_id', exerciseId),

      this.supabaseClient
        .from('exercise_relationships')
        .select('*, related_exercise:exercises!related_exercise_id(id, name, slug, difficulty)')
        .eq('exercise_id', exerciseId),
    ]);

    // Localized instructions with English fallback
    let localizedSteps: string[] = exData.instructions || [];
    const instructionsList = (instResult.data || []) as ExerciseInstruction[];
    const targetLang = instructionsList.find((i) => i.language_code === languageCode);
    const enLang = instructionsList.find((i) => i.language_code === 'en');

    if (targetLang && targetLang.instruction_steps.length > 0) {
      localizedSteps = targetLang.instruction_steps.map((s) => s.text);
    } else if (enLang && enLang.instruction_steps.length > 0) {
      localizedSteps = enLang.instruction_steps.map((s) => s.text);
    }

    const mediaList = (mediaResult.data || []) as ExerciseMedia[];
    const primaryMedia = mediaList.find((m) => m.is_primary) || mediaList[0];
    const relationships = (relResult.data || []) as ExerciseRelationship[];

    return {
      ...exData,
      instructions_localized: localizedSteps,
      media: mediaList,
      primary_media: primaryMedia,
      ai_config: aiResult.data || undefined,
      variations: (varResult.data || []) as ExerciseVariation[],
      progressions: relationships.filter((r) => r.relationship_type === 'progression'),
      regressions: relationships.filter((r) => r.relationship_type === 'regression'),
      alternatives: relationships.filter((r) => r.relationship_type === 'alternative'),
    };
  }

  /**
   * Fetch canonical taxonomies for filter pills and browse screens
   */
  async getTaxonomies(): Promise<{
    muscleGroups: MuscleGroup[];
    equipment: Equipment[];
    categories: ExerciseCategory[];
  }> {
    if (!this.supabaseClient) {
      return { muscleGroups: [], equipment: [], categories: [] };
    }

    const [mg, eq, cat] = await Promise.all([
      this.supabaseClient.from('muscle_groups').select('*').order('name'),
      this.supabaseClient.from('equipment').select('*').order('name'),
      this.supabaseClient.from('exercise_categories').select('*').order('name'),
    ]);

    return {
      muscleGroups: mg.data || [],
      equipment: eq.data || [],
      categories: cat.data || [],
    };
  }

  /**
   * Save a completed computer vision AI workout rep analysis session
   */
  async recordAIAnalysisSession(
    session: Omit<ExerciseAnalysisSession, 'id' | 'created_at'>,
    reps: Omit<ExerciseRepAnalysis, 'id' | 'analysis_session_id'>[]
  ): Promise<string> {
    if (!this.supabaseClient) throw new Error('Supabase client not initialized');

    // Insert session header
    const { data: sessionData, error: sErr } = await this.supabaseClient
      .from('exercise_analysis_sessions')
      .insert(session)
      .select('id')
      .single();

    if (sErr || !sessionData) {
      console.error('[ExerciseDatabaseService] Failed to record analysis session:', sErr);
      throw sErr;
    }

    const sessionId = sessionData.id;

    // Batch insert individual rep analytics
    if (reps.length > 0) {
      const repPayloads = reps.map((r) => ({
        ...r,
        analysis_session_id: sessionId,
      }));

      const { error: rErr } = await this.supabaseClient
        .from('exercise_rep_analysis')
        .insert(repPayloads);

      if (rErr) {
        console.error('[ExerciseDatabaseService] Failed to batch insert rep analyses:', rErr);
        throw rErr;
      }
    }

    return sessionId;
  }
}
