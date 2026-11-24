// The Lantern Saints of Skerrow: a one-night ghost story for four heroes of level 4.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** Paint a winding street along a list of points (outdoors, where there is ground already). */
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

/**
 * A cliff face running across the town: a band of rock with a ragged edge, cut through only
 * where a stair street climbs it. Gaps are [x, width, floor material].
 */
function cliff(b: MapBuilder, x0: number, x1: number, y: number, thick: number, up: number, down: number, seed: number, gaps: [number, number, string][]) {
  const r = rng(seed);
  for (let x = x0; x <= x1; x++) {
    const u = r() < up ? 1 : 0, d = r() < down ? 1 : 0;
    b.rock(x, y - u, 1, thick + u + d);
  }
  for (const [gx, gw, mat] of gaps) b.floor(gx, y - 1, gw, thick + 2, mat);
}

function skerrow() {
  const b = new MapBuilder('adv-lantern-saints', 'Skerrow on the Night of Lanterns', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  const r = rng(4417);
  const WARM = '#ffb35c', GHOST = '#bfe6ff', COLD = '#8fa6c8';

  // ---------- the land: the headland, the cliff faces between the terraces, the sea ----------
  b.rock(0, 0, 80, 1);
  for (let y = 1; y < 20; y++) b.rock(0, y, 1 + (r() < 0.45 ? 1 : 0), 1); // the headland's sea-cliff edge
  b.rock(0, 20, 23, 2); // the headland drops away below the graveyard
  b.rock(0, 22, 25, 17); // solid headland above the upper town
  b.rock(0, 39, 21, 33); // solid headland above the lower town and the harbour (the sea caves are cut into it)
  b.rock(23, 6, 7, 19); // the rock spine the abbey stands on (the crypt is cut into it)
  cliff(b, 30, 79, 22, 3, 0, 0.35, 11, [[44, 3, 'stone-flagstone'], [73, 2, 'dirt']]);
  cliff(b, 21, 79, 39, 3, 0.3, 0.3, 12, [[30, 2, 'stone-flagstone'], [47, 3, 'stone-flagstone'], [76, 2, 'dirt']]);
  cliff(b, 21, 79, 57, 3, 0.3, 0.3, 13, [[26, 2, 'stone-flagstone'], [44, 3, 'stone-flagstone'], [68, 4, 'dirt']]);

  // ---------- under the headland: the crypt, the smugglers' stair and the sea caves ----------
  b.room('Crypt of the Keepers', 24, 11, 6, 7, {
    mat: 'dungeon-slab',
    read: 'Low vaults cut into the living rock. Monks in stone lie on their tombs with their hands folded, and every one of them is holding a little stone lantern.',
    gm: 'The tombs of the abbey\'s sacristans. The secret door is in the south wall behind the last tomb (DC 14 Perception; DC 10 if the heroes noticed the drips of lantern wax that lead to it, or the cold draught). Behind it the smugglers\' stair winds down through the headland to the sea caves. After the 10th bell Hesketh and his wardens may wait here in the dark to catch the thief (see The Sacristan\'s wardens).',
  });
  b.props_('sarcophagus-effigy', [[25, 12], [28, 12], [25, 15], [28, 15]]).prop('ossuary-shelf', 24, 11).prop('tomb-niche', 29, 11).prop('candle-stand-tall', 27, 13).prop('stairs-up', 29, 14).prop('cobweb-corner', 24, 17).prop('gm-secret-door', 25, 17, 0, { gm: true });
  b.light(27, 13, 5, 10, WARM);
  b.door(25, 17, 's', 'secret');
  b.tunnel([[25, 18], [25, 20]], 1, { mat: 'cave-floor', seed: 21 });
  b.tunnel([[25, 20], [22, 22], [18, 26], [16, 28]], 2, { mat: 'cave-floor', seed: 22 });
  b.area("Smugglers' stair", [[18, 20, 9, 8]], {
    read: 'Steps worn into a spiral by two hundred years of boots. Every few turns someone has set a stub of candle in a crack in the wall.',
    gm: 'Cut by brandy runners long before the abbey; the first abbot walled it up and Sister Tegan opened it again. Her candle stubs are fresh (lit within the hour after the 11th bell). It takes ten minutes to climb from the caves to the crypt.',
    label: [22, 23],
  });
  b.props_('stairs-down', [[25, 20], [19, 25]]).props_('candles', [[24, 21], [17, 27]]);

  // the abbot's own way, from his tomb in the graveyard
  b.tunnel([[8, 20], [8, 22]], 1, { mat: 'cave-floor', seed: 23 });
  b.tunnel([[8, 22], [11, 26], [12, 29]], 2, { mat: 'cave-floor', seed: 24 });
  b.prop('stairs-down', 9, 23);

  b.cave('The bone stair', 14, 31, 4.5, 3.5, {
    seed: 25, mat: 'cave-floor',
    read: 'Two stairs meet in a cave of dripping stone. Old bones lie in heaps along the walls, still wrapped in rotten oilskins, and a skull grins from a niche with a coin in its teeth.',
    gm: 'Smugglers who were walled in when the first abbot sealed the stair. The Keeping raised them as door-wardens. They do not attack anyone who carries one of Tegan\'s lanterns or a reliquary; to anyone else they rise when a living hand touches the floor of the cave. The narrow shaft in the floor drops 20 feet to the grotto tunnel (2d6 bludgeoning, DC 12 Acrobatics halves). Under the bones: the purse of a dead smuggler.',
  });
  b.rubble(11, 29, 2, 2).pit(16, 33, 2, 1);
  b.props_('bone-heap', [[11, 31], [17, 29]]).prop('skull-pile', 15, 28).prop('skeleton-seated', 16, 30).prop('coins-small', 12, 33).prop('stalactites', 14, 30);
  b.encounter('The bone stair', [10, 27, 9, 8], [['skeleton', 8], ['swarmOfRats', 2]], 'low');
  b.tunnel([[13, 34], [11, 38], [10, 42]], 2, { mat: 'cave-floor', seed: 26 });

  b.cave('Lantern Grotto', 10, 47, 6.5, 5, {
    seed: 27, mat: 'cave-floor',
    read: 'A sea cave like a chapel. Seven lanterns hang from an iron hoop over a little boat, and four silver caskets sit in the boat with flowers tied around them. Somewhere below, the sea breathes in and out.',
    gm: 'The oldest shrine in Skerrow, older than the abbey: the fishers prayed here, and the seven saints with them, when they were alive. Tegan hides the stolen reliquaries in the boat. At the midnight turn of the tide she means to pull each saint\'s silver nail, sing the hymn with their names, and push the boat out on the ebb through the Landing and the cave mouth into the sea of lanterns. This is where the Abbot\'s ghost and the Hollow Brothers rise to stop it.',
  });
  b.pool(10, 50, 3.5, 2, true);
  b.prop('rowboat', 10, 50).prop('candle-hoop', 10, 48).props_('reliquary', [[9, 49], [11, 49]]).prop('road-shrine', 6, 44).prop('offering-bowl', 7, 45).props_('candles', [[13, 44], [5, 48]]).prop('flowers', 12, 45).prop('lantern-standing', 15, 47);
  b.light(10, 48, 15, 20, GHOST).light(6, 44, 5, 10, WARM);
  b.encounter("The Abbot's Keeping", [3, 42, 14, 11], [['ghost', 1], ['specter', 4]], 'high');
  b.tunnel([[10, 52], [11, 57]], 2, { mat: 'cave-floor', seed: 28 });
  b.water(10, 53, 2, 4, false, true);

  b.cave("Smugglers' Landing", 11, 61, 7, 3.8, {
    seed: 29, mat: 'cave-floor',
    read: 'Lamplight, the smell of tar and brandy, and three low boats pulled up on a shingle shelf. A grey-bearded man with a pipe looks up from a card game and does not seem surprised to see you.',
    gm: 'Jago Kettlewell\'s crew runs brandy past the harbour dues. They are blamed for the thefts and know it. They fight only if attacked or if the heroes come in with Lantern Wardens. Bargain: clear their name with the Prior, or pay 30 gp, and Jago tells all he knows (see his profile) and lends a boat. DC 14 Persuasion or Intimidation also works, and DC 12 if the heroes saved Saint Lowenna on the beach (Jago\'s mother sang her hymns).',
  });
  b.props_('rowboat', [[7, 63], [14, 64]]).prop('barrel-stack', 6, 59).props_('crate-stack', [[16, 59], [16, 61]]).prop('table-cards', 11, 60).props_('stool', [[10, 59], [12, 59]]).prop('lantern-hook', 13, 58).prop('fishing-net', 5, 61).prop('campfire', 9, 62);
  b.light(13, 58, 10, 15, WARM).light(9, 62, 10, 15, WARM);
  b.encounter("Kettlewell's crew", [4, 57, 15, 9], [['banditCaptain', 1], ['bandit', 4], ['thug', 1]], 'low');
  b.tunnel([[16, 58], [17, 55]], 1, { mat: 'cave-floor', seed: 30 });
  b.cave('Brandy hole', 17, 53, 2.5, 2, {
    seed: 31, mat: 'cave-floor',
    gm: 'The crew\'s hidden store: nine casks of good brandy (30 gp each, but heavy) and a strongbox (DC 13) with the crew\'s pay. Kitto Roe sleeps here some nights. He has scratched seven little lanterns on the wall and crossed out four.',
  });
  b.props_('barrel-group', [[16, 52], [18, 53]]).prop('strongbox', 17, 54).prop('bedroll', 16, 54);
  b.cave('Sea cave mouth', 11, 67, 6, 2.5, {
    seed: 32, mat: 'cave-floor',
    read: 'The cliff opens like a mouth onto the sea. Out on the black water, thousands of tiny lights are drifting slowly away from the town.',
    gm: 'Boats come and go here at any tide. A hero can wade along the cliff foot to the harbour beach at low water (the tide-path), or swim it at high water (DC 10 Athletics).',
  });
  b.prop('mooring-post', 14, 66).prop('rope-coil', 8, 66).prop('anchor', 6, 68);
  b.floor(15, 67, 7, 2, 'sand');
  b.area('Tide-path', [[15, 67, 7, 2]], {
    gm: 'A shingle ledge along the cliff foot from the harbour beach to the sea caves, under water for an hour either side of high tide. Small wet boot prints (Kitto\'s) and drips of candle wax lead this way (DC 12 Survival).',
    label: [18, 67],
  });
  b.prop('puddle', 19, 68);

  // ---------- the sea, the beach and the quay ----------
  b.water(0, 70, 80, 3, false).water(0, 73, 80, 7, true);
  b.paint(21, 60, 59, 6, 'stone-cobble').paint(21, 66, 59, 4, 'sand');
  b.mud(38, 67, 4, 2).mud(63, 68, 3, 2);
  b.floor(46, 66, 4, 12, 'wood-planks').floor(34, 66, 2, 8, 'wood-planks');
  b.area('Lantern Quay', [[46, 62, 4, 16]], {
    read: 'The long stone quay ends in a wooden pier crowded with people holding paper lanterns. One by one they kneel, whisper a name, and set a lantern on the water.',
    gm: 'Where the town floats its lanterns at midnight. From the pier end the heroes can see the cave mouth under the headland. A boat from here reaches the grotto in five minutes. If the saints go free, this is where the town watches seven bright lights rise out of the drifting lanterns.',
    label: [47, 70],
  });
  b.props_('lantern-cluster', [[46, 67], [49, 70], [46, 74]]).props_('mooring-post', [[49, 66], [46, 77]]).prop('crate-pile', 48, 64).prop('lamp-post', 47, 62).prop('rowboat', 51, 72, 90).prop('canoe', 43, 74, 90);
  b.light(46, 67, 10, 15, WARM).light(49, 70, 10, 15, WARM).light(46, 74, 10, 15, WARM).light(47, 62, 15, 20, WARM);
  for (let i = 0; i < 14; i++) {
    const x = 22 + Math.floor(r() * 56), y = 71 + Math.floor(r() * 8);
    if (x < 45 || x > 50) b.light(x, y, 0, 5, '#ffcf7a');
  }
  b.area('Fish market', [[23, 60, 14, 6]], {
    read: 'Lantern-sellers have pushed the fish stalls aside for one night. Paper lanterns in every colour hang from the awnings, and the smell of fried sprats mixes with hot wax.',
    gm: 'Lantern Wardens (hired thugs in the abbey\'s white sashes) are turning out a stall that buys brandy from the smugglers, and shoving the pilgrims. A DC 13 Persuasion or Intimidation moves them on; an insult starts a brawl. On the beach below, Saint Lowenna\'s ghost kneels mending a net that is not there.',
    label: [29, 62],
  });
  b.props_('market-stall', [[24, 61], [28, 61], [32, 61]]).props_('fish-crate', [[25, 64], [29, 64], [33, 64]]).prop('produce-stall', 36, 61).prop('barrel-group', 23, 64).prop('lantern-cluster', 30, 63).prop('cooking-pot-fire', 35, 64).prop('lamp-post', 27, 65);
  b.light(30, 63, 10, 20, WARM).light(27, 65, 15, 20, WARM).light(35, 64, 5, 10, '#ff8a3c');
  b.encounter('Wardens at the fish market', [23, 59, 15, 8], [['thug', 5], ['mastiff', 2]], 'low');
  b.area('Mending beach', [[21, 66, 24, 4]], {
    read: 'Below the market the shingle is quiet. A woman made of pale light kneels at the water\'s edge, her hands moving as if she is mending a net, and she is singing under her breath.',
    gm: 'Saint Lowenna of the Nets, stolen on the second night. She fed the town through the hungry winter and still thinks it is that winter. She cannot hear the living until a hero helps with the "net" (hands moving with hers) or sings along with her (DC 12 Performance). Then she says: "The little Sister is taking us home. Don\'t let the Brothers catch her." Hollow Brothers may come for her later in the night.',
    label: [27, 68],
  });
  b.props_('fishing-net', [[27, 67], [24, 68]]).prop('fishing-gear', 31, 67).prop('canoe', 22, 69).prop('rowboat', 36, 71, 30).prop('lily-pads', 40, 71);
  b.light(27, 67, 5, 10, GHOST);

  b.building('Boat sheds', 54, 61, 12, 7, {
    mat: 'wood-planks',
    read: 'A long shed smelling of pine shavings and pitch. A half-built boat sits on trestles, and next to it a pale old man is planing a plank that is not there, again and again.',
    gm: 'Saint Pascoe the Boatwright, who rowed out nine times in the Black Gale. He is kind and very tired. If a hero hands him a real plank or tool, he looks up and sees them: "She asked me for a boat for seven. I made her one, when I was alive. Is it ready?" A loose board by the door (DC 12) hides Jago\'s rainy-day money.',
    doors: [[59, 61, 'n', 'closed', 'door-double'], [60, 61, 'n', 'closed', 'door-double'], [60, 67, 's', 'open']],
    windows: [[54, 64, 'w'], [65, 63, 'e']],
  });
  b.props_('sawhorse', [[57, 64], [62, 64]]).prop('rowboat', 59, 64).prop('workbench', 55, 62).prop('tool-wall', 64, 62).prop('debris-wood', 63, 66).prop('ship-mast', 56, 66).prop('anchor', 64, 65);
  b.light(59, 64, 5, 10, GHOST).light(55, 62, 5, 10, WARM);
  b.building('Old harbour light', 74, 62, 5, 6, {
    mat: 'stone-flagstone',
    read: 'A squat stone tower at the end of the quay. Its beacon has been dark for years. Somebody has made a nest of blankets at the top of the stair.',
    gm: 'Kitto Roe keeps watch here for Sister Tegan: from the top he can see the cave mouth and the abbey both. He runs if anyone in a white sash comes near. A kind word, food, or Tegan\'s name (DC 10 Persuasion) gets him talking.',
    doors: [[74, 64, 'w', 'closed']], windows: [[76, 62, 'n'], [78, 65, 'e']],
  });
  b.prop('stair-spiral', 77, 63).prop('telescope', 76, 66).prop('bedroll', 75, 63).prop('brazier', 77, 66).prop('lantern-hanging', 75, 65);
  b.light(75, 65, 5, 10, WARM);
  b.props_('mooring-post', [[30, 65], [53, 65], [70, 65]]).props_('cargo-crates', [[40, 61], [67, 62]]).prop('barrel', 42, 63).prop('handcart', 71, 61).prop('lamp-post', 39, 64).prop('fishing-net', 68, 67);
  b.light(39, 64, 15, 20, WARM);

  // ---------- the lower town: the inn and the festival square ----------
  b.props_('stairs-down', [[26, 58], [45, 58], [69, 58]]);
  b.area('Net Steps', [[26, 56, 2, 5]], { gm: 'A steep, narrow stair from Lamplighters\' Lane down to the fish market. The quickest way for anyone fleeing the inn.', label: [26, 57] });
  b.area('Quay Stair', [[44, 56, 3, 5]], { read: 'Wide steps run down to the harbour, and every step has a lantern on it.', gm: 'The procession comes down here at midnight to float the lanterns.', label: [45, 57] });
  b.props_('lantern-standing', [[44, 59], [46, 57]]);
  b.light(44, 59, 5, 10, WARM).light(46, 57, 5, 10, WARM);
  lane(b, [[21, 55], [35, 55], [44, 55]], 2, 'stone-cobble');
  lane(b, [[61, 50], [65, 52], [69, 55]], 2, 'stone-cobble');
  lane(b, [[76, 42], [76, 46], [72, 52], [70, 55]], 2, 'dirt');

  b.building('The Kneeling Gull', 22, 45, 12, 9, {
    mat: 'wood-planks',
    read: 'Every bench is full. Pilgrims in grey cloaks sleep sitting up, sing hymns, argue over fried bread and trade gossip about ghosts. Over the bar hangs a painted board of seven saints holding seven lanterns.',
    gm: 'Loveday Quiller\'s inn, and the best place for rumours. Roll or pick one per round of drinks: (1) "Four reliquaries gone in four nights, one a night, and a ghost walks after each." (2) "A grey pilgrim with a lantern was seen by the abbey wall every night of the thefts." (3) "The Wardens arrested a lantern-pedlar called Odo. He cried all night." (4) "The smugglers did it. Everyone knows Kettlewell." (5) "Sister Tegan bought a whole cartload of flowers. Who needs that many flowers?" (6) "My gran says the saints never wanted to stay."',
    doors: [[30, 45, 'n', 'closed'], [33, 48, 'e', 'closed', 'door-double'], [25, 53, 's', 'closed']],
    windows: [[26, 45, 'n'], [22, 47, 'w'], [33, 51, 'e']],
  });
  b.wallRun(22, 50, 12, 's').door(24, 50, 's', 'open').door(31, 50, 's', 'closed').wallRun(27, 51, 3, 'e');
  b.prop('bar-counter', 23, 47).prop('keg-rack', 23, 49).prop('fireplace', 28, 45).props_('table-round', [[26, 47], [29, 48], [31, 46]]).props_('bench-long', [[26, 49], [30, 49]]).props_('chair', [[25, 47], [27, 47], [30, 48]]).prop('stair-spiral', 32, 49).prop('tavern-sign', 34, 47).prop('dartboard', 33, 46);
  b.props_('bunk-bed', [[23, 51], [25, 51], [23, 53]]).prop('footlocker', 26, 53).prop('hearth-oven', 32, 51).prop('pot-rack', 30, 51).prop('flour-sacks', 29, 53).prop('kitchen-table', 31, 52);
  b.light(28, 46, 15, 20, WARM).light(31, 52, 5, 10, WARM);

  b.paint(36, 43, 26, 13, 'stone-flagstone');
  b.area('Festival Square', [[36, 43, 26, 13]], {
    read: 'The whole town seems to be here. Lanterns hang from every window and string, a fiddle and a drum are playing, and children run between the stalls with sugared fish on sticks. In the middle, by the fountain, stands an empty stone stand with seven candles on it, and no reliquaries.',
    gm: 'At dusk the Prior should bless the lanterns over the seven reliquaries, carried down in procession. Tonight Hesketh refused to bring down the three that are left, and the crowd is uneasy. Prior Morwen blesses the empty stand and looks for help. At midnight the procession goes down the Quay Stair to float the lanterns.',
    label: [48, 47],
  });
  b.prop('fountain-grand', 48, 49).prop('lectern-dais', 48, 45).props_('candles', [[47, 45], [49, 45]]).props_('banner-pole', [[44, 45], [53, 45]]);
  b.props_('market-stall', [[38, 53], [42, 53], [55, 53], [59, 53]]).prop('merchant-cart', 59, 46).prop('produce-stall', 38, 45).props_('lantern-cluster', [[41, 48], [55, 48], [45, 52], [52, 52]]).prop('campfire-spit', 40, 50).props_('bench-long', [[44, 50], [52, 50]]).prop('barrel-group', 60, 50).props_('lamp-post', [[37, 44], [60, 44], [37, 54], [60, 54]]);
  for (const [x, y] of [[41, 48], [55, 48], [45, 52], [52, 52]]) b.light(x, y, 10, 15, '#ffd27a');
  for (const [x, y] of [[37, 44], [60, 44], [37, 54], [60, 54]]) b.light(x, y, 15, 20, WARM);
  b.light(48, 45, 5, 10, WARM).light(40, 50, 5, 10, '#ff8a3c');

  b.building("Wardens' post", 64, 44, 8, 7, {
    mat: 'wood-planks-dark',
    read: 'A hired hall with the abbey\'s white sash nailed over the door. Inside, card games, clubs on a rack, and a frightened man in a cage.',
    gm: 'Captain Roswith Brackett\'s men sleep and dice here. Odo, a pedlar of glass lanterns from up the coast, is caged as "the thief": he was only selling near the abbey wall. Two wardens are on duty (thug stats; they give up if outnumbered). Freeing Odo (lock DC 13, or talk the guards round) earns his tip: "I saw the grey pilgrim. Tiny old woman. She smelled of hot wax, like a lantern-shop."',
    doors: [[64, 47, 'w', 'closed'], [67, 50, 's', 'closed']],
    windows: [[66, 44, 'n'], [71, 47, 'e']],
  });
  b.prop('cage', 70, 45).prop('weapon-rack', 65, 45).prop('table-cards', 67, 47).props_('cot', [[70, 49], [68, 49]]).prop('chest', 65, 49).prop('lantern-hanging', 67, 46);
  b.light(67, 46, 10, 15, WARM);
  b.building("Sailmaker's loft", 73, 44, 6, 7, {
    mat: 'wood-planks-dark',
    read: 'Canvas everywhere, and a sailmaker asleep on a pile of it with a needle still in his hand.',
    gm: 'A side visit. Last week Sister Tegan ordered a small square sail "for a boat for seven" and paid in abbey candles. The sailmaker thought it was a joke for the festival. The sail is gone; it is on the boat in the grotto.',
    doors: [[73, 47, 'w', 'closed']], windows: [[78, 46, 'e']],
  });
  b.prop('sails-pile', 76, 45).prop('loom', 74, 49).prop('rope-coil', 77, 49).prop('workbench', 77, 47).prop('candles', 75, 47);
  b.area('Gull Steps', [[75, 38, 3, 8]], { gm: 'A goat-track stair on the east side of town, steep and unlit: the back way between the upper town and the harbour. Nobody watches it.', label: [76, 40] });
  b.props_('stairs-down', [[76, 40], [73, 23]]);

  // ---------- the upper town: stair streets, the pilgrims' houses and the lantern house ----------
  lane(b, [[25, 35], [38, 35], [44, 36]], 2, 'stone-cobble');
  lane(b, [[47, 36], [60, 35], [72, 34], [78, 33]], 2, 'stone-cobble');
  lane(b, [[44, 25], [44, 29], [45, 33], [47, 37], [47, 38]], 3, 'stone-flagstone');
  lane(b, [[30, 33], [30, 38]], 2, 'stone-flagstone');
  lane(b, [[30, 42], [30, 44]], 2, 'stone-flagstone');
  lane(b, [[47, 42], [47, 43]], 3, 'stone-flagstone');
  lane(b, [[35, 26], [35, 34]], 1, 'dirt');
  lane(b, [[73, 25], [73, 27], [75, 30], [76, 33], [76, 38]], 2, 'dirt');

  b.area("Pilgrims' Stair", [[44, 22, 3, 4], [44, 26, 4, 12], [47, 38, 3, 6]], {
    read: 'The great stair of Skerrow climbs from the square to the abbey gate in long, worn flights. Pilgrims climb it on their knees, holding lanterns, and the whole stair glows like a river of fire running uphill.',
    gm: 'The main way between the town and the abbey, crowded until midnight. Moving fast against the crowd takes a DC 12 Athletics check or ten extra minutes. The Lantern Wardens watch the top of it.',
    label: [45, 30],
  });
  b.props_('stairs-up', [[45, 23], [48, 40]]).props_('lantern-standing', [[44, 27], [46, 31], [47, 35]]).prop('road-shrine', 47, 29);
  for (const [x, y] of [[44, 27], [46, 31], [47, 35]]) b.light(x, y, 5, 10, WARM);

  b.area('Tallow Stair', [[29, 33, 4, 11]], {
    read: 'A narrow stair street between leaning houses, so steep the steps are only a hand wide. All the lamps are dark, and then, one by one, they light themselves, climbing toward you.',
    gm: 'Saint Ninnoc the Lamplighter, stolen first, walks here lighting lamps as he did every night of his life. Three Hollow Brothers come down the stair to drag him back to the abbey. If the heroes stand with him he calls them "lamp-bearers" and tells what he can (see his profile). A hero holding a lantern lit from Ninnoc\'s flame is ignored by the Brothers unless they attack.',
    label: [31, 36],
  });
  b.props_('stairs-down', [[30, 34], [31, 40]]).props_('lamp-post', [[29, 37], [32, 43]]).prop('sack', 32, 34).prop('barrel', 29, 34);
  b.light(29, 37, 10, 15, GHOST).light(32, 43, 10, 15, GHOST);
  b.encounter('Hollow Brothers on Tallow Stair', [28, 33, 6, 12], [['specter', 3]], 'low');

  b.building('Lantern House', 26, 27, 9, 7, {
    mat: 'wood-planks',
    read: 'Thousands of paper lanterns hang folded flat from the beams, like sleeping bats. The room smells of hot wax and glue. On the long table, seven special lanterns stand in a row, each painted with a name.',
    gm: 'Sister Tegan\'s workshop, where all of Skerrow\'s lanterns are made. The seven lanterns bear the saints\' names; four are lit. Clues: wax on the floor matches the drips at the abbey and on the tide-path; a pilgrim\'s grey cloak hangs by the door, hem white with dried salt; the hymn sheet on the table has the saints\' names written in the margins. In Tegan\'s cell, under the cot (DC 12 Investigation), is the first abbot\'s confession in a lead box.',
    doors: [[30, 33, 's', 'closed'], [34, 29, 'e', 'closed']],
    windows: [[32, 27, 'n'], [26, 30, 'w']],
  });
  b.wallRun(28, 27, 7, 'e').door(28, 31, 'e', 'closed');
  b.area("Tegan's cell", [[26, 27, 3, 7]], { gm: 'A cot, a kneeler and a crate of dried flowers. The lead box with the confession is under the cot. Fifty years of lantern patterns are pinned to the wall.', label: [27, 29] });
  b.prop('table-long', 31, 30).props_('lantern-cluster', [[30, 28], [33, 28]]).prop('workbench', 33, 31).prop('cauldron', 32, 32).prop('herbs-drying', 29, 28).prop('scroll-pile', 30, 31).prop('lantern-standing', 31, 32).prop('coat-rack', 29, 32);
  b.prop('cot', 26, 28).prop('prayer-kneeler', 27, 31).prop('trunk', 26, 33).prop('candles', 27, 28).prop('flowers', 26, 31);
  b.light(31, 30, 10, 15, WARM).light(27, 28, 5, 10, WARM);

  b.building("Tallow-chandler's", 37, 27, 6, 6, {
    mat: 'wood-planks-dark',
    read: 'Candles hang in pairs by their wicks from every rafter. The chandler is asleep in her chair, a cat on her lap.',
    gm: 'A side visit. The chandler supplies the abbey and Tegan. Tegan has bought "seven big candles, the slow ones that burn till dawn" and a sack of salt. Sells candles, lantern oil and a healer\'s kit at fair prices.',
    doors: [[39, 32, 's', 'closed'], [37, 29, 'w', 'closed']],
  });
  b.prop('shop-counter', 39, 30).prop('cauldron-tripod', 41, 28).prop('shelf-jars', 42, 31).prop('rocking-chair', 38, 28).prop('candles', 40, 28).prop('barrel', 42, 29);
  b.area('Cat Alley', [[35, 26, 1, 9]], { gm: 'A dark slot between the Lantern House and the chandler\'s, full of cats. A shortcut and a hiding place. Tegan leaves out fish heads for the cats every night.', label: [35, 28] });
  b.props_('crate', [[35, 27], [35, 31]]);

  b.building("Pilgrims' Rest", 50, 27, 10, 7, {
    mat: 'wood-planks-dark',
    read: 'A hostel of bunks four high. Pilgrims sleep in their cloaks with their lanterns hugged to their chests, and someone in the corner is crying very quietly.',
    gm: 'The abbey\'s hostel for poor pilgrims. A widow, Agna, came to pray for her drowned son and saw Saint Pascoe in the boat sheds; she is not frightened, only jealous that the saint gets to go home and her son did not. A pilgrim here swears she saw "a little old nun and a boy carrying a silver box down the Gull Steps" on the second night.',
    doors: [[50, 30, 'w', 'closed'], [54, 33, 's', 'closed']],
    windows: [[55, 27, 'n'], [59, 30, 'e']],
  });
  b.props_('bunk-bed', [[51, 28], [53, 28], [55, 28], [57, 28], [51, 31], [57, 31]]).prop('table-trestle', 54, 30).prop('hearth-oven', 58, 29).props_('footlocker', [[52, 32], [56, 32]]).prop('prayer-kneeler', 53, 29);
  b.light(58, 29, 10, 15, WARM);
  b.building("Ropemaker's cottage", 62, 27, 7, 4, {
    read: 'A narrow cottage that smells of hemp. Three generations of rope hang on the walls.',
    gm: 'Empty tonight; the family is at the square. A good place to hide or lie in wait for someone on the high street.',
    doors: [[65, 30, 's', 'closed']],
  });
  b.prop('bed', 63, 28).prop('rope-coil', 67, 28).prop('spinning-wheel', 66, 29).prop('stove', 63, 29);
  b.paint(61, 31, 10, 6, 'stone-cobble');
  b.area("Saints' Well", [[61, 31, 10, 6]], {
    read: 'A little square with a covered well. Seven stone faces are carved around the well head, and pilgrims have tied ribbons to an iron rail: one colour for each saint.',
    gm: 'Four of the ribbon colours have gone pale, as if bleached, one for each stolen saint (DC 10 Perception). Locals say the well water tastes of salt tonight. A good place to meet the Prior quietly, or to hear Hesketh\'s men arguing about overtime.',
    label: [66, 33],
  });
  b.prop('well', 66, 34).prop('road-shrine', 62, 32).prop('fence-wood', 68, 32).props_('flowers', [[63, 35], [69, 35]]).prop('bench', 64, 36).prop('lantern-cluster', 67, 32);
  b.light(67, 32, 10, 15, WARM);
  b.area('Terrace gardens', [[72, 26, 8, 12]], {
    gm: 'Bee gardens on the last terrace before the sea cliff. Quiet, dark, and the Goat Steps come down through them from the pilgrims\' field above. Fresh small boot prints and wax drips cross the beds (Kitto and Tegan, two nights ago).',
    label: [76, 29],
  });
  b.props_('beehive', [[73, 29], [74, 31]]).prop('crop-rows', 77, 28).prop('fence-wood', 72, 36).prop('scarecrow', 78, 31).prop('signpost', 74, 26);

  // ---------- the clifftop: the headland graveyard and the abbot's tomb ----------
  lane(b, [[20, 3], [14, 6], [8, 9], [8, 12]], 1, 'dirt');
  lane(b, [[23, 3], [20, 3]], 2, 'dirt');
  b.area('Headland graveyard', [[2, 1, 21, 19]], {
    read: 'Crooked headstones lean toward the sea on a bare headland. The wind smells of salt. Down among the graves a single lantern bobs, as if someone is walking there, though nobody holds it.',
    gm: 'Saint Wynn the Gravedigger, stolen fourth, digs here with a spade of light, burying the plague dead of two hundred years ago. A will-o\'-wisp and three shadows feed on the fear of the place: the wisp copies Wynn\'s lantern to lure the living over the cliff edge (DC 13 Wisdom save, or walk toward it on your next move). Wynn pays no attention to the living unless someone helps him lay a "body" in a grave. Then he points at the abbot\'s tomb: "He is not sleeping. He is keeping."',
    label: [12, 4],
  });
  for (let i = 0; i < 26; i++) {
    const x = 3 + Math.floor(r() * 19), y = 2 + Math.floor(r() * 10);
    if (b.isFloor(x, y)) b.prop(r() < 0.75 ? 'burial-slab' : 'cairn', x, y, Math.floor(r() * 4) * 90);
  }
  b.props_('tree-dead', [[4, 6], [19, 11]]).prop('tree-willow', 16, 2).prop('open-grave', 13, 8).prop('lantern-standing', 11, 8).prop('standing-stone', 3, 15).prop('urn', 20, 15).props_('grass-tall', [[15, 16], [18, 18], [2, 11]]);
  b.light(11, 8, 5, 10, GHOST);
  b.encounter('False lights on the headland', [1, 1, 22, 12], [['willOWisp', 1], ['shadow', 3]], 'low');

  b.building("Abbot Leofric's tomb", 5, 13, 8, 7, {
    mat: 'dungeon-slab',
    read: 'A small stone house for the dead, green with lichen. Over the door is carved a lantern inside a cage. The iron door is cold enough to sting your hand.',
    gm: 'The tomb of the first abbot. Locked (DC 15 Thieves\' Tools, DC 17 Strength, or the key on Hesketh\'s ring). Inside: Leofric\'s effigy holding seven stone nails, and the epitaph. Tegan opened the tomb in the spring repairs and found the confession in the effigy\'s hollow hands. A secret door in the back wall (DC 13 Perception; the dust shows footprints of no one, but the cold draught is plain) opens on the Abbot\'s own way down to the bone stair: Leofric\'s ghost walks it every night.',
    doors: [[8, 13, 'n', 'locked', 'door-iron'], [8, 19, 's', 'secret']],
  });
  b.prop('sarcophagus-effigy', 8, 16).props_('candle-stand-tall', [[6, 14], [11, 14]]).prop('wall-alcove-arch', 11, 18).prop('urn', 6, 18).prop('cobweb-corner', 12, 14).prop('gm-secret-door', 8, 19, 0, { gm: true });
  b.light(8, 16, 0, 10, COLD);

  // ---------- the clifftop: the Abbey of the Seven ----------
  b.paint(23, 1, 7, 5, 'dirt');
  b.area('Lych walk', [[23, 1, 7, 5]], {
    read: 'A lane of flat stones runs between the graveyard and the abbey church, under a roofed gate where coffins once rested on their last walk.',
    gm: 'Always open. The quiet way into the abbey from the graveyard, and from the graveyard down... nowhere, unless you know about the abbot\'s tomb.',
    label: [26, 3],
  });
  b.prop('fence-gate', 23, 3).prop('lamp-post', 27, 2).prop('bench', 28, 5);
  b.light(27, 2, 10, 15, WARM);

  b.building('Abbey church', 31, 1, 25, 9, {
    mat: 'marble',
    read: 'A tall, cold church full of pilgrims\' whispers. Painted on the east wall above the altar, the seven saints hold up seven lanterns, and in the painting four of the lanterns have gone dark, as if wiped away.',
    gm: 'The painting really is fading as each saint leaves the abbey ground (Arcana DC 12: this is binding magic, not a miracle). Brother porters and pilgrims fill the nave all night. Doors: west to the lych walk, south to the cloister, east to the Chapels of the Seven, and a small door to the sacristy.',
    doors: [[31, 5, 'w', 'closed', 'door-double'], [38, 9, 's', 'closed'], [47, 9, 's', 'closed'], [55, 5, 'e', 'closed', 'door-double']],
    windows: [[36, 1, 'n'], [43, 1, 'n'], [50, 1, 'n']],
  });
  b.props_('pew', [[35, 3], [35, 6], [39, 3], [39, 6], [43, 3], [43, 6], [47, 3], [47, 6]]).prop('altar-reredos', 53, 5).props_('candelabra-grand', [[52, 2], [52, 8]]).prop('font', 33, 5).prop('organ-cathedral', 33, 2).props_('window-stained-tall', [[36, 1], [43, 1], [50, 1]]).props_('column-fluted', [[37, 2], [37, 8], [45, 2], [45, 8]]);
  b.light(53, 5, 15, 20, WARM).light(41, 5, 10, 20, WARM);

  b.building('Chapels of the Seven', 56, 1, 8, 15, {
    mat: 'marble',
    read: 'A curved walk lined with seven little chapels, each with its gate of silver bars and its own candle. In four of them the candles have gone out, and the silver caskets are gone. In the other three, something wrapped in gold cloth glints through the bars.',
    gm: 'The reliquaries of the Seven. Each casket has a silver keeping-nail driven through its lid into the bones (Arcana DC 13: the nail holds the soul to the bones). The Keeping guards the chapels: the empty suits of armour on the walk, the long rug and the saints\' swords hanging in the chapels wake if anyone opens a chapel gate without singing the first line of the Lantern Hymn, or if any bones leave. A hero who reads the confession knows this. Three remain: Saint Merriel the Midwife, Saint Cathan the Singer and Little Saint Bryok.',
  });
  for (let k = 0; k < 7; k++) {
    const y = 1 + 2 * k;
    b.wallRun(61, y + 1, 3, 's').wall(61, y + 1, 'w');
    b.prop(k < 4 ? 'plinth-display' : 'reliquary', 63, y).prop('candles', 62, y + 1, 0, { off: k < 4 });
    if (k >= 4) b.light(63, y, 5, 10, GHOST);
  }
  b.props_('statue-tall-knight', [[57, 3], [57, 8], [57, 13]]).prop('rug-runner', 59, 8, 90).prop('magic-sword', 63, 12).prop('prayer-kneeler', 60, 10).prop('candle-stand-tall', 59, 2);
  b.light(59, 2, 10, 15, WARM);
  b.encounter('The Keeping wakes', [56, 1, 8, 15], [['animatedArmor', 3], ['rugOfSmothering', 1], ['flyingSword', 4]], 'moderate');
  b.door(58, 15, 's', 'closed');

  b.building('Cloister', 30, 10, 15, 8, {
    mat: 'stone-flagstone',
    read: 'A square walk of arches around a little garden of herbs and seven rose bushes. The roses are blooming, white, in the middle of autumn.',
    gm: 'Four roses are white and three are red: the white ones belong to the stolen saints. Two Hollow Brothers and two shadows of the Keeping walk the arches after the 10th bell, watching for the thief. They ignore anyone carrying a lantern lit from Saint Ninnoc\'s flame or one of Tegan\'s lanterns. The west door leads down to the crypt.',
    doors: [[30, 14, 'w', 'closed'], [44, 13, 'e', 'closed'], [37, 17, 's', 'closed', 'door-double']],
  });
  b.paint(33, 12, 9, 4, 'grass');
  b.props_('column-fluted', [[32, 11], [42, 11], [32, 16], [42, 16], [37, 11]]).prop('fountain', 37, 14).props_('flowers', [[34, 12], [40, 12], [34, 15], [40, 15]]).props_('bush', [[36, 13], [38, 15], [35, 14]]).prop('bench', 31, 14);
  b.light(37, 14, 5, 10, COLD);
  b.encounter('Watchers in the cloister', [30, 10, 15, 8], [['specter', 2], ['shadow', 2]], 'low');

  b.building('Sacristy', 45, 10, 11, 7, {
    mat: 'wood-planks-dark',
    read: 'Vestments hang in a row like empty people. A thin man in black is counting coins into neat stacks by candlelight, and he does not look up.',
    gm: 'Hesketh Prewitt\'s office. He blames the smugglers, offers the reward (handout) and warns the heroes off the abbey after the 10th bell. Insight DC 13: he is afraid, and not of thieves. At the 10th bell Captain Brackett and four wardens gather here; then Hesketh leads them down to wait in the crypt. His ring has keys to the treasury, the crypt and the abbot\'s tomb. His ledger is on the desk (DC 12 to read it unnoticed).',
    doors: [[48, 16, 's', 'closed']],
  });
  b.wallRun(51, 10, 7, 'w').door(51, 13, 'w', 'locked', 'door-iron');
  b.area('Treasury', [[51, 10, 5, 7]], { gm: 'Locked (DC 15, or Hesketh\'s key). The abbey\'s plate and this year\'s offerings. Taking it is theft from the town, and every pilgrim will hear of it.', label: [53, 13] });
  b.prop('writing-desk', 47, 12).prop('chair-high-back', 47, 13).prop('wardrobe', 49, 11).prop('coat-rack', 46, 15).prop('coin-stacks', 48, 12).prop('candles', 46, 11);
  b.prop('strongbox', 54, 11).prop('chalices', 52, 11).prop('display-case', 54, 15).prop('coffer', 52, 15);
  b.light(47, 12, 5, 10, WARM);
  b.encounter("The Sacristan's wardens", [45, 10, 11, 7], [['priest', 1], ['veteran', 1], ['thug', 4]], 'moderate');

  b.paint(30, 18, 34, 4, 'stone-flagstone').paint(45, 17, 11, 1, 'stone-flagstone');
  b.area('Abbey yard', [[30, 18, 26, 4]], {
    read: 'Lanterns line the yard inside the abbey wall. Below the wall the whole town glitters down the cliff to the black sea.',
    gm: 'Two wardens stand at the gatehouse until midnight. The herb garden and the gate to the pilgrims\' field lie east.',
    label: [36, 19],
  });
  b.props_('lantern-standing', [[33, 20], [40, 20], [52, 20]]).prop('well', 35, 19).prop('cart', 55, 19).prop('water-trough', 58, 20);
  for (const [x, y] of [[33, 20], [40, 20], [52, 20]]) b.light(x, y, 10, 15, WARM);
  b.building('Abbey gatehouse', 43, 19, 5, 3, {
    mat: 'stone-flagstone',
    gm: 'The top of the Pilgrims\' Stair. Two Lantern Wardens on the gate after dusk (thug stats; they call for help rather than fight). A pilgrim\'s cloak and a lowered head (DC 12 Deception) gets anyone past.',
    doors: [[45, 19, 'n', 'open', 'door-double'], [45, 21, 's', 'open', 'portcullis']],
  });
  b.prop('weapon-rack', 43, 20).prop('lantern-hanging', 47, 20).prop('stool', 44, 20);
  b.light(47, 20, 5, 10, WARM);
  b.area('Herb garden', [[56, 16, 8, 6]], { gm: 'Rue, rosemary and lavender for the abbey\'s infirmary. From here a hero can climb the chapel wall to a high window (DC 13 Athletics) and drop in unseen.', label: [60, 18] });
  b.props_('herbs-drying', [[57, 17]]).props_('crop-rows', [[59, 19], [62, 17]]).prop('beehive', 62, 20).prop('bush', 57, 20);
  b.wallRun(64, 16, 6, 'w', 'low').door(64, 18, 'w', 'open', 'fence-gate');

  b.area("Pilgrims' field", [[64, 1, 16, 21]], {
    read: 'A field of tents and wagons on the clifftop, lit by cook-fires. Pilgrims from every town on the coast have come for the Night of Lanterns, and they are singing the Lantern Hymn badly but with feeling.',
    gm: 'A side area, and a way round: the Goat Steps go down from the south-east corner to the terrace gardens. Old pilgrims here know the original hymn had a last verse the abbey no longer sings (handout, if the heroes ask around: DC 12 Persuasion, or buy a round). A tinker sells oil, rope and a potion of healing (50 gp).',
    label: [71, 8],
  });
  b.props_('tent', [[66, 3], [70, 4], [75, 3], [67, 13], [77, 12]]).props_('tent-round', [[73, 8], [66, 18]]).prop('tent-bell', 78, 6).props_('campfire', [[70, 9], [75, 16]]).prop('cooking-pot-fire', 68, 9).prop('wagon', 77, 19).prop('hitching-post', 72, 19).props_('bedroll', [[72, 14], [69, 16], [73, 15]]);
  b.light(70, 9, 15, 20, '#ff9a4a').light(75, 16, 15, 20, '#ff9a4a');

  b.start(46, 49, 3, 3);
  return b.build();
}

export const LANTERN_SAINTS: Adventure = {
  id: 'lantern-saints',
  title: 'The Lantern Saints of Skerrow',
  tagline: 'On the Night of Lanterns the relics of seven saints are vanishing one by one, and with each theft a ghost walks the cliff town.',
  levels: '4',
  sessions: '1 session',
  players: '3-5 players',
  tags: ['one-shot', 'festival', 'ghosts', 'mystery', 'cliff town'],
  pitch:
    'Skerrow is a pilgrim town on a sea cliff, all stairs and lanterns. Every autumn on the Night of Lanterns, thousands of paper lanterns are floated on the sea in honour of seven saints whose bones lie in the abbey on the clifftop. This year, four of the seven reliquaries have been stolen in four nights. After each theft, a saint\'s ghost has been seen walking the streets. Tonight is the Night of Lanterns, and three saints are left.',
  secret:
    'Two hundred years ago, plague and the Black Gale nearly finished Skerrow, and seven ordinary people held it together. When the last of them died, Abbot Leofric Stane feared the town would fall apart without them. He drove a silver keeping-nail through each saint\'s bones and bound their souls to the abbey "to keep watch over Skerrow for ever". He bound himself and four of his monks as their jailers: the Hollow Brothers. The pilgrims came, the abbey grew rich, and the saints never rested.\n\nThe thief is Sister Tegan Lowther, the abbey\'s 81-year-old lantern-maker. In the spring she found Leofric\'s confession in his tomb. For fifty years she has heard weeping in the chapels and thought it was the wind. Now she is stealing the saints home, one a night, down the old smugglers\' stair to the Lantern Grotto, with a smuggler boy, Kitto Roe, to help carry. Each saint taken off abbey ground half-wakes and walks the town, living their old life again, while the Hollow Brothers hunt them.\n\nWhy tonight: only at the midnight turn of the tide on the Night of Lanterns does the sea open a road for souls. Tegan must pull the nails and send all seven out on her lantern boat then. If she fails, the Brothers drag the four stolen saints back by dawn, and she will not live to try again.\n\nAgainst her stands Sacristan Hesketh Prewitt. Sacristans swear the Keeping oath and he knows the truth. He is not cruel; he is afraid that without its saints Skerrow will lose its pilgrims, its silver and its luck. He blames the smugglers, has hired a gang of Lantern Wardens, and tonight sets a trap in the crypt. In the grotto at midnight, the ghost of Abbot Leofric himself rises to keep his saints.',
  hooks: [
    'Prior Morwen Callis quietly asks the heroes, as strangers with no side to take, to find the thief before midnight and spare the town a scandal: 100 gp.',
    'Old Jago Kettlewell\'s smugglers are being blamed for the thefts. He sends a boy to the heroes\' table: find the real thief and clear his crew, for 80 gp and a boat whenever they need one.',
    'On the stair up into town, a pale man in an old coat asks one of the heroes for a light. When they offer it, the lamp beside them lights itself, and the man is gone. He left a warm, glowing coal in their hand.',
  ],
  tips: [
    'Run it on a clock and tell the players the time. Dusk: the procession and the empty stand. 8th to 10th bell: the town. 10th bell: Hesketh gathers his wardens. 11th bell: Tegan climbs the smugglers\' stair to take the last three saints. Midnight: the tide turns, the town floats its lanterns, and the grotto boat must go out.',
    'The saints\' ghosts are not monsters. They are kind, confused and a little lost in their own pasts. Each one gives a clue if the heroes join in what they are doing. The Hollow Brothers (specters) and the Keeping are the real dangers.',
    'Lanterns are a tool. A lantern lit from a saint\'s flame (Ninnoc gives one), or one of Tegan\'s lanterns, makes the Hollow Brothers, the cloister watchers and the bone stair skeletons ignore its bearer unless attacked. Clever players can sneak through half the night.',
    'Let the players choose a side. Hesketh is wrong but not wicked, and Tegan is a thief. If they catch Tegan and hand her over, play that out honestly: the saints are nailed back down, and the ending is sad.',
    'There are three ways to the grotto: by boat or the tide-path from the harbour, down the smugglers\' stair from the crypt, or down the abbot\'s own way from his tomb. The stair and the abbot\'s way meet at the bone stair.',
    'Keep the festival alive. Every time the heroes cross the town, describe music, food, children with lanterns, and a pilgrim who has seen a ghost and wants to tell them about it.',
  ],
  npcs: [
    {
      id: 'pf_lnstegan', name: 'Sister Tegan Lowther', title: 'lantern-maker of the abbey', kind: 'npc', art: 'sage', monsterId: 'acolyte',
      wants: 'To send the seven saints home to rest on the Night of Lanterns, before she dies.',
      knows: 'The whole truth: the binding, the nails, the Hollow Brothers, the smugglers\' stair and the right words of the Lantern Hymn.',
      voice: 'Tiny, brisk and practical, like a grandmother organising a picnic. Swears mildly ("salt and sorrow!"). Calls everyone "my duck".',
      appearance: 'A bent little nun with wax-burned fingers, a pilgrim\'s grey cloak over her habit, and a lantern on a stick taller than she is.',
      backstory: 'Tegan came to the abbey at fifteen and has made every lantern Skerrow has floated for sixty years. She found the confession during the spring repairs to the abbot\'s tomb and has not slept properly since.',
      gmNotes: 'Uses the acolyte stat block if it ever comes to it; she will not fight anyone but the Brothers. She will not give up. If the heroes are kind she tells them everything and asks for help carrying the last three caskets. If Hesketh catches her alone in the crypt at the 11th bell, she is taken unless the heroes are there.',
    },
    {
      id: 'pf_lnshesketh', name: 'Hesketh Prewitt', title: 'sacristan of the Abbey of the Seven', kind: 'npc', art: 'priest', monsterId: 'priest',
      wants: 'The saints back in their chapels and the thief caught before midnight, so Skerrow keeps its pilgrims and its luck.',
      knows: 'The Keeping oath and the binding; that the thief comes through the crypt; that iron nails would do if the silver ones are lost.',
      voice: 'Soft, exact and tired. Speaks in sums. Says "for the good of the town" when he means "please".',
      appearance: 'A thin, grey man in a black cassock with ink on his fingers and a ring of heavy keys at his belt.',
      backstory: 'Hesketh grew up poor in Skerrow and saw what a bad pilgrim year does to the town. He took the Keeping oath at twenty and has never told anyone what it really means.',
      gmNotes: 'Priest stat block. Not a villain: shown the confession and a saint\'s ghost face to face (DC 15 Persuasion, or DC 10 if Ninnoc or Lowenna speaks to him), he sits down, takes off his keys and lets the wardens go. If he is losing a fight he surrenders rather than die.',
    },
    {
      id: 'pf_lnsmorwen', name: 'Prior Morwen Callis', title: 'head of the abbey', kind: 'npc', art: 'monk', shared: true,
      wants: 'The thief found quietly, the festival safe, and no one hurt.',
      knows: 'That Hesketh has hired too many wardens, that Tegan has been strange since spring, and nothing at all about the binding.',
      voice: 'Warm, a little too loud, laughs at her own jokes; goes very quiet when she is truly worried.',
      appearance: 'A broad, red-cheeked woman in a white habit with a festival garland round her neck that someone put there and she forgot.',
      gmNotes: 'Shown the truth, she is horrified and on the heroes\' side at once. She can order the wardens to stand down (they obey her unless Captain Brackett is there) and lead the town\'s procession down to the quay so all of Skerrow sees the saints go.',
    },
    {
      id: 'pf_lnsloveday', name: 'Loveday Quiller', title: 'keeper of the Kneeling Gull', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'A full house, a quiet night, and her saints back where they belong. (She will change her mind about that last one.)',
      knows: 'Every rumour in town, and that Kitto Roe has been carrying "something heavy" for Sister Tegan.',
      voice: 'Fast and loud over the noise, calls everyone "pilgrim", never stops moving.',
      appearance: 'A short, strong woman with flour on her apron, a lantern-shaped brooch, and seven ribbons braided into her hair.',
    },
    {
      id: 'pf_lnskettlewell', name: 'Jago Kettlewell', title: 'smuggler and old sea dog', kind: 'npc', art: 'pirate', monsterId: 'banditCaptain', shared: true,
      wants: 'His crew\'s name cleared, and the Lantern Wardens off his back.',
      knows: 'That "the little Sister" uses his old stair, that his grandson Kitto helps her, and that something walks the bone stair at night that is not a smuggler.',
      voice: 'Slow and gravelly, every sentence ends in a puff of his pipe.',
      appearance: 'A big grey-bearded man in a salt-stiff coat with brass buttons, one gold earring, and a pipe that never goes out.',
      gmNotes: 'Bandit captain stat block. He knows exactly what Tegan is doing and approves; he just will not say so to anyone wearing a white sash. Lends a boat, and on his word his crew will row the lantern boat out at midnight.',
    },
    {
      id: 'pf_lnskitto', name: 'Kitto Roe', title: 'a smuggler\'s grandson', kind: 'npc', art: 'child', shared: true,
      wants: 'To help Sister Tegan finish, and not to get his grandad hanged.',
      knows: 'Where the grotto is, when Tegan goes up the stair, and that the boat must go out "on the ebb, at the stroke".',
      voice: 'Quick and cheeky, then suddenly very serious. Says "proper" about everything good.',
      appearance: 'A skinny eleven-year-old in a sailor\'s cut-down jacket, barefoot, with wax drips on his sleeves.',
    },
    {
      id: 'pf_lnsninnoc', name: 'Saint Ninnoc', title: 'the Lamplighter, first of the Seven', kind: 'npc', art: 'lantern-spirit', shared: true,
      wants: 'To light the lamps of Skerrow one last time, and then to rest.',
      knows: 'Why the town was saved (people helped each other) and that the abbot "pinned" them. He does not know where his bones are, only that "the little Sister keeps them by the sea".',
      voice: 'A gentle old man who keeps losing his place in a sentence, then finding it again with a smile.',
      appearance: 'A thin old man made of pale gold light, with a long lamplighter\'s pole and a flame that never gutters.',
      backstory: 'Ninnoc kept the cliff fire burning through the three nights of the Black Gale, so the fishing boats could find the harbour. He fed it with his own furniture, then his own house.',
      gmNotes: 'A freed but unrested ghost. No stat block: he cannot fight. Saved from the Hollow Brothers, he lights a lantern for each hero from his pole; those lanterns make the Brothers, the cloister watchers and the bone stair skeletons ignore their bearers until they attack.',
    },
    {
      id: 'pf_lnsleofric', name: 'Abbot Leofric Stane', title: 'the first abbot, keeper of the Seven', kind: 'monster', art: 'ghost', monsterId: 'ghost',
      wants: 'To keep his saints. He truly believes Skerrow will drown the moment they go.',
      knows: 'Every word of the binding; how badly he was afraid during the plague; that he was wrong (he will not admit this).',
      voice: 'A great preacher\'s voice that echoes off the cave walls, cracking when anyone says the saints\' names.',
      appearance: 'A tall abbot in a mitre and rotted vestments, his face hidden by a hood of grey cloud, with seven ghostly chains running from his hands.',
      backstory: 'Leofric buried half the town in the plague year. When the last of the Seven died he could not bear to let them go, and called it duty.',
      gmNotes: 'Ghost stat block, with four specters (the Hollow Brothers). He tries to possess whoever holds a keeping-nail. He can be talked down: speaking a saint\'s name and something they did for Skerrow while pulling a nail forces him to make a DC 13 Charisma save or lose his next turn. If all seven nails are pulled, his chains break; he weeps, thanks the heroes, and fades. The Brothers fade with him.',
    },
    {
      id: 'pf_lnsroswith', name: 'Roswith Brackett', title: 'captain of the Lantern Wardens', kind: 'npc', art: 'guard-captain', monsterId: 'veteran',
      wants: 'Her pay, and to finish the job without anybody dying on her watch.',
      knows: 'That Hesketh is paying double "if the thief never talks", which she does not like, and the plan to wait in the crypt.',
      voice: 'Flat and blunt, an old soldier\'s voice. Counts heads out loud.',
      appearance: 'A stocky woman with a broken nose, a white sash over her mail, and a club as well as a sword.',
      gmNotes: 'Veteran stat block. A sellsword, not a believer. If shown that Hesketh means to have an old nun silenced, or offered better pay (50 gp), she walks away and takes her wardens with her.',
    },
  ],
  handouts: [
    { id: 'reward', title: 'Nailed to every door in town', text: 'BY ORDER OF THE SACRISTAN OF THE ABBEY OF THE SEVEN\n\nOne hundred crowns to any person who returns the stolen holy relics, or gives word that takes the thieves.\nThe thieves are known to be smugglers of the headland caves.\nAny person found on abbey ground after the tenth bell will be held by the Lantern Wardens.\n\nH. Prewitt, Sacristan' },
    { id: 'confession', title: 'The confession in the lead box', text: 'I, Leofric, abbot, set this down so that God may judge me.\n\nThe Seven are dead and the town will not live without them. So I have kept them. A nail of silver through each, and the old words said backward, and they will watch over Skerrow for ever, whether they will or no. I and four brothers have sworn to keep them kept.\n\nAt night I hear Little Bryok asking for his mother.\n\nIf ever they are to go, it must be on the night the lanterns go out to sea, at the turning of the tide, with each nail drawn and each name said and the hymn sung whole. I pray no one ever does it. I pray someone does.' },
    { id: 'ledger', title: "A page from the sacristan's ledger", text: 'Lantern Night offerings, last year: 2,140 crowns.\nPilgrims this year: fewer by a third. They have heard.\nWardens: Capt. Brackett and 12 men at 2 crowns a night. Double if the thief never talks.\n\nIf the Four are not back under the nails by dawn they are lost to us, and Skerrow with them.\nIron nails will serve if the silver cannot be found.\nGod forgive me. Someone has to keep the Keeping.' },
    { id: 'epitaph', title: "Carved on the abbot's tomb", text: 'LEOFRIC STANE\nFIRST ABBOT OF THE SEVEN\nWHO BURIED THE PLAGUE YEAR WITH HIS OWN HANDS\n\nI KEPT THEM, THAT THEY MIGHT KEEP YOU.' },
    { id: 'hymn', title: 'The Lantern Hymn, with its lost last verse', text: 'Light the lamp for the boats on the water,\nLight the lamp for the ones on the shore,\nLight the lamp for the son and the daughter,\nWho will not come home any more.\n\n(the verse the abbey stopped singing)\nNow set the lamp on the ebbing tide,\nNow say the name, and let it go:\nThe sea is wide, the door is wide,\nGo home, go home, where the lanterns go.' },
  ],
  chapters: [
    {
      id: 'night', title: 'The Night of Lanterns', level: 4,
      summary: 'One festival night in a cliff town of stairs and lanterns: four saints\' ghosts walk the streets, the Hollow Brothers hunt them, the sacristan sets a trap, and an old nun races the midnight tide to set the saints free.',
      goal: 'Find the thief, learn why the saints are walking, and decide before the midnight tide whether the Seven stay or go home.',
      map: skerrow,
      npcs: [
        { npc: 'pf_lnsmorwen', x: 48, y: 46 },
        { npc: 'pf_lnsloveday', x: 25, y: 48 },
        { npc: 'pf_lnsninnoc', x: 30, y: 36 },
        { npc: 'pf_lnstegan', x: 31, y: 31 },
        { npc: 'pf_lnshesketh', x: 48, y: 13 },
        { npc: 'pf_lnsroswith', x: 49, y: 14 },
        { npc: 'pf_lnskitto', x: 76, y: 64 },
        { npc: 'pf_lnskettlewell', x: 11, y: 61 },
        { npc: 'pf_lnsleofric', x: 8, y: 46, hidden: true },
      ],
      scenes: [
        {
          room: 'Festival Square', title: 'The empty stand',
          read: 'Drums and fiddles fall quiet as the procession comes down the great stair, every pilgrim holding a lantern. But the monks at the front carry nothing, and when they reach the stone stand by the fountain, there is nothing to set on it. A murmur runs through the crowd like a cold wind.',
          gm: 'Open here at dusk. Prior Morwen blesses an empty stand and makes a brave joke that nobody laughs at. Then she finds the heroes and gives the hook. Hesketh is not here: he stayed with the three remaining reliquaries. Every heroic-looking stranger is handed the reward notice by a warden.',
          handout: 'reward',
        },
        {
          room: 'The Kneeling Gull', title: 'A full house of pilgrims',
          read: 'The inn is so full that pilgrims sleep on the stairs. Loveday Quiller shoves a plate of fried sprats into your hands before you have said a word. "Ghost-hunters? Sit. Eat. Everyone in here has a story, and half of them are even true."',
          gm: 'Rumours (see the area). Loveday points the heroes at the Tallow Stair ("the lamps light themselves") and at the harbour. If asked about Tegan: "Bless her, she\'s been up and down that hill like a girl this week. Kitto Roe carrying her parcels."',
        },
        {
          room: 'Tallow Stair', title: 'The Lamplighter', encounter: 'Hollow Brothers on Tallow Stair',
          read: 'A thin old man of golden light climbs the dark stair, lighting each lamp with a long pole. Above him, three hooded shapes of grey smoke come drifting down the steps, and the lamps go out as they pass.',
          gm: 'The Hollow Brothers want Saint Ninnoc back. They attack anyone in their way. Saved, Ninnoc lights a lantern for each hero (see his profile) and says: "We were pinned, you see. Like moths in a book. The little Sister is unpinning us. Go and help her. She is very old."',
          treasure: 'Where the Brothers fell: a silver lamplighter\'s hook from Ninnoc\'s time (25 gp). Ninnoc\'s lanterns, which burn without oil until dawn.',
        },
        {
          room: 'Fish market', title: 'Wardens and nets', encounter: 'Wardens at the fish market',
          read: 'Men in white sashes are kicking over a lantern stall while the seller begs them to stop. Below on the shingle, a woman of pale light kneels by the water, mending nothing with patient hands.',
          gm: 'The wardens hunt "the smugglers\' fence". Talk them off or fight. Then Saint Lowenna on the beach: help her "net" and she speaks (see the Mending beach area). The wardens\' talk gives away Hesketh\'s plan: "Crypt at the eleventh bell, and no talking to the thief, he says. Paid double for that."',
          treasure: 'The wardens\' purses: 28 gp, and a potion of healing on the biggest one.',
        },
        {
          room: 'Boat sheds', title: 'The Boatwright', optional: true,
          read: 'In the dark shed a pale old man planes a plank that is not there. Shavings of light curl from his plane and vanish before they touch the floor.',
          gm: 'Saint Pascoe. Hand him a real tool and he sees the heroes. He tells them Tegan asked for "a boat for seven", and that it must go out "on the ebb, at the stroke of twelve, or the door shuts for a year". Then he goes back to work, content.',
          treasure: 'Under the loose board: Jago\'s stash, 40 gp. Pascoe would say it is not theirs to take.',
        },
        {
          room: 'Headland graveyard', title: 'Lights among the graves', encounter: 'False lights on the headland', optional: true,
          read: 'A lantern bobs between the headstones toward the cliff edge. Beside an open grave, a broad man of pale light is digging with a spade that glows, and he is weeping as he works.',
          gm: 'The wisp and shadows strike when the heroes step off the path. Saint Wynn ignores them until someone helps him lower a "body" into his grave. Then he looks at the tomb and says: "He is not sleeping. He is keeping." The tomb holds the epitaph, the effigy with seven stone nails, and the secret way down.',
          handout: 'epitaph',
          treasure: 'At the bottom of Wynn\'s grave, where it was buried with him, his spade-headed mace: a +1 mace. He nods for them to take it.',
        },
        {
          room: 'Lantern House', title: "The lantern-maker's workshop",
          read: 'Seven lanterns stand on the long table, each painted with a name in careful gold letters. Four of them are lit. As you watch, the flame in the one marked "Lowenna" leans toward the sea, as if a wind is blowing that you cannot feel.',
          gm: 'Tegan is here until the 11th bell, packing flowers and candles. If the heroes come in hard she tries to bluff (DC 13 Insight to see through her). If they come in kind, she makes tea and tells them the truth, and asks for help. Either way the confession is under her cot.',
          handout: 'confession',
          treasure: 'Tegan gives a helper her own lantern, a lantern of revealing, "to see the Brothers coming". Her savings box holds 60 gp she means to leave to Kitto.',
        },
        {
          room: 'Sacristy', title: 'The sacristan\'s trap', encounter: "The Sacristan's wardens",
          read: 'The thin man in black finally looks up from his coins. "You are the ones the Prior hired. Good. Then you will understand that this is not about silver. Without the Seven, Skerrow is just a cold rock with a harbour."',
          gm: 'Talk first: Hesketh blames the smugglers and the ledger tells the truth. At the 10th bell he gathers Brackett and four wardens; at the 11th they wait in the crypt for Tegan. The fight happens wherever the heroes confront him, most likely the sacristy or the crypt. Brackett can be turned (see her profile), which drops this to an easy fight; Hesketh can be talked down with the confession and a ghost.',
          handout: 'ledger',
          treasure: 'Hesketh\'s key ring (treasury, crypt, tomb). In the sacristy: a potion of greater healing and a driftglobe on the desk. The treasury holds 220 gp in offerings and silver chalices (75 gp), but the town will know who took it.',
        },
        {
          room: 'Chapels of the Seven', title: 'The Keeping wakes', encounter: 'The Keeping wakes',
          read: 'The three last caskets glow behind their silver bars. As your hand closes on the first gate, the empty suits of armour along the walk turn their heads toward you with a long, scraping sound.',
          gm: 'Singing the first line of the Lantern Hymn before opening a gate stops the Keeping waking (a hero who read the confession or talked to Tegan knows). Otherwise it fights until the caskets leave the chapels, then falls still. Each casket is the size of a bread loaf and weighs 20 pounds. Little Bryok\'s is the smallest, and it is warm.',
        },
        {
          room: "Smugglers' Landing", title: "Kettlewell's crew", encounter: "Kettlewell's crew",
          read: '"Well," says the man with the pipe, laying down his cards. "Either you\'re Wardens, in which case my lads will be very rude to you, or you\'re not, in which case sit down and have a brandy."',
          gm: 'The sea route in. A bargain is easy (see the area). Jago confirms everything about Tegan and Kitto, and if the heroes are helping her, his crew will row the lantern boat out at midnight and hold the cave mouth against anyone following.',
          treasure: 'Jago pays the heroes\' hook money if they cleared his crew: 80 gp, and a rope of climbing "for the cliff paths, which you\'ll be wanting".',
        },
        {
          room: 'The bone stair', title: 'The stair of bones', encounter: 'The bone stair', optional: true,
          read: 'Where the two stairs meet, the cave floor is a drift of old bones. A rat runs across it. Then the bones begin to click, and to roll together, and to stand.',
          gm: 'Only if the heroes come down the stair without one of Tegan\'s or Ninnoc\'s lanterns, or after attacking a Brother. Tegan and Kitto pass through unharmed every night.',
          treasure: 'Under the bones: a dead smuggler\'s purse (35 gp) and, on a skeleton wrapped in a fine old cloak, a cloak of protection.',
        },
        {
          room: 'Lantern Grotto', title: 'The turning of the tide', encounter: "The Abbot's Keeping",
          read: 'Midnight. Far above, the town\'s bells ring, and out of the cave mouth you can see the sea filling with lanterns. The water around the little boat starts to pull toward the open sea. Then every candle in the grotto bends sideways, and a tall abbot made of cloud rises from the pool with seven chains in his hands.',
          gm: 'The finale. Tegan must pull seven nails (one action each, by anyone, from caskets in the boat) and say each name with a deed. The Abbot and the four Hollow Brothers try to stop it; Leofric tries to possess whoever holds a nail. Each name said with a deed forces his DC 13 Charisma save (see his profile). The boat must leave by the end of round 6 or the ebb is missed. When the seventh nail comes out, the chains break and the Abbot weeps and fades. If any caskets are still in the chapels, they can be fetched and the fight joined late, but the clock does not stop.',
          handout: 'hymn',
          treasure: 'The old sea shrine holds two hundred years of fishers\' offerings: 150 gp in old coins and a black pearl (100 gp). Each saint who goes free touches one hero as they pass: that hero may, once, turn a failed death saving throw into a success.',
        },
      ],
      wrapUp: 'At the stroke of twelve the lantern boat slides out of the cave mouth into a sea of ten thousand lanterns. Seven lights lift out of it, one by one, and rise. Up on the quay the whole town falls silent, and then someone begins to sing the last verse of the old hymn, and everyone joins in.',
    },
  ],
  ending:
    'Good ending: the Seven go home. The painting in the church shows seven empty hands, and the next morning every ribbon at the Saints\' Well has turned white. Skerrow does not fall into the sea: the pilgrims still come, but now they come to say goodbye to their own dead, and the Night of Lanterns becomes a night of letting go. Tegan dies peacefully that winter, smiling; Kitto becomes the abbey\'s new lantern-maker. If Hesketh lived, he makes the first lantern of the next year himself.\n\nBad ending: if Tegan is caught or the tide is missed, the four saints are dragged back by dawn and nailed down with iron. The ghosts stop walking. Tegan is locked in the abbey, and the Brothers are stronger next year. The heroes can still free them, but they must wait a whole year for the next Night of Lanterns, and the iron nails are worse than silver.\n\nIn between: if only some saints go free, those that stay are bound more tightly than ever, and the ones who left come back each Lantern Night as lights on the water, waiting for the others.\n\nWhat\'s next: Leofric\'s confession mentions "the old words said backward". Someone taught him those words, and other saints in other abbeys up the coast may be kept the same way.',
};
