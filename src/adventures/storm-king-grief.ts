// The Storm King's Grief: a two-part epic for four heroes of level 14.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

const STORM = '#a9c8ff';
const GREEN = '#7dffb0';
const FIRE = '#ffb35c';

// ---------- Part 1: the drowning coast ----------
function shearwaterCoast() {
  const b = new MapBuilder('adv-storm-king-coast', 'Shearwater and the Grindle Teeth', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });

  // ----- the sea: the bay to the east, the open sea to the south -----
  b.water(44, 36, 36, 44, true);
  b.water(0, 64, 44, 16, true);
  b.water(28, 50, 16, 14, true);
  b.water(0, 60, 28, 4, false);
  b.water(44, 38, 36, 2, false);
  // reef shallows: the ways a careful boat (or a wading giant) can pick across the bay
  b.water(60, 42, 8, 6, false).water(70, 39, 6, 4, false).water(64, 50, 14, 5, false).water(52, 54, 26, 2, false);
  // the Gannet Beck, in flood, running down beside the cliffs into the bay
  b.water(40, 0, 4, 38, false).water(41, 0, 2, 38, true);
  // the lower town is under water
  b.water(0, 28, 40, 18, false);
  b.pool(31, 42, 3, 2, true);
  // the cliffs of the headland, and the reef rock in the south-east
  b.rock(44, 20, 36, 18);
  b.rock(60, 63, 20, 17);

  // ----- the high town -----
  b.paint(0, 5, 39, 3, 'stone-cobble').paint(19, 8, 3, 20, 'stone-cobble').paint(45, 5, 17, 3, 'dirt');
  b.start(0, 5, 2, 3);
  b.area('Hilltop camp', [[4, 0, 30, 5]], {
    read: 'Tents flap and tear on the crown of the hill. Hundreds of people sit in the mud with everything they could carry, watching the sea eat their homes one street at a time.',
    gm: 'The town\'s whole lower half is camped here. Rumour (DC 12 Insight to sort it): the lighthouse keeper lit false lights; the giants are punishing the coast; raiders in black sails loot the drowned houses every night. Anyone asked will point the heroes to Mother Honora in the Refuge Hall.',
    label: [18, 2],
  });
  b.props_('tent', [[5, 1], [9, 2], [14, 1], [23, 2], [28, 1]]).props_('tent-round', [[11, 0], [26, 3]]).props_('campfire', [[7, 3], [20, 3]]).prop('cart', 17, 1, 90).prop('chicken-coop', 31, 2).prop('hay-bale', 32, 0).prop('wagon', 2, 1).props_('bedroll', [[8, 0], [21, 0], [30, 3]]);
  b.light(7, 3, 10, 15, FIRE).light(20, 3, 10, 15, FIRE);

  b.building('Refuge Hall', 4, 10, 13, 10, {
    mat: 'marble',
    read: 'The old sea-chapel is packed to the walls with the wet, the sick and the frightened. Candles gutter in the draught. A broad woman in a stained apron is doing six things at once, and she looks at your weapons as if she has been praying for them.',
    gm: 'Mother Honora Drewe runs the hall. She gives the hook and the facts: the storm began nine days ago, the night the giants\' ship broke on the Grindle Teeth. Since then the sea has risen a street a day. In three days the spring tide meets the storm and the hill itself goes under. The town blames Wenneth Corrie, the lighthouse keeper. Honora does not: "Wenneth never let that light go out in thirty years."',
    doors: [[10, 10, 'n', 'closed', 'door-double'], [11, 10, 'n', 'closed', 'door-double'], [16, 15, 'e', 'closed']],
    windows: [[4, 13, 'w'], [4, 17, 'w'], [13, 19, 's']],
  });
  b.prop('altar', 10, 18).props_('pew', [[6, 12], [6, 14], [6, 16], [14, 12], [14, 14]]).props_('cot', [[7, 18], [5, 11], [15, 17]]).props_('candles', [[9, 18], [12, 18]]).prop('cauldron', 14, 16).prop('water-barrel', 15, 11).prop('temple-bell', 5, 18);
  b.light(10, 17, 15, 20, FIRE);

  b.building("The Heron's Rest", 24, 9, 12, 8, {
    read: 'An inn with every window boarded. Inside, a dozen fishers drink in silence under a ceiling that drips. A chalk tally on the wall counts the drowned houses: forty-one.',
    gm: 'Rumours and a rest. The landlord will trade a hot meal for news. A drunk fisher swears he saw "two lights on the point that night: the lighthouse, and a green one out on Gull Rock". DC 15 Insight: he is telling the truth and is scared to say it louder.',
    doors: [[29, 9, 'n', 'closed'], [24, 13, 'w', 'closed']],
    windows: [[35, 12, 'e'], [31, 16, 's']],
  });
  b.prop('bar-counter', 25, 10).prop('keg-rack', 25, 11).prop('fireplace', 33, 9).props_('table-round', [[28, 13], [32, 14]]).props_('chair', [[27, 13], [29, 13], [31, 14], [33, 14]]).prop('stair-spiral', 34, 15).prop('notice-board', 26, 15);
  b.light(33, 10, 10, 20, FIRE);

  b.building('Storm-watch Tower', 24, 19, 6, 6, {
    mat: 'stone-flagstone',
    read: 'A squat stone tower with a flood bell and a telescope under the roof. Rain hammers the slates.',
    gm: 'From the top the heroes can see the whole bay: the black sails in the harbour, the wreck on the reef, the green glow under it at night (DC 16 Perception), and the cloud-wrapped sea stack far out to the east where the storm is centred.',
    doors: [[24, 21, 'w', 'closed']], windows: [[29, 21, 'e']],
  });
  b.prop('telescope', 27, 20).prop('temple-bell', 26, 23).prop('ladder', 28, 23).light(27, 21, 5, 10, FIRE);

  b.building("Fishwives' Row", 31, 19, 8, 6, {
    read: 'A row of tiny cottages, doors banging in the wind. One still has a pot on the cold stove.',
    gm: 'Empty. A child\'s drawing pinned by a door shows the giants\' ship with a green star over it. Two potions of healing in a cupboard.',
    doors: [[34, 19, 'n', 'open'], [38, 22, 'e', 'closed']],
  });
  b.props_('bed', [[32, 20], [36, 20]]).prop('stove', 33, 23).prop('table-round', 36, 23).prop('cupboard', 37, 20);

  // ----- the Beck: one bridge and a ford -----
  b.floor(39, 5, 6, 3, 'wood-planks');
  b.area('The Beck Bridge', [[39, 5, 6, 3]], {
    read: 'The bridge shudders as the flood slams against its piles. Tree trunks and drowned sheep go tumbling past underneath.',
    gm: 'The only dry way to the headland. A DC 14 Dexterity save for anyone running across when a log hits (3d6 bludgeoning, knocked prone).',
    label: [41, 6],
  });
  b.props_('rapids', [[41, 3], [42, 10]]).prop('lamp-post', 39, 7).light(39, 7, 10, 15, FIRE);
  b.rubble(40, 25, 4, 2);
  b.area('Millstone Ford', [[40, 25, 4, 2]], {
    read: 'Old millstones make a line of stepping stones across the beck, half drowned in brown water.',
    gm: 'DC 16 Acrobatics per hero or be swept down into the bay (DC 18 Athletics to get out). Downstream of the ford, a cleft in the cliff opens into the Seal Cave.',
    label: [41, 25],
  });

  // ----- the headland and Corrie Light -----
  b.building('Corrie Light', 62, 5, 9, 9, {
    mat: 'stone-flagstone',
    read: 'The lighthouse stands black against the lightning. Its great lamp is dark. Someone has painted WRECKER on the door in red letters a foot high.',
    gm: 'Empty at first look. The cellar door is hidden behind a stack of oil barrels (DC 17 Perception, or Wenneth\'s cat leads them to it). Wenneth Corrie hides below from the townsfolk and from the roc.',
    doors: [[62, 6, 'w', 'closed']], windows: [[66, 5, 'n'], [70, 7, 'e']],
  });
  b.wallRun(67, 10, 4, 'n').wallRun(67, 10, 4, 'w').door(68, 10, 'n', 'secret');
  b.area('Lamp cellar', [[67, 10, 4, 4]], {
    read: 'A cramped cellar full of oil jars. A grey-haired woman with a boat-hook stands between you and the corner, shaking.',
    gm: 'Wenneth Corrie. On the wreck night men in black oilskins knocked her out and put her light out; when she woke the giants\' ship was already on the reef. She kept what she found on Gull Rock: a shard of pale, cloudy glass far too thick for any human lantern (DC 18 Arcana: cloud-giant work). She hands over her log (handout).',
    label: [69, 12],
  });
  b.prop('stair-spiral', 64, 7).props_('barrel-group', [[66, 9], [65, 11]]).prop('lantern-standing', 68, 6).prop('rope-coil', 63, 12).prop('cot', 70, 13).prop('shelf-jars', 67, 13).prop('desk', 69, 7);
  b.light(69, 11, 5, 10, FIRE);
  b.building("Keeper's cottage", 50, 10, 7, 6, {
    read: 'A neat little cottage, smashed up. Every plate is broken and the bed is slashed.',
    gm: 'Townsfolk did this, not raiders. Wenneth\'s cat hides under the bed and runs to the lighthouse cellar if followed.',
    doors: [[53, 10, 'n', 'open']],
  });
  b.prop('broken-furniture', 52, 12).prop('bed', 55, 14).prop('fireplace', 51, 11).prop('debris-wood', 54, 12);
  b.area('The Headland', [[45, 0, 17, 20]], {
    read: 'Wind-flattened grass runs out to the lighthouse. Gulls hang motionless in the gale. Out at sea, far to the east, a mountain of cloud squats on the water, lit from inside by lightning that never stops.',
    gm: 'Open, exposed ground. Ranged attacks have disadvantage beyond 60 feet in this wind. An old smugglers\' stair is cut into the cliff at the headland\'s south edge (DC 14 Survival to notice the worn steps).',
    label: [52, 3],
  });
  b.props_('boulder', [[47, 2], [58, 16], [46, 13]]).props_('grass-tall', [[49, 7], [57, 2], [60, 12]]).prop('cairn', 59, 9).prop('signpost', 46, 8).prop('tree-dead', 48, 15);
  b.rubble(72, 14, 8, 6);
  b.area("The Roc's Nest", [[71, 12, 9, 8]], {
    read: 'At the very tip of the point, on the bare rock, sits a nest of whole trees and ship timbers as big as a cottage. Something enormous shifts in it, and an eye the size of a cartwheel opens.',
    gm: 'A roc, blown off its mountains by the storm, starving and furious. It will attack anyone near the nest. Feeding it (two cows from the hilltop camp, which Honora can spare) and a DC 20 Animal Handling check makes it calm; then it will even carry two heroes out to the reef or the sea stack, once.',
    label: [75, 16],
  });
  b.props_('hay-bale', [[74, 15], [76, 15]]).prop('giant-ribcage', 77, 17).props_('bones', [[72, 18], [78, 13]]).prop('debris-wood', 73, 13).prop('skull-pile', 79, 18);
  b.encounter('The roc of Corrie Light', [70, 8, 10, 12], [['roc', 1]], 'low');

  // ----- the sea caves under the headland -----
  b.prop('stairs-down', 48, 18);
  b.tunnel([[48, 18], [49, 22]], 2, { seed: 11, mat: 'cave-floor' });
  b.cave("Smugglers' Cut", 50, 24, 4, 3, { seed: 12,
    read: 'Steps worn into the rock spiral down into a dripping cave. The boom of the sea comes up from below, and fresh boot prints in the silt.',
    gm: 'The Reavers use these caves to stash their loot. Tracks lead east (to the sea caves) and south-west (to the Seal Cave, where they stop and turn back in a hurry).' });
  b.props_('lantern-hook', [[51, 23]]).prop('crate', 48, 25).prop('rope-coil', 52, 26).light(51, 23, 5, 10, FIRE);
  b.tunnel([[49, 26], [47, 30]], 2, { seed: 13 });
  b.cave('Seal Cave', 47, 32, 3, 3, { seed: 14,
    read: 'A cleft in the cliff, open to the roaring beck. Lying across it like a fallen wall is a giant woman with a broken leg and blue-white skin, an axe as long as a boat across her knees.',
    gm: 'Hildra Coldfathom, frost giant, the princess\'s sworn shield. She washed up here after the wreck and has killed three Reavers who came close. She believes the coast-folk lit false lights and will attack humans on sight unless a hero speaks first (DC 19 Persuasion, advantage if they speak Giant or show the cloud-glass shard). Healing her leg wins her for good.' });
  b.props_('bones', [[46, 30]]).prop('skeleton-lying', 46, 34).prop('weapon-barrel', 45, 33);
  b.tunnel([[53, 25], [57, 27]], 2, { seed: 15 });
  b.cave('The Sea Caves', 64, 28, 9, 6, { seed: 16,
    read: 'A great sea cave booms like a drum each time a wave rolls in. Loot is piled on a ledge above the water: church plate, bolts of cloth, a pram full of silver spoons. Fish-scaled shapes squat around a green fire.',
    gm: 'Sahuagin who serve Quorlath, with two chuul and two sharks in the pool. They guard the Reavers\' loot. Each round a wave sweeps the low ground: DC 15 Strength save or be pushed 10 feet toward the pool.' });
  b.pool(66, 30, 4, 3, true);
  b.props_('loot-sacks', [[59, 25], [60, 26]]).prop('treasure-pile', 58, 27).prop('campfire', 62, 25).props_('spear-rack', [[68, 24]]).prop('fishing-net', 69, 31).prop('stalagmites', 58, 30).prop('chalices', 61, 27);
  b.light(62, 25, 10, 15, GREEN);
  b.encounter('Sahuagin in the sea caves', [55, 22, 20, 13], [['sahuagin', 8], ['chuul', 2], ['giant-shark', 2]], 'low');
  b.tunnel([[70, 33], [72, 37]], 2, { seed: 17 });
  b.cave('Sea Mouth', 72, 37, 3, 2, { seed: 18,
    read: 'The cave opens on the bay. Spray bursts through the gap in white sheets. A Reaver rowboat is tied to an iron ring.',
    gm: 'A way out to the bay by boat: the reef is 300 feet south. The rowboat holds six.' });
  b.prop('rowboat', 73, 38, 90).prop('mooring-post', 71, 37);

  // ----- the drowned lower town -----
  b.area('The Drowned Streets', [[0, 26, 40, 20]], {
    read: 'The street goes down the hill and simply ends in brown water. Roofs stick up like islands. A rocking chair floats past, then a door, then a dead dog.',
    gm: 'Waist-deep water: difficult terrain. The sinkhole by the old pump is deep (swim, DC 15 Athletics). Swimmers have disadvantage on Stealth only if they splash: the storm hides most noise.',
    label: [20, 28],
  });
  b.props_('debris-wood', [[2, 29], [36, 29], [22, 40]]).props_('broken-furniture', [[18, 37]]).prop('well', 31, 39).props_('lamp-post', [[22, 30], [12, 41]]).prop('handcart', 37, 38, 30).prop('reeds', 2, 39);
  b.rubble(34, 38, 4, 3).rubble(26, 39, 3, 3);
  b.building('Customs House', 4, 31, 13, 8, {
    mat: 'stone-flagstone',
    read: 'Lantern light moves inside the customs house. Men in black oilskins are breaking open strongboxes and tossing the contents into a skiff tied at the door.',
    gm: 'A Reaver loot-crew with two sea-witches. Their black oilskins bear a closed white eye: the sign of the Grey Tide. A captured Reaver (DC 18 Intimidation) says: "Captain Kettlewake says the giants\' storm is a gift. Plenty of salvage for everyone, and the Listener takes the rest."',
    doors: [[10, 31, 'n', 'closed', 'door-double'], [16, 35, 'e', 'closed']],
    windows: [[4, 33, 'w'], [13, 38, 's']],
  });
  b.water(5, 36, 11, 2, false, true);
  b.props_('strongbox', [[6, 32], [8, 32]]).prop('desk', 13, 33).prop('map-cabinet', 15, 32).props_('crate-pile', [[5, 34]]).prop('canoe', 9, 37).prop('lantern-hanging', 10, 34).prop('scales', 14, 35);
  b.light(10, 34, 10, 15, FIRE);
  b.encounter('Reavers at the customs house', [4, 30, 13, 10], [['veteran', 4], ['gladiator', 1], ['mage', 2]], 'low');
  b.building('Net-loft', 24, 30, 10, 7, {
    mat: 'wood-planks-dark',
    read: 'Nets hang from the rafters, dripping. On the upper floor, which is still dry, a family of five sits very quietly with a crossbow pointed at the door.',
    gm: 'The Lennick family would not leave their home. If calmed (DC 14 Persuasion) the father says the Reavers row out to the reef "every night at the turn of the tide, with a green lamp". They can be taken up the hill: Honora will remember it.',
    doors: [[28, 36, 's', 'closed'], [24, 33, 'w', 'closed']],
  });
  b.props_('fishing-net', [[25, 31], [31, 31]]).prop('ladder', 32, 34).prop('trunk', 26, 34).prop('bedroll', 30, 33).prop('fishing-gear', 27, 31);
  b.building('Ropewalk', 3, 42, 22, 4, {
    read: 'A long, low shed where ropes were twisted. Now it is a tunnel of black water with coils of rope floating like sea snakes.',
    gm: 'A quick, sheltered way from the drowned streets to the seawall, out of the wind. A DC 15 Perception check spots a Reaver lookout\'s spyglass glinting on the quay.',
    doors: [[13, 42, 'n', 'open'], [24, 43, 'e', 'closed'], [3, 44, 'w', 'closed']],
  });
  b.water(4, 43, 20, 2, false, true);
  b.props_('rope-coil', [[6, 43], [12, 44], [19, 43]]).prop('winch', 22, 44).prop('spinning-wheel', 9, 43);

  // ----- the seawall, the beach and the harbour -----
  b.floor(0, 46, 44, 4, 'stone-cobble');
  b.rubble(16, 46, 3, 2);
  b.area('The Seawall Quay', [[0, 46, 44, 4]], {
    read: 'Every wave comes right over the seawall now. The water rears up in shapes, almost like arms, almost like faces, before it smashes down on the cobbles.',
    gm: 'The storm itself has woken spirits of wind and wave. Each time the heroes cross the quay in the open, roll a d6: on 1-3 the storm-wrack rises. The breach at the old pump (rubble) floods the lower town a little more each hour.',
    label: [8, 47],
  });
  b.props_('sandbags', [[3, 46], [26, 46]]).props_('lamp-post', [[10, 47], [34, 47]]).prop('anchor', 20, 48).prop('mooring-post', 28, 49).prop('barricade-wood', 15, 49);
  b.light(10, 47, 10, 15, FIRE).light(34, 47, 10, 15, FIRE);
  b.encounter('Storm-wrack at the seawall', [0, 44, 28, 6], [['air-elemental', 2], ['water-elemental', 2]], 'low');
  b.paint(0, 50, 28, 10, 'sand');
  b.area('Gull Strand', [[0, 50, 28, 10]], {
    read: 'A grey beach strewn with wreckage: timber, rope, and one great carved oar, longer than a house, with a crowned wave painted on its blade.',
    gm: 'The oar is from the Dawnkeel, the giants\' ship. DC 16 Investigation: it was snapped, not cut, as if the ship struck rock while rowing hard toward shore, toward a light.',
    label: [18, 54],
  });
  b.prop('log-fallen', 16, 55, 30).props_('debris-wood', [[22, 52], [8, 58]]).prop('sails-pile', 25, 57).props_('boulder', [[19, 59], [2, 58]]);
  b.building('Boathouse', 4, 51, 9, 6, {
    read: 'A boathouse with its doors torn away. One good fishing boat is still on its cradle.',
    gm: 'The boat holds eight and can row out to the reef (DC 15 Water Vehicles or Athletics checks each 100 feet, three successes needed; a failure means the storm-wrack notices).',
    doors: [[8, 51, 'n', 'open'], [12, 54, 'e', 'open', 'door-broken']],
  });
  b.prop('rowboat', 8, 54).prop('tool-wall', 5, 52).prop('workbench', 11, 52).prop('barrel', 5, 55);
  b.floor(30, 50, 2, 11, 'wood-planks').floor(38, 50, 2, 13, 'wood-planks');
  b.floor(33, 52, 3, 9, 'wood-planks-dark').floor(41, 53, 3, 9, 'wood-planks-dark');
  b.area('The Reaver Piers', [[28, 50, 16, 14]], {
    read: 'Two long black ships ride at the piers, low in the water with stolen cargo. A green lantern hangs from the taller mast, and under it a woman in a captain\'s coat is laughing at the storm.',
    gm: 'Captain Rowenna Kettlewake and her crew. In her cabin: Sennequar\'s letter (handout) and a lantern of thick, cloudy glass, man-high, with a closed eye in a cloud cut into its frame. This is the false light. The shard from Wenneth fits a chip in its lens exactly. Rowenna surrenders at a quarter of her hit points and will trade the letter for her life.',
    label: [36, 52],
  });
  b.props_('ship-mast', [[34, 56], [42, 57]]).props_('cargo-crates', [[33, 53], [42, 60]]).prop('sails-pile', 34, 59).prop('gangplank', 32, 55, 90).prop('ship-wheel', 42, 54).prop('lantern-hanging', 34, 55).prop('cannon', 43, 58).props_('mooring-post', [[31, 51], [39, 51]]).prop('loot-sacks', 33, 58).prop('treasure-map', 41, 56);
  b.light(34, 55, 15, 20, GREEN);
  b.encounter('The Reaver longships', [28, 48, 16, 15], [['gladiator', 1], ['mage', 3], ['veteran', 6], ['giant-shark', 2]], 'moderate');

  // ----- the bay, the breakwater and the reef -----
  b.floor(44, 48, 14, 2, 'stone');
  b.rubble(50, 48, 2, 2);
  b.area('The Breakwater', [[44, 48, 14, 2]], {
    read: 'The old breakwater runs out into the bay, broken in the middle where waves have torn the stones away. Spray hides its end.',
    gm: 'Crossing the gap: DC 15 Athletics jump, or DC 17 Strength save if a wave hits mid-jump. At the far end, Gull Rock, where the false light hung.',
    label: [46, 48],
  });
  b.cave('Gull Rock', 59, 48, 3, 2, { seed: 21, mat: 'sand',
    read: 'A hump of guano-white rock. An iron ring-bolt as thick as your arm has been hammered into it, and new.',
    gm: 'The false light hung here, set a little south of the real lighthouse so that a ship steering for "the light" ran straight onto the Teeth. DC 17 Investigation: giant-sized boot prints in a hollow, filled with sand, and smaller human ones.' });
  b.prop('mooring-post', 59, 48).prop('bones', 61, 49);
  b.water(56, 50, 4, 6, false);
  b.area('The Deep Channel', [[44, 52, 11, 12]], {
    read: 'Between the breakwater and the reef the water is black and still, oddly still, as if something huge is lying under it. Then an island opens one eye.',
    gm: 'Gravelshell, an ancient dragon turtle, has come in from the deep to escape the storm, and the slime Quorlath leaks into the water burns its gills. It is in no mood for small things. A hero who speaks Aquan or Draconic and offers to rid the bay of "the grey thing under the reef" can make it an ally (DC 21 Persuasion): it will then guard the boats and fight Quorlath\'s servants. Sneaking past along the sandbar: DC 18 group Stealth.',
    label: [49, 57],
  });
  b.prop('whirlpool', 48, 60).prop('deep-water', 51, 55);
  b.encounter('The old one in the channel', [44, 52, 12, 12], [['dragon-turtle', 1]], 'moderate');
  b.cave(null, 68, 44, 5, 3, { seed: 22, mat: 'sand' });
  b.cave(null, 76, 49, 3, 4, { seed: 23, mat: 'sand' });
  b.rubble(66, 43, 3, 2).rubble(76, 48, 2, 3).rubble(70, 46, 2, 1);
  b.area('The Grindle Teeth', [[63, 41, 17, 12]], {
    read: 'Black rocks like broken teeth stand out of the boiling surf. Every few seconds a wave buries them completely.',
    gm: 'The reef. Walking the rocks: DC 15 Acrobatics each round or fall in. A hero who falls between the Teeth is battered (2d10 bludgeoning) and must swim (DC 16 Athletics).',
    label: [69, 44],
  });
  b.props_('boulder-large', [[67, 45], [77, 51]]).prop('crumbling-ledge', 71, 44).prop('bones', 64, 44);
  // the wreck of the Dawnkeel, broken in two on the reef
  b.floor(54, 57, 10, 5, 'wood-planks-dark').floor(52, 58, 2, 3, 'wood-planks-dark');
  b.floor(66, 55, 11, 8, 'wood-planks-dark');
  b.water(64, 56, 2, 7, false);
  b.area('Dawnkeel, the fore hull', [[52, 57, 12, 5]], {
    read: 'The front half of a ship built for giants lies tilted on the rocks. Its deck is the size of a village green. A carved figurehead of a young giantess, crowned with waves, gazes at the shore.',
    gm: 'The figurehead is the princess\'s likeness. The hull is holed low on the shore side: DC 15 Investigation shows it struck at speed, rowing toward land, not driven by the wind. The ship\'s log is in the chart room (handout).',
    label: [57, 59],
  });
  b.prop('ship-mast', 57, 59).prop('sails-pile', 55, 58).prop('anchor', 53, 59).prop('cargo-hatch', 60, 60).prop('table-maps', 61, 58).prop('chest', 62, 60);
  b.area('Dawnkeel, the aft hull', [[66, 55, 11, 8]], {
    read: 'The stern rises out of the sea like a tilted hall. A great wheel turns idly. Through the doorway of a cabin built for a giant child of twelve, you see a bed the size of a barn, and a shelf of dolls.',
    gm: 'Ilvanna\'s cabin: she was twenty in giant years, a child still to her father. Her sea-chest holds her circlet (a 2,500 gp art object the king will know). A rent in the hull, hidden under a fallen sail (DC 18 Perception), opens on a slimy tunnel going down into the reef: the green glow comes from below.',
    label: [71, 58],
  });
  b.prop('ship-wheel', 74, 56).prop('bed-canopy', 68, 60).prop('display-case', 70, 61).prop('chest', 67, 56).prop('sails-pile', 72, 61).prop('cannon', 75, 59).prop('broken-furniture', 69, 57);
  b.light(72, 58, 5, 10, GREEN);
  b.encounter('Salvagers on the wreck', [52, 55, 26, 9], [['veteran', 4], ['mage', 2], ['water-elemental', 2]], 'low');
  // the Listener's grotto under the reef
  b.hall(72, 63, 72, 68, 1, { mat: 'cave-floor' }).door(72, 62, 's', 'secret');
  b.cave("The Listener's Grotto", 70, 72, 8.5, 5.5, { seed: 24, wobble: 0.1,
    read: 'A dome of rock under the reef, lit by a sick green light. Skin-thin slime coats everything. In a pool at the centre lies something long and grey with three red eyes, and around its neck, on a chain made for a giant, hangs a single glowing pearl.',
    gm: 'Quorlath, an aboleth, with its priestess Thessaly Saltmourne, a second sea-witch, two Reaver thralls, its chuul and the drowned that serve it as water spirits. The pearl is Ilvanna\'s song-pearl: storm giants carry one from birth and it keeps their last song. Quorlath took it from her as she drowned and has been drinking her memories ever since. Kill or drive off Quorlath and the pearl is free. Thessaly fights to the death unless shown that Quorlath means to drown the Reavers too (DC 20 Insight to spot its thoughts in her eyes).' });
  b.pool(70, 73, 4, 2.5, true);
  b.hall(58, 72, 63, 72, 2, { mat: 'cave-floor' });
  b.water(56, 72, 8, 2, true);
  b.props_('green-slime', [[65, 70], [76, 74]]).prop('idol', 74, 69).prop('magic-circle', 66, 75).props_('skeleton-lying', [[73, 76], [64, 73]]).prop('treasure-pile', 77, 72).prop('crystal-cluster', 68, 69);
  b.light(70, 73, 15, 20, GREEN).light(66, 75, 5, 10, GREEN);
  b.encounter("The Listener's grotto", [62, 67, 17, 11], [['aboleth', 1], ['mage', 2], ['chuul', 4], ['water-elemental', 4], ['veteran', 2]], 'high');
  b.note(56, 73, 'The drowned way: an underwater tunnel from the bay into the grotto (DC 16 Athletics, 60 feet underwater).');
  return b.build();
}

