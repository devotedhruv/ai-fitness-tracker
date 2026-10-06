import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { UserProgress } from '../../services/progression/types';

interface ProgressionOverviewCardProps {
  progress: UserProgress;
}

export function ProgressionOverviewCard({ progress }: ProgressionOverviewCardProps) {
  const { colors, typography } = useTheme();

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
      {/* Header Tag */}
      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { backgroundColor: 'rgba(184, 245, 0, 0.12)', borderColor: colors.accent }]}>
          <Icon name="sparkle" size={12} color={colors.accent} />
          <Text style={[styles.categoryBadgeText, { color: colors.accent }]}>YOUR PROGRESS</Text>
        </View>

        <View style={[styles.streakPill, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Icon name="flame" size={14} color="#FF9500" />
          <Text style={[styles.streakText, { color: colors.textPrimary }]}>
            {progress.streakDays} Day Streak
          </Text>
        </View>
      </View>

      {/* Level & Rank Title */}
      <View style={styles.levelRow}>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelSubtitle, { color: colors.textSecondary }]}>LEVEL</Text>
          <Text style={[styles.levelNumber, { color: colors.textPrimary }]}>{progress.level}</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={[styles.rankTitle, { color: colors.accent }]}>{progress.rankTitle}</Text>
          <Text style={[styles.rankDescription, { color: colors.textSecondary }]}>
            {progress.totalWorkouts} Workouts Logged • {progress.totalSets} Sets
          </Text>
        </View>
      </View>

      {/* XP Ratio & Progress % */}
      <View style={styles.xpTextRow}>
        <Text style={[styles.xpValueText, { color: colors.textPrimary }]}>
          {progress.totalXP.toLocaleString()} <Text style={{ color: colors.textSecondary, fontSize: 13 }}>/ {(progress.totalXP + progress.xpToNextLevel).toLocaleString()} XP</Text>
        </Text>
        <Text style={[styles.percentText, { color: colors.accent }]}>
          {progress.progressPercentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(100, Math.max(3, progress.progressPercentage))}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>

      {/* Subtitle Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {progress.xpToNextLevel.toLocaleString()} XP to Level {progress.level + 1}
        </Text>
        <View style={styles.statMiniGroup}>
          <View style={styles.statMiniItem}>
            <Icon name="dumbbell" size={12} color={colors.accent} />
            <Text style={[styles.statMiniVal, { color: colors.textPrimary }]}>
              {Math.round(progress.totalVolumeKg).toLocaleString()} kg
            </Text>
          </View>
          <View style={styles.statMiniItem}>
            <Icon name="trophy" size={12} color={colors.accent} />
            <Text style={[styles.statMiniVal, { color: colors.textPrimary }]}>
              {progress.personalRecords.length} PRs
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#0F162A',
    borderWidth: 1.5,
    borderColor: '#B8F500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  levelSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  titleWrap: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rankDescription: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  xpValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statMiniGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statMiniVal: {
    fontSize: 11,
    fontWeight: '700',
  },
});
