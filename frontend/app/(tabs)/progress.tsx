import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/theme';
import { AppHeader } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { workoutsApi, runsApi } from '../../src/services/api';
import { useProgressionStore } from '../../src/stores/progressionStore';
import { ProgressionOverviewCard } from '../../src/components/progress/ProgressionOverviewCard';
import { WarriorAscensionCard } from '../../src/components/progress/WarriorAscensionCard';
import { NextMilestoneCard } from '../../src/components/progress/NextMilestoneCard';
import { RankHierarchyGrid } from '../../src/components/progress/RankHierarchyGrid';
import { StrengthProgressChart } from '../../src/components/progress/StrengthProgressChart';
import { RecentAchievementsList } from '../../src/components/progress/RecentAchievementsList';
import { ExerciseDetailProgressModal } from '../../src/components/progress/ExerciseDetailProgressModal';
import { LevelUpCelebrationModal } from '../../src/components/progress/LevelUpCelebrationModal';
import { ExerciseProgressItem } from '../../src/services/progression/types';

export default function ProgressScreen() {
  const { colors } = useTheme();

  const progress = useProgressionStore((s) => s.progress);
  const pendingLevelUp = useProgressionStore((s) => s.pendingLevelUp);
  const clearPendingLevelUp = useProgressionStore((s) => s.clearPendingLevelUp);
  const recomputeProgress = useProgressionStore((s) => s.recomputeProgress);

  const [selectedExercise, setSelectedExercise] = useState<ExerciseProgressItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  // Queries for live activity data
  const recordsQuery = useQuery({
    queryKey: ['personal-records'],
    queryFn: () => workoutsApi.listRecords(),
  });

  const sessionsQuery = useQuery({
    queryKey: ['workout-sessions'],
    queryFn: () => workoutsApi.listSessions(),
  });

  const runsQuery = useQuery({
    queryKey: ['completed-runs'],
    queryFn: () => runsApi.listRuns(),
  });

  const isRefreshing =
    sessionsQuery.isRefetching || runsQuery.isRefetching || recordsQuery.isRefetching;

  const onRefresh = async () => {
    await Promise.all([sessionsQuery.refetch(), runsQuery.refetch(), recordsQuery.refetch()]);
  };

  // Synchronize store whenever queries settle
  useEffect(() => {
    const sessions = sessionsQuery.data || [];
    const runs = runsQuery.data || [];
    const records = recordsQuery.data || [];

    recomputeProgress({
      sessions,
      runs,
      records,
      streakDays: 4, // default 4-day consistent weekly streak
    });
  }, [sessionsQuery.data, runsQuery.data, recordsQuery.data]);

  const handleOpenExerciseDetail = (exercise: ExerciseProgressItem) => {
    setSelectedExercise(exercise);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Global AppHeader with Brand Logo and Title */}
      <AppHeader
        showLogo
        logoVariant="full"
        title="Progress"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >

        {/* 1. Unified Progress Header Card (Level, XP, Streak, Overview) */}
        <ProgressionOverviewCard progress={progress} />

        {/* 2. Projected Warrior Rank Ascension (Rank they could achieve) */}
        <WarriorAscensionCard progress={progress} />

        {/* 3. Actionable Next Milestones */}
        <NextMilestoneCard progress={progress} />

        {/* 4. Minimalist Advanced Analytics Collapsible */}
        <View style={styles.toggleSection}>
          <TouchableOpacity
            style={[
              styles.analyticsToggleBtn,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
            onPress={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="trending-up" size={16} color={colors.accent} />
              <Text style={[styles.analyticsToggleText, { color: colors.textPrimary }]}>
                {showDetailedAnalytics
                  ? 'Hide Detailed Analytics'
                  : 'View Detailed Muscle Balance & Charts'}
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={16}
              color={colors.textSecondary}
              style={{
                transform: [{ rotate: showDetailedAnalytics ? '270deg' : '90deg' }],
              }}
            />
          </TouchableOpacity>
        </View>

        {showDetailedAnalytics && (
          <View style={{ marginTop: 8 }}>
            {/* Rank Hierarchy & Balance (Exercise Ranks + Muscle Balance) */}
            <RankHierarchyGrid
              exerciseProgress={progress.exerciseProgress}
              muscleProgress={progress.muscleProgress}
              onSelectExercise={handleOpenExerciseDetail}
            />

            {/* Strength Progression Chart (PB, 1RM, Overload Curve) */}
            <StrengthProgressChart
              exerciseProgress={progress.exerciseProgress}
              onSelectExerciseDetail={handleOpenExerciseDetail}
            />

            {/* Recent Achievements */}
            <RecentAchievementsList achievements={progress.recentAchievements} />
          </View>
        )}
      </ScrollView>

      {/* Exercise Detail Sheet / Modal */}
      <ExerciseDetailProgressModal
        visible={detailModalVisible}
        exercise={selectedExercise}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* Level Up Promotion Celebration Modal */}
      <LevelUpCelebrationModal
        visible={!!pendingLevelUp}
        newLevel={pendingLevelUp?.newLevel || progress.level}
        newTitle={pendingLevelUp?.title || progress.rankTitle}
        onDismiss={clearPendingLevelUp}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 3,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  toggleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  analyticsToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  analyticsToggleText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
