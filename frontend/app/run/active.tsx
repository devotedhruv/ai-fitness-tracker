import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useActiveRunStore } from '../../src/stores/activeRunStore';
import { useTheme } from '../../src/tokens/ThemeContext';
import { LiveRouteMap } from '../../src/components/run/LiveRouteMap';
import { RunSplitsTable } from '../../src/components/run/RunSplitsTable';
import { RunSummaryModal } from '../../src/components/run/RunSummaryModal';
import { RouteDestinationModal } from '../../src/components/run/RouteDestinationModal';
import { Icon } from '../../src/components/Icon';
import { formatPace, formatDuration, GeoPoint } from '../../src/services/gps/geoUtils';
import { fetchPedestrianRoute } from '../../src/services/gps/geoRoutingService';
import { runsApi } from '../../src/services/api';

export default function ActiveRunScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const status = useActiveRunStore((state) => state.status);
  const startTime = useActiveRunStore((state) => state.startTime);
  const elapsedSeconds = useActiveRunStore((state) => state.elapsedSeconds);
  const distanceMeters = useActiveRunStore((state) => state.distanceMeters);
  const currentPaceSecKm = useActiveRunStore((state) => state.currentPaceSecKm);
  const avgPaceSecKm = useActiveRunStore((state) => state.avgPaceSecKm);
  const elevationGainMeters = useActiveRunStore((state) => state.elevationGainMeters);
  const caloriesBurned = useActiveRunStore((state) => state.caloriesBurned);
  const routePoints = useActiveRunStore((state) => state.routePoints);
  const currentLocation = useActiveRunStore((state) => state.currentLocation);
  const setCurrentLocation = useActiveRunStore((state) => state.setCurrentLocation);
  const destinationLocation = useActiveRunStore((state) => state.destinationLocation);
  const plannedRoutePoints = useActiveRunStore((state) => state.plannedRoutePoints);
  const targetDistanceMeters = useActiveRunStore((state) => state.targetDistanceMeters);
  const remainingDistanceMeters = useActiveRunStore((state) => state.remainingDistanceMeters);
  const etaSeconds = useActiveRunStore((state) => state.etaSeconds);
  const destinationReached = useActiveRunStore((state) => state.destinationReached);
  const isSelectingDestination = useActiveRunStore((state) => state.isSelectingDestination);
  const splits = useActiveRunStore((state) => state.splits);
  const voiceAudioEnabled = useActiveRunStore((state) => state.voiceAudioEnabled);

  const startRun = useActiveRunStore((state) => state.startRun);
  const pauseRun = useActiveRunStore((state) => state.pauseRun);
  const resumeRun = useActiveRunStore((state) => state.resumeRun);
  const finishRun = useActiveRunStore((state) => state.finishRun);
  const discardRun = useActiveRunStore((state) => state.discardRun);
  const incrementTimer = useActiveRunStore((state) => state.incrementTimer);
  const addGpsPoint = useActiveRunStore((state) => state.addGpsPoint);
  const setDestination = useActiveRunStore((state) => state.setDestination);
  const clearDestination = useActiveRunStore((state) => state.clearDestination);
  const setIsSelectingDestination = useActiveRunStore((state) => state.setIsSelectingDestination);
  const toggleVoiceAudio = useActiveRunStore((state) => state.toggleVoiceAudio);
  const getEncodedPolyline = useActiveRunStore((state) => state.getEncodedPolyline);

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [destinationModalVisible, setDestinationModalVisible] = useState(false);
  const [arrivalDismissed, setArrivalDismissed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const browserWatchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const simStepRef = useRef(0);

  // Initialize and start GPS tracker on mount
  useEffect(() => {
    let isMounted = true;

    async function initGps() {
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

        if (status === 'IDLE') {
          startRun();
        }

        // 1. Immediate Location Acquisition (Don't wait for movement!)
        try {
          const initialLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (initialLoc?.coords && isMounted) {
            const pt = {
              latitude: initialLoc.coords.latitude,
              longitude: initialLoc.coords.longitude,
              altitude: initialLoc.coords.altitude,
              speed: initialLoc.coords.speed,
              accuracy: initialLoc.coords.accuracy,
              timestamp: initialLoc.timestamp,
            };
            setCurrentLocation(pt);
            addGpsPoint(pt);
          }
        } catch (e) {
          // Web navigator.geolocation immediate fallback
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (!isMounted) return;
                const pt = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  altitude: pos.coords.altitude,
                  speed: pos.coords.speed,
                  accuracy: pos.coords.accuracy,
                  timestamp: pos.timestamp,
                };
                setCurrentLocation(pt);
                addGpsPoint(pt);
              },
              () => {},
              { enableHighAccuracy: true, timeout: 8000 }
            );
          }
        }

        // 2. Continuous watch stream via Location API
        try {
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 1000,
              distanceInterval: 2,
            },
            (loc) => {
              if (!isMounted) return;
              const pt = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                altitude: loc.coords.altitude,
                speed: loc.coords.speed,
                accuracy: loc.coords.accuracy,
                timestamp: loc.timestamp,
              };
              setCurrentLocation(pt);
              addGpsPoint(pt);
            }
          );
          locationSubRef.current = sub;
        } catch (watchErr) {
          console.warn('watchPositionAsync fallback:', watchErr);
        }

        // 3. Browser continuous watch fallback on web
        if (typeof navigator !== 'undefined' && navigator.geolocation && !browserWatchIdRef.current) {
          browserWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (!isMounted) return;
              const pt = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude,
                speed: pos.coords.speed,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp,
              };
              setCurrentLocation(pt);
              addGpsPoint(pt);
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 3000 }
          );
        }
      } catch (err) {
        console.warn('GPS location tracking error:', err);
      }
    }

    initGps();

    return () => {
      isMounted = false;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
      if (typeof navigator !== 'undefined' && navigator.geolocation && browserWatchIdRef.current) {
        navigator.geolocation.clearWatch(browserWatchIdRef.current);
        browserWatchIdRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, []);

  // Simulation runner toggle (for developer / desktop testing on real streets)
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      setIsSimulating(false);
    } else {
      if (status === 'IDLE' || status === 'PAUSED') {
        resumeRun();
      }
      setIsSimulating(true);

      // Start simulation from user's current location or realistic city coordinates
      let baseLat =
        currentLocation?.latitude ||
        (routePoints.length > 0 ? routePoints[routePoints.length - 1].latitude : 40.785091);
      let baseLng =
        currentLocation?.longitude ||
        (routePoints.length > 0 ? routePoints[routePoints.length - 1].longitude : -73.968285);

      simIntervalRef.current = setInterval(() => {
        simStepRef.current += 1;
        // Natural street running curves (~3.2 m/s = 11.5 km/h = ~5:13 /km pace)
        const angle = simStepRef.current * 0.04;
        const dLat = Math.cos(angle) * 0.00003;
        const dLng = Math.sin(angle) * 0.000038;
        baseLat += dLat;
        baseLng += dLng;

        const simPoint: GeoPoint = {
          latitude: Math.round(baseLat * 1e6) / 1e6,
          longitude: Math.round(baseLng * 1e6) / 1e6,
          altitude: 20 + Math.sin(simStepRef.current * 0.1) * 3,
          speed: 3.2 + Math.sin(simStepRef.current * 0.2) * 0.3,
          accuracy: 5,
          timestamp: Date.now(),
        };

        setCurrentLocation(simPoint);
        addGpsPoint(simPoint);
      }, 1000);
    }
  };

  // Duration timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      incrementTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [incrementTimer]);

  const km = (distanceMeters / 1000).toFixed(2);
  const paceFormatted = formatPace(currentPaceSecKm > 0 ? currentPaceSecKm : avgPaceSecKm);
  const avgPaceFormatted = formatPace(avgPaceSecKm);
  const timeFormatted = formatDuration(elapsedSeconds);

  const handleMapSelectDestination = async (coord: GeoPoint) => {
    setIsSelectingDestination(false);
    const origin =
      currentLocation || (routePoints.length > 0 ? routePoints[routePoints.length - 1] : coord);
    try {
      const result = await fetchPedestrianRoute(origin, coord);
      setDestination(coord, result.points, result.distanceMeters);
    } catch (e) {
      setDestination(coord, [origin, coord]);
    }
  };

  const handleFinishPress = () => {
    if (distanceMeters < 50) {
      Alert.alert('Short Run', 'Your recorded distance is under 50 meters. Discard or finish?', [
        { text: 'Keep Running', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discardRun();
            router.back();
          },
        },
      ]);
      return;
    }
    pauseRun();
    finishRun();
    setSummaryModalVisible(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const polyline = getEncodedPolyline();
      const startedAt = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
      const completedAt = new Date().toISOString();

      await runsApi.createRun({
        title: 'Outdoor Run',
        distanceMeters,
        durationSeconds: elapsedSeconds,
        avgPaceSecKm: avgPaceSecKm || 300,
        elevationGainMeters,
        caloriesBurned,
        polyline,
        startedAt,
        completedAt,
        splits: splits.map((s) => ({
          splitNumber: s.splitNumber,
          distanceMeters: s.distanceMeters,
          durationSeconds: s.durationSeconds,
          paceSecKm: s.paceSecKm,
          elevationChange: s.elevationChange,
        })),
      });

      discardRun();
      setSummaryModalVisible(false);
      router.replace('/(tabs)/train');
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save run session.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      {/* Top Controls Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Discard Run?', 'Are you sure you want to stop and discard this run?', [
              { text: 'Resume', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  discardRun();
                  router.back();
                },
              },
            ]);
          }}
          style={styles.headerBtn}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="close" size={14} color="#A3A3A3" style={{ marginRight: 4 }} />
            <Text style={{ color: '#A3A3A3', fontWeight: '800', fontSize: 13 }}>CANCEL</Text>
          </View>
        </TouchableOpacity>

        {/* Action Controls: Route Planner, Test Run Simulator & Audio Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setDestinationModalVisible(true)}
            style={[
              styles.routeBtn,
              destinationLocation ? styles.routeBtnActive : styles.routeBtnInactive,
            ]}
            accessibilityLabel="Predefine Route Destination"
          >
            <Text
              style={[
                styles.routeBtnText,
                { color: destinationLocation ? '#000000' : '#00F0FF' },
              ]}
            >
              {destinationLocation ? '🏁 FINISH SET' : '🎯 ROUTE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleSimulation}
            style={[styles.simBtn, isSimulating ? styles.simBtnActive : styles.simBtnInactive]}
            accessibilityLabel="Simulate Running"
          >
            <Text style={[styles.simBtnText, { color: isSimulating ? '#000000' : '#B8F500' }]}>
              {isSimulating ? '⚡ SIMULATING...' : '▶ TEST RUN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleVoiceAudio} style={styles.audioToggleBtn} accessibilityLabel="Toggle Audio">
            <Icon name={voiceAudioEnabled ? 'volume' : 'volume-mute'} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Running HUD (High contrast & legibility) */}
      <View style={styles.hudContainer}>
        {/* Large Distance */}
        <View style={styles.distanceBlock}>
          <Text style={styles.distanceValue}>{km}</Text>
          <Text style={styles.distanceUnit}>KILOMETERS</Text>
        </View>

        {/* Secondary Metrics: Pace & Time */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{timeFormatted}</Text>
            <Text style={styles.metricLabel}>DURATION</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricBlock}>
            <Text style={[styles.metricValue, { color: '#B8F500' }]}>{paceFormatted}</Text>
            <Text style={styles.metricLabel}>CURRENT PACE</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{avgPaceFormatted}</Text>
            <Text style={styles.metricLabel}>AVG PACE</Text>
          </View>
        </View>

        {/* Destination Route Guidance HUD */}
        {destinationLocation && (
          <View style={styles.guidanceBar}>
            <View style={styles.guidanceRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13 }}>🏁</Text>
                <Text style={styles.guidanceRemaining}>
                  {remainingDistanceMeters != null
                    ? `${(remainingDistanceMeters / 1000).toFixed(2)} KM REMAINING`
                    : 'ROUTING TO DESTINATION...'}
                </Text>
              </View>
              {etaSeconds != null && (
                <Text style={styles.guidanceEta}>
                  ETA ~{formatDuration(etaSeconds)}
                </Text>
              )}
            </View>

            {targetDistanceMeters && (
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(
                          2,
                          Math.round((distanceMeters / targetDistanceMeters) * 100)
                        )
                      )}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Destination Reached Celebration Banner */}
      {destinationReached && !arrivalDismissed && (
        <View style={styles.arrivalCard}>
          <Text style={{ fontSize: 26 }}>🏆</Text>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={styles.arrivalTitle}>FINISH LINE CROSSED!</Text>
            <Text style={styles.arrivalSub}>
              You reached your target destination. Great job!
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setArrivalDismissed(true)}
            style={styles.arrivalDismissBtn}
          >
            <Text style={styles.arrivalDismissText}>KEEP RUNNING</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Live Route Map */}
      <View style={styles.mapWrapper}>
        <LiveRouteMap
          routePoints={routePoints}
          currentLocation={currentLocation}
          destinationLocation={destinationLocation}
          plannedRoutePoints={plannedRoutePoints}
          isSelectingDestination={isSelectingDestination}
          onSelectDestination={handleMapSelectDestination}
          isTracking={status === 'TRACKING'}
          height="100%"
          onLocationFound={(pt) => {
            setCurrentLocation(pt);
            if (routePoints.length === 0) {
              addGpsPoint(pt);
            }
          }}
        />
      </View>

      {/* Bottom Running Controls */}
      <View style={styles.bottomControls}>
        {status === 'TRACKING' ? (
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: '#FF9500' }]}
            onPress={pauseRun}
          >
            <Text style={styles.mainActionBtnText}>PAUSE</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.pausedControlsRow}>
            <TouchableOpacity
              style={[styles.subActionBtn, { backgroundColor: '#34C759' }]}
              onPress={resumeRun}
            >
              <Text style={styles.mainActionBtnText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subActionBtn, { backgroundColor: '#B8F500' }]}
              onPress={handleFinishPress}
            >
              <Text style={[styles.mainActionBtnText, { color: '#0B1020' }]}>FINISH</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Route Destination Modal */}
      <RouteDestinationModal
        visible={destinationModalVisible}
        onClose={() => setDestinationModalVisible(false)}
        currentLocation={currentLocation}
        destinationLocation={destinationLocation}
        remainingDistanceMeters={remainingDistanceMeters}
        onSelectTapOnMap={() => {
          setIsSelectingDestination(true);
        }}
        onRouteGenerated={(res, targetM) => {
          setDestination(res.destination, res.points, targetM);
        }}
        onClearDestination={() => {
          clearDestination();
        }}
      />

      {/* Run Summary Modal */}
      <RunSummaryModal
        visible={summaryModalVisible}
        distanceMeters={distanceMeters}
        durationSeconds={elapsedSeconds}
        avgPaceSecKm={avgPaceSecKm}
        elevationGainMeters={elevationGainMeters}
        caloriesBurned={caloriesBurned}
        routePoints={routePoints}
        splits={splits}
        onSave={handleConfirmSave}
        onDiscard={() => {
          discardRun();
          setSummaryModalVisible(false);
          router.replace('/(tabs)/train');
        }}
        isSaving={isSaving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBtn: {
    padding: 6,
  },
  audioToggleBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  routeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  routeBtnActive: {
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
  },
  routeBtnInactive: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  routeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  simBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  simBtnActive: {
    backgroundColor: '#B8F500',
    borderColor: '#B8F500',
  },
  simBtnInactive: {
    backgroundColor: 'rgba(184, 245, 0, 0.12)',
    borderColor: 'rgba(184, 245, 0, 0.35)',
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guidanceBar: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  guidanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guidanceRemaining: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  guidanceEta: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
    borderRadius: 2,
  },
  arrivalCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(184, 245, 0, 0.15)',
    borderColor: '#B8F500',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrivalTitle: {
    color: '#B8F500',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arrivalSub: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
  },
  arrivalDismissBtn: {
    backgroundColor: '#B8F500',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  arrivalDismissText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  hudContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: 'center',
  },
  distanceBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  distanceValue: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 80,
  },
  distanceUnit: {
    color: '#B8F500',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  metricBlock: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricLabel: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mapWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  mainActionBtn: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  mainActionBtnText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pausedControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subActionBtn: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
