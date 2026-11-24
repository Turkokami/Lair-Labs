// The Toll on Sabbath Mesa: a frontier one-shot for four heroes of level 5.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function sabbathMesa() {
  const b = new MapBuilder('adv-manticore-mesa', 'Ochre Gulch and Sabbath Mesa', 80, 80, { open: true, floor: 'dirt', ambient: 'dim', wallStyle: 'stone', theme: 'stone' });
  const r = rng(5150);
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // ---------- the shape of the mesa ----------
  // rimW/rimE: first rock row below the west mesa top / the east butte top. foot: first row of the flats below the cliffs.
  // gx(y): the middle of the Split, the gorge that cuts the mesa in two.
  const gx = (y: number) => 46 + Math.round(3 * Math.sin(y / 6));
  const rimW: number[] = [], rimE: number[] = [], foot: number[] = [];
  let a = 29, c = 21, f = 37, f2 = 39;
  for (let x = 0; x < 80; x++) {
    a = cl(a + Math.round((r() - 0.5) * 1.8), 28, 30);
    c = cl(c + Math.round((r() - 0.5) * 1.8), 20, 22);
    f = cl(f + Math.round((r() - 0.5) * 1.8), 36, 38);
    f2 = cl(f2 + Math.round((r() - 0.5) * 1.8), 38, 40);
    rimW.push(a); rimE.push(c); foot.push(x < 50 ? f : f2);
  }
  for (let x = 10; x <= 26; x++) { rimW[x] = 29; foot[x] = 37; }
  for (let x = 40; x <= 50; x++) foot[x] = 37;
  for (let x = 46; x <= 54; x++) rimE[x] = 21;
  for (let x = 55; x <= 61; x++) foot[x] = 39;

  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      if (y >= foot[x]) continue;
      const g = gx(y);
      if (y >= 2 && y <= 27 && Math.abs(x - g) <= 2) b.pit(x, y, 1, 1);
      else if (y >= 2 && x >= 3 && x < g - 2 && y < rimW[x]) b.floor(x, y, 1, 1, 'dirt');
      else if (y >= 2 && x > g + 2 && x <= 76 && y < rimE[x]) b.floor(x, y, 1, 1, 'dirt');
      else if (y >= 28 && Math.abs(x - g) <= 1) b.floor(x, y, 1, 1, 'sand');
      else b.rock(x, y, 1, 1);
    }
  // slickrock on the tops
  b.paint(4, 16, 9, 6, 'stone-flagstone-warm').paint(26, 3, 12, 5, 'stone-flagstone-warm').paint(58, 9, 14, 6, 'stone-flagstone-warm').paint(50, 15, 6, 5, 'stone-flagstone-warm');

  // ---------- the dry wash ----------
  const path: [number, number][] = [[45, 37], [45, 42], [42, 47], [38, 52], [35, 57], [32, 62], [29, 67], [27, 72], [26, 79]];
  const crossings: [number, number][] = [[44, 45], [36, 56], [31, 64], [27, 75]];
  const dSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };
  for (let y = 37; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      if (y < foot[x]) continue;
      let d = 99;
      for (let i = 0; i < path.length - 1; i++) d = Math.min(d, dSeg(x + 0.5, y + 0.5, path[i][0] + 0.5, path[i][1] + 0.5, path[i + 1][0] + 0.5, path[i + 1][1] + 0.5));
      if (d <= 2.3) b.floor(x, y, 1, 1, 'sand');
      else if (d <= 3.3) {
        const nearCross = crossings.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 3.6);
        if (nearCross) b.floor(x, y, 1, 1, 'dirt');
        else b.rock(x, y, 1, 1);
      }
    }
  b.rubble(43, 40, 3, 2).rubble(40, 49, 2, 2).rubble(28, 70, 2, 2);
  b.props_('boulder', [[44, 38], [41, 46], [37, 54], [30, 66], [26, 76]]).props_('boulder-large', [[46, 41], [33, 60]]).props_('skull-bleached', [[42, 48], [28, 73]]).prop('log-fallen', 39, 51, 60).prop('debris-wood', 35, 58);
  b.area('Upper wash', [[41, 37, 8, 10]], {
    read: 'The dry wash runs out of a crack in the mesa like a dead river. The sand is smooth and pale, and in one place it moves, very slightly, like something breathing under a blanket.',
    gm: 'A bulette lives under the soft sand here, drawn by the thump of the stamp mill. It surfaces under the first creature to cross the bed (DC 15 Perception to notice the sand shifting first). The cattle crossing at the south end is the safe way over. Old flood wrack and a mule\'s bones lie in the bed.',
    label: [45, 41],
  });
  b.encounter('Something under the sand', [41, 37, 9, 10], [['bulette', 1]], 'low');
  b.floor(32, 55, 9, 3, 'wood-planks');
  b.props_('mooring-post', [[32, 55], [40, 55], [32, 57], [40, 57]]);
  b.area('Plank bridge', [[32, 55, 9, 3]], {
    read: 'A bridge of nailed boards crosses the wash on stilts, wide enough for one ore wagon. Someone has painted a warning on the rail: WHEN IT RAINS, RUN.',
    gm: 'The only wagon crossing. It is 8 ft above the wash bed. Flash floods come down the wash from the Split without warning: if the heroes fight here in a storm, the bed is a death trap.',
    label: [36, 56],
  });
  b.pool(31, 64, 2.2, 1.6, false);
  b.mud(29, 62, 1, 3).mud(33, 64, 1, 2);
  b.props_('reeds', [[30, 62], [33, 66]]).prop('water-barrel', 34, 63).prop('cactus', 28, 66);
  b.area('The Seep', [[28, 61, 7, 6]], {
    read: 'In the bend of the wash a little spring bleeds out of the sand into a green pool no bigger than a wagon. Mule tracks, boot tracks and goat tracks crowd its edges.',
    gm: 'The only free water outside camp. Goat tracks, lots of them, lead from here north up the wash toward the Split and the mine (DC 12 Survival): the goats did not wander off, they were driven. A DC 14 Survival finds boot prints walking with them.',
    label: [31, 64],
  });

  // ---------- the switchbacks (route up, west) ----------
  b.floor(13, 35, 10, 1, 'stone-cobble').floor(13, 33, 10, 1, 'stone-cobble').floor(13, 31, 10, 1, 'stone-cobble');
  b.floor(13, 35, 2, 2, 'stone-cobble').floor(21, 33, 2, 3, 'stone-cobble').floor(13, 31, 2, 3, 'stone-cobble').floor(21, 29, 2, 3, 'stone-cobble');
  b.prop('stairs-up', 13, 36).prop('stairs-up', 22, 34).prop('stairs-up', 13, 32).prop('stairs-up', 22, 30).prop('crumbling-ledge', 17, 33).prop('crumbling-ledge', 18, 31).prop('chasm-edge', 16, 35).prop('bones', 20, 31).prop('cairn', 12, 37).prop('signpost', 15, 37);
  b.area('The switchbacks', [[12, 29, 12, 8]], {
    read: 'A mule trail zigzags up the cliff face, four turns of crumbling rock no wider than a cart. Halfway up, the wind starts to sing in the holes in the stone, and the song sounds almost like a woman\'s voice.',
    gm: 'The singing is real: six harpies nest in the rock holes and lure travellers to step off the edge. Charmed creatures walk toward the singer; on a trail this narrow, walking toward a harpy means walking off the cliff unless an ally grabs them (DC 12 Athletics). A fall from the top two runs is 40 ft (4d6). Fighting on the trail: one creature per square, no room to pass.',
    label: [18, 33],
  });
  b.encounter('The Singing Rocks', [11, 27, 14, 11], [['harpy', 6]], 'low');

  // ---------- the west mesa ----------
  b.area('Lookout cairn', [[8, 22, 16, 7]], {
    read: 'At the top of the trail the whole country opens up: the red flats, the camp\'s tin roofs, the stage road running east like a scratch. Across the Split, on the far butte, something big and winged is sunning itself.',
    gm: 'A good place to watch the butte. With a spyglass or a DC 14 Perception, the heroes see the manticore and, near it, a man moving about calmly: Tobias, the Feeder. Anyone who stays here an hour sees him lead two goats up from a ledge on the gorge side.',
    label: [16, 25],
  });
  b.prop('cairn', 20, 26).prop('tree-dead', 10, 24).prop('signpost', 22, 27).prop('boulder', 14, 23).prop('desert-rocks', 9, 27).prop('skull-bleached', 17, 27);

  // Fort Penitence: an old army post, roofless and half fallen
  b.paint(6, 5, 14, 10, 'stone-flagstone-warm');
  b.wallRun(5, 4, 6, 'n', 'low').wallRun(13, 4, 7, 'n', 'low').wallRun(5, 4, 5, 'w', 'low').wallRun(5, 11, 4, 'w', 'low');
  b.wallRun(19, 4, 4, 'e', 'low').wallRun(19, 10, 5, 'e', 'low').wallRun(5, 14, 6, 's', 'low').wallRun(14, 14, 6, 's', 'low');
  b.door(11, 14, 's', 'open').door(12, 14, 's', 'open');
  b.building("Commander's quarters", 7, 6, 5, 4, { mat: 'brick-floor', doors: [[9, 9, 's', 'open']],
    gm: 'Roof long gone. A cavalry officer\'s skeleton still sits at the desk, a saber across its knees. The desk drawer holds the post\'s last order: "Abandon Penitence. The thing on the mesa cannot be fought with what we have." Dated forty years ago: this is not the first manticore here.' });
  b.building('Powder magazine', 15, 6, 4, 4, { mat: 'stone-flagstone', doors: [[16, 9, 's', 'locked', 'door-iron']],
    gm: 'Stone-built and still whole. The iron door is rusted shut (DC 15 Strength or thieves\' tools). Inside: four kegs of blasting powder, dry as bone. A lit keg explodes at the start of its owner\'s next turn: 3d6 fire in a 10-ft radius, DC 13 Dexterity save for half. A keg dropped on a manticore\'s perch, or thrown into the Den, changes the climax.' });
  b.prop('skeleton-seated', 8, 7).prop('desk', 9, 7).prop('trunk', 10, 8).props_('barrel', [[16, 7], [17, 7], [16, 8], [17, 8]]).prop('banner-pole', 12, 11).prop('cannon', 7, 12, 90).prop('well', 15, 12).prop('wagon', 17, 12, 0, { v: 1 }).prop('rubble-pile', 6, 13).prop('column-fallen', 13, 6).prop('weapon-rack', 11, 7);
  b.area('Fort Penitence', [[5, 4, 15, 11]], {
    read: 'Mud-brick walls the colour of dried blood, melted down to waist height by forty years of rain. A cannon points at nothing. Pale things with too many legs move in the shade of the walls.',
    gm: 'An army post abandoned two generations ago, after the last manticore. Two giant scorpions den in the cool of the walls and fight anyone who comes inside. Worth the trip: the powder magazine and the commander\'s quarters. The gate faces south; the walls are 3 ft high and can be hopped.',
    label: [12, 10],
  });
  b.encounter('Scorpions of Fort Penitence', [5, 4, 15, 11], [['giantScorpion', 2]], 'low');

  // the hoodoo garden
  b.rock(24, 5, 2, 2).rock(30, 8, 1, 2).rock(34, 4, 2, 1).rock(27, 11, 2, 2).rock(38, 7, 1, 1).rock(33, 13, 2, 1).rock(22, 15, 1, 2);
  b.props_('standing-stone', [[26, 8], [32, 5], [36, 11], [24, 13]]).props_('boulder-large', [[29, 14], [37, 4]]).props_('caltrops', [[28, 6], [31, 11], [35, 8]]).props_('bones', [[30, 4], [25, 10]]).prop('pillar-broken', 39, 12).prop('tree-dead', 21, 4).prop('cactus', 33, 9);
  b.area('Hoodoo garden', [[21, 3, 19, 13]], {
    read: 'Stone pillars stand all over this part of the mesa like a crowd of tall, thin men in hats. The ground between them is studded with black spikes as long as your arm, driven into the rock.',
    gm: 'Old Sabbath\'s practice range: the spikes are manticore tail spikes (DC 12 Nature). Moving fast here is like crossing caltrops. The hoodoos give half cover against tail spikes from the air, which matters if the manticore spots the heroes crossing (it will stoop and fire two volleys, then fly home to warn the Feeder).',
    label: [30, 9],
  });

  // the surveyors' camp
  b.props_('tent', [[27, 19], [32, 20]]).prop('telescope', 34, 18).prop('campfire-cold', 29, 22).prop('skeleton-lying', 31, 23).prop('scroll-pile', 27, 21).prop('chest-open', 33, 22).prop('cart', 25, 24, 0, { v: 1 }).prop('bedroll', 30, 19).prop('debris-wood', 35, 24);
  b.area("Surveyors' camp", [[24, 17, 13, 9]], {
    read: 'Two canvas tents flap in the wind, slashed to ribbons. A brass instrument on three legs still points east. Beside a cold fire, what is left of a man lies face down, a black spike between his shoulders.',
    gm: 'The Iron Road survey party: three men, killed three weeks ago. The camp says it was a mauling, but a DC 13 Investigation finds the chief surveyor\'s case was opened with a key and his copy of the route survey taken; only a letter (handout) blew under the cart. Somebody came after the manticore.',
    label: [30, 21],
  });

  // the Split and the rope bridge
  b.floor(47, 12, 5, 1, 'wood-planks');
  b.props_('bridge-rope', [[48, 12], [50, 12]], 90).props_('mooring-post', [[46, 11], [46, 13], [52, 11], [52, 13]]).prop('rope-coil', 44, 12).prop('chasm-edge', 45, 8).prop('chasm-edge', 53, 16);
  b.area('Rope bridge', [[42, 10, 14, 5]], {
    read: 'A rope bridge sags across the Split, fifty feet of grey planks over a drop you cannot see the bottom of. The wind makes it creak and twist. On the far side, men are waiting with knives in their hands.',
    gm: 'The Feeder\'s ropemen hold the far end. If the heroes look like trouble, they start sawing the hand-ropes (each rope AC 11, 8 hp; the ropemen need 2 rounds per rope). Anyone on the bridge when the second rope goes makes a DC 14 Dexterity save to grab a plank and hang on; a fall is 120 ft into the Split (20d6, so do not let it happen without a save and a chance to be caught). Running on it: DC 12 Acrobatics or fall prone.',
    label: [49, 12],
  });
  b.area('The Split', [[43, 16, 7, 10]], {
    read: 'A crack in the mesa a hundred feet deep and thirty wide, its walls striped red and cream. Far down, the bottom is a ribbon of sand.',
    gm: 'Impassable without a long climb (DC 18 Athletics, 120 ft each way). Its floor runs south and drops out of the cliff as the dry fall into the slot canyon.',
    label: [45, 20],
  });
  b.encounter('Ropemen at the bridge', [50, 8, 7, 8], [['veteran', 1], ['scout', 4]], 'low');

  // the slot canyon, the dry fall and the miners' ladder
  b.floor(45, 28, 2, 1, 'stone-cobble');
  b.prop('ladder', 46, 28).props_('puddle', [[44, 33], [45, 35]]).prop('debris-wood', 43, 30).prop('skull-bleached', 44, 31);
  b.area('Slot canyon', [[42, 28, 5, 9]], {
    read: 'The wash narrows into a slot so tight you could touch both walls. The rock is carved into smooth waves by old floods. At the top end, a rotten ladder climbs a dry waterfall toward a ledge.',
    gm: 'A third way up. The miners\' ladder is forty years old: DC 12 Athletics to climb it, and on a 1-5 on a d20 a rung breaks (a fall of 20 ft, 2d6). It reaches the Gorge ledge. If it has rained on the mesa in the last hour, a flash flood comes down the slot: DC 14 Strength save or be swept into the Upper wash.',
    label: [43, 31],
  });

  // ---------- the gorge ledge (route up, east) ----------
  for (let y = 21; y <= 27; y++) {
    const x0 = Math.min(gx(y), gx(y - 1)) + 3, x1 = Math.max(gx(y), gx(y - 1)) + 3;
    b.floor(x0, y, x1 - x0 + 1, 1, 'stone-cobble');
  }
  b.prop('stairs-up', 48, 21).prop('crumbling-ledge', 47, 23).prop('chasm-edge', 46, 26).prop('bones', 47, 25);
  b.area('Gorge ledge', [[45, 21, 4, 7]], {
    read: 'A shelf of rock no wider than a doorway clings to the wall of the Split, with a hundred feet of nothing on your left. Goat droppings, fresh ones, cover it from end to end.',
    gm: 'The Feeder\'s goat road: from the mine tunnel and the miners\' ladder up to the butte top. Single file. A creature knocked prone here makes a DC 13 Dexterity save or goes over (they catch the edge on a DC 15 Athletics, otherwise 100 ft, 10d6).',
    label: [47, 24],
  });

  // ---------- the mine: Stroud No. 2 and the old Widow Jane workings ----------
  b.room('Main drift', 51, 34, 21, 2, {
    mat: 'cave-floor',
    read: 'A timbered tunnel runs east into the mesa, rails on the floor and lamps on hooks. The air is cool and smells of wet rock and lamp oil. Somewhere ahead, the timbers groan.',
    gm: 'Stroud\'s working drift, quiet at night. The shift boss\'s board at the adit lists the bulkhead to the old Widow Jane workings as "CONDEMNED: CAVE-IN". Fresh goat droppings between the rails say otherwise (DC 10 Perception).',
    label: [60, 34],
  });
  b.floor(57, 36, 2, 3, 'cave-floor');
  b.props_('mine-rails', [[53, 35], [55, 35], [57, 35], [59, 35], [61, 35], [63, 35], [65, 35], [67, 35], [57, 37], [57, 38]], 90).props_('mine-support', [[52, 34], [56, 34], [62, 34], [68, 34], [71, 34]]).prop('mine-cart', 66, 35).prop('lantern-hook', 58, 34).prop('lantern-hook', 69, 34).prop('notice-board', 58, 36);
  b.light(58, 34, 10, 15).light(69, 34, 5, 10);
  b.cave('Silver stope', 54, 30, 3.5, 2.6, {
    seed: 5161, mat: 'cave-floor',
    read: 'The drift opens into a chamber where the silver vein was chased up into the rock. Grey-white metal glints in the walls, and the floor is littered with broken ore.',
    gm: 'Stroud\'s richest stope. A DC 15 Perception (or anyone who knocks on the walls) finds a false timber wall in the north side: a secret door onto a crawlway that climbs to the ledge tunnel, bypassing the Widow Jane gang. Delphine\'s men use it to come and go unseen.',
  });
  b.floor(53, 25, 1, 4, 'cave-floor').floor(53, 32, 2, 2, 'cave-floor');
  b.props_('ore-pile', [[52, 31], [56, 29]]).prop('pickaxes', 54, 31).prop('cave-crystals', 56, 30).prop('mine-support', 53, 29).prop('mine-cart', 51, 30);
  b.light(55, 30, 5, 10, '#cfe3ff');
  b.floor(48, 24, 13, 1, 'cave-floor').floor(60, 24, 1, 3, 'cave-floor');
  b.door(53, 25, 'n', 'secret');
  b.area('Ledge tunnel', [[48, 23, 12, 2]], {
    read: 'A low tunnel, chipped through the rock by hand, slopes toward a slot of hard daylight. Wind whistles in from the gorge.',
    gm: 'The Widow Jane\'s old vent, reopened. It comes out on the Gorge ledge. A tripwire with a tin-can rattle is strung across it near the west end (DC 13 Perception); if it rattles, the ropemen on the butte are warned.',
    label: [54, 24],
  });
  b.prop('trap-tripwire', 50, 24, 0, { gm: true });
  b.cave('Widow Jane hideout', 65, 28, 6, 3.6, {
    seed: 5162, mat: 'cave-floor',
    read: 'Behind the "condemned" bulkhead the old workings are lit and lived in: bedrolls, a card game, a cookfire under a smoke crack. Goats bleat in a pen of mine timbers. Hard-faced people look up from their cards, and hands drift to belts.',
    gm: 'Jubal Cray and Delphine\'s claim-jumpers. They herd the goats up the ledge to the Feeder and paint the red hands on the marked claims. They know the heroes by sight if the heroes have already crossed Delphine. Jubal will deal if the fight goes badly: he sells out Delphine for his life and a head start (handout: his note from Delphine).',
  });
  b.floor(64, 30, 1, 4, 'cave-floor').door(64, 33, 's', 'locked', 'door-wood');
  b.props_('bedroll', [[61, 27], [62, 29], [68, 26], [69, 29]]).prop('table-cards', 65, 27).props_('stool', [[64, 27], [66, 27]]).prop('campfire', 66, 29).props_('fence-wood', [[61, 26], [62, 26]]).prop('hay-bale', 61, 26).prop('loot-sacks', 69, 28).prop('strongbox', 70, 27).prop('weapon-rack', 67, 25).prop('lantern-standing', 63, 28);
  b.light(66, 29, 10, 20, '#ff9a3c');
  b.encounter('The Widow Jane gang', [59, 24, 13, 9], [['banditCaptain', 1], ['veteran', 2], ['thug', 4], ['bandit', 4], ['mastiff', 2], ['scout', 1]], 'moderate');
  b.cave('Collapsed drift', 74, 31, 2.6, 3.6, {
    seed: 5163, mat: 'cave-floor',
    read: 'The end of the drift caved in last spring. Timbers lie snapped like kindling, and new tunnels, smooth and round as gun barrels, bore off through the rubble.',
    gm: 'Ankhegs dug in after the cave-in; three hunt here and have broken a hole out to the flats behind the tents. Acid-pitted rock and a dead miner\'s boots (DC 10 Medicine: acid, not claws, so not the manticore; the camp never knew the difference).',
  });
  b.floor(71, 34, 3, 1, 'cave-floor');
  b.tunnel([[74, 34], [75, 37], [75, foot[75]]], 2, { mat: 'cave-floor', seed: 5164 });
  b.props_('mine-support', [[73, 29], [75, 33]]).prop('rubble-pile', 74, 28).prop('skeleton-lying', 75, 31).prop('backpack', 73, 32);
  b.encounter('Ankhegs in the collapsed drift', [70, 26, 8, 13], [['ankheg', 3]], 'low');

  // ---------- the east butte: the Feeder and the lair ----------
  b.building("The Feeder's shack", 54, 3, 6, 5, {
    mat: 'wood-planks-dark',
    read: 'A shack of scavenged boards and tin. A heavy bag stuffed with sand hangs from the roof beam, its canvas split by punches. A silver belt buckle the size of a dinner plate hangs over the cot.',
    gm: 'Tobias Bledsoe lives here. The buckle reads "Heavyweight Champion of the Territories". Under the cot, in a tobacco tin: Delphine\'s letters, unsigned but in the same hand as the claims register (DC 12 Investigation to match them), and 90 gp.',
    doors: [[57, 7, 's']], windows: [[59, 5, 'e']],
  });
  b.prop('cot', 55, 4).prop('training-dummy', 57, 5).prop('stove', 58, 4).prop('trunk', 55, 6).prop('lantern-hanging', 56, 5).prop('water-barrel', 60, 8);
  b.light(56, 5, 5, 10);
  b.props_('hitching-post', [[51, 17], [53, 18]]).prop('wall-chains', 52, 17).prop('blood-pool', 52, 18).props_('bones', [[50, 16], [54, 19]]).prop('lantern-standing', 49, 19, 0, { off: true }).prop('hay-bale', 55, 16).prop('water-trough', 50, 14).prop('signpost', 49, 20);
  b.area('Feeding post', [[48, 14, 9, 7]], {
    read: 'Two posts are driven into the rock at the top of the ledge, hung with chains and goat-ropes. The rock around them is stained black. A lantern with a red glass stands on a pole, cold.',
    gm: 'Where the goats are staked out for Old Sabbath. The red lantern is lit on "toll nights": it tells the manticore to come here first and be fed light, then go down and eat at the claim marked with a red hand. The goats carry the Stroud company brand (Delphine bought them that way to point at Stroud), but the ropes are new livery rope (handout from Tadeo matches).',
    label: [52, 17],
  });
  b.rock(63, 2, 14, 7);
  b.cave('The Den', 70, 5, 4.5, 2.2, {
    seed: 5165, mat: 'cave-floor',
    read: 'Under an overhang of red rock, a hollow stinks of musk and old meat. Torn canvas, wagon covers and a miner\'s bedroll are trampled into a huge nest. Two pairs of eyes shine in the back.',
    gm: 'The manticores\' den. The camp only ever saw Old Sabbath. The Deacon, his mate, is younger and hungrier and does not talk. A keg of blasting powder thrown in here brings down the overhang: everything inside takes the blast and 2d10 bludgeoning, and the Den is sealed.',
  });
  b.floor(69, 7, 2, 3, 'cave-floor');
  b.props_('straw-bed', [[71, 5], [68, 4]]).prop('sails-pile', 70, 6).prop('bone-heap', 66, 5).prop('treasure-pile', 74, 4);
  b.rock(73, 14, 2, 3).rock(60, 15, 1, 2).rock(66, 18, 2, 1);
  b.props_('bone-heap', [[61, 11], [70, 16], [75, 12]]).prop('giant-ribcage', 65, 13).props_('skull-bleached', [[59, 10], [68, 11], [72, 19], [63, 18]]).prop('wagon', 62, 19, 30, { v: 1 }).prop('debris-wood', 64, 19).props_('caltrops', [[67, 15], [71, 11]]).prop('loot-sacks', 69, 13).prop('coins-small', 74, 18).prop('pickaxes', 60, 13).prop('standing-stone', 76, 16).prop('gm-treasure', 74, 4, 0, { gm: true });
  b.area('The Bone Yard', [[58, 9, 19, 12]], {
    read: 'The top of the butte is a field of bones. Mule skulls, cattle ribs, a whole wagon wheel, a man\'s boot. Silver glints everywhere: picks, pans, buckles, the things miners carry. On a pillar of rock above it all, a lion with a man\'s grey-bearded face licks its paws and looks at you like a preacher looking at his flock.',
    gm: 'The climax. Old Sabbath talks first: he is in no hurry, and curious. Tobias Bledsoe comes out to stand beside him, fists taped. The Deacon waits in the Den and attacks from behind once the fight starts. If the heroes show Old Sabbath that the red hands and the lantern are a leash (DC 15 Persuasion or Deception, advantage with Delphine\'s letters), he turns: he swears to eat Delphine and fly north, and only Tobias and his crew fight. Old Sabbath flies off at a third of his hit points; the Deacon fights to the death near the Den.',
    label: [66, 14],
  });
  b.encounter('The toll comes due', [58, 2, 19, 19], [['manticore', 2], ['gladiator', 1], ['thug', 5]], 'high');

  // ---------- the flats west of the wash ----------
  b.building('Quarles shack', 6, 41, 5, 4, { mat: 'wood-planks', doors: [[8, 44, 's']], windows: [[10, 42, 'e']],
    gm: 'Hetty Quarles\'s home: a cot, a stove, a rifle-rack with a heavy crossbow on it, and her partner Dag\'s empty hat on a nail.' });
  b.prop('cot', 7, 42).prop('stove', 9, 42).prop('weapon-rack', 7, 43).prop('coat-rack', 9, 43);
  b.props_('water-trough', [[13, 46], [14, 46], [15, 46], [16, 46]]).props_('signpost', [[4, 38], [22, 38], [4, 50], [22, 50]]).props_('ore-pile', [[18, 42], [19, 47]]).prop('pickaxes', 17, 44).prop('mine-cart', 20, 44).prop('tent', 12, 40).prop('campfire', 14, 43).prop('rope-coil', 11, 48).prop('crate-pile', 18, 49);
  b.light(14, 43, 10, 15);
  b.area('Quarles claim', [[4, 38, 19, 13]], {
    read: 'A sluice of hammered boards, a tent, a shack and four claim posts. On each post, someone has pressed a hand in red paint. A dwarf woman with a crossbow sits on an ore barrel facing the mesa, and she is not asleep.',
    gm: 'The last holdout on the railroad\'s line. The red hands went up this morning: by Delphine\'s plan, Old Sabbath eats here tomorrow night. Today, Delphine\'s regulator and three toughs come to "buy" the claim for 20 gp, with menace. They back off if the heroes make it plain it will cost them (DC 13 Intimidation) or if two of them drop. The paint is goat blood mixed with lamp black (DC 12 Medicine or Nature).',
    label: [13, 44],
  });
  b.encounter('Claim jumpers', [4, 38, 20, 13], [['veteran', 1], ['thug', 3]], 'low');
  b.paint(23, 47, 3, 10, 'sand').paint(12, 51, 3, 5, 'sand').paint(14, 55, 18, 2, 'sand').paint(18, 57, 3, 10, 'sand');
  b.building('Dutton cabin', 8, 55, 5, 4, { mat: 'wood-planks-dark', doors: [[12, 57, 'e', 'open']], windows: [[8, 56, 'w']],
    gm: 'Burned out. Black spikes are driven through the plank walls from outside. A DC 13 Investigation finds a smear of red on the door post: the old hand-print, half burned.' });
  b.props_('burning-wreckage', [[9, 56], [11, 57]]).prop('embers-ash', 10, 58).props_('debris-wood', [[14, 59], [6, 60]]).prop('water-trough', 15, 61).prop('broken-furniture', 16, 59).prop('skeleton-lying', 7, 62);
  b.area('Dutton claim', [[5, 53, 13, 11]], {
    read: 'A cabin burned to its sill logs. The sluice is smashed and the ground around it is pocked with holes the size of your fist.',
    gm: 'The Dutton brothers were taken a fortnight ago, the night after they refused Delphine\'s offer. Their claim was "abandoned" and re-filed the next morning by M. Pettibone and Associates (Delphine). Stroud bought it from the recorder a week later.',
    label: [11, 60],
  });
  b.props_('open-grave', [[8, 68], [10, 70]]).props_('burial-slab', [[12, 68], [14, 70], [8, 72], [12, 74], [15, 73]]).props_('cairn', [[6, 75], [17, 68]]).prop('tree-dead', 18, 75).prop('gibbet-post', 5, 67).prop('fence-gate', 11, 66).prop('flowers', 14, 68);
  b.area('Boot Hill', [[4, 66, 16, 11]], {
    read: 'Wooden markers lean every which way on a stony rise. Nine of them are new. Most of the graves are short, because there was not much to bury.',
    gm: 'Nine victims since spring. The undertaker kept the spikes pulled from the bodies in a coffee can on Doc\'s porch. The markers tell a story to anyone who reads them all (DC 11 Investigation): every miner taken had a claim, and every one had refused an offer from the recorder\'s office.',
    label: [11, 71],
  });
  b.props_('cactus', [[24, 40], [3, 52], [22, 63], [6, 79], [20, 78]]).props_('desert-rocks', [[25, 44], [2, 57], [21, 71]]).props_('tree-dead', [[26, 52], [3, 63]]).props_('boulder', [[15, 63], [23, 60]]);

  // ---------- Ochre Gulch: the camp ----------
  b.paint(41, 54, 39, 3, 'sand');
  b.paint(57, 39, 2, 2, 'sand');
  b.area('Main Street', [[40, 53, 40, 5]], {
    read: 'One street of false-fronted shacks, tents and tin, all of it the colour of the dust. The stamp mill thumps like a slow heart. Everyone outdoors keeps glancing up at the mesa, and nobody stands in the open for long.',
    gm: 'Ochre Gulch: three hundred miners, one street, one saloon. At sundown the manticore comes. Lamps go out early here, because lamp light draws it.',
    label: [60, 55],
  });
  b.props_('lamp-post', [[42, 53], [52, 57], [62, 53], [72, 57], [77, 53]]).prop('well', 60, 52).prop('hitching-post', 46, 57).prop('hitching-post', 66, 57).prop('water-trough', 47, 57).prop('horse-trough', 67, 53).prop('wagon', 74, 57).prop('gallows', 70, 67).prop('barrel-group', 57, 53).prop('notice-board', 64, 53);
  for (const [x, y] of [[42, 53], [52, 57], [62, 53], [72, 57], [77, 53]]) b.light(x, y, 10, 15);
  b.building('The Dry Spur', 47, 45, 10, 8, {
    mat: 'wood-planks',
    read: 'A long bar made of two wagon beds, a piano with three working keys, and a mirror shot through twice. Miners drink in silence. Over the bar hangs a pair of boxing gloves, tied by the laces.',
    gm: 'Rosalind Mayhew\'s saloon, the heart of camp gossip. The gloves were Tobias Bledsoe\'s; Roz thinks he was the manticore\'s first kill. Rooms upstairs 1 gp a night. The faro dealer will tell anyone for a drink that the recorder pays her toughs in assay scrip, not coin.',
    doors: [[51, 52, 's', 'open', 'door-double'], [52, 52, 's', 'open', 'door-double'], [56, 48, 'e']], windows: [[48, 52, 's'], [55, 52, 's']],
  });
  b.prop('bar-counter', 48, 46).prop('keg-rack', 48, 47).prop('harpsichord', 55, 46).props_('table-round', [[51, 48], [54, 49], [50, 50]]).props_('chair', [[52, 48], [53, 49], [49, 50], [51, 50]]).prop('table-cards', 53, 47).prop('stair-spiral', 55, 51).prop('mirror', 49, 45).prop('tavern-sign', 51, 53).prop('chandelier-wheel', 52, 49);
  b.light(51, 48, 15, 20);
  b.building('Stamp mill', 56, 41, 9, 8, {
    mat: 'wood-planks-dark',
    read: 'Five iron stamps rise and drop, rise and drop, crushing ore with a noise you feel in your teeth. Rails come out of the mine mouth straight into the mill.',
    gm: 'Stroud\'s mill runs day and night. The mine mouth (the adit of Stroud No. 2) is just north. The night shift boss, a nervous man, will let the heroes in for a word from Stroud or 5 gp.',
    doors: [[57, 41, 'n', 'open', 'door-double'], [58, 41, 'n', 'open', 'door-double'], [60, 48, 's']],
  });
  b.props_('anvil', [[58, 43], [60, 43], [62, 43]]).prop('ore-pile', 63, 46).prop('mine-cart', 57, 45).prop('workbench', 59, 47).prop('water-barrel', 63, 42).prop('tool-wall', 61, 46);
  b.light(60, 44, 10, 15, '#ff9a3c');
  b.building('Stroud Company office', 67, 42, 8, 9, {
    mat: 'wood-planks',
    read: 'The only painted building in camp: white, with STROUD SILVER CO. in gold over the door. Inside, a big man in a good coat stands at a window with a spyglass, watching the mesa.',
    gm: 'Cornelius Stroud\'s office and home. His deed book (handout) shows he bought three "abandoned" claims from the recorder\'s office this month. His safe (DC 18 thieves\' tools) holds 900 gp, the bounty money.',
    doors: [[70, 50, 's'], [67, 46, 'w']], windows: [[74, 44, 'e'], [70, 42, 'n']],
  });
  b.prop('desk', 70, 44).prop('chair-high-back', 70, 43).prop('safe', 73, 43).prop('map-cabinet', 68, 43).prop('telescope', 73, 45).prop('stair-spiral', 73, 49).prop('rug', 70, 47).prop('globe-stand', 68, 48);
  b.light(70, 44, 10, 15);
  b.props_('tent', [[76, 42], [77, 46], [76, 50]]).props_('bedroll', [[75, 44], [78, 48]]).prop('campfire', 77, 44).prop('sack', 75, 48).prop('pickaxes', 78, 51);
  b.light(77, 44, 10, 15);
  b.area('Tent row', [[75, 40, 5, 13]], {
    read: 'Canvas tents in a muddy row behind the office, guy-ropes crossing like spider webs. A hole has opened in the cliff-foot rubble behind them, round and dark.',
    gm: 'Where the poorest miners sleep. The hole is the ankhegs\' way out of the collapsed drift; two mules have gone down it this month and the camp blamed the manticore.',
    label: [76, 46],
  });
  b.building('Claims & Assay Office', 41, 58, 9, 9, {
    mat: 'wood-planks',
    read: 'A neat little office with a scale, an assay furnace and a wall of pigeonholes stuffed with deeds. Behind the counter, a woman in spectacles and ink-stained cuffs smiles at you like you are exactly who she hoped to see.',
    gm: 'Delphine Crake\'s office. She is friendly, quick and helpful: she offers a map of the mesa, the mine and "every route the beast takes". The back room is behind a secret door in the pigeonhole wall (DC 15 Perception; or watch Delphine go in). It holds the real claims register under the alias M. Pettibone, a stolen copy of the railroad route, pots of red paint mixed with goat blood, and 400 gp in assay scrip and coin.',
    doors: [[45, 58, 'n']], windows: [[43, 58, 'n'], [48, 58, 'n'], [41, 61, 'w']],
  });
  b.wallRun(41, 63, 9, 's').door(47, 63, 's', 'secret');
  b.area("Recorder's back room", [[41, 64, 9, 3]], { gm: 'Delphine\'s secret room: the M. Pettibone register, the railroad route, the red paint, the money. Enough to hang her in any court in the territory.', label: [45, 65] });
  b.prop('shop-counter', 44, 60).prop('scales', 42, 60).prop('forge', 48, 59).prop('bookshelf-tall', 47, 62).prop('desk', 43, 62).prop('chair', 44, 62).prop('map-cabinet', 41, 62).prop('strongbox', 48, 65).prop('scroll-pile', 42, 65).props_('pottery', [[44, 66], [45, 66]]).prop('gm-secret-door', 47, 63, 0, { gm: true }).prop('lantern-hanging', 45, 61);
  b.light(45, 61, 10, 15);
  b.building('General store', 52, 59, 7, 6, { mat: 'wood-planks', doors: [[55, 59, 'n']], windows: [[52, 61, 'w']],
    gm: 'Prices tripled since spring. Lamp oil 5 sp a flask, rope 2 gp, a spyglass 600 gp ("special price"). The storekeeper sells two potions of healing for 75 gp each.' });
  b.prop('shop-counter', 55, 61).props_('flour-sacks', [[53, 60], [57, 60]]).prop('barrel-stack', 53, 63).prop('produce-crates', 57, 63).prop('wall-shelves', 55, 63);
  b.building('Livery', 61, 58, 8, 7, {
    mat: 'wood-planks-dark',
    read: 'Mules stamp and blow in their stalls, eyes rolling at every shadow. A boy of about twelve, hat too big for him, is talking to them low and steady.',
    gm: 'Tadeo runs the livery for its drunk owner. His tally book (handout) shows fourteen goats sold to M. Pettibone since spring, paid in assay scrip, each sale a day before a killing.',
    doors: [[64, 58, 'n', 'open', 'door-double'], [65, 58, 'n', 'open', 'door-double'], [64, 64, 's']],
  });
  b.props_('hay-bale', [[62, 59], [67, 59]]).props_('water-trough', [[62, 62], [67, 62]]).prop('hitching-post', 66, 60).prop('cot', 67, 63).prop('sack', 62, 63);
  b.building('Jailhouse', 71, 58, 6, 5, { mat: 'stone-flagstone', doors: [[73, 58, 'n']], windows: [[76, 60, 'e']],
    gm: 'One cell, one desk, no marshal: the last one quit in spring. The key hangs on a nail. A good place to keep Delphine until the circuit judge comes.' });
  b.wallRun(74, 58, 5, 'w', 'bars').door(74, 61, 'w', 'locked', 'door-iron');
  b.prop('desk', 72, 59).prop('chair', 72, 60).prop('cot', 75, 59).prop('key-ring', 71, 61);
  b.wallRun(61, 67, 3, 'n', 'low').wallRun(66, 67, 12, 'n', 'low').wallRun(61, 67, 9, 'w', 'low').wallRun(61, 75, 17, 's', 'low').wallRun(77, 67, 9, 'e', 'low');
  b.door(64, 67, 'n', 'open').door(65, 67, 'n', 'open');
  b.props_('hay-bale', [[63, 70], [75, 73]]).prop('water-trough', 69, 69).prop('haystack', 74, 69).props_('hitching-post', [[66, 73], [71, 73]]);
  b.area('Corral', [[61, 67, 17, 9]], {
    read: 'A big corral of split rails holds the company mules. Half the pen is empty. The rails along the mesa side are snapped, and long gouges score the dirt.',
    gm: 'The manticore raided here twice. The gouges are wing-claw marks (DC 12 Survival): it landed, grabbed and was gone in seconds.',
    label: [69, 71],
  });
  b.props_('rubble-pile', [[40, 70], [47, 74], [54, 72]]).props_('ore-pile', [[42, 68], [50, 70]]).prop('mine-cart', 45, 71).props_('cactus', [[57, 77], [38, 76]]).prop('desert-rocks', 52, 76).prop('tree-dead', 59, 69);
  b.rubble(43, 72, 3, 2).rubble(49, 73, 3, 2);
  b.area('Tailings', [[38, 68, 21, 11]], {
    read: 'Grey heaps of crushed rock from the mill, as tall as houses, slump south of the street. Nothing grows on them.',
    gm: 'Good cover for a showdown, or for someone sneaking up on the assay office from behind.',
    label: [47, 73],
  });

  b.encounter('High noon', [38, 52, 16, 15], [['spy', 1], ['veteran', 3], ['thug', 4]], 'moderate');

  b.start(76, 54, 3, 3);
  b.note(78, 55, 'The stage road: the heroes arrive here, on the evening coach.');
  b.note(53, 25, 'Secret door: false timber wall from the Silver stope to the ledge tunnel.');
  b.note(47, 63, 'Secret door: the pigeonhole wall swings out into the recorder\'s back room.');
  b.note(46, 28, 'Miners\' ladder: third route up, from the slot canyon to the gorge ledge.');
  return b.build();
}

