import { describe, it, expect } from 'vitest';
import { MemoryHub } from '../src/net/transport';
import { HostSession } from '../src/net/session';
import { newGame, type Intent } from '../src/engine/game';
import { TEMPLATES, isFloor, isWall, edgeBetween, type GameMap } from '../src/engine/map';
import { objectById } from '../src/library/objects';
import { creatureById } from '../src/library/creatures';
import { monsterById } from '../src/rules/monsters';
import { ADVENTURE_CARDS, loadAdventure } from '../src/adventures';
import { encounterXp, difficultyFor, statId } from '../src/adventures/xp';
import { startChapter, encounterGroups } from '../src/adventures/start';
import type { Adventure } from '../src/adventures/types';

// the old Goblin Warren sample had 342 floor squares; every adventure map is at least five times that
const OLD_WARREN_FLOOR = 342;

/** Every floor square reachable from the heroes' start, walking through doors (open, shut or secret). */
function reachable(m: GameMap) {
  const [sx, sy] = m.playerStart ?? [0, 0];
  const seen = new Set<number>([sy * m.cols + sx]);
  const todo: [number, number][] = [[sx, sy]];
  while (todo.length) {
    const [x, y] = todo.pop()!;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (!isFloor(m, nx, ny) || seen.has(ny * m.cols + nx)) continue;
      const k = edgeBetween(x, y, nx, ny)!;
      if (isWall(m, k) && !m.doors[k] && m.wallKinds?.[k] !== 'window') continue;
      seen.add(ny * m.cols + nx);
      todo.push([nx, ny]);
    }
  }
  return seen;
}

const all: Adventure[] = [];

describe('ready-made adventures', async () => {
  for (const c of ADVENTURE_CARDS) all.push(await loadAdventure(c.id));

  it('every card loads its adventure', () => {
    expect(all.map((a) => a.id)).toEqual(ADVENTURE_CARDS.map((c) => c.id));
    for (const a of all) expect(a.chapters.length).toBe(ADVENTURE_CARDS.find((c) => c.id === a.id)!.chapters);
  });

  for (const a of [...all]) {
    describe(a.title, () => {
      it('people, handouts and placements fit together', () => {
        const ids = new Set(a.npcs.map((n) => n.id));
        expect(ids.size).toBe(a.npcs.length);
        for (const n of a.npcs) {
          expect(n.id).toMatch(/^pf_[a-z0-9]{4,32}$/);
          if (n.art) expect(creatureById(n.art), n.art).toBeTruthy();
          if (n.monsterId) expect(monsterById(n.monsterId), n.monsterId).toBeTruthy();
          expect(n.wants && n.knows && n.voice && n.appearance).toBeTruthy();
        }
        const handouts = new Set(a.handouts.map((h) => h.id));
        for (const ch of a.chapters) for (const sc of ch.scenes) if (sc.handout) expect(handouts.has(sc.handout), sc.handout).toBe(true);
      });

      for (const ch of a.chapters) {
        it(`${ch.title}: a big, connected map with sound rooms, props and fights`, () => {
          const m = ch.map();
          expect(m.cols).toBeLessThanOrEqual(80);
          expect(m.rows).toBeLessThanOrEqual(80);
          const floor = m.cells.filter((v) => v > 0).length;
          expect(floor).toBeGreaterThanOrEqual(OLD_WARREN_FLOOR * 5);
          // nowhere is cut off
          const seen = reachable(m);
          const lost = m.cells.map((v, i) => (v > 0 && !seen.has(i) ? `${i % m.cols},${Math.floor(i / m.cols)}` : '')).filter(Boolean);
          expect(lost.slice(0, 5), `${lost.length} squares cut off`).toEqual([]);
          // every prop exists and stands on the map
          for (const p of m.props) {
            expect(objectById(p.kind), p.kind).toBeTruthy();
            expect(isFloor(m, p.x, p.y), `${p.kind} at ${p.x},${p.y}`).toBe(true);
          }
          for (const l of m.lights ?? []) expect(isFloor(m, Math.floor(l.x), Math.floor(l.y)), `light at ${l.x},${l.y}`).toBe(true);
          // every door sits between two squares, at least one of them floor
          for (const k of Object.keys(m.doors)) {
            const [t, xy] = k.split(':');
            const [x, y] = xy.split(',').map(Number);
            const [ax, ay, bx, by] = t === 'h' ? [x, y - 1, x, y] : [x - 1, y, x, y];
            expect(isFloor(m, ax, ay) && isFloor(m, bx, by), `door ${k} needs floor both sides`).toBe(true);
          }
          // fights: real stat blocks, and as hard as they say for heroes of this level
          for (const en of m.encounters ?? []) {
            for (const g of en.monsters) expect(statId(g.srd), g.srd).toBeTruthy();
            expect(difficultyFor(encounterXp(en.monsters), ch.level), en.name).toBe(en.difficulty);
          }
          // scenes point at real rooms and fights; NPCs stand on the floor
          const rooms = new Set((m.rooms ?? []).map((r) => r.name));
          const fights = new Set((m.encounters ?? []).map((e) => e.name));
          for (const sc of ch.scenes) {
            if (sc.room) expect(rooms.has(sc.room), sc.room).toBe(true);
            if (sc.encounter) expect(fights.has(sc.encounter), sc.encounter).toBe(true);
          }
          for (const p of ch.npcs) {
            expect(a.npcs.some((n) => n.id === p.npc), p.npc).toBe(true);
            expect(isFloor(m, p.x, p.y), `${p.npc} at ${p.x},${p.y}`).toBe(true);
          }
          expect(m.playerStart && isFloor(m, m.playerStart[0], m.playerStart[1])).toBe(true);
        });
      }
    });
  }
});

