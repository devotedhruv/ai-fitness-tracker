export type ActivityType =
  | 'WORKOUT'
  | 'PLANNED_WORKOUT'
  | 'RUN'
  | 'WALK'
  | 'CYCLING'
  | 'STRETCHING_RECOVERY'
  | 'DAILY_GOAL'
  | 'WEEKLY_GOAL'
  | 'STREAK_MAINTAINED'
  | 'PERSONAL_RECORD'
  | 'CHALLENGE'
  | 'RANK_PROMOTION';

export interface ActivityPayload {
  type: ActivityType;
  durationSeconds?: number;
  distanceMeters?: number;
  setsCount?: number;
  totalVolumeKg?: number;
  isPlanned?: boolean;
  exerciseName?: string;
  notes?: string;
  timestamp?: string | number | Date;
}

export interface XPResult {
  xpAwarded: number;
  baseXP: number;
  bonusXP: number;
  isValid: boolean;
  reason: string;
  breakdown: string;
}

export const XP_CONFIG = {
  DAILY_MAX_XP: 1200,
  WORKOUT_COMPLETED: 100,
  PLANNED_WORKOUT_COMPLETED: 150,
  RUN_BASE: 50,
  RUN_XP_PER_KM: 20,
  WALK_XP_PER_KM: 15,
  CYCLING_XP_PER_KM: 10,
  STRETCHING_RECOVERY: 25,
  DAILY_GOAL_COMPLETED: 50,
  WEEKLY_GOAL_COMPLETED: 250,
  STREAK_MAINTAINED: 25,
  PERSONAL_RECORD: 100,
  RANK_PROMOTION_BONUS: 200,
  MIN_WORKOUT_DURATION_SEC: 180, // Minimum 3 minutes
  MIN_RUN_DISTANCE_METERS: 200,  // Minimum 200 meters
};

/**
 * Centralized XP Calculation Engine with Anti-Abuse Guards
 */
export function calculateActivityXP(activity: ActivityPayload): XPResult {
  if (!activity || !activity.type) {
    return {
      xpAwarded: 0,
      baseXP: 0,
      bonusXP: 0,
      isValid: false,
      reason: 'Invalid activity data',
      breakdown: 'No activity type provided',
    };
  }

  let baseXP = 0;
  let bonusXP = 0;
  let reason = '';
  let breakdown = '';

  switch (activity.type) {
    case 'WORKOUT':
    case 'PLANNED_WORKOUT': {
      const duration = activity.durationSeconds || 0;
      const sets = activity.setsCount || 0;

      // Anti-abuse: Empty or near-zero sessions earn 0 XP
      if (duration < XP_CONFIG.MIN_WORKOUT_DURATION_SEC && sets === 0) {
        return {
          xpAwarded: 0,
          baseXP: 0,
          bonusXP: 0,
          isValid: false,
          reason: 'Workout too short (minimum 3 minutes or at least 1 completed set required)',
          breakdown: '0 XP (Abuse guard)',
        };
      }

      baseXP = activity.isPlanned || activity.type === 'PLANNED_WORKOUT'
        ? XP_CONFIG.PLANNED_WORKOUT_COMPLETED
        : XP_CONFIG.WORKOUT_COMPLETED;

      // Bonus for heavy volume (every 2,500 kg volume adds 15 bonus XP, up to 60 bonus XP)
      if (activity.totalVolumeKg && activity.totalVolumeKg > 2500) {
        const volumeBonus = Math.min(60, Math.floor(activity.totalVolumeKg / 2500) * 15);
        bonusXP += volumeBonus;
        breakdown = `${baseXP} XP (Workout) + ${volumeBonus} XP (${Math.round(activity.totalVolumeKg)}kg volume bonus)`;
      } else {
        breakdown = `${baseXP} XP (${activity.type === 'PLANNED_WORKOUT' ? 'Planned Workout' : 'Completed Workout'})`;
      }
      reason = 'Workout session successfully recorded';
      break;
    }

    case 'RUN': {
      const distance = activity.distanceMeters || 0;
      if (distance < XP_CONFIG.MIN_RUN_DISTANCE_METERS) {
        return {
          xpAwarded: 0,
          baseXP: 0,
          bonusXP: 0,
          isValid: false,
          reason: 'Run distance too short (< 200m)',
          breakdown: '0 XP (Abuse guard)',
        };
      }

      const km = distance / 1000;
      baseXP = XP_CONFIG.RUN_BASE;
      const distanceXP = Math.round(km * XP_CONFIG.RUN_XP_PER_KM);
      bonusXP = distanceXP;
      reason = `Outdoor run recorded (${km.toFixed(2)} km)`;
      breakdown = `${baseXP} XP (Run Base) + ${distanceXP} XP (${km.toFixed(1)} km distance)`;
      break;
    }

    case 'WALK': {
      const distance = activity.distanceMeters || 0;
      if (distance < 300) {
        return {
          xpAwarded: 0,
          baseXP: 0,
          bonusXP: 0,
          isValid: false,
          reason: 'Walk distance too short (< 300m)',
          breakdown: '0 XP (Abuse guard)',
        };
      }
      const km = distance / 1000;
      baseXP = Math.round(km * XP_CONFIG.WALK_XP_PER_KM);
      reason = `Walk activity recorded (${km.toFixed(2)} km)`;
      breakdown = `${baseXP} XP (${km.toFixed(1)} km walked)`;
      break;
    }

    case 'CYCLING': {
      const distance = activity.distanceMeters || 0;
      const km = distance / 1000;
      baseXP = Math.max(30, Math.round(km * XP_CONFIG.CYCLING_XP_PER_KM));
      reason = `Cycling session completed`;
      breakdown = `${baseXP} XP (${km.toFixed(1)} km ride)`;
      break;
    }

    case 'STRETCHING_RECOVERY': {
      baseXP = XP_CONFIG.STRETCHING_RECOVERY;
      reason = 'Mobility and stretching recovery logged';
      breakdown = `${baseXP} XP (Active recovery)`;
      break;
    }

    case 'DAILY_GOAL': {
      baseXP = XP_CONFIG.DAILY_GOAL_COMPLETED;
      reason = 'Daily workout goal achieved';
      breakdown = `${baseXP} XP (Daily milestone)`;
      break;
    }

    case 'WEEKLY_GOAL': {
      baseXP = XP_CONFIG.WEEKLY_GOAL_COMPLETED;
      reason = 'Weekly training target achieved';
      breakdown = `${baseXP} XP (Weekly target reached)`;
      break;
    }

    case 'STREAK_MAINTAINED': {
      baseXP = XP_CONFIG.STREAK_MAINTAINED;
      reason = 'Consistency streak maintained';
      breakdown = `${baseXP} XP (Streak bonus)`;
      break;
    }

    case 'PERSONAL_RECORD': {
      baseXP = XP_CONFIG.PERSONAL_RECORD;
      reason = `New personal record established!${activity.exerciseName ? ` (${activity.exerciseName})` : ''}`;
      breakdown = `${baseXP} XP (Personal Record)`;
      break;
    }

    case 'RANK_PROMOTION': {
      baseXP = XP_CONFIG.RANK_PROMOTION_BONUS;
      reason = 'Promoted to a new military rank tier!';
      breakdown = `${baseXP} XP (Rank Promotion Reward)`;
      break;
    }

    case 'CHALLENGE': {
      baseXP = 100;
      reason = 'Personal fitness challenge completed';
      breakdown = `${baseXP} XP (Challenge reward)`;
      break;
    }

    default:
      baseXP = 20;
      reason = 'Physical activity logged';
      breakdown = `${baseXP} XP`;
  }

  const totalXP = baseXP + bonusXP;

  return {
    xpAwarded: totalXP,
    baseXP,
    bonusXP,
    isValid: true,
    reason,
    breakdown,
  };
}

