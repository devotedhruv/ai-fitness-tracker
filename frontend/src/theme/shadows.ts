import { ViewStyle, Platform } from 'react-native';

type ShadowSet = {
  none: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  accentGlow: ViewStyle;
};

function build(shadowRgb: string, opacity: { sm: number; md: number; lg: number }, glowRgb: string, glowOpacity: number): ShadowSet {
  return {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    } as ViewStyle,

    sm: Platform.select({
      web: { boxShadow: `0 1px 3px rgba(${shadowRgb}, ${opacity.sm})` } as any,
      default: {
        shadowColor: `rgb(${shadowRgb})`,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: opacity.sm,
        shadowRadius: 3,
        elevation: 1,
      },
    }) as ViewStyle,

    md: Platform.select({
      web: { boxShadow: `0 4px 12px rgba(${shadowRgb}, ${opacity.md})` } as any,
      default: {
        shadowColor: `rgb(${shadowRgb})`,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: opacity.md,
        shadowRadius: 8,
        elevation: 3,
      },
    }) as ViewStyle,

    lg: Platform.select({
      web: { boxShadow: `0 8px 24px rgba(${shadowRgb}, ${opacity.lg})` } as any,
      default: {
        shadowColor: `rgb(${shadowRgb})`,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: opacity.lg,
        shadowRadius: 16,
        elevation: 6,
      },
    }) as ViewStyle,

    accentGlow: Platform.select({
      web: { boxShadow: `0 0 16px rgba(${glowRgb}, ${glowOpacity})` } as any,
      default: {
        shadowColor: `rgb(${glowRgb})`,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: glowOpacity,
        shadowRadius: 10,
        elevation: 4,
      },
    }) as ViewStyle,
  };
}

/** Dark mode: depth comes from surfaces + borders, shadows stay quiet with Electric Lime accent glow. */
export const darkShadows: ShadowSet = build('0, 0, 0', { sm: 0.3, md: 0.4, lg: 0.55 }, '184, 245, 0', 0.2);

/** Light mode: very subtle shadows with lime accent glow. */
export const lightShadows: ShadowSet = build('0, 0, 0', { sm: 0.04, md: 0.07, lg: 0.1 }, '120, 168, 0', 0.15);

/** Default export kept for legacy imports (dark). Prefer `useTheme().shadows`. */
export const shadows = darkShadows;

export type Shadows = ShadowSet;
