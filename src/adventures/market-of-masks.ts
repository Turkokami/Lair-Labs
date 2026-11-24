// The Market of Masks: a one-night mystery for three to five heroes of level 3.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

/** Paint a winding lane of cobbles along a list of points (outdoors, where there is ground already). */
function lane(b: MapBuilder, pts: [number, number][], w = 2, mat = 'stone-cobble') {
  for (let p = 0; p < pts.length - 1; p++) {
    const [ax, ay] = pts[p], [bx, by] = pts[p + 1];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / steps), y = Math.round(ay + ((by - ay) * s) / steps);
      b.paint(x, y, w, w, mat);
    }
  }
}

// The hedge maze, drawn as a picture: # is hedge, . is gravel path.
const MAZE = [
  '#########################',
  '#.......#.......#.......#',
  '#.#####.#.#####.#.#####.#',
  '#.#...#...#...#...#...#..',
  '#.#.#.#####.#.#####.#.#.#',
  '#...#.......#.......#...#',
  '###.#########.#######.###',
  '#.....#...........#.....#',
  '#.###.#.###...###.#.###.#',
  '#.#...#.#.........#...#.#',
  '#.#.###.#.#######.###.#.#',
  '#.#.....#...#.....#...#.#',
  '#.#######.#.#.#####.###.#',
  '#...........#...........#',
  '############..###########',
];

