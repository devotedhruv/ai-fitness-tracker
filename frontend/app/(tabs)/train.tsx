import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/theme';
import { AppHeader, AppTabBar, AppButton } from '../../src/components/ui';
import { Chip } from '../../src/components/Chip';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { StateView } from '../../src/components/StateView';
import { Icon } from '../../src/components/Icon';
import { useRouter } from 'expo-router';
import { exercisesApi, progressionsApi } from '../../src/services/api';
import { ExerciseDetailModal, ExerciseItem } from '../../src/components/ExerciseDetailModal';
import { useActiveWorkoutStore } from '../../src/stores/activeWorkoutStore';
import { useRoutineStore, CustomRoutine } from '../../src/stores/routineStore';
import { ROUTINE_TEMPLATES } from '../../src/services/routine/routineTemplates';

const MUSCLE_GROUPS = [
  'ALL',
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'CORE',
  'GLUTES',
  'FULL_BODY',
];

export default function TrainScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [segment, setSegment] = useState<'EXERCISE' | 'RUN'>('EXERCISE');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<ExerciseItem | null>(null);

  // Routine Store
  const routines = useRoutineStore((s) => s.routines);
  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);
  const duplicateRoutine = useRoutineStore((s) => s.duplicateRoutine);
  const renameRoutine = useRoutineStore((s) => s.renameRoutine);
  const startRoutineWorkout = useRoutineStore((s) => s.startRoutineWorkout);

  // Routine Options Modal
  const [selectedRoutine, setSelectedRoutine] = useState<CustomRoutine | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  // Exercise query (Unified Gym & Calisthenics exercises)
  const exercisesQuery = useQuery({
    queryKey: ['exercises', segment, selectedMuscle, search],
    queryFn: () =>
      exercisesApi.list({
        type: undefined,
        muscleGroup: selectedMuscle === 'ALL' ? undefined : selectedMuscle,
        search: search.trim() || undefined,
        limit: 25,
      }),
    enabled: segment !== 'RUN',
  });

  // Progression trees query
  const progressionsQuery = useQuery({
    queryKey: ['progressions'],
    queryFn: () => progressionsApi.getTrees(),
    enabled: segment === 'EXERCISE',
  });

  const handleDeleteRoutineConfirm = (routine: CustomRoutine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setOptionsModalVisible(false);
            await deleteRoutine(routine.id);
          },
        },
      ]
    );
  };

  const handleDuplicateRoutine = async (routine: CustomRoutine) => {
    setOptionsModalVisible(false);
    const duplicated = await duplicateRoutine(routine.id);
    if (duplicated) {
      Alert.alert('Duplicated', `Created "${duplicated.name}"`);
    }
  };

  const handleOpenRename = (routine: CustomRoutine) => {
    setOptionsModalVisible(false);
    setSelectedRoutine(routine);
    setRenameText(routine.name);
    setRenameModalVisible(true);
  };

  const handleSaveRename = async () => {
    if (selectedRoutine && renameText.trim()) {
      await renameRoutine(selectedRoutine.id, renameText.trim());
      setRenameModalVisible(false);
      setSelectedRoutine(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Global AppHeader with Brand Logo and Create Action */}
      <AppHeader
        showLogo
        logoVariant="full"
        title="Workouts"
        rightActions={
          <AppButton
            title="Routine"
            size="small"
            variant="outline"
            leftIcon={<Icon name="plus" size={13} color={colors.accent} />}
            onPress={() => router.push('/workout/routine-builder')}
          />
        }
      />

      <View style={[styles.container, { paddingHorizontal: spacing.lg, paddingTop: spacing.xs }]}>
        {/* 2 Main Segments: Exercise (Gym & Calisthenics) | Running */}
        <AppTabBar
          variant="segment"
          tabs={[
            { id: 'EXERCISE', label: 'Exercise (Gym & Skills)' },
            { id: 'RUN', label: 'Running' },
          ]}
          activeTab={segment}
          onTabChange={(id) => setSegment(id as 'EXERCISE' | 'RUN')}
          style={{ marginBottom: spacing.sm, marginTop: 4 }}
        />

        {/* Segment Content */}
        {segment === 'RUN' ? (
          <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
            <Card elevated style={{ marginBottom: spacing.lg }}>
              <Icon name="runner" size={44} color={colors.accent} style={{ marginBottom: 12 }} />
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                Outdoor GPS Run Tracker
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginVertical: 8 }]}>
                Real-time satellite GPS tracking with moving-average route smoothing, kilometer split callouts, and local crash recovery.
              </Text>
              <Button
                title="Launch Run Tracker"
                onPress={() => router.push('/run/active')}
                variant="primary"
                leftIcon={<Icon name="runner" size={16} color={colors.onAccent} />}
              />
            </Card>

            <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 8 }]}>
              Recent Runs
            </Text>
            <Card style={{ marginBottom: 10 }}>
              <View style={styles.runRow}>
                <View>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>Morning 5K</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Yesterday • 5.12 km • 26:14</Text>
                </View>
                <Text style={[typography.bodyBold, { color: colors.accent }]}>5:07 /km</Text>
              </View>
            </Card>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
            {/* Quick Workout Actions */}
            {segment === 'EXERCISE' && (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginVertical: spacing.sm }}>
                  <Button
                    title="Quick Workout"
                    variant="primary"
                    size="small"
                    style={{ flex: 1 }}
                    leftIcon={<Icon name="today" size={15} color={colors.onAccent} />}
                    onPress={() => {
                      useActiveWorkoutStore.getState().startWorkout({
                        name: 'Quick Workout',
                        exercises: [
                          { exercise: { name: 'Lever Pec Deck Fly', primaryMuscle: 'CHEST' }, targetSets: 3, targetReps: 10, targetWeight: 45, targetRestSec: 60 },
                          { exercise: { name: 'Barbell Bench Press', primaryMuscle: 'CHEST' }, targetSets: 3, targetReps: 10, targetWeight: 60, targetRestSec: 90 },
                          { exercise: { name: 'Barbell Squat', primaryMuscle: 'LEGS' }, targetSets: 3, targetReps: 10, targetWeight: 80, targetRestSec: 90 },
                        ],
                      });
                      router.push('/workout/active');
                    }}
                  />
                  <Button
                    title="Create Routine"
                    variant="secondary"
                    size="small"
                    style={{ flex: 1 }}
                    leftIcon={<Icon name="plus" size={14} color={colors.textPrimary} />}
                    onPress={() => router.push('/workout/routine-builder')}
                  />
                </View>

                {/* MY ROUTINES SECTION */}
                <View style={{ marginVertical: 10 }}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[typography.captionBold, { color: colors.accent }]}>
                      MY ROUTINES ({routines.length})
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/workout/routine-builder')}>
                      <Text style={[typography.captionBold, { color: colors.accent }]}>+ New</Text>
                    </TouchableOpacity>
                  </View>

                  {routines.length === 0 ? (
                    <Card style={{ padding: 18, alignItems: 'center' }}>
                      <Icon name="dumbbell" size={30} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>No Custom Routines Yet</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 12 }]}>
                        Create personalized routines for Leg Day, Chest, Push, Pull, and more!
                      </Text>
                      <Button
                        title="Create Routine"
                        size="small"
                        variant="primary"
                        leftIcon={<Icon name="plus" size={12} color="#000000" />}
                        onPress={() => router.push('/workout/routine-builder')}
                      />
                    </Card>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {routines.map((routine) => (
                        <Card
                          key={routine.id}
                          style={[styles.routineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <View style={[styles.categoryBadgeMini, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
                                <Text style={{ fontSize: 9, fontWeight: '800', color: colors.accent }}>
                                  {routine.category?.toUpperCase() || 'CUSTOM'}
                                </Text>
                              </View>
                              <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                                {routine.name}
                              </Text>
                              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                                {routine.exercises?.length || 0} Exercises • ~{routine.estimatedDurationMinutes} min
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                setSelectedRoutine(routine);
                                setOptionsModalVisible(true);
                              }}
                              style={styles.moreIconBtn}
                              accessibilityLabel="Routine Options"
                            >
                              <Icon name="gear" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>

                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
                            <Button
                              title="Start Workout"
                              size="small"
                              variant="primary"
                              leftIcon={<Icon name="play" size={12} color="#000000" />}
                              onPress={() => {
                                startRoutineWorkout(routine);
                                router.push('/workout/active');
                              }}
                              style={{ flex: 1 }}
                            />
                            <TouchableOpacity
                              style={[styles.editRoutineBtn, { borderColor: colors.border }]}
                              onPress={() => router.push(`/workout/routine-builder?routineId=${routine.id}`)}
                              accessibilityLabel="Edit Routine"
                            >
                              <Icon name="edit" size={14} color={colors.textPrimary} />
                            </TouchableOpacity>
                          </View>
                        </Card>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* READY-MADE WORKOUT TEMPLATES */}
                <View style={{ marginVertical: 10 }}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[typography.captionBold, { color: colors.accent }]}>
                      READY-MADE ROUTINE TEMPLATES
                    </Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ROUTINE_TEMPLATES.map((tpl) => (
                      <Card
                        key={tpl.id}
                        style={[styles.templateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <Icon name={tpl.icon} size={18} color={colors.accent} style={{ marginRight: 8 }} />
                          <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                            {tpl.name}
                          </Text>
                        </View>

                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {tpl.exercises.length} Exercises • ~{tpl.estimatedMinutes} min
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10, marginTop: 2 }]} numberOfLines={2}>
                          {tpl.description}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
                          <Button
                            title="Customize"
                            size="small"
                            variant="secondary"
                            onPress={() => router.push(`/workout/routine-builder?templateId=${tpl.id}`)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Start"
                            size="small"
                            variant="primary"
                            leftIcon={<Icon name="play" size={11} color="#000000" />}
                            onPress={() => {
                              useActiveWorkoutStore.getState().startWorkout({
                                name: tpl.name,
                                exercises: tpl.exercises.map((e) => ({
                                  exercise: { name: e.name, primaryMuscle: e.primaryMuscle },
                                  targetSets: e.targetSets,
                                  targetReps: e.targetReps,
                                  targetRestSec: e.targetRestSec,
                                  targetDuration: e.targetDuration,
                                })),
                              });
                              router.push('/workout/active');
                            }}
                            style={{ flex: 0.9 }}
                          />
                        </View>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}

            {/* Search */}
            <Input
              placeholder="Search exercise..."
              value={search}
              onChangeText={setSearch}
              containerStyle={{ marginVertical: spacing.sm }}
            />

            {/* Muscle Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {MUSCLE_GROUPS.map((mg) => (
                <Chip
                  key={mg}
                  label={mg.replace('_', ' ')}
                  selected={selectedMuscle === mg}
                  onPress={() => setSelectedMuscle(mg)}
                />
              ))}
            </ScrollView>

            {/* Calisthenics Progressions Spotlight */}
            {segment === 'EXERCISE' && (
              <View style={{ marginVertical: 12 }}>
                <Text style={[typography.captionBold, { color: colors.accent, marginBottom: 6 }]}>
                  SKILL PROGRESSION TREES
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Push', 'Pull', 'Legs', 'Core', 'Handstand'].map((skill) => (
                    <Card
                      key={skill}
                      style={{ width: 140, marginRight: 10, padding: 12 }}
                      onPress={() => {}}
                    >
                      <Icon name="exercise-plank" size={24} color={colors.accent} style={{ marginBottom: 6 }} />
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{skill}</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>Level 1 to 5</Text>
                    </Card>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Exercise List Results */}
            <StateView
              loading={exercisesQuery.isLoading}
              error={exercisesQuery.error?.message}
              empty={!exercisesQuery.data?.items?.length}
              emptyTitle="No Exercises Found"
              emptyDescription="Try selecting a different muscle group or clear search."
              onRetry={exercisesQuery.refetch}
            >
              {exercisesQuery.data?.items?.map((item: any) => (
                <Card
                  key={item.id}
                  style={{ marginBottom: spacing.sm, padding: spacing.md }}
                  onPress={() => setActiveExerciseModal(item)}
                >
                  <View style={styles.exerciseCardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {item.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {item.primaryMuscle} • {item.equipment?.join(', ') || 'Bodyweight'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[styles.typeBadge, { borderColor: colors.border }]}>
                        <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10 }]}>
                          {item.type}
                        </Text>
                      </View>
                      <View style={styles.aiBadgeSmall}>
                        <Text style={styles.aiBadgeSmallText}>AI</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </StateView>
          </ScrollView>
        )}
      </View>

      {/* Routine Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={[styles.optionsSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 12 }]}>
              {selectedRoutine?.name}
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setOptionsModalVisible(false);
                if (selectedRoutine) {
                  router.push(`/workout/routine-builder?routineId=${selectedRoutine.id}`);
                }
              }}
            >
              <Icon name="edit" size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[typography.body, { color: colors.textPrimary }]}>Edit Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => selectedRoutine && handleDuplicateRoutine(selectedRoutine)}
            >
              <Icon name="folder" size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[typography.body, { color: colors.textPrimary }]}>Duplicate Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => selectedRoutine && handleOpenRename(selectedRoutine)}
            >
              <Icon name="sparkle" size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[typography.body, { color: colors.textPrimary }]}>Rename Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 }]}
              onPress={() => selectedRoutine && handleDeleteRoutineConfirm(selectedRoutine)}
            >
              <Icon name="close" size={18} color="#FF453A" style={{ marginRight: 12 }} />
              <Text style={[typography.body, { color: '#FF453A' }]}>Delete Routine</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Routine Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.renameDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 12 }]}>
              Rename Routine
            </Text>
            <TextInput
              style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button
                title="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setRenameModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save"
                variant="primary"
                size="small"
                onPress={handleSaveRename}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Detail Modal with direct AI Camera Posture Coach CTA */}
      <ExerciseDetailModal
        exercise={activeExerciseModal}
        visible={!!activeExerciseModal}
        onClose={() => setActiveExerciseModal(null)}
        onStartCameraTracking={(exercise) => {
          router.push({
            pathname: '/workout/vision-tracker',
            params: {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              primaryMuscle: exercise.primaryMuscle,
            },
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  createRoutineHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineCard: {
    width: 230,
    marginRight: 12,
    padding: 14,
  },
  categoryBadgeMini: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  moreIconBtn: {
    padding: 6,
  },
  editRoutineBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCard: {
    width: 220,
    marginRight: 12,
    padding: 14,
  },
  runRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  aiBadgeSmallText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsSheet: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  renameDialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  renameInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
});
