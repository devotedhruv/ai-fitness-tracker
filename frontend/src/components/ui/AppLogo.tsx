import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme';

export interface AppLogoProps {
  variant?: 'full' | 'mark';
  size?: 'compact' | 'small' | 'medium' | 'large';
  showTagline?: boolean;
  showDivider?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppLogo({
  variant = 'full',
  size = 'medium',
  showTagline = true,
  showDivider = true,
  onPress,
  style,
}: AppLogoProps) {
  const { colors, typography } = useTheme();

  // Scale configurations
  const scale = {
    compact: { fontSize: 16, letterSpacing: 1.2, taglineSize: 8, markSize: 24, markFont: 14 },
    small: { fontSize: 18, letterSpacing: 1.3, taglineSize: 9, markSize: 28, markFont: 16 },
    medium: { fontSize: 21, letterSpacing: 1.6, taglineSize: 10, markSize: 32, markFont: 18 },
    large: { fontSize: 36, letterSpacing: 2.2, taglineSize: 13, markSize: 52, markFont: 28 },
  }[size];

  // Compact / Mark variant for tight spaces (e.g. AI HUDs, small sub-headers)
  if (variant === 'mark') {
    const markContent = (
      <View
        style={[
          styles.markBadge,
          {
            width: scale.markSize,
            height: scale.markSize,
            borderRadius: scale.markSize * 0.28,
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <Text style={[styles.markLetter, { fontSize: scale.markFont * 0.85, color: colors.textPrimary }]}>
          AI
        </Text>
        <View style={[styles.markAccentDot, { backgroundColor: colors.accent }]} />
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityLabel="AI Fitness Tracker Home">
          {markContent}
        </TouchableOpacity>
      );
    }
    return markContent;
  }

  // Full Wordmark variant: AI FITNESS TRACKER
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        <Text
          style={[
            styles.brandText,
            {
              fontSize: scale.fontSize,
              letterSpacing: scale.letterSpacing,
              color: colors.textPrimary,
            },
          ]}
        >
          AI <Text style={{ color: colors.accent }}>FITNESS</Text> TRACKER
        </Text>
        {showDivider && (
          <Text
            style={[
              styles.dividerBar,
              {
                fontSize: scale.fontSize,
                color: colors.accent,
                marginHorizontal: size === 'large' ? 8 : 5,
              },
            ]}
          >
            |
          </Text>
        )}
      </View>

      {showTagline && size !== 'compact' && (
        <Text
          style={[
            styles.tagline,
            {
              fontSize: scale.taglineSize,
              color: colors.textSecondary,
              marginTop: size === 'large' ? 4 : 1,
            },
          ]}
        >
          Build. Move. Become.
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityLabel="AI Fitness Tracker Home">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '900',
    fontFamily: typography.display.fontFamily,
  },
  dividerBar: {
    fontWeight: '300',
    opacity: 0.85,
  },
  tagline: {
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  markBadge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  markLetter: {
    fontWeight: '900',
  },
  markAccentDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
