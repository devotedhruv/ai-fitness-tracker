import { Platform, TextStyle } from 'react-native';

export const FONT_FAMILY = {
  regular: (Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'PlusJakartaSans-Regular',
  }) || 'PlusJakartaSans-Regular') as string,
  medium: (Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'PlusJakartaSans-Medium',
  }) || 'PlusJakartaSans-Medium') as string,
  semiBold: (Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'PlusJakartaSans-SemiBold',
  }) || 'PlusJakartaSans-SemiBold') as string,
  bold: (Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'PlusJakartaSans-Bold',
  }) || 'PlusJakartaSans-Bold') as string,
  extraBold: (Platform.select({
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'PlusJakartaSans-ExtraBold',
  }) || 'PlusJakartaSans-ExtraBold') as string,
};

export const defaultFontFamily = FONT_FAMILY.regular;

export const typography = {
  // Display
  displayHuge: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    letterSpacing: -1,
  } as TextStyle,
  display: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,

  // Headings
  heading1: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  } as TextStyle,
  heading2: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TextStyle,
  heading3: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,

  // Body Text
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  } as TextStyle,
  bodyBold: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,
  bodySmallBold: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  } as TextStyle,

  // Captions & Labels
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TextStyle,
  captionBold: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  } as TextStyle,
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,

  // Buttons
  button: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  } as TextStyle,
  buttonSmall: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  } as TextStyle,

  // Fitness Statistics (Visually prominent numbers)
  statisticsHuge: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  } as TextStyle,
  statistics: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  } as TextStyle,
  statisticsMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  statisticsSmall: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  // Backward-compatible aliases
  headingLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TextStyle,
  headingMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.2,
  } as TextStyle,
  headingSmall: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,
  metric: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  metricMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  statLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  } as TextStyle,
};
