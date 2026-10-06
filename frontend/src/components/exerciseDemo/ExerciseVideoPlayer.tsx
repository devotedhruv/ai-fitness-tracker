import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  StyleProp,
  Image,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { exerciseOfflineMediaService } from '../../services/exerciseMedia/ExerciseOfflineMediaService';

// Safely require expo-video for native platforms
let useVideoPlayer: any = null;
let VideoView: any = null;
if (Platform.OS !== 'web') {
  try {
    const expoVideo = require('expo-video');
    useVideoPlayer = expoVideo.useVideoPlayer;
    VideoView = expoVideo.VideoView;
  } catch (e) {
    // Falls back gracefully
  }
}

const LOCAL_VIDEO_MAP: Record<string, any> = {
  '/videos/lever_pec_deck_fly.mp4': require('../../../assets/videos/lever_pec_deck_fly.mp4'),
  '/videos/barbell_bench_press.mp4': require('../../../assets/videos/barbell_bench_press.mp4'),
  '/videos/barbell_squat.mp4': require('../../../assets/videos/barbell_squat.mp4'),
  '/videos/barbell_row.mp4': require('../../../assets/videos/barbell_row.mp4'),
  '/videos/barbell_deadlift.mp4': require('../../../assets/videos/barbell_deadlift.mp4'),
  '/videos/pull_up.mp4': require('../../../assets/videos/pull_up.mp4'),
  '/videos/push_up.mp4': require('../../../assets/videos/push_up.mp4'),
  '/videos/standing_calf_raise.mp4': require('../../../assets/videos/standing_calf_raise.mp4'),
  '/videos/overhead_press.mp4': require('../../../assets/videos/overhead_press.mp4'),
  '/videos/dips.mp4': require('../../../assets/videos/dips.mp4'),
  '/videos/barbell_curl.mp4': require('../../../assets/videos/barbell_curl.mp4'),
  '/videos/lat_pulldown.mp4': require('../../../assets/videos/lat_pulldown.mp4'),
  '/videos/incline_dumbbell_press.mp4': require('../../../assets/videos/incline_dumbbell_press.mp4'),
  '/videos/plank.mp4': require('../../../assets/videos/plank.mp4'),
  '/videos/cable_tricep_pushdown.mp4': require('../../../assets/videos/cable_tricep_pushdown.mp4'),
  '/videos/lateral_raise.mp4': require('../../../assets/videos/lateral_raise.mp4'),
  '/videos/walking_lunges.mp4': require('../../../assets/videos/walking_lunges.mp4'),
};

interface ExerciseVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  height?: number;
  aspectRatio?: number;
  fitMode?: 'cover' | 'contain';
  autoPlay?: boolean;
  isLooping?: boolean;
  style?: StyleProp<ViewStyle>;
  onTap?: () => void;
  onDoExercise?: () => void;
  exerciseId?: string;
  exerciseName?: string;
  primaryMuscle?: string;
  setNumber?: number;
}

