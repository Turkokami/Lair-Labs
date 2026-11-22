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

/** Where a spell goes when you tap Cast: the target you picked, or the nearest foe (most hurt ally for healing) in range.
 *  A burst is centred on the corner of the target's square that catches the most foes and fewest friends. */
export function planSpell<T extends Token & { hpLabel?: string }>(
  sp: { id: string; attack?: string; save?: string; damage?: string; heal?: string; burst?: number; range: string },
  tokens: T[], me: T | undefined, chosenId?: string,
): { targets?: string[]; point?: [number, number]; aim?: T; why?: string } {
  if (!me) return {};
  const rangeFt = /^touch/i.test(sp.range) ? 5 : /^self/i.test(sp.range) ? 0 : Number(/(\d+)\s*ft/.exec(sp.range)?.[1] ?? 30);
  const chosen = chosenId ? tokens.find((t) => t.id === chosenId && !t.hidden) : undefined;
  const isFoe = (t: T) => (me.kind === 'pc' ? t.kind !== 'pc' : t.kind === 'pc');
  if (sp.id === 'shield' || /^self$/i.test(sp.range)) return {};
  if (sp.heal) {
    if (chosen && !isFoe(chosen) && gapFt(me, chosen) <= rangeFt) return { targets: [chosen.id], aim: chosen };
    let best: T | undefined, bf = 1;
    for (const t of tokens) {
      if (t.hidden || isFoe(t) || t.maxHp <= 0 || gapFt(me, t) > rangeFt) continue;
      const f = t.hp / t.maxHp;
      if (f < bf) {
        bf = f;
        best = t;
      }
    }
    const tgt = best ?? me;
    return { targets: [tgt.id], aim: tgt };
  }
  const foe = chosen && isFoe(chosen) && !isDown(chosen) && gapFt(me, chosen) <= rangeFt ? chosen : nearestFoe(tokens, me, rangeFt);
  if (!foe) return { why: rangeFt ? `No foe within ${rangeFt} ft.` : 'No foe in reach.' };
  if (sp.burst) {
    const L = sp.burst / 5;
    const score = (px: number, py: number) => {
      let s = 0;
      for (const t of tokens) {
        if (t.hidden || isDown(t)) continue;
        const inside = Math.hypot(t.x + 0.5 - px, t.y + 0.5 - py) <= L + 1e-6;
        if (inside) s += isFoe(t) ? 1 : t.id === me.id ? -3 : -2;
      }
      return s;
    };
    let pt: [number, number] = [foe.x, foe.y], bs = -Infinity;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const v = score(foe.x + dx, foe.y + dy);
      if (v > bs) {
        bs = v;
        pt = [foe.x + dx, foe.y + dy];
      }
    }
    return { point: pt, aim: foe };
  }
  return { targets: [foe.id], aim: foe };
}
