import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { MovementPattern } from '../../services/exerciseMedia/types';

interface ExerciseAnimationModelProps {
  movementPattern: MovementPattern;
  exerciseName: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  height?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  style?: StyleProp<ViewStyle>;
  onTap?: () => void;
}

export function ExerciseAnimationModel({
  movementPattern,
  exerciseName,
  primaryMuscles = [],
  secondaryMuscles = [],
  height = 240,
  autoPlay = true,
  showControls = true,
  style,
  onTap,
}: ExerciseAnimationModelProps) {
  const { colors, isDark } = useTheme();

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [phase, setPhase] = useState(0); // 0 (start) -> 1 (peak deflection) -> 0
  const [isMuted, setIsMuted] = useState(true);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const progressRef = useRef<number>(0);
  const directionRef = useRef<number>(1);

  // Smooth sinusoidal movement cycle (rep cadence: ~2.8 seconds per full cycle)
  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const duration = 2800; // ms
    lastTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      progressRef.current += (delta / duration) * directionRef.current;

      if (progressRef.current >= 1) {
        progressRef.current = 1;
        directionRef.current = -1;
      } else if (progressRef.current <= 0) {
        progressRef.current = 0;
        directionRef.current = 1;
      }

      // Smooth ease-in-out cosine curve
      const smoothPhase = 0.5 - 0.5 * Math.cos(progressRef.current * Math.PI);
      setPhase(smoothPhase);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restartAnimation = () => {
    progressRef.current = 0;
    directionRef.current = 1;
    setPhase(0);
    setIsPlaying(true);
  };

  // Color tokens
  const primaryHighlight = colors.accent; // Electric Lime #B8F500
  const secondaryHighlight = colors.accentBright || '#D7FF66';
  const skeletonColor = isDark ? '#475569' : '#94A3B8';
  const jointColor = isDark ? '#E2E8F0' : '#0F172A';
  const equipmentColor = isDark ? '#94A3B8' : '#334155';
  const groundColor = isDark ? '#1E293B' : '#E2E8F0';

  // Movement Phase Label
  const getPhaseLabel = () => {
    if (progressRef.current < 0.1 || progressRef.current > 0.9) return 'LOCKOUT / RESET';
    if (directionRef.current === 1) return 'ECCENTRIC (LOWERING)';
    return 'CONCENTRIC (DRIVE)';
  };

  const renderVectorFigure = () => {
    // Coordinate Space: 300 x 240
    switch (movementPattern) {
      case 'SQUAT': {
        // Squat: Hip and knee flex downward, torso tilts slightly, barbell on traps lowers
        const hipDrop = phase * 46;
        const kneeShift = phase * 16;
        const torsoLean = phase * 12;

        const headX = 150 + torsoLean;
        const headY = 48 + hipDrop;
        const shoulderX = 150 + torsoLean * 0.8;
        const shoulderY = 72 + hipDrop;
        const hipX = 142 - torsoLean * 0.4;
        const hipY = 120 + hipDrop;
        const kneeX = 162 + kneeShift;
        const kneeY = 156 + hipDrop * 0.5;
        const ankleX = 150;
        const ankleY = 205;

        // Barbell
        const barY = shoulderY - 4;

        return (
          <G>
            {/* Ground */}
            <Line x1="70" y1="215" x2="230" y2="215" stroke={groundColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Target Muscle Highlight (Quads & Glutes) */}
            <Path
              d={`M ${hipX} ${hipY} Q ${hipX + 16} ${hipY + (kneeY - hipY) * 0.5} ${kneeX} ${kneeY}`}
              stroke={primaryHighlight}
              strokeWidth="9"
              strokeLinecap="round"
              opacity={0.85 + phase * 0.15}
            />
            {/* Glute highlight */}
            <Circle cx={hipX - 4} cy={hipY + 4} r="10" fill={secondaryHighlight} opacity={0.6 + phase * 0.3} />

            {/* Torso */}
            <Line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={skeletonColor} strokeWidth="5.5" strokeLinecap="round" />

            {/* Head */}
            <Circle cx={headX} cy={headY} r="14" fill={jointColor} />

            {/* Arms holding bar */}
            <Path
              d={`M ${shoulderX} ${shoulderY} L ${shoulderX + 14} ${shoulderY + 12} L ${shoulderX - 4} ${barY}`}
              stroke={skeletonColor}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Lower Leg (Shin) */}
            <Line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke={skeletonColor} strokeWidth="4.5" strokeLinecap="round" />
            {/* Foot */}
            <Line x1={ankleX - 6} y1={ankleY} x2={ankleX + 18} y2={ankleY} stroke={jointColor} strokeWidth="5" strokeLinecap="round" />

            {/* Joints */}
            <Circle cx={hipX} cy={hipY} r="5" fill={jointColor} />
            <Circle cx={kneeX} cy={kneeY} r="5" fill={primaryHighlight} />
            <Circle cx={ankleX} cy={ankleY} r="4" fill={jointColor} />

            {/* Barbell & Plates */}
            <Line x1="90" y1={barY} x2="210" y2={barY} stroke={equipmentColor} strokeWidth="4" strokeLinecap="round" />
            <Rect x="94" y={barY - 14} width="6" height="28" rx="2" fill={equipmentColor} />
            <Rect x="200" y={barY - 14} width="6" height="28" rx="2" fill={equipmentColor} />
          </G>
        );
      }

      case 'BENCH_PRESS': {
        // Bench Press: Lifter lying horizontal, bar lowers toward chest and presses up
        const barDrop = phase * 48; // Bar lowering to chest
        const barY = 82 + barDrop;
        const elbowX = 150 + phase * 22;
        const elbowY = 120 + phase * 16;

        return (
          <G>
            {/* Bench Structure */}
            <Rect x="75" y="146" width="150" height="12" rx="4" fill={groundColor} />
            <Line x1="90" y1="158" x2="90" y2="215" stroke={groundColor} strokeWidth="4" />
            <Line x1="210" y1="158" x2="210" y2="215" stroke={groundColor} strokeWidth="4" />

            {/* Lifter Body on Bench */}
            <Circle cx="96" cy="138" r="14" fill={jointColor} /> {/* Head */}
            <Line x1="108" y1="144" x2="186" y2="144" stroke={skeletonColor} strokeWidth="6" strokeLinecap="round" /> {/* Torso */}
            {/* Legs & Feet on Floor */}
            <Path d="M 186 144 L 204 162 L 204 215" stroke={skeletonColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />

            {/* Primary Muscle Highlight (Chest / Pectorals) */}
            <Circle cx="138" cy="140" r="14" fill={primaryHighlight} opacity={0.6 + (1 - phase) * 0.4} />

            {/* Arms & Triceps Highlight */}
            <Path
              d={`M 132 144 L ${elbowX} ${elbowY} L 150 ${barY}`}
              stroke={secondaryHighlight}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Barbell & Plates */}
            <Line x1="80" y1={barY} x2="220" y2={barY} stroke={equipmentColor} strokeWidth="4.5" strokeLinecap="round" />
            <Rect x="86" y={barY - 16} width="8" height="32" rx="2" fill={equipmentColor} />
            <Rect x="206" y={barY - 16} width="8" height="32" rx="2" fill={equipmentColor} />
          </G>
        );
      }

      case 'DEADLIFT': {
        // Deadlift: Lifter hinges from ground to full upright lockout
        const lift = (1 - phase) * 44; // 0 at top, 44 at floor
        const hipShift = (1 - phase) * 18;

        const hipY = 114 + lift;
        const shoulderY = 70 + lift;
        const barY = 152 + lift;
        const kneeY = 160 + lift * 0.4;

        return (
          <G>
            {/* Ground */}
            <Line x1="60" y1="215" x2="240" y2="215" stroke={groundColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Hamstring & Glute Highlight */}
            <Path
              d={`M ${146 - hipShift} ${hipY} Q ${156} ${hipY + (kneeY - hipY) * 0.5} 150 ${kneeY}`}
              stroke={primaryHighlight}
              strokeWidth="8"
              strokeLinecap="round"
              opacity={0.7 + (1 - phase) * 0.3}
            />

            {/* Torso & Head */}
            <Line x1={154} y1={shoulderY} x2={146 - hipShift} y2={hipY} stroke={skeletonColor} strokeWidth="5.5" strokeLinecap="round" />
            <Circle cx={156} cy={shoulderY - 22} r="13" fill={jointColor} />

            {/* Legs */}
            <Line x1={146 - hipShift} y1={hipY} x2={150} y2={kneeY} stroke={skeletonColor} strokeWidth="4.5" strokeLinecap="round" />
            <Line x1={150} y1={kneeY} x2={150} y2="210" stroke={skeletonColor} strokeWidth="4.5" strokeLinecap="round" />

            {/* Arms holding bar straight down */}
            <Line x1={154} y1={shoulderY} x2={152} y2={barY} stroke={skeletonColor} strokeWidth="4" strokeLinecap="round" />

            {/* Barbell & Plates */}
            <Line x1="84" y1={barY} x2="216" y2={barY} stroke={equipmentColor} strokeWidth="4" strokeLinecap="round" />
            <Circle cx="88" cy={barY} r="18" fill="none" stroke={equipmentColor} strokeWidth="4" />
            <Circle cx="212" cy={barY} r="18" fill="none" stroke={equipmentColor} strokeWidth="4" />
          </G>
        );
      }

      case 'OVERHEAD_PRESS': {
        // Overhead Press: Barbell moves vertically from collarbone to overhead lockout
        const pressHeight = phase * 54;
        const barY = 86 - pressHeight;

        return (
          <G>
            {/* Ground */}
            <Line x1="80" y1="215" x2="220" y2="215" stroke={groundColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Standing Body */}
            <Circle cx="150" cy="74" r="14" fill={jointColor} /> {/* Head */}
            <Line x1="150" y1="88" x2="150" y2="148" stroke={skeletonColor} strokeWidth="5.5" strokeLinecap="round" /> {/* Torso */}
            <Line x1="150" y1="148" x2="142" y2="212" stroke={skeletonColor} strokeWidth="4.5" strokeLinecap="round" /> {/* Left Leg */}
            <Line x1="150" y1="148" x2="158" y2="212" stroke={skeletonColor} strokeWidth="4.5" strokeLinecap="round" /> {/* Right Leg */}

            {/* Deltoids / Shoulder Highlight */}
            <Circle cx="138" cy="94" r="9" fill={primaryHighlight} opacity={0.7 + phase * 0.3} />
            <Circle cx="162" cy="94" r="9" fill={primaryHighlight} opacity={0.7 + phase * 0.3} />

            {/* Arms extending upward */}
            <Path
              d={`M 140 94 L ${134 - phase * 6} ${110 - pressHeight * 0.4} L 138 ${barY}`}
              stroke={secondaryHighlight}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M 160 94 L ${166 + phase * 6} ${110 - pressHeight * 0.4} L 162 ${barY}`}
              stroke={secondaryHighlight}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Barbell & Plates */}
            <Line x1="90" y1={barY} x2="210" y2={barY} stroke={equipmentColor} strokeWidth="4" strokeLinecap="round" />
            <Rect x="94" y={barY - 14} width="6" height="28" rx="2" fill={equipmentColor} />
            <Rect x="200" y={barY - 14} width="6" height="28" rx="2" fill={equipmentColor} />
          </G>
        );
      }

      case 'PULLUP': {
        // Pullup: Pullup bar at top, athlete pulls chin above bar
        const pullUp = phase * 44;
        const chinY = 96 - pullUp;
        const shoulderY = 114 - pullUp;
        const barY = 52;

        return (
          <G>
            {/* Pull-up Bar */}
            <Line x1="70" y1={barY} x2="230" y2={barY} stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />

            {/* Hands on Bar */}
            <Circle cx="126" cy={barY} r="5" fill={jointColor} />
            <Circle cx="174" cy={barY} r="5" fill={jointColor} />

            {/* Lats Highlight (V-taper) */}
            <Path
              d={`M 140 ${shoulderY + 6} L 132 ${shoulderY + 30} L 168 ${shoulderY + 30} L 160 ${shoulderY + 6} Z`}
              fill={primaryHighlight}
              opacity={0.6 + phase * 0.4}
            />

            {/* Head */}
            <Circle cx="150" cy={chinY - 14} r="13" fill={jointColor} />

            {/* Torso & Legs */}
            <Line x1="150" y1={shoulderY} x2="150" y2={shoulderY + 54} stroke={skeletonColor} strokeWidth="5" strokeLinecap="round" />
            <Path d={`M 150 ${shoulderY + 54} L 146 ${shoulderY + 104} L 158 ${shoulderY + 112}`} stroke={skeletonColor} strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Arms flexing to pull up */}
            <Path
              d={`M 126 ${barY} L ${120 + phase * 8} ${barY + (shoulderY - barY) * 0.5} L 142 ${shoulderY}`}
              stroke={secondaryHighlight}
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M 174 ${barY} L ${180 - phase * 8} ${barY + (shoulderY - barY) * 0.5} L 158 ${shoulderY}`}
              stroke={secondaryHighlight}
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      }

      default: {
        // Universal Athletic Kinetic Guide with primary muscle highlight and rhythmic breathing pulse
        const pulse = 1 + phase * 0.08;
        return (
          <G>
            {/* Floor line */}
            <Line x1="70" y1="215" x2="230" y2="215" stroke={groundColor} strokeWidth="2.5" strokeLinecap="round" />

            {/* Anatomical Athlete Body */}
            <Circle cx="150" cy="58" r="15" fill={jointColor} />
            <Line x1="150" y1="73" x2="150" y2="140" stroke={skeletonColor} strokeWidth="6" strokeLinecap="round" />

            {/* Legs */}
            <Line x1="150" y1="140" x2="136" y2="210" stroke={skeletonColor} strokeWidth="5" strokeLinecap="round" />
            <Line x1="150" y1="140" x2="164" y2="210" stroke={skeletonColor} strokeWidth="5" strokeLinecap="round" />

            {/* Active Muscular Focus Core / Chest / Back Glow */}
            <Circle cx="150" cy="100" r={22 * pulse} fill={primaryHighlight} opacity={0.6 + phase * 0.3} />

            {/* Arms in active ready stance */}
            <Path
              d={`M 150 82 L 126 ${104 + phase * 14} L 118 ${136 - phase * 10}`}
              stroke={secondaryHighlight}
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M 150 82 L 174 ${104 + phase * 14} L 182 ${136 - phase * 10}`}
              stroke={secondaryHighlight}
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Joint Markers */}
            <Circle cx="150" cy="140" r="5" fill={jointColor} />
            <Circle cx="136" cy="175" r="4.5" fill={jointColor} />
            <Circle cx="164" cy="175" r="4.5" fill={jointColor} />
          </G>
        );
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Interactive Demonstration Canvas (Tap to Play/Pause) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          togglePlay();
          onTap?.();
        }}
        style={[
          styles.canvasContainer,
          {
            height,
            backgroundColor: isDark ? '#0F1628' : '#F1F5F9',
            borderColor: colors.border,
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 300 240">
          <Defs>
            <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={primaryHighlight} stopOpacity="0.4" />
              <Stop offset="1" stopColor={primaryHighlight} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Background grid markings for athletic/kinetic feel */}
          <Line x1="150" y1="20" x2="150" y2="220" stroke={groundColor} strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />
          <Line x1="50" y1="120" x2="250" y2="120" stroke={groundColor} strokeWidth="1" strokeDasharray="4 4" opacity={0.6} />

          {/* Animated Vector Exercise Figure */}
          {renderVectorFigure()}
        </Svg>

        {/* Phase Indicator Badge (Top Left) */}
        <View style={[styles.phaseBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.pulsingDot, { backgroundColor: isPlaying ? primaryHighlight : colors.warning }]} />
          <Text style={[styles.phaseText, { color: colors.textPrimary }]}>
            {isPlaying ? getPhaseLabel() : 'PAUSED'}
          </Text>
        </View>

        {/* Muscle Focus Tag (Top Right) */}
        {primaryMuscles.length > 0 && (
          <View style={[styles.muscleTag, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }]}>
            <Text style={[styles.muscleTagText, { color: primaryHighlight }]}>
              {primaryMuscles[0].toUpperCase()}
            </Text>
          </View>
        )}

        {/* Play State Overlay Icon when paused */}
        {!isPlaying && (
          <View style={[styles.pausedOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.45)' }]}>
            <View style={[styles.playCircle, { backgroundColor: colors.accent }]}>
              <Icon name="play" size={24} color={colors.onAccent} />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Control Bar (Optional) */}
      {showControls && (
        <View style={[styles.controlsRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={togglePlay}
            accessibilityLabel={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={16} color={colors.accent} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={restartAnimation}
            accessibilityLabel="Restart demonstration"
          >
            <Icon name="refresh" size={16} color={colors.textSecondary} />
            <Text style={[styles.controlBtnText, { color: colors.textSecondary }]}>Restart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => setIsMuted(!isMuted)}
            accessibilityLabel={isMuted ? 'Unmute cadence' : 'Mute cadence'}
          >
            <Icon name={isMuted ? 'volume-mute' : 'volume'} size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  canvasContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  phaseBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  muscleTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  muscleTagText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  controlBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
  },
});
