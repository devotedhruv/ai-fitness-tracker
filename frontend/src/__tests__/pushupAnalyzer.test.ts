import { PushupAnalyzer } from '../services/vision/analyzers/PushupAnalyzer';
import { Landmark3D, PoseLandmark } from '../services/vision/types';

function createMockPushupLandmarks(elbowAngleDeg: number, hipSag: boolean = false): Landmark3D[] {
  const landmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 1 }));

  // Shoulder coordinates
  landmarks[PoseLandmark.LEFT_SHOULDER] = { x: 0.3, y: 0.2, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_SHOULDER] = { x: 0.3, y: 0.2, visibility: 1 };

  // Elbow at (0.3, 0.5)
  landmarks[PoseLandmark.LEFT_ELBOW] = { x: 0.3, y: 0.5, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_ELBOW] = { x: 0.3, y: 0.5, visibility: 1 };

  // Exact elbow angle: Elbow -> Shoulder is (0, -0.3) [-90 deg]
  // Elbow -> Wrist vector at angle = -90 + elbowAngleDeg
  const rad = ((-90 + elbowAngleDeg) * Math.PI) / 180;
  const wristX = 0.3 + 0.3 * Math.cos(rad);
  const wristY = 0.5 + 0.3 * Math.sin(rad);

  landmarks[PoseLandmark.LEFT_WRIST] = { x: wristX, y: wristY, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_WRIST] = { x: wristX, y: wristY, visibility: 1 };

  // Body alignment: Shoulder(0.3, 0.2) -> Hip(0.6, hipY) -> Ankle(0.9, 0.2)
  // When hipY = 0.2, perfectly straight (180 deg)
  // When hip sag, hipY drops (e.g. 0.38) creating an angle < 155 deg
  const hipY = hipSag ? 0.38 : 0.2;
  landmarks[PoseLandmark.LEFT_HIP] = { x: 0.6, y: hipY, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_HIP] = { x: 0.6, y: hipY, visibility: 1 };

  landmarks[PoseLandmark.LEFT_ANKLE] = { x: 0.9, y: 0.2, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_ANKLE] = { x: 0.9, y: 0.2, visibility: 1 };

  return landmarks;
}

describe('PushupAnalyzer Biomechanics & No-Rep Logic', () => {
  let analyzer: PushupAnalyzer;

  beforeEach(() => {
    analyzer = new PushupAnalyzer();
  });

  test('Valid Push-up: clean 85-degree depth and lockout counts 1 rep', () => {
    let t = 1000;

    // 1. Plank top lockout (165 deg)
    analyzer.processFrame(createMockPushupLandmarks(165), t += 100);
    expect(analyzer.getState().currentState).toBe('READY');

    // 2. Descending (130 deg)
    analyzer.processFrame(createMockPushupLandmarks(130), t += 100);
    expect(analyzer.getState().currentState).toBe('ECCENTRIC');

    // 3. Deep inflection at chest down (85 deg <= 90 target)
    analyzer.processFrame(createMockPushupLandmarks(85), t += 100);
    expect(analyzer.getState().currentState).toBe('INFLECTION');

    // 4. Ascending (120 deg)
    analyzer.processFrame(createMockPushupLandmarks(120), t += 100);
    expect(analyzer.getState().currentState).toBe('CONCENTRIC');

    // 5. Full lockout (165 deg)
    const result = analyzer.processFrame(createMockPushupLandmarks(165), t += 100);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(true);
    expect(analyzer.getState().validReps).toBe(1);
    expect(analyzer.getState().noReps).toBe(0);
  });

  test('Push-up with Sagging Hips: detected and rejected as NO-REP', () => {
    let t = 1000;

    // 1. Ready
    analyzer.processFrame(createMockPushupLandmarks(165), t += 100);

    // 2. Descending with lower back sagging
    const frameResult = analyzer.processFrame(createMockPushupLandmarks(120, true), t += 100);
    expect(frameResult.faultsToAlert.some(f => f.name.includes('Sagging'))).toBe(true);

    // 3. Deep inflection
    analyzer.processFrame(createMockPushupLandmarks(85, true), t += 100);

    // 4. Ascending
    analyzer.processFrame(createMockPushupLandmarks(125, false), t += 100);

    // 5. Returning to top lockout
    const result = analyzer.processFrame(createMockPushupLandmarks(165, false), t += 100);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(false); // Rep rejected!
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(1);
  });

  test('Shallow Push-up (Half Rep): only bending elbows to 110 deg is rejected', () => {
    let t = 1000;

    analyzer.processFrame(createMockPushupLandmarks(165), t += 100);
    analyzer.processFrame(createMockPushupLandmarks(135), t += 100);
    // Did not reach 90 degrees
    analyzer.processFrame(createMockPushupLandmarks(110), t += 100);
    // Ascending
    analyzer.processFrame(createMockPushupLandmarks(130), t += 100);
    // Lockout
    const result = analyzer.processFrame(createMockPushupLandmarks(165), t += 100);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(false);
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(1);
  });

  test('Face only in frame: arms not visible sets NOT_IN_FRAME and counts 0 reps', () => {
    // Only nose/face has visibility, elbows and wrists are out of frame (visibility: 0.1)
    const faceOnlyLandmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.1 }));
    faceOnlyLandmarks[PoseLandmark.NOSE] = { x: 0.5, y: 0.2, visibility: 0.95 };

    const result = analyzer.processFrame(faceOnlyLandmarks, 1000);
    expect(result.repCompleted).toBe(false);
    expect(analyzer.getState().currentState).toBe('NOT_IN_FRAME');
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(0);
  });

  test('Jitter rejection: micro movements with insufficient ROM (<30 deg) do not trigger reps', () => {
    let t = 1000;
    analyzer.processFrame(createMockPushupLandmarks(165), t += 100);
    // Slight jitter to 150 deg then back to 165
    analyzer.processFrame(createMockPushupLandmarks(150), t += 100);
    const result = analyzer.processFrame(createMockPushupLandmarks(165), t += 100);

    expect(result.repCompleted).toBe(false);
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(0);
  });
});
