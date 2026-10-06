import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { useSocialStore, CommunityChallenge } from '../../stores/socialStore';

interface ChallengesSectionProps {
  onSelectChallenge?: (challenge: CommunityChallenge) => void;
}

export function ChallengesSection({ onSelectChallenge }: ChallengesSectionProps) {
  const { colors } = useTheme();
  const challenges = useSocialStore((state) => state.challenges);
  const joinChallenge = useSocialStore((state) => state.joinChallenge);
  const logChallengeProgress = useSocialStore((state) => state.logChallengeProgress);

  const handleJoin = (challenge: CommunityChallenge) => {
    joinChallenge(challenge.id);
    Alert.alert(
      'Challenge Accepted!',
      `You joined "${challenge.title}". Push hard to claim the ${challenge.badgeName} badge!`,
      [{ text: 'To Battle', style: 'default' }]
    );
  };

  const handleLogProgress = (challenge: CommunityChallenge) => {
    const addAmt = challenge.unit === 'kg' ? 2500 : 10;
    logChallengeProgress(challenge.id, addAmt);
    Alert.alert(
      'Progress Recorded',
      `Logged +${addAmt.toLocaleString()} ${challenge.unit} towards "${challenge.title}"! Keep the fire burning.`,
      [{ text: 'Done', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>SQUAD CHALLENGES</Text>
          <Text style={styles.sectionSubtitle}>Compete with warriors across the globe</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>ACTIVE</Text>
        </View>
      </View>

      {challenges.map((challenge) => {
        const percent = Math.min(
          100,
          Math.round((challenge.currentAmount / challenge.targetAmount) * 100)
        );

        return (
          <View key={challenge.id} style={styles.challengeCard}>
            {/* Top row: Badge and Days remaining */}
            <View style={styles.cardTopRow}>
              <View style={styles.badgePill}>
                <Text style={styles.badgeEmoji}>🔱</Text>
                <Text style={styles.badgeName}>{challenge.badgeName}</Text>
              </View>
              <Text style={styles.daysLeftText}>{challenge.daysRemaining} days left</Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDesc}>{challenge.description}</Text>

            {/* Progress Bar & Stats */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressAmountText}>
                  {challenge.currentAmount.toLocaleString()} / {challenge.targetAmount.toLocaleString()}{' '}
                  {challenge.unit}
                </Text>
                <Text style={styles.percentText}>{percent}%</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: percent >= 100 ? '#B8F500' : '#F59E0B',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Stats row & Actions */}
            <View style={styles.cardFooter}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantCount}>
                  👥 {challenge.participantsCount.toLocaleString()} warriors
                </Text>
                {challenge.userRank && (
                  <Text style={styles.userRankText}>
                    Rank #{challenge.userRank}
                  </Text>
                )}
              </View>

              {challenge.isJoined ? (
                <TouchableOpacity
                  style={styles.logProgressBtn}
                  activeOpacity={0.8}
                  onPress={() => handleLogProgress(challenge)}
                >
                  <Icon name="today" size={14} color="#000000" />
                  <Text style={styles.logProgressBtnText}>Log Effort</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.joinBtn}
                  activeOpacity={0.8}
                  onPress={() => handleJoin(challenge)}
                >
                  <Text style={styles.joinBtnText}>Join Challenge</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  sectionSubtitle: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B8F500',
  },
  liveText: {
    color: '#B8F500',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  challengeCard: {
    backgroundColor: '#121212',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeName: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  daysLeftText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  challengeDesc: {
    color: '#A3A3A3',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressAmountText: {
    color: '#E5E5E5',
    fontSize: 12,
    fontWeight: '700',
  },
  percentText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#202020',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
  },
  participantCount: {
    color: '#737373',
    fontSize: 12,
  },
  userRankText: {
    color: '#B8F500',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  joinBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  logProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B8F500',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  logProgressBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});
