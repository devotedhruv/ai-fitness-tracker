import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { CommunityPost, useSocialStore } from '../../stores/socialStore';

interface ShareModalProps {
  visible: boolean;
  post: CommunityPost | null;
  onClose: () => void;
}

export function ShareModal({ visible, post, onClose }: ShareModalProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!visible || !post) return null;

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleShareStory = () => {
    Alert.alert(
      'Shared to BALYRA Story',
      `"${post.caption.slice(0, 40)}..." has been added to your training story ring!`,
      [{ text: 'Awesome', onPress: onClose }]
    );
  };

  const handleExportCard = () => {
    Alert.alert(
      'Export Graphic Ready',
      'High-resolution BALYRA athlete graphic generated for Instagram Stories and status.',
      [{ text: 'Save Image', onPress: onClose }]
    );
  };

  const handleDirectMessage = () => {
    Alert.alert(
      'Send to Athlete',
      'Select a teammate or training partner to send this workout breakdown.',
      [{ text: 'Done', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Share Workout & Progress</Text>
              <Text style={styles.subtitle}>Empower other warriors to stay disciplined</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Post Preview Card */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewAuthor}>{post.userName}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{post.postType}</Text>
              </View>
            </View>
            <Text style={styles.previewCaption} numberOfLines={2}>
              {post.caption}
            </Text>
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={handleShareStory}>
              <View style={[styles.iconWrap, { backgroundColor: '#38BDF820', borderColor: '#38BDF8' }]}>
                <Icon name="today" size={22} color="#38BDF8" />
              </View>
              <Text style={styles.actionTitle}>Add to Story</Text>
              <Text style={styles.actionDesc}>24h spotlight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={handleCopyLink}>
              <View style={[styles.iconWrap, { backgroundColor: copied ? '#B8F50020' : '#F59E0B20', borderColor: copied ? '#B8F500' : '#F59E0B' }]}>
                <Icon name={copied ? 'target' : 'trophy'} size={22} color={copied ? '#B8F500' : '#F59E0B'} />
              </View>
              <Text style={[styles.actionTitle, copied && { color: '#B8F500' }]}>
                {copied ? 'Link Copied!' : 'Copy Link'}
              </Text>
              <Text style={styles.actionDesc}>balyra.fit/p/{post.id.slice(0, 6)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={handleExportCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#B8F50020', borderColor: '#B8F500' }]}>
                <Icon name="dumbbell" size={22} color="#B8F500" />
              </View>
              <Text style={styles.actionTitle}>Export Graphic</Text>
              <Text style={styles.actionDesc}>Instagram ready</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} activeOpacity={0.8} onPress={handleDirectMessage}>
              <View style={[styles.iconWrap, { backgroundColor: '#A855F720', borderColor: '#A855F7' }]}>
                <Icon name="profile" size={22} color="#A855F7" />
              </View>
              <Text style={styles.actionTitle}>Direct Message</Text>
              <Text style={styles.actionDesc}>Send to partner</Text>
            </TouchableOpacity>
          </View>

          {/* Slogan */}
          <View style={styles.sloganFooter}>
            <Text style={styles.sloganText}>BALYRA • BUILD. MOVE. BECOME.</Text>
          </View>
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
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
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
  previewCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewAuthor: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pill: {
    backgroundColor: '#262626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  previewCaption: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionDesc: {
    color: '#666666',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  sloganFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  sloganText: {
    color: '#444444',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
