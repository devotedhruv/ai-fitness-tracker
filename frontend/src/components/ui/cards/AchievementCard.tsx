import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppBadge } from '../AppBadge';
import { Icon } from '../../Icon';

export interface AchievementCardProps {
  title: string;
  description: string;
  disciplineCategory: 'TAPAS' | 'BALA' | 'VIRYA' | 'SADHANA' | 'VAJRA';
  milestoneValue?: string;
  unlockedAt?: string;
  isUnlocked?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AchievementCard({
  title,
  description,
  disciplineCategory,
  milestoneValue,
  unlockedAt,
  isUnlocked = true,
  style,
}: AchievementCardProps) {
  const { colors, typography } = useTheme();

  return (
    <AppCard
      variant={isUnlocked ? 'accent' : 'default'}
      style={[{ opacity: isUnlocked ? 1 : 0.65 }, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Icon name="award" size={20} color={isUnlocked ? colors.accent : colors.textSecondary} />
        </View>

        <View style={styles.titleCol}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {description}
          </Text>
        </View>

        <AppBadge
          label={disciplineCategory}
          variant={isUnlocked ? 'accent' : 'neutral'}
          size="small"
        />
      </View>

      {(milestoneValue || unlockedAt) && (
        <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
          {milestoneValue && (
            <Text style={[typography.captionBold, { color: colors.accentText }]}>
              {milestoneValue}
            </Text>
          )}
          {unlockedAt && (
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 'auto' }]}>
              Unlocked {unlockedAt}
            </Text>
          )}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});
