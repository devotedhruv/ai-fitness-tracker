import { useActiveRunStore } from '../stores/activeRunStore';

describe('activeRunStore', () => {
  beforeEach(() => {
    useActiveRunStore.getState().discardRun();
  });

  it('starts run in TRACKING state with empty metrics', () => {
    useActiveRunStore.getState().startRun();
    const state = useActiveRunStore.getState();

    expect(state.status).toBe('TRACKING');
    expect(state.distanceMeters).toBe(0);
    expect(state.elapsedSeconds).toBe(0);
    expect(state.routePoints).toHaveLength(0);
    expect(state.splits).toHaveLength(0);
  });

  it('pauses and resumes run properly', () => {
    useActiveRunStore.getState().startRun();
    useActiveRunStore.getState().pauseRun();
    expect(useActiveRunStore.getState().status).toBe('PAUSED');

    useActiveRunStore.getState().resumeRun();
    expect(useActiveRunStore.getState().status).toBe('TRACKING');
  });

  it('increments timer and calculates average pace', () => {
    useActiveRunStore.getState().startRun();

    // Mock 1 km covered in 300s
    useActiveRunStore.setState({ distanceMeters: 1000, elapsedSeconds: 299 });
    useActiveRunStore.getState().incrementTimer();

    const state = useActiveRunStore.getState();
    expect(state.elapsedSeconds).toBe(300);
    expect(state.avgPaceSecKm).toBe(300); // 5:00 /km
  });

  it('adds GPS points, updates distance, and triggers 1.0 km split', () => {
    useActiveRunStore.getState().startRun();

    // Start point
    useActiveRunStore.getState().addGpsPoint({
      latitude: 40.7128,
      longitude: -74.006,
      altitude: 10,
      timestamp: 100000,
    });

    expect(useActiveRunStore.getState().distanceMeters).toBe(0);

    // Point ~1050m north after 320 seconds
    useActiveRunStore.setState({ elapsedSeconds: 320 });
    useActiveRunStore.getState().addGpsPoint({
      latitude: 40.7223,
      longitude: -74.006,
      altitude: 15,
      timestamp: 100000 + 320000,
    });


    const state = useActiveRunStore.getState();
    expect(state.distanceMeters).toBeGreaterThan(1000);
    expect(state.routePoints).toHaveLength(2);
    expect(state.splits).toHaveLength(1);
    expect(state.splits[0].splitNumber).toBe(1);
    expect(state.splits[0].distanceMeters).toBe(1000);
  });

  it('updates currentLocation state and accepts initial fix with moderate accuracy', () => {
    useActiveRunStore.getState().startRun();

    const pt = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 65, // Browser / Wi-Fi accuracy
      timestamp: Date.now(),
    };

    useActiveRunStore.getState().setCurrentLocation(pt);
    expect(useActiveRunStore.getState().currentLocation?.latitude).toBe(37.7749);

    // Initial point should be accepted even if accuracy is > 30
    useActiveRunStore.getState().addGpsPoint(pt);
    expect(useActiveRunStore.getState().routePoints).toHaveLength(1);
  });

  it('rejects subsequent GPS points with very poor accuracy (>150m)', () => {
    useActiveRunStore.getState().startRun();

    // Valid initial point
    useActiveRunStore.getState().addGpsPoint({
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
      timestamp: 1000,
    });
    expect(useActiveRunStore.getState().routePoints).toHaveLength(1);

    // Subsequent point with poor accuracy (> 150m)
    useActiveRunStore.getState().addGpsPoint({
      latitude: 37.7760,
      longitude: -122.4194,
      accuracy: 200,
      timestamp: 2000,
    });
    // Should be filtered out
    expect(useActiveRunStore.getState().routePoints).toHaveLength(1);
  });

  it('sets destination, calculates remaining distance and ETA, and detects finish arrival', () => {
    useActiveRunStore.getState().startRun();

    const startPt = {
      latitude: 40.7128,
      longitude: -74.006,
      timestamp: 1000,
    };
    useActiveRunStore.getState().addGpsPoint(startPt);

    const destPt = {
      latitude: 40.7228, // ~1.1 km north
      longitude: -74.006,
      timestamp: 2000,
    };

    useActiveRunStore.getState().setDestination(destPt);
    const stateWithDest = useActiveRunStore.getState();
    expect(stateWithDest.destinationLocation).toBeDefined();
    expect(stateWithDest.remainingDistanceMeters).toBeGreaterThan(1000);
    expect(stateWithDest.destinationReached).toBe(false);

    // Runner arrives at finish destination (within 20 meters, covered over 350s = ~11 km/h pace)
    const arrivePt = {
      latitude: 40.7227,
      longitude: -74.006,
      timestamp: 1000 + 350 * 1000,
    };
    useActiveRunStore.getState().addGpsPoint(arrivePt);

    const stateArrived = useActiveRunStore.getState();
    expect(stateArrived.remainingDistanceMeters).toBeLessThanOrEqual(35);
    expect(stateArrived.destinationReached).toBe(true);

    // Clear destination
    useActiveRunStore.getState().clearDestination();
    expect(useActiveRunStore.getState().destinationLocation).toBeNull();
    expect(useActiveRunStore.getState().remainingDistanceMeters).toBeNull();
  });
});
