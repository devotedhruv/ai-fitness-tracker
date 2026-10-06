import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon, IconName } from '../Icon';
import { AchievementItem } from '../../services/progression/types';

interface RecentAchievementsListProps {
  achievements: AchievementItem[];
  onViewAll?: () => void;
}

export function RecentAchievementsList({ achievements, onViewAll }: RecentAchievementsListProps) {
  const { colors } = useTheme();

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
            Recent Achievements
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Milestones and badges unlocked
          </Text>
        </View>

        {onViewAll && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onViewAll}
            style={[styles.viewAllBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.viewAllText, { color: colors.accent }]}>View All</Text>
            <Icon name="chevron-right" size={12} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.list}>
        {achievements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="medal" size={28} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Unlock badges by setting PRs and staying consistent!
            </Text>
          </View>
        ) : (
          achievements.slice(0, 4).map((ach) => {
            const iconName: IconName = (ach.icon as IconName) || 'trophy';
            return (
              <View
                key={ach.id}
                style={[
                  styles.achievementItem,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: 'rgba(184, 245, 0, 0.12)',
                      borderColor: 'rgba(184, 245, 0, 0.3)',
                    },
                  ]}
                >
                  <Icon name={iconName} size={18} color={colors.accent} />
                </View>

                <View style={styles.infoCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                      {ach.title}
                    </Text>
                    <View style={[styles.xpBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.xpBadgeText}>+{ach.xpAwarded} XP</Text>
                    </View>
                  </View>
                  <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
                    {ach.description}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
    marginBottom: 16,
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  list: {
    gap: 10,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    flex: 1,
    paddingRight: 6,
  },
  xpBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  description: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
