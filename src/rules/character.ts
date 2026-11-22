// Character model and the sheet calculator: every number on the sheet is computed from choices.
import { ABILITIES, type Ability, type Skill, SKILLS, mod, profBonus } from './core';
import { classById, spellSlots, maxSpellLevel, martialArtsDie, sneakDice, type ClassDef } from './classes';
import { speciesById, backgroundById } from './origins';
import { weaponById, armorById, MASTERY_TEXT } from './equipment';
import { spellById, spellsFor, type Spell } from './spells';

export type Scores = Record<Ability, number>;

export interface CharacterBuild {
  id: string;
  name: string;
  classId: string;
  speciesId: string;
  backgroundId: string;
  level: number;
  base: Scores; // before background and ASI bonuses
  bgBonus: Partial<Scores>; // +2/+1 or +1/+1/+1 among the background's abilities
  asi: Partial<Scores>; // level 4 ability score improvement
  skills: Skill[]; // class (and human) picks; background skills are added automatically
  expertise: Skill[];
  cantrips: string[];
  spells: string[]; // prepared spells
  armor?: string;
  shield: boolean;
  weapons: string[];
  gear: string[];
  color: string;
  notes: string;
  pronouns?: string;
}

export interface CharacterState {
  hp: number;
  tempHp: number;
  hitDiceUsed: number;
  deathSaves: { s: number; f: number };
  conditions: string[];
  exhaustion: number;
  slotsUsed: number[];
  resUsed: Record<string, number>;
  concentration?: string;
  inspiration: boolean;
  coins: number;
  stable?: boolean;
  dead?: boolean;
}

export interface Character { build: CharacterBuild; state: CharacterState; levelCap?: number; }

export interface Attack { name: string; toHit: number; dmg: string; type: string; note: string; mastery?: string; }

export interface Sheet {
  scores: Scores;
  mods: Scores;
  prof: number;
  saves: Record<Ability, { total: number; prof: boolean }>;
  skills: { id: Skill; name: string; ability: Ability; total: number; prof: boolean; expert: boolean }[];
  passivePerception: number;
  ac: number;
  acNote: string;
  maxHp: number;
  hitDie: number;
  speed: number;
  darkvision: number;
  initiative: number;
  attacks: Attack[];
  spell?: { ability: Ability; dc: number; attack: number; slots: number[]; cantrips: Spell[]; prepared: Spell[]; maxLevel: number; preparedMax: number; cantripMax: number; };
  features: { name: string; text: string; source: string }[];
  resources: { id: string; name: string; max: number; reset: 'short' | 'long' }[];
  cls: ClassDef;
  speciesName: string;
  backgroundName: string;
  subclass?: string;
}

export function finalScores(b: CharacterBuild): Scores {
  const out = { ...b.base };
  for (const a of ABILITIES) out[a] = Math.min(20, out[a] + (b.bgBonus[a] ?? 0) + (b.level >= 4 ? b.asi[a] ?? 0 : 0));
  return out;
}

export function backgroundSkills(b: CharacterBuild): Skill[] {
  return [...backgroundById(b.backgroundId).skills];
}

