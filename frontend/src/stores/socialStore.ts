import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAppStorage } from '../services/storage/appStorage';

export type PostType =
  | 'WORKOUT'
  | 'PERSONAL_RECORD'
  | 'PROGRESS'
  | 'ACHIEVEMENT'
  | 'TRAINING'
  | 'CHALLENGE'
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'RUN'
  | 'STREAK'
  | 'RANK_PROMOTION'
  | 'MILESTONE';

export type PostVisibility = 'EVERYONE' | 'FOLLOWERS' | 'ONLY_ME';

export interface ExerciseSetDetail {
  setNumber: number;
  weightKg: number;
  reps: number;
  isPR?: boolean;
}

export interface ExerciseBreakdownItem {
  exerciseName: string;
  category: string;
  sets: ExerciseSetDetail[];
  topWeightKg: number;
  totalVolumeKg: number;
}

export interface WorkoutPostMetadata {
  workoutName: string;
  durationMinutes: number;
  exercisesCount: number;
  setsCount: number;
  totalVolumeKg: number;
  caloriesBurned?: number;
  prsCount: number;
  streakDays: number;
  exercises: ExerciseBreakdownItem[];
}

export interface PRPostMetadata {
  exerciseName: string;
  currentWeightKg: number;
  currentReps: number;
  previousWeightKg: number;
  previousReps: number;
  percentGain: number;
  estimated1RM: number;
}

export interface ProgressPostMetadata {
  measurementDate: string;
  bodyWeightKg?: number;
  previousWeightKg?: number;
  bodyFatPercent?: number;
  strengthSummary?: string;
  hideWeight?: boolean;
  hideMeasurements?: boolean;
}

export interface AchievementPostMetadata {
  achievementTitle: string;
  achievementBadgeName: string;
  disciplineCategory: 'TAPAS' | 'BALA' | 'VIRYA' | 'SADHANA' | 'VAJRA';
  milestoneValue: string;
  rankName: string;
  rankInsignia: string;
}

export interface ChallengePostMetadata {
  challengeId: string;
  challengeTitle: string;
  completionPercent: number;
  currentRank: number;
  totalParticipants: number;
  unit: string;
  currentAmount: number;
  targetAmount: number;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
}

export interface ThreadedComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRankName?: string;
  text: string;
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
  isMine: boolean;
  replies: CommentReply[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar?: string;
  userRankName: string;
  userRankInsignia: string;
  userRankTier: number;
  isVerified?: boolean;
  userTotalXP?: number;
  xpEarned?: number;
  postType: PostType;
  caption: string;
  visibility?: PostVisibility;
  mediaUrl?: string;
  mediaType?: 'NONE' | 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  isLikedByMe: boolean;
  isSavedByMe?: boolean;
  isMine: boolean;
  likedByUsers?: Array<{ id: string; name: string; username: string; avatar: string }>;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  metadata?: any;
  // Metadata for specific post types
  workoutData?: WorkoutPostMetadata;
  prData?: PRPostMetadata;
  progressData?: ProgressPostMetadata;
  achievementData?: AchievementPostMetadata;
  challengeData?: ChallengePostMetadata;
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  userRankInsignia: string;
  storyType: 'WORKOUT' | 'PR' | 'STREAK' | 'ACHIEVEMENT' | 'CHALLENGE' | 'TRANSFORMATION';
  title: string;
  subtitle: string;
  highlightMetric: string;
  mediaUrl?: string;
  hasUnseen: boolean;
  createdAt: string;
  durationSeconds: number;
}

export interface UserSocialProfile {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  fitnessGoal?: string;
  joinedDate?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  followersCount: number;
  followingCount: number;
  workoutsCount: number;
  streakDays: number;
  achievementsCount: number;
  disciplineTitle?: string; // e.g., 'Sadhana Master', 'Vajra Warrior'
  rank: {
    name: string;
    insigniaType?: string;
    insignia?: string;
    tier: number;
    tierName?: string;
    level?: number;
    totalXP?: number;
  };
  followStatus?: 'NOT_FOLLOWING' | 'FOLLOWING' | 'REQUESTED';
  isFollowing?: boolean;
  isFollowRequested?: boolean;
  stats?: {
    streakDays: number;
    workoutsCompleted: number;
    personalRecordsCount: number;
    totalVolumeKg: number;
  };
  mutualFollowersCount?: number;
  recentWorkoutName?: string;
}

export interface SocialNotification {
  id: string;
  type:
    | 'FOLLOW'
    | 'FOLLOW_REQUEST'
    | 'LIKE_POST'
    | 'COMMENT_POST'
    | 'REPLY_COMMENT'
    | 'SHARE_POST'
    | 'CHALLENGE_JOIN'
    | 'CHALLENGE_INVITE'
    | 'STREAK_MILESTONE'
    | 'LIKE'
    | 'COMMENT'
    | 'SYSTEM';
  sender: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  message: string;
  text?: string;
  targetId?: string;
  createdAt: string;
  isRead: boolean;
  requestStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: 'SQUAT' | 'PUSHUP' | 'RUNNING' | 'STEPS' | 'CONSISTENCY';
  targetAmount: number;
  currentAmount: number;
  unit: string;
  participantsCount: number;
  userRank: number;
  isJoined: boolean;
  badgeReward: string;
  badgeName?: string;
  daysRemaining: number;
}