// ---------- Part 2: Highsurge Hold ----------
function highsurgeHold() {
  const b = new MapBuilder('adv-storm-king-hold', 'Highsurge Hold', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });

  // the sea at the foot of the stack, and along its western face
  b.water(0, 74, 80, 6, true);
  b.water(0, 30, 3, 44, true);

  // ----- the Sea Gate -----
  b.room('The Sea Gate', 30, 60, 20, 14, {
    mat: 'wood-planks',
    read: 'Your boat slides out of the storm into a sea-cave as tall as a cathedral. Docks line both sides of a black channel. Mooring chains as thick as tree trunks clank in the swell, and two frost giants in sea-green cloaks step out of the shadows, axes raised.',
    gm: 'The wardens are loyal to the king, not to Sennequar, and they hate the storm too: their families live on the stack\'s lower levels, which are flooding. If Hildra is with the party they lower their axes at once. Otherwise DC 20 Persuasion, or show the princess\'s circlet. If they fight, one runs up the Grand Stair to warn the court.',
  });
  b.water(37, 60, 6, 14, true);
  b.start(32, 70, 3, 3);
  b.props_('mooring-post', [[36, 66], [43, 66], [36, 71], [43, 71]]).prop('rowboat', 39, 69).prop('anchor', 46, 62).prop('winch', 31, 61).prop('chains-hanging', 48, 66).props_('cargo-crates', [[47, 70], [33, 63]]).prop('gangplank', 36, 68, 90).props_('brazier-pedestal', [[31, 66], [48, 61]]);
  b.light(31, 66, 15, 20, FIRE).light(48, 61, 15, 20, FIRE);
  b.encounter('Frost giant wardens', [30, 60, 20, 13], [['frost-giant', 2]], 'low');

  // ----- the Flooded Undercroft, the wrack cave and the cliff ledge -----
  b.room('The Flooded Undercroft', 8, 50, 20, 20, {
    read: 'Rows of giant pillars march away into water as dark as ink. The vaults moan each time the sea heaves. Shapes of water rise between the pillars, take the form of drowned sailors, and fall back.',
    gm: 'Waist-deep for humans (difficult terrain), with two deep sumps. The storm has called water spirits in through the wrack cave; a shark came with them. Stores of the castle float everywhere. A DC 17 Perception check finds a hidden stair in the north wall\'s shadow (the princess\'s old secret way).',
  });
  b.water(8, 50, 20, 20, false, true).water(11, 55, 5, 5, true, true).water(20, 62, 5, 5, true, true);
  b.props_('column-fluted', [[10, 52], [16, 52], [22, 52], [10, 60], [16, 64], [24, 58], [12, 67]]).props_('barrel-group', [[25, 51], [19, 56]]).prop('column-collapsed', 18, 59).props_('crate', [[9, 65], [26, 68]]).prop('wine-rack', 26, 54);
  b.encounter('Storm-wrack in the undercroft', [8, 50, 20, 20], [['water-elemental', 4], ['giant-shark', 1]], 'low');
  b.hall(28, 64, 29, 64, 2);
  b.door(29, 64, 'e', 'open', 'door-double').door(29, 65, 'e', 'open', 'door-double');
  b.tunnel([[17, 69], [19, 73]], 2, { seed: 31, mat: 'cave-floor' });
  b.area('The Wrack Cave', [[16, 70, 5, 4]], {
    read: 'A ragged hole in the stack where the sea pours in and out, frothing white.',
    gm: 'A second way in from the sea, by boat or swimming (DC 17 Athletics). Anything swimming in is noticed by the storm-wrack.',
  });
  b.prop('rapids', 18, 71);
  b.tunnel([[4, 73], [5, 64], [3, 54], [5, 44], [4, 34], [5, 30]], 2, { seed: 32, mat: 'stone' });
  b.rubble(3, 50, 3, 3).rubble(3, 40, 3, 2);
  b.area("The Climbers' Ledge", [[3, 30, 3, 44]], {
    read: 'A ledge no wider than a cart winds up the sheer western face of the stack. The sea explodes against the rock below, and the wind tries to peel you off.',
    gm: 'Hildra\'s way in, known only to the princess\'s household. Each 100 feet: DC 16 Athletics or Acrobatics. Fail by 5 or more and fall into the sea (4d6 bludgeoning). It climbs to the Tomb-Garden. A rusted wrack door opens into the undercroft halfway up.',
    label: [4, 45],
  });
  b.hall(4, 60, 7, 60, 1).door(7, 60, 'e', 'closed', 'door-iron');
  b.props_('crumbling-ledge', [[4, 56], [4, 38]]).prop('boulder', 5, 47);

  // ----- the Cisterns -----
  b.room('The Cisterns', 54, 50, 22, 20, {
    read: 'Huge stone tanks catch the rain for the castle. Every one is overflowing. Narrow walkways run between them, and somebody has strung lanterns along the walkways: green ones.',
    gm: 'The last of the Grey Tide came here by boat with Sennequar\'s leave, to carry off the king\'s treasure while he grieves. The lift shaft in the north-east corner rises to the Storm Engine; its winch works (DC 15 Strength).',
  });
  b.water(57, 53, 7, 6, true, true).water(66, 53, 7, 6, true, true).water(57, 62, 16, 5, false, true);
  b.props_('lantern-hanging', [[65, 55], [65, 60]]).props_('loot-sacks', [[55, 51], [74, 68]]).prop('coin-stacks', 74, 51).props_('water-barrel', [[55, 68], [64, 68]]).prop('rowboat', 60, 64);
  b.light(65, 55, 10, 15, GREEN).light(65, 60, 10, 15, GREEN);
  b.encounter('Reavers in the cisterns', [54, 50, 22, 20], [['veteran', 6], ['mage', 2], ['gladiator', 1]], 'low');
  b.hall(50, 64, 53, 64, 2);
  b.door(53, 64, 'e', 'closed', 'door-double').door(53, 65, 'e', 'closed', 'door-double');

  // ----- the Grand Stair, the Honour Guard and the Kitchen -----
  b.room('The Grand Stair', 35, 40, 10, 20, {
    mat: 'marble',
    read: 'A stair made for giants climbs from the docks into the heart of the stack, each step as high as your chest. Stone kings line the walls. From far above, through the stone itself, comes a sound like a man weeping in a voice of thunder.',
    gm: 'Climbing the giant steps is slow (every step is difficult terrain for Medium creatures) unless the heroes use the narrow servants\' stair cut along the east side. The weeping is the king. Every ten minutes here, the storm surges: lightning strikes the stack and the whole castle rings.',
  });
  b.props_('stair-grand', [[39, 44], [39, 52]]).props_('statue-tall-knight', [[35, 42], [44, 42], [35, 50], [44, 50], [35, 57]]).props_('banner-hanging-tall', [[36, 46], [43, 46]]);
  b.light(39, 48, 10, 20, STORM);
  b.room('Hall of the Honour Guard', 24, 40, 11, 9, {
    read: 'Bunks the size of boats, all empty. Shields painted with a crowned wave hang on the walls. One shield has been turned to face the wall.',
    gm: 'The princess\'s honour guard died with her, all but Hildra. The turned shield is Hildra\'s: the others think she ran. If she is with the party, this hurts. A footlocker holds a +2 shield sized for a giant (useless) and a horn of blasting (usable).',
  });
  b.wallRun(34, 40, 9, 'e').door(34, 45, 'e', 'closed', 'door-double').door(34, 46, 'e', 'closed', 'door-double');
  b.props_('bunk-bed', [[25, 41], [28, 41], [31, 41]]).props_('shield-wall', [[25, 47], [30, 47]]).prop('footlocker', 33, 43).prop('armor-stand', 26, 45).prop('training-dummy', 30, 44);
  b.hall(26, 49, 26, 49, 1).door(26, 48, 's', 'closed');
  b.room("The Giants' Kitchen", 45, 40, 12, 9, {
    mat: 'stone-flagstone-warm',
    read: 'A kitchen with a hearth you could park a wagon in. Two stone giants in aprons are boiling a whole whale, sobbing as they stir.',
    gm: 'The cooks. The king has not eaten in nine days, and they cook his favourite meal every night anyway. They fight only if attacked or if the heroes threaten the king. A kind word gets gossip: "The counsellor brings the king his wine himself now. Every night. The king sleeps like the dead after." (Sennequar drugs him to keep his grief raw.)',
  });
  b.wallRun(45, 40, 9, 'w').door(45, 44, 'w', 'closed', 'door-double');
  b.prop('hearth-grand', 50, 40).prop('cauldron', 49, 42).prop('butcher-block', 53, 44).prop('pot-rack', 46, 41).props_('flour-sacks', [[55, 41], [55, 46]]).prop('table-feast', 49, 46).prop('wine-rack', 46, 47);
  b.light(50, 41, 15, 25, FIRE);
  b.encounter('Stone giant cooks', [45, 40, 12, 9], [['stone-giant', 2]], 'low');
  b.hall(55, 49, 55, 49, 1);

  // ----- the Throne Hall -----
  b.room('The Storm Doors', 36, 36, 8, 4, {
    read: 'Bronze doors fifty feet tall, cast with a crowned wave. They are shut, and lightning crawls over them.',
    gm: 'Touching the doors uninvited: 4d10 lightning (DC 18 Dexterity half). Knocking three times is the old custom of a petitioner, and the doors open on their own.',
  });
  b.wallRun(36, 36, 8, 'n');
  b.door(38, 36, 'n', 'closed', 'door-double').door(39, 36, 'n', 'closed', 'door-double').door(40, 36, 'n', 'closed', 'door-double').door(41, 36, 'n', 'closed', 'door-double');
  b.props_('brazier-pedestal', [[36, 38], [43, 38]]).light(36, 38, 10, 15, STORM).light(43, 38, 10, 15, STORM);
  b.room('The Throne Hall', 24, 8, 32, 28, {
    mat: 'marble',
    read: 'Half the roof of the throne hall is gone, and the storm pours straight in. Rain falls in curtains between the pillars. On a throne of grey coral at the far end sits a giant with a beard of white foam and a crown of black iron, holding a small silver circlet in his enormous hands. He does not look up.',
    gm: 'King Orsavel Highsurge. He is not mad, only broken: Sennequar has told him the coast-folk lit false lights and killed his child, and every night has fed him a draught of sleepless grief. Persuading him is a skill challenge: five successes before three failures (DC 20 Persuasion, Insight, Performance or History of giants). Each piece of evidence the heroes show (the false lantern, the letter, the log, the pact) is an automatic success. The song-pearl ends the challenge at once if played in the Tomb-Garden. Three failures, or any attack, and he rises with the storm.',
  });
  b.water(29, 13, 7, 5, false, true).water(44, 22, 8, 6, false, true).water(30, 27, 5, 4, false, true);
  b.prop('throne-dais', 39, 10).prop('throne', 39, 9).props_('column-fluted', [[28, 12], [28, 18], [28, 24], [28, 30], [51, 12], [51, 18], [51, 24], [51, 30]]).props_('column-collapsed', [[37, 23]]).props_('banner-hanging-tall', [[32, 8], [47, 8]]).props_('brazier-pedestal', [[35, 11], [44, 11]]).prop('rubble-pile', 41, 20).prop('puddle', 33, 33).prop('crown-cushion', 42, 10);
  b.light(39, 12, 20, 30, STORM).light(35, 11, 10, 15, FIRE).light(44, 11, 10, 15, FIRE);
  b.encounter('The grieving king', [24, 8, 32, 28], [['storm-giant', 1], ['air-elemental', 4], ['water-elemental', 3]], 'high');
  // the king's and the princess's rooms, north of the hall
  b.room("The King's Rooms", 26, 1, 12, 6, {
    mat: 'wood-planks-dark',
    read: 'A bed for a giant, never slept in. On the table, nine untouched meals in a row, gone cold.',
    gm: 'Under the ninth plate, a cup with a grey crust (DC 16 Medicine or Nature: a poppy-and-nightshade draught, giant-sized; a dose like that would keep anyone in waking nightmares). Showing the king the cup is evidence.',
  });
  b.hall(30, 7, 30, 7, 1).door(30, 7, 's', 'closed', 'door-double');
  b.prop('bed-four-poster', 28, 2).prop('dining-table-six', 33, 4).prop('chalices', 34, 3).prop('wardrobe', 36, 1).prop('rug-pelt', 30, 4);
  b.room("Ilvanna's Chamber", 42, 1, 12, 6, {
    mat: 'wood-planks',
    read: 'A young giant\'s room: charts of the coast pinned everywhere, a model of the town of Shearwater the size of a table, and tiny human-sized paper boats lined up along the window.',
    gm: 'Ilvanna loved the coast-folk. Her charts mark the harbour, the lighthouse and Gull Rock, with a note in Giant: "Light the wreck-lanterns no more. When I am crowned, the tithe of wrecks ends." (handout). This is why Sennequar wanted her dead: the wreck tithe made him rich.',
  });
  b.hall(48, 7, 48, 7, 1).door(48, 7, 's', 'closed');
  b.prop('bed-canopy', 51, 2).prop('table-maps', 46, 3).prop('bookshelf-tall', 43, 1).prop('vanity', 52, 5).prop('globe-stand', 44, 5).prop('jewelry-box', 50, 5);

  // ----- the Tomb-Garden -----
  b.room('Gallery of Kings', 20, 18, 4, 6, {
    read: 'A short gallery hung with tapestries of storm giant kings. The last one shows Orsavel with a small girl on his shoulders, both laughing.',
    gm: 'A quiet place. A hero who stops here to look at the last tapestry gains advantage on their first check in the king\'s skill challenge.',
  });
  b.wallRun(20, 18, 6, 'w').wallRun(23, 18, 6, 'e');
  b.door(20, 20, 'w', 'closed', 'door-double').door(20, 21, 'w', 'closed', 'door-double').door(23, 20, 'e', 'closed', 'door-double').door(23, 21, 'e', 'closed', 'door-double');
  b.props_('tapestry-tall', [[21, 18], [22, 23]]).prop('rug-runner', 21, 20, 90);
  b.room('The Tomb-Garden', 6, 6, 14, 30, {
    mat: 'grass',
    read: 'A garden on the cliff top, open to the sky. Somehow the storm does not touch it: rain falls all around and stops at its edge. Sea-roses, a still pool, and a long white tomb with a sleeping giantess carved on its lid.',
    gm: 'Ilvanna\'s tomb. The calm here is her last song, still held in the stone. Two stone guardians (stone golems) stand at the gate and attack anyone who comes armed and unbowed; kneeling or laying down weapons passes them (DC 15 Insight to guess). Play the song-pearl on the tomb and Ilvanna\'s ghost rises (handout: her song).',
  });
  b.pool(12, 25, 4, 3);
  b.props_('sarcophagus-effigy', [[12, 12]]).props_('statue-tall-winged', [[8, 8], [17, 8]]).props_('flowers', [[9, 14], [15, 15], [8, 20], [17, 21], [10, 31]]).props_('tree-willow', [[7, 27], [18, 30]]).props_('hedge', [[8, 17], [16, 17]]).prop('plinth-display', 12, 15).props_('candles', [[10, 11], [14, 11]]).prop('bush', 17, 33).prop('bench', 13, 31);
  b.light(12, 12, 10, 20, '#ffe9b8');
  b.encounter('Garden guardians', [6, 6, 14, 30], [['stone-golem', 2]], 'low');
  b.hall(14, 36, 14, 49, 1).door(14, 35, 's', 'secret').door(14, 49, 's', 'closed');
  b.area("The Princess's Stair", [[14, 36, 1, 13]], {
    read: 'A narrow stair, human-narrow, cut through the rock. Chalk marks on the wall measure a child\'s height, year after year, up to the height of the ceiling.',
    gm: 'The secret way between the Tomb-Garden and the undercroft. Ilvanna used it to sneak down to the sea as a girl. Its door into the garden is hidden in the hedge (DC 18 Perception from the garden side).',
  });

  // ----- the Cloud Bridge and the Counsellor's Tower -----
  b.wallRun(55, 8, 28, 'e');
  b.pit(56, 6, 5, 18);
  b.floor(56, 12, 5, 2, 'wood-planks');
  b.door(55, 12, 'e', 'closed', 'door-double').door(55, 13, 'e', 'closed', 'door-double');
  b.area('The Rift', [[56, 6, 5, 18]], {
    read: 'The castle is split by a gap open to the sky, and far, far below it the sea boils white.',
    gm: 'A 300-foot drop into the sea. Anyone falling takes 10d6 bludgeoning and lands in the surf at the Sea Gate.',
    label: [58, 20],
  });
  b.area('The Cloud Bridge', [[56, 12, 5, 2]], {
    read: 'A bridge of white wood, no rail, crosses the gap to a slim tower wrapped in cloud. The wind screams across it.',
    gm: 'Sennequar\'s servants of air guard the bridge, invisible until they strike. Each round on the bridge: DC 16 Strength save or be pushed 10 feet (off the bridge means a fall). Featherfall, flight, or roping together all help.',
  });
  b.prop('obscuring-cloud', 58, 9).prop('obscuring-cloud', 58, 17);
  b.encounter('Wind on the Cloud Bridge', [56, 6, 5, 18], [['air-elemental', 3], ['invisible-stalker', 2]], 'low');
  b.cave("The Counsellor's Tower", 69, 13, 8, 8, { seed: 41, mat: 'marble', wobble: 0.05,
    read: 'Inside the tower everything is white and soft as cloud: the floor gives underfoot, mist drifts over tables of glass instruments, and a hundred crystal globes hang in the air, each showing a different piece of coast.',
    gm: 'Sennequar\'s workroom, guarded by his shield guardians, his apprentices and two invisible servants. The globes are scrying-orbs: one shows the Lamp cellar, one the Reaver Piers, one Gull Rock on the wreck night, replaying it (the green lantern, the giant hand that hangs it). A second globe can be smashed, but this one is evidence: it can be carried (it is the size of a barrel).',
  });
  b.props_('orrery', [[68, 10]]).prop('crystal-ball', 72, 13).prop('globe-great', 65, 15).props_('bookcase-grand', [[64, 9], [74, 9]]).prop('writing-desk', 70, 17).prop('stair-spiral', 69, 20).prop('magic-mirror', 75, 15).props_('light-orb', [[66, 12], [72, 9]]).prop('astrolabe-stand', 62, 13);
  b.light(66, 12, 10, 20, STORM).light(72, 9, 10, 20, STORM);
  b.encounter("The counsellor's guard", [61, 5, 17, 17], [['shield-guardian', 2], ['mage', 3], ['invisible-stalker', 2]], 'moderate');
  b.room("Sennequar's Sanctum", 64, 0, 11, 3, {
    mat: 'marble',
    read: 'A hidden room as cold as a cloud top. A desk of pale glass, and on it a letter written in green ink that still glistens wet.',
    gm: 'The proof. Sennequar\'s pact with Quorlath (handout) and his account book of the wreck tithe: thirty years of human ships, every one marked. The secret door is behind the great mirror (DC 19 Investigation, or a detect magic shows the mirror is a door).',
  });
  b.hall(69, 3, 69, 4, 1).door(69, 2, 's', 'secret');
  b.prop('desk', 69, 1).prop('strongbox', 73, 1).prop('scroll-rack', 65, 1).prop('treasure-pile', 74, 2);

  // ----- the Storm Engine -----
  b.hall(68, 22, 68, 27, 2);
  b.area('Tower stair', [[68, 22, 2, 6]], { read: 'A spiral stair of cloud-white stone goes down. The air hums and smells of lightning.', gm: 'From the tower down to the Storm Engine.' });
  b.room('Hall of Winds', 56, 30, 4, 4, {
    read: 'A short hall where the wind blows in from both ends at once and meets in the middle with a howl.',
    gm: 'The way from the Throne Hall to the Storm Engine. Iron doors at both ends.',
  });
  b.wallRun(56, 30, 4, 'w').wallRun(59, 30, 4, 'e');
  b.door(56, 31, 'w', 'closed', 'door-iron').door(56, 32, 'w', 'closed', 'door-iron').door(59, 31, 'e', 'closed', 'door-iron').door(59, 32, 'e', 'closed', 'door-iron');
  b.room('The Storm Engine', 60, 28, 18, 18, {
    mat: 'dungeon-slab',
    read: 'The heart of the stack is a hollow full of lightning. Around a well of white fire turn rings of bronze and crystal, bigger than mill wheels, and through them runs a chain of light that goes up and out through the roof into the storm. Hanging from the chain is a crown, and a tall, beautiful giant with silver hair is singing to it.',
    gm: 'An ancient giant weather-loom. Sennequar has tied it to the king through his crown: the king\'s grief feeds the storm, and the storm drinks the king\'s life. The engine has three crystal anchors (AC 18, 60 HP each, immune to lightning and thunder); breaking all three ends the storm. Each round at initiative 20: lightning strikes a random hero (DC 19 Dexterity save, 6d10 lightning, half on a success). Anyone who falls into the well takes 10d10 lightning and is thrown back out.',
  });
  b.pit(66, 34, 6, 6);
  b.props_('crystal-spire', [[62, 30], [75, 30], [68, 43]]).prop('orrery', 68, 32).props_('steam-vent', [[63, 40], [74, 41]]).prop('summoning-circle', 64, 36).prop('lever', 76, 37).prop('rune-stone', 61, 44).props_('chains-hanging', [[68, 36], [70, 36]]);
  b.light(68, 36, 25, 30, STORM).light(62, 30, 10, 15, STORM).light(75, 30, 10, 15, STORM);
  b.encounter('Sennequar at the storm engine', [60, 28, 18, 18], [['cloud-giant', 1], ['air-elemental', 4], ['invisible-stalker', 2], ['shield-guardian', 2]], 'high');
  b.hall(70, 46, 70, 49, 2);
  b.area('The Lift Shaft', [[70, 46, 2, 4]], {
    read: 'A square shaft drops away to the cisterns. A platform hangs from a great chain and winch.',
    gm: 'Climbing the chain: DC 15 Athletics. The winch raises the platform in one round from the top, three from the bottom (and it squeals: the engine room hears it).',
  });
  b.prop('winch', 71, 47);
  b.note(39, 66, 'Hildra knows two other ways in: the Wrack Cave (west, by the sea) and the Climbers\' Ledge up the cliff face.');
  return b.build();
}

