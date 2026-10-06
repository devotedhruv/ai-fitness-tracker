import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../tokens/ThemeContext';

export interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  isAccentValue?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({
  label,
  value,
  unit,
  subtitle,
  isAccentValue = false,
  style,
}: StatTileProps) {
  const { colors, typography, radii, spacing } = useTheme();

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
        {label.toUpperCase()}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={[
            typography.metricMedium,
            { color: isAccentValue ? colors.accent : colors.textPrimary },
          ]}
        >
          {value}
        </Text>
        {unit && (
          <Text style={[typography.bodyBold, { color: colors.textSecondary, marginLeft: 4 }]}>
            {unit}
          </Text>
        )}
      </View>
      {subtitle && (
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
});
