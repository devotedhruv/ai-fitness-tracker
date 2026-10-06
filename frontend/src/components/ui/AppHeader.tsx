import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { AppLogo, AppLogoProps } from './AppLogo';
import { Icon } from '../Icon';

export interface AppHeaderProps {
  showLogo?: boolean;
  logoVariant?: 'full' | 'mark';
  logoSize?: AppLogoProps['size'];
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: ReactNode;
  tabs?: ReactNode;
  bordered?: boolean;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppHeader({
  showLogo = true,
  logoVariant = 'full',
  logoSize = 'medium',
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActions,
  tabs,
  bordered = true,
  transparent = false,
  style,
}: AppHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: transparent ? 'transparent' : colors.background,
          borderBottomColor: bordered ? colors.border : 'transparent',
          borderBottomWidth: bordered ? 1 : 0,
          paddingTop: Math.max(insets.top, 8),
        },
        style,
      ]}
    >
      <View style={styles.mainRow}>
        {/* Left Section: Back Button or Logo */}
        <View style={styles.leftCol}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
              onPress={onBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Back"
            >
              <Icon name="chevron-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          {showLogo && (
            <AppLogo
              variant={logoVariant}
              size={logoSize}
              showTagline={!title && logoVariant === 'full'}
            />
          )}

          {title && !showLogo && (
            <View style={styles.titleCol}>
              <Text
                style={[
                  typography.headingMedium,
                  { color: colors.textPrimary, letterSpacing: -0.2 },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Center Section: Optional Screen Title when Logo is present */}
        {title && showLogo && (
          <View style={styles.centerCol}>
            <Text
              style={[
                typography.headingSmall,
                { color: colors.textPrimary, letterSpacing: 0.5 },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right Section: Action Icons */}
        <View style={styles.rightCol}>
          {rightActions}
        </View>
      </View>

      {/* Optional Integrated Segmented Tabs */}
      {tabs && <View style={styles.tabsContainer}>{tabs}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    zIndex: 10,
  },
  mainRow: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  tabsContainer: {
    width: '100%',
  },
});
