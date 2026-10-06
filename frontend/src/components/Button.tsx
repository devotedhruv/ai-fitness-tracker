import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AppButton } from './ui/AppButton';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  return (
    <AppButton
      title={title}
      onPress={onPress}
      variant={variant}
      size={size === 'small' ? 'small' : 'medium'}
      disabled={disabled}
      loading={loading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      style={style}
    />
  );
}