export interface SavedItem {
  id: string;
  type?: 'POST' | 'WORKOUT' | 'EXERCISE' | 'CHALLENGE';
  category?: 'ALL' | 'WORKOUTS' | 'POSTS' | 'EXERCISES' | 'CHALLENGES';
  title: string;
  subtitle?: string;
  savedAt: string;
  postReference?: CommunityPost;
  workoutReference?: WorkoutPostMetadata;
  metadata?: any;
}

// -------------------------------------------------------------
// INITIAL SEED DATA (Inspiring athletic BALYRA community)
// -------------------------------------------------------------
const INITIAL_USERS: Record<string, UserSocialProfile> = {
  'user-alex': {
    id: 'user-alex',
    displayName: 'Alex Chen',
    username: 'alexvanguard',
    avatar: 'preset:coach-marcus',
    bio: 'Strength athlete & calisthenics devotee. Grounded in daily Sadhana. Building unbreakable joints and barbell power.',
    location: 'Kathmandu / Vancouver',
    fitnessGoal: 'Hypertrophy & Ring Muscle-Up',
    joinedDate: 'March 2024',
    isVerified: true,
    isPrivate: false,
    followersCount: 342,
    followingCount: 184,
    workoutsCount: 156,
    streakDays: 42,
    achievementsCount: 18,
    disciplineTitle: 'Vajra Warrior',
    rank: { name: 'SPARTAN VANGUARD', insigniaType: 'double-chevron', tier: 4 },
    followStatus: 'FOLLOWING',
    mutualFollowersCount: 6,
    recentWorkoutName: 'Heavy Chest & Delts',
  },
  'user-marcus': {
    id: 'user-marcus',
    displayName: 'Marcus Stone',
    username: 'marcusiron',
    avatar: 'preset:coach-marcus',
    bio: 'Competitive powerlifter & S&C coach. 800kg raw total in training. Relentless Tapas (Discipline).',
    location: 'Denver, CO',
    fitnessGoal: '250kg Deadlift & 180kg Squat',
    joinedDate: 'January 2024',
    isVerified: true,
    isPrivate: false,
    followersCount: 1240,
    followingCount: 210,
    workoutsCount: 312,
    streakDays: 85,
    achievementsCount: 29,
    disciplineTitle: 'Bala Master',
    rank: { name: 'IRON WARRIOR', insigniaType: 'single-bar', tier: 7 },
    followStatus: 'NOT_FOLLOWING',
    mutualFollowersCount: 12,
    recentWorkoutName: 'Heavy Posterior Chain Pull',
  },
  'user-elena': {
    id: 'user-elena',
    displayName: 'Elena Rostova',
    username: 'elenarun',
    avatar: 'preset:sports-doc',
    bio: 'Ultra-trail runner & hybrid endurance athlete. 50K finisher. Movement is life (Gati).',
    location: 'Pokhara / Zurich',
    fitnessGoal: 'Sub 3-Hour Marathon',
    joinedDate: 'February 2024',
    isVerified: true,
    isPrivate: false,
    followersCount: 890,
    followingCount: 340,
    workoutsCount: 245,
    streakDays: 60,
    achievementsCount: 22,
    disciplineTitle: 'Gati Specialist',
    rank: { name: 'CRIMSON WARLORD', insigniaType: 'triple-rocker', tier: 6 },
    followStatus: 'FOLLOWING',
    mutualFollowersCount: 9,
    recentWorkoutName: '15K Mountain Tempo Run',
  },
  'user-sarah': {
    id: 'user-sarah',
    displayName: 'Sarah Sharma',
    username: 'sarahfit',
    avatar: 'preset:sports-doc',
    bio: 'Mobility coach & Olympic weightlifter. Snatch & clean technique fanatic. Cultivating Virya (Valor).',
    location: 'Lalitpur, Nepal',
    fitnessGoal: 'Bodyweight Snatch & ATG Squat',
    joinedDate: 'April 2024',
    isVerified: false,
    isPrivate: true,
    followersCount: 215,
    followingCount: 120,
    workoutsCount: 98,
    streakDays: 28,
    achievementsCount: 14,
    disciplineTitle: 'Virya Champion',
    rank: { name: 'BRONZE BERSERKER', insigniaType: 'single-chevron', tier: 2 },
    followStatus: 'REQUESTED',
    mutualFollowersCount: 4,
    recentWorkoutName: 'Overhead Squat & Snatch Balance',
  },
  'user-vikram': {
    id: 'user-vikram',
    displayName: 'Vikram Thapa',
    username: 'vikramstrength',
    avatar: 'preset:coach-marcus',
    bio: 'Military calisthenics & weighted dips practitioner. 1,000 pushups a week lifestyle.',
    location: 'Dharan, Nepal',
    fitnessGoal: 'Weighted Dip +50kg × 5',
    joinedDate: 'May 2024',
    isVerified: false,
    isPrivate: false,
    followersCount: 180,
    followingCount: 95,
    workoutsCount: 82,
    streakDays: 34,
    achievementsCount: 11,
    disciplineTitle: 'Tapas Initiate',
    rank: { name: 'STEEL GLADIATOR', insigniaType: 'star-cluster', tier: 3 },
    followStatus: 'NOT_FOLLOWING',
    mutualFollowersCount: 2,
    recentWorkoutName: 'Strict Dips & Weighted Pull-Ups',
  },
};