describe('starting an adventure at the table', () => {
  it('loads the map, the people and the hidden monsters, then moves on to the next part', async () => {
    const hub = new MemoryHub();
    const host = new HostSession(newGame('ADV7Q4', TEMPLATES[0].make()), hub.makeHost(), 5);
    await host.start();
    const gm = (i: Intent) => !host.gm(i);
    const s = () => host.core.s;
    gm({ t: 'gm:addMonster', monsterId: 'goblin', x: 2, y: 2 });
    const adv = await loadAdventure('drowned-bells');
    const r = startChapter(gm, s, adv, 0, { monsters: true, clear: true });
    expect(r).toBeTruthy();
    expect(s().map.name).toBe('Saltmarrow by night');
    expect(s().tokens.some((t) => t.monsterId === 'goblin')).toBe(false);
    for (const n of adv.npcs) expect(s().profiles?.[n.id]?.name).toBe(n.name);
    expect(s().profiles?.pf_silaswren.gmNotes).toContain('Knows:');
    expect(s().profiles?.pf_dorriequill.shared).toBe(true);
    const silas = s().tokens.find((t) => t.profileId === 'pf_silaswren')!;
    expect(silas.hidden).toBe(true);
    expect(silas.maxHp).toBe(monsterById('cultFanatic')!.hp);
    // Silas stands for the warehouse's cult fanatic, so it is not placed twice
    const warehouse = s().map.encounters!.find((e) => e.name === 'The Quiet Tide sings')!;
    expect(encounterGroups(adv.chapters[0], adv, warehouse).find((g) => g.id === 'cultFanatic')).toBeUndefined();
    const monsters = s().tokens.filter((t) => t.kind === 'monster' && !t.profileId);
    expect(monsters.length).toBe(r && r.placed);
    expect(monsters.every((t) => t.hidden && isFloor(s().map, t.x, t.y))).toBe(true);
    // a GM's edit to a profile survives moving on
    gm({ t: 'profile:save', profile: { ...s().profiles!.pf_dorriequill, title: 'my own innkeeper' } });
    startChapter(gm, s, adv, 1, { monsters: true, clear: true });
    expect(s().map.name).toBe('The Gullet');
    expect(s().profiles?.pf_dorriequill.title).toBe('my own innkeeper');
    expect(s().tokens.filter((t) => t.profileId === 'pf_silaswren').length).toBe(1);
    host.stop();
  });
});
