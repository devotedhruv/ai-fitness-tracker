import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { ExerciseProgressItem, MuscleProgressItem, ExerciseRankTier, MuscleRankTier } from '../../services/progression/types';

interface RankHierarchyGridProps {
  exerciseProgress: Record<string, ExerciseProgressItem>;
  muscleProgress: Record<string, MuscleProgressItem>;
  onSelectExercise?: (exercise: ExerciseProgressItem) => void;
  onSelectMuscle?: (muscle: MuscleProgressItem) => void;
}

export function getRankBadgeColors(rank: ExerciseRankTier | MuscleRankTier) {
  switch (rank) {
    case 'MASTER':
      return { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.4)' };
    case 'S+':
    case 'S':
      return { bg: 'rgba(184, 245, 0, 0.15)', text: '#B8F500', border: 'rgba(184, 245, 0, 0.4)' };
    case 'A':
      return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' };
    case 'B':
      return { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.4)' };
    case 'C':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
    case 'D':
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.4)' };
  }
}

export function RankHierarchyGrid({
  exerciseProgress,
  muscleProgress,
  onSelectExercise,
  onSelectMuscle,
}: RankHierarchyGridProps) {
  const { colors, typography } = useTheme();
  const [activeTab, setActiveTab] = useState<'EXERCISES' | 'MUSCLES'>('EXERCISES');

  const exercises = Object.values(exerciseProgress);
  const muscles = Object.values(muscleProgress);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header and Filter Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Mastery & Balance
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {activeTab === 'EXERCISES' ? 'Individual exercise ranks' : 'Balanced muscle development'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.switcher, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('EXERCISES')}
            style={[
              styles.switchTab,
              activeTab === 'EXERCISES' && [styles.switchTabActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.switchTabText,
                { color: activeTab === 'EXERCISES' ? '#0B1020' : colors.textSecondary },
              ]}
            >
              Exercises
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('MUSCLES')}
            style={[
              styles.switchTab,
              activeTab === 'MUSCLES' && [styles.switchTabActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.switchTabText,
                { color: activeTab === 'MUSCLES' ? '#0B1020' : colors.textSecondary },
              ]}
            >
              Muscles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Rendering */}
      {activeTab === 'EXERCISES' ? (
        <View style={styles.listContainer}>
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="dumbbell" size={28} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Complete workouts to rank up your exercises!
              </Text>
            </View>
          ) : (
            exercises.map((item) => {
              const badgeStyle = getRankBadgeColors(item.rank);
              return (
                <TouchableOpacity
                  key={item.exerciseId}
                  activeOpacity={0.75}
                  onPress={() => onSelectExercise?.(item)}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.titleInfo}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.exerciseName}
                      </Text>
                      <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                        {item.primaryMuscle} • PB {item.personalBestWeightKg > 0 ? `${item.personalBestWeightKg} kg` : `${item.personalBestReps} reps`}
                      </Text>
                    </View>

                    {/* Rank Badge */}
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor: badgeStyle.bg,
                          borderColor: badgeStyle.border,
                        },
                      ]}
                    >
                      <Text style={[styles.rankBadgeText, { color: badgeStyle.text }]}>
                        {item.rank}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar & XP */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBarTrack, { backgroundColor: colors.surface }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: badgeStyle.text,
                            width: `${Math.min(100, Math.max(5, item.progressPercentage))}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.xpTextRow}>
                      <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                        {item.currentXP} / {item.nextRankXP} XP
                      </Text>
                      <Text style={[styles.percentLabel, { color: badgeStyle.text }]}>
                        {item.progressPercentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Milestone hint */}
                  {item.nextMilestone && (
                    <View style={styles.milestoneRow}>
                      <Icon name="target" size={12} color={colors.accent} />
                      <Text style={[styles.milestoneText, { color: colors.textSecondary }]} numberOfLines={1}>
                        Next: {item.nextMilestone.targetDescription} (+{item.nextMilestone.rewardXP} XP)
                      </Text>
                      <Icon name="chevron-right" size={12} color={colors.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {muscles.map((muscle) => {
            const badgeStyle = getRankBadgeColors(muscle.rank);
            return (
              <TouchableOpacity
                key={muscle.muscleGroup}
                activeOpacity={0.75}
                onPress={() => onSelectMuscle?.(muscle)}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.titleInfo}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                      {muscle.muscleGroup}
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      {muscle.totalSets} sets • {Math.round(muscle.totalVolumeKg).toLocaleString()} kg volume
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor: badgeStyle.bg,
                        borderColor: badgeStyle.border,
                      },
                    ]}
                  >
                    <Text style={[styles.rankBadgeText, { color: badgeStyle.text }]}>
                      {muscle.rank}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.surface }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: badgeStyle.text,
                          width: `${Math.min(100, Math.max(5, muscle.progressPercentage))}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.xpTextRow}>
                    <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                      {muscle.currentXP} / {muscle.targetXP} XP
                    </Text>
                    <Text style={[styles.percentLabel, { color: badgeStyle.text }]}>
                      {muscle.progressPercentage}% to next tier
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
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
  switcher: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  switchTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  switchTabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  switchTabText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  listContainer: {
    gap: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  progressRow: {
    gap: 6,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  percentLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 6,
  },
  milestoneText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
