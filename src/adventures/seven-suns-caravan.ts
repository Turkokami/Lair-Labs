// The Caravan of Seven Suns: a three-part desert road mini-campaign for four heroes, levels 2 to 4.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// ---------- little helpers for open desert maps ----------
type Pt = [number, number];

/** Impassable rock in a rough oval: outcrops, mesas, the shoulders of cliffs. */
function crag(b: MapBuilder, cx: number, cy: number, rx: number, ry: number, seed: number, wob = 0.2) {
  const r = rng(seed);
  const k = 2 + Math.floor(r() * 3), p = r() * 6.28, p2 = r() * 6.28;
  for (let y = Math.floor(cy - ry * 1.5); y <= cy + ry * 1.5; y++)
    for (let x = Math.floor(cx - rx * 1.5); x <= cx + rx * 1.5; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const a = Math.atan2(dy, dx);
      const lim = 1 + wob * Math.sin(k * a + p) + wob * 0.5 * Math.sin((k + 3) * a + p2);
      if (dx * dx + dy * dy <= lim * lim) b.rock(x, y, 1, 1);
    }
}

/** Walk a w-by-w brush along a line of points (roads, canyons, canals). */
function brush(pts: Pt[], w: number, f: (x: number, y: number) => void) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= n; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n);
      for (let j = 0; j < w; j++) for (let k = 0; k < w; k++) f(x + k, y + j);
    }
  }
}

/** Distance from a point to a line of points. */
function distTo(px: number, py: number, pts: Pt[]) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
    d = Math.min(d, Math.hypot(px - (ax + vx * t), py - (ay + vy * t)));
  }
  return d;
}

/** Scatter a prop over plain open floor in a rectangle. */
function scatter(b: MapBuilder, kind: string, x: number, y: number, w: number, h: number, n: number, seed: number) {
  const r = rng(seed);
  for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
    const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h);
    if (b.cellAt(px, py) === 1) { b.prop(kind, px, py, Math.floor(r() * 4) * 90); i++; }
  }
}

// ---------- Part 1: Brinkwell and the Hollowstar Waystation ----------
function brinkwell() {
  const b = new MapBuilder('adv-ssc-brinkwell', 'Brinkwell and the Hollowstar Waystation', 80, 64, { open: true, floor: 'sand', ambient: 'dim', wallStyle: 'brick' });
  // ground: green by the river, streets, the caravan road east and the dry wash
  b.paint(0, 0, 17, 30, 'grass');
  b.paint(16, 0, 2, 64, 'dirt');
  b.paint(16, 16, 22, 4, 'stone-cobble');
  b.paint(19, 20, 16, 12, 'stone-cobble');
  brush([[37, 16], [44, 18], [50, 21], [55, 23], [57, 23]], 3, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[38, 38], [44, 44], [50, 50], [53, 56], [53, 62]], 4, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.mud(45, 45, 3, 2).mud(51, 52, 2, 3).mud(53, 59, 2, 2);

  // the river Brink comes down from the hills and dies in the Last Pool
  b.water(6, 0, 5, 17).water(7, 0, 3, 15, true);
  b.pool(9, 21, 6, 4.5, true);
  b.floor(5, 8, 7, 1, 'wood-planks');
  b.prop('bridge-plank', 8, 8, 90);
  b.area('The Last Pool', [[3, 16, 13, 11]], {
    read: 'The river Brink runs out of the hills and simply stops here, in a round green pool fringed with reeds and palms. Past it, the world turns gold and goes on forever.',
    gm: 'Townsfolk water camels here at dawn and dusk. A hero who drinks and listens hears the reeds hiss "it sings, it sings" when the wind turns east (the jar, half a mile away; DC 15 Arcana to sense something bound). The pool is deep in the middle (10 ft).',
    label: [9, 21],
  });
  b.props_('reeds', [[3, 19], [14, 22], [5, 25], [13, 18], [4, 23]]).props_('lily-pads', [[9, 19], [11, 23]]).props_('tree-palm', [[2, 16], [15, 17], [15, 25], [2, 27], [13, 27]]);
  b.area("Diggers' camp", [[0, 1, 6, 13]], {
    read: 'Across the reed bridge, two ragged tents hide under the palms. Shovels, a rope ladder and a smell of old graves.',
    gm: 'Coll and Mesk, two jumpy grave-diggers (commoners), sold Ombrel the jar for 40 gp. They dug it out of the Reedfolk Cliffs, five days out on the Long Glare. They say it hummed all the way home, and a dust storm chased them to the river. DC 12 Persuasion or 5 gp gets the story; DC 15 Insight shows they are scared it will come back. They will draw where the Robbers\' hole is (useful in part 2).',
  });
  b.props_('tent', [[1, 3], [4, 3]]).prop('campfire', 3, 7).prop('pickaxes', 1, 9).prop('sack', 4, 10).prop('rope-coil', 2, 11).props_('tree-palm', [[0, 0], [5, 13], [0, 13]]).prop('beehive', 5, 5).light(3, 7, 10, 15);

  // the caravanserai, where the caravan forms up
  b.building('Brinkwell Caravanserai', 18, 2, 18, 14, {
    mat: 'stone-flagstone-warm',
    read: 'A square of sun-baked brick around a courtyard full of noise: camels complaining, merchants shouting, a big woman with a ladle shouting louder than all of them.',
    gm: 'Auntie Hadda Quince runs the Caravan of Seven Suns from here. She is hiring guards today (handout: the hiring notice). The courtyard well is sweet water; everything else costs.',
    doors: [[26, 15, 's', 'open', 'door-double'], [27, 15, 's', 'open', 'door-double'], [35, 9, 'e', 'closed'], [18, 11, 'w', 'closed']],
    windows: [[18, 7, 'w'], [35, 12, 'e']],
  });
  b.wallRun(18, 5, 18, 's').wallRun(23, 2, 4, 'e').wallRun(29, 2, 4, 'e');
  b.door(20, 5, 's', 'closed').door(26, 5, 's', 'closed').door(32, 5, 's', 'open');
  b.area("Hadda's counting room", [[18, 2, 6, 4]], { gm: 'Ledgers for all seven wagons, a strongbox (DC 15 to pick; 60 gp of wages) and a jar of honey sweets Hadda gives to anyone who makes her laugh.' });
  b.area('Bunkroom', [[24, 2, 6, 4]], { gm: 'Where hired guards sleep the night before departure. Someone has carved "B.B. WAS HERE FIRST" on a bunk: Bastek Brassjaw.' });
  b.area('Camel stalls', [[30, 2, 6, 4]], { gm: 'Thirty camels and one very old one called Marmalade, who bites whoever she decides is her enemy (choose a hero; she is right more often than not).' });
  b.prop('desk', 20, 3).prop('strongbox', 19, 4).prop('chair', 21, 3).prop('scales', 22, 4).props_('bunk-bed', [[25, 3], [27, 3]]).prop('footlocker', 28, 4).props_('hay-bale', [[31, 3], [34, 3]]).prop('water-trough', 33, 4);
  b.prop('well', 27, 10).prop('water-trough', 21, 12).props_('hitching-post', [[22, 8], [32, 8]]).prop('haystack', 33, 13).prop('crate-stack', 19, 13).prop('barrel-group', 34, 7).prop('cauldron-tripod', 24, 12).prop('rug', 29, 12);
  b.light(27, 10, 20, 20).light(20, 3, 5, 10);

  b.building('The Last Shade', 2, 30, 12, 9, {
    mat: 'wood-planks-dark',
    read: 'The last tavern before the desert. Low ceiling, cool clay walls and a hundred names scratched into the bar by people who came back.',
    gm: 'Bastek Brassjaw and his company drink here and grumble that "amateurs" got the Seven Suns job. The notice board holds the hiring notice and a reward poster for the Red Kerchiefs (50 gp for their captain, alive).',
    doors: [[13, 34, 'e', 'closed'], [7, 30, 'n', 'closed']], windows: [[2, 33, 'w'], [10, 38, 's']],
  });
  b.prop('bar-counter', 4, 31).prop('keg-rack', 3, 32).props_('table-round', [[6, 34], [9, 35], [11, 32]]).props_('chair', [[5, 34], [7, 34], [8, 35], [10, 35], [11, 33]]).prop('notice-board', 9, 31).prop('hearth-oven', 12, 37).prop('dartboard', 2, 36).light(7, 34, 15, 20);
  b.encounter('Brawl at the Last Shade', [2, 30, 12, 9], [['thug', 2], ['bandit', 2]], 'low');

  b.area('Spice market', [[19, 20, 16, 12]], {
    read: 'Red, yellow and green powders piled in cones, carpets hung like flags, and a boy on a barrel juggling three stolen lemons.',
    gm: 'Ludo the camel-kid works the crowd. He lifts something small from a hero (DC 14 Perception to notice). Chasing him through the stalls: three DC 12 Acrobatics or Athletics checks. Caught, he grins and offers to work for food. Hadda knows him and hires him as a camel-boy if the heroes speak for him.',
  });
  b.props_('market-stall', [[20, 21], [24, 21], [28, 21], [32, 21], [20, 27], [32, 27]]).props_('produce-stall', [[24, 26], [28, 26]]).props_('herbs-drying', [[22, 24], [30, 24]]).prop('merchant-cart', 26, 30).props_('flour-sacks', [[21, 30], [33, 30]]).prop('barrel', 27, 23).props_('pottery', [[23, 29], [31, 29]]).props_('lamp-post', [[19, 19], [35, 19], [25, 31]]);
  for (const [x, y] of [[19, 19], [35, 19], [25, 31]] as Pt[]) b.light(x, y, 15, 20);

  b.building("Water-seller's house", 26, 33, 7, 5, { gm: 'Old Inessa sells water skins and sells desert sense for free: travel at night, rest in the noon shade, and never open anything that hums.', doors: [[29, 33, 'n', 'closed']] });
  b.props_('water-barrel', [[27, 34], [28, 34], [31, 36]]).prop('shop-counter', 30, 34);
  b.building('Shrine of the Kind Sun', 3, 44, 9, 8, {
    mat: 'marble',
    read: 'A white room, a golden disc over the altar, and a priest asleep in the only patch of shade.',
    gm: 'Sister Aubade, a gentle old priest, blesses caravans for a copper. If woken properly she warns that sand-storms "follow something that was taken". A blessed hero gains 1 Heroic Inspiration on the road.',
    doors: [[11, 47, 'e', 'closed'], [7, 51, 's', 'closed']],
  });
  b.prop('altar', 7, 45).props_('brazier-everburning', [[5, 45], [9, 45]]).props_('prayer-kneeler', [[6, 48], [8, 48]]).prop('offering-bowl', 7, 47).light(7, 46, 15, 20, '#ffe6a0');

  b.area("Brassjaw's tents", [[19, 40, 14, 10]], {
    read: 'Six tents in a perfect line, a banner with a brass jaw on it, and four mercenaries hitting practice dummies much harder than necessary.',
    gm: 'Bastek Brassjaw challenges the heroes to the Trial by Camel: load a camel fastest (DC 13 Animal Handling or Athletics), hit the far target (one ranged attack vs AC 15), and arm-wrestle Bastek (Athletics contest; he has +5). Win two of three and he grudgingly shakes hands and pays a 25 gp wager. Lose and he gloats, but still ends up liking them.',
  });
  b.prop('tent-command', 22, 42).props_('tent', [[27, 42], [30, 46], [20, 44]]).prop('campfire', 25, 46).props_('training-dummy', [[20, 47], [22, 48]]).prop('archery-target', 31, 41).prop('weapon-rack', 28, 44).prop('war-banner', 25, 41).light(25, 46, 10, 15);
  b.building('Saddlery', 19, 54, 9, 6, { gm: 'Saddles, harness and gossip. The saddler saw a woman in grey buy a camel yesterday and ask which wagon carries perfume.', doors: [[23, 54, 'n', 'closed']] });
  b.prop('cobbler-bench', 21, 56).prop('tool-wall', 26, 55).prop('workbench', 24, 58).prop('sawhorse', 21, 58);
  b.building('Old dovecote', 4, 56, 6, 5, {
    gm: 'Ludo\'s secret nest: a straw bed, a cage of tame doves and a stash of shiny things (15 gp of trinkets, and a hero\'s lost item if he took one). If he trusts the heroes, he shows them.',
    doors: [[6, 56, 'n', 'closed']],
  });
  b.props_('cage', [[5, 57], [8, 57]]).prop('straw-bed', 5, 59).prop('trunk', 8, 59);

  // the low mud-brick town wall, with the east gate and the south gate
  b.wallRun(37, 0, 16, 'w').wallRun(37, 20, 18, 'w').wallRun(37, 41, 23, 'w');
  b.props_('lamp-post', [[38, 15], [38, 20]]).light(38, 15, 15, 20).light(38, 20, 15, 20);

  // the forming-up ground outside the east gate: seven painted wagons
  b.area('Forming-up ground', [[38, 1, 12, 14]], {
    read: 'Seven wagons stand in a row, each painted with a sun of a different colour: red, orange, yellow, green, blue, indigo and violet. Bells on the harness, flags on the poles, and somebody already singing.',
    gm: 'The caravan crew: Auntie Hadda (red sun, the kitchen), the carpet twins (orange), Wenlo Darrish and his lamps (yellow), the healer\'s wagon (green), glass and mirrors (blue), Ombrel Fask\'s perfumes (indigo) and a puppet troupe (violet). The marching song (handout) is sung at every departure.',
  });
  b.props_('wagon', [[40, 3], [44, 3], [48, 3], [40, 8], [46, 1], [42, 13]]).prop('wagon', 44, 8, 0).props_('hitching-post', [[39, 6], [47, 6]]).prop('water-trough', 46, 12).prop('hay-bale', 44, 12).prop('campfire', 39, 12).light(39, 12, 10, 15);
  b.area('Indigo Sun wagon', [[43, 7, 3, 3]], {
    gm: 'Ombrel Fask\'s wagon smells of rose, musk and fear. Under a false floor (DC 14 Investigation) sits a clay jar the size of a melon, sealed with black wax and Reedfolk reed-signs. It hums when nobody talks. Ombrel\'s papers (handout: bill of sale) are in his coat.',
    label: [44, 8],
  });

  // the road east through the dunes, past the Camel's Knees
  crag(b, 52, 11, 5, 4.5, 11);
  crag(b, 48, 32, 5, 4, 12);
  crag(b, 66, 4, 6, 3, 13);
  crag(b, 44, 58, 4, 3, 14);
  b.area("Camel's Knees", [[44, 17, 12, 8]], {
    read: 'Two humps of red rock squeeze the road. Up on the rocks, something laughs: a high, yipping laugh that does not sound like a dog.',
    gm: 'Five gnoll scouts of the Cackling Ring watch from the rocks. They test the caravan, not kill it: they want to know which wagon hums. A DC 13 Stealth sends a hero around behind them. If two gnolls fall, the rest flee yipping to tell Grinner.',
    label: [49, 20],
  });
  b.encounter("Gnoll scouts at the Camel's Knees", [44, 14, 14, 14], [['gnoll', 5]], 'moderate');
  b.props_('boulder', [[45, 16], [55, 25]]).prop('signpost', 43, 19).prop('milestone', 50, 24).prop('skull-bleached', 47, 25);
  b.area('Dog Wash', [[40, 40, 15, 20]], {
    read: 'A dry stream-bed snakes south between the dunes, cracked mud at the bottom and dog tracks everywhere.',
    gm: 'A shortcut that avoids the Camel\'s Knees. Five lean dune dogs (wolves) den here. Throwing them a goat haunch from Hadda\'s stores (DC 12 Animal Handling) sends them off squabbling. The wash ends at the cliff under the waystation, where a DC 15 Perception spots a crack with cold air coming out (the secret way into the cistern).',
    label: [47, 47],
  });
  b.encounter('Dune dogs in Dog Wash', [38, 38, 18, 20], [['wolf', 5]], 'low');
  b.props_('bones', [[46, 47], [51, 54]]).prop('bush', 42, 42).prop('thorn-bush', 49, 49).prop('mud-patch', 45, 45);

  // the Hollowstar Waystation: a ruined walled camp on the first night's road
  b.paint(58, 12, 20, 25, 'stone-flagstone-warm');
  b.wallRun(58, 12, 11, 'n').wallRun(71, 12, 7, 'n');
  b.wallRun(58, 12, 11, 'w').wallRun(58, 26, 11, 'w');
  b.wallRun(77, 12, 10, 'e').wallRun(77, 24, 13, 'e');
  b.wallRun(58, 36, 20, 's');
  b.wallRun(58, 17, 9, 's').wallRun(66, 12, 6, 'e');
  b.door(62, 17, 's', 'open', 'door-broken');
  b.wallRun(71, 12, 7, 'w').wallRun(71, 18, 7, 's');
  b.door(71, 15, 'w', 'closed').door(74, 18, 's', 'open', 'door-broken');
  b.wallRun(58, 30, 7, 's').wallRun(69, 30, 5, 's');
  b.door(74, 36, 's', 'closed', 'door-iron');
  b.area('Hollowstar gate', [[55, 22, 5, 5]], {
    read: 'The waystation\'s gate is a gap where gates used to be. Above it, a star of blue tiles still shines on the arch, half of it fallen.',
    gm: 'The only proper way in for wagons. A second way in is the breach in the east wall, and a third is the gap in the north wall by the fallen tower.',
    label: [57, 24],
  });
  b.area('Old common room', [[58, 12, 9, 6]], { gm: 'Where travellers once ate. A cracked hearth, broken benches, and a hidden cupboard (DC 13 Investigation) with an old lantern of everburning blue flame (works as a torch that never goes out).' });
  b.area('Fallen tower', [[71, 12, 7, 7]], { read: 'Half a watchtower, open to the stars, with a ladder to a ledge that is still a good lookout.', gm: 'From the ledge, a hero on watch sees riders with red kerchiefs coming two minutes before they arrive (DC 12 Perception), or sees nothing at all if they fail.' });
  b.area('Waystation courtyard', [[62, 19, 12, 11]], {
    read: 'The caravan circles its wagons inside the old walls. A fire crackles by a dry fountain, the puppet troupe rehearses something ridiculous, and the indigo wagon hums softly in the dark.',
    gm: 'Night one. Hadda\'s stew, stories, and watches to set. Run a quiet hour, then the raid. During the raid, Ludo slips the jar out of the indigo wagon and down the cistern stair. Wenlo has quietly unbarred the cistern grate (DC 14 Insight later: his hands are rust-stained).',
  });
  b.area('Ruined stables', [[58, 31, 20, 5]], { gm: 'Roofless stalls where camels are tied for the night. Tracks in the dust lead from the stables to the cistern grate: small bare feet (Ludo) and soft boots (the woman in grey).' });
  b.rubble(60, 21, 2, 2).rubble(75, 29, 2, 1).rubble(68, 13, 2, 2);
  b.prop('fountain', 67, 24).prop('campfire', 64, 22).props_('wagon', [[69, 27], [72, 21], [63, 27]]).props_('bedroll', [[65, 20], [70, 24], [64, 25]]).prop('column-fallen', 61, 28).prop('pillar-broken', 73, 26);
  b.prop('table-long', 61, 14).prop('broken-furniture', 64, 15).prop('fireplace', 59, 13).prop('cobweb-corner', 65, 12);
  b.prop('rubble-pile', 73, 14).prop('ladder', 76, 13).prop('ceiling-rubble', 72, 17);
  b.props_('hay-bale', [[59, 33], [62, 34]]).prop('water-trough', 66, 34).prop('debris-wood', 70, 33).prop('stairs-down', 74, 35);
  b.light(64, 22, 20, 20).light(67, 24, 5, 10, '#7fb8ff');
  b.encounter('The Red Kerchiefs ride in', [58, 12, 20, 25], [['banditCaptain', 1], ['bandit', 6], ['thug', 1]], 'high');

  // the old cistern under the waystation, with a crack out to Dog Wash
  b.rock(56, 37, 24, 27);
  b.floor(74, 37, 2, 4, 'dungeon-slab');
  b.area('Cistern stair', [[73, 37, 4, 4]], { gm: 'Steep steps, slick with damp. A scrap of grey cloth is caught on the rusty grate.' });
  b.room('Hollowstar cistern', 63, 41, 14, 10, {
    mat: 'dungeon-slab',
    read: 'A cool stone hall under the sand, held up by four pillars, with black water in the middle. On a ledge by the water, a small boy clutches a humming jar, and three robed figures are walking toward him.',
    gm: 'Ludo took the jar because it asked him to: it whispered that it was lonely and wanted to see the sky. A Stillwater agent, the woman in grey (spy), and four cultists have him cornered. They want the jar, not the boy, and will trade him for it. If the heroes talk, Ludo blurts out "It talks! It\'s called Whisk!" The agent carries her orders (handout).',
  });
  b.water(65, 43, 10, 6).water(67, 44, 6, 4, true);
  b.props_('pillar-square', [[64, 42], [75, 42], [64, 49], [75, 49]]).prop('lantern-standing', 70, 42).prop('magic-circle', 69, 49).light(70, 42, 10, 15, '#bcd6ff');
  b.encounter('The woman in grey', [63, 41, 14, 10], [['spy', 1], ['cultist', 4]], 'low');
  b.tunnel([[63, 47], [59, 50], [60, 56]], 2, { seed: 21, mat: 'cave-floor' });
  b.cave('Rat runs', 62, 58, 3.5, 3, { seed: 22, mat: 'cave-floor', gm: 'Rats nest in the cracks. Two swarms and six giant rats boil out at the first light. The crack west ends at a slab that pivots open onto Dog Wash (secret from the outside).' });
  b.floor(56, 58, 2, 1, 'cave-floor').door(55, 58, 'e', 'secret');
  b.encounter('Rats in the runs', [56, 52, 10, 10], [['swarmOfRats', 2], ['giantRat', 6]], 'low');
  b.props_('bones', [[61, 57], [63, 59]]).prop('sack', 60, 59);
  b.tunnel([[74, 50], [76, 53]], 2, { seed: 23, mat: 'cave-floor' });
  b.cave("Ludo's ledge", 77, 56, 2, 3, { seed: 24, mat: 'cave-floor', gm: 'A dry nook where Ludo hid the jar before the agents came. His blanket, a half-eaten date cake, and a drawing in the dust of a happy little cloud.' });
  b.prop('bedroll', 77, 56);

  // the desert itself
  scatter(b, 'sand-ripples', 38, 0, 20, 64, 26, 31);
  scatter(b, 'desert-rocks', 38, 0, 42, 12, 6, 32);
  scatter(b, 'cactus', 38, 24, 20, 40, 7, 33);
  scatter(b, 'skull-bleached', 40, 26, 16, 36, 3, 34);
  scatter(b, 'sand-ripples', 0, 30, 16, 34, 6, 35);
  b.start(25, 17, 3, 2);
  return b.build();
}