function sorrelHill() {
  const b = new MapBuilder('adv-market-of-masks', 'Sorrel Hill on Veilnight', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });

  // ---------- the bones of the town: the hill, the lanes, the river ----------
  // the old hillside the catacombs are cut into (south-west)
  b.rock(0, 42, 29, 38);
  lane(b, [[0, 19], [12, 19], [18, 20], [28, 18], [52, 18], [58, 20], [79, 20]]);
  lane(b, [[39, 12], [39, 18]]);
  lane(b, [[19, 21], [20, 30], [19, 39], [26, 40], [30, 41], [38, 42]]);
  lane(b, [[57, 20], [58, 28], [57, 36], [59, 44], [58, 52], [59, 60]]);
  lane(b, [[37, 44], [40, 45], [56, 44], [59, 45]]);
  lane(b, [[40, 42], [40, 61]]);
  b.paint(29, 61, 51, 5, 'stone-flagstone');
  // the river Sorrel, with its bridge, piers and the old ford
  b.water(29, 66, 51, 6, false).water(29, 67, 51, 4, true).water(74, 66, 5, 6, false);
  b.floor(46, 65, 3, 8, 'wood-planks');
  b.floor(34, 66, 2, 4, 'wood-planks').floor(56, 66, 2, 5, 'wood-planks').floor(68, 66, 2, 4, 'wood-planks');

  // ---------- the hedge maze (north-west) ----------
  MAZE.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') b.rock(2 + k, 1 + r, 1, 1); }));
  b.paint(2, 1, 25, 15, 'dirt').paint(9, 8, 11, 3, 'stone-flagstone');
  b.area('Hedge maze garden', [[2, 1, 25, 15]], {
    read: 'Tall black hedges, clipped square, with paper lanterns hung at every corner. Laughter drifts from somewhere inside, then stops.',
    gm: 'Old Mayor Thistlewood\'s maze, open to all on Veilnight. Lovers and plotters both come here. Finding the heart takes three DC 11 Wisdom (Survival) checks, or follow the lantern string (every lantern on the true path has a red tassel: DC 13 Perception to notice). A thin spot in the east hedge, choked with brambles, lets a small or nimble hero squeeze out toward the temple (DC 12 Perception to find, DC 12 Acrobatics to get through without a scratch).',
    label: [4, 2],
  });
  b.area('Maze heart', [[9, 8, 11, 3]], {
    read: 'A little paved court around a dry fountain. A stone hare sits on the rim, its ears worn smooth by a hundred years of hands.',
    gm: 'At the 10th bell, the Moth (the doppelganger as Odile) meets Harl Dask here to settle the midnight plan. Heroes hiding in the hedges (DC 13 Stealth against the Moth\'s passive Perception 11; note it reads thoughts, so a hero who thinks about hiding is heard at 30 feet: let it make a DC 15 Insight at advantage) can overhear: "Your men under the stage. The Stag goes into the tent at the last bell, and comes out as me... as her." Dask is uneasy and says so. Touching the stone hare is Odile\'s old luck habit: the real Odile always did it, Hob knows.',
    label: [14, 9],
  });
  b.prop('fountain', 14, 9).prop('statue', 13, 9).props_('bench', [[10, 8], [18, 10]]).props_('lantern-cluster', [[9, 10], [19, 8]]).prop('flowers', 11, 10);
  b.props_('lantern-hook', [[3, 2], [9, 2], [17, 2], [25, 2], [3, 14], [25, 14], [7, 6]]).props_('bush', [[3, 8], [22, 12]]).prop('brambles', 26, 4).prop('bench', 7, 14);
  b.light(14, 9, 10, 15, '#ffd58a').light(3, 2, 5, 10, '#ff8a8a').light(25, 14, 5, 10, '#ff8a8a').light(7, 6, 5, 10, '#ff8a8a');
  b.rubble(26, 4, 1, 1);
  b.props_('tree-oak', [[1, 17], [24, 17]]).props_('flowers', [[10, 17], [20, 17]]).prop('signpost', 16, 17);

  // ---------- the Temple of the Dove (hilltop) ----------
  b.building('Temple of the Dove', 30, 1, 20, 11, {
    mat: 'marble',
    read: 'White walls, white doves asleep in the rafters, and a hundred candles. The priestess blesses each masked guest with a drop of rosewater on the brow of their mask.',
    gm: 'Sister Ysolde keeps the temple. The 10th-bell blessing is a Veilnight custom: the Mask-Maker always comes first, in her Grey Hare. Tonight Odile did not come. Ysolde noticed and is worried (she says so if asked kindly). Ysolde will lend the heroes the temple bell-rope key: from the bell loft a hero can see the whole square and the stage (advantage on Perception to watch the Moth for an hour).',
    doors: [[39, 11, 's', 'closed', 'door-double'], [40, 11, 's', 'closed', 'door-double'], [49, 6, 'e', 'closed']],
    windows: [[30, 4, 'w'], [30, 8, 'w'], [35, 1, 'n'], [44, 1, 'n']],
  });
  b.wallRun(44, 1, 6, 'e').door(44, 4, 'e', 'closed');
  b.prop('altar', 39, 2).props_('pew', [[34, 5], [34, 7], [34, 9], [41, 5], [41, 7], [41, 9]]).props_('candelabra', [[37, 2], [41, 2]]).prop('font', 39, 9).prop('temple-bell', 32, 2).prop('ladder', 31, 3);
  b.prop('wardrobe', 47, 2).prop('desk', 46, 4).prop('chest', 48, 5).prop('offering-bowl', 42, 3).light(39, 3, 15, 20, '#fff2c8');
  b.area('Vestry', [[45, 1, 5, 6]], { gm: 'Ysolde\'s robes and the temple\'s plate. A locked chest (DC 13) holds the Veilnight offerings: 40 gp. Stealing from the Dove is a fine way to be hated by the whole town.', label: [47, 3] });
  b.area('Temple steps', [[37, 12, 6, 6]], {
    read: 'Wide worn steps run down the hill to the square. From up here the festival is a bowl of light and music.',
    gm: 'A good place to watch the square. A blind fiddler, Old Mags, plays here all night. She knows voices, not faces: "Odile\'s voice is a little off tonight. Like a song learned from a stranger."',
  });
  b.props_('stairs-down', [[38, 13], [41, 13]]).props_('lamp-post', [[37, 15], [42, 15]]).prop('stool', 42, 16);
  b.light(37, 15, 15, 20).light(42, 15, 15, 20);

  // ---------- the mayor's townhouse ----------
  b.building("The mayor's townhouse", 55, 1, 22, 12, {
    mat: 'wood-planks-dark',
    read: 'A tall house of black beams and white plaster. Every window is lit, and a white stag banner hangs over the door.',
    gm: 'Mayor Tamsin Hale lives here with her steward, Bram Holloway. Two hired door guards (guard stat blocks) admit only invited guests. A forged invitation (DC 13), a good lie (DC 14 Deception) or a word from Sister Ysolde gets the heroes in. The study window on the east side is unlatched (DC 12 Athletics to climb the ivy).',
    doors: [[65, 12, 's', 'closed', 'door-double'], [66, 12, 's', 'closed', 'door-double']],
    windows: [[58, 12, 's'], [72, 12, 's'], [76, 9, 'e'], [55, 4, 'w'], [60, 1, 'n'], [72, 1, 'n']],
  });
  b.wallRun(55, 6, 22, 's').wallRun(62, 7, 6, 'e').wallRun(68, 7, 6, 'e').wallRun(66, 1, 6, 'e');
  b.door(60, 6, 's', 'closed').door(71, 6, 's', 'closed').door(62, 9, 'e', 'closed').door(68, 9, 'e', 'closed');
  b.area('Entry hall', [[63, 7, 6, 6]], { gm: 'Coats, masks on pegs, and a grand stair up to the bedrooms (shown by the stair prop).', label: [65, 9] });
  b.prop('stair-grand', 64, 8).prop('coat-rack', 67, 11).prop('rug-runner', 65, 10).prop('chandelier', 65, 9);
  b.area('Parlour', [[55, 7, 7, 6]], { gm: 'Where the mayor receives guests. Tamsin\'s little sister\'s drawings of stags are framed on the wall.', label: [58, 9] });
  b.prop('sofa', 57, 8).props_('armchair', [[59, 10], [56, 10]]).prop('fireplace', 58, 7).prop('harpsichord', 60, 11).prop('side-table', 57, 11).light(58, 8, 10, 15);
  b.area("Steward's study", [[69, 7, 8, 6]], {
    read: 'A neat desk, neat shelves, neat piles of town letters. On the blotter lies a brass owl mask, face down, as if it were tired.',
    gm: 'The fake Bram works here between appearances. In the desk (DC 12 to open quietly): the real Bram\'s spectacles, which the fake does not need, and a ring of keys including one stamped with a hare (Odile\'s workshop). The fake Bram is the second doppelganger: see his profile. If cornered and named, he drops his face and fights with one hired thug from the kitchen.',
    label: [72, 9],
  });
  b.prop('writing-desk', 72, 8).prop('chair-high-back', 72, 9).props_('bookshelf', [[70, 7], [75, 7]]).prop('map-cabinet', 75, 11).prop('strongbox', 70, 11).light(72, 8, 5, 15);
  b.area('Mayor\'s bedchamber', [[55, 1, 11, 5]], { gm: 'Tamsin\'s room. Her real mask, the White Stag, sits on a stand by the bed: she wears a spare tonight (the Moth "borrowed" the good one for fitting).', label: [60, 3] });
  b.prop('bed-four-poster', 57, 2).prop('vanity', 63, 2).prop('wardrobe', 64, 4).prop('rug-round', 60, 3);
  b.area('Dressing room', [[67, 1, 10, 5]], { gm: 'Silk, velvet and a long mirror. A hidden drawer under the bottom shelf (DC 14) holds the mayor\'s seal and her 120 gp household purse.', label: [71, 3] });
  b.prop('dresser-mirror', 70, 2).prop('armoire', 74, 2).prop('folding-screen', 68, 4).prop('jewelry-box', 75, 4);
  b.encounter('The Owl unmasked', [55, 1, 22, 12], [['doppelganger', 1], ['thug', 1]], 'moderate');
  b.area('Townhouse garden', [[55, 13, 22, 4]], { gm: 'Clipped box hedges and a gravel walk. The gate to Lantern Lane is open tonight; guests drift in and out.', label: [70, 14] });
  b.wallRun(57, 16, 20, 's', 'low').door(66, 16, 's', 'open');
  b.props_('hedge', [[57, 14], [61, 14], [71, 14], [75, 14]]).props_('flowers', [[59, 15], [73, 15]]).prop('fountain', 66, 14).props_('lamp-post', [[63, 15], [69, 15]]).light(63, 15, 10, 15).light(69, 15, 10, 15);

  // ---------- Lantern Lane ----------
  b.area('Lantern Lane', [[0, 18, 80, 3]], {
    read: 'Strings of paper lanterns criss-cross the lane, red, gold and green, so low a tall hero has to duck. Masked dancers spin past, and somebody hands you a cup of hot cider.',
    gm: 'The main way round the town. In the crowd, a pickpocket in a goat mask works the lane (DC 13 Perception to catch). Caught, the boy trades a tip for his freedom: "Big men with clubs, no masks under their hoods, waiting in Ropewalk Alley. Paid in new silver."',
    label: [8, 19],
  });
  b.props_('lamp-post', [[6, 21], [22, 17], [33, 17], [50, 17], [62, 22], [76, 22]]).props_('lantern-cluster', [[14, 21], [28, 20], [54, 21], [70, 18]]).prop('merchant-cart', 46, 17).prop('produce-stall', 25, 17).prop('well', 31, 21).prop('handcart', 74, 18);
  for (const [x, y] of [[6, 21], [22, 17], [33, 17], [50, 17], [62, 22], [76, 22]]) b.light(x, y, 15, 20, '#ffb35c');
  for (const [x, y] of [[14, 21], [28, 20], [54, 21], [70, 18]]) b.light(x, y, 10, 15, '#ff7a7a');

  // ---------- the Mask-Maker's workshop (the crime scene) ----------
  b.area('Drying yard', [[2, 22, 15, 5]], {
    gm: 'Racks of drying papier-mache faces stare at the sky. A wet handcart track runs from the workshop\'s back door round to the lane, then stops: someone carried something heavy out, then thought better of it (DC 12 Survival).',
    label: [9, 24],
  });
  b.props_('tool-wall', [[3, 23], [7, 23], [11, 23]]).prop('workbench', 14, 24).prop('handcart', 5, 25).prop('water-barrel', 16, 25).prop('herbs-drying', 9, 23);
  b.building("Mask-Maker's workshop", 3, 28, 14, 14, {
    mat: 'wood-planks',
    read: 'Masks cover every wall: hares, foxes, owls, suns and weeping moons, all staring. The shop is dark and the street door is open. Under the counter, something dark has soaked into the boards.',
    gm: 'The crime scene. Odile Fenwick was killed here at the 9th bell. See the clue list in the first scene. Odile\'s old cat, Pudding, hides on the top shelf: it hisses at the Moth and purrs for anyone who knew Odile. Blood under the counter (DC 10 Medicine: a heavy blow, about three hours ago).',
    doors: [[16, 31, 'e', 'open'], [16, 38, 'e', 'locked'], [6, 41, 's', 'secret']],
    windows: [[8, 28, 'n'], [13, 28, 'n'], [3, 32, 'w']],
  });
  b.wallRun(3, 34, 14, 's').door(9, 34, 's', 'closed');
  b.area('Casting room', [[3, 35, 14, 7]], {
    read: 'Long shelves of white plaster faces, eyes closed, each with a name chalked under it. Half the town sleeps on these shelves. Three spaces are empty, outlined in dust.',
    gm: 'Odile made a plaster life-cast of every client. The casts of Mayor Tamsin Hale, Harl Dask and Bram Holloway are gone (the doppelgangers study them). A tall mirror is smeared with a grey handprint too long in the fingers (DC 13 Investigation: no human hand made it). The floor near the south wall has a scraped arc: a trapdoor under the rug (DC 13 Perception, or DC 10 once the rug is moved) opens on a brick drain stair down into the catacombs. Odile\'s strong coffer (DC 13 thieves\' tools, or her key from Wick) holds her masterwork.',
    label: [9, 38],
  });
  b.props_('display-case', [[5, 29], [11, 29]]).prop('shop-counter', 8, 31).prop('blood-pool', 8, 32).prop('mirror', 15, 29).prop('stool', 9, 30).props_('wall-shelves', [[4, 30], [4, 32]]);
  b.props_('ossuary-shelf', [[4, 36], [4, 38], [4, 40]]).prop('workbench', 10, 36).prop('cauldron', 13, 36).prop('magic-mirror', 15, 39).prop('rug', 6, 40).prop('trapdoor', 6, 41).prop('coffer', 13, 40).prop('sack', 11, 40).light(10, 36, 5, 10);
  b.note(6, 41, 'Secret trapdoor under the rug: brick drain stair down to the catacombs.');

  // ---------- Ropewalk Alley ----------
  b.area('Ropewalk Alley', [[17, 22, 10, 19]], {
    read: 'A narrow back lane between leaning houses, where the rope-makers twist their hemp by day. The lanterns here have gone out. Not all by themselves.',
    gm: 'The quick way from the workshop to the square. Four thugs hired by Harl Dask wait here to beat the heroes and warn them off ("Leave the old woman\'s business alone"). If two drop, the rest run. A captured thug knows only that "a lady in a silver moth mask" paid them, in new silver pennies from the river toll chest.',
    label: [21, 30],
  });
  b.props_('rope-coil', [[18, 24], [22, 33]]).props_('barrel-stack', [[24, 27], [17, 36]]).prop('crate-pile', 25, 38).props_('lamp-post', [[18, 28], [21, 37]]).prop('spinning-wheel', 24, 24).prop('log-pile', 25, 31);
  b.light(21, 37, 5, 10, '#ffb35c');
  b.encounter('Thugs in Ropewalk Alley', [17, 22, 10, 19], [['thug', 4]], 'low');

  // ---------- the festival square and the stage ----------
  b.paint(28, 24, 29, 19, 'stone-cobble');
  b.paint(33, 24, 16, 5, 'wood-planks');
  b.area('Festival square', [[28, 29, 29, 14]], {
    read: 'The whole town is here, and nobody has a face. Stags, owls, foxes, suns and crows dance round a bonfire, buy honey-cakes and shout over the drums. A great bronze clock on a pole shows the hour, and the hand is creeping toward midnight.',
    gm: 'The heart of the night. Veilnight law: nobody may take off another person\'s mask before the midnight bells. Doing it in public draws the watch (Captain Marsh arrives in 1 minute) and a hostile crowd. Mother Pruett\'s honey-cake stall is here: by custom, the Mask-Maker eats the first cake of the night. The Moth has not taken it (Pruett will mention it, puzzled). Overheard gossip (one per visit): the mayor wants to tax the river; Fennick Sallow and Odile had a shouting match last week; Bram the steward has been "cold" lately.',
    label: [36, 36],
  });
  b.props_('market-stall', [[29, 30], [29, 33], [29, 36], [29, 39], [55, 30], [55, 33], [55, 36], [55, 39]]).props_('produce-stall', [[33, 41], [49, 41]]).prop('campfire', 42, 35).props_('banner-pole', [[37, 33], [47, 33], [37, 38], [47, 38]]).props_('table-long', [[33, 31], [51, 31]]).props_('bench-long', [[33, 32], [51, 32]]).prop('cart', 43, 41).prop('fountain', 42, 31).props_('lantern-cluster', [[31, 30], [53, 30], [31, 40], [53, 40]]).props_('fire-bowl', [[35, 35], [49, 35]]).prop('keg-rack', 52, 38).prop('crate-stack', 30, 41);
  b.light(42, 35, 20, 25, '#ff9a3c').light(31, 30, 10, 15, '#ffd58a').light(53, 30, 10, 15, '#ffd58a').light(31, 40, 10, 15, '#ff7aa8').light(53, 40, 10, 15, '#7ad6ff').light(35, 35, 10, 10).light(49, 35, 10, 10);
  b.area('The stage', [[33, 24, 16, 5]], {
    read: 'A painted stage of new planks, hung with velvet curtains and a hundred masks on strings. At midnight the bells ring, the mayor steps up here, and the Mask-Maker lifts away her mask for the whole town to cheer.',
    gm: 'The unmasking ritual: the Mask-Maker leads the mayor into the robing tent behind the stage for "the last mask", then out again to unmask her before the crowd. The Moth means to swap here. Under the stage is a crawlspace (DC 12 Perception to notice the loose skirting board) where Dask\'s thugs will hide from the 11th bell on.',
    label: [40, 26],
  });
  b.props_('stairs-up', [[33, 28], [48, 28]]).props_('banner-hanging-tall', [[34, 24], [47, 24]]).props_('candle-stand-tall', [[36, 27], [45, 27]]).prop('throne', 40, 25).prop('crate', 46, 25).prop('lectern', 41, 27);
  b.light(36, 27, 10, 15, '#ffe0a0').light(45, 27, 10, 15, '#ffe0a0');
  b.building('Robing tent', 37, 20, 8, 4, {
    mat: 'wood-planks',
    read: 'A tent of striped silk behind the stage, close and warm, full of mirrors and masks on stands.',
    gm: 'Where the swap will happen at midnight. A hero hidden here (behind the folding screen, DC 12 Stealth) sees everything. The back flap opens onto Lantern Lane.',
    doors: [[40, 20, 'n', 'closed'], [40, 23, 's', 'open'], [41, 23, 's', 'open']],
  });
  b.prop('folding-screen', 38, 21).prop('dresser-mirror', 43, 21).props_('coat-rack', [[42, 22]]).prop('chair', 39, 22).light(40, 21, 5, 10, '#ffd58a');
  b.encounter('The midnight unmasking', [33, 20, 16, 9], [['doppelganger', 1], ['spy', 1], ['thug', 4]], 'high');

  // ---------- the Drunken Moon tavern ----------
  b.building('The Drunken Moon', 61, 23, 17, 15, {
    mat: 'wood-planks',
    read: 'A roar of voices, a fiddle sawing at a jig, and a dozen masks pushed up on foreheads so their wearers can drink. A painted moon over the bar wears a mask too.',
    gm: 'Lio Brightwater (a cheerful tavern-keeper in a Red Fox mask) runs it. Alibis live here. Lio swears that Bram the steward sat at the corner table from the 8th bell to the 10th and drank three ales ("first time I ever saw him touch the stuff"). Fennick Sallow has been drinking here all night and is loud about it. Lio\'s old hound, Smudge, growls at anyone who is not what they seem.',
    doors: [[61, 28, 'w', 'open', 'door-double'], [61, 29, 'w', 'open', 'door-double'], [66, 37, 's', 'closed']],
    windows: [[61, 25, 'w'], [77, 27, 'e'], [68, 23, 'n']],
  });
  b.wallRun(61, 32, 17, 's').wallRun(69, 33, 5, 'e').door(64, 32, 's', 'closed').door(74, 32, 's', 'closed');
  b.prop('bar-counter', 64, 24).prop('keg-rack', 62, 24).prop('fireplace', 72, 23).props_('table-round', [[65, 27], [69, 26], [73, 28], [68, 30]]).props_('chair', [[64, 27], [66, 27], [70, 26], [72, 28], [74, 28], [67, 30]]).prop('dartboard', 77, 30).prop('tavern-sign', 60, 27).prop('table-cards', 75, 25).light(72, 24, 15, 20).light(66, 27, 10, 15);
  b.area('Tavern kitchen', [[61, 33, 9, 5]], { gm: 'Hot, loud, and full of pies. The back door leads to the yard and the ladder up to the roofs. The cook saw "a big black bird" carrying a scroll tube up the ladder at the 9th bell.', label: [65, 35] });
  b.prop('hearth-oven', 62, 34).prop('pot-rack', 64, 33).prop('butcher-block', 66, 35).prop('flour-sacks', 68, 36).prop('bread-rack', 62, 36);
  b.area('The snug', [[70, 33, 8, 5]], { gm: 'A private room for card games. Fennick Sallow sulks here after he has said too much in the main room. He keeps a sample case of his own masks (one empty space where a Silver Moth sat).', label: [73, 35] });
  b.prop('table-square', 73, 34).props_('stool', [[72, 34], [74, 34]]).prop('trunk', 76, 36).prop('lamp-table', 71, 36).light(73, 34, 5, 10);
  b.props_('ladder', [[66, 38]]).prop('water-trough', 63, 38).prop('firewood', 74, 38);

  // ---------- the rooftops ----------
  b.building("Rooftops of Chandlers' Row", 61, 40, 18, 11, {
    mat: 'dungeon-slab',
    read: 'Slate roofs and crooked chimneys, all crowded together, with gutters to leap and washing lines to duck. Below, the festival glows like a dropped lantern.',
    gm: 'Up the ladder from the tavern yard, or a drainpipe from the quay (DC 12 Athletics). Nib, the Moth\'s imp messenger, perches here in raven form waiting to carry notes between the two doppelgangers. Chasing Nib: three DC 12 Acrobatics or Athletics checks to keep up over the gaps (a failure costs 1d6 falling damage and a round). A hired spy sits by the chimney watching the square. Caught, Nib bargains for its life: it knows the whole plan and hates its master.',
    doors: [[66, 40, 'n', 'open'], [75, 50, 's', 'closed']],
  });
  b.wallRun(61, 44, 6, 's', 'low').wallRun(70, 44, 5, 's', 'low').wallRun(68, 46, 4, 'e', 'low');
  b.props_('pillar-square', [[63, 42], [72, 41], [76, 47], [65, 48]]).prop('telescope', 77, 41).prop('rope-coil', 70, 48).prop('chicken-coop', 62, 49).props_('water-barrel', [[74, 43], [67, 42]]).prop('bedroll', 71, 49).prop('crate', 77, 49);
  b.encounter('Nib on the rooftops', [61, 40, 18, 11], [['imp', 1], ['spy', 1]], 'low');

  // ---------- the Chapel of Bones (the catacomb gate) ----------
  b.building('Chapel of Bones', 29, 44, 8, 8, {
    mat: 'stone-flagstone',
    read: 'A small stone chapel, older than the town, its walls set with skulls in neat rows. Nobody comes here on Veilnight. The iron door in the back wall has fresh oil on its hinges.',
    gm: 'The old way down to the catacombs, where the town buried its dead before the river graveyard. The iron door is locked (DC 14 thieves\' tools; the fake Bram\'s key ring opens it). Fresh oil, wax drips and a single silver moth scale on the floor (DC 12 Investigation).',
    doors: [[36, 47, 'e', 'closed'], [29, 47, 'w', 'locked', 'door-iron']],
  });
  b.prop('altar', 31, 45).props_('skull-pile', [[30, 50], [35, 50]]).props_('candles', [[33, 45], [30, 45]]).prop('urn', 35, 45).prop('stairs-down', 30, 47).light(33, 45, 5, 10, '#d8e0ff');

  // ---------- the watch house ----------
  b.building('Watch house', 43, 48, 10, 9, {
    mat: 'stone-flagstone',
    read: 'A squat stone house with an iron lamp over the door. Inside, halberds in a rack, a chalkboard of patrols, and two drunks asleep in a cell.',
    gm: 'Captain Edda Marsh\'s post. Twelve watch guards walk the festival in pairs; four are here at any time. If the fake Bram tells Edda the heroes are "the murderers" (he will, as soon as they ask hard questions about him), she comes to arrest them. Talk her down with evidence (DC 13 Persuasion with one solid clue, DC 10 with two) and she becomes a strong ally, bringing her guards to the stage at midnight.',
    doors: [[43, 52, 'w', 'closed'], [47, 56, 's', 'closed']],
    windows: [[45, 48, 'n'], [52, 51, 'e']],
  });
  b.wallRun(48, 48, 9, 'w', 'bars').door(48, 54, 'w', 'locked', 'bars');
  b.prop('desk', 45, 50).prop('chair', 45, 51).prop('notice-board', 44, 49).prop('weapon-rack', 46, 55).prop('armor-stand', 44, 55).props_('cot', [[50, 49], [50, 53]]).prop('key-ring', 47, 52).prop('stove', 51, 55).light(45, 50, 10, 10);
  b.encounter('The watch turns', [43, 48, 10, 9], [['veteran', 1], ['guard', 4]], 'moderate');

  // ---------- the quay, the Black Pike warehouse and the river ----------
  b.area('The quay', [[29, 61, 51, 5]], {
    read: 'Boats nose against the stone quay, each with a lantern in its prow. Families are pushing off with paper boats full of candles, to float them down the Sorrel before midnight.',
    gm: 'The lantern float happens at the 11th bell. A drainpipe at the east end climbs to the roofs (DC 12 Athletics). Boatmen will row anyone anywhere for 1 sp, including the dark arch where the river runs under the hill: "the Old Throat". They will not go in. A boat can.',
    label: [34, 63],
  });
  b.props_('mooring-post', [[33, 65], [45, 65], [55, 65], [67, 65], [77, 65]]).props_('rowboat', [[36, 68], [52, 67], [62, 69]], 90).prop('canoe', 71, 68, 90).props_('fishing-net', [[30, 62], [50, 62]]).props_('barrel-group', [[38, 62], [60, 62]]).prop('anchor', 42, 62).props_('lamp-post', [[32, 61], [44, 61], [58, 61], [74, 61]]).prop('fish-crate', 53, 63);
  for (const [x, y] of [[32, 61], [44, 61], [58, 61], [74, 61]]) b.light(x, y, 15, 20);
  b.building('Black Pike warehouse', 61, 52, 17, 8, {
    mat: 'wood-planks-dark',
    read: 'A tarred warehouse with a black pike painted on the doors. It smells of brandy and river mud. Men without masks play dice on a barrel and stop when you come in.',
    gm: 'Harl Dask\'s smuggling store. Dask and three thugs are here until the 11th bell, then the thugs go under the stage. Dask is no killer and is scared of his "partner". Show him the Gallery of Faces, his own missing cast, or Nib\'s note, and he turns (DC 12 Persuasion): he calls off his men and hands over the Moth\'s letter. Fight him and he fights dirty, then surrenders at half his hit points.',
    doors: [[69, 59, 's', 'closed', 'door-double'], [70, 59, 's', 'closed', 'door-double'], [61, 55, 'w', 'closed']],
    windows: [[77, 55, 'e'], [65, 52, 'n']],
  });
  b.wallRun(72, 52, 8, 'w').door(72, 56, 'w', 'closed');
  b.area("Dask's counting room", [[72, 52, 6, 8]], { gm: 'A desk, a strongbox and a ledger of river tolls dodged. The Moth\'s letter is in the desk drawer (handout).', label: [75, 55] });
  b.props_('cargo-crates', [[62, 53], [62, 57]]).props_('crate-stack', [[65, 53], [68, 53]]).props_('barrel-stack', [[64, 57], [67, 57]]).prop('table-cards', 69, 55).props_('stool', [[68, 55], [70, 56]]).prop('winch', 70, 53).prop('wine-rack', 66, 55);
  b.prop('desk', 75, 53).prop('chair', 75, 54).prop('strongbox', 77, 58).prop('map-cabinet', 73, 58).light(75, 53, 5, 10).light(69, 55, 10, 10);
  b.encounter("The Black Pike's crew", [61, 52, 17, 8], [['bandit-captain', 1], ['thug', 3]], 'moderate');
  b.area('Lantern Bridge', [[46, 65, 3, 8]], {
    read: 'A humped wooden bridge hung with lanterns. Couples stop in the middle to drop flowers into the dark water.',
    gm: 'A chase across the bridge is easy to block: two guards at either end stop anyone. The river below is deep and cold (DC 12 Athletics to swim across).',
  });
  b.props_('lantern-hook', [[46, 66], [48, 70]]).light(47, 68, 10, 15, '#ffd58a');
  b.area('The old ford', [[74, 66, 5, 6]], { gm: 'Stepping stones in waist-deep water, slippery with weed. A way across for anyone avoiding the bridge.', label: [76, 68] });
  b.props_('boulder', [[75, 67], [77, 69]]).prop('reeds', 78, 70);
  b.area('Willow Bank', [[29, 72, 51, 8]], {
    read: 'Across the river, weeping willows trail their hair in the water. Paper lanterns drift past by the hundred, and the sound of the festival is soft and far away.',
    gm: 'A quiet place for a private talk, or for the Moth to run to if exposed early: it heads here to steal a boat into the Old Throat and its den.',
    label: [36, 75],
  });
  b.props_('tree-willow', [[31, 73], [40, 74], [53, 73], [58, 77], [72, 74], [78, 77]]).props_('reeds', [[33, 72], [50, 72], [70, 72]]).prop('log-fallen', 45, 77).props_('flowers', [[37, 77], [55, 75]]).prop('campfire', 43, 75).prop('bench', 48, 76).light(43, 75, 10, 15, '#ff9a3c');
  b.building("Ferryman's hut", 62, 73, 7, 6, {
    gm: 'Old Sev the ferryman sleeps through Veilnight. His boat is tied below. He saw "the Mask-Maker" row into the Old Throat alone two nights ago, and thought it odd: Odile is scared of the water.',
    doors: [[65, 73, 'n', 'closed']], windows: [[68, 75, 'e']],
  });
  b.prop('cot', 63, 74).prop('stove', 67, 77).prop('fishing-gear', 63, 77).prop('chair', 65, 76);

  // ---------- the catacombs under the hill ----------
  b.room('Catacomb stair', 21, 44, 8, 6, {
    mat: 'dungeon-slab',
    read: 'Worn steps spiral down into cold air that smells of earth and old candles. Niches in the walls hold skulls with coins in their eye sockets.',
    gm: 'Down from the Chapel of Bones. The coins (2 cp each) are offerings; taking them is bad luck and Sister Ysolde will know. Fresh boot prints go both ways, and some are too long and narrow, with no heel.',
  });
  b.props_('stair-spiral', [[27, 45]]).props_('tomb-niche', [[22, 44], [25, 44]]).prop('candles', 23, 48);
  b.tunnel([[19, 50], [23, 48]], 2, { mat: 'dungeon-slab', seed: 41 });
  b.tunnel([[6, 42], [6, 46], [9, 50]], 1, { mat: 'brick-floor', seed: 42 });
  b.area('The drain stair', [[6, 42, 2, 6]], { gm: 'A slick brick stair from the workshop trapdoor down to the bone gallery. Drag marks and a dropped plaster chip.', label: [6, 44] });
  b.cave('Bone gallery', 13, 52, 7, 4.5, {
    seed: 43, mat: 'cave-floor',
    read: 'A long low cave walled with bones: skulls on top, thigh bones below, stacked like firewood. Something squeaks. Then a thousand somethings.',
    gm: 'The swarms nest here and boil out at light and noise. A hero who moves slowly with a shuttered lantern can pass with a DC 13 Stealth check (group). A trail of plaster dust leads west and south.',
  });
  b.props_('ossuary-shelf', [[9, 50], [16, 50], [10, 55]]).props_('skull-pile', [[12, 49], [18, 54]]).prop('bone-heap', 14, 55).prop('cobweb-corner', 8, 52);
  b.encounter('Swarms in the bone gallery', [6, 47, 15, 11], [['swarm-of-rats', 3], ['swarm-of-bats', 3]], 'low');
  b.hall(10, 56, 8, 59, 1, { mat: 'dungeon-slab' });
  b.room('Gallery of Faces', 2, 60, 11, 8, {
    mat: 'dungeon-slab',
    read: 'Mirrors. Dozens of them, propped against the walls, and in front of each a plaster face on a stick: the mayor, a river man, a steward, an old woman. Someone has been practising being them.',
    gm: 'The doppelgangers\' den. The three missing casts are here, with chalk notes ("the Stag laughs with her left cheek", "the Pike scratches his ear when he lies"). A cast of Harl Dask with "after midnight" chalked under it: proof the Moth means to replace Dask too. A diary in a stolen hand tells the plan (no handout needed; read the gist). One mirror is a secret door east (DC 13 Investigation: cold air behind it).',
    label: [7, 63],
  });
  b.door(8, 60, 'n', 'closed').hall(13, 63, 14, 63, 1, { mat: 'dungeon-slab' }).door(13, 63, 'w', 'secret');
  b.props_('mirror', [[3, 61], [6, 61], [11, 61], [3, 66]]).props_('plinth-display', [[5, 63], [9, 63], [7, 65]]).prop('magic-mirror', 11, 66).prop('writing-desk', 9, 66).prop('candelabra', 6, 64).prop('chest', 3, 64).light(6, 64, 5, 15, '#cfd8ff');
  b.hall(6, 68, 6, 70, 1, { mat: 'dungeon-slab' }).door(6, 71, 'n', 'closed');
  b.room('The Quiet Cells', 2, 71, 12, 7, {
    mat: 'dungeon-slab',
    read: 'Three old cells with rusted bars. In the dark, someone whispers: "Is it you? Is it really you this time?"',
    gm: 'Alive here: Wick (Odile\'s apprentice, taken because he saw the Moth leave the shop) and the real Bram Holloway (taken three days ago, weak, gagged). The doppelgangers keep them to read their thoughts each night, so their masks never slip. Two hired thugs and four mastiffs keep the cells. The thugs have the keys. A prisoner asks the heroes a question only the real Wick or Bram would know the answer to: a lovely moment to turn the tells around.',
    label: [7, 72],
  });
  b.wallRun(2, 75, 12, 'n', 'bars').wallRun(5, 75, 3, 'e').wallRun(9, 75, 3, 'e');
  b.door(3, 75, 'n', 'locked', 'bars').door(7, 75, 'n', 'locked', 'bars').door(11, 75, 'n', 'locked', 'bars');
  b.props_('straw-bed', [[3, 77], [7, 77], [11, 77]]).props_('wall-chains', [[4, 76], [8, 76]]).prop('stool', 10, 72).prop('table-cards', 4, 72).prop('key-ring', 5, 72).prop('lantern-hanging', 8, 73).light(8, 73, 5, 10);
  b.encounter('Keepers of the Quiet Cells', [2, 71, 12, 4], [['thug', 2], ['mastiff', 4]], 'low');
  b.hall(14, 72, 16, 73, 1, { mat: 'dungeon-slab' });
  b.room('Burial niches', 16, 73, 11, 6, {
    mat: 'dungeon-slab',
    read: 'Long shelves cut into the rock, each holding a wrapped shape. One wrapping is new, white linen, and a grey hare charm hangs from it.',
    gm: 'Odile Fenwick\'s body, laid out with odd care. The doppelganger kept her hare charm on: "a creature that wears faces still respects the face it took". Sister Ysolde will want to give her a proper rite. A narrow way north drops into the culvert water and the canal landing.',
  });
  b.props_('burial-slab', [[17, 74], [20, 74], [23, 74], [17, 77], [23, 77]]).prop('sarcophagus', 20, 77).props_('candles', [[25, 75], [19, 76]]).prop('urn', 25, 77).light(19, 76, 5, 10, '#d8e0ff');
  b.tunnel([[22, 72], [22, 70]], 1, { mat: 'dungeon-slab', seed: 44 });
  b.water(14, 66, 15, 5, false).water(17, 67, 12, 3, true);
  b.room('Canal landing', 15, 60, 13, 6, {
    mat: 'dungeon-slab',
    read: 'The river runs under the hill here through a black arch, the Old Throat, and laps at a stone landing. A rowboat is tied to an iron ring, and on its seat lies a silver moth mask.',
    gm: 'The Moth\'s escape route by water. Its spare mask here (Fennick\'s Silver Moth twin) proves the shopping trip. If the Moth flees here at the end, it rows for the river: two rounds of rowing to reach open water, where the heroes on the quay can cut it off.',
  });
  b.prop('rowboat', 21, 66, 90).props_('mooring-post', [[18, 65], [25, 65]]).prop('rope-coil', 16, 61).prop('crate', 26, 61).prop('lantern-standing', 22, 62).light(22, 62, 5, 10, '#ffd58a');
  b.tunnel([[25, 49], [25, 55], [23, 59]], 2, { mat: 'dungeon-slab', seed: 45 });

  b.note(30, 38, 'Start: the heroes are at the festival, in their own masks. Hob finds them here.');
  b.note(41, 25, 'At midnight: the Moth leads the mayor into the robing tent. Dask\'s men hide under the stage from the 11th bell.');
  b.start(30, 37, 3, 3);
  return b.build();
}

