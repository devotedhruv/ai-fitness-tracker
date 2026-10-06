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
import { useSocialStore, SocialNotification } from '../../stores/socialStore';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function NotificationsModal({
  visible,
  onClose,
  onSelectUser,
}: NotificationsModalProps) {
  const { colors } = useTheme();
  const notifications = useSocialStore((state) => state.notifications);
  const markNotificationRead = useSocialStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useSocialStore((state) => state.markAllNotificationsRead);
  const acceptFollowRequest = useSocialStore((state) => state.acceptFollowRequest);
  const declineFollowRequest = useSocialStore((state) => state.declineFollowRequest);
  const followUser = useSocialStore((state) => state.followUser);
  const athletes = useSocialStore((state) => state.athletes);

  if (!visible) return null;

  const getNotificationIcon = (type: SocialNotification['type']) => {
    switch (type) {
      case 'LIKE':
        return <Icon name="heart-fill" size={14} color="#EF4444" />;
      case 'COMMENT':
        return <Icon name="today" size={14} color="#38BDF8" />;
      case 'FOLLOW':
      case 'FOLLOW_REQUEST':
        return <Icon name="profile" size={14} color="#F59E0B" />;
      case 'CHALLENGE_INVITE':
      case 'SYSTEM':
        return <Icon name="trophy" size={14} color="#B8F500" />;
      default:
        return <Icon name="today" size={14} color="#F59E0B" />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Squad Activity</Text>
              <Text style={styles.subtitle}>Alerts, cheers, and follow requests</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Icon name="x" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>All caught up! No new notifications.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const senderId = item.senderId || item.sender.id;
              const senderName = item.senderName || item.sender.name;
              const senderAvatar = item.senderAvatar || item.sender.avatar;
              const athlete = athletes[senderId];
              const isFollowing = athlete?.isFollowing;

              return (
                <View
                  style={[
                    styles.notificationItem,
                    !item.isRead && styles.unreadItem,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.avatarWrap}
                    onPress={() => {
                      markNotificationRead(item.id);
                      onClose();
                      onSelectUser(senderId);
                    }}
                  >
                    <Avatar uri={senderAvatar} name={senderName} size={44} />
                    <View style={styles.typeIconBadge}>
                      {getNotificationIcon(item.type)}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.bodyWrap}>
                    <TouchableOpacity
                      onPress={() => {
                        markNotificationRead(item.id);
                        onClose();
                        onSelectUser(senderId);
                      }}
                    >
                      <Text style={styles.notificationText}>
                        <Text style={styles.boldSender}>{senderName} </Text>
                        {item.text || item.message}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.timeText}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>

                    {/* Action buttons for Follow Requests */}
                    {item.type === 'FOLLOW_REQUEST' && (
                      <View style={styles.actionBtnRow}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => {
                            acceptFollowRequest(item.id, senderId);
                          }}
                        >
                          <Text style={styles.acceptBtnText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={() => {
                            declineFollowRequest(item.id);
                          }}
                        >
                          <Text style={styles.declineBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Quick Follow Back for New Followers */}
                    {item.type === 'FOLLOW' && !isFollowing && (
                      <View style={styles.actionBtnRow}>
                        <TouchableOpacity
                          style={styles.followBackBtn}
                          onPress={() => {
                            followUser(senderId);
                            markNotificationRead(item.id);
                          }}
                        >
                          <Text style={styles.followBackBtnText}>Follow Back</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {!item.isRead && <View style={styles.unreadDot} />}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
    borderRadius: 12,
    gap: 12,
  },
  unreadItem: {
    backgroundColor: '#131313',
  },
  avatarWrap: {
    position: 'relative',
  },
  typeIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1B1B1B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0D0D0D',
  },
  bodyWrap: {
    flex: 1,
  },
  notificationText: {
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 18,
  },
  boldSender: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeText: {
    color: '#666666',
    fontSize: 11,
    marginTop: 4,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  declineBtnText: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '600',
  },
  followBackBtn: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  followBackBtnText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#737373',
    fontSize: 14,
  },
});
