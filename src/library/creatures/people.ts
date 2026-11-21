// Hero tokens (every species x class) and humanoid NPCs and monsters, built from the bust builder in portrait.ts.
// Original art drawn with the Canvas 2D API.
import type { Colors, CreatureDef, CreatureFamily, CreatureSize, Variant } from '../art/types';
import { mix, shade } from '../art/kit';
import { drawBust, type BustOpts } from './portrait';

type Opts = Partial<BustOpts>;

/** Map colour keys from a creature's `c` onto bust options. */
export function colorOpts(c: Colors): Opts {
  const o: Opts = {};
  const map: [string, keyof BustOpts][] = [
    ['skin', 'skin'], ['hair', 'hairColor'], ['beard', 'beardColor'], ['eye', 'eyes'], ['glow', 'glowColor'], ['outfit', 'outfitColor'],
    ['trim', 'trim'], ['metal', 'metal'], ['cloak', 'cloak'], ['hood', 'hoodColor'], ['hat', 'hatColor'], ['plume', 'plume'],
    ['mantle', 'mantleColor'], ['horn', 'hornColor'], ['under', 'under'], ['crown', 'crownColor'], ['held', 'heldColor'],
    ['wing', 'wingColor'], ['marks', 'marks'], ['mask', 'mask'], ['bandana', 'bandana'], ['headband', 'headband'],
    ['holy', 'holy'], ['beads', 'beads'], ['collar', 'collarColor'], ['spots', 'spots'], ['warpaint', 'warpaint'], ['visor', 'visorGlow'],
  ];
  for (const [k, ok] of map) if (c[k] !== undefined) (o as Record<string, unknown>)[ok] = c[k];
  return o;
}

// ------------------------------------------------------------------ heroes

export const HERO_SPECIES = ['dragonborn', 'dwarf', 'elf', 'gnome', 'goliath', 'halfling', 'human', 'orc', 'tiefling'] as const;
export const HERO_CLASSES = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'] as const;

interface SpeciesDef {
  name: string;
  size: CreatureSize;
  base: Opts;
  c: Colors;
  variants: Variant[];
  /** Hair restyles per variant flag. */
  flagOpts?: (f: Record<string, number>) => Opts;
}

const SPECIES: Record<string, SpeciesDef> = {
  dragonborn: {
    name: 'Dragonborn', size: 'Medium',
    base: { snout: 'reptile', horns: 'ridge', ears: 'none', hair: 'none', eyeStyle: 'slit', headW: 20, headH: 24, shoulders: 1.12, scales: true },
    c: { skin: '#b8432f', under: '#ecc58c', eye: '#f2c14e', horn: '#efe2c0' },
    variants: [
      { name: 'Red scales', c: {} },
      { name: 'Blue scales', c: { skin: '#3f6fb0', under: '#c4dcec', eye: '#ffe066' } },
      { name: 'Green scales', c: { skin: '#4f8a4a', under: '#dfe8a8', eye: '#ffb347' } },
      { name: 'Gold scales', c: { skin: '#d9a33a', under: '#f6e6b4', eye: '#c0303a', horn: '#7a5a3a' } },
      { name: 'Silver scales', c: { skin: '#a9b5bf', under: '#f0f3f5', eye: '#4cc9f0', horn: '#5a6670' } },
      { name: 'Black scales', c: { skin: '#3c3a44', under: '#8c8a78', eye: '#9cff7a', horn: '#d8ccb0' } },
    ],
  },
  dwarf: {
    name: 'Dwarf', size: 'Medium',
    base: { face: 'wide', headY: 47, headW: 20, headH: 21, shoulders: 1.2, ears: 'round', nose: 'big', beard: 'braided', hair: 'short', brows: 'heavy', mouth: 'neutral' },
    c: { skin: '#e3a886', hair: '#a8462a', eye: '#4a7a9a' },
    variants: [
      { name: 'Ruddy, red beard', c: {} },
      { name: 'Tan, black beard', c: { skin: '#c08a62', hair: '#2a201c', eye: '#5a3a24' } },
      { name: 'Brown, grey beard', c: { skin: '#8a5a3c', hair: '#bdb8ae', eye: '#3a2a1a' } },
      { name: 'Fair, gold beard', c: { skin: '#f2cdb0', hair: '#d8a84a' } },
    ],
  },
  elf: {
    name: 'Elf', size: 'Medium',
    base: { face: 'narrow', headW: 17.5, headH: 24, ears: 'elf', earsOver: true, hair: 'long', nose: 'small', mouth: 'smile', shoulders: 0.95 },
    c: { skin: '#f0d4b6', hair: '#ead68e', eye: '#3f9a6a' },
    variants: [
      { name: 'Fair, golden hair', c: {} },
      { name: 'Fair, silver hair', c: { skin: '#f4e0cc', hair: '#e6ebf0', eye: '#5a86c0' } },
      { name: 'Bronze, auburn hair', c: { skin: '#c8946a', hair: '#8a3a22', eye: '#6a4a2a' } },
      { name: 'Dusk, white hair', c: { skin: '#76668a', hair: '#f2f0f6', eye: '#e04a5a' } },
      { name: 'Deep, black hair', c: { skin: '#7a4e34', hair: '#1a1414', eye: '#c9a24a' } },
    ],
  },
  gnome: {
    name: 'Gnome', size: 'Small',
    base: { face: 'round', headW: 20.5, headH: 21, headY: 47, shoulders: 0.8, ears: 'long', nose: 'button', eyeStyle: 'big', hair: 'tufts', mouth: 'grin', blush: true, brows: 'raised' },
    c: { skin: '#f0c8a4', hair: '#f2f0ea', eye: '#3a7ab8' },
    variants: [
      { name: 'Fair, white tufts', c: {} },
      { name: 'Tan, orange tufts', c: { skin: '#c89a72', hair: '#e8782a', eye: '#3a8a5a' } },
      { name: 'Fair, pink tufts', c: { skin: '#f4d0b8', hair: '#e27aa8', eye: '#6a4ab8' } },
      { name: 'Brown, black tufts', c: { skin: '#8a5a3c', hair: '#2a2020', eye: '#c9a24a' } },
    ],
  },
  goliath: {
    name: 'Goliath', size: 'Medium',
    base: { face: 'square', headW: 20, headH: 25, headY: 43, shoulders: 1.28, ears: 'round', hair: 'bald', brows: 'heavy', mouth: 'neutral' },
    c: { skin: '#9aa1a6', marks: '#454c54', eye: '#7ab0d0', hair: '#2a2a2a' },
    variants: [
      { name: 'Grey stone', c: {} },
      { name: 'Blue-grey stone', c: { skin: '#8a9cae', marks: '#34465a', eye: '#e8f0f8' } },
      { name: 'Sandstone', c: { skin: '#bba68a', marks: '#6a5844', eye: '#3a7a9a' } },
      { name: 'Slate', c: { skin: '#5c6268', marks: '#24282c', eye: '#e8c46a' } },
    ],
  },
  halfling: {
    name: 'Halfling', size: 'Small',
    base: { face: 'round', headW: 19, headH: 21, headY: 47, shoulders: 0.8, ears: 'small', hair: 'curly', blush: true, freckles: true, mouth: 'smile', nose: 'small' },
    c: { skin: '#f0c8a4', hair: '#7a4a2a', eye: '#5a7a3a' },
    variants: [
      { name: 'Fair, brown curls', c: {} },
      { name: 'Tan, black curls', c: { skin: '#c89870', hair: '#2a2020', eye: '#5a3a24' } },
      { name: 'Rosy, ginger curls', c: { skin: '#f6d2b8', hair: '#c8602a', eye: '#3a7ab8' } },
      { name: 'Brown, auburn curls', c: { skin: '#8a5a3c', hair: '#6a2a1a', eye: '#3a2a1a' } },
    ],
  },
  human: {
    name: 'Human', size: 'Medium',
    base: { face: 'oval', ears: 'round', hair: 'short', mouth: 'smile' },
    c: { skin: '#e8b894', hair: '#5a3a22', eye: '#4a6a8a' },
    variants: [
      { name: 'Fair, brown hair', c: {} },
      { name: 'Olive, long black hair', c: { skin: '#c8996e', hair: '#1e1814', eye: '#4a3020' }, f: { long: 1 } },
      { name: 'Brown, bearded', c: { skin: '#8a5a3c', hair: '#1a1414', eye: '#3a2a1a' }, f: { beard: 1 } },
      { name: 'Deep, grey hair', c: { skin: '#5e3a26', hair: '#bdb8ae', eye: '#3a2a1a' }, f: { beard: 2 } },
      { name: 'Pale, long red hair', c: { skin: '#f4d6c0', hair: '#b8482a', eye: '#3f8a5a' }, f: { long: 1 } },
    ],
    flagOpts: (f) => ({ ...(f.long ? { hair: 'long' as const } : {}), ...(f.beard === 1 ? { beard: 'short' as const } : f.beard === 2 ? { beard: 'stubble' as const } : {}) }),
  },
  orc: {
    name: 'Orc', size: 'Medium',
    base: { face: 'square', headW: 20, headH: 23, shoulders: 1.15, ears: 'long', tusks: 'big', nose: 'flat', brows: 'heavy', hair: 'topknot', mouth: 'neutral' },
    c: { skin: '#7a9a5a', hair: '#1e1a18', eye: '#d0502a' },
    variants: [
      { name: 'Green', c: {} },
      { name: 'Grey-green', c: { skin: '#8d9c80', eye: '#e8c46a' } },
      { name: 'Grey', c: { skin: '#8c9094', hair: '#3a3a3a', eye: '#c0303a' } },
      { name: 'Deep green', c: { skin: '#4e6e3e', eye: '#f2c14e' } },
    ],
  },
  tiefling: {
    name: 'Tiefling', size: 'Medium',
    base: { face: 'heart', headW: 18, headH: 23, ears: 'long', horns: 'curl', eyeStyle: 'solid', hair: 'long', mouth: 'smirk', brows: 'sly' },
    c: { skin: '#c0504a', hair: '#2a1a2a', eye: '#f2c14e', horn: '#3a2a2e' },
    variants: [
      { name: 'Red, gold eyes', c: {} },
      { name: 'Purple, silver eyes', c: { skin: '#8a5a9a', hair: '#1a1428', eye: '#e8eef2' } },
      { name: 'Blue, white hair', c: { skin: '#4a6aa0', hair: '#ece6f2', eye: '#e84a4a', horn: '#2a2a3a' } },
      { name: 'Lavender, white eyes', c: { skin: '#c8a2c8', hair: '#4a1a3a', eye: '#ffffff', horn: '#6a4a5a' } },
      { name: 'Crimson, black hair', c: { skin: '#922a2e', hair: '#141014', eye: '#ffd166', horn: '#d8ccb0' } },
    ],
  },
};

