import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  PoseTracker,
  SupportedExerciseType,
  resolveExercisePattern,
} from '../../src/services/vision/PoseTracker';
import { CameraVisionView } from '../../src/services/vision/components/CameraVisionView';
import { HeadTrajectoryGraph } from '../../src/services/vision/components/HeadTrajectoryGraph';
import { FrameAnalysisResult } from '../../src/services/vision/types';
import { useTheme } from '../../src/theme';
import { AppHeader, AppBadge, AppButton, AIFormScoreCard, AppUnderConstruction } from '../../src/components/ui';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { useActiveWorkoutStore } from '../../src/stores/activeWorkoutStore';

const DEFAULT_EXERCISE_NAMES: Record<SupportedExerciseType, string> = {
  squat: 'Squats',
  pushup: 'Push / Press',
  pullup: 'Pull / Chin',
  bicep_curl: 'Arm Curls',
  plank: 'Plank Hold',
};

export default function VisionTrackerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const applyCameraRepsToSet = useActiveWorkoutStore((state) => state.applyCameraRepsToSet);

  const customExerciseName = (params.exerciseName as string) || '';
  const primaryMuscle = (params.primaryMuscle as string) || '';

  const initialPattern: SupportedExerciseType = useMemo(() => {
    if (customExerciseName) {
      return resolveExercisePattern(customExerciseName, primaryMuscle);
    }
    return (params.exercise as SupportedExerciseType) || 'squat';
  }, [customExerciseName, primaryMuscle, params.exercise]);

  const selectedExercise = initialPattern;
  const currentDisplayName = useMemo(() => {
    if (customExerciseName) return customExerciseName;
    const fromParam = params.exercise as SupportedExerciseType | undefined;
    if (fromParam && DEFAULT_EXERCISE_NAMES[fromParam]) {
      return DEFAULT_EXERCISE_NAMES[fromParam];
    }
    return 'Squats';
  }, [customExerciseName, params.exercise]);

  const [summaryData, setSummaryData] = useState<FrameAnalysisResult | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  const poseTracker = useMemo(() => {
    return new PoseTracker(selectedExercise, currentDisplayName);
  }, [selectedExercise, currentDisplayName]);

  const handleFinishSet = (summary: FrameAnalysisResult) => {
    setSummaryData(summary);
  };

  const handleCloseSummary = () => {
    setSummaryData(null);
    poseTracker.reset();
    sessionStartTimeRef.current = Date.now();
  };

  const isPlank = selectedExercise === 'plank';

  // Calculate topOffset so RepCounterHUD sits cleanly below topHeader with a comfortable margin
  const calculatedTopOffset = insets.top + (Platform.OS === 'web' ? 70 : 66);

  if (Platform.OS !== 'web') {
    return (
      <AppUnderConstruction
        title="AI FORM DETECTION"
        featureName="Real-Time AI Vision"
        description={`Real-time computer vision for ${currentDisplayName} is optimized for web browser acceleration.\n\nOn-device native Android neural acceleration (MediaPipe / TFLite) is currently in active development for the v1.1 release.`}
        icon="camera"
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Overlay - Unified AppHeader */}
      <AppHeader
        showLogo
        logoVariant="mark"
        title={currentDisplayName.toUpperCase()}
        subtitle="AI FORM DETECTION"
        showBack
        onBack={() => router.back()}
        rightActions={<AppBadge label="VISION AI" variant="accent" size="small" />}
        transparent
      />

      {/* Main Vision Tracking Camera Component */}
      <CameraVisionView
        poseTracker={poseTracker}
        onFinishSet={handleFinishSet}
        topOffset={calculatedTopOffset}
      />

      {/* Set Summary & Form Quality Modal */}
      {summaryData && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseSummary}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>SET COMPLETED</Text>
                <TouchableOpacity onPress={handleCloseSummary}>
                  <Icon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Form Score Banner with AIFormScoreCard */}
                <AIFormScoreCard
                  score={summaryData.state.overallFormScore}
                  repsCount={summaryData.state.validReps}
                  targetReps={summaryData.state.validReps + summaryData.state.noReps}
                  goodFormCount={summaryData.state.validReps}
                  needsImprovementCount={summaryData.state.noReps}
                  feedbackSummary={
                    summaryData.state.overallFormScore >= 80
                      ? 'Excellent'
                      : summaryData.state.overallFormScore >= 60
                      ? 'Acceptable'
                      : 'Needs Attention'
                  }
                  style={{ marginBottom: 16 }}
                />

              {/* Reps Breakdown */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValueBig, { color: colors.success }]}>
                    {isPlank ? `${summaryData.state.holdDurationSec ?? 0}s` : summaryData.state.validReps}
                  </Text>
                  <Text style={[styles.statColLabel, { color: colors.textSecondary }]}>
                    {isPlank ? 'VALID HOLD' : 'VALID REPS'}
                  </Text>
                </View>

                {!isPlank && (
                  <View style={styles.statCol}>
                    <Text style={[styles.statValueBig, { color: colors.error }]}>
                      {summaryData.state.noReps}
                    </Text>
                    <Text style={[styles.statColLabel, { color: colors.textSecondary }]}>
                      NO-REPS (FAULTED)
                    </Text>
                  </View>
                )}
              </View>

              {/* Rep Pacing & Fatigue Analysis (LinkedIn YOLO26 Style) */}
              {!isPlank && (summaryData.state.setPerformanceReport || poseTracker.getAnalyzer().getSetPerformanceReport()).repDurations.length > 0 && (() => {
                const report = summaryData.state.setPerformanceReport || poseTracker.getAnalyzer().getSetPerformanceReport();
                return (
                  <View style={styles.pacingSection}>
                    <View style={styles.pacingHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="timer" size={13} color="#00F0FF" style={{ marginRight: 5 }} />
                        <Text style={styles.pacingTitle}>REP PACING & FATIGUE</Text>
                      </View>
                      <View
                        style={[
                          styles.pacingBadge,
                          {
                            backgroundColor:
                              report.fatigueLossPercent >= 25 ? '#FF950025' : '#34C75925',
                            borderColor:
                              report.fatigueLossPercent >= 25 ? '#FF9500' : '#34C759',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pacingBadgeText,
                            {
                              color:
                                report.fatigueLossPercent >= 25 ? '#FF9500' : '#34C759',
                            },
                          ]}
                        >
                          {report.fatigueLossPercent >= 25
                            ? `FATIGUE (+${report.fatigueLossPercent}%)`
                            : 'CONSISTENT PACING'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.pacingGrid}>
                      <View style={styles.pacingCell}>
                        <Text style={styles.pacingCellLabel}>AVG DURATION</Text>
                        <Text style={styles.pacingCellValue}>
                          {(report.avgRepDurationMs / 1000).toFixed(1)}s
                        </Text>
                      </View>
                      <View style={styles.pacingCell}>
                        <Text style={styles.pacingCellLabel}>FASTEST REP</Text>
                        <Text style={[styles.pacingCellValue, { color: '#34C759' }]}>
                          {(report.fastestRepMs / 1000).toFixed(1)}s
                          {report.fastestRepNumber > 0 && (
                            <Text style={styles.repIndexSub}> #{report.fastestRepNumber}</Text>
                          )}
                        </Text>
                      </View>
                      <View style={styles.pacingCell}>
                        <Text style={styles.pacingCellLabel}>SLOWEST REP</Text>
                        <Text style={[styles.pacingCellValue, { color: '#FF9500' }]}>
                          {(report.slowestRepMs / 1000).toFixed(1)}s
                          {report.slowestRepNumber > 0 && (
                            <Text style={styles.repIndexSub}> #{report.slowestRepNumber}</Text>
                          )}
                        </Text>
                      </View>
                      <View style={styles.pacingCell}>
                        <Text style={styles.pacingCellLabel}>AVG REST</Text>
                        <Text style={styles.pacingCellValue}>
                          {report.avgRestBetweenRepsMs > 0
                            ? `${(report.avgRestBetweenRepsMs / 1000).toFixed(1)}s`
                            : '0.0s'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* Head & Movement Trajectory Graph (LinkedIn YOLO26 Style) */}
              {!isPlank && summaryData.state.trajectoryHistory && summaryData.state.trajectoryHistory.length > 2 && (
                <View style={styles.trajectorySection}>
                  <View style={styles.trajectoryHeaderRow}>
                    <Icon name="today" size={13} color="#00F0FF" style={{ marginRight: 5 }} />
                    <Text style={styles.trajectoryTitle}>HEAD / MOVEMENT TRAJECTORY GRAPH</Text>
                  </View>
                  <HeadTrajectoryGraph
                    trajectory={summaryData.state.trajectoryHistory}
                    referenceLineY={summaryData.state.referenceLineY}
                    referenceLineLabel={summaryData.state.referenceLineLabel || 'REFERENCE'}
                    height={130}
                  />
                </View>
              )}

              {/* VBT Barbell Velocity Metrics */}
              {!isPlank && summaryData.state.latestVelocity && (
                <View style={styles.vbtSection}>
                  <View style={styles.vbtHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="today" size={13} color="#00F0FF" style={{ marginRight: 5 }} />
                      <Text style={styles.vbtTitle}>BAR PATH & VELOCITY (VBT)</Text>
                    </View>
                    <View
                      style={[
                        styles.vbtBadge,
                        {
                          backgroundColor:
                            summaryData.state.latestVelocity.velocityLossPercent >= 20
                              ? '#FF950025'
                              : '#34C75925',
                          borderColor:
                            summaryData.state.latestVelocity.velocityLossPercent >= 20
                              ? '#FF9500'
                              : '#34C759',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.vbtBadgeText,
                          {
                            color:
                              summaryData.state.latestVelocity.velocityLossPercent >= 20
                                ? '#FF9500'
                                : '#34C759',
                          },
                        ]}
                      >
                        {summaryData.state.latestVelocity.velocityLossPercent >= 20
                          ? 'FATIGUE DETECTED'
                          : 'OPTIMAL VELOCITY'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.vbtGrid}>
                    <View style={styles.vbtCell}>
                      <Text style={styles.vbtCellLabel}>MEAN VELOCITY</Text>
                      <Text style={styles.vbtCellValue}>
                        {summaryData.state.latestVelocity.meanConcentricVelocityMps} m/s
                      </Text>
                    </View>
                    <View style={styles.vbtCell}>
                      <Text style={styles.vbtCellLabel}>PEAK VELOCITY</Text>
                      <Text style={styles.vbtCellValue}>
                        {summaryData.state.latestVelocity.peakVelocityMps} m/s
                      </Text>
                    </View>
                    <View style={styles.vbtCell}>
                      <Text style={styles.vbtCellLabel}>VELOCITY LOSS</Text>
                      <Text
                        style={[
                          styles.vbtCellValue,
                          {
                            color:
                              summaryData.state.latestVelocity.velocityLossPercent >= 20
                                ? '#FF9500'
                                : '#34C759',
                          },
                        ]}
                      >
                        {summaryData.state.latestVelocity.velocityLossPercent}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Faults breakdown if any */}
              {summaryData.state.recentHistory.some((r) => r.faults.length > 0) && (
                <View style={styles.faultsSection}>
                  <Text style={[styles.faultsTitle, { color: colors.textPrimary }]}>
                    Areas for Improvement:
                  </Text>
                  {summaryData.state.recentHistory
                    .flatMap((r) => r.faults)
                    .filter((f, idx, arr) => arr.findIndex((x) => x.name === f.name) === idx)
                    .map((fault) => (
                      <View key={fault.id} style={styles.faultItem}>
                        <Text style={styles.faultBullet}>•</Text>
                        <View style={styles.faultContent}>
                          <Text style={[styles.faultName, { color: '#FF453A' }]}>
                            {fault.name}
                          </Text>
                          <Text style={[styles.faultDesc, { color: colors.textSecondary }]}>
                            {fault.correctionMessage}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {params.fromActiveWorkout === 'true' && (
                  <>
                    <Button
                      title={`LOG ${summaryData.state.validReps} VALID REPS TO WORKOUT`}
                      variant="primary"
                      onPress={() => {
                        const exId = (params.exerciseId as string) || '';
                        const repDurations = summaryData.state.setPerformanceReport?.repDurations;
                        const totalRepTimeMs = repDurations && repDurations.length > 0
                          ? repDurations.reduce((acc, d) => acc + d, 0)
                          : 0;
                        let durationSec = 0;
                        if (isPlank) {
                          durationSec = summaryData.state.holdDurationSec || 0;
                        } else if (totalRepTimeMs > 0) {
                          durationSec = Math.max(1, Math.round(totalRepTimeMs / 1000));
                        } else {
                          durationSec = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
                        }
                        applyCameraRepsToSet(exId, summaryData.state.validReps, durationSec);
                        router.back();
                      }}
                    />
                    <View style={{ height: 10 }} />
                  </>
                )}
                <Button
                  title="START NEXT SET"
                  variant={params.fromActiveWorkout === 'true' ? 'secondary' : 'primary'}
                  onPress={handleCloseSummary}
                />
                <View style={{ height: 10 }} />
                <Button
                  title="BACK TO WORKOUT"
                  variant="ghost"
                  onPress={() => router.back()}
                />
              </View>
            </ScrollView>

            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitleCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  screenSubTitle: {
    fontSize: 9,
    color: '#A3A3A3',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: 'rgba(184, 245, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8F500',
  },
  aiBadgeText: {
    color: '#B8F500',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeModalText: {
    fontSize: 22,
    fontWeight: '700',
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    marginRight: 14,
  },
  scoreTextCol: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statValueBig: {
    fontSize: 36,
    fontWeight: '900',
  },
  statColLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  faultsSection: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
  },
  faultsTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  faultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  faultBullet: {
    color: '#FF3B30',
    fontSize: 16,
    marginRight: 6,
  },
  faultContent: {
    flex: 1,
  },
  faultName: {
    fontSize: 12,
    fontWeight: '700',
  },
  faultDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  vbtSection: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  vbtHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vbtTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  vbtBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  vbtBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vbtGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vbtCell: {
    alignItems: 'center',
    flex: 1,
  },
  vbtCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A3A3A3',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  vbtCellValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  modalActions: {
    marginTop: 8,
  },
  pacingSection: {
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  pacingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pacingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  pacingBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  pacingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pacingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pacingCell: {
    alignItems: 'center',
    flex: 1,
  },
  pacingCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A3A3A3',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  pacingCellValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  repIndexSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A3A3A3',
  },
  trajectorySection: {
    marginBottom: 16,
  },
  trajectoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trajectoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.6,
  },
  modalScroll: {
    maxHeight: 520,
  },
});
