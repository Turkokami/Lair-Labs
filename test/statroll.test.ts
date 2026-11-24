import { describe, it, expect } from 'vitest';
import { HostCore, newGame } from '../src/engine/game';
import { blankMap } from '../src/engine/map';
import { premade, freshState, type CharacterBuild } from '../src/rules/character';

function table() {
  const core = new HostCore(newGame('ABCDEF', blankMap(12, 10)));
  core.handle('p1', { t: 'hello', name: 'Ann', clientId: 'p1' });
  return core;
}
const hero = (base: number[], statMethod?: CharacterBuild['statMethod']) => {
  const b = premade('fighter', 1);
  const [str, dex, con, int, wis, cha] = base;
  return { ...b, base: { str, dex, con, int, wis, cha }, statMethod };
};

describe('roll for stats', () => {
  it('rolls six 4d6-drop-lowest scores where the table sees them', () => {
    const core = table();
    core.handle('p1', { t: 'rollStats' });
    const v = core.view('p1');
    const sets = v.myStatRolls!.sets;
    expect(sets).toHaveLength(6);
    for (const n of sets) expect(n).toBeGreaterThanOrEqual(3), expect(n).toBeLessThanOrEqual(18);
    const entry = v.log.find((e) => e.text?.startsWith('rolled for stats'))!;
    expect(entry.visibility).toBe('public');
    expect(entry.inline!.map((x) => x.total)).toEqual(sets);
    // the GM sees it too
    expect(core.view('gm').log.some((e) => e.text?.startsWith('rolled for stats'))).toBe(true);
  });
  it('allows no reroll unless the GM does, and then only one', () => {
    const core = table();
    core.handle('p1', { t: 'rollStats' });
    expect(() => core.handle('p1', { t: 'rollStats' })).toThrow(/reroll/);
    core.handle('gm', { t: 'gm:settings', patch: { statReroll: true } });
    expect(core.view('p1').myStatRolls!.canReroll).toBe(true);
    core.handle('p1', { t: 'rollStats' });
    expect(core.view('p1').myStatRolls!.canReroll).toBe(false);
    expect(() => core.handle('p1', { t: 'rollStats' })).toThrow(/already used/);
  });
  it('keeps a rolled hero to the numbers rolled', () => {
    const core = table();
    core.handle('p1', { t: 'rollStats' });
    const sets = core.view('p1').myStatRolls!.sets;
    const cheat = hero([18, 18, 18, 18, 18, 18], 'roll');
    expect(() => core.handle('p1', { t: 'saveChar', character: { build: cheat, state: freshState(cheat) } })).toThrow(/six you rolled/);
    const fair = hero([...sets].reverse(), 'roll');
    core.handle('p1', { t: 'saveChar', character: { build: fair, state: freshState(fair) } });
    expect(core.view('p1').myCharacter?.build.id).toBe(fair.id);
  });
  it('can be required or turned off by the GM', () => {
    const core = table();
    core.handle('gm', { t: 'gm:settings', patch: { statRoll: 'require' } });
    const arr = hero([15, 14, 13, 12, 10, 8], 'array');
    expect(() => core.handle('p1', { t: 'saveChar', character: { build: arr, state: freshState(arr) } })).toThrow(/rolled scores/);
    core.handle('gm', { t: 'gm:settings', patch: { statRoll: 'off' } });
    expect(() => core.handle('p1', { t: 'rollStats' })).toThrow(/turned off/);
    core.handle('p1', { t: 'saveChar', character: { build: arr, state: freshState(arr) } });
  });
});
