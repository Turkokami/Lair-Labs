// The Hollow Orchard: a one-session folk horror adventure for four heroes of level 3.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function marrowellFarm() {
  const b = new MapBuilder('adv-hollow-orchard', 'Marrowell Farm at harvest', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });
  const r = rng(4417);

  // ---------- Crookback Hill: solid ground in the north, with the hag's tunnels inside it ----------
  b.rock(0, 0, 80, 24);
  b.rock(0, 24, 8, 2).rock(24, 24, 8, 1).rock(46, 24, 8, 1).rock(66, 24, 6, 1);

  // ---------- the lane, the farmyard and the farmhouse (south-west) ----------
  b.paint(0, 69, 27, 3, 'dirt').paint(25, 71, 2, 4, 'dirt').paint(25, 74, 4, 2, 'dirt').paint(33, 74, 47, 2, 'dirt');
  b.area('Valley lane', [[0, 68, 8, 4]], {
    read: 'A rutted lane drops into a quiet valley at dusk. The air is thick with the smell of apples, sweet and a little rotten, and every tree you can see is bowed under fruit.',
    gm: 'The heroes arrive here. Fallen apples cover the lane, far too many for late autumn. Foreman Abel Sedge waits at the gate with a lantern and walks them to the bunkhouse.',
    label: [3, 70],
  });
  b.prop('signpost', 5, 68).prop('milestone', 1, 72).prop('fence-gate', 7, 70, 90).props_('fence-wood', [[7, 68], [7, 72]], 90).props_('sack', [[4, 71]]);
  b.start(1, 69, 3, 3);

  b.area('Farmyard', [[6, 61, 22, 8]], {
    read: 'Hens fuss in a coop, a cart sags under baskets of red apples, and the well rope creaks in the wind. Lamplight glows in the farmhouse windows.',
    gm: 'The heart of the farm. Apples picked this morning are already piled higher than yesterday\'s. A DC 12 Perception spots small bare footprints in the mud that lead from the well to the farmhouse door, and smell faintly of pond water.',
    label: [17, 65],
  });
  b.paint(10, 62, 16, 6, 'dirt');
  b.prop('well', 18, 64).prop('lamp-post', 15, 62).prop('chicken-coop', 9, 64).prop('firewood', 24, 62).prop('wagon', 22, 66, 90).prop('water-trough', 12, 67).prop('hitching-post', 26, 64).props_('produce-crates', [[20, 66], [21, 67]]).prop('handcart', 7, 62).prop('butcher-block', 26, 67);
  b.light(15, 62, 15, 20);

  b.building('Marrowell farmhouse', 8, 50, 14, 11, {
    mat: 'wood-planks',
    read: 'A low, warm kitchen smelling of baked apples and woodsmoke. A table is laid for supper, with one extra place set very carefully, as if for a guest of honour.',
    gm: 'Hester Marrowell\'s home. The extra place is for her son Tobin, who drowned last spring and now sits at her table every night. A DC 13 Insight shows Hester is terrified of being asked about him.',
    doors: [[14, 60, 's', 'closed'], [21, 57, 'e', 'closed']],
    windows: [[8, 57, 'w'], [17, 60, 's'], [21, 52, 'e'], [11, 50, 'n']],
  });
  b.wallRun(8, 54, 14, 's').wallRun(14, 50, 5, 'e').door(11, 54, 's', 'closed').door(18, 54, 's', 'closed');
  b.area("Hester's room", [[8, 50, 7, 5]], {
    read: 'A narrow bed, a black dress on a hook, and a man\'s coat folded on the pillow beside hers.',
    gm: 'Rowan Marrowell\'s coat (he died two winters ago of a fever). Under the mattress (DC 12 Investigation): a dried apple bound with black hair and red thread. This is the bargain-token. Burned or cut open in front of Hester, it breaks her resolve (see Hester).',
  });
  b.prop('bed', 9, 51).prop('wardrobe', 13, 51).prop('dresser', 9, 53).prop('coat-rack', 13, 53);
  b.area("Tobin's room", [[15, 50, 7, 5]], {
    read: 'A child\'s room kept spotless. Wooden animals march along the windowsill. The bed is made, but the pillow is damp, and there are apple pips scattered on it like seeds.',
    gm: 'Tobin sleeps here, if he sleeps. A drawing pinned over the bed (handout) was made before he drowned: a tall green lady in a tree. The pips on the pillow are fresh every morning.',
  });
  b.prop('bed', 16, 51).prop('crib', 20, 51).prop('chest', 19, 53).prop('rug-round', 17, 52).prop('candles', 15, 53);
  b.prop('kitchen-table', 13, 57).props_('chair', [[12, 57], [14, 57], [13, 56], [13, 58]]).prop('hearth-oven', 9, 55).prop('pot-rack', 10, 55).prop('rocking-chair', 18, 58).prop('shelf-jars', 20, 55).prop('washbasin', 9, 59).prop('rug-runner', 16, 57).prop('herbs-drying', 11, 55);
  b.light(9, 56, 15, 20).light(13, 57, 5, 10);

  b.area('Kitchen garden', [[1, 50, 6, 10]], {
    read: 'Rows of cabbages and leeks behind a low fence. In the middle stands a scarecrow in a patched blue coat, its sack face turned toward the farmhouse.',
    gm: 'This is Old Tatters, the first scarecrow Rowan ever made. He is not like the others: he moves only when no one looks, and he is trying to protect the family. If the heroes speak kindly to him at dusk he answers in a rustle (see Old Tatters).',
    label: [3, 55],
  });
  b.paint(1, 50, 6, 10, 'dirt');
  b.props_('crop-rows', [[2, 51], [2, 57], [5, 58]]).prop('scarecrow', 3, 54).prop('fence-wood', 6, 50, 90).prop('beehive', 1, 59).prop('flowers', 5, 51);

  b.building("Workers' bunkhouse", 4, 39, 12, 8, {
    mat: 'wood-planks-dark',
    read: 'Twelve bunks, and only five have blankets on them. A chalk board by the door lists the pickers\' names. Four have been rubbed out.',
    gm: 'Abel and Lark sleep here, with three nervous pickers who keep their boots on at night. Lark\'s tally board (handout) shows who went missing and when. The footlocker under Merry Ash\'s bunk is still packed: she did not run off.',
    doors: [[9, 46, 's', 'closed'], [15, 42, 'e', 'closed']],
    windows: [[4, 42, 'w'], [12, 39, 'n']],
  });
  b.props_('bunk-bed', [[5, 40], [7, 40], [9, 40], [5, 44], [7, 44]]).props_('footlocker', [[6, 42], [8, 42]]).prop('table-long', 11, 43).props_('stool', [[10, 44], [12, 44]]).prop('stove', 14, 40).prop('notice-board', 10, 45).prop('lantern-hanging', 11, 42).prop('coat-rack', 14, 45);
  b.light(14, 40, 10, 15).light(11, 42, 10, 15);

  b.building('Smokehouse', 19, 40, 6, 5, {
    mat: 'dirt',
    read: 'Hams and strings of sausage hang in a fug of hickory smoke.',
    gm: 'Plenty of meat. A ham or two thrown to the wolves in the windbreak wood keeps them off (they are starving because the hag has driven the deer away).',
    doors: [[21, 44, 's', 'closed']],
  });
  b.props_('chains-hanging', [[20, 41], [23, 41]]).prop('campfire-cold', 21, 42).prop('log-pile', 23, 43);
  b.props_('log-pile', [[17, 47]]).prop('stump', 18, 48).prop('hay-bale', 24, 47);

  // ---------- the millpond, the drowned way and the brook ----------
  b.pool(18, 32, 8, 5, true);
  b.water(16, 18, 2, 10, true);
  b.floor(22, 32, 5, 2, 'wood-planks');
  b.mud(26, 29, 2, 5).mud(9, 28, 2, 3);
  b.area('Millpond', [[11, 28, 15, 9]], {
    read: 'A round black pond lies at the foot of the hill, flat as glass. A little jetty pokes out into it. Over the water leans a willow, and something small and pale is tied in its branches.',
    gm: 'Tobin drowned here in spring. The pale thing in the willow is a witch-knot (one of three): cut it down and burn it to weaken the hag. At dusk a cold light bobs over the deep water and two giant frogs lurk in the reeds. Searching the jetty (DC 11) finds a child\'s boot.',
    label: [18, 32],
  });
  b.prop('dock-pier', 24, 32).prop('rowboat', 20, 33, 90).props_('tree-willow', [[9, 31], [24, 28]]).props_('reeds', [[11, 35], [25, 36], [12, 28]]).props_('lily-pads', [[15, 30], [21, 35]]).prop('fishing-gear', 26, 33).prop('gm-treasure', 24, 28, 0, { gm: true });
  b.light(18, 31, 5, 20, '#a8f0d0');
  b.encounter('Lights on the millpond', [10, 26, 17, 11], [['willOWisp', 1], ['giantFrog', 2]], 'low');
  b.area('The drowned way', [[16, 19, 2, 8]], {
    gm: 'A flooded root channel from the pond\'s north edge into the hill. Thirty feet underwater in the dark: DC 10 Athletics to swim it, or 1 level of exhaustion from cold. It comes up in the drowned grotto.',
    label: [16, 24],
  });
  b.note(16, 26, 'The drowned way: swim north under the hill to the drowned grotto.');

  b.water(26, 35, 5, 2).water(30, 35, 2, 9, true).water(29, 44, 4, 3).water(31, 47, 2, 10, true).water(31, 59, 2, 7, true).water(30, 66, 2, 8, true).water(29, 74, 4, 3).water(30, 77, 2, 3, true);
  b.floor(29, 57, 5, 2, 'wood-planks');
  b.area('Stepping stones', [[26, 35, 5, 2]], { read: 'Flat stones cross the pond\'s outflow, slick with weed.', gm: 'DC 10 Acrobatics or fall in (prone, soaked). The quick way from the pond to the orchard.', label: [28, 35] });
  b.props_('boulder', [[27, 35], [29, 36]]);
  b.area('The ford', [[29, 44, 4, 3]], { read: 'The brook spreads wide and shallow here over yellow gravel.', gm: 'Waist deep on a child, knee deep on an adult. Difficult ground.', label: [30, 45] });
  b.prop('reeds', 32, 46);
  b.area('Plank bridge', [[29, 57, 5, 2]], { read: 'A plank bridge with a rope rail crosses the brook to the cider barn.', gm: 'The main way across. The brook runs deep and cold on either side.', label: [31, 57] });
  b.prop('bridge-plank', 31, 57, 90).prop('lantern-standing', 33, 58).light(33, 58, 10, 15);
  b.paint(22, 57, 7, 2, 'dirt').paint(24, 59, 2, 3, 'dirt').paint(34, 57, 2, 2, 'dirt');

  // ---------- the cider barn and press ----------
  b.building('Cider barn', 36, 54, 18, 12, {
    mat: 'wood-planks-dark',
    read: 'The great cider press creaks round and round on its own, though no one is pushing the bar. Juice runs gold into the troughs, and the whole barn hums with wasps and sweetness.',
    gm: 'The second witch-knot is wound round the press screw (DC 12 Perception to notice it in the shadow; DC 12 Strength to stop the press, or wedge it with a beam). While it turns, the orchard keeps ripening. Cutting the knot stops the press for good.',
    doors: [[36, 57, 'w', 'closed', 'door-double'], [36, 58, 'w', 'closed', 'door-double'], [41, 54, 'n', 'closed'], [53, 60, 'e', 'closed']],
    windows: [[44, 65, 's'], [36, 62, 'w']],
  });
  b.wallRun(46, 54, 12, 'e').door(46, 59, 'e', 'closed').door(46, 60, 'e', 'closed');
  b.prop('grindstone', 41, 59).prop('winch', 40, 60).props_('barrel-group', [[37, 55], [44, 55]]).prop('barrel-stack', 37, 63).prop('workbench', 44, 63).prop('tool-wall', 45, 56).prop('stairs-up', 38, 64).prop('flour-sacks', 43, 61).prop('lantern-hanging', 41, 57).prop('gm-trap', 41, 59, 0, { gm: true });
  b.light(41, 57, 15, 20);
  b.area('Vat room', [[47, 54, 7, 12]], {
    read: 'Six huge oak vats stand in a row, each taller than a man. The air stings your eyes. One vat has a lid weighted down with stones, and the lid is moving.',
    gm: 'The weighted vat holds a mother of vinegar that has grown monstrous on the hag\'s magic (ochre jelly). Leave the lid on and it stays put. Open it, or bang about, and it climbs out. Hester\'s medicine chest sits on the shelf by the door.',
    label: [50, 59],
  });
  b.props_('barrel-stack', [[48, 55], [51, 55], [48, 58], [51, 62]]).prop('cauldron', 50, 64).prop('keg-rack', 52, 57).prop('chest', 52, 64);
  b.encounter('Mother of vinegar', [47, 55, 6, 10], [['ochreJelly', 1]], 'low');
  b.area('Apple yard', [[36, 66, 18, 5]], {
    read: 'Crates of apples stand stacked against the barn wall, and more are being added by no one at all. Wasps drone over a heap of windfalls.',
    gm: 'A DC 13 Perception at dusk: something small and rustling carries apples out of the orchard and stacks them here, then scuttles back (a straw-stuffed rat, harmless on its own).',
    label: [44, 68],
  });
  b.props_('crate-pile', [[37, 67], [52, 67]]).props_('produce-crates', [[40, 66], [41, 66], [49, 67]]).prop('cart', 45, 68, 90).prop('hay-bale', 38, 69).prop('merchant-cart', 50, 69).prop('beehive', 53, 70);
  b.paint(54, 60, 6, 2, 'dirt').paint(58, 62, 2, 3, 'dirt');

  // ---------- the orchard ----------
  b.area('Upper orchard', [[33, 29, 14, 21]], {
    read: 'Row after row of old apple trees, their branches propped on poles under the weight of fruit. Picking ladders lean where they were dropped. It is very quiet.',
    gm: 'The safe part of the orchard, mostly. Lark has tied red ribbons along a path through it (she knows it as "the ribbon row"). Following the ribbons keeps the walking rows from closing in. Ripe apples fall with a thump every few seconds, all night.',
    label: [39, 40],
  });
  for (const y of [30, 34, 38, 42, 46, 50]) {
    for (let x = 34; x <= 61; x += 3) {
      if (x >= 51 && x <= 58 && y >= 45 && y <= 49) continue;
      if (r() < 0.12) continue;
      b.prop(x >= 48 && y <= 41 && r() < 0.4 ? 'tree-dead' : 'tree-oak', x, y);
    }
  }
  b.props_('ladder', [[36, 32], [42, 44]]).props_('sack', [[35, 36], [44, 40], [38, 48]]).props_('produce-crates', [[40, 36], [43, 48]]).prop('grass-tall', 46, 33).props_('banner-pole', [[37, 31], [40, 35], [43, 39], [45, 43]]);
  b.area('The walking rows', [[48, 27, 14, 15]], {
    read: 'The trees here are older and more crooked, and the rows do not run straight. You are sure that the gap you came through was on your left a moment ago.',
    gm: 'Two awakened apple trees shift about to cut off whoever wanders in. Without the ribbons or Old Tatters to guide them, the heroes must make a DC 13 Wisdom (Survival) check to find their way out, or blunder into the trees. Fire makes the trees flinch back. Old Garth\'s body lies at the heart of the rows.',
    label: [54, 33],
  });
  b.wallRun(47, 27, 5, 'e', 'low').wallRun(47, 34, 5, 'e', 'low').wallRun(47, 41, 4, 'e', 'low');
  b.wallRun(49, 31, 6, 's', 'low').wallRun(56, 31, 5, 's', 'low').wallRun(48, 35, 4, 's', 'low').wallRun(53, 35, 8, 's', 'low').wallRun(50, 38, 10, 's', 'low');
  b.props_('brambles', [[50, 29], [58, 33], [52, 37]]).prop('obscuring-cloud', 55, 36).prop('skeleton-lying', 56, 37).prop('backpack', 57, 37).prop('mushrooms', 49, 40);
  b.encounter('The walking rows', [48, 27, 14, 15], [['awakenedTree', 2]], 'moderate');
  b.building('Picking shed', 52, 45, 6, 4, {
    read: 'A lean-to shed full of baskets, poles and a cold brazier. Someone left a lantern burning here and never came back for it.',
    gm: 'A good place to rest. Dunstan Rook\'s lantern hangs on the hook. A DC 12 Survival outside finds drag marks leading north toward Old Crookback.',
    doors: [[54, 48, 's', 'open']],
  });
  b.props_('sack', [[53, 46], [56, 46]]).prop('lantern-hook', 55, 46).prop('workbench', 53, 47).light(55, 46, 5, 10);

  b.area('Old Crookback', [[35, 24, 11, 5]], {
    read: 'At the foot of the hill stands the oldest apple tree you have ever seen, its trunk as wide as a cottage and grown right into the hillside. Its roots grip the ground like a great hand. A dark knot-hole yawns in the trunk, big enough to walk through, and it smells of earth and pond water.',
    gm: 'The front door to the hag\'s hollow. The knot-hole looks like plain wood from outside: it opens only to someone who says "I have come for my share" (Hester knows this), or to a DC 15 Investigation and a DC 13 Strength to force it. Forcing it warns the hag. Fresh drag marks end at the trunk.',
    label: [40, 26],
  });
  b.prop('tree-oak', 40, 25).props_('log-fallen', [[36, 26], [44, 26]]).props_('stump', [[38, 27], [43, 27]]).prop('mushrooms', 37, 25).prop('brambles', 42, 27).prop('gm-secret-door', 40, 24, 0, { gm: true });
  b.door(40, 23, 's', 'secret');

  // ---------- the windbreak wood and the scarecrow field (east) ----------
  b.area('Windbreak wood', [[64, 26, 16, 11]], {
    read: 'A belt of dark pines shelters the orchard from the east wind. Bones lie under the trees, picked clean, and eyes shine in the gloom.',
    gm: 'Four starving wolves and their grey leader. They are hungry, not wicked: a ham from the smokehouse or a DC 13 Animal Handling sends them off. A fight here is noisy and draws the scarecrows over at dusk.',
    label: [70, 31],
  });
  for (let i = 0; i < 26; i++) {
    const x = 64 + Math.floor(r() * 16), y = 25 + Math.floor(r() * 12);
    if (x >= 74 && y <= 28) continue;
    b.prop(r() < 0.7 ? 'tree-pine' : 'tree-birch', x, y);
  }
  b.props_('bones', [[68, 30], [72, 34]]).prop('log-fallen', 66, 33).prop('brambles', 70, 27).prop('ferns', 65, 36);
  b.encounter('Wolves in the windbreak', [66, 26, 12, 10], [['wolf', 4], ['direWolf', 1]], 'low');
  b.area('Wolf den', [[74, 24, 6, 4]], {
    read: 'A hole under the hill, ringed with trampled earth and tufts of grey fur.',
    gm: 'The wolves\' den. A narrow crawl at the back (single file, squeezing) climbs into the hill and comes out in the rot cave. The wolves do not go in: the shrieking down there scares them.',
    label: [76, 26],
  });
  b.paint(74, 24, 6, 4, 'dirt').prop('bone-heap', 76, 25).prop('skull-pile', 78, 26);

  b.paint(64, 38, 16, 20, 'dirt');
  b.wallRun(63, 38, 8, 'e', 'low').wallRun(63, 48, 10, 'e', 'low');
  b.area('Scarecrow field', [[64, 38, 16, 20]], {
    read: 'A wheat field stripped to stubble, with sheaves stacked like little huts. Scarecrows stand all over it, far too many of them, and they all face the orchard. In the last of the light, one of them turns its head.',
    gm: 'At dusk the scarecrows walk. They are straw men stuffed with the hag\'s harvest, and rats nest in the straw. The tallest scarecrow, in the middle of the field, has the third witch-knot sewn into its chest (DC 11 Perception once it is torn open). Burning that knot drops every scarecrow where it stands.',
    label: [71, 47],
  });
  for (const [x, y] of [[66, 40], [70, 40], [74, 40], [78, 40], [66, 52], [70, 52], [74, 52], [78, 52], [66, 56], [74, 56]]) b.prop('crop-rows', x, y);
  b.props_('scarecrow', [[67, 42], [72, 43], [76, 45], [66, 48], [70, 50], [77, 50], [72, 46]]).props_('haystack', [[68, 45], [75, 42], [74, 54]]).props_('hay-bale', [[65, 55], [78, 47]]).prop('gm-treasure', 72, 46, 0, { gm: true });
  b.encounter('Scarecrows at dusk', [64, 40, 15, 14], [['awakenedShrub', 6], ['swarmOfRats', 3], ['giantRat', 4]], 'low');

  // ---------- the harvest chapel (south-east) ----------
  b.building('Harvest chapel', 60, 62, 10, 8, {
    mat: 'stone-flagstone',
    read: 'A whitewashed chapel hung with corn dollies and dried wreaths. Candles burn before a carved sheaf on the altar, and the floor is swept clean.',
    gm: 'Pell Ashby keeps the chapel. Rowan Marrowell\'s almanac sits on the lectern (handout): it tells how the first Marrowells kept the "old woman in the tree" asleep with a wassail every autumn, and how her power hangs in knots. Pell can bless a jug of cider as wassail: poured on Old Crookback\'s roots, it makes the hag\'s tree-servant sleep.',
    doors: [[64, 69, 's', 'closed', 'door-double'], [65, 69, 's', 'closed', 'door-double'], [60, 64, 'w', 'closed']],
    windows: [[69, 64, 'e'], [62, 62, 'n'], [67, 62, 'n']],
  });
  b.prop('altar', 64, 63).props_('pew', [[62, 65], [62, 67], [67, 65], [67, 67]]).props_('candles', [[63, 63], [66, 63]]).prop('lectern', 61, 63).prop('temple-bell', 68, 63).prop('herbs-drying', 61, 68).prop('offering-bowl', 65, 64);
  b.light(64, 63, 15, 20);
  b.area('Chapel yard', [[56, 70, 20, 4]], {
    read: 'Leaning headstones in long grass. One grave, small and new, has fallen in on itself: the earth is sunk into a hole, as if something pulled it down from below.',
    gm: 'Tobin\'s grave. A DC 12 Investigation finds thick roots running into the hole from the north, and an empty, burst coffin below. Rowan\'s grave lies beside it, undisturbed. Laying Tobin\'s bones back here, with Pell\'s blessing, breaks the hag\'s hold on the boy.',
    label: [64, 71],
  });
  b.prop('open-grave', 62, 72).prop('burial-slab', 64, 72).props_('cairn', [[58, 71], [70, 72]]).props_('standing-stone', [[73, 71]]).prop('tree-dead', 67, 71).prop('urn', 60, 72).prop('road-shrine', 66, 74).prop('flowers', 63, 71);

  b.area('Hives', [[71, 59, 8, 9]], {
    read: 'A dozen straw beehives on stands, humming loudly for so late in the year.',
    gm: 'Bees will not go near a hag. A hero who watches them (DC 12 Nature) notices they never fly north of the brook toward Old Crookback.',
    label: [74, 63],
  });
  b.props_('beehive', [[72, 60], [74, 60], [76, 60], [72, 63], [74, 63], [76, 63], [78, 65]]).props_('flowers', [[73, 66], [77, 61]]);

  b.area('Hay meadow', [[0, 74, 24, 6]], {
    read: 'Rough meadow running down to the valley mouth, dotted with old haystacks.',
    gm: 'Nothing here but mice and a fox. A good place to talk where the farmhouse cannot hear.',
    label: [10, 77],
  });
  b.props_('haystack', [[5, 76], [14, 77], [20, 75]]).props_('tree-birch', [[2, 78], [22, 78]]).prop('grass-tall', 10, 75);

  // ---------- under the hill ----------
  b.building('Root cellar', 57, 19, 9, 5, {
    mat: 'stone-flagstone',
    read: 'Stone shelves dug into the hillside, packed with jars and bins of apples. The back wall bulges, and pale roots as thick as your arm have pushed between the stones.',
    gm: 'The farm\'s root cellar. The west wall is a false wall of shelves that the hag pushed aside long ago (DC 13 Perception, or follow the drag marks in the dust): behind it, root tunnels lead to the hollow. An east door, swollen shut (DC 12 Strength), opens on a tunnel to the rot cave.',
    doors: [[61, 23, 's', 'closed'], [57, 21, 'w', 'secret'], [65, 20, 'e', 'locked']],
  });
  b.props_('shelf-jars', [[58, 20], [60, 20], [62, 20]]).props_('barrel', [[64, 22], [58, 22]]).prop('produce-crates', 63, 20).prop('stairs-up', 61, 22).prop('gm-secret-door', 57, 21, 0, { gm: true });
  b.tunnel([[56, 21], [50, 19], [44, 15], [40, 13]], 1, { mat: 'dirt', seed: 71 });
  b.area('Root tunnels', [[47, 16, 9, 5]], {
    read: 'A low, twisting passage of packed earth, laced with roots that twitch when your light touches them.',
    gm: 'The quiet back way into the hollow. Squeezing through takes time; a DC 12 group Stealth check lets the heroes arrive unnoticed and act first.',
    label: [51, 19],
  });
  b.props_('mud-patch', [[53, 20]]).prop('spider-web', 47, 17);
  b.tunnel([[66, 20], [69, 16]], 1, { mat: 'cave-floor', seed: 72 });

  b.cave('Rot cave', 71, 15, 5, 3, {
    seed: 73, mat: 'cave-floor',
    read: 'A damp cave furred with mould. Great mushrooms glow a sick violet, and the smell of rotten apples is so thick you can taste it.',
    gm: 'Where the hag dumps the cores of her harvest. Four violet fungi wait among harmless mushrooms, a shrieker screams at any light, and rat swarms boil out of the rot. The shriek warns the hag: she is ready when the heroes reach the hollow.',
  });
  b.props_('mushroom-giant', [[69, 14], [73, 16]]).props_('glowing-fungus', [[70, 16], [74, 14]]).props_('mold-patch', [[68, 15]]).prop('bones', 72, 13).light(71, 15, 5, 15, '#c08cff');
  b.encounter('Rot in the dark', [66, 12, 10, 7], [['violetFungus', 4], ['shriekerFungus', 1], ['swarmOfRats', 2]], 'low');
  b.tunnel([[77, 24], [77, 20], [72, 15]], 1, { mat: 'dirt', seed: 74 });

  b.tunnel([[66, 8], [69, 13]], 2, { mat: 'cave-floor', seed: 75 });
  b.cave('The larder', 60, 6, 6, 3.5, {
    seed: 76, mat: 'cave-floor',
    read: 'Roots hang from the ceiling like the ribs of a great animal. Between them dangle long bundles, wrapped tight in bark and leaves. One of the bundles is moaning.',
    gm: 'The hag\'s larder. Dunstan Rook and young Kit Sedge hang here alive, cocooned and feverish; Merry Ash and Old Garth did not survive. A knot of living roots (an awakened tree) guards them, with rats that feed on the scraps. Cutting a captive free takes an action (AC 10, 10 hit points of bark).',
  });
  b.props_('chains-hanging', [[57, 5], [60, 4], [63, 5]]).props_('cage-hanging', [[62, 7]]).props_('bone-heap', [[57, 7]]).prop('skull-pile', 64, 8).prop('gm-treasure', 63, 4, 0, { gm: true });
  b.light(60, 6, 5, 10, '#7fbf7f');
  b.encounter('The larder keepers', [53, 2, 15, 9], [['awakenedTree', 1], ['giantRat', 6], ['swarmOfRats', 3]], 'moderate');
  b.tunnel([[54, 6], [47, 8]], 2, { mat: 'cave-floor', seed: 77 });

  b.cave('Drowned grotto', 16, 13, 6, 4, {
    seed: 78, mat: 'cave-floor',
    read: 'You surface in a black pool inside the hill. On a shelf of rock above the water, someone has laid out small bones very carefully on a bed of moss, and tucked a carved wooden horse beside them.',
    gm: 'Tobin\'s real bones, stolen from his grave through the roots. The hag keeps them as the seed of her changeling. Carrying them out in a sack or cloak is easy; laying them back in the chapel yard frees the boy (see Tobin). The tunnel east leads to the hollow.',
  });
  b.pool(15, 15, 3, 2, true);
  b.prop('bones', 19, 11).prop('mushrooms', 12, 11).prop('stalactites', 21, 14).prop('gm-treasure', 20, 11, 0, { gm: true });
  b.tunnel([[22, 13], [30, 12]], 1, { mat: 'cave-floor', seed: 79 });

  b.cave("Mother Windfall's hollow", 38, 11, 9, 6, {
    seed: 80, mat: 'dirt',
    read: 'You stand inside the root-heart of the great tree. Green witch-light burns in hollows of the wood, a cauldron of cider steams over a fire of apple logs, and roots hang everywhere like a curtain. Someone is humming a lullaby.',
    gm: 'Mother Windfall\'s home. She first appears as a kindly old picker woman and offers the heroes a share of the harvest to go away. Fighting her here, she has her root-servant (awakened tree, which sleeps if the chapel wassail was poured on Old Crookback\'s roots), three straw children and two rat swarms. Each burned witch-knot costs her 15 hit points before the fight starts.',
  });
  b.prop('cauldron', 38, 11).prop('campfire', 38, 12).props_('sconce-witchfire', [[33, 8], [43, 9], [35, 15]]).prop('magic-mirror', 44, 12).props_('herbs-drying', [[32, 11], [41, 7]]).prop('straw-bed', 34, 13).props_('bones', [[43, 14], [31, 9]]).prop('treasure-pile', 44, 11).prop('shelf-jars', 36, 7).prop('chains-hanging', 40, 9);
  b.light(38, 11, 10, 20, '#7dff9a').light(43, 9, 5, 10, '#7dff9a');
  b.encounter('Mother Windfall', [30, 6, 17, 11], [['greenHag', 1], ['awakenedTree', 1], ['awakenedShrub', 3], ['swarmOfRats', 2]], 'high');

  b.cave('The nursery', 30, 3, 4, 1.8, {
    seed: 81, mat: 'dirt',
    read: 'A cramped nook where roots are woven into a cradle the size of a child. Apple skins and pond weed line it like bedding.',
    gm: 'Where the hag grew the boy. A ring of apple pips, one for each picker taken, lies around the cradle. Seeing this is usually enough to turn Hester (no check needed).',
  });
  b.tunnel([[31, 4], [33, 7]], 1, { mat: 'dirt', seed: 82 });
  b.prop('crib', 30, 3).prop('herbs-drying', 28, 3);

  b.hall(40, 17, 40, 23, 1, { mat: 'dirt' });
  b.area('Inside the trunk', [[40, 18, 1, 6]], {
    read: 'A narrow passage of living wood spirals down into the dark. The walls are warm, and you can feel the tree\'s slow pulse under your hand.',
    gm: 'From the knot-hole down into the hollow. The hag hears anyone coming this way unless they are silent (DC 14 Stealth).',
    label: [40, 20],
  });
  b.prop('stairs-down', 40, 22);

  b.note(40, 25, 'Ways into the hill: the knot-hole in Old Crookback, the root cellar\'s false wall, the drowned way from the pond, and the wolf den crawl.');
  b.note(72, 46, 'Witch-knot 1 of 3: sewn into the tallest scarecrow.');
  b.note(41, 59, 'Witch-knot 2 of 3: wound round the cider press screw.');
  b.note(24, 28, 'Witch-knot 3 of 3: hanging in the willow over the pond.');
  return b.build();
}