const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-alex',
    userId: 'user-alex',
    userName: 'Alex Chen',
    userUsername: 'alexvanguard',
    userAvatar: 'preset:coach-marcus',
    userRankInsignia: 'double-chevron',
    storyType: 'PR',
    title: 'New Bench Press PR!',
    subtitle: '115 kg × 3 reps (Clean Lockout)',
    highlightMetric: '115 KG',
    hasUnseen: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    durationSeconds: 5,
  },
  {
    id: 'story-marcus',
    userId: 'user-marcus',
    userName: 'Marcus Stone',
    userUsername: 'marcusiron',
    userAvatar: 'preset:coach-marcus',
    userRankInsignia: 'single-bar',
    storyType: 'WORKOUT',
    title: 'Heavy Deadlift Grind',
    subtitle: '220 kg working sets • 12,400 kg Total Volume',
    highlightMetric: '12.4 TONS',
    hasUnseen: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    durationSeconds: 5,
  },
  {
    id: 'story-elena',
    userId: 'user-elena',
    userName: 'Elena Rostova',
    userUsername: 'elenarun',
    userAvatar: 'preset:sports-doc',
    userRankInsignia: 'triple-rocker',
    storyType: 'STREAK',
    title: '60 Days Unbroken!',
    subtitle: 'Daily morning trail run consistency',
    highlightMetric: '60 DAYS',
    hasUnseen: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    durationSeconds: 5,
  },
  {
    id: 'story-sarah',
    userId: 'user-sarah',
    userName: 'Sarah Sharma',
    userUsername: 'sarahfit',
    userAvatar: 'preset:sports-doc',
    userRankInsignia: 'single-chevron',
    storyType: 'CHALLENGE',
    title: 'Squat Challenge Milestone',
    subtitle: '2,100 / 3,000 Squats logged! 70% complete',
    highlightMetric: '70% DONE',
    hasUnseen: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    durationSeconds: 5,
  },
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'user-alex',
    userName: 'Alex Chen',
    userUsername: 'alexvanguard',
    userAvatar: 'preset:coach-marcus',
    userRankName: 'SPARTAN VANGUARD',
    userRankInsignia: 'double-chevron',
    userRankTier: 4,
    isVerified: true,
    postType: 'WORKOUT',
    caption: '⚔️ Upper Body Hypertrophy dialed in today. 8,450 kg total tonnage moved with precision camera tempo checks. Consistency is the true Sadhana.',
    visibility: 'EVERYONE',
    likesCount: 54,
    commentsCount: 16,
    sharesCount: 7,
    isLikedByMe: false,
    isSavedByMe: false,
    isMine: false,
    likedByUsers: [
      { id: 'user-marcus', name: 'Marcus Stone', username: 'marcusiron', avatar: 'preset:coach-marcus' },
      { id: 'user-elena', name: 'Elena Rostova', username: 'elenarun', avatar: 'preset:sports-doc' },
      { id: 'user-vikram', name: 'Vikram Thapa', username: 'vikramstrength', avatar: 'preset:coach-marcus' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    workoutData: {
      workoutName: 'Chest & Delts Hypertrophy',
      durationMinutes: 54,
      exercisesCount: 6,
      setsCount: 20,
      totalVolumeKg: 8450,
      caloriesBurned: 480,
      prsCount: 1,
      streakDays: 42,
      exercises: [
        {
          exerciseName: 'Barbell Bench Press',
          category: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 80, reps: 10 },
            { setNumber: 2, weightKg: 95, reps: 8 },
            { setNumber: 3, weightKg: 105, reps: 6 },
            { setNumber: 4, weightKg: 115, reps: 3, isPR: true },
          ],
          topWeightKg: 115,
          totalVolumeKg: 2545,
        },
        {
          exerciseName: 'Incline Dumbbell Press',
          category: 'Chest',
          sets: [
            { setNumber: 1, weightKg: 32, reps: 10 },
            { setNumber: 2, weightKg: 36, reps: 8 },
            { setNumber: 3, weightKg: 36, reps: 8 },
          ],
          topWeightKg: 36,
          totalVolumeKg: 896,
        },
        {
          exerciseName: 'Standing Overhead Press',
          category: 'Shoulders',
          sets: [
            { setNumber: 1, weightKg: 50, reps: 10 },
            { setNumber: 2, weightKg: 60, reps: 7 },
            { setNumber: 3, weightKg: 65, reps: 5 },
          ],
          topWeightKg: 65,
          totalVolumeKg: 1245,
        },
        {
          exerciseName: 'Cable Lateral Raise',
          category: 'Shoulders',
          sets: [
            { setNumber: 1, weightKg: 12, reps: 15 },
            { setNumber: 2, weightKg: 15, reps: 12 },
            { setNumber: 3, weightKg: 15, reps: 12 },
          ],
          topWeightKg: 15,
          totalVolumeKg: 540,
        },
      ],
    },
  },
  {
    id: 'post-2',
    userId: 'user-marcus',
    userName: 'Marcus Stone',
    userUsername: 'marcusiron',
    userAvatar: 'preset:coach-marcus',
    userRankName: 'IRON WARRIOR',
    userRankInsignia: 'single-bar',
    userRankTier: 7,
    isVerified: true,
    postType: 'PERSONAL_RECORD',
    caption: '⚡ NEW DEADLIFT PR! 180 kg × 5 clean reps. Hook grip locked in, zero spinal flexion. Pushing past limits every single week.',
    visibility: 'EVERYONE',
    likesCount: 98,
    commentsCount: 24,
    sharesCount: 12,
    isLikedByMe: true,
    isSavedByMe: false,
    isMine: false,
    likedByUsers: [
      { id: 'user-alex', name: 'Alex Chen', username: 'alexvanguard', avatar: 'preset:coach-marcus' },
      { id: 'user-sarah', name: 'Sarah Sharma', username: 'sarahfit', avatar: 'preset:sports-doc' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    prData: {
      exerciseName: 'Barbell Conventional Deadlift',
      currentWeightKg: 180,
      currentReps: 5,
      previousWeightKg: 165,
      previousReps: 5,
      percentGain: 9.1,
      estimated1RM: 202,
    },
  },
  {
    id: 'post-3',
    userId: 'user-sarah',
    userName: 'Sarah Sharma',
    userUsername: 'sarahfit',
    userAvatar: 'preset:sports-doc',
    userRankName: 'BRONZE BERSERKER',
    userRankInsignia: 'single-chevron',
    userRankTier: 2,
    postType: 'CHALLENGE',
    caption: '🔥 30-Day Squat Challenge update! Just crossed 2,100 squats. Currently sitting at Rank #3 on the community leaderboard. Let’s keep moving!',
    visibility: 'EVERYONE',
    likesCount: 62,
    commentsCount: 11,
    sharesCount: 4,
    isLikedByMe: false,
    isSavedByMe: false,
    isMine: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    challengeData: {
      challengeId: 'chal-squat-30',
      challengeTitle: '30-Day Squat Challenge',
      completionPercent: 70,
      currentRank: 3,
      totalParticipants: 142,
      unit: 'squats',
      currentAmount: 2100,
      targetAmount: 3000,
    },
  },
  {
    id: 'post-4',
    userId: 'user-elena',
    userName: 'Elena Rostova',
    userUsername: 'elenarun',
    userAvatar: 'preset:sports-doc',
    userRankName: 'CRIMSON WARLORD',
    userRankInsignia: 'triple-rocker',
    userRankTier: 6,
    isVerified: true,
    postType: 'ACHIEVEMENT',
    caption: '🏆 60 Consecutive Days of Movement! Earned the Tapas Centurion Badge. When motivation wavers, unwavering habit takes over.',
    visibility: 'EVERYONE',
    likesCount: 145,
    commentsCount: 38,
    sharesCount: 19,
    isLikedByMe: false,
    isSavedByMe: false,
    isMine: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    achievementData: {
      achievementTitle: '60-Day Unbroken Streak',
      achievementBadgeName: 'Tapas Centurion Badge',
      disciplineCategory: 'TAPAS',
      milestoneValue: '60 DAYS',
      rankName: 'CRIMSON WARLORD',
      rankInsignia: 'triple-rocker',
    },
  },
  {
    id: 'post-5',
    userId: 'user-vikram',
    userName: 'Vikram Thapa',
    userUsername: 'vikramstrength',
    userAvatar: 'preset:coach-marcus',
    userRankName: 'STEEL GLADIATOR',
    userRankInsignia: 'star-cluster',
    userRankTier: 3,
    postType: 'TRAINING',
    caption: 'Testing an altered 5×5 weighted pull-up rotation this month paired with high-frequency ring dips. The pump and forearm recruitment are unbelievable.',
    visibility: 'EVERYONE',
    likesCount: 38,
    commentsCount: 9,
    sharesCount: 3,
    isLikedByMe: false,
    isSavedByMe: false,
    isMine: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
  },
];

const INITIAL_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'chal-squat-30',
    title: '30-Day Squat Challenge',
    description: 'Log 3,000 squats in 30 days. Test your lower-body endurance and mental grit.',
    category: 'SQUAT',
    targetAmount: 3000,
    currentAmount: 2100,
    unit: 'squats',
    participantsCount: 142,
    userRank: 3,
    isJoined: true,
    badgeReward: 'Vajra Legs Insignia',
    daysRemaining: 9,
  },
  {
    id: 'chal-pushup-100',
    title: '100 Daily Push-Up Sadhana',
    description: '100 push-ups every single day for 30 consecutive days. Discipline over perfection.',
    category: 'PUSHUP',
    targetAmount: 3000,
    currentAmount: 1400,
    unit: 'push-ups',
    participantsCount: 285,
    userRank: 12,
    isJoined: true,
    badgeReward: 'Iron Chest Crest',
    daysRemaining: 16,
  },
  {
    id: 'chal-run-100k',
    title: '100K Outdoor Running Challenge',
    description: 'Cover 100 kilometers of outdoor trails or road running in 30 days.',
    category: 'RUNNING',
    targetAmount: 100,
    currentAmount: 62,
    unit: 'km',
    participantsCount: 89,
    userRank: 7,
    isJoined: false,
    badgeReward: 'Gati Windwalker Badge',
    daysRemaining: 12,
  },
  {
    id: 'chal-steps-10k',
    title: '10,000 Steps Daily Discipline',
    description: 'Hit 10,000 steps every day. Improve resting heart rate and insulin sensitivity.',
    category: 'STEPS',
    targetAmount: 300000,
    currentAmount: 240000,
    unit: 'steps',
    participantsCount: 410,
    userRank: 19,
    isJoined: true,
    badgeReward: 'Pathfinder Seal',
    daysRemaining: 6,
  },
];

