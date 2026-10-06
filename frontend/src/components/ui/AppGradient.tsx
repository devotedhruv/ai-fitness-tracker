import React, { ReactNode, useId } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../theme';

export interface AppGradientProps {
  children?: ReactNode;
  /** Gradient endpoints; defaults to the official brand gradient (orange → gold). */
  colors?: [string, string];
  /** `horizontal` (left→right, default) or `vertical` (top→bottom) or `diagonal`. */
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The one official BALYRA gradient (#FF8A1F → #FFD166).
 * Use sparingly: AI score, progress, PRs, achievements, streaks, featured cards.
 * Implemented with react-native-svg so it works on iOS, Android and web.
 */
export function AppGradient({ children, colors, direction = 'horizontal', borderRadius = 0, style }: AppGradientProps) {
  const theme = useTheme();
  const start = colors?.[0] ?? theme.colors.gradientStart;
  const end = colors?.[1] ?? theme.colors.gradientEnd;
  const rawId = useId();
  const id = `bg${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const coords =
    direction === 'vertical'
      ? { x1: '0', y1: '0', x2: '0', y2: '1' }
      : direction === 'diagonal'
      ? { x1: '0', y1: '0', x2: '1', y2: '1' }
      : { x1: '0', y1: '0', x2: '1', y2: '0' };

  return (
    <View style={[{ overflow: 'hidden', borderRadius }, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} {...coords}>
            <Stop offset="0" stopColor={start} />
            <Stop offset="1" stopColor={end} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
