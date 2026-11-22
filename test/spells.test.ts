import { describe, it, expect, vi, afterEach } from 'vitest';
import { blankMap, setCells, rectCells } from '../src/engine/map';
import { HostCore, newGame, SHIELD_MARK, CHILL_MARK } from '../src/engine/game';
import { premade, freshState, computeSheet } from '../src/rules/character';
import { planSpell } from '../src/ui/targets';
import { spellById } from '../src/rules/spells';

// every die lands in the middle (a d20 shows 11), so the tests don't depend on luck
function fixDice() {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView | null>(a: T) => {
    const u = a as unknown as Uint32Array;
    for (let i = 0; i < u.length; i++) u[i] = 0x80000000;
    return a;
  });
}
afterEach(() => vi.restoreAllMocks());

function table(cls = 'wizard', level = 5) {
  let m = blankMap(16, 10);
  m = setCells(m, rectCells(1, 1, 14, 8), 1);
  const core = new HostCore(newGame('ABCDEF', m));
  core.handle('gm', { t: 'gm:settings', patch: { startLevel: level } });
  core.handle('p1', { t: 'hello', name: 'Sam', clientId: 'p1' });
  const b = premade(cls, level);
  core.handle('p1', { t: 'saveChar', character: { build: b, state: freshState(b) } });
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 8, y: 4 });
  const me = core.s.tokens.find((t) => t.kind === 'pc')!;
  const sk = core.s.tokens.find((t) => t.kind === 'monster')!;
  core.handle('gm', { t: 'gm:tokenPatch', tokenId: me.id, patch: { x: 3, y: 4 } });
  return { core, me, sk, b };
}

