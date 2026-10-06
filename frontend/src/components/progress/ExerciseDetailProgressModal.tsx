import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { ExerciseProgressItem } from '../../services/progression/types';
import { getRankBadgeColors } from './RankHierarchyGrid';

interface ExerciseDetailProgressModalProps {
  exercise: ExerciseProgressItem | null;
  visible: boolean;
  onClose: () => void;
}

export function ExerciseDetailProgressModal({
  exercise,
  visible,
  onClose,
}: ExerciseDetailProgressModalProps) {
  const { colors } = useTheme();

  if (!exercise) return null;

  const badgeStyle = getRankBadgeColors(exercise.rank);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                  {exercise.rank} TIER
                </Text>
              </View>
              <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={1}>
                {exercise.exerciseName}
              </Text>
              <Text style={[styles.muscleSub, { color: colors.textSecondary }]}>
                Target: {exercise.primaryMuscle}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            >
              <Icon name="close" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Rank Progress Bar */}
            <View style={[styles.cardSection, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <View style={styles.rankRow}>
                <Text style={[styles.rankLevelTitle, { color: colors.textPrimary }]}>
                  Rank Mastery: {exercise.rank}
                </Text>
                <Text style={[styles.rankPct, { color: badgeStyle.text }]}>
                  {exercise.progressPercentage}%
                </Text>
              </View>

              <View style={[styles.track, { backgroundColor: colors.surface }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: badgeStyle.text,
                      width: `${Math.min(100, Math.max(5, exercise.progressPercentage))}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.xpRow}>
                <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                  Current: {exercise.currentXP} XP
                </Text>
                <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                  Next Rank: {exercise.nextRankXP} XP
                </Text>
              </View>
            </View>

            {/* Quick Metrics 3-box */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>PERSONAL BEST</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {exercise.personalBestWeightKg > 0 ? `${exercise.personalBestWeightKg} kg` : `${exercise.personalBestReps} reps`}
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>EST. 1RM</Text>
                <Text style={[styles.metricVal, { color: colors.accent }]}>
                  {exercise.estimated1RMKg} kg
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOTAL VOLUME</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  {Math.round(exercise.totalVolumeKg).toLocaleString()} kg
                </Text>
              </View>
            </View>

            {/* Milestone Card */}
            {exercise.nextMilestone && (
              <View style={[styles.milestoneBox, { backgroundColor: 'rgba(184, 245, 0, 0.08)', borderColor: 'rgba(184, 245, 0, 0.25)' }]}>
                <View style={styles.milestoneHeader}>
                  <Icon name="target" size={14} color={colors.accent} />
                  <Text style={[styles.milestoneTitle, { color: colors.accent }]}>Next Milestone</Text>
                  <View style={[styles.xpPill, { backgroundColor: colors.accent }]}>
                    <Text style={styles.xpPillText}>+{exercise.nextMilestone.rewardXP} XP</Text>
                  </View>
                </View>
                <Text style={[styles.milestoneDesc, { color: colors.textPrimary }]}>
                  {exercise.nextMilestone.targetDescription}
                </Text>
              </View>
            )}

            {/* History Logs */}
            <View style={styles.historySection}>
              <Text style={[styles.historyHeading, { color: colors.textPrimary }]}>
                Recent Sets & Performances
              </Text>

              {exercise.historyPoints.length === 0 ? (
                <Text style={[styles.noHistory, { color: colors.textSecondary }]}>
                  No session history points recorded yet.
                </Text>
              ) : (
                exercise.historyPoints.slice().reverse().map((pt, idx) => (
                  <View
                    key={idx}
                    style={[styles.historyRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                  >
                    <View>
                      <Text style={[styles.historyDate, { color: colors.textPrimary }]}>
                        {pt.date}
                      </Text>
                      <Text style={[styles.historySub, { color: colors.textSecondary }]}>
                        {pt.reps} reps • Est. 1RM {pt.estimated1RMKg} kg
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={[styles.historyWeight, { color: colors.accent }]}>
                        {pt.weightKg} kg
                      </Text>
                      <Text style={[styles.historyVol, { color: colors.textSecondary }]}>
                        {pt.volumeKg} kg vol
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.doneBtnText}>Close Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  muscleSub: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 14,
  },
  cardSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankLevelTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rankPct: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-SemiBold',
    textAlign: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneDesc: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  historySection: {
    gap: 8,
  },
  historyHeading: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  noHistory: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  historySub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  historyVol: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
