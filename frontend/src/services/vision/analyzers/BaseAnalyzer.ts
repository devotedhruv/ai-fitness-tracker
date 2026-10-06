import {
  Landmark3D,
  ExerciseTrackerState,
  FrameAnalysisResult,
  FormFault,
  RepState,
  CompletedRepData,
  TrajectoryPoint,
  SetPerformanceReport,
} from '../types';

export abstract class BaseAnalyzer {
  protected state: ExerciseTrackerState;
  protected currentRepFaults: FormFault[] = [];
  protected repStartTimeMs: number = 0;
  protected lastRepEndTimeMs: number = 0;
  protected minAngleInCurrentRep: number = 999;
  protected maxAngleInCurrentRep: number = 0;
  protected repDurations: number[] = [];
  protected interRepRests: number[] = [];
  protected trajectoryHistory: TrajectoryPoint[] = [];

  constructor(exerciseId: string, exerciseName: string, targetInflection: number, targetLockout: number) {
    this.state = {
      exerciseId,
      exerciseName,
      validReps: 0,
      noReps: 0,
      currentState: 'READY',
      currentPrimaryAngle: 180,
      targetInflectionAngle: targetInflection,
      targetLockoutAngle: targetLockout,
      activeFaults: [],
      recentHistory: [],
      overallFormScore: 100,
      trajectoryHistory: [],
    };
  }

  public getState(): ExerciseTrackerState {
    return { ...this.state };
  }

  public setCustomExerciseName(name: string): void {
    this.state.exerciseName = name;
  }

  public reset(): void {
    this.state.validReps = 0;
    this.state.noReps = 0;
    this.state.currentState = 'READY';
    this.state.activeFaults = [];
    this.state.recentHistory = [];
    this.state.overallFormScore = 100;
    this.currentRepFaults = [];
    this.repStartTimeMs = 0;
    this.lastRepEndTimeMs = 0;
    this.repDurations = [];
    this.interRepRests = [];
    this.trajectoryHistory = [];
    this.state.trajectoryHistory = [];
    this.state.currentRepDurationMs = undefined;
    this.state.setPerformanceReport = undefined;
  }

  public abstract processFrame(landmarks: Landmark3D[], timestampMs: number): FrameAnalysisResult;

  /**
   * Records a point along the athlete's primary vertical movement trajectory (head/bar).
   */
  protected recordTrajectoryPoint(timestampMs: number, y: number, isPeak: boolean = false): void {
    this.trajectoryHistory.push({
      timestampMs,
      y: Math.round(y * 1000) / 1000,
      state: this.state.currentState,
      isPeak,
    });
    if (this.trajectoryHistory.length > 120) {
      this.trajectoryHistory.shift();
    }
    this.state.trajectoryHistory = this.trajectoryHistory;
  }

  /**
   * Computes the complete performance report matching the YOLO26 CV analytics:
   * Total reps, average duration, fastest/slowest rep, rest intervals, and fatigue decay.
   */
  public getSetPerformanceReport(): SetPerformanceReport {
    const totalValidReps = this.state.validReps;
    const totalNoReps = this.state.noReps;

    if (this.repDurations.length === 0) {
      return {
        totalValidReps,
        totalNoReps,
        avgRepDurationMs: 0,
        fastestRepMs: 0,
        fastestRepNumber: 0,
        slowestRepMs: 0,
        slowestRepNumber: 0,
        avgRestBetweenRepsMs: 0,
        fatigueLossPercent: 0,
        repDurations: [],
        interRepRests: [],
      };
    }

    const sumDuration = this.repDurations.reduce((acc, d) => acc + d, 0);
    const avgRepDurationMs = Math.round(sumDuration / this.repDurations.length);

    let fastestRepMs = this.repDurations[0];
    let fastestRepNumber = 1;
    let slowestRepMs = this.repDurations[0];
    let slowestRepNumber = 1;

    for (let i = 0; i < this.repDurations.length; i++) {
      const dur = this.repDurations[i];
      if (dur < fastestRepMs) {
        fastestRepMs = dur;
        fastestRepNumber = i + 1;
      }
      if (dur > slowestRepMs) {
        slowestRepMs = dur;
        slowestRepNumber = i + 1;
      }
    }

    const avgRestBetweenRepsMs = this.interRepRests.length > 0
      ? Math.round(this.interRepRests.reduce((a, b) => a + b, 0) / this.interRepRests.length)
      : 0;

    // Fatigue drop-off (% difference from fastest to slowest rep)
    const fatigueLossPercent = fastestRepMs > 0
      ? Math.max(0, Math.round(((slowestRepMs - fastestRepMs) / fastestRepMs) * 100))
      : 0;

    return {
      totalValidReps,
      totalNoReps,
      avgRepDurationMs,
      fastestRepMs,
      fastestRepNumber,
      slowestRepMs,
      slowestRepNumber,
      avgRestBetweenRepsMs,
      fatigueLossPercent,
      repDurations: [...this.repDurations],
      interRepRests: [...this.interRepRests],
    };
  }

  /**
   * Helper to finish a rep, record stats, evaluate faults, and update scores.
   */
  protected completeRep(timestampMs: number, customFaults: FormFault[] = []): { isValid: boolean; faults: FormFault[] } {
    const combinedFaults = [...this.currentRepFaults, ...customFaults];
    // Deduplicate faults by name
    const uniqueFaults = Array.from(new Map(combinedFaults.map(f => [f.name, f])).values());
    const isValid = uniqueFaults.length === 0;

    const durationMs = this.repStartTimeMs > 0 ? timestampMs - this.repStartTimeMs : 1500;
    const timeSinceLastRepMs = this.lastRepEndTimeMs > 0
      ? Math.max(0, this.repStartTimeMs - this.lastRepEndTimeMs)
      : 0;

    this.repDurations.push(durationMs);
    if (this.lastRepEndTimeMs > 0 && timeSinceLastRepMs > 0) {
      this.interRepRests.push(timeSinceLastRepMs);
    }
    this.lastRepEndTimeMs = timestampMs;

    const formScore = isValid ? 100 : Math.max(30, 100 - uniqueFaults.length * 35);

    if (isValid) {
      this.state.validReps += 1;
    } else {
      this.state.noReps += 1;
    }

    const repData: CompletedRepData = {
      repNumber: this.state.validReps + this.state.noReps,
      isValid,
      minAngle: this.minAngleInCurrentRep,
      maxAngle: this.maxAngleInCurrentRep,
      durationMs,
      timeSinceLastRepMs,
      faults: uniqueFaults,
      formScore,
    };

    this.state.recentHistory.unshift(repData);
    if (this.state.recentHistory.length > 20) {
      this.state.recentHistory.pop();
    }

    // Recalculate average form score
    const totalScore = this.state.recentHistory.reduce((acc, r) => acc + r.formScore, 0);
    this.state.overallFormScore = Math.round(totalScore / this.state.recentHistory.length);

    // Update performance report
    this.state.setPerformanceReport = this.getSetPerformanceReport();

    // Reset tracking for next rep
    this.currentRepFaults = [];
    this.minAngleInCurrentRep = 999;
    this.maxAngleInCurrentRep = 0;
    this.repStartTimeMs = 0;
    this.state.currentState = 'READY';
    this.state.currentRepDurationMs = undefined;

    return { isValid, faults: uniqueFaults };
  }
}
