// Frostfang Pass: a three-part mini-campaign for four heroes, levels 11 to 13.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// ---------- Part 1: Highward, the walled pass-town ----------
function highward() {
  const b = new MapBuilder('adv-frostfang-town', 'Highward in the endless winter', 80, 80, { open: true, floor: 'ice', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  // the mountain walls on both sides of the pass
  const r = rng(1101);
  let wl = 4, wr = 4;
  for (let y = 0; y < 80; y++) {
    wl = Math.max(2, Math.min(6, wl + Math.round((r() - 0.5) * 2.2)));
    wr = Math.max(2, Math.min(6, wr + Math.round((r() - 0.5) * 2.2)));
    b.rock(0, y, wl, 1).rock(80 - wr, y, wr, 1);
  }

  // ----- north of the wall: the Giants' Road -----
  b.paint(38, 9, 4, 7, 'dirt').paint(40, 4, 4, 6, 'dirt').paint(42, 0, 4, 5, 'dirt');
  b.area("Giants' Road", [[34, 0, 14, 9]], { read: 'Above the wall the road climbs into the white. Footprints as long as a rowing boat run down it, each one filled with fresh snow.', gm: 'The way up to the glacier (part 2). The tracks are two nights old: DC 15 Survival shows four giants, a mammoth and wolves, coming and going.', label: [43, 3] });
  b.props_('snowdrift', [[36, 2], [47, 7], [44, 12]]).props_('boulder-large', [[35, 6], [46, 1]]).prop('milestone', 41, 8).prop('skull-bleached', 37, 11);
  b.note(43, 1, "Part 2 starts here: the Giants' Road climbs to the glacier.");
  b.area('Watch cairn', [[20, 3, 13, 10]], { read: 'A cairn of black stones stands on a knoll, taller than a house. Someone has hung a mammoth skull on top, and fresh blood has frozen down its tusks.', gm: 'The giants\' raiding parties gather here before they come down. Two giant scouts and their worgs wait for nightfall. They can be talked to (DC 18 Persuasion, or speaking Giant gives advantage): they say the little folk killed their prince and the queen wants grain as blood-price.', label: [26, 7] });
  b.prop('cairn', 26, 7).prop('skull-bleached', 27, 6).props_('campfire-cold', [[23, 9], [30, 5]]).props_('bedroll', [[22, 5], [29, 10]]).prop('rug-pelt', 24, 10).prop('bone-heap', 31, 9);
  b.encounter('Giant scouts at the cairn', [20, 3, 13, 10], [['frostGiant', 2], ['worg', 4]], 'low');
  b.area('Frozen woods', [[7, 1, 12, 13]], { read: 'Firs bent double under the snow. Every branch is cased in ice, and they clink together like glass when the wind blows.', gm: 'Cover for anyone sneaking round the wall. A frozen woodcutter sits against a tree with his axe across his knees (Highward\'s last missing man). His sack holds a fat hare and 3 gp.', label: [12, 7] });
  b.props_('tree-fir-snow', [[8, 2], [11, 3], [14, 1], [9, 6], [13, 7], [16, 5], [10, 10], [15, 11], [17, 9]]).prop('skeleton-seated', 12, 9).prop('log-pile', 15, 8).prop('stump', 10, 12);
  b.rubble(52, 3, 15, 7);
  b.area('Avalanche field', [[51, 2, 18, 11]], { read: 'A slope of broken snow and boulders, piled where half the mountainside came down. It is deep and soft, and something has dug a trench through it.', gm: 'Deep snow: difficult ground. The trench leads to the fort\'s hidden sally port (DC 16 Perception from this side to spot the door). A loud noise here sets off another slide: DC 15 Dexterity save or 22 (4d10) bludgeoning damage and buried.', label: [59, 6] });
  b.props_('boulder', [[54, 4], [60, 8], [65, 3]]).props_('boulder-large', [[57, 6], [63, 6]]).props_('snowdrift', [[52, 11], [67, 11]]).prop('tree-dead', 68, 2);

  // ----- the town wall, gates and the frozen water-gate -----
  b.rock(0, 16, 80, 2).rock(0, 68, 80, 2);
  b.floor(38, 16, 4, 2, 'stone-cobble');
  for (let x = 38; x < 42; x++) b.door(x, 16, 'n', 'closed', 'door-iron');
  b.area('North Gate', [[36, 15, 8, 5]], { read: 'An iron gate in a wall of grey stone, scarred with long white claw marks higher than a man can reach. The guards on the wall-walk stamp their feet and watch the dark.', gm: 'Six tired guards hold it. The gate can be barred (DC 20 Strength to force from outside, a frost giant does it in 2 rounds). Braziers here give the only warmth on the wall.', label: [39, 17] });
  b.props_('brazier', [[36, 19], [43, 19]]).prop('cheval-de-frise', 39, 14).props_('sandbags', [[37, 20], [42, 20]]).prop('ballista', 40, 21);
  b.light(36, 19, 15, 20).light(43, 19, 15, 20);
  b.encounter('The feint at the North Gate', [32, 8, 16, 8], [['frostGiant', 2], ['polarBear', 4], ['worg', 2]], 'moderate');
  b.floor(13, 16, 4, 2, 'ice');
  for (let x = 13; x < 17; x++) b.door(x, 16, 'n', 'locked', 'door-iron');
  b.area('Water-gate', [[12, 15, 6, 4]], { read: 'Where the tarn once drained out under the wall, an iron grille is frozen into a block of ice as clear as glass.', gm: 'Everyone in town thinks the frozen grille is the strongest part of the wall. It is the weakest: the ice has split the stones around it. A DC 18 Investigation by day spots the cracks. The giants know it.', label: [14, 17] });
  b.floor(66, 16, 1, 2, 'stone-cobble').door(66, 16, 'n', 'secret');
  b.area('Sally port', [[65, 15, 3, 4]], { gm: 'A secret door from the fort yard out into the Avalanche field, built for raids. Commander Brask knows it; nobody else does. DC 18 Perception from inside.', label: [66, 17] });
  b.floor(38, 68, 4, 2, 'stone-cobble');
  for (let x = 38; x < 42; x++) b.door(x, 69, 's', 'closed', 'door-iron');

  // ----- Fort Fang -----
  b.rock(50, 18, 1, 19).rock(50, 36, 30, 1).rock(72, 18, 8, 19);
  b.paint(51, 18, 21, 18, 'dirt');
  b.floor(50, 26, 1, 2, 'stone-cobble').door(50, 26, 'w', 'closed', 'door-iron').door(50, 27, 'w', 'closed', 'door-iron');
  b.floor(60, 36, 2, 1, 'stone-cobble').door(60, 36, 's', 'closed').door(61, 36, 's', 'closed');
  b.area('Fort yard', [[51, 27, 12, 9]], { read: 'A square yard of trampled snow inside thick walls. Soldiers in two kinds of uniform sit round a fire and do not talk to each other.', gm: 'Fort Fang holds 40 soldiers: half from Aldermark in the south, half from Corrandy in the north, both stuck here when the pass closed. They hate each other a little and the giants a lot. A DC 14 Insight shows both sides are near breaking: one good speech (DC 17 Persuasion) makes them one company again, and gives the heroes 20 veterans for the raid.', label: [56, 31] });
  b.props_('training-dummy', [[52, 28], [52, 30]]).prop('well', 58, 30).prop('campfire', 55, 33).props_('bench', [[54, 34], [57, 34]]).prop('firewood', 61, 28).prop('weapon-barrel', 61, 34).prop('stairs-up', 51, 34).prop('cart', 60, 32).prop('war-banner', 53, 27);
  b.light(55, 33, 15, 20);
  b.building('The Keep of Fort Fang', 52, 19, 11, 7, { mat: 'stone-flagstone', read: 'A cold stone hall with maps nailed to every wall. On the big table, someone has pushed wooden giants across a map of the town and knocked half the soldier pieces over.', gm: 'Commander Isolde Brask\'s keep. She will share everything: the raids come every third night, they take grain and leave the dead, and the next one is tonight. Her arms chest holds 4 potions of resistance (cold) she will lend for the raid.', doors: [[57, 25, 's']], windows: [[54, 19, 'n'], [60, 19, 'n']] });
  b.prop('war-table', 56, 21).props_('chair', [[55, 22], [58, 22]]).prop('fireplace', 53, 20).prop('bed', 61, 20).prop('weapon-rack', 61, 24).prop('chest', 53, 24).prop('banner-hanging-tall', 57, 20);
  b.light(53, 21, 10, 15);
  b.building('Barracks', 64, 19, 7, 9, { gm: 'Bunks for forty, half of them empty: the dead, the deserters and the men too sick to stand. A sergeant here sells his own ration of bread for 5 gp a loaf.', doors: [[64, 23, 'w']] });
  b.props_('bunk-bed', [[65, 20], [67, 20], [69, 20], [65, 26], [67, 26], [69, 26]]).prop('footlocker', 68, 23).prop('stove', 69, 23);
  b.wallRun(64, 29, 7, 'n', 'bars').wallRun(64, 34, 7, 's', 'bars').wallRun(64, 29, 6, 'w', 'bars').wallRun(70, 29, 6, 'e', 'bars');
  b.door(64, 31, 'w', 'locked', 'door-iron');
  b.area('Giant stockade', [[64, 29, 7, 6]], { read: 'Behind iron bars sits a giant woman chained at both ankles, her blue skin grey with cold and hunger. When she sees you, she bares her teeth and then, slowly, holds out her empty bowl.', gm: 'Grunna Two-Spears, a frost giant scout taken in the last raid. Feed her and speak with her (Giant, or DC 16 Persuasion through gestures) and she tells the giants\' side: their prince vanished on his way to Highward, their mammoths are being stolen, and their queen wants the town\'s grain as blood-price. Freeing her is the first step to peace.', label: [67, 31] });
  b.props_('wall-chains', [[69, 30], [69, 33]]).prop('bone-heap', 65, 33).prop('straw-bed', 68, 32).prop('water-trough', 66, 30);

  // ----- north side of town -----
  b.paint(38, 18, 4, 50, 'stone-cobble');
  b.building("Reeve's hall", 29, 20, 8, 8, { mat: 'wood-planks-dark', read: 'Benches, a fireplace with no fire, and the town\'s notice board covered in lists: the dead, the missing and the rationed.', gm: 'Reeve Pell Haskett is dead of the cough; the town is run by Brask now. The notice board holds an old writ of exile for a court mage (handout). DC 13 Investigation: a sketch of the exiled mage is pinned beneath it, and the barman of the Last Hearth will swear he saw that face in autumn.', doors: [[36, 23, 'e']], windows: [[29, 22, 'w'], [32, 20, 'n']] });
  b.prop('notice-board', 30, 21).prop('fireplace', 34, 21).props_('bench-long', [[31, 24], [31, 26]]).prop('desk', 35, 26).prop('map-cabinet', 30, 26);
  b.building('Smithy', 43, 20, 6, 7, { mat: 'stone-cobble', read: 'The only warm room in Highward. A big woman is beating a hinge into a spearhead, because there is nothing else left to make spears from.', gm: 'Smith Hilde Mott can reforge cold iron weapons (no charge for heroes who fight the raid). She will trade her grandfather\'s +1 warhammer for news that the winter can be ended.', doors: [[43, 23, 'w']] });
  b.prop('forge', 47, 21).prop('anvil', 45, 22).prop('grindstone', 47, 25).prop('tool-wall', 44, 21).prop('weapon-barrel', 44, 25).prop('water-barrel', 46, 25);
  b.light(47, 21, 15, 20, '#ff9a3c');
  b.building("Cooper's house", 29, 29, 7, 5, { gm: 'Empty. The cooper took his family over the pass in the first snow; nobody has heard from them. Barrel staves are stacked as firewood.', doors: [[35, 31, 'e']] });
  b.prop('bed-double', 30, 30).prop('table-square', 33, 31).prop('barrel-group', 30, 32).prop('firewood', 34, 32);
  b.building('The empty bakery', 43, 28, 7, 6, { read: 'A cold oven, bare racks and a mouse on the floor too weak to run.', gm: 'The baker gave out her last flour a week ago. She will tell anyone who asks that Quartermaster Grue still had flour sacks in the grain warehouse three days back.', doors: [[43, 30, 'w']] });
  b.prop('hearth-oven', 48, 29).prop('bread-rack', 45, 29).prop('kitchen-table', 46, 31).prop('flour-sacks', 48, 32);

  // ----- Mirrow Tarn, frozen solid -----
  b.water(15, 27, 3, 2, true).water(17, 37, 2, 2, true);
  b.area('Mirrow Tarn', [[8, 18, 20, 15]], { read: 'The town\'s lake has frozen so deep that carts cross it. Under the ice, if you look straight down, you can see shapes: helmets, hands, the spokes of a wheel.', gm: 'An old army drowned here when the ice broke under it, three hundred years ago. The ice is solid, except at the two dark holes the fishers keep open (DC 12 Acrobatics to cross them in a fight).', label: [17, 24] });
  b.props_('frozen-pond', [[11, 21], [21, 20], [12, 31], [24, 26]]).props_('ice-thin', [[14, 27], [18, 28]]).prop('rowboat', 9, 25, 90).props_('reeds', [[26, 19], [8, 30]]).props_('snowdrift', [[25, 32], [9, 20]]);
  b.encounter('Over the frozen tarn', [8, 18, 20, 10], [['frostGiant', 3], ['mammoth', 1], ['direWolf', 4]], 'high');
  b.building('Ice-fishing shanty', 20, 28, 4, 3, { gm: 'A fisher\'s hut on runners. Inside: a stove, lines and a fat frozen pike. Old Tam the fisher sleeps here and has seen lights moving under the ice at the Soldiers\' Hole.', doors: [[21, 30, 's']] });
  b.prop('fishing-gear', 21, 29).prop('stool', 22, 29);
  b.area("Soldiers' Hole", [[12, 34, 12, 7]], { read: 'A hole in the ice the size of a door, black water steaming in the cold. Something pale floats just under the surface, and its eyes are open.', gm: 'The drowned army\'s officers rise here when anyone fishes too long. The specters drift up through the ice; the wraiths walk up out of the hole. They want the town\'s "deserters" (anyone wearing Corrandy colours). Mother Aud\'s blessing (holy water from the chapel) poured into the hole sends them back for a month.', label: [17, 36] });
  b.props_('frozen-pond', [[14, 38], [21, 35]]).prop('fishing-net', 19, 39).prop('skeleton-lying', 13, 40).prop('lantern-standing', 16, 35);
  b.light(16, 35, 10, 15, '#bfe0ff');
  b.encounter('The drowned muster', [10, 33, 16, 9], [['wraith', 3], ['specter', 4]], 'low');

  // ----- the market and the east yards -----
  b.paint(29, 36, 22, 12, 'stone-cobble').paint(20, 45, 9, 2, 'dirt').paint(51, 45, 21, 2, 'dirt');
  b.area('Market square', [[29, 36, 22, 12]], { read: 'Empty stalls under caps of snow. A line of people in blankets waits in silence at a table where a clerk measures out grain by the cupful.', gm: 'The bread line. Each person gets one cup a day; it will run out in nine days. A fight breaks out if the heroes do nothing (DC 15 Intimidation or Persuasion to calm it). The well is frozen; townsfolk melt snow over braziers.', label: [34, 41] });
  b.prop('well', 34, 40).props_('market-stall', [[30, 37], [44, 37], [47, 42]]).prop('table-trestle', 44, 40).prop('notice-board', 36, 37).props_('brazier-pedestal', [[31, 43], [46, 46]]).prop('scales', 45, 40).prop('lamp-post', 37, 44).prop('handcart', 32, 46);
  b.light(31, 43, 10, 15).light(46, 46, 10, 15).light(37, 44, 10, 15);
  b.building('Stables', 53, 38, 12, 7, { mat: 'wood-planks', gm: 'Empty stalls. The horses were eaten in the second month. A mule called Turnip is hidden in the hayloft by the stable boy, who will trade "the secret way out" (the smugglers\' tunnel) to anyone who promises not to eat her.', doors: [[58, 44, 's']] });
  b.props_('hay-bale', [[54, 39], [63, 39]]).prop('water-trough', 58, 41).props_('hitching-post', [[55, 43], [61, 43]]).prop('bones', 60, 40).prop('gear-pile', 63, 43);
  b.area('Wagon yard', [[51, 47, 21, 7]], { read: 'Wagons from both kingdoms stand frozen to the ground, axle to axle, their cargo long since eaten or burned.', gm: 'Good cover in a fight. A Corrandy wagon still holds a crate of lamp oil (useful against the giants: thrown, 2d6 fire damage for 2 rounds).', label: [61, 50] });
  b.props_('wagon', [[53, 48], [58, 51], [66, 48]]).prop('cart', 63, 52).prop('crate-stack', 69, 51).prop('barrel-stack', 56, 52).prop('snowdrift', 70, 47);

  // ----- south side of town -----
  b.building('Chapel of the Low Sun', 8, 48, 12, 10, { mat: 'stone-flagstone', read: 'Every pew is a bed. Children sleep in rows under the altar, and a big copper cauldron of thin soup steams by the door.', gm: 'Mother Aud keeps the sick and the orphans here. She knows the Thaw Pact: the old bargain with the giants (handout: the Thaw Song). She says the pact was due to be renewed this year, by a giant prince who never came.', doors: [[19, 52, 'e'], [13, 57, 's']], windows: [[8, 51, 'w'], [8, 54, 'w']] });
  b.prop('altar', 9, 52).props_('pew', [[12, 50], [12, 53], [15, 50], [15, 53]]).prop('cauldron', 18, 50).props_('bedroll', [[10, 55], [12, 56], [15, 56]]).prop('candelabra', 9, 49).prop('font', 17, 55);
  b.light(9, 52, 10, 15, '#ffe3a8').light(18, 50, 5, 10);
  b.area('Snowbound graveyard', [[8, 59, 13, 8]], { read: 'The ground is too hard to dig. The dead of the winter lie in rows under the snow, waiting for spring, each with a stone on their chest so the wolves don\'t take them.', gm: 'Forty-one bodies. One "grave" is a fake: Grue\'s second stash is buried under it (DC 15 Perception: no body, just sacks). The Soldiers\' Hole wraiths sometimes walk here.', label: [14, 62] });
  b.props_('cairn', [[10, 60], [13, 60], [16, 60], [10, 64], [13, 64]]).prop('open-grave', 18, 63).props_('fence-wood', [[8, 66], [20, 66]]).prop('statue-tall-robed', 19, 60).prop('tree-dead', 9, 62).prop('gm-treasure', 16, 64, 0, { gm: true });
  b.building('The Last Hearth', 23, 49, 12, 8, { read: 'The fire is made of chairs. The few people who can still pay for ale sit close to it, and the rest sit close to them.', gm: 'Innkeeper Bram Toll waters the last cask. He remembers a grey-cloaked mage who rented a room in autumn, paid in silver so cold it burned the hand, and asked the way up the Giants\' Road. A short rest here is safe.', doors: [[34, 52, 'e'], [28, 56, 's']] });
  b.prop('bar-counter', 24, 50).prop('keg-rack', 24, 52).prop('hearth-grand', 31, 49).props_('table-round', [[27, 52], [31, 53]]).props_('chair', [[26, 52], [28, 52], [30, 53], [32, 53]]).prop('bench-long', 26, 55).prop('tavern-sign', 33, 55);
  b.light(31, 50, 15, 20);
  b.area('Stranded caravan', [[22, 58, 14, 9]], { read: 'Tents and covered wagons in a ring, like a camp waiting for an attack. Children in two kinds of coat play the same game in the snow.', gm: 'Caravan folk from both kingdoms, stuck since the pass closed. Their leader, a Corrandy spice trader, has a sled and dogs and will lend them for the trip up the glacier if the heroes stop the raids.', label: [28, 62] });
  b.props_('wagon', [[23, 59], [32, 59]]).props_('tent', [[24, 63], [30, 64]]).prop('tent-round', 34, 63).prop('campfire', 28, 62).props_('crate-pile', [[26, 65], [33, 66]]).prop('snowman', 22, 65);
  b.light(28, 62, 10, 15);
  b.building('Grain warehouse', 44, 55, 13, 11, { mat: 'wood-planks-dark', read: 'Sacks. Hundreds of sacks, stacked to the rafters, smelling of wheat and summer. Eight hard men with axes sit on them like dogs on a bone.', gm: 'Quartermaster Selwyn Grue has hidden 212 sacks of grain here and sells them for silver while the town starves. His hired swords fight if pushed, but surrender at half strength. Showing the town what is here (or the ledger) turns the whole town against him. This is also what the giants are raiding for.', doors: [[44, 59, 'w'], [50, 55, 'n']] });
  b.props_('flour-sacks', [[46, 56], [48, 56], [52, 56], [54, 56], [46, 64], [54, 64]]).props_('crate-stack', [[55, 58], [55, 61]]).prop('desk', 50, 62).prop('strongbox', 51, 63).prop('barrel-stack', 47, 61).prop('lantern-hanging', 50, 59);
  b.light(50, 59, 10, 15);
  b.encounter("Grue's hired swords", [44, 55, 13, 11], [['veteran', 4], ['berserker', 4]], 'low');
  b.building('Salt warehouse', 59, 55, 12, 11, { mat: 'wood-planks', gm: 'Nearly empty: a few salt blocks and the smell of fish. The back wall has a hidden door (DC 17 Perception, or ask the stable boy) to an old smugglers\' tunnel through the rock to the south road.', doors: [[64, 55, 'n']] });
  b.props_('crate', [[60, 56], [61, 56]]).prop('sack', 62, 60).prop('fish-crate', 66, 63).prop('rope-coil', 68, 57);
  b.door(70, 60, 'e', 'secret');
  b.tunnel([[71, 60], [74, 64], [74, 71], [68, 75]], 1, { mat: 'cave-floor', seed: 1102 });
  b.area("Smugglers' tunnel", [[71, 60, 4, 12]], { gm: 'Low and narrow: Medium creatures squeeze, giants can\'t follow. A second way in and out of Highward that the giants don\'t know about.', label: [74, 66] });
  b.cave("Smugglers' cave", 66, 75, 4, 3, { seed: 1103, mat: 'cave-floor', gm: 'A dry cave hidden behind a boulder on the south road. Old smugglers\' gear: a lantern, a crate of brandy (6 bottles).' });
  b.prop('crate', 66, 75).prop('lantern-standing', 67, 74);

  // small houses, most of them shut up and cold
  const hut = (x: number, y: number, w: number, h: number, d: [number, number, 'n' | 's' | 'e' | 'w']) =>
    b.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e').door(d[0], d[1], d[2]);
  hut(44, 48, 5, 5, [46, 52, 's']);
  b.prop('bed', 45, 49).prop('stove', 47, 49).prop('table-square', 46, 50);
  hut(9, 42, 6, 4, [11, 45, 's']);
  b.prop('bunk-bed', 10, 43).prop('hearth-oven', 13, 43).prop('rocking-chair', 12, 44);
  hut(23, 38, 5, 5, [23, 40, 'w']);
  b.prop('bed', 24, 39).prop('broken-furniture', 26, 41).prop('fishing-gear', 26, 39);
  b.props_('reeds', [[8, 33], [27, 22], [27, 29]]).props_('boulder', [[8, 27], [26, 33], [10, 19]]);

  // ----- south of the wall: the road in -----
  b.paint(38, 70, 4, 10, 'dirt');
  b.area('South road', [[30, 70, 20, 10]], { read: 'The last mile to Highward climbs between black cliffs. Ahead, a grey wall plugs the pass like a cork, with smoke from a few thin chimneys behind it. Nothing comes down the road toward you. Nothing has for months.', gm: 'Where the heroes arrive, with the last caravan the passes will allow. The South Gate guards are slow to open (the town has no food for more mouths) until the heroes show they can fight.', label: [36, 74] });
  b.props_('tree-fir-snow', [[31, 71], [47, 72], [33, 77], [46, 78]]).prop('signpost', 42, 75).prop('wagon', 34, 75).prop('snowdrift', 44, 71).prop('campfire-cold', 45, 76).prop('milestone', 37, 78);
  b.props_('brazier', [[37, 70], [42, 70]]);
  b.light(37, 70, 10, 15).light(42, 70, 10, 15);
  b.start(38, 75, 3, 3);
  return b.build();
}

// ---------- Part 2: the glacier caves ----------
function glacierCaves() {
  const b = new MapBuilder('adv-frostfang-glacier', 'The Glacier of the Pale Hunger', 80, 80, { theme: 'cave', wallStyle: 'cave', ambient: 'dim', floor: 'cave-floor' });

  b.cave('Glacier mouth', 40, 71, 10, 6, { seed: 2001, mat: 'ice', read: 'The glacier opens like a blue mouth. Inside, the light comes through the ice itself, cold and green, and the walls groan softly as the ice moves.', gm: 'The way in. Three paths: west toward a smell of old death, east toward drifting steam, and straight up a slick ramp to the great crevasse. Giant footprints go west; dragon claw marks go everywhere.' });
  b.props_('snowdrift', [[34, 70], [46, 74]]).props_('ice-block', [[33, 73], [47, 68]]).prop('stalactites', 40, 67).prop('campfire-cold', 43, 73).prop('handcart', 36, 75);
  b.light(40, 70, 10, 20, '#bfe8ff');
  b.start(38, 72, 3, 3);
  b.note(40, 76, "From part 1: the Giants' Road ends here.");

  // west: the frozen dead and the bears
  b.tunnel([[32, 70], [22, 66], [17, 62]], 2, { seed: 2011 });
  b.cave('Field of the frozen dead', 15, 57, 10, 7, { seed: 2002, read: 'Soldiers stand in the ice like flies in amber, hundreds of them, in old-fashioned helmets, frozen mid-stride. A few have melted half out. One of them turns its head to follow you.', gm: 'The rest of the army that drowned in Mirrow Tarn: they were marching over the glacier when the ice took them. Their wights still keep the line. Showing a banner of either kingdom (or a DC 18 Persuasion in the old soldier\'s cant, History DC 14 to know it) makes them stand aside: "Pass, friend."' });
  b.props_('ice-block', [[10, 54], [12, 59], [19, 55], [20, 60], [8, 57]]).props_('skeleton-lying', [[14, 61], [17, 53]]).prop('war-banner', 15, 56).prop('weapon-barrel', 11, 62).prop('shield-wall', 21, 57).prop('bone-heap', 9, 60);
  b.light(15, 56, 5, 15, '#9fd0ff');
  b.encounter('The frozen dead', [7, 50, 16, 13], [['wraith', 3], ['wight', 4]], 'low');
  b.cave('Bear den', 28, 59, 5, 4, { seed: 2012, mat: 'cave-floor', read: 'A warm, rank smell. A heap of white fur rises and falls. Then another. Then another.', gm: 'Ten polar bears sleep here, fat on mammoth scraps the dragon leaves. DC 15 Stealth for the group to pass; any loud noise wakes them. They flee from fire.' });
  b.tunnel([[27, 66], [28, 62]], 1, { seed: 2013 });
  b.props_('bones', [[26, 58], [30, 60]]).prop('rug-pelt', 28, 59).prop('skull-bleached', 31, 58);
  b.encounter('Bears in the long sleep', [23, 55, 10, 8], [['polarBear', 10]], 'low');

  // east: the steam grotto
  b.tunnel([[48, 70], [58, 66], [64, 62]], 2, { seed: 2014 });
  b.cave('Steam grotto', 66, 59, 8, 6, { seed: 2003, read: 'A hot spring bubbles up through the glacier, and the cave is full of fog. Little blue shapes with icicle wings fall silent the moment you come in.', gm: 'Ice mephits nest where the steam freezes into feathers, with two water elementals made of the spring. The mephits are spiteful gossips: bribed with a shiny thing or a good insult (DC 14 Deception or Performance), they tell where the dragon sleeps and that "the grey man" visits her.' });
  b.pool(67, 60, 3, 2, false);
  b.props_('steam-vent', [[62, 57], [70, 62]]).props_('crystal-spire', [[61, 61], [71, 56]]).prop('ice-block', 65, 55).prop('stalactites-tall', 68, 62);
  b.light(67, 58, 10, 20, '#d8f4ff');
  b.encounter('Mephits of the steam grotto', [59, 54, 14, 11], [['iceMephit', 10], ['waterElemental', 2]], 'low');

  // the great crevasse and its three crossings
  b.cave(null, 20, 46, 13, 5, { seed: 2021 });
  b.cave(null, 40, 46, 12, 5, { seed: 2022, mat: 'ice' });
  b.cave(null, 60, 46, 13, 5, { seed: 2023 });
  b.pit(8, 45, 64, 3);
  b.floor(14, 45, 2, 3, 'ice').floor(39, 45, 2, 3, 'ice').floor(62, 45, 1, 3, 'wood-planks');
  b.area('The Crevasse', [[24, 41, 12, 10]], { read: 'The glacier is split in two by a crack too deep to see the bottom of. Wind howls up out of it, and somewhere far below, water roars.', gm: 'Falling in is 70 ft to a ledge: 7d6 bludgeoning, and a DC 15 Athletics climb out. Three crossings: the snow bridge (west), the ice bridge (middle), the old rope bridge (east).', label: [30, 46] });
  b.area('Snow bridge', [[12, 44, 5, 5]], { gm: 'A natural bridge of packed snow. It holds Medium creatures. Anything Large, or a fight on it, collapses it: DC 16 Dexterity save or fall.', label: [14, 46] });
  b.area('Ice bridge', [[37, 44, 6, 5]], { gm: 'Solid but slick: DC 12 Acrobatics or fall prone; prone at the edge is a DC 12 Dexterity save not to slide off.', label: [39, 46] });
  b.area('Rope bridge', [[60, 44, 5, 5]], { gm: 'The giants built it for their own use: the planks are wide but the ropes are frayed. A DC 15 Investigation sees they were cut halfway through, on purpose. One giant on it snaps it.', label: [62, 46] });
  b.props_('chasm-edge', [[25, 44], [50, 48], [70, 44]]).props_('crumbling-ledge', [[18, 44], [44, 48]]).prop('bridge-rope', 62, 46, 90).prop('ice-thin', 39, 46).props_('snowdrift', [[12, 43], [55, 49]]);
  b.tunnel([[40, 64], [40, 51]], 2, { mat: 'ice', seed: 2024 });
  b.tunnel([[15, 50], [15, 47]], 2, { seed: 2025 });
  b.tunnel([[63, 53], [62, 50]], 2, { seed: 2026 });

  // north-west: the giant hunters and the mammoth pen
  b.cave('Giant hunters\' camp', 14, 33, 8, 6, { seed: 2004, read: 'A fire of whole pine trees burns in a ring of stones. Three giants sit around it, sharpening spears as long as masts, and their wolves lift their heads as one.', gm: 'A frost giant hunting party, sent to win back the stolen mammoths. They are losing: the dragon has eaten two of them. If Grunna is with the heroes, or the heroes speak Giant and offer help against the dragon (DC 17 Persuasion), they agree to a truce and may fight beside the heroes in the den.' });
  b.props_('campfire', [[14, 33]]).props_('bedroll', [[10, 31], [18, 36]]).prop('spear-rack', 9, 35).prop('giant-ribcage', 19, 30).prop('rug-pelt', 12, 37).prop('loot-sacks', 17, 29);
  b.light(14, 33, 20, 30, '#ff9a3c');
  b.encounter('Giant hunters', [7, 28, 15, 11], [['frostGiant', 3], ['worg', 2]], 'moderate');
  b.tunnel([[13, 27], [13, 21]], 2, { seed: 2027 });
  b.tunnel([[14, 36], [14, 43]], 2, { seed: 2028 });
  b.cave('Mammoth pen', 12, 14, 8, 7, { seed: 2005, read: 'Walls of ice have been raised around a herd of shaggy mammoths, a dozen of them, thin and frightened. Their tusks are painted with blue giant-marks.', gm: 'The dragon\'s larder: the giants\' stolen herd, walled in with her breath. The ice wall has 60 hit points and is vulnerable to fire. Freed mammoths stampede home up the chimney path, and the giants will hear of it. A DC 15 Animal Handling calms them enough to lead.' });
  b.props_('ice-block', [[6, 10], [8, 18], [17, 9], [18, 17]]).props_('hay-bale', [[11, 12], [14, 16]]).prop('bones', 9, 14).prop('water-trough', 15, 12);
  b.light(12, 14, 5, 15, '#bfe8ff');

  // north-middle: the blue coffin, the frozen waterfall and the chimney
  b.tunnel([[15, 13], [26, 12]], 2, { seed: 2029 });
  b.cave('Hall of the blue coffin', 31, 12, 6, 5, { seed: 2006, mat: 'ice', read: 'A pillar of blue ice stands in the middle of the cave, and inside it, standing, eyes open, is a frost giant in a fine white cloak. His hand is raised as if to knock. His chest, very slowly, rises.', gm: 'Prince Hallvar, alive, held in a spell of stasis that Vask cast. Two invisible stalkers Vask bound here keep anyone from touching it; ice mephits play in the cave. Freeing him: a dispel magic against DC 19, or deal 100 fire damage to the ice. He wakes weak (half hit points) and grateful, and knows who did this.' });
  b.props_('ice-block', [[31, 12]]).props_('crystal-spire', [[28, 10], [33, 14]]).prop('magic-circle', 31, 14).prop('cave-crystals', 27, 14);
  b.light(31, 12, 10, 20, '#7fb8ff');
  b.encounter('Wardens of the blue coffin', [25, 8, 12, 9], [['invisibleStalker', 2], ['iceMephit', 6]], 'low');
  b.tunnel([[34, 16], [36, 23]], 2, { mat: 'ice', seed: 2030 });
  b.tunnel([[35, 9], [38, 6]], 2, { seed: 2031 });
  b.cave('The frozen waterfall', 38, 30, 9, 7, { seed: 2007, mat: 'ice', read: 'A waterfall a hundred feet high has frozen in the act of falling, a curtain of blue glass with the shapes of the water still in it. Behind it, something dark moves.', gm: 'The heart of the glacier. Behind the falls a narrow passage climbs to the Wind chimney (secret: DC 17 Perception, or the mephits tell). East, a slope leads down to the meltwater river and the dragon\'s den. Climbing the falls themselves is a DC 18 Athletics check.' });
  b.props_('ice-block', [[33, 25], [36, 24], [41, 24], [43, 27]]).props_('stalactites-tall', [[34, 28], [43, 29]]).prop('frozen-pond', 38, 31).prop('stairs-up', 38, 26).prop('crystal-spire', 44, 33);
  b.light(38, 28, 15, 25, '#9fd8ff');
  b.tunnel([[39, 37], [39, 42]], 2, { mat: 'ice', seed: 2032 });
  b.hall(40, 4, 40, 26, 1, { mat: 'ice' });
  b.door(40, 13, 'n', 'secret');
  b.cave('Wind chimney', 40, 5, 6, 3, { seed: 2010, mat: 'ice', read: 'A shaft of blue ice climbs toward a circle of grey sky. Wind screams down it, carrying snow and, very faintly, the sound of enormous voices singing.', gm: 'The way up to the giants\' hall on the peak (part 3). Climbing it is an hour\'s work with ropes (DC 15 Athletics, or the giants\' carved steps if a giant shows them).' });
  b.props_('snowdrift', [[37, 5], [43, 4]]).prop('rope-coil', 41, 6).prop('stairs-up', 40, 3);
  b.note(40, 2, 'Part 3 starts here: the climb to Rimehold.');

  // east: the meltwater river and the dragon's den
  b.tunnel([[53, 4], [54, 14], [52, 26], [54, 40]], 5, { seed: 2033 });
  const riverAt = (y: number) => (y < 14 ? 55 + Math.round((y - 4) / 10) : y < 26 ? 56 - Math.round(((y - 14) / 12) * 2) : 54 + Math.round(((y - 26) / 14) * 2));
  for (let y = 3; y <= 41; y++) b.water(riverAt(y), y, 3, 1, true, true);
  b.water(52, 27, 7, 2, false, true);
  b.ice(50, 8, 10, 2);
  b.area('Meltwater river', [[53, 14, 6, 10]], { read: 'Black water runs fast under a roof of ice, so cold it smokes. It pours over the lip of the crevasse in a roar of spray.', gm: 'Deep and fast: DC 15 Athletics to swim across, or be swept 30 ft toward the crevasse. Two safe crossings: the ice shelf (north) and the shallow ford (south, DC 10).', label: [55, 18] });
  b.area('Ice shelf', [[50, 7, 10, 4]], { gm: 'A frozen lip across the river. It holds, mostly: DC 12 Dexterity save if more than two cross at once.', label: [54, 8] });
  b.tunnel([[47, 30], [53, 28]], 2, { mat: 'ice', seed: 2034 });
  b.tunnel([[44, 6], [52, 8], [60, 14]], 2, { seed: 2035 });
  b.tunnel([[58, 27], [61, 26]], 2, { seed: 2036 });
  b.tunnel([[62, 43], [63, 30]], 3, { seed: 2037 });
  b.cave("Skethra's den", 66, 22, 10, 9, { seed: 2008, mat: 'ice', read: 'A cavern of blue ice as big as a cathedral. Mammoth bones lie in heaps. On a shelf of ice high on the wall lies a white dragon, long as a ship, with eyes like frozen lamps, and she is smiling.', gm: 'Skethra the Pale Hunger and her three young. She is vain, hungry and a little lonely. She will talk before she fights: she loves praise, and she hates Vask, who "gives orders like a giant and pays like a dwarf". For the right price (her hoard left alone, and a promise she may keep the glacier) she tells the truth about the prince. If she fights, she uses the high shelf and the crevasse wind; below half hit points she flees up the chimney.' });
  b.props_('bone-heap', [[60, 18], [72, 26], [63, 28]]).props_('giant-ribcage', [[69, 17]]).props_('ice-block', [[58, 22], [73, 22]]).prop('crystal-spire', 66, 15).prop('skull-bleached', 70, 29).props_('stalactites-tall', [[62, 16], [72, 22]]);
  b.light(66, 20, 20, 30, '#9fd8ff');
  b.encounter('Skethra, the Pale Hunger', [57, 14, 18, 16], [['adultWhiteDragon', 1], ['youngWhiteDragon', 3], ['iceMephit', 2]], 'high');
  b.tunnel([[73, 7], [73, 12], [68, 16]], 1, { mat: 'ice', seed: 2038 });
  b.door(73, 9, 'n', 'secret');
  b.cave("Skethra's hoard", 73, 4, 5, 3, { seed: 2009, mat: 'ice', read: 'Coins frozen into the floor like pebbles in a stream. Crowns, swords, a whole carriage of white wood. And on top, carefully folded, a letter.', gm: 'Behind a secret door of ice in the den (DC 18 Perception; Skethra watches it). The letter is Vask\'s (handout), the proof the giant queen needs.' });
  b.props_('dragon-hoard', [[73, 4]]).prop('coins-large', 70, 4).prop('chest-open', 74, 5).prop('magic-sword', 72, 6).prop('crown-cushion', 75, 3);
  b.light(73, 4, 10, 15, '#bfe8ff');
  return b.build();
}

// ---------- Part 3: Rimehold, the frost giants' hall ----------
function rimehold() {
  const b = new MapBuilder('adv-frostfang-hall', 'Rimehold, hall of the frost giants', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });

  // the approach
  b.cave("The Giants' Stair", 40, 74, 15, 4, { seed: 3001, mat: 'ice', read: 'Steps cut for feet four times the size of yours climb the last ridge. At the top, a hall of black stone and blue ice sits on the peak like a crown, and from its chimneys rises not smoke but snow.', gm: 'The heroes arrive here, by the chimney from the glacier. Huskarls on the gate see anyone on the stair in daylight. The mammoth ramp to the west is a second way in, through the byre.' });
  b.floor(38, 67, 4, 4, 'ice');
  b.props_('stairs-up', [[39, 70], [40, 70]]).props_('snowdrift', [[30, 75], [50, 73]]).props_('boulder-large', [[27, 73], [48, 77]]).prop('statue-tall-knight', 35, 71).prop('statue-tall-knight', 45, 71);
  b.start(39, 74, 3, 3);
  b.note(40, 77, 'From part 2: the Wind chimney comes out here.');
  b.tunnel([[27, 74], [14, 70], [6, 62], [6, 58]], 2, { mat: 'ice', seed: 3003 });
  b.area('Mammoth ramp', [[5, 60, 10, 12]], { gm: 'A churned trail of dung and ice where the herd goes out to graze. Unguarded, but it leads straight into the byre.', label: [9, 66] });
  b.props_('snowdrift', [[9, 66], [17, 71]]).prop('tree-fir-snow', 12, 68);

  // gatehouse and courtyard
  for (let x = 38; x < 42; x++) b.door(x, 67, 'n', 'closed', 'door-double');
  b.room('Gate of Tusks', 33, 60, 14, 7, { mat: 'stone-cobble', read: 'The gate is two mammoth tusks, each as long as a tower, crossed over doors of black oak. Four giants could walk through it side by side.', gm: 'Two huskarls, their worgs and a pair of polar bears keep the gate. They let no small folk in. If Prince Hallvar or Grunna is with the heroes, they kneel instead.' });
  b.props_('giant-ribcage', [[34, 61], [45, 61]]).props_('brazier-pedestal', [[35, 65], [44, 65]]).prop('weapon-barrel', 36, 62).prop('rug-pelt', 42, 63);
  b.light(35, 65, 15, 20).light(44, 65, 15, 20);
  b.encounter('Gate of Tusks', [33, 60, 14, 7], [['frostGiant', 2], ['worg', 4], ['polarBear', 2]], 'low');
  b.floor(38, 59, 4, 1, 'stone-cobble');
  for (let x = 38; x < 42; x++) b.door(x, 59, 'n', 'closed', 'door-double');
  b.room('Snow court', 12, 44, 56, 15, { mat: 'ice', read: 'An open court big enough to hold a town. Statues of giant kings, each fifty feet tall, stand around it with their faces turned up to a sky that never stops snowing.', gm: 'If the heroes come with proof and the prince, this is where the giants gather to hear them: run it as a great parley. Otherwise huskarls cross it often (one patrol of two giants every 10 minutes).' });
  b.rock(12, 44, 2, 1).rock(12, 45, 1, 1).rock(66, 44, 2, 1).rock(67, 45, 1, 1).rock(12, 58, 2, 1).rock(12, 57, 1, 1).rock(66, 58, 2, 1).rock(67, 57, 1, 1);
  b.rubble(18, 48, 7, 3).rubble(52, 53, 9, 3).rubble(28, 56, 6, 2);
  b.water(45, 47, 3, 2, true);
  b.props_('statue-tall-knight', [[14, 46], [14, 56], [65, 46], [65, 56]]).props_('statue-tall-robed', [[30, 45], [50, 45]]).prop('fountain-grand', 40, 51).props_('snowdrift', [[20, 50], [58, 53], [26, 57]]).props_('banner-pole', [[24, 47], [56, 47]]).prop('cart', 54, 56).props_('ice-block', [[19, 54], [61, 49]]).prop('giant-ribcage', 33, 55);
  b.light(40, 51, 10, 20, '#bfe8ff');

  // west: the byre, the forge and the barrow
  b.room('Mammoth byre', 2, 26, 9, 33, { mat: 'dirt', read: 'A long, steaming barn where the giants\' war-mammoths stand in stalls. It is the warmest place on the mountain, and the smelliest.', gm: 'Three mammoths and their herder, the giant Old Bergtha, who loves them more than her queen. Telling her the dragon has her stolen herd (or that the heroes freed it) wins her: she lets them through and spreads the word.' });
  b.props_('hay-bale', [[3, 28], [9, 33], [3, 40], [9, 47], [3, 54]]).props_('water-trough', [[6, 30], [6, 44]]).prop('haystack', 8, 56).prop('stool', 4, 36).prop('tool-wall', 9, 38);
  b.encounter('Mammoth byre', [2, 26, 9, 33], [['mammoth', 3], ['frostGiant', 1]], 'low');
  b.floor(11, 52, 1, 3, 'dirt');
  for (const y of [52, 53, 54]) b.door(11, y, 'w', 'closed', 'door-double');
  b.room('Forge of Rime', 13, 24, 10, 18, { mat: 'dungeon-slab', read: 'A forge that burns blue and cold. Giant smiths hammer ice into blades on anvils of black iron, and the blades ring like bells.', gm: 'The smiths are old and do not fight unless the hall is attacked. A rime blade from here is a +1 greatsword that deals an extra 1d6 cold damage (a giant gift, if the heroes are friends).' });
  b.floor(11, 34, 2, 2, 'dungeon-slab').door(11, 34, 'w').door(11, 35, 'w');
  b.floor(17, 42, 2, 2, 'dungeon-slab').door(17, 42, 'n').door(18, 42, 'n');
  b.props_('forge', [[15, 26], [20, 26]]).props_('anvil', [[16, 30], [20, 32]]).prop('weapon-rack', 14, 38).prop('ice-block', 21, 37).prop('grindstone', 18, 35).prop('ore-pile', 14, 33);
  b.light(15, 26, 15, 20, '#7fb8ff').light(20, 26, 15, 20, '#7fb8ff');
  b.tunnel([[6, 25], [7, 19]], 2, { seed: 3004 });
  b.cave('Barrow of the Rime-Kings', 7, 13, 5, 7, { seed: 3002, read: 'Dead giant kings sit on stone chairs along the walls, frozen, with their crowns still on. Their breath hangs in the air as if they were alive. Some of them are.', gm: 'Four of the old kings\' huskarls, buried sitting up with their axes on their knees, still guard the barrow as barrow huskarls. They obey a true heir: Prince Hallvar can send them to sleep with a word. Behind the last king, a secret door opens on the Kings\' Road, an old passage to the Heart of Winter (DC 18 Perception).' });
  b.props_('throne', [[4, 10], [10, 10], [4, 16], [10, 16]]).props_('skeleton-seated', [[5, 13], [9, 13]]).prop('crown-cushion', 7, 8).props_('candle-stand-tall', [[6, 18], [8, 18]]);
  b.light(7, 13, 5, 15, '#a8c8ff');
  b.encounter('Barrow of the Rime-Kings', [2, 6, 11, 15], [['barrowHuskarl', 4]], 'low');
  b.hall(8, 9, 8, 1, 1, { mat: 'dungeon-slab' }).hall(8, 1, 58, 1, 1, { mat: 'dungeon-slab' }).hall(58, 1, 58, 5, 1, { mat: 'dungeon-slab' }).floor(58, 6, 1, 2, 'ice');
  b.door(8, 3, 'n', 'secret').door(58, 6, 'n', 'secret');
  b.area("The Kings' Road", [[9, 0, 48, 3]], { gm: 'A narrow passage cut for the old kings to walk unseen to the Heart. Giant-scale but forgotten: dust and frost. It ends at a secret door in the Heart chamber\'s north wall.', label: [30, 1] });
  b.props_('cobweb-corner', [[20, 1], [45, 1]]).prop('skeleton-lying', 33, 1);

  // the centre: great hall and throne
  b.room('Great Hall of Rimehold', 25, 22, 30, 20, { mat: 'wood-planks-dark', read: 'A feast hall so big that clouds of breath gather under its roof. Giants sit at tables made of whole ships\' keels, eating very little. The roasting pit holds one thin goat.', gm: 'The huskarls eat here: four of them, tired and hungry. They want war on Highward because they are starving. Feeding them (freed mammoths, or a promise of grain) or the prince\'s word stops the fight. Otherwise they fight in the hall, throwing benches.' });
  b.lava(38, 30, 4, 2);
  b.props_('feast-hall-table', [[30, 26], [30, 34], [46, 26], [46, 34]]).props_('bench-long', [[30, 28], [30, 36], [46, 28], [46, 36]]).prop('hearth-grand', 40, 23).prop('campfire-spit', 40, 32).props_('column-cluster', [[27, 24], [52, 24], [27, 39], [52, 39]]).props_('banner-hanging-tall', [[35, 23], [45, 23]]).prop('keg-rack', 53, 31);
  b.light(40, 23, 20, 30).light(40, 31, 10, 20);
  b.encounter('Feast of the huskarls', [25, 22, 30, 20], [['frostGiant', 4]], 'moderate');
  b.floor(23, 30, 2, 2).door(23, 30, 'w').door(23, 31, 'w');
  b.floor(37, 42, 6, 2);
  for (let x = 37; x < 43; x++) b.door(x, 42, 'n', 'closed', 'door-double');
  b.floor(28, 42, 1, 2).door(28, 42, 'n');
  b.room("Huskarls' barracks", 57, 26, 14, 16, { mat: 'wood-planks', gm: 'Giant bunks of pine and furs. Empty during the feast. A chest under the captain\'s bunk holds 600 gp in giant-sized silver rings and a horn of the hall (blowing it calls every huskarl to the court).' });
  b.props_('bed', [[59, 28], [63, 28], [67, 28], [59, 37], [63, 37]]).prop('footlocker', 67, 37).props_('spear-rack', [[69, 30], [69, 34]]).prop('rug-pelt', 63, 33).prop('stove', 58, 32);
  b.floor(55, 33, 2, 2).door(55, 33, 'w').door(55, 34, 'w');
  b.floor(62, 42, 2, 2).door(62, 42, 'n').door(63, 42, 'n');
  b.room('Throne of Winter', 26, 4, 25, 16, { mat: 'marble', read: 'At the end of a hall of ice pillars, on a throne carved from a single glacier, sits a giant queen in a mantle of white bearskins. A small grey man stands at her elbow, talking quietly. She is not listening. She is holding a broken horn.', gm: 'Queen Ysgerd and three huskarls, and a war-mammoth at the foot of the throne. The grey man is Vask: he slips away to the Heart chamber the moment trouble starts. The queen can be turned with proof: the prince himself, or Vask\'s letter (Insight DC 15 shows she half-suspects already). Without proof, she must be beaten, or she orders the heroes killed.' });
  b.ice(33, 15, 12, 3).water(37, 16, 4, 1, true);
  b.props_('column-twisted', [[29, 7], [29, 15], [47, 7], [47, 15], [35, 7], [41, 7]]).prop('throne-dais', 38, 6).props_('brazier-pedestal', [[34, 6], [43, 6]]).prop('rug-runner', 38, 13).props_('statue-tall-winged', [[27, 5], [49, 5]]);
  b.light(34, 6, 15, 20, '#7fb8ff').light(43, 6, 15, 20, '#7fb8ff');
  b.encounter("The queen's judgement", [26, 4, 25, 16], [['frostGiantQueen', 1], ['frostGiant', 3], ['mammoth', 1]], 'moderate');
  b.floor(37, 20, 6, 2);
  for (let x = 37; x < 43; x++) b.door(x, 20, 'n', 'closed', 'door-double');
  b.room("Queen's chambers", 16, 4, 8, 15, { mat: 'wood-planks', read: 'A bed the size of a barn, and beside it, a little bed carved for a giant child, kept neat. Drawings in charcoal cover the wall: a boy giant with a horn, older and older.', gm: 'The queen\'s grief, plain to see. Under her pillow: Vask\'s "proof" (the prince\'s broken horn wrapped in a bloody Highward cloak). A DC 16 Medicine or Investigation shows the blood is goat\'s, and the break in the horn was cut, not snapped.' });
  b.props_('bed-canopy', [[19, 6]]).prop('crib', 21, 12).prop('wardrobe', 17, 16).prop('hearth-rug', 20, 9).prop('chest', 22, 16).prop('candelabra', 17, 11);
  b.floor(24, 10, 2, 2, 'wood-planks').door(24, 10, 'w').door(24, 11, 'w');

  // the Skyward ledge: a third way in, round the outside of the hall
  b.tunnel([[54, 74], [64, 68], [72, 58], [73, 46]], 2, { mat: 'ice', seed: 3006 });
  b.hall(73, 46, 73, 40, 1, { mat: 'ice' }).hall(73, 40, 71, 40, 1, { mat: 'ice' }).door(70, 40, 'e', 'closed');
  b.area('Skyward ledge', [[64, 50, 10, 18]], { read: 'A shelf of ice a yard wide, with the hall\'s black wall on one side and a mile of empty air on the other. The wind wants you very badly.', gm: 'A huskarls\' path to a postern in their barracks. In the open wind: DC 13 Acrobatics each 30 ft, or slide to the edge (DC 15 Dexterity save or fall; a fall here is the end, unless someone catches you).', label: [70, 58] });
  b.props_('snowdrift', [[66, 66], [73, 44]]).prop('crumbling-ledge', 70, 61).prop('chasm-edge', 73, 48);

  // east: the Heart and Vask's tower
  b.cave('Heart of Winter', 60, 13, 7, 7, { seed: 3005, wobble: 0.06, mat: 'ice', read: 'A round chamber of ice. In the middle floats a stone the size of a cart, blue and cracked, and from the cracks pours a white wind that never stops. Around it, runes burn on the floor in a ring, and the cold here is a living thing.', gm: 'The Rime Heart. Vask\'s ritual turned it inside out: it pours winter instead of drinking it. Kharzul the ice devil stands invisible in the ring as its keeper. Ending it: break the three binding runes (each DC 20 Arcana as an action, or 30 damage to a rune, AC 17) and then sing the Thaw Song to the Heart (the queen, the prince, or a hero with the song and a DC 20 Performance). Smashing the Heart (AC 15, 200 hp) ends the winter too, but the peak melts and Rimehold dies with it.' });
  b.props_('crystal-spire', [[60, 13]]).prop('summoning-circle', 60, 15).props_('rune-stone', [[56, 10], [64, 10], [60, 18]]).props_('ice-block', [[57, 8], [63, 17]]).prop('stalactites-tall', 57, 17);
  b.light(60, 13, 25, 30, '#7fb8ff');
  b.encounter('The Rime Heart', [54, 6, 13, 15], [['archmage', 1], ['iceDevil', 1], ['iceMephit', 4]], 'high');
  b.floor(51, 12, 5, 2, 'ice').door(51, 12, 'w', 'closed', 'door-double').door(51, 13, 'w', 'closed', 'door-double');
  b.room("Vask's study", 69, 3, 9, 6, { mat: 'wood-planks', read: 'A room built for a man, inside a hall built for giants: a little desk, a little bed, a little stove, all very neat. A mirror on the wall shows the Heart chamber instead of you.', gm: 'Vask\'s rooms. The desk holds the devil\'s contract (handout). The mirror is a scrying window on the Heart. A secret door (DC 17 Perception) opens straight into the Heart chamber.' });
  b.props_('writing-desk', [[71, 4]]).prop('bed', 76, 4).prop('stove', 76, 7).prop('magic-mirror', 70, 7).prop('bookshelf', 73, 7);
  b.hall(68, 7, 63, 10, 1, { mat: 'ice' }).door(69, 7, 'w', 'secret');
  b.floor(73, 9, 1, 1, 'wood-planks').door(73, 9, 'n');
  b.room("Vask's library", 69, 10, 9, 5, { mat: 'wood-planks', gm: 'Books on cold, binding and the old pacts of giants. Two of Vask\'s apprentices (mages) study here, and a shield guardian he brought up the mountain in pieces keeps them. The apprentices are frightened of him; a DC 16 Persuasion makes them run.' });
  b.props_('bookshelf-tall', [[70, 11], [76, 11]]).prop('table-reading', 73, 12).prop('scroll-rack', 70, 13).prop('globe-stand', 76, 13);
  b.floor(73, 15, 1, 1, 'wood-planks').door(73, 15, 'n');
  b.room('Summoning room', 69, 16, 9, 7, { mat: 'dungeon-slab', read: 'A circle of silver set in the floor, scratched and re-scratched. The air smells of frost and struck matches.', gm: 'Where Vask first called Kharzul. The circle can call him back here: an arcane caster who studies the contract (DC 18 Arcana) can banish the devil by burning the contract in this circle. That ends the devil\'s part of the climax.' });
  b.props_('summoning-circle', [[73, 19]]).props_('candle-ring', [[71, 17], [76, 21]]).prop('alchemy-table', 70, 21).prop('potion-shelf', 76, 17);
  b.light(73, 19, 5, 10, '#a8c8ff');
  b.encounter("Vask's apprentices", [69, 10, 9, 13], [['mage', 2], ['shieldGuardian', 1]], 'low');
  b.hall(73, 23, 73, 25, 1, { mat: 'wood-planks' }).hall(73, 25, 69, 25, 1, { mat: 'wood-planks' });
  b.door(73, 23, 'n');
  return b.build();
}

export const FROSTFANG_PASS: Adventure = {
  id: 'frostfang-pass',
  title: 'Frostfang Pass',
  tagline: 'An endless winter, a starving town and the frost giants who blame it for their dead prince.',
  levels: '11-13',
  sessions: '4-6 sessions',
  players: '3-5 players',
  tags: ['mini-campaign', 'winter', 'giants', 'dragon', 'diplomacy'],
  pitch:
    'Frostfang Pass is the only road between the kingdoms of Aldermark and Corrandy. Every spring for three hundred years, the snow on it has melted. This year it did not. It is midsummer now, and Highward, the walled town in the pass, is buried, starving and under siege: every third night, frost giants come down from the peak and take whatever grain they can find. The last caravan that can still get through is yours.',
  secret:
    'High on the peak, in the hall of Rimehold, the frost giants keep the Rime Heart, a stone that holds the mountain\'s winter. By the old Thaw Pact, their queen sings it every spring and it drinks the cold in, so the pass opens. This year the pact was to be renewed by Prince Hallvar, the queen\'s only son. He never arrived. Ondrel Vask, a court mage exiled from Aldermark for bargaining with devils, ambushed him on the glacier and sealed him alive in a pillar of ice. Then Vask brought the grieving queen a broken horn and a bloody Highward cloak, and became her trusted adviser. With the ice devil Kharzul, he has turned the Heart inside out: it now pours winter out. He paid the white dragon Skethra to guard the prince and let her steal the giants\' mammoths, so the hungry giants raid the town and nobody talks. Why now: at midwinter night, ten days away, the cracked Heart breaks, and the cold becomes forever. Every soul that freezes in it belongs to Kharzul, and Vask is promised the throne of the white land, and revenge on the kingdom that threw him out.',
  hooks: [
    'Commander Isolde Brask of Fort Fang offers 5,000 gp (all the silver the fort has) to whoever stops the raids, and anything else they want if they end the winter.',
    'The crowns of both kingdoms have sent word: their grain, armies and trade all go through the pass. Whoever opens it will be honoured on both sides of the mountain.',
    'Mother Aud of the Chapel of the Low Sun sends a letter south: "The pact is broken and no one up here remembers how to mend it. Send someone who can climb."',
  ],
  tips: [
    'This is a story about a misunderstanding a villain made on purpose. Every fight with the giants can become a talk, and every talk makes the end easier. Reward the players for asking "why?"',
    'Run part 1 as a siege over a day and a night: the town by day (clues, food, Grunna in the stockade), then the raid at night. The feint at the North Gate comes first; the real attack crosses the frozen tarn.',
    'Keep a count of allies: soldiers rallied, Grunna freed, the hunters\' truce, the mammoths freed, the prince saved, the letter found. Each one turns a fight in part 3 into a talk.',
    'Skethra is a great talker. Let her bargain, boast and lie. She will sell Vask out for her hoard, and flee rather than die.',
    'The winter is cruel: without warm gear or magic, travel outside means DC 10 Constitution saves each hour or a level of exhaustion. Potions of resistance (cold) from Fort Fang help.',
    'Level up between parts: 12 for the glacier, 13 for Rimehold.',
  ],
  npcs: [
    {
      id: 'pf_ffbrask', name: 'Isolde Brask', title: 'commander of Fort Fang', kind: 'npc', art: 'guard-captain', monsterId: 'veteran', shared: true,
      wants: 'To get her soldiers and her town through the winter alive.', knows: 'The raid pattern (every third night), the secret sally port, and that half her garrison would desert if they could.',
      voice: 'Short, hoarse orders; laughs once, unexpectedly, at the worst moments.', appearance: 'A broad, grey-haired woman in a dented breastplate over three cloaks, missing two fingers on her left hand to frostbite.',
      gmNotes: 'Uses the veteran stat block. If the heroes rally the fort, she leads 20 soldiers on the raid night and holds the North Gate herself.',
    },
    {
      id: 'pf_ffaud', name: 'Mother Aud', title: 'priest of the Chapel of the Low Sun', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'Food for her orphans and the pact mended.', knows: 'The Thaw Pact, the human verse of the Thaw Song, and that a giant prince was due this year to renew the pact.',
      voice: 'Cheerful, practical, hums hymns while she ladles soup.', appearance: 'A tiny old woman with a ladle in one hand and a holy symbol of the sun in the other, wrapped in a quilt like a cloak.',
      gmNotes: 'Her holy water stills the drowned muster. She will teach a hero the Thaw Song (advantage on the Performance check at the Heart).',
    },
    {
      id: 'pf_ffgrue', name: 'Selwyn Grue', title: 'quartermaster of Highward', kind: 'npc', art: 'merchant', monsterId: 'noble',
      wants: 'To be rich when spring comes, if it comes.', knows: 'Where the grain is (his warehouse), that the giants raid for grain, and that a grey stranger bought thirty sacks from him in autumn and paid in silver that never warms.',
      voice: 'Soft, reasonable and sorry; he always has a good reason.', appearance: 'A plump, pink man in a fur coat far too good for Highward, with rings on his gloves.',
      gmNotes: 'A coward. Caught, he gives up the grain and the hidden stash to save his skin. The town wants him hanged; Brask wants him to work the bread line forever.',
    },
    {
      id: 'pf_ffgrunna', name: 'Grunna Two-Spears', title: 'frost giant scout, a prisoner', kind: 'npc', art: 'frostGiant', monsterId: 'frostGiant', shared: true,
      wants: 'To go home, and to find out what really happened to her prince.', knows: 'That Prince Hallvar left for Highward in autumn and never came back, that a dragon steals the herds, and that the queen listens only to "the little grey one".',
      voice: 'Slow, booming, with long thinking pauses. Calls the heroes "small ones", kindly.', appearance: 'A frost giant woman twenty feet tall, blue-skinned, with a braided white beard and two spear scars across her face.',
      gmNotes: 'Freed and fed, she is the heroes\' first giant friend: she can take them to the hunters\' camp in part 2 and vouch for them at the Gate of Tusks.',
    },
    {
      id: 'pf_ffhallvar', name: 'Prince Hallvar', title: 'heir of Rimehold', kind: 'npc', art: 'frostGiant', monsterId: 'frostGiant', shared: true,
      wants: 'To keep his mother\'s promise: the pact renewed, the pass open.', knows: 'That Vask froze him on the glacier, and that the grey man spoke of "my partner below" who would "have every frozen soul".',
      voice: 'Young, eager and too loud; embarrassed by his own size around small folk.', appearance: 'A young frost giant with a short golden-white beard, a fine white cloak and an empty horn-strap across his chest.',
      backstory: 'He was walking down to Highward with the pact-horn to renew the Thaw Pact when Vask met him on the ice, smiling, with an offer of help.',
      gmNotes: 'Frozen alive in part 2. Freed, he is the key to peace: the huskarls, the barrow huskarls and his mother all yield to him.',
    },
    {
      id: 'pf_ffysgerd', name: 'Queen Ysgerd', title: 'queen of Rimehold', kind: 'npc', art: 'frostGiant', monsterId: 'frostGiantQueen',
      wants: 'Her son back; failing that, blood-price.', knows: 'The Thaw Song, the Heart, and only what Vask has told her about her son.',
      voice: 'Very quiet for a giant, which makes everyone lean in. Stops mid-sentence when she thinks of Hallvar.', appearance: 'A tall, old frost giant in white bearskins, with a crown of icicles and a broken horn always in her hand.',
      gmNotes: 'Uses the Frost Giant Queen stat block: her grief turns to fury whenever one of her giants falls. She is not evil, only grieving and lied to. Shown the truth, she turns on Vask with terrible fury and sings the Thaw Song herself.',
    },
    {
      id: 'pf_ffvask', name: 'Ondrel Vask', title: 'exiled court mage, the queen\'s adviser', kind: 'npc', art: 'frost-mage', monsterId: 'archmage',
      wants: 'Revenge on Aldermark, and a crown of his own over the white land.', knows: 'Everything: the prince\'s prison, the devil\'s bargain, the ritual, and how to make each side hate the other.',
      voice: 'Gentle, reasonable, always the calmest person in the room; never raises his voice, even when casting.', appearance: 'A thin grey man in a grey cloak, with frost in his beard that never melts and very clean hands.',
      backstory: 'Court mage of Aldermark until he was caught bargaining with things below, and exiled up the pass with nothing. Kharzul found him on the way.',
      gmNotes: 'Archmage stat block. He fights from behind the devil and uses cone of cold, wall of force to split the heroes, and teleport to escape if Kharzul falls. Captured, he begs, bargains and lies.',
    },
    {
      id: 'pf_ffkharzul', name: 'Kharzul', title: 'the patient cold, an ice devil', kind: 'monster', art: 'iceDevil', monsterId: 'iceDevil',
      wants: 'A land of frozen souls, all pledged to him by contract.', knows: 'The exact terms of every bargain, and that Vask\'s contract has a clause Vask never read.',
      voice: 'Clicks and hisses like ice cracking, and speaks very politely, like a clerk reading a will.', appearance: 'A towering insect-like devil of blue-white chitin, with a spear of ice and a tail like a frozen whip.',
      gmNotes: 'Ice devil stat block. Bound to the Heart; he cannot leave the chamber while the runes stand. If the contract is burned in the summoning room, he is banished.',
    },
    {
      id: 'pf_ffskethra', name: 'Skethra the Pale Hunger', title: 'adult white dragon', kind: 'monster', art: 'dragon-white-adult', monsterId: 'adultWhiteDragon',
      wants: 'Endless winter, a full belly and a hoard nobody touches.', knows: 'Where the prince is frozen, who froze him, and that Vask "talks to someone under the floor of the Heart".',
      voice: 'Purrs and drawls, savours every word; loves to be called beautiful and hates to be called a lizard.', appearance: 'A white dragon sixty feet long, scales like old snow, with a frill of icicles and one milky eye.',
      gmNotes: 'Adult white dragon stat block. Bargain: she trades the truth (and the letter) for her life and her hoard. She flees up the chimney below half hit points and may return for revenge.',
    },
  ],
  handouts: [
    { id: 'vask-writ', title: 'A writ of exile on the notice board', text: 'By the Crown of Aldermark. ONDREL VASK, late Court Magister, is stripped of rank, name and lands, and cast out of the realm, for bargaining with things below. Let no town shelter him. Let no hand warm him. If seen, send word south.' },
    { id: 'thaw-song', title: 'The Thaw Song (Mother Aud\'s copy)', text: 'Sing it, queen of the high hall,\nSing the winter home:\nCold to the stone, stone to the peak,\nAnd the low road free for the summer folk.\nWe bring the grain, you bring the spring;\nOne song, two peoples, one road.' },
    { id: 'grue-ledger', title: "From Grue's ledger", text: 'Held back: 212 sacks.\nPrice at midwinter, est.: 40 silver the cup.\nSold 30 sacks to the grey stranger (Autumn). Paid in silver, very cold. Asked about the giants\' road and when the prince comes down. Odd fellow. Good customer.' },
    { id: 'vask-letter', title: "A letter in Skethra's hoard", text: 'Most beautiful Skethra. Keep the princeling cold and the cave quiet, and the herds are yours, as agreed. When the Heart breaks at midwinter the whole range will be winter forever, as you like it. Until then, let the giants starve and blame the little folk. My partner below sends his regards. V.' },
    { id: 'devil-contract', title: "The contract in Vask's desk", text: 'Between KHARZUL of the Patient Cold and ONDREL VASK, mortal. Vask shall turn the Heart. Kharzul shall keep it turned. At its breaking, all souls who perish of its cold are Kharzul\'s, and Vask shall be crowned over the white land, "to rule all that lives within it." (In a small hand at the bottom, very neat: Nothing will live within it.)' },
  ],
  chapters: [
    {
      id: 'highward', title: 'Part 1: Highward under siege', level: 11,
      summary: 'A starving pass-town and its fort, stuck between two kingdoms: a hoarding quartermaster, a captive giant, the drowned dead under the tarn, and a night raid by frost giants.',
      goal: 'Survive the raid night, find out why the giants raid, and learn where the winter comes from.',
      map: highward,
      npcs: [
        { npc: 'pf_ffbrask', x: 57, y: 22 },
        { npc: 'pf_ffaud', x: 12, y: 52 },
        { npc: 'pf_ffgrue', x: 50, y: 61 },
        { npc: 'pf_ffgrunna', x: 67, y: 31 },
      ],
      scenes: [
        { room: 'South road', title: 'The last caravan in', read: 'The wind drops as you climb, and the silence is worse. A grey wall blocks the pass ahead, and the faces on top of it look down at your wagons and do the sums: how many mouths, how many days.', gm: 'Open here. The guards argue about opening the gate. Let the heroes talk or show what they are. Inside, Brask sends for them at once.' },
        { room: 'The Keep of Fort Fang', title: 'Commander Brask', read: 'The commander does not get up. She pushes a wooden giant across the map with one finger and says, "Tonight. Every third night. Can you fight?"', gm: 'The hook and the situation. Brask gives the raid pattern, lends potions of resistance (cold), and mentions the giant in the stockade "who won\'t talk".', treasure: '4 potions of resistance (cold), lent for the raid.' },
        { room: 'Fort yard', title: 'Two flags, one fort', optional: true, gm: 'Aldermark and Corrandy soldiers on the edge of a brawl. A DC 17 Persuasion (or a shared meal) makes them one company, and Brask can field 20 veterans on raid night: they hold the North Gate so the heroes can go to the tarn.' },
        { room: 'Chapel of the Low Sun', title: 'Mother Aud and the old pact', read: 'The smell of soup, and a dozen children asleep in a pew. A tiny old woman hands you a bowl before you can say a word.', gm: 'The Thaw Pact, and the prince who never came. Aud gives holy water for the tarn and a copy of the song.', handout: 'thaw-song' },
        { room: "Reeve's hall", title: 'A face on the notice board', gm: 'The exile writ. With the Last Hearth\'s innkeeper, it shows Vask came this way in autumn and went up the Giants\' Road.', handout: 'vask-writ' },
        { room: 'Giant stockade', title: 'Grunna Two-Spears', read: 'The giant watches you over her bowl. When she finally speaks, her voice shakes the bars: "Small ones. Why did you kill our prince?"', gm: 'The giants\' side of the story. Freeing her quietly (the key is in Brask\'s keep, or DC 20 Thieves\' Tools) makes her an ally for the rest of the adventure; letting her go openly needs Brask\'s word.' },
        { room: 'Grain warehouse', title: "Grue's hoard", encounter: "Grue's hired swords", gm: 'The grain the town is starving for. Grue\'s men surrender at half strength. The ledger points to the grey stranger.', handout: 'grue-ledger', treasure: "Grue's strongbox: 900 gp and 300 sp of frost-rimed silver that never warms (Vask's coin), 2 potions of greater healing. The grain feeds Highward for two months." },
        { room: 'Snowbound graveyard', title: 'The grave with no body', optional: true, gm: 'Grue\'s second stash under a false grave.', treasure: '400 gp, 20 more sacks of grain, and Boots of the Winterlands Grue took as payment from a desperate trader.' },
        { room: "Soldiers' Hole", title: 'The drowned muster', optional: true, encounter: 'The drowned muster', gm: 'Old dead soldiers rise for "deserters". Holy water in the hole sends them back. Hint: these soldiers marched over the glacier, and more of them are up there.', treasure: 'An officer\'s silver gorget (250 gp) and a +1 longsword in old style.' },
        { room: 'Watch cairn', title: 'Giant scouts', optional: true, encounter: 'Giant scouts at the cairn', gm: 'Before the raid, the heroes can strike the scouts or talk with them. Talking gives the blood-price demand and the queen\'s grief; it also means one fewer giant in the raid.' },
        { room: 'North Gate', title: 'The raid: horns in the dark', read: 'Horns, deep as thunder, from the mountain. Then the gate shakes. Torches on the wall show white bears and wolves throwing themselves at the iron, and behind them, two giants with a log for a ram.', gm: 'The feint. Run it fast. A DC 15 Insight or Perception during the fight hears ice cracking far off to the west: the real attack is at the tarn.', encounter: 'The feint at the North Gate' },
        { room: 'Water-gate', title: 'The raid: over the frozen tarn', read: 'The frozen grille bursts in a shower of ice. A mammoth shoulders through the gap with a giant on its back, and more giants follow it out onto the tarn, heading straight for the warehouses.', gm: 'The real raid and the climax. The giants want grain, not murder: a hero who offers grain (or shows Grunna, free) can stop the fight. Giants at half strength take what they can and retreat. A captured or spared giant confirms the queen\'s grief and the "little grey one".', encounter: 'Over the frozen tarn' },
      ],
      wrapUp: 'The raid is beaten or turned. The heroes know the giants are starving, their prince is missing, a grey mage was here, and the winter comes from the peak. The Giants\' Road leads up to the glacier, where the giants say a dragon takes their herds. The heroes reach level 12.',
    },
    {
      id: 'glacier', title: 'Part 2: The glacier of the Pale Hunger', level: 12,
      summary: 'Ice caves above the town: an army frozen in the ice, a great crevasse, a giant hunting party, the stolen mammoth herd, a prince sealed alive, and the white dragon who guards it all.',
      goal: 'Find what the giants lost, find proof of who froze the winter, and get past the dragon to the chimney that climbs to the peak.',
      map: glacierCaves,
      npcs: [
        { npc: 'pf_ffskethra', x: 66, y: 22 },
        { npc: 'pf_ffhallvar', x: 31, y: 12 },
        { npc: 'pf_ffgrunna', x: 14, y: 34, hidden: true },
      ],
      scenes: [
        { room: 'Glacier mouth', title: 'Into the blue', read: 'The light turns green, then blue. The ice under your feet moans, and the walls are full of things the glacier has swallowed: a cart, a tree, a hand.', gm: 'Three ways on. Read the tracks: giants west, steam east, dragon everywhere.' },
        { room: 'Field of the frozen dead', title: 'The army in the ice', encounter: 'The frozen dead', gm: 'Cold dead soldiers who still keep the line. A banner or the right words lets the heroes pass.', treasure: 'An old pay chest frozen in the ice: 1,200 gp in ancient coin.' },
        { room: 'Bear den', title: 'Do not wake the bears', optional: true, encounter: 'Bears in the long sleep', gm: 'A stealth challenge. Waking them is a fight that ends when fire comes out.' },
        { room: 'Steam grotto', title: 'The gossiping mephits', optional: true, encounter: 'Mephits of the steam grotto', gm: 'Bargain with mephits for the dragon\'s habits and the secret way behind the waterfall.' },
        { room: 'The Crevasse', title: 'Crossing the crevasse', read: 'The wind comes up out of the crack with a voice, and it nearly takes your feet. Three bridges, and none of them look safe.', gm: 'Pick a crossing. The rope bridge was sabotaged (by Vask, so giants who use it fall).' },
        { room: "Giant hunters' camp", title: 'The hunters', encounter: 'Giant hunters', gm: 'A truce here (with Grunna, or by offering help against the dragon) gives the heroes giant allies for the den.' },
        { room: 'Mammoth pen', title: 'The stolen herd', gm: 'Free the mammoths. News of it reaches Rimehold before the heroes do, and the byre herder will remember.' },
        { room: 'Hall of the blue coffin', title: 'The prince in the ice', read: 'His eyes move. Very slowly, inside the ice, the giant\'s eyes move to look at you.', encounter: 'Wardens of the blue coffin', gm: 'Free Prince Hallvar: dispel magic (DC 19) or 100 fire damage. He tells the truth about Vask and the "partner below".', treasure: 'Hallvar\'s pact-horn lies at his feet: the true horn, unbroken. The queen holds a fake.' },
        { room: 'The frozen waterfall', title: 'Behind the falls', optional: true, gm: 'A climb, or the secret passage to the chimney that skips the den.' },
        { room: "Skethra's den", title: 'The Pale Hunger', read: 'Something laughs above you, a long, cold, pleased sound. "Little hot things," says the dragon. "Come closer. Tell me why I should not eat you."', encounter: 'Skethra, the Pale Hunger', gm: 'Talk or fight. She sells out Vask for her hoard; she fights from the high shelf and flees when badly hurt.' },
        { room: "Skethra's hoard", title: 'The hoard and the letter', gm: 'The proof: Vask\'s letter to the dragon.', handout: 'vask-letter', treasure: '2,800 gp, 9,000 sp, five blue sapphires (1,000 gp each), a crown of white gold (2,500 gp), a Flame Tongue longsword and a ring of resistance (cold). If the heroes bargained for the letter only, Skethra keeps the rest.' },
        { room: 'Wind chimney', title: 'The climb', gm: 'End of part 2. The heroes reach level 13. If the prince is free, he carries the smallest hero up the chimney on his shoulder.' },
      ],
      wrapUp: 'With the prince (or proof of what happened to him) and the dragon dealt with, the heroes climb the chimney to Rimehold, where the Heart pours out the winter and midwinter is only days away. The heroes reach level 13.',
    },
    {
      id: 'rimehold', title: 'Part 3: Rimehold', level: 13,
      summary: 'The frost giants\' hall on the peak, built at giant scale: a gate of tusks, a snow court of stone kings, a feast hall of hungry huskarls, a grieving queen, a mage\'s little tower and the Heart of Winter.',
      goal: 'Stop Vask\'s ritual and turn the Rime Heart back, by alliance with the giants or by fighting through them.',
      map: rimehold,
      npcs: [
        { npc: 'pf_ffysgerd', x: 38, y: 9 },
        { npc: 'pf_ffvask', x: 60, y: 12 },
        { npc: 'pf_ffkharzul', x: 63, y: 10, hidden: true },
        { npc: 'pf_ffhallvar', x: 41, y: 74, hidden: true },
      ],
      scenes: [
        { room: "The Giants' Stair", title: 'The hall on the peak', read: 'Up here the sky is close and black and full of stars, even at noon. Snow rises from Rimehold\'s chimneys instead of smoke, and from somewhere inside comes a sound like a whole mountain breathing out.', gm: 'Choose the way in: the Gate of Tusks, or the mammoth ramp to the byre. If the prince is with the heroes, they can walk in the front door.' },
        { room: 'Gate of Tusks', title: 'The huskarls\' gate', encounter: 'Gate of Tusks', gm: 'Kneeling for the prince or Grunna, fighting for strangers.' },
        { room: 'Mammoth byre', title: 'Old Bergtha', optional: true, encounter: 'Mammoth byre', gm: 'A herder who will help anyone who saved her herd.' },
        { room: 'Barrow of the Rime-Kings', title: 'The dead kings', optional: true, encounter: 'Barrow of the Rime-Kings', gm: 'The barrow huskarls obey the prince. The secret way behind the last king leads by the Kings\' Road to the Heart.', treasure: 'A dead king\'s crown (3,000 gp; the queen asks for it back, and gives a favour for it).' },
        { room: "Queen's chambers", title: 'A mother\'s room', optional: true, gm: 'The fake proof: goat\'s blood on a cut horn. Showing this to the queen breaks Vask\'s lie.' },
        { room: 'Great Hall of Rimehold', title: 'The hungry feast', encounter: 'Feast of the huskarls', gm: 'Starving huskarls. Food, the prince or a good speech (DC 18 Persuasion with the herd freed) turns the fight into a cheer.' },
        { room: 'Snow court', title: 'The great parley', optional: true, read: 'Giants pour into the court, dozens of them, and the snow falls on them all. The queen comes last, the broken horn in her hand, and the whole court goes quiet.', gm: 'If the heroes have proof, run the alliance here: the prince steps forward, or the letter is read out. The queen turns to look for Vask. He is already gone, to the Heart.' },
        { room: 'Throne of Winter', title: "The queen's judgement", encounter: "The queen's judgement", gm: 'If there was no parley, the heroes face the queen here. Proof shown mid-fight ends it at once. Vask slips away to the Heart as soon as swords come out.' },
        { room: "Vask's library", title: 'The frightened apprentices', optional: true, encounter: "Vask's apprentices", gm: 'Two mages and a shield guardian. The apprentices run if given the chance.' },
        { room: "Vask's study", title: 'The contract', gm: 'The devil\'s contract, and the secret door into the Heart chamber. Burning the contract in the summoning room banishes Kharzul.', handout: 'devil-contract', treasure: 'A staff of frost, spell scrolls of fire shield and wall of fire, and 1,200 gp in a little locked box.' },
        { room: 'Heart of Winter', title: 'The Heart of Winter', read: 'The cold hits you like a wall. In the ring of burning runes, the grey mage turns, sighs, and says, "You should have stayed in the town. It would have been quick." Behind him, the air itself stands up and grows a spear.', encounter: 'The Rime Heart', gm: 'The climax. Three things at once: hold off Vask and Kharzul, break the three runes, then sing the Thaw Song to the Heart. Giant allies (the queen, the prince, the huskarls) fight beside the heroes and take the devil\'s attention. When the song ends, the Heart drinks the winter back in, and Kharzul is pulled down with it.', treasure: 'The queen\'s gift to friends of Rimehold: a belt of frost giant strength, the right to cross the pass forever, and 2,000 gp in giant silver.' },
      ],
      wrapUp: 'The Heart drinks the winter in with a sound like a great breath. Far below, for the first time in a year, Highward hears water running. In three days the pass is open; in a week the first carts climb it from both kingdoms.',
    },
  ],
  ending:
    'Good ending: Vask is dead or in chains, Kharzul is banished, and the queen sings the Thaw Song with her son beside her. The pact is renewed with a new verse: the giants keep the spring, the town keeps the grain moving, and the heroes are named friends of Rimehold. Highward feasts for a week. War ending: if the heroes fought their way through and the queen fell, the winter still ends when the runes break and a hero sings the song, but Rimehold mourns, the pact is broken, and the pass will need guarding for a generation. Bad ending: if midwinter comes before the Heart is turned, it cracks, the pass is buried for good, and both kingdoms starve toward war. Next: Skethra, if she lived, wants her hoard back, and Kharzul\'s contract named "the white land": somewhere, another Heart may already be turning.',
};
