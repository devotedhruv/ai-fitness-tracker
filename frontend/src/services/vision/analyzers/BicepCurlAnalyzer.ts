import { BaseAnalyzer } from './BaseAnalyzer';
import { Landmark3D, PoseLandmark, FrameAnalysisResult, FormFault } from '../types';
import { calculateAngle } from '../geometry';

export class BicepCurlAnalyzer extends BaseAnalyzer {
  private hasReachedPeakFlexion: boolean = false;

  constructor() {
    // Target Inflection <= 50 deg (full squeeze), Target Lockout >= 155 deg (full extension)
    super('bicep_curl', 'Bicep Curl', 50, 155);
  }

  public processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult {
    const activeJointColors: Record<number, string> = {};
    const activeBoneColors: Record<string, string> = {};
    const faultsToAlert: FormFault[] = [];
    let coachingCue: string | undefined;
    let repCompleted = false;
    let isValidRep = false;

    // Pick more visible arm
    const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
    const leftElbow = landmarks[PoseLandmark.LEFT_ELBOW];
    const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
    const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];
    const rightElbow = landmarks[PoseLandmark.RIGHT_ELBOW];
    const rightWrist = landmarks[PoseLandmark.RIGHT_WRIST];

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

      return {
        state: this.getState(),
        repCompleted: false,
        isValidRep: false,
        coachingCue: 'Step back so your arms are visible.',
        faultsToAlert: [],
        skeletonJointColors: {},
        skeletonBoneColors: {},
      };
    }

    const leftAngle = leftArmVisible ? calculateAngle(leftShoulder!, leftElbow!, leftWrist!) : 180;
    const rightAngle = rightArmVisible ? calculateAngle(rightShoulder!, rightElbow!, rightWrist!) : 180;

    // Track the active curling arm
    const useLeft = leftArmVisible && (!rightArmVisible || leftAngle <= rightAngle);
    const activeAngle = useLeft ? leftAngle : rightAngle;
    const shoulder = useLeft ? leftShoulder! : rightShoulder!;
    const elbow = useLeft ? leftElbow! : rightElbow!;

    this.state.currentPrimaryAngle = activeAngle;

    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      this.minAngleInCurrentRep = Math.min(this.minAngleInCurrentRep, activeAngle);
      this.maxAngleInCurrentRep = Math.max(this.maxAngleInCurrentRep, activeAngle);
    }

    // Check for elbow drifting forward (swinging momentum)
    const elbowDriftX = Math.abs(elbow.x - shoulder.x);
    if (elbowDriftX > 0.18 && activeAngle < 120 && this.state.currentState !== 'READY') {
      const fault: FormFault = {
        id: 'curl-elbow-swing',
        name: 'Elbow Swinging / Momentum',
        correctionMessage: 'Keep elbows locked at your sides - don\'t swing forward!',
        severity: 'CRITICAL_NO_REP',
        jointIndices: [useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW],
        detectedAtTimestamp: timestampMs,
      };
      this.currentRepFaults.push(fault);
      faultsToAlert.push(fault);
      coachingCue = fault.correctionMessage;
      activeJointColors[useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW] = '#FF3B30';
    }

    switch (this.state.currentState) {
      case 'NOT_IN_FRAME':
        if (activeAngle >= 145) {
          this.state.currentState = 'READY';
        }
        break;

      case 'READY':
        if (activeAngle >= 150) {
          activeJointColors[useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW] = '#34C759';
        }
        if (activeAngle < 135) {
          this.state.currentState = 'CONCENTRIC'; // Curling up
          this.repStartTimeMs = timestampMs;
          this.hasReachedPeakFlexion = false;
          this.minAngleInCurrentRep = activeAngle;
          this.maxAngleInCurrentRep = activeAngle;
        }
        break;

      case 'CONCENTRIC':
        if (activeAngle <= this.state.targetInflectionAngle) {
          this.hasReachedPeakFlexion = true;
          this.state.currentState = 'INFLECTION';
          activeJointColors[useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW] = '#34C759';
        } else if (activeAngle > this.minAngleInCurrentRep + 15 && !this.hasReachedPeakFlexion) {
          this.state.currentState = 'ECCENTRIC';
        }
        break;

      case 'INFLECTION':
        if (activeAngle > this.minAngleInCurrentRep + 10) {
          this.state.currentState = 'ECCENTRIC'; // Lowering down
        }
        break;

      case 'ECCENTRIC':
        if (activeAngle >= this.state.targetLockoutAngle) {
          const effectiveMax = Math.max(this.maxAngleInCurrentRep, activeAngle);
          const effectiveMin = Math.min(this.minAngleInCurrentRep, activeAngle);
          const rom = effectiveMax - effectiveMin;
          const repDurationMs = timestampMs - this.repStartTimeMs;

          // Require meaningful range of motion (>= 30 deg) and duration (>= 350 ms)
          if (rom >= 30 && repDurationMs >= 350) {
            repCompleted = true;

            const faults: FormFault[] = [];
            if (!this.hasReachedPeakFlexion || effectiveMin > 65) {
              const romFault: FormFault = {
                id: 'curl-half-rep',
                name: 'Incomplete Curl ROM',
                correctionMessage: 'Squeeze biceps all the way to the top!',
                severity: 'CRITICAL_NO_REP',
                jointIndices: [useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW],
                detectedAtTimestamp: timestampMs,
              };
              faults.push(romFault);
              faultsToAlert.push(romFault);
              coachingCue = romFault.correctionMessage;
            }

            const repOutcome = this.completeRep(timestampMs, faults);
            isValidRep = repOutcome.isValid;
            if (isValidRep) {
              coachingCue = `Rep ${this.state.validReps}! Great squeeze.`;
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

    this.state.activeFaults = faultsToAlert;

    return {
      state: this.getState(),
      repCompleted,
      isValidRep,
      coachingCue,
      faultsToAlert,
      skeletonJointColors: activeJointColors,
      skeletonBoneColors: activeBoneColors,
    };
  }
}
