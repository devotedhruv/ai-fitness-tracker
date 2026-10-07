import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Icon } from '../../src/components/Icon';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import { CommunityPostCard, CommunityPost } from '../../src/components/community/CommunityPostCard';
import { CreatePostModal } from '../../src/components/community/CreatePostModal';
import { CommentsModal } from '../../src/components/community/CommentsModal';
import { ReportPostModal } from '../../src/components/community/ReportPostModal';
import { PublicProfileModal } from '../../src/components/community/PublicProfileModal';
import { socialApi } from '../../src/services/api';
import { DEMO_WARRIOR_POSTS } from '../../src/data/demoFeedPosts';

type SortFilter = 'latest' | 'popular' | 'milestones';

export default function SocialFeedScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_WARRIOR_POSTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortFilter>('latest');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<string | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<string | null>(null);

  const fetchFeed = useCallback(
    async (pageToLoad: number, activeSort: SortFilter, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageToLoad === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const res = await socialApi.getFeed({
          sort: activeSort,
          page: pageToLoad,
          limit: 15,
        });

        const fetchedPosts: CommunityPost[] = Array.isArray(res) ? res : res?.results || [];
        const totalPages = res?.totalPages || 1;

        const effectivePosts = fetchedPosts.length > 0 ? fetchedPosts : DEMO_WARRIOR_POSTS;

        // Apply local sort if needed
        let sorted = [...effectivePosts];
        if (activeSort === 'popular') {
          sorted.sort((a, b) => b.likesCount - a.likesCount);
        } else if (activeSort === 'milestones') {
          sorted = sorted.filter((p) => p.postType !== 'TEXT');
        }

        if (pageToLoad === 1) {
          setPosts(sorted);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const filteredNew = sorted.filter((p) => !existingIds.has(p.id));
            return [...prev, ...filteredNew];
          });
        }

        setPage(pageToLoad);
        setHasMore(pageToLoad < totalPages && fetchedPosts.length > 0);
      } catch (err) {
        console.warn('Backend feed unavailable, showing warrior demo posts:', err);
        let fallback = [...DEMO_WARRIOR_POSTS];
        if (activeSort === 'popular') {
          fallback.sort((a, b) => b.likesCount - a.likesCount);
        } else if (activeSort === 'milestones') {
          fallback = fallback.filter((p) => p.postType !== 'TEXT');
        }
        setPosts(fallback);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFeed(1, sort);
  }, [sort, fetchFeed]);

  const handleRefresh = () => {
    fetchFeed(1, sort, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchFeed(page + 1, sort);
    }
  };

  const handlePostUpdated = (updated: CommunityPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleCommentCountDelta = (countDelta: number) => {
    if (!selectedPostForComments) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPostForComments
          ? { ...p, commentsCount: Math.max(0, p.commentsCount + countDelta) }
          : p
      )
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={[styles.bannerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.bannerTextWrap}>
          <Text style={[styles.bannerTitle, { color: colors.accent }]}>
            AI FITNESS SQUAD • BUILD. MOVE. BECOME.
          </Text>
          <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
            Cheer on daily victories, share lifting PRs, and connect with fellow athletes.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createPostBannerBtn, { backgroundColor: colors.accent }]}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={18} color={colors.onAccent} />
          <Text style={[styles.createPostBannerText, { color: colors.onAccent }]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterPillsRow}>
        {(['latest', 'popular', 'milestones'] as SortFilter[]).map((filterKey) => {
          const isActive = sort === filterKey;
          const label =
            filterKey === 'latest'
              ? 'Latest'
              : filterKey === 'popular'
              ? 'Popular'
              : 'Milestones';

          return (
            <TouchableOpacity
              key={filterKey}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.accent : colors.surfaceElevated,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSort(filterKey)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: isActive ? colors.onAccent : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceElevated }]}>
          <Icon name="community" size={40} color={colors.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No Community Posts Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Be the first athlete to share your workout or fitness milestone!
        </Text>
        <TouchableOpacity
          style={[styles.emptyCta, { backgroundColor: colors.accent }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={[styles.emptyCtaText, { color: colors.onAccent }]}>Share First Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMedium, { color: colors.textPrimary, fontSize: 18 }]}>
          Community Feed
        </Text>
        <TouchableOpacity
          style={styles.actionHeaderBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="plus" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Main Feed */}
      {loading && !refreshing ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader height={70} style={{ borderRadius: 16, marginBottom: 16 }} />
          <SkeletonLoader height={220} style={{ borderRadius: 16, marginBottom: 16 }} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommunityPostCard
              post={item}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
              onOpenComments={(id) => setSelectedPostForComments(id)}
              onOpenReport={(id) => setSelectedPostForReport(id)}
              onOpenProfile={(id) => setSelectedUserForProfile(id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => fetchFeed(1, 'latest')}
      />

      <CommentsModal
        visible={!!selectedPostForComments}
        postId={selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
        onCommentCountChange={handleCommentCountDelta}
      />

      <ReportPostModal
        visible={!!selectedPostForReport}
        postId={selectedPostForReport}
        onClose={() => setSelectedPostForReport(null)}
      />

      <PublicProfileModal
        visible={!!selectedUserForProfile}
        userId={selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  actionHeaderBtn: {
    padding: 6,
  },
  skeletonContainer: {
    padding: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeaderContainer: {
    marginBottom: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  createPostBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  createPostBannerText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyCta: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyCtaText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
