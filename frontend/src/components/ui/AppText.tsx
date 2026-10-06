import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

export type AppTextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyBold'
  | 'bodySmall'
  | 'caption'
  | 'captionBold'
  | 'label'
  | 'stat'
  | 'statLarge';

export type AppTextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'gold'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'onPrimary';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

/**
 * Themed text. Hierarchy comes from weight/size; color comes from semantic `tone`
 * so text always has the right contrast in both themes.
 */
export function AppText({
  variant = 'body',
  tone = 'primary',
  align,
  style,
  allowFontScaling = true,
  maxFontSizeMultiplier = 1.4,
  ...rest
}: AppTextProps) {
  const { colors, typography } = useTheme();

  const variantStyle: Record<AppTextVariant, TextStyle> = {
    display: typography.display,
    h1: typography.heading1,
    h2: typography.heading2,
    h3: typography.heading3,
    body: typography.body,
    bodyBold: typography.bodyBold,
    bodySmall: typography.bodySmall,
    caption: typography.caption,
    captionBold: typography.captionBold,
    label: typography.label,
    stat: typography.statisticsMedium,
    statLarge: typography.statistics,
  };

  const toneColor: Record<AppTextTone, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.accentText,
    gold: colors.gold,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    onPrimary: colors.onPrimary,
  };

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[variantStyle[variant], { color: toneColor[tone] }, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