const CLASS_NAMES: Record<string, string> = {
  barbarian: 'Barbarian', bard: 'Bard', cleric: 'Cleric', druid: 'Druid', fighter: 'Fighter', monk: 'Monk', paladin: 'Paladin',
  ranger: 'Ranger', rogue: 'Rogue', sorcerer: 'Sorcerer', warlock: 'Warlock', wizard: 'Wizard',
};

/** The default player colour per class (cloak, robe or tabard). */
export const CLASS_COLORS: Record<string, string> = {
  barbarian: '#b03a2e', bard: '#c2408c', cleric: '#e8e0cc', druid: '#4f8a3a', fighter: '#2f5d8a', monk: '#d9822b', paladin: '#3a63b8',
  ranger: '#3e6b3a', rogue: '#3a3a46', sorcerer: '#d9482b', warlock: '#6a3fa0', wizard: '#2f4f9a',
};

function classOpts(cls: string, sp: string, accent: string, base: Opts): Opts {
  const hairy = base.hair && base.hair !== 'none' && base.hair !== 'bald';
  const bearded = sp === 'dwarf';
  switch (cls) {
    case 'barbarian':
      return {
        outfit: 'bare', outfitColor: '#5a3a22', mantle: 'fur', mantleColor: '#8a6a4a', warpaint: accent, brows: 'angry', mouth: sp === 'dragonborn' ? undefined : 'snarl',
        held: 'greataxe', beads: '#efe6c8', ...(hairy && sp !== 'dwarf' && sp !== 'orc' && sp !== 'halfling' ? { hair: 'wild' as const } : {}),
        ...(sp === 'orc' ? { hair: 'mohawk' as const } : {}),
      };
    case 'bard':
      return { outfit: 'doublet', outfitColor: accent, trim: '#f2e2b0', hat: 'feather', hatColor: shade(accent, -0.4), plume: '#f4d35e', held: 'lute', brows: 'raised', mouth: sp === 'gnome' ? 'grin' : 'smile', earring: '#e2b84a' };
    case 'cleric':
      return { outfit: 'mail', metal: '#a8aeb5', trim: accent, hood: 'up', coif: true, holy: '#e9c24a', held: 'mace', fx: 'aura', glowColor: '#ffe9a0', brows: 'calm', mouth: base.mouth === 'grin' ? 'smile' : base.mouth };
    case 'druid':
      return { outfit: 'robe', outfitColor: '#7a6040', trim: shade(accent, 0.15), mantle: 'leaves', mantleColor: accent, crown: 'antlers', held: 'gnarled', fx: 'motes', glowColor: '#d8ff9a', brows: 'calm' };
    case 'fighter':
      return { outfit: 'mail', metal: '#9ea4ab', trim: accent, helmet: 'nasal', held: 'sword', held2: 'shield', heldColor: accent, brows: 'heavy', mouth: base.tusks ? 'neutral' : 'smirk' };
    case 'monk':
      return { outfit: 'gi', outfitColor: accent, trim: shade(accent, -0.4), headband: '#ece4cc', eyeStyle: sp === 'dragonborn' ? 'slit' : 'closed', mouth: 'smile', held: 'fist', beads: '#7a4a2a', brows: 'calm', ...(hairy && !bearded ? { hair: 'topknot' as const } : {}), ...(bearded ? { hair: 'bald' as const } : {}) };
    case 'paladin':
      return { outfit: 'plate', metal: '#d3d8de', trim: accent, cloak: accent, helmet: 'winged', held: 'sword', fx: 'halo', glowColor: '#ffe08a', holy: '#e9c24a', brows: 'calm', mouth: 'neutral' };
    case 'ranger':
      return { outfit: 'leather', outfitColor: '#6b4a2b', cloak: accent, hood: 'up', hoodColor: accent, held: 'bow', quiver: true, brows: 'calm', mouth: 'neutral' };
    case 'rogue': {
      const dark = mix(accent, '#1c1a1e', 0.5);
      return { outfit: 'leather', outfitColor: '#3a3230', hood: 'up', hoodColor: dark, cloak: dark, mask: '#26232a', held: 'dagger', held2: 'dagger', brows: 'sly' };
    }
    case 'sorcerer':
      return { outfit: 'robe', outfitColor: shade(accent, -0.25), trim: '#e9c24a', eyeStyle: 'glow', glowColor: mix(accent, '#ffe066', 0.55), held: 'flame', heldColor: accent, fx: 'sparkle', crown: 'circlet', crownColor: '#e2b84a', brows: 'raised', mouth: 'smirk' };
    case 'warlock':
      return { outfit: 'robe', outfitColor: '#2a2430', trim: accent, collar: 'high', collarColor: '#1e1a22', held: 'book', heldColor: '#3a2a4a', glowColor: '#9cff7a', fx: 'eldritch', brows: 'sly', mouth: 'smirk', eyeStyle: base.eyeStyle === 'solid' || base.eyeStyle === 'slit' ? base.eyeStyle : 'normal', eyes: '#7ad860' };
    case 'wizard':
      return {
        outfit: 'robe', outfitColor: accent, trim: '#e9c24a', hat: 'wizard', hatColor: accent, held: 'staff', heldColor: '#7fd8ff', brows: 'raised', mouth: 'smile',
        headY: (base.headY ?? 44) + 4, ...(sp === 'human' || sp === 'gnome' ? { beard: 'long' as const } : {}),
      };
  }
  return {};
}

