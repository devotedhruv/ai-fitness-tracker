export interface BarbellPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface RepVelocityMetrics {
  repNumber: number;
  peakVelocityMps: number;
  meanConcentricVelocityMps: number;
  velocityLossPercent: number;
  durationMs: number;
}

export class VelocityTracker {
  private barPath: BarbellPoint[] = [];
  private repVelocities: RepVelocityMetrics[] = [];
  private firstRepMeanVelocity: number | null = null;
  private isConcentric: boolean = false;
  private concentricPoints: BarbellPoint[] = [];

  // Estimated athlete torso/arm pixel-to-meter scaling factor
  private pixelToMeterRatio: number = 0.003; 

  public setCalibrationRatio(ratio: number) {
    if (ratio > 0) this.pixelToMeterRatio = ratio;
  }

  public recordPoint(x: number, y: number, timestamp: number = Date.now()) {
    const point: BarbellPoint = { x, y, timestamp };
    this.barPath.push(point);
    if (this.barPath.length > 120) {
      this.barPath.shift();
    }

    if (this.isConcentric) {
      this.concentricPoints.push(point);
    }
  }

  public startConcentricPhase() {
    this.isConcentric = true;
    this.concentricPoints = [];
  }

  public completeRepConcentric(repNumber: number): RepVelocityMetrics | null {
    this.isConcentric = false;
    if (this.concentricPoints.length < 2) return null;

    let peakVelocity = 0;
    let totalVelocity = 0;
    let validDeltas = 0;

    for (let i = 1; i < this.concentricPoints.length; i++) {
      const p1 = this.concentricPoints[i - 1];
      const p2 = this.concentricPoints[i];
      const dt = (p2.timestamp - p1.timestamp) / 1000;

      if (dt > 0.005) {
        // In screen coordinates, y decreases going upwards (concentric push)
        const dy = Math.abs(p1.y - p2.y);
        // If dy > 1.0, coords are raw screen pixels; if dy <= 1.0, coords are normalized [0, 1]
        const dyMeters = dy > 1.0 ? dy * this.pixelToMeterRatio : dy * 2.2;
        const v = dyMeters / dt;

        if (v > peakVelocity && v < 4.0) { // filter noise > 4m/s
          peakVelocity = v;
        }
        if (v < 4.0) {
          totalVelocity += v;
          validDeltas++;
        }
      }
    }

    const meanVelocity = validDeltas > 0 ? totalVelocity / validDeltas : peakVelocity * 0.7;
    const pStart = this.concentricPoints[0];
    const pEnd = this.concentricPoints[this.concentricPoints.length - 1];
    const durationMs = pEnd.timestamp - pStart.timestamp;

    if (this.firstRepMeanVelocity === null && meanVelocity > 0) {
      this.firstRepMeanVelocity = meanVelocity;
    }

    let lossPercent = 0;
    if (this.firstRepMeanVelocity && this.firstRepMeanVelocity > 0) {
      lossPercent = Math.max(
        0,
        Math.round(((this.firstRepMeanVelocity - meanVelocity) / this.firstRepMeanVelocity) * 100)
      );
    }

    const metrics: RepVelocityMetrics = {
      repNumber,
      peakVelocityMps: Math.round(peakVelocity * 100) / 100,
      meanConcentricVelocityMps: Math.round(meanVelocity * 100) / 100,
      velocityLossPercent: lossPercent,
      durationMs,
    };

    this.repVelocities.push(metrics);
    return metrics;
  }

  public getBarPath(): BarbellPoint[] {
    return this.barPath;
  }

  public getRecentVelocities(): RepVelocityMetrics[] {
    return this.repVelocities;
  }

  public reset() {
    this.barPath = [];
    this.repVelocities = [];
    this.firstRepMeanVelocity = null;
    this.isConcentric = false;
    this.concentricPoints = [];
  }
}
