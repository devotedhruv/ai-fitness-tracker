import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface AppBadgeProps {
  label: string;
  variant?: 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'small' | 'medium';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppBadge({
  label,
  variant = 'accent',
  size = 'small',
  icon,
  style,
}: AppBadgeProps) {
  const { colors, typography, radius } = useTheme();

  let backgroundColor = colors.accentMuted;
  let borderColor = colors.primary;
  let textColor = colors.accentText;

  if (variant === 'neutral') {
    backgroundColor = colors.surfaceElevated;
    borderColor = colors.border;
    textColor = colors.textSecondary;
  } else if (variant === 'success') {
    backgroundColor = colors.successMuted;
    borderColor = colors.success;
    textColor = colors.success;
  } else if (variant === 'warning') {
    backgroundColor = colors.warningMuted;
    borderColor = colors.warning;
    textColor = colors.warning;
  } else if (variant === 'error') {
    backgroundColor = colors.errorMuted;
    borderColor = colors.error;
    textColor = colors.error;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = colors.border;
    textColor = colors.textPrimary;
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius.full,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          typography.label,
          {
            color: textColor,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
});
