import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { ExerciseAnatomyViewer } from './ExerciseAnatomyViewer';
import { ExerciseMedia } from '../../services/exerciseMedia/types';

interface ExerciseMediaViewerProps {
  media: ExerciseMedia;
  height?: number;
  aspectRatio?: number;
  fitMode?: 'cover' | 'contain';
  autoPlay?: boolean;
  showModeSwitcher?: boolean;
  defaultMode?: string;
  style?: StyleProp<ViewStyle>;
  onTap?: () => void;
  onDoExercise?: () => void;
  setNumber?: number;
}

export function ExerciseMediaViewer({
  media,
  height,
  aspectRatio = 16 / 9,
  fitMode = 'cover',
  autoPlay = true,
  style,
  onTap,
  onDoExercise,
  setNumber,
}: ExerciseMediaViewerProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Media Viewport */}
      <View style={styles.viewport}>
        {media.videoUrl ? (
          <ExerciseVideoPlayer
            videoUrl={media.videoUrl}
            thumbnailUrl={media.thumbnailUrl || media.imageUrl}
            height={height}
            aspectRatio={aspectRatio}
            fitMode={fitMode}
            autoPlay={autoPlay}
            onTap={onTap}
            onDoExercise={onDoExercise}
            exerciseId={media.exerciseId}
            exerciseName={media.exerciseName}
            primaryMuscle={media.primaryMuscles?.[0]}
            setNumber={setNumber}
          />
        ) : (
          <ExerciseAnatomyViewer
            imageUrl={(media.imageUrl || media.thumbnailUrl)!}
            exerciseName={media.exerciseName}
            primaryMuscles={media.primaryMuscles}
            secondaryMuscles={media.secondaryMuscles}
            height={height || 220}
            onTap={onTap}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  viewport: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
});
