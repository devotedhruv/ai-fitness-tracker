import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { CommunityInsight } from '../../data/communityInsights';

interface InsightCardProps {
  insight: CommunityInsight;
  onPress: (insight: CommunityInsight) => void;
}

export function InsightCard({ insight, onPress }: InsightCardProps) {
  const { colors } = useTheme();

  const isVideo = insight.category === 'VIDEOS' || !!insight.youtubeId;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(insight)}
      activeOpacity={0.75}
    >
      {/* Top Meta Line: Category Badge + Internet Source + Duration */}
      <View style={styles.topMeta}>
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${insight.badgeColor}18`,
                borderColor: insight.badgeColor,
              },
            ]}
          >
            <Icon
              name={isVideo ? 'video' : 'sparkle'}
              size={12}
              color={insight.badgeColor}
            />
            <Text style={[styles.badgeText, { color: insight.badgeColor }]}>
              {insight.categoryName.toUpperCase()}
            </Text>
          </View>

          {insight.sourceName ? (
            <View style={[styles.sourcePill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.sourcePillText, { color: colors.textSecondary }]} numberOfLines={1}>
                {isVideo ? '▶ ' : '🌐 '}{insight.sourceName}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.timeWrap}>
          {insight.videoDuration && (
            <View style={[styles.videoPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.videoPillText}>▶ {insight.videoDuration}</Text>
            </View>
          )}
          <Text style={[styles.readTime, { color: colors.mutedText }]}>
            {insight.readTime}
          </Text>
        </View>
      </View>

      {/* Video Thumbnail (if YouTube or attached thumbnail) */}
      {insight.videoThumbnail ? (
        <View style={[styles.thumbnailWrap, { borderColor: colors.border }]}>
          <Image
            source={{ uri: insight.videoThumbnail }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View style={[styles.playCircle, { backgroundColor: colors.accent }]}>
              <Icon name="play" size={18} color="#000000" />
            </View>
          </View>
          {insight.videoDuration ? (
            <View style={styles.thumbnailDurationBadge}>
              <Text style={styles.thumbnailDurationText}>{insight.videoDuration}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {insight.title}
      </Text>

      {/* Summary */}
      <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
        {insight.summary}
      </Text>

      {/* Key Takeaway Teaser */}
      {insight.keyTakeaways[0] ? (
        <View
          style={[
            styles.takeawayBox,
            {
              backgroundColor: colors.surfaceElevated,
              borderLeftColor: insight.badgeColor,
            },
          ]}
        >
          <Text style={[styles.takeawayText, { color: colors.textPrimary }]} numberOfLines={1}>
            💡 {insight.keyTakeaways[0]}
          </Text>
        </View>
      ) : null}

      {/* Footer: Author & Engagement */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.authorRow}>
          <Avatar name={insight.author.name} size="sm" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={[styles.authorName, { color: colors.textPrimary }]} numberOfLines={1}>
              {insight.author.name}
            </Text>
            <Text style={[styles.authorRole, { color: colors.textSecondary }]} numberOfLines={1}>
              {insight.author.role}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {insight.sourceUrl ? (
            <View style={styles.externalIndicator}>
              <Text style={[styles.externalText, { color: colors.accent }]}>Internet Link ↗</Text>
            </View>
          ) : null}

          <View style={styles.statItem}>
            <Icon name="heart" size={13} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {insight.likesCount}
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 0.5,
  },
  sourcePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 140,
  },
  sourcePillText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoPillText: {
    fontSize: 10,
    color: '#F59E0B',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  readTime: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  thumbnailWrap: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbnailDurationText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  title: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 22,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 18,
    marginBottom: 12,
  },
  takeawayBox: {
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  takeawayText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  authorName: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  authorRole: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  externalIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  externalText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
