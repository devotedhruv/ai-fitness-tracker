import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress } from '../services/progression/types';
import { buildUnifiedProgress } from '../services/progression/unifiedProgressionService';
import { calculateSetXP, calculateLevelFromXP, SetXPParams } from '../services/progression/xpCalculator';

interface ProgressionState {
  progress: UserProgress;
  pendingLevelUp: { oldLevel: number; newLevel: number; title: string } | null;
  selectedExerciseForDetail: string | null;
  selectedMuscleForDetail: string | null;

  // Actions
  recomputeProgress: (params: {
    sessions: any[];
    runs?: any[];
    records?: any[];
    streakDays?: number;
  }) => void;
  awardSetXP: (params: SetXPParams & { exerciseName: string; primaryMuscle?: string }) => void;
  awardWorkoutXP: (xp: number) => void;
  clearPendingLevelUp: () => void;
  resetProgress: () => void;
  setSelectedExerciseForDetail: (exerciseName: string | null) => void;
  setSelectedMuscleForDetail: (muscleGroup: string | null) => void;
}

const memoryStore: Record<string, string> = {};
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = value;
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
  };
};

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      progress: buildUnifiedProgress({ sessions: [] }),
      pendingLevelUp: null,
      selectedExerciseForDetail: null,
      selectedMuscleForDetail: null,

      recomputeProgress: (params) => {
        const currentLevel = get().progress.level;
        const newProgress = buildUnifiedProgress(params);

        if (newProgress.level > currentLevel && currentLevel > 0) {
          set({
            progress: newProgress,
            pendingLevelUp: {
              oldLevel: currentLevel,
              newLevel: newProgress.level,
              title: newProgress.rankTitle,
            },
          });
        } else {
          set({ progress: newProgress });
        }
      },

      awardSetXP: (params) => {
        const { progress } = get();
        const res = calculateSetXP(params);
        const newTotalXP = progress.totalXP + res.xpAwarded;
        const levelInfo = calculateLevelFromXP(newTotalXP);

        const currentLevel = progress.level;
        let pendingLevelUp = get().pendingLevelUp;
        if (levelInfo.level > currentLevel) {
          pendingLevelUp = {
            oldLevel: currentLevel,
            newLevel: levelInfo.level,
            title: levelInfo.title,
          };
        }

        // Update specific exercise XP if exists
        const updatedExMap = { ...progress.exerciseProgress };
        if (updatedExMap[params.exerciseName]) {
          const ex = { ...updatedExMap[params.exerciseName] };
          ex.currentXP += res.xpAwarded;
          ex.totalSets += 1;
          if (params.weightKg) {
            ex.totalVolumeKg += (params.weightKg * (params.reps || 1));
            if (params.weightKg > ex.personalBestWeightKg) {
              ex.personalBestWeightKg = params.weightKg;
            }
          }
          updatedExMap[params.exerciseName] = ex;
        }

        set({
          progress: {
            ...progress,
            totalXP: newTotalXP,
            level: levelInfo.level,
            rankTitle: levelInfo.title,
            currentLevelXP: levelInfo.xpInLevel,
            nextLevelXP: levelInfo.xpForNextLevel,
            xpToNextLevel: levelInfo.xpToNextLevel,
            progressPercentage: levelInfo.progressPercentage,
            exerciseProgress: updatedExMap,
          },
          pendingLevelUp,
        });
      },

      awardWorkoutXP: (bonusXP) => {
        const { progress } = get();
        const newTotalXP = progress.totalXP + bonusXP;
        const levelInfo = calculateLevelFromXP(newTotalXP);

        const currentLevel = progress.level;
        let pendingLevelUp = get().pendingLevelUp;
        if (levelInfo.level > currentLevel) {
          pendingLevelUp = {
            oldLevel: currentLevel,
            newLevel: levelInfo.level,
            title: levelInfo.title,
          };
        }

        set({
          progress: {
            ...progress,
            totalXP: newTotalXP,
            level: levelInfo.level,
            rankTitle: levelInfo.title,
            currentLevelXP: levelInfo.xpInLevel,
            nextLevelXP: levelInfo.xpForNextLevel,
            xpToNextLevel: levelInfo.xpToNextLevel,
            progressPercentage: levelInfo.progressPercentage,
          },
          pendingLevelUp,
        });
      },

      clearPendingLevelUp: () => set({ pendingLevelUp: null }),
      resetProgress: () =>
        set({
          progress: buildUnifiedProgress({ sessions: [] }),
          pendingLevelUp: null,
          selectedExerciseForDetail: null,
          selectedMuscleForDetail: null,
        }),
      setSelectedExerciseForDetail: (name) => set({ selectedExerciseForDetail: name }),
      setSelectedMuscleForDetail: (muscle) => set({ selectedMuscleForDetail: muscle }),
    }),
    {
      name: 'fittrack-progression-storage',
      storage: getStorage() as any,
    }
  )
);
