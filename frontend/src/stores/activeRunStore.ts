import { create } from 'zustand';
import {
  calculateDistance,
  formatPace,
  GeoPoint,
  smoothPoints,
  encodePolyline,
} from '../services/gps/geoUtils';
import { speakFeedback } from '../services/vision/audioCoach';

export interface RunSplitData {
  splitNumber: number;
  distanceMeters: number;
  durationSeconds: number;
  paceSecKm: number;
  elevationChange: number;
}

export type RunStatus = 'IDLE' | 'TRACKING' | 'PAUSED' | 'COMPLETED';

export interface ActiveRunState {
  status: RunStatus;
  startTime: number | null;
  elapsedSeconds: number;
  distanceMeters: number;
  currentPaceSecKm: number;
  avgPaceSecKm: number;
  elevationGainMeters: number;
  caloriesBurned: number;
  routePoints: GeoPoint[];
  currentLocation: GeoPoint | null;
  destinationLocation: GeoPoint | null;
  plannedRoutePoints: GeoPoint[];
  targetDistanceMeters: number | null;
  remainingDistanceMeters: number | null;
  etaSeconds: number | null;
  destinationReached: boolean;
  isSelectingDestination: boolean;
  splits: RunSplitData[];
  voiceAudioEnabled: boolean;

  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  finishRun: () => void;
  discardRun: () => void;
  incrementTimer: () => void;
  addGpsPoint: (point: GeoPoint) => void;
  setCurrentLocation: (point: GeoPoint) => void;
  setDestination: (point: GeoPoint | null, plannedPoints?: GeoPoint[], targetMeters?: number) => void;
  setPlannedRoute: (points: GeoPoint[], targetMeters?: number) => void;
  clearDestination: () => void;
  setIsSelectingDestination: (active: boolean) => void;
  toggleVoiceAudio: () => void;
  getEncodedPolyline: () => string;
}

const SPLIT_DISTANCE_METERS = 1000; // 1.0 km

