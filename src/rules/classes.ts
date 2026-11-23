// The 12 classes of SRD 5.2.1 (CC-BY-4.0), levels 1-20, each with its SRD subclass. Feature text is summarized in our own words.
import type { Ability, Skill } from './core';
import { ALL_SKILLS } from './core';

export interface Feature { level: number; name: string; text: string; subclass?: boolean; }
export interface Resource {
  id: string;
  name: string;
  max: (level: number, abilityMod: (a: Ability) => number) => number;
  reset: 'short' | 'long';
  /** From this level on, the resource comes back on a short rest too. */
  shortFrom?: number;
}
export type CasterType = 'none' | 'full' | 'half' | 'pact';

export interface ClassDef {
  id: string;
  name: string;
  hitDie: number;
  primary: Ability[];
  saves: [Ability, Ability];
  skillCount: number;
  skillFrom: Skill[];
  armor: string; // proficiency summary
  heavyArmor: boolean;
  mediumArmor: boolean;
  shields: boolean;
  martialWeapons: boolean;
  playsLike: string;
  difficulty: 'Easy' | 'Medium' | 'Harder';
  subclass: string;
  subclassBlurb: string;
  caster: CasterType;
  spellAbility?: Ability;
  cantrips?: number[]; // by level 1..20
  prepared?: number[]; // by level 1..20
  unarmored?: Ability; // adds this ability to 10 + Dex when unarmored
  /** Levels that give an Ability Score Improvement (or a feat). Level 19 always gives an Epic Boon. */
  asiLevels: number[];
  /** Gets a Fighting Style feat (fighter at 1, paladin and ranger at 2). */
  fightingStyleAt?: number;
  kit: { armor?: string; shield?: boolean; weapons: string[]; gear: string[] };
  features: Feature[];
  resources: Resource[];
  standardArray: Ability[]; // priority order for the standard array
}

export const MAX_LEVEL = 20;
export const clampLevel = (l: number) => Math.min(MAX_LEVEL, Math.max(1, Math.floor(l) || 1));
/** Pick from a 20-long table by character level. */
export const at = (lvl: number, table: number[]) => table[Math.min(table.length, clampLevel(lvl)) - 1];
/** Build a 20-long table from "from this level on" steps: steps({1: 2, 4: 3}) */
export function steps(s: Record<number, number>): number[] {
  const out: number[] = [];
  let v = 0;
  for (let l = 1; l <= 20; l++) {
    if (s[l] !== undefined) v = s[l];
    out.push(v);
  }
  return out;
}

