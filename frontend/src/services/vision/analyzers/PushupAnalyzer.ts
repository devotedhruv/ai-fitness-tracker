import { BaseAnalyzer } from './BaseAnalyzer';
import { Landmark3D, PoseLandmark, FrameAnalysisResult, FormFault } from '../types';
import { calculateAngle } from '../geometry';

export class PushupAnalyzer extends BaseAnalyzer {
  private hasReachedValidDepth: boolean = false;

  constructor() {
    // Target Inflection <= 90 deg, Target Lockout >= 160 deg
    super('pushup', 'Push-up', 90, 160);
  }

  public processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult {
    const activeJointColors: Record<number, string> = {};
    const activeBoneColors: Record<string, string> = {};
    const faultsToAlert: FormFault[] = [];
    let coachingCue: string | undefined;
    let repCompleted = false;
    let isValidRep = false;

    // Pick more visible side (Left vs Right)
    const leftElbow = landmarks[PoseLandmark.LEFT_ELBOW];
    const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
    const leftWrist = landmarks[PoseLandmark.LEFT_WRIST];
    const leftHip = landmarks[PoseLandmark.LEFT_HIP];
    const leftAnkle = landmarks[PoseLandmark.LEFT_ANKLE];

    const rightElbow = landmarks[PoseLandmark.RIGHT_ELBOW];
    const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];
    const rightWrist = landmarks[PoseLandmark.RIGHT_WRIST];
    const rightHip = landmarks[PoseLandmark.RIGHT_HIP];
    const rightAnkle = landmarks[PoseLandmark.RIGHT_ANKLE];

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
        coachingCue: 'Step back so your upper body and arms are visible.',
        faultsToAlert: [],
        skeletonJointColors: {},
        skeletonBoneColors: {},
      };
    }

    // Determine primary side based on visibility of the active arm
    const leftVis = (leftElbow?.visibility ?? 0) + (leftShoulder?.visibility ?? 0);
    const rightVis = (rightElbow?.visibility ?? 0) + (rightShoulder?.visibility ?? 0);
    const useLeft = leftArmVisible && (!rightArmVisible || leftVis >= rightVis);

    const shoulder = useLeft ? leftShoulder! : rightShoulder!;
    const elbow = useLeft ? leftElbow! : rightElbow!;
    const wrist = useLeft ? leftWrist! : rightWrist!;
    const hip = useLeft ? leftHip : rightHip;
    const ankle = useLeft ? leftAnkle : rightAnkle;

    // 1. Elbow angle (Shoulder -> Elbow -> Wrist)
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    this.state.currentPrimaryAngle = elbowAngle;

    // 2. Spine / Body alignment (Shoulder -> Hip -> Ankle)
    const hasVisibleLowerBody =
      ((leftHip?.visibility ?? 0) >= 0.5 && (leftAnkle?.visibility ?? 0) >= 0.4) ||
      ((rightHip?.visibility ?? 0) >= 0.5 && (rightAnkle?.visibility ?? 0) >= 0.4);

    const bodyLineAngle = hasVisibleLowerBody && hip && ankle
      ? calculateAngle(shoulder, hip, ankle)
      : 180;

    // Trajectory & Chest Depth Reference Line
    this.recordTrajectoryPoint(timestampMs, shoulder.y, this.hasReachedValidDepth);
    this.state.referenceLineY = Math.round(wrist.y * 1000) / 1000;
    this.state.referenceLineLabel = 'CHEST DEPTH';
    this.state.isAboveReferenceLine = shoulder.y >= wrist.y - 0.06;

    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      if (this.repStartTimeMs > 0) {
        this.state.currentRepDurationMs = timestampMs - this.repStartTimeMs;
      }
    }

    // State Machine Transitions
    switch (this.state.currentState) {
      case 'NOT_IN_FRAME':
        if (elbowAngle >= 145) {
          this.state.currentState = 'READY';
        }
        break;

      case 'READY':
        if (elbowAngle >= 150) {
          activeJointColors[useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW] = '#34C759';
        }
        if (elbowAngle < 145) {
          this.state.currentState = 'ECCENTRIC';
          this.repStartTimeMs = timestampMs;
          this.hasReachedValidDepth = false;
          this.minAngleInCurrentRep = elbowAngle;
          this.maxAngleInCurrentRep = elbowAngle;
        }
        break;

      case 'ECCENTRIC':
        if (elbowAngle <= this.state.targetInflectionAngle) {
          this.hasReachedValidDepth = true;
          this.state.currentState = 'INFLECTION';
          activeJointColors[useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW] = '#34C759';
        } else if (elbowAngle > this.minAngleInCurrentRep + 12 && !this.hasReachedValidDepth) {
          this.state.currentState = 'CONCENTRIC';
        }
        break;

      case 'INFLECTION':
        if (elbowAngle > this.minAngleInCurrentRep + 8) {
          this.state.currentState = 'CONCENTRIC';
        }
        break;

      case 'CONCENTRIC':
        if (elbowAngle >= this.state.targetLockoutAngle) {
          const effectiveMax = Math.max(this.maxAngleInCurrentRep, elbowAngle);
          const effectiveMin = Math.min(this.minAngleInCurrentRep, elbowAngle);
          const rom = effectiveMax - effectiveMin;
          const repDurationMs = this.repStartTimeMs > 0 ? timestampMs - this.repStartTimeMs : 0;

          // Require meaningful range of motion (>= 25 deg) and duration (>= 150 ms)
          if (rom >= 25 && repDurationMs >= 150) {
            repCompleted = true;

            const faults: FormFault[] = [];
            if (!this.hasReachedValidDepth || effectiveMin > 95) {
              const depthFault: FormFault = {
                id: 'pushup-half-rep',
                name: 'Incomplete Depth (Half Rep)',
                correctionMessage: 'Chest must touch or reach 90 degrees elbow bend!',
                severity: 'CRITICAL_NO_REP',
                jointIndices: [useLeft ? PoseLandmark.LEFT_ELBOW : PoseLandmark.RIGHT_ELBOW],
                detectedAtTimestamp: timestampMs,
              };
              faults.push(depthFault);
              faultsToAlert.push(depthFault);
              coachingCue = depthFault.correctionMessage;
            }

            const repOutcome = this.completeRep(timestampMs, faults);
            isValidRep = repOutcome.isValid;
            if (isValidRep) {
              coachingCue = `Rep ${this.state.validReps}! Clean push-up.`;
            }
          } else {
            // Insufficient ROM or duration - reset to READY without recording a rep
            this.state.currentState = 'READY';
            this.minAngleInCurrentRep = 999;
            this.maxAngleInCurrentRep = 0;
            this.repStartTimeMs = 0;
            this.currentRepFaults = [];
          }
        }
        break;
    }

    // Track min/max elbow angle during movement
    if (this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      this.minAngleInCurrentRep = Math.min(this.minAngleInCurrentRep, elbowAngle);
      this.maxAngleInCurrentRep = Math.max(this.maxAngleInCurrentRep, elbowAngle);
    }

    // Alignment Faults (only evaluate when lower body is actually in frame and rep is in progress)
    if (hasVisibleLowerBody && this.state.currentState !== 'READY' && this.state.currentState !== 'NOT_IN_FRAME') {
      // Alignment Fault 1: Hip Sagging (Lower back hyperextending)
      if (bodyLineAngle < 155) {
        const fault: FormFault = {
          id: 'pushup-hip-sag',
          name: 'Hips Sagging',
          correctionMessage: 'Engage core and glutes - don\'t let your lower back sag!',
          severity: 'CRITICAL_NO_REP',
          jointIndices: [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
          detectedAtTimestamp: timestampMs,
        };
        this.currentRepFaults.push(fault);
        faultsToAlert.push(fault);
        coachingCue = fault.correctionMessage;
        activeJointColors[useLeft ? PoseLandmark.LEFT_HIP : PoseLandmark.RIGHT_HIP] = '#FF3B30';
      }

      // Alignment Fault 2: Hip Piking (Butt in the air)
      if (bodyLineAngle > 205) {
        const fault: FormFault = {
          id: 'pushup-hip-pike',
          name: 'Hips Piked',
          correctionMessage: 'Lower hips into a straight plank position!',
          severity: 'CRITICAL_NO_REP',
          jointIndices: [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
          detectedAtTimestamp: timestampMs,
        };
        this.currentRepFaults.push(fault);
        faultsToAlert.push(fault);
        coachingCue = fault.correctionMessage;
      }
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
