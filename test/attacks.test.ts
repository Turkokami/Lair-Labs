import { describe, it, expect, vi, afterEach } from 'vitest';
import { blankMap, setCells, rectCells } from '../src/engine/map';
import { HostCore, newGame } from '../src/engine/game';

function table() {
  let m = blankMap(10, 6);
  m = setCells(m, rectCells(1, 1, 8, 4), 1);
  const core = new HostCore(newGame('ABCDEF', m));
  core.handle('gm', { t: 'gm:addMonster', monsterId: 'goblin', x: 3, y: 2 });
  const gob = core.s.tokens[0];
  return { core, gob };
}

// every die lands in the middle (a d20 shows 11), so the tests don't depend on luck
function fixDice() {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView | null>(a: T) => {
    const u = a as unknown as Uint32Array;
    for (let i = 0; i < u.length; i++) u[i] = 0x80000000;
    return a;
  });
}
afterEach(() => vi.restoreAllMocks());

describe('aimed attacks', () => {
  it('a roll that beats AC hits and takes the rolled damage off the target', () => {
    fixDice();
    const { core, gob } = table();
    core.handle('gm', { t: 'roll', formula: '1d20+40', label: 'Test attack', attackDamage: '1d1+2', targetId: gob.id });
    const log = core.s.log.filter((e) => e.kind === 'roll');
    expect(log[0].hit).toBe(true);
    expect(log[0].target).toBe(gob.name);
    expect(log[1].appliedTo).toBe(gob.name);
    expect(gob.hp).toBe(gob.maxHp - log[1].roll!.total);
    expect(log[1].roll!.total).toBeGreaterThan(0);
  });
  it('a roll under AC misses and does nothing', () => {
    fixDice();
    const { core, gob } = table();
    core.handle('gm', { t: 'roll', formula: '1d20-12', label: 'Test attack', attackDamage: '1d1+2', targetId: gob.id });
    const log = core.s.log.filter((e) => e.kind === 'roll');
    expect(log.length).toBe(1);
    expect(log[0].hit).toBe(false);
    expect(gob.hp).toBe(gob.maxHp);
  });
  it('the GM can turn it off and get the old roll-damage button', () => {
    fixDice();
    const { core, gob } = table();
    core.handle('gm', { t: 'gm:settings', patch: { autoAttacks: false } });
    core.handle('gm', { t: 'roll', formula: '1d20+40', label: 'Test attack', attackDamage: '1d1+2', targetId: gob.id });
    const e = core.s.log.filter((x) => x.kind === 'roll')[0];
    expect(e.hit).toBeUndefined();
    expect(e.damageFormula).toBe('1d1+2');
    expect(gob.hp).toBe(gob.maxHp);
  });
});

describe('turn order', () => {
  it('whoever rolls highest goes first, even if they roll after the monsters', () => {
    let m = blankMap(10, 6);
    m = setCells(m, rectCells(1, 1, 8, 4), 1);
    const core = new HostCore(newGame('ABCDEF', m));
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'goblin', x: 3, y: 2 });
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'goblin', x: 5, y: 2 });
    const [a, b] = core.s.tokens;
    core.handle('gm', { t: 'gm:startCombat', tokenIds: [] });
    core.handle('gm', { t: 'gm:setInit', tokenId: a.id, init: 5 });
    core.handle('gm', { t: 'gm:setInit', tokenId: b.id, init: 18 });
    expect(core.currentTokenId()).toBe(b.id);
    // once the first turn is over, a new roll no longer takes the turn away
    core.handle('gm', { t: 'gm:nextTurn' });
    expect(core.currentTokenId()).toBe(a.id);
    core.handle('gm', { t: 'gm:setInit', tokenId: b.id, init: 20 });
    expect(core.currentTokenId()).toBe(a.id);
  });
});

describe('aiming from a phone', () => {
  it("finds a monster whose HP the phone can't see", async () => {
    const { nearestFoe } = await import('../src/ui/targets');
    const me = { id: 'h', kind: 'pc', x: 1, y: 1, size: 1, hp: 20, hidden: false } as never;
    const sk = { id: 's', kind: 'monster', x: 2, y: 1, size: 1, hp: -1, hidden: false, hpLabel: '' } as never;
    const down = { id: 'd', kind: 'monster', x: 1, y: 2, size: 1, hp: 0, hidden: false, hpLabel: 'Down' } as never;
    expect((nearestFoe([me, down, sk], me, 5) as { id: string } | undefined)?.id).toBe('s');
  });
});
