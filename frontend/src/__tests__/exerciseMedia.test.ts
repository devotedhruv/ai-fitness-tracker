import {
  resolveMovementPattern,
  NativeVectorMediaProvider,
  exerciseMediaManager,
} from '../services/exerciseMedia/ExerciseMediaProvider';
import { IExerciseMediaProvider, ExerciseMedia } from '../services/exerciseMedia/types';

describe('Exercise Demonstration & Media System', () => {
  describe('resolveMovementPattern', () => {
    it('correctly identifies core compound movements', () => {
      expect(resolveMovementPattern('Barbell Squat')).toBe('SQUAT');
      expect(resolveMovementPattern('Leg Press')).toBe('SQUAT');
      expect(resolveMovementPattern('Barbell Bench Press')).toBe('BENCH_PRESS');
      expect(resolveMovementPattern('Incline Dumbbell Press')).toBe('BENCH_PRESS');
      expect(resolveMovementPattern('Conventional Deadlift')).toBe('DEADLIFT');
      expect(resolveMovementPattern('Romanian Deadlift')).toBe('DEADLIFT');
      expect(resolveMovementPattern('Standing Military Press')).toBe('OVERHEAD_PRESS');
      expect(resolveMovementPattern('Overhead Dumbbell Press')).toBe('OVERHEAD_PRESS');
      expect(resolveMovementPattern('Pull-up')).toBe('PULLUP');
      expect(resolveMovementPattern('Lat Pulldown')).toBe('PULLUP');
      expect(resolveMovementPattern('Barbell Bent-Over Row')).toBe('ROW');
      expect(resolveMovementPattern('Push-up')).toBe('PUSHUP');
      expect(resolveMovementPattern('Walking Lunges')).toBe('LUNGE');
      expect(resolveMovementPattern('Parallel Bar Dip')).toBe('DIP');
      expect(resolveMovementPattern('Incline Bicep Curl')).toBe('CURL');
      expect(resolveMovementPattern('Tricep Pushdown')).toBe('EXTENSION');
      expect(resolveMovementPattern('Hanging Leg Raise')).toBe('CORE');
      expect(resolveMovementPattern('Abdominal Plank')).toBe('CORE');
    });

    it('falls back gracefully to primary muscle group when name has no matching keyword', () => {
      expect(resolveMovementPattern('Unknown Movement', 'LEGS')).toBe('SQUAT');
      expect(resolveMovementPattern('Unknown Movement', 'CHEST')).toBe('BENCH_PRESS');
      expect(resolveMovementPattern('Unknown Movement', 'BACK')).toBe('ROW');
      expect(resolveMovementPattern('Unknown Movement', 'SHOULDERS')).toBe('OVERHEAD_PRESS');
      expect(resolveMovementPattern('Unknown Movement', 'BICEPS')).toBe('CURL');
      expect(resolveMovementPattern('Unknown Movement', 'OTHER')).toBe('GENERAL');
    });
  });

  describe('NativeVectorMediaProvider', () => {
    const provider = new NativeVectorMediaProvider();

    it('resolves ExerciseDB 3D animation demonstration for Barbell Squat', () => {
      const media = provider.resolveMedia({
        id: 'ex-squat',
        name: 'Barbell Squat',
        primaryMuscle: 'LEGS',
        secondaryMuscles: ['GLUTES', 'CORE'],
        equipment: ['Barbell', 'Squat Rack'],
      });

      expect(media.movementPattern).toBe('SQUAT');
      expect(media.mediaType).toBe('VIDEO');
      expect(media.videoUrl).toContain('barbell_squat.mp4');
      expect(media.imageUrl).toContain('0043-qXTaZnJ.jpg');
      expect(media.primaryMuscles).toContain('Quadriceps');
      expect(media.instructions.length).toBeGreaterThan(0);
      expect(media.tips.length).toBeGreaterThan(0);
      expect(media.breathing).toBeTruthy();
      expect(media.commonMistakes.length).toBeGreaterThan(0);
      expect(media.aiCues.length).toBeGreaterThan(0);
    });

    it('falls back to 2D vector kinematics for custom exercises without media', () => {
      const media = provider.resolveMedia({
        id: 'ex-custom',
        name: 'My Custom Movement',
        primaryMuscle: 'LEGS',
      });

      expect(media.movementPattern).toBe('SQUAT');
      expect(media.mediaType).toBe('VECTOR');
    });

    it('honors higher priority licensed video when active in backend payload', () => {
      const media = provider.resolveMedia({
        id: 'ex-bench',
        name: 'Barbell Bench Press',
        media: {
          type: 'VIDEO',
          videoUrl: 'https://cdn.fittrack.app/media/bench_press.mp4',
          isActive: true,
          source: 'LICENSED_PROVIDER',
        },
      });

      expect(media.mediaType).toBe('VIDEO');
      expect(media.videoUrl).toBe('https://cdn.fittrack.app/media/bench_press.mp4');
      expect(media.mediaSource).toBe('LICENSED_PROVIDER');
    });

    it('resolves ExerciseDB sample data for Lever Pec Deck Fly with sample video and 3D image', () => {
      const media = provider.resolveMedia({
        name: 'Lever Pec Deck Fly',
        primaryMuscle: 'CHEST',
      });

      expect(media.mediaType).toBe('VIDEO');
      expect(media.videoUrl).toContain('lever_pec_deck_fly.mp4');
      expect(media.imageUrl).toContain('chest_fly_image.png');
      expect(media.thumbnailUrl).toContain('chest_fly_image.png');
      expect(media.overview).toContain('The Lever Pec Deck Fly is a strength-building exercise');
      expect(media.instructions.length).toBeGreaterThanOrEqual(4);
      expect(media.variations?.length).toBeGreaterThan(0);
      expect(media.targetMuscles).toContain('Pectoralis Major Clavicular Head');
      expect(media.movementPattern).toBe('BENCH_PRESS');
    });
  });

  describe('exerciseMediaManager (Pluggable Architecture & Cache)', () => {
    it('caches resolved media to avoid recalculating or re-requesting', () => {
      const first = exerciseMediaManager.getMedia({
        id: 'cache-test-1',
        name: 'Barbell Squat',
        primaryMuscle: 'LEGS',
      });

      const second = exerciseMediaManager.getMedia({
        id: 'cache-test-1',
        name: 'Barbell Squat',
        primaryMuscle: 'LEGS',
      });

      expect(first).toBe(second); // Exact same object reference from cache
    });

    it('supports swapping provider via setProvider', () => {
      const mockProvider: IExerciseMediaProvider = {
        name: 'MockExerciseProvider',
        resolveMedia: (ex) => ({
          exerciseId: ex.id || 'mock',
          exerciseName: ex.name,
          mediaType: 'ANIMATION',
          mediaSource: 'MOCK_PROVIDER',
          movementPattern: 'GENERAL',
          instructions: ['Mock Step 1'],
          tips: ['Mock Tip'],
          breathing: 'Inhale/Exhale',
          commonMistakes: ['Mock Mistake'],
          primaryMuscles: ['Chest'],
          secondaryMuscles: [],
          equipment: ['Dumbbell'],
          difficulty: 'BEGINNER',
          aiCues: ['Keep form steady'],
        }),
      };

      exerciseMediaManager.setProvider(mockProvider);

      const resolved = exerciseMediaManager.getMedia({
        id: 'custom-1',
        name: 'Custom Push',
      });

      expect(resolved.mediaSource).toBe('MOCK_PROVIDER');
      expect(resolved.instructions[0]).toBe('Mock Step 1');

      // Restore native provider for other tests
      exerciseMediaManager.setProvider(new NativeVectorMediaProvider());
    });
  });
});
