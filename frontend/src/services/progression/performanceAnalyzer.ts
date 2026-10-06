export interface WorkoutHistoryItem {
  id?: string;
  startTime: string | Date;
  durationSeconds?: number;
  totalVolumeKg?: number;
  isCompleted?: boolean;
}

export interface RunHistoryItem {
  id?: string;
  startedAt: string | Date;
  distanceMeters: number;
  durationSeconds: number;
}

export interface PRHistoryItem {
  id?: string;
  exerciseName: string;
  value: number;
  achievedAt: string | Date;
}

export interface PersonalComparison {
  metric: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  deltaPercent: number;
  deltaAbsolute: number;
  direction: 'UP' | 'DOWN' | 'SAME';
  insightText: string;
}

export interface PerformanceAnalysis {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisWeekRunKm: number;
  lastWeekRunKm: number;
  thisWeekVolumeKg: number;
  lastWeekVolumeKg: number;
  thisWeekActiveMinutes: number;
  lastWeekActiveMinutes: number;
  comparisons: PersonalComparison[];
  encouragingInsights: string[];
  recentPRsCount: number;
  weeklyTargetCompletionRate: number;
}

/**
 * Analyzes the user's historical performance strictly comparing the user with their OWN previous performance.
 */
export function analyzePersonalPerformance(params: {
  sessions: WorkoutHistoryItem[];
  runs: RunHistoryItem[];
  records?: PRHistoryItem[];
  targetDaysPerWeek?: number;
}): PerformanceAnalysis {
  const now = new Date();

  // Determine start of current week (Monday) and start of previous week
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  // Group workout sessions
  let thisWeekWorkouts = 0;
  let lastWeekWorkouts = 0;
  let thisWeekVolumeKg = 0;
  let lastWeekVolumeKg = 0;
  let thisWeekDurationSec = 0;
  let lastWeekDurationSec = 0;

  params.sessions.forEach((s) => {
    if (s.isCompleted === false) return;
    const d = new Date(s.startTime);
    if (d >= startOfThisWeek) {
      thisWeekWorkouts += 1;
      thisWeekVolumeKg += s.totalVolumeKg || 0;
      thisWeekDurationSec += s.durationSeconds || 0;
    } else if (d >= startOfLastWeek && d <= endOfLastWeek) {
      lastWeekWorkouts += 1;
      lastWeekVolumeKg += s.totalVolumeKg || 0;
      lastWeekDurationSec += s.durationSeconds || 0;
    }
  });

  // Group runs
  let thisWeekRunMeters = 0;
  let lastWeekRunMeters = 0;

  params.runs.forEach((r) => {
    const d = new Date(r.startedAt);
    if (d >= startOfThisWeek) {
      thisWeekRunMeters += r.distanceMeters || 0;
      thisWeekDurationSec += r.durationSeconds || 0;
    } else if (d >= startOfLastWeek && d <= endOfLastWeek) {
      lastWeekRunMeters += r.distanceMeters || 0;
      lastWeekDurationSec += r.durationSeconds || 0;
    }
  });

  const thisWeekRunKm = Number((thisWeekRunMeters / 1000).toFixed(1));
  const lastWeekRunKm = Number((lastWeekRunMeters / 1000).toFixed(1));

  const thisWeekActiveMinutes = Math.round(thisWeekDurationSec / 60);
  const lastWeekActiveMinutes = Math.round(lastWeekDurationSec / 60);

  // Count PRs achieved in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPRsCount = (params.records || []).filter(
    (pr) => new Date(pr.achievedAt) >= thirtyDaysAgo
  ).length;

  const targetDays = params.targetDaysPerWeek || 4;
  const weeklyTargetCompletionRate = Math.min(100, Math.round((thisWeekWorkouts / targetDays) * 100));

  // Build comparisons
  const comparisons: PersonalComparison[] = [];
  const encouragingInsights: string[] = [];

  // 1. Workouts Comparison
  const workoutDelta = thisWeekWorkouts - lastWeekWorkouts;
  const workoutDeltaPct = lastWeekWorkouts > 0
    ? Math.round((workoutDelta / lastWeekWorkouts) * 100)
    : thisWeekWorkouts > 0
    ? 100
    : 0;

  let workoutInsight = '';
  if (thisWeekWorkouts > lastWeekWorkouts) {
    workoutInsight = `You completed ${thisWeekWorkouts} workouts this week compared with ${lastWeekWorkouts} last week (+${workoutDeltaPct}%).`;
    encouragingInsights.push(`Workout volume is up by ${workoutDeltaPct}% compared to last week!`);
  } else if (thisWeekWorkouts === lastWeekWorkouts && thisWeekWorkouts > 0) {
    workoutInsight = `Consistent cadence: matched your previous week's total of ${thisWeekWorkouts} workouts.`;
    encouragingInsights.push(`Solid consistency: maintaining your pace of ${thisWeekWorkouts} weekly sessions.`);
  } else {
    workoutInsight = `You have completed ${thisWeekWorkouts} workouts so far this week.`;
  }

  comparisons.push({
    metric: 'Weekly Workouts',
    currentValue: thisWeekWorkouts,
    previousValue: lastWeekWorkouts,
    unit: 'sessions',
    deltaPercent: workoutDeltaPct,
    deltaAbsolute: workoutDelta,
    direction: workoutDelta > 0 ? 'UP' : workoutDelta < 0 ? 'DOWN' : 'SAME',
    insightText: workoutInsight,
  });

  // 2. Running Distance Comparison
  if (thisWeekRunKm > 0 || lastWeekRunKm > 0) {
    const kmDelta = Number((thisWeekRunKm - lastWeekRunKm).toFixed(1));
    const kmDeltaPct = lastWeekRunKm > 0
      ? Math.round((kmDelta / lastWeekRunKm) * 100)
      : thisWeekRunKm > 0
      ? 100
      : 0;

    let runInsight = '';
    if (kmDelta > 0) {
      runInsight = `You ran ${kmDelta} km farther than your previous week!`;
      encouragingInsights.push(`You ran ${kmDelta} km farther than your previous week.`);
    } else if (kmDelta === 0) {
      runInsight = `Consistent endurance: matched your run distance of ${thisWeekRunKm} km.`;
    } else {
      runInsight = `Logged ${thisWeekRunKm} km this week.`;
    }

    comparisons.push({
      metric: 'Running Distance',
      currentValue: thisWeekRunKm,
      previousValue: lastWeekRunKm,
      unit: 'km',
      deltaPercent: kmDeltaPct,
      deltaAbsolute: kmDelta,
      direction: kmDelta > 0 ? 'UP' : kmDelta < 0 ? 'DOWN' : 'SAME',
      insightText: runInsight,
    });
  }

  // 3. Active Minutes Comparison
  const minDelta = thisWeekActiveMinutes - lastWeekActiveMinutes;
  const minDeltaPct = lastWeekActiveMinutes > 0
    ? Math.round((minDelta / lastWeekActiveMinutes) * 100)
    : thisWeekActiveMinutes > 0
    ? 100
    : 0;

  if (thisWeekActiveMinutes > lastWeekActiveMinutes && lastWeekActiveMinutes > 0) {
    encouragingInsights.push(`This week you exercised ${minDeltaPct}% more active minutes than last week.`);
  }

  comparisons.push({
    metric: 'Active Training Time',
    currentValue: thisWeekActiveMinutes,
    previousValue: lastWeekActiveMinutes,
    unit: 'min',
    deltaPercent: minDeltaPct,
    deltaAbsolute: minDelta,
    direction: minDelta > 0 ? 'UP' : minDelta < 0 ? 'DOWN' : 'SAME',
    insightText: `Active time: ${thisWeekActiveMinutes} min this week vs ${lastWeekActiveMinutes} min last week.`,
  });

  // 4. PR Recognition
  if (recentPRsCount > 0) {
    encouragingInsights.push(`New personal record achieved! You unlocked ${recentPRsCount} PR${recentPRsCount > 1 ? 's' : ''} recently.`);
  }

  // Fallback encouraging message if starting fresh
  if (encouragingInsights.length === 0) {
    encouragingInsights.push('Every session is a step forward in your personal fitness journey.');
  }

  return {
    thisWeekWorkouts,
    lastWeekWorkouts,
    thisWeekRunKm,
    lastWeekRunKm,
    thisWeekVolumeKg: Math.round(thisWeekVolumeKg),
    lastWeekVolumeKg: Math.round(lastWeekVolumeKg),
    thisWeekActiveMinutes,
    lastWeekActiveMinutes,
    comparisons,
    encouragingInsights,
    recentPRsCount,
    weeklyTargetCompletionRate,
  };
}
