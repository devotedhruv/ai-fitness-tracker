import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppBadge } from '../AppBadge';
import { Icon } from '../../Icon';

export interface WorkoutCardProps {
  title: string;
  category?: string;
  durationMinutes?: number;
  exercisesCount: number;
  setsCount?: number;
  volumeKg?: number;
  onPress: () => void;
  onStart?: () => void;
  onOptions?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function WorkoutCard({
  title,
  category,
  durationMinutes,
  exercisesCount,
  setsCount,
  volumeKg,
  onPress,
  onStart,
  onOptions,
  style,
}: WorkoutCardProps) {
  const { colors, typography } = useTheme();

  return (
    <AppCard onPress={onPress} style={style}>
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {category && (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {category}
            </Text>
          )}
        </View>

        {onOptions && (
          <TouchableOpacity
            onPress={onOptions}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.optionsBtn}
            accessibilityLabel="Routine Options"
          >
            <Icon name="more-vertical" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
            {exercisesCount}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            Exercises
          </Text>
        </View>

        {setsCount !== undefined && (
          <View style={styles.metricItem}>
            <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
              {setsCount}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              Sets
            </Text>
          </View>
        )}

        {durationMinutes !== undefined && (
          <View style={styles.metricItem}>
            <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
              {durationMinutes}m
            </Text>
          </View>
        )}

        {volumeKg !== undefined && volumeKg > 0 && (
          <View style={styles.volumeBadge}>
            <AppBadge
              label={`${Math.round(volumeKg).toLocaleString()} KG`}
              variant="accent"
              size="small"
            />
          </View>
        )}
      </View>

      {onStart && (
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Icon name="play" size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[typography.captionBold, { color: colors.accent }]}>Start Routine</Text>
        </TouchableOpacity>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  optionsBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeBadge: {
    marginLeft: 'auto',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});
