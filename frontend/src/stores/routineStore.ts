import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAppStorage } from '../services/storage/appStorage';
import { workoutsApi } from '../services/api';
import { RoutineCategory, calculateEstimatedDurationMinutes } from '../services/routine/routineRecommender';
import { useActiveWorkoutStore } from './activeWorkoutStore';

export interface RoutineExerciseData {
  id?: string;
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  order_index: number;
  targetSets: number;
  targetReps: number;
  targetRestSec: number;
  targetDuration?: number;
  targetWeight?: number;
  supersetGroupId?: string | null;
  notes?: string;
  equipment?: string[];
  difficulty?: string;
}

export interface CustomRoutine {
  id: string;
  name: string;
  category: RoutineCategory;
  description: string;
  is_public?: boolean;
  estimatedDurationMinutes: number;
  exercises: RoutineExerciseData[];
  createdAt: string;
  updatedAt: string;
}

interface RoutineState {
  routines: CustomRoutine[];
  favoriteExerciseNames: string[];
  recentExerciseNames: string[];
  exerciseUsageFrequency: Record<string, number>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRoutines: () => Promise<void>;
  saveRoutine: (
    routineDraft: Omit<CustomRoutine, 'id' | 'createdAt' | 'updatedAt' | 'estimatedDurationMinutes'> & { id?: string }
  ) => Promise<CustomRoutine>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<CustomRoutine | null>;
  renameRoutine: (id: string, newName: string) => Promise<void>;
  toggleFavoriteExercise: (exerciseName: string) => void;
  recordExerciseUsage: (exerciseName: string) => void;
  startRoutineWorkout: (routine: CustomRoutine) => void;
  resetRoutines: () => void;
}

