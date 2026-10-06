import React from 'react';
import { AppEmptyState, AppEmptyStateProps } from './ui/AppEmptyState';
import { IconName } from './Icon';

export interface EmptyStateProps extends Omit<AppEmptyStateProps, 'icon'> {
  iconName?: IconName;
}

export function EmptyState({ iconName, ...props }: EmptyStateProps) {
  return <AppEmptyState icon={iconName} {...props} />;
}
