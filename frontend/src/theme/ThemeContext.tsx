import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Animated, Easing, StyleSheet, View, useColorScheme } from 'react-native';
import { ColorTokens, darkModeColors, lightModeColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius, radii } from './radius';
import { darkShadows, lightShadows, Shadows } from './shadows';
import { animation, zIndex } from './animation';
import { useSettingsStore } from '../stores/settingsStore';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Theme {
  /** User preference: system | light | dark. */
  mode: ThemeMode;
  /** Resolved appearance. */
  isDark: boolean;
  colors: ColorTokens;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  radii: typeof radii;
  shadows: Shadows;
  animation: typeof animation;
  zIndex: typeof zIndex;
  setMode: (mode: ThemeMode) => void;
  /** Toggles between light and dark (resolves `system` first). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  // Wait for persisted preference (async on native) so we never flash the wrong theme.
  const [hydrated, setHydrated] = useState<boolean>(() =>
    useSettingsStore.persist?.hasHydrated?.() ?? true
  );
  useEffect(() => {
    const persistApi = useSettingsStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) setHydrated(true);
    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const resolvedIsDark =
    mode === 'dark' ? true : mode === 'light' ? false : systemScheme !== 'light';

  const setMode = useCallback((next: ThemeMode) => setThemeMode(next), [setThemeMode]);
  const toggleTheme = useCallback(
    () => setThemeMode(resolvedIsDark ? 'light' : 'dark'),
    [resolvedIsDark, setThemeMode]
  );

  const theme = useMemo<Theme>(
    () => ({
      mode,
      isDark: resolvedIsDark,
      colors: resolvedIsDark ? darkModeColors : lightModeColors,
      typography,
      spacing,
      radius,
      radii,
      shadows: resolvedIsDark ? darkShadows : lightShadows,
      animation,
      zIndex,
      setMode,
      toggleTheme,
    }),
    [mode, resolvedIsDark, setMode, toggleTheme]
  );

  // Subtle cross-fade when the resolved appearance changes (no app reload).
  const fade = useRef(new Animated.Value(1)).current;
  const lastIsDark = useRef(resolvedIsDark);
  useEffect(() => {
    if (lastIsDark.current === resolvedIsDark) return;
    lastIsDark.current = resolvedIsDark;
    fade.setValue(0.82);
    Animated.timing(fade, {
      toValue: 1,
      duration: animation.duration.theme,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [resolvedIsDark, fade]);

  if (!hydrated) {
    return <View style={[styles.fill, { backgroundColor: darkModeColors.background }]} />;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <Animated.View style={[styles.fill, { opacity: fade }]}>{children}</Animated.View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
