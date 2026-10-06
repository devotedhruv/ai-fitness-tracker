import React, { ReactNode, useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  PressableProps,
} from 'react-native';
import { useTheme } from '../../theme';
import { staticColors } from '../../theme/staticColors';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

export interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(
  Pressable as React.ComponentType<PressableProps>
);

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  style,
}: AppButtonProps) {
  const { colors, typography, radius, animation } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = React.useState(false);
  const inactive = disabled || loading;

  const animateTo = (toValue: number) =>
    Animated.timing(scale, {
      toValue,
      duration: animation.duration.instant,
      useNativeDriver: true,
    }).start();

  let backgroundColor: string = colors.primary;
  let borderColor: string = 'transparent';
  let borderWidth = 0;
  let textColor: string = colors.onPrimary;

  switch (variant) {
    case 'primary':
      backgroundColor = pressed ? colors.primaryPressed : colors.primary;
      textColor = colors.onPrimary;
      break;
    case 'secondary':
      backgroundColor = pressed ? colors.surfacePressed : colors.surfaceElevated;
      borderColor = colors.border;
      borderWidth = 1;
      textColor = colors.textPrimary;
      break;
    case 'outline':
      backgroundColor = pressed ? colors.accentMuted : 'transparent';
      borderColor = colors.primary;
      borderWidth = 1.5;
      textColor = colors.accentText;
      break;
    case 'ghost':
      backgroundColor = pressed ? colors.surfacePressed : 'transparent';
      textColor = colors.textPrimary;
      break;
    case 'danger':
      backgroundColor = pressed ? colors.errorMuted : colors.error;
      textColor = staticColors.white;
      if (pressed) textColor = colors.error;
      break;
  }

  if (disabled) {
    backgroundColor = variant === 'ghost' || variant === 'outline' ? 'transparent' : colors.disabledBackground;
    borderColor = variant === 'outline' ? colors.border : borderColor;
    textColor = colors.disabledText;
  }

  const sizeStyles = { small: styles.small, medium: styles.medium, large: styles.large }[size];
  const indicatorColor = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? staticColors.white : colors.accentText;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={inactive}
      onPressIn={() => {
        setPressed(true);
        animateTo(animation.pressScale.button);
      }}
      onPressOut={() => {
        setPressed(false);
        animateTo(1);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.base,
        sizeStyles,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: radius.md,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          transform: [{ scale }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            style={[size === 'small' ? typography.buttonSmall : typography.button, { color: textColor }]}
            numberOfLines={1}
            allowFontScaling
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

/* ---- Named button components (thin, semantic wrappers over AppButton) ---- */
type ButtonShortcutProps = Omit<AppButtonProps, 'variant'>;

export const PrimaryButton = (props: ButtonShortcutProps) => <AppButton {...props} variant="primary" />;
export const SecondaryButton = (props: ButtonShortcutProps) => <AppButton {...props} variant="secondary" />;
export const OutlineButton = (props: ButtonShortcutProps) => <AppButton {...props} variant="outline" />;
export const TextButton = (props: ButtonShortcutProps) => <AppButton {...props} variant="ghost" />;
export const DangerButton = (props: ButtonShortcutProps) => <AppButton {...props} variant="danger" />;

export interface IconButtonProps {
  icon: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: 'filled' | 'tonal' | 'ghost';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'tonal',
  size = 40,
  disabled = false,
  style,
}: IconButtonProps) {
  const { colors, radius, animation } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: animation.duration.instant, useNativeDriver: true }).start();

  const backgroundColor =
    variant === 'filled' ? colors.primary : variant === 'tonal' ? colors.surfaceElevated : 'transparent';

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(animation.pressScale.icon)}
      onPressOut={() => animateTo(1)}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: variant === 'tonal' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale }],
        },
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  large: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  medium: {
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  small: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 5,
  },
});