export const STORM_KING_GRIEF: Adventure = {
  id: 'storm-king-grief',
  title: "The Storm King's Grief",
  tagline: 'A storm giant king mourns his drowned daughter with a storm that will not end. Find out who really sank her ship before the coast drowns.',
  levels: '14',
  sessions: '2-3 sessions',
  players: '3-5 players',
  tags: ['epic', 'giants', 'storm', 'tragedy', 'sea'],
  pitch:
    'Nine days ago, the ship of a storm giant princess broke on the reef off the town of Shearwater. She drowned. Her father, the King of the Tall Weather, wept, and the sky wept with him. It has not stopped since. The sea rises a street a day. Raiders in black sails loot the drowned houses. In three days the spring tide meets the storm, and Shearwater, and every village along the coast, will be gone. Someone has to go out to the king\'s castle in the clouds, and make him stop.',
  secret:
    'The wreck was murder. Sennequar Duskmantle, the king\'s cloud giant counsellor, has grown rich for thirty years on the old "tithe of wrecks": giants salvage every ship that breaks on the coast, and Sennequar quietly helps ships break. Princess Ilvanna meant to end the tithe when she was crowned at midsummer, and to make peace with the coast-folk she loved. So Sennequar struck a pact with Quorlath, an aboleth under the reef, and its human cult, the Reavers of the Grey Tide. On the night of the wreck the Reavers knocked out the lighthouse keeper and hung a false light of cloud-glass on Gull Rock; the princess\'s ship rowed for it and struck the Grindle Teeth; Quorlath took the drowning princess\'s song-pearl and her memories. Then Sennequar told the king that the coast-folk lit the false light, and tied the king\'s grief to the Storm Engine, an ancient weather-loom in the castle. The storm drowns the coast so the Reavers can loot it; it also drinks the king\'s life. When the king dies, Sennequar rules as regent. Why now: the spring tide in three days will finish the coast, and the king will not last much longer.',
  hooks: [
    'Mother Honora Drewe, who shelters the drowned-out families of Shearwater, begs the heroes to reach the giant king. The town has nothing to pay with but its gratitude and the church\'s silver (1,000 gp).',
    'The heroes\' own ship is driven onto the coast by the storm. They come ashore at Shearwater with the sea already at their heels.',
    'A frost giant\'s horn is heard each night from the cliffs, blowing a call of mourning. Whoever is blowing it is alive out there, and badly hurt.',
  ],
  tips: [
    'Keep a Flood track the players can see: it starts at 0 and goes up by 1 every half day of game time. At 6 the hill-top camp goes under and the coast is lost. Ending the storm stops it at once.',
    'The weather is an enemy in every scene. Wind spoils long shots, waves push people about, lightning picks targets. Describe it every round, not just once.',
    'Part 1 is open: let the heroes go to the piers, the lighthouse, the wreck or the caves in any order. Every place has one piece of proof. Keep a list of proof found: it pays off in the Throne Hall.',
    'Many fights can be skipped or turned: the roc can be fed, the dragon turtle bargained with, Hildra and the frost giant wardens won over, the stone giant cooks befriended, Thessaly turned against her master.',
    'The best ending is the peaceful one: the king persuaded, the princess\'s song heard, Sennequar unmasked. Reward it richly. A party that just kills the king still has to break the Storm Engine, and the giants will not forgive them.',
    'Level 14 heroes can fly, teleport and talk to the dead. Let them. Speak with Dead on the princess\'s body (in the tomb) gives five answers, and she does not know who lit the light, only that she saw "a green star where no star should be".',
  ],
  npcs: [
    {
      id: 'pf_skgorsavel', name: 'King Orsavel Highsurge', title: 'storm giant, King of the Tall Weather', kind: 'monster', art: 'stormGiant', monsterId: 'stormGiant', shared: true,
      wants: 'His daughter back. Failing that, someone to blame.', knows: 'Only what Sennequar has told him: that coast-folk lit the false light that drowned her.',
      voice: 'Speaks slowly, as if every word weighs a ton. When he shouts, thunder answers.', appearance: 'Twenty-five feet tall, beard of white foam, eyes like a grey sea. He holds a tiny silver circlet and never lets it go.',
      backstory: 'Orsavel has ruled the coast\'s weather for four hundred years. His wife died long ago; Ilvanna was all he had. He never loved the tithe of wrecks, but never thought to end it either.',
      gmNotes: 'Storm giant stat block. In the skill challenge, every piece of evidence is an automatic success. If persuaded, he weeps, takes off the crown, and goes himself to break the Storm Engine, or asks the heroes to. If fought, he fights until bloodied, then cries out his daughter\'s name and keeps fighting.',
    },
    {
      id: 'pf_skgilvanna', name: 'Ilvanna Highsurge', title: 'the drowned princess', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'Her father to stop hurting. The coast-folk to be safe.', knows: 'That she steered for a green light on Gull Rock, and heard a voice in her head as she drowned, cold and grey, asking for her memories.',
      voice: 'Young and warm, with the faint sound of the sea behind every word.', appearance: 'A giantess of twelve feet (as she was at heart), pale and glimmering, sea-roses in her hair, a red mark at her throat where the pearl was torn away.',
      gmNotes: 'She rises only when the song-pearl is played on her tomb. She is not hostile. She can speak to her father directly: if she does, the king\'s challenge ends in success at once.',
    },
    {
      id: 'pf_skgsennequar', name: 'Sennequar Duskmantle', title: 'cloud giant, counsellor to the king', kind: 'monster', art: 'cloudGiant', monsterId: 'cloudGiant',
      wants: 'The throne, and the wreck tithe forever.', knows: 'Everything about the wreck; he planned it.',
      voice: 'Soft, kind, reasonable, always calling the king "old friend". He never raises his voice, even when losing.', appearance: 'Silver hair, a gentle face, robes of white mist. His left hand is always gloved: under it, grey slime from Quorlath\'s pact.',
      backstory: 'Sennequar has counselled the king for a century. He is a patient schemer, and believes the coast-folk are no more than fish to be netted.',
      gmNotes: 'Cloud giant stat block. He meets the heroes kindly in the Throne Hall, warns them that the king is "fragile", and tries to keep them away from the garden and the tower. Exposed, he flees to the Storm Engine and tries to burn the king out with it. He surrenders only to the king.',
    },
    {
      id: 'pf_skghildra', name: 'Hildra Coldfathom', title: 'frost giant, the princess\'s sworn shield', kind: 'monster', art: 'frostGiant', monsterId: 'frostGiant', shared: true,
      wants: 'To avenge Ilvanna, and to be forgiven for living when she did not.', knows: 'The ship steered for a light on Gull Rock. The ways into Highsurge Hold, including the Climbers\' Ledge and the Wrack Cave.',
      voice: 'Short sentences. A deep, cracked voice, like ice breaking on a river.', appearance: 'Eighteen feet of blue-white muscle, braids crusted with salt, a broken leg splinted with a ship\'s oar.',
      gmNotes: 'Frost giant stat block. An ally once convinced. In the castle, the frost giant wardens are her old comrades and stand down if she asks.',
    },
    {
      id: 'pf_skgrowenna', name: 'Captain Rowenna Kettlewake', title: 'captain of the Reavers of the Grey Tide', kind: 'npc', art: 'pirate', monsterId: 'gladiator', shared: true,
      wants: 'Loot, and to live long enough to spend it.', knows: 'Who paid for the false light: "the tall one with the soft voice and the glove". Where Quorlath lives. That the Listener has started asking for Reavers\' memories too.',
      voice: 'Loud, cheerful, and always bargaining.', appearance: 'A big woman in a sodden captain\'s coat, grey eye-sign tattooed on her neck, a cutlass in each hand.',
      gmNotes: 'Gladiator stat block. She surrenders at a quarter of her hit points and sells out Sennequar for her life. She will testify to the king if the heroes guarantee she is not stepped on.',
    },
    {
      id: 'pf_skgthessaly', name: 'Thessaly Saltmourne', title: 'sea-witch of the Grey Tide', kind: 'npc', art: 'sea-witch', monsterId: 'mage',
      wants: 'To be the Listener\'s chosen voice forever.', knows: 'The pact between Quorlath and "the cloud lord", and how the song-pearl was taken.',
      voice: 'A whisper that seems to come from behind you.', appearance: 'Thin and pale, with grey slime on her lips and eyes that are three different colours.',
      gmNotes: 'Mage stat block. She serves Quorlath out of love. She breaks if shown that Quorlath plans to drown the Reavers when the coast is gone: then she turns on it.',
    },
    {
      id: 'pf_skgquorlath', name: 'Quorlath', title: 'the Listener under the reef', kind: 'monster', art: 'aboleth', monsterId: 'aboleth',
      wants: 'Memories. Every drowned mind on the coast.', knows: 'Ilvanna\'s every memory, and the secrets of every sailor who drowned on the Teeth in a thousand years.',
      voice: 'A voice inside your head, cold and slow, using the voices of people you have lost.', appearance: 'A grey fish-thing thirty feet long, three red eyes, tentacles slick with slime. Ilvanna\'s pearl hangs from a chain around its body.',
      gmNotes: 'Aboleth stat block. It fights from its pool and dives to escape when bloodied, taking the pearl unless someone grabs it (contested Athletics). If it escapes with the pearl, the heroes must find another way to convince the king.',
    },
    {
      id: 'pf_skgwenneth', name: 'Wenneth Corrie', title: 'keeper of Corrie Light', kind: 'npc', art: 'sailor', monsterId: 'scout', shared: true,
      wants: 'Her good name back, and her light lit again.', knows: 'The Reavers knocked her out on the wreck night. She found a shard of cloud-glass on Gull Rock the next morning.',
      voice: 'Gruff, proud and frightened all at once. Says "aye" a lot.', appearance: 'A wiry woman of sixty in an oilskin, grey hair cropped short, a boat-hook always in her hand. A one-eyed cat follows her.',
      gmNotes: 'Scout stat block if needed. Her log (handout) is evidence. If she comes with the heroes to the castle, her testimony is one automatic success with the king.',
    },
    {
      id: 'pf_skghonora', name: 'Mother Honora Drewe', title: 'priest of the sea-chapel', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'Her town alive, and nobody hanged for something they did not do.', knows: 'The flood\'s pace, the town\'s gossip, and that giants and coast-folk traded peacefully for years before the old tithe.',
      voice: 'Brisk and motherly, with a laugh that comes out at the worst moments.', appearance: 'Broad, red-cheeked, apron over her vestments, sleeves rolled up, a holy symbol of a lighthouse on a cord.',
      gmNotes: 'Priest stat block. She can heal and supply the heroes, and spare the two cows that calm the roc.',
    },
  ],
  handouts: [
    { id: 'keeper-log', title: "Wenneth Corrie's log", text: 'Ninth night of the Harvest Moon. Wind SW, rising. Light lit at dusk, burning well.\n... men in black at the door, near midnight. Struck from behind.\nWoke at dawn. Light out. Glass broken from outside. A giants\' ship on the Teeth. On Gull Rock, where no light ever stood, I found this glass. Not mine. Not anyone\'s I know.' },
    { id: 'fair-spoken-letter', title: 'A letter in Rowenna\'s cabin', text: 'Captain,\nThe lantern is enclosed. Hang it on the rock on the ninth night, when the wind is south-west. The ship will row for it. What the sea gives up is yours, save the girl\'s pearl, which belongs to our friend below.\nAfter, the storm will give you a whole coast to salvage. Do not thank me. Do not write again.\n— The Fair-Spoken' },
    { id: 'dawnkeel-log', title: 'Last page of the Dawnkeel\'s log', text: 'Storm from the south-west, worse than forecast. Her Highness orders us to run for Shearwater harbour; she will not risk the oarsmen on the open sea.\nLight sighted on the point, burning green. Strange. Her Highness says steer for it.\n[The rest is a long, torn line of ink.]' },
    { id: 'ilvanna-note', title: "Note on Ilvanna's chart", text: 'Shearwater harbour. Corrie Light. Gull Rock (bad water).\nWhen I am crowned: light the wreck-lanterns no more. The tithe of wrecks ends. Father will grumble, then agree. Sennequar will not like it at all. Ask him why.' },
    { id: 'pact', title: "Sennequar's pact, in green ink", text: 'To the Listener below the Teeth.\nYou shall have the girl\'s pearl and all she remembers. I shall have the crown. Your little cult shall have the coast.\nWhen the old fool is spent, the storm will end, and I will be regent of the Tall Weather. Then we shall talk of the next coast.\n— S.' },
    { id: 'ilvanna-song', title: "Ilvanna's song (from the pearl)", text: 'Father, the sea is not yours to keep me in.\nLet the rain stop. Let the boats go out.\nI steered for a light, and the light was a lie.\nFind the liar. Then let me go.' },
  ],
  chapters: [
    {
      id: 'coast', title: 'Part 1: The Drowning Coast', level: 14,
      summary: 'A coastal town going under in an endless storm: refugees on the hill, Reavers looting the drowned streets, a keeper everyone blames, a roc on the point, a dragon turtle in the channel, the wreck of a giant\'s ship on the reef, and the thing that lives beneath it.',
      goal: 'Find proof that the wreck was no accident, recover the princess\'s song-pearl, and find a way out to the giant king\'s castle.',
      map: shearwaterCoast,
      npcs: [
        { npc: 'pf_skghonora', x: 10, y: 15 },
        { npc: 'pf_skgwenneth', x: 69, y: 12, hidden: true },
        { npc: 'pf_skghildra', x: 47, y: 32, hidden: true },
        { npc: 'pf_skgrowenna', x: 34, y: 54, hidden: true },
        { npc: 'pf_skgthessaly', x: 67, y: 71, hidden: true },
        { npc: 'pf_skgquorlath', x: 70, y: 73, hidden: true },
      ],
      scenes: [
        { room: 'Refuge Hall', title: 'A town going under', read: 'The coast road ends where the sea begins. Above the drowned streets, a whole town huddles on its hill in the rain, and at the door of the old chapel a woman in an apron waves you in out of the storm.', gm: 'Mother Honora gives the hook, the Flood track and the rumours. She asks the heroes not to hurt Wenneth Corrie, whatever the town says. Start the Flood track at 0.' },
        { room: 'Customs House', title: 'Reavers in the flood', read: 'Through the rain you see green lantern light inside the drowned customs house, and hear the crack of a strongbox lid.', gm: 'The first fight, in waist-deep water. A captured Reaver names Captain Kettlewake, the Grey Tide and "the Listener". If the heroes go quietly through the Net-loft they can take the crew by surprise.', encounter: 'Reavers at the customs house', treasure: 'Townsfolk\'s valuables worth 600 gp (Honora wants them returned; doing so wins the town\'s trust), 2 potions of superior healing.' },
        { room: 'The Seawall Quay', title: 'The sea comes over the wall', read: 'A wave stands up taller than the seawall, and does not fall. It has a face. Behind it, the wind takes a shape too, and howls.', gm: 'The storm itself fights. Use it whenever the heroes cross the open quay. A hero who studies the spirits (DC 18 Arcana) feels a chain of power running from them out to sea, toward the cloud on the horizon: the storm is being made, not just felt.', encounter: 'Storm-wrack at the seawall' },
        { room: 'Lamp cellar', title: 'The keeper nobody believes', read: 'Below the dark lighthouse, behind a stack of oil barrels, an old woman with a boat-hook stands between you and the corner. "If you\'ve come to hang me," she says, "you\'ll have to climb down here first."', gm: 'Wenneth Corrie tells her story and gives the shard of cloud-glass and her log. Saving her name matters: she can come to the castle as a witness.', handout: 'keeper-log' },
        { room: "The Roc's Nest", title: 'The roc on the point', optional: true, gm: 'A starving roc. Fight it, or feed it and calm it (DC 20 Animal Handling) and it carries two heroes to the wreck or even to the sea stack, once.', encounter: 'The roc of Corrie Light', treasure: 'In the nest: a ship\'s strongbox (900 gp) and a giant\'s bronze arm-ring (750 gp).' },
        { room: 'The Reaver Piers', title: 'The black ships', read: 'Two long black ships ride at the piers under a green lantern. A woman in a captain\'s coat stands on the rail, laughing up at the lightning, and her crew are loading the town\'s church bells into the hold.', gm: 'The main Reaver force, with sharks in the harbour. Rowenna surrenders at a quarter of her hit points. Her cabin holds the cloud-glass lantern (the shard fits it) and the Fair-Spoken letter.', encounter: 'The Reaver longships', handout: 'fair-spoken-letter', treasure: '1,200 gp of plunder, the cloud-glass lantern (evidence; 500 gp as art), a +2 scimitar, a cloak of the manta ray.' },
        { room: 'Seal Cave', title: 'The princess\'s shield', read: 'In a cleft above the roaring beck, a giant woman lies across the cave like a fallen wall. Her leg is splinted with an oar. She lifts an axe as long as a boat and says one word in Common: "Wreckers."', gm: 'Hildra Coldfathom. Talk first (DC 19 Persuasion; advantage with the cloud-glass shard, the lantern, or speaking Giant). Heal her and she joins the party, knows the ways into the castle and can carry two heroes through the surf.' },
        { room: 'The Sea Caves', title: 'The Reavers\' hoard', optional: true, gm: 'The sahuagin guard the stolen loot. The waves push people toward the pool each round.', encounter: 'Sahuagin in the sea caves', treasure: '2,500 gp in coin and plate (much of it the town\'s), a trident of fish command, 3 pearls (100 gp each).' },
        { room: 'The Deep Channel', title: 'The island that opens an eye', optional: true, gm: 'Gravelshell, the dragon turtle. Bargain, sneak or fight. As an ally, it holds off the drowned servants in the grotto (remove the water elementals from that fight).', encounter: 'The old one in the channel' },
        { room: 'Dawnkeel, the fore hull', title: 'The wreck of the Dawnkeel', read: 'The ship is so big that standing on its tilted deck is like standing on a hillside. Men in black oilskins are prising gold leaf off the figurehead, while shapes of water heave cargo out of the hold for them.', gm: 'Salvagers. The log and the hull damage prove the ship was rowing toward a light, not driven by the storm. In the aft hull, the princess\'s cabin, her circlet, and the hidden rent in the hull leading down.', encounter: 'Salvagers on the wreck', handout: 'dawnkeel-log', treasure: 'Ilvanna\'s circlet (2,500 gp art object; return it to the king), a necklace of adaptation in her sea-chest.' },
        { room: "The Listener's Grotto", title: 'The Listener', read: 'The tunnel opens into a green-lit dome. In its pool lies a grey thing as long as a ship, with three red eyes, and around it the drowned stand up out of the water. A voice speaks inside your head, using your mother\'s voice: "Come and remember with me."', gm: 'The climax of Part 1. Quorlath, Thessaly, a second sea-witch, two Reaver thralls, four chuul and four drowned water spirits. Quorlath dives when bloodied: grab the pearl first. Thessaly may turn on it.', encounter: "The Listener's grotto", treasure: 'Ilvanna\'s song-pearl (priceless to the king), 4,000 gp in drowned coins and pearls, a ring of free action, a wand of lightning bolts (Thessaly\'s).' },
      ],
      wrapUp: 'With the proof in hand (and, if they are lucky, the song-pearl), the heroes set out across the open sea to the king\'s castle, in a fishing boat, on Hildra\'s shoulders, on the back of the roc, or carried by Gravelshell. The Flood track keeps rising until the storm ends.',
    },
    {
      id: 'hold', title: 'Part 2: Highsurge Hold', level: 14,
      summary: 'The storm giant king\'s castle on a sea stack, half under water: flooded vaults, overflowing cisterns, a grieving court, the princess\'s tomb-garden, the counsellor\'s cloud tower and the Storm Engine that turns grief into weather.',
      goal: 'Show the king the truth and end the storm: comfort him, expose Sennequar, or break the Storm Engine by force.',
      map: highsurgeHold,
      npcs: [
        { npc: 'pf_skghildra', x: 34, y: 73 },
        { npc: 'pf_skgorsavel', x: 39, y: 11 },
        { npc: 'pf_skgilvanna', x: 12, y: 13, hidden: true },
        { npc: 'pf_skgsennequar', x: 64, y: 37, hidden: true },
      ],
      scenes: [
        { room: 'The Sea Gate', title: 'The wardens of the Sea Gate', read: 'The storm closes behind you like a door. In the green dark of the sea-cave, chains clank, water booms, and two frost giants step out onto the docks with their axes raised.', gm: 'Talk, show the circlet, or let Hildra speak: the wardens want the storm ended too. Or fight. Hildra also knows the Wrack Cave and the Climbers\' Ledge as other ways in.', encounter: 'Frost giant wardens' },
        { room: 'The Flooded Undercroft', title: 'Drowned vaults', gm: 'Water spirits and a shark in the dark between the pillars. The princess\'s secret stair (DC 17 Perception) leads straight up to the Tomb-Garden.', encounter: 'Storm-wrack in the undercroft', treasure: 'Floating stores: a cask of giant\'s mead and a crate of storm-silver ingots (1,500 gp, heavy).' },
        { room: 'The Cisterns', title: 'The last of the Grey Tide', optional: true, gm: 'Reavers stealing the king\'s treasure with Sennequar\'s blessing. A captured one confirms the pact. The lift shaft leads to the Storm Engine.', encounter: 'Reavers in the cisterns', treasure: '2,000 gp of the king\'s coin in sacks (return it, or keep it and anger the king), a potion of storm giant strength.' },
        { room: "The Giants' Kitchen", title: 'Whale stew and gossip', optional: true, gm: 'Weeping cooks. Kindness gets the clue about the sleeping draught; violence brings the guard.', encounter: 'Stone giant cooks' },
        { room: 'The Grand Stair', title: 'The weeping in the stone', read: 'The giant stair climbs and climbs. Through the walls, through the floor, through your own bones, comes the sound of a king crying, and the lightning answers him outside.', gm: 'A moment to breathe and plan. Sennequar may come down to meet the party here, all warmth and worry, and try to lead them straight to the throne before they find the garden or the tower.' },
        { room: 'The Tomb-Garden', title: 'The song in the stone', read: 'The rain stops at the garden wall as if it does not dare to come in. A long white tomb lies by a still pool, and two stone guardians turn their heads to watch you come.', gm: 'Bow and pass the guardians, or fight them. Play the song-pearl on the tomb: Ilvanna\'s ghost rises and sings. If the king can be brought here (or Ilvanna is brought to him), the storm ends.', encounter: 'Garden guardians', handout: 'ilvanna-song' },
        { room: "Ilvanna's Chamber", title: 'Paper boats', optional: true, gm: 'The princess\'s room and her chart note: the motive.', handout: 'ilvanna-note', treasure: 'A storm giant\'s child\'s locket (art, 250 gp) and her spell scroll of control weather.' },
        { room: 'The Throne Hall', title: 'The grieving king', read: 'Rain falls through the broken roof onto a king who does not move. When he finally speaks, the whole hall shakes: "Have you come to tell me who killed my daughter? Everyone knows who killed my daughter."', gm: 'The skill challenge (see the area notes). Each piece of evidence is a success: Wenneth\'s log or testimony, the lantern, the Fair-Spoken letter, the Dawnkeel log, Rowenna\'s testimony, the drugged cup, the scrying globe, the pact. If the heroes fail or attack, the king and the storm fight them. If they succeed, he turns on Sennequar, who flees to the engine.', encounter: 'The grieving king' },
        { room: 'The Cloud Bridge', title: 'The bridge in the wind', gm: 'Invisible guardians and a 300-foot drop. Ropes, flight and courage.', encounter: 'Wind on the Cloud Bridge' },
        { room: "The Counsellor's Tower", title: 'The cloud tower', gm: 'Sennequar\'s workroom and the scrying globe that replays the wreck night. The secret door behind the mirror leads to the sanctum and the pact.', encounter: "The counsellor's guard", treasure: 'A crystal ball, 3 cloud-pearls (1,000 gp each).' },
        { room: "Sennequar's Sanctum", title: 'Green ink', optional: true, gm: 'The pact and the wreck-tithe accounts. The best proof of all.', handout: 'pact', treasure: 'A strongbox with 3,000 gp in old coin from wrecked ships.' },
        { room: 'The Storm Engine', title: 'The Storm Engine', read: 'Bronze rings as big as mill wheels turn around a well of white fire. A chain of lightning runs up through the roof into the storm, and from it hangs the king\'s crown. The silver-haired counsellor turns from it, and for the first time he is not smiling.', gm: 'The finale. Sennequar and his servants of air defend the engine. Break the three crystal anchors, or lift the crown off the chain (DC 20 Strength, takes an action, 4d10 lightning), and the storm dies. If the king is with the heroes, he fights beside them and Sennequar surrenders to him at half his hit points.', encounter: 'Sennequar at the storm engine', treasure: 'The engine\'s heart-stone, a storm sapphire (5,000 gp), a staff of thunder and lightning (Sennequar\'s).' },
      ],
      wrapUp: 'The chain of lightning snaps, the clouds tear open, and for the first time in twelve days the sun shines on the sea. If the king was comforted, he weeps in the garden with his daughter\'s song, and sends his giants to rebuild Shearwater\'s seawall stone by stone. If he was fought, the castle mourns two deaths, and the giants will remember the heroes\' names, not kindly.',
    },
  ],
  ending:
    'Best ending: the heroes bring the king the truth and his daughter\'s song. The storm ends. Sennequar is judged by the king and thrown from the Cloud Bridge into the sea he loved to rob. The tithe of wrecks ends forever, as Ilvanna wanted, and Corrie Light is relit with a giant-made lens. The king gives each hero a storm-pearl (once, cast control weather), names them friends of the Tall Weather, and gives the town 10,000 gp in storm-silver to rebuild. Hard ending: the king dies by the heroes\' hands or by the engine. The storm ends when the engine breaks, but the giants of the coast turn cold toward small folk, and Hildra (if she lives) takes the crown and a grudge. Failure: the Flood track reaches 6. Shearwater and the coast are gone, Sennequar rules as regent, and the Reavers are rich. What next: Quorlath, if it lived, remembers everything the princess knew, including the ways into every giant hold on the coast. And somewhere in the princess\'s chart note is a second coast marked "Ask him why".',
};
