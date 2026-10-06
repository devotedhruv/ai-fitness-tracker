import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Chip } from '../../src/components/Chip';
import { Icon } from '../../src/components/Icon';
import { Avatar, AVATAR_PRESETS } from '../../src/components/Avatar';
import { useAuthStore, UserProfile } from '../../src/stores/authStore';
import { usersApi } from '../../src/services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, typography, spacing, isDark } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<any>(null);

  const currentProfile = user?.profile;

  const [displayName, setDisplayName] = useState(
    currentProfile?.displayName || (user as any)?.displayName || 'Demo Athlete'
  );
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || 'preset:athlete');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>(
    currentProfile?.experienceLevel || 'INTERMEDIATE'
  );

  React.useEffect(() => {
    if (user?.profile) {
      if (user.profile.displayName && displayName === 'Demo Athlete') {
        setDisplayName(user.profile.displayName);
      }
      if (user.profile.username && !username) {
        setUsername(user.profile.username);
      }
      if (user.profile.avatarUrl && avatarUrl === 'preset:athlete') {
        setAvatarUrl(user.profile.avatarUrl);
      }
      if (user.profile.bio && !bio) {
        setBio(user.profile.bio);
      }
      if (user.profile.experienceLevel) {
        setExperienceLevel(user.profile.experienceLevel);
      }
    }
  }, [user]);

  const [isCustomUrlMode, setIsCustomUrlMode] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePickPreset = (emoji: string) => {
    setAvatarUrl(emoji);
    setIsCustomUrlMode(false);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setIsCustomUrlMode(false);
      setCustomUrlInput('');
    }
  };

  const handleFileUpload = (e: any) => {
    if (Platform.OS === 'web' && e.target?.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setErrorMessage(null);

    // Validate username if provided
    let cleanUsername: string | null = username.trim().toLowerCase();
    if (cleanUsername) {
      cleanUsername = cleanUsername.replace(/^@/, '');
      const valid = /^[a-z0-9_.-]{3,30}$/.test(cleanUsername);
      if (!valid) {
        setErrorMessage('Username must be 3-30 characters (lowercase letters, numbers, underscores, dashes, dots).');
        return;
      }
    } else {
      cleanUsername = null;
    }

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<UserProfile> = {
        displayName: displayName.trim(),
        username: cleanUsername || undefined,
        avatarUrl,
        bio: bio.trim(),
        experienceLevel,
      };

      // 1. Immediately update persistent local store so edits are never lost
      updateProfile(payload);

      // 2. Sync with backend API
      try {
        const updated = await usersApi.updateMe(payload);
        if (updated) {
          updateProfile({
            displayName: updated.displayName || payload.displayName,
            username: updated.username ?? payload.username,
            avatarUrl: updated.avatarUrl ?? payload.avatarUrl,
            bio: updated.bio ?? payload.bio,
            experienceLevel: updated.experienceLevel ?? payload.experienceLevel,
          });
        }
      } catch (apiErr: any) {
        console.warn('Backend sync failed, edits saved locally in auth store:', apiErr);
      }

      if (Platform.OS === 'web') {
        alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }
      router.back();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const detail = err.details?.username?.[0] || err.message || 'Failed to update profile.';
      setErrorMessage(detail);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
            Edit Profile
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: '#FF3B3020', borderColor: '#FF3B30', flexDirection: 'row', alignItems: 'center' }]}>
              <Icon name="alert" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '700', flex: 1 }}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Avatar Section */}
          <Card style={{ alignItems: 'center', marginBottom: spacing.md, paddingVertical: 20 }}>
            <Avatar uri={avatarUrl} size={76} />
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 10 }]}>
              PROFILE PICTURE / AVATAR
            </Text>

            {/* Preset Avatars Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetRow}
            >
              {AVATAR_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetItem,
                    {
                      borderColor: avatarUrl === preset.id ? colors.accent : colors.border,
                      backgroundColor:
                        avatarUrl === preset.id
                          ? isDark
                            ? 'rgba(184, 245, 0, 0.2)'
                            : 'rgba(120, 168, 0, 0.15)'
                          : colors.surface,
                    },
                  ]}
                  onPress={() => handlePickPreset(preset.id)}
                >
                  <Icon
                    name={preset.icon}
                    size={22}
                    color={avatarUrl === preset.id ? colors.accent : colors.textPrimary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom URL or Upload option */}
            <View style={styles.avatarActionRow}>
              {Platform.OS === 'web' && (
                <>
                  <input
                    ref={fileInputRef as any}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <Button
                    title="Upload Photo"
                    variant="secondary"
                    size="small"
                    leftIcon={<Icon name="upload" size={14} color={colors.textPrimary} />}
                    onPress={() => fileInputRef.current?.click()}
                  />
                </>
              )}

              <Button
                title={isCustomUrlMode ? 'Cancel URL' : 'Image URL'}
                variant="secondary"
                size="small"
                leftIcon={<Icon name="link" size={14} color={colors.textPrimary} />}
                onPress={() => setIsCustomUrlMode(!isCustomUrlMode)}
              />
            </View>

            {isCustomUrlMode && (
              <View style={styles.customUrlRow}>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={customUrlInput}
                  onChangeText={setCustomUrlInput}
                  autoCapitalize="none"
                  containerStyle={{ flex: 1 }}
                />
                <Button
                  title="Apply"
                  variant="primary"
                  size="small"
                  onPress={handleApplyCustomUrl}
                  style={{ marginLeft: 8, height: 48, alignSelf: 'flex-end', marginBottom: 6 }}
                />
              </View>
            )}
          </Card>

          {/* Identity Information */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
              IDENTITY & USERNAME
            </Text>

            <Input
              label="Full Name / Display Name"
              placeholder="e.g. Alex Hunter"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />

            <Input
              label="Username"
              placeholder="e.g. alex_lifts"
              value={username}
              onChangeText={(val) => setUsername(val.toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              helperText="Unique athlete handle across leaderboards and feeds (e.g. @username)"
            />

            <View style={{ marginTop: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 6 }]}>
                  Athlete Bio
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {bio.length}/280
                </Text>
              </View>
              <Input
                placeholder="e.g. Hybrid athlete | Road to 500lb deadlift & sub-20 5k"
                value={bio}
                onChangeText={setBio}
                maxLength={280}
                multiline
                numberOfLines={3}
                style={{ height: 75, textAlignVertical: 'top' }}
              />
            </View>

            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 12, marginBottom: 8 }]}>
              EXPERIENCE LEVEL
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={experienceLevel === level}
                  onPress={() => setExperienceLevel(level)}
                />
              ))}
            </View>
          </Card>

          {/* Action Buttons */}
          <Button
            title={isSaving ? 'SAVING CHANGES...' : 'SAVE PROFILE'}
            onPress={handleSave}
            variant="primary"
            disabled={isSaving}
          />

          <View style={{ height: 10 }} />

          <Button
            title="CANCEL"
            onPress={() => router.back()}
            variant="ghost"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 44,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
  },
  presetItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetEmoji: {
    fontSize: 22,
  },
  avatarActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  customUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
});
