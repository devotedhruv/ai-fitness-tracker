import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { GeoPoint, formatPace } from '../../services/gps/geoUtils';
import { generateTargetDistanceRoute, PlannedRouteResult } from '../../services/gps/geoRoutingService';

interface RouteDestinationModalProps {
  visible: boolean;
  onClose: () => void;
  currentLocation: GeoPoint | null;
  destinationLocation: GeoPoint | null;
  remainingDistanceMeters: number | null;
  onSelectTapOnMap: () => void;
  onRouteGenerated: (result: PlannedRouteResult, targetMeters: number) => void;
  onClearDestination: () => void;
}

const QUICK_TARGETS = [
  { label: '1.0 km', sub: 'Quick Sprint', meters: 1000 },
  { label: '3.0 km', sub: 'Speed Run', meters: 3000 },
  { label: '5.0 km', sub: 'Classic 5K', meters: 5000 },
  { label: '10.0 km', sub: 'Endurance 10K', meters: 10000 },
  { label: '21.1 km', sub: 'Half Marathon', meters: 21097 },
];

export function RouteDestinationModal({
  visible,
  onClose,
  currentLocation,
  destinationLocation,
  remainingDistanceMeters,
  onSelectTapOnMap,
  onRouteGenerated,
  onClearDestination,
}: RouteDestinationModalProps) {
  const { colors, typography } = useTheme();
  const [loadingDistance, setLoadingDistance] = useState<number | null>(null);

  const handleSelectQuickDistance = async (meters: number) => {
    if (!currentLocation) {
      alert('Location not acquired yet. Please wait a moment for GPS lock.');
      return;
    }
    setLoadingDistance(meters);
    try {
      const result = await generateTargetDistanceRoute(currentLocation, meters);
      onRouteGenerated(result, meters);
      onClose();
    } catch (e: any) {
      console.warn('Failed to generate distance route:', e);
    } finally {
      setLoadingDistance(null);
    }
  };

  const remainingKm = remainingDistanceMeters ? (remainingDistanceMeters / 1000).toFixed(2) : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: '#111422', borderColor: 'rgba(255,255,255,0.12)' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 16 }}>🏁</Text>
              </View>
              <View>
                <Text style={styles.title}>Predefine Destination</Text>
                <Text style={styles.subtitle}>Plan your route like Strava & MapMyRun</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={18} color="#A3A3A3" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Active Destination Card (if one is set) */}
            {destinationLocation && (
              <View style={styles.activeDestCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 20 }}>🏁</Text>
                    <View>
                      <Text style={styles.activeDestLabel}>TARGET FINISH LINE</Text>
                      <Text style={styles.activeDestVal}>
                        {remainingKm ? `${remainingKm} km remaining` : 'Destination set on map'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onClearDestination} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>CLEAR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Option 1: Tap Anywhere on Map */}
            <Text style={styles.sectionHeader}>CHOOSE ON MAP</Text>
            <TouchableOpacity
              style={styles.tapOnMapBtn}
              onPress={() => {
                onClose();
                onSelectTapOnMap();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.tapIconPuck}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tapTitle}>Tap on Map to Place Finish Flag</Text>
                  <Text style={styles.tapSub}>Touch any road or intersection on the live map</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#B8F500" />
              </View>
            </TouchableOpacity>

            {/* Option 2: Quick Distance Goals */}
            <Text style={styles.sectionHeader}>QUICK TARGET DISTANCE</Text>
            <View style={styles.targetsGrid}>
              {QUICK_TARGETS.map((target) => {
                const isLoading = loadingDistance === target.meters;
                return (
                  <TouchableOpacity
                    key={target.meters}
                    style={styles.targetItem}
                    disabled={isLoading}
                    onPress={() => handleSelectQuickDistance(target.meters)}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#B8F500" />
                    ) : (
                      <>
                        <Text style={styles.targetMeters}>{target.label}</Text>
                        <Text style={styles.targetSub}>{target.sub}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Strava / MapMyRun Pro-Tip */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Real pedestrian roads are calculated with street routing. The cyan dashed line on your map will guide you straight to the checkered flag!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(184, 245, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  activeDestCard: {
    backgroundColor: 'rgba(184, 245, 0, 0.12)',
    borderColor: '#B8F500',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  activeDestLabel: {
    color: '#B8F500',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeDestVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  clearBtn: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    borderColor: '#FF453A',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#FF453A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: '#737373',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  tapOnMapBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  tapIconPuck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tapSub: {
    color: '#A3A3A3',
    fontSize: 11,
    marginTop: 2,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  targetItem: {
    flexBasis: '31%',
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  targetMeters: {
    color: '#B8F500',
    fontSize: 16,
    fontWeight: '900',
  },
  targetSub: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
});
