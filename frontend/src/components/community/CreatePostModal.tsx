import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';
import {
  useSocialStore,
  PostType,
  PostVisibility,
} from '../../stores/socialStore';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({
  visible,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { colors } = useTheme();
  const currentUser = useSocialStore((state) => state.currentUser);
  const createPost = useSocialStore((state) => state.createPost);

  const [postType, setPostType] = useState<PostType>('TRAINING');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('EVERYONE');

  // PR specific inputs
  const [prExercise, setPrExercise] = useState('Barbell Overhead Press');
  const [prWeight, setPrWeight] = useState('85');
  const [prReps, setPrReps] = useState('5');
  const [prPrevWeight, setPrPrevWeight] = useState('75');

  // Workout specific inputs
  const [workoutTitle, setWorkoutTitle] = useState('Upper Body Hypertrophy');
  const [workoutDuration, setWorkoutDuration] = useState('55');

  // Progress specific inputs
  const [progressWeight, setProgressWeight] = useState('78.5');
  const [hideWeight, setHideWeight] = useState(false);

  // Achievement specific inputs
  const [disciplineCategory, setDisciplineCategory] = useState<'TAPAS' | 'BALA' | 'VIRYA' | 'SADHANA' | 'VAJRA'>('TAPAS');
  const [achievementTitle, setAchievementTitle] = useState('30-Day Sadhana Streak');

  if (!visible) return null;

  const handlePublish = () => {
    if (!caption.trim() && postType === 'TRAINING') {
      Alert.alert('Required', 'Please write some training notes or reflections.');
      return;
    }

    let workoutData;
    let prData;
    let progressData;
    let achievementData;

    if (postType === 'WORKOUT') {
      workoutData = {
        workoutName: workoutTitle.trim() || 'Custom Training Session',
        durationMinutes: parseInt(workoutDuration, 10) || 45,
        exercisesCount: 4,
        setsCount: 14,
        totalVolumeKg: 9400,
        prsCount: 1,
        streakDays: currentUser.stats?.streakDays ?? currentUser.streakDays ?? 14,
        exercises: [
          {
            exerciseName: 'Barbell Bench Press',
            category: 'Chest',
            topWeightKg: 90,
            totalVolumeKg: 3600,
            sets: [
              { setNumber: 1, weightKg: 70, reps: 10 },
              { setNumber: 2, weightKg: 80, reps: 8 },
              { setNumber: 3, weightKg: 90, reps: 6, isPR: true },
            ],
          },
          {
            exerciseName: 'Incline Dumbbell Press',
            category: 'Chest',
            topWeightKg: 32,
            totalVolumeKg: 1920,
            sets: [
              { setNumber: 1, weightKg: 28, reps: 10 },
              { setNumber: 2, weightKg: 32, reps: 8 },
            ],
          },
        ],
      };
    } else if (postType === 'PERSONAL_RECORD') {
      const curr = parseFloat(prWeight) || 100;
      const prev = parseFloat(prPrevWeight) || 90;
      const reps = parseInt(prReps, 10) || 5;
      const gain = Math.round(((curr - prev) / prev) * 100);
      const est1RM = Math.round(curr * (1 + reps / 30));

      prData = {
        exerciseName: prExercise,
        currentWeightKg: curr,
        currentReps: reps,
        previousWeightKg: prev,
        previousReps: reps,
        percentGain: Math.max(1, gain),
        estimated1RM: est1RM,
      };
    } else if (postType === 'PROGRESS') {
      progressData = {
        measurementDate: new Date().toISOString(),
        bodyWeightKg: parseFloat(progressWeight) || 75,
        hideWeight,
        strengthSummary: caption.trim() || 'Consistent physical transformation through daily work.',
      };
    } else if (postType === 'ACHIEVEMENT') {
      achievementData = {
        achievementTitle,
        achievementBadgeName: `${disciplineCategory} PILLAR`,
        disciplineCategory,
        milestoneValue: 'Milestone Achieved',
        rankName: currentUser.rank.tierName,
        rankInsignia: currentUser.rank.insignia,
      };
    }

    createPost({
      postType,
      caption: caption.trim() || `Crushed today's session: ${postType}`,
      visibility,
      workoutData,
      prData,
      progressData,
      achievementData,
    });

    // Reset and exit
    setCaption('');
    onPostCreated();
    onClose();
  };

  const postTypeTabs: { type: PostType; label: string; icon: string }[] = [
    { type: 'TRAINING', label: 'Reflection', icon: '⚡' },
    { type: 'WORKOUT', label: 'Workout Log', icon: '🏋️' },
    { type: 'PERSONAL_RECORD', label: 'New PR', icon: '🔥' },
    { type: 'PROGRESS', label: 'Transformation', icon: '✨' },
    { type: 'ACHIEVEMENT', label: 'Discipline', icon: '👑' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Share with Squad</Text>

            <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
              <Text style={styles.publishText}>Publish</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Athlete Info & Visibility */}
            <View style={styles.userRow}>
              <Avatar uri={currentUser.avatar} name={currentUser.displayName} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{currentUser.displayName}</Text>
                {/* Visibility Selector */}
                <View style={styles.visibilitySelector}>
                  <TouchableOpacity
                    style={[
                      styles.visBtn,
                      visibility === 'EVERYONE' && styles.visBtnActive,
                    ]}
                    onPress={() => setVisibility('EVERYONE')}
                  >
                    <Text style={[styles.visBtnText, visibility === 'EVERYONE' && styles.visBtnTextActive]}>
                      🌐 Everyone
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visBtn,
                      visibility === 'FOLLOWERS' && styles.visBtnActive,
                    ]}
                    onPress={() => setVisibility('FOLLOWERS')}
                  >
                    <Text style={[styles.visBtnText, visibility === 'FOLLOWERS' && styles.visBtnTextActive]}>
                      👥 Followers
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visBtn,
                      visibility === 'ONLY_ME' && styles.visBtnActive,
                    ]}
                    onPress={() => setVisibility('ONLY_ME')}
                  >
                    <Text style={[styles.visBtnText, visibility === 'ONLY_ME' && styles.visBtnTextActive]}>
                      🔒 Only Me
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Post Type Selector Pills */}
            <Text style={styles.sectionLabel}>POST FORMAT</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typePillsScroll}
            >
              {postTypeTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.type}
                  style={[
                    styles.typePill,
                    postType === tab.type && styles.typePillActive,
                  ]}
                  onPress={() => setPostType(tab.type)}
                >
                  <Text style={styles.pillIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.pillLabel,
                      postType === tab.type && styles.pillLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Caption Input */}
            <TextInput
              style={styles.captionInput}
              multiline
              placeholder={
                postType === 'TRAINING'
                  ? 'Share your thoughts, workout notes, form insights...'
                  : postType === 'PERSONAL_RECORD'
                  ? 'Add context to this record breakthrough...'
                  : 'Add notes about this training achievement...'
              }
              placeholderTextColor="#666666"
              value={caption}
              onChangeText={setCaption}
            />

            {/* Specialized Input Fields based on Post Type */}
            {/* WORKOUT */}
            {postType === 'WORKOUT' && (
              <View style={styles.specializedBox}>
                <Text style={styles.boxTitle}>WORKOUT DETAILS</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Workout Routine Title (e.g. Heavy Legs & Core)"
                  placeholderTextColor="#666666"
                  value={workoutTitle}
                  onChangeText={setWorkoutTitle}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Duration in Minutes (e.g. 50)"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={workoutDuration}
                  onChangeText={setWorkoutDuration}
                />
              </View>
            )}

            {/* PERSONAL RECORD */}
            {postType === 'PERSONAL_RECORD' && (
              <View style={styles.specializedBox}>
                <Text style={styles.boxTitle}>NEW RECORD BENCHMARK</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Exercise Name (e.g. Barbell Deadlift)"
                  placeholderTextColor="#666666"
                  value={prExercise}
                  onChangeText={setPrExercise}
                />
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="New Wt (kg)"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    value={prWeight}
                    onChangeText={setPrWeight}
                  />
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="Reps"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    value={prReps}
                    onChangeText={setPrReps}
                  />
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="Prev (kg)"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    value={prPrevWeight}
                    onChangeText={setPrPrevWeight}
                  />
                </View>
              </View>
            )}

            {/* PROGRESS & TRANSFORMATION */}
            {postType === 'PROGRESS' && (
              <View style={styles.specializedBox}>
                <Text style={styles.boxTitle}>BODY METRICS & PRIVACY</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Body Weight (kg)"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={progressWeight}
                  onChangeText={setProgressWeight}
                />
                <View style={styles.privacyToggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>Hide Weight Number</Text>
                    <Text style={styles.toggleSub}>
                      Keep weight metric private; show only physical consistency
                    </Text>
                  </View>
                  <Switch
                    value={hideWeight}
                    onValueChange={setHideWeight}
                    trackColor={{ false: '#262626', true: '#F59E0B' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            {/* ACHIEVEMENT & DISCIPLINE */}
            {postType === 'ACHIEVEMENT' && (
              <View style={styles.specializedBox}>
                <Text style={styles.boxTitle}>DISCIPLINE CATEGORY</Text>
                <View style={styles.disciplineRow}>
                  {(['TAPAS', 'BALA', 'VIRYA', 'SADHANA', 'VAJRA'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBtn,
                        disciplineCategory === cat && styles.catBtnActive,
                      ]}
                      onPress={() => setDisciplineCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catBtnText,
                          disciplineCategory === cat && styles.catBtnTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.formInput}
                  placeholder="Achievement Title (e.g. 50 Workouts Milestone)"
                  placeholderTextColor="#666666"
                  value={achievementTitle}
                  onChangeText={setAchievementTitle}
                />
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '90%',
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  cancelBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cancelText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  publishBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  publishText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  visibilitySelector: {
    flexDirection: 'row',
    gap: 6,
  },
  visBtn: {
    backgroundColor: '#161616',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  visBtnActive: {
    backgroundColor: '#F59E0B15',
    borderColor: '#F59E0B',
  },
  visBtnText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
  },
  visBtnTextActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  typePillsScroll: {
    gap: 8,
    marginBottom: 16,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  typePillActive: {
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  captionInput: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    marginBottom: 16,
  },
  specializedBox: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  boxTitle: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSub: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
  },
  disciplineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  catBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  catBtnActive: {
    backgroundColor: '#F59E0B25',
    borderColor: '#F59E0B',
  },
  catBtnText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },
  catBtnTextActive: {
    color: '#F59E0B',
    fontWeight: '900',
  },
});
