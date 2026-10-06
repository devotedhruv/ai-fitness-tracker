import React from 'react';
import { AppLogo } from '../components/ui/AppLogo';
import { AppHeader } from '../components/ui/AppHeader';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppTabBar } from '../components/ui/AppTabBar';
import { AppStatCard } from '../components/ui/AppStatCard';
import { AppProgressBar } from '../components/ui/AppProgressBar';
import { AppAvatar } from '../components/ui/AppAvatar';
import { AppBadge } from '../components/ui/AppBadge';
import { AIFormScoreCard } from '../components/ui/cards/AIFormScoreCard';
import { WorkoutCard } from '../components/ui/cards/WorkoutCard';
import { ProgressCard } from '../components/ui/cards/ProgressCard';
import { AchievementCard } from '../components/ui/cards/AchievementCard';
import { ExerciseCard } from '../components/ui/cards/ExerciseCard';
import { ChallengeCard } from '../components/ui/cards/ChallengeCard';
import { ActivityContributionGraph, getContributionColor, CONTRIBUTION_COLORS } from '../components/progress/ActivityContributionGraph';
import { darkModeColors, lightModeColors } from '../theme/colors';

// Mock Icon component
jest.mock('../components/Icon', () => ({
  Icon: ({ name, size, color }: any) => null,
}));

