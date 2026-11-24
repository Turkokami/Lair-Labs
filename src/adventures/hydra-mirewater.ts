// The Hydra of Mirewater: a swamp one-shot for four heroes of level 11.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function nineMouths() {
  const b = new MapBuilder('adv-hydra-mirewater', 'The Nine Mouths of Mirewater', 80, 80, { theme: 'wood', wallStyle: 'wood', ambient: 'dim', floor: 'grass', open: true });
  const r = rng(4417);

  // ----- the delta: shallow water everywhere, a deep channel down the middle -----
  b.water(0, 0, 80, 80);
  for (let y = 0; y < 80; y++) {
    const cx = 42 + Math.round(3 * Math.sin(y / 7));
    b.water(cx - 3, y, 7, 1, true);
  }
  b.area('The Nine Mouths', [[39, 18, 9, 14]], {
    read: 'A wide brown channel slides past, slow and deep. Bubbles rise from below in long lines, and every so often a log turns over that is not a log.',
    gm: 'The deep channel splits the delta. Swimming it: DC 14 Athletics each round or be swept 10 ft downstream; a creature that ends a turn in deep water has a 1 in 6 chance of drawing a giant crocodile. Crossings: Heronneck Bridge (north), the eel weir (middle), any boat, or the hidden causeway from the shrine (south).',
  });
  b.props_('deep-water', [[42, 4], [44, 26], [40, 44], [42, 56]]);
  b.props_('log-fallen', [[41, 22], [43, 50]]);

  // mangrove tangles nobody can get through
  b.rock(33, 39, 4, 9).rock(0, 0, 4, 3).rock(76, 24, 4, 4).rock(48, 27, 3, 4);
  b.props_('tree-swamp', [[32, 40], [32, 45], [37, 42], [3, 3], [75, 26], [51, 28]]);

  // scattered reeds, lily pads and dead trees on the open water
  const scatter: [string, number][] = [['reeds', 26], ['lily-pads', 18], ['tree-swamp', 10], ['tree-dead', 5]];
  const busy = (x: number, y: number) =>
    (x < 37 && y > 44) || (x > 50 && y > 24 && y < 59) || (x > 50 && y < 23) || (x < 20 && y < 20) || (x > 37 && x < 49);
  for (const [kind, n] of scatter)
    for (let i = 0, tries = 0; i < n && tries < 400; tries++) {
      const x = 1 + Math.floor(r() * 78), y = 1 + Math.floor(r() * 78);
      if (busy(x, y) || !b.isFloor(x, y)) continue;
      b.prop(kind, x, y, Math.floor(r() * 4) * 90);
      i++;
    }

  // ----- north-west: the reed islands -----
  b.cave(null, 11, 12, 8, 7, { seed: 61, mat: 'dirt' });
  b.building("The Aunties' hut", 7, 9, 8, 6, {
    mat: 'wood-planks-dark', doors: [[10, 14, 's', 'closed']], windows: [[14, 11, 'e']],
    read: 'A crooked hut on stilts of bone-white driftwood. Jars hang from the eaves, each with something floating in it. Inside, three old women sit around one pot, and all three look up at once.',
    gm: 'The Mire Aunties: Velvetmoss (green hag), Brinewhisk (sea hag) and Nightjar (night hag), with two will-o\'-wisps as lamps. They know the whole truth (see Velvetmoss) and sell it. Price for the truth: a true secret from each hero, or a year of one hero\'s dreams (Nightjar visits once a month). They fight only if attacked or cheated. DC 20 Insight: they are afraid of what sleeps under the temple.',
  });
  b.props_('cauldron', [[10, 11]]).props_('shelf-jars', [[8, 10], [13, 10]]).prop('herbs-drying', 12, 13).prop('rocking-chair', 8, 12).prop('bones', 13, 12).prop('candles', 11, 10);
  b.area('Bone-reed island', [[4, 6, 15, 12]], {
    read: 'The reeds here have been woven into shapes: little people, fish, a nine-necked thing with stones for eyes. Pale lights bob between them, always just out of reach.',
    gm: 'The Aunties\' island. Two will-o\'-wisps drift here and lead strangers into the deep channel unless someone says "Good evening, Aunties" aloud (any hero who passes a DC 15 Arcana check guesses the courtesy). The reed figure of the hydra has nine stones for eyes; one is a moonstone (50 gp).',
    label: [6, 16],
  });
  b.props_('scarecrow', [[5, 7], [17, 15]]).props_('reeds', [[4, 12], [16, 7], [18, 11]]).prop('cairn', 6, 16).prop('fishing-net', 15, 17).prop('canoe', 2, 13, 90);
  b.light(11, 12, 10, 15, '#9fe870').light(6, 15, 5, 10, '#b8f5ff').light(16, 8, 5, 10, '#b8f5ff');
  b.encounter('The Mire Aunties', [3, 5, 16, 14], [['greenHag', 1], ['seaHag', 1], ['nightHag', 1], ['willOWisp', 2]], 'low');

  // the reed path down to the sedge flats
  b.floor(11, 19, 2, 10, 'mud');
  b.props_('reeds', [[10, 21], [13, 25]]);

  b.cave('Sedge flats', 14, 34, 10, 6, {
    seed: 62, mat: 'grass',
    read: 'A long, low island of sedge grass that squelches underfoot. Drying racks of eel skins stand in rows, and an old rope bridge runs south to the town.',
    gm: 'Where Mirewater\'s eel-catchers dry their catch. Safe ground for a short rest. Tracks (DC 14 Survival): a dozen booted feet crossed here at night ten days ago, heading north-east with something heavy on poles: the stolen tithe.',
  });
  b.props_('herbs-drying', [[8, 33], [10, 33], [12, 33]]).props_('fishing-gear', [[18, 36]]).prop('campfire-cold', 15, 31).prop('rowboat', 5, 35, 90).prop('log-pile', 21, 34).prop('lean-to', 9, 37);
  b.mud(19, 37, 3, 2);

  b.cave('Moss bog', 27, 24, 7, 5, {
    seed: 63, mat: 'grass',
    read: 'Hummocks of green moss rise out of black water, each the size of a cow. The air is thick enough to drink. One of the hummocks breathes.',
    gm: 'Three shambling mounds sleep here. They wake at noise (any fight, or a failed DC 15 group Stealth). Fire makes them retreat into the water for a round. A dead treasure-hunter is half digested inside the largest one.',
  });
  b.mud(23, 22, 4, 3).mud(29, 25, 3, 2);
  b.props_('mushrooms', [[25, 21], [31, 23]]).props_('mud-patch', [[22, 26], [30, 21]]).prop('skeleton-lying', 27, 27).prop('backpack', 28, 27).prop('quicksand', 33, 24);
  b.encounter('Walking moss', [20, 19, 14, 10], [['shamblingMound', 3]], 'low');

  // ----- north: the crocodile slough and Heronneck Bridge -----
  b.cave(null, 31, 8, 7, 5, { seed: 64, mat: 'mud' });
  b.mud(27, 6, 3, 2).mud(33, 9, 3, 3);
  b.area('Crocodile slough', [[24, 2, 14, 12]], {
    read: 'Warm mud banks, flattened smooth. Something has dragged a whole stilt-house door up here and gnawed it. A dozen pairs of yellow eyes sit just above the water, watching.',
    gm: 'Basking ground for crocodiles. They are full of the hydra\'s leftovers and slow: a hero who moves at half speed and passes a DC 16 group Stealth gets by unseen. Throwing them meat buys one round of distraction.',
  });
  b.props_('bones-mud', [[29, 7], [34, 6]]).prop('door-broken', 31, 9).props_('log-fallen', [[26, 10], [36, 4]]);
  b.encounter('Slough crocodiles', [24, 2, 14, 12], [['giantCrocodile', 2], ['crocodile', 4]], 'low');

  b.floor(36, 14, 17, 2, 'wood-planks');
  b.area('Heronneck Bridge', [[36, 14, 17, 2]], {
    read: 'A rope bridge of tarred planks sags low over the channel, so low the water licks it in the middle. Herons have nested in the posts at each end.',
    gm: 'The north crossing. In the middle the planks are wet: DC 13 Acrobatics to run, and anything big in the water below gets a free bite at anyone who falls. The Copperhook Company has cut through one rope halfway (DC 15 Perception to notice): a creature over 200 lb on the middle section snaps it, and everyone on the bridge makes a DC 15 Dexterity save or drops into the deep channel.',
    label: [44, 14],
  });
  b.props_('bridge-rope', [[39, 14], [44, 14], [49, 14]], 90).props_('mooring-post', [[36, 15], [52, 15]]);

  // ----- north-east: the Copperhook camp on the wreck of the Bellwether -----
  b.cave(null, 64, 13, 13, 9, { seed: 65, mat: 'dirt' });
  b.area('Copperhook camp', [[52, 4, 25, 18]], {
    read: 'Tents and cook-fires crowd a mud island around the wreck of a river barge, beached and leaning. Men in copper-buttoned coats sharpen long hooks and boat-spears. Under a tarp sits a painted raft built like a little house, and a stack of barrels with the town\'s mark.',
    gm: 'The treasure-seekers\' base: about a dozen hirelings, their quartermaster (a mage), two pit-fighters and two captains. Magister Ashlocke and Sabeline are at the temple dig unless the heroes come at night (then Sabeline is here). The painted raft is the Tithe Ark; the barrels hold the salted tithe and the cask of drowsewater. The nine tithe hogs were eaten. Disguised heroes (DC 16 Deception) can walk in as new hires; the quartermaster will happily sell "hydra-hunting supplies" and brag.',
    label: [64, 18],
  });
  b.building('The Bellwether', 58, 8, 13, 6, {
    mat: 'wood-planks-dark', doors: [[64, 13, 's', 'open'], [58, 10, 'w', 'closed']], windows: [[62, 8, 'n'], [67, 8, 'n']],
    read: 'The barge\'s hold has become an office. Maps of the delta cover one wall, pinned with copper hooks. A long table holds a ledger, a broken lantern and a sketch of nine snake heads with a line through each.',
    gm: 'Ashlocke\'s journal lies on the table (handout). A chest under the bunk holds the town\'s tithe silver. The map marks the temple, the hydra pools, and "the throat?" with a question mark (the secret water passage, not yet found).',
  });
  b.props_('table-maps', [[61, 10]]).props_('strongbox', [[69, 11]]).prop('bunk-bed', 69, 9).prop('map-cabinet', 59, 9).prop('lantern-hanging', 64, 10).prop('scroll-pile', 62, 12);
  b.props_('tent', [[54, 8], [55, 16], [72, 16]]).props_('tent-bell', [[60, 18]]).prop('tent-command', 73, 7).props_('campfire-spit', [[57, 13], [68, 17]]);
  b.props_('barrel-stack', [[65, 6], [66, 6]]).prop('cargo-crates', 63, 6).prop('rowboat', 52, 12, 90).prop('canoe', 53, 18).prop('weapon-rack', 71, 13).prop('training-dummy', 75, 12).prop('cage', 70, 19).prop('banner-pole', 60, 15).prop('ship-mast', 71, 10);
  b.prop('handcart', 66, 19).prop('gm-treasure', 65, 6, 0, { gm: true });
  b.light(57, 13, 10, 20, '#ffb35c').light(68, 17, 10, 20, '#ffb35c').light(64, 10, 5, 10, '#ffd27a');
  b.encounter('Copperhook camp', [52, 4, 25, 18], [['mage', 1], ['gladiator', 2], ['veteran', 4], ['banditCaptain', 2]], 'moderate');

  // ----- the middle: the eel weir and Sesh's hut -----
  b.floor(30, 34, 22, 1, 'wood-planks');
  b.area('The eel weir', [[30, 34, 22, 1]], {
    read: 'A fence of woven stakes crosses the whole channel, with a plank walk on top no wider than a boot. Eels thrash in the traps below it. On the far side, grey steps climb out of the water to a temple that is half drowned.',
    gm: 'The middle crossing, one creature wide. Anyone fighting on it makes a DC 12 Dexterity save when hit or falls in. Sesh-of-the-Reeds owns it and charges a toll (a fish hook or a coin each); he will close the weir gate (a 5-ft gap opens in the middle) on anyone who doesn\'t pay.',
    label: [40, 34],
  });
  b.props_('fishing-net', [[37, 34], [45, 34]]).prop('fence-gate', 41, 34);
  b.building("Sesh's weir-hut", 31, 30, 5, 4, {
    mat: 'wood-planks', doors: [[33, 33, 's', 'open']],
    read: 'A one-room hut that smells of smoke and eel. A clay idol with nine little necks sits by the door, with a fish laid in front of it.',
    gm: 'Sesh lives here. He keeps the old reedkin offering to the hydra and is the best guide in the delta: for a fair price he paddles the heroes anywhere by canoe, including the hidden causeway if they have found it.',
  });
  b.prop('idol', 34, 31).prop('hammock', 32, 31).prop('fish-crate', 32, 32).prop('canoe', 30, 32, 90);
  b.light(33, 32, 5, 10);

  // ----- south-west: the stilt town of Mirewater -----
  b.floor(1, 70, 8, 4, 'wood-planks');
  b.area('Ferry landing', [[1, 70, 8, 4]], {
    read: 'The ferry bumps against a landing of grey planks. Mirewater stands all around you on stilts: houses, walks and bridges a man\'s height above the water. It is hot, it is wet, and the bells on every porch are ringing at once.',
    gm: 'The heroes arrive here. The bells mean a house was taken last night (the third this month). Townsfolk will point the heroes to the Reeve\'s hall, and a man in a copper-buttoned coat hands them a bounty notice (handout).',
    label: [4, 71],
  });
  b.props_('dock-pier', [[1, 71], [1, 72]], 90).props_('mooring-post', [[1, 70], [1, 73], [8, 73]]).prop('rowboat', 0, 75).prop('canoe', 3, 75).prop('signpost', 7, 70).prop('lantern-hook', 8, 71).prop('rope-coil', 5, 73);
  b.light(8, 71, 10, 15);
  b.start(2, 70, 3, 3);

  // boardwalks: a loop round the middle of town, a spine north to the sedge flats
  b.floor(9, 71, 24, 2, 'wood-planks');
  b.floor(14, 30, 2, 41, 'wood-planks');
  b.floor(28, 48, 2, 23, 'wood-planks');
  b.floor(14, 46, 16, 2, 'wood-planks');
  b.area('Mirewater boardwalks', [[14, 46, 16, 2], [14, 48, 2, 23], [28, 48, 2, 23], [9, 71, 24, 2]], {
    read: 'Plank walks a stride wide run between the houses, with rope rails worn shiny by hands. Below, the water is the colour of tea, and things move in it.',
    gm: 'The town\'s streets. Mirewater folk are frightened, sticky with sweat and short-tempered: they want the hydra dead, and most have heard the Company will do it for 3,000 gp. Anyone falling off a walk lands in shallow water (no harm, but loud). At night, two lanterns hang at every corner and the bells ring if anything big moves under the walks.',
    label: [21, 46],
  });
  b.props_('lantern-hook', [[14, 47], [29, 47], [15, 60], [28, 60], [15, 72]]).prop('notice-board', 15, 49).prop('bench', 29, 55).prop('water-barrel', 14, 66);
  b.props_('bridge-rope', [[14, 36], [14, 41]]);
  for (const [x, y] of [[14, 47], [29, 47], [15, 60], [28, 60], [15, 72], [27, 72]]) b.light(x, y, 10, 15);

  b.building("Reeve's hall", 17, 49, 10, 8, {
    mat: 'wood-planks', doors: [[17, 52, 'w', 'closed', 'door-double'], [26, 53, 'e', 'closed']], windows: [[20, 49, 'n'], [23, 49, 'n'], [22, 56, 's']],
    read: 'A long hall hung with nets and old oars. Someone has painted nine snake heads over the door and then, recently, tried to scrub them off. The Reeve sits at the end of a table covered in petitions, fanning herself with one.',
    gm: 'Reeve Prudence Tamsworth meets the heroes. She offers 2,000 gp (all the town has) to "end it", and does not mention the pact. DC 17 Insight: she is hiding something. Pressed, or shown the pact from the shrine, she admits the tithe is a bargain, not a superstition, and begs the heroes to fix the bargain, not kill the beast. The scrubbed paint: she ordered it, to please the angry town.',
  });
  b.floor(16, 52, 1, 1, 'wood-planks').floor(27, 53, 1, 1, 'wood-planks');
  b.prop('table-long', 21, 52, 90).props_('chair-high-back', [[25, 52]]).props_('chair', [[19, 51], [19, 54], [22, 51]]).prop('scroll-pile', 24, 54).prop('fishing-net', 18, 50).prop('banner-hanging-tall', 26, 50).prop('lantern-hanging', 22, 53);
  b.light(22, 53, 10, 15);

  b.building('The Lazy Heron', 17, 59, 10, 9, {
    mat: 'wood-planks-dark', doors: [[17, 63, 'w', 'open'], [26, 62, 'e', 'closed']], windows: [[17, 60, 'w'], [26, 66, 'e'], [21, 67, 's']],
    read: 'The only inn in Mirewater smells of fried eel and stale beer. A big ceiling fan made of a sail turns slowly, pulled by a sleepy boy on a rope. Every conversation stops when you come in, and starts again about the hydra.',
    gm: 'Gossip (one per round of drinks, or DC 13 Persuasion): the Company came three months ago "to dig for old gold"; the tithe barge went missing ten days ago, the night after Ebbert Drane paid off his debts; the hydra never came past the weir before; Sesh-of-the-Reeds says the town broke the deal, not the beast. Rooms 5 sp. A safe long rest.',
  });
  b.floor(16, 63, 1, 1, 'wood-planks').floor(27, 62, 1, 1, 'wood-planks');
  b.prop('bar-counter', 24, 60, 90).prop('keg-rack', 25, 66).props_('table-round', [[19, 61], [19, 65], [22, 64]]).props_('stool', [[20, 61], [20, 65], [23, 64]]).prop('dartboard', 18, 66).prop('hearth-oven', 25, 60).prop('tavern-sign', 16, 63);
  b.light(22, 62, 10, 20).light(16, 63, 5, 10);

  b.building('Tithe-house', 4, 48, 8, 7, {
    mat: 'wood-planks', doors: [[11, 51, 'e', 'locked', 'door-iron']], windows: [[4, 50, 'w']],
    read: 'A stout storehouse on thick stilts, its iron door hanging by one hinge. Inside, painted ropes and garlands lie on an empty floor, and nine iron rings stand bolted in a row where something was tied.',
    gm: 'Where the tithe waited: nine hogs, salted eel, a chest of silver and a cask of drowsewater, loaded each spring onto the Tithe Ark (a raft built like a little house) and floated to the pools. All gone. The lock was opened with a key, then the door smashed to hide it (DC 15 Investigation). Ebbert Drane keeps the only key. A copper coat-button lies under a ring (DC 13 Perception).',
  });
  b.floor(12, 51, 2, 1, 'wood-planks');
  b.props_('wall-chains', [[5, 49], [7, 49], [9, 49]]).prop('lectern', 6, 53).prop('rope-coil', 9, 53).prop('flowers', 5, 52).prop('crate', 10, 49);

  b.room('Eel market', 3, 58, 9, 8, {
    mat: 'wood-planks-dark',
    read: 'An open platform of stalls, half of them empty. Eels writhe in barrels, a woman guts catfish with a curved knife, and an old man mends a trap with his teeth, cursing the hydra between bites.',
    gm: 'Market gossip points the heroes to Marl Oduya, a boy who now sits all day at Broken Row. He lost his house (and his gran) two nights ago. He saw it: the hydra did not eat the house, it tore it open and nosed through it, "like Gran looking for her keys", then took what it found. He also saw copper-coat men in a boat on the night the tithe went. He will not talk to anyone who calls the hydra a monster in front of him.',
  });
  b.floor(12, 61, 2, 1, 'wood-planks');
  b.props_('market-stall', [[4, 59], [7, 59], [10, 59]]).props_('fish-crate', [[4, 63], [6, 64]]).prop('barrel-group', 10, 64).prop('scales', 8, 62).prop('butcher-block', 5, 61);
  b.light(7, 61, 10, 15);

  b.building('Net-loft', 3, 42, 7, 4, {
    mat: 'wood-planks', doors: [[9, 43, 'e', 'closed']],
    read: 'Nets hang from every beam, drying, mending, rotting. A ladder goes up to a sleeping loft.',
    gm: 'Ebbert Drane\'s loft. He is here, drunk, packing to run. The 200 gp the Company paid him is in his boot. He took it to pay a healer for his daughter\'s marsh-fever. He confesses at DC 14 Intimidation or Persuasion, or at once if the heroes are kind about it.',
  });
  b.floor(10, 43, 4, 1, 'wood-planks');
  b.props_('fishing-net', [[4, 43], [6, 43]]).prop('ladder', 8, 44).prop('straw-bed', 4, 44).prop('backpack', 6, 44).prop('lantern-hanging', 7, 43);
  b.light(7, 43, 5, 10);

  b.building('Smokehouse', 2, 63, 6, 5, {
    mat: 'wood-planks-dark', doors: [[4, 67, 's', 'open']],
    read: 'Smoke and the smell of eel pour out of a shed hung with rows of split, browning fish.',
    gm: 'Dressing and a place to hide. Under the floor (DC 12 Investigation) the smoker keeps a small stash: 40 gp and a potion of water breathing.',
  });
  b.floor(4, 68, 1, 2, 'wood-planks');
  b.props_('herbs-drying', [[3, 64], [5, 64]]).prop('fire-bowl', 4, 65).prop('firewood', 6, 66);
  b.light(4, 65, 5, 10, '#ff9a3c');

  b.building('Shrine of the Low Lantern', 31, 55, 6, 8, {
    mat: 'stone-flagstone', doors: [[31, 58, 'w', 'closed'], [36, 60, 'e', 'secret']],
    read: 'A tiny stone shrine, the only stone building in town, green with moss. Inside, a mural shows robed figures with lanterns walking on the water toward a temple, and nine long necks rising behind it like a wall.',
    gm: 'Older than the town. The mural is a map: the robed figures walk east from this very wall along a line of lily pads (the hidden causeway). DC 16 Investigation finds the secret door in the east wall, and behind the altar a loose stone (DC 14) hides the reliquary: the old pact (handout) and a hooded brass lantern. Carrying the lit lantern lets the bearer and anyone within 10 ft pass the temple\'s guardians unharmed.',
  });
  b.floor(30, 58, 1, 1, 'wood-planks');
  b.prop('altar', 35, 58).prop('shrine', 35, 56).props_('candles', [[32, 56], [32, 61]]).prop('offering-bowl', 34, 58).prop('prayer-kneeler', 33, 58).prop('reliquary', 35, 61).prop('gm-secret-door', 36, 60, 0, { gm: true });
  b.light(34, 58, 10, 15, '#ffd27a');

  b.area('Broken Row', [[19, 73, 18, 7]], {
    read: 'The walk ends in splinters. Where four houses stood there are only stilts, snapped off at the water, and floating rubbish: a cradle, a door, a bobbing straw hat. Men in copper-buttoned coats are poling a skiff between the wrecks, fishing things out.',
    gm: 'The hydra took these houses. The Company\'s "salvage crew" is looting what floats, under the pretence of looking for survivors. They have orders to keep the town angry. They back off from a show of force (DC 16 Intimidation), or fight. One of them carries a letter of pay from Ashlocke (proof the Company is behind the theft, DC 12 Investigation to find on a body or by pickpocket).',
  });
  b.floor(30, 73, 2, 3, 'wood-planks').floor(21, 75, 4, 3, 'wood-planks').floor(33, 76, 3, 2, 'wood-planks');
  b.props_('debris-wood', [[23, 74], [27, 76], [34, 74], [20, 78]]).props_('mooring-post', [[22, 74], [26, 74], [33, 75], [35, 78]]).prop('broken-furniture', 22, 76).prop('door-broken', 29, 77).prop('crib', 25, 78).prop('rowboat', 28, 75).prop('crumbling-ledge', 31, 75);
  b.encounter('Salvage crew', [19, 73, 18, 7], [['veteran', 4], ['banditCaptain', 1], ['scout', 6]], 'low');

  // the hidden causeway: a line of shallows under the lily pads, from the shrine to the pools
  b.water(37, 60, 13, 1);
  b.water(49, 60, 1, 4);
  b.area('The hidden causeway', [[37, 60, 13, 1], [49, 60, 1, 4]], {
    read: 'Just under the lily pads your foot finds stone: a road, a foot below the water, wide enough for one. It runs straight across the deep channel as if the channel were not there.',
    gm: 'The Tidekeepers\' road to their temple, sunk when the delta drowned. It ends at the edge of the hydra pools. Walking it is safe and quiet, and the hydra treats anyone who arrives by it as a tithe-bringer: it watches, but does not attack first. Only found from the shrine\'s mural, the old pact or Sesh.',
    label: [43, 60],
  });
  b.props_('lily-pads', [[39, 60], [42, 60], [45, 60], [48, 60]]).prop('gm-secret-door', 37, 60, 0, { gm: true });

  // ----- east: the drowned temple of the Tidekeepers -----
  b.room('Temple steps', 52, 33, 4, 12, {
    mat: 'stone-flagstone',
    read: 'Wide grey steps climb out of the channel to a wall of carved pillars. Every step is cut with waves, and every wave with a little lantern. Fresh boot-scuffs and drag marks lead up them.',
    gm: 'The west way in. The Company comes and goes this way by boat. Their marks lead around the wall to the south (the bell tower dig).',
  });
  b.props_('stairs-up', [[53, 38], [53, 40]], 90).props_('statue-tall-robed', [[52, 34], [52, 43]]).prop('rowboat', 51, 39).prop('mooring-post', 55, 44);

  b.room('Flooded colonnade', 56, 32, 14, 18, {
    mat: 'stone-flagstone',
    read: 'A courtyard of fallen pillars, knee-deep in still water so clear you can see the mosaics under it: lanterns, waves, a hydra curled around a door. Two pillars of water stand up out of the pool and turn to face you.',
    gm: 'The Tidekeepers\' guardians: two water elementals bound to the pool, and two chuul in the deep corners. They attack anyone without the shrine\'s lantern. With the lantern lit, they bow and sink. The mosaic tells the story: the priests bred the hydra to guard the door (DC 15 History or Religion to read it).',
  });
  b.water(58, 35, 10, 12, false, true).water(61, 39, 4, 4, true, true);
  b.wallRun(56, 32, 14, 'n').wallRun(56, 49, 14, 's').wallRun(56, 32, 18, 'w').wallRun(69, 32, 18, 'e');
  b.door(56, 38, 'w', 'open', 'door-double').door(56, 39, 'w', 'open', 'door-double');
  b.props_('pillar-broken', [[57, 34], [67, 34], [57, 47], [67, 47]]).props_('column-fallen', [[60, 37], [65, 44]]).prop('fountain-grand', 62, 40).props_('lily-pads', [[59, 45], [66, 36]]).props_('statue-tall-winged', [[57, 40], [68, 40]]);
  b.light(62, 40, 15, 20, '#7fd8ff');
  b.encounter('Colonnade guardians', [56, 32, 14, 18], [['waterElemental', 2], ['chuul', 2]], 'low');

  b.building('Ossuary of the Tidekeepers', 57, 25, 12, 7, {
    mat: 'stone-flagstone', doors: [[62, 31, 's', 'closed', 'door-iron']],
    read: 'Shelves of skulls rise to the ceiling, each with a tiny brass lantern set in its eye. Water drips. At the far end, a woman in rotted robes stands with her back to you, holding up a lantern with no flame.',
    gm: 'High Tidekeeper Ilvane\'s ghost and four drowned priests (wights). The wights attack; the ghost does not, unless the heroes harm the bones. When the wights fall, or if the heroes show the shrine\'s lantern, Ilvane speaks: the Lamp of Nine Mouths in the sanctum keeps "the Sleeper" dreaming; the hydra is its watchdog; "the lamp must never leave the door."',
  });
  b.props_('ossuary-shelf', [[58, 26], [60, 26], [64, 26], [66, 26]]).props_('skull-pile', [[58, 30], [67, 30]]).prop('sarcophagus-effigy', 62, 27).props_('candle-stand-tall', [[59, 28], [65, 28]]).prop('tomb-niche', 67, 27);
  b.light(62, 27, 10, 15, '#a8c8ff');
  b.encounter('Drowned priests', [57, 25, 12, 7], [['ghost', 1], ['wight', 4]], 'low');

  b.building('The Drowned Door', 70, 35, 9, 13, {
    mat: 'marble', doors: [[70, 41, 'w', 'closed', 'door-double'], [74, 47, 's', 'secret']],
    read: 'A round chamber, its roof long fallen in, open to the grey sky. In the floor is a door of green bronze ten feet across, set flat like a well cover, and on its centre burns a lamp: a small, plain thing with a flame the colour of the sea. The water around the door is very, very still.',
    gm: 'The heart of it all. Under the bronze door sleeps Ul-Mereth, an aboleth. The Lamp of Nine Mouths keeps it dreaming; the hydra keeps everything else away. If the Lamp is lifted from the door, the door cracks and Ul-Mereth rises with its servants (the high fight). If the heroes stop the Company and leave the Lamp, nothing happens: the best ending. The south wall hides a secret door (DC 18 Perception) into the Guardian\'s throat.',
  });
  b.water(72, 39, 5, 5, true);
  b.prop('lock-plate', 74, 41).prop('light-orb', 74, 41).props_('column-fluted', [[71, 36], [77, 36], [71, 46], [77, 46]]).props_('censer-hanging', [[72, 37], [76, 45]]).prop('reliquary', 77, 40).prop('treasure-urn', 71, 44).prop('gm-encounter', 74, 42, 0, { gm: true });
  b.light(74, 41, 20, 25, '#3fe0c8');
  b.encounter('The Sleeper wakes', [70, 35, 9, 13], [['aboleth', 1], ['chuul', 5], ['waterElemental', 2]], 'high');

  b.building('Bell tower dig', 58, 50, 10, 7, {
    mat: 'stone-flagstone', doors: [[62, 50, 'n', 'open', 'door-broken'], [60, 56, 's', 'open', 'door-broken']],
    read: 'A fallen bell the size of a cart lies on its side in a broken tower. Around it the floor has been dug out with picks into a pit that goes down into dark water. Lanterns hang on poles, and someone has chalked numbers on the stones: a countdown.',
    gm: 'The Company\'s dig. They are cutting a shaft from here into the sanctum from below, because the colonnade guardians keep them out of the front. Magister Ashlocke and Sabeline Ondrey command here with a pit-fighter guard. The countdown is real: two more days of digging. If the heroes arrive after the Company has broken through, Ashlocke is in the Drowned Door, reaching for the Lamp.',
  });
  b.prop('temple-bell', 63, 53).prop('pit-deep', 60, 53).props_('pickaxes', [[59, 51], [66, 55]]).props_('lantern-standing', [[59, 55], [66, 51]]).props_('rubble-pile', [[65, 53], [58, 52]]).prop('winch', 61, 52).prop('crate-stack', 66, 52).prop('stairs-down', 61, 54);
  b.light(59, 55, 10, 15).light(66, 51, 10, 15);
  b.encounter('The Breach', [58, 50, 10, 7], [['archmage', 1], ['assassin', 1], ['gladiator', 1]], 'high');

  b.room('Drowned garden', 52, 46, 4, 12, {
    mat: 'grass',
    read: 'A strip of old temple garden, gone wild: lilies, fat white flowers, a stone bench sinking into the mud.',
    gm: 'A quiet way round the temple wall between the steps and the bell tower dig. A herb-wise hero finds swampmint here (eases the heat: advantage on Constitution saves against exhaustion for a day).',
  });
  b.props_('flowers', [[53, 48], [54, 53]]).prop('bench', 54, 50).prop('statue', 53, 56).prop('ferns', 55, 47);

  // ----- south-east: the hydra's pools -----
  b.pool(62, 69, 16, 9, true);
  b.water(72, 48, 3, 13, true);
  b.area("The Guardian's throat", [[72, 48, 3, 13]], {
    read: 'A dark cut in the water, deeper than anything around it, running straight north toward the temple wall like a road made for something very long.',
    gm: 'The hydra\'s own way from its pools to the Drowned Door, ending at the sanctum\'s secret door. Swimming it is quick for anyone with water breathing; the hydra comes this way at once if the Lamp is disturbed. The Company has not found it.',
    label: [73, 54],
  });
  b.cave(null, 54, 67, 4, 2, { seed: 66, mat: 'mud' });
  b.cave(null, 70, 74, 5, 2, { seed: 67, mat: 'mud' });
  b.cave(null, 66, 63, 3, 2, { seed: 68, mat: 'mud' });
  b.area('The Ninefold Pools', [[48, 62, 28, 15]], {
    read: 'The water opens into a lagoon of black pools ringed with mud banks. Wrecked houses lie heaped on the banks, torn open like oysters. In the middle the water rises in a hill, and nine heads come up out of it, one after another, each turning to look at you.',
    gm: 'Old Ninefold, the hydra, and the giant crocodiles that live off its scraps. It is starving and confused: it has been opening houses because the tithe always came on a raft built like a house. Feeding it (the recovered tithe on the Tithe Ark, or 9 large animals and a DC 15 Animal Handling) ends its hunt at once. Arriving by the causeway, or with the shrine\'s lantern, it watches but does not attack first. Otherwise it fights. It never follows past the town\'s first walk.',
  });
  b.props_('debris-wood', [[53, 66], [55, 68], [69, 73], [72, 74], [66, 63]]).props_('broken-furniture', [[54, 67], [71, 75]]).props_('bones', [[56, 67], [68, 74]]).prop('door-broken', 65, 64).prop('skeleton-lying', 73, 73).props_('tree-dead', [[48, 64], [77, 66]]).prop('whirlpool', 62, 70).prop('gm-treasure', 70, 75, 0, { gm: true });
  b.light(62, 70, 10, 20, '#6fd3a8');
  b.encounter('Old Ninefold', [48, 62, 28, 15], [['hydra', 1], ['giantCrocodile', 4]], 'moderate');

  // the wild south shore between Broken Row and the pools
  b.cave('Heron rookery', 41, 75, 4, 3, {
    seed: 69, mat: 'grass',
    read: 'A hump of grass crowded with nesting herons, who scream at you. Feathers and fish bones everywhere.',
    gm: 'A noisy place: any fight within 60 ft sets the herons off, and the hydra raises its heads to look. From the top, the whole lagoon can be seen: a good place to watch Old Ninefold and count its heads.',
  });
  b.props_('reeds', [[39, 74], [43, 76]]).prop('stump', 41, 75).prop('bones', 40, 77);

  // a GM note about the hunger clock
  b.note(21, 52, 'Hunger clock: the hydra takes one more house each night the tithe is not paid. The Company breaks into the sanctum on the third day.');
  return b.build();
}

