import { LandmarkSmoother } from '../services/vision/filters/LandmarkSmoother';
import { Landmark3D } from '../services/vision/types';

describe('LandmarkSmoother Keypoint Filter', () => {
  let smoother: LandmarkSmoother;

  beforeEach(() => {
    smoother = new LandmarkSmoother();
  });

  test('Smooths micro-jitter on static landmarks', () => {
    const baseLandmarks: Landmark3D[] = [
      { x: 0.500, y: 0.500, visibility: 0.95 },
      { x: 0.300, y: 0.400, visibility: 0.90 },
    ];

    // Initialize smoother with base frame
    smoother.smooth(baseLandmarks);

    // Frame with sensor jitter (+0.004 in X)
    const jitteredLandmarks: Landmark3D[] = [
      { x: 0.504, y: 0.501, visibility: 0.95 },
      { x: 0.302, y: 0.403, visibility: 0.90 },
    ];

    const smoothed = smoother.smooth(jitteredLandmarks);

    // Filter should dampen the micro-jitter (between 0.500 and 0.504, closer to 0.5016)
    expect(smoothed[0].x).toBeGreaterThan(0.500);
    expect(smoothed[0].x).toBeLessThan(0.503);
  });

  test('Maintains high responsiveness for fast intentional movement', () => {
    const baseLandmarks: Landmark3D[] = [
      { x: 0.500, y: 0.500, visibility: 0.95 },
    ];
    smoother.smooth(baseLandmarks);

    // Fast explosive pull-up ascent (large displacement deltaY = -0.15)
    const fastMoveLandmarks: Landmark3D[] = [
      { x: 0.500, y: 0.350, visibility: 0.95 },
    ];

    const smoothed = smoother.smooth(fastMoveLandmarks);

    // Adaptive alpha increases during fast motion, keeping responsiveness high
    expect(smoothed[0].y).toBeLessThan(0.385);
  });

  test('Gracefully passes through low-confidence landmarks', () => {
    const lowConfLandmarks: Landmark3D[] = [
      { x: 0.500, y: 0.500, visibility: 0.10 },
    ];

    const result = smoother.smooth(lowConfLandmarks);
    expect(result[0].visibility).toBe(0.10);
  });

  test('Resets cleanly when reset() is invoked', () => {
    smoother.smooth([{ x: 0.2, y: 0.2, visibility: 0.9 }]);
    smoother.reset();

    const fresh = smoother.smooth([{ x: 0.8, y: 0.8, visibility: 0.9 }]);
    expect(fresh[0].x).toBe(0.8);
    expect(fresh[0].y).toBe(0.8);
  });
});
