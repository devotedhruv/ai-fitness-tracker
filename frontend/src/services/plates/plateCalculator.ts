export interface PlateDefinition {
  weight: number;
  color: string;
  diameterRatio: number; // Ratio relative to 450mm standard plate
}

export const METRIC_PLATES: PlateDefinition[] = [
  { weight: 25, color: '#FF3B30', diameterRatio: 1.0 },   // Olympic Red
  { weight: 20, color: '#007AFF', diameterRatio: 1.0 },   // Olympic Blue
  { weight: 15, color: '#FFCC00', diameterRatio: 0.9 },   // Olympic Yellow
  { weight: 10, color: '#34C759', diameterRatio: 0.75 },  // Olympic Green
  { weight: 5, color: '#E5E5EA', diameterRatio: 0.55 },   // White
  { weight: 2.5, color: '#3A3A3C', diameterRatio: 0.45 }, // Black
  { weight: 1.25, color: '#8E8E93', diameterRatio: 0.38 },// Silver/Chrome
];

export const IMPERIAL_PLATES: PlateDefinition[] = [
  { weight: 45, color: '#007AFF', diameterRatio: 1.0 },
  { weight: 35, color: '#FFCC00', diameterRatio: 0.9 },
  { weight: 25, color: '#34C759', diameterRatio: 0.75 },
  { weight: 10, color: '#E5E5EA', diameterRatio: 0.55 },
  { weight: 5, color: '#3A3A3C', diameterRatio: 0.45 },
  { weight: 2.5, color: '#8E8E93', diameterRatio: 0.38 },
];

export interface PlateCalculationResult {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  actualWeight: number;
  platesPerSide: { plate: PlateDefinition; count: number }[];
  isExact: boolean;
  remainder: number;
}

/**
 * Calculates optimal plate breakdown per sleeve for target barbell weight
 */
export function calculateBarbellPlates(
  targetWeight: number,
  barWeight: number = 20,
  unit: 'METRIC' | 'IMPERIAL' = 'METRIC',
  availablePlates?: PlateDefinition[]
): PlateCalculationResult {
  const plates = availablePlates || (unit === 'METRIC' ? METRIC_PLATES : IMPERIAL_PLATES);

  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      actualWeight: barWeight,
      platesPerSide: [],
      isExact: targetWeight === barWeight,
      remainder: targetWeight - barWeight,
    };
  }

  const neededTotal = targetWeight - barWeight;
  let remainingPerSide = neededTotal / 2;
  const platesPerSide: { plate: PlateDefinition; count: number }[] = [];

  // Sort descending by weight
  const sortedPlates = [...plates].sort((a, b) => b.weight - a.weight);

  for (const plate of sortedPlates) {
    if (remainingPerSide >= plate.weight) {
      const count = Math.floor(remainingPerSide / plate.weight);
      if (count > 0) {
        platesPerSide.push({ plate, count });
        remainingPerSide = Math.round((remainingPerSide - count * plate.weight) * 100) / 100;
      }
    }
  }

  const loadedPerSide = platesPerSide.reduce(
    (sum, item) => sum + item.plate.weight * item.count,
    0
  );
  const actualWeight = barWeight + loadedPerSide * 2;
  const remainder = Math.round((targetWeight - actualWeight) * 100) / 100;

  return {
    targetWeight,
    barWeight,
    weightPerSide: loadedPerSide,
    actualWeight,
    platesPerSide,
    isExact: remainder === 0,
    remainder,
  };
}
