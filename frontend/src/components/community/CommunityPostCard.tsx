import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { RankInsignia } from '../RankInsignia';
import {
  CommunityPost,
  WorkoutPostMetadata,
  useSocialStore,
} from '../../stores/socialStore';

export type { CommunityPost };

export interface CommunityPostCardProps {
  post: CommunityPost;
  onPostUpdated?: (updated: CommunityPost) => void;
  onPostDeleted?: (postId: string) => void;
  onOpenComments?: (postId: string) => void;
  onOpenReport?: (postId: string) => void;
  onOpenProfile?: (userId: string) => void;
  onOpenWorkoutDetail?: (workoutData: WorkoutPostMetadata, post: CommunityPost) => void;
  onOpenLikesList?: (post: CommunityPost) => void;
  onOpenShare?: (post: CommunityPost) => void;
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CommunityPostCard({
  post,
  onPostUpdated,
  onPostDeleted,
  onOpenComments,
  onOpenReport,
  onOpenProfile,
  onOpenWorkoutDetail,
  onOpenLikesList,
  onOpenShare,
}: CommunityPostCardProps) {
  const { colors } = useTheme();

  // Social Store Hooks
  const toggleLikePost = useSocialStore((state) => state.toggleLikePost);
  const toggleSaveItem = useSocialStore((state) => state.toggleSaveItem);
  const isItemSaved = useSocialStore((state) => state.isItemSaved);
  const followUser = useSocialStore((state) => state.followUser);
  const unfollowUser = useSocialStore((state) => state.unfollowUser);
  const muteUser = useSocialStore((state) => state.muteUser);
  const blockUser = useSocialStore((state) => state.blockUser);
  const athletes = useSocialStore((state) => state.athletes);
  const currentUser = useSocialStore((state) => state.currentUser);

  const athlete = athletes[post.userId];
  const isFollowing = athlete?.isFollowing ?? false;
  const isMe = post.userId === currentUser.id;
  const userHandle = post.userUsername || post.userName.toLowerCase().replace(/\s+/g, '');

  // Options Menu & Edit State
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);

  const isSaved = isItemSaved(post.id);

  const handleToggleLike = () => {
    toggleLikePost(post.id);
  };

  const handleToggleSave = () => {
    toggleSaveItem({
      id: post.id,
      title: `${post.userName}'s ${post.postType.toLowerCase()}`,
      subtitle: post.caption.slice(0, 50),
      category: post.postType === 'WORKOUT' ? 'WORKOUTS' : 'POSTS',
      metadata: post.workoutData || post,
    });
  };

