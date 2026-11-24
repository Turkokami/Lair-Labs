// The Kneeling Fortress: a one-map battlefield delve for four heroes of level 15.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng, type Side } from './builder';
import type { Adventure } from './types';

/**
 * A zig-zag trench, two squares wide: dirt floor with thin walls on every side except the exits
 * (firing steps, joins and ends) listed. Segments must run straight across or straight down.
 */
function trench(b: MapBuilder, pts: [number, number][], extra: [number, number][], exits: [number, number, Side][]) {
  const cells = new Set<string>();
  const add = (x: number, y: number) => cells.add(`${x},${y}`);
  for (let i = 0; i < pts.length - 1; i++) {
    let [x, y] = pts[i];
    const [bx, by] = pts[i + 1];
    const sx = Math.sign(bx - x), sy = Math.sign(by - y);
    for (;;) {
      add(x, y); add(x + 1, y); add(x, y + 1); add(x + 1, y + 1);
      if (x === bx && y === by) break;
      x += sx; y += sy;
    }
  }
  for (const [x, y] of extra) add(x, y);
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number);
    b.floor(x, y, 1, 1, 'dirt');
  }
  const open = new Set(exits.map(([x, y, s]) => `${x},${y},${s}`));
  const sides: [number, number, Side][] = [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']];
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy, s] of sides) if (!cells.has(`${x + dx},${y + dy}`) && !open.has(`${x},${y},${s}`)) b.wall(x, y, s);
  }
}

