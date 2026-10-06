import { RoutineCategory } from './routineRecommender';
import { IconName } from '../../components/Icon';

export interface RoutineTemplateExercise {
  name: string;
  primaryMuscle: string;
  targetSets: number;
  targetReps: number;
  targetRestSec: number;
  targetDuration?: number;
  targetWeight?: number;
  notes?: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  category: RoutineCategory;
  description: string;
  icon: IconName;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  exercises: RoutineTemplateExercise[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'tpl-beginner-full-body',
    name: 'Beginner Full Body',
    category: 'Full Body',
    description: 'Foundational compound movements targeting major muscle groups for strength & motor control.',
    icon: 'today',
    level: 'Beginner',
    estimatedMinutes: 40,
    exercises: [
      { name: 'Lever Pec Deck Fly', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 10, targetRestSec: 60 },
      { name: 'Barbell Squat', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Barbell Bench Press', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Lat Pulldown', primaryMuscle: 'BACK', targetSets: 3, targetReps: 10, targetRestSec: 75 },
      { name: 'Overhead Press', primaryMuscle: 'SHOULDERS', targetSets: 3, targetReps: 8, targetRestSec: 90 },
      { name: 'Plank', primaryMuscle: 'CORE', targetSets: 3, targetReps: 1, targetRestSec: 60, targetDuration: 45 },
    ],
  },
  {
    id: 'tpl-push-day',
    name: 'Push Day',
    category: 'Push',
    description: 'Horizontal and vertical pressing hypertrophy for chest, anterior shoulders, and triceps.',
    icon: 'dumbbell',
    level: 'Intermediate',
    estimatedMinutes: 50,
    exercises: [
      { name: 'Barbell Bench Press', primaryMuscle: 'CHEST', targetSets: 4, targetReps: 8, targetRestSec: 120 },
      { name: 'Lever Pec Deck Fly', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 12, targetRestSec: 60 },
      { name: 'Incline Dumbbell Press', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Overhead Press', primaryMuscle: 'SHOULDERS', targetSets: 3, targetReps: 8, targetRestSec: 90 },
      { name: 'Lateral Raise', primaryMuscle: 'SHOULDERS', targetSets: 4, targetReps: 15, targetRestSec: 60 },
      { name: 'Dips', primaryMuscle: 'TRICEPS', targetSets: 3, targetReps: 10, targetRestSec: 75 },
      { name: 'Cable Tricep Pushdown', primaryMuscle: 'TRICEPS', targetSets: 3, targetReps: 12, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-pull-day',
    name: 'Pull Day',
    category: 'Pull',
    description: 'Comprehensive posterior pulling targeting lat width, mid-back thickness, and biceps.',
    icon: 'exercise-pullup',
    level: 'Intermediate',
    estimatedMinutes: 50,
    exercises: [
      { name: 'Barbell Deadlift', primaryMuscle: 'BACK', targetSets: 3, targetReps: 5, targetRestSec: 150 },
      { name: 'Pull-Up', primaryMuscle: 'BACK', targetSets: 3, targetReps: 8, targetRestSec: 90 },
      { name: 'Barbell Row', primaryMuscle: 'BACK', targetSets: 4, targetReps: 8, targetRestSec: 90 },
      { name: 'Seated Cable Row', primaryMuscle: 'BACK', targetSets: 3, targetReps: 12, targetRestSec: 75 },
      { name: 'Cable Face Pull', primaryMuscle: 'SHOULDERS', targetSets: 3, targetReps: 15, targetRestSec: 60 },
      { name: 'Barbell Bicep Curl', primaryMuscle: 'BICEPS', targetSets: 3, targetReps: 10, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-leg-day',
    name: 'Leg Day Hypertrophy',
    category: 'Leg Day',
    description: 'High-yield lower body development balancing quads, posterior chain, and calves.',
    icon: 'exercise-squat',
    level: 'Intermediate',
    estimatedMinutes: 55,
    exercises: [
      { name: 'Barbell Squat', primaryMuscle: 'LEGS', targetSets: 4, targetReps: 8, targetRestSec: 120 },
      { name: 'Leg Press', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 12, targetRestSec: 90 },
      { name: 'Romanian Deadlift', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Walking Lunges', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 12, targetRestSec: 75 },
      { name: 'Standing Calf Raises', primaryMuscle: 'LEGS', targetSets: 4, targetReps: 15, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-chest-triceps',
    name: 'Chest & Triceps',
    category: 'Chest',
    description: 'Pectoral overload paired with focused tricep elbow extension lockouts.',
    icon: 'exercise-pushup',
    level: 'Intermediate',
    estimatedMinutes: 45,
    exercises: [
      { name: 'Barbell Bench Press', primaryMuscle: 'CHEST', targetSets: 4, targetReps: 8, targetRestSec: 120 },
      { name: 'Lever Pec Deck Fly', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 12, targetRestSec: 60 },
      { name: 'Incline Dumbbell Press', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Cable Chest Fly', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 12, targetRestSec: 60 },
      { name: 'Standard Push-up', primaryMuscle: 'CHEST', targetSets: 3, targetReps: 15, targetRestSec: 60 },
      { name: 'Cable Tricep Pushdown', primaryMuscle: 'TRICEPS', targetSets: 3, targetReps: 12, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-back-biceps',
    name: 'Back & Biceps',
    category: 'Back & Pull',
    description: 'Upper back width and thickness combined with peak bicep curls.',
    icon: 'exercise-pullup',
    level: 'Intermediate',
    estimatedMinutes: 45,
    exercises: [
      { name: 'Pull-Up', primaryMuscle: 'BACK', targetSets: 4, targetReps: 8, targetRestSec: 90 },
      { name: 'Barbell Row', primaryMuscle: 'BACK', targetSets: 4, targetReps: 8, targetRestSec: 90 },
      { name: 'Lat Pulldown', primaryMuscle: 'BACK', targetSets: 3, targetReps: 10, targetRestSec: 75 },
      { name: 'Barbell Bicep Curl', primaryMuscle: 'BICEPS', targetSets: 3, targetReps: 10, targetRestSec: 60 },
      { name: 'Hammer Curl', primaryMuscle: 'BICEPS', targetSets: 3, targetReps: 12, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-upper-body',
    name: 'Upper Body Power',
    category: 'Full Body',
    description: 'Antagonistic upper body superset routine for maximum workout density.',
    icon: 'barbell',
    level: 'Intermediate',
    estimatedMinutes: 50,
    exercises: [
      { name: 'Barbell Bench Press', primaryMuscle: 'CHEST', targetSets: 4, targetReps: 8, targetRestSec: 90 },
      { name: 'Barbell Row', primaryMuscle: 'BACK', targetSets: 4, targetReps: 8, targetRestSec: 90 },
      { name: 'Overhead Press', primaryMuscle: 'SHOULDERS', targetSets: 3, targetReps: 8, targetRestSec: 90 },
      { name: 'Pull-Up', primaryMuscle: 'BACK', targetSets: 3, targetReps: 8, targetRestSec: 90 },
      { name: 'Dips', primaryMuscle: 'TRICEPS', targetSets: 3, targetReps: 10, targetRestSec: 75 },
      { name: 'Barbell Bicep Curl', primaryMuscle: 'BICEPS', targetSets: 3, targetReps: 10, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-lower-body',
    name: 'Lower Body Strength',
    category: 'Leg Day',
    description: 'Squat and hip hinge focus with single leg stabilization and calves.',
    icon: 'exercise-squat',
    level: 'Advanced',
    estimatedMinutes: 50,
    exercises: [
      { name: 'Barbell Squat', primaryMuscle: 'LEGS', targetSets: 4, targetReps: 6, targetRestSec: 150 },
      { name: 'Romanian Deadlift', primaryMuscle: 'LEGS', targetSets: 4, targetReps: 8, targetRestSec: 120 },
      { name: 'Bulgarian Split Squat', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 10, targetRestSec: 90 },
      { name: 'Lying Leg Curl', primaryMuscle: 'LEGS', targetSets: 3, targetReps: 12, targetRestSec: 60 },
      { name: 'Standing Calf Raises', primaryMuscle: 'LEGS', targetSets: 4, targetReps: 15, targetRestSec: 60 },
    ],
  },
  {
    id: 'tpl-core-abs',
    name: 'Core & Pillar Stability',
    category: 'Core',
    description: 'Dynamic and isometric 360-degree midsection control.',
    icon: 'exercise-plank',
    level: 'Beginner',
    estimatedMinutes: 25,
    exercises: [
      { name: 'Plank', primaryMuscle: 'CORE', targetSets: 3, targetReps: 1, targetRestSec: 60, targetDuration: 60 },
      { name: 'Hanging Leg Raises', primaryMuscle: 'CORE', targetSets: 3, targetReps: 12, targetRestSec: 60 },
      { name: 'Russian Twists', primaryMuscle: 'CORE', targetSets: 3, targetReps: 20, targetRestSec: 45 },
      { name: 'Bicycle Crunches', primaryMuscle: 'CORE', targetSets: 3, targetReps: 20, targetRestSec: 45 },
      { name: 'Dead Bug', primaryMuscle: 'CORE', targetSets: 3, targetReps: 12, targetRestSec: 45 },
    ],
  },
];
