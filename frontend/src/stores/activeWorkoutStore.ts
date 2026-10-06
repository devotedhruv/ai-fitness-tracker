import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAppStorage } from '../services/storage/appStorage';

export interface ActiveWorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  holdDurationSec?: number | null;
  isCompleted: boolean;
  isWarmup: boolean;
  rpe?: number;
  previous?: {
    weightKg: number;
    reps: number;
  };
}

export interface ActiveWorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  supersetGroupId?: string | null;
  targetRestSec: number;
  sets: ActiveWorkoutSet[];
}

export interface RestTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

export interface ActiveWorkoutState {
  isActive: boolean;
  sessionName: string;
  routineId?: string | null;
  startTime: number | null;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  exercises: ActiveWorkoutExercise[];
  restTimer: RestTimerState;
  
  // Actions
  startWorkout: (routine?: { id?: string; name: string; exercises?: any[] }) => void;
  discardWorkout: () => void;
  setElapsedSeconds: (seconds: number) => void;
  incrementElapsedSeconds: () => void;
  startExerciseTimer: () => void;
  pauseExerciseTimer: () => void;
  toggleExerciseTimer: () => void;
  addExerciseDuration: (seconds: number) => void;
  
  // Exercise Actions
  addExercise: (exercise: { id: string; name: string; primaryMuscle: string; targetRestSec?: number }) => void;
  removeExercise: (exerciseIndex: number) => void;
  
