import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppProgressBar } from '../AppProgressBar';
import { AppBadge } from '../AppBadge';
import { Icon } from '../../Icon';

export interface ChallengeCardProps {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  daysRemaining: number;
  participantsCount: number;
  userRank?: number;
  isJoined?: boolean;
  badgeReward?: string;
  onJoin?: () => void;
  onLogProgress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ChallengeCard({
  title,
  description,
  targetAmount,
  currentAmount,
  unit,
  daysRemaining,
  participantsCount,
  userRank,
  isJoined = false,
  badgeReward,
  onJoin,
  onLogProgress,
  style,
}: ChallengeCardProps) {
  const { colors, typography } = useTheme();
  const progressRatio = targetAmount > 0 ? Math.min(1, currentAmount / targetAmount) : 0;
  const percent = Math.round(progressRatio * 100);

  return (
    <AppCard variant={isJoined ? 'accent' : 'default'} style={style}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <AppBadge
          label={`${daysRemaining}D LEFT`}
          variant={daysRemaining <= 5 ? 'warning' : 'neutral'}
          size="small"
        />
      </View>

      {/* Progress Bar & Stats */}
      <View style={{ marginTop: 12 }}>
        <AppProgressBar
          progress={progressRatio}
          height={6}
          label={`${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()} ${unit}`}
          showPercentage
        />
      </View>

      {/* Footer Info Row */}
      <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
        <View style={styles.metaCol}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            👥 {participantsCount} athletes
            {userRank ? ` • Rank #${userRank}` : ''}
          </Text>
          {badgeReward && (
            <Text style={[typography.captionBold, { color: colors.accentText, marginTop: 2 }]}>
              🏆 {badgeReward}
            </Text>
          )}
        </View>

        {isJoined ? (
          onLogProgress && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accentMuted, borderColor: colors.primary }]}
              onPress={onLogProgress}
              activeOpacity={0.8}
            >
              <Text style={[typography.captionBold, { color: colors.accentText }]}>+ Log Effort</Text>
            </TouchableOpacity>
          )
        ) : (
          onJoin && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={onJoin}
              activeOpacity={0.8}
            >
              <Text style={[typography.captionBold, { color: colors.onPrimary }]}>Join Challenge</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaCol: {
    flex: 1,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
});