// ---------- Part 2: the Long Glare ----------
function longGlare() {
  const b = new MapBuilder('adv-ssc-longglare', "The Long Glare: Jackal's Throat and the Sorrow Wash", 80, 80, { open: true, floor: 'sand', ambient: 'bright', wallStyle: 'stone' });
  const carve = (pts: Pt[], w: number, mat: string) => brush(pts, w, (x, y) => b.floor(x, y, 1, 1, mat));
  // the caravan road along the top
  brush([[0, 2], [30, 3], [55, 2], [79, 3]], 3, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.area('The Long Glare', [[0, 0, 20, 8]], {
    read: 'White sky, white sand, and a road of old stones half buried in both. Ahead, a wall of red rock rises out of the heat: the Anvils. Far behind you, low on the horizon, something brown is growing.',
    gm: 'Three ways on: through Jackal\'s Throat (half a day, gnolls), down into the Sorrow Wash (a day, old riverbed, more water), or round by the Old Caravan Road (a day and a half, heat: DC 12 Constitution save each half day or 1 Exhaustion). The storm behind is the Mother Wind, following the jar. Track it: it arrives at the Reedfolk Cliffs whichever way they go.',
  });
  b.start(2, 2, 3, 3);

  // the Anvils: a great broken mass of red rock
  crag(b, 24, 21, 12, 9, 201);
  crag(b, 43, 19, 12, 10, 202);
  crag(b, 58, 27, 8, 10, 203);
  crag(b, 33, 32, 8, 5, 204);
  crag(b, 47, 33, 7, 6, 216);
  crag(b, 36, 8, 8, 2.5, 219);
  crag(b, 62, 10, 3, 2, 217);
  crag(b, 12, 12, 2.5, 2, 218);
  carve([[20, 5], [23, 11], [29, 16], [35, 20], [44, 25], [50, 31], [54, 38], [57, 44]], 3, 'dirt');
  b.area("Jackal's Throat", [[20, 6, 6, 8], [50, 30, 6, 10]], {
    read: 'The canyon closes over your heads until the sky is a blue ribbon. Every sound comes back twice. Somewhere ahead, someone giggles.',
    gm: 'A narrow, twisting canyon: wagons in single file, camels nervous. Marks scratched on the walls (DC 11 Survival) are gnoll tally-signs counting wagons.',
    label: [22, 9],
  });
  b.cave('The Elbow', 40, 23, 5, 3, {
    seed: 205, mat: 'dirt',
    read: 'The canyon bends hard and widens into a bowl of shadow. Bones are stacked in neat piles along the walls, like a welcome.',
    gm: 'Grinner\'s ambush: eight gnolls and two worgs (hyena-beasts) drop from ledges and close both ends of the bend. Scouts sent ahead (DC 14 Perception) spot fresh dung and spring the trap early. A cask of Ombrel\'s perfume smashed on the rocks makes the gnolls swoon and squabble (they lose their next turn, once). They flee if half fall.',
  });
  b.encounter('Ambush at the Elbow', [34, 18, 14, 10], [['gnoll', 8], ['worg', 2]], 'moderate');
  b.props_('bone-heap', [[37, 22], [43, 24]]).prop('skull-pile', 40, 21).props_('boulder', [[38, 25], [44, 22]]);
  b.cave('The Laughing Den', 36, 12, 6, 3.5, {
    seed: 206, mat: 'dirt',
    read: 'A cave of hide tents and stolen carpets that smells of wet dog and sweet smoke. A big gnoll with a broken grin lounges on a pile of loot.',
    gm: 'Grinner, chief of the Cackling Ring, with five gnolls and a worg. He believes eating a storm-child makes a gnoll a storm. He can be talked round (DC 15 Persuasion or Intimidation): he fears the Mother Wind more than anything, and proof that the jar holds her child (Whisk speaking, or the mural) makes him spit and leave the caravan alone. A goat path climbs from here to the road.',
  });
  carve([[35, 15], [33, 18]], 2, 'dirt');
  carve([[38, 5], [37, 9]], 2, 'dirt');
  b.props_('tent-round', [[33, 11], [39, 11]]).prop('loot-sacks', 36, 13).prop('rug-pelt', 35, 12).prop('cooking-pot-fire', 38, 14).prop('war-banner', 31, 12).prop('cage', 41, 12).light(38, 14, 10, 15);
  b.encounter('The Laughing Den', [30, 8, 13, 9], [['gnoll', 6], ['worg', 1]], 'low');
  b.cave('Lookout ledge', 49, 20, 3, 2, { seed: 207, mat: 'stone-flagstone-warm', gm: 'A gnoll lookout post with a horn. Whoever holds it sees the whole Elbow and the brown wall of the storm coming.' });
  carve([[45, 22], [48, 20]], 2, 'stone-flagstone-warm');
  b.prop('crumbling-ledge', 50, 20).prop('spear-rack', 48, 19);

  // the other two roads
  carve([[72, 4], [74, 18], [73, 32], [70, 44]], 3, 'dirt');
  b.area('Old Caravan Road', [[70, 8, 8, 30]], {
    read: 'The long way round: a road of fitted stones, milestones every mile, and nothing else at all.',
    gm: 'Heat (see the Long Glare). Halfway down, a Reedfolk waymarker shows a boat under seven suns. DC 13 History: the Reedfolk sailed a river here four hundred years ago. A water cache under the third milestone (DC 12 Investigation) holds two skins of water and a potion of healing.',
    label: [74, 20],
  });
  b.props_('milestone', [[73, 10], [74, 20], [72, 30]]).prop('standing-stone', 71, 25).prop('skull-bleached', 75, 36);
  carve([[4, 4], [4, 22], [6, 36], [8, 42]], 3, 'sand');
  b.area('Western Scarp', [[0, 8, 10, 30]], { gm: 'A sandy slope down to the old river. Easy going for wagons. Vultures circle over something in the wash below (the barge wreck).', label: [5, 22] });
  b.props_('cactus', [[2, 14], [8, 28]]).prop('desert-rocks', 7, 18).prop('cairn', 3, 33);

  // the Sorrow Wash: the bed of a river that died four hundred years ago
  const river: Pt[] = [[0, 46], [20, 50], [40, 47], [60, 50], [79, 46]];
  const ramps: Pt[] = [[8, 42], [57, 44], [70, 42], [30, 54], [12, 54], [64, 55]];
  const rr = rng(208);
  for (let y = 34; y < 64; y++)
    for (let x = 0; x < 80; x++) {
      const d = distTo(x + 0.5, y + 0.5, river);
      if (d <= 4.5) {
        b.floor(x, y, 1, 1, 'dirt');
        if (d < 3.5 && rr() < 0.05) b.mud(x, y, 1, 1);
      } else if (d <= 6.5) {
        if (ramps.some(([rx, ry]) => Math.hypot(x - rx, y - ry) < 3.5)) b.floor(x, y, 1, 1, 'sand');
        else b.rock(x, y, 1, 1);
      }
    }
  b.area('Sorrow Wash', [[30, 45, 8, 6], [62, 46, 10, 6]], {
    read: 'You walk down into a dead river. Cracked mud the colour of old bread runs east and west, banked by cliffs of grey clay. Reed-stems four centuries old crunch under your boots like glass.',
    gm: 'The riverbed has shade under the cut-banks, a muddy puddle of water, and old wrecks. Ramps climb out in six places. If the heroes look closely (DC 12 Nature), the river did not dry slowly: it stopped all at once, as if the rain simply never came again.',
    label: [34, 48],
  });
  b.area('The barge wreck', [[10, 44, 9, 8]], {
    read: 'A long river-barge lies on its side in the mud, its painted eye still staring at the sky. Red cloth flutters from its mast.',
    gm: 'Goldie Ashveil and the Red Kerchiefs camp here, sunburned and out of water. If Goldie was captured or killed in part 1, her lieutenant leads. They can fight, but they would rather trade: water for information. Goldie knows the Stillwater Brotherhood hired a dozen knives in Jessamar "for a binding", and that their master is "somebody important with clean hands". She will sell out the Brotherhood for two water skins and a promise.',
  });
  b.prop('ship-mast', 14, 47).prop('rowboat', 11, 49, 45).props_('cargo-crates', [[16, 49], [12, 46]]).prop('sails-pile', 15, 50).prop('rope-coil', 17, 47).prop('anchor', 10, 47).prop('campfire', 13, 50).light(13, 50, 10, 15);
  b.encounter('Red Kerchiefs at the wreck', [8, 42, 12, 10], [['banditCaptain', 1], ['bandit', 4], ['scout', 1]], 'low');
  b.area('The Ribs', [[24, 45, 8, 7]], {
    read: 'Huge white ribs arch out of the riverbed, the bones of some great river beast. Between them, the mud has been dug into neat round holes.',
    gm: 'A giant scorpion lairs under the ribs. It hunts by feeling footsteps: heroes who cross slowly and quietly (DC 13 Stealth for the group) do not wake it. Among the bones lies a dead treasure-hunter with a cloak of protection and 30 gp.',
  });
  b.prop('giant-ribcage', 27, 48).props_('skull-bleached', [[25, 50], [30, 46]]).prop('skeleton-lying', 29, 50).props_('bones', [[24, 47], [31, 49]]);
  b.encounter('The Ribs', [22, 44, 12, 9], [['giantScorpion', 1]], 'low');
  b.pool(46, 48, 3, 2);
  b.area('The last puddle', [[42, 45, 9, 6]], {
    read: 'In the middle of the dead river is one brown puddle, and seven little mud-people sitting around it like old men at a bath.',
    gm: 'Mud mephits. They think the puddle is the last water in the world and guard it jealously. Polite heroes can bargain: the mephits want a song, a compliment, or a cup of real clean water poured into their puddle. Rude heroes get a fight. The mephits remember the river: "The wind-child went into the jar, and the rain went away."',
  });
  b.props_('reeds', [[44, 46], [49, 49]]).prop('puddle', 47, 50).prop('mud-patch', 43, 49);
  b.encounter('Mud mephits at the last puddle', [41, 45, 11, 7], [['mudMephit', 7]], 'low');
  scatter(b, 'quicksand', 50, 44, 20, 8, 3, 209);
  scatter(b, 'skull-bleached', 0, 42, 80, 10, 4, 210);

  // the hardpan and the dead oasis
  b.area('The Hardpan', [[16, 56, 34, 6]], {
    read: 'Flat cracked ground, hard as a floor. Behind you the sky has turned the colour of rust, and a wall of sand taller than a castle is coming, roaring like the sea.',
    gm: 'The Mother Wind arrives. The caravan has 10 minutes (about 5 rounds of hurrying) to reach the cliffs. Each hero makes a DC 12 Strength (Athletics) or Wisdom (Animal Handling) check to keep a wagon moving; each failure costs one wagon\'s goods or one camel. Inside the storm: heavily obscured, 1d4 slashing damage per round in the open.',
    label: [32, 58],
  });
  b.mud(9, 65, 8, 4);
  b.area('Dead oasis', [[5, 61, 16, 12]], {
    read: 'Grey palm trunks with no heads stand around a hollow of dried mud. A cairn of white stones leans beside a well.',
    gm: 'The well is dry, but its stones are carved with the same seven suns as the caravan\'s wagons (Hadda gasps: her grandmother\'s grandmother came from the river). The cairn hides a Reedfolk bronze plaque: "We bound the little wind. Forgive us." A hero who reads it understands the mural in part 2 at once.',
  });
  b.props_('tree-dead', [[7, 63], [17, 64], [8, 70], [18, 70]]).prop('well', 13, 63).prop('cairn', 16, 67).prop('skull-bleached', 11, 71);

  // the Reedfolk Cliffs and their tombs
  for (let x = 44; x < 80; x++) {
    const top = 62 + Math.round(1.3 * Math.sin(x / 2.7));
    b.rock(x, top, 1, 80 - top);
  }
  b.room('Tomb porch', 58, 60, 8, 7, {
    mat: 'stone-flagstone-warm',
    read: 'Four tall pillars carved like bundles of reeds hold up a porch cut into the cliff. Painted boats sail across the lintel, and a heavy stone door stands half open.',
    gm: 'The shelter. Camels and wagons can squeeze into the porch and the hall beyond. This is where Grinner\'s storm-raid hits, if the gnolls are still hunting the jar.',
  });
  b.props_('column-fluted', [[59, 61], [64, 61], [59, 65], [64, 65]]).prop('statue-tall-robed', 61, 60).prop('urn', 63, 63).light(61, 64, 5, 10);
  b.floor(61, 67, 2, 1, 'stone-flagstone-warm').door(61, 67, 's', 'open', 'door-double').door(62, 67, 's', 'open', 'door-double');
  b.room('Hall of the Boatmen', 53, 68, 19, 7, {
    mat: 'stone-flagstone-warm',
    read: 'A long hall of stone boats, each one a tomb, each with a stone boatman asleep at the oar. The storm howls outside like something calling a name.',
    gm: 'The caravan shelters here for the night. The storm will not stop: it is searching. In the dark, Wenlo Darrish shows his hand: he and six cultists hidden among the puppet troupe\'s hired hands, plus two thugs, try to take the jar and slip out by the porch. The Hall is full of camels and frightened people: fighting near them is risky (on a miss by 5 or more, a camel panics).',
  });
  b.props_('sarcophagus-effigy', [[55, 69], [59, 69], [63, 69], [67, 69], [55, 73], [59, 73], [67, 73]]).props_('canoe', [[57, 71], [65, 71]], 90).props_('brazier', [[54, 71], [70, 71]]).prop('wall-alcove-arch', 62, 74).light(54, 71, 10, 15).light(70, 71, 10, 15);
  b.encounter('Wenlo shows his hand', [53, 68, 19, 7], [['spy', 1], ['cultist', 6], ['thug', 2]], 'low');
  b.room("Embalmers' room", 45, 69, 6, 5, { mat: 'stone-flagstone', gm: 'Stone tables, jars of dried herbs, and a hole in the west wall: the Robbers\' hole, where Coll and Mesk dug in. On a shelf: two jars like Whisk\'s, smashed and empty, and a clean ring in the dust where a third once stood.' });
  b.prop('alchemy-table', 47, 70).prop('shelf-jars', 46, 72).prop('burial-slab', 49, 71).prop('pottery', 50, 73);
  b.floor(51, 71, 2, 1, 'stone-flagstone').door(52, 71, 'e', 'closed');
  b.floor(42, 71, 3, 1, 'cave-floor').rubble(43, 71, 1, 1);
  b.area("Robbers' hole", [[41, 69, 4, 5]], { gm: 'A rough tunnel the diggers made into the embalmers\' room. Fresh rope and a broken shovel. A way in or out that avoids the porch.' });
  b.room('Burial chamber', 74, 65, 5, 12, {
    mat: 'dungeon-slab',
    read: 'A narrow chamber with a single stone boat, larger than the others. The boatman in it is not stone. He sits up.',
    gm: 'The Captain of the Reedfolk (mummy) and three skeleton oarsmen. He bound Whisk four centuries ago and has waited to undo it. If a hero shows him the jar and speaks of setting it free (DC 13 Persuasion), he lays down his oar, bows, and crumbles to dust, and the skeletons with him. Otherwise he attacks whoever carries it, thinking them thieves. A chimney at the north end climbs to the cliff top (secret door, DC 15).',
  });
  b.prop('sarcophagus-open', 76, 70).props_('urn', [[75, 66], [77, 75]]).prop('treasure-pile', 77, 72).prop('tomb-niche', 75, 74).light(76, 70, 5, 10, '#9fe0ff');
  b.floor(72, 71, 2, 1, 'dungeon-slab').door(73, 71, 'e', 'closed', 'door-iron');
  b.encounter('Sleepers of the burial chamber', [74, 65, 5, 12], [['mummy', 1], ['skeleton', 3]], 'moderate');
  b.floor(76, 61, 1, 4, 'cave-floor').door(76, 64, 's', 'secret');
  b.area('The chimney', [[75, 60, 3, 5]], { gm: 'A crack in the rock with hand-holds cut by the Reedfolk. Climb out (DC 10 Athletics) to the cliff top above the porch: a perfect spot to drop on gnolls attacking the door.' });
  b.room('Painted shrine', 57, 76, 10, 3, {
    mat: 'marble',
    read: 'A long, low room, every inch painted: a green river, boats, fields, and over everything a great wind with a small wind tucked under its arm.',
    gm: 'Behind a secret door in the hall (DC 14 Perception, or Whisk hums louder near it). The mural (handout) tells the truth: the Reedfolk bound the little wind to stop the storms, and the rain stopped with them. Here, alone with the heroes, Whisk speaks clearly for the first time and asks to go home.',
  });
  b.floor(62, 75, 1, 1, 'stone-flagstone-warm').door(62, 75, 's', 'secret');
  b.prop('altar-reredos', 62, 77).props_('candle-stand-tall', [[58, 77], [66, 77]]).prop('offering-bowl', 60, 77).prop('idol', 64, 77).light(62, 77, 10, 15, '#ffd98a');
  b.encounter("Grinner's storm-raid", [50, 56, 24, 11], [['gnoll', 10], ['worg', 3]], 'high');

  // any pocket of ground the rocks sealed off becomes rock too (this map has doors but no walls)
  const seen = new Set<number>([2 * 80 + 2]);
  const todo: Pt[] = [[2, 2]];
  while (todo.length) {
    const [x, y] = todo.pop()!;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as Pt[])
      if (b.isFloor(nx, ny) && !seen.has(ny * 80 + nx)) { seen.add(ny * 80 + nx); todo.push([nx, ny]); }
  }
  for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) if (b.isFloor(x, y) && !seen.has(y * 80 + x)) b.rock(x, y, 1, 1);
  scatter(b, 'sand-ripples', 0, 8, 80, 26, 14, 211);
  scatter(b, 'sand-ripples', 0, 55, 44, 25, 12, 212);
  scatter(b, 'desert-rocks', 16, 56, 40, 6, 5, 213);
  scatter(b, 'cactus', 0, 56, 44, 24, 6, 214);
  scatter(b, 'boulder', 60, 8, 20, 30, 4, 215);
  return b.build();
}