export function computeSheet(b: CharacterBuild): Sheet {
  const cls = classById(b.classId);
  const sp = speciesById(b.speciesId);
  const bg = backgroundById(b.backgroundId);
  const level = Math.min(5, Math.max(1, b.level));
  const scores = finalScores(b);
  const mods = Object.fromEntries(ABILITIES.map((a) => [a, mod(scores[a])])) as Scores;
  const prof = profBonus(level);
  const saves = Object.fromEntries(
    ABILITIES.map((a) => {
      const p = cls.saves.includes(a);
      return [a, { total: mods[a] + (p ? prof : 0), prof: p }];
    }),
  ) as Sheet['saves'];
  const profSkills = new Set<Skill>([...b.skills, ...bg.skills]);
  const jack = cls.id === 'bard' && level >= 2;
  const skills = SKILLS.map((s) => {
    const p = profSkills.has(s.id);
    const e = p && b.expertise.includes(s.id);
    const total = mods[s.ability] + (e ? prof * 2 : p ? prof : jack ? Math.floor(prof / 2) : 0);
    return { id: s.id, name: s.name, ability: s.ability, total, prof: p, expert: e };
  });
  const perception = skills.find((s) => s.id === 'perception')!.total;

  // Armor class
  const armor = b.armor ? armorById(b.armor) : undefined;
  let ac = 10 + mods.dex;
  let acNote = 'Unarmored';
  if (armor) {
    if (armor.kind === 'light') ac = armor.base + mods.dex;
    else if (armor.kind === 'medium') ac = armor.base + Math.min(2, mods.dex);
    else ac = armor.base;
    acNote = armor.name;
  } else if (cls.unarmored && !(cls.id === 'monk' && b.shield)) {
    ac = 10 + mods.dex + mods[cls.unarmored];
    acNote = 'Unarmored Defense';
  } else if (cls.id === 'sorcerer' && level >= 3) {
    ac = 10 + mods.dex + mods.cha;
    acNote = 'Draconic Resilience';
  }
  if (b.shield && cls.id !== 'monk') {
    ac += 2;
    acNote += ' + Shield';
  }

  // Hit points
  const avg = cls.hitDie / 2 + 1;
  let maxHp = cls.hitDie + mods.con + (level - 1) * (avg + mods.con);
  if (sp.hpPerLevel) maxHp += sp.hpPerLevel * level;
  if (cls.id === 'sorcerer' && level >= 3) maxHp += level;
  maxHp = Math.max(level, maxHp);

  // Speed
  let speed = sp.speed;
  if (cls.id === 'barbarian' && level >= 5 && armor?.kind !== 'heavy') speed += 10;
  if (cls.id === 'monk' && level >= 2 && !armor && !b.shield) speed += 10;

  const initiative = mods.dex + (bg.id === 'criminal' ? prof : 0);

  // Attacks
  const attacks: Attack[] = [];
  for (const wid of b.weapons) {
    const w = weaponById(wid);
    if (!w) continue;
    const ranged = w.props.includes('ranged');
    const monkWeapon = cls.id === 'monk' && !ranged && (!w.martial || w.props.includes('light'));
    let ab: Ability = ranged ? 'dex' : 'str';
    if (w.props.includes('finesse') || monkWeapon) ab = mods.dex > mods.str ? 'dex' : 'str';
    const m = mods[ab];
    let dice = w.dice;
    if (monkWeapon) {
      const die = martialArtsDie(level);
      const [n, s] = dice.split('d').map(Number);
      if (n === 1 && s < die) dice = `1d${die}`;
    }
    const notes: string[] = [];
    if (w.range) notes.push(`Range ${w.range} ft`);
    if (w.versatile) notes.push(`Two-handed ${w.versatile}`);
    if (cls.id === 'rogue' && (ranged || w.props.includes('finesse'))) notes.push(`Sneak Attack +${sneakDice(level)}d6`);
    if (cls.id === 'barbarian' && ab === 'str') notes.push('+2 while raging');
    attacks.push({ name: w.name, toHit: m + prof, dmg: `${dice}${m >= 0 ? '+' : ''}${m}`, type: w.type, note: notes.join(' · '), mastery: w.mastery });
  }
  if (cls.id === 'monk') {
    const m = Math.max(mods.dex, mods.str);
    attacks.push({ name: 'Unarmed Strike', toHit: m + prof, dmg: `1d${martialArtsDie(level)}${m >= 0 ? '+' : ''}${m}`, type: 'bludgeoning', note: 'Bonus action after Attack' });
  } else {
    attacks.push({ name: 'Unarmed Strike', toHit: mods.str + prof, dmg: `${Math.max(0, 1 + mods.str)}`, type: 'bludgeoning', note: '' });
  }

  // Spellcasting
  let spell: Sheet['spell'];
  if (cls.caster !== 'none' && cls.spellAbility) {
    const sm = mods[cls.spellAbility];
    const maxLevel = maxSpellLevel(cls, level);
    spell = {
      ability: cls.spellAbility,
      dc: 8 + prof + sm,
      attack: prof + sm,
      slots: spellSlots(cls, level),
      cantrips: b.cantrips.map((id) => spellById(id)).filter(Boolean) as Spell[],
      prepared: b.spells.map((id) => spellById(id)).filter((s): s is Spell => !!s && s.level <= maxLevel),
      maxLevel,
      preparedMax: cls.prepared?.[level - 1] ?? 0,
      cantripMax: cls.cantrips?.[level - 1] ?? 0,
    };
  }

  const features = [
    ...cls.features.filter((f) => f.level <= level).map((f) => ({ name: f.name, text: f.text, source: `${cls.name} ${f.level}` })),
    ...sp.traits.map((t) => ({ name: t.name, text: t.text, source: sp.name })),
    { name: bg.feat, text: bg.featText, source: `${bg.name} (origin feat)` },
  ];
  const resources = cls.resources
    .map((r) => ({ id: r.id, name: r.name, max: r.max(level, (a) => mods[a]), reset: r.reset }))
    .filter((r) => r.max > 0);

  return {
    scores, mods, prof, saves, skills, passivePerception: 10 + perception, ac, acNote, maxHp, hitDie: cls.hitDie,
    speed, darkvision: sp.darkvision, initiative, attacks, spell, features, resources, cls,
    speciesName: sp.name, backgroundName: bg.name, subclass: level >= 3 ? cls.subclass : undefined,
  };
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const pointsSpent = (s: Scores) => ABILITIES.reduce((t, a) => t + (POINT_COST[s[a]] ?? 99), 0);

const COLORS = ['#e4572e', '#29a3a3', '#f3a712', '#7d5ba6', '#4caf50', '#e83f6f', '#2e86de', '#c0763b'];
export const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function uid(prefix = '') {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return prefix + a[0].toString(36) + a[1].toString(36);
}

export function defaultBuild(classId: string, speciesId = 'human', backgroundId?: string, level = 1, name = ''): CharacterBuild {
  const cls = classById(classId);
  const bgId = backgroundId ?? ({ fighter: 'soldier', barbarian: 'soldier', paladin: 'soldier', ranger: 'soldier', rogue: 'criminal', monk: 'criminal', cleric: 'acolyte', druid: 'acolyte', bard: 'acolyte', wizard: 'sage', sorcerer: 'sage', warlock: 'acolyte' } as Record<string, string>)[classId];
  const bg = backgroundById(bgId);
  const base = {} as Scores;
  cls.standardArray.forEach((a, i) => (base[a] = STANDARD_ARRAY[i]));
  const order = cls.standardArray.filter((a) => bg.abilities.includes(a));
  const bgBonus: Partial<Scores> = { [order[0]]: 2, [order[1]]: 1 };
  const asi: Partial<Scores> = { [cls.standardArray[0]]: 2 };
  // sensible picks: Perception first, then skills that use the class's best abilities
  const abilityOf = (sk: Skill) => SKILLS.find((x) => x.id === sk)!.ability;
  const rank = (sk: Skill) => (sk === 'perception' ? -1 : cls.standardArray.indexOf(abilityOf(sk)));
  const skills = cls.skillFrom.filter((s) => !bg.skills.includes(s)).sort((a, b) => rank(a) - rank(b)).slice(0, cls.skillCount);
  if (speciesById(speciesId).extraSkill) {
    const extra = ['perception', 'insight', 'athletics', 'stealth'].find((s) => !skills.includes(s as Skill) && !bg.skills.includes(s as Skill));
    if (extra) skills.push(extra as Skill);
  }
  const expertise = cls.id === 'rogue' || (cls.id === 'bard' && level >= 2) ? skills.slice(0, 2) : [];
  const pool = spellsFor(cls.id, maxSpellLevel(cls, level));
  // classic picks first (the spells most tables reach for), then the rest
  const spellRank = (id: string) => {
    const i = CLASSIC_SPELLS.indexOf(id);
    return i < 0 ? 999 : i;
  };
  const cantrips = pool.filter((s) => s.level === 0).sort((a, b) => spellRank(a.id) - spellRank(b.id) || (b.damage || b.heal ? 1 : 0) - (a.damage || a.heal ? 1 : 0)).map((s) => s.id).slice(0, cls.cantrips?.[level - 1] ?? 0);
  const prepared = pool.filter((s) => s.level > 0).sort((a, b) => spellRank(a.id) - spellRank(b.id) || b.level - a.level || (b.damage || b.heal ? 1 : 0) - (a.damage || a.heal ? 1 : 0)).map((s) => s.id).slice(0, cls.prepared?.[level - 1] ?? 0);
  return {
    id: uid('c_'), name: name || `${cls.name} hero`, classId, speciesId, backgroundId: bgId, level,
    base, bgBonus, asi, skills, expertise, cantrips, spells: prepared,
    armor: cls.kit.armor, shield: !!cls.kit.shield, weapons: [...cls.kit.weapons], gear: [...cls.kit.gear],
    color: randomColor(), notes: '',
  };
}

export function freshState(b: CharacterBuild): CharacterState {
  const sheet = computeSheet(b);
  return {
    hp: sheet.maxHp, tempHp: 0, hitDiceUsed: 0, deathSaves: { s: 0, f: 0 }, conditions: [], exhaustion: 0,
    slotsUsed: sheet.spell ? sheet.spell.slots.map(() => 0) : [], resUsed: {}, inspiration: b.speciesId === 'human', coins: 10,
  };
}

export const masteryText = (m?: string) => (m ? MASTERY_TEXT[m] ?? '' : '');

const CLASSIC_SPELLS = [
  'fireBolt', 'rayOfFrost', 'sacredFlame', 'eldritchBlast', 'viciousMockery', 'produceFlame', 'guidance', 'mageHand', 'light', 'prestidigitation',
  'fireball', 'magicMissile', 'shield', 'healingWord', 'cureWounds', 'guidingBolt', 'spiritGuardians', 'spiritualWeapon', 'bless', 'revivify',
  'callLightning', 'moonbeam', 'scorchingRay', 'mistyStep', 'shatter', 'holdPerson', 'sleep', 'thunderwave', 'counterspell', 'lightningBolt',
];
export const PREMADE_NAMES: Record<string, [string, string]> = {
  barbarian: ['Bruna Stonefist', 'goliath'], bard: ['Pell Wrenwhistle', 'halfling'], cleric: ['Sister Oriel', 'dwarf'],
  druid: ['Thessaly Fern', 'elf'], fighter: ['Garrick Vale', 'human'], monk: ['Kai Ashborn', 'human'],
  paladin: ['Dorn Brightmantle', 'dragonborn'], ranger: ['Wren Hollowmere', 'elf'], rogue: ['Nix Quickfinger', 'halfling'],
  sorcerer: ['Ember Vashti', 'tiefling'], warlock: ['Corvin Black', 'tiefling'], wizard: ['Quill Tinkertop', 'gnome'],
};
export const premade = (classId: string, level = 1): CharacterBuild => {
  const [name, species] = PREMADE_NAMES[classId];
  return defaultBuild(classId, species, undefined, level, name);
};
