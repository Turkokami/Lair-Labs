// Starter bestiary from SRD 5.1 stat blocks (CC-BY-4.0). Tagged srd-5.1.
export interface MonsterAction { name: string; hit?: number; dmg?: string; type?: string; save?: string; text?: string; }
export interface Monster {
  id: string;
  name: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge';
  kind: string;
  ac: number;
  hp: number;
  hpDice: string;
  speed: string;
  abilities: [number, number, number, number, number, number];
  cr: string;
  xp: number;
  senses: string;
  traits?: { name: string; text: string }[];
  actions: MonsterAction[];
  notes?: string;
  source: 'srd-5.1';
}

const m = (x: Omit<Monster, 'source'>): Monster => ({ ...x, source: 'srd-5.1' });

export const MONSTERS: Monster[] = [
  m({ id: 'giantRat', name: 'Giant Rat', size: 'Small', kind: 'Beast', ac: 12, hp: 7, hpDice: '2d6', speed: '30 ft', abilities: [7, 15, 11, 2, 10, 4], cr: '1/8', xp: 25, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Pack Tactics', text: "Advantage on attacks if an ally is within 5 ft of the target and isn't incapacitated." }],
    actions: [{ name: 'Bite', hit: 4, dmg: '1d4+2', type: 'piercing' }] }),
  m({ id: 'kobold', name: 'Kobold', size: 'Small', kind: 'Humanoid', ac: 12, hp: 5, hpDice: '2d6-2', speed: '30 ft', abilities: [7, 15, 9, 8, 7, 8], cr: '1/8', xp: 25, senses: 'Darkvision 60 ft, passive Perception 8',
    traits: [{ name: 'Sunlight Sensitivity', text: 'Disadvantage on attacks and sight-based Perception in sunlight.' }, { name: 'Pack Tactics', text: 'Advantage on attacks if an ally is within 5 ft of the target.' }],
    actions: [{ name: 'Dagger', hit: 4, dmg: '1d4+2', type: 'piercing' }, { name: 'Sling', hit: 4, dmg: '1d4+2', type: 'bludgeoning', text: 'Range 30/120 ft.' }] }),
  m({ id: 'bandit', name: 'Bandit', size: 'Medium', kind: 'Humanoid', ac: 12, hp: 11, hpDice: '2d8+2', speed: '30 ft', abilities: [11, 12, 12, 10, 10, 10], cr: '1/8', xp: 25, senses: 'Passive Perception 10',
    actions: [{ name: 'Scimitar', hit: 3, dmg: '1d6+1', type: 'slashing' }, { name: 'Light Crossbow', hit: 3, dmg: '1d8+1', type: 'piercing', text: 'Range 80/320 ft.' }] }),
  m({ id: 'cultist', name: 'Cultist', size: 'Medium', kind: 'Humanoid', ac: 12, hp: 9, hpDice: '2d8', speed: '30 ft', abilities: [11, 12, 10, 10, 11, 10], cr: '1/8', xp: 25, senses: 'Passive Perception 10',
    traits: [{ name: 'Dark Devotion', text: 'Advantage on saves against being charmed or frightened.' }],
    actions: [{ name: 'Scimitar', hit: 3, dmg: '1d6+1', type: 'slashing' }] }),
  m({ id: 'guard', name: 'Guard', size: 'Medium', kind: 'Humanoid', ac: 16, hp: 11, hpDice: '2d8+2', speed: '30 ft', abilities: [13, 12, 12, 10, 11, 10], cr: '1/8', xp: 25, senses: 'Passive Perception 12',
    actions: [{ name: 'Spear', hit: 3, dmg: '1d6+1', type: 'piercing', text: 'Or 1d8+1 two-handed.' }] }),
  m({ id: 'goblin', name: 'Goblin', size: 'Small', kind: 'Humanoid', ac: 15, hp: 7, hpDice: '2d6', speed: '30 ft', abilities: [8, 14, 10, 10, 8, 8], cr: '1/4', xp: 50, senses: 'Darkvision 60 ft, passive Perception 9',
    traits: [{ name: 'Nimble Escape', text: 'Disengage or Hide as a bonus action.' }],
    actions: [{ name: 'Scimitar', hit: 4, dmg: '1d6+2', type: 'slashing' }, { name: 'Shortbow', hit: 4, dmg: '1d6+2', type: 'piercing', text: 'Range 80/320 ft.' }] }),
  m({ id: 'skeleton', name: 'Skeleton', size: 'Medium', kind: 'Undead', ac: 13, hp: 13, hpDice: '2d8+4', speed: '30 ft', abilities: [10, 14, 15, 6, 8, 5], cr: '1/4', xp: 50, senses: 'Darkvision 60 ft, passive Perception 9',
    traits: [{ name: 'Damage', text: 'Vulnerable to bludgeoning; immune to poison; immune to exhaustion and poisoned.' }],
    actions: [{ name: 'Shortsword', hit: 4, dmg: '1d6+2', type: 'piercing' }, { name: 'Shortbow', hit: 4, dmg: '1d6+2', type: 'piercing', text: 'Range 80/320 ft.' }] }),
  m({ id: 'zombie', name: 'Zombie', size: 'Medium', kind: 'Undead', ac: 8, hp: 22, hpDice: '3d8+9', speed: '20 ft', abilities: [13, 6, 16, 3, 6, 5], cr: '1/4', xp: 50, senses: 'Darkvision 60 ft, passive Perception 8',
    traits: [{ name: 'Undead Fortitude', text: 'If damage drops it to 0 HP, it makes a Con save (DC 5 + damage taken) to drop to 1 HP instead, unless the damage is radiant or from a critical hit.' }],
    actions: [{ name: 'Slam', hit: 3, dmg: '1d6+1', type: 'bludgeoning' }] }),
  m({ id: 'wolf', name: 'Wolf', size: 'Medium', kind: 'Beast', ac: 13, hp: 11, hpDice: '2d8+2', speed: '40 ft', abilities: [12, 15, 12, 3, 12, 6], cr: '1/4', xp: 50, senses: 'Passive Perception 13',
    traits: [{ name: 'Pack Tactics', text: 'Advantage on attacks if an ally is within 5 ft of the target.' }],
    actions: [{ name: 'Bite', hit: 4, dmg: '2d4+2', type: 'piercing', save: 'DC 11 Str', text: 'Target is knocked prone on a failed Str save.' }] }),
  m({ id: 'orc', name: 'Orc', size: 'Medium', kind: 'Humanoid', ac: 13, hp: 15, hpDice: '2d8+6', speed: '30 ft', abilities: [16, 12, 16, 7, 11, 10], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Aggressive', text: 'Bonus action: move up to its speed toward a hostile creature it can see.' }],
    actions: [{ name: 'Greataxe', hit: 5, dmg: '1d12+3', type: 'slashing' }, { name: 'Javelin', hit: 5, dmg: '1d6+3', type: 'piercing', text: 'Range 30/120 ft.' }] }),
  m({ id: 'hobgoblin', name: 'Hobgoblin', size: 'Medium', kind: 'Humanoid', ac: 18, hp: 11, hpDice: '2d8+2', speed: '30 ft', abilities: [13, 12, 12, 10, 10, 9], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Martial Advantage', text: 'Once per turn, +2d6 damage if an ally is within 5 ft of the target.' }],
    actions: [{ name: 'Longsword', hit: 3, dmg: '1d8+1', type: 'slashing' }, { name: 'Longbow', hit: 3, dmg: '1d8+1', type: 'piercing', text: 'Range 150/600 ft.' }] }),
  m({ id: 'gnoll', name: 'Gnoll', size: 'Medium', kind: 'Humanoid', ac: 15, hp: 22, hpDice: '5d8', speed: '30 ft', abilities: [14, 12, 11, 6, 10, 7], cr: '1/2', xp: 100, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Rampage', text: 'When it drops a creature to 0 HP with a melee attack, it can move half its speed and bite as a bonus action.' }],
    actions: [{ name: 'Bite', hit: 4, dmg: '1d4+2', type: 'piercing' }, { name: 'Spear', hit: 4, dmg: '1d6+2', type: 'piercing' }, { name: 'Longbow', hit: 3, dmg: '1d8+1', type: 'piercing', text: 'Range 150/600 ft.' }] }),
  m({ id: 'thug', name: 'Thug', size: 'Medium', kind: 'Humanoid', ac: 11, hp: 32, hpDice: '5d8+10', speed: '30 ft', abilities: [15, 11, 14, 10, 10, 11], cr: '1/2', xp: 100, senses: 'Passive Perception 10',
    traits: [{ name: 'Pack Tactics', text: 'Advantage on attacks if an ally is within 5 ft of the target.' }],
    actions: [{ name: 'Multiattack', text: 'Two melee attacks.' }, { name: 'Mace', hit: 4, dmg: '1d6+2', type: 'bludgeoning' }, { name: 'Heavy Crossbow', hit: 2, dmg: '1d10', type: 'piercing', text: 'Range 100/400 ft.' }] }),
  m({ id: 'bugbear', name: 'Bugbear', size: 'Medium', kind: 'Humanoid', ac: 16, hp: 27, hpDice: '5d8+5', speed: '30 ft', abilities: [15, 14, 13, 8, 11, 9], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Brute', text: 'Melee weapons deal one extra die of damage (included).' }, { name: 'Surprise Attack', text: '+2d6 damage against a surprised creature in the first round.' }],
    actions: [{ name: 'Morningstar', hit: 4, dmg: '2d8+2', type: 'piercing' }, { name: 'Javelin', hit: 4, dmg: '2d6+2', type: 'piercing', text: 'Or 1d6+2 thrown, range 30/120 ft.' }] }),
  m({ id: 'ghoul', name: 'Ghoul', size: 'Medium', kind: 'Undead', ac: 12, hp: 22, hpDice: '5d8', speed: '30 ft', abilities: [13, 15, 10, 7, 10, 6], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 10',
    actions: [{ name: 'Bite', hit: 2, dmg: '2d6+2', type: 'piercing' }, { name: 'Claws', hit: 4, dmg: '2d4+2', type: 'slashing', save: 'DC 10 Con', text: 'Non-elf targets are paralyzed for 1 minute on a failed save (repeat at end of each turn).' }] }),
  m({ id: 'giantSpider', name: 'Giant Spider', size: 'Large', kind: 'Beast', ac: 14, hp: 26, hpDice: '4d10+4', speed: '30 ft, climb 30 ft', abilities: [14, 16, 12, 2, 11, 4], cr: '1', xp: 200, senses: 'Blindsight 10 ft, darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Spider Climb / Web Walker', text: 'Climbs difficult surfaces and ignores webs.' }],
    actions: [{ name: 'Bite', hit: 5, dmg: '1d8+3', type: 'piercing', save: 'DC 11 Con', text: '+2d8 poison on a failed save (half on success).' }, { name: 'Web (Recharge 5-6)', hit: 5, text: 'Range 30/60 ft; target is restrained (DC 12 Str to escape).' }] }),
  m({ id: 'animatedArmor', name: 'Animated Armor', size: 'Medium', kind: 'Construct', ac: 18, hp: 33, hpDice: '6d8+6', speed: '25 ft', abilities: [14, 11, 13, 1, 3, 1], cr: '1', xp: 200, senses: 'Blindsight 60 ft, passive Perception 6',
    actions: [{ name: 'Multiattack', text: 'Two melee attacks.' }, { name: 'Slam', hit: 4, dmg: '1d6+2', type: 'bludgeoning' }] }),
  m({ id: 'specter', name: 'Specter', size: 'Medium', kind: 'Undead', ac: 12, hp: 22, hpDice: '5d8', speed: 'fly 50 ft (hover)', abilities: [1, 14, 11, 10, 10, 11], cr: '1', xp: 200, senses: 'Darkvision 60 ft, passive Perception 10',
    traits: [{ name: 'Incorporeal Movement', text: 'Moves through creatures and objects as difficult terrain.' }],
    actions: [{ name: 'Life Drain', hit: 4, dmg: '3d6', type: 'necrotic', save: 'DC 10 Con', text: 'HP maximum reduced by the damage on a failed save.' }] }),
  m({ id: 'direWolf', name: 'Dire Wolf', size: 'Large', kind: 'Beast', ac: 14, hp: 37, hpDice: '5d10+10', speed: '50 ft', abilities: [17, 15, 15, 3, 12, 7], cr: '1', xp: 200, senses: 'Passive Perception 13',
    traits: [{ name: 'Pack Tactics', text: 'Advantage on attacks if an ally is within 5 ft of the target.' }],
    actions: [{ name: 'Bite', hit: 5, dmg: '2d6+3', type: 'piercing', save: 'DC 13 Str', text: 'Knocked prone on a failed save.' }] }),
  m({ id: 'ogre', name: 'Ogre', size: 'Large', kind: 'Giant', ac: 11, hp: 59, hpDice: '7d10+21', speed: '40 ft', abilities: [19, 8, 16, 5, 7, 7], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 8',
    actions: [{ name: 'Greatclub', hit: 6, dmg: '2d8+4', type: 'bludgeoning' }, { name: 'Javelin', hit: 6, dmg: '2d6+4', type: 'piercing', text: 'Range 30/120 ft.' }] }),
  m({ id: 'gelatinousCube', name: 'Gelatinous Cube', size: 'Large', kind: 'Ooze', ac: 6, hp: 84, hpDice: '8d10+40', speed: '15 ft', abilities: [14, 3, 20, 1, 6, 1], cr: '2', xp: 450, senses: 'Blindsight 60 ft, passive Perception 8',
    traits: [{ name: 'Transparent', text: 'DC 15 Perception to spot it when it has not moved.' }],
    actions: [{ name: 'Pseudopod', hit: 4, dmg: '3d6', type: 'acid' }, { name: 'Engulf', save: 'DC 12 Dex', text: 'Moves through creatures; on a failed save a creature is engulfed: 3d6 acid and restrained.' }] }),
  m({ id: 'mimic', name: 'Mimic', size: 'Medium', kind: 'Monstrosity', ac: 12, hp: 58, hpDice: '9d8+18', speed: '15 ft', abilities: [17, 12, 15, 5, 13, 8], cr: '2', xp: 450, senses: 'Darkvision 60 ft, passive Perception 11',
    traits: [{ name: 'Adhesive / False Appearance', text: 'Looks like an object; things that touch it stick (grappled, DC 13 to escape).' }],
    actions: [{ name: 'Pseudopod', hit: 5, dmg: '1d8+3', type: 'bludgeoning' }, { name: 'Bite', hit: 5, dmg: '1d8+3', type: 'piercing', text: '+1d8 acid.' }] }),
  m({ id: 'banditCaptain', name: 'Bandit Captain', size: 'Medium', kind: 'Humanoid', ac: 15, hp: 65, hpDice: '10d8+20', speed: '30 ft', abilities: [15, 16, 14, 14, 11, 14], cr: '2', xp: 450, senses: 'Passive Perception 10',
    actions: [{ name: 'Multiattack', text: 'Three melee attacks: two scimitar, one dagger.' }, { name: 'Scimitar', hit: 5, dmg: '1d6+3', type: 'slashing' }, { name: 'Dagger', hit: 5, dmg: '1d4+3', type: 'piercing' }, { name: 'Parry (reaction)', text: '+2 AC against one melee attack that would hit.' }] }),
  m({ id: 'wight', name: 'Wight', size: 'Medium', kind: 'Undead', ac: 14, hp: 45, hpDice: '6d8+18', speed: '30 ft', abilities: [15, 14, 16, 10, 13, 15], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 13',
    actions: [{ name: 'Multiattack', text: 'Two longsword attacks or one longsword and Life Drain.' }, { name: 'Longsword', hit: 4, dmg: '1d8+2', type: 'slashing' }, { name: 'Life Drain', hit: 4, dmg: '1d6+2', type: 'necrotic', save: 'DC 13 Con', text: 'HP maximum reduced on a failed save.' }] }),
  m({ id: 'owlbear', name: 'Owlbear', size: 'Large', kind: 'Monstrosity', ac: 13, hp: 59, hpDice: '7d10+21', speed: '40 ft', abilities: [20, 12, 17, 3, 12, 7], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 13',
    actions: [{ name: 'Multiattack', text: 'Beak and claws.' }, { name: 'Beak', hit: 7, dmg: '1d10+5', type: 'piercing' }, { name: 'Claws', hit: 7, dmg: '2d8+5', type: 'slashing' }] }),
  m({ id: 'minotaur', name: 'Minotaur', size: 'Large', kind: 'Monstrosity', ac: 14, hp: 76, hpDice: '9d10+27', speed: '40 ft', abilities: [18, 11, 16, 6, 16, 9], cr: '3', xp: 700, senses: 'Darkvision 60 ft, passive Perception 17',
    traits: [{ name: 'Charge', text: 'Moving 10+ ft straight then hitting with gore adds 2d8 and a DC 14 Str save or be pushed 10 ft and knocked prone.' }],
    actions: [{ name: 'Greataxe', hit: 6, dmg: '2d12+4', type: 'slashing' }, { name: 'Gore', hit: 6, dmg: '2d8+4', type: 'piercing' }] }),
];
export const monsterById = (id: string) => MONSTERS.find((x) => x.id === id);
export const sizeSquares = (size: string) => (size === 'Large' ? 2 : size === 'Huge' ? 3 : 1);
