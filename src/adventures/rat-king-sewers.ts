// The Rat King of Lower Wick: a one-session first adventure for four heroes of level 1.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** Lamps, hooks and posts that stand dark: Lower Wick has had no lamp oil for six years. */
function unlit(b: MapBuilder, kind: string, pts: [number, number][]) {
  for (const [x, y] of pts) b.prop(kind, x, y, 0, { off: true });
}

function lowerWick() {
  const b = new MapBuilder('adv-rat-king-wick', 'Lower Wick, above and below', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dim', wallStyle: 'brick', theme: 'stone' });
  const r = rng(7311);

  // the old city wall on the east, and solid ground under the streets (the sewers are carved out of it below)
  b.rock(74, 0, 6, 36);
  b.rock(0, 36, 80, 44);

  // =====================================================================
  // STREET LEVEL (north half)
  // =====================================================================

  // ----- the Slop: the gutter canal down the middle of the quarter -----
  b.water(36, 0, 4, 36, false).water(37, 0, 2, 36, true);
  b.area('The Slop', [[36, 0, 4, 36], [35, 36, 6, 6]], {
    read: 'A narrow canal of green-brown water creeps south between the houses. It smells of cabbage, fish heads and things you would rather not name. At the south end it pours, gurgling, into a black brick arch.',
    gm: 'Waist-deep at the edges, over your head in the middle (swim, DC 10 Athletics). A brick ledge on each side of the arch at the south end leads down into the Outfall basin: the easy way into the sewers. Anyone who falls in must make a DC 10 Constitution save or be poisoned (sewer sick) for an hour.',
    label: [37, 12],
  });
  b.floor(36, 6, 4, 2, 'wood-planks');
  b.area('Rotten Plank bridge', [[36, 6, 4, 2]], {
    read: 'Three planks, one rope and a lot of hope cross the Slop here.',
    gm: 'Fine for one at a time. Two or more at once: DC 10 Dexterity save each or the middle plank snaps and you go in.',
    label: [38, 6],
  });
  b.props_('bridge-plank', [[37, 6], [38, 7]]).prop('mooring-post', 35, 5);
  // the outfall arch: ledges either side of the water going under the street
  b.floor(35, 36, 6, 6, 'brick-floor').water(36, 36, 4, 6, false);
  b.props_('stairs-down', [[35, 39], [40, 39]]).props_('sewer-outflow', [[37, 35]]).prop('chains-hanging', 35, 38).prop('lantern-hook', 40, 37, 0, { off: true });

  // ----- Wick Street, the one proper street -----
  b.paint(0, 17, 74, 4, 'stone-flagstone');
  b.floor(36, 17, 4, 4, 'stone-flagstone');
  b.area('Wick Street', [[0, 17, 74, 4]], {
    read: 'The only street in Lower Wick wide enough for a cart. Every lamp post along it is dark and rusted, and the hump-backed bridge over the Slop is the only thing that ever gets swept.',
    gm: 'Ties the quarter together. After dark, rats cross the street in neat lines, like soldiers, and stop to watch anyone carrying a light. A DC 12 Survival or Nature check: the rats are moving loot toward the Slop and the market manhole, not at random.',
    label: [20, 18],
  });
  unlit(b, 'lamp-post', [[4, 17], [14, 20], [24, 17], [34, 20], [44, 17], [54, 20], [64, 17], [72, 20]]);
  b.prop('cart', 30, 18, 90).prop('signpost', 41, 20).prop('handcart', 58, 18).props_('barrel', [[10, 17], [11, 17]]).prop('crate', 67, 20);

  // ----- Crook Alley and the pawnshop (north-west) -----
  b.rock(0, 0, 9, 5).rock(11, 0, 8, 3).rock(0, 7, 4, 9).rock(6, 7, 4, 4).rock(6, 13, 4, 3);
  b.paint(4, 5, 7, 11, 'dirt').paint(9, 3, 11, 2, 'dirt');
  b.area('Crook Alley', [[4, 5, 7, 11], [9, 3, 11, 2]], {
    read: 'A crooked alley no wider than a coffin, between houses that lean so close their gutters touch. Washing hangs overhead, dripping on you. A tiny chalk drawing of a rat in a crown is scratched on a doorpost.',
    gm: 'The chalk crowns mark the urchins\' route. Following them (DC 11 Investigation) leads to the pawnshop and then to Rag Court. A legless beggar here, Mutter Pike, sells gossip for a copper: "The crowned rat? He\'s real. He talks. He bought my sister\'s boots back from the pawnshop."',
    label: [5, 9],
  });
  b.props_('crate', [[4, 6], [10, 12]]).prop('barrel', 5, 14).prop('rope-coil', 10, 4).prop('broken-furniture', 4, 12).prop('puddle', 7, 11).prop('lantern-hook', 10, 5, 0, { off: true });
  b.building("Scrimm's pawnshop", 11, 5, 8, 8, {
    mat: 'wood-planks-dark',
    read: 'Every shelf is full of other people\'s things: boots, kettles, a christening cup, a lamplighter\'s brass pole. Behind the grille, a thin woman counts coins and does not look up.',
    gm: 'Widow Scrimm buys from the urchins and asks no questions. A DC 12 Persuasion (or 5 gp) and she admits it: "The little ones bring me stolen goods, and the next week they come back and buy the poor folks\' things back with the money. Strangest thieves I ever met." She has a lamplighter\'s pole with JORY FLINT burned into it, pawned six years ago.',
    doors: [[11, 9, 'w', 'closed'], [15, 12, 's', 'closed']], windows: [[11, 7, 'w'], [17, 12, 's']],
  });
  b.prop('shop-counter', 14, 8).prop('cage', 15, 8).props_('wall-shelves', [[12, 6], [17, 6]]).prop('display-case', 17, 9).prop('strongbox', 12, 6).prop('scales', 13, 10).prop('stool', 14, 7).prop('candles', 16, 10).light(16, 10, 5, 10);

  // ----- the Lamp-tax house -----
  b.building('Lamp-tax house', 21, 2, 11, 9, {
    mat: 'stone-flagstone',
    read: 'A neat little stone house with a brass plaque: OFFICE OF THE LAMP WARDEN. LAMP TAX DUE ON THE FIRST. Inside it is warm, and three good oil lamps burn on the desk. It is the only lit window on the street.',
    gm: 'Sully Narrows collects the lamp tax here for Warden Grumm. He is a coward: a sharp word and a raised fist (DC 12 Intimidation) and he babbles. The back office is locked (DC 13 thieves\' tools, or Sully\'s key). The tax book on the back desk is the proof that Grumm has taken six years of lamp money and bought no oil (handout: the lamp-tax book).',
    doors: [[26, 10, 's', 'closed'], [21, 8, 'w', 'closed']], windows: [[23, 10, 's'], [29, 10, 's']],
  });
  b.wallRun(21, 5, 11, 's').door(26, 5, 's', 'locked', 'door-iron');
  b.prop('desk', 26, 8).prop('chair', 26, 7).props_('lamp-table', [[24, 8], [28, 8]]).prop('notice-board', 22, 6).prop('bench', 29, 9).prop('strongbox', 30, 3).prop('writing-desk', 24, 3).prop('map-cabinet', 22, 3).prop('book-pile', 27, 3).prop('coat-rack', 30, 6);
  b.light(26, 8, 10, 15).light(24, 3, 5, 10);
  b.area('Washing green', [[19, 11, 16, 5]], {
    gm: 'A patch of trampled grass where the quarter dries its washing. Good cover for watching the Lamp-tax house door: Sully leaves at midnight with a moneybag and two hired guards, never by the same street twice.',
    label: [27, 13],
  });
  b.paint(19, 11, 16, 5, 'grass').props_('rope-coil', [[20, 12], [33, 12]]).props_('washbasin', [[22, 14], [31, 14]]).prop('water-barrel', 34, 14).prop('tree-birch', 26, 14).prop('chicken-coop', 19, 15);

  // ----- Dead Lamp Lane (north-east) -----
  b.rock(40, 0, 8, 5).rock(50, 0, 8, 4).rock(41, 9, 7, 6).rock(50, 8, 7, 5);
  b.paint(40, 5, 19, 4, 'dirt').paint(48, 0, 2, 16, 'dirt').paint(57, 4, 2, 13, 'dirt');
  b.area('Dead Lamp Lane', [[40, 5, 19, 4], [48, 0, 2, 16], [57, 4, 2, 13]], {
    read: 'A crooked lane lined with lamp posts, a dozen of them, every glass smashed or empty. Someone has hung a sign on the last one: LAMPS OF LOWER WICK, R.I.P.',
    gm: 'This is where the lamplighters used to start their round. If the heroes ever light these lamps (oil from the guild hut, an hour\'s work), the whole quarter comes out to watch, and every rat in Lower Wick knows about it within minutes. That is one of the ways to win Jory over.',
    label: [44, 6],
  });
  unlit(b, 'lamp-post', [[41, 5], [45, 8], [49, 2], [48, 12], [53, 5], [58, 8], [57, 13]]);
  b.prop('signpost', 52, 7).prop('rubble-pile', 43, 7).prop('stump', 48, 15).prop('barrel', 56, 6);

  // ----- the Lamplighters' guild hut and its hidden oil store -----
  b.building("Lamplighters' guild hut", 59, 1, 15, 10, {
    mat: 'wood-planks',
    read: 'A long wooden hut that smells of lamp oil and old pipe smoke. Brass poles hang on hooks along one wall, rows of empty lamps line the shelves, and a painted board lists the lamplighters of Lower Wick. Every name but the last is crossed out.',
    gm: 'Old Nan Wickery lives here alone. She tells the heroes Jory\'s story if they are kind (she adores him). On the hooks hang two silver-capped lamplighter\'s poles: they work as quarterstaffs and count as silvered, the way to hurt the Rat King in rat form. Nan lends them to anyone who promises not to kill "my Jory". A barrel of good lamp oil (20 flasks) sits in the corner.',
    doors: [[62, 10, 's', 'closed'], [59, 6, 'w', 'closed']], windows: [[64, 1, 'n'], [72, 10, 's'], [59, 3, 'w']],
  });
  b.wallRun(67, 1, 5, 'w').wallRun(67, 5, 7, 's').door(69, 5, 's', 'closed');
  b.door(73, 3, 'e', 'secret');
  b.area("Nan's room", [[67, 1, 7, 5]], {
    read: 'A cot, a stove and a rocking chair. A child\'s drawing of a man on a ladder lighting a lamp is pinned over the bed.',
    gm: 'A DC 13 Investigation finds a draught from the east wall: a secret door to the old oil store, built into the city wall. Nan will show it if the heroes have won her trust ("Jory used it. He still does, I think. Someone leaves me a hot pie on my step every Sunday.").',
  });
  b.props_('spear-rack', [[60, 2], [62, 2]]).props_('wall-shelves', [[64, 2], [66, 2]]).prop('workbench', 61, 8).prop('barrel-group', 65, 8).prop('ladder', 60, 9).prop('notice-board', 63, 4).prop('table-trestle', 64, 6).props_('stool', [[63, 6], [65, 6]]).prop('lantern-standing', 66, 9);
  b.prop('cot', 72, 2).prop('stove', 68, 2).prop('rocking-chair', 70, 3).prop('rug-round', 70, 2).prop('candles', 72, 4);
  b.light(66, 9, 10, 15).light(70, 3, 5, 10);
  b.room('Hidden oil store', 74, 1, 5, 6, {
    mat: 'brick-floor',
    read: 'A narrow brick room inside the city wall. Racks for oil jars, all empty. A ladder disappears down a black hole in the floor.',
    gm: 'The lamplighters kept their oil here safe from thieves. The ladder drops into the Lamplighters\' crawl, an old service tunnel inside the wall that runs all the way down to Jory\'s den. Jory\'s muddy footprints come and go.',
  });
  b.prop('wall-shelves', 75, 1).prop('ladder', 76, 5).prop('wine-rack', 77, 2).prop('cobweb-corner', 78, 1);
  b.area('Guild yard', [[58, 11, 16, 6]], {
    read: 'A cobbled yard with a rack of rusting lamp posts waiting to be put up, a dry well and a handcart missing a wheel.',
    gm: 'Rats watch the hut from the gutters here: Jory keeps an eye on Nan. A hero who sits quietly with food (DC 12 Animal Handling) gets a giant rat to come close: it wears a tiny scrap of red ribbon, the Rat King\'s colour.',
    label: [65, 13],
  });
  b.paint(58, 11, 16, 6, 'stone-cobble');
  b.props_('column-fallen', [[60, 13], [61, 15]], 90).prop('well', 68, 13).prop('handcart', 71, 15).prop('firewood', 64, 15).prop('crate-stack', 73, 12);

  // ----- the Gutter Swan (where the job starts) -----
  b.building('The Gutter Swan', 1, 22, 15, 14, {
    mat: 'wood-planks',
    read: 'A low, smoky inn with a sagging roof and a painted sign of a swan wearing a bucket for a hat. Fishwives, dockers and two very old men playing dice look up as you come in. Behind the bar, a big woman is shouting at a hole in the floor.',
    gm: 'Mabel Gristle runs the Gutter Swan. The heroes start here, at supper. Rats come up through the cellar every night; tonight they took a whole wheel of cheese while a barefoot child held the cellar door open. See the scene "A cheese most foul".',
    doors: [[8, 22, 'n', 'closed'], [15, 28, 'e', 'closed']], windows: [[3, 22, 'n'], [12, 22, 'n'], [15, 25, 'e'], [1, 26, 'w']],
  });
  b.wallRun(1, 30, 9, 's').wallRun(9, 31, 5, 'e').door(4, 30, 's', 'open').door(5, 35, 's', 'closed');
  b.area('Swan kitchen', [[1, 31, 9, 5]], {
    read: 'Pots, steam and a cat that has given up. A trapdoor in the floor is propped open with a ladle.',
    gm: 'Steps lead down to the cellar. The cat, Duchess, refuses to go near the trapdoor. Cheese crumbs lead straight down.',
  });
  b.prop('bar-counter', 11, 24).prop('keg-rack', 13, 23).prop('stair-spiral', 14, 33).props_('table-round', [[4, 25], [8, 27], [5, 28]]).props_('chair', [[3, 25], [5, 25], [7, 27], [9, 27], [4, 28], [6, 28]]).prop('fireplace', 2, 23).prop('dartboard', 14, 30).prop('table-cards', 12, 31).props_('stool-bar', [[10, 25], [10, 26]]).prop('tavern-sign', 8, 21);
  b.prop('hearth-oven', 2, 31).prop('pot-rack', 4, 31).prop('kitchen-table', 6, 33).prop('flour-sacks', 8, 32).prop('trapdoor', 5, 34).prop('butcher-block', 2, 34);
  b.light(2, 23, 15, 20).light(11, 25, 10, 15).light(3, 32, 5, 10, '#ff9a3c');
  b.start(5, 24, 3, 3);
  b.room('Gutter Swan cellar', 2, 36, 11, 6, {
    mat: 'stone-flagstone',
    read: 'A low cellar of barrels and sacks, every one of them gnawed. The smell of old cheese is overwhelming. In the far corner, an iron drain grate lies tipped over beside a hole, and many small eyes shine in the dark.',
    gm: 'Five giant rats are carrying off the last of the bacon. They fight until two fall, then flee down the drain. The hole drops (15 ft, a rusty ladder) to the Swan Drop in the sewers. Rat tracks and cheese crumbs lead that way.',
  });
  b.prop('stairs-up', 5, 36).props_('barrel-stack', [[2, 37], [2, 40]]).props_('flour-sacks', [[7, 36], [8, 36]]).prop('wine-rack', 12, 36).prop('shelf-jars', 12, 39).prop('sack', 6, 40).prop('trapdoor', 10, 41).prop('crate-pile', 4, 39).prop('bones', 8, 39);
  b.encounter('Rats in the cellar', [2, 36, 11, 6], [['giant-rat', 5]], 'low');
  b.area('Swan Alley', [[16, 21, 1, 15]], { gm: 'A one-person gap between the inn and the market. Mabel\'s kitchen door and the inn\'s side door both open here.', label: [16, 30] });
  b.paint(16, 21, 1, 15, 'dirt').prop('water-barrel', 16, 33).prop('crate', 16, 23);

  // ----- Ha'penny Square, the market -----
  b.paint(17, 22, 16, 14, 'stone-flagstone');
  b.area("Ha'penny Square", [[17, 22, 16, 14]], {
    read: 'A cramped market square of crooked stalls under patched awnings. In the middle stands a soot-black statue of a lamplighter on a ladder, his stone lamp empty. Every stall owner has a broom close at hand, and a cat on a string.',
    gm: 'By day: gossip. Stallholders have lost bread, sausages, candles and every ounce of lamp oil to rat gangs this month. The rats come at dusk, in organised lines, and drop the loot down the manhole by the fish stall. Stake out the square at dusk and the Market raid begins. The manhole cover lifts with a DC 10 Athletics check (a 20-ft iron ladder down).',
    label: [24, 28],
  });
  b.props_('market-stall', [[18, 23], [22, 23], [30, 23], [18, 31]]).props_('produce-stall', [[27, 23], [30, 31]]).prop('fish-crate', 27, 33).prop('fish-crate', 28, 33).prop('statue-tall-robed', 25, 27).prop('well', 21, 28).prop('notice-board', 31, 26).prop('cart', 19, 34, 90).prop('bread-rack', 22, 31).prop('trapdoor', 25, 34);
  unlit(b, 'lamp-post', [[17, 22], [32, 35]]);
  b.prop('torch-standing', 26, 32).light(26, 32, 10, 15);
  b.encounter('Market raid', [17, 22, 16, 14], [['swarm-of-rats', 2], ['giant-rat', 2]], 'low');
  b.paint(33, 21, 3, 15, 'mud');
  b.area('Mudlark Steps', [[33, 21, 3, 15]], {
    read: 'Slimy stone steps go down to the edge of the Slop. Mudlark children sift the muck for buttons and nails.',
    gm: 'The mudlarks are friends of the urchins. Two coppers buy the news that "the King\'s lot" live under Rag Court, and that men with brass collars and a dog went down the market manhole this afternoon.',
    label: [34, 28],
  });
  b.props_('puddle', [[34, 24], [33, 31]]).prop('rowboat', 35, 30, 0).prop('fishing-net', 33, 26).prop('bones-mud', 34, 34);

  // ----- east bank: Rag Court and Paupers' Yard -----
  b.paint(40, 21, 2, 15, 'stone-cobble');
  b.rock(42, 21, 3, 15).rock(55, 21, 3, 15);
  b.paint(45, 21, 10, 15, 'dirt');
  b.area('Rag Court', [[45, 21, 10, 15]], {
    read: 'A courtyard of mud boxed in by black tenements five storeys high. Washing lines criss-cross the sky. At the bottom of the court, a storm drain gapes in the cobbles, and somebody has painted a red crown on its grate.',
    gm: 'The urchins\' front door. Kids here clam up when strangers ask about the King, but a kind word and food (DC 11 Persuasion) gets one to whisper: "Don\'t hurt him. He looks after us." The drain grate lifts easily: a smooth brick slide (DC 10 Dexterity or tumble into the Nest, 1d4 bludgeoning).',
    label: [49, 27],
  });
  b.props_('rope-coil', [[46, 22], [53, 22]]).props_('washbasin', [[46, 26], [53, 29]]).prop('water-barrel', 54, 24).prop('straw-bed', 46, 31).prop('campfire', 50, 29).prop('chicken-coop', 53, 33).prop('broken-furniture', 46, 34).prop('sewer-outflow', 50, 35).props_('crate', [[52, 25], [47, 28]]);
  b.light(50, 29, 10, 15, '#ffb35c');
  b.paint(58, 21, 1, 15, 'dirt');
  b.paint(59, 21, 15, 15, 'grass');
  b.area("Paupers' Yard", [[59, 21, 15, 15]], {
    read: 'A sad little graveyard behind a low wall. Wooden markers lean every which way. Near the back, the ground has fallen into a hole as big as a cart, and cold air breathes out of it.',
    gm: 'The paupers\' graves sit on top of an older crypt. The ground broke last spring and nobody has fixed it. A rope (or a DC 12 Athletics climb) gets down the rubble chute into the Collapsed crypt. A DC 12 Perception sees fresh rat tracks and a child\'s bare footprint at the edge: the urchins dare each other to go down.',
    label: [65, 26],
  });
  b.wallRun(59, 21, 15, 'n', 'low').wallRun(59, 21, 15, 'w', 'low').door(59, 27, 'w', 'open', 'door-wood').door(63, 21, 'n', 'open', 'door-wood');
  b.props_('burial-slab', [[61, 23], [64, 23], [68, 23], [71, 24], [61, 30], [70, 30]]).props_('cairn', [[62, 26], [69, 27]]).prop('tree-dead', 72, 33).prop('open-grave', 60, 33).prop('road-shrine', 66, 22).prop('candles', 67, 22).prop('sinkhole', 66, 33).prop('ceiling-rubble', 67, 35);
  b.light(67, 22, 5, 10);
  b.floor(66, 34, 2, 2, 'cave-floor');

  // =====================================================================
  // THE SEWERS (south half)
  // =====================================================================
  const brick = { mat: 'brick-floor' };

  // shafts and slides between the levels
  b.hall(10, 41, 10, 43, 1, brick); // cellar drain
  b.hall(25, 35, 25, 42, 1, brick); // market manhole
  b.floor(50, 36, 2, 7, 'stone-flagstone'); // Rag Court storm drain slide
  b.floor(66, 36, 2, 9, 'cave-floor').rubble(66, 34, 2, 11); // Paupers' Yard sinkhole chute
  b.props_('ladder', [[10, 42], [25, 40]]).prop('debris-wood', 51, 40).prop('rubble-pile', 67, 40);

  b.room('Swan Drop', 6, 44, 8, 5, {
    ...brick,
    read: 'You land in a brick chamber where three pipes dribble into a gutter. Cheese crumbs, bacon rind and tiny footprints lead south, toward the sound of rushing water.',
    gm: 'Quiet. A DC 12 Investigation finds a scrap of paper caught on a pipe: a page of a child\'s chalk map (handout: Pip\'s map), dropped by Pip in a hurry.',
  });
  b.prop('sewer-outflow', 7, 44).prop('puddle', 11, 46).prop('mud-patch', 8, 47).prop('cobweb-corner', 13, 44);
  b.floor(9, 49, 2, 1, 'brick-floor');

  // ----- the Big Drain: the main channel, west and east of the basin -----
  b.floor(3, 50, 29, 4, 'brick-floor').water(3, 51, 29, 2, false);
  b.floor(44, 50, 17, 4, 'brick-floor').water(44, 51, 17, 2, false);
  b.area('The Big Drain', [[3, 50, 29, 4], [44, 50, 17, 4]], {
    read: 'The main sewer: a long brick tunnel with a channel of slow, knee-deep water down the middle and a narrow walkway on each side. Every sound echoes, and the walls are scratched with tally marks, hundreds of them.',
    gm: 'The highway of the sewer. The water is difficult ground. Planks laid across it every forty feet are the rats\' bridges. The tally marks are the rats\' "tax" count: one scratch for every stolen thing brought back to the King.',
    label: [15, 50],
  });
  b.props_('bridge-plank', [[14, 51], [14, 52], [52, 51], [52, 52]], 90);
  unlit(b, 'lantern-hook', [[6, 50], [20, 53], [48, 50], [58, 53]]);
  b.prop('rubble-pile', 29, 53).prop('mold-patch', 4, 53).prop('bones', 57, 50).prop('mud-patch', 46, 53);

  // ----- the Brass Collars' camp under the market manhole -----
  b.room("Brass Collars' camp", 19, 43, 11, 6, {
    ...brick,
    read: 'Lantern light, a stewpot and the smell of wet dog. Four hard-looking people in leather aprons and brass-studded collars sit round cages full of squealing rats. A huge, ugly dog lifts its head and growls.',
    gm: 'The Brass Collars, rat-catchers hired by Warden Grumm to kill the Rat King before Lamp Night. Brask Hollin offers to "share the bounty" if the heroes lead the way (he plans to stab them in the back at the throne room). He can be talked into leaving (DC 14 Persuasion, or show him the lamp-tax book: "Grumm\'s been robbing us too?"). If a fight starts, the dog Biscuit goes for the smallest hero, and the crew runs if Brask falls.',
  });
  b.props_('cage', [[20, 44], [21, 44], [28, 44]]).prop('cooking-pot-fire', 24, 46).props_('bedroll', [[20, 47], [27, 47]]).prop('trap-bear', 22, 47).prop('weapon-barrel', 29, 46).prop('notice-board', 26, 43).prop('rope-coil', 29, 44).prop('lantern-standing', 23, 44);
  b.light(24, 46, 10, 15).light(23, 44, 10, 10);
  b.floor(23, 49, 2, 1, 'brick-floor');
  b.encounter('The Brass Collars', [19, 43, 11, 6], [['thug', 2], ['bandit', 2], ['mastiff', 1]], 'moderate');

  // ----- the Outfall basin, where the Slop falls into the sewer -----
  b.cave('Outfall basin', 38, 47, 6.5, 5.6, {
    seed: 61, mat: 'brick-floor', wobble: 0.08,
    read: 'The Slop pours out of the ceiling in a stinking brown waterfall into a round brick basin. Walkways circle it. On a crate in the middle of the best one sits a giant rat wearing a thimble for a helmet, holding a scroll in its teeth.',
    gm: 'The hub of the sewer: the Big Drain runs west and east, and the King\'s Stair runs south to the sluice. Sir Nibbles, the Rat King\'s herald, waits here with the sentries and drops the scroll at the heroes\' feet (handout: the Royal Proclamation). He leads anyone who bows (really bows) to the Court of Junk by the King\'s Stair. Attack him and the sentries fight, then squeal off to warn the King.',
  });
  b.pool(38, 48, 3.4, 2.6, true);
  // walkways out of the basin: west and east along the Big Drain, south down the King's Stair
  b.floor(31, 50, 4, 4, 'brick-floor').water(31, 51, 4, 2, false).floor(40, 50, 5, 4, 'brick-floor').water(40, 51, 5, 2, false).floor(35, 52, 9, 2, 'brick-floor').water(38, 52, 3, 2, true);
  b.props_('crate', [[34, 45]]).prop('crown-cushion', 35, 45).prop('banner-pole', 33, 47).prop('sewer-outflow', 38, 43).props_('loot-sacks', [[42, 45], [41, 44]]).prop('bones', 33, 51);
  b.encounter('Rat sentries', [31, 42, 14, 11], [['swarm-of-rats', 2], ['giant-rat', 4]], 'low');

  // ----- the Nest: the urchins' hideout -----
  b.room('The Nest', 47, 43, 12, 6, {
    mat: 'wood-planks',
    read: 'A sewer room turned into a home. Hammocks of sailcloth, a fire in a cut-down barrel, and a pile of very clean stolen boots. A dozen children freeze and stare at you. Then a tall girl with a club steps in front of them.',
    gm: 'The Wick Ends: fourteen urchins aged six to sixteen. Moll Candle (16) and Fitch (15) fight to protect the little ones, with clubs and slings, while the King\'s rats swarm in from the pipes. Nobody here wants to kill anyone, and they flee if Moll falls. Talk instead (DC 12 Persuasion; automatic if the heroes brought food or Pip trusts them) and Moll explains: the King found them freezing and gave them a home. She asks the heroes to swear not to hurt him.',
  });
  b.props_('hammock', [[48, 44], [50, 44], [57, 44]]).props_('bedroll', [[48, 47], [55, 47]]).prop('fire-bowl', 52, 45).prop('gear-pile', 56, 46).prop('table-cards', 54, 44).prop('rug-pelt', 51, 46).prop('loot-sacks', 58, 47).prop('crate-stack', 47, 45).prop('ladder', 50, 43);
  b.light(52, 45, 10, 20, '#ffb35c');
  b.floor(53, 49, 2, 1, 'wood-planks');
  b.encounter('The Wick Ends', [47, 43, 12, 6], [['bandit', 2], ['swarm-of-rats', 2]], 'low');

  // ----- the Sluice of the Three Gates (on the King's Stair) -----
  b.room('Sluice of the Three Gates', 35, 54, 9, 6, {
    ...brick,
    read: 'A deep channel runs south out of the basin through three rusty iron gates. A great iron wheel stands on the walkway, as tall as a man, wrapped in old chains.',
    gm: 'The channel feeds the moat around the Rat King\'s throne. Turning the wheel (DC 13 Athletics, or two heroes together) drops the gates and stops the flow: in ten minutes the moat drains to sticky mud (difficult ground, no swimming). The grinding is loud: the King knows company is coming. The walkways continue south to the Court of Junk.',
  });
  b.water(38, 54, 3, 8, true);
  for (let x = 38; x <= 40; x++) b.door(x, 56, 's', 'open', 'portcullis');
  b.prop('winch', 36, 56).prop('chains-hanging', 42, 55).prop('lever', 42, 58).prop('mold-patch', 36, 59).prop('lantern-hook', 43, 54, 0, { off: true });
  b.floor(41, 60, 3, 2, 'brick-floor').floor(35, 60, 2, 2, 'brick-floor');
  b.props_('stairs-down', [[42, 60], [35, 60]]);

  // ----- the old cistern hall (west) -----
  b.room('Old cistern hall', 2, 56, 15, 14, {
    mat: 'stone-flagstone',
    read: 'A vast old hall of brick pillars standing in a black pool. Water drips from the vaulted ceiling with a sound like slow clapping. Up in the dark between the arches, something rustles.',
    gm: 'The city\'s first water tank, long forgotten. Six stirges roost in the vaults and drop on anyone with a light who walks the edge. The pool is 15 ft deep. At the bottom (DC 12 Athletics to dive, DC 13 Perception to spot the glint) lies a lamplighter\'s lockbox Jory dropped here years ago.',
  });
  b.pool(9, 63, 5, 4, true);
  b.props_('pillar-square', [[4, 58], [14, 58], [4, 68], [14, 68], [9, 58], [9, 68]]).prop('stairs-down', 8, 56).prop('skeleton-lying', 15, 63).prop('cobweb-corner', 2, 56).prop('gm-treasure', 9, 64, 0, { gm: true }).prop('stalactites', 3, 63);
  b.floor(8, 54, 2, 2, 'stone-flagstone');
  b.encounter('Stirges in the vaults', [2, 56, 15, 14], [['stirge', 6]], 'low');

  // ----- Old Toothy's sump -----
  b.cave("Old Toothy's sump", 23, 60, 3.8, 3.4, {
    seed: 17, mat: 'cave-floor',
    read: 'The brick gives way to a rough, round hole where the sewer has eaten into the earth. A pool of thick water fills most of it. A log floats in the middle. Logs do not usually have eyes.',
    gm: 'Old Toothy is a crocodile that came up the river as a baby and never left. Everyone in Lower Wick says he is a myth. He is not. He ignores anyone who throws him meat (a ration, or Mabel\'s sausages) and fights only in the water. The rat tunnel on the east side squeezes (one square wide) to the Court of Junk: the urchins call it the Back Stair.',
  });
  b.pool(23, 60, 2.3, 1.9, true);
  b.props_('bones-mud', [[20, 59], [25, 60]]).prop('log-fallen', 22, 63).prop('reeds', 25, 57).prop('skull-bleached', 20, 61);
  b.floor(23, 54, 2, 3, 'cave-floor');
  b.hall(16, 62, 19, 62, 1, brick);
  b.tunnel([[25, 62], [26, 63], [27, 66], [28, 68]], 1, { mat: 'cave-floor', seed: 19 });
  b.encounter('Old Toothy', [19, 56, 9, 9], [['crocodile', 1]], 'low');

  // ----- the Low Drain (south-west) -----
  b.floor(4, 72, 24, 4, 'brick-floor').water(4, 73, 24, 2, false);
  b.hall(9, 70, 9, 71, 2, brick);
  b.area('The Low Drain', [[4, 72, 24, 4]], {
    read: 'A low, arched drain where you must stoop. The water is ankle-deep and oddly warm. Little paper boats, folded by children, bob along with the current.',
    gm: 'The quiet way from the cistern to the Court of Junk. The paper boats are Pip\'s: messages for the King ("PLEES CAN WE HAV SAWSIJ"). Following the boats leads right to the throne room\'s west side.',
    label: [14, 72],
  });
  b.props_('puddle', [[6, 72], [24, 75]]).prop('lantern-hook', 16, 75, 0, { off: true }).prop('rope-coil', 26, 72);

  // ----- the Court of Junk: the Rat King's throne room -----
  b.room('Court of Junk', 28, 62, 21, 15, {
    mat: 'brick-floor',
    read: 'Light! Hundreds of stolen lamps, lanterns and candle stubs blaze from every ledge of a great brick hall. In the middle, on an island of junk ringed by black water, a throne built from a broken carriage, three lamp posts and a bathtub towers over a sea of shiny loot. On it sits a scrawny man in a lamplighter\'s coat, wearing a brass lamp-snuffer as a crown. Hundreds of rats turn to look at you.',
    gm: 'Jory Flint, the Rat King. He talks first, always: grand, theatrical, and very funny, but under it he is furious about Grumm and terrified for the children. He wants the heroes to leave, or better, to join him on Lamp Night. See "Talking to the King" in his notes. If it comes to a fight, he changes into a huge rat-man, hurls junk, bites, and flees at 10 hit points through a rat hole to his den.',
  });
  b.water(30, 64, 17, 11, true);
  b.floor(33, 67, 11, 5, 'dirt');
  b.floor(34, 64, 2, 3, 'wood-planks').floor(37, 72, 2, 3, 'wood-planks');
  b.water(38, 62, 3, 2, true);
  b.props_('bridge-plank', [[39, 62], [39, 63]]);
  b.prop('throne', 38, 68).prop('throne-dais', 38, 69).prop('bathtub', 36, 68).props_('lamp-post', [[34, 68], [42, 68], [40, 70]]).prop('treasure-pile', 41, 69).prop('coin-stacks', 35, 70).prop('crown-cushion', 39, 70).prop('broken-furniture', 33, 71).prop('debris-wood', 43, 67);
  b.props_('lantern-cluster', [[29, 62], [47, 62], [28, 76], [48, 76], [37, 67], [43, 71]]).props_('candles', [[30, 63], [46, 63], [29, 75], [47, 75]]).props_('loot-sacks', [[31, 75], [45, 75]]).props_('crate-pile', [[28, 66], [48, 70]]).prop('banner-hanging-tall', 38, 62).prop('bone-heap', 29, 70);
  b.light(38, 68, 20, 30, '#ffd27a').light(29, 62, 15, 20, '#ffb35c').light(47, 62, 15, 20, '#ffb35c').light(28, 76, 15, 20, '#ffb35c').light(48, 76, 15, 20, '#ffb35c').light(43, 71, 10, 15, '#ffd27a');
  b.encounter('Court of the Rat King', [28, 62, 21, 15], [['wererat', 1]], 'high');

  // ----- Jory's den and the royal treasury (behind the throne room) -----
  b.floor(49, 69, 3, 1, 'brick-floor').door(48, 69, 'e', 'secret');
  b.room("Jory's den", 52, 66, 10, 7, {
    mat: 'wood-planks',
    read: 'A tidy little room, swept clean. A bed with a patched quilt, a kettle, a shelf of lamps polished till they shine. On the wall hangs a framed paper with a big red stamp: REJECTED.',
    gm: 'Where Jory lives when he is not being a king. The framed paper is his petition to the council (handout: Jory\'s petition). On the desk: a list of every urchin\'s name and birthday, and a half-written letter to Old Nan. A hero who reads it (DC 10 Insight, or just reading it aloud) understands Jory perfectly. A secret door (DC 14 Perception from the throne room side) opens behind the junk. The east door leads to the Lamplighters\' crawl.',
  });
  b.prop('bed', 53, 67).prop('nightstand', 54, 67).prop('stove', 60, 67).props_('wall-shelves', [[56, 66], [58, 66]]).prop('writing-desk', 57, 70).prop('chair', 57, 71).prop('rug', 55, 69).prop('lamp-table', 60, 71).prop('coat-rack', 61, 69).prop('book-pile', 53, 71);
  b.light(60, 71, 10, 15).light(56, 66, 5, 10);
  b.floor(56, 73, 1, 1, 'stone-flagstone').door(56, 72, 's', 'closed');
  b.room('Royal treasury', 52, 74, 10, 5, {
    mat: 'stone-flagstone',
    read: 'Sacks, crates and baskets, each with a chalk label: BOOTS. KETTLES. MRS ODDY\'S SPOONS. LAMP OIL (LOTS). In the corner, a small iron chest is labelled FOR THE WIDOW.',
    gm: 'Everything the rats stole, sorted by who it belongs to, waiting to be given back once Jory "wins". Most of it is worth little, but it means a lot to the quarter: returning it makes the heroes heroes in Lower Wick. The barred gate to the Court of Junk is locked (DC 12 thieves\' tools; Jory has the key).',
  });
  b.props_('loot-sacks', [[53, 75], [55, 77]]).props_('crate-stack', [[60, 75], [61, 77]]).prop('barrel-group', 58, 77).prop('strongbox', 52, 78).prop('produce-crates', 57, 75).prop('coin-stacks', 54, 77);
  b.hall(49, 75, 51, 75, 1, brick).door(48, 75, 'e', 'locked', 'bars');

  // ----- the collapsed crypt (east) -----
  b.cave('Collapsed crypt', 68, 51, 6.4, 6.8, {
    seed: 83, mat: 'dungeon-slab',
    read: 'The sewer wall has burst into somewhere much older. Stone coffins lie tumbled among fallen bricks, and the names on them are worn smooth. Grey slime glistens on a broken lid. Something in a coffin knocks, twice.',
    gm: 'A forgotten crypt under Paupers\' Yard. Three skeletons rise from the coffins, and the "slime" on the lid is a gray ooze that eats metal. In the deepest niche lies a skeleton in a rotten coat with a rat\'s skull pendant: the old Rat King, the wererat who bit Jory and died years ago. Jory buried him here himself. A loose stone at the back (DC 13 Perception) is a secret way into the Lamplighters\' crawl.',
  });
  b.rubble(63, 46, 4, 3).rubble(70, 55, 3, 2);
  b.props_('sarcophagus-open', [[64, 50], [71, 49]]).props_('sarcophagus', [[66, 54], [72, 52]]).prop('tomb-niche', 73, 48).prop('skeleton-lying', 73, 49).prop('green-slime', 68, 49).props_('ceiling-rubble', [[65, 47], [70, 56]]).prop('bone-heap', 63, 53).prop('candles', 67, 52).prop('gm-treasure', 72, 50, 0, { gm: true });
  b.floor(61, 50, 2, 4, 'dungeon-slab').water(61, 51, 1, 2, false);
  b.encounter('Restless crypt', [61, 44, 15, 15], [['skeleton', 3], ['gray-ooze', 1]], 'moderate');

  // ----- the Lamplighters' crawl: from the hidden oil store down inside the wall to Jory's den -----
  b.tunnel([[76, 6], [77, 16], [76, 26], [77, 36], [77, 46], [78, 56], [77, 64], [74, 69], [62, 69]], 1, { mat: 'brick-floor', seed: 91 });
  b.floor(73, 51, 4, 1, 'dungeon-slab').door(72, 51, 'e', 'secret');
  b.area("Lamplighters' crawl", [[76, 7, 2, 60], [62, 68, 14, 2]], {
    read: 'A tunnel so narrow your shoulders brush both walls. Iron rungs, brass hooks for lamps, and the words LIGHT THE WAY HOME painted on the brick every hundred feet.',
    gm: 'Built for lamplighters to reach the wall lamps from inside. One square wide all the way: no room to pass, fight two abreast or turn a cart. It is the secret back way from the guild hut to Jory\'s den, and Jory\'s own escape route. A hero who comes this way and waits in the den gets to surprise the King, or to have a quiet word with him alone.',
    label: [77, 30],
  });
  unlit(b, 'lantern-hook', [[77, 20], [77, 40], [77, 60]]);

  // scatter a little life: puddles and rat droppings in the drains
  for (let i = 0; i < 10; i++) {
    const x = 4 + Math.floor(r() * 26), y = r() < 0.5 ? 50 : 53;
    if (b.isFloor(x, y)) b.prop(r() < 0.5 ? 'puddle' : 'mud-patch', x, y);
  }

  b.note(10, 42, 'Ladder: the cellar drain drops 15 ft from the Gutter Swan cellar to the Swan Drop.');
  b.note(25, 38, 'Ladder: the market manhole drops 20 ft from Ha\'penny Square to the Brass Collars\' camp.');
  b.note(50, 39, 'Slide: the Rag Court storm drain is a smooth brick slide into the Nest. Climbing back up needs a rope.');
  b.note(66, 40, 'Rubble chute: the sinkhole in Paupers\' Yard drops into the Collapsed crypt.');
  b.note(77, 10, 'Ladder and crawl: from the hidden oil store down inside the city wall to Jory\'s den.');
  return b.build();
}

export const RAT_KING_SEWERS: Adventure = {
  id: 'rat-king-sewers',
  title: 'The Rat King of Lower Wick',
  tagline: 'The rats of the poorest quarter steal in gangs, and the children swear a crowned rat gives the orders.',
  levels: '1',
  sessions: '1 session (3-4 hours)',
  players: '3-5 players',
  tags: ['one-shot', 'starter', 'city', 'sewers', 'funny', 'can be talked out'],
  pitch:
    'Harrowmouth is a busy river city, and Lower Wick is the bit it would rather forget: leaning tenements, a stinking gutter canal called the Slop, and not one working street lamp. For a month now the rats of Lower Wick have been stealing in organised gangs, marching in lines, carrying off sausages, boots and every drop of lamp oil in the quarter. The children all swear the same thing: a rat in a tiny crown gives the orders. Tonight the rats robbed the Gutter Swan, the cheapest inn in the city, while you were eating supper there. The landlady is furious, and she has just noticed you are armed.',
  secret:
    'The Rat King is Jory Flint, the last lamplighter of Lower Wick. Six years ago Lamp Warden Osgood Grumm stopped buying oil for the quarter\'s lamps ("the poor don\'t read at night") but kept collecting the lamp tax and pocketing it. Jory lit the lamps with his own money until he was broke, petitioned the council (rejected), then stole oil from the Warden\'s store. Grumm\'s hired rat-catchers beat him and threw him down a storm drain. In the dark, a dying wererat bit him. Jory woke up changed, and the rats followed him. Now he rules the sewers, protects a band of homeless urchins, and has his rats steal back from the city that cheated him. Why now: tomorrow is Lamp Night, when the rich of Upper Harrowmouth light a thousand lanterns and Grumm makes a speech. Jory plans the Great Nibble: every rat in Lower Wick will steal every lantern in the hall mid-speech, while the urchins pick pockets in the panic. It will be very funny for about an hour. Then the council will open the river sluices and flood the sewers to "clean out the vermin", drowning the children Jory protects. Grumm has already hired the Brass Collars to kill the Rat King first, to make sure nobody asks where the lamp money went.',
  hooks: [
    'Mabel Gristle of the Gutter Swan offers 10 gp each, free beds and free supper for a month to whoever brings back her cheese and stops the raids.',
    'A notice on every corner: BY ORDER OF THE LAMP WARDEN, 10 GOLD FOR THE SO-CALLED RAT KING, DEAD (handout). The Brass Collars want it too.',
    'One of the heroes wakes in the Gutter Swan to find their boots gone, and in their place a polite note: "On loan to the Crown. Will return. Sorry. - P."',
  ],
  tips: [
    'This is a first adventure. Teach as you go: one new rule per fight (difficult ground in the drains, swimming in the Slop, hiding from stirges, talking instead of fighting).',
    'There are many ways down: the inn cellar, the market manhole, the outfall arch at the end of the Slop, the storm drain in Rag Court, the sinkhole in Paupers\' Yard and the secret crawl from the guild hut. Let the players pick; all of them work, and the sewer loops back on itself so nobody gets stuck.',
    'Silver matters. In rat form Jory shrugs off ordinary weapons. Old Nan\'s two silver-capped lamplighter\'s poles, magic and spells all hurt him, and in human form anything does. Make sure the players hear about the poles before the finale.',
    'A bite from Jory carries his curse. For a first adventure, keep it simple: it only takes hold at the next full moon, and Jory can lift it from anyone he bit if he is won over (or a temple cures it for 50 gp).',
    'Almost every fight can be talked out: the urchins, the herald, the crocodile (with meat), even the Brass Collars. Reward clever and kind ideas with advantage.',
    'Short on time? Skip the cistern, the sump and the crypt. Players stuck? Have Pip turn up and offer to guide them, for a sausage.',
  ],
  npcs: [
    {
      id: 'pf_rkjory', name: 'Jory Flint', title: 'the Rat King of Lower Wick', kind: 'monster', art: 'wererat', monsterId: 'wererat',
      wants: 'Justice for Lower Wick, the lamps lit again, and the children safe. Also, secretly, to stop being a rat.',
      knows: 'Every pipe under the city, every secret of the quarter, and exactly how much lamp tax Grumm has stolen (212 gp a year, for six years).',
      voice: 'Grand and theatrical, like a bad actor playing a king ("We are DISPLEASED"). When he forgets himself, he talks like a tired working man.',
      appearance: 'A scrawny man of forty in a patched lamplighter\'s coat, with whiskers that are a little too long and a brass lamp-snuffer worn as a crown. In rat form, a hunched grey rat-man the size of a door.',
      backstory: 'The last lamplighter of Lower Wick. Cheated by Warden Grumm, beaten by the Brass Collars and thrown in the sewer, where a dying wererat bit him. He thinks the rats chose him.',
      gmNotes: 'Talking to the King: he starts hostile but listening. Each of these lowers the DC of a Persuasion check to end it peacefully (start at DC 16, -3 for each): the lamp-tax book as proof, a promise to take it to the council, the lamps of Dead Lamp Lane lit, a safe place for the urchins (Mabel will take them on), Old Nan\'s word. At DC 10 or less he agrees without a roll. In a fight he uses his hybrid form (immune to non-silvered weapons), hurls junk (hand crossbow stats), calls the rats with a squeak (they are only a distraction: they make the ground difficult) and flees at 10 HP through a rat hole to his den. He never fights to the death, and never harms a child.',
    },
    {
      id: 'pf_rkmabel', name: 'Mabel Gristle', title: 'landlady of the Gutter Swan', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'Her cheese back, the raids stopped, and someone to blame.',
      knows: 'The rats come up through her cellar drain. A barefoot girl with a red ribbon held the door for them. Old Nan at the guild hut "knows more about rats than she lets on".',
      voice: 'Loud enough to shake the mugs. Calls everyone "my duck". Softens instantly around children.',
      appearance: 'A big, red-armed woman in a flour-dusted apron, holding a rolling pin like a club.',
      gmNotes: 'Under the bluster she is kind. If the heroes tell her the truth about the urchins, she offers them work and the inn\'s attic: one of the ways to win Jory over.',
    },
    {
      id: 'pf_rkpip', name: 'Pip Lowly', title: 'Royal Tastetester to the Rat King', kind: 'npc', art: 'child', shared: true,
      wants: 'Sausages. Also for nobody to hurt the King, and to be allowed to keep her rat, Baron Squeak.',
      knows: 'The whole sewer. She drew a chalk map of it and dropped a page. She knows about the secret door behind the throne and the crawl to the guild hut.',
      voice: 'Fast, cheeky and missing two front teeth, so her S-es whistle. Gives everyone a title ("Lord Big Sword").',
      appearance: 'A nine-year-old girl with a red ribbon in her matted hair, bare feet and a rat on her shoulder.',
      gmNotes: 'The heroes see her in the opening scene. Caught, she bargains; fed, she guides. She is the easiest way to make the urchins and Jory trust the heroes.',
    },
    {
      id: 'pf_rkmoll', name: 'Moll Candle', title: 'chief of the Wick Ends', kind: 'monster', art: 'bandit', monsterId: 'bandit',
      wants: 'To keep the little ones fed, hidden and alive.',
      knows: 'That the King is planning "a big night" tomorrow, and that the Brass Collars killed one of the King\'s rats in front of Pip.',
      voice: 'Flat, suspicious, short sentences. Never says please.',
      appearance: 'A tall, bony sixteen-year-old with a cudgel, a scarf over her mouth and a burn scar on one hand.',
      gmNotes: 'Uses the bandit stat block with a club. Gives up the moment the little ones are threatened, and never forgets a kindness.',
    },
    {
      id: 'pf_rknibbles', name: 'Sir Nibbles', title: 'Herald of the Crown', kind: 'monster', art: 'giant-rat', monsterId: 'giantRat',
      wants: 'To deliver his proclamation with dignity, and a piece of cheese.',
      knows: 'The way to the throne. He can only squeak, but he nods and shakes his head very clearly.',
      voice: 'Three squeaks for "hear ye", one long one for "follow me".',
      appearance: 'A fat giant rat with a thimble helmet tied on with string and a scrap of red ribbon round his neck.',
      gmNotes: 'Uses the giant rat stat block. If the heroes bow, he leads them to the King by the shortest way and the sentries stand aside.',
    },
    {
      id: 'pf_rknan', name: 'Old Nan Wickery', title: 'the last lamplighter but one', kind: 'npc', art: 'commoner', shared: true,
      wants: 'To see the lamps of Lower Wick lit once more before she dies, and her "Jory boy" safe.',
      knows: 'Jory\'s whole story, Grumm\'s cheating, and the secret door from her room to the oil store and the crawl.',
      voice: 'Slow and creaky, full of old lamplighters\' sayings ("Dark\'s only dark till someone strikes a match").',
      appearance: 'A tiny, bent old woman with soot in the lines of her hands and a brass lamplighter\'s badge on her shawl.',
      gmNotes: 'Lends the two silver-capped poles to heroes who promise to try talking first. If she comes along to the throne room (she is slow), Jory cannot bring himself to fight in front of her.',
    },
    {
      id: 'pf_rkbrask', name: 'Brask Hollin', title: 'boss of the Brass Collars', kind: 'monster', art: 'thug', monsterId: 'thug',
      wants: 'The 10 gold bounty on the Rat King, and every copper he can squeeze out of anyone else.',
      knows: 'That Grumm hired him personally, paid half up front, and said "make sure the lamplighter fellow doesn\'t talk". Brask also beat Jory six years ago, and has not put the two together.',
      voice: 'A cheerful, wheezing bully who laughs at his own threats.',
      appearance: 'A barrel-shaped man in a leather apron and a dog collar of brass studs, with a sack of dead rats over his shoulder.',
      gmNotes: 'Uses the thug stat block. His crew: Big Ennis (thug), two bandits and Biscuit the dog (mastiff). Shown the lamp-tax book, he realises Grumm cheated the quarter he grew up in, and may even turn on Grumm (DC 13 Persuasion).',
    },
    {
      id: 'pf_rksully', name: 'Sully Narrows', title: 'collector of the lamp tax', kind: 'npc', art: 'merchant',
      wants: 'To go home at midnight with the moneybag and never think about where it goes.',
      knows: 'Grumm takes every copper of the lamp tax. The council plans to open the sluices and flood the sewers the morning after Lamp Night, "to clear the vermin".',
      voice: 'Nervous and wet, apologises for everything, sniffs.',
      appearance: 'A soft, pale clerk in an ink-stained coat with a big brass key on a chain.',
      gmNotes: 'Folds under pressure. Promise to keep his name out of it and he hands over the tax book himself.',
    },
    {
      id: 'pf_rkgrumm', name: 'Osgood Grumm', title: 'Lamp Warden of Harrowmouth', kind: 'npc', art: 'noble', monsterId: 'noble',
      wants: 'To be admired at Lamp Night, and for nobody to look at his accounts.',
      knows: 'That he has stolen over a thousand gold in lamp tax, and that the Rat King is the one man who can prove it.',
      voice: 'Smooth and pleased with himself; says "regrettable" a lot.',
      appearance: 'A plump, pink man in a velvet coat with a golden lamp pinned to his chest.',
      gmNotes: 'Not in the sewers. He appears in the ending: at the council, or at the Lamp Night feast, to be exposed or to take the credit.',
    },
  ],
  handouts: [
    { id: 'bounty', title: 'A notice on every corner', text: 'BY ORDER OF THE LAMP WARDEN\nA reward of TEN GOLD CROWNS for the creature calling itself\nTHE RAT KING\nbrought in DEAD.\nOne copper per rat tail.\nThe lamp tax remains due on the first of the month.\n- O. Grumm, Lamp Warden' },
    { id: 'proclamation', title: 'The Royal Proclamation (carried by Sir Nibbles)', text: 'HEAR YE HEAR YE\nBy order of HIS WISKERD MAJESTY JORY THE FIRST AND LAST\nKING OF THE DRANES AND LORD OF LOWER WICK\nTHE BIG FOLK will go back up the ladder NOW\nor be NIBBELD.\nUnless you brung sausijis. Then you can come.\n(rote by Pip, Royal Tastetester)' },
    { id: 'pip-map', title: "A page of Pip's chalk map", text: 'A child\'s drawing in chalk on brown paper:\nSWAN (cheese!) -> DOWN -> BIG DRANE\nBIG DRANE -> waterfall -> KINGS STARE -> big wheel -> KING\nDONT go in the drippy hall (bitey birds)\nDONT feed the log\nsecret: Nan\'s room -> long thin tunnel -> King\'s bedroom' },
    { id: 'tax-book', title: 'The lamp-tax book (last page)', text: 'LOWER WICK - LAMP TAX\nCollected this year: 212 gp 4 sp\nLamp oil bought: none\nLamplighters paid: none\nLamps repaired: none\nTransferred to the Warden\'s private account: 212 gp 4 sp\n(The same, every year, for six years. Each page is signed O. Grumm.)' },
    { id: 'petition', title: "Jory's petition (framed, in his den)", text: 'To the Honourable Council of Harrowmouth.\nThe lamps of Lower Wick have been dark for two winters. Children get lost. Old folk fall in the Slop. We pay the lamp tax same as Upper Harrowmouth.\nI ask only for oil. I will light them myself, for no wage.\nYour humble servant,\nJory Flint, Lamplighter\n\n[stamped in red] REJECTED. NOT A PRIORITY. - O.G.' },
  ],
  chapters: [
    {
      id: 'lower-wick', title: 'Lower Wick, above and below', level: 1,
      summary: 'From a rat raid on a cheap inn, through the dark streets of the poorest quarter and down into the sewers, to the junk throne of the Rat King.',
      goal: 'Stop the rat raids and deal with the Rat King before Lamp Night, by sword or by setting right what was done to him.',
      map: lowerWick,
      npcs: [
        { npc: 'pf_rkmabel', x: 11, y: 26 },
        { npc: 'pf_rksully', x: 26, y: 7 },
        { npc: 'pf_rknan', x: 70, y: 4 },
        { npc: 'pf_rkbrask', x: 24, y: 45, hidden: true },
        { npc: 'pf_rknibbles', x: 35, y: 44, hidden: true },
        { npc: 'pf_rkmoll', x: 51, y: 47, hidden: true },
        { npc: 'pf_rkpip', x: 55, y: 45, hidden: true },
        { npc: 'pf_rkjory', x: 38, y: 69, hidden: true },
      ],
      scenes: [
        {
          room: 'The Gutter Swan', title: 'A cheese most foul',
          read: 'A shriek from the kitchen. A whole wheel of cheese rolls across the taproom floor, pushed by six rats walking in step, while a barefoot girl with a red ribbon holds the kitchen door. On top of the cheese rides a rat wearing a thimble. "Long live the King!" squeaks the girl, and they are gone down the cellar steps.',
          gm: 'Pip and Sir Nibbles. Let the heroes try to grab someone (DC 13 Dexterity): even if they catch Pip, she wriggles free unless they offer food. Mabel then hires them (see the hooks). Show the bounty notice: it is nailed to the inn door.',
          handout: 'bounty',
        },
        {
          room: 'Gutter Swan cellar', title: 'Rats in the cellar', encounter: 'Rats in the cellar',
          gm: 'A warm-up fight on even ground. The rats flee down the drain when two are left: follow them to the Swan Drop. If the heroes would rather not go down yet, they can explore the quarter first.',
          treasure: 'Mabel\'s cheese is gone, but a gnawed sack holds 14 sp the rats missed. Mabel adds two potions of healing "for the road".',
        },
        {
          room: "Ha'penny Square", title: 'The market raid', encounter: 'Market raid', optional: true,
          read: 'At dusk the market goes quiet. Then the gutters move. Lines of rats pour out, climb the stalls and start passing sausages, candles and bread hand to hand, toward a manhole by the fish stall.',
          gm: 'A stakeout. Fight the raiders, or follow them (DC 12 Stealth) to the manhole. The stallholders cheer whatever the heroes do. Below the manhole wait the Brass Collars.',
          treasure: 'Grateful stallholders: a sausage string (worth a lot to Pip and Old Toothy), a lantern and 5 gp in coppers.',
        },
        {
          room: "Lamplighters' guild hut", title: "Old Nan's story",
          read: 'An old woman opens the door before you knock. "You\'ve come about the rats," she says. "Then you\'d best come in, and hear about the man who used to light this street."',
          gm: 'Nan tells Jory\'s story (the GM\'s secret, in her words). She lends the silver-capped poles to anyone who promises to try talking first, and shows the secret door to the oil store and the crawl if she trusts them (DC 12 Persuasion, or automatically if they promise to light the lamps of Dead Lamp Lane).',
          treasure: 'Two silver-capped lamplighter\'s poles (quarterstaffs, count as silvered), a barrel of lamp oil (20 flasks), a bullseye lantern.',
        },
        {
          room: 'Lamp-tax house', title: 'The lamp tax', optional: true,
          gm: 'The proof that wins the peaceful ending. Bully, bribe or sneak past Sully Narrows to read the book in the back office. Sully also lets slip the council\'s plan to flood the sewers after Lamp Night: now the heroes know the urchins are in danger.',
          handout: 'tax-book',
          treasure: 'The strongbox holds this month\'s lamp tax: 18 gp 6 sp. It is the quarter\'s money; returning it to Lower Wick is the honest thing (Mabel will share it out).',
        },
        {
          room: "Brass Collars' camp", title: 'The rival crew', encounter: 'The Brass Collars',
          gm: 'Brask offers a partnership and means to betray it. He can be scared off, talked round with the tax book, or fought. If the heroes leave him be, the Collars follow them and turn up in the throne room at the worst moment, as a third side.',
          treasure: 'Brask\'s purse: Grumm\'s down-payment of 5 gp and a note in Grumm\'s hand: "Half now, half when the lamplighter is quiet. - O.G." (more proof). Rat-catcher\'s gear: a net and a good dog collar.',
        },
        {
          room: 'Outfall basin', title: 'The herald of the Crown', encounter: 'Rat sentries',
          read: 'Three sharp squeaks echo over the waterfall. A fat rat in a thimble helmet waddles to the edge of the walkway, drops a damp scroll at your feet, and waits, nose twitching, for you to read it.',
          gm: 'Sir Nibbles and the sentries. Bowing, or offering cheese or sausage, gets the heroes escorted to the King with no fight. Attacking starts the fight; the survivors run to warn Jory.',
          handout: 'proclamation',
        },
        {
          room: 'The Nest', title: 'The Wick Ends', encounter: 'The Wick Ends',
          gm: 'The heart of the adventure: the "thieves" are hungry children. Moll defends them; Pip, if she met the heroes kindly, vouches for them. Once trust is won, the kids tell everything: Lamp Night, the Great Nibble, and the way to the King. They beg the heroes not to hurt him.',
          treasure: 'Nothing worth taking from children. Moll gives a trusted hero the King\'s token, a brass button with a crown scratched on it: shown at the throne, it lowers Jory\'s Persuasion DC by 2.',
        },
        {
          room: 'Old cistern hall', title: 'The drippy hall', encounter: 'Stirges in the vaults', optional: true,
          gm: 'Stirges hunt light and warmth. Walking dark and quiet (DC 12 group Stealth) avoids them. Their sucking bites are a good scary moment for new players, and a lesson about hiding.',
          treasure: 'At the bottom of the pool: Jory\'s old lamplighter\'s lockbox with 30 gp, a spell scroll of Cure Wounds and a driftglobe (Jory\'s "last light").',
        },
        {
          room: "Old Toothy's sump", title: 'Do not feed the log', encounter: 'Old Toothy', optional: true,
          gm: 'A fun surprise. Toothy is happy with a sausage string or a ration thrown in the water; then he sinks out of sight and lets everyone pass to the Back Stair. Fighting him at the water\'s edge is risky for level 1 heroes: let them see the danger and choose.',
          treasure: 'In the mud: a dead burglar\'s boot holding 12 gp and a silver ring (10 gp).',
        },
        {
          room: 'Collapsed crypt', title: 'The first Rat King', encounter: 'Restless crypt', optional: true,
          gm: 'Skeletons and a gray ooze (it corrodes metal weapons that hit it: warn players who look closely, DC 12 Nature). The old Rat King\'s bones lie in the back niche. Bringing Jory the news that someone found and respected his grave softens him. The loose stone leads to the crawl.',
          treasure: 'In the old Rat King\'s niche: 40 gp in very old coins, a pouch of 3 garnets (10 gp each), and a set of carved bone pipes: pipes of the sewers.',
        },
        {
          room: 'Court of Junk', title: 'The court of the Rat King', encounter: 'Court of the Rat King',
          read: '"WHO," booms the man on the junk throne, "DARES enter the court of Jory the First and Last, King of the Drains, Lord of Lower Wick, Keeper of the Lamps?" A rat on his shoulder blows a tiny trumpet made of a pen. Two hundred rats wait for his order.',
          gm: 'The finale. Let Jory talk: he explains Lamp Night with glee. Use the list in his notes to talk him down; every bit of proof and kindness gathered earlier pays off here. If it is a fight, the moat (deep, unless the sluice was closed), the junk bridges and the lamps (knock one over: 1d4 fire, burning ground) make it lively. If the Brass Collars followed, they arrive and attack everyone, which may push Jory and the heroes onto the same side. Jory flees at 10 HP to his den by the secret door. His den, with the framed petition, and the treasury lie behind.',
          handout: 'petition',
          treasure: 'On the island: 60 gp in mixed coins, a potion of healing and Jory\'s brass snuffer crown (25 gp). In the royal treasury: everyone\'s stolen things, Mabel\'s cheese (slightly nibbled), and the iron chest FOR THE WIDOW (24 gp, meant for the widow of a lamplighter). If Jory is won over, he gives the heroes his own reward: a silver lamplighter\'s badge that will open any door in Lower Wick, forever.',
        },
      ],
      wrapUp: 'Back at the Gutter Swan, Mabel pays up and the cheese comes home (mostly). If Jory was won over, the heroes take the tax book to the council and Grumm is ruined at his own Lamp Night feast. The heroes reach level 2.',
    },
  ],
  ending:
    'Best ending: Jory is talked down. The stolen things go back to their owners, the urchins move into the Gutter Swan\'s attic, and on Lamp Night the heroes stand up at the feast with the tax book. Grumm is thrown out, the council pays for oil, and that night the lamps of Lower Wick are lit for the first time in six years, by a scrawny lamplighter with whiskers that are just a little too long. Good ending: Jory is beaten or flees. The raids stop, Grumm pays the bounty and takes the credit, and Lower Wick stays dark. The urchins scatter, and someone should warn them before the council floods the sewers. Bad ending: the heroes give up or fail. The Great Nibble happens, Lamp Night ends in a stampede, the council opens the sluices, and Lower Wick never forgives anyone. What next: Grumm has friends on the council and a long memory. A bitten hero may grow whiskers at the next full moon. And the old Rat King in the crypt was bitten by someone too.',
};
