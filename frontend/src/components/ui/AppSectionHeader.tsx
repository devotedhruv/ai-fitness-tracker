import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface AppSectionHeaderProps {
  title: string;
  subtitle?: string;
  rightActionText?: string;
  onRightAction?: () => void;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppSectionHeader({
  title,
  subtitle,
  rightActionText,
  onRightAction,
  rightElement,
  style,
}: AppSectionHeaderProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleCol}>
        <Text style={[typography.headingSmall, { color: colors.textPrimary, letterSpacing: 0.2 }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement ? (
        rightElement
      ) : rightActionText && onRightAction ? (
        <TouchableOpacity
          onPress={onRightAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={[typography.captionBold, { color: colors.accent }]}>
            {rightActionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
});
