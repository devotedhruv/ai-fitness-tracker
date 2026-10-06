export enum PoseLandmark {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

export interface Landmark3D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type RepState = 
  | 'NOT_IN_FRAME'    // Athlete body not fully visible / detected in camera frame
  | 'READY'          // Athlete in starting position
  | 'ECCENTRIC'      // Moving down / loading (e.g. descending in squat)
  | 'INFLECTION'     // At the bottom / peak ROM
  | 'CONCENTRIC'     // Pushing / pulling back up
  | 'COMPLETED';     // Returned to start, rep counted or rejected

export interface FormFault {
  id: string;
  name: string;
  correctionMessage: string;
  severity: 'WARNING' | 'CRITICAL_NO_REP';
  jointIndices: number[];
  detectedAtTimestamp: number;
}

import { BarbellPoint, RepVelocityMetrics } from './analyzers/VelocityTracker';

export interface TrajectoryPoint {
  timestampMs: number;
  y: number; // normalized Y (0.0 = top, 1.0 = bottom)
  state: RepState;
  isPeak?: boolean;
}

export interface SetPerformanceReport {
  totalValidReps: number;
  totalNoReps: number;
  avgRepDurationMs: number;
  fastestRepMs: number;
  fastestRepNumber: number;
  slowestRepMs: number;
  slowestRepNumber: number;
  avgRestBetweenRepsMs: number;
  fatigueLossPercent: number; // % slowdown from fastest to slowest
  repDurations: number[];
  interRepRests: number[];
}

export interface CompletedRepData {
  repNumber: number;
  isValid: boolean;
  minAngle: number;
  maxAngle: number;
  durationMs: number;
  timeSinceLastRepMs?: number; // rest pause since previous rep
  faults: FormFault[];
  formScore: number; // 0 - 100
  velocityMetrics?: RepVelocityMetrics;
}

export interface ExerciseTrackerState {
  exerciseId: string;
  exerciseName: string;
  validReps: number;
  noReps: number;
  currentState: RepState;
  currentPrimaryAngle: number;
  targetInflectionAngle: number; // e.g. <= 90 for squat
  targetLockoutAngle: number;    // e.g. >= 160 for squat
  activeFaults: FormFault[];
  recentHistory: CompletedRepData[];
  overallFormScore: number;
  holdDurationSec?: number; // for isometric holds like Planks
  isHoldActive?: boolean;
  latestVelocity?: RepVelocityMetrics;
  barPath?: BarbellPoint[];

  // Dynamic Reference Line & Pacing (YOLO26-style)
  referenceLineY?: number;               // Normalized Y level of pull-up bar / depth threshold
  isAboveReferenceLine?: boolean;        // Whether head/chin is above the reference line
  referenceLineLabel?: string;           // E.g. "PULL-UP BAR REFERENCE LINE"
  distanceToReferenceLineCm?: number;    // Distance to reference line (+ = above, - = below)
  currentRepDurationMs?: number;         // Real-time duration of current active rep
  trajectoryHistory?: TrajectoryPoint[]; // Rolling head/primary vertical trajectory
  setPerformanceReport?: SetPerformanceReport;
}

export interface FrameAnalysisResult {
  state: ExerciseTrackerState;
  repCompleted: boolean;
  isValidRep: boolean;
  coachingCue?: string;
  faultsToAlert: FormFault[];
  skeletonJointColors: Record<number, string>; // landmarkIndex -> color hex
  skeletonBoneColors: Record<string, string>;   // "from-to" -> color hex
  barPath?: BarbellPoint[];
  latestVelocity?: RepVelocityMetrics;
  referenceLineY?: number;
  isAboveReferenceLine?: boolean;
  referenceLineLabel?: string;
  distanceToReferenceLineCm?: number;
  trajectoryHistory?: TrajectoryPoint[];
}

// MediaPipe Connection Pairs
export const POSE_CONNECTIONS: [PoseLandmark, PoseLandmark][] = [
  // Upper body
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
  [PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
  [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
  [PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
  
  // Torso
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP],
  [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_HIP],
  [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
  
  // Lower body
  [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
  [PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
  [PoseLandmark.LEFT_ANKLE, PoseLandmark.LEFT_FOOT_INDEX],
  [PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
  [PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
  [PoseLandmark.RIGHT_ANKLE, PoseLandmark.RIGHT_FOOT_INDEX],
];
