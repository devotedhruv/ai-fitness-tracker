import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../tokens/ThemeContext';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { WorkoutPostMetadata, useSocialStore } from '../../stores/socialStore';

interface WorkoutSummaryDetailModalProps {
  visible: boolean;
  workoutData?: WorkoutPostMetadata;
  athleteName: string;
  athleteUsername?: string;
  athleteAvatar?: string;
  createdAt: string;
  onClose: () => void;
  onShare?: () => void;
}

export function WorkoutSummaryDetailModal({
  visible,
  workoutData,
  athleteName,
  athleteUsername,
  athleteAvatar,
  createdAt,
  onClose,
  onShare,
}: WorkoutSummaryDetailModalProps) {
  const { colors } = useTheme();
  const toggleSaveItem = useSocialStore((state) => state.toggleSaveItem);
  const isItemSaved = useSocialStore((state) => state.isItemSaved);

  if (!visible || !workoutData) return null;

  const workoutSaved = isItemSaved(workoutData.workoutName);

  const handleCopyWorkout = () => {
    Alert.alert(
      'Workout Saved to Library',
      `"${workoutData.workoutName}" with ${workoutData.exercises.length} exercises has been added to your training routines.`,
      [{ text: 'Great', style: 'default' }]
    );
  };

  const handleToggleBookmark = () => {
    toggleSaveItem({
      title: workoutData.workoutName,
      subtitle: `${workoutData.exercises.length} exercises • ${workoutData.totalVolumeKg.toLocaleString()} kg`,
      category: 'WORKOUTS',
      metadata: workoutData,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.athleteHeader}>
              <Avatar uri={athleteAvatar} name={athleteName} size={42} />
              <View>
                <Text style={styles.athleteName}>{athleteName}</Text>
                <Text style={styles.dateSubtitle}>
                  @{athleteUsername} • {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Workout Title Banner */}
            <View style={styles.workoutBanner}>
              <View style={styles.titleRow}>
                <View style={styles.lightningIconWrap}>
                  <Icon name="today" size={20} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutTitle}>{workoutData.workoutName}</Text>
                  <Text style={styles.workoutDuration}>
                    {workoutData.durationMinutes} minutes • {workoutData.streakDays} Day Sadhana
                  </Text>
                </View>
              </View>

              {/* High-level metrics row */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>
                    {workoutData.totalVolumeKg.toLocaleString()}
                    <Text style={styles.metricUnit}> kg</Text>
                  </Text>
                  <Text style={styles.metricLabel}>Total Volume</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{workoutData.exercisesCount}</Text>
                  <Text style={styles.metricLabel}>Exercises</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{workoutData.setsCount}</Text>
                  <Text style={styles.metricLabel}>Total Sets</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#B8F500' }]}>
                    {workoutData.prsCount} 🔥
                  </Text>
                  <Text style={styles.metricLabel}>Records</Text>
                </View>
              </View>
            </View>

            {/* Exercise Breakdown */}
            <Text style={styles.sectionHeader}>EXERCISE BREAKDOWN</Text>

            {workoutData.exercises.map((ex, exIdx) => (
              <View key={exIdx} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View>
                    <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                    <Text style={styles.exerciseCategory}>{ex.category}</Text>
                  </View>
                  <View style={styles.exerciseSummaryRight}>
                    <Text style={styles.topWeightText}>Top: {ex.topWeightKg} kg</Text>
                    <Text style={styles.volumeSubtext}>{ex.totalVolumeKg.toLocaleString()} kg vol</Text>
                  </View>
                </View>

                {/* Sets Table */}
                <View style={styles.setsTable}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableColHeader, { width: 44 }]}>SET</Text>
                    <Text style={[styles.tableColHeader, { flex: 1 }]}>WEIGHT</Text>
                    <Text style={[styles.tableColHeader, { flex: 1 }]}>REPS</Text>
                    <Text style={[styles.tableColHeader, { width: 60, textAlign: 'right' }]}>NOTE</Text>
                  </View>

                  {ex.sets.map((s) => (
                    <View
                      key={s.setNumber}
                      style={[
                        styles.setRow,
                        s.isPR && { backgroundColor: 'rgba(184, 245, 0, 0.08)' },
                      ]}
                    >
                      <View style={styles.setNumberBadge}>
                        <Text style={styles.setNumberText}>{s.setNumber}</Text>
                      </View>
                      <Text style={styles.setColText}>{s.weightKg} kg</Text>
                      <Text style={styles.setColText}>{s.reps} reps</Text>
                      <View style={{ width: 60, alignItems: 'flex-end' }}>
                        {s.isPR ? (
                          <View style={styles.prBadge}>
                            <Text style={styles.prBadgeText}>PR 🔥</Text>
                          </View>
                        ) : (
                          <Text style={styles.normalSetText}>-</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={[
                styles.bookmarkBtn,
                workoutSaved && { backgroundColor: '#F59E0B25', borderColor: '#F59E0B' },
              ]}
              onPress={handleToggleBookmark}
            >
              <Icon
                name={workoutSaved ? 'bookmark-fill' : 'bookmark'}
                size={18}
                color={workoutSaved ? '#F59E0B' : '#FFFFFF'}
              />
              <Text style={[styles.btnText, workoutSaved && { color: '#F59E0B' }]}>
                {workoutSaved ? 'Saved' : 'Save Routine'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyWorkoutBtn}
              onPress={handleCopyWorkout}
            >
              <Icon name="today" size={18} color="#000000" />
              <Text style={styles.copyBtnText}>Use Routine</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  athleteName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  dateSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  workoutBanner: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  lightningIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A1F08',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  workoutDuration: {
    fontSize: 12,
    color: '#A3A3A3',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1C1C1C',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
  },
  metricLabel: {
    color: '#737373',
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionHeader: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseCategory: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  exerciseSummaryRight: {
    alignItems: 'flex-end',
  },
  topWeightText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  volumeSubtext: {
    color: '#666666',
    fontSize: 10,
    marginTop: 2,
  },
  setsTable: {
    borderTopWidth: 1,
    borderTopColor: '#202020',
    paddingTop: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableColHeader: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  setNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  setNumberText: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '700',
  },
  setColText: {
    flex: 1,
    color: '#EDEDED',
    fontSize: 13,
    fontWeight: '600',
  },
  prBadge: {
    backgroundColor: 'rgba(184, 245, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B8F500',
  },
  prBadgeText: {
    color: '#B8F500',
    fontSize: 9,
    fontWeight: '800',
  },
  normalSetText: {
    color: '#444444',
    fontSize: 12,
  },
  footerBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#0D0D0D',
  },
  bookmarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#262626',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  copyWorkoutBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 13,
  },
  copyBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
});
