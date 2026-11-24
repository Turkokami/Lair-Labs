// The Silver Eyrie: a high-mountain mystery and demon fight for four heroes of level 16.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function silverEyrie() {
  const b = new MapBuilder('adv-silver-eyrie', 'The Silver Eyrie', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });
  const r = rng(1616);

  // ================= the approach: the Last Stair, three switchbacks up a cliff =================
  b.tunnel([[2, 76], [14, 77], [27, 76], [40, 75]], 3, { seed: 161, mat: 'ice' });
  b.tunnel([[40, 75], [41, 69]], 3, { seed: 162, mat: 'ice' });
  b.tunnel([[41, 69], [28, 68], [12, 69]], 3, { seed: 163, mat: 'ice' });
  b.tunnel([[11, 69], [11, 62]], 3, { seed: 164, mat: 'ice' });
  b.tunnel([[11, 61], [22, 61], [33, 60]], 3, { seed: 165, mat: 'ice' });
  b.area('The Last Stair', [[2, 75, 40, 4], [12, 68, 31, 4], [11, 60, 24, 4]], {
    read: 'The path is a shelf of ice cut into the cliff, three switchbacks high. Below, the clouds lie like a white sea. Above, silver roofs catch a sun that gives no warmth at all.',
    gm: 'Deep snow drifts are difficult ground. At each switchback the wind gusts: DC 15 Strength (Athletics) or Dexterity (Acrobatics), or be pushed 10 ft toward the edge (a fall is 20d6 bludgeoning, unless someone flies). Prayer flags on the path have been cut down, and someone carved demon runes into a milestone (DC 18 Arcana: a summoning mark, three days old).',
    label: [20, 77],
  });
  b.rubble(17, 76, 3, 2).rubble(30, 75, 2, 3).rubble(24, 68, 3, 2).rubble(16, 61, 2, 2).rubble(40, 71, 2, 2);
  b.props_('snowdrift', [[9, 77], [33, 76], [36, 69], [18, 69], [27, 61]]).props_('stairs-up', [[41, 72], [12, 65]]).prop('milestone', 6, 76);
  b.props_('banner-pole', [[22, 77], [30, 69], [20, 62]]).prop('skull-bleached', 37, 77).prop('boulder', 15, 70).prop('boulder-large', 28, 62);
  b.start(2, 76, 3, 3);

  // a pilgrims' shrine at the top switchback, and the climbers' chimney behind it
  b.cave("Pilgrims' shrine", 6, 61, 4, 3, {
    seed: 166, mat: 'stone-cobble',
    read: 'A niche in the cliff holds a little stone shrine to the Dreamer, heaped with frozen offerings: a child\'s mitten, a wooden bird, a cup of milk turned to ice. Behind it the rock is split by a black crack.',
    gm: 'Pilgrims leave gifts here before the bridge. The crack is the Climbers\' Chimney (DC 18 Perception to see the iron pegs inside): a narrow 1-square climb up inside the cliff to a hidden door in the Bell tower. Climbing it takes 20 minutes and a DC 16 Athletics check per hero; on a failure the hero slips, takes 21 (6d6) bludgeoning damage and must start again.',
  });
  b.prop('road-shrine', 5, 60).props_('offering-bowl', [[4, 61], [7, 60]]).prop('candles', 8, 62).prop('ladder', 2, 58);
  b.light(5, 61, 5, 10, '#ffd9a0');
  b.hall(2, 61, 2, 40, 1, { mat: 'cave-floor' }).hall(2, 40, 6, 40, 1, { mat: 'cave-floor' }).door(3, 40, 'e', 'secret');
  b.area("Climbers' chimney", [[2, 41, 1, 20]], { gm: 'A secret way past the chasm and the gate. It comes out behind a loose stone in the bottom of the Bell tower (secret door, DC 20 Perception from the tower side).', label: [2, 50] });
  b.props_('rope-coil', [[2, 55], [2, 46]]);

  // the climbers' cairn off the first switchback, and the mouth of the ice caves
  b.cave("Climbers' cairn", 50, 74, 6, 3.5, {
    seed: 167, mat: 'ice',
    read: 'A wide ledge where climbers rest. A tall cairn of stones stands over a row of graves, each marked with an ice axe. At the back, a blue mouth opens into the mountain, breathing cold.',
    gm: 'The graves are of pilgrims who died on the climb. One fresh grave is empty: the body walked away three nights ago (it was taken over by a nightmare and is now one of the doppelgangers in the cells). The blue mouth leads into the ice caves, the long way round to the Eyrie.',
  });
  b.prop('cairn', 49, 73).props_('open-grave', [[46, 75], [53, 76]]).props_('burial-slab', [[48, 76], [51, 76]]).props_('pickaxes', [[55, 72], [45, 72]]).prop('campfire-cold', 52, 73).prop('backpack', 54, 75);

  // ================= the chasm and the rope bridge =================
  b.pit(5, 53, 54, 4);
  b.room('Chasm rim', 18, 49, 35, 4, {
    mat: 'ice',
    read: 'A terrace of wind-scoured stone at the lip of the chasm. The gate of the Eyrie rises above you, silver on white, and its bells are not ringing.',
    gm: 'From here the heroes can see shapes moving on the walls (DC 15 Perception: monks in grey, fighting each other in the courtyard). The rim runs east into a crack in the cliff: the upper ice caves (another way in, through the hot springs).',
  });
  b.floor(33, 57, 3, 4, 'stone-cobble');
  for (let x = 5; x < 59; x++) {
    if (x >= 32 && x <= 36) continue;
    if (r() < 0.3 && !b.isFloor(x, 52)) b.pit(x, 52, 1, 1);
    if (r() < 0.4) b.pit(x, 57, 1, 1);
  }
  b.floor(34, 53, 1, 4, 'wood-planks');
  b.area('The rope bridge', [[33, 53, 3, 4]], {
    read: 'A bridge of rope and silverwood planks spans the chasm, one person wide. It hums in the wind like a harp string. Far below, there is only blue dark.',
    gm: 'The bridge is sound but sways: anyone who fights on it, or is hit while on it, makes a DC 16 Dexterity save or falls prone; prone and hit again means a DC 16 Strength save to hang on. The chasm is 600 ft deep. The vrocks attack while the heroes are halfway across.',
    label: [34, 55],
  });
  b.prop('bridge-rope', 34, 53).props_('mooring-post', [[33, 52], [35, 52], [33, 57], [35, 57]]);
  b.props_('snowdrift', [[20, 50], [48, 51]]).props_('boulder', [[24, 52], [45, 49]]).prop('chasm-edge', 28, 52).prop('chasm-edge', 42, 52).prop('signpost', 31, 51);
  b.light(34, 50, 10, 15, '#cfe2ff');
  b.encounter('Wings over the chasm', [26, 49, 18, 12], [['vrock', 5]], 'low');

  // ================= the gate and the frozen courtyard =================
  b.room('Outer gate', 30, 44, 12, 4, {
    mat: 'stone-cobble',
    read: 'A deep gate-passage under a silver-roofed arch. The portcullis is half raised and frozen in place. Carved over the arch, an eye closed in sleep.',
    gm: 'The gate is unguarded: its wardens left to join one side or the other. A gate-log on the wall (DC 12 Investigation) shows that no one has come in or out for nine days, except "Master Venmore, to the shrine, for prayer" three nights running. The shrine is where the summoning runes were carved.',
  });
  b.floor(35, 48, 2, 1, 'stone-cobble').door(35, 48, 's', 'open', 'portcullis').door(36, 48, 's', 'open', 'portcullis');
  b.props_('statue-tall-robed', [[31, 45], [40, 45]]).props_('brazier', [[33, 46], [38, 46]]).prop('notice-board', 41, 46).prop('weapon-rack', 30, 47);
  b.light(33, 46, 10, 15).light(38, 46, 10, 15);

  b.room('Frozen courtyard', 18, 30, 35, 13, {
    mat: 'ice',
    read: 'A great square of snow, ringed by silver-roofed cloisters. In the middle, a fountain has frozen in mid-leap, a hundred spears of ice. Grey-robed monks stand in a ring around a gallows built this morning, shouting at monks in white who hold the stair beyond.',
    gm: 'The schism. Brother Hamund Mossend and the Grey Brothers (the rebels) want to storm the Silver Stair, save the abbot and hang Novice Edwy, who served the poisoned tea. Prior Ingrith\'s White Wardens hold the stair. Both sides think the other is the traitor. A heroic entrance and a DC 20 Persuasion or Intimidation stops the fight before it starts; offering to find the true traitor in one day buys peace (DC 16). Drifts are difficult ground.',
    label: [35, 36],
  });
  b.rubble(20, 31, 4, 3).rubble(46, 39, 5, 3).rubble(25, 40, 3, 2).rubble(48, 31, 3, 2);
  b.floor(35, 43, 2, 1, 'stone-cobble').door(35, 42, 's', 'closed', 'door-double').door(36, 42, 's', 'closed', 'door-double');
  b.prop('fountain-grand', 35, 35).props_('statue-tall-winged', [[22, 34], [48, 34], [22, 39], [48, 39]]).prop('gallows', 29, 37);
  b.props_('column-fluted', [[19, 31], [19, 41], [51, 31], [51, 41], [27, 31], [43, 31]]).props_('snowdrift', [[24, 36], [44, 36]]).prop('campfire', 40, 40).prop('war-banner', 31, 41);
  b.props_('sandbags', [[34, 31], [37, 31]]).prop('cart', 45, 41);
  b.light(40, 40, 15, 20).light(35, 35, 5, 15, '#cfe2ff');
  b.encounter('The schism in the snow', [18, 30, 35, 13], [['veteran', 6], ['gladiator', 2], ['priest', 2]], 'low');

  // ================= the bell tower =================
  b.cave('Bell tower', 10, 37, 5, 5, {
    seed: 168, mat: 'stone-flagstone', wobble: 0.03,
    read: 'A round tower open to the sky, its spiral stair climbing the wall to a great silver bell. The bell ropes hang still. Something dark hangs among them, like a row of monks\' habits left to dry.',
    gm: 'The Dawn Bell wakes the Eyrie every morning; it has not rung in nine days. The "habits" are three cloakers born from the dream, feeding on the silence. Ringing the bell is one of the three keys to wake the abbot: it takes a DC 20 Strength (Athletics) check, or two heroes pulling together (DC 15). The bell can be heard in the Great hall. Ringing it also wakes every nightmare in the Eyrie: advance the dream-tide by one.',
  });
  b.prop('temple-bell', 10, 36).prop('stair-spiral', 13, 39).props_('chains-hanging', [[8, 35], [12, 35]]).prop('rope-coil', 7, 39).prop('lantern-standing', 10, 40);
  b.light(10, 40, 10, 15, '#cfe2ff');
  b.hall(16, 37, 17, 37, 1).door(17, 37, 'e', 'closed');
  b.encounter('Shadows in the bells', [5, 32, 11, 11], [['cloaker', 3]], 'low');

  // ================= the monks' cells =================
  b.room('Dormitory walk', 6, 12, 2, 18, {
    read: 'A long, narrow cloister lined with low doors. Every door has a name painted on it, and someone has scratched a word under half of them: LIAR.',
    gm: 'The monks\' cells. The Grey Brothers scratched the word. Among the monks who stayed in their cells, six are not monks: nightmares wearing the faces of brothers who went missing, plus two unseen things that follow the heroes and whisper accusations in the voices of their friends.',
  });
  b.floor(6, 11, 2, 1).door(6, 10, 's', 'closed').door(7, 10, 's', 'closed');
  b.hall(7, 30, 7, 32, 1).door(7, 29, 's', 'closed');
  const cellNames: [number, number, string?][] = [[2, 14, "Prior's cell"], [2, 18], [2, 22], [2, 26], [9, 14], [9, 18], [9, 22, 'Novice cell'], [9, 26]];
  for (const [cx, cy, name] of cellNames) {
    if (name === "Prior's cell")
      b.room(name, cx, cy, 3, 3, { mat: 'wood-planks-dark', read: 'A bare cell: a cot, a sword on the wall, a prayer rug worn through at the knees.', gm: 'Under the cot (DC 15 Investigation) is a stoppered vial of hollowmilk: the poison. It was planted. A DC 18 Investigation sees the wax seal is pressed with a scriptorium seal, and the dust under the cot is undisturbed except for a reaching arm. Ingrith has not slept here in nine days.' });
    else if (name === 'Novice cell')
      b.room(name, cx, cy, 3, 3, { mat: 'wood-planks', read: 'A cell with chalk drawings of dragons all over the walls, and a cot that has been slashed open.', gm: 'Edwy\'s cell, ransacked by the Grey Brothers. Under a loose board (DC 14 Perception): a jar of honey with a label in the Master\'s hand, "For Father Saev\'s tea, with love - C." It smells faintly of milk and grave-earth (DC 16 Medicine: hollowmilk).' });
    else b.floor(cx, cy, 3, 3, 'wood-planks');
    if (cx === 2) b.floor(5, cy + 1, 1, 1).door(4, cy + 1, 'e', 'closed');
    else b.floor(8, cy + 1, 1, 1).door(8, cy + 1, 'e', 'closed');
    b.prop('cot', cx + 1, cy).prop(cx === 2 ? 'prayer-kneeler' : 'footlocker', cx + 1, cy + 2);
  }
  b.prop('weapon-rack', 3, 16).prop('rug', 4, 15).prop('candles', 11, 24).prop('book-pile', 10, 24);
  b.props_('lantern-hook', [[6, 15], [7, 21], [6, 27]]).prop('water-barrel', 7, 13);
  b.light(6, 15, 5, 10).light(7, 21, 5, 10).light(6, 27, 5, 10);
  b.encounter('Faces in the cells', [2, 12, 10, 18], [['doppelganger', 6], ['invisibleStalker', 2]], 'low');

  // ================= the cloister garden =================
  b.room('Cloister garden', 2, 2, 17, 9, {
    mat: 'ice',
    read: 'A walled garden buried in snow. Fruit trees stand in rows, each one wrapped in sacking. In the middle grows a cedar older than the monastery, and its branches are moving although there is no wind.',
    gm: 'The Old Cedar is a treant who has guarded the garden since before the Eyrie was built. The leaking dream gives it nightmares, and its saplings walk with it. A DC 20 Nature or Religion check, or singing it the monks\' evening hymn, calms it; then it gives the heroes a snowbloom freely. Otherwise the snowbloom (one of the keys to wake the abbot) must be cut from under its roots.',
  });
  b.rubble(4, 3, 3, 2).rubble(13, 8, 4, 2);
  b.props_('tree-fir-snow', [[3, 3], [3, 9], [17, 3], [17, 9], [8, 3], [13, 3]]).props_('tree-dead', [[5, 6], [15, 6]]).prop('tree-oak', 10, 6);
  b.props_('column-fluted', [[2, 5], [18, 5], [10, 2], [10, 10]]).prop('flowers', 11, 8).prop('bench', 7, 9).prop('frozen-pond', 13, 6).prop('snowman', 4, 10).prop('beehive', 16, 8);
  b.light(11, 8, 5, 10, '#dff5ff');
  b.encounter('The dreaming cedar', [2, 2, 17, 9], [['treant', 1], ['awakenedTree', 6]], 'low');
  b.hall(19, 6, 21, 6, 1).door(21, 6, 'e', 'closed', 'door-double');

  // ================= the great hall of the abbot (open to the sky) =================
  b.room('Great hall of the abbot', 22, 2, 29, 12, {
    mat: 'marble',
    read: 'A hall big enough to stable a cloud. There is no roof: the sky is a hard blue square, and snow sifts down onto silver floors. At the far end, on a dais of white stone, a dragon of living silver lies curled around a teacup the size of a font, staring at nothing.',
    gm: 'Saevaril the Patient, the abbot, an adult silver dragon. Hollowmilk has taken his memory: he thinks it is the day he hatched, and that everyone is a thief come for the dream. He attacks anyone who approaches the east door (to the sanctum) or touches the teacup. The cup still holds grey dregs (DC 16 Medicine or Nature: hollowmilk, a poison that grows only in the shallows of the dream-pool, so whoever made it had a key to the sanctum). Snow on the floor is difficult ground under the open roof.',
  });
  b.rubble(32, 5, 8, 4).rubble(26, 9, 3, 2).rubble(44, 3, 3, 2);
  b.paint(30, 4, 12, 7, 'ice');
  b.prop('throne-dais', 36, 3).prop('treasure-urn', 39, 3).prop('chalices', 33, 3).prop('dragon-hoard', 46, 4).props_('coin-stacks', [[48, 3], [47, 6]]);
  b.props_('column-cluster', [[24, 4], [24, 11], [49, 4], [49, 11], [30, 12], [42, 12]]).props_('banner-hanging-tall', [[28, 2], [44, 2]]).props_('brazier-pedestal', [[34, 9], [38, 9]]);
  b.prop('statue-dragon', 23, 7).prop('snowdrift', 36, 7).prop('font', 37, 4);
  b.light(34, 9, 15, 20, '#e6f0ff').light(38, 9, 15, 20, '#e6f0ff').light(46, 4, 10, 15, '#ffe9a8');
  b.encounter('The abbot forgets', [22, 2, 29, 12], [['adultSilverDragon', 1]], 'low');

  // ================= the Silver Stair, the scriptorium and the refectory =================
  b.room('The Silver Stair', 35, 14, 3, 16, {
    mat: 'marble',
    read: 'A broad stair of white stone climbs between the scriptorium and the refectory to the abbot\'s hall. Monks in white robes and silver masks hold it shoulder to shoulder, staffs crossed.',
    gm: 'Prior Ingrith Stannard and the White Wardens. She sealed the abbot\'s hall nine days ago and let no one up, not even healers: she does not know who the traitor is, so she trusts nobody. She will let the heroes pass if they prove they are not working for the demon (a zone of truth, a DC 20 Insight-backed speech, or Brother Hamund\'s word) or if they bring her the poisoner. If attacked, the Wardens fight to hold the stair.',
  });
  b.door(35, 13, 's', 'closed', 'door-double').door(36, 13, 's', 'closed', 'door-double').door(37, 13, 's', 'closed', 'door-double');
  b.door(35, 29, 's', 'open', 'door-double').door(36, 29, 's', 'open', 'door-double').door(37, 29, 's', 'open', 'door-double');
  b.props_('stairs-up', [[36, 17], [36, 24]]).props_('candle-stand-tall', [[35, 15], [37, 15], [35, 27], [37, 27]]).prop('barricade-wood', 36, 28);
  b.light(36, 20, 10, 15, '#e6f0ff');
  b.encounter("The Prior's line", [34, 14, 5, 16], [['gladiator', 4], ['knight', 6]], 'low');

  b.room('Scriptorium', 20, 17, 12, 12, {
    mat: 'wood-planks-dark',
    read: 'Long desks under tall windows, each with a book open on it. The ink in every pot has frozen. Pale monks sit at the desks, writing, and the pages they write on are blank.',
    gm: 'The order writes down the Dreamer\'s dreams here, so they can be read and guarded. The pale monks are wraiths: brothers whose memories the dream-leak ate. They attack anyone who takes a book. Saying a wraith\'s own name (painted on the cell doors) makes it hesitate for a round. The Founding Roll, with the abbot\'s true name, lies in the locked reliquary (DC 20 Thieves\' tools, or the key on the Master\'s belt).',
  });
  b.hall(32, 22, 34, 22, 1).door(31, 22, 'e', 'closed').door(34, 22, 'e', 'closed');
  b.props_('writing-desk', [[22, 19], [25, 19], [28, 19], [22, 23], [25, 23], [28, 23]]).props_('library-stack', [[21, 27], [24, 27], [27, 27]]).prop('reliquary', 30, 26).prop('lectern', 30, 18);
  b.props_('scroll-rack', [[20, 17], [31, 17]]).prop('book-pile', 26, 21).prop('window-stained-tall', 25, 17).prop('candelabra', 29, 21);
  b.light(25, 21, 10, 15, '#ffd9a0').light(29, 21, 5, 10, '#ffd9a0');
  b.encounter('The forgotten brothers', [20, 17, 12, 12], [['wraith', 6]], 'low');

  b.room("Master Venmore's study", 14, 17, 5, 5, {
    mat: 'wood-planks-dark',
    read: 'A small warm room that smells of lavender and old paper. A fire burns low. On the desk, a portrait of a laughing woman, and beside it a dream-journal, open, written in a shaking hand.',
    gm: 'Corentin Venmore\'s study, reached only through a bookcase in the scriptorium (secret door, DC 18 Perception; Corentin uses it openly if the heroes are with him). The journal (handout) talks of "walking with Maudrey in the dream" and "the one who brings her back". A DC 18 Investigation finds Maudrey\'s last letter in the portrait\'s frame (handout), and a stock of dream-pool clay on his boots by the door.',
  });
  b.floor(19, 19, 1, 1).door(19, 19, 'e', 'secret');
  b.prop('writing-desk', 16, 18).prop('fireplace', 14, 17).prop('bookshelf-tall', 18, 17).prop('armchair', 15, 20).prop('mirror', 18, 21).prop('bookcase-secret', 19, 19);
  b.light(14, 18, 10, 10);

  b.room('Refectory', 40, 17, 11, 12, {
    mat: 'stone-flagstone-warm',
    read: 'Three long tables are laid for a feast no one ate. The bread has gone green. At the far table, something huge and bloated sits in the abbot\'s chair, eating the candles.',
    gm: 'Nightmares of hunger: four hezrous and a glabrezu, come through the broken wing. The glabrezu offers bargains in the voice of a kindly cellarer ("Tell me who you suspect, and I will tell you if you are right"). Every answer it gives is a lie meant to set the heroes against the Prior. It can be bargained with to leave, but only for the name of someone the heroes love.',
  });
  b.hall(38, 22, 39, 22, 1).door(37, 22, 'e', 'closed').door(39, 22, 'e', 'closed');
  b.props_('feast-hall-table', [[42, 19], [42, 23], [42, 27]]).props_('bench-long', [[41, 21], [41, 25]]).prop('throne', 49, 23).prop('hearth-grand', 50, 18).props_('chandelier-wheel', [[45, 20], [45, 25]]).prop('bread-rack', 40, 28);
  b.light(50, 18, 10, 15).light(45, 23, 10, 15);
  b.encounter('The feast of hunger', [40, 17, 16, 12], [['hezrou', 4], ['glabrezu', 1]], 'moderate');

  b.room('Kitchen', 52, 19, 4, 10, {
    mat: 'brick-floor',
    read: 'Copper pots, a cold oven, a larder door frosted shut. Scratches on the inside of the larder door.',
    gm: 'Two monk-cooks hid in the larder for six days and are half-starved; they saw "something with too many legs" in the broken wing, and they saw the Master carry a covered bowl up the Silver Stair the night the abbot fell ill. They are honest, and terrified.',
  });
  b.hall(51, 25, 51, 25, 1).door(50, 25, 'e', 'closed');
  b.hall(56, 21, 56, 21, 1).door(55, 21, 'e', 'closed', 'door-iron');
  b.prop('hearth-oven', 53, 19).props_('pot-rack', [[55, 23]]).prop('butcher-block', 53, 24).props_('flour-sacks', [[52, 27], [55, 28]]).prop('cupboard', 54, 26);
  b.light(53, 20, 5, 10);

  // ================= the broken wing, where the nightmares come through =================
  b.room('The broken wing', 57, 15, 19, 13, {
    mat: 'dungeon-slab',
    read: 'Half of the old guest wing has fallen down the mountain. The rest leans out over the void. Through a crack in the wall the colour of a bruise, things are crawling: shapes from bad dreams, wet and new.',
    gm: 'The nightmare rift. The dream-leak has torn a hole from the sanctum through the old guest wing. Every hour the dream-tide advances, two vrocks crawl out of it. The rift closes only when the gate in the dream-pool is shut. Floors are broken (rubble is difficult ground; the holes drop 30 ft into the hot springs below).',
  });
  b.rock(70, 15, 6, 4).rock(57, 25, 4, 3).rock(73, 24, 3, 4);
  b.rubble(60, 16, 6, 3).rubble(66, 21, 5, 4).rubble(58, 20, 3, 4).rubble(70, 20, 3, 3);
  b.pit(63, 23, 2, 2).pit(69, 26, 2, 1);
  b.area('The nightmare rift', [[63, 15, 6, 4]], { gm: 'The crack. It hums. Anyone who touches it hears their own voice asking them to come in. A DC 21 Wisdom save or the hero takes 22 (4d10) psychic damage and forgets the last hour.', label: [66, 16] });
  b.props_('ceiling-rubble', [[59, 17], [67, 22], [61, 24]]).props_('broken-furniture', [[65, 25], [71, 23]]).props_('bed', [[58, 16], [68, 19]]).prop('obscuring-cloud', 66, 17).prop('portal-arch', 65, 15).props_('column-collapsed', [[62, 20], [72, 21]]);
  b.light(66, 16, 15, 25, '#b03a5b');
  b.encounter('The rift opens', [57, 15, 19, 13], [['nalfeshnee', 1], ['hezrou', 2], ['vrock', 2]], 'moderate');
  b.tunnel([[66, 12], [66, 16]], 2, { seed: 169, mat: 'dungeon-slab' });
  b.tunnel([[62, 26], [62, 31]], 2, { seed: 170, mat: 'cave-floor' });
  b.rubble(62, 27, 3, 4);

  // ================= the dream-pool sanctum =================
  b.cave('Dream-pool sanctum', 63, 7, 9, 5.5, {
    seed: 171, mat: 'marble', wobble: 0.08,
    read: 'A round chamber of white stone, so quiet that you hear your own heart. In the middle lies a pool that does not reflect you: it shows a sky full of stars and, deep down, a sleeping face as big as a mountain. The water is turning dark from the edges in.',
    gm: 'The Dreamer\'s pool. While the abbot\'s mind holds the dream, nothing comes through. Now a gate is opening in the pool, and Nhezzareth, herald of the demon prince Szathmor, is pulling herself up through it. Corentin stands at the edge with the gate-rite. Closing the gate: the abbot (awake) can do it in one round; otherwise three heroes must each spend an action with a DC 20 Wisdom (Religion) or Charisma check while standing in the pool (each step in the dark water costs 11 (2d10) psychic damage). Three successes shut it.',
  });
  b.pool(63, 7, 4, 2.5, true);
  b.props_('column-fluted', [[57, 4], [69, 4], [59, 10], [67, 10]]).props_('candle-ring', [[59, 7], [67, 7]]).prop('summoning-circle', 63, 11).prop('altar', 63, 2).prop('magic-circle', 58, 9);
  b.light(63, 7, 20, 30, '#b48cff').light(63, 2, 5, 10, '#e6f0ff');
  b.hall(51, 7, 55, 7, 1, { mat: 'marble' }).door(50, 7, 'e', 'locked', 'door-iron');
  b.encounter('The Dream-Gate', [54, 1, 19, 13], [['marilith', 1], ['nalfeshnee', 1], ['glabrezu', 2]], 'high');

  // ================= the hot spring baths =================
  b.cave('Hot spring baths', 68, 36, 9, 6, {
    seed: 172, mat: 'stone-flagstone-warm',
    read: 'Warm air, after so much cold. Steam rolls over terraced pools of green water under a low stone vault. Somewhere in the steam, someone is singing very softly, in a voice like a struck glass.',
    gm: 'The only warm, safe place in the Eyrie: a long rest here is possible. Anaveth, the order\'s deva, lies in the deepest pool, her wings burned grey by hollowmilk smoke, hiding Novice Edwy from the Grey Brothers. Water from the source spring is one half of the snowbloom tea. A secret door behind the highest pool (DC 20 Perception; Anaveth knows it) opens on the Abbot\'s Stair, a narrow way up to the sanctum.',
  });
  b.pool(65, 36, 3, 2).pool(72, 34, 2.5, 2).pool(70, 39, 2, 1.5);
  b.props_('steam-vent', [[62, 33], [71, 38]]).props_('bench-long', [[61, 38], [67, 41]]).prop('coat-rack', 60, 37).prop('washbasin', 74, 33).prop('herbs-drying', 66, 31).props_('candles', [[69, 33], [63, 40]]);
  b.light(66, 36, 10, 20, '#ffcf8a').light(72, 34, 10, 15, '#ffcf8a');
  b.hall(53, 36, 59, 36, 1).door(52, 36, 'e', 'closed');
  b.area('Steam passage', [[53, 36, 6, 1]], { gm: 'A warm passage from the courtyard to the baths. Its floor sweats; boots slip (no check, just flavour).', label: [56, 36] });
  b.hall(75, 33, 78, 9, 1, { mat: 'dungeon-slab' }).hall(78, 9, 70, 9, 1, { mat: 'dungeon-slab' }).door(76, 33, 'e', 'secret');
  b.area("Abbot's stair", [[78, 10, 1, 23]], { gm: 'A narrow secret stair cut for the abbots, from the baths to the sanctum. It comes out behind a column in the sanctum. Heroes who use it arrive unseen and get one free round in the final fight.', label: [78, 20] });
  b.props_('stairs-up', [[78, 28], [78, 15]]);

  // ================= the ice caves under the Eyrie =================
  b.tunnel([[55, 73], [60, 69]], 2, { seed: 173, mat: 'ice' });
  b.cave('Ice cave mouth', 63, 68, 5, 4, {
    seed: 174, mat: 'ice',
    read: 'A cave of blue ice, lit from inside like a lamp. Your breath freezes and falls tinkling to the floor. Shapes are frozen into the walls: a goat, a monk, a bird with its wings spread.',
    gm: 'The ice is clear enough to see 20 ft into it. The frozen monk is Brother Aldric, who went missing a month ago, his face twisted in fear: he found the old prisoner below and the prisoner froze him. A DC 15 Survival reads the scuff marks: someone in soft boots comes this way often, carrying something heavy (Corentin, bringing offerings to the ice devil).',
  });
  b.props_('ice-block', [[60, 66], [66, 70]]).props_('stalactites', [[62, 65], [65, 69]]).prop('skeleton-lying', 61, 70).prop('cave-crystals', 64, 66);
  b.light(63, 68, 10, 15, '#9fd3ff');
  b.tunnel([[67, 70], [72, 73]], 2, { seed: 175, mat: 'ice' });
  b.cave('Crevasse of the lost', 74, 74, 4, 4, {
    seed: 176, mat: 'ice',
    read: 'The cave narrows to a crack that drops away into darkness. A rope still hangs from an iron peg, cut halfway down.',
    gm: 'A dead end with a prize. A climber from forty years ago hangs frozen in the crevasse 30 ft down (DC 17 Athletics to climb down and back). Her pack holds what she was carrying up as a gift to the abbot.',
  });
  b.pit(74, 75, 2, 3);
  b.props_('ice-block', [[72, 72], [76, 72]]).prop('rope-coil', 73, 76).prop('backpack', 76, 74);
  b.tunnel([[65, 64], [69, 60]], 2, { seed: 177, mat: 'ice' });
  b.cave('Frozen gallery', 70, 57, 7, 4.5, {
    seed: 178, mat: 'ice',
    read: 'A long gallery where an underground river has frozen in its bed. Pillars of ice reach from floor to ceiling. Cracks run across the frozen river like lines in an old hand.',
    gm: 'The frozen river is thin in places (the pits): DC 15 Perception to spot the weak ice; a fall drops a hero into freezing water (DC 15 Constitution save or a level of exhaustion). The gallery is a quiet way between the lower caves and the rime prison.',
  });
  b.ice(64, 56, 12, 2);
  b.pit(68, 56, 1, 2).pit(73, 57, 1, 1);
  b.props_('stalagmites', [[65, 54], [73, 59]]).props_('ice-thin', [[67, 57], [71, 56]]).props_('crystal-spire', [[72, 54], [66, 60]]);
  b.light(70, 54, 10, 15, '#9fd3ff');
  b.tunnel([[67, 53], [66, 50]], 2, { seed: 179, mat: 'ice' });
  b.cave('Rime prison', 66, 48, 6, 3.5, {
    seed: 180, mat: 'ice',
    read: 'Chains of silver run from the walls to a block of black ice in the middle of the cave. Inside the ice, something with a bug\'s face and a long tail opens its eyes, and the ice begins to crack.',
    gm: 'Krisskal, an ice devil the first abbot bound here as a penance for a war long ago. Corentin has been feeding it secrets in exchange for its advice on hollowmilk, and has promised to free it. It is half free: it can talk and reach, and a young white dragon it tamed sleeps in the snow beside it. It bargains: it will name the poisoner (truthfully, devils do not lie in a sealed bargain) in exchange for one link of its chain broken. Breaking a link lets it out in a year and a day.',
  });
  b.props_('wall-chains', [[62, 47], [70, 47], [66, 45]]).prop('ice-block', 66, 48).prop('bone-heap', 63, 50).prop('frozen-pond', 69, 50);
  b.light(66, 48, 10, 15, '#9fd3ff');
  b.encounter('The Rime-Chained', [60, 44, 13, 8], [['iceDevil', 1], ['youngWhiteDragon', 1]], 'low');
  b.tunnel([[66, 45], [66, 41]], 2, { seed: 181, mat: 'cave-floor' });
  // the upper ice crack from the chasm rim
  b.tunnel([[52, 50], [57, 49], [61, 48]], 2, { seed: 182, mat: 'ice' });
  b.area('Rim crack', [[53, 48, 7, 3]], { gm: 'A crack in the cliff at the east end of the rim. It leads to the rime prison and from there up to the hot springs: a way into the Eyrie that skips the gate.', label: [56, 49] });
  b.prop('snowdrift', 55, 49);

  return b.build();
}

