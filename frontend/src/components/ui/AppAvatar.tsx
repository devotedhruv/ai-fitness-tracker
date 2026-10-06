import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';

export interface AppAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  isVerified?: boolean;
  hasStoryRing?: boolean;
  storyRingColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppAvatar({
  name = 'Athlete',
  avatarUrl,
  size = 'medium',
  isVerified = false,
  hasStoryRing = false,
  storyRingColor,
  onPress,
  style,
}: AppAvatarProps) {
  const { colors, typography } = useTheme();

  const dimensions = {
    small: { diameter: 32, iconSize: 16, fontSize: 12, badgeSize: 12 },
    medium: { diameter: 44, iconSize: 22, fontSize: 16, badgeSize: 14 },
    large: { diameter: 60, iconSize: 30, fontSize: 22, badgeSize: 18 },
    xl: { diameter: 80, iconSize: 40, fontSize: 30, badgeSize: 22 },
  }[size];

  const ringColor = storyRingColor || colors.accent;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          {
            width: dimensions.diameter,
            height: dimensions.diameter,
            borderRadius: dimensions.diameter / 2,
            backgroundColor: colors.surfaceElevated,
            borderColor: hasStoryRing ? ringColor : colors.border,
            borderWidth: hasStoryRing ? 2.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            typography.headingSmall,
            {
              fontSize: dimensions.fontSize,
              color: colors.textPrimary,
              fontWeight: '800',
            },
          ]}
        >
          {initials}
        </Text>
      </View>

      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: dimensions.badgeSize,
              height: dimensions.badgeSize,
              borderRadius: dimensions.badgeSize / 2,
              backgroundColor: colors.primary,
              borderColor: colors.surface,
            },
          ]}
        >
          <Icon name="check" size={dimensions.badgeSize * 0.65} color={colors.onPrimary} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
});
