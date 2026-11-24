import { describe, it, expect } from 'vitest';
import { HostCore, newGame } from '../src/engine/game';
import { blankMap, setCells, rectCells } from '../src/engine/map';
import { premade, freshState, type CharacterBuild } from '../src/rules/character';

function table(code = 'ABCDEF') {
  const map = setCells(blankMap(12, 10), rectCells(1, 1, 10, 8), 1);
  const core = new HostCore(newGame(code, map));
  core.handle('gm', { t: 'gm:settings', patch: { startLevel: 20 } });
  core.handle('p1', { t: 'hello', name: 'Ann', clientId: 'p1' });
  return core;
}
function seat(core: HostCore, b: CharacterBuild = premade('fighter', 3)) {
  core.handle('p1', { t: 'saveChar', character: { build: b, state: freshState(b) } });
  const id = b.id;
  return { id, ch: () => core.s.characters[id], tok: () => core.s.tokens.find((t) => t.charId === id)! };
}

describe('table rules (SRD 5.2.1)', () => {
  it('a long rest gives back every spent Hit Die', () => {
    const core = table();
    const h = seat(core, premade('fighter', 8));
    h.ch().state.hitDiceUsed = 8;
    core.handle('p1', { t: 'rest', charId: h.id, kind: 'long' });
    expect(h.ch().state.hitDiceUsed).toBe(0);
  });

  it('lets a player roll initiative once per fight', () => {
    const core = table();
    seat(core);
    core.handle('gm', { t: 'gm:startCombat' });
    core.handle('p1', { t: 'initiative' });
    expect(() => core.handle('p1', { t: 'initiative' })).toThrow(/already rolled/);
  });

  it('gives a level 7 barbarian advantage on initiative', () => {
    const core = table();
    seat(core, premade('barbarian', 7));
    core.handle('gm', { t: 'gm:startCombat' });
    core.handle('p1', { t: 'initiative' });
    const e = [...core.s.log].reverse().find((x) => x.roll?.label === 'Initiative')!;
    expect(e.roll!.formula.startsWith('2d20kh1')).toBe(true);
  });

  it('exhaustion takes 2 per level off d20 rolls, 5 ft off speed, and kills at 6', () => {
    const core = table();
    const h = seat(core);
    const speed = h.tok().speed;
    core.handle('p1', { t: 'charState', charId: h.id, patch: { exhaustion: 2 } });
    expect(h.tok().speed).toBe(speed - 10);
    expect(h.ch().state.conditions).toContain('exhaustion');
    core.handle('p1', { t: 'roll', formula: '1d20+5', label: 'Athletics' });
    const e = core.s.log[core.s.log.length - 1];
    expect(e.roll!.formula).toBe('1d20+5-4');
    core.handle('p1', { t: 'roll', formula: '2d6+3', label: 'Longsword damage' });
    expect(core.s.log[core.s.log.length - 1].roll!.formula).toBe('2d6+3');
    core.handle('p1', { t: 'rest', charId: h.id, kind: 'long' });
    expect(h.ch().state.exhaustion).toBe(1);
    core.handle('p1', { t: 'charState', charId: h.id, patch: { exhaustion: 6 } });
    expect(h.ch().state.dead).toBe(true);
  });

  it("won't let a grappled or restrained hero walk away", () => {
    const core = table();
    const h = seat(core);
    core.handle('p1', { t: 'cond', target: h.id, cond: 'restrained', on: true });
    const t = h.tok();
    expect(() => core.handle('p1', { t: 'move', tokenId: t.id, x: t.x + 1, y: t.y })).toThrow(/restrained/);
  });

  it('drops concentration at 0 HP and caps the save DC at 30', () => {
    const core = table();
    const h = seat(core, premade('wizard', 3));
    const st = h.ch().state as ReturnType<typeof h.ch>['state'] & { concDC?: number };
    st.concentration = 'Web';
    st.hp = 500;
    core.handle('gm', { t: 'gm:damage', targets: [h.tok().id], amount: 100 });
    expect(st.concDC).toBe(30);
    st.concDC = undefined;
    core.handle('gm', { t: 'gm:damage', targets: [h.tok().id], amount: 400 });
    expect(st.hp).toBe(0);
    expect(st.concentration).toBeUndefined();
  });

  it('kills a hero at 0 HP who takes damage of at least their HP maximum', () => {
    const core = table();
    const h = seat(core);
    const max = h.ch().state.hp;
    core.handle('gm', { t: 'gm:damage', targets: [h.tok().id], amount: max });
    expect(h.ch().state.dead).toBeFalsy();
    core.handle('gm', { t: 'gm:damage', targets: [h.tok().id], amount: max });
    expect(h.ch().state.dead).toBe(true);
  });

  it("refuses attacks from a hero who is down or can't act", () => {
    const core = table();
    const h = seat(core);
    core.handle('p1', { t: 'cond', target: h.id, cond: 'stunned', on: true });
    expect(() => core.handle('p1', { t: 'roll', formula: '1d20+5', label: 'Longsword attack', attackDamage: '1d8+3' })).toThrow(/can't attack/);
    // ability checks are still fine
    core.handle('p1', { t: 'roll', formula: '1d20+2', label: 'Strength save' });
  });

  it('brings a hero rolled at an earlier table to a new one', () => {
    const first = table('AAAAAA');
    first.handle('p1', { t: 'rollStats' });
    const sets = first.view('p1').myStatRolls!.sets;
    const b = premade('fighter', 1);
    const [str, dex, con, int, wis, cha] = sets;
    const rolled: CharacterBuild = { ...b, base: { str, dex, con, int, wis, cha }, statMethod: 'roll' };
    first.handle('p1', { t: 'saveChar', character: { build: rolled, state: freshState(rolled) } });
    const kept = first.s.characters[b.id];
    expect(kept.build.rolledAt).toBe('AAAAAA');
    const next = table('BBBBBB');
    next.handle('p1', { t: 'saveChar', character: kept });
    expect(next.s.characters[b.id]).toBeTruthy();
    // a fresh hero claiming rolled scores still has to roll here
    const fresh: CharacterBuild = { ...premade('rogue', 1), statMethod: 'roll' };
    expect(() => next.handle('p1', { t: 'saveChar', character: { build: fresh, state: freshState(fresh) } })).toThrow(/Roll for stats/);
  });

  it('skips the turns of monsters that have fallen', () => {
    const core = table();
    const h = seat(core);
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'goblin', x: 6, y: 5, count: 2 });
    const gobs = core.s.tokens.filter((t) => t.kind === 'monster');
    core.handle('gm', { t: 'gm:startCombat' });
    core.handle('gm', { t: 'gm:setInit', tokenId: h.tok().id, init: 30 });
    core.handle('gm', { t: 'gm:setInit', tokenId: gobs[0].id, init: 20 });
    core.handle('gm', { t: 'gm:setInit', tokenId: gobs[1].id, init: 10 });
    core.handle('gm', { t: 'gm:damage', targets: [gobs[0].id], amount: 999 });
    core.handle('gm', { t: 'gm:nextTurn' });
    expect(core.currentTokenId()).toBe(gobs[1].id);
  });
});
