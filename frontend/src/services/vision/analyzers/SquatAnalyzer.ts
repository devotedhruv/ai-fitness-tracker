import { BaseAnalyzer } from './BaseAnalyzer';
import { Landmark3D, PoseLandmark, FrameAnalysisResult, FormFault } from '../types';
import { calculateAngle, calculateAngleWithVertical } from '../geometry';

export class SquatAnalyzer extends BaseAnalyzer {
  private hasReachedValidDepth: boolean = false;

  constructor() {
    // Target Inflection <= 95 deg, Target Lockout >= 160 deg
    super('squat', 'Bodyweight / Barbell Squat', 95, 160);
  }

  public processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult {
    const activeJointColors: Record<number, string> = {};
    const activeBoneColors: Record<string, string> = {};
    const faultsToAlert: FormFault[] = [];
    let coachingCue: string | undefined;
    let repCompleted = false;
    let isValidRep = false;

    // Check visibility of lower body landmarks
    const leftHip = landmarks[PoseLandmark.LEFT_HIP];
    const leftKnee = landmarks[PoseLandmark.LEFT_KNEE];
    const leftAnkle = landmarks[PoseLandmark.LEFT_ANKLE];
    const rightHip = landmarks[PoseLandmark.RIGHT_HIP];
    const rightKnee = landmarks[PoseLandmark.RIGHT_KNEE];
    const rightAnkle = landmarks[PoseLandmark.RIGHT_ANKLE];
    const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
    const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];

    // Require lower body landmarks to be clearly visible in frame
    const leftLegVisible =
      (leftHip?.visibility ?? 0) >= 0.55 &&
      (leftKnee?.visibility ?? 0) >= 0.55 &&
      (leftAnkle?.visibility ?? 0) >= 0.40;

    const rightLegVisible =
      (rightHip?.visibility ?? 0) >= 0.55 &&
      (rightKnee?.visibility ?? 0) >= 0.55 &&
      (rightAnkle?.visibility ?? 0) >= 0.40;

    if (!leftLegVisible && !rightLegVisible) {
      this.state.currentState = 'NOT_IN_FRAME';
      this.state.activeFaults = [];
      this.minAngleInCurrentRep = 999;
      this.maxAngleInCurrentRep = 0;
      this.repStartTimeMs = 0;
      this.currentRepFaults = [];

      return {
        state: this.getState(),
        repCompleted: false,
        isValidRep: false,
        coachingCue: 'Step back so your legs and feet are visible.',
        faultsToAlert: [],
        skeletonJointColors: {},
        skeletonBoneColors: {},
      };
    }