export const MANTICORE_MESA: Adventure = {
  id: 'manticore-mesa',
  title: 'The Toll on Sabbath Mesa',
  tagline: 'A manticore takes its toll from a desert silver camp, and somebody down in the camp is feeding it.',
  levels: '5',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['one-shot', 'western', 'wilderness', 'manticore', 'mystery'],
  pitch:
    'Ochre Gulch is a silver camp in the red-rock badlands, one dusty street at the foot of a mesa. Since spring, something lives on that mesa. It comes down at sundown on wings like a bat\'s, with a lion\'s body, a man\'s grey-bearded face and a tail that throws spikes like a volley of crossbow bolts. It takes a mule, a goat, a miner. Nine graves on Boot Hill. The camp boss has put five hundred gold on its head, and the evening coach has just set you down on Main Street as the sun touches the mesa.',
  secret:
    'Delphine Crake, the camp\'s claims recorder and assayer, is feeding the manticore and aiming it. She read the railroad surveyor\'s letter: the Iron Road will run through Ochre Gulch by spring and buy every claim on its line at ten times their worth. So she hired Tobias Bledsoe, a disgraced prizefighter who once fought the beast bare-handed and lived, to feed it goats on the butte, and taught it a signal: a red lantern on the mesa and a red hand on a claim post mean dinner, and nobody will come after you. When a miner who refused her offer is taken, his claim is "abandoned", and she re-files it under a false name, M. Pettibone, and sells some to the camp boss Cornelius Stroud to keep him greedy and make the camp suspect him. Her gang of claim-jumpers hides in the condemned Widow Jane workings and walks the goats up the gorge ledge. Why now: the last claim she needs, Hetty Quarles\'s, sits where the depot will be, and the red hands went up on Hetty\'s posts this morning. Tomorrow night, Old Sabbath eats there. What nobody knows: there are two manticores.',
  hooks: [
    'Cornelius Stroud, owner of the Stroud Silver Company, offers 500 gp for the beast\'s tail, and 100 gp up front because he is desperate, not generous.',
    'Hetty Quarles, a dwarf prospector, writes to an old friend of one of the heroes: "There\'s a red hand on my claim post and I know what it means. Come quick or come to my funeral."',
    'The heroes ride the evening stage into Ochre Gulch on other business, and the manticore comes for the coach horses before they have even climbed down.',
  ],
  tips: [
    'Play the western. Long silences, wind, the stamp mill thumping, a man who looks away when the recorder walks by. Give every NPC a hat, a habit and a gun-shy mule.',
    'Keep a clock: the heroes arrive at sundown. Tomorrow night, if nothing changes, Old Sabbath kills Hetty. Each trip up the mesa takes about two hours. Let them feel it.',
    'Three ways up the mesa: the Switchbacks (harpies), the mine (Widow Jane gang, or the secret door in the Silver stope), or the miners\' ladder in the slot canyon. All lead to the butte. The rope bridge only matters on the Switchbacks route.',
    'Manticores fly and throw tail spikes at 100 ft. Out in the open they are deadly; under cover (hoodoos, the shack, the wagon, the Den\'s overhang) they have to come close. Reward heroes who think about cover, nets and the blasting powder from Fort Penitence.',
    'Old Sabbath talks (manticores speak Common). He is vain and greedy, and he hates being led like a dog. Let a clever, bold party turn him against Delphine: that is as good a win as a kill, and Stroud still pays half the bounty if they can make him believe it (DC 15 Persuasion).',
    'For 3 heroes, take the Deacon out of the climax (it becomes moderate) and two thugs out of High noon. For 5, add a scout to the bridge and a veteran to High noon.',
  ],
  npcs: [
    {
      id: 'pf_mcmcornelius', name: 'Cornelius Stroud', title: 'camp boss, Stroud Silver Company', kind: 'npc', art: 'noble', monsterId: 'veteran', shared: true,
      wants: 'The beast dead, his mill running and his name off everybody\'s lips.',
      knows: 'The killings started in spring; nine dead; the beast prefers the claims outside his company. He has bought three abandoned claims from the recorder and thinks nothing of it.',
      voice: 'Booming, short-tempered, counts money out loud. Calls everyone "friend" like it is a threat.',
      appearance: 'A big, sunburned man in a good black coat gone grey with dust, gold watch chain, cavalry boots.',
      backstory: 'An old cavalry captain who struck silver and bought a town. He has never cheated a man on paper and never noticed one on paper cheating him.',
      gmNotes: 'Veteran stat block. Half the camp thinks he is behind the killings, because he profits. He is not. Shown the M. Pettibone register, he is ashamed and furious, gives back the claims if pushed (DC 14 Persuasion) and stands with the heroes at High noon.',
    },
    {
      id: 'pf_mcmdelphine', name: 'Delphine Crake', title: 'claims recorder and assayer', kind: 'npc', art: 'spy', monsterId: 'spy', shared: true,
      wants: 'The Quarles claim, the railroad\'s money, and to be gone east before anyone reads her books closely.',
      knows: 'Everything: every claim, every deed, every route up the mesa, the signal, the two manticores, the railroad line.',
      voice: 'Bright, warm and precise. Finishes your sentences. Says "of course" a great deal.',
      appearance: 'A small, neat woman in spectacles, ink on her cuffs, a pencil behind one ear and a derringer-sized knife in the other sleeve.',
      backstory: 'A lawyer\'s clerk who learned how land is really stolen: with paper. She came west to do it properly.',
      gmNotes: 'Spy stat block. She helps the heroes at first, eager to point them at the mesa (she hopes the manticore or Tobias kills them). When exposed she calls out the heroes onto Main Street with three hired regulators and four toughs (High noon), and runs for a horse when it goes badly. She surrenders if cornered and tries to bribe her way out (1,000 gp in railroad shares, worthless).',
    },
    {
      id: 'pf_mcmsabbath', name: 'Old Sabbath', title: 'the manticore of the mesa', kind: 'monster', art: 'manticore', monsterId: 'manticore', shared: true,
      wants: 'Meat, flattery and to never be made a fool of.',
      knows: 'The red lantern and the red hand mean an easy meal. The small ink-woman thinks she owns him. The big man feeds him and does not fear him, which he respects.',
      voice: 'A slow, rolling preacher\'s voice. Calls people "sinners" and his meals "the tithe". Quotes nothing, invents proverbs.',
      appearance: 'A lion the colour of the rock, with leathery wings, a scorpion-thick tail bristling with black spikes, and a man\'s face, old, bearded and smiling.',
      gmNotes: 'Manticore stat block with maximum hit points. He opens with tail spikes from the air and lands only on the wounded. He can be talked to, and turned (see the Bone Yard). Flies off at a third of his hit points.',
    },
    {
      id: 'pf_mcmtobias', name: 'Tobias Bledsoe', title: 'the Feeder, a disgraced prizefighter', kind: 'npc', art: 'gladiator', monsterId: 'gladiator',
      wants: 'To be left alone on the mesa with the only creature that never lied to him.',
      knows: 'Delphine pays him and tells him which nights to light the lantern. He knows about the red hands but tells himself it is the beast\'s business who it eats.',
      voice: 'Soft, slow, oddly gentle. Never raises his voice. Cracks his knuckles when he is thinking.',
      appearance: 'A huge man with a broken nose, scarred from shoulder to wrist by manticore spikes, hands taped like he is still in the ring.',
      backstory: 'Killed a man in a prize ring in the east and ran. Delphine hid him and sent him up the mesa. He fought Old Sabbath with his fists on the first night and lived, and the beast decided he was worth keeping. The camp thinks he was the first victim.',
      gmNotes: 'Gladiator stat block. If Rosalind is there, or the heroes bring his gloves and her word, he stops fighting (DC 13 Persuasion). Shown that the red hands are murders, not hunting, he turns on Delphine.',
    },
    {
      id: 'pf_mcmhetty', name: 'Hetty Quarles', title: 'prospector, the last holdout', kind: 'npc', art: 'dwarf-miner', monsterId: 'scout', shared: true,
      wants: 'To keep her claim, to live past tomorrow night, and to find out who took her partner Dag.',
      knows: 'The recorder offered her 20 gp for the claim three times. Every miner who refused that offer is on Boot Hill. She has seen men on the gorge ledge at dusk with goats.',
      voice: 'Gravel and vinegar. Talks to her crossbow. Spits before she says anything important.',
      appearance: 'A broad dwarf woman with a grey braid tucked into her belt, a heavy crossbow across her knees and a dead man\'s hat on her head.',
      gmNotes: 'Scout stat block (she shoots well). She will not leave her claim, so the heroes either guard it tomorrow night or end the threat first. She gives them a hand-drawn map of the Widow Jane workings: she worked them before the cave-in.',
    },
    {
      id: 'pf_mcmtadeo', name: 'Tadeo', title: 'mule-boy at the livery', kind: 'npc', art: 'child', shared: true,
      wants: 'For the mules to stop dying, and for someone to believe him.',
      knows: 'On every night someone was taken, a red light shone on the butte rim at dusk. He sold the goats to "Mister Pettibone\'s man" and was paid in assay scrip. He has seen a big scarred man in the dark on the gorge ledge.',
      voice: 'Fast and serious. Calls the heroes "señor" or "boss" and the mules by long, grand names.',
      appearance: 'A skinny twelve-year-old in a hat three sizes too big, with straw in his hair and a sling in his back pocket.',
      gmNotes: 'He has the livery tally book (handout). He will guide the heroes to the mine mouth or the slot canyon for a silver piece, and will not go further unless they forbid him to.',
    },
    {
      id: 'pf_mcmjubal', name: 'Jubal Cray', title: 'boss of the claim-jumpers', kind: 'npc', art: 'bandit-captain', monsterId: 'banditCaptain',
      wants: 'His cut, and to be out of the territory before the railroad brings law with it.',
      knows: 'Delphine pays him; the goats go up the ledge; the red hands are painted the night before; the Silver stope has a secret way to the ledge tunnel.',
      voice: 'Lazy drawl, chews a matchstick, laughs at the wrong moments.',
      appearance: 'A lean man in a long duster with silver conchos on his hatband, two knives and a hand crossbow on his hip.',
      gmNotes: 'Bandit captain stat block. He fights from behind his men and parleys when half of them are down. For his life and a horse he gives up Delphine\'s note (handout) and everything he knows.',
    },
    {
      id: 'pf_mcmrosalind', name: 'Rosalind Mayhew', title: 'owner of the Dry Spur saloon', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'Paying customers, a quiet night, and to know what really happened to Tobias.',
      knows: 'All the gossip: the recorder\'s toughs are paid in scrip; Stroud has bought dead men\'s claims; the first "victim", Tobias, left no body. The killings come on nights when the recorder works late.',
      voice: 'Husky, dry and kind, with a laugh like a dropped tray.',
      appearance: 'A tall woman in a green dress and a man\'s waistcoat, a shotgun-sized crossbow under the bar.',
      gmNotes: 'Tobias was her friend, maybe more. If she learns he is alive she rides up the mesa herself unless stopped; with her there, Tobias will not fight.',
    },
  ],
  handouts: [
    { id: 'bounty', title: 'Bounty poster', text: 'WANTED DEAD\nTHE BEAST OF SABBATH MESA\n500 GOLD for its TAIL, delivered to the Stroud Silver Co. office.\nPayment in COIN, not scrip.\n- C. Stroud, Proprietor\n\nN.B. Persons found stealing company mules will be hanged.' },
    { id: 'deeds', title: "Page from Stroud's deed book", text: 'Bought of M. Pettibone & Associates, through the Recorder\'s office:\nThe Dutton claim (abandoned) - 60 gp\nThe Blue Mule claim (abandoned) - 45 gp\nThe Lindgren claim (abandoned) - 80 gp\nRecorder\'s fee paid in full. D.C.' },
    { id: 'tally', title: 'Livery tally book', text: 'Goats sold to M. PETTIBONE (his man calls for them):\n2 - 14th\n2 - 21st\n3 - 2nd\n2 - 9th\n3 - 16th\n2 - yesterday\nPaid in assay scrip. (Mister says he likes goat stew. That is a LOT of stew. - T.)' },
    { id: 'delphine-note', title: "Note in Jubal's coat", text: 'J.\nRed hands on the Quarles posts Wednesday night. Tell T. to light the lamp Thursday and feed him light that morning so he is keen.\nAnd tell T. to stop giving the other one names. It is not a pet.\nBurn this.\n- D.' },
    { id: 'survey', title: "Surveyor's letter", text: 'To the Directors, Iron Road Company.\nThe line will pass through Ochre Gulch. Recommend the depot on the flat west of the wash (presently the Quarles claim). Every claim on the line to be purchased at ten times assay value, as agreed.\nThe local recorder, Miss Crake, has been most helpful and has asked for a copy of the route.\n- R. Telford, chief surveyor' },
  ],
  chapters: [
    {
      id: 'mesa', title: 'The Toll on Sabbath Mesa', level: 5,
      summary: 'A silver camp at the foot of a mesa, a manticore that takes a toll every few nights, and a recorder who points it at the claims she wants. One big map: the camp, the dry wash, three ways up the mesa, a rope bridge over the Split and the bone yard on the butte.',
      goal: 'Stop the killings before Old Sabbath takes Hetty Quarles tomorrow night, and find out who is feeding the beast.',
      map: sabbathMesa,
      npcs: [
        { npc: 'pf_mcmcornelius', x: 71, y: 45 },
        { npc: 'pf_mcmdelphine', x: 45, y: 60 },
        { npc: 'pf_mcmrosalind', x: 49, y: 47 },
        { npc: 'pf_mcmtadeo', x: 65, y: 61 },
        { npc: 'pf_mcmhetty', x: 15, y: 42 },
        { npc: 'pf_mcmjubal', x: 65, y: 28, hidden: true },
        { npc: 'pf_mcmtobias', x: 64, y: 12, hidden: true },
        { npc: 'pf_mcmsabbath', x: 70, y: 5, hidden: true },
      ],
      scenes: [
        {
          room: 'Main Street', title: 'The toll at sundown', handout: 'bounty',
          read: 'The coach rolls into camp as the sun touches the mesa, and every door on Main Street slams at once. A shadow slides over the dust, wide as a wagon. Then the screaming of the coach mules, a hiss like a hundred arrows, and something with a man\'s face laughs as it climbs away into the red sky with a mule in its claws.',
          gm: 'Start in action. Old Sabbath swoops on the coach team: one volley of tail spikes at the heroes (+5 to hit, 7 (1d8+3) piercing each, 3 spikes split as you like), then he grabs a mule and flies off toward the mesa. If the heroes hurt him badly he drops the mule and flees early. Afterwards, the bounty poster is nailed to every post.',
        },
        {
          room: 'Stroud Company office', title: "Stroud's bounty", handout: 'deeds',
          gm: 'Cornelius Stroud offers 500 gp for the tail and 100 gp up front. He shows his maps proudly, including his deed book: three claims bought from the recorder this month. Clever heroes notice the pattern: every claim was "abandoned" right after its owner was taken. Stroud bristles at the suggestion (DC 13 Insight: he honestly never thought about it).',
          treasure: '100 gp advance on the bounty.',
        },
        {
          room: 'The Dry Spur', title: 'Whiskey and rumours', handout: 'tally',
          read: 'Inside the Dry Spur, nobody is singing. A pair of boxing gloves hangs over the bar. A boy in a huge hat is waiting by the door, turning it in his hands.',
          gm: 'Rosalind Mayhew gives the gossip (see her profile). Tadeo pulls the heroes aside: he has seen the red light on the butte on every killing night, and he sold goats to M. Pettibone. If anyone asks the recorder\'s office, Delphine is charming and gives them a good map of the routes up the mesa (it is accurate: she wants them up there).',
        },
        {
          room: 'Quarles claim', title: 'Red hands on the claim posts', encounter: 'Claim jumpers',
          read: 'Four claim posts, four red hands, dripping. A regulator in a long coat leans on the sluice, with three toughs behind him, and tells the dwarf with the crossbow that twenty gold is a fair price for a dead woman\'s claim.',
          gm: 'Morning, day two. The claim-jumpers try one last "offer" before the beast comes. The heroes can face them down, fight, or bluff. A captured tough knows he is paid in assay scrip by "the Pettibone outfit" and that the goats go up through the Widow Jane. Hetty gives her map of the Widow Jane workings and tells them about the gorge ledge.',
          treasure: 'Hetty\'s thanks: a pouch of silver dust (50 gp) and the loan of her heavy crossbow. The regulator carries 30 gp in scrip.',
        },
        {
          room: 'Upper wash', title: 'Something under the sand', encounter: 'Something under the sand', optional: true,
          gm: 'Crossing the dry wash toward the slot canyon or the mine, the heroes meet the bulette. Avoid it by using the cattle crossing, or by noticing the sand (DC 15 Perception). The goat tracks from the Seep lead through here.',
        },
        {
          room: 'The switchbacks', title: 'The Singing Rocks', encounter: 'The Singing Rocks',
          read: 'Halfway up the trail the wind drops, and a woman\'s voice starts to sing from the rocks, sweet and close, calling you by name.',
          gm: 'Route one up the mesa. Six harpies on a trail one square wide. Charmed heroes walk toward the cliff edge; a friend can grab them (DC 12 Athletics). Earplugs, wax or cotton give advantage on the saves. From the Lookout cairn at the top, the heroes can watch the butte and spot Tobias.',
        },
        {
          room: 'Fort Penitence', title: 'Fort Penitence and the dead surveyors', encounter: 'Scorpions of Fort Penitence', optional: true, handout: 'survey',
          gm: 'Side trip on the west mesa. Two giant scorpions in the ruined fort; the powder magazine holds four kegs of blasting powder (see the area notes). Next door, the Surveyors\' camp gives up the letter that explains everything: the railroad, the depot on Hetty\'s claim, and Delphine\'s interest in the route.',
          treasure: 'Four kegs of blasting powder. The commander\'s +1 longsword (a cavalry saber). An army paychest under the cannon: 120 gp. The surveyors\' brass instruments (50 gp) and a spyglass.',
        },
        {
          room: 'Rope bridge', title: 'The bridge over the Split', encounter: 'Ropemen at the bridge',
          read: 'Halfway across the bridge it bucks under your feet. On the far side, a man with a saw is grinning at you.',
          gm: 'The Feeder\'s ropemen cut the bridge if they see the heroes coming (2 rounds per hand-rope). Quick heroes reach them first; a good shot at the man with the saw stops the cutting. If the bridge falls, the heroes need the ledge route instead.',
          treasure: 'The ropemen carry 45 gp and a potion of healing.',
        },
        {
          room: 'Widow Jane hideout', title: 'The Widow Jane', encounter: 'The Widow Jane gang', handout: 'delphine-note',
          read: 'The bulkhead says CONDEMNED in red paint. Behind it you hear goats, and cards slapping on a crate, and a man laughing.',
          gm: 'Route two up the mesa, through Stroud No. 2. Jubal Cray and his gang. With Hetty\'s map, the heroes know the Silver stope has a false wall onto the ledge tunnel (they can skip this fight entirely). Jubal parleys when half his people are down.',
          treasure: 'Jubal\'s strongbox: 220 gp in coin and silver bars, two potions of healing, a +1 hand crossbow. Delphine\'s note in his coat.',
        },
        {
          room: 'Collapsed drift', title: 'The collapsed drift', encounter: 'Ankhegs in the collapsed drift', optional: true,
          gm: 'A side tunnel off the main drift, or a hole behind the tents. Three ankhegs. Proof that some of the "manticore" deaths were not the manticore.',
          treasure: 'A dead prospector\'s pack: 60 gp, a stone of good luck (luckstone) and a nugget of native silver (100 gp).',
        },
        {
          room: 'The Bone Yard', title: 'The toll comes due', encounter: 'The toll comes due',
          read: 'The bones crunch under your boots. On a pillar of red rock, a lion with an old man\'s face smiles down at you. "Visitors," he says, in a voice like a Sunday sermon. "And not on the menu. How very irregular." Behind him, a huge scarred man steps out of a shack and starts taping his fists.',
          gm: 'The climax. First the Feeding post (red lantern, chains, Stroud-branded goats on new livery rope) and the Feeder\'s shack (Delphine\'s letters). Then Old Sabbath, who talks before he fights. Tobias and five of his crew stand with him; the Deacon bursts from the Den in round 2, the reveal that there were always two. Turning Old Sabbath or Tobias is possible (see their profiles and the area notes). Blasting powder in the Den ends the Deacon fast.',
          treasure: 'The bone yard: 340 gp in miners\' pokes and coins, two gems (50 gp each), a cloak of protection on a dead man, and a potion of greater healing. Each manticore tail is worth 500 gp bounty to Stroud (he pays once) and 50 gp to an alchemist. Tobias\'s silver champion\'s buckle (75 gp) and the tobacco tin with 90 gp and Delphine\'s letters.',
        },
        {
          room: 'Claims & Assay Office', title: 'High noon', encounter: 'High noon',
          read: 'The street empties like someone pulled a plug. Doors shut. The stamp mill stops. Down at the far end, outside the assay office, a small woman in spectacles stands with three men in long coats, and she calls your names, very politely.',
          gm: 'Back in camp with the proof (letters, the note, the tally, the register from the secret back room), the heroes face Delphine. She knows they know. She tries a speech first: she offers railroad shares, then threatens, then her regulators draw. Stroud, Hetty and Rosalind join the heroes if they were won over. Delphine runs for the livery when two regulators fall; a hero who catches her can bring her to the jail.',
          treasure: 'From the back room: 400 gp in coin and scrip, the true deeds of nine claims (Hetty and the families can have them back), and Delphine\'s +1 dagger. Stroud pays the bounty.',
        },
      ],
      wrapUp: 'With the manticores dead, fled or turned, and Delphine in the jail or in the dust, the killings stop. The red hands are scrubbed off the posts, and Hetty Quarles stays on her claim.',
    },
  ],
  ending:
    'Win: Old Sabbath is dead or flown north, the Deacon is dead, Delphine is jailed for the circuit judge and the stolen claims go back to the living. Stroud pays the bounty and, shamed, sells Hetty the Dutton claim for a dollar. When the railroad comes, Hetty\'s claim becomes the depot and she makes the heroes partners in it. Lose: Hetty dies tomorrow night, the claim is re-filed, and Delphine leaves on the first train east with the railroad\'s money and a reputation as the camp\'s angel. Next: if Old Sabbath flew away, he remembers who led him like a dog and who freed him. And in the Den, under the torn canvas, the heroes may find a manticore cub, which Tobias begs to keep.',
};
