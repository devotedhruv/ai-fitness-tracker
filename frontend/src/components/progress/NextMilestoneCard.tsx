import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { UserProgress } from '../../services/progression/types';

interface NextMilestoneCardProps {
  progress: UserProgress;
}

export function NextMilestoneCard({ progress }: NextMilestoneCardProps) {
  const { colors } = useTheme();

  // Find 3 top actionable milestones from progress
  const milestones: Array<{
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
    xpReward: number;
    icon: 'flame' | 'barbell' | 'target';
  }> = [];

  // Streak milestone
  const nextStreakTarget = Math.max(5, Math.ceil((progress.streakDays + 1) / 5) * 5);
  milestones.push({
    id: 'streak',
    title: `${nextStreakTarget}-Day Consistency Streak`,
    description: `Maintain weekly training and log next session`,
    current: progress.streakDays,
    target: nextStreakTarget,
    unit: 'days',
    xpReward: 150,
    icon: 'flame',
  });

  // Level milestone
  milestones.push({
    id: 'level',
    title: `Level ${progress.level + 1} Advancement`,
    description: `Earn ${progress.xpToNextLevel} more XP to promote`,
    current: progress.currentLevelXP,
    target: progress.nextLevelXP,
    unit: 'XP',
    xpReward: 300,
    icon: 'target',
  });

  // Top exercise milestone
  const exercises = Object.values(progress.exerciseProgress);
  const exerciseWithMilestone = exercises.find((e) => e.nextMilestone);
  if (exerciseWithMilestone && exerciseWithMilestone.nextMilestone) {
    const ms = exerciseWithMilestone.nextMilestone;
    milestones.push({
      id: exerciseWithMilestone.exerciseId,
      title: `${exerciseWithMilestone.exerciseName} Mastery`,
      description: ms.targetDescription,
      current: ms.currentVal,
      target: ms.targetVal,
      unit: ms.metricType === 'WEIGHT' ? 'kg' : 'reps',
      xpReward: ms.rewardXP,
      icon: 'barbell',
    });
  }

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
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Next Milestones
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Actionable targets for bonus character XP
          </Text>
        </View>

        <View style={[styles.headerBadge, { backgroundColor: 'rgba(184, 245, 0, 0.12)', borderColor: colors.accent }]}>
          <Icon name="sparkle" size={12} color={colors.accent} />
          <Text style={[styles.headerBadgeText, { color: colors.accent }]}>BONUS XP</Text>
        </View>
      </View>

      <View style={styles.milestoneList}>
        {milestones.map((ms) => {
          const pct = Math.min(100, Math.max(8, Math.round((ms.current / (ms.target || 1)) * 100)));
          return (
            <View
              key={ms.id}
              style={[
                styles.item,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemTop}>
                <View style={styles.titleInfo}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                    {ms.title}
                  </Text>
                  <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                    {ms.description}
                  </Text>
                </View>

                <View style={[styles.xpPill, { backgroundColor: colors.accent }]}>
                  <Text style={styles.xpPillText}>+{ms.xpReward} XP</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.track, { backgroundColor: colors.surface }]}>
                <View style={[styles.fill, { backgroundColor: colors.accent, width: `${pct}%` }]} />
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {ms.current.toLocaleString()} / {ms.target.toLocaleString()} {ms.unit}
                </Text>
                <Text style={[styles.pctText, { color: colors.accent }]}>
                  {pct}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneList: {
    gap: 10,
  },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
