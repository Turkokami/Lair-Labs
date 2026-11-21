import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { blankMap, setCells, rectCells, vKey, type GameMap } from '../src/engine/map';
import { partyVision, clearLine, sightFrom } from '../src/engine/vision';
import { HostCore, newGame } from '../src/engine/game';

function twoRooms(): GameMap {
  // room A x 1..4, room B x 6..9, joined by a one-square doorway at x=5,y=3
  let m = blankMap(12, 8);
  m = setCells(m, rectCells(1, 1, 4, 5), 1);
  m = setCells(m, rectCells(6, 1, 9, 5), 1);
  m = setCells(m, [[5, 3]], 1);
  m.doors[vKey(5, 3)] = 'closed';
  return m;
}

describe('line of sight', () => {
  it('walls and shut doors block sight, open doors do not', () => {
    const m = twoRooms();
    expect(clearLine(m, 2.5, 3.5, 8.5, 3.5)).toBe(false);
    m.doors[vKey(5, 3)] = 'open';
    expect(clearLine(m, 2.5, 3.5, 8.5, 3.5)).toBe(true);
    expect(clearLine(m, 2.5, 1.5, 8.5, 1.5)).toBe(false); // solid wall between the rooms
  });
  it('sees its own room in bright light but not the next', () => {
    const m = twoRooms();
    m.ambient = 'bright';
    const v = partyVision(m, [{ x: 2, y: 3, size: 1, darkvision: 0 }]);
    expect(v.visible.has(1 * 12 + 1)).toBe(true);
    expect(v.visible.has(3 * 12 + 8)).toBe(false);
  });
  it('in the dark you see only what a light or darkvision reaches', () => {
    const m = twoRooms();
    m.ambient = 'dark';
    const blind = partyVision(m, [{ x: 1, y: 1, size: 1, darkvision: 0 }]);
    expect(blind.visible.has(5 * 12 + 4)).toBe(false);
    const dwarf = partyVision(m, [{ x: 1, y: 1, size: 1, darkvision: 60 }]);
    expect(dwarf.visible.has(5 * 12 + 4)).toBe(true);
    const torch = partyVision(m, [{ x: 1, y: 1, size: 1, darkvision: 0, light: { bright: 20, dim: 20 } }]);
    expect(torch.visible.has(5 * 12 + 4)).toBe(true);
    expect(torch.light[1 * 12 + 1]).toBe(2);
  });
  it('is fast enough on the biggest library map', () => {
    const m = JSON.parse(readFileSync('public/library/maps/goblin-warren.json', 'utf8')) as GameMap;
    const t0 = performance.now();
    for (let i = 0; i < 5; i++) partyVision(m, [{ x: 5, y: 12, size: 1, darkvision: 60 }, { x: 6, y: 12, size: 1, darkvision: 0, light: { bright: 20, dim: 20 } }]);
    const ms = (performance.now() - t0) / 5;
    expect(ms).toBeLessThan(150);
    expect(sightFrom(m, 5.5, 12.5, 40).size).toBeGreaterThan(5);
  });
});

describe('dynamic lighting in a game', () => {
  it('hides monsters the heroes cannot see', () => {
    const m = twoRooms();
    m.ambient = 'bright';
    const core = new HostCore(newGame('ABCDEF', m));
    core.handle('gm', { t: 'gm:addToken', token: { name: 'Hero', kind: 'pc', x: 2, y: 3 } });
    core.handle('gm', { t: 'gm:addMonster', monsterId: 'goblin', x: 8, y: 3 });
    core.handle('p1', { t: 'hello', name: 'Ann', clientId: 'p1' });
    let v = core.view('p1');
    expect(v.tokens.some((t) => t.kind === 'monster')).toBe(false);
    core.handle('gm', { t: 'gm:doorState', key: vKey(5, 3), state: 'open' });
    v = core.view('p1');
    expect(v.tokens.some((t) => t.kind === 'monster')).toBe(true);
    expect(v.visible?.length).toBeGreaterThan(10);
  });
  it('keeps the X-card anonymous', () => {
    const core = new HostCore(newGame('ABCDEF', twoRooms()));
    core.handle('p1', { t: 'hello', name: 'Ann', clientId: 'p1' });
    core.handle('p1', { t: 'xcard' });
    const e = core.s.log[core.s.log.length - 1];
    expect(e.text).toMatch(/X-card/);
    expect(JSON.stringify(e)).not.toMatch(/Ann|p1/);
    expect(core.view('gm').xcardAt).toBeGreaterThan(0);
  });
});
