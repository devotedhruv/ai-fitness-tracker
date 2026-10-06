import { calculateSetXP, calculateLevelFromXP } from '../services/progression/xpCalculator';
import { buildUnifiedProgress } from '../services/progression/unifiedProgressionService';

describe('Unified Progression System', () => {
  describe('calculateLevelFromXP', () => {
    it('returns Level 1 Recruit for 0 XP', () => {
      const res = calculateLevelFromXP(0);
      expect(res.level).toBe(1);
      expect(res.title).toBe('Recruit');
      expect(res.currentXP).toBe(0);
      expect(res.progressPercentage).toBe(0);
    });

    it('returns Level 24 Iron Warrior around 7850 XP', () => {
      const res = calculateLevelFromXP(7850);
      expect(res.level).toBe(24);
      expect(res.title).toBe('Iron Warrior');
      expect(res.progressPercentage).toBeGreaterThan(0);
      expect(res.progressPercentage).toBeLessThan(100);
      expect(res.xpToNextLevel).toBeGreaterThan(0);
    });

    it('progresses through military & warrior titles with increasing XP', () => {
      const low = calculateLevelFromXP(500);
      const mid = calculateLevelFromXP(3000);
      const high = calculateLevelFromXP(10000);

      expect(low.level).toBeLessThan(mid.level);
      expect(mid.level).toBeLessThan(high.level);
      expect(high.title).toBeDefined();
    });
  });

  describe('calculateSetXP', () => {
    it('calculates regular set XP with normalized effort', () => {
      const result = calculateSetXP({
        weightKg: 100,
        reps: 8,
      });

      expect(result.xpAwarded).toBeGreaterThan(20);
      expect(result.completionBonus).toBe(10);
      expect(result.prBonus).toBe(0);
    });

    it('adds +150 XP bonus for Personal Records', () => {
      const regular = calculateSetXP({ weightKg: 100, reps: 5, isPR: false });
      const pr = calculateSetXP({ weightKg: 100, reps: 5, isPR: true });

      expect(pr.prBonus).toBe(150);
      expect(pr.xpAwarded - regular.xpAwarded).toBe(150);
    });

    it('rewards high RPE intensity with higher effort factor', () => {
      const lowRpe = calculateSetXP({ weightKg: 80, reps: 6, rpe: 6 });
      const maxRpe = calculateSetXP({ weightKg: 80, reps: 6, rpe: 9.5 });

      expect(maxRpe.xpAwarded).toBeGreaterThan(lowRpe.xpAwarded);
      expect(maxRpe.effortFactor).toBeGreaterThan(lowRpe.effortFactor);
    });

    it('halves XP for warmup sets', () => {
      const working = calculateSetXP({ weightKg: 60, reps: 10, isWarmup: false });
      const warmup = calculateSetXP({ weightKg: 60, reps: 10, isWarmup: true });

      expect(warmup.xpAwarded).toBeLessThan(working.xpAwarded);
    });
  });

  describe('buildUnifiedProgress', () => {
    it('builds coherent baseline structure when user has no logged workouts', () => {
      const progress = buildUnifiedProgress({ sessions: [] });

      expect(progress.level).toBe(24); // baseline character preview Level 24 Iron Warrior
      expect(progress.rankTitle).toBe('Iron Warrior');
      expect(progress.streakDays).toBe(4);
      expect(progress.exerciseProgress['squat']).toBeDefined();
      expect(progress.exerciseProgress['squat'].rank).toBe('S');
      expect(progress.exerciseProgress['bench-press'].rank).toBe('A');
      expect(progress.muscleProgress['Chest']).toBeDefined();
      expect(progress.weeklyDashboard.volumeDeltaPercent).toBe(12);
      expect(progress.recentAchievements.length).toBeGreaterThan(0);
    });

    it('aggregates live sessions into exercise and muscle progression', () => {
      const now = new Date();
      const mockSessions = [
        {
          id: 'sess-1',
          name: 'Heavy Chest & Triceps',
          createdAt: now.toISOString(),
          totalVolumeKg: 4500,
          durationSeconds: 2700,
          sets: [
            {
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              primaryMuscle: 'Chest',
              weightKg: 100,
              reps: 8,
              isCompleted: true,
            },
            {
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              primaryMuscle: 'Chest',
              weightKg: 105,
              reps: 6,
              isCompleted: true,
            },
          ],
        },
      ];

      const progress = buildUnifiedProgress({
        sessions: mockSessions,
        streakDays: 5,
      });

      expect(progress.totalWorkouts).toBe(1);
      expect(progress.totalSets).toBe(2);
      expect(progress.totalVolumeKg).toBe(4500);
      expect(progress.exerciseProgress['bench-press'].personalBestWeightKg).toBe(105);
      expect(progress.exerciseProgress['bench-press'].estimated1RMKg).toBeGreaterThan(115);
      expect(progress.muscleProgress['Chest'].totalSets).toBe(2);
      expect(progress.streakDays).toBe(5);
    });

    it('correctly calculates Brzycki estimated 1RM', () => {
      // 100kg for 10 reps: 100 / (1.0278 - 0.0278 * 10) = 100 / 0.7498 = ~133kg
      const mockSession = {
        id: '1rm-test',
        name: 'Squat Session',
        createdAt: new Date().toISOString(),
        sets: [
          {
            exerciseId: 'squat',
            exerciseName: 'Barbell Squat',
            primaryMuscle: 'Legs',
            weightKg: 100,
            reps: 10,
            isCompleted: true,
          },
        ],
      };

      const progress = buildUnifiedProgress({ sessions: [mockSession] });
      const squat = progress.exerciseProgress['squat'];
      expect(squat.personalBestWeightKg).toBe(100);
      expect(squat.estimated1RMKg).toBe(133);
    });

    it('calculates week-over-week deltas accurately', () => {
      const now = new Date();
      const thisWeekSession = {
        id: 's-this-week',
        createdAt: now.toISOString(),
        totalVolumeKg: 5000,
        sets: [{ isCompleted: true }],
      };

      const dayOfWeek = (now.getDay() + 6) % 7;
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - dayOfWeek);
      startOfThisWeek.setHours(0, 0, 0, 0);

      const lastWeekDate = new Date(startOfThisWeek);
      lastWeekDate.setDate(startOfThisWeek.getDate() - 3); // Guaranteed to be Friday of previous week
      const lastWeekSession = {
        id: 's-last-week',
        createdAt: lastWeekDate.toISOString(),
        totalVolumeKg: 4000,
        sets: [{ isCompleted: true }],
      };

      const progress = buildUnifiedProgress({
        sessions: [thisWeekSession, lastWeekSession],
      });

      expect(progress.weeklyDashboard.workouts).toBe(1);
      expect(progress.weeklyDashboard.lastWeekWorkouts).toBe(1);
      expect(progress.weeklyDashboard.volumeKg).toBe(5000);
      expect(progress.weeklyDashboard.lastWeekVolumeKg).toBe(4000);
      expect(progress.weeklyDashboard.volumeDeltaPercent).toBe(25); // +25%
    });

    it('populates activityMatrix with sessions, runs, and rest days', () => {
      const now = new Date();
      const session = {
        id: 'matrix-s1',
        name: 'Bench & Triceps Blast',
        startTime: now.toISOString(),
        durationSeconds: 3000,
        totalVolumeKg: 6200,
      };

      const progress = buildUnifiedProgress({
        sessions: [session],
      });

      const todayKey = now.toISOString().slice(0, 10);
      expect(progress.activityMatrix).toBeDefined();
      expect(progress.activityMatrix[todayKey]).toBeDefined();
      expect(progress.activityMatrix[todayKey].xp).toBeGreaterThan(50);
      expect(progress.activityMatrix[todayKey].activities?.length).toBeGreaterThan(0);
      expect(progress.activityMatrix[todayKey].activities?.[0].type).toBe('strength');
    });

    it('populates full 365-day calendar activity matrix for new users', () => {
      const progress = buildUnifiedProgress({ sessions: [] });
      expect(progress.activityMatrix).toBeDefined();
      const daysCount = Object.keys(progress.activityMatrix).length;
      expect(daysCount).toBeGreaterThanOrEqual(365);

      // Verify that all 12 months are represented across the records
      const monthsSet = new Set(
        Object.keys(progress.activityMatrix).map((k) => k.slice(5, 7))
      );
      expect(monthsSet.size).toBe(12);
    });
  });
});
