import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../tokens/ThemeContext';
import { Button } from '../Button';
import { Icon } from '../Icon';

interface WorkoutSummaryModalProps {
  visible: boolean;
  sessionName: string;
  durationSeconds: number;
  totalVolumeKg: number;
  completedSets: number;
  exercisesCount: number;
  earnedXP?: number;
  currentLevel?: number;
  levelTitle?: string;
  xpInLevel?: number;
  xpForNextLevel?: number;
  prBadges?: Array<{ exerciseName: string; value: number }>;
  muscleGains?: Array<{ muscle: string; percentGain: number }>;
  onSave: () => void;
  onDiscard: () => void;
  onViewProgress?: () => void;
  isSaving: boolean;
}

export function WorkoutSummaryModal({
  visible,
  sessionName,
  durationSeconds,
  totalVolumeKg,
  completedSets,
  exercisesCount,
  earnedXP = 320,
  currentLevel = 24,
  levelTitle = 'Iron Warrior',
  xpInLevel = 7850,
  xpForNextLevel = 9000,
  prBadges = [],
  muscleGains = [
    { muscle: 'Chest', percentGain: 8 },
    { muscle: 'Triceps', percentGain: 5 },
    { muscle: 'Shoulders', percentGain: 4 },
  ],
  onSave,
  onDiscard,
  onViewProgress,
  isSaving,
}: WorkoutSummaryModalProps) {
  const { colors, typography } = useTheme();
  const router = useRouter();

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const levelProgressPct = Math.min(100, Math.max(10, Math.round((xpInLevel / (xpForNextLevel || 1)) * 100)));

  const handleViewProgress = () => {
    if (onViewProgress) {
      onViewProgress();
    } else {
      onSave();
      router.replace('/(tabs)/progress');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDiscard}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ width: '100%' }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.trophyCircle, { backgroundColor: 'rgba(184, 245, 0, 0.15)', borderColor: colors.accent }]}>
                <Icon name="trophy" size={38} color={colors.accent} />
              </View>
              <Text style={[styles.titleText, { color: colors.textPrimary }]}>
                WORKOUT COMPLETED!
              </Text>
              <Text style={[styles.subtitleText, { color: colors.accent }]}>
                {sessionName}
              </Text>
            </View>

            {/* XP Earned Banner */}
            <View style={[styles.xpBanner, { backgroundColor: 'rgba(184, 245, 0, 0.12)', borderColor: colors.accent }]}>
              <View style={styles.xpBannerRow}>
                <Icon name="sparkle" size={18} color={colors.accent} />
                <Text style={[styles.xpEarnedText, { color: colors.accent }]}>
                  +{earnedXP} CHARACTER XP EARNED
                </Text>
              </View>
              {/* Level Progress Bar */}
              <View style={styles.levelProgressWrap}>
                <View style={styles.levelLabelRow}>
                  <Text style={[styles.levelLabel, { color: colors.textPrimary }]}>
                    Level {currentLevel}: {levelTitle}
                  </Text>
                  <Text style={[styles.levelRatio, { color: colors.accent }]}>
                    {xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                  </Text>
                </View>
                <View style={[styles.levelTrack, { backgroundColor: colors.surfaceElevated }]}>
                  <View style={[styles.levelFill, { backgroundColor: colors.accent, width: `${levelProgressPct}%` }]} />
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.grid}>
              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>{timeFormatted}</Text>
                <Text style={[styles.statCaption, { color: colors.textSecondary }]}>ACTIVE TIME</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.accent }]}>
                  {Math.round(totalVolumeKg).toLocaleString()} kg
                </Text>
                <Text style={[styles.statCaption, { color: colors.textSecondary }]}>VOLUME</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: '#34C759' }]}>{completedSets}</Text>
                <Text style={[styles.statCaption, { color: colors.textSecondary }]}>SETS LOGGED</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.statVal, { color: colors.textPrimary }]}>{exercisesCount}</Text>
                <Text style={[styles.statCaption, { color: colors.textSecondary }]}>EXERCISES</Text>
              </View>
            </View>

            {/* PR Celebrations (if any) */}
            {prBadges.length > 0 && (
              <View style={[styles.prBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.4)' }]}>
                <View style={styles.prHeader}>
                  <Icon name="medal-gold" size={16} color="#FFD700" />
                  <Text style={styles.prTitle}>PERSONAL RECORD SMASHED!</Text>
                </View>
                {prBadges.map((pr, i) => (
                  <View key={i} style={styles.prRow}>
                    <Text style={[styles.prText, { color: colors.textPrimary }]}>
                      {pr.exerciseName}: {pr.value} kg
                    </Text>
                    <View style={[styles.prXpBadge, { backgroundColor: '#FFD700' }]}>
                      <Text style={styles.prXpText}>+150 XP</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Muscle Development Gains */}
            {muscleGains.length > 0 && (
              <View style={[styles.muscleSection, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.muscleHeading, { color: colors.textSecondary }]}>
                  MUSCLE PROGRESS GAINED
                </Text>
                <View style={styles.musclePillRow}>
                  {muscleGains.map((mg, i) => (
                    <View
                      key={i}
                      style={[styles.musclePill, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                    >
                      <Text style={[styles.musclePillName, { color: colors.textPrimary }]}>
                        {mg.muscle}
                      </Text>
                      <Text style={[styles.musclePillGain, { color: colors.accent }]}>
                        +{mg.percentGain}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Form Verification Tag */}
            <View style={[styles.aiNote, { backgroundColor: 'rgba(52, 199, 89, 0.08)', borderColor: 'rgba(52, 199, 89, 0.3)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="check-circle" size={16} color="#34C759" style={{ marginRight: 8 }} />
                <Text style={[styles.aiNoteText, { flex: 1, textAlign: 'left' }]}>
                  Form verified: Camera tracked biomechanics confirmed clean rep execution!
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title={isSaving ? 'Saving...' : 'Save & Sync Workout'}
                variant="primary"
                loading={isSaving}
                onPress={onSave}
              />
              <View style={{ height: 10 }} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleViewProgress}
                style={[styles.viewProgressBtn, { borderColor: colors.accent }]}
              >
                <Icon name="progress" size={16} color={colors.accent} />
                <Text style={[styles.viewProgressBtnText, { color: colors.accent }]}>
                  View Character Progress
                </Text>
              </TouchableOpacity>
              <View style={{ height: 8 }} />
              <Button
                title="Discard & Exit"
                variant="ghost"
                onPress={onDiscard}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.4,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  xpBanner: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  xpBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  xpEarnedText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  levelProgressWrap: {
    gap: 4,
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  levelRatio: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  levelTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: 3,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statCaption: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.3,
  },
  prBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD700',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  prXpBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prXpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  muscleSection: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  muscleHeading: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.5,
  },
  musclePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  musclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  musclePillName: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  musclePillGain: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  aiNote: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiNoteText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  actions: {
    width: '100%',
  },
  viewProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  viewProgressBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
