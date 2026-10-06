import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { StoryItem, useSocialStore } from '../../stores/socialStore';

interface StoryRowProps {
  onSelectStory: (story: StoryItem, index: number) => void;
  onCreateStory?: () => void;
}

export function StoryRow({ onSelectStory, onCreateStory }: StoryRowProps) {
  const { colors } = useTheme();
  const stories = useSocialStore((state) => state.stories);
  const currentUser = useSocialStore((state) => state.currentUser);

  const getRingColor = (story: StoryItem) => {
    if (!story.hasUnseen) return '#262626';
    switch (story.storyType) {
      case 'PR':
        return '#B8F500'; // Electric lime
      case 'WORKOUT':
        return '#38BDF8'; // Azure / Sky
      case 'STREAK':
        return '#EF4444'; // Flame crimson
      case 'ACHIEVEMENT':
        return '#F59E0B'; // Saffron gold
      case 'CHALLENGE':
        return '#EC4899'; // Hot pink / Energy
      case 'TRANSFORMATION':
        return '#10B981'; // Emerald
      default:
        return '#F59E0B';
    }
  };

  const getStoryTypeBadge = (type: StoryItem['storyType']) => {
    switch (type) {
      case 'PR':
        return '🔥';
      case 'WORKOUT':
        return '⚡';
      case 'STREAK':
        return '🔱';
      case 'ACHIEVEMENT':
        return '👑';
      case 'CHALLENGE':
        return '🎯';
      case 'TRANSFORMATION':
        return '✨';
      default:
        return '⚡';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current User: Add Story */}
        <TouchableOpacity
          style={styles.storyCircleWrapper}
          activeOpacity={0.8}
          onPress={onCreateStory}
        >
          <View style={[styles.avatarRing, { borderColor: '#2A2A2A', borderStyle: 'dashed' }]}>
            <Avatar
              uri={currentUser.avatar}
              name={currentUser.displayName}
              size={56}
            />
            <View style={[styles.plusBadge, { backgroundColor: '#F59E0B' }]}>
              <Icon name="plus" size={12} color="#000000" />
            </View>
          </View>
          <Text style={[styles.userNameText, { color: colors.textSecondary }]} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Stories from Athletes */}
        {stories.map((story, index) => {
          const ringColor = getRingColor(story);
          const badgeEmoji = getStoryTypeBadge(story.storyType);

          return (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCircleWrapper}
              activeOpacity={0.8}
              onPress={() => onSelectStory(story, index)}
            >
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: ringColor,
                    shadowColor: story.hasUnseen ? ringColor : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: story.hasUnseen ? 0.6 : 0,
                    shadowRadius: 6,
                  },
                ]}
              >
                <Avatar
                  uri={story.userAvatar}
                  name={story.userName}
                  size={56}
                />
                <View style={[styles.typeBadge, { borderColor: '#0A0A0A' }]}>
                  <Text style={styles.typeBadgeText}>{badgeEmoji}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.userNameText,
                  {
                    color: story.hasUnseen ? colors.textPrimary : colors.textSecondary,
                    fontWeight: story.hasUnseen ? '600' : '400',
                  },
                ]}
                numberOfLines={1}
              >
                {story.userName.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyCircleWrapper: {
    alignItems: 'center',
    width: 68,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#121212',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#050505',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  typeBadgeText: {
    fontSize: 10,
  },
  userNameText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 68,
  },
});
