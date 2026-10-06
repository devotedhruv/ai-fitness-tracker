import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../tokens/ThemeContext';
import { Button } from './Button';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { ExerciseMediaViewer } from './exerciseDemo/ExerciseMediaViewer';
import { exerciseMediaManager } from '../services/exerciseMedia/ExerciseMediaProvider';

export interface ExerciseItem {
  id: string;
  name: string;
  type: 'GYM' | 'CALISTHENICS';
  primaryMuscle: string;
  secondaryMuscles?: string[];
  muscleGroups?: string[];
  equipment?: string[];
  overview?: string;
  instructions?: string[];
  formTips?: string[];
  commonMistakes?: string[];
  variations?: string[];
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface ExerciseDetailModalProps {
  exercise: ExerciseItem | null;
  visible: boolean;
  onClose: () => void;
  onStartCameraTracking: (exercise: ExerciseItem) => void;
  onLogManually?: (exercise: ExerciseItem) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  visible,
  onClose,
  onStartCameraTracking,
  onLogManually,
}) => {
  const { colors, typography, spacing } = useTheme();

  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Drag handle / close row */}
          <View style={styles.topRow}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close Details"
            >
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header: Title and Badges */}
            <View style={styles.headerBlock}>
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: colors.accent + '25', borderColor: colors.accent }]}>
                  <Text style={[styles.typeBadgeText, { color: colors.accent }]}>
                    {exercise.type}
                  </Text>
                </View>
                <View style={styles.aiReadyBadge}>
                  <Icon name="camera" size={12} color="#34C759" style={{ marginRight: 4 }} />
                  <Text style={styles.aiReadyBadgeText}>AI Camera Ready</Text>
                </View>
              </View>

              <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 8 }]}>
                {exercise.name}
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                Primary: <Text style={{ color: colors.accent, fontWeight: '700' }}>{exercise.primaryMuscle.replace('_', ' ')}</Text>
                {exercise.equipment && exercise.equipment.length > 0 && ` • Equipment: ${exercise.equipment.join(', ')}`}
              </Text>
            </View>

            {/* Visual Multi-Media Exercise Demonstration */}
            {(() => {
              const media = exerciseMediaManager.getMedia({
                id: exercise.id,
                name: exercise.name,
                primaryMuscle: exercise.primaryMuscle,
                secondaryMuscles: exercise.secondaryMuscles,
                equipment: exercise.equipment,
                overview: exercise.overview,
                instructions: exercise.instructions,
                formTips: exercise.formTips,
                commonMistakes: exercise.commonMistakes,
                variations: exercise.variations,
                videoUrl: exercise.videoUrl,
                imageUrl: exercise.imageUrl,
                thumbnailUrl: exercise.thumbnailUrl,
              });

              return (
                <View style={{ marginBottom: 14 }}>
                  <ExerciseMediaViewer
                    media={media}
                    height={210}
                    showModeSwitcher={true}
                    onDoExercise={() => {
                      onClose();
                      try {
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const { router } = require('expo-router');
                        router.push({
                          pathname: '/workout/vision-tracker',
                          params: {
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                            primaryMuscle: exercise.primaryMuscle,
                          },
                        });
                      } catch {}
                    }}
                  />

                  {media.breathing ? (
                    <View style={[styles.breathingBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Text style={[styles.breathingLabel, { color: colors.accent }]}>BREATHING CADENCE</Text>
                      <Text style={[styles.breathingText, { color: colors.textPrimary }]}>{media.breathing}</Text>
                    </View>
                  ) : null}

                  {media.overview ? (
                    <View style={[styles.breathingBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, marginTop: 8 }]}>
                      <Text style={[styles.breathingLabel, { color: colors.accent }]}>OVERVIEW</Text>
                      <Text style={[styles.breathingText, { color: colors.textPrimary }]}>{media.overview}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })()}

            {/* AI Camera Callout Feature Box */}
            <View style={[styles.aiFeatureCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
              <View style={styles.aiFeatureRow}>
                <Icon name="camera" size={28} color={colors.accent} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    Real-Time Camera Posture Check
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    MediaPipe 3D computer vision validates your form in real-time. Flawed reps with bad posture are rejected so you only log clean reps.
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 8 }]}>
                  Instructions
                </Text>
                {exercise.instructions.map((step, idx) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={[styles.stepNumberBadge, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={[styles.stepNumberText, { color: colors.accent }]}>{idx + 1}</Text>
                    </View>
                    <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Form Tips */}
            {exercise.formTips && exercise.formTips.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 8 }]}>
                  Key Form Tips
                </Text>
                {exercise.formTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Icon name="check" size={16} color="#34C759" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Common Mistakes */}
            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 8 }]}>
                  Common Mistakes to Avoid
                </Text>
                {exercise.commonMistakes.map((mistake, idx) => (
                  <View key={idx} style={styles.mistakeRow}>
                    <Icon name="close" size={16} color="#FF453A" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={[typography.body, { color: '#FF453A', flex: 1 }]}>
                      {mistake}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Variations */}
            {exercise.variations && exercise.variations.length > 0 && (
              <View style={styles.section}>
                <Text style={[typography.headingSmall, { color: colors.textPrimary, marginBottom: 8 }]}>
                  Variations
                </Text>
                {exercise.variations.map((variation, idx) => (
                  <View key={idx} style={[styles.tipRow, { backgroundColor: colors.surfaceElevated, padding: 10, borderRadius: 8, marginBottom: 6 }]}>
                    <Icon name="refresh" size={15} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                      {variation}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Spacer for sticky buttons */}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <SafeAreaView style={[styles.footerActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Button
              title="Track Form with Camera (AI)"
              leftIcon={<Icon name="camera" size={18} color="#000000" />}
              variant="primary"
              onPress={() => {
                onClose();
                onStartCameraTracking(exercise);
              }}
            />
            {onLogManually && (
              <>
                <View style={{ height: 8 }} />
                <Button
                  title="Log Set Manually"
                  variant="secondary"
                  onPress={() => {
                    onClose();
                    onLogManually(exercise);
                  }}
                />
              </>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  topRow: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  headerBlock: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  aiReadyBadgeText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '800',
  },
  aiFeatureCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  aiFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipCheck: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 10,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  mistakeCross: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 10,
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  breathingBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  breathingLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breathingText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
});
