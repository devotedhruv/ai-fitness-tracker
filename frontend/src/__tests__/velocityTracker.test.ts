import { VelocityTracker } from '../services/vision/analyzers/VelocityTracker';

describe('VelocityTracker', () => {
  let tracker: VelocityTracker;

  beforeEach(() => {
    tracker = new VelocityTracker();
  });

  it('records bar path points', () => {
    tracker.recordPoint(100, 200, 1000);
    tracker.recordPoint(100, 190, 1050);

    expect(tracker.getBarPath()).toHaveLength(2);
    expect(tracker.getBarPath()[0].y).toBe(200);
    expect(tracker.getBarPath()[1].y).toBe(190);
  });

  it('calculates mean and peak concentric velocity for rep', () => {
    tracker.startConcentricPhase();

    // Move upward from y=300 to y=150 over 500ms
    tracker.recordPoint(100, 300, 1000);
    tracker.recordPoint(100, 220, 1250);
    tracker.recordPoint(100, 150, 1500);

    const metrics = tracker.completeRepConcentric(1);
    expect(metrics).not.toBeNull();
    expect(metrics?.repNumber).toBe(1);
    expect(metrics?.peakVelocityMps).toBeGreaterThan(0);
    expect(metrics?.meanConcentricVelocityMps).toBeGreaterThan(0);
    expect(metrics?.velocityLossPercent).toBe(0); // 1st rep has 0% loss
  });

  it('computes velocity loss between rep 1 and fatigue rep', () => {
    // Rep 1 (Fast: 500ms)
    tracker.startConcentricPhase();
    tracker.recordPoint(100, 300, 1000);
    tracker.recordPoint(100, 150, 1500);
    const rep1 = tracker.completeRepConcentric(1);

    // Rep 2 (Slower / fatigued: 1000ms)
    tracker.startConcentricPhase();
    tracker.recordPoint(100, 300, 2000);
    tracker.recordPoint(100, 150, 3000);
    const rep2 = tracker.completeRepConcentric(2);

    expect(rep2?.velocityLossPercent).toBeGreaterThan(0);
    expect(rep2?.meanConcentricVelocityMps).toBeLessThan(rep1!.meanConcentricVelocityMps);
  });
});

import { PoseTracker } from '../services/vision/PoseTracker';
import { Landmark3D, PoseLandmark } from '../services/vision/types';

function createMockSquatLandmarks(kneeAngleDeg: number, shoulderY: number = 0.1): Landmark3D[] {
  const landmarks: Landmark3D[] = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 1 }));
  landmarks[PoseLandmark.LEFT_SHOULDER] = { x: 0.45, y: shoulderY, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_SHOULDER] = { x: 0.55, y: shoulderY, visibility: 1 };
  landmarks[PoseLandmark.LEFT_HIP] = { x: 0.45, y: 0.25, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_HIP] = { x: 0.55, y: 0.25, visibility: 1 };
  landmarks[PoseLandmark.LEFT_KNEE] = { x: 0.45, y: 0.5, visibility: 1 };
  landmarks[PoseLandmark.RIGHT_KNEE] = { x: 0.55, y: 0.5, visibility: 1 };

  const rad = ((-90 + kneeAngleDeg) * Math.PI) / 180;
  const ankleDist = 0.25;
  landmarks[PoseLandmark.LEFT_ANKLE] = {
    x: 0.45 + ankleDist * Math.cos(rad),
    y: 0.5 + ankleDist * Math.sin(rad),
    visibility: 1,
  };
  landmarks[PoseLandmark.RIGHT_ANKLE] = {
    x: 0.55 + ankleDist * Math.cos(rad),
    y: 0.5 + ankleDist * Math.sin(rad),
    visibility: 1,
  };
  return landmarks;
}

describe('PoseTracker VBT Integration', () => {
  it('records bar path and updates tracker state during squat movement', () => {
    const tracker = new PoseTracker('squat', 'Barbell Squat');
    let t = 1000;

    // 1. Ready position (170 deg, shoulder at 0.10)
    tracker.onNewFrame(createMockSquatLandmarks(170, 0.10), t += 100);
    tracker.onNewFrame(createMockSquatLandmarks(170, 0.10), t += 100);
    expect(tracker.getState().barPath?.length).toBeGreaterThan(0);

    // 2. Eccentric phase (descending to 125 deg, shoulder at 0.20)
    tracker.onNewFrame(createMockSquatLandmarks(125, 0.20), t += 100);
    tracker.onNewFrame(createMockSquatLandmarks(125, 0.20), t += 100);

    // 3. Inflection phase (deep squat at 85 deg, shoulder at 0.30)
    tracker.onNewFrame(createMockSquatLandmarks(85, 0.30), t += 100);
    tracker.onNewFrame(createMockSquatLandmarks(85, 0.30), t += 100);

    // 4. Concentric phase (pushing up to 125 deg, shoulder at 0.20)
    tracker.onNewFrame(createMockSquatLandmarks(125, 0.20), t += 100);
    tracker.onNewFrame(createMockSquatLandmarks(125, 0.20), t += 100);

    // 5. Standing lockout (lockout at 165 deg, shoulder at 0.10)
    const frame1 = tracker.onNewFrame(createMockSquatLandmarks(165, 0.10), t += 100);
    const frame2 = tracker.onNewFrame(createMockSquatLandmarks(165, 0.10), t += 100);
    const frame3 = tracker.onNewFrame(createMockSquatLandmarks(165, 0.10), t += 100);

    const completed = frame1.repCompleted ? frame1 : frame2.repCompleted ? frame2 : frame3;

    expect(completed.repCompleted).toBe(true);
    expect(completed.isValidRep).toBe(true);
    expect(tracker.getState().barPath?.length).toBeGreaterThan(0);
    expect(tracker.getState().latestVelocity).toBeDefined();
    expect(tracker.getState().latestVelocity?.meanConcentricVelocityMps).toBeGreaterThan(0);
  });
});

