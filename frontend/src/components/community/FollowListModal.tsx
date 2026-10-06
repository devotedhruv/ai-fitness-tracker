import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { useSocialStore, UserSocialProfile } from '../../stores/socialStore';

interface FollowListModalProps {
  visible: boolean;
  profile: UserSocialProfile | null;
  initialTab?: 'FOLLOWERS' | 'FOLLOWING';
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function FollowListModal({
  visible,
  profile,
  initialTab = 'FOLLOWERS',
  onClose,
  onSelectUser,
}: FollowListModalProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'FOLLOWERS' | 'FOLLOWING'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = useSocialStore((state) => state.currentUser);
  const athletes = useSocialStore((state) => state.athletes);
  const followUser = useSocialStore((state) => state.followUser);
  const unfollowUser = useSocialStore((state) => state.unfollowUser);

  // Derive followers and following from athletes dictionary
  const athleteList = useMemo(() => Object.values(athletes), [athletes]);

  const displayedAthletes = useMemo(() => {
    let list = athleteList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q)
      );
    }
    return list;
  }, [athleteList, searchQuery]);

  if (!visible || !profile) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{profile.displayName}</Text>
              <Text style={styles.subtitle}>@{profile.username}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'FOLLOWERS' && styles.activeTabBtn,
              ]}
              onPress={() => setActiveTab('FOLLOWERS')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'FOLLOWERS' && styles.activeTabText,
                ]}
              >
                Followers ({profile.followersCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'FOLLOWING' && styles.activeTabBtn,
              ]}
              onPress={() => setActiveTab('FOLLOWING')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'FOLLOWING' && styles.activeTabText,
                ]}
              >
                Following ({profile.followingCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <Icon name="target" size={16} color="#737373" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search warriors..."
              placeholderTextColor="#737373"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="x" size={16} color="#737373" />
              </TouchableOpacity>
            )}
          </View>

          {/* Athlete List */}
          <FlatList
            data={displayedAthletes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isMe = item.id === currentUser.id;

              return (
                <View style={styles.userRow}>
                  <TouchableOpacity
                    style={styles.userInfo}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSelectUser(item.id);
                    }}
                  >
                    <Avatar uri={item.avatar} name={item.displayName} size={44} />
                    <View style={styles.nameBlock}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      <View style={styles.subRow}>
                        <Text style={styles.username}>@{item.username}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.rankName}>{item.rank.tierName}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {!isMe && (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        item.isFollowing
                          ? styles.followingBtn
                          : item.isFollowRequested
                          ? styles.requestedBtn
                          : styles.notFollowingBtn,
                      ]}
                      onPress={() => {
                        if (item.isFollowing || item.isFollowRequested) {
                          unfollowUser(item.id);
                        } else {
                          followUser(item.id);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.followBtnText,
                          item.isFollowing
                            ? styles.followingText
                            : item.isFollowRequested
                            ? styles.requestedText
                            : styles.notFollowingText,
                        ]}
                      >
                        {item.isFollowing
                          ? 'Following'
                          : item.isFollowRequested
                          ? 'Requested'
                          : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
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
    height: '80%',
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#737373',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nameBlock: {
    flex: 1,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  username: {
    color: '#888888',
    fontSize: 12,
  },
  dot: {
    color: '#555555',
    fontSize: 12,
  },
  rankName: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  notFollowingBtn: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  followingBtn: {
    backgroundColor: '#1A1A1A',
    borderColor: '#2E2E2E',
  },
  requestedBtn: {
    backgroundColor: '#262626',
    borderColor: '#383838',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notFollowingText: {
    color: '#000000',
  },
  followingText: {
    color: '#D4D4D4',
  },
  requestedText: {
    color: '#A3A3A3',
  },
});
