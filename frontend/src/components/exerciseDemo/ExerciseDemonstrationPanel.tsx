import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { ExerciseMediaViewer } from './ExerciseMediaViewer';
import { exerciseMediaManager } from '../../services/exerciseMedia/ExerciseMediaProvider';
import { ActiveWorkoutExercise } from '../../stores/activeWorkoutStore';

interface ExerciseDemonstrationPanelProps {
  exercise: ActiveWorkoutExercise;
  currentSetIndex?: number;
  onOpenDetails: (exercise: ActiveWorkoutExercise) => void;
  onDoExercise?: (exercise: ActiveWorkoutExercise) => void;
  style?: StyleProp<ViewStyle>;
}

export function ExerciseDemonstrationPanel({
  exercise,
  currentSetIndex = 0,
  onOpenDetails,
  onDoExercise,
  style,
}: ExerciseDemonstrationPanelProps) {
  const { colors } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  let router: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useRouter } = require('expo-router');
    router = useRouter();
  } catch {
    // Fallback if expo-router is not available
  }

  // Resolve media and movement cues
  const media = exerciseMediaManager.getMedia({
    id: exercise.exerciseId,
    name: exercise.exerciseName,
    primaryMuscle: exercise.primaryMuscle,
  });

  const activeSet = exercise.sets[currentSetIndex] || exercise.sets[0];

  const handleDoExercise = () => {
    if (onDoExercise) {
      onDoExercise(exercise);
    } else if (router) {
      router.push({
        pathname: '/workout/vision-tracker',
        params: {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          primaryMuscle: exercise.primaryMuscle,
          fromActiveWorkout: 'true',
          activeSetNumber: String(activeSet?.setNumber || 1),
        },
      });
    }
  };

  return (
    <View style={[styles.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {/* Panel Top Title Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <View style={[styles.targetBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}>
              <Text style={[styles.targetBadgeText, { color: colors.accent }]}>
                {exercise.primaryMuscle.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Movement Guide
            </Text>
          </View>
          <Text style={[styles.exerciseTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {exercise.exerciseName}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => onOpenDetails(exercise)}
            accessibilityLabel="Open exercise instructions"
          >
            <Icon name="info" size={16} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => setIsCollapsed(!isCollapsed)}
            accessibilityLabel={isCollapsed ? 'Expand demonstration' : 'Collapse demonstration'}
          >
            <Icon name={isCollapsed ? 'chevron-right' : 'close'} size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {!isCollapsed && (
        <>
          {/* Multi-Media Demonstration (Video / 2D Kinematics / 3D Anatomy) */}
          <ExerciseMediaViewer
            media={media}
            aspectRatio={16 / 9}
            fitMode="cover"
            showModeSwitcher={true}
            onTap={() => onOpenDetails(exercise)}
            onDoExercise={handleDoExercise}
            setNumber={activeSet?.setNumber || 1}
            style={styles.animationWrap}
          />

          {/* Form Cues Bullet List */}
          <View style={[styles.cuesContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.cuesHeaderRow}>
              <Icon name="sparkle" size={14} color={colors.accent} />
              <Text style={[styles.cuesHeaderTitle, { color: colors.accent }]}>
                KEY EXECUTION CUES
              </Text>
            </View>
            {media.tips.slice(0, 3).map((tip, idx) => (
              <View key={idx} style={styles.cueRow}>
                <View style={[styles.cueBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.cueText, { color: colors.textPrimary }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          {/* Active Set Summary Bar */}
          <View style={[styles.activeSetBar, { borderTopColor: colors.border }]}>
            <View style={styles.setStat}>
              <Text style={[styles.setStatLabel, { color: colors.mutedText }]}>CURRENT SET</Text>
              <Text style={[styles.setStatValue, { color: colors.textPrimary }]}>
                #{activeSet?.setNumber || 1}
              </Text>
            </View>
            <View style={styles.setStat}>
              <Text style={[styles.setStatLabel, { color: colors.mutedText }]}>TARGET</Text>
              <Text style={[styles.setStatValue, { color: colors.textPrimary }]}>
                {activeSet?.weightKg ? `${activeSet.weightKg} kg × ` : ''}{activeSet?.reps || 10} reps
              </Text>
            </View>
            <View style={styles.setStat}>
              <Text style={[styles.setStatLabel, { color: colors.mutedText }]}>REST</Text>
              <Text style={[styles.setStatValue, { color: colors.accent }]}>
                {exercise.targetRestSec || 90}s
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.fullGuideBtn, { backgroundColor: colors.accent }]}
              onPress={() => onOpenDetails(exercise)}
            >
              <Text style={[styles.fullGuideText, { color: colors.onAccent }]}>View Guide</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panelCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  targetBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationWrap: {
    marginBottom: 12,
  },
  cuesContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cuesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cuesHeaderTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  cueBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  cueText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  activeSetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  setStat: {
    alignItems: 'flex-start',
  },
  setStatLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  setStatValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    marginTop: 2,
  },
  fullGuideBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fullGuideText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
  },
});
