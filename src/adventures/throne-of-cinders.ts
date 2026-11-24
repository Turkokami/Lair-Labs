// The Throne of Cinders: a one-part finale for four heroes of level 20.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function burnedCapital() {
  const b = new MapBuilder('adv-throne-of-cinders', 'Halcyra, the Burned Capital', 80, 80, { open: true, floor: 'dirt', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  const r = rng(2020);

  // scorched ground: dark patches of burned earth all over the city
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * 76), y = Math.floor(r() * 76);
    b.paint(x, y, 2 + Math.floor(r() * 4), 1 + Math.floor(r() * 3), 'cave-floor');
  }

  // a burned house: thin walls with holes where they fell in
  const shell = (x: number, y: number, w: number, h: number, seed: number) => {
    const s = rng(seed);
    const midX = x + Math.floor(w / 2), midY = y + Math.floor(h / 2);
    for (let i = 0; i < w; i++) {
      if (x + i !== midX && s() > 0.25) b.wall(x + i, y, 'n');
      if (x + i !== midX - 1 && s() > 0.25) b.wall(x + i, y + h - 1, 's');
    }
    for (let j = 0; j < h; j++) {
      if (y + j !== midY && s() > 0.3) b.wall(x, y + j, 'w');
      if (y + j !== midY && s() > 0.3) b.wall(x + w - 1, y + j, 'e');
    }
  };

  // ======== the upper city: the palace hill is solid rock, carved into terraces ========
  b.rock(0, 0, 80, 30);

  // ======== streets of the lower city (painted before the slag river runs through) ========
  b.paint(0, 39, 80, 3, 'stone-cobble');
  b.paint(36, 42, 6, 20, 'stone-cobble');
  b.paint(26, 50, 28, 2, 'stone-cobble');
  b.paint(0, 58, 80, 2, 'stone-cobble');
  b.paint(0, 30, 80, 3, 'stone-cobble');

  // ======== the outer wall ========
  b.rock(0, 62, 80, 3);

  // ======== the siege lines (south, outside the wall) ========
  b.start(37, 74, 3, 3);
  b.mud(3, 66, 74, 1);
  b.area('Siege lines', [[2, 66, 76, 13]], {
    read: 'Ten thousand torches burn in the dark below the walls of Halcyra. Trebuchets creak, drums thunder, and ahead of you the city glows like the inside of a forge. Somewhere up on the hill, a bell starts to toll the hours until dawn.',
    gm: 'The free kingdoms\' army: about 12,000 soldiers, most of them already committed. Three ways in: the Great Breach (main assault), the Ember Gate (a siege tower is grinding toward it) and the Sappers\' tunnel (quiet, west). Flyers can go straight up the hill, but red dragons patrol the smoke (the Broken Dome fight). Start the bell clock at 8.',
    label: [20, 72],
  });
  b.props_('tent', [[6, 70], [10, 73], [14, 70], [22, 75], [56, 74], [62, 70], [70, 73]]).props_('tent-bell', [[18, 69], [66, 76]]);
  b.props_('catapult', [[26, 68], [52, 68]]).props_('ballista', [[30, 69], [47, 69]]).props_('war-banner', [[33, 67], [44, 67], [12, 67], [68, 67]]);
  b.props_('campfire', [[8, 72], [20, 73], [60, 72], [72, 70]]).props_('sandbags', [[16, 67], [28, 67], [50, 67], [60, 67]]).props_('cheval-de-frise', [[24, 67], [56, 67]]);
  b.props_('supplies', [[4, 75], [74, 77]]).props_('crate-stack', [[5, 77], [75, 75]]).prop('wagon', 12, 77).props_('horse-trough', [[64, 74]]).prop('hitching-post', 68, 75).props_('cot', [[54, 76], [57, 77]]);
  for (const [x, y] of [[8, 72], [20, 73], [60, 72], [72, 70]]) b.light(x, y, 15, 20, '#ffb35c');
  b.area('Command post', [[33, 70, 12, 8]], {
    read: 'A war-table under a torn canvas roof, pinned with knives. Old generals from six kingdoms argue around it in six accents. They stop when you walk in.',
    gm: 'Marshal Brannoc Teague gives the orders (handout) and three things to do before dawn if the heroes can: silence the choir in the cathedral, free the silver dragon, and save the Empress. He also mentions that Lord-General Roke "was a good man once". Healers here can restore the party once (as heal on each hero) before they go in.',
    label: [40, 72],
  });
  b.prop('tent-command', 40, 71).prop('war-table', 38, 73).props_('chair', [[37, 74], [42, 74]]).prop('banner-pole', 43, 70).prop('weapon-rack', 34, 72).prop('table-maps', 35, 76).light(39, 72, 10, 20, '#ffd27a');
  b.area('Field hospital', [[54, 72, 12, 7]], {
    read: 'Rows of cots in the mud. A surgeon with burned hands is singing to a soldier who will not live to dawn.',
    gm: 'Optional. A DC 15 Medicine check and an hour\'s work saves twenty soldiers: they will hold the Great Breach behind the heroes, so nothing follows them in. The surgeon has 4 potions of supreme healing to give.',
    label: [59, 75],
  });
  b.props_('cot', [[56, 73], [58, 73], [60, 73], [62, 73]]).prop('cauldron-tripod', 63, 76).prop('herbs-drying', 55, 76);
  b.props_('siege-tower', [[67, 66]]).prop('battering-ram', 71, 66);

  // ======== the breaches in the wall ========
  b.floor(33, 62, 9, 3, 'stone-cobble').rubble(33, 62, 9, 3).floor(36, 62, 3, 3, 'stone-cobble');
  b.area('The Great Breach', [[31, 57, 13, 10]], {
    read: 'The wall has fallen outward in a slope of broken stone and dead men. Over the top of it pour fire giants, laughing, swinging swords as long as boats, with black dogs that breathe flame running at their heels.',
    gm: 'The main assault. The rubble is difficult ground. The allied vanguard is losing here: if the heroes break the giants fast (under 4 rounds), the army pours in behind them and the lower city fights are easier (the market escort flees). The middle of the breach (3 squares wide) is clear stone.',
    label: [37, 63],
  });
  b.props_('rubble-pile', [[33, 61], [41, 61], [34, 64], [40, 64]]).props_('skeleton-lying', [[35, 60], [39, 59]]).prop('burning-wreckage', 32, 59).prop('column-collapsed', 42, 60).prop('war-banner', 38, 65);
  b.light(37, 61, 15, 25, '#ff8a3c');
  b.encounter('Fire giants at the breach', [31, 56, 14, 10], [['fireGiant', 3], ['hellHound', 6]], 'low');

  b.floor(7, 62, 2, 3, 'cave-floor');
  b.area("Sappers' tunnel", [[6, 61, 4, 5]], {
    read: 'A hole in the mud behind a burned wagon. The tunnel runs under the wall, propped with timbers that smoke and creak.',
    gm: 'Dug by the allied sappers last week. Quiet way in: comes up in Gallows Square. The props are burning: anyone who makes noise in here (fails a DC 15 Stealth) brings the roof down for 22 (4d10) bludgeoning, DC 18 Dexterity save for half.',
    label: [7, 63],
  });
  b.prop('mine-support', 7, 63).prop('wagon', 5, 66).prop('rope-coil', 8, 64);

  b.floor(66, 62, 4, 3, 'stone-cobble');
  for (let x = 66; x < 70; x++) b.door(x, 62, 'n', 'closed', 'door-iron');
  b.area('Ember Gate', [[63, 57, 10, 10]], {
    read: 'Iron gates, glowing dull red, set in a gatehouse shaped like a dragon\'s open jaws. Knights in scale-patterned armour hold the arch, and a pair of robed mages are pouring fire down onto the siege tower.',
    gm: 'Optional. If the heroes help the siege tower, the gate falls in 2 rounds and a company of allied knights joins them (they take the Ember Gate holdouts off their hands). The holdouts are dragon-sworn but scared: a show of power (DC 20 Intimidation) makes half of them throw down their swords.',
    label: [67, 61],
  });
  b.props_('portcullis', [[67, 64]]).prop('statue-dragon', 64, 59).prop('statue-dragon', 71, 59).props_('brazier', [[65, 61], [70, 61]]).prop('barricade-wood', 68, 58);
  b.light(65, 61, 10, 15).light(70, 61, 10, 15);
  b.encounter('Ember Gate holdouts', [62, 56, 12, 9], [['knight', 6], ['veteran', 6], ['mage', 2], ['cultFanatic', 4]], 'low');

  // ======== the lower city ========
  b.area('Gallows Square', [[2, 56, 14, 6]], {
    read: 'A square of black cobbles under a row of gallows. The people hanging there are wearing the dragon\'s colours: her own soldiers, punished for doubt.',
    gm: 'Where the sappers\' tunnel comes up. A sign on the gallows says "THEY KNELT, BUT NOT LOW ENOUGH." A DC 16 Investigation finds a dead knight\'s token of the Scaled Oath: showing it at the barracks gate lets the heroes in without a fight.',
    label: [8, 59],
  });
  b.props_('gallows', [[4, 57], [9, 57]]).prop('gibbet-post', 13, 57).prop('cart', 12, 60).prop('lamp-post', 6, 60).light(6, 60, 10, 15);

  b.area('Ashfall Market', [[26, 42, 10, 8]], {
    read: 'The great market burned with everything in it. Stalls are black frames, the fountain is full of ash, and a line of people in chains shuffles across the square, driven by chanting priests with whips of fire.',
    gm: 'The "penitents\' march": forty citizens being driven to the cathedral to be burned as the dawn offering. Gladiators of the dragon\'s arena guard them. Freeing them is a fight, or a trick (a DC 20 Deception posing as the cult works, with the token from Gallows Square). The penitents know the sewers: one of them is Osric the sewer-keeper\'s brother, who points the way to Osric.',
    label: [30, 45],
  });
  b.props_('market-stall', [[27, 43], [27, 47], [34, 43]]).prop('fountain', 31, 45).prop('produce-stall', 33, 48).prop('cart', 29, 49).props_('burning-wreckage', [[34, 46], [28, 45]]).prop('lamp-post', 35, 49);
  b.light(31, 45, 10, 20, '#ff8a3c');
  b.encounter("The penitents' march", [26, 42, 10, 8], [['gladiator', 4], ['priest', 4], ['cultFanatic', 10]], 'low');

  b.room('Charred guildhall', 27, 52, 8, 4, {
    mat: 'wood-planks-dark',
    read: 'The roof is gone and the stars show through the beams. Under a fallen table, something moves and holds very still.',
    gm: 'Osric Dunmore, the old sewer-keeper, has hidden here for two days. He knows every tunnel under Halcyra and offers to lead the heroes under the slag river if they promise to get his brother out (in the market). He gives his chalk map (handout).',
  });
  shell(27, 52, 8, 4, 501);
  b.props_('broken-furniture', [[28, 53], [33, 54]]).prop('table-long', 30, 53).prop('debris-wood', 32, 55).prop('bookshelf-fallen', 34, 52);

  b.area('Street of Fallen Towers', [[43, 42, 11, 20]], {
    read: 'Bell towers lie across the street like felled trees. Their bells are melted into puddles of bronze, and the cobbles between them are still too hot to touch.',
    gm: 'Rubble everywhere (difficult ground). Good cover for sneaking toward the barracks. A collapsed shop holds a looted strongbox (DC 18 Investigation): 600 gp and a ring of fire resistance.',
    label: [48, 51],
  });
  shell(44, 43, 8, 5, 502);
  shell(44, 53, 9, 4, 503);
  b.rubble(45, 49, 6, 1).rubble(43, 58, 3, 2);
  b.props_('column-collapsed', [[46, 45], [49, 55]]).props_('ceiling-rubble', [[50, 44], [45, 54]]).prop('strongbox', 51, 46).props_('embers-ash', [[47, 47], [52, 56]]).prop('temple-bell', 48, 44).prop('skeleton-lying', 46, 56);
  shell(27, 57, 5, 3, 504);
  shell(47, 59, 6, 3, 505);
  b.rubble(18, 57, 3, 2).rubble(52, 42, 2, 3);
  b.props_('burning-ground', [[22, 60], [31, 61], [46, 60], [58, 59], [76, 60]]).props_('rubble-pile', [[19, 57], [53, 43], [1, 47]]).props_('skeleton-lying', [[24, 57], [55, 60]]).prop('cart', 49, 60);
  b.props_('debris-wood', [[28, 58], [30, 59]]);

  // ======== the cathedral (west) ========
  b.rock(2, 42, 24, 14);
  b.room('Cathedral of the Burning Crown', 9, 43, 11, 13, {
    mat: 'marble', more: [[3, 46, 22, 5]],
    read: 'A cathedral built to a kinder god, now hung with red banners. Two hundred voices sing one note that never ends, and above the altar, held up by chains, a crown of molten gold turns slowly in the air, dripping.',
    gm: 'The Cinder Choir: the first anchor of the coronation (handout). While the choir sings, the dragon regains 20 hit points at the start of each of her turns at the throne. Silencing them works three ways: beat the choir leaders, shatter the Ember Reliquary on the altar (AC 18, 60 hit points, immune to fire), or unbind the rite (DC 22 Arcana, three successes before three failures, one check per round). The two hundred singers are cultists who flee once the leaders fall.',
  });
  b.props_('pew', [[10, 48], [12, 48], [16, 48], [18, 48], [10, 52], [12, 52], [16, 52], [18, 52]], 90);
  b.prop('altar-reredos', 14, 43).prop('reliquary', 14, 44).prop('censer-hanging', 14, 46).props_('candelabra-grand', [[10, 44], [18, 44]]).prop('organ-cathedral', 4, 48).prop('idol-colossal', 23, 48);
  b.props_('window-stained-tall', [[9, 50], [19, 50]]).props_('banner-hanging-tall', [[11, 53], [17, 53]]).props_('brazier-pedestal', [[6, 47], [22, 50]]).prop('lectern-dais', 14, 50);
  b.light(14, 45, 20, 30, '#ffb347').light(6, 47, 10, 15, '#ff8a3c').light(22, 50, 10, 15, '#ff8a3c');
  for (const x of [13, 14, 15]) b.door(x, 55, 's', 'closed', 'door-double');
  b.floor(25, 48, 1, 1, 'marble').door(25, 48, 'e', 'closed');
  b.encounter('The Cinder Choir', [3, 43, 22, 12], [['archmage', 1], ['adultRedDragon', 1], ['fireElemental', 4], ['priest', 6], ['cultFanatic', 8]], 'moderate');
  b.room('Bell tower', 3, 52, 5, 4, {
    mat: 'stone-flagstone',
    read: 'A spiral stair climbs into smoke. Every time the great bell above you tolls, dust shakes down on your heads.',
    gm: 'The bell tolls the hours to dawn. The adult red dragon of the choir perches on the roof up here, and comes down through the broken belfry when the fight starts. Cutting the bell rope (or ringing it out of time, DC 18 Performance) makes the choir lose its note: the Arcana checks to unbind the rite have advantage.',
  });
  b.floor(5, 51, 1, 1, 'stone-flagstone').door(5, 51, 's', 'closed');
  b.door(5, 55, 's', 'closed');
  b.prop('stair-spiral', 4, 53).prop('rope-coil', 6, 53).prop('temple-bell', 6, 52);
  b.room('Vestry', 21, 52, 4, 3, {
    mat: 'wood-planks-dark',
    read: 'Wardrobes of red robes and a writing desk covered in candle wax. A ledger lies open, every line a name.',
    gm: 'The ledger lists the 400 "unworthy" burned since the conquest, and the order of the coronation. The page for tonight is the rite handout. The High Hierophant\'s spare robe hides a wand of fireballs.',
  });
  b.floor(22, 51, 1, 1, 'wood-planks-dark').door(22, 51, 's', 'closed');
  b.props_('wardrobe', [[21, 52], [24, 52]]).prop('writing-desk', 22, 54).prop('book-pile', 24, 54);
  b.area('Crypt stair', [[11, 43, 4, 2]], {
    read: 'Behind the altar, old stone steps go down into the dark, and the air that comes up smells of hot iron and wet brick.',
    gm: 'A secret door in the floor behind the altar (DC 20 Perception, or Osric knows it) leads down to the old sewer and under the slag river. The cult never found it.',
    label: [12, 44],
  });
  b.prop('stairs-down', 12, 44);

  // ======== the barracks of the Scaled Oath (east) ========
  b.rock(54, 42, 25, 15);
  b.room('Drill yard', 58, 47, 12, 8, {
    mat: 'dirt',
    read: 'A packed-earth yard inside black walls. Knights in armour scaled like a dragon\'s hide stand in ranks, and behind them, in open stables, young red dragons lift their heads and sniff the air.',
    gm: 'The Scaled Oath: the old imperial army, sworn to the dragon three years ago to stop her burning the rest of the empire. Lord-General Tavian Roke commands. They fight if attacked, but they are ashamed. Turning them: show Roke the Empress alive (or her signet), or his own unsent letter (handout) with a DC 18 Persuasion. Turned, the Oath fights the honour guard on the Palace stairs and their young dragons carry the heroes up the hill.',
  });
  b.floor(62, 55, 4, 2, 'stone-cobble');
  for (let x = 62; x < 66; x++) b.door(x, 56, 's', 'closed', 'door-iron');
  b.props_('training-dummy', [[59, 48], [59, 51]]).props_('archery-target', [[68, 48]]).props_('weapon-rack', [[60, 54], [67, 54]]).prop('war-banner', 64, 48).props_('hay-bale', [[69, 52], [69, 53]]).prop('water-trough', 63, 52).prop('campfire', 65, 51);
  b.light(65, 51, 15, 20);
  b.room('Wyrm stables', 71, 44, 7, 11, {
    mat: 'stone-flagstone',
    read: 'Stalls as big as barns, roofed with chain netting. The straw is smoking. Bones of cattle lie in heaps, and on every stall door hangs a knight\'s shield.',
    gm: 'The young red dragons are the knights\' mounts: they obey their riders, not the dragon queen, and only fight here if the yard does. With Roke turned, four of them will carry the heroes (and allies) straight to the Broken Dome or the Shattered terrace.',
  });
  b.floor(70, 47, 1, 5, 'stone-flagstone');
  b.props_('bone-heap', [[72, 45], [76, 53]]).props_('hay-bale', [[76, 45], [72, 53]]).props_('shield-wall', [[74, 44]]).prop('chains-hanging', 74, 49).prop('water-trough', 76, 49);
  b.room("General's quarters", 55, 43, 8, 3, {
    mat: 'wood-planks',
    read: 'A soldier\'s room: a camp bed, a map table and a single portrait turned to face the wall.',
    gm: 'The portrait is of Empress Corisande. Roke\'s desk holds his letter to her, written a year ago and never sent (handout). DC 15 Investigation. If Roke is here alone, he will talk before he fights.',
  });
  b.floor(60, 46, 1, 1, 'wood-planks').door(60, 45, 's', 'closed');
  b.prop('cot', 56, 43).prop('war-table', 59, 44).prop('writing-desk', 62, 43).prop('armor-stand', 55, 45).prop('tapestry-tall', 61, 45);
  b.room('Armory', 65, 43, 5, 3, {
    mat: 'stone-flagstone',
    read: 'Racks of lances as long as a dragon\'s neck, and saddles of red leather sized for wyrms.',
    gm: 'Lances: a creature riding a dragon can use one as a pike that deals an extra 2d6 piercing on a charge. One rack holds a dragon slayer greatsword the Oath never dared use.',
  });
  b.floor(67, 46, 1, 1, 'stone-flagstone').door(67, 45, 's', 'locked', 'door-iron');
  b.props_('spear-rack', [[65, 43], [69, 43]]).prop('weapon-rack', 67, 43).prop('armor-stand', 66, 45);
  b.floor(54, 50, 4, 1, 'stone-cobble').door(54, 50, 'w', 'closed', 'door-iron');
  b.encounter('Barracks of the Scaled Oath', [55, 43, 23, 13], [['dragonSwornGeneral', 1], ['gladiator', 2], ['knight', 8], ['veteran', 8], ['youngRedDragon', 4]], 'moderate');

  // ======== the slag river ========
  {
    const lr = rng(77);
    let top = 34, bot = 38;
    for (let x = 0; x < 80; x++) {
      top = Math.max(33, Math.min(35, top + Math.round((lr() - 0.5) * 1.4)));
      bot = Math.max(37, Math.min(39, bot + Math.round((lr() - 0.5) * 1.4)));
      b.lava(x, top, 1, bot - top + 1);
    }
  }
  b.props_('lava-river', [[4, 36], [20, 36], [33, 36], [48, 36], [57, 36], [72, 36]]);
  for (const x of [6, 20, 32, 48, 58, 74]) b.light(x, 36, 20, 30, '#ff6a1e');
  b.area('The Slag River', [[0, 33, 80, 7]], {
    read: 'A river of molten slag runs through the heart of the city, where the old canal used to be. It moves like honey and roars like the sea, and the heat of it blisters paint on doors a street away.',
    gm: 'Anyone who enters it takes 55 (10d10) fire damage, and again each turn they start in it. Flying over it is safe but the heat rising off it gives disadvantage on Constitution saves to keep concentration. Crossings: the Bridge of Kings (main), the Widow\'s Bridge (broken), the Fallen Spire (east) and the sewer culvert (west, under the slag).',
    label: [52, 36],
  });

  // the quay on the south bank
  b.area('Slag quay', [[0, 39, 80, 3]], {
    read: 'A stone quay along the molten river, lined with mooring posts for barges that burned long ago. The cobbles are slick with glassy drips.',
    gm: 'Open ground: anyone here can be seen from the palace hill. Lookouts on the Palace stairs spot movement on a failed DC 18 Stealth check, and the honour guard is ready for them.',
    label: [20, 40],
  });
  b.props_('mooring-post', [[3, 40], [22, 40], [46, 40], [76, 40]]).props_('burning-wreckage', [[30, 40], [55, 41]]).prop('rowboat', 50, 40);

  // the Bridge of Kings
  b.floor(37, 32, 6, 8, 'stone-flagstone');
  b.wallRun(37, 33, 6, 'w', 'low').wallRun(42, 33, 6, 'e', 'low');
  b.area('Bridge of Kings', [[37, 32, 6, 8]], {
    read: 'A bridge of white stone crosses the slag, lined with statues of the old emperors. Every statue has had its head melted off, and a stone dragon\'s head set in its place.',
    gm: 'The straight way to the Palace stairs, and the one the honour guard watches. Low parapets give half cover. The middle span is cracked: a fire giant or larger creature that stands on it makes it groan (DC 15 Perception notices; a thunderwave or similar drops it into the slag).',
    label: [39, 35],
  });
  b.props_('statue-tall-knight', [[37, 33], [42, 33], [37, 38], [42, 38]]).props_('brazier-pedestal', [[38, 32], [41, 32]]);
  b.light(38, 32, 10, 15).light(41, 32, 10, 15);

  // the Widow's Bridge, broken in the middle
  b.floor(25, 32, 3, 8, 'stone-cobble').lava(25, 35, 3, 2);
  b.area("Widow's Bridge", [[25, 32, 3, 8]], {
    read: 'An old footbridge that ends in a ragged edge over the slag. Ten feet of glowing nothing, and then it starts again.',
    gm: 'A 10-foot gap over the slag: a running jump (Strength 10+) clears it, anyone else needs a DC 14 Athletics check or falls in. Nobody guards it, because nobody thinks anyone would try. Lands near the Courtyard of Chains side of the north bank.',
    label: [26, 33],
  });
  b.props_('crumbling-ledge', [[26, 34], [26, 37]]).prop('rope-coil', 26, 39);

  // the Fallen Spire, lying across the river
  b.floor(63, 31, 3, 11, 'stone-flagstone');
  b.rubble(63, 39, 3, 3);
  b.area('The Fallen Spire', [[62, 31, 5, 11]], {
    read: 'The emperor\'s great tower fell during the conquest. It lies across the slag river like a log across a stream, and its broken top leans against the cliff of the palace hill, high above.',
    gm: 'A way across that no one watches: the shaft is 15 feet wide but rounded (DC 12 Acrobatics each round or slide toward the slag, a second failure means falling in). On the north bank, its top half leans against the cliff: a climb up the Leaning Stump to the Shattered terrace (see there).',
    label: [64, 35],
  });
  b.props_('column-collapsed', [[63, 33], [65, 37]]).props_('rubble-pile', [[63, 40], [65, 41]]).prop('pillar-broken', 64, 31);

  // the sewer culvert, under the slag
  b.floor(12, 26, 2, 17, 'stone-cobble');
  b.wallRun(12, 30, 12, 'w').wallRun(13, 30, 12, 'e');
  b.door(13, 40, 'e', 'closed', 'door-iron');
  b.door(12, 42, 's', 'secret').door(13, 42, 's', 'secret');
  b.area('Sewer under the slag', [[12, 30, 2, 12]], {
    read: 'A brick tunnel runs under the river of slag. The ceiling sweats drops of molten glass, the water at your ankles is boiling, and something long and red is swimming toward you through the steam.',
    gm: 'The old storm sewer. It comes out at the bottom of the Prison Pit. The way in is a locked iron grate on the quay (DC 20 thieves\' tools or Strength) or the secret stair from the cathedral crypt. Salamanders nest here in the heat. Each minute in the tunnel: DC 15 Constitution save or a level of exhaustion (fire resistance means no save).',
    label: [12, 35],
  });
  b.props_('steam-vent', [[12, 32], [13, 38]]).props_('sewer-outflow', [[12, 27]]).prop('puddle', 13, 41);
  b.light(12, 35, 5, 10, '#ff6a1e');
  b.encounter('Salamanders in the steam', [12, 26, 2, 17], [['salamander', 5], ['fireElemental', 2], ['magmin', 8]], 'low');

  // the north bank, under the palace cliff
  b.area('Cinder bank', [[0, 30, 80, 3]], {
    read: 'A narrow strip of road under the cliffs of the palace hill. Above you, the ruined palace burns against the sky like a crown on a dead man\'s head.',
    gm: 'Ways up from here: the Palace stairs (centre), the Leaning Stump (east, a climb) and, for anyone who finds the iron door in the Courtyard of Chains, the way through the Prison Pit. The cliff is 60 feet of hot rock: climbing it anywhere else is DC 25 Athletics.',
    label: [20, 31],
  });
  b.props_('lamp-post', [[30, 31], [50, 31]]).props_('statue-dragon', [[34, 30], [45, 30]]).props_('rubble-pile', [[8, 31], [72, 31]]);
  b.light(30, 31, 10, 15).light(50, 31, 10, 15);

  // ======== the palace hill ========
  // the Palace stairs
  b.room('Palace stairs', 36, 14, 8, 16, {
    mat: 'marble',
    read: 'A stair of white marble climbs the hill in great sweeps, wide enough for an army. Fire giants in gold-chased armour stand on every landing like statues, and one of the statues turns its head.',
    gm: 'The honour guard. If the Scaled Oath has been turned, they march up behind the heroes and take on half the giants. Fighting up the stair: anything knocked prone rolls 2d4 x 10 feet down it. The Burned colonnade leads east from the middle landing.',
  });
  b.floor(38, 12, 4, 2, 'marble');
  b.props_('stair-grand', [[39, 28], [39, 22], [39, 16]]).props_('statue-tall-winged', [[36, 26], [43, 26], [36, 18], [43, 18]]).props_('brazier-pedestal', [[37, 24], [42, 24], [37, 15], [42, 15]]).prop('war-banner', 40, 20);
  for (const [x, y] of [[37, 24], [42, 24], [37, 15], [42, 15]]) b.light(x, y, 10, 15);
  b.encounter('Honour guard of the stair', [36, 14, 8, 16], [['fireGiant', 6], ['mage', 2], ['youngRedDragon', 1]], 'moderate');

  b.room('Burned colonnade', 44, 23, 6, 3, {
    mat: 'marble',
    read: 'A walk of tall pillars, half of them fallen, joins the stair to a terrace on the east. Ash blows through it in sheets.',
    gm: 'A side way to the Shattered terrace that avoids the top of the stair. Fallen pillars give full cover.',
  });
  b.props_('column-fluted', [[45, 23], [48, 23]]).props_('column-collapsed', [[46, 25]]);

  // the Courtyard of Chains
  b.room('Courtyard of Chains', 21, 16, 13, 11, {
    mat: 'stone-flagstone',
    read: 'A courtyard of cracked flagstones. In the middle, pinned to the ground by a dozen black chains, lies a silver dragon, her scales scorched dull, her blood running in a channel cut in the stone toward the palace. Two red dragons sit on the walls above her, like cats over a bird.',
    gm: 'The second anchor: Aurivel, the Unburnt Offering. While she is chained, the queen has 3 more uses of Legendary Resistance at the throne. Three master-chains hold her: each is AC 20, 60 hit points, immune to fire and psychic damage; a DC 25 Strength check snaps one, and dispel magic (DC 19) unlocks one. Freed, Aurivel fights beside the heroes for the rest of the night (adult silver dragon). Her guards are Vharzen, the queen\'s son, and his sister, with wyrmlings from the latest clutch.',
  });
  b.floor(34, 19, 2, 3, 'marble');
  b.props_('wall-chains', [[25, 20], [30, 20], [27, 24]]).props_('chains-hanging', [[24, 23], [31, 23]]).prop('blood-pool', 28, 22).prop('archway-grand', 34, 20).props_('statue-gargoyle', [[21, 16], [33, 16]]).prop('bone-heap', 22, 26).prop('fountain-grand', 32, 25);
  b.light(28, 21, 10, 20, '#cfe6ff').light(34, 20, 10, 15);
  b.encounter('Wardens of the chained dragon', [21, 16, 13, 11], [['adultRedDragon', 2], ['redDragonWyrmling', 4]], 'moderate');

  // the Prison Pit
  b.cave('The Prison Pit', 10, 21, 7, 7, {
    seed: 41, mat: 'cave-floor',
    read: 'A great pit dug into the hill, ringed with a ledge and cells cut into the rock. At the bottom, in the dark, hundreds of prisoners look up at you. Hanging over the middle on a long chain is a single iron cage, and in it sits a woman in a burned gown, sitting very straight.',
    gm: 'The third anchor: Empress Corisande, the Last Crown, is to be carried to the throne at dawn and her crown melted onto the dragon\'s brow. Two fire giant jailers and their hounds keep the pit. The cage hangs 30 feet over the pit floor on a winch (the lever on the ledge lowers it; DC 20 thieves\' tools or 40 damage opens it). If the heroes free her before dawn, the coronation cannot be finished.',
  });
  b.pit(8, 18, 5, 5);
  b.hall(14, 21, 20, 21, 1, { mat: 'cave-floor' });
  b.door(20, 21, 'e', 'closed', 'door-iron');
  b.props_('cell-door', [[5, 17], [4, 22], [8, 26]]).props_('prison-bars', [[14, 17], [15, 25]]).prop('cage-hanging', 10, 20).prop('winch', 14, 19).prop('lever', 14, 22).props_('wall-chains', [[7, 15], [12, 27]]).prop('skull-pile', 4, 19).prop('torch-sconce', 16, 21);
  b.light(16, 21, 10, 15).light(10, 20, 5, 10);
  b.encounter('Jailers of the pit', [3, 14, 15, 15], [['fireGiant', 2], ['hellHound', 8]], 'low');

  // the Gallery of Melted Crowns and the servants' stair
  b.room('Gallery of Melted Crowns', 12, 4, 12, 7, {
    mat: 'marble',
    read: 'A long hall of glass cases. In each one, on a velvet cushion, sits a puddle of gold that used to be a crown, with a small brass label: the name of a kingdom, and a date.',
    gm: 'The queen\'s trophies: twenty-three kingdoms. The cases are guarded by shield guardians and a court mage. The last case is empty, labelled "Halcyra - at dawn". Looting the gold: 9,000 gp in melted crowns (the kingdoms\' heirs will want them back, and will pay well in favours).',
  });
  b.floor(24, 6, 6, 2, 'marble');
  b.door(23, 6, 'e', 'closed', 'door-double').door(23, 7, 'e', 'closed', 'door-double');
  b.props_('display-case', [[13, 5], [16, 5], [19, 5], [13, 9], [16, 9], [19, 9]]).props_('crown-cushion', [[14, 7], [18, 7]]).props_('banner-hanging-tall', [[12, 7], [22, 5]]).prop('chandelier-great', 17, 7);
  b.light(17, 7, 15, 20, '#ffd27a');
  b.encounter('The crown-keepers', [12, 4, 12, 7], [['shieldGuardian', 4], ['mage', 1]], 'low');
  b.floor(22, 11, 2, 5, 'stone-flagstone');
  b.door(22, 15, 's', 'secret').door(23, 15, 's', 'secret');
  b.area("Servants' stair", [[22, 11, 2, 5]], {
    read: 'A narrow stair behind a panel, worn smooth by a thousand servants\' feet. It smells of old soap and new smoke.',
    gm: 'Secret door from the Courtyard of Chains (DC 22 Perception, or Aurivel or the Empress knows it) up to the Gallery and from there to the throne\'s west side. A way to reach the throne without the stair.',
    label: [22, 13],
  });
  b.prop('stairs-up', 22, 13);

  // the Shattered terrace
  b.room('Shattered terrace', 50, 20, 26, 9, {
    mat: 'stone-flagstone',
    read: 'A terrace of the old palace, its gardens burned to black sticks. The broken top of a great tower leans against its edge, and a hole in the palace wall above glows orange.',
    gm: 'Reached by the Leaning Stump, the Burned colonnade, or from the Broken Dome above. The breach in the palace wall leads straight to the throne\'s east side. Dead gardeners lie where they fell three years ago; nobody buried them.',
  });
  b.props_('tree-dead', [[52, 21], [57, 26], [61, 21], [70, 27], [74, 22]]).props_('brambles', [[55, 23], [68, 24]]).prop('fountain', 60, 24).props_('skeleton-lying', [[53, 27], [72, 25]]).prop('statue-tall-robed', 66, 21);
  b.floor(63, 29, 3, 1, 'stone-flagstone');
  b.area('The Leaning Stump', [[62, 27, 5, 4]], {
    read: 'The tower\'s top lies against the cliff at a steep slant. Inside it, its spiral stair now runs almost sideways, and the windows point at the sky.',
    gm: 'The climb up from the Cinder bank to the terrace: 60 feet inside the leaning tower. DC 15 Athletics (DC 20 if rushed); a failure means falling 2d6 x 10 feet back down. Halfway up, a nest of wyrmling eggs (6, worth 500 gp each to the right buyer) sits in a broken room.',
    label: [64, 29],
  });
  b.prop('stair-spiral', 64, 29).prop('ladder', 63, 28);
  b.tunnel([[51, 19], [50, 15], [47, 12]], 2, { seed: 61, mat: 'stone-flagstone' });
  b.area('Breach in the palace wall', [[46, 11, 7, 9]], {
    read: 'A gap in the palace wall, torn open from the inside. The edges of the stone are melted smooth like candle wax.',
    gm: 'Where the queen burst out of the palace on the night of the conquest. Leads to the throne\'s east side. Anyone coming this way arrives behind her hoard, out of her sight unless she is looking.',
    label: [50, 15],
  });
  b.props_('rubble-pile', [[50, 17], [48, 13]]).prop('lava-crack', 51, 15);

  // the Broken Dome, where flyers land
  b.cave('The Broken Dome', 66, 9, 8, 5.5, {
    seed: 51, mat: 'marble',
    read: 'The palace\'s great dome has fallen in. Its floor is open to the sky, a bowl of shattered marble and gold leaf, and the smoke of the burning city pours across it like a river.',
    gm: 'The landing place for anyone who flies (on a spell, a turned dragon or Aurivel\'s back). Red dragons patrol here: an adult and two young ones. Fighting in the air above the dome is possible: the smoke is heavily obscured above 60 feet. Stairs go down to the Shattered terrace; a hall leads west to the throne.',
  });
  b.floor(66, 14, 3, 6, 'marble');
  b.floor(52, 8, 8, 2, 'marble');
  b.props_('column-collapsed', [[62, 6], [70, 12]]).props_('ceiling-rubble', [[66, 5], [70, 8]]).prop('statue-tall-winged', 60, 10).prop('heraldic-crest', 67, 8).props_('stairs-down', [[67, 15]]);
  b.light(66, 9, 15, 25, '#ff9a5c');
  b.encounter('Wings over the dome', [58, 3, 17, 13], [['adultRedDragon', 1], ['youngRedDragon', 2]], 'low');

  // the Throne of Cinders
  b.cave('The Throne of Cinders', 40, 7, 12, 6, {
    seed: 31, mat: 'marble', wobble: 0.12,
    read: 'The palace has no roof any more. Above you the stars are going out, one by one, as the sky turns grey. In the middle of the ruin, on a hill of gold and melted crowns, lies the queen of the world, so big that the throne of the emperors is a footstool under her claw. She opens one eye. "You are early," she says. "Dawn is not for an hour."',
    gm: 'Ysmerath the Unburnt. Her two fire giant torch-bearers stand at the foot of the hoard. Count what the heroes did: the choir still singing (she regains 20 hit points at the start of each of her turns), Aurivel still chained (3 more Legendary Resistances), the Empress still in the pit (the coronation can finish at dawn: see the tips). She talks first: she offers each hero a kingdom of their own. She does not lie about it.',
  });
  b.props_('dragon-hoard', [[40, 6], [36, 8]]).prop('throne-dais', 40, 3).prop('throne', 40, 4).props_('coin-stacks', [[34, 6], [46, 9], [44, 4]]).props_('coins-large', [[37, 10], [43, 10]]).prop('gem-bowl', 45, 6).props_('treasure-pile', [[33, 9], [47, 7]]).prop('crown-cushion', 41, 5);
  b.props_('pillar-broken', [[31, 6], [49, 6], [33, 11], [47, 11]]).props_('column-fluted', [[30, 9], [50, 9]]).props_('brazier-everburning', [[38, 12], [42, 12]]).prop('magma-vent', 35, 4);
  b.light(40, 6, 30, 40, '#ff7a2e').light(38, 12, 10, 15).light(42, 12, 10, 15);
  b.encounter('The Coronation', [27, 1, 27, 13], [['ancientRedDragon', 1], ['fireGiant', 2]], 'high');

  return b.build();
}

