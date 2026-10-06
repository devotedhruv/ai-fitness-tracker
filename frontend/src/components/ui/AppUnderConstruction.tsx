import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { AppButton } from './AppButton';
import { AppHeader } from './AppHeader';
import { AppCard } from './AppCard';
import { Icon, IconName } from '../Icon';

export interface AppUnderConstructionProps {
  title?: string;
  featureName?: string;
  description?: string;
  icon?: IconName;
  showHeader?: boolean;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppUnderConstruction({
  title = 'Under Construction',
  featureName = 'This feature',
  description = "We're still improving this feature.\nThis functionality will be available in a future update.",
  icon = 'gear',
  showHeader = true,
  onBack,
  style,
}: AppUnderConstructionProps) {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/today');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {showHeader && (
        <AppHeader
          title={title}
          showBack={true}
          onBack={handleBack}
          showLogo={true}
        />
      )}

      <View style={[styles.content, style]}>
        <AppCard variant="default" style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Text style={styles.emoji}>🚧</Text>
          </View>

          <Text style={[typography.headingLarge, { color: colors.textPrimary, textAlign: 'center', marginTop: 16 }]}>
            {title}
          </Text>

          {featureName && (
            <Text style={[typography.captionBold, { color: colors.accent, textAlign: 'center', marginTop: 6, letterSpacing: 1 }]}>
              {featureName.toUpperCase()}
            </Text>
          )}

          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, maxWidth: 300 },
            ]}
          >
            {description}
          </Text>

          <View style={styles.actions}>
            <AppButton
              title="Return to Home"
              variant="primary"
              size="medium"
              leftIcon={<Icon name="arrow-left" size={16} color={colors.onPrimary} />}
              onPress={handleBack}
              fullWidth
            />
          </View>
        </AppCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  actions: {
    width: '100%',
    marginTop: 24,
  },
});
