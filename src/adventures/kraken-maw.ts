// The Kraken's Maw: an epic sea legend for four heroes of level 19.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** A one-square-wide line from a to b that never steps corner to corner (chains, rope lines). */
function line(b: MapBuilder, ax: number, ay: number, bx: number, by: number, mat: string) {
  let x = ax, y = ay;
  b.floor(x, y, 1, 1, mat);
  const dx = Math.abs(bx - ax), dy = Math.abs(by - ay), sx = Math.sign(bx - ax), sy = Math.sign(by - ay);
  let err = dx - dy;
  let guard = 0;
  while ((x !== bx || y !== by) && guard++ < 400) {
    const e2 = 2 * err;
    if (e2 > -dy && x !== bx) { err -= dy; x += sx; b.floor(x, y, 1, 1, mat); }
    if (e2 < dx && y !== by) { err += dx; y += sy; b.floor(x, y, 1, 1, mat); }
  }
}

function krakensMaw() {
  const b = new MapBuilder('adv-kraken-maw', "The Kraken's Maw", 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'water-deep' });
  const r = rng(1923);

  // ---------- the sea: deep everywhere, shallow over the reefs, the shell and the kelp ----------
  b.water(0, 0, 80, 80, true);
  b.water(0, 0, 58, 27, false);
  b.pool(70, 46, 10.5, 13.5, false);
  b.water(56, 62, 24, 18, false);

  // ---------- Widowcliff: a rock headland in the west, hollowed by the sea ----------
  let edge = 14;
  for (let y = 28; y < 76; y++) {
    edge = Math.max(12, Math.min(17, edge + Math.round((r() - 0.5) * 2.4)));
    b.rock(0, y, edge, 1);
  }
  b.cave('Widowcliff mouth', 12, 50, 4, 3, {
    seed: 31, mat: 'cave-floor',
    read: 'Black cliffs streaked white with gull droppings, and a cave mouth the sea breathes in and out of. Little dolls of driftwood and hair hang on strings across the opening, turning in the wind.',
    gm: 'The front door of the sea caves. The dolls are the third Brackwife\'s warning signs: touching one makes it shriek (DC 16 Perception to notice the strings in the dark). The hydras in the pool to the north come at the noise.',
  });
  b.tunnel([[14, 50], [19, 50]], 2, { seed: 32 });
  b.pool(12, 51, 2.5, 1.5);
  b.cave('Hydra pool', 8, 39, 5.5, 5, {
    seed: 33, mat: 'cave-floor',
    read: 'A tall cave around a pool so still it looks like black glass. Bones of whales and men are piled on the ledges. Then the pool bulges, and three heads on long necks rise out of it, and then six, and then more.',
    gm: 'Three hydras that the third Brackwife feeds and keeps as guard dogs. They fight to the death in the pool; on land they are slow and retreat after losing half their heads. Nettle Brackwife can call them off with a whistle. At the bottom of the pool (40 ft, DC 15 Athletics to dive and search) lies what they have not digested.',
  });
  b.pool(8, 40, 3.5, 3, true);
  b.tunnel([[11, 47], [10, 44]], 2, { seed: 34 });
  b.cave('Galley grotto', 7, 31, 4, 2.5, {
    seed: 35, mat: 'cave-floor',
    read: 'An ancient galley is jammed sideways in the cave, its oars sticking up like the legs of a dead spider. Its figurehead is a woman with a crown of waves.',
    gm: 'A ship of drowned Aumbrel, thrown up here when the city rose. Its captain\'s cabin holds a bronze tide-wheel (DC 17 Arcana or History to read it): it shows the Black Tide coming in three days. Opens on the sea to the north.',
  });
  b.tunnel([[7, 35], [7, 32]], 2, { seed: 36 });
  b.tunnel([[7, 30], [7, 25]], 2, { seed: 37 });
  b.cave('Brackwife grotto', 7, 61, 5, 4, {
    seed: 38, mat: 'cave-floor',
    read: 'Warm, stinking, lit green by a cauldron. Bunches of drying seaweed hang from the roof, and a hundred little jars line the shelves, each one glowing faintly. A crooked old woman with barnacles on her cheeks looks up from her stirring and smiles with every one of her teeth.',
    gm: 'Nettle Brackwife, the third and least-loved sister of the coven that serves the queen. Her sisters cut her out of the queen\'s payment, and she wants them hurt. She sells secrets (see her profile). She never fights fairly: if attacked she turns invisible, flees into the niche and calls the hydras.',
  });
  b.tunnel([[11, 53], [8, 58]], 2, { seed: 39 });
  b.room('Memory-jar niche', 1, 54, 4, 2, {
    mat: 'cave-floor',
    read: 'A cramped cleft lined with jars. In each one, a little scene moves like a reflection: a wedding, a battle, a child learning to swim.',
    gm: 'Secret door (DC 20 Perception, or follow Nettle). The jars hold memories she has bought or stolen. One, sealed with blue wax, holds Queen Ondrava\'s memory of the day she was crowned and swore to protect the small folk of the sea. Opening it in front of the queen, or giving it to Aldrem, gives advantage on any check to turn her.',
  });
  b.floor(3, 56, 1, 4, 'cave-floor').door(3, 55, 's', 'secret');
  b.cave('Bone strand', 9, 71, 4, 2.5, {
    seed: 40, mat: 'sand',
    read: 'A little beach of grey sand inside the cliff. It is not sand. It is ground bone.',
    gm: 'Where the hydras drag the leftovers. A drowned sailor\'s satchel here holds a letter to Port Callowmere and a ring of swimming. The tunnel south is the back door to the open sea.',
  });
  b.tunnel([[7, 65], [9, 69]], 2, { seed: 41 });
  b.tunnel([[9, 73], [10, 78]], 2, { seed: 42 });
  // cave dressing
  b.props_('bones', [[6, 37], [12, 41]]).prop('giant-ribcage', 4, 41).prop('skull-pile', 11, 36).prop('stalactites', 5, 35).prop('cave-crystals', 13, 39);
  b.prop('rope-coil', 10, 49).props_('fishing-net', [[9, 51], [14, 49]]).prop('shrine', 13, 52).prop('skull-bleached', 9, 48);
  b.prop('ship-mast', 6, 31, 90).prop('rowboat', 9, 30).prop('astrolabe-stand', 5, 31).prop('debris-wood', 8, 32).prop('statue-tall-robed', 10, 31);
  b.prop('cauldron', 7, 61).prop('shelf-jars', 4, 59).prop('herbs-drying', 9, 59).prop('magic-mirror', 10, 63).prop('hammock', 4, 63).props_('bones', [[11, 61]]).prop('candle-ring', 6, 63).prop('fire-bowl', 8, 62);
  b.light(7, 61, 10, 20, '#7cff9e');
  b.props_('shelf-jars', [[1, 54], [4, 54]]).prop('crystal-ball', 2, 55).light(2, 55, 5, 10, '#a8c8ff');
  b.prop('bone-heap', 8, 71).prop('skeleton-lying', 11, 71).prop('backpack', 10, 72);
  b.encounter('Hydra pool', [2, 34, 12, 11], [['hydra', 3]], 'low');

  // ---------- Aumbrel: the drowned city, risen on its reef in the north ----------
  b.cave(null, 14, 10, 12, 9, { seed: 51, mat: 'sand' });
  b.cave(null, 31, 13, 9, 10, { seed: 52, mat: 'sand' });
  b.cave(null, 47, 9, 10, 8, { seed: 53, mat: 'sand' });
  b.cave(null, 24, 20, 8, 4, { seed: 54, mat: 'sand' });
  b.cave(null, 44, 20, 6, 3.5, { seed: 55, mat: 'sand' });
  // coral reefs: rough ground at the edges
  b.rubble(3, 15, 2, 3).rubble(14, 1, 4, 1).rubble(48, 17, 5, 2).rubble(56, 6, 1, 4).rubble(26, 23, 4, 1);
  // streets, the plaza and the canals
  b.paint(4, 12, 32, 2, 'stone-cobble');
  b.paint(36, 4, 3, 21, 'stone-cobble');
  b.water(20, 1, 2, 18, false).water(3, 19, 19, 2, false);
  b.floor(20, 12, 2, 2, 'stone-cobble').floor(20, 6, 2, 1, 'wood-planks').floor(10, 19, 2, 2, 'stone-cobble');
  b.floor(24, 9, 10, 7, 'marble');
  b.area('Plaza of Tides', [[24, 9, 10, 7]], {
    read: 'A great square of white stone, still running with seawater. A fountain of nine stone fish sits in the middle, spouting nothing. Starfish cling to the cobbles, and on every side the empty windows of the city stare at you.',
    gm: 'The heart of Aumbrel. The drowned citizens walk here at all hours, re-living the day the city sank: they will not notice the living unless touched or attacked. A DC 18 Religion check spots that they are bound to the Crown of Nine Tides, like the commodore\'s crews. Speaking the Sleep-Song here makes every ghost stop and listen.',
    label: [28, 14],
  });
  b.prop('fountain-grand', 28, 12).props_('statue-tall-robed', [[25, 10], [32, 10], [25, 14], [32, 14]]).prop('pillar-broken', 30, 15).props_('lamp-post', [[24, 9], [33, 15]]).prop('coins-small', 27, 13);
  b.area('Grand canal', [[20, 1, 2, 18]], {
    read: 'A canal of green water runs straight through the city, crossed by humped bridges. Things with long fins move along the bottom.',
    gm: 'Swimmable, and the quiet way through Aumbrel: anyone swimming the canal reaches the plaza and the south quarter unseen (DC 15 Stealth). A sunken gondola holds a +2 trident.',
    label: [20, 4],
  });
  b.prop('canoe', 21, 3).prop('mooring-post', 20, 16).prop('bridge-plank', 20, 6, 90);

  b.building('Hall of the Tide-Priests', 4, 3, 12, 7, {
    mat: 'stone-flagstone',
    read: 'Tall shelves, toppled, with their books swollen into lumps of paper. Weed hangs from the reading lamps. On the back wall, a mosaic of priests in wave-crowns kneels before a sleeping giant squid.',
    gm: 'Aumbrel\'s archive. The mosaic tells the truth plainly to a DC 16 History check: the tide-priests did not worship the kraken, they sang it to sleep. A DC 20 Perception (or a detect magic) finds the secret door in the east wall where the mosaic\'s sleeping eye is.',
    doors: [[8, 9, 's', 'closed', 'door-double'], [9, 9, 's', 'closed', 'door-double']], windows: [[4, 5, 'w'], [4, 7, 'w']],
  });
  b.wallRun(12, 3, 7, 'e').door(12, 6, 'e', 'secret');
  b.area('Reliquary of the Sleep-Song', [[13, 3, 3, 7]], {
    read: 'A dry little room, the only dry place in the city. A stone tablet stands on a lectern, covered in lines of song, and the air hums very softly, as if someone has just stopped singing.',
    gm: 'The Sleep-Song tablet (handout). Anyone who studies it for 10 minutes can lead the song. A trap guards it: lifting the tablet without first humming its first line fills the room with seawater (DC 18 Dexterity save or be swept out and slammed into the shelves for 33 (6d10) bludgeoning damage).',
    label: [14, 6],
  });
  b.props_('archive-stacks', [[6, 4], [6, 7]]).prop('bookshelf-fallen', 9, 5).prop('lectern', 10, 4).prop('scroll-pile', 8, 7).prop('table-reading', 10, 7).prop('levitating-tome', 7, 5);
  b.prop('lectern-dais', 14, 5).prop('reliquary', 14, 8).prop('candle-ring', 13, 4).prop('trap-rune-threshold', 13, 6, 0, { gm: true });
  b.light(14, 5, 5, 15, '#a8c8ff');

  b.building('House of the Pearl-Merchant', 22, 3, 8, 5, {
    mat: 'marble',
    read: 'A rich house, stripped bare by the sea. A crab the size of a dog scuttles out of a fine porcelain bath.',
    gm: 'Looted by sahuagin already, except for a strongbox behind the mirror (DC 18 Investigation). It holds 900 gp in ancient pearls and a map of the reef roads (advantage on checks to steer through the city\'s shallows).',
    doors: [[25, 7, 's', 'open']], windows: [[22, 5, 'w'], [29, 4, 'e']],
  });
  b.prop('bathtub', 23, 4).prop('mirror', 28, 4).prop('strongbox', 28, 6).prop('broken-furniture', 25, 5).prop('rug-round', 26, 5);

  b.building('Lantern tower', 31, 3, 4, 4, {
    mat: 'stone-flagstone',
    read: 'A round tower, its stair still standing. From the top you can see the whole Maw: the ring of wrecks, the turning water, the black ship and the island that is a shell.',
    gm: 'The best lookout on the map. From the top, a DC 15 Perception spots the queen on the Godstone, the chain from her flagship and the hags on the shell island. The old signal lamp can be lit to call Captain Thrale in close.',
    doors: [[32, 6, 's', 'closed']],
  });
  b.prop('stair-spiral', 33, 4).prop('telescope', 32, 4).prop('lantern-standing', 31, 5);

  b.area('Drowned market', [[4, 14, 15, 5]], {
    read: 'Stalls stand in rows under rotted awnings, still laid out with the goods of a thousand years ago: shells, salt fish turned to stone, a set of scales with barnacles in both pans.',
    gm: 'Pale figures haggle at the stalls without sound. A DC 17 Insight shows they are terrified, not hostile. The barnacled scales are a minor treasure: true scales that weigh lies (they tip whenever someone lies near them).',
    label: [10, 16],
  });
  b.props_('market-stall', [[5, 15], [9, 15], [13, 15], [16, 17]]).props_('fish-crate', [[7, 17], [11, 17]]).prop('scales', 14, 16).prop('debris-wood', 6, 18).prop('cave-crystals', 17, 14);

  b.building('Wave-Guard barracks', 24, 18, 9, 5, {
    mat: 'stone-flagstone',
    read: 'The roof has been torn off by huge hands. Inside are giant-sized bedrolls of sailcloth, a cooking fire and a pile of anchors used as dumbbells.',
    gm: 'The storm-guard\'s camp. Empty while they hold the causeway. A crate of their supplies holds 4 potions of storm giant strength (well, 2: the other two are seawater; DC 15 Medicine to tell).',
    doors: [[28, 18, 'n', 'open', 'door-double'], [32, 20, 'e', 'closed']],
  });
  b.props_('bedroll', [[25, 19], [25, 21]]).prop('campfire', 29, 20).props_('anchor', [[31, 19], [27, 21]]).prop('supplies', 30, 21).light(29, 20, 10, 20);

  b.area('Tomb-garden', [[38, 17, 12, 7]], {
    read: 'Statues of kings stand in a garden of black coral, each one with a stone fish in its open hand. Their faces have been chiselled off.',
    gm: 'The drowned kings of Aumbrel. Ondrava defaced them: she says the city\'s kings failed the sea. A DC 18 History check: the faceless statues once held the crown that is now on her head, and the inscription says "Who wears it, drowns".',
    label: [44, 20],
  });
  b.props_('statue-tall-knight', [[40, 18], [43, 18], [46, 18], [49, 19]]).props_('tree-dead', [[41, 21], [47, 21]]).prop('sarcophagus-effigy', 44, 22).prop('crystal-cluster', 39, 22);

  b.area('Sea Gate of Aumbrel', [[34, 21, 7, 3]], {
    read: 'A great arch of white stone stands at the edge of the city, and beyond it the old road runs on into the sea, straight toward the turning water.',
    gm: 'The city end of the Causeway of Kings. From here the storm-guard see anyone who comes along the causeway.',
    label: [37, 22],
  });
  b.prop('archway-grand', 37, 22).props_('statue-tall-winged', [[35, 22], [39, 22]]);

  // the Temple of the Ninth Tide
  b.building('Temple of the Ninth Tide', 40, 2, 16, 14, {
    mat: 'marble',
    read: 'Pillars of green-veined stone hold up a roof painted with stars. The middle of the temple is a pool, open to the deep. The water in it is perfectly still, and something under it is watching you.',
    gm: 'The tide-priests\' temple, where the Crown of Nine Tides was kept. Ulloch the aboleth has been here since before the city sank; the priests were its servants once, until they rebelled and walled it in the nave pool. Glyphs in the floor still keep it in the water: a DC 19 Arcana check reads them, and scraping them away frees it.',
    doors: [[47, 15, 's', 'closed', 'door-double'], [48, 15, 's', 'closed', 'door-double'], [55, 9, 'e', 'closed']],
    windows: [[40, 8, 'w'], [55, 5, 'e']],
  });
  b.wallRun(40, 4, 16, 's').door(47, 4, 's', 'closed', 'door-double').door(48, 4, 's', 'closed', 'door-double');
  b.wallRun(40, 12, 16, 's').door(47, 12, 's', 'open', 'door-double').door(48, 12, 's', 'open', 'door-double');
  b.door(40, 3, 'w', 'secret');
  b.water(45, 6, 6, 6, true);
  b.area('Flooded nave', [[44, 5, 8, 8]], {
    read: 'The pool in the nave goes down and down. Three great eyes, one above the other, open in the dark below the surface, and a voice speaks inside your head as gently as a friend.',
    gm: 'Ulloch, with its chuul servants and two water elementals bound to the pool. It would rather talk than fight (see its profile). It knows the Sleep-Song and the weakness of the crown. Glyphs under the floor (gm trap marks) stop it leaving the nave.',
    label: [47, 8],
  });
  b.area('Sanctum of the Crown', [[40, 2, 16, 3]], {
    read: 'A narrow room behind the nave. On a plinth of black coral sits a cushion of rotted silk, and on the cushion, the ring-shaped dent where a crown sat for a thousand years.',
    gm: 'The Crown of Nine Tides lay here until Ondrava took it. A DC 17 Arcana check on the plinth shows the crown was meant to be worn by no one: it was a lock, not a crown. A secret door in the west wall (DC 18 Perception) lets out onto the Processional Way.',
    label: [44, 3],
  });
  b.props_('column-fluted', [[43, 5], [43, 8], [43, 11], [52, 5], [52, 8], [52, 11]]).prop('plinth-display', 47, 2).prop('crown-cushion', 48, 2).props_('brazier-everburning', [[42, 3], [53, 3]]);
  b.props_('trap-rune-threshold', [[44, 7], [51, 9]], 0, { gm: true }).prop('altar-reredos', 41, 9).prop('idol', 54, 9).props_('pew', [[41, 6], [54, 6], [41, 11], [54, 11]]).prop('font', 47, 14).props_('candelabra-grand', [[41, 14], [54, 14]]);
  b.light(47, 8, 10, 25, '#7fd8c8').light(42, 3, 10, 15, '#a8c8ff').light(53, 3, 10, 15, '#a8c8ff');
  b.encounter('Drowned streets', [4, 10, 30, 12], [['wraith', 4], ['ghost', 4]], 'low');
  b.encounter('Flooded nave', [44, 5, 8, 8], [['aboleth', 1], ['chuul', 3], ['waterElemental', 2]], 'low');

  // the Causeway of Kings: the old road from the Sea Gate to the Godstone
  b.floor(36, 24, 3, 9, 'stone-cobble');
  b.water(36, 28, 3, 1, false).rubble(37, 30, 2, 1);
  b.area('The Causeway of Kings', [[35, 24, 5, 9]], {
    read: 'A road of fitted stone runs out of the city into the sea, ankle-deep and then knee-deep, toward the whirlpool. Giants stand on it, waist-deep in spray, their spears crackling with lightning.',
    gm: 'The straight way to the Godstone, and the storm-guard hold it: Aldrem, a second storm giant, water elementals and giant sharks. One stretch is under the current (DC 18 Athletics or be swept 20 ft toward the Throat). Aldrem can be turned (see his profile).',
    label: [37, 26],
  });
  b.props_('statue-tall-knight', [[35, 25], [39, 25], [35, 30], [39, 30]]).prop('column-collapsed', 36, 31).prop('war-banner', 38, 24);
  b.encounter('Causeway of Kings', [32, 22, 11, 10], [['stormGiant', 2], ['waterElemental', 4], ['giantShark', 3]], 'moderate');

  // ---------- the Maw: the whirlpool, the Teeth, the Godstone and the Throat ----------
  const MX = 38, MY = 41;
  for (let y = MY - 3; y <= MY + 3; y++)
    for (let x = MX - 3; x <= MX + 3; x++) if ((x + 0.5 - MX) ** 2 + (y + 0.5 - MY) ** 2 <= 2.7 ** 2) b.pit(x, y, 1, 1);
  b.rock(45, 44, 2, 2).rock(41, 48, 2, 2).rock(35, 48, 2, 2).rock(31, 44, 2, 2).rock(31, 38, 2, 2).rock(45, 38, 2, 2);
  b.floor(34, 33, 8, 3, 'marble').rubble(34, 35, 1, 1).rubble(41, 33, 1, 1);
  b.area('The Maw', [[26, 29, 25, 24]], {
    read: 'The sea turns. A whirlpool as wide as a town square spins slowly around a hole in the world, and the wrecks of a hundred ships go round and round it like leaves in a drain. Lightning walks across the clouds above it, and the roar never stops.',
    gm: 'The currents: anyone swimming or in a boat in the Maw starts each turn pulled 20 ft toward the Throat unless they succeed on a DC 20 Strength (Athletics) check (DC 18 for a rowed boat, made by the rower). Six spires of black rock, the Teeth, stick up in a ring: grabbing one stops the pull (DC 12 Athletics). Flying above it is safe from the water but not the storm (see tips).',
    label: [28, 46],
  });
  b.area('The Godstone', [[34, 33, 8, 3]], {
    read: 'A long slab of white stone juts from the whirlpool, carved with three great runes that burn blue. On it stands a giant woman in a crown of water, singing, and the sea sings back.',
    gm: 'Where the crown\'s bond is anchored. The three rune-stones are the knots of the binding (AC 18, 50 hp each, immune to non-magical damage; or quenched one at a time by singing a verse of the Sleep-Song beside it, an action and a DC 18 Performance or Religion check). The chain from the Wrathwater is made fast to its east end.',
    label: [37, 34],
  });
  b.area('The Throat', [[35, 38, 7, 7]], {
    read: 'At the centre of the whirlpool the water drops away into a funnel of black nothing. Far down it, something vast shifts, and a single eye as big as a cartwheel opens and looks up at you.',
    gm: 'Ninefathom\'s lair. A creature that ends its turn in the Throat is pulled down 60 ft into the dark; climbing back out takes a DC 22 Athletics check (or flight). The kraken\'s hoard lies far below (see the last scene).',
    label: [38, 41],
  });
  b.props_('rune-stone', [[35, 34], [38, 33], [41, 34]]).prop('idol-colossal', 37, 35).prop('magic-circle', 38, 34).prop('altar', 39, 35);
  b.prop('whirlpool', 38, 41).props_('rapids', [[30, 35], [46, 35], [28, 41], [48, 41], [30, 50], [46, 50], [38, 52], [38, 30]]).props_('debris-wood', [[33, 46], [43, 36], [29, 33]]).prop('burning-wreckage', 47, 47).props_('deep-water', [[34, 44], [42, 44]]);
  b.light(38, 34, 15, 30, '#7fb8ff').light(38, 41, 5, 20, '#4f86a6');
  b.encounter('Whirl-guardians', [30, 46, 20, 7], [['waterElemental', 6], ['giantShark', 2]], 'low');
  b.encounter('Ninefathom rises', [30, 32, 17, 14], [['kraken', 1], ['stormGiant', 1]], 'high');

  // ---------- the Hulkhold: a ring of wrecks lashed together around the south and west of the Maw ----------
  b.cave('Signal hulk', 21, 32, 3, 3.5, {
    seed: 61, mat: 'wood-planks-dark', wobble: 0,
    read: 'A tall-masted wreck, tilted so far over that its mast leans across the water like a bridge. A brazier of whale-fat sits in the crow\'s nest, unlit.',
    gm: 'The ring\'s alarm. If a reaver lights the brazier (an action; it can be seen from everywhere on the map) every fight in the Hulkhold is warned and the commodore comes to the noise. A rope bridge climbs north to the reefs of Aumbrel.',
  });
  b.cave("Reavers' mess", 19, 43, 3, 4.5, {
    seed: 62, mat: 'wood-planks', wobble: 0,
    read: 'Long tables on a sloping deck. Drowned sailors sit at them in rows, lifting empty spoons to their mouths, again and again.',
    gm: 'The commodore\'s dead crews, at rest between watches. They ignore anyone wearing a crew-token from the Gatehulk. Otherwise they stand up, slowly, and all of them shout for the commodore.',
  });
  b.building("Reavers' galley", 17, 41, 4, 4, { read: 'A cramped galley that smells of brine and old smoke. Nobody has cooked here in years.', gm: 'A cold stove and a barrel of salt pork older than anyone\'s grandmother. A barrel of crew-tokens (lead fish on cords) sits by the door.', doors: [[20, 42, 'e', 'open']] });
  b.cave('Cage-hulk', 25, 54, 4.5, 3.5, {
    seed: 63, mat: 'wood-planks-dark', wobble: 0,
    read: 'A round, fat barge hung with cages, every one of them lowered half into the sea. The people in them hold their chins up out of the water. Some of them are singing to keep each other awake.',
    gm: 'Twenty-three sailors from Port Callowmere, taken from the ships the kraken sank, kept to be drowned at the Black Tide as the last offerings. Chuul and sahuagin keep them. Freed, they tell the heroes about the crown, the tide clock and the shell island\'s hags. The Lark\'s lost bosun, Tobin Fell, is here.',
  });
  b.cave('Gatehulk', 38, 59, 7, 3, {
    seed: 64, mat: 'wood-planks', wobble: 0,
    read: 'The biggest wreck in the ring, a warship snapped in two and nailed back together. A gate of iron spars hangs from its masts across the only gap in the ring, and a drowned man in an admiral\'s coat stands under it with his hands behind his back.',
    gm: 'The front door of the Maw. Commodore Voss and his wights take a toll from anyone passing: a living sailor, or something precious. He can be talked round (DC 21 Persuasion, or show him the decree and promise to break the crown): he hates the queen who drowned his fleet. Otherwise he fights.',
  });
  b.building("Commodore's cabin", 40, 58, 5, 3, {
    mat: 'wood-planks-dark',
    read: 'Charts, a sword rack and a portrait of a laughing woman, all dripping.',
    gm: 'Voss\'s cabin. His sea chest is unlocked; he would give it freely to anyone who frees him. The portrait is his wife, long dead in Port Callowmere.',
    doors: [[40, 59, 'w', 'closed']], windows: [[42, 58, 'n']],
  });
  b.cave('Lashed galleys', 51, 56, 4, 2.5, {
    seed: 65, mat: 'wood-planks', wobble: 0,
    read: 'A raft of rowboats and galleys roped together, gunwale to gunwale, bumping and creaking.',
    gm: 'The ring\'s boats. Cutting a galley loose takes a minute (DC 14 Sleight of Hand to do it quietly): a 12-oar keelboat that seats eight. The best boat on the map for crossing the Maw.',
  });
  b.cave('Pitch-hulk', 56, 47, 2.5, 4, {
    seed: 66, mat: 'wood-planks-dark', wobble: 0,
    read: 'A low, black wreck stacked with barrels. The deck is sticky, and the whole ship stinks of whale oil.',
    gm: 'The ring\'s fuel store. Cut its lines and set it alight and it rides the current around the Maw and slams into the Wrathwater three rounds later: 55 (10d10) fire damage to everything on the flagship\'s deck, and the deck burns for a minute. Steering it there takes a DC 17 Wisdom (vehicles or Survival) check.',
  });
  b.hall(21, 35, 20, 39, 1, { mat: 'wood-planks' }).hall(20, 47, 23, 51, 1, { mat: 'wood-planks', downFirst: true }).hall(29, 55, 32, 58, 1, { mat: 'wood-planks' });
  b.hall(45, 59, 47, 56, 1, { mat: 'wood-planks' }).hall(54, 54, 55, 50, 1, { mat: 'wood-planks' }).hall(21, 24, 21, 28, 1, { mat: 'wood-planks', downFirst: true });
  b.props_('bridge-rope', [[21, 26], [20, 37], [21, 49], [31, 57], [46, 58], [55, 52]], 90);
  b.prop('crows-nest', 21, 31).prop('ship-mast', 22, 33, 45).prop('fire-bowl', 20, 30).prop('rope-coil', 22, 34).prop('lantern-hanging', 20, 33);
  b.props_('table-long', [[18, 46], [20, 46]]).props_('bench-long', [[17, 47], [21, 47]]).prop('stove', 18, 42).prop('barrel', 19, 44).prop('skeleton-seated', 19, 39).prop('keg-rack', 20, 41);
  b.props_('cage-hanging', [[22, 52], [24, 51], [27, 52], [28, 55], [22, 56]]).props_('cage', [[24, 56], [26, 57]]).prop('prison-bars', 23, 54).prop('winch', 26, 54).prop('wall-chains', 28, 53).prop('fishing-net', 21, 54);
  b.prop('gate-iron-tall', 36, 56).prop('ship-mast', 34, 59).prop('ballista', 32, 59).prop('war-banner', 37, 57).props_('weapon-rack', [[33, 60], [38, 61]]).prop('anchor', 36, 61).prop('gangplank', 31, 60, 90);
  b.prop('table-maps', 42, 59).prop('chest', 43, 60).prop('weapon-rack', 41, 58).prop('wardrobe', 44, 58);
  b.props_('rowboat', [[48, 55], [50, 57], [53, 56]], 90).prop('canoe', 49, 58).prop('cargo-crates', 52, 55).prop('mooring-post', 54, 57).prop('sails-pile', 51, 56);
  b.props_('barrel-stack', [[55, 45], [57, 49]]).props_('barrel-group', [[56, 44], [55, 49]]).prop('oil-slick', 56, 47).prop('tar-pit', 57, 46);
  for (const [x, y] of [[20, 33], [19, 45], [25, 54], [36, 59], [42, 59], [51, 56]]) b.light(x, y, 10, 20, '#9fd3ff');
  b.encounter('Cage-hulk keepers', [20, 50, 10, 8], [['chuul', 4], ['sahuagin', 16], ['giantShark', 3]], 'low');
  b.encounter('Gatehulk reavers', [31, 55, 15, 8], [['vampire', 1], ['wight', 6]], 'low');

  // ---------- the Wrathwater: the queen's flagship, moored at the north-east edge of the Maw ----------
  b.cave('The Wrathwater', 68, 14, 5.5, 10, {
    seed: 71, mat: 'wood-planks-dark', wobble: 0,
    read: 'A ship built for giants, black-hulled, its masts as tall as towers. Its sails are made of the sails of other ships, stitched together. A chain with links as big as a cart runs from its bow down into the whirlpool.',
    gm: 'Ondrava\'s flagship, held by two storm giant Tide-Wardens, the court mage Quillon Ashe (archmage) and two invisible stalkers bound to watch the hold. The queen is not aboard: she has been singing on the Godstone for three days.',
  });
  b.building("Queen's stateroom", 65, 6, 7, 4, {
    mat: 'wood-planks',
    read: 'A cabin as big as a chapel. Seawater stands an inch deep on the floor. A bed built for a giant has never been slept in; beside it, a small child\'s wooden boat sits on a shelf.',
    gm: 'Ondrava cannot sleep any more: the crown keeps her lungs half full of sea. On the desk is Aldrem\'s unsent letter to her (handout). The queen\'s war chest is here.',
    doors: [[68, 9, 's', 'closed', 'door-double']], windows: [[65, 7, 'w'], [71, 7, 'e']],
  });
  b.prop('bed-four-poster', 66, 7).prop('war-table', 69, 7).prop('chest', 70, 8).prop('shelf-jars', 67, 6).prop('rug', 68, 8);
  b.building('The hold', 65, 13, 7, 5, {
    mat: 'wood-planks',
    read: 'Below decks, in a cage of bronze bars, lies an egg as big as a rowing boat, its shell patterned like a turtle\'s back. It is warm. Something inside it knocks.',
    gm: 'Grandmother Shellback\'s egg, stolen to keep her obedient. Two invisible stalkers guard it and attack anyone who touches the cage without the queen\'s word. The egg weighs 800 lb: carrying it needs a plan (a floating disk, a giant\'s strength, the hold\'s winch and a boat).',
    doors: [[68, 13, 'n', 'closed']],
  });
  b.prop('cage', 68, 15).prop('orb-pedestal', 68, 16).props_('cargo-crates', [[66, 14], [70, 14]]).prop('barrel-group', 66, 16).prop('winch', 70, 16);
  b.props_('ship-mast', [[68, 11], [68, 19]]).prop('ship-wheel', 68, 5).prop('cargo-hatch', 66, 11).props_('ballista', [[64, 19], [72, 19]]).prop('anchor', 68, 23).prop('war-banner', 70, 11).prop('throne-dais', 68, 21).prop('sails-pile', 66, 22).prop('rope-coil', 70, 22).prop('crows-nest', 67, 19);
  b.light(68, 11, 10, 20, '#9fd3ff').light(68, 21, 10, 20, '#9fd3ff').light(68, 15, 5, 10, '#ffb35c');
  line(b, 68, 24, 42, 34, 'dungeon-slab');
  b.area('The anchor chain', [[42, 24, 27, 11]], {
    read: 'The flagship\'s chain runs down from its bow into the spray, each link wide enough to walk on. It hums under your feet like a plucked string.',
    gm: 'A walkway from the Wrathwater to the Godstone. Crossing takes a DC 15 Acrobatics check each round in the wind (fail by 5 or more: fall into the Maw). Snapping it (AC 19, 120 hp) sends the Wrathwater spinning into the whirlpool, where it breaks up in 10 rounds.',
    label: [55, 29],
  });
  b.encounter("Wrathwater's deck", [61, 3, 14, 22], [['stormGiant', 2], ['archmage', 1], ['invisibleStalker', 2]], 'moderate');

  // ---------- Shellback Isle: the shell of a dead giant turtle, and the live one that nests in it ----------
  b.cave('Shellback Isle', 70, 46, 8, 10, {
    seed: 81, mat: 'stone-flagstone-warm', wobble: 0.05,
    read: 'The island is a shell: a dome of ridged plates as long as a village street, green with moss and palms, cracked open in the middle around a lagoon. Something in the lagoon breathes, slow and huge, and the whole island shudders when it does.',
    gm: 'The shell of the Firstmother, a dragon turtle older than the sea-lanes. Her descendant, Grandmother Shellback, nests in the lagoon. Two Brackwife hags keep her obedient with the Hookthorn, a cursed harpoon in her back chained to a stake on the shell.',
  });
  for (const [cx, cy] of [[62, 40], [78, 40], [62, 53], [78, 53]]) b.cave(null, cx, cy, 2.2, 1.6, { seed: cx + cy, mat: 'stone-flagstone-warm', wobble: 0 });
  b.cave(null, 70, 57, 1.5, 2, { seed: 82, mat: 'stone-flagstone-warm', wobble: 0 });
  b.paint(63, 44, 2, 6, 'sand').paint(75, 43, 2, 7, 'sand').paint(66, 53, 8, 2, 'grass');
  b.pool(70, 47, 4, 5, true);
  b.area('Nesting lagoon', [[66, 43, 9, 9]], {
    read: 'Warm water, steaming in the rain. A dragon turtle bigger than a fishing boat lies in it with only her eyes and the top of her shell showing. A barbed harpoon is sunk into her back, and the skin around it is grey and weeping.',
    gm: 'Grandmother Shellback. With the Hookthorn in her she must obey the hags. Pulling it: three DC 22 Strength (Athletics) checks in a row while she thrashes (each failure: 13 (2d12) piercing damage), or a remove curse at 7th level or higher, or break the hag-eye in the Firstmother\'s skull and she tears it out herself.',
    label: [70, 47],
  });
  b.rock(65, 30, 11, 6);
  b.cave("Firstmother's skull", 70, 32.5, 2.5, 1.8, {
    seed: 83, mat: 'cave-floor', wobble: 0.05,
    read: 'Inside the skull of the dead turtle, bone arches up like a cathedral. Rain drips through the eye-holes. The hags have hung charms of fish-bone and hair all over the walls.',
    gm: 'The hags\' workshop. A DC 19 Perception (or detect magic) finds the loose bone plate in the east wall: behind it, in a tiny niche, is the hag-eye that powers the Hookthorn.',
  });
  b.floor(70, 33, 1, 3, 'cave-floor').floor(72, 32, 2, 1, 'cave-floor');
  b.room('Eye niche', 74, 32, 1, 2, {
    mat: 'cave-floor',
    read: 'A wet eye in a jar of brine turns to look at you.',
    gm: 'The hag-eye. Smashing it (AC 10, 5 hp) makes both Brackwife sisters on the island scream and lose their spellcasting for a minute, and Grandmother Shellback rips the Hookthorn out of her own back. She does not forget who helped her.',
    label: [74, 32],
  });
  b.door(73, 32, 'e', 'secret');
  b.props_('tree-palm', [[64, 41], [76, 41], [65, 51], [75, 52], [72, 39], [67, 55]]).prop('giant-ribcage', 64, 47).prop('skull-bleached', 76, 47).props_('boulder', [[73, 55], [66, 38]]);
  b.prop('sword-in-stone', 69, 41).prop('chains-hanging', 70, 42).prop('tent', 74, 39).prop('cauldron-tripod', 76, 45).prop('campfire', 74, 44).prop('bedroll', 75, 40);
  b.props_('cobweb-corner', [[68, 32], [72, 32]]).prop('herbs-drying', 69, 32).prop('altar', 71, 33).prop('candles', 70, 34).prop('jewelry-box', 74, 33);
  b.light(74, 44, 10, 20, '#7cff9e').light(70, 32, 5, 10, '#7cff9e');
  b.encounter("Shellback's wrath", [61, 36, 18, 20], [['dragonTurtle', 1], ['giantShark', 6], ['seaHag', 2], ['waterElemental', 2]], 'moderate');

  // ---------- Kelpdeep: the merfolk hide in a kelp forest in the south-east ----------
  b.cave('Kelpdeep', 68, 70, 5, 3, {
    seed: 91, mat: 'sand',
    read: 'Kelp as tall as trees sways under the clear shallows, and a sandbar rises in the middle with a ring of standing stones on it. Faces watch you from the weed, then duck under.',
    gm: 'The last free merfolk of the Sundering Isles hide here, about forty of them. Speaker Lirien Wavecall comes up to talk if the heroes show open hands. A sahuagin war band hunts the kelp: if the heroes arrive while it attacks, the merfolk are theirs for life.',
  });
  b.rubble(60, 64, 3, 2).rubble(75, 75, 3, 2).rubble(64, 76, 2, 2);
  b.props_('reeds', [[60, 68], [62, 72], [74, 66], [77, 70], [65, 75], [71, 76], [58, 74]]).props_('grass-tall', [[61, 66], [76, 73], [63, 70], [73, 64], [69, 77]]).props_('lily-pads', [[66, 65], [72, 74]]);
  b.prop('shrine', 68, 70).props_('standing-stone', [[65, 69], [71, 69], [68, 72]]).prop('fishing-net', 66, 71).prop('coins-small', 70, 71).prop('cave-crystals', 61, 64);
  b.light(68, 70, 10, 20, '#86c7ff');
  b.encounter('Raid on the kelp', [58, 62, 21, 17], [['sahuagin', 24], ['giantShark', 5]], 'low');

  // ---------- the open sea in the south, and the Stubborn Lark ----------
  b.rock(24, 70, 2, 2).rock(53, 74, 2, 1).rock(20, 64, 1, 2).rock(47, 67, 2, 1);
  b.cave('The Stubborn Lark', 40, 73, 6.5, 2.2, {
    seed: 99, mat: 'wood-planks', wobble: 0,
    read: 'Your sloop rides at anchor at the edge of the storm. Ahead, the sea turns slowly around a hole in the world. The crew have gone quiet. Nobody is telling jokes any more.',
    gm: 'The heroes\' ship and safe place. Captain Thrale will hold here, outside the ring, for three days. She lends her two longboats and sends the Lark in close only at a signal from the Lantern tower or the Signal hulk, and only once.',
  });
  b.building("Thrale's cabin", 43, 72, 3, 3, { read: 'A tiny cabin that rolls with every wave. A chart is pinned flat with a knife.', gm: 'Charts, a hammock and a bottle kept for the day the kraken dies. The chart of the Maw (handout) is on the table.', doors: [[43, 73, 'w', 'closed']] });
  b.prop('ship-mast', 39, 73).prop('ship-wheel', 42, 73).prop('table-maps', 44, 73).prop('hammock', 45, 72).props_('rowboat', [[34, 75], [46, 76]], 90).prop('anchor', 34, 72).props_('barrel', [[36, 74], [41, 72]]).prop('rope-coil', 37, 72).prop('lantern-hanging', 40, 74);
  b.light(40, 74, 10, 20).light(44, 73, 5, 10);
  b.note(40, 77, 'The heroes start here. Outside the ring the sea is rough but safe.');
  b.start(36, 72, 3, 2);
  return b.build();
}

