import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../../src/services/api';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { StateView } from '../../src/components/StateView';
import { Icon, IconName } from '../../src/components/Icon';

const LEADERBOARD_EXERCISES = [
  'Barbell Bench Press',
  'Barbell Deadlift',
  'Barbell Squat',
  'Overhead Press',
  'Pull-up',
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const { colors, typography, spacing, isDark } = useTheme();
  const [selectedLift, setSelectedLift] = useState('Barbell Bench Press');

  const leaderboardQuery = useQuery({
    queryKey: ['social-leaderboard', selectedLift],
    queryFn: () => socialApi.getLeaderboard(selectedLift),
  });

  const entries = leaderboardQuery.data?.leaderboard || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
          PR Progression
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/social/streaks')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(184, 245, 0, 0.15)' : 'rgba(120, 168, 0, 0.12)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.accent,
          }}
        >
          <Icon name="award" size={14} color={colors.accent} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>Rank & XP</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 10 }}>
        {/* Lift Selector Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {LEADERBOARD_EXERCISES.map((lift) => (
            <Chip
              key={lift}
              label={lift}
              selected={selectedLift === lift}
              onPress={() => setSelectedLift(lift)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard Table */}
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StateView
          loading={leaderboardQuery.isLoading}
          error={leaderboardQuery.error?.message}
          empty={entries.length === 0}
          emptyTitle="No records for this lift yet"
          emptyDescription="Be the first athlete to log a personal record!"
          onRetry={() => leaderboardQuery.refetch()}
        >
          {entries.map((entry: any) => {
            const isPodium = entry.rank <= 3;
            const medalIcon: IconName | null =
              entry.rank === 1 ? 'medal-gold' : entry.rank === 2 ? 'medal-silver' : entry.rank === 3 ? 'medal-bronze' : null;

            return (
              <Card
                key={entry.userId}
                style={[
                  styles.entryCard,
                  {
                    borderColor: isPodium ? colors.accent : colors.border,
                    backgroundColor: isPodium
                      ? isDark ? 'rgba(184, 245, 0, 0.08)' : 'rgba(120, 168, 0, 0.05)'
                      : colors.surface,
                  },
                ]}
              >
                <View style={styles.rankCol}>
                  {medalIcon ? (
                    <Icon name={medalIcon} size={24} />
                  ) : (
                    <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>
                      #{entry.rank}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {entry.userName}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {entry.exerciseName}
                  </Text>
                </View>

                <View style={styles.scoreCol}>
                  <Text style={[styles.weightText, { color: colors.accent }]}>
                    {entry.weightKg} kg
                  </Text>
                </View>
              </Card>
            );
          })}
        </StateView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rankCol: {
    width: 36,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  weightText: {
    fontSize: 18,
    fontWeight: '900',
  },
});
