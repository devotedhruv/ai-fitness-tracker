import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { useTheme } from '../tokens/ThemeContext';

export interface AvatarPreset {
  id: string;
  icon: IconName;
  label: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset:athlete', icon: 'profile', label: 'Athlete' },
  { id: 'preset:lightning', icon: 'today', label: 'Power' },
  { id: 'preset:flame', icon: 'flame', label: 'Streak' },
  { id: 'preset:dumbbell', icon: 'dumbbell', label: 'Lifting' },
  { id: 'preset:runner', icon: 'runner', label: 'Runner' },
  { id: 'preset:trophy', icon: 'trophy', label: 'Champion' },
  { id: 'preset:target', icon: 'target', label: 'Precision' },
  { id: 'preset:bike', icon: 'bike', label: 'Cycling' },
];

export function resolveAvatarIcon(avatarUrl?: string | null): IconName {
  if (!avatarUrl) return 'profile';
  if (avatarUrl.startsWith('preset:')) {
    const key = avatarUrl.replace('preset:', '');
    if (key === 'lightning') return 'today';
    if (key === 'flame') return 'flame';
    if (key === 'dumbbell') return 'dumbbell';
    if (key === 'runner') return 'runner';
    if (key === 'trophy') return 'trophy';
    if (key === 'target') return 'target';
    if (key === 'bike') return 'bike';
    return 'profile';
  }
  // Graceful fallbacks for any existing legacy emojis
  if (avatarUrl.includes('⚡')) return 'today';
  if (avatarUrl.includes('🔥')) return 'flame';
  if (avatarUrl.includes('🏋') || avatarUrl.includes('🥊') || avatarUrl.includes('🦾')) return 'dumbbell';
  if (avatarUrl.includes('🏃') || avatarUrl.includes('🧗')) return 'runner';
  if (avatarUrl.includes('🏆') || avatarUrl.includes('🦅')) return 'trophy';
  if (avatarUrl.includes('🎯')) return 'target';
  return 'profile';
}

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'hero';
  fallbackIcon?: IconName;
  borderColor?: string;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function resolveAvatarSize(size?: number | 'sm' | 'md' | 'lg' | 'hero'): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 32;
    case 'md':
      return 44;
    case 'lg':
      return 64;
    case 'hero':
      return 96;
    default:
      return 44;
  }
}

export function Avatar({
  uri,
  name,
  size = 44,
  fallbackIcon,
  borderColor,
  backgroundColor,
  iconColor,
  style,
  accessibilityLabel = 'User Avatar',
}: AvatarProps) {
  const { colors } = useTheme();
  const numericSize = resolveAvatarSize(size);

  const isImage = uri && (uri.startsWith('http') || uri.startsWith('data:'));
  const activeBorder = borderColor || colors.accent;
  const activeBg = backgroundColor || colors.surfaceElevated;
  const activeIconColor = iconColor || colors.accent;

  const iconName = fallbackIcon || resolveAvatarIcon(uri);
  const iconSize = Math.round(numericSize * 0.52);

  return (
    <View
      style={[
        styles.circle,
        {
          width: numericSize,
          height: numericSize,
          borderRadius: numericSize / 2,
          backgroundColor: activeBg,
          borderColor: activeBorder,
          borderWidth: 1.5,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {isImage ? (
        <Image
          source={{ uri }}
          style={{ width: numericSize - 3, height: numericSize - 3, borderRadius: (numericSize - 3) / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Icon name={iconName} size={iconSize} color={activeIconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
