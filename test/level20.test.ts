import { describe, it, expect } from 'vitest';
import { CLASSES, classById, spellSlots, learnableSpellLevel, attacksPerAction, critRange } from '../src/rules/classes';
import { computeSheet, premade, defaultBuild, finalScores, freshState } from '../src/rules/character';
import { SPELLS, spellById, spellDamage, spellsFor } from '../src/rules/spells';
import { roll } from '../src/engine/dice';

describe('levels 1 to 20', () => {
  it('every class builds a sane sheet at every level', () => {
    for (const c of CLASSES)
      for (let l = 1; l <= 20; l++) {
        const b = premade(c.id, l);
        const s = computeSheet(b);
        expect(s.maxHp, `${c.id} ${l}`).toBeGreaterThan(0);
        expect(s.prof).toBe(Math.ceil(l / 4) + 1);
        for (const a of Object.values(s.scores)) expect(a).toBeLessThanOrEqual(30);
        if (c.caster !== 'none') {
          expect(s.spell!.cantrips.length, `${c.id} ${l} cantrips`).toBe(c.cantrips?.[l - 1] ?? 0);
          expect(s.spell!.prepared.length, `${c.id} ${l} prepared`).toBeLessThanOrEqual(c.prepared![l - 1]);
          expect(s.spell!.prepared.length, `${c.id} ${l} prepared`).toBeGreaterThan(0);
        }
        expect(freshState(b).hp).toBe(s.maxHp);
      }
  });
  it('slot tables match the rules', () => {
    expect(spellSlots(classById('wizard'), 20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
    expect(spellSlots(classById('paladin'), 20)).toEqual([4, 3, 3, 3, 2]);
    expect(spellSlots(classById('warlock'), 20)).toEqual([0, 0, 0, 0, 4]);
    expect(learnableSpellLevel(classById('warlock'), 17)).toBe(9);
    expect(attacksPerAction(classById('fighter'), 20)).toBe(4);
    expect(critRange(classById('fighter'), 15)).toBe(18);
  });
  it('capstones raise scores past 20', () => {
    const s = computeSheet(premade('barbarian', 20));
    expect(s.scores.str).toBeGreaterThan(20);
    expect(s.scores.str).toBeLessThanOrEqual(25);
  });
  it('old level-4 saves still work', () => {
    const b = defaultBuild('fighter', 'human', 'soldier', 4);
    delete b.asis;
    b.asi = { str: 2 };
    expect(finalScores(b).str).toBe(b.base.str + (b.bgBonus.str ?? 0) + 2);
  });
  it('every spell is well formed and every class has 9th-level spells', () => {
    const ids = new Set<string>();
    for (const s of SPELLS) {
      expect(ids.has(s.id), s.id).toBe(false);
      ids.add(s.id);
      if (s.damage) expect(() => roll(s.damage!)).not.toThrow();
      if (s.heal) expect(() => roll(s.heal!)).not.toThrow();
    }
    for (const c of ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']) expect(spellsFor(c, 9).some((s) => s.level === 9), c).toBe(true);
    expect(spellDamage(spellById('fireBolt')!, 17, 0)).toBe('4d10');
    expect(spellDamage(spellById('fireBolt')!, 11, 0)).toBe('3d10');
  });
});