export const useActiveRunStore = create<ActiveRunState>((set, get) => ({
  status: 'IDLE',
  startTime: null,
  elapsedSeconds: 0,
  distanceMeters: 0,
  currentPaceSecKm: 0,
  avgPaceSecKm: 0,
  elevationGainMeters: 0,
  caloriesBurned: 0,
  routePoints: [],
  currentLocation: null,
  destinationLocation: null,
  plannedRoutePoints: [],
  targetDistanceMeters: null,
  remainingDistanceMeters: null,
  etaSeconds: null,
  destinationReached: false,
  isSelectingDestination: false,
  splits: [],
  voiceAudioEnabled: true,

  startRun: () => {
    set({
      status: 'TRACKING',
      startTime: Date.now(),
      elapsedSeconds: 0,
      distanceMeters: 0,
      currentPaceSecKm: 0,
      avgPaceSecKm: 0,
      elevationGainMeters: 0,
      caloriesBurned: 0,
      routePoints: [],
      splits: [],
    });
    if (get().voiceAudioEnabled) {
      speakFeedback('Outdoor run started. GPS tracking active.');
    }
  },

  pauseRun: () => {
    set({ status: 'PAUSED' });
    if (get().voiceAudioEnabled) {
      speakFeedback('Run paused.');
    }
  },

  resumeRun: () => {
    set({ status: 'TRACKING' });
    if (get().voiceAudioEnabled) {
      speakFeedback('Run resumed.');
    }
  },

  finishRun: () => {
    set({ status: 'COMPLETED' });
    const { distanceMeters, elapsedSeconds, voiceAudioEnabled } = get();
    if (voiceAudioEnabled) {
      const km = (distanceMeters / 1000).toFixed(2);
      speakFeedback(`Run completed! Total distance: ${km} kilometers.`);
    }
  },

  discardRun: () => {
    set({
      status: 'IDLE',
      startTime: null,
      elapsedSeconds: 0,
      distanceMeters: 0,
      currentPaceSecKm: 0,
      avgPaceSecKm: 0,
      elevationGainMeters: 0,
      caloriesBurned: 0,
      routePoints: [],
      currentLocation: null,
      destinationLocation: null,
      plannedRoutePoints: [],
      targetDistanceMeters: null,
      remainingDistanceMeters: null,
      etaSeconds: null,
      destinationReached: false,
      isSelectingDestination: false,
      splits: [],
    });
  },

  incrementTimer: () => {
    const { status, elapsedSeconds, distanceMeters } = get();
    if (status !== 'TRACKING') return;

    const nextElapsed = elapsedSeconds + 1;
    // Calculate average pace in sec/km
    const avgPace = distanceMeters > 50
      ? Math.round((nextElapsed / (distanceMeters / 1000)))
      : 0;

    // Approximate calories (average runner: ~60 kcal per km)
    const calories = Math.round((distanceMeters / 1000) * 62);

    set({
      elapsedSeconds: nextElapsed,
      avgPaceSecKm: avgPace,
      caloriesBurned: calories,
    });
  },

  setCurrentLocation: (point: GeoPoint) => {
    set({ currentLocation: point });
  },

  addGpsPoint: (newPoint: GeoPoint) => {
    const state = get();
    if (state.status !== 'TRACKING') {
      set({ currentLocation: newPoint });
      return;
    }

    // Outlier rejection: reject low accuracy fixes if we already have points,
    // but ALWAYS accept the initial points so the map can anchor to the user immediately
    if (state.routePoints.length > 0 && newPoint.accuracy && newPoint.accuracy > 150) {
      set({ currentLocation: newPoint });
      return;
    }

    const points = state.routePoints;
    let addedDistance = 0;
    let elevationDelta = 0;

    if (points.length > 0) {
      const prev = points[points.length - 1];
      addedDistance = calculateDistance(
        prev.latitude,
        prev.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      // Filter erratic GPS teleport spikes (> 54 km/h jump)
      const timeDeltaSec = (newPoint.timestamp - prev.timestamp) / 1000;
      if (timeDeltaSec > 0) {
        const speedMps = addedDistance / timeDeltaSec;
        if (speedMps > 15) { // > 54 km/h
          set({ currentLocation: newPoint });
          return;
        }
      }

      if (
        newPoint.altitude != null &&
        prev.altitude != null &&
        newPoint.altitude > prev.altitude
      ) {
        elevationDelta = newPoint.altitude - prev.altitude;
      }
    }

    const nextPoints = [...points, newPoint];
    const nextDistance = state.distanceMeters + addedDistance;
    const nextElevation = state.elevationGainMeters + elevationDelta;

    // Instantaneous pace over last few points
    let currentPace = state.currentPaceSecKm;
    if (newPoint.speed && newPoint.speed > 0.5) {
      currentPace = Math.round(1000 / newPoint.speed);
    } else if (points.length >= 3) {
      const p1 = points[points.length - 2];
      const dt = (newPoint.timestamp - p1.timestamp) / 1000;
      const dDist = calculateDistance(p1.latitude, p1.longitude, newPoint.latitude, newPoint.longitude);
      if (dDist > 5 && dt > 0) {
        currentPace = Math.round((dt / (dDist / 1000)));
      }
    }

    // Split Detection (Every 1.0 km)
    const completedSplitsCount = state.splits.length;
    const expectedSplitsCount = Math.floor(nextDistance / SPLIT_DISTANCE_METERS);

    let nextSplits = [...state.splits];
    if (expectedSplitsCount > completedSplitsCount) {
      const splitNumber = completedSplitsCount + 1;
      const priorSplitDurations = state.splits.reduce((acc, s) => acc + s.durationSeconds, 0);
      const splitDuration = Math.max(1, state.elapsedSeconds - priorSplitDurations);
      const splitPace = splitDuration; // since distance is exactly 1 km

      const newSplit: RunSplitData = {
        splitNumber,
        distanceMeters: SPLIT_DISTANCE_METERS,
        durationSeconds: splitDuration,
        paceSecKm: splitPace,
        elevationChange: Math.round(elevationDelta),
      };
      nextSplits.push(newSplit);

      if (state.voiceAudioEnabled) {
        const paceStr = formatPace(splitPace);
        speakFeedback(`Kilometer ${splitNumber}. Pace: ${paceStr}`);
      }
    }

    // Destination guidance & arrival calculation
    let nextRemainingMeters = state.remainingDistanceMeters;
    let nextEtaSeconds = state.etaSeconds;
    let nextDestinationReached = state.destinationReached;

    if (state.destinationLocation) {
      const distToDest = calculateDistance(
        newPoint.latitude,
        newPoint.longitude,
        state.destinationLocation.latitude,
        state.destinationLocation.longitude
      );
      nextRemainingMeters = Math.round(distToDest);

      const effectivePace = currentPace > 120 && currentPace < 1200
        ? currentPace
        : (state.avgPaceSecKm > 120 ? state.avgPaceSecKm : 330);
      nextEtaSeconds = Math.round((distToDest / 1000) * effectivePace);

      if (distToDest <= 35 && !state.destinationReached) {
        nextDestinationReached = true;
        if (state.voiceAudioEnabled) {
          speakFeedback('Destination reached! You have crossed the finish line! Incredible effort.');
        }
      }
    }

    set({
      routePoints: nextPoints,
      currentLocation: newPoint,
      distanceMeters: Math.round(nextDistance * 10) / 10,
      elevationGainMeters: Math.round(nextElevation * 10) / 10,
      currentPaceSecKm: currentPace,
      splits: nextSplits,
      remainingDistanceMeters: nextRemainingMeters,
      etaSeconds: nextEtaSeconds,
      destinationReached: nextDestinationReached,
    });
  },

  setDestination: (point: GeoPoint | null, plannedPoints: GeoPoint[] = [], targetMeters?: number) => {
    const { currentLocation, routePoints, voiceAudioEnabled } = get();
    const anchor = currentLocation || (routePoints.length > 0 ? routePoints[routePoints.length - 1] : null);

    let remaining: number | null = null;
    let eta: number | null = null;

    if (point && anchor) {
      remaining = Math.round(
        calculateDistance(anchor.latitude, anchor.longitude, point.latitude, point.longitude)
      );
      eta = Math.round((remaining / 1000) * 330); // ~5:30 /km baseline
    }

    set({
      destinationLocation: point,
      plannedRoutePoints: plannedPoints,
      targetDistanceMeters: targetMeters ?? (remaining || null),
      remainingDistanceMeters: remaining,
      etaSeconds: eta,
      destinationReached: false,
      isSelectingDestination: false,
    });

    if (point && voiceAudioEnabled) {
      const km = remaining ? (remaining / 1000).toFixed(1) : '';
      speakFeedback(`Finish destination set. ${km ? `${km} kilometers remaining.` : ''}`);
    }
  },

  setPlannedRoute: (points: GeoPoint[], targetMeters?: number) => {
    const dest = points.length > 0 ? points[points.length - 1] : null;
    get().setDestination(dest, points, targetMeters);
  },

  clearDestination: () => {
    set({
      destinationLocation: null,
      plannedRoutePoints: [],
      targetDistanceMeters: null,
      remainingDistanceMeters: null,
      etaSeconds: null,
      destinationReached: false,
      isSelectingDestination: false,
    });
    if (get().voiceAudioEnabled) {
      speakFeedback('Target destination cleared.');
    }
  },

  setIsSelectingDestination: (active: boolean) => {
    set({ isSelectingDestination: active });
  },

  toggleVoiceAudio: () =>
    set((state) => ({ voiceAudioEnabled: !state.voiceAudioEnabled })),

  getEncodedPolyline: () => {
    const { routePoints } = get();
    if (routePoints.length === 0) return '';
    const smoothed = smoothPoints(routePoints, 3);
    return encodePolyline(smoothed);
  },
}));
