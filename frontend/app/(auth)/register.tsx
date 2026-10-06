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
import { authApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { AppLogo } from '../../src/components/ui/AppLogo';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      setError('Please fill out all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await authApi.register({
        email,
        password,
        displayName,
      });
      setSession(data.user, data.tokens);
      router.replace('/(auth)/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
          <View style={styles.header}>
            <AppLogo size="large" showTagline style={{ marginBottom: 16 }} />
            <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
              Create your account
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
              Start tracking gym, calisthenics, and outdoor runs
            </Text>
          </View>

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
              label="DISPLAY NAME"
              placeholder="Alex Runner"
              value={displayName}
              onChangeText={(t) => {
                setDisplayName(t);
                setError(null);
              }}
            />

            <Input
              label="EMAIL"
              placeholder="alex@example.com"
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
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
            />

            <Input
              label="CONFIRM PASSWORD"
              placeholder="Repeat your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setError(null);
              }}
            />

            <View style={{ marginTop: spacing.md }}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                variant="primary"
              />
            </View>
          </Card>

          <View style={styles.footerLinks}>
            <View style={styles.signinPrompt}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Button
                title="Log In"
                onPress={() => router.push('/(auth)/login')}
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
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 8 },
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
  footerLinks: { alignItems: 'center', marginTop: 8 },
  signinPrompt: { flexDirection: 'row', alignItems: 'center' },
});
