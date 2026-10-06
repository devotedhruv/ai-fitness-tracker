import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PoseTracker } from '../PoseTracker';
import { FrameAnalysisResult, Landmark3D, POSE_CONNECTIONS, PoseLandmark } from '../types';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState<boolean>(false);
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

            // Draw Skeleton onto canvas
            drawSkeleton(ctx, canvas.width, canvas.height, rawLandmarks, analysis);
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
          <Text style={styles.loadingText}>Initializing MediaPipe Vision Model...</Text>
          <Text style={styles.loadingSub}>Position yourself fully in camera frame</Text>
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
          <Text style={styles.iconButtonLabel}>{isMuted ? 'Muted' : 'Voice On'}</Text>
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
 * Draws the high-visibility color-coded skeleton directly on the 2D canvas.
 */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  landmarks: Landmark3D[],
  analysis: FrameAnalysisResult
) {
  // Suppress hallucinated offscreen skeleton when body is not in frame
  const minVisibility = analysis.state.currentState === 'NOT_IN_FRAME' ? 0.6 : 0.45;

  // 1. Draw Bones (Connections)
  for (const [fromIdx, toIdx] of POSE_CONNECTIONS) {
    const from = landmarks[fromIdx];
    const to = landmarks[toIdx];

    if (!from || !to) continue;
    if ((from.visibility ?? 1) < minVisibility || (to.visibility ?? 1) < minVisibility) continue;

    // Check if either connected joint has a fault
    const fromColor = analysis.skeletonJointColors[fromIdx];
    const toColor = analysis.skeletonJointColors[toIdx];
    const boneColor = fromColor === '#FF3B30' || toColor === '#FF3B30'
      ? '#FF3B30'
      : analysis.skeletonBoneColors[`${fromIdx}-${toIdx}`] || '#34C759';

    ctx.beginPath();
    ctx.moveTo(from.x * width, from.y * height);
    ctx.lineTo(to.x * width, to.y * height);
    ctx.lineWidth = boneColor === '#FF3B30' ? 6 : 4;
    ctx.strokeStyle = boneColor;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 2. Draw Joint Keypoints
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 1) < minVisibility) continue;

    // Skip face details except nose
    if (i > 0 && i < 11) continue;

    const jointColor = analysis.skeletonJointColors[i] || '#34C759';
    const isFaulted = jointColor === '#FF3B30';

    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, isFaulted ? 8 : 6, 0, 2 * Math.PI);
    ctx.fillStyle = jointColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  // 3. Draw Bar Path Trajectory (VBT / Barbell velocity tracker)
  const barPath = analysis.barPath || [];
  if (barPath.length > 1) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < barPath.length; i++) {
      const pt = barPath[i];
      const px = pt.x * width;
      const py = pt.y * height;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.setLineDash([4, 2]);
    ctx.stroke();

    // Draw active barbell/tracker point
    const lastPoint = barPath[barPath.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x * width, lastPoint.y * height, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#00F0FF';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Draw Pull-up Bar / Depth Reference Line (YOLO26-style)
  const refY = analysis.referenceLineY ?? analysis.state.referenceLineY;
  if (refY !== undefined && refY > 0.05 && refY < 0.95 && analysis.state.currentState !== 'NOT_IN_FRAME') {
    const isAbove = analysis.isAboveReferenceLine ?? analysis.state.isAboveReferenceLine ?? false;
    const label = analysis.referenceLineLabel || analysis.state.referenceLineLabel || 'REFERENCE LINE';
    const distCm = analysis.distanceToReferenceLineCm ?? analysis.state.distanceToReferenceLineCm;
    const yPixel = refY * height;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, yPixel);
    ctx.lineTo(width, yPixel);

    if (isAbove) {
      ctx.strokeStyle = '#34C759';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#34C759';
      ctx.shadowBlur = 14;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.setLineDash([12, 6]);
    }
    ctx.stroke();

    // Draw reference badge tag
    const badgeText = `${label} ${distCm !== undefined ? `(${distCm >= 0 ? `+${distCm}` : distCm}cm)` : ''}`;
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeX = 20;
    const badgeY = Math.max(24, yPixel - 12);

    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.strokeStyle = isAbove ? '#34C759' : '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(badgeX - 8, badgeY - 14, textWidth + 16, 22, 6);
    } else {
      ctx.rect(badgeX - 8, badgeY - 14, textWidth + 16, 22);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isAbove ? '#34C759' : '#00F0FF';
    ctx.fillText(badgeText, badgeX, badgeY + 2);
    ctx.restore();
  }

  // 5. Draw Head / Primary Joint Trajectory Sparkline
  const trajectory = analysis.trajectoryHistory || analysis.state.trajectoryHistory || [];
  if (trajectory.length > 3 && analysis.state.currentState !== 'NOT_IN_FRAME') {
    ctx.save();
    const graphWidth = Math.min(160, width * 0.25);
    const graphRight = width - 20;
    const graphLeft = graphRight - graphWidth;

    ctx.beginPath();
    for (let i = 0; i < trajectory.length; i++) {
      const pt = trajectory[i];
      const gx = graphLeft + (i / (trajectory.length - 1)) * graphWidth;
      const gy = pt.y * height;
      if (i === 0) {
        ctx.moveTo(gx, gy);
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 6;
    ctx.setLineDash([]);
    ctx.stroke();

    // Mark peaks
    for (let i = 0; i < trajectory.length; i++) {
      const pt = trajectory[i];
      if (pt.isPeak) {
        const gx = graphLeft + (i / (trajectory.length - 1)) * graphWidth;
        const gy = pt.y * height;
        ctx.beginPath();
        ctx.arc(gx, gy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#34C759';
        ctx.shadowColor = '#34C759';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }
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
