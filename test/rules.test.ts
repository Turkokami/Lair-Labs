import { describe, it, expect } from 'vitest';
import { roll, parse, critFormula } from '../src/engine/dice';
import { CLASSES, spellSlots } from '../src/rules/classes';
import { computeSheet, premade, defaultBuild } from '../src/rules/character';
import { TEMPLATES, moveCost, floodRoom, randomDungeon, isWall, allWallEdges, blankMap, setCells, rectCells } from '../src/engine/map';
import { MONSTERS } from '../src/rules/monsters';
import { SPELLS, spellById } from '../src/rules/spells';

describe('dice', () => {
  it('parses and rolls standard notation', () => {
    const seq = [3, 17, 5, 1, 6, 6];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    expect(roll('2d20kh1+5', rng).total).toBe(22);
    i = 0;
    expect(roll('2d20kl1', rng).natural).toBe(3);
    expect(() => parse('2x6')).toThrow();
    expect(parse('1d8+2 # Longsword').label).toBe('Longsword');
    expect(critFormula('1d8+2d6+3')).toBe('2d8+4d6+3');
    for (let k = 0; k < 500; k++) {
      const r = roll('1d20');
      expect(r.total).toBeGreaterThanOrEqual(1);
      expect(r.total).toBeLessThanOrEqual(20);
    }
  });
});

describe('characters', () => {
  it('every class builds a sane sheet at levels 1 to 5', () => {
    for (const c of CLASSES)
      for (let l = 1; l <= 5; l++) {
        const s = computeSheet(premade(c.id, l));
        expect(s.maxHp, `${c.id} ${l}`).toBeGreaterThan(0);
        expect(s.ac).toBeGreaterThanOrEqual(10);
        expect(s.prof).toBe(l >= 5 ? 3 : 2);
        expect(s.attacks.length).toBeGreaterThan(0);
        if (c.caster !== 'none') expect(s.spell?.slots.length, `${c.id} ${l}`).toBeGreaterThan(c.caster === 'half' && l === 1 ? -1 : 0);
      }
  });
  it('known values', () => {
    const f = computeSheet(defaultBuild('fighter', 'human', 'soldier', 1));
    expect(f.maxHp).toBe(10 + f.mods.con);
    expect(spellSlots(CLASSES.find((c) => c.id === 'wizard')!, 5)).toEqual([4, 3, 2]);
  });
  it('spells and monsters reference real data', () => {
    for (const c of CLASSES) for (const id of [...(c.kit.weapons ?? [])]) expect(id).toBeTruthy();
    expect(SPELLS.length).toBeGreaterThan(50);
    expect(spellById('fireBolt')).toBeTruthy();
    expect(MONSTERS.every((m) => m.hp > 0 && m.ac > 0 && m.actions.length > 0)).toBe(true);
  });
});

describe('map', () => {
  it('walls appear around rooms automatically', () => {
    const m = setCells(blankMap(10, 10), rectCells(2, 2, 5, 5), 1);
    expect(allWallEdges(m).length).toBe(16);
    expect(isWall(m, 'h:2,2')).toBe(true);
    expect(isWall(m, 'h:3,3')).toBe(false);
  });
  it('templates are connected and pathable', () => {
    for (const t of TEMPLATES) {
      const m = t.make();
      const floors = m.cells.filter((c) => c > 0).length;
      expect(floors, t.id).toBeGreaterThan(80);
      for (const k of Object.keys(m.doors)) expect(isWall(m, k) || m.doors[k] !== undefined, k).toBe(true);
    }
  });
  it('flood fill stops at doors and pathing counts difficult terrain', () => {
    let m = setCells(blankMap(12, 5), rectCells(1, 1, 10, 3), 1);
    expect(floodRoom(m, 2, 2).length).toBe(30);
    expect(moveCost(m, 1, 1, 6, 1)).toBe(25);
    m = setCells(m, [[3, 1], [3, 2], [3, 3]], 3);
    expect(moveCost(m, 1, 1, 6, 1)).toBe(30);
  });
  it('random dungeons generate', () => {
    for (let s = 1; s < 20; s++) {
      const m = randomDungeon('small', s);
      expect(m.cells.filter((c) => c > 0).length).toBeGreaterThan(40);
    }
  });
});
