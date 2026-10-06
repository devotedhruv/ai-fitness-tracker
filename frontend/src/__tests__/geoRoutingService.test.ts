import {
  fetchPedestrianRoute,
  generateTargetDistanceRoute,
  computeRouteProgress,
} from '../services/gps/geoRoutingService';
import { GeoPoint } from '../services/gps/geoUtils';

describe('geoRoutingService', () => {
  const start: GeoPoint = {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: 1000,
  };

  const destination: GeoPoint = {
    latitude: 37.7849,
    longitude: -122.4094,
    timestamp: 2000,
  };

  it('computes route progress and arrival detection', () => {
    // Current pos far from destination
    const progressFar = computeRouteProgress(start, destination, 300);
    expect(progressFar.remainingMeters).toBeGreaterThan(1000);
    expect(progressFar.hasArrived).toBe(false);
    expect(progressFar.etaSeconds).toBeGreaterThan(0);

    // Current pos within 25 meters of destination
    const closePos: GeoPoint = {
      latitude: destination.latitude + 0.0001,
      longitude: destination.longitude,
      timestamp: 3000,
    };
    const progressArrived = computeRouteProgress(closePos, destination, 300);
    expect(progressArrived.remainingMeters).toBeLessThanOrEqual(35);
    expect(progressArrived.hasArrived).toBe(true);
  });

  it('generates target distance route with fallback coordinates', async () => {
    const targetMeters = 3000;
    const result = await generateTargetDistanceRoute(start, targetMeters);

    expect(result).toBeDefined();
    expect(result.points.length).toBeGreaterThan(2);
    expect(result.destination).toBeDefined();
    expect(result.distanceMeters).toBeGreaterThan(2000);
  });

  it('gracefully handles routing with fallback intermediate points', async () => {
    const result = await fetchPedestrianRoute(start, destination);
    expect(result.points.length).toBeGreaterThan(2);
    expect(result.destination.latitude).toBe(destination.latitude);
    expect(result.destination.longitude).toBe(destination.longitude);
  });
});
