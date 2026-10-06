import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { WeeklyProgressDashboard } from '../../services/progression/types';

interface TrainingProgressWeeklyCardProps {
  dashboard: WeeklyProgressDashboard;
}

export function TrainingProgressWeeklyCard({ dashboard }: TrainingProgressWeeklyCardProps) {
  const { colors } = useTheme();

  const volumeDeltaSign = dashboard.volumeDeltaPercent > 0 ? '+' : '';
  const workoutsDeltaSign = dashboard.workoutsDelta > 0 ? '+' : '';
  const prsDeltaSign = dashboard.prsDelta > 0 ? '+' : '';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Title Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Training Progress
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            This week's volume and consistency
          </Text>
        </View>

        {/* Comparison Badge */}
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor: dashboard.volumeDeltaPercent >= 0 ? 'rgba(184, 245, 0, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              borderColor: dashboard.volumeDeltaPercent >= 0 ? colors.accent : '#EF4444',
            },
          ]}
        >
          <Icon
            name="trending-up"
            size={13}
            color={dashboard.volumeDeltaPercent >= 0 ? colors.accent : '#EF4444'}
          />
          <Text
            style={[
              styles.trendText,
              { color: dashboard.volumeDeltaPercent >= 0 ? colors.accent : '#EF4444' },
            ]}
          >
            {volumeDeltaSign}{dashboard.volumeDeltaPercent}% Vol
          </Text>
        </View>
      </View>

      {/* Main 2x2 Grid Metrics */}
      <View style={styles.grid}>
        {/* Row 1: Workouts & Volume */}
        <View style={styles.gridRow}>
          {/* Workouts */}
          <View style={[styles.gridCell, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.cellTop}>
              <Icon name="runner" size={16} color={colors.accent} />
              <Text style={[styles.deltaBadge, { color: dashboard.workoutsDelta >= 0 ? colors.accent : '#EF4444' }]}>
                {workoutsDeltaSign}{dashboard.workoutsDelta} vs LW
              </Text>
            </View>
            <View>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>
                {dashboard.workouts}
              </Text>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Workouts Completed
              </Text>
            </View>
          </View>

          {/* Volume */}
          <View style={[styles.gridCell, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.cellTop}>
              <Icon name="barbell" size={16} color="#38BDF8" />
              <Text style={[styles.deltaBadge, { color: dashboard.volumeDeltaPercent >= 0 ? colors.accent : '#EF4444' }]}>
                {volumeDeltaSign}{dashboard.volumeDeltaPercent}%
              </Text>
            </View>
            <View>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>
                {Math.round(dashboard.volumeKg).toLocaleString()}{' '}
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>kg</Text>
              </Text>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Total Volume
              </Text>
            </View>
          </View>
        </View>

        {/* Row 2: Sets & Personal Records */}
        <View style={styles.gridRow}>
          {/* Sets */}
          <View style={[styles.gridCell, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.cellTop}>
              <Icon name="target" size={16} color="#A855F7" />
              <Text style={[styles.deltaBadge, { color: colors.textSecondary }]}>
                {dashboard.lastWeekSets} LW
              </Text>
            </View>
            <View>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>
                {dashboard.sets}
              </Text>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Sets Completed
              </Text>
            </View>
          </View>

          {/* Personal Records */}
          <View style={[styles.gridCell, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.cellTop}>
              <Icon name="trophy" size={16} color="#F59E0B" />
              <Text style={[styles.deltaBadge, { color: dashboard.prsDelta >= 0 ? colors.accent : colors.textSecondary }]}>
                {prsDeltaSign}{dashboard.prsDelta} vs LW
              </Text>
            </View>
            <View>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>
                {dashboard.prsCount}
              </Text>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Personal Records
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Week over Week Summary Bar */}
      <View style={[styles.summaryFooter, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Last Week</Text>
          <Text style={[styles.footerValue, { color: colors.textPrimary }]}>
            {dashboard.lastWeekWorkouts} workouts • {Math.round(dashboard.lastWeekVolumeKg).toLocaleString()} kg
          </Text>
        </View>
        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Consistency</Text>
          <Text style={[styles.footerValue, { color: colors.accent }]}>
            {dashboard.workouts >= 3 ? 'On Track' : 'Needs Focus'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  grid: {
    gap: 10,
    marginBottom: 14,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  cellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deltaBadge: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  cellValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.5,
  },
  cellLabel: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  footerDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
});
