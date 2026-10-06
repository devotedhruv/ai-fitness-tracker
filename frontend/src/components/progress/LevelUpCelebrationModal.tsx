import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';

interface LevelUpCelebrationModalProps {
  visible: boolean;
  newLevel: number;
  newTitle: string;
  onDismiss: () => void;
}

export function LevelUpCelebrationModal({
  visible,
  newLevel,
  newTitle,
  onDismiss,
}: LevelUpCelebrationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.accent,
            },
          ]}
        >
          {/* Glowing Insignia Badge */}
          <View style={[styles.insigniaWrap, { backgroundColor: 'rgba(184, 245, 0, 0.15)', borderColor: colors.accent }]}>
            <Icon name="trophy" size={36} color={colors.accent} />
          </View>

          <View style={[styles.pill, { backgroundColor: 'rgba(184, 245, 0, 0.2)', borderColor: colors.accent }]}>
            <Icon name="sparkle" size={12} color={colors.accent} />
            <Text style={[styles.pillText, { color: colors.accent }]}>PROMOTION EARNED</Text>
          </View>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            LEVEL {newLevel} UNLOCKED!
          </Text>

          <Text style={[styles.titleRank, { color: colors.accent }]}>
            {newTitle}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Your disciplined training and strength progression elevated your character tier. Keep conquering your limits!
          </Text>

          {/* Reward Perks */}
          <View style={[styles.perkBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={styles.perkRow}>
              <Icon name="check-circle" size={16} color={colors.accent} />
              <Text style={[styles.perkText, { color: colors.textPrimary }]}>
                New Rank Title Unlocked
              </Text>
            </View>
            <View style={styles.perkRow}>
              <Icon name="check-circle" size={16} color={colors.accent} />
              <Text style={[styles.perkText, { color: colors.textPrimary }]}>
                Increased Weekly XP Multiplier
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDismiss}
            style={[styles.claimBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.claimBtnText}>Claim & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#B8F500',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  insigniaWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.5,
  },
  titleRank: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  perkBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  claimBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1020',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
