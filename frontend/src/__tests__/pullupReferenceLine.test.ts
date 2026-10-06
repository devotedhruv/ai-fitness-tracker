import { PullupAnalyzer } from '../services/vision/analyzers/PullupAnalyzer';
import { Landmark3D, PoseLandmark } from '../services/vision/types';

function createMockPullupLandmarks(
  elbowAngleDeg: number,
  noseY: number,
  barY: number = 0.15
): Landmark3D[] {
  const landmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 1 }));

  // Wrists on the bar
  landmarks[PoseLandmark.LEFT_WRIST] = { x: 0.40, y: barY, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_WRIST] = { x: 0.60, y: barY, visibility: 1 };

  // Elbows at vertex
  const elbowY = barY + 0.25;
  landmarks[PoseLandmark.LEFT_ELBOW] = { x: 0.40, y: elbowY, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_ELBOW] = { x: 0.60, y: elbowY, visibility: 1 };

  // Elbow -> Wrist vector is (0, -0.25) [-90 deg]
  // Elbow -> Shoulder vector is at angle (-90 + elbowAngleDeg)
  const rad = ((-90 + elbowAngleDeg) * Math.PI) / 180;
  const shoulderDist = 0.25;
  const shoulderOffsetY = shoulderDist * Math.sin(rad);
  const leftShoulderOffsetX = shoulderDist * Math.cos(rad);

  landmarks[PoseLandmark.LEFT_SHOULDER] = {
    x: 0.40 + leftShoulderOffsetX,
    y: elbowY + shoulderOffsetY,
    visibility: 1,
  };
  landmarks[PoseLandmark.RIGHT_SHOULDER] = {
    x: 0.60 - leftShoulderOffsetX,
    y: elbowY + shoulderOffsetY,
    visibility: 1,
  };

  // Head/Nose position
  landmarks[PoseLandmark.NOSE] = { x: 0.50, y: noseY, visibility: 1 };

  return landmarks;
}

describe('PullupAnalyzer Reference Line & CV Performance Reporting', () => {
  let analyzer: PullupAnalyzer;

  beforeEach(() => {
    analyzer = new PullupAnalyzer();
  });

  test('Auto-calibrates pull-up bar reference line and detects chin crossing above bar', () => {
    let t = 1000;

    // 1. Dead-hang ready (elbow 160 deg, nose at y=0.45, bar at y=0.15)
    let res = analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 100);
    expect(res.referenceLineY).toBeCloseTo(0.15, 2);
    expect(res.isAboveReferenceLine).toBe(false);
    expect(res.state.currentState).toBe('READY');

    // 2. Pulling up (elbow 120 deg, nose at y=0.30)
    res = analyzer.processFrame(createMockPullupLandmarks(120, 0.30, 0.15), t += 100);
    expect(res.state.currentState).toBe('CONCENTRIC');
    expect(res.isAboveReferenceLine).toBe(false);

    // 3. Peak contraction: Chin clears above the bar reference line (nose at y=0.12 <= 0.15+0.03)
    res = analyzer.processFrame(createMockPullupLandmarks(58, 0.12, 0.15), t += 200);
    expect(res.isAboveReferenceLine).toBe(true);
    expect(res.state.currentState).toBe('INFLECTION');

    // 4. Lowering down past hysteresis threshold (elbow 125 deg, nose at y=0.32)
    res = analyzer.processFrame(createMockPullupLandmarks(125, 0.32, 0.15), t += 150);
    expect(res.state.currentState).toBe('ECCENTRIC');

    // 5. Full lockout completion (elbow 160 deg, nose at y=0.45)
    res = analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 150);
    expect(res.repCompleted).toBe(true);
    expect(res.isValidRep).toBe(true);
    expect(analyzer.getState().validReps).toBe(1);
    expect(analyzer.getState().noReps).toBe(0);
  });

  test('Rejects rep as NO-REP when athlete reverses before clearing reference line', () => {
    let t = 1000;

    // 1. Hanging in dead-hang
    analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 100);

    // 2. Ascending
    analyzer.processFrame(createMockPullupLandmarks(120, 0.30, 0.15), t += 100);

    // 3. Incomplete pull: nose stops at y=0.28 (well below bar y=0.15), elbow only reaches 95 deg
    analyzer.processFrame(createMockPullupLandmarks(95, 0.28, 0.15), t += 100);

    // 4. Early descent before clearing bar
    analyzer.processFrame(createMockPullupLandmarks(125, 0.35, 0.15), t += 100);

    // 5. Lockout
    const result = analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 150);

    expect(result.repCompleted).toBe(true);
    expect(result.isValidRep).toBe(false);
    expect(analyzer.getState().validReps).toBe(0);
    expect(analyzer.getState().noReps).toBe(1);
    expect(result.faultsToAlert.some(f => f.name.includes('Chin Not Over Bar'))).toBe(true);
  });

  test('Tracks inter-rep rest intervals and computes set performance report', () => {
    let t = 1000;

    // REP 1: Complete in 550ms
    analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 100);
    analyzer.processFrame(createMockPullupLandmarks(120, 0.30, 0.15), t += 150); // rep starts here (t=1250)
    analyzer.processFrame(createMockPullupLandmarks(55, 0.12, 0.15), t += 200);
    analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 200); // rep ends at t=1650 (duration 400ms)

    // Rest interval: 800ms
    t += 800;

    // REP 2: Complete in 600ms
    analyzer.processFrame(createMockPullupLandmarks(120, 0.30, 0.15), t += 150);
    analyzer.processFrame(createMockPullupLandmarks(55, 0.12, 0.15), t += 250);
    analyzer.processFrame(createMockPullupLandmarks(160, 0.45, 0.15), t += 200);

    const report = analyzer.getSetPerformanceReport();
    expect(report.totalValidReps).toBe(2);
    expect(report.totalNoReps).toBe(0);
    expect(report.repDurations.length).toBe(2);
    expect(report.avgRepDurationMs).toBeGreaterThan(300);
    expect(report.fastestRepNumber).toBe(1);
    expect(report.interRepRests.length).toBe(1);
    expect(report.avgRestBetweenRepsMs).toBeGreaterThan(600);
  });
});
