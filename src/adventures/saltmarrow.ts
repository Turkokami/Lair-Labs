// The Drowned Bells of Saltmarrow: a three-part mini-campaign for four heroes, levels 2 to 4.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

// ---------- Part 1: the town ----------
function saltmarrowTown() {
  const b = new MapBuilder('adv-saltmarrow-town', 'Saltmarrow by night', 80, 60, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });
  // the sea, the beach and the quay
  b.water(0, 48, 80, 12, false).water(0, 52, 80, 8, true);
  b.paint(9, 45, 71, 3, 'sand');
  b.paint(9, 40, 71, 5, 'stone-cobble');
  // streets
  b.paint(9, 24, 71, 3, 'stone-cobble').paint(38, 0, 3, 44, 'stone-cobble').paint(9, 27, 3, 13, 'stone-cobble').paint(74, 4, 3, 36, 'dirt');
  // piers over the water
  b.floor(20, 45, 3, 11, 'wood-planks').floor(44, 45, 4, 13, 'wood-planks').floor(66, 45, 3, 9, 'wood-planks').floor(48, 55, 6, 2, 'wood-planks');
  // the cliff on the west, with the hidden sea-stair cut through it
  b.rock(0, 0, 9, 60).rock(9, 0, 71, 2);
  b.hall(8, 34, 4, 34, 1, { mat: 'cave-floor' }).hall(4, 34, 4, 50, 2, { mat: 'cave-floor' });
  b.room('Sea-cave mouth', 1, 50, 7, 6, { mat: 'cave-floor', read: 'Rough steps end in a dripping cave where the sea sucks and booms.', gm: 'The way into the Gullet (part 2). A small boat is tied here; fresh rope burns on the post.' });
  b.water(1, 54, 7, 2, true).prop('rowboat', 5, 52, 0).prop('mooring-post', 3, 51);
  b.note(4, 50, 'Part 2 starts here: the Gullet.');

  b.building('The Gull & Gallows', 12, 9, 16, 11, {
    mat: 'wood-planks',
    read: 'Warm light, wet coats and the smell of fish pie. Nobody is singing. Every few minutes someone glances at the black window that faces the sea.',
    gm: 'The inn. Innkeeper Dorrie Quill knows everyone: four fishers have walked into the sea in eight nights, and each heard bells first.',
    doors: [[19, 19, 's', 'closed'], [20, 19, 's', 'closed']], windows: [[14, 19, 's'], [25, 19, 's'], [27, 13, 'e']],
  });
  b.prop('bar-counter', 13, 10).prop('keg-rack', 13, 11).prop('fireplace', 22, 9).props_('table-round', [[15, 14], [18, 15], [22, 13], [25, 16]]).props_('chair', [[14, 14], [16, 14], [17, 15], [19, 15], [21, 13], [23, 13], [24, 16], [26, 16]]).prop('stair-spiral', 25, 10).prop('dartboard', 27, 17).prop('tavern-sign', 18, 20).light(22, 10, 20, 20).light(15, 14, 10, 15);
  b.building('Chapel of the Tide-Mother', 44, 6, 14, 14, {
    mat: 'marble',
    read: 'Whitewashed walls hung with fishing floats and knotted prayers. Above the altar, the bell rope hangs still: this chapel lost its bell eighty years ago.',
    gm: 'Old Brother Amos keeps the chapel. The sacristy chest holds a book of the drowned abbey\'s history (handout: the abbey record).',
    doors: [[50, 19, 's', 'closed', 'door-double'], [51, 19, 's', 'closed', 'door-double'], [57, 8, 'e', 'locked', 'door-wood']], windows: [[44, 10, 'w'], [44, 15, 'w'], [57, 14, 'e']],
  });
  b.prop('altar', 50, 7).props_('pew', [[46, 11], [46, 13], [46, 15], [53, 11], [53, 13], [53, 15]]).prop('font', 50, 17).props_('candelabra', [[47, 7], [53, 7]]).prop('chest', 56, 7).light(50, 8, 15, 20);
  b.building('Bell tower', 58, 3, 6, 6, { mat: 'stone-flagstone', gm: 'Empty. The rope hangs down from nothing. At night the heroes can hear the drowned bells clearly from the top.', doors: [[58, 7, 'w', 'closed']] });
  b.prop('ladder', 61, 4).prop('rope-coil', 60, 6);
  b.building('Bennet cottage', 64, 10, 8, 6, {
    read: 'A cold hearth, three small beds and a chair facing the sea.',
    gm: 'Mara Bennet\'s husband Joss walked into the waves four nights ago. Their daughter Pip heard him humming the bell tune. Mara gives the heroes his good knife if they bring news.',
    doors: [[67, 15, 's', 'closed']],
  });
  b.prop('hearth-oven', 65, 10).props_('bed', [[69, 11], [70, 11]]).prop('rocking-chair', 66, 13).prop('fishing-gear', 71, 14);
  b.building("Chandler's shop", 28, 4, 9, 7, { gm: 'Rope, lamp oil, tar and gossip. Prices doubled since the sleepwalkings.', doors: [[32, 10, 's', 'closed']] });
  b.prop('shop-counter', 29, 6).props_('crate', [[34, 5], [35, 5]]).prop('barrel-group', 34, 8).prop('rope-coil', 29, 9);

  b.building("Harbourmaster's office", 22, 31, 9, 7, {
    read: 'Ledgers, tide tables and a big chart of the bay pinned to the wall. One corner of the chart has been torn away.',
    gm: 'Harbour clerk Silas Wren works here. He tore the chart corner that shows the abbey shoals. His desk drawer is locked (DC 12): it holds a list of four names, all of them the drowned fishers, ticked off in pencil (handout).',
    doors: [[26, 37, 's', 'closed']], windows: [[22, 34, 'w']],
  });
  b.prop('desk', 25, 32).prop('chair', 26, 33).prop('map-cabinet', 29, 32).prop('notice-board', 23, 32).prop('lantern-hanging', 27, 35).light(27, 35, 10, 15);
  b.building("Widow Brack's net-loft", 9, 30, 10, 8, {
    mat: 'wood-planks-dark',
    read: 'Nets hang from the rafters like grey curtains. Floats, hooks and a cold stove. It smells of tar and something sweeter, like incense.',
    gm: 'The Quiet Tide meets here. Two thugs and two cultists guard it. A secret door in the west wall (DC 13 Perception, or follow the wet footprints) opens on the old smugglers\' stair down through the cliff.',
    doors: [[14, 37, 's', 'closed'], [9, 34, 'w', 'secret']],
  });
  b.prop('fishing-net', 11, 31).prop('fishing-net', 15, 31).prop('loom', 11, 34).prop('stove', 17, 35).prop('censer-hanging', 14, 33).prop('trunk', 16, 31).light(17, 35, 5, 10);
  b.encounter('Guards at the net-loft', [9, 30, 10, 8], [['thug', 2], ['cultist', 2]], 'low');
  b.building('Warehouse No. 3', 56, 29, 16, 10, {
    mat: 'wood-planks-dark',
    read: 'Cargo is stacked in a tall, dark warehouse. In a clearing between the crates, candles burn in a ring on the floor, and robed figures are singing very softly.',
    gm: 'Silas Wren (cult fanatic) and four cultists of the Quiet Tide. They are teaching a hypnotised fisher, Wil Harrow, the bell tune. If Silas drops below half his hit points he flees by the side door to a boat at the east pier.',
    doors: [[63, 38, 's', 'closed', 'door-double'], [64, 38, 's', 'closed', 'door-double'], [71, 33, 'e', 'closed']],
  });
  b.props_('cargo-crates', [[57, 30], [57, 32], [68, 30], [68, 36]]).props_('crate-stack', [[60, 30], [61, 30], [66, 37]]).prop('barrel-group', 58, 35).prop('magic-circle', 62, 32).props_('candles', [[61, 32], [65, 34]]).prop('cargo-hatch', 69, 33).light(63, 33, 10, 20, '#9fd3ff');
  b.encounter('The Quiet Tide sings', [57, 30, 14, 8], [['cult-fanatic', 1], ['cultist', 4]], 'moderate');

  // the fish market and the night pier
  b.props_('market-stall', [[24, 41], [28, 41], [32, 41]]).props_('fish-crate', [[27, 43], [31, 43], [35, 43]]).prop('produce-stall', 36, 41).props_('lamp-post', [[22, 40], [42, 40], [62, 40], [75, 40]]).props_('mooring-post', [[19, 50], [43, 52], [65, 50]]).prop('rowboat', 23, 50, 90).prop('fishing-net', 69, 47).props_('barrel', [[46, 45], [47, 46]]).prop('anchor', 50, 41).prop('well', 30, 20);
  for (const [x, y] of [[22, 40], [42, 40], [62, 40], [75, 40]]) b.light(x, y, 15, 20);
  b.area('Fish market', [[23, 40, 15, 5]], { read: 'Empty stalls and gull-picked fish heads. At the end of the long pier, a figure in a nightshirt is walking steadily toward the water.', gm: 'A sleepwalker (Wil\'s sister, Nell Harrow) walks toward the sea humming. Waking her takes a DC 12 Wisdom (Medicine or Insight) or a sharp slap; holding her takes DC 11 Athletics. She remembers bells and a woman\'s voice "under the green".', label: [30, 42] });
  b.area('The night pier', [[44, 45, 4, 13]], { read: 'The long pier creaks. Something big rolls under the black water, and pale shapes climb the ladder at the end.', gm: 'Five sahuagin come up to drag the sleepwalker under. They retreat into the sea when two are down.', label: [45, 50] });
  b.encounter('Sahuagin at the night pier', [43, 44, 8, 14], [['sahuagin', 5]], 'moderate');
  b.start(38, 26, 3, 3);
  return b.build();
}

