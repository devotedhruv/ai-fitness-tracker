import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { authApi } from '../../src/services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Don't reveal account status
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, padding: spacing.xl }]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
          Reset Password
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Enter your email address and we will dispatch recovery instructions.
        </Text>

        <Card>
          {submitted ? (
            <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
              <Icon name="mail" size={44} color={colors.accent} style={{ marginBottom: 12 }} />
              <Text style={[typography.headingSmall, { color: colors.textPrimary, textAlign: 'center' }]}>
                Check your inbox
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 16 },
                ]}
              >
                If an account exists for {email}, a recovery link has been sent.
              </Text>
              <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} variant="secondary" />
            </View>
          ) : (
            <>
              <Input
                label="EMAIL"
                placeholder="athlete@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <View style={{ marginTop: spacing.md }}>
                <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
              </View>
            </>
          )}
        </Card>

        {!submitted && (
          <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            <Button title="Back to Login" onPress={() => router.back()} variant="ghost" size="small" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
