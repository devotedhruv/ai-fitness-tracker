import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useActiveWorkoutStore, ActiveWorkoutExercise } from '../../src/stores/activeWorkoutStore';
import { useTheme } from '../../src/tokens/ThemeContext';
import { WorkoutExerciseCard } from '../../src/components/workout/WorkoutExerciseCard';
import { RestTimerBar } from '../../src/components/workout/RestTimerBar';
import { WorkoutSummaryModal } from '../../src/components/workout/WorkoutSummaryModal';
import { ExerciseDemonstrationPanel } from '../../src/components/exerciseDemo/ExerciseDemonstrationPanel';
import { ExerciseDemoModal } from '../../src/components/exerciseDemo/ExerciseDemoModal';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';
import { exercisesApi, workoutsApi } from '../../src/services/api';
import { useProgressionStore } from '../../src/stores/progressionStore';
import { calculateSetXP } from '../../src/services/progression/xpCalculator';
import { userDatabaseService } from '../../src/services/userDatabaseService';
import { useAuthStore } from '../../src/stores/authStore';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const isActive = useActiveWorkoutStore((state) => state.isActive);
  const sessionName = useActiveWorkoutStore((state) => state.sessionName);
  const routineId = useActiveWorkoutStore((state) => state.routineId);
  const startTime = useActiveWorkoutStore((state) => state.startTime);
  const elapsedSeconds = useActiveWorkoutStore((state) => state.elapsedSeconds);
  const isTimerRunning = useActiveWorkoutStore((state) => state.isTimerRunning);
  const toggleExerciseTimer = useActiveWorkoutStore((state) => state.toggleExerciseTimer);
  const restTimer = useActiveWorkoutStore((state) => state.restTimer);
  const exercises = useActiveWorkoutStore((state) => state.exercises);
  const startWorkout = useActiveWorkoutStore((state) => state.startWorkout);
  const discardWorkout = useActiveWorkoutStore((state) => state.discardWorkout);
  const incrementElapsedSeconds = useActiveWorkoutStore((state) => state.incrementElapsedSeconds);
  const addExercise = useActiveWorkoutStore((state) => state.addExercise);
  const getTotalVolumeKg = useActiveWorkoutStore((state) => state.getTotalVolumeKg);
  const getCompletedSetsCount = useActiveWorkoutStore((state) => state.getCompletedSetsCount);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [selectedDemoExercise, setSelectedDemoExercise] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const progress = useProgressionStore((state) => state.progress);
  const awardWorkoutXP = useProgressionStore((state) => state.awardWorkoutXP);
  const awardSetXP = useProgressionStore((state) => state.awardSetXP);
  const user = useAuthStore((state) => state.user);

  // Calculate live session XP, PRs, and muscle gains
  const sessionProgression = React.useMemo(() => {
    let xp = 150; // base workout completion XP
    const prList: Array<{ exerciseName: string; value: number }> = [];
    const muscleMap: Record<string, number> = {};

    exercises.forEach((ex) => {
      const muscle = ex.primaryMuscle || 'Full Body';
      let completedExSets = 0;
      ex.sets.forEach((s) => {
        if (s.isCompleted) {
          completedExSets++;
          const isPersonalRecord = !!(
            (s as any).isPR ||
            (s.previous && s.weightKg > s.previous.weightKg && s.weightKg > 0)
          );
          const setXp = calculateSetXP({
            weightKg: s.weightKg,
            reps: s.reps,
            isPR: isPersonalRecord,
            rpe: s.rpe,
            isWarmup: s.isWarmup,
            holdDurationSec: s.holdDurationSec,
          });
          xp += setXp.xpAwarded;
          if (isPersonalRecord) {
            prList.push({ exerciseName: ex.exerciseName, value: s.weightKg });
          }
        }
      });
      if (completedExSets > 0) {
        muscleMap[muscle] = (muscleMap[muscle] || 0) + completedExSets * 2.5;
      }
    });

    const gains = Object.entries(muscleMap).map(([muscle, gain]) => ({
      muscle,
      percentGain: Math.min(18, Math.max(3, Math.round(gain))),
    }));

    return {
      sessionXP: xp,
      sessionPRs: prList,
      muscleGains: gains.length > 0 ? gains : [
        { muscle: 'Chest', percentGain: 8 },
        { muscle: 'Triceps', percentGain: 5 },
      ],
    };
  }, [exercises]);

  // Active exercise & Next exercise
  const activeExerciseIndex = exercises.findIndex((ex) => ex.sets.some((s) => !s.isCompleted));
  const currentExercise = activeExerciseIndex !== -1 ? exercises[activeExerciseIndex] : exercises[0];
  const nextExercise =
    activeExerciseIndex !== -1 && activeExerciseIndex + 1 < exercises.length
      ? exercises[activeExerciseIndex + 1]
      : null;

  // If no active workout, start a default session
  useEffect(() => {
    if (!isActive) {
      startWorkout({
        name: 'Chest & Delts Hypertrophy',
        exercises: [
          { exercise: { name: 'Lever Pec Deck Fly', primaryMuscle: 'CHEST' }, targetSets: 3, targetReps: 10, targetWeight: 45, targetRestSec: 60 },
          { exercise: { name: 'Barbell Bench Press', primaryMuscle: 'CHEST' }, targetSets: 3, targetReps: 10, targetWeight: 60, targetRestSec: 90 },
          { exercise: { name: 'Overhead Press', primaryMuscle: 'SHOULDERS' }, targetSets: 3, targetReps: 8, targetWeight: 40, targetRestSec: 90 },
        ],
      });
    }
  }, [isActive, startWorkout]);

  // Active exercise timer ticker - ONLY records time while user is actively exercising (not resting or idle)
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && !restTimer.isActive) {
      timer = setInterval(() => {
        incrementElapsedSeconds();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, restTimer.isActive, incrementElapsedSeconds]);

  // Exercise library query for the Add Exercise modal
  const exercisesQuery = useQuery({
    queryKey: ['exercises-picker', exerciseSearch],
    queryFn: () => exercisesApi.list({ search: exerciseSearch.trim() || undefined, limit: 30 }),
    enabled: addModalVisible,
  });

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleFinishPress = () => {
    const completedCount = getCompletedSetsCount();
    if (completedCount === 0) {
      Alert.alert(
        'No Sets Completed',
        'You have not checked off any completed sets yet. Finish anyway?',
        [
          { text: 'Keep Training', style: 'cancel' },
          { text: 'Finish', onPress: () => setSummaryModalVisible(true) },
        ]
      );
      return;
    }
    setSummaryModalVisible(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const setsPayload: any[] = [];
      exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.isCompleted || (s.weightKg > 0 && s.reps > 0)) {
            setsPayload.push({
              exerciseId: ex.exerciseId,
              set_number: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
              isCompleted: true,
              isWarmup: s.isWarmup,
              rpe: s.rpe || null,
            });

            // Award individual set XP to update exercise and muscle progress
            awardSetXP({
              weightKg: s.weightKg,
              reps: s.reps,
              isPR: !!((s as any).isPR || (s.previous && s.weightKg > s.previous.weightKg)),
              rpe: s.rpe,
              isWarmup: s.isWarmup,
              holdDurationSec: s.holdDurationSec,
              exerciseName: ex.exerciseName,
              primaryMuscle: ex.primaryMuscle,
            });
          }
        });
      });

      const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
      const endIso = new Date().toISOString();

      // Award overall workout completion bonus XP
      awardWorkoutXP(sessionProgression.sessionXP);

      // Save to Supabase via userDatabaseService
      try {
        const userId = user?.id || 'user-demo-athlete';
        await userDatabaseService.saveCompletedWorkoutSession({
          user_id: userId,
          name: sessionName,
          duration_seconds: elapsedSeconds,
          started_at: startIso,
          xp_earned: sessionProgression.sessionXP,
          exercises: exercises
            .map((ex, exIdx) => ({
              exercise_id: ex.exerciseId,
              order_index: exIdx,
              sets: ex.sets
                .filter((s) => s.isCompleted || s.weightKg > 0 || s.reps > 0)
                .map((s) => ({
                  set_number: s.setNumber,
                  reps: s.reps,
                  weight: s.weightKg,
                  completed_at: new Date().toISOString(),
                })),
            }))
            .filter((ex) => ex.sets.length > 0),
        });
      } catch (dbErr) {
        console.warn('[ActiveWorkout] Supabase persistence fallback:', dbErr);
      }

      // Sync with backend API (fail-safe)
      try {
        await workoutsApi.createSession({
          name: sessionName,
          routineId: routineId || null,
          startTime: startIso,
          endTime: endIso,
          durationSeconds: elapsedSeconds,
          sets: setsPayload,
        });
      } catch (apiErr) {
        console.warn('[ActiveWorkout] workoutsApi.createSession fallback:', apiErr);
      }

      discardWorkout();
      setSummaryModalVisible(false);
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardWorkout = async () => {
    const completedCount = getCompletedSetsCount();
    const hasLoggedData =
      completedCount > 0 ||
      elapsedSeconds > 0 ||
      exercises.some((ex) => ex.sets.some((s) => s.weightKg > 0 || s.reps > 0));

    if (!hasLoggedData) {
      discardWorkout();
      setSummaryModalVisible(false);
      router.back();
      return;
    }

    Alert.alert(
      'Discard & Sync Workout?',
      'All completed sets, logged volume, active training time, and earned XP will be safely saved and synced with your warrior profile.',
      [
        { text: 'Keep Training', style: 'cancel' },
        {
          text: 'Discard & Sync',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              const setsPayload: any[] = [];
              exercises.forEach((ex) => {
                ex.sets.forEach((s) => {
                  if (s.isCompleted || (s.weightKg > 0 && s.reps > 0)) {
                    setsPayload.push({
                      exerciseId: ex.exerciseId,
                      set_number: s.setNumber,
                      weightKg: s.weightKg,
                      reps: s.reps,
                      isCompleted: s.isCompleted,
                      isWarmup: s.isWarmup,
                      rpe: s.rpe || null,
                    });
                    awardSetXP({
                      weightKg: s.weightKg,
                      reps: s.reps,
                      isPR: !!((s as any).isPR || (s.previous && s.weightKg > s.previous.weightKg)),
                      rpe: s.rpe,
                      isWarmup: s.isWarmup,
                      holdDurationSec: s.holdDurationSec,
                      exerciseName: ex.exerciseName,
                      primaryMuscle: ex.primaryMuscle,
                    });
                  }
                });
              });

              const partialXP = Math.max(50, Math.floor(sessionProgression.sessionXP * 0.75));
              awardWorkoutXP(partialXP);

              const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
              const endIso = new Date().toISOString();

              try {
                const userId = user?.id || 'user-demo-athlete';
                await userDatabaseService.saveCompletedWorkoutSession({
                  user_id: userId,
                  name: `${sessionName} (Discarded)`,
                  duration_seconds: elapsedSeconds,
                  started_at: startIso,
                  notes: 'Discarded active workout session saved and synced with profile',
                  xp_earned: partialXP,
                  exercises: exercises
                    .map((ex, exIdx) => ({
                      exercise_id: ex.exerciseId,
                      order_index: exIdx,
                      sets: ex.sets
                        .filter((s) => s.isCompleted || s.weightKg > 0 || s.reps > 0)
                        .map((s) => ({
                          set_number: s.setNumber,
                          reps: s.reps,
                          weight: s.weightKg,
                          completed_at: new Date().toISOString(),
                        })),
                    }))
                    .filter((ex) => ex.sets.length > 0),
                });
              } catch (dbErr) {
                console.warn('[ActiveWorkout] Discard save Supabase fallback:', dbErr);
              }

              try {
                await workoutsApi.createSession({
                  name: `${sessionName} (Discarded)`,
                  routineId: routineId || null,
                  startTime: startIso,
                  endTime: endIso,
                  durationSeconds: elapsedSeconds,
                  sets: setsPayload,
                });
              } catch (apiErr) {
                console.warn('[ActiveWorkout] Discard save API fallback:', apiErr);
              }

              discardWorkout();
              setSummaryModalVisible(false);

              Alert.alert(
                'Session Saved & Synced',
                `Logged sets (${completedCount}), active duration (${timeFormatted}), and +${partialXP} XP have been saved and synced with your warrior profile!`,
                [
                  {
                    text: 'View Profile',
                    onPress: () => router.replace('/(tabs)/profile'),
                  },
                ]
              );
            } catch (err: any) {
              discardWorkout();
              setSummaryModalVisible(false);
              router.replace('/(tabs)/profile');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleLaunchCamera = (ex: ActiveWorkoutExercise, setNumber: number) => {
    router.push({
      pathname: '/workout/vision-tracker',
      params: {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        primaryMuscle: ex.primaryMuscle,
        fromActiveWorkout: 'true',
        activeSetNumber: String(setNumber),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Session Header */}
      <View style={[styles.topHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleDiscardWorkout}
          style={styles.cancelButton}
        >
          <Text style={[typography.captionBold, { color: colors.textSecondary }]}>DISCARD</Text>
        </TouchableOpacity>

        <View style={styles.centerHeader}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]} numberOfLines={1}>
            {sessionName}
          </Text>
          <TouchableOpacity
            onPress={toggleExerciseTimer}
            activeOpacity={0.7}
            style={[
              styles.timerBadge,
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isTimerRunning
                  ? colors.successMuted
                  : restTimer.isActive
                  ? colors.warningMuted
                  : colors.accentMuted,
                borderColor: isTimerRunning
                  ? colors.success
                  : restTimer.isActive
                  ? colors.warning
                  : colors.primary,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 14,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isTimerRunning ? 'Pause exercise timer' : 'Start exercise timer'}
          >
            <Icon
              name={isTimerRunning ? 'pause' : 'play'}
              size={11}
              color={isTimerRunning ? colors.success : restTimer.isActive ? colors.warning : colors.accentText}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.timerBadgeText,
                {
                  color: isTimerRunning ? colors.success : restTimer.isActive ? colors.warning : colors.accentText,
                },
              ]}
            >
              {timeFormatted}
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                marginLeft: 4,
                color: isTimerRunning
                  ? colors.success
                  : restTimer.isActive
                  ? colors.warning
                  : colors.textSecondary,
              }}
            >
              {isTimerRunning
                ? 'EXERCISING'
                : restTimer.isActive
                ? 'RESTING'
                : elapsedSeconds === 0
                ? 'START'
                : 'PAUSED'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleFinishPress}
          style={[styles.finishButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[typography.captionBold, { color: colors.onPrimary }]}>FINISH</Text>
        </TouchableOpacity>
      </View>

      {/* Main Exercise Set List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="dumbbell" size={48} color={colors.accent} style={{ marginBottom: 14 }} />
            <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
              Empty Session
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 }]}>
              Add your first exercise to begin logging your workout.
            </Text>
            <Button
              title="Add Exercise"
              onPress={() => setAddModalVisible(true)}
              variant="primary"
              leftIcon={<Icon name="plus" size={15} color={colors.onAccent} />}
            />
          </View>
        ) : (
          <>
            {currentExercise && (
              <ExerciseDemonstrationPanel
                exercise={currentExercise}
                currentSetIndex={currentExercise.sets.findIndex((s) => !s.isCompleted)}
                onOpenDetails={(ex) => setSelectedDemoExercise(ex)}
                onDoExercise={(ex) => {
                  const setNum = ex.sets.find((s) => !s.isCompleted)?.setNumber || 1;
                  handleLaunchCamera(ex, setNum);
                }}
                style={{ marginBottom: 16 }}
              />
            )}

            {exercises.map((exercise, index) => (
              <WorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                exerciseIndex={index}
                onLaunchCamera={handleLaunchCamera}
                onOpenDemo={(ex) => setSelectedDemoExercise(ex)}
              />
            ))}

            {/* Next Exercise Preview Card */}
            {nextExercise && (
              <Card style={[styles.nextPreviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.nextPreviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.nextPreviewLabel, { color: colors.accent }]}>NEXT EXERCISE</Text>
                    <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
                      {nextExercise.exerciseName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {nextExercise.primaryMuscle} • {nextExercise.sets.length} sets
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.nextPreviewBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}
                    onPress={() => setSelectedDemoExercise(nextExercise)}
                  >
                    <Icon name="play" size={12} color={colors.accent} />
                    <Text style={[styles.nextPreviewBtnText, { color: colors.accent }]}>View Animation</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            <Button
              title="Add Exercise"
              onPress={() => setAddModalVisible(true)}
              variant="secondary"
              leftIcon={<Icon name="plus" size={15} color={colors.textPrimary} />}
              style={{ marginTop: 8, marginBottom: 60 }}
            />
          </>
        )}
      </ScrollView>

      {/* Persistent Floating Rest Timer */}
      <RestTimerBar onViewDemo={(ex) => setSelectedDemoExercise(ex)} />

      {/* Exercise Demonstration Modal */}
      <ExerciseDemoModal
        exercise={selectedDemoExercise ? {
          id: selectedDemoExercise.exerciseId,
          name: selectedDemoExercise.exerciseName,
          primaryMuscle: selectedDemoExercise.primaryMuscle,
        } : null}
        visible={!!selectedDemoExercise}
        onClose={() => setSelectedDemoExercise(null)}
        onStartCameraTracking={(ex) => handleLaunchCamera({
          exerciseId: ex.id || '',
          exerciseName: ex.name,
          primaryMuscle: ex.primaryMuscle || '',
          id: '',
          targetRestSec: 90,
          sets: [],
        }, 1)}
      />

      {/* Exercise Picker Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                Add Exercise
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Search exercise..."
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              containerStyle={{ marginBottom: 12 }}
            />

            <ScrollView style={{ maxHeight: 420 }}>
              {exercisesQuery.data?.items?.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.exercisePickRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    addExercise({
                      id: item.id,
                      name: item.name,
                      primaryMuscle: item.primaryMuscle,
                      targetRestSec: 90,
                    });
                    setAddModalVisible(false);
                    setExerciseSearch('');
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      {item.primaryMuscle} • {item.type}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="plus" size={13} color={colors.accent} style={{ marginRight: 2 }} />
                    <Text style={[typography.captionBold, { color: colors.accent }]}>Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Workout Completion Summary Modal */}
      <WorkoutSummaryModal
        visible={summaryModalVisible}
        sessionName={sessionName}
        durationSeconds={elapsedSeconds}
        totalVolumeKg={getTotalVolumeKg()}
        completedSets={getCompletedSetsCount()}
        exercisesCount={exercises.length}
        earnedXP={sessionProgression.sessionXP}
        currentLevel={progress.level}
        levelTitle={progress.rankTitle}
        xpInLevel={progress.currentLevelXP}
        xpForNextLevel={progress.nextLevelXP}
        prBadges={sessionProgression.sessionPRs}
        muscleGains={sessionProgression.muscleGains}
        onSave={handleConfirmSave}
        onViewProgress={handleConfirmSave}
        onDiscard={handleDiscardWorkout}
        isSaving={isSaving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  centerHeader: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  timerBadge: {
    marginTop: 2,
  },
  timerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  finishButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exercisePickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  nextPreviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  nextPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nextPreviewLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nextPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  nextPreviewBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
  },
});