const INITIAL_NOTIFICATIONS: SocialNotification[] = [
  {
    id: 'notif-1',
    type: 'FOLLOW',
    sender: { id: 'user-alex', name: 'Alex Chen', username: 'alexvanguard', avatar: 'preset:coach-marcus' },
    message: 'Alex Chen started following you.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'LIKE_POST',
    sender: { id: 'user-marcus', name: 'Marcus Stone', username: 'marcusiron', avatar: 'preset:coach-marcus' },
    message: 'Marcus Stone liked your Chest & Delts workout.',
    targetId: 'post-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'COMMENT_POST',
    sender: { id: 'user-elena', name: 'Elena Rostova', username: 'elenarun', avatar: 'preset:sports-doc' },
    message: 'Elena Rostova commented: "Outstanding bar speed on that top set! 🔥"',
    targetId: 'post-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-4',
    type: 'FOLLOW_REQUEST',
    sender: { id: 'user-sarah', name: 'Sarah Sharma', username: 'sarahfit', avatar: 'preset:sports-doc' },
    message: 'Sarah Sharma requested to follow your training profile.',
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    isRead: false,
    requestStatus: 'PENDING',
  },
  {
    id: 'notif-5',
    type: 'STREAK_MILESTONE',
    sender: { id: 'system', name: 'BALYRA System', username: 'balyra', avatar: 'preset:coach-marcus' },
    message: 'Congratulations! You reached a 30-Day Training Streak! ⚡',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isRead: true,
  },
];

