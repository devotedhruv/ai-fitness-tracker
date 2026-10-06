import { calculateActivityXP, aggregateHistoryXP } from '../services/progression/xpCalculator';
import {
  MILITARY_RANKS,
  getRankByXP,
  getNextRank,
  getRankProgress,
} from '../services/progression/rankConfig';
import { analyzePersonalPerformance } from '../services/progression/performanceAnalyzer';

describe('Personal Fitness Progression & Ranking System', () => {
  describe('XP Calculation Engine & Anti-Abuse Guards', () => {
    it('awards 100 XP for completed regular workout and 150 XP for planned workout', () => {
      const regular = calculateActivityXP({
        type: 'WORKOUT',
        durationSeconds: 1800,
        setsCount: 8,
      });
      expect(regular.isValid).toBe(true);
      expect(regular.xpAwarded).toBe(100);

      const planned = calculateActivityXP({
        type: 'PLANNED_WORKOUT',
        durationSeconds: 2400,
        setsCount: 12,
      });
      expect(planned.isValid).toBe(true);
      expect(planned.xpAwarded).toBe(150);
    });

    it('enforces anti-abuse: rejects empty workouts with 0 duration and 0 sets', () => {
      const spoofed = calculateActivityXP({
        type: 'WORKOUT',
        durationSeconds: 20,
        setsCount: 0,
      });
      expect(spoofed.isValid).toBe(false);
      expect(spoofed.xpAwarded).toBe(0);
    });

    it('awards run XP based on distance (base 50 XP + 20 XP/km)', () => {
      const fiveK = calculateActivityXP({
        type: 'RUN',
        distanceMeters: 5000,
        durationSeconds: 1500,
      });
      expect(fiveK.isValid).toBe(true);
      // 50 base + 5 * 20 = 150 XP
      expect(fiveK.xpAwarded).toBe(150);
    });

    it('enforces anti-abuse: rejects runs under 200m', () => {
      const tooShort = calculateActivityXP({
        type: 'RUN',
        distanceMeters: 50,
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.xpAwarded).toBe(0);
    });

    it('awards 100 XP for achieving a personal record', () => {
      const pr = calculateActivityXP({
        type: 'PERSONAL_RECORD',
        exerciseName: 'Barbell Bench Press',
      });
      expect(pr.isValid).toBe(true);
      expect(pr.xpAwarded).toBe(100);
    });

    it('aggregates history XP correctly across multiple categories', () => {
      const summary = aggregateHistoryXP({
        sessions: [
          { durationSeconds: 2400, totalVolumeKg: 3000, isCompleted: true },
          { durationSeconds: 1800, totalVolumeKg: 1000, isCompleted: true },
        ],
        runs: [{ distanceMeters: 5000, durationSeconds: 1500 }],
        records: [{ exerciseName: 'Deadlift', value: 140 }],
        streaksWeeks: 4,
        goalsCompleted: 1,
      });

      expect(summary.totalXP).toBeGreaterThan(500);
      expect(summary.breakdown.workouts).toBeGreaterThan(0);
      expect(summary.breakdown.runs).toBe(150);
      expect(summary.breakdown.personalRecords).toBe(100);
      expect(summary.breakdown.streaks).toBe(100);
      expect(summary.breakdown.goals).toBe(250);
    });
  });

  describe('12-Tier Military Rank System', () => {
    it('defines all 12 configurable military ranks in ascending order', () => {
      expect(MILITARY_RANKS).toHaveLength(12);
      expect(MILITARY_RANKS[0].id).toBe('recruit');
      expect(MILITARY_RANKS[0].minXP).toBe(0);
      expect(MILITARY_RANKS[1].id).toBe('private');
      expect(MILITARY_RANKS[1].minXP).toBe(300);
      expect(MILITARY_RANKS[2].id).toBe('private-first-class');
      expect(MILITARY_RANKS[2].minXP).toBe(700);
      expect(MILITARY_RANKS[3].id).toBe('corporal');
      expect(MILITARY_RANKS[3].minXP).toBe(1200);
      expect(MILITARY_RANKS[4].id).toBe('sergeant');
      expect(MILITARY_RANKS[4].minXP).toBe(2000);
      expect(MILITARY_RANKS[5].id).toBe('staff-sergeant');
      expect(MILITARY_RANKS[5].minXP).toBe(3200);
      expect(MILITARY_RANKS[6].id).toBe('lieutenant');
      expect(MILITARY_RANKS[6].minXP).toBe(5000);
      expect(MILITARY_RANKS[7].id).toBe('captain');
      expect(MILITARY_RANKS[7].minXP).toBe(7500);
      expect(MILITARY_RANKS[8].id).toBe('major');
      expect(MILITARY_RANKS[8].minXP).toBe(11000);
      expect(MILITARY_RANKS[9].id).toBe('colonel');
      expect(MILITARY_RANKS[9].minXP).toBe(16000);
      expect(MILITARY_RANKS[10].id).toBe('commander');
      expect(MILITARY_RANKS[10].minXP).toBe(20000);
      expect(MILITARY_RANKS[11].id).toBe('general');
      expect(MILITARY_RANKS[11].minXP).toBe(25000);
    });

    it('correctly maps user XP to military rank', () => {
      expect(getRankByXP(0).id).toBe('recruit');
      expect(getRankByXP(299).id).toBe('recruit');
      expect(getRankByXP(300).id).toBe('private');
      expect(getRankByXP(699).id).toBe('private');
      expect(getRankByXP(750).id).toBe('private-first-class');
      expect(getRankByXP(1200).id).toBe('corporal');
      expect(getRankByXP(2500).id).toBe('sergeant');
      expect(getRankByXP(5500).id).toBe('lieutenant');
      expect(getRankByXP(12000).id).toBe('major');
      expect(getRankByXP(27000).id).toBe('general');
    });

    it('calculates rank progression percentage and remaining XP accurately', () => {
      // Private First Class: 700 to 1200 (500 XP span)
      // At 950 XP -> 250 XP in tier -> 50%
      const prog = getRankProgress(950);
      expect(prog.currentRank.id).toBe('private-first-class');
      expect(prog.nextRank?.id).toBe('corporal');
      expect(prog.xpInCurrentTier).toBe(250);
      expect(prog.xpRequiredForTier).toBe(500);
      expect(prog.progressPercentage).toBe(50);
      expect(prog.xpToNextRank).toBe(250);
      expect(prog.isMaxRank).toBe(false);
    });

    it('handles General apex tier without crashing or NaN', () => {
      const prog = getRankProgress(30000);
      expect(prog.currentRank.id).toBe('general');
      expect(prog.nextRank).toBeNull();
      expect(prog.progressPercentage).toBe(100);
      expect(prog.xpToNextRank).toBe(0);
      expect(prog.isMaxRank).toBe(true);
    });
  });

  describe('Personal Performance Analyzer (Compete With Yourself)', () => {
    it('analyzes week-over-week performance and generates positive encouraging insights', () => {
      const now = new Date();
      const thisWeekDate = new Date(now);
      // Set to 2 days before start of current week (i.e. Friday/Saturday of last week)
      const dayOfWeek = (now.getDay() + 6) % 7;
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - dayOfWeek);
      startOfThisWeek.setHours(0, 0, 0, 0);

      const lastWeekDate = new Date(startOfThisWeek.getTime() - 2 * 24 * 60 * 60 * 1000);

      const analysis = analyzePersonalPerformance({
        sessions: [
          { startTime: thisWeekDate.toISOString(), durationSeconds: 2400, totalVolumeKg: 4000, isCompleted: true },
          { startTime: thisWeekDate.toISOString(), durationSeconds: 2400, totalVolumeKg: 4500, isCompleted: true },
          { startTime: lastWeekDate.toISOString(), durationSeconds: 2000, totalVolumeKg: 3000, isCompleted: true },
        ],
        runs: [
          { startedAt: thisWeekDate.toISOString(), distanceMeters: 6000, durationSeconds: 1800 },
          { startedAt: lastWeekDate.toISOString(), distanceMeters: 4000, durationSeconds: 1400 },
        ],
        records: [
          { exerciseName: 'Bench Press', value: 105, achievedAt: thisWeekDate.toISOString() },
        ],
        targetDaysPerWeek: 4,
      });

      expect(analysis.thisWeekWorkouts).toBe(2);
      expect(analysis.lastWeekWorkouts).toBe(1);
      expect(analysis.thisWeekRunKm).toBe(6.0);
      expect(analysis.lastWeekRunKm).toBe(4.0);
      expect(analysis.encouragingInsights.length).toBeGreaterThan(0);
      // Verify encouraging phrasing
      const combinedText = analysis.encouragingInsights.join(' ');
      expect(combinedText).toMatch(/workout|run|record/i);
    });
  });
});
