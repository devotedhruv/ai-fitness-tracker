import React, { ReactNode } from 'react';
import { View, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export interface AppCardProps {
  children?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  style,
}: AppCardProps) {
  const { colors, radius, spacing, shadows } = useTheme();

  const paddingVal = {
    none: 0,
    small: spacing.xs,
    medium: spacing.md,
    large: spacing.lg,
  }[padding];

  let backgroundColor = colors.surface;
  let borderColor = colors.border;
  let shadowStyle = shadows.none;

  if (variant === 'elevated') {
    backgroundColor = colors.surfaceElevated;
    shadowStyle = shadows.sm;
  } else if (variant === 'outlined') {
    backgroundColor = 'transparent';
    borderColor = colors.border;
  } else if (variant === 'accent') {
    backgroundColor = colors.surface;
    borderColor = colors.accent;
    shadowStyle = shadows.accentGlow;
  }

  const containerStyle: ViewStyle = {
    backgroundColor,
    borderColor,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: paddingVal,
    ...shadowStyle,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          containerStyle,
          { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}
