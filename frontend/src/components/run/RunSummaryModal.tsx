import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { LiveRouteMap } from './LiveRouteMap';
import { RunSplitsTable } from './RunSplitsTable';
import { formatPace, formatDuration, GeoPoint } from '../../services/gps/geoUtils';
import { RunSplitData } from '../../stores/activeRunStore';

interface RunSummaryModalProps {
  visible: boolean;
  distanceMeters: number;
  durationSeconds: number;
  avgPaceSecKm: number;
  elevationGainMeters: number;
  caloriesBurned: number;
  routePoints: GeoPoint[];
  splits: RunSplitData[];
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export function RunSummaryModal({
  visible,
  distanceMeters,
  durationSeconds,
  avgPaceSecKm,
  elevationGainMeters,
  caloriesBurned,
  routePoints,
  splits,
  onSave,
  onDiscard,
  isSaving,
}: RunSummaryModalProps) {
  const { colors, typography } = useTheme();

  const km = (distanceMeters / 1000).toFixed(2);
  const timeFormatted = formatDuration(durationSeconds);
  const paceFormatted = formatPace(avgPaceSecKm);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDiscard}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Header */}
            <View style={styles.header}>
              <Icon name="medal-gold" size={48} color={colors.accent} style={{ marginBottom: 4 }} />
              <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 4 }]}>
                RUN COMPLETED!
              </Text>
              <Text style={[typography.captionBold, { color: colors.accent, letterSpacing: 1 }]}>
                OUTDOOR GPS RUN
              </Text>
            </View>

            {/* Route Map Preview */}
            <LiveRouteMap routePoints={routePoints} height={180} />

            {/* Metrics Grid */}
            <View style={styles.grid}>
              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.accent }]}>{km} km</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>DISTANCE</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>{timeFormatted}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>TIME</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: '#34C759' }]}>{paceFormatted}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>AVG PACE</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>{caloriesBurned} kcal</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>CALORIES</Text>
              </View>
            </View>

            {/* Splits Table */}
            <RunSplitsTable splits={splits} />

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title={isSaving ? 'Saving...' : 'Save & Sync Run'}
                variant="primary"
                loading={isSaving}
                onPress={onSave}
              />
              <View style={{ height: 10 }} />
              <Button
                title="Discard Run"
                variant="ghost"
                onPress={onDiscard}
              />
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  trophyEmoji: {
    fontSize: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  statBox: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  actions: {
    marginTop: 8,
  },
});
