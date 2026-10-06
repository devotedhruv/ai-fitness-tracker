import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme';
import { Icon, IconName } from '../Icon';

export interface DayActivityItem {
  type: 'strength' | 'run' | 'cycling' | 'mobility' | 'daily_goal';
  title: string;
  xp: number;
  meta?: string;
}

export interface DayActivityRecord {
  date: string; // "YYYY-MM-DD"
  xp: number;
  isRestDay: boolean;
  activities?: DayActivityItem[];
}

export interface ActivityContributionGraphProps {
  activityData?: Record<string, DayActivityRecord>; // keyed by "YYYY-MM-DD"
  numWeeks?: number; // default: 52 (full year)
  onSelectDay?: (record: DayActivityRecord) => void;
  className?: string;
  containerMarginHorizontal?: number; // default: 16
  title?: string;
  subtitle?: string;
  showRangeToggle?: boolean;
  currentStreak?: number;
}

// ----------------------------------------------------
// Theme & Palette Constants (Synchronized with BALYRA)
// ----------------------------------------------------
export const CONTRIBUTION_COLORS = {
  bgContainer: '#121212',
  borderColor: '#262626',
  inactive: '#1A1A1A',       // Inactive / Unlogged Day
  restDay: '#38BDF8',        // Rest & Recovery Day (Azure restorative)
  light: 'rgba(184, 245, 0, 0.28)',    // 1–49 XP (Soft lime glow)
  moderate: 'rgba(184, 245, 0, 0.52)', // 50–99 XP (Medium lime)
  hard: 'rgba(184, 245, 0, 0.78)',     // 100–149 XP (Bright lime)
  elite: '#B8F500',                     // 150+ XP (Electric Lime accent)
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
};

export function getContributionColor(
  record?: DayActivityRecord | null,
  palette: typeof CONTRIBUTION_COLORS = CONTRIBUTION_COLORS
): string {
  if (!record) return palette.inactive;
  if (record.isRestDay) return palette.restDay;
  if (record.xp >= 150) return palette.elite;
  if (record.xp >= 100) return palette.hard;
  if (record.xp >= 50) return palette.moderate;
  if (record.xp > 0) return palette.light;
  return palette.inactive;
}

