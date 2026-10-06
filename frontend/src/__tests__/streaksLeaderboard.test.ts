describe('Streaks & League Leaderboard Logic', () => {
  const LEAGUE_THRESHOLDS = [
    { id: 'bronze', name: 'Bronze League', minStreak: 0, minWorkouts: 0 },
    { id: 'silver', name: 'Silver League', minStreak: 3, minWorkouts: 10 },
    { id: 'gold', name: 'Gold League', minStreak: 6, minWorkouts: 25 },
    { id: 'diamond', name: 'Diamond League', minStreak: 10, minWorkouts: 50 },
    { id: 'master', name: 'Master League', minStreak: 20, minWorkouts: 100 },
  ];

  function computeLeague(streak: number, workouts: number) {
    if (streak >= 20 || workouts >= 100) return 'master';
    if (streak >= 10 || workouts >= 50) return 'diamond';
    if (streak >= 6 || workouts >= 25) return 'gold';
    if (streak >= 3 || workouts >= 10) return 'silver';
    return 'bronze';
  }

  function sortLeaderboard(
    athletes: Array<{ name: string; streak: number; workouts: number }>,
    mode: 'streak' | 'workouts'
  ) {
    return [...athletes].sort((a, b) => {
      const scoreA = mode === 'workouts' ? a.workouts : a.streak;
      const scoreB = mode === 'workouts' ? b.workouts : b.streak;
      return scoreB - scoreA;
    });
  }

  function assignZones(rank: number, total: number) {
    if (rank <= 3) return 'promotion';
    if (rank >= total - 1 && total > 5) return 'demotion';
    return 'safe';
  }

  it('correctly maps streak and workout counts to appropriate leagues', () => {
    expect(computeLeague(0, 0)).toBe('bronze');
    expect(computeLeague(2, 8)).toBe('bronze');
    expect(computeLeague(3, 4)).toBe('silver');
    expect(computeLeague(1, 10)).toBe('silver');
    expect(computeLeague(6, 12)).toBe('gold');
    expect(computeLeague(4, 25)).toBe('gold');
    expect(computeLeague(10, 15)).toBe('diamond');
    expect(computeLeague(5, 50)).toBe('diamond');
    expect(computeLeague(25, 40)).toBe('master');
    expect(computeLeague(2, 120)).toBe('master');
  });

  it('sorts athletes properly based on mode (streak vs workouts)', () => {
    const athletes = [
      { name: 'Matías', streak: 3, workouts: 8 },
      { name: 'Tash', streak: 5, workouts: 4 },
      { name: 'Julián', streak: 2, workouts: 15 },
    ];

    const sortedByStreak = sortLeaderboard(athletes, 'streak');
    expect(sortedByStreak.map((a) => a.name)).toEqual(['Tash', 'Matías', 'Julián']);

    const sortedByWorkouts = sortLeaderboard(athletes, 'workouts');
    expect(sortedByWorkouts.map((a) => a.name)).toEqual(['Julián', 'Matías', 'Tash']);
  });

  it('identifies top 3 athletes as promotion zone', () => {
    const totalAthletes = 7;
    expect(assignZones(1, totalAthletes)).toBe('promotion');
    expect(assignZones(2, totalAthletes)).toBe('promotion');
    expect(assignZones(3, totalAthletes)).toBe('promotion');
    expect(assignZones(4, totalAthletes)).toBe('safe');
    expect(assignZones(5, totalAthletes)).toBe('safe');
    expect(assignZones(6, totalAthletes)).toBe('demotion');
    expect(assignZones(7, totalAthletes)).toBe('demotion');
  });

  it('calculates consistency percentage accurately', () => {
    const computeConsistency = (activeWeeks: number, totalWeeks: number) => {
      if (totalWeeks <= 0) return 100;
      return Math.min(100, Math.round((activeWeeks / totalWeeks) * 100));
    };

    expect(computeConsistency(4, 4)).toBe(100);
    expect(computeConsistency(3, 4)).toBe(75);
    expect(computeConsistency(0, 0)).toBe(100);
  });
});
