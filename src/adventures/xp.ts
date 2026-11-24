// Encounter budgets per character (SRD 5.2, CC-BY-4.0): low, moderate and high difficulty.
import { monsterById } from '../rules/monsters';
import { normMonsterId } from '../library/creatures';

export const XP_BUDGET: Record<number, [number, number, number]> = {
  1: [50, 75, 100], 2: [100, 150, 200], 3: [150, 225, 400], 4: [250, 375, 500], 5: [500, 750, 1100],
  6: [600, 1000, 1400], 7: [750, 1300, 1700], 8: [1000, 1700, 2100], 9: [1300, 2000, 2600], 10: [1600, 2300, 3100],
  11: [1900, 2900, 4100], 12: [2200, 3700, 4700], 13: [2600, 4200, 5400], 14: [2900, 4900, 6200], 15: [3300, 5400, 7800],
  16: [3800, 6100, 9800], 17: [4500, 7200, 11700], 18: [5000, 8700, 14200], 19: [5500, 10700, 17200], 20: [6400, 13200, 22000],
};

/** The stat block id for an encounter's monster id ("goblin-warrior" or "goblinWarrior"). */
export const statId = (srd: string) => [normMonsterId(srd), srd].find((k) => monsterById(k));

export function encounterXp(monsters: { srd: string; count: number }[]): number {
  let xp = 0;
  for (const g of monsters) {
    const id = statId(g.srd);
    const m = id ? monsterById(id) : undefined;
    xp += (m?.xp ?? 0) * g.count;
  }
  return xp;
}

/** How hard a fight is for a party: below low, low, moderate, high or deadly (over high). */
export function difficultyFor(xp: number, level: number, party = 4): 'trivial' | 'low' | 'moderate' | 'high' | 'deadly' {
  const [lo, mid, hi] = XP_BUDGET[Math.max(1, Math.min(20, level))].map((n) => n * party);
  if (xp > hi * 1.15) return 'deadly';
  if (xp >= (mid + hi) / 2) return 'high';
  if (xp >= (lo + mid) / 2) return 'moderate';
  if (xp >= lo * 0.5) return 'low';
  return 'trivial';
}
