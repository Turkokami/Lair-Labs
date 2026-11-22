// Every ground a map can be painted with: Lair Labs' own seamless textures in public/library/floors.
// Each picture is 4 x 4 squares. Natural grounds blend into each other with soft, uneven edges
// (the one with the higher `z` spreads over the lower one); built floors keep crisp square edges.

/** What a painted square does in play. Matches the map's cell codes. */
export type TerrainRule = 'normal' | 'water' | 'difficult' | 'impassable';
export const RULE_CELL: Record<TerrainRule, number> = { normal: 1, water: 2, difficult: 3, impassable: 5 };
export const RULE_WORDS: Record<TerrainRule, string> = {
  normal: 'Open ground', water: 'Water: double movement', difficult: 'Difficult: double movement', impassable: 'Blocks movement, not sight',
};

export type TerrainGroup = 'ground' | 'wild' | 'jungle' | 'alien' | 'rock' | 'water' | 'road' | 'cold' | 'hot' | 'floor';
export const TERRAIN_GROUPS: [TerrainGroup, string][] = [
  ['ground', 'Grass & soil'], ['wild', 'Forest & swamp'], ['jungle', 'Jungle'], ['alien', 'Alien & fungal'], ['rock', 'Rock & cliffs'], ['water', 'Water'],
  ['road', 'Roads & paving'], ['cold', 'Snow & ice'], ['hot', 'Desert & fire'], ['floor', 'Indoor floors'],
];

export interface Terrain {
  id: string;
  name: string;
  group: TerrainGroup;
  /** Average colour, for far zoom and before the picture loads. */
  color: string;
  rule: TerrainRule;
  /** Natural grounds blend; higher z spreads over lower. Built floors (no z) keep hard edges. */
  z?: number;
  /** Draw a light foam line where land meets this water. */
  shore?: boolean;
  /** High ground: a rocky lip and a shadow on the low side. */
  cliff?: boolean;
  /** How far it creeps into its neighbours, as a share of the usual (narrow trails use less). */
  spread?: number;
}

