import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RunSplitData } from '../../stores/activeRunStore';
import { formatPace, formatDuration } from '../../services/gps/geoUtils';
import { useTheme } from '../../tokens/ThemeContext';
import { Card } from '../Card';
import { Icon } from '../Icon';

interface RunSplitsTableProps {
  splits: RunSplitData[];
}

export function RunSplitsTable({ splits }: RunSplitsTableProps) {
  const { colors, typography } = useTheme();

  if (splits.length === 0) return null;

  // Find best split
  const bestPace = Math.min(...splits.map((s) => s.paceSecKm));

  return (
    <Card style={styles.container}>
      <Text style={[typography.captionBold, { color: colors.accent, marginBottom: 8 }]}>
        KILOMETER SPLITS
      </Text>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCol, { width: 44, color: colors.textSecondary }]}>KM</Text>
        <Text style={[styles.headerCol, { flex: 1, color: colors.textSecondary }]}>TIME</Text>
        <Text style={[styles.headerCol, { flex: 1, textAlign: 'right', color: colors.textSecondary }]}>
          PACE
        </Text>
      </View>

      {splits.map((split) => {
        const isBest = split.paceSecKm === bestPace && splits.length > 1;

        return (
          <View
            key={split.splitNumber}
            style={[
              styles.row,
              {
                borderBottomColor: colors.border,
                backgroundColor: isBest ? 'rgba(52, 199, 89, 0.08)' : 'transparent',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', width: 44 }}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                {split.splitNumber}
              </Text>
              {isBest && <Icon name="today" size={10} color="#34C759" style={{ marginLeft: 3 }} />}
            </View>

            <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
              {formatDuration(split.durationSeconds)}
            </Text>

            <Text
              style={[
                typography.bodyBold,
                {
                  color: isBest ? '#34C759' : colors.textPrimary,
                  flex: 1,
                  textAlign: 'right',
                },
              ]}
            >
              {formatPace(split.paceSecKm)}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerCol: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
});
