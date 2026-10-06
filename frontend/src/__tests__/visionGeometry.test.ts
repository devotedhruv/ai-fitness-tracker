import { calculateAngle, calculateAngleWithVertical, smoothLandmarks } from '../services/vision/geometry';
import { Landmark3D } from '../services/vision/types';

describe('Vision Geometry & Vector Math', () => {
  test('calculateAngle accurately measures 90-degree right angle', () => {
    const a: Landmark3D = { x: 0, y: 1 };
    const b: Landmark3D = { x: 0, y: 0 }; // vertex
    const c: Landmark3D = { x: 1, y: 0 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBe(90);
  });

  test('calculateAngle accurately measures 180-degree straight line', () => {
    const a: Landmark3D = { x: 0, y: -1 };
    const b: Landmark3D = { x: 0, y: 0 }; // vertex
    const c: Landmark3D = { x: 0, y: 1 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBe(180);
  });

  test('calculateAngle accurately measures 45-degree angle', () => {
    const a: Landmark3D = { x: 1, y: 0 };
    const b: Landmark3D = { x: 0, y: 0 }; // vertex
    const c: Landmark3D = { x: 1, y: 1 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBe(45);
  });

  test('calculateAngleWithVertical calculates tilt correctly', () => {
    const top: Landmark3D = { x: 0, y: 0 };
    const bottom: Landmark3D = { x: 0, y: 10 };

    const angle = calculateAngleWithVertical(top, bottom);
    expect(angle).toBe(0); // perfectly vertical
  });

  test('smoothLandmarks eliminates single-frame jitter via EMA', () => {
    const previous: Landmark3D[] = [{ x: 10, y: 10 }];
    const jitteredCurrent: Landmark3D[] = [{ x: 20, y: 20 }];

    // Alpha 0.5 means (10 + 20) / 2 = 15
    const smoothed = smoothLandmarks(jitteredCurrent, previous, 0.5);
    expect(smoothed[0].x).toBe(15);
    expect(smoothed[0].y).toBe(15);
  });
});
