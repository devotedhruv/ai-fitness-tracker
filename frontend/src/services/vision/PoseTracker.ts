import { BaseAnalyzer } from './analyzers/BaseAnalyzer';
import { SquatAnalyzer } from './analyzers/SquatAnalyzer';
import { PushupAnalyzer } from './analyzers/PushupAnalyzer';
import { PullupAnalyzer } from './analyzers/PullupAnalyzer';
import { BicepCurlAnalyzer } from './analyzers/BicepCurlAnalyzer';
import { PlankAnalyzer } from './analyzers/PlankAnalyzer';
import {
  Landmark3D,
  FrameAnalysisResult,
  ExerciseTrackerState,
  PoseLandmark,
  RepState,
} from './types';
import { VelocityTracker, BarbellPoint, RepVelocityMetrics } from './analyzers/VelocityTracker';
import { smoothLandmarks } from './geometry';
import { LandmarkSmoother } from './filters/LandmarkSmoother';
import { audioCoach } from './audioCoach';

export type SupportedExerciseType = 'squat' | 'pushup' | 'pullup' | 'bicep_curl' | 'plank';

export function resolveExercisePattern(
  exerciseName?: string,
  primaryMuscle?: string
): SupportedExerciseType {
  const name = (exerciseName || '').toLowerCase();
  const muscle = (primaryMuscle || '').toUpperCase();

  // Bicep curls
  if (name.includes('curl') || muscle === 'BICEPS') {
    return 'bicep_curl';
  }

  // Squat / Lower body / Deadlift movements
  if (
    name.includes('squat') ||
    name.includes('lunge') ||
    name.includes('deadlift') ||
    name.includes('calf') ||
    name.includes('glute') ||
    name.includes('leg') ||
    muscle === 'LEGS' ||
    muscle === 'GLUTES'
  ) {
    return 'squat';
  }

  // Pulling movements
  if (
    name.includes('pull') ||
    name.includes('row') ||
    name.includes('chin') ||
    name.includes('lat') ||
    muscle === 'BACK'
  ) {
    return 'pullup';
  }

  // Core / Isometric holds
  if (
    name.includes('plank') ||
    name.includes('hold') ||
    name.includes('hollow') ||
    name.includes('deadbug') ||
    name.includes('l-sit') ||
    muscle === 'CORE'
  ) {
    return 'plank';
  }

  // Pressing movements (Bench Press, Push-up, Dips, Overhead Press)
  return 'pushup';
}

export class PoseTracker {
  private analyzer: BaseAnalyzer;
  private previousLandmarks: Landmark3D[] | null = null;
  private listeners: ((result: FrameAnalysisResult) => void)[] = [];
  private currentExerciseType: SupportedExerciseType;
  private velocityTracker: VelocityTracker = new VelocityTracker();
  private landmarkSmoother: LandmarkSmoother = new LandmarkSmoother();
  private previousRepState: RepState = 'READY';

  constructor(exerciseType: SupportedExerciseType = 'squat', customName?: string) {
    this.currentExerciseType = exerciseType;
    this.analyzer = this.createAnalyzer(exerciseType);
    if (customName) {
      this.analyzer.setCustomExerciseName(customName);
    }
  }

  private createAnalyzer(exerciseType: SupportedExerciseType): BaseAnalyzer {
    switch (exerciseType) {
      case 'squat':
        return new SquatAnalyzer();
      case 'pushup':
        return new PushupAnalyzer();
      case 'pullup':
        return new PullupAnalyzer();
      case 'bicep_curl':
        return new BicepCurlAnalyzer();
      case 'plank':
        return new PlankAnalyzer();
      default:
        return new SquatAnalyzer();
    }
  }

  public setExercise(exerciseType: SupportedExerciseType, customName?: string) {
    this.currentExerciseType = exerciseType;
    this.analyzer = this.createAnalyzer(exerciseType);
    if (customName) {
      this.analyzer.setCustomExerciseName(customName);
    }
    this.previousLandmarks = null;
    this.velocityTracker.reset();
    this.previousRepState = 'READY';
    const displayName = customName || this.analyzer.getState().exerciseName;
    audioCoach.speak(`Ready for ${displayName}. Get in position.`);
  }

  public setCustomExercise(exerciseName: string, primaryMuscle?: string) {
    const pattern = resolveExercisePattern(exerciseName, primaryMuscle);
    this.setExercise(pattern, exerciseName);
  }

  public getExerciseType(): SupportedExerciseType {
    return this.currentExerciseType;
  }

