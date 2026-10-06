import { Landmark3D } from './types';

/**
 * Calculates the internal angle at joint `b` formed by line segments ba and bc in degrees [0, 180].
 * @param a First point (e.g., Hip)
 * @param b Vertex point where the angle is measured (e.g., Knee)
 * @param c Third point (e.g., Ankle)
 */
export function calculateAngle(a: Landmark3D, b: Landmark3D, c: Landmark3D): number {
  if (!a || !b || !c) return 0;

  // Vectors ba and bc
  const baX = a.x - b.x;
  const baY = a.y - b.y;
  const bcX = c.x - b.x;
  const bcY = c.y - b.y;

  // Dot product
  const dot = baX * bcX + baY * bcY;

  // Magnitudes
  const magBA = Math.sqrt(baX * baX + baY * baY);
  const magBC = Math.sqrt(bcX * bcX + bcY * bcY);

  if (magBA === 0 || magBC === 0) return 0;

  // Cosine angle clamped to valid domain [-1, 1] to avoid NaN
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  const angleRad = Math.acos(cosAngle);

  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Calculates the angle of segment a-b relative to the vertical axis (e.g. for torso angle).
 * 0 degrees = perfectly vertical.
 */
export function calculateAngleWithVertical(a: Landmark3D, b: Landmark3D): number {
  if (!a || !b) return 0;
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);

  if (dy === 0) return 90;
  const rad = Math.atan2(dx, dy);
  return Math.round((rad * 180) / Math.PI);
}

/**
 * Euclidean distance in 2D normalized space.
 */
export function euclideanDistance2D(a: Landmark3D, b: Landmark3D): number {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes the midpoint between two landmarks (e.g., center of hips or shoulders).
 */
export function midpoint(a: Landmark3D, b: Landmark3D): Landmark3D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

/**
 * Exponential Moving Average (EMA) smoothing filter to eliminate frame-to-frame landmark jitter.
 * @param current Current frame's raw landmarks
 * @param previous Previous frame's smoothed landmarks
 * @param alpha Smoothing factor (0 = keep previous, 1 = use only current). Default 0.65.
 */
export function smoothLandmarks(
  current: Landmark3D[],
  previous: Landmark3D[] | null,
  alpha: number = 0.65
): Landmark3D[] {
  if (!previous || previous.length !== current.length) {
    return current;
  }

  return current.map((curr, i) => {
    const prev = previous[i];
    return {
      x: alpha * curr.x + (1 - alpha) * prev.x,
      y: alpha * curr.y + (1 - alpha) * prev.y,
      z: curr.z !== undefined && prev.z !== undefined
        ? alpha * curr.z + (1 - alpha) * prev.z
        : curr.z,
      visibility: curr.visibility,
    };
  });
}
