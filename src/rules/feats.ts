// Feats from SRD 5.2.1 (CC-BY-4.0). Text is summarized in our own words.
import type { Ability } from './core';

export interface Feat {
  id: string;
  name: string;
  kind: 'origin' | 'general' | 'style' | 'epic';
  text: string;
  /** Fixed ability increase the feat gives (otherwise the player picks with `scores`). */
  bump?: Partial<Record<Ability, number>>;
  /** Abilities the player may raise by 1 with this feat. */
  raise?: Ability[];
  /** Grants proficiency in this saving throw. */
  save?: Ability;
}

const ALL: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const FEATS: Feat[] = [
  // Origin feats (also takeable at ASI levels)
  { id: 'alert', name: 'Alert', kind: 'origin', text: 'Add your proficiency bonus to initiative, and you can swap initiative with a willing ally right after rolling.' },
  { id: 'magicInitiate', name: 'Magic Initiate', kind: 'origin', text: 'Learn two cantrips and one 1st-level spell from the cleric, druid or wizard list; cast the spell once per long rest for free.' },
  { id: 'savageAttacker', name: 'Savage Attacker', kind: 'origin', text: "Once per turn when you hit with a weapon, roll its damage dice twice and use either roll." },
  { id: 'skilled', name: 'Skilled', kind: 'origin', text: 'Gain proficiency in any three skills or tools.' },
  // General feats
  { id: 'asiFeat', name: 'Ability Score Improvement', kind: 'general', raise: ALL, text: '+2 to one ability or +1 to two (max 20).' },
  { id: 'grappler', name: 'Grappler', kind: 'general', raise: ['str', 'dex'], text: '+1 Str or Dex. When you hit with an unarmed strike as part of the Attack action you can also grapple; advantage on attacks against creatures you grapple; moving them costs no extra.' },
  // Fighting styles
  { id: 'archery', name: 'Archery', kind: 'style', text: '+2 to attack rolls with ranged weapons.' },
  { id: 'defense', name: 'Defense', kind: 'style', text: '+1 AC while wearing light, medium or heavy armor.' },
  { id: 'greatWeaponFighting', name: 'Great Weapon Fighting', kind: 'style', text: 'When you roll damage for a two-handed or versatile melee weapon held in two hands, treat any 1 or 2 on a damage die as a 3.' },
  { id: 'twoWeaponFighting', name: 'Two-Weapon Fighting', kind: 'style', text: 'Add your ability modifier to the damage of the extra attack when you fight with two light weapons.' },
  // Epic Boons (level 19). Each also raises one ability by 1, up to 30.
  { id: 'boonCombatProwess', name: 'Boon of Combat Prowess', kind: 'epic', raise: ALL, text: 'Once per turn when you miss with an attack, you can hit instead.' },
  { id: 'boonDimensionalTravel', name: 'Boon of Dimensional Travel', kind: 'epic', raise: ALL, text: 'After you take the Attack or Magic action, teleport up to 30 ft to a space you can see.' },
  { id: 'boonFate', name: 'Boon of Fate', kind: 'epic', raise: ALL, text: 'When a creature you can see within 60 ft makes a d20 test, roll 2d4 and add or subtract it. Recharges on initiative or a rest.' },
  { id: 'boonIrresistibleOffense', name: 'Boon of Irresistible Offense', kind: 'epic', raise: ['str', 'dex'], text: 'Your bludgeoning, piercing and slashing damage ignores resistance; on a natural 20 add extra damage equal to the raised ability score.' },
  { id: 'boonSpellRecall', name: 'Boon of Spell Recall', kind: 'epic', raise: ['int', 'wis', 'cha'], text: 'Once per long rest, cast a prepared spell of 1st to 4th level without spending a slot.' },
  { id: 'boonNightSpirit', name: 'Boon of the Night Spirit', kind: 'epic', raise: ALL, text: 'In dim light or darkness you can become invisible as a bonus action, and you resist all damage but psychic and radiant.' },
  { id: 'boonTruesight', name: 'Boon of Truesight', kind: 'epic', raise: ALL, text: 'You have Truesight out to 60 ft.' },
];
export const featById = (id: string) => FEATS.find((f) => f.id === id);
export const STYLE_FEATS = FEATS.filter((f) => f.kind === 'style');
export const EPIC_FEATS = FEATS.filter((f) => f.kind === 'epic');
/** Feats that can be taken at an ASI level (ASI itself, general and origin feats). */
export const ASI_FEATS = FEATS.filter((f) => f.kind === 'general' || f.kind === 'origin');
