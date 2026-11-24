// The Sunken Library of Quillmere: a one-session race for four level 3 heroes.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function quillmereLakeBed() {
  const b = new MapBuilder('adv-sunken-library', 'The dry bed of Quillmere', 80, 80, { open: true, floor: 'dirt', theme: 'stone', wallStyle: 'stone', ambient: 'dim' });
  const r = rng(30417);

  // shallow water along a line of points, with a deep channel down the middle if asked
  const river = (pts: [number, number][], w: number, deep: boolean) => {
    const cells: [number, number][] = [];
    let [px, py] = pts[0];
    cells.push([px, py]);
    for (const [x, y] of pts.slice(1)) {
      while (px !== x || py !== y) {
        if (px !== x && (py === y || Math.abs(x - px) >= Math.abs(y - py))) px += Math.sign(x - px);
        else py += Math.sign(y - py);
        cells.push([px, py]);
      }
    }
    for (const [x, y] of cells) b.water(x - (w >> 1), y - (w >> 1), w, w, false);
    if (deep) for (const [x, y] of cells) b.water(x, y, 1, 1, true);
  };
  const inZone = (x: number, y: number, z: number[][]) => z.some(([zx, zy, zw, zh]) => x >= zx && y >= zy && x < zx + zw && y < zy + zh);
  const keepClear = [[2, 3, 13, 12], [12, 70, 20, 10], [33, 55, 16, 8], [52, 68, 18, 11], [16, 10, 50, 46]];

  // ---------- the cracked lake bed: drying mud, puddles and reeds ----------
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * 78), y = 4 + Math.floor(r() * 75);
    if (inZone(x, y, keepClear)) continue;
    b.mud(x, y, 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
  }
  for (let i = 0; i < 16; i++) {
    const x = 2 + Math.floor(r() * 76), y = 8 + Math.floor(r() * 70);
    if (inZone(x, y, keepClear)) continue;
    b.pool(x, y, 1.2 + r() * 1.5, 1 + r());
  }

  // ---------- what is left of the lake (north) and the old river channel ----------
  b.water(14, 0, 52, 3, true).water(14, 3, 52, 2, false);
  b.pool(75, 5, 6, 6, true);
  river([[0, 66], [10, 64], [22, 67], [34, 65], [46, 66], [58, 64], [66, 59], [69, 50], [70, 38], [71, 26], [72, 14], [74, 8]], 3, true);
  b.water(12, 63, 5, 5, false); // the reed ford: no deep channel here
  b.water(68, 32, 6, 3, false); // the heron stones: a second ford, east

  // ---------- the library: one great block of drowned stone, carved into halls ----------
  b.rock(16, 10, 50, 46);

  // ===== outside, south: the stranded jetty and the reed beds =====
  b.area('Stranded jetty', [[20, 72, 11, 8]], {
    read: 'The old jetty of Quillmere village runs out over nothing. Its last post stands two hundred feet from the water, in cracked grey mud. Out on the lake bed, black towers lean out of the dried silt like the fingers of a drowned hand.',
    gm: 'The heroes start here. Mudge Wicklow, a reed-cutter, waits at the end of the jetty with a pole and a bad hat: she will guide anyone who pays 5 gp, and she knows the ford, the bridge toll and the toppled tower. The Collegium notice is nailed to the jetty post (handout).',
    label: [25, 75],
  });
  b.props_('dock-pier', [[22, 79], [23, 78], [24, 77], [25, 76], [26, 75]]).props_('mooring-post', [[21, 77], [27, 74]]).prop('rowboat', 29, 77).prop('canoe', 28, 73).prop('fishing-net', 23, 74).prop('notice-board', 26, 78).prop('lantern-standing', 21, 75);
  b.light(21, 75, 15, 15);
  b.start(24, 74, 3, 3);
  b.building('Old boathouse', 13, 72, 6, 5, {
    read: 'A tarred boathouse on stilts, now standing on dry ground. Nets hang from the rafters and an upturned skiff lies across two sawhorses.',
    gm: 'Mudge\'s home. She lends the heroes poles (advantage on checks to cross mud and shallow water) and a coil of rope. Under the skiff: a potion of water breathing she found on the bed last week and is too scared to drink.',
    doors: [[18, 74, 'e', 'closed']], windows: [[15, 72, 'n'], [13, 74, 'w']],
  });
  b.prop('sawhorse', 15, 74).prop('fishing-gear', 17, 73).prop('rope-coil', 14, 76).prop('hammock', 16, 76);

  b.area('Reed beds', [[3, 68, 16, 11]], {
    read: 'Reeds taller than a man rattle in the hot wind. The mud between them is soft and sucking, and full of the shells of drowned mussels. Every so often something big slides through the reeds ahead of you.',
    gm: 'Difficult ground. A DC 12 Survival check finds Mudge\'s path to the ford (no mud). The bones of a heron and an old boot sit in the mud: the crocodiles feed here.',
    label: [9, 73],
  });
  for (let i = 0; i < 46; i++) {
    const x = 1 + Math.floor(r() * 46), y = 56 + Math.floor(r() * 23);
    if (inZone(x, y, [[12, 70, 20, 10], [33, 55, 16, 8]]) || !b.isFloor(x, y)) continue;
    b.prop(i % 5 === 0 ? 'lily-pads' : i % 3 === 0 ? 'grass-tall' : 'reeds', x, y);
  }
  b.prop('bones-mud', 7, 71).prop('quicksand', 4, 76).prop('log-fallen', 11, 77).prop('mud-patch', 16, 69);

  b.area('The reed ford', [[11, 62, 7, 7]], {
    read: 'Here the old river spreads wide and slow, knee deep over a bar of gravel. Two long, knobbled logs lie in the shallows. One of them opens its eyes.',
    gm: 'The only place to cross the river on foot without paying. Two crocodiles and three giant frogs. Throwing them food (a ration each, or the eel trap from the boathouse) buys a DC 12 Animal Handling check to slip past. Elsewhere the river is deep in the middle: DC 12 Athletics to swim, and books or scrolls carried get soaked.',
    label: [14, 65],
  });
  b.props_('boulder', [[12, 63], [16, 66]]).prop('reeds', 11, 67).prop('lily-pads', 15, 64);
  b.encounter('Snappers at the ford', [10, 61, 10, 9], [['crocodile', 2], ['giant-frog', 3]], 'low');

  // ===== outside, south-east: Mawle's scavengers and their plank bridge =====
  b.floor(49, 62, 3, 8, 'wood-planks');
  b.area('Plank bridge', [[49, 62, 3, 8]], {
    read: 'Somebody has laid doors, shelves and the lids of library tables across the river and nailed them together into a bridge. A painted board at the near end reads TOLL. A man with a crossbow sits on a barrel beside it, eating an onion.',
    gm: 'Mawle\'s toll: 2 gp a head going over, "and half of whatever you carry back". The guard (a bandit) whistles for the camp if anyone crosses without paying. The bridge holds four people at once; a fifth breaks it (everyone into the deep channel, DC 12 Athletics).',
    label: [50, 66],
  });
  b.prop('bridge-plank', 50, 65, 90).prop('signpost', 50, 69).prop('barrel', 51, 69);
  b.area("Mawle's camp", [[53, 69, 16, 9]], {
    read: 'Wagons, tents and a cook-fire. Books are stacked everywhere in damp piles, sorted by a rule nobody here can read: big ones, red ones, ones with gold on. Somebody is using an atlas as a footstool.',
    gm: 'Gussett Mawle and his scavengers: a bandit captain, six bandits and two thugs. They want money, not blood. Mawle will sell the heroes a way in (the book-chute behind the Bindery, which his crew found) for 25 gp, and will join a fight against the Choir for a share of the dome. Insult the books and he laughs; insult his wagons and he draws.',
    label: [60, 73],
  });
  b.props_('tent', [[55, 71], [64, 70]]).prop('tent-command', 60, 76).prop('campfire-spit', 60, 73).props_('wagon', [[66, 72], [55, 76]]).props_('book-pile', [[57, 73], [58, 74], [63, 74], [66, 75]]).props_('loot-sacks', [[62, 71], [67, 77]]).prop('crate-pile', 53, 74).prop('bedroll', 57, 70).prop('weapon-barrel', 64, 77).prop('gm-treasure', 61, 77, 0, { gm: true });
  b.light(60, 73, 15, 20);
  b.encounter("Mawle's scavengers", [52, 68, 18, 10], [['bandit-captain', 1], ['bandit', 6], ['thug', 2]], 'moderate');

  b.area('Dead orchard', [[70, 62, 10, 17]], {
    read: 'An orchard drowned with the library: grey trees with no bark, standing in the silt like the bones of hands. Books hang in the branches where the falling water left them, swollen and green, flapping their pages in the wind.',
    gm: 'Side area. Most of the books are pulp, but a DC 13 Investigation finds a tin map-case caught high in a tree (DC 10 Athletics to climb). Inside: a chart of the library\'s floors, which shows the book-chute behind the Bindery and the cloister\'s secret door into the dome.',
    label: [74, 70],
  });
  for (const [x, y] of [[71, 63], [75, 64], [78, 66], [72, 68], [77, 70], [71, 74], [75, 76], [78, 78], [73, 78]] as [number, number][]) b.prop('tree-dead', x, y);
  b.props_('book-pile', [[74, 66], [76, 73]]).prop('stump', 70, 71).prop('gm-treasure', 77, 67, 0, { gm: true });

  // ===== outside, south: the steps up to the Lantern porch =====
  b.paint(37, 56, 6, 3, 'stone-cobble');
  b.area('Lantern steps', [[33, 56, 16, 6]], {
    read: 'Wide stone steps rise out of the mud to a pair of bronze doors green with age. Above them, carved in the lintel, an open book with a closed eye. Somebody has set up a winch here and given up halfway.',
    gm: 'The front door, in plain sight of Mawle\'s bridge. The doors are stuck with silt: a DC 13 Strength check, or the scavengers\' winch (10 minutes, noisy: the Inkwell\'s ink stirs). Every clock-face carved on the lintel shows eleven minutes to midnight.',
    label: [40, 58],
  });
  b.prop('winch', 36, 57).prop('handcart', 44, 57).props_('crate', [[34, 59], [46, 60]]).prop('rope-coil', 37, 59).prop('lamp-post', 43, 56);
  b.light(43, 56, 15, 15);

  // ===== outside, west: the scholars, the wreck and the toppled tower =====
  b.paint(2, 4, 12, 11, 'sand');
  b.area("Scholars' camp", [[2, 4, 12, 11]], {
    read: 'Neat white tents on a bar of clean sand, a folding table under an awning, and a brass telescope pointed not at the sky but at the library. A tall woman in a mud-spattered gown is shouting measurements at a boy holding a stick.',
    gm: 'Magister Perpetua Quayle and the Collegium expedition (four guards, two clerks). Friendly rivals: Quayle wants the Index for the Collegium and will pay the heroes 100 gp to "escort" her there, or 300 gp for a map of the inside. Her best student, Wynne Larkspur, slipped off into the library an hour ago; Quayle does not know yet.',
    label: [7, 9],
  });
  b.props_('tent-bell', [[3, 5], [10, 5]]).prop('tent', 3, 12).prop('table-maps', 7, 8).prop('telescope', 12, 9).props_('crate-stack', [[11, 12], [12, 12]]).prop('campfire', 7, 12).prop('writing-desk', 5, 9).prop('chest', 9, 13).prop('banner-pole', 2, 8);
  b.light(7, 12, 15, 20);

  b.area('West mudflats', [[1, 30, 14, 26]], {
    read: 'Flat grey silt as far as the library\'s west wall. A fishing boat lies on its side, its mast pointing at the library like an accusing finger. High in the wall above it, a round window gapes open.',
    gm: 'The oriel window is ten feet up: a DC 12 Athletics climb, or the boat\'s mast laid against the wall as a ladder. It drops into the top gallery of the Stacks. The wreck holds a sailor\'s chest: 30 gp and a spyglass.',
    label: [7, 42],
  });
  b.prop('rowboat', 9, 44, 30).prop('ship-mast', 12, 45, 90).prop('anchor', 6, 47).prop('skull-bleached', 4, 36).props_('mud-patch', [[3, 50], [11, 34]]).prop('sinkhole', 5, 54).prop('cargo-crates', 8, 40);
  b.floor(16, 46, 2, 1, 'stone-flagstone').wall(17, 46, 'e', 'window');

  // the Star Tower lies on its side across the mud and runs into the Hall of Sighs
  b.rock(1, 17, 15, 9);
  b.floor(2, 19, 13, 5, 'stone-flagstone');
  b.floor(1, 20, 1, 3, 'stone-flagstone').floor(8, 24, 2, 2, 'stone-flagstone').floor(15, 20, 3, 3, 'stone-flagstone');
  b.wallRun(5, 19, 2, 'e').wallRun(5, 22, 2, 'e').wallRun(9, 19, 1, 'e').wallRun(9, 21, 3, 'e').wallRun(12, 19, 3, 'e').wallRun(12, 23, 1, 'e');
  b.area('Toppled Star Tower', [[2, 19, 13, 5]], {
    read: 'You walk along the inside of a fallen tower. The floors are walls now, each with a round hole where the stair went up, and the spiral stair itself lies on its side like a corkscrew. At the far end, wedged in the rubble, a great brass telescope still points at the stars it can no longer see.',
    gm: 'The quiet way in: it leads straight to the Hall of Sighs and avoids the bridge and the ford. Stirges and bats roost in the dark end. The telescope\'s eyepiece is a perfect lens (75 gp). The tower was outside the Stillness when the library sank: everything here is old and rotten, which tells careful players the spell stopped at the library\'s walls.',
    label: [8, 21],
  });
  b.prop('stair-spiral', 7, 20, 90).prop('telescope', 13, 21, 90).props_('rubble-pile', [[3, 22], [10, 23]]).prop('bookshelf-fallen', 11, 19).prop('cobweb-corner', 14, 19).prop('bones', 6, 23).prop('crumbling-ledge', 4, 20);
  b.encounter('Tower roost', [2, 18, 13, 7], [['stirge', 10], ['swarm-of-bats', 2]], 'low');

  // ===== outside, north: the breach and the Choir's camp =====
  b.area('North breach', [[38, 5, 12, 5]], {
    read: 'On the north side the lake still laps at the library roof. Somebody has dug through the silt and the stone beneath it: a raw hole, shored with shelves, breathing cold air. Grey-robed figures with ink-black hands guard it, singing very softly.',
    gm: 'The Blotted Choir\'s way in, straight into the Hourglass chapel. Brother Cadmus Drabwell (cult fanatic) and four cultists hold it. If the Choir\'s clock is at 3 or less, Idony has already gone through. A cultist who is shown the last page (handout) may break and run.',
    label: [44, 7],
  });
  b.rubble(44, 8, 2, 3).floor(44, 9, 2, 2, 'stone-flagstone').rubble(44, 9, 2, 1);
  b.props_('barricade-wood', [[42, 8], [47, 8]]).prop('pickaxes', 41, 7).prop('lantern-standing', 46, 6).prop('ladder', 44, 8).prop('sandbags', 39, 8);
  b.light(46, 6, 15, 15);
  b.encounter('Picket at the breach', [38, 4, 12, 6], [['cult-fanatic', 1], ['cultist', 4]], 'low');

  b.area('Camp of the Blotted Choir', [[52, 5, 15, 5]], {
    read: 'Grey tents ring a fire that burns with no smoke. Every page of every book in the camp has been painted over in black ink, and the painted books are stacked like firewood. Little lumps of living mud bob and giggle at the water\'s edge.',
    gm: 'Mostly empty: four cultists and four mud mephits the Choir bound from the drying lake. In Idony\'s tent: her letter (handout), a map of the library with the Hourglass chapel circled, and a jar of "blotting ink" (one use: touch a written page and it becomes blank forever). If the camp is raided before the Choir\'s clock reaches 3, Idony is delayed: add 2 to the clock.',
    label: [59, 7],
  });
  b.props_('tent-round', [[53, 6], [57, 5], [64, 6]]).prop('tent-command', 61, 8).prop('campfire-cold', 59, 7).props_('log-pile', [[55, 8], [63, 8]]).prop('canoe', 66, 5).prop('book-pile', 58, 9).prop('altar', 54, 9);
  b.light(59, 7, 10, 15, '#9db3ff');
  b.encounter('Camp of the Blotted Choir', [52, 4, 15, 6], [['cultist', 4], ['mud-mephit', 4]], 'low');
  b.prop('temple-bell', 50, 4);

  // ===== outside, east: the founder's fallen head =====
  b.rock(74, 29, 5, 8);
  b.floor(75, 31, 3, 4, 'stone-flagstone').floor(73, 32, 2, 2, 'stone-flagstone');
  b.area("The Founder's head", [[72, 28, 8, 11]], {
    read: 'A stone head the size of a cottage lies on its cheek in the mud, the face of a stern old woman with spectacles carved on her nose. Her mouth is open. Inside it, something breathes slowly, and gold glints in the dark of her throat.',
    gm: 'Side area on the east bank: walk up from the dead orchard, or cross from the library side at the heron stones (a shallow ford; elsewhere swim). The oldest crocodile in the lake sleeps in the founder\'s mouth. A DC 14 Stealth check per hero gets in and out without waking it. The founder\'s spectacles are real glass: looking through them shows invisible writing (they work as a lantern of revealing, but only on writing).',
    label: [75, 33],
  });
  b.prop('idol-colossal', 72, 30).props_('boulder', [[69, 32], [72, 34]]).prop('bones-mud', 76, 32).prop('treasure-pile', 76, 34).prop('bones', 73, 37);
  b.encounter('The old one of the lake', [70, 27, 10, 14], [['giant-crocodile', 1]], 'high');
  b.area('East flats', [[66, 40, 3, 15]], {
    read: 'A thin strip of mud between the library and the river. Ivy has crept up the east wall, and halfway along it a mossy stone square is too square to be stone.',
    gm: 'The Bindery\'s book-chute: a DC 14 Perception check, or Mawle\'s directions, finds it. It opens into the Bindery.',
    label: [67, 46],
  });
  b.prop('ferns', 66, 42).prop('mud-patch', 67, 50).prop('gm-secret-door', 66, 44, 0, { gm: true });

  // fallen masonry, drowned things and lost books all over the bed
  const litter = ['column-fallen', 'rubble-pile', 'boulder', 'bones-mud', 'book-pile', 'skeleton-lying', 'pillar-broken', 'debris-wood', 'puddle', 'boulder-large', 'statue', 'urn'];
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(r() * 80), y = 5 + Math.floor(r() * 75);
    if (inZone(x, y, keepClear) || !b.isFloor(x, y) || b.cellAt(x, y) === 2) continue;
    b.prop(litter[i % litter.length], x, y, Math.floor(r() * 4) * 90);
  }

  // ===== inside: the Lantern porch =====
  b.room('Lantern porch', 35, 48, 11, 6, {
    mat: 'stone-flagstone',
    read: 'A tall entrance hall, ankle deep in silt. Two robed statues hold lanterns that have not gone out in a hundred years: the flames are perfectly still, like flames painted on glass. A clock over the inner arch reads eleven minutes to midnight.',
    gm: 'The Stillness begins at this door. Touch a lantern flame: it is cold and hard as glass. A DC 12 Arcana check: a great spell has stopped time inside, and it is failing where light and air get in. The silt here is new; the lantern-light is old.',
  });
  b.floor(39, 54, 2, 2, 'stone-flagstone').door(39, 55, 's', 'closed', 'door-double').door(40, 55, 's', 'closed', 'door-double');
  b.mud(36, 51, 3, 2).mud(43, 49, 2, 3);
  b.props_('statue-tall-robed', [[36, 49], [44, 52]]).props_('pillar-round', [[37, 48], [43, 48]]).props_('lantern-hanging', [[36, 50], [44, 51]]).prop('skeleton-seated', 42, 52).prop('notice-board', 45, 49).prop('rug-runner', 40, 51, 90);
  b.light(36, 50, 15, 15, '#ffe08a').light(44, 51, 15, 15, '#ffe08a');
  b.hall(40, 42, 40, 47, 2, { mat: 'stone-flagstone' });
  b.door(40, 47, 'n', 'open', 'door-double').door(41, 47, 'n', 'open', 'door-double');

  // ===== inside: the Flooded cloister, a ring around the dome =====
  b.room('Flooded cloister', 30, 19, 23, 2, {
    mat: 'stone-flagstone',
    more: [[30, 40, 23, 2], [30, 19, 2, 23], [51, 19, 2, 23]],
    read: 'A square walk of arches around a great round wall with no windows. Green water fills the cloister to the knee on one side and over the head on the other. Carp turn lazily in the deep part, frozen mid-flick, then move on as the Stillness lets them go.',
    gm: 'The loop that joins every wing. West side shallow, east side deep (DC 10 Athletics to swim; a giant constrictor snake and two giant frogs live there). The south side is choked with fallen vaulting, and near the south-west corner the floor has fallen into the drowned undercroft (DC 12 Dexterity save or drop 10 feet into cold water; DC 12 Athletics to climb out). In the west side, opposite the dome, a carved bookmark on one stone marks the Head Archivist\'s private door (DC 15 Perception). The dome\'s south door is iron, with a clock-face lock.',
    label: [41, 19],
  });
  b.water(30, 21, 2, 17, false, true).water(51, 21, 2, 19, true, true).water(32, 19, 6, 2, false, true);
  b.rubble(44, 40, 5, 2).pit(35, 40, 2, 2);
  b.props_('column-fluted', [[34, 20], [48, 20], [30, 26], [52, 34], [34, 41], [48, 41]]).props_('lily-pads', [[31, 28], [52, 25]]).prop('column-collapsed', 46, 40).prop('ceiling-rubble', 31, 40).prop('fountain', 51, 41).prop('gm-secret-door', 31, 30, 0, { gm: true }).prop('lock-plate', 41, 40);
  b.light(41, 41, 10, 15, '#bfe3ff');
  b.encounter('Coils in the cloister', [51, 19, 2, 23], [['giant-constrictor-snake', 1], ['giant-frog', 2]], 'low');

  // ===== inside: the Dry Dome, home of the Index =====
  b.cave('The Dry Dome', 41, 30, 6.6, 6.6, {
    mat: 'marble', wobble: 0.02, seed: 4,
    read: 'Dust hangs in the air and does not fall. A round hall of white marble rises into a dome painted with every star, and in a ring around the floor stand cabinets of tiny drawers, thousands upon thousands of them. Above the ring floats an open ledger, and its pages are turning by themselves.',
    gm: 'The heart of the Stillness, perfectly dry. The Index lives in the drawers and speaks through the ledger. Whoever holds the Index Key (a brass stylus) can command it; anyone else can ask it three questions. Idony means to strike the Roll of the Still Hour from it: if the Roll is blotted out, the spell unravels and every book in the library ages a hundred years at once.',
  });
  b.props_('map-cabinet', [[37, 27], [45, 27], [37, 33], [45, 33], [41, 25], [41, 35], [36, 30], [46, 30]]).prop('levitating-tome', 41, 30).prop('magic-circle', 41, 31).prop('chandelier-great', 39, 29).props_('bookcase-grand', [[39, 25], [43, 25], [39, 35], [43, 35]]).prop('globe-great', 43, 29);
  b.light(41, 30, 20, 20, '#cfe7ff');
  b.hall(41, 37, 41, 39, 1, { mat: 'marble' }).door(41, 39, 's', 'locked', 'door-iron');
  b.hall(41, 21, 41, 22, 1, { mat: 'marble' }).door(41, 21, 'n', 'closed', 'door-iron');
  b.hall(32, 30, 35, 30, 1, { mat: 'marble' }).door(32, 30, 'w', 'secret');
  b.encounter('The Blotting', [34, 23, 14, 14], [['priest', 1], ['cult-fanatic', 2], ['cultist', 6]], 'high');

  // ===== inside: the Hourglass chapel and the north wing =====
  b.room('Hourglass chapel', 35, 11, 13, 6, {
    mat: 'marble',
    read: 'Pews face an altar, and on the altar stands an hourglass as tall as a door. The sand in it hangs in a single motionless thread between the bulbs. Walking in here is like wading through honey: every step takes a long, slow breath.',
    gm: 'Where the Still Hour was cast. The Stillness is thickest here: creatures move at half speed and can take only an action or a move each turn. Turning the great hourglass over (DC 14 Strength, two people can help) lets time trickle in for one hour: normal speed. The Choir are doing this as a slow ritual when the heroes arrive, if the clock is at 4-6. The altar\'s hymn-board lists the hymn "Eleven Before Midnight".',
  });
  b.props_('pew', [[37, 14], [37, 15], [45, 14], [45, 15]]).prop('altar', 41, 12).prop('orb-pedestal', 41, 13).prop('magic-circle', 41, 14).props_('statue-tall-robed', [[35, 11], [47, 11]]).props_('window-stained-tall', [[38, 11], [44, 11]]).props_('candelabra', [[39, 12], [43, 12]]);
  b.light(41, 13, 15, 20, '#ffd9a0');
  b.hall(41, 17, 41, 18, 1, { mat: 'marble' }).door(41, 17, 'n', 'closed');

  b.room("Librarians' cells", 50, 11, 14, 5, {
    mat: 'wood-planks-dark',
    read: 'A row of narrow bedrooms, each with a cot, a desk and a candle that is still alight and still not burning down. On one desk a cup of tea steams, and the steam stands up from it like a feather of glass.',
    gm: 'Ansel Dimbry, the under-librarian, haunts the end cell (ghost, harmless unless the books are harmed). He shushes the heroes, then helps: he knows the dome door opens to "the hour we kept" (eleven minutes to midnight), that the Head Archivist had a hidden study behind the Stacks, and that "little Idony" was the youngest of them. The tea is a hundred years old and perfectly fresh.',
  });
  b.hall(48, 13, 49, 13, 1, { mat: 'stone-flagstone' }).door(49, 13, 'e', 'closed');
  for (const x of [52, 55, 58, 61]) b.wallRun(x, 11, 2, 'e');
  b.props_('cot', [[50, 11], [53, 11], [56, 11], [59, 11], [62, 11]]).props_('writing-desk', [[52, 12], [55, 12], [58, 12]]).prop('candles', 61, 12).prop('nightstand', 63, 12).prop('book-pile', 57, 14).prop('rug-runner', 56, 14);
  b.light(61, 12, 10, 10);

  // ===== inside: the east wing (gallery, inkwell, bindery) =====
  b.room('Gallery of Wardens', 54, 18, 10, 9, {
    mat: 'marble',
    read: 'Suits of armour stand on plinths between glass cases of illuminated books. Each suit holds a long brass letter-opener like a sword. As you enter, every helm turns to look at you, and a voice inside them all says, "Quiet, please."',
    gm: 'Two animated armours and four flying letter-openers (flying swords). They attack only someone who speaks above a whisper or touches a case. A DC 13 Stealth check per hero (group check) gets everyone through in silence. The cases hold three illuminated books (50 gp each, if kept dry).',
  });
  b.hall(58, 16, 58, 17, 1, { mat: 'stone-flagstone' }).door(58, 17, 's', 'closed');
  b.hall(53, 22, 53, 22, 1, { mat: 'stone-flagstone' }).door(53, 22, 'e', 'closed');
  b.props_('armor-stand', [[55, 19], [62, 19], [55, 25], [62, 25]]).props_('display-case', [[58, 20], [58, 24]]).prop('plinth-display', 60, 22).prop('rune-weapon-rack', 63, 22).prop('banner-hanging-tall', 56, 22);
  b.light(58, 22, 10, 15, '#ffe08a');
  b.encounter('Wardens of the gallery', [54, 18, 10, 9], [['animated-armor', 2], ['flying-sword', 4]], 'low');

  b.room('The Inkwell', 54, 29, 10, 9, {
    mat: 'stone-flagstone',
    read: 'The scriptorium: rows of slanted desks, quills still wet. Every inkpot has been knocked over, and the ink has run together into one black lake in the middle of the floor. It shines. It is deeper than the floor it sits on. It is moving.',
    gm: 'A black pudding made of a century of spilled ink. It sleeps until something warm comes within 10 feet, or the winch at the front doors is used. It cannot climb the desks (DC 10 Acrobatics to cross desk to desk). On the master\'s desk: a gold pen (25 gp) and a bundle of spell scrolls in a waxed case.',
  });
  b.hall(58, 27, 58, 28, 1, { mat: 'stone-flagstone' }).door(58, 28, 's', 'closed');
  b.hall(53, 33, 53, 33, 1, { mat: 'stone-flagstone' }).door(53, 33, 'e', 'closed');
  b.props_('writing-desk', [[55, 30], [55, 33], [55, 36], [62, 30], [62, 33], [62, 36]]).prop('tar-pit', 59, 33).prop('oil-slick', 58, 32).prop('lectern', 60, 30).prop('scroll-pile', 63, 35).prop('shelf-jars', 57, 29);
  b.light(60, 30, 10, 10);
  b.encounter('The Inkwell', [54, 29, 10, 9], [['black-pudding', 1]], 'moderate');

  b.room('Bindery', 54, 40, 10, 8, {
    mat: 'wood-planks',
    read: 'Presses, glue-pots, racks of leather and a sewing frame with a book half stitched. A big iron-bound chest sits by the far wall with a label: FOR REPAIR.',
    gm: 'The chest is a mimic (it ate the last binder\'s apprentice and has been dozing since). Mawle\'s crew found the book-chute in the east wall and fled when the chest licked its lips. The chute opens onto the East flats (secret from outside, plain from in here).',
  });
  b.hall(60, 38, 60, 39, 1, { mat: 'stone-flagstone' }).door(60, 39, 's', 'closed');
  b.hall(46, 51, 57, 48, 1, { mat: 'stone-flagstone' }).door(45, 51, 'e', 'closed').door(57, 48, 'n', 'closed');
  b.hall(64, 44, 65, 44, 1, { mat: 'stone-flagstone' }).door(65, 44, 'e', 'secret');
  b.props_('workbench', [[55, 41], [55, 44]]).prop('loom', 58, 41).prop('tool-wall', 61, 40).prop('mimic-chest', 62, 46).props_('book-pile', [[57, 45], [59, 46]]).prop('trunk', 54, 47).prop('cobbler-bench', 60, 43);
  b.light(58, 43, 10, 10);
  b.encounter('The hungry chest', [54, 40, 10, 8], [['mimic', 1]], 'low');

  // ===== inside: the west wing (Hall of Sighs, the Stacks, the hidden study) =====
  b.room('Hall of Sighs', 18, 12, 11, 19, {
    mat: 'stone-flagstone',
    read: 'The great reading hall is a lake with a ceiling. Reading tables stand in the green water with their tops just under the surface, and books lie open on them, dry, though the water covers them. Something huge and pale moves among the tables, and the books turn their pages as it passes.',
    gm: 'The Stillness keeps the books dry even underwater (a page taken out of the water gets wet at once). A chuul lives here: it came up from the lake bottom and the Stillness slows its hunger, so it is patient. Crossing on the table-tops (DC 11 Acrobatics each) keeps heroes out of the deep water. The chuul will not leave the water. Stairs at the south end climb to the Stacks.',
  });
  b.water(19, 13, 9, 17, false, true).water(21, 15, 5, 12, true, true);
  b.props_('table-reading', [[20, 15], [25, 15], [20, 20], [25, 20], [20, 25], [25, 25]]).props_('lily-pads', [[22, 18], [23, 27]]).prop('chandelier-great', 23, 22).props_('bookshelf-tall', [[18, 13], [28, 13], [18, 28]]).prop('bookshelf-fallen', 27, 29).prop('stairs-up', 19, 30).prop('window-stained-tall', 23, 12).prop('reading-nook', 28, 28);
  b.light(23, 22, 15, 20, '#bfe3ff');
  b.encounter('The drowned reader', [18, 12, 11, 19], [['chuul', 1]], 'moderate');
  b.hall(29, 24, 29, 24, 1, { mat: 'stone-flagstone' }).door(29, 24, 'e', 'open', 'door-double');

  b.hall(19, 31, 19, 38, 1, { mat: 'stone-flagstone' }).door(19, 31, 'n', 'closed').door(19, 38, 's', 'closed');
  b.room('The Stacks', 18, 39, 10, 15, {
    mat: 'wood-planks-dark',
    read: 'Shelves forty feet tall, joined by ladders, walkways and spiral stairs. The lower shelves are mud to the knee; the upper ones are perfect. Somewhere above you a voice whispers, "Please don\'t look up quickly."',
    gm: 'A climbing maze. Each band of shelves is a floor of its own: going up or down a level is a ladder or stair (or DC 10 Athletics). Two giant spiders web the top galleries. Wynne Larkspur is stuck on a high walkway, wrapped to the waist in web, clutching a book. One bookcase on the north wall swings out (DC 14 Investigation: it has no dust on its handle): the Head Archivist\'s study.',
  });
  b.wallRun(18, 41, 8, 's').wallRun(20, 44, 8, 's').wallRun(18, 47, 8, 's').wallRun(20, 50, 8, 's');
  b.props_('library-stack', [[20, 41], [23, 41], [22, 44], [25, 44], [20, 47], [23, 47], [22, 50], [25, 50]]).prop('bookcase-secret', 24, 39).props_('bookcase-ladder', [[27, 42], [18, 45], [27, 48], [18, 51]]).prop('stairs-up', 26, 40).prop('stairs-down', 19, 52).prop('stair-spiral', 26, 53).prop('spider-web', 21, 45).prop('spider-web', 25, 46).prop('book-pile', 22, 52).prop('gallery-balcony', 21, 42);
  b.mud(18, 52, 6, 2);
  b.light(23, 45, 10, 15);
  b.encounter('Spiders in the stacks', [18, 39, 10, 15], [['giant-spider', 2]], 'low');
  b.hall(28, 50, 34, 50, 1, { mat: 'stone-flagstone' }).door(34, 50, 'e', 'closed');

  b.room("Head Archivist's study", 22, 33, 6, 4, {
    mat: 'wood-planks-dark',
    read: 'A small warm room with one armchair, one desk and a smell of pipe smoke that is a hundred years old. A page lies on the desk, weighted with a pair of spectacles. Its ink is still wet.',
    gm: 'Secret. The page is the Head Archivist\'s own last draft of the spell (handout): he changed its last line himself, the night before, and the library obeyed him to the letter. It proves Idony did nothing wrong. A second secret door (east) opens into the Flooded cloister, a few steps from the dome\'s hidden door.',
  });
  b.hall(24, 37, 24, 38, 1, { mat: 'wood-planks-dark' }).door(24, 38, 's', 'secret');
  b.hall(28, 34, 29, 34, 1, { mat: 'stone-flagstone' }).door(29, 34, 'e', 'secret');
  b.prop('writing-desk', 24, 34).prop('armchair', 23, 35).prop('bookshelf-tall', 22, 33).prop('globe-stand', 27, 33).prop('candle-ring', 26, 35).prop('gm-treasure', 27, 36, 0, { gm: true });
  b.light(24, 34, 10, 10);

  return b.build();
}

