import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line, G, Polygon } from 'react-native-svg';
import { StyleProp, ViewStyle, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { staticColors } from '../theme/staticColors';

export type IconName =
  | 'today'
  | 'train'
  | 'progress'
  | 'profile'
  | 'dumbbell'
  | 'barbell'
  | 'flame'
  | 'heart'
  | 'heart-fill'
  | 'heart-outline'
  | 'trophy'
  | 'medal'
  | 'medal-gold'
  | 'medal-silver'
  | 'medal-bronze'
  | 'timer'
  | 'clock'
  | 'snowflake'
  | 'users'
  | 'runner'
  | 'bike'
  | 'camera'
  | 'sparkle'
  | 'alert'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'x'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'arrow-right'
  | 'edit'
  | 'mail'
  | 'clipboard'
  | 'map-pin'
  | 'instagram'
  | 'x-social'
  | 'strava'
  | 'upload'
  | 'folder'
  | 'link'
  | 'volume'
  | 'volume-mute'
  | 'refresh'
  | 'flip-camera'
  | 'satellite'
  | 'gps'
  | 'info'
  | 'lock'
  | 'plus'
  | 'play'
  | 'pause'
  | 'target'
  | 'award'
  | 'trending-up'
  | 'bell'
  | 'gear'
  | 'search'
  | 'robot'
  | 'community'
  | 'message-circle'
  | 'comment'
  | 'share'
  | 'bookmark'
  | 'bookmark-fill'
  | 'more-vertical'
  | 'image'
  | 'video'
  | 'flag'
  | 'trash'
  | 'send'
  // Exercise specific illustrations
  | 'exercise-squat'
  | 'exercise-pushup'
  | 'exercise-pullup'
  | 'exercise-plank'
  | 'exercise-lunge'
  | 'exercise-curl'
  | 'exercise-jumping-jack'
  | 'exercise-stretch'
  | 'exercise-yoga';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Icon({
  name,
  size = 24,
  color: colorProp,
  style,
  accessibilityLabel,
}: IconProps) {
  let defaultColor: string = staticColors.white;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    defaultColor = useTheme().colors.textPrimary;
  } catch {
    // Rendered outside ThemeProvider (e.g. isolated tests) — keep static fallback.
  }
  const color = colorProp ?? defaultColor;

  const renderPath = () => {
    switch (name) {
      // Navigation / Today
      case 'today':
      case 'sparkle':
        return (
          <>
            <Path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Train / Dumbbell
      case 'train':
      case 'dumbbell':
        return (
          <>
            <Path
              d="M6.5 6.5L17.5 17.5"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <Path
              d="M4 9L9 4L11 6L6 11L4 9Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M15 20L20 15L18 13L13 18L15 20Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line x1="2" y1="11" x2="5" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="19" y1="16" x2="22" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      // Barbell
      case 'barbell':
        return (
          <>
            <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <Rect x="5" y="7" width="2.5" height="10" rx="1" fill={color} />
            <Rect x="7.5" y="5" width="2" height="14" rx="1" fill={color} />
            <Rect x="16.5" y="7" width="2.5" height="10" rx="1" fill={color} />
            <Rect x="14.5" y="5" width="2" height="14" rx="1" fill={color} />
          </>
        );

      // Progress / Trending Up
      case 'progress':
        return (
          <>
            <Polyline
              points="22 7 13.5 15.5 8.5 10.5 2 17"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="16 7 22 7 22 13"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Profile / User
      case 'profile':
        return (
          <>
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Path
              d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Flame / Streak / Burn
      case 'flame':
        return (
          <>
            <Path
              d="M12 2C9.5 5.5 7 8.5 7 12.5C7 16.6421 10.3579 20 14.5 20C17.5 20 19.5 17.5 19.5 14C19.5 9 15 6 12 2Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M13.5 17C12 17 11 15.8 11 14.5C11 13 12.5 11.5 13.5 10C14.5 11.5 16 13 16 14.5C16 15.8 15 17 13.5 17Z"
              fill={color}
            />
          </>
        );

      // Heart (Filled)
      case 'heart':
      case 'heart-fill':
        return (
          <Path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill={color}
          />
        );

      // Heart (Outline)
      case 'heart-outline':
        return (
          <Path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      // Trophy
      case 'trophy':
        return (
          <>
            <Path
              d="M8 21H16M12 17V21M6 4H18C18 10 15 14 12 14C9 14 6 10 6 4Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M6 7H3C2.44772 7 2 7.44772 2 8C2 10.5 4 12 6 12M18 7H21C21.5523 7 22 7.44772 22 8C22 10.5 20 12 18 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Medals
      case 'medal':
      case 'medal-gold':
      case 'medal-silver':
      case 'medal-bronze': {
        const medalFill =
          name === 'medal-gold'
            ? staticColors.tier.gold
            : name === 'medal-silver'
            ? staticColors.tier.silver
            : name === 'medal-bronze'
            ? staticColors.tier.bronze
            : color;
        return (
          <>
            <Circle cx="12" cy="15" r="6" stroke={medalFill} strokeWidth="2" fill="none" />
            <Path
              d="M8.5 2L10.5 9.5M15.5 2L13.5 9.5M12 2V9"
              stroke={medalFill}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <Circle cx="12" cy="15" r="2.5" fill={medalFill} />
          </>
        );
      }

      // Award / Ribbon Badge
      case 'award':
        return (
          <>
            <Circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" fill="none" />
            <Path
              d="M15.477 12.89L17 22L12 19L7 22L8.523 12.89"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Trending Up
      case 'trending-up':
        return (
          <>
            <Polyline
              points="23 6 13.5 15.5 8.5 10.5 1 18"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="17 6 23 6 23 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Timer / Stopwatch
      case 'timer':
      case 'clock':
        return (
          <>
            <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2" fill="none" />
            <Polyline points="12 9 12 13 14.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="10" y1="2" x2="14" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      // Snowflake / Freeze
      case 'snowflake':
        return (
          <>
            <Line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="3.34" y1="7" x2="20.66" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="3.34" y1="17" x2="20.66" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="12" r="1.5" fill={color} />
          </>
        );

      // Users / Community
      case 'users':
        return (
          <>
            <Path
              d="M17 21V19C17 17.3431 15.6569 16 14 16H8C6.34315 16 5 17.3431 5 19V21"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="11" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Path
              d="M19 16C20.6569 16 22 17.3431 22 19V21"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M16 3.13C17.18 3.57 18 4.69 18 6C18 7.31 17.18 8.43 16 8.87"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      // Runner
      case 'runner':
        return (
          <>
            <Circle cx="13" cy="4" r="2.2" fill={color} />
            <Path
              d="M6 13L9 11L12 13L15 8L18 9"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M11 13L10 18L7 22M14 13L16 17L20 18"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Bicycle
      case 'bike':
      case 'strava':
        return (
          <>
            <Circle cx="5.5" cy="16.5" r="3.5" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="18.5" cy="16.5" r="3.5" stroke={color} strokeWidth="2" fill="none" />
            <Polyline
              points="5.5 16.5 10 16.5 12 11 15 11 18.5 16.5"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M12 11L9.5 6H7M15 11L12.5 16.5"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Camera / AI View
      case 'camera':
        return (
          <>
            <Path
              d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 3H15L17 6H21C22.1 6 23 6.9 23 8V19Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" fill="none" />
          </>
        );

      // Robot / AI
      case 'robot':
        return (
          <>
            <Rect x="4" y="6" width="16" height="13" rx="3" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="2" r="1" fill={color} />
            <Circle cx="8.5" cy="11.5" r="1.5" fill={color} />
            <Circle cx="15.5" cy="11.5" r="1.5" fill={color} />
            <Line x1="8" y1="15.5" x2="16" y2="15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </>
        );

      // Alert / Warning
      case 'alert':
        return (
          <>
            <Path
              d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 20.1 2.45 21 3.55 21H20.45C21.55 21 22.45 20.1 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C12.94 2.53 11.06 2.53 10.29 3.86Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1" fill={color} />
          </>
        );

      // Check / Check Circle
      case 'check':
        return (
          <Polyline
            points="20 6 9 17 4 12"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'check-circle':
        return (
          <>
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
            <Polyline
              points="16 9 10.5 14.5 8 12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Close / Cross
      case 'close':
      case 'x':
        return (
          <>
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          </>
        );

      // Chevrons & Arrows
      case 'chevron-left':
      case 'arrow-left':
        return (
          <Polyline
            points="15 18 9 12 15 6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-right':
      case 'arrow-right':
        return (
          <Polyline
            points="9 18 15 12 9 6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // Edit / Pencil
      case 'edit':
        return (
          <Path
            d="M17 3C17.26 2.73 17.58 2.52 17.93 2.38C18.28 2.24 18.65 2.17 19.03 2.17C19.41 2.17 19.78 2.24 20.13 2.38C20.48 2.52 20.8 2.73 21.06 3C21.32 3.26 21.54 3.58 21.68 3.93C21.82 4.28 21.89 4.65 21.89 5.03C21.89 5.41 21.82 5.78 21.68 6.13C21.54 6.48 21.32 6.8 21.06 7.06L7.5 20.5L3 21.5L4 17L17 3Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // Mail / Envelope
      case 'mail':
        return (
          <>
            <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Polyline
              points="3 7 12 13 21 7"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // Clipboard / Routine
      case 'clipboard':
        return (
          <>
            <Path
              d="M16 4H18C19.1 4 20 4.9 20 6V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V6C4 4.9 4.9 4 6 4H8"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="16" x2="13" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      // Map Pin / Location
      case 'map-pin':
        return (
          <>
            <Path
              d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="none" />
          </>
        );

      // Instagram
      case 'instagram':
        return (
          <>
            <Rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="17.5" cy="6.5" r="1" fill={color} />
          </>
        );

      // X (Twitter)
      case 'x-social':
        return (
          <Path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            fill={color}
          />
        );

      // Upload / Folder / Link
      case 'upload':
        return (
          <>
            <Path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Polyline points="17 8 12 3 7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'folder':
        return (
          <Path
            d="M22 19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H9L11 6H20C21.1 6 22 6.9 22 8V19Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'link':
        return (
          <>
            <Path
              d="M10 13C10.45 13.57 11.04 14.03 11.72 14.34C12.4 14.65 13.14 14.8 13.88 14.78C14.63 14.76 15.36 14.56 16.01 14.2C16.66 13.84 17.22 13.33 17.63 12.71L20.63 8.21C21.39 7.07 21.6 5.65 21.2 4.31C20.81 2.97 19.85 1.86 18.57 1.25C17.28 0.64 15.79 0.58 14.47 1.11C13.14 1.63 12.11 2.68 11.63 4L11 5.5"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M14 11C13.55 10.43 12.96 9.97 12.28 9.66C11.6 9.35 10.86 9.2 10.12 9.22C9.37 9.24 8.64 9.44 7.99 9.8C7.34 10.16 6.78 10.67 6.37 11.29L3.37 15.79C2.61 16.93 2.4 18.35 2.8 19.69C3.19 21.03 4.15 22.14 5.43 22.75C6.72 23.36 8.21 23.42 9.53 22.89C10.86 22.37 11.89 21.32 12.37 20L13 18.5"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      // Audio Cues
      case 'volume':
        return (
          <>
            <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M15.54 8.46C16.48 9.4 17 10.64 17 12C17 13.36 16.48 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'volume-mute':
        return (
          <>
            <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="23" y1="9" x2="17" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="17" y1="9" x2="23" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      // Camera Flip / Refresh
      case 'refresh':
      case 'flip-camera':
        return (
          <>
            <Path
              d="M21.5 2V6H17.5M2.5 22V18H6.5M20.49 9A9 9 0 0 0 5.64 5.64L2.5 8M3.51 15A9 9 0 0 0 18.36 18.36L21.5 16"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      // GPS / Satellite
      case 'satellite':
      case 'gps':
        return (
          <>
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          </>
        );

      // Info
      case 'info':
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="8" r="1" fill={color} />
          </>
        );

      case 'plus':
        return (
          <>
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </>
        );

      case 'target':
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="2" fill={color} />
          </>
        );

      case 'bell':
        return (
          <>
            <Path
              d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path d="M13.73 21A2 2 0 0 1 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'gear':
        return (
          <>
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Path
              d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L20.09 17.18C20.66 17.75 20.66 18.68 20.09 19.25L19.25 20.09C18.68 20.66 17.75 20.66 17.18 20.09L16.82 19.73A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 13.5 20.8V21.3C13.5 22.1 12.9 22.7 12.1 22.7H10.9C10.1 22.7 9.5 22.1 9.5 21.3V20.8A1.65 1.65 0 0 0 8 19.4A1.65 1.65 0 0 0 6.18 19.73L5.82 20.09C5.25 20.66 4.32 20.66 3.75 20.09L2.91 19.25C2.34 18.68 2.34 17.75 2.91 17.18L3.27 16.82A1.65 1.65 0 0 0 3.6 15A1.65 1.65 0 0 0 2.2 13.5H1.7C0.9 13.5 0.3 12.9 0.3 12.1V10.9C0.3 10.1 0.9 9.5 1.7 9.5H2.2A1.65 1.65 0 0 0 3.6 8A1.65 1.65 0 0 0 3.27 6.18L2.91 5.82C2.34 5.25 2.34 4.32 2.91 3.75L3.75 2.91C4.32 2.34 5.25 2.34 5.82 2.91L6.18 3.27A1.65 1.65 0 0 0 8 3.6A1.65 1.65 0 0 0 9.5 2.2V1.7C9.5 0.9 10.1 0.3 10.9 0.3H12.1C12.9 0.3 13.5 0.9 13.5 1.7V2.2A1.65 1.65 0 0 0 15 3.6A1.65 1.65 0 0 0 16.82 3.27L17.18 2.91C17.75 2.34 18.68 2.34 19.25 2.91L20.09 3.75C20.66 4.32 20.66 5.25 20.09 5.82L19.73 6.18A1.65 1.65 0 0 0 19.4 8A1.65 1.65 0 0 0 20.8 9.5H21.3C22.1 9.5 22.7 10.1 22.7 10.9V12.1C22.7 12.9 22.1 13.5 21.3 13.5H20.8A1.65 1.65 0 0 0 19.4 15Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </>
        );

      case 'search':
        return (
          <>
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      // Community / Social Feed Icons
      case 'community':
        return (
          <>
            <Path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx="12" cy="11" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M23 21V19C22.99 18.13 22.37 17.38 21.5 17.1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M16 7.13C16.87 7.4 17.5 8.15 17.5 9.02C17.5 9.89 16.87 10.64 16 10.91" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M1 21V19C1.01 18.13 1.63 17.38 2.5 17.1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M8 7.13C7.13 7.4 6.5 8.15 6.5 9.02C6.5 9.89 7.13 10.64 8 10.91" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );

      case 'message-circle':
      case 'comment':
        return (
          <Path
            d="M21 11.5A8.38 8.38 0 0 1 12 20A8.5 8.5 0 0 1 7.5 18.7L3 20L4.3 15.5A8.38 8.38 0 0 1 3 11.5A8.5 8.5 0 0 1 12 3A8.5 8.5 0 0 1 21 11.5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'share':
        return (
          <>
            <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
          </>
        );

      case 'bookmark':
        return (
          <Path
            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'bookmark-fill':
        return (
          <Path
            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={color}
          />
        );

      case 'more-vertical':
        return (
          <>
            <Circle cx="12" cy="5" r="1.5" fill={color} />
            <Circle cx="12" cy="12" r="1.5" fill={color} />
            <Circle cx="12" cy="19" r="1.5" fill={color} />
          </>
        );

      case 'image':
        return (
          <>
            <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
            <Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );

      case 'video':
        return (
          <>
            <Polygon points="23 7 16 12 23 17 23 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Rect x="1" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );

      case 'flag':
        return (
          <>
            <Path d="M4 15S6 13 10 13S14 15 18 15S20 13 20 13V3S18 5 14 5S10 3 6 3S4 5 4 5V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );

      case 'trash':
        return (
          <>
            <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'send':
        return (
          <Path
            d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'lock':
        return (
          <>
            <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M7 11V7A5 5 0 0 1 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'play':
        return (
          <Polygon points="5 3 19 12 5 21 5 3" fill={color} />
        );

      case 'pause':
        return (
          <>
            <Rect x="6" y="4" width="4" height="16" rx="1" fill={color} />
            <Rect x="14" y="4" width="4" height="16" rx="1" fill={color} />
          </>
        );

      // Exercise Specific Movement Illustrations
      case 'exercise-squat':
        return (
          <>
            {/* Athlete performing squat */}
            <Circle cx="12" cy="4" r="2" fill={color} />
            {/* Torso & hips angled */}
            <Path
              d="M12 6.5L10 11L14 13L10 17L12 21"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Thigh parallel / knee angle */}
            <Path
              d="M10 11L7 13L5 11M14 13L17 15L19 19"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 'exercise-pushup':
        return (
          <>
            {/* Head */}
            <Circle cx="4.5" cy="10" r="1.8" fill={color} />
            {/* Horizontal body line */}
            <Line x1="6.5" y1="11" x2="19" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            {/* Arms bent 90 degrees */}
            <Polyline
              points="9 11.5 9 15 11 15"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Feet on floor */}
            <Line x1="19" y1="14" x2="20" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Floor baseline */}
            <Line x1="2" y1="17" x2="22" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
          </>
        );

      case 'exercise-pullup':
        return (
          <>
            {/* Bar */}
            <Line x1="3" y1="3" x2="21" y2="3" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            {/* Head over bar */}
            <Circle cx="12" cy="2.5" r="1.8" fill={color} />
            {/* Arms pulling */}
            <Polyline
              points="8 3 10 6 12 7.5 14 6 16 3"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Torso & legs hanging */}
            <Line x1="12" y1="7.5" x2="12" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <Path
              d="M12 14L10 19L11 22M12 14L14 19L13 22"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 'exercise-plank':
        return (
          <>
            <Circle cx="4" cy="11" r="1.8" fill={color} />
            {/* Straight rigid body line */}
            <Line x1="6" y1="12" x2="20" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            {/* Forearm vertical */}
            <Line x1="8" y1="12.5" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="17" x2="10" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Toes on floor */}
            <Line x1="20" y1="15" x2="21" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="2" y1="18" x2="22" y2="18" stroke={color} strokeWidth="1" strokeDasharray="3 2" />
          </>
        );

      case 'exercise-lunge':
        return (
          <>
            <Circle cx="12" cy="4" r="2" fill={color} />
            <Line x1="12" y1="6" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Front leg 90 deg */}
            <Polyline points="12 12 16 14 16 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Back leg extended */}
            <Polyline points="12 12 8 16 5 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      case 'exercise-curl':
        return (
          <>
            {/* Torso & Head */}
            <Circle cx="10" cy="5" r="2" fill={color} />
            <Line x1="10" y1="7" x2="10" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Arm curled with dumbbell */}
            <Polyline points="10 9 13 13 13 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <Rect x="11.5" y="7" width="3" height="4" rx="0.8" fill={color} />
          </>
        );

      case 'exercise-jumping-jack':
        return (
          <>
            <Circle cx="12" cy="4" r="2" fill={color} />
            <Line x1="12" y1="6" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Arms up in V */}
            <Line x1="12" y1="8" x2="6" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="12" y1="8" x2="18" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Legs out in inverted V */}
            <Line x1="12" y1="13" x2="6" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="12" y1="13" x2="18" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'exercise-stretch':
      case 'exercise-yoga':
        return (
          <>
            {/* Meditative/balance yoga posture */}
            <Circle cx="12" cy="4" r="2" fill={color} />
            <Line x1="12" y1="6" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Arms gracefully extended */}
            <Path d="M4 10C8 9 16 9 20 10" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Standing balance */}
            <Line x1="12" y1="14" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Polyline points="12 14 16 16 14 19 12 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );

      default:
        return <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none" />;
    }
  };

  return (
    <View
      style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || name}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {renderPath()}
      </Svg>
    </View>
  );
}
