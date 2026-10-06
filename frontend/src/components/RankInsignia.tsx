import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path, Rect, Polygon, G, Circle } from 'react-native-svg';
import { useTheme } from '../tokens/ThemeContext';
import { MilitaryRank, MILITARY_RANKS } from '../services/progression/rankConfig';

export type InsigniaSize = 'sm' | 'md' | 'lg' | 'hero' | number;

export interface RankInsigniaProps {
  rankIdOrType: string;
  size?: InsigniaSize;
  color?: string;
  secondaryColor?: string;
  style?: StyleProp<ViewStyle>;
}

function resolveSize(size: InsigniaSize): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 24;
    case 'md':
      return 40;
    case 'lg':
      return 64;
    case 'hero':
      return 96;
    default:
      return 40;
  }
}

export function RankInsignia({
  rankIdOrType,
  size = 'md',
  color,
  secondaryColor,
  style,
}: RankInsigniaProps) {
  const { colors } = useTheme();
  const dimension = resolveSize(size);

  const primary = color || colors.accent; // Electric Lime #B8F500
  const secondary = secondaryColor || colors.textSecondary; // Slate #94A3B8
  const navyBg = colors.surfaceElevated; // Deep Navy #202840

  // Resolve insignia type from rank id or direct type
  let type = rankIdOrType;
  const matchedRank = MILITARY_RANKS.find((r) => r.id === rankIdOrType);
  if (matchedRank) {
    type = matchedRank.insigniaType;
  }

  const renderInsigniaGraphic = () => {
    switch (type) {
      case 'recruit-bar':
      case 'recruit':
      case 'initiate-warrior':
        return (
          // Initiate Warrior: Broad Gladius Dagger with Crossguard
          <G>
            <Rect x="20" y="52" width="60" height="8" rx="2" fill={secondary} />
            <Rect x="46" y="60" width="8" height="18" rx="2" fill={secondary} />
            <Circle cx="50" cy="82" r="6" fill={primary} />
            <Polygon points="50,14 62,48 50,52 38,48" fill={primary} />
            <Polygon points="50,14 50,52 38,48" fill={secondary} opacity={0.3} />
          </G>
        );

      case 'single-chevron':
      case 'private':
      case 'bronze-berserker':
        return (
          // Bronze Berserker: Crossed War Daggers
          <G>
            <Path d="M22 22 L74 74 L68 80 L16 28 Z" fill={primary} />
            <Polygon points="74,74 84,64 78,84" fill={secondary} />
            <Path d="M78 22 L26 74 L32 80 L84 28 Z" fill={primary} />
            <Polygon points="26,74 16,64 22,84" fill={secondary} />
            <Circle cx="50" cy="48" r="6" fill={navyBg} />
            <Circle cx="50" cy="48" r="3" fill={primary} />
          </G>
        );

      case 'chevron-rocker':
      case 'private-first-class':
      case 'steel-gladiator':
        return (
          // Steel Gladiator: Arena Hoplon Shield with Iron Boss
          <G>
            <Circle cx="50" cy="50" r="36" fill={navyBg} stroke={primary} strokeWidth="5" />
            <Circle cx="50" cy="50" r="26" fill="transparent" stroke={secondary} strokeWidth="2" strokeDasharray="4,4" />
            <Circle cx="50" cy="50" r="14" fill={primary} />
            <Polygon points="50,28 54,40 66,40 56,48 60,60 50,52 40,60 44,48 34,40 46,40" fill={navyBg} />
          </G>
        );

      case 'double-chevron':
      case 'corporal':
      case 'spartan-vanguard':
        return (
          // Spartan Vanguard: Round Hoplon Shield with Greek Lambda (Λ) & Spear Tip
          <G>
            <Circle cx="50" cy="50" r="38" fill={navyBg} stroke={primary} strokeWidth="5" />
            <Polygon points="50,22 68,72 56,72 50,48 44,72 32,72" fill={primary} />
            <Polygon points="50,6 56,18 44,18" fill={primary} />
          </G>
        );

      case 'triple-chevron':
      case 'sergeant':
      case 'shadow-blade':
        return (
          // Shadow Blade: Twin Crossed Curved Scythes with Kunai Crest
          <G>
            <Path d="M18 72 C18 40 40 18 78 18 C78 30 50 36 34 56 L42 66 L26 78 Z" fill={primary} />
            <Path d="M82 72 C82 40 60 18 22 18 C22 30 50 36 66 56 L58 66 L74 78 Z" fill={secondary} opacity={0.85} />
            <Polygon points="50,28 58,46 50,72 42,46" fill={primary} />
            <Circle cx="50" cy="80" r="4" fill={primary} />
          </G>
        );

      case 'triple-rocker':
      case 'staff-sergeant':
      case 'crimson-warlord':
        return (
          // Crimson Warlord: Double-Headed Heavy Battleaxe (Labrys)
          <G>
            {/* Axe Shaft */}
            <Rect x="47" y="10" width="6" height="80" rx="3" fill={primary} />
            <Circle cx="50" cy="90" r="5" fill={secondary} />
            <Polygon points="50,6 54,12 46,12" fill={secondary} />
            {/* Left Axe Blade */}
            <Path
              d="M47 24 C28 20 14 36 14 52 C28 48 38 56 47 62 Z"
              fill={primary}
            />
            {/* Right Axe Blade */}
            <Path
              d="M53 24 C72 20 86 36 86 52 C72 48 62 56 53 62 Z"
              fill={primary}
            />
            {/* Central Axe Core Reinforcement */}
            <Circle cx="50" cy="40" r="7" fill={navyBg} stroke={secondary} strokeWidth="2" />
            <Polygon points="50,35 53,42 47,42" fill={primary} />
          </G>
        );

      case 'single-bar':
      case 'lieutenant':
      case 'iron-warrior':
        return (
          // Iron Warrior: Tower Heater Shield with Upright Broadsword
          <G>
            {/* Heater Shield Silhouette */}
            <Path
              d="M24 18 L76 18 L76 52 C76 74 50 88 50 88 C50 88 24 74 24 52 Z"
              fill={navyBg}
              stroke={primary}
              strokeWidth="4"
            />
            {/* Crossguard */}
            <Rect x="34" y="38" width="32" height="6" rx="2" fill={secondary} />
            {/* Blade */}
            <Polygon points="50,14 54,38 46,38" fill={primary} />
            {/* Hilt and Pommel */}
            <Rect x="48" y="44" width="4" height="22" rx="1" fill={secondary} />
            <Circle cx="50" cy="68" r="4" fill={primary} />
          </G>
        );

      case 'double-bar':
      case 'captain':
      case 'valiant-champion':
        return (
          // Valiant Champion: Heraldic War Helm with Lion Visor and Dual Crest Plumes
          <G>
            {/* Crest Plumes */}
            <Path d="M50 10 C38 10 32 24 32 36 L50 32 L68 36 C68 24 62 10 50 10 Z" fill={secondary} />
            {/* Helmet Dome */}
            <Path d="M30 36 C30 26 70 26 70 36 L72 62 C72 74 50 84 50 84 C50 84 28 74 28 62 Z" fill={navyBg} stroke={primary} strokeWidth="4" />
            {/* Eye Visor T-Slit */}
            <Path d="M36 48 L64 48 L64 54 L53 54 L53 70 L47 70 L47 54 L36 54 Z" fill={primary} />
            {/* Cheek Guard Rivets */}
            <Circle cx="35" cy="64" r="2.5" fill={secondary} />
            <Circle cx="65" cy="64" r="2.5" fill={secondary} />
          </G>
        );

      case 'diamond-leaf':
      case 'major':
      case 'thunder-berserker':
        return (
          // Thunder Berserker: Two-Handed War Hammer with Lightning Flashes
          <G>
            {/* Hammer Shaft */}
            <Rect x="47" y="24" width="6" height="66" rx="3" fill={secondary} />
            <Circle cx="50" cy="88" r="4.5" fill={primary} />
            {/* Hammer Head - Heavy Block with Beveled Strike Faces */}
            <Rect x="20" y="22" width="60" height="24" rx="4" fill={primary} />
            <Rect x="28" y="25" width="44" height="18" rx="2" fill={navyBg} />
            {/* Center Lightning Sigil */}
            <Polygon points="53,27 46,34 51,34 47,41 54,33 49,33" fill={primary} />
            {/* Top Spike */}
            <Polygon points="50,10 56,22 44,22" fill={secondary} />
          </G>
        );

      case 'eagle-crest':
      case 'colonel':
      case 'mythic-warlord':
        return (
          // Mythic Warlord: Dragon Crest with Wyvern Wings & Dragon Crown
          <G>
            {/* Left Wyvern Wing */}
            <Path d="M46 44 L14 18 L24 46 L12 56 L34 64 L46 54 Z" fill={primary} />
            {/* Right Wyvern Wing */}
            <Path d="M54 44 L86 18 L76 46 L88 56 L66 64 L54 54 Z" fill={primary} />
            {/* Center Dragon Crest Shield */}
            <Path d="M50 22 L66 36 L58 72 L50 86 L42 72 L34 36 Z" fill={navyBg} stroke={secondary} strokeWidth="3" />
            {/* Dragon Eye / Jewel */}
            <Circle cx="50" cy="46" r="6" fill={primary} />
            <Polygon points="50,34 54,42 46,42" fill={secondary} />
            <Polygon points="50,58 54,50 46,50" fill={secondary} />
          </G>
        );

      case 'winged-star':
      case 'commander':
      case 'immortal-titan':
        return (
          // Immortal Titan: 8-Pointed Celestial Star with Winged Titan Guard
          <G>
            {/* Side Guard Wings */}
            <Path d="M44 48 L12 32 L20 66 L38 74 L44 64 Z" fill={secondary} opacity={0.9} />
            <Path d="M56 48 L88 32 L80 66 L62 74 L56 64 Z" fill={secondary} opacity={0.9} />
            {/* 8-Pointed Star Outer */}
            <Polygon
              points="50,12 58,34 80,26 66,44 88,50 66,56 80,74 58,66 50,88 42,66 20,74 34,56 12,50 34,44 20,26 42,34"
              fill={primary}
            />
            {/* Inner Core */}
            <Circle cx="50" cy="50" r="10" fill={navyBg} stroke={secondary} strokeWidth="2.5" />
            <Circle cx="50" cy="50" r="5" fill={primary} />
          </G>
        );

      case 'general-wreath':
      case 'general':
      case 'warmaster-supreme':
      default:
        return (
          // Warmaster Supreme: Apex Crown & Golden Laurel Wreath with Crossed Greatswords
          <G>
            {/* Crossed Greatswords in Background */}
            <Path d="M22 22 L78 78" stroke={secondary} strokeWidth="4" strokeLinecap="round" />
            <Path d="M78 22 L22 78" stroke={secondary} strokeWidth="4" strokeLinecap="round" />
            {/* Champion Laurel Wreath */}
            <Path
              d="M24 64 C14 46 18 26 36 16 C30 26 32 44 42 54 C34 58 28 62 24 64 Z"
              fill={primary}
            />
            <Path
              d="M76 64 C86 46 82 26 64 16 C70 26 68 44 58 54 C66 58 72 62 76 64 Z"
              fill={primary}
            />
            {/* Apex Sun Crest Shield */}
            <Polygon
              points="50,22 57,36 74,38 61,49 66,66 50,56 34,66 39,49 26,38 43,36"
              fill={secondary}
            />
            <Circle cx="50" cy="46" r="6" fill={navyBg} stroke={primary} strokeWidth="2" />
            {/* Golden Star Base */}
            <Polygon points="50,68 53,76 61,77 55,82 57,90 50,85 43,90 45,82 39,77 47,76" fill={primary} />
          </G>
        );
    }
  };

  return (
    <View style={[{ width: dimension, height: dimension, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={dimension} height={dimension} viewBox="0 0 100 100">
        {renderInsigniaGraphic()}
      </Svg>
    </View>
  );
}
