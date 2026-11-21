// The 12 classes of SRD 5.2.1 (CC-BY-4.0), levels 1-5. Feature text is summarized.
import type { Ability, Skill } from './core';
import { ALL_SKILLS } from './core';

export interface Feature { level: number; name: string; text: string; }
export interface Resource { id: string; name: string; max: (level: number, abilityMod: (a: Ability) => number) => number; reset: 'short' | 'long'; }
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
  caster: CasterType;
  spellAbility?: Ability;
  cantrips?: number[]; // by level 1..5
  prepared?: number[]; // by level 1..5
  unarmored?: Ability; // adds this ability to 10 + Dex when unarmored
  kit: { armor?: string; shield?: boolean; weapons: string[]; gear: string[] };
  features: Feature[];
  resources: Resource[];
  standardArray: Ability[]; // priority order for the standard array
}

const L = (lvl: number, idx: number[]) => idx[Math.min(5, Math.max(1, lvl)) - 1];

export const CLASSES: ClassDef[] = [
  {
    id: 'barbarian', name: 'Barbarian', hitDie: 12, primary: ['str'], saves: ['str', 'con'], skillCount: 2,
    skillFrom: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A furious front-liner who shrugs off hits and swings hard.', difficulty: 'Easy',
    subclass: 'Path of the Berserker', caster: 'none', unarmored: 'con',
    kit: { weapons: ['greataxe', 'handaxe'], gear: ["Explorer's Pack", '4 Handaxes'] },
    standardArray: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    features: [
      { level: 1, name: 'Rage', text: 'Bonus action: resistance to bludgeoning, piercing and slashing damage, +2 damage on Strength attacks, advantage on Strength checks and saves. Lasts up to 10 minutes.' },
      { level: 1, name: 'Unarmored Defense', text: 'Without armor, AC = 10 + Dex + Con (a shield still counts).' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons you are proficient with.' },
      { level: 2, name: 'Danger Sense', text: "Advantage on Dex saves unless you're incapacitated." },
      { level: 2, name: 'Reckless Attack', text: 'On your first attack of the turn, gain advantage on Strength attacks this turn; attacks against you have advantage until your next turn.' },
      { level: 3, name: 'Path of the Berserker: Frenzy', text: 'While raging and attacking recklessly, your first Strength hit each turn deals extra damage equal to your Rage Damage bonus in d6s.' },
      { level: 3, name: 'Primal Knowledge', text: 'Gain one more skill from the Barbarian list; while raging some checks can use Strength.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Fast Movement', text: '+10 feet speed while not wearing heavy armor.' },
    ],
    resources: [{ id: 'rage', name: 'Rage', max: (l) => L(l, [2, 2, 3, 3, 3]), reset: 'long' }],
  },
  {
    id: 'bard', name: 'Bard', hitDie: 8, primary: ['cha'], saves: ['dex', 'cha'], skillCount: 3, skillFrom: ALL_SKILLS,
    armor: 'Light', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A charming spellcaster who inspires friends and knows a bit of everything.', difficulty: 'Medium',
    subclass: 'College of Lore', caster: 'full', spellAbility: 'cha', cantrips: [2, 2, 2, 3, 3], prepared: [4, 5, 6, 7, 9],
    kit: { armor: 'leather', weapons: ['dagger', 'rapier'], gear: ["Entertainer's Pack", 'Musical Instrument'] },
    standardArray: ['cha', 'dex', 'con', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Bardic Inspiration', text: 'Bonus action: give a creature within 60 feet an inspiration die (d6, d8 at level 5) to add to a failed d20 test.' },
      { level: 1, name: 'Spellcasting', text: 'Cast bard spells using Charisma.' },
      { level: 2, name: 'Expertise', text: 'Double proficiency on two skills you are proficient in.' },
      { level: 2, name: 'Jack of All Trades', text: "Add half your proficiency bonus to ability checks that don't already use it." },
      { level: 3, name: 'College of Lore: Cutting Words', text: 'Reaction: spend an inspiration die to subtract it from an enemy\'s attack, check or damage roll. Also gain three skill proficiencies.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Font of Inspiration', text: 'Bardic Inspiration recovers on a short or long rest; die becomes a d8.' },
    ],
    resources: [{ id: 'inspiration', name: 'Bardic Inspiration', max: (_l, m) => Math.max(1, m('cha')), reset: 'long' }],
  },
  {
    id: 'cleric', name: 'Cleric', hitDie: 8, primary: ['wis'], saves: ['wis', 'cha'], skillCount: 2,
    skillFrom: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: false,
    playsLike: 'A divine healer who can also bring the hammer down.', difficulty: 'Medium',
    subclass: 'Life Domain', caster: 'full', spellAbility: 'wis', cantrips: [3, 3, 3, 4, 4], prepared: [4, 5, 6, 7, 9],
    kit: { armor: 'chainShirt', shield: true, weapons: ['mace'], gear: ["Priest's Pack", 'Holy Symbol'] },
    standardArray: ['wis', 'con', 'str', 'dex', 'cha', 'int'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast cleric spells using Wisdom.' },
      { level: 1, name: 'Divine Order', text: 'Choose Protector (martial weapons, heavy armor) or Thaumaturge (extra cantrip, bonus to Arcana/Religion).' },
      { level: 2, name: 'Channel Divinity', text: 'Twice per long rest (one back on a short rest): Divine Spark (heal or harm 1d8 + Wis) or Turn Undead.' },
      { level: 3, name: 'Life Domain: Disciple of Life', text: 'Healing spells restore extra HP equal to 2 + the spell slot level. Also Preserve Life (Channel Divinity heal of 5 × level split among creatures).' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Sear Undead', text: 'When you Turn Undead, deal radiant damage (Wis mod d8s) to undead that fail.' },
    ],
    resources: [{ id: 'channel', name: 'Channel Divinity', max: (l) => (l >= 2 ? 2 : 0), reset: 'long' }],
  },
  {
    id: 'druid', name: 'Druid', hitDie: 8, primary: ['wis'], saves: ['int', 'wis'], skillCount: 2,
    skillFrom: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    armor: 'Light, shields', heavyArmor: false, mediumArmor: false, shields: true, martialWeapons: false,
    playsLike: 'A nature caster who heals, controls the field and turns into beasts.', difficulty: 'Harder',
    subclass: 'Circle of the Land', caster: 'full', spellAbility: 'wis', cantrips: [2, 2, 2, 3, 3], prepared: [4, 5, 6, 7, 9],
    kit: { armor: 'leather', shield: true, weapons: ['sickle', 'quarterstaff'], gear: ["Explorer's Pack", 'Druidic Focus', "Herbalism Kit"] },
    standardArray: ['wis', 'con', 'dex', 'int', 'cha', 'str'],
    features: [
      { level: 1, name: 'Druidic', text: 'You know the secret language of druids.' },
      { level: 1, name: 'Spellcasting', text: 'Cast druid spells using Wisdom.' },
      { level: 1, name: 'Primal Order', text: 'Choose Magician (extra cantrip, bonus to Arcana/Nature) or Warden (martial weapons, medium armor).' },
      { level: 2, name: 'Wild Shape', text: 'Bonus action: transform into a beast you know (twice per long rest, one back on a short rest).' },
      { level: 2, name: 'Wild Companion', text: 'Spend a Wild Shape use or a spell slot to cast Find Familiar without material components.' },
      { level: 3, name: 'Circle of the Land', text: 'Always have land spells prepared; Land\'s Aid lets you spend Wild Shape to heal and harm in an area.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Wild Resurgence', text: 'Trade spell slots and Wild Shape uses for each other once per long rest.' },
    ],
    resources: [{ id: 'wildshape', name: 'Wild Shape', max: (l) => (l >= 2 ? 2 : 0), reset: 'long' }],
  },
  {
    id: 'fighter', name: 'Fighter', hitDie: 10, primary: ['str', 'dex'], saves: ['str', 'con'], skillCount: 2,
    skillFrom: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'persuasion', 'perception', 'survival'],
    armor: 'All armor, shields', heavyArmor: true, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A weapons expert in heavy armor. Straightforward and tough.', difficulty: 'Easy',
    subclass: 'Champion', caster: 'none',
    kit: { armor: 'chainMail', weapons: ['greatsword', 'javelin'], gear: ["Dungeoneer's Pack", '8 Javelins'] },
    standardArray: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    features: [
      { level: 1, name: 'Fighting Style', text: 'Gain a fighting style feat (e.g. Great Weapon Fighting, Defense, Archery).' },
      { level: 1, name: 'Second Wind', text: 'Bonus action: regain 1d10 + fighter level HP.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of three kinds of weapons.' },
      { level: 2, name: 'Action Surge', text: 'Once per short or long rest, take one extra action on your turn.' },
      { level: 2, name: 'Tactical Mind', text: 'Spend a Second Wind use to add 1d10 to a failed ability check.' },
      { level: 3, name: 'Champion: Improved Critical', text: 'Your weapon attacks score a critical hit on a roll of 19 or 20. Remarkable Athlete: advantage on initiative and Athletics.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Tactical Shift', text: 'When you use Second Wind, move up to half your speed without opportunity attacks.' },
    ],
    resources: [
      { id: 'secondwind', name: 'Second Wind', max: (l) => L(l, [2, 2, 2, 3, 3]), reset: 'long' },
      { id: 'surge', name: 'Action Surge', max: (l) => (l >= 2 ? 1 : 0), reset: 'short' },
    ],
  },
  {
    id: 'monk', name: 'Monk', hitDie: 8, primary: ['dex', 'wis'], saves: ['str', 'dex'], skillCount: 2,
    skillFrom: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A fast martial artist who strikes many times a turn.', difficulty: 'Medium',
    subclass: 'Warrior of the Open Hand', caster: 'none', unarmored: 'wis',
    kit: { weapons: ['spear', 'dagger'], gear: ["Explorer's Pack", '5 Daggers'] },
    standardArray: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    features: [
      { level: 1, name: 'Martial Arts', text: 'Use Dex for unarmed strikes and monk weapons; martial arts die d6 (d8 at level 5); bonus-action unarmed strike.' },
      { level: 1, name: 'Unarmored Defense', text: 'Without armor or shield, AC = 10 + Dex + Wis.' },
      { level: 2, name: "Monk's Focus", text: 'Focus points equal to your level: Flurry of Blows, Patient Defense, Step of the Wind.' },
      { level: 2, name: 'Unarmored Movement', text: '+10 feet speed without armor or shield.' },
      { level: 2, name: 'Uncanny Metabolism', text: 'When you roll initiative, regain all focus points and heal martial-arts die + level (once per long rest).' },
      { level: 3, name: 'Deflect Attacks', text: 'Reaction: reduce damage from a melee or ranged attack by 1d10 + Dex + level.' },
      { level: 3, name: 'Open Hand Technique', text: 'Flurry of Blows hits can topple, push or deny reactions.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 4, name: 'Slow Fall', text: 'Reaction: reduce falling damage by 5 × monk level.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Stunning Strike', text: 'Once per turn on a hit, spend 1 focus: target makes a Con save or is stunned until your next turn.' },
    ],
    resources: [{ id: 'focus', name: 'Focus Points', max: (l) => (l >= 2 ? l : 0), reset: 'short' }],
  },
  {
    id: 'paladin', name: 'Paladin', hitDie: 10, primary: ['str', 'cha'], saves: ['wis', 'cha'], skillCount: 2,
    skillFrom: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    armor: 'All armor, shields', heavyArmor: true, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A holy knight who heals with a touch and smites with radiant power.', difficulty: 'Medium',
    subclass: 'Oath of Devotion', caster: 'half', spellAbility: 'cha', prepared: [2, 3, 4, 5, 6],
    kit: { armor: 'chainMail', shield: true, weapons: ['longsword', 'javelin'], gear: ["Priest's Pack", 'Holy Symbol', '6 Javelins'] },
    standardArray: ['str', 'cha', 'con', 'wis', 'dex', 'int'],
    features: [
      { level: 1, name: 'Lay On Hands', text: 'A pool of 5 × level HP; bonus action to touch a creature and restore HP (or spend 5 to cure poison).' },
      { level: 1, name: 'Spellcasting', text: 'Cast paladin spells using Charisma.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Fighting Style', text: 'Gain a fighting style feat.' },
      { level: 2, name: "Paladin's Smite", text: 'You always have Divine Smite prepared: after a hit, spend a slot for +2d8 radiant (+1d8 per slot level above 1st).' },
      { level: 3, name: 'Channel Divinity / Oath of Devotion', text: 'Divine Sense, and Sacred Weapon: add Cha to attack rolls with a weapon for 10 minutes.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Faithful Steed', text: 'Always have Find Steed prepared; cast it once per long rest without a slot.' },
    ],
    resources: [
      { id: 'layonhands', name: 'Lay On Hands (HP)', max: (l) => 5 * l, reset: 'long' },
      { id: 'channel', name: 'Channel Divinity', max: (l) => (l >= 3 ? 2 : 0), reset: 'long' },
    ],
  },
  {
    id: 'ranger', name: 'Ranger', hitDie: 10, primary: ['dex', 'wis'], saves: ['str', 'dex'], skillCount: 3,
    skillFrom: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    armor: 'Light, medium, shields', heavyArmor: false, mediumArmor: true, shields: true, martialWeapons: true,
    playsLike: 'A wilderness hunter with a bow and a little nature magic.', difficulty: 'Medium',
    subclass: 'Hunter', caster: 'half', spellAbility: 'wis', prepared: [2, 3, 4, 5, 6],
    kit: { armor: 'studded', weapons: ['longbow', 'scimitar', 'shortsword'], gear: ["Explorer's Pack", 'Quiver of 20 Arrows'] },
    standardArray: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast ranger spells using Wisdom.' },
      { level: 1, name: 'Favored Enemy', text: "Always have Hunter's Mark prepared; cast it twice per long rest without a slot." },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Deft Explorer', text: 'Expertise in one skill and two extra languages.' },
      { level: 2, name: 'Fighting Style', text: 'Gain a fighting style feat.' },
      { level: 3, name: "Hunter: Hunter's Prey", text: 'Colossus Slayer (+1d8 once per turn vs. a wounded target) or Horde Breaker (extra attack on an adjacent creature).' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Extra Attack', text: 'Attack twice when you take the Attack action.' },
    ],
    resources: [{ id: 'favored', name: "Free Hunter's Mark", max: () => 2, reset: 'long' }],
  },
  {
    id: 'rogue', name: 'Rogue', hitDie: 8, primary: ['dex'], saves: ['dex', 'int'], skillCount: 4,
    skillFrom: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleightOfHand', 'stealth'],
    armor: 'Light', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A sneaky expert who lands big Sneak Attack hits.', difficulty: 'Easy',
    subclass: 'Thief', caster: 'none',
    kit: { armor: 'leather', weapons: ['shortsword', 'dagger', 'shortbow'], gear: ["Burglar's Pack", "Thieves' Tools"] },
    standardArray: ['dex', 'con', 'wis', 'int', 'cha', 'str'],
    features: [
      { level: 1, name: 'Expertise', text: 'Double proficiency on two skills you are proficient in.' },
      { level: 1, name: 'Sneak Attack', text: 'Once per turn, +1d6 (2d6 at level 3, 3d6 at level 5) damage with a finesse or ranged weapon when you have advantage or an ally is next to the target.' },
      { level: 1, name: "Thieves' Cant", text: 'Secret rogue language.' },
      { level: 1, name: 'Weapon Mastery', text: 'Use the mastery property of two kinds of weapons.' },
      { level: 2, name: 'Cunning Action', text: 'Bonus action: Dash, Disengage or Hide.' },
      { level: 3, name: 'Thief: Fast Hands', text: 'Bonus action: Sleight of Hand, use an object, or use thieves\' tools. Second-Story Work: climb speed, better jumps.' },
      { level: 3, name: 'Steady Aim', text: 'Bonus action: advantage on your next attack if you haven\'t moved this turn.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Cunning Strike', text: 'Trade Sneak Attack dice for effects: poison, trip, or withdraw.' },
      { level: 5, name: 'Uncanny Dodge', text: "Reaction: halve an attack's damage against you." },
    ],
    resources: [],
  },
  {
    id: 'sorcerer', name: 'Sorcerer', hitDie: 6, primary: ['cha'], saves: ['con', 'cha'], skillCount: 2,
    skillFrom: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'An innate spellcaster who bends spells with metamagic.', difficulty: 'Medium',
    subclass: 'Draconic Sorcery', caster: 'full', spellAbility: 'cha', cantrips: [4, 4, 4, 5, 5], prepared: [2, 4, 6, 7, 9],
    kit: { weapons: ['spear', 'dagger'], gear: ["Dungeoneer's Pack", 'Arcane Focus (crystal)'] },
    standardArray: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast sorcerer spells using Charisma.' },
      { level: 1, name: 'Innate Sorcery', text: 'Bonus action, twice per long rest: for 1 minute, +1 spell save DC and advantage on sorcerer spell attacks.' },
      { level: 2, name: 'Font of Magic', text: 'Sorcery points equal to your level; convert between points and spell slots.' },
      { level: 2, name: 'Metamagic', text: 'Choose two options (e.g. Quickened, Twinned) to alter spells with sorcery points.' },
      { level: 3, name: 'Draconic Resilience', text: 'HP max +3 (and +1 per later level); unarmored AC = 10 + Dex + Cha.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Sorcerous Restoration', text: 'On a short rest, regain sorcery points up to half your level (once per long rest).' },
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
    subclass: 'Fiend Patron', caster: 'pact', spellAbility: 'cha', cantrips: [2, 2, 2, 3, 3], prepared: [2, 3, 4, 5, 6],
    kit: { armor: 'leather', weapons: ['sickle', 'dagger'], gear: ["Scholar's Pack", 'Arcane Focus (orb)'] },
    standardArray: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    features: [
      { level: 1, name: 'Eldritch Invocations', text: 'Choose an invocation (e.g. Pact of the Blade, Agonizing Blast at level 2).' },
      { level: 1, name: 'Pact Magic', text: 'Few spell slots, all cast at your highest slot level, recovered on a short rest.' },
      { level: 2, name: 'Magical Cunning', text: 'Once per long rest, spend 1 minute to regain half your pact slots.' },
      { level: 3, name: "Fiend Patron: Dark One's Blessing", text: 'When you reduce an enemy to 0 HP, gain temporary HP equal to Cha mod + warlock level.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'More Invocations', text: 'You know more eldritch invocations.' },
    ],
    resources: [],
  },
  {
    id: 'wizard', name: 'Wizard', hitDie: 6, primary: ['int'], saves: ['int', 'wis'], skillCount: 2,
    skillFrom: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion'],
    armor: 'None', heavyArmor: false, mediumArmor: false, shields: false, martialWeapons: false,
    playsLike: 'A studious caster with the biggest spell list. Fragile but versatile.', difficulty: 'Harder',
    subclass: 'Evoker', caster: 'full', spellAbility: 'int', cantrips: [3, 3, 3, 4, 4], prepared: [4, 5, 6, 7, 9],
    kit: { weapons: ['quarterstaff', 'dagger'], gear: ["Scholar's Pack", 'Spellbook', 'Arcane Focus (staff)'] },
    standardArray: ['int', 'con', 'dex', 'wis', 'cha', 'str'],
    features: [
      { level: 1, name: 'Spellcasting', text: 'Cast wizard spells from your spellbook using Intelligence.' },
      { level: 1, name: 'Ritual Adept', text: 'Cast any ritual spell in your spellbook as a ritual without preparing it.' },
      { level: 1, name: 'Arcane Recovery', text: 'Once per day after a short rest, recover spell slots totaling up to half your level (rounded up).' },
      { level: 2, name: 'Scholar', text: 'Expertise in one of Arcana, History, Investigation, Medicine, Nature or Religion.' },
      { level: 3, name: 'Evoker: Potent Cantrip', text: 'Your damaging cantrips deal half damage on a miss or successful save. Evocation Savant: add evocation spells to your book.' },
      { level: 4, name: 'Ability Score Improvement', text: '+2 to one ability or +1 to two (max 20), or take a feat.' },
      { level: 5, name: 'Memorize Spell', text: 'On a short rest, swap one prepared spell for another in your spellbook.' },
    ],
    resources: [{ id: 'recovery', name: 'Arcane Recovery', max: () => 1, reset: 'long' }],
  },
];
export const classById = (id: string) => CLASSES.find((c) => c.id === id)!;

// Spell slots by character level 1..5
const FULL: number[][] = [[2], [3], [4, 2], [4, 3], [4, 3, 2]];
const HALF: number[][] = [[2], [2], [3], [3], [4, 2]];
const PACT: { slots: number; level: number }[] = [
  { slots: 1, level: 1 }, { slots: 2, level: 1 }, { slots: 2, level: 2 }, { slots: 2, level: 2 }, { slots: 2, level: 3 },
];
export function spellSlots(cls: ClassDef, level: number): number[] {
  const i = Math.min(5, Math.max(1, level)) - 1;
  if (cls.caster === 'full') return FULL[i];
  if (cls.caster === 'half') return HALF[i];
  if (cls.caster === 'pact') {
    const p = PACT[i];
    const arr = [0, 0, 0];
    arr[p.level - 1] = p.slots;
    return arr.slice(0, p.level);
  }
  return [];
}
export const maxSpellLevel = (cls: ClassDef, level: number) => {
  const s = spellSlots(cls, level);
  for (let i = s.length - 1; i >= 0; i--) if (s[i] > 0) return i + 1;
  return 0;
};
export const sneakDice = (level: number) => Math.ceil(level / 2);
export const rageDamage = (level: number) => (level >= 9 ? 3 : 2);
export const martialArtsDie = (level: number) => (level >= 5 ? 8 : 6);