export const HOLLOW_ORCHARD: Adventure = {
  id: 'hollow-orchard',
  title: 'The Hollow Orchard',
  tagline: 'The apples ripen overnight, the scarecrows walk at dusk, and the pickers keep vanishing among the trees.',
  levels: '3',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'folk horror', 'outdoors', 'hag', 'can be talked out'],
  pitch:
    'Bramblecombe is a quiet valley of cider farms, and Marrowell Farm makes the best cider in it. This autumn the harvest will not end. Apples ripen overnight on branches stripped the day before. The scarecrows are never quite where they were left. Four pickers have walked into the orchard and not come back, and the rest are packing their bags. The foreman has put up a notice in town, offering good silver to anyone brave enough to pick apples for a night and find out what is going on. You answered it.',
  secret:
    'Mother Windfall, a green hag, has slept in the hollow of Old Crookback, the valley\'s oldest apple tree, for a hundred years, kept drowsy by an autumn wassail the Marrowells long ago forgot. Last spring she lured little Tobin Marrowell into the millpond. At midsummer his grieving mother Hester went to the tree, and the hag offered a bargain: "Give me what grows and what wanders among the rows, and at first frost I will give you back your boy, whole and ripe." Hester agreed. Since then the hag has been growing a changeling from apples, pond water and Tobin\'s stolen bones, feeding the orchard\'s life into it and feeding on the pickers herself. The boy already sits at Hester\'s table, cold and quiet. Why now: tomorrow night brings the first frost. When the boy is ripe, the hag takes her last payment, Hester herself, and wears her face as mistress of the farm. Then the whole valley becomes her harvest.',
  hooks: [
    'Foreman Abel Sedge\'s notice in the market town promises 5 gp a night and all the cider you can drink. His nephew Kit is one of the missing.',
    'Pell Ashby, keeper of the valley\'s little chapel, writes to an old friend among the heroes: "Something is wrong with the Marrowell boy. Please come quickly."',
    'A cart of Marrowell cider reached town, and everyone who drank it dreamed of a green woman in a tree, calling their names.',
  ],
  tips: [
    'The clock: the heroes arrive at dusk, and first frost is tomorrow night. If they dither, have another picker vanish at midnight and the boy look a little more real every hour.',
    'Three witch-knots (scarecrow field, cider press, millpond willow) feed the hag. Each one burned costs her 15 hit points before the final fight. Let clever players find all three and the boss fight gets much easier.',
    'Turning Hester is the heart of the story. Show her the larder, the nursery or the bones, and she breaks. A turned Hester opens the knot-hole for the heroes and, in the final fight, stops the boy from shielding the hag.',
    'There are four ways into the hill: the knot-hole, the root cellar, the drowned way and the wolf den crawl. All of them work. The root cellar is the obvious one; the knot-hole is the bold one.',
    'Most fights can be skipped. Feed the wolves, leave the vinegar vat shut, follow the ribbons past the walking rows, burn the scarecrow knot before they reach you.',
    'Play Tobin sweet and wrong: he smiles all the time, he never blinks, he smells of apples and there are pips in his teeth. He loves his mother. He does not understand what he is.',
  ],
  npcs: [
    {
      id: 'pf_hohester', name: 'Hester Marrowell', title: 'widow of Marrowell Farm', kind: 'npc', art: 'farmer', shared: true,
      wants: 'To keep her son. She will lie, beg and bar the door to do it.', knows: 'The bargain words, the phrase that opens the knot-hole ("I have come for my share"), and that the boy came back on the night of midsummer.',
      voice: 'Quiet and quick, always busy with her hands, never finishes a sentence about Tobin.', appearance: 'A tall, tired woman in a black dress and a flour-dusted apron, with a red thread tied round her wrist.',
      backstory: 'She lost her husband Rowan to a fever two winters ago, then Tobin to the pond in spring. She has run the farm alone ever since.',
      gmNotes: 'Can be turned: DC 15 Persuasion, or DC 10 with proof (the larder, the nursery, the bones, the ring of pips). Cutting open the bargain-token in front of her also works. Turned, she opens the knot-hole and stands with the heroes. If she renounces the bargain in the hollow, the hag cannot use her illusions or turn invisible for the rest of the fight.',
    },
    {
      id: 'pf_hotobin', name: 'Tobin Marrowell', title: 'the boy who came back', kind: 'monster', art: 'child', monsterId: 'awakenedShrub',
      wants: 'For his mother to be happy, and for the green lady to stop calling him at night.', knows: 'How the pond water felt, the green lady\'s lullaby, and where the nursery is ("where I sleep when I\'m not here").',
      voice: 'Polite and sing-song. Repeats the last thing an adult said, a moment too late.', appearance: 'A pale nine-year-old with damp hair who never blinks. He smells of apples, and there are pips in his teeth.',
      backstory: 'The hag\'s changeling: apple-flesh, pond water and Tobin\'s bones, with some of the real boy\'s memories and none of his warmth. Not yet. At first frost he will be "ripe".',
      gmNotes: 'Uses the awakened shrub stat block (vulnerable to fire). He does not fight. In the final fight the hag calls him to stand in front of her: a turned Hester can call him away. If the bones are laid to rest, he becomes his own: he stays until the frost, says goodbye, and becomes an apple sapling on Rowan\'s grave.',
    },
    {
      id: 'pf_howindfall', name: 'Mother Windfall', title: 'the old woman in the tree', kind: 'monster', art: 'green-hag', monsterId: 'greenHag',
      wants: 'A whole valley of harvest, and Hester\'s face to wear while she eats it.', knows: 'Every bargain ever struck at Old Crookback, and the name of every picker she has taken.',
      voice: 'Warm as a grandmother, full of "dearie" and "my lamb", with a gurgle under every word like water in a drain.', appearance: 'Disguised: a stooped, rosy old picker with a basket. True form: green skin like apple peel, hair of wet roots, and a mouth too full of teeth.',
      gmNotes: 'Starts by bargaining: "Take your share and go. Who misses a few pickers?" She offers each hero a golden apple that grants one wish (it is a lie; eating one causes a dream of the tree). Fights from among the roots and turns invisible to slip away. If reduced below 20 hit points she offers to leave the valley forever: a hag\'s promise, kept to the letter only.',
    },
    {
      id: 'pf_hoabel', name: 'Abel Sedge', title: 'farm foreman', kind: 'npc', art: 'farmer', shared: true,
      wants: 'His nephew Kit back, and his pickers safe.', knows: 'When and where each picker vanished, that Tobin drowned and was buried in the spring, and that "the boy" at the farmhouse cannot be him. He is too frightened of Hester\'s grief to say it aloud.',
      voice: 'Slow and gruff, chews a stem of grass, calls everyone "friend".', appearance: 'A big, weathered man with a grey beard, a lantern and a pruning hook he never puts down.',
      backstory: 'Twenty years on the farm. He carried Rowan\'s coffin and then Tobin\'s.',
      gmNotes: 'Uses the commoner stat block if he must fight. He pays the heroes and will come into the hill if Kit is still alive.',
    },
    {
      id: 'pf_holark', name: 'Lark Tully', title: 'apple picker', kind: 'npc', art: 'commoner', shared: true,
      wants: 'To be believed, and to earn enough to leave the valley.', knows: 'The scarecrows walk at dusk (she saw one climb down off its pole). She tied red ribbons along a safe row through the orchard.',
      voice: 'Fast, sharp and fearless, swears creatively.', appearance: 'A wiry fifteen-year-old with a scraped chin, red ribbons in her braids and a bag of stolen apples.',
      gmNotes: 'Will guide the heroes along the ribbon row if they take her seriously. Keeps the tally board in the bunkhouse (handout).',
    },
    {
      id: 'pf_hopell', name: 'Pell Ashby', title: 'keeper of the harvest chapel', kind: 'npc', art: 'acolyte', monsterId: 'acolyte', shared: true,
      wants: 'To save the boy, if that is even possible, and to have someone else believe him.', knows: 'What Rowan\'s almanac says about the old woman in the tree, the knots and the wassail. He has seen the boy\'s empty grave.',
      voice: 'Nervous, kind, over-explains, quotes old harvest rhymes.', appearance: 'A young man in a patched brown robe with straw in his hair and ink on his fingers.',
      gmNotes: 'Can bless a jug of cider as wassail (takes 10 minutes): poured on Old Crookback\'s roots, the hag\'s root-servant falls asleep and does not join the final fight. Gives the heroes two flasks of holy water.',
    },
    {
      id: 'pf_hotatters', name: 'Old Tatters', title: 'the first scarecrow', kind: 'npc', art: 'scarecrow',
      wants: 'To keep the Marrowells safe, as he was made to do.', knows: 'Every path through the orchard, and where the drag marks lead.',
      voice: 'A dry rustle, like wind in straw. Answers yes with one rustle and no with two.', appearance: 'A scarecrow in Rowan\'s old patched blue coat, with a sack face and a kindly stitched smile.',
      gmNotes: 'Woken by the hag\'s magic like the others, but stuffed by Rowan\'s own hands, so it is loyal to the family. It moves only when unwatched. It can lead the heroes safely through the walking rows, or stand guard over Hester. Uses no stat block; it falls apart if it is harmed.',
    },
    {
      id: 'pf_hodunstan', name: 'Dunstan Rook', title: 'a missing picker', kind: 'npc', art: 'commoner',
      wants: 'Out, and never to see an apple again.', knows: 'The hag talked to him while he hung in the larder: she said "the boy ripens at frost, and then the widow pays."',
      voice: 'Hoarse, shaking, laughs when he is scared.', appearance: 'A lanky young picker with bark-scratches all over his skin and leaves in his hair.',
      gmNotes: 'Alive in the larder with young Kit Sedge. Both are at 1 hit point and poisoned until they have a long rest.',
    },
  ],
  handouts: [
    { id: 'notice', title: 'A notice in the market square', text: 'PICKERS WANTED\nMarrowell Farm, Bramblecombe.\n5 gp a night, hot supper, all the cider you can drink.\nAsk for A. Sedge, foreman.\n\n(scratched underneath in another hand: DON\'T GO IN THE ROWS AFTER DARK)' },
    { id: 'tally', title: "Lark's tally board", text: 'PICKERS  (baskets)\nMerry Ash  ||||  ||||  ||  (rubbed out)\nOld Garth  ||||  |||  (rubbed out)\nDunstan  ||||  ||||  (rubbed out)\nKit  ||||  |  (rubbed out)\nLark  ||||  ||||  ||||  ||||\n\nEVERYONE went up by the big tree. NOBODY goes up by the big tree.' },
    { id: 'drawing', title: "A child's drawing over Tobin's bed", text: 'A crayon picture: a house, a woman in black, a man in a blue coat with wings, and a boy with a fishing rod. In a big tree beside the pond stands a tall green lady with long arms, holding out an apple.\n\nWritten underneath in a child\'s hand: THE NISE LADY IN THE TREE GIVS ME APPLES. DONT TELL MAMA.' },
    { id: 'almanac', title: "From Rowan Marrowell's almanac", text: 'My grandfather\'s rule: every first frost, a jug of blessed cider on the roots of Old Crookback, and the old woman sleeps the winter through.\n\nHer strength hangs in knots, he said. If ever you find her knots in the farm, cut them and burn them, and she grows weak.\n\nNever bargain with her. She gives exactly what she promises, and nothing that you meant.' },
    { id: 'bargain', title: 'Scratched into the cradle in the nursery', text: 'WHAT GROWS AND WHAT WANDERS AMONG THE ROWS IS MINE.\nAT FIRST FROST THE BOY IS WHOLE AND RIPE.\nAND WHEN HE IS RIPE, THE MOTHER PAYS THE LAST OF IT.\n\n(around the words, a ring of apple pips: you count four)' },
  ],
  chapters: [
    {
      id: 'orchard', title: 'Harvest Night at Marrowell Farm', level: 3,
      summary: 'One long night on a cider farm where the harvest will not end: meet the grieving widow and her too-quiet son, unravel the hag\'s knots across the farm, and go under the hill into the hollow of the oldest tree.',
      goal: 'Find the missing pickers, break the bargain, and stop Mother Windfall before first frost.',
      map: marrowellFarm,
      npcs: [
        { npc: 'pf_hoabel', x: 9, y: 43 },
        { npc: 'pf_holark', x: 12, y: 41 },
        { npc: 'pf_hohester', x: 12, y: 58 },
        { npc: 'pf_hotobin', x: 17, y: 52 },
        { npc: 'pf_hotatters', x: 3, y: 53 },
        { npc: 'pf_hopell', x: 64, y: 65 },
        { npc: 'pf_hodunstan', x: 59, y: 6, hidden: true },
        { npc: 'pf_howindfall', x: 39, y: 10, hidden: true },
      ],
      scenes: [
        {
          room: "Workers' bunkhouse", title: 'Pickers wanted',
          read: 'Abel Sedge leads you through a farmyard that smells of apples and woodsmoke, to a bunkhouse with too many empty beds. "Four gone in twelve nights," he says, and taps the chalk board by the door. "Folk say they ran off. Merry Ash didn\'t run off. Her boots are still here."',
          gm: 'Abel hires the heroes and tells what he knows. Lark interrupts to say the scarecrows walk; Abel tells her to hush, but does not say she is wrong. Lark offers to show them the ribbon row. Keep this to ten minutes, then the supper bell rings.',
          handout: 'tally',
          treasure: 'Abel pays 5 gp each in advance. In Merry Ash\'s footlocker: 8 gp and a silver locket (10 gp) for her sister.',
        },
        {
          room: 'Marrowell farmhouse', title: 'Supper with the Marrowells',
          read: 'Hester Marrowell ladles apple stew into bowls with quick, nervous hands. Beside her sits a pale boy with damp hair, who smiles at you without blinking. "Say good evening, Tobin," she says. "Good evening, Tobin," says the boy.',
          gm: 'Tobin never eats; he hides his food. His hand is cold and slightly sticky, like apple skin. Insight DC 13: Hester is lying when she says he is "a cousin\'s boy". Abel stares at his plate. A hero who slips into Tobin\'s room finds the drawing. Under Hester\'s mattress is the bargain-token (DC 12 Investigation).',
          handout: 'drawing',
        },
        {
          room: 'Scarecrow field', title: 'Scarecrows at dusk', encounter: 'Scarecrows at dusk',
          read: 'The light goes copper, then grey. Across the stubble, with a sound like dry leaves, a scarecrow steps down off its pole. Then another. Then all of them, turning to face you.',
          gm: 'The scarecrows shamble toward the farmhouse every dusk to drag off anyone they find outside. Fire wrecks them. Tearing open the tallest scarecrow (it stands still in the middle, giving orders with its head) reveals the first witch-knot; burning it drops them all. Old Tatters may rustle a warning first.',
          treasure: 'Stuffed into the straw: the rings, buttons and a pocket knife of the missing pickers (proof for Hester), and 14 gp in loose coins.',
        },
        {
          room: 'Cider barn', title: 'The press that will not stop', encounter: 'Mother of vinegar',
          read: 'The great cider press turns on its own in the dark barn, groaning, while gold juice spills over the troughs and onto the floor. Wasps crawl drunk on every surface.',
          gm: 'The second witch-knot is wound round the press screw. Stopping the press takes a DC 12 Strength check (or wedging a beam); cutting the knot stops it for good, and by morning the apples on the trees stop ripening. The weighted vat in the vat room only matters if someone opens it or makes a lot of noise.',
          treasure: 'Hester\'s medicine chest in the vat room: 2 potions of healing and a jar of honey salve.',
        },
        {
          room: 'Millpond', title: 'Lights on the millpond', encounter: 'Lights on the millpond',
          read: 'A pale light bobs over the black water, like a lantern held by someone wading out. A child\'s voice, very faint, calls "Mama?" from the middle of the pond.',
          gm: 'A will-o\'-wisp mimics Tobin\'s voice to lure people into the deep water, where the giant frogs wait. The third witch-knot hangs in the willow over the water (DC 10 Athletics to climb). Burning it makes the wisp flicker out. A hero who swims down finds the drowned way into the hill.',
          treasure: 'In the willow, with the knot: a tarnished silver hair comb (25 gp) the hag took from some long-ago bride.',
        },
        {
          room: 'Harvest chapel', title: 'The keeper of the chapel', optional: true,
          read: 'Candlelight, corn dollies and the smell of beeswax. A young man in a straw-flecked robe nearly drops his candle when you open the door. "Oh, thank the harvest," he says. "Someone else has noticed."',
          gm: 'Pell Ashby shows them Rowan\'s almanac (handout) and Tobin\'s fallen-in grave in the chapel yard. He can bless a jug of cider as wassail. He is sure the boy can be saved if his bones come home.',
          handout: 'almanac',
          treasure: 'Pell gives the heroes 2 flasks of holy water and a spell scroll of Protection from Evil and Good.',
        },
        {
          room: 'The walking rows', title: 'The walking rows', encounter: 'The walking rows', optional: true,
          read: 'The rows bend. The tree that was behind you is now in front of you, and its branches creak in a wind that is not blowing. Something in the dark ahead groans like a door opening very slowly.',
          gm: 'The shortest way to Old Crookback, and the most dangerous. Lark\'s ribbons or Old Tatters lead through safely; otherwise the two old trees close in. Old Garth\'s body lies here with his satchel.',
          treasure: 'Old Garth\'s satchel: 12 gp, a fine silver pruning knife (5 gp) and a potion of climbing.',
        },
        {
          room: 'Windbreak wood', title: 'Wolves in the windbreak', encounter: 'Wolves in the windbreak', optional: true,
          gm: 'The starving wolves come out when heroes pass near the wood or the den. A ham from the smokehouse or a DC 13 Animal Handling sends them off; driven off without a fight, they never trouble the farm again. The den hides the crawl into the hill.',
          treasure: 'Among the bones in the den: a dead hunter\'s pouch with 20 gp, a quiver of 6 arrows with one silvered arrow, and a potion of healing.',
        },
        {
          room: 'Root cellar', title: 'Into the hill', encounter: 'Rot in the dark',
          read: 'Behind a wall of shelves the stones give way to raw earth and roots. Air breathes out of the dark, cold and sweet with rot, and far below something shrieks.',
          gm: 'The false wall leads by the root tunnels to the hollow (the quiet way). The swollen east door leads to the rot cave, where the shrieker warns the hag and fungi lurk among the mould. From the rot cave a wide tunnel climbs to the larder.',
        },
        {
          room: 'The larder', title: "The hag's larder", encounter: 'The larder keepers',
          read: 'Bark-wrapped bundles sway from the roots overhead. As your light touches them, one twists toward you and a muffled voice says, "Please."',
          gm: 'Dunstan and Kit hang here alive. The root-knot guardian fights to keep its harvest. Freed, Dunstan repeats what the hag told him: "the boy ripens at frost, and then the widow pays." If Hester hears this, she turns.',
          treasure: 'Pickers\' belongings in a heap: 30 gp, a good cloak and a lute. Under them, a moonstone (50 gp).',
        },
        {
          room: 'Drowned grotto', title: "Tobin's bones", optional: true,
          read: 'Small bones lie on a bed of moss above the black water, laid out as carefully as a sleeping child. A wooden horse is tucked under one tiny hand.',
          gm: 'The heart of the hag\'s spell. Taking the bones out and laying them back in Tobin\'s grave (with Pell\'s blessing, 10 minutes) frees the boy from the hag. The wooden horse is the one Rowan carved; Hester will weep to see it.',
        },
        {
          room: "Mother Windfall's hollow", title: "Mother Windfall's hollow", encounter: 'Mother Windfall', handout: 'bargain',
          read: 'An old woman in a picker\'s apron stirs the steaming cauldron and does not look up. "There you are, my lambs," she says. "Come for your share? Sit, sit. There\'s plenty. There\'s always plenty."',
          gm: 'The finale. She offers golden apples and safe passage if the heroes walk away. When the fight starts, she drops her disguise. Subtract 15 hit points for each burned knot; remove the root-servant if the wassail was poured; if Hester renounced the bargain, the hag cannot turn invisible or use illusions. The hag calls the boy to shield her if he is near and Hester has not turned. The nursery and its scratched bargain sit just north.',
          treasure: 'The hag\'s hoard: 210 gp in old coins, a cloak of protection, a potion of greater healing, and a silver wedding ring engraved R + H that Hester gave as part of her payment.',
        },
      ],
      wrapUp: 'With the hag dead or banished, the press stops, the scarecrows fall slack, and by morning the apples on the trees are simply apples. Whatever was decided about the boy plays out at first frost. The heroes reach level 4.',
    },
  ],
  ending:
    'Good ending: the pickers come home, Hester breaks the bargain, and Mother Windfall is dead or gone. If Tobin\'s bones were laid to rest, the boy stays until first frost: he helps press the last cider, says goodbye to his mother at dawn, and where he stood an apple sapling takes root beside Rowan\'s grave. Hester pays the heroes 50 gp each and a cask of the best cider in the valley, every autumn, forever. Bad ending: the heroes fail or leave, and at first frost Hester is gone. A kindly woman who looks just like her runs Marrowell Farm now, and her cider is sweeter than ever. People who drink it dream of a tree. What next: the almanac speaks of other old women sleeping in other old trees, and a wassail that every farm in the valley has stopped making.',
};
