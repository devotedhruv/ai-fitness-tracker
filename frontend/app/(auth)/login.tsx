import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { authApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { AppLogo } from '../../src/components/ui/AppLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setSession(data.user, data.tokens);

      if (!data.user.profile?.fitnessGoal) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)/today');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@fittrack.app');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <AppLogo size="large" showTagline style={{ marginBottom: 16 }} />
            <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
              Welcome back
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
              Sign in to resume your training streak
            </Text>
          </View>

          {/* Form */}
          <Card style={{ marginVertical: spacing.lg }}>
            {error && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: colors.error },
                ]}
              >
                <Text style={[typography.captionBold, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <Input
              label="EMAIL"
              placeholder="athlete@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
            />

            <Input
              label="PASSWORD"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
            />

            <View style={{ marginTop: spacing.md }}>
              <Button
                title="Log In"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
              />
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Button
                title="Quick Demo Login"
                onPress={handleDemoFill}
                variant="secondary"
                size="small"
                leftIcon={<Icon name="today" size={15} color={colors.textPrimary} />}
              />
            </View>
          </Card>

          {/* Navigation Links */}
          <View style={styles.footerLinks}>
            <Button
              title="Forgot Password?"
              onPress={() => router.push('/(auth)/forgot-password')}
              variant="ghost"
              size="small"
            />
            <View style={styles.signupPrompt}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <Button
                title="Sign Up"
                onPress={() => router.push('/(auth)/register')}
                variant="ghost"
                size="small"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  footerLinks: {
    alignItems: 'center',
    marginTop: 8,
  },
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
});
