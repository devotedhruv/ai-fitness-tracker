import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { StoryItem, useSocialStore } from '../../stores/socialStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerModalProps {
  visible: boolean;
  initialIndex: number;
  onClose: () => void;
  onOpenProfile?: (userId: string) => void;
}

export function StoryViewerModal({
  visible,
  initialIndex,
  onClose,
  onOpenProfile,
}: StoryViewerModalProps) {
  const { colors } = useTheme();
  const stories = useSocialStore((state) => state.stories);
  const markStoryAsSeen = useSocialStore((state) => state.markStoryAsSeen);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [cheerText, setCheerText] = useState('');
  const [cheered, setCheered] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    if (visible && stories[currentIndex]) {
      markStoryAsSeen(stories[currentIndex].id);
    }
  }, [visible, currentIndex, stories, markStoryAsSeen]);

  if (!visible || !stories.length) return null;

  const currentStory = stories[currentIndex] || stories[0];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCheerText('');
      setCheered(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCheerText('');
      setCheered(false);
    }
  };

  const handleSendCheer = () => {
    if (cheerText.trim()) {
      setCheered(true);
      setCheerText('');
      setTimeout(() => setCheered(false), 2000);
    }
  };

  const getStoryGradient = (type: StoryItem['storyType']) => {
    switch (type) {
      case 'PR':
        return '#142800'; // Lime dark tint
      case 'WORKOUT':
        return '#0A1E2F'; // Navy tint
      case 'STREAK':
        return '#260B0B'; // Crimson tint
      case 'ACHIEVEMENT':
        return '#251A05'; // Amber tint
      case 'CHALLENGE':
        return '#290E20'; // Magenta tint
      case 'TRANSFORMATION':
        return '#06231A'; // Emerald tint
      default:
        return '#121212';
    }
  };

  const getAccentColor = (type: StoryItem['storyType']) => {
    switch (type) {
      case 'PR':
        return '#B8F500';
      case 'WORKOUT':
        return '#38BDF8';
      case 'STREAK':
        return '#EF4444';
      case 'ACHIEVEMENT':
        return '#F59E0B';
      case 'CHALLENGE':
        return '#EC4899';
      case 'TRANSFORMATION':
        return '#10B981';
      default:
        return '#F59E0B';
    }
  };

  const accentColor = getAccentColor(currentStory.storyType);
  const bgColor = getStoryGradient(currentStory.storyType);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]}>
        {/* Top Progress Segment Bars */}
        <View style={styles.progressBarContainer}>
          {stories.map((s, idx) => (
            <View key={s.id} style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: idx <= currentIndex ? accentColor : 'rgba(255,255,255,0.2)',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Story Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.userInfo}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onOpenProfile?.(currentStory.userId);
            }}
          >
            <Avatar uri={currentStory.userAvatar} name={currentStory.userName} size={40} />
            <View style={styles.userTextContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{currentStory.userName}</Text>
                <View style={[styles.typePill, { backgroundColor: accentColor + '25', borderColor: accentColor }]}>
                  <Text style={[styles.typePillText, { color: accentColor }]}>
                    {currentStory.storyType}
                  </Text>
                </View>
              </View>
              <Text style={styles.handleText}>@{currentStory.userUsername}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Touch zones for Previous / Next Story */}
        <View style={styles.contentArea}>
          <TouchableOpacity
            style={styles.touchZoneLeft}
            activeOpacity={1}
            onPress={handlePrev}
          />
          <TouchableOpacity
            style={styles.touchZoneRight}
            activeOpacity={1}
            onPress={handleNext}
          />

          {/* Central Story Card */}
          <View style={[styles.storyCard, { backgroundColor: bgColor, borderColor: accentColor + '40' }]}>
            <View style={[styles.accentAura, { backgroundColor: accentColor + '15' }]} />

            {/* Graphic or Badge */}
            <View style={[styles.iconShield, { borderColor: accentColor }]}>
              <Text style={styles.shieldEmoji}>
                {currentStory.storyType === 'PR'
                  ? '⚡'
                  : currentStory.storyType === 'STREAK'
                  ? '🔱'
                  : currentStory.storyType === 'ACHIEVEMENT'
                  ? '👑'
                  : currentStory.storyType === 'CHALLENGE'
                  ? '🎯'
                  : '🔥'}
              </Text>
            </View>

            {/* High-Impact Metric */}
            <Text style={[styles.highlightMetric, { color: accentColor }]}>
              {currentStory.highlightMetric}
            </Text>

            <Text style={styles.storyTitle}>{currentStory.title}</Text>
            <Text style={styles.storySubtitle}>{currentStory.subtitle}</Text>

            {/* Nepali/Sanskrit Mantra Watermark */}
            <View style={styles.mantraBox}>
              <Text style={styles.mantraNepali}>बलं वीर्यं च धैर्यम्</Text>
              <Text style={styles.mantraEnglish}>STRENGTH • VALOR • ENDURANCE</Text>
            </View>
          </View>
        </View>

        {/* Bottom Reaction & Cheer Bar */}
        <View style={styles.footer}>
          {cheered ? (
            <View style={[styles.cheerSentBanner, { backgroundColor: accentColor + '20' }]}>
              <Text style={[styles.cheerSentText, { color: accentColor }]}>
                🔥 Cheer sent to {currentStory.userName.split(' ')[0]}!
              </Text>
            </View>
          ) : (
            <View style={styles.footerInputRow}>
              {/* Quick Emojis */}
              <TouchableOpacity
                style={styles.quickEmojiBtn}
                onPress={() => {
                  setCheered(true);
                  setTimeout(() => setCheered(false), 2000);
                }}
              >
                <Text style={styles.quickEmoji}>🔥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickEmojiBtn}
                onPress={() => {
                  setCheered(true);
                  setTimeout(() => setCheered(false), 2000);
                }}
              >
                <Text style={styles.quickEmoji}>🔱</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickEmojiBtn}
                onPress={() => {
                  setCheered(true);
                  setTimeout(() => setCheered(false), 2000);
                }}
              >
                <Text style={styles.quickEmoji}>⚡</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder={`Send cheer to ${currentStory.userName.split(' ')[0]}...`}
                placeholderTextColor="#737373"
                value={cheerText}
                onChangeText={setCheerText}
                onSubmitEditing={handleSendCheer}
                returnKeyType="send"
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: cheerText.trim() ? accentColor : '#262626' },
                ]}
                onPress={handleSendCheer}
                disabled={!cheerText.trim()}
              >
                <Icon
                  name="chevron-right"
                  size={18}
                  color={cheerText.trim() ? '#000000' : '#737373'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: '#262626',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handleText: {
    color: '#A3A3A3',
    fontSize: 12,
  },
  closeButton: {
    padding: 6,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  touchZoneLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.35,
    zIndex: 5,
  },
  touchZoneRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.65,
    zIndex: 5,
  },
  storyCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  accentAura: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  iconShield: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldEmoji: {
    fontSize: 32,
  },
  highlightMetric: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  storySubtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  mantraBox: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  },
  mantraNepali: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  mantraEnglish: {
    color: '#737373',
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  footerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickEmojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  quickEmoji: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#141414',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#262626',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cheerSentBanner: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  cheerSentText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
