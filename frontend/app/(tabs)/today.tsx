import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/theme';
import {
  AppHeader,
  AppCard,
  AppButton,
  AppStatCard,
  AppBadge,
} from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressionStore } from '../../src/stores/progressionStore';
import { useSocialStore } from '../../src/stores/socialStore';
import { workoutsApi, runsApi } from '../../src/services/api';
import { ActivityContributionGraph } from '../../src/components/progress/ActivityContributionGraph';
import { TrainingProgressWeeklyCard } from '../../src/components/progress/TrainingProgressWeeklyCard';
import { WarriorAscensionCard } from '../../src/components/progress/WarriorAscensionCard';

export default function TodayScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuthStore();
  const progress = useProgressionStore((s) => s.progress);
  const recomputeProgress = useProgressionStore((s) => s.recomputeProgress);
  const unreadCount = useSocialStore((s) => s.unreadNotificationsCount());

  // Sync latest workout sessions, runs, and records
  const sessionsQuery = useQuery({
    queryKey: ['workout-sessions'],
    queryFn: () => workoutsApi.listSessions(),
  });

  const runsQuery = useQuery({
    queryKey: ['completed-runs'],
    queryFn: () => runsApi.listRuns(),
  });

  const recordsQuery = useQuery({
    queryKey: ['personal-records'],
    queryFn: () => workoutsApi.listRecords(),
  });

  useEffect(() => {
    if (sessionsQuery.isSuccess || runsQuery.isSuccess || recordsQuery.isSuccess) {
      const sessions = sessionsQuery.data || [];
      const runs = runsQuery.data || [];
      const records = recordsQuery.data || [];
      recomputeProgress({ sessions, runs, records });
    }
  }, [
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    runsQuery.isSuccess,
    runsQuery.data,
    recordsQuery.isSuccess,
    recordsQuery.data,
    recomputeProgress,
  ]);

  const displayName = user?.profile?.displayName || 'Athlete';
  const targetDays = user?.profile?.daysPerWeek || 4;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Global AppHeader with Brand Logo and Notification Center Action */}
      <AppHeader
        showLogo
        logoVariant="full"
        rightActions={
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push('/(tabs)/community')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Notifications"
          >
            <Icon name="bell" size={20} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.notifText, { color: colors.onAccent }]}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
        {/* Welcome Row */}
        <View style={styles.greetingHeader}>
          <Text style={[typography.label, { color: colors.accent }]}>
            TODAY'S READINESS
          </Text>
          <Text style={[typography.heading1, { color: colors.textPrimary, marginTop: 4 }]}>
            Hey, {displayName}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
            Consistency is your daily Sadhana. Ready to train?
          </Text>
        </View>

        {/* Streak Activity Calendar (Positioned at TOP) */}
        <ActivityContributionGraph
          activityData={progress.activityMatrix}
          containerMarginHorizontal={0}
          numWeeks={52}
          title="DAILY STREAK CALENDAR"
          subtitle="Every month & day consistency tracker"
          currentStreak={progress.streakDays || 5}
          showRangeToggle={true}
        />

        {/* Weekly Goal & Streak Overview */}
        <View style={[styles.statsRow, { marginBottom: spacing.md }]}>
          <AppStatCard
            label="Weekly Goal"
            value={`2 / ${targetDays}`}
            unit="workouts"
            subtitle="50% completed"
            highlight
            style={{ flex: 1 }}
          />
          <View style={{ width: spacing.md }} />
          <AppStatCard
            label="Current Streak"
            value={String(progress.streakDays || 5)}
            unit="days"
            subtitle="Personal Best: 14"
            highlight
            style={{ flex: 1 }}
          />
        </View>

        {/* Hero Recommended Action (Max 2 taps to start) */}
        <AppCard variant="accent" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <AppBadge label="RECOMMENDED NEXT" variant="accent" size="small" />
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>~50 min</Text>
          </View>

          <Text style={[typography.heading2, { color: colors.textPrimary, marginTop: 10 }]}>
            Push Day: Chest & Delts
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
            4 exercises • Bench Press, OHP, Incline Dumbbell, Dips
          </Text>

          <AppButton
            title="Start Workout"
            onPress={() => router.push('/workout/active')}
            variant="primary"
            size="medium"
            leftIcon={<Icon name="play" size={16} color={colors.onAccent} />}
          />
        </AppCard>

        {/* Alternative Quick Action: Outdoor GPS Run (directly below Start Workout) */}
        <AppCard style={{ marginBottom: spacing.md }}>
          <View style={styles.actionRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
                Outdoor GPS Run
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Track live route, pace, splits, and elevation
              </Text>
            </View>
            <AppButton
              title="Go Run"
              onPress={() => router.push('/run/active')}
              variant="secondary"
              size="small"
              leftIcon={<Icon name="runner" size={14} color={colors.textPrimary} />}
            />
          </View>
        </AppCard>

        {/* Weekly Training Progress Dashboard */}
        <TrainingProgressWeeklyCard dashboard={progress.weeklyDashboard} />

        {/* Projected Warrior Rank Ascension */}
        <WarriorAscensionCard progress={progress} />

        {/* Last Workout Summary */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>
            LAST COMPLETED WORKOUT
          </Text>
          <View style={styles.lastWorkoutHeader}>
            <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
              Pull Day (Back & Biceps)
            </Text>
            <Text style={[typography.captionBold, { color: colors.accent }]}>
              2 days ago
            </Text>
          </View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 6 }]}>
            Total Volume: 4,280 kg • 16 sets completed • 1 PR achieved (Deadlift 140kg)
          </Text>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1 },
  headerActionBtn: {
    padding: 6,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    fontSize: 10,
    fontWeight: '800',
  },
  greetingHeader: {
    marginBottom: 18,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
