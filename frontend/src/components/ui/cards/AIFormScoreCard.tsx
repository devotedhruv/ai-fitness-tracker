import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppBadge } from '../AppBadge';
import { AppDivider } from '../AppDivider';

export interface AIFormScoreCardProps {
  score: number; // e.g. 94 (percentage)
  repsCount: number; // e.g. 12
  targetReps?: number; // e.g. 12
  goodFormCount: number; // e.g. 10
  needsImprovementCount: number; // e.g. 2
  feedbackSummary?: string; // e.g. "Excellent"
  style?: StyleProp<ViewStyle>;
}

export function AIFormScoreCard({
  score,
  repsCount,
  targetReps = 12,
  goodFormCount,
  needsImprovementCount,
  feedbackSummary = 'Excellent',
  style,
}: AIFormScoreCardProps) {
  const { colors, typography } = useTheme();

  return (
    <AppCard variant="accent" style={style}>
      {/* Top Banner: FORM SCORE + Big 94% + Feedback */}
      <View style={styles.topRow}>
        <View style={styles.scoreCol}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>FORM SCORE</Text>
          <View style={styles.scoreValueRow}>
            <Text style={[typography.statisticsHuge, { color: colors.accent }]}>
              {score}%
            </Text>
          </View>
        </View>

        <View style={styles.badgeCol}>
          <AppBadge
            label={feedbackSummary}
            variant="accent"
            size="medium"
          />
        </View>
      </View>

      <AppDivider marginVertical={14} />

      {/* Metrics Grid: Reps, Good Form, Needs Improvement */}
      <View style={styles.statsGrid}>
        {/* Reps */}
        <View style={styles.statBox}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>Reps</Text>
          <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 4 }]}>
            {repsCount} / {targetReps}
          </Text>
        </View>

        {/* Good Form */}
        <View style={styles.statBox}>
          <Text style={[typography.label, { color: colors.success }]}>Good Form</Text>
          <Text style={[typography.headingMedium, { color: colors.success, marginTop: 4 }]}>
            {goodFormCount}
          </Text>
        </View>

        {/* Needs Improvement */}
        <View style={styles.statBox}>
          <Text style={[typography.label, { color: colors.textSecondary }]}>Needs Improvement</Text>
          <Text
            style={[
              typography.headingMedium,
              { color: needsImprovementCount > 0 ? colors.warning : colors.textSecondary, marginTop: 4 },
            ]}
          >
            {needsImprovementCount}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCol: {
    flex: 1,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
});