export const KRAKEN_MAW: Adventure = {
  id: 'kraken-maw',
  title: "The Kraken's Maw",
  tagline: 'A storm-giant queen has leashed a kraken and means to make it a god. Sail into the whirlpool and break the leash.',
  levels: '19',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['high level', 'sea', 'kraken', 'giants', 'epic'],
  pitch: `For a month no ship has crossed the Sundering Isles and come home. The kraken that the old songs called Ninefathom is awake, and it has swallowed the sea-lanes whole. Where it passes, the sea boils, and drowned cities rise out of it, white and empty, streaming weed. Now the whole sea between the islands is turning, slowly, into one vast whirlpool, and at its centre, the sailors say, a giant woman in a crown of water is singing. Port Callowmere is next. The heroes have three days.`,
  secret: `Ondrava Saltcrown is a storm giant queen, exiled from her people for drowning a war fleet in a fit of grief. When the kraken's thrashing raised the drowned city of Aumbrel, she found the Crown of Nine Tides in its temple: the lock the city's tide-priests made to sing Ninefathom to sleep a thousand years ago. She put it on, and instead of sleeping, the kraken woke and answered her. She now believes the sea's gods abandoned it, and she will give it one that obeys. Every sailor the kraken drowns is bound to the crown. At the Black Tide, three days from now, the crown will hold nine thousand drowned souls, and Ninefathom will rise as a god of the sea, with Ondrava as its queen. Its first offering will be Port Callowmere. What she does not know: the crown drowns whoever wears it. Her lungs are filling with seawater, slowly. Her son Aldrem has noticed she no longer sleeps.`,
  hooks: [
    'The harbour council of Port Callowmere hires the heroes for 30,000 gp and their pick of the city\'s treasury: "Kill it, chain it or send it back to sleep. We do not care which."',
    'Captain Wenna Thrale of the Stubborn Lark, the last ship to come out of the Maw, needs a crew mad enough to go back in. Her wife\'s ship is down there.',
    'A storm giant herald finds the heroes: the giants\' high court wants their exiled queen stopped before she drags all giantkind into her war on the sea. Bring her back alive, if you can.',
  ],
  tips: [
    'Getting around: most of the map is sea. Deep water is swimming (half speed, and heavy armour sinks). Ways across: the Lark\'s two longboats, a keelboat cut loose from the Lashed galleys, Lirien\'s six pearls of water breathing, flight, water walking, and three walkways: the wreck-ring\'s rope bridges, the Causeway of Kings and the anchor chain. At level 19 the heroes have magic for this. Let them use it, and let the storm make it interesting.',
    'The storm: anyone flying in the open makes a DC 15 Strength saving throw at the end of each turn or is blown 15 ft in a direction you choose. Once per round on initiative 20, lightning strikes the tallest thing in the open: DC 15 Dexterity save, 22 (4d10) lightning damage, half on a success. Set the app\'s weather to Storm.',
    'Black Tide clock: 6 tides. A long rest, a long detour or about an hour of play costs one. At 2 tides left, the sea starts rising: the Lashed galleys and Kelpdeep are under deep water. At 0, the ritual ends: Ninefathom becomes a god, Port Callowmere drowns, and the last fight starts with the kraken at full power and the queen beyond reach (see the ending).',
    'Most fights can be turned: Commodore Voss lets the heroes through for a promise, Ulloch trades knowledge, Nettle sells secrets, Aldrem stands down if shown the truth, and Shellback turns on the queen if the Hookthorn is pulled or her egg returned. Every ally won joins the last fight. Reward a deal like a win.',
    'Breaking the bond: take the crown from Ondrava and smash it (AC 20, 60 hp), or quench the Godstone\'s three runes. When the bond breaks, the kraken is free. Then the heroes can sing it to sleep with the Sleep-Song, let it take its revenge on the queen, or fight it to the death.',
    'Scaling: for 3 heroes, keep the queen out of the last fight until the kraken is bloodied (she arrives on round 3). For 5 heroes, add 2 water elementals to the Causeway, the shell island and the last fight.',
  ],
  npcs: [
    {
      id: 'pf_kmondrava', name: 'Ondrava Saltcrown', title: 'exiled storm giant queen', kind: 'monster', art: 'stormGiant', monsterId: 'stormGiant', shared: true,
      wants: 'A god for the sea that will not abandon it, and herself at its side forever.', knows: 'The crown binds every drowned soul to Ninefathom. The Black Tide finishes the work. She does not know the crown is killing her.',
      voice: 'Low and beautiful, with a bubbling under every word, as if she is speaking from underwater. Never shouts.', appearance: 'Twenty-five feet tall, skin the colour of storm cloud, hair of white foam. On her head a crown of water that never stops moving.',
      backstory: 'Queen of a giant city in the cloud-cliffs, she lost her daughter to a shipwreck and drowned the fleet that failed to save her. Her people exiled her to the sea. She has been angry at the sea ever since, and in love with it.',
      gmNotes: 'Storm giant stat block. While she wears the crown, Ninefathom will not harm her. Taking the crown off her (grapple, or while she is incapacitated) stops the drowning: she drops to 0 hit points unless healed, and then she weeps and surrenders. Her memory jar (Nettle\'s niche) or Aldrem pleading gives advantage to turn her.',
    },
    {
      id: 'pf_kmninefathom', name: 'Ninefathom', title: 'the kraken of the Maw', kind: 'monster', art: 'kraken', monsterId: 'kraken',
      wants: 'Freedom from the leash, the deep dark and revenge on whoever holds it.', knows: 'Everything the drowned know. It speaks into minds when it wishes.',
      voice: 'Telepathic and enormous: slow words, each one a wave. Calls everyone "small ones".', appearance: 'A squid as long as a war galley, its skin dark green and covered in barnacle-cities, with one blind white eye and one awake and gold.',
      gmNotes: 'Kraken stat block. Bound, it fights for the queen and cannot target her. Freed, it attacks the queen first, then whoever is nearest. At half hit points it dives into the Throat and does not come back for a hundred years. The full Sleep-Song (three rounds, DC 20 Performance each, by different singers or one) puts it to sleep for a thousand.',
    },
    {
      id: 'pf_kmaldrem', name: 'Aldrem Saltcrown', title: 'the queen\'s son and herald', kind: 'monster', art: 'stormGiant', monsterId: 'stormGiant', shared: true,
      wants: 'His mother well again, and an end to the drownings he is too loyal to stop.', knows: 'His mother has not slept in a month and coughs up seawater. He does not know why.',
      voice: 'Gentle and careful, like someone holding something fragile. Bows before he fights.', appearance: 'A young storm giant with a scarred spear and a sealskin cloak, his mother\'s white hair cut short.',
      gmNotes: 'Storm giant stat block. Holds the Causeway of Kings. Show him the temple frieze or the Tomb-garden inscription and make a DC 20 Persuasion check (advantage with his unsent letter or the memory jar) and he stands down with his guard, and helps take the crown off his mother.',
    },
    {
      id: 'pf_kmshellback', name: 'Grandmother Shellback', title: 'dragon turtle of the shell island', kind: 'monster', art: 'dragon-turtle', monsterId: 'dragonTurtle',
      wants: 'Her egg back and the harpoon out of her back, in that order. Then the kraken dead.', knows: 'The kraken killed her mate. The two hags who keep her are named Kelp and Cuttle, and their power is in the Firstmother\'s skull.',
      voice: 'Grinding and old, very slow, like boulders rolling down a beach. Rumbles while she thinks.', appearance: 'A dragon turtle bigger than a fishing boat, her shell crusted with oysters, her eyes like old brass lanterns.',
      gmNotes: 'Dragon turtle stat block. Forced to fight the heroes while the Hookthorn is in her. Pull it or smash the hag-eye and she turns on the hags. Return her egg as well and she carries the heroes into the Maw and fights Ninefathom with them (she takes the kraken\'s attention for a round each time she hits it).',
    },
    {
      id: 'pf_kmulloch', name: 'Ulloch', title: 'the thing in the temple pool', kind: 'monster', art: 'aboleth', monsterId: 'aboleth',
      wants: 'Out of the pool, and the kraken for itself.', knows: 'The whole Sleep-Song, the crown\'s true purpose, and that the crown drowns its wearer. It remembers the day Aumbrel sank.',
      voice: 'A soft, kind voice in your head that sounds like someone you trust. It never says "I", only "we".', appearance: 'A slime-covered fish as long as a ship, with three red eyes stacked down its side and four long tentacles.',
      gmNotes: 'Aboleth stat block. Trades the full Sleep-Song or the secret of the crown for being let out (scraping the glyphs, DC 19 Arcana). If freed it helps against the queen, then tries to enslave the sleeping kraken itself: a problem for another day. If attacked it tries to enslave the strongest hero first.',
    },
    {
      id: 'pf_kmnettle', name: 'Nettle Brackwife', title: 'the third sister of the coven', kind: 'monster', art: 'sea-hag', monsterId: 'seaHag',
      wants: 'Revenge on her two sisters, who cheated her of the queen\'s pay. And a pretty new memory for her collection.', knows: 'The Hookthorn\'s power is in the hag-eye in the Firstmother\'s skull. The crown drowns its wearer. The hydras answer her whistle.',
      voice: 'Sweet as honey, calls everyone "duckling", laughs at the wrong moments.', appearance: 'A crooked old woman with barnacles on her cheeks, a shawl of fishing net and very long green fingernails.',
      gmNotes: 'Sea hag stat block. Price for each secret: one happy memory (the hero forgets it; they gain a level of exhaustion that a long rest will not clear for a week), or the hero\'s reflection for a year. She keeps bargains to the letter.',
    },
    {
      id: 'pf_kmvoss', name: 'Commodore Halloran Voss', title: 'drowned master of the Hulkhold', kind: 'monster', art: 'vampire', monsterId: 'vampire',
      wants: 'To rest, and his dead sailors to rest. Failing that, to see the queen drown.', knows: 'The ring\'s layout, the guard rotas and that the queen sings on the Godstone day and night.',
      voice: 'Clipped and formal, an officer to the end. Water runs out of his mouth when he is angry.', appearance: 'A grey, bloated man in a fine blue coat gone black with sea, gold braid green with rot, eyes like drowned pearls.',
      backstory: 'His fleet sailed out of Callowmere to fight the kraken and never came back. The crown raised them all and set them to guard the thing that killed them.',
      gmNotes: 'Vampire stat block (the crown\'s power, not a vampire\'s curse: he needs no blood). He must obey the crown but hates it. Promise to break it and pass a DC 21 Persuasion check and he lets the heroes through and gives them crew-tokens. When the crown breaks he and his crews crumble into salt, thanking them.',
    },
    {
      id: 'pf_kmthrale', name: 'Captain Wenna Thrale', title: 'master of the Stubborn Lark', kind: 'npc', art: 'ship-captain', monsterId: 'veteran', shared: true,
      wants: 'The kraken dead, and to know what happened to her wife Mira\'s ship.', knows: 'The currents of the Maw, the ring of wrecks, and that the whirlpool is getting faster every day.',
      voice: 'Dry and fast, with a sailor\'s swearing she apologises for. Calls the kraken "the landlord".', appearance: 'A small, weathered woman in an oilskin coat, with a brass spyglass on a cord and a grey braid tied with fishing line.',
      gmNotes: 'Her wife\'s ship, the Kittiwake, is one of the wrecks lashed into the ring (the Lashed galleys). Mira is a drowned sailor in the Reavers\' mess.',
    },
    {
      id: 'pf_kmlirien', name: 'Lirien Wavecall', title: 'speaker of the merfolk of Kelpdeep', kind: 'npc', art: 'merfolk', monsterId: 'merfolkSkirmisher', shared: true,
      wants: 'Her people safe, and the sahuagin driven out of the kelp.', knows: 'Every reef and current in the isles. Six pearls of water breathing are the merfolk\'s last treasure. The queen\'s sharks are hungry and badly trained.',
      voice: 'Quiet and musical, a little formal, and she always speaks with her tail half in the water.', appearance: 'A merfolk woman with silver-blue scales, shell earrings and a spear with a coral point.',
      gmNotes: 'Gives the six pearls of water breathing (each works as a potion of water breathing for 24 hours) to heroes who help her people. Her scouts can guide a boat through the Maw\'s currents: advantage on the first Athletics check.',
    },
  ],
  handouts: [
    { id: 'km-chart', title: "Captain Thrale's chart of the Maw", text: 'The whirlpool: FASTER EVERY DAY. Do not go in without a line tied off.\nA ring of wrecks round the south and west side, roped together. A gate in it on the south. Dead men on the gate.\nNorth: a white city that came up out of the sea a month ago. A road from it goes INTO the whirlpool.\nEast: an island that moves when you are not looking at it.\nNorth-east: a black ship, giant-sized. A chain from its bow to a rock in the middle.\nIn the middle: the landlord. -W.T.' },
    { id: 'km-decree', title: 'Decree nailed to the gate of the Hulkhold', text: 'BY ORDER OF ONDRAVA, QUEEN OF THE SEA AND ALL THAT SINKS.\nThe sea-lanes are closed. Every ship that sails them belongs to the Deep.\nEvery sailor who drowns is given a place in the Choir of the Ninth Tide.\nAt the Black Tide the Choir is complete, and the sea shall have a god.\nThe first offering is Callowmere. Callowmere has three days to pray.' },
    { id: 'km-sleepsong', title: 'The Sleep-Song of Aumbrel (tablet in the reliquary)', text: 'First verse, for the wind: Hush now, the storm is sleeping in the shell.\nSecond verse, for the water: Hush now, the tide goes out and does not tell.\nThird verse, for the deep: Hush now, the dark is soft, the dark is well.\n\nSing the three verses at the three knots of the Godstone, and the binding falls.\nSing them all together to the Great One, and it will sleep a thousand years.\nThe crown is the lock. The song is the key. Never put on the lock.' },
    { id: 'km-frieze', title: 'Frieze in the Temple of the Ninth Tide', text: 'Carved in a ring around the nave pool:\nThe Great One woke and the sea-lanes drowned.\nThe nine priests made a crown of nine tides and sang it shut.\nThe tenth priest, who was proud, put the crown on, and the Great One woke to her voice.\nShe drowned on dry land, with the sea in her mouth, and the Great One went back to sleep.\nNo one shall wear the crown. Whoever wears it, drowns.' },
    { id: 'km-letter', title: "Aldrem's unsent letter", text: 'Mother,\nYou did not sleep again. I heard you coughing on the Godstone all night, and in the morning there was seawater on your pillow that was not from the sea.\nYou say the kraken will make the sea kind. You said the same after Sela drowned, before you drowned the fleet.\nI will hold the road for you. I will always hold the road for you. But I do not think there is anyone at the end of it any more.\n- A.' },
  ],
  chapters: [
    {
      id: 'maw', title: "Into the Kraken's Maw", level: 19,
      summary: 'A great whirlpool in a storm that never ends, ringed by a fortress of lashed wrecks, a risen drowned city, sea caves full of hydras, a dragon turtle\'s shell island and the queen\'s giant flagship. At the centre, the Godstone and the Throat, where Ninefathom waits.',
      goal: 'Reach the Godstone before the Black Tide and break the bond between Queen Ondrava and the kraken: then kill the kraken, sing it to sleep, or let it have its revenge.',
      map: krakensMaw,
      npcs: [
        { npc: 'pf_kmthrale', x: 38, y: 74 },
        { npc: 'pf_kmlirien', x: 68, y: 71 },
        { npc: 'pf_kmvoss', x: 42, y: 60, hidden: true },
        { npc: 'pf_kmnettle', x: 6, y: 62 },
        { npc: 'pf_kmulloch', x: 47, y: 8, hidden: true },
        { npc: 'pf_kmaldrem', x: 37, y: 26 },
        { npc: 'pf_kmshellback', x: 70, y: 47 },
        { npc: 'pf_kmondrava', x: 38, y: 34 },
        { npc: 'pf_kmninefathom', x: 37, y: 40, hidden: true },
      ],
      scenes: [
        {
          room: 'The Stubborn Lark', title: 'The edge of the storm', handout: 'km-chart',
          read: 'Rain hammers the deck. Ahead of the bow the sea is not flat any more: it slopes, and turns, and far away in the middle a white shape stands on a rock in a ring of lightning. Captain Thrale passes you her spyglass and says, "That is where the singing comes from."',
          gm: 'Give the chart and let the heroes plan. Point out every way in: the ring\'s gate, the drowned city and its causeway, the flagship\'s chain, the merfolk, the shell island and the sea caves. Start the Black Tide clock at 6. The Lark lends two longboats and will not cross the ring.',
        },
        {
          room: 'Kelpdeep', title: 'The merfolk of Kelpdeep', optional: true, encounter: 'Raid on the kelp',
          read: 'The kelp is thrashing. Merfolk dart between the stalks with spears, and behind them come scores of fish-scaled warriors and the long grey shapes of sharks.',
          gm: 'A sahuagin war band hunts the merfolk. Help them and Speaker Lirien gives the pearls of water breathing and a guide through the currents. The sahuagin flee when half are down or their sharks die.',
          treasure: 'The six pearls of water breathing, a trident of fish command from the shrine, and 2,000 gp of black pearls the sahuagin took from earlier raids.',
        },
        {
          room: 'Gatehulk', title: "The commodore's toll", encounter: 'Gatehulk reavers', handout: 'km-decree',
          read: 'The iron gate creaks. The drowned commodore steps forward and salutes, water running out of his sleeves. "Toll for the Maw," he says. "One living sailor. Or something you love. Her Majesty is not particular."',
          gm: 'Voss must take his toll, but he hates the queen. Show him the decree (nailed to his own gate) and promise to break the crown, then a DC 21 Persuasion check: he lets them through and gives crew-tokens that make the whole ring ignore them. Paying a precious magic item also works. Otherwise: fight. Lighting the signal brazier on the Signal hulk brings him early.',
          treasure: 'Voss\'s sea chest: 4,000 gp in drowned coin, a cloak of the manta ray and his own +3 scimitar.',
        },
        {
          room: 'Cage-hulk', title: 'The last offerings', optional: true, encounter: 'Cage-hulk keepers',
          read: 'Twenty cages hang half in the water, and in every one somebody is holding their chin up out of the sea. One of them sees you and starts to shout a name: "Captain! Captain, it\'s Tobin!"',
          gm: 'The keepers are chuul and sahuagin with sharks under the barge. The prisoners know about the crown (the queen coughs seawater), the hags on the shell and the egg in the flagship\'s hold. Freed, they can sail the Lashed galleys back to the Lark: one tide spent, and the Black Tide loses 23 of its offerings.',
          treasure: 'The prisoners\' confiscated purses (1,200 gp) and a ring of swimming. Callowmere will pay 500 gp a head for every sailor brought home.',
        },
        {
          room: 'Brackwife grotto', title: 'The third sister', optional: true, encounter: 'Hydra pool',
          read: 'The old woman taps her spoon on the cauldron. "Ducklings! Come in, come in, mind my pets. You want to hurt my sisters, I can smell it on you. I want that too. Let us talk prices."',
          gm: 'The hydras in the pool guard the way in (Nettle whistles them off if the heroes come to trade). She sells the secret of the hag-eye, the fact that the crown drowns its wearer, or the location of the queen\'s memory jar. Price: a happy memory or a reflection (see her profile). The memory jar itself is in her secret niche: stealing it is possible (DC 20 Stealth) and she will hate the heroes forever.',
          treasure: 'At the bottom of the hydra pool: 2,500 gp in pearls and rings, a necklace of adaptation and a decanter of endless water.',
        },
        {
          room: 'Hall of the Tide-Priests', title: 'The drowned archive', encounter: 'Drowned streets', handout: 'km-sleepsong',
          read: 'In the plaza, a hundred pale people go about their day: buying fish, scolding children, laughing. None of them has a face any more. As you pass, they stop, all of them at once, and turn toward you.',
          gm: 'Most ghosts of Aumbrel only watch. Touch one, attack, or take anything from the market and four wraiths and four ghosts come for the heroes (singing a line of the Sleep-Song makes them stop and weep instead). The archive\'s mosaic and secret reliquary hold the Sleep-Song. A side trip to the Lantern tower shows the whole map.',
          treasure: 'In the reliquary: the Sleep-Song tablet, a pearl of power and a spell scroll of control weather (which calms the storm over the Maw for 8 hours).',
        },
        {
          room: 'Flooded nave', title: 'The thing in the pool', encounter: 'Flooded nave', handout: 'km-frieze',
          read: 'A voice in your head, warm as a hearth: "Little swimmers. You have come about the crown. We made the crown, you know. Well. Our servants did. Come closer, and we will tell you everything."',
          gm: 'Ulloch trades: the meaning of the frieze and the full Sleep-Song for its freedom (scrape the glyphs, DC 19 Arcana), or for one hero to let it touch their mind (DC 18 Wisdom save or be charmed for a day). If attacked, it fights from the deep pool with its chuul and water elementals. A DC 17 Insight shows it wants the kraken for itself.',
          treasure: 'Aumbrel\'s temple tithe under the pool: 8,000 gp in ancient gold, 3,000 gp of gems and a rod of absorption.',
        },
        {
          room: 'Nesting lagoon', title: 'The Hookthorn', encounter: "Shellback's wrath",
          read: 'The island lurches. The lagoon heaves up into a head as big as a cart, and two brass-coloured eyes look down at you, full of pain. Behind her, two hags on the shell shriek and yank at a chain, and the dragon turtle roars and comes at you.',
          gm: 'Shellback fights only because the Hookthorn makes her. Pull it out (three DC 22 Athletics checks), cast remove curse at 7th level or higher, or smash the hag-eye in the Firstmother\'s skull, and she turns on the hags and the sharks. If she also gets her egg back from the Wrathwater, she joins the last fight. Killing her is possible, and the heroes will feel bad about it.',
          treasure: 'From her hoard, as a gift or as loot: 10,000 gp in coins of fifty kingdoms, an apparatus of the crab and a +3 shield made from one of the Firstmother\'s shed plates.',
        },
        {
          room: 'The Wrathwater', title: "The queen's flagship", encounter: "Wrathwater's deck", handout: 'km-letter',
          read: 'The black ship towers over you, creaking against its chain. Two giants in coral armour stand at the rail, and between them a thin man in a coat of fish-scales raises one hand. "Her Majesty is not receiving," he says, and the air around him crackles.',
          gm: 'The Tide-Wardens and the court mage Quillon Ashe guard the ship; two invisible stalkers guard the egg in the hold. The flagship is the way to the anchor chain, the egg and Aldrem\'s letter. A burning Pitch-hulk sent round the Maw softens it up first. Snapping the anchor chain from here dooms the ship.',
          treasure: 'The queen\'s war chest: 12,000 gp, a staff of thunder and lightning and 2 potions of storm giant strength. Quillon carries a robe of the archmagi. And the egg.',
        },
        {
          room: 'The Causeway of Kings', title: 'The son on the road', encounter: 'Causeway of Kings',
          read: 'A young giant steps into the middle of the old road and plants his spear. Spray breaks over his shoulders. "Go back," he calls, not unkindly. "I have to stop you. I would rather not have to."',
          gm: 'Aldrem holds the road with a second storm giant, water elementals and sharks. Show him the frieze, the Tomb-garden inscription or his own letter and make a DC 20 Persuasion check (advantage with the letter or memory jar): he stands down and goes with the heroes to save his mother. Otherwise he fights, and yields at a quarter hit points.',
          treasure: 'Aldrem\'s horn of blasting, given freely if he is turned.',
        },
        {
          room: 'The Maw', title: 'Riding the whirl', encounter: 'Whirl-guardians',
          read: 'The current takes you. The wrecks spin past, the Teeth loom out of the spray, and the water under you rises into shapes with faces, reaching.',
          gm: 'Only for heroes who cross the Maw by water or low flight. Six water elementals of the queen\'s storm ride the currents with two giant sharks. Remember the pull toward the Throat every turn and the Teeth to cling to.',
        },
        {
          room: 'The Godstone', title: 'Ninefathom rises', encounter: 'Ninefathom rises',
          read: 'The queen stops singing. The whirlpool stops turning. For one heartbeat the whole sea is silent. Then the Throat erupts, and tentacles as thick as masts rise around the Godstone, and an eye as big as a cartwheel opens beside you. "Small ones," says a voice like the bottom of the sea. "She says I may eat you."',
          gm: 'The climax. Ondrava fights from the Godstone; the kraken fights for her and cannot hurt her while the bond holds. Break the bond: take the crown and smash it, or quench the three runes (each a verse of the Sleep-Song and a DC 18 check, or 50 hp of magic damage). When it breaks, Ninefathom turns on the queen at once. The heroes can then sing it to sleep (the full song), let it take her and dive, or fight it. Allies the heroes won arrive on round 2: Shellback, Aldrem, Voss\'s crews, the merfolk.',
          treasure: 'The Crown of Nine Tides (an artifact: whoever wears it drowns; it should be broken or sunk). Ondrava\'s belt of storm giant strength. In the Throat, 300 ft down, the treasure of a thousand ships: 30,000 gp in coins, 10,000 gp in gems, a sword of sharpness and a ring of djinni summoning.',
        },
      ],
      wrapUp: 'When the bond breaks, the whirlpool slows over an hour and the storm thins. The wrecks of the Hulkhold come apart and sink, and the drowned crews crumble into salt. Aumbrel stays above the waves, empty and white. If the kraken sleeps, it sleeps under the Godstone; if it died, its body becomes a reef within a year; if it fled, the sea-lanes are open but nobody sails the Maw again.',
    },
  ],
  ending: `Win: the bond is broken before the Black Tide. Port Callowmere rings every bell it has, the sea-lanes open, and the heroes are given the freedom of the isles. If Ondrava lives, Aldrem takes her home to the giants' court to be judged, and she thanks the heroes, coldly, for her life. Shellback, if freed, guards the isles and comes when the heroes call the sea. Lose: at the Black Tide, the nine thousand drowned sing at once, and Ninefathom rises as a god of the sea. A wave as tall as a mountain flattens Port Callowmere, and Queen Ondrava, drowning, smiling, rules every ship that sails. The heroes wash up on a beach a hundred miles away. Next: the drowned city of Aumbrel is still there, with its archive and its secrets; Ulloch, if freed, is now loose in the isles and thinking about the sleeping kraken; and the storm giants' high court wants a word with whoever unseated a queen.`,
};
