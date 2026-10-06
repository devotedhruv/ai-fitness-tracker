import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../tokens/ThemeContext';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';

export interface StateViewProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function StateView({
  loading,
  error,
  empty,
  emptyTitle = 'No data found',
  emptyDescription = 'There is nothing here yet.',
  onRetry,
  children,
}: StateViewProps) {
  const { colors, typography, spacing } = useTheme();

  if (loading) {
    return (
      <View style={[styles.centered, { padding: spacing.xxl }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { padding: spacing.xxl }]}>
        <Icon name="alert" size={44} color={colors.error} style={{ marginBottom: 12 }} />
        <Text style={[typography.headingSmall, { color: colors.error, textAlign: 'center' }]}>
          {error}
        </Text>
        {onRetry && (
          <View style={{ marginTop: 16 }}>
            <Button title="Try Again" onPress={onRetry} size="small" variant="secondary" />
          </View>
        )}
      </View>
    );
  }

  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});