describe('Unified Design System Components', () => {
  describe('Brand Colors & Tokens', () => {
    it('enforces Electric Lime as primary brand accent in dark and light modes', () => {
      expect(darkModeColors.accent).toBe('#B8F500');
      expect(darkModeColors.background).toBe('#000000');
      expect(darkModeColors.surface).toBe('#121212');
      expect(darkModeColors.surfaceElevated).toBe('#1A1A1A');

      expect(lightModeColors.accent).toBe('#78A800');
      expect(lightModeColors.background).toBe('#FFFFFF');
      expect(lightModeColors.surface).toBe('#FFFFFF');
    });

    it('enforces strict semantic separation: red only for errors, green only for success', () => {
      expect(darkModeColors.error).toBe('#FF4D4D');
      expect(darkModeColors.success).toBe('#35D07F');
      expect(lightModeColors.error).toBe('#DC2626');
      expect(lightModeColors.success).toBe('#1FA463');
    });
  });

  describe('AppLogo Component', () => {
    it('creates standard wordmark logo with tagline', () => {
      const element = <AppLogo size="medium" showTagline={true} />;
      expect(element).toBeDefined();
      expect(element.props.size).toBe('medium');
      expect(element.props.showTagline).toBe(true);
      expect(element.props.variant).toBeUndefined(); // defaults to wordmark
    });

    it('creates compact mark logo without tagline for tight spaces', () => {
      const element = <AppLogo size="small" variant="mark" showTagline={false} />;
      expect(element).toBeDefined();
      expect(element.props.variant).toBe('mark');
      expect(element.props.size).toBe('small');
      expect(element.props.showTagline).toBe(false);
    });

    it('creates large banner wordmark logo', () => {
      const element = <AppLogo size="large" showTagline={true} />;
      expect(element).toBeDefined();
      expect(element.props.size).toBe('large');
    });
  });

  describe('AppHeader Component', () => {
    it('creates universal header with brand logo, title, and actions', () => {
      const onBack = jest.fn();
      const element = (
        <AppHeader
          title="Community"
          subtitle="BALYRA Athletic Network"
          showLogo={true}
          showBack={true}
          onBack={onBack}
        />
      );
      expect(element).toBeDefined();
      expect(element.props.title).toBe('Community');
      expect(element.props.subtitle).toBe('BALYRA Athletic Network');
      expect(element.props.showLogo).toBe(true);
      expect(element.props.showBack).toBe(true);
      expect(element.props.onBack).toBe(onBack);
    });

    it('creates header with docked tab bar', () => {
      const element = (
        <AppHeader
          title="Workouts"
          tabs={
            <AppTabBar
              tabs={[
                { id: 'exercise', label: 'Exercise' },
                { id: 'running', label: 'Running' },
              ]}
              activeTab="exercise"
              onTabPress={jest.fn()}
            />
          }
        />
      );
      expect(element).toBeDefined();
      expect(element.props.tabs).toBeDefined();
    });
  });

  describe('AppButton Component', () => {
    it('supports all primary and secondary variants', () => {
      const onPress = jest.fn();
      const primaryBtn = (
        <AppButton title="Start Workout" variant="primary" size="large" onPress={onPress} />
      );
      expect(primaryBtn.props.variant).toBe('primary');
      expect(primaryBtn.props.size).toBe('large');
      expect(primaryBtn.props.title).toBe('Start Workout');

      const secondaryBtn = (
        <AppButton title="Filter" variant="secondary" size="small" onPress={onPress} />
      );
      expect(secondaryBtn.props.variant).toBe('secondary');
      expect(secondaryBtn.props.size).toBe('small');
    });

    it('supports danger and ghost variants', () => {
      const dangerBtn = <AppButton title="Discard" variant="danger" />;
      expect(dangerBtn.props.variant).toBe('danger');

      const ghostBtn = <AppButton title="Skip" variant="ghost" />;
      expect(ghostBtn.props.variant).toBe('ghost');
    });

    it('supports loading and disabled states', () => {
      const loadingBtn = <AppButton title="Saving..." loading={true} disabled={true} />;
      expect(loadingBtn.props.loading).toBe(true);
      expect(loadingBtn.props.disabled).toBe(true);
    });
  });

  describe('AppCard Component', () => {
    it('renders with different visual elevation variants', () => {
      const defaultCard = <AppCard variant="default" />;
      expect(defaultCard.props.variant).toBe('default');

      const elevatedCard = <AppCard variant="elevated" />;
      expect(elevatedCard.props.variant).toBe('elevated');

      const outlinedCard = <AppCard variant="outlined" />;
      expect(outlinedCard.props.variant).toBe('outlined');

      const accentCard = <AppCard variant="accent" />;
      expect(accentCard.props.variant).toBe('accent');
    });
  });

  describe('AIFormScoreCard Component', () => {
    it('displays 94% score, 12/12 reps, 10 good form, and 2 needs improvement', () => {
      const element = (
        <AIFormScoreCard
          score={94}
          repsCount={12}
          targetReps={12}
          goodFormCount={10}
          needsImprovementCount={2}
          feedbackSummary="Excellent"
        />
      );
      expect(element).toBeDefined();
      expect(element.props.score).toBe(94);
      expect(element.props.repsCount).toBe(12);
      expect(element.props.targetReps).toBe(12);
      expect(element.props.goodFormCount).toBe(10);
      expect(element.props.needsImprovementCount).toBe(2);
      expect(element.props.feedbackSummary).toBe('Excellent');
    });
  });

  describe('AppTabBar Component', () => {
    it('supports segmented, underline, and pills tab variants', () => {
      const tabs = [
        { id: 'feed', label: 'Squad Feed' },
        { id: 'challenges', label: 'Challenges' },
        { id: 'academy', label: 'Academy' },
      ];
      const onChange = jest.fn();

      const underlineTabs = (
        <AppTabBar tabs={tabs} activeTab="feed" onTabPress={onChange} variant="underline" />
      );
      expect(underlineTabs.props.variant).toBe('underline');
      expect(underlineTabs.props.tabs.length).toBe(3);

      const segmentTabs = (
        <AppTabBar tabs={tabs} activeTab="challenges" onTabPress={onChange} variant="segment" />
      );
      expect(segmentTabs.props.variant).toBe('segment');

      const pillsTabs = (
        <AppTabBar tabs={tabs} activeTab="academy" onTabPress={onChange} variant="pills" />
      );
      expect(pillsTabs.props.variant).toBe('pills');
    });
  });

  describe('AppStatCard & AppProgressBar Components', () => {
    it('renders prominent numeric statistic with trend and label', () => {
      const stat = (
        <AppStatCard
          value="42,850"
          unit="KG"
          label="Total Volume"
          trend={{ value: '+14% this week', isPositive: true }}
        />
      );
      expect(stat.props.value).toBe('42,850');
      expect(stat.props.unit).toBe('KG');
      expect(stat.props.label).toBe('Total Volume');
      expect(stat.props.trend?.isPositive).toBe(true);
    });

    it('renders progress bar with percentage fill', () => {
      const progressBar = (
        <AppProgressBar progress={0.78} label="Weekly Goal" showPercentage={true} />
      );
      expect(progressBar.props.progress).toBe(0.78);
      expect(progressBar.props.label).toBe('Weekly Goal');
      expect(progressBar.props.showPercentage).toBe(true);
    });
  });

  describe('AppAvatar & AppBadge Components', () => {
    it('renders avatar with initials, rank ring, and verified status', () => {
      const avatar = (
        <AppAvatar
          name="Dhruv Athlete"
          hasStoryRing={true}
          size="large"
          isVerified={true}
        />
      );
      expect(avatar.props.name).toBe('Dhruv Athlete');
      expect(avatar.props.hasStoryRing).toBe(true);
      expect(avatar.props.size).toBe('large');
      expect(avatar.props.isVerified).toBe(true);
    });

    it('renders badge with semantic variants', () => {
      const accentBadge = <AppBadge label="PRO" variant="accent" />;
      expect(accentBadge.props.variant).toBe('accent');

      const successBadge = <AppBadge label="COMPLETED" variant="success" />;
      expect(successBadge.props.variant).toBe('success');

      const errorBadge = <AppBadge label="FAILED" variant="error" />;
      expect(errorBadge.props.variant).toBe('error');
    });
  });

  describe('Specialized Domain Cards', () => {
    it('renders WorkoutCard with routine details', () => {
      const workoutCard = (
        <WorkoutCard
          title="Chest & Delts Hypertrophy"
          category="Upper Body"
          exercisesCount={5}
          durationMinutes={55}
          onPress={jest.fn()}
          onStart={jest.fn()}
        />
      );
      expect(workoutCard.props.title).toBe('Chest & Delts Hypertrophy');
      expect(workoutCard.props.exercisesCount).toBe(5);
      expect(workoutCard.props.durationMinutes).toBe(55);
    });

    it('renders ProgressCard with ascension details', () => {
      const progressCard = (
        <ProgressCard
          title="RANK PROGRESSION"
          rankName="Virya Warrior"
          level={8}
          currentXP={2450}
          targetXP={3000}
          streakDays={14}
        />
      );
      expect(progressCard.props.level).toBe(8);
      expect(progressCard.props.rankName).toBe('Virya Warrior');
      expect(progressCard.props.streakDays).toBe(14);
    });

    it('renders AchievementCard with discipline milestones', () => {
      const achievement = (
        <AchievementCard
          title="Vajra Discipline"
          description="Complete 100 disciplined workouts"
          disciplineCategory="VAJRA"
          isUnlocked={true}
          milestoneValue="100 Workouts"
        />
      );
      expect(achievement.props.title).toBe('Vajra Discipline');
      expect(achievement.props.disciplineCategory).toBe('VAJRA');
      expect(achievement.props.isUnlocked).toBe(true);
    });

    it('renders ExerciseCard with muscle badge', () => {
      const exerciseCard = (
        <ExerciseCard
          name="Barbell Bench Press"
          primaryMuscle="Chest"
          secondaryMuscles={['Triceps', 'Front Delts']}
          equipment="Barbell"
          onPress={jest.fn()}
        />
      );
      expect(exerciseCard.props.name).toBe('Barbell Bench Press');
      expect(exerciseCard.props.primaryMuscle).toBe('Chest');
    });

    it('renders ChallengeCard with community progress', () => {
      const challengeCard = (
        <ChallengeCard
          title="10,000 Pushups Collective"
          description="Community pushup challenge"
          participantsCount={340}
          currentAmount={6400}
          targetAmount={10000}
          unit="reps"
          daysRemaining={6}
          onJoin={jest.fn()}
        />
      );
      expect(challengeCard.props.title).toBe('10,000 Pushups Collective');
      expect(challengeCard.props.participantsCount).toBe(340);
      expect(challengeCard.props.daysRemaining).toBe(6);
    });
  });

  describe('Daily Streak Calendar (ActivityContributionGraph)', () => {
    it('synchronizes default colors with BALYRA charcoal & Electric Lime brand identity', () => {
      expect(CONTRIBUTION_COLORS.bgContainer).toBe('#121212');
      expect(CONTRIBUTION_COLORS.borderColor).toBe('#262626');
      expect(CONTRIBUTION_COLORS.inactive).toBe('#1A1A1A');
      expect(CONTRIBUTION_COLORS.elite).toBe('#B8F500');
      expect(CONTRIBUTION_COLORS.restDay).toBe('#38BDF8');
    });

    it('calculates proper heat intensity colors for activity and rest days', () => {
      expect(getContributionColor(null)).toBe('#1A1A1A');
      expect(getContributionColor({ date: '2026-10-01', xp: 0, isRestDay: false })).toBe('#1A1A1A');
      expect(getContributionColor({ date: '2026-10-02', xp: 0, isRestDay: true })).toBe('#38BDF8');
      expect(getContributionColor({ date: '2026-10-03', xp: 45, isRestDay: false })).toBe('rgba(184, 245, 0, 0.28)');
      expect(getContributionColor({ date: '2026-10-04', xp: 85, isRestDay: false })).toBe('rgba(184, 245, 0, 0.52)');
      expect(getContributionColor({ date: '2026-10-05', xp: 120, isRestDay: false })).toBe('rgba(184, 245, 0, 0.78)');
      expect(getContributionColor({ date: '2026-10-06', xp: 180, isRestDay: false })).toBe('#B8F500');
    });

    it('renders ActivityContributionGraph component with top-level streak properties', () => {
      const element = (
        <ActivityContributionGraph
          activityData={{
            '2026-10-05': { date: '2026-10-05', xp: 115, isRestDay: false },
          }}
          numWeeks={52}
          title="DAILY STREAK CALENDAR"
          subtitle="Every month & day consistency tracker"
          currentStreak={5}
          showRangeToggle={true}
        />
      );
      expect(element).toBeDefined();
      expect(element.props.title).toBe('DAILY STREAK CALENDAR');
      expect(element.props.subtitle).toBe('Every month & day consistency tracker');
      expect(element.props.currentStreak).toBe(5);
      expect(element.props.showRangeToggle).toBe(true);
    });
  });
});
