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
import { authApi, getApiBaseUrl, setCustomApiUrl, testApiConnection } from '../../src/services/api';
import { useAuthStore, DEFAULT_USER } from '../../src/stores/authStore';
import { AppLogo } from '../../src/components/ui/AppLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  // Server Diagnostics & Config
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await testApiConnection(serverUrl);
      if (res.ok) {
        setConnectionStatus('✅ Server Connected (200 OK)');
      } else {
        setConnectionStatus(`❌ Connection Failed: ${res.error || 'Unreachable'}`);
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleApplyServerUrl = () => {
    setCustomApiUrl(serverUrl);
    setConnectionStatus('✅ Saved API URL');
    setError(null);
    setIsNetworkError(false);
  };

  const handleDirectDemoMode = () => {
    setSession(DEFAULT_USER, {
      accessToken: 'demo-local-access-token',
      refreshToken: 'demo-local-refresh-token',
      expiresIn: 86400,
    });
    router.replace('/(tabs)/today');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide your email and password');
      setIsNetworkError(false);
      return;
    }

    setError(null);
    setIsNetworkError(false);
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
      const msg = err.message || 'Login failed';
      setError(msg);
      if (
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('failed')
      ) {
        setIsNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFillAndLogin = async () => {
    setEmail('demo@fittrack.app');
    setPassword('Password123!');
    setError(null);
    setIsNetworkError(false);
    setLoading(true);

    try {
      const data = await authApi.login({ email: 'demo@fittrack.app', password: 'Password123!' });
      setSession(data.user, data.tokens);
      router.replace('/(tabs)/today');
    } catch {
      // Graceful offline fallback: if server is unreachable, immediately enter demo session
      handleDirectDemoMode();
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
                {isNetworkError && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
                      Cannot reach server at {getApiBaseUrl()}. Make sure your backend is running (`runserver 0.0.0.0:4000`) and phone is on the same Wi-Fi.
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <Button
                        title="Enter in Offline Demo Mode"
                        onPress={handleDirectDemoMode}
                        variant="primary"
                        size="small"
                      />
                      <Button
                        title="Edit Server IP"
                        onPress={() => setShowServerConfig(true)}
                        variant="secondary"
                        size="small"
                      />
                    </View>
                  </View>
                )}
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
                setIsNetworkError(false);
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
                setIsNetworkError(false);
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

            <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
              <Button
                title="Quick Demo Login (Auto-Fallback)"
                onPress={handleDemoFillAndLogin}
                variant="secondary"
                size="small"
                leftIcon={<Icon name="today" size={15} color={colors.textPrimary} />}
              />
              <Button
                title="Explore in Demo Mode (Offline)"
                onPress={handleDirectDemoMode}
                variant="ghost"
                size="small"
                leftIcon={<Icon name="dumbbell" size={15} color={colors.accent} />}
              />
            </View>
          </Card>

          {/* Server Connection Config Collapsible */}
          <View style={{ marginBottom: spacing.md }}>
            <Button
              title={showServerConfig ? 'Hide Server Configuration' : 'Server Connection Settings'}
              onPress={() => setShowServerConfig(!showServerConfig)}
              variant="ghost"
              size="small"
              leftIcon={<Icon name="gear" size={14} color={colors.textSecondary} />}
            />
            {showServerConfig && (
              <Card style={{ marginTop: 8, padding: spacing.md }}>
                <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: 4 }]}>
                  BACKEND API URL
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Default: Public Cloudflare HTTPS Tunnel or host LAN IP.
                </Text>
                <Input
                  label="API BASE URL"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  placeholder="https://ai-fitness-tracker-erqp.onrender.com/api/v1"
                />
                {connectionStatus && (
                  <Text style={[typography.caption, { color: colors.accent, marginVertical: 4 }]}>
                    {connectionStatus}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Button
                    title="Test Connection"
                    onPress={handleTestConnection}
                    loading={testingConnection}
                    variant="secondary"
                    size="small"
                  />
                  <Button
                    title="Apply URL"
                    onPress={handleApplyServerUrl}
                    variant="primary"
                    size="small"
                  />
                </View>
              </Card>
            )}
          </View>

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