// ---------- Part 2: the sea caves ----------
function theGullet() {
  const b = new MapBuilder('adv-saltmarrow-gullet', 'The Gullet', 80, 60, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor' });
  b.cave('Cave mouth', 9, 10, 7, 6, { seed: 3, read: 'The sea-stair ends in a cave that breathes: the sea pushes in, the air rushes out.', gm: 'Tide clock: every 30 minutes of play the water rises one step (see tips). Wet footprints and a dragged boat lead east.' });
  b.start(6, 9, 3, 3);
  b.tunnel([[13, 11], [20, 13]], 2, { seed: 4 });
  b.cave('Tide pools', 27, 15, 11, 8, { seed: 5, read: 'Pools of clear water glitter with anemones, crabs and drowned coins. In the deepest pool, something long and grey is coiled.', gm: 'The Eel-Mother (giant constrictor snake) and two giant frogs. The coins are real: 23 gp scattered in the shallows (one action each to grab a handful while she watches).' });
  b.pool(27, 16, 5, 3, true).pool(32, 12, 2, 1.5).pool(22, 19, 2, 1.5);
  b.props_('lily-pads', [[24, 13], [30, 19]]).prop('coins-small', 31, 13).prop('stalagmites', 20, 11);
  b.encounter('The Eel-Mother', [18, 8, 18, 15], [['giant-constrictor-snake', 1], ['giant-frog', 2]], 'low');
  b.tunnel([[35, 12], [42, 8]], 2, { seed: 6 });
  b.room("Smugglers' ledge", 42, 4, 12, 6, { mat: 'wood-planks', read: 'Someone built a wooden ledge along the cave wall long ago: hooks, a pulley, rotten crates and a fresh lantern.', gm: 'The cult\'s supply cache. Fresh food for twenty, and a map scratched on a crate lid showing the Bell Road (handout).' });
  b.props_('crate', [[43, 5], [44, 5], [52, 8]]).prop('winch', 47, 4).prop('lantern-hook', 50, 5).prop('supplies', 45, 8).prop('gear-pile', 53, 5).light(50, 5, 10, 15);
  b.tunnel([[54, 7], [60, 12]], 2, { seed: 7 });
  b.cave('Sahuagin camp', 64, 18, 13, 9, { seed: 8, read: 'Fish-scaled warriors squat around a fire of driftwood that burns green. A pool in the middle of the cave churns, and a fin cuts the surface.', gm: 'Six sahuagin and their hunter shark, in the pool. They are the hag\'s allies, paid in drowned silver. They fight to the death near the pool but flee if their shark dies.' });
  b.pool(65, 20, 4, 3, true);
  b.props_('campfire', [[60, 15]]).prop('bones-mud', 70, 14).prop('spear-rack', 72, 22).prop('loot-sacks', 58, 22).prop('fishing-net', 61, 24).light(60, 15, 10, 20, '#7cff9e');
  b.encounter('Sahuagin camp', [54, 11, 22, 15], [['sahuagin', 6], ['hunter-shark', 1]], 'moderate');
  b.tunnel([[30, 22], [33, 24]], 2, { seed: 17 });
  b.cave('Wreck grotto', 36, 26, 7, 5, { seed: 18, read: 'The broken half of a fishing boat lies wedged high on the rocks, where a storm tide threw it. Its name is still painted on the bow: the Joss & Mara.', gm: 'Joss Bennet\'s boat. In the cabin: his logbook. The last page says he heard bells under the boat three nights running, and that Silas Wren paid him to fish the abbey shoals. A loose plank hides his savings (25 gp).' });
  b.prop('rowboat', 36, 25, 30).prop('ship-mast', 35, 27).prop('ship-wheel', 37, 27).prop('crate', 40, 27).prop('anchor', 33, 28).prop('rope-coil', 38, 29);
  b.tunnel([[42, 27], [45, 29]], 2, { seed: 19 });
  // the low route: drowned shrine and glow-worm gallery
  b.tunnel([[9, 15], [12, 25], [16, 33]], 2, { seed: 9 });
  b.cave('Drowned shrine', 20, 38, 10, 7, { seed: 10, read: 'Barnacles crust a small fishers\' shrine cut into the rock. Figures in rotten oilskins stand in the water, facing the wall, swaying.', gm: 'Drowned fishers raised by the hag: six zombies and a ghoul. Joss Bennet is one of them: his knife is still on his belt. Laying them to rest is a mercy the town will remember.' });
  b.water(16, 39, 9, 4, false, true);
  b.prop('road-shrine', 20, 33).props_('candles', [[18, 34], [22, 34]]).prop('skeleton-seated', 25, 41).prop('fishing-net', 15, 37);
  b.encounter('The drowned fishers', [12, 32, 17, 12], [['zombie', 6], ['ghoul', 1]], 'low');
  b.tunnel([[27, 38], [35, 33], [44, 32]], 1, { seed: 11 });
  b.cave('Glow-worm gallery', 46, 30, 8, 5, { seed: 12, read: 'Thousands of tiny blue lights cover the ceiling like stars.', gm: 'Three darkmantles hang among the glow-worms. A narrow, quiet way to the cult hideout.' });
  b.prop('glowing-fungus', 46, 30).light(46, 30, 5, 20, '#86c7ff');
  b.encounter('Darkmantles', [41, 28, 10, 7], [['darkmantle', 3]], 'low');
  b.tunnel([[50, 32], [54, 36]], 1, { seed: 13 });
  // the cult hideout: carved rooms
  b.room('Cult dormitory', 52, 37, 10, 6, { mat: 'stone-flagstone', read: 'Hammocks hang from iron rings. Robes drip on pegs.', gm: 'Empty unless the alarm was raised. A diary under a hammock tells how Silas promised the cultists the abbey\'s silver.' });
  b.props_('hammock', [[53, 38], [55, 38], [57, 38], [59, 38]]).prop('footlocker', 60, 41).prop('coat-rack', 53, 41);
  b.room("Silas's study", 63, 37, 9, 6, { mat: 'wood-planks-dark', read: 'A desk, a cot and a portrait of a smiling woman, framed in shells.', gm: 'Silas\'s drowned wife, Elin. Silas believes the hag will give her back. His journal (handout) explains the bell tune and the new-moon deadline.' });
  b.hall(62, 39, 62, 39, 1).door(61, 39, 'e', 'closed').prop('writing-desk', 66, 38).prop('cot', 70, 39).prop('chest', 70, 41).prop('candles', 68, 38).light(68, 38, 5, 15);
  b.room('Ritual cave', 52, 45, 20, 9, { mat: 'cave-floor', read: 'A great bronze bell, green with age, hangs from a beam over a tide-pool. Cultists kneel in the water, and their leader raises a hammer.', gm: 'Silas Wren with four cultists and two thugs. This bell was hauled up from the abbey: each time it rings, someone in town sleepwalks. Silencing it (wrap it, or deal 20 damage to the yoke) stops the sleepwalking for a night. If Silas loses, he can be talked round by showing him what the hag did to the drowned fishers.' });
  b.hall(56, 43, 56, 44, 2).door(56, 42, 's', 'open').water(58, 49, 8, 3, false, true);
  b.prop('temple-bell', 61, 47).prop('cauldron', 55, 47).props_('candles', [[53, 46], [70, 46], [53, 52]]).prop('magic-circle', 60, 49).light(61, 47, 10, 20, '#9fd3ff');
  b.encounter('Silas and the bell', [52, 45, 20, 9], [['cult-fanatic', 1], ['cultist', 4], ['thug', 2]], 'moderate');
  b.tunnel([[71, 26], [73, 33], [70, 45]], 2, { seed: 14 });
  // the Bell Road out to the abbey, and the open sea mouth
  b.tunnel([[72, 53], [76, 56]], 2, { seed: 15 });
  b.room('The Bell Road', 74, 55, 6, 5, { mat: 'sand', read: 'At low tide a causeway of black rock rises from the sea, running toward a broken tower far out in the bay.', gm: 'The way to part 3. Only walkable for two hours at low tide.' });
  b.tunnel([[40, 58], [42, 50], [52, 50]], 2, { seed: 16 });
  b.water(36, 56, 10, 4, true);
  b.note(40, 58, 'Open sea mouth: a boat can come in here.');
  return b.build();
}

// ---------- Part 3: the drowned abbey ----------
function drownedAbbey() {
  const b = new MapBuilder('adv-saltmarrow-abbey', 'The Drowned Abbey', 80, 60, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });
  // the causeway and gatehouse
  b.room('Causeway', 0, 26, 10, 4, { mat: 'sand', read: 'The causeway ends at a gatehouse half eaten by the sea. Weed hangs from the arch like hair.', gm: 'Low tide lasts two hours: say so. After that, the causeway floods and the only way home is a boat or the great bell.' });
  b.water(0, 22, 10, 4, true).water(0, 30, 10, 4, true);
  b.start(1, 26, 3, 3);
  b.room('Gatehouse', 10, 23, 8, 10, { read: 'Two drowned guardhouses flank a broken portcullis.', gm: 'Six sahuagin watch the causeway from here. If one escapes, the bell tower is warned.' });
  b.prop('portcullis', 17, 27).props_('weapon-rack', [[11, 24], [11, 31]]).prop('barrel', 15, 31).rubble(12, 28, 2, 2);
  b.encounter('Gatehouse watch', [10, 23, 8, 10], [['sahuagin', 6]], 'low');
  b.door(17, 27, 'e', 'open', 'portcullis').door(17, 28, 'e', 'open', 'portcullis');
  // the cloister: a walk around a flooded garden
  b.room('Cloister walk', 18, 14, 26, 28, { read: 'A covered walk runs around a sunken garden. Sea water fills the garden like a pond, and statues of saints lean out of it.', gm: 'The drowned choir waits in the garden water: eight zombies and two ghouls who rise singing when anyone crosses.' });
  b.water(22, 18, 18, 20, false).water(26, 22, 10, 12, true);
  b.props_('statue-tall-robed', [[24, 20], [36, 20], [24, 34], [36, 34]]).props_('column-fluted', [[21, 17], [41, 17], [21, 39], [41, 39], [31, 17], [31, 39]]).prop('fountain', 30, 27);
  b.encounter('The drowned choir', [18, 14, 26, 28], [['zombie', 8], ['ghoul', 2]], 'low');
  // north range: scriptorium, chapter house, abbess's lodging
  b.room('Scriptorium', 18, 2, 14, 10, { mat: 'wood-planks-dark', read: 'Desks in rows, ink frozen in crusted pots, and paper pulped to grey sludge. One book on the abbess\'s lectern is perfectly dry.', gm: 'Two specters of copyist monks and a will-o\'-wisp drawn to the dry book. The book holds the Tide-Mother\'s Peal (handout), the true way to ring the great bell.' });
  b.hall(24, 12, 24, 13, 2).door(24, 11, 's', 'closed').door(25, 11, 's', 'closed');
  b.props_('writing-desk', [[20, 4], [23, 4], [26, 4], [20, 7], [23, 7], [26, 7]]).prop('lectern-dais', 29, 4).prop('library-stack', 19, 9).prop('scroll-rack', 29, 9).prop('levitating-tome', 30, 5);
  b.encounter('Copyists who never left', [18, 2, 14, 10], [['specter', 2], ['will-o-wisp', 1]], 'low');
  b.room('Chapter house', 34, 2, 12, 10, { mat: 'marble', read: 'A round-feeling room with stone benches all the way round, and a chair for the abbess.', gm: 'The ghost of Abbess Wenna sits in her chair. She is not hostile: she wants the bell rung right, and she knows the hag drowned the abbey on purpose.' });
  b.hall(39, 12, 39, 13, 2).door(39, 11, 's', 'closed', 'door-double').door(40, 11, 's', 'closed', 'door-double');
  b.props_('bench-long', [[35, 3], [42, 3], [35, 10], [42, 10]]).prop('throne', 40, 5).prop('candle-ring', 39, 7);
  b.room("Abbess's lodging", 48, 2, 10, 8, { mat: 'wood-planks', gm: 'Wenna\'s plain room. Under the bed: the reliquary of the abbey, with a ring of water breathing.' });
  b.door(46, 5, 'e', 'closed').hall(46, 5, 47, 5, 1).prop('bed', 56, 3).prop('reliquary', 55, 6).prop('prayer-kneeler', 50, 3).prop('wardrobe', 49, 8);
  // the church: a long flooded nave, aisles, and the bell tower at the east end
  b.door(43, 27, 'e', 'closed', 'door-double').door(43, 28, 'e', 'closed', 'door-double');
  b.room('Nave', 44, 20, 22, 16, { mat: 'marble', read: 'The great church is open to the sky where its roof fell in. Pews float. Tall windows of broken coloured glass throw green light on the water.', gm: 'Two ghasts and two ghouls hunt here, in the water of the aisles. The ghasts\' stench is worse in the closed side chapels.' });
  b.water(44, 20, 22, 3, false).water(44, 33, 22, 3, false);
  b.props_('pew', [[48, 24], [48, 26], [48, 30], [52, 24], [52, 26], [52, 30], [56, 24], [56, 26], [56, 30]]).props_('column-twisted', [[46, 23], [46, 32], [52, 23], [52, 32], [58, 23], [58, 32], [64, 23], [64, 32]]).prop('altar-reredos', 61, 26).props_('window-stained-tall', [[50, 20], [58, 20]]);
  b.encounter('Hunters in the nave', [44, 20, 22, 16], [['ghast', 2], ['ghoul', 2]], 'moderate');
  b.room('Lady chapel', 50, 37, 10, 7, { read: 'A small chapel full of shells laid in patterns by careful hands.', gm: 'Safe. Wenna\'s ghost can meet the party here to talk. A short rest is possible.' });
  b.hall(54, 36, 54, 36, 1).door(54, 35, 's', 'closed').prop('shrine', 54, 38).prop('candles', 52, 39).prop('offering-bowl', 57, 39).light(54, 38, 10, 15, '#ffe3a8');
  b.room('Bell tower', 66, 22, 12, 12, { mat: 'stone-flagstone', read: 'The tower is hollow to the sky. Eight bronze bells hang in a frame of black wood, and in the middle, the great bell. Beneath it, in a pool, a woman with green skin and long weed for hair smiles at you.', gm: 'The finale. Mother Brine (sea hag), two ghasts and four sahuagin. Ringing the great bell with the Tide-Mother\'s Peal (three DC 12 Strength checks, one per action, from the bell ropes) breaks her hold: the drowned stop, the sahuagin flee, and she must flee or fight alone.' });
  b.door(65, 27, 'e', 'open', 'door-double').door(65, 28, 'e', 'open', 'door-double');
  b.pool(72, 28, 3, 3, true);
  b.prop('temple-bell', 71, 24).props_('temple-bell', [[68, 24], [75, 24], [68, 31], [75, 31]]).prop('chains-hanging', 70, 30).prop('stair-spiral', 76, 23).light(72, 28, 10, 20, '#7cffc8');
  b.encounter('Mother Brine', [66, 22, 12, 12], [['sea-hag', 1], ['ghast', 2], ['sahuagin', 4]], 'high');
  // south range: refectory, dormitory, and the crypt
  b.room('Refectory', 18, 44, 16, 10, { mat: 'stone-flagstone', read: 'Long tables still set with pewter plates, all of them full of sand.', gm: 'Empty but for crabs and a few coins in the pantry. A good place to hide.' });
  b.hall(25, 42, 25, 43, 2).door(25, 41, 's', 'closed').door(26, 41, 's', 'closed');
  b.prop('feast-hall-table', 21, 47).prop('feast-hall-table', 26, 50).prop('hearth-grand', 29, 44).prop('shelf-jars', 19, 52).light(30, 45, 5, 10);
  b.room('Dormitory', 36, 44, 12, 10, { mat: 'wood-planks', gm: 'Rows of cots. A loose flagstone hides a sister\'s savings: 30 gp and a silver shell pendant (a charm against drowning: once, the wearer can breathe water for 1 minute).' });
  b.hall(34, 48, 35, 48, 1).door(36, 48, 'w', 'closed').props_('cot', [[38, 45], [40, 45], [42, 45], [44, 45], [38, 51], [40, 51], [42, 51], [44, 51]]);
  b.hall(48, 48, 56, 48, 2);
  b.room('Crypt of the abbesses', 56, 44, 16, 12, { mat: 'dungeon-slab', read: 'Dry, against all sense. Stone abbesses lie on their tombs with their hands folded. One tomb is open and empty.', gm: 'A wight (once the abbey\'s steward, who let the hag in) with two ghouls and four zombies. The steward wears the key to the bell frame. The empty tomb is Wenna\'s: her bones are under the bell tower pool, and laying them here lets her ghost rest.' });
  b.props_('sarcophagus-effigy', [[58, 46], [61, 46], [64, 46], [67, 46], [58, 52], [61, 52], [64, 52]]).prop('sarcophagus-open', 67, 52).props_('candle-stand-tall', [[70, 45], [70, 54]]);
  b.hall(60, 36, 60, 43, 1).door(60, 44, 'n', 'secret');
  b.encounter('The faithless steward', [56, 44, 16, 12], [['wight', 1], ['ghoul', 2], ['zombie', 4]], 'moderate');
  return b.build();
}

