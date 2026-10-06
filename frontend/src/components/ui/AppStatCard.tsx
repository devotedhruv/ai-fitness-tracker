import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../theme';

export interface AppStatCardProps {
  value: string | number;
  label: string;
  unit?: string;
  subtitle?: string;
  trend?: { value: string; isPositive?: boolean };
  icon?: ReactNode;
  highlight?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppStatCard({
  value,
  label,
  unit,
  subtitle,
  trend,
  icon,
  highlight = true,
  size = 'medium',
  onPress,
  style,
}: AppStatCardProps) {
  const { colors, typography, radius } = useTheme();

  const valueStyle = {
    small: typography.statisticsSmall,
    medium: typography.statistics,
    large: typography.statisticsHuge,
  }[size];

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: highlight ? colors.border : colors.divider,
          borderRadius: radius.lg,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[typography.label, { color: colors.textSecondary }]}>{label}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <View style={styles.metricRow}>
        <Text
          style={[
            valueStyle,
            { color: highlight ? colors.accentText : colors.textPrimary },
          ]}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={[
              typography.headingSmall,
              { color: colors.textSecondary, marginLeft: 6, marginBottom: 4 },
            ]}
          >
            {unit}
          </Text>
        )}
      </View>

      {(subtitle || trend) && (
        <View style={styles.footerRow}>
          {trend && (
            <Text
              style={[
                typography.captionBold,
                {
                  color: trend.isPositive ? colors.success : colors.error,
                  marginRight: 6,
                },
              ]}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </Text>
          )}
          {subtitle && (
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, flex: 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    flex: 1,
    minWidth: 130,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconContainer: {
    opacity: 0.85,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
});

export { AppStatCard as AppStat };