// ---------- Part 3: Jessamar, the Garden City ----------
function jessamar() {
  const b = new MapBuilder('adv-ssc-jessamar', 'Jessamar, the Garden City', 80, 80, { open: true, floor: 'sand', ambient: 'dim', wallStyle: 'stone' });
  // ground
  b.paint(16, 0, 64, 80, 'dirt');
  b.paint(58, 8, 22, 59, 'stone-flagstone');
  b.paint(59, 30, 20, 24, 'grass');
  b.paint(36, 32, 22, 24, 'grass');
  brush([[0, 38], [15, 38]], 4, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.paint(16, 38, 24, 4, 'stone-cobble');
  b.paint(17, 43, 20, 12, 'stone-cobble');
  b.paint(28, 0, 2, 38, 'stone-cobble');
  brush([[38, 37], [45, 34], [52, 31], [57, 30]], 2, (x, y) => b.paint(x, y, 1, 1, 'stone-cobble'));

  // the city wall, the Sunrise Gate and the culvert
  b.rock(14, 0, 2, 80).floor(14, 38, 2, 4, 'stone-cobble');
  b.rock(11, 34, 3, 3).rock(11, 42, 3, 3);
  for (let y = 38; y <= 41; y++) b.door(14, y, 'w', 'open', 'portcullis');

  // water: the Great Oasis, the canal to the culvert and the rill into the palace garden
  b.pool(46, 44, 9, 7, true);
  brush([[40, 50], [34, 55], [26, 59], [16, 62], [0, 62]], 2, (x, y) => b.water(x, y, 1, 1));
  brush([[55, 44], [66, 44]], 2, (x, y) => b.water(x, y, 1, 1));
  b.door(14, 62, 'w', 'locked', 'door-iron').door(14, 63, 'w', 'locked', 'door-iron');
  b.floor(44, 43, 4, 3, 'marble').floor(38, 44, 6, 1, 'wood-planks');
  b.floor(24, 56, 3, 6, 'wood-planks').floor(30, 55, 2, 4, 'wood-planks').floor(62, 44, 2, 2, 'wood-planks');

  // outside the walls
  b.area('Caravan field', [[0, 26, 11, 24]], {
    read: 'At sunset the Seven Suns roll onto a field of trampled grass under the walls of Jessamar. Green palms nod over white walls, and the smell of oranges drifts out of the gate. Behind you, the horizon is brown and growing.',
    gm: 'The caravan camps here. Ombrel must deliver the jar to the Keeper of Fountains at the palace by tomorrow noon; the Mother Wind will reach the city tomorrow night. Hadda wants the heroes to "do right by the little one" and promises to back whatever they choose.',
    label: [5, 30],
  });
  b.props_('wagon', [[2, 27], [6, 27], [2, 33], [6, 45], [2, 47]]).props_('tent', [[8, 30], [3, 40]]).prop('tent-bell', 7, 48).prop('campfire', 5, 36).props_('hitching-post', [[9, 27], [9, 46]]).prop('water-trough', 1, 43).props_('tree-palm', [[0, 25], [10, 25], [0, 52], [10, 52]]).light(5, 36, 20, 20);
  b.area('Sunrise Gate', [[11, 37, 6, 6]], {
    read: 'The great gate stands open under a sun of beaten copper. Guards in orange sashes check every wagon, and one of them is reading a list.',
    gm: 'Gate Captain Sefu (veteran) has orders from the Keeper: "Any wagon with an indigo sun comes straight to the palace, under guard." He is honest and bored. Showing him the hiring papers and a good story (DC 13 Persuasion), or a 20 gp "garden tax", lets the heroes in without an escort. Forcing it means a fight, and the whole city hears. The culvert grate by the canal (locked, DC 15 to pick or DC 18 Strength) is a quiet way in.',
    label: [14, 39],
  });
  b.props_('torch-standing', [[13, 37], [12, 41]]).props_('weapon-rack', [[16, 37], [16, 42]]).prop('banner-pole', 12, 40);
  b.light(13, 37, 15, 20).light(12, 41, 15, 20);
  b.encounter('Trouble at the Sunrise Gate', [9, 34, 10, 12], [['guard', 6], ['veteran', 1]], 'low');
  b.prop('sewer-outflow', 12, 62);

  // the city: Avenue of Lamps and the Lantern quarter
  b.area('Avenue of Lamps', [[16, 38, 24, 4]], { gm: 'The main street from the gate to the oasis. Lamps every ten paces, lit at dusk by a boy with a long pole. Busy until midnight.', label: [27, 39] });
  for (const x of [18, 24, 30, 36]) { b.prop('lamp-post', x, 38).light(x, 38, 15, 20); }
  b.building('The Blue Lantern teahouse', 18, 28, 9, 8, {
    mat: 'wood-planks',
    read: 'Blue lanterns, cushions on the floor, and mint tea poured from very high up. Everyone in Jessamar comes here to gossip.',
    gm: 'A safe place. The owner, a cheerful widow, knows that the Keeper of Fountains has had the palace windcatcher "repaired" with strange silver bands, and that the Palm Mother is old and choosing an heir this month. The Keeper wants to be that heir.',
    doors: [[22, 35, 's', 'closed']], windows: [[18, 31, 'w'], [26, 31, 'e']],
  });
  b.props_('table-round', [[20, 30], [24, 30], [22, 33]]).props_('rug-round', [[20, 32], [24, 33]]).prop('bar-counter', 25, 29).props_('lantern-hanging', [[20, 29], [24, 32]]).light(22, 31, 15, 20, '#8fc6ff');
  b.building('House of Ledgers', 31, 26, 8, 9, {
    mat: 'wood-planks-dark',
    gm: 'The city\'s counting house. A clerk can confirm the Keeper drew 3,000 gp from the palace treasury "for the windcatcher", twice the price he promised Ombrel. Records are behind a locked back door (DC 14).',
    doors: [[34, 34, 's', 'closed'], [38, 30, 'e', 'locked']],
  });
  b.props_('desk', [[33, 28], [36, 28]]).prop('map-cabinet', 32, 32).prop('strongbox', 37, 32).prop('bookshelf', 32, 27);
  b.area("Dyers' yard", [[17, 6, 10, 10]], { read: 'Vats of red, saffron and indigo steam in the open air, and cloth hangs everywhere like flags of a hundred countries.', gm: 'A place to lose pursuers (advantage on Stealth checks to hide among the hanging cloth).' });
  b.props_('cauldron-tripod', [[19, 8], [22, 8], [25, 8]]).props_('loom', [[19, 12], [23, 13]]).props_('water-barrel', [[26, 12], [18, 14]]).prop('herbs-drying', 21, 10);
  b.building('Stillwater safehouse', 33, 8, 8, 8, {
    mat: 'stone-flagstone',
    read: 'A chandler\'s warehouse with every shutter nailed closed. Inside, the air is perfectly still. Not a candle flickers.',
    gm: 'The Stillwater Brotherhood\'s hideout. The knives from the bridge come from here. Empty if the heroes beat them; otherwise two cultists sit praying in silence. A chest holds 120 gp of the Keeper\'s pay and a list of names in the Keeper\'s own hand (enough to convince the Palm Mother).',
    doors: [[36, 15, 's', 'closed'], [40, 11, 'e', 'locked']],
  });
  b.props_('crate-stack', [[34, 9], [39, 9]]).prop('chest', 39, 14).prop('magic-circle', 36, 11).props_('candles', [[35, 12], [38, 12]]).prop('bench-long', 34, 14);

  // the bazaar and the canal
  b.area('Bazaar of Jessamar', [[17, 43, 20, 12]], {
    read: 'Silk, figs, brass, birds in cages, and a thousand voices haggling. A juggler throws knives. A man sells jars "exactly like the famous one".',
    gm: 'Word of the singing jar has spread: fake jars are on sale (Goldie Ashveil is selling them, if she lived). The Stillwater knives follow the heroes through here and strike at the Weavers\' Bridge.',
  });
  b.props_('market-stall', [[18, 44], [22, 44], [26, 44], [30, 44], [34, 44], [18, 49], [34, 49]]).props_('produce-stall', [[22, 48], [28, 48]]).props_('rug', [[25, 51], [31, 52]]).prop('merchant-cart', 20, 52).props_('cage', [[29, 45], [33, 47]]).props_('pottery', [[24, 46], [32, 51]]).prop('fish-crate', 19, 47).prop('tent-bell', 27, 50);
  b.area("Weavers' Bridge", [[22, 55, 7, 8]], {
    read: 'A humpbacked wooden bridge over the green canal, hung with drying carpets. Halfway across, the crowd thins, and the people behind you are not shoppers.',
    gm: 'The ambush: Brother Halloway (cult fanatic), six hired thugs, six cultists and a Stillwater spy. They want the jar and will cut down carpets to trap the heroes on the bridge. A hero knocked into the canal is fine but loses a turn. Townsfolk scatter and the city watch arrives in 5 rounds.',
    label: [25, 58],
  });
  b.encounter("Knives on the Weavers' Bridge", [17, 50, 20, 13], [['cultFanatic', 1], ['thug', 6], ['cultist', 6], ['spy', 1]], 'moderate');
  b.building('Bathhouse', 30, 66, 10, 8, { mat: 'marble', gm: 'Hot pools and gossip. Palace servants bathe here after work; one of them can be talked into lending a kitchen apron and the servants\' gate password ("figs and honey").', doors: [[34, 66, 'n', 'closed']] });
  b.water(32, 68, 6, 4);
  b.prop('steam-vent', 31, 72).props_('bench', [[38, 67], [38, 72]]).light(35, 70, 10, 15);
  b.building("Potter's kiln", 19, 66, 8, 7, { gm: 'A potter who makes jars for perfume. She can make a copy of Whisk\'s jar overnight for 10 gp: a decoy.', doors: [[22, 66, 'n', 'closed']] });
  b.prop('forge', 20, 68).props_('pottery', [[24, 67], [25, 70]]).prop('workbench', 22, 71).light(20, 68, 10, 15);

  // the Great Oasis
  b.area('Great Oasis', [[37, 37, 19, 15]], {
    read: 'The heart of the city: a wide blue pool ringed with palms, its water so clear you can see the white sand at the bottom, and the long shapes lying on it.',
    gm: 'Six sacred crocodiles live in the pool. Nobody may harm them. They attack anyone who swims (or falls in). A hero who feeds them (DC 12 Animal Handling with meat) can cross safely. The bridge leads to the Isle of the First Palm.',
    label: [40, 40],
  });
  b.encounter('Sacred crocodiles', [37, 37, 19, 15], [['crocodile', 6]], 'low');
  b.area('Isle of the First Palm', [[44, 43, 4, 3]], { gm: 'The oldest palm in Jessamar and a shrine to the wind. The shrine keeper says: "The winds were children once. All rain is a wind keeping a promise." Offerings here: 3 gp, a wind-chime.', label: [45, 44] });
  b.prop('tree-palm', 45, 43).prop('shrine', 46, 44).prop('offering-bowl', 44, 45);
  b.props_('tree-palm', [[36, 36], [41, 34], [50, 34], [56, 38], [56, 50], [50, 54], [40, 54], [36, 51]]).props_('lily-pads', [[42, 47], [50, 41]]).props_('reeds', [[38, 48], [53, 47]]);
  b.area('Old Well garden', [[40, 56, 16, 10]], {
    gm: 'A quiet garden around a very old well. Children say a ghost lives down there. A ladder inside the well (DC 14 Perception to notice the rungs are new) leads to the palace undercroft: the Keeper\'s private way out of the palace.',
  });
  b.prop('well', 47, 64).props_('bench', [[43, 59], [52, 59]]).props_('tree-palm', [[41, 57], [54, 57]]).prop('flowers', 47, 60).light(47, 64, 5, 10);

  // the palace of the Palm Mother
  b.wallRun(58, 8, 59, 'w').wallRun(58, 8, 22, 'n').wallRun(58, 66, 22, 's');
  b.door(58, 30, 'w', 'closed', 'door-double').door(58, 31, 'w', 'closed', 'door-double');
  b.door(58, 44, 'w', 'locked', 'door-iron').door(58, 45, 'w', 'locked', 'door-iron');
  b.door(58, 62, 'w', 'closed');
  b.area('Palace gate', [[55, 28, 6, 6]], { gm: 'Two guards in green. With an audience (the Palm Mother sends for the caravan if Hadda asks), the heroes walk in. Otherwise: the servants\' gate, the water-gate on the rill (locked), or the well.', label: [56, 30] });
  b.building('Palace guardroom', 59, 23, 7, 6, { gm: 'Off-duty guards dice here. A key ring on the wall opens the water-gate and the Windcatcher.', doors: [[62, 28, 's', 'closed']] });
  b.props_('bunk-bed', [[60, 24], [64, 24]]).prop('table-cards', 62, 26).prop('key-ring', 65, 25);
  b.building('Hall of Nine Fountains', 61, 10, 12, 12, {
    mat: 'marble',
    read: 'Nine fountains splash in a hall of white marble. Seven of them are dry. On a low throne of palm wood sits a tiny old woman wrapped in green, eating a date, watching you with very sharp eyes.',
    gm: 'The Palm Mother Zerafine holds audience. The Keeper stands at her side. She asks the heroes to tell the story of the road. If they accuse the Keeper with proof (his letter, the safehouse list, Goldie\'s word, or Whisk speaking), the Keeper bolts for the Windcatcher. Without proof, she listens (DC 15 Persuasion) but lets the Keeper take the jar "for safekeeping until morning".',
    doors: [[66, 21, 's', 'closed', 'door-double'], [67, 21, 's', 'closed', 'door-double'], [72, 14, 'e', 'closed']],
  });
  b.prop('throne-dais', 66, 11).props_('fountain', [[63, 13], [70, 13], [63, 18], [70, 18]]).props_('column-fluted', [[62, 11], [71, 11], [62, 20], [71, 20]]).prop('rug-runner', 66, 16, 90).props_('banner-hanging-tall', [[64, 10], [69, 10]]).prop('chandelier-great', 66, 15).light(66, 14, 20, 20);
  b.building("Keeper's apartments", 73, 10, 7, 10, { mat: 'wood-planks-dark', doors: [[76, 19, 's', 'locked']] });
  b.wallRun(73, 14, 7, 's').door(76, 14, 's', 'closed');
  b.area("Keeper's bedchamber", [[73, 10, 7, 5]], { gm: 'A neat, cold room. The bed has never been slept in. A wind-chime hangs over the door with its clapper tied silent.' });
  b.area("Keeper's study", [[73, 15, 7, 5]], {
    read: 'Every paper squared to the edge of the desk. A model of the windcatcher, wrapped in silver wire. A cage with a dead songbird that was never fed.',
    gm: 'The Keeper\'s letter (handout) is in the desk (locked, DC 14). It proves he means to bind the spirit, command the storms and close the Long Glare to every caravan that does not pay him. Also: 200 gp, a bag of holding, a spell scroll of Gust of Wind.',
  });
  b.prop('bed-canopy', 77, 11).prop('wardrobe', 74, 11).prop('writing-desk', 75, 16).prop('cage', 78, 17).prop('globe-stand', 74, 18).prop('scroll-rack', 78, 15).light(75, 16, 5, 10);
  b.area('Palm Garden', [[59, 30, 20, 24]], {
    read: 'Palms in neat rows, hedges cut into the shapes of camels and boats, and a silver rill running through it all to a great fountain. At the far end rises the Windcatcher: a square tower with tall slotted vents, wrapped in bands of silver.',
    gm: 'Patrolled by eight palace guards and their captain (veteran). They are not villains: show them the Palm Mother\'s favour or the Keeper\'s letter and they step aside. Hedges give half cover everywhere.',
    label: [68, 38],
  });
  b.encounter('The garden watch', [59, 30, 20, 24], [['guard', 8], ['veteran', 1]], 'low');
  b.props_('tree-palm', [[60, 32], [60, 38], [60, 50], [77, 32], [77, 38], [77, 50]]).props_('hedge-long', [[63, 35], [74, 35], [63, 50], [74, 50]]).props_('hedge', [[66, 47], [71, 47]]).prop('fountain-grand', 69, 44).props_('flowers', [[62, 41], [75, 41], [68, 52]]).props_('bench', [[65, 40], [73, 40]]).props_('lamp-post', [[64, 32], [74, 32], [64, 52], [74, 52]]);
  for (const [x, y] of [[64, 32], [74, 32], [64, 52], [74, 52]] as Pt[]) b.light(x, y, 15, 20);
  b.area('Garden pavilion', [[66, 34, 6, 5]], { gm: 'A shaded pavilion where the Palm Mother takes her tea. Whisk, if freed in the garden, plays in the palms here before it leaves, and every fountain in the city sputters back to life for a minute.' });
  b.prop('table-round', 68, 36).props_('chair', [[67, 36], [69, 36]]).prop('rug-round', 68, 37);
  b.building('Palace kitchens', 59, 56, 8, 9, { gm: 'Busy, hot and loud. Anyone in an apron with a tray is invisible here. The cooks hate the Keeper: he cut their spice budget to pay for silver.', doors: [[59, 62, 'w', 'closed'], [63, 56, 'n', 'closed']] });
  b.prop('hearth-oven', 60, 57).prop('pot-rack', 62, 57).prop('butcher-block', 64, 59).prop('bread-rack', 65, 62).prop('table-long', 61, 61).light(60, 57, 10, 15);
  b.building('Windcatcher', 68, 57, 10, 10, {
    mat: 'stone-flagstone',
    read: 'Inside the tower, the air is dead still. Silver bands wind up the walls to the vents high above, where the evening wind cannot get in. In the middle of the floor, a circle of silver is ready, and a thin man in white raises the jar.',
    gm: 'The finale. Ozias Thrane, the Keeper of Fountains (cult fanatic), his hired captain (veteran), four thugs, six cultists and, if he lived, Wenlo (spy). The binding takes 3 rounds of chanting: on the third, Whisk is sealed into the tower forever and the Mother Wind comes down on the city. Ways to win: break the circle (a bowl of water, sand or blood poured on it, as an action), smash two of the four silver bands (AC 15, 10 HP each), get the jar to the top of the stair and open it to the sky, or take Ozias down.',
    doors: [[72, 57, 'n', 'closed', 'door-double'], [73, 57, 'n', 'closed', 'door-double']],
  });
  b.prop('summoning-circle', 72, 61).props_('brazier-pedestal', [[69, 58], [76, 58], [69, 65], [76, 65]]).prop('stair-spiral', 76, 61).prop('orb-pedestal', 72, 59).props_('chains-hanging', [[70, 63], [75, 63]]).light(72, 61, 10, 20, '#d9f0ff');
  b.encounter('The binding at the Windcatcher', [68, 57, 10, 10], [['cultFanatic', 1], ['veteran', 1], ['thug', 4], ['cultist', 6], ['spy', 1]], 'high');
  b.encounter('The Mother Wind comes down', [59, 30, 20, 24], [['airElemental', 1]], 'high');

  // the undercroft under the palace, reached from the well and from the Windcatcher
  b.rock(46, 67, 34, 13);
  b.floor(48, 67, 1, 4, 'cave-floor').floor(48, 70, 12, 2, 'cave-floor');
  b.door(48, 66, 's', 'secret');
  b.room('Undercroft cistern', 60, 69, 16, 9, {
    mat: 'dungeon-slab',
    read: 'Arches march away over black water. The drip of the cistern echoes like a slow clock. Something pale is sliding down a pillar.',
    gm: 'The palace water store, low and failing. Two gray oozes cling to the pillars and a giant constrictor snake hunts in the channel. Steps at the east end climb to a secret door into the base of the Windcatcher (opens easily from below). The way to reach the binding by surprise.',
  });
  b.water(61, 72, 14, 3).water(63, 73, 10, 1, true);
  b.props_('pillar-square', [[62, 70], [67, 70], [72, 70], [62, 76], [67, 76], [72, 76]]).prop('stairs-up', 73, 70).props_('barrel', [[74, 76], [61, 76]]).light(73, 70, 5, 10);
  b.floor(72, 67, 2, 2, 'dungeon-slab').door(72, 66, 's', 'secret');
  b.floor(53, 72, 2, 2, 'cave-floor');
  b.cave('Ooze sump', 53, 75, 4, 2.5, { seed: 301, mat: 'cave-floor', gm: 'Where the gray oozes breed. Under the slime: the bones of a palace servant who saw the Keeper use the well, and her purse (35 gp, a silver locket).' });
  b.props_('green-slime', [[52, 75], [55, 76]]).prop('skeleton-lying', 54, 75);
  b.encounter('Things in the undercroft', [47, 67, 30, 12], [['grayOoze', 2], ['giantConstrictorSnake', 1]], 'low');

  scatter(b, 'sand-ripples', 0, 0, 13, 26, 6, 302);
  scatter(b, 'sand-ripples', 0, 52, 13, 28, 5, 303);
  scatter(b, 'cactus', 0, 0, 13, 80, 4, 304);
  scatter(b, 'barrel', 17, 16, 10, 20, 3, 305);
  scatter(b, 'crate', 40, 12, 16, 18, 4, 306);
  scatter(b, 'tree-palm', 40, 0, 18, 30, 6, 307);
  b.start(3, 37, 3, 3);
  return b.build();
}

export const SEVEN_SUNS_CARAVAN: Adventure = {
  id: 'seven-suns-caravan',
  title: 'The Caravan of Seven Suns',
  tagline: 'Guard a painted caravan across the deep desert, and decide the fate of the singing jar that every bandit, cultist and gnoll on the road wants.',
  levels: '2-4',
  sessions: '3-5 sessions',
  players: '3-5 players',
  tags: ['road trip', 'desert', 'caravan', 'mystery', 'choices'],
  pitch:
    'Seven wagons, seven painted suns, thirty camels and one very loud caravan mistress. The Caravan of Seven Suns crosses the Long Glare every spring, nineteen days of sand from the river town of Brinkwell to Jessamar, the Garden City. This year Auntie Hadda needs new guards, and she pays in gold, shade and stew. It should be an easy job. Then again, one of the wagons hums at night.',
  secret:
    'Four hundred years ago the Reedfolk, river people of the Sorrow Wash, caught a young wind spirit and sealed it in a clay jar to stop the storms that flattened their fields. But the storms were also the rain. The river died, the Reedfolk with it, and the jar slept in their cliff tombs. Two months ago grave-diggers dug it up and sold it to Ombrel Fask, a perfume merchant, who carries it for a buyer: Ozias Thrane, the Keeper of Fountains of Jessamar. Ozias secretly leads the Stillwater Brotherhood, a cult that worships still air and wants every wind bound. His plan: bind the spirit into the palace windcatcher. Whoever holds it can command its mother, the great storm of the Long Glare, and close the road to any caravan that will not pay him. With the Palm Mother choosing her heir this month, a Keeper who makes the fountains run and holds the storms on a leash will be named. Meanwhile the Mother Wind is searching for her child, and every sandstorm on the road follows the jar.',
  hooks: [
    'Auntie Hadda Quince is hiring guards for the Caravan of Seven Suns: 2 gp a day each, water and stew, and a 50 gp bonus at journey\'s end.',
    'A hero owes Hadda a debt (she fed them through a bad winter), and she calls it in: "Get my wagons across, and we\'re square."',
    'Sister Aubade of the Shrine of the Kind Sun has dreamed of a crying wind, and asks the heroes to travel with the caravan and find out why.',
  ],
  tips: [
    'This is a road story. Let the caravan crew be a family: give each wagon a face, a joke and a moment. Players should care when a wagon is lost in the storm.',
    'Keep a Storm track from 0 to 6. It goes up one each day on the road and each time the jar is opened even a crack. At 4 the storm catches the caravan (part 2); at 6 the Mother Wind comes down wherever the jar is.',
    'Almost every fight can be talked out of: Goldie wants water and a way out, Grinner fears the Mother Wind, the mud mephits want manners, the Reedfolk Captain wants the jar set free, the palace guards want orders. Reward clever talk as much as good swords.',
    'Whisk, the spirit in the jar, speaks only to Ludo at first, then to the heroes in the painted shrine. Play Whisk as a curious, lonely child. Never make the choice for the players.',
    'The real choice comes in part 3: hand the jar to the Keeper (gold, and a terrible cost), give it to the Palm Mother (she will ask their advice), or set Whisk free (the storms end, but Ombrel loses his fortune unless the heroes fix that too).',
    'Level up between parts: level 3 for the Long Glare, level 4 for Jessamar.',
  ],
  npcs: [
    {
      id: 'pf_sschadda', name: 'Hadda Quince', title: 'Auntie Hadda, mistress of the Seven Suns', kind: 'npc', art: 'merchant', shared: true,
      wants: 'Every wagon and every soul across the Long Glare, fed, paid and arguing.', knows: 'Every well, every bandit name and every short cut on the road, and that her family came from the Sorrow Wash long ago.',
      voice: 'A big warm shout. Calls everyone "my duck". Bangs her ladle on things to make a point.', appearance: 'A broad woman in a red sun-painted apron, grey braids tied up with copper bells, a ladle always in her belt.',
      backstory: 'Runs the caravan her grandmother founded. Adopts strays: half the crew were orphans or runaways.',
      gmNotes: 'Use her to hand out hooks, food and courage. She backs whatever choice the heroes make about the jar, and is furious at Ombrel for not telling her what he was carrying.',
    },
    {
      id: 'pf_sscombrel', name: 'Ombrel Fask', title: 'perfume merchant of the Indigo Sun', kind: 'npc', art: 'noble', shared: true,
      wants: 'The 1,500 gp the Keeper promised: enough to pay his debts and never travel again.', knows: 'That the jar came from grave-diggers, that the Keeper wants it unopened, and nothing at all about what is inside (he does not want to know).',
      voice: 'Fast and fussy, apologises constantly, sneezes when nervous.', appearance: 'A plump little man in indigo silk, dabbed in so much rose oil you can smell him before you see him.',
      gmNotes: 'Not a villain, just a coward in debt. If the heroes free Whisk, he weeps about his money; the Palm Mother can be persuaded to pay his debts, and he becomes a better man for it.',
    },
    {
      id: 'pf_sscludo', name: 'Ludo', title: 'a camel-kid', kind: 'npc', art: 'child', shared: true,
      wants: 'A family, a full belly, and for his friend in the jar to see the sky.', knows: 'That the jar is called Whisk, that it is lonely and frightened, and every hiding place in Brinkwell.',
      voice: 'Quick, cheeky, talks with his mouth full. Gets very quiet when he is scared.', appearance: 'A skinny boy of about ten with a shaved head, a too-big camel-driver\'s coat and lemon juice on his chin.',
      gmNotes: 'He steals the jar on the first night because Whisk asked him to. Treat him gently and he becomes the heart of the caravan. Hadda adopts him by the end, whatever happens.',
    },
    {
      id: 'pf_sscwhisk', name: 'Whisk', title: 'the little wind in the jar', kind: 'npc', art: 'airElemental',
      wants: 'To go home to its mother, the great wind of the Long Glare.', knows: 'What the Reedfolk did, that its mother has been looking for it for four hundred years, and that it is very, very bored.',
      voice: 'A soft whistle that becomes words when it trusts you. Asks a lot of questions ("What is a camel for?").', appearance: 'When the jar is opened a crack: a curl of warm air that smells of rain, with two bright specks for eyes.',
      gmNotes: 'Not a fighter. If freed under open sky it rises in a spiral, every loose thing for a mile flutters, and the Mother Wind gathers it up gently. It leaves a gift: a wind fan, and the promise of rain.',
    },
    {
      id: 'pf_sscbastek', name: 'Bastek Brassjaw', title: 'captain of a rival guard company', kind: 'npc', art: 'veteran', monsterId: 'veteran', shared: true,
      wants: 'To prove he is the best caravan guard on the Long Glare, and to be thanked for it, loudly.', knows: 'The Red Kerchiefs\' hideouts, the gnoll tally-signs, and how to fight in a sandstorm.',
      voice: 'Booming, pompous, uses his own name ("Bastek Brassjaw does not run!").', appearance: 'A barrel-chested man with a brass plate where part of his jaw used to be and a magnificent curled moustache.',
      gmNotes: 'Starts as a rival, ends as a friend. If the heroes win his respect in Brinkwell, his company joins the caravan and fights beside them at the Reedfolk Cliffs and in Jessamar.',
    },
    {
      id: 'pf_sscgoldie', name: 'Goldie Ashveil', title: 'captain of the Red Kerchiefs', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'Something big enough to retire on, and to never be thirsty again.', knows: 'That the Stillwater Brotherhood is hiring knives in Jessamar, and that their master has "clean hands and a palace key".',
      voice: 'Cheerful, chatty, calls the heroes "darlings" while robbing them.', appearance: 'A sun-browned woman with a gold tooth, a red kerchief over her mouth and three scimitars, "one for each mood".',
      gmNotes: 'Bandit captain stat block. She raids the waystation in part 1, turns up thirsty at the barge wreck in part 2, and can become an unlikely ally in part 3 (her crew starts a brawl at the gate as a distraction, for a price).',
    },
    {
      id: 'pf_sscgrinner', name: 'Grinner', title: 'chief of the Cackling Ring', kind: 'monster', art: 'gnoll', monsterId: 'gnoll',
      wants: 'To eat the storm-child and become a storm.', knows: 'The Throat, the Wash and the cliffs better than anyone, and the smell of the jar from a mile away.',
      voice: 'Giggles between every word. Talks about himself as "we".', appearance: 'A huge gnoll with a broken muzzle that never closes, wearing a stolen carpet as a cloak.',
      gmNotes: 'Gnoll stat block (give him 30 hit points as the chief). He fears the Mother Wind. Proof that the jar holds her child turns him away for good; otherwise he leads the storm-raid at the cliffs.',
    },
    {
      id: 'pf_sscwenlo', name: 'Wenlo Darrish', title: 'lamp-seller of the Yellow Sun', kind: 'npc', art: 'spy', monsterId: 'spy', shared: true,
      wants: 'The jar delivered to his master, and a place at his master\'s side when the winds are chained.', knows: 'The Keeper\'s plan, the Brotherhood\'s signs, and every secret of the caravan he has gathered while smiling.',
      voice: 'Soft and kind. Never raises his voice. Says "be still" when he is angry.', appearance: 'A slim, quiet man with lamp-soot on his fingers, who is always the one who offers to keep the late watch.',
      gmNotes: 'Spy stat block. A Stillwater agent riding with the caravan. Clues: rust on his hands (the cistern grate), his lamps never flicker, the orders mention "our brother under a yellow sun". He shows his hand in the cliff tombs. If he escapes, he is at the Windcatcher in part 3.',
    },
    {
      id: 'pf_sscozias', name: 'Ozias Thrane', title: 'Keeper of Fountains of Jessamar', kind: 'monster', art: 'cult-fanatic', monsterId: 'cultFanatic',
      wants: 'To bind the little wind, hold the great storm on a leash, and be named the Palm Mother\'s heir.', knows: 'Exactly what is in the jar and how to bind it, and the price of everyone in the palace.',
      voice: 'Calm, precise, slightly bored. Finishes other people\'s sentences.', appearance: 'A tall, thin man in spotless white with silver wire rings on every finger. His robes never stir, even in a breeze.',
      backstory: 'He was a boy in a caravan that a sandstorm buried. He decided then that the wind must never move again unless he allowed it.',
      gmNotes: 'Cult fanatic stat block. He prefers to win by talking: in the audience he is helpful and reasonable. Exposed, he runs for the Windcatcher to finish the binding. Beaten, he surrenders and asks for a trial.',
    },
    {
      id: 'pf_ssczerafine', name: 'Zerafine', title: 'the Palm Mother of Jessamar', kind: 'npc', art: 'queen', shared: true,
      wants: 'Water for her city after she is gone, and an heir who will not ruin it.', knows: 'That the fountains are failing, that the Keeper is clever, and that she does not entirely trust him.',
      voice: 'Tiny, dry and very funny. Asks blunt questions and waits for the truth.', appearance: 'A small, ancient woman in green, wrapped in shawls, always eating dates, with eyes like a hawk.',
      gmNotes: 'If shown the truth, she sides with freeing Whisk, pays Ombrel\'s debts, and names the caravan "friends of the city": no taxes for the Seven Suns, forever.',
    },
  ],
  handouts: [
    { id: 'hiring-notice', title: 'Pinned up at the Caravanserai', text: 'WANTED: STOUT HEARTS\nfor the Caravan of Seven Suns, Brinkwell to Jessamar, 19 days across the Long Glare.\nPay: 2 gp a day each, all the water you can drink, shade at noon, and Auntie Hadda\'s cooking (no complaints accepted).\n50 gp bonus at the Garden City.\nMust not fear sand, snakes or singing.\nApply in person. Bring your own sword.\n— H. Quince, Mistress of the Suns' },
    { id: 'marching-song', title: 'The marching song of the Seven Suns', text: 'Red for the kettle and orange for the rug,\nYellow for the lamplight, green for the jug,\nBlue for the mirror and indigo for scent,\nViolet for the puppets, and that\'s how we went!\nSeven suns rising and one road long,\nIf you lose your way, follow the song!' },
    { id: 'bill-of-sale', title: "Papers from Ombrel's coat", text: 'Received of the diggers Coll and Mesk: one sealed jar, Reedfolk make, wax unbroken. Paid: 40 gold.\n\nTo be carried UNOPENED to the Keeper of Fountains, Palace of Jessamar, who will pay 1,500 gold on delivery.\n\nDo not break the seal. Do not let it stand under open sky at night. If it speaks, do not answer.\n— seal of the Keeper, a still white drop' },
    { id: 'stillwater-orders', title: 'Orders found on the woman in grey', text: 'Still the wind, still the world.\nThe jar rides with the Seven Suns. Take it on the first night, at the old waystation. Our brother rides under a yellow sun and will leave the cistern way open for you.\nDo not open it. Do not let it hear the sky.\nIf it is lost, the Keeper\'s bargain is lost, and so are you.\n— O.' },
    { id: 'reed-mural', title: 'Painted on the shrine wall, in the words of the Reedfolk', text: 'The great wind ran across our fields and broke them, and so we caught her smallest child and sealed it in clay, and the great wind was quiet.\nThen the rain did not come. The rain does not come. The river is going.\nWe were wrong. The wind was the rain\'s road.\nWhoever finds this: open the jar under the sky, and say sorry for us.' },
    { id: 'keeper-letter', title: "A letter in the Keeper's desk", text: 'To the Brothers of the Still Air.\nWhen the child is bound into the Windcatcher, its mother will come to the city to find it, and she will find the bands, and she will kneel. After that, no storm crosses the Long Glare unless I let it, and no caravan crosses unless it pays. The old woman will name me heir by the month\'s end; a city with running fountains and tame storms will not refuse me.\nThe binding needs three rounds of the chant and a closed sky. Bar the vents.\n— O.T.' },
  ],
  chapters: [
    {
      id: 'brinkwell', title: 'Part 1: Brinkwell and the first night', level: 2,
      summary: 'The heroes sign on with the Caravan of Seven Suns in the river town of Brinkwell, meet a rival, a pickpocket and a nervous perfume merchant, then camp the first night at a ruined waystation where bandits raid and the humming jar is stolen.',
      goal: 'Get hired, get the caravan out of town, and get the stolen jar back.',
      map: brinkwell,
      npcs: [
        { npc: 'pf_sschadda', x: 19, y: 3 },
        { npc: 'pf_sscombrel', x: 45, y: 11 },
        { npc: 'pf_sscludo', x: 26, y: 27 },
        { npc: 'pf_sscbastek', x: 24, y: 44 },
        { npc: 'pf_sscwenlo', x: 41, y: 6 },
        { npc: 'pf_sscgoldie', x: 75, y: 21, hidden: true },
      ],
      scenes: [
        {
          room: 'Brinkwell Caravanserai', title: 'Auntie Hadda is hiring', handout: 'hiring-notice',
          read: 'Camels groan, merchants bellow, and a woman with a ladle bellows louder than all of them. She looks you up and down like cuts of meat at market. "Guards? Good. Can you eat? Can you sing? Can you hit things? Two out of three will do."',
          gm: 'The job interview. Hadda asks each hero why they want to cross the desert, and laughs at any good answer. She pays 2 gp a day each plus a 50 gp bonus in Jessamar, and gives each hero 10 gp in advance. She mentions the Red Kerchiefs and "the laughing ones" in the Throat.',
          treasure: '10 gp advance each.',
        },
        {
          room: 'The Last Shade', title: 'Brassjaw wants your job', encounter: 'Brawl at the Last Shade',
          read: 'The tavern goes quiet as you come in. A big man with a brass jaw sets down his mug. "So you\'re the amateurs who took the Seven Suns job from Bastek Brassjaw."',
          gm: 'Bastek is all bluster. His two thugs and two bandit hangers-on start a fist-fight if the heroes rise to it (unarmed, knocking out, not killing; the barkeep throws everyone out after 3 rounds). Talking him into the Trial by Camel instead (DC 12 Persuasion) moves the contest to his tents. Either way, he will turn up again.',
        },
        {
          room: 'Spice market', title: 'The light-fingered camel-kid',
          read: 'A hand brushes your belt, a lemon hits the ground, and a boy in a giant coat is already running between the spice cones, laughing.',
          gm: 'Ludo pickpockets a hero. The chase takes three DC 12 Acrobatics or Athletics checks through stalls and rugs. Caught, he hands it back with a grin and begs for work. If the heroes speak for him, Hadda hires him to mind the camels. He sleeps by the indigo wagon from then on, and starts hearing the jar.',
        },
        {
          room: "Brassjaw's tents", title: 'Trial by Camel', optional: true,
          read: 'Four mercenaries stop hitting the practice dummies. Bastek twirls his moustache. "Three tests. Load, loose and lock arms. Bastek Brassjaw has never lost."',
          gm: 'Run the three trials (see the area notes). Cheer, jeer, and let the crowd bet. Win and Bastek respects them: his company joins the road later. Lose and he gloats, then helps anyway when it matters.',
          treasure: 'A 25 gp wager, if they win.',
        },
        {
          room: "Diggers' camp", title: 'The diggers who sold the jar', optional: true,
          gm: 'Coll and Mesk are packing to run. They dug a jar out of the Reedfolk Cliffs and a dust storm chased them all the way home. They know the jar went to "the perfume man". For 5 gp or a DC 12 Persuasion they draw the way to their Robbers\' hole in the cliffs, which gives the heroes a back door in part 2.',
          treasure: 'A Reedfolk bronze amulet shaped like a reed boat (25 gp) they will trade for a meal.',
        },
        {
          room: 'Forming-up ground', title: 'Seven wagons, seven suns', handout: 'marching-song',
          read: 'Dawn turns the seven painted suns to fire. Hadda climbs on the red wagon, raises her ladle, and the whole caravan starts to sing. Thirty camels, seven wagons, one road.',
          gm: 'Introduce the crew one wagon at a time (see the area notes). Wenlo the lamp-seller is helpful and kind. Ombrel is nervous and keeps patting his wagon. Marmalade the old camel picks a hero to hate. Then the caravan rolls out of the east gate.',
        },
        {
          room: 'Indigo Sun wagon', title: 'The jar that hums', handout: 'bill-of-sale',
          gm: 'Ombrel insists his cargo is "just perfume". When the caravan is quiet the indigo wagon hums. A DC 14 Investigation finds the false floor and the jar; a DC 13 Persuasion or a hard look gets Ombrel to show his papers. He begs the heroes not to tell Hadda. Ludo, if hired, says the jar "sounds sad".',
        },
        {
          room: "Camel's Knees", title: 'Laughter on the rocks', encounter: "Gnoll scouts at the Camel's Knees",
          read: 'The road squeezes between two humps of red rock. A pebble rattles down. Then the laughing starts, high and wild, from every side at once.',
          gm: 'Gnoll scouts test the caravan. They sniff toward the indigo wagon. If two fall the rest run, yipping, to tell Grinner. A captured gnoll giggles "the jar sings, the jar sings, the chief will eat the song".',
        },
        {
          room: 'Dog Wash', title: 'The dog road', optional: true, encounter: 'Dune dogs in Dog Wash',
          gm: 'If the heroes scout for another way past the Knees, or come back this way after the theft. Lean dune dogs (wolves) defend their den. Meat makes friends. At the far end, a DC 15 Perception spots the cold crack in the cliff that leads into the cistern.',
        },
        {
          room: 'Waystation courtyard', title: 'First night at Hollowstar',
          read: 'The wagons circle inside broken walls under a sky full of stars. Hadda\'s stew bubbles, the puppet troupe performs a terrible play about a camel king, and from the indigo wagon comes a soft, tuneless hum.',
          gm: 'A calm hour. Let the heroes talk to the crew, set watches and climb the fallen tower. Wenlo volunteers for the late watch. Then the raid.',
        },
        {
          room: 'Hollowstar gate', title: 'The Red Kerchiefs ride in', encounter: 'The Red Kerchiefs ride in',
          read: 'Hoofbeats, whoops, and torches swinging in the dark. Riders in red kerchiefs pour through the broken gate and the east breach at once. "Evening, darlings! We\'ll take the humming one!"',
          gm: 'Goldie and her crew want the jar and anything shiny. She bargains happily mid-fight: she will leave for the indigo wagon\'s perfume, a good joke, or once half her crew is down. In the chaos, Ludo takes the jar and slips into the cistern. When the dust settles, the indigo wagon is open and the jar is gone.',
          treasure: 'Goldie\'s purse (40 gp), two potions of healing, a 50 gp reward in Brinkwell if she is brought in alive.',
        },
        {
          room: 'Hollowstar cistern', title: 'The jar is gone', encounter: 'The woman in grey', handout: 'stillwater-orders',
          read: 'Wet stone steps lead down into the dark. Below, a child\'s voice echoes: "Leave him alone! He doesn\'t want to go with you!"',
          gm: 'Tracks lead from the wagon to the cistern grate (unbarred from inside). Ludo and the jar are cornered by the woman in grey and four Stillwater cultists, who came in through the rat runs. They want the jar and will trade the boy for it; they fight if refused. Rats in the runs swarm anyone coming the back way. Her orders point to "a brother under a yellow sun". Ludo explains: the jar is called Whisk, and it asked him to let it see the sky.',
          treasure: '30 gp and a silver drop-shaped pin (the Brotherhood\'s sign, 10 gp) on the agent; Ludo\'s blanket hides a hero\'s lost trinket.',
        },
      ],
      wrapUp: 'The jar is back, Ludo is in trouble with Hadda (and adopted by her by the next morning), and somewhere in the caravan is a traitor under a yellow sun. Far behind, a brown smudge on the horizon follows the wagons east. The heroes reach level 3.',
    },
    {
      id: 'longglare', title: 'Part 2: The Long Glare', level: 3,
      summary: 'The deep desert: a gnoll-haunted canyon, the bed of a river that died, old enemies and new ones, a sandstorm that is really a mother searching for her child, and the truth painted on the wall of a cliff tomb.',
      goal: 'Get the caravan through the Anvils, survive the storm in the Reedfolk Cliffs, and learn what the jar really holds.',
      map: longGlare,
      npcs: [
        { npc: 'pf_sschadda', x: 60, y: 70 },
        { npc: 'pf_sscombrel', x: 64, y: 72 },
        { npc: 'pf_sscludo', x: 57, y: 72 },
        { npc: 'pf_sscbastek', x: 68, y: 70 },
        { npc: 'pf_sscwenlo', x: 66, y: 72 },
        { npc: 'pf_sscgrinner', x: 36, y: 12, hidden: true },
        { npc: 'pf_sscgoldie', x: 13, y: 47, hidden: true },
        { npc: 'pf_sscwhisk', x: 62, y: 77, hidden: true },
      ],
      scenes: [
        {
          room: 'The Long Glare', title: 'Three roads and a rising wind',
          read: 'Days of white sand and white sky. The camels walk with their eyes half shut. Ahead, the red wall of the Anvils; behind, a brown smudge on the horizon that is bigger every morning.',
          gm: 'The caravan must choose a road (see the area notes). Hadda leaves it to the heroes. Bring the storm one step closer on the Storm track each day. Wenlo quietly suggests the Throat ("quickest").',
        },
        {
          room: 'The Elbow', title: 'Laughter in the Throat', encounter: 'Ambush at the Elbow',
          read: 'The canyon bends, and the bend is full of bones stacked like firewood. Something giggles above you. Then the ledges are full of grinning faces.',
          gm: 'Grinner\'s ambush, closing both ends of the bend. Scouts ahead can spot it and turn it. Perfume, fire or a loud enough threat breaks the gnolls\' nerve. Survivors flee to the Laughing Den.',
        },
        {
          room: 'The Laughing Den', title: 'Grinner\'s den', optional: true, encounter: 'The Laughing Den',
          read: 'Stolen carpets, hide tents and a pile of loot. A huge gnoll lounging on it laughs and laughs, and then stops.',
          gm: 'The heroes can raid the den or parley. Grinner fears the Mother Wind: show him the truth and he leaves the caravan alone, and the storm-raid at the cliffs never happens. Otherwise he leads it.',
          treasure: '90 gp in mixed coins, a +1 scimitar taken from a caravan guard, a silver bell (15 gp) Hadda recognises from her cousin\'s wagon.',
        },
        {
          room: 'Old Caravan Road', title: 'The long way round', optional: true,
          gm: 'Slow and hot (Constitution saves) but safe from gnolls. The Reedfolk waymarker hints at the river people and a water cache waits under a milestone.',
          treasure: 'Two skins of water and a potion of healing under the third milestone.',
        },
        {
          room: 'The barge wreck', title: 'Goldie again', encounter: 'Red Kerchiefs at the wreck',
          read: 'A river-barge in a river with no water, lying on its side like a dead fish. On its deck, a woman with a gold tooth waves a red kerchief. "Darlings! You wouldn\'t happen to have any water?"',
          gm: 'The Red Kerchiefs are sunburned and desperate. Goldie trades information for water: the Stillwater Brotherhood hired knives in Jessamar for "a binding", and their master has a palace key. Treat them well and they may help in part 3. Treat them badly and it is a fight.',
          treasure: '60 gp in the barge\'s hidden locker (DC 13 Investigation).',
        },
        {
          room: 'The Ribs', title: 'The scorpion\'s bed', optional: true, encounter: 'The Ribs',
          gm: 'A giant scorpion lairs under the bones of a river beast. Cross quietly or it erupts from the mud. The dead treasure-hunter between the ribs has a cloak of protection.',
          treasure: 'Cloak of protection, 30 gp.',
        },
        {
          room: 'The last puddle', title: 'Mud and manners', optional: true, encounter: 'Mud mephits at the last puddle',
          read: 'Seven little mud-people sit around a brown puddle like old men in a bath. One of them opens an eye. "Ours," it says. "Go away."',
          gm: 'Bargain or fight. Polite heroes learn the mephits\' memory: "The wind-child went into the jar, and the rain went away." Pouring clean water into their puddle makes them friends forever (and they will dance).',
        },
        {
          room: 'The Hardpan', title: 'The storm wall',
          read: 'The sky turns the colour of rust. A wall of sand taller than any castle is rolling toward you, roaring like the sea, and in the roar you hear a voice calling one word over and over.',
          gm: 'The race to the cliffs (see the area notes). Each failed check costs a wagon\'s goods or a camel. The jar shakes in its wagon. Ludo shouts that Whisk is calling back.',
        },
        {
          room: 'Hall of the Boatmen', title: 'Shelter in the cliffs', encounter: 'Wenlo shows his hand',
          read: 'Camels, wagons and frightened people crowd into a hall of stone boats while the storm screams at the door. In the lamplight, Wenlo stands up very calmly. His lamps do not flicker at all. "Be still," he says. "All of you. Be still."',
          gm: 'Wenlo and his hidden cultists make their move for the jar. Fighting among the camels is chaos (see the area notes). Bastek and his company, if present, hold the door. Captured, Wenlo says only that the Keeper of Fountains will "bring peace to the winds".',
          treasure: 'Wenlo\'s lamps (one is a driftglobe), his purse (45 gp), the Brotherhood pin.',
        },
        {
          room: 'Burial chamber', title: 'The boatmen\'s captain', encounter: 'Sleepers of the burial chamber',
          read: 'In the narrow chamber a stone boat holds a boatman who is not stone. Dry linen creaks. He sits up, turns his head toward the jar, and lifts his oar.',
          gm: 'The Reedfolk Captain bound Whisk and has waited four centuries to undo it. Heroes who promise to free the jar (DC 13 Persuasion) watch him bow and crumble. Otherwise he fights whoever carries it.',
          treasure: 'Reedfolk grave goods: 180 gp in old gold, two bronze armbands (50 gp each), a wand of magic missiles in the captain\'s hand.',
        },
        {
          room: 'Painted shrine', title: 'The truth about the jar', handout: 'reed-mural',
          read: 'Lamplight runs across a painted river, painted boats and painted fields, and over all of it a great wind holding a little wind under its arm. The jar in your hands goes warm, and a small voice says: "That\'s my mum."',
          gm: 'Whisk speaks clearly for the first time. It asks to go home. It does not know that opening the jar inside the tomb would only let its mother tear the cliff apart looking for it: it must be opened under open sky, when the storm is calm. Let the heroes decide what to promise. Hadda, hearing it, cries and says her grandmothers came from this river.',
        },
        {
          room: 'Tomb porch', title: 'Grinner\'s storm-raid', encounter: "Grinner's storm-raid",
          read: 'Out of the howling sand come shapes, laughing. The Cackling Ring has followed the jar into the storm itself, and they are at the door.',
          gm: 'The climax of part 2, unless Grinner was turned away. The storm gives the gnolls cover; the porch pillars give the heroes a chokepoint, and the chimney lets someone drop on the gnolls from above. When Grinner falls or flees, the storm suddenly drops to a whisper, as if listening. By dawn the Mother Wind has drawn back to wait, and the road to Jessamar lies open.',
          treasure: 'The gnolls\' loot sacks: 70 gp and a potion of healing.',
        },
      ],
      wrapUp: 'The storm draws back at dawn, waiting. The heroes know what is in the jar, and who wants it. Three more days bring the caravan to the green walls of Jessamar, with the Mother Wind always on the horizon behind. The heroes reach level 4.',
    },
    {
      id: 'jessamar', title: 'Part 3: Jessamar, the Garden City', level: 4,
      summary: 'The oasis city: a suspicious gate, Stillwater knives in the bazaar, a palace of failing fountains, an old ruler choosing her heir, and a binding in the windcatcher tower that would chain the storms forever.',
      goal: 'Decide what to do with the jar, and stop the Keeper of Fountains from binding Whisk.',
      map: jessamar,
      npcs: [
        { npc: 'pf_sschadda', x: 6, y: 32 },
        { npc: 'pf_sscombrel', x: 8, y: 34 },
        { npc: 'pf_sscludo', x: 4, y: 36 },
        { npc: 'pf_sscbastek', x: 9, y: 29 },
        { npc: 'pf_sscgoldie', x: 21, y: 46 },
        { npc: 'pf_ssczerafine', x: 66, y: 12 },
        { npc: 'pf_sscozias', x: 72, y: 60, hidden: true },
        { npc: 'pf_sscwenlo', x: 75, y: 63, hidden: true },
      ],
      scenes: [
        {
          room: 'Caravan field', title: 'Jessamar at sunset',
          read: 'Green palms over white walls, the smell of oranges, and the sound of fountains. The caravan cheers. Behind you, low on the horizon, the brown wall of the storm sits and waits.',
          gm: 'Hadda pays the bonus and holds a council: what do we do with Whisk? Ombrel begs for his 1,500 gp. Ludo begs for Whisk. Lay out the options and let the players argue. The Storm track is at 5: one more step brings the Mother Wind into the city.',
          treasure: 'The 50 gp bonus each, from Hadda.',
        },
        {
          room: 'Sunrise Gate', title: 'Papers, please', encounter: 'Trouble at the Sunrise Gate',
          gm: 'Captain Sefu has orders to escort the indigo wagon to the palace. Talk, bribe or sneak (the culvert). Fighting honest guards is possible but makes the city an enemy. Goldie, if she is a friend, starts a brawl at the gate for 30 gp as a distraction.',
        },
        {
          room: "Weavers' Bridge", title: 'Knives on the bridge', encounter: "Knives on the Weavers' Bridge",
          read: 'The bridge is hung with drying carpets, red and gold. Halfway across, the crowd melts away. A man in white steps out ahead of you, and blades come out behind.',
          gm: 'The Stillwater Brotherhood\'s last ambush. Brother Halloway leads it. Captured knives give up the safehouse. The city watch arrives in 5 rounds and arrests whoever is still fighting.',
          treasure: '75 gp and two potions of healing among the attackers.',
        },
        {
          room: 'Stillwater safehouse', title: 'The quiet house', optional: true,
          gm: 'A warehouse where not a candle flickers. Two praying cultists surrender if spoken to. The chest holds the Keeper\'s pay and a list in his own hand: proof for the Palm Mother.',
          treasure: '120 gp, the list of names.',
        },
        {
          room: 'Great Oasis', title: 'The sacred crocodiles', optional: true, encounter: 'Sacred crocodiles',
          gm: 'Only if someone swims, falls or is thrown into the pool (the bridge fight can end here). Harming the crocodiles angers the whole city. The Isle of the First Palm holds a shrine whose keeper speaks of winds as children.',
        },
        {
          room: 'Hall of Nine Fountains', title: 'The Palm Mother\'s audience',
          read: 'Nine fountains in a white hall, seven of them dry. A tiny old woman on a throne of palm wood eats a date, and beside her a tall man in white smiles at the jar in your hands.',
          gm: 'The heart of the choice. The Keeper is charming and offers the full 1,500 gp, plus 500 more for the heroes. The Palm Mother asks blunt questions. Proof of his plan (the letter, the list, Goldie, Wenlo, or Whisk speaking aloud in the hall) makes the Keeper flee for the Windcatcher. Without proof, he takes the jar "for safekeeping" and the heroes must go after it tonight.',
        },
        {
          room: "Keeper's study", title: 'The Keeper\'s secret', handout: 'keeper-letter',
          gm: 'Reach it from the Hall or by the locked garden door. The desk letter is the proof the Palm Mother needs. The model windcatcher shows where the four silver bands are.',
          treasure: '200 gp, a bag of holding, a spell scroll of Gust of Wind.',
        },
        {
          room: 'Palm Garden', title: 'Through the garden', encounter: 'The garden watch',
          read: 'Palms, hedges shaped like camels and boats, and a silver rill. At the far end the Windcatcher rises against the brown sky, its vents barred with silver.',
          gm: 'If the heroes come uninvited, the garden watch stops them. They are honest guards: the Palm Mother\'s word or the Keeper\'s letter sends them to help instead. The kitchens and the well are quieter ways round.',
        },
        {
          room: 'Undercroft cistern', title: 'The way under', optional: true, encounter: 'Things in the undercroft',
          gm: 'The Keeper\'s secret way, from the Old Well garden to the base of the Windcatcher. Oozes and a giant constrictor snake guard it. Coming up the steps lets the heroes arrive in the middle of the binding, with surprise.',
        },
        {
          room: 'Windcatcher', title: 'The binding', encounter: 'The binding at the Windcatcher',
          read: 'In the tower the air is dead and silent. The Keeper stands in a ring of silver, the jar raised over his head, and his followers chant without moving their lips. From inside the jar, a small voice is screaming for its mother.',
          gm: 'Three rounds to stop the binding (see the area notes). If the heroes open the jar at the top of the stair under the sky, the binding fails at once. Ozias surrenders when beaten. If the binding finishes, the Mother Wind comes down on the garden.',
          treasure: 'Ozias\'s silver rings (5, 25 gp each), the palace keys, 150 gp in his robe.',
        },
        {
          room: 'Palm Garden', title: 'The Mother Wind comes down', optional: true, encounter: 'The Mother Wind comes down',
          read: 'The sky over the garden tears open. Palms bend flat, fountains blow sideways, and a shape of whirling sand as tall as the tower howls one word: her child\'s name.',
          gm: 'Only if the binding finished or the jar is smashed in anger. She is not evil: she wants her child. Fight her (air elemental) and she is driven off for a year of terrible storms, or free Whisk from the tower (break two bands, then open the vents) and she gathers her child up and is gone.',
        },
        {
          room: 'Caravan field', title: 'The Feast of Seven Suns',
          read: 'Lanterns in seven colours, the smell of Hadda\'s stew, and the whole caravan dancing on the grass under the walls. Above you, for the first time in four hundred years, a little warm cloud drifts over the desert, heavy with rain.',
          gm: 'The epilogue: tie off each wagon\'s story, let Ludo be adopted, let Bastek give a long speech, let Ombrel apologise. See the adventure ending for how each choice plays out.',
          treasure: 'If Whisk is freed: a wind fan (Whisk\'s gift), and from the Palm Mother 300 gp and a decanter of endless water. If the jar went to the Keeper: 2,000 gp, and nothing else ever goes right on the Long Glare.',
        },
      ],
      wrapUp: 'However it ends, the Seven Suns feast on the field under the walls. The road home is a new story.',
    },
  ],
  ending:
    'Freedom (best ending): Whisk is opened under open sky and the Mother Wind gathers it up. The storms of the Long Glare calm, and within a few years rain falls again on the Sorrow Wash and grass grows in the old riverbed. The Palm Mother exposes the Keeper, pays Ombrel\'s debts, and makes the Seven Suns friends of the city forever. The heroes are welcome on every caravan in the desert. The Keeper\'s bargain: if the heroes hand the jar over and the binding works, Jessamar\'s fountains run, the Keeper is named heir, the Long Glare closes to every caravan that will not pay him, and the Mother Wind rages along the edge of the desert. Brinkwell is half buried in a year. Undoing it means breaking into the Windcatcher, now a fortress. Failure: if the jar is lost or smashed, the Mother Wind tears through Jessamar and leaves; the city survives, scarred, and the storms go on forever. What next: the Stillwater Brotherhood has other jars in other tombs; the embalmers\' shelf showed a clean ring in the dust where another jar once stood. Somewhere, another wind is still sealed in clay.',
};