export const SUNKEN_LIBRARY: Adventure = {
  id: 'sunken-library',
  title: 'The Sunken Library of Quillmere',
  tagline: 'A drought has given back a drowned library, and three rival crews are racing for the living catalogue at its heart.',
  levels: '3',
  sessions: '1 session',
  players: '3-5',
  tags: ['one-shot', 'ruins', 'puzzles', 'race', 'cult'],
  pitch:
    'A hundred years ago, the great library of Quillmere sank to the bottom of its lake in a single night, and every book in it was lost. This summer the rains never came. The lake has shrunk to a puddle, and the library\'s towers stand up out of the mud. Scholars, scavengers and stranger folk are already out on the lake bed. They all want the same thing: the Index, the library\'s living catalogue, which remembers every book ever written.',
  secret:
    'The wizard-librarians of Quillmere cast the Still Hour to stop their books from ever growing old. The spell stopped time inside the walls, and a library outside time could not be held up by the world: it sank. Idony Vash, the youngest librarian, was on the steps when it happened. She has blamed herself for a century, kept young by a pocket hourglass of stopped time she stole that night. Now she leads the Blotted Choir, a cult who believe all writing is a chain. She has the Index Key, and she means to make the Index strike out the Roll of the Still Hour: the list of the librarians\' names. Then the world forgets her, the spell unravels, and every book in the library ages a hundred years in a heartbeat. So does she, which is what she wants. The drought is her first chance in a hundred years.',
  hooks: [
    'Magister Perpetua Quayle of the Collegium posts a notice: guides and guards wanted for "the most important expedition of the age", 10 gp a day and a bonus of 100 gp on reaching the Index.',
    'A dying collector hires the heroes to ask the Index one question: where is the last copy of a book of poems his mother wrote. He will pay 300 gp for the answer.',
    'Grey-robed strangers bought every barrel of lamp-black in the market town and were seen heading for the lake. The town reeve wants to know why.',
  ],
  tips: [
    'Keep the Choir\'s clock: start it at 6. Tick one off after every fight, every short rest and every long detour (the tower, the founder\'s head, the dead orchard). At 3, the Choir are through the Hourglass chapel. At 0, Idony stands at the Index and the Blotting begins: the heroes have 5 rounds from when they arrive.',
    'Show the Stillness often: flames like glass, hanging dust, a cup of tea a hundred years hot. Then show it failing where the drought has let the light in: a book ages fifty years as a hero opens it.',
    'The dome has three doors: the south door with the clock lock (set it to eleven minutes to midnight; every clock in the library shows that hour), the north door Idony opens with her key, and the hidden door from the cloister.',
    'Most fights can be skipped. The scavengers want money, the gallery wants quiet, the crocodiles want food, and Idony wants to be forgiven. Give full XP for a clever way past.',
    'Rival crews can become allies: Quayle\'s guards and Mawle\'s bandits will both fight the Choir in the dome if the heroes have dealt fairly with them. Each ally crew removes two cultists from the last fight.',
    'For three players, take two cultists and a cult fanatic out of the Blotting.',
  ],
  npcs: [
    {
      id: 'pf_sklmudge', name: 'Mudge Wicklow', title: 'reed-cutter and lake-bed guide', kind: 'npc', art: 'farmer', monsterId: 'scout', shared: true,
      wants: '5 gp a day, and to see the inside of the library her grandmother used to clean.', knows: 'The reed ford, the crocodiles, Mawle\'s toll, and the way into the toppled tower.',
      voice: 'Quick and cheerful, finishes every warning with "but you\'ll be fine, probably".', appearance: 'Small, sunburned and mud to the knee, with a reed pole twice her height and a hat like a collapsed pie.',
      backstory: 'Her grandmother was a cleaner at the library and was sent home early the night it sank. The family has told the story ever since.',
    },
    {
      id: 'pf_sklquayle', name: 'Perpetua Quayle', title: 'Magister of the Collegium', kind: 'npc', art: 'sage', monsterId: 'noble', shared: true,
      wants: 'The Index brought to the Collegium, with her name on the label.', knows: 'The history of the Still Hour, the library\'s layout from old plans, and that a cult is camped on the north shore.',
      voice: 'Brisk, precise, uses long words and then translates them for you, kindly.', appearance: 'Tall and grey, in a scholar\'s gown hitched up to the knees, with a measuring stick she uses as a pointer.',
      gmNotes: 'A rival, not a villain. If the heroes bring back Wynne safe she trusts them completely and sends her four guards with them.',
    },
    {
      id: 'pf_sklwynne', name: 'Wynne Larkspur', title: 'Quayle\'s runaway student', kind: 'npc', art: 'apprentice-wizard', monsterId: 'commoner',
      wants: 'To be the first to read a lost book, and not to be eaten by a spider.', knows: 'That the Stacks have a secret door (she saw the dust-free handle) and that a book she found names "little Idony".',
      voice: 'Breathless and polite, even when upside down in a web.', appearance: 'A gangly young man with ink on his nose, a satchel full of notebooks and one boot missing.',
    },
    {
      id: 'pf_sklmawle', name: 'Gussett Mawle', title: 'chief of the scavengers', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'A wagonload of anything that sells, and no trouble he isn\'t paid for.', knows: 'The book-chute behind the Bindery, the mimic, and that the Choir have been digging on the north side for three days.',
      voice: 'A salesman\'s warmth with a knife under it. Calls every book "a unit".', appearance: 'A barrel-chested man in a velvet coat stolen from somebody shorter, with three rings on one thumb.',
      gmNotes: 'Bandit captain stat block. Will deal, will trade, will switch sides the moment the Choir look like losing.',
    },
    {
      id: 'pf_sklidony', name: 'Idony Vash', title: 'Mother of the Blotted Choir', kind: 'monster', art: 'cult-fanatic', monsterId: 'priest',
      wants: 'To be forgotten. To strike her name, and the library, out of the world\'s memory.', knows: 'Every hall of the library as it was, the Index\'s commands, and how to wake the Stillness or end it.',
      voice: 'Soft, tired and very kind, like a nurse at a bedside. She never raises her voice.', appearance: 'A woman who looks thirty, with ink-black hands and eyes far older, and a tiny hourglass on a chain whose sand does not fall.',
      backstory: 'The youngest librarian, sent to read the last line of the Still Hour from the steps. She believes she read it wrong and drowned her friends.',
      gmNotes: 'Priest stat block. If shown the Head Archivist\'s last page (handout) she stops, and a DC 13 Persuasion check ends the fight: the cultists drop their brushes. If she is talked down she asks the heroes to let the Index decide what to do with her.',
    },
    {
      id: 'pf_sklcadmus', name: 'Cadmus Drabwell', title: 'Brother of the Blotted Choir', kind: 'monster', art: 'cultist', monsterId: 'cultFanatic',
      wants: 'A world with no books and no debts. He was a moneylender\'s clerk.', knows: 'That Idony is already inside, and that the chapel slows anyone who has not turned the hourglass.',
      voice: 'Loud, preachy and fond of slogans ("The blank page is the honest page!").', appearance: 'A thin man with ink-black hands up to the elbows and a shaved head painted with a black square.',
      gmNotes: 'Cult fanatic stat block. Leads the picket at the north breach.',
    },
    {
      id: 'pf_sklansel', name: 'Ansel Dimbry', title: 'ghost of the under-librarian', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'Quiet in the library, the books safe, and to know whether little Idony survived.', knows: 'The dome door\'s hour, the hidden study, the Index\'s three-question rule, and that the Head Archivist "always fiddled with the wording".',
      voice: 'A whisper with a shush at the end of every sentence.', appearance: 'A plump, translucent man in a cardigan, with a pencil behind each ear.',
      gmNotes: 'Harmless unless someone damages a book in front of him: then he uses the ghost stat block\'s Horrific Visage and vanishes. If Idony is brought to him, both of them can rest.',
    },
    {
      id: 'pf_sklindex', name: 'The Index', title: 'living catalogue of Quillmere', kind: 'npc',
      wants: 'To be asked good questions, and to go on remembering.', knows: 'The title, author and present whereabouts of every book ever written, including the lost ones, and its own spell.',
      voice: 'A thousand rustling pages speaking together, very precise: "Fourteen copies. Two survive. One is under a table leg in a tavern."', appearance: 'An open ledger floating above a ring of drawers. When it speaks, drawers open and close all round the dome like breathing.',
      gmNotes: 'Anyone may ask it three questions. The holder of the Index Key may command it: strike a book (or a name) from memory, or end the Stillness gently, one day per day, so the books age normally from now on.',
    },
  ],
  handouts: [
    { id: 'collegium-notice', title: 'Notice nailed to the jetty', text: 'THE COLLEGIUM OF LETTERS seeks stout guides and guards for an expedition to the drowned library of Quillmere. 10 gp a day. 100 gp more to any who reach the Index. Apply to Magister P. Quayle, at the white tents. Scavengers need not apply.' },
    { id: 'mawle-prices', title: "Mawle's price board", text: 'BRIDGE: 2 gp a head. HALF of what you carry back.\nMAP OF THE INSIDE: 40 gp. (25 gp if you look tough.)\nBOOKS BOUGHT: big ones, red ones, ones with gold on.\nNO credit. NO refunds. NO crocodiles.' },
    { id: 'idony-letter', title: 'A letter in grey ink', text: 'Brother Cadmus,\nHold the breach until the glass is turned. I will go on alone with the key. When the Roll is struck, nothing will remember us, not the books, not the lake, not the people who drowned. It will be the kindest thing anyone has ever written.\nForgive nothing. Forget everything.\nI.' },
    { id: 'last-page', title: "The Head Archivist's last page", text: 'THE STILL HOUR, final draft.\n...and let no page yellow, and let no ink fade, and let no binding crack.\n(crossed out) And let the reader on the steps speak the last line for all of us.\n(written above, in a firmer hand) And LET NOT ONE PAGE TURN, not ever, not by any hand but ours. I will say it myself. The child need only hold the lamp.' },
  ],
  chapters: [
    {
      id: 'lake-bed', title: 'The Dry Bed of Quillmere', level: 3,
      summary: 'A drowned library stands half out of a drying lake bed. Cross the old river, outwit the rival crews, puzzle through the frozen halls of the Still Hour and reach the Index before the Blotted Choir erase it.',
      goal: 'Reach the Index in the Dry Dome, and stop Idony Vash from striking out the Roll of the Still Hour.',
      map: quillmereLakeBed,
      npcs: [
        { npc: 'pf_sklmudge', x: 26, y: 76 },
        { npc: 'pf_sklquayle', x: 8, y: 9 },
        { npc: 'pf_sklwynne', x: 21, y: 46, hidden: true },
        { npc: 'pf_sklmawle', x: 60, y: 74 },
        { npc: 'pf_sklcadmus', x: 44, y: 7, hidden: true },
        { npc: 'pf_sklansel', x: 62, y: 13, hidden: true },
        { npc: 'pf_sklidony', x: 41, y: 28, hidden: true },
        { npc: 'pf_sklindex', x: 41, y: 31, hidden: true },
      ],
      scenes: [
        {
          room: 'Stranded jetty', title: 'The lake gave it back',
          read: 'You stand at the end of a jetty with no water under it. The heat shimmers over a mile of cracked mud, and in the middle of it, black and dripping, a library rises out of the ground like a ship coming up for air.',
          gm: 'Set the scene and the race. From the jetty the heroes can see all three crews: white tents to the west, wagons by a plank bridge to the south-east, grey tents and a thin plume of nothing to the north. Mudge Wicklow offers to guide for 5 gp. Start the Choir\'s clock at 6.',
          handout: 'collegium-notice',
        },
        {
          room: 'The reed ford', title: 'Snappers at the ford', encounter: 'Snappers at the ford',
          gm: 'The free way over the river. Feed the crocodiles (DC 12 Animal Handling) or fight. The other choices: pay Mawle at the bridge, or swim the deep channel (DC 12 Athletics, books get soaked).',
        },
        {
          room: "Mawle's camp", title: "Mawle's toll", encounter: "Mawle's scavengers",
          read: 'A man in a velvet coat opens his arms as if you are old friends. "Customers! Or competition? Either way, there\'s a price."',
          gm: 'Mawle sells passage over the bridge, a map, and the secret of the book-chute (25 gp, DC 13 Persuasion for 10 gp). A fight here is loud and costs a tick on the Choir\'s clock. If the heroes promise him a share, he and his crew will come to the dome when they hear fighting.',
          handout: 'mawle-prices',
          treasure: 'Mawle\'s strongbox: 140 gp, a silver inkwell (25 gp) and a bag of holding he uses for books.',
        },
        {
          room: "Scholars' camp", title: 'The Magister\'s offer', optional: true,
          gm: 'Quayle offers money for an escort or a map, and shares her old plans: they show the Lantern porch, the Stacks, the cloister and "the Dome of the Index", but no doors into it. Mentioning Wynne\'s absence makes her go white. Bring Wynne back and her guards join the heroes.',
          treasure: 'Quayle pays in advance if asked nicely: 50 gp, and two potions of healing from her medicine chest.',
        },
        {
          room: 'Toppled Star Tower', title: 'Through the fallen tower', encounter: 'Tower roost', optional: true,
          gm: 'The back door to the Hall of Sighs, out of sight of Mawle. Stirges and bats in the dark end. Everything in here has rotted: the Stillness ended at the library\'s walls.',
          treasure: 'The telescope\'s lens (75 gp), and a star chart that is worth 50 gp to Quayle.',
        },
        {
          room: 'Hall of Sighs', title: 'The drowned reader', encounter: 'The drowned reader',
          gm: 'Wonder first: dry books under water, a chandelier that has been falling for a hundred years and is still two feet from the ceiling. Then the chuul. Table-top hopping (DC 11 Acrobatics) keeps heroes out of its reach. Lure it with noise one way, cross the other.',
          treasure: 'On the head reader\'s table, under the water and perfectly dry: a spell scroll of water breathing and a cap of water breathing on a hook.',
        },
        {
          room: 'The Stacks', title: 'Climbing the Stacks', encounter: 'Spiders in the stacks',
          read: 'Shelves climb up into the dark, gallery on gallery. Far above, a young man hangs upside down in a web, holding a book to his chest. "Hello," he says. "Please don\'t look up quickly. They like that."',
          gm: 'Climb and fight in three dimensions: spiders drop from above. Rescue Wynne. He spotted the dust-free handle of the secret bookcase (DC 14 Investigation without him) leading to the Head Archivist\'s study, where the last page lies.',
          handout: 'last-page',
          treasure: 'In the study: the Head Archivist\'s spectacles (goggles of night), a wand of magic missiles in the desk drawer, and 60 gp in a tobacco tin.',
        },
        {
          room: "Librarians' cells", title: 'The under-librarian', optional: true,
          read: 'A plump ghost in a cardigan rises out of a cot, presses a finger to his lips, and says, "Shhh. We\'re closed."',
          gm: 'Ansel Dimbry gives the answer to the clock lock (eleven minutes to midnight, "the hour we kept") and tells of little Idony on the steps. He weeps if he hears she lives. He asks the heroes to bring her to him if they can.',
          treasure: 'Ansel lets them borrow "one book each, due back in a fortnight". One is a spellbook with three 1st-level wizard spells; one is a manual of a lost recipe for everlasting tea (50 gp to any inn).',
        },
        {
          room: 'The Inkwell', title: 'The Inkwell', encounter: 'The Inkwell', optional: true,
          gm: 'A black pudding of ink. It can be avoided by crossing on the desks (DC 10 Acrobatics each), or skipped entirely: the east wing is a side trip. Fire makes the ink burn with a smell of old letters.',
          treasure: 'The master\'s waxed case: spell scrolls of identify, comprehend languages and silence; a gold pen (25 gp).',
        },
        {
          room: "The Founder's head", title: 'In the mouth of the founder', encounter: 'The old one of the lake', optional: true,
          gm: 'A hard, optional fight, or a stealth heist (DC 14 Stealth each). The old crocodile has slept here for years. If woken it fights to the water and then lets the heroes go.',
          treasure: 'In the founder\'s throat: 220 gp in old coins, a decanter of endless water (the village will want it badly), and the founder\'s stone spectacles.',
        },
        {
          room: 'Hourglass chapel', title: 'The stopped hour', encounter: 'Picket at the breach',
          read: 'The air thickens like honey as you step inside. In front of the altar, a tall hourglass hangs between moments, its sand a single frozen thread. Grey-robed singers lean on it with all their weight, and it creeps, slowly, slowly, over.',
          gm: 'If the heroes come in from the cloister, the Choir\'s picket comes down through the breach to fight them. In the Stillness everyone moves at half speed and gets an action or a move, not both, until the hourglass is turned. Turning it (DC 14 Strength, helpers give advantage) frees everyone for an hour. If the clock is at 3 or less, Idony is already in the dome.',
          handout: 'idony-letter',
        },
        {
          room: 'The Dry Dome', title: 'The Blotting', encounter: 'The Blotting',
          read: 'Thousands of tiny drawers are opening and closing all round the dome, faster and faster, like a heart in a panic. A woman with black hands stands under the floating ledger with a brass stylus raised, and very gently she begins to cross out a line of names.',
          gm: 'Idony needs 5 rounds to strike the Roll (one name a round). Each name struck makes a wing of the library age a century: dust storms of crumbling paper (DC 12 Constitution save or 1 round blinded). Stopping her: kill or knock her out, take the stylus (DC 15 Sleight of Hand or a grapple), or show her the last page and win a DC 13 Persuasion check. Allies from the rival crews arrive on round 2. Afterwards the Index answers three questions, or obeys whoever holds the key.',
          treasure: 'The Index Key (brass stylus), Idony\'s hourglass pendant (a pearl of power while its sand stands still), and the Choir\'s offering bowl: 90 gp and a ring of swimming.',
        },
      ],
      wrapUp: 'With the Roll safe, the drawers slow and settle. The Index thanks the heroes in its rustling voice and asks what should become of it: stay under the lake, go with the Collegium, or let time back in gently. The lake will come back with the autumn rains, and the library will sink again unless someone decides otherwise.',
    },
  ],
  ending:
    'Win: the Index is saved. If the heroes tell it to let time in gently, the library becomes an ordinary, wonderful ruin that can be studied for a lifetime; Quayle founds a new college on the shore, and Mudge runs the ferry. Idony, if she lived, asks to stay with Ansel\'s ghost as the last librarian. Lose: the Roll is struck, the books crumble to dust in a single grey breath, and nobody can quite remember what the library was called; only the heroes, who were inside, remember. Next: the Index remembers where every lost book is. Every answer it gives is the start of another adventure, and the Blotted Choir have other chapters in other towns.',
};
