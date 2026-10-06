import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface AppDividerProps {
  orientation?: 'horizontal' | 'vertical';
  marginVertical?: number;
  marginHorizontal?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppDivider({
  orientation = 'horizontal',
  marginVertical = 12,
  marginHorizontal = 8,
  color,
  style,
}: AppDividerProps) {
  const { colors } = useTheme();
  const dividerColor = color || colors.divider;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: dividerColor,
            marginHorizontal,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: dividerColor,
          marginVertical,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