  // Set Actions
  addSet: (exerciseIndex: number, isWarmup?: boolean) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<ActiveWorkoutSet>
  ) => void;
  toggleCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  applyCameraRepsToSet: (exerciseId: string, validReps: number, durationSec?: number) => void;

  // Rest Timer Actions
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  addRestTimerSeconds: (seconds: number) => void;
  tickRestTimer: () => void;

  // Computed helper
  getTotalVolumeKg: () => number;
  getCompletedSetsCount: () => number;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
  isActive: false,
  sessionName: 'Workout Session',
  routineId: null,
  startTime: null,
  elapsedSeconds: 0,
  isTimerRunning: false,
  exercises: [],
  restTimer: {
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 0,
  },

  startWorkout: (routine) => {
    const defaultExercises: ActiveWorkoutExercise[] = routine?.exercises && routine.exercises.length > 0
      ? routine.exercises.map((re: any, idx: number) => {
          const ex = re.exercise || re;
          const targetSets = re.targetSets || 3;
          const targetReps = re.targetReps || 10;
          const targetWeight = re.targetWeight || 0;
          const targetDuration = re.targetDuration || null;
          const sets: ActiveWorkoutSet[] = Array.from({ length: targetSets }).map((_, sIdx) => ({
            id: `set-${Date.now()}-${idx}-${sIdx}`,
            setNumber: sIdx + 1,
            weightKg: targetWeight,
            reps: targetReps,
            holdDurationSec: targetDuration,
            isCompleted: false,
            isWarmup: false,
            previous: { weightKg: targetWeight || 20, reps: targetReps },
          }));

          return {
            id: re.id || `exercise-${Date.now()}-${idx}`,
            exerciseId: ex.id || ex.exerciseId,
            exerciseName: ex.name || 'Exercise',
            primaryMuscle: ex.primaryMuscle || 'FULL_BODY',
            supersetGroupId: re.supersetGroupId || null,
            targetRestSec: re.targetRestSec || 90,
            sets,
          };
        })
      : [];

    set({
      isActive: true,
      sessionName: routine?.name || 'Workout Session',
      routineId: routine?.id || null,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isTimerRunning: false,
      exercises: defaultExercises,
      restTimer: { isActive: false, remainingSeconds: 0, totalSeconds: 0 },
    });
  },

  discardWorkout: () => {
    set({
      isActive: false,
      sessionName: 'Workout Session',
      routineId: null,
      startTime: null,
      elapsedSeconds: 0,
      isTimerRunning: false,
      exercises: [],
      restTimer: { isActive: false, remainingSeconds: 0, totalSeconds: 0 },
    });
  },

  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
  incrementElapsedSeconds: () =>
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  startExerciseTimer: () => set({ isTimerRunning: true }),
  pauseExerciseTimer: () => set({ isTimerRunning: false }),
  toggleExerciseTimer: () => set((state) => ({ isTimerRunning: !state.isTimerRunning })),
  addExerciseDuration: (seconds) =>
    set((state) => ({ elapsedSeconds: Math.max(0, state.elapsedSeconds + Math.max(0, seconds)) })),

  addExercise: (exercise) => {
    const newEx: ActiveWorkoutExercise = {
      id: `active-ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      primaryMuscle: exercise.primaryMuscle,
      targetRestSec: exercise.targetRestSec || 90,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          weightKg: 0,
          reps: 10,
          isCompleted: false,
          isWarmup: false,
        },
      ],
    };
    set((state) => ({ exercises: [...state.exercises, newEx] }));
  },

  removeExercise: (exerciseIndex) => {
    set((state) => ({
      exercises: state.exercises.filter((_, idx) => idx !== exerciseIndex),
    }));
  },

  addSet: (exerciseIndex, isWarmup = false) => {
    set((state) => {
      const exercise = state.exercises[exerciseIndex];
      if (!exercise) return state;

      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: ActiveWorkoutSet = {
        id: `set-${Date.now()}-${exercise.sets.length + 1}`,
        setNumber: exercise.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 0,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
        isWarmup,
        previous: lastSet?.previous,
      };

      const updatedExercises = [...state.exercises];
      updatedExercises[exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, newSet],
      };

      return { exercises: updatedExercises };
    });
  },

  removeSet: (exerciseIndex, setIndex) => {
    set((state) => {
      const exercise = state.exercises[exerciseIndex];
      if (!exercise || exercise.sets.length <= 1) return state;

      const filtered = exercise.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      const updatedExercises = [...state.exercises];
      updatedExercises[exerciseIndex] = {
        ...exercise,
        sets: filtered,
      };

      return { exercises: updatedExercises };
    });
  },

  updateSet: (exerciseIndex, setIndex, patch) => {
    set((state) => {
      const exercise = state.exercises[exerciseIndex];
      if (!exercise || !exercise.sets[setIndex]) return state;

      const updatedSets = [...exercise.sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...patch };

      const updatedExercises = [...state.exercises];
      updatedExercises[exerciseIndex] = {
        ...exercise,
        sets: updatedSets,
      };

      return { exercises: updatedExercises };
    });
  },

  toggleCompleteSet: (exerciseIndex, setIndex) => {
    const state = get();
    const exercise = state.exercises[exerciseIndex];
    if (!exercise || !exercise.sets[setIndex]) return;

    const currentCompleted = exercise.sets[setIndex].isCompleted;
    const nextCompleted = !currentCompleted;

    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      isCompleted: nextCompleted,
    };

    const updatedExercises = [...state.exercises];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      sets: updatedSets,
    };

    set({
      exercises: updatedExercises,
      isTimerRunning: nextCompleted ? false : state.isTimerRunning,
    });

    // When a set is marked complete, automatically start rest timer
    if (nextCompleted) {
      get().startRestTimer(exercise.targetRestSec || 90);
    }
  },

  applyCameraRepsToSet: (exerciseId, validReps, durationSec = 0) => {
    set((state) => {
      const exerciseIndex = state.exercises.findIndex(
        (e) => e.exerciseId === exerciseId
      );
      if (exerciseIndex === -1) return state;

      const exercise = state.exercises[exerciseIndex];
      // Find first uncompleted set or the last set
      let setIndex = exercise.sets.findIndex((s) => !s.isCompleted);
      if (setIndex === -1) {
        setIndex = exercise.sets.length - 1;
      }

      if (setIndex >= 0 && exercise.sets[setIndex]) {
        const updatedSets = [...exercise.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          reps: validReps,
          holdDurationSec: durationSec > 0 ? durationSec : updatedSets[setIndex].holdDurationSec,
          isCompleted: true,
        };

        const updatedExercises = [...state.exercises];
        updatedExercises[exerciseIndex] = {
          ...exercise,
          sets: updatedSets,
        };

        const additionalDuration = Math.max(0, durationSec);

        return {
          exercises: updatedExercises,
          elapsedSeconds: state.elapsedSeconds + additionalDuration,
          isTimerRunning: false,
          restTimer: {
            isActive: true,
            remainingSeconds: exercise.targetRestSec || 90,
            totalSeconds: exercise.targetRestSec || 90,
          },
        };
      }

      return state;
    });
  },

  startRestTimer: (seconds = 90) => {
    set({
      restTimer: {
        isActive: true,
        remainingSeconds: seconds,
        totalSeconds: seconds,
      },
    });
  },

  stopRestTimer: () => {
    set({
      restTimer: {
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: 0,
      },
    });
  },

  addRestTimerSeconds: (seconds) => {
    set((state) => {
      if (!state.restTimer.isActive) return state;
      const nextRemaining = state.restTimer.remainingSeconds + seconds;
      return {
        restTimer: {
          ...state.restTimer,
          remainingSeconds: Math.max(0, nextRemaining),
          totalSeconds: Math.max(state.restTimer.totalSeconds, nextRemaining),
        },
      };
    });
  },

  tickRestTimer: () => {
    set((state) => {
      if (!state.restTimer.isActive) return state;
      if (state.restTimer.remainingSeconds <= 1) {
        return {
          restTimer: {
            isActive: false,
            remainingSeconds: 0,
            totalSeconds: 0,
          },
        };
      }
      return {
        restTimer: {
          ...state.restTimer,
          remainingSeconds: state.restTimer.remainingSeconds - 1,
        },
      };
    });
  },

  getTotalVolumeKg: () => {
    const { exercises } = get();
    let total = 0;
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.isCompleted && !s.isWarmup) {
          total += (s.weightKg || 0) * (s.reps || 0);
        }
      }
    }
    return Math.round(total * 10) / 10;
  },

  getCompletedSetsCount: () => {
    const { exercises } = get();
    let count = 0;
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.isCompleted) count++;
      }
    }
    return count;
  },
}),
    {
      name: 'balyra-active-workout',
      storage: createJSONStorage(getAppStorage),
      partialize: (state) => ({
        isActive: state.isActive,
        sessionName: state.sessionName,
        routineId: state.routineId,
        startTime: state.startTime,
        elapsedSeconds: state.elapsedSeconds,
        isTimerRunning: state.isTimerRunning,
        exercises: state.exercises,
        restTimer: state.restTimer,
      }),
    }
  )
);
