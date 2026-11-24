// Heist at the Gilded Ledger: a two-part caper for four heroes of level 5.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, type Side } from './builder';
import type { Adventure } from './types';

/** A little shack or lean-to: four thin walls and one door, no name of its own. */
function shack(b: MapBuilder, x: number, y: number, w: number, h: number, door: [number, number, Side]) {
  b.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e');
  b.door(door[0], door[1], door[2], 'closed');
}

// ---------- Part 1: the canal district by day ----------
function canalDistrict() {
  const b = new MapBuilder('adv-gilded-ledger-day', 'Vessaline canal district by day', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'bright', wallStyle: 'stone' });

  // the Gilt Water (grand canal) splits the rich north bank from the Tallow Ward
  b.water(0, 34, 80, 6, false).water(0, 35, 80, 4, true);
  b.room('Coin Bridge', 18, 34, 4, 6, {
    mat: 'stone-flagstone',
    read: 'A humped stone bridge, worn smooth by a thousand years of feet. Beggars on the south end, bankers on the north, and nobody looks at anybody.',
    gm: 'The main crossing. Two watch guards stand at the north end by day. Anyone in Tallow Ward rags gets a hard look (DC 12 Deception or Persuasion to pass without questions).',
  });
  b.props_('lamp-post', [[18, 34], [21, 39]]).prop('signpost', 20, 33).light(18, 34, 10, 10);
  b.room('Tallow Bridge', 60, 34, 3, 6, {
    mat: 'wood-planks',
    read: 'A rickety wooden bridge with half its rail gone. Under it, the green water is very still, and very deep.',
    gm: 'The Ward\'s own bridge. Old Grandmother, a huge crocodile, suns herself on the mud below. Locals throw her fish heads for luck. She is not interested in anyone who brings her a fish (DC 12 Animal Handling).',
  });
  b.props_('mooring-post', [[59, 33], [63, 40]]);
  b.props_('rowboat', [[10, 37], [27, 36], [44, 37], [70, 36]], 90).prop('canoe', 54, 36, 90).prop('lily-pads', 66, 38).prop('reeds', 77, 39);
  b.encounter('Old Grandmother', [52, 34, 20, 6], [['giant-crocodile', 1]], 'low');

  // ----- the north bank: money -----
  b.paint(20, 0, 23, 8, 'stone-flagstone');
  b.area('Mint Square', [[20, 0, 23, 8]], {
    read: 'A square of white flagstones round a fountain where a bronze woman pours coins from a jar. Clerks eat their lunch on the benches and pretend not to see the pickpockets.',
    gm: 'A good place to watch the Gilded Ledger\'s front door. Three hours here (DC 13 Insight or Perception) show that the day guards change at noon and that the head clerk always leaves at six with a key on a chain.',
  });
  b.prop('fountain-grand', 31, 3).props_('tree-oak', [[21, 1], [41, 1], [21, 6], [41, 6]]).props_('bench-long', [[26, 1], [36, 1], [26, 6], [36, 6]]).props_('flowers', [[29, 6], [34, 6]]).prop('statue-tall-winged', 31, 7);
  b.building('Assay office', 2, 1, 13, 6, {
    mat: 'marble',
    read: 'Scales, sealing wax and silence. A sign says ALL STRONGROOMS IN VESSALINE MUST LODGE THEIR PLANS HERE. A bored clerk is weighing a single coin, again and again.',
    gm: 'The city keeps a copy of every strongroom plan here, by law. Clerk Bertil Fane will let a "surveyor" copy the Gilded Ledger\'s plans for a 25 gp "filing fee" or a DC 14 Deception with forged papers. He also gossips: Pell bought "a thinking statue" from a wizard two years ago and had it carried into the vault.',
    doors: [[8, 6, 's', 'closed']], windows: [[4, 6, 's'], [12, 6, 's']],
  });
  b.prop('scales', 4, 2).prop('map-cabinet', 13, 2).prop('desk', 8, 3).prop('chair', 8, 4).prop('archive-stacks', 3, 4);
  b.building('Lamp shop', 60, 1, 12, 6, {
    mat: 'wood-planks-dark',
    read: 'A shop full of lanterns, all lit, though it is broad day. Every shade is dark red velvet.',
    gm: 'The front of the Velvet Lantern, a crew of thieves. The shopkeeper (a spy) sells lamps and knows nothing, loudly. A DC 15 Investigation finds the back-room board: a sketch of the Gilded Ledger with "13th, third bell" written on it.',
    doors: [[65, 6, 's', 'closed']], windows: [[62, 6, 's'], [69, 6, 's']],
  });
  b.prop('shop-counter', 62, 2).props_('lantern-cluster', [[64, 2], [67, 2], [70, 4]]).prop('display-case', 61, 4).prop('war-table', 69, 2).prop('lamp-table', 66, 4).light(66, 3, 15, 20, '#ff6b6b');
  b.area("Jewellers' houses", [[44, 0, 15, 7], [73, 0, 7, 7]], {
    read: 'Tall narrow houses with barred windows and brass door-knockers shaped like lions. Every one has a dog.',
    gm: 'Goldsmiths live over their shops. Nothing here for the job, but a hero who asks around (DC 13 Persuasion) hears that Pell\'s night porters play dice and lose, and are always short of money.',
    label: [50, 3],
  });
  shack(b, 45, 1, 6, 5, [47, 5, 's']);
  shack(b, 52, 1, 6, 5, [54, 5, 's']);
  shack(b, 74, 1, 6, 5, [76, 5, 's']);
  b.props_('bed', [[46, 2], [53, 2], [75, 2]]).props_('wardrobe', [[49, 2], [56, 2], [78, 2]]);
  b.area('Gilt Alley houses', [[19, 15, 6, 12]], {
    gm: 'Two clerks\' houses squeezed between the watch house and the Ledger. The alley behind them is the quietest way from the Row to the Gilt Quay.',
    label: [21, 20],
  });
  shack(b, 19, 15, 6, 5, [21, 15, 'n']);
  shack(b, 19, 22, 6, 5, [21, 26, 's']);
  b.props_('bed', [[23, 16], [23, 23]]).props_('table-square', [[20, 17], [20, 24]]).props_('chair', [[21, 17], [21, 24]]);
  b.area("Goldsmith's Row", [[0, 8, 80, 5]], {
    read: 'The richest street in Vessaline. Every shop has a guard, every guard has a sword, and every window is full of gold.',
    gm: 'The front of the Gilded Ledger is here. The watch walks the Row every quarter hour by day. Open crime here is a bad idea: starting a fight raises the night\'s starting alarm by 1.',
    label: [10, 10],
  });
  b.props_('lamp-post', [[4, 8], [16, 8], [28, 12], [46, 8], [58, 12], [76, 8]]).props_('market-stall', [[47, 10], [51, 10]]).prop('cart', 74, 10).props_('hitching-post', [[24, 9], [52, 12]]).prop('signpost', 19, 12).prop('flowers', 57, 8);

  b.building('The watch house', 3, 14, 15, 14, {
    mat: 'stone-flagstone',
    read: 'A squat stone house with barred windows. Inside: a desk, a chalkboard covered in names and times, a rack of halberds and a smell of old soup.',
    gm: 'The Row\'s watch house. The duty board (handout: the roster) is on the wall behind the desk: reading it from the door takes a DC 13 Perception, or a good excuse to stand near it. Sergeant Tibbet Crane is off drinking at the Drowned Penny. The cells hold two Tallow Ward debtors waiting for Quarter-Day.',
    doors: [[10, 14, 'n', 'closed'], [10, 27, 's', 'closed'], [12, 20, 's', 'closed']], windows: [[5, 14, 'n'], [15, 14, 'n']],
  });
  b.wallRun(3, 20, 15, 's').wallRun(8, 21, 7, 'e', 'bars').door(8, 24, 'e', 'locked', 'bars');
  b.prop('desk', 7, 16).prop('chair', 7, 17).prop('notice-board', 4, 15).props_('weapon-rack', [[16, 15], [16, 16]]).prop('armor-stand', 16, 18).prop('table-cards', 12, 17).props_('stool', [[11, 17], [13, 17]]).props_('cot', [[4, 22], [4, 26]]).prop('key-ring', 13, 23).prop('stove', 15, 26).prop('bench-long', 12, 25).light(12, 17, 10, 10);
  b.encounter('Trouble at the watch house', [3, 14, 15, 14], [['knight', 1], ['veteran', 1], ['guard', 10]], 'low');

  b.building('The Gilded Ledger', 26, 14, 25, 8, {
    mat: 'marble',
    read: 'Gold leaf on every pillar. A long counter of brass cages, a clerk behind each, and a smiling statue of the owner in the middle of the floor, painted gold from head to toe.',
    gm: 'The public hall, open from eight to six. Anyone can walk in to change money or ask about a loan. Asking for a loan (DC 13 Persuasion) gets a tour of the counter and a look at the iron door to the back. Magister Pell shows himself at noon to be admired.',
    doors: [[37, 14, 'n', 'open', 'door-double'], [38, 14, 'n', 'open', 'door-double'], [38, 21, 's', 'locked', 'door-iron']], windows: [[29, 14, 'n'], [46, 14, 'n'], [26, 18, 'w'], [50, 18, 'e']],
  });
  b.props_('shop-counter', [[29, 19], [32, 19], [35, 19], [41, 19], [44, 19], [47, 19]]).prop('statue-tall-robed', 38, 17).props_('bench-long', [[28, 15], [48, 15]]).prop('chandelier-crystal', 38, 16).prop('rug-runner', 37, 15).prop('notice-board', 34, 15).props_('column-fluted', [[27, 15], [49, 15]]).light(38, 16, 15, 20);
  b.building('Ledger back rooms', 26, 22, 25, 7, {
    mat: 'wood-planks-dark',
    read: 'Rows of high desks where clerks in grey robes scratch at ledgers. Nobody talks. A brass engine of wheels and dials ticks in the corner.',
    gm: 'Staff only. Getting in by day needs a clerk\'s robe or a DC 15 Deception. A sharp eye (DC 14 Perception) sees the floor stair down to the vault behind a second iron door, and a junior clerk, Nessa Brandt, who keeps glancing at the heroes as if she wants to say something.',
    windows: [[26, 25, 'w'], [50, 25, 'e']],
  });
  b.props_('writing-desk', [[29, 24], [33, 24], [43, 24], [47, 24]]).props_('stool', [[29, 25], [33, 25], [43, 25], [47, 25]]).prop('orrery', 38, 25).prop('archive-stacks', 27, 27).prop('strongbox', 49, 27).prop('stairs-down', 41, 27).prop('scales', 36, 23);
  b.building('Ledger boathouse', 32, 29, 11, 5, {
    mat: 'wood-planks',
    read: 'A slip of black water inside the counting-house wall, with a barge moored in it. A portcullis drops to the canal.',
    gm: 'Coin barges come and go here. From the water, the portcullis teeth stop a foot above the surface: a swimmer can duck under (DC 12 Athletics). The winch to lift it is inside.',
    doors: [[37, 29, 'n', 'locked', 'door-iron'], [32, 31, 'w', 'closed']],
  });
  b.water(35, 30, 5, 4, true);
  for (let x = 35; x <= 39; x++) b.door(x, 33, 's', 'locked', 'portcullis');
  b.prop('rowboat', 37, 31, 0).prop('winch', 33, 30).prop('rope-coil', 41, 32).prop('crate-pile', 41, 30);
  b.area('Gilt Quay', [[0, 29, 80, 5]], {
    read: 'A clean stone quay. Coin barges with brass-capped guards drift past, and nobody fishes here.',
    gm: 'Rowboats can be hired at the Drowned Penny across the water. A boat that idles by the Ledger\'s portcullis draws a guard\'s shout within a minute.',
    label: [12, 31],
  });
  b.props_('mooring-post', [[8, 33], [28, 33], [46, 33], [66, 33]]).props_('barrel-group', [[24, 30], [52, 30]]).prop('crate-stack', 74, 30).prop('anchor', 6, 30);

  b.building('Rooftops of Goldsmith\'s Row', 54, 14, 25, 15, {
    mat: 'dungeon-slab',
    read: 'Slate roofs, chimney pots, pigeon lofts and washing lines, all at one height, like a second street in the sky. From the edge you can see straight down into the Ledger\'s yard.',
    gm: 'A tenement stair (the door off the Row) and a drainpipe from the quay (DC 12 Athletics) lead up. Watching the Ledger from here for an hour gives the night patrol pattern (as good as the roster). The Velvet Lantern has the same idea: their lookouts are already here.',
    doors: [[56, 14, 'n', 'open'], [70, 28, 's', 'closed']],
  });
  b.wallRun(62, 14, 15, 'e', 'low').wallRun(70, 14, 15, 'e', 'low');
  b.props_('pillar-square', [[58, 17], [66, 20], [74, 17], [76, 25]]).prop('chicken-coop', 60, 25).prop('telescope', 55, 20).prop('rope-coil', 68, 24).props_('water-barrel', [[72, 26], [57, 26]]).prop('bedroll', 64, 16).prop('ladder', 56, 13).prop('campfire-cold', 67, 17);
  b.encounter('Lookouts on the roofs', [54, 14, 25, 15], [['doppelganger', 2], ['spy', 4], ['scout', 3]], 'moderate');

  // ----- the south bank: Tallow Ward -----
  b.area('Tallow Quay', [[0, 40, 47, 6], [49, 40, 31, 4]], {
    read: 'Rotting piles, fish guts and children everywhere. Half the doors along the quay have a red wax seal on them: Pell\'s mark for a house that owes.',
    gm: 'The heart of the Ward. Anyone here will talk about Pell and Quarter-Day. Rowboats for hire: 2 sp for the day, or free for whoever helps the Ward.',
    label: [12, 42],
  });
  b.props_('fish-crate', [[14, 41], [15, 41], [56, 41]]).props_('mooring-post', [[2, 40], [24, 40], [44, 40], [66, 40]]).prop('fishing-net', 40, 42).props_('barrel', [[30, 41], [31, 41]]).prop('handcart', 52, 42).props_('lamp-post', [[10, 43], [36, 43], [72, 42]]);

  // the sewer under the Ward
  b.rock(0, 46, 22, 34);
  b.prop('sewer-outflow', 4, 44);
  b.door(4, 46, 'n', 'closed', 'bars');
  b.tunnel([[4, 46], [4, 50]], 1, { mat: 'brick-floor', seed: 31 });
  b.tunnel([[4, 50], [8, 55], [10, 60]], 2, { mat: 'brick-floor', seed: 32 });
  b.water(3, 50, 9, 8, false, true);
  b.area('Sewer outfall', [[3, 44, 3, 8]], {
    read: 'A brick mouth the height of a man spews brown water into the canal. The bars across it are rusted, and two of them have been bent apart and bent back.',
    gm: 'The bent bars swing aside (DC 10 Investigation to notice, then easy). Rat droppings and tiny chalk crowns on the bricks: the Sewer Kings\' sign.',
    label: [4, 47],
  });
  b.cave("Rat Kings' court", 10, 65, 7, 5, {
    seed: 33, mat: 'cave-floor',
    read: 'A cave of old brick and older rock. On a throne of broken chairs sits a skinny man in a crown of bottle-caps, and around him, in the dark, a hundred little eyes.',
    gm: 'King Scuttle (wererat) and his court. They know every drain under Vessaline, including the old culvert that runs under the Gilded Ledger\'s vault (bricked up, but only one brick thick). Scuttle trades: a wheel of good cheese and 50 gp, or a promise that the Ward\'s cellars stay open to his folk. Or he fights, and his rats pour from the walls.',
  });
  b.prop('throne', 10, 62).props_('bone-heap', [[5, 66], [15, 64]]).props_('loot-sacks', [[13, 61], [7, 61]]).prop('candles', 10, 63).prop('broken-furniture', 6, 63).prop('crate-pile', 8, 67).prop('rug-pelt', 10, 66).light(10, 63, 10, 15, '#ffd27a');
  b.encounter('The Sewer Kings', [3, 58, 16, 14], [['wererat', 5], ['swarm-of-rats', 6]], 'moderate');
  b.tunnel([[15, 67], [18, 72], [21, 72]], 1, { mat: 'brick-floor', seed: 35 });
  b.door(21, 72, 'e', 'closed', 'door-iron');
  b.tunnel([[7, 69], [7, 73]], 1, { mat: 'brick-floor', seed: 36 });
  b.cave('Old cistern', 6, 76, 4, 3, {
    seed: 34, mat: 'cave-floor',
    read: 'A round cistern, half full of black water. A skeleton in a burglar\'s dark coat sits on the steps with its feet in the water.',
    gm: 'A thief who tried for the Ledger twenty years ago and got lost. His coat pocket holds an immovable rod and a scrap of a note: "the culvert, under the strongroom. One brick."',
  });
  b.pool(6, 77, 2, 1.5, true).prop('skeleton-seated', 4, 75).prop('backpack', 5, 75).prop('gm-treasure', 4, 76, 0, { gm: true });

  b.mud(22, 46, 3, 10);
  b.building('The Drowned Penny', 26, 46, 15, 11, {
    mat: 'wood-planks',
    read: 'Low beams, a smoky fire, and a copper penny nailed over the bar for every family that has lost its house to Pell. There are a lot of pennies.',
    gm: 'Grissel Hobb\'s tavern, the Ward\'s living room. She hires the heroes here. Sergeant Tibbet Crane drinks here off duty and loses at arm-wrestling: beat him (contested Athletics) or out-drink him (DC 13 Constitution, three rounds) and he brags the whole night patrol, password and all.',
    doors: [[33, 46, 'n', 'closed'], [40, 52, 'e', 'closed'], [26, 52, 'w', 'closed']], windows: [[29, 46, 'n'], [37, 46, 'n'], [26, 49, 'w']],
  });
  b.prop('bar-counter', 29, 47).prop('keg-rack', 27, 47).prop('fireplace', 34, 56).props_('table-round', [[30, 51], [34, 50], [37, 53]]).props_('chair', [[29, 51], [31, 51], [33, 50], [35, 50], [36, 53], [38, 53]]).prop('table-cards', 28, 54).prop('dartboard', 40, 49).prop('stair-spiral', 39, 47).prop('tavern-sign', 32, 45).prop('coin-stacks', 30, 47);
  b.light(34, 55, 15, 20).light(29, 48, 10, 15);
  b.encounter("Pell's collectors", [26, 46, 15, 11], [['bandit-captain', 1], ['thug', 6]], 'low');
  b.start(31, 50, 3, 3);

  b.area('Penny Market', [[22, 58, 25, 11]], {
    read: 'Fish, onions, second-hand boots. In the middle of the market stands a pillory, and in it a grey-haired man with a sign round his neck: DEBTOR.',
    gm: 'The pillory holds Amos Tull, who owes Pell 4 gp. Freeing him openly brings the watch; paying his debt at the Ledger frees him and wins the Ward\'s love. Pell\'s Quarter-Day notice is nailed to the market board (handout).',
    label: [33, 64],
  });
  b.props_('market-stall', [[24, 59], [24, 63], [44, 59]]).prop('produce-stall', 28, 67).prop('fish-crate', 38, 67).prop('well', 34, 62).prop('pillory', 40, 63).prop('stocks', 42, 63).prop('notice-board', 30, 59).prop('cart', 45, 66).props_('lamp-post', [[22, 58], [46, 68]]);
  b.mud(22, 69, 4, 11);
  b.area("Net-menders' sheds", [[41, 47, 5, 9], [75, 46, 5, 5]], {
    gm: 'Sheds of nets, floats and tar. The net-menders hate Pell like everyone else: any of them will lend a rowboat, a coil of rope or a shed to plan in.',
    label: [43, 51],
  });
  shack(b, 41, 47, 5, 4, [43, 50, 's']);
  shack(b, 41, 52, 5, 4, [41, 54, 'w']);
  shack(b, 75, 46, 5, 5, [75, 48, 'w']);
  b.props_('fishing-net', [[43, 48], [43, 53], [77, 47]]).props_('rope-coil', [[44, 48], [77, 49]]).prop('barrel', 44, 54);

  b.building('Brightwater Dyeworks', 26, 70, 15, 9, {
    mat: 'stone-flagstone-warm',
    read: 'Steam, blue fingers and vats of colour. On a line by the door hang a dozen grey robes and four tabards with a gold ledger stitched on the chest.',
    gm: 'The dyeworks launders the Gilded Ledger\'s livery every week. Owner Ma Pettle hates Pell (he owns her lease). She lends two tabards and a clerk\'s robe for free if asked kindly; stealing them unseen is a DC 13 Sleight of Hand.',
    doors: [[33, 70, 'n', 'closed'], [40, 74, 'e', 'closed']], windows: [[28, 70, 'n']],
  });
  b.water(34, 74, 4, 3, false, true);
  b.props_('cauldron', [[28, 73], [30, 76]]).props_('coat-rack', [[29, 71], [31, 71]]).prop('washbasin', 38, 72).prop('spinning-wheel', 27, 77).prop('loom', 39, 77).prop('water-barrel', 33, 77).prop('herbs-drying', 36, 71).light(29, 73, 10, 10);

  // Tanner's Cut, a narrow canal through the Ward, with two plank bridges
  b.water(47, 40, 2, 40, true);
  b.room('Plank bridge', 47, 50, 2, 2, { mat: 'wood-planks', gm: 'Two planks and a prayer. Fine to cross; fighting on it means a DC 12 Dexterity save or a swim.' });
  b.room("Dyers' bridge", 47, 73, 2, 2, { mat: 'wood-planks', gm: 'Stained every colour. The quickest way from the dyeworks to the Brandt house.' });

  b.building("Ottilie's Print Shop", 51, 46, 12, 10, {
    mat: 'wood-planks',
    read: 'Ink, hot metal and paper everywhere. A huge iron press thumps like a heart. A small woman with ink to her elbows waves you in without looking up.',
    gm: 'Ottilie Marsh prints for the whole city, Pell included. Her order book (DC 13 Investigation, or ask her nicely) shows a strange order from Pell two weeks ago (handout: the decoy order). She can forge a Ledger night-pass by evening for 30 gp, or free if the heroes promise the Ward will be saved.',
    doors: [[51, 50, 'w', 'closed'], [57, 46, 'n', 'closed']], windows: [[54, 46, 'n'], [62, 49, 'e']],
  });
  b.props_('workbench', [[54, 48], [56, 48]]).prop('book-pile', 59, 48).prop('scroll-pile', 60, 48).prop('shelf-jars', 52, 47).prop('map-cabinet', 61, 47).prop('desk', 59, 53).prop('chair', 59, 54).props_('crate-stack', [[52, 54], [53, 54]]).prop('table-long', 55, 52).prop('stove', 61, 54).light(55, 49, 10, 15);

  b.building('The Brandt house', 66, 46, 8, 8, {
    mat: 'wood-planks-dark',
    read: 'A narrow house, three floors tall and one room wide. Every room is clean, and every room is nearly empty: the good furniture was sold long ago.',
    gm: 'Home of Nessa Brandt, junior clerk at the Ledger, her mother and two little brothers. They owe Pell 40 gp. Nessa will help if the heroes show they can actually win: she knows the night password, which clerk leaves the boathouse key in his desk, and that Pell "never lets anyone near the big statue in the vault".',
    doors: [[66, 50, 'w', 'closed']], windows: [[69, 46, 'n'], [73, 50, 'e']],
  });
  b.prop('kitchen-table', 68, 49).props_('chair', [[67, 49], [69, 49]]).prop('hearth-oven', 67, 47).prop('bed', 72, 47).prop('cot', 72, 51).prop('book-pile', 70, 52).prop('washbasin', 72, 49).prop('trunk', 68, 52).light(67, 47, 5, 10);
  b.encounter('Bailiffs at the door', [63, 44, 14, 12], [['veteran', 1], ['tough', 3]], 'low');

  b.area('Rag Row', [[64, 56, 16, 24]], {
    read: 'Shacks of plank and sailcloth lean on each other like drunks. Washing lines cross overhead. Someone is singing a rude song about Magister Pell.',
    gm: 'The poorest corner of the Ward, and the first that Pell will clear. Everyone here will help the heroes for free: a lookout, a distraction, a hiding place. Any hero who spends an hour helping (DC 12 any useful check) gains one "Ward favour" to spend tonight on a distraction.',
    label: [71, 63],
  });
  b.paint(64, 56, 16, 24, 'dirt').mud(70, 62, 3, 3).mud(66, 70, 2, 2);
  shack(b, 66, 57, 5, 4, [68, 60, 's']);
  shack(b, 73, 57, 6, 4, [75, 60, 's']);
  shack(b, 66, 64, 5, 5, [66, 66, 'w']);
  shack(b, 74, 64, 5, 5, [74, 66, 'w']);
  shack(b, 66, 72, 5, 5, [68, 72, 'n']);
  shack(b, 73, 72, 6, 5, [75, 72, 'n']);
  b.props_('straw-bed', [[67, 58], [75, 58], [67, 66], [76, 66], [67, 74], [76, 74]]).props_('firewood', [[72, 62], [72, 70]]).prop('chicken-coop', 79, 69).prop('campfire', 71, 69).prop('washbasin', 78, 63).props_('crate', [[69, 75], [77, 75]]).light(71, 69, 10, 15);

  b.area('Washing steps', [[49, 64, 14, 15]], {
    read: 'Wide stone steps run down into Tanner\'s Cut, where women beat laundry on the stones. A little shrine with a lamp in it watches over them.',
    gm: 'Gossip central. A DC 12 Persuasion here learns that Pell\'s men took a "statue as big as a wardrobe" into the Ledger on a barge two years ago, and it walked off the barge by itself.',
    label: [55, 70],
  });
  b.paint(49, 64, 14, 15, 'stone-flagstone');
  b.props_('washbasin', [[50, 66], [50, 70]]).prop('water-barrel', 53, 75).prop('road-shrine', 58, 66).prop('candles', 58, 67).prop('rowboat', 47, 67, 0).prop('fishing-net', 52, 77).light(58, 66, 5, 10);
  b.props_('lamp-post', [[50, 57], [62, 62]]).prop('hay-bale', 60, 58).prop('handcart', 56, 60);

  return b.build();
}

