import { Platform } from 'react-native';

let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // Graceful fallback
  }
}

class AudioCoach {
  private lastSpokenText: string = '';
  private lastSpokenTimestamp: number = 0;
  private isSpeechAvailable: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSpeechAvailable = true;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Speak a coaching cue or rep count with debounce protection.
   */
  public speak(text: string, force: boolean = false, minIntervalMs: number = 2200) {
    if (this.isMuted) return;

    const now = Date.now();
    // Prevent repeating the same message in rapid succession
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTimestamp < minIntervalMs) {
      return;
    }
    if (!force && now - this.lastSpokenTimestamp < 1500) {
      return;
    }

    this.lastSpokenText = text;
    this.lastSpokenTimestamp = now;

    // Trigger haptic feedback
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Haptics fallback
    }

    // Web Speech API
    if (this.isSpeechAvailable) {
      try {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }

  public notifyRepSuccess(repNumber: number) {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Haptics fallback
    }
    this.speak(`${repNumber}`, true);
  }

  public notifyFault(faultMessage: string) {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      // Haptics fallback
    }
    this.speak(`No rep! ${faultMessage}`, true);
  }
}

export const audioCoach = new AudioCoach();

export function speakFeedback(message: string, force: boolean = true) {
  audioCoach.speak(message, force);
}

