import { IconName } from '../../components/Icon';

export type RoutineCategory =
  | 'Leg Day'
  | 'Chest'
  | 'Back & Pull'
  | 'Push'
  | 'Pull'
  | 'Arms'
  | 'Shoulders'
  | 'Full Body'
  | 'Core'
  | 'Custom Routine';

export interface CategoryMeta {
  id: RoutineCategory;
  name: string;
  icon: IconName;
  description: string;
  primaryMuscles: string[];
}

export const ROUTINE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'Leg Day',
    name: 'Leg Day',
    icon: 'exercise-squat',
    description: 'Quadriceps, hamstrings, glutes, and calves hypertrophy & strength.',
    primaryMuscles: ['LEGS', 'GLUTES'],
  },
  {
    id: 'Chest',
    name: 'Chest',
    icon: 'exercise-pushup',
    description: 'Upper, mid, and lower pectoral development with compound presses and flies.',
    primaryMuscles: ['CHEST'],
  },
  {
    id: 'Back & Pull',
    name: 'Back & Pull',
    icon: 'exercise-pullup',
    description: 'Lat width, upper back thickness, rhomboids, and rear delts.',
    primaryMuscles: ['BACK', 'BICEPS'],
  },
  {
    id: 'Push',
    name: 'Push',
    icon: 'dumbbell',
    description: 'Chest, anterior deltoids, and triceps pressing chain.',
    primaryMuscles: ['CHEST', 'SHOULDERS', 'TRICEPS'],
  },
  {
    id: 'Pull',
    name: 'Pull',
    icon: 'exercise-pullup',
    description: 'Back, rear shoulders, and biceps pulling chain.',
    primaryMuscles: ['BACK', 'BICEPS'],
  },
  {
    id: 'Arms',
    name: 'Arms',
    icon: 'exercise-curl',
    description: 'Biceps peaks, triceps lockouts, and forearm grip power.',
    primaryMuscles: ['BICEPS', 'TRICEPS'],
  },
  {
    id: 'Shoulders',
    name: 'Shoulders',
    icon: 'barbell',
    description: 'Front, lateral, and rear deltoid 3D shoulder sculpting.',
    primaryMuscles: ['SHOULDERS'],
  },
  {
    id: 'Full Body',
    name: 'Full Body',
    icon: 'today',
    description: 'Balanced multi-joint compound stimulation across major muscle groups.',
    primaryMuscles: ['FULL_BODY', 'LEGS', 'CHEST', 'BACK'],
  },
  {
    id: 'Core',
    name: 'Core',
    icon: 'exercise-plank',
    description: 'Anti-extension, rotational stability, and abdominal endurance.',
    primaryMuscles: ['CORE'],
  },
  {
    id: 'Custom Routine',
    name: 'Custom Routine',
    icon: 'sparkle',
    description: 'Personalized exercise combination tailored to your unique goals.',
    primaryMuscles: ['FULL_BODY'],
  },
];

export interface CuratedExerciseItem {
  name: string;
  role: 'COMPOUND' | 'UPPER' | 'ISOLATION' | 'BODYWEIGHT' | 'ACCESSORY';
  roleLabel: string;
  muscle: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isTimed?: boolean;
  defaultSets: number;
  defaultReps: number;
  defaultRestSec: number;
  defaultDurationSec?: number;
  description: string;
}