const WEEKDAY_LABELS = ['M', '', 'W', '', 'F', '', 'S']; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ActivityContributionGraph({
  activityData = {},
  numWeeks = 52,
  onSelectDay,
  containerMarginHorizontal = 16,
  title = 'DAILY STREAK CALENDAR',
  subtitle = 'Every month & day consistency tracker',
  showRangeToggle = true,
  currentStreak,
}: ActivityContributionGraphProps) {
  const { colors, typography, radius, isDark } = useTheme();

  const [selectedWeeks, setSelectedWeeks] = useState(numWeeks);

  useEffect(() => {
    setSelectedWeeks(numWeeks);
  }, [numWeeks]);

  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Dynamic Theme Palette synchronized with BALYRA active theme tokens
  const palette = useMemo(() => ({
    bgContainer: colors.surface,
    borderColor: colors.border,
    surfaceElevated: colors.surfaceElevated,
    inactive: colors.surfaceElevated,
    inactiveBorder: colors.divider || 'rgba(255, 255, 255, 0.05)',
    restDay: isDark ? '#38BDF8' : '#0284C7',
    light: isDark ? 'rgba(184, 245, 0, 0.28)' : 'rgba(120, 168, 0, 0.25)',
    moderate: isDark ? 'rgba(184, 245, 0, 0.52)' : 'rgba(120, 168, 0, 0.50)',
    hard: isDark ? 'rgba(184, 245, 0, 0.78)' : 'rgba(120, 168, 0, 0.75)',
    elite: colors.accent,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    accent: colors.primary,
    accentMuted: colors.accentMuted,
    onAccent: colors.onPrimary,
  }), [colors, isDark]);

  // Generate Matrix Structure:
  // 7 rows (Monday to Sunday) across `selectedWeeks` columns (default 52 = all months/days)
  const { weeks, monthHeaders, totalXpInWindow, activeDaysCount, restDaysCount, todayKey } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = formatDateKey(today);

    // Monday-based index: 0 = Mon, ..., 6 = Sun
    const currentDayOfWeek = (today.getDay() + 6) % 7;

    // End on Sunday of current week (or today)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));

    // Start date is (selectedWeeks * 7 - 1) days before endOfWeek
    const startDate = new Date(endOfWeek);
    startDate.setDate(endOfWeek.getDate() - (selectedWeeks * 7 - 1));

    const generatedWeeks: Array<Array<{ date: Date; dateKey: string; isFuture: boolean }>> = [];
    const months: Array<{ label: string; weekIndex: number }> = [];

    let currentCursor = new Date(startDate);
    let lastMonthSeen = -1;
    let xpSum = 0;
    let activeDays = 0;
    let restDays = 0;

    for (let w = 0; w < selectedWeeks; w++) {
      const daysInWeek: Array<{ date: Date; dateKey: string; isFuture: boolean }> = [];

      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(currentCursor);
        const dateKey = formatDateKey(dateObj);
        const isFuture = dateObj > today;

        daysInWeek.push({
          date: dateObj,
          dateKey,
          isFuture,
        });

        // Track stats for past and present days
        if (!isFuture) {
          const rec = activityData[dateKey];
          if (rec) {
            xpSum += rec.xp || 0;
            if (rec.isRestDay) {
              restDays += 1;
            } else if (rec.xp > 0) {
              activeDays += 1;
            }
          }
        }

        // Check for month label trigger: first day of week when month changes
        if (d === 0) {
          const monthIdx = dateObj.getMonth();
          if (monthIdx !== lastMonthSeen) {
            if (months.length === 0 || w - months[months.length - 1].weekIndex >= 3) {
              months.push({
                label: MONTH_NAMES[monthIdx],
                weekIndex: w,
              });
              lastMonthSeen = monthIdx;
            }
          }
        }

        currentCursor.setDate(currentCursor.getDate() + 1);
      }

      generatedWeeks.push(daysInWeek);
    }

    return {
      weeks: generatedWeeks,
      monthHeaders: months,
      totalXpInWindow: xpSum,
      activeDaysCount: activeDays,
      restDaysCount: restDays,
      todayKey: todayFormatted,
    };
  }, [activityData, selectedWeeks]);

  // Auto-scroll to current week (far right) on mount or range change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedWeeks]);

  const selectedRecord = selectedDayKey ? activityData[selectedDayKey] : null;

  const handleCellPress = (dateKey: string, isFuture: boolean) => {
    if (isFuture) return;
    const nextKey = selectedDayKey === dateKey ? null : dateKey;
    setSelectedDayKey(nextKey);
    if (nextKey && activityData[nextKey] && onSelectDay) {
      onSelectDay(activityData[nextKey]);
    }
  };

  const getActivityIcon = (type: DayActivityItem['type']): IconName => {
    switch (type) {
      case 'strength':
        return 'dumbbell';
      case 'run':
        return 'runner';
      case 'cycling':
        return 'bike';
      case 'mobility':
        return 'heart';
      case 'daily_goal':
      default:
        return 'target';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.bgContainer,
          borderColor: palette.borderColor,
          marginHorizontal: containerMarginHorizontal,
          borderRadius: radius.lg,
        },
      ]}
    >
      {/* Top Header & Metrics Summary */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.titleRow}>
            <Icon name="sparkle" size={14} color={palette.accent} />
            <Text style={[styles.titleText, { color: palette.accent }]}>{title}</Text>
          </View>
          <Text style={[styles.subtitleText, { color: palette.textSecondary }]}>{subtitle}</Text>
        </View>

        <View
          style={[
            styles.statsSummaryPill,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.borderColor,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.statPillValueRow}>
            <Text style={[styles.statPillValue, { color: palette.textPrimary }]}>
              {totalXpInWindow.toLocaleString()}
            </Text>
            <Text style={[styles.statPillXp, { color: palette.accent }]}>XP</Text>
          </View>
          <View style={[styles.pillDivider, { backgroundColor: palette.borderColor }]} />
          <Text style={[styles.statPillSub, { color: palette.textSecondary }]}>
            {activeDaysCount} active • {restDaysCount} rest
          </Text>
        </View>
      </View>

      {/* Range Filter & Streak Pill Row */}
      {showRangeToggle && (
        <View style={styles.rangeRow}>
          <View
            style={[
              styles.streakIndicator,
              {
                backgroundColor: palette.accentMuted,
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                borderRadius: radius.sm,
              },
            ]}
          >
            <Icon name="flame" size={13} color={palette.accent} />
            <Text style={[styles.streakIndicatorText, { color: palette.accent }]}>
              {currentStreak !== undefined && currentStreak > 0
                ? `${currentStreak}-Day Streak`
                : `${activeDaysCount} Active Days`}
            </Text>
          </View>

          <View
            style={[
              styles.rangePillsContainer,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.borderColor,
                borderRadius: radius.sm,
              },
            ]}
          >
            {[
              { label: '1 Year', weeks: 52 },
              { label: '6 Mos', weeks: 26 },
              { label: '3 Mos', weeks: 13 },
            ].map((option) => {
              const isActive = selectedWeeks === option.weeks;
              return (
                <TouchableOpacity
                  key={option.weeks}
                  onPress={() => setSelectedWeeks(option.weeks)}
                  style={[
                    styles.rangePill,
                    isActive && { backgroundColor: palette.accent },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.rangePillText,
                      { color: isActive ? palette.onAccent : palette.textSecondary },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Main Grid Viewport with Left Weekday Labels and Horizontal Scrolling Weeks */}
      <View style={styles.matrixWrapper}>
        {/* Left-Aligned Weekday Indicators (Pixel-perfect vertical alignment with matrix rows) */}
        <View style={styles.weekdayCol}>
          <View style={styles.weekdaySpacer} />
          {WEEKDAY_LABELS.map((dayLabel, idx) => (
            <View key={idx} style={styles.weekdayCell}>
              <Text style={[styles.weekdayLabel, { color: palette.textMuted }]}>{dayLabel}</Text>
            </View>
          ))}
        </View>

        {/* Scrollable Contribution Matrix */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            {/* Top Month Labels Row */}
            <View style={styles.monthsRow}>
              {monthHeaders.map((m, idx) => (
                <Text
                  key={`${m.label}-${idx}`}
                  numberOfLines={1}
                  style={[
                    styles.monthLabelText,
                    { left: m.weekIndex * 17, color: palette.textSecondary },
                  ]}
                >
                  {m.label}
                </Text>
              ))}
            </View>

            {/* Weeks Columns */}
            <View style={styles.weeksRow}>
              {weeks.map((weekDays, weekIdx) => (
                <View key={weekIdx} style={styles.weekColumn}>
                  {weekDays.map((dayItem, dayIdx) => {
                    const record = activityData[dayItem.dateKey];
                    const isSelected = selectedDayKey === dayItem.dateKey;
                    const isToday = dayItem.dateKey === todayKey;
                    const cellColor = dayItem.isFuture
                      ? 'transparent'
                      : getContributionColor(record, palette as any);

                    return (
                      <Pressable
                        key={dayIdx}
                        disabled={dayItem.isFuture}
                        onPress={() => handleCellPress(dayItem.dateKey, dayItem.isFuture)}
                        style={({ pressed }) => [
                          styles.cellSquare,
                          {
                            backgroundColor: cellColor,
                            borderColor: isSelected
                              ? palette.textPrimary
                              : isToday
                              ? palette.accent
                              : dayItem.isFuture
                              ? 'transparent'
                              : palette.inactiveBorder,
                            borderWidth: isSelected ? 2 : isToday ? 1.5 : 1,
                            opacity: pressed ? 0.7 : dayItem.isFuture ? 0.15 : 1,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Interactive Day Inspector Card (Expands when tapping any day square) */}
      {selectedDayKey && (
        <View
          style={[
            styles.inspectorCard,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.borderColor,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.inspectorHeader}>
            <View>
              <Text style={[styles.inspectorDate, { color: palette.textPrimary }]}>
                {new Date(`${selectedDayKey}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.inspectorStatus, { color: palette.accent }]}>
                {selectedRecord?.isRestDay
                  ? 'Planned Rest & Recovery'
                  : selectedRecord && selectedRecord.xp > 0
                  ? `${selectedRecord.xp} XP Earned`
                  : 'Rest / No workouts logged'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedDayKey(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.closeInspectorBtn, { backgroundColor: palette.bgContainer }]}
              accessibilityLabel="Close Day Inspector"
            >
              <Icon name="close" size={14} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Activities list for selected day */}
          {selectedRecord?.activities && selectedRecord.activities.length > 0 ? (
            <View style={styles.inspectorActivitiesList}>
              {selectedRecord.activities.map((act, i) => (
                <View
                  key={i}
                  style={[
                    styles.activityItemRow,
                    { backgroundColor: palette.bgContainer, borderRadius: radius.sm },
                  ]}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: palette.accentMuted },
                    ]}
                  >
                    <Icon name={getActivityIcon(act.type)} size={12} color={palette.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, { color: palette.textPrimary }]}>
                      {act.title}
                    </Text>
                    {act.meta ? (
                      <Text style={[styles.activityMeta, { color: palette.textSecondary }]}>
                        {act.meta}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.activityXP, { color: palette.accent }]}>
                    +{act.xp} XP
                  </Text>
                </View>
              ))}
            </View>
          ) : selectedRecord?.isRestDay ? (
            <View
              style={[
                styles.restDayBadgeRow,
                { backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: radius.sm },
              ]}
            >
              <Icon name="heart" size={14} color="#38BDF8" />
              <Text style={[styles.restDayCallout, { color: '#38BDF8' }]}>
                Muscular repair, CNS restoration & streak maintained.
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Legend Footer */}
      <View style={[styles.legendRow, { borderTopColor: palette.borderColor }]}>
        {/* Planned Rest Day Callout */}
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: palette.restDay }]} />
          <Text style={[styles.legendText, { color: palette.textSecondary }]}>Rest Day</Text>
        </View>

        {/* Gradient Intensity Scale */}
        <View style={styles.intensityScale}>
          <Text style={[styles.legendText, { color: palette.textSecondary }]}>Less</Text>
          <View style={[styles.legendBox, { backgroundColor: palette.inactive, borderWidth: 1, borderColor: palette.inactiveBorder }]} />
          <View style={[styles.legendBox, { backgroundColor: palette.light }]} />
          <View style={[styles.legendBox, { backgroundColor: palette.moderate }]} />
          <View style={[styles.legendBox, { backgroundColor: palette.hard }]} />
          <View style={[styles.legendBox, { backgroundColor: palette.elite }]} />
          <Text style={[styles.legendText, { color: palette.textSecondary }]}>More</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'PlusJakartaSans-Bold',
    textTransform: 'uppercase',
  },
  subtitleText: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  statsSummaryPill: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    minWidth: 108,
  },
  statPillValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statPillValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    fontVariant: ['tabular-nums'],
  },
  statPillXp: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  pillDivider: {
    height: 1,
    width: '100%',
    marginVertical: 3,
  },
  statPillSub: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  streakIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rangePillsContainer: {
    flexDirection: 'row',
    padding: 2,
    borderWidth: 1,
  },
  rangePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  matrixWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  weekdayCol: {
    width: 14,
    marginRight: 6,
  },
  weekdaySpacer: {
    height: 22, // 16px month label height + 6px marginBottom
  },
  weekdayCell: {
    height: 14,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  scrollContent: {
    paddingRight: 4,
  },
  monthsRow: {
    position: 'relative',
    height: 16,
    marginBottom: 6,
  },
  monthLabelText: {
    position: 'absolute',
    top: 0,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    width: 38,
  },
  weeksRow: {
    flexDirection: 'row',
  },
  weekColumn: {
    marginRight: 3,
  },
  cellSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginBottom: 3,
  },
  inspectorCard: {
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectorDate: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  inspectorStatus: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  closeInspectorBtn: {
    padding: 4,
    borderRadius: 6,
  },
  inspectorActivitiesList: {
    gap: 6,
    marginTop: 4,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  activityIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  activityMeta: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  activityXP: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  restDayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  restDayCallout: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intensityScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 11,
    height: 11,
    borderRadius: 2.5,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
