export type ExerciseRankTier = 'D' | 'C' | 'B' | 'A' | 'S' | 'S+' | 'MASTER';
export type MuscleRankTier = 'D' | 'C' | 'B' | 'A' | 'S' | 'S+' | 'MASTER';

export interface ExerciseProgressItem {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  rank: ExerciseRankTier;
  level: number;
  currentXP: number;
  nextRankXP: number;
  progressPercentage: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  personalBestWeightKg: number;
  personalBestReps: number;
  estimated1RMKg: number;
  historyPoints: Array<{
    date: string;
    weightKg: number;
    reps: number;
    volumeKg: number;
    estimated1RMKg: number;
  }>;
  nextMilestone: {
    targetDescription: string;
    rewardXP: number;
    metricType: 'WEIGHT' | 'VOLUME' | 'REPS';
    currentVal: number;
    targetVal: number;
  };
}

export interface MuscleProgressItem {
  muscleGroup: string; // e.g. 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'
  rank: MuscleRankTier;
  currentXP: number;
  targetXP: number;
  progressPercentage: number;
  totalSets: number;
  totalVolumeKg: number;
  contributingExercises: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'flame' | 'sparkle' | 'medal' | 'check-circle' | 'dumbbell' | 'runner' | 'target';
  xpAwarded: number;
  unlockedAt: string;
  category: 'PR' | 'STREAK' | 'LEVEL' | 'VOLUME' | 'CONSISTENCY';
}

export interface WeeklyComparisonItem {
  metric: string;
  currentWeek: number;
  lastWeek: number;
  unit: string;
  deltaPercent: number;
  deltaAbsolute: number;
  direction: 'UP' | 'DOWN' | 'SAME';
}

export interface WeeklyProgressDashboard {
  workouts: number;
  volumeKg: number;
  sets: number;
  exercisesCount: number;
  prsCount: number;
  lastWeekWorkouts: number;
  lastWeekVolumeKg: number;
  lastWeekSets: number;
  lastWeekPrsCount: number;
  volumeDeltaPercent: number;
  workoutsDelta: number;
  prsDelta: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

export interface UserProgress {
  level: number;
  rankTitle: string;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  streakDays: number;
  totalWorkouts: number;
  totalSets: number;
  totalVolumeKg: number;
  topExerciseRank: { name: string; rank: ExerciseRankTier };
  topMuscleRank: { muscle: string; rank: MuscleRankTier };
  personalRecords: Array<{
    id?: string;
    exerciseName: string;
    exerciseId?: string;
    value: number;
    type?: string;
    achievedAt: string;
    previousValue?: number;
  }>;
  exerciseProgress: Record<string, ExerciseProgressItem>;
  muscleProgress: Record<string, MuscleProgressItem>;
  recentAchievements: AchievementItem[];
  weeklyDashboard: WeeklyProgressDashboard;
  activityMatrix: Record<string, DayActivityRecord>;
}

export interface DayActivityItem {
  type: 'strength' | 'run' | 'cycling' | 'mobility' | 'daily_goal';
  title: string;
  xp: number;
  meta?: string;
}

export interface DayActivityRecord {
  date: string; // "YYYY-MM-DD"
  xp: number;
  isRestDay: boolean;
  activities?: DayActivityItem[];
}