export const DEFAULT_CURRENT_USER: UserSocialProfile = {
  id: 'user-demo-athlete',
  displayName: 'Demo Athlete',
  username: 'athlete',
  avatar: 'preset:athlete',
  bio: 'Disciplined student of physical culture. Dedicated to daily Sadhana. Build. Move. Become.',
  location: 'Kathmandu / Global',
  fitnessGoal: 'Build Power & Mobility',
  joinedDate: 'January 2024',
  isVerified: true,
  isPrivate: false,
  visibility: 'PUBLIC',
  followersCount: 128,
  followingCount: 84,
  workoutsCount: 52,
  streakDays: 14,
  achievementsCount: 9,
  disciplineTitle: 'Sadhana Disciple',
  rank: {
    name: 'IRON WARRIOR',
    insigniaType: 'single-chevron',
    insignia: 'single-chevron',
    tier: 2,
    tierName: 'IRON WARRIOR',
    level: 7,
    totalXP: 3400,
  },
  followStatus: 'NOT_FOLLOWING',
  isFollowing: false,
  isFollowRequested: false,
  stats: {
    streakDays: 14,
    workoutsCompleted: 52,
    personalRecordsCount: 11,
    totalVolumeKg: 280000,
  },
};

// Enrich initial data with aliases and statistics
Object.keys(INITIAL_USERS).forEach((key) => {
  const u = INITIAL_USERS[key];
  u.isFollowing = u.followStatus === 'FOLLOWING';
  u.isFollowRequested = u.followStatus === 'REQUESTED';
  u.visibility = u.isPrivate ? 'FOLLOWERS' : 'PUBLIC';
  u.rank.tierName = u.rank.name;
  u.rank.insignia = u.rank.insigniaType;
  u.stats = {
    streakDays: u.streakDays,
    workoutsCompleted: u.workoutsCount,
    personalRecordsCount: Math.max(4, Math.round(u.workoutsCount / 7)),
    totalVolumeKg: u.workoutsCount * 3100,
  };
});

