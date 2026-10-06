import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon, IconName } from '../Icon';
import { AppButton } from './AppButton';

export interface AppEmptyStateProps {
  icon?: IconName;
  customIcon?: ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppEmptyState({
  icon = 'dumbbell',
  customIcon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}: AppEmptyStateProps) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        {customIcon ? (
          customIcon
        ) : (
          <Icon name={icon} size={32} color={colors.accent} />
        )}
      </View>

      <Text style={[typography.headingMedium, { color: colors.textPrimary, textAlign: 'center', marginTop: 16 }]}>
        {title}
      </Text>

      {description && (
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 300, lineHeight: 22 },
          ]}
        >
          {description}
        </Text>
      )}

      {actionTitle && onAction && (
        <View style={{ marginTop: 20 }}>
          <AppButton
            title={actionTitle}
            onPress={onAction}
            size="small"
            variant="primary"
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
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
