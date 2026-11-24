// The Wyvern Roost of Mount Skarn: a one-session mountain climb for four heroes of level 6.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function mountSkarn() {
  const b = new MapBuilder('adv-wyvern-roost', 'Mount Skarn', 80, 80, { open: true, floor: 'cave-floor', theme: 'cave', wallStyle: 'cave', ambient: 'dim' });
  const r = rng(6606);

  // ----- the bones of the mountain: flanks, terraces and the cliffs between them -----
  b.paint(0, 69, 80, 11, 'grass');
  // a ragged cliff band across the whole slope, with gaps where a way goes up
  const cliff = (y0: number, y1: number, gaps: [number, number][]) => {
    let t = 0, u = 0;
    for (let x = 0; x < 80; x++) {
      t = Math.max(-1, Math.min(1, t + (r() < 0.35 ? (r() < 0.5 ? -1 : 1) : 0)));
      u = Math.max(-1, Math.min(1, u + (r() < 0.35 ? (r() < 0.5 ? -1 : 1) : 0)));
      if (gaps.some(([a, c]) => x >= a && x <= c)) continue;
      b.rock(x, y0 + t, 1, y1 - y0 + 1 - t + u);
    }
  };
  cliff(64, 67, [[42, 46], [66, 70]]);
  cliff(46, 49, [[2, 13], [38, 41]]);
  cliff(26, 29, [[2, 9], [41, 46], [62, 72]]);
  let wl = 2, wr = 2;
  for (let y = 0; y < 80; y++) {
    wl = Math.max(1, Math.min(3, wl + (r() < 0.4 ? (r() < 0.5 ? -1 : 1) : 0)));
    wr = Math.max(1, Math.min(3, wr + (r() < 0.4 ? (r() < 0.5 ? -1 : 1) : 0)));
    b.rock(0, y, wl, 1).rock(80 - wr, y, wr, 1);
  }
  b.rock(0, 0, 80, 1);
  b.rock(0, 0, 26, 14); // the north-west shoulder, where the giant lives
  b.rock(74, 0, 6, 50); // the east buttress, with the pilgrims' tunnel inside it
  b.rock(60, 45, 14, 5); // the cliff above the springmouth stays solid
  b.rock(24, 13, 15, 13); // the knuckle of rock with the goblins' scrape in it
  b.rock(26, 13, 16, 2).rock(48, 13, 8, 2); // the monastery shelf's lip
  b.rock(56, 20, 3, 6);
  b.rock(20, 50, 4, 9).rock(59, 50, 3, 9); // rock walls that hem in the switchbacks
  b.rock(0, 13, 9, 7); // the boulder heap with the egg cave in it
  b.rock(16, 66, 11, 3); // the bluff behind the shearing barn

  // ======================= the foot of the mountain: Lowfold =======================
  b.water(67, 50, 3, 30);
  b.water(66, 64, 5, 4, true);
  b.props_('rapids', [[68, 65], [67, 67]]);
  b.water(66, 73, 5, 3).floor(67, 74, 3, 1, 'stone-cobble');

  b.area('Lowfold green', [[14, 74, 22, 6]], { read: 'A village green at the very foot of Mount Skarn, with the peak standing over it like a bad mood. Half the doors in Lowfold are shut and barred in broad daylight. Someone has nailed a fresh poster over all the old ones on the notice board.', gm: 'Where the heroes start. The poster is Lucan Thresk\'s bounty (handout). Villagers will say: the wyverns came three weeks ago, first for sheep, then for old Merrit Tinney and his grandson Ivo. Everyone blames the dead monks for "keeping the beasts" up there.', label: [24, 76] });
  b.prop('well', 24, 75).prop('notice-board', 28, 75).prop('signpost', 32, 74).props_('bench', [[20, 77], [27, 78]]).prop('cart', 16, 77).prop('road-shrine', 34, 78).prop('lamp-post', 22, 74);
  b.light(22, 74, 15, 20);
  b.start(22, 77, 3, 2);
  b.building('The Shorn Ewe', 3, 70, 10, 7, { mat: 'wood-planks-dark', read: 'A low inn that smells of wet wool and mutton stew. By the fire, in the best seat, a thin man in a good coat has his boots up on a straw-packed crate and his hand resting on it, the way you rest a hand on a sleeping dog.', gm: 'Lucan Thresk, the "naturalist", is here. The crate holds the first stolen egg, kept warm by the fire. DC 14 Perception: a soft tapping from inside the crate. DC 16 Insight: he is far more nervous about the crate than about the wyverns. He will not let anyone touch it, and says it holds "specimens of mountain moss". Rooms 5 sp a night.', doors: [[8, 76, 's'], [12, 73, 'e']], windows: [[3, 72, 'w'], [6, 70, 'n'], [10, 70, 'n']] });
  b.prop('fireplace', 4, 71).prop('bar-counter', 10, 72).prop('keg-rack', 11, 71).props_('table-round', [[6, 73], [9, 75]]).props_('stool', [[7, 73], [5, 74], [10, 75]]).prop('crate', 5, 72).prop('tavern-sign', 8, 75).prop('rug-pelt', 6, 72);
  b.light(4, 71, 10, 20);
  b.building('Shearing barn', 17, 69, 9, 5, { gm: 'Empty shearing floor, piled fleeces. The village has moved what is left of its flock in here. A dozen frightened sheep, and a shepherd\'s crook snapped in two (Ivo\'s, brought down by the searchers).', doors: [[21, 73, 's', 'open']] });
  b.props_('hay-bale', [[18, 70], [24, 70]]).prop('sack', 19, 72).prop('workbench', 23, 72).prop('water-trough', 25, 71);
  b.area('Lowfold sheepfold', [[36, 69, 22, 10]], { read: 'Dry-stone pens run up the hillside. The gates hang open. In one pen the grass is torn up in long furrows, and the stones are spattered dark.', gm: 'The raid sites. DC 13 Survival or Nature: the sheep in the torn pen were taken from above (claw furrows, no tracks out). But in the far pen, DC 15 Investigation: the gate rope was cut with a knife, and boot prints lead uphill. Not every missing sheep was taken by a wyvern.', label: [46, 73] });
  b.props_('wall-stone-low', [[37, 70], [38, 70], [39, 70], [44, 70], [45, 70], [50, 70], [51, 70], [52, 70], [37, 76], [38, 76], [44, 76], [45, 76], [46, 76], [52, 76], [53, 76]]);
  b.props_('fence-gate', [[41, 70], [48, 76]]).props_('blood-pool', [[40, 73]]).props_('bones', [[42, 74]]).prop('rope-coil', 54, 73).prop('haystack', 56, 71).prop('scarecrow', 35, 70).prop('water-trough', 49, 73);
  b.area('Ewe Ford', [[62, 70, 12, 9]], { read: 'The mountain\'s river comes down in a white cascade and spreads out into a wide, cold ford, the stones worn flat by a thousand years of sheep.', gm: 'An easy crossing (the stepping stones are a causeway). The cascade above can be climbed, DC 15 Athletics, a short cut to the river bank under the switchbacks.', label: [70, 75] });
  b.props_('reeds', [[66, 71], [70, 77]]).props_('boulder', [[64, 70], [72, 72]]).prop('milestone', 65, 76).prop('beehive', 74, 77).prop('haystack', 75, 71);

  // ======================= the switchback terrace =======================
  b.paint(42, 63, 5, 6, 'dirt').paint(24, 59, 35, 5, 'dirt');
  b.paint(24, 54, 35, 5, 'dirt').paint(24, 50, 35, 4, 'dirt');
  b.wallRun(29, 59, 30, 'n', 'low').wallRun(24, 54, 29, 'n', 'low');
  b.props_('stairs-up', [[44, 66], [26, 58], [56, 53], [39, 49]], 0);
  b.area('The Switchbacks', [[24, 50, 35, 14]], { read: 'The old monks\' road zig-zags up the face of the mountain between walls of piled stone, three long lanes stacked one above the other. Every turn has a little shrine, and every shrine has been knocked over.', gm: 'The main way up. The retaining walls are 6 feet high: climbing from lane to lane is DC 12 Athletics (and cuts a lot of walking). The poachers keep a picket on the top lane to watch for anyone coming up. They knocked the shrines over for fun.', label: [40, 56] });
  b.props_('road-shrine', [[25, 62], [57, 56], [25, 51]]).props_('rubble-pile', [[33, 61], [50, 55]]).props_('boulder', [[30, 52], [47, 51]]).prop('tree-pine', 54, 61).prop('cairn', 36, 57).prop('trap-tripwire', 33, 56, 0, { gm: true }).prop('campfire-cold', 45, 51).prop('bedroll', 47, 52).prop('lean-to', 51, 51);
  b.encounter('Poacher pickets', [24, 50, 35, 14], [['scout', 4], ['bandit', 6], ['veteran', 1]], 'low');
  b.note(33, 56, 'Tripwire with tin bells: DC 14 Perception to spot. If it rings, the picket on the top lane is ready.');

  b.building("Goatherds' hut", 5, 56, 8, 6, { mat: 'wood-planks', read: 'A squat stone hut with a turf roof, smoke curling from the chimney. Goats watch you from the roof with yellow, unimpressed eyes. A woman with a sling stands in the doorway.', gm: 'Gwenna Bracken lives here. She will feed the heroes (a short rest in safety) and tell them what she has seen: the wyverns took goats, and Ivo, but she has also seen lantern lights on the avalanche slope at night, and men carrying a crate between two poles "like a coffin". In her cellar is the stretcher she used to bring down old Merrit\'s body.', doors: [[12, 58, 'e'], [8, 61, 's']], windows: [[5, 57, 'w'], [9, 56, 'n']] });
  b.prop('fireplace', 6, 57).prop('table-trestle', 8, 58).props_('stool', [[7, 59], [9, 59]]).prop('bed', 11, 57).prop('milk-churn', 6, 60).prop('herbs-drying', 10, 60).prop('trapdoor', 11, 60);
  b.light(6, 57, 10, 15);
  b.area("Goat paddock", [[3, 50, 17, 6]], { read: 'A rough paddock of rocks and thorn bushes, where goats climb on everything that can be climbed.', gm: 'Gwenna\'s twelve goats. At the top, the paddock gives straight onto the avalanche slope: the long way round the Gash.', label: [11, 52] });
  b.props_('fence-wood', [[3, 55], [4, 55], [14, 55], [15, 55], [16, 55]]).props_('thorn-bush', [[5, 51], [17, 52]]).prop('hay-bale', 13, 53).prop('water-trough', 9, 54).prop('chicken-coop', 17, 58);
  b.area("Merrit's cairn", [[62, 51, 5, 12]], { read: 'On a ledge above the river stands a new cairn, the stones still pale where they were turned over. A shepherd\'s horn hangs from a stick on top.', gm: 'Old Merrit Tinney lies under it. Gwenna found him at the foot of the Gash and buried him. If the heroes look (DC 12 Medicine, and some respect): he was stabbed in the back, not stung or clawed. The poachers killed him because he saw them, and pushed him into the Gash to blame the wyverns.', label: [64, 55] });
  b.prop('cairn', 64, 55).props_('flowers', [[63, 57], [65, 53]]).prop('stump', 63, 61);
  b.floor(67, 57, 3, 1, 'wood-planks').prop('bridge-plank', 68, 57, 90);
  b.pool(68, 50.5, 3, 1.5, true);
  b.area('Springmouth', [[65, 50, 12, 6]], { read: 'The whole river bursts out of a crack at the foot of the cliff, cold enough to hurt your teeth. Beside it, half hidden by a fall of stones, a carved face stares out of the rock.', gm: 'The river that drops into the Gash comes out again here. The carved face is a monk\'s mark over the Pilgrims\' Door (a secret door, DC 16 Perception to find the seam; pushing the face\'s nose opens it). It leads up the monks\' tunnel all the way to the bell tower.', label: [72, 52] });
  b.props_('rubble-pile', [[73, 51], [71, 50]]).prop('statue', 74, 51).prop('ferns', 76, 53).prop('mushrooms', 75, 54);
  b.floor(70, 50, 7, 1);
  b.door(72, 50, 'n', 'secret');

  // ======================= the Gash and its two lips =======================
  b.paint(14, 30, 60, 16, 'cave-floor');
  for (let x = 14; x <= 73; x++) {
    const top = 37 - (r() < 0.3 ? 1 : 0), bot = 40 + (r() < 0.3 ? 1 : 0);
    b.pit(x, top, 1, bot - top + 1);
  }
  b.floor(35, 36, 2, 6, 'wood-planks');
  b.area("Skarn's Gash", [[14, 37, 60, 4]], { read: 'The mountain is split in two by a crack so deep that the bottom is only a sound: the river, a long way down. Wind howls up out of it, carrying spray and the smell of something dead.', gm: 'A fall is 200 feet into the river: 20d6 is too much for a one-shot, so a falling hero who fails a DC 15 Dexterity save catches a ledge 30 feet down instead (3d6 bludgeoning, DC 15 Athletics to climb back up).', label: [26, 38] });
  b.area('The rope bridge', [[35, 36, 2, 6]], { read: 'A bridge of planks and rope spans the Gash, sagging in the middle like a hammock. It hums in the wind. Several planks are missing, and those that are left are stained white with droppings.', gm: 'Crossing is safe at a walk. Running, fighting or being hit while on it: DC 13 Dexterity save or fall prone (and a creature prone at the edge slides off unless it makes a DC 13 Strength save). Its ropes have 15 hit points each; cutting both drops the bridge.', label: [35, 38] });
  b.prop('bridge-rope', 35, 38, 90).prop('bridge-rope', 36, 39, 90).props_('mooring-post', [[34, 42], [37, 42], [34, 35], [37, 35]]);
  b.area('South lip', [[14, 41, 46, 4]], { read: 'A wide, windy shelf at the edge of the Gash. Old pilgrim cairns stand along the brink, and a cold breath of air comes up out of the dark.', gm: 'Where the switchbacks come out. From here the rope bridge is the quick way across; the avalanche slope at the west end is the long way.', label: [24, 43] });
  b.props_('chasm-edge', [[20, 42], [45, 42], [55, 42]]).props_('cairn', [[29, 43], [41, 44]]).props_('boulder-large', [[17, 44], [51, 44]]).prop('crumbling-ledge', 40, 41).prop('tree-dead', 58, 43).prop('signpost', 38, 44);
  b.area('Kill ledge', [[40, 30, 22, 6]], { read: 'A flat shelf on the far side of the Gash, scattered with bones picked white: sheep skulls, goat horns, a cow\'s ribcage. Long gouges score the rock where something big lands, again and again.', gm: 'Where the wyverns eat. DC 13 Survival or Nature: all the bones are animals, not one human. A torn shepherd\'s smock is snagged on a horn (Ivo\'s), but there is no blood on it. DC 14 Investigation finds a broken arrow with poachers\' fletching (black goose feathers, same as at the camp).', label: [50, 32] });
  b.props_('bone-heap', [[44, 31], [52, 33]]).props_('skull-bleached', [[47, 34], [56, 31]]).prop('giant-ribcage', 49, 31).props_('bones', [[42, 34], [58, 33]]).prop('sack', 55, 34);
  b.area('North lip', [[14, 30, 25, 6]], { read: 'The far side of the Gash. The wind is worse here, and it carries a sound like a far-off bell, though no bell has rung on Mount Skarn for forty years.', gm: 'The "bell" is the wind in the old tower\'s great bell. From here the Stair of Penitents climbs north to the monastery, and a goat track runs west to the top of the avalanche slope.', label: [26, 32] });
  b.props_('boulder', [[18, 31], [33, 33]]).prop('tree-dead', 22, 34).prop('cairn', 30, 31).prop('snowdrift', 15, 33).prop('milestone', 39, 31);
  b.encounter('Wyvern over the Gash', [28, 30, 16, 16], [['wyvern', 1]], 'low');

  // the long way round: the avalanche slope
  b.rubble(3, 33, 4, 6).rubble(8, 40, 5, 4).rubble(4, 45, 4, 3).rubble(9, 31, 4, 3);
  b.area('Avalanche slope', [[2, 30, 12, 20]], { read: 'A steep river of broken rock and old snow pours down the mountain here. Boulders the size of carts sit where they stopped rolling, and some of them look as if they have not quite decided to stay.', gm: 'The long way round the Gash, an hour\'s climb. Loose rock is difficult ground. A loud noise (a thunderwave, a shout, a fight) starts a slide: everyone on the slope makes a DC 14 Dexterity save or takes 16 (3d10) bludgeoning damage and is knocked prone and pushed 20 feet downhill. Lantern stubs and pole marks show the poachers carry their crates this way.', label: [7, 39] });
  b.props_('boulder-large', [[5, 32], [11, 36], [4, 42]]).props_('boulder', [[9, 46], [12, 44], [3, 38]]).props_('snowdrift', [[8, 33], [10, 48]]).prop('trap-rolling-boulder', 7, 36, 0, { gm: true }).prop('lantern-standing', 6, 44).prop('skeleton-lying', 12, 41);

  // ======================= the high terrace =======================
  // the poachers' camp, and the egg cave in the boulder heap
  b.paint(9, 14, 13, 12, 'dirt');
  b.area("Poachers' camp", [[9, 14, 13, 12]], { read: 'Tucked behind a heap of boulders where it cannot be seen from the sky: tents, a cookfire under a canvas awning, pens of stolen sheep, and racks of drying goat-hides. A woman with a crossbow across her knees is playing dice with a man twice her size.', gm: 'Dagny Sloe\'s crew. They know the wyverns are hunting them, so they keep under cover and never light a fire in the open. They have a dozen stolen Lowfold sheep for food and for bait. Dagny will talk, and will offer the heroes a cut (200 gp each) to look the other way until the rider comes tonight. Her tent holds Lucan\'s letter (handout).', label: [15, 19] });
  b.props_('tent', [[11, 15], [18, 15]]).prop('tent-command', 19, 22).prop('campfire-spit', 14, 19).prop('lean-to', 15, 17).props_('cage', [[10, 23], [12, 24]]).props_('crate-stack', [[20, 18]]).prop('weapon-rack', 17, 21).props_('bedroll', [[13, 22], [16, 23]]).prop('rug-pelt', 12, 20).prop('archery-target', 9, 21).prop('table-cards', 15, 21).prop('barrel-group', 21, 24).prop('trap-bear', 12, 24, 0, { gm: true });
  b.light(14, 19, 15, 20);
  b.encounter("Poachers' camp", [9, 14, 13, 12], [['bandit-captain', 1], ['veteran', 2], ['berserker', 2], ['scout', 4], ['bandit', 8]], 'moderate');
  b.cave('The egg cave', 5.5, 16.5, 2.4, 1.8, { seed: 61, read: 'A dry hollow in the boulder heap, warm as a kitchen. Two braziers glow either side of a crate packed with straw, and in the straw lie two eggs the size of a child\'s head, mottled red and green.', gm: 'Two stolen wyvern eggs, alive and warm. Carrying one safely needs a padded pack or two hands (DC 12 Dexterity save if the carrier is hit hard, or it cracks). They are worth 1,000 gp each to Lucan, and everything to Redcrest.' });
  b.tunnel([[6, 17], [10, 18]], 1, { seed: 62 });
  b.props_('brazier', [[4, 16], [6, 17]]).prop('crate', 5, 16).prop('straw-bed', 4, 17).prop('gm-treasure', 6, 16, 0, { gm: true });
  b.light(5, 16, 10, 10, '#ff9a3c');

  // the stone giant's garden, up on the shoulder, with a goat track to the chapel
  b.cave("Hulda's stone garden", 12, 6.5, 8.5, 4.5, { seed: 63, mat: 'stone-cobble', read: 'A high hollow ringed with statues: rough stone wyverns, goats, eagles and men, some no bigger than a cat and some as tall as a house. In the middle, a grey giantess sits cross-legged with a chisel, tapping at a wyvern\'s wing.', gm: 'Hulda Stonesong carves the creatures of her mountain. She thinks of the wyverns as "her" wyverns and has been hunting the egg thieves herself, so far without luck. She will take anyone carrying an egg, or anything that smells of the camp, for a thief and throw rocks first. Showing her the eggs are going home (DC 13 Persuasion, or simply putting one in her hands) turns her into a friend who will carry the heroes up the shoulder to the monastery and who wants to watch the eggs go back.' });
  b.tunnel([[12, 10], [12, 13], [13, 15]], 3, { seed: 64 });
  b.tunnel([[19, 6], [23, 5], [26, 6]], 2, { seed: 65, mat: 'dirt' });
  b.props_('statue', [[7, 4], [16, 3], [8, 9], [18, 9]]).props_('statue-tall-winged', [[10, 3], [14, 9]]).prop('statue-dragon', 12, 6).props_('rubble-pile', [[8, 7], [17, 6]]).prop('anvil', 10, 7).prop('tool-wall', 15, 4).prop('bedroll', 19, 8).props_('pickaxes', [[9, 8]]);
  b.encounter("Hulda's stone garden", [4, 2, 17, 10], [['stone-giant', 1]], 'low');
  b.area('Goat track', [[19, 4, 7, 4]], { gm: 'A ledge path from the stone garden to the chapel\'s west door. Narrow but safe, unless someone is throwing boulders down it.', label: [22, 5] });

  // the goblins in the knuckle of rock
  b.cave("Snikkit's scrape", 31, 19, 5.5, 4, { seed: 66, read: 'A smoky cave that stinks of old fat. Goblins squat around a fire roasting something on a spear, and wolves the size of ponies lift their heads to look at you. The walls are hung with wyvern scales, every one of them polished.', gm: 'Snikkit and his band scavenge what the wyverns leave. They hate the poachers (who shot two of them) and fear the wyverns. Snikkit sells what he knows: the egg cave, the rider due tonight, and the monks\' secret way up from the Springmouth (handout). Price: 20 gp, or something shiny, or a promise to kill "the crossbow woman". Fighting them in here is a scrum: the smoke lightly obscures everything past 15 feet.' });
  b.tunnel([[22, 22], [27, 21]], 2, { seed: 67 });
  b.tunnel([[36, 20], [40, 22]], 2, { seed: 68 });
  b.props_('campfire-spit', [[31, 19]]).props_('bone-heap', [[28, 17], [32, 22]]).props_('rug-pelt', [[29, 21], [33, 17]]).prop('treasure-pile', 35, 18).prop('cauldron-tripod', 30, 18).prop('loot-sacks', 27, 20);
  b.light(31, 19, 10, 15, '#ff9a3c');
  b.encounter("Snikkit's scrape", [25, 15, 12, 9], [['goblin-boss', 1], ['goblin-warrior', 12], ['worg', 4]], 'low');

  // the Stair of Penitents and the pilgrims' terrace
  b.paint(42, 14, 4, 16, 'stone-flagstone');
  b.props_('stairs-up', [[43, 28], [44, 22], [43, 16]]);
  b.area('Stair of Penitents', [[42, 14, 4, 16]], { read: 'Steps cut into the living rock climb straight up the mountain, worn into dips by pilgrims\' knees. Every hundredth step has a name carved on it.', gm: 'The front way to the monastery. In full view of the bell tower: anyone climbing it by day is spotted by the wyverns (DC 15 Stealth to go unseen, or go at dusk).', label: [43, 24] });
  b.area("Pilgrims' terrace", [[39, 15, 17, 11]], { read: 'A broad step in the mountain where pilgrims once rested. Prayer flags, bleached to grey, still flap from poles over a ring of standing stones.', gm: 'A safe-ish place to rest out of the wind. Brother Anselm leaves bread on the flat stone here for the goblins, so they will leave his goats alone.', label: [50, 20] });
  b.props_('standing-stone', [[48, 18], [52, 18], [48, 22], [52, 22]]).props_('banner-pole', [[40, 16], [54, 16], [40, 24]]).prop('altar', 50, 20).prop('offering-bowl', 51, 20).prop('bench-long', 54, 23).prop('snowdrift', 47, 24);

  // the tarn and the icefall
  b.pool(66, 16.5, 6.5, 2.6, true);
  b.ice(61, 19, 12, 15);
  b.water(65, 19, 3, 2).water(65, 33, 3, 4, true);
  b.props_('ice-block', [[63, 24], [70, 22], [62, 30]]).props_('frozen-pond', [[68, 27]]).props_('stalactites-tall', [[64, 27], [70, 31]]).prop('ice-thin', 66, 24, 0, { gm: true }).prop('snowdrift', 60, 21);
  b.area('The Icefall', [[59, 19, 15, 16]], { read: 'The river from the summit tarn has frozen as it fell: a staircase of blue ice, hung with icicles as long as spears. Water still runs somewhere underneath, loud and hollow, before it pours out at the bottom into the Gash.', gm: 'A slippery climb (difficult ground; DC 12 Acrobatics or fall prone and slide 10 feet). The thin patch in the middle (DC 14 Perception) drops a creature into the water under the ice: DC 14 Strength (Athletics) to break back out, or start drowning. The wyverns\' favourite drinking place.', label: [66, 26] });
  b.encounter('Hunting pair at the Icefall', [59, 19, 15, 16], [['wyvern', 2]], 'moderate');
  b.area('Summit tarn', [[58, 13, 16, 6]], { read: 'A black, still lake right under the monastery walls, rimmed with ice. On the far shore a kitchen door stands open.', gm: 'The back way into the monastery is simply walking around the tarn to the kitchen. The water is snowmelt: a swimmer takes 1 level of exhaustion per minute (DC 12 Constitution save negates).', label: [66, 14] });
  b.props_('reeds', [[59, 15], [72, 17]]).prop('rowboat', 60, 17).prop('fishing-gear', 61, 18);

  // ======================= Hollowbell, the monastery on the summit =======================
  b.paint(26, 1, 48, 12, 'stone-cobble');
  b.building('Chapel of the Bell', 27, 1, 9, 10, { mat: 'stone-flagstone', read: 'A tall chapel open to the sky where the roof has fallen in. Snow lies on the pews. At the altar, a figure in a monk\'s habit kneels with its back to you, and the candles in front of it are burning with a cold blue light.', gm: 'Abbot Haldane\'s ghost keeps his vigil here, with two specters of monks who died with him. He is not hostile at first: he asks each newcomer "Have you come to ring the bell?" If the heroes answer yes, or treat the chapel with respect, he tells them the bell drives the wyverns off. If they rob the reliquary or lie, the dead attack. The ledger on the lectern holds Brother Anselm\'s egg tally (handout).', doors: [[35, 5, 'e'], [27, 6, 'w']], windows: [[30, 1, 'n'], [33, 1, 'n']] });
  b.props_('pew', [[29, 4], [33, 4], [29, 6], [33, 6], [29, 8]]).prop('altar-reredos', 31, 2).props_('candle-stand-tall', [[29, 2], [34, 2]]).prop('lectern', 33, 8).prop('reliquary', 28, 2).prop('font', 31, 9).prop('snowdrift', 34, 9).prop('prayer-kneeler', 31, 3);
  b.light(31, 2, 10, 20, '#a8c8ff');
  b.encounter("The abbot's vigil", [27, 1, 9, 10], [['ghost', 1], ['specter', 2]], 'low');
  b.building('Cloister', 37, 1, 16, 10, { mat: 'stone-flagstone', read: 'A square walk of broken arches around an overgrown garden. A fruit tree has gone wild in the middle, and every branch is hung with tiny bells that tinkle when the wind blows.', gm: 'The heart of Hollowbell. The little bells were Brother Anselm\'s idea: they warn him when a wyvern lands. Wherever the heroes are in the monastery, a wyvern landing in the cloister is heard.', doors: [[37, 5, 'w', 'open'], [52, 5, 'e', 'open'], [44, 10, 's'], [45, 10, 's']] });
  b.paint(40, 4, 10, 4, 'grass');
  b.props_('pillar-broken', [[39, 3], [50, 3], [39, 8], [50, 8]]).props_('column-fluted', [[44, 3], [44, 8]]).prop('tree-birch', 45, 5).prop('fountain', 42, 6).props_('bench', [[48, 6], [41, 4]]).prop('column-fallen', 47, 8).prop('flowers', 47, 4);
  b.building('Gatehouse', 42, 11, 6, 3, { mat: 'stone-flagstone', gm: 'The monastery\'s front door. Its gate is long gone. A monk\'s skeleton sits against the wall, still holding the rope of an alarm bell that has no clapper.', doors: [[44, 13, 's', 'open'], [45, 13, 's', 'open']] });
  b.prop('skeleton-seated', 43, 12).prop('wall-chains', 47, 12);
  b.building("Monks' cells", 55, 1, 8, 6, { mat: 'wood-planks-dark', gm: 'Six narrow cells off a passage. Five are full of snow and old straw. The sixth is warm, swept and lived in: Brother Anselm\'s.', doors: [[55, 3, 'w'], [62, 4, 'e']] });
  b.wallRun(55, 2, 8, 's').wallRun(55, 5, 8, 'n');
  for (const y of [1, 2, 5, 6]) b.wall(57, y, 'e').wall(59, y, 'e');
  b.door(56, 2, 's', 'open').door(58, 2, 's', 'open').door(61, 2, 's').door(56, 5, 'n', 'open').door(58, 5, 'n', 'open').door(61, 5, 'n', 'open');
  b.props_('cot', [[56, 1], [58, 1], [56, 6], [58, 6]]).prop('straw-bed', 61, 6).prop('bed', 61, 1).prop('writing-desk', 62, 1).prop('candles', 62, 2).prop('herbs-drying', 60, 3).prop('bookshelf-low', 60, 6);
  b.light(62, 2, 5, 10);
  b.area("Anselm's cell", [[60, 1, 3, 2]], { read: 'A cell no bigger than a cupboard, swept clean. On the desk, a slate covered in tally marks and little drawings of eggs.', gm: 'Brother Anselm sleeps here. His slate counts the eggs in the tower, day by day: five, five, four, three, two.', label: [61, 1] });
  b.building('Kitchen', 55, 8, 8, 5, { mat: 'stone-flagstone-warm', read: 'A vaulted kitchen with a hearth you could stand up in. A pot of goat stew is bubbling on a low fire, and a nanny goat is eating a cabbage on the table.', gm: 'Brother Anselm keeps the fire lit and cooks for anyone who climbs this far. Herbs, cheese and three potions of healing he brewed himself are on the shelf (he gives them to anyone helping the wyverns).', doors: [[55, 10, 'w'], [58, 12, 's'], [62, 9, 'e']] });
  b.prop('hearth-grand', 56, 8).prop('cauldron', 57, 9).prop('kitchen-table', 59, 10).prop('pot-rack', 61, 8).prop('shelf-jars', 61, 11).prop('flour-sacks', 56, 11).prop('water-barrel', 60, 12).prop('firewood', 57, 12);
  b.light(56, 9, 10, 20, '#ff9a3c');
  b.area('Well yard', [[53, 1, 2, 12]], { gm: 'A narrow yard between the cloister and the cells, with the monastery well. The well is dry; a bucket on a rope hangs at the bottom.', label: [53, 7] });
  b.prop('well', 53, 7).prop('water-trough', 54, 11).prop('firewood', 53, 2);
  b.area('Tower walk', [[63, 1, 1, 12]], { gm: 'The covered walk to the bell tower. Its roof is gone and the flagstones are scored by claws.', label: [63, 7] });
  b.prop('statue-tall-robed', 63, 11);

  // the bell tower: the wyverns' roost
  b.building('The bell tower roost', 64, 1, 10, 9, { mat: 'stone-flagstone', read: 'The tower has no roof any more, only sky. A ramp of stairs spirals up its inside wall to a gallery, and from a beam across the top hangs a bronze bell as big as a cottage. The floor is a nest: heaped sheep\'s wool, branches and bones. In it, two red-and-green eggs. Above them, on the beam beside the bell, something enormous unfolds its wings.', gm: 'Redcrest the brood-mother and her mate guard the last two eggs. Ivo Tinney is alive, wedged up inside the great bell where the wyverns cannot reach him. The bell can be rung from the gallery (an action, DC 12 Strength): every wyvern within 300 feet makes a DC 14 Wisdom save or is frightened for 1 minute (save again at the end of each turn). Anyone inside the bell is deafened for an hour and takes 3 (1d6) thunder damage. At moonrise, Sefton Rake comes down on his griffon to steal the eggs, while the egg-haulers climb up from the undercroft.', doors: [[64, 5, 'w']] });
  b.prop('temple-bell', 69, 4).props_('stair-spiral', [[72, 2]]).prop('gallery-balcony', 66, 2).props_('hay-bale', [[67, 6], [70, 7]]).props_('bone-heap', [[65, 8], [72, 7]]).prop('treasure-pile', 72, 5).props_('crystal-cluster', [[68, 6]]).prop('gm-treasure', 69, 6, 0, { gm: true }).prop('skeleton-lying', 66, 4);
  b.light(69, 4, 15, 25, '#ffd9a0');
  b.encounter('Three-way at the roost', [64, 1, 10, 9], [['wyvern', 2], ['veteran', 1], ['griffon', 1]], 'high');

  // the monks' tunnel: from the Springmouth to the tower, with a wayshrine off the Icefall
  b.room('Undercroft', 75, 2, 4, 7, { mat: 'dungeon-slab', read: 'A cellar under the tower, cut out of the rock. Coils of bell rope, a dozen lanterns, crates and the smell of men who have not washed in a month.', gm: 'The bottom of the bell-ringers\' stair. Tonight the poachers\' egg-haulers wait here for the signal (the griffon\'s scream). The secret door to the tower (DC 15 Perception from the tower side) is how they mean to reach the nest.' });
  b.door(74, 5, 'w', 'secret');
  b.floor(74, 5, 1, 1, 'dungeon-slab');
  b.props_('rope-coil', [[75, 3], [78, 3]]).props_('lantern-cluster', [[77, 7]]).prop('crate-stack', 78, 6).prop('stairs-down', 76, 8).prop('backpack', 75, 6).prop('supplies', 77, 4);
  b.light(77, 7, 10, 15);
  b.encounter('Egg-haulers in the undercroft', [74, 2, 5, 7], [['berserker', 2], ['scout', 2], ['bandit', 6]], 'low');
  b.tunnel([[76, 9], [77, 17], [76, 27], [76, 36], [76, 44], [75, 48], [72, 48]], 1, { seed: 69, mat: 'dungeon-slab' });
  b.floor(72, 49, 1, 1, 'dungeon-slab');
  b.area("Monks' tunnel", [[75, 9, 3, 40]], { read: 'A tunnel no wider than a man, cut in long flights of steps. Every landing has a niche with a stub of candle and a scratched prayer: "One more step, and then one more."', gm: 'The hidden back way, from the Pilgrims\' Door at the Springmouth to the undercroft below the bell tower. About an hour\'s climb in the dark. It skips the Gash entirely. The poachers found it two weeks ago.', label: [76, 40] });
  b.props_('stairs-up', [[76, 44], [76, 34], [77, 18], [76, 11]]).props_('candles', [[76, 38], [76, 22]]);
  b.cave('Wayshrine', 77, 28, 1.6, 2.2, { seed: 70, mat: 'ice', read: 'A little chapel carved inside the ice-cold rock. Frozen offerings sit on a ledge: a wooden goat, a child\'s shoe, a ring.', gm: 'A pilgrims\' rest on the way up. A secret door (DC 15 Perception) opens straight out onto the Icefall. The offerings are worth 30 gp; taking them angers no one but the GM\'s conscience.' });
  b.floor(73, 28, 3, 1, 'ice').door(73, 28, 'w', 'secret');
  b.prop('shrine', 77, 27).prop('offering-bowl', 77, 29);
  return b.build();
}

