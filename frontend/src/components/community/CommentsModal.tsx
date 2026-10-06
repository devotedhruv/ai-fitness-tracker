import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import { RankInsignia } from '../RankInsignia';
import { useAuthStore } from '../../stores/authStore';
import { useProgressionStore } from '../../stores/progressionStore';
import { DEMO_POST_COMMENTS } from '../../data/demoFeedPosts';
import { socialApi } from '../../services/api';

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRankName: string;
  userRankInsignia: string;
  userRankTier: number;
  text: string;
  isMine: boolean;
  createdAt: string;
}

interface CommentsModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
  onCommentCountChange?: (countDelta: number) => void;
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

import { useSocialStore } from '../../stores/socialStore';

export function CommentsModal({
  visible,
  postId,
  onClose,
  onCommentCountChange,
}: CommentsModalProps) {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchComments = async (id: string) => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Check social store first
      const storeComments = useSocialStore.getState().comments[id];
      if (storeComments && storeComments.length > 0) {
        setComments(
          storeComments.map((c) => ({
            id: c.id,
            postId: c.postId,
            userId: c.userId,
            userName: c.userName,
            userRankName: c.userRankName || 'WARRIOR',
            userRankInsignia: 'single-chevron',
            userRankTier: 2,
            text: c.text,
            isMine: c.isMine,
            createdAt: c.createdAt,
          }))
        );
        return;
      }

      if (id.startsWith('demo-')) {
        setComments(DEMO_POST_COMMENTS[id] || []);
        return;
      }
      const data = await socialApi.getComments(id);
      const results = Array.isArray(data) ? data : data.results || [];
      if (results.length === 0 && DEMO_POST_COMMENTS[id]) {
        setComments(DEMO_POST_COMMENTS[id]);
      } else {
        setComments(results);
      }
    } catch (err: any) {
      if (DEMO_POST_COMMENTS[id]) {
        setComments(DEMO_POST_COMMENTS[id]);
      } else {
        setErrorMsg(err.message || 'Failed to load comments.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && postId) {
      fetchComments(postId);
    } else {
      setComments([]);
      setInputText('');
      setErrorMsg('');
    }
  }, [visible, postId]);

  const handleSendComment = async () => {
    if (!inputText.trim() || !postId || sending) return;

    const trimmed = inputText.trim();
    setInputText('');

    const currentProgress = useProgressionStore.getState().progress;

    // Optimistic comment with warrior rank
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: PostComment = {
      id: tempId,
      postId,
      userId: user?.id || 'me',
      userName: user?.profile?.displayName || 'You',
      userRankName: currentProgress?.rankTitle || 'INITIATE WARRIOR',
      userRankInsignia: currentProgress?.rankTitle?.toLowerCase().includes('berserker') ? 'single-chevron' : 'recruit-bar',
      userRankTier: currentProgress?.level || 1,
      text: trimmed,
      isMine: true,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [optimisticComment, ...prev]);
    onCommentCountChange?.(1);

    // Save to social store
    useSocialStore.getState().addComment(postId, trimmed);

    if (postId.startsWith('demo-')) {
      return;
    }

    try {
      setSending(true);
      const created = await socialApi.createComment(postId, { text: trimmed });
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? created : c))
      );
    } catch (err: any) {
      // For resilience, keep optimistic comment if backend is offline
      console.warn('Backend comment error, kept optimistic comment:', err?.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId) return;
    const previous = [...comments];
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCommentCountChange?.(-1);

    try {
      await socialApi.deleteComment(postId, commentId);
    } catch (err: any) {
      setComments(previous);
      onCommentCountChange?.(1);
      setErrorMsg(err.message || 'Failed to delete comment.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: 'rgba(5, 8, 18, 0.75)' }]}
      >
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Error notice */}
          {errorMsg ? (
            <View style={[styles.errorBar, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Comments List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceElevated }]}>
                <Icon name="message-circle" size={32} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No comments yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Be the first athlete to encourage or celebrate this milestone!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={[styles.commentRow, { borderBottomColor: colors.border }]}>
                  <Avatar name={item.userName} size="sm" />
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <View style={styles.authorRow}>
                        <Text style={[styles.authorName, { color: colors.textPrimary }]}>
                          {item.userName}
                        </Text>
                        <View style={styles.insigniaWrap}>
                          <RankInsignia rankIdOrType={item.userRankInsignia || 'recruit-bar'} size="sm" />
                        </View>
                        <Text style={[styles.rankBadgeText, { color: colors.accent }]}>
                          {item.userRankName}
                        </Text>
                      </View>
                      <Text style={[styles.timestamp, { color: colors.mutedText }]}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.commentText, { color: colors.textPrimary }]}>
                      {item.text}
                    </Text>
                  </View>
                  {item.isMine && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="trash" size={14} color={colors.mutedText} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          {/* Input Bar */}
          <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <Avatar name={user?.profile?.displayName || 'Athlete'} size="sm" />
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Cheer on this athlete..."
              placeholderTextColor={colors.mutedText}
              value={inputText}
              onChangeText={setInputText}
              maxLength={300}
              onSubmitEditing={handleSendComment}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={!inputText.trim() || sending}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputText.trim() ? colors.accent : colors.surfaceElevated,
                  opacity: inputText.trim() ? 1 : 0.5,
                },
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.onAccent} />
              ) : (
                <Icon
                  name="send"
                  size={16}
                  color={inputText.trim() ? colors.onAccent : colors.mutedText}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '80%',
    minHeight: 420,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  errorBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  authorName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
  },
  insigniaWrap: {
    marginHorizontal: 2,
  },
  rankBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
  },
  commentText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
