import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Chip } from '../../src/components/Chip';
import { Icon, IconName } from '../../src/components/Icon';
import { exercisesApi } from '../../src/services/api';
import {
  RoutineCategory,
  ROUTINE_CATEGORIES,
  CATEGORY_RECOMMENDATIONS,
  analyzeRoutineCoverage,
  validateRoutineBalance,
  calculateEstimatedDurationMinutes,
  CuratedExerciseItem,
} from '../../src/services/routine/routineRecommender';
import { ROUTINE_TEMPLATES } from '../../src/services/routine/routineTemplates';
import { useRoutineStore, RoutineExerciseData } from '../../src/stores/routineStore';

const MUSCLE_FILTER_OPTIONS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'CORE'];
const EQUIPMENT_FILTER_OPTIONS = ['ALL', 'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine'];
const DIFFICULTY_FILTER_OPTIONS = ['ALL', 'Beginner', 'Intermediate', 'Advanced'];

export default function RoutineBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routineId?: string; templateId?: string; category?: string }>();
  const { colors, typography, spacing } = useTheme();

  const routines = useRoutineStore((s) => s.routines);
  const saveRoutine = useRoutineStore((s) => s.saveRoutine);
  const favoriteNames = useRoutineStore((s) => s.favoriteExerciseNames);
  const toggleFavorite = useRoutineStore((s) => s.toggleFavoriteExercise);
  const startRoutineWorkout = useRoutineStore((s) => s.startRoutineWorkout);

  // Routine Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [category, setCategory] = useState<RoutineCategory>('Leg Day');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<RoutineExerciseData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Add Exercise Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pickerTab, setPickerTab] = useState<'RECOMMENDED' | 'FAVORITES' | 'ALL'>('RECOMMENDED');
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // Preview Modal State
  const [previewVisible, setPreviewVisible] = useState(false);

  // Load Database Exercises
  const dbExercisesQuery = useQuery({
    queryKey: ['routine-db-exercises'],
    queryFn: () => exercisesApi.list({ limit: 80 }),
    staleTime: 1000 * 60 * 10,
  });

  const allDbExercises: any[] = useMemo(() => {
    const items = dbExercisesQuery.data?.items || dbExercisesQuery.data || [];
    return Array.isArray(items) ? items : [];
  }, [dbExercisesQuery.data]);

  // Load initial routine or template
  useEffect(() => {
    if (params.routineId) {
      const existing = routines.find((r) => r.id === params.routineId);
      if (existing) {
        setEditingId(existing.id);
        setRoutineName(existing.name);
        setCategory(existing.category || 'Custom Routine');
        setDescription(existing.description || '');
        setExercises(existing.exercises || []);
        return;
      }
    }

    if (params.templateId) {
      const tpl = ROUTINE_TEMPLATES.find((t) => t.id === params.templateId);
      if (tpl) {
        setRoutineName(tpl.name);
        setCategory(tpl.category);
        setDescription(tpl.description);
        setExercises(
          tpl.exercises.map((e, idx) => ({
            exerciseId: `tpl-ex-${idx}`,
            name: e.name,
            primaryMuscle: e.primaryMuscle,
            order_index: idx + 1,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
            targetRestSec: e.targetRestSec,
            targetDuration: e.targetDuration || 0,
            targetWeight: e.targetWeight || 0,
            notes: e.notes || '',
          }))
        );
        return;
      }
    }

    if (params.category) {
      const matched = ROUTINE_CATEGORIES.find((c) => c.id === params.category);
      if (matched) {
        setCategory(matched.id);
        setRoutineName(`${matched.name} Workout`);
      }
    }
  }, [params.routineId, params.templateId, params.category, routines]);

  // Smart Coverage & Recommendations
  const currentNames = useMemo(() => exercises.map((e) => e.name), [exercises]);
  const coverage = useMemo(() => analyzeRoutineCoverage(category, currentNames), [category, currentNames]);
  const validationAlerts = useMemo(() => validateRoutineBalance(exercises), [exercises]);
  const estimatedMinutes = useMemo(() => calculateEstimatedDurationMinutes(exercises), [exercises]);

  // Handle Category Change
  const handleSelectCategory = (cat: RoutineCategory) => {
    setCategory(cat);
    if (!routineName.trim() || ROUTINE_CATEGORIES.some((c) => routineName.startsWith(c.name))) {
      setRoutineName(`${cat} Workout`);
    }
  };

  // Add exercise directly from suggestion or picker
  const handleAddExercise = (item: {
    name: string;
    primaryMuscle?: string;
    muscle?: string;
    equipment?: string | string[];
    difficulty?: string;
    defaultSets?: number;
    defaultReps?: number;
    defaultRestSec?: number;
    defaultDurationSec?: number;
    isTimed?: boolean;
    id?: string;
  }) => {
    // Prevent duplicate within routine
    if (exercises.some((e) => e.name.toLowerCase() === item.name.toLowerCase())) {
      Alert.alert('Already Added', `${item.name} is already in this routine.`);
      return;
    }

    const muscle = item.primaryMuscle || item.muscle || 'FULL_BODY';
    const isTimed = item.isTimed || item.name.toLowerCase().includes('plank');

    const newExercise: RoutineExerciseData = {
      exerciseId: item.id || `custom-${Date.now()}-${exercises.length}`,
      name: item.name,
      primaryMuscle: muscle,
      order_index: exercises.length + 1,
      targetSets: item.defaultSets || 3,
      targetReps: isTimed ? 1 : (item.defaultReps || 10),
      targetRestSec: item.defaultRestSec || 90,
      targetDuration: isTimed ? (item.defaultDurationSec || 45) : 0,
      targetWeight: 0,
      notes: '',
    };

    setExercises((prev) => [...prev, newExercise]);
  };

  // Remove exercise
  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Reorder exercises: Move Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((e, idx) => ({ ...e, order_index: idx + 1 }));
    });
  };

  // Reorder exercises: Move Down
  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((e, idx) => ({ ...e, order_index: idx + 1 }));
    });
  };

  // Update specific exercise fields
  const handleUpdateExercise = (index: number, patch: Partial<RoutineExerciseData>) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  // Save Routine
  const handleSave = async (andStart: boolean = false) => {
    if (!routineName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your routine.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Empty Routine', 'Please add at least one exercise to your routine.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveRoutine({
        id: editingId || undefined,
        name: routineName.trim(),
        category,
        description: description.trim(),
        exercises,
      });

      if (andStart) {
        startRoutineWorkout(saved);
        router.replace('/workout/active');
      } else {
        Alert.alert('Success', 'Routine saved successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save routine.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Exercises for the Add Exercise Modal
  const modalExercises = useMemo(() => {
    let list: Array<{ name: string; primaryMuscle: string; equipment?: any; difficulty?: string; description?: string; id?: string }> = [];

    if (pickerTab === 'RECOMMENDED') {
      const curated = CATEGORY_RECOMMENDATIONS[category] || [];
      list = curated.map((c) => ({
        name: c.name,
        primaryMuscle: c.muscle,
        equipment: c.equipment,
        difficulty: c.difficulty,
        description: c.description,
      }));
    } else if (pickerTab === 'FAVORITES') {
      list = favoriteNames.map((name) => {
        const found = allDbExercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
        return {
          id: found?.id,
          name,
          primaryMuscle: found?.primaryMuscle || 'FULL_BODY',
          equipment: found?.equipment,
          difficulty: 'Intermediate',
          description: found?.instructions?.[0] || 'Favorite exercise',
        };
      });
    } else {
      // ALL DB EXERCISES
      list = allDbExercises.map((e) => ({
        id: e.id,
        name: e.name,
        primaryMuscle: e.primaryMuscle || 'FULL_BODY',
        equipment: e.equipment,
        difficulty: 'Intermediate',
        description: e.instructions?.[0] || '',
      }));

      // Merge curated items if not in DB list
      const curated = CATEGORY_RECOMMENDATIONS[category] || [];
      curated.forEach((c) => {
        if (!list.some((item) => item.name.toLowerCase() === c.name.toLowerCase())) {
          list.push({
            name: c.name,
            primaryMuscle: c.muscle,
            equipment: c.equipment,
            difficulty: c.difficulty,
            description: c.description,
          });
        }
      });
    }

    // Apply text search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.primaryMuscle.toLowerCase().includes(q) ||
          (Array.isArray(ex.equipment) && ex.equipment.some((eq: string) => eq.toLowerCase().includes(q)))
      );
    }

    // Apply muscle filter
    if (muscleFilter !== 'ALL') {
      list = list.filter((ex) => ex.primaryMuscle.toUpperCase() === muscleFilter);
    }

    // Apply equipment filter
    if (equipmentFilter !== 'ALL') {
      const eqQ = equipmentFilter.toLowerCase();
      list = list.filter((ex) => {
        if (typeof ex.equipment === 'string') return ex.equipment.toLowerCase().includes(eqQ);
        if (Array.isArray(ex.equipment)) return ex.equipment.some((eq: string) => eq.toLowerCase().includes(eqQ));
        return false;
      });
    }

    return list;
  }, [pickerTab, category, favoriteNames, allDbExercises, search, muscleFilter, equipmentFilter]);

  // Helper for exercise vector icons
  const getExerciseIcon = (muscle: string, name: string): IconName => {
    const lower = name.toLowerCase();
    if (lower.includes('squat') || lower.includes('leg press')) return 'exercise-squat';
    if (lower.includes('push-up') || lower.includes('pushup')) return 'exercise-pushup';
    if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('pulldown') || lower.includes('row'))
      return 'exercise-pullup';
    if (lower.includes('plank')) return 'exercise-plank';
    if (lower.includes('lunge') || lower.includes('split squat')) return 'exercise-lunge';
    if (lower.includes('curl')) return 'exercise-curl';
    if (lower.includes('run')) return 'runner';
    if (lower.includes('press') || lower.includes('bench') || lower.includes('deadlift')) return 'barbell';
    return 'dumbbell';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header */}
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navButton} accessibilityLabel="Cancel">
            <Icon name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
              {editingId ? 'Edit Routine' : 'Create Routine'}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'} • ~{estimatedMinutes} min
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setPreviewVisible(true)}
            style={styles.navButton}
            accessibilityLabel="Preview Routine"
          >
            <Icon name="clipboard" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Routine Name & Description */}
          <Card style={styles.cardHeader}>
            <Text style={[typography.captionBold, { color: colors.accent, marginBottom: 6 }]}>
              ROUTINE DETAILS
            </Text>
            <Input
              label="Routine Name"
              placeholder="e.g. Leg Day Hypertrophy"
              value={routineName}
              onChangeText={setRoutineName}
              containerStyle={{ marginBottom: 12 }}
            />

            <Input
              label="Description / Notes (Optional)"
              placeholder="e.g. Focus on deep squat stretch and 2-second eccentric control"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />
          </Card>

          {/* Category Selector */}
          <View style={styles.sectionHeader}>
            <Text style={[typography.captionBold, { color: colors.accent }]}>
              MUSCLE GROUP / CATEGORY
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {ROUTINE_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Icon
                    name={cat.icon}
                    size={16}
                    color={isSelected ? '#000000' : colors.textPrimary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? '#000000' : colors.textPrimary },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Smart Suggestions & Coverage Box */}
          <Card style={[styles.smartCard, { borderColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Icon name="sparkle" size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Smart Coverage: {category}
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 10, lineHeight: 18 }]}>
              {coverage.explanation}
            </Text>

            {/* Quick-add recommended suggestions */}
            {coverage.suggestedAdditions.length > 0 && (
              <>
                <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8, fontSize: 10 }]}>
                  RECOMMENDED ADDITIONS:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {coverage.suggestedAdditions.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[styles.quickAddChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                      onPress={() => handleAddExercise(item)}
                    >
                      <Icon name="plus" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text style={[typography.caption, { color: colors.textPrimary }]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Card>

          {/* Validation & Balance Warnings */}
          {validationAlerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertBox,
                {
                  backgroundColor: alert.type === 'warning' ? 'rgba(255, 149, 0, 0.12)' : 'rgba(0, 240, 255, 0.1)',
                  borderColor: alert.type === 'warning' ? '#FF9500' : '#00F0FF',
                },
              ]}
            >
              <Icon
                name="alert"
                size={16}
                color={alert.type === 'warning' ? '#FF9500' : '#00F0FF'}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.captionBold,
                    { color: alert.type === 'warning' ? '#FF9500' : '#00F0FF' },
                  ]}
                >
                  {alert.title}
                </Text>
                <Text style={[typography.caption, { color: colors.textPrimary, marginTop: 2 }]}>
                  {alert.message}
                </Text>
              </View>
            </View>
          ))}

          {/* Exercise List */}
          <View style={styles.sectionHeader}>
            <Text style={[typography.captionBold, { color: colors.accent }]}>
              EXERCISES IN ROUTINE ({exercises.length})
            </Text>
          </View>

          {exercises.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="dumbbell" size={38} color={colors.accent} style={{ marginBottom: 10 }} />
              <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>No Exercises Added</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 14 }]}>
                Choose from smart recommendations or search the exercise catalog to build your workout.
              </Text>
              <Button
                title="Add Exercise"
                variant="primary"
                leftIcon={<Icon name="plus" size={16} color="#000000" />}
                onPress={() => setAddModalVisible(true)}
              />
            </Card>
          ) : (
            exercises.map((ex, index) => {
              const isTimed = ex.targetDuration !== undefined && ex.targetDuration > 0;
              const isFirst = index === 0;
              const isLast = index === exercises.length - 1;

              return (
                <Card key={`${ex.exerciseId}-${index}`} style={styles.exerciseCard}>
                  {/* Top Bar: Icon, Name, Reorder Handles, Remove */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.reorderControls}>
                      <TouchableOpacity
                        onPress={() => handleMoveUp(index)}
                        disabled={isFirst}
                        style={[styles.arrowButton, { opacity: isFirst ? 0.3 : 1 }]}
                        accessibilityLabel="Move up"
                      >
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '900' }}>▲</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMoveDown(index)}
                        disabled={isLast}
                        style={[styles.arrowButton, { opacity: isLast ? 0.3 : 1 }]}
                        accessibilityLabel="Move down"
                      >
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '900' }}>▼</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.exerciseIconWrap, { backgroundColor: colors.surfaceElevated }]}>
                      <Icon name={getExerciseIcon(ex.primaryMuscle, ex.name)} size={22} color={colors.accent} />
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {index + 1}. {ex.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {ex.primaryMuscle}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(index)}
                      style={styles.deleteButton}
                      accessibilityLabel="Remove exercise"
                    >
                      <Icon name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Steppers & Configuration Grid */}
                  <View style={styles.stepperGrid}>
                    {/* Sets Stepper */}
                    <View style={[styles.stepperBlock, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>SETS</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleUpdateExercise(index, { targetSets: Math.max(1, ex.targetSets - 1) })}
                        >
                          <Text style={[styles.stepperSymbol, { color: colors.accent }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[typography.headingSmall, { color: colors.textPrimary, marginHorizontal: 8 }]}>
                          {ex.targetSets}
                        </Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleUpdateExercise(index, { targetSets: ex.targetSets + 1 })}
                        >
                          <Text style={[styles.stepperSymbol, { color: colors.accent }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Reps or Duration Stepper */}
                    {isTimed ? (
                      <View style={[styles.stepperBlock, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>DURATION</Text>
                        <View style={styles.stepperRow}>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateExercise(index, { targetDuration: Math.max(10, (ex.targetDuration || 45) - 5) })}
                          >
                            <Text style={[styles.stepperSymbol, { color: colors.accent }]}>−</Text>
                          </TouchableOpacity>
                          <Text style={[typography.headingSmall, { color: colors.textPrimary, marginHorizontal: 8 }]}>
                            {ex.targetDuration || 45}s
                          </Text>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateExercise(index, { targetDuration: (ex.targetDuration || 45) + 5 })}
                          >
                            <Text style={[styles.stepperSymbol, { color: colors.accent }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.stepperBlock, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>REPS</Text>
                        <View style={styles.stepperRow}>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateExercise(index, { targetReps: Math.max(1, ex.targetReps - 1) })}
                          >
                            <Text style={[styles.stepperSymbol, { color: colors.accent }]}>−</Text>
                          </TouchableOpacity>
                          <Text style={[typography.headingSmall, { color: colors.textPrimary, marginHorizontal: 8 }]}>
                            {ex.targetReps}
                          </Text>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleUpdateExercise(index, { targetReps: ex.targetReps + 1 })}
                          >
                            <Text style={[styles.stepperSymbol, { color: colors.accent }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Rest Stepper */}
                    <View style={[styles.stepperBlock, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>REST</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleUpdateExercise(index, { targetRestSec: Math.max(15, ex.targetRestSec - 15) })}
                        >
                          <Text style={[styles.stepperSymbol, { color: colors.accent }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[typography.headingSmall, { color: colors.textPrimary, marginHorizontal: 8 }]}>
                          {ex.targetRestSec}s
                        </Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleUpdateExercise(index, { targetRestSec: ex.targetRestSec + 15 })}
                        >
                          <Text style={[styles.stepperSymbol, { color: colors.accent }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Target Weight Input */}
                    <View style={[styles.stepperBlock, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>TARGET KG</Text>
                      <View style={styles.stepperRow}>
                        <TextInput
                          style={[styles.weightInput, { color: colors.textPrimary }]}
                          keyboardType="numeric"
                          value={ex.targetWeight ? String(ex.targetWeight) : ''}
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                          onChangeText={(val) => handleUpdateExercise(index, { targetWeight: parseFloat(val) || 0 })}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Quick Rest Preset Chips */}
                  <View style={styles.presetRow}>
                    <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10, marginRight: 6 }]}>
                      Quick Rest:
                    </Text>
                    {[30, 60, 90, 120].map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor: ex.targetRestSec === sec ? colors.accent : colors.surfaceElevated,
                            borderColor: ex.targetRestSec === sec ? colors.accent : colors.border,
                          },
                        ]}
                        onPress={() => handleUpdateExercise(index, { targetRestSec: sec })}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: ex.targetRestSec === sec ? '#000000' : colors.textSecondary,
                          }}
                        >
                          {sec}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              );
            })
          )}

          {/* Add Exercise Floating Button */}
          {exercises.length > 0 && (
            <Button
              title="Add Another Exercise"
              variant="secondary"
              leftIcon={<Icon name="plus" size={16} color={colors.textPrimary} />}
              onPress={() => setAddModalVisible(true)}
              style={{ marginTop: 12, marginBottom: 24 }}
            />
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button
            title="Preview"
            variant="secondary"
            leftIcon={<Icon name="clipboard" size={16} color={colors.textPrimary} />}
            onPress={() => setPreviewVisible(true)}
            style={{ flex: 1, marginRight: 10 }}
          />
          <Button
            title={isSaving ? 'Saving...' : 'Save Routine'}
            variant="primary"
            loading={isSaving}
            onPress={() => handleSave(false)}
            style={{ flex: 1.5 }}
          />
        </View>

        {/* ========================================================================= */}
        {/* ADD EXERCISE MODAL */}
        {/* ========================================================================= */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setAddModalVisible(false)}
        >
          <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                  Add Exercise
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {category} Recommendations & Database Catalog
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.closeBtn}
                accessibilityLabel="Close"
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.modalTabsRow}>
              {(['RECOMMENDED', 'FAVORITES', 'ALL'] as const).map((tab) => {
                const active = pickerTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.modalTab,
                      {
                        borderBottomColor: active ? colors.accent : 'transparent',
                        borderBottomWidth: 2,
                      },
                    ]}
                    onPress={() => setPickerTab(tab)}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: active ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {tab === 'RECOMMENDED'
                        ? 'Recommended'
                        : tab === 'FAVORITES'
                        ? `Favorites (${favoriteNames.length})`
                        : 'All Exercises'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search Input */}
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <Input
                placeholder="Search exercise by name or muscle..."
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Filter Chips Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {MUSCLE_FILTER_OPTIONS.map((m) => (
                <Chip
                  key={m}
                  label={m === 'ALL' ? 'All Muscles' : m}
                  selected={muscleFilter === m}
                  onPress={() => setMuscleFilter(m)}
                />
              ))}
            </ScrollView>

            {/* Exercises List */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
              {modalExercises.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Icon name="search" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>No Exercises Found</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                    Try adjusting your search terms or filter selections.
                  </Text>
                </View>
              ) : (
                modalExercises.map((ex, idx) => {
                  const isAdded = exercises.some((e) => e.name.toLowerCase() === ex.name.toLowerCase());
                  const isFav = favoriteNames.includes(ex.name);

                  return (
                    <Card key={`${ex.name}-${idx}`} style={styles.pickerCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.exerciseIconWrap, { backgroundColor: colors.surfaceElevated, marginRight: 12 }]}>
                          <Icon name={getExerciseIcon(ex.primaryMuscle, ex.name)} size={22} color={colors.accent} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>
                              {ex.name}
                            </Text>
                            <TouchableOpacity
                              onPress={() => toggleFavorite(ex.name)}
                              style={{ padding: 4 }}
                              accessibilityLabel="Favorite"
                            >
                              <Icon
                                name={isFav ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isFav ? '#FF453A' : colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                            <Text style={[styles.tagBadge, { color: colors.accent }]}>
                              {ex.primaryMuscle}
                            </Text>
                            {ex.equipment && (
                              <Text style={[styles.tagBadge, { color: colors.textSecondary }]}>
                                • {Array.isArray(ex.equipment) ? ex.equipment.join(', ') : ex.equipment}
                              </Text>
                            )}
                          </View>

                          {ex.description ? (
                            <Text
                              style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}
                              numberOfLines={2}
                            >
                              {ex.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                        {isAdded ? (
                          <View style={styles.addedBadge}>
                            <Icon name="check" size={14} color="#34C759" style={{ marginRight: 4 }} />
                            <Text style={[typography.captionBold, { color: '#34C759' }]}>Added to Routine</Text>
                          </View>
                        ) : (
                          <Button
                            title="Add"
                            size="small"
                            variant="secondary"
                            leftIcon={<Icon name="plus" size={12} color={colors.textPrimary} />}
                            onPress={() => handleAddExercise(ex)}
                          />
                        )}
                      </View>
                    </Card>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* ========================================================================= */}
        {/* ROUTINE PREVIEW MODAL */}
        {/* ========================================================================= */}
        <Modal
          visible={previewVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.previewBackdrop}>
            <View style={[styles.previewSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Header */}
              <View style={styles.previewHeader}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '25', borderColor: colors.accent }]}>
                    <Text style={[typography.captionBold, { color: colors.accent, fontSize: 10 }]}>
                      {category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 6 }]}>
                    {routineName || 'Custom Workout'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {exercises.length} Exercises • ~{estimatedMinutes} min
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeBtn}>
                  <Icon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Numbered Exercises List */}
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380, marginVertical: 12 }}>
                {exercises.map((ex, idx) => (
                  <View
                    key={idx}
                    style={[styles.previewRow, { borderBottomColor: colors.border }]}
                  >
                    <View style={[styles.previewNumber, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={[typography.captionBold, { color: colors.accent }]}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{ex.name}</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {ex.targetSets} sets × {ex.targetDuration ? `${ex.targetDuration}s` : `${ex.targetReps} reps`}
                        {ex.targetWeight ? ` • ${ex.targetWeight} kg` : ''}
                        {` • Rest ${ex.targetRestSec}s`}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Preview Actions */}
              <View style={{ gap: 10, marginTop: 8 }}>
                <Button
                  title="Save & Start Workout Now"
                  variant="primary"
                  leftIcon={<Icon name="play" size={16} color="#000000" />}
                  onPress={() => {
                    setPreviewVisible(false);
                    handleSave(true);
                  }}
                />
                <Button
                  title="Save Routine"
                  variant="secondary"
                  leftIcon={<Icon name="check" size={16} color={colors.textPrimary} />}
                  onPress={() => {
                    setPreviewVisible(false);
                    handleSave(false);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardHeader: {
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  smartCard: {
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginVertical: 12,
  },
  exerciseCard: {
    padding: 14,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reorderControls: {
    marginRight: 6,
    alignItems: 'center',
  },
  arrowButton: {
    padding: 2,
  },
  exerciseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 6,
  },
  stepperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepperBlock: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 16,
    fontWeight: '900',
  },
  weightInput: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    minWidth: 44,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  modalTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  pickerCard: {
    padding: 12,
    marginBottom: 8,
  },
  tagBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  previewSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  previewNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});