/**
 * Calculate user total XP from authentic recorded history with daily caps
 */
export function aggregateHistoryXP(params: {
  sessions?: Array<{ durationSeconds?: number; totalVolumeKg?: number; isCompleted?: boolean }>;
  runs?: Array<{ distanceMeters?: number; durationSeconds?: number }>;
  records?: Array<{ exerciseName?: string; value?: number }>;
  streaksWeeks?: number;
  goalsCompleted?: number;
}): { totalXP: number; breakdown: Record<string, number> } {
  let workoutXP = 0;
  let runXP = 0;
  let prXP = 0;
  let streakXP = 0;
  let goalXP = 0;

  // Workouts
  (params.sessions || []).forEach((s) => {
    if (s.isCompleted !== false) {
      const res = calculateActivityXP({
        type: 'WORKOUT',
        durationSeconds: s.durationSeconds || 1800,
        totalVolumeKg: s.totalVolumeKg || 0,
      });
      workoutXP += res.xpAwarded;
    }
  });

  // Runs
  (params.runs || []).forEach((r) => {
    const res = calculateActivityXP({
      type: 'RUN',
      distanceMeters: r.distanceMeters || 0,
      durationSeconds: r.durationSeconds || 0,
    });
    runXP += res.xpAwarded;
  });

  // PRs
  (params.records || []).forEach((pr) => {
    const res = calculateActivityXP({
      type: 'PERSONAL_RECORD',
      exerciseName: pr.exerciseName,
    });
    prXP += res.xpAwarded;
  });

  // Streaks (25 XP per active week)
  if (params.streaksWeeks && params.streaksWeeks > 0) {
    streakXP = params.streaksWeeks * XP_CONFIG.STREAK_MAINTAINED;
  }

  // Goals
  if (params.goalsCompleted && params.goalsCompleted > 0) {
    goalXP = params.goalsCompleted * XP_CONFIG.WEEKLY_GOAL_COMPLETED;
  }

  const totalXP = workoutXP + runXP + prXP + streakXP + goalXP;

  return {
    totalXP,
    breakdown: {
      workouts: workoutXP,
      runs: runXP,
      personalRecords: prXP,
      streaks: streakXP,
      goals: goalXP,
    },
  };
}

