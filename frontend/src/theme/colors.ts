/**
 * BALYRA color system — the single source of truth for every color in the app.
 * Screens/components must read colors from `useTheme().colors`; never hardcode.
 */

export interface ColorTokens {
  // Foundations
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  border: string;
  divider: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** @deprecated alias of `textMuted` */
  textTertiary: string;
  /** @deprecated alias of `textMuted` */
  mutedText: string;
  placeholder: string;

  // Brand
  primary: string;
  primaryPressed: string;
  orange: string;
  gold: string;
  /** Brand color as a *text/icon* color on `surface`/`background` (AA-safe in both modes). */
  accentText: string;
  /** Translucent brand tint for chips, selected rows, soft backgrounds. */
  accentMuted: string;
  /** Foreground color to place on top of `primary`. */
  onPrimary: string;
  /** Brand gradient endpoints (orange → gold). */
  gradientStart: string;
  gradientEnd: string;

  // Brand aliases (backwards compatible)
  accent: string;
  primaryAccent: string;
  accentPressed: string;
  accentBright: string;
  onAccent: string;
  softLime: string;

  // Semantic
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;

  // States & overlays
  disabledBackground: string;
  disabledText: string;
  focus: string;
  overlay: string;
  cardShadow: string;
}

export const BRAND_GRADIENT = ['#B8F500', '#8FC700'] as const;

export const darkModeColors: ColorTokens = {
  // Foundations
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  surface: '#121212',
  surfaceElevated: '#1A1A1A',
  surfacePressed: '#242424',
  border: '#262626',
  divider: '#1F1F1F',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
  textTertiary: '#737373',
  mutedText: '#737373',
  placeholder: '#525252',

  // Brand (Electric Lime)
  primary: '#B8F500',
  primaryPressed: '#8FC700',
  orange: '#FF8A1F',
  gold: '#D7FF66',
  accentText: '#B8F500',
  accentMuted: 'rgba(184, 245, 0, 0.15)',
  onPrimary: '#000000',
  gradientStart: '#B8F500',
  gradientEnd: '#8FC700',

  // Aliases
  accent: '#B8F500',
  primaryAccent: '#B8F500',
  accentPressed: '#8FC700',
  accentBright: '#B8F500',
  onAccent: '#000000',
  softLime: '#D7FF66',

  // Semantic
  success: '#35D07F',
  successMuted: 'rgba(53, 208, 127, 0.14)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.14)',
  error: '#FF4D4D',
  errorMuted: 'rgba(255, 77, 77, 0.14)',
  info: '#38BDF8',
  infoMuted: 'rgba(56, 189, 248, 0.14)',

  // States & overlays
  disabledBackground: '#262626',
  disabledText: '#666666',
  focus: '#B8F500',
  overlay: 'rgba(0, 0, 0, 0.75)',
  cardShadow: 'rgba(0, 0, 0, 0.8)',
};

export const lightModeColors: ColorTokens = {
  // Foundations
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  surfacePressed: '#EEEEEE',
  border: '#E5E5E5',
  divider: '#EBEBEB',

  // Typography
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#8E8E8E',
  textTertiary: '#8E8E8E',
  mutedText: '#8E8E8E',
  placeholder: '#A0A0A0',

  // Brand (Electric Lime adapted for light surfaces)
  primary: '#78A800',
  primaryPressed: '#628A00',
  orange: '#78A800',
  gold: '#B8F500',
  accentText: '#557A00',
  accentMuted: 'rgba(120, 168, 0, 0.12)',
  onPrimary: '#FFFFFF',
  gradientStart: '#78A800',
  gradientEnd: '#B8F500',

  // Aliases
  accent: '#78A800',
  primaryAccent: '#78A800',
  accentPressed: '#628A00',
  accentBright: '#B8F500',
  onAccent: '#FFFFFF',
  softLime: '#E9F7B8',

  // Semantic
  success: '#1FA463',
  successMuted: 'rgba(31, 164, 99, 0.12)',
  warning: '#D97706',
  warningMuted: 'rgba(217, 119, 6, 0.12)',
  error: '#DC2626',
  errorMuted: 'rgba(220, 38, 38, 0.1)',
  info: '#0284C7',
  infoMuted: 'rgba(2, 132, 199, 0.1)',

  // States & overlays
  disabledBackground: '#F0F0F0',
  disabledText: '#A8A8A8',
  focus: '#78A800',
  overlay: 'rgba(0, 0, 0, 0.40)',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
};
