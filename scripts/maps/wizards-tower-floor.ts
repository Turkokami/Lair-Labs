// The Wizard's Tower, the big version: the whole walled grounds and the lower floor. The old round floor is still
// the centrepiece (library-study, alchemy lab and the warded summoning sanctum behind its portcullis), now ringed by
// an entrance foyer and a stair hall. Around it lie the gate and courtyard, a hedge garden with a rotating-statue
// puzzle, the greenhouse, the observatory annex, a secret study behind a hinged bookcase, the stables and familiar's
// roost, the apprentices' quarters, and below ground the cellar landing, the hall of runes, the vault and the
// portal room where the master waits. Two ways reach the portal room: down the cellar stair through the rune hall
// and vault, or round by the apprentices' quarters and the locked back stair (key in the secret study).
// Run: npx vite-node scripts/maps/wizards-tower-floor.ts
import { MapBuilder } from '../mapkit';
import { objectById } from '../../src/library/objects';
import type { RoomInfo } from '../../src/engine/map';

const b = new MapBuilder('wizards-tower-floor', "The Wizard's Tower", 52, 50, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone', seed: 17 });
const WATER = { tile: 2, mat: 'water-shallow' };
const RUBBLE = { tile: 3 };

/** Push a room made of arbitrary squares (the tower's ring sectors). */
function cellRoom(name: string, cells: [number, number][], label: [number, number], readAloud?: string, gmNotes?: string) {
  const rows = new Map<number, number[]>();
  for (const [x, y] of cells) (rows.get(y) ?? rows.set(y, []).get(y)!).push(x);
  const rects: number[][] = [];
  for (const [y, xs] of [...rows].sort((a, c) => a[0] - c[0])) {
    xs.sort((a, c) => a - c);
    let s = xs[0], p = xs[0];
    for (const x of xs.slice(1).concat([Infinity])) {
      if (x === p + 1) { p = x; continue; }
      rects.push([s, y, p - s + 1, 1]);
      s = x; p = x;
    }
  }
  const r: RoomInfo = { id: `room-${b.rooms.length + 1}`, name, rects, labelAt: label };
  if (readAloud) r.readAloud = readAloud;
  if (gmNotes) r.gmNotes = gmNotes;
  b.rooms.push(r);
}

// =====================================================================================================
// THE TOWER (centre): a round ring of four rooms around a warded sanctum
// =====================================================================================================
const CX = 26, CY = 19, R_OUT = 11.3, R_CORE = 6.3, R_SAN = 4.3;
type Sector = 'S' | 'W' | 'N' | 'E';
const sectorOf = new Map<string, Sector>();
const sectorCells: Record<Sector, [number, number][]> = { S: [], W: [], N: [], E: [] };
const sanctumCells: [number, number][] = [];
const SECTOR_MAT: Record<Sector, string> = { S: 'marble', W: 'wood-planks-dark', N: 'stone-flagstone', E: 'stone-flagstone-warm' };
for (let y = CY - 12; y <= CY + 12; y++)
  for (let x = CX - 12; x <= CX + 12; x++) {
    const dx = x - CX, dy = y - CY, d = Math.sqrt(dx * dx + dy * dy);
    if (d <= R_OUT && d > R_CORE) {
      const s: Sector = dy >= Math.abs(dx) ? 'S' : -dy >= Math.abs(dx) ? 'N' : dx > 0 ? 'E' : 'W';
      b.set(x, y, { mat: SECTOR_MAT[s] });
      sectorOf.set(`${x},${y}`, s);
      sectorCells[s].push([x, y]);
    } else if (d <= R_SAN) {
      b.set(x, y, { mat: 'dungeon-slab' });
      sanctumCells.push([x, y]);
    }
  }
// walls between the ring's four rooms
for (const [k, s] of sectorOf) {
  const [x, y] = k.split(',').map(Number);
  const e = sectorOf.get(`${x + 1},${y}`), so = sectorOf.get(`${x},${y + 1}`);
  if (e && e !== s) b.wall(x, y, 'e');
  if (so && so !== s) b.wall(x, y, 's');
}
/** A door on the wall between two ring rooms, as near as possible to (px, py). */
function sectorDoor(a: Sector, c: Sector, px: number, py: number, state: 'open' | 'closed' | 'locked', style?: string) {
  let best: [number, number, 'e' | 's'] | null = null, bd = 1e9;
  for (const [k, s] of sectorOf) {
    const [x, y] = k.split(',').map(Number);
    for (const [dir, nx, ny] of [['e', x + 1, y], ['s', x, y + 1]] as const) {
      const t = sectorOf.get(`${nx},${ny}`);
      if (!t || !((s === a && t === c) || (s === c && t === a))) continue;
      const dd = (x - px) ** 2 + (y - py) ** 2;
      if (dd < bd) { bd = dd; best = [x, y, dir]; }
    }
  }
  if (!best) throw new Error(`no edge between ${a} and ${c}`);
  const key = b.door(best[0], best[1], best[2], state, style);
  b.walls = b.walls.filter((w) => w !== key);
}

// --- Foyer (south sector) ---
cellRoom('Entrance foyer', sectorCells.S, [26, 28],
  'A curved hall of pale marble, cold as a crypt. Two gargoyles crouch on plinths by the doors, and the runner carpet down the middle is spotless, as if the dust is afraid to settle.',
  'The suits of armour by the walls and the two swords on the wall rack are the tower\'s doorwardens: they wake when anyone steps off the runner carpet without saying "by your leave, master" (the phrase is scratched under the coat rack, DC 14 Investigation). Glyph under the carpet\'s north end: DC 13 Investigation to spot; 3d6 thunder, DC 13 Con save halves, and it rings a bell in the portal room. West door to the library is ajar; east door to the alchemy lab is shut but not locked.');
b.prop('rug-runner', 26, 27); b.prop('glyph-trap', 26, 26, { gm: true, v: 1 });
b.prop('statue-gargoyle', 24, 30); b.prop('statue-gargoyle', 28, 30);
b.prop('brazier-pedestal', 22, 27); b.prop('brazier-pedestal', 30, 27);
b.prop('armor-stand', 21, 28); b.prop('armor-stand', 31, 28); b.prop('weapon-rack', 23, 26); b.prop('coat-rack', 28, 29);
b.prop('bench', 18, 26); b.prop('banner-hanging-tall', 33, 26);
b.encounter('Doorwardens', [18, 25, 17, 6], [['animated-armor', 1], ['flying-sword', 2]], 'medium');

// --- Library-study (west sector), kept from the old floor ---
cellRoom('Library-study', sectorCells.W, [17, 19],
  'Shelves bow under books that whisper when you are not looking at them. A lamp burns without oil over a desk buried in notes, and a red rug lies before the hearthless wall.',
  'The rug is a rug of smothering; it attacks whoever stands on it. The portcullis lever for the sanctum is hidden behind the east bookshelf (DC 13 Investigation, or anyone reading the desk notes learns of it). The two-section bookcase in the north corner is hinged: pull the blue book to swing it open onto the stair to the secret study (DC 15 Investigation; a draught gives it away). The east wall hides a secret door into the sanctum (DC 16). Loot: 2 spell scrolls (a 1st- and a 2nd-level spell) in the scroll pile, a book on planar binding worth 75 gp.');
b.prop('bookcase-secret', 17, 13);
b.prop('bookshelf-tall', 15, 17); b.prop('bookshelf-tall', 15, 21); b.prop('bookshelf-tall', 16, 15); b.prop('bookshelf-tall', 16, 23);
b.prop('bookshelf-tall', 19, 16, { rot: 90 }); b.prop('lever', 20, 17, { gm: true });
b.prop('desk', 16, 19); b.prop('chair', 17, 20); b.prop('lectern', 18, 17); b.prop('levitating-tome', 15, 19);
b.prop('rug', 17, 21, { v: 0 }); b.prop('candles', 20, 22); b.prop('scroll-pile', 18, 25); b.prop('spell-scroll', 19, 24);
b.prop('lantern-hanging', 18, 15);
b.encounter('The hungry rug', [15, 20, 6, 5], [['rug-of-smothering', 1]], 'medium');

// --- Alchemy lab (east sector), kept from the old floor ---
cellRoom('Alchemy lab', sectorCells.E, [35, 19],
  'Glassware bubbles over blue flames that no one tends. The air tastes of copper and burnt sugar, and a green stain has eaten a hole right through the floor stones.',
  'Two animated armours guard the lab and a steam mephit lives in the big cauldron. The green stain is a puddle of spilled acid (2d6 acid if walked through). On the shelves: 3 potions of healing, 1 potion of fire breath, and a jar of alchemist\'s fire (labelled in a cipher; DC 12 Arcana to read them). The portcullis to the sanctum is on the west wall; it only rises from the library lever. East door: the apprentices\' quarters.');
b.prop('alchemy-table', 34, 15); b.prop('potion-shelf', 35, 23); b.prop('cauldron', 33, 21); b.prop('cauldron-tripod', 31, 24);
b.prop('herbs-drying', 33, 13); b.prop('crate', 36, 17); b.prop('barrel', 37, 18); b.prop('table-long', 34, 24);
b.prop('acid-pool', 34, 18); b.prop('crystal-cluster', 30, 13); b.prop('brazier', 37, 20, { v: 2 }); b.prop('potion-set', 36, 15);
b.encounter('Lab guardians', [30, 12, 8, 15], [['animated-armor', 2], ['steam-mephit', 1]], 'medium');

// --- Stair hall (north sector) ---
cellRoom('Stair hall', sectorCells.N, [26, 11],
  'A spiral stair climbs out of sight into the upper tower, and beside it a narrow way drops into the dark. Candles in iron rings throw shaking shadows up the curved wall.',
  'The spiral stair leads to the upper floors (another map). The narrow stair north goes down to the cellar landing; its door has a fire glyph (DC 13 Investigation; 3d6 fire, DC 13 Dex save halves). The door to the alchemy lab is locked (DC 14 thieves\' tools; the key is on the alchemy table).');
b.prop('stair-spiral', 22, 10); b.prop('statue-tall-robed', 28, 10); b.prop('candle-hoop', 25, 12); b.prop('torch-sconce', 31, 12);
b.prop('glyph-trap', 26, 8, { gm: true }); b.prop('tapestry-tall', 19, 13);
b.note(23, 11, 'Spiral stair up to the upper floors and the old observation deck (another map)');

// --- Summoning sanctum (centre), kept from the old floor ---
cellRoom('Summoning sanctum', sanctumCells, [26, 17],
  'A circle of silver is set into the black floor, and four braziers burn around it with flames that lean inward. Something inside the circle watches you, though nothing is there.',
  'The circle binds a quasit and an imp the master summoned and never sent home, with two flying swords as wardens. They stay bound until a brazier is knocked over or the circle is scuffed (DC 12 Dex check to step across without breaking a line). Freed, the fiends fight, flee upward or bargain (they know the vault\'s rune order: moon, flame, eye). The portcullis (east) rises only from the library lever; the west wall is a secret door to the library. Loot on the lectern: a wand of magic missiles (5 charges).');
b.prop('summoning-circle', 25, 18); b.prop('brazier', 23, 16, { v: 2 }); b.prop('brazier', 29, 16, { v: 2 });
b.prop('brazier', 23, 22, { v: 2 }); b.prop('brazier', 29, 22, { v: 2 }); b.prop('lectern', 26, 16); b.prop('wand', 27, 16);
b.prop('cage', 26, 22, { v: 0 });
b.encounter('The bound things', [22, 15, 9, 9], [['quasit', 1], ['imp', 1], ['flying-sword', 2]], 'hard', 'manual');

// sanctum ways in: portcullis east, secret door west
b.hall(31, 19, 32, 19, { mat: 'stone-flagstone-warm' });
b.door(31, 19, 'w', 'locked', 'portcullis');
b.hall(20, 19, 21, 19, { mat: 'wood-planks-dark' });
b.door(21, 19, 'e', 'secret');

// ring doors
sectorDoor('S', 'W', 20, 25, 'open', 'door-wood');
sectorDoor('S', 'E', 32, 25, 'closed', 'door-wood');
sectorDoor('W', 'N', 20, 13, 'closed', 'door-wood');
sectorDoor('E', 'N', 32, 13, 'locked', 'door-iron');
// tower windows on the outer wall
for (const [x, y] of [[15, 18], [15, 20], [37, 18], [37, 20], [18, 27], [34, 27], [34, 11]] as const) {
  const s = sectorOf.get(`${x},${y}`);
  if (!s) continue;
  const dir = x < CX ? 'w' : 'e';
  if (!b.floor(dir === 'w' ? x - 1 : x + 1, y)) b.wall(x, y, dir, 'window');
}

// =====================================================================================================
// THE GROUNDS (south): approach, gatehouse, courtyard
// =====================================================================================================
b.rooms2('The approach', [[14, 46, 25, 3]], {
  mat: 'grass',
  readAloud: 'A cart road climbs to a gate in a high grey wall. Above it rises the tower, round and black, with one window lit a sickly green.',
  gmNotes: 'The main gate is shut but not barred; a hard shove opens it (DC 10 Athletics). West along the wall, an iron wicket gate leads into the hedge garden; the brambles behind it hide a bear trap (DC 13 Perception; 2d4 piercing and restrained, DC 13 Str to pull free).',
  label: [32, 47],
});
b.paint(24, 46, 5, 3, { mat: 'dirt' });
b.start(25, 47, 2, 2);
b.prop('signpost', 22, 46); b.prop('lamp-post', 23, 46); b.prop('lamp-post', 29, 46); b.prop('tree-oak', 15, 46);
b.prop('bush', 19, 48); b.prop('boulder', 36, 48); b.prop('grass-tall', 33, 46); b.prop('flowers', 20, 46); b.prop('cart', 31, 47);

b.room('Gatehouse', 22, 42, 9, 3, {
  mat: 'stone-flagstone',
  readAloud: 'A cramped guard room between two gates. A dice game lies abandoned on an upturned crate, and a big iron winch is chained to the wall.',
  gmNotes: 'Two hired gate wardens and their dog. They are paid, not loyal: a 10 gp bribe or a good lie (DC 13 Deception) gets the party waved through. The winch raises the inner portcullis (takes an action). Loot: 14 sp in the dice pot.',
});
b.hall(26, 45, 26, 45, { mat: 'stone-flagstone' });
b.door(26, 45, 's', 'closed', 'door-double');
b.hall(26, 41, 26, 41, { mat: 'stone-flagstone' });
b.door(26, 41, 'n', 'closed', 'portcullis');
b.prop('winch', 28, 42); b.prop('table-cards', 24, 43); b.prop('stool', 23, 43); b.prop('stool', 24, 44);
b.prop('weapon-rack', 29, 44); b.prop('brazier', 22, 42); b.prop('coins-small', 25, 43);
b.encounter('Gate wardens', [22, 42, 9, 3], [['guard', 2], ['mastiff', 1]], 'easy');

b.rooms2('Courtyard', [[14, 33, 25, 8], [13, 34, 1, 6], [39, 34, 1, 6]], {
  mat: 'stone-cobble',
  readAloud: 'Weeds push up between the cobbles of a walled yard. Stone gargoyles leer down from the wall tops, and an old well stands under a crooked oak.',
  gmNotes: 'The well is 40 ft deep with a bucket; at the bottom, in the silt, a drowned courier\'s satchel holds a letter to the master and 18 gp. The tower door (north) is unlocked. West gate: the hedge garden. East arch: the stables and roost. The gargoyles are only stone, but let the players worry.',
  label: [20, 37],
});
b.paint(14, 33, 6, 3, { mat: 'grass' }); b.paint(33, 37, 6, 4, { mat: 'grass' });
b.hall(26, 31, 26, 32, { mat: 'stone-cobble' });
b.door(26, 31, 'n', 'closed', 'door-double');
b.prop('well', 17, 37); b.prop('tree-oak', 34, 37); b.prop('statue-gargoyle', 14, 33); b.prop('statue-gargoyle', 38, 33);
b.prop('statue-gargoyle', 14, 40); b.prop('statue-gargoyle', 38, 40); b.prop('lamp-post', 22, 34); b.prop('lamp-post', 30, 34);
b.prop('cart', 20, 39); b.prop('water-barrel', 31, 39); b.prop('crate-pile', 28, 39); b.prop('hedge-long', 23, 38); b.prop('flowers', 25, 38);
b.prop('obelisk', 26, 36); b.prop('bench', 24, 35); b.prop('bench', 27, 35); b.prop('torch-standing', 25, 33); b.prop('torch-standing', 27, 33); b.prop('puddle', 31, 36); b.prop('rubble-pile', 37, 35);

// =====================================================================================================
// WEST: hedge garden, sunken grotto, greenhouse, observatory annex, secret study
// =====================================================================================================
b.rooms2('Hedge garden', [[4, 31, 8, 16], [5, 30, 6, 1], [5, 47, 7, 1]], {
  mat: 'grass',
  readAloud: 'Yew hedges, clipped into neat walls, frame a dry fountain. Four stone figures stand around it, each with an arm out, each pointing somewhere different.',
  gmNotes: 'Statue puzzle: each statue turns on its base (DC 12 Athletics, or easy with two people). When all four point at the fountain, the basin drains with a gurgle and the west hedge wall grinds aside, opening the sunken grotto. Turning one the wrong way twice wakes the hedges: three awakened shrubs step out of the beds. A carved line on the fountain rim hints: "All my children look home."',
  label: [8, 33],
});
b.paint(7, 31, 2, 16, { mat: 'sand' }); b.paint(4, 38, 8, 2, { mat: 'sand' });
b.hall(12, 37, 12, 37, { mat: 'sand' });
b.door(12, 37, 'w', 'closed', 'bars');
b.hall(12, 47, 13, 47, { mat: 'dirt' });
b.door(12, 47, 'w', 'closed', 'bars');
b.prop('fountain', 7, 38, { v: 3 });
b.prop('statue-rotating', 7, 36, { rot: 90 }); b.prop('statue-rotating', 8, 41, { rot: 180, v: 2 });
b.prop('statue-rotating', 5, 39, { rot: 0, v: 2 }); b.prop('statue-rotating', 10, 38, { rot: 270 });
b.prop('hedge-long', 4, 32); b.prop('hedge-long', 10, 32); b.prop('hedge-long', 4, 35); b.prop('hedge-long', 10, 35);
b.prop('hedge-long', 4, 42); b.prop('hedge-long', 10, 42); b.prop('hedge-long', 4, 45); b.prop('hedge-long', 9, 45);
b.prop('hedge', 11, 39); b.prop('bush', 5, 33); b.prop('flowers', 11, 33); b.prop('flowers', 4, 43); b.prop('lantern-standing', 9, 37);
b.prop('brambles', 10, 46); b.prop('trap-bear', 11, 47, { gm: true });
b.encounter('Waking hedges', [4, 31, 8, 16], [['awakened-shrub', 3]], 'easy', 'manual');

b.rooms2('Grotto', [[1, 33, 2, 5]], {
  mat: 'cave-floor',
  readAloud: 'Steps slick with moss lead down into a tiny damp grotto. On a stone shelf sit a pair of boots with small white wings at the heels.',
  gmNotes: 'Opened only by the statue puzzle (a secret door in the hedge wall otherwise; DC 18 to find). Reward: winged boots, a potion of healing and a moonstone worth 50 gp. Dead end.',
  label: [1, 35],
});
b.hall(3, 35, 3, 35, { mat: 'grass' });
b.door(3, 35, 'w', 'secret');
b.prop('winged-boots', 1, 33); b.prop('potion-healing', 2, 34); b.prop('glowing-fungus', 1, 37, { v: 0 }); b.prop('statue', 2, 37, { v: 4 });

b.rooms2('Greenhouse', [[2, 17, 10, 11]], {
  mat: 'dirt',
  readAloud: 'Warm wet air fogs the glass walls. Plants with leaves like hands and flowers like open mouths crowd the beds, and something purple twitches in the far corner.',
  gmNotes: 'Two violet fungi and a shrieker among the beds. The shrieker\'s noise brings the observatory\'s homunculi down in 2 rounds. The pond is shallow (difficult terrain); at its bottom glints a silver key-shaped pin (just a pin, 5 gp). Workbench: a bag of 6 doses of healing herbs (each heals 1d4) and a jar of bottled glow (a light source for 8 hours). East door: the library. North stair: the observatory.',
  label: [9, 19],
});
b.paint(3, 22, 3, 3, WATER); b.paint(6, 17, 2, 11, { mat: 'wood-planks' });
b.hall(12, 21, 14, 21, { mat: 'wood-planks' });
b.door(12, 21, 'w', 'closed', 'door-wood');
b.hall(6, 28, 6, 29, { mat: 'sand' });
b.door(6, 28, 'n', 'closed', 'door-wood');
b.hall(7, 14, 7, 16, { mat: 'marble' });
b.door(7, 14, 'n', 'closed', 'door-wood');
b.prop('mushroom-giant', 2, 18, { v: 2 }); b.prop('mushroom-giant', 9, 25, { v: 3 }); b.prop('ferns', 8, 18); b.prop('flowers', 11, 18);
b.prop('lily-pads', 4, 23); b.prop('glowing-fungus', 3, 26, { v: 1 }); b.prop('glowing-fungus', 10, 21); b.prop('workbench', 8, 22);
b.prop('herbs-drying', 2, 21); b.prop('water-barrel', 11, 27); b.prop('brambles', 9, 17); b.prop('mushrooms', 5, 26);
for (const y of [18, 21, 24, 27]) b.wall(2, y, 'w', 'window');
for (const x of [3, 9, 11]) b.wall(x, 17, 'n', 'window');
b.encounter('Hungry beds', [2, 17, 10, 11], [['violet-fungus', 2], ['shrieker-fungus', 1]], 'medium');

b.round('Observatory annex', 7, 8, 5, {
  mat: 'marble',
  readAloud: 'A domed room open to the sky through a slot in the roof. A great brass telescope points at nothing, and a clockwork model of the heavens ticks on its own.',
  gmNotes: 'Two homunculi, the master\'s little spies, keep the star charts and attack anyone who touches the orrery. The charts on the map table mark tonight\'s conjunction: the portal opens fully at midnight. A spell scroll (a 3rd-level divination) is rolled inside the telescope case. The east wall has a secret door (DC 15; the floor is scuffed in an arc) to the passage to the secret study.',
  label: [7, 11],
});
b.prop('telescope', 6, 4); b.prop('orrery', 6, 7); b.prop('table-maps', 8, 10); b.prop('globe-stand', 4, 10);
b.prop('astrolabe-stand', 10, 6); b.prop('light-orb', 3, 7, { v: 0 }); b.prop('light-orb', 11, 9, { v: 2 }); b.prop('spell-scroll', 9, 4);
b.prop('chair', 8, 11);
b.encounter('The little spies', [2, 3, 11, 11], [['homunculus', 2]], 'easy');

b.room('Secret study', 14, 2, 6, 6, {
  mat: 'wood-planks',
  readAloud: 'A snug, windowless study, warm and lived-in. Slippers by the chair, a half-drunk cup of tea gone cold, and a ring resting on a velvet cushion as if put down for a moment.',
  gmNotes: 'The master\'s private room. Reached by the hinged bookcase in the library or the secret passage from the observatory. Loot: ring of protection on the cushion; wand of web (4 charges) in the desk; spell scroll of a 2nd-level spell; the back-stair key on the key ring (opens the locked door between the apprentices\' quarters and the portal room); coffer with 120 gp and two pearls (100 gp each), its lock trapped with a poison needle (DC 14 Investigation; 1 piercing and DC 13 Con save or poisoned for 1 hour). The journal on the desk says the master means to step through the portal and close it behind them, leaving the tower to collapse.',
  label: [16, 4],
});
b.hall(17, 8, 17, 12, { mat: 'wood-planks' });
b.door(17, 13, 'n', 'secret');
b.hall(12, 5, 13, 5, { mat: 'wood-planks' });
b.door(13, 5, 'e', 'secret');
b.prop('writing-desk', 16, 2); b.prop('chair-high-back', 16, 3); b.prop('armchair', 14, 6); b.prop('bookshelf-low', 18, 6);
b.prop('ring-cushion', 19, 2); b.prop('wand', 15, 2, { v: 1 }); b.prop('key-ring', 19, 4, { v: 1 }); b.prop('coffer', 14, 2);
b.prop('trap-needle-lock', 14, 3, { gm: true }); b.prop('spell-scroll', 18, 2); b.prop('candles', 19, 5); b.prop('magic-mirror', 14, 4);
b.prop('rug-round', 16, 4, { v: 3 });

// =====================================================================================================
// EAST: stables and familiar's roost, apprentices' quarters, storeroom
// =====================================================================================================
b.rooms2('Stables and roost', [[41, 33, 10, 11], [42, 44, 8, 1]], {
  mat: 'dirt',
  readAloud: 'Straw, horse smell and the rustle of feathers. Empty stalls line one side; on the other a tall perch tree of dead branches holds a great grey owl that turns its head right round to look at you.',
  gmNotes: 'The owl is the master\'s familiar, with three ravens. It sees what the owl sees: if it gets away, the master knows the party is coming and starts the boss fight with mage armor already cast. Feed it (a fresh rat from the feed bin) and DC 13 Animal Handling to calm it. In the tack chest: a saddle with hidden pocket (a scroll case with a 1st-level spell scroll).',
  label: [46, 35],
});
b.paint(41, 39, 10, 5, { mat: 'wood-planks' });
b.hall(40, 36, 40, 36, { mat: 'stone-cobble' });
b.door(40, 36, 'e', 'open', 'door-double');
b.prop('tree-dead', 47, 34); b.prop('cage-hanging', 44, 34, { v: 1 }); b.prop('cage-hanging', 50, 36); b.prop('hay-bale', 42, 33);
b.prop('water-trough', 45, 38); b.prop('hitching-post', 48, 39); b.prop('hay-bale', 42, 42); b.prop('hay-bale', 46, 43);
b.prop('chest', 50, 43); b.prop('lantern-hanging', 44, 40); b.prop('fence-wood', 42, 40); b.prop('fence-wood', 47, 41); b.prop('sack', 49, 42); b.prop('barrel', 41, 43); b.prop('fence-wood', 42, 37); b.prop('lantern-hanging', 49, 34);
b.encounter('The familiar', [41, 33, 10, 6], [['giant-owl', 1], ['raven', 3]], 'easy');

b.room('Apprentices\' quarters', 40, 20, 11, 7, {
  mat: 'wood-planks',
  readAloud: 'Bunk beds, ink-stained desks and a chalk board of half-wiped spell diagrams. Three young people in grey robes look up from a game of cards, and their smiles are wrong.',
  gmNotes: 'Three apprentices who sold their oaths to the master\'s plan (cultist stats; one can cast fire bolt as a cantrip, +3 to hit, 1d10 fire). They will trade the back-stair route for safe passage out (DC 14 Persuasion). Footlockers: 31 sp, a dagger, a potion of climbing, a love letter. The north door is the back stair to the portal room: locked (DC 18 thieves\' tools, or the key from the secret study). West door: the alchemy lab. South: the storeroom and the stables.',
  label: [45, 23],
});
b.hall(37, 22, 39, 22, { mat: 'stone-flagstone-warm' });
b.door(39, 22, 'e', 'closed', 'door-wood');
b.prop('bunk-bed', 40, 20); b.prop('bunk-bed', 42, 20); b.prop('bunk-bed', 50, 20); b.prop('footlocker', 41, 22); b.prop('footlocker', 43, 22);
b.prop('table-cards', 46, 23); b.prop('stool', 45, 23); b.prop('stool', 47, 23); b.prop('writing-desk', 48, 25); b.prop('notice-board', 41, 25);
b.prop('lantern-hook', 44, 21); b.prop('stove', 50, 25); b.prop('book-pile', 50, 23);
b.encounter('Turncoat apprentices', [40, 20, 11, 7], [['cultist', 3]], 'medium');

b.room('Storeroom', 40, 28, 5, 3, {
  mat: 'stone-flagstone',
  readAloud: 'Sacks, crates and shelves of jars fill a narrow storeroom. A handsome brass-bound chest sits on its own at the back, too clean for the dust around it.',
  gmNotes: 'The brass-bound chest is a mimic. The real loot is in the plain chest under the sacks: a bag of holding (holding 40 ft of silk rope, 3 days of rations and 50 gp in a purse). Dead end.',
  label: [42, 29],
});
b.hall(42, 27, 42, 27, { mat: 'wood-planks' });
b.door(42, 27, 'n', 'closed', 'door-wood');
b.prop('mimic-chest', 40, 30); b.prop('crate-stack', 44, 28); b.prop('flour-sacks', 40, 28); b.prop('chest', 44, 30); b.prop('bag-of-holding', 43, 30);
b.prop('shelf-jars', 42, 28);
b.encounter('Too-clean chest', [40, 28, 5, 3], [['mimic', 1]], 'medium', 'manual');

b.hall(47, 27, 47, 32, { mat: 'wood-planks' });
b.door(47, 27, 'n', 'closed', 'door-wood');

// =====================================================================================================
// BELOW: cellar landing, hall of runes, vault, portal room
// =====================================================================================================
b.rooms2('Cellar landing', [[22, 1, 9, 5]], {
  mat: 'dungeon-slab',
  readAloud: 'The stair ends in a low vaulted cellar that smells of wine and old stone. Racks of dusty bottles line the walls, and the east passage glows faintly blue.',
  gmNotes: 'This and the rooms east lie under the grounds. The rubble corner is unstable (difficult terrain). Wine racks: 6 bottles of good vintage (10 gp each). A rune threshold across the far end of the east passage is described in the hall of runes.',
  label: [24, 3],
});
b.paint(22, 1, 2, 2, RUBBLE);
b.hall(26, 6, 26, 7, { mat: 'stone-flagstone' });
b.door(26, 8, 'n', 'closed', 'door-iron');
b.prop('stairs-down', 26, 6); b.prop('wine-rack', 27, 1); b.prop('wine-rack', 22, 4); b.prop('barrel-group', 29, 4); b.prop('crate', 25, 1);
b.prop('rubble-pile', 22, 1); b.prop('torch-sconce', 30, 1); b.prop('cobweb-corner', 23, 1);

b.rooms2('Hall of runes', [[32, 1, 7, 6]], {
  mat: 'dungeon-slab',
  readAloud: 'A square hall whose floor is a grid of carved runes, faintly lit from within. A stone statue of a robed figure stands at the far end, its mouth open as if about to speak.',
  gmNotes: 'Rune tiles: crossing them anywhere but on the moon, flame, eye runes in that order triggers the statue, which breathes fire in a 15-ft cone (4d6 fire, DC 13 Dex save halves). The order is in the master\'s journal (secret study) or from the bound fiends. Two shadows of failed apprentices drift out of the walls when the statue fires. The vault door (east) is locked; the rune lock plate opens it when the tiles are walked in the right order, or DC 18 thieves\' tools.',
  label: [35, 6],
});
b.hall(31, 3, 31, 3);
b.door(31, 3, 'w', 'closed', 'door-wood');
b.prop('rune-tiles', 34, 2, { gm: true }); b.prop('trap-fire-statue', 38, 2, { gm: true }); b.prop('statue-tall-robed', 32, 5);
b.prop('sconce-magefire', 32, 1); b.prop('lock-plate', 38, 5, { v: 3 }); b.prop('bones', 33, 5);
b.encounter('Shadows of the failed', [32, 1, 7, 6], [['shadow', 2]], 'medium', 'manual');

b.rooms2('Cellar vault', [[40, 1, 11, 7]], {
  mat: 'marble',
  readAloud: 'Shelves of treasures glitter in the light of floating orbs: staves, wands, glass vials, a heap of coins. Standing silent among them is a huge stitched figure, taller than a door.',
  gmNotes: 'A flesh golem guards the vault and attacks anyone who is not the master. Lightning heals it; fire makes it hesitate. Floor scythe across the doorway: DC 14 Perception to spot the slot; 2d10 slashing, DC 13 Dex save halves. Loot: a staff stand holding a quarterstaff +1 that can cast light at will; a set of 4 potions (2 healing, 1 greater healing, 1 invisibility); a wand of magic detection; 600 gp and 300 sp; the strongbox holds 4 gems (50 gp each). South: a rune-warded opening to the portal room.',
  label: [45, 3],
});
b.hall(39, 4, 39, 4);
b.door(39, 4, 'w', 'locked', 'door-iron');
b.prop('trap-floor-scythe', 40, 4, { gm: true }); b.prop('staff-stand', 50, 1); b.prop('potion-set', 48, 1, { v: 1 }); b.prop('wand', 46, 1, { v: 3 });
b.prop('coins-large', 43, 1); b.prop('strongbox', 50, 6); b.prop('coin-stacks', 49, 6); b.prop('display-case', 42, 6); b.prop('light-orb', 41, 1, { v: 1 });
b.prop('light-orb', 50, 3, { v: 1 }); b.prop('treasure-pile', 47, 6); b.prop('enchanted-shield', 45, 1);
b.encounter('Vault keeper', [40, 1, 11, 7], [['flesh-golem', 1]], 'hard');

b.rooms2('Portal room', [[40, 9, 11, 8], [42, 17, 7, 1]], {
  mat: 'dungeon-slab',
  readAloud: 'A great arch of black stone stands on a dais, and the air inside it ripples violet like oil on water. Before it, a figure in a star-stitched robe turns, raises a hand, and says, "You are late."',
  gmNotes: 'Boss fight. The master (mage) with two animated armours and an imp messenger. The master fights from behind the armours, uses counterspell on the party\'s best spell and tries to escape through the arch at half HP. The arch: anyone pushed in is flung to the courtyard (fall prone, 2d6 force). The crack in the floor is a 20-ft drop into the old foundations (2d6 bludgeoning). The rune threshold on the vault side: 3d8 lightning (DC 13 Dex save halves) to anyone crossing who is not wearing the master\'s ring. Killing the master closes the arch. Loot: the master\'s spellbook (worth 500 gp to a wizard), a magic cloak (cloak of protection) and their staff.',
  label: [45, 12],
});
b.paint(48, 14, 2, 2, { tile: 4, mat: 'pit' });
b.hall(45, 8, 46, 8, { mat: 'marble' });
b.prop('trap-rune-threshold', 45, 8, { gm: true, v: 2 });
b.prop('portal-arch', 45, 10); b.prop('teleport-pad', 45, 11, { v: 1 }); b.prop('column-twisted', 42, 10); b.prop('column-twisted', 49, 10);
b.prop('column-twisted', 42, 15); b.prop('crystal-spire', 40, 12); b.prop('orb-pedestal', 50, 12, { v: 0 }); b.prop('magic-cloak', 40, 9);
b.prop('staff-stand', 50, 9, { v: 1 }); b.prop('brazier-everburning', 44, 16); b.prop('brazier-everburning', 47, 16); b.prop('rune-stone', 43, 13);
b.encounter('The master of the tower', [40, 9, 11, 9], [['mage', 1], ['animated-armor', 2], ['imp', 1]], 'deadly');
b.hall(45, 18, 45, 19, { mat: 'stone-flagstone' });
b.door(45, 19, 's', 'locked', 'door-iron');
b.note(45, 18, 'Back stair to the apprentices\' quarters: locked iron door, key in the secret study (DC 18 to pick)');

// =====================================================================================================
// extra checks: big things fully on floor, solid things not stacked, nothing solid in a doorway
// =====================================================================================================
const solid = new Map<string, string>();
const doorSquares = new Set<string>();
for (const k of Object.keys(b.doors)) {
  const [t, xy] = k.split(':');
  const [x, y] = xy.split(',').map(Number);
  doorSquares.add(`${x},${y}`); doorSquares.add(t === 'h' ? `${x},${y - 1}` : `${x - 1},${y}`);
}
const warn: string[] = [];
for (const p of b.props) {
  const d = objectById(p.kind);
  if (!d) continue;
  const turned = p.rot === 90 || p.rot === 270;
  const w = turned ? d.h : d.w, h = turned ? d.w : d.h;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = p.x + i, y = p.y + j;
    if (!b.floor(x, y)) warn.push(`${p.kind} at ${p.x},${p.y} hangs over rock at ${x},${y}`);
    if (d.layer === 'floor' || p.gmOnly || d.layer === 'overhead') continue;
    const k = `${x},${y}`;
    if (solid.has(k)) warn.push(`${p.kind} at ${p.x},${p.y} overlaps ${solid.get(k)} at ${k}`);
    solid.set(k, p.kind);
    if (d.blocksMovement && doorSquares.has(k) && p.kind !== 'bookcase-secret') warn.push(`${p.kind} at ${p.x},${p.y} blocks a door square ${k}`);
  }
}
if (warn.length) console.warn('layout warnings:\n - ' + warn.join('\n - '));

b.save({
  description: 'A wizard\'s whole walled estate: gate and courtyard, hedge garden with a rotating-statue puzzle, greenhouse, observatory, stables and roost, apprentices\' quarters, the round tower with its library, alchemy lab and summoning sanctum, a secret study behind a hinged bookcase, and a trapped cellar of runes, a vault and a portal room where the master waits.',
  setting: 'dungeon',
  tags: ['dungeon', 'tower', 'wizard', 'arcane', 'large'],
});
