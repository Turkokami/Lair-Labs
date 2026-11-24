// The Star in the Glass Sea: a wilderness expedition for four heroes of level 10.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function glassSeaMap() {
  const b = new MapBuilder('adv-glass-sea', 'The Shine: the Glass Sea and the Starfall Crater', 80, 80, { open: true, floor: 'sand', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  const r = rng(7741);
  // the crater: centre and radius of the impact basin; the rim is a ring of fused glass around it
  const CX = 58, CY = 26, R = 13;
  const cd = (x: number, y: number) => Math.hypot(x + 0.5 - CX, y + 0.5 - CY) / R;
  // the Long Crack, a fissure that runs from near the crater to the south edge
  const crack: [number, number][] = [[44, 44], [41, 50], [37, 56], [33, 62], [30, 68], [28, 74], [27, 80]];
  const dSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };
  const crackDist = (x: number, y: number) => {
    let d = 99;
    for (let i = 0; i < crack.length - 1; i++) d = Math.min(d, dSeg(x + 0.5, y + 0.5, crack[i][0] + 0.5, crack[i][1] + 0.5, crack[i + 1][0] + 0.5, crack[i + 1][1] + 0.5));
    return d;
  };
  const glassy = (x: number, y: number) => Math.hypot(x - CX, y - CY) < 33 + 3 * Math.sin(x / 5 + 1) + 2 * Math.cos(y / 4) || crackDist(x, y) < 5.5;
  // a wobbly oval, for drifts, spires and oases
  const blob = (cx: number, cy: number, rx: number, ry: number, seed: number, f: (x: number, y: number) => void) => {
    const q = rng(seed), p1 = q() * 6.28, p2 = q() * 6.28;
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++)
      for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        if (x < 0 || y < 0 || x > 79 || y > 79) continue;
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, a = Math.atan2(dy, dx);
        const lim = 1 + 0.18 * Math.sin(3 * a + p1) + 0.1 * Math.sin(5 * a + p2);
        if (dx * dx + dy * dy <= lim * lim) f(x, y);
      }
  };

  // ---------- the ground: glass near the crater and along the crack, dunes everywhere else ----------
  for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) if (glassy(x, y)) b.paint(x, y, 1, 1, 'ice');
  for (const [cx, cy, rx, ry, s] of [[40, 3, 5, 2, 11], [70, 5, 4, 2, 12], [37, 42, 3, 2, 13], [77, 30, 2, 5, 14], [50, 7, 3, 1, 15], [49, 60, 9, 11, 16]])
    blob(cx, cy, rx, ry, s, (x, y) => b.paint(x, y, 1, 1, 'sand'));

  // the Crust: thick fused glass over the buried streets of Quillamere
  b.rock(25, 6, 22, 13);
  // the crater: rim of sheer glass, basin inside, an apron of cracked glass outside
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      const d = cd(x, y);
      if (d < 1) b.floor(x, y, 1, 1, 'ice');
      else if (d < 1.3) b.rock(x, y, 1, 1);
      else if (d < 1.55 && r() < 0.35) b.rubble(x, y, 1, 1);
    }
  // three passes through the rim, and the mercenaries' ladder
  b.floor(57, 8, 3, 7, 'ice').rubble(57, 9, 1, 3).rubble(59, 11, 1, 2);
  b.floor(57, 38, 3, 6, 'ice').rubble(59, 40, 1, 2);
  b.floor(40, 25, 6, 3, 'ice').rubble(42, 27, 2, 1);
  for (let s = 0; s <= 6; s++) b.floor(72 - s, 41 - s, 1, 1, 'ice').floor(71 - s, 41 - s, 1, 1, 'ice');
  for (let s = 0; s <= 6; s++) b.rubble(72 - s, 41 - s, 1, 1).rubble(71 - s, 41 - s, 1, 1);

  // the Long Crack: a fissure with cracked glass along its lips, and two ways over
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      const d = crackDist(x, y);
      if (cd(x, y) < 1.4) continue;
      if (d < 1.3) b.pit(x, y, 1, 1);
      else if (d < 2.3 && r() < 0.4) b.rubble(x, y, 1, 1);
    }
  for (let y = 55; y <= 57; y++) for (let x = 33; x <= 41; x++) if (crackDist(x, y) < 1.9) b.floor(x, y, 1, 1, 'ice');
  for (let y = 68; y <= 69; y++) for (let x = 26; x <= 34; x++) if (crackDist(x, y) < 1.9) b.floor(x, y, 1, 1, 'wood-planks');
  b.area('The Long Crack', [[38, 45, 6, 7]], {
    read: 'The glass is split by a crack a few yards wide and too deep to see the bottom. Warm air breathes up out of it, and far down, something glitters like a second sky.',
    gm: 'The fissure is 200 ft deep. Its lips are cracked glass (difficult terrain). A creature that falls takes 70 (20d6) bludgeoning damage on the broken glass below. The head of the crack, here, is the only place to walk round it, in full view of the South Pass. Jumping it elsewhere: 15 ft gap, a DC 15 Strength (Athletics) check with a run-up, or Dexterity (Acrobatics) DC 15 to land on the cracked lip.',
    label: [41, 47],
  });
  b.props_('chasm-edge', [[43, 47], [39, 52], [35, 59]]).props_('crumbling-ledge', [[42, 51], [32, 65]]).prop('steam-vent', 38, 49).light(40, 50, 5, 15, '#9fe7ff');

  b.area('The Glass Arch', [[33, 55, 9, 3]], {
    read: 'A bridge of clear glass spans the crack, thin as a window pane. Through it you can see straight down into the dark, and the dark looks back up at you.',
    gm: 'A natural arch, 15 ft wide at its narrowest. It holds anything up to 1,000 lb. Two people stamping or a fight on it: DC 13 Dexterity save each round or a crack opens under you (fall unless you catch the lip, DC 15 Athletics). Crossing quietly is easy.',
    label: [37, 56],
  });
  b.props_('crystal-cluster', [[34, 56], [40, 56]]).light(37, 56, 5, 10, '#bfefff');

  // ---------- the Shine's Edge: the heroes come in from the south-west dunes ----------
  b.area("The Shine's Edge", [[1, 67, 9, 10]], {
    read: 'The last real dune ends at your feet. Beyond it the world turns to glass: flat, cracked and shimmering, all the way to a tower that catches the light on the horizon like a raised needle.',
    gm: 'The heroes start here at dusk on the first day. Start the Bloom Clock (see tips): three dawns. Isaru Tamarind will not set foot on the glass after dark; if she is with the heroes, she wants to camp at the caravan first. Shardwalker cairns mark a safe path north to the oasis and east to the caravan.',
    label: [5, 71],
  });
  b.start(3, 71, 3, 3);
  b.prop('signpost', 6, 69).props_('cairn', [[8, 67], [5, 61], [10, 58]]).prop('campfire-cold', 3, 74).prop('skull-bleached', 7, 75).props_('sand-ripples', [[2, 66], [9, 74], [12, 70]]).prop('desert-rocks', 1, 77).light(3, 74, 5, 10, '#ffb35c');

  // ---------- the wrecked caravan at the Caravan Bridge ----------
  b.area('The Wrecked Caravan', [[18, 61, 13, 13]], {
    read: 'Six wagons lie scattered like dropped toys, half of them sunk in glass that has flowed and set around their wheels. A merchant stands beside one, perfectly clear, perfectly still: a statue of glass with a look of surprise on its face.',
    gm: 'A Shardwalker trade caravan, wrecked ten days ago. The worm in the Hollow Dunes broke it; then the basilisks came. Their gaze turns flesh to glass, not stone. Four basilisks and two giant scorpions den in the wagons. Throwing them the caravan\'s dried meat (DC 13 Animal Handling) lets the heroes pass. Isaru Tamarind hides in the overturned wagon.',
    label: [24, 66],
  });
  b.props_('wagon', [[20, 63], [26, 62], [22, 70]], 0).prop('cart', 28, 71, 90).props_('crate-pile', [[19, 66], [27, 64]]).props_('loot-sacks', [[21, 68], [25, 71]]).props_('skeleton-lying', [[23, 64], [19, 72]]).prop('statue', 25, 67).prop('bones', 29, 63).props_('barrel-group', [[18, 62], [24, 72]]).prop('backpack', 22, 65).prop('campfire-cold', 23, 67);
  b.area('The Caravan Bridge', [[26, 68, 9, 2]], {
    read: 'The caravan was halfway over a bridge of planks and wagon-beds laid across the crack when it died. The planks creak and the gaps between them are full of stars.',
    gm: 'Safe to walk one at a time. A creature over 500 lb, or three people at once, makes it sag: DC 12 Dexterity save or drop prone, and on a 1 fall into the crack.',
    label: [30, 68],
  });
  b.prop('bridge-plank', 30, 68, 90).prop('rope-coil', 26, 69);
  b.encounter('Glass-eyed scavengers', [18, 61, 13, 13], [['basilisk', 4], ['giantScorpion', 2]], 'low');

  // ---------- the Mirage Oasis ----------
  blob(13, 52, 8, 6, 21, (x, y) => b.paint(x, y, 1, 1, 'grass'));
  b.pool(13, 52, 4, 3, true);
  b.area('The Mirage Oasis', [[5, 45, 17, 14]], {
    read: 'Palm trees, green grass and a pool so blue it hurts to look at, here in the middle of the glass. A woman in a gardener\'s apron kneels at the water, singing. When you look again, some of the palms are gone.',
    gm: 'A memory the seed has grown into the world: the last garden of Quillamere. The pool is real, sweet water. Half the palms and all the birdsong are mirage (DC 15 Investigation to tell which). Sabine Tolley is the gardener\'s echo; she is kind and sad. Three wraiths, the thirsty dead of the war, rise from the glass at night and try to drink the living. Sabine can send them back to sleep if asked kindly. At the bottom of the pool lies the Garden Memory, a shard of green glass the size of a fist.',
    label: [13, 47],
  });
  b.props_('tree-palm', [[7, 49], [9, 56], [18, 48], [20, 54], [16, 57], [8, 52]]).props_('reeds', [[10, 50], [17, 55], [16, 50]]).prop('oasis-pool', 13, 52).props_('flowers', [[11, 47], [15, 47], [19, 51]]).prop('well', 6, 54).props_('obscuring-cloud', [[5, 47], [21, 57]], 0, { gm: true }).prop('bench', 13, 48).prop('crystal-cluster', 13, 53, 0, { gm: true });
  b.light(13, 52, 15, 20, '#a8ffcf');
  b.encounter('The thirsty dead', [5, 45, 17, 14], [['wraith', 3]], 'low');

  // ---------- the rooftops of Quillamere, buried to the eaves ----------
  b.room("The Lamplighters' Dome", 3, 3, 8, 7, {
    mat: 'marble',
    read: 'A great white dome rises out of the sand like the top of a buried egg. A crack has opened its crown, and cold light shines up through it from far below.',
    gm: 'The dome of the Lamplighters\' Guild. The hole drops 40 ft into a hall packed with sand and glass lamps. The lamps still glow faintly: memory-light. Six of them are worth 50 gp each to a collector, or to the Orrery Society.',
  });
  b.pit(6, 5, 2, 2).props_('pillar-broken', [[3, 3], [10, 3], [3, 9], [10, 9]]).prop('lamp-post', 9, 6).prop('crystal-lamp', 4, 6).light(6, 5, 10, 20, '#d9f4ff');
  b.room("The Merchants' Roofs", 13, 2, 5, 6, {
    mat: 'brick-floor',
    more: [[19, 2, 4, 6]],
    read: 'Flat tiled roofs, side by side, with a gap of drifted sand between them. Laundry poles still stand where someone hung washing six hundred years ago. A plank bridges the gap.',
    gm: 'The sand in the gap is soft: walking it means a DC 12 Strength save or sink to the waist (restrained until freed). The plank is safe. A rooftop cistern holds a tin box: 220 gp in old Quillamere silver and a map of the city streets (it shows the Bell Tower\'s stair down into Lantern Street).',
  });
  b.wallRun(13, 2, 5, 'n', 'low').wallRun(19, 2, 4, 'n', 'low');
  b.props_('banner-pole', [[14, 3], [21, 3]]).prop('bridge-plank', 18, 4, 90).prop('water-barrel', 16, 6).prop('chest', 21, 6).prop('rubble-pile', 14, 6).prop('pottery', 20, 4);
  b.building('The Bell Tower', 19, 10, 6, 6, {
    mat: 'stone-flagstone',
    read: 'The top of a bell tower stands out of the sand, its bell still hanging, green with age. A spiral stair winds down into dark sand-choked air.',
    gm: 'The stair goes down 30 ft to a sand-blocked landing. A loose panel in the east wall (DC 16 Perception, or the map from the Merchants\' Roofs) opens on Lantern Street, the buried way to the crater. Ringing the bell brings every mirage within a mile to look, and the two invisible hunters straight here.',
    doors: [[19, 13, 'w', 'open'], [24, 12, 'e', 'secret']],
    windows: [[21, 10, 'n'], [21, 15, 's']],
  });
  b.prop('temple-bell', 21, 12).prop('stair-spiral', 23, 14).prop('rope-coil', 20, 14).prop('gm-secret-door', 24, 12, 0, { gm: true });
  b.room('The Glass Orchard', 3, 12, 11, 7, {
    mat: 'ice',
    read: 'A rooftop garden where every tree, leaf and pear has turned to glass. When the wind blows, the orchard rings like a thousand tiny bells.',
    gm: 'Pretty and dangerous: the glass leaves are razor sharp. Moving faster than half speed, or being shoved into a tree, deals 2d6 slashing. The hunters like to fight here, where the ringing hides their steps (no hearing them coming).',
  });
  b.props_('crystal-spire', [[4, 13], [7, 15], [10, 13], [12, 17], [5, 17]]).props_('tree-dead', [[9, 17], [12, 14]]).props_('flowers', [[6, 13], [11, 16]]).prop('bench', 8, 13).light(7, 15, 5, 15, '#cdefff');
  b.pit(15, 10, 2, 2).prop('sinkhole', 15, 10).note(15, 10, 'Sinkhole: drifted sand over a buried street. DC 13 Perception to spot; DC 14 Dexterity save or fall 20 ft.');
  b.props_('sand-ripples', [[12, 1], [1, 11], [17, 16], [6, 20]]).props_('desert-rocks', [[1, 1], [16, 13]]);
  b.encounter('Hunters in the shimmer', [2, 2, 23, 17], [['invisibleStalker', 2]], 'low');

  // ---------- the buried streets under the Crust ----------
  b.floor(25, 12, 18, 2, 'stone-cobble');
  b.area('Lantern Street', [[25, 12, 18, 2]], {
    read: 'A street of the old city, roofed over with glass. Shop signs still hang above sealed doors, and your light shines through the ceiling into the night above. Every step echoes.',
    gm: 'The buried way from the Bell Tower to the crater, and a branch up to the Sunken Plaza. The walls are memory-glass: touch them and hear the city\'s last morning (people shopping, a child laughing, then the sound of the sky splitting). At the east end, a collapsed shopfront hides a crawlway into the crater basin (DC 15 Investigation, or follow the cold draught).',
    label: [33, 12],
  });
  b.floor(28, 14, 1, 5, 'stone-cobble');
  b.props_('lantern-wall', [[26, 12], [31, 13], [36, 12], [41, 13]]).props_('debris-wood', [[29, 13], [38, 12]]).prop('stairs-up', 28, 17).prop('tavern-sign', 34, 13).prop('market-stall', 39, 13).prop('rubble-pile', 42, 13);
  for (const x of [26, 36]) b.light(x, 12, 5, 10, '#d9f4ff');
  b.room('The Drowned Bathhouse', 30, 7, 7, 4, {
    mat: 'marble',
    read: 'A bathhouse of white stone, its pool full of clear, hard glass. Bathers are caught in the glass mid-swim, faces turned up toward a light that came six hundred years ago.',
    gm: 'The bathers are only shapes in the glass, not bodies. On the far bench lies a soldier\'s pack from the war: a potion of superior healing and a steel seal with Quell\'s badge (a burning eye), which the honour guard in the plaza will obey for one round (they hesitate, losing their first turn).',
  });
  b.floor(33, 11, 1, 1, 'marble').door(33, 10, 's', 'closed');
  b.pit(32, 8, 3, 2).props_('column-fluted', [[30, 7], [36, 7], [30, 10], [36, 10]]).prop('backpack', 35, 9).prop('bench-long', 31, 10).light(33, 8, 5, 15, '#bfefff');
  b.room('The Buried Shrine', 38, 15, 4, 3, {
    mat: 'dungeon-slab',
    read: 'A tiny street shrine, its offering bowl still full of coins gone green. A carved face of the Sky-Queen has been chiselled away, angrily, long ago.',
    gm: 'The people of Quillamere prayed for peace here in secret; Quell\'s soldiers defaced it. The coins are 140 gp of old silver. Saying a prayer for peace here makes the Little Star appear for a moment, curious.',
  });
  b.floor(39, 14, 1, 1, 'dungeon-slab');
  b.prop('shrine', 40, 15).prop('offering-bowl', 39, 16).props_('candles', [[38, 15], [41, 17]]).light(40, 16, 5, 10, '#ffd27a');
  b.tunnel([[43, 12], [46, 14], [49, 17]], 1, { mat: 'cave-floor', seed: 31 });
  b.door(42, 12, 'e', 'secret').prop('gm-secret-door', 42, 12, 0, { gm: true }).note(45, 13, 'Crawlway through the rim: squeeze single file. Comes out unseen in the north-west of the Shard Garden.');

  // ---------- the Sunken Plaza ----------
  b.rock(21, 20, 15, 15);
  b.room('The Sunken Plaza', 22, 21, 13, 13, {
    mat: 'marble',
    read: 'A square of white stone lies twenty feet below the glass, open to the sky like a dry well. In its centre a statue of a man in armour lifts one hand to the heavens. The statue is glass, and something moves inside it like smoke.',
    gm: 'The heart of old Quillamere, and the anchor of Marshal Oderic Quell: his echo lives in his own glass statue. A clay golem in the shape of a standard-bearer and two wraiths (his honour guard) wake if anyone touches the statue or speaks against Quell. Shattering the statue (AC 15, 60 hp, immune to poison and psychic) breaks Quell\'s hold on the seed and on the Gardener. Quell speaks first, and he is very persuasive.',
  });
  b.floor(28, 20, 1, 1, 'marble').floor(35, 26, 1, 2, 'marble').floor(28, 34, 1, 1, 'marble').floor(21, 27, 1, 1, 'marble');
  b.props_('stairs-up', [[28, 21], [34, 26], [28, 33], [22, 27]]).prop('statue-tall-knight', 28, 27).prop('plinth-display', 28, 28).props_('column-fluted', [[24, 23], [32, 23], [24, 31], [32, 31]]).prop('fountain', 25, 27).props_('column-collapsed', [[31, 29], [26, 24]]).prop('war-banner', 30, 25).props_('sand-ripples', [[23, 32], [33, 22]]);
  b.light(28, 27, 15, 20, '#ffb08a');
  b.encounter('The honour guard', [22, 21, 13, 13], [['clayGolem', 1], ['wraith', 2]], 'moderate');

  b.area('The Mirror Flats', [[36, 20, 5, 16]], {
    read: 'Smooth, unbroken glass, polished by the wind. You see yourselves reflected underfoot, upside down, walking on a black sky. Your reflections are a step behind you.',
    gm: 'Between the plaza and the West Pass. The reflections are the seed watching. Any hero who looks into their reflection for a minute hears it ask one question (use the Little Star handout). Answering honestly earns that hero inspiration.',
    label: [38, 30],
  });
  b.props_('crystal-cluster', [[37, 33], [39, 22]]).prop('standing-stone', 38, 36);

  // ---------- the Orrery Society dig ----------
  b.area('The Orrery Society Dig', [[2, 22, 17, 7]], {
    read: 'Striped sun-shades on poles, a brass telescope as long as a canoe, crates stamped with a ringed planet, and a trench cut down into the glass. A tall woman with ink on her cuffs waves you over without looking up from her notebook.',
    gm: 'The scholars\' camp: Provost Ludovica Ambrine, six students and two hired porters. They are friendly, curious and very bad at desert life. They will trade water, maps and lore for news of the crater. Ambrine wants the star\'s heart cut out and boxed for study; she is wrong about almost everything except that the star is alive.',
    label: [10, 24],
  });
  b.props_('tent-bell', [[4, 23], [14, 23]]).prop('tent', 9, 27).prop('lean-to', 17, 26).prop('telescope', 11, 23).prop('table-maps', 7, 24).props_('crate-stack', [[2, 27], [16, 24]]).prop('water-barrel', 5, 27).prop('campfire', 11, 26).props_('cot', [[3, 24], [13, 24]]).prop('orrery', 8, 22).prop('astrolabe-stand', 15, 27).light(11, 26, 10, 20, '#ffb35c');
  b.rock(3, 29, 15, 12);
  b.room('The Trench', 3, 30, 15, 3, {
    mat: 'dirt',
    read: 'A trench ten feet deep, cut with picks and patience. Its glass walls are full of shapes: a hand, a sandal, a wheel, the shadow of a running dog.',
    gm: 'Open at both ends. The scholars dug too deep, into glass that remembers the war, and woke three earth elementals made of fused sand and glass, the glass-born. They attack anyone carrying a pick or a scholar\'s lamp. They stop if the trench\'s iron door is shut again and the digging stops (Ambrine refuses unless convinced, DC 17 Persuasion, or shown that the dig is feeding the war-memory to the seed).',
  });
  b.props_('pickaxes', [[5, 31], [14, 30]]).prop('mine-cart', 12, 31).prop('ore-pile', 16, 32).prop('ladder', 4, 30).prop('lantern-standing', 9, 32).light(9, 32, 10, 15, '#ffd27a');
  b.floor(9, 33, 1, 1, 'marble').door(9, 33, 's', 'closed', 'door-iron');
  b.room('The War Archive', 5, 34, 8, 6, {
    mat: 'marble',
    read: 'Shelves of glass plates stand in rows, each one as thin as paper and cloudy with images. Hold one to the light and you see armies marching, cities burning, a man in armour giving orders.',
    gm: 'Quell\'s war archive: his memories of nine years of war, stored in glass. Every plate the scholars lift out and read is a meal for the seed (and a lesson from Quell). Ambrine\'s field notes are on the reading desk (handout). Smashing the archive (an hour\'s work) starves Quell of his best lessons: in the Crown, the stone golem loses its Slow action. A loose panel in the east wall (DC 16 Perception) hides the Marshal\'s private reliquary.',
  });
  b.props_('archive-stacks', [[6, 35], [6, 38], [9, 35], [9, 38]]).prop('writing-desk', 11, 37).prop('scroll-pile', 12, 35).prop('crystal-ball', 11, 39).prop('magic-mirror', 5, 36, 90).light(9, 36, 10, 15, '#cfe8ff');
  b.room('The Sealed Reliquary', 13, 35, 4, 4, {
    mat: 'marble',
    read: 'A closet of black glass. On a cushion lies a glass sword with a flame frozen in its blade.',
    gm: 'Quell\'s private hoard, untouched for six centuries. The sword is a sun blade. Beside it: a box of five pre-war gold crowns (200 gp each) and a ring of protection.',
  });
  b.door(12, 36, 'e', 'secret').prop('gm-secret-door', 12, 36, 0, { gm: true }).prop('ring-cushion', 15, 36).prop('magic-sword', 14, 37).prop('coffer', 16, 38).light(15, 37, 5, 10, '#ffcf8a');
  b.encounter('The glass-born', [3, 30, 15, 10], [['earthElemental', 3]], 'low');

  // ---------- the north flats and the east shelf ----------
  b.area('The North Flats', [[44, 0, 30, 8]], {
    read: 'A plain of glass so flat and clear that the stars reflect in it at night and you seem to walk through the sky. Two great bronze bulls graze on nothing, their hides crusted with crystal.',
    gm: 'Two gorgons, war-beasts of the Sky-Queen\'s army, buried and woken by the starfall. They are grumpy, not hungry: give them a wide berth (stay over 60 ft away) and they ignore you. Get closer and they breathe. Their breath turns flesh to glass instead of stone.',
    label: [58, 3],
  });
  b.pit(68, 2, 2, 2).prop('sinkhole', 68, 2).props_('crystal-spire', [[48, 2], [63, 6], [74, 1]]).props_('giant-ribcage', [[53, 4]]).props_('skull-bleached', [[49, 1], [71, 6]]).prop('statue-dragon', 60, 1);
  b.encounter('Bronze bulls', [44, 0, 30, 8], [['gorgon', 2]], 'low');
  b.area('The East Shelf', [[76, 8, 4, 40]], {
    read: 'A narrow shelf of glass runs between the crater wall and the edge of the world. The wind here never stops, and it sings.',
    gm: 'A quiet way between the north flats and the mercenaries\' camp. Nothing lives here. The singing wind covers any noise (advantage on Stealth checks).',
    label: [77, 26],
  });
  b.props_('crystal-cluster', [[77, 14], [78, 38]]).prop('cairn', 77, 46);

  // ---------- the Hollow Dunes ----------
  b.area('The Hollow Dunes', [[42, 48, 16, 24]], {
    read: 'Here the glass gives way to sand again: deep, soft dunes with strange round hollows, each wide enough to swallow a house. The ground trembles, very gently, like something breathing.',
    gm: 'The hunting ground of the glass worm, a purple worm whose hide has grown a crust of crystal from eating star-touched sand. It hunts by feel. Crossing quietly takes a group DC 15 Dexterity (Stealth) check (advantage if the heroes walk in an uneven rhythm, as the Shardwalkers do). On a failure the worm rises under the noisiest hero. It does not leave the sand, so the glass is safety.',
    label: [50, 58],
  });
  b.pit(46, 55, 2, 2).pit(53, 65, 3, 2).props_('sinkhole', [[46, 55], [53, 65]]).props_('giant-ribcage', [[50, 52], [44, 66]]).props_('sand-ripples', [[48, 60], [55, 57], [43, 62], [52, 70]]).prop('skull-bleached', 56, 68).prop('pit-deep', 49, 63).prop('backpack', 45, 59);
  b.encounter('The glass worm', [42, 48, 16, 24], [['purpleWorm', 1]], 'high');

  // ---------- the Sunbreaker Company's fortified camp ----------
  b.paint(61, 51, 17, 23, 'dirt');
  b.area('The Sunbreaker Camp', [[61, 51, 17, 23]], {
    read: 'A square of sharpened stakes and sandbags, with a ballista at each corner and a banner of a fist breaking a sun. Inside, tents in neat rows, a cookfire and forty sunburnt sellswords cleaning their weapons.',
    gm: 'The Sunbreaker Company: Captain Orlaith Karrow, her war-mage Benedek Corriveau, a second gladiator (Sergeant Abernathy), four veterans on watch and thirty ordinary soldiers who will not join a fight against heroes of this level. They let visitors in under a white flag. Karrow is hard but fair; show her the patron letter or proof that her gold glows like the mirages (DC 15 Arcana) and she turns on Corriveau. A loose stake in the east wall lets sneaks in from the East Shelf.',
    label: [66, 62],
  });
  b.wallRun(61, 51, 17, 'n').wallRun(61, 73, 17, 's').wallRun(61, 51, 23, 'w').wallRun(77, 51, 23, 'e');
  b.door(61, 61, 'w', 'closed', 'door-double').door(61, 62, 'w', 'closed', 'door-double').door(68, 51, 'n', 'closed', 'door-double').door(69, 51, 'n', 'closed', 'door-double').door(77, 66, 'e', 'secret');
  b.prop('gm-secret-door', 77, 66, 0, { gm: true });
  b.building("Captain Karrow's Tent", 70, 54, 6, 5, {
    mat: 'wood-planks',
    read: 'A big command tent with its sides rolled up. Maps of the crater are pinned to a table under stones, and a tall mirror in a brass frame stands in the corner, covered with a cloak.',
    gm: 'The mirror is how the patron speaks: Corriveau uncovers it at midnight and Quell\'s face appears in it, bright as noon. The pay chest holds 1,600 gp in pre-war gold crowns that glow faintly in the dark. Corriveau\'s letter from the patron is in his coat, not here.',
    doors: [[72, 58, 's', 'open'], [73, 58, 's', 'open']],
  });
  b.prop('war-table', 72, 55).prop('magic-mirror', 75, 54).prop('strongbox', 70, 54).prop('cot', 74, 57).prop('chair', 71, 56).light(72, 56, 10, 15, '#ffb35c');
  b.props_('ballista', [[62, 52], [76, 52], [62, 72], [76, 72]]).props_('tent', [[63, 55], [63, 59], [63, 66], [67, 66], [71, 66], [75, 69]]).prop('tent-round', 66, 70).prop('war-banner', 68, 53).props_('sandbags', [[62, 58], [66, 52], [74, 61]]).prop('campfire-spit', 68, 61).props_('weapon-rack', [[65, 63], [70, 62]]).prop('training-dummy', 73, 64).prop('horse-trough', 75, 63).prop('cage', 64, 69).props_('crate-stack', [[70, 71], [72, 71]]).prop('water-barrel', 66, 59).prop('wagon', 74, 67);
  b.props_('cheval-de-frise', [[59, 61], [59, 63], [68, 49], [70, 49]]).props_('barricade-wood', [[60, 57], [72, 49]]);
  b.light(68, 61, 15, 25, '#ffb35c').light(62, 52, 5, 15, '#ffb35c').light(76, 52, 5, 15, '#ffb35c');
  b.encounter('The Sunbreaker Company', [62, 52, 15, 21], [['gladiator', 2], ['veteran', 4], ['mage', 1]], 'moderate');

  // ---------- the crater rim ----------
  b.area('The South Pass', [[57, 38, 3, 6]], {
    read: 'A notch in the crater wall, choked with broken glass. Above it the air shimmers and spins, and the shards on the ground lift and turn as if something breathes on them.',
    gm: 'Three air elementals, storms of glass splinters, guard the main way in. In the shard wind, their attacks deal an extra 1d6 slashing. They are the seed\'s antibodies: they ignore anyone carrying a crystal from the basin or walking with the Little Star.',
    label: [58, 41],
  });
  b.props_('rubble-pile', [[57, 39], [58, 43]]).props_('crystal-cluster', [[59, 38], [57, 42]]).light(58, 40, 5, 15, '#bfefff');
  b.encounter('Shard storm', [52, 38, 12, 8], [['airElemental', 3]], 'low');
  b.area('The North Pass', [[57, 8, 3, 7]], {
    read: 'A narrow cleft in the crater wall, so clear you can see the tower through the stone on either side, bent and broken like a picture in water.',
    gm: 'Unguarded, but the cracked glass is difficult terrain all the way. Coming in this way, the heroes see the Shard Garden from above and gain surprise on whatever waits there.',
    label: [58, 11],
  });
  b.prop('crystal-spire', 59, 9);
  b.area('The West Pass', [[40, 25, 6, 3]], {
    read: 'Steps! Real stone steps, half melted, climb over the crater wall from the old city. Someone has scratched a word into the top step in the old tongue: SORRY.',
    gm: 'The old processional way from the Sunken Plaza. Quell\'s honour guard follows anyone who wakes them up this far, but not into the basin. The word was cut by Sabine Tolley six hundred years ago (she will say so).',
    label: [42, 26],
  });
  b.props_('stairs-up', [[40, 26], [45, 26]]);
  b.area('The Sunbreaker Ladder', [[65, 35, 8, 7]], {
    read: 'Iron spikes driven into the crater wall, with knotted ropes between them, climb straight up the glass.',
    gm: 'The mercenaries\' private way in. Climbing it is a DC 12 Athletics check (DC 18 without the ropes, which the Sunbreakers will cut if they are hostile). A guard sits at the top by day.',
    label: [69, 38],
  });
  b.prop('rope-coil', 71, 41).prop('ladder', 68, 38);

  // ---------- the Shard Garden: the impact basin ----------
  b.area('The Shard Garden', [[46, 14, 25, 25]], {
    read: 'The crater floor is a garden that no one planted. Crystal trees grow in spirals, crystal flowers open and close like breathing mouths, and the air hums one long low note. In the middle, the tower rises: smooth, green-white and alive.',
    gm: 'Everything here is growing, slowly, while you watch. The guardians of the garden attack anyone who harms the crystals: two earth elementals, two air elementals and two basilisks, all crusted with crystal. The Little Star first appears here, to the hero who seems most gentle. If it trusts the heroes, it calls the guardians off.',
    label: [54, 36],
  });
  for (const [x, y] of [[48, 20], [47, 28], [52, 15], [64, 15], [69, 22], [69, 31], [62, 37], [50, 36], [67, 36]]) b.prop('crystal-spire', x, y);
  b.props_('cave-crystals', [[46, 24], [55, 16], [68, 27], [54, 37]]).props_('crystal-cluster', [[50, 17], [66, 17], [70, 26], [47, 33]]).props_('glowing-fungus', [[49, 30], [66, 33]]).prop('magic-circle', 58, 36);
  for (const [x, y, w, h] of [[47, 21, 1, 3], [68, 29, 2, 1], [60, 16, 1, 2], [52, 34, 2, 1]]) b.pit(x, y, w, h);
  for (const [x, y] of [[48, 22], [67, 20], [60, 36], [49, 33], [64, 16]]) b.light(x, y, 10, 20, '#9fe7ff');
  b.encounter('The Shard Garden', [46, 34, 25, 5], [['earthElemental', 2], ['airElemental', 2], ['basilisk', 2]], 'moderate');

  // ---------- the Glass Tower ----------
  b.room('The Root Hall', 51, 29, 15, 5, {
    mat: 'marble',
    read: 'Inside, the tower is warm. Roots of glass as thick as a man run along the floor and up the walls, and light pulses through them, slow as a heartbeat, from somewhere above.',
    gm: 'The ground floor. The Root-Keeper, a shield guardian grown out of the tower\'s glass, stands at the foot of the roots with three crystal basilisks curled around its feet. It obeys whoever holds the seed\'s favour: if the Little Star walks with the heroes, it bows. Two stairs climb through the roots, one to the Gallery and one to the Well. A narrow gap between roots in the west wall (DC 15 Perception) lets someone in or out unseen.',
  });
  b.room('The Echo Gallery', 51, 19, 5, 10, {
    mat: 'marble',
    read: 'A tall, thin hall whose walls are mirrors. In them, people from the old war walk past and do not see you: soldiers, refugees, a sorcerer in a crown of feathers. One of them turns and looks right at you.',
    gm: 'The tower replays the memories it has eaten. The one who looks is Quell, testing the heroes. He offers each hero something they want (DC 16 Wisdom save or the hero believes him until the end of the next fight). From here a stair climbs to the Crown.',
  });
  b.room('The Memory Well', 61, 19, 5, 10, {
    mat: 'marble',
    read: 'A round shaft of glass, open from the floor to the roof far above, with a stair spiralling up its wall. Glowing shapes fall slowly down the middle like snow: faces, flowers, flags.',
    gm: 'The seed\'s memories, falling to its roots. Catching one shows a vision (roll a d6: 1-4 a war memory, 5-6 a peaceful one). A hero who drops the Garden Memory into the well sends it straight to the heart: the Bloom starts to turn green at once, and in the Crown fight the Gardener has disadvantage on attacks.',
  });
  b.room('The Crown', 56, 19, 5, 10, {
    mat: 'marble',
    read: 'The top of the tower is open to the sky. In the middle, a star the size of a cart hangs in a cradle of glass roots, beating like a heart, and around it petals of crystal are slowly, slowly opening.',
    gm: 'The seed\'s heart. Quell\'s echo stands at its side and rides the Gardener, a stone golem of living crystal, with two heat-ghosts (invisible stalkers) and a shard storm (air elemental). See the climax scene for how prep changes this fight. Climbing the outside to the north window: DC 18 Athletics.',
  });
  b.wallRun(51, 19, 15, 'n').wallRun(51, 33, 15, 's').wallRun(51, 19, 15, 'w').wallRun(65, 19, 15, 'e');
  b.wallRun(51, 28, 15, 's').wallRun(55, 19, 10, 'e').wallRun(60, 19, 10, 'e');
  b.door(58, 33, 's', 'closed', 'door-double').door(57, 33, 's', 'closed', 'door-double').door(51, 31, 'w', 'secret');
  b.door(53, 28, 's', 'open').door(63, 28, 's', 'open').door(55, 22, 'e', 'closed').door(60, 22, 'e', 'closed');
  b.wall(58, 19, 'n', 'window');
  b.prop('gm-secret-door', 51, 31, 0, { gm: true });
  b.props_('crystal-spire', [[52, 30], [64, 30], [55, 32], [61, 32]]).props_('stairs-up', [[53, 29], [63, 29]]).prop('statue-tall-winged', 58, 30).props_('column-twisted', [[56, 31], [60, 31]]);
  b.props_('magic-mirror', [[52, 20], [54, 24], [52, 27]], 90).prop('stair-spiral', 53, 21).props_('candle-stand-tall', [[54, 20], [54, 27]]);
  b.prop('stair-spiral', 63, 21).prop('pit-deep', 63, 24).props_('light-orb', [[62, 26], [64, 20]]).prop('crystal-cluster', 61, 27);
  b.prop('orb-pedestal', 58, 23).props_('crystal-spire', [[56, 20], [60, 20], [56, 27], [60, 27]]).prop('ring-cushion', 58, 26, 0, { gm: true });
  b.light(58, 23, 20, 30, '#e8fbff').light(58, 31, 10, 20, '#9fe7ff').light(53, 24, 5, 15, '#d8b4ff').light(63, 24, 10, 15, '#b8ffd9');
  b.encounter('The Root-Keeper', [51, 29, 15, 5], [['shieldGuardian', 1], ['basilisk', 3]], 'low');
  b.encounter('The Glass Marshal', [56, 19, 5, 10], [['stoneGolem', 1], ['invisibleStalker', 2], ['airElemental', 1]], 'high');

  // a few spires of fused glass on the flats, for cover and to break sight lines
  for (const [cx, cy, s] of [[33, 44, 41], [24, 40, 42], [68, 46, 43], [20, 58, 44]] as const) blob(cx, cy, 1.4, 1.2, s, (x, y) => b.rock(x, y, 1, 1));
  // long dune crests in the south, too soft and steep to climb
  for (const [cx, cy, rx, s] of [[12, 63, 5, 45], [44, 76, 6, 46], [62, 77, 4, 47], [3, 50, 2, 48]] as const) blob(cx, cy, rx, 1, s, (x, y) => b.rock(x, y, 1, 1));
  b.props_('sand-ripples', [[30, 48], [12, 64], [36, 74], [56, 73], [3, 42]]).props_('desert-rocks', [[26, 52], [40, 78], [14, 77], [78, 76]]).props_('skull-bleached', [[34, 70], [2, 60]]).props_('cactus', [[5, 63], [16, 74]]);
  return b.build();
}

