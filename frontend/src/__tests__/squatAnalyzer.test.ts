import { SquatAnalyzer } from '../services/vision/analyzers/SquatAnalyzer';
import { Landmark3D, PoseLandmark } from '../services/vision/types';

function createMockSquatLandmarks(kneeAngleDeg: number, kneeValgus: boolean = false): Landmark3D[] {
  const landmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 1 }));

  // Shoulder coordinates
  landmarks[PoseLandmark.LEFT_SHOULDER] = { x: 0.45, y: 0.1, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_SHOULDER] = { x: 0.55, y: 0.1, visibility: 1 };

  // Hip coordinates (at y = 0.25)
  landmarks[PoseLandmark.LEFT_HIP] = { x: 0.45, y: 0.25, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_HIP] = { x: 0.55, y: 0.25, visibility: 1 };

  // Knees: if valgus, knees cave in to x = 0.49 and 0.51
  const leftKneeX = kneeValgus ? 0.49 : 0.45;
  const rightKneeX = kneeValgus ? 0.51 : 0.55;
  landmarks[PoseLandmark.LEFT_KNEE] = { x: leftKneeX, y: 0.5, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_KNEE] = { x: rightKneeX, y: 0.5, visibility: 1 };

  // Exact angle at knee:
  // Knee -> Hip vector is (0, -0.25) [-90 deg]
  // Knee -> Ankle vector at angle = -90 + kneeAngleDeg
  const rad = ((-90 + kneeAngleDeg) * Math.PI) / 180;
  const ankleDist = 0.25;
  const ankleOffsetX = ankleDist * Math.cos(rad);
  const ankleOffsetY = ankleDist * Math.sin(rad);

  // If testing valgus, ankles are planted at standard width (0.35 and 0.65)
  landmarks[PoseLandmark.LEFT_ANKLE] = {
    x: kneeValgus ? 0.35 : leftKneeX + ankleOffsetX,
    y: 0.5 + ankleOffsetY,
    visibility: 1,
  };
  landmarks[PoseLandmark.RIGHT_ANKLE] = {
    x: kneeValgus ? 0.65 : rightKneeX + ankleOffsetX,
    y: 0.5 + ankleOffsetY,
    visibility: 1,
  };

  return landmarks;
}

describe('SquatAnalyzer Biomechanics & No-Rep Logic', () => {
  let analyzer: SquatAnalyzer;

  beforeEach(() => {
    analyzer = new SquatAnalyzer();
  });

  test('Valid Squat: full depth counts 1 valid rep and 0 no-reps', () => {
    let t = 1000;

    // 1. Standing tall (170 deg)
    analyzer.processFrame(createMockSquatLandmarks(170), t += 100);
    expect(analyzer.getState().currentState).toBe('READY');

    // 2. Descending (130 deg)
    analyzer.processFrame(createMockSquatLandmarks(130), t += 100);
    expect(analyzer.getState().currentState).toBe('ECCENTRIC');

    // 3. Deep inflection at parallel / below parallel (88 deg)
    analyzer.processFrame(createMockSquatLandmarks(88), t += 100);
    expect(analyzer.getState().currentState).toBe('INFLECTION');

    // 4. Ascending (120 deg)
    analyzer.processFrame(createMockSquatLandmarks(120), t += 100);
    expect(analyzer.getState().currentState).toBe('CONCENTRIC');

    // 5. Standing lockout (165 deg)
    const result = analyzer.processFrame(createMockSquatLandmarks(165), t += 100);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(true);
    expect(analyzer.getState().validReps).toBe(1);
    expect(analyzer.getState().noReps).toBe(0);
  });

  test('Shallow Squat (Half Rep): rejected as NO-REP and count does not increment', () => {
    let t = 1000;

    // 1. Standing tall (170 deg)
    analyzer.processFrame(createMockSquatLandmarks(170), t += 100);

    // 2. Descending (135 deg)
    analyzer.processFrame(createMockSquatLandmarks(135), t += 100);

    // 3. Shallow inflection (115 deg) - DOES NOT REACH 95 deg
    analyzer.processFrame(createMockSquatLandmarks(115), t += 100);

    // 4. Early ascent (130 deg)
    analyzer.processFrame(createMockSquatLandmarks(130), t += 100);

    // 5. Standing lockout (165 deg)
    const result = analyzer.processFrame(createMockSquatLandmarks(165), t += 100);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(false);
    expect(analyzer.getState().validReps).toBe(0); // Valid rep did NOT increment!
    expect(analyzer.getState().noReps).toBe(1);    // Marked as No-rep
    expect(result.faultsToAlert.some(f => f.name.includes('Half Rep') || f.name.includes('Shallow'))).toBe(true);
  });

  test('Knee Cave Fault: detects valgus and rejects rep', () => {
    let t = 1000;

    // Standing
    analyzer.processFrame(createMockSquatLandmarks(170), t += 100);
    // Descending with knees caved in
    const frameResult = analyzer.processFrame(createMockSquatLandmarks(120, true), t += 100);

    expect(frameResult.faultsToAlert.some(f => f.name.includes('Valgus') || f.name.includes('Knee Cave'))).toBe(true);
  });

  test('Face only in frame: legs not visible sets NOT_IN_FRAME and counts 0 reps', () => {
    const faceOnlyLandmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.1 }));
    faceOnlyLandmarks[PoseLandmark.NOSE] = { x: 0.5, y: 0.2, visibility: 0.95 };

    const result = analyzer.processFrame(faceOnlyLandmarks, 1000);
    expect(result.repCompleted).toBe(false);
    expect(analyzer.getState().currentState).toBe('NOT_IN_FRAME');
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(0);
  });
});
