import { resolveExercisePattern } from '../services/vision/PoseTracker';

describe('resolveExercisePattern', () => {
  test('correctly maps pressing / chest / shoulder exercises to pushup pattern', () => {
    expect(resolveExercisePattern('Barbell Bench Press', 'CHEST')).toBe('pushup');
    expect(resolveExercisePattern('Incline Dumbbell Press', 'CHEST')).toBe('pushup');
    expect(resolveExercisePattern('Overhead Shoulder Press', 'SHOULDERS')).toBe('pushup');
    expect(resolveExercisePattern('Dips', 'TRICEPS')).toBe('pushup');
    expect(resolveExercisePattern('Standard Push-up', 'CHEST')).toBe('pushup');
  });

  test('correctly maps squats and lower body exercises to squat pattern', () => {
    expect(resolveExercisePattern('Barbell Back Squat', 'LEGS')).toBe('squat');
    expect(resolveExercisePattern('Bulgarian Split Squat', 'LEGS')).toBe('squat');
    expect(resolveExercisePattern('Walking Lunges', 'LEGS')).toBe('squat');
    expect(resolveExercisePattern('Barbell Deadlift', 'BACK')).toBe('squat'); // lower body hinge/squat pattern
    expect(resolveExercisePattern('Glute Bridge', 'GLUTES')).toBe('squat');
  });

  test('correctly maps pull exercises to pullup pattern', () => {
    expect(resolveExercisePattern('Standard Pull-up', 'BACK')).toBe('pullup');
    expect(resolveExercisePattern('Chin-up', 'BACK')).toBe('pullup');
    expect(resolveExercisePattern('Barbell Bent-over Row', 'BACK')).toBe('pullup');
    expect(resolveExercisePattern('Lat Pulldown', 'BACK')).toBe('pullup');
  });

  test('correctly maps arm curl exercises to bicep_curl pattern', () => {
    expect(resolveExercisePattern('Barbell Bicep Curl', 'BICEPS')).toBe('bicep_curl');
    expect(resolveExercisePattern('Dumbbell Hammer Curl', 'BICEPS')).toBe('bicep_curl');
    expect(resolveExercisePattern('Preacher Curl', 'BICEPS')).toBe('bicep_curl');
  });

  test('correctly maps core and isometric holds to plank pattern', () => {
    expect(resolveExercisePattern('Plank Hold', 'CORE')).toBe('plank');
    expect(resolveExercisePattern('Hollow Body Hold', 'CORE')).toBe('plank');
    expect(resolveExercisePattern('L-Sit Hold', 'CORE')).toBe('plank');
    expect(resolveExercisePattern('Deadbug Hold', 'CORE')).toBe('plank');
  });
});
