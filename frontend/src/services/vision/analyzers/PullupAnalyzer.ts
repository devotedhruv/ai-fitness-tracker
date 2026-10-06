import { BaseAnalyzer } from './BaseAnalyzer';
import { Landmark3D, PoseLandmark, FrameAnalysisResult, FormFault } from '../types';
import { calculateAngle } from '../geometry';

export class PullupAnalyzer extends BaseAnalyzer {
  private hasClearedBar: boolean = false;
  private calibratedBarY: number | null = null;

  constructor() {
    // Target Inflection <= 65 deg (chin over bar), Target Lockout >= 155 deg (full dead hang)
    super('pullup', 'Pull-up', 65, 155);
    this.state.referenceLineLabel = 'PULL-UP BAR REFERENCE';
  }

  public setManualReferenceLineY(y: number): void {
    this.calibratedBarY = y;
    this.state.referenceLineY = y;
  }

  public override reset(): void {
    super.reset();
    this.hasClearedBar = false;
    this.calibratedBarY = null;
    this.state.referenceLineY = undefined;
    this.state.isAboveReferenceLine = false;
    this.state.distanceToReferenceLineCm = 0;
  }

  public processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult {
    const activeJointColors: Record<number, string> = {};
    const activeBoneColors: Record<string, string> = {};
    const faultsToAlert: FormFault[] = [];
    let coachingCue: string | undefined;
    let repCompleted = false;
    let isValidRep = false;

    const leftElbow = landmarks[PoseLandmark.LEFT_ELBOW];
    const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
    const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
    const rightElbow = landmarks[PoseLandmark.RIGHT_ELBOW];
    const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];
    const rightWrist = landmarks[PoseLandmark.RIGHT_WRIST];
    const nose = landmarks[PoseLandmark.NOSE];

    // Require at least one full arm to be clearly visible in camera frame
    const leftArmVisible =
      (leftShoulder?.visibility ?? 0) >= 0.55 &&
      (leftElbow?.visibility ?? 0) >= 0.55 &&
      (leftWrist?.visibility ?? 0) >= 0.50;

    const rightArmVisible =
      (rightShoulder?.visibility ?? 0) >= 0.55 &&
      (rightElbow?.visibility ?? 0) >= 0.55 &&
      (rightWrist?.visibility ?? 0) >= 0.50;

    if (!leftArmVisible && !rightArmVisible) {
      this.state.currentState = 'NOT_IN_FRAME';
      this.state.activeFaults = [];
      this.minAngleInCurrentRep = 999;
      this.maxAngleInCurrentRep = 0;
      this.repStartTimeMs = 0;
      this.currentRepFaults = [];
      this.state.currentRepDurationMs = undefined;
      this.state.isAboveReferenceLine = false;

      return {
        state: this.getState(),
        repCompleted: false,
        isValidRep: false,
        coachingCue: 'Step back so your pull-up bar, arms, and chin are visible.',
        faultsToAlert: [],
        skeletonJointColors: {},
        skeletonBoneColors: {},
        referenceLineY: this.calibratedBarY ?? undefined,
        referenceLineLabel: 'PULL-UP BAR REFERENCE',
        isAboveReferenceLine: false,
      };
    }

    let avgElbowAngle = 180;
    if (leftArmVisible && rightArmVisible) {
      const leftAngle = calculateAngle(leftShoulder!, leftElbow!, leftWrist!);
      const rightAngle = calculateAngle(rightShoulder!, rightElbow!, rightWrist!);
      avgElbowAngle = Math.round((leftAngle + rightAngle) / 2);
    } else if (leftArmVisible) {
      avgElbowAngle = Math.round(calculateAngle(leftShoulder!, leftElbow!, leftWrist!));
    } else {
      avgElbowAngle = Math.round(calculateAngle(rightShoulder!, rightElbow!, rightWrist!));
    }

