import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { CommunityInsight } from '../../data/communityInsights';

interface InsightDetailModalProps {
  visible: boolean;
  insight: CommunityInsight | null;
  onClose: () => void;
}

export function InsightDetailModal({ visible, insight, onClose }: InsightDetailModalProps) {
  const { colors, typography } = useTheme();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(insight?.likesCount || 0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  React.useEffect(() => {
    if (insight) {
      setIsLiked(!!insight.isLiked);
      setLikesCount(insight.likesCount);
      setIsPlayingVideo(false);
    }
  }, [insight]);

  if (!insight) return null;

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleOpenSource = () => {
    const targetUrl =
      insight.sourceUrl ||
      (insight.youtubeId ? `https://www.youtube.com/watch?v=${insight.youtubeId}` : undefined);
    if (targetUrl) {
      Linking.openURL(targetUrl).catch((err) =>
        console.warn('Could not open external URL:', err)
      );
    }
  };

  const isVideo = insight.category === 'VIDEOS' || !!insight.youtubeId;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right', 'bottom']}
      >
        {/* Top Header Bar */}
        <View style={[styles.navBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {insight.categoryName}
          </Text>

          <TouchableOpacity
            style={styles.heartBtn}
            onPress={handleToggleLike}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name="heart"
              size={20}
              color={isLiked ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Category Tag & Read Time */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${insight.badgeColor}20`, borderColor: insight.badgeColor },
              ]}
            >
              <Text style={[styles.categoryBadgeText, { color: insight.badgeColor }]}>
                {insight.categoryName.toUpperCase()}
              </Text>
            </View>

            {insight.sourceName ? (
              <View style={[styles.sourceBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.sourceBadgeText, { color: colors.textSecondary }]}>
                  {isVideo ? '▶ ' : '🌐 '}{insight.sourceName}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.readTimeText, { color: colors.mutedText }]}>
              {insight.readTime}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {insight.title}
          </Text>

          {/* Author Row */}
          <View
            style={[
              styles.authorBox,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Avatar name={insight.author.name} size="md" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.authorName, { color: colors.textPrimary }]}>
                {insight.author.name}
              </Text>
              <Text style={[styles.authorRole, { color: colors.textSecondary }]}>
                {insight.author.role}
              </Text>
            </View>
          </View>

          {/* Video Guide Player Box */}
          {isVideo && (
            <View
              style={[
                styles.videoCard,
                { backgroundColor: '#0A0A0A', borderColor: colors.border },
              ]}
            >
              {Platform.OS === 'web' && insight.youtubeId ? (
                <View style={styles.iframeWrap}>
                  <iframe
                    src={`https://www.youtube.com/embed/${insight.youtubeId}?rel=0&modestbranding=1`}
                    title={insight.title}
                    style={{
                      width: '100%',
                      height: 220,
                      border: 'none',
                      borderRadius: 12,
                    } as any}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </View>
              ) : insight.videoThumbnail ? (
                <TouchableOpacity
                  style={styles.thumbnailPlayer}
                  onPress={handleOpenSource}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: insight.videoThumbnail }}
                    style={styles.modalThumbnailImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalPlayOverlay}>
                    <View style={[styles.playButtonCircle, { backgroundColor: colors.accent }]}>
                      <Icon name="play" size={24} color="#000000" />
                    </View>
                    <Text style={styles.videoDurationBadge}>
                      Watch on YouTube ({insight.videoDuration})
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.videoPlayerPlaceholder}>
                  <TouchableOpacity
                    style={[styles.playButtonCircle, { backgroundColor: colors.accent }]}
                    onPress={() => setIsPlayingVideo(!isPlayingVideo)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={isPlayingVideo ? 'pause' : 'play'}
                      size={24}
                      color="#000000"
                    />
                  </TouchableOpacity>

                  <View style={styles.videoOverlayInfo}>
                    <Text style={styles.videoDurationBadge}>
                      {isPlayingVideo ? 'Demonstration Active' : `Watch Breakdown (${insight.videoDuration || 'Video'})`}
                    </Text>
                  </View>
                </View>
              )}

              {/* Direct YouTube Watch Button */}
              {insight.youtubeId || insight.sourceUrl ? (
                <TouchableOpacity
                  style={[styles.watchExternalBtn, { backgroundColor: '#FF0000' }]}
                  onPress={handleOpenSource}
                  activeOpacity={0.8}
                >
                  <Icon name="video" size={16} color="#FFFFFF" />
                  <Text style={styles.watchExternalText}>
                    Watch Full Video on YouTube ↗
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* External Internet Article Callout Button */}
          {insight.sourceUrl && !insight.youtubeId ? (
            <TouchableOpacity
              style={[styles.externalArticleBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}
              onPress={handleOpenSource}
              activeOpacity={0.8}
            >
              <View style={styles.externalBtnContent}>
                <Icon name="link" size={18} color={colors.accent} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.externalBtnTitle, { color: colors.accent }]}>
                    Read Original Article on {insight.sourceName || 'the Web'} ↗
                  </Text>
                  <Text style={[styles.externalBtnSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {insight.sourceUrl}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Executive Summary */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: colors.accent }]}>
              EXECUTIVE SUMMARY
            </Text>
            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
              {insight.summary}
            </Text>
          </View>

          {/* Key Takeaways */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Icon name="check-circle" size={16} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Key Takeaways
              </Text>
            </View>

            {insight.keyTakeaways.map((takeaway, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={[styles.bulletDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.bulletText, { color: colors.textPrimary }]}>
                  {takeaway}
                </Text>
              </View>
            ))}
          </View>

          {/* Coaching Cues */}
          {insight.coachingCues.length > 0 && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Icon name="sparkle" size={16} color="#38BDF8" />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Mental Coaching Cues
                </Text>
              </View>

              {insight.coachingCues.map((cue, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.cueCard,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.cueText, { color: colors.accent }]}>
                    {cue}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Detailed Content */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Icon name="clipboard" size={16} color={colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                In-Depth Breakdown
              </Text>
            </View>
            <Text style={[styles.bodyContent, { color: colors.textSecondary }]}>
              {insight.content}
            </Text>
          </View>

          {/* Common Mistakes to Avoid */}
          {insight.commonMistakes.length > 0 && (
            <View
              style={[
                styles.mistakesBox,
                { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Icon name="alert" size={16} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
                  Common Mistakes to Avoid
                </Text>
              </View>

              {insight.commonMistakes.map((mistake, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.mistakeIcon}>✕</Text>
                  <Text style={[styles.bulletText, { color: colors.textPrimary }]}>
                    {mistake}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsRow}>
            {insight.tags.map((tag, idx) => (
              <View
                key={idx}
                style={[
                  styles.tagPill,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Was This Helpful Feedback */}
          <View
            style={[
              styles.feedbackCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.feedbackTitle, { color: colors.textPrimary }]}>
              Did you find this guide helpful?
            </Text>
            <View style={styles.feedbackActions}>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  isLiked
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
                onPress={handleToggleLike}
              >
                <Icon
                  name="heart"
                  size={16}
                  color={isLiked ? '#000000' : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.feedbackBtnText,
                    { color: isLiked ? '#000000' : colors.textPrimary },
                  ]}
                >
                  {isLiked ? 'Helpful!' : 'Helpful'} ({likesCount})
                </Text>
              </TouchableOpacity>

              {insight.sourceUrl ? (
                <TouchableOpacity
                  style={[
                    styles.feedbackBtn,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                  onPress={handleOpenSource}
                >
                  <Icon name="link" size={16} color={colors.accent} />
                  <Text style={[styles.feedbackBtnText, { color: colors.accent }]}>
                    Visit Source ↗
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  navTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heartBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sourceBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
  },
  readTimeText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 16,
  },
  authorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  authorName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  authorRole: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
  videoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  iframeWrap: {
    width: '100%',
    height: 220,
  },
  thumbnailPlayer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  modalThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  modalPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayerPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070E',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  videoOverlayInfo: {
    alignItems: 'center',
  },
  videoDurationBadge: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  watchExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  watchExternalText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  externalArticleBtn: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  externalBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalBtnTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  externalBtnSub: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  mistakeIcon: {
    color: '#EF4444',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 13,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  cueCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  cueText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  bodyContent: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  mistakesBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    marginBottom: 12,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  feedbackBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
});