INITIAL_CHALLENGES.forEach((c) => {
  c.badgeName = c.badgeReward;
});

INITIAL_NOTIFICATIONS.forEach((n) => {
  n.senderId = n.sender.id;
  n.senderName = n.sender.name;
  n.senderAvatar = n.sender.avatar;
  n.text = n.message;
});

export interface SocialStoreState {
  posts: CommunityPost[];
  stories: StoryItem[];
  users: Record<string, UserSocialProfile>;
  athletes: Record<string, UserSocialProfile>;
  currentUser: UserSocialProfile;
  notifications: SocialNotification[];
  challenges: CommunityChallenge[];
  savedItems: SavedItem[];
  commentsByPost: Record<string, ThreadedComment[]>;
  comments: Record<string, ThreadedComment[]>;
  blockedUserIds: string[];
  mutedUserIds: string[];

  // Post Actions
  likePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  savePost: (post: CommunityPost) => void;
  toggleSaveItem: (item: any) => void;
  unsaveItem: (itemId: string) => void;
  isItemSaved: (itemId: string) => boolean;
  createPost: (newPost: any) => void;
  editPost: (postId: string, newCaption: string) => void;
  deletePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;

  // Comments Actions
  getCommentsForPost: (postId: string) => ThreadedComment[];
  addComment: (postId: string, text: string, replyToCommentId?: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;

  // Social Graph Actions
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  respondFollowRequest: (notificationId: string, accept: boolean) => void;
  acceptFollowRequest: (notificationId: string, senderId?: string) => void;
  declineFollowRequest: (notificationId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;

  // Notification Actions
  unreadNotificationsCount: () => number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  // Story Actions
  markStorySeen: (storyId: string) => void;
  markStoryAsSeen: (storyId: string) => void;

  // Challenge Actions
  joinChallenge: (challengeId: string) => void;
  leaveChallenge: (challengeId: string) => void;
  logChallengeProgress: (challengeId: string, amount: number) => void;
}

export const useSocialStore = create<SocialStoreState>()(
  persist(
    (set, get) => ({
      posts: INITIAL_POSTS,
      stories: INITIAL_STORIES,
      users: INITIAL_USERS,
      athletes: INITIAL_USERS,
      currentUser: DEFAULT_CURRENT_USER,
      notifications: INITIAL_NOTIFICATIONS,
      challenges: INITIAL_CHALLENGES,
      savedItems: [],
      commentsByPost: {
        'post-1': [
          {
            id: 'c-1',
            postId: 'post-1',
            userId: 'user-marcus',
            userName: 'Marcus Stone',
            userAvatar: 'preset:coach-marcus',
            userRankName: 'IRON WARRIOR',
            text: 'Huge numbers on the incline press! That 36kg looked clean.',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            likesCount: 7,
            isLikedByMe: false,
            isMine: false,
            replies: [
              {
                id: 'r-1',
                commentId: 'c-1',
                userId: 'user-alex',
                userName: 'Alex Chen',
                userAvatar: 'preset:coach-marcus',
                text: 'Appreciate it brother! Elbow tuck cue made all the difference.',
                createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                likesCount: 4,
                isLikedByMe: true,
              },
            ],
          },
          {
            id: 'c-2',
            postId: 'post-1',
            userId: 'user-elena',
            userName: 'Elena Rostova',
            userAvatar: 'preset:sports-doc',
            userRankName: 'CRIMSON WARLORD',
            text: '20 sets in 54 minutes is savage density. Inspiring work!',
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            likesCount: 5,
            isLikedByMe: false,
            isMine: false,
            replies: [],
          },
        ],
      },
      comments: {},
      blockedUserIds: [],
      mutedUserIds: [],

      likePost: (postId: string) => {
        set((state) => {
          const updated = state.posts.map((p) => {
            if (p.id === postId) {
              const nextLiked = !p.isLikedByMe;
              const nextCount = nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
              const me = { id: 'me', name: 'Dhruv', username: 'dhruvfitness', avatar: 'preset:coach-marcus' };
              let currentLikers = p.likedByUsers ? [...p.likedByUsers] : [];
              if (nextLiked) {
                if (!currentLikers.some((u) => u.id === 'me')) currentLikers.push(me);
              } else {
                currentLikers = currentLikers.filter((u) => u.id !== 'me');
              }
              return {
                ...p,
                isLikedByMe: nextLiked,
                likesCount: nextCount,
                likedByUsers: currentLikers,
              };
            }
            return p;
          });
          return { posts: updated };
        });
      },

      savePost: (post: CommunityPost) => {
        set((state) => {
          const isSaved = state.savedItems.some((s) => s.id === post.id);
          if (isSaved) {
            // Unsave
            return {
              savedItems: state.savedItems.filter((s) => s.id !== post.id),
              posts: state.posts.map((p) => (p.id === post.id ? { ...p, isSavedByMe: false } : p)),
            };
          } else {
            // Save
            const newSaved: SavedItem = {
              id: post.id,
              type: post.postType === 'WORKOUT' ? 'WORKOUT' : 'POST',
              title: post.workoutData ? post.workoutData.workoutName : post.userName + "'s Post",
              subtitle: post.caption.slice(0, 60) + '...',
              savedAt: new Date().toISOString(),
              postReference: post,
              workoutReference: post.workoutData,
            };
            return {
              savedItems: [newSaved, ...state.savedItems],
              posts: state.posts.map((p) => (p.id === post.id ? { ...p, isSavedByMe: true } : p)),
            };
          }
        });
      },

      unsaveItem: (itemId: string) => {
        set((state) => ({
          savedItems: state.savedItems.filter((s) => s.id !== itemId),
          posts: state.posts.map((p) => (p.id === itemId ? { ...p, isSavedByMe: false } : p)),
        }));
      },

      isItemSaved: (itemId: string) => {
        return get().savedItems.some((s) => s.id === itemId);
      },

      toggleLikePost: (postId: string) => {
        get().likePost(postId);
      },

      toggleSaveItem: (item: any) => {
        const id = item.id || item.title;
        set((state) => {
          const isSaved = state.savedItems.some((s) => s.id === id || s.title === item.title);
          if (isSaved) {
            return {
              savedItems: state.savedItems.filter((s) => s.id !== id && s.title !== item.title),
              posts: state.posts.map((p) => (p.id === id ? { ...p, isSavedByMe: false } : p)),
            };
          } else {
            const cat = item.category || item.type || 'POSTS';
            const newSaved: SavedItem = {
              id,
              type: cat === 'WORKOUTS' ? 'WORKOUT' : 'POST',
              category: cat,
              title: item.title,
              subtitle: item.subtitle,
              savedAt: new Date().toISOString(),
              metadata: item.metadata || item,
            };
            return {
              savedItems: [newSaved, ...state.savedItems],
              posts: state.posts.map((p) => (p.id === id ? { ...p, isSavedByMe: true } : p)),
            };
          }
        });
      },

      editPost: (postId: string, newCaption: string) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, caption: newCaption, isEdited: true, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      createPost: (newPostData) => {
        const id = `post-${Date.now()}`;
        const newPost: CommunityPost = {
          userId: 'user-demo-athlete',
          userName: 'Demo Athlete',
          userUsername: 'athlete',
          userAvatar: 'preset:athlete',
          userRankName: 'IRON WARRIOR',
          userRankInsignia: 'single-chevron',
          userRankTier: 2,
          visibility: 'EVERYONE',
          ...newPostData,
          id,
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          isLikedByMe: false,
          isSavedByMe: false,
          isMine: true,
          likedByUsers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      },

      deletePost: (postId: string) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
          savedItems: state.savedItems.filter((s) => s.id !== postId),
        }));
      },

      reportPost: (postId: string, reason: string) => {
        console.log(`[Safety] Reported post ${postId} for: ${reason}`);
      },

      getCommentsForPost: (postId: string) => {
        return get().commentsByPost[postId] || [];
      },

      addComment: (postId: string, text: string, replyToCommentId?: string) => {
        const commentId = `comment-${Date.now()}`;
        const newComment: ThreadedComment = {
          id: commentId,
          postId,
          userId: 'me',
          userName: 'Dhruv',
          userAvatar: 'preset:coach-marcus',
          userRankName: 'INITIATE WARRIOR',
          text,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          isLikedByMe: false,
          isMine: true,
          replies: [],
        };

        set((state) => {
          const currentList = state.commentsByPost[postId] || [];
          let updatedList: ThreadedComment[];

          if (replyToCommentId) {
            updatedList = currentList.map((c) => {
              if (c.id === replyToCommentId) {
                const newReply: CommentReply = {
                  id: `reply-${Date.now()}`,
                  commentId: c.id,
                  userId: 'me',
                  userName: 'Dhruv',
                  userAvatar: 'preset:coach-marcus',
                  text,
                  createdAt: new Date().toISOString(),
                  likesCount: 0,
                  isLikedByMe: false,
                };
                return { ...c, replies: [...c.replies, newReply] };
              }
              return c;
            });
          } else {
            updatedList = [...currentList, newComment];
          }

          const updatedPosts = state.posts.map((p) =>
            p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
          );

          return {
            commentsByPost: { ...state.commentsByPost, [postId]: updatedList },
            posts: updatedPosts,
          };
        });
      },

      likeComment: (postId: string, commentId: string) => {
        set((state) => {
          const currentList = state.commentsByPost[postId] || [];
          const updated = currentList.map((c) => {
            if (c.id === commentId) {
              const nextLiked = !c.isLikedByMe;
              return {
                ...c,
                isLikedByMe: nextLiked,
                likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
              };
            }
            return c;
          });
          return {
            commentsByPost: { ...state.commentsByPost, [postId]: updated },
          };
        });
      },

      deleteComment: (postId: string, commentId: string) => {
        set((state) => {
          const currentList = state.commentsByPost[postId] || [];
          const updated = currentList.filter((c) => c.id !== commentId);
          const updatedPosts = state.posts.map((p) =>
            p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
          );
          return {
            commentsByPost: { ...state.commentsByPost, [postId]: updated },
            posts: updatedPosts,
          };
        });
      },

      followUser: (userId: string) => {
        set((state) => {
          const user = state.users[userId];
          if (!user) return state;

          const nextStatus = user.isPrivate ? 'REQUESTED' : 'FOLLOWING';
          const nextFollowers = nextStatus === 'FOLLOWING' ? user.followersCount + 1 : user.followersCount;
          const updatedUser: UserSocialProfile = {
            ...user,
            followStatus: nextStatus,
            isFollowing: nextStatus === 'FOLLOWING',
            isFollowRequested: nextStatus === 'REQUESTED',
            followersCount: nextFollowers,
          };
          const updatedUsers = {
            ...state.users,
            [userId]: updatedUser,
          };

          return {
            users: updatedUsers,
            athletes: updatedUsers,
          };
        });
      },

      unfollowUser: (userId: string) => {
        set((state) => {
          const user = state.users[userId];
          if (!user) return state;

          const wasFollowing = user.followStatus === 'FOLLOWING';
          const updatedUser: UserSocialProfile = {
            ...user,
            followStatus: 'NOT_FOLLOWING',
            isFollowing: false,
            isFollowRequested: false,
            followersCount: wasFollowing ? Math.max(0, user.followersCount - 1) : user.followersCount,
          };
          const updatedUsers = {
            ...state.users,
            [userId]: updatedUser,
          };

          return {
            users: updatedUsers,
            athletes: updatedUsers,
          };
        });
      },

      respondFollowRequest: (notificationId: string, accept: boolean) => {
        set((state) => {
          const notif = state.notifications.find((n) => n.id === notificationId);
          if (!notif || notif.type !== 'FOLLOW_REQUEST') return state;

          const senderId = notif.sender.id;
          const senderUser = state.users[senderId];

          const updatedUsers = senderUser
            ? {
                ...state.users,
                [senderId]: {
                  ...senderUser,
                  followersCount: accept ? senderUser.followersCount + 1 : senderUser.followersCount,
                },
              }
            : state.users;

          const updatedNotifs = state.notifications.map((n) =>
            n.id === notificationId
              ? { ...n, requestStatus: accept ? 'ACCEPTED' : ('DECLINED' as any), isRead: true }
              : n
          );

          return {
            users: updatedUsers,
            athletes: updatedUsers,
            notifications: updatedNotifs,
          };
        });
      },

      acceptFollowRequest: (notificationId: string, senderId?: string) => {
        get().respondFollowRequest(notificationId, true);
        if (senderId) {
          get().followUser(senderId);
        }
      },

      declineFollowRequest: (notificationId: string) => {
        get().respondFollowRequest(notificationId, false);
      },

      blockUser: (userId: string) => {
        set((state) => ({
          blockedUserIds: [...state.blockedUserIds, userId],
          posts: state.posts.filter((p) => p.userId !== userId),
          stories: state.stories.filter((s) => s.userId !== userId),
        }));
      },

      unblockUser: (userId: string) => {
        set((state) => ({
          blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
        }));
      },

      muteUser: (userId: string) => {
        set((state) => ({
          mutedUserIds: [...state.mutedUserIds, userId],
        }));
      },

      unmuteUser: (userId: string) => {
        set((state) => ({
          mutedUserIds: state.mutedUserIds.filter((id) => id !== userId),
        }));
      },

      unreadNotificationsCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      markNotificationRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      markStorySeen: (storyId: string) => {
        set((state) => ({
          stories: state.stories.map((s) => (s.id === storyId ? { ...s, hasUnseen: false } : s)),
        }));
      },

      markStoryAsSeen: (storyId: string) => {
        get().markStorySeen(storyId);
      },

      joinChallenge: (challengeId: string) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, isJoined: true, participantsCount: c.participantsCount + 1 }
              : c
          ),
        }));
      },

      leaveChallenge: (challengeId: string) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, isJoined: false, participantsCount: Math.max(0, c.participantsCount - 1) }
              : c
          ),
        }));
      },

      logChallengeProgress: (challengeId: string, amount: number) => {
        set((state) => ({
          challenges: state.challenges.map((c) => {
            if (c.id === challengeId) {
              const nextAmt = Math.min(c.targetAmount, c.currentAmount + amount);
              return {
                ...c,
                currentAmount: nextAmt,
              };
            }
            return c;
          }),
        }));
      },
    }),
    {
      name: 'balyra-social-store',
      storage: createJSONStorage(getAppStorage),
      partialize: (state) => ({
        posts: state.posts,
        savedItems: state.savedItems,
        blockedUserIds: state.blockedUserIds,
        mutedUserIds: state.mutedUserIds,
        challenges: state.challenges,
      }),
    }
  )
);