export const WYVERN_ROOST: Adventure = {
  id: 'wyvern-roost',
  title: 'The Wyvern Roost of Mount Skarn',
  tagline: 'Wyverns are taking the shepherds of Lowfold, and the only way to stop them is up the mountain.',
  levels: '6',
  sessions: '1 session (4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'mountain', 'wyverns', 'mystery', 'climb'],
  pitch:
    'High on Mount Skarn stands Hollowbell, a monastery that has been empty for forty years. For most of that time the wyverns that nest in its bell tower kept to themselves. Three weeks ago they came down the mountain. First they took sheep. Then goats. Then an old shepherd and his grandson. Now the village of Lowfold keeps its doors barred in daylight, and somebody has to climb.',
  secret:
    'Dagny Sloe and her poachers have been stealing wyvern eggs from the bell tower to sell to Lucan Thresk, a collector who sells rare beasts to rich fools in the city. Redcrest, the brood-mother, laid five eggs this spring. Three are gone: one already down in Lowfold in Lucan\'s warm crate, two in the poachers\' egg cave. The wyverns are hunting the thieves by scent, and the thieves smell of Lowfold\'s sheep and Lowfold\'s inn. Old Merrit Tinney was not killed by a wyvern: the poachers stabbed him because he saw them. Why now: tonight, at moonrise, Sefton Rake will ride his griffon down on the tower to draw the wyverns off, while the egg-haulers climb up the monks\' secret tunnel to take the last two eggs. Return the eggs, and the hunting stops.',
  hooks: [
    'Reeve Marjory Rooksby of Lowfold offers 300 gp and the village\'s thanks to anyone who makes the mountain safe again "by whatever means".',
    'Lucan Thresk, a city naturalist staying at the inn, has posted a bounty of 100 gp a head for wyverns (handout). He is very keen that the heroes kill them all.',
    'Gwenna Bracken, a goatherd who lives on the mountain, comes down to beg for help finding Ivo Tinney. She saw him carried off alive, and she thinks he still might be.',
  ],
  tips: [
    'This is a mystery on a mountain. The heroes think they are wyvern hunters; the clues say otherwise. Let them find the truth in any order: Merrit\'s cairn (a knife wound), the kill ledge (no human bones), Snikkit (he talks), the camp (the eggs and the letter), Anselm (the tally) or Lucan (the tapping crate).',
    'Keep a clock. The heroes start in the morning; moonrise is the climax. Each big stop is an hour or so. If they go straight up the Stair, they meet the wyverns before they know the truth. That is fine: a wyvern fight that ends with "wait, why are they so angry?" is a good scene.',
    'Many fights can be avoided. The picket can be sneaked past, the goblins bought, Hulda talked round, the abbot answered politely, the wyverns calmed by an egg held up in plain view (DC 15 Animal Handling, advantage if Anselm whistles).',
    'Three routes up: the switchbacks and the rope bridge (quick, watched), the avalanche slope (slow and dangerous), and the monks\' secret tunnel from the Springmouth to the tower (hidden; Snikkit sells the way, Anselm knows it). The tarn and the Icefall make a fourth way into the monastery.',
    'Wyverns fly and sting with poison. Fight them where it hurts: on the rope bridge, on the ice, in the open tower. Give the heroes a reason to use the bell.',
    'For 3 heroes, take the veteran out of the roost fight and two berserkers out of the camp. For 5, add a griffon to the roost and a veteran to the picket.',
  ],
  npcs: [
    {
      id: 'pf_wranselm', name: 'Brother Anselm', title: 'the last monk of Hollowbell', kind: 'npc', art: 'monk', monsterId: 'priest', shared: true,
      wants: 'The eggs back in the nest, and someone to listen to forty years of things he has been saving up to say.',
      knows: 'Redcrest laid five eggs this spring and three have vanished; he counts them every dawn from the gallery. He knows the monks\' tunnel from the Springmouth, and that the bell drives wyverns off.',
      voice: 'Whispery and fast, like a man who has not talked to people in years. Whistles to the wyverns the way you would call a dog.',
      appearance: 'A tiny old man in a patched brown habit, with a white beard tucked into his rope belt and a goat that follows him everywhere.',
      backstory: 'He was the youngest novice when a winter sickness emptied Hollowbell. He stayed, because somebody had to ring the bell.',
      gmNotes: 'Priest stat block, but he will not fight people. With him helping, every check to calm a wyvern has advantage. He has three potions of healing he brewed himself.',
    },
    {
      id: 'pf_wrgwenna', name: 'Gwenna Bracken', title: 'goatherd of the switchbacks', kind: 'npc', art: 'farmer', shared: true,
      wants: 'Ivo found, Merrit\'s killer found, and to be left alone with her goats afterwards.',
      knows: 'She buried Merrit and saw the knife wound. She has seen lantern lights on the avalanche slope at night and men carrying a crate on poles. She saw a wyvern carry Ivo off, kicking.',
      voice: 'Blunt, slow and dry. Never says two words where one will do.',
      appearance: 'A broad, weather-browned woman in a sheepskin coat, with a sling wound round her wrist and a dog-sized goat at her heel.',
      gmNotes: 'She will guide the heroes as far as the Gash, and no further: "Goats stop at the Gash. So do I."',
    },
    {
      id: 'pf_wrivo', name: 'Ivo Tinney', title: 'the missing shepherd boy', kind: 'npc', art: 'commoner',
      wants: 'Water, his mother, and never to see a wyvern again.',
      knows: 'The wyvern dropped him in the nest for its chicks, but the chicks are still eggs, so it left him there. He crawled up inside the great bell and has been there two days. He saw men with ropes at the tower last week.',
      voice: 'Hoarse and shaky, then very loud once he knows he is saved.',
      appearance: 'A skinny fifteen-year-old with a broken arm, a torn smock and bird-droppings in his hair.',
      gmNotes: 'He has 2 hit points and a broken arm. If anyone rings the bell, he is deafened and very cross about it.',
    },
    {
      id: 'pf_wrlucan', name: 'Lucan Thresk', title: '"naturalist", staying at the Shorn Ewe', kind: 'npc', art: 'sage', monsterId: 'spy', shared: true,
      wants: 'The wyverns dead (so nobody else claims the eggs) and the rest of his order delivered.',
      knows: 'Everything. He hired Dagny, he pays Sefton, and the warm crate at his feet holds the first egg.',
      voice: 'Smooth and friendly, with a scholar\'s long words. Laughs a little too quickly.',
      appearance: 'A thin man in a fine grey coat, with ink on his fingers and a notebook full of beautiful drawings of animals.',
      gmNotes: 'If confronted with proof (the letter, the crate), he offers 500 gp to keep quiet, then tries to slip away to the city on the evening cart. He fights only if cornered (spy stat block).',
    },
    {
      id: 'pf_wrdagny', name: 'Dagny Sloe', title: 'captain of the poachers', kind: 'npc', art: 'bandit-captain', monsterId: 'banditCaptain',
      wants: 'To be paid and off this mountain with all her people before the wyverns find them.',
      knows: 'Where the eggs are, the plan for tonight, the monks\' tunnel, and that Lucan pays 1,000 gp an egg. She knows who stabbed Merrit (her man Corby, who is with the egg-haulers).',
      voice: 'Cheerful, quick and reasonable, right up until she isn\'t. Always offers a deal.',
      appearance: 'A small, wiry woman in a coat of patched furs, with a heavy crossbow and a necklace of wyvern teeth.',
      gmNotes: 'If the fight turns against her, she surrenders and offers to trade Corby and Lucan for her own freedom.',
    },
    {
      id: 'pf_wrsefton', name: 'Sefton Rake', title: 'griffon rider for hire', kind: 'npc', art: 'veteran', monsterId: 'veteran',
      wants: 'His fee, and to bring his griffon Whetstone home alive.',
      knows: 'The plan: he draws the wyverns away from the tower at moonrise while the haulers climb. He carried the first egg down to Lucan.',
      voice: 'Laconic. Talks to his griffon far more warmly than to people.',
      appearance: 'A lean rider in quilted leather and goggles, a lance across his saddle and a long scar where a wyvern\'s tail once found him.',
      gmNotes: 'He is a hireling, not a villain. If Whetstone is badly hurt, or the heroes show him that Merrit was murdered, he flies away and will testify against Lucan.',
    },
    {
      id: 'pf_wrhulda', name: 'Hulda Stonesong', title: 'stone giant sculptor of the shoulder', kind: 'monster', art: 'stoneGiant', monsterId: 'stoneGiant', shared: true,
      wants: 'The thieves caught and the mountain quiet so she can finish her statue of Redcrest.',
      knows: 'She has smelled the poachers\' camp but not found it (the boulder heap hides it). She knows every path on the peak.',
      voice: 'Deep, slow and calm. Speaks of the mountain\'s creatures as "my wyverns, my goats, my little men".',
      appearance: 'A giantess with skin like grey granite, chips of stone in her braids, and a chisel as long as a sword.',
      gmNotes: 'She throws first at anyone who smells of the camp or carries an egg. Once convinced, she can carry two heroes at a time up the shoulder, and will flatten the poachers\' camp if shown where it is.',
    },
    {
      id: 'pf_wrsnikkit', name: 'Snikkit', title: 'boss of the scrape goblins', kind: 'monster', art: 'goblin-boss', monsterId: 'goblinBoss',
      wants: 'Shiny things, the crossbow woman dead, and to be called "Lord Snikkit".',
      knows: 'The egg cave, the rider coming tonight, the monks\' secret way up from the Springmouth. He has drawn a map (handout).',
      voice: 'Squeaky and grand. Bargains about everything, even things he is giving away.',
      appearance: 'A goblin in a cloak made of polished wyvern scales, with a cracked monk\'s bell for a helmet.',
      gmNotes: 'He sells information for 20 gp or something shiny. Treat him well and his worg riders harass the poachers\' camp on the heroes\' signal.',
    },
    {
      id: 'pf_wrredcrest', name: 'Redcrest', title: 'brood-mother of the Skarn wyverns', kind: 'monster', art: 'wyvern', monsterId: 'wyvern', shared: true,
      wants: 'Her eggs back. All of them.',
      knows: 'The smell of the thieves: wool, smoke, the inn\'s ale. That is why she has been hunting near Lowfold.',
      voice: 'A hiss like a kettle and a scream like tearing metal. She cannot talk, but she understands a held-up egg.',
      appearance: 'A huge wyvern with a crest of red spines and a torn left wing, older and heavier than the rest.',
      gmNotes: 'If an egg is shown to her and set down gently (DC 15 Animal Handling, advantage with Anselm), she stops attacking. Every egg returned makes her calmer; with all five back, the Skarn wyverns never raid Lowfold again.',
    },
    {
      id: 'pf_wrhaldane', name: 'Abbot Haldane', title: 'ghost of Hollowbell', kind: 'monster', art: 'ghost', monsterId: 'ghost',
      wants: 'The bell rung once more, by living hands, so he can rest.',
      knows: 'The bell\'s peal drives wyverns off. The rule of the house: "Never take what is theirs." He knows where the reliquary key is (on his own skeleton, under the chapel floor).',
      voice: 'Gentle and sad, with long pauses. Asks everyone the same question.',
      appearance: 'A tall, transparent old man in a monk\'s habit, kneeling, with frost forming wherever he looks.',
      gmNotes: 'If the heroes ring the bell, even in the middle of the roost fight, he fades away content and his reliquary opens for them.',
    },
  ],
  handouts: [
    {
      id: 'wr-bounty', title: 'Poster on the Lowfold notice board',
      text: 'BOUNTY. 100 gold crowns paid for each WYVERN HEAD brought to the undersigned at the Shorn Ewe. The beasts must be killed, ALL of them, for the safety of this village. Eggs, if found, are of scientific interest only: bring them to me unbroken and I will dispose of them. — L. Thresk, naturalist',
    },
    {
      id: 'wr-letter', title: "Letter in Dagny's tent",
      text: 'D. — The first specimen arrived warm and healthy; Rake is paid. I will take the two you hold and the two still in the tower, a thousand apiece as agreed. Rake comes at moonrise to draw the mother off: have your men on the bell-ringers\' stair. No more dead shepherds. It makes people look up the mountain. — L.',
    },
    {
      id: 'wr-tally', title: "Brother Anselm's tally, in the chapel ledger",
      text: 'Spring. Redcrest sits on five. Thanks be. — Five. — Five. Rope marks on the gallery. — Four. She screamed all night. — Four. — Three. Men in the tower at dusk; I hid. — Three. She has gone down the mountain to look for them. God keep Lowfold. — Two.',
    },
    {
      id: 'wr-map', title: "Snikkit's map (drawn on goat-hide)",
      text: 'A crude drawing: a river coming out of a rock with a face on it. "PUSH NOSE". A line going up inside the mountain, past a little ice room, to a bell. Next to the bell, a stick figure with a crossbow and a lot of angry scribbles. At the bottom: "LORD SNIKKIT KNOWS ALL. 20 GOLD."',
    },
    {
      id: 'wr-rule', title: 'Carved over the chapel door',
      text: 'THE RULE OF HOLLOWBELL. We share the mountain with the red ones. When they come too near, ring once and pray. Feed the old goats to them in the hungry months. Never take what is theirs.',
    },
  ],
  chapters: [
    {
      id: 'skarn', title: 'The Climb', level: 6,
      summary: 'From the barred village of Lowfold at the foot of Mount Skarn, up the switchbacks, across (or around) the Gash, past the poachers, the goblins and a giant, to the ruined monastery of Hollowbell and the wyverns\' roost in its bell tower.',
      goal: 'Find out why the wyverns are hunting, save Ivo if he lives, and end the raids before moonrise: by killing the wyverns, or by putting their eggs back where they belong.',
      map: mountSkarn,
      npcs: [
        { npc: 'pf_wrlucan', x: 5, y: 73 },
        { npc: 'pf_wrgwenna', x: 9, y: 59 },
        { npc: 'pf_wrdagny', x: 15, y: 21 },
        { npc: 'pf_wrhulda', x: 13, y: 7 },
        { npc: 'pf_wrsnikkit', x: 32, y: 20 },
        { npc: 'pf_wranselm', x: 61, y: 2 },
        { npc: 'pf_wrhaldane', x: 31, y: 4, hidden: true },
        { npc: 'pf_wrredcrest', x: 68, y: 5, hidden: true },
        { npc: 'pf_wrivo', x: 69, y: 3, hidden: true },
        { npc: 'pf_wrsefton', x: 71, y: 8, hidden: true },
      ],
      scenes: [
        {
          room: 'Lowfold green', title: 'A village with its doors barred', handout: 'wr-bounty',
          read: 'Lowfold is quiet in the way a held breath is quiet. Every door is shut, every shutter is barred, and every few minutes someone glances up at the peak. On the notice board, a fresh poster offers good gold for wyvern heads.',
          gm: 'Let the heroes ask around. The reeve gives the facts (sheep, goats, Merrit and Ivo, three weeks). Gwenna comes down for supplies and asks for help. At the Shorn Ewe, Lucan buys the heroes a drink and pushes the bounty hard. Clues: the tapping crate (DC 14 Perception), his nerves (DC 16 Insight). He says the monks "bred the beasts" and the heroes should "clear the nest, eggs and all".',
        },
        {
          room: 'Lowfold sheepfold', title: 'The cut rope', optional: true,
          read: 'The pens smell of blood and wet wool. One gate hangs by a single hinge; another stands open with its rope neatly cut.',
          gm: 'DC 13 Survival: the torn pen was raided from the air. DC 15 Investigation on the far pen: a knife cut and boot prints going uphill. Someone is stealing sheep and letting the wyverns take the blame. (The poachers use them as food and bait.)',
        },
        {
          room: 'The Switchbacks', title: 'The picket on the top lane', encounter: 'Poacher pickets',
          read: 'The road doubles back and back again up the cliff face, between walls of piled stone. On the top lane, half hidden behind a rock, a thin line of smoke rises where someone has tried hard not to make any.',
          gm: 'Four scouts, six bandits and a veteran watch the road. They say they are "wyvern hunters, same as you" (DC 13 Insight: lie; their arrows are fletched with black goose feathers, like the one on the kill ledge). Sneaking past is DC 14 Stealth as a group, or take the walls (DC 12 Athletics) on the far side. If a fight goes badly, the veteran fires a red flare: the camp is warned.',
          treasure: '45 gp, a potion of climbing, and a sack of Lowfold mutton.',
        },
        {
          room: "Goatherds' hut", title: "Gwenna's table, Merrit's cairn", optional: true,
          read: 'The hut is warm and smells of smoke and cheese. Gwenna pours goat\'s milk into bowls without asking whether you want any, then sits down and waits for you to talk.',
          gm: 'A safe short rest. Gwenna tells of the lantern lights on the avalanche slope, the crate carried like a coffin, and the wyvern that took Ivo alive. She takes the heroes to Merrit\'s cairn if asked: DC 12 Medicine shows the stab wound in his back. If the heroes found the Pilgrims\' Door, she remembers her grandmother calling it "the monks\' winter road".',
        },
        {
          room: 'The rope bridge', title: 'A shadow over the Gash', encounter: 'Wyvern over the Gash',
          read: 'Halfway across, the bridge begins to sway in a way the wind does not explain. A shadow slides over you. Then the screaming starts, from above.',
          gm: 'One young wyvern, hunting. It dives at whoever is on the bridge, trying to knock them off (see the bridge\'s notes). If the heroes carry an egg, it circles and screams instead of attacking. If they took the avalanche slope, it finds them there instead, and the scream may start a slide. It flees at half hit points, back to the tower. On the far side, the kill ledge holds the clues: no human bones, Ivo\'s clean smock, a black-fletched arrow.',
        },
        {
          room: "Snikkit's scrape", title: 'Lord Snikkit knows all', encounter: "Snikkit's scrape", handout: 'wr-map', optional: true,
          read: 'A goblin in a cloak of polished scales sits on a heap of furs as if it were a throne. "Visitors," he says, "for Lord Snikkit. Lord Snikkit is very important. Lord Snikkit knows things. Lord Snikkit is reasonable."',
          gm: 'Snikkit sells everything he knows for 20 gp or something shiny: the egg cave behind the boulders, the rider coming at moonrise, the secret way up from the Springmouth (handout). Insult him or refuse to pay and he sets the worgs on the heroes; he flees once he is bloodied. Promised the crossbow woman\'s head, he sends his worg riders to harry the camp at the heroes\' signal.',
          treasure: 'A heap of scavenged odds and ends: 140 sp, a silver censer from the monastery (60 gp) and a rope of climbing the goblins stole from the poachers.',
        },
        {
          room: "Poachers' camp", title: 'The egg cave', encounter: "Poachers' camp", handout: 'wr-letter',
          read: 'Behind the boulders, a camp: tents, a cookfire under canvas, stolen sheep in pens. In a hollow in the rocks, braziers glow around a crate of straw, and in the straw, something shifts and taps.',
          gm: 'Dagny\'s crew: Dagny (bandit captain), two veterans, two berserkers, four scouts and eight bandits. Dagny offers a deal first (200 gp each to walk away). Sneaking to the egg cave is DC 15 Stealth past the cookfire. Snikkit\'s worgs, Hulda\'s boulders or a slide off the avalanche slope can break the camp before the fight. Dagny surrenders when bloodied and sells out Lucan and Corby.',
          treasure: 'Two live wyvern eggs. Dagny\'s strongbox: 410 gp, two potions of greater healing, and three vials of wyvern poison. Lucan\'s letter.',
        },
        {
          room: "Hulda's stone garden", title: 'The sculptor of the shoulder', encounter: "Hulda's stone garden", optional: true,
          read: 'A rock the size of a barrel smashes into the path in front of you. "THIEVES," booms a voice from above. A grey giantess rises among her statues with another rock already in her hand.',
          gm: 'Hulda takes the heroes for the egg thieves, especially if they carry an egg or come from the camp. Persuading her (DC 13, or just handing her an egg to hold) ends it at once: she wants the eggs home as badly as anyone. As a friend she carries the heroes up to the chapel by the goat track and shows them where the poachers have been creeping about.',
          treasure: 'At the back of the garden, a statue of a knight holds a real +1 shield. Hulda gives it to anyone who returns an egg: "He does not need it. He is stone."',
        },
        {
          room: 'The Icefall', title: 'Two at the water', encounter: 'Hunting pair at the Icefall', optional: true,
          read: 'Two wyverns crouch on the frozen falls, cracking the ice with their snouts to drink. One lifts its head. Water drips from its jaw. Its eyes find you.',
          gm: 'Redcrest\'s mate and a younger male, back from hunting. They fight on the ice, where the heroes slip and they do not. A held-up egg (DC 15 Animal Handling) makes them back off and fly to the tower. A secret door in the rock at the east edge leads into the Wayshrine and the monks\' tunnel.',
        },
        {
          room: 'Chapel of the Bell', title: 'Have you come to ring the bell?', encounter: "The abbot's vigil", handout: 'wr-tally',
          read: 'Blue candles burn in the snow. The kneeling monk turns his head, and you see the altar through his face. "Have you come," he asks, "to ring the bell?"',
          gm: 'Brother Anselm hides in the cells until he is sure the heroes are not poachers, then comes out whistling. He explains everything he knows and begs them to put the eggs back. Abbot Haldane\'s ghost asks his question of everyone. Answer yes, and he tells them about the bell. Rob the reliquary and he and two specters attack. The ledger on the lectern holds Anselm\'s tally (handout); the rule is carved over the door (show "Carved over the chapel door" too).',
          treasure: 'In the reliquary (opened by the abbot\'s blessing, or DC 18 Thieves\' Tools and his wrath): a cloak of protection and 250 gp in old silver offering-pieces.',
        },
        {
          room: 'Undercroft', title: 'The haulers wait', encounter: 'Egg-haulers in the undercroft', optional: true,
          read: 'Lantern light leaks round a door in the rock. Inside, ten people sit on coils of rope in silence, listening to the sky. One is sharpening a long knife.',
          gm: 'The egg-haulers: two berserkers, two scouts and six bandits, led by Corby (a bandit), who stabbed Merrit. They wait for Sefton\'s griffon to scream, then go up through the secret door into the tower. Reached by the monks\' tunnel, or from the tower if the heroes find the door. Stopping them here makes the roost fight easier: they never reach the nest.',
          treasure: 'Climbing gear, two potions of healing, 60 gp.',
        },
        {
          room: 'The bell tower roost', title: 'Moonrise at the roost', encounter: 'Three-way at the roost',
          read: 'The moon comes up behind the peak, and the tower fills with silver light. Redcrest rises from the nest with a scream that shakes the bell. Out of the moon, wings spread wide, comes a griffon with a rider on its back, lance down.',
          gm: 'A three-way fight. Sefton and Whetstone dive for the eggs; Redcrest and her mate attack whoever is closest to the nest. Ivo yells from inside the bell. What ends it: ringing the bell (every wyvern frightened, Haldane at rest), setting returned eggs in the nest (DC 15 Animal Handling to do it under her eyes; then Redcrest turns on the poachers only), or showing Sefton proof of Merrit\'s murder (he leaves). If the heroes came only to kill, both wyverns fight to the death over their eggs.',
          treasure: 'In the nest\'s bone heap: 380 gp in coins from old pilgrims and travellers, a pair of boots of striding and springing on a skeleton\'s feet, and Ivo, alive.',
        },
      ],
      wrapUp:
        'If the eggs go back in the nest, Redcrest calms. That night the wyverns hunt only on the far side of the mountain. Ivo comes home on someone\'s back. If the heroes then go down and take the third egg from Lucan\'s crate and bring it up (or Hulda carries it), the Skarn wyverns never raid Lowfold again.',
    },
  ],
  ending:
    'Success: the eggs are home, Ivo is home, and the raids stop. Lowfold pays its 300 gp, Gwenna sends the heroes a cheese every winter for the rest of their lives, and Merrit\'s murderer stands before the reeve. Lucan Thresk is exposed if the heroes bring his letter down; he tries to buy his way out, then to run. Failure: if the wyverns die, their eggs are sold, and in a year the city has a new fashion for "tame" wyverns that are not tame at all. If the heroes kill the wyverns but leave the eggs, the poachers come back for them. What\'s next: Lucan\'s buyers in the city have a list of other rare nests; Sefton, if spared, knows where they are. Hulda wants help finishing her statue of Redcrest. And Brother Anselm, at last, would like an apprentice to ring the bell after him.',
};
