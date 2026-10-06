import { useSettingsStore, DEFAULT_SETTINGS } from '../stores/settingsStore';
import { getRankProgress, getRankByXP, MILITARY_RANKS } from '../services/progression/rankConfig';

describe('Settings Store and Warrior Ascension Logic', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetDefaults();
  });

  test('default settings initializes with expected values', () => {
    const state = useSettingsStore.getState();
    expect(state.defaultRestSeconds).toBe(90);
    expect(state.voiceCoachEnabled).toBe(true);
    expect(state.hapticsEnabled).toBe(true);
    expect(state.keepScreenAwake).toBe(true);
  });

  test('settings store updates rest timer and toggles', () => {
    useSettingsStore.getState().setDefaultRestSeconds(120);
    expect(useSettingsStore.getState().defaultRestSeconds).toBe(120);

    useSettingsStore.getState().setVoiceCoachEnabled(false);
    expect(useSettingsStore.getState().voiceCoachEnabled).toBe(false);

    useSettingsStore.getState().setHapticsEnabled(false);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);
  });

  test('rank ascension correctly computes next rank and XP delta', () => {
    // Initiate Warrior (0 - 299 XP)
    const lowXpProgress = getRankProgress(100);
    expect(lowXpProgress.currentRank.id).toBe('recruit');
    expect(lowXpProgress.nextRank?.id).toBe('private');
    expect(lowXpProgress.xpToNextRank).toBe(200);
    expect(lowXpProgress.isMaxRank).toBe(false);

    // Bronze Berserker (300 - 699 XP)
    const midXpProgress = getRankProgress(500);
    expect(midXpProgress.currentRank.id).toBe('private');
    expect(midXpProgress.nextRank?.id).toBe('private-first-class');
    expect(midXpProgress.xpToNextRank).toBe(200);

    // Warmaster Supreme (25000+ XP)
    const apexProgress = getRankProgress(30000);
    expect(apexProgress.currentRank.id).toBe('general');
    expect(apexProgress.nextRank).toBeNull();
    expect(apexProgress.isMaxRank).toBe(true);
    expect(apexProgress.xpToNextRank).toBe(0);
  });
});
