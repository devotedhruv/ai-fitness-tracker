import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PoseTracker } from '../PoseTracker';
import { FrameAnalysisResult, Landmark3D, PoseLandmark } from '../types';
import { RepCounterHUD } from './RepCounterHUD';
import { FormCorrectionBanner } from './FormCorrectionBanner';
import { audioCoach } from '../audioCoach';
import { Icon } from '../../../components/Icon';

interface CameraVisionViewProps {
  poseTracker: PoseTracker;
  onFinishSet?: (summary: FrameAnalysisResult) => void;
  topOffset?: number;
}

export const CameraVisionView: React.FC<CameraVisionViewProps> = ({
  poseTracker,
  onFinishSet,
  topOffset,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showJointDots, setShowJointDots] = useState<boolean>(false);
  const showJointDotsRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    showJointDotsRef.current = showJointDots;
  }, [showJointDots]);
  const [analysisResult, setAnalysisResult] = useState<FrameAnalysisResult>(() => ({
    state: poseTracker.getState(),
    repCompleted: false,
    isValidRep: false,
    faultsToAlert: [],
    skeletonJointColors: {},
    skeletonBoneColors: {},
  }));

  // Update local state when tracker updates
  useEffect(() => {
    const unsubscribe = poseTracker.addListener((result) => {
      setAnalysisResult(result);
    });
    return unsubscribe;
  }, [poseTracker]);

  // Load MediaPipe on Web and bind to camera
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIsLoading(false);
      return;
    }

    let stream: MediaStream | null = null;
    let cameraInstance: any = null;
    let isCancelled = false;

    async function setupVisionPipeline() {
      try {
        setIsLoading(true);
        setCameraError(null);

        // 1. Request webcam stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isCancelled) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // 2. Dynamically load MediaPipe Pose scripts if not present
        if (!(window as any).Pose) {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
        }

        if (isCancelled) return;

        const PoseConstructor = (window as any).Pose;
        const CameraConstructor = (window as any).Camera;

        if (!PoseConstructor || !CameraConstructor) {
          throw new Error('MediaPipe Pose library could not be loaded.');
        }

        // 3. Initialize Pose model
        const pose = new PoseConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1, // 0 = Lite (fastest), 1 = Full (accurate & real-time), 2 = Heavy
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });

        // 4. Handle results on each frame
        pose.onResults((results: any) => {
          if (isCancelled) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Resize canvas to match video stream
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            const rawLandmarks: Landmark3D[] = results.poseLandmarks.map((lm: any) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            }));

            // Pass to biomechanics analyzer
            const analysis = poseTracker.onNewFrame(rawLandmarks);

            // Draw clean overlay without lines
            drawSkeleton(ctx, canvas.width, canvas.height, rawLandmarks, analysis, showJointDotsRef.current);
          }
        });

        // 5. Connect video stream to MediaPipe Camera loop
        if (videoRef.current) {
          cameraInstance = new CameraConstructor(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && !isCancelled) {
                await pose.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720,
          });
          cameraInstance.start();
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize camera vision pipeline:', err);
        setCameraError(err.message || 'Camera permission denied or camera unavailable.');
        setIsLoading(false);
      }
    }

    setupVisionPipeline();

    return () => {
      isCancelled = true;
      if (cameraInstance && cameraInstance.stop) {
        cameraInstance.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, poseTracker]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioCoach.setMuted(nextMuted);
  };

  const toggleFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const activeFault = analysisResult.faultsToAlert.length > 0 ? analysisResult.faultsToAlert[0] : undefined;

  return (
    <View style={styles.container}>
      {/* Native Camera View */}
      {Platform.OS !== 'web' && permission?.granted && (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={facingMode === 'user' ? 'front' : 'back'}
          />
        </View>
      )}

      {/* Web Video & Canvas elements */}
      {Platform.OS === 'web' && (
        <View style={styles.cameraWrapper}>
          <video
            ref={videoRef as any}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef as any}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              pointerEvents: 'none',
            }}
          />
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.overlayCenter}>
          <ActivityIndicator size="large" color="#B8F500" />
          <Text style={styles.loadingText}>Initializing Vision Model...</Text>
          <Text style={styles.loadingSub}>Position yourself fully in camera frame</Text>
        </View>
      )}

      {/* Camera Permission Request for Native */}
      {Platform.OS !== 'web' && permission && !permission.granted && (
        <View style={styles.overlayCenter}>
          <Icon name="camera" size={44} color="#B8F500" />
          <Text style={styles.loadingText}>Camera Access Required</Text>
          <Text style={styles.loadingSub}>Enable camera access to track your exercise workout.</Text>
          <TouchableOpacity
            style={[styles.finishButton, { marginTop: 16, paddingHorizontal: 24 }]}
            onPress={requestPermission}
          >
            <Text style={styles.finishButtonText}>GRANT PERMISSION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error View */}
      {cameraError && (
        <View style={styles.overlayCenter}>
          <Text style={styles.errorTitle}>Camera Error</Text>
          <Text style={styles.errorMessage}>{cameraError}</Text>
          <Text style={styles.errorHint}>Please ensure camera access is allowed in your browser settings.</Text>
        </View>
      )}

      {/* Floating Real-time HUD */}
      {!isLoading && !cameraError && (
        <>
          <RepCounterHUD
            state={analysisResult.state}
            activeFault={activeFault}
            topOffset={topOffset}
          />
          <FormCorrectionBanner
            fault={activeFault}
            topOffset={(topOffset ?? (Platform.OS === 'ios' ? 104 : Platform.OS === 'android' ? 92 : 72)) + 140}
          />
        </>
      )}

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleMute} accessibilityLabel="Toggle Voice Coach">
          <Icon name={isMuted ? 'volume-mute' : 'volume'} size={20} color="#FFFFFF" />
          <Text style={styles.iconButtonLabel}>{isMuted ? 'Muted' : 'Voice'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowJointDots((prev) => !prev)}
          accessibilityLabel="Toggle Camera Overlay"
        >
          <Icon name="sparkle" size={20} color={showJointDots ? '#B8F500' : '#8E8E93'} />
          <Text style={[styles.iconButtonLabel, showJointDots && { color: '#B8F500' }]}>
            {showJointDots ? 'Dots On' : 'Clean'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => onFinishSet && onFinishSet(analysisResult)}
          accessibilityLabel="Finish Set"
        >
          <Text style={styles.finishButtonText}>FINISH SET</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleFacing} accessibilityLabel="Flip Camera">
          <Icon name="flip-camera" size={20} color="#FFFFFF" />
          <Text style={styles.iconButtonLabel}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Draws minimal landmark points or keeps canvas clean without any distracting lines during movement.
 * Completely eliminates wireframe skeleton bone lines, bar path trajectory lines, reference lines,
 * and sparklines so the user has an unobstructed view while moving.
 */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  landmarks: Landmark3D[],
  analysis: FrameAnalysisResult,
  showJointDots: boolean = false
) {
  // If dots are disabled (clean mode), keep canvas completely clear - zero lines or dots
  if (!showJointDots) return;

  const minVisibility = analysis.state.currentState === 'NOT_IN_FRAME' ? 0.6 : 0.45;

  // Draw Subtle, Non-Intrusive Joint Dots (NO connecting bone lines, NO bar path lines, NO reference lines)
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 1) < minVisibility) continue;

    // Skip face details except nose
    if (i > 0 && i < 11) continue;

    const jointColor = analysis.skeletonJointColors[i] || '#34C759';
    const isFaulted = jointColor === '#FF3B30';

    ctx.save();
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, isFaulted ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = jointColor;
    ctx.shadowColor = jointColor;
    ctx.shadowBlur = isFaulted ? 8 : 4;
    ctx.fill();
    ctx.restore();
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  cameraWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.85)',
    padding: 24,
    zIndex: 50,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSub: {
    color: '#A3A3A3',
    fontSize: 13,
    marginTop: 4,
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#F5F5F5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    color: '#A3A3A3',
    fontSize: 12,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  iconButton: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 70,
  },
  iconButtonText: {
    fontSize: 20,
  },
  iconButtonLabel: {
    fontSize: 10,
    color: '#A3A3A3',
    fontWeight: '700',
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: '#B8F500',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#B8F500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  finishButtonText: {
    color: '#0B1020',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },
});