// ---------- Part 2: the Gilded Ledger by night ----------
function ledgerByNight() {
  const b = new MapBuilder('adv-gilded-ledger-night', 'The Gilded Ledger by night', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dark', floor: 'stone-flagstone' });

  // outside: canal, quay and the street
  b.water(0, 0, 6, 80, true);
  b.room('Coin Bridge', 0, 74, 6, 3, { mat: 'stone-flagstone', gm: 'Where the heroes came from. A boat can be left under it.' });
  b.room('Gilt Quay', 6, 0, 3, 72, {
    mat: 'stone-cobble',
    read: 'A dark quay along the canal. Water slaps the stone. Above you, the counting-house wall rises like a cliff.',
    gm: 'From here: the boathouse water-gate, the kitchen door, the yard gate and the drainpipe up to the roofs (DC 12 Athletics, or a rope). A guard walks the quay every 20 minutes (the roster says when).',
    label: [7, 30],
  });
  b.paint(6, 9, 3, 5, 'wood-planks');
  b.props_('mooring-post', [[7, 22], [7, 45], [7, 66]]).props_('lamp-post', [[8, 26], [8, 56]]).prop('crate-pile', 7, 35).prop('rowboat', 2, 40, 0).prop('ladder', 8, 1).light(8, 26, 10, 15).light(8, 56, 10, 15);
  b.room("Goldsmith's Row", 6, 72, 46, 8, {
    mat: 'stone-cobble',
    read: 'Midnight. The richest street in Vessaline is shuttered and quiet. A lamplighter shuffles away. Across the way, the Gilded Ledger\'s gold doors shine in the lamplight.',
    gm: 'The heroes start here. The front steps lead to the locked doors; a sewer grate by the east end leads down (DC 12 Athletics to lift quietly); the quay is to the west. A watch pair walks the Row every 15 minutes.',
    label: [20, 76],
  });
  b.prop('fountain', 20, 76).props_('lamp-post', [[12, 73], [28, 73], [44, 73], [12, 78], [44, 78]]).props_('market-stall', [[16, 78], [24, 78]]).prop('cart', 46, 77).prop('hitching-post', 30, 78).prop('signpost', 8, 73).prop('trapdoor', 50, 76).prop('barrel-group', 48, 78);
  for (const [x, y] of [[12, 73], [28, 73], [44, 73]]) b.light(x, y, 15, 20);
  b.start(28, 75, 3, 3);

  // the roofs
  b.room('The rooftops', 9, 0, 71, 4, {
    mat: 'dungeon-slab', more: [[22, 4, 31, 7], [53, 4, 27, 7]],
    read: 'Wet slate, chimney pots and a sky full of stars. In the middle of the counting-house roof, a great glass skylight glows faintly from below.',
    gm: 'Up the drainpipe from the quay or the boathouse loft. Two sentries with crossbows walk here. The skylight pane lifts out (DC 14 thieves\' tools, or Nessa leaves the latch open): a 30-foot rope drop into the Great Counting Hall. A roof hatch on the east end opens into Pell\'s bedchamber (DC 15 to pick quietly).',
    label: [36, 6],
  });
  b.wallRun(9, 0, 1, 'w').wallRun(9, 2, 2, 'w').wallRun(22, 0, 4, 'w', 'low').wallRun(53, 0, 11, 'w', 'low');
  b.props_('pillar-square', [[14, 1], [28, 3], [46, 3], [58, 2], [76, 8]]).prop('chicken-coop', 18, 2).prop('cargo-hatch', 37, 9).prop('banner-pole', 30, 7).prop('water-barrel', 50, 9).props_('flowers', [[62, 6], [66, 6]]).prop('bench', 64, 8).prop('telescope', 74, 5).prop('rope-coil', 40, 9).prop('trapdoor', 70, 10);
  b.light(37, 9, 5, 15, '#ffe9a8');
  b.encounter('Roof sentries', [22, 0, 31, 11], [['scout', 4], ['veteran', 1]], 'low');
  b.wall(37, 10, 's', 'window');
  b.floor(37, 11, 1, 2, 'wood-planks').prop('rope-coil', 37, 12);
  b.floor(70, 11, 1, 1, 'wood-planks').door(70, 10, 's', 'locked');

  // the boathouse and the kennel yard
  b.building('Boathouse', 9, 4, 13, 16, {
    mat: 'wood-planks-dark',
    read: 'Black water laps in a stone slip. A gilded coin barge rocks at its moorings, and the smell of tar is thick.',
    gm: 'The canal way in. The water-gate is a portcullis: it stops a foot above the water, so swimmers can duck under (DC 12 Athletics; armour makes it DC 15). The winch is loud (alarm +1) unless oiled. A ladder to the loft and a trapdoor lead onto the roofs. The yard door is barred on this side.',
    doors: [[9, 16, 'w', 'closed'], [15, 19, 's', 'closed'], [19, 4, 'n', 'closed']],
  });
  b.water(9, 9, 7, 5, true);
  for (let y = 9; y <= 13; y++) b.door(9, y, 'w', 'locked', 'portcullis');
  b.prop('rowboat', 12, 11, 0).prop('winch', 17, 9).prop('rope-coil', 18, 14).prop('crate-pile', 20, 6).prop('fishing-net', 17, 17).prop('lantern-hook', 16, 8).prop('ladder', 19, 5).prop('gangplank', 16, 11).prop('cargo-crates', 20, 16).light(16, 8, 5, 10);
  b.hall(15, 20, 15, 20, 1, { mat: 'dirt' });
  b.room('Kennel yard', 9, 21, 13, 20, {
    mat: 'dirt',
    read: 'A walled yard of packed earth. Kennels line one side. Something big shifts in the straw, and a chain clinks.',
    gm: 'Eight mastiffs, chained by day, loose at night. A dog that barks raises the alarm by 1 each round. Meat laced with a sleeping draught (any healer\'s kit and DC 12 Medicine) or a Ward favour (Rag Row kids throwing sausages over the wall) keeps them busy. The yard gate to the quay is locked (DC 13).',
  });
  b.wallRun(9, 21, 20, 'w').door(9, 30, 'w', 'locked', 'door-iron');
  b.props_('cage', [[10, 22], [10, 25], [10, 28]]).prop('water-trough', 20, 23).props_('bones', [[14, 27], [18, 35]]).prop('hay-bale', 20, 38).prop('tree-oak', 16, 31).prop('well', 12, 37).prop('barrel', 20, 30).prop('training-dummy', 18, 26).light(16, 22, 5, 10);
  b.encounter('Dogs in the yard', [9, 21, 13, 20], [['mastiff', 8], ['guard', 4], ['veteran', 1]], 'low');
  b.hall(22, 38, 23, 38, 1).door(23, 38, 'e', 'closed');
  b.hall(15, 41, 15, 43, 1).door(15, 43, 's', 'closed');

  // servants' side
  b.room('Kitchen', 10, 44, 12, 10, {
    mat: 'stone-flagstone-warm',
    read: 'A warm kitchen, banked for the night. Bread rises under cloths, and a cat watches you from the top of the dresser.',
    gm: 'The servants\' door to the quay is bolted inside, but the cook leaves the bolt half-shot for her sweetheart (DC 10 to slip). Nobody is here after midnight. A good place to change into livery.',
  });
  b.hall(9, 48, 9, 48, 1).door(9, 48, 'w', 'closed');
  b.prop('hearth-oven', 11, 44).prop('kitchen-table', 15, 48).prop('pot-rack', 13, 44).props_('flour-sacks', [[20, 45], [20, 46]]).prop('butcher-block', 18, 50).prop('shelf-jars', 20, 52).prop('bread-rack', 11, 52).prop('water-barrel', 12, 52).light(11, 45, 5, 10, '#ff9a3c');
  b.hall(22, 50, 23, 50, 1).door(23, 50, 'e', 'closed');
  b.hall(15, 54, 15, 55, 1).door(15, 55, 's', 'closed');
  b.room("Servants' rooms", 10, 56, 12, 11, {
    mat: 'wood-planks',
    read: 'Bunks, snoring and a smell of feet. Six servants sleep here, dead to the world.',
    gm: 'A DC 12 Stealth (group) to pass. Woken servants squeak, then mostly hide under the blankets: they don\'t love Pell. A loose board by the end bunk (DC 14 Perception) hides the footman\'s savings and a spare key to the coin room.',
  });
  b.props_('bunk-bed', [[11, 57], [11, 60], [11, 63], [20, 57], [20, 60]]).props_('footlocker', [[13, 57], [13, 60], [13, 63]]).prop('washbasin', 20, 65).prop('coat-rack', 16, 57).prop('gm-treasure', 20, 63, 0, { gm: true });

  // the ground floor of the counting-house
  b.room('Great Counting Hall', 24, 13, 27, 19, {
    mat: 'marble',
    read: 'A hall of high desks under a great glass skylight. Moonlight falls in a square on the marble. In the middle, a brass engine of wheels and dials ticks softly, counting, counting.',
    gm: 'The Counting Engine is an alarm: anyone who crosses the moonlit square in front of it is "counted" (it chimes once: alarm +1) unless they move along the desks (DC 13 Stealth) or Nessa stops the escapement. Nessa Brandt works here late if she was recruited, with a lamp, "finishing the quarter".',
  });
  b.props_('writing-desk', [[27, 17], [31, 17], [43, 17], [47, 17], [27, 21], [31, 21], [43, 21], [47, 21], [27, 26], [31, 26], [43, 26], [47, 26]]);
  b.props_('stool', [[27, 18], [31, 18], [43, 18], [47, 18], [27, 22], [31, 22], [43, 22], [47, 22]]);
  b.prop('orrery', 37, 22).prop('lectern-dais', 37, 15).props_('column-fluted', [[25, 14], [49, 14], [25, 30], [49, 30]]).prop('chandelier-great', 37, 18).prop('archive-stacks', 25, 22).prop('book-pile', 31, 29).prop('scales', 44, 29).prop('lamp-table', 30, 20);
  b.light(37, 22, 10, 15, '#cfe3ff').light(30, 20, 5, 10);
  b.hall(51, 26, 53, 26, 1).door(50, 26, 'e', 'closed').prop('stair-spiral', 52, 26);
  b.hall(37, 32, 37, 32, 1).door(37, 31, 's', 'closed', 'door-double');
  b.room('Gilt corridor', 36, 33, 3, 24, {
    mat: 'marble',
    read: 'A long corridor of gold-framed portraits: Pell, Pell\'s father, Pell\'s grandfather, every one of them smiling the same thin smile.',
    gm: 'The spine of the ground floor. A guard walks it every 10 minutes. Pell\'s grandfather\'s portrait hides a peephole into the guard room.',
  });
  b.props_('tapestry-tall', [[36, 36], [38, 44], [36, 52]]).props_('wall-candelabra', [[38, 34], [36, 48]]).prop('rug-runner', 37, 40).light(37, 40, 10, 15);
  b.room('Guard room', 24, 34, 11, 10, {
    mat: 'stone-flagstone',
    read: 'Bunks, a table of cards and coins, a rack of crossbows, and a big brass bell on a bracket by the door.',
    gm: 'Off-duty guards sleep here. The bell is the house alarm: if it rings, alarm goes straight to 4. Muffle it first (a cloak and DC 12 Sleight of Hand) and the worst a fight here can do is +1 per round.',
  });
  b.props_('bunk-bed', [[25, 35], [25, 38], [25, 41]]).prop('table-cards', 29, 38).props_('stool', [[28, 38], [30, 38]]).prop('weapon-rack', 33, 35).prop('armor-stand', 33, 41).prop('temple-bell', 33, 38).prop('stove', 29, 42).prop('key-ring', 31, 35).light(29, 38, 10, 15);
  b.hall(35, 38, 35, 38, 1).door(34, 38, 'e', 'closed');
  b.encounter('The watch turns out', [24, 34, 11, 10], [['veteran', 3], ['guard', 6], ['mastiff', 4], ['thug', 2]], 'moderate');
  b.room("Pell's office", 40, 34, 11, 10, {
    mat: 'wood-planks-dark',
    read: 'Dark wood, a desk as big as a boat, and a painting of the canal city with every house in the Tallow Ward painted red.',
    gm: 'Locked (DC 15). The brass lever behind the painting opens the vault door at Lockdown. The bookcase by the east wall is a secret door (DC 15 Perception, or Nessa knows): Pell\'s private stair to the bullion cage.',
  });
  b.hall(39, 38, 39, 38, 1).door(39, 38, 'w', 'locked');
  b.prop('writing-desk', 45, 37).prop('chair-high-back', 45, 36).prop('safe', 49, 35).prop('bookshelf-tall', 41, 35).prop('rug', 45, 40).prop('globe-stand', 42, 42).prop('lever', 47, 35, 0, { gm: true }).prop('bookcase-secret', 49, 42).prop('heraldic-crest', 44, 35).light(45, 37, 5, 10);
  b.hall(51, 38, 53, 38, 1).door(50, 38, 'e', 'locked', 'door-iron').prop('stairs-down', 52, 38);
  b.door(50, 42, 'e', 'secret').hall(51, 42, 52, 42, 1).hall(52, 42, 52, 54, 1).hall(52, 54, 53, 54, 1);
  b.props_('stairs-down', [[52, 46], [52, 50]]);
  b.area("Pell's private stair", [[51, 42, 2, 13]], { gm: 'A tight stone stair behind the bookcase, straight down to the bullion cage. Pell uses it at the third bell.', label: [52, 48] });
  b.room("Clerks' cloakroom", 24, 46, 11, 10, {
    mat: 'wood-planks',
    read: 'Pegs of grey robes, a long bench and a cracked mirror. Someone has left a half-eaten pie on the bench.',
    gm: 'Clerk robes for anyone who lacks a disguise. The night porters expect "relief clerks" at the second bell; a robe and the password get you anywhere on the ground floor.',
  });
  b.props_('coat-rack', [[25, 47], [27, 47], [29, 47], [31, 47]]).prop('bench-long', 28, 51).prop('mirror', 33, 47).props_('footlocker', [[25, 54], [27, 54], [29, 54]]).prop('washbasin', 33, 54);
  b.hall(35, 50, 35, 50, 1).door(34, 50, 'e', 'closed');
  b.room('Coin room', 40, 46, 11, 10, {
    mat: 'stone-flagstone',
    read: 'Long tables stacked with neat towers of coins, each with a paper slip. Brass scales, sealed sacks and an iron coffer chained to the floor.',
    gm: 'The day\'s takings, counted and sealed. Locked (DC 15, or the footman\'s key). The coffer\'s lock has a poisoned needle (DC 14 Investigation to spot; DC 12 Constitution save or 2d10 poison damage).',
  });
  b.hall(39, 50, 39, 50, 1).door(39, 50, 'w', 'locked');
  b.props_('table-long', [[42, 48], [42, 52]]).props_('coin-stacks', [[44, 48], [46, 52]]).prop('scales', 48, 48).prop('coffer', 49, 54).props_('sack', [[41, 54], [43, 54]]).prop('trap-needle-lock', 49, 54, 0, { gm: true });
  b.hall(37, 57, 37, 57, 1).door(37, 57, 's', 'closed', 'door-double');
  b.room('Front hall', 26, 58, 23, 11, {
    mat: 'marble',
    read: 'The public hall in the dark. Brass cages glint along the counter. The golden statue of Magister Pell smiles at nothing, and two porters play dice by a shuttered lamp.',
    gm: 'The front door way in. The porters open to a knock for a clerk with the password ("Ink and iron", from Tibbet or Nessa) and a night-pass (Ottilie\'s forgery, or Nessa\'s). Without both: DC 16 Deception. Picking the front lock in full view of the Row is DC 15 and takes a minute.',
  });
  b.props_('shop-counter', [[29, 62], [33, 62], [41, 62], [45, 62]]).prop('statue-tall-robed', 37, 64).props_('bench-long', [[28, 67], [46, 67]]).prop('chandelier-crystal', 37, 61).prop('rug-runner', 37, 66).prop('table-cards', 31, 66).props_('stool', [[30, 66], [32, 66]]).prop('display-case', 46, 59).prop('notice-board', 27, 59).light(31, 66, 5, 10);
  b.encounter('The night porters', [26, 58, 23, 11], [['guard', 4], ['veteran', 1], ['thug', 2]], 'low');
  b.room('Front steps', 34, 69, 6, 3, { mat: 'marble', gm: 'Six white steps up to the gold doors. In full view of the Row.' });
  b.door(36, 68, 's', 'locked', 'door-double').door(37, 68, 's', 'locked', 'door-double').wallRun(34, 68, 2, 's').wallRun(38, 68, 2, 's');
  b.props_('lantern-standing', [[34, 69], [39, 69]]).light(34, 69, 10, 15).light(39, 69, 10, 15);

  // upstairs: Pell's rooms and the archive
  b.room("Pell's bedchamber", 64, 12, 15, 9, {
    mat: 'wood-planks',
    read: 'A bed big enough for a family, hung with gold curtains. Under the covers, a thin man snores softly, one hand closed round a silver amulet on a chain.',
    gm: 'Magister Pell sleeps here until the third bell (or alarm 4). The amulet commands the Auditor. Lifting it from his hand: DC 15 Sleight of Hand (DC 12 if he has been dosed: Nessa can put a sleeping draught in his night wine). On a fail by 5 or more, he wakes and screams: alarm +2. His jewellery box is on the dresser.',
  });
  b.prop('bed-four-poster', 73, 15).prop('nightstand', 71, 14).prop('wardrobe', 65, 13).prop('dresser-mirror', 77, 13).prop('jewelry-box', 77, 14).prop('chaise-longue', 67, 18).prop('rug-round', 71, 17).prop('washbasin', 77, 19).light(71, 14, 5, 10);
  b.room("Pell's study", 54, 12, 8, 9, {
    mat: 'wood-planks-dark',
    read: 'A small study crammed with account books. A brandy glass, still half full, sits on a letter.',
    gm: 'The letter is Pell\'s note to his bodyguard captain about tonight (handout: Pell\'s note). It gives the twist away early to careful heroes: good. A DC 14 Investigation of the desk also finds the Velvet Lantern\'s receipt for "one job, done to order".',
  });
  b.hall(62, 16, 63, 16, 1).door(63, 16, 'e', 'closed');
  b.prop('writing-desk', 57, 14).prop('armchair', 57, 15).prop('bookshelf-tall', 55, 13).prop('globe-stand', 60, 18).prop('map-cabinet', 60, 13).prop('book-pile', 55, 19).light(57, 14, 5, 10);
  b.hall(57, 21, 57, 22, 1).door(57, 22, 's', 'closed');
  b.hall(72, 21, 72, 22, 1).door(72, 22, 's', 'closed');
  b.room('Archive', 54, 23, 25, 10, {
    mat: 'wood-planks-dark',
    read: 'Shelf after shelf of ledgers, floor to ceiling, every one bound in the same brown calf. A rolling ladder. A thick rug. Two suits of armour stand guard at the far end.',
    gm: 'Every loan Pell ever made, but not the Tallow Ledger. The rug and the armour are animated and attack anyone who takes a book without saying "by your leave, Magister" (Nessa knows it). Ten minutes of searching finds a book of Pell\'s bribes to city judges: worth a fortune to the right person.',
  });
  b.props_('archive-stacks', [[56, 24], [56, 28], [60, 24], [60, 28], [64, 24], [64, 28]]).prop('bookcase-ladder', 68, 25).prop('table-reading', 70, 28).prop('rug', 72, 28).props_('statue-tall-knight', [[77, 24], [77, 31]]).prop('candelabra', 70, 27).light(70, 27, 5, 10);
  b.encounter('The archive wakes', [54, 23, 25, 10], [['rug-of-smothering', 2], ['animated-armor', 1]], 'low');
  b.area('Back stair', [[51, 26, 3, 1]], { gm: 'A spiral stair from the counting hall up to the archive.', label: [52, 26] });
  b.door(53, 26, 'e', 'closed');

  // the vault floors
  b.room('Vault antechamber', 54, 35, 9, 8, {
    mat: 'dungeon-slab',
    read: 'The stair ends in a cold stone room. Swords hang on every wall in neat rows, and four empty suits of armour stand at attention before a round steel door.',
    gm: 'The swords and armour wake if anyone not wearing Ledger livery steps past the rune line (DC 14 Arcana to spot and step over it). The round door: DC 18 thieves\' tools (two hands, 3 minutes), the head clerk\'s key, or the lever in Pell\'s office. At Lockdown it seals and only the lever opens it.',
  });
  b.props_('weapon-rack', [[55, 36], [61, 36], [55, 41], [61, 41]]).props_('statue-tall-knight', [[58, 36], [58, 41]]).prop('trap-rune-threshold', 57, 38, 0, { gm: true }).prop('lock-plate', 62, 38).prop('brazier-everburning', 55, 38).light(55, 38, 10, 15, '#9fd3ff');
  b.encounter('The antechamber wakes', [54, 35, 9, 8], [['animated-armor', 4], ['flying-sword', 4]], 'low');
  b.hall(63, 38, 64, 38, 1).door(64, 38, 'e', 'locked', 'door-iron');
  b.room('Strongbox gallery', 65, 35, 15, 14, {
    mat: 'dungeon-slab',
    read: 'A long gallery of strongboxes, stacked in iron racks, each with a brass plate and a name. Above them, a dozen swords hang point-down on silver threads.',
    gm: 'The rich of Vessaline keep their valuables here. The great strongbox at the far end is labelled TALLOW and has a mimic beside it, pretending to be a smaller box. Touching any box without the head clerk\'s ring cuts the swords loose. Ten minutes and DC 15 thieves\' tools opens three boxes worth taking.',
  });
  b.props_('strongbox', [[66, 36], [68, 36], [70, 36], [72, 36], [66, 40], [68, 40], [72, 40], [66, 44], [68, 44], [70, 44], [72, 44]]).props_('coffer', [[76, 37], [76, 41]]).prop('safe', 78, 36).prop('strongbox', 77, 45).prop('mimic-chest', 75, 45, 0, { gm: true }).prop('chains-hanging', 70, 41).prop('crate-stack', 78, 47).light(72, 42, 5, 15, '#cfe3ff');
  b.wallRun(66, 38, 7, 's', 'bars').wallRun(66, 42, 7, 's', 'bars');
  b.encounter('The hungry strongbox', [65, 35, 15, 14], [['mimic', 1], ['flying-sword', 12]], 'low');
  b.floor(71, 49, 2, 3, 'dungeon-slab').prop('stairs-down', 71, 50);
  b.room('Bullion cage', 54, 52, 10, 11, {
    mat: 'dungeon-slab',
    read: 'Behind iron bars, gold bars stacked like bricks. And in front of the bars, three figures in dark velvet masks, already busy with a crowbar.',
    gm: 'The Velvet Lantern came in through the old culvert ten minutes ahead of the heroes (or ten minutes behind, if the heroes were fast). They want the Tallow Ledger too. See the scene: they can be bargained with, raced, or turned against Pell.',
  });
  b.prop('gate-iron-tall', 58, 53).props_('coin-stacks', [[55, 53], [56, 53], [62, 53]]).prop('treasure-pile', 60, 54).prop('crate-pile', 55, 61).prop('scales', 62, 60).props_('stairs-down', [[53, 54]]).light(58, 57, 5, 10);
  b.encounter('The Velvet Lantern', [54, 52, 10, 11], [['assassin', 1], ['spy', 2]], 'high');
  b.hall(64, 57, 65, 57, 1).door(64, 57, 'e', 'locked', 'bars');
  b.cave("The Auditor's hall", 72, 57, 6.5, 5.5, {
    seed: 46, wobble: 0.03, mat: 'marble',
    read: 'A round hall of white marble. On a plinth sits a great strongbox bound in gold, with TALLOW on its lid. Behind it, in an arched alcove, stands a statue of a faceless clerk eight feet tall, its stone hands folded over its chest.',
    gm: 'The great strongbox holds the decoy ledger. The "statue" is the Auditor, Pell\'s shield guardian, and the real Tallow Ledger is locked in a compartment in its chest. It does nothing until the box is touched or Pell (or whoever holds the amulet) commands it. Then it guards the box, and Pell, to the last.',
  });
  b.prop('plinth-display', 72, 57).prop('strongbox', 72, 57).prop('wall-alcove-arch', 76, 57).props_('candle-stand-tall', [[68, 55], [76, 55], [68, 59], [76, 59]]).props_('banner-hanging-tall', [[70, 52], [74, 52]]).prop('lock-plate', 76, 59).prop('rug-round', 72, 59).light(72, 57, 10, 20, '#ffe3a8');
  b.encounter('The Auditor', [66, 52, 14, 12], [['shield-guardian', 1], ['knight', 1], ['guard', 4]], 'high');

  // under the street: the sewer and the sump
  b.door(51, 76, 'e', 'closed', 'bars');
  b.tunnel([[52, 76], [56, 75], [60, 72], [63, 72]], 2, { mat: 'brick-floor', seed: 41 });
  b.water(52, 75, 12, 2, false, true);
  b.area('Drain under the Row', [[52, 72, 10, 5]], {
    read: 'Brick, slime, and the roar of water. The tunnel bends north under the counting-house.',
    gm: 'Easy going. The noise of the water covers small sounds (advantage on Stealth down here).',
    label: [56, 75],
  });
  b.cave('The sump', 70, 72, 8, 5, {
    seed: 42, mat: 'cave-floor',
    read: 'Every drain on the Row empties into this stinking pool. Something huge and grey stirs in the filth, and a tentacle with an eye on the end rises to look at you.',
    gm: 'An otyugh lives here, fat on the Row\'s garbage, with a gelatinous cube that cleans up after it. The otyugh speaks a little (telepathy): it will let anyone pass who brings it "something new to eat" (any food it has never tasted: a wheel of cheese, a pie, a cake). Scuttle\'s word works too. The old culvert north is bricked up, one brick thick (DC 12 Athletics to push through quietly; smashing it is alarm +1).',
  });
  b.pool(72, 73, 3, 2, false).props_('bone-heap', [[66, 70], [74, 74]]).prop('debris-wood', 68, 75).prop('sewer-outflow', 77, 71).prop('skeleton-lying', 74, 69).prop('gm-treasure', 74, 69, 0, { gm: true });
  b.encounter('The sump', [58, 64, 22, 16], [['otyugh', 1], ['gelatinous-cube', 1], ['swarm-of-rats', 6]], 'moderate');
  b.tunnel([[66, 70], [60, 67], [58, 64], [58, 63]], 1, { mat: 'brick-floor', seed: 43 });
  b.area('Old culvert', [[57, 63, 4, 5]], { gm: 'Bricked up where it meets the bullion cage: the Velvet Lantern already pushed the bricks through. Wet footprints lead in.', label: [58, 65] });
  b.door(58, 62, 's', 'secret');
  b.tunnel([[63, 72], [62, 78], [56, 78]], 1, { mat: 'brick-floor', seed: 44 });
  b.cave('Flooded cistern', 55, 77, 3, 2, {
    seed: 45, mat: 'cave-floor',
    gm: 'A dead end with a drowned crate of smuggled brandy (6 bottles, 10 gp each) and a safe place to hide if the watch comes down the drain.',
  });
  b.water(53, 77, 4, 2, false, true);

  return b.build();
}

export const GILDED_LEDGER: Adventure = {
  id: 'gilded-ledger',
  title: 'Heist at the Gilded Ledger',
  tagline: 'One night, one counting-house, one book that owns a whole neighbourhood. Steal it.',
  levels: '5',
  sessions: '2 sessions',
  players: '3-5 players',
  tags: ['heist', 'city', 'stealth', 'caper', 'canals'],
  pitch:
    'Vessaline is a city of canals, bridges and bankers. Across the water from the gold of Goldsmith\'s Row lies the Tallow Ward, where three hundred families live in houses they do not own. Every one of their debts is written in a single book, the Tallow Ledger, locked in the vault of the grandest counting-house in the city: the Gilded Ledger. At dawn the day after tomorrow, its owner calls in every debt at once. In this city the law is old and simple: no ink, no debt. You have one day to plan, and one night to steal a book.',
  secret:
    'Magister Halvard Pell owns the Gilded Ledger. Forty years ago the city lent the Tallow Ward money to rebuild after a flood; last year Pell bought up the whole loan for pennies. On Quarter-Day he calls it in. Nobody can pay, so the watch will clear the Ward and Pell will build private warehouses on the best canal-front in the city. Pell heard whispers that the Ward meant to steal the book. So he set a trap. He had a printer make a decoy ledger, blank after the first pages, and put it in the great strongbox. He secretly hired a crew of thieves, the Velvet Lantern, to "steal" it tonight, so he can blame the Ward, send the watch in, and still show the real book to the court at dawn. The real Tallow Ledger is locked in the chest of the Auditor, his shield guardian, and the amulet that commands it hangs round Pell\'s neck. At the third bell (2 in the morning) Pell goes down his private stair to watch the trap close.',
  hooks: [
    'Grissel Hobb, who keeps the Drowned Penny, offers the Ward\'s whole savings, 500 gp in a tin under the bar, to whoever steals the Tallow Ledger. "Take Pell\'s gold too. Just not his spoons. We\'re not thieves."',
    'A hero has a debt with Pell of their own (or a friend in the Ward), and a red wax seal has just appeared on a door they care about.',
    'Nessa Brandt, a junior clerk at the Ledger, slips a hero a note: "I can get you in. Meet me at the Drowned Penny. Burn this."',
  ],
  tips: [
    'Part 1 is a day of legwork. Keep a tally of the five Edges the heroes can earn: the Plan (assay office), the Roster (watch house, rooftops or Tibbet), a Way in (key, pass or livery), a Contact (Nessa) and an Escape (a boat, Scuttle\'s tunnels, or a Ward favour). Each Edge gives advantage on one roll that night, or skips a lock or a check outright.',
    'Track the Alarm from 0 to 5 where the players can see it. +1 for a failed Stealth check by 5 or more, a guard who gets away, a barking dog, a chime of the Counting Engine, or a noisy lock or wall. +2 for a scream, the guard-room bell or a loud spell. 1 Uneasy: guards check doors. 2 Alert: the dogs come inside and patrols double. 3 Lockdown: the vault door seals and the antechamber wakes. 4 The Watch: a runner fetches Sergeant Tibbet and ten guards (here in 10 minutes) and Pell goes down to the vault. 5 Uproar: every door locks, the boathouse gate drops and it is time to run.',
    'Reward plans. If the players prepared something sensible, let it work with one roll, or none. Once per night each player may say "I set that up this morning" and make one check to have done it.',
    'Almost every fight can be avoided: dogs can be fed, guards fooled, Scuttle and the otyugh bargained with, the Velvet Lantern turned. Give full XP for a fight dodged by a good plan.',
    'Plant the twist fairly: the print shop\'s order for a blank ledger, gossip about Pell\'s "thinking statue", Nessa saying Pell never lets anyone near it, and Pell\'s note in his study. Sharp players should guess before the vault, and should feel clever for it.',
    'Both parts are level 5. The Velvet Lantern and the Auditor are both high fights: if the heroes end up facing both at once, have the Velvet Lantern switch sides when they see the blank pages.',
  ],
  npcs: [
    {
      id: 'pf_glgrissel', name: 'Grissel Hobb', title: 'keeper of the Drowned Penny', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'The Tallow Ward saved, and Pell embarrassed in front of the whole city.', knows: 'Everyone in the Ward, who owes what, and who has a boat, a ladder or a cousin at the watch house.',
      voice: 'Gravel and laughter. Calls everyone "my duck". Bangs the bar to finish a sentence.', appearance: 'A broad woman with forearms like hams, a leather apron and a copper penny on a string round her neck.',
      backstory: 'Her husband nailed the first penny over the bar the day Pell took their first house. She has nailed up sixty since.',
    },
    {
      id: 'pf_glnessa', name: 'Nessa Brandt', title: 'junior clerk at the Gilded Ledger', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Her family\'s debt gone and her brothers safe, without hanging for it.', knows: 'The night password ("Ink and iron"), the porters\' habits, the archive\'s safe word, Pell\'s private stair, and that he sleeps with his amulet in his hand.',
      voice: 'Fast and whispery, always checking over her shoulder. Speaks in numbers when nervous ("three guards, two dogs, one door").', appearance: 'A small young woman with ink-stained fingers, spectacles mended with thread and a grey clerk\'s robe two sizes too big.',
      gmNotes: 'She will not come into the vault. She will unlatch one way in (skylight, kitchen bolt or water-gate), drug Pell\'s night wine, or stall the Counting Engine. If the heroes are caught, she is caught too: protect her and the Ward will never forget it.',
    },
    {
      id: 'pf_glpell', name: 'Magister Halvard Pell', title: 'master of the Gilded Ledger', kind: 'npc', art: 'noble', monsterId: 'noble', shared: true,
      wants: 'The Tallow Ward cleared and his warehouses built, and to be thought clever while he does it.', knows: 'Exactly what everyone in the city owes him, the Velvet Lantern\'s trap, and the word that commands the Auditor.',
      voice: 'Soft, pleased with itself, and very precise. Never raises his voice: he has guards for that.', appearance: 'Tall and thin as a quill, in black silk and a gold chain of office, with a silver amulet he keeps touching.',
      gmNotes: 'Noble stat block: no fighter. In the vault he hides behind the Auditor and his bodyguard captain. Holding the amulet makes the Auditor obey; grabbing it from him is a contested Athletics or Sleight of Hand. Cornered, he bargains (a full pardon for the Ward\'s debt, in writing) and then tries to cheat.',
    },
    {
      id: 'pf_glottilie', name: 'Ottilie Marsh', title: 'printer of Tanner\'s Cut', kind: 'npc', art: 'sage', shared: true,
      wants: 'To keep printing, and to stop feeling guilty about Pell\'s strange order.', knows: 'Pell ordered a perfect copy of the Tallow Ledger\'s binding, blank after page ten. She can forge a Ledger night-pass by evening.',
      voice: 'Shouts over the press. Never finishes a sentence when a gesture will do.', appearance: 'A small woman in a leather apron, ink to the elbows, with a pencil in her hair and another behind her ear.',
    },
    {
      id: 'pf_gltibbet', name: 'Sergeant Tibbet Crane', title: 'watch sergeant of Goldsmith\'s Row', kind: 'npc', art: 'guard-captain', monsterId: 'veteran',
      wants: 'A quiet life, a full mug, and to win at arm-wrestling just once.', knows: 'The night patrols of the Row and the Ledger, the password, and that Pell pays the watch extra for "Quarter-Day duty".',
      voice: 'Loud, cheerful, with a big laugh that ends in a cough.', appearance: 'A big red-faced man with a moustache like a broom and his helmet always under one arm.',
      gmNotes: 'Veteran stat block. Not wicked, just bought. If he learns Pell plans to send the watch into the Ward on Quarter-Day, he quietly takes his squad off the Row at the third bell.',
    },
    {
      id: 'pf_glcorvane', name: 'Silk Corvane', title: 'captain of the Velvet Lantern', kind: 'npc', art: 'spy', monsterId: 'spy', shared: true,
      wants: 'The Tallow Ledger, so she can sell it back to whoever pays most.', knows: 'A go-between paid her crew to lift the Ledger tonight at the third bell, through the old culvert. She does not know the go-between works for Pell.',
      voice: 'Warm, amused and polite, like a hostess at a party. Never says a threat out loud.', appearance: 'A slim woman in a dark red velvet half-mask and gloves, with a lantern-shaped silver pin on her collar.',
      gmNotes: 'Spy stat block. A rival, not a villain. Show her the blank pages (or Pell\'s note) and she is furious: she will help the heroes against Pell for a share of the bullion.',
    },
    {
      id: 'pf_glquill', name: 'Mister Quill', title: 'the Velvet Lantern\'s knife', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'To get paid, and to be thought of as a professional.', knows: 'Fourteen ways to open a lock and twice as many to close a conversation.',
      voice: 'Says almost nothing. When he does, it is very quiet and very polite.', appearance: 'A neat, grey man with a neat, grey coat. You forget his face while you are looking at it.',
      gmNotes: 'Assassin stat block, and the most dangerous person in the vault. He follows Corvane\'s orders exactly: if she makes a deal, he keeps it.',
    },
    {
      id: 'pf_glscuttle', name: 'King Scuttle', title: 'lord of the Sewer Kings', kind: 'monster', art: 'wererat', monsterId: 'wererat',
      wants: 'Respect, cheese, and the right for his folk to come and go through the Ward\'s cellars.', knows: 'Every drain in Vessaline, the old culvert under the Ledger\'s vault, and what the otyugh likes to eat.',
      voice: 'Grand and flowery, like a stage king, with a squeak when excited.', appearance: 'A skinny man in a moth-eaten velvet cloak and a crown of bottle-caps. His nose twitches when he thinks.',
      gmNotes: 'Wererat stat block. He would rather deal than fight: a bargain gets the heroes the sewer route as an Edge, and his word gets them past the otyugh.',
    },
    {
      id: 'pf_glauditor', name: 'The Auditor', title: 'Pell\'s shield guardian', kind: 'monster', art: 'shieldGuardian', monsterId: 'shieldGuardian',
      wants: 'Nothing. It obeys whoever holds the silver amulet.', knows: 'Nothing it will say. It carries the real Tallow Ledger in a locked compartment in its chest.',
      voice: 'Silent, except for a dry ticking, like a clerk\'s pen.', appearance: 'An eight-foot statue of a faceless clerk in stone robes, with ink-black runes on its hands and a brass lock plate on its chest.',
      gmNotes: 'Shield guardian stat block. Whoever holds the amulet can order it to open its chest (the Ledger is inside) or to stand still. Without the amulet, the chest lock is DC 18 thieves\' tools while it is restrained or helpless, or the heroes must beat it.',
    },
  ],
  handouts: [
    { id: 'quarter-day', title: 'Notice nailed to the market board', text: 'BY ORDER OF THE GUILD COURT OF VESSALINE\nAll debts written in the Tallow Ledger are called in at dawn on Quarter-Day.\nHouseholds unable to pay in full shall quit their houses by noon.\nThe Watch will assist.\n— H. Pell, Magister, the Gilded Ledger' },
    { id: 'assay-plans', title: 'Copied from the Assay office', text: 'THE GILDED LEDGER, strongroom plan, lodged by law.\nGround: public hall, counting hall (skylight over), guard room, office, coin room.\nWater: boathouse with water-gate (portcullis) on the canal.\nBelow: antechamber, round door, strongbox gallery, bullion cage, "guardian\'s hall" with alcove.\nNote in a different hand: old culvert under the bullion cage bricked up, NOT filled.' },
    { id: 'roster', title: 'The night roster (chalk on a board)', text: 'LEDGER NIGHT\nRoof: 2 bows + Sgt Holm, walk the leads, change at 2nd bell\nYard: dogs loose 10th bell, 4 men\nPorters: 4 + Dunn, front hall, relief clerks at 2nd bell\nQuay: 1 man, every 20 min\nPassword this quarter: INK AND IRON\nQuarter-Day: all squads to Tallow Ward at dawn, by Magister\'s request' },
    { id: 'decoy-order', title: "From Ottilie's order book", text: 'For Magister H. Pell. One ledger, great size, calf, gilt-tooled, to match the Tallow Ledger exactly. First ten leaves printed with the Tallow headings and names. The rest LEFT BLANK. Wanted by the 12th. Paid in full, plus 20 gp "for discretion".' },
    { id: 'velvet-card', title: 'A card in a lookout\'s pocket', text: 'A small black card printed with a red lantern. On the back, in neat pencil: "Culvert. Third bell. In, box, out. Paid half. Other half on delivery, at the Lamp."' },
    { id: 'pell-note', title: 'A note on Pell\'s desk', text: 'Captain — Let the Lantern take the box at the third bell. When the Watch "finds" it in the Ward, we have our excuse. The true book stays where it always is: inside the Auditor. I shall come down to watch. If the Ward has sent thieves of its own, so much the better. Irons for all. — H.P.' },
  ],
  chapters: [
    {
      id: 'day', title: 'Part 1: Casing the canal district', level: 5,
      summary: 'A day in the canal city of Vessaline: hire on at a tavern, then gather plans, patrol times, a disguise, an inside contact and a way in, while the Velvet Lantern does the same.',
      goal: 'Earn as many Edges as possible before nightfall and choose how to get into the Gilded Ledger.',
      map: canalDistrict,
      npcs: [
        { npc: 'pf_glgrissel', x: 30, y: 48 },
        { npc: 'pf_gltibbet', x: 29, y: 54 },
        { npc: 'pf_glottilie', x: 57, y: 50 },
        { npc: 'pf_glnessa', x: 70, y: 49 },
        { npc: 'pf_glpell', x: 36, y: 17 },
        { npc: 'pf_glcorvane', x: 60, y: 21, hidden: true },
        { npc: 'pf_glscuttle', x: 10, y: 64, hidden: true },
      ],
      scenes: [
        { room: 'The Drowned Penny', title: 'A penny for every house', read: 'Smoke, fish stew and sixty copper pennies nailed above the bar. The landlady slams a tin on the counter in front of you. "Five hundred gold. It\'s everything the Ward has. Steal us a book."', gm: 'Grissel hires the heroes and explains: the Tallow Ledger, Quarter-Day at dawn the day after tomorrow, "no ink, no debt". The heist must be tomorrow night. List the five Edges they could earn and let them split up.', handout: 'quarter-day' },
        { room: 'The Drowned Penny', title: "Pell's collectors", encounter: "Pell's collectors", gm: 'Mid-meeting, Pell\'s collectors kick the door in to "count the pennies". Their boss is a bandit captain. Pay them 20 gp, bluff them (DC 14), or throw them in the canal. Beating them wins the Ward\'s trust (a free Ward favour) but they report to Pell: raise the starting alarm by 1 unless none get away.', treasure: '80 gp of the Ward\'s money in a satchel: Grissel insists it goes back to the families.' },
        { room: 'Assay office', title: 'Plans on file', read: 'A clerk weighs a single coin, squints, and weighs it again. Behind him, a wall of drawers holds a plan of every strongroom in the city.', gm: 'The Plan Edge. A 25 gp "filing fee", forged surveyor\'s papers (DC 14 Deception), or a distraction while someone reads the drawer (DC 13 Sleight of Hand). Bertil gossips about Pell\'s "thinking statue".', handout: 'assay-plans' },
        { room: "Ottilie's Print Shop", title: 'The blank book', gm: 'Ottilie can forge a night-pass (a Way in Edge). Her order book shows Pell\'s strange order: the first hint of the twist. She feels sick about it once she understands.', handout: 'decoy-order' },
        { room: 'The Brandt house', title: 'The inside clerk', encounter: 'Bailiffs at the door', read: 'A red wax seal on the door, and two big men in Pell\'s colours carrying out a table while a little boy hangs on to one leg of it.', gm: 'Pell\'s bailiffs are taking the Brandts\' last furniture. Stop them by force, by paying 10 gp of the debt, or by out-talking them (DC 14 Intimidation). Afterwards, Nessa becomes the Contact Edge.' },
        { room: 'The Gilded Ledger', title: 'Opening an account', optional: true, gm: 'Casing by day. A hero who asks for a loan meets Pell at noon: let the players see how pleased with himself he is. A DC 14 Perception spots the iron door to the back rooms and the head clerk\'s key on its chain (a DC 16 Sleight of Hand lifts it: a Way in Edge, but he reports it lost at six).' },
        { room: 'The watch house', title: 'The duty board', encounter: 'Trouble at the watch house', gm: 'The Roster Edge, by reading the board (DC 13 Perception with a reason to be there), by charming the desk guard, or later from Tibbet. Fighting here is a terrible idea: it is a low fight but sets the starting alarm to 2.', handout: 'roster' },
        { room: "Rooftops of Goldsmith's Row", title: 'Someone else is watching', encounter: 'Lookouts on the roofs', read: 'You are not the only ones on the roofs. A figure in a red velvet mask lowers a spyglass, smiles, and tips her hat to you.', gm: 'Silk Corvane, two doppelgangers and the Velvet Lantern\'s lookouts. She is friendly and warns them off. A chase over the roofs (three DC 13 Acrobatics or Athletics) catches a lookout with the card. A fight is moderate; the doppelgangers flee and could turn up tonight in a guard\'s face.', handout: 'velvet-card' },
        { room: 'Brightwater Dyeworks', title: 'Fresh livery', optional: true, gm: 'A Way in Edge: Ledger tabards and a clerk\'s robe. Ma Pettle lends them for a promise; stealing them is DC 13 Sleight of Hand.' },
        { room: "Rat Kings' court", title: 'The Sewer Kings', encounter: 'The Sewer Kings', gm: 'King Scuttle holds court. A bargain (cheese, 50 gp, or open cellars) gives the sewer route as an Escape Edge and gets the heroes past the otyugh tonight. The old cistern on the way holds a dead burglar\'s gear.', treasure: 'In the old cistern: an immovable rod. From Scuttle, if befriended: a potion of greater healing and a bottle-cap crown "of safe passage". If beaten: 150 gp of junk coins and a wand of secrets.' },
        { room: 'Tallow Bridge', title: 'Old Grandmother', optional: true, encounter: 'Old Grandmother', gm: 'If the heroes plan to come by boat, they should meet Grandmother first. A fish wins her; a fight in deep water is nasty. Killing her upsets the Ward.', treasure: 'In her mud nest under the bridge: a drowned noble\'s gold bracelet (100 gp).' },
        { room: 'The Drowned Penny', title: 'Choosing the way in', read: 'The tavern is quiet. Grissel brings stew, puts out the lamps but one, and spreads a map on the table. "Right then, my ducks. How do we get in?"', gm: 'Count the Edges. Help the players pick a route: roof skylight, sewer culvert, front door in livery, or canal water-gate (or two at once). Set the starting alarm: 0, or higher if they left trouble behind them today.' },
      ],
      wrapUp: 'With the sun going down over the canals, the heroes have a plan, some Edges, and a rival crew to beat. At midnight, the Gilded Ledger goes dark.',
    },
    {
      id: 'night', title: 'Part 2: The night of the heist', level: 5,
      summary: 'Midnight to dawn inside the Gilded Ledger: four ways in, a rising alarm, dogs, guards, living armour, a hungry strongbox, a rival crew in the vault, and a twist waiting in the Auditor\'s hall.',
      goal: 'Get the real Tallow Ledger out of the Gilded Ledger before dawn, without getting caught.',
      map: ledgerByNight,
      npcs: [
        { npc: 'pf_glnessa', x: 30, y: 19 },
        { npc: 'pf_glpell', x: 72, y: 15, hidden: true },
        { npc: 'pf_glcorvane', x: 57, y: 56, hidden: true },
        { npc: 'pf_glquill', x: 60, y: 58, hidden: true },
        { npc: 'pf_glauditor', x: 76, y: 57, hidden: true },
        { npc: 'pf_gltibbet', x: 44, y: 76, hidden: true },
      ],
      scenes: [
        { room: "Goldsmith's Row", title: 'Midnight on the Row', read: 'The last lamp in the counting-house goes out. A bell somewhere across the water rings twelve. The street is yours, for a few minutes.', gm: 'Set the Alarm track (0 unless the day went badly) and let the heroes split or go together. The first bell is 1 a.m., the second 2 a.m. and the third bell is when Pell and the Velvet Lantern move. Every 10 minutes of real play is about half an hour of game time.' },
        { room: 'The rooftops', title: 'Over the roofs', encounter: 'Roof sentries', gm: 'The roof route. Two crossbows and their sergeant walk the leads; with the Roster the heroes know when they change (2nd bell, a 5-minute gap). The skylight drops them into the Counting Hall. Shooting a sentry who falls makes a noise (alarm +1).' },
        { room: 'Kennel yard', title: 'The canal route', encounter: 'Dogs in the yard', read: 'You slip under the portcullis into cold black water. The slip is quiet. Then, beyond the yard door, a dog lifts its head and sniffs.', gm: 'Boathouse, then the yard or the loft ladder. The dogs are the problem: drugged meat, a Ward favour, or silence magic. Fighting the whole yard is alarm +2. The boathouse barge is the best Escape there is: 30 people could hide in it.' },
        { room: 'Front hall', title: 'The front door', encounter: 'The night porters', gm: 'The cheeky route. Livery, pass and password get the heroes waved in as relief clerks; the porters even offer them dice. Missing a piece: DC 16 Deception. If they are found out, the porters ring for the guard room.' },
        { room: 'The sump', title: 'The sewer route', encounter: 'The sump', gm: 'Through the grate, down the drain, past the otyugh. Scuttle\'s crown or "something new to eat" gets them through without a fight. The culvert brick is already pushed in: the Velvet Lantern came this way.', treasure: 'A drowned burglar by the pool: a rope of climbing and 40 gp.' },
        { room: 'Great Counting Hall', title: 'Counting, counting', read: 'The engine ticks. Its brass dials turn toward you, very slowly, as if it has heard something.', gm: 'Nessa is here if recruited. She can stall the engine, tell them about the private stair and the amulet, and point them to the archive word. Crossing the moonlit square unseen is DC 13 Stealth or alarm +1.' },
        { room: 'Guard room', title: 'The watch turns out', encounter: 'The watch turns out', gm: 'This is what happens at alarm 2 or more: the off-duty guards and their dogs come looking. At alarm 4 they ring the bell and send a runner for Tibbet. A smart crew lures them into the Counting Hall and locks them in, or reaches the bell first.' },
        { room: "Pell's bedchamber", title: 'The sleeping banker', optional: true, gm: 'The roof hatch leads here. Stealing the amulet now solves the twist before it starts: reward that plan. Pell\'s study next door holds his note.', handout: 'pell-note', treasure: 'Pell\'s jewellery box: rings and pins worth 350 gp, and a hat of disguise he wears to spy on the Ward.' },
        { room: 'Vault antechamber', title: 'The round door', encounter: 'The antechamber wakes', gm: 'Livery or the rune-step keeps the armour asleep. The round door needs the lever, the key, or a long DC 18 pick. At Lockdown only the lever in Pell\'s office opens it, or Pell\'s private stair goes round it.' },
        { room: 'Strongbox gallery', title: 'The hungry strongbox', encounter: 'The hungry strongbox', gm: 'The swords drop if a box is touched carelessly. The mimic waits by the TALLOW box and bites the first hand on it. Greedy heroes can open three good boxes in ten minutes.', treasure: 'Three strongboxes: 600 gp in coin, a cloak of elvenkind, two potions of greater healing, and the deed to the Brightwater Dyeworks (Ma Pettle would weep).' },
        { room: 'Bullion cage', title: 'The Velvet Lantern', encounter: 'The Velvet Lantern', read: 'A lantern unshutters. A woman in a red velvet mask bows. "Well, isn\'t this awkward. Shall we fight, darlings, or shall we be civilised?"', gm: 'Corvane wants the book. Options: race them to the Auditor\'s hall, cut a deal (she takes the bullion, the heroes take the book), or show her the decoy order or Pell\'s note and she turns on Pell. A fight is high and loud (alarm +1 per round).', treasure: 'Gold bars: 10 bars of 50 gp each (each weighs 5 lb). Quill\'s dagger is a +1 dagger.' },
        { room: "The Auditor's hall", title: 'Blank pages', encounter: 'The Auditor', read: 'The great box opens. The Tallow Ledger lies inside, gold on calf. You turn the pages: names, names, names, and then nothing. Page after page of nothing. Behind you, the statue in the alcove begins to tick.', gm: 'The twist. The book is the decoy; the real Ledger is in the Auditor\'s chest. Pell arrives by his private stair at the third bell or alarm 4, with his bodyguard captain (knight) and guards, and commands the Auditor. Ways out: steal or grab the amulet, unlock the chest while the Auditor is held, turn the Velvet Lantern on Pell, or fight. Pell bargains when his guardian falls or his captain yields.', treasure: 'The real Tallow Ledger. The silver amulet (the Auditor now obeys the heroes). Pell\'s ring of office (200 gp), and Pell himself, if they want to hand him to the watch with the archive\'s bribe book.' },
      ],
      wrapUp: 'Out through the sewer, the canal, the roofs or the front door, with the Tallow Ledger under someone\'s coat. At dawn on Quarter-Day, Pell stands in the Guild Court with no book, and the Ward sings in the streets.',
    },
  ],
  ending:
    'Success: the heroes walk out with the real Tallow Ledger. On Quarter-Day, Pell has no ink and so no debt; the Ward burns the Ledger on the Washing steps and every family keeps its house. If the heroes also took the bribe book or the decoy order, Pell is ruined and the Gilded Ledger is shut. Grissel pays the 500 gp and nails a gold coin over the bar with the heroes\' names on it. Half success: if they only got the decoy, Pell shows the real book at dawn, but the decoy order and Pell\'s note can still win the case if the heroes take them to the Guild Court (DC 15 Persuasion, advantage with Ottilie as witness). Failure: if they are caught, the watch clears the Ward, the heroes are in the cells under the watch house, and Part 3 is a jailbreak, with Nessa, Scuttle and maybe Silk Corvane on the outside. Next: Pell had partners on the city council, and the bribe book names every one of them. Someone will want it back.',
};
