import { darkModeColors, lightModeColors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radii } from '../tokens/spacing';

describe('Design Tokens Validation', () => {
  it('Dark mode tokens must match the exact specification', () => {
    expect(darkModeColors.background).toBe('#000000');
    expect(darkModeColors.backgroundSecondary).toBe('#0A0A0A');
    expect(darkModeColors.surface).toBe('#121212');
    expect(darkModeColors.surfaceElevated).toBe('#1A1A1A');
    expect(darkModeColors.border).toBe('#262626');
    expect(darkModeColors.textPrimary).toBe('#FFFFFF');
    expect(darkModeColors.textSecondary).toBe('#A3A3A3');
    expect(darkModeColors.mutedText).toBe('#737373');
    expect(darkModeColors.accent).toBe('#B8F500');
    expect(darkModeColors.accentPressed).toBe('#8FC700');
    expect(darkModeColors.softLime).toBe('#D7FF66');
    expect(darkModeColors.onAccent).toBe('#000000');
  });

  it('Light mode tokens must match the exact specification', () => {
    expect(lightModeColors.background).toBe('#FFFFFF');
    expect(lightModeColors.backgroundSecondary).toBe('#F5F5F5');
    expect(lightModeColors.surface).toBe('#FFFFFF');
    expect(lightModeColors.surfaceElevated).toBe('#FAFAFA');
    expect(lightModeColors.border).toBe('#E5E5E5');
    expect(lightModeColors.textPrimary).toBe('#000000');
    expect(lightModeColors.textSecondary).toBe('#666666');
    expect(lightModeColors.mutedText).toBe('#8E8E8E');
    expect(lightModeColors.accent).toBe('#78A800');
    expect(lightModeColors.accentPressed).toBe('#628A00');
    expect(lightModeColors.softLime).toBe('#E9F7B8');
    expect(lightModeColors.onAccent).toBe('#FFFFFF');
  });

  it('Typography hierarchy specifies expected font sizes and tabular nums', () => {
    expect(typography.display.fontSize).toBe(34);
    expect(typography.metric.fontSize).toBe(36);
    expect(typography.metric.fontVariant).toContain('tabular-nums');
  });

  it('Spacing and radii scales are defined consistently', () => {
    expect(spacing.md).toBe(16);
    expect(radii.md).toBe(12);
    expect(radii.lg).toBe(16);
  });
});
