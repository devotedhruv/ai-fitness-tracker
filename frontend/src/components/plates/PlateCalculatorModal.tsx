import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { calculateBarbellPlates } from '../../services/plates/plateCalculator';
import { BarbellVisualizer } from './BarbellVisualizer';
import { useTheme } from '../../tokens/ThemeContext';
import { Button } from '../Button';
import { Icon } from '../Icon';

interface PlateCalculatorModalProps {
  visible: boolean;
  initialWeight?: number;
  unit?: 'METRIC' | 'IMPERIAL';
  onClose: () => void;
  onApplyWeight: (weight: number) => void;
}

export function PlateCalculatorModal({
  visible,
  initialWeight = 60,
  unit = 'METRIC',
  onClose,
  onApplyWeight,
}: PlateCalculatorModalProps) {
  const { colors, typography } = useTheme();

  const isMetric = unit === 'METRIC';
  const defaultBarWeight = isMetric ? 20 : 45;
  const unitLabel = isMetric ? 'kg' : 'lb';

  const [weight, setWeight] = useState<number>(initialWeight || (isMetric ? 60 : 135));
  const [barWeight, setBarWeight] = useState<number>(defaultBarWeight);

  const calculation = useMemo(() => {
    return calculateBarbellPlates(weight, barWeight, unit);
  }, [weight, barWeight, unit]);

  const handleAdjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(barWeight, prev + delta));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                Plate Math Calculator
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Visual barbell loader & sleeve breakdown
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Bar Weight Selector */}
          <View style={styles.barWeightRow}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              BARBELL TYPE:
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: isMetric ? '20kg Olympic' : '45lb Olympic', val: isMetric ? 20 : 45 },
                { label: isMetric ? '15kg Women\'s' : '35lb Women\'s', val: isMetric ? 15 : 35 },
              ].map((b) => (
                <TouchableOpacity
                  key={b.val}
                  style={[
                    styles.barSelectChip,
                    {
                      backgroundColor: barWeight === b.val ? colors.accent : colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setBarWeight(b.val)}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: barWeight === b.val ? '#000' : colors.textPrimary, fontSize: 11 },
                    ]}
                  >
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Visual Barbell Representation */}
          <BarbellVisualizer calculation={calculation} unit={unitLabel} />

          {/* Target Weight Adjustment Buttons */}
          <View style={styles.adjustRow}>
            {[-10, -5, -2.5, +2.5, +5, +10].map((delta) => (
              <TouchableOpacity
                key={delta}
                style={[styles.deltaBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => handleAdjustWeight(delta)}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: delta > 0 ? colors.accent : colors.textSecondary, fontSize: 12 },
                  ]}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Numeric Input */}
          <View style={styles.manualInputRow}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              TARGET {unitLabel.toUpperCase()}:
            </Text>
            <TextInput
              style={[
                styles.weightInput,
                { color: colors.textPrimary, borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
              ]}
              keyboardType="numeric"
              value={String(weight)}
              onChangeText={(val) => setWeight(parseFloat(val) || 0)}
              selectTextOnFocus
            />
          </View>

          {/* Action Button */}
          <View style={styles.actionRow}>
            <Button
              title={`Apply ${calculation.actualWeight} ${unitLabel} to Set`}
              variant="primary"
              onPress={() => {
                onApplyWeight(calculation.actualWeight);
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    padding: 6,
  },
  barWeightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barSelectChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  deltaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 46,
    alignItems: 'center',
  },
  manualInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  weightInput: {
    width: 90,
    height: 38,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  actionRow: {
    marginTop: 14,
  },
});