const INITIAL_ROUTINES: CustomRoutine[] = [];

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: INITIAL_ROUTINES,
      favoriteExerciseNames: [],
      recentExerciseNames: [],
      exerciseUsageFrequency: {},
      isLoading: false,
      error: null,

      resetRoutines: () => {
        set({
          routines: [],
          favoriteExerciseNames: [],
          recentExerciseNames: [],
          exerciseUsageFrequency: {},
          error: null,
        });
      },

      loadRoutines: async () => {
        set({ isLoading: true, error: null });
        try {
          const serverRoutines = await workoutsApi.listRoutines();
          if (Array.isArray(serverRoutines)) {
            const formatted: CustomRoutine[] = serverRoutines.map((r: any, idx: number) => ({
              id: r.id,
              name: r.name,
              category: (r.category || 'Custom Routine') as RoutineCategory,
              description: r.description || '',
              is_public: r.is_public ?? false,
              estimatedDurationMinutes: calculateEstimatedDurationMinutes(
                r.exercises?.map((re: any) => ({
                  targetSets: re.targetSets ?? 3,
                  targetReps: re.targetReps ?? 10,
                  targetRestSec: re.targetRestSec ?? 90,
                  targetDuration: re.targetDuration ?? 0,
                })) || []
              ),
              exercises: (r.exercises || []).map((re: any, exIdx: number) => ({
                id: re.id,
                exerciseId: re.exerciseId || re.exercise?.id || `ex-${exIdx}`,
                name: re.exercise?.name || re.name || 'Exercise',
                primaryMuscle: re.exercise?.primaryMuscle || re.primaryMuscle || 'FULL_BODY',
                order_index: re.order_index ?? exIdx + 1,
                targetSets: re.targetSets ?? 3,
                targetReps: re.targetReps ?? 10,
                targetRestSec: re.targetRestSec ?? 90,
                targetDuration: re.targetDuration ?? 0,
                targetWeight: re.targetWeight ?? 0,
                supersetGroupId: re.supersetGroupId || null,
                notes: re.notes || '',
                equipment: re.exercise?.equipment || [],
                difficulty: re.exercise?.difficulty || 'Intermediate',
              })),
              createdAt: r.createdAt || new Date().toISOString(),
              updatedAt: r.updatedAt || new Date().toISOString(),
            }));
            set({ routines: formatted, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      saveRoutine: async (draft) => {
    const isEdit = !!draft.id;
    const routineId = draft.id || `routine-${Date.now()}`;
    const estimatedMinutes = calculateEstimatedDurationMinutes(draft.exercises);

    const fullRoutine: CustomRoutine = {
      id: routineId,
      name: draft.name,
      category: draft.category,
      description: draft.description,
      is_public: draft.is_public ?? false,
      estimatedDurationMinutes: estimatedMinutes,
      exercises: draft.exercises.map((e, idx) => ({
        ...e,
        order_index: idx + 1,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local state immediately
    set((state) => {
      const existingIdx = state.routines.findIndex((r) => r.id === routineId);
      const updated = [...state.routines];
      if (existingIdx >= 0) {
        updated[existingIdx] = fullRoutine;
      } else {
        updated.unshift(fullRoutine);
      }
      return { routines: updated };
    });

    // Record exercises to recent / frequency
    draft.exercises.forEach((ex) => {
      get().recordExerciseUsage(ex.name);
    });

    // Sync with backend API
    try {
      const payload = {
        name: draft.name,
        category: draft.category,
        description: draft.description,
        is_public: draft.is_public ?? false,
        exercises: draft.exercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          order_index: idx + 1,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetRestSec: ex.targetRestSec,
          targetDuration: ex.targetDuration || 0,
          targetWeight: ex.targetWeight || 0,
          supersetGroupId: ex.supersetGroupId || null,
          notes: ex.notes || null,
        })),
      };

      if (isEdit) {
        await workoutsApi.updateRoutine(routineId, payload);
      } else {
        const created = await workoutsApi.createRoutine(payload);
        if (created?.id && created.id !== routineId) {
          // Update id to server-generated uuid
          set((state) => ({
            routines: state.routines.map((r) =>
              r.id === routineId ? { ...r, id: created.id } : r
            ),
          }));
          fullRoutine.id = created.id;
        }
      }
    } catch {
      // Offline or unauthenticated; local state preserved
    }

    return fullRoutine;
  },

  deleteRoutine: async (id) => {
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    }));

    try {
      await workoutsApi.deleteRoutine(id);
    } catch {
      // Ignored for offline
    }
  },

  duplicateRoutine: async (id) => {
    const original = get().routines.find((r) => r.id === id);
    if (!original) return null;

    const duplicateDraft = {
      name: `${original.name} (Copy)`,
      category: original.category,
      description: original.description,
      is_public: false,
      exercises: original.exercises.map((ex) => ({ ...ex, id: undefined })),
    };

    return await get().saveRoutine(duplicateDraft);
  },

  renameRoutine: async (id, newName) => {
    if (!newName.trim()) return;
    const routine = get().routines.find((r) => r.id === id);
    if (!routine) return;

    await get().saveRoutine({
      ...routine,
      name: newName.trim(),
    });
  },

  toggleFavoriteExercise: (exerciseName) => {
    set((state) => {
      const isFav = state.favoriteExerciseNames.includes(exerciseName);
      return {
        favoriteExerciseNames: isFav
          ? state.favoriteExerciseNames.filter((n) => n !== exerciseName)
          : [...state.favoriteExerciseNames, exerciseName],
      };
    });
  },

  recordExerciseUsage: (exerciseName) => {
    set((state) => {
      const recents = [exerciseName, ...state.recentExerciseNames.filter((n) => n !== exerciseName)].slice(0, 15);
      const frequency = {
        ...state.exerciseUsageFrequency,
        [exerciseName]: (state.exerciseUsageFrequency[exerciseName] || 0) + 1,
      };
      return {
        recentExerciseNames: recents,
        exerciseUsageFrequency: frequency,
      };
    });
  },

  startRoutineWorkout: (routine) => {
    useActiveWorkoutStore.getState().startWorkout({
      id: routine.id,
      name: routine.name,
      exercises: routine.exercises.map((e) => ({
        exercise: {
          id: e.exerciseId,
          name: e.name,
          primaryMuscle: e.primaryMuscle,
        },
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        targetRestSec: e.targetRestSec,
        targetWeight: e.targetWeight,
        targetDuration: e.targetDuration,
        supersetGroupId: e.supersetGroupId,
      })),
    });
  },
}),
    {
      name: 'balyra-routines',
      storage: createJSONStorage(getAppStorage),
      partialize: (state) => ({
        routines: state.routines,
        favoriteExerciseNames: state.favoriteExerciseNames,
        recentExerciseNames: state.recentExerciseNames,
        exerciseUsageFrequency: state.exerciseUsageFrequency,
      }),
    }
  )
);