function underCrownField() {
  const b = new MapBuilder('adv-clockwork-war', 'The Field Under Hollowcrown', 80, 80, { open: true, floor: 'cave-floor', theme: 'stone', wallStyle: 'stone', ambient: 'dark' });
  const r = rng(1515);
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // ---------- the cavern's rough edge ----------
  const top: number[] = [], bot: number[] = [], lef: number[] = [], rig: number[] = [];
  let t = 1, bo = 78, l = 1, ri = 79;
  for (let i = 0; i < 80; i++) {
    t = cl(t + Math.round((r() - 0.5) * 1.6), 1, 2);
    bo = cl(bo + Math.round((r() - 0.5) * 1.6), 77, 78);
    l = cl(l + Math.round((r() - 0.5) * 1.6), 1, 2);
    ri = cl(ri + Math.round((r() - 0.5) * 1.6), 78, 79);
    top.push(t); bot.push(bo); lef.push(l); rig.push(ri);
  }
  for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) if (y < top[x] || y >= bot[x] || x < lef[y] || x >= rig[y]) b.rock(x, y, 1, 1);

  // ---------- the mountain's roots: solid rock the two sides dug their bunkers into ----------
  b.rock(0, 0, 27, 13); // north-west: the Brazen sappers' rock
  b.rock(0, 13, 17, 30); // the Brazen bunker
  b.rock(0, 65, 24, 15); // south-west: Pennyrock's mine
  b.rock(66, 0, 14, 48); // north-east: the Compact forge and bunker
  b.rock(66, 47, 14, 33); // south-east: the railhead
  // the Oathmother: torso, west forearm, knee, east arm and hand
  b.rock(27, 0, 26, 18).rock(24, 13, 3, 8).rock(33, 18, 14, 6).rock(53, 0, 4, 19).rock(51, 19, 7, 3);
  b.rock(25, 40, 2, 2).rock(30, 32, 2, 2).rock(47, 31, 2, 2).rock(45, 47, 3, 2); // pillars that hold up the roof

  // ---------- the Quickwater: an underground river down the east, then south-west ----------
  const riverC = (y: number) => (y <= 46 ? 61.5 : y <= 62 ? 61.5 - (y - 46) * 0.5 : 53.5 - (y - 62) * (6 / 17));
  for (let y = 0; y < 80; y++) {
    const x0 = Math.round(riverC(y) - 2);
    if (y < top[x0] || y >= bot[x0]) continue;
    b.water(x0, y, 4, 1, false).water(x0 + 1, y, 2, 1, true);
  }

  // ---------- no-man's land: mud, wire and shell craters ----------
  for (let i = 0; i < 16; i++) {
    const x = 26 + Math.floor(r() * 22), y = 29 + Math.floor(r() * 20);
    b.mud(x, y, 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
  }
  b.rubble(35, 37, 7, 7).pit(37, 39, 3, 3); // the White Crater
  const craters: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const x = 27 + Math.floor(r() * 21), y = 30 + Math.floor(r() * 19);
    if (Math.abs(x - 38) < 6 && Math.abs(y - 40) < 6) continue;
    b.rubble(x - 1, y - 1, 3, 3).pit(x, y, 1, 1);
    craters.push([x, y]);
  }
  b.rock(25, 40, 2, 2).rock(30, 32, 2, 2).rock(47, 31, 2, 2).rock(45, 47, 3, 2);
  b.mud(33, 24, 4, 2).mud(44, 25, 5, 2).mud(24, 48, 3, 3);

  // the general's duckboard road, laid plank by plank from his camp to the fortress's knee
  const road: [number, number][] = [[22, 47], [28, 47], [28, 40], [33, 40], [33, 30], [39, 30], [39, 24]];
  for (let i = 0; i < road.length - 1; i++) {
    let [x, y] = road[i];
    const [bx, by] = road[i + 1];
    for (;;) {
      b.floor(x, y, 1, 1, 'wood-planks');
      if (x === bx && y === by) break;
      x += Math.sign(bx - x); y += Math.sign(by - y);
    }
  }

  // ================= PENNYROCK'S MINE (south-west) =================
  b.room('Pennyrock lift', 2, 72, 6, 5, {
    mat: 'wood-planks',
    read: 'The lift cage clanks to a stop at the bottom of the shaft. Timber props, a tally board of shifts, a kettle gone cold. From somewhere ahead comes a sound no mine should make: a slow, heavy tick, like a clock the size of a church.',
    gm: 'Where the heroes start, 900 ft under the town of Pennyrock. Gisla Coalby, the foreman, rides down with them. The tally board shows nine miners marked "lost" in the last two weeks. The bell rope runs to the surface: three pulls means "haul up".',
  });
  b.start(3, 73, 3, 3);
  b.prop('ladder', 2, 76).prop('winch', 6, 72).prop('notice-board', 2, 72).prop('water-barrel', 7, 76).prop('lantern-hanging', 4, 74).prop('pickaxes', 3, 76).prop('mine-support', 7, 73);
  b.light(4, 74, 15, 20);
  b.hall(8, 74, 9, 74, 1).door(7, 74, 'e', 'open');

  b.room('The lower drift', 10, 70, 10, 6, {
    mat: 'dirt',
    read: 'The deepest tunnel in Pennyrock. Ore carts lie on their sides, and the timber props are snapped like kindling. The rails are bent upward, as if something heavy ran over them at a gallop. The air smells of hot iron and green smoke.',
    gm: 'Iron bulls (gorgons) built by the Iron Compact wandered up through the breach and made this drift their pasture. They charge anything that moves and breathe petrifying green gas: two of Pennyrock\'s miners stand here as stone statues (greater restoration brings them back). A DC 17 Perception or Investigation finds old, cold air leaking from a collapse on the east wall: a hidden tunnel (the worm\'s tunnel to the machine graveyard).',
  });
  b.props_('mine-rails', [[11, 73], [12, 73], [13, 73], [14, 73], [15, 73]]).prop('mine-cart', 17, 74, 30).prop('mine-cart', 12, 71, 90).props_('statue', [[16, 71], [18, 72]]).props_('mine-support', [[10, 70], [19, 75]]).prop('ore-pile', 11, 75).prop('rubble-pile', 18, 74).prop('lantern-standing', 14, 75);
  b.light(14, 75, 10, 15);
  b.encounter('Iron bulls in the drift', [10, 70, 10, 6], [['gorgon', 4]], 'low');

  // the worm's tunnel: a secret way from the drift to the machine graveyard
  b.hall(20, 73, 20, 73, 1).door(19, 73, 'e', 'secret');
  b.tunnel([[21, 73], [23, 76], [27, 75], [29, 71]], 2, { seed: 151 });
  b.area("The worm's tunnel", [[21, 73, 7, 4]], {
    read: 'A perfectly round tunnel, glassy-smooth, bored through solid rock. The walls are scored with spiral rings, like the inside of a gun barrel.',
    gm: 'Bored by the quickiron borer that cracked the Stillward a month ago. It is a quiet back way into the machine graveyard, and the worm\'s way home: if the borer is alive, there is a 1 in 6 chance each time the heroes use it that they feel it coming (DC 15 Perception to hear it first).',
    label: [24, 75],
  });
  b.props_('bones', [[23, 75], [27, 74]]).prop('skeleton-lying', 25, 76);

  // the breach and the old seal
  b.tunnel([[14, 69], [15, 63]], 2, { seed: 152 });
  b.cave('The Stillward', 15, 61, 5, 3, {
    seed: 153, mat: 'stone-flagstone',
    read: 'A wall of bronze and black iron, forty feet high, closes off the tunnel ahead. Two hands are cast on it, one bronze and one iron, clasped. The wall is split from floor to ceiling, and the crack is wide enough to drive a cart through.',
    gm: 'The Stillward: the seal the apprentices of both nations built together 312 years ago, when their masters died and the machines would not stop. The inscription (DC 15 History, or Gisla knows the old letters) says: "Here we left the war. Do not go and fetch it." The crack runs from a round bore-hole low on the wall: something huge tunnelled into the seal from below (a quickiron borer, a metal-eating wyrm). The general\'s sentries guard the crack from the camp side.',
  });
  b.props_('gate-iron-tall', [[12, 60], [18, 60]]).prop('rune-stone', 15, 59).props_('ceiling-rubble', [[14, 62], [17, 63]]).prop('sinkhole', 13, 63).prop('torch-standing', 16, 61);
  b.light(16, 61, 10, 20);

  // ================= THE GENERAL'S EXPEDITION CAMP (west) =================
  b.paint(2, 43, 21, 16, 'dirt');
  b.area('Expedition camp', [[2, 43, 21, 15]], {
    read: 'Lamps on poles, rows of grey tents, and soldiers in the realm\'s blue coats who flinch every time the ground shakes. A palisade of sharpened stakes faces the dark. Beyond it, something enormous and metal is screaming at something else enormous and metal.',
    gm: 'General Marek Esterhal brought two companies down here six days ago "to secure the danger". Most of them are dead. About thirty soldiers are left, hungry and scared, under Captain Leocadia Faye; the general and his battle-mage are inside the fortress. The camp fight only happens if the heroes force it: Faye would rather talk (Helpful on a DC 15 Persuasion if the heroes show her the general\'s orders, or promise to get her people home). Eight Pennyrock miners are kept in the pen, made to dig.',
    label: [12, 50],
  });
  b.building('Command pavilion', 4, 46, 8, 6, {
    mat: 'wood-planks',
    read: 'A big canvas pavilion with a map table, a camp bed made with military corners and a locked dispatch box. A drawing of a walking castle is pinned to the canvas, with sums written all over it.',
    gm: 'The general\'s tent. The dispatch box (DC 18 thieves\' tools, or Faye\'s key) holds his orders to his officers (handout). The drawing is his own sketch of the Oathmother: the sums work out how fast she walks (three days to Kestrelgate, the capital).',
    doors: [[11, 49, 'e', 'open'], [7, 51, 's', 'closed']],
  });
  b.prop('tent-command', 7, 48).prop('war-table', 6, 49).prop('cot', 10, 47).prop('strongbox', 5, 50).prop('banner-pole', 4, 46).prop('chair', 8, 50);
  b.props_('tent', [[14, 44], [17, 44], [14, 47], [17, 47]]).props_('bedroll', [[13, 50], [19, 50]]).prop('campfire', 15, 51).prop('cooking-pot-fire', 16, 52).props_('crate-stack', [[3, 54], [5, 55]]).props_('barrel-group', [[9, 55], [3, 44]]).prop('weapon-rack', 10, 44).props_('lamp-post', [[13, 45], [20, 53]]);
  b.props_('cage', [[15, 55], [17, 55], [19, 55]]).prop('wagon', 7, 56).prop('gear-pile', 11, 56).prop('chains-hanging', 13, 56);
  b.props_('cheval-de-frise', [[22, 44], [22, 50], [22, 55]]).props_('sandbags', [[21, 46], [21, 52]]).prop('barricade-wood', 22, 57).prop('war-banner', 20, 48);
  b.light(15, 51, 15, 20).light(13, 45, 10, 20).light(20, 53, 10, 20);
  b.encounter("Faye's company", [2, 43, 21, 15], [['veteran', 6], ['mage', 2], ['knight', 4]], 'low');

  // ================= THE BRAZEN CROWN'S BUNKER (west, in the rock) =================
  b.room('Brazen gallery', 12, 14, 2, 28, {
    mat: 'dungeon-slab',
    read: 'A long gallery cut from the rock and lined with bronze plates, each one stamped with a rising sun. Speaking-tubes run along the ceiling. Now and then one of them whispers an order in an old, old voice.',
    gm: 'The spine of the Aumery bunker. The speaking-tubes carry Isembard\'s ghost voice: "Hold the line. Hold the line." Anyone wearing a Brazen sun badge (from the trench dead) is ignored by Brazen machines unless they attack.',
    label: [12, 28],
  });
  b.props_('sconce-magefire', [[12, 16], [13, 24], [12, 32], [13, 40]]).props_('banner-hanging-tall', [[13, 20], [12, 36]]).prop('weapon-rack', 13, 29);
  b.light(12, 16, 10, 15, '#ffd27a').light(13, 32, 10, 15, '#ffd27a');

  b.room('Golem cradles', 2, 14, 9, 6, {
    mat: 'dungeon-slab',
    read: 'Bronze frames line the walls, each shaped to hold a giant. Most are empty. In two, great figures of grey stone stand with their eyes shut and dust on their shoulders.',
    gm: 'Where the Brazen stone golems were wound and mended. The two here are part of the bunker garrison and wake if the war room fight starts. A locked iron hatch in the north wall (DC 20 thieves\' tools, or the war room key) opens on Sap Four, the tunnel to the fortress.',
  });
  b.hall(11, 16, 11, 16, 1).door(10, 16, 'e').door(11, 16, 'e');
  b.props_('statue-tall-knight', [[3, 15], [9, 15]]).props_('chains-hanging', [[5, 15], [7, 15]]).prop('workbench', 5, 18).prop('tool-wall', 8, 18).prop('anvil', 3, 18);

  b.room('Brazen war room', 2, 22, 9, 10, {
    mat: 'marble',
    read: 'A round table holds a bronze model of the whole battlefield, its little machines still creeping across it on clockwork tracks. Behind it, a wall of brass pipes and dials hums like an organ. A man in an artificer\'s coat stands over the table, and you can see the dials through him.',
    gm: 'The Order-Engine of the Brazen Crown: the "organ" of pipes. In its heart sits the Bronze Key. Isembard Oradel\'s ghost will not let anyone touch it. He believes the Iron Compact murdered him under a flag of truce. If the heroes prove otherwise (the shell casing from the White Crater, DC 16 Persuasion with it; impossible without), he gives the key and his blessing. If they take it by force, the garrison wakes.',
  });
  b.hall(11, 26, 11, 26, 1).door(10, 26, 'e').door(11, 26, 'e');
  b.prop('war-table', 6, 26).prop('pipe-organ', 2, 26, 90).prop('lectern-dais', 8, 23).props_('pillar-round', [[3, 23], [9, 30]]).prop('orrery', 9, 23).prop('banner-hanging-tall', 3, 30);
  b.light(6, 26, 15, 20, '#ffd27a');
  b.encounter('The Brazen garrison', [2, 14, 9, 18], [['stone-golem', 2], ['shield-guardian', 2]], 'moderate');

  b.room("Isembard's study", 2, 34, 7, 7, {
    mat: 'wood-planks-dark',
    read: 'A narrow study, still tidy. Drawings of the walking fortress cover one wall. A letter lies unfinished on the desk, the pen beside it rusted to the page.',
    gm: 'Isembard\'s log (handout) is on the desk. A DC 15 Investigation of the drawings shows the Oathmother\'s Heart has TWO keyholes, one marked with a sun and one with a gear. Hidden in a desk drawer (DC 17): a wand of the war mage +2 and a ring of free action.',
  });
  b.hall(9, 37, 11, 37, 1).door(8, 37, 'e').door(11, 37, 'e');
  b.prop('writing-desk', 4, 36).prop('chair-high-back', 4, 37).prop('bookshelf-tall', 2, 34).prop('map-cabinet', 7, 34).prop('bed', 7, 39).prop('candles', 5, 36).prop('scroll-pile', 2, 39);
  b.light(5, 36, 5, 10);

  // bunker exits to the trench
  b.hall(14, 18, 16, 18, 1).door(13, 18, 'e', 'closed', 'door-iron').door(16, 18, 'e', 'open', 'door-iron');
  b.hall(14, 38, 16, 38, 1).door(13, 38, 'e', 'closed', 'door-iron').door(16, 38, 'e', 'open', 'door-iron');

  // Sap Four: a secret tunnel from the cradles under the rock to the fortress's flank
  b.hall(6, 8, 6, 13, 1).door(6, 13, 's', 'locked', 'door-iron');
  b.tunnel([[6, 8], [12, 6], [18, 6], [24, 4], [26, 5]], 1, { seed: 154 });
  b.hall(26, 5, 27, 5, 1).door(27, 5, 'e', 'secret');
  b.cave("Sappers' listening post", 15, 6, 3, 2, {
    seed: 155,
    read: 'The tunnel widens into a little chamber. Six skeletons in leather caps sit against the wall with brass ear-trumpets pressed to the rock, as if they are still listening.',
    gm: 'Sap Four, the Brazen sappers\' tunnel, dug to plant a charge under the Oathmother. It ends at a hidden plate in the fortress\'s side that opens into the gun deck (DC 15 Perception from this side to find the catch; DC 20 from the gun deck). The sappers\' unused charge is still here: a keg of blasting powder (as a necklace of fireballs bead, 8d6 fire, 20 ft radius).',
  });
  b.props_('skeleton-seated', [[13, 6], [17, 6]]).prop('barrel', 15, 7).prop('pickaxes', 16, 5).prop('mine-support', 12, 6).prop('lantern-hook', 21, 5);

  // ================= THE BRAZEN TRENCH =================
  b.rock(17, 13, 1, 25); // the trench's back wall, hard against the bunker rock
  trench(b, [[18, 13], [18, 21], [21, 21], [21, 30], [18, 30], [18, 39], [21, 39], [21, 47], [18, 47], [18, 50]], [[17, 18], [17, 38]], [
    [19, 15, 'e'], [21, 27, 'w'], [22, 25, 'e'], [22, 26, 'e'], [19, 34, 'e'], [22, 43, 'e'], [18, 51, 's'], [19, 51, 's'],
  ]);
  b.area('Brazen trench', [[17, 13, 7, 38]], {
    read: 'A zig-zag ditch lined with bronze sheeting, deep enough to hide a giant to the waist. Bronze soldiers stand on the firing steps, faces to the dark, waiting for an order that never changes.',
    gm: 'The Aumery front line. Its machines ignore anyone wearing the Brazen sun badge (there are dozens on the dead). Firing steps lead up and out into no-man\'s land; the south end opens toward the general\'s camp. Behind the line is a dugout where the crews sat out the guns: a skeleton still holds a hand of cards, and a footlocker holds 40 sun badges. If the heroes come through without badges, the line wakes: the bronze soldiers are clockwork troopers, backed by the stone golem and shield guardians of the garrison.',
    label: [19, 28],
  });
  b.props_('stairs-up', [[19, 15], [22, 25], [19, 34], [22, 43]]).props_('sandbags', [[21, 22], [18, 31], [21, 40], [18, 48]]).props_('statue-knight', [[22, 28], [18, 36]]).props_('skeleton-lying', [[19, 19], [21, 45]]).prop('spear-rack', 18, 25, 90).props_('lantern-hook', [[19, 17], [21, 36]]).prop('weapon-barrel', 22, 33).prop('cannon', 22, 27, 90);
  b.light(19, 17, 10, 15).light(21, 36, 10, 15);
  b.props_('bunk-bed', [[18, 24], [18, 28]]).prop('table-cards', 19, 26).prop('stove', 20, 23).prop('skeleton-seated', 19, 27).prop('footlocker', 20, 29); // the dugout behind the line
  b.encounter('The Brazen line', [17, 13, 7, 38], [['stone-golem', 1], ['shield-guardian', 2], ['clockworkTrooper', 6]], 'low');

  b.area("The fortress's shadow", [[20, 13, 4, 8]], {
    read: 'Between the trench and a forearm of riveted iron as long as a street, the air is still. A bronze hand the size of a barn door lies on the ground here, palm up.',
    gm: 'The Oathmother\'s west forearm rests here. A DC 18 Athletics climb up the forearm reaches the shell hole in her side without crossing open ground.',
    label: [21, 17],
  });
  b.prop('statue-tall-winged', 21, 19).prop('giant-ribcage', 22, 14);

  // ================= NO-MAN'S LAND =================
  b.area("No-man's land", [[24, 27, 28, 25]], {
    read: 'Mud, wire and craters, as far as your light can reach. Dead machines lie where they fell, some of them still twitching. Every so often, a gun far away coughs, and the dark lights up red.',
    gm: 'The killing ground. Every hour (or after every two scenes) comes the Push: both sides advance, the guns fire and Gravemaker walks. During a Push anyone in the open rolls a d6 each round: on a 1, a shell lands beside them (DC 17 Dexterity save, 27 (5d10) thunder damage, half on a success). Mud is difficult ground; a crater is a 15 ft drop. The duckboard road is the general\'s: firm footing, and the machines have learned to aim at it.',
    label: [36, 33],
  });
  b.props_('caltrops', [[27, 36], [41, 29], [36, 47], [44, 43]]).props_('brambles', [[29, 44], [43, 35], [49, 40], [32, 50]]).props_('skeleton-lying', [[31, 38], [44, 33], [40, 49]]).props_('burning-wreckage', [[34, 34], [46, 44]]).prop('siege-tower', 43, 38).prop('column-fallen', 29, 30, 30).prop('ballista', 48, 36).prop('statue-tall-knight', 26, 34, 90).prop('war-banner', 37, 46).prop('cannon', 31, 46, 45).prop('battering-ram', 47, 28).prop('crumbling-ledge', 45, 50);
  for (const [cx, cy] of craters.slice(0, 4)) b.prop('pit-deep', cx, cy);
  b.light(34, 34, 15, 25, '#ff7a2e').light(46, 44, 15, 25, '#ff7a2e');
  b.encounter('Gravemaker walks', [26, 28, 24, 12], [['gravemaker', 1], ['gorgon', 3]], 'moderate');

  b.area('The White Crater', [[35, 37, 7, 7]], {
    read: 'One crater is different. A white flag on a broken pole still stands at its lip. In the bottom, two skeletons lie side by side, one in bronze-buttoned cloth, one in an iron-grey apron, and between them a paper sealed in glass.',
    gm: 'Where Isembard Oradel and Ilka Vrell met to end the war, and died. The paper is their signed peace (handout). Half buried in the mud is the shell that killed them: its casing (DC 14 Investigation to dig it out) is stamped with the Iron Compact\'s gear and the mark VII, the number of the Compact\'s own juggernaut, Gravemaker. Neither side betrayed the truce: their own war killed them. The dead of no-man\'s land rise to guard the place.',
    label: [38, 38],
  });
  b.props_('skeleton-lying', [[37, 38], [39, 38]]).prop('banner-pole', 36, 37).prop('reliquary', 38, 41).prop('bones', 40, 42);
  b.encounter('The fallen of the wire', [33, 36, 10, 10], [['wraith', 4], ['specter', 6]], 'low');

  b.area('The duckboard road', [[27, 40, 3, 8]], {
    read: 'Fresh planks, laid end to end across the mud, run straight from the soldiers\' camp to the kneeling fortress. Some of them are splashed dark.',
    gm: 'Built by the general\'s men at a cost of forty lives. Walking it is fast (no difficult ground) but a Push always targets it: double the shell chance on the road.',
    label: [28, 44],
  });

  // ================= THE OATHMOTHER: the walking fortress, kneeling =================
  b.area('The kneeling field', [[27, 22, 25, 5]], {
    read: 'Above you, a castle has knelt down. Iron legs as tall as towers bend under a hull of black and bronze plates, its great head bowed, its hands on the ground. Its knee is a gatehouse. Its eyes are dark.',
    gm: 'The Oathmother, the walking fortress both nations built together when they were friends. When the war came, each side seized half of her orders, and she knelt here in the middle of the field and never rose. Four ways in: the Knee-Gate (front), the shell hole on her west flank (a climb), the hatch in her east hand, and the secret plate at the end of Sap Four.',
    label: [39, 25],
  });
  b.props_('boulder-large', [[29, 24], [49, 23]]).prop('chains-hanging', 33, 25).prop('anchor', 47, 25).prop('skeleton-lying', 42, 26).prop('torch-standing', 38, 25);
  b.light(38, 25, 10, 20);

  b.room('The Knee-Gate', 37, 18, 6, 6, {
    mat: 'dungeon-slab',
    read: 'The inside of the knee is a gatehouse of riveted plate. Two iron knights flank an inner portcullis, and swords hang in the air between them, turning slowly, points out.',
    gm: 'A brass plate by the portcullis tells who built the Oathmother (handout). The wardens here (two Knee-Gate Wardens, with four flying swords turning between them) attack anyone who does not carry an Order-Key. A key held up makes them stand aside. The general\'s men got through by losing a dozen soldiers; their bodies are still here.',
  });
  b.door(39, 23, 's', 'closed', 'door-double').door(40, 23, 's', 'closed', 'door-double');
  b.hall(39, 15, 39, 17, 2).door(39, 17, 's', 'open', 'door-iron').door(40, 17, 's', 'open', 'door-iron').door(39, 14, 's', 'closed', 'door-iron').door(40, 14, 's', 'closed', 'door-iron');
  b.props_('statue-tall-knight', [[37, 19], [42, 19]]).prop('portcullis', 39, 18).props_('skeleton-lying', [[38, 22], [41, 21]]).prop('gear-pile', 42, 22).prop('brazier-everburning', 37, 22);
  b.light(37, 22, 10, 15, '#7fb8ff');
  b.encounter('The knee wardens', [37, 18, 6, 6], [['kneeGateWarden', 2], ['flying-sword', 4]], 'low');

  b.room('Gun deck', 28, 3, 5, 13, {
    mat: 'wood-planks-dark',
    read: 'A long, low deck lined with cannon, each one aimed out through a slit in the hull. Two stone giants with gunner\'s rammers stand at the guns. Soldiers in blue coats are trying to pry one of the guns loose, and losing.',
    gm: 'A three-way fight: the general\'s sappers (3 mages) are trying to turn the guns on the Brazen trench, and two Brazen stone golems are trying to stop them. Both sides attack the heroes if the heroes join in, but the golems ignore sun-badge wearers and the mages will gladly team up against the golems. A hidden plate in the west wall (DC 20) opens on Sap Four.',
  });
  b.hall(33, 10, 33, 10, 1).door(32, 10, 'e', 'closed', 'door-iron').door(33, 10, 'e', 'closed', 'door-iron');
  b.props_('cannon', [[28, 4], [28, 7], [28, 10], [28, 13]], 270).props_('barrel-stack', [[32, 4], [32, 14]]).prop('crate-stack', 31, 8).prop('weapon-rack', 32, 12).prop('lantern-hanging', 30, 9);
  b.light(30, 9, 10, 20);
  b.encounter('Battle on the gun deck', [28, 3, 5, 13], [['stone-golem', 2], ['mage', 3]], 'moderate');

  b.floor(30, 16, 1, 2, 'stone-cobble').rubble(30, 16, 1, 2);
  b.area('The shell hole', [[30, 16, 1, 2], [27, 18, 6, 4]], {
    read: 'A hole has been punched through the fortress\'s side by some ancient shell. Twisted plates curl outward like the petals of an iron flower. Below it, a heap of rubble makes a rough slope.',
    gm: 'A back way into the gun deck: DC 15 Athletics to scramble up the rubble (a failure costs the climb and makes enough noise to warn the gun deck).',
    label: [30, 19],
  });
  b.props_('rubble-pile', [[29, 19], [31, 20]]).prop('debris-wood', 28, 21).prop('column-collapsed', 32, 18);

  b.room('The Heart of the Oathmother', 34, 6, 12, 9, {
    mat: 'marble',
    read: 'A round hall in the middle of the fortress, warm as a living body. In the centre, chained in a cage of bronze ribs, hangs a sphere of liquid silver as big as a cottage, pulsing slowly. Before it stand two pedestals, each with a keyhole: one shaped like a sun, one like a gear. Between you and them stands a giant of black iron.',
    gm: 'The Heart. The Heart Warden (iron golem) attacks anyone here who does not carry an Order-Key; key-bearers it ignores unless they attack it. The general and Magister Arvanne are here, holding the Warden back behind a wall of force while Arvanne works his ritual to wake the Heart without keys (6 hours; how far along he is depends on how long the heroes took). Turning BOTH keys together: every machine under the mountain stands down. Turning ONE key: the Oathmother rises for that side. Finishing the ritual: she rises for whoever sits in the Crown.',
  });
  b.hall(40, 4, 40, 5, 1).door(40, 5, 's', 'closed', 'door-iron').door(40, 3, 's', 'closed');
  b.prop('orb-pedestal', 40, 10).prop('magic-circle', 39, 10).props_('rune-stone', [[38, 8], [42, 8]]).props_('pillar-round', [[35, 7], [44, 7], [35, 13], [44, 13]]).props_('chains-hanging', [[38, 11], [42, 11]]).props_('crystal-spire', [[36, 10], [43, 10]]).prop('summoning-circle', 37, 13);
  b.light(40, 10, 25, 30, '#c9d7ff').light(36, 10, 10, 15, '#9fd3ff').light(43, 10, 10, 15, '#9fd3ff');
  b.encounter('The Heart of the Oathmother', [34, 6, 12, 9], [['iron-golem', 1], ['archmage', 1], ['gladiator', 1], ['shield-guardian', 2]], 'high');

  b.room('The Crown', 37, 1, 6, 3, {
    mat: 'wood-planks-dark',
    read: 'The fortress\'s head: a narrow bridge with a seat of bronze and leather before a great window of dark crystal. In the seat sits a skeleton in a pilot\'s harness, one hand still on the lever.',
    gm: 'The pilot\'s seat. When the Heart is awake, whoever sits here steers the Oathmother: DC 16 Intelligence check each minute to keep her walking where you want, or she falls back on her last order. The pilot, Marshal Corvina Quarra of both nations, died here on the first day of the war rather than choose a side. Her harness is a cloak of protection; the lever-hand wears a ring of feather falling.',
  });
  b.prop('throne', 40, 2).prop('skeleton-seated', 40, 2).prop('telescope', 38, 1).prop('map-cabinet', 42, 3).prop('lever', 41, 1).prop('stair-spiral', 40, 3);
  b.light(39, 2, 5, 10, '#9fd3ff');

  b.room('Engine hall', 47, 3, 5, 13, {
    mat: 'stone-flagstone-warm',
    read: 'Pistons as thick as oak trees rise and fall in the dark, slowly, as if the fortress is breathing in her sleep. Steam hisses from a hundred joints. A fire burns in a furnace that no one has fed in three hundred years.',
    gm: 'The engines that would move her legs. A DC 18 Arcana check shows the furnace is fed by a bound fire spirit and that smashing the four piston valves (AC 19, 40 hp each) would stop the Oathmother walking even if she wakes: a desperate last resort. The general\'s quartermaster cached supplies here: 4 potions of superior healing and a bag of holding.',
  });
  b.hall(46, 10, 46, 10, 1).door(45, 10, 'e', 'closed', 'door-iron').door(46, 10, 'e', 'closed', 'door-iron');
  b.props_('pipe-organ', [[49, 4], [49, 14]]).prop('forge', 47, 9).props_('steam-vent', [[50, 7], [50, 11]]).prop('winch', 51, 5).prop('lever', 51, 12).prop('supplies', 48, 12).prop('anvil', 48, 6);
  b.light(47, 9, 15, 20, '#ff9a3c');

  b.hall(52, 12, 53, 12, 1).door(51, 12, 'e', 'closed', 'door-iron');
  b.floor(54, 6, 2, 16, 'dungeon-slab');
  b.door(54, 21, 's', 'closed', 'door-iron').door(55, 21, 's', 'closed', 'door-iron');
  b.area('The reaching arm', [[54, 6, 2, 16]], {
    read: 'A narrow passage runs down the inside of the fortress\'s arm, past great cables that creak like ship\'s rigging. At the bottom, a round hatch opens in the palm of her hand.',
    gm: 'The east way in. The Iron Compact tried to board her here and failed; their trench runs right up to the hand. The hatch is stiff (DC 14 Athletics, or one turn of work).',
    label: [54, 14],
  });
  b.props_('chains-hanging', [[54, 9], [55, 16]]).prop('ladder', 55, 7).prop('trapdoor', 54, 20);

  // north bank: between the fortress's east arm and the river
  b.area('North bank', [[57, 2, 3, 20]], {
    read: 'A strip of black shingle between the fortress\'s iron arm and the fast, dark river. Shattered machines have washed up here like driftwood.',
    gm: 'The quiet way from the fortress\'s hand to the Iron Bridge and the collapsed forge. Nothing patrols it.',
    label: [58, 12],
  });
  b.props_('debris-wood', [[58, 5], [57, 17]]).prop('gear-pile', 59, 14).prop('skeleton-lying', 58, 19).prop('reeds', 59, 3);

  // ================= THE IRON COMPACT'S TRENCH =================
  trench(b, [[55, 23], [55, 29], [52, 29], [52, 37], [55, 37], [55, 46]], [], [
    [55, 23, 'n'], [56, 23, 'n'], [56, 27, 'e'], [52, 33, 'w'], [56, 41, 'e'], [55, 43, 'w'], [55, 47, 's'], [56, 47, 's'],
  ]);
  b.area('Compact trench', [[52, 23, 5, 25]], {
    read: 'A trench lined with black iron, cut in hard angles. The firing steps are worn down by three hundred years of the same boots climbing up and down, up and down. Something below the duckboards ticks.',
    gm: 'The Drask front line. Iron machines here ignore anyone wearing the Compact\'s gear badge. The ticking is a clockwork mine under the boards at the west step (DC 17 Perception to spot; DC 17 Dexterity save, 22 (4d10) fire, half on a success). The trench\'s north end runs right up to the Oathmother\'s hand.',
    label: [53, 33],
  });
  b.props_('stairs-up', [[56, 27], [52, 33], [56, 41], [55, 43]]).props_('sandbags', [[55, 25], [53, 35], [56, 45]]).prop('pressure-plate', 53, 32, 0, { gm: true }).props_('skeleton-seated', [[56, 30], [55, 39]]).prop('weapon-barrel', 52, 37).props_('lantern-hook', [[55, 28], [56, 44]]).prop('cannon', 53, 30, 270);
  b.light(55, 28, 10, 15).light(56, 44, 10, 15);

  // ================= THE RIVER AND ITS CROSSINGS =================
  b.floor(60, 9, 4, 2, 'stone-cobble');
  b.area('The Iron Bridge', [[60, 9, 4, 2]], {
    read: 'A bridge of black iron girders spans the river, built to carry machines. It groans under your weight, and the river roars beneath it.',
    gm: 'Sound, but the Compact wired it to fall: a DC 16 Perception spots the release pins. Pulling them drops the bridge into the river.',
    label: [61, 9],
  });
  b.prop('bridge-plank', 61, 10, 90).props_('lantern-wall', [[60, 9], [63, 10]]);
  b.light(60, 9, 10, 15);

  b.floor(60, 27, 4, 1, 'wood-planks').rubble(61, 27, 2, 1);
  b.area('The broken footbridge', [[60, 27, 4, 1]], {
    read: 'A footbridge of planks, broken in the middle. The two ends hang over the water, a long jump apart.',
    gm: 'A 10 ft gap over deep water: DC 13 Athletics to jump it. A fall into the river: DC 15 Strength (Athletics) or be swept 30 ft downstream.',
    label: [61, 27],
  });

  b.water(60, 40, 4, 2, false);
  b.area('Ford of Rust', [[58, 36, 8, 9]], {
    read: 'The river spreads out here, waist deep, over a bed of rusted machine parts. Shapes move under the water, and the bank is littered with iron claws.',
    gm: 'The shallow crossing between the trenches and the Compact bunker. Water elementals bound by the Compact to guard the ford rise with chuul that nest in the wrecks. Throwing them a Compact gear badge, or wearing one, lets the elementals pass you by; the chuul just want food.',
    label: [61, 41],
  });
  b.props_('gear-pile', [[59, 38], [64, 43]]).prop('skeleton-lying', 58, 43).prop('reeds', 65, 37).prop('anchor', 59, 44);
  b.encounter('The ford wardens', [58, 36, 8, 9], [['water-elemental', 3], ['chuul', 4]], 'low');

  b.area('East bank', [[64, 2, 2, 45]], {
    read: 'A narrow bank of shingle under a cliff of iron-grey rock. Iron doors are set into the cliff, stamped with a great gear.',
    gm: 'The Iron Compact\'s side of the river. Two doors lead into their bunker (one by the footbridge, one by the ford) and an open arch leads into the collapsed forge.',
    label: [64, 33],
  });
  b.props_('lamp-post', [[65, 26], [65, 40]]).prop('mooring-post', 64, 15).prop('rowboat', 64, 20).prop('bones', 65, 34);
  b.light(65, 26, 10, 15).light(65, 40, 10, 15);

  // ================= THE COLLAPSED FORGE (north-east) =================
  b.hall(64, 9, 68, 9, 2);
  b.cave('The collapsed forge', 72, 10, 5, 7, {
    seed: 156, mat: 'stone-flagstone-warm',
    read: 'Half the roof has come down on the Compact\'s great forge, but the fires never went out. Molten iron still dribbles from a cracked crucible into channels in the floor. Shapes of living flame tend the anvils, hammering at nothing.',
    gm: 'Fire spirits the Compact bound to work its forges, still at work. They attack anyone who is not a smith (anyone who picks up a hammer and works an anvil for a round is left alone, DC 15 Deception or tool proficiency). Under the rubble (DC 16 Investigation) lies the Compact\'s last masterwork: a set of +2 plate armour and a hammer of thunderbolts never collected.',
  });
  b.lava(72, 8, 2, 2).lava(70, 12, 3, 1).rubble(68, 4, 3, 3).rubble(75, 14, 2, 3);
  b.props_('forge', [[70, 6], [76, 9]]).props_('anvil', [[71, 9], [75, 11]]).prop('cauldron', 74, 6).prop('ceiling-rubble', 69, 5).prop('lava-crack', 73, 13).prop('magma-vent', 70, 14).prop('tool-wall', 76, 7).prop('ore-pile', 68, 11);
  b.light(72, 9, 20, 30, '#ff7a2e').light(70, 6, 10, 15, '#ff9a3c');
  b.encounter('The forge that still burns', [67, 3, 11, 14], [['fire-elemental', 2], ['salamander', 3]], 'low');

  // ================= THE IRON COMPACT'S BUNKER (east, in the rock) =================
  b.hall(73, 12, 73, 22, 1).door(73, 22, 's', 'closed', 'door-iron');
  b.room('Compact gallery', 67, 24, 2, 23, {
    mat: 'dungeon-slab',
    read: 'A hall of black iron plates, each stamped with a gear. Every ten feet hangs a clock, and every clock shows a different time.',
    gm: 'The spine of the Drask bunker. The clocks each show the hour a Compact city fell. The iron machines inside ignore anyone wearing a Compact gear badge.',
    label: [67, 35],
  });
  b.props_('lantern-wall', [[67, 26], [68, 33], [67, 45]]).prop('banner-hanging-tall', 68, 29).prop('weapon-rack', 67, 38);
  b.light(67, 26, 10, 15, '#9fd3ff').light(68, 38, 10, 15, '#9fd3ff');
  b.hall(66, 27, 66, 27, 1).door(66, 27, 'e', 'closed', 'door-iron');
  b.hall(66, 41, 66, 41, 1).door(66, 41, 'e', 'closed', 'door-iron');

  b.room('Foundry cradles', 70, 23, 8, 6, {
    mat: 'dungeon-slab',
    read: 'Moulds big enough to cast a giant line the walls. Three figures of red clay stand half-finished in their frames, wet as if made yesterday.',
    gm: 'Where the Compact\'s clay golems were made. The ones here are part of the bunker garrison. The iron door north leads up a stair to the collapsed forge.',
  });
  b.hall(69, 25, 69, 25, 1).door(68, 25, 'e').door(69, 25, 'e');
  b.props_('statue-tall-robed', [[71, 24], [74, 24], [77, 24]]).prop('cauldron', 72, 27).prop('workbench', 76, 27).prop('tool-crate', 70, 28);

  b.room('Compact war room', 70, 31, 8, 8, {
    mat: 'stone-flagstone',
    read: 'A cold, square room with a map of the battlefield etched into an iron floor plate. At the far wall, a great engine of gears turns, slowly, endlessly. A woman in a smith\'s apron stands before it, translucent, her arms folded, watching a door that never opens.',
    gm: 'The Order-Engine of the Iron Compact, with the Iron Key in its heart. Ilka Vrell\'s ghost guards it. She believes the Brazen Crown fired on her under the white flag. The shell casing from the White Crater (her own juggernaut\'s mark) breaks her: DC 14 Persuasion and she gives the key. Taken by force, the garrison wakes, and she fights with them.',
  });
  b.hall(69, 34, 69, 34, 1).door(68, 34, 'e').door(69, 34, 'e');
  b.prop('orrery', 77, 34).prop('table-maps', 73, 34).prop('lectern', 75, 32).props_('pillar-square', [[71, 32], [71, 37]]).prop('heraldic-crest', 77, 31).prop('candle-stand-tall', 76, 37);
  b.light(75, 34, 15, 20, '#9fd3ff');
  b.encounter('The Compact garrison', [70, 23, 8, 16], [['clay-golem', 3], ['salamander', 1], ['fire-elemental', 1]], 'moderate');

  b.room("Ilka's workshop", 71, 41, 7, 6, {
    mat: 'wood-planks-dark',
    read: 'Clockwork toys cover every shelf: a tin bird, a dancing bear, a little iron bull no bigger than a cat. On the workbench lies a letter, folded and never sent.',
    gm: 'Ilka\'s letter (handout) shows she went to the truce in good faith. The tin bird still works: wound up, it flies to the nearest Order-Engine and sings, a perfect way to distract machines for a round. A secret panel (DC 18 Perception) in the south wall opens on the countermine to the railhead. In a toolbox: an iron flask (empty) and a portable hole.',
  });
  b.hall(69, 43, 70, 43, 1).door(68, 43, 'e').door(70, 43, 'e');
  b.prop('workbench', 74, 42).prop('wall-shelves', 77, 43).prop('display-case', 71, 45).prop('stool', 74, 43).prop('candles', 75, 42).prop('bed', 77, 46);
  b.light(75, 42, 5, 10);

  // the countermine: a secret way from the workshop to the railhead
  b.hall(74, 47, 74, 57, 1).door(74, 46, 's', 'secret');
  b.area('The countermine', [[74, 47, 1, 9]], {
    read: 'A tunnel barely wide enough for one, braced with iron rails. Halfway along, a brass listening-trumpet points at the rock.',
    gm: 'Dug by the Compact to blow up Brazen sappers. It is a quiet back way between the Compact bunker and the railhead.',
    label: [74, 51],
  });
  b.prop('mine-support', 74, 50).prop('lantern-hook', 74, 53);

  // ================= THE RAILHEAD AND THE SILENT BATTERY (south-east) =================
  b.cave('The Railhead', 72, 60, 6, 5, {
    seed: 157, mat: 'stone-cobble',
    read: 'Rails come out of a tunnel choked with fallen rock and end at buffers made of whole tree trunks bound in iron. Crates of shells are stacked to the roof, waiting to be loaded on a train that never came back.',
    gm: 'The Compact\'s supply line once ran from Drask through the mountain to here. The tunnel behind is collapsed for miles. A DC 15 Investigation of the crates finds 2 boxes still sealed: 20 shells (each one, thrown or dropped, works like a 6d6 fire grenade, DC 15 Dexterity save) and a wand of lightning bolts in a paymaster\'s box.',
  });
  b.hall(62, 59, 67, 59, 2);
  b.props_('mine-rails', [[63, 59], [64, 59], [65, 59], [66, 59], [67, 59], [68, 59], [69, 59], [70, 59], [71, 59], [72, 59], [73, 59], [74, 59]]).props_('crate-stack', [[69, 56], [76, 58], [75, 63]]).prop('rubble-pile', 77, 60).prop('cargo-crates', 70, 63).prop('handcart', 73, 57).prop('signpost', 67, 62);
  b.light(72, 61, 10, 20);

  b.tunnel([[71, 64], [71, 68]], 2, { seed: 158 });
  b.cave('The Silent Battery', 71, 71, 6, 4, {
    seed: 159, mat: 'stone-flagstone',
    read: 'Four long guns, each as big as a ship, point at the ceiling. Their crews lie around them in neat rows, as if laid out by someone who cared.',
    gm: 'The Compact\'s heavy guns, silent since the first year: they were meant to bring the mountain down on the Brazen line. Someone did lay the crews out: Ilka, after she died. A DC 17 Arcana check shows the guns could still fire once, at the Oathmother or at the roof. Fired at the roof, they bring down half of no-man\'s land (and anyone in it). A strongbox under the gun-captain holds 3,000 gp in Compact gold marks.',
  });
  b.hall(64, 71, 66, 71, 2);
  b.props_('cannon', [[67, 69], [70, 68], [73, 68], [75, 70]], 0).props_('skeleton-lying', [[68, 72], [70, 73], [72, 73], [74, 72]]).prop('strongbox', 75, 73).prop('barrel-stack', 68, 74);
  b.light(71, 71, 10, 15);

  b.area('South bank', [[56, 63, 9, 13]], {
    read: 'Wrecks lie half in the river: a machine like a giant crab, a gun carriage, a bronze arm reaching out of the water.',
    gm: 'Open ground between the river, the train and the Silent Battery. Nothing lives here but echoes.',
    label: [60, 68],
  });
  b.props_('giant-ribcage', [[58, 66], [61, 72]]).prop('debris-wood', 63, 64).prop('gear-pile', 57, 74);

  // ================= THE HAMMERFALL: the armoured train stalled on the rail bridge =================
  b.floor(52, 57, 5, 1, 'wood-planks-dark').floor(52, 61, 5, 1, 'wood-planks-dark').rubble(54, 57, 2, 1);
  b.area('The rail bridge', [[52, 57, 5, 1], [52, 61, 5, 1]], {
    read: 'A trestle of iron and timber carries the rails over the river, but it has buckled in the middle. The train sits on it, tilted, its middle car hanging out over the water.',
    gm: 'The only way across the river in the south, other than swimming, is through the train itself, or along the narrow, broken edges of the bridge (DC 14 Acrobatics).',
    label: [54, 61],
  });
  b.building('Troop car', 47, 58, 5, 3, {
    mat: 'wood-planks-dark',
    read: 'Benches along both walls, and soldiers in iron-grey sitting on them, shoulder to shoulder, as if the train might start again at any moment. None of them has a face.',
    gm: 'The Hammerfall was the Compact\'s armoured train, shelled on the bridge in the war\'s last week. Its crew never got off. Clockwork troopers fill the benches, and the dead crew haunt it as wraiths and specters.',
    doors: [[47, 59, 'w', 'closed', 'door-iron'], [49, 58, 'n', 'closed', 'door-iron']],
  });
  b.building('Gun car', 52, 58, 5, 3, {
    mat: 'wood-planks-dark',
    read: 'A turret of riveted plate, tilted twenty degrees, hangs out over the black river. Shells roll back and forth on the floor every time the bridge creaks.',
    gm: 'Anyone fighting here is on a slope: DC 12 Dexterity save at the start of each turn or slide into the low (west) wall. The shell rack can be kicked loose into the river, or set off (as a fireball, 8d6, centred on the car).',
    doors: [[51, 59, 'e', 'closed', 'door-iron'], [56, 59, 'e', 'closed', 'door-iron']],
    windows: [[54, 58, 'n'], [54, 60, 's']],
  });
  b.building('Engine of the Hammerfall', 57, 58, 6, 3, {
    mat: 'stone-flagstone-warm',
    read: 'A boiler like a sleeping beast fills the engine cab. A shield-shaped guardian stands at the controls with its hand on the throttle, waiting for a signal to go.',
    gm: 'The engine\'s guardian follows the conductor\'s last order: "No one boards without a ticket." A Compact gear badge counts as a ticket. The boiler is cold, but the cab\'s strongbox holds the paymaster\'s amulet (an amulet of health) and 1,500 gp in Compact marks.',
    doors: [[62, 59, 'e', 'closed', 'door-iron'], [59, 60, 's', 'closed', 'door-iron']],
  });
  b.props_('bench-long', [[48, 58], [48, 60]]).prop('weapon-rack', 50, 60).prop('cannon', 54, 59).prop('barrel-stack', 53, 60).prop('stove', 59, 59).prop('lever', 61, 58).prop('strongbox', 61, 60).prop('lantern-hanging', 49, 59);
  b.light(49, 59, 5, 10).light(59, 59, 5, 10, '#ff9a3c');
  b.encounter('The last run of the Hammerfall', [47, 58, 16, 3], [['shield-guardian', 1], ['clockworkTrooper', 8], ['wraith', 2], ['specter', 4]], 'low');

  // ================= THE MACHINE GRAVEYARD (south) =================
  b.paint(24, 52, 23, 24, 'dirt');
  b.rock(30, 63, 3, 2).rock(38, 56, 2, 3).rock(41, 68, 3, 2);
  b.mud(27, 57, 3, 2).mud(35, 66, 4, 2).rubble(33, 60, 2, 2).rubble(25, 66, 2, 3).rubble(43, 62, 2, 2);
  b.area('Machine graveyard', [[24, 52, 23, 24]], {
    read: 'This was the rail yard where both sides hauled their broken machines. Now it is a valley of dead giants: ribcages of bronze, heads of iron as big as houses, a hand the size of a tavern lying palm-up in the mud. In places the ground has been bored through, in round, glassy holes.',
    gm: 'A quickiron borer came up through here a month ago, cracked the Stillward from below, and found that the dead machines are full of quickiron, which it likes. It surfaces when it feels footsteps: a DC 16 group Stealth check avoids it. Salvage: 1 hour and a DC 15 Investigation finds 2,000 gp of quickiron (heavy: 200 lb) and a working animated shield.',
    label: [33, 58],
  });
  b.props_('mine-rails', [[25, 59], [26, 59], [27, 59], [28, 59], [29, 59], [30, 59], [31, 59], [32, 59], [33, 59], [34, 59], [35, 59], [36, 59], [37, 59], [41, 59], [42, 59], [43, 59], [44, 59], [45, 59], [46, 59]]);
  b.props_('giant-ribcage', [[27, 54], [36, 70]]).prop('statue-tall-knight', 34, 55, 90).prop('statue-tall-winged', 44, 66, 270).props_('column-collapsed', [[29, 68], [40, 63]]).props_('gear-pile', [[31, 56], [43, 72], [26, 62]]).prop('anvil', 35, 63).props_('burning-wreckage', [[37, 61], [28, 72]]).prop('mine-cart', 39, 59).prop('sinkhole', 33, 68).prop('pit-deep', 41, 54).prop('debris-wood', 45, 57).prop('cannon', 30, 61, 120);
  b.light(37, 61, 15, 20, '#ff7a2e').light(28, 72, 10, 20, '#ff7a2e');
  b.encounter('The seal-breaker', [26, 54, 18, 18], [['quickironBorer', 1]], 'low');

  return b.build();
}

