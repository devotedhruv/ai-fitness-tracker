import {
  calculateDistance,
  smoothPoints,
  formatPace,
  formatDuration,
  encodePolyline,
  decodePolyline,
  GeoPoint,
} from '../services/gps/geoUtils';

describe('geoUtils', () => {
  it('calculates Haversine distance accurately', () => {
    // Distance between London (51.5074, -0.1278) and Paris (48.8566, 2.3522) ~ 343.5 km
    const dist = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(Math.round(dist / 1000)).toBe(344);
  });

  it('calculates zero distance for identical points', () => {
    const dist = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(dist).toBe(0);
  });

  it('smooths GPS points using moving average', () => {
    const noisyPoints: GeoPoint[] = [
      { latitude: 10, longitude: 20, timestamp: 1000 },
      { latitude: 12, longitude: 22, timestamp: 2000 },
      { latitude: 11, longitude: 21, timestamp: 3000 },
    ];
    const smoothed = smoothPoints(noisyPoints, 3);
    expect(smoothed).toHaveLength(3);
    expect(smoothed[1].latitude).toBe(11);
    expect(smoothed[1].longitude).toBe(21);
  });

  it('formats pace correctly', () => {
    expect(formatPace(312)).toBe('5:12 /km');
    expect(formatPace(299)).toBe('4:59 /km');
    expect(formatPace(0)).toBe('--:-- /km');
    expect(formatPace(-5)).toBe('--:-- /km');
  });

  it('formats durations in MM:SS and HH:MM:SS', () => {
    expect(formatDuration(90)).toBe('01:30');
    expect(formatDuration(3665)).toBe('1:01:05');
  });

  it('encodes and decodes Google polylines losslessly', () => {
    const original = [
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ];

    const encoded = encodePolyline(original);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodePolyline(encoded);
    expect(decoded).toHaveLength(original.length);
    expect(decoded[0].latitude).toBeCloseTo(original[0].latitude, 4);
    expect(decoded[0].longitude).toBeCloseTo(original[0].longitude, 4);
  });
});