export function ExerciseVideoPlayer({
  videoUrl,
  thumbnailUrl,
  height,
  aspectRatio = 16 / 9,
  fitMode = 'cover',
  autoPlay = true,
  isLooping = true,
  style,
  onTap,
  onDoExercise,
  exerciseId,
  exerciseName,
  primaryMuscle,
  setNumber = 1,
}: ExerciseVideoPlayerProps) {
  const { colors } = useTheme();

  let router: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useRouter } = require('expo-router');
    router = useRouter();
  } catch {
    // Fallback if expo-router is not available
  }

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentFitMode] = useState<'cover' | 'contain'>(fitMode);
  const [resolvedMediaUri, setResolvedMediaUri] = useState<string>(videoUrl);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);

  const handleDoExercise = () => {
    if (onDoExercise) {
      onDoExercise();
      return;
    }
    if (router) {
      router.push({
        pathname: '/workout/vision-tracker',
        params: {
          exerciseId: exerciseId || '',
          exerciseName: exerciseName || 'Exercise',
          primaryMuscle: primaryMuscle || '',
          fromActiveWorkout: 'true',
          activeSetNumber: String(setNumber || 1),
        },
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    exerciseOfflineMediaService.resolveOfflineMediaUri(videoUrl).then((uri) => {
      if (isMounted && uri) {
        setResolvedMediaUri(uri);
        setIsOfflineCached(uri.startsWith('file://') || uri.startsWith('/'));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [videoUrl]);


  // Web HTML5 Video reference
  const webVideoRef = useRef<HTMLVideoElement | null>(null);

  // Resolve native video source
  const resolvedNativeSource =
    Platform.OS !== 'web' && typeof resolvedMediaUri === 'string' && LOCAL_VIDEO_MAP[resolvedMediaUri]
      ? LOCAL_VIDEO_MAP[resolvedMediaUri]
      : resolvedMediaUri;

  // Native expo-video player
  let nativePlayer: any = null;
  if (Platform.OS !== 'web' && useVideoPlayer) {
    try {
      nativePlayer = useVideoPlayer(resolvedNativeSource, (player: any) => {
        player.loop = isLooping;
        player.muted = isMuted;
        if (autoPlay) {
          player.play();
        }
      });
    } catch {
      // Handled via fallback
    }
  }

  // Synchronize play/pause state for web
  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      if (isPlaying) {
        webVideoRef.current.play().catch(() => {
          // Browser autoplay restriction, require user interaction
          setIsPlaying(false);
        });
      } else {
        webVideoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Synchronize mute state for web
  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const isGif = (videoUrl || '').toLowerCase().includes('.gif');

  const togglePlayPause = () => {
    if (isGif) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (Platform.OS === 'web') {
      setIsPlaying(!isPlaying);
    } else if (nativePlayer) {
      if (isPlaying) {
        nativePlayer.pause();
        setIsPlaying(false);
      } else {
        nativePlayer.play();
        setIsPlaying(true);
      }
    }
  };

  const restartVideo = () => {
    if (isGif) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
      return;
    }
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.currentTime = 0;
      webVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (nativePlayer) {
      nativePlayer.replay();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isGif) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nativePlayer) {
      nativePlayer.muted = nextMute;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          aspectRatio,
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
        height ? { height, aspectRatio: undefined } : undefined,
        style,
      ]}
    >
      {/* Video / GIF Animation Content */}
      {isGif ? (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: isPlaying ? resolvedMediaUri : (thumbnailUrl || resolvedMediaUri) }}
            style={StyleSheet.absoluteFill}
            resizeMode={currentFitMode}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {!isPlaying && (
            <View style={[styles.centerOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.45)' }]}>
              <Icon name="pause" size={32} color={colors.accent} />
            </View>
          )}
        </View>
      ) : Platform.OS === 'web' ? (
        <View style={StyleSheet.absoluteFill}>
          {/* HTML5 Video Element on Web */}
          {/* @ts-ignore */}
          <video
            ref={webVideoRef}
            src={resolvedMediaUri}
            poster={thumbnailUrl}
            autoPlay={autoPlay}
            loop={isLooping}
            muted={isMuted}
            playsInline={true}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: currentFitMode,
              backgroundColor: '#050811',
              display: 'block',
            }}
          />
        </View>
      ) : nativePlayer && VideoView ? (
        <VideoView
          player={nativePlayer}
          style={StyleSheet.absoluteFill}
          contentFit={currentFitMode}
          nativeControls={false}
        />
      ) : thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={currentFitMode}
        />
      ) : (
        <View style={styles.fallbackWrap}>
          <Icon name="dumbbell" size={32} color={colors.accent} />
          <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
            Demonstration Ready
          </Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <View style={[styles.centerOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.6)' }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading Exercise Video...
          </Text>
        </View>
      )}

      {/* Error Fallback */}
      {hasError && (
        <View style={[styles.centerOverlay, { backgroundColor: 'rgba(11, 16, 32, 0.85)' }]}>
          {thumbnailUrl && (
            <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="contain" />
          )}
          <View style={styles.errorContent}>
            <Icon name="info" size={24} color={colors.accent} />
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>
              {isGif ? 'Exercise Demonstration' : 'Sample Video Playback'}
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
                if (webVideoRef.current) {
                  webVideoRef.current.load();
                }
              }}
            >
              <Text style={[styles.retryBtnText, { color: colors.onAccent }]}>Reload</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Interactive Controls Overlay */}
      <View style={styles.controlsBar}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={togglePlayPause}
          accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={14} color={colors.accent} />
          <Text style={[styles.controlText, { color: colors.textPrimary }]}>
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </Text>
        </TouchableOpacity>

        {/* Restart Button */}
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={restartVideo}
          accessibilityLabel="Restart video"
        >
          <Icon name="refresh" size={13} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Audio Mute/Unmute */}
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={toggleMute}
          accessibilityLabel={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          <Icon name={isMuted ? 'volume-mute' : 'volume'} size={13} color={isMuted ? colors.textSecondary : colors.accent} />
          <Text style={[styles.controlText, { color: isMuted ? colors.textSecondary : colors.accent }]}>
            {isMuted ? 'MUTED' : 'AUDIO'}
          </Text>
        </TouchableOpacity>

        {/* Do Exercise Button - Redirects to Exercise Tracker */}
        <TouchableOpacity
          style={[styles.doExerciseBtn, { backgroundColor: colors.accent }]}
          onPress={handleDoExercise}
          accessibilityLabel="Do exercise in exercise tracker"
          activeOpacity={0.8}
        >
          <Icon name="camera" size={13} color={colors.onAccent} />
          <Text style={[styles.doExerciseText, { color: colors.onAccent }]}>
            DO EXERCISE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContent: {
    alignItems: 'center',
    padding: 16,
    zIndex: 6,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  controlsBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  controlText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  doExerciseBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  doExerciseText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
