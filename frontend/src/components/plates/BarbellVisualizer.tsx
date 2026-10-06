import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlateCalculationResult } from '../../services/plates/plateCalculator';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';

interface BarbellVisualizerProps {
  calculation: PlateCalculationResult;
  unit?: string;
}

export function BarbellVisualizer({ calculation, unit = 'kg' }: BarbellVisualizerProps) {
  const { colors, typography } = useTheme();

  // Flatten plate instances for sleeve rendering
  const platesList: { weight: number; color: string; diameterRatio: number }[] = [];
  calculation.platesPerSide.forEach((item) => {
    for (let i = 0; i < item.count; i++) {
      platesList.push(item.plate);
    }
  });

  return (
    <View style={styles.container}>
      {/* Target Weight Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBlock}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>TOTAL WEIGHT</Text>
          <Text style={[styles.summaryVal, { color: colors.accent }]}>
            {calculation.actualWeight} {unit}
          </Text>
        </View>

        <View style={styles.summaryBlock}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>PER SIDE</Text>
          <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
            {calculation.weightPerSide} {unit}
          </Text>
        </View>

        <View style={styles.summaryBlock}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>BAR</Text>
          <Text style={[styles.summaryVal, { color: colors.textSecondary }]}>
            {calculation.barWeight} {unit}
          </Text>
        </View>
      </View>

      {/* Barbell Sleeve Graphic */}
      <View style={[styles.barbellStage, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {/* Shaft Section */}
        <View style={styles.shaft} />
        
        {/* Collar / Shoulder */}
        <View style={styles.collar} />

        {/* Sleeve */}
        <View style={styles.sleeveContainer}>
          <View style={styles.sleeveBar} />

          {/* Render loaded plates from collar outward */}
          <View style={styles.platesRow}>
            {platesList.map((p, idx) => {
              const plateHeight = Math.max(30, 80 * p.diameterRatio);
              const plateWidth = p.weight >= 20 ? 14 : p.weight >= 10 ? 11 : 8;

              return (
                <View
                  key={idx}
                  style={[
                    styles.plate,
                    {
                      height: plateHeight,
                      width: plateWidth,
                      backgroundColor: p.color,
                      borderColor: '#111',
                    },
                  ]}
                >
                  <Text style={styles.plateLabel}>{p.weight}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Plate Counts Chips */}
      <View style={styles.plateListChips}>
        {calculation.platesPerSide.length === 0 ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Empty bar — no plates needed
          </Text>
        ) : (
          calculation.platesPerSide.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.chip,
                {
                  borderColor: item.plate.color,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: item.plate.color }]} />
              <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
                {item.count} × {item.plate.weight}{unit}
              </Text>
            </View>
          ))
        )}
      </View>

      {!calculation.isExact && (
        <View style={styles.warningContainer}>
          <Icon name="alert" size={14} color="#FF9500" style={{ marginRight: 6 }} />
          <Text style={[styles.warningText, { color: '#FF9500' }]}>
            Target has {calculation.remainder} {unit} remainder not loadable with available plates.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  summaryBlock: {
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  barbellStage: {
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  shaft: {
    width: 60,
    height: 12,
    backgroundColor: '#8E8E93',
    borderRadius: 2,
  },
  collar: {
    width: 14,
    height: 48,
    backgroundColor: '#C7C7CC',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#636366',
  },
  sleeveContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  sleeveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#AEAEB2',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  platesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    paddingLeft: 2,
    gap: 3,
  },
  plate: {
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateLabel: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    transform: [{ rotate: '-90deg' }],
  },
  plateListChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