/** A hero token for one species and class. `color` is the player's colour for cloak, robe or tabard. */
export function heroCreature(speciesId: string, classId: string, color?: string): CreatureDef {
  const sp = SPECIES[speciesId] ?? SPECIES.human;
  const spId = SPECIES[speciesId] ? speciesId : 'human';
  const cls = CLASS_NAMES[classId] ? classId : 'fighter';
  const accent = color ?? CLASS_COLORS[cls];
  return {
    id: `hero-${speciesId}-${classId}`,
    name: `${sp.name} ${CLASS_NAMES[cls]}`,
    family: 'hero',
    size: sp.size,
    tags: [speciesId, classId, sp.name.toLowerCase(), CLASS_NAMES[cls].toLowerCase(), 'hero', 'player', 'pc', 'adventurer'],
    c: { ...sp.c, accent },
    variants: sp.variants,
    draw: ({ g, c, f, seed }) => {
      const flag = sp.flagOpts ? sp.flagOpts(f) : {};
      const base = { ...sp.base, ...flag };
      const co = classOpts(cls, spId, c.accent ?? accent, base);
      const o: BustOpts = { ...base, ...co, skin: c.skin } as BustOpts;
      if (c.hair) o.hairColor = c.hair;
      if (c.eye && !co.eyes) o.eyes = c.eye;
      if (c.under) o.under = c.under;
      if (c.horn && !(co.hornColor)) o.hornColor = c.horn;
      if (c.marks) o.marks = c.marks;
      // dragonborn and dwarves keep their gear clear of snouts and beards
      if (spId === 'dragonborn' && o.mouth === 'snarl') o.mouth = undefined;
      drawBust(g, o, seed + 3);
    },
  };
}

const HEROES: CreatureDef[] = HERO_SPECIES.flatMap((s) => HERO_CLASSES.map((k) => heroCreature(s, k)));

// ------------------------------------------------------------------ NPCs and humanoid monsters

interface NpcSpec {
  id: string;
  name: string;
  family?: CreatureFamily;
  size?: CreatureSize;
  srd?: string;
  cr?: string;
  tags: string[];
  o: Opts;
  c: Colors;
  variants?: Variant[];
  /** Extra options switched on by a variant's flags. */
  flags?: (f: Record<string, number>) => Opts;
}

export function bustCreature(s: NpcSpec): CreatureDef {
  const def: CreatureDef = {
    id: s.id, name: s.name, family: s.family ?? 'humanoid', size: s.size ?? 'Medium', tags: s.tags, c: s.c, variants: s.variants,
    draw: ({ g, c, f, seed }) => {
      const o = { ...s.o, ...colorOpts(c), ...(s.flags ? s.flags(f) : {}) } as BustOpts;
      drawBust(g, o, seed);
    },
  };
  if (s.srd) def.srd = s.srd;
  if (s.cr) def.cr = s.cr;
  return def;
}

const SKINS: Variant[] = [
  { name: 'Fair', c: {} },
  { name: 'Olive', c: { skin: '#c8996e', hair: '#1e1814' } },
  { name: 'Brown', c: { skin: '#8a5a3c', hair: '#1a1414' } },
  { name: 'Deep', c: { skin: '#5e3a26', hair: '#2a2020' } },
];
const skinVars = (extra: Variant[] = []): Variant[] => [...SKINS, ...extra];

