import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppProgressBar } from '../AppProgressBar';
import { AppBadge } from '../AppBadge';

export interface ProgressCardProps {
  title: string;
  rankName: string;
  level: number;
  currentXP: number;
  targetXP: number;
  streakDays: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressCard({
  title,
  rankName,
  level,
  currentXP,
  targetXP,
  streakDays,
  style,
}: ProgressCardProps) {
  const { colors, typography } = useTheme();
  const progressRatio = targetXP > 0 ? Math.min(1, currentXP / targetXP) : 1;

  return (
    <AppCard style={style}>
      <View style={styles.topRow}>
        <View>
          <Text style={[typography.label, { color: colors.textSecondary }]}>{title}</Text>
          <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 2 }]}>
            {rankName}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <AppBadge label={`LVL ${level}`} variant="accent" size="small" />
          <View style={{ width: 6 }} />
          <AppBadge label={`🔥 ${streakDays}D`} variant="warning" size="small" />
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <AppProgressBar
          progress={progressRatio}
          height={6}
          label={`${currentXP.toLocaleString()} / ${targetXP.toLocaleString()} XP`}
          showPercentage
        />
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
