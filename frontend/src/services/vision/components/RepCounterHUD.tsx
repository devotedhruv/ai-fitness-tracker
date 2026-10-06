import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ExerciseTrackerState, FormFault } from '../types';
import { useTheme, staticColors } from '../../../theme';
import { Icon } from '../../../components/Icon';

interface RepCounterHUDProps {
  state: ExerciseTrackerState;
  activeFault?: FormFault;
  topOffset?: number;
}

export const RepCounterHUD: React.FC<RepCounterHUDProps> = ({ state, activeFault, topOffset }) => {
  const { colors } = useTheme();

  const isPlank = state.exerciseId === 'plank';
  const defaultTop = Platform.select({
    ios: 104,
    android: 92,
    web: 72,
    default: 80,
  });
  const resolvedTop = topOffset ?? defaultTop;

  return (
    <View style={[styles.container, { top: resolvedTop }]}>
      {/* Top metrics bar - Correct Reps and Wrong Reps */}
      <View style={styles.metricsRow}>
        {/* Valid Reps or Hold Time */}
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: staticColors.pose.good }]}>
            {isPlank ? 'HOLD TIME' : 'CORRECT REPS'}
          </Text>
          <Text style={[styles.statValue, { color: staticColors.pose.good }]}>
            {isPlank ? `${state.holdDurationSec ?? 0}s` : state.validReps}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.statDivider} />

        {/* Wrong Reps / No-Reps */}
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: state.noReps > 0 ? staticColors.pose.bad : '#A3A3A3' }]}>
            {isPlank ? 'FAULTS' : 'WRONG REPS'}
          </Text>
          <Text style={[styles.statValue, { color: state.noReps > 0 ? staticColors.pose.bad : colors.textSecondary }]}>
            {state.noReps}
          </Text>
        </View>
      </View>

      {/* Real-time Status Badge */}
      <View style={styles.statusBadgeRow}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: activeFault
                ? 'rgba(255, 77, 77, 0.25)'
                : state.currentState === 'NOT_IN_FRAME'
                ? 'rgba(255, 181, 46, 0.2)'
                : state.currentState === 'INFLECTION'
                ? 'rgba(53, 208, 127, 0.25)'
                : staticColors.mediaChip,
              borderColor: activeFault
                ? staticColors.pose.bad
                : state.currentState === 'NOT_IN_FRAME'
                ? staticColors.pose.warning
                : state.currentState === 'INFLECTION'
                ? staticColors.pose.good
                : staticColors.mediaChipBorder,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: activeFault
                  ? staticColors.pose.bad
                  : state.currentState === 'NOT_IN_FRAME'
                  ? staticColors.pose.warning
                  : state.currentState === 'INFLECTION'
                  ? staticColors.pose.good
                  : staticColors.pose.warning,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: activeFault
                  ? staticColors.pose.bad
                  : state.currentState === 'NOT_IN_FRAME'
                  ? staticColors.pose.warning
                  : state.currentState === 'INFLECTION'
                  ? staticColors.pose.good
                  : staticColors.onMedia,
              },
            ]}
          >
            {activeFault
              ? `FAULT: ${activeFault.name.toUpperCase()}`
              : state.currentState === 'NOT_IN_FRAME'
              ? 'STEP BACK - BODY NOT DETECTED'
              : state.currentState === 'INFLECTION'
              ? 'GOOD DEPTH REACHED'
              : state.currentState === 'READY'
              ? 'READY - IN POSITION'
              : state.currentState === 'ECCENTRIC'
              ? 'DESCENDING...'
              : 'PUSHING UP...'}
          </Text>
        </View>

        {/* Live Bar Path & Concentric Velocity Badge */}
        {!isPlank && state.currentState !== 'NOT_IN_FRAME' && state.latestVelocity && (
          <View
            style={[
              styles.velocityBadge,
              {
                borderColor:
                  state.latestVelocity.velocityLossPercent >= 20
                    ? '#FF9500'
                    : '#00F0FF',
                backgroundColor:
                  state.latestVelocity.velocityLossPercent >= 20
                    ? 'rgba(255, 149, 0, 0.2)'
                    : 'rgba(0, 240, 255, 0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.velocityDot,
                {
                  backgroundColor:
                    state.latestVelocity.velocityLossPercent >= 20
                      ? '#FF9500'
                      : '#00F0FF',
                },
              ]}
            />
            <Text style={styles.velocityText}>
              BAR VELOCITY: <Text style={{ fontWeight: '900', color: '#FFFFFF' }}>{state.latestVelocity.meanConcentricVelocityMps} m/s</Text>
            </Text>
            {state.latestVelocity.velocityLossPercent > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
                {state.latestVelocity.velocityLossPercent >= 20 && (
                  <Icon name="alert" size={10} color="#FF9500" style={{ marginRight: 2 }} />
                )}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color:
                      state.latestVelocity.velocityLossPercent >= 20
                        ? '#FF9500'
                        : '#34C759',
                  }}
                >
                  (-{state.latestVelocity.velocityLossPercent}%)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Real-time Pacing & Reference Line Clearance (LinkedIn YOLO26 Style) */}
      {!isPlank && state.currentState !== 'NOT_IN_FRAME' && (state.currentRepDurationMs !== undefined || state.referenceLineY !== undefined) && (
        <View style={styles.pacingRow}>
          {state.currentRepDurationMs !== undefined ? (
            <View style={styles.pacingPill}>
              <Icon name="timer" size={12} color="#00F0FF" style={{ marginRight: 4 }} />
              <Text style={styles.pacingText}>
                REP TIME: <Text style={{ color: '#00F0FF', fontWeight: '800' }}>{(state.currentRepDurationMs / 1000).toFixed(1)}s</Text>
              </Text>
            </View>
          ) : state.recentHistory.length > 0 && state.recentHistory[0].durationMs > 0 ? (
            <View style={styles.pacingPill}>
              <Icon name="timer" size={12} color="#A3A3A3" style={{ marginRight: 4 }} />
              <Text style={styles.pacingText}>
                LAST REP: <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{(state.recentHistory[0].durationMs / 1000).toFixed(1)}s</Text>
              </Text>
            </View>
          ) : null}

          {state.referenceLineY !== undefined && (
            <View
              style={[
                styles.referencePill,
                {
                  borderColor: state.isAboveReferenceLine ? '#34C759' : '#00F0FF',
                  backgroundColor: state.isAboveReferenceLine ? 'rgba(52, 199, 89, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: state.isAboveReferenceLine ? '#34C759' : '#00F0FF' },
                ]}
              />
              <Text
                style={[
                  styles.referenceText,
                  { color: state.isAboveReferenceLine ? '#34C759' : '#00F0FF' },
                ]}
              >
                {state.isAboveReferenceLine
                  ? `${state.referenceLineLabel?.includes('BAR') ? 'BAR' : 'DEPTH'}: CLEARED`
                  : state.distanceToReferenceLineCm !== undefined
                  ? `${state.referenceLineLabel?.includes('BAR') ? 'BAR' : 'DEPTH'}: ${state.distanceToReferenceLineCm}cm`
                  : 'LINE ACTIVE'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 12, 12, 0.90)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    maxWidth: 360,
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#A3A3A3',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statusBadgeRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  velocityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
  },
  velocityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  velocityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#E5E5E5',
  },
  pacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  pacingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pacingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4D4D4',
  },
  referencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  referenceText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
