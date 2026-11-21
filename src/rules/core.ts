// Core fifth-edition rules data. Source: System Reference Document 5.2.1 (CC-BY-4.0).
export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export const ABILITY_NAMES: Record<Ability, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};
export const ABILITY_SHORT: Record<Ability, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

export type Skill =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics' | 'deception' | 'history' | 'insight'
  | 'intimidation' | 'investigation' | 'medicine' | 'nature' | 'perception' | 'performance'
  | 'persuasion' | 'religion' | 'sleightOfHand' | 'stealth' | 'survival';

export const SKILLS: { id: Skill; name: string; ability: Ability }[] = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { id: 'animalHandling', name: 'Animal Handling', ability: 'wis' },
  { id: 'arcana', name: 'Arcana', ability: 'int' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'deception', name: 'Deception', ability: 'cha' },
  { id: 'history', name: 'History', ability: 'int' },
  { id: 'insight', name: 'Insight', ability: 'wis' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { id: 'investigation', name: 'Investigation', ability: 'int' },
  { id: 'medicine', name: 'Medicine', ability: 'wis' },
  { id: 'nature', name: 'Nature', ability: 'int' },
  { id: 'perception', name: 'Perception', ability: 'wis' },
  { id: 'performance', name: 'Performance', ability: 'cha' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha' },
  { id: 'religion', name: 'Religion', ability: 'int' },
  { id: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dex' },
  { id: 'stealth', name: 'Stealth', ability: 'dex' },
  { id: 'survival', name: 'Survival', ability: 'wis' },
];
export const ALL_SKILLS = SKILLS.map((s) => s.id);
export const skillName = (id: Skill) => SKILLS.find((s) => s.id === id)?.name ?? id;

export const mod = (score: number) => Math.floor((score - 10) / 2);
export const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
export const profBonus = (level: number) => 2 + Math.floor((Math.max(1, level) - 1) / 4);

export const CONDITIONS: { id: string; name: string; text: string }[] = [
  { id: 'blinded', name: 'Blinded', text: "Can't see; automatically fails checks that need sight. Attacks against it have advantage; its attacks have disadvantage." },
  { id: 'charmed', name: 'Charmed', text: "Can't attack the charmer or target it with harmful effects. The charmer has advantage on social checks against it." },
  { id: 'deafened', name: 'Deafened', text: "Can't hear; automatically fails checks that need hearing." },
  { id: 'exhaustion', name: 'Exhaustion', text: 'Each level: d20 tests take a −2 penalty per level and speed drops 5 feet per level. Level 6 is death. A long rest removes one level.' },
  { id: 'frightened', name: 'Frightened', text: "Disadvantage on ability checks and attacks while the source of fear is in sight; can't willingly move closer to it." },
  { id: 'grappled', name: 'Grappled', text: 'Speed 0. Disadvantage on attacks against anyone but the grappler. The grappler can drag it (extra movement cost).' },
  { id: 'incapacitated', name: 'Incapacitated', text: "Can't take actions, bonus actions or reactions; concentration breaks; can't speak; disadvantage on initiative." },
  { id: 'invisible', name: 'Invisible', text: "Can't be seen; attacks against it have disadvantage and its attacks have advantage (unless the other creature can see it)." },
  { id: 'paralyzed', name: 'Paralyzed', text: 'Incapacitated, speed 0, fails Str and Dex saves. Attacks against it have advantage; hits from within 5 feet are critical hits.' },
  { id: 'petrified', name: 'Petrified', text: 'Turned to stone: incapacitated, speed 0, fails Str and Dex saves, resistance to all damage, immune to poison.' },
  { id: 'poisoned', name: 'Poisoned', text: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone', name: 'Prone', text: 'Can only crawl or spend half its speed to stand. Disadvantage on attacks. Attacks within 5 feet have advantage against it; farther attacks have disadvantage.' },
  { id: 'restrained', name: 'Restrained', text: 'Speed 0. Attacks against it have advantage; its attacks have disadvantage; disadvantage on Dex saves.' },
  { id: 'stunned', name: 'Stunned', text: 'Incapacitated, fails Str and Dex saves. Attacks against it have advantage.' },
  { id: 'unconscious', name: 'Unconscious', text: 'Incapacitated, prone, drops what it holds, fails Str and Dex saves. Attacks against it have advantage; hits from within 5 feet are critical hits.' },
];
export const conditionName = (id: string) => CONDITIONS.find((c) => c.id === id)?.name ?? id;

export const DAMAGE_TYPES = [
  'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder',
];

export const ATTRIBUTION = [
  'This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
];
