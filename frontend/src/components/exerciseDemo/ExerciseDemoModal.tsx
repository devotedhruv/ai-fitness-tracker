import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { ExerciseMediaViewer } from './ExerciseMediaViewer';
import { exerciseMediaManager } from '../../services/exerciseMedia/ExerciseMediaProvider';

export interface ExerciseDemoItem {
  id?: string;
  name: string;
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  equipment?: string[];
  overview?: string;
  instructions?: string[];
  formTips?: string[];
  breathing?: string;
  commonMistakes?: string[];
  variations?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  media?: any;
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

interface ExerciseDemoModalProps {
  exercise: ExerciseDemoItem | null;
  visible: boolean;
  onClose: () => void;
  onStartCameraTracking?: (exercise: ExerciseDemoItem) => void;
}

export function ExerciseDemoModal({
  exercise,
  visible,
  onClose,
  onStartCameraTracking,
}: ExerciseDemoModalProps) {
  const { colors, typography } = useTheme();

  const [activeTab, setActiveTab] = useState<'GUIDE' | 'AI_CUES' | 'MUSCLES'>('GUIDE');

  if (!exercise) return null;

  const media = exerciseMediaManager.getMedia({
    id: exercise.id,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    overview: exercise.overview,
    instructions: exercise.instructions,
    formTips: exercise.formTips,
    breathing: exercise.breathing,
    commonMistakes: exercise.commonMistakes,
    variations: exercise.variations,
    media: exercise.media,
    videoUrl: exercise.videoUrl,
    imageUrl: exercise.imageUrl,
    thumbnailUrl: exercise.thumbnailUrl,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Top Header */}
          <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="chevron-left" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={[typography.headingSmall, { color: colors.textPrimary }]} numberOfLines={1}>
                {exercise.name}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.accent }]}>
                {media.primaryMuscles.join(' • ')} {exercise.equipment?.length ? `• ${exercise.equipment[0]}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Multi-Media Demonstration (Video / 2D Kinematics / 3D Anatomy) */}
            <ExerciseMediaViewer
              media={media}
              aspectRatio={16 / 9}
              fitMode="cover"
              showModeSwitcher={true}
              onDoExercise={() => {
                onClose();
                if (onStartCameraTracking) {
                  onStartCameraTracking(exercise);
                } else {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const { router } = require('expo-router');
                    router.push({
                      pathname: '/workout/vision-tracker',
                      params: {
                        exerciseId: exercise.id || '',
                        exerciseName: exercise.name,
                        primaryMuscle: exercise.primaryMuscle || '',
                        fromActiveWorkout: 'true',
                      },
                    });
                  } catch {}
                }
              }}
              style={styles.animationModel}
            />

            {/* Navigation Tabs (Guide / AI Cues / Muscle Map) */}
            <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'GUIDE' && { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
                ]}
                onPress={() => setActiveTab('GUIDE')}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'GUIDE' ? colors.accent : colors.textSecondary },
                  ]}
                >
                  Movement Guide
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'AI_CUES' && { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
                ]}
                onPress={() => setActiveTab('AI_CUES')}
              >
                <Icon name="sparkle" size={13} color={activeTab === 'AI_CUES' ? colors.accent : colors.textSecondary} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'AI_CUES' ? colors.accent : colors.textSecondary },
                  ]}
                >
                  AI Form Cues
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'MUSCLES' && { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
                ]}
                onPress={() => setActiveTab('MUSCLES')}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'MUSCLES' ? colors.accent : colors.textSecondary },
                  ]}
                >
                  Muscles
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab: MOVEMENT GUIDE */}
            {activeTab === 'GUIDE' && (
              <>
                {/* ExerciseDB Overview */}
                {media.overview ? (
                  <View style={[styles.overviewCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.overviewHeader}>
                      <Icon name="info" size={14} color={colors.accent} />
                      <Text style={[styles.overviewTitle, { color: colors.accent }]}>
                        OVERVIEW & PURPOSE
                      </Text>
                    </View>
                    <Text style={[styles.overviewBody, { color: colors.textPrimary }]}>
                      {media.overview}
                    </Text>
                  </View>
                ) : null}

                {/* Breathing Guidance Callout */}
                {media.breathing ? (
                  <View style={[styles.breathingCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.breathingHeader}>
                      <Icon name="snowflake" size={16} color={colors.accent} />
                      <Text style={[styles.breathingTitle, { color: colors.accent }]}>
                        BREATHING CADENCE
                      </Text>
                    </View>
                    <Text style={[styles.breathingBody, { color: colors.textPrimary }]}>
                      {media.breathing}
                    </Text>
                  </View>
                ) : null}

                {/* Step-by-Step Instructions */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    How to perform
                  </Text>
                  {media.instructions.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={[styles.stepBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}>
                        <Text style={[styles.stepBadgeText, { color: colors.accent }]}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, { color: colors.textPrimary }]}>{step}</Text>
                    </View>
                  ))}
                </View>

                {/* Coaching Tips */}
                {media.tips && media.tips.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Execution Tips
                    </Text>
                    {media.tips.map((tip, idx) => (
                      <View key={idx} style={[styles.cueCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                        <Icon name="check" size={14} color={colors.accent} />
                        <Text style={[styles.cueCardText, { color: colors.textPrimary }]}>
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Exercise Variations */}
                {media.variations && media.variations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Exercise Variations
                    </Text>
                    {media.variations.map((variation, idx) => (
                      <View key={idx} style={[styles.variationCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                        <Icon name="refresh" size={14} color={colors.accent} />
                        <Text style={[styles.variationText, { color: colors.textPrimary }]}>
                          {variation}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Common Mistakes */}
                {media.commonMistakes.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Mistakes to avoid
                    </Text>
                    {media.commonMistakes.map((mistake, idx) => (
                      <View key={idx} style={styles.mistakeRow}>
                        <Icon name="close" size={16} color={colors.error} />
                        <Text style={[styles.mistakeText, { color: colors.textSecondary }]}>
                          {mistake}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Tab: AI FORM CUES */}
            {activeTab === 'AI_CUES' && (
              <View style={styles.section}>
                <View style={[styles.aiNoticeCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}>
                  <Icon name="sparkle" size={20} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.aiNoticeTitle, { color: colors.textPrimary }]}>
                      Automated Form Coaching Engine
                    </Text>
                    <Text style={[styles.aiNoticeBody, { color: colors.textSecondary }]}>
                      Kinematic positioning cues tailored to this movement pattern to optimize neuromuscular recruitment and barbell velocity.
                    </Text>
                  </View>
                </View>

                {media.aiCues.map((cue, idx) => (
                  <View key={idx} style={[styles.cueCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <Icon name="check" size={16} color={colors.accent} />
                    <Text style={[styles.cueCardText, { color: colors.textPrimary }]}>
                      {cue}
                    </Text>
                  </View>
                ))}

                {onStartCameraTracking && (
                  <View style={{ marginTop: 14 }}>
                    <Button
                      title="Launch AI Camera Tracker"
                      variant="primary"
                      leftIcon={<Icon name="camera" size={16} color={colors.onAccent} />}
                      onPress={() => {
                        onClose();
                        onStartCameraTracking(exercise);
                      }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Tab: MUSCLE HIGHLIGHTING */}
            {activeTab === 'MUSCLES' && (
              <View style={styles.section}>
                {/* Primary Muscles */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Primary Target Muscles (Electric Lime)
                </Text>
                <View style={styles.pillsWrap}>
                  {media.primaryMuscles.map((muscle, idx) => (
                    <View key={idx} style={[styles.musclePillPrimary, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.musclePillPrimaryText, { color: colors.onAccent }]}>
                        {muscle.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Secondary Muscles */}
                {media.secondaryMuscles.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>
                      Secondary Stabilizers (Accent Bright)
                    </Text>
                    <View style={styles.pillsWrap}>
                      {media.secondaryMuscles.map((muscle, idx) => (
                        <View
                          key={idx}
                          style={[styles.musclePillSecondary, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                        >
                          <Text style={[styles.musclePillSecondaryText, { color: colors.textSecondary }]}>
                            {muscle}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Equipment & Difficulty */}
                <View style={[styles.metaGrid, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.mutedText }]}>EQUIPMENT</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                      {media.equipment.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.mutedText }]}>DIFFICULTY</Text>
                    <Text style={[styles.metaValue, { color: colors.accent }]}>
                      {exercise.difficulty || 'INTERMEDIATE'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Done Button */}
          <SafeAreaView style={[styles.footerBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <Button title="Back to Workout" variant="primary" onPress={onClose} />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 8, 18, 0.8)',
  },
  sheetContainer: {
    maxHeight: '92%',
    minHeight: 520,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  animationModel: {
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabItemText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  breathingCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  breathingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  breathingTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  breathingBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
  },
  stepText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  mistakeText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    flex: 1,
  },
  aiNoticeCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
  },
  aiNoticeTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    marginBottom: 4,
  },
  aiNoticeBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    lineHeight: 17,
  },
  cueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  cueCardText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    flex: 1,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  musclePillPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  musclePillPrimaryText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  musclePillSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  musclePillSecondaryText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
  },
  metaGrid: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 20,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    marginTop: 4,
  },
  overviewCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  overviewTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  overviewBody: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    lineHeight: 19,
  },
  variationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  variationText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    flex: 1,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
