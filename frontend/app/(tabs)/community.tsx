import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { AppHeader, AppTabBar, AppButton, AppEmptyState } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import {
  CommunityPostCard,
  CommunityPost,
} from '../../src/components/community/CommunityPostCard';
import { StoryRow } from '../../src/components/community/StoryRow';
import { StoryViewerModal } from '../../src/components/community/StoryViewerModal';
import { WorkoutSummaryDetailModal } from '../../src/components/community/WorkoutSummaryDetailModal';
import { LikesListModal } from '../../src/components/community/LikesListModal';
import { ShareModal } from '../../src/components/community/ShareModal';
import { FollowListModal } from '../../src/components/community/FollowListModal';
import { CommunitySearchModal } from '../../src/components/community/CommunitySearchModal';
import { NotificationsModal } from '../../src/components/community/NotificationsModal';
import { SavedItemsModal } from '../../src/components/community/SavedItemsModal';
import { ChallengesSection } from '../../src/components/community/ChallengesSection';
import { CreatePostModal } from '../../src/components/community/CreatePostModal';
import { CommentsModal } from '../../src/components/community/CommentsModal';
import { ReportPostModal } from '../../src/components/community/ReportPostModal';
import { PublicProfileModal } from '../../src/components/community/PublicProfileModal';
import { InsightCard } from '../../src/components/community/InsightCard';
import { InsightDetailModal } from '../../src/components/community/InsightDetailModal';
import {
  COMMUNITY_INSIGHTS,
  CommunityInsight,
  InsightCategory,
} from '../../src/data/communityInsights';
import { internetInsightsService } from '../../src/services/internetInsightsService';
import {
  useSocialStore,
  StoryItem,
  WorkoutPostMetadata,
  UserSocialProfile,
} from '../../src/stores/socialStore';

type MainTab = 'FEED' | 'CHALLENGES' | 'INSIGHTS';
type FeedFilter = 'ALL' | 'FOLLOWING' | 'PRS' | 'WORKOUTS';

const INSIGHT_CATEGORIES: { key: InsightCategory; label: string }[] = [
  { key: 'ALL', label: 'All Insights' },
  { key: 'TIPS', label: 'Tips & Tricks' },
  { key: 'HEALTH', label: 'Health & Recovery' },
  { key: 'VIDEOS', label: 'Video Guides' },
  { key: 'SCIENCE', label: 'Exercise Science' },
];

