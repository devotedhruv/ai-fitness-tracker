import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { AppHeader, AppBadge, AppButton } from '../../src/components/ui';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { Avatar } from '../../src/components/Avatar';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressionStore } from '../../src/stores/progressionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { ChangePasswordModal } from '../../src/components/profile/ChangePasswordModal';
import { usersApi } from '../../src/services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, typography, spacing, mode, setMode } = useTheme();
  const { user, logout, updateProfile } = useAuthStore();
  const progress = useProgressionStore((s) => s.progress);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    defaultRestSeconds,
    setDefaultRestSeconds,
    voiceCoachEnabled,
    setVoiceCoachEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    soundEffectsEnabled,
    setSoundEffectsEnabled,
    keepScreenAwake,
    setKeepScreenAwake,
  } = useSettingsStore();

  useEffect(() => {
    usersApi.getMe().then((res) => {
      if (res?.profile) {
        updateProfile(res.profile);
      }
    }).catch(() => {});
  }, []);

  const handleUnitToggle = async (newUnit: 'METRIC' | 'IMPERIAL') => {
    try {
      await usersApi.updateMe({ units: newUnit });
      updateProfile({ units: newUnit });
    } catch {
      updateProfile({ units: newUnit });
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleExportData = async () => {
    try {
      const data = await usersApi.exportData();
      Alert.alert(
        'Export Ready',
        `Exported profile, ${data.workouts?.length || 0} workouts, and ${data.runs?.length || 0} runs successfully.`
      );
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'Are you sure you want to permanently delete your account and all workout and run history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deleteMe();
              logout();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Global AppHeader with Brand Logo and Edit Profile action */}
      <AppHeader
        showLogo
        logoVariant="full"
        title="Profile"
        rightActions={
          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => router.push('/profile/edit')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Edit Profile"
          >
            <Icon name="edit" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
        {/* User Card */}
        <Card style={{ marginBottom: spacing.md, padding: 18 }}>
          <View style={styles.profileHeaderRow}>
            {/* Avatar */}
            <Avatar uri={user?.profile?.avatarUrl} size={64} />

            {/* Names & Handle */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]} numberOfLines={1}>
                {user?.profile?.displayName || 'Athlete'}
              </Text>
              <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: 1 }}>
                {user?.profile?.username ? `@${user.profile.username}` : '@athlete'}
              </Text>
              {user?.email && !user.email.includes('demo@') ? (
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={[
                styles.editPencilBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
              onPress={() => router.push('/profile/edit')}
              accessibilityLabel="Edit Profile"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="edit" size={13} color={colors.textPrimary} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '700' }}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Athlete Bio */}
          {user?.profile?.bio ? (
            <Text style={[typography.body, { color: colors.textPrimary, marginTop: 12, lineHeight: 20 }]}>
              {user.profile.bio}
            </Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/profile/edit')}>
              <Text style={[typography.caption, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 10 }]}>
                + Add an athlete bio...
              </Text>
            </TouchableOpacity>
          )}

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[typography.captionBold, { color: colors.accent }]}>
                {user?.profile?.experienceLevel || 'INTERMEDIATE'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, marginLeft: 8 }]}>
              <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                {user?.profile?.daysPerWeek || 4} days/week
              </Text>
            </View>
          </View>
        </Card>

        {/* Compact Progression Character Card */}
        <Card style={[styles.progressCard, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.progressHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={[styles.progressPill, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
                <Icon name="sparkle" size={11} color={colors.accent} />
                <Text style={[styles.progressPillText, { color: colors.accent }]}>CHARACTER PROGRESSION</Text>
              </View>
              <Text style={[styles.levelTitleText, { color: colors.textPrimary }]}>
                Level {progress.level} • {progress.rankTitle}
              </Text>
            </View>

            <View style={[styles.streakBadge, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Icon name="flame" size={14} color="#FF9500" />
              <Text style={[styles.streakBadgeText, { color: colors.textPrimary }]}>
                {progress.streakDays}d Streak
              </Text>
            </View>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.progressTrackWrap}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress.progressPercentage}%` }]} />
            </View>
            <View style={styles.ratioRow}>
              <Text style={[styles.ratioText, { color: colors.textSecondary }]}>
                {progress.totalXP.toLocaleString()} XP
              </Text>
              <Text style={[styles.ratioText, { color: colors.accent }]}>
                {progress.progressPercentage}% to Level {progress.level + 1}
              </Text>
            </View>
          </View>

          {/* Ranks Quick Snapshot */}
          <View style={styles.snapshotRow}>
            <View style={[styles.snapshotBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Text style={[styles.snapshotLabel, { color: colors.textSecondary }]}>TOP EXERCISE</Text>
              <Text style={[styles.snapshotVal, { color: colors.textPrimary }]}>
                {progress.topExerciseRank.name} — <Text style={{ color: colors.accent }}>{progress.topExerciseRank.rank}</Text>
              </Text>
            </View>

            <View style={[styles.snapshotBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Text style={[styles.snapshotLabel, { color: colors.textSecondary }]}>TOP MUSCLE</Text>
              <Text style={[styles.snapshotVal, { color: colors.textPrimary }]}>
                {progress.topMuscleRank.muscle} — <Text style={{ color: colors.accent }}>{progress.topMuscleRank.rank}</Text>
              </Text>
            </View>
          </View>

          {/* Nav Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/progress')}
            style={[styles.fullProgressBtn, { borderColor: colors.accent }]}
          >
            <Icon name="progress" size={16} color={colors.accent} />
            <Text style={[styles.fullProgressBtnText, { color: colors.accent }]}>
              View Full Progress Hub
            </Text>
            <Icon name="chevron-right" size={14} color={colors.accent} />
          </TouchableOpacity>

          {/* Warrior Community Feed Nav */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/community')}
            style={[styles.fullProgressBtn, { borderColor: colors.border, marginTop: 8 }]}
          >
            <Icon name="community" size={16} color={colors.accent} />
            <Text style={[styles.fullProgressBtnText, { color: colors.textPrimary }]}>
              Warrior Feed & Arena
            </Text>
            <Icon name="chevron-right" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Appearance / Theme Selector */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
            APPEARANCE (THEME)
          </Text>
          <View style={styles.buttonRow}>
            {(['system', 'dark', 'light'] as const).map((t) => (
              <Button
                key={t}
                title={t === 'system' ? 'Follow System' : t === 'dark' ? 'Dark' : 'Light'}
                onPress={() => setMode(t)}
                variant={mode === t ? 'primary' : 'secondary'}
                size="small"
                style={{ flex: 1, marginHorizontal: 3 }}
              />
            ))}
          </View>
        </Card>

        {/* Units Selector */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
            UNITS SYSTEM
          </Text>
          <View style={styles.buttonRow}>
            <Button
              title="Metric (kg, km)"
              onPress={() => handleUnitToggle('METRIC')}
              variant={user?.profile?.units !== 'IMPERIAL' ? 'primary' : 'secondary'}
              size="small"
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Imperial (lbs, mi)"
              onPress={() => handleUnitToggle('IMPERIAL')}
              variant={user?.profile?.units === 'IMPERIAL' ? 'primary' : 'secondary'}
              size="small"
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </Card>

        {/* App Customization & Experience */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
            APP CUSTOMIZATION
          </Text>

          {/* Rest Timer Presets */}
          <Text style={[styles.customizationSubhead, { color: colors.textPrimary }]}>
            Default Rest Timer
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
            Preset countdown timer between completed sets
          </Text>
          <View style={styles.buttonRow}>
            {[30, 60, 90, 120, 180].map((sec) => (
              <Button
                key={sec}
                title={`${sec}s`}
                onPress={() => setDefaultRestSeconds(sec)}
                variant={defaultRestSeconds === sec ? 'primary' : 'secondary'}
                size="small"
                style={{ flex: 1, marginHorizontal: 2 }}
              />
            ))}
          </View>

          {/* Voice Coach Toggle */}
          <View style={[styles.toggleSettingRow, { borderTopColor: colors.border, marginTop: 14 }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Audio Voice Coach
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Real-time spoken countdowns, cadence, and rest finish alerts
              </Text>
            </View>
            <Switch
              value={voiceCoachEnabled}
              onValueChange={setVoiceCoachEnabled}
              trackColor={{ false: colors.surfaceElevated, true: colors.accent }}
              thumbColor={voiceCoachEnabled ? colors.onAccent : colors.textSecondary}
            />
          </View>

          {/* Haptic Feedback Toggle */}
          <View style={[styles.toggleSettingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Haptic Feedback
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Tactile vibrations on valid rep counts and countdown alarms
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.surfaceElevated, true: colors.accent }}
              thumbColor={hapticsEnabled ? colors.onAccent : colors.textSecondary}
            />
          </View>

          {/* Sound Effects Toggle */}
          <View style={[styles.toggleSettingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Audio Beeps & Sound FX
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Audio signals when sets start and 3-2-1 rest intervals end
              </Text>
            </View>
            <Switch
              value={soundEffectsEnabled}
              onValueChange={setSoundEffectsEnabled}
              trackColor={{ false: colors.surfaceElevated, true: colors.accent }}
              thumbColor={soundEffectsEnabled ? colors.onAccent : colors.textSecondary}
            />
          </View>

          {/* Keep Screen Awake */}
          <View style={[styles.toggleSettingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Keep Screen Awake
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Keep phone display on during camera rep tracking and runs
              </Text>
            </View>
            <Switch
              value={keepScreenAwake}
              onValueChange={setKeepScreenAwake}
              trackColor={{ false: colors.surfaceElevated, true: colors.accent }}
              thumbColor={keepScreenAwake ? colors.onAccent : colors.textSecondary}
            />
          </View>
        </Card>

        {/* Data & Backup */}
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
            DATA & PRIVACY
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 12 }]}>
            Export your entire fitness history, personal records, and tracked routes in JSON format.
          </Text>
          <Button
            title="Export Activity History (JSON)"
            onPress={handleExportData}
            variant="secondary"
            size="small"
            style={{ width: '100%' }}
          />
        </Card>

        {/* Security & Account */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
            SECURITY & ACCOUNT
          </Text>
          <Button
            title="Change Password"
            onPress={() => setShowPasswordModal(true)}
            variant="secondary"
            size="small"
            style={{ width: '100%', marginBottom: 10 }}
          />
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="ghost"
            style={{ width: '100%', marginBottom: 10 }}
          />
          <Button
            title="Delete Account & Data"
            onPress={handleDeleteAccount}
            variant="danger"
            size="small"
            style={{ width: '100%' }}
          />
        </Card>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 40 },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editPencilBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  progressPillText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  levelTitleText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  progressTrackWrap: {
    gap: 4,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  snapshotBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  snapshotLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.3,
  },
  snapshotVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  fullProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  fullProgressBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  customizationSubhead: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 2,
  },
  toggleSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 2,
  },
});