export const GLASS_SEA: Adventure = {
  id: 'glass-sea',
  title: 'The Star in the Glass Sea',
  tagline: 'A star fell into a desert of glass and took root; race two rival expeditions to the tower growing from its crater.',
  levels: '10',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['wilderness', 'high level', 'desert', 'mystery', 'rivals'],
  pitch:
    "Six hundred years ago, two sorcerers fought a war so terrible that their last spells melted the desert into glass. People call it the Shine. A month ago a star fell into the middle of it. Since then, things have been growing out of the glass: crystal beasts, mirages that speak your name, and a tower that rises a little higher every night. Two expeditions are already racing for the crater: the scholars of the Orrery Society, and the Sunbreaker Company, sellswords paid by a patron nobody has seen. The town of Pellory, at the edge of the glass, wants someone it can trust to get there first.",
  secret:
    "The star is a seed. It drifted out of the deep sky, a living crystal that roots in any ground and grows into whatever that ground remembers. The Shine remembers one day louder than all others: the last day of the Sorcerer War, when Marshal Oderic Quell of Quillamere, losing to the Sky-Queen Aurelith, melted the desert, both armies and his own city into glass. His echo has been trapped ever since in his glass statue in Quillamere's sunken plaza. Now the seed is drinking the glass's memories, and Quell is the loudest voice it hears. He is teaching it war. The tower is his old war-spire, regrowing. At the third dawn the seed blooms. If Quell's lessons win, it becomes a spire that turns ten miles of land to glass every night, and Quell wakes in a body of crystal. He has help: through a mirror he pays the Sunbreaker Company in buried gold, and his true servant, the war-mage Benedek Corriveau, carries Quell's signet ring to set in the heart at the bloom. The Orrery scholars want to cut the heart out; they do not know their dig in Quell's war archive is feeding his lessons to the seed. The seed itself, which shows itself as a child of light called the Little Star, has not chosen what to be yet.",
  hooks: [
    "Pellory's council offers 4,000 gp to reach the star first, find out what it is and stop it if it is dangerous. The glass has already spread half a mile toward the town's wells.",
    "The Orrery Society hires the heroes to find Ziva Bascombe, a junior scholar who walked off toward the tower one night, talking to someone nobody else could see. 1,500 gp, and first look at the star.",
    "For three nights one of the heroes has dreamed of a child made of light, who asks the same question every time: 'What should I be?'",
  ],
  tips: [
    "Run the Bloom Clock: the seed blooms at the third dawn after the heroes reach the Shine's Edge. Each long rest is a night. Every dusk the tower grows a storey, the mirages get louder, and Quell gets stronger (give the Gardener +10 hit points per night passed).",
    "Three things decide how the Bloom ends: whether Quell's statue in the Sunken Plaza is shattered, whether the Garden Memory from the oasis reaches the seed, and whether anyone sets Quell's ring in the heart. Let the players find all three through talk and exploration, not lectures.",
    "The rivals move on their own. On the first night the Sunbreakers climb their ladder into the basin; on the second they hold the Root Hall. The scholars reach the tower on the second day if no one stops them, and start cutting.",
    "Many fights can be talked down or walked round: the basilisks take food, Sabine calms the wraiths, the gorgons ignore anyone who keeps their distance, the worm only hunts what it feels, and Karrow will listen to proof. Give full XP for a clever way past.",
    "The Shine is hot by day and cold by night. A hero who travels in the day without shade or a gallon of water makes a DC 15 Constitution save each hour or gains a level of exhaustion. Cracked glass is difficult terrain; drifted sand may hide a sinkhole.",
    "Play the mirages as beautiful and sad, not scary. They are memories. Most of them do not know they are dead.",
  ],
  npcs: [
    {
      id: 'pf_glsisaru', name: 'Isaru Tamarind', title: 'glass-reader of the Shardwalkers', kind: 'npc', art: 'scout', shared: true,
      wants: 'To bring her clan\'s dead home from the wrecked caravan, and to see the star killed before the glass eats the last wells.',
      knows: 'Safe paths across the Shine, where the worm hunts and how to walk so it cannot feel you. She saw the star fall and says it fell slowly, like a leaf.',
      voice: 'Quiet, dry and exact. Counts her steps under her breath. Never says the word "star", only "the guest".',
      appearance: 'A small, wiry woman in a cloak sewn with hundreds of mirror chips, with a veil of beads over a sun-dark face.',
      backstory: 'Her brother led the caravan that the worm broke. He is the glass statue standing by the wagons; the basilisks did it.',
      gmNotes: 'Found hiding in the overturned wagon at the wreck. If the heroes deal with the basilisks and treat her brother\'s statue with respect, she guides them for free.',
    },
    {
      id: 'pf_glsambrine', name: 'Provost Ludovica Ambrine', title: 'leader of the Orrery Society expedition', kind: 'npc', art: 'sage', monsterId: 'mage', shared: true,
      wants: 'The star\'s heart cut out, packed in lead and carried home to be studied, with her name on the paper.',
      knows: 'That the star is alive and growing, that it feeds on the glass, and that the war archive under her dig is the best find of her life. She has not put the two facts together.',
      voice: 'Fast, bright and excited, full of long words. Interrupts herself to write things down.',
      appearance: 'Tall and thin, with ink-stained cuffs, a sun-hat as wide as a cartwheel and three pairs of spectacles on cords.',
      gmNotes: 'Mage stat block if it comes to it, but she would rather run. Once shown that her dig is feeding Quell, she is horrified and helps: she knows how to smash the archive quickly, and she has a spare lead-lined casket.',
    },
    {
      id: 'pf_glsziva', name: 'Ziva Bascombe', title: 'junior scholar who talks to the star', kind: 'npc', art: 'apprentice-wizard',
      wants: 'To keep the Little Star safe from everyone who wants to cut it open, her own teacher included.',
      knows: 'That the star is a seed, that it speaks as a child called the Little Star, and that a man in the mirrors is teaching it terrible things.',
      voice: 'Shy until she talks about the star, then she cannot stop. Says "it" and then corrects herself to "they".',
      appearance: 'A round-faced young woman with sunburnt cheeks, a torn scholar\'s gown and a glass flower tucked behind her ear that glows when the Little Star is near.',
      gmNotes: 'Held in a cage in the Sunbreaker camp: she was caught sneaking to the tower at night. Freed, she can call the Little Star to the heroes, which makes the garden\'s guardians and the Root-Keeper stand aside.',
    },
    {
      id: 'pf_glskarrow', name: 'Captain Orlaith Karrow', title: 'captain of the Sunbreaker Company', kind: 'monster', art: 'gladiator', monsterId: 'gladiator', shared: true,
      wants: 'To finish the job, get paid and bring her people home alive, in that order.',
      knows: 'That her patron speaks from a mirror and pays in very old gold, that the job is to hold the crater until the third dawn, and that Corriveau talks to the mirror alone at night.',
      voice: 'Flat, clipped soldier\'s voice. Calls everyone by their job: "Wizard. Priest. Thief." Never raises her voice, never needs to.',
      appearance: 'A broad, grey-haired woman with a scarred jaw, a sun-faded red sash and a shield painted with a fist breaking a sun.',
      gmNotes: 'Gladiator stat block. Turnable: show her the patron letter, or prove the gold is mirage-touched (DC 15 Arcana). Then she turns on Corriveau and her company helps hold the tower in the climax.',
    },
    {
      id: 'pf_glscorriveau', name: 'Benedek Corriveau', title: 'war-mage of the Sunbreakers', kind: 'monster', art: 'battle-mage', monsterId: 'mage',
      wants: 'To be the Marshal\'s first apprentice in the new age, and to never be poor again.',
      knows: 'Who the patron really is, what the ring does, and that the seed blooms at the third dawn.',
      voice: 'Smooth, polite and a little too pleased with himself. Smiles with his mouth only.',
      appearance: 'A handsome man in a spotless white coat that should not be spotless out here, with a heavy gold signet ring on a chain round his neck.',
      gmNotes: 'Mage stat block. Carries Quell\'s ring and the patron letter (handout). If exposed, he runs for the tower to set the ring himself, using misty step and invisibility.',
    },
    {
      id: 'pf_glssabine', name: 'Sabine Tolley', title: 'echo of the last gardener of Quillamere', kind: 'npc', art: 'ghost',
      wants: 'For someone to remember that Quillamere had gardens, not just armies.',
      knows: 'The city as it was, what Quell did on the last day, and where the Garden Memory lies. She knows she is a memory and does not mind.',
      voice: 'Warm and slow, like an old aunt. Hums between sentences. Calls the heroes "petal".',
      appearance: 'A plump woman in a green apron with soil on her hands, a little see-through at the edges when the light is behind her.',
      gmNotes: 'Not a ghost to fight: a mirage the seed made from her memory. She can lay the thirsty dead to rest and will give the Garden Memory to anyone who promises to take it to "the little one in the tower".',
    },
    {
      id: 'pf_glsquell', name: 'Marshal Oderic Quell', title: 'the Glass Marshal, echo of a war-sorcerer', kind: 'npc', art: 'ghostly-knight',
      wants: 'To finish the war he lost six hundred years ago, in a new body of crystal, with the seed as his weapon.',
      knows: 'Everything about the old war, where every buried vault of Quillamere lies, and exactly what each hero wants most.',
      voice: 'Calm, reasonable and generous. Never threatens. Speaks of the war as if it were yesterday and he were the hero of it.',
      appearance: 'A tall man in burnished armour with a cloak of fire frozen mid-flutter, all of it made of light and glass. His eyes are two small suns.',
      backstory: 'When the Sky-Queen\'s armies broke his walls, Quell chose to melt everything rather than surrender: the desert, both armies and his own people. He calls it "the victory".',
      gmNotes: 'An echo, not a creature: he cannot be harmed except by shattering his statue in the Sunken Plaza. He appears in mirrors, reflections and mirages. In the Crown he rides the Gardener.',
    },
    {
      id: 'pf_glsstar', name: 'The Little Star', title: 'the voice of the seed', kind: 'npc', art: 'lantern-spirit', shared: true,
      wants: 'To know what it should become. It wants to grow into something good, but it has only ever been taught war.',
      knows: 'Everything the glass remembers, all mixed up, and nothing at all about the world beyond the Shine.',
      voice: 'A child\'s voice that echoes, as if two children speak at once. Asks question after question. Repeats the last thing it was told.',
      appearance: 'A small glowing figure of light, about the size of a six-year-old, whose face is never quite the same twice. It leaves frost-flowers on the glass where it walks.',
      gmNotes: 'Cannot be fought or harmed. If the heroes are kind to it, it walks with them: crystal guardians stand aside and the air elementals of the rim let them pass.',
    },
    {
      id: 'pf_glsgardener', name: 'The Gardener', title: 'crystal guardian of the seed', kind: 'monster', art: 'stoneGolem', monsterId: 'stoneGolem',
      wants: 'To keep the seed safe. That is all it was grown for.',
      knows: 'Nothing but its task, and the voice that rides it.',
      voice: 'Silent. When Quell rides it, it speaks with his voice from inside its chest.',
      appearance: 'A towering figure of green-white crystal, shaped like a woman with a gardener\'s hood, with roots for feet and a heart-light that pulses with the seed.',
      gmNotes: 'Stone golem stat block. If Quell\'s statue was shattered, the Gardener is free: it does not fight unless someone harms the seed. If the Garden Memory reached the heart, it has disadvantage on attacks while Quell rides it.',
    },
  ],
  handouts: [
    {
      id: 'pellory-notice', title: 'Notice nailed up in Pellory',
      text: 'BY THE COUNCIL OF PELLORY\nThe Shine is growing. Glass now lies across the Old Well Road.\nAll travel onto the glass is forbidden after dark.\nWANTED: brave and trustworthy persons to reach the fallen star and report.\nREWARD 4,000 gp. Apply at the Pump House.\nDo not answer anyone who calls your name from the glass.',
    },
    {
      id: 'ambrine-notes', title: "Provost Ambrine's field notes",
      text: 'Day 19. The star is NOT a meteor. It has growth rings like a tree. The tower added a storey last night: 31 feet.\nDay 20. Archive plates confirmed: battle records of the Marshal. Every plate we raise goes dark within the hour, as if something drank it.\nDay 21. Bascombe insists the star "asked her a question". Confined her to the tents.\nDay 22. Bascombe gone. Glass-born in the trench. We dig on.',
    },
    {
      id: 'plinth-words', title: 'Words on the statue\'s plinth',
      text: 'ODERIC QUELL\nMARSHAL OF QUILLAMERE\nWHO WOULD NOT KNEEL\nAND WON THE WAR\n\n(Below, scratched in a different, shakier hand: and lost everything else.)',
    },
    {
      id: 'patron-letter', title: "Letter in Corriveau's coat",
      text: 'Benedek,\nThe Captain is useful; do not trust her. Hold the crater. At the third dawn the crown opens. Set my ring in the heart while it is still soft, and I shall wake.\nThen you will have what I promised: a city, a war worth winning, and a place at my right hand.\nBurn this.\n— Q.',
    },
    {
      id: 'little-star', title: 'Frost writing on the glass',
      text: 'what is a war\nwhat is a garden\nthe man in the mirror says i am a sword\nthe lady by the water says i am a tree\nwhich one am i\nwhich one are you',
    },
  ],
  chapters: [
    {
      id: 'shine', title: 'Across the Shine', level: 10,
      summary: 'One huge map of the glass desert: dunes and cracked glass flats, a fissure to cross, a wrecked caravan, a mirage oasis, a buried city with secret streets, two rival camps, a worm in the dunes, the starfall crater and the living glass tower at its heart.',
      goal: 'Reach the tower before the third dawn, find out what the star really is, and decide what it becomes.',
      map: glassSeaMap,
      npcs: [
        { npc: 'pf_glsisaru', x: 22, y: 69, hidden: true },
        { npc: 'pf_glsambrine', x: 9, y: 25 },
        { npc: 'pf_glsziva', x: 65, y: 69 },
        { npc: 'pf_glskarrow', x: 72, y: 56 },
        { npc: 'pf_glscorriveau', x: 67, y: 58 },
        { npc: 'pf_glssabine', x: 13, y: 48, hidden: true },
        { npc: 'pf_glsquell', x: 28, y: 26, hidden: true },
        { npc: 'pf_glsstar', x: 49, y: 24, hidden: true },
        { npc: 'pf_glsgardener', x: 58, y: 25, hidden: true },
      ],
      scenes: [
        {
          room: "The Shine's Edge", title: 'Onto the glass',
          read: 'The sun goes down and the whole desert lights up, gold, then pink, then a cold, shimmering blue. Far off, the tower glows from inside like a lantern. As you watch, it grows: you hear it, a long, low creak of glass, across ten miles of silence.',
          gm: 'Start the Bloom Clock: three dawns. Show the Pellory notice. Point out the cairns: north to the oasis and the scholars, east to the caravan. Tell the players about the heat, the cracked glass and the sinkholes now, so the dangers feel fair later.',
          handout: 'pellory-notice',
        },
        {
          room: 'The Wrecked Caravan', title: 'The glass merchant',
          gm: 'The basilisks watch from under the wagons. A hero who studies the glass statue (DC 13 Medicine) sees it is a person, not a carving. Feed the basilisks (DC 13 Animal Handling) or fight. Afterward, Isaru crawls out of the overturned wagon. If the heroes cover her brother\'s statue and promise to bring him home, she guides them: advantage on the worm\'s Stealth check and on finding the oasis.',
          encounter: 'Glass-eyed scavengers',
          treasure: 'The caravan\'s goods: 900 gp of spices and silk (Isaru asks that half go to her clan), a decanter of endless water, and six days of food and water.',
        },
        {
          room: 'The Mirage Oasis', title: 'The last garden', optional: true,
          read: 'The gardener looks up and smiles as if she has been waiting for you all afternoon. "There you are, petals. Sit down before the heat takes you. Mind the palms: half of them are only remembering."',
          gm: 'Sabine Tolley tells the story of the last day: the Sky-Queen at the walls, the Marshal on the plaza, the light. At night three wraiths rise from the glass; if asked kindly, Sabine sings them back to sleep. The Garden Memory lies at the bottom of the pool (DC 13 Athletics to dive 15 ft). Sabine asks the heroes to take it "to the little one in the tower".',
          encounter: 'The thirsty dead',
          treasure: 'The Garden Memory (a fist-sized shard of green glass, the key to a good Bloom). In the reeds: a lost scholar\'s pack with two potions of superior healing.',
        },
        {
          room: 'The Orrery Society Dig', title: 'The scholars and the glass-born',
          gm: 'Ambrine welcomes the heroes and offers lore for news. She sends them to clear the glass-born from her trench so she can keep digging. The archive tells the story of Quell\'s war; a hero who reads Ambrine\'s notes and makes a DC 15 Arcana check realises the archive is feeding the seed. Convince Ambrine (DC 17 Persuasion, or automatic with the notes and that check) and she stops digging and helps smash the plates.',
          encounter: 'The glass-born',
          handout: 'ambrine-notes',
          treasure: 'In the Sealed Reliquary: a sun blade, a ring of protection and five pre-war gold crowns (1,000 gp). Ambrine pays 500 gp for the trench to be cleared, and gives a lead-lined casket.',
        },
        {
          room: 'The Sunken Plaza', title: 'The Marshal on his plinth',
          read: 'The smoke inside the statue gathers into a face. The glass lips move, and a calm, kind voice fills the plaza: "Ah. Soldiers. Good. I have been waiting such a long time for soldiers."',
          gm: 'Quell talks first. He offers each hero what they want if they leave his statue alone and let the seed bloom. He lies easily (DC 18 Insight). Touch or strike the statue and the honour guard wakes: a clay golem and two wraiths. Shattering the statue (AC 15, 60 hp) breaks Quell\'s hold: the Gardener will not fight for him, and he loses the power to speak through mirrors. Quell screams for the whole fight.',
          encounter: 'The honour guard',
          handout: 'plinth-words',
          treasure: 'In the dry fountain, thrown there as offerings over six centuries: 1,300 gp in old coins and a gem of brightness.',
        },
        {
          room: 'The Sunbreaker Camp', title: 'Under a white flag',
          gm: 'The Sunbreakers let visitors in under a white flag. Karrow offers a deal: stay out of her way until the third dawn and she shares the pay. Ziva Bascombe sits in a cage by the tents. Corriveau keeps the patron letter in his coat (DC 16 Sleight of Hand, or search him). Show Karrow the letter, or prove her gold is mirage-touched, and she turns on Corriveau: he flees toward the tower. Otherwise, sneaking in by the loose stake works (DC 15 Stealth group check), and a fight here is the whole company.',
          encounter: 'The Sunbreaker Company',
          handout: 'patron-letter',
          treasure: 'Corriveau carries Quell\'s signet ring (500 gp, and the key to a war Bloom: keep it from the heart). The pay chest: 1,600 gp in glowing pre-war crowns. A wand of lightning bolts in Corriveau\'s kit.',
        },
        {
          room: 'The Hollow Dunes', title: 'The worm beneath', optional: true,
          read: 'The sand ahead sighs and sinks into a bowl. Then the bowl opens, and opens, and keeps opening, ringed with teeth and crusted with shards of glass that ring like bells.',
          gm: 'Only if the heroes cross the dunes loudly (group DC 15 Stealth, advantage with Isaru). The worm fights until it loses half its hit points, then dives. Retreating onto the glass ends the fight: it will not leave the sand. A hero swallowed by it sees, inside, the shining remains of the caravan\'s missing camels, turned to glass.',
          encounter: 'The glass worm',
          treasure: 'In the worm\'s old hollows: the caravan strongbox (700 gp) and a +2 shield bearing the Sky-Queen\'s sign.',
        },
        {
          room: 'The Bell Tower', title: 'The buried streets', optional: true,
          gm: 'Two invisible stalkers hunt the rooftops for Quell; he sends them after anyone who visits his statue. They fight in the Glass Orchard if they can. The secret panel in the Bell Tower opens on Lantern Street, which runs under the Crust to the Sunken Plaza and, through a hidden crawlway, into the crater basin unseen. The buried bathhouse and shrine are worth a look.',
          encounter: 'Hunters in the shimmer',
          treasure: 'On the Merchants\' Roofs: 220 gp and a street map. In the bathhouse: a potion of superior healing and Quell\'s seal. In the buried shrine: 140 gp of offerings.',
        },
        {
          room: 'The South Pass', title: 'Through the rim',
          gm: 'There are five ways into the crater: the South Pass (guarded by the shard storm), the North Pass (difficult, unguarded, gives surprise), the West Pass from the Sunken Plaza, the Sunbreakers\' ladder, and the secret crawlway from Lantern Street. With the Little Star or a crystal from the basin, the shard storm lets the heroes through.',
          encounter: 'Shard storm',
        },
        {
          room: 'The Shard Garden', title: 'The Little Star',
          read: 'Something small and bright steps out from behind a crystal tree and looks at you. It has a child\'s shape and no face you can hold on to. "Are you the soldiers?" it asks, in two voices at once. "He said soldiers would come."',
          gm: 'The Little Star asks the questions in the handout. Answer gently and it walks with the heroes: the garden\'s guardians stand aside. Frighten or attack it and they fight. If Ziva is with the heroes, the Little Star runs to her. Showing it the Garden Memory makes it go very quiet, then ask: "Can I be that instead?"',
          encounter: 'The Shard Garden',
          handout: 'little-star',
          treasure: 'Crystal flowers that fall when touched gently: twelve of them, 100 gp each, which never stop glowing.',
        },
        {
          room: 'The Root Hall', title: 'Inside the tower',
          gm: 'The Root-Keeper bows if the Little Star is with the heroes; otherwise it and three basilisks bar the way. If the Sunbreakers still serve Quell, by the second night they hold this hall too (add Karrow and two veterans, which makes it a moderate fight). Stairs climb through the Echo Gallery (Quell\'s whispers) or the Memory Well (drop the Garden Memory here to send it to the heart).',
          encounter: 'The Root-Keeper',
          treasure: 'Grown into the roots: an ioun stone of protection, and a mantle of spell resistance worn by a glass soldier from the old war.',
        },
        {
          room: 'The Crown', title: 'The Bloom',
          read: 'The petals around the heart are almost open. Dawn is coming up pink across the glass. The crystal guardian turns its hooded head toward you, and the voice that comes out of its chest is the Marshal\'s: "Stand aside, soldiers. The war is not over until I say so."',
          gm: 'The climax. Full fight: the Gardener ridden by Quell, two heat-ghosts and a shard storm. If Quell\'s statue was shattered, remove the Gardener (it guards the heart quietly). If the Garden Memory reached the heart, the Gardener has disadvantage on attacks. If Corriveau is still free, he arrives in round 2 to set the ring. Ending: give the Garden Memory to the heart and keep the ring out, and the seed blooms as a garden. Let the ring in, and it blooms as a war-spire. Cut the heart out (it takes a full round and 30 damage), and the seed dies and the tower begins to fall: everyone has 3 rounds to get out.',
          encounter: 'The Glass Marshal',
          treasure: 'At the foot of the heart, the seed offers a gift to whoever helped it: a glowing seed-crystal (works as a ring of free action set in any jewel), or, if the heart was cut out, the heart itself, worth 10,000 gp to any wizard alive, and very dangerous.',
        },
      ],
      wrapUp: 'At the third dawn the Bloom comes. If the heroes taught it well, the crown opens into a tree of green crystal and cool water wells up from the glass for miles: the Shine begins, slowly, to become a garden. If Quell won, the heroes must run before a storm of glass. If they cut out the heart, the tower falls, the mirages go silent, and the Shine is just dead glass again.',
    },
  ],
  ending:
    "Garden: the Little Star chooses to be a tree. Springs open across the Shine, Quell's echo fades with a sound like a sigh, Pellory's wells are saved, and the Shardwalkers name the heroes in their walking songs. The Little Star will remember them, and one day it may come looking. Cut: the heart is a fortune and a burden. The Orrery Society and every wizard in three kingdoms want it, and if Quell's statue still stands, his voice whispers from it to whoever holds it. War: the seed blooms as a spire; Quell walks out in a body of crystal, and the glass spreads ten miles a night toward Pellory. Next: in the seed's garden, or under its war-spire, a second seed is already forming. Where will its wind carry it?",
};