export const CATEGORY_RECOMMENDATIONS: Record<RoutineCategory, CuratedExerciseItem[]> = {
  'Leg Day': [
    {
      name: 'Barbell Squat',
      role: 'COMPOUND',
      roleLabel: 'Main Compound (Quads & Glutes)',
      muscle: 'LEGS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 120,
      description: 'The king of lower body movements for quad, glute, and core foundation.',
    },
    {
      name: 'Leg Press',
      role: 'COMPOUND',
      roleLabel: 'Heavy Knee Extension',
      muscle: 'LEGS',
      equipment: 'Machine',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 90,
      description: 'High-volume quad and glute loading with fixed back stabilization.',
    },
    {
      name: 'Romanian Deadlift',
      role: 'COMPOUND',
      roleLabel: 'Hip Hinge (Hamstrings & Glutes)',
      muscle: 'LEGS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Stretches and builds posterior chain power in hamstrings and glutes.',
    },
    {
      name: 'Walking Lunges',
      role: 'COMPOUND',
      roleLabel: 'Unilateral Movement',
      muscle: 'LEGS',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 75,
      description: 'Corrects left-right imbalances and challenges dynamic knee stability.',
    },
    {
      name: 'Bulgarian Split Squat',
      role: 'COMPOUND',
      roleLabel: 'Unilateral Knee Flexion',
      muscle: 'LEGS',
      equipment: 'Dumbbells',
      difficulty: 'Advanced',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'High single-leg hypertrophy targeting quads and glute medius.',
    },
    {
      name: 'Leg Extension',
      role: 'ISOLATION',
      roleLabel: 'Quad Isolation',
      muscle: 'LEGS',
      equipment: 'Machine',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Direct rectus femoris peak contraction in the shortened range.',
    },
    {
      name: 'Lying Leg Curl',
      role: 'ISOLATION',
      roleLabel: 'Hamstring Knee Flexion',
      muscle: 'LEGS',
      equipment: 'Machine',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Isolates hamstring knee flexion without lower back stress.',
    },
    {
      name: 'Barbell Hip Thrust',
      role: 'COMPOUND',
      roleLabel: 'Horizontal Glute Extension',
      muscle: 'GLUTES',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Maximum gluteus maximus mechanical tension at full hip extension.',
    },
    {
      name: 'Standing Calf Raises',
      role: 'ISOLATION',
      roleLabel: 'Gastrocnemius Isolation',
      muscle: 'LEGS',
      equipment: 'Machine',
      difficulty: 'Beginner',
      defaultSets: 4,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Full ankle plantar flexion with deep stretch at bottom.',
    },
  ],

  'Chest': [
    {
      name: 'Barbell Bench Press',
      role: 'COMPOUND',
      roleLabel: 'Main Compound (Mid-Chest)',
      muscle: 'CHEST',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 120,
      description: 'Foundational horizontal press for maximum pectoral and triceps tension.',
    },
    {
      name: 'Incline Dumbbell Press',
      role: 'UPPER',
      roleLabel: 'Upper-Chest Movement',
      muscle: 'CHEST',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Targets clavicular head with deeper range of motion.',
    },
    {
      name: 'Incline Bench Press',
      role: 'UPPER',
      roleLabel: 'Heavy Upper-Chest',
      muscle: 'CHEST',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Heavy barbell press emphasizing upper sternal and anterior deltoids.',
    },
    {
      name: 'Dumbbell Bench Press',
      role: 'COMPOUND',
      roleLabel: 'Independent Flat Press',
      muscle: 'CHEST',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 75,
      description: 'Allows natural wrist rotation and full pectoral convergence at top.',
    },
    {
      name: 'Cable Chest Fly',
      role: 'ISOLATION',
      roleLabel: 'Chest Isolation (Adduction)',
      muscle: 'CHEST',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Continuous peak tension through horizontal adduction.',
    },
    {
      name: 'Cable Crossover',
      role: 'ISOLATION',
      roleLabel: 'Lower-Chest / Squeeze',
      muscle: 'CHEST',
      equipment: 'Cable',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'High-to-low adduction emphasizing lower pectoral sternal fibers.',
    },
    {
      name: 'Standard Push-up',
      role: 'BODYWEIGHT',
      roleLabel: 'Bodyweight Movement',
      muscle: 'CHEST',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Closed-kinetic chain exercise engaging serratus anterior and core.',
    },
    {
      name: 'Decline Dumbbell Press',
      role: 'COMPOUND',
      roleLabel: 'Lower-Chest Compound',
      muscle: 'CHEST',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Sternal head emphasis with reduced shoulder impingement angle.',
    },
  ],

  'Back & Pull': [
    {
      name: 'Pull-Up',
      role: 'COMPOUND',
      roleLabel: 'Vertical Pull (Width)',
      muscle: 'BACK',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'The golden standard vertical pull for lat width and scapular depression.',
    },
    {
      name: 'Lat Pulldown',
      role: 'COMPOUND',
      roleLabel: 'Vertical Cable Pull',
      muscle: 'BACK',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 75,
      description: 'Controlled lat targeting with customizable grip attachments.',
    },
    {
      name: 'Barbell Row',
      role: 'COMPOUND',
      roleLabel: 'Horizontal Pull (Thickness)',
      muscle: 'BACK',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Heavy compound row targeting lats, rhomboids, and mid-traps.',
    },
    {
      name: 'Seated Cable Row',
      role: 'COMPOUND',
      roleLabel: 'Horizontal Cable Row',
      muscle: 'BACK',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Allows scapular protraction and deep mid-back retraction.',
    },
    {
      name: 'One-Arm Dumbbell Row',
      role: 'COMPOUND',
      roleLabel: 'Unilateral Lat Row',
      muscle: 'BACK',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 60,
      description: 'Deep stretch at bottom with high elbow drive towards the hip.',
    },
    {
      name: 'Cable Face Pull',
      role: 'ACCESSORY',
      roleLabel: 'Upper Back & Rear Delt',
      muscle: 'SHOULDERS',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Essential posture builder strengthening external rotators and rear delts.',
    },
    {
      name: 'Barbell Deadlift',
      role: 'COMPOUND',
      roleLabel: 'Heavy Full Posterior Pull',
      muscle: 'BACK',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      defaultSets: 3,
      defaultReps: 5,
      defaultRestSec: 150,
      description: 'Full-body posterior chain power from floor to complete lockout.',
    },
    {
      name: 'Straight-Arm Cable Pulldown',
      role: 'ISOLATION',
      roleLabel: 'Lat Isolation',
      muscle: 'BACK',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Direct lat activation without bicep involvement.',
    },
  ],

  'Push': [
    {
      name: 'Barbell Bench Press',
      role: 'COMPOUND',
      roleLabel: 'Heavy Horizontal Press',
      muscle: 'CHEST',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 120,
      description: 'Maximum horizontal pressing capacity.',
    },
    {
      name: 'Overhead Press',
      role: 'COMPOUND',
      roleLabel: 'Heavy Vertical Press',
      muscle: 'SHOULDERS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Strict vertical shoulder press with core stabilization.',
    },
    {
      name: 'Incline Dumbbell Press',
      role: 'UPPER',
      roleLabel: 'Upper Chest Press',
      muscle: 'CHEST',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Incline angle targeting clavicular head.',
    },
    {
      name: 'Lateral Raise',
      role: 'ISOLATION',
      roleLabel: 'Medial Delt Isolation',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 4,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Isolates side deltoid for shoulder width.',
    },
    {
      name: 'Dips',
      role: 'COMPOUND',
      roleLabel: 'Vertical Tricep & Lower Chest',
      muscle: 'TRICEPS',
      equipment: 'Parallel Bars',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 75,
      description: 'Powerful bodyweight press targeting triceps and lower chest.',
    },
    {
      name: 'Cable Tricep Pushdown',
      role: 'ISOLATION',
      roleLabel: 'Triceps Isolation',
      muscle: 'TRICEPS',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Isolates lateral and medial heads of the triceps.',
    },
    {
      name: 'Standard Push-up',
      role: 'BODYWEIGHT',
      roleLabel: 'Bodyweight Finisher',
      muscle: 'CHEST',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 2,
      defaultReps: 20,
      defaultRestSec: 60,
      description: 'High-rep muscular endurance finisher.',
    },
  ],

  'Pull': [
    {
      name: 'Barbell Deadlift',
      role: 'COMPOUND',
      roleLabel: 'Full Posterior Chain Pull',
      muscle: 'BACK',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      defaultSets: 3,
      defaultReps: 5,
      defaultRestSec: 150,
      description: 'Maximal pulling strength.',
    },
    {
      name: 'Pull-Up',
      role: 'COMPOUND',
      roleLabel: 'Vertical Bodyweight Pull',
      muscle: 'BACK',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Builds broad V-taper lat width.',
    },
    {
      name: 'Barbell Row',
      role: 'COMPOUND',
      roleLabel: 'Horizontal Barbell Row',
      muscle: 'BACK',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Mid-back thickness and spinal erector isometric control.',
    },
    {
      name: 'Cable Face Pull',
      role: 'ACCESSORY',
      roleLabel: 'Rear Delt & Rotator Cuff',
      muscle: 'SHOULDERS',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Protects shoulders and thickens rear deltoids.',
    },
    {
      name: 'Barbell Bicep Curl',
      role: 'ISOLATION',
      roleLabel: 'Compound Arm Builder',
      muscle: 'BICEPS',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 60,
      description: 'Overload bicep flexors with straight bar.',
    },
    {
      name: 'Hammer Curl',
      role: 'ISOLATION',
      roleLabel: 'Brachialis & Forearm',
      muscle: 'BICEPS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Neutral grip targeting brachialis and brachioradialis.',
    },
  ],

  'Shoulders': [
    {
      name: 'Overhead Press',
      role: 'COMPOUND',
      roleLabel: 'Main Vertical Press',
      muscle: 'SHOULDERS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 4,
      defaultReps: 8,
      defaultRestSec: 120,
      description: 'Primary compound shoulder builder standing strict overhead.',
    },
    {
      name: 'Dumbbell Shoulder Press',
      role: 'COMPOUND',
      roleLabel: 'Seated Dumbbell Press',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'High range of motion overhead dumbbell press.',
    },
    {
      name: 'Lateral Raise',
      role: 'ISOLATION',
      roleLabel: 'Side Delt Width',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 4,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Crucial exercise for widening silhouette.',
    },
    {
      name: 'Front Dumbbell Raise',
      role: 'ISOLATION',
      roleLabel: 'Anterior Delt Isolation',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Raises dumbbell straight ahead to eye level.',
    },
    {
      name: 'Rear Delt Fly',
      role: 'ISOLATION',
      roleLabel: 'Posterior Delt Isolation',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'Hinged bent-over fly targeting posterior deltoid.',
    },
    {
      name: 'Arnold Press',
      role: 'COMPOUND',
      roleLabel: 'Rotational Overhead Press',
      muscle: 'SHOULDERS',
      equipment: 'Dumbbells',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Begins with palms facing body, rotating outward during overhead ascent.',
    },
    {
      name: 'Cable Face Pull',
      role: 'ACCESSORY',
      roleLabel: 'Rear Delt & Upper Traps',
      muscle: 'SHOULDERS',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 15,
      defaultRestSec: 60,
      description: 'High face pull with external rotation.',
    },
  ],

  'Arms': [
    {
      name: 'Barbell Bicep Curl',
      role: 'COMPOUND',
      roleLabel: 'Bicep Mass Builder',
      muscle: 'BICEPS',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 60,
      description: 'Strict standing curl focusing on supination and peak contraction.',
    },
    {
      name: 'Dumbbell Curl',
      role: 'ISOLATION',
      roleLabel: 'Independent Bicep Curl',
      muscle: 'BICEPS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Allows supination rotation at the top of each repetition.',
    },
    {
      name: 'Hammer Curl',
      role: 'ISOLATION',
      roleLabel: 'Brachialis & Forearms',
      muscle: 'BICEPS',
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Neutral palms-in grip for bicep thickness and forearm strength.',
    },
    {
      name: 'Cable Tricep Pushdown',
      role: 'ISOLATION',
      roleLabel: 'Lateral Tricep Head',
      muscle: 'TRICEPS',
      equipment: 'Cable',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Steady tension on triceps lockout.',
    },
    {
      name: 'Skull Crushers',
      role: 'COMPOUND',
      roleLabel: 'Lying Triceps Extension',
      muscle: 'TRICEPS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 75,
      description: 'Lowers bar behind forehead for massive long-head tricep stretch.',
    },
    {
      name: 'Overhead Tricep Extension',
      role: 'ISOLATION',
      roleLabel: 'Long Head Triceps Stretch',
      muscle: 'TRICEPS',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Overhead position provides full stretch on long head of triceps.',
    },
    {
      name: 'Dips',
      role: 'BODYWEIGHT',
      roleLabel: 'Heavy Bodyweight Triceps',
      muscle: 'TRICEPS',
      equipment: 'Parallel Bars',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Upright dip angle keeping emphasis locked on triceps.',
    },
  ],

  'Core': [
    {
      name: 'Plank',
      role: 'BODYWEIGHT',
      roleLabel: 'Isometric Core Anti-Extension',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      isTimed: true,
      defaultSets: 3,
      defaultReps: 1,
      defaultRestSec: 60,
      defaultDurationSec: 45,
      description: 'Total core rigidity resisting lumbar hyperextension.',
    },
    {
      name: 'Crunches',
      role: 'ISOLATION',
      roleLabel: 'Upper Rectus Abdominis',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 20,
      defaultRestSec: 45,
      description: 'Controlled spinal flexion bringing ribs toward pelvis.',
    },
    {
      name: 'Hanging Leg Raises',
      role: 'COMPOUND',
      roleLabel: 'Lower Abs & Hip Flexors',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 60,
      description: 'Hanging from pull-up bar, curling knees or toes to bar.',
    },
    {
      name: 'Russian Twists',
      role: 'ISOLATION',
      roleLabel: 'Oblique Rotational Strength',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 20,
      defaultRestSec: 45,
      description: 'Rotational core endurance in a V-sit posture.',
    },
    {
      name: 'Bicycle Crunches',
      role: 'ISOLATION',
      roleLabel: 'Dynamic Cross-Body Flexion',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 20,
      defaultRestSec: 45,
      description: 'High EMG activation of both rectus abdominis and obliques.',
    },
    {
      name: 'Mountain Climbers',
      role: 'BODYWEIGHT',
      roleLabel: 'Dynamic Core & Cardio',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      isTimed: true,
      defaultSets: 3,
      defaultReps: 1,
      defaultRestSec: 45,
      defaultDurationSec: 30,
      description: 'Rapid alternating knee drives from push-up plank position.',
    },
    {
      name: 'Dead Bug',
      role: 'ACCESSORY',
      roleLabel: 'Anti-Extension Stability',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 12,
      defaultRestSec: 45,
      description: 'Maintains flat lumbar spine while extending opposite arm and leg.',
    },
  ],

  'Full Body': [
    {
      name: 'Barbell Squat',
      role: 'COMPOUND',
      roleLabel: 'Lower Body Compound',
      muscle: 'LEGS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 120,
      description: 'Primary lower body foundation.',
    },
    {
      name: 'Barbell Bench Press',
      role: 'COMPOUND',
      roleLabel: 'Upper Body Horizontal Push',
      muscle: 'CHEST',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Horizontal pressing power.',
    },
    {
      name: 'Barbell Row',
      role: 'COMPOUND',
      roleLabel: 'Upper Body Horizontal Pull',
      muscle: 'BACK',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Back thickness and scapular retraction.',
    },
    {
      name: 'Overhead Press',
      role: 'COMPOUND',
      roleLabel: 'Upper Body Vertical Push',
      muscle: 'SHOULDERS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Vertical shoulder press.',
    },
    {
      name: 'Romanian Deadlift',
      role: 'COMPOUND',
      roleLabel: 'Posterior Chain Hinge',
      muscle: 'LEGS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Hamstring and glute development.',
    },
    {
      name: 'Plank',
      role: 'BODYWEIGHT',
      roleLabel: 'Core Stabilization',
      muscle: 'CORE',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      isTimed: true,
      defaultSets: 3,
      defaultReps: 1,
      defaultRestSec: 60,
      defaultDurationSec: 45,
      description: 'Core stability finisher.',
    },
  ],

  'Custom Routine': [
    {
      name: 'Barbell Bench Press',
      role: 'COMPOUND',
      roleLabel: 'Chest Compound',
      muscle: 'CHEST',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90,
      description: 'Horizontal pressing foundation.',
    },
    {
      name: 'Barbell Squat',
      role: 'COMPOUND',
      roleLabel: 'Leg Compound',
      muscle: 'LEGS',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 120,
      description: 'Lower body foundation.',
    },
    {
      name: 'Pull-Up',
      role: 'COMPOUND',
      roleLabel: 'Back Compound',
      muscle: 'BACK',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      defaultSets: 3,
      defaultReps: 8,
      defaultRestSec: 90,
      description: 'Vertical pulling foundation.',
    },
  ],
};

