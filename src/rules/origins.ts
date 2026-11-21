// Species, backgrounds and origin feats from SRD 5.2.1 (CC-BY-4.0). Trait text is summarized.
import type { Ability, Skill } from './core';

export interface Species {
  id: string;
  name: string;
  size: 'Small' | 'Medium' | 'Small or Medium';
  speed: number;
  darkvision: number;
  hpPerLevel?: number;
  resist?: string[];
  traits: { name: string; text: string }[];
  extraSkill?: boolean;
}

export const SPECIES: Species[] = [
  {
    id: 'dragonborn', name: 'Dragonborn', size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Draconic Ancestry', text: 'Pick a dragon type; it sets your breath weapon and resistance damage type.' },
      { name: 'Breath Weapon', text: 'Replace one attack with a 15-ft cone or 30-ft line: Dex save (DC 8 + Con + prof), 1d10 damage (2d10 at level 5). Uses = proficiency bonus per long rest.' },
      { name: 'Damage Resistance', text: 'Resistance to your ancestry damage type.' },
    ],
  },
  {
    id: 'dwarf', name: 'Dwarf', size: 'Medium', speed: 30, darkvision: 120, hpPerLevel: 1, resist: ['poison'],
    traits: [
      { name: 'Dwarven Resilience', text: 'Resistance to poison damage; advantage on saves against being poisoned.' },
      { name: 'Dwarven Toughness', text: '+1 HP maximum per level.' },
      { name: 'Stonecunning', text: 'Bonus action: tremorsense 60 ft while on stone for 10 minutes (proficiency bonus uses per long rest).' },
    ],
  },
  {
    id: 'elf', name: 'Elf', size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Elven Lineage', text: 'Drow, High Elf or Wood Elf: grants a cantrip and later spells (High Elf: Prestidigitation; Wood Elf: speed 35).' },
      { name: 'Fey Ancestry', text: 'Advantage on saves to avoid or end being charmed.' },
      { name: 'Keen Senses', text: 'Proficiency in Insight, Perception or Survival.' },
      { name: 'Trance', text: 'A long rest takes 4 hours of meditation.' },
    ],
  },
  {
    id: 'gnome', name: 'Gnome', size: 'Small', speed: 30, darkvision: 60,
    traits: [
      { name: 'Gnomish Cunning', text: 'Advantage on Intelligence, Wisdom and Charisma saves.' },
      { name: 'Gnomish Lineage', text: 'Forest Gnome (Minor Illusion, Speak with Animals) or Rock Gnome (Mending, Prestidigitation, tiny gadgets).' },
    ],
  },
  {
    id: 'goliath', name: 'Goliath', size: 'Medium', speed: 35, darkvision: 0,
    traits: [
      { name: 'Giant Ancestry', text: "Pick a giant boon (e.g. Stone's Endurance: reaction to reduce damage by 1d12 + Con). Uses = proficiency bonus per long rest." },
      { name: 'Large Form', text: 'From level 5: bonus action to become Large for 10 minutes (once per long rest).' },
      { name: 'Powerful Build', text: 'Advantage on checks to end being grappled; count as one size larger for carrying.' },
    ],
  },
  {
    id: 'halfling', name: 'Halfling', size: 'Small', speed: 30, darkvision: 0,
    traits: [
      { name: 'Brave', text: 'Advantage on saves to avoid or end being frightened.' },
      { name: 'Halfling Nimbleness', text: 'Move through the space of a creature larger than you.' },
      { name: 'Luck', text: 'When you roll a 1 on a d20 test, reroll it and use the new roll.' },
      { name: 'Naturally Stealthy', text: 'Hide even when only obscured by a creature at least one size larger.' },
    ],
  },
  {
    id: 'human', name: 'Human', size: 'Small or Medium', speed: 30, darkvision: 0, extraSkill: true,
    traits: [
      { name: 'Resourceful', text: 'Gain Heroic Inspiration whenever you finish a long rest.' },
      { name: 'Skillful', text: 'Proficiency in one extra skill.' },
      { name: 'Versatile', text: 'Gain an extra origin feat (e.g. Skilled, Tough, Alert).' },
    ],
  },
  {
    id: 'orc', name: 'Orc', size: 'Medium', speed: 30, darkvision: 120,
    traits: [
      { name: 'Adrenaline Rush', text: 'Bonus action Dash and gain temporary HP equal to proficiency bonus (proficiency bonus uses per short or long rest).' },
      { name: 'Relentless Endurance', text: 'When reduced to 0 HP but not killed, drop to 1 HP instead (once per long rest).' },
    ],
  },
  {
    id: 'tiefling', name: 'Tiefling', size: 'Small or Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Fiendish Legacy', text: 'Abyssal, Chthonic or Infernal legacy: a resistance, a cantrip (e.g. Fire Bolt) and later spells.' },
      { name: 'Otherworldly Presence', text: 'You know the Thaumaturgy cantrip.' },
    ],
  },
];
export const speciesById = (id: string) => SPECIES.find((s) => s.id === id)!;

export interface Background {
  id: string;
  name: string;
  abilities: [Ability, Ability, Ability];
  skills: [Skill, Skill];
  tool: string;
  feat: string;
  featText: string;
}

export const BACKGROUNDS: Background[] = [
  { id: 'acolyte', name: 'Acolyte', abilities: ['int', 'wis', 'cha'], skills: ['insight', 'religion'], tool: "Calligrapher's Supplies", feat: 'Magic Initiate (Cleric)', featText: 'Learn two cleric cantrips and one 1st-level cleric spell (cast once per long rest for free).' },
  { id: 'criminal', name: 'Criminal', abilities: ['dex', 'con', 'int'], skills: ['sleightOfHand', 'stealth'], tool: "Thieves' Tools", feat: 'Alert', featText: 'Add your proficiency bonus to initiative; you can swap initiative with a willing ally.' },
  { id: 'sage', name: 'Sage', abilities: ['con', 'int', 'wis'], skills: ['arcana', 'history'], tool: "Calligrapher's Supplies", feat: 'Magic Initiate (Wizard)', featText: 'Learn two wizard cantrips and one 1st-level wizard spell (cast once per long rest for free).' },
  { id: 'soldier', name: 'Soldier', abilities: ['str', 'dex', 'con'], skills: ['athletics', 'intimidation'], tool: 'Gaming Set', feat: 'Savage Attacker', featText: 'Once per turn, roll weapon damage dice twice and use either roll.' },
];
export const backgroundById = (id: string) => BACKGROUNDS.find((b) => b.id === id)!;
