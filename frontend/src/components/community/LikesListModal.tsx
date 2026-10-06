import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { useSocialStore } from '../../stores/socialStore';

interface LikedUserItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rankName?: string;
}

interface LikesListModalProps {
  visible: boolean;
  likesCount: number;
  users?: LikedUserItem[];
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function LikesListModal({
  visible,
  likesCount,
  users = [],
  onClose,
  onSelectUser,
}: LikesListModalProps) {
  const { colors } = useTheme();
  const currentUser = useSocialStore((state) => state.currentUser);
  const athletes = useSocialStore((state) => state.athletes);
  const followUser = useSocialStore((state) => state.followUser);
  const unfollowUser = useSocialStore((state) => state.unfollowUser);

  if (!visible) return null;

  // Enhance liked users with store athlete data if available
  const displayList = users.map((u) => {
    const athlete = athletes[u.id];
    return {
      ...u,
      isFollowing: athlete ? athlete.isFollowing : false,
      rankName: athlete?.rank.tierName || u.rankName || 'Warrior',
    };
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="heart-fill" size={18} color="#EF4444" />
              <Text style={styles.title}>Applause & Respect ({likesCount})</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Be the first warrior to applaud this effort!</Text>
              </View>
            }
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
                    <Avatar uri={item.avatar} name={item.name} size={44} />
                    <View style={styles.nameBlock}>
                      <Text style={styles.displayName}>{item.name}</Text>
                      <View style={styles.subtitleRow}>
                        <Text style={styles.username}>@{item.username}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.rankBadge}>{item.rankName}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {!isMe && (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        item.isFollowing
                          ? styles.followingBtn
                          : styles.notFollowingBtn,
                      ]}
                      onPress={() => {
                        if (item.isFollowing) {
                          unfollowUser(item.id);
                        } else {
                          followUser(item.id);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.followBtnText,
                          item.isFollowing ? styles.followingText : styles.notFollowingText,
                        ]}
                      >
                        {item.isFollowing ? 'Following' : 'Follow'}
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
    maxHeight: '75%',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  rankBadge: {
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
    backgroundColor: '#1C1C1C',
    borderColor: '#2E2E2E',
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#737373',
    fontSize: 14,
  },
});
