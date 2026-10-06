import { BaseAnalyzer } from './BaseAnalyzer';
import { Landmark3D, PoseLandmark, FrameAnalysisResult, FormFault } from '../types';
import { calculateAngle } from '../geometry';

export class PlankAnalyzer extends BaseAnalyzer {
  private lastValidTickMs: number = 0;
  private accumulatedHoldMs: number = 0;

  constructor() {
    super('plank', 'Plank Hold', 180, 180);
    this.state.holdDurationSec = 0;
    this.state.isHoldActive = false;
  }

  public reset(): void {
    super.reset();
    this.accumulatedHoldMs = 0;
    this.lastValidTickMs = 0;
    this.state.holdDurationSec = 0;
    this.state.isHoldActive = false;
  }

  public processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult {
    const activeJointColors: Record<number, string> = {};
    const activeBoneColors: Record<string, string> = {};
    const faultsToAlert: FormFault[] = [];
    let coachingCue: string | undefined;

    const leftShoulder = landmarks[PoseLandmark.LEFT_SHOULDER];
    const leftHip = landmarks[PoseLandmark.LEFT_HIP];
    const leftAnkle = landmarks[PoseLandmark.LEFT_ANKLE];
    const rightShoulder = landmarks[PoseLandmark.RIGHT_SHOULDER];
    const rightHip = landmarks[PoseLandmark.RIGHT_HIP];
    const rightAnkle = landmarks[PoseLandmark.RIGHT_ANKLE];

    // Require at least one full side of the body to be visible
    const leftSideVisible =
      (leftShoulder?.visibility ?? 0) >= 0.55 &&
      (leftHip?.visibility ?? 0) >= 0.55 &&
      (leftAnkle?.visibility ?? 0) >= 0.45;

    const rightSideVisible =
      (rightShoulder?.visibility ?? 0) >= 0.55 &&
      (rightHip?.visibility ?? 0) >= 0.55 &&
      (rightAnkle?.visibility ?? 0) >= 0.45;

    if (!leftSideVisible && !rightSideVisible) {
      this.state.currentState = 'NOT_IN_FRAME';
      this.state.isHoldActive = false;
      this.state.activeFaults = [];
      this.lastValidTickMs = timestampMs;

      return {
        state: this.getState(),
        repCompleted: false,
        isValidRep: false,
        coachingCue: 'Step back into side-view so your whole body is visible.',
        faultsToAlert: [],
        skeletonJointColors: {},
        skeletonBoneColors: {},
      };
    }

    let bodyAngle = 180;
    if (leftSideVisible && rightSideVisible) {
      const leftAngle = calculateAngle(leftShoulder!, leftHip!, leftAnkle!);
      const rightAngle = calculateAngle(rightShoulder!, rightHip!, rightAnkle!);
      bodyAngle = Math.round((leftAngle + rightAngle) / 2);
    } else if (leftSideVisible) {
      bodyAngle = Math.round(calculateAngle(leftShoulder!, leftHip!, leftAnkle!));
    } else {
      bodyAngle = Math.round(calculateAngle(rightShoulder!, rightHip!, rightAnkle!));
    }

    this.state.currentPrimaryAngle = bodyAngle;

    // Valid plank alignment: 165 to 195 degrees
    const isAlignmentValid = bodyAngle >= 165 && bodyAngle <= 195;

    if (!isAlignmentValid) {
      this.state.isHoldActive = false;
      this.lastValidTickMs = timestampMs;

      let faultMessage = 'Straighten your body into a flat line!';
      if (bodyAngle < 165) {
        faultMessage = 'Hips sagging! Tighten core and lift hips slightly.';
        activeJointColors[PoseLandmark.LEFT_HIP] = '#FF3B30';
        activeJointColors[PoseLandmark.RIGHT_HIP] = '#FF3B30';
      } else {
        faultMessage = 'Hips too high! Lower hips into neutral spine.';
        activeJointColors[PoseLandmark.LEFT_HIP] = '#FF9500';
        activeJointColors[PoseLandmark.RIGHT_HIP] = '#FF9500';
      }

      const fault: FormFault = {
        id: 'plank-alignment-fault',
        name: 'Plank Alignment Broken',
        correctionMessage: faultMessage,
        severity: 'CRITICAL_NO_REP',
        jointIndices: [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
        detectedAtTimestamp: timestampMs,
      };
      faultsToAlert.push(fault);
      coachingCue = faultMessage;
    } else {
      // Good plank posture!
      this.state.isHoldActive = true;
      activeJointColors[PoseLandmark.LEFT_HIP] = '#34C759';
      activeJointColors[PoseLandmark.RIGHT_HIP] = '#34C759';

      if (this.lastValidTickMs > 0) {
        const delta = timestampMs - this.lastValidTickMs;
        // Limit delta to 200ms to prevent huge jumps between frame drops
        if (delta > 0 && delta < 200) {
          this.accumulatedHoldMs += delta;
        }
      }
      this.lastValidTickMs = timestampMs;
      this.state.holdDurationSec = Math.floor(this.accumulatedHoldMs / 1000);
      coachingCue = `Holding strong: ${this.state.holdDurationSec}s`;
    }

    this.state.activeFaults = faultsToAlert;

    return {
      state: this.getState(),
      repCompleted: false,
      isValidRep: isAlignmentValid,
      coachingCue,
      faultsToAlert,
      skeletonJointColors: activeJointColors,
      skeletonBoneColors: activeBoneColors,
    };
  }
}
