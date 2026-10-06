/**
 * Theme-INDEPENDENT color constants.
 *
 * Only for things that must look identical in both themes:
 *  - content drawn over camera/video/map/story imagery (white text on scrims)
 *  - rank-tier metals
 *  - pose-skeleton overlay lines
 * Everything else must come from `useTheme().colors`.
 */
export const staticColors = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  /** For text/icons on top of photos, video, camera, maps. */
  onMedia: '#FFFFFF',
  onMediaMuted: 'rgba(255, 255, 255, 0.72)',
  onMediaFaint: 'rgba(255, 255, 255, 0.4)',
  mediaScrim: 'rgba(0, 0, 0, 0.45)',
  mediaScrimStrong: 'rgba(0, 0, 0, 0.7)',
  mediaChip: 'rgba(0, 0, 0, 0.55)',
  mediaChipBorder: 'rgba(255, 255, 255, 0.18)',
  mediaBackdrop: '#000000',

  /** Pose skeleton overlay (AI form detection) — brand + semantic hues. */
  pose: {
    good: '#35D07F',
    warning: '#FFB52E',
    bad: '#FF4D4D',
    neutral: '#FFFFFF',
  },

  /** Rank / tier metals. */
  tier: {
    bronze: '#B87333',
    silver: '#B4BCC8',
    gold: '#FFD166',
    platinum: '#7FD6D0',
    diamond: '#5DA9FF',
    master: '#FF8A1F',
    legend: '#FFB52E',
  },
} as const;

export type StaticColors = typeof staticColors;