  public getState(): ExerciseTrackerState {
    const st = this.analyzer.getState();
    st.barPath = this.velocityTracker.getBarPath();
    const recentVels = this.velocityTracker.getRecentVelocities();
    if (recentVels.length > 0) {
      st.latestVelocity = recentVels[recentVels.length - 1];
    }
    return st;
  }

  public getVelocityTracker(): VelocityTracker {
    return this.velocityTracker;
  }

  public getAnalyzer(): BaseAnalyzer {
    return this.analyzer;
  }

  public setManualReferenceLineY(y: number): void {
    if (this.analyzer instanceof PullupAnalyzer) {
      this.analyzer.setManualReferenceLineY(y);
    }
  }

  public reset() {
    this.analyzer.reset();
    this.previousLandmarks = null;
    this.velocityTracker.reset();
    this.landmarkSmoother.reset();
    this.previousRepState = 'READY';
  }

  public addListener(callback: (result: FrameAnalysisResult) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public onNewFrame(rawLandmarks: Landmark3D[], timestampMs: number = Date.now()): FrameAnalysisResult {
    // 1. Apply adaptive keypoint smoothing (eliminates micro-jitter)
    const smoothed = this.landmarkSmoother.smooth(rawLandmarks);
    this.previousLandmarks = smoothed;

    // 2. Bar path coordinate recording (if applicable for non-isometric exercises)
    if (smoothed.length > PoseLandmark.RIGHT_SHOULDER && this.currentExerciseType !== 'plank') {
      let trackPoint: Landmark3D | null = null;
      if (this.currentExerciseType === 'squat' || this.currentExerciseType === 'pullup') {
        const ls = smoothed[PoseLandmark.LEFT_SHOULDER];
        const rs = smoothed[PoseLandmark.RIGHT_SHOULDER];
        if (ls && rs && (ls.visibility ?? 1) > 0.35 && (rs.visibility ?? 1) > 0.35) {
          trackPoint = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
        }
      } else if (this.currentExerciseType === 'pushup' || this.currentExerciseType === 'bicep_curl') {
        const lw = smoothed[PoseLandmark.LEFT_WRIST];
        const rw = smoothed[PoseLandmark.RIGHT_WRIST];
        if (lw && rw && (lw.visibility ?? 1) > 0.35 && (rw.visibility ?? 1) > 0.35) {
          trackPoint = { x: (lw.x + rw.x) / 2, y: (lw.y + rw.y) / 2 };
        } else if (lw && (lw.visibility ?? 1) > 0.35) {
          trackPoint = lw;
        } else if (rw && (rw.visibility ?? 1) > 0.35) {
          trackPoint = rw;
        }
      }

      if (trackPoint) {
        this.velocityTracker.recordPoint(trackPoint.x, trackPoint.y, timestampMs);
      }
    }

    // 3. Process frame with biomechanical analyzer
    const result = this.analyzer.processFrame(smoothed, timestampMs);

    // 4. Concentric phase & Velocity Based Training (VBT) tracking
    if (result.state.currentState === 'CONCENTRIC' && this.previousRepState !== 'CONCENTRIC') {
      this.velocityTracker.startConcentricPhase();
    }

    if (result.repCompleted) {
      const repNum = result.state.validReps + result.state.noReps;
      const metrics = this.velocityTracker.completeRepConcentric(repNum);
      if (metrics) {
        result.latestVelocity = metrics;
        result.state.latestVelocity = metrics;
        if (result.state.recentHistory.length > 0) {
          result.state.recentHistory[0].velocityMetrics = metrics;
        }
      }
    }

    // Attach latest bar path & velocity
    result.barPath = this.velocityTracker.getBarPath();
    result.state.barPath = result.barPath;
    const allVelocities = this.velocityTracker.getRecentVelocities();
    if (allVelocities.length > 0 && !result.latestVelocity) {
      result.latestVelocity = allVelocities[allVelocities.length - 1];
      result.state.latestVelocity = result.latestVelocity;
    }

    this.previousRepState = result.state.currentState;

    // 5. Audio & Haptic triggers
    if (result.repCompleted) {
      if (result.isValidRep) {
        audioCoach.notifyRepSuccess(result.state.validReps);
      } else {
        const faultMsg = result.faultsToAlert.length > 0
          ? result.faultsToAlert[0].correctionMessage
          : 'Check your form';
        audioCoach.notifyFault(faultMsg);
      }
    } else if (result.faultsToAlert.length > 0 && result.faultsToAlert[0].severity === 'CRITICAL_NO_REP') {
      // Real-time warning while doing the rep
      audioCoach.speak(result.faultsToAlert[0].correctionMessage);
    }

    // 6. Notify UI subscribers
    for (const listener of this.listeners) {
      listener(result);
    }

    return result;
  }
}
