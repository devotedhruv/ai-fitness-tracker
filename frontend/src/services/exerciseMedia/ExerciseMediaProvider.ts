import { ExerciseMedia, ExerciseMediaType, IExerciseMediaProvider, MovementPattern } from './types';
import { resolveCatalogMedia } from './exerciseCatalogMedia';

export function resolveMovementPattern(name: string, primaryMuscle?: string): MovementPattern {
  const lower = (name || '').toLowerCase();

  if (lower.includes('squat') || lower.includes('leg press') || lower.includes('hack squat')) {
    return 'SQUAT';
  }
  if (lower.includes('overhead') || lower.includes('military press') || lower.includes('shoulder press') || lower.includes('arnold press') || lower.includes('lateral raise')) {
    return 'OVERHEAD_PRESS';
  }
  if (lower.includes('bench press') || lower.includes('chest press') || lower.includes('dumbbell press') || lower.includes('floor press') || lower.includes('pec deck') || lower.includes('chest fly') || lower.includes('pec fly')) {
    return 'BENCH_PRESS';
  }
  if (lower.includes('deadlift') || lower.includes('good morning') || lower.includes('hip thrust') || lower.includes('romanian')) {
    return 'DEADLIFT';
  }
  if (lower.includes('pull-up') || lower.includes('chin-up') || lower.includes('lat pulldown') || lower.includes('pull up') || lower.includes('chin up')) {
    return 'PULLUP';
  }
  if (lower.includes('row') || lower.includes('pullover') || lower.includes('face pull')) {
    return 'ROW';
  }
  if (lower.includes('push-up') || lower.includes('pushup') || lower.includes('push up')) {
    return 'PUSHUP';
  }
  if (lower.includes('lunge') || lower.includes('split squat') || lower.includes('step up')) {
    return 'LUNGE';
  }
  if (lower.includes('dip') || lower.includes('bench dip')) {
    return 'DIP';
  }
  if (lower.includes('curl') || lower.includes('bicep')) {
    return 'CURL';
  }
  if (lower.includes('tricep') || lower.includes('skull crusher') || lower.includes('pushdown')) {
    return 'EXTENSION';
  }
  if (lower.includes('plank') || lower.includes('crunch') || lower.includes('leg raise') || lower.includes('ab wheel') || lower.includes('hollow')) {
    return 'CORE';
  }

  // Fallback by primary muscle
  const muscle = (primaryMuscle || '').toUpperCase();
  if (muscle === 'LEGS' || muscle === 'GLUTES') return 'SQUAT';
  if (muscle === 'CHEST') return 'BENCH_PRESS';
  if (muscle === 'BACK') return 'ROW';
  if (muscle === 'SHOULDERS') return 'OVERHEAD_PRESS';
  if (muscle === 'CORE') return 'CORE';
  if (muscle === 'BICEPS') return 'CURL';
  if (muscle === 'TRICEPS') return 'EXTENSION';

  return 'GENERAL';
}

const DEFAULT_MOVEMENT_DATA: Record<
  MovementPattern,
  {
    instructions: string[];
    tips: string[];
    breathing: string;
    commonMistakes: string[];
    aiCues: string[];
    primaryMuscles: string[];
    secondaryMuscles: string[];
  }
