import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAppStorage } from '../services/storage/appStorage';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  defaultRestSeconds: number;
  voiceCoachEnabled: boolean;
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  keepScreenAwake: boolean;
  autoAdvanceSets: boolean;
}

interface SettingsState extends AppSettings {
  /** User theme preference. Persisted. Default: dark. */
  themeMode: ThemePreference;
  setThemeMode: (mode: ThemePreference) => void;
  setDefaultRestSeconds: (seconds: number) => void;
  setVoiceCoachEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setKeepScreenAwake: (enabled: boolean) => void;
  setAutoAdvanceSets: (enabled: boolean) => void;
  resetDefaults: () => void;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 90,
  voiceCoachEnabled: true,
  hapticsEnabled: true,
  soundEffectsEnabled: true,
  keepScreenAwake: true,
  autoAdvanceSets: false,
};

export const DEFAULT_THEME_MODE: ThemePreference = 'dark';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      themeMode: DEFAULT_THEME_MODE,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setDefaultRestSeconds: (seconds) => set({ defaultRestSeconds: seconds }),
      setVoiceCoachEnabled: (enabled) => set({ voiceCoachEnabled: enabled }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      setSoundEffectsEnabled: (enabled) => set({ soundEffectsEnabled: enabled }),
      setKeepScreenAwake: (enabled) => set({ keepScreenAwake: enabled }),
      setAutoAdvanceSets: (enabled) => set({ autoAdvanceSets: enabled }),
      // Resetting workout defaults intentionally keeps the user's theme choice.
      resetDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'fittrack-app-settings',
      storage: createJSONStorage(getAppStorage),
    }
  )
);
