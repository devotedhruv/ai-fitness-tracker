export type InsightCategory = 'ALL' | 'TIPS' | 'HEALTH' | 'VIDEOS' | 'SCIENCE';

export interface CommunityInsight {
  id: string;
  title: string;
  category: 'TIPS' | 'HEALTH' | 'VIDEOS' | 'SCIENCE';
  categoryName: string;
  badgeColor: string;
  readTime: string;
  summary: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  viewsCount: number;
  likesCount: number;
  isLiked?: boolean;
  videoDuration?: string;
  videoThumbnail?: string;
  keyTakeaways: string[];
  coachingCues: string[];
  commonMistakes: string[];
  content: string;
  // Internet-Grounded and Free Resource Links
  sourceUrl?: string;
  sourceName?: string;
  youtubeId?: string;
  isExternal?: boolean;
  publishedDate?: string;
}

export const COMMUNITY_INSIGHTS: CommunityInsight[] = [
  {
    id: 'insight-1',
    title: 'The Lat Flare & Elbow Tuck Secret for a Pain-Free Bench Press',
    category: 'TIPS',
    categoryName: 'Exercise Tips & Tricks',
    badgeColor: '#B8F500',
    readTime: '3 min read',
    summary: 'Tucking your elbows at a 45-degree angle while flaring your lats shields your rotator cuffs and unlocks explosive pressing power.',
    author: {
      name: 'Greg Nuckols',
      role: 'Stronger By Science Editor & Exercise Physiologist',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Bench Press', 'Chest', 'Shoulder Health', 'Form Cues'],
    viewsCount: 3840,
    likesCount: 412,
    sourceUrl: 'https://www.strongerbyscience.com/bench-press/',
    sourceName: 'Stronger By Science',
    isExternal: true,
    keyTakeaways: [
      'Avoid a 90-degree flare; tuck elbows between 45° and 60° to preserve the subacromial joint space.',
      'Squeeze the barbell as if trying to bend it into a "U" shape to reflexively fire the triceps and lats.',
      'Maintain continuous leg drive by pushing through your midfoot without lifting your glutes off the bench.',
    ],
    coachingCues: [
      '"Bend the bar" — activates external shoulder rotators',
      '"Pull the bar to your lower sternum" — prevents dumping tension into the anterior delts',
      '"Screw your upper back into the pad" — creates an unyielding stable base',
    ],
    commonMistakes: [
      'Bouncing the bar aggressively off the sternum to bypass the sticking point.',
      'Letting wrists cock backward past 45 degrees, which leaks force transfer.',
      'Flattening out the upper back mid-set, releasing scapular retraction.',
    ],
    content: `Mastering the bench press isn't just about raw pectoralis power—it's an engineering problem of stability, bar trajectory, and shoulder mechanics.

When you unrack the bar, contract your latissimus dorsi as if pulling down a heavy lat pulldown. This creates a wide, muscular shelf that stabilizes the humerus. 

As the bar descends, imagine tucking your elbows toward your ribcage at a roughly 45-degree angle rather than allowing them to flare perpendicularly to 90 degrees. This keeps the humeral head centered within the glenoid fossa, drastically reducing impingement stress on the supraspinatus tendon.

At the bottom of the movement, touch the bar lightly at the lower sternum or xiphoid process. Drive your heels down and away into the floor without lifting your glutes off the bench to initiate leg drive. Press the bar back and slightly toward your face in an inverted 'J' curve.`,
  },
  {
    id: 'insight-2',
    title: 'Zone 2 Aerobic Base: Why Every Lifter Needs an Aerobic Engine',
    category: 'HEALTH',
    categoryName: 'Health & Recovery',
    badgeColor: '#10B981',
    readTime: '4 min read',
    summary: 'Building mitochondrial density through low-intensity steady state (Zone 2) cardio dramatically speeds up intra-workout ATP recovery and lowers resting heart rate.',
    author: {
      name: 'Dr. Iñigo San-Millán',
      role: 'Physiologist & Sports Medicine Researcher',
      avatar: 'preset:sports-doc',
    },
    tags: ['Cardio', 'Mitochondria', 'Recovery', 'Zone 2', 'Longevity'],
    viewsCount: 4210,
    likesCount: 529,
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/28834797/',
    sourceName: 'PubMed Central',
    isExternal: true,
    keyTakeaways: [
      'Zone 2 training (60-70% max HR) spurs mitochondrial biogenesis, increasing your capacity to clear lactate between heavy sets.',
      'Lifters with superior aerobic conditioning recover phosphocreatine reserves 35% faster between sets of squats or deadlifts.',
      '2 to 3 sessions of 30-45 minutes per week enhances stroke volume and decreases central nervous system burnout.',
    ],
    coachingCues: [
      '"Pass the nasal breathing test" — if you must breathe through your mouth to speak full sentences, slow down',
      '"Maintain a steady conversational pace" — Zone 2 should feel sustainably rhythmic, not punishing',
    ],
    commonMistakes: [
      'Going too fast and bleeding into Zone 3/4 tempo, which relies on glycolytic energy rather than fat oxidation.',
      'Skipping cardio altogether fearing muscle loss—science shows Zone 2 actually boosts nutrient partitioning to muscle cells.',
    ],
    content: `Many strength athletes treat aerobic conditioning as the enemy of hypertrophy. However, sports physiology demonstrates the exact opposite: your aerobic engine governs how rapidly you can replenish cellular energy between maximal lifting efforts.

Zone 2 corresponds to the exercise intensity where your blood lactate levels remain near baseline (1.5 to 2.0 mmol/L). At this intensity, Type I slow-twitch muscle fibers utilize fatty acids via beta-oxidation to produce ATP inside mitochondria.

By accumulating 90 to 150 minutes of Zone 2 training weekly—whether through easy trail jogging, incline treadmill walking, or cycling—you trigger mitochondrial biogenesis. In subsequent heavy lifting sessions, your body recycles lactate and replenishes adenosine triphosphate (ATP) far more swiftly, allowing you to sustain higher barbell velocity across all work sets.`,
  },
  {
    id: 'insight-3',
    title: 'Strict Pull-Up Mastery: From Dead Hang to Chest-to-Bar',
    category: 'VIDEOS',
    categoryName: 'Video Guides',
    badgeColor: '#F59E0B',
    readTime: '11 min watch',
    videoDuration: '11:24',
    youtubeId: '4AObAU-EcYE',
    videoThumbnail: 'https://img.youtube.com/vi/4AObAU-EcYE/hqdefault.jpg',
    summary: 'A step-by-step masterclass by Jeff Nippard detailing the biomechanics of scapular retraction, hollow-body positioning, and overcoming the transition sticking point.',
    author: {
      name: 'Jeff Nippard',
      role: 'BSc Biochemistry & Natural Pro Bodybuilder',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Pull-Up', 'Calisthenics', 'Back', 'Video Guide', 'Jeff Nippard'],
    viewsCount: 8920,
    likesCount: 1140,
    sourceUrl: 'https://www.youtube.com/watch?v=4AObAU-EcYE',
    sourceName: 'YouTube (Jeff Nippard)',
    isExternal: true,
    keyTakeaways: [
      'Initiate every rep with active scapular depression before bending your elbows.',
      'Maintain a subtle hollow-body dish position (ribs down, toes pointed slightly forward) rather than arching backward.',
      'Pull your elbows down and back into your back pockets, aiming your upper sternum at the bar.',
    ],
    coachingCues: [
      '"Put your shoulder blades in your back pockets" before pulling',
      '"Crush the bar in your palms" to recruit forearm and brachioradialis stabilizers',
      '"Drive elbows down, not back"',
    ],
    commonMistakes: [
      'Kicking legs or kipping to generate momentum, which removes eccentric stimulus from the lats.',
      'Craning the chin over the bar while upper thoracic spine caves into kyphosis.',
      'Cutting the bottom lockout short, missing out on deep stretch hypertrophy.',
    ],
    content: `The strict pull-up is the undisputed crown jewel of upper-body relative strength. To perform it with pristine biomechanics, you must deconstruct the movement into three sequential phases.

Phase 1: The Active Hang. From a dead hang with pronated grip just outside shoulder width, engage the lower trapezius and serratus anterior by depressing your scapulae. Your ears should rise clearly away from your shoulders before your arms flex.

Phase 2: The Concentric Arc. Rather than pulling your nose straight up, visualize pulling your sternum to the bar in an arc. Drive your elbows downward toward your hips. Engage your glutes and core to prevent spinal hyperextension.

Phase 3: Controlled Eccentric. Lower your body under continuous 3-second tension until your elbows reach full 180-degree extension. The deep stretch under load is one of the most potent triggers for latissimus dorsi hypertrophy.`,
  },
  {
    id: 'insight-4',
    title: 'The 48-Hour DOMS Protocol: Recovery Science Demystified',
    category: 'HEALTH',
    categoryName: 'Health & Recovery',
    badgeColor: '#10B981',
    readTime: '5 min read',
    summary: 'Delayed onset muscle soreness (DOMS) is caused by microtrauma to Z-discs and inflammatory cytokine cascades, not lactic acid. Here is the verified protocol to accelerate repair.',
    author: {
      name: 'Mayo Clinic Sports Medicine',
      role: 'Clinical Exercise Science Division',
      avatar: 'preset:sports-doc',
    },
    tags: ['DOMS', 'Recovery', 'Inflammation', 'Nutrition', 'Sleep'],
    viewsCount: 3670,
    likesCount: 445,
    sourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise-recovery/art-20048389',
    sourceName: 'Mayo Clinic',
    isExternal: true,
    keyTakeaways: [
      'DOMS peaks 24 to 48 hours post-exercise due to micro-tears in sarcomere Z-lines and secondary edema.',
      'Active recovery (light walking, mobility, cycling) increases localized capillary blood flow and outperforms complete bed rest.',
      'Prioritizing 7-9 hours of slow-wave sleep is where 95% of human growth hormone (HGH) pulse release occurs for structural repair.',
    ],
    coachingCues: [
      '"Motion is lotion" — light 15-minute blood-flow walks flush metabolic waste far better than sitting on the couch',
      '"Front-load electrolytes and hydration" to maintain cellular osmotic pressure in damaged muscle cells',
    ],
    commonMistakes: [
      'Popping high-dose NSAIDs (ibuprofen) immediately post-workout, which blunts satellite cell signaling and slows long-term adaptation.',
      'Aggressively stretching an acutely sore muscle, which further tears healing microscopic fibers.',
    ],
    content: `Delayed Onset Muscle Soreness (DOMS) has long been misunderstood as lactic acid accumulation. In reality, blood lactate returns to resting levels within 60 minutes after exercise. DOMS is caused by mechanical micro-disruption of sarcomeres, specifically along the Z-lines, during eccentric contractions.

This micro-trauma triggers a local inflammatory response: neutrophils and macrophages infiltrate the tissue, releasing cytokines and prostaglandins that sensitize pain receptors (nociceptors).

The 3-Step Protocol:
1. Low-Intensity Blood Flow: Perform 15-20 minutes of Zone 1 movement (light walking or cycling at under 55% max HR). This increases nutrient delivery to damaged tissue without inducing additional mechanical strain.
2. Sleep Optimization: Deep stage 3 and 4 non-REM sleep is when the pituitary gland releases its largest pulses of growth hormone. Keep your bedroom below 68°F (20°C) and avoid blue light 60 minutes before bed.
3. Micronutrient Support: Adequate sodium, magnesium, and dietary protein (0.8-1.0g per lb of body weight) provide the amino acid building blocks (particularly leucine) needed to initiate muscle protein synthesis via mTOR.`,
  },
  {
    id: 'insight-5',
    title: 'Hypertrophy Mechanics: Rep Ranges (5-30) and Mechanical Tension',
    category: 'SCIENCE',
    categoryName: 'Exercise Science',
    badgeColor: '#B8F500',
    readTime: '6 min read',
    summary: 'Dr. Mike Israetel and peer-reviewed hypertrophy literature confirm that rep ranges from 5 to 30 yield identical muscle growth when sets are taken within 1-3 reps of failure.',
    author: {
      name: 'Dr. Mike Israetel',
      role: 'PhD Sport Physiology & Head Science Consultant at RP',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Hypertrophy', 'Sets & Reps', 'Mechanical Tension', 'RP Strength', 'Science'],
    viewsCount: 5120,
    likesCount: 680,
    sourceUrl: 'https://rpstrength.com/blogs/articles/hypertrophy-training-guide',
    sourceName: 'Renaissance Periodization',
    youtubeId: 'K4E_Z7bS9vU',
    videoThumbnail: 'https://img.youtube.com/vi/K4E_Z7bS9vU/hqdefault.jpg',
    isExternal: true,
    keyTakeaways: [
      'Mechanical tension on individual muscle fibers is the primary driver of muscle hypertrophy.',
      'Any set taken between 5 and 30 reps produces equivalent growth, provided it is executed within 0-3 Reps in Reserve (RIR).',
      'Heavier sets (5-10 reps) deliver high tension with less cardiovascular fatigue; higher reps (15-30) minimize joint wear and tear.',
    ],
    coachingCues: [
      '"Every set must challenge the last 3-4 reps" — this is where motor unit recruitment hits 100%',
      '"Control the negative" — 2-3 second eccentric yields superior mechanical tension per rep',
    ],
    commonMistakes: [
      'Believing only 8-12 reps builds muscle (the outdated "hypertrophy zone" myth).',
      'Stopping sets 5-6 reps away from true failure and expecting maximal adaptive stimulus.',
      'Sacrificing full range of motion just to add another plate to the bar.',
    ],
    content: `For decades, bodybuilding dogma held that 8 to 12 repetitions was the only rep bracket capable of maximizing muscle growth. Landmark meta-analyses by Brad Schoenfeld, Mike Israetel, and colleagues have completely dismantled this assumption.

The Current Scientific Consensus:
Muscular hypertrophy is primarily mediated by mechanical tension: the physical pull experienced by mechanosensors on muscle cell membranes when muscle fibers contract forcefully against resistance.

When a set is taken close to muscular failure (0 to 3 RIR), Henneman's size principle dictates that your central nervous system recruits high-threshold motor units—the fast-twitch fibers with the greatest capacity for growth. Whether you reach this point on rep 6 of a heavy set or rep 22 of a lighter set, the ultimate growth stimulus is virtually identical.

How to Program:
- Multi-joint compounds (Squats, Presses, Rows): 5 to 10 reps to maximize axial loading efficiency without excessive systemic cardiorespiratory distress.
- Isolation and single-joint exercises (Lateral raises, Curls, Leg extensions): 10 to 25 reps to minimize connective tissue strain while accumulating high effective volume.`,
  },
  {
    id: 'insight-6',
    title: 'Ankle Mobility Drill: Unlock Deep Squat Depth Without Knee Pain',
    category: 'TIPS',
    categoryName: 'Exercise Tips & Tricks',
    badgeColor: '#B8F500',
    readTime: '3 min read',
    summary: 'Limited talocrural dorsiflexion is the #1 culprit behind butt wink, heel elevation, and anterior knee pain during squats. Here is the 5-minute banded joint mobilization fix.',
    author: {
      name: 'Dr. Aaron Horschig',
      role: 'DPT, Founder of Squat University',
      avatar: 'preset:sports-doc',
    },
    tags: ['Squat', 'Ankle Mobility', 'Squat University', 'Knee Health', 'Dorsiflexion'],
    viewsCount: 4670,
    likesCount: 588,
    sourceUrl: 'https://squatuniversity.com/2015/11/05/how-to-improve-ankle-mobility/',
    sourceName: 'Squat University',
    youtubeId: 'U5zrloYWwxw',
    videoThumbnail: 'https://img.youtube.com/vi/U5zrloYWwxw/hqdefault.jpg',
    isExternal: true,
    keyTakeaways: [
      'If your knees cannot travel 4+ inches past your toes with heels planted, your ankle mobility is limiting your squat depth.',
      'Using a heavy resistance band placed directly over the talus bone clears anterior joint pinch and restores posterior glide.',
      'Test your mobility before and after with the 5-inch Knee-to-Wall test.',
    ],
    coachingCues: [
      '"Band goes BELOW the malleoli" — place the band over the talus, not up on the tibia/fibula',
      '"Drive the knee over the pinky toe" to prevent medial arch collapse',
    ],
    commonMistakes: [
      'Placing the band too high on the ankle, which pushes the shin backward and worsens impingement.',
      'Allowing the arch of the foot to pronate or collapse inward to cheat range of motion.',
    ],
    content: `When athletes struggle to hit depth in the squat, coaches frequently blame tight hamstrings or weak hip flexors. However, clinical movement screenings reveal that restricted ankle dorsiflexion is the true root cause in over 70% of cases.

The Talocrural Joint Mechanics:
As your body descends into a squat, your shin (tibia) must tilt forward over your foot. For this to happen smoothly, the talus bone must glide backward beneath the tibia and fibula. When the posterior joint capsule is stiff, the talus jams forward, creating an uncomfortable pinch in the front of the ankle.

The Banded Talus Mobilization:
1. Anchor a heavy resistance band low to a sturdy rig or post.
2. Step inside the loop and position the band across the front of your ankle, just below the two bony ankle bumps (lateral and medial malleoli).
3. Place your foot on an elevated box or step forward into a half-kneeling lunge so the band pulls backward with strong tension.
4. Slowly drive your knee forward directly over your second and third toes for 20 gentle oscillations per side.

Re-test your squat immediately: you will notice deeper hip depth, a more upright torso, and complete relief from anterior knee shear.`,
  },
  {
    id: 'insight-7',
    title: 'Deadlift Setup: Hip Hinge vs. Squatting the Bar',
    category: 'VIDEOS',
    categoryName: 'Video Guides',
    badgeColor: '#F59E0B',
    readTime: '13 min watch',
    videoDuration: '13:42',
    youtubeId: 'r4MzxtBKyNE',
    videoThumbnail: 'https://img.youtube.com/vi/r4MzxtBKyNE/hqdefault.jpg',
    summary: 'Athlean-X masterclass breaking down why dropping your hips too low turns your conventional deadlift into a weak squat and kicks the barbell forward.',
    author: {
      name: 'Jeff Cavaliere',
      role: 'MSPT, CSCS, Founder of Athlean-X',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Deadlift', 'Hip Hinge', 'Athlean-X', 'Biomechanics', 'Back Health'],
    viewsCount: 7850,
    likesCount: 980,
    sourceUrl: 'https://www.youtube.com/watch?v=r4MzxtBKyNE',
    sourceName: 'YouTube (Athlean-X)',
    isExternal: true,
    keyTakeaways: [
      'The deadlift is a pure hip hinge, not a squat with the bar in front of you.',
      'Your hips should rest at the halfway midpoint between your knees and shoulders.',
      'Pull the slack out of the barbell until you hear the audible "clack" against the plates before pulling.',
    ],
    coachingCues: [
      '"Push the floor away with your feet" rather than thinking about lifting the weight with your lower back',
      '"Wedge your hips into the bar" — creates maximum hamstring and glute pre-tension',
      '"Protect your armpits" — activates the lats and locks the bar against your shins',
    ],
    commonMistakes: [
      'Dropping hips to parallel like a squat, which rolls the barbell forward and forces the lumbar spine to round.',
      'Yanking violently off the floor without pulling out the bar slack first.',
      'Hyper-extending the lower back at the top lockout instead of squeezing the glutes.',
    ],
    content: `One of the most persistent errors in gym performance is treating the conventional deadlift as a squat. When you drop your hips too low, your shins are forced forward, knocking the barbell away from your center of gravity.

The 5-Step Barbell Deadlift Protocol:
1. Stance: Stand with feet hip-width apart. The barbell must bisect your entire foot (roughly 1 inch away from your shins).
2. Grip: Without moving the bar, hinge forward at your hips and grip the knurling just outside your legs.
3. Shins to Bar: Bring your shins forward until they make gentle contact with the barbell. Do NOT roll the bar forward.
4. Chest Up & Squeeze Slack: Pull your chest high while pulling up on the bar just enough to hear the metallic click of the barbell against the weight plates. Squeeze your armpits tight as if hiding orange slices.
5. The Drive: Do not think about pulling the bar with your hands. Instead, visualize pushing the world away through the soles of your feet. Drive your hips through as the bar passes your kneecaps.`,
  },
  {
    id: 'insight-8',
    title: 'Protein Timing & The Anabolic Window: Science vs. Fiction',
    category: 'HEALTH',
    categoryName: 'Health & Recovery',
    badgeColor: '#10B981',
    readTime: '4 min read',
    summary: 'A comprehensive review of the 30-minute post-workout "anabolic window". The latest meta-analyses confirm total daily protein intake and leucine thresholds matter far more than rushing for a shake.',
    author: {
      name: 'Dr. Brad Schoenfeld',
      role: 'PhD, CSCS, Global Expert on Hypertrophy & Sports Nutrition',
      avatar: 'preset:sports-doc',
    },
    tags: ['Nutrition', 'Protein', 'Anabolic Window', 'BarBend', 'Muscle Growth'],
    viewsCount: 3950,
    likesCount: 512,
    sourceUrl: 'https://barbend.com/protein-timing/',
    sourceName: 'BarBend & JISSN',
    isExternal: true,
    keyTakeaways: [
      'The post-workout anabolic window is closer to 4-6 hours wide, not an urgent 30-minute countdown.',
      'Hitting 1.6 to 2.2 grams of protein per kilogram of bodyweight daily accounts for over 90% of total hypertrophic response.',
      'Consuming 3 to 4 evenly spaced meals with at least 2.5g of leucine triggers maximal muscle protein synthesis (MPS) multiple times per day.',
    ],
    coachingCues: [
      '"Distribute protein across 3-5 meals" — each meal providing 25-40g high-quality protein',
      '"Focus on total 24-hour intake first" before worrying about minute-by-minute nutrient timing',
    ],
    commonMistakes: [
      'Stressing over chugging a protein shake in the locker room while neglecting total daily caloric and protein targets.',
      'Consuming all daily protein in a single massive sitting (which spikes amino acid oxidation rather than continuous protein synthesis).',
    ],
    content: `For decades, fitness lore claimed that if you did not consume 30 grams of whey protein within 30 minutes of your final set, your workout was essentially wasted. Research by Aragon and Schoenfeld (JISSN) proves that the anabolic window is far more forgiving.

What Actually Happens Post-Workout:
Resistance exercise sensitizes muscle tissue to amino acids for at least 24 to 48 hours following a session. Muscle Protein Synthesis (MPS) remains elevated for up to 36 hours.

The Leucine Trigger:
To trigger the mTOR pathway responsible for muscle remodeling, each meal needs to reach the "leucine threshold"—typically 2.5 to 3.0 grams of the essential amino acid leucine (found in roughly 25-35g of whey, chicken, eggs, beef, or fortified plant protein).

Optimal Practical Strategy:
1. Total Intake: Aim for 0.7 to 1.0 grams of protein per pound of bodyweight (1.6 to 2.2 g/kg).
2. Spacing: Consume 3 to 4 meals separated by 3 to 5 hours, each with 25-40g of protein.
3. Pre/Post-Workout: Ensuring a meal containing protein and carbohydrates within 2-3 hours before your session and 1-2 hours after is more than sufficient to maximize anabolism.`,
  },
  {
    id: 'insight-9',
    title: 'Bulletproof Knees & VMO: The ATG Poliquin Step-Up Guide',
    category: 'TIPS',
    categoryName: 'Exercise Tips & Tricks',
    badgeColor: '#B8F500',
    readTime: '4 min read',
    summary: 'Developed by Charles Poliquin and popularized by Ben Patrick (Knees Over Toes Guy), this exercise isolates the vastus medialis oblique (VMO) and patellar tendon for pain-free knees.',
    author: {
      name: 'Ben Patrick (Knees Over Toes Guy)',
      role: 'Founder of Athletic Truth Group (ATG)',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Knee Health', 'ATG', 'VMO', 'Poliquin Step-Up', 'Mobility'],
    viewsCount: 6240,
    likesCount: 840,
    sourceUrl: 'https://www.youtube.com/watch?v=b4Wq0rP1Y98',
    sourceName: 'ATG / Knees Over Toes Guy',
    youtubeId: 'b4Wq0rP1Y98',
    videoThumbnail: 'https://img.youtube.com/vi/b4Wq0rP1Y98/hqdefault.jpg',
    isExternal: true,
    keyTakeaways: [
      'Elevating the heel places direct, isolated mechanical tension on the VMO teardrop muscle.',
      'Strengthening through full knee flexion creates structural resilience in the patellar and quadriceps tendons.',
      'Start flat or with a 2-4 inch block and progress to elevated slant boards before adding external load.',
    ],
    coachingCues: [
      '"Touch your heel lightly" — do not bounce or push off with the trail leg',
      '"Knee tracks directly over your toes" with zero pain',
    ],
    commonMistakes: [
      'Pushing off the floor with the back leg, stealing work from the working quadriceps.',
      'Allowing the knee to collapse inward into valgus deviation.',
    ],
    content: `For decades, athletes were warned "never let your knees travel over your toes." This myth left countless lifters and runners with underdeveloped connective tissue and chronic patellar tendinitis.

The Poliquin step-up, popularized by Ben Patrick (ATG), directly builds the vastus medialis oblique (VMO)—the teardrop muscle on the inside of the knee responsible for stabilizing the patella during locomotion and deceleration.

Execution:
1. Elevate your heel on a slant board or 25lb plate atop a 4-6 inch box.
2. Slowly bend the working knee, allowing it to travel forward past your toes until the opposite heel gently touches the floor.
3. Without bouncing or pushing off the bottom foot, contract the quad to drive back to the start position.
4. Perform 3 sets of 15-20 controlled reps per leg as a warmup or knee bulletproofing finisher.`,
  },
  {
    id: 'insight-10',
    title: 'Creatine Monohydrate: The Definitive Science & Evidence Guide',
    category: 'SCIENCE',
    categoryName: 'Exercise Science',
    badgeColor: '#38BDF8',
    readTime: '5 min read',
    summary: 'With over 500 peer-reviewed trials, creatine is the most rigorously verified sports supplement in human history. Here is how it optimizes phosphocreatine resynthesis and cellular hydration.',
    author: {
      name: 'Examine.com Research Team',
      role: 'Independent Nutrition Evidence Database',
      avatar: 'preset:sports-doc',
    },
    tags: ['Creatine', 'Supplements', 'Strength', 'ATP', 'Examine.com'],
    viewsCount: 5410,
    likesCount: 730,
    sourceUrl: 'https://examine.com/supplements/creatine/',
    sourceName: 'Examine.com',
    isExternal: true,
    keyTakeaways: [
      'Increases intramuscular phosphocreatine (PCr) stores by 15-25%, boosting high-intensity work capacity by 5-15%.',
      'Draws water into muscle cells (cellular swelling), creating an anabolic osmotic signal that upregulates muscle protein synthesis.',
      'A daily dose of 3-5 grams of standard creatine monohydrate saturates muscle cells within 3-4 weeks without requiring a loading phase.',
    ],
    coachingCues: [
      '"Consistency beats timing" — take 5g daily at any time that fits your schedule',
      '"Drink ample water" — creatine draws intracellular water into the muscle belly',
    ],
    commonMistakes: [
      'Wasting money on expensive designer forms (buffered, ethyl ester, liquid); plain monohydrate remains the gold standard in all trials.',
      'Stopping creatine due to water weight—intracellular water inside muscle fibers actually increases strength and lean mass appearance.',
    ],
    content: `Creatine monohydrate is often subject to persistent misconceptions. The scientific reality established across hundreds of clinical trials is clear: creatine is safe, inexpensive, and extraordinarily effective.

How It Works:
Your muscles use adenosine triphosphate (ATP) for explosive contractions. During a heavy set of squats or sprints, ATP loses a phosphate molecule and becomes ADP. Phosphocreatine (PCr) donates its phosphate group to rapidly regenerate ADP back into ATP via creatine kinase.

By saturating your muscle cells with supplemental creatine, you extend your ability to sustain near-maximal power output for several seconds longer, turning what would have been a 4-rep set into a 6-rep set.

Dosage:
Take 3 to 5 grams of pure creatine monohydrate daily. A 20g/day loading phase for 5 days saturates stores faster, but 5g/day achieves the exact same saturation level by week 4 without digestive discomfort.`,
  },
  {
    id: 'insight-11',
    title: 'VO2 Max Optimization: The Norwegian 4x4 Interval Protocol',
    category: 'HEALTH',
    categoryName: 'Health & Recovery',
    badgeColor: '#EC4899',
    readTime: '5 min read',
    summary: 'The clinically tested 4x4 interval protocol developed at the Norwegian University of Science and Technology produces the highest recorded gains in VO2 max and left ventricular heart remodeling.',
    author: {
      name: 'Medicine & Science in Sports',
      role: 'Cardiorespiratory Physiology Research Team',
      avatar: 'preset:sports-doc',
    },
    tags: ['Cardio', 'VO2 Max', 'Norwegian 4x4', 'Heart Health', 'Endurance'],
    viewsCount: 4890,
    likesCount: 615,
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/17414804/',
    sourceName: 'Med Sci Sports Exerc',
    isExternal: true,
    keyTakeaways: [
      'VO2 max is the single strongest clinical biomarker for all-cause mortality and cardiorespiratory fitness.',
      'The 4x4 protocol (4 intervals of 4 minutes at 85-95% max HR with 3-minute active recoveries) yields superior stroke volume gains compared to moderate continuous training.',
      'Performing this protocol just once every 7 to 10 days significantly increases capillary density and running economy.',
    ],
    coachingCues: [
      '"Build up during the first 60 seconds of each interval" to reach 90% max HR smoothly',
      '"Active recovery means keep moving" — jog or walk slowly, do not sit down completely',
    ],
    commonMistakes: [
      'Starting interval 1 at an all-out sprint and dying after 90 seconds. Pace yourself to maintain power across all 4 minutes.',
      'Skipping the 10-minute warm-up before hitting 90% max heart rate.',
    ],
    content: `Cardiorespiratory fitness, as measured by VO2 max (maximum milliliters of oxygen consumed per kilogram of body mass per minute), has been identified by epidemiology studies as one of the most powerful predictors of human longevity and athletic endurance.

The Norwegian 4x4 Method:
Researched extensively by Dr. Ulrik Wisløff and his team at NTNU, the 4x4 interval protocol maximizes the amount of time your cardiovascular system spends at 85% to 95% of its peak heart rate.

The Workout:
1. Warmup: 10 minutes at easy conversational pace.
2. Interval 1: 4 minutes of running, rowing, or cycling at 85-95% max HR (rate of perceived exertion 8.5/10).
3. Active Recovery: 3 minutes of easy walking or light jogging at 60-70% max HR.
4. Repeat for a total of 4 work intervals.
5. Cooldown: 5 minutes of easy recovery walking.

Studies demonstrate a 0.5% to 1.5% increase in VO2 max per week when executed regularly, dramatically increasing cardiovascular output for runners and lifters alike.`,
  },
  {
    id: 'insight-12',
    title: 'Rotator Cuff & Posture: The Ultimate Face Pull Masterclass',
    category: 'VIDEOS',
    categoryName: 'Video Guides',
    badgeColor: '#F59E0B',
    readTime: '9 min watch',
    videoDuration: '9:15',
    youtubeId: 'rep-qVOkqgk',
    videoThumbnail: 'https://img.youtube.com/vi/rep-qVOkqgk/hqdefault.jpg',
    summary: 'Stop doing face pulls wrong. Athlean-X demonstrates the exact dual-rope grip and external rotation mechanics needed to bulletproof the infraspinatus and lower traps.',
    author: {
      name: 'Jeff Cavaliere',
      role: 'MSPT, CSCS, Head Physical Therapist',
      avatar: 'preset:coach-marcus',
    },
    tags: ['Face Pull', 'Shoulder Health', 'Posture', 'Athlean-X', 'Rotator Cuff'],
    viewsCount: 9400,
    likesCount: 1350,
    sourceUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    sourceName: 'YouTube (Athlean-X)',
    isExternal: true,
    keyTakeaways: [
      'The face pull is primarily an external rotation movement for the rotator cuff, not a horizontal rear-delt row.',
      'Use two triceps ropes attached to the cable to achieve full rotational clearance without hitting your forehead.',
      'Your hands must finish BEHIND your elbows at the peak of the contraction.',
    ],
    coachingCues: [
      '"Thumbs pointing backward" at peak contraction',
      '"Win the race with your hands" — hands must beat elbows to the back position',
      '"Squeeze the lower shoulder blades together and down"',
    ],
    commonMistakes: [
      'Loading the stack with heavy weight and violently thrusting with the lower back.',
      'Pulling elbows higher and further back than hands, creating internal shoulder impingement.',
      'Craning the neck forward to reach for the cable attachment.',
    ],
    content: `The face pull is arguably the most valuable corrective exercise in strength training. Modern life (sitting, texting, typing) combined with heavy bench pressing and push-ups drives the glenohumeral joint into chronic internal rotation.

Why Most Lifters Do It Wrong:
If you grab a single rope with thumbs down and pull your elbows straight back, your hands stay in front of your elbows. This reinforces the exact internal rotation you are trying to fix!

The Correct Dual-Rope Setup:
1. Clip two ropes to the cable carabiner so you have long tails.
2. Grip with thumbs pointed up toward the ceiling.
3. Step back, set a staggered stance, and pull the center toward your bridge of the nose.
4. Crucially: simultaneously externally rotate your shoulders so your hands finish back behind your ears, thumbs pointing directly behind you.
5. Hold the contraction for 2 full seconds, feeling the deep burn in your external rotators (infraspinatus, teres minor) and lower trapezius.`,
  },
];
