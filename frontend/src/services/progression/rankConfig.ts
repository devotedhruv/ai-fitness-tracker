export interface MilitaryRank {
  id: string;
  name: string;
  minXP: number;
  maxXP: number;
  tier: number;
  description: string;
  promotionRequirements: string;
  insigniaType:
    | 'recruit-bar'
    | 'single-chevron'
    | 'chevron-rocker'
    | 'double-chevron'
    | 'triple-chevron'
    | 'triple-rocker'
    | 'single-bar'
    | 'double-bar'
    | 'diamond-leaf'
    | 'eagle-crest'
    | 'winged-star'
    | 'general-wreath';
}

export const MILITARY_RANKS: MilitaryRank[] = [
  {
    id: 'recruit',
    name: 'INITIATE WARRIOR',
    minXP: 0,
    maxXP: 299,
    tier: 1,
    description: 'Foundation of discipline and grit. Stepping onto the warrior\'s path of self-mastery.',
    promotionRequirements: 'Log your first completed workout or outdoor run (+300 XP)',
    insigniaType: 'recruit-bar',
  },
  {
    id: 'private',
    name: 'BRONZE BERSERKER',
    minXP: 300,
    maxXP: 699,
    tier: 2,
    description: 'Raw power awakening. Demonstrating fierce dedication and relentless execution.',
    promotionRequirements: 'Maintain active weekly workouts and achieve initial personal records (+400 XP)',
    insigniaType: 'single-chevron',
  },
  {
    id: 'private-first-class',
    name: 'STEEL GLADIATOR',
    minXP: 700,
    maxXP: 1199,
    tier: 3,
    description: 'Arena forged. Enduring high-intensity volume and building titanium resilience.',
    promotionRequirements: 'Reach 1,200 XP through sustained training and goal milestones',
    insigniaType: 'chevron-rocker',
  },
  {
    id: 'corporal',
    name: 'SPARTAN VANGUARD',
    minXP: 1200,
    maxXP: 1999,
    tier: 4,
    description: 'Frontline commander. Habits forged in fire with unstoppable week-over-week consistency.',
    promotionRequirements: 'Log diverse training disciplines and maintain a 2+ week consistency streak',
    insigniaType: 'double-chevron',
  },
  {
    id: 'sergeant',
    name: 'SHADOW BLADE',
    minXP: 2000,
    maxXP: 3199,
    tier: 5,
    description: 'Mastery of agility, bodyweight dominion, and explosive kinetic power.',
    promotionRequirements: 'Earn 3,200 XP through weekly goal completions and high-volume sessions',
    insigniaType: 'triple-chevron',
  },
  {
    id: 'staff-sergeant',
    name: 'CRIMSON WARLORD',
    minXP: 3200,
    maxXP: 4999,
    tier: 6,
    description: 'Battle-hardened conqueror. Dominating grueling sets and heavy compound lifts.',
    promotionRequirements: 'Reach 5,000 XP through continuous aerobic and strength milestones',
    insigniaType: 'triple-rocker',
  },
  {
    id: 'lieutenant',
    name: 'IRON WARRIOR',
    minXP: 5000,
    maxXP: 7499,
    tier: 7,
    description: 'Unbreakable titan. Extreme mental fortitude, advanced strength, and tactical pacing.',
    promotionRequirements: 'Achieve 7,500 XP through prolonged consistency and new personal bests',
    insigniaType: 'single-bar',
  },
  {
    id: 'captain',
    name: 'VALIANT CHAMPION',
    minXP: 7500,
    maxXP: 10999,
    tier: 8,
    description: 'Legendary arena champion. Smashing personal records across all major movements.',
    promotionRequirements: 'Reach 11,000 XP with sustained monthly improvement over previous records',
    insigniaType: 'double-bar',
  },
  {
    id: 'major',
    name: 'THUNDER BERSERKER',
    minXP: 11000,
    maxXP: 15999,
    tier: 9,
    description: 'Devastating force of nature. Superior cardiovascular endurance and raw power.',
    promotionRequirements: 'Accumulate 16,000 XP through long-distance runs and heavy sessions',
    insigniaType: 'diamond-leaf',
  },
  {
    id: 'colonel',
    name: 'MYTHIC WARLORD',
    minXP: 16000,
    maxXP: 19999,
    tier: 10,
    description: 'Elite martial sovereign. Monumental tonnage, unbroken streaks, and legendary focus.',
    promotionRequirements: 'Reach 20,000 XP with flawless streak maintenance and dedication',
    insigniaType: 'eagle-crest',
  },
  {
    id: 'commander',
    name: 'IMMORTAL TITAN',
    minXP: 20000,
    maxXP: 24999,
    tier: 11,
    description: 'Godlike readiness. Supreme multi-discipline athletic mastery and apex physical prowess.',
    promotionRequirements: 'Reach 25,000 XP to attain the apex rank of Warmaster Supreme',
    insigniaType: 'winged-star',
  },
  {
    id: 'general',
    name: 'WARMASTER SUPREME',
    minXP: 25000,
    maxXP: Infinity,
    tier: 12,
    description: 'Apex Warrior of Legend. Absolute pinnacle of strength, endurance, and physical dominion.',
    promotionRequirements: 'Maximum rank achieved. Continue conquering your personal records!',
    insigniaType: 'general-wreath',
  },
];

export interface RankProgressInfo {
  currentRank: MilitaryRank;
  nextRank: MilitaryRank | null;
  currentXP: number;
  xpInCurrentTier: number;
  xpRequiredForTier: number;
  progressPercentage: number;
  xpToNextRank: number;
  isMaxRank: boolean;
}

export function getRankByXP(xp: number): MilitaryRank {
  const safeXP = Math.max(0, Math.floor(xp || 0));
  for (let i = MILITARY_RANKS.length - 1; i >= 0; i--) {
    if (safeXP >= MILITARY_RANKS[i].minXP) {
      return MILITARY_RANKS[i];
    }
  }
  return MILITARY_RANKS[0];
}

export function getNextRank(currentRankId: string): MilitaryRank | null {
  const idx = MILITARY_RANKS.findIndex((r) => r.id === currentRankId);
  if (idx === -1 || idx === MILITARY_RANKS.length - 1) {
    return null;
  }
  return MILITARY_RANKS[idx + 1];
}

export function getRankProgress(xp: number): RankProgressInfo {
  const safeXP = Math.max(0, Math.floor(xp || 0));
  const currentRank = getRankByXP(safeXP);
  const nextRank = getNextRank(currentRank.id);

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      currentXP: safeXP,
      xpInCurrentTier: safeXP - currentRank.minXP,
      xpRequiredForTier: 0,
      progressPercentage: 100,
      xpToNextRank: 0,
      isMaxRank: true,
    };
  }

  const xpInTier = safeXP - currentRank.minXP;
  const tierSpan = nextRank.minXP - currentRank.minXP;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((xpInTier / tierSpan) * 100)));
  const xpToNextRank = Math.max(0, nextRank.minXP - safeXP);

  return {
    currentRank,
    nextRank,
    currentXP: safeXP,
    xpInCurrentTier: xpInTier,
    xpRequiredForTier: tierSpan,
    progressPercentage,
    xpToNextRank,
    isMaxRank: false,
  };
}
