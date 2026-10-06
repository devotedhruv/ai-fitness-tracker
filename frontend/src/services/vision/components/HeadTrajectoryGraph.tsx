import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TrajectoryPoint } from '../types';

interface HeadTrajectoryGraphProps {
  trajectory: TrajectoryPoint[];
  referenceLineY?: number;
  referenceLineLabel?: string;
  height?: number;
  width?: number;
}

/**
 * Head & Movement Trajectory Graph
 * Renders the vertical sine-wave trajectory of reps over time alongside
 * the pull-up bar reference line (matching YOLO26 CV post-set analytics).
 */
export const HeadTrajectoryGraph: React.FC<HeadTrajectoryGraphProps> = ({
  trajectory,
  referenceLineY,
  referenceLineLabel = 'BAR REFERENCE',
  height = 150,
}) => {
  if (!trajectory || trajectory.length < 2) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>No trajectory movement recorded for this set.</Text>
      </View>
    );
  }

  const svgWidth = 320;
  const paddingX = 24;
  const paddingY = 20;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Determine Y range from trajectory and reference line
  const yValues = trajectory.map((p) => p.y);
  if (referenceLineY !== undefined) {
    yValues.push(referenceLineY);
  }
  const minY = Math.max(0, Math.min(...yValues) - 0.04);
  const maxY = Math.min(1, Math.max(...yValues) + 0.04);
  const yRange = Math.max(0.08, maxY - minY);

  // Map normalized coordinate to SVG pixels (smaller y = higher up in screen)
  const mapY = (normY: number) => {
    const ratio = (normY - minY) / yRange;
    return paddingY + ratio * plotHeight;
  };

  const mapX = (index: number) => {
    return paddingX + (index / (trajectory.length - 1)) * plotWidth;
  };

  // Build SVG Path
  let pathD = '';
  let areaD = '';

  trajectory.forEach((pt, idx) => {
    const px = mapX(idx);
    const py = mapY(pt.y);

    if (idx === 0) {
      pathD += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      areaD += `M ${px.toFixed(1)} ${height - paddingY} L ${px.toFixed(1)} ${py.toFixed(1)}`;
    } else {
      // Smooth cubic curve approximation
      const prevX = mapX(idx - 1);
      const prevY = mapY(trajectory[idx - 1].y);
      const midX = (prevX + px) / 2;
      pathD += ` C ${midX.toFixed(1)} ${prevY.toFixed(1)}, ${midX.toFixed(1)} ${py.toFixed(1)}, ${px.toFixed(1)} ${py.toFixed(1)}`;
      areaD += ` C ${midX.toFixed(1)} ${prevY.toFixed(1)}, ${midX.toFixed(1)} ${py.toFixed(1)}, ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
  });

  const lastPx = mapX(trajectory.length - 1);
  areaD += ` L ${lastPx.toFixed(1)} ${height - paddingY} Z`;

  const refPixelY = referenceLineY !== undefined ? mapY(referenceLineY) : null;

  // Find peak points to render milestone dots
  const peakPoints = trajectory
    .map((pt, idx) => ({ ...pt, idx }))
    .filter((pt) => pt.isPeak || pt.state === 'INFLECTION');

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
        <Defs>
          <LinearGradient id="trajGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Shaded Area Under Curve */}
        <Path d={areaD} fill="url(#trajGradient)" />

        {/* Reference Line */}
        {refPixelY !== null && (
          <>
            <Line
              x1={paddingX}
              y1={refPixelY}
              x2={svgWidth - paddingX}
              y2={refPixelY}
              stroke="#34C759"
              strokeWidth="1.5"
              strokeDasharray="5, 3"
            />
            <SvgText
              x={paddingX + 4}
              y={Math.max(12, refPixelY - 4)}
              fill="#34C759"
              fontSize="9"
              fontWeight="bold"
            >
              {`── ${referenceLineLabel} ──`}
            </SvgText>
          </>
        )}

        {/* Trajectory Main Stroke */}
        <Path
          d={pathD}
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak Rep Indicators */}
        {peakPoints.map((pt, i) => {
          const px = mapX(pt.idx);
          const py = mapY(pt.y);
          return (
            <React.Fragment key={`peak-${i}`}>
              <Circle
                cx={px}
                cy={py}
                r={4.5}
                fill="#34C759"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0F1216',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    paddingVertical: 4,
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1216',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '500',
  },
});
