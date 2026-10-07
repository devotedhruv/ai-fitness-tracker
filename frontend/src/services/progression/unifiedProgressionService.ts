import {
  UserProgress,
  ExerciseProgressItem,
  MuscleProgressItem,
  AchievementItem,
  WeeklyProgressDashboard,
  LevelInfo,
  ExerciseRankTier,
  MuscleRankTier,
  DayActivityRecord,
} from './types';
import { calculateActivityXP, aggregateHistoryXP, calculateSetXP, calculateLevelFromXP } from './xpCalculator';

export const EXERCISE_RANK_THRESHOLDS: Array<{ rank: ExerciseRankTier; minXP: number; maxXP: number }> = [
  { rank: 'D', minXP: 0, maxXP: 299 },
  { rank: 'C', minXP: 300, maxXP: 699 },
  { rank: 'B', minXP: 700, maxXP: 1399 },
  { rank: 'A', minXP: 1400, maxXP: 2499 },
  { rank: 'S', minXP: 2500, maxXP: 3999 },
  { rank: 'S+', minXP: 4000, maxXP: 5999 },
  { rank: 'MASTER', minXP: 6000, maxXP: Infinity },
];

export const MUSCLE_RANK_THRESHOLDS: Array<{ rank: MuscleRankTier; minXP: number; maxXP: number }> = [
  { rank: 'D', minXP: 0, maxXP: 499 },
  { rank: 'C', minXP: 500, maxXP: 1199 },
  { rank: 'B', minXP: 1200, maxXP: 2499 },
  { rank: 'A', minXP: 2500, maxXP: 4499 },
  { rank: 'S', minXP: 4500, maxXP: 7499 },
  { rank: 'S+', minXP: 7500, maxXP: 10999 },
  { rank: 'MASTER', minXP: 11000, maxXP: Infinity },
];

export function getExerciseRankByXP(xp: number): {
  rank: ExerciseRankTier;
  nextRank: ExerciseRankTier | null;
  xpInTier: number;
  xpRequired: number;
  progressPercentage: number;
} {
  const safeXP = Math.max(0, Math.floor(xp || 0));
  let currentTier = EXERCISE_RANK_THRESHOLDS[0];
  let nextTier: (typeof EXERCISE_RANK_THRESHOLDS)[0] | null = EXERCISE_RANK_THRESHOLDS[1];

  for (let i = EXERCISE_RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXP >= EXERCISE_RANK_THRESHOLDS[i].minXP) {
      currentTier = EXERCISE_RANK_THRESHOLDS[i];
      nextTier = i < EXERCISE_RANK_THRESHOLDS.length - 1 ? EXERCISE_RANK_THRESHOLDS[i + 1] : null;
      break;
    }
  }

  if (!nextTier) {
    return {
      rank: currentTier.rank,
      nextRank: null,
      xpInTier: safeXP - currentTier.minXP,
      xpRequired: 1,
      progressPercentage: 100,
    };
  }

  const xpInTier = safeXP - currentTier.minXP;
  const xpRequired = nextTier.minXP - currentTier.minXP;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((xpInTier / xpRequired) * 100)));

  return {
    rank: currentTier.rank,
    nextRank: nextTier.rank,
    xpInTier,
    xpRequired,
    progressPercentage,
  };
}

export function getMuscleRankByXP(xp: number): {
  rank: MuscleRankTier;
  nextRank: MuscleRankTier | null;
  progressPercentage: number;
  nextTargetXP: number;
} {
  const safeXP = Math.max(0, Math.floor(xp || 0));
  let currentTier = MUSCLE_RANK_THRESHOLDS[0];
  let nextTier: (typeof MUSCLE_RANK_THRESHOLDS)[0] | null = MUSCLE_RANK_THRESHOLDS[1];

  for (let i = MUSCLE_RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXP >= MUSCLE_RANK_THRESHOLDS[i].minXP) {
      currentTier = MUSCLE_RANK_THRESHOLDS[i];
      nextTier = i < MUSCLE_RANK_THRESHOLDS.length - 1 ? MUSCLE_RANK_THRESHOLDS[i + 1] : null;
      break;
    }
  }

  if (!nextTier) {
    return {
      rank: currentTier.rank,
      nextRank: null,
      progressPercentage: 100,
      nextTargetXP: currentTier.minXP,
    };
  }

  const xpInTier = safeXP - currentTier.minXP;
  const span = nextTier.minXP - currentTier.minXP;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((xpInTier / span) * 100)));

  return {
    rank: currentTier.rank,
    nextRank: nextTier.rank,
    progressPercentage,
    nextTargetXP: nextTier.minXP,
  };
}

