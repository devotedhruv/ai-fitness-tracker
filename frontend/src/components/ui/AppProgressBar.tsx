import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';
import { AppGradient } from './AppGradient';

export type AppProgressTone = 'primary' | 'gradient' | 'orange' | 'gold' | 'success' | 'warning' | 'error' | 'info';

export interface AppProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  height?: number;
  /** Semantic tone. Default `primary` (saffron). `gradient` = brand gradient. */
  tone?: AppProgressTone;
  /** Escape hatch for a custom token color (prefer `tone`). */
  color?: string;
  trackColor?: string;
  showPercentage?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

function normalize(progress: number) {
  return progress > 1 ? Math.min(100, Math.max(0, progress)) : Math.min(100, Math.max(0, progress * 100));
}

export function AppProgressBar({
  progress,
  height = 8,
  tone = 'primary',
  color,
  trackColor,
  showPercentage = false,
  label,
  style,
}: AppProgressBarProps) {
  const { colors, typography, radius } = useTheme();
  const normalized = normalize(progress);

  const toneColor: Record<Exclude<AppProgressTone, 'gradient'>, string> = {
    primary: colors.primary,
    orange: colors.orange,
    gold: colors.gold,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  };
  const fillColor = color ?? (tone === 'gradient' ? colors.primary : toneColor[tone]);

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(normalized) }}
    >
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>{label}</Text>
          ) : (
            <View />
          )}
          {showPercentage && (
            <Text style={[typography.captionBold, { color: colors.accentText }]}>{Math.round(normalized)}%</Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.track,
          { height, backgroundColor: trackColor ?? colors.surfacePressed, borderRadius: radius.full },
        ]}
      >
        {tone === 'gradient' && !color ? (
          <AppGradient style={{ width: `${normalized}%`, height: '100%' }} borderRadius={radius.full} />
        ) : (
          <View
            style={{
              width: `${normalized}%`,
              height: '100%',
              backgroundColor: fillColor,
              borderRadius: radius.full,
            }}
          />
        )}
      </View>
    </View>
  );
}

export interface AppProgressRingProps {
  /** 0–1 or 0–100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  tone?: AppProgressTone;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Circular progress; `tone="gradient"` renders the brand gradient stroke (AI score, completion). */
export function AppProgressRing({
  progress,
  size = 96,
  strokeWidth = 8,
  tone = 'gradient',
  children,
  style,
}: AppProgressRingProps) {
  const { colors } = useTheme();
  const normalized = normalize(progress);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (normalized / 100) * c;

  const solid: Record<Exclude<AppProgressTone, 'gradient'>, string> = {
    primary: colors.primary,
    orange: colors.orange,
    gold: colors.gold,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  };
  const gradientId = 'ringGradient';
  const stroke = tone === 'gradient' ? `url(#${gradientId})` : solid[tone];

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.gradientStart} />
            <Stop offset="1" stopColor={colors.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfacePressed} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

export { AppProgressBar as AppProgress };

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
