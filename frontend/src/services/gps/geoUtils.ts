export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  timestamp: number;
}

/**
 * Calculates great-circle distance between two points in meters using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Applies a moving-average filter to smooth noisy GPS coordinates
 */
export function smoothPoints(points: GeoPoint[], windowSize = 3): GeoPoint[] {
  if (points.length < 2) return points;

  const smoothed: GeoPoint[] = [];
  const half = Math.floor(windowSize / 2);

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(points.length - 1, i + half);
    let sumLat = 0;
    let sumLon = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      sumLat += points[j].latitude;
      sumLon += points[j].longitude;
      count++;
    }

    smoothed.push({
      ...points[i],
      latitude: Math.round((sumLat / count) * 1e6) / 1e6,
      longitude: Math.round((sumLon / count) * 1e6) / 1e6,
    });
  }
  return smoothed;
}


/**
 * Formats pace from seconds/km to "M:SS /km"
 */
export function formatPace(paceSecKm: number): string {
  if (!paceSecKm || !isFinite(paceSecKm) || paceSecKm <= 0 || paceSecKm > 3600) {
    return '--:-- /km';
  }
  const min = Math.floor(paceSecKm / 60);
  const sec = Math.round(paceSecKm % 60);
  return `${min}:${String(sec).padStart(2, '0')} /km`;
}

/**
 * Formats duration seconds into "HH:MM:SS" or "MM:SS"
 */
export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);
  const sec = Math.floor(totalSeconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Standard Google Polyline Encoding Algorithm for efficient path serialization
 */
export function encodePolyline(points: { latitude: number; longitude: number }[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round(point.latitude * 1e5);
    const lng = Math.round(point.longitude * 1e5);

    encoded += encodeValue(lat - prevLat);
    encoded += encodeValue(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }
  return encoded;
}

function encodeValue(val: number): string {
  let num = val < 0 ? ~(val << 1) : val << 1;
  let res = '';
  while (num >= 0x20) {
    res += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }
  res += String.fromCharCode(num + 63);
  return res;
}

/**
 * Decode Polyline string back into lat/lng coordinates
 */
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
