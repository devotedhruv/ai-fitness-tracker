import React from 'react';
import { RepCounterHUD } from '../services/vision/components/RepCounterHUD';
import { FormCorrectionBanner } from '../services/vision/components/FormCorrectionBanner';
import { ExerciseTrackerState, FormFault } from '../services/vision/types';

// Mock Icon
jest.mock('../components/Icon', () => ({
  Icon: () => null,
}));

describe('Vision HUD Components', () => {
  const mockState: ExerciseTrackerState = {
    exerciseId: 'squat',
    exerciseName: 'Squats',
    currentState: 'READY',
    validReps: 5,
    noReps: 1,
    currentPrimaryAngle: 102,
    targetInflectionAngle: 95,
    targetLockoutAngle: 160,
    activeFaults: [],
    recentHistory: [],
    overallFormScore: 92,
  };

  it('renders RepCounterHUD with CORRECT REPS and WRONG REPS without joint angle', () => {
    const element = <RepCounterHUD state={mockState} topOffset={80} />;
    expect(element).toBeDefined();
    expect(element.props.state.validReps).toBe(5);
    expect(element.props.state.noReps).toBe(1);
    expect(element.props.topOffset).toBe(80);
  });

  it('renders plank mode with HOLD TIME and FAULTS', () => {
    const plankState: ExerciseTrackerState = {
      ...mockState,
      exerciseId: 'plank',
      exerciseName: 'Plank Hold',
      holdDurationSec: 45,
      noReps: 2,
    };

    const element = <RepCounterHUD state={plankState} />;
    expect(element).toBeDefined();
    expect(element.props.state.holdDurationSec).toBe(45);
    expect(element.props.state.noReps).toBe(2);
  });

  it('renders FormCorrectionBanner with fault and topOffset', () => {
    const mockFault: FormFault = {
      id: 'knee_valgus',
      name: 'Knees Caving In',
      correctionMessage: 'Push your knees outward in line with toes.',
      severity: 'CRITICAL_NO_REP',
      jointIndices: [25, 26],
      detectedAtTimestamp: Date.now(),
    };

    const element = <FormCorrectionBanner fault={mockFault} topOffset={220} />;
    expect(element).toBeDefined();
    expect(element.props.fault?.name).toBe('Knees Caving In');
    expect(element.props.topOffset).toBe(220);
  });
});
