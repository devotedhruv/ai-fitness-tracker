import { useActiveWorkoutStore } from '../stores/activeWorkoutStore';

describe('activeWorkoutStore', () => {
  beforeEach(() => {
    useActiveWorkoutStore.getState().discardWorkout();
  });

  it('starts an active workout session with default state', () => {
    useActiveWorkoutStore.getState().startWorkout({ name: 'Push Day' });
    const state = useActiveWorkoutStore.getState();

    expect(state.isActive).toBe(true);
    expect(state.sessionName).toBe('Push Day');
    expect(state.elapsedSeconds).toBe(0);
    expect(state.isTimerRunning).toBe(false);
    expect(state.exercises).toHaveLength(0);
  });

  it('controls exercise active timer manually without auto-starting', () => {
    useActiveWorkoutStore.getState().startWorkout({ name: 'Upper Body' });
    const store = useActiveWorkoutStore.getState();

    // Must not start automatically on workout/exercise start
    expect(store.isTimerRunning).toBe(false);
    expect(store.elapsedSeconds).toBe(0);

    // User starts exercising
    store.startExerciseTimer();
    expect(useActiveWorkoutStore.getState().isTimerRunning).toBe(true);

    // User pauses
    useActiveWorkoutStore.getState().pauseExerciseTimer();
    expect(useActiveWorkoutStore.getState().isTimerRunning).toBe(false);

    // User toggles timer
    useActiveWorkoutStore.getState().toggleExerciseTimer();
    expect(useActiveWorkoutStore.getState().isTimerRunning).toBe(true);

    // Add exercise duration directly (e.g. from set or camera)
    useActiveWorkoutStore.getState().addExerciseDuration(25);
    expect(useActiveWorkoutStore.getState().elapsedSeconds).toBe(25);
  });

  it('adds an exercise with an initial set', () => {
    useActiveWorkoutStore.getState().startWorkout({ name: 'Leg Day' });
    useActiveWorkoutStore.getState().addExercise({
      id: 'ex-123',
      name: 'Barbell Squat',
      primaryMuscle: 'LEGS',
      targetRestSec: 120,
    });

    const state = useActiveWorkoutStore.getState();
    expect(state.exercises).toHaveLength(1);
    expect(state.exercises[0].exerciseName).toBe('Barbell Squat');
    expect(state.exercises[0].sets).toHaveLength(1);
    expect(state.exercises[0].sets[0].setNumber).toBe(1);
    expect(state.exercises[0].sets[0].isCompleted).toBe(false);
  });

  it('adds, updates and completes sets, triggering rest timer and calculating volume', () => {
    useActiveWorkoutStore.getState().startWorkout({ name: 'Chest Day' });
    useActiveWorkoutStore.getState().addExercise({
      id: 'ex-bench',
      name: 'Bench Press',
      primaryMuscle: 'CHEST',
      targetRestSec: 90,
    });

    // Update Set 1: 80kg x 10 reps
    useActiveWorkoutStore.getState().updateSet(0, 0, { weightKg: 80, reps: 10 });
    
    // Add Set 2: 85kg x 8 reps
    useActiveWorkoutStore.getState().addSet(0, false);
    useActiveWorkoutStore.getState().updateSet(0, 1, { weightKg: 85, reps: 8 });

    // Mark Set 1 complete
    useActiveWorkoutStore.getState().toggleCompleteSet(0, 0);

    const stateAfterSet1 = useActiveWorkoutStore.getState();
    expect(stateAfterSet1.exercises[0].sets[0].isCompleted).toBe(true);
    expect(stateAfterSet1.restTimer.isActive).toBe(true);
    expect(stateAfterSet1.restTimer.remainingSeconds).toBe(90);

    // Mark Set 2 complete
    useActiveWorkoutStore.getState().toggleCompleteSet(0, 1);

    // Check volume: (80 * 10) + (85 * 8) = 800 + 680 = 1480 kg
    expect(useActiveWorkoutStore.getState().getTotalVolumeKg()).toBe(1480);
    expect(useActiveWorkoutStore.getState().getCompletedSetsCount()).toBe(2);
  });

  it('applies camera reps and recorded exercise duration to the current uncompleted set', () => {
    useActiveWorkoutStore.getState().startWorkout({ name: 'Pull Day' });
    useActiveWorkoutStore.getState().addExercise({
      id: 'ex-pullup',
      name: 'Pull-up',
      primaryMuscle: 'BACK',
      targetRestSec: 60,
    });
    useActiveWorkoutStore.getState().startExerciseTimer();
    expect(useActiveWorkoutStore.getState().isTimerRunning).toBe(true);

    // Camera tracker reports 12 verified valid reps taking 38 seconds of active exercise
    useActiveWorkoutStore.getState().applyCameraRepsToSet('ex-pullup', 12, 38);

    const state = useActiveWorkoutStore.getState();
    expect(state.exercises[0].sets[0].reps).toBe(12);
    expect(state.exercises[0].sets[0].isCompleted).toBe(true);
    expect(state.exercises[0].sets[0].holdDurationSec).toBe(38);
    expect(state.elapsedSeconds).toBe(38);
    expect(state.isTimerRunning).toBe(false); // Pauses while resting
    expect(state.restTimer.isActive).toBe(true);
    expect(state.restTimer.remainingSeconds).toBe(60);
  });

  it('handles rest timer tick and skip controls', () => {
    useActiveWorkoutStore.getState().startRestTimer(45);
    expect(useActiveWorkoutStore.getState().restTimer.remainingSeconds).toBe(45);

    useActiveWorkoutStore.getState().addRestTimerSeconds(30);
    expect(useActiveWorkoutStore.getState().restTimer.remainingSeconds).toBe(75);

    useActiveWorkoutStore.getState().tickRestTimer();
    expect(useActiveWorkoutStore.getState().restTimer.remainingSeconds).toBe(74);

    useActiveWorkoutStore.getState().stopRestTimer();
    expect(useActiveWorkoutStore.getState().restTimer.isActive).toBe(false);
    expect(useActiveWorkoutStore.getState().restTimer.remainingSeconds).toBe(0);
  });
});
