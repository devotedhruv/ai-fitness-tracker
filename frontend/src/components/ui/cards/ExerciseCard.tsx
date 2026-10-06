import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard } from '../AppCard';
import { AppBadge } from '../AppBadge';
import { Icon } from '../../Icon';

export interface ExerciseCardProps {
  name: string;
  category?: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  equipment?: string;
  onPress: () => void;
  onAdd?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ExerciseCard({
  name,
  category,
  primaryMuscle,
  equipment,
  onPress,
  onAdd,
  style,
}: ExerciseCardProps) {
  const { colors, typography } = useTheme();

  return (
    <AppCard onPress={onPress} style={style}>
      <View style={styles.contentRow}>
        <View style={styles.infoCol}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]} numberOfLines={1}>
            {name}
          </Text>

          <View style={styles.badgeRow}>
            <AppBadge label={primaryMuscle} variant="accent" size="small" />
            {equipment && (
              <View style={{ marginLeft: 6 }}>
                <AppBadge label={equipment} variant="neutral" size="small" />
              </View>
            )}
            {category && (
              <Text style={[typography.caption, { color: colors.textTertiary, marginLeft: 8 }]}>
                {category}
              </Text>
            )}
          </View>
        </View>

        {onAdd ? (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}
            onPress={onAdd}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Add ${name}`}
          >
            <Icon name="plus" size={16} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <Icon name="chevron-right" size={16} color={colors.textTertiary} />
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