/**
 * Standard Brzycki 1RM Estimation Formula
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  if (reps > 30) return Math.round(weightKg * 1.5);
  return Math.round(weightKg * (36 / (37 - reps)));
}

/**
 * Normalizes muscle group name to a standard key
 */
export function normalizeMuscleGroup(raw?: string): string {
  if (!raw) return 'Chest';
  const lower = raw.toLowerCase();
  if (lower.includes('chest') || lower.includes('pec')) return 'Chest';
  if (lower.includes('back') || lower.includes('lat') || lower.includes('rhomboid') || lower.includes('trap')) return 'Back';
  if (lower.includes('leg') || lower.includes('quad') || lower.includes('glute') || lower.includes('hamstring') || lower.includes('calv')) return 'Legs';
  if (lower.includes('shoulder') || lower.includes('deltoid')) return 'Shoulders';
  if (lower.includes('bicep') || lower.includes('tricep') || lower.includes('arm') || lower.includes('forearm')) return 'Arms';
  if (lower.includes('core') || lower.includes('ab') || lower.includes('oblique')) return 'Core';
  return 'Chest';
}

/**
 * Primary Unified Progression Engine
 * Aggregates all user training history into ONE coherent progression state
 */
export function buildUnifiedProgress(params: {
  sessions: any[];
  runs?: any[];
  records?: any[];
  streakDays?: number;
}): UserProgress {
  const sessions = params.sessions || [];
  const runs = params.runs || [];
  const records = params.records || [];
  const streakDays = Math.max(0, params.streakDays || 0);

  // 1. Calculate History XP
  const historyXP = aggregateHistoryXP({
    sessions,
    runs,
    records,
    streaksWeeks: Math.floor(streakDays / 7),
  });

  // Total earned XP from real workouts, PRs, runs, and streaks
  const totalXP = historyXP.totalXP;
  const levelInfo = calculateLevelFromXP(totalXP);

  // 2. Aggregate per-exercise training stats & XP
  const exerciseMap: Record<string, ExerciseProgressItem> = {};
  const muscleAccumulator: Record<string, { xp: number; volumeKg: number; sets: number; exercises: Set<string> }> = {
    Chest: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
    Back: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
    Legs: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
    Shoulders: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
    Arms: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
    Core: { xp: 0, volumeKg: 0, sets: 0, exercises: new Set() },
  };

  let totalSetsCount = 0;
  let totalVolumeKg = 0;

  // Process all completed sessions
  sessions.forEach((session) => {
    const sessionDate = session.startTime ? new Date(session.startTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    let sessionSetsVolume = 0;
    const sets = session.sets || [];

    sets.forEach((set: any) => {
      if (!set.isCompleted) return;

      totalSetsCount += 1;
      const weight = Number(set.weightKg || 0);
      const reps = Number(set.reps || 0);
      const volume = weight * reps;
      sessionSetsVolume += volume;

      const exerciseId = set.exerciseId || set.exercise_id || 'unknown';
      const exerciseName = set.exerciseName || set.exercise?.name || 'Exercise';
      const muscle = normalizeMuscleGroup(set.primaryMuscle || set.exercise?.primaryMuscle);

      // Compute Set XP
      const setXPRes = calculateSetXP({
        weightKg: weight,
        reps,
        isWarmup: set.isWarmup,
        rpe: set.rpe,
        holdDurationSec: set.holdDurationSec,
      });

      const normalizedKey = (exerciseId || exerciseName).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Update Exercise Progress Item
      if (!exerciseMap[normalizedKey]) {
        exerciseMap[normalizedKey] = {
          exerciseId: normalizedKey,
          exerciseName,
          primaryMuscle: muscle,
          rank: 'D',
          level: 1,
          currentXP: 0,
          nextRankXP: 300,
          progressPercentage: 0,
          totalSets: 0,
          totalReps: 0,
          totalVolumeKg: 0,
          personalBestWeightKg: 0,
          personalBestReps: 0,
          estimated1RMKg: 0,
          historyPoints: [],
          nextMilestone: {
            targetDescription: `Reach ${weight > 0 ? weight + 5 : 10} kg × ${Math.max(reps, 8)}`,
            rewardXP: 150,
            metricType: 'WEIGHT',
            currentVal: weight,
            targetVal: weight + 5,
          },
        };
      }
      if (exerciseId && !exerciseMap[exerciseId]) {
        exerciseMap[exerciseId] = exerciseMap[normalizedKey];
      }
      if (exerciseName && !exerciseMap[exerciseName]) {
        exerciseMap[exerciseName] = exerciseMap[normalizedKey];
      }

      const item = exerciseMap[normalizedKey];
      item.totalSets += 1;
      item.totalReps += reps;
      item.totalVolumeKg += volume;
      item.currentXP += setXPRes.xpAwarded;

      if (weight > item.personalBestWeightKg) {
        item.personalBestWeightKg = weight;
        item.personalBestReps = reps;
      }
      const e1RM = estimate1RM(weight, reps);
      if (e1RM > item.estimated1RMKg) {
        item.estimated1RMKg = e1RM;
      }

      item.historyPoints.push({
        date: sessionDate,
        weightKg: weight,
        reps,
        volumeKg: volume,
        estimated1RMKg: e1RM,
      });

      // Update Muscle Group Accumulator
      muscleAccumulator[muscle].xp += setXPRes.xpAwarded;
      muscleAccumulator[muscle].volumeKg += volume;
      muscleAccumulator[muscle].sets += 1;
      muscleAccumulator[muscle].exercises.add(exerciseName);
    });

    totalVolumeKg += Math.max(sessionSetsVolume, Number(session.totalVolumeKg || 0));
  });

  // Calculate final ranks for all exercises
  Object.values(exerciseMap).forEach((item) => {
    const rankRes = getExerciseRankByXP(item.currentXP);
    item.rank = rankRes.rank;
    item.progressPercentage = rankRes.progressPercentage;
    item.nextRankXP = rankRes.xpRequired + item.currentXP - rankRes.xpInTier;
    item.nextMilestone = {
      targetDescription: `${item.exerciseName}: Reach ${item.personalBestWeightKg > 0 ? item.personalBestWeightKg + 5 : 10} kg × ${Math.max(item.personalBestReps, 8)}`,
      rewardXP: 300,
      metricType: 'WEIGHT',
      currentVal: item.personalBestWeightKg,
      targetVal: item.personalBestWeightKg + 5,
    };
  });

  // 3. Muscle Progress Map
  const muscleProgress: Record<string, MuscleProgressItem> = {};
  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  muscleGroups.forEach((m) => {
    const data = muscleAccumulator[m];
    const xp = data.xp;
    const sets = data.sets;
    const vol = data.volumeKg;

    const rankInfo = getMuscleRankByXP(xp);
    muscleProgress[m] = {
      muscleGroup: m,
      rank: rankInfo.rank,
      currentXP: xp,
      targetXP: rankInfo.nextTargetXP,
      progressPercentage: rankInfo.progressPercentage,
      totalSets: sets,
      totalVolumeKg: vol,
      contributingExercises: Array.from(data.exercises),
    };
  });

  // 4. Determine Top Ranks
  let topExName = 'None';
  let topExRank: ExerciseRankTier = 'D';
  let maxExXP = -1;
  Object.values(exerciseMap).forEach((ex) => {
    if (ex.currentXP > maxExXP && ex.currentXP > 0) {
      maxExXP = ex.currentXP;
      topExName = ex.exerciseName;
      topExRank = ex.rank;
    }
  });

  let topMuscle = 'None';
  let topMuscleRank: MuscleRankTier = 'D';
  let maxMuscleXP = -1;
  Object.values(muscleProgress).forEach((mp) => {
    if (mp.currentXP > maxMuscleXP && mp.currentXP > 0) {
      maxMuscleXP = mp.currentXP;
      topMuscle = mp.muscleGroup;
      topMuscleRank = mp.rank;
    }
  });

  // 5. Weekly Comparison Dashboard
  const weeklyDashboard = calculateWeeklyDashboard(sessions, records, runs);

  // 6. Real Achievements (dynamically awarded based on actual achievements)
  const recentAchievements: AchievementItem[] = [];
  if (records.length > 0) {
    const topPR = records[0];
    recentAchievements.push({
      id: 'ach-pr',
      title: `New ${topPR.exerciseName} PR`,
      description: `Logged ${topPR.value} milestone`,
      icon: 'trophy',
      xpAwarded: 150,
      unlockedAt: 'Recently',
      category: 'PR',
    });
  }
  if (sessions.length >= 7) {
    recentAchievements.push({
      id: 'ach-streak',
      title: '7-Session Dedication',
      description: 'Logged 7+ completed training sessions',
      icon: 'flame',
      xpAwarded: 100,
      unlockedAt: 'Recently',
      category: 'STREAK',
    });
  }
  if (levelInfo.level > 1) {
    recentAchievements.push({
      id: 'ach-level',
      title: `Level ${levelInfo.level} Reached`,
      description: `Attained the title of ${levelInfo.title}`,
      icon: 'medal',
      xpAwarded: 250,
      unlockedAt: 'Recently',
      category: 'LEVEL',
    });
  }
  if (totalVolumeKg >= 10000) {
    recentAchievements.push({
      id: 'ach-vol',
      title: '10,000 kg Volume Club',
      description: 'Pushed past monumental tonnage',
      icon: 'dumbbell',
      xpAwarded: 200,
      unlockedAt: 'Recently',
      category: 'VOLUME',
    });
  }

  return {
    level: levelInfo.level,
    rankTitle: levelInfo.title,
    totalXP,
    currentLevelXP: levelInfo.xpInLevel,
    nextLevelXP: levelInfo.xpForNextLevel,
    xpToNextLevel: levelInfo.xpToNextLevel,
    progressPercentage: levelInfo.progressPercentage,
    streakDays: streakDays !== undefined && streakDays >= 0 ? streakDays : (sessions.length > 0 ? 1 : 0),
    totalWorkouts: sessions.length,
    totalSets: totalSetsCount,
    totalVolumeKg: Math.round(totalVolumeKg),
    topExerciseRank: { name: topExName, rank: topExRank },
    topMuscleRank: { muscle: topMuscle, rank: topMuscleRank },
    personalRecords: records,
    exerciseProgress: exerciseMap,
    muscleProgress,
    recentAchievements,
    weeklyDashboard,
    activityMatrix: buildActivityMatrix(sessions, runs),
  };
}

/**
 * Calculates This Week vs Last Week KPI comparison
 */
function calculateWeeklyDashboard(sessions: any[], records: any[], runs: any[] = []): WeeklyProgressDashboard {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  let thisWeekWorkouts = 0;
  let lastWeekWorkouts = 0;
  let thisWeekVolume = 0;
  let lastWeekVolume = 0;
  let thisWeekSets = 0;
  let lastWeekSets = 0;
  const thisWeekExercises = new Set<string>();

  sessions.forEach((s) => {
    if (s.isCompleted === false) return;
    const d = new Date(s.startTime || s.createdAt || s.date || Date.now());
    const vol = Number(s.totalVolumeKg || 0);
    const setsCount = (s.sets || []).length;

    if (d >= startOfThisWeek) {
      thisWeekWorkouts += 1;
      thisWeekVolume += vol;
      thisWeekSets += setsCount;
      (s.sets || []).forEach((st: any) => {
        if (st.exerciseName) thisWeekExercises.add(st.exerciseName);
      });
    } else if (d >= startOfLastWeek && d <= endOfLastWeek) {
      lastWeekWorkouts += 1;
      lastWeekVolume += vol;
      lastWeekSets += setsCount;
    }
  });

  const hasLiveActivity = sessions.length > 0 || runs.length > 0;
  const finalThisWeekWorkouts = thisWeekWorkouts;
  const finalLastWeekWorkouts = lastWeekWorkouts;
  const finalThisWeekVol = thisWeekVolume;
  const finalLastWeekVol = lastWeekVolume;
  const finalThisWeekSets = thisWeekSets;
  const finalLastWeekSets = lastWeekSets;
  const finalThisWeekPRs = records.length;
  const finalLastWeekPRs = 0;

  const volDelta = finalLastWeekVol > 0
    ? Math.round(((finalThisWeekVol - finalLastWeekVol) / finalLastWeekVol) * 100)
    : (finalThisWeekVol > 0 ? 100 : 0);

  return {
    workouts: finalThisWeekWorkouts,
    volumeKg: finalThisWeekVol,
    sets: finalThisWeekSets,
    exercisesCount: thisWeekExercises.size,
    prsCount: finalThisWeekPRs,
    lastWeekWorkouts: finalLastWeekWorkouts,
    lastWeekVolumeKg: finalLastWeekVol,
    lastWeekSets: finalLastWeekSets,
    lastWeekPrsCount: finalLastWeekPRs,
    volumeDeltaPercent: volDelta,
    workoutsDelta: finalThisWeekWorkouts - finalLastWeekWorkouts,
    prsDelta: finalThisWeekPRs - finalLastWeekPRs,
  };
}

/**
 * Builds GitHub-style Activity Contribution Matrix data from sessions and runs
 */
export function buildActivityMatrix(
  sessions: any[] = [],
  runs: any[] = []
): Record<string, DayActivityRecord> {
  const matrix: Record<string, DayActivityRecord> = {};

  // Populate from completed workout sessions
  sessions.forEach((s) => {
    const rawDate = s.startTime || s.createdAt || s.date;
    if (!rawDate) return;
    const dateKey = new Date(rawDate).toISOString().slice(0, 10);
    const xp = calculateActivityXP({
      type: 'WORKOUT',
      durationSeconds: s.durationSeconds || 2400,
      totalVolumeKg: s.totalVolumeKg || 0,
    }).xpAwarded;

    if (!matrix[dateKey]) {
      matrix[dateKey] = {
        date: dateKey,
        xp: 0,
        isRestDay: false,
        activities: [],
      };
    }
    matrix[dateKey].xp += xp;
    matrix[dateKey].activities?.push({
      type: 'strength',
      title: s.name || 'Strength Workout',
      xp,
      meta: s.totalVolumeKg ? `${Math.round(s.totalVolumeKg).toLocaleString()} kg volume` : undefined,
    });
  });

  // Populate from completed outdoor runs
  runs.forEach((r) => {
    const rawDate = r.startTime || r.createdAt || r.date;
    if (!rawDate) return;
    const dateKey = new Date(rawDate).toISOString().slice(0, 10);
    const xp = calculateActivityXP({
      type: 'RUN',
      distanceMeters: r.distanceMeters || 5000,
      durationSeconds: r.durationSeconds || 1500,
    }).xpAwarded;

    if (!matrix[dateKey]) {
      matrix[dateKey] = {
        date: dateKey,
        xp: 0,
        isRestDay: false,
        activities: [],
      };
    }
    matrix[dateKey].xp += xp;
    matrix[dateKey].activities?.push({
      type: 'run',
      title: 'Outdoor Run',
      xp,
      meta: r.distanceMeters ? `${(r.distanceMeters / 1000).toFixed(2)} km` : undefined,
    });
  });

  return matrix;
}