/**
 * Smart Routine Coverage Analysis
 */
export interface CoverageAnalysis {
  category: RoutineCategory;
  isBalanced: boolean;
  explanation: string;
  missingRoles: string[];
  suggestedAdditions: CuratedExerciseItem[];
}

export function analyzeRoutineCoverage(
  category: RoutineCategory,
  currentExerciseNames: string[]
): CoverageAnalysis {
  const normalizedCurrent = currentExerciseNames.map((n) => n.toLowerCase().trim());
  const categoryPool = CATEGORY_RECOMMENDATIONS[category] || CATEGORY_RECOMMENDATIONS['Custom Routine'];

  if (category === 'Chest') {
    const hasCompound = normalizedCurrent.some((n) => n.includes('bench press'));
    const hasIncline = normalizedCurrent.some((n) => n.includes('incline'));
    const hasFly = normalizedCurrent.some((n) => n.includes('fly') || n.includes('crossover'));
    const hasBodyweight = normalizedCurrent.some((n) => n.includes('push-up') || n.includes('pushup') || n.includes('dip'));

    const missingRoles: string[] = [];
    if (!hasCompound) missingRoles.push('Main Compound Press (e.g. Bench Press)');
    if (!hasIncline) missingRoles.push('Upper-Chest Incline (e.g. Incline Dumbbell Press)');
    if (!hasFly) missingRoles.push('Chest Isolation (e.g. Cable Fly)');
    if (!hasBodyweight) missingRoles.push('Bodyweight Finisher (e.g. Push-Ups)');

    const isBalanced = hasCompound && hasIncline && hasFly && hasBodyweight;
    const explanation = isBalanced
      ? 'Recommended because this routine covers your upper, middle, and overall chest with compound, isolation, and bodyweight movements.'
      : `Recommended focus: Add ${missingRoles.slice(0, 2).join(' and ')} for balanced pectoral coverage.`;

    const suggestedAdditions = categoryPool.filter(
      (item) => !normalizedCurrent.some((n) => n.includes(item.name.toLowerCase()))
    ).slice(0, 3);

    return {
      category,
      isBalanced,
      explanation,
      missingRoles,
      suggestedAdditions,
    };
  }

  if (category === 'Leg Day') {
    const hasSquat = normalizedCurrent.some((n) => n.includes('squat') || n.includes('leg press'));
    const hasHinge = normalizedCurrent.some((n) => n.includes('deadlift') || n.includes('curl'));
    const hasUnilateral = normalizedCurrent.some((n) => n.includes('lunge') || n.includes('split'));
    const hasCalf = normalizedCurrent.some((n) => n.includes('calf'));

    const missingRoles: string[] = [];
    if (!hasSquat) missingRoles.push('Quad Compound (Squat / Leg Press)');
    if (!hasHinge) missingRoles.push('Hamstring Hinge (RDL / Leg Curl)');
    if (!hasUnilateral) missingRoles.push('Single-Leg Balance (Lunges / Split Squat)');
    if (!hasCalf) missingRoles.push('Calf Isolation');

    const isBalanced = hasSquat && hasHinge && (hasUnilateral || hasCalf);
    const explanation = isBalanced
      ? 'Well-rounded lower body routine covering anterior quads, posterior hamstrings, glute extension, and calves.'
      : `Recommended focus: Add ${missingRoles.slice(0, 2).join(' and ')} for complete leg symmetry.`;

    const suggestedAdditions = categoryPool.filter(
      (item) => !normalizedCurrent.some((n) => n.includes(item.name.toLowerCase()))
    ).slice(0, 3);

    return {
      category,
      isBalanced,
      explanation,
      missingRoles,
      suggestedAdditions,
    };
  }

  if (category === 'Back & Pull' || category === 'Pull') {
    const hasVertical = normalizedCurrent.some((n) => n.includes('pull-up') || n.includes('pulldown'));
    const hasHorizontal = normalizedCurrent.some((n) => n.includes('row'));
    const hasRearDelt = normalizedCurrent.some((n) => n.includes('face pull') || n.includes('rear delt'));

    const missingRoles: string[] = [];
    if (!hasVertical) missingRoles.push('Vertical Pull (Pull-Up / Lat Pulldown)');
    if (!hasHorizontal) missingRoles.push('Horizontal Pull (Barbell / Cable Row)');
    if (!hasRearDelt) missingRoles.push('Upper Back / Rear Delt (Face Pull)');

    const isBalanced = hasVertical && hasHorizontal;
    const explanation = isBalanced
      ? 'Strong pull routine balancing vertical lat width with horizontal mid-back thickness.'
      : `Recommended focus: Add ${missingRoles.join(' and ')} to balance lat width with mid-back thickness.`;

    const suggestedAdditions = categoryPool.filter(
      (item) => !normalizedCurrent.some((n) => n.includes(item.name.toLowerCase()))
    ).slice(0, 3);

    return {
      category,
      isBalanced,
      explanation,
      missingRoles,
      suggestedAdditions,
    };
  }

  // Generic category handler
  const suggestedAdditions = categoryPool.filter(
    (item) => !normalizedCurrent.some((n) => n.includes(item.name.toLowerCase()))
  ).slice(0, 3);

  return {
    category,
    isBalanced: currentExerciseNames.length >= 3,
    explanation: currentExerciseNames.length >= 3
      ? 'Well-structured routine with varied movement selection.'
      : 'Select complementary compound and isolation movements for balanced training.',
    missingRoles: [],
    suggestedAdditions,
  };
}

