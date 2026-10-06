import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';

interface ExerciseAnatomyViewerProps {
  imageUrl: string;
  exerciseName: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  height?: number;
  style?: StyleProp<ViewStyle>;
  onTap?: () => void;
}

export function ExerciseAnatomyViewer({
  imageUrl,
  exerciseName,
  primaryMuscles = [],
  secondaryMuscles = [],
  height = 240,
  style,
  onTap,
}: ExerciseAnatomyViewerProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={onTap ? 0.9 : 1}
      onPress={onTap}
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* 3D Anatomical Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={[styles.centerOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.6)' }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading Anatomy View...
          </Text>
        </View>
      )}

      {/* Error Fallback */}
      {hasError && (
        <View style={[styles.centerOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.9)' }]}>
          <Icon name="info" size={24} color={colors.accent} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Anatomical Visual
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            {exerciseName}
          </Text>
        </View>
      )}

      {/* Muscle Highlights Overlay */}
      <View style={styles.topInfoBar}>
        <View style={[styles.tagBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.tagText, { color: colors.accent }]}>TARGET MUSCLES</Text>
        </View>
      </View>

      {/* Bottom Muscles Badge Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.muscleList}>
          {primaryMuscles.map((muscle, idx) => (
            <View
              key={`prim-${idx}`}
              style={[
                styles.musclePill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
              ]}
            >
              <View style={[styles.muscleDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.muscleName, { color: colors.textPrimary }]}>{muscle}</Text>
            </View>
          ))}
          {secondaryMuscles.map((muscle, idx) => (
            <View
              key={`sec-${idx}`}
              style={[
                styles.musclePill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <View style={[styles.muscleDot, { backgroundColor: colors.textSecondary }]} />
              <Text style={[styles.muscleName, { color: colors.textSecondary }]}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  errorTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  errorSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },
  topInfoBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 5,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 5,
  },
  muscleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  musclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  muscleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  muscleName: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