export const CLOCKWORK_WAR: Adventure = {
  id: 'clockwork-war',
  title: 'The Kneeling Fortress',
  tagline: 'Under a mountain, two dead nations\' war machines are still fighting, and a general wants the biggest one.',
  levels: '15',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['battlefield', 'constructs', 'high level', 'ghosts', 'tragic'],
  pitch:
    'Three hundred years ago two nations of artificers went to war under the mountain Hollowcrown, with soldiers of stone and bronze and iron. The nations are long gone. The war is not. Two weeks ago, the miners of Pennyrock broke through into a sealed cavern, and heard it: guns, and marching, and the slow tick of a machine as big as a castle. Now the miners are dying, a general of the realm has gone down with two companies and not come back, and the ground under Pennyrock shakes every hour, on the hour.',
  secret:
    'The Brazen Crown of Aumery and the Iron Compact of Drask fought over the quickiron seam under Hollowcrown. Each side\'s machines obey an Order-Engine in its command bunker, and both engines hold the same standing order: "Hold the field until the enemy yields." Neither nation survived to yield. The two Chief Artificers, Isembard Oradel (Brazen) and Ilka Vrell (Compact), met under a white flag to end it, but the only way to lift a standing order is in the Heart of the Oathmother, the walking fortress both nations built together when they were friends, with both Order-Keys turned at once. Before they could, a shell from Gravemaker, the Compact\'s own juggernaut, killed them both. Their apprentices sealed the cavern behind the Stillward and fled. The ghosts went home to their bunkers, each sure the other side broke the truce. A month ago a quickiron borer, a metal-eating wyrm, cracked the seal. Now General Marek Esterhal has come down with a battle-mage, Cyprian Arvanne. He does not want to end the war: he wants the Oathmother. Arvanne is working a ritual to wake her Heart without the keys. When it is done, the general will sit in her Crown, walk her out through Pennyrock and on to Kestrelgate, and make himself king.',
  hooks: [
    'Gisla Coalby, foreman of Pennyrock, begs for help: iron bulls are killing her miners, and the general\'s soldiers are dragging the rest down to dig.',
    'The realm\'s spymaster has noticed General Esterhal took two companies without orders, and a battle-mage with him. She wants to know why, quietly, and will pay 20,000 gp to have him stopped if it is treason.',
    'A sage of the lost artificer nations offers 10,000 gp for an Order-Key, or for proof that the Oathmother exists, and warns that whoever controls her controls the strongest weapon ever built.',
  ],
  tips: [
    'Run the Push: every hour of game time (or after every two scenes) both sides attack across no-man\'s land and Gravemaker walks. The rest of the time the field is quiet enough to cross carefully. Let the players hear it coming: a long whistle, then the guns.',
    'Run the ritual clock: Arvanne needs 6 hours. Mark each hour as it passes. At 6, the Oathmother stands up under the general, and the last fight happens in the Crown while she walks (DC 15 Dexterity save each round or fall prone).',
    'Badges are the key to the field. Brazen machines ignore anyone wearing a sun badge, Compact machines anyone wearing a gear badge, unless attacked. Wearing both makes both sides ignore you. The dead have plenty. Let clever players use this.',
    'The keys: the Heart Warden ignores anyone carrying an Order-Key. Both keys turned together end the war. One key turned makes that side win, and the Oathmother marches on its old enemy, which today means through Pennyrock. Make the choice feel heavy.',
    'Most fights can be skipped, sneaked past, turned or talked down. The shell casing in the White Crater is the heart of the story: once the ghosts see it, they both give in.',
    'The fight in the Heart swings hard. If the heroes carry a key, the Warden fights the general\'s side, not them. If they have none, it fights everyone. Tell the players what the Warden is doing, so they can see the rule.',
  ],
  npcs: [
    {
      id: 'pf_cwrgisla', name: 'Gisla Coalby', title: 'foreman of Pennyrock', kind: 'npc', art: 'dwarf-miner', shared: true,
      wants: 'Her miners back alive, and the hole sealed so it never opens again.', knows: 'The mine, the breach, how many soldiers came down with the general, and that he paid the town council in gold to look away.',
      voice: 'Gravel and short words. Counts her people on her fingers when she is worried.', appearance: 'A broad woman in a leather apron and a helmet with a candle stuck to it, chalk-dust in her eyebrows.',
      backstory: 'Third-generation miner. She was the one who swung the pick that broke through.',
      gmNotes: 'She can read the old letters on the Stillward. She will not go past the camp, but she will wait at the lift and haul anyone up who rings.',
    },
    {
      id: 'pf_cwrleocadia', name: 'Captain Leocadia Faye', title: 'the general\'s last captain', kind: 'npc', art: 'guard-captain', monsterId: 'knight',
      wants: 'To get her soldiers home alive.', knows: 'The general\'s plan, roughly; how many died on the knee; that Arvanne has been "working on the Heart" for days; the badge trick (she worked it out from the dead).',
      voice: 'Clipped and tired. Says "sir" to everyone, then corrects herself.', appearance: 'Tall, mud to the knees, a bandaged arm, a blue coat with the general\'s braid torn off one shoulder.',
      gmNotes: 'Knight stat block. If shown the general\'s orders (handout), she turns on him and gives the heroes her key to the dispatch box and her sword. With her help the camp fight never happens.',
    },
    {
      id: 'pf_cwrmarek', name: 'General Marek Esterhal', title: 'a general who wants a crown', kind: 'npc', art: 'knight', monsterId: 'gladiator', shared: true,
      wants: 'The Oathmother, and the throne at Kestrelgate, which he thinks the realm owes him.', knows: 'The Oathmother walks, steers from the Crown, and that the Warden will not let him past without a key or the ritual.',
      voice: 'Warm and reasonable, like a favourite uncle. Never raises his voice, even when ordering a charge.', appearance: 'Silver hair, a scarred, handsome face, polished armour with not a speck of mud on it.',
      backstory: 'Won the realm\'s last war, was passed over for the council, and has never forgiven it.',
      gmNotes: 'Gladiator stat block. He will try to hire the heroes first: 20,000 gp to kill the Warden "before the thing kills Pennyrock". If he gets a key or the ritual finishes, he runs for the Crown.',
    },
    {
      id: 'pf_cwrcyprian', name: 'Magister Cyprian Arvanne', title: 'the general\'s battle-mage', kind: 'npc', art: 'battle-mage', monsterId: 'archmage',
      wants: 'To be the one who woke the greatest machine ever made. He cares less what it does afterwards.', knows: 'How the Heart works, what both keys do, and that the ritual has a flaw: whoever is in the Crown when it finishes owns her, not whoever paid for it.',
      voice: 'Fast and delighted, always half-talking to himself. Uses long words, then explains them.', appearance: 'Thin, ink-stained, in a coat covered in chalked runes, with brass spectacles pushed up on his head.',
      gmNotes: 'Archmage stat block, with two shield guardians bound to an amulet he wears. He can be turned: show him the Pennyrock dead or Ilka\'s letter and point out what the general will do with her (DC 18 Persuasion). If he stops, the ritual stops.',
    },
    {
      id: 'pf_cwrisembard', name: 'Isembard Oradel', title: 'ghost of the Brazen Crown\'s chief artificer', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'For the Iron Compact to admit what it did, and yield.', knows: 'Everything about the Brazen machines and the Oathmother\'s two keyholes. He does not know who fired the shell.',
      voice: 'Precise and formal, like a man reading a report. Breaks, very rarely, into grief.', appearance: 'A tall, grey ghost in a bronze-buttoned coat with a rising sun stitched on the collar, his chest torn open by shrapnel.',
      backstory: 'He and Ilka were students together before the war. He loved her, and never said.',
      gmNotes: 'Ghost stat block. Possesses a hero who touches the Order-Engine. Shown the shell casing, he gives the Bronze Key and comes to the Heart to see the end.',
    },
    {
      id: 'pf_cwrilka', name: 'Ilka Vrell', title: 'ghost of the Iron Compact\'s forge-mother', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'For the Brazen Crown to answer for the white flag.', knows: 'Everything about the Compact\'s machines, the forge and the countermine. She does not know who fired the shell.',
      voice: 'Low and dry, with a smith\'s bluntness. Taps the table like a hammer when she makes a point.', appearance: 'A short, broad ghost in a scorched apron, hair cropped, iron rings on every finger.',
      backstory: 'She built Gravemaker herself. She named it.',
      gmNotes: 'Ghost stat block. Shown the casing, she understands at once that her own machine killed them both. She gives the Iron Key, and asks the heroes to stop Gravemaker for her.',
    },
    {
      id: 'pf_cwrwarden', name: 'The Heart Warden', title: 'guardian of the Oathmother\'s Heart', kind: 'monster', art: 'ironGolem', monsterId: 'ironGolem',
      wants: 'Nothing. It lets key-bearers pass and kills everyone else.', knows: 'Which of the people in front of it carries a key.',
      voice: 'Silent, except for a deep bell-note inside it when it takes a step.', appearance: 'A giant of black iron with a sun on one shoulder and a gear on the other, its face a smooth, blank plate.',
      gmNotes: 'Iron golem stat block. Wall of force holds it back while Arvanne concentrates. Fire heals it: the Engine hall\'s furnace is next door.',
    },
    {
      id: 'pf_cwrgravemaker', name: 'Gravemaker', title: 'the Iron Compact\'s juggernaut', kind: 'monster', art: 'ironGolem', monsterId: 'gravemaker',
      wants: 'To hold the field.', knows: 'Every square of no-man\'s land.',
      voice: 'A howl of steam before it fires.', appearance: 'A walking siege-gun of black iron on four legs, the number VII painted on its flank, iron bulls running at its feet like dogs.',
      gmNotes: 'Gravemaker stat block (its own). It walks during every Push. A Compact gear badge makes it ignore you. Ilka can stop it with a word if she is brought to it.',
    },
  ],
  handouts: [
    { id: 'pennyrock-plea', title: 'A note on the Pennyrock tally board', text: 'LOWER DRIFT CLOSED.\nBroke into old works on the 3rd. Iron cattle came out. Ashworth and Hemsley turned to stone.\nGeneral\'s men took 8 more down to dig. Council says let them.\nI say we ring the bell three times and seal it.\n— G. Coalby, foreman' },
    { id: 'general-orders', title: 'Orders from the dispatch box', text: 'To my officers. Our purpose is not to secure the danger. Our purpose is the fortress. When the Magister wakes her, I take the Crown. We walk out through the mine and reach Kestrelgate in three days. The council will kneel or be stepped on. Spend the men as you must. Speak of this to no one. — M.E.' },
    { id: 'truce-accord', title: 'The Accord of the White Crater', text: 'We, the last artificers of Aumery and Drask, find that there is no one left to win this war. We will go together to the Heart of our Oathmother and turn our keys as one, and order every machine to rest. Let no one say which side yielded. Both did.\n— Isembard Oradel, for the Brazen Crown\n— Ilka Vrell, for the Iron Compact' },
    { id: 'isembard-log', title: "Isembard's last log", text: 'Day 11,040 of the war. Tomorrow I walk out under the white flag. Ilka has agreed. If she means it, we end this. If she does not, I will at least have seen her again. The Heart needs both keys. I will carry ours myself. Hold the line until I come back.' },
    { id: 'ilka-letter', title: 'A letter never sent', text: 'Isembard, you fool. Of course I will come. I have hated this war longer than I hated you, and I never hated you. Bring your key. I will bring mine. Gravemaker is told to fire on anything in the field, so we walk at the quiet hour. — I.' },
    { id: 'oathmother-plate', title: 'The brass plate in the Knee-Gate', text: 'THE OATHMOTHER\nRaised by the hands of Aumery and of Drask together, to guard the mountain that feeds us both.\nShe answers to the Sun and to the Gear.\nShe will not walk for one against the other.' },
  ],
  chapters: [
    {
      id: 'field', title: 'The Field Under Hollowcrown', level: 15,
      summary: 'One vast cavern holding a war that never ended: two trench lines, two command bunkers with their ghosts, a no-man\'s land of mud and craters, a river with a stalled armoured train, a machine graveyard, a burning forge, the general\'s camp, and in the middle of it all, the walking fortress, kneeling.',
      goal: 'Stop the general from taking the Oathmother, and end the war under the mountain: by bringing both Order-Keys to her Heart, by winning it for one side, or by any other way the heroes find.',
      map: underCrownField,
      npcs: [
        { npc: 'pf_cwrgisla', x: 4, y: 75 },
        { npc: 'pf_cwrleocadia', x: 8, y: 49 },
        { npc: 'pf_cwrisembard', x: 5, y: 27, hidden: true },
        { npc: 'pf_cwrilka', x: 74, y: 35, hidden: true },
        { npc: 'pf_cwrgravemaker', x: 38, y: 32, hidden: true },
        { npc: 'pf_cwrwarden', x: 40, y: 8, hidden: true },
        { npc: 'pf_cwrmarek', x: 39, y: 13, hidden: true },
        { npc: 'pf_cwrcyprian', x: 37, y: 12, hidden: true },
      ],
      scenes: [
        {
          room: 'The lower drift', title: 'Iron bulls in the dark', encounter: 'Iron bulls in the drift', handout: 'pennyrock-plea',
          read: 'The lift cage shudders to a stop. Ahead, two miners stand in the tunnel with their arms up to shield their faces, grey and perfectly still. Behind them, something snorts green smoke and paws the rails.',
          gm: 'Open with action. Gisla shows the tally board on the way down. The gorgons charge at once. Afterwards, a DC 17 search finds the hidden worm tunnel to the graveyard (a quieter way in than the camp).',
        },
        {
          room: 'Expedition camp', title: "The general's camp", encounter: "Faye's company", handout: 'general-orders',
          read: 'Past the cracked seal, a camp of grey tents huddles behind sharpened stakes. A soldier levels a crossbow at you with shaking hands. "Who are you with?" she shouts. "Brass or iron?"',
          gm: 'Captain Faye wants to talk, not fight. She tells what she knows and asks the heroes to fetch the general back. The orders in the dispatch box turn her against him. Freeing the Pennyrock miners from the pen earns Gisla\'s undying thanks. Fighting here costs the heroes their best source of news and a lot of noise (the Brazen trench is warned).',
        },
        {
          room: "No-man's land", title: 'The Push', encounter: 'Gravemaker walks',
          read: 'A long whistle rises from the east, then another from the west. The ground jumps. Out of the dark, lit by its own muzzle-flash, comes something on four iron legs, with iron bulls running at its heels.',
          gm: 'The big set piece of the field. Gravemaker crosses no-man\'s land during the Push. Heroes can hide in a crater (DC 15 group Stealth), race for a trench, wear gear badges, or fight. Shells fall all around (see the Push tip). If Ilka is with them, she can order it to stand down.',
        },
        {
          room: 'The White Crater', title: 'The white flag', encounter: 'The fallen of the wire', handout: 'truce-accord',
          read: 'In the middle of the killing ground, a white rag on a pole still hangs over a crater. As you step to its lip, the mud around it starts to move, and grey hands reach up out of it.',
          gm: 'The truth of the war is here. The wraiths and specters are the dead of both sides, and they fight together against the living. Once they are laid to rest, the heroes can read the Accord and dig out the shell casing (DC 14 Investigation): Compact gear, mark VII. That casing ends both ghosts\' anger.',
          treasure: 'On the two skeletons: Isembard\'s bronze compass (a periapt of wound closure in disguise) and Ilka\'s iron rings (5, worth 250 gp each). The shell casing is worth nothing, and everything.',
        },
        {
          room: 'Brazen war room', title: 'The bronze ghost', encounter: 'The Brazen garrison', handout: 'isembard-log',
          read: 'The little bronze machines on the table creep forward, inch by inch. "You are late," says the man with no body, without looking up. "Report. Has the enemy yielded?"',
          gm: 'Isembard thinks the heroes are reinforcements. Lie and he gives orders; tell the truth and he goes cold. Shown the shell casing, he weeps and gives the Bronze Key. Forced, the garrison of two stone golems and two shield guardians wakes, and Isembard possesses whoever holds the key.',
          treasure: 'From the study: a wand of the war mage +2, a ring of free action, and Isembard\'s log.',
        },
        {
          room: 'Compact war room', title: 'The Forge-Mother', encounter: 'The Compact garrison', handout: 'ilka-letter',
          read: 'The great engine of gears turns, and turns, and turns. The ghost of a woman in a smith\'s apron watches the door behind you. "Did he send you?" she asks. "Did he finally send someone to say sorry?"',
          gm: 'Ilka has waited 300 years for an apology. The shell casing breaks her: her own juggernaut, her own order. She gives the Iron Key and asks the heroes to stop Gravemaker. Forced, three clay golems and the forge spirits wake, and she fights beside them.',
          treasure: 'From the workshop: a portable hole, the singing tin bird, Ilka\'s letter.',
        },
        {
          room: 'The collapsed forge', title: 'The fires that never went out', optional: true, encounter: 'The forge that still burns',
          gm: 'Fire spirits still working the Compact\'s forge. Picking up a hammer and joining in (DC 15 Deception or smith\'s tools) gets you left alone. Under the rubble: the Compact\'s last masterwork.',
          treasure: '+2 plate armour and a hammer of thunderbolts.',
        },
        {
          room: 'Machine graveyard', title: 'The valley of dead giants', optional: true, encounter: 'The seal-breaker',
          read: 'The mud shivers. A dead iron head the size of a house tips over and rolls aside, and the ground beneath it opens like a mouth.',
          gm: 'The quickiron borer that broke the Stillward. Footsteps call it (DC 16 group Stealth to avoid). It can be led into a Push to fight Gravemaker, or lured back down its tunnel with a cart of quickiron.',
          treasure: '2,000 gp of quickiron (200 lb), an animated shield, and in the borer\'s gizzard, a Brazen officer\'s +2 longsword and 1,200 gp of gems.',
        },
        {
          room: 'Troop car', title: 'The last run of the Hammerfall', optional: true, encounter: 'The last run of the Hammerfall',
          read: 'Inside the tilted train, a row of iron soldiers sits shoulder to shoulder. As you step in, every helmet turns to look at you, with a sound like a hundred clocks striking.',
          gm: 'The quickest way across the river in the south. A Compact gear badge counts as a ticket and lets you walk straight through. The gun car slopes (DC 12 Dexterity save each turn).',
          treasure: 'In the engine cab: an amulet of health and 1,500 gp in Compact gold marks.',
        },
        {
          room: 'The Knee-Gate', title: 'Boarding the Oathmother', encounter: 'The knee wardens', handout: 'oathmother-plate',
          read: 'The fortress\'s knee is as big as a gatehouse, and its doors stand ajar. Inside, swords hang in the air, turning slowly, and two iron knights lift their heads.',
          gm: 'Any Order-Key held up makes the wardens stand aside. Otherwise they fight. The plate on the wall tells the heroes what the Oathmother was for. The heroes can also come in by the shell hole, the hand, or Sap Four.',
        },
        {
          room: 'Gun deck', title: 'A battle on the gun deck', encounter: 'Battle on the gun deck',
          read: 'Cannon roar inside the iron hull, and the noise is like being inside a bell. Blue-coated mages are hurling fire at two stone giants who are calmly reloading a gun.',
          gm: 'A three-way fight. The mages will make a deal against the golems; the golems ignore sun-badge wearers. If the mages win, they turn the guns on the Brazen trench, and the whole Brazen line comes over the top.',
        },
        {
          room: 'The Heart of the Oathmother', title: 'The Heart of the Oathmother', encounter: 'The Heart of the Oathmother',
          read: 'The silver Heart pulses, faster now. A thin man with chalk on his sleeves is chanting at it, and a shimmering wall holds back a giant of black iron. Beside him, a silver-haired general turns, and smiles at you like an old friend. "Good," he says. "Help me finish this."',
          gm: 'The climax. The general offers a deal first (20,000 gp and a dukedom). Arvanne can be turned (DC 18 Persuasion with the orders or Ilka\'s letter). The Warden attacks anyone without a key; key-bearers it ignores, so heroes with a key fight beside it. Endings: both keys turned together (an action each, on the same turn): every machine stops. One key: that side wins, and the Oathmother rises. Ritual finished: she rises for whoever reaches the Crown first. If both ghosts were won over, they appear here to turn their keys with the heroes.',
          treasure: 'Arvanne\'s staff of power, the general\'s +3 breastplate and a sending stones pair to his officers, and the war chest he brought to pay the miners: 6,000 gp. The realm\'s spymaster pays 20,000 gp more for proof of treason.',
        },
      ],
      wrapUp:
        'With both keys turned, the Oathmother stands for the first time in three hundred years, walks slowly to the Stillward and kneels in the crack, sealing it with her own body. Every machine under the mountain stops where it stands. The two ghosts take each other\'s hands and fade. If one side won instead, the heroes must race to the Crown to stop her marching on Pennyrock. If the general won, the realm has a new and terrible king, and the heroes have a war of their own to fight.',
    },
  ],
  ending:
    'Win: the war ends, the ghosts rest, the Oathmother becomes the new seal and Pennyrock is safe. The general is dead, captured or exposed; Captain Faye leads the survivors home and testifies. The realm owes the heroes, and the sage would give a great deal to study a stopped machine. Win for one side: the war ends in victory, and an ancient fortress walks the surface obeying a nation that no longer exists, unless the heroes take her Crown and choose where she goes: a power everyone will want. Lose: the general walks the Oathmother out through Pennyrock and on to Kestrelgate, and the realm burns. Next: the quickiron seam is still down there, and now everyone knows it. Other generals, and other nations, will come digging.',
};
