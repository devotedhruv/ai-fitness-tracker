import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useActiveWorkoutStore } from '../../stores/activeWorkoutStore';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';

interface RestTimerBarProps {
  onViewDemo?: (exercise: any) => void;
}

export function RestTimerBar({ onViewDemo }: RestTimerBarProps) {
  const { colors, typography, isDark } = useTheme();
  const restTimer = useActiveWorkoutStore((state) => state.restTimer);
  const tickRestTimer = useActiveWorkoutStore((state) => state.tickRestTimer);
  const stopRestTimer = useActiveWorkoutStore((state) => state.stopRestTimer);
  const addRestTimerSeconds = useActiveWorkoutStore((state) => state.addRestTimerSeconds);
  const exercises = useActiveWorkoutStore((state) => state.exercises);

  useEffect(() => {
    if (!restTimer.isActive) return;

    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, tickRestTimer]);

  if (!restTimer.isActive) return null;

  const minutes = Math.floor(restTimer.remainingSeconds / 60);
  const seconds = restTimer.remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = restTimer.totalSeconds > 0
    ? (restTimer.remainingSeconds / restTimer.totalSeconds) * 100
    : 0;

  // Determine next exercise preview
  let nextExercise: any = null;
  const activeExIdx = exercises.findIndex((ex) => ex.sets.some((s) => !s.isCompleted));
  if (activeExIdx !== -1 && activeExIdx + 1 < exercises.length) {
    nextExercise = exercises[activeExIdx + 1];
  } else if (activeExIdx === -1 && exercises.length > 0) {
    nextExercise = exercises[0];
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      {/* Progress Track */}
      <View
        style={[
          styles.progressBar,
          {
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: colors.primary,
          },
        ]}
      />

      <View style={styles.contentRow}>
        <View style={styles.timerDisplay}>
          <Icon name="timer" size={24} color={colors.accentText} />
          <View>
            <Text style={[typography.captionBold, { color: colors.accentText, fontSize: 10 }]}>
              REST TIMER
            </Text>
            <Text style={[styles.timeDigits, { color: colors.textPrimary }]}>
              {formattedTime}
            </Text>
          </View>
        </View>

        {nextExercise && (
          <View style={styles.nextPreviewColumn}>
            <Text style={[styles.nextPrefix, { color: colors.mutedText }]}>Next:</Text>
            <TouchableOpacity
              style={styles.nextExTouch}
              onPress={() => onViewDemo?.(nextExercise)}
              activeOpacity={0.7}
            >
              <Text style={[styles.nextExName, { color: colors.textPrimary }]} numberOfLines={1}>
                {nextExercise.exerciseName}
              </Text>
              {onViewDemo && (
                <View style={[styles.miniViewPill, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                  <Icon name="play" size={8} color={colors.accentText} />
                  <Text style={[styles.miniViewPillText, { color: colors.accentText }]}>View</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => addRestTimerSeconds(30)}
          >
            <Text style={[styles.actionBtnText, { color: colors.accentText }]}>+30s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: colors.surfacePressed }]}
            onPress={stopRestTimer}
          >
            <Text style={[styles.skipBtnText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  progressBar: {
    height: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerIcon: {
    fontSize: 22,
  },
  timeDigits: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nextPreviewColumn: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  nextPrefix: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nextExTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  nextExName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    maxWidth: 90,
  },
  miniViewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    gap: 2,
  },
  miniViewPillText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 9,
  },
});