/**
 * Validation & Avoid Poor Exercise Combinations
 */
export interface RoutineValidationAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info';
}

export function validateRoutineBalance(exercises: Array<{ name: string }>): RoutineValidationAlert[] {
  const alerts: RoutineValidationAlert[] = [];
  const normalized = exercises.map((e) => e.name.toLowerCase());

  // 1. Redundant pressing exercises
  const isChestPress = (n: string) =>
    (n.includes('press') && (n.includes('bench') || n.includes('chest') || n.includes('incline') || n.includes('decline'))) ||
    n.includes('push-up') ||
    n.includes('pushup');

  const chestPresses = normalized.filter(isChestPress);
  if (chestPresses.length >= 4) {
    alerts.push({
      id: 'redundant-press',
      title: 'Redundant Pressing Movements',
      message: `Your routine has ${chestPresses.length} chest pressing exercises. Consider replacing one with a chest isolation exercise (like Cable Fly) instead.`,
      type: 'warning',
    });
  }

  // 2. High volume warning
  if (exercises.length > 8) {
    alerts.push({
      id: 'high-volume',
      title: 'High Exercise Volume',
      message: `You have ${exercises.length} exercises. High volume may lead to excessive session fatigue. Consider splitting across two distinct sessions.`,
      type: 'warning',
    });
  }

  // 3. Lack of variety
  if (exercises.length > 3) {
    const allPush = exercises.every((e) => e.name.toLowerCase().includes('press') || e.name.toLowerCase().includes('push'));
    if (allPush) {
      alerts.push({
        id: 'lack-variety',
        title: 'Lack of Variety',
        message: 'This routine consists exclusively of pressing movements. Consider adding an isolation or pull movement for joint balance.',
        type: 'info',
      });
    }
  }

  return alerts;
}

/**
 * Estimated Duration Calculator
 */
export function calculateEstimatedDurationMinutes(
  exercises: Array<{ targetSets: number; targetReps: number; targetRestSec: number; targetDuration?: number }>
): number {
  if (exercises.length === 0) return 0;
  let totalSeconds = 0;

  for (const ex of exercises) {
    const sets = ex.targetSets || 3;
    const reps = ex.targetReps || 10;
    const rest = ex.targetRestSec || 90;
    const duration = ex.targetDuration || 0;

    // Approximate ~3.5 seconds per repetition if rep-based, else duration
    const setExecutionSeconds = duration > 0 ? duration : reps * 3.5;
    totalSeconds += sets * (setExecutionSeconds + rest);
  }

  return Math.max(5, Math.round(totalSeconds / 60));
}
