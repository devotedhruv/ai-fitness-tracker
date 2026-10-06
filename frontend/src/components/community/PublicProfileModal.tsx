import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { RankInsignia } from '../RankInsignia';
import {
  UserSocialProfile,
  useSocialStore,
} from '../../stores/socialStore';

type ProfileTab = 'POSTS' | 'WORKOUTS' | 'PROGRESS' | 'ACHIEVEMENTS' | 'PHOTOS';

interface PublicProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  onOpenFollowList?: (profile: UserSocialProfile, tab: 'FOLLOWERS' | 'FOLLOWING') => void;
  onOpenWorkoutDetail?: (workoutData: any) => void;
}

export function PublicProfileModal({
  visible,
  userId,
  onClose,
  onOpenFollowList,
  onOpenWorkoutDetail,
}: PublicProfileModalProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>('POSTS');

  const athletes = useSocialStore((state) => state.athletes);
  const currentUser = useSocialStore((state) => state.currentUser);
  const posts = useSocialStore((state) => state.posts);
  const followUser = useSocialStore((state) => state.followUser);
  const unfollowUser = useSocialStore((state) => state.unfollowUser);

  if (!visible || !userId) return null;

  // Find athlete in store or fallback to default
  const profile: UserSocialProfile =
    userId === currentUser.id
      ? currentUser
      : athletes[userId] || {
          id: userId,
          displayName: 'Warrior Athlete',
          username: 'warrior',
          avatar: 'preset:athlete',
          bio: 'Disciplined student of physical culture. B.M.B: Build. Move. Become.',
          location: 'Kathmandu / Global',
          rank: {
            tierName: 'VAJRA DISCIPLE',
            insignia: 'double-chevron',
            tier: 3,
            level: 14,
            totalXP: 7200,
          },
          stats: {
            streakDays: 24,
            workoutsCompleted: 68,
            personalRecordsCount: 19,
            totalVolumeKg: 420000,
          },
          followersCount: 142,
          followingCount: 98,
          isFollowing: false,
          isFollowRequested: false,
          isVerified: true,
          visibility: 'PUBLIC',
        };

  const isMe = profile.id === currentUser.id;
  const userPosts = posts.filter((p) => p.userId === profile.id);
  const workoutPosts = userPosts.filter((p) => p.postType === 'WORKOUT');
  const prPosts = userPosts.filter((p) => p.postType === 'PERSONAL_RECORD');

  const handleFollowToggle = () => {
    if (profile.isFollowing || profile.isFollowRequested) {
      unfollowUser(profile.id);
    } else {
      followUser(profile.id);
    }
  };

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'POSTS', label: `Posts (${userPosts.length})` },
    { key: 'WORKOUTS', label: `Workouts (${workoutPosts.length})` },
    { key: 'PROGRESS', label: 'Progress' },
    { key: 'ACHIEVEMENTS', label: 'Discipline' },
    { key: 'PHOTOS', label: 'Photos' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarTitleRow}>
              <Text style={styles.topBarHandle}>@{profile.username}</Text>
              {profile.isVerified && <Text style={styles.topBarVerified}>✓</Text>}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner Cover */}
            <View style={styles.bannerCover}>
              <View style={styles.bannerWatermark}>
                <Text style={styles.watermarkText}>BALYRA • TAPAS</Text>
              </View>
            </View>

            {/* Profile Info Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarBorder}>
                  <Avatar uri={profile.avatar} name={profile.displayName} size={76} />
                </View>

                {/* Follow Button */}
                {!isMe && (
                  <TouchableOpacity
                    style={[
                      styles.actionFollowBtn,
                      profile.isFollowing
                        ? styles.btnFollowing
                        : profile.isFollowRequested
                        ? styles.btnRequested
                        : styles.btnNotFollowing,
                    ]}
                    onPress={handleFollowToggle}
                  >
                    <Text
                      style={[
                        styles.actionFollowText,
                        profile.isFollowing
                          ? styles.textFollowing
                          : profile.isFollowRequested
                          ? styles.textRequested
                          : styles.textNotFollowing,
                      ]}
                    >
                      {profile.isFollowing
                        ? 'Following'
                        : profile.isFollowRequested
                        ? 'Requested'
                        : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Name & Rank */}
              <View style={styles.nameBlock}>
                <View style={styles.nameRow}>
                  <Text style={styles.displayName}>{profile.displayName}</Text>
                  <View style={styles.rankPill}>
                    <Text style={styles.rankPillText}>{profile.rank.tierName}</Text>
                  </View>
                </View>

                {profile.location && (
                  <Text style={styles.locationText}>📍 {profile.location}</Text>
                )}

                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>

              {/* Stats Row (Clickable to Followers/Following) */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{profile.stats?.workoutsCompleted ?? profile.workoutsCount ?? 0}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{profile.stats?.personalRecordsCount ?? 0}</Text>
                  <Text style={styles.statLabel}>Records</Text>
                </View>

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => onOpenFollowList?.(profile, 'FOLLOWERS')}
                >
                  <Text style={[styles.statVal, { color: '#F59E0B' }]}>
                    {profile.followersCount}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => onOpenFollowList?.(profile, 'FOLLOWING')}
                >
                  <Text style={[styles.statVal, { color: '#F59E0B' }]}>
                    {profile.followingCount}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Tab Navigation */}
            <View style={styles.tabNavRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabNavScroll}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabNavBtn,
                      activeTab === tab.key && styles.activeTabNavBtn,
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text
                      style={[
                        styles.tabNavText,
                        activeTab === tab.key && styles.activeTabNavText,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* TAB CONTENT */}
            {/* 1. POSTS TAB */}
            {activeTab === 'POSTS' && (
              <View style={styles.tabContent}>
                {userPosts.length === 0 ? (
                  <View style={styles.emptyTabBox}>
                    <Text style={styles.emptyTabText}>No community posts yet.</Text>
                  </View>
                ) : (
                  userPosts.map((post) => (
                    <View key={post.id} style={styles.miniPostCard}>
                      <View style={styles.miniPostHeader}>
                        <View style={styles.postTypeBadge}>
                          <Text style={styles.postTypeBadgeText}>{post.postType}</Text>
                        </View>
                        <Text style={styles.miniPostDate}>
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={styles.miniPostCaption}>{post.caption}</Text>
                      <View style={styles.miniPostMeta}>
                        <Text style={styles.miniMetaText}>🔥 {post.likesCount} applause</Text>
                        <Text style={styles.miniMetaText}>💬 {post.commentsCount} comments</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* 2. WORKOUTS TAB */}
            {activeTab === 'WORKOUTS' && (
              <View style={styles.tabContent}>
                {workoutPosts.length === 0 ? (
                  <View style={styles.emptyTabBox}>
                    <Text style={styles.emptyTabText}>No workouts shared yet.</Text>
                  </View>
                ) : (
                  workoutPosts.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.workoutCardItem}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (post.workoutData) {
                          onOpenWorkoutDetail?.(post.workoutData);
                        }
                      }}
                    >
                      <View style={styles.workoutCardHeader}>
                        <Text style={styles.workoutCardTitle}>
                          {post.workoutData?.workoutName || 'Workout Routine'}
                        </Text>
                        <Text style={styles.workoutCardDuration}>
                          {post.workoutData?.durationMinutes}m
                        </Text>
                      </View>
                      <Text style={styles.workoutCardSub}>
                        {post.workoutData?.totalVolumeKg.toLocaleString()} kg total volume • {post.workoutData?.setsCount} sets
                      </Text>
                      <Text style={styles.viewRoutineLink}>View Exercise Breakdown →</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* 3. PROGRESS TAB */}
            {activeTab === 'PROGRESS' && (
              <View style={styles.tabContent}>
                <View style={styles.progressSummaryCard}>
                  <Text style={styles.progressHeading}>PHYSICAL MILESTONES</Text>
                  <View style={styles.milestoneGrid}>
                    <View style={styles.milestoneBox}>
                      <Text style={styles.milestoneVal}>{profile.stats?.streakDays ?? profile.streakDays ?? 0} Days</Text>
                      <Text style={styles.milestoneLbl}>Active Streak</Text>
                    </View>
                    <View style={styles.milestoneBox}>
                      <Text style={styles.milestoneVal}>{((profile.stats?.totalVolumeKg ?? 0) / 1000).toFixed(0)}k kg</Text>
                      <Text style={styles.milestoneLbl}>All-Time Vol</Text>
                    </View>
                  </View>

                  <Text style={[styles.progressHeading, { marginTop: 16 }]}>RECENT PR RECORDS</Text>
                  {prPosts.map((p) => (
                    <View key={p.id} style={styles.prRecordRow}>
                      <Text style={styles.prRecordName}>{p.prData?.exerciseName}</Text>
                      <Text style={styles.prRecordGain}>+{p.prData?.percentGain}% PR</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 4. ACHIEVEMENTS / DISCIPLINE TAB */}
            {activeTab === 'ACHIEVEMENTS' && (
              <View style={styles.tabContent}>
                <View style={styles.achievementsCard}>
                  <Text style={styles.disciplineHeading}>BALYRA DISCIPLINE PILLARS</Text>
                  <View style={styles.pillarItem}>
                    <Text style={styles.pillarIcon}>🔥</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillarTitle}>TAPAS (Ascetic Discipline)</Text>
                      <Text style={styles.pillarDesc}>Completed 30 consecutive training days.</Text>
                    </View>
                  </View>
                  <View style={styles.pillarItem}>
                    <Text style={styles.pillarIcon}>🔱</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillarTitle}>BALA (Raw Power)</Text>
                      <Text style={styles.pillarDesc}>Broke 1.5× bodyweight bench press barrier.</Text>
                    </View>
                  </View>
                  <View style={styles.pillarItem}>
                    <Text style={styles.pillarIcon}>⚡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillarTitle}>VAJRA (Indomitable Durability)</Text>
                      <Text style={styles.pillarDesc}>Lifted over 400,000 kg total volume.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 5. PHOTOS TAB */}
            {activeTab === 'PHOTOS' && (
              <View style={styles.photoGrid}>
                {userPosts
                  .filter((p) => p.mediaUrl)
                  .map((p) => (
                    <Image
                      key={p.id}
                      source={{ uri: p.mediaUrl }}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  ))}
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '92%',
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  topBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarHandle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  topBarVerified: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  bannerCover: {
    height: 100,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  bannerWatermark: {
    opacity: 0.25,
  },
  watermarkText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  profileHeader: {
    paddingHorizontal: 16,
    marginTop: -38,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  avatarBorder: {
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#0A0A0A',
    backgroundColor: '#0A0A0A',
  },
  actionFollowBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  btnNotFollowing: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  btnFollowing: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
  },
  btnRequested: {
    backgroundColor: '#262626',
    borderColor: '#383838',
  },
  actionFollowText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textNotFollowing: {
    color: '#000000',
  },
  textFollowing: {
    color: '#FFFFFF',
  },
  textRequested: {
    color: '#A3A3A3',
  },
  nameBlock: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  rankPill: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rankPillText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  locationText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  bioText: {
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#737373',
    fontSize: 11,
    marginTop: 2,
  },
  tabNavRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  tabNavScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabNavBtn: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabNavBtn: {
    borderBottomColor: '#F59E0B',
  },
  tabNavText: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabNavText: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyTabBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTabText: {
    color: '#666666',
    fontSize: 13,
  },
  miniPostCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  miniPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postTypeBadge: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postTypeBadgeText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  miniPostDate: {
    color: '#666666',
    fontSize: 11,
  },
  miniPostCaption: {
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  miniPostMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  miniMetaText: {
    color: '#737373',
    fontSize: 11,
  },
  workoutCardItem: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  workoutCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  workoutCardDuration: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  workoutCardSub: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
  },
  viewRoutineLink: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  progressSummaryCard: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  progressHeading: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  milestoneGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  milestoneBox: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  milestoneVal: {
    color: '#B8F500',
    fontSize: 18,
    fontWeight: '800',
  },
  milestoneLbl: {
    color: '#737373',
    fontSize: 11,
    marginTop: 2,
  },
  prRecordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  prRecordName: {
    color: '#D4D4D4',
    fontSize: 13,
    fontWeight: '600',
  },
  prRecordGain: {
    color: '#B8F500',
    fontSize: 12,
    fontWeight: '800',
  },
  achievementsCard: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  disciplineHeading: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  pillarItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  pillarIcon: {
    fontSize: 20,
  },
  pillarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pillarDesc: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 6,
  },
  gridImage: {
    width: '31.8%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#161616',
  },
});
