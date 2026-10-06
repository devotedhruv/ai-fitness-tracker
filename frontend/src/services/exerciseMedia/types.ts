export type MovementPattern =
  | 'SQUAT'
  | 'BENCH_PRESS'
  | 'DEADLIFT'
  | 'OVERHEAD_PRESS'
  | 'PULLUP'
  | 'ROW'
  | 'PUSHUP'
  | 'LUNGE'
  | 'DIP'
  | 'CURL'
  | 'EXTENSION'
  | 'CORE'
  | 'GENERAL';

export type ExerciseMediaType =
  | 'ANIMATION'
  | 'VECTOR'
  | 'VIDEO'
  | 'GIF'
  | 'MODEL3D'
  | 'IMAGE';

export interface ExerciseMedia {
  exerciseId: string;
  exerciseName: string;
  mediaType: ExerciseMediaType;
  animationUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaSource: string;
  movementPattern: MovementPattern;
  overview?: string;
  instructions: string[];
  tips: string[];
  breathing: string;
  commonMistakes: string[];
  variations?: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  targetMuscles?: string[];
  equipment: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  aiCues: string[];
}

export interface IExerciseMediaProvider {
  name: string;
  resolveMedia(exercise: {
    id?: string;
    name: string;
    primaryMuscle?: string;
    secondaryMuscles?: string[];
    equipment?: string[];
    overview?: string;
    instructions?: string[];
    formTips?: string[];
    breathing?: string;
    commonMistakes?: string[];
    variations?: string[];
    media?: any;
    mediaUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
  }): ExerciseMedia;
}
