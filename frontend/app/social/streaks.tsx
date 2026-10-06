import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { socialApi, workoutsApi, runsApi } from '../../src/services/api';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { RankInsignia } from '../../src/components/RankInsignia';
import {
  MILITARY_RANKS,
  getRankProgress,
  MilitaryRank,
} from '../../src/services/progression/rankConfig';
import { analyzePersonalPerformance } from '../../src/services/progression/performanceAnalyzer';

export default function PersonalRankingScreen() {
  const router = useRouter();
  const { colors, typography, spacing, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'progression' | 'ranks' | 'xp-log'>('progression');
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);
  const [selectedRankDetail, setSelectedRankDetail] = useState<MilitaryRank | null>(null);

  // Load personal ranking from backend
  const personalRankingQuery = useQuery({
    queryKey: ['personal-ranking'],
    queryFn: () => socialApi.getPersonalRanking(),
  });

  // Also query sessions and runs to feed the performance analyzer if needed
  const sessionsQuery = useQuery({
    queryKey: ['workout-sessions'],
    queryFn: () => workoutsApi.listSessions(),
  });

  const runsQuery = useQuery({
    queryKey: ['completed-runs'],
    queryFn: () => runsApi.listRuns(),
  });

  const recordsQuery = useQuery({
    queryKey: ['personal-records'],
    queryFn: () => workoutsApi.listRecords(),
  });

  const data = personalRankingQuery.data;
  const rawXP = data?.totalXP ?? 650;
  const progressInfo = getRankProgress(rawXP);
  const currentRank = data?.currentRank || progressInfo.currentRank;
  const nextRank = data?.nextRank || progressInfo.nextRank;
  const streak = data?.streak || { weekStreak: 3, targetDaysPerWeek: 4, workoutsThisWeek: 2 };

  // Run local performance analysis on user's real sessions & runs
  const localAnalysis = analyzePersonalPerformance({
    sessions: sessionsQuery.data || [],
    runs: runsQuery.data || [],
    records: recordsQuery.data || [],
    targetDaysPerWeek: streak.targetDaysPerWeek || 4,
  });

  const encouragingInsights =
    data?.performanceComparison?.encouragingInsights && data.performanceComparison.encouragingInsights.length > 0
      ? data.performanceComparison.encouragingInsights
      : localAnalysis.encouragingInsights;

  const xpBreakdown = data?.xpBreakdown || {
    workouts: 350,
    runs: 150,
    personalRecords: 100,
    streaks: 75,
    goals: 50,
  };

  const recentXPActivities = data?.recentXPActivities || [
    { type: 'WORKOUT', title: 'Push Day: Chest & Delts', xp: 125, detail: '4,800kg volume', timestamp: 'Today' },
    { type: 'RUN', title: '5K Tempo Run', xp: 150, detail: '5.2 km distance', timestamp: 'Yesterday' },
    { type: 'PERSONAL_RECORD', title: 'New PR: Bench Press', xp: 100, detail: '100 kg achieved', timestamp: '2 days ago' },
    { type: 'STREAK_MAINTAINED', title: '3-Week Consistency Bonus', xp: 25, detail: 'Unbroken streak', timestamp: '3 days ago' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: colors.surfaceElevated }]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>Personal Ranking</Text>
          <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>
            Compete With Yourself
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setFreezeModalVisible(true)}
          style={[
            styles.freezePill,
            {
              backgroundColor: isDark ? 'rgba(184, 245, 0, 0.12)' : 'rgba(120, 168, 0, 0.1)',
              borderColor: colors.accent,
            },
          ]}
          accessibilityLabel="Streak status"
          accessibilityRole="button"
        >
          <Icon name="flame" size={14} color={colors.accent} style={{ marginRight: 4 }} />
          <Text style={[typography.captionBold, { color: colors.accent }]}>
            {streak.weekStreak}W
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Segment Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('progression')}
          style={[
            styles.tabButton,
            activeTab === 'progression' && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'progression' ? colors.accent : colors.textSecondary },
            ]}
          >
            My Progression
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('ranks')}
          style={[
            styles.tabButton,
            activeTab === 'ranks' && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'ranks' ? colors.accent : colors.textSecondary },
            ]}
          >
            Ranks Codex
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('xp-log')}
          style={[
            styles.tabButton,
            activeTab === 'xp-log' && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              typography.captionBold,
              { color: activeTab === 'xp-log' ? colors.accent : colors.textSecondary },
            ]}
          >
            XP History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'progression' && (
          <>
            {/* HERO RANK CARD */}
            <Card elevated style={[styles.heroCard, { borderColor: colors.border }]}>
              <View style={styles.heroRankHeader}>
                <View style={styles.insigniaContainer}>
                  <RankInsignia rankIdOrType={currentRank.id} size="lg" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View style={styles.tierPill}>
                    <Text style={[typography.captionBold, { color: colors.accent, fontSize: 10 }]}>
                      TIER {currentRank.tier} OF 12
                    </Text>
                  </View>
                  <Text style={[typography.headingLarge, { color: colors.textPrimary, marginTop: 4 }]}>
                    {currentRank.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {currentRank.description}
                  </Text>
                </View>
              </View>

              {/* XP Progress to Next Rank */}
              <View style={styles.xpSection}>
                <View style={styles.xpRow}>
                  <View>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>CURRENT XP</Text>
                    <Text style={[typography.metricMedium, { color: colors.accent }]}>
                      {rawXP.toLocaleString()} XP
                    </Text>
                  </View>
                  {nextRank ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>NEXT RANK</Text>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {nextRank.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.accent }]}>
                        {progressInfo.xpToNextRank} XP needed
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.captionBold, { color: colors.accent }]}>APEX RANK</Text>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>Mastery</Text>
                    </View>
                  )}
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.accent,
                        width: `${progressInfo.progressPercentage}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressSubRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Tier Progress: {progressInfo.progressPercentage}%
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {progressInfo.xpInCurrentTier} / {progressInfo.xpRequiredForTier || 'MAX'} XP
                  </Text>
                </View>
              </View>
            </Card>

            {/* STREAK & CONSISTENCY SECTION */}
            <View style={styles.sectionHeaderRow}>
              <Icon name="flame" size={18} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                Consistency & Cadence
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={[typography.captionBold, { color: colors.textSecondary }]}>WEEK STREAK</Text>
                <View style={styles.statNumberRow}>
                  <Text style={[typography.metricMedium, { color: colors.accent }]}>
                    {streak.weekStreak}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    weeks
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Unbroken training
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <Text style={[typography.captionBold, { color: colors.textSecondary }]}>THIS WEEK</Text>
                <View style={styles.statNumberRow}>
                  <Text style={[typography.metricMedium, { color: colors.textPrimary }]}>
                    {streak.workoutsThisWeek || localAnalysis.thisWeekWorkouts}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    / {streak.targetDaysPerWeek} target
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.accent, marginTop: 2 }]}>
                  {localAnalysis.weeklyTargetCompletionRate}% completed
                </Text>
              </Card>
            </View>

            {/* PERSONAL PERFORMANCE ANALYSIS ("COMPETE WITH YOURSELF") */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Icon name="trending-up" size={18} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                Personal Performance
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: -6, marginBottom: 12 }]}>
              Compared strictly against your own historical averages
            </Text>

            {/* Motivating Personal Insights Cards */}
            <View style={{ gap: 10, marginBottom: 16 }}>
              {encouragingInsights.map((insight: string, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: isDark ? 'rgba(184, 245, 0, 0.08)' : 'rgba(120, 168, 0, 0.08)',
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Icon name="check-circle" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>
                    {insight}
                  </Text>
                </View>
              ))}
            </View>

            {/* Week-over-Week Metrics Comparison */}
            <View style={styles.comparisonGrid}>
              <Card style={styles.comparisonCard}>
                <Text style={[typography.captionBold, { color: colors.textSecondary }]}>WORKOUTS</Text>
                <View style={styles.comparisonRow}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 18 }]}>
                    {localAnalysis.thisWeekWorkouts}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    vs {localAnalysis.lastWeekWorkouts} last wk
                  </Text>
                </View>
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color:
                        localAnalysis.thisWeekWorkouts >= localAnalysis.lastWeekWorkouts
                          ? colors.accent
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {localAnalysis.thisWeekWorkouts >= localAnalysis.lastWeekWorkouts ? '↑ Ahead/Equal' : 'In Progress'}
                </Text>
              </Card>

              <Card style={styles.comparisonCard}>
                <Text style={[typography.captionBold, { color: colors.textSecondary }]}>RUN DISTANCE</Text>
                <View style={styles.comparisonRow}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 18 }]}>
                    {localAnalysis.thisWeekRunKm} km
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    vs {localAnalysis.lastWeekRunKm} km
                  </Text>
                </View>
                <Text
                  style={[
                    typography.captionBold,
                    {
                      color:
                        localAnalysis.thisWeekRunKm >= localAnalysis.lastWeekRunKm
                          ? colors.accent
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {localAnalysis.thisWeekRunKm >= localAnalysis.lastWeekRunKm ? '↑ Advancing' : 'Active'}
                </Text>
              </Card>
            </View>

            {/* NEXT RANK REQUIREMENTS */}
            {nextRank && (
              <Card style={[styles.nextGoalCard, { borderColor: colors.border, marginTop: 16 }]}>
                <View style={styles.nextGoalHeader}>
                  <RankInsignia rankIdOrType={nextRank.id} size="md" />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[typography.captionBold, { color: colors.accent }]}>
                      NEXT PROMOTION TARGET
                    </Text>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 16 }]}>
                      {nextRank.name}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                  {nextRank.promotionRequirements}
                </Text>
              </Card>
            )}
          </>
        )}

        {/* RANKS CODEX TAB (ALL 12 MILITARY RANKS) */}
        {activeTab === 'ranks' && (
          <View style={{ gap: 12 }}>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 8 }]}>
              The 12 Military Fitness Ranks represent your discipline and self-mastery. Every rank is unlocked strictly through your authentic athletic achievements.
            </Text>

            {MILITARY_RANKS.map((rank) => {
              const isCurrent = rank.id === currentRank.id;
              const isUnlocked = rawXP >= rank.minXP;

              return (
                <TouchableOpacity
                  key={rank.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedRankDetail(rank)}
                >
                  <Card
                    style={[
                      styles.rankCodexCard,
                      isCurrent && {
                        borderColor: colors.accent,
                        backgroundColor: isDark ? 'rgba(184, 245, 0, 0.08)' : 'rgba(120, 168, 0, 0.05)',
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <View style={styles.codexInsigniaCol}>
                      <RankInsignia
                        rankIdOrType={rank.id}
                        size="md"
                        color={isUnlocked ? colors.accent : colors.textSecondary}
                      />
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 15 }]}>
                          {rank.name}
                        </Text>
                        {isCurrent && (
                          <View style={[styles.activeRankBadge, { backgroundColor: colors.accent }]}>
                            <Text style={[typography.captionBold, { color: colors.onAccent, fontSize: 9 }]}>
                              CURRENT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {rank.minXP.toLocaleString()} XP required
                      </Text>
                    </View>

                    <View style={styles.statusCol}>
                      {isUnlocked ? (
                        <Icon name="check-circle" size={20} color={colors.accent} />
                      ) : (
                        <Icon name="lock" size={18} color={colors.textSecondary} />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* XP HISTORY & BREAKDOWN TAB */}
        {activeTab === 'xp-log' && (
          <View style={{ gap: 16 }}>
            {/* XP Breakdown Grid */}
            <Card style={{ borderColor: colors.border }}>
              <Text style={[typography.headingMedium, { color: colors.textPrimary, marginBottom: 12 }]}>
                XP Sources Breakdown
              </Text>
              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownItem}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>WORKOUTS</Text>
                  <Text style={[typography.bodyBold, { color: colors.accent }]}>
                    +{xpBreakdown.workouts} XP
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>RUNS</Text>
                  <Text style={[typography.bodyBold, { color: colors.accent }]}>
                    +{xpBreakdown.runs} XP
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>RECORDS (PR)</Text>
                  <Text style={[typography.bodyBold, { color: colors.accent }]}>
                    +{xpBreakdown.personalRecords} XP
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>STREAKS</Text>
                  <Text style={[typography.bodyBold, { color: colors.accent }]}>
                    +{xpBreakdown.streaks} XP
                  </Text>
                </View>
              </View>
            </Card>

            {/* Recent Logged Activities */}
            <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 8 }]}>
              Recent Activity Rewards
            </Text>
            <View style={{ gap: 10 }}>
              {recentXPActivities.map((act: any, idx: number) => (
                <Card key={idx} style={styles.activityCard}>
                  <View style={[styles.activityIconCircle, { backgroundColor: colors.surfaceElevated }]}>
                    <Icon
                      name={act.type === 'RUN' ? 'runner' : act.type === 'PERSONAL_RECORD' ? 'trophy' : 'dumbbell'}
                      size={18}
                      color={colors.accent}
                    />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{act.title}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{act.detail}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.bodyBold, { color: colors.accent }]}>+{act.xp} XP</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10 }]}>
                      {act.timestamp}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Rank Detail Modal */}
      {selectedRankDetail && (
        <Modal
          visible={!!selectedRankDetail}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedRankDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <RankInsignia rankIdOrType={selectedRankDetail.id} size="hero" />
                <Text style={[typography.headingLarge, { color: colors.textPrimary, marginTop: 12 }]}>
                  {selectedRankDetail.name}
                </Text>
                <Text style={[typography.captionBold, { color: colors.accent, marginTop: 2 }]}>
                  TIER {selectedRankDetail.tier} • {selectedRankDetail.minXP.toLocaleString()} XP
                </Text>
              </View>

              <Text style={[typography.body, { color: colors.textPrimary, textAlign: 'center', marginBottom: 12 }]}>
                {selectedRankDetail.description}
              </Text>

              <View style={[styles.requirementBox, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
                  PROMOTION REQUIREMENTS
                </Text>
                <Text style={[typography.body, { color: colors.textPrimary }]}>
                  {selectedRankDetail.promotionRequirements}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedRankDetail(null)}
                style={[styles.modalButton, { backgroundColor: colors.accent, marginTop: 20 }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.onAccent }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Streak Freeze Modal */}
      <Modal
        visible={freezeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFreezeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Icon name="snowflake" size={36} color={colors.accent} />
              <Text style={[typography.headingMedium, { color: colors.textPrimary, marginTop: 10 }]}>
                Streak Protection
              </Text>
            </View>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>
              Streak freezes protect your unbroken consistency record when life gets in the way. Maintain your routine to keep earning personal XP!
            </Text>
            <TouchableOpacity
              onPress={() => setFreezeModalVisible(false)}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.modalButtonText, { color: colors.onAccent }]}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    marginBottom: 20,
  },
  heroRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insigniaContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(184, 245, 0, 0.4)',
  },
  xpSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  comparisonCard: {
    flex: 1,
    padding: 14,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 4,
  },
  nextGoalCard: {
    padding: 16,
  },
  nextGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankCodexCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  codexInsigniaCol: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusCol: {
    marginLeft: 8,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownItem: {
    width: '46%',
    padding: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  requirementBox: {
    padding: 12,
    borderRadius: 10,
  },
  modalButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
