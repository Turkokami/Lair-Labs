// The Hollow Under Harrowfield: a one-session rural horror adventure for four heroes of level 3.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function harrowfield() {
  const b = new MapBuilder('adv-harrowfield-hive', 'Harrowfield and the hollow beneath', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });
  const r = rng(9137);

  // The top of the map (rows 0-24) is the farm at dusk. Everything below row 25 is underground:
  // solid earth, with the burrows, the dwarven granary and the brood carved into it.
  b.rock(0, 25, 80, 55);

  // the stream: a brook on the surface that drops into a swallow hole and runs on underground
  const sx = (y: number) => 34 + Math.round(Math.sin(y / 5) * 1.5);

  // ================= SURFACE =================

  // ---------- Harrow Lane and the farmyard ----------
  b.paint(0, 6, 10, 2, 'dirt');
  b.area('Harrow Lane', [[0, 4, 9, 6]], {
    read: 'A rutted lane runs between hawthorn hedges toward a lonely farm. The wheat on either side leans at odd angles, as if the ground beneath it has slumped. Somewhere a cow bell clanks once, then stops.',
    gm: 'The heroes arrive here at dusk. A DC 12 Perception spots a fresh ridge of raised earth running under the lane like a mole run, but as wide as a barrel. It ends at the hedge.',
    label: [3, 6],
  });
  b.props_('hedge-long', [[1, 3], [5, 3], [1, 9], [5, 9]]).prop('signpost', 8, 4).prop('milestone', 0, 8).prop('rubble-pile', 6, 7);
  b.start(1, 5, 3, 3);

  b.paint(10, 3, 11, 9, 'dirt');
  b.area('Farmyard', [[9, 2, 12, 10]], {
    read: 'A muddy yard with a well, an empty hen coop and a cart with one wheel off. Every tool on the farm is propped by the farmhouse door: pitchforks, a scythe, two spades and a fowling piece older than anyone alive.',
    gm: 'The Okeshotts have been "standing guard" for two nights and nobody has slept. The coop is empty: the hens went into a hole that opened under it on the first night (the hole has since slumped shut). Mabbot\'s offer letter is nailed to the barn door where Wendel spat on it.',
    label: [15, 7],
  });
  b.prop('well', 15, 6).prop('chicken-coop', 11, 4).prop('cart', 18, 9, 90).prop('water-trough', 12, 10).prop('firewood', 19, 3).props_('hay-bale', [[17, 3], [10, 8]]).prop('lamp-post', 14, 10).prop('handcart', 20, 6).prop('tool-crate', 10, 11).prop('mud-patch', 13, 8);
  b.light(14, 10, 15, 20);

  // ---------- the farmhouse ----------
  b.building('Okeshott farmhouse', 3, 13, 14, 12, {
    mat: 'wood-planks',
    read: 'A low farmhouse kitchen, warm and smoky. A stew nobody has eaten sits cold on the hearth. On the table lies a child\'s hair ribbon, muddy and blue, beside a lantern that has been kept burning in the window for two nights.',
    gm: 'Wendel and Jessamy Okeshott wait here. The ribbon was found at the lamb hole in the pasture. A DC 10 Perception notices the floor tilts: the house has sunk two inches at its south-west corner since midsummer. Pots on the shelves rattle every so often, all by themselves.',
    doors: [[9, 13, 'n', 'closed'], [16, 17, 'e', 'closed']],
    windows: [[3, 16, 'w'], [6, 13, 'n'], [13, 13, 'n'], [16, 22, 'e']],
  });
  b.wallRun(3, 19, 14, 's').door(6, 19, 's', 'closed').door(13, 19, 's', 'closed');
  b.wallRun(9, 20, 5, 'e');
  b.prop('kitchen-table', 9, 16).props_('chair', [[8, 16], [10, 16], [9, 15]]).prop('hearth-oven', 4, 14).prop('pot-rack', 5, 14).prop('cooking-pot-fire', 4, 15).prop('shelf-jars', 12, 14).prop('rocking-chair', 14, 17).prop('rug-runner', 11, 17).prop('coat-rack', 15, 14).prop('lantern-hanging', 6, 14).prop('washbasin', 4, 18);
  b.light(4, 15, 15, 20).light(6, 14, 10, 15);
  b.area("Dilly's room", [[3, 20, 6, 5]], {
    read: 'A tiny bedroom with a straw doll on the pillow and a wall covered in charcoal drawings of bugs. Big bugs. Bugs eating cows. Bugs with crowns.',
    gm: 'Dilly drew what she saw from her window for weeks and nobody believed her. One drawing shows a man in a tall hat throwing something into the wheat by moonlight (Insight DC 10: the hat is Mabbot\'s; Wendel recognises it at once if shown).',
  });
  b.prop('bed', 4, 21).prop('chest', 7, 21).prop('rug-round', 5, 23).prop('candles', 7, 23).prop('nightstand', 4, 23);
  b.area('Pantry and cellar stair', [[10, 20, 7, 5]], {
    read: 'Sacks of flour, strings of onions and a steep wooden stair down into the dark. A cold draught comes up it that smells of turned earth and vinegar.',
    gm: 'The cellar stair. The vinegar smell is ankheg acid. Wendel nailed the cellar door shut on the second night; prying it open is easy (no check), but loud.',
  });
  b.props_('flour-sacks', [[11, 21], [11, 23]]).prop('herbs-drying', 14, 21).prop('barrel', 15, 21).prop('stairs-down', 13, 23).prop('sack', 16, 23);
  b.door(13, 24, 's', 'closed');

  b.paint(0, 12, 3, 13, 'dirt');
  b.area('Kitchen garden', [[0, 12, 3, 13]], {
    read: 'Rows of leeks and cabbages, half of them sunk into little craters as if pressed down by a giant thumb.',
    gm: 'Each crater is where the burrows below have settled. Stamping here makes the ground boom hollow (and anything with tremorsense notices).',
    label: [1, 18],
  });
  b.props_('crop-rows', [[1, 13], [1, 16], [1, 21]]).prop('scarecrow', 1, 19).prop('beehive', 0, 24).prop('sinkhole', 2, 23);

  // ---------- the sheep pasture and the lamb hole ----------
  b.wallRun(22, 1, 12, 'n', 'low').wallRun(22, 1, 11, 'w', 'low').wallRun(33, 1, 11, 'e', 'low').wallRun(22, 11, 5, 's', 'low').wallRun(29, 11, 5, 's', 'low');
  b.area('Sheep pasture', [[22, 1, 12, 11]], {
    read: 'A sloping pasture, empty of sheep. The grass is flattened in long drag marks that all lead to one small, dark hole near the middle. A blue-dyed shoe lies beside it.',
    gm: 'The lamb hole: a collapsed burrow roof, far too narrow for an adult. Dilly chased the last lamb here two dusks ago and the ground gave way under her. A Small hero can squeeze down it (DC 12 Athletics): it drops into the larder burrow under the barn. Ida Gubbins is here, ear to the ground.',
    label: [27, 5],
  });
  b.area('Lamb hole', [[28, 6, 1, 1]], {
    gm: 'The narrow way down: a collapsed burrow roof that drops 15 feet into the larder burrow under the barn. Small heroes only, DC 12 Athletics to squeeze down (or climb back up). Medium heroes stick at the shoulders.',
    label: [28, 6],
  });
  b.note(28, 6, 'Lamb hole: drops into the larder burrow (Small heroes only, DC 12 Athletics).');
  b.pit(28, 6, 1, 1).prop('sinkhole', 28, 6).prop('backpack', 29, 7).prop('fence-gate', 27, 11).props_('water-trough', [[23, 2]]).props_('hay-bale', [[32, 2], [23, 9]]).props_('bones', [[25, 4]]).prop('bush', 31, 9).prop('mud-patch', 26, 6);

  // ---------- the barn (built by hand so the hole in its floor opens downward) ----------
  b.room('Okeshott barn', 21, 13, 13, 12, {
    mat: 'wood-planks-dark',
    read: 'The barn is silent. Every stall gate hangs open. In the last stall the boards are gone, eaten away round a ragged black hole that breathes cold, sour air. Something heavy was dragged through it: there is still a halter caught on a splinter.',
    gm: 'The calf went down here on the first night. The edges of the hole are soft with acid (DC 10 Nature: something spits acid, and big). Climbing down is easy with a rope, DC 12 Athletics without. It leads to the larder burrow. Jessamy went down six feet, saw eyes, and came back up with a burned arm.',
    label: [26, 18],
  });
  b.wallRun(21, 13, 13, 'n').wallRun(21, 13, 12, 'w').wallRun(33, 13, 12, 'e').wallRun(21, 24, 8, 's').wallRun(31, 24, 3, 's');
  b.door(26, 13, 'n', 'closed', 'door-double').door(27, 13, 'n', 'closed', 'door-double').door(33, 16, 'e', 'closed');
  b.wallRun(24, 14, 4, 'e', 'low').wallRun(27, 14, 4, 'e', 'low').wallRun(30, 14, 4, 'e', 'low').wallRun(24, 20, 5, 'e', 'low').wallRun(27, 20, 5, 'e', 'low');
  b.pit(29, 22, 2, 3);
  b.props_('hay-bale', [[22, 14], [22, 15], [32, 14]]).prop('ladder', 22, 23).prop('milk-churn', 25, 22).prop('horse-trough', 26, 15).prop('cart', 23, 19, 90).prop('wall-chains', 32, 18).prop('lantern-hook', 26, 21).prop('rope-coil', 28, 21).prop('acid-pool', 31, 22).prop('broken-furniture', 32, 23);
  b.light(26, 21, 10, 15);
  b.area('Barn hole', [[29, 22, 2, 3]], {
    gm: 'The way down from the barn: a 15-foot drop into the larder burrow. Tie off a rope to the beam above.',
    label: [29, 23],
  });

  // ---------- the brook and the swallow hole ----------
  for (let y = 0; y < 25; y++) {
    const x = 35 + Math.round(Math.sin(y / 4));
    b.water(x, y, 3, 1).water(x + 1, y, 1, 1, true);
  }
  b.floor(33, 9, 7, 2, 'wood-planks');
  b.area('Footbridge', [[33, 9, 7, 2]], {
    read: 'A plank footbridge crosses a fast brown brook. Downstream the water churns and vanishes into a hole in the ground with a sound like a giant drinking.',
    gm: 'The farm track to the mill crosses here.',
    label: [36, 9],
  });
  b.prop('bridge-plank', 36, 9, 90).prop('bridge-plank', 36, 10, 90).prop('lantern-standing', 39, 10).light(39, 10, 10, 15);
  for (let y = 17; y <= 18; y++) { const x = 35 + Math.round(Math.sin(y / 4)); b.water(x, y, 3, 1); }
  b.props_('boulder', [[35 + Math.round(Math.sin(17 / 4)), 17], [37 + Math.round(Math.sin(18 / 4)), 18]]);
  b.area('Swallow hole', [[34, 19, 5, 6]], {
    read: 'The brook pours into a ragged pit and roars away underground. Wheat straw, a dead hen and a child\'s wooden cup turn slowly in the eddy before they are sucked down.',
    gm: 'Stepping stones at the ford upstream are safe. Going down the swallow hole means riding the water into the dark: DC 13 Athletics or take 2d6 bludgeoning from the rocks, then surface in the underground stream. Fast, wet and terrifying. Dilly\'s cup came from the pasture: it proves things wash down from the lamb hole.',
    label: [36, 22],
  });
  b.prop('whirlpool', 36 + Math.round(Math.sin(23 / 4)), 23).prop('rapids', 36 + Math.round(Math.sin(20 / 4)), 20).prop('reeds', 34, 19).prop('reeds', 39, 21);

  // ---------- Long Acre, the wheat ----------
  b.paint(40, 1, 23, 23, 'sand');
  b.paint(38, 9, 28, 2, 'dirt');
  b.rubble(40, 1, 23, 8).rubble(40, 11, 23, 13);
  b.area('Long Acre', [[40, 11, 23, 13]], {
    read: 'Wheat stands chest high and gold in the last light, rustling though there is no wind. Here and there a patch has dropped a foot lower than the rest, the stalks sunk into soft grey dirt. Every so often the whole field shivers.',
    gm: 'The wheat is difficult ground. An ankheg hunts here at dusk, tracking footsteps by tremorsense. Walking in single file along the cart track (no check) or crossing at a slow crawl (DC 12 group Stealth) stays unnoticed. Running, stamping or fighting brings it. Three sinkholes: the big one (south) drops into the burrows.',
    label: [50, 16],
  });
  for (let y = 2; y <= 23; y += 3)
    for (let x = 41; x <= 61; x += 4) {
      if (y >= 2 && y <= 8 && x >= 51 && x <= 58) continue;
      if (r() < 0.35) continue;
      b.prop(r() < 0.6 ? 'crop-rows' : 'grass-tall', x + Math.floor(r() * 2), y === 8 ? 7 : y);
    }
  b.pit(44, 4, 2, 2).prop('sinkhole', 44, 4).pit(58, 15, 2, 2).prop('sinkhole', 58, 15);
  b.prop('scarecrow', 46, 14).props_('haystack', [[42, 21], [61, 12]]).prop('wagon', 60, 22).prop('signpost', 39, 11);
  b.encounter('Ankheg in the wheat', [40, 11, 23, 13], [['ankheg', 1]], 'low');

  b.floor(52, 3, 7, 5, 'dirt');
  b.area('The trampled ring', [[52, 3, 7, 5]], {
    read: 'A ring of wheat has been crushed flat, as if something huge had turned round and round here. In the middle lie the remains of a cow, picked hollow, its hide melted like candle wax.',
    gm: 'A DC 12 Survival: the cow was dragged here from the east, not from the farm, and there are cart wheel ruts and boot prints beside the drag marks. Someone brought this cow as bait. A DC 13 Investigation finds a brass feeding-bell clapper in the stubble, stamped with a grain merchant\'s wheatsheaf mark (Mabbot\'s).',
    label: [55, 5],
  });
  b.prop('giant-ribcage', 55, 5).prop('acid-pool', 53, 4).prop('bones', 57, 6).prop('mud-patch', 54, 7).prop('gm-treasure', 57, 4, 0, { gm: true });

  b.pit(48, 20, 3, 5);
  b.area('The big sinkhole', [[47, 19, 5, 6]], {
    read: 'The ground simply stops. A pit as wide as a cottage has opened in the wheat, its edges crumbling. Cold air rises out of it, and from deep below comes a slow, wet clicking.',
    gm: 'The sinkhole slopes down 20 feet to the sinkhole cave below: DC 11 Athletics to climb, or slide and land prone (1d6 bludgeoning). Ida knows it is the colony\'s main air hole.',
    label: [49, 21],
  });
  b.prop('sinkhole', 49, 21).props_('crumbling-ledge', [[47, 20], [51, 22]]).prop('rope-coil', 47, 23);

  // ---------- the mill knoll: Mabbot's windmill, yard and lodging ----------
  b.paint(63, 8, 17, 9, 'dirt');
  b.area('Mill yard', [[63, 8, 17, 9]], {
    read: 'A windmill creaks on its knoll, its torn sails turning slowly against a bruised sky. A covered wagon stands in the yard, and around it the air buzzes with flies. Two big men sit by a fire with a pair of mastiffs, and a man in a tall hat waves at you with every sign of delight.',
    gm: 'Ferris Mabbot and his drovers. Mabbot is all smiles: he offers sympathy, a drink, and a reward for "the little lass". The wagon holds four barrels of offal and blood (DC 10 Medicine: far too much for any farm\'s needs). If the heroes poke at it, Mabbot says it is "pig feed for a buyer in Crookmere" (DC 14 Insight: a lie). He will not let anyone into the mill tonight: "the floor is unsafe". Violence here is a bad idea without proof, but it can happen.',
    label: [68, 12],
  });
  b.prop('wagon', 65, 10, 90).props_('barrel-stack', [[64, 12], [66, 13]]).prop('campfire', 70, 11).props_('stool', [[69, 10], [71, 12]]).prop('hitching-post', 63, 15).prop('horse-trough', 64, 16).prop('tent', 76, 13).prop('obscuring-cloud', 65, 12).prop('fence-gate', 63, 9);
  b.light(70, 11, 15, 20);
  b.encounter("Mabbot's drovers", [63, 8, 17, 9], [['spy', 1], ['thug', 2], ['mastiff', 2]], 'low');

  b.building('Windmill', 67, 17, 8, 8, {
    mat: 'wood-planks',
    read: 'Inside, the great millstones lie still under a skin of dust. No grain has been ground here in months. But the floor round the trapdoor is scrubbed clean, and the boards there are dark with old stains.',
    gm: 'Mabbot bought the mill at midsummer and never milled a sack. The trapdoor at the back is padlocked (DC 13 thieves\' tools, or Bodger\'s key) and leads down to his cellar. Sails and gear are stored up the spiral stair; from the cap you can see the whole farm, and at night, a lantern bobbing in the wheat where Bodger lays bait.',
    doors: [[70, 17, 'n', 'closed']],
    windows: [[67, 20, 'w'], [74, 20, 'e']],
  });
  b.prop('grindstone', 70, 20).prop('stair-spiral', 68, 18).props_('flour-sacks', [[73, 18], [68, 23]]).prop('sails-pile', 73, 22).prop('winch', 71, 18).prop('stairs-down', 72, 23).prop('trapdoor', 71, 23).prop('lantern-hanging', 70, 22);
  b.light(70, 22, 10, 15);
  b.door(72, 24, 's', 'locked');

  b.building("Mabbot's lodging", 73, 1, 7, 6, {
    mat: 'wood-planks-dark',
    read: 'The miller\'s old cottage, now very tidy. A good bed, a writing desk, a strongbox, and three pairs of polished boots in a row. Pinned over the desk is a map of Harrowfield with every farm crossed out in red but one.',
    gm: 'Mabbot sleeps here. The desk holds his copy of the dwarven survey (handout) and letters to every farmer. The strongbox (DC 14 thieves\' tools) holds the debt notes he bought up for every farm in Harrowfield, Wendel\'s among them, and his money. The crossed-out map is damning on its own only if someone already suspects him.',
    doors: [[75, 6, 's', 'locked']],
    windows: [[73, 3, 'w'], [79, 4, 'e']],
  });
  b.prop('bed', 77, 2).prop('writing-desk', 74, 2).prop('strongbox', 78, 5).prop('chair', 74, 3).prop('map-cabinet', 76, 2).prop('coat-rack', 74, 5).prop('candles', 75, 4);
  b.light(75, 4, 5, 10);
  b.area('Mill knoll', [[63, 0, 10, 8]], {
    read: 'A bare hill crowned with gorse. From here you can see the whole of Harrowfield: the farm, the brook, and a long dark scar across the wheat where the ground has settled.',
    gm: 'The scar runs from the windmill straight to Long Acre (DC 12 Survival or Nature: whatever made it started near the mill). The best view on the farm.',
    label: [67, 4],
  });
  b.props_('thorn-bush', [[64, 1], [69, 2], [71, 6]]).prop('boulder', 66, 5).prop('cairn', 68, 3);
  b.area('Hedge corner', [[75, 17, 5, 8]], {
    read: 'A tangle of hedge and nettles behind the mill, full of buzzing.',
    gm: 'Where Bodger dumps the empty barrels. Under the nettles: two dozen staved-in barrels and a pile of lamb fleeces with the Okeshott tar mark. Proof that Okeshott sheep went through Mabbot\'s hands.',
    label: [77, 20],
  });
  b.props_('hedge', [[76, 18], [78, 23]]).props_('barrel', [[77, 19], [78, 21]]).prop('debris-wood', 76, 22).prop('bones', 79, 20);

  // ================= UNDERGROUND =================

  // ---------- the farmhouse cellar ----------
  b.hall(13, 25, 13, 26, 1, { mat: 'stone-flagstone' });
  b.room('Farmhouse cellar', 8, 27, 9, 5, {
    mat: 'stone-flagstone',
    read: 'Shelves of preserves, a cider barrel, sacks of seed potatoes. In the far corner the flagstones have dropped away into a sloping tunnel, and the stones round its lip are pitted and smoking faintly.',
    gm: 'The ankhegs broke in last week, looking for the potatoes\' smell. The tunnel south leads to the dwarven granary. A rough crawl east (dug by the colony) leads to the larder burrow under the barn.',
  });
  b.props_('shelf-jars', [[9, 27], [11, 27]]).prop('barrel', 15, 27).props_('sack', [[15, 29], [16, 30]]).prop('stairs-up', 13, 27).prop('produce-crates', 10, 30).prop('acid-pool', 9, 30).prop('ceiling-rubble', 12, 31);

  b.tunnel([[9, 31], [8, 35], [10, 39], [11, 42]], 2, { mat: 'dirt', seed: 501 });
  b.area('Acid-bored tunnel', [[7, 33, 4, 8]], {
    read: 'A smooth round tunnel slopes down through clay and then through stone. The stone is not cut but melted, its surface glassy and grooved by mandibles.',
    gm: 'Ankhegs bore through rock by softening it with acid. A DC 12 Nature check: these tunnels are fresh, a few weeks old, and something keeps them clear. It ends in the granary\'s north wall.',
    label: [9, 36],
  });
  b.props_('mud-patch', [[8, 34]]).prop('bones', 10, 38);

  // ---------- the larder burrow under the barn ----------
  b.tunnel([[29, 25], [28, 28]], 2, { mat: 'dirt', seed: 502 });
  b.cave('Larder burrow', 28, 31, 5.5, 3.5, {
    seed: 503, mat: 'dirt',
    read: 'The smell hits first: old meat and vinegar. The cave is heaped with what the colony has stored for later: a calf, sheep, hens, all softened and glistening. Rats swarm over the pile, and the pile seems to breathe.',
    gm: 'The colony\'s food store, and a feast for rats. Giant rats and rat swarms boil out at light or noise. A DC 12 Investigation in the heap finds Dilly\'s other shoe (no blood) and a trail of small footprints in the dirt heading south: she got out alive. The lamb hole from the pasture opens in the roof here.',
  });
  b.props_('bone-heap', [[26, 30], [31, 32]]).prop('giant-ribcage', 28, 31).props_('mud-patch', [[25, 32], [30, 29]]).prop('skull-pile', 32, 30).prop('sack', 24, 31).prop('gm-treasure', 31, 33, 0, { gm: true });
  b.area('Foot of the lamb hole', [[28, 28, 2, 2]], {
    gm: 'The lamb hole from the sheep pasture comes down through the roof here: a narrow shaft of collapsed earth with daylight (or moonlight) at the top. Dilly fell down it. A Small hero can climb up it (DC 12 Athletics); nobody bigger fits.',
    label: [29, 29],
  });
  b.prop('ceiling-rubble', 29, 29).prop('mud-patch', 28, 29);
  b.note(29, 29, 'Lamb hole: the narrow shaft up to the sheep pasture (Small heroes only, DC 12 Athletics).');
  b.encounter('The larder', [23, 28, 11, 7], [['swarmOfRats', 3], ['giantRat', 7]], 'low');
  b.tunnel([[23, 31], [20, 30], [17, 29]], 2, { mat: 'dirt', seed: 504 });
  b.tunnel([[27, 35], [26, 39], [23, 42]], 2, { mat: 'dirt', seed: 505 });

  // ---------- the underground stream, with three crossings ----------
  b.cave('Stream cave', 36, 40, 4.5, 3, { seed: 506, mat: 'sand', read: 'The stream widens into a black pool with a beach of grey sand. Pale crayfish scuttle away from your light. On the sand are tracks: big and pointed, many of them.', gm: 'A good place to rest, if you watch the water. The colony drinks here. The sand shows a child\'s footprints going to the water\'s edge and back again: Dilly drank here and went west.' });
  for (let y = 25; y < 80; y++) {
    const x = sx(y);
    b.water(x, y, 3, 1).water(x + 1, y, 1, 1, true);
  }
  b.area('Underground stream', [[33, 25, 5, 14], [32, 56, 6, 9], [33, 70, 6, 10]], {
    read: 'The brook runs on in the dark, fast and cold, through a channel worn smooth long before any bug came here. Its roar fills your ears.',
    gm: 'Deep in the middle (swim, DC 12 Athletics to cross or be swept 20 feet downstream). Three easy crossings: the drowned cow jam (north), the dwarven bridge at the sluice house (middle), and the gravel ford (south). Anyone swept south of the ford goes out through a grate into the river miles away (rescue by rope, DC 12).',
    label: [35, 60],
  });
  b.props_('rapids', [[sx(36) + 1, 36], [sx(58) + 1, 58]]).prop('deep-water', sx(75) + 1, 75).prop('sewer-outflow', sx(79) + 1, 79);

  // cow jam (north crossing)
  for (const y of [31, 32]) { b.floor(sx(y) - 1, y, 5, 1, 'mud'); b.mud(sx(y) - 1, y, 5, 1); }
  b.area('Drowned cow jam', [[sx(31) - 1, 31, 5, 2]], {
    read: 'A bloated cow is wedged across the stream on a raft of straw and sticks, its legs in the air like a table knocked over. It is the only dry way across. It is not very dry.',
    gm: 'Crossing on the cow is difficult ground and deeply unpleasant (DC 10 Constitution save or spend the next turn retching). Two giant toads, fat on bugs, lurk in the pool downstream and come for anyone who falls in or lingers.',
    label: [sx(31) + 1, 31],
  });
  b.prop('bones-mud', sx(31) + 1, 31).prop('log-fallen', sx(32), 32, 90);
  b.encounter('Toads at the cow jam', [30, 29, 14, 7], [['giantToad', 2]], 'low');
  b.tunnel([[32, 31], [sx(31) - 1, 31]], 2, { mat: 'dirt', seed: 507 });
  b.tunnel([[sx(32) + 3, 32], [42, 31], [46, 30]], 2, { mat: 'dirt', seed: 508 });

  // ---------- the Korvald granary (dwarven vault) ----------
  b.room('Korvald granary', 3, 42, 24, 15, {
    mat: 'dungeon-slab',
    read: 'Your light finds square stone pillars marching away into the dark, carved with sheaves of wheat. Great stone grain bins line the walls, lids thrown off. The air smells of dust and bread, centuries old, and of fresh acid. Chalk letters run up one pillar in a child\'s hand.',
    gm: 'The granary of a dwarf clan, Korvald, sealed for three hundred years and now full of ankheg tunnels. Two ankhegs dig here, chewing at the walls toward the seed vault (Mabbot has been laying offal trails to draw them west). They hunt by tremorsense: banging the bins brings them at once, and Dilly learned that the hard way. Moving slowly between pillars needs a DC 12 group Stealth. Dilly\'s chalk message (handout) is on the pillar nearest the chute. The bins still hold dwarven stonebread: hard as slate, but soaked in water it is good food.',
    label: [14, 49],
  });
  b.rock(3, 42, 3, 2).rock(23, 54, 4, 3).rock(3, 55, 2, 2);
  b.rubble(20, 42, 4, 2).rubble(3, 50, 2, 3);
  for (const x of [8, 13, 18, 23]) for (const y of [45, 49, 53]) if (!(x === 23 && y === 53)) b.prop('pillar-square', x, y);
  b.props_('barrel-stack', [[6, 44], [10, 43], [15, 43]]).props_('crate-pile', [[25, 45], [25, 48]]).props_('flour-sacks', [[5, 47], [5, 53]]).prop('mine-cart', 14, 51, 90).props_('mine-rails', [[11, 51], [12, 51], [13, 51], [15, 51], [16, 51]], 90).prop('statue', 14, 55).prop('scales', 20, 51).prop('ceiling-rubble', 21, 43).prop('acid-pool', 9, 47).prop('mud-patch', 17, 47).prop('sconce-magefire', 6, 49).prop('sconce-magefire', 24, 50).prop('gm-treasure', 6, 44, 0, { gm: true });
  b.light(6, 49, 5, 15, '#9fc7ff').light(24, 50, 5, 15, '#9fc7ff');
  b.encounter('Diggers in the granary', [3, 42, 24, 15], [['ankheg', 2]], 'moderate');

  b.hall(18, 37, 18, 41, 1, { mat: 'dungeon-slab' });
  b.room('Chute loft', 16, 34, 5, 3, {
    mat: 'wood-planks-dark',
    read: 'At the top of a narrow stone chute is a little loft of rotten planks, heaped with dwarven grain sacks. Behind them, something hisses at you: "Go away or I\'ll scoop you."',
    gm: 'Dilly Okeshott has hidden here for two days. The chute is one square wide: too narrow for the Large ankhegs, so she is safe as long as she stays put. She has lived on soaked stonebread and stream water. She will not come out for strangers unless they name her mum or gran, show her ribbon, or make her laugh. Then she talks nonstop (see Dilly).',
  });
  b.props_('flour-sacks', [[16, 34], [20, 35]]).prop('straw-bed', 17, 35).prop('candles', 19, 34).prop('chest-open', 20, 34);
  b.area('Grain chute', [[18, 37, 1, 5]], { gm: 'A one-square stone chute from the loft to the granary floor. Large creatures cannot get in.', label: [18, 39] });

  // the sealed seed vault
  b.door(11, 56, 's', 'locked', 'door-iron');
  b.hall(11, 57, 11, 58, 1, { mat: 'dungeon-slab' });
  b.room('Seed vault', 7, 59, 9, 5, {
    mat: 'stone-flagstone-warm',
    read: 'Dry warm air, as if no time has passed. Clay jars stand in rows, each sealed with wax and stamped with a sheaf. On a stone shelf lie the clan\'s treasures: a silver sickle, a coin chest and a dwarf\'s pick wrapped in oiled cloth.',
    gm: 'This is what Mabbot wants. The sealed door is carved: "WHAT THE FIELD GIVES, THE STONE KEEPS." Saying "seed" (in any language) opens it, or DC 15 thieves\' tools, or DC 18 Strength. The jars hold seed grain still good after 300 years: planted, it grows wheat that ankhegs will not touch (a lovely reward for Wendel). Mabbot thinks it is a gold vault. It is mostly seeds.',
  });
  b.props_('urn', [[8, 60], [9, 60], [10, 60], [8, 62], [9, 62]]).prop('coffer', 14, 60).prop('reliquary', 12, 60).prop('rune-stone', 14, 62).prop('doors-grand-frame', 11, 57).prop('lock-plate', 11, 58).prop('gm-treasure', 13, 61, 0, { gm: true });
  b.light(12, 61, 5, 10, '#ffd38a');

  // the waterworks: sluice house and the dwarven bridge
  b.hall(27, 49, 27, 50, 1, { mat: 'dungeon-slab' });
  b.room('Sluice house', 28, 46, 4, 7, {
    mat: 'stone-flagstone',
    read: 'A tall, narrow chamber of dressed stone full of the noise of water. An iron wheel as big as a cartwheel is set in the wall, red with rust, beside a stone gate that could shut off the stream.',
    gm: 'The clan\'s water-gate. Three turns of the wheel (DC 15 Strength, or two heroes working together at DC 12, 1 minute) drop the gate and send the stream down the old drain into the low galleries, which is where the brood now nests. Ten minutes later the egg gallery is ankle deep and the brood chamber is knee deep: the eggs drown, the two guard ankhegs flee up the feeding run, and the Broodmother is weakened (see her notes). The dwarven survey (handout) explains it.',
  });
  b.prop('winch', 29, 47).prop('lever', 30, 51).prop('rapids', 31, 49).prop('chains-hanging', 28, 52).prop('torch-sconce', 29, 46);
  b.light(29, 46, 10, 15);
  b.floor(32, 49, sx(49) + 6 - 32, 2, 'dungeon-slab');
  b.area('Dwarven bridge', [[32, 49, sx(49) + 6 - 32, 2]], {
    read: 'A stone bridge, just wide enough for two, arches over the roaring stream. Its parapet is carved with a line of little stone dwarves, all carrying sacks.',
    gm: 'The safe middle crossing. Halfway over, one of the carved dwarves is loose (DC 12 Perception): behind it is a niche with a silver flask of strong spirit (10 gp) and a note in Dwarvish, "For the bridge-warden. Do not tell the miller-chief."',
    label: [sx(49) + 1, 49],
  });
  b.prop('bridge-plank', sx(49) + 1, 49, 0).prop('statue', sx(50) + 1, 50);
  b.tunnel([[sx(49) + 5, 50], [42, 51], [44, 51]], 2, { mat: 'dirt', seed: 509 });

  // ---------- the fungus grotto and the gravel ford (south-west loop) ----------
  b.tunnel([[20, 56], [19, 61], [17, 65]], 2, { mat: 'cave-floor', seed: 510 });
  b.cave('Fungus grotto', 14, 70, 8, 5, {
    seed: 511, mat: 'cave-floor',
    read: 'Mushrooms taller than a man crowd a damp cave, glowing soft blue. Some caps are spotted violet, and those ones lean toward you as you pass.',
    gm: 'Violet fungi hide among the harmless blue ones, a shrieker squeals at light, and a darkmantle hangs from the roof like a stalactite. Dilly warned about "the blue ones" but meant the violet ones; she is eight. The blue mushrooms are safe and glow for a day after picking (dim light, 10 ft). A collapsed dwarven drain (west) holds a dead dwarven surveyor\'s pack.',
  });
  b.props_('mushroom-giant', [[11, 68], [16, 72], [19, 69]]).props_('glowing-fungus', [[13, 67], [9, 71], [18, 73]]).props_('mushrooms', [[15, 69], [11, 72]]).prop('stalactites', 14, 66).prop('skeleton-lying', 8, 70).prop('backpack', 8, 71);
  b.light(13, 67, 5, 15, '#7fb8ff').light(18, 73, 5, 15, '#c08cff');
  b.encounter('Fungus grotto', [6, 65, 17, 11], [['violetFungus', 4], ['shriekerFungus', 1], ['darkmantle', 1]], 'low');
  b.tunnel([[22, 70], [27, 68], [sx(67) - 1, 67]], 2, { mat: 'cave-floor', seed: 512 });
  for (let y = 66; y <= 68; y++) b.water(sx(y), y, 3, 1);
  b.area('Gravel ford', [[sx(67) - 1, 66, 5, 3]], {
    read: 'The stream spreads out over a bed of pale gravel, knee deep and loud. On the far side, the tunnel walls are slick and scored with mandible marks.',
    gm: 'Wading is difficult ground but safe. This is the back way into the brood chamber, and the ankhegs rarely watch it.',
    label: [sx(67) + 1, 67],
  });
  b.prop('boulder', sx(66), 66);
  b.tunnel([[sx(67) + 3, 67], [40, 68], [44, 68]], 2, { mat: 'dirt', seed: 513 });

  // ---------- the east bank: sinkhole cave, spider hollow ----------
  b.tunnel([[49, 25], [50, 27]], 2, { mat: 'dirt', seed: 514 });
  b.cave('Sinkhole cave', 50, 30, 5, 3.5, {
    seed: 515, mat: 'dirt',
    read: 'A slope of loose earth and broken wheat roots spills into a round cave. The walls are riddled with holes the size of barrels, and from several of them comes a slow clicking.',
    gm: 'The colony\'s front door. Most of the holes are dead ends; three lead on (west to the cow jam, east to the spider hollow, south to the egg gallery). Ida can tell which by listening (or DC 13 Survival).',
  });
  b.rubble(48, 27, 4, 2);
  b.props_('rubble-pile', [[48, 28], [52, 28]]).prop('mud-patch', 51, 31).prop('bones', 47, 31).prop('stalactites', 53, 30);
  b.tunnel([[55, 30], [58, 30]], 2, { mat: 'dirt', seed: 516 });
  b.cave('Spider hollow', 61, 30, 3.5, 3, {
    seed: 517, mat: 'cave-floor',
    read: 'Webs fill this cave like grey wool. Tangled in them are the dry husks of young ankhegs, each the size of a dog, sucked empty.',
    gm: 'Two giant spiders have moved in to prey on the colony\'s young. They will fight anything that touches the webs, but a hero who throws them a husk or simply backs off is left alone. In the webs: a cocooned drover who crossed Mabbot (dead), with his purse. A boarded crack in the east wall leads into Mabbot\'s cellar.',
  });
  b.props_('spider-web', [[59, 29], [62, 31], [61, 28]]).prop('cobweb-corner', 63, 32).prop('skeleton-seated', 61, 32).prop('gm-treasure', 60, 31, 0, { gm: true });
  b.encounter('Spider hollow', [57, 27, 8, 7], [['giantSpider', 2]], 'low');
  b.tunnel([[64, 30], [65, 30]], 1, { mat: 'cave-floor', seed: 518 });
  b.door(65, 30, 'e', 'locked', 'door-broken');

  // ---------- Mabbot's cellar and the hidden feeding pen ----------
  b.hall(72, 25, 72, 27, 1, { mat: 'wood-planks' });
  b.room("Mabbot's cellar", 66, 28, 11, 5, {
    mat: 'stone-flagstone',
    read: 'A mill cellar, swept and orderly. Barrels marked PIG FEED stand in rows, and a tally board on the wall counts something in neat chalk strokes. Planks are nailed over a crack in the west wall, and the planks are scorched.',
    gm: 'Bodger\'s ledger hangs on a nail by the tally board (handout). The barrels hold offal and sheep\'s blood. A DC 13 Investigation (or Bodger\'s word) finds the secret door in the south-east corner behind a rack of empty sacks: a stair down to the feeding pen. The planked crack leads to the spider hollow.',
  });
  b.props_('barrel-stack', [[67, 29], [69, 29], [67, 31]]).prop('notice-board', 70, 28).prop('stairs-up', 72, 28).prop('workbench', 74, 29).prop('butcher-block', 69, 31).prop('wall-shelves', 76, 29).prop('sack', 76, 31).prop('gm-secret-door', 75, 32, 0, { gm: true }).prop('lantern-hanging', 72, 30);
  b.light(72, 30, 10, 15);
  b.door(75, 32, 's', 'secret');
  b.hall(75, 33, 75, 34, 1, { mat: 'stone-flagstone' });
  b.prop('stairs-down', 75, 33);

  b.room('Feeding pen', 64, 35, 14, 9, {
    mat: 'dirt',
    read: 'A long cave walled with timber and iron bars. Meat hooks hang over a trough slick with blood. On a post by the bars hangs a big brass bell. Beyond the bars, a dark tunnel slopes away, and from far down it comes an answering click... click... click.',
    gm: 'Mabbot\'s secret: here Bodger tips offal through the bars and rings the bell three times, and the colony comes to feed. He has been doing it every night since midsummer, training the ankhegs to come to the bell and laying trails west toward the granary. If the heroes arrive at feeding time, Bodger and another drover are here, and Bodger rings the bell in panic: an ankheg arrives in 2 rounds, hungry and not fussy. Rats come with the blood. The bell is the best evidence on the farm: ring it in the farmyard and everyone will understand.',
    label: [71, 39],
  });
  b.mud(68, 40, 4, 3);
  b.wallRun(66, 35, 9, 'w', 'bars').door(66, 39, 'w', 'locked', 'door-iron');
  b.prop('temple-bell', 67, 37).prop('water-trough', 68, 41).props_('chains-hanging', [[70, 36], [72, 36], [74, 36]]).props_('barrel', [[76, 36], [76, 42]]).prop('cage', 74, 42).prop('butcher-block', 72, 42).prop('torch-standing', 69, 38).prop('torch-standing', 76, 39).prop('trapdoor', 65, 38);
  b.light(69, 38, 10, 20).light(76, 39, 10, 20);
  b.encounter('Feeding time', [64, 35, 14, 9], [['thug', 2], ['ankheg', 1], ['swarmOfRats', 2]], 'moderate');

  b.tunnel([[63, 39], [60, 43], [57, 47], [55, 49]], 2, { mat: 'dirt', seed: 519 });
  b.area('Feeding run', [[57, 41, 5, 6]], {
    read: 'A broad tunnel slick with old blood, dragged smooth by a hundred feedings.',
    gm: 'The colony\'s road to the bell. Anything coming up it is heard two rounds early (the clicking).',
    label: [59, 44],
  });
  b.props_('bones', [[60, 42]]).prop('mud-patch', 58, 46);

  b.tunnel([[72, 43], [73, 47]], 2, { mat: 'dirt', seed: 520 });
  b.cave('Bone midden', 73, 52, 5, 4, {
    seed: 521, mat: 'mud',
    read: 'A pit of picked bones, hides and husks, steaming gently. The floor quivers like jelly. Then you realise part of it is jelly.',
    gm: 'Where the colony dumps what it cannot eat. Two grey oozes and an ochre jelly feed here. They are slow: a party that does not linger or that crosses on the bone ridge (DC 11 Acrobatics) can avoid them. Buried in the bones: the brass collars of three missing dogs and a tin of Mabbot\'s wheatsheaf-stamped feed tokens.',
  });
  b.props_('bone-heap', [[71, 51], [75, 53]]).props_('skull-pile', [[73, 55]]).prop('acid-pool', 76, 51).prop('green-slime', 70, 53).prop('gm-treasure', 74, 50, 0, { gm: true });
  b.encounter('Bone midden', [68, 48, 11, 9], [['grayOoze', 2], ['ochreJelly', 1]], 'low');
  b.tunnel([[70, 55], [66, 60], [61, 66]], 2, { mat: 'dirt', seed: 522 });

  // ---------- the egg gallery and the brood chamber ----------
  b.tunnel([[50, 34], [48, 39], [48, 45]], 2, { mat: 'dirt', seed: 523 });
  b.cave('Egg gallery', 48, 50, 7.5, 4.5, {
    seed: 524, mat: 'dirt',
    read: 'The air is hot and close. Leathery grey eggs, each as big as a barrel, sit half-buried in warm mud in neat rows. Some of them twitch. One has split, and a pale wet thing the size of a dog is pulling itself free.',
    gm: 'Forty eggs. An ankheg tends them, and two giant spiders have crept in to raid them: when the heroes arrive, the spiders and the ankheg are about to fight each other. Clever heroes let them. Each round the egg-tender fights the spiders, it ignores the heroes unless attacked. Smashing eggs (an action each, AC 10, 5 hp) brings the Broodmother on the third round of noise. Fire spreads well through the dry husks here.',
  });
  b.mud(43, 48, 4, 3).mud(50, 51, 4, 2);
  b.props_('boulder', [[44, 48], [46, 49], [45, 51], [51, 51], [52, 52], [50, 48]]).prop('mud-patch', 47, 53).prop('spider-web', 54, 48).prop('bones', 42, 51);
  b.light(48, 50, 5, 10, '#d6b36a');
  b.encounter('Egg tenders', [41, 45, 15, 10], [['ankheg', 1], ['giantSpider', 2]], 'moderate');
  b.tunnel([[50, 55], [53, 59], [52, 62]], 2, { mat: 'dirt', seed: 525 });

  b.cave('Brood chamber', 53, 68, 9.5, 6.5, {
    seed: 526, mat: 'dirt',
    read: 'A cavern as big as a barn, hot as a bread oven. The walls glisten. In the middle, curled round a mound of eggs, lies an ankheg the size of a hay wagon, its shell scarred white with old burns. Its feelers lift toward you. The clicking stops.',
    gm: 'Old Grindmaw, the Broodmother, with two ankhegs. She fights to the death over her eggs; the others flee when she falls. If the sluice was opened, the chamber is knee deep in water (difficult ground for everyone), the two guards have fled, and she starts the fight having lost 15 hit points. Fire makes her back off a round (she will not cross burning ground). If the feeding bell is rung from the pen, she does not come: she never leaves the eggs. Behind the egg mound: the remains of everything the colony has dragged down, and some of it was valuable.',
  });
  b.mud(48, 66, 4, 3).mud(56, 70, 5, 2);
  b.props_('boulder', [[52, 67], [53, 69], [55, 68], [51, 70]]).props_('bone-heap', [[46, 64], [59, 72]]).prop('giant-ribcage', 58, 64).prop('acid-pool', 49, 72).prop('skull-pile', 61, 67).prop('treasure-pile', 56, 66).prop('gm-treasure', 57, 66, 0, { gm: true }).prop('steam-vent', 47, 69);
  b.light(53, 68, 5, 15, '#d6b36a');
  b.encounter('The Broodmother', [44, 61, 20, 14], [['ankhegBroodmother', 1], ['ankheg', 2]], 'high');

  b.note(36, 22, 'Ways down: the farmhouse cellar, the barn hole, the swallow hole (swim), the big sinkhole in Long Acre, the windmill trapdoor, and (Small heroes only) the lamb hole.');
  b.note(67, 37, 'The feeding bell: ring it three times and an ankheg comes up the feeding run in 2 rounds.');
  b.note(11, 56, 'Sealed door: "What the field gives, the stone keeps." The answer is "seed".');
  return b.build();
}

