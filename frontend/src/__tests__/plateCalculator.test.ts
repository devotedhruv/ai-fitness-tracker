import {
  calculateBarbellPlates,
  METRIC_PLATES,
  IMPERIAL_PLATES,
} from '../services/plates/plateCalculator';

describe('plateCalculator', () => {
  it('calculates 60kg barbell load (20kg bar + 20kg per side)', () => {
    const res = calculateBarbellPlates(60, 20, 'METRIC');
    expect(res.actualWeight).toBe(60);
    expect(res.weightPerSide).toBe(20);
    expect(res.isExact).toBe(true);
    expect(res.platesPerSide).toEqual([
      { plate: METRIC_PLATES[1], count: 1 }, // 20kg plate
    ]);
  });

  it('calculates 100kg barbell load (20kg bar + 40kg per side)', () => {
    const res = calculateBarbellPlates(100, 20, 'METRIC');
    expect(res.actualWeight).toBe(100);
    expect(res.weightPerSide).toBe(40);
    expect(res.isExact).toBe(true);
    // 25kg + 15kg or 2x20kg
    const totalSide = res.platesPerSide.reduce((s, p) => s + p.plate.weight * p.count, 0);
    expect(totalSide).toBe(40);
  });

  it('handles empty bar when target equals bar weight', () => {
    const res = calculateBarbellPlates(20, 20, 'METRIC');
    expect(res.actualWeight).toBe(20);
    expect(res.platesPerSide).toHaveLength(0);
    expect(res.isExact).toBe(true);
  });

  it('calculates 225lb imperial barbell load (45lb bar + 90lb per side)', () => {
    const res = calculateBarbellPlates(225, 45, 'IMPERIAL');
    expect(res.actualWeight).toBe(225);
    expect(res.weightPerSide).toBe(90);
    expect(res.isExact).toBe(true);
    // Two 45lb plates per side
    expect(res.platesPerSide[0]).toEqual({
      plate: IMPERIAL_PLATES[0], // 45lb plate
      count: 2,
    });
  });

  it('handles unachievable odd weights with remainder notification', () => {
    const res = calculateBarbellPlates(61, 20, 'METRIC');
    expect(res.isExact).toBe(false);
    expect(res.remainder).toBeGreaterThan(0);
  });
});