export const SALTMARROW: Adventure = {
  id: 'drowned-bells',
  title: 'The Drowned Bells of Saltmarrow',
  tagline: 'Church bells ring under the sea, and every night another fisher walks into the waves.',
  levels: '2-4',
  sessions: '3-4 sessions',
  players: '3-5 players',
  tags: ['mini-campaign', 'town', 'sea caves', 'cult', 'mystery', 'undead'],
  pitch:
    'Saltmarrow is a fishing town under tall grey cliffs. Out in the bay, the sea swallowed an abbey eighty years ago. Now, on still nights, its bells ring again under the water, and whoever hears them in their sleep gets up and walks into the sea. Four fishers are gone. Tonight, the bells are ringing.',
  secret:
    'Mother Brine, a sea hag, drowned the Abbey of the Tide-Mother eighty years ago with the help of its faithless steward. Last month a storm stripped the sand from the abbey\'s tower and she woke its bells. Each sleeper she calls becomes a drowned thrall in her choir. She needs thirteen: at the new moon (three nights away) the choir sings the sea up over the harbour and Saltmarrow becomes her kingdom. Silas Wren, the harbour clerk, leads a little cult called the Quiet Tide that serves her. He does it because she promised him his drowned wife back. She lied.',
  hooks: [
    'Dorrie Quill, who runs the Gull & Gallows, offers free rooms and 50 gp to whoever stops the sleepwalking.',
    'Mara Bennet wants to know what happened to her husband Joss, and will give his fine boat to whoever finds out.',
    'A hero hears the bells in their own sleep on the first night, and wakes up ankle deep in the surf.',
  ],
  tips: [
    'Part 1 is a mystery in an open town. Let the players go anywhere; every building has one clue, and every clue points to the warehouse, the net-loft or the sea-stair.',
    'Each night in town, someone sleepwalks. Saving them gives a clue; losing them adds one to the hag\'s choir. Keep count where the players can see it (13 is the end).',
    'Part 2 has a tide clock: every half hour of play, the water rises one step. At step 4 the low tunnels flood and the party must swim or wait.',
    'The cultists are scared townsfolk. Many will surrender or switch sides if shown the drowned fishers in the shrine.',
    'Part 3 has a two-hour low tide. Let the party plan: fight through the cloister, sneak by the scriptorium, or find the secret stair from the lady chapel to the crypt.',
    'Wenna\'s ghost is a reserve ally: use her to steer a lost party toward the scriptorium book or the crypt key.',
    'Level up between parts: 3 for the caves, 4 for the abbey.',
  ],
  npcs: [
    {
      id: 'pf_dorriequill', name: 'Dorrie Quill', title: 'keeper of the Gull & Gallows', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'Her town safe and her customers alive.', knows: 'The names of all four drowned fishers, and that Silas Wren has been strange since spring.',
      voice: 'Low and dry, never wastes a word, polishes the same glass the whole time.', appearance: 'A tall woman with salt-white hair in a thick braid and a sailor\'s tattoos on both forearms.',
    },
    {
      id: 'pf_marabennet', name: 'Mara Bennet', title: "a fisher's wife", kind: 'npc', art: 'farmer', shared: true,
      wants: 'The truth about Joss.', knows: 'Joss hummed a tune for three days before he went: the bell tune. Pip can hum it too.',
      voice: 'Quiet, steady, angry underneath.', appearance: 'Thin and sunburned, in a mended oilskin, with a gutting knife in her belt.',
    },
    {
      id: 'pf_silaswren', name: 'Silas Wren', title: 'harbour clerk, leader of the Quiet Tide', kind: 'npc', art: 'cult-fanatic', monsterId: 'cultFanatic',
      wants: 'His drowned wife Elin back.', knows: 'The bell tune, the hag\'s new-moon deadline, the Bell Road, and the sahuagin\'s camp.',
      voice: 'Polite clerk\'s voice that cracks when Elin is mentioned.', appearance: 'A neat, thin man in ink-stained cuffs, with a shell pendant he touches when he lies.',
      gmNotes: 'Cult fanatic stat block. Redeemable: show him the drowned fishers or the hag\'s lie and he switches sides in the abbey, giving the party one round of advantage against Mother Brine.',
    },
    {
      id: 'pf_brotheramos', name: 'Brother Amos', title: 'keeper of the chapel', kind: 'npc', art: 'priest', shared: true,
      wants: 'For someone young to finally believe the old stories.', knows: 'The abbey\'s history and the name of the Tide-Mother\'s Peal (but not the notes).',
      voice: 'Wanders off topic, then snaps back with something sharp.', appearance: 'A round old monk with a beard full of crumbs and a blackthorn stick.',
    },
    {
      id: 'pf_motherbrine', name: 'Mother Brine', title: 'the hag under the bay', kind: 'monster', art: 'sea-witch', monsterId: 'seaHag',
      wants: 'Thirteen drowned singers and a town to rule.', knows: 'Everyone\'s worst fear, and how to say it softly.',
      voice: 'Kind as a grandmother, with water gurgling under every word.', appearance: 'Green skin, weed hair, barnacled hands and a lovely smile. Her true face is worse.',
      gmNotes: 'Sea hag stat block. She opens with her horrific appearance, then hides in the pool. If the great bell is rung right, she loses her thralls and tries to bargain or flee into the sea (she will come back one day).',
    },
    {
      id: 'pf_abbesswenna', name: 'Abbess Wenna', title: 'ghost of the drowned abbey', kind: 'npc', art: 'ghost', monsterId: 'ghost',
      wants: 'The bell rung right, and her bones laid in her tomb.', knows: 'That the steward let the hag in, where the Peal is written, and that the great bell can break the hag\'s hold.',
      voice: 'Echoes, as if spoken in a big empty church. Kind but stern.', appearance: 'A tall woman in a habit, drifting a hand\'s breadth above the floor, dripping water that never lands.',
      gmNotes: 'Uses the ghost stat block if a fight ever happens, but she is an ally. She can possess a willing hero for one round to ring the great bell.',
    },
  ],
  handouts: [
    { id: 'abbey-record', title: 'From the chapel\'s old record', text: 'In the year of the long storm the Abbey of the Tide-Mother was lost to the sea, with all its sisters, in a single night. Some say the steward opened the sea-gate. The great bell was never found. On calm nights, men say, it can still be heard.' },
    { id: 'silas-list', title: 'A list from a locked drawer', text: 'Hal Morrow ✓\nTess Ruane ✓\nJoss Bennet ✓\nOld Cobb ✓\nWil Harrow\nNell Harrow\n... nine more needed by the dark of the moon.' },
    { id: 'crate-map', title: 'Scratched on a crate lid', text: 'A rough map: the sea caves, a cross marked "BELL", and a dotted line out across the bay to a tower, labelled "road — low water only — 2 hrs".' },
    { id: 'silas-journal', title: "From Silas Wren's journal", text: 'She says Elin sings with the others under the green. She says that when the thirteenth comes, at the dark of the moon, the sea will rise and the choir will walk out of it, and I will have my wife again. I only have to keep the bell ringing.' },
    { id: 'the-peal', title: "The Tide-Mother's Peal", text: 'Ring first the low bell, for the drowned.\nRing then the high bell, for the living.\nRing last the great bell, three times, for the Mother, and whatever the sea has taken, it shall give back to rest.' },
  ],
  chapters: [
    {
      id: 'town', title: 'Part 1: Saltmarrow by night', level: 2,
      summary: 'A night mystery in the town: sleepwalkers, a frightened inn, a cult in a warehouse and a secret stair down the cliff.',
      goal: 'Find out who is ringing the bells, and where.',
      map: saltmarrowTown,
      npcs: [
        { npc: 'pf_dorriequill', x: 14, y: 12 },
        { npc: 'pf_brotheramos', x: 50, y: 9 },
        { npc: 'pf_marabennet', x: 67, y: 12 },
        { npc: 'pf_silaswren', x: 62, y: 33, hidden: true },
      ],
      scenes: [
        { room: 'The Gull & Gallows', title: 'A quiet night at the inn', read: 'Rain on the windows, and every face turned to the sea. Then, very faint, a bell rings somewhere out in the dark water. A chair scrapes. Nobody breathes.', gm: 'Open here. Dorrie gives the hook. While they talk, the bells ring and Nell Harrow sleepwalks past the window toward the fish market.' },
        { room: 'Fish market', title: 'The sleepwalker', gm: 'Save Nell. Then the sahuagin come for her at the pier.' },
        { room: 'The night pier', title: 'Things climbing the ladder', encounter: 'Sahuagin at the night pier', gm: 'The first fight. One sahuagin carries a cult token (a shell on a black cord).' },
        { room: 'Chapel of the Tide-Mother', title: 'Brother Amos and the old record', gm: 'History and the name of the Peal.', handout: 'abbey-record' },
        { room: 'Bennet cottage', title: 'The Bennets', optional: true, gm: 'Grief and the bell tune. Pip can hum it.' },
        { room: "Harbourmaster's office", title: "Silas's desk", gm: 'The torn chart and the locked list.', handout: 'silas-list' },
        { room: "Widow Brack's net-loft", title: 'The net-loft', encounter: 'Guards at the net-loft', gm: 'Guards, incense and the secret door to the sea-stair.' },
        { room: 'Warehouse No. 3', title: 'The Quiet Tide sings', encounter: 'The Quiet Tide sings', gm: 'Silas teaches Wil the tune. He flees by boat if losing: that is fine, he waits in part 2.', treasure: '40 gp of cult dues, a potion of healing, shell tokens (the cult\'s sign).' },
        { room: 'Sea-cave mouth', title: 'Down the sea-stair', gm: 'End of part 1. Level up to 3.' },
      ],
      wrapUp: 'With Nell saved and the Quiet Tide broken in town, the trail leads down the cliff into the Gullet, where the bell is being rung. The heroes reach level 3.',
    },
    {
      id: 'gullet', title: 'Part 2: The Gullet', level: 3,
      summary: 'Sea caves under the cliffs: a tide that keeps rising, the hag\'s sahuagin allies, drowned fishers and the cult\'s hideout where the stolen abbey bell rings.',
      goal: 'Silence the bell and find the way to the drowned abbey.',
      map: theGullet,
      npcs: [{ npc: 'pf_silaswren', x: 60, y: 47, hidden: true }],
      scenes: [
        { room: 'Cave mouth', title: 'The breathing cave', gm: 'Start the tide clock.' },
        { room: 'Tide pools', title: 'The Eel-Mother', encounter: 'The Eel-Mother', gm: 'Greedy players get grabbed.', treasure: '23 gp in the shallows, a pearl (50 gp) in the deepest pool.' },
        { room: "Smugglers' ledge", title: 'The supply cache', gm: 'The map to the Bell Road.', handout: 'crate-map' },
        { room: 'Sahuagin camp', title: 'The sahuagin camp', encounter: 'Sahuagin camp', gm: 'The hardest fight of the part. Avoidable by the low route.', treasure: 'Drowned silver: 120 gp in old abbey coins, a +1 trident.' },
        { room: 'Drowned shrine', title: 'The drowned fishers', encounter: 'The drowned fishers', gm: 'Sad and frightening. Joss is here.', treasure: "Joss Bennet's fine knife (bring it home to Mara)." },
        { room: 'Glow-worm gallery', title: 'Under the stars', optional: true, encounter: 'Darkmantles', gm: 'The quiet way in.' },
        { room: "Silas's study", title: "Silas's study", gm: 'Why Silas does it, and the deadline.', handout: 'silas-journal' },
        { room: 'Ritual cave', title: 'Silas and the bell', encounter: 'Silas and the bell', gm: 'Silence the bell; break or save Silas.', treasure: 'Silas\'s shell pendant (the hag can see through it), 2 potions of healing, 60 gp.' },
        { room: 'The Bell Road', title: 'The Bell Road', gm: 'End of part 2. Level up to 4. Wait for low tide.' },
      ],
      wrapUp: 'The stolen bell is silent, but the drowned abbey still holds the great bell and Mother Brine herself. At low tide the Bell Road rises from the sea. The heroes reach level 4.',
    },
    {
      id: 'abbey', title: 'Part 3: The Drowned Abbey', level: 4,
      summary: 'A ruined abbey in the bay at low tide: a drowned choir, the copyists\' ghosts, a faithless steward in the crypt, and the hag in the bell tower.',
      goal: 'Ring the great bell the right way and drive out Mother Brine before the tide comes back.',
      map: drownedAbbey,
      npcs: [
        { npc: 'pf_abbesswenna', x: 40, y: 5 },
        { npc: 'pf_motherbrine', x: 72, y: 28, hidden: true },
      ],
      scenes: [
        { room: 'Causeway', title: 'Low tide', gm: 'Start the two-hour clock.' },
        { room: 'Gatehouse', title: 'The gatehouse watch', encounter: 'Gatehouse watch', gm: 'Stop runners or the tower is warned (the hag adds two ghouls).' },
        { room: 'Cloister walk', title: 'The drowned choir', encounter: 'The drowned choir', gm: 'They sing as they fight. Each round, one hero must make a DC 11 Wisdom save or lose their move walking toward the water.' },
        { room: 'Scriptorium', title: 'The dry book', encounter: 'Copyists who never left', gm: 'The Peal.', handout: 'the-peal', treasure: 'A spell scroll of Water Breathing, an ink-stone of fine jade (40 gp).' },
        { room: 'Chapter house', title: 'Abbess Wenna', gm: 'The ghost explains, and asks for her bones.' },
        { room: "Abbess's lodging", title: "The abbess's room", optional: true, gm: 'The reliquary.', treasure: 'A ring of water walking in the reliquary.' },
        { room: 'Nave', title: 'Hunters in the nave', encounter: 'Hunters in the nave', gm: 'Ghasts in the green light.' },
        { room: 'Lady chapel', title: 'The lady chapel', optional: true, gm: 'A safe place to rest, and the secret stair down to the crypt.' },
        { room: 'Crypt of the abbesses', title: 'The faithless steward', encounter: 'The faithless steward', gm: 'The bell-frame key.', treasure: 'Bell-frame key, the steward\'s purse (80 gp), a +1 shield with a shell on it.' },
        { room: 'Bell tower', title: 'Mother Brine', encounter: 'Mother Brine', gm: 'Ring the Peal while fighting. A great finale with three things to do at once: fight, ring, and keep out of the pool.', treasure: 'The hag\'s hoard under the pool: 400 gp in drowned coin, a pearl of power, the abbey\'s silver chalice (100 gp, Brother Amos weeps when he sees it).' },
      ],
      wrapUp: 'The great bell rings out over the bay, and every sleeper in Saltmarrow wakes up dry in bed. The drowned fishers come ashore at dawn, at peace. Saltmarrow names a bell after the heroes.',
    },
  ],
  ending:
    'Good ending: the Peal is rung, Mother Brine is gone (dead or fled), the drowned are laid to rest and Silas, if he lived, rebuilds the chapel bell tower. Bad ending: if the choir reaches thirteen, the sea rises over the harbour and the town must be abandoned; the heroes can still return to the abbey to break the spell, but now it is under water. Next: Mother Brine had sisters, and one of them keeps a lighthouse up the coast.',
};
