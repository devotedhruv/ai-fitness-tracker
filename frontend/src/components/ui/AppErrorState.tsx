import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';
import { AppButton } from './AppButton';

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: AppErrorStateProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.errorMuted, borderColor: colors.error },
        ]}
      >
        <Icon name="x" size={28} color={colors.error} />
      </View>

      <Text style={[typography.headingMedium, { color: colors.textPrimary, textAlign: 'center', marginTop: 16 }]}>
        {title}
      </Text>

      {message && (
        <Text
          style={[
            typography.bodySmall,
            { color: colors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 300 },
          ]}
        >
          {message}
        </Text>
      )}

      {onRetry && (
        <View style={{ marginTop: 20 }}>
          <AppButton
            title="Try Again"
            onPress={onRetry}
            size="small"
            variant="secondary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
