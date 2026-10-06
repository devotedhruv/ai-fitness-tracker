import { UserDatabaseService } from '../services/userDatabaseService';
import {
  UserProfile,
  UserStreak,
  CustomExerciseInput,
  CommunityPostInput,
  CompletedWorkoutSessionInput,
} from '../types/userDatabase';

describe('UserDatabaseService', () => {
  let mockSupabase: any;
  let service: UserDatabaseService;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
      rpc: jest.fn(),
    };
    service = new UserDatabaseService(mockSupabase);
  });

  describe('User Profile Management', () => {
    it('getUserProfile fetches profile by userId', async () => {
      const mockProfile: UserProfile = {
        id: 'usr-123',
        email: 'test@example.com',
        username: 'iron_athlete',
        display_name: 'Iron Athlete',
        units: 'METRIC',
        experience_level: 'INTERMEDIATE',
        fitness_goals: ['Hypertrophy', 'Strength'],
        days_per_week: 4,
        preferred_equipment: ['barbell', 'dumbbell'],
        height_cm: 180,
        weight_kg: 82.5,
      };

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getUserProfile('usr-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'usr-123');
      expect(result).toEqual(mockProfile);
    });

    it('upsertUserProfile successfully upserts and returns profile', async () => {
      const updateData = {
        id: 'usr-123',
        display_name: 'Titan Lifter',
        weight_kg: 84.0,
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...updateData, username: 'titan', units: 'METRIC', experience_level: 'ADVANCED' },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockUpsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await service.upsertUserProfile(updateData as any);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockUpsert).toHaveBeenCalled();
      expect(result.display_name).toBe('Titan Lifter');
    });
  });

  describe('Custom Exercises Management', () => {
    it('createCustomExercise saves custom exercise with is_custom=true and generated slug', async () => {
      const input: CustomExerciseInput = {
        name: 'Deficit Bulgarian Split Squat',
        body_part: 'legs',
        target_muscle: 'quadriceps',
        secondary_muscles: ['glutes', 'hamstrings'],
        equipment: 'dumbbell',
        instructions: ['Place rear foot on bench elevated', 'Lower hips until back knee almost touches ground'],
        media_url: 'https://example.com/demo.mp4',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'ex-custom-999',
          name: input.name,
          slug: 'deficit-bulgarian-split-squat-abc1',
          is_custom: true,
          is_active: true,
          user_id: 'usr-123',
          instructions: input.instructions,
        },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsertExercise = jest.fn().mockReturnValue({ select: mockSelect });
      const mockInsertMedia = jest.fn().mockReturnValue(Promise.resolve({ error: null }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return { insert: mockInsertExercise };
        }
        if (table === 'exercise_media') {
          return { insert: mockInsertMedia };
        }
        return {};
      });

      const result = await service.createCustomExercise('usr-123', input);

      expect(mockSupabase.from).toHaveBeenCalledWith('exercises');
      expect(mockInsertExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Deficit Bulgarian Split Squat',
          user_id: 'usr-123',
          is_custom: true,
          is_active: true,
        })
      );
      expect(mockInsertMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          exercise_id: 'ex-custom-999',
          media_url: 'https://example.com/demo.mp4',
        })
      );
      expect(result.is_custom).toBe(true);
    });

    it('getCustomExercises retrieves user custom exercises', async () => {
      const mockExercises = [
        { id: 'ex-1', name: 'Custom Pushup', is_custom: true, user_id: 'usr-123' },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockExercises, error: null });
      const mockEqActive = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEqCustom = jest.fn().mockReturnValue({ eq: mockEqActive });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqCustom });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getCustomExercises('usr-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('exercises');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Custom Pushup');
    });

    it('deleteCustomExercise removes custom exercise for owner', async () => {
      const mockEqCustom = jest.fn().mockResolvedValue({ error: null });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqCustom });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });
      mockSupabase.from.mockReturnValue({ delete: mockDelete });

      const success = await service.deleteCustomExercise('ex-1', 'usr-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('exercises');
      expect(success).toBe(true);
    });
  });

  describe('Streaks & Gamification Progression', () => {
    it('getUserStreak fetches streak record', async () => {
      const mockStreak: UserStreak = {
        user_id: 'usr-123',
        current_streak: 5,
        longest_streak: 14,
        total_workouts: 42,
        total_volume_kg: 56000,
        total_time_seconds: 72000,
        total_xp: 3200,
        current_level: 7,
        streak_freezes_available: 2,
        streak_freezes_used: 0,
        activity_matrix: {
          '2026-10-05': { workouts: 1, volume_kg: 2400, duration_seconds: 3600, xp: 50 },
        },
      };

      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockStreak, error: null });
      const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getUserStreak('usr-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('user_streaks');
      expect(result?.current_streak).toBe(5);
      expect(result?.current_level).toBe(7);
    });

    it('recordWorkoutCompletion invokes record_completed_workout RPC', async () => {
      const mockRpcResponse = {
        success: true,
        current_streak: 6,
        longest_streak: 14,
        total_xp: 3250,
        current_level: 7,
      };

      mockSupabase.rpc.mockResolvedValue({ data: mockRpcResponse, error: null });

      const result = await service.recordWorkoutCompletion({
        workoutId: 'w-101',
        userId: 'usr-123',
        totalVolumeKg: 2400,
        durationSeconds: 3600,
        xpEarned: 50,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('record_completed_workout', {
        p_workout_id: 'w-101',
        p_user_id: 'usr-123',
        p_total_volume_kg: 2400,
        p_duration_seconds: 3600,
        p_xp_earned: 50,
      });
      expect(result.current_streak).toBe(6);
    });
  });

  describe('End-to-End Workout Session Persistence', () => {
    it('saveCompletedWorkoutSession saves workout, exercises, sets, evaluates PR, and updates streaks', async () => {
      const sessionInput: CompletedWorkoutSessionInput = {
        user_id: 'usr-123',
        name: 'Upper Body Hypertrophy',
        duration_seconds: 3600,
        exercises: [
          {
            exercise_id: 'ex-bench-press',
            order_index: 0,
            sets: [
              { set_number: 1, weight: 100, reps: 10 },
              { set_number: 2, weight: 100, reps: 8 },
            ],
          },
        ],
      };

      // Mock workout insert
      const mockWorkoutSingle = jest.fn().mockResolvedValue({ data: { id: 'w-created-1' }, error: null });
      const mockWorkoutSelect = jest.fn().mockReturnValue({ single: mockWorkoutSingle });
      const mockWorkoutInsert = jest.fn().mockReturnValue({ select: mockWorkoutSelect });

      // Mock workout_exercises insert
      const mockWESingle = jest.fn().mockResolvedValue({ data: { id: 'we-created-1' }, error: null });
      const mockWESelect = jest.fn().mockReturnValue({ single: mockWESingle });
      const mockWEInsert = jest.fn().mockReturnValue({ select: mockWESelect });

      // Mock exercise_sets insert
      const mockSetsSelect = jest.fn().mockResolvedValue({
        data: [
          { id: 's-1', workout_exercise_id: 'we-created-1', set_number: 1, weight: 100, reps: 10 },
          { id: 's-2', workout_exercise_id: 'we-created-1', set_number: 2, weight: 100, reps: 8 },
        ],
        error: null,
      });
      const mockSetsInsert = jest.fn().mockReturnValue({ select: mockSetsSelect });

      // Mock PR evaluation
      const mockPRSingle = jest.fn().mockResolvedValue({ data: null, error: null }); // no existing PR
      const mockPRLimit = jest.fn().mockReturnValue({ maybeSingle: mockPRSingle });
      const mockPROrder = jest.fn().mockReturnValue({ limit: mockPRLimit });
      const mockPREqEx = jest.fn().mockReturnValue({ order: mockPROrder });
      const mockPREqUser = jest.fn().mockReturnValue({ eq: mockPREqEx });
      const mockPRSelect = jest.fn().mockReturnValue({ eq: mockPREqUser });
      const mockPRInsert = jest.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'workouts') return { insert: mockWorkoutInsert };
        if (table === 'workout_exercises') return { insert: mockWEInsert };
        if (table === 'exercise_sets') return { insert: mockSetsInsert };
        if (table === 'user_personal_records') return { select: mockPRSelect, insert: mockPRInsert };
        return {};
      });

      mockSupabase.rpc.mockResolvedValue({
        data: { success: true, current_streak: 1, longest_streak: 1, total_xp: 50, current_level: 1 },
        error: null,
      });

      const result = await service.saveCompletedWorkoutSession(sessionInput);

      expect(result.workoutId).toBe('w-created-1');
      expect(mockWorkoutInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'usr-123',
          name: 'Upper Body Hypertrophy',
          status: 'completed',
          total_volume_kg: 1800, // 100*10 + 100*8 = 1800
        })
      );
      expect(mockWEInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          workout_id: 'w-created-1',
          exercise_id: 'ex-bench-press',
        })
      );
      expect(mockSetsInsert).toHaveBeenCalled();
      expect(mockPRInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'usr-123',
          exercise_id: 'ex-bench-press',
          best_weight_kg: 100,
          best_reps: 10,
        })
      );
    });
  });

  describe('Community Social Feed & Interactions', () => {
    it('createCommunityPost inserts post and returns populated record', async () => {
      const input: CommunityPostInput = {
        caption: 'Crushed a 140kg squat PR today!',
        post_type: 'PERSONAL_RECORD',
        media_url: 'https://example.com/pr.jpg',
        media_type: 'IMAGE',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'post-101',
          user_id: 'usr-123',
          caption: input.caption,
          post_type: input.post_type,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString(),
          author: { username: 'iron_athlete', display_name: 'Iron Athlete' },
        },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const result = await service.createCommunityPost('usr-123', input);

      expect(mockSupabase.from).toHaveBeenCalledWith('community_posts');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'usr-123',
          caption: 'Crushed a 140kg squat PR today!',
          post_type: 'PERSONAL_RECORD',
        })
      );
      expect(result.id).toBe('post-101');
    });

    it('togglePostLike inserts like if not liked, and removes if already liked', async () => {
      // First call: Not liked yet -> should insert
      const mockMaybeSingleNotLiked = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockEqUser1 = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingleNotLiked });
      const mockEqPost1 = jest.fn().mockReturnValue({ eq: mockEqUser1 });
      const mockSelect1 = jest.fn().mockReturnValue({ eq: mockEqPost1 });
      const mockInsert = jest.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect1,
        insert: mockInsert,
      });

      const likeRes1 = await service.togglePostLike('post-101', 'usr-123');
      expect(likeRes1.liked).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({ post_id: 'post-101', user_id: 'usr-123' });

      // Second call: Already liked -> should delete
      const mockMaybeSingleLiked = jest.fn().mockResolvedValue({ data: { id: 'like-1' }, error: null });
      const mockEqUser2 = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingleLiked });
      const mockEqPost2 = jest.fn().mockReturnValue({ eq: mockEqUser2 });
      const mockSelect2 = jest.fn().mockReturnValue({ eq: mockEqPost2 });

      const mockEqDel = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqDel });

      mockSupabase.from.mockReturnValue({
        select: mockSelect2,
        delete: mockDelete,
      });

      const likeRes2 = await service.togglePostLike('post-101', 'usr-123');
      expect(likeRes2.liked).toBe(false);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEqDel).toHaveBeenCalledWith('id', 'like-1');
    });

    it('addPostComment inserts comment and returns it with author', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'c-1',
          post_id: 'post-101',
          user_id: 'usr-123',
          comment_text: 'Inspiring lift, great form!',
          author: { username: 'lifter2', display_name: 'Lifter Two' },
        },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const result = await service.addPostComment('post-101', 'usr-123', 'Inspiring lift, great form!');

      expect(mockSupabase.from).toHaveBeenCalledWith('community_post_comments');
      expect(mockInsert).toHaveBeenCalledWith({
        post_id: 'post-101',
        user_id: 'usr-123',
        comment_text: 'Inspiring lift, great form!',
      });
      expect(result.comment_text).toBe('Inspiring lift, great form!');
    });
  });

  describe('Analytics & Future Insights Engine', () => {
    it('getUserPersonalRecords retrieves 1RM history ordered by date', async () => {
      const mockPRs = [
        {
          id: 'pr-1',
          user_id: 'usr-123',
          exercise_id: 'ex-1',
          one_rep_max_est: 140,
          best_weight_kg: 120,
          best_reps: 5,
          achieved_at: '2026-10-05T10:00:00Z',
          exercise: { name: 'Deadlift', target_muscle: 'erector_spinae', body_part: 'back' },
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockPRs, error: null });
      const mockEqUser = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getUserPersonalRecords('usr-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('user_personal_records');
      expect(result).toHaveLength(1);
      expect(result[0].one_rep_max_est).toBe(140);
    });

    it('getUserAnalyticsSummary aggregates streak, PRs, and heatmap into high-level dashboard', async () => {
      const mockStreak: UserStreak = {
        user_id: 'usr-123',
        current_streak: 7,
        longest_streak: 14,
        total_workouts: 25,
        total_volume_kg: 45000,
        total_time_seconds: 50000,
        total_xp: 2100,
        current_level: 5,
        streak_freezes_available: 1,
        streak_freezes_used: 0,
        activity_matrix: {
          '2026-10-05': { workouts: 1, volume_kg: 3200, duration_seconds: 4000, xp: 50 },
        },
      };

      const mockPRs = [
        { id: 'pr-1', user_id: 'usr-123', exercise_id: 'ex-1', one_rep_max_est: 100, best_weight_kg: 90, best_reps: 4, achieved_at: '2026-10-01' },
        { id: 'pr-2', user_id: 'usr-123', exercise_id: 'ex-2', one_rep_max_est: 140, best_weight_kg: 120, best_reps: 5, achieved_at: '2026-10-03' },
      ];

      jest.spyOn(service, 'getUserStreak').mockResolvedValue(mockStreak);
      jest.spyOn(service, 'getUserPersonalRecords').mockResolvedValue(mockPRs as any);

      const summary = await service.getUserAnalyticsSummary('usr-123');

      expect(summary.currentLevel).toBe(5);
      expect(summary.totalXP).toBe(2100);
      expect(summary.totalWorkouts).toBe(25);
      expect(summary.totalVolumeKg).toBe(45000);
      expect(summary.personalRecordsCount).toBe(2);
      expect(summary.activityHeatmap['2026-10-05']).toBeDefined();
    });
  });
});