    this.state.currentPrimaryAngle = avgElbowAngle;

    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      this.minAngleInCurrentRep = Math.min(this.minAngleInCurrentRep, avgElbowAngle);
      this.maxAngleInCurrentRep = Math.max(this.maxAngleInCurrentRep, avgElbowAngle);
      if (this.repStartTimeMs > 0) {
        this.state.currentRepDurationMs = timestampMs - this.repStartTimeMs;
      }
    }

    // 1. Reference Line: Calculate or calibrate bar position from wrist level
    const wristY = leftArmVisible && rightArmVisible
      ? (leftWrist!.y + rightWrist!.y) / 2
      : leftArmVisible ? leftWrist!.y : rightWrist!.y;

    if (this.calibratedBarY === null) {
      this.calibratedBarY = Math.round(wristY * 1000) / 1000;
    } else if (Math.abs(wristY - this.calibratedBarY) < 0.08) {
      // Gently adapt bar level if wrists drift slightly
      this.calibratedBarY = Math.round((this.calibratedBarY * 0.95 + wristY * 0.05) * 1000) / 1000;
    }
    this.state.referenceLineY = this.calibratedBarY;

    // 2. Measure head/chin clearance relative to reference line (smaller y = higher up)
    const noseY = (nose && (nose.visibility ?? 0) >= 0.4) ? nose.y : undefined;
    let isAboveReferenceLine = false;
    let distanceToReferenceLineCm = 0;

    if (noseY !== undefined && this.calibratedBarY !== null) {
      // Head/chin above bar when noseY is at or above bar height (with 0.03 tolerance)
      isAboveReferenceLine = noseY <= this.calibratedBarY + 0.03;
      distanceToReferenceLineCm = Math.round((this.calibratedBarY - noseY) * 180);
      this.state.isAboveReferenceLine = isAboveReferenceLine;
      this.state.distanceToReferenceLineCm = distanceToReferenceLineCm;

      // Record trajectory point for head movement curve
      this.recordTrajectoryPoint(timestampMs, noseY, isAboveReferenceLine);
    }

    const chinOverBar = isAboveReferenceLine || avgElbowAngle <= 65;

    switch (this.state.currentState) {
      case 'NOT_IN_FRAME':
        if (avgElbowAngle >= 145) {
          this.state.currentState = 'READY';
        }
        break;

      case 'READY':
        if (avgElbowAngle >= 150) {
          if (leftArmVisible) activeJointColors[PoseLandmark.LEFT_ELBOW] = '#34C759';
          if (rightArmVisible) activeJointColors[PoseLandmark.RIGHT_ELBOW] = '#34C759';
        }
        if (avgElbowAngle < 135) {
          this.state.currentState = 'CONCENTRIC'; // Pulling up
          this.repStartTimeMs = timestampMs;
          this.hasClearedBar = false;
          this.minAngleInCurrentRep = avgElbowAngle;
          this.maxAngleInCurrentRep = avgElbowAngle;
        }
        break;

      case 'CONCENTRIC':
        if (chinOverBar || avgElbowAngle <= this.state.targetInflectionAngle) {
          this.hasClearedBar = true;
          this.state.currentState = 'INFLECTION';
          if (leftArmVisible) activeJointColors[PoseLandmark.LEFT_ELBOW] = '#34C759';
          if (rightArmVisible) activeJointColors[PoseLandmark.RIGHT_ELBOW] = '#34C759';
        } else if (avgElbowAngle > this.minAngleInCurrentRep + 15 && !this.hasClearedBar) {
          this.state.currentState = 'ECCENTRIC';
        }
        break;

      case 'INFLECTION':
        if (avgElbowAngle > this.minAngleInCurrentRep + 10) {
          this.state.currentState = 'ECCENTRIC'; // Lowering down
        } else {
          break;
        }

      case 'ECCENTRIC':
        // Hysteresis requirement: Lockout angle reached AND head returned below bar
        const descendedBelowBar = noseY !== undefined && this.calibratedBarY !== null
          ? noseY >= this.calibratedBarY + 0.06
          : true;

        if (avgElbowAngle >= this.state.targetLockoutAngle && descendedBelowBar) {
          const effectiveMax = Math.max(this.maxAngleInCurrentRep, avgElbowAngle);
          const effectiveMin = Math.min(this.minAngleInCurrentRep, avgElbowAngle);
          const rom = effectiveMax - effectiveMin;
          const repDurationMs = timestampMs - this.repStartTimeMs;

          // Require meaningful range of motion (>= 30 deg) and duration (>= 350 ms)
          if (rom >= 30 && repDurationMs >= 350) {
            repCompleted = true;

            const faults: FormFault[] = [];
            if (!this.hasClearedBar) {
              const chinFault: FormFault = {
                id: 'pullup-no-chin',
                name: 'Chin Not Over Bar',
                correctionMessage: 'Pull all the way up until chin clears the bar reference line!',
                severity: 'CRITICAL_NO_REP',
                jointIndices: [PoseLandmark.NOSE, PoseLandmark.LEFT_ELBOW, PoseLandmark.RIGHT_ELBOW],
                detectedAtTimestamp: timestampMs,
              };
              faults.push(chinFault);
              faultsToAlert.push(chinFault);
              coachingCue = chinFault.correctionMessage;
            }

            const repOutcome = this.completeRep(timestampMs, faults);
            isValidRep = repOutcome.isValid;
            if (isValidRep) {
              coachingCue = `Rep ${this.state.validReps}! Bar cleared cleanly.`;
            }
          } else {
            this.state.currentState = 'READY';
            this.minAngleInCurrentRep = 999;
            this.maxAngleInCurrentRep = 0;
            this.repStartTimeMs = 0;
            this.currentRepFaults = [];
            this.state.currentRepDurationMs = undefined;
          }
        }
        break;
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
      referenceLineY: this.calibratedBarY ?? undefined,
      isAboveReferenceLine,
      referenceLineLabel: 'PULL-UP BAR REFERENCE',
      distanceToReferenceLineCm,
      trajectoryHistory: [...this.trajectoryHistory],
    };
  }
}
