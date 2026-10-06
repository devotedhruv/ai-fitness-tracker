import React, { ReactNode } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { AppCard } from './ui/AppCard';

export interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, elevated = false, onPress, style }: CardProps) {
  return (
    <AppCard
      variant={elevated ? 'elevated' : 'default'}
      onPress={onPress}
      style={style}
    >
      {children}
    </AppCard>
  );
}
