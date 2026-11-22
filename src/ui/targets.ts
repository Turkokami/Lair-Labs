// Who an attack is aimed at: the gap between two figures in feet, and the nearest foe in reach.
import type { Token } from '../engine/game';
import type { Character } from '../rules/character';
import { weaponById } from '../rules/equipment';

type Box = { x: number; y: number; size: number };
export function gapFt(a: Box, b: Box) {
  const as = Math.max(1, a.size), bs = Math.max(1, b.size);
  const dx = Math.max(0, b.x - (a.x + as - 1), a.x - (b.x + bs - 1));
  const dy = Math.max(0, b.y - (a.y + as - 1), a.y - (b.y + bs - 1));
  return Math.max(dx, dy) * 5;
}

/** Down and out: 0 HP, or a monster whose HP a phone can't see (-1) but whose label says Down. */
export function isDown(t: { hp: number; hpLabel?: string }) {
  return t.hp === 0 || t.hpLabel === 'Down';
}

/** The nearest standing foe (heroes for a monster, monsters for a hero), within maxFt when given. */
export function nearestFoe<T extends Token>(tokens: T[], me: T | undefined, maxFt = Infinity): T | undefined {
  if (!me) return undefined;
  let best: T | undefined, bd = Infinity;
  for (const t of tokens) {
    if (t.id === me.id || t.hidden || isDown(t)) continue;
    const foe = me.kind === 'pc' ? t.kind !== 'pc' : t.kind === 'pc';
    if (!foe) continue;
    const d = gapFt(me, t);
    if (d <= maxFt && d < bd) {
      bd = d;
      best = t;
    }
  }
  return best;
}

/** How far a monster's attack reaches, in feet, from its stat-block text: "Range 80/320 ft." or "reach 10 ft." */
export function actionReachFt(text?: string) {
  const r = text?.match(/range (\d+)\/(\d+)/i);
  if (r) return Number(r[2]);
  const m = text?.match(/reach (\d+)/i);
  return m ? Number(m[1]) : 5;
}

/** How far one of a hero's attacks reaches: melee 5 ft (10 with reach), ranged and thrown by the weapon's normal/long range. */
export function weaponReach(ch: Character, attackName: string): { near: number; far: number } {
  const w = ch.build.weapons.map(weaponById).find((x) => x?.name === attackName);
  if (!w) return { near: 5, far: 5 };
  if (w.range && (w.props.includes('ranged') || w.props.includes('thrown'))) {
    const [n, f] = w.range.split('/').map((x) => parseInt(x, 10));
    return { near: n || 5, far: f || n || 5 };
  }
  const r = w.props.includes('reach') ? 10 : 5;
  return { near: r, far: r };
}
