import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { RankInsignia } from '../RankInsignia';
import { getRankProgress, MILITARY_RANKS } from '../../services/progression/rankConfig';
import { UserProgress } from '../../services/progression/types';

interface WarriorAscensionCardProps {
  progress: UserProgress;
  onPressAction?: () => void;
  compact?: boolean;
}

export function WarriorAscensionCard({
  progress,
  onPressAction,
  compact = false,
}: WarriorAscensionCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const rankInfo = getRankProgress(progress.totalXP);
  const { currentRank, nextRank, progressPercentage, xpToNextRank, isMaxRank } = rankInfo;

  // Estimated workouts needed (average 150 XP per completed workout)
  const workoutsNeeded = Math.max(1, Math.ceil(xpToNextRank / 150));

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
      {/* Top Banner Tag */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.tagBadge,
            {
              backgroundColor: 'rgba(184, 245, 0, 0.12)',
              borderColor: colors.accent,
            },
          ]}
        >
          <Icon name="medal" size={13} color={colors.accent} />
          <Text style={[styles.tagBadgeText, { color: colors.accent }]}>
            WARRIOR ASCENSION PATH
          </Text>
        </View>

        <View
          style={[
            styles.tierPill,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.tierPillText, { color: colors.textSecondary }]}>
            Tier {currentRank.tier} of 12
          </Text>
        </View>
      </View>

      {/* Hero Rank Ascension Showcase */}
      <View style={styles.ascensionShowcase}>
        {/* Row 1: The Insignia Square Boxes + Perfectly Centered Horizontal Connector */}
        <View style={styles.boxesRow}>
          {/* Current Rank Box */}
          <View
            style={[
              styles.insigniaWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <RankInsignia
              rankIdOrType={currentRank.insigniaType}
              size={compact ? 44 : 50}
              color={colors.accent}
            />
          </View>

          {/* Horizontal Connector Arrow */}
          <View style={styles.connectorWrap}>
            <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
            <View
              style={[
                styles.arrowCircle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Icon name="arrow-right" size={14} color={colors.accent} />
            </View>
            <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Next Achievable Rank Box */}
          <View
            style={[
              styles.insigniaWrap,
              {
                backgroundColor: 'rgba(184, 245, 0, 0.08)',
                borderColor: colors.accent,
              },
            ]}
          >
            {nextRank ? (
              <RankInsignia
                rankIdOrType={nextRank.insigniaType}
                size={compact ? 44 : 50}
                color={colors.accent}
              />
            ) : (
              <Icon name="trophy" size={32} color={colors.accent} />
            )}
          </View>
        </View>

        {/* Row 2: Labels & Titles directly aligned beneath each box */}
        <View style={styles.labelsRow}>
          <View style={styles.labelCol}>
            <Text style={[styles.rankLabel, { color: colors.textSecondary }]}>CURRENT</Text>
            <Text
              style={[styles.rankTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {currentRank.name}
            </Text>
          </View>

          <View style={styles.labelColSpacer} />

          <View style={styles.labelCol}>
            <Text style={[styles.rankLabel, { color: colors.accent }]}>
              {isMaxRank ? 'MAX RANK' : 'NEXT ASCENSION'}
            </Text>
            <Text
              style={[styles.rankTitle, { color: colors.accent }]}
              numberOfLines={1}
            >
              {nextRank ? nextRank.name : 'WARMASTER SUPREME'}
            </Text>
          </View>
        </View>
      </View>

      {/* Target Message & Motivation */}
      {!isMaxRank && nextRank ? (
        <View
          style={[
            styles.motivationBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.motivationHeader}>
            <Icon name="flame" size={15} color="#FF9500" />
            <Text style={[styles.motivationTitle, { color: colors.textPrimary }]}>
              {xpToNextRank.toLocaleString()} XP away from {nextRank.name}
            </Text>
          </View>
          <Text style={[styles.motivationDesc, { color: colors.textSecondary }]}>
            Complete{' '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              ~{workoutsNeeded} more workouts
            </Text>{' '}
            this week to ascend to Tier {nextRank.tier} and forge your legacy.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.motivationBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.motivationTitle, { color: colors.accent }]}>
            Apex Warmaster Supreme Rank Achieved!
          </Text>
          <Text style={[styles.motivationDesc, { color: colors.textSecondary }]}>
            You have conquered all 12 warrior tiers. Continue conquering personal records!
          </Text>
        </View>
      )}

      {/* Progress Bar to Next Ascension */}
      <View style={styles.progressWrap}>
        <View style={styles.progressHeaderRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Ascension Progress
          </Text>
          <Text style={[styles.progressVal, { color: colors.accent }]}>
            {progressPercentage}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(4, progressPercentage))}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      </View>

      {/* Upcoming Ranks Roadmap Preview (when not compact) */}
      {!compact && (
        <View style={[styles.roadmapSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.roadmapTitle, { color: colors.textSecondary }]}>
            WARRIOR HIERARCHY PREVIEW
          </Text>

          <View style={styles.roadmapGrid}>
            {/* Row 1: Initiate, Bronze, Steel */}
            <View style={styles.roadmapRow}>
              {MILITARY_RANKS.slice(0, 3).map((r) => {
                const isUnlocked = progress.totalXP >= r.minXP;
                const isNext = nextRank?.id === r.id;

                return (
                  <View
                    key={r.id}
                    style={[
                      styles.roadmapBox,
                      {
                        backgroundColor: isNext
                          ? 'rgba(184, 245, 0, 0.15)'
                          : isUnlocked
                          ? colors.surface
                          : colors.backgroundSecondary,
                        borderColor: isNext
                          ? colors.accent
                          : isUnlocked
                          ? colors.border
                          : 'rgba(255,255,255,0.06)',
                      },
                    ]}
                  >
                    <RankInsignia
                      rankIdOrType={r.insigniaType}
                      size="sm"
                      color={isNext ? colors.accent : isUnlocked ? colors.textPrimary : colors.mutedText}
                    />
                    <Text
                      style={[
                        styles.roadmapBoxText,
                        {
                          color: isNext
                            ? colors.accent
                            : isUnlocked
                            ? colors.textPrimary
                            : colors.mutedText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {r.name.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Row 2: Spartan, Shadow, Crimson */}
            <View style={styles.roadmapRow}>
              {MILITARY_RANKS.slice(3, 6).map((r) => {
                const isUnlocked = progress.totalXP >= r.minXP;
                const isNext = nextRank?.id === r.id;

                return (
                  <View
                    key={r.id}
                    style={[
                      styles.roadmapBox,
                      {
                        backgroundColor: isNext
                          ? 'rgba(184, 245, 0, 0.15)'
                          : isUnlocked
                          ? colors.surface
                          : colors.backgroundSecondary,
                        borderColor: isNext
                          ? colors.accent
                          : isUnlocked
                          ? colors.border
                          : 'rgba(255,255,255,0.06)',
                      },
                    ]}
                  >
                    <RankInsignia
                      rankIdOrType={r.insigniaType}
                      size="sm"
                      color={isNext ? colors.accent : isUnlocked ? colors.textPrimary : colors.mutedText}
                    />
                    <Text
                      style={[
                        styles.roadmapBoxText,
                        {
                          color: isNext
                            ? colors.accent
                            : isUnlocked
                            ? colors.textPrimary
                            : colors.mutedText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {r.name.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Action CTA */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.8}
        onPress={() => {
          if (onPressAction) {
            onPressAction();
          } else {
            router.push('/workout/active');
          }
        }}
      >
        <Icon name="play" size={16} color={colors.onAccent} />
        <Text style={[styles.actionBtnText, { color: colors.onAccent }]}>
          Train Now (+150 XP)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  tagBadgeText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.6,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierPillText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  ascensionShowcase: {
    marginBottom: 14,
  },
  boxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  connectorLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelCol: {
    width: 120,
    alignItems: 'center',
  },
  labelColSpacer: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.6,
    marginBottom: 2,
    textAlign: 'center',
  },
  rankTitle: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  motivationBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  motivationTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  motivationDesc: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 17,
  },
  progressWrap: {
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  progressVal: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  roadmapSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 14,
  },
  roadmapTitle: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  roadmapGrid: {
    gap: 8,
  },
  roadmapRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roadmapBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  roadmapBoxText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
