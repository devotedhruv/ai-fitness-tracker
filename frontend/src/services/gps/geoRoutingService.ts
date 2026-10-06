import { calculateDistance, GeoPoint } from './geoUtils';

export interface PlannedRouteResult {
  points: GeoPoint[];
  distanceMeters: number;
  durationSeconds: number;
  destination: GeoPoint;
}

/**
 * Fetches realistic street-level pedestrian routing between two points using OSRM
 * Fallbacks to geo interpolation if network is unavailable
 */
export async function fetchPedestrianRoute(
  start: GeoPoint,
  destination: GeoPoint
): Promise<PlannedRouteResult> {
  const directDistance = calculateDistance(
    start.latitude,
    start.longitude,
    destination.latitude,
    destination.longitude
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://router.project-osrm.org/route/v1/foot/${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords: [number, number][] = route.geometry.coordinates; // [lng, lat]
        const now = Date.now();

        const points: GeoPoint[] = rawCoords.map(([lng, lat], idx) => ({
          latitude: Math.round(lat * 1e6) / 1e6,
          longitude: Math.round(lng * 1e6) / 1e6,
          timestamp: now + idx * 1000,
        }));

        return {
          points,
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          destination: {
            latitude: destination.latitude,
            longitude: destination.longitude,
            timestamp: now + Math.round(route.duration) * 1000,
          },
        };
      }
    }
  } catch (err) {
    // Fallback to interpolation on network timeout/error
    console.warn('OSRM route fetch fallback to direct line:', err);
  }

  // Graceful Offline / Fallback: Interpolate intermediate points
  const steps = Math.max(5, Math.min(25, Math.floor(directDistance / 80)));
  const points: GeoPoint[] = [];
  const now = Date.now();

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add subtle natural street curve perturbation
    const curve = Math.sin(fraction * Math.PI) * 0.00015;
    points.push({
      latitude:
        Math.round((start.latitude + (destination.latitude - start.latitude) * fraction + curve) * 1e6) / 1e6,
      longitude:
        Math.round(
          (start.longitude + (destination.longitude - start.longitude) * fraction + curve) * 1e6
        ) / 1e6,
      timestamp: now + i * 1000,
    });
  }

  return {
    points,
    distanceMeters: Math.round(directDistance),
    durationSeconds: Math.round((directDistance / 1000) * 330), // ~5:30/km standard jog
    destination,
  };
}

/**
 * Projects a target distance destination from start coordinate (e.g. 1k, 3k, 5k, 10k)
 */
export async function generateTargetDistanceRoute(
  start: GeoPoint,
  targetMeters: number,
  bearingDeg = 45
): Promise<PlannedRouteResult> {
  const earthRadius = 6371000;
  const angularDist = targetMeters / earthRadius;
  const bearingRad = (bearingDeg * Math.PI) / 180;
  const lat1Rad = (start.latitude * Math.PI) / 180;
  const lon1Rad = (start.longitude * Math.PI) / 180;

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDist) +
      Math.cos(lat1Rad) * Math.sin(angularDist) * Math.cos(bearingRad)
  );
  const lon2Rad =
    lon1Rad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(lat1Rad),
      Math.cos(angularDist) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
    );

  const destination: GeoPoint = {
    latitude: Math.round(((lat2Rad * 180) / Math.PI) * 1e6) / 1e6,
    longitude: Math.round(((lon2Rad * 180) / Math.PI) * 1e6) / 1e6,
    timestamp: Date.now() + Math.round((targetMeters / 1000) * 330 * 1000),
  };

  return fetchPedestrianRoute(start, destination);
}

/**
 * Computes remaining distance and estimated time of arrival
 */
export function computeRouteProgress(
  currentPos: GeoPoint,
  destination: GeoPoint,
  paceSecKm: number
): { remainingMeters: number; etaSeconds: number; hasArrived: boolean } {
  const remainingMeters = calculateDistance(
    currentPos.latitude,
    currentPos.longitude,
    destination.latitude,
    destination.longitude
  );

  const effectivePace = paceSecKm > 120 && paceSecKm < 1200 ? paceSecKm : 330; // default 5:30 /km
  const etaSeconds = Math.round((remainingMeters / 1000) * effectivePace);
  const hasArrived = remainingMeters <= 35; // within 35 meters counts as finish line crossed

  return {
    remainingMeters: Math.round(remainingMeters),
    etaSeconds,
    hasArrived,
  };
}