export const SILVER_EYRIE: Adventure = {
  id: 'silver-eyrie',
  title: 'The Silver Eyrie',
  tagline: 'On the roof of the world, a dragon-abbot has forgotten himself, and a demon prince is climbing out of a god\'s dream.',
  levels: '16',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['mystery', 'high level', 'demons', 'dragon', 'mountain'],
  pitch:
    'On the highest peak in the world sits the Silver Eyrie, where the monks of the Closed Eye have watched over a sleeping god for a thousand years. Its abbot is a silver dragon, and every dawn its bell rings down the mountain to tell the valleys that the god still sleeps and the world is safe. Nine days ago the bell stopped. Three days ago, a shepherd in the valley woke up screaming, and the thing he had dreamed of walked out of his bedroom after him.',
  secret:
    'The god Ourael the Dreamer sleeps under the mountain, and the dream-pool in the Eyrie is the one place where his dream touches the world. The abbot, Saevaril the Patient, holds that dream steady with his own mind. Szathmor the Hollow Sleeper, a demon prince who feeds on dreams, has wanted in for an age. He found a way through Master Corentin Venmore, the order\'s keeper of dreams and the abbot\'s oldest friend. Corentin is ninety, dying and still grieving his wife Maudrey. Szathmor showed him Maudrey alive in the dream and promised he could walk into it and stay with her forever, never to die. All Corentin had to do was make the abbot forget. He brewed hollowmilk from the pool\'s shallows, hid it in honey and let a novice serve it. Now the abbot\'s mind is empty, the dream is leaking nightmares, the monks blame each other, and in a day and a night the gate in the pool will open wide enough for Szathmor\'s herald, the marilith Nhezzareth, to come through and hold it open for her prince. Corentin truly believes the demon is a dream he can control. He is wrong.',
  hooks: [
    'A temple in the valley pays the heroes 20,000 gp to climb the last stretch to the Eyrie and find out why the Dawn Bell has stopped, before the nightmares come down the mountain for good.',
    'One of the heroes has been dreaming of a silver dragon asking "Who am I?" every night for nine nights. On the tenth, the dream gives them directions.',
    'Anaveth, the Eyrie\'s deva, sends a single grey feather on the wind to the most devout hero. It carries one word, spoken in her voice when it is touched: "Traitor."',
  ],
  tips: [
    'Run a dream-tide clock with 10 tolls. A long fight, a short rest, ringing the bell or an hour of play costs one. At 6 tolls, nightmares start walking the courtyard (re-use the rift fight). At 3, the sanctum doors burst and Nhezzareth is half through. At 0, the gate is fully open: the final fight gets a second glabrezu, and if the heroes lose it, Szathmor rides the dream into the world.',
    'The mystery is the heart of it. Every clue points two ways at first. The Prior looks guilty (she sealed the hall and the vial is in her cell), Edwy looks guilty (he served the tea), and the gentle old Master is the one everyone trusts. Let the players accuse the wrong person. Then let the evidence pile up: the honey label, the gate-log, the clay on the Master\'s boots, the cooks, the ice devil\'s bargain.',
    'Waking the abbot needs two of three keys: his true name spoken to him (the Founding Roll, in the scriptorium), the Dawn Bell rung while he can hear it, and snowbloom from the garden steeped in water from the hot spring source (DC 16 Medicine or an herbalism kit). A greater restoration spell counts as the tea. With one key he is calm but confused; with two he wakes.',
    'Most fights can be talked down or turned: the monks want the truth, the treant wants peace, the ice devil wants a bargain, the glabrezu wants to sow lies. Corentin himself can be turned at the end (DC 22 Persuasion, or advantage if they show him Maudrey\'s letter): he then turns his last spell on Nhezzareth.',
    'If the abbot is awake and fights beside the heroes, add a glabrezu to the Dream-Gate. If the heroes are only three, drop the nalfeshnee from it; if five, add two vrocks.',
    'Cold: away from the hot springs, a hero without cold protection or warm gear makes a DC 15 Constitution save after each long rest or gains a level of exhaustion.',
  ],
  npcs: [
    {
      id: 'pf_seysaevaril', name: 'Saevaril the Patient', title: 'abbot of the Silver Eyrie, adult silver dragon', kind: 'monster', art: 'dragon-silver-adult', monsterId: 'adultSilverDragon', shared: true,
      wants: 'Poisoned: to keep "thieves" away from the east door. Awake: the dream whole and his monks forgiven.',
      knows: 'Poisoned: nothing past the day he hatched. Awake: how to close the gate in one breath, and that Corentin has been sad for a very long time.',
      voice: 'Awake: slow, gentle, amused, never in a hurry. Poisoned: a frightened child\'s questions in a voice like an avalanche.',
      appearance: 'A dragon of living silver with a long white beard of frost. In human form, a tall bald monk with silver eyes and a teacup always in hand.',
      backstory: 'Abbot for six hundred years. He has buried four generations of monks and remembers every name. Corentin was his first student.',
      gmNotes: 'Adult silver dragon stat block. If fought and dropped to 0 hit points, he does not die: he falls into a deep sleep, and can still be woken with the keys. Awake, he forgives Corentin and asks the heroes to do the same. He will not let anyone kill the old man in his hall.',
    },
    {
      id: 'pf_seyingrith', name: 'Prior Ingrith Stannard', title: 'prior of the Eyrie, captain of the White Wardens', kind: 'monster', art: 'monk', monsterId: 'gladiator', shared: true,
      wants: 'The abbot safe, and the traitor found. Until then, nobody passes the Silver Stair. Her backup plan is to drown the dream-pool in molten silver, which would cut the god off from the world forever.',
      knows: 'The abbot fell ill after evening tea nine days ago. Three people hold keys to the sanctum: the abbot, herself and the Master. She once found the Master sleepwalking by the pool, and said nothing.',
      voice: 'Clipped, cold, a soldier\'s voice. Never says please. Softens only when she talks about the abbot.',
      appearance: 'A broad grey-haired woman with a broken nose, in white robes over mail, a silver mask pushed up on her head.',
      backstory: 'A mercenary who climbed the mountain to die forty years ago, and found a reason not to.',
      gmNotes: 'Gladiator stat block. The red herring. She looks guilty and acts guilty, because she is ashamed: her silence about the Master\'s sleepwalking let this happen. If the heroes clear her name, she and the Wardens hold the courtyard against the nightmares while the heroes go to the sanctum.',
    },
    {
      id: 'pf_seycorentin', name: 'Master Corentin Venmore', title: 'keeper of dreams, the traitor', kind: 'monster', art: 'elder-wizard', monsterId: 'archmage',
      wants: 'To walk into the dream and live there with his dead wife forever, and not to die.',
      knows: 'Everything about the dream and the Eyrie. The gate-rite. That he poisoned his oldest friend. He tells himself the demon is "only a dream I can wake from".',
      voice: 'Warm and grandfatherly, a little breathless. Calls everyone "my dear". Quotes the scriptures, and gets one word wrong every time.',
      appearance: 'A tiny, bent old man with a white beard to his belt, ink on every finger, smelling of lavender. Wet grey clay dries on the hem of his robe.',
      backstory: 'He came to the Eyrie at twelve, the abbot\'s first student. He married Maudrey, a valley healer, and loved her for fifty years. She died two winters ago. He has dreamed of nothing else since.',
      gmNotes: 'Archmage stat block. He meets the heroes early as a helpful guide and points them at the Prior (and at Edwy, sadly). At the end he is in the sanctum doing the rite. He can be turned: DC 22 Persuasion, with advantage if they show him Maudrey\'s letter or the abbot (awake) asks him. Turned, he fights Nhezzareth and probably dies doing it. Spared, he asks to be judged by the abbot.',
    },
    {
      id: 'pf_seyedwy', name: 'Novice Edwy Pennick', title: 'the boy who served the tea', kind: 'npc', art: 'acolyte', monsterId: 'acolyte', shared: true,
      wants: 'Not to be hanged. To tell somebody what happened without being shouted at.',
      knows: 'He served the abbot his tea. The honey came from Master Venmore, who said it was "medicine for an old friend\'s bones". He saw the Master weep when the abbot drank it.',
      voice: 'Fast and frightened, then very quiet. Says "sir" to everyone, including the deva.',
      appearance: 'A skinny fifteen-year-old with a shaved head, chalk on his sleeves and a split lip from the Grey Brothers.',
      gmNotes: 'Acolyte stat block. Hiding in the hot springs under Anaveth\'s wing. The rebels want to hang him. He is innocent, and his story is the strongest clue in the Eyrie, if the heroes protect him long enough to hear it.',
    },
    {
      id: 'pf_seyhamund', name: 'Brother Hamund Mossend', title: 'leader of the Grey Brothers', kind: 'monster', art: 'veteran', monsterId: 'veteran',
      wants: 'To storm the Silver Stair, save the abbot and see someone hang for this.',
      knows: 'The Prior locked everyone out the night the abbot fell. Edwy served the tea. Monks have gone missing in the cells (taken by the doppelgangers).',
      voice: 'Loud, hoarse, quick to anger and quick to weep. Thumps his chest when he swears.',
      appearance: 'A big red-bearded monk with frostbitten ears and a quarterstaff bound in iron.',
      gmNotes: 'Veteran stat block. Honest but wrong. Show him real proof and he kneels to the Prior and apologises, and the Grey Brothers fight beside the Wardens.',
    },
    {
      id: 'pf_seyanaveth', name: 'Anaveth', title: 'deva of the Eyrie', kind: 'monster', art: 'deva', monsterId: 'deva', shared: true,
      wants: 'The abbot healed, the gate shut and Edwy kept alive.',
      knows: 'The hollowmilk came from the dream-pool. The one who carried it "smelled of ink and lavender". The secret Abbot\'s stair. She cannot leave the warm water until her wings heal.',
      voice: 'Soft and musical, every sentence sung a little. She asks questions instead of giving orders.',
      appearance: 'A tall figure of pale gold light, her great wings grey and ragged as burned paper, sitting chin-deep in a steaming pool.',
      gmNotes: 'Deva stat block. She cannot fly or fight until healed (a heal or greater restoration, or a long rest in the springs). Healed, she joins the heroes for the Dream-Gate. If she does, use the tip on adding a glabrezu.',
    },
    {
      id: 'pf_seykrisskal', name: 'Krisskal the Rime-Chained', title: 'ice devil, ancient prisoner', kind: 'monster', art: 'iceDevil', monsterId: 'iceDevil',
      wants: 'One link of its chain broken. Then, in a year and a day, freedom.',
      knows: 'Exactly who has been visiting it, and what recipe it gave him. It knows the demon prince by name and hates him (devils and demons hate each other more than they hate mortals).',
      voice: 'A dry clicking whisper, very formal. Calls the heroes "petitioners".',
      appearance: 'A tall insect-faced devil of blue-white chitin with a long tail, frozen to the waist in black ice and wrapped in silver chain.',
      gmNotes: 'Ice devil stat block. A bargain sealed in its words is kept to the letter. It will name Corentin and the hollowmilk recipe for one broken link, and offer to "deal with the demon" for three. Do not let the heroes forget who they are bargaining with.',
    },
    {
      id: 'pf_seynhezzareth', name: 'Nhezzareth', title: 'herald of the Hollow Sleeper, marilith', kind: 'monster', art: 'marilith', monsterId: 'marilith',
      wants: 'To hold the gate open for her prince, and to be rewarded with this mountain.',
      knows: 'Szathmor will not keep his promise to Corentin: the old man will be the first thing he eats.',
      voice: 'A lullaby. She hums between her words, and her six hands keep time.',
      appearance: 'A serpent-bodied demon with six arms, scales the colour of a bruise, a face like a sleeping child\'s with its eyes stitched shut.',
      gmNotes: 'Marilith stat block. She comes up through the pool. While she is in the dark water, attacks against her have disadvantage. If the gate is shut, she is cut off from her prince and fights to the death in fury.',
    },
  ],
  handouts: [
    { id: 'founding-roll', title: 'The Founding Roll', text: 'In the first year of the Closed Eye, these swore to keep the Dreamer\'s sleep:\nThe dragon SAEVARIL, called the Patient, who shall be abbot while he lives, and whose mind shall be the lid upon the dream.\nIf ever he forgets himself, speak his name to him, ring the dawn, and give him the white flower in the warm water. He will come back to you.' },
    { id: 'dream-journal', title: 'A page of the Master\'s dream-journal', text: 'Night 40. She was there again by the water, laughing at me for forgetting my scarf.\nNight 52. The kind one says the way in is only a door, and doors open. It says Saev holds the door shut without knowing.\nNight 60. I could never hurt him. I would only help him sleep.\nNight 61. Forgive me, old friend. It is only for a little while.' },
    { id: 'maudrey-letter', title: 'Maudrey\'s last letter', text: 'My Cor,\nDon\'t you dare spend the rest of your life sitting by that pool looking for me. I have had a whole long happy one with you, and I want you to have the rest of yours. Teach the children. Drink your tea with Saev. Be brave about the ending, love. I\'ll be the one laughing at you for forgetting your scarf.\n- M.' },
    { id: 'prior-order', title: 'Order of the Prior', text: 'By my authority as Prior, the abbot\'s hall is closed.\nNo brother or sister, novice or master, shall climb the Silver Stair until the poisoner is found.\nAny who try will be stopped. I am sorry. I trust no one, and I include myself.\n- Ingrith' },
    { id: 'gate-log', title: 'The gate-log', text: 'Day 1. Snow. No pilgrims.\nDay 2. Master Venmore out to the shrine, for prayer. In at dusk.\nDay 3. Master Venmore out to the shrine, for prayer. In after dark. He looked very cold.\nDay 4. Master Venmore out to the shrine. Bell did not ring this morning. All wardens called to the courtyard.' },
  ],
  chapters: [
    {
      id: 'eyrie', title: 'The Silver Eyrie', level: 16,
      summary: 'The last climb to the monastery-citadel on the world\'s highest peak: switchbacks, a rope bridge over a chasm, the gate and the frozen courtyard where two factions of monks are about to fight. Inside, the bell tower, the scriptorium, the monks\' cells, the refectory, a snowy cloister garden, the great hall where the dragon-abbot lies poisoned, the broken wing where nightmares pour in, and the dream-pool sanctum. Underneath, ice caves and hot springs give another way in.',
      goal: 'Find the real traitor, wake the abbot, and shut the nightmare gate in the dream-pool before the demon prince\'s herald holds it open.',
      map: silverEyrie,
      npcs: [
        { npc: 'pf_seysaevaril', x: 36, y: 5 },
        { npc: 'pf_seyingrith', x: 36, y: 16 },
        { npc: 'pf_seycorentin', x: 16, y: 19 },
        { npc: 'pf_seyedwy', x: 64, y: 38, hidden: true },
        { npc: 'pf_seyanaveth', x: 72, y: 35 },
        { npc: 'pf_seyhamund', x: 30, y: 36 },
        { npc: 'pf_seykrisskal', x: 66, y: 47, hidden: true },
        { npc: 'pf_seynhezzareth', x: 63, y: 6, hidden: true },
      ],
      scenes: [
        {
          room: 'The rope bridge', title: 'The last climb', encounter: 'Wings over the chasm', handout: 'gate-log',
          read: 'The air is so thin your heart pounds at every step. The prayer flags along the path have been cut down and trampled into the snow. Halfway across the rope bridge it shudders, and five vulture-shapes the size of horses drop out of the clouds, screeching.',
          gm: 'Start the dream-tide clock at 10. The carved milestone on the Last Stair (DC 18 Arcana) shows a fresh demon summoning mark. The vrocks try to cut the bridge ropes (AC 12, 20 hit points per side; if both sides are cut, anyone on it must catch the planks, DC 18 Dexterity save). Heroes who take the Climbers\' chimney at the shrine, or go round through the ice caves from the cairn, avoid this fight. Show the gate-log when they pass the Outer gate.',
        },
        {
          room: 'Frozen courtyard', title: 'The schism in the snow', encounter: 'The schism in the snow', handout: 'prior-order',
          read: 'Two lines of monks face each other across the frozen fountain: grey robes and white, staffs raised. A red-bearded giant of a monk bellows that the Prior is a traitor, and from the stair a woman\'s voice answers: "Come and say it to my face, Hamund."',
          gm: 'Brother Hamund and the Grey Brothers (veterans, gladiators and priests) are about to storm the Silver Stair. Stop it with a DC 20 Persuasion or Intimidation, or promise to find the traitor (DC 16). If the heroes do nothing, the fight starts and three monks die each round. Then the Silver Stair: Prior Ingrith and her White Wardens will not let anyone up. They step aside for proof the heroes are not the demon\'s (a zone of truth, a DC 20 Persuasion backed by evidence) or for the real poisoner; attacked, they fight as The Prior\'s line. The gallows is for Edwy, who has run away.',
        },
        {
          room: "Master Venmore's study", title: 'A kind old man',
          read: 'A tiny old man with ink on every finger takes your hands in his. "Oh, my dears. Oh, thank the Dreamer. Come in, come in out of the cold. You must help us. The Prior has gone quite mad."',
          gm: 'Corentin is warm, helpful and lying. He tells the truth about the dream, the abbot and the keys (he wants the abbot woken only after the gate is open, so he points them at the slowest key). He suggests the Prior "has always wanted the abbot\'s seat", and sadly mentions Edwy. DC 22 Insight: he is grieving and hiding something; DC 18 Perception: dream-pool clay on his hem. He offers to guide them to the scriptorium, then slips away to the sanctum. Searched later, his study holds the journal and the letter.',
          handout: 'dream-journal',
        },
        {
          room: 'Scriptorium', title: 'The forgotten brothers', encounter: 'The forgotten brothers', handout: 'founding-roll',
          gm: 'Wraiths at the desks. Taking the Founding Roll from the reliquary sets them off. Saying a wraith\'s name (from the cell doors) makes it hesitate a round. The Roll names the abbot and the three keys.',
          treasure: 'In the reliquary: the Founding Roll, a spell scroll of greater restoration, an ioun stone (insight) the first abbot wore, and 2,000 gp of gold leaf and silver ink.',
        },
        {
          room: 'Dormitory walk', title: 'Faces in the cells', encounter: 'Faces in the cells', optional: true,
          gm: 'Six "monks" in the cells are doppelgangers wearing the faces of missing brothers, plus two invisible stalkers that whisper accusations. They try to split the party and lead them to the Prior\'s cell. The Prior\'s cell and the Novice cell hold the two key clues: the planted vial (DC 18 Investigation to see it was planted) and the honey jar labelled in the Master\'s hand.',
          treasure: 'Hidden in the Prior\'s footlocker: her old mercenary purse, 1,500 gp, and a +2 shield she has not carried in forty years.',
        },
        {
          room: 'Bell tower', title: 'Ring the dawn', encounter: 'Shadows in the bells',
          read: 'The bell ropes sway, though there is no wind. Then the dark shapes hanging among them unfold, and they are not habits at all.',
          gm: 'Three cloakers. Ringing the Dawn Bell (DC 20 Athletics, or two heroes at DC 15) is one key to wake the abbot, but the abbot must be able to hear it (the Great hall is in earshot). It also advances the dream-tide by one. Heroes who came up the chimney arrive here first.',
        },
        {
          room: 'Cloister garden', title: 'The white flower', encounter: 'The dreaming cedar', optional: true,
          read: 'Under the snow, at the roots of the great cedar, something glows white like a candle under a sheet. Then the cedar turns its head.',
          gm: 'Snowbloom grows only here. The treant can be calmed (DC 20 Nature or Religion, or singing the evening hymn which Edwy, Ingrith and Hamund all know). Calm, it hands over a snowbloom and blesses the heroes: each gains 20 temporary hit points until the next long rest.',
          treasure: 'A snowbloom (the second half of the tea), and from the cedar\'s hollow, a staff carved by the first monks: a staff of frost.',
        },
        {
          room: 'Hot spring baths', title: 'The deva in the steam',
          read: 'In the deepest pool sits a figure of pale gold light, her wings grey and ragged. Behind her, a boy with a shaved head peeks out, shaking. "Please," the deva sings. "He is a child. Listen to him first."',
          gm: 'Anaveth and Edwy. Edwy tells his story: the honey came from the Master. Anaveth adds that the poison smelled of ink and lavender, and shows the secret Abbot\'s stair. Water from the source makes the snowbloom tea (DC 16 Medicine or herbalism kit). A long rest here is safe (advance the dream-tide by 3). Healing Anaveth lets her join the final fight.',
        },
        {
          room: 'Rime prison', title: 'The devil\'s bargain', encounter: 'The Rime-Chained', optional: true,
          read: 'The thing in the ice smiles with a mouth like pincers. "Petitioners," it clicks. "You want a name. I have one. Shall we bargain?"',
          gm: 'Krisskal names Corentin and the recipe for one broken chain link (it walks free in a year and a day: a fine hook for a later adventure). For three links it offers to hunt the marilith: tempting and terrible. Refused or attacked, it fights with its tamed young white dragon.',
          treasure: 'At its feet, gifts from Corentin and older offerings: 4,000 gp in old coins, a ring of free action and a crystal ball (the old abbots spied on the devil with it). In the Crevasse of the lost nearby, 30 ft down (DC 17 Athletics): a suit of silver dragon scale mail made for the abbot from scales he shed, and a potion of supreme healing.',
        },
        {
          room: 'The broken wing', title: 'Where the nightmares feed', encounter: 'The rift opens',
          read: 'In the refectory, something bloated sits in the abbot\'s chair, licking wax from its claws. "Sit, sit," it says kindly. "Tell me who you think did it, and I will tell you if you are warm." Beyond the kitchen, a crack the colour of a bruise breathes out cold.',
          gm: 'First the refectory (The feast of hunger, optional): the glabrezu lies, always against the Prior, and will leave for the name of someone the heroes love. The cooks in the kitchen saw the Master carry a covered bowl up the stair. Then the broken wing, the nightmares\' door into the Eyrie: a nalfeshnee leads the fresh ones out of the rift. From here the rubble passage climbs straight to the sanctum (the fastest way, and the loudest). Fighting here does not close the rift; only shutting the gate does.',
        },
        {
          room: 'Great hall of the abbot', title: 'Who am I?', encounter: 'The abbot forgets',
          read: 'The great silver head swings toward you, and you see that the dragon\'s eyes are full of tears. "Who are you?" it asks, in a voice that shakes snow from the walls. "Who am I? Why does the door hurt?"',
          gm: 'Use the keys. Each key used (name spoken, bell rung, tea given) calms him; with two he wakes, weeps, remembers everything and flies at once for the sanctum. If the heroes push for the east door without keys, he fights (he does not breathe on anyone who has spoken his name). At 0 hit points he falls asleep, and the keys still work.',
          treasure: 'Awake, he gives his thanks: a holy avenger from his hoard for whoever spoke his name, and his hoard\'s gold (8,000 gp) to share.',
        },
        {
          room: 'Dream-pool sanctum', title: 'The Dream-Gate', encounter: 'The Dream-Gate',
          read: 'The pool has turned black. A little old man stands in it up to his knees, holding out his arms like someone waiting to be hugged. Something with six arms is rising out of the water behind him, humming a lullaby.',
          gm: 'Nhezzareth the marilith comes up through the gate with a nalfeshnee and two glabrezus. Corentin joins the demons unless turned (DC 22 Persuasion, advantage with Maudrey\'s letter or the abbot\'s plea); with him fighting, this is at the top of high. Shutting the gate takes the abbot\'s action, or three successful DC 20 Religion or Charisma checks by heroes standing in the dark water. When the gate shuts, the demons can no longer be healed or reinforced, and the rift in the broken wing closes.',
          treasure: 'Corentin\'s staff of power (if he falls or gives it up), and on the pool\'s floor, the stones the monks threw in for luck over a thousand years: 5,000 gp in gems.',
        },
      ],
      wrapUp: 'When the gate shuts, the pool clears and shows stars again. The Dawn Bell rings by itself, and down in the valleys, people wake from good dreams for the first time in nine days.',
    },
  ],
  ending:
    'Win: the gate is shut and the abbot is awake. He forgives Corentin and asks the heroes to decide his fate with him: exile, penance or a quiet death by the pool with Maudrey\'s letter in his hand. The Prior and Hamund make peace, Edwy becomes the abbot\'s new student, and the heroes are welcome in the Eyrie forever, with a dream each night that shows them one true thing. Lose: Nhezzareth holds the gate and Szathmor rides the dream out into the world. Every sleeper on the continent dreams of him, and some of those dreams walk. The abbot, awake or not, goes down into the pool to hold the door with his own body, and the heroes must find another way to shut it. Next: Krisskal, if they broke its chain, walks free in a year and a day, and it remembers who owes it. And Szathmor now knows the heroes\' names, and visits their dreams.',
};