const NPCS: NpcSpec[] = [
  {
    id: 'commoner', name: 'Commoner', cr: '0', tags: ['villager', 'peasant', 'farmer', 'townsfolk', 'npc'],
    o: { outfit: 'tunic', hat: 'cap', mouth: 'smile', hair: 'short', beard: 'stubble' },
    c: { skin: '#e8b894', hair: '#6a4a2a', outfit: '#8a6a44', trim: '#c8b088', hat: '#6a5a3a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Farmer, straw hat', c: { outfit: '#6a7a4a' }, f: { straw: 1 } }]),
    flags: (f) => (f.straw ? { hat: 'straw', hatColor: '#e2c46a', beard: 'none' } : {}),
  },
  {
    id: 'noble', name: 'Noble', cr: '1/8', tags: ['lord', 'lady', 'aristocrat', 'court', 'rich', 'npc'],
    o: { outfit: 'doublet', collar: 'ruff', crown: 'circlet', hair: 'long', mouth: 'smirk', brows: 'raised', beads: '#e2b84a', face: 'long' },
    c: { skin: '#f0d0b4', hair: '#c8a050', outfit: '#5d3a78', trim: '#e2b84a', eye: '#4a6a8a' },
    variants: [
      { name: 'Purple', c: {} }, { name: 'Crimson', c: { outfit: '#8a1f2a', hair: '#2a1a14', skin: '#c8996e' } },
      { name: 'Emerald', c: { outfit: '#2a6a4a', hair: '#e8e0d0', skin: '#e8c0a0' } }, { name: 'Sapphire', c: { outfit: '#2a4a8a', hair: '#1a1414', skin: '#6e4630' } },
    ],
  },
  {
    id: 'merchant', name: 'Merchant', tags: ['trader', 'shopkeeper', 'vendor', 'market', 'npc'],
    o: { outfit: 'vest', hat: 'turban', face: 'round', beard: 'short', mouth: 'grin', held: 'purse', brows: 'raised', headW: 20.5 },
    c: { skin: '#c8996e', hair: '#2a2020', outfit: '#8a3a5a', trim: '#f0e6cc', hat: '#e8c46a', plume: '#3a8a6a', eye: '#4a3020' },
    variants: skinVars([{ name: 'Blue turban', c: { hat: '#3a6ab0', outfit: '#6a4a2a' } }]),
  },
  {
    id: 'innkeeper', name: 'Innkeeper', tags: ['barkeep', 'tavern', 'host', 'cook', 'npc'],
    o: { outfit: 'apron', face: 'round', hair: 'tonsure', beard: 'mustache', mouth: 'smile', held: 'mug', headW: 21, shoulders: 1.12, blush: true, brows: 'raised' },
    c: { skin: '#eab89a', hair: '#7a4a2a', outfit: '#7a5a8a', trim: '#efe8d6', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Grey hair', c: { hair: '#c8c4bc' } }]),
  },
  {
    id: 'guard', name: 'Guard', srd: 'guard', cr: '1/8', tags: ['watch', 'soldier', 'sentry', 'town', 'city', 'npc'],
    o: { outfit: 'mail', helmet: 'kettle', held: 'spear', mouth: 'frown', brows: 'heavy', beard: 'stubble' },
    c: { skin: '#e8b894', hair: '#5a3a22', metal: '#9ea4ab', trim: '#2f5d8a', held: '#2f5d8a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Red livery', c: { trim: '#a3312c', held: '#a3312c' } }, { name: 'Green livery', c: { trim: '#3e6b3a', held: '#3e6b3a' } }]),
  },
  {
    id: 'bandit', name: 'Bandit', srd: 'bandit', cr: '1/8', tags: ['outlaw', 'thief', 'brigand', 'highwayman', 'road'],
    o: { outfit: 'leather', bandana: '#a3312c', beard: 'stubble', mouth: 'smirk', brows: 'sly', held: 'scimitar', scar: true },
    c: { skin: '#e2b08c', hair: '#3a2a1a', outfit: '#6b4a2b', bandana: '#a3312c', eye: '#5a3a24' },
    variants: skinVars([{ name: 'Black scarf', c: { bandana: '#2b2b30' } }, { name: 'Masked', c: { mask: '#5a3a2a' } }]),
  },
  {
    id: 'bandit-captain', name: 'Bandit Captain', srd: 'banditCaptain', cr: '2', tags: ['outlaw', 'leader', 'brigand', 'boss', 'pirate'],
    o: { outfit: 'coat', hat: 'wide', plume: '#a3312c', eyepatch: true, beard: 'goatee', mouth: 'smirk', brows: 'sly', held: 'scimitar', held2: 'dagger', earring: '#e2b84a' },
    c: { skin: '#d8a882', hair: '#1e1814', outfit: '#4a2a22', trim: '#e8dcc0', hat: '#2b2b30', eye: '#5a3a24' },
    variants: skinVars(),
  },
  {
    id: 'thug', name: 'Thug', srd: 'thug', cr: '1/2', tags: ['bruiser', 'enforcer', 'brute', 'gang', 'street'],
    o: { outfit: 'vest', hair: 'bald', face: 'square', beard: 'stubble', brows: 'angry', mouth: 'frown', scar: true, held: 'club', shoulders: 1.22, headW: 20, nose: 'flat' },
    c: { skin: '#e2b08c', hair: '#3a2a1a', outfit: '#4a3a2a', trim: '#b8ac94', eye: '#4a3a2a' },
    variants: skinVars(),
  },
  {
    id: 'cultist', name: 'Cultist', srd: 'cultist', cr: '1/8', tags: ['cult', 'zealot', 'dark', 'ritual', 'robe'],
    o: { outfit: 'robe', hood: 'up', brows: 'worried', mouth: 'neutral', held: 'sickle', eyeStyle: 'narrow' },
    c: { skin: '#d8b8a0', hair: '#3a2a1a', outfit: '#7a1f24', trim: '#2a1416', hood: '#7a1f24', eye: '#3a2a1a' },
    variants: [{ name: 'Crimson', c: {} }, { name: 'Black', c: { outfit: '#26232a', hood: '#26232a', trim: '#8a1f2a' } }, { name: 'Green', c: { outfit: '#2a4a2a', hood: '#2a4a2a', trim: '#c9a24a' } }],
  },
  {
    id: 'cult-fanatic', name: 'Cult Fanatic', cr: '2', tags: ['cult', 'leader', 'zealot', 'priest', 'dark'],
    o: { outfit: 'robe', hood: 'up', eyeStyle: 'glow', glowColor: '#ff4a3a', holy: '#8a2a2a', held: 'flame', heldColor: '#ff5a3a', mouth: 'grin', brows: 'angry', fx: 'aura' },
    c: { skin: '#d8b8a0', outfit: '#1e1a1e', trim: '#a3312c', hood: '#1e1a1e', glow: '#ff4a3a' },
    variants: [{ name: 'Red fire', c: {} }, { name: 'Green fire', c: { glow: '#7aff5a', trim: '#3a8a3a' } }, { name: 'Purple fire', c: { glow: '#c07aff', trim: '#6a3fa0' } }],
  },
  {
    id: 'acolyte', name: 'Acolyte', cr: '1/4', tags: ['temple', 'novice', 'priest', 'monk', 'holy'],
    o: { outfit: 'robe', hair: 'tonsure', holy: '#e2b84a', held: 'book', heldColor: '#8a2a2a', mouth: 'smile', brows: 'calm' },
    c: { skin: '#eab89a', hair: '#6a4a2a', outfit: '#8a6a4a', trim: '#e8dcc0', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'White robe', c: { outfit: '#e6e0d2', trim: '#c9a24a' } }]),
  },
  {
    id: 'priest', name: 'Priest', cr: '2', tags: ['temple', 'cleric', 'holy', 'healer', 'church'],
    o: { outfit: 'robe', hat: 'mitre', holy: '#e9c24a', held: 'staff', heldColor: '#ffe08a', beard: 'short', mouth: 'smile', brows: 'calm', fx: 'aura', glowColor: '#fff0b0' },
    c: { skin: '#e8b894', hair: '#bdb8ae', outfit: '#efe8da', trim: '#c9a24a', hat: '#efe8da', plume: '#c9a24a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Crimson vestments', c: { outfit: '#8a1f2a', hat: '#8a1f2a' } }]),
  },
  {
    id: 'mage', name: 'Mage', cr: '6', tags: ['wizard', 'spellcaster', 'arcane', 'sorcerer'],
    o: { outfit: 'robe', hood: 'down', held: 'orb', heldColor: '#7fd8ff', glowColor: '#7fd8ff', beard: 'goatee', hair: 'slick', brows: 'raised', mouth: 'smirk', fx: 'sparkle', crown: 'circlet' },
    c: { skin: '#e8c0a0', hair: '#2a2020', outfit: '#2a3a7a', trim: '#c9a24a', hood: '#1e2a5a', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Red robes', c: { outfit: '#7a1f24', hood: '#5a1418', glow: '#ff7a3a' } }]),
  },
  {
    id: 'archmage', name: 'Archmage', cr: '12', tags: ['wizard', 'spellcaster', 'arcane', 'boss', 'elder'],
    o: { outfit: 'robe', collar: 'high', hat: 'wizard', beard: 'long', hair: 'long', held: 'staff', heldColor: '#b07cff', glowColor: '#d0a8ff', fx: 'sparkle', fx2: 'aura', brows: 'heavy', headY: 48, eyeStyle: 'glow' },
    c: { skin: '#e8c0a0', hair: '#efefef', outfit: '#3a2a6a', trim: '#e2b84a', hat: '#3a2a6a', collar: '#241a44', eye: '#b07cff' },
    variants: [{ name: 'Violet', c: {} }, { name: 'Midnight', c: { outfit: '#14203a', hat: '#14203a', collar: '#0c1424', glow: '#7fd8ff', held: '#7fd8ff' } }, { name: 'Crimson', c: { outfit: '#6a1418', hat: '#6a1418', collar: '#3a0a0c', glow: '#ffb05a', held: '#ff7a3a', skin: '#8a5a3c' } }],
  },
  {
    id: 'knight', name: 'Knight', cr: '3', tags: ['soldier', 'noble', 'armor', 'cavalier', 'castle'],
    o: { outfit: 'plate', helmet: 'great', cloak: '#2f5d8a', held: 'sword', held2: 'shield', heldColor: '#2f5d8a', plume: '#2f5d8a' },
    c: { skin: '#e8b894', metal: '#c9ced3', cloak: '#2f5d8a', held: '#2f5d8a', plume: '#2f5d8a', trim: '#e2b84a' },
    variants: [{ name: 'Blue', c: {} }, { name: 'Red', c: { cloak: '#a3312c', held: '#a3312c', plume: '#a3312c' } }, { name: 'Black', c: { metal: '#4a4e54', cloak: '#1e1c22', held: '#1e1c22', plume: '#e6e0d2' } }, { name: 'Gold', c: { metal: '#d9b44a', cloak: '#f1ece0', held: '#f1ece0', plume: '#a3312c' } }],
  },
  {
    id: 'veteran', name: 'Veteran', cr: '3', tags: ['soldier', 'warrior', 'mercenary', 'old', 'sellsword'],
    o: { outfit: 'mail', hair: 'short', beard: 'short', scar: true, brows: 'heavy', mouth: 'frown', held: 'sword', face: 'square' },
    c: { skin: '#d8a882', hair: '#9a948a', metal: '#8e949b', trim: '#6a4a2a', eye: '#4a6a8a' },
    variants: skinVars(),
  },
  {
    id: 'scout', name: 'Scout', cr: '1/2', tags: ['ranger', 'tracker', 'hunter', 'archer', 'forest'],
    o: { outfit: 'leather', hood: 'down', cloak: '#3e6b3a', held: 'bow', quiver: true, hair: 'ponytail', mouth: 'neutral', brows: 'calm' },
    c: { skin: '#e2b08c', hair: '#6a4a2a', outfit: '#6b4a2b', cloak: '#3e6b3a', hood: '#3e6b3a', eye: '#3f8a5a' },
    variants: skinVars([{ name: 'Brown cloak', c: { cloak: '#7a5638', hood: '#7a5638' } }]),
  },
  {
    id: 'spy', name: 'Spy', cr: '1', tags: ['agent', 'informant', 'rogue', 'city', 'intrigue'],
    o: { outfit: 'coat', hat: 'wide', warpaint: '#1e1c22', held: 'scroll', mouth: 'smirk', brows: 'sly', hair: 'slick' },
    c: { skin: '#e8c0a0', hair: '#1e1814', outfit: '#2b2b30', trim: '#cfc8b8', hat: '#26232a', plume: '#6a3fa0', eye: '#4a6a8a' },
    variants: skinVars(),
  },
  {
    id: 'assassin', name: 'Assassin', cr: '8', tags: ['killer', 'rogue', 'shadow', 'poison', 'guild'],
    o: { outfit: 'leather', hood: 'up', mask: '#141216', held: 'dagger', held2: 'dagger', eyeStyle: 'narrow', brows: 'angry', cloak: '#141216' },
    c: { skin: '#d8b090', outfit: '#1e1c22', hood: '#1a181c', cloak: '#1a181c', eye: '#c0303a' },
    variants: [{ name: 'Black', c: {} }, { name: 'Crimson sash', c: { mask: '#7a1418' } }, { name: 'Grey', c: { hood: '#4a4a52', cloak: '#4a4a52', mask: '#3a3a42' } }],
  },
  {
    id: 'berserker', name: 'Berserker', cr: '2', tags: ['barbarian', 'raider', 'warrior', 'rage', 'north'],
    o: { outfit: 'bare', outfitColor: '#5a3a22', mantle: 'fur', helmet: 'horned', beard: 'braided', warpaint: '#2f5d8a', brows: 'angry', mouth: 'snarl', held: 'greataxe', shoulders: 1.2 },
    c: { skin: '#e8b894', hair: '#c8782a', mantle: '#6a5038', metal: '#8e949b', warpaint: '#2f5d8a', eye: '#4a8ab8' },
    variants: skinVars([{ name: 'Red paint', c: { warpaint: '#a3312c' } }]),
  },
  {
    id: 'gladiator', name: 'Gladiator', cr: '5', tags: ['arena', 'fighter', 'champion', 'warrior'],
    o: { outfit: 'bare', outfitColor: '#7a5032', helmet: 'crest', plume: '#a3312c', held: 'trident', held2: 'round-shield', brows: 'heavy', mouth: 'neutral', shoulders: 1.18, beard: 'stubble' },
    c: { skin: '#c8996e', hair: '#1e1814', metal: '#c9a24a', plume: '#a3312c', held: '#a8743c', eye: '#3a2a1a' },
    variants: skinVars(),
  },
  {
    id: 'druid', name: 'Druid', cr: '2', tags: ['nature', 'circle', 'forest', 'shaman', 'hermit'],
    o: { outfit: 'robe', mantle: 'leaves', crown: 'wreath', beard: 'long', hair: 'long', held: 'gnarled', brows: 'calm', mouth: 'smile', fx: 'motes', glowColor: '#d8ff9a' },
    c: { skin: '#e2b08c', hair: '#d8d4c8', outfit: '#6a5a3a', trim: '#8aa04a', mantle: '#5f8a3a', eye: '#3f8a5a' },
    variants: skinVars([{ name: 'Autumn', c: { mantle: '#c8782a', trim: '#a35a2a' } }]),
  },
  {
    id: 'tribal-warrior', name: 'Tribal Warrior', cr: '1/8', tags: ['hunter', 'warrior', 'spear', 'wilds', 'clan'],
    o: { outfit: 'bare', outfitColor: '#7a5032', mantle: 'feathers', warpaint: '#c8602a', beads: '#efe6c8', held: 'spear', hair: 'braids', brows: 'heavy', mouth: 'neutral' },
    c: { skin: '#a8724c', hair: '#1e1814', mantle: '#8a4a2a', warpaint: '#c8602a', eye: '#3a2a1a' },
    variants: skinVars([{ name: 'White paint', c: { warpaint: '#e8e0cc' } }]),
  },
  {
    id: 'pirate', name: 'Pirate', tags: ['buccaneer', 'sea', 'ship', 'corsair', 'raider'],
    o: { outfit: 'coat', hat: 'tricorn', eyepatch: true, beard: 'full', earring: '#e2b84a', held: 'scimitar', mouth: 'grin', brows: 'sly' },
    c: { skin: '#d8a882', hair: '#2a1a14', outfit: '#7a1f24', trim: '#efe8d6', hat: '#1e1c22', eye: '#5a3a24' },
    variants: skinVars([{ name: 'Blue coat', c: { outfit: '#1e3a6a' } }]),
  },
  {
    id: 'sailor', name: 'Sailor', tags: ['sea', 'ship', 'deckhand', 'dock', 'crew'],
    o: { outfit: 'stripes', hat: 'beanie', beard: 'short', mouth: 'smile', held: 'lantern' },
    c: { skin: '#e2b08c', hair: '#7a4a2a', outfit: '#2a4a7a', trim: '#f1ece0', hat: '#a3312c', eye: '#4a6a8a' },
    variants: skinVars([{ name: 'Red stripes', c: { outfit: '#a3312c', hat: '#2a4a7a' } }]),
  },
  {
    id: 'kobold', name: 'Kobold', srd: 'kobold', cr: '1/8', size: 'Small', tags: ['reptile', 'dragon', 'trap', 'cave', 'mine', 'small'],
    o: { snout: 'reptile', horns: 'nubs', ears: 'none', hair: 'none', eyeStyle: 'slit', outfit: 'rags', held: 'spear', shoulders: 0.82, headW: 20, headH: 22, headY: 46 },
    c: { skin: '#b0603a', under: '#e8b88a', eye: '#ffd166', horn: '#efe2c0', outfit: '#6a5a44' },
    variants: [{ name: 'Rust', c: {} }, { name: 'Blue', c: { skin: '#4a6a9a', under: '#b8cce0' } }, { name: 'Green', c: { skin: '#5a7a3a', under: '#cfd89a' } }, { name: 'White', c: { skin: '#cfcac0', under: '#f4f0e8', eye: '#4cc9f0' } }],
  },
  {
    id: 'goblin', name: 'Goblin', srd: 'goblin', cr: '1/4', size: 'Small', tags: ['goblinoid', 'raider', 'cave', 'small', 'sneaky'],
    o: { ears: 'goblin', earsOver: true, nose: 'long', mouth: 'teeth', eyeStyle: 'big', brows: 'angry', hair: 'stringy', outfit: 'leather', held: 'scimitar', shoulders: 0.8, headW: 19, headH: 20, headY: 48 },
    c: { skin: '#8aa84a', hair: '#2a2420', eye: '#f2c14e', outfit: '#5a4030' },
    variants: [{ name: 'Green', c: {} }, { name: 'Yellow', c: { skin: '#c8b04a', eye: '#c0303a' } }, { name: 'Grey-green', c: { skin: '#7a8a6a' } }, { name: 'Hooded', c: { hood: '#5a4030' }, f: { hood: 1 } }],
    flags: (f) => (f.hood ? { hood: 'up' } : {}),
  },
  {
    id: 'goblin-boss', name: 'Goblin Boss', cr: '1', size: 'Small', tags: ['goblinoid', 'leader', 'chief', 'cave', 'small'],
    o: { ears: 'goblin', nose: 'long', mouth: 'grin', eyeStyle: 'big', brows: 'angry', hair: 'none', crown: 'bones', mantle: 'fur', outfit: 'mail', held: 'scimitar', held2: 'round-shield', shoulders: 0.85, headW: 19, headH: 20, headY: 48, scar: true },
    c: { skin: '#7a9a3a', eye: '#ff6a3a', mantle: '#4a3a2a', metal: '#7a7e84', held: '#6a4a2a' },
    variants: [{ name: 'Green', c: {} }, { name: 'Yellow', c: { skin: '#c8a83a' } }, { name: 'Dark', c: { skin: '#4a6a3a', mantle: '#2a2420' } }],
  },
  {
    id: 'hobgoblin', name: 'Hobgoblin', srd: 'hobgoblin', cr: '1/2', tags: ['goblinoid', 'soldier', 'legion', 'warrior', 'disciplined'],
    o: { ears: 'long', nose: 'flat', helmet: 'crest', outfit: 'scale', held: 'sword', held2: 'shield', brows: 'angry', mouth: 'frown', face: 'square', hair: 'short', shoulders: 1.08 },
    c: { skin: '#c8603a', hair: '#1e1814', eye: '#ffd166', metal: '#6a6e74', outfit: '#6a3a2a', trim: '#8a5a3a', plume: '#2b2b30', held: '#8a1f2a' },
    variants: [{ name: 'Red-orange', c: {} }, { name: 'Dusky', c: { skin: '#9a5a4a' } }, { name: 'Grey', c: { skin: '#8a7a74', held: '#2f5d8a' } }],
  },
  {
    id: 'bugbear', name: 'Bugbear', srd: 'bugbear', cr: '1', tags: ['goblinoid', 'brute', 'ambush', 'hairy', 'cave'],
    o: { ears: 'bear', hair: 'shaggy', nose: 'flat', mouth: 'snarl', eyeStyle: 'beady', brows: 'heavy', face: 'wide', outfit: 'leather', mantle: 'fur', held: 'morningstar', shoulders: 1.25, headW: 21, headH: 23 },
    c: { skin: '#a8724a', hair: '#6a4024', mantle: '#4a3020', outfit: '#4a3a2a', eye: '#111111' },
    variants: [{ name: 'Brown', c: {} }, { name: 'Tawny', c: { skin: '#c89a5a', hair: '#9a6a34' } }, { name: 'Dark', c: { skin: '#6a4a34', hair: '#2a2018' } }],
  },
  {
    id: 'orc', name: 'Orc', srd: 'orc', cr: '1/2', tags: ['raider', 'warrior', 'tusks', 'horde', 'savage'],
    o: { face: 'square', ears: 'long', tusks: 'big', nose: 'flat', brows: 'angry', hair: 'mohawk', mouth: 'snarl', outfit: 'leather', mantle: 'fur', held: 'greataxe', shoulders: 1.2, warpaint: '#2a2420' },
    c: { skin: '#6a8a4a', hair: '#1e1a18', eye: '#e84a2a', outfit: '#4a3a2a', mantle: '#5a4a3a', warpaint: '#1e1a18' },
    variants: [{ name: 'Green', c: {} }, { name: 'Grey', c: { skin: '#7c8084' } }, { name: 'Red paint', c: { warpaint: '#a3312c' } }, { name: 'Pale', c: { skin: '#a8b08a', hair: '#e6e0d2' } }],
  },
  {
    id: 'gnoll', name: 'Gnoll', srd: 'gnoll', cr: '1/2', tags: ['hyena', 'raider', 'beastfolk', 'savage', 'desert'],
    o: { snout: 'hyena', ears: 'bear', spots: '#4a3020', hair: 'mohawk', eyeStyle: 'glow', glowColor: '#ffd166', outfit: 'leather', held: 'spear', beads: '#efe6c8', shoulders: 1.1 },
    c: { skin: '#c8a06a', under: '#e8d4a8', hair: '#3a2a1a', spots: '#4a3020', outfit: '#5a3a24' },
    variants: [{ name: 'Tawny', c: {} }, { name: 'Grey', c: { skin: '#a09a8a', under: '#d8d4c8', spots: '#3a3630' } }, { name: 'Dark', c: { skin: '#8a6a4a', under: '#c8a882' } }],
  },
  {
    id: 'lizardfolk', name: 'Lizardfolk', cr: '1/2', tags: ['reptile', 'swamp', 'marsh', 'hunter', 'scales'],
    o: { snout: 'reptile', ears: 'fin', hair: 'fin', eyeStyle: 'slit', outfit: 'bare', outfitColor: '#6b4a2b', held: 'spear', beads: '#efe6c8', headW: 20, headH: 24, shoulders: 1.1 },
    c: { skin: '#4f7a3a', under: '#d4d890', hair: '#c8603a', eye: '#ffd166' },
    variants: [{ name: 'Green', c: {} }, { name: 'Brown', c: { skin: '#7a6a3a', under: '#e0cfa0', hair: '#4f7a3a' } }, { name: 'Teal', c: { skin: '#2a7a7a', under: '#bfe0d0', hair: '#e8c44a' } }],
  },
  {
    id: 'merfolk', name: 'Merfolk', cr: '1/8', tags: ['sea', 'ocean', 'water', 'mermaid', 'merman', 'coast'],
    o: { ears: 'fin', hair: 'flowing', outfit: 'scale', crown: 'shells', held: 'trident', mouth: 'smile', fx: 'drips', beads: '#f2b8a8' },
    c: { skin: '#9ccac0', hair: '#2a6a7a', outfit: '#2a8a8a', trim: '#7ad0c0', eye: '#2a4a8a', held: '#c9b25a' },
    variants: [{ name: 'Sea green', c: {} }, { name: 'Coral', c: { skin: '#e8c0a0', hair: '#c8482a', outfit: '#c8604a', trim: '#f2a88a' } }, { name: 'Deep blue', c: { skin: '#6a8ab8', hair: '#e8e0f0', outfit: '#2a4a8a', trim: '#8ab0e0' } }],
  },
  {
    id: 'sahuagin', name: 'Sahuagin', cr: '1/2', tags: ['sea', 'fish', 'shark', 'devil', 'raider', 'ocean'],
    o: { face: 'wide', ears: 'fin', hair: 'fin', mouth: 'maw', eyeStyle: 'blank', nose: 'none', scales: true, outfit: 'scale', held: 'trident', brows: 'angry', headW: 21, headH: 23, shoulders: 1.1, fx: 'drips' },
    c: { skin: '#3a6a6a', under: '#9ac0b0', hair: '#2a4a5a', outfit: '#2a4a4a', trim: '#5a8a8a', eye: '#111' },
    variants: [{ name: 'Green', c: {} }, { name: 'Blue', c: { skin: '#2a4a7a', hair: '#1a2a4a', outfit: '#1a3a5a' } }, { name: 'Black', c: { skin: '#2a2e34', hair: '#14181c', outfit: '#20242a' } }],
  },
  {
    id: 'werewolf', name: 'Werewolf', cr: '3', tags: ['lycanthrope', 'shapechanger', 'wolf', 'curse', 'moon'],
    o: { hair: 'wild', beard: 'stubble', eyeStyle: 'glow', glowColor: '#ffd166', mouth: 'fangs', brows: 'heavy', outfit: 'rags', scar: true },
    c: { skin: '#e2b08c', hair: '#5a4030', outfit: '#6a5a44' },
    variants: [
      { name: 'Human form', c: {} },
      { name: 'Hybrid form', c: { skin: '#6a5a4a', under: '#b8ac98' }, f: { hybrid: 1 } },
      { name: 'Hybrid, grey', c: { skin: '#8a8580', under: '#d0ccc4' }, f: { hybrid: 1 } },
      { name: 'Hybrid, black', c: { skin: '#2f2c2a', under: '#5b5550', glow: '#ff5a3a' }, f: { hybrid: 1 } },
    ],
    flags: (f) => (f.hybrid ? { snout: 'canine', ears: 'canine', hair: 'none', outfit: 'fur', trim: '#6a5a44', held: 'claws', shoulders: 1.2, headW: 21, headH: 24 } : {}),
  },
  {
    id: 'wererat', name: 'Wererat', cr: '2', tags: ['lycanthrope', 'shapechanger', 'rat', 'sewer', 'curse'],
    o: { hair: 'stringy', hood: 'up', eyeStyle: 'beady', mouth: 'smirk', brows: 'sly', face: 'narrow', nose: 'long', outfit: 'rags', held: 'dagger' },
    c: { skin: '#d8b8a0', hair: '#4a3a30', outfit: '#5a5048', hood: '#4a4038' },
    variants: [
      { name: 'Human form', c: {} },
      { name: 'Hybrid form', c: { skin: '#7a6a5a', under: '#c8b8a8' }, f: { hybrid: 1 } },
      { name: 'Hybrid, black', c: { skin: '#3a3432', under: '#7a6e66' }, f: { hybrid: 1 } },
    ],
    flags: (f) => (f.hybrid ? { snout: 'rat', ears: 'rat', hood: undefined, hair: 'none', held: 'claws', eyeStyle: 'beady' } : {}),
  },
  {
    id: 'werebear', name: 'Werebear', cr: '5', tags: ['lycanthrope', 'shapechanger', 'bear', 'forest', 'curse'],
    o: { hair: 'wild', beard: 'full', eyeStyle: 'normal', mouth: 'neutral', brows: 'heavy', outfit: 'fur', shoulders: 1.15 },
    c: { skin: '#d8a882', hair: '#6a4a2e', outfit: '#6a5038' },
    variants: [
      { name: 'Human form', c: {} },
      { name: 'Hybrid form', c: { skin: '#6b4a2e', under: '#a98262' }, f: { hybrid: 1 } },
      { name: 'Hybrid, black', c: { skin: '#2c2624', under: '#7a6656' }, f: { hybrid: 1 } },
    ],
    flags: (f) => (f.hybrid ? { snout: 'canine', ears: 'bear', hair: 'none', beard: undefined, outfit: 'fur', held: 'claws', shoulders: 1.3, headW: 23, headH: 23 } : {}),
  },
  {
    id: 'wereboar', name: 'Wereboar', cr: '4', tags: ['lycanthrope', 'shapechanger', 'boar', 'pig', 'curse'],
    o: { hair: 'short', beard: 'stubble', eyeStyle: 'beady', mouth: 'frown', brows: 'heavy', outfit: 'leather', held: 'axe', shoulders: 1.12 },
    c: { skin: '#d8a88a', hair: '#3a2a20', outfit: '#5a4030' },
    variants: [
      { name: 'Human form', c: {} },
      { name: 'Hybrid form', c: { skin: '#5a4234', under: '#b88a7a' }, f: { hybrid: 1 } },
    ],
    flags: (f) => (f.hybrid ? { snout: 'hyena', ears: 'small', hair: 'mohawk', mouth: 'fangs', held: 'axe', shoulders: 1.25 } : {}),
  },
  {
    id: 'weretiger', name: 'Weretiger', cr: '4', tags: ['lycanthrope', 'shapechanger', 'tiger', 'cat', 'jungle', 'curse'],
    o: { hair: 'long', eyeStyle: 'glow', glowColor: '#f2c14e', mouth: 'smirk', brows: 'sly', outfit: 'tunic', held: 'scimitar' },
    c: { skin: '#c8906a', hair: '#2a1e18', outfit: '#8a4a2a', trim: '#e0b040' },
    variants: [
      { name: 'Human form', c: {} },
      { name: 'Hybrid form', c: { skin: '#d9822b', under: '#f6ecde' }, f: { hybrid: 1 } },
      { name: 'Hybrid, white', c: { skin: '#ebe6dc', under: '#ffffff', glow: '#6ab0e0' }, f: { hybrid: 1 } },
    ],
    flags: (f) => (f.hybrid ? { snout: 'canine', ears: 'small', hair: 'none', spots: '#1e140e', mouth: 'fangs', held: 'claws', shoulders: 1.15 } : {}),
  },
  {
    id: 'doppelganger', name: 'Doppelganger', family: 'monstrosity', cr: '3', tags: ['shapechanger', 'mimic', 'impostor', 'spy', 'infiltrator'],
    o: { face: 'long', hair: 'none', ears: 'none', eyeStyle: 'blank', nose: 'none', mouth: 'neutral', brows: 'none', outfit: 'tunic', headW: 18, headH: 25 },
    c: { skin: '#b8b8c0', outfit: '#6a6a74', trim: '#9a9aa4' },
    variants: [
      { name: 'True form', c: {} }, { name: 'Bluish', c: { skin: '#9aa4b8' } },
      { name: 'Half shifted', c: { hair: '#5a3a22', outfit: '#8a6a44' }, f: { half: 1 } },
    ],
    flags: (f) => (f.half ? { hair: 'short', eyeStyle: 'blank', mouth: 'smirk', brows: 'raised' } : {}),
  },
];

export const PEOPLE_CREATURES: CreatureDef[] = [...HEROES, ...NPCS.map(bustCreature)];