  const handleSaveEdit = () => {
    useSocialStore.getState().editPost(post.id, editCaption.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowOptionsMenu(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post from the community feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            useSocialStore.getState().deletePost(post.id);
            onPostDeleted?.(post.id);
          },
        },
      ]
    );
  };

  const handleBlockUser = () => {
    setShowOptionsMenu(false);
    Alert.alert(
      'Block Athlete',
      `Are you sure you want to block @${userHandle}? You won't see their posts, comments, or routines in the community.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockUser(post.userId);
            Alert.alert('Blocked', `@${userHandle} has been blocked.`);
          },
        },
      ]
    );
  };

  const handleMuteUser = () => {
    setShowOptionsMenu(false);
    muteUser(post.userId);
    Alert.alert('Muted', `@${userHandle} has been muted in your feed.`);
  };

  const getPostTypeBadge = () => {
    switch (post.postType) {
      case 'PERSONAL_RECORD':
        return { label: 'NEW PR', bg: '#B8F50020', border: '#B8F500', text: '#B8F500', icon: '🔥' };
      case 'WORKOUT':
        return { label: 'WORKOUT LOG', bg: '#38BDF820', border: '#38BDF8', text: '#38BDF8', icon: '⚡' };
      case 'ACHIEVEMENT':
        return { label: 'MILESTONE', bg: '#F59E0B20', border: '#F59E0B', text: '#F59E0B', icon: '👑' };
      case 'PROGRESS':
        return { label: 'TRANSFORMATION', bg: '#10B98120', border: '#10B981', text: '#10B981', icon: '✨' };
      case 'CHALLENGE':
        return { label: 'CHALLENGE', bg: '#EC489920', border: '#EC4899', text: '#EC4899', icon: '🎯' };
      default:
        return null;
    }
  };

  const badge = getPostTypeBadge();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorSection}
          onPress={() => onOpenProfile?.(post.userId)}
          activeOpacity={0.7}
        >
          <Avatar uri={post.userAvatar} name={post.userName} size={44} />
          <View style={styles.authorMeta}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.userName}</Text>
              <Text style={styles.handle}>@{userHandle}</Text>
              {post.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>

            <View style={styles.subMetaRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{post.userRankName}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right header: Follow Button or Options */}
        <View style={styles.headerRight}>
          {!isMe && (
            <TouchableOpacity
              style={[
                styles.quickFollowBtn,
                isFollowing ? styles.followingBtn : styles.notFollowingBtn,
              ]}
              onPress={() => {
                if (isFollowing) unfollowUser(post.userId);
                else followUser(post.userId);
              }}
            >
              <Text style={[styles.quickFollowText, isFollowing ? styles.followingText : styles.notFollowingText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.optionsBtn}
            onPress={() => setShowOptionsMenu(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="more-vertical" size={18} color="#737373" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Type Badge Banner if specialized */}
      {badge && (
        <View style={[styles.typeBanner, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={styles.typeBannerIcon}>{badge.icon}</Text>
          <Text style={[styles.typeBannerText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      )}

      {/* Caption Text */}
      {post.caption ? (
        <Text style={styles.captionText}>{post.caption}</Text>
      ) : null}

      {/* 1. WORKOUT POST LAYOUT */}
      {post.postType === 'WORKOUT' && post.workoutData && (
        <View style={styles.workoutBox}>
          <View style={styles.workoutHeaderRow}>
            <View>
              <Text style={styles.workoutName}>{post.workoutData.workoutName}</Text>
              <Text style={styles.workoutSub}>
                ⏱ {post.workoutData.durationMinutes} mins • 🔥 {post.workoutData.streakDays} Day Sadhana
              </Text>
            </View>
            <View style={styles.workoutVolumeBadge}>
              <Text style={styles.volumeBadgeVal}>
                {post.workoutData.totalVolumeKg.toLocaleString()}
              </Text>
              <Text style={styles.volumeBadgeUnit}>kg vol</Text>
            </View>
          </View>

          {/* Exercise previews */}
          <View style={styles.exercisePreviewList}>
            {post.workoutData.exercises.slice(0, 3).map((ex, idx) => (
              <View key={idx} style={styles.previewExItem}>
                <Text style={styles.previewExName}>{ex.exerciseName}</Text>
                <Text style={styles.previewExSets}>
                  {ex.sets.length} sets • Top: <Text style={{ color: '#F59E0B' }}>{ex.topWeightKg} kg</Text>
                </Text>
              </View>
            ))}
          </View>

          {/* View breakdown CTA button */}
          <TouchableOpacity
            style={styles.viewWorkoutDetailBtn}
            activeOpacity={0.8}
            onPress={() => onOpenWorkoutDetail?.(post.workoutData!, post)}
          >
            <Text style={styles.viewWorkoutDetailText}>
              View Full Workout Breakdown ({post.workoutData.exercisesCount} exercises) →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. PERSONAL RECORD POST LAYOUT */}
      {post.postType === 'PERSONAL_RECORD' && post.prData && (
        <View style={styles.prBox}>
          <View style={styles.prTopRow}>
            <Text style={styles.prExerciseName}>{post.prData.exerciseName}</Text>
            <View style={styles.gainBadge}>
              <Text style={styles.gainText}>+{post.prData.percentGain}%</Text>
            </View>
          </View>

          <View style={styles.prComparisonRow}>
            <View style={styles.prStatBlock}>
              <Text style={styles.prStatLabel}>PREVIOUS</Text>
              <Text style={styles.prStatPrev}>
                {post.prData.previousWeightKg} kg × {post.prData.previousReps}
              </Text>
            </View>

            <View style={styles.prArrowWrap}>
              <Text style={styles.prArrow}>→</Text>
            </View>

            <View style={styles.prStatBlock}>
              <Text style={[styles.prStatLabel, { color: '#B8F500' }]}>NEW PR</Text>
              <Text style={styles.prStatNew}>
                {post.prData.currentWeightKg} kg × {post.prData.currentReps}
              </Text>
            </View>
          </View>

          <View style={styles.estimatedOneRM}>
            <Text style={styles.estimatedOneRMText}>
              Calculated 1RM: <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{post.prData.estimated1RM} kg</Text>
            </Text>
          </View>
        </View>
      )}

      {/* 3. PROGRESS & TRANSFORMATION POST LAYOUT */}
      {post.postType === 'PROGRESS' && post.progressData && (
        <View style={styles.progressBox}>
          <View style={styles.progressMetricsRow}>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatLabel}>BODY WEIGHT</Text>
              {post.progressData.hideWeight ? (
                <Text style={styles.progressHiddenText}>🔒 Hidden by Athlete</Text>
              ) : (
                <Text style={styles.progressStatVal}>
                  {post.progressData.bodyWeightKg} kg
                </Text>
              )}
            </View>

            {post.progressData.bodyFatPercent && (
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatLabel}>BODY FAT</Text>
                <Text style={styles.progressStatVal}>
                  {post.progressData.bodyFatPercent}%
                </Text>
              </View>
            )}
          </View>

          {post.progressData.strengthSummary && (
            <Text style={styles.strengthNotes}>
              "{post.progressData.strengthSummary}"
            </Text>
          )}
        </View>
      )}

      {/* 4. ACHIEVEMENT POST LAYOUT */}
      {post.postType === 'ACHIEVEMENT' && post.achievementData && (
        <View style={styles.achievementBox}>
          <View style={styles.achievementBadgeHeader}>
            <View style={styles.disciplinePill}>
              <Text style={styles.disciplineTitle}>
                {post.achievementData.disciplineCategory} • 
                {post.achievementData.disciplineCategory === 'TAPAS' && ' ASCETIC FIRE'}
                {post.achievementData.disciplineCategory === 'BALA' && ' RAW STRENGTH'}
                {post.achievementData.disciplineCategory === 'VIRYA' && ' RELENTLESS VIGOR'}
                {post.achievementData.disciplineCategory === 'SADHANA' && ' DEVOTED PRACTICE'}
                {post.achievementData.disciplineCategory === 'VAJRA' && ' INDOMITABLE ENDURANCE'}
              </Text>
            </View>
          </View>

          <Text style={styles.achievementTitleText}>
            {post.achievementData.achievementTitle}
          </Text>

          <Text style={styles.achievementValueText}>
            {post.achievementData.milestoneValue}
          </Text>

          <View style={styles.rankPromoteRow}>
            <Text style={styles.promotedToText}>WARRIOR TIER:</Text>
            <Text style={styles.rankTierPromoted}>{post.achievementData.rankName}</Text>
          </View>
        </View>
      )}

      {/* Media Attachment (Photo or Video preview) */}
      {post.mediaUrl ? (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.mediaUrl }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Interaction Bar */}
      <View style={styles.actionBar}>
        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleToggleLike}
          activeOpacity={0.6}
        >
          <Icon
            name={post.isLikedByMe ? 'heart-fill' : 'heart'}
            size={20}
            color={post.isLikedByMe ? '#EF4444' : '#888888'}
          />
        </TouchableOpacity>

        {/* Tappable Likes Count (opens who liked) */}
        <TouchableOpacity
          style={styles.likesCountWrap}
          onPress={() => onOpenLikesList?.(post)}
        >
          <Text
            style={[
              styles.actionCount,
              post.isLikedByMe && { color: '#EF4444', fontWeight: '700' },
            ]}
          >
            {post.likesCount} applause
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onOpenComments?.(post.id)}
          activeOpacity={0.6}
        >
          <Icon name="message-circle" size={19} color="#888888" />
          <Text style={styles.actionCount}>{post.commentsCount}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onOpenShare?.(post)}
          activeOpacity={0.6}
        >
          <Icon name="today" size={19} color="#888888" />
        </TouchableOpacity>

        {/* Bookmark / Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleToggleSave}
          activeOpacity={0.6}
        >
          <Icon
            name={isSaved ? 'bookmark-fill' : 'bookmark'}
            size={20}
            color={isSaved ? '#F59E0B' : '#888888'}
          />
        </TouchableOpacity>
      </View>

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.menuContainer}>
            {/* If Mine: Edit & Delete */}
            {isMe ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    setIsEditing(true);
                  }}
                >
                  <Icon name="more-vertical" size={18} color="#FFFFFF" />
                  <Text style={styles.menuItemText}>Edit Caption</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.destructiveMenuItem]}
                  onPress={handleDelete}
                >
                  <Icon name="x" size={18} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* If Other: Save, Mute, Block, Report */
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    handleToggleSave();
                  }}
                >
                  <Icon name={isSaved ? 'bookmark-fill' : 'bookmark'} size={18} color="#F59E0B" />
                  <Text style={styles.menuItemText}>
                    {isSaved ? 'Remove from Saved' : 'Save to Vault'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    onOpenShare?.(post);
                  }}
                >
                  <Icon name="target" size={18} color="#FFFFFF" />
                  <Text style={styles.menuItemText}>Share Post Link</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleMuteUser}>
                  <Icon name="profile" size={18} color="#A3A3A3" />
                  <Text style={styles.menuItemText}>Mute @{userHandle}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.destructiveMenuItem]}
                  onPress={handleBlockUser}
                >
                  <Icon name="x" size={18} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                    Block @{userHandle}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.destructiveMenuItem]}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    onOpenReport?.(post.id);
                  }}
                >
                  <Icon name="flame" size={18} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Report Post</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Caption Modal */}
      <Modal
        visible={isEditing}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editBox}>
            <Text style={styles.editTitle}>Edit Post Caption</Text>
            <TextInput
              style={styles.editInput}
              multiline
              value={editCaption}
              onChangeText={setEditCaption}
              placeholder="What's your workout insight?"
              placeholderTextColor="#666666"
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveEditText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D0D0D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C1C1C',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  handle: {
    color: '#737373',
    fontSize: 12,
  },
  verifiedBadge: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: '#1E1A11',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#F59E0B40',
  },
  rankText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  dot: {
    color: '#444444',
    fontSize: 11,
  },
  timestamp: {
    color: '#666666',
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickFollowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  notFollowingBtn: {
    backgroundColor: '#F59E0B15',
    borderColor: '#F59E0B',
  },
  followingBtn: {
    backgroundColor: '#171717',
    borderColor: '#262626',
  },
  quickFollowText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notFollowingText: {
    color: '#F59E0B',
  },
  followingText: {
    color: '#888888',
  },
  optionsBtn: {
    padding: 6,
  },
  typeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  typeBannerIcon: {
    fontSize: 11,
  },
  typeBannerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  captionText: {
    color: '#E5E5E5',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  workoutBox: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  workoutSub: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  workoutVolumeBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  volumeBadgeVal: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  volumeBadgeUnit: {
    color: '#737373',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exercisePreviewList: {
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 10,
    gap: 8,
  },
  previewExItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewExName: {
    color: '#D4D4D4',
    fontSize: 13,
    fontWeight: '600',
  },
  previewExSets: {
    color: '#737373',
    fontSize: 12,
  },
  viewWorkoutDetailBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  viewWorkoutDetailText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  prBox: {
    backgroundColor: '#131A0B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#B8F50040',
    marginBottom: 12,
  },
  prTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prExerciseName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  gainBadge: {
    backgroundColor: '#B8F500',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gainText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  prComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E06',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1D2A10',
  },
  prStatBlock: {
    flex: 1,
    alignItems: 'center',
  },
  prStatLabel: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  prStatPrev: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '600',
  },
  prStatNew: {
    color: '#B8F500',
    fontSize: 16,
    fontWeight: '900',
  },
  prArrowWrap: {
    paddingHorizontal: 8,
  },
  prArrow: {
    color: '#737373',
    fontSize: 18,
    fontWeight: '700',
  },
  estimatedOneRM: {
    marginTop: 10,
    alignItems: 'center',
  },
  estimatedOneRMText: {
    color: '#888888',
    fontSize: 12,
  },
  progressBox: {
    backgroundColor: '#0C1713',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10B98140',
    marginBottom: 12,
  },
  progressMetricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  progressStatItem: {
    flex: 1,
  },
  progressStatLabel: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressStatVal: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  progressHiddenText: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  strengthNotes: {
    color: '#C7D5D0',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  achievementBox: {
    backgroundColor: '#1E1708',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B50',
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementBadgeHeader: {
    marginBottom: 8,
  },
  disciplinePill: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  disciplineTitle: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  achievementTitleText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementValueText: {
    color: '#E5E5E5',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  rankPromoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#2E220C',
    paddingTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  promotedToText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },
  rankTierPromoted: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  mediaImage: {
    width: '100%',
    height: 240,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likesCountWrap: {
    paddingVertical: 4,
  },
  actionCount: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuContainer: {
    width: '85%',
    backgroundColor: '#141414',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
  },
  destructiveMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editBox: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  editTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  editInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelEditBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelEditText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  saveEditBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveEditText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