export const MARKET_OF_MASKS: Adventure = {
  id: 'market-of-masks',
  title: 'The Market of Masks',
  tagline: 'On the one night everyone wears a mask, a killer is wearing the Mask-Maker\'s face.',
  levels: '3',
  sessions: '1 session',
  players: '3-5 players',
  tags: ['one-shot', 'mystery', 'social', 'town', 'festival'],
  pitch:
    'Sorrel Hill is a little town on a river, and tonight is Veilnight. From sunset to the midnight bells everyone wears a mask, nobody may ask who you are, and the old Mask-Maker, Odile Fenwick, unmasks the new mayor on the stage at midnight for the town to cheer. You have your masks. You have a cup of hot cider. And a frightened lamplighter is pushing through the crowd toward you with blood on his hands.',
  secret:
    'A doppelganger who calls itself the Moth killed Odile Fenwick at the 9th bell and now walks the festival wearing her face, in a silver moth mask. A second doppelganger has been Bram Holloway, the mayor\'s steward, for three days. Their plan: at midnight the "Mask-Maker" leads Mayor Tamsin Hale into the robing tent for the last mask, the hidden thugs grab her, and the Moth walks out wearing the mayor\'s face to be cheered by the whole town. Why tonight: Veilnight is the one night nobody may look under a mask, and Odile, who made a plaster cast of every face in town, was the one person who would have spotted a fake. The river smuggler Harl Dask paid for the thugs because the new mayor wants to tax his trade, but the Moth plans to take his face next. The real Bram and Odile\'s apprentice Wick are alive in the catacombs under the hill.',
  hooks: [
    'Hob Tanner, the lamplighter, found blood and Odile\'s Grey Hare mask in her workshop. The watch laughed at him: "Odile\'s on the square, selling masks." He begs the heroes, strangers he can trust because they are strangers, to look.',
    'Sister Ysolde of the Temple of the Dove saw Odile pass the temple steps at the 9th bell in a strange mask, limping on the wrong leg, and asks the heroes, quietly, to find out what is wrong with her old friend.',
    'Mayor Tamsin Hale, nervous in her first month, quietly hires the heroes as extra eyes for the night. "Something is wrong in my own house, and I can\'t say what."',
  ],
  tips: [
    'Run it on a bell clock. Start at the 9th bell and a half. Each scene or long talk moves the clock on about half an hour. The 10th bell: the blessing and the maze meeting. The 11th bell: the lantern float, and Dask\'s men go under the stage. Midnight: the unmasking. Say the bells out loud.',
    'Three roads to the truth, and any one is enough: the trail (workshop, trapdoor, catacombs, the living victims), the alibis (two Brams at the 9th bell, a moth mask bought from Fennick), and the tells (test the Moth, catch Nib, turn Dask). Reward whatever the players try.',
    'The Moth reads surface thoughts. It answers questions the asker already knows the answer to, perfectly. Ask it something only the real Odile knew and the asker does not (what she called the mayor as a girl: "Little Thistle"; Hob or Ysolde can supply such questions) and it stalls, guesses, or changes the subject. Let clever players find this rule.',
    'The Moth\'s tells: it limps on the right leg (Odile limped on the left; it learned her from a mirror), it finishes your sentences, it will not eat the first honey-cake, it skipped the blessing, it wears Fennick\'s Silver Moth instead of the Grey Hare, and cats and dogs hate it.',
    'Veilnight law makes the crowd your obstacle: pulling off a mask before midnight brings the watch and an angry crowd. A public accusation without proof turns Captain Marsh against the heroes. With proof, she is their best ally.',
    'Fights are few and mostly avoidable. The climax is the only planned high fight, and it gets easier with every ally the heroes win: turn Dask and his four thugs never show; unmask the fake Bram early and the second doppelganger is gone; win Captain Marsh and her guards hold the crowd back.',
  ],
  npcs: [
    {
      id: 'pf_mmmoth', name: '"Odile Fenwick" (the Moth)', title: 'the Mask-Maker, or something wearing her', kind: 'monster', art: 'doppelganger', monsterId: 'doppelganger',
      wants: 'To wear the mayor\'s face and rule Sorrel Hill from inside it, then take Harl Dask\'s face and his river too.',
      knows: 'Everything anyone near it is thinking. Nothing that only the dead Odile knew.',
      voice: 'Odile\'s warm, cracked old voice, a little too smooth, like a song learned from a stranger. Finishes your sentences for you.',
      appearance: 'A small grey-haired woman in a paint-stained shawl and a silver moth mask, leaning on a stick. Its true shape is grey, thin and blank-eyed.',
      gmNotes: 'Doppelganger stat block. Tells: right-leg limp, finishes sentences, refuses the first honey-cake, missed the blessing, wrong mask, animals hate it. If exposed before midnight it runs: through the crowd, then to the canal landing or the Willow Bank to steal a boat into the Old Throat. It fights only when cornered, and likes to strike first from a borrowed face, while the target still thinks it is a friend.',
      backstory: 'It has worn eleven faces in eleven towns. Each time it chose someone people would never look at twice. A mayor is its most ambitious face yet.',
    },
    {
      id: 'pf_mmbram', name: '"Bram Holloway" (the Owl)', title: 'the mayor\'s steward, or the second face', kind: 'monster', art: 'noble', monsterId: 'doppelganger',
      wants: 'To keep the mayor calm and alone until midnight, and to get the heroes arrested.',
      knows: 'The house, the mayor\'s diary, and every thought of the real Bram, whom it visits each night in the cells.',
      voice: 'Dry, polite and very precise. Says "indeed" too often. Drinks ale now, which the real Bram never did.',
      appearance: 'A tall, stooped man in a sober coat and a brass owl mask, without the spectacles the real Bram cannot see without.',
      gmNotes: 'The surprise second doppelganger. It was at the Drunken Moon from the 8th to the 10th bell, building an alibi, while the Moth wore Bram\'s face to get into the workshop: so two Brams were seen at the 9th bell. When the heroes press, it sends Captain Marsh after them. Cornered, it drops the face and fights.',
    },
    {
      id: 'pf_mmtamsin', name: 'Tamsin Hale', title: 'the new mayor of Sorrel Hill', kind: 'npc', art: 'noble', shared: true,
      wants: 'To get through her first Veilnight without looking like a child, and to make the river traders pay their toll.',
      knows: 'Bram has been "cold" for three days and drank ale tonight; Bram never drinks. Odile was like a grandmother to her and called her "Little Thistle".',
      voice: 'Quick and bright, a little too formal, laughs when nervous.',
      appearance: 'A young woman with ink on her fingers and a white stag mask with silver antlers, a spare, not her good one.',
    },
    {
      id: 'pf_mmedda', name: 'Captain Edda Marsh', title: 'captain of the town watch', kind: 'npc', art: 'guard-captain', monsterId: 'veteran', shared: true,
      wants: 'A quiet Veilnight, with no blood and no strangers making trouble.',
      knows: 'Who was where, roughly, all night: her guards walk in pairs and report every hour.',
      voice: 'Flat and slow, a soldier\'s voice. Calls everyone "friend" in a way that is not friendly.',
      appearance: 'A broad grey-haired woman in a dented breastplate and an iron boar mask pushed up on her head.',
      gmNotes: 'Veteran stat block. Starts neutral. The fake Bram turns her against the heroes. Evidence turns her back (DC 13 Persuasion with one clue, DC 10 with two). Won over, she brings four guards to the stage at midnight.',
    },
    {
      id: 'pf_mmdask', name: 'Harl Dask', title: 'river smuggler, owner of the Black Pike', kind: 'npc', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'No river toll, ever. And, once he knows, not to have his face stolen.',
      knows: 'He paid the thugs and lent the "Mask-Maker" his men for midnight. He thinks the plan is to scare the mayor into dropping the toll.',
      voice: 'A rumbling river voice, full of jokes. Scratches his ear when he lies.',
      appearance: 'A huge man in a fur-collared coat and a black pike mask with real teeth set in it.',
      gmNotes: 'Bandit captain stat block. A villain who can be turned: show him the cast of his face chalked "after midnight" and he goes pale, calls off his men and hands over the Moth\'s letter. He wants a pardon for his trouble.',
    },
    {
      id: 'pf_mmysolde', name: 'Sister Ysolde', title: 'priestess of the Temple of the Dove', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'Odile found safe. Failing that, Odile laid properly to rest.',
      knows: 'Odile has come first to the blessing for forty years, in her Grey Hare. Odile limped on her left leg and loved honey-cakes.',
      voice: 'Soft and slow, and suddenly sharp. Quotes old sayings about doves.',
      appearance: 'A tall old woman in white, with a simple white dove mask and very cold hands.',
      gmNotes: 'Priest stat block, an ally. She can heal one hero, and will stand on the stage at midnight if asked. She can suggest questions only the real Odile could answer.',
    },
    {
      id: 'pf_mmfennick', name: 'Fennick Sallow', title: 'a rival mask-seller', kind: 'npc', art: 'merchant', shared: true,
      wants: 'To be the town\'s Mask-Maker one day, and for everyone to admit his masks are better.',
      knows: 'He sold a Silver Moth mask to "Odile" at the 9th bell and a half. Odile would never wear his work. He also sells smuggled lacquer from Dask, which is why he lies about his evening at first.',
      voice: 'Whiny, boastful and quick, with a sniff after every sentence.',
      appearance: 'A thin man in a crow mask of black feathers he made himself, with very clean, very nervous hands.',
      gmNotes: 'The red herring. He had a loud fight with Odile last week and hates her, so he looks guilty. He lies about where he was (with Dask, buying lacquer) until caught, then tells the truth: he has been at the Drunken Moon since the 10th bell, and before that at the Black Pike. He sold the moth mask. "She bought one of MY masks. Odile would sooner die." She did.',
    },
    {
      id: 'pf_mmhob', name: 'Hob Tanner', title: 'the lamplighter', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Someone to believe him.',
      knows: 'At the 9th bell he saw Bram the steward walk into the workshop with Odile. Only Odile came out, in a moth mask, limping wrong. He found the blood and the Grey Hare an hour later.',
      voice: 'Stammers when scared, which is now. Very polite. Calls the heroes "sirs and madams".',
      appearance: 'A skinny young man with a long lamp-pole, a soot-smudged face and a paper sun mask.',
    },
    {
      id: 'pf_mmwick', name: 'Wick', title: 'the Mask-Maker\'s apprentice', kind: 'npc', art: 'child',
      wants: 'Out. And then to see the Moth hang.',
      knows: 'He saw the Moth leave the shop wearing Odile\'s face and followed it down the trapdoor. He knows where the coffer key is (on a string round his neck) and that there are two of them.',
      voice: 'Fourteen, fierce, and trying very hard not to cry.',
      appearance: 'A small boy with plaster in his hair and bloody knuckles from the bars.',
    },
    {
      id: 'pf_mmnib', name: 'Nib', title: 'the Moth\'s imp messenger', kind: 'monster', art: 'imp', monsterId: 'imp',
      wants: 'Freedom from its master, and something shiny.',
      knows: 'The whole midnight plan, word for word. It carries notes between the Moth and the Owl.',
      voice: 'Squeaky, oily, grovelling. Laughs at its own jokes.',
      appearance: 'Usually a scruffy raven with a scroll tube on one leg. In its own shape, a red imp the size of a cat.',
      gmNotes: 'Imp stat block. Caught, it bargains: its life and a silver spoon for the note and the plan. It will happily betray the Moth, then try to steal from the heroes.',
    },
  ],
  handouts: [
    {
      id: 'order-book', title: 'Odile\'s order book (Veilnight masks)',
      text: 'Masks for Veilnight, this year:\nMayor Tamsin Hale: the White Stag (her good one; Thistle is so proud).\nSteward Bram Holloway: the Brass Owl.\nCapt. Edda Marsh: the Iron Boar, as ever.\nHarl Dask: the Black Pike. Paid late. Paid in river silver.\nSister Ysolde: the Dove.\nLio Brightwater: the Red Fox.\nFennick Sallow: none. Makes his own. Badly.\nMyself: the Grey Hare. Always.\n\nLast entry, today: 9th bell. B.H. wants the Stag\'s mask let out. Odd: Thistle\'s head hasn\'t grown. And Bram is wearing his spectacles in his pocket. Must ask Wick for more plaster.',
    },
    {
      id: 'nib-note', title: 'A note from a raven\'s scroll tube',
      text: 'Owl,\nThe Stag goes into the tent at the last bell. I come out wearing her. You stand at my right hand and weep with joy.\nKeep the Boar busy with the strangers. Tell her they did the old woman.\nThe Pike\'s men go under the boards at the eleventh bell.\nFeed the two below tonight. I need the boy\'s memories one more day.\n- M.',
    },
    {
      id: 'moth-letter', title: 'A letter in Dask\'s desk',
      text: 'Master Dask,\nOur bargain stands. Four men under the stage at the eleventh bell, and the river toll dies with the old mayor\'s nerve. Your silver is in the usual place.\nDo not come looking for me. I will come to you. After midnight.\n- The Mask-Maker',
    },
    {
      id: 'cell-scratches', title: 'Scratched into the wall of a cell',
      text: 'THERE ARE TWO\nONE IS BRAM ONE IS ODILE\nNEITHER IS\nask them a thing you dont know yourself\n- W.',
    },
  ],
  chapters: [
    {
      id: 'veilnight', title: 'Veilnight in Sorrel Hill', level: 3,
      summary: 'A one-night murder mystery at a masked festival: a murdered Mask-Maker, two shapeshifters, a smuggler, a crowd of suspects and the living victims under the hill, all racing the midnight bells.',
      goal: 'Find out who is wearing Odile\'s face, rescue the living victims, and stop the swap at the midnight unmasking.',
      map: sorrelHill,
      npcs: [
        { npc: 'pf_mmhob', x: 33, y: 38 },
        { npc: 'pf_mmmoth', x: 40, y: 26 },
        { npc: 'pf_mmtamsin', x: 45, y: 33 },
        { npc: 'pf_mmbram', x: 72, y: 10 },
        { npc: 'pf_mmedda', x: 46, y: 51 },
        { npc: 'pf_mmdask', x: 75, y: 55 },
        { npc: 'pf_mmysolde', x: 39, y: 4 },
        { npc: 'pf_mmfennick', x: 66, y: 28 },
        { npc: 'pf_mmwick', x: 7, y: 77, hidden: true },
        { npc: 'pf_mmnib', x: 72, y: 45, hidden: true },
      ],
      scenes: [
        {
          room: 'Festival square', title: 'Blood on the hare',
          read: 'Drums, laughter and the smell of honey-cakes. A young man with a lamp-pole shoves through the dancers, grabs your sleeve and holds up a grey hare mask. It is sticky with blood. "She never takes it off," he whispers. "Never, not on Veilnight."',
          gm: 'Hob Tanner gives the hook (see his profile). It is the 9th bell and a half: two and a half hours to midnight. CLUE LIST (any three lead to the truth): 1. the bloody Grey Hare and blood under the counter (workshop); 2. three missing face-casts: mayor, Dask, Bram (casting room); 3. the order book: "B.H., 9th bell" (handout); 4. Hob saw Bram go in with Odile, only "Odile" came out, limping wrong; 5. Lio swears Bram drank at the Drunken Moon from the 8th to the 10th bell, and the mayor says Bram never drinks: two Brams; 6. Fennick sold "Odile" a Silver Moth at the 9th bell and a half; 7. the Moth\'s tells (see tips); 8. Nib\'s note (rooftops); 9. the Moth\'s letter (Dask\'s desk); 10. the trapdoor to the catacombs, the Gallery of Faces and the living victims.',
        },
        {
          room: "Mask-Maker's workshop", title: 'The scene of the crime',
          read: 'A hundred painted faces watch you come in. The shop smells of glue, paint and something coppery. On the top shelf, a fat orange cat stares at you and does not blink.',
          gm: 'Blood under the counter (DC 10 Medicine: a heavy blow, about three hours ago). The order book on the counter (handout). In the casting room: three missing casts, the long grey handprint on the mirror (DC 13 Investigation), and the hidden trapdoor (DC 13 Perception). Pudding the cat will later hiss at the Moth if anyone carries it near. A hero can follow the trapdoor now (go to "Under the hill") or save it for later.',
          handout: 'order-book',
          treasure: 'Odile\'s strong coffer: a hat of disguise (a velvet half-mask that works as one), 30 gp, and her tools (a set of painter\'s supplies).',
        },
        {
          room: 'The stage', title: 'The lady in the moth mask',
          read: 'On the stage, a little old woman in a silver moth mask is hanging masks on strings, humming. She turns before you speak. "Ah, more guests! You\'ll want to ask about..." and she says exactly what you were about to ask.',
          gm: 'Meet the Moth. It is warm, grandmotherly and helpful, and blames the blood on "a clumsy apprentice and a broken jar". Watch for tells: the right-leg limp (DC 13 Perception, or automatic for Hob or Ysolde), finishing sentences (DC 12 Insight), the wrong mask. Questions the asker knows the answer to, it answers perfectly. Questions the asker does not know ("What did you call the mayor as a girl?") it cannot answer. If it feels suspected, it smiles and tells the fake Bram, who sets the watch on the heroes.',
        },
        {
          room: 'Ropewalk Alley', title: 'A warning in the dark',
          encounter: 'Thugs in Ropewalk Alley',
          read: 'The last lantern in the alley goes out with a hiss, and four big shapes step out of the doorways. They wear hoods, not masks. "The old woman\'s business is finished," one says. "So is yours."',
          gm: 'Dask\'s hired thugs, sent by the Moth after the heroes leave the workshop. They want to scare, not kill: they run when two drop, or if the heroes shout for the watch (a crowd comes in 2 rounds). A captured thug talks: a lady in a silver moth mask paid them in new river silver, and more of them are going "under the stage" later.',
          treasure: 'New silver pennies stamped with the river toll mark: 18 gp in all.',
        },
        {
          room: 'The Drunken Moon', title: 'Alibis at the Drunken Moon',
          read: 'The tavern is so loud you have to shout. A man in a red fox mask pours four ales before you order. "You look like questions," he says. "Questions are thirsty work."',
          gm: 'Lio Brightwater: Bram sat at the corner table from the 8th to the 10th bell and drank three ales. Fennick Sallow brags and lies, then (DC 12 Insight to catch the lie, DC 12 Intimidation or Persuasion to crack him) admits he sold "Odile" a Silver Moth at the 9th bell and a half, and spent the early evening at the Black Pike buying smuggled lacquer. Lio\'s hound growls at nobody here now, but will growl at the Moth or the Owl. The cook saw a raven with a scroll tube go up the yard ladder to the roofs.',
        },
        {
          room: 'Temple of the Dove', title: 'The missed blessing', optional: true,
          read: 'Candlelight, rosewater and the soft burble of sleeping doves. A tall woman in white turns from the altar. "You are not from here. Good. I need eyes that don\'t already know what they will see."',
          gm: 'Sister Ysolde: Odile missed the 10th-bell blessing, first time in forty years. Odile limped on the LEFT. She loved honey-cakes. Ysolde gives the heroes a question to ask: "What was the name of your first mask?" (a hare called Biscuit). From the bell loft, the heroes can watch the square for an hour with advantage on Perception.',
        },
        {
          room: 'Maze heart', title: 'Whispers in the maze', optional: true,
          read: 'Lanterns bob along the hedges. Somewhere ahead, two voices: an old woman\'s, and a deep river rumble. "Midnight," says the old woman. "Under the boards. And then, my dear Harl, everything changes."',
          gm: 'At the 10th bell. Hiding is hard because the Moth reads thoughts (see the area notes). Overheard: the stage plan. Dask sounds unhappy. If spotted, the Moth laughs and walks away; Dask threatens, then leaves. Either way Dask is shaken and easier to turn later (+2 on the check).',
        },
        {
          room: "Rooftops of Chandlers' Row", title: 'Over the rooftops', optional: true,
          encounter: 'Nib on the rooftops',
          read: 'A raven sits on a chimney with a little scroll tube on its leg. It sees you, says a very rude word, and takes off across the roofs.',
          gm: 'The chase: three DC 12 Acrobatics or Athletics checks to keep up (a failure costs 1d6 falling damage and a round). The hired spy by the chimney tries to trip and delay the heroes, then flees. Catch Nib (grapple, or bring it to 0 hit points or near it) and it bargains for its life with the note.',
          handout: 'nib-note',
          treasure: 'The spy\'s purse: 12 gp and a potion of healing. Nib has stolen a silver spoon (2 gp).',
        },
        {
          room: 'Black Pike warehouse', title: 'The Black Pike',
          encounter: "The Black Pike's crew",
          read: 'Three unmasked men stop their dice game. A huge man in a toothed pike mask spreads his arms. "Veilnight guests! In my humble store! Close the doors, lads, they\'ll catch a chill."',
          gm: 'Harl Dask. He blusters, then threatens. He turns (DC 12 Persuasion, +2 if he was overheard in the maze, automatic if shown his own cast from the Gallery of Faces or Nib\'s note): he calls off the four men under the stage and gives up the Moth\'s letter. Fight, and he surrenders at half his hit points.',
          handout: 'moth-letter',
          treasure: 'Dask\'s strongbox: 150 gp in river silver and a +1 dagger with a pike-head pommel. Smuggled brandy worth 50 gp, if anyone wants to carry it.',
        },
        {
          room: "Steward's study", title: 'The Owl at home',
          encounter: 'The Owl unmasked',
          read: 'The steward rises from his desk and bows. "Indeed. The mayor is not receiving. Indeed." He has no spectacles on, but reads the letter in front of him perfectly well.',
          gm: 'The second doppelganger. Tells: no spectacles (the real Bram is nearly blind; the specs are in the drawer), the ale, and he does not know the house cat\'s name. If accused with proof, he drops his face and fights with the kitchen thug; at half hit points he tries to flee through the study window. If he gets away, he sends Captain Marsh after the heroes (use "The watch turns", talkable as in the watch house notes) and shows up at the climax.',
          treasure: 'The real Bram\'s spectacles and the key ring with the catacomb key. The mayor\'s thanks: 120 gp from her household purse, after.',
        },
        {
          room: 'The Quiet Cells', title: 'Under the hill',
          encounter: 'Keepers of the Quiet Cells',
          read: 'The air goes cold and still. Past walls of bones and a room of mirrors full of borrowed faces, you hear chains, a dog\'s low growl, and a boy\'s voice in the dark: "Is it you? Is it really you this time?"',
          gm: 'The catacombs: in by the workshop trapdoor, the Chapel of Bones or a boat through the Old Throat. Swarms in the bone gallery (avoidable, see area notes), the Gallery of Faces (proof: the casts, the chalk notes, Dask\'s cast marked "after midnight"), the cells (two thugs and four mastiffs), and Odile\'s body in the burial niches. Wick and the real Bram are alive. Bringing either up to the square is the surest proof there is.',
          handout: 'cell-scratches',
          treasure: 'In the Gallery of Faces chest: a ring of mind shielding (the Moth took it off a past victim and could not use it), 60 gp of Odile\'s silver, and Wick\'s coffer key.',
        },
        {
          room: 'The stage', title: 'The midnight unmasking',
          encounter: 'The midnight unmasking',
          read: 'The bells begin. One. Two. The crowd roars. On the stage, the little old woman in the moth mask takes the mayor\'s hand and leads her toward the tent. Three. Four. Under your feet, the boards creak where nobody is standing.',
          gm: 'The climax, as the twelve bells ring (one per round). In the tent the Moth tries to knock the mayor out and swap. Full fight: the Moth, a spy and Dask\'s four thugs from under the stage (high). Drop the thugs if Dask was turned; add the Owl if he is still free (deadly: let Captain Marsh and her guards take him on if she is an ally). A hero who exposes the Moth to the crowd (bring out Wick or Bram, or make it fail a question on stage) turns the crowd: the Moth loses its nerve and runs for the canal landing. On the twelfth bell, the mayor unmasks, alive and herself.',
          treasure: 'The town\'s thanks: 200 gp from the mayor, free drinks at the Drunken Moon forever, and a mask made for each hero by Wick, the new Mask-Maker.',
        },
      ],
      wrapUp: 'The twelfth bell rings, the real mayor lifts her mask, and the town cheers without knowing how close it came. At dawn, Sorrel Hill buries Odile Fenwick with her Grey Hare on, and Wick takes over the workshop. The heroes are the only people in town who are never again asked to wear a mask.',
    },
  ],
  ending:
    'Success: the Moth is dead or driven into the river, the Owl is unmasked, Wick and Bram are saved, and Mayor Tamsin Hale owes the heroes her life. Dask, if he turned, is pardoned and pays his toll with very bad grace. Failure: if the swap happens, the "mayor" thanks the heroes warmly at midnight and has them arrested at dawn for Odile\'s murder. They can still break out, find the living victims under the hill and unmask the false mayor before the town council, but now the whole watch hunts them. What\'s next: the Moth (if it fled) has worn eleven faces in eleven towns. In its den is a list of the next three, and one of them is a face the heroes know.',
};
