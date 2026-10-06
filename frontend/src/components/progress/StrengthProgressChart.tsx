import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Rect } from 'react-native-svg';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { ExerciseProgressItem } from '../../services/progression/types';
import { getRankBadgeColors } from './RankHierarchyGrid';

interface StrengthProgressChartProps {
  exerciseProgress: Record<string, ExerciseProgressItem>;
  onSelectExerciseDetail?: (exercise: ExerciseProgressItem) => void;
}

type MetricType = 'WEIGHT' | 'ESTIMATED_1RM' | 'VOLUME';

export function StrengthProgressChart({
  exerciseProgress,
  onSelectExerciseDetail,
}: StrengthProgressChartProps) {
  const { colors } = useTheme();
  const exercises = Object.values(exerciseProgress);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.exerciseId || 'squat'
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('WEIGHT');

  const currentExercise = useMemo(() => {
    return (
      exercises.find((e) => e.exerciseId === selectedExerciseId) ||
      exercises[0] ||
      null
    );
  }, [exercises, selectedExerciseId]);

  // Extract points based on selected metric
  const chartData = useMemo(() => {
    if (!currentExercise || !currentExercise.historyPoints || currentExercise.historyPoints.length === 0) {
      return [];
    }

    return currentExercise.historyPoints.map((pt, idx) => {
      let val = pt.weightKg;
      if (selectedMetric === 'ESTIMATED_1RM') {
        val = pt.estimated1RMKg;
      } else if (selectedMetric === 'VOLUME') {
        val = pt.volumeKg;
      }
      return {
        label: pt.date ? pt.date.slice(5) : `S${idx + 1}`,
        value: val,
        raw: pt,
      };
    });
  }, [currentExercise, selectedMetric]);

  // Compute SVG coordinates
  const chartWidth = 320;
  const chartHeight = 140;
  const paddingX = 28;
  const paddingTop = 16;
  const paddingBottom = 26;

  const { pathD, areaD, points, minY, maxY } = useMemo(() => {
    if (chartData.length === 0) {
      return { pathD: '', areaD: '', points: [], minY: 0, maxY: 0 };
    }

    const values = chartData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    // Add 10% breathing room
    const range = maxVal === minVal ? Math.max(1, maxVal * 0.2) : maxVal - minVal;
    const calcMinY = Math.max(0, minVal - range * 0.15);
    const calcMaxY = maxVal + range * 0.15;

    const availableW = chartWidth - paddingX * 2;
    const availableH = chartHeight - paddingTop - paddingBottom;

    const pts = chartData.map((d, index) => {
      const x = chartData.length === 1
        ? paddingX + availableW / 2
        : paddingX + (index / (chartData.length - 1)) * availableW;
      const normalizedY = (d.value - calcMinY) / (calcMaxY - calcMinY || 1);
      const y = paddingTop + availableH - normalizedY * availableH;
      return { x, y, value: d.value, label: d.label };
    });

    let pLine = '';
    pts.forEach((pt, idx) => {
      if (idx === 0) {
        pLine += `M ${pt.x} ${pt.y}`;
      } else {
        pLine += ` L ${pt.x} ${pt.y}`;
      }
    });

    const bottomY = chartHeight - paddingBottom;
    const pArea = `${pLine} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;

    return {
      pathD: pLine,
      areaD: pArea,
      points: pts,
      minY: Math.round(minVal),
      maxY: Math.round(maxVal),
    };
  }, [chartData]);

  if (!currentExercise) {
    return null;
  }

  const rankBadge = getRankBadgeColors(currentExercise.rank);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Strength Progression
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Over-time overload & 1RM trend
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelectExerciseDetail?.(currentExercise)}
          style={[styles.detailLink, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
        >
          <Text style={[styles.detailLinkText, { color: colors.accent }]}>Full History</Text>
          <Icon name="chevron-right" size={12} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Exercise Horizontal Scroll Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseSelectorContainer}
      >
        {exercises.map((ex) => {
          const isSelected = ex.exerciseId === currentExercise.exerciseId;
          return (
            <TouchableOpacity
              key={ex.exerciseId}
              activeOpacity={0.7}
              onPress={() => setSelectedExerciseId(ex.exerciseId)}
              style={[
                styles.exercisePill,
                {
                  backgroundColor: isSelected ? colors.accent : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.exercisePillText,
                  { color: isSelected ? '#0B1020' : colors.textPrimary },
                ]}
              >
                {ex.exerciseName}
              </Text>
              <View
                style={[
                  styles.pillRankBadge,
                  { backgroundColor: isSelected ? '#0B1020' : 'rgba(184, 245, 0, 0.15)' },
                ]}
              >
                <Text
                  style={[
                    styles.pillRankText,
                    { color: isSelected ? colors.accent : colors.accent },
                  ]}
                >
                  {ex.rank}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Metric Selector Tabs */}
      <View style={[styles.metricBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedMetric('WEIGHT')}
          style={[
            styles.metricTab,
            selectedMetric === 'WEIGHT' && [styles.metricTabActive, { backgroundColor: colors.primary }],
          ]}
        >
          <Text
            style={[
              styles.metricTabText,
              { color: selectedMetric === 'WEIGHT' ? colors.onPrimary : colors.textSecondary },
            ]}
          >
            Working Weight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedMetric('ESTIMATED_1RM')}
          style={[
            styles.metricTab,
            selectedMetric === 'ESTIMATED_1RM' && [styles.metricTabActive, { backgroundColor: colors.primary }],
          ]}
        >
          <Text
            style={[
              styles.metricTabText,
              { color: selectedMetric === 'ESTIMATED_1RM' ? colors.onPrimary : colors.textSecondary },
            ]}
          >
            Est. 1RM
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedMetric('VOLUME')}
          style={[
            styles.metricTab,
            selectedMetric === 'VOLUME' && [styles.metricTabActive, { backgroundColor: colors.primary }],
          ]}
        >
          <Text
            style={[
              styles.metricTabText,
              { color: selectedMetric === 'VOLUME' ? colors.onPrimary : colors.textSecondary },
            ]}
          >
            Set Volume
          </Text>
        </TouchableOpacity>
      </View>

      {/* SVG Chart Display */}
      <View style={[styles.chartContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        {chartData.length > 0 ? (
          <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <Defs>
              <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.32" />
                <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Subtle Grid Lines */}
            <Line
              x1={paddingX}
              y1={paddingTop}
              x2={chartWidth - paddingX}
              y2={paddingTop}
              stroke={colors.divider}
              strokeDasharray="4 4"
            />
            <Line
              x1={paddingX}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingBottom}
              stroke={colors.divider}
            />

            {/* Area Fill */}
            <Path d={areaD} fill="url(#chartGradient)" />

            {/* Main Curve Line */}
            <Path
              d={pathD}
              fill="none"
              stroke={colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points & Values */}
            {points.map((pt, i) => (
              <React.Fragment key={i}>
                <Circle cx={pt.x} cy={pt.y} r={4.5} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />
              </React.Fragment>
            ))}
          </Svg>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="trending-up" size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
              Log more sessions to generate your strength curve
            </Text>
          </View>
        )}

        {/* Dynamic Min / Max Axis Labels */}
        {chartData.length > 0 && (
          <View style={styles.axisLabelRow}>
            <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
              Min: {minY} {selectedMetric === 'VOLUME' ? 'kg' : 'kg'}
            </Text>
            <Text style={[styles.axisLabel, { color: colors.accent }]}>
              Current: {chartData[chartData.length - 1]?.value} kg
            </Text>
            <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
              Peak: {maxY} kg
            </Text>
          </View>
        )}
      </View>

      {/* Key Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>PERSONAL BEST</Text>
          <Text style={[styles.statVal, { color: colors.textPrimary }]}>
            {currentExercise.personalBestWeightKg > 0
              ? `${currentExercise.personalBestWeightKg} kg`
              : `${currentExercise.personalBestReps} reps`}
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ESTIMATED 1RM</Text>
          <Text style={[styles.statVal, { color: colors.accent }]}>
            {currentExercise.estimated1RMKg} kg
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>EXERCISE RANK</Text>
          <View style={styles.rankInline}>
            <View style={[styles.statRankBadge, { backgroundColor: rankBadge.bg, borderColor: rankBadge.border }]}>
              <Text style={[styles.statRankText, { color: rankBadge.text }]}>{currentExercise.rank}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Milestone Box */}
      {currentExercise.nextMilestone && (
        <View style={[styles.milestoneBox, { backgroundColor: colors.accentMuted, borderColor: colors.primary }]}>
          <View style={styles.milestoneHeader}>
            <Icon name="target" size={14} color={colors.accentText} />
            <Text style={[styles.milestoneTitle, { color: colors.accentText }]}>
              Next Rank Milestone
            </Text>
            <View style={[styles.xpPill, { backgroundColor: colors.primary }]}>
              <Text style={[styles.xpPillText, { color: colors.onPrimary }]}>+{currentExercise.nextMilestone.rewardXP} XP</Text>
            </View>
          </View>
          <Text style={[styles.milestoneDesc, { color: colors.textPrimary }]}>
            {currentExercise.nextMilestone.targetDescription}
          </Text>
          {/* Progress bar towards milestone */}
          <View style={[styles.milestoneTrack, { backgroundColor: colors.divider }]}>
            <View
              style={[
                styles.milestoneFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(
                    100,
                    Math.max(
                      10,
                      (currentExercise.nextMilestone.currentVal /
                        (currentExercise.nextMilestone.targetVal || 1)) *
                        100
                    )
                  )}%`,
                },
              ]}
            />
          </View>
          <View style={styles.milestoneMetaRow}>
            <Text style={[styles.milestoneMetaText, { color: colors.textSecondary }]}>
              Current: {currentExercise.nextMilestone.currentVal}
            </Text>
            <Text style={[styles.milestoneMetaText, { color: colors.accentText }]}>
              Target: {currentExercise.nextMilestone.targetVal}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  detailLinkText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  exerciseSelectorContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  exercisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  exercisePillText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pillRankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pillRankText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  metricBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  metricTabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  metricTabText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  chartContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyChart: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  emptyChartText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  axisLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.3,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rankInline: {
    marginTop: 2,
  },
  statRankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statRankText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  milestoneDesc: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  milestoneTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  milestoneFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneMetaText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
