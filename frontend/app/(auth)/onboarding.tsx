import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/tokens/ThemeContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { usersApi } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const GOALS = [
  { id: 'muscle_gain', label: 'Muscle Gain & Hypertrophy' },
  { id: 'fat_loss', label: 'Fat Loss & Conditioning' },
  { id: 'endurance', label: 'Running & Stamina' },
  { id: 'calisthenics', label: 'Calisthenics Skill Mastery' },
];

const LEVELS = [
  { id: 'BEGINNER', label: 'Beginner', desc: '< 1 year regular training' },
  { id: 'INTERMEDIATE', label: 'Intermediate', desc: '1 - 3 years structured training' },
  { id: 'ADVANCED', label: 'Advanced', desc: '3+ years continuous progression' },
];

const DAYS = [2, 3, 4, 5, 6];

const EQUIPMENT_OPTIONS = [
  'Bodyweight',
  'Dumbbells',
  'Barbell & Plates',
  'Pull-up Bar',
  'Dip Bars',
  'Resistance Bands',
  'Commercial Gym',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { updateProfile, setOnboarded } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('muscle_gain');
  const [selectedLevel, setSelectedLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'Bodyweight',
    'Dumbbells',
    'Pull-up Bar',
  ]);
  const [units, setUnits] = useState<'METRIC' | 'IMPERIAL'>('METRIC');
  const [loading, setLoading] = useState(false);

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const payload = {
        fitnessGoal: GOALS.find((g) => g.id === selectedGoal)?.label || 'General Fitness',
        experienceLevel: selectedLevel,
        daysPerWeek,
        equipment: selectedEquipment,
        units,
      };

      await usersApi.updateMe(payload);
      updateProfile(payload);
      setOnboarded(true);
      router.replace('/(tabs)/today');
    } catch {
      // In offline mode or fallback, proceed to tabs
      setOnboarded(true);
      router.replace('/(tabs)/today');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.progressHeader, { paddingHorizontal: spacing.xl, paddingTop: spacing.md }]}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[
                styles.stepBar,
                {
                  backgroundColor: s <= step ? colors.accent : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 8 }]}>
          STEP {step} OF 5
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
        {/* Step 1: Goal */}
        {step === 1 && (
          <View>
            <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              What is your primary goal?
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              We will customize your recommended workouts and progression paths.
            </Text>
            {GOALS.map((g) => (
              <Card
                key={g.id}
                onPress={() => setSelectedGoal(g.id)}
                style={[
                  styles.optionCard,
                  selectedGoal === g.id && { borderColor: colors.accent, borderWidth: 2 },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: selectedGoal === g.id ? colors.accent : colors.textPrimary },
                  ]}
                >
                  {g.label}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <View>
            <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              Your training experience?
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Helps calibrate initial routine volume and skill tree starting points.
            </Text>
            {LEVELS.map((lvl) => (
              <Card
                key={lvl.id}
                onPress={() => setSelectedLevel(lvl.id as any)}
                style={[
                  styles.optionCard,
                  selectedLevel === lvl.id && { borderColor: colors.accent, borderWidth: 2 },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: selectedLevel === lvl.id ? colors.accent : colors.textPrimary },
                  ]}
                >
                  {lvl.label}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  {lvl.desc}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Step 3: Days per week */}
        {step === 3 && (
          <View>
            <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              How many days can you commit?
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
              Choose a weekly target. You can adjust this anytime in your profile.
            </Text>
            <View style={styles.daysRow}>
              {DAYS.map((d) => (
                <Card
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={[
                    styles.dayTile,
                    daysPerWeek === d && { borderColor: colors.accent, borderWidth: 2 },
                  ]}
                >
                  <Text
                    style={[
                      typography.metricMedium,
                      { color: daysPerWeek === d ? colors.accent : colors.textPrimary },
                    ]}
                  >
                    {d}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>days/wk</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Equipment */}
        {step === 4 && (
          <View>
            <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              What equipment do you have?
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Select all equipment you have regular access to:
            </Text>
            <View style={styles.chipsContainer}>
              {EQUIPMENT_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={selectedEquipment.includes(item)}
                  onPress={() => toggleEquipment(item)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 5: Units */}
        {step === 5 && (
          <View>
            <Text style={[typography.headingLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              Select preferred units
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
              Used across workout weights, distances, and running pace calculations.
            </Text>
            <Card
              onPress={() => setUnits('METRIC')}
              style={[
                styles.optionCard,
                units === 'METRIC' && { borderColor: colors.accent, borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  { color: units === 'METRIC' ? colors.accent : colors.textPrimary },
                ]}
              >
                Metric System (kg, km, min/km)
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                Standard for Olympic lifting, Calisthenics, and global running
              </Text>
            </Card>

            <Card
              onPress={() => setUnits('IMPERIAL')}
              style={[
                styles.optionCard,
                units === 'IMPERIAL' && { borderColor: colors.accent, borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  { color: units === 'IMPERIAL' ? colors.accent : colors.textPrimary },
                ]}
              >
                Imperial System (lbs, miles, min/mi)
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                Standard for US gyms and road runners
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: spacing.lg,
          },
        ]}
      >
        {step > 1 && (
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Button title="Back" onPress={() => setStep(step - 1)} variant="secondary" />
          </View>
        )}
        <View style={{ flex: step > 1 ? 2 : 1 }}>
          {step < 5 ? (
            <Button title="Continue" onPress={() => setStep(step + 1)} variant="primary" />
          ) : (
            <Button
              title="Get Started"
              onPress={handleFinish}
              loading={loading}
              variant="primary"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  progressHeader: { marginBottom: 8 },
  stepIndicator: { flexDirection: 'row', gap: 6 },
  stepBar: { flex: 1, height: 4, borderRadius: 2 },
  content: { flexGrow: 1, paddingTop: 16 },
  optionCard: { marginBottom: 12 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dayTile: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
});
