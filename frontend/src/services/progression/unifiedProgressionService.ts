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

  // Base starting XP for demo athlete if empty so app immediately feels populated
  const totalXP = Math.max(historyXP.totalXP, sessions.length > 0 ? historyXP.totalXP : 7850);
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

  // Ensure standard exercises exist in demo state if user has fewer sessions
  const standardExercises = [
    { id: 'squat', name: 'Barbell Squat', muscle: 'Legs', xp: 2650, pb: 140, reps: 5, vol: 6200, sets: 28 },
    { id: 'bench-press', name: 'Barbell Bench Press', muscle: 'Chest', xp: 1840, pb: 100, reps: 8, vol: 5400, sets: 24 },
    { id: 'deadlift', name: 'Barbell Deadlift', muscle: 'Back', xp: 2820, pb: 170, reps: 5, vol: 7100, sets: 22 },
    { id: 'overhead-press', name: 'Overhead Press', muscle: 'Shoulders', xp: 1120, pb: 65, reps: 6, vol: 2300, sets: 18 },
    { id: 'barbell-curl', name: 'Barbell Curl', muscle: 'Arms', xp: 890, pb: 45, reps: 10, vol: 1800, sets: 16 },
    { id: 'pull-up', name: 'Pull-Up', muscle: 'Back', xp: 1520, pb: 0, reps: 15, vol: 2200, sets: 20 },
    { id: 'lever-pec-deck-fly', name: 'Lever Pec Deck Fly', muscle: 'Chest', xp: 1240, pb: 75, reps: 12, vol: 3100, sets: 18 },
  ];

  standardExercises.forEach((std) => {
    if (!exerciseMap[std.id] && !exerciseMap[std.name]) {
      const e1rm = estimate1RM(std.pb, std.reps);
      const exItem: ExerciseProgressItem = {
        exerciseId: std.id,
        exerciseName: std.name,
        primaryMuscle: std.muscle,
        rank: getExerciseRankByXP(std.xp).rank,
        level: Math.max(1, Math.floor(std.xp / 400)),
        currentXP: std.xp,
        nextRankXP: getExerciseRankByXP(std.xp).nextRank ? (std.xp + getExerciseRankByXP(std.xp).xpRequired) : std.xp + 500,
        progressPercentage: getExerciseRankByXP(std.xp).progressPercentage,
        totalSets: std.sets,
        totalReps: std.sets * std.reps,
        totalVolumeKg: std.vol,
        personalBestWeightKg: std.pb,
        personalBestReps: std.reps,
        estimated1RMKg: e1rm,
        historyPoints: [
          { date: '2026-09-12', weightKg: std.pb - 15, reps: std.reps, volumeKg: (std.pb - 15) * std.reps * 3, estimated1RMKg: estimate1RM(std.pb - 15, std.reps) },
          { date: '2026-09-20', weightKg: std.pb - 10, reps: std.reps, volumeKg: (std.pb - 10) * std.reps * 3, estimated1RMKg: estimate1RM(std.pb - 10, std.reps) },
          { date: '2026-09-28', weightKg: std.pb - 5, reps: std.reps, volumeKg: (std.pb - 5) * std.reps * 3, estimated1RMKg: estimate1RM(std.pb - 5, std.reps) },
          { date: '2026-10-03', weightKg: std.pb, reps: std.reps, volumeKg: std.pb * std.reps * 3, estimated1RMKg: e1rm },
        ],
        nextMilestone: {
          targetDescription: `Reach ${std.pb + 5} kg × ${std.reps} reps`,
          rewardXP: 200,
          metricType: 'WEIGHT',
          currentVal: std.pb,
          targetVal: std.pb + 5,
        },
      };
      exerciseMap[std.id] = exItem;
      exerciseMap[std.name] = exItem;

      // Add to muscle accumulator if initial preview
      if (sessions.length === 0) {
        const m = std.muscle;
        if (muscleAccumulator[m]) {
          muscleAccumulator[m].xp += std.xp;
          muscleAccumulator[m].volumeKg += std.vol;
          muscleAccumulator[m].sets += std.sets;
          muscleAccumulator[m].exercises.add(std.name);
        }
      }
    }
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
    // Baseline demo values only if no sessions recorded
    const hasLiveSessions = sessions.length > 0;
    const defaultXp = m === 'Chest' ? 3200 : m === 'Back' ? 4800 : m === 'Legs' ? 4900 : m === 'Shoulders' ? 2200 : m === 'Arms' ? 2100 : 1400;
    const defaultSets = m === 'Chest' ? 42 : m === 'Back' ? 46 : m === 'Legs' ? 38 : m === 'Shoulders' ? 24 : m === 'Arms' ? 22 : 16;

    const xp = hasLiveSessions ? data.xp : defaultXp;
    const sets = hasLiveSessions ? data.sets : defaultSets;
    const vol = hasLiveSessions ? data.volumeKg : Math.max(data.volumeKg, sets * 180);

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
  let topExName = 'Barbell Squat';
  let topExRank: ExerciseRankTier = 'S';
  let maxExXP = -1;
  Object.values(exerciseMap).forEach((ex) => {
    if (ex.currentXP > maxExXP) {
      maxExXP = ex.currentXP;
      topExName = ex.exerciseName;
      topExRank = ex.rank;
    }
  });

  let topMuscle = 'Legs';
  let topMuscleRank: MuscleRankTier = 'S';
  let maxMuscleXP = -1;
  Object.values(muscleProgress).forEach((mp) => {
    if (mp.currentXP > maxMuscleXP) {
      maxMuscleXP = mp.currentXP;
      topMuscle = mp.muscleGroup;
      topMuscleRank = mp.rank;
    }
  });

  // 5. Weekly Comparison Dashboard
  const weeklyDashboard = calculateWeeklyDashboard(sessions, records);

  // 6. Recent Achievements (custom vector icon keys only, no emojis)
  const recentAchievements: AchievementItem[] = [
    {
      id: 'ach-1',
      title: 'New Bench Press PR',
      description: 'Logged 100 kg × 8 reps milestone',
      icon: 'trophy',
      xpAwarded: 150,
      unlockedAt: '2 days ago',
      category: 'PR',
    },
    {
      id: 'ach-2',
      title: '7-Day Workout Streak',
      description: 'Sustained perfect consistency across all scheduled sessions',
      icon: 'flame',
      xpAwarded: 100,
      unlockedAt: 'Yesterday',
      category: 'STREAK',
    },
    {
      id: 'ach-3',
      title: `Level ${levelInfo.level} Reached`,
      description: `Attained the title of ${levelInfo.title}`,
      icon: 'medal',
      xpAwarded: 250,
      unlockedAt: '3 days ago',
      category: 'LEVEL',
    },
    {
      id: 'ach-4',
      title: '10,000 kg Volume Club',
      description: 'Pushed past monumental weekly tonnage',
      icon: 'dumbbell',
      xpAwarded: 200,
      unlockedAt: '1 week ago',
      category: 'VOLUME',
    },
  ];

  return {
    level: levelInfo.level,
    rankTitle: levelInfo.title,
    totalXP,
    currentLevelXP: levelInfo.xpInLevel,
    nextLevelXP: levelInfo.xpForNextLevel,
    xpToNextLevel: levelInfo.xpToNextLevel,
    progressPercentage: levelInfo.progressPercentage,
    streakDays: streakDays !== undefined && streakDays > 0 ? streakDays : (sessions.length > 0 ? 5 : 4),
    totalWorkouts: sessions.length > 0 ? sessions.length : 14,
    totalSets: sessions.length > 0 ? totalSetsCount : 86,
    totalVolumeKg: sessions.length > 0 ? totalVolumeKg : 14850,
    topExerciseRank: { name: topExName, rank: topExRank },
    topMuscleRank: { muscle: topMuscle, rank: topMuscleRank },
    personalRecords: records.length > 0 ? records : [
      { exerciseName: 'Barbell Bench Press', value: 100, type: 'MAX_WEIGHT', achievedAt: '2026-10-02' },
      { exerciseName: 'Barbell Squat', value: 140, type: 'MAX_WEIGHT', achievedAt: '2026-09-28' },
      { exerciseName: 'Barbell Deadlift', value: 170, type: 'MAX_WEIGHT', achievedAt: '2026-09-25' },
    ],
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
function calculateWeeklyDashboard(sessions: any[], records: any[]): WeeklyProgressDashboard {
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

  const hasLiveActivity = sessions.length > 0;
  const finalThisWeekWorkouts = hasLiveActivity ? thisWeekWorkouts : 4;
  const finalLastWeekWorkouts = hasLiveActivity ? lastWeekWorkouts : 3;
  const finalThisWeekVol = hasLiveActivity ? thisWeekVolume : 12480;
  const finalLastWeekVol = hasLiveActivity ? lastWeekVolume : 11140;
  const finalThisWeekSets = hasLiveActivity ? thisWeekSets : 86;
  const finalLastWeekSets = hasLiveActivity ? lastWeekSets : 74;
  const finalThisWeekPRs = hasLiveActivity ? records.length : 3;
  const finalLastWeekPRs = hasLiveActivity ? 0 : 1;

  const volDelta = finalLastWeekVol > 0
    ? Math.round(((finalThisWeekVol - finalLastWeekVol) / finalLastWeekVol) * 100)
    : (finalThisWeekVol > 0 ? 100 : (hasLiveActivity ? 0 : 12));

  return {
    workouts: finalThisWeekWorkouts,
    volumeKg: finalThisWeekVol,
    sets: finalThisWeekSets,
    exercisesCount: Math.max(thisWeekExercises.size, hasLiveActivity ? 1 : 24),
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
  const today = new Date();

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

  // If user has fresh/empty session history, provide a 52-week (full year) baseline consistency matrix
  if (Object.keys(matrix).length === 0) {
    for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
      const d = new Date(today);
      d.setDate(today.getDate() - daysAgo);
      const dateKey = d.toISOString().slice(0, 10);
      const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Mon, ..., 6 = Sun

      if (dayOfWeek === 2 || dayOfWeek === 6) {
        // Wednesday & Sunday: Planned Rest & Recovery (Orange)
        matrix[dateKey] = {
          date: dateKey,
          xp: 0,
          isRestDay: true,
        };
      } else if (dayOfWeek === 0 || dayOfWeek === 3) {
        // Heavy/Hard Workout (100–149 XP)
        const xp = 110 + ((daysAgo * 7) % 35);
        matrix[dateKey] = {
          date: dateKey,
          xp,
          isRestDay: false,
          activities: [
            {
              type: 'strength',
              title: dayOfWeek === 0 ? 'Upper Body Heavy' : 'Legs & Core Power',
              xp: xp - 25,
              meta: '5,800 kg volume',
            },
            { type: 'daily_goal', title: 'Daily Volume Target', xp: 25 },
          ],
        };
      } else if (dayOfWeek === 1 || dayOfWeek === 5) {
        // Elite (150+ XP) or Moderate (50–99 XP)
        const isElite = daysAgo % 4 === 0;
        const xp = isElite ? 165 : 85;
        matrix[dateKey] = {
          date: dateKey,
          xp,
          isRestDay: false,
          activities: [
            {
              type: dayOfWeek === 5 ? 'run' : 'strength',
              title: dayOfWeek === 5 ? 'Tempo 5K Run' : 'Shoulders & Arms',
              xp,
              meta: dayOfWeek === 5 ? '24:18 • 4:51/km' : '3,200 kg volume',
            },
          ],
        };
      } else if (dayOfWeek === 4) {
        // Friday light activity (1–49 XP)
        matrix[dateKey] = {
          date: dateKey,
          xp: 40,
          isRestDay: false,
          activities: [
            { type: 'mobility', title: 'Full Body Mobility & Core', xp: 40, meta: '20 min session' },
          ],
        };
      }
    }
  }

  return matrix;
}