> = {
  SQUAT: {
    instructions: [
      'Position feet shoulder-width apart with toes angled slightly outward.',
      'Inhale deeply, brace your core, and initiate the descent by breaking at hips and knees simultaneously.',
      'Lower under control until hips crease below the tops of your knees.',
      'Drive powerfully through your midfoot to return to full upright lockout.',
    ],
    tips: [
      'Keep your chest proud and upper back tight throughout the movement.',
      'Track your knees outward in line with your toes.',
      'Maintain continuous tension—avoid collapsing at the bottom.',
    ],
    breathing: 'Inhale and brace core into belly before descending. Exhale forcefully through teeth on the drive up past sticking point.',
    commonMistakes: [
      'Knees caving inward (valgus collapse).',
      'Rising on toes or heels lifting off the ground.',
      'Excessive forward lean causing lower back rounding.',
    ],
    aiCues: [
      'Maintain vertical chest angle.',
      'Drive knees out over pinky toes.',
      'Press through full foot tripod.',
    ],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Adductors'],
  },
  BENCH_PRESS: {
    instructions: [
      'Lie flat on the bench with eyes positioned directly below the barbell.',
      'Grip the bar slightly wider than shoulder width and set your shoulder blades tight into the pad.',
      'Unrack the bar and stabilize over your upper chest.',
      'Lower the bar under control to touch your mid-chest while tucking elbows at ~45-75 degrees.',
      'Press the bar explosively back to lockout over shoulders.',
    ],
    tips: [
      'Plant your feet firmly into the floor to generate full-body leg drive.',
      'Squeeze the bar hard to maximize muscular recruitment in the shoulders and triceps.',
      'Retract and depress scapulae to protect anterior shoulders.',
    ],
    breathing: 'Inhale deeply as you lower the bar to your sternum. Exhale forcefully as you press upward.',
    commonMistakes: [
      'Flaring elbows out to 90 degrees.',
      'Bouncing the bar off ribs or sternum.',
      'Lifting glutes off the bench during heavy presses.',
    ],
    aiCues: [
      'Keep shoulder blades pinned to the bench.',
      'Tuck elbows slightly toward torso.',
      'Drive feet firmly into the floor.',
    ],
    primaryMuscles: ['Chest (Pectorals)'],
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
  },
  DEADLIFT: {
    instructions: [
      'Stand with feet hip-width apart, barbell crossing mid-foot.',
      'Hinge at hips to grip the bar just outside your shins.',
      'Pull slack out of the bar, pull chest up, and brace lats.',
      'Push the floor away through your heels and stand tall with glute lock.',
      'Hinge back down under control to reset for each rep.',
    ],
    tips: [
      'Think of pushing the earth away rather than pulling with your arms.',
      'Keep the barbell in light contact with your shins and thighs throughout.',
      'Never round your lumbar spine under heavy loads.',
    ],
    breathing: 'Deep diaphragmatic inhale and core brace at floor. Hold through pull, exhale upon reaching standing lockout.',
    commonMistakes: [
      'Allowing bar to drift forward away from shins.',
      'Rounding lower back during initial lift-off.',
      'Hyperextending spine backward at top lockout.',
    ],
    aiCues: [
      'Pack lats like squeezing an orange in armpits.',
      'Keep bar glued to your body.',
      'Snap glutes shut at the top.',
    ],
    primaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back'],
    secondaryMuscles: ['Lats', 'Trapezius', 'Forearms', 'Core'],
  },
  OVERHEAD_PRESS: {
    instructions: [
      'Hold the bar or dumbbells at collarbone level with elbows slightly in front of bar.',
      'Brace glutes, quads, and abdominal wall tightly.',
      'Press directly upward, clearing head back slightly until bar passes forehead.',
      'Lock out overhead with arms fully extended and head returning forward.',
      'Lower under control back to front rack.',
    ],
    tips: [
      'Maintain total body rigidity—squeezing glutes prevents lower back sway.',
      'Press in a straight vertical bar path.',
      'Shrug shoulders up slightly at full lockout for scapular upward rotation.',
    ],
    breathing: 'Inhale and brace at bottom rack. Exhale past forehead as you lock overhead.',
    commonMistakes: [
      'Excessive backward arching in lumbar spine.',
      'Pressing bar forward in an arc instead of vertically.',
      'Uncontrolled drop on descent.',
    ],
    aiCues: [
      'Squeeze glutes hard to protect lower back.',
      'Push head through the window at lockout.',
      'Keep forearms vertical under bar.',
    ],
    primaryMuscles: ['Deltoids (Shoulders)'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
  },
  PULLUP: {
    instructions: [
      'Grip the bar slightly wider than shoulder width with palms facing away.',
      'Hang at full extension with active shoulders (scapulae engaged).',
      'Drive elbows down and back to pull your chest up to bar height.',
      'Pause momentarily at the top, then lower under complete control to full hang.',
    ],
    tips: [
      'Initiate with scapular depression before bending elbows.',
      'Avoid swinging or kipping when performing strict reps.',
      'Focus on driving elbows into your back pockets.',
    ],
    breathing: 'Inhale at bottom hang. Exhale forcefully as you pull chin over bar.',
    commonMistakes: [
      'Reaching with chin instead of pulling chest up.',
      'Incomplete range of motion (half reps).',
      'Shoulders rolling forward at top.',
    ],
    aiCues: [
      'Drive elbows down toward ribcage.',
      'Squeeze lats at apex.',
      'Lower with smooth 2-second cadence.',
    ],
    primaryMuscles: ['Latissimus Dorsi (Lats)'],
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Forearms'],
  },
  ROW: {
    instructions: [
      'Hinge at hips with torso bent forward at ~45-60 degrees.',
      'Hold weight with arms hanging straight down.',
      'Pull elbows back toward hips, squeezing shoulder blades together.',
      'Lower weight under control without rounding back.',
    ],
    tips: [
      'Keep knees soft and core braced to support lower back.',
      'Lead movement with elbows rather than biceps.',
      'Pause 1 second at peak contraction.',
    ],
    breathing: 'Exhale as you pull towards torso. Inhale as you extend arms.',
    commonMistakes: [
      'Using momentum or jerking torso upright.',
      'Rounding upper and lower back.',
      'Shrugging shoulders into ears.',
    ],
    aiCues: [
      'Pull to belly button, not chest.',
      'Pinch shoulder blades together.',
      'Keep neck in neutral alignment.',
    ],
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Core'],
  },
  PUSHUP: {
    instructions: [
      'Set hands slightly wider than shoulder-width, body forming a straight plank line.',
      'Lower your entire body in one solid unit until chest touches floor or passes hands.',
      'Press ground away to return to full arm lockout.',
    ],
    tips: [
      'Tuck elbows at 45 degrees—avoid flaring.',
      'Squeeze glutes and abs to prevent hip sag.',
      'Reach full protraction at top of every rep.',
    ],
    breathing: 'Inhale as you lower. Exhale as you push up.',
    commonMistakes: [
      'Sagging hips or piking hips upward.',
      'Elbows flared out 90 degrees.',
      'Dropping head down toward floor.',
    ],
    aiCues: [
      'Keep body rigid as a steel rod.',
      'Tuck elbows 45 degrees from torso.',
      'Push floor away with full palms.',
    ],
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts', 'Core'],
  },
  LUNGE: {
    instructions: [
      'Take a controlled stride forward or backward.',
      'Lower hips until front thigh is parallel to floor and back knee hovers 2 cm above ground.',
      'Drive through front heel to step back to starting position.',
    ],
    tips: [
      'Keep torso upright and hips squared.',
      'Front knee should stay stable and aligned over midfoot.',
      'Distribute weight evenly across front foot.',
    ],
    breathing: 'Inhale on the step and descent. Exhale as you drive back upright.',
    commonMistakes: [
      'Front knee collapsing inward.',
      'Banging back knee on floor.',
      'Leaning excessively forward.',
    ],
    aiCues: [
      'Keep torso tall and balanced.',
      'Front shin near vertical.',
      'Drive through front heel.',
    ],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
  },
  DIP: {
    instructions: [
      'Mount parallel bars with arms locked out.',
      'Lean torso slightly forward (~15 degrees) for chest emphasis or stay upright for triceps.',
      'Lower until shoulders are below elbows.',
      'Press back up to full lockout.',
    ],
    tips: [
      'Keep elbows tracking backward, not flaring out.',
      'Control the descent to protect shoulder joints.',
    ],
    breathing: 'Inhale descending, exhale pressing up.',
    commonMistakes: ['Cutting range of motion short', 'Excessive shoulder shrugging'],
    aiCues: ['Lower under 2-second control', 'Drive palms down into bars'],
    primaryMuscles: ['Triceps', 'Lower Chest'],
    secondaryMuscles: ['Front Deltoids'],
  },
  CURL: {
    instructions: [
      'Stand with weights at sides, palms facing forward or neutral.',
      'Curl weight upward while pinning elbows against ribcage.',
      'Squeeze biceps hard at top contraction.',
      'Lower under slow 2-second control.',
    ],
    tips: ['Eliminate swinging or hip momentum.', 'Rotate pinky finger up at top for peak biceps activation.'],
    breathing: 'Exhale curling up, inhale lowering down.',
    commonMistakes: ['Swinging torso', 'Drifting elbows far forward'],
    aiCues: ['Elbows pinned to sides', 'Squeeze at the top'],
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Brachialis', 'Forearms'],
  },
  EXTENSION: {
    instructions: [
      'Hold weight overhead or at cable pulley with elbows tucked.',
      'Extend forearms until arms reach full extension.',
      'Squeeze triceps at lockout, then return under control.',
    ],
    tips: ['Keep upper arms stationary throughout.'],
    breathing: 'Exhale extending, inhale returning.',
    commonMistakes: ['Flaring elbows', 'Using bodyweight swing'],
    aiCues: ['Isolate at the elbow joint', 'Control the stretch'],
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Forearms'],
  },
  CORE: {
    instructions: [
      'Assume active plank or hollow position on floor.',
      'Brace abdominal wall tightly like preparing for a punch.',
      'Maintain steady neutral spine and smooth breathing.',
    ],
    tips: ['Squeeze glutes and tuck pelvis slightly.'],
    breathing: 'Short, controlled diaphragmatic breaths while maintaining core brace.',
    commonMistakes: ['Sagging lower back', 'Holding breath'],
    aiCues: ['Pull belly button to spine', 'Squeeze glutes tight'],
    primaryMuscles: ['Core (Abs / Obliques)'],
    secondaryMuscles: ['Hip Flexors', 'Lower Back'],
  },
  GENERAL: {
    instructions: [
      'Set up with balanced posture and stable base of support.',
      'Initiate movement under complete control with neutral spine.',
      'Move through full active range of motion.',
      'Return to starting position smoothly.',
    ],
    tips: ['Focus on mind-muscle connection.', 'Control the eccentric (lowering) phase.'],
    breathing: 'Inhale before effort / during lowering; exhale during maximum effort.',
    commonMistakes: ['Rushing the rep cadence', 'Sacrificing form for weight'],
    aiCues: ['Control every inch of the movement', 'Keep core braced'],
    primaryMuscles: ['Primary Target'],
    secondaryMuscles: ['Supporting Stabilizers'],
  },
};

/**
 * ExerciseDB Sample Data & Media Mappings
 * Extracted directly from https://github.com/exercisedb/exercisedb-api
 */
export const EXERCISEDB_SAMPLES: Record<string, Partial<ExerciseMedia>> = {
  'barbell bent over row': {
    exerciseName: 'Barbell Bent Over Row',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_row.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0027-eZyBC3j.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0027-eZyBC3j.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'ROW',
    overview: 'The Barbell Bent Over Row builds mid-back thickness, lat recruitment, and scapular retraction.',
    primaryMuscles: ['Back', 'Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Core'],
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell row': {
    exerciseName: 'Barbell Bent Over Row',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_row.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0027-eZyBC3j.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0027-eZyBC3j.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'ROW',
    overview: 'The Barbell Row targets upper and middle back musculature.',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    targetMuscles: ['Latissimus Dorsi'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'standing calf raises': {
    exerciseName: 'Standing Calf Raises',
    mediaType: 'VIDEO',
    videoUrl: '/videos/standing_calf_raise.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1372-8ozhUIZ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1372-8ozhUIZ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'SQUAT',
    overview: 'Standing Calf Raises target the gastrocnemius through full plantarflexion.',
    primaryMuscles: ['Calves', 'Gastrocnemius'],
    secondaryMuscles: ['Soleus'],
    targetMuscles: ['Gastrocnemius'],
    equipment: ['Barbell', 'Calf Block'],
    difficulty: 'BEGINNER',
  },


  'barbell full squat': {
    exerciseName: 'Barbell Full Squat',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_squat.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'SQUAT',
    overview: 'The Barbell Squat is the king of lower-body compound movements, recruiting maximum quadriceps, glutes, adductors, and spinal erector motor units.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Adductors'],
    targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell squat': {
    exerciseName: 'Barbell Squat',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_squat.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'SQUAT',
    overview: 'The Barbell Squat is the king of lower-body compound movements, recruiting maximum quadriceps, glutes, adductors, and spinal erector motor units.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Adductors'],
    targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell back squat': {
    exerciseName: 'Barbell Back Squat',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_squat.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0043-qXTaZnJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'SQUAT',
    overview: 'The Barbell Back Squat develops formidable leg driving power, hip extension strength, and core stability.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell bench press': {
    exerciseName: 'Barbell Bench Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_bench_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-EIeI8Vf.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-EIeI8Vf.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview: 'The standard Barbell Bench Press is the gold standard upper body horizontal press targeting the sternal and clavicular pectoralis, triceps brachii, and anterior deltoids.',
    primaryMuscles: ['Chest', 'Pectorals'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    targetMuscles: ['Pectoralis Major', 'Triceps Brachii'],
    equipment: ['Barbell', 'Flat Bench'],
    difficulty: 'INTERMEDIATE',
  },
  'bench press': {
    exerciseName: 'Barbell Bench Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_bench_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-EIeI8Vf.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-EIeI8Vf.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview: 'The standard Barbell Bench Press is the gold standard upper body horizontal press targeting pectorals and triceps.',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    targetMuscles: ['Pectoralis Major', 'Triceps Brachii'],
    equipment: ['Barbell', 'Flat Bench'],
    difficulty: 'INTERMEDIATE',
  },
  'incline dumbbell press': {
    exerciseName: 'Incline Dumbbell Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lat_pulldown.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0314-ns0SIbU.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0314-ns0SIbU.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview: 'The Incline Dumbbell Press elevates the torso to 30 degrees, prioritizing the clavicular head (upper chest) and front deltoids with free range of motion.',
    primaryMuscles: ['Chest', 'Pectoralis Major Clavicular Head'],
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    targetMuscles: ['Pectoralis Clavicular Head'],
    equipment: ['Dumbbells', 'Incline Bench'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell incline bench press': {
    exerciseName: 'Barbell Incline Bench Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/incline_dumbbell_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0047-3TZduzM.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0047-3TZduzM.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview: 'The Barbell Incline Press shifts mechanical stress toward the upper pectorals and anterior deltoids.',
    primaryMuscles: ['Chest', 'Upper Pectorals'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    targetMuscles: ['Pectoralis Major Clavicular Head'],
    equipment: ['Barbell', 'Incline Bench'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell deadlift': {
    exerciseName: 'Barbell Deadlift',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_deadlift.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-ila4NZS.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-ila4NZS.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'DEADLIFT',
    overview: 'The Conventional Barbell Deadlift recruits the entire posterior chain—gluteus maximus, hamstrings, spinal erectors, traps, and latissimus dorsi—for raw pulling power.',
    primaryMuscles: ['Back', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core', 'Forearms', 'Trapezius'],
    targetMuscles: ['Gluteus Maximus', 'Erector Spinae', 'Hamstrings'],
    equipment: ['Barbell', 'Plates'],
    difficulty: 'ADVANCED',
  },
  'deadlift': {
    exerciseName: 'Barbell Deadlift',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_deadlift.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-ila4NZS.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-ila4NZS.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'DEADLIFT',
    overview: 'The Conventional Barbell Deadlift recruits the entire posterior chain.',
    primaryMuscles: ['Back', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    targetMuscles: ['Gluteus Maximus', 'Erector Spinae'],
    equipment: ['Barbell', 'Plates'],
    difficulty: 'ADVANCED',
  },
  'romanian deadlift': {
    exerciseName: 'Romanian Deadlift',
    mediaType: 'VIDEO',
    videoUrl: '/videos/overhead_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0085-wQ2c4XD.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0085-wQ2c4XD.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'DEADLIFT',
    overview: 'The Romanian Deadlift (RDL) emphasizes eccentric hamstring lengthening and hip hinge mechanics.',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    targetMuscles: ['Biceps Femoris', 'Gluteus Maximus'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'lat pulldown': {
    exerciseName: 'Lat Pulldown',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lat_pulldown.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2330-LEprlgG.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2330-LEprlgG.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PULLUP',
    overview: 'The Cable Lat Pulldown develops latissimus dorsi width, scapular depression, and bicep pulling strength through full range of motion.',
    primaryMuscles: ['Back', 'Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    targetMuscles: ['Latissimus Dorsi', 'Teres Major'],
    equipment: ['Cable Machine', 'Wide Bar'],
    difficulty: 'BEGINNER',
  },
  'cable lat pulldown': {
    exerciseName: 'Cable Lat Pulldown',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lat_pulldown.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2330-LEprlgG.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2330-LEprlgG.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PULLUP',
    overview: 'The Cable Lat Pulldown develops latissimus dorsi width and upper back thickness.',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    targetMuscles: ['Latissimus Dorsi'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },
  'pull up': {
    exerciseName: 'Pull-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/pull_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PULLUP',
    overview: 'The Pull-up is the ultimate bodyweight vertical pull, testing relative strength across the back, core, and arms.',
    primaryMuscles: ['Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Core'],
    targetMuscles: ['Latissimus Dorsi', 'Brachialis'],
    equipment: ['Pull-up Bar'],
    difficulty: 'INTERMEDIATE',
  },
  'pull-up': {
    exerciseName: 'Standard Pull-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/pull_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PULLUP',
    overview: 'The Pull-up is the ultimate bodyweight vertical pull, testing relative strength across the back, core, and arms.',
    primaryMuscles: ['Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Core'],
    targetMuscles: ['Latissimus Dorsi', 'Brachialis'],
    equipment: ['Pull-up Bar'],
    difficulty: 'INTERMEDIATE',
  },
  'standard pull-up': {
    exerciseName: 'Standard Pull-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/pull_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0652-lBDjFxJ.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PULLUP',
    overview: 'The Pull-up is the ultimate bodyweight vertical pull.',
    primaryMuscles: ['Back'],
    secondaryMuscles: ['Biceps'],
    targetMuscles: ['Latissimus Dorsi'],
    equipment: ['Pull-up Bar'],
    difficulty: 'INTERMEDIATE',
  },
  'overhead press': {
    exerciseName: 'Overhead Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_deadlift.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0091-kTbSH9h.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0091-kTbSH9h.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'OVERHEAD_PRESS',
    overview: 'The Overhead Press builds rounded shoulders, powerful triceps lockouts, and exceptional midline anti-extension rigidity.',
    primaryMuscles: ['Shoulders', 'Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    targetMuscles: ['Anterior Deltoid', 'Lateral Deltoid'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'overhead barbell press': {
    exerciseName: 'Overhead Barbell Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/overhead_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1456-wdRZISl.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1456-wdRZISl.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'OVERHEAD_PRESS',
    overview: 'The standing Overhead Barbell Press demands full-body stabilization while driving iron overhead.',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    targetMuscles: ['Deltoids'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'military press': {
    exerciseName: 'Military Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/overhead_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1456-wdRZISl.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/1456-wdRZISl.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'OVERHEAD_PRESS',
    overview: 'The Military Press builds strict pressing strength with heels together or hip-width stance.',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps'],
    targetMuscles: ['Anterior Deltoids'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  'plank': {
    exerciseName: 'Plank',
    mediaType: 'VIDEO',
    videoUrl: '/videos/overhead_press.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0864-x306lCW.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0864-x306lCW.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'CORE',
    overview: 'The Forearm Plank develops deep isometric core stiffness through anti-extension endurance across the rectus abdominis and transverse abdominis.',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    equipment: ['Bodyweight', 'Mat'],
    difficulty: 'BEGINNER',
  },
  'push up': {
    exerciseName: 'Standard Push-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/push_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PUSHUP',
    overview: 'The Standard Push-up is the foundational calisthenics movement for horizontal pressing strength and core coordination.',
    primaryMuscles: ['Chest', 'Pectorals'],
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    targetMuscles: ['Pectoralis Major', 'Triceps Brachii'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  'push-up': {
    exerciseName: 'Standard Push-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/push_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PUSHUP',
    overview: 'The Standard Push-up is the foundational calisthenics movement.',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    targetMuscles: ['Pectoralis Major'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  'standard push-up': {
    exerciseName: 'Standard Push-up',
    mediaType: 'VIDEO',
    videoUrl: '/videos/push_up.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0662-I4hDWkc.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'PUSHUP',
    overview: 'The Standard Push-up delivers clean pectoral activation with zero equipment required.',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps'],
    targetMuscles: ['Pectoralis Major'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  'dips': {
    exerciseName: 'Parallel Bar Dips',
    mediaType: 'VIDEO',
    videoUrl: '/videos/dips.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0251-9WTm7dq.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0251-9WTm7dq.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'DIP',
    overview: 'Parallel Bar Dips serve as an upper-body squat, hammering lower pectorals and tricep extension strength under heavy bodyweight load.',
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Front Deltoids'],
    targetMuscles: ['Triceps Brachii', 'Pectoralis Major'],
    equipment: ['Dip Bars'],
    difficulty: 'INTERMEDIATE',
  },
  'parallel bar dips': {
    exerciseName: 'Parallel Bar Dips',
    mediaType: 'VIDEO',
    videoUrl: '/videos/dips.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0251-9WTm7dq.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0251-9WTm7dq.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'DIP',
    overview: 'Parallel Bar Dips build massive triceps and lower chest definition.',
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Shoulders'],
    targetMuscles: ['Triceps Brachii'],
    equipment: ['Dip Bars'],
    difficulty: 'INTERMEDIATE',
  },
  'barbell bicep curl': {
    exerciseName: 'Barbell Bicep Curl',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_curl.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0031-25GPyDY.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0031-25GPyDY.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'CURL',
    overview: 'The Standing Barbell Curl places maximum overload across the short and long heads of the biceps brachii.',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    targetMuscles: ['Biceps Brachii'],
    equipment: ['Barbell'],
    difficulty: 'BEGINNER',
  },
  'barbell curl': {
    exerciseName: 'Barbell Bicep Curl',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_curl.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0031-25GPyDY.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0031-25GPyDY.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'CURL',
    overview: 'The Standing Barbell Curl isolates and grows the biceps brachii.',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    targetMuscles: ['Biceps Brachii'],
    equipment: ['Barbell'],
    difficulty: 'BEGINNER',
  },
  'cable tricep pushdown': {
    exerciseName: 'Cable Tricep Pushdown',
    mediaType: 'VIDEO',
    videoUrl: '/videos/cable_tricep_pushdown.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0201-3ZflifB.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0201-3ZflifB.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'EXTENSION',
    overview: 'The Cable Tricep Pushdown locks the upper arms in place while isolating the lateral and medial heads of the triceps.',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Forearms'],
    targetMuscles: ['Triceps Brachii'],
    equipment: ['Cable Machine', 'Rope'],
    difficulty: 'BEGINNER',
  },
  'tricep cable pushdown': {
    exerciseName: 'Tricep Cable Pushdown',
    mediaType: 'VIDEO',
    videoUrl: '/videos/cable_tricep_pushdown.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0201-3ZflifB.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0201-3ZflifB.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'EXTENSION',
    overview: 'Cable tricep pushdowns offer constant tension on the triceps throughout the entire stroke.',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    targetMuscles: ['Triceps Brachii'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },
  'leg press': {
    exerciseName: 'Leg Press',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_squat.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2287-V07qpXy.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/2287-V07qpXy.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'SQUAT',
    overview: 'The 45-Degree Leg Press permits intense quadriceps and glute loading while taking sheer spinal axial loading off the lower back.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    targetMuscles: ['Quadriceps', 'Gluteus Maximus'],
    equipment: ['Leg Press Machine'],
    difficulty: 'BEGINNER',
  },
  'walking lunges': {
    exerciseName: 'Walking Dumbbell Lunge',
    mediaType: 'VIDEO',
    videoUrl: '/videos/walking_lunges.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0336-RRWFUcw.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0336-RRWFUcw.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'LUNGE',
    overview: 'Walking Lunges develop unilateral balance, gluteus medius stabilization, and quadriceps endurance.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
    equipment: ['Dumbbells'],
    difficulty: 'INTERMEDIATE',
  },
  'walking dumbbell lunge': {
    exerciseName: 'Walking Dumbbell Lunge',
    mediaType: 'VIDEO',
    videoUrl: '/videos/walking_lunges.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0336-RRWFUcw.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0336-RRWFUcw.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'LUNGE',
    overview: 'Walking Lunges develop unilateral balance, gluteus medius stabilization, and quadriceps endurance.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
    equipment: ['Dumbbells'],
    difficulty: 'INTERMEDIATE',
  },
  'cable chest fly': {
    exerciseName: 'Cable Chest Fly',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lever_pec_deck_fly.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0227-Pr9Rhf4.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0227-Pr9Rhf4.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview: 'The Cable Chest Fly produces peak tension on the sternal pectoralis major during the fully contracted phase.',
    primaryMuscles: ['Chest', 'Pectorals'],
    secondaryMuscles: ['Anterior Deltoids'],
    targetMuscles: ['Pectoralis Major Sternal Head'],
    equipment: ['Cable Machine'],
    difficulty: 'INTERMEDIATE',
  },
  'hammer curl': {
    exerciseName: 'Dumbbell Hammer Curl',
    mediaType: 'VIDEO',
    videoUrl: '/videos/barbell_curl.mp4',
    imageUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0472-I3tsCnC.jpg',
    thumbnailUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0472-I3tsCnC.jpg',
    mediaSource: 'exercisedb',
    movementPattern: 'CURL',
    overview: 'The Neutral Grip Hammer Curl activates the brachialis and brachioradialis for forearm and arm thickness.',
    primaryMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    targetMuscles: ['Brachialis', 'Brachioradialis'],
    equipment: ['Dumbbells'],
    difficulty: 'BEGINNER',
  },

'lever pec deck fly': {
    exerciseName: 'Lever Pec Deck Fly',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lever_pec_deck_fly.mp4',
    imageUrl: 'https://ucarecdn.com/62571454-fff7-4344-8d23-820350d749c8/chest_fly_image.png',
    thumbnailUrl: 'https://ucarecdn.com/62571454-fff7-4344-8d23-820350d749c8/chest_fly_image.png',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview:
      'The Lever Pec Deck Fly is a strength-building exercise targeting the chest muscles, particularly the pectoralis major. It is ideal for individuals at an intermediate fitness level who want to improve their upper body strength and muscle definition. By incorporating this exercise into their routine, users can enhance their overall appearance, boost functional strength, and improve performance in sports and activities requiring strong chest muscles.',
    instructions: [
      'Sit on the pec deck machine with your back firmly against the pad and place your forearms on the padded levers, ensuring elbows and shoulders are aligned.',
      'Push the levers together slowly, focusing on squeezing your chest muscles, until your hands meet in front of your chest.',
      'Hold this position for a second to maximize contraction of the chest muscles.',
      'Slowly return to the starting position, allowing your chest to stretch, and repeat for the desired reps.',
    ],
    tips: [
      'Controlled Movements: Avoid using momentum to lift heavier weights. Focus on slow, controlled reps to properly target the pectorals.',
      'Full Range of Motion: Bring handles together until they touch, then return until chest is fully stretched. Avoid stopping early or overextending.',
      'Proper Breathing: Exhale as you bring the handles together and inhale as you return.',
    ],
    breathing:
      'Exhale forcefully through teeth as you bring the handles together into peak contraction; inhale deeply into belly as you return to the stretch position.',
    commonMistakes: [
      'Letting elbows drop below shoulder line during contraction.',
      'Arching back off the pad during peak squeeze.',
      'Using momentum or bouncing weights at the stretch point.',
    ],
    variations: [
      'Cable Crossover: Uses a cable machine for constant tension on the pectorals.',
      'Resistance Band Chest Fly: Mimics the motion with bands, adding flexibility in workout location and intensity.',
      'Incline Dumbbell Fly: Performed on an incline bench, targeting the upper chest muscles more than the standard fly.',
      'Standing Cable Fly: Done standing with cables, targeting the chest from a different angle.',
    ],
    primaryMuscles: ['Pectoralis Major Clavicular Head', 'Chest'],
    secondaryMuscles: ['Deltoid Anterior', 'Shoulders'],
    targetMuscles: ['Pectoralis Major Clavicular Head', 'Deltoid Anterior'],
    equipment: ['Leverage Machine'],
    difficulty: 'INTERMEDIATE',
    aiCues: [
      'Keep back flat against the pad.',
      'Maintain 90-degree bend at elbows.',
      'Squeeze chest at full contraction.',
    ],
  },
  'pec deck fly': {
    exerciseName: 'Pec Deck Fly',
    mediaType: 'VIDEO',
    videoUrl: '/videos/lever_pec_deck_fly.mp4',
    imageUrl: 'https://ucarecdn.com/62571454-fff7-4344-8d23-820350d749c8/chest_fly_image.png',
    thumbnailUrl: 'https://ucarecdn.com/62571454-fff7-4344-8d23-820350d749c8/chest_fly_image.png',
    mediaSource: 'exercisedb',
    movementPattern: 'BENCH_PRESS',
    overview:
      'The Pec Deck Fly isolates the pectoralis major through a guided lever arc, eliminating stabilizer fatigue and maximizing chest hypertrophy.',
    instructions: [
      'Position seat height so levers align with mid-chest.',
      'Push levers inward with forearms flat against pads.',
      'Hold contraction for 1 second.',
      'Slowly open arms until chest feels a comfortable stretch.',
    ],
    tips: [
      'Focus on bringing inner elbows together rather than just hands.',
      'Keep shoulders depressed and packed down.',
      'Exhale on the squeeze, inhale on the opening stretch.',
    ],
    breathing: 'Exhale during contraction, inhale during extension.',
    commonMistakes: ['Shrugging shoulders upward', 'Bouncing weights at bottom'],
    variations: ['Incline Cable Fly', 'Flat Dumbbell Fly'],
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Anterior Deltoids'],
    targetMuscles: ['Pectoralis Major Clavicular Head', 'Deltoid Anterior'],
    equipment: ['Leverage Machine'],
    difficulty: 'INTERMEDIATE',
    aiCues: ['Retract shoulder blades.', 'Peak contraction squeeze.'],
  },
};

export class NativeVectorMediaProvider implements IExerciseMediaProvider {
  name = 'NativeVectorMediaProvider';

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
  }): ExerciseMedia {
    const pattern = resolveMovementPattern(exercise.name, exercise.primaryMuscle);
    const defaults = DEFAULT_MOVEMENT_DATA[pattern];

    const rawLower = (exercise.name || '').toLowerCase().trim();
    // Normalize: remove parentheticals like (OHP), remove extra punctuation
    const cleanName = rawLower.replace(/\s*\(.*?\)/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Direct or normalized lookup
    let edbSample = EXERCISEDB_SAMPLES[rawLower] || EXERCISEDB_SAMPLES[cleanName];

    // Substring alias fuzzy match if no exact key
    if (!edbSample) {
      for (const [key, sample] of Object.entries(EXERCISEDB_SAMPLES)) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
          edbSample = sample;
          break;
        }
      }
    }

    // Universal 1,324 exercises catalog lookup
    const catalogMedia = resolveCatalogMedia(exercise.name) || (exercise.id ? resolveCatalogMedia(exercise.id) : null);

    // Priority Resolution:
    // 1. If video URL exists (from backend, prop, catalog, or ExerciseDB sample), identify VIDEO
    // 2. If vector/animation exists, use VECTOR / ANIMATION
    // 3. Fallback to Native Vector
    let videoUrl =
      exercise.videoUrl ||
      exercise.mediaUrl ||
      exercise.media?.videoUrl ||
      exercise.media?.url ||
      (exercise.media?.type === 'VIDEO' ? exercise.media.mediaUrl : undefined) ||
      edbSample?.videoUrl ||
      catalogMedia?.videoUrl ||
      undefined;

    let imageUrl =
      exercise.imageUrl ||
      exercise.media?.imageUrl ||
      exercise.media?.thumbnailUrl ||
      exercise.thumbnailUrl ||
      edbSample?.imageUrl ||
      catalogMedia?.imageUrl ||
      undefined;

    let thumbnailUrl =
      exercise.thumbnailUrl ||
      exercise.media?.thumbnailUrl ||
      imageUrl ||
      edbSample?.thumbnailUrl ||
      catalogMedia?.thumbnailUrl ||
      undefined;

    let animationUrl =
      exercise.media?.animationUrl ||
      (exercise.media?.type === 'ANIMATION' ? exercise.media.mediaUrl : undefined) ||
      edbSample?.animationUrl ||
      undefined;

    let mediaType: ExerciseMediaType = 'VECTOR';
    let mediaSource = exercise.media?.source || edbSample?.mediaSource || (catalogMedia ? 'hasaneyldrm/exercises-dataset' : 'NATIVE_VECTOR');

    if (videoUrl) {
      mediaType = videoUrl.endsWith('.gif') ? 'GIF' : 'VIDEO';
    } else if (exercise.media?.isActive) {
      if (exercise.media.type === 'VIDEO' && exercise.media.videoUrl) {
        mediaType = 'VIDEO';
      } else if (exercise.media.type === 'ANIMATION' && exercise.media.animationUrl) {
        mediaType = 'ANIMATION';
      } else if (exercise.media.type === 'GIF' && (exercise.media.animationUrl || exercise.media.mediaUrl)) {
        mediaType = 'GIF';
      }
    }

    const instructions =
      exercise.instructions && exercise.instructions.length > 0
        ? exercise.instructions
        : edbSample?.instructions || defaults.instructions;

    const tips =
      exercise.formTips && exercise.formTips.length > 0
        ? exercise.formTips
        : edbSample?.tips || defaults.tips;

    const breathing = exercise.breathing || edbSample?.breathing || defaults.breathing;

    const commonMistakes =
      exercise.commonMistakes && exercise.commonMistakes.length > 0
        ? exercise.commonMistakes
        : edbSample?.commonMistakes || defaults.commonMistakes;

    const overview = exercise.overview || edbSample?.overview || undefined;
    const variations = exercise.variations || edbSample?.variations || undefined;

    const primaryMuscles =
      edbSample?.primaryMuscles && edbSample.primaryMuscles.length > 0
        ? edbSample.primaryMuscles
        : exercise.primaryMuscle
        ? [exercise.primaryMuscle.replace('_', ' ')]
        : defaults.primaryMuscles;

    const secondaryMuscles =
      exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
        ? exercise.secondaryMuscles.map((m) => m.replace('_', ' '))
        : edbSample?.secondaryMuscles || defaults.secondaryMuscles;

    const targetMuscles = edbSample?.targetMuscles || undefined;
    const equipment = exercise.equipment || edbSample?.equipment || ['Gym Equipment'];

    return {
      exerciseId: exercise.id || exercise.name,
      exerciseName: exercise.name,
      mediaType,
      animationUrl,
      videoUrl,
      thumbnailUrl,
      imageUrl,
      mediaUrl: exercise.mediaUrl || videoUrl || imageUrl || undefined,
      mediaSource,
      movementPattern: edbSample?.movementPattern || pattern,
      overview,
      instructions,
      tips,
      breathing,
      commonMistakes,
      variations,
      primaryMuscles,
      secondaryMuscles,
      targetMuscles,
      equipment,
      difficulty: 'INTERMEDIATE',
      aiCues: edbSample?.aiCues || defaults.aiCues,
    };
  }
}

/**
 * ExerciseMediaManager: Pluggable singleton for exercise media retrieval
 */
class ExerciseMediaManager {
  private provider: IExerciseMediaProvider;
  private cache = new Map<string, ExerciseMedia>();

  constructor() {
    this.provider = new NativeVectorMediaProvider();
  }

  setProvider(provider: IExerciseMediaProvider) {
    this.provider = provider;
    this.cache.clear();
  }

  getMedia(exercise: {
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
  }): ExerciseMedia {
    const key = exercise.id || exercise.name.toLowerCase();
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const resolved = this.provider.resolveMedia(exercise);
    this.cache.set(key, resolved);
    return resolved;
  }
}

export const exerciseMediaManager = new ExerciseMediaManager();