export const HYDRA_MIREWATER: Adventure = {
  id: 'hydra-mirewater',
  title: 'The Hydra of Mirewater',
  tagline: 'A stilt town paid its hydra every spring. This year someone stole the payment, and now the hydra is taking houses.',
  levels: '11',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['swamp', 'hydra', 'mystery', 'morally grey', 'wilderness'],
  pitch:
    'Mirewater stands on stilts where a great river breaks into nine mouths and drowns in a swamp. For a hundred years the town has floated a raft of hogs and silver out to the hydra in the deep pools every spring, and for a hundred years nothing worse has come out of the delta. This spring the raft was stolen. Now, every night, the hydra comes to town and takes a house. The town wants it dead. A company of hired monster-hunters says it can do the job. And the heat is unbearable.',
  secret:
    'Under the drowned temple in the delta sleeps Ul-Mereth, an aboleth. Long ago the Tidekeeper priests put it to sleep with the Lamp of Nine Mouths and bred a hydra to guard the door. The town\'s founders made a bargain with the hydra after the priests died: food every spring, and it keeps the delta safe. Magister Aurel Ashlocke, leader of the Copperhook Company, heard about "a lamp of the sea" and wants it; for months Ul-Mereth has whispered to him in dreams, and he no longer knows which ideas are his own. His company cannot get past the hydra, so he bribed the tithe-keeper, stole the tithe and is letting the starving hydra turn the town against it. He hopes the town (or a party of heroes) kills it for him. In three days his diggers break into the sanctum anyway.',
  hooks: [
    'The heroes answer the bounty notice the Copperhook Company has posted all along the river: 3,000 gp for the hydra\'s heads. They do not know the Company wrote it.',
    'Reeve Prudence Tamsworth writes to anyone who will listen: "Our bargain has broken. We need people who can fix things, not only kill them."',
    'A sage has heard rumours of a drowned Tidekeeper temple and pays 1,000 gp for a sketch of its sanctum, and a warning: "whatever they sealed, they sealed it on purpose."',
  ],
  tips: [
    'Run the hunger clock: each night the tithe is unpaid, the hydra takes another house (show the bells ringing). On the third day the Company breaks through at the bell tower dig. This keeps the heroes moving.',
    'Make the hydra understandable before the heroes meet it: Marl\'s story, the reed idols, the scrubbed paint on the hall, the house-shaped tithe raft. Let the players work out that it is hunting for its payment.',
    'The map is open: the heroes can go anywhere by boat, wading or the bridges. Let them pick their route, and use the crocodiles, the moss bog and the deep channel as the price of a shortcut.',
    'Many fights can be talked down: the salvage crew bluffs, the Aunties trade, the hydra can be fed, and the colonnade guardians bow to the shrine\'s lantern. Give the same XP for a fight avoided cleverly.',
    'Sesh-of-the-Reeds is your fixer: if the heroes are stuck, he paddles up and offers a ride, a rumour or the hidden causeway.',
    'For 3 players, drop the gladiator from The Breach and one chuul from The Sleeper wakes. For 5, add a veteran to every Company fight.',
  ],
  npcs: [
    {
      id: 'pf_hmwprudence', name: 'Prudence Tamsworth', title: 'Reeve of Mirewater', kind: 'npc', art: 'noble', shared: true,
      wants: 'Her town safe, and the old bargain kept quiet, because she is ashamed of what it once was.',
      knows: 'That the tithe is a real pact with the hydra, made by her great-grandmother. That the oldest form of it asked for "one who goes willing" before the town swapped in hogs.',
      voice: 'Brisk and tired, fans herself constantly, ends every hard answer with "...and that\'s Mirewater for you."',
      appearance: 'A sturdy woman of sixty in a sweat-dark linen coat, grey hair pinned up with fish-bone pins.',
      backstory: 'Reeve for twenty years. Has paid the tithe twenty times and never once seen the hydra.',
      gmNotes: 'She ordered the hydra paint scrubbed off the hall to calm the town. If the heroes renew the pact she will have it repainted, larger.',
    },
    {
      id: 'pf_hmwebbert', name: 'Ebbert Drane', title: 'the tithe-keeper', kind: 'npc', art: 'commoner', shared: true,
      wants: 'To get out of town before anyone finds out, and for his daughter to live.',
      knows: 'That two Company men paid him 200 gp for the key to the tithe-house and the night the raft would be loaded. That they took it north-east, to "the wreck".',
      voice: 'Mumbles, apologises for everything, laughs at the wrong moments.',
      appearance: 'A thin net-mender with bandaged hands and a new pair of boots he clearly could not afford.',
      backstory: 'His daughter has marsh-fever. The healer upriver wanted 150 gp. The Company offered 200.',
      gmNotes: 'Not a villain. A Lesser Restoration on his daughter wins him for life; he then offers to row the heroes anywhere.',
    },
    {
      id: 'pf_hmwmarl', name: 'Marl Oduya', title: 'eel-catcher, aged eleven', kind: 'npc', art: 'child', shared: true,
      wants: 'His gran\'s brass bell, which was in the house the hydra took. And for nobody to kill the hydra, "because it was just looking."',
      knows: 'How the hydra searched his house (like someone looking for something). That copper-coat men rowed past with a big painted raft on the night the tithe went.',
      voice: 'Flat and careful, like he is reporting to a captain. Cries only when he thinks nobody sees.',
      appearance: 'Small, sunburnt, barefoot, with an eel-spear taller than he is.',
      gmNotes: 'The bell is in the Ninefold Pools, on the mud bank. Bringing it back makes him the heroes\' fiercest friend in town.',
    },
    {
      id: 'pf_hmwvelvetmoss', name: 'Aunt Velvetmoss', title: 'eldest of the Mire Aunties', kind: 'monster', art: 'swamp-witch', monsterId: 'greenHag',
      wants: 'A good bargain, and the Sleeper to stay asleep: an aboleth awake would make slaves of everyone in the delta, hags included.',
      knows: 'Everything: the Sleeper, the Lamp, the hydra\'s purpose, the hidden causeway, that Ashlocke dreams of a voice in the water.',
      voice: 'Sweet as honey cake, calls everyone "duckling", and always tells the truth in the most unhelpful order.',
      appearance: 'A tall, stooped old woman with moss for hair and a smile with too many teeth. Her sisters look worse.',
      gmNotes: 'Green hag stat block; her sisters are a sea hag and a night hag. She sells one truth per price. If the heroes ask the right question ("what does the hydra guard?"), she answers it for free, because she wants it answered.',
    },
    {
      id: 'pf_hmwsesh', name: 'Sesh-of-the-Reeds', title: 'weir-keeper and boatman', kind: 'npc', art: 'lizardfolk', monsterId: 'lizardfolk', shared: true,
      wants: 'The old ways kept. His people have left fish for the hydra since before the town existed.',
      knows: 'Every channel in the delta, the hidden causeway, and that the hydra has never once hunted on the town side of the weir until this month.',
      voice: 'Slow and dry, speaks of the hydra as "Grandmother" and of the town as "the stilt-folk".',
      appearance: 'A big grey-green lizardfolk with a fishing net worn like a cloak and a clay pipe he never lights.',
      gmNotes: 'Guide and fixer. Charges fair prices: fish hooks, salt, a good story. He will not go near the Company\'s camp.',
    },
    {
      id: 'pf_hmwaurel', name: 'Magister Aurel Ashlocke', title: 'master of the Copperhook Company', kind: 'monster', art: 'court-wizard', monsterId: 'archmage',
      wants: 'The Lamp of Nine Mouths, which he believes will let him command rivers and the sea. Lately he also wants to sleep without dreaming of water.',
      knows: 'That the hydra guards the temple, that the guardians in the colonnade stop his men, and that "something under the door" has been speaking to him.',
      voice: 'Smooth, reasonable, lecturing. Sometimes stops mid-sentence and listens to nothing.',
      appearance: 'A lean man in a sea-green coat with copper buttons, wet hair that never dries, and ink stains up to the wrist.',
      backstory: 'A treasure-scholar who sold three temples\' worth of relics to collectors. The delta was meant to be his last job.',
      gmNotes: 'Archmage stat block. Not entirely himself: the aboleth\'s dreams have charmed him. A heroes\' Dispel Magic or Remove Curse (or a DC 20 Persuasion that makes him hear himself) breaks the hold, and he may surrender in horror. Fights at The Breach with Sabeline.',
    },
    {
      id: 'pf_hmwsabeline', name: 'Sabeline Ondrey', title: 'the Company\'s knife', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'Her share of the Lamp\'s price: 20,000 gp, already promised to a buyer.',
      knows: 'That Ashlocke is not well. That the Company stole the tithe on purpose. Who the buyer is (a collector downriver).',
      voice: 'Quiet, amused, never threatens, only states prices.',
      appearance: 'Small and neat in oiled black leather, with a copper hook for a left hand.',
      gmNotes: 'Assassin stat block. She has no loyalty: if Ashlocke falls or the deal goes bad, she offers to sell out the Company (the buyer\'s name and Ashlocke\'s spellbook) for her life.',
    },
    {
      id: 'pf_hmwninefold', name: 'Old Ninefold', title: 'the hydra of the pools', kind: 'monster', art: 'hydra', monsterId: 'hydra',
      wants: 'Its tithe. To keep its watch on the door, as it was made to.',
      knows: 'Nothing in words. It knows the Lamp\'s light, the smell of the shrine\'s lantern and the shape of the raft that brings food.',
      voice: 'Nine voices: hisses, clicks, a low mournful hooting that carries for miles at dusk.',
      appearance: 'A mud-green hydra as long as a barge, its heads scarred and mismatched: some old and grey, some new and bright.',
      gmNotes: 'Hydra stat block. Starving: it has disadvantage on its first Wisdom save each day. Fed, it goes back to the pools and stays. If killed, the seal on the Drowned Door weakens: in 1d4 days Ul-Mereth wakes on its own.',
    },
    {
      id: 'pf_hmwulmereth', name: 'Ul-Mereth', title: 'the Sleeper under the door', kind: 'monster', art: 'aboleth', monsterId: 'aboleth',
      wants: 'To wake, to rise, and to make the whole delta its servants again, as it did before the Tidekeepers came.',
      knows: 'Ashlocke\'s every thought. The memories of everyone it ever enslaved, including the first Tidekeepers.',
      voice: 'No sound. A voice inside the head, warm and kind, that always sounds like your own best idea.',
      appearance: 'A vast eel-like fish with three red eyes in a row and long tentacles trailing slime that shines like oil.',
      gmNotes: 'Aboleth stat block. Only fights if the Lamp leaves the door or the hydra is dead for days. While asleep it can still send dreams: anyone who sleeps in the temple makes a DC 16 Wisdom save or wakes wanting, a little, to take the Lamp.',
    },
  ],
  handouts: [
    { id: 'hmw-bounty', title: 'Notice: Hydra Bounty', text: 'THE COPPERHOOK COMPANY, Salvage & Surety, offers 3,000 gold crowns for the nine heads of the beast of Mirewater.\nThe town is in peril. Ask at the Lazy Heron.\nEquipment and boats supplied. Bring proof.' },
    { id: 'hmw-pact', title: 'The pact of the Nine Mouths', text: 'Written on oiled hide in faded red:\nWe the stilt-folk ask of the Guardian of the Door:\nKeep the deep things down, and keep the delta.\nAnd every spring we bring to the pools, on a house of reeds:\nnine beasts, salt, silver, and the sleeping-water from the lily shrine.\n(An older line, scratched out but still readable:) ...and one who goes willing.\nIf the tithe fails, the Guardian will come looking for it.' },
    { id: 'hmw-ledger', title: "The tithe-keeper's ledger", text: 'Spring tithe, loaded:\n9 hogs, fattened - yes\n4 barrels salt eel - yes\nTithe silver, 1 chest - yes\nDrowsewater, 1 cask, from the shrine - yes\nRaft painted and garlanded - yes\n(Below, in a shakier hand:) Forgive me. They said nobody would be hurt.' },
    { id: 'hmw-journal', title: "Ashlocke's journal", text: 'Day 81. The guardians in the courtyard will not let the men pass. The beast in the pools will not let the boats pass. Very well: let the town do our work. The tithe is the key. Starve it, and they will beg us to kill it.\nDay 88. The dream again. The water is warm and someone is waiting under the door. It says the Lamp is a cage, not a crown. I do not believe it. I do not believe it.\nDay 90. Three days of digging left. I hear it even awake now. It is kind.' },
    { id: 'hmw-ilvane', title: "High Tidekeeper Ilvane's words", text: 'What we could not kill, we sang to sleep. What we sang to sleep, we gave a lamp to hold its dreams. And to the lamp we gave a guardian with nine heads, so that if eight fail, one will remember. Feed the guardian. Leave the lamp. Never wake the door.' },
  ],
  chapters: [
    {
      id: 'mirewater', title: 'The Nine Mouths', level: 11,
      summary: 'One big open swamp map: the stilt town of Mirewater, reed islands with hags and moss beasts, a crocodile slough, the Copperhook Company\'s camp on a beached wreck, a drowned temple with a sealed door, and the hydra\'s pools, joined by bridges, a weir, boats and a hidden causeway.',
      goal: 'Find out why the hydra is taking houses, deal with the Copperhook Company, and keep the Lamp of Nine Mouths on the Drowned Door.',
      map: nineMouths,
      npcs: [
        { npc: 'pf_hmwprudence', x: 24, y: 52 },
        { npc: 'pf_hmwebbert', x: 5, y: 43 },
        { npc: 'pf_hmwmarl', x: 30, y: 74 },
        { npc: 'pf_hmwvelvetmoss', x: 9, y: 11, hidden: true },
        { npc: 'pf_hmwsesh', x: 33, y: 31 },
        { npc: 'pf_hmwaurel', x: 63, y: 55, hidden: true },
        { npc: 'pf_hmwsabeline', x: 65, y: 54, hidden: true },
        { npc: 'pf_hmwninefold', x: 62, y: 69, hidden: true },
        { npc: 'pf_hmwulmereth', x: 74, y: 41, hidden: true },
      ],
      scenes: [
        {
          room: 'Ferry landing', title: 'Bells over the water', handout: 'hmw-bounty',
          read: 'The ferry noses through reeds taller than a man, and Mirewater rises out of the haze on a thousand stilts. Every porch bell in town is ringing. A man in a copper-buttoned coat steps onto the landing, smiling, and presses a notice into your hand before the rope is tied.',
          gm: 'Open with the heat and the bells: a fourth house was taken last night. The Company man (a scout) is friendly and pushy: "Sign with us, we supply the boats." He will not say where the Company camps. Start the hunger clock.',
        },
        {
          room: "Reeve's hall", title: 'The Reeve\'s offer',
          read: 'The Reeve looks up from a table drowning in petitions. "Two thousand gold, all we have," she says, "to end it. However you like." Behind her, someone has tried to scrub nine painted snake heads off the wall.',
          gm: 'Prudence wants the problem gone and the pact kept secret. DC 17 Insight shows she is hiding something; the scrubbed paint is a clue. Shown the pact, or pushed hard, she tells the truth and changes the job: "Fix the bargain." The town meeting outside wants blood: a DC 15 Persuasion buys three days of patience.',
        },
        {
          room: 'Tithe-house', title: 'The empty tithe-house', handout: 'hmw-ledger',
          read: 'Nine iron rings stand in a row on the floor, each with a cut rope still tied to it. Garlands of dried lilies lie trampled in the dust. The iron door was smashed, but the lock is clean and unscratched.',
          gm: 'The lock was opened with a key, then the door broken for show (DC 15 Investigation). A copper button under a ring (DC 13 Perception) matches the Company coats. The ledger points to Ebbert Drane, who is packing in the Net-loft. He confesses easily to kindness, or to DC 14 Intimidation, and tells them about "the wreck" to the north-east.',
          treasure: 'Ebbert hands over the 200 gp the Company paid him if the heroes promise to help his daughter.',
        },
        {
          room: 'Broken Row', title: 'The boy and the salvage crew', encounter: 'Salvage crew',
          read: 'A barefoot boy sits on a snapped stilt, watching the copper-coat men fish his family\'s things out of the water. "It didn\'t eat our house," he says, without looking at you. "It opened it. Like Gran opening a parcel. It was looking for something."',
          gm: 'Marl Oduya gives the two best clues: the hydra is searching, not hunting; and copper-coat men poled a painted raft past on the night the tithe went. He asks the heroes to find his gran\'s brass bell. The Company\'s looters work the wrecks under the excuse of searching for survivors. Talk them down (DC 16 Intimidation, or catch them in a lie in front of townsfolk) or fight. A body or a pocket gives Ashlocke\'s pay letter: proof the Company is behind it, and enough to turn the town around.',
          treasure: 'Salvaged valuables worth 300 gp (they belong to the townsfolk, who will reward honesty with a free boat), two potions of greater healing.',
        },
        {
          room: 'Shrine of the Low Lantern', title: 'The mural and the pact', handout: 'hmw-pact',
          read: 'Painted figures with lanterns walk across the water on the shrine wall, toward a temple with a great door. Behind the temple, nine long necks rise like the bars of a gate. The figures are not afraid of the necks. The necks are facing outward.',
          gm: 'The key clue: the hydra is a guardian. The mural shows the hidden causeway (DC 16 Investigation finds the secret door east). A loose stone behind the altar (DC 14) hides the reliquary with the old pact and the Tidekeepers\' hooded lantern. Lit, it lets its bearer and allies pass the colonnade guardians and makes the hydra hold back.',
          treasure: 'The Tidekeepers\' lantern, a cap of water breathing, two potions of water breathing.',
        },
        {
          room: "The Aunties' hut", title: 'Tea with the Aunties', encounter: 'The Mire Aunties', optional: true,
          read: 'Three old women sit around one pot, and the steam smells of mint and something dead. "Ducklings!" says the tallest. "Sit, sit. You want to know about Grandmother, don\'t you? Everyone does, in the end."',
          gm: 'The hags trade truths for prices (a true secret from each hero, or a hero\'s dreams for a year). They will tell everything in the secret, in the most unhelpful order. They fight only if cheated or attacked, and flee at half hit points.',
          treasure: 'For a second price, Velvetmoss sells a necklace of adaptation "for breathing where you oughtn\'t". In the pot: 6 pearls (100 gp each), if the hags are dead.',
        },
        {
          room: 'Crocodile slough', title: 'Across the delta', encounter: 'Slough crocodiles', optional: true,
          read: 'The mud steams. Logs lie along the bank in rows, and as you watch, one of them opens its eyes.',
          gm: 'Travel across the open map: the slough on the north route, the Moss bog on the west, the deep channel in the middle. Use whichever the heroes cross. The crocodiles are slow and full (DC 16 group Stealth to sneak past); the shambling mounds in the bog wake to noise. Heronneck Bridge has a cut rope (DC 15 Perception).',
          treasure: 'On the treasure-hunter in the moss bog: a +1 shield, 120 gp and a waterlogged map of the temple steps.',
        },
        {
          room: 'Copperhook camp', title: 'The wreck of the Bellwether', encounter: 'Copperhook camp', handout: 'hmw-journal',
          read: 'A beached barge leans on a mud island, surrounded by tents and smoke. Under a tarp sits a little raft built like a house, painted blue and gold and hung with dead lilies. A man on watch is carving a tally of nine heads into the barge rail, and crossing them off.',
          gm: 'The Company\'s base. The quartermaster (mage), two captains, two gladiators and four veterans. Disguised heroes (DC 16 Deception) can walk in as hires. Stealing the Tithe Ark by night is a fine heist: it floats, and four strong heroes can pole it. Ashlocke\'s journal in the Bellwether tells the whole plan and his dreams.',
          treasure: 'The stolen tithe (4 barrels of salt eel, the cask of drowsewater, the town\'s silver chest of 1,200 gp), the Company payroll (900 gp), a wand of lightning bolts, and the quartermaster\'s spellbook.',
        },
        {
          room: 'Ossuary of the Tidekeepers', title: 'The High Tidekeeper', encounter: 'Drowned priests', handout: 'hmw-ilvane', optional: true,
          read: 'The woman with the dead lantern turns. She has no face, only still water in the shape of one. "You came by the steps," she says. "Did you feed the guardian?"',
          gm: 'The wights attack unless the heroes carry the shrine\'s lantern. Ilvane\'s ghost does not fight unless the bones are harmed. Once the wights are down she tells the heroes what lies under the door and gives her words (handout). She asks one thing: "Leave the lamp."',
          treasure: 'A trident of fish command in Ilvane\'s niche, and burial pearls worth 600 gp (taking them angers the ghost).',
        },
        {
          room: 'The Ninefold Pools', title: 'Old Ninefold', encounter: 'Old Ninefold',
          read: 'Nine heads rise from the black water, one after another, scarred and dripping. They sway apart, tasting the air. Then all nine turn, slowly, toward the thing you brought with you, and the lagoon goes quiet.',
          gm: 'The turning point. The hydra is starving and confused, not cruel. The tithe on the Tithe Ark (or any raft shaped like a house) ends the hunt at once; nine large animals and a DC 15 Animal Handling do too. Heroes who come by the causeway or with the lantern are not attacked first. Otherwise it fights with its giant crocodiles. Killing it is possible, and wrong: the door weakens.',
          treasure: 'In the heaps of wrecked houses: Marl\'s gran\'s brass bell, 2,000 gp of household goods (the town\'s), and on a drowned hunter, a cloak of the manta ray.',
        },
        {
          room: 'Bell tower dig', title: 'The Breach', encounter: 'The Breach',
          read: 'The Company\'s lanterns swing over a pit full of dark water. Magister Ashlocke stands at its edge with his eyes closed, listening, and smiles without opening them. "It says you would come," he says. "It says you are welcome too."',
          gm: 'The climax with the Company: Ashlocke (archmage), Sabeline Ondrey (assassin) and a gladiator. Ashlocke is half under the aboleth\'s spell (see his notes): breaking it may end the fight. Sabeline sells him out if it goes badly. If the hunger clock has run out, this fight happens in the Drowned Door instead, with Ashlocke\'s hand on the Lamp.',
          treasure: 'Ashlocke\'s ring of free action and spellbook, Sabeline\'s dagger of venom, and 1,500 gp in Company funds.',
        },
        {
          room: 'The Drowned Door', title: 'Leave the lamp', encounter: 'The Sleeper wakes',
          read: 'The little lamp burns on the bronze door, its flame the colour of the sea. The water around the door is perfectly still. And in your head, a warm and friendly voice says that it would be so easy, so sensible, to pick the lamp up.',
          gm: 'Everyone in the room makes a DC 16 Wisdom save or feels the pull to take the Lamp (a hero can resist on their turn; nobody is forced). If the Lamp stays, nothing happens and the adventure is won. If anyone lifts it, the door cracks and Ul-Mereth rises with its chuul and water elementals. Putting the Lamp back (an action, while within reach of the door) and holding it there for 3 rounds sings it back to sleep; the hydra, if alive and fed, arrives through the Guardian\'s throat on round 2 and fights the aboleth.',
          treasure: 'The Tidekeepers\' offerings around the door: 4,000 gp in old gold, pearls worth 1,500 gp, a periapt of proof against poison. The Lamp itself must stay.',
        },
      ],
      wrapUp: 'If the Lamp stays on the door and the hydra is fed, the delta goes quiet. The bells stop. The town can renew the pact openly, and the heroes decide what the Company\'s survivors deserve.',
    },
  ],
  ending:
    'Win: the Lamp stays on the Drowned Door, Old Ninefold is fed and goes back to its pools, and the Copperhook Company is broken. Mirewater repaints the nine heads on the hall, bigger than before, and the heroes are honoured guests at every spring tithe (where the town now asks them to carry the lantern). Marl gets his gran\'s bell back. Grey win: the hydra is dead but the heroes keep the Lamp on the door; the seal holds, barely, and someone must now stand guard where the hydra did. Lose: the Lamp leaves the door, or the hydra dies and nobody guards it. Ul-Mereth wakes; within a season the people of Mirewater walk into the water smiling. Next: the Company\'s buyer downriver still wants the Lamp, and Ul-Mereth, awake or dreaming, remembers every face that stood in its sanctum.',
};