    // Calculate knee angles on visible side(s)
    let avgKneeAngle = 180;
    if (leftLegVisible && rightLegVisible) {
      const leftKneeAngle = calculateAngle(leftHip!, leftKnee!, leftAnkle!);
      const rightKneeAngle = calculateAngle(rightHip!, rightKnee!, rightAnkle!);
      avgKneeAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2);
    } else if (leftLegVisible) {
      avgKneeAngle = Math.round(calculateAngle(leftHip!, leftKnee!, leftAnkle!));
    } else {
      avgKneeAngle = Math.round(calculateAngle(rightHip!, rightKnee!, rightAnkle!));
    }

    this.state.currentPrimaryAngle = avgKneeAngle;

    // Torso angle relative to vertical (Shoulder -> Hip)
    let torsoLeanAngle = 0;
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const avgShoulder: Landmark3D = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
      const avgHip: Landmark3D = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };
      torsoLeanAngle = calculateAngleWithVertical(avgShoulder, avgHip);
    }

    // Depth Reference Plane: top of knees level
    if (leftKnee && rightKnee) {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      this.state.referenceLineY = Math.round(avgKneeY * 1000) / 1000;
      this.state.referenceLineLabel = 'PARALLEL DEPTH';
      if (leftHip && rightHip) {
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        this.state.isAboveReferenceLine = avgHipY >= avgKneeY; // in video coords, Y increases downward
        this.recordTrajectoryPoint(timestampMs, avgHipY, this.hasReachedValidDepth);
      }
    }

    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      if (this.repStartTimeMs > 0) {
        this.state.currentRepDurationMs = timestampMs - this.repStartTimeMs;
      }
    }

    // State Machine Transitions
    switch (this.state.currentState) {
      case 'NOT_IN_FRAME':
        if (avgKneeAngle >= 155) {
          this.state.currentState = 'READY';
        }
        break;

      case 'READY':
        // Athlete is standing tall
        if (avgKneeAngle >= 155) {
          activeJointColors[PoseLandmark.LEFT_KNEE] = '#34C759';
          activeJointColors[PoseLandmark.RIGHT_KNEE] = '#34C759';
        }
        // Descent starts when knee bends below 140
        if (avgKneeAngle < 140) {
          this.state.currentState = 'ECCENTRIC';
          this.repStartTimeMs = timestampMs;
          this.hasReachedValidDepth = false;
          this.minAngleInCurrentRep = avgKneeAngle;
          this.maxAngleInCurrentRep = avgKneeAngle;
        }
        break;

      case 'ECCENTRIC':
        // Descending into the squat
        if (avgKneeAngle <= this.state.targetInflectionAngle) {
          this.hasReachedValidDepth = true;
          this.state.currentState = 'INFLECTION';
          activeJointColors[PoseLandmark.LEFT_KNEE] = '#34C759';
          activeJointColors[PoseLandmark.RIGHT_KNEE] = '#34C759';
        } else if (avgKneeAngle > this.minAngleInCurrentRep + 10 && !this.hasReachedValidDepth) {
          // Began reversing upwards without ever hitting valid depth!
          this.state.currentState = 'CONCENTRIC';
        }
        break;

      case 'INFLECTION':
        // At the bottom of the squat
        if (avgKneeAngle > this.minAngleInCurrentRep + 8) {
          // Started ascending back up
          this.state.currentState = 'CONCENTRIC';
        }
        break;

      case 'CONCENTRIC':
        // Ascending back to standing lockout
        if (avgKneeAngle >= this.state.targetLockoutAngle) {
          const effectiveMax = Math.max(this.maxAngleInCurrentRep, avgKneeAngle);
          const effectiveMin = Math.min(this.minAngleInCurrentRep, avgKneeAngle);
          const rom = effectiveMax - effectiveMin;
          const repDurationMs = this.repStartTimeMs > 0 ? timestampMs - this.repStartTimeMs : 0;

          // Require meaningful range of motion (>= 25 deg) and duration (>= 150 ms)
          if (rom >= 25 && repDurationMs >= 150) {
            repCompleted = true;

            // Check if depth was satisfied
            const faults: FormFault[] = [];
            if (!this.hasReachedValidDepth || effectiveMin > 100) {
              const depthFault: FormFault = {
                id: 'squat-half-rep',
                name: 'Shallow Squat (Half Rep)',
                correctionMessage: 'Squat deeper! Parallel or lower required for rep to count.',
                severity: 'CRITICAL_NO_REP',
                jointIndices: [PoseLandmark.LEFT_KNEE, PoseLandmark.RIGHT_KNEE, PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
                detectedAtTimestamp: timestampMs,
              };
              faults.push(depthFault);
              faultsToAlert.push(depthFault);
              coachingCue = depthFault.correctionMessage;
            }

            const repOutcome = this.completeRep(timestampMs, faults);
            isValidRep = repOutcome.isValid;
            if (isValidRep) {
              coachingCue = `Rep ${this.state.validReps}! Great depth.`;
            }
          } else {
            this.state.currentState = 'READY';
            this.minAngleInCurrentRep = 999;
            this.maxAngleInCurrentRep = 0;
            this.repStartTimeMs = 0;
            this.currentRepFaults = [];
          }
        }
        break;
    }

    // Track minimum depth achieved in this rep cycle
    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      this.minAngleInCurrentRep = Math.min(this.minAngleInCurrentRep, avgKneeAngle);
      this.maxAngleInCurrentRep = Math.max(this.maxAngleInCurrentRep, avgKneeAngle);
    }

    // 1. Check for Knee Cave (Valgus) during movement
    if (leftLegVisible && rightLegVisible && leftKnee && rightKnee && leftAnkle && rightAnkle && this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      const kneeDist = Math.abs(leftKnee.x - rightKnee.x);
      const ankleDist = Math.abs(leftAnkle.x - rightAnkle.x);
      if (ankleDist > 0.15 && kneeDist < ankleDist * 0.72 && avgKneeAngle < 130) {
        const fault: FormFault = {
          id: 'squat-knee-cave',
          name: 'Knee Cave (Valgus)',
          correctionMessage: 'Drive your knees out - don\'t let them cave inward!',
          severity: 'CRITICAL_NO_REP',
          jointIndices: [PoseLandmark.LEFT_KNEE, PoseLandmark.RIGHT_KNEE],
          detectedAtTimestamp: timestampMs,
        };
        this.currentRepFaults.push(fault);
        faultsToAlert.push(fault);
        coachingCue = fault.correctionMessage;
        activeJointColors[PoseLandmark.LEFT_KNEE] = '#FF3B30';
        activeJointColors[PoseLandmark.RIGHT_KNEE] = '#FF3B30';
      }
    }

    // 2. Check for Excessive Torso Lean (Chest Collapse)
    if (torsoLeanAngle > 48 && avgKneeAngle < 130 && this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      const fault: FormFault = {
        id: 'squat-chest-collapse',
        name: 'Chest Collapse',
        correctionMessage: 'Keep chest proud and back upright!',
        severity: 'CRITICAL_NO_REP',
        jointIndices: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER, PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
        detectedAtTimestamp: timestampMs,
      };
      this.currentRepFaults.push(fault);
      faultsToAlert.push(fault);
      coachingCue = fault.correctionMessage;
    }

    this.state.activeFaults = faultsToAlert;

    return {
      state: this.getState(),
      repCompleted,
      isValidRep,
      coachingCue,
      faultsToAlert,
      skeletonJointColors: activeJointColors,
      skeletonBoneColors: activeBoneColors,
      referenceLineY: this.state.referenceLineY,
      referenceLineLabel: this.state.referenceLineLabel,
      isAboveReferenceLine: this.state.isAboveReferenceLine,
      trajectoryHistory: [...this.trajectoryHistory],
    };
  }
}
