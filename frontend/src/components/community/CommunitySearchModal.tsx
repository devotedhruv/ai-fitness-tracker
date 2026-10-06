import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { useSocialStore, CommunityPost } from '../../stores/socialStore';

type SearchCategory = 'ALL' | 'WARRIORS' | 'WORKOUTS' | 'EXERCISES' | 'CHALLENGES';

interface CommunitySearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onSelectPost: (post: CommunityPost) => void;
}

export function CommunitySearchModal({
  visible,
  onClose,
  onSelectUser,
  onSelectPost,
}: CommunitySearchModalProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');

  const athletes = useSocialStore((state) => state.athletes);
  const posts = useSocialStore((state) => state.posts);
  const challenges = useSocialStore((state) => state.challenges);
  const followUser = useSocialStore((state) => state.followUser);
  const unfollowUser = useSocialStore((state) => state.unfollowUser);

  const athleteList = useMemo(() => Object.values(athletes), [athletes]);

  const filteredAthletes = useMemo(() => {
    if (!query.trim()) return athleteList;
    const q = query.toLowerCase();
    return athleteList.filter(
      (a) =>
        a.displayName.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        (a.rank.tierName || a.rank.name || '').toLowerCase().includes(q)
    );
  }, [athleteList, query]);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.userName.toLowerCase().includes(q) ||
        p.postType.toLowerCase().includes(q) ||
        p.workoutData?.workoutName.toLowerCase().includes(q) ||
        p.prData?.exerciseName.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const filteredChallenges = useMemo(() => {
    if (!query.trim()) return challenges;
    const q = query.toLowerCase();
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.badgeName || c.badgeReward || '').toLowerCase().includes(q)
    );
  }, [challenges, query]);

  if (!visible) return null;

  const categories: { key: SearchCategory; label: string }[] = [
    { key: 'ALL', label: 'All Results' },
    { key: 'WARRIORS', label: 'Warriors' },
    { key: 'WORKOUTS', label: 'Workouts' },
    { key: 'CHALLENGES', label: 'Challenges' },
  ];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]}>
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.inputWrapper}>
            <Icon name="target" size={18} color="#737373" />
            <TextInput
              style={styles.input}
              placeholder="Search athletes, routines, PRs, challenges..."
              placeholderTextColor="#666666"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Icon name="x" size={16} color="#737373" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterPill,
                  selectedCategory === cat.key && styles.activeFilterPill,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedCategory === cat.key && styles.activeFilterPillText,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          {/* Warriors Section */}
          {(selectedCategory === 'ALL' || selectedCategory === 'WARRIORS') && filteredAthletes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>ATHLETES ({filteredAthletes.length})</Text>
              {filteredAthletes.map((athlete) => (
                <View key={athlete.id} style={styles.athleteRow}>
                  <TouchableOpacity
                    style={styles.athleteInfo}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSelectUser(athlete.id);
                    }}
                  >
                    <Avatar uri={athlete.avatar} name={athlete.displayName} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.athleteName}>{athlete.displayName}</Text>
                      <Text style={styles.athleteHandle}>
                        @{athlete.username} • <Text style={{ color: '#F59E0B' }}>{athlete.rank.tierName}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.followBtn,
                      athlete.isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                    ]}
                    onPress={() => {
                      if (athlete.isFollowing) unfollowUser(athlete.id);
                      else followUser(athlete.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.followBtnText,
                        athlete.isFollowing ? styles.followingText : styles.notFollowingText,
                      ]}
                    >
                      {athlete.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Challenges Section */}
          {(selectedCategory === 'ALL' || selectedCategory === 'CHALLENGES') && filteredChallenges.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>CHALLENGES ({filteredChallenges.length})</Text>
              {filteredChallenges.map((c) => (
                <View key={c.id} style={styles.challengeItem}>
                  <View style={styles.challengeIconWrap}>
                    <Text style={{ fontSize: 20 }}>🎯</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <Text style={styles.challengeDesc} numberOfLines={1}>{c.description}</Text>
                    <Text style={styles.challengeSub}>{c.participantsCount} warriors participating</Text>
                  </View>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{c.badgeName}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Posts & Workouts Section */}
          {(selectedCategory === 'ALL' || selectedCategory === 'WORKOUTS') && filteredPosts.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>COMMUNITY POSTS & ROUTINES ({filteredPosts.length})</Text>
              {filteredPosts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.postResultCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onSelectPost(p);
                  }}
                >
                  <View style={styles.postResultHeader}>
                    <Text style={styles.postResultAuthor}>{p.userName}</Text>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{p.postType}</Text>
                    </View>
                  </View>
                  <Text style={styles.postResultCaption} numberOfLines={2}>{p.caption}</Text>
                  <View style={styles.postResultMeta}>
                    <Text style={styles.metaItem}>🔥 {p.likesCount} applause</Text>
                    <Text style={styles.metaItem}>💬 {p.commentsCount} comments</Text>
                    {p.workoutData && (
                      <Text style={[styles.metaItem, { color: '#F59E0B' }]}>
                        ⚡ {p.workoutData.totalVolumeKg.toLocaleString()} kg
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelBtnText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222222',
  },
  activeFilterPill: {
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
  },
  filterPillText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterPillText: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 18,
  },
  sectionTitle: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  athleteHandle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  notFollowingBtn: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  followingBtn: {
    backgroundColor: '#1C1C1C',
    borderColor: '#2E2E2E',
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notFollowingText: {
    color: '#000000',
  },
  followingText: {
    color: '#D4D4D4',
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    gap: 12,
  },
  challengeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  challengeDesc: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  challengeSub: {
    color: '#F59E0B',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },
  badgePill: {
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  postResultCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1D1D1D',
  },
  postResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postResultAuthor: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  typeTag: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  postResultCaption: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 16,
  },
  postResultMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    color: '#737373',
    fontSize: 11,
    fontWeight: '600',
  },
});
