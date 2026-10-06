import { Pressable, Text, StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { useTheme } from '../tokens/ThemeContext';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, icon, onPress, style }: ChipProps) {
  const { colors, typography, radii, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? colors.accent
            : pressed
            ? colors.surfaceElevated
            : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          borderRadius: radii.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text
          style={[
            typography.captionBold,
            {
              color: selected ? colors.onAccent : colors.textPrimary,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
});
