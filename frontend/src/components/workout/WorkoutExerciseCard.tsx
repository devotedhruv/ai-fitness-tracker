import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  ActiveWorkoutExercise,
  ActiveWorkoutSet,
  useActiveWorkoutStore,
} from '../../stores/activeWorkoutStore';
import { useTheme } from '../../tokens/ThemeContext';
import { Card } from '../Card';
import { PlateCalculatorModal } from '../plates/PlateCalculatorModal';
import { Icon } from '../Icon';


interface WorkoutExerciseCardProps {
  exercise: ActiveWorkoutExercise;
  exerciseIndex: number;
  onLaunchCamera: (exercise: ActiveWorkoutExercise, setNumber: number) => void;
  onOpenDemo?: (exercise: ActiveWorkoutExercise) => void;
}

export function WorkoutExerciseCard({
  exercise,
  exerciseIndex,
  onLaunchCamera,
  onOpenDemo,
}: WorkoutExerciseCardProps) {
  const { colors, typography } = useTheme();
  const addSet = useActiveWorkoutStore((state) => state.addSet);
  const removeSet = useActiveWorkoutStore((state) => state.removeSet);
  const updateSet = useActiveWorkoutStore((state) => state.updateSet);
  const toggleCompleteSet = useActiveWorkoutStore((state) => state.toggleCompleteSet);
  const removeExercise = useActiveWorkoutStore((state) => state.removeExercise);

  const [activePlateSetIdx, setActivePlateSetIdx] = useState<number | null>(null);


  return (
    <Card style={styles.cardContainer}>
      {/* Exercise Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onOpenDemo?.(exercise)}
          activeOpacity={0.7}
        >
          <View style={styles.titleBadgeRow}>
            <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
              {exercise.exerciseName}
            </Text>
            {exercise.supersetGroupId && (
              <View style={[styles.supersetBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.supersetBadgeText}>{exercise.supersetGroupId}</Text>
              </View>
            )}
            {onOpenDemo && (
              <View style={[styles.viewDemoBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}>
                <Icon name="play" size={10} color={colors.accent} />
                <Text style={[styles.viewDemoBadgeText, { color: colors.accent }]}>View Demo</Text>
              </View>
            )}
          </View>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {exercise.primaryMuscle} • Rest: {exercise.targetRestSec}s
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => removeExercise(exerciseIndex)}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Table Headers */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.colHeader, { width: 36, color: colors.textSecondary }]}>SET</Text>
        <Text style={[styles.colHeader, { width: 68, color: colors.textSecondary }]}>PREV</Text>
        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>KG</Text>
        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>REPS</Text>
        <Text style={[styles.colHeader, { width: 44, textAlign: 'center', color: colors.textSecondary }]}>AI</Text>
        <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={12} color={colors.textSecondary} />
        </View>
      </View>

      {/* Set Rows */}
      {exercise.sets.map((s: ActiveWorkoutSet, setIdx: number) => {
        const isWarmup = s.isWarmup;
        const isDone = s.isCompleted;

        return (
          <View
            key={s.id}
            style={[
              styles.setRow,
              {
                backgroundColor: isDone
                  ? 'rgba(52, 199, 89, 0.12)'
                  : isWarmup
                  ? 'rgba(255, 149, 0, 0.08)'
                  : 'transparent',
                borderColor: isDone ? 'rgba(52, 199, 89, 0.3)' : 'transparent',
              },
            ]}
          >
            {/* Set Number */}
            <TouchableOpacity
              style={styles.setNumberCol}
              onPress={() => updateSet(exerciseIndex, setIdx, { isWarmup: !s.isWarmup })}
            >
              <Text
                style={[
                  typography.captionBold,
                  {
                    color: isWarmup ? '#FF9500' : colors.textPrimary,
                    fontSize: 13,
                  },
                ]}
              >
                {isWarmup ? 'W' : s.setNumber}
              </Text>
            </TouchableOpacity>

            {/* Previous Set Stats */}
            <View style={styles.prevCol}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, fontSize: 11 },
                ]}
                numberOfLines={1}
              >
                {s.previous ? `${s.previous.weightKg}k × ${s.previous.reps}` : '—'}
              </Text>
            </View>

            {/* Weight Input + Plate Calculator Trigger */}
            <View style={[styles.inputCol, { position: 'relative' }]}>
              <TextInput
                style={[
                  styles.numInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    paddingRight: 16,
                  },
                ]}
                keyboardType="numeric"
                selectTextOnFocus
                value={s.weightKg === 0 ? '' : String(s.weightKg)}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                onChangeText={(val) => {
                  const num = parseFloat(val) || 0;
                  updateSet(exerciseIndex, setIdx, { weightKg: num });
                }}
              />
              <TouchableOpacity
                style={styles.plateMathIcon}
                onPress={() => setActivePlateSetIdx(setIdx)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="barbell" size={13} color={colors.accent} />
              </TouchableOpacity>
            </View>


            {/* Reps Input */}
            <View style={styles.inputCol}>
              <TextInput
                style={[
                  styles.numInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                keyboardType="number-pad"
                selectTextOnFocus
                value={s.reps === 0 ? '' : String(s.reps)}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                onChangeText={(val) => {
                  const num = parseInt(val, 10) || 0;
                  updateSet(exerciseIndex, setIdx, { reps: num });
                }}
              />
            </View>

            {/* AI Camera Button */}
            <TouchableOpacity
              style={[
                styles.aiLaunchBtn,
                {
                  backgroundColor: 'rgba(52, 199, 89, 0.12)',
                  borderColor: '#34C759',
                },
              ]}
              onPress={() => onLaunchCamera(exercise, s.setNumber)}
              accessibilityLabel={`Launch AI Camera for Set ${s.setNumber}`}
            >
              <Icon name="camera" size={14} color="#34C759" />
            </TouchableOpacity>

            {/* Complete Checkbox */}
            <TouchableOpacity
              style={[
                styles.checkBtn,
                {
                  backgroundColor: isDone ? '#34C759' : colors.surface,
                  borderColor: isDone ? '#34C759' : colors.border,
                },
              ]}
              onPress={() => toggleCompleteSet(exerciseIndex, setIdx)}
              accessibilityLabel={`Check set ${s.setNumber} as done`}
            >
              <Icon
                name="check"
                size={14}
                color={isDone ? '#FFFFFF' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Card Actions Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.addSetBtn, { borderColor: colors.border }]}
          onPress={() => addSet(exerciseIndex, false)}
        >
          <Text style={[typography.captionBold, { color: colors.accent }]}>
            + Add Set
          </Text>
        </TouchableOpacity>

        {exercise.sets.length > 1 && (
          <TouchableOpacity
            style={styles.delSetBtn}
            onPress={() => removeSet(exerciseIndex, exercise.sets.length - 1)}
          >
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Remove Set
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Plate Calculator Modal */}
      {activePlateSetIdx !== null && (
        <PlateCalculatorModal
          visible={true}
          initialWeight={exercise.sets[activePlateSetIdx]?.weightKg || 60}
          unit="METRIC"
          onClose={() => setActivePlateSetIdx(null)}
          onApplyWeight={(appliedWeight) => {
            if (activePlateSetIdx !== null) {
              updateSet(exerciseIndex, activePlateSetIdx, { weightKg: appliedWeight });
            }
          }}
        />
      )}
    </Card>
  );
}


const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 14,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supersetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  supersetBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  moreButton: {
    padding: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 2,
  },
  setNumberCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevCol: {
    width: 68,
    justifyContent: 'center',
  },
  inputCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  numInput: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  aiLaunchBtn: {
    width: 38,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  aiLaunchText: {
    fontSize: 14,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  checkText: {
    fontSize: 16,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addSetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  delSetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  plateMathIcon: {
    position: 'absolute',
    right: 6,
    top: 10,
    opacity: 0.65,
  },
  viewDemoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    marginLeft: 8,
  },
  viewDemoBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
  },
});