export const THRONE_OF_CINDERS: Adventure = {
  id: 'throne-of-cinders',
  title: 'The Throne of Cinders',
  tagline: 'The last free armies storm a burned capital to stop an ancient red dragon being crowned a god at dawn.',
  levels: '20',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['epic', 'finale', 'dragon', 'war', 'city'],
  pitch:
    'Three years ago a red dragon called Ysmerath burned the Empire of Halcyra in a single night and sat down on its throne. Since then she has taken twenty-three kingdoms. Tonight the last free ones have marched their whole army to the walls of her burned capital, because at dawn her priests will crown her a god, and after that no army will matter. The generals have a plan for the walls. The plan for the dragon is you.',
  secret:
    'Ysmerath the Unburnt is an ancient red dragon who wants to be worshipped, not just feared. Her High Hierophant, Mott Ashgrave, has found a rite to make that literal: at dawn, with three "anchors" in place, her worshippers\' devotion will become real divine power. The anchors are the Cinder Choir singing in the cathedral, the blood of a chained silver dragon (Aurivel, who led the first army against her) and the Last Crown: Empress Corisande, held in the Prison Pit, whose crown will be melted onto the dragon\'s brow. Each anchor the heroes break makes the final fight easier; break the Last Crown and the coronation cannot finish at all. Why now: the rite needs the longest night of the year, and the free kingdoms know it too, which is why they are attacking tonight with everything they have.',
  hooks: [
    'The heroes are the free kingdoms\' last champions: Marshal Brannoc Teague asks them to lead the assault in person.',
    'Aurivel the silver dragon once saved one of the heroes\' homelands; her mate, dying, begs them to free her.',
    'A smuggled message from Empress Corisande reaches the heroes: "Do not come for me. Come for her. But if you are passing the pit, I would not say no."',
  ],
  tips: [
    'Use a bell clock. Start at 8 bells. Every fight and every long scene costs one bell; a short rest costs two. At 0 it is dawn. If the Empress is still in the pit, she is carried to the throne and the coronation finishes: Ysmerath gains 300 temporary hit points, is immune to being charmed, frightened or paralysed, and the allied army breaks and runs.',
    'The three anchors are the heart of the adventure. Each one broken shows up in the final fight: no choir means no healing, a free Aurivel means no extra Legendary Resistances (and a dragon on the heroes\' side), a free Empress means no dawn coronation.',
    'Let the battle be loud around the heroes. Every scene, describe one thing happening in the wider war: a trebuchet stone, a dragon diving on the siege lines, a knight doing something brave. If the heroes help the army (at the Breach, the Ember Gate or the hospital), let the army help them back.',
    'Many fights can be turned: the Scaled Oath with Roke, the Ember Gate holdouts with a show of power, the penitents\' guards with a disguise. Turned enemies are worth the same as beaten ones, and better in the story.',
    'Flying is a real route. A party that can fly (or rides the Oath\'s dragons, or Aurivel) can skip the stair and land in the Broken Dome, but the dome patrol meets them in the air.',
    'This is the end of a long road. Give Ysmerath time to talk before the fight, give the heroes a moment to answer, and let old friends and enemies from the campaign show up in the battle if you have them.',
  ],
  npcs: [
    {
      id: 'pf_tcbrannoc', name: 'Marshal Brannoc Teague', title: 'commander of the free kingdoms', kind: 'npc', art: 'guard-captain', monsterId: 'knight', shared: true,
      wants: 'The dragon dead before dawn, and as many of his soldiers alive at sunrise as possible.', knows: 'The three anchors of the rite, the ways through the wall, and that Roke was the finest soldier the Empire had.',
      voice: 'Hoarse from shouting, very calm. Ends every order with "if you please".', appearance: 'A grey, one-eyed old man in mud-spattered plate, with a field surgeon\'s satchel on his hip.',
      backstory: 'He was the Empire\'s enemy for thirty years. Now he leads the war to free it.',
    },
    {
      id: 'pf_tcosric', name: 'Osric Dunmore', title: 'old sewer-keeper', kind: 'npc', art: 'beggar', monsterId: 'commoner', shared: true,
      wants: 'His brother out of the penitents\' chains, and to see the sun come up over a free city.', knows: 'Every tunnel under Halcyra, the grate on the quay, and the secret stair from the cathedral crypt.',
      voice: 'Whispers, even when he does not need to. Counts things on his fingers.', appearance: 'A small, bald, soot-black man in waders, with a lantern he never lights.',
      gmNotes: 'Commoner. He will guide the heroes through the sewer under the slag but will not go into the Prison Pit itself.',
    },
    {
      id: 'pf_tccorisande', name: 'Empress Corisande', title: 'the Last Crown', kind: 'npc', art: 'queen', monsterId: 'noble', shared: true,
      wants: 'Her people freed, her crown destroyed before the dragon gets it, and Tavian Roke forgiven.', knows: 'The servants\' stair from the Courtyard of Chains, the shape of the rite, and that Roke knelt only to stop the burning of the southern cities.',
      voice: 'Quiet and dry, with a sense of humour that has survived three years in a cage.', appearance: 'Tall and thin, in the ruins of a white court gown, her hair cropped short, the imperial crown still on her head.',
      gmNotes: 'Noble stat block. Freeing her breaks the third anchor. In person, she can release Roke from his oath with a word: the Scaled Oath turns at once.',
    },
    {
      id: 'pf_tcroke', name: 'Lord-General Tavian Roke', title: 'commander of the Scaled Oath', kind: 'monster', art: 'knight', monsterId: 'dragonSwornGeneral', shared: true,
      wants: 'To undo the oath he swore to the dragon, without getting the rest of his soldiers burned for it.', knows: 'The honour guard\'s orders, the dome patrol\'s timing, and that the queen\'s left wing has never healed from Aurivel\'s breath.',
      voice: 'Formal and tired. Never says the dragon\'s name; calls her "the Queen" with a twist in it.', appearance: 'A broad man in dark red dragon-scale armour, with a grey beard and the Empress\'s colours sewn inside his cloak where no one sees.',
      backstory: 'Three years ago the dragon gave him a choice: kneel with the army, or watch every southern city burn. He knelt.',
      gmNotes: 'Dragon-Sworn General stat block; he leads the barracks fight himself, with two arena champions at his side. Turned (the Empress, his letter, or a DC 18 Persuasion with a good reason), he and his knights fight the honour guard and lend the heroes their young dragons. Tell him the knights\' families are safe and the check has advantage.',
    },
    {
      id: 'pf_tcaurivel', name: 'Aurivel', title: 'the Unburnt Offering, a chained silver dragon', kind: 'monster', art: 'dragon-silver-adult', monsterId: 'adultSilverDragon', shared: true,
      wants: 'Freedom, and one more fight with the red queen.', knows: 'Ysmerath\'s weak left wing, the servants\' stair, and the rite\'s three anchors (she has listened to the priests for a year).',
      voice: 'Soft and amused, even in pain. Calls the heroes "little stars".', appearance: 'A silver dragon gone dull grey with soot and burns, chained at the neck, wings and tail, her eyes still bright.',
      gmNotes: 'Adult silver dragon, starting at half hit points. Freed, she fights beside the heroes and can carry two of them. Her cold breath does double damage to Ysmerath the first time it hits.',
    },
    {
      id: 'pf_tcvharzen', name: 'Vharzen', title: 'the queen\'s son', kind: 'monster', art: 'dragon-red-adult', monsterId: 'adultRedDragon',
      wants: 'His mother\'s throne one day, and the silver dragon\'s blood to be his.', knows: 'That his mother will not share godhood with anyone, including him.',
      voice: 'A spoiled, lazy drawl that turns to a shriek when he is hurt.', appearance: 'A sleek adult red dragon with gold rings in his horns and the scars of his mother\'s claws on his neck.',
      gmNotes: 'Adult red dragon, one of the two in the Courtyard fight. A DC 22 Insight or Persuasion on his jealousy can make him leave the fight ("let her guard her own offering").',
    },
    {
      id: 'pf_tcmott', name: 'High Hierophant Mott Ashgrave', title: 'priest of the Burning Crown', kind: 'monster', art: 'fire-mage', monsterId: 'archmage',
      wants: 'To stand beside a living god and be the first to pray to her.', knows: 'Everything about the rite, and that Ysmerath has promised to eat him once she no longer needs priests. He believes he can change her mind.',
      voice: 'Sings his sentences, high and sweet. Never stops smiling.', appearance: 'A tall man whose skin is cracked like burned bread, in red robes and a crown of iron nails.',
      gmNotes: 'Archmage. Leads the Cinder Choir. If he survives the cathedral, he flees to the throne and casts his spells from behind the hoard.',
    },
    {
      id: 'pf_tcysmerath', name: 'Ysmerath the Unburnt', title: 'the God-Queen of Cinders', kind: 'monster', art: 'dragon-red-ancient', monsterId: 'ancientRedDragon', shared: true,
      wants: 'To be prayed to. Not obeyed: prayed to, forever.', knows: 'Everything that happens in her city, sooner or later, and the name of everyone who ever defied her.',
      voice: 'Warm, patient and very old, like a grandmother by the fire. She is never in a hurry until she is hurt.', appearance: 'A red dragon the size of a cathedral, her scales gone almost black with age, her left wing patched with silver scars, a ring of melted crowns around one horn.',
      gmNotes: 'Ancient red dragon. She talks first. In the fight she uses the open sky: she flies, breathes, lands on the hoard. At a quarter of her hit points she offers the heroes anything to let her flee; if they refuse, she fights to the end.',
    },
  ],
  handouts: [
    { id: 'marshal-orders', title: "The Marshal's orders", text: 'To the champions, by my hand:\nThe army takes the wall at the second bell. Use the gap we make.\nBefore dawn, if you please:\n1. Silence the choir in the cathedral.\n2. Free the silver dragon in the courtyard.\n3. Bring the Empress out of the pit.\nThen go up the hill and finish it.\nWe will hold as long as we can. - B. Teague' },
    { id: 'coronation-rite', title: 'The Rite of the Burning Crown', text: 'THREE THINGS BEAR UP THE GODHEAD:\nThe Voice: the choir that does not cease, that her wounds may close.\nThe Blood: the Unburnt Offering, chained and bleeding, that no spell may hold her.\nThe Crown: the last crown of the last empire, laid on her brow at dawn.\nWhen the sun touches the throne, she who wears it shall be prayed to and shall hear.' },
    { id: 'roke-letter', title: "Roke's unsent letter", text: 'Majesty,\nI knelt so that Vell and Carrow would not burn. They did not. That is all I have to say for myself.\nIf there is ever a day when your word can be given again, give it to me, and I will break this oath across my knee.\nYour servant still, whatever this armour says,\nTavian' },
    { id: 'sewer-map', title: "Osric's chalk map", text: 'A map drawn in chalk on a slate: the grate on the quay (marked "LOCKED, BIG KEY"), a long line straight under the river ("HOT"), and at the end a circle marked "THE PIT - DON\'T". A second line runs from a cross labelled "CHURCH - BEHIND THE ALTAR".' },
  ],
  chapters: [
    {
      id: 'capital', title: 'The Last Night of the Empire', level: 20,
      summary: 'One huge battle-map: the siege lines, the broken wall, the burned lower city with the cult cathedral and the dragon-knights\' barracks, a river of molten slag, and the palace hill with its prison pit, chained silver dragon and the open-air throne at the top.',
      goal: 'Reach the throne before dawn and end Ysmerath, breaking as many anchors of her coronation (choir, silver dragon, Empress) on the way as you can.',
      map: burnedCapital,
      npcs: [
        { npc: 'pf_tcbrannoc', x: 40, y: 73 },
        { npc: 'pf_tcosric', x: 30, y: 54, hidden: true },
        { npc: 'pf_tccorisande', x: 10, y: 20, hidden: true },
        { npc: 'pf_tcroke', x: 58, y: 44, hidden: true },
        { npc: 'pf_tcaurivel', x: 27, y: 21 },
        { npc: 'pf_tcvharzen', x: 31, y: 18, hidden: true },
        { npc: 'pf_tcmott', x: 14, y: 45, hidden: true },
        { npc: 'pf_tcysmerath', x: 40, y: 7, hidden: true },
      ],
      scenes: [
        { room: 'Command post', title: 'The last council', read: 'The Marshal looks up from the map and taps the hill with a knife. "Eight bells until dawn," he says. "The army will get you through the wall. After that, it is up to you."', gm: 'Start the bell clock at 8. Give the orders and the choice of ways in: the Great Breach, the Ember Gate or the Sappers\' tunnel. Mention the three anchors and Roke.', handout: 'marshal-orders' },
        { room: 'The Great Breach', title: 'Through the wall', read: 'The wall comes down with a sound like the end of the world. Through the dust, giants made of coal and fire stride out to meet the charge, and the front rank of the army simply disappears.', encounter: 'Fire giants at the breach', gm: 'Open in action. Win fast and the army follows the heroes in. The Ember Gate and the Sappers\' tunnel are quieter ways (the gate has its own fight).' },
        { room: 'Ashfall Market', title: "The penitents' march", optional: true, encounter: "The penitents' march", gm: 'Forty citizens driven to the cathedral as the dawn offering. Free them and Osric\'s brother sends the heroes to Osric. A courier\'s body here carries Roke\'s unsent letter, taken from the general\'s desk by a cult spy.', handout: 'roke-letter', treasure: 'The arena master\'s purse: 1,500 gp and a potion of supreme healing.' },
        { room: 'Charred guildhall', title: 'The sewer-keeper', optional: true, gm: 'Osric offers the route under the slag river and the secret way into the cathedral crypt.', handout: 'sewer-map' },
        { room: 'Cathedral of the Burning Crown', title: 'The Cinder Choir', read: 'The note goes on and on, two hundred throats holding it, until it is inside your teeth. On the altar a reliquary blazes like a small sun, and a smiling man in a crown of nails spreads his arms. "Welcome, pilgrims. You are just in time to burn."', encounter: 'The Cinder Choir', gm: 'First anchor. Smash the Ember Reliquary, beat Mott and his priests, or unbind the rite (DC 22 Arcana, three successes). The adult red dragon on the roof drops in on round 2. The Vestry ledger holds the rite.', handout: 'coronation-rite', treasure: 'Mott\'s staff of fire and robe of the archmagi (red), the Ember Reliquary\'s gems (4,000 gp once cooled), a wand of fireballs in the Vestry.' },
        { room: 'Drill yard', title: 'The Scaled Oath', read: 'A grey-bearded general in red scale armour steps out in front of his knights and raises one hand. Behind him, the young dragons go quiet. "Before anyone dies," he says, "tell me who sent you."', encounter: 'Barracks of the Scaled Oath', gm: 'Turn Roke (the Empress, his letter or DC 18 Persuasion) and the Oath fights for the heroes: they take the honour guard and lend their dragons for a flight to the Broken Dome. Fight them and it is a hard, sad battle.', treasure: 'From the armory: a dragon slayer greatsword and two dragon-scale lances. Roke gives his own armour (plate armor of resistance, fire) to whoever saved the Empress.' },
        { room: 'Sewer under the slag', title: 'Under the river', optional: true, encounter: 'Salamanders in the steam', gm: 'The quiet way to the Prison Pit, with heat, boiling water and salamanders. Exhaustion saves each minute.' },
        { room: 'The Prison Pit', title: 'The Last Crown', read: 'The cage turns slowly on its chain. The woman inside it looks down at you, then past you, at the giant coming round the ledge. "Behind you," she says politely.', encounter: 'Jailers of the pit', gm: 'Third anchor. Free Empress Corisande and the coronation cannot finish at dawn. Freeing the hundreds of prisoners too costs a bell, but gives the army a second wave inside the walls.', treasure: 'The jailers\' strongbox: 2,000 gp, keys to every cell, and the Empress\'s signet ring (Roke kneels to it).' },
        { room: 'Courtyard of Chains', title: 'The Unburnt Offering', read: 'The silver dragon lifts her head as far as the chains allow and looks at you with one bright eye. "Oh, good," she says. "I was getting bored."', encounter: 'Wardens of the chained dragon', gm: 'Second anchor. Break three master-chains while Vharzen and his sister fight. Freed, Aurivel joins the fight at once. The servants\' stair is behind a secret panel here.', treasure: 'Vharzen\'s horn-rings: 3,000 gp of gold and a ring of free action.' },
        { room: 'Palace stairs', title: 'The stair of giants', read: 'The stair goes up and up, and on every landing a giant in gold-chased armour steps out to block it. Behind you the city is burning. Ahead of you the sky is starting to turn grey.', encounter: 'Honour guard of the stair', gm: 'The straight way up. If the Scaled Oath is with the heroes, the knights take half the giants. Skip this if the heroes go by the colonnade, the stump, the servants\' stair or the sky.' },
        { room: 'The Broken Dome', title: 'Wings over the dome', optional: true, encounter: 'Wings over the dome', gm: 'For flyers: a dogfight in the smoke over the palace. The heroes can also reach the throne from the east by the Fallen Spire, the Leaning Stump and the breach in the wall, with no fight at all if they are quiet (DC 20 Stealth).' },
        { room: 'The Throne of Cinders', title: 'The Coronation', read: 'She rises from the gold, and rises, and keeps rising, until she blots out half the sky. "Kneel," she says, "and I will give each of you a kingdom. Stand, and I will give each of you a grave. Either way, the sun is coming up."', encounter: 'The Coronation', gm: 'The final fight. Apply the anchors: choir (heals 20 a turn), Aurivel chained (3 more Legendary Resistances), Empress in the pit (coronation at dawn). She fights in the open sky and lands on her hoard. At a quarter of her hit points she bargains; if refused she fights to the death.', treasure: 'The hoard of an empire: 60,000 gp in coin, 25,000 gp in gems and art, a holy avenger, armor of invulnerability, a staff of the magi and a ring of three wishes with one wish left (she used the others on the conquest). Most of the gold belongs to the conquered kingdoms, and how the heroes share it out will shape the peace.' },
      ],
      wrapUp: 'The sun comes up over a free city. The army climbs the hill to find the heroes on the ruined throne, and someone, somewhere, starts to cheer.',
    },
  ],
  ending:
    'Win: Ysmerath is dead and the coronation broken. The twenty-three kingdoms send their heirs to Halcyra to ask for their crowns back, and the heroes find themselves deciding what the world looks like after the war: who rules the Empire, what happens to the Scaled Oath, whether Vharzen is hunted or bargained with. Empress Corisande, if she lived, offers each of them a lordship (most of them burned, all of them free). Lose: the sun touches the throne and Ysmerath is crowned. The army breaks. Any heroes still alive must flee with Aurivel and the Empress, if they saved them, and begin the long work of fighting a god. Next: a dragon this old does not die without an heir. Vharzen, if he lives, has his mother\'s hoard map in his head and a grudge in his heart, and the priests who survived the cathedral still pray at night, and some of them say that she answers.',
};