const ASI = (lvls: number[]): Feature[] => lvls.map((level) => ({ level, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat you qualify for.' }));
const BOON: Feature = { level: 19, name: 'Epic Boon', text: 'Gain an Epic Boon feat (or another feat you qualify for). Epic Boons also raise one ability by 1, up to 30.' };
const sub = (level: number, name: string, text: string): Feature => ({ level, name, text, subclass: true });
const STD_ASI = [4, 8, 12, 16];

const CASTER_CANTRIPS_2 = steps({ 1: 2, 4: 3, 10: 4 });
const CASTER_CANTRIPS_3 = steps({ 1: 3, 4: 4, 10: 5 });
const FULL_PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const HALF_PREPARED = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];

export const CLASSES: ClassDef[] = [
  {
    id: 'barbarian', name: 'Barbarian', hitDie: 12, primary: ['str'], saves: ['str', 'con'], skillCount: 2,
    skillFrom: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A furious front-liner who shrugs off hits and swings hard.', difficulty: 'Easy',
    subclass: 'Path of the Berserker', subclassBlurb: 'Rage turns into a reckless, unstoppable frenzy.', caster: 'none', unarmored: 'con',
    asiLevels: STD_ASI,
    kit: { weapons: ['greataxe', 'handaxe'], gear: ["Explorer's Pack", '4 Handaxes'] },
    standardArray: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    features: [
      { level: 1, name: 'Rage', text: 'Bonus action: resistance to bludgeoning, piercing and slashing damage, bonus damage on Strength attacks (+2, +3 at 9, +4 at 16), advantage on Strength checks and saves. Lasts up to 10 minutes if you keep it going.' },
      { level: 1, name: 'Unarmored Defense', text: 'Without armor, AC = 10 + Dex + Con (a shield still counts).' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons (more at higher levels).' },
      { level: 2, name: 'Danger Sense', text: "Advantage on Dex saves unless you're incapacitated." },
      { level: 2, name: 'Reckless Attack', text: 'On your first attack of the turn, gain advantage on Strength attacks this turn; attacks against you have advantage until your next turn.' },
      { level: 3, name: 'Primal Knowledge', text: 'Gain one more skill from the Barbarian list; while raging, some checks can use Strength.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Fast Movement', text: '+10 feet speed while not wearing heavy armor.' },
      { level: 7, name: 'Feral Instinct', text: 'Advantage on initiative rolls.' },
      { level: 7, name: 'Instinctive Pounce', text: 'When you enter a rage, move up to half your speed as part of the bonus action.' },
      { level: 9, name: 'Brutal Strike', text: "Give up advantage on a reckless attack to add 1d10 damage and a rider: push 15 ft, or cut the target's speed by 15 ft." },
      { level: 11, name: 'Relentless Rage', text: 'Drop to 0 HP while raging: make a Con save (DC 10, +5 each time) to stay up with HP equal to twice your level.' },
      { level: 13, name: 'Improved Brutal Strike', text: 'New Brutal Strike riders: stagger the target (disadvantage on its next save) or sunder it (the next ally to hit gets +5).' },
      { level: 15, name: 'Persistent Rage', text: 'Regain all rages when you roll initiative (once per long rest); rage lasts 10 minutes without upkeep.' },
      { level: 17, name: 'Improved Brutal Strike', text: 'Brutal Strike deals 2d10 and you can apply two riders.' },
      { level: 18, name: 'Indomitable Might', text: 'If a Strength check or save totals less than your Strength score, use the score instead.' },
      { level: 20, name: 'Primal Champion', text: 'Strength and Constitution each rise by 4, to a maximum of 25.' },
      sub(3, 'Frenzy', 'While raging and attacking recklessly, your first Strength hit each turn deals extra damage: a d6 per point of your Rage Damage bonus.'),
      sub(6, 'Mindless Rage', "While raging you can't be charmed or frightened, and those effects end when you rage."),
      sub(10, 'Retaliation', 'Reaction: when a creature within 5 ft damages you, make one melee attack against it.'),
      sub(14, 'Intimidating Presence', 'Bonus action: creatures of your choice in a 30-ft emanation make a Wis save or are frightened for 1 minute (once per long rest, or spend a rage).'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'rage', name: 'Rage', max: (l) => at(l, steps({ 1: 2, 3: 3, 6: 4, 12: 5, 17: 6 })), reset: 'long' }],
  },
  {
    id: 'bard', name: 'Bard', hitDie: 8, primary: ['cha'], saves: ['dex', 'cha'], skillCount: 3, skillFrom: ALL_SKILLS,
    armor: 'Light', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A charming spellcaster who inspires friends and knows a bit of everything.', difficulty: 'Medium',
    subclass: 'College of Lore', subclassBlurb: 'A collector of secrets who cuts foes down with words.', caster: 'full', spellAbility: 'cha',
    cantrips: CASTER_CANTRIPS_2, prepared: FULL_PREPARED, asiLevels: STD_ASI,
    kit: { armor: 'leather', weapons: ['dagger', 'rapier'], gear: ["Entertainer's Pack", 'Musical Instrument'] },
    standardArray: ['cha', 'dex', 'con', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Bardic Inspiration', text: 'Bonus action: give a creature within 60 feet an inspiration die to add to a failed d20 test. d6, d8 at 5, d10 at 10, d12 at 15.' },
      { level: 1, name: 'Spellcasting', text: 'Cast bard spells using Charisma.' },
      { level: 2, name: 'Expertise', text: 'Double proficiency on two skills you are proficient in.' },
      { level: 2, name: 'Jack of All Trades', text: "Add half your proficiency bonus to ability checks that don't already use it." },
      { level: 5, name: 'Font of Inspiration', text: 'Bardic Inspiration comes back on a short or long rest; you can also spend a spell slot to regain a use.' },
      { level: 7, name: 'Countercharm', text: 'Reaction: when you or an ally within 30 ft fails a save against charm or fear, reroll it with advantage.' },
      { level: 9, name: 'Expertise', text: 'Two more skills get Expertise.' },
      { level: 10, name: 'Magical Secrets', text: 'You can prepare spells from the cleric, druid and wizard lists as well as your own.' },
      { level: 18, name: 'Superior Inspiration', text: 'When you roll initiative, regain uses of Bardic Inspiration up to two.' },
      { level: 20, name: 'Words of Creation', text: 'Power Word Heal and Power Word Kill are always prepared, and each can target a second creature within 10 ft of the first.' },
      sub(3, 'Bonus Proficiencies', 'Gain proficiency in three skills of your choice.'),
      sub(3, 'Cutting Words', "Reaction: spend an inspiration die to subtract it from an enemy's attack, check or damage roll."),
      sub(6, 'Magical Discoveries', 'Learn two spells from the cleric, druid or wizard lists; they are always prepared.'),
      sub(14, 'Peerless Skill', 'When you fail an ability check or attack, spend an inspiration die and add it; the die is not used up if you still fail.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'inspiration', name: 'Bardic Inspiration', max: (_l, m) => Math.max(1, m('cha')), reset: 'long', shortFrom: 5 }],
  },
  {
    id: 'cleric', name: 'Cleric', hitDie: 8, primary: ['wis'], saves: ['wis', 'cha'], skillCount: 2,
    skillFrom: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: false,
    playsLike: 'A divine healer who can also bring the hammer down.', difficulty: 'Medium',
    subclass: 'Life Domain', subclassBlurb: 'A devoted healer whose spells restore more.', caster: 'full', spellAbility: 'wis',
    cantrips: CASTER_CANTRIPS_3, prepared: FULL_PREPARED, asiLevels: STD_ASI,
    kit: { armor: 'chainShirt', shield: true, weapons: ['mace'], gear: ["Priest's Pack", 'Holy Symbol'] },
    standardArray: ['wis', 'con', 'str', 'dex', 'cha', 'int'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast cleric spells using Wisdom.' },
      { level: 1, name: 'Divine Order', text: 'Choose Protector (martial weapons, heavy armor) or Thaumaturge (extra cantrip, bonus to Arcana/Religion).' },
      { level: 2, name: 'Channel Divinity', text: 'Divine Spark (heal or harm 1d8 + Wis; 2d8 at 7, 3d8 at 13, 4d8 at 18) or Turn Undead. Uses: 2, 3 at 6, 4 at 18; one comes back on a short rest.' },
      { level: 5, name: 'Sear Undead', text: 'When you Turn Undead, deal radiant damage (Wis mod d8s) to undead that fail.' },
      { level: 7, name: 'Blessed Strikes', text: 'Divine Strike (+1d8 on a weapon hit once per turn) or Potent Spellcasting (add Wis to cantrip damage).' },
      { level: 10, name: 'Divine Intervention', text: 'Once per long rest, cast any cleric spell of 5th level or lower without a slot or components.' },
      { level: 14, name: 'Improved Blessed Strikes', text: 'Divine Strike becomes 2d8, or Potent Spellcasting also grants temporary HP when you cast a cantrip.' },
      { level: 20, name: 'Greater Divine Intervention', text: 'Divine Intervention can cast Wish (then not again for 2d4 long rests).' },
      sub(3, 'Disciple of Life', 'Healing spells restore extra HP equal to 2 + the spell slot level.'),
      sub(3, 'Life Domain Spells', 'Always prepared: Aid, Bless, Cure Wounds, Lesser Restoration; later Mass Healing Word, Revivify, Aura of Life, Death Ward, Greater Restoration, Mass Cure Wounds.'),
      sub(3, 'Preserve Life', 'Channel Divinity: restore HP equal to 5 × your level, split among creatures within 30 ft (up to half their max).'),
      sub(6, 'Blessed Healer', 'When you heal someone else with a spell, you regain 2 + the slot level HP.'),
      sub(17, 'Supreme Healing', 'Healing dice from your spells and Channel Divinity always roll their maximum.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [
      { id: 'channel', name: 'Channel Divinity', max: (l) => at(l, steps({ 2: 2, 6: 3, 18: 4 })), reset: 'long' },
      { id: 'intervention', name: 'Divine Intervention', max: (l) => (l >= 10 ? 1 : 0), reset: 'long' },
    ],
  },
  {
    id: 'druid', name: 'Druid', hitDie: 8, primary: ['wis'], saves: ['int', 'wis'], skillCount: 2,
    skillFrom: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    armor: 'Light, shields', heavyArmor: false, mediumArmor: false, shields: true, martialWeapons: false,
    playsLike: 'A nature caster who heals, controls the field and turns into beasts.', difficulty: 'Harder',
    subclass: 'Circle of the Land', subclassBlurb: 'A keeper of one land whose magic shifts with it.', caster: 'full', spellAbility: 'wis',
    cantrips: CASTER_CANTRIPS_2, prepared: FULL_PREPARED, asiLevels: STD_ASI,
    kit: { armor: 'leather', shield: true, weapons: ['sickle', 'quarterstaff'], gear: ["Explorer's Pack", 'Druidic Focus', 'Herbalism Kit'] },
    standardArray: ['wis', 'con', 'dex', 'int', 'cha', 'str'],
    features: [
      { level: 1, name: 'Druidic', text: 'You know the secret language of druids.' },
      { level: 1, name: 'Spellcasting', text: 'Cast druid spells using Wisdom.' },
      { level: 1, name: 'Primal Order', text: 'Choose Magician (extra cantrip, bonus to Arcana/Nature) or Warden (martial weapons, medium armor).' },
      { level: 2, name: 'Wild Shape', text: 'Bonus action: transform into a beast you know (CR 1/4 at 2, 1/2 at 4, 1 at 8). Uses: 2, 3 at 6, 4 at 17; one comes back on a short rest.' },
      { level: 2, name: 'Wild Companion', text: 'Spend a Wild Shape use or a spell slot to cast Find Familiar without material components.' },
      { level: 5, name: 'Wild Resurgence', text: 'Trade spell slots and Wild Shape uses for each other once per long rest.' },
      { level: 7, name: 'Elemental Fury', text: 'Potent Spellcasting (add Wis to cantrip damage) or Primal Strike (+1d8 elemental damage on a weapon or beast hit once per turn).' },
      { level: 15, name: 'Improved Elemental Fury', text: 'Cantrip range grows by 300 ft, or Primal Strike becomes 2d8.' },
      { level: 18, name: 'Beast Spells', text: 'Cast spells while in Wild Shape.' },
      { level: 20, name: 'Archdruid', text: 'Regain a Wild Shape use when you roll initiative with none left; turn Wild Shape uses into spell slots; you age slowly.' },
      sub(3, 'Circle of the Land Spells', 'Pick arid, polar, temperate or tropical land at each long rest; its spells are always prepared and grow with your level.'),
      sub(3, "Land's Aid", 'Spend a Wild Shape use: a 10-ft sphere within 60 ft deals 2d6 necrotic (Con save) and heals one creature 2d6. Grows to 3d6 at 10, 4d6 at 14.'),
      sub(6, 'Natural Recovery', 'Once per long rest, cast a circle spell without a slot, and recover spell slots after a short rest.'),
      sub(10, "Nature's Ward", 'Immune to poisoned, and resistance to a damage type set by your land.'),
      sub(14, "Nature's Sanctuary", "Spend a Wild Shape use: a 15-ft cube of spectral trees gives allies half cover and your Nature's Ward resistance."),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'wildshape', name: 'Wild Shape', max: (l) => at(l, steps({ 2: 2, 6: 3, 17: 4 })), reset: 'long' }],
  },
  {
    id: 'fighter', name: 'Fighter', hitDie: 10, primary: ['str', 'dex'], saves: ['str', 'con'], skillCount: 2,
    skillFrom: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'persuasion', 'perception', 'survival'],
    armor: 'All armor, shields', heavyArmor: true, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A weapons expert in heavy armor. Straightforward and tough.', difficulty: 'Easy',
    subclass: 'Champion', subclassBlurb: 'Raw athletic excellence and wider critical hits.', caster: 'none',
    asiLevels: [4, 6, 8, 12, 14, 16], fightingStyleAt: 1,
    kit: { armor: 'chainMail', weapons: ['greatsword', 'javelin'], gear: ["Dungeoneer's Pack", '8 Javelins'] },
    standardArray: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    features: [
      { level: 1, name: 'Fighting Style', text: 'Gain a Fighting Style feat (Archery, Defense, Great Weapon Fighting or Two-Weapon Fighting).' },
      { level: 1, name: 'Second Wind', text: 'Bonus action: regain 1d10 + fighter level HP.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of three kinds of weapons (more at higher levels).' },
      { level: 2, name: 'Action Surge', text: 'Once per short or long rest, take one extra action on your turn (twice per rest from level 17, once per turn).' },
      { level: 2, name: 'Tactical Mind', text: 'Spend a Second Wind use to add 1d10 to a failed ability check.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Tactical Shift', text: 'When you use Second Wind, move up to half your speed without opportunity attacks.' },
      { level: 9, name: 'Indomitable', text: 'Reroll a failed save with a bonus equal to your fighter level. Once per long rest (twice at 13, three times at 17).' },
      { level: 9, name: 'Tactical Master', text: 'When you attack with a weapon whose mastery you use, swap its mastery for Push, Sap or Slow.' },
      { level: 11, name: 'Two Extra Attacks', text: 'Attack three times when you take the Attack action.' },
      { level: 13, name: 'Studied Attacks', text: 'If you miss a creature, you have advantage on your next attack against it before the end of your next turn.' },
      { level: 20, name: 'Three Extra Attacks', text: 'Attack four times when you take the Attack action.' },
      sub(3, 'Improved Critical', 'Your weapon attacks score a critical hit on a roll of 19 or 20.'),
      sub(3, 'Remarkable Athlete', 'Advantage on initiative and Athletics checks; move half your speed after a critical hit without opportunity attacks.'),
      sub(7, 'Additional Fighting Style', 'Gain another Fighting Style feat.'),
      sub(10, 'Heroic Warrior', 'At the start of each of your turns in combat, gain Heroic Inspiration if you lack it.'),
      sub(15, 'Superior Critical', 'Your weapon attacks score a critical hit on a roll of 18 to 20.'),
      sub(18, 'Survivor', 'Advantage on death saves; while bloodied, regain 5 + Con HP at the start of each turn.'),
      ...ASI([4, 6, 8, 12, 14, 16]), BOON,
    ],
    resources: [
      { id: 'secondwind', name: 'Second Wind', max: (l) => at(l, steps({ 1: 2, 4: 3, 10: 4 })), reset: 'long' },
      { id: 'surge', name: 'Action Surge', max: (l) => at(l, steps({ 2: 1, 17: 2 })), reset: 'short' },
      { id: 'indomitable', name: 'Indomitable', max: (l) => at(l, steps({ 9: 1, 13: 2, 17: 3 })), reset: 'long' },
    ],
  },
  {
    id: 'monk', name: 'Monk', hitDie: 8, primary: ['dex', 'wis'], saves: ['str', 'dex'], skillCount: 2,
    skillFrom: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A fast martial artist who strikes many times a turn.', difficulty: 'Medium',
    subclass: 'Warrior of the Open Hand', subclassBlurb: 'A master of unarmed combat who knocks foes around.', caster: 'none', unarmored: 'wis',
    asiLevels: STD_ASI,
    kit: { weapons: ['spear', 'dagger'], gear: ["Explorer's Pack", '5 Daggers'] },
    standardArray: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    features: [
      { level: 1, name: 'Martial Arts', text: 'Use Dex for unarmed strikes and monk weapons; martial arts die d6 (d8 at 5, d10 at 11, d12 at 17); bonus-action unarmed strike.' },
      { level: 1, name: 'Unarmored Defense', text: 'Without armor or shield, AC = 10 + Dex + Wis.' },
      { level: 2, name: "Monk's Focus", text: 'Focus points equal to your level: Flurry of Blows, Patient Defense, Step of the Wind.' },
      { level: 2, name: 'Unarmored Movement', text: 'Extra speed without armor or shield: +10 ft, rising to +30 ft by level 18.' },
      { level: 2, name: 'Uncanny Metabolism', text: 'When you roll initiative, regain all focus points and heal martial-arts die + level (once per long rest).' },
      { level: 3, name: 'Deflect Attacks', text: 'Reaction: reduce damage from an attack by 1d10 + Dex + level; if it drops to 0, spend 1 focus to redirect it.' },
      { level: 4, name: 'Slow Fall', text: 'Reaction: reduce falling damage by 5 × monk level.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Stunning Strike', text: 'Once per turn on a hit, spend 1 focus: target makes a Con save or is stunned until your next turn.' },
      { level: 6, name: 'Empowered Strikes', text: 'Your unarmed strikes can deal force damage.' },
      { level: 7, name: 'Evasion', text: 'Dex saves for half damage: take none on a success and half on a failure.' },
      { level: 9, name: 'Acrobatic Movement', text: 'Move along vertical surfaces and across liquids on your turn.' },
      { level: 10, name: 'Heightened Focus', text: 'Flurry of Blows makes three strikes; Patient Defense and Step of the Wind get stronger.' },
      { level: 10, name: 'Self-Restoration', text: 'End charmed, frightened or poisoned on yourself at the end of each turn; no exhaustion from skipping food and drink.' },
      { level: 13, name: 'Deflect Energy', text: 'Deflect Attacks works against any damage type.' },
      { level: 14, name: 'Disciplined Survivor', text: 'Proficiency in all saves; spend 1 focus to reroll a failed save.' },
      { level: 15, name: 'Perfect Focus', text: 'When you roll initiative with 3 or fewer focus points, regain up to 4.' },
      { level: 18, name: 'Superior Defense', text: 'Spend 3 focus: resistance to all damage except force for 1 minute.' },
      { level: 20, name: 'Body and Mind', text: 'Dexterity and Wisdom each rise by 4, to a maximum of 25.' },
      sub(3, 'Open Hand Technique', 'Flurry of Blows hits can knock the target prone, push it 15 ft, or deny it reactions.'),
      sub(6, 'Wholeness of Body', 'Bonus action: heal a martial-arts die + Wis. Uses equal to Wis mod per long rest.'),
      sub(11, 'Fleet Step', 'After any other bonus action, you can also use Step of the Wind.'),
      sub(17, 'Quivering Palm', 'Spend 4 focus on a hit to set lethal vibrations; later end them for 10d12 force (Con save for half).'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'focus', name: 'Focus Points', max: (l) => (l >= 2 ? l : 0), reset: 'short' }],
  },
  {
    id: 'paladin', name: 'Paladin', hitDie: 10, primary: ['str', 'cha'], saves: ['wis', 'cha'], skillCount: 2,
    skillFrom: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    armor: 'All armor, shields', heavyArmor: true, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A holy knight who heals with a touch and smites with radiant power.', difficulty: 'Medium',
    subclass: 'Oath of Devotion', subclassBlurb: 'A classic knight of honesty, courage and mercy.', caster: 'half', spellAbility: 'cha',
    prepared: HALF_PREPARED, asiLevels: STD_ASI, fightingStyleAt: 2,
    kit: { armor: 'chainMail', shield: true, weapons: ['longsword', 'javelin'], gear: ["Priest's Pack", 'Holy Symbol', '6 Javelins'] },
    standardArray: ['str', 'cha', 'con', 'wis', 'dex', 'int'],
    features: [
      { level: 1, name: 'Lay On Hands', text: 'A pool of 5 × level HP; bonus action to touch a creature and restore HP (or spend 5 to cure poison).' },
      { level: 1, name: 'Spellcasting', text: 'Cast paladin spells using Charisma.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Fighting Style', text: 'Gain a Fighting Style feat.' },
      { level: 2, name: "Paladin's Smite", text: 'Divine Smite is always prepared and once per long rest you can cast it without a slot.' },
      { level: 3, name: 'Channel Divinity', text: 'Divine Sense, plus your oath option. Uses: 2, 3 at 11; one comes back on a short rest.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Faithful Steed', text: 'Find Steed is always prepared; cast it once per long rest without a slot.' },
      { level: 6, name: 'Aura of Protection', text: 'You and allies within 10 ft add your Cha mod to saves (min +1) while you are conscious.' },
      { level: 9, name: 'Abjure Foes', text: 'Channel Divinity: frighten up to Cha-mod creatures within 60 ft (Wis save) for 1 minute.' },
      { level: 10, name: 'Aura of Courage', text: "You and allies in your aura can't be frightened." },
      { level: 11, name: 'Radiant Strikes', text: 'Your melee weapon and unarmed hits deal an extra 1d8 radiant damage.' },
      { level: 14, name: 'Restoring Touch', text: 'Lay On Hands can also end blinded, charmed, deafened, frightened, paralyzed or stunned (5 HP from the pool each).' },
      { level: 18, name: 'Aura Expansion', text: 'Your auras reach 30 ft.' },
      sub(3, 'Sacred Weapon', 'Channel Divinity: for 10 minutes add Cha to attack rolls with a weapon, which sheds light and can deal radiant damage.'),
      sub(3, 'Oath of Devotion Spells', 'Always prepared: Protection from Evil and Good, Shield of Faith, Aid, Zone of Truth, Beacon of Hope, Dispel Magic, Freedom of Movement, Guardian of Faith, Commune, Flame Strike.'),
      sub(7, 'Aura of Devotion', "You and allies in your aura can't be charmed."),
      sub(15, 'Smite of Protection', 'When you cast Divine Smite, you and allies in your aura have half cover until your next turn.'),
      sub(20, 'Holy Nimbus', 'Bonus action, once per long rest: for 10 minutes your aura deals radiant damage to enemies and gives you advantage on saves against fiends and undead.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [
      { id: 'layonhands', name: 'Lay On Hands (HP)', max: (l) => 5 * l, reset: 'long' },
      { id: 'channel', name: 'Channel Divinity', max: (l) => at(l, steps({ 3: 2, 11: 3 })), reset: 'long' },
      { id: 'freesmite', name: 'Free Divine Smite', max: (l) => (l >= 2 ? 1 : 0), reset: 'long' },
    ],
  },
  {
    id: 'ranger', name: 'Ranger', hitDie: 10, primary: ['dex', 'wis'], saves: ['str', 'dex'], skillCount: 3,
    skillFrom: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A wilderness hunter with a bow and a little nature magic.', difficulty: 'Medium',
    subclass: 'Hunter', subclassBlurb: 'A monster-slayer who picks how to bring big prey down.', caster: 'half', spellAbility: 'wis',
    prepared: HALF_PREPARED, asiLevels: STD_ASI, fightingStyleAt: 2,
    kit: { armor: 'studded', weapons: ['longbow', 'scimitar', 'shortsword'], gear: ["Explorer's Pack", 'Quiver of 20 Arrows'] },
    standardArray: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast ranger spells using Wisdom.' },
      { level: 1, name: 'Favored Enemy', text: "Hunter's Mark is always prepared; cast it without a slot a few times per long rest (2, rising to 6)." },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Deft Explorer', text: 'Expertise in one skill and two extra languages.' },
      { level: 2, name: 'Fighting Style', text: 'Gain a Fighting Style feat.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 6, name: 'Roving', text: '+10 ft speed without heavy armor; climb and swim speeds equal to your speed.' },
      { level: 9, name: 'Expertise', text: 'Two more skills get Expertise.' },
      { level: 10, name: 'Tireless', text: 'Magic action: gain 1d8 + Wis temporary HP (Wis-mod times per long rest); short rests remove a level of exhaustion.' },
      { level: 13, name: 'Relentless Hunter', text: "Taking damage can't break your concentration on Hunter's Mark." },
      { level: 14, name: "Nature's Veil", text: 'Bonus action: become invisible until the end of your next turn (Wis-mod times per long rest).' },
      { level: 17, name: 'Precise Hunter', text: "Advantage on attacks against the creature marked by your Hunter's Mark." },
      { level: 18, name: 'Feral Senses', text: 'Blindsight 30 ft.' },
      { level: 20, name: 'Foe Slayer', text: "Hunter's Mark damage becomes a d10." },
      sub(3, "Hunter's Lore", "While a creature is marked by your Hunter's Mark, you know its immunities, resistances and vulnerabilities."),
      sub(3, "Hunter's Prey", 'Colossus Slayer (+1d8 once per turn vs. a wounded target) or Horde Breaker (an extra attack on a creature next to your target).'),
      sub(7, 'Defensive Tactics', 'Escape the Horde (opportunity attacks against you have disadvantage) or Multiattack Defense (an attacker that hits you has disadvantage on its other attacks this turn).'),
      sub(11, "Superior Hunter's Prey", "Once per turn, Hunter's Mark damage also hits a second creature within 30 ft of the first."),
      sub(15, "Superior Hunter's Defense", 'Reaction when you take damage: resistance to that damage type until the end of the turn.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'favored', name: "Free Hunter's Mark", max: (l) => at(l, steps({ 1: 2, 5: 3, 9: 4, 13: 5, 17: 6 })), reset: 'long' }],
  },
  {
    id: 'rogue', name: 'Rogue', hitDie: 8, primary: ['dex'], saves: ['dex', 'int'], skillCount: 4,
    skillFrom: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleightOfHand', 'stealth'],
    armor: 'Light', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A sneaky expert who lands big Sneak Attack hits.', difficulty: 'Easy',
    subclass: 'Thief', subclassBlurb: 'A nimble burglar who can use any item.', caster: 'none',
    asiLevels: [4, 8, 10, 12, 16],
    kit: { armor: 'leather', weapons: ['shortsword', 'dagger', 'shortbow'], gear: ["Burglar's Pack", "Thieves' Tools"] },
    standardArray: ['dex', 'con', 'wis', 'int', 'cha', 'str'],
    features: [
      { level: 1, name: 'Expertise', text: 'Double proficiency on two skills you are proficient in.' },
      { level: 1, name: 'Sneak Attack', text: 'Once per turn, extra d6s of damage (1d6, +1d6 every odd level, 10d6 at 19) with a finesse or ranged weapon when you have advantage or an ally is next to the target.' },
      { level: 1, name: "Thieves' Cant", text: 'Secret rogue language.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Cunning Action', text: 'Bonus action: Dash, Disengage or Hide.' },
      { level: 3, name: 'Steady Aim', text: "Bonus action: advantage on your next attack if you haven't moved this turn." },
      { level: 5, name: 'Cunning Strike', text: 'Trade Sneak Attack dice for effects: poison, trip, or withdraw.' },
      { level: 5, name: 'Uncanny Dodge', text: "Reaction: halve an attack's damage against you." },
      { level: 6, name: 'Expertise', text: 'Two more skills get Expertise.' },
      { level: 7, name: 'Evasion', text: 'Dex saves for half damage: take none on a success and half on a failure.' },
      { level: 7, name: 'Reliable Talent', text: 'Any ability check roll of 9 or lower counts as a 10 for skills you are proficient in.' },
      { level: 11, name: 'Improved Cunning Strike', text: 'Use up to two Cunning Strike effects on one Sneak Attack.' },
      { level: 14, name: 'Devious Strikes', text: 'New Cunning Strike effects: daze, knock out, obscure.' },
      { level: 15, name: 'Slippery Mind', text: 'Proficiency in Wisdom and Charisma saves.' },
      { level: 18, name: 'Elusive', text: "No attack roll has advantage against you unless you're incapacitated." },
      { level: 20, name: 'Stroke of Luck', text: 'Once per short or long rest, turn a failed d20 test into a 20.' },
      sub(3, 'Fast Hands', "Bonus action: Sleight of Hand, use thieves' tools, or use an object."),
      sub(3, 'Second-Story Work', 'Climb speed equal to your speed; jump farther using Dexterity.'),
      sub(9, 'Supreme Sneak', 'New Cunning Strike option: Stealth Attack, so attacking does not end your Hide.'),
      sub(13, 'Use Magic Device', 'Attune to four items, use any magic item, and use scrolls (charges may not be spent).'),
      sub(17, "Thief's Reflexes", 'Take two turns in the first round of combat (the second at initiative minus 10).'),
      ...ASI([4, 8, 10, 12, 16]), BOON,
    ],
    resources: [{ id: 'luck', name: 'Stroke of Luck', max: (l) => (l >= 20 ? 1 : 0), reset: 'short' }],
  },
  {
    id: 'sorcerer', name: 'Sorcerer', hitDie: 6, primary: ['cha'], saves: ['con', 'cha'], skillCount: 2,
    skillFrom: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'An innate spellcaster who bends spells with metamagic.', difficulty: 'Medium',
    subclass: 'Draconic Sorcery', subclassBlurb: 'Dragon blood: tough scales, elemental power, and later wings.', caster: 'full', spellAbility: 'cha',
    cantrips: steps({ 1: 4, 4: 5, 10: 6 }), prepared: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22], asiLevels: STD_ASI,
    kit: { weapons: ['spear', 'dagger'], gear: ["Dungeoneer's Pack", 'Arcane Focus (crystal)'] },
    standardArray: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast sorcerer spells using Charisma.' },
      { level: 1, name: 'Innate Sorcery', text: 'Bonus action, twice per long rest: for 1 minute, +1 spell save DC and advantage on sorcerer spell attacks.' },
      { level: 2, name: 'Font of Magic', text: 'Sorcery points equal to your level; convert between points and spell slots.' },
      { level: 2, name: 'Metamagic', text: 'Choose two options (e.g. Quickened, Twinned) to alter spells with sorcery points. Two more at 10 and 17.' },
      { level: 5, name: 'Sorcerous Restoration', text: 'On a short rest, regain sorcery points up to half your level (once per long rest).' },
      { level: 7, name: 'Sorcery Incarnate', text: 'Spend 2 sorcery points to use Innate Sorcery with no uses left; while it is active, use two Metamagic options on a spell.' },
      { level: 20, name: 'Arcane Apotheosis', text: 'While Innate Sorcery is active, one Metamagic option per turn costs no sorcery points.' },
      sub(3, 'Draconic Resilience', 'HP max +3, and +1 per later sorcerer level; unarmored AC = 10 + Dex + Cha.'),
      sub(3, 'Draconic Spells', "Always prepared: Alter Self, Chromatic Orb, Command, Dragon's Breath, then Fear, Fly, Arcane Eye, Charm Monster, Legend Lore, Summon Dragon."),
      sub(6, 'Elemental Affinity', 'Pick acid, cold, fire, lightning or poison: resistance to it and add Cha to damage of that type.'),
      sub(14, 'Dragon Wings', 'Bonus action: sprout wings for 1 hour, flying speed 60 ft (once per long rest, or 3 sorcery points).'),
      sub(18, 'Dragon Companion', 'Cast Summon Dragon without material components, once per long rest without a slot, lasting 1 minute without concentration.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [
      { id: 'innate', name: 'Innate Sorcery', max: () => 2, reset: 'long' },
      { id: 'sorcery', name: 'Sorcery Points', max: (l) => (l >= 2 ? l : 0), reset: 'long' },
    ],
  },
  {
    id: 'warlock', name: 'Warlock', hitDie: 8, primary: ['cha'], saves: ['wis', 'cha'], skillCount: 2,
    skillFrom: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    armor: 'Light', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A caster bound to a patron, with few but powerful spell slots.', difficulty: 'Medium',
    subclass: 'Fiend Patron', subclassBlurb: 'A pact with a fiend: fire, toughness and dark luck.', caster: 'pact', spellAbility: 'cha',
    cantrips: CASTER_CANTRIPS_2, prepared: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], asiLevels: STD_ASI,
    kit: { armor: 'leather', weapons: ['sickle', 'dagger'], gear: ["Scholar's Pack", 'Arcane Focus (orb)'] },
    standardArray: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Eldritch Invocations', text: 'Choose invocations such as Pact of the Blade or Agonizing Blast. You know 1, rising to 10 by level 18.' },
      { level: 1, name: 'Pact Magic', text: 'Few spell slots, all cast at your highest slot level (up to 5th), recovered on a short rest.' },
      { level: 2, name: 'Magical Cunning', text: 'Once per long rest, spend 1 minute to regain half your pact slots.' },
      { level: 9, name: 'Contact Patron', text: 'Contact Other Plane is always prepared; once per long rest cast it without a slot and succeed on the save.' },
      { level: 11, name: 'Mystic Arcanum (6th)', text: 'Pick a 6th-level warlock spell; cast it once per long rest without a slot.' },
      { level: 13, name: 'Mystic Arcanum (7th)', text: 'Pick a 7th-level warlock spell; cast it once per long rest without a slot.' },
      { level: 15, name: 'Mystic Arcanum (8th)', text: 'Pick an 8th-level warlock spell; cast it once per long rest without a slot.' },
      { level: 17, name: 'Mystic Arcanum (9th)', text: 'Pick a 9th-level warlock spell; cast it once per long rest without a slot.' },
      { level: 20, name: 'Eldritch Master', text: 'Magical Cunning restores all your pact slots.' },
      sub(3, "Dark One's Blessing", 'When an enemy near you drops to 0 HP, gain temporary HP equal to Cha mod + warlock level.'),
      sub(3, 'Fiend Spells', 'Always prepared: Burning Hands, Command, Scorching Ray, Suggestion, Fireball, Stinking Cloud, Fire Shield, Wall of Fire, Geas, Insect Plague.'),
      sub(6, "Dark One's Own Luck", 'Add 1d10 to an ability check or save after seeing the roll (Cha-mod times per long rest).'),
      sub(10, 'Fiendish Resilience', 'After a rest, pick a damage type (not force) to resist.'),
      sub(14, 'Hurl Through Hell', 'Once per long rest, when you hit, send the target through the lower planes: 8d10 psychic and incapacitated (Cha save to avoid).'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [
      { id: 'cunning', name: 'Magical Cunning', max: (l) => (l >= 2 ? 1 : 0), reset: 'long' },
      { id: 'arcanum6', name: 'Mystic Arcanum (6th)', max: (l) => (l >= 11 ? 1 : 0), reset: 'long' },
      { id: 'arcanum7', name: 'Mystic Arcanum (7th)', max: (l) => (l >= 13 ? 1 : 0), reset: 'long' },
      { id: 'arcanum8', name: 'Mystic Arcanum (8th)', max: (l) => (l >= 15 ? 1 : 0), reset: 'long' },
      { id: 'arcanum9', name: 'Mystic Arcanum (9th)', max: (l) => (l >= 17 ? 1 : 0), reset: 'long' },
    ],
  },
  {
    id: 'wizard', name: 'Wizard', hitDie: 6, primary: ['int'], saves: ['int', 'wis'], skillCount: 2,
    skillFrom: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A studious caster with the biggest spell list. Fragile but versatile.', difficulty: 'Harder',
    subclass: 'Evoker', subclassBlurb: 'A blaster who shapes explosions around friends.', caster: 'full', spellAbility: 'int',
    cantrips: CASTER_CANTRIPS_3, prepared: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25], asiLevels: STD_ASI,
    kit: { weapons: ['quarterstaff', 'dagger'], gear: ["Scholar's Pack", 'Spellbook', 'Arcane Focus (staff)'] },
    standardArray: ['int', 'con', 'dex', 'wis', 'cha', 'str'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast wizard spells from your spellbook using Intelligence.' },
      { level: 1, name: 'Ritual Adept', text: 'Cast any ritual spell in your spellbook as a ritual without preparing it.' },
      { level: 1, name: 'Arcane Recovery', text: 'Once per day after a short rest, recover spell slots totaling up to half your level (rounded up), none above 5th.' },
      { level: 2, name: 'Scholar', text: 'Expertise in one of Arcana, History, Investigation, Medicine, Nature or Religion.' },
      { level: 5, name: 'Memorize Spell', text: 'On a short rest, swap one prepared spell for another in your spellbook.' },
      { level: 18, name: 'Spell Mastery', text: 'Pick a 1st- and a 2nd-level spell; cast them at their lowest level without a slot.' },
      { level: 20, name: 'Signature Spells', text: 'Pick two 3rd-level spells; they are always prepared and each can be cast once per short rest without a slot.' },
      sub(3, 'Evocation Savant', 'Add two evocation spells to your spellbook for free, and one more each time you gain a spell level.'),
      sub(3, 'Potent Cantrip', 'Your damaging cantrips deal half damage on a miss or successful save.'),
      sub(6, 'Sculpt Spells', "Pick creatures in your evocation spells' area: they automatically succeed on the save and take no damage."),
      sub(10, 'Empowered Evocation', 'Add Int to one damage roll of your wizard evocation spells.'),
      sub(14, 'Overchannel', 'Deal maximum damage with a 1st- to 5th-level wizard spell; using it again before a long rest hurts you.'),
      ...ASI(STD_ASI), BOON,
    ],
    resources: [{ id: 'recovery', name: 'Arcane Recovery', max: () => 1, reset: 'long' }],
  },
];
export const classById = (id: string) => CLASSES.find((c) => c.id === id) ?? CLASSES[4];

// Spell slots by character level 1..20
const FULL: number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];
const HALF: number[][] = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
];
const PACT_SLOTS = steps({ 1: 1, 2: 2, 11: 3, 17: 4 });
const PACT_LEVEL = steps({ 1: 1, 3: 2, 5: 3, 7: 4, 9: 5 });
export const pactSlotLevel = (level: number) => at(level, PACT_LEVEL);

export function spellSlots(cls: ClassDef, level: number): number[] {
  const i = clampLevel(level) - 1;
  if (cls.caster === 'full') return FULL[i];
  if (cls.caster === 'half') return HALF[i];
  if (cls.caster === 'pact') {
    const lvl = PACT_LEVEL[i];
    const arr = new Array<number>(lvl).fill(0);
    arr[lvl - 1] = PACT_SLOTS[i];
    return arr;
  }
  return [];
}
/** Highest level of spell slot the character has. */
export const maxSpellLevel = (cls: ClassDef, level: number) => {
  const s = spellSlots(cls, level);
  for (let i = s.length - 1; i >= 0; i--) if (s[i] > 0) return i + 1;
  return 0;
};
/** Highest spell level the character can learn: their slots, plus a warlock's Mystic Arcanum. */
export const learnableSpellLevel = (cls: ClassDef, level: number) => {
  if (cls.caster === 'pact') return level >= 17 ? 9 : level >= 15 ? 8 : level >= 13 ? 7 : level >= 11 ? 6 : maxSpellLevel(cls, level);
  return maxSpellLevel(cls, level);
};
export const sneakDice = (level: number) => Math.ceil(clampLevel(level) / 2);
export const rageDamage = (level: number) => (level >= 16 ? 4 : level >= 9 ? 3 : 2);
export const martialArtsDie = (level: number) => (level >= 17 ? 12 : level >= 11 ? 10 : level >= 5 ? 8 : 6);
export const unarmoredMovement = (level: number) => (level >= 18 ? 30 : level >= 14 ? 25 : level >= 10 ? 20 : level >= 6 ? 15 : level >= 2 ? 10 : 0);
/** Attacks per Attack action. */
export function attacksPerAction(cls: ClassDef, level: number) {
  if (cls.id === 'fighter') return level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
  return level >= 5 && ['barbarian', 'monk', 'paladin', 'ranger'].includes(cls.id) ? 2 : 1;
}
/** Lowest natural d20 that is a critical hit with weapons. */
export const critRange = (cls: ClassDef, level: number) => (cls.id === 'fighter' ? (level >= 15 ? 18 : level >= 3 ? 19 : 20) : 20);
/** Every level where this class gets an ASI or a feat, plus the level-19 Epic Boon. */
export const featLevels = (cls: ClassDef) => [...cls.asiLevels, 19];
/** How many skills get Expertise at this level. */
export function expertiseCount(cls: ClassDef, level: number) {
  if (cls.id === 'rogue') return level >= 6 ? 4 : 2;
  if (cls.id === 'bard') return (level >= 2 ? 2 : 0) + (level >= 9 ? 2 : 0);
  if (cls.id === 'ranger') return (level >= 2 ? 1 : 0) + (level >= 9 ? 2 : 0);
  if (cls.id === 'wizard') return level >= 2 ? 1 : 0;
  return 0;
}