export const HARROWFIELD_HIVE: Adventure = {
  id: 'harrowfield-hive',
  title: 'The Hollow Under Harrowfield',
  tagline: 'The wheat is sinking, the cows are vanishing, and a little girl is somewhere under the fields with things that chew through stone.',
  levels: '3',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'rural horror', 'tunnels', 'giant bugs', 'mystery'],
  pitch:
    'Harrowfield is good wheat country, flat and gold and dull. Then, this summer, the ground went hollow. Holes open in the fields overnight. Cows go into them bellowing and do not come out. Two dusks ago, eight-year-old Dilly Okeshott chased a lamb across her gran\'s pasture and the earth swallowed her too. The Okeshotts are the last family still farming Harrowfield. They have tools, a lantern in the window and no sleep. They need someone who will go down.',
  secret:
    'Ferris Mabbot, a smiling grain factor from the market town, is feeding a colony of ankhegs under Harrowfield on purpose. At midsummer he found an old copy of a dwarven survey: under Long Acre lies the Korvald granary, a dwarf clan\'s sealed store, with a "seed hall" he is sure is full of gold. He bought the windmill, dug a pen under it, and began luring ankhegs from the wild hills with offal and stolen sheep, ringing a bell to train them. The bugs do two jobs for him: they dig toward the vault, and they make the farms worthless. He has quietly bought every farmer\'s debts. Why now: the debts fall due at Harvest-end, three days away. A farmer with no harvest cannot pay, and Mabbot takes the land. Only the Okeshotts still hold out. He never meant for a child to be taken. It has scared him badly, and he has decided to keep going anyway. The colony has grown fast: a Broodmother is laying, and if her forty eggs hatch, the ground under the whole valley will fall in by spring.',
  hooks: [
    'Jessamy Okeshott rides into town on a carthorse with her arm in a bandage and offers everything the family has (about 60 gp and a pig) to anyone who will find her daughter.',
    'Ida Gubbins, the county molecatcher, buttonholes the heroes in a tavern: "Them\'s not moles. I want witnesses when I prove it, and I want ones with swords."',
    'Ferris Mabbot himself hires the heroes to "deal with the vermin problem" on land he means to buy. He expects them to fail, and he will be very upset if they succeed.',
  ],
  tips: [
    'Ankhegs hunt by feeling the ground shake. Remind players of this early (Ida says it in plain words), then reward them for creeping, for luring bugs with noise, and for using the feeding bell against Mabbot.',
    'There are six ways down. Let the players pick. Every route reaches Dilly, the eggs and the pen; the stream divides the burrows, with three crossings.',
    'Mabbot should be likeable at first. Let him buy the heroes a drink. The reveal hurts more if they liked him.',
    'Proof matters. Collect it as you go: the bell clapper in the trampled ring, the fleeces in the hedge, the ledger, Bodger\'s confession, the bell itself and, best of all, Dilly, who saw the "hat man" feeding the bugs.',
    'Short on time? Skip the spider hollow, the bone midden and the fungus grotto. Running hot? Have Bodger ring the feeding bell while the heroes are in the egg gallery.',
    'The sluice house turns the climax into a choice: drown the eggs and fight a weakened Broodmother, or keep the dwarven gate shut and face her at full strength.',
  ],
  npcs: [
    {
      id: 'pf_hfhwendel', name: 'Wendel Okeshott', title: 'farmer of Harrowfield, Dilly\'s grandad', kind: 'npc', art: 'farmer', shared: true,
      wants: 'Dilly home, and never to sell an inch of the land his gran broke with one ox and a borrowed plough.',
      knows: 'The ground started going hollow at midsummer, the same week Mabbot bought the windmill. His own grandad swore the dwarves kept "a cellar under Long Acre" long ago.',
      voice: 'Says "now then" before everything and will not sit down. Talks to the wheat as if it can hear.',
      appearance: 'A big old man with swollen knuckles, one braces strap, and a smell of pipe smoke and sheep dip.',
      gmNotes: 'Owes 30 gp at Harvest-end; Mabbot bought the debt. If the heroes bring back the dwarven seed, Wendel weeps, then immediately starts arguing about where to plant it.',
    },
    {
      id: 'pf_hfhjessamy', name: 'Jessamy Okeshott', title: 'Dilly\'s mother', kind: 'npc', art: 'commoner', monsterId: 'tough', shared: true,
      wants: 'Her daughter back tonight. She will go down with the heroes whether they like it or not.',
      knows: 'Dilly ran after the last lamb at dusk two days ago. She found the blue ribbon at the lamb hole and went six feet down the barn hole before something spat at her.',
      voice: 'Short, flat sentences. Swears by the weather ("hail and rot"). Never says "if", only "when we find her".',
      appearance: 'A rangy woman muddy to the knees, her forearm wrapped in vinegar-stained bandages, a pitchfork always in reach.',
      gmNotes: 'Uses the tough stat block. Brave but no fighter in the dark; she is best used holding a rope or carrying Dilly out.',
    },
    {
      id: 'pf_hfhdilly', name: 'Dilly Okeshott', title: 'missing, and very cross about it', kind: 'npc', art: 'child',
      wants: 'Home, a bath, a pie, and for every grown-up to admit she was right about the big bugs.',
      knows: 'The way through the granary. That banging the bins brings "the diggers". That the "big one" lays eggs in the hot room past the egg rows. And that she watched the hat man ring a bell and throw meat down a hole from the bars.',
      voice: 'A loud whisper. Very matter-of-fact. Has named every bug (Crunch, Mister Stab, Auntie Pinchy) and the Broodmother is "the Mum one".',
      appearance: 'A tiny girl caked grey with dust, one shoe, wearing a dwarven grain scoop as a helmet and carrying a dwarven sack-hook as a weapon.',
      gmNotes: 'Dilly is the best witness against Mabbot: she saw him at the feeding pen bars before she fell. She will say so to anyone, loudly. If she is with the party, she can lead them by the shortest way to anywhere in the granary.',
    },
    {
      id: 'pf_hfhferris', name: 'Ferris Mabbot', title: 'grain factor and land buyer', kind: 'npc', art: 'merchant', monsterId: 'spy', shared: true,
      wants: 'Every acre of Harrowfield, and above all the sealed seed vault under Long Acre, which he is sure is full of dwarven gold.',
      knows: 'Everything: the colony, the bell, the pen, the survey, the debts. He does not know the vault is mostly seed.',
      voice: 'Warm and reasonable. Calls everyone "friend". Talks about money as if it were kindness: "I am only trying to help you out of a hole."',
      appearance: 'A neat man in a green coat and a tall felt hat with a pheasant feather. His boots are spotless on a muddy farm, which is the first thing wrong with him.',
      backstory: 'A failed miller\'s son who swore he would own the fields his father ground for. Clever with debts, hopeless with people, and lately, sleepless.',
      gmNotes: 'Uses the spy stat block. He did not mean the child to be taken, and the news shook him (DC 13 Insight sees he is frightened, not sorry). Shown proof, he tries to buy the heroes off (50 gp each and "a share"), then runs for his wagon. Cornered, he fights only to escape. With Dilly or Bodger accusing him in front of the farmers, he folds.',
    },
    {
      id: 'pf_hfhbodger', name: 'Bodger Haddow', title: 'Mabbot\'s drover', kind: 'npc', art: 'thug', monsterId: 'thug',
      wants: 'To be paid and gone before anyone finds out. Mostly, for someone to tell him the little girl is alive.',
      knows: 'The feeding schedule, the three rings of the bell, the secret door in the cellar, where the ledger hangs, and that Mabbot keeps the debt notes in his strongbox.',
      voice: 'Mumbles. Scratches his neck. Says "weren\'t me" before anyone has accused him of anything.',
      appearance: 'A huge round-shouldered man in a blood-stiff leather apron. Flies follow him everywhere.',
      gmNotes: 'A DC 13 Persuasion or Intimidation turns him (advantage if the heroes say Dilly is alive, or show her ribbon). Turned, he hands over the trapdoor key, stops ringing the bell, and will testify in front of the farmers.',
    },
    {
      id: 'pf_hfhida', name: 'Ida Gubbins', title: 'county molecatcher', kind: 'npc', art: 'hunter', monsterId: 'scout', shared: true,
      wants: 'Paying, in coin and pie. And to prove to the whole county that these are not moles.',
      knows: 'Ankhegs feel footsteps through the ground and come to drumming; they hate fire and fresh smoke; they have burrowed under the barn and come up in the big sinkhole. She has smelled offal along the burrows: "Somebody\'s feeding \'em, and it ain\'t me."',
      voice: 'Cackles. Talks to the earth ("there you are, my lovely"). Rattles a bag of iron traps when she is thinking.',
      appearance: 'A bent old woman in a leather apron hung with dried moles, carrying a pick and a brass ear trumpet she presses to the ground.',
      gmNotes: 'Uses the scout stat block. A useful guide: with her ear trumpet she can tell which tunnels are empty. She will not go further down than the sinkhole cave ("I catch moles, not monsters").',
    },
    {
      id: 'pf_hfhgrindmaw', name: 'Old Grindmaw', title: 'the Broodmother', kind: 'monster', art: 'ankheg', monsterId: 'ankhegBroodmother',
      wants: 'Food, warmth, and her forty eggs safe.',
      knows: 'Only the shaking of the ground, and the sound of a brass bell that means meat.',
      voice: 'Mandibles clicking like a slow loom, and a low grinding, like a millstone turning on nothing.',
      appearance: 'An ankheg the size of a hay wagon, her shell scarred white with old acid burns, her body swollen with eggs.',
      gmNotes: 'Uses the Ankheg Broodmother stat block (66 hit points). She never leaves the brood chamber. If the sluice flooded the chamber she begins the fight with 15 damage and her speed is halved. She will not cross burning ground.',
    },
  ],
  handouts: [
    { id: 'mabbot-offer', title: 'A letter nailed to the barn door', text: 'To Wendel Okeshott, Long Acre and steading.\n\nFriend, I am sorry for your trouble. Ground that swallows cows is worth very little, and less each week.\n\nI will pay forty gold crowns for the lot, your debt forgiven, before Harvest-end. After that I cannot help you.\n\nYour friend in hard times,\nF. Mabbot, Grain Factor\n\n(Underneath, in a different hand: NO. And a large spit stain.)' },
    { id: 'feed-ledger', title: "Bodger's feeding tally", text: 'LONG ACRE RUN\n1st night: 3 bbl offal down the bars. Bell x3. Two big ones came.\n4th night: 1 lamb (Okeshott). Bell x3. Three came.\n9th night: 2 bbl. Laid the trail west to the old stones like he said. They are digging west now.\n14th night: cow from the Fenner place, left in the wheat.\n16th night: NO FEEDING. Girl missing.\n17th night: F.M. says keep on. Bell x3.\n— B.H.' },
    { id: 'dwarf-survey', title: 'A copied dwarven survey, with notes', text: 'GRANARY OF CLAN KORVALD. Bread for the hard winters.\nThe seed hall is sealed with the clan word. What the field gives, the stone keeps.\nThe water-gate: three turns of the wheel send the stream into the low galleries, to drown vermin.\n\n(in the margin, in neat ink:) Seed hall = treasure vault? GOLD? Under Long Acre, west side. Need diggers. — F.M.' },
    { id: 'dilly-scrawl', title: 'Chalk on a granary pillar', text: 'DILLY OKESHOTT WAS HERE\nI AM NOT DEAD\nTHE BIG BUGS COME IF YOU BANG THE BINS\nDONT BANG THE BINS\nTHE HAT MAN FEEDS THEM I SAW\nthe glowing mushrooms are BAD (the purple ones)\nI AM IN THE LITTLE ROOM UP THE CHUTE\nMum dont be cross' },
  ],
  chapters: [
    {
      id: 'harrowfield', title: 'Harrowfield and the Hollow Beneath', level: 3,
      summary: 'A farm at dusk with the ground falling in, and below it the burrows of an ankheg colony that has moved into an ancient dwarven granary. Somewhere down there is a lost child, a laying Broodmother, and a feeding pen that leads straight back to the man who wants to buy the farm.',
      goal: 'Find Dilly Okeshott alive, stop the colony before the eggs hatch, and prove who has been feeding it.',
      map: harrowfield,
      npcs: [
        { npc: 'pf_hfhwendel', x: 8, y: 15 },
        { npc: 'pf_hfhjessamy', x: 14, y: 8 },
        { npc: 'pf_hfhida', x: 26, y: 7 },
        { npc: 'pf_hfhferris', x: 69, y: 12 },
        { npc: 'pf_hfhbodger', x: 70, y: 38, hidden: true },
        { npc: 'pf_hfhdilly', x: 18, y: 35, hidden: true },
        { npc: 'pf_hfhgrindmaw', x: 53, y: 68, hidden: true },
      ],
      scenes: [
        {
          room: 'Okeshott farmhouse', title: 'Supper nobody eats',
          read: 'The farmhouse door opens before you knock. An old man with a fowling piece looks you up and down. "Now then," he says. "If you\'ve come to buy, you can go back down the lane. If you\'ve come to dig, there\'s stew."',
          gm: 'Wendel and Jessamy tell what they know: the holes, the cows, Dilly and the lamb, the barn hole. Show Mabbot\'s letter (handout). Dilly\'s drawings in her room hint at the hat man. Jessamy wants to go down at once. Keep this to fifteen minutes and get the heroes outside.',
          handout: 'mabbot-offer',
        },
        {
          room: 'Sheep pasture', title: 'The molecatcher',
          read: 'An old woman is lying flat in the pasture with a brass trumpet pressed to the ground. "Hush," she says, without looking up. "They\'re singing."',
          gm: 'Ida Gubbins explains ankhegs in plain words: they feel your footsteps, they come to drumming, they hate fire. She knows the barn hole and the big sinkhole are ways in, and she has smelled offal in the burrows: someone is feeding them. The lamb hole is too narrow for adults, but a Small hero can squeeze through (DC 12 Athletics) into the larder burrow.',
        },
        {
          room: 'Long Acre', title: 'Something in the wheat', encounter: 'Ankheg in the wheat',
          read: 'The wheat goes quiet. Then, thirty feet away, the stalks part in a long straight line, coming toward you fast, and the ground under your boots begins to hum.',
          gm: 'An ankheg hunting at dusk. It bursts up under whoever made the most noise. Heroes who stuck to the cart track or crept are not noticed. If the ankheg drops below half its hit points it dives and flees to the sinkhole. The trampled ring nearby holds the bait cow and the bell clapper: the first real clue.',
          treasure: 'In the trampled ring: a brass bell clapper stamped with a wheatsheaf (Mabbot\'s mark).',
        },
        {
          room: 'Mill yard', title: "Mabbot's mill", optional: true, encounter: "Mabbot's drovers",
          read: 'A man in a tall hat hurries across the yard to shake your hand. "You must be the heroes! Terrible business. Terrible. Anything I can do, friend, anything at all."',
          gm: 'Mabbot is charm itself and refuses entry to the mill ("unsafe floor"). The offal wagon, the fleeces in the hedge corner and the survey in his lodging are all here for sneaky heroes (DC 13 Stealth past the dogs, or distract the drovers). A fight breaks out only if the heroes start it or are caught breaking in; Mabbot runs at the first blood. If the heroes leave peacefully, Mabbot sends Bodger down to the pen to "feed early", hoping the bugs will deal with the problem.',
          handout: 'dwarf-survey',
          treasure: 'In Mabbot\'s strongbox: 140 gp, a silver signet ring (25 gp), and the debt notes for every farm in Harrowfield.',
        },
        {
          room: 'Larder burrow', title: 'Into the hollow', encounter: 'The larder',
          read: 'You drop into darkness that stinks of vinegar and rot. Your light shows a heap of dead animals, glistening, and on top of the heap a hundred little eyes turn red.',
          gm: 'The way down from the barn (or the lamb hole). Rats defend their feast; a burning torch thrown on the pile scatters the swarms for a round. Dilly\'s shoe and footprints show she escaped south toward the granary. Tunnels lead west to the farmhouse cellar, south to the granary and east to the cow jam.',
          treasure: 'In the heap: a farmhand\'s purse (14 sp, 3 gp) and a potion of healing in a cracked leather case.',
        },
        {
          room: 'Korvald granary', title: 'The Korvald granary', encounter: 'Diggers in the granary',
          read: 'Stone pillars carved with wheat sheaves march away into the dark. Somewhere among them, stone grinds against stone, and acid hisses.',
          gm: 'Two ankhegs are chewing at the south wall toward the seed vault. Creeping between the pillars (DC 12 group Stealth) avoids them; banging a bin draws them anywhere in the hall, which clever heroes can use to pull them away. Dilly\'s chalk message (handout) points to the chute. The sealed seed vault needs the word "seed", thieves\' tools (DC 15) or a DC 18 Strength.',
          handout: 'dilly-scrawl',
          treasure: 'In the seed vault: 220 gp in square dwarven coins, a silver sickle (50 gp), a +1 war pick wrapped in oiled cloth, a Driftglobe, and forty jars of seed wheat that ankhegs will not eat. In the bins: stonebread enough for a month.',
        },
        {
          room: 'Chute loft', title: 'Dilly in the chute',
          read: 'From the top of the chute a small, furious voice hisses: "If you\'re the hat man I\'ve got a hook and I will HOOK you."',
          gm: 'Dilly is tired, thirsty and fine. She comes out for anyone who names her mum or gran, shows her ribbon, or makes her laugh. She tells what she saw (the hat man, the bell, the bars) and knows the way to the egg rows. She will not stay behind: "I know where everything is and you don\'t." Getting her to the surface is a scene in itself if the diggers are still about.',
        },
        {
          room: 'Sluice house', title: 'The water-gate', optional: true,
          read: 'A rusted iron wheel stands taller than you are, beside a stone gate that hangs above the roaring stream. Carved on the wall above it, a little stone dwarf is shown turning the wheel while rats flee from rising water.',
          gm: 'Three turns of the wheel (DC 15 Strength, or two heroes at DC 12, 1 minute) flood the low galleries ten minutes later. The eggs drown and the Broodmother is weakened (see her notes). If the heroes found the survey (handout) they know this; otherwise the carving tells it plainly enough. A loose carved dwarf on the bridge hides a little reward.',
          treasure: 'In the bridge niche: a silver flask of dwarven spirit (10 gp).',
        },
        {
          room: 'Feeding pen', title: 'Feeding time', encounter: 'Feeding time',
          read: 'Lantern light, the stink of blood, and a big man in an apron frozen with a bucket halfway to the bars. His eyes go to the brass bell on its post. "Weren\'t me," he says.',
          gm: 'Reached from the windmill cellar (secret door, DC 13) or from below up the feeding run (the barred gate is locked; Bodger has the key). If Bodger reaches the bell he rings it, and an ankheg comes up the run in 2 rounds, with rats following the blood. Bodger can be turned (DC 13, advantage if Dilly is alive); then only the other drover fights. Bodger\'s tally (handout) hangs in the cellar above. Take the bell: it is the proof.',
          handout: 'feed-ledger',
          treasure: 'Bodger\'s purse: 22 gp, all Mabbot\'s pay. The trapdoor key.',
        },
        {
          room: 'Egg gallery', title: 'The egg rows', encounter: 'Egg tenders',
          read: 'Row on row of grey eggs steam in the hot mud. An ankheg stands among them, feelers raised, facing two huge spiders creeping down the wall.',
          gm: 'A three-way standoff. Wait, and the spiders and the egg-tender fight each other for 2 rounds before anyone notices the heroes. Smashing eggs draws the Broodmother on the third round of noise. Fire spreads fast among the husks: a fun way to end the egg rows, and a dangerous one in a tunnel.',
        },
        {
          room: 'Brood chamber', title: 'Old Grindmaw', encounter: 'The Broodmother',
          read: 'Heat rolls over you like an open oven. In the middle of the chamber, curled round a hill of eggs, something the size of a hay wagon lifts its head, and its mandibles open wide enough to swallow a calf.',
          gm: 'The climax. Old Grindmaw and two ankhegs. She fights to the death over her eggs; the others flee when she falls. Flooding from the sluice changes the fight (see her notes). The heroes can also win by destroying the egg mound (fire, oil, or 30 damage) and escaping: without eggs, the colony scatters back to the hills within a week, so long as the feeding stops.',
          treasure: 'Behind the egg mound, among the dragged-down dead: 60 gp and 300 sp in a rotted saddlebag, a +1 shield with a melted rim, and 2 potions of healing.',
        },
        {
          room: 'Farmyard', title: 'Reckoning at Harvest-end',
          read: 'The farmers of Harrowfield fill the Okeshott yard by lantern light, angry and frightened. Ferris Mabbot stands on the cart, hat in hand, ready to make them all a generous offer.',
          gm: 'The heroes lay out their proof. Each piece the farmers see (the bell, the ledger, the fleeces, the survey, Bodger, and above all Dilly pointing and shouting "HIM!") turns the crowd. With two pieces they doubt him; with three they seize him. Mabbot tries to bribe, then to run for his wagon (a chase across the yard). The debt notes in his strongbox go back to their farmers, torn up or not, as the heroes decide.',
        },
      ],
      wrapUp:
        'With the Broodmother dead or her eggs drowned and the feeding stopped, the colony thins and leaves within a month. Mabbot is handed to the shire reeve with his ledger tied round his neck. The Okeshotts throw the biggest supper Harrowfield has seen, and Dilly tells the story so many times that the bugs get bigger every time. The heroes reach level 4.',
    },
  ],
  ending:
    'Good ending: Dilly is home, the eggs are gone, Mabbot is exposed, and the farmers get their debts back. Next spring Wendel plants the dwarven seed in Long Acre, and nothing burrows under it ever again. Bad ending: if the eggs hatch, forty young ankhegs spread under the valley; by spring Harrowfield is a field of sinkholes, and Mabbot, if he escaped, buys it for pennies and digs his vault in peace. Either way, there is the question of the seed hall\'s other door: the survey mentions "the low galleries", and Clan Korvald stored more than bread. What else did they keep under the fields, and why did they seal it?',
};