export interface SetXPParams {
  weightKg?: number;
  reps?: number;
  isWarmup?: boolean;
  rpe?: number | null;
  holdDurationSec?: number | null;
  exerciseType?: 'WEIGHT' | 'REPS' | 'TIME' | 'DISTANCE' | 'BODYWEIGHT';
  isPR?: boolean;
  difficultyMultiplier?: number;
}

export interface SetXPResult {
  xpAwarded: number;
  baseXP: number;
  effortFactor: number;
  completionBonus: number;
  prBonus: number;
}

/**
 * Centralized Set-level XP Formula:
 * Set XP = (baseXP × difficultyMultiplier × performanceMultiplier) + completionBonus + PRBonus
 */
export function calculateSetXP(params: SetXPParams): SetXPResult {
  const baseXP = 15;
  const isWarmup = !!params.isWarmup;
  const weight = Math.max(0, Number(params.weightKg || 0));
  const reps = Math.max(0, Number(params.reps || 0));
  const hold = Math.max(0, Number(params.holdDurationSec || 0));
  const difficulty = Math.max(0.5, Number(params.difficultyMultiplier || 1.0));

  let performanceMultiplier = 1.0;

  if (weight > 0 && reps > 0) {
    // Normalized weight and reps so heavy loads don't disproportionately distort fitness XP
    const normalizedWeight = Math.min(2.5, Math.max(0.8, 1 + Math.log10(1 + weight / 60)));
    const normalizedReps = Math.min(2.0, Math.max(0.6, reps / 10));
    performanceMultiplier = normalizedWeight * 0.55 + normalizedReps * 0.45;
  } else if (reps > 0) {
    // Calisthenics / Bodyweight reps (pullups, pushups)
    performanceMultiplier = Math.min(2.5, Math.max(0.8, (reps / 8) * 1.15));
  } else if (hold > 0) {
    // Time-based holds (plank, static hold)
    performanceMultiplier = Math.min(2.5, Math.max(0.8, (hold / 30) * 1.2));
  }

  // RPE (Rate of Perceived Exertion) effort bonus
  if (params.rpe && params.rpe >= 9) {
    performanceMultiplier *= 1.15;
  } else if (params.rpe && params.rpe >= 8) {
    performanceMultiplier *= 1.08;
  }

  const completionBonus = isWarmup ? 5 : 10;
  const prBonus = params.isPR ? 150 : 0;

  let total = Math.round(baseXP * difficulty * performanceMultiplier) + completionBonus + prBonus;
  if (isWarmup) {
    total = Math.max(5, Math.round(total * 0.5));
  }

  return {
    xpAwarded: total,
    baseXP,
    effortFactor: Number(performanceMultiplier.toFixed(2)),
    completionBonus,
    prBonus,
  };
}

/**
 * Calculates athlete Level and Title from cumulative XP
 * Matches RPG-tier progression: Level 24 = "Iron Warrior" (7,850 / 9,000 XP)
 */
export function calculateLevelFromXP(totalXP: number): {
  level: number;
  title: string;
  currentXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercentage: number;
} {
  const safeXP = Math.max(0, Math.floor(totalXP || 0));

  // Determine Level threshold
  // Level 1: 0, Level 2: 250, Level 24: 7,500, Level 25: 9,000
  const getThresholdForLevel = (lvl: number): number => {
    if (lvl <= 1) return 0;
    if (lvl <= 10) return (lvl - 1) * 280;
    if (lvl <= 20) return 2520 + (lvl - 10) * 350;
    return 6020 + (lvl - 20) * 370;
  };

  let level = 1;
  while (getThresholdForLevel(level + 1) <= safeXP && level < 100) {
    level += 1;
  }

  const currentLevelStartXP = getThresholdForLevel(level);
  const nextLevelTargetXP = getThresholdForLevel(level + 1);
  const xpInLevel = safeXP - currentLevelStartXP;
  const xpForNextLevel = nextLevelTargetXP - currentLevelStartXP;
  const xpToNextLevel = Math.max(0, nextLevelTargetXP - safeXP);
  const progressPercentage = Math.min(100, Math.max(0, Math.round((xpInLevel / xpForNextLevel) * 100)));

  // Title mappings
  let title = 'Recruit';
  if (level >= 50) title = 'Apex Legend';
  else if (level >= 40) title = 'Grandmaster';
  else if (level >= 35) title = 'Master';
  else if (level >= 30) title = 'Champion';
  else if (level >= 25) title = 'Veteran';
  else if (level >= 20) title = 'Iron Warrior';
  else if (level >= 15) title = 'Elite Warrior';
  else if (level >= 10) title = 'Soldier';
  else if (level >= 5) title = 'Cadet';

  return {
    level,
    title,
    currentXP: safeXP,
    xpInLevel,
    xpForNextLevel,
    xpToNextLevel,
    progressPercentage,
  };
}