export const TERRAINS: Terrain[] = [
  // water, lowest so the land spreads over the shore
  { id: 'ocean', name: 'Open sea', group: 'water', color: '#17486d', rule: 'water', z: 1, shore: true },
  { id: 'water-deep', name: 'Deep water', group: 'water', color: '#1e5674', rule: 'water', z: 2, shore: true },
  { id: 'water-shallow', name: 'Shallow water', group: 'water', color: '#5ea4a3', rule: 'water', z: 3, shore: true },
  { id: 'water-muddy', name: 'Muddy river', group: 'water', color: '#414d2e', rule: 'water', z: 3.3, shore: true },
  { id: 'water-glow', name: 'Glowing pool', group: 'alien', color: '#1d1a44', rule: 'water', z: 3.6, shore: true },
  { id: 'swamp-water', name: 'Swamp water', group: 'water', color: '#394d2f', rule: 'water', z: 4 },
  { id: 'bog', name: 'Bog', group: 'wild', color: '#44472c', rule: 'difficult', z: 5 },
  { id: 'mud', name: 'Mud', group: 'wild', color: '#453628', rule: 'difficult', z: 6 },
  { id: 'lava', name: 'Lava', group: 'hot', color: '#924c20', rule: 'difficult', z: 7 },
  { id: 'ice', name: 'Ice', group: 'cold', color: '#9cc4d8', rule: 'normal', z: 8 },
  { id: 'beach-sand', name: 'Beach sand', group: 'ground', color: '#ddcba3', rule: 'normal', z: 9 },
  { id: 'sand', name: 'Desert sand', group: 'hot', color: '#c5aa77', rule: 'normal', z: 10 },
  { id: 'desert-cracked', name: 'Cracked earth', group: 'hot', color: '#ac8053', rule: 'normal', z: 11 },
  { id: 'ash', name: 'Ash', group: 'hot', color: '#4f4c48', rule: 'normal', z: 12 },
  { id: 'cave-floor', name: 'Cave floor', group: 'rock', color: '#3b3731', rule: 'normal', z: 13 },
  { id: 'dirt', name: 'Packed dirt', group: 'ground', color: '#6b5438', rule: 'normal', z: 14 },
  { id: 'road-dirt', name: 'Dirt road', group: 'road', color: '#7e6447', rule: 'normal', z: 29 },
  // the same dirt, barely creeping past its own square, so a one-square trail on a region map reads as a line
  { id: 'trail', name: 'Narrow trail', group: 'road', color: '#7e6447', rule: 'normal', z: 30, spread: 0.45 },
  { id: 'farmland', name: 'Ploughed field', group: 'ground', color: '#5a4425', rule: 'normal', z: 16 },
  { id: 'gravel', name: 'Gravel', group: 'rock', color: '#7f7a70', rule: 'normal', z: 17 },
  { id: 'scree', name: 'Scree', group: 'rock', color: '#6b665e', rule: 'difficult', z: 18 },
  { id: 'rocky-ground', name: 'Rocky ground', group: 'rock', color: '#746048', rule: 'normal', z: 19 },
  { id: 'forest-floor', name: 'Forest floor', group: 'wild', color: '#624e2b', rule: 'normal', z: 20 },
  { id: 'grass-dry', name: 'Dry grass', group: 'ground', color: '#8c8240', rule: 'normal', z: 21 },
  { id: 'tundra', name: 'Tundra', group: 'cold', color: '#aba996', rule: 'normal', z: 22 },
  { id: 'grass', name: 'Grass', group: 'ground', color: '#54772f', rule: 'normal', z: 23 },
  { id: 'grass-lush', name: 'Lush grass', group: 'ground', color: '#3f7425', rule: 'normal', z: 24 },
  { id: 'meadow', name: 'Meadow', group: 'ground', color: '#5d8b34', rule: 'normal', z: 25 },
  { id: 'moss', name: 'Moss', group: 'wild', color: '#4c7b2c', rule: 'normal', z: 26 },
  { id: 'thicket', name: 'Thicket', group: 'wild', color: '#30561d', rule: 'difficult', z: 27 },
  { id: 'snow', name: 'Snow', group: 'cold', color: '#dce5eb', rule: 'normal', z: 28 },
  { id: 'jungle-floor', name: 'Jungle floor', group: 'jungle', color: '#33391a', rule: 'normal', z: 20.5 },
  { id: 'jungle-undergrowth', name: 'Jungle undergrowth', group: 'jungle', color: '#2f4a1d', rule: 'difficult', z: 27.5 },
  { id: 'mycelium', name: 'Mycelium', group: 'alien', color: '#2a2333', rule: 'normal', z: 13.5 },
  { id: 'fungal-ground', name: 'Fungal ground', group: 'alien', color: '#33294a', rule: 'normal', z: 19.5 },
  { id: 'glow-moss', name: 'Glow moss', group: 'alien', color: '#1d5552', rule: 'normal', z: 26.5 },
  { id: 'cliff', name: 'Cliff top', group: 'rock', color: '#656059', rule: 'impassable', cliff: true },
  // built floors and paving: crisp edges
  { id: 'road-paved', name: 'Paved road', group: 'road', color: '#817c72', rule: 'normal' },
  { id: 'stone-cobble', name: 'Cobblestones', group: 'road', color: '#5a544c', rule: 'normal' },
  { id: 'stone-flagstone', name: 'Grey flagstones', group: 'floor', color: '#757777', rule: 'normal' },
  { id: 'stone-flagstone-warm', name: 'Warm flagstones', group: 'floor', color: '#66625b', rule: 'normal' },
  { id: 'dungeon-slab', name: 'Dungeon slabs', group: 'floor', color: '#47484d', rule: 'normal' },
  { id: 'brick-floor', name: 'Brick floor', group: 'floor', color: '#7b412f', rule: 'normal' },
  { id: 'marble', name: 'Marble', group: 'floor', color: '#b8b2a9', rule: 'normal' },
  { id: 'wood-planks', name: 'Wood planks', group: 'floor', color: '#744e2f', rule: 'normal' },
  { id: 'wood-planks-dark', name: 'Dark wood planks', group: 'floor', color: '#4c3120', rule: 'normal' },
  { id: 'pit', name: 'Pit', group: 'floor', color: '#0f0c0b', rule: 'normal' },
];

const byId = new Map(TERRAINS.map((t) => [t.id, t]));
export const terrainById = (id: string): Terrain | undefined => byId.get(id);
/** Texture squares per picture side. */
export const TERRAIN_SQUARES = 4;