export default function CommunityScreen() {
  const { colors } = useTheme();

  // Social Store Selectors
  const storePosts = useSocialStore((state) => state.posts);
  const athletes = useSocialStore((state) => state.athletes);
  const blockedUserIds = useSocialStore((state) => state.blockedUserIds);
  const mutedUserIds = useSocialStore((state) => state.mutedUserIds);
  const notifications = useSocialStore((state) => state.notifications);
  const savedItems = useSocialStore((state) => state.savedItems);

  // Unread notification badge count
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<MainTab>('FEED');

  // Feed Filter Pill
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Insights State
  const [insightCategory, setInsightCategory] = useState<InsightCategory>('ALL');
  const [selectedInsight, setSelectedInsight] = useState<CommunityInsight | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingInternet, setIsSearchingInternet] = useState(false);
  const [internetResults, setInternetResults] = useState<CommunityInsight[]>([]);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<{
    workoutData: WorkoutPostMetadata;
    post: CommunityPost;
  } | null>(null);

  const [selectedPostForLikes, setSelectedPostForLikes] = useState<CommunityPost | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<CommunityPost | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<string | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<string | null>(null);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  const [followListProfile, setFollowListProfile] = useState<{
    profile: UserSocialProfile;
    tab: 'FOLLOWERS' | 'FOLLOWING';
  } | null>(null);

  // Filtered and unmuted community feed
  const displayedPosts = useMemo(() => {
    let list = storePosts.filter(
      (p) => !blockedUserIds.includes(p.userId) && !mutedUserIds.includes(p.userId)
    );

    if (feedFilter === 'FOLLOWING') {
      list = list.filter((p) => {
        const ath = athletes[p.userId];
        return ath?.isFollowing;
      });
    } else if (feedFilter === 'PRS') {
      list = list.filter((p) => p.postType === 'PERSONAL_RECORD');
    } else if (feedFilter === 'WORKOUTS') {
      list = list.filter((p) => p.postType === 'WORKOUT');
    }

    return list;
  }, [storePosts, blockedUserIds, mutedUserIds, feedFilter, athletes]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Story handlers
  const handleSelectStory = (story: StoryItem, index: number) => {
    setSelectedStoryIndex(index);
    setShowStoryModal(true);
  };

  // Internet Insights Search
  const handleSearchSubmit = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setInternetResults([]);
      return;
    }
    setIsSearchingInternet(true);
    try {
      const results = await internetInsightsService.searchInternetScience(q);
      setInternetResults(results);
    } catch (err) {
      console.warn('Error searching internet insights:', err);
    } finally {
      setIsSearchingInternet(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setInternetResults([]);
  };

  const baseInsights =
    internetResults.length > 0
      ? [...internetResults, ...COMMUNITY_INSIGHTS]
      : COMMUNITY_INSIGHTS;

  const displayedInsights =
    insightCategory === 'ALL'
      ? baseInsights
      : baseInsights.filter((item) => item.category === insightCategory);

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* 1. Global AppHeader with Brand Logo and Action Icons */}
      <AppHeader
        showLogo
        logoVariant="full"
        rightActions={
          <View style={styles.headerActionsRow}>
            {/* Search Button */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setShowSearchModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Search"
            >
              <Icon name="search" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Notifications Button with Badge */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setShowNotificationsModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Notifications"
            >
              <Icon name="bell" size={20} color={colors.textPrimary} />
              {unreadNotificationsCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.badgeText, { color: colors.onAccent }]}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Saved Bookmarks Button */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setShowSavedModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Saved Bookmarks"
            >
              <Icon
                name={savedItems.length > 0 ? 'bookmark-fill' : 'bookmark'}
                size={20}
                color={savedItems.length > 0 ? colors.accent : colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Create Post (+) Button */}
            <AppButton
              title="Post"
              size="small"
              variant="primary"
              leftIcon={<Icon name="plus" size={14} color={colors.onAccent} />}
              onPress={() => setShowCreateModal(true)}
            />
          </View>
        }
      />

      {/* 2. MAIN SEGMENT TABS */}
      <AppTabBar
        variant="underline"
        tabs={[
          { id: 'FEED', label: 'Squad Feed' },
          { id: 'CHALLENGES', label: 'Challenges' },
          { id: 'INSIGHTS', label: 'Academy & Science' },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
      />

      {/* 3. TAB CONTENT */}
      {/* ===================== TAB 1: SQUAD FEED ===================== */}
      {activeTab === 'FEED' && (
        <FlatList
          data={displayedPosts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F59E0B"
              colors={['#F59E0B']}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Activity Stories Carousel */}
              <StoryRow
                onSelectStory={handleSelectStory}
                onCreateStory={() => setShowCreateModal(true)}
              />

              {/* Feed Filter Pills */}
              <View style={styles.feedFilterBar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterPillsScroll}
                >
                  <TouchableOpacity
                    style={[styles.filterPill, feedFilter === 'ALL' && styles.filterPillActive]}
                    onPress={() => setFeedFilter('ALL')}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        feedFilter === 'ALL' && styles.filterPillTextActive,
                      ]}
                    >
                      All Activity
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterPill,
                      feedFilter === 'FOLLOWING' && styles.filterPillActive,
                    ]}
                    onPress={() => setFeedFilter('FOLLOWING')}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        feedFilter === 'FOLLOWING' && styles.filterPillTextActive,
                      ]}
                    >
                      👥 Following
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterPill, feedFilter === 'PRS' && styles.filterPillActive]}
                    onPress={() => setFeedFilter('PRS')}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        feedFilter === 'PRS' && styles.filterPillTextActive,
                      ]}
                    >
                      🔥 Personal Records
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterPill,
                      feedFilter === 'WORKOUTS' && styles.filterPillActive,
                    ]}
                    onPress={() => setFeedFilter('WORKOUTS')}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        feedFilter === 'WORKOUTS' && styles.filterPillTextActive,
                      ]}
                    >
                      ⚡ Workout Logs
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.postCardWrapper}>
              <CommunityPostCard
                post={item}
                onOpenWorkoutDetail={(workoutData, post) =>
                  setSelectedWorkoutDetail({ workoutData, post })
                }
                onOpenLikesList={(post) => setSelectedPostForLikes(post)}
                onOpenShare={(post) => setSelectedPostForShare(post)}
                onOpenComments={(postId) => setSelectedPostForComments(postId)}
                onOpenProfile={(userId) => setSelectedUserForProfile(userId)}
                onOpenReport={(postId) => setSelectedPostForReport(postId)}
              />
            </View>
          )}
          ListEmptyComponent={
            <AppEmptyState
              icon="community"
              title={feedFilter === 'FOLLOWING' ? 'No Following Activity' : 'No Community Posts Yet'}
              description={
                feedFilter === 'FOLLOWING'
                  ? "You aren't following any athletes yet. Discover inspiring members in search!"
                  : 'Be the first warrior to share a training milestone with the squad!'
              }
              actionTitle="Create First Post"
              onAction={() => setShowCreateModal(true)}
              style={{ paddingVertical: 48 }}
            />
          }
          contentContainerStyle={styles.feedContentContainer}
        />
      )}

      {/* ===================== TAB 2: CHALLENGES ===================== */}
      {activeTab === 'CHALLENGES' && (
        <ScrollView style={styles.tabScrollView} showsVerticalScrollIndicator={false}>
          <ChallengesSection />
        </ScrollView>
      )}

      {/* ===================== TAB 3: ACADEMY & INSIGHTS ===================== */}
      {activeTab === 'INSIGHTS' && (
        <ScrollView style={styles.tabScrollView} showsVerticalScrollIndicator={false}>
          {/* Academy Banner */}
          <View style={styles.academyBanner}>
            <Text style={styles.academyTitle}>BALYRA ACADEMY • OPEN SCIENCE & GUIDES</Text>
            <Text style={styles.academySubtitle}>
              Evidence-based exercise science, biomechanics masterclasses, and nutrition blogs.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color="#737373" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fitness blogs, exercise science & videos..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {isSearchingInternet ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={handleClearSearch}>
                <Icon name="close" size={16} color="#737373" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSearchSubmit}>
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results Banner */}
          {internetResults.length > 0 && (
            <View style={styles.liveResultsBox}>
              <Text style={styles.liveResultsText}>
                🌐 Showing {internetResults.length} live science articles for "{searchQuery}"
              </Text>
              <TouchableOpacity onPress={handleClearSearch}>
                <Text style={styles.clearSearchLink}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {INSIGHT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterPill,
                  insightCategory === cat.key && styles.filterPillActive,
                ]}
                onPress={() => setInsightCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    insightCategory === cat.key && styles.filterPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insights Grid / Cards */}
          <View style={styles.insightsList}>
            {displayedInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => setSelectedInsight(insight)}
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ===================== MODALS ===================== */}
      {/* 1. Story Viewer Modal */}
      <StoryViewerModal
        visible={showStoryModal}
        initialIndex={selectedStoryIndex}
        onClose={() => setShowStoryModal(false)}
        onOpenProfile={(userId) => {
          setShowStoryModal(false);
          setSelectedUserForProfile(userId);
        }}
      />

      {/* 2. Workout Summary Detail Modal */}
      {selectedWorkoutDetail && (
        <WorkoutSummaryDetailModal
          visible={!!selectedWorkoutDetail}
          workoutData={selectedWorkoutDetail.workoutData}
          athleteName={selectedWorkoutDetail.post.userName}
          athleteUsername={selectedWorkoutDetail.post.userUsername}
          athleteAvatar={selectedWorkoutDetail.post.userAvatar}
          createdAt={selectedWorkoutDetail.post.createdAt}
          onClose={() => setSelectedWorkoutDetail(null)}
          onShare={() => {
            const p = selectedWorkoutDetail.post;
            setSelectedWorkoutDetail(null);
            setSelectedPostForShare(p);
          }}
        />
      )}

      {/* 3. Likes List Modal */}
      {selectedPostForLikes && (
        <LikesListModal
          visible={!!selectedPostForLikes}
          likesCount={selectedPostForLikes.likesCount}
          users={selectedPostForLikes.likedByUsers}
          onClose={() => setSelectedPostForLikes(null)}
          onSelectUser={(userId) => {
            setSelectedPostForLikes(null);
            setSelectedUserForProfile(userId);
          }}
        />
      )}

      {/* 4. Share Modal */}
      <ShareModal
        visible={!!selectedPostForShare}
        post={selectedPostForShare}
        onClose={() => setSelectedPostForShare(null)}
      />

      {/* 5. Follow List Modal */}
      {followListProfile && (
        <FollowListModal
          visible={!!followListProfile}
          profile={followListProfile.profile}
          initialTab={followListProfile.tab}
          onClose={() => setFollowListProfile(null)}
          onSelectUser={(userId) => {
            setFollowListProfile(null);
            setSelectedUserForProfile(userId);
          }}
        />
      )}

      {/* 6. Community Search Modal */}
      <CommunitySearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectUser={(userId) => {
          setShowSearchModal(false);
          setSelectedUserForProfile(userId);
        }}
        onSelectPost={(post) => {
          setShowSearchModal(false);
          if (post.workoutData) {
            setSelectedWorkoutDetail({ workoutData: post.workoutData, post });
          }
        }}
      />

      {/* 7. Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSelectUser={(userId) => {
          setShowNotificationsModal(false);
          setSelectedUserForProfile(userId);
        }}
      />

      {/* 8. Saved Items Modal */}
      <SavedItemsModal
        visible={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onOpenWorkout={(workoutData) => {
          setShowSavedModal(false);
          const dummyPost: CommunityPost = {
            id: 'saved-' + Date.now(),
            userId: 'athlete',
            userName: 'Saved Athlete',
            userUsername: 'athlete',
            userRankName: 'WARRIOR',
            userRankInsignia: 'single-chevron',
            userRankTier: 2,
            postType: 'WORKOUT',
            caption: 'Saved Routine',
            visibility: 'EVERYONE',
            likesCount: 12,
            commentsCount: 2,
            sharesCount: 0,
            isLikedByMe: false,
            isSavedByMe: true,
            isMine: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            workoutData,
          };
          setSelectedWorkoutDetail({ workoutData, post: dummyPost });
        }}
      />

      {/* 9. Public Profile Modal */}
      <PublicProfileModal
        visible={!!selectedUserForProfile}
        userId={selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
        onOpenFollowList={(profile, tab) => {
          setFollowListProfile({ profile, tab });
        }}
        onOpenWorkoutDetail={(workoutData) => {
          const dummyPost: CommunityPost = {
            id: 'profile-w-' + Date.now(),
            userId: selectedUserForProfile || 'user',
            userName: 'Athlete',
            userUsername: 'athlete',
            userRankName: 'WARRIOR',
            userRankInsignia: 'single-chevron',
            userRankTier: 2,
            postType: 'WORKOUT',
            caption: 'Logged Session',
            visibility: 'EVERYONE',
            likesCount: 15,
            commentsCount: 3,
            sharesCount: 1,
            isLikedByMe: false,
            isSavedByMe: false,
            isMine: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            workoutData,
          };
          setSelectedWorkoutDetail({ workoutData, post: dummyPost });
        }}
      />

      {/* 10. Comments Modal */}
      <CommentsModal
        visible={!!selectedPostForComments}
        postId={selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />

      {/* 11. Report Post Modal */}
      <ReportPostModal
        visible={!!selectedPostForReport}
        postId={selectedPostForReport}
        onClose={() => setSelectedPostForReport(null)}
      />

      {/* 12. Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => {
          // Store already updated optimistically
        }}
      />

      {/* 13. Insight Detail Modal */}
      <InsightDetailModal
        visible={!!selectedInsight}
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#121212',
    backgroundColor: '#000000',
  },
  brandContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTagline: {
    color: '#737373',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    position: 'relative',
    padding: 6,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createPostText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  mainTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
    backgroundColor: '#000000',
  },
  mainTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeMainTabItem: {
    borderBottomColor: '#F59E0B',
  },
  mainTabLabel: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '600',
  },
  activeMainTabLabel: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  feedFilterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#121212',
    backgroundColor: '#050505',
  },
  filterPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#242424',
  },
  filterPillActive: {
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
  },
  filterPillText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  feedContentContainer: {
    paddingBottom: 40,
  },
  postCardWrapper: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  tabScrollView: {
    flex: 1,
  },
  academyBanner: {
    backgroundColor: '#121212',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
  },
  academyTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  academySubtitle: {
    color: '#A3A3A3',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#242424',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchBtnText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  liveResultsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#38BDF815',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  liveResultsText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  clearSearchLink: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  insightsList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#737373',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyCta: {
    marginTop: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