describe('spells resolve at the table', () => {
  it('the premade wizard has the six example spells ready at level 5', () => {
    const sh = computeSheet(premade('wizard', 5));
    const ids = [...sh.spell!.cantrips, ...sh.spell!.prepared].map((s) => s.id);
    for (const id of ['fireBolt', 'rayOfFrost', 'magicMissile', 'fireball', 'shield']) expect(ids).toContain(id);
  });
  it('Fire Bolt rolls against AC and burns the target on a hit', () => {
    fixDice();
    const { core, sk } = table();
    core.handle('gm', { t: 'gm:tokenPatch', tokenId: sk.id, patch: { ac: 5, hp: 50, maxHp: 50 } });
    core.handle('p1', { t: 'cast', spellId: 'fireBolt', targets: [sk.id] });
    const cast = core.s.log.find((e) => e.fx)!;
    expect(cast.text).toMatch(/casts Fire Bolt at Skeleton/);
    expect(cast.fx!.hits[0]).toMatchObject({ id: sk.id, hit: true });
    expect(sk.hp).toBe(sk.maxHp - cast.fx!.hits[0].amount!);
  });
  it('Ray of Frost slows the target until the caster’s next turn', () => {
    fixDice();
    const { core, sk, me } = table();
    core.handle('gm', { t: 'gm:tokenPatch', tokenId: sk.id, patch: { ac: 5, hp: 50, maxHp: 50 } });
    const speed = sk.speed;
    core.handle('gm', { t: 'gm:startCombat', tokenIds: [me.id, sk.id] });
    core.handle('gm', { t: 'gm:setInit', tokenId: me.id, init: 20 });
    core.handle('p1', { t: 'cast', spellId: 'rayOfFrost', targets: [sk.id] });
    expect(sk.speed).toBe(speed - 10);
    expect(sk.conditions).toContain(CHILL_MARK);
    core.handle('gm', { t: 'gm:nextTurn' }); // skeleton's turn
    expect(sk.speed).toBe(speed - 10);
    core.handle('gm', { t: 'gm:nextTurn' }); // back to the wizard: it wears off
    expect(sk.speed).toBe(speed);
    expect(sk.conditions).not.toContain(CHILL_MARK);
  });
  it('Magic Missile always hits: three darts, 1d4+1 each, and uses a slot', () => {
    fixDice();
    const { core, sk } = table();
    core.handle('gm', { t: 'gm:tokenPatch', tokenId: sk.id, patch: { ac: 30, hp: 50, maxHp: 50 } });
    core.handle('p1', { t: 'cast', spellId: 'magicMissile', slot: 1, targets: [sk.id] });
    const d = core.s.log.find((e) => e.kind === 'roll' && e.spell === 'magicMissile')!;
    expect(d.roll!.formula ?? d.roll!.label).toBeTruthy();
    expect(d.roll!.total).toBeGreaterThanOrEqual(6);
    expect(sk.hp).toBe(50 - d.roll!.total);
    expect(Object.values(core.s.characters)[0].state.slotsUsed[0]).toBe(1);
  });
  it('Fireball makes everyone in the burst save; a save halves it', () => {
    fixDice();
    const { core, sk, me } = table();
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 9, y: 5 });
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'skeleton', x: 14, y: 8 }); // far away
    const far = core.s.tokens[core.s.tokens.length - 1];
    for (const t of core.s.tokens) if (t.kind === 'monster') core.handle('gm', { t: 'gm:tokenPatch', tokenId: t.id, patch: { hp: 99, maxHp: 99 } });
    core.handle('p1', { t: 'cast', spellId: 'fireball', slot: 3, point: [9, 5] });
    const fx = core.s.log.find((e) => e.fx)!.fx!;
    expect(fx.radius).toBe(20);
    expect(fx.hits.map((h) => h.id)).toContain(sk.id);
    expect(fx.hits.map((h) => h.id)).not.toContain(far.id);
    expect(fx.hits.map((h) => h.id)).not.toContain(me.id);
    const saves = core.s.log.filter((e) => e.spell === 'fireball' && e.dc);
    expect(saves.length).toBe(fx.hits.length);
    const dmg = core.s.log.find((e) => e.spell === 'fireball' && e.kind === 'roll' && !e.dc)!.roll!.total;
    for (const h of fx.hits) expect(h.amount).toBe(h.saved ? Math.floor(dmg / 2) : dmg);
    expect(far.hp).toBe(99);
  });
  it('Healing Word heals the ally it is aimed at', () => {
    fixDice();
    const { core, me } = table('cleric', 3);
    core.handle('p1', { t: 'hp', charId: me.charId!, delta: -10 });
    const before = me.hp;
    core.handle('p1', { t: 'cast', spellId: 'healingWord', slot: 1, targets: [me.id] });
    expect(me.hp).toBeGreaterThan(before);
    expect(core.s.log.find((e) => e.fx)!.fx!.hits[0].heal).toBe(true);
  });
  it('Shield cast after a hit turns it into a miss and gives the HP back', () => {
    fixDice();
    const { core, me } = table();
    const ac = me.ac;
    core.handle('gm', { t: 'roll', formula: `1d20+${ac - 9}`, label: 'Skeleton: Shortsword attack', attackDamage: '1d1+3', targetId: me.id });
    const hurt = me.hp;
    expect(hurt).toBeLessThan(me.maxHp);
    core.handle('p1', { t: 'cast', spellId: 'shield', slot: 1 });
    expect(me.ac).toBe(ac + 5);
    expect(me.conditions).toContain(SHIELD_MARK);
    expect(me.hp).toBe(me.maxHp);
    expect(core.s.log.find((e) => e.fx)!.fx!.blocked).toBe(true);
  });
  it('aiming picks the nearest foe in range, and centres a burst away from friends', () => {
    const { core, me, sk } = table();
    const p = planSpell(spellById('fireBolt')!, core.s.tokens, me);
    expect(p.targets).toEqual([sk.id]);
    const f = planSpell(spellById('fireball')!, core.s.tokens, me);
    expect(f.point).toBeTruthy();
    expect(Math.hypot(me.x + 0.5 - f.point![0], me.y + 0.5 - f.point![1])).toBeGreaterThan(4);
  });
});
