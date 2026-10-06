import { Landmark3D } from '../types';

export interface SmootherOptions {
  minAlpha?: number;   // smoothing factor for near-static positions (default 0.4)
  maxAlpha?: number;   // smoothing factor for rapid movement (default 0.85)
  velocityCutoff?: number; // threshold to scale between min and max alpha (default 0.015)
}

/**
 * Velocity-adaptive exponential smoothing filter for 3D body keypoints.
 * Eliminates high-frequency webcam sensor jitter while preserving instantaneous
 * responsiveness during fast athletic reversals.
 */
export class LandmarkSmoother {
  private previousLandmarks: (Landmark3D | null)[] = [];
  private minAlpha: number;
  private maxAlpha: number;
  private velocityCutoff: number;

  constructor(options: SmootherOptions = {}) {
    this.minAlpha = options.minAlpha ?? 0.4;
    this.maxAlpha = options.maxAlpha ?? 0.85;
    this.velocityCutoff = options.velocityCutoff ?? 0.015;
  }

  public reset(): void {
    this.previousLandmarks = [];
  }

  public smooth(landmarks: Landmark3D[]): Landmark3D[] {
    if (!landmarks || landmarks.length === 0) {
      return [];
    }

    const smoothed: Landmark3D[] = [];

    for (let i = 0; i < landmarks.length; i++) {
      const current = landmarks[i];
      if (!current) {
        smoothed.push(current);
        continue;
      }

      const prev = this.previousLandmarks[i];

      // If no history or current confidence is too low, initialize directly
      if (!prev || (current.visibility ?? 1) < 0.25) {
        smoothed.push({ ...current });
        this.previousLandmarks[i] = { ...current };
        continue;
      }

      // Compute frame-to-frame displacement in normalized coordinates
      const dx = current.x - prev.x;
      const dy = current.y - prev.y;
      const distance = Math.hypot(dx, dy);

      // Adaptive alpha: for tiny movements (noise), alpha -> minAlpha; for large movements, alpha -> maxAlpha
      const t = Math.min(1, Math.max(0, distance / this.velocityCutoff));
      const alpha = this.minAlpha + t * (this.maxAlpha - this.minAlpha);

      const smoothX = prev.x + alpha * (current.x - prev.x);
      const smoothY = prev.y + alpha * (current.y - prev.y);
      const smoothZ = (current.z !== undefined && prev.z !== undefined)
        ? prev.z + alpha * (current.z - prev.z)
        : current.z;

      const resultPoint: Landmark3D = {
        x: Math.round(smoothX * 10000) / 10000,
        y: Math.round(smoothY * 10000) / 10000,
        z: smoothZ !== undefined ? Math.round(smoothZ * 10000) / 10000 : undefined,
        visibility: current.visibility,
      };

      smoothed.push(resultPoint);
      this.previousLandmarks[i] = resultPoint;
    }

    return smoothed;
  }
}
