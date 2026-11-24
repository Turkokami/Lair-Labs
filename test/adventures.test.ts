import { describe, it, expect } from 'vitest';
import { MemoryHub } from '../src/net/transport';
import { HostSession } from '../src/net/session';
import { newGame, type Intent } from '../src/engine/game';
import { TEMPLATES, isFloor } from '../src/engine/map';
import { monsterById } from '../src/rules/monsters';
import { ADVENTURE_CARDS, loadAdventure } from '../src/adventures';
import { checkAdventure, MIN_FLOOR } from '../src/adventures/validate';
import { startChapter, encounterGroups } from '../src/adventures/start';
import type { Adventure } from '../src/adventures/types';

const all: Adventure[] = [];

describe('ready-made adventures', async () => {
  for (const c of ADVENTURE_CARDS) all.push(await loadAdventure(c.id));

  it('every card loads its adventure, and no two share an id or a profile id', () => {
    expect(all.map((a) => a.id)).toEqual(ADVENTURE_CARDS.map((c) => c.id));
    expect(new Set(all.map((a) => a.id)).size).toBe(all.length);
    for (const a of all) expect(a.chapters.length).toBe(ADVENTURE_CARDS.find((c) => c.id === a.id)!.chapters);
    const pids = all.flatMap((a) => a.npcs.map((n) => n.id));
    expect(pids.filter((id, i) => pids.indexOf(id) !== i)).toEqual([]);
  });

  for (const a of [...all]) {
    it(`${a.title}: big connected maps, real props and stat blocks, fair fights`, () => {
      expect(checkAdventure(a)).toEqual([]);
      for (const ch of a.chapters) expect(ch.map().cells.filter((v) => v > 0).length).toBeGreaterThanOrEqual(MIN_FLOOR);
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
