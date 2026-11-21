// Weapons and armor (SRD 5.2.1, CC-BY-4.0).
export interface Weapon {
  id: string;
  name: string;
  dice: string; // damage dice
  type: string; // damage type
  props: string[]; // finesse, light, thrown, versatile(1d10), heavy, two-handed, ranged, reach
  versatile?: string;
  range?: string;
  mastery: string;
  martial: boolean;
}

export const WEAPONS: Weapon[] = [
  { id: 'club', name: 'Club', dice: '1d4', type: 'bludgeoning', props: ['light'], mastery: 'Slow', martial: false },
  { id: 'dagger', name: 'Dagger', dice: '1d4', type: 'piercing', props: ['finesse', 'light', 'thrown'], range: '20/60', mastery: 'Nick', martial: false },
  { id: 'greatclub', name: 'Greatclub', dice: '1d8', type: 'bludgeoning', props: ['two-handed'], mastery: 'Push', martial: false },
  { id: 'handaxe', name: 'Handaxe', dice: '1d6', type: 'slashing', props: ['light', 'thrown'], range: '20/60', mastery: 'Vex', martial: false },
  { id: 'javelin', name: 'Javelin', dice: '1d6', type: 'piercing', props: ['thrown'], range: '30/120', mastery: 'Slow', martial: false },
  { id: 'mace', name: 'Mace', dice: '1d6', type: 'bludgeoning', props: [], mastery: 'Sap', martial: false },
  { id: 'quarterstaff', name: 'Quarterstaff', dice: '1d6', type: 'bludgeoning', props: ['versatile'], versatile: '1d8', mastery: 'Topple', martial: false },
  { id: 'sickle', name: 'Sickle', dice: '1d4', type: 'slashing', props: ['light'], mastery: 'Nick', martial: false },
  { id: 'spear', name: 'Spear', dice: '1d6', type: 'piercing', props: ['thrown', 'versatile'], versatile: '1d8', range: '20/60', mastery: 'Sap', martial: false },
  { id: 'lightCrossbow', name: 'Light Crossbow', dice: '1d8', type: 'piercing', props: ['ranged', 'two-handed'], range: '80/320', mastery: 'Slow', martial: false },
  { id: 'shortbow', name: 'Shortbow', dice: '1d6', type: 'piercing', props: ['ranged', 'two-handed'], range: '80/320', mastery: 'Vex', martial: false },
  { id: 'sling', name: 'Sling', dice: '1d4', type: 'bludgeoning', props: ['ranged'], range: '30/120', mastery: 'Slow', martial: false },
  { id: 'battleaxe', name: 'Battleaxe', dice: '1d8', type: 'slashing', props: ['versatile'], versatile: '1d10', mastery: 'Topple', martial: true },
  { id: 'flail', name: 'Flail', dice: '1d8', type: 'bludgeoning', props: [], mastery: 'Sap', martial: true },
  { id: 'greataxe', name: 'Greataxe', dice: '1d12', type: 'slashing', props: ['heavy', 'two-handed'], mastery: 'Cleave', martial: true },
  { id: 'greatsword', name: 'Greatsword', dice: '2d6', type: 'slashing', props: ['heavy', 'two-handed'], mastery: 'Graze', martial: true },
  { id: 'longsword', name: 'Longsword', dice: '1d8', type: 'slashing', props: ['versatile'], versatile: '1d10', mastery: 'Sap', martial: true },
  { id: 'maul', name: 'Maul', dice: '2d6', type: 'bludgeoning', props: ['heavy', 'two-handed'], mastery: 'Topple', martial: true },
  { id: 'rapier', name: 'Rapier', dice: '1d8', type: 'piercing', props: ['finesse'], mastery: 'Vex', martial: true },
  { id: 'scimitar', name: 'Scimitar', dice: '1d6', type: 'slashing', props: ['finesse', 'light'], mastery: 'Nick', martial: true },
  { id: 'shortsword', name: 'Shortsword', dice: '1d6', type: 'piercing', props: ['finesse', 'light'], mastery: 'Vex', martial: true },
  { id: 'warhammer', name: 'Warhammer', dice: '1d8', type: 'bludgeoning', props: ['versatile'], versatile: '1d10', mastery: 'Push', martial: true },
  { id: 'longbow', name: 'Longbow', dice: '1d8', type: 'piercing', props: ['ranged', 'heavy', 'two-handed'], range: '150/600', mastery: 'Slow', martial: true },
  { id: 'heavyCrossbow', name: 'Heavy Crossbow', dice: '1d10', type: 'piercing', props: ['ranged', 'heavy', 'two-handed'], range: '100/400', mastery: 'Push', martial: true },
];
export const weaponById = (id: string) => WEAPONS.find((w) => w.id === id);

export const MASTERY_TEXT: Record<string, string> = {
  Cleave: 'On a hit, make one extra attack against a second creature within 5 feet of the first (once per turn, no ability modifier to damage unless negative).',
  Graze: 'On a miss, deal damage equal to the ability modifier used for the attack.',
  Nick: 'The extra Light-weapon attack can be made as part of the Attack action instead of a bonus action (once per turn).',
  Push: 'On a hit, push a Large or smaller creature up to 10 feet straight away.',
  Sap: 'On a hit, the target has disadvantage on its next attack roll before your next turn.',
  Slow: "On a hit that deals damage, reduce the target's speed by 10 feet until your next turn.",
  Topple: 'On a hit, the target makes a Con save (DC 8 + ability mod + proficiency) or falls prone.',
  Vex: 'On a hit that deals damage, you have advantage on your next attack roll against that creature before the end of your next turn.',
};

export type ArmorKind = 'light' | 'medium' | 'heavy' | 'shield';
export interface Armor { id: string; name: string; kind: ArmorKind; base: number; }
export const ARMOR: Armor[] = [
  { id: 'padded', name: 'Padded Armor', kind: 'light', base: 11 },
  { id: 'leather', name: 'Leather Armor', kind: 'light', base: 11 },
  { id: 'studded', name: 'Studded Leather', kind: 'light', base: 12 },
  { id: 'hide', name: 'Hide Armor', kind: 'medium', base: 12 },
  { id: 'chainShirt', name: 'Chain Shirt', kind: 'medium', base: 13 },
  { id: 'scale', name: 'Scale Mail', kind: 'medium', base: 14 },
  { id: 'breastplate', name: 'Breastplate', kind: 'medium', base: 14 },
  { id: 'halfPlate', name: 'Half Plate', kind: 'medium', base: 15 },
  { id: 'ringMail', name: 'Ring Mail', kind: 'heavy', base: 14 },
  { id: 'chainMail', name: 'Chain Mail', kind: 'heavy', base: 16 },
  { id: 'splint', name: 'Splint Armor', kind: 'heavy', base: 17 },
  { id: 'plate', name: 'Plate Armor', kind: 'heavy', base: 18 },
  { id: 'shield', name: 'Shield', kind: 'shield', base: 2 },
];
export const armorById = (id: string) => ARMOR.find((a) => a.id === id);
