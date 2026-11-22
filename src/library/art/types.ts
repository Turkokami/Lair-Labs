// Shared types for Lair Labs' own code-drawn art: map objects and creature tokens.
// Everything here is original work drawn with the Canvas 2D API. No outside art.

/** A 2D context. In the browser it is CanvasRenderingContext2D; in the art checker it is @napi-rs/canvas. */
export type G = CanvasRenderingContext2D;

/** Colours an object or creature reads while drawing. Variants override some of them. */
export type Colors = Record<string, string>;

export interface Variant {
  /** Shown in the picker, e.g. "Oak", "Iron", "Red cloth". */
  name: string;
  /** Colour keys this variant overrides. */
  c: Colors;
  /** Optional free flags the draw function can read, e.g. { open: 1 }. */
  f?: Record<string, number>;
}

export interface DrawArgs {
  g: G;
  /** Box width and height in art units. 1 square = 100 units. The box starts at 0,0. */
  w: number;
  h: number;
  /** Merged colours: the object's defaults with the chosen variant on top. */
  c: Colors;
  /** Merged flags from the chosen variant. */
  f: Record<string, number>;
  /** A stable seed for this placed object, so random detail does not jump around. */
  seed: number;
}

export type ObjCategory =
  | 'furniture' | 'storage' | 'light' | 'treasure' | 'trap' | 'hazard' | 'nature' | 'terrain' | 'structure'
  | 'religious' | 'arcane' | 'kitchen' | 'workshop' | 'decor' | 'vehicle' | 'gm';

export const CATEGORY_LABELS: Record<ObjCategory, string> = {
  furniture: 'Furniture', storage: 'Storage', light: 'Light', treasure: 'Treasure', trap: 'Traps', hazard: 'Hazards',
  nature: 'Nature', terrain: 'Terrain', structure: 'Structure', religious: 'Religious', arcane: 'Arcane', kitchen: 'Kitchen & food',
  workshop: 'Workshop', decor: 'Decor', vehicle: 'Vehicles & ships', gm: 'GM markers',
};

/** Theme sets the GM can filter by. An object can be in several. */
export const SETS = ['dungeon', 'crypt', 'cave', 'forest', 'town', 'tavern', 'temple', 'castle', 'ship', 'camp', 'wizard', 'mine', 'swamp', 'desert', 'winter', 'sewer', 'farm', 'market'] as const;
export type SetId = (typeof SETS)[number];
export const SET_LABELS: Record<SetId, string> = {
  dungeon: 'Dungeon', crypt: 'Crypt', cave: 'Cave', forest: 'Forest', town: 'Town', tavern: 'Tavern', temple: 'Temple', castle: 'Castle',
  ship: 'Ship & dock', camp: 'Camp', wizard: 'Wizard', mine: 'Mine', swamp: 'Swamp', desert: 'Desert', winter: 'Winter', sewer: 'Sewer',
  farm: 'Farm', market: 'Market',
};

export interface LightDef { bright: number; dim: number; color: string; } // feet

export interface ObjDef {
  id: string;
  name: string;
  cat: ObjCategory;
  sets: SetId[];
  /** Extra search words. */
  tags?: string[];
  /** Size in squares (5 ft). */
  w: number;
  h: number;
  /** floor = drawn under everything (rugs, stains, circles); props = normal; overhead = above tokens (tree canopies, hanging things). */
  layer?: 'floor' | 'props' | 'overhead';
  blocksMovement?: boolean;
  blocksSight?: boolean;
  /** Buildings: the whole footprint blocks sight, not just the middle square of a big object. */
  solid?: boolean;
  /** Difficult terrain where it stands. */
  difficult?: boolean;
  light?: LightDef;
  /** Players never see it (traps, triggers, markers) unless the GM reveals it. */
  gmOnly?: boolean;
  /** Default colours. */
  c: Colors;
  variants?: Variant[];
  /** Short description for the GM. */
  desc?: string;
  /** Turn off the drop shadow (flat floor things). */
  flat?: boolean;
  draw: (d: DrawArgs) => void;
}

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type CreatureFamily =
  | 'hero' | 'humanoid' | 'undead' | 'fey' | 'dragon' | 'beast' | 'monstrosity' | 'giant' | 'fiend' | 'celestial'
  | 'elemental' | 'construct' | 'ooze' | 'plant' | 'aberration';

export const FAMILY_LABELS: Record<CreatureFamily, string> = {
  hero: 'Heroes', humanoid: 'People', undead: 'Undead', fey: 'Fey', dragon: 'Dragons', beast: 'Beasts', monstrosity: 'Monstrosities',
  giant: 'Giants', fiend: 'Fiends', celestial: 'Celestials', elemental: 'Elementals', construct: 'Constructs', ooze: 'Oozes',
  plant: 'Plants', aberration: 'Aberrations',
};

/** Ring colour around a token, by family. */
export const FAMILY_RING: Record<CreatureFamily, string> = {
  hero: '#e9c46a', humanoid: '#9aa5b1', undead: '#8bd3a0', fey: '#f2a7d8', dragon: '#e76f51', beast: '#a98467', monstrosity: '#c08552',
  giant: '#b5838d', fiend: '#d62828', celestial: '#ffe8a3', elemental: '#4cc9f0', construct: '#adb5bd', ooze: '#90be6d', plant: '#52b788',
  aberration: '#9d4edd',
};

export interface CreatureDef {
  id: string;
  name: string;
  family: CreatureFamily;
  size: CreatureSize;
  tags?: string[];
  /** Id in src/rules/monsters.ts when we have its stat block. */
  srd?: string;
  /** Challenge rating shown in the browser, e.g. "1/4". Optional. */
  cr?: string;
  c: Colors;
  variants?: Variant[];
  /**
   * Draw the creature's portrait in a 100 x 100 box (w = h = 100). The renderer clips it to a circle of radius 50
   * centred at 50,50, paints a background behind it and draws the ring on top, so keep the important part inside
   * the circle and let shoulders or wings run off the edge.
   */
  draw: (d: DrawArgs) => void;
}
