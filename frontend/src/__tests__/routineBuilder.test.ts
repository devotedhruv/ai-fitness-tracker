import {
  ROUTINE_CATEGORIES,
  CATEGORY_RECOMMENDATIONS,
  analyzeRoutineCoverage,
  validateRoutineBalance,
  calculateEstimatedDurationMinutes,
} from '../services/routine/routineRecommender';
import { ROUTINE_TEMPLATES } from '../services/routine/routineTemplates';
import { useRoutineStore } from '../stores/routineStore';
import { useActiveWorkoutStore } from '../stores/activeWorkoutStore';

describe('Routine Recommendation Engine', () => {
  test('all 10 categories are defined with valid metadata', () => {
    expect(ROUTINE_CATEGORIES).toHaveLength(10);
    const categoryIds = ROUTINE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('Leg Day');
    expect(categoryIds).toContain('Chest');
    expect(categoryIds).toContain('Back & Pull');
    expect(categoryIds).toContain('Push');
    expect(categoryIds).toContain('Pull');
    expect(categoryIds).toContain('Arms');
    expect(categoryIds).toContain('Shoulders');
    expect(categoryIds).toContain('Full Body');
    expect(categoryIds).toContain('Core');
    expect(categoryIds).toContain('Custom Routine');
  });

  test('Leg Day category recommends squats, leg press, RDL, lunges, calf raises', () => {
    const legRecs = CATEGORY_RECOMMENDATIONS['Leg Day'].map((e) => e.name);
    expect(legRecs).toContain('Barbell Squat');
    expect(legRecs).toContain('Leg Press');
    expect(legRecs).toContain('Romanian Deadlift');
    expect(legRecs).toContain('Walking Lunges');
    expect(legRecs).toContain('Standing Calf Raises');
  });

  test('Chest category recommends bench press, incline dumbbell, cable fly, push-ups', () => {
    const chestRecs = CATEGORY_RECOMMENDATIONS['Chest'].map((e) => e.name);
    expect(chestRecs).toContain('Barbell Bench Press');
    expect(chestRecs).toContain('Incline Dumbbell Press');
    expect(chestRecs).toContain('Cable Chest Fly');
    expect(chestRecs).toContain('Standard Push-up');
  });

  test('Back & Pull category recommends pull-ups, lat pulldown, barbell row, face pull', () => {
    const backRecs = CATEGORY_RECOMMENDATIONS['Back & Pull'].map((e) => e.name);
    expect(backRecs).toContain('Pull-Up');
    expect(backRecs).toContain('Lat Pulldown');
    expect(backRecs).toContain('Barbell Row');
    expect(backRecs).toContain('Cable Face Pull');
  });

  test('Shoulders category recommends overhead press, dumbbell press, lateral raises', () => {
    const shoulderRecs = CATEGORY_RECOMMENDATIONS['Shoulders'].map((e) => e.name);
    expect(shoulderRecs).toContain('Overhead Press');
    expect(shoulderRecs).toContain('Dumbbell Shoulder Press');
    expect(shoulderRecs).toContain('Lateral Raise');
  });

  test('Arms category recommends barbell curl, hammer curl, tricep pushdown, dips', () => {
    const armRecs = CATEGORY_RECOMMENDATIONS['Arms'].map((e) => e.name);
    expect(armRecs).toContain('Barbell Bicep Curl');
    expect(armRecs).toContain('Hammer Curl');
    expect(armRecs).toContain('Cable Tricep Pushdown');
    expect(armRecs).toContain('Dips');
  });

  test('Core category recommends plank, crunches, leg raises, russian twists', () => {
    const coreRecs = CATEGORY_RECOMMENDATIONS['Core'].map((e) => e.name);
    expect(coreRecs).toContain('Plank');
    expect(coreRecs).toContain('Crunches');
    expect(coreRecs).toContain('Hanging Leg Raises');
    expect(coreRecs).toContain('Russian Twists');
  });
});

describe('Smart Routine Coverage Analyzer', () => {
  test('flags missing incline and isolation when only flat bench press is added', () => {
    const coverage = analyzeRoutineCoverage('Chest', ['Barbell Bench Press']);
    expect(coverage.isBalanced).toBe(false);
    expect(coverage.missingRoles.some((r) => r.includes('Incline'))).toBe(true);
    expect(coverage.missingRoles.some((r) => r.includes('Isolation'))).toBe(true);
    expect(coverage.suggestedAdditions.length).toBeGreaterThan(0);
  });

  test('evaluates balanced chest routine covering compound, incline, isolation, and bodyweight', () => {
    const coverage = analyzeRoutineCoverage('Chest', [
      'Barbell Bench Press',
      'Incline Dumbbell Press',
      'Cable Chest Fly',
      'Standard Push-up',
    ]);
    expect(coverage.isBalanced).toBe(true);
    expect(coverage.explanation).toContain('covers your upper, middle, and overall chest');
  });

  test('evaluates balanced leg routine covering squat, hinge, lunges, and calves', () => {
    const coverage = analyzeRoutineCoverage('Leg Day', [
      'Barbell Squat',
      'Romanian Deadlift',
      'Walking Lunges',
      'Standing Calf Raises',
    ]);
    expect(coverage.isBalanced).toBe(true);
    expect(coverage.explanation).toContain('Well-rounded lower body routine');
  });
});

describe('Routine Balance & Redundancy Validator', () => {
  test('warns when user adds 4 or more redundant chest pressing movements', () => {
    const alerts = validateRoutineBalance([
      { name: 'Barbell Bench Press' },
      { name: 'Incline Dumbbell Press' },
      { name: 'Dumbbell Bench Press' },
      { name: 'Standard Push-up' },
    ]);
    expect(alerts.some((a) => a.id === 'redundant-press')).toBe(true);
    expect(alerts.find((a) => a.id === 'redundant-press')?.message).toContain('chest pressing exercises');
  });

  test('warns when routine exceeds 8 exercises (high volume)', () => {
    const alerts = validateRoutineBalance([
      { name: 'Exercise 1' },
      { name: 'Exercise 2' },
      { name: 'Exercise 3' },
      { name: 'Exercise 4' },
      { name: 'Exercise 5' },
      { name: 'Exercise 6' },
      { name: 'Exercise 7' },
      { name: 'Exercise 8' },
      { name: 'Exercise 9' },
    ]);
    expect(alerts.some((a) => a.id === 'high-volume')).toBe(true);
  });

  test('returns no warning alerts for a well-balanced 4-exercise routine', () => {
    const alerts = validateRoutineBalance([
      { name: 'Barbell Squat' },
      { name: 'Romanian Deadlift' },
      { name: 'Walking Lunges' },
      { name: 'Standing Calf Raises' },
    ]);
    expect(alerts).toHaveLength(0);
  });
});

describe('Estimated Duration Calculator', () => {
  test('computes estimated duration in minutes', () => {
    // 4 exercises, 3 sets each = 12 sets. 10 reps @ 3.5s = 35s + 90s rest = 125s per set.
    // 12 sets * 125s = 1500s = 25 minutes.
    const duration = calculateEstimatedDurationMinutes([
      { targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { targetSets: 3, targetReps: 10, targetRestSec: 90 },
    ]);
    expect(duration).toBeGreaterThanOrEqual(20);
    expect(duration).toBeLessThanOrEqual(30);
  });

  test('accounts for timed duration exercises like Plank', () => {
    const duration = calculateEstimatedDurationMinutes([
      { targetSets: 3, targetReps: 1, targetRestSec: 60, targetDuration: 60 },
    ]);
    // 3 sets * (60s hold + 60s rest) = 360s = 6 minutes
    expect(duration).toBe(6);
  });
});

describe('Routine Templates Catalog', () => {
  test('provides all 9 ready-made workout templates', () => {
    expect(ROUTINE_TEMPLATES).toHaveLength(9);
    const templateNames = ROUTINE_TEMPLATES.map((t) => t.name);
    expect(templateNames).toContain('Beginner Full Body');
    expect(templateNames).toContain('Push Day');
    expect(templateNames).toContain('Pull Day');
    expect(templateNames).toContain('Leg Day Hypertrophy');
    expect(templateNames).toContain('Chest & Triceps');
    expect(templateNames).toContain('Back & Biceps');
    expect(templateNames).toContain('Upper Body Power');
    expect(templateNames).toContain('Lower Body Strength');
    expect(templateNames).toContain('Core & Pillar Stability');
  });
});

describe('Routine Store Operations', () => {
  test('creates, duplicates, renames, and deletes a custom routine', async () => {
    const store = useRoutineStore.getState();

    // 1. Create
    const created = await store.saveRoutine({
      name: 'Test Leg Session',
      category: 'Leg Day',
      description: 'Test description',
      exercises: [
        {
          exerciseId: 'test-squat',
          name: 'Barbell Squat',
          primaryMuscle: 'LEGS',
          order_index: 1,
          targetSets: 4,
          targetReps: 10,
          targetRestSec: 120,
          targetWeight: 100,
        },
      ],
    });

    expect(created.name).toBe('Test Leg Session');
    expect(useRoutineStore.getState().routines.some((r) => r.id === created.id)).toBe(true);

    // 2. Duplicate
    const duplicated = await store.duplicateRoutine(created.id);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.name).toBe('Test Leg Session (Copy)');
    expect(useRoutineStore.getState().routines.some((r) => r.id === duplicated?.id)).toBe(true);

    // 3. Rename
    await store.renameRoutine(created.id, 'Renamed Leg Session');
    const renamed = useRoutineStore.getState().routines.find((r) => r.id === created.id);
    expect(renamed?.name).toBe('Renamed Leg Session');

    // 4. Start Routine Workout
    store.startRoutineWorkout(renamed!);
    const activeWorkout = useActiveWorkoutStore.getState();
    expect(activeWorkout.isActive).toBe(true);
    expect(activeWorkout.sessionName).toBe('Renamed Leg Session');
    expect(activeWorkout.exercises[0].exerciseName).toBe('Barbell Squat');
    expect(activeWorkout.exercises[0].sets[0].weightKg).toBe(100);

    // Clean up active workout
    activeWorkout.discardWorkout();

    // 5. Delete
    await store.deleteRoutine(created.id);
    expect(useRoutineStore.getState().routines.some((r) => r.id === created.id)).toBe(false);
    if (duplicated) {
      await store.deleteRoutine(duplicated.id);
    }
  }, 15000);

  test('toggles favorite exercise', () => {
    const store = useRoutineStore.getState();
    const initialFavs = store.favoriteExerciseNames;
    const testEx = 'Custom Test Exercise';

    store.toggleFavoriteExercise(testEx);
    expect(useRoutineStore.getState().favoriteExerciseNames).toContain(testEx);

    store.toggleFavoriteExercise(testEx);
    expect(useRoutineStore.getState().favoriteExerciseNames).not.toContain(testEx);
  });
});
