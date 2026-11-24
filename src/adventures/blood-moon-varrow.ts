// Blood Moon over Varrow: a two-part gothic horror adventure for four heroes of level 6.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

type Rect = [number, number, number, number];

/** Props scattered on plain ground in a rectangle, skipping water, mud, pits and the rects in `avoid`. */
function scatter(b: MapBuilder, r: () => number, kinds: string[], x: number, y: number, w: number, h: number, n: number, avoid: Rect[] = []) {
  let placed = 0;
  for (let tries = 0; placed < n && tries < n * 25; tries++) {
    const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h);
    if (b.cellAt(px, py) !== 1) continue;
    if (avoid.some(([ax, ay, aw, ah]) => px >= ax && py >= ay && px < ax + aw && py < ay + ah)) continue;
    b.prop(kinds[Math.floor(r() * kinds.length)], px, py, Math.floor(r() * 4) * 90);
    placed++;
  }
}

/** A stockade along grid lines through the corner points (closed loop), leaving out the squares in `gaps`. */
function palisade(b: MapBuilder, pts: [number, number][], gaps: string[]) {
  const skip = new Set(gaps);
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    if (y1 === y2) { for (let x = Math.min(x1, x2); x < Math.max(x1, x2); x++) if (!skip.has(`${x},${y1}`)) b.wall(x, y1, 'n'); }
    else for (let y = Math.min(y1, y2); y < Math.max(y1, y2); y++) if (!skip.has(`${x1},${y}`)) b.wall(x1, y, 'w');
  }
}

/** A fenced pen with low walls, open on one square of its east side. */
function pen(b: MapBuilder, x: number, y: number, w: number, h: number, gapY: number) {
  b.wallRun(x, y, w, 'n', 'low').wallRun(x, y + h - 1, w, 's', 'low').wallRun(x, y, h, 'w', 'low');
  for (let j = y; j < y + h; j++) if (j !== gapY) b.wall(x + w - 1, j, 'e', 'low');
}

const riverX = (y: number) => 64 + Math.round(2 * Math.sin(y / 9));

// ---------- Part 1: the village ----------
function varrow() {
  const b = new MapBuilder('adv-varrow-village', 'Varrow under the blood moon', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });
  const r = rng(6613);

  // the Skell river, with a ford in the south
  for (let y = 0; y < 80; y++) {
    const cx = riverX(y);
    b.water(cx - 2, y, 5, 1, false);
    if (y < 69 || y > 72) b.water(cx - 1, y, 3, 1, true);
  }
  // the millrace: out of the river above the mill, through the wheel pit, back below it
  b.water(55, 19, riverX(19) - 57, 1, true).water(55, 19, 1, 20, true).water(55, 38, riverX(38) - 57, 1, true);

  // roads and lanes
  b.paint(36, 0, 2, 32, 'dirt');
  b.paint(17, 24, 19, 2, 'dirt').paint(11, 24, 6, 2, 'dirt').paint(11, 26, 2, 4, 'dirt');
  b.paint(38, 43, 21, 2, 'dirt').paint(66, 43, 14, 2, 'dirt');
  b.paint(35, 44, 2, 6, 'dirt').paint(30, 63, 1, 5, 'dirt');
  b.floor(59, 43, 7, 2, 'wood-planks');

  // the stockade, with three gaps nobody has mended
  palisade(b, [[22, 15], [53, 15], [53, 22], [58, 22], [58, 36], [53, 36], [53, 58], [44, 58], [44, 63], [26, 63], [26, 57], [17, 57], [17, 24], [22, 24]],
    ['46,15', '47,15', '17,40', '17,41', '44,60', '44,61']);
  b.wall(55, 22, 'n', 'bars').wall(55, 36, 'n', 'bars');
  b.door(36, 15, 'n', 'closed', 'door-double').door(37, 15, 'n', 'closed', 'door-double');
  b.door(17, 25, 'w', 'closed');
  b.door(53, 43, 'w', 'closed', 'door-double').door(53, 44, 'w', 'closed', 'door-double');
  b.door(30, 63, 'n', 'secret');

  // ---------- outside, east: the road in and the witch-hunters' camp ----------
  b.area('River road', [[70, 42, 10, 4]], {
    read: 'The road bends out of the pines and you see Varrow at last: a ring of sharpened stakes, a sawmill on the river, smoke from a dozen chimneys. Above the trees the moon is rising. It is the colour of a fresh cut.',
    gm: 'The heroes arrive here at dusk on the first night of the blood moon. Across the bridge, someone on the stakes shouts for them to hurry: the gates close at the bell.',
    label: [75, 43],
  });
  b.start(76, 42, 3, 3);
  b.prop('milestone', 72, 42).prop('signpost', 70, 45);
  b.area("Witch-hunters' camp", [[67, 33, 12, 8]], {
    read: 'Three grey tents in a neat row, horses on a picket line, and a lantern on a pole that is never allowed to go out. An iron cage stands empty on a cart, waiting.',
    gm: 'Captain Crane camps here from the second morning; he will not sleep inside "a village that hides the beast". His chaplain keeps the lantern lit. The cage is for whoever he decides is guilty. Searching his tent (DC 15 Stealth to get in unseen) finds his writ (handout) and a locked case of 40 silvered crossbow bolts.',
    label: [72, 37],
  });
  b.prop('tent-command', 72, 35).props_('tent', [[69, 35], [75, 35]]).prop('campfire', 72, 38).prop('banner-pole', 70, 38).prop('lantern-standing', 74, 38)
    .prop('cage', 77, 38).prop('hitching-post', 68, 40).prop('weapon-rack', 76, 35).prop('bedroll', 69, 39).prop('supplies', 75, 39);
  b.light(72, 38, 15, 20).light(74, 38, 10, 15, '#ffe6a0');
  b.area('Plank bridge', [[58, 43, 8, 2]], { read: 'A plank bridge on tarred piles crosses the Skell, which runs black and fast underneath.', gm: 'The only dry crossing. Deep water on both sides (DC 13 Athletics to swim against the current).', label: [61, 43] });
  b.prop('lantern-standing', 58, 45).light(58, 45, 10, 15);

  // ---------- outside, north: the Old Fang Road, the logging cut, the charcoal clearing, the log boom ----------
  b.area('Old Fang Road', [[34, 0, 6, 14]], {
    read: 'A rutted logging road runs north from the gate into pines so tall and close that the moonlight hardly reaches the ground.',
    gm: 'The way to the deep wood and the Grey Mother\'s shrine, a few hours north by night (Part 2 starts here). Wolf tracks cross it every few yards. A DC 14 Survival sees that the big tracks go both ways: out to the forest and back to the village.',
    label: [37, 6],
  });
  b.prop('road-shrine', 34, 9).prop('milestone', 38, 3).prop('lamp-post', 35, 13).light(35, 13, 10, 15);
  b.note(37, 1, 'Part 2 starts up this road: the deep wood and the Grey Mother\'s shrine.');
  b.area('Logging cut', [[2, 2, 18, 11]], {
    read: 'A hillside of stumps, raw and pale in the red light. A felled pine lies half-trimmed where the crew dropped their axes and ran.',
    gm: 'The loggers fled this cut a week ago when Bror, in wolf shape, watched them from the trees all afternoon. A DC 13 Investigation finds a torn blue wool cuff on a branch: the same cloth as the Vossmark family coats.',
    label: [10, 7],
  });
  scatter(b, r, ['stump', 'stump', 'stump', 'log-pile', 'ferns'], 2, 2, 18, 11, 26);
  b.prop('sawhorse', 8, 6).prop('log-fallen', 12, 8, 90).prop('cart', 5, 10).prop('tool-crate', 9, 9).prop('pickaxes', 14, 5);
  b.area('Charcoal clearing', [[40, 2, 13, 9]], {
    read: 'Turf-covered charcoal mounds smoke gently in a ring, like sleeping animals. The burners\' huts are empty and their supper is still in the pot.',
    gm: 'A good place to watch the north wall unseen. The woodpile gap in the stakes is right behind it. A DC 12 Survival finds where something big lay in the warm ash and watched the village.',
    label: [46, 6],
  });
  b.paint(41, 3, 11, 7, 'dirt');
  b.props_('embers-ash', [[42, 4], [46, 4], [50, 5], [44, 8]]).prop('lean-to', 49, 8).prop('cooking-pot-fire', 47, 7).prop('firewood', 42, 7).prop('handcart', 51, 3);
  b.area('Woodpile gap', [[44, 14, 5, 3]], { read: 'Here the stakes have been pulled down and a stack of firewood piled in the gap instead. The wood has been knocked aside.', gm: 'An easy way in for anything that jumps (DC 10 Athletics). Fresh claw marks on the logs.', label: [46, 15] });
  b.props_('log-pile', [[44, 16], [48, 16]]);
  b.area('Log boom', [[57, 6, 14, 8]], {
    read: 'A chain of logs strung across the river holds back a jam of floating timber, waiting for the mill. The logs knock together like slow drums.',
    gm: 'Walking the boom is a DC 12 Acrobatics. A wolf can cross the river here without swimming, and the pack does. Henrik\'s bloody shirt is snagged under a log (DC 14 Perception): the mill foreman\'s initials are stitched in the collar.',
    label: [63, 9],
  });
  b.props_('log-fallen', [[61, 8], [63, 9], [65, 10], [62, 11]], 90).props_('mooring-post', [[59, 7], [68, 12]]).prop('rope-coil', 58, 12);

  // ---------- outside, west: Orrin's cabin ----------
  b.building("Orrin's cabin", 4, 26, 7, 7, {
    mat: 'wood-planks-dark',
    read: 'One room, dark and close. Wolf skins on the floor, wolf skins on the bed, a wolf skull over the hearth. Bunches of purple flowers hang drying from every beam, and the place smells bitter.',
    gm: 'Everything here looks guilty and none of it is. The purple flowers are wolfsbane. Under the bed (DC 12 Investigation) a strongbox holds 20 silvered arrows and two silver-headed spears; on the table is his journal (handout). The skull is from a wolf Orrin killed eleven years ago, the last time the moon went red.',
    doors: [[10, 29, 'e', 'closed']],
    windows: [[7, 26, 'n'], [4, 29, 'w']],
  });
  b.prop('bed', 5, 27).prop('rug-pelt', 7, 29).prop('fireplace', 5, 32).prop('kitchen-table', 8, 30).prop('stool', 9, 30).prop('herbs-drying', 9, 27).prop('weapon-rack', 6, 27).prop('strongbox', 4, 27, 0, { gm: true }).prop('lantern-hook', 7, 31);
  b.light(5, 31, 10, 15);
  b.area('Wolfsbane garden', [[3, 34, 8, 6]], {
    read: 'Rows of tall purple flowers with hooded heads, nodding behind a split-rail fence. Nothing else grows here, not even weeds.',
    gm: 'Wolfsbane, enough for twelve bundles. Picked with bare hands it stings (1 poison damage). See the tips for what it does. The villagers say Orrin "grows poison", which is true.',
    label: [6, 36],
  });
  b.paint(3, 34, 8, 6, 'dirt');
  b.props_('crop-rows', [[4, 35], [4, 37], [8, 35], [8, 37]]).props_('flowers', [[6, 38], [9, 39]]).props_('fence-wood', [[3, 39], [10, 34]], 90).prop('beehive', 3, 34);
  b.area('Hide racks', [[12, 26, 4, 6]], {
    read: 'Wooden frames strung with stretched hides. Behind them, three fresh graves no bigger than a dog.',
    gm: 'Orrin\'s dogs, killed a week ago by the great grey wolf. A DC 13 Medicine on the hides shows they are old; nothing here was killed this month.',
    label: [13, 28],
  });
  b.props_('rug-pelt', [[12, 27], [14, 27]]).props_('open-grave', [[12, 30], [14, 30]]).prop('cage', 15, 29).prop('campfire-cold', 13, 31);
  b.building('Smokehouse', 2, 20, 4, 4, { mat: 'dirt', read: 'Smoke-black walls and strips of venison hanging on hooks.', gm: 'Venison only. A thrown haunch makes ordinary wolves forget the heroes for a round.', doors: [[4, 23, 's', 'closed']] });
  b.props_('chains-hanging', [[3, 21], [4, 21]]);
  b.encounter('The mob', [2, 24, 14, 16], [['berserker', 2], ['thug', 6]], 'low');

  // ---------- inside the stakes ----------
  b.area('North gate', [[33, 14, 8, 4]], {
    read: 'Two leaves of split logs on iron hinges, a ladder to a firing step, and an old woman with a spear who looks at you as if you might be the thing she is waiting for.',
    gm: 'Barred at the evening bell. Two watchers stand here each night (commoners). Anyone coming back after dark is checked for bites.',
    label: [36, 16],
  });
  b.props_('brazier', [[35, 16], [38, 16]]).prop('ladder', 34, 16).prop('spear-rack', 39, 17);
  b.light(35, 16, 10, 15).light(38, 16, 10, 15);
  b.area('River gate', [[50, 42, 6, 4]], { read: 'A low double gate faces the bridge. A bell hangs over it on a post.', gm: 'Where the heroes come in. Mattias meets them here with a lantern.', label: [51, 44] });
  b.prop('temple-bell', 51, 42).prop('torch-standing', 52, 45).light(52, 45, 10, 15);

  b.building('The Split Log', 23, 16, 10, 7, {
    mat: 'wood-planks',
    read: 'Low beams, a long bar made of one split pine, and a fire you could roast a deer on. Loggers drink in silence with their axes on the tables. Every head turns when the door opens.',
    gm: 'The tavern. Maud Brask serves, listens and tells the heroes the rumours (see the tavern scene). The notice on the door is the council\'s (handout). Rooms upstairs cost 5 sp a night.',
    doors: [[32, 19, 'e', 'closed'], [27, 22, 's', 'closed']],
    windows: [[29, 16, 'n'], [32, 17, 'e']],
  });
  b.wallRun(23, 18, 3, 's').wallRun(25, 16, 3, 'e').door(25, 17, 'e', 'closed');
  b.area("Maud's back room", [[23, 16, 3, 3]], { read: 'A narrow bed, a man\'s boots still by it, and a shelf of polished silver spoons.', gm: 'Maud\'s silver: thirty spoons and a christening cup, about 120 gp of silver. She will give it for the silvering if the heroes are honest with her.' });
  b.prop('bed', 23, 16).prop('shelf-jars', 25, 16).prop('chest', 24, 17);
  b.prop('bar-counter', 29, 17, 90).prop('keg-rack', 31, 17).prop('fireplace', 24, 21).props_('table-round', [[27, 20], [30, 21]]).props_('stool', [[26, 20], [28, 20], [29, 21], [31, 21]]).prop('notice-board', 32, 20).prop('dartboard', 26, 19).prop('stair-spiral', 31, 19).prop('rug-pelt', 25, 21);
  b.light(24, 21, 15, 20).light(29, 19, 10, 15);

  b.building('Brask forge', 28, 27, 6, 5, {
    mat: 'stone-cobble',
    read: 'A cold forge under a shingle roof, its anvil polished by fifty years of hands. A leather apron hangs on a nail as if waiting for someone to come back.',
    gm: 'Maud\'s late husband\'s forge. Given silver, Maud can silver up to four weapons, or forty arrows and bolts, between dawn and dusk (100 gp of silver per weapon or per ten pieces of ammunition). A hero who helps (DC 13 Smith\'s Tools) doubles what she gets done.',
    doors: [[30, 27, 'n', 'open'], [33, 29, 'e', 'closed']],
  });
  b.prop('forge', 29, 28).prop('anvil', 31, 29).prop('grindstone', 32, 28).prop('tool-wall', 32, 30).prop('water-barrel', 29, 30).prop('cauldron-tripod', 30, 30);
  b.light(29, 28, 10, 15, '#ff8a4a');

  b.building('Chapel of the Long Night', 18, 27, 9, 11, {
    mat: 'stone-flagstone',
    read: 'Whitewashed walls, plain pews, and above the altar a carving of a woman holding a lantern up against the dark. A body lies under a sheet on a trestle by the altar rail.',
    gm: 'Sister Wenna\'s chapel. The body is Pim Hask, a sawyer, taken on the first night (or saved, if the heroes were quick at the millrace). A DC 13 Medicine: the bites are from a jaw far wider than any wolf\'s, and his arms are bruised from hands, not paws. The chapel\'s two silver candlesticks are worth 250 gp of silver.',
    doors: [[26, 31, 'e', 'closed', 'door-double'], [26, 32, 'e', 'closed', 'door-double'], [20, 37, 's', 'closed']],
    windows: [[18, 30, 'w'], [18, 34, 'w'], [21, 27, 'n']],
  });
  b.wallRun(23, 29, 4, 's').wallRun(23, 27, 3, 'w').door(24, 29, 's', 'closed');
  b.area('Vestry', [[23, 27, 4, 3]], { read: 'Robes, record books, and the sharp smell of dried herbs.', gm: 'The Book of the Long Night is here (handout). Dried wolfsbane hangs over the door: four bundles. Three flasks of holy water in the cupboard.' });
  b.prop('bookshelf', 23, 27).prop('writing-desk', 25, 28).prop('herbs-drying', 26, 27).prop('cupboard', 23, 28);
  b.prop('altar', 20, 28).prop('statue-tall-robed', 19, 28).props_('pew', [[19, 31], [21, 31], [19, 33], [21, 33], [19, 35], [21, 35]]).prop('table-trestle', 23, 32).prop('candelabra', 22, 30).prop('font', 25, 35).prop('candle-stand-tall', 18, 36);
  b.light(20, 29, 15, 20, '#ffe6a0').light(23, 32, 5, 10);
  b.area('Chapel graveyard', [[18, 39, 9, 8]], {
    read: 'Wooden grave-markers lean in the long grass. Two graves are freshly dug and empty, waiting.',
    gm: 'The empty graves are for whoever the wolf takes next; the sexton digs ahead. The broken stakes in the palisade are right behind the graveyard, which is how Kel slips in and out to mourn the drover he did not save.',
    label: [22, 42],
  });
  b.props_('cairn', [[19, 40], [24, 41]]).props_('open-grave', [[21, 43], [23, 43]]).prop('burial-slab', 19, 45).prop('tree-dead', 25, 45).prop('candles', 22, 40).prop('wall-stone-low', 26, 39);
  b.area('Broken stakes', [[16, 39, 3, 4]], { read: 'Two stakes have rotted through and fallen outward. The gap is just wide enough to squeeze through.', gm: 'A secret way in and out for anyone who knows. Muddy boot prints, a young man\'s size (Kel\'s).', label: [17, 40] });

  b.area('Village green', [[29, 32, 11, 12]], {
    read: 'Trampled grass round a stone well, a set of stocks, and a notice board heavy with warnings. In daylight children played here. Now the shutters on every house are closed.',
    gm: 'The heart of Varrow and the stage for the trial. Captain Crane has a stake raised by the well on the second afternoon, and firewood stacked round it. The well is deep and dry-sided: a fine place to hide or to trap a wolf (DC 15 Athletics to climb out).',
    label: [34, 36],
  });
  b.paint(33, 37, 3, 3, 'stone-cobble');
  b.prop('well', 34, 38).prop('stocks', 31, 34).prop('notice-board', 33, 33).prop('gibbet-post', 37, 40).prop('firewood', 38, 40).prop('firewood', 36, 41).props_('lamp-post', [[30, 38], [38, 34]]).prop('market-stall', 31, 42).prop('bench', 37, 35);
  b.light(30, 38, 10, 20).light(38, 34, 10, 20);
  b.encounter("Crane's company", [29, 32, 11, 12], [['knight', 1], ['veteran', 3], ['priest', 1]], 'moderate');

  b.area('Log yard', [[39, 16, 13, 7]], {
    read: 'Pine trunks stacked higher than a house, chained down against the wind. The air is thick with resin.',
    gm: 'A maze of log stacks: good cover, and a deathtrap if the chains are cut (DC 14 Strength with an axe, 4d10 bludgeoning to everything in a 10-foot line, DC 14 Dexterity save for half).',
    label: [45, 19],
  });
  b.props_('log-pile', [[40, 17], [43, 17], [40, 20], [43, 20], [50, 17]]).prop('wagon', 47, 20).prop('sawhorse', 49, 21).prop('crate-stack', 51, 20);

  b.building('Sawmill', 48, 24, 10, 8, {
    mat: 'wood-planks',
    read: 'The great saw stands still, its teeth red in the lantern light. Sawdust lies ankle deep. Through the floorboards you can hear the millrace roaring under the wheel.',
    gm: 'Henrik Vossmark\'s domain. On the first night, Pim Hask is dragged from here into the millrace. By day, a DC 14 Perception finds blood scrubbed out of the boards and a tuft of grey-red fur caught in the saw\'s guard: the same red as Henrik\'s beard.',
    doors: [[48, 27, 'w', 'closed', 'door-double'], [48, 28, 'w', 'closed', 'door-double'], [50, 24, 'n', 'closed'], [52, 31, 's', 'closed']],
    windows: [[54, 24, 'n'], [51, 31, 's']],
  });
  b.water(55, 24, 1, 8, true).floor(55, 28, 1, 1, 'wood-planks');
  b.area('Wheel room', [[56, 24, 2, 8]], { read: 'The waterwheel fills the room, turning slowly in the black water.', gm: 'Anything thrown in the millrace goes under the wheel (4d10 bludgeoning, DC 15 Strength save to grab the wall). The plank across the pit is the only dry way over.' });
  b.prop('workbench', 50, 26).prop('sawhorse', 52, 27).prop('log-pile', 49, 30).prop('tool-wall', 53, 25).prop('lantern-hanging', 51, 28).prop('winch', 57, 26).prop('grindstone', 57, 29).prop('rapids', 55, 26).prop('crate', 54, 30);
  b.light(51, 28, 10, 15);
  b.area('The millrace', [[54, 19, 3, 20]], { gm: 'Fast, deep, cold water. DC 13 Athletics to swim against it; fail and be carried under the wheel. Where it passes under the stakes there is a rusted iron grate (DC 15 Strength to pull loose): a way in, and the way Henrik gets out.', label: [55, 21] });
  b.area('Mill yard', [[40, 32, 13, 9]], {
    read: 'Sawdust heaps, a pile of offcuts, and a cart of fresh planks. The millrace roars past behind the mill.',
    gm: 'A DC 13 Survival here the morning after: wolf tracks lead from the millrace to the south of the village, toward the longhouse, not toward the forest. Drag marks go into the water.',
    label: [46, 36],
  });
  b.props_('log-pile', [[41, 33], [44, 39]]).prop('cart', 47, 34).props_('sawhorse', [[50, 38], [42, 37]]).prop('crate-pile', 51, 34).prop('firewood', 49, 40).prop('sack', 45, 33);
  b.encounter('Blood in the millrace', [44, 24, 14, 14], [['werewolf', 1], ['direWolf', 3]], 'low');

  b.building('Hask cottage', 46, 46, 6, 5, {
    read: 'A one-room cottage with a cold hearth. A woman sits on the bed holding a man\'s cap.',
    gm: 'Nell Hask, Pim\'s widow. She saw the thing that took Pim from the mill window: "It stood up. Like a man. It wore red on its face like a beard." (Henrik.)',
    doors: [[46, 48, 'w', 'closed']], windows: [[49, 46, 'n']],
  });
  b.prop('bed', 50, 47).prop('hearth-oven', 47, 49).prop('kitchen-table', 49, 49).prop('chair', 48, 47);
  b.building("Loggers' bunkhouse", 45, 52, 8, 6, {
    read: 'Ten bunks, wet socks, and men who sleep with axes. Somebody has painted wolf-ward signs on the door in sap.',
    gm: 'The mob comes from here. Big Ulla Rusk and her brother Tam lead it (berserkers). They lost a friend to the wolf and want blood by noon. A DC 14 Persuasion with proof turns Ulla; without proof it only delays her.',
    doors: [[48, 52, 'n', 'closed']], windows: [[52, 54, 'e']],
  });
  b.props_('bunk-bed', [[46, 53], [46, 56], [51, 56]]).prop('table-long', 49, 55).prop('stove', 51, 53).prop('weapon-barrel', 47, 55);
  b.light(51, 53, 10, 15);

  b.area('Sheep pens', [[18, 47, 8, 10]], {
    read: 'Hurdle pens full of frightened sheep that press against the far fence and will not stop crying.',
    gm: 'The pack raids here on the first night to pull the watch away from the mill. The wolves are hungry, not loyal: fire or a thrown carcass scatters them.',
    label: [22, 54],
  });
  pen(b, 19, 48, 5, 3, 49);
  pen(b, 19, 52, 5, 4, 53);
  b.props_('hay-bale', [[20, 49], [21, 53]]).prop('water-trough', 22, 54).prop('haystack', 25, 51).prop('bones', 20, 55, 0, { gm: true }).prop('blood-pool', 21, 50, 0, { gm: true });
  b.encounter('Wolves in the pens', [18, 46, 8, 11], [['direWolf', 5], ['wolf', 6]], 'low');

  b.building('Vossmark longhouse', 28, 50, 16, 9, {
    mat: 'wood-planks-dark',
    read: 'A long hall of black beams carved with running wolves and climbing vines, older than the village. A fire burns in a stone pit down the middle. It is warm, and it smells of pine smoke and wet dog.',
    gm: 'Home of Varrow\'s first family: old Gunnar, Mattias and Ada, their daughter Liesl, and Henrik\'s family (his wife Sigrun, the twins Bror and Kel). Five of the eight are cursed. A DC 14 Perception: there are no dogs here, and the hounds\' collars hang on a nail. Every dog in the house ran off a month ago.',
    doors: [[35, 50, 'n', 'closed', 'door-double'], [36, 50, 'n', 'closed', 'door-double'], [36, 58, 's', 'closed']],
    windows: [[33, 50, 'n'], [38, 50, 'n'], [43, 52, 'e'], [34, 58, 's']],
  });
  b.wallRun(31, 50, 9, 'e').door(31, 52, 'e', 'closed').door(31, 56, 'e', 'closed');
  b.wallRun(28, 53, 4, 's');
  b.wallRun(40, 50, 9, 'w').door(40, 52, 'w', 'closed').door(40, 56, 'w', 'closed');
  b.wallRun(40, 53, 4, 's');
  b.door(28, 51, 'w', 'secret');
  b.area("Gunnar's alcove", [[28, 50, 4, 4]], {
    read: 'A box bed with a heavy curtain, a pipe rack, a chest. The old man\'s cane leans by the bed.',
    gm: 'The panel behind the bed is a hidden door to the outside (DC 15 Investigation); the hinges are greased. In the chest, under blankets: Gunnar\'s note (handout), 80 gp, and a shirt so torn that only something swelling inside it could have done it.',
  });
  b.prop('bed-canopy', 28, 50).prop('chest', 30, 50, 0, { gm: true }).prop('stool', 30, 52).prop('coat-rack', 28, 53).prop('gm-secret-door', 28, 51, 0, { gm: true });
  b.area('Root cellar', [[28, 54, 4, 5]], {
    read: 'Sacks of turnips, strings of onions, and a heavy iron ring sunk into the wall with a new chain on it.',
    gm: 'Ada Vossmark has been chaining Liesl here at night, in secret, since she found her daughter muddy and bloody-mouthed three mornings ago. Mattias does not know. The chain will not hold a werewolf.',
  });
  b.prop('trapdoor', 29, 55).props_('sack', [[28, 57], [30, 57]]).prop('wall-chains', 28, 56).prop('shelf-jars', 31, 58).prop('flour-sacks', 30, 54);
  b.area("Henrik's quarters", [[40, 50, 4, 4]], { read: 'Three beds, a big one and two narrow. The big one has fresh bandages balled up under it, not one spot of blood on them.', gm: 'Henrik heals overnight. Bror\'s bed smells of river water. Kel\'s has a hunting knife hidden in the straw: he sleeps with it to use on himself if he ever kills.' });
  b.prop('bed-double', 41, 50).props_('cot', [[43, 51], [43, 53]]).prop('footlocker', 40, 53);
  b.area("Liesl's room", [[40, 54, 4, 5]], { read: 'A girl\'s room: carved birds on the shelf, a sawyer\'s gloves on the bed. The window shutter has deep scratches on the inside.', gm: 'Under the bed: muddy boots and a nightdress stiff with dried blood (sheep\'s blood, DC 12 Medicine).' });
  b.prop('bed', 42, 55).prop('dresser', 40, 57).prop('nightstand', 43, 57).prop('rug-round', 41, 56);
  b.prop('hearth-grand', 35, 54).props_('table-long', [[33, 52], [38, 52]]).props_('bench-long', [[33, 51], [38, 51]]).prop('chair-high-back', 35, 56).prop('loom', 32, 57).prop('heraldic-crest', 36, 51).prop('rug-pelt', 37, 56).prop('candle-hoop', 35, 52);
  b.light(35, 54, 15, 20).light(35, 52, 5, 10);
  b.area('Vossmark yard', [[28, 59, 16, 4]], {
    read: 'A muddy yard behind the longhouse: woodpile, empty kennels, a wagon with a broken axle.',
    gm: 'A DC 15 Investigation along the back stakes finds that three of them swing out on hidden hinges: the wolf-gate. Claw-scrapes and grey hairs on the posts. Tracks lead out to the bone hollow.',
    label: [36, 60],
  });
  b.props_('cage', [[29, 60], [31, 60]]).prop('firewood', 42, 60).prop('wagon', 38, 61, 90).prop('stump', 34, 61).prop('gm-secret-door', 30, 62, 0, { gm: true });
  b.encounter('The first hunt', [27, 49, 18, 14], [['werewolf', 5], ['direWolf', 7]], 'high');

  // ---------- outside, south: the wolf trail, the bone hollow and the ford ----------
  b.area('Wolf trail', [[29, 63, 3, 5]], { gm: 'A narrow trail worn by paws from the hidden gate to the bone hollow. Orrin\'s journal mentions it.', label: [30, 65] });
  b.area('Bone hollow', [[28, 67, 14, 10]], {
    read: 'A dip among the pines, carpeted in needles and bones: sheep, deer, a horse\'s skull. Something has made a bed here, a ring of flattened bracken, and in the middle lies a man\'s good leather boot.',
    gm: 'Where the pack rests between hunts and where Gunnar\'s ordinary wolves wait for him. The boot is the drover\'s, killed by Bror last month. Five worgs and four dire wolves den here by day; they fight to defend it, but flee from burning wolfsbane.',
    label: [35, 71],
  });
  b.paint(29, 68, 12, 8, 'dirt');
  b.props_('bones', [[30, 69], [38, 73], [33, 74]]).prop('bone-heap', 35, 70).prop('skull-pile', 39, 69).prop('backpack', 35, 72).prop('blood-pool', 32, 72, 0, { gm: true }).prop('gm-treasure', 36, 72, 0, { gm: true }).prop('rug-pelt', 36, 74);
  b.encounter('The bone hollow', [28, 67, 14, 10], [['worg', 5], ['direWolf', 4]], 'low');
  b.area('Ford', [[59, 69, 9, 4]], { read: 'The river spreads out over gravel, knee deep and loud.', gm: 'The only place to cross the Skell on foot. Wolves cross here to raid the east bank.', label: [63, 70] });
  b.props_('boulder', [[61, 68], [66, 73]]).prop('reeds', 60, 72);

  // the forest round the village
  const keepClear: Rect[] = [
    [33, 0, 7, 18], [2, 19, 15, 22], [66, 32, 14, 16], [40, 2, 13, 9], [56, 5, 16, 10], [27, 62, 16, 16], [58, 67, 11, 7], [10, 22, 8, 8], [2, 2, 18, 11],
  ];
  scatter(b, r, ['tree-pine', 'tree-pine', 'tree-pine', 'tree-fir-snow', 'tree-dead', 'ferns', 'bush'], 0, 0, 80, 14, 70, keepClear);
  scatter(b, r, ['tree-pine', 'tree-pine', 'tree-pine', 'ferns', 'bush', 'log-fallen', 'stump'], 0, 14, 16, 66, 60, keepClear);
  scatter(b, r, ['tree-pine', 'tree-pine', 'tree-pine', 'tree-dead', 'ferns', 'brambles', 'mushrooms'], 16, 64, 64, 16, 60, keepClear);
  scatter(b, r, ['tree-pine', 'tree-pine', 'tree-pine', 'ferns', 'bush'], 67, 14, 13, 50, 40, keepClear);
  scatter(b, r, ['bush', 'grass-tall', 'barrel', 'firewood', 'handcart', 'crate', 'water-barrel'], 17, 16, 36, 47, 22, [
    [22, 15, 12, 9], [27, 26, 8, 7], [17, 26, 11, 13], [28, 31, 13, 14], [38, 15, 15, 9], [47, 23, 12, 10], [39, 31, 15, 11], [45, 45, 8, 7], [44, 51, 10, 8], [17, 46, 10, 12], [27, 49, 18, 14], [17, 38, 11, 10], [34, 14, 5, 36], [16, 23, 21, 4], [37, 42, 17, 4],
  ]);
  scatter(b, r, ['reeds', 'boulder'], 56, 0, 14, 80, 12, keepClear);

  b.note(30, 62, 'The wolf-gate: three stakes on hidden hinges (DC 15 Investigation).');
  b.note(28, 51, 'Hidden panel behind Gunnar\'s bed (DC 15 Investigation).');
  b.note(55, 22, 'The millrace grate under the stakes (DC 15 Strength).');
  return b.build();
}

// ---------- Part 2: the deep wood and the shrine ----------
const ravineY = (x: number) => 44 + Math.round(2.5 * Math.sin(x / 6));

function deepWood() {
  const b = new MapBuilder('adv-varrow-deepwood', 'The Blackroot deep wood', 80, 80, { floor: 'grass', ambient: 'dark', wallStyle: 'hedge', theme: 'stone' });
  const r = rng(9137);

  // ---------- south of the ravine ----------
  b.cave('Edge of the deep wood', 40, 74, 7, 4, {
    mat: 'grass',
    read: 'The Fang Road ends in a turning circle and a heap of rotten logs. Beyond it the Blackroot stands like a wall. The red moon is high, and every pine trunk has a red edge.',
    gm: 'Part 2 starts here, on the third night. Three ways run north: the old road to the log bridge, the west path to the goat trail, and the east path to the fen. Orrin knows all three. The moon reaches its height in about four hours: that is when the binding happens.',
  });
  b.start(38, 73, 3, 3);
  b.tunnel([[40, 71], [37, 65], [41, 59], [38, 53], [41, 48]], 3, { mat: 'dirt' });
  b.tunnel([[36, 72], [30, 66], [22, 62], [16, 56], [14, 50]], 2, { mat: 'dirt' });
  b.tunnel([[45, 73], [56, 70], [63, 63], [66, 57]], 2, { mat: 'dirt' });

  b.cave('Wolfsbane hollow', 23, 70, 5, 4, {
    mat: 'grass',
    read: 'A damp hollow under a rock shelf, thick with tall purple flowers. Nothing has walked here; there is not a single paw print.',
    gm: 'Wild wolfsbane: a DC 12 Nature check gathers 1d4 + 2 bundles (or six without a check if Orrin is with them). Wolves will not enter the hollow: a safe place to rest for ten minutes.',
  });
  b.tunnel([[30, 66], [26, 69]], 2, { mat: 'dirt' });
  b.props_('flowers', [[21, 69], [24, 72], [26, 71], [20, 71]]).props_('ferns', [[22, 67], [25, 68]]).prop('boulder-large', 19, 69);

  b.cave("Orrin's old blind", 8, 60, 4, 3, {
    mat: 'grass',
    read: 'A hide of woven branches overlooking a game trail. Someone has kept it in good repair.',
    gm: 'Orrin\'s hunting blind. Without him, a DC 14 Perception spots it. Inside his cache (see the scene).',
  });
  b.tunnel([[16, 56], [10, 59]], 2, { mat: 'dirt' });
  b.prop('lean-to', 7, 59).prop('footlocker', 6, 60, 0, { gm: true }).prop('campfire-cold', 9, 61).prop('rope-coil', 10, 59);

  b.cave("The trappers' gibbet", 54, 61, 5, 4, {
    mat: 'dirt',
    read: 'A dead oak in a clearing, hung with iron traps and old wolf skulls on chains. They clink together in a wind you cannot feel.',
    gm: 'A long-gone trappers\' camp. The skulls are a warning the old trappers left for the pack. In the hollow trunk (DC 13 Investigation): a rusted box with a silver hunting horn (25 gp). Blown at the shrine, every ordinary wolf there must make a DC 12 Wisdom save or flee for 1 minute.',
  });
  b.tunnel([[42, 63], [50, 61]], 2, { mat: 'dirt' }).tunnel([[57, 62], [60, 66]], 2, { mat: 'dirt' });
  b.prop('tree-dead', 54, 61).props_('chains-hanging', [[53, 60], [56, 62]]).props_('skull-pile', [[52, 62]]).prop('trap-bear', 55, 63).prop('gm-treasure', 54, 60, 0, { gm: true }).prop('crate', 57, 60);

  b.area('Old Fang trail', [[36, 52, 8, 16]], {
    read: 'The old road narrows to a deer path between trunks as thick as towers. Ahead, eyes catch the red light: four pairs, then ten, then you stop counting.',
    gm: 'Gunnar\'s outrunners: worgs and dire wolves sent to slow anyone coming from Varrow. A burning bundle of wolfsbane or a big fire turns them aside; so does a DC 15 Animal Handling with the scent of the pack (a Vossmark coat). If half fall, the rest howl and run, and the shrine knows the heroes are coming.',
    label: [39, 59],
  });
  b.encounter('Wolves on the trail', [34, 52, 11, 12], [['worg', 6], ['direWolf', 4]], 'low');

  // ---------- the ravine, with the stream at the bottom ----------
  for (let x = 4; x <= 57; x++) {
    const y = ravineY(x);
    b.pit(x, y - 2, 1, 2).water(x, y, 1, 1, true).pit(x, y + 1, 1, 2);
  }
  const by = ravineY(41);
  b.floor(41, by - 3, 1, 7, 'wood-planks');
  b.area('Fallen-log bridge', [[40, by - 3, 3, 7]], {
    read: 'A pine as long as a ship has fallen across the ravine. Its bark is slick with moss. Sixty feet below, a stream glints red in the moonlight.',
    gm: 'One at a time, a DC 12 Acrobatics each (DC 16 while fighting, or if a wolf shakes the log). A fall is 6d6 bludgeoning into the stream. Two werewolves in the pines on the far side can roll the log off its ledge with a full round of work if they see the heroes coming.',
    label: [41, by],
  });
  b.prop('log-fallen', 41, by, 90).props_('rope-coil', [[41, by - 3]]);
  const gy = ravineY(14);
  b.floor(12, gy - 3, 4, 7, 'cave-floor');
  b.rubble(12, gy - 3, 4, 2).rubble(12, gy + 2, 4, 2).water(12, gy, 4, 1, false);
  b.area('Goat trail', [[12, gy - 3, 4, 7]], {
    read: 'A crumbling path zigzags down one side of the ravine, crosses the stream on stepping stones and climbs the other side.',
    gm: 'The slow, safe way across: twenty minutes, and a DC 11 Athletics each way or slide 20 feet (2d6). It brings the heroes out near the burned clearing.',
    label: [13, gy],
  });
  b.props_('stairs-down', [[13, gy - 2]]).props_('stairs-up', [[14, gy + 2]]).props_('boulder', [[12, gy], [15, gy]]);

  // ---------- the fen ----------
  b.cave('The Drowning Fen', 67, 50, 11, 8, {
    mat: 'grass',
    read: 'The ground softens, then shivers. Pools of black water reflect the red moon a dozen times over. Grey trees stand on their roots like men holding up their skirts, and somewhere out in the reeds something breathes, slow and wet.',
    gm: 'The long way round the ravine\'s east end. Every move off the log path is through mud (difficult ground). A shambling mound lies among the reeds and looks like a heap of rotting weed until it moves (DC 15 Perception). Fire keeps it back. The fen ends in a stream that climbs to the waterfall pool.',
  });
  b.mud(58, 45, 6, 4).mud(66, 52, 6, 3).mud(72, 44, 4, 6).mud(61, 53, 3, 3);
  b.pool(64, 48, 3, 2).pool(71, 51, 3, 2, true).pool(68, 45, 2, 2);
  b.floor(59, 50, 14, 1, 'wood-planks');
  b.props_('tree-swamp', [[60, 46], [70, 47], [74, 53], [63, 55], [76, 49]]).props_('reeds', [[62, 47], [66, 49], [72, 50], [69, 54], [58, 52]]).props_('lily-pads', [[64, 48], [71, 51]]).prop('quicksand', 73, 46).prop('bones-mud', 67, 53).prop('log-fallen', 65, 50, 90);
  b.encounter('The thing in the bog', [58, 44, 16, 12], [['shamblingMound', 1]], 'low');
  b.tunnel([[66, 43], [64, 38], [66, 32]], 2, { mat: 'dirt' });
  b.water(64, 34, 1, 8, false);

  // ---------- north of the ravine ----------
  b.tunnel([[41, by - 4], [40, 37]], 3, { mat: 'dirt' });
  b.cave('The Weeping Stones', 40, 32, 7, 5, {
    mat: 'grass',
    read: 'Nine grey stones stand in a ring on a bald hilltop. Dark streaks run down their faces from top to bottom, and they are wet, though no rain has fallen. In the middle, the grass is pressed flat in the shape of a sleeping wolf, very large.',
    gm: 'The stones weep red sap under the blood moon. The words carved round them (handout) are the key to the cure. The shades of the old pack\'s victims rise here when living blood is spilled or a weapon is drawn in the ring. Naming the dead and making an offering (DC 14 Religion, or Sister Wenna\'s holy water poured on the centre stone) quiets them, and they whisper the way to the hidden crypt door behind the falls.',
  });
  b.prop('stone-circle', 40, 32);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.prop('standing-stone', 40 + Math.round(Math.cos(a) * 5), 32 + Math.round(Math.sin(a) * 3));
  }
  b.prop('blood-pool', 41, 33, 0, { gm: true }).prop('offering-bowl', 39, 31);
  b.light(40, 32, 10, 20, '#d8443a');
  b.encounter('The weeping stones', [34, 28, 13, 9], [['specter', 7]], 'low');

  b.cave('The burned clearing', 16, 29, 8, 6, {
    mat: 'dirt',
    read: 'Black stumps stand in grey ash where a fire burned out a hillside years ago. Tonight there is fire here again: a ring of torches, a barricade of sharpened stakes, and a man in blackened armour standing over his dead.',
    gm: 'Captain Crane\'s last stand. He came into the wood at dusk with whatever men he had left; two of them were bitten in the first hunt and turned in the night. Now the two new werewolves and three dire wolves circle the ring of torches. Crane has a few minutes left. Saved, he is humbled, and he fights beside the heroes. If Crane died in Part 1, the werewolves are two loggers bitten in the first hunt, feeding.',
  });
  b.props_('tree-dead', [[10, 26], [21, 25], [12, 33], [22, 33]]).props_('embers-ash', [[14, 27], [19, 31], [11, 30]]).prop('cheval-de-frise', 15, 28).prop('cheval-de-frise', 18, 28).prop('burning-wreckage', 20, 29).props_('torch-standing', [[14, 30], [18, 31]]).props_('skeleton-lying', [[13, 31]]).prop('gm-treasure', 17, 31, 0, { gm: true });
  b.light(14, 30, 10, 15).light(18, 31, 10, 15).light(20, 29, 10, 15, '#ff8a4a');
  b.encounter('Ashes of the witch-hunters', [9, 24, 15, 11], [['werewolf', 2], ['direWolf', 3]], 'low');
  b.tunnel([[14, gy - 4], [14, 40], [15, 35]], 2, { mat: 'dirt' });
  b.tunnel([[23, 30], [29, 33], [34, 32]], 2, { mat: 'dirt' });
  b.tunnel([[19, 24], [24, 16], [28, 12]], 2, { mat: 'dirt' });

  b.cave('The bone tree', 12, 12, 4, 3, {
    mat: 'grass',
    read: 'A white, barkless tree stands alone, and every branch is hung with antlers, jaws and wolf teeth on thongs. They rattle as you come near.',
    gm: 'The old priesthood\'s trophy tree. At its roots, under a flat stone (DC 13 Investigation), a warden\'s offering cache. Taking from it without leaving something of your own angers Ysra later (she knows).',
  });
  b.tunnel([[15, 13], [24, 16]], 1, { mat: 'dirt' });
  b.prop('tree-dead', 12, 12).props_('bones', [[10, 13], [14, 11]]).prop('cairn', 11, 11).prop('gm-treasure', 13, 13, 0, { gm: true });

  // ---------- the waterfall pool and the den behind it ----------
  b.tunnel([[58, 27], [50, 30], [46, 32]], 2, { mat: 'dirt' });
  b.cave('Moonfall pool', 66, 27, 8, 5, {
    mat: 'grass',
    read: 'A waterfall pours out of a black cliff into a round pool. The spray hangs in the air like smoke, and the moon in the water is so red it looks like something has bled into it.',
    gm: 'The falling water the old rite needs: the moon-cup must be filled here, with wolfsbane, to cure. Behind the falls is a cave (DC 13 Perception from the bank to see the gap; walking through the falls is a DC 12 Strength save or be knocked prone in the shallows). The pack goes in and out this way.',
  });
  b.pool(66, 27, 4, 2, true);
  b.water(65, 21, 3, 3, false);
  b.props_('rapids', [[66, 22], [65, 23]]).props_('boulder', [[61, 26], [71, 28], [63, 30]]).props_('reeds', [[60, 28], [72, 25]]).prop('tree-willow', 70, 30).prop('lily-pads', 67, 28);
  b.light(66, 26, 10, 20, '#d8443a');

  b.cave('The den behind the falls', 68, 17, 5, 3, {
    mat: 'cave-floor',
    read: 'Behind the curtain of water, a cave stinks of wet fur and old meat. Bones crunch underfoot. At the back, someone is crying, very quietly, in a cage made of saplings.',
    gm: 'Henrik and Bror\'s den, with six dire wolves and six worgs. The crying woman is Ada Vossmark, taken alive in the first hunt to be bitten at the binding. A crack at the back (DC 14 Perception, or the stones\' whisper) is a squeeze into the crypt\'s hidden way. Henrik fights to the death; Bror flees at a quarter of his hit points.',
  });
  b.props_('bone-heap', [[66, 16], [71, 18]]).prop('cage', 72, 17).prop('rug-pelt', 68, 18).prop('treasure-pile', 70, 16, 0, { gm: true }).props_('skull-pile', [[65, 18]]).prop('bedroll', 69, 19);
  b.encounter('Behind the falls', [63, 14, 10, 6], [['werewolf', 2], ['direWolf', 6], ['worg', 6]], 'moderate');

  // ---------- the shrine on its hill ----------
  b.tunnel([[40, 27], [38, 22]], 3, { mat: 'dirt' });
  b.cave(null, 37, 13, 10, 9, { mat: 'grass', seed: 77 });
  b.building('Shrine of the Grey Mother', 31, 5, 13, 12, {
    mat: 'stone-flagstone',
    read: 'The roof fell in long ago, and ivy has swallowed the walls, but the floor is swept. At the far end a great stone wolf sits on her haunches, head bowed, and before her a fire burns on an altar. Shapes move around it on four legs and on two.',
    gm: 'The finale. See the binding scene. The east door is a stone slab carved with a wolf\'s face: it opens onto the stair down to the crypt and is barred from the crypt side by the warden\'s will. Gunnar cannot open it; he waits for the moon to weaken her.',
    doors: [[36, 16, 's', 'open', 'door-broken'], [37, 16, 's', 'open', 'door-broken'], [31, 11, 'w', 'open', 'door-broken'], [36, 5, 'n', 'open', 'door-broken'], [43, 10, 'e', 'locked', 'door-iron']],
  });
  b.prop('idol-colossal', 37, 5).prop('altar', 37, 7).prop('magic-circle', 37, 10).props_('brazier', [[35, 7], [39, 7]]).props_('pillar-broken', [[33, 8], [41, 8], [33, 13], [41, 13]]).prop('column-fallen', 34, 11, 90).props_('rubble-pile', [[40, 14], [32, 6]]).prop('chains-hanging', 36, 8).prop('blood-pool', 38, 9, 0, { gm: true }).prop('candle-ring', 37, 9).props_('ferns', [[42, 6], [32, 15]]);
  b.rubble(39, 13, 2, 2);
  b.light(35, 7, 15, 20, '#ff6a3a').light(39, 7, 15, 20, '#ff6a3a');
  b.encounter('The binding', [30, 5, 15, 12], [['werewolf', 5], ['direWolf', 7]], 'high');
  b.area('Shrine forecourt', [[31, 17, 13, 5]], {
    read: 'Broad steps climb to the shrine between toppled columns. Wolf statues line the way, every one with its head smashed off.',
    gm: 'Two werewolves would normally keep watch here; if the heroes came quietly (DC 14 Stealth as a group) they are inside at the altar instead. The steps give cover (half cover behind the columns). From here you can hear Gunnar\'s voice, chanting.',
    label: [37, 19],
  });
  b.props_('stairs-up', [[36, 18], [37, 18], [38, 18]]).props_('column-fallen', [[33, 19], [41, 20]]).props_('statue', [[32, 17], [43, 17]]).props_('statue-gargoyle', [[33, 21], [36, 21]]);

  // ---------- the crypt under the hill ----------
  b.rock(45, 1, 20, 14);
  b.floor(44, 10, 8, 1, 'dungeon-slab');
  b.area('Stair of teeth', [[44, 10, 8, 1]], { read: 'Steps cut down into the hill, each one set with a row of wolf teeth.', gm: 'A narrow stair from the shrine to the crypt. Anyone with the curse feels the warden\'s cold hand on their neck here (DC 13 Wisdom save or frightened while on the stair).', label: [47, 10] });
  b.props_('stairs-down', [[44, 10], [46, 10]]);
  b.room('Crypt of the first pack', 52, 3, 9, 8, {
    mat: 'dungeon-slab',
    read: 'A long vault of grey stone. Along both walls, stone shelves hold the bones of people buried in wolf skins, their skulls resting on their folded hands. The air is so cold your breath hangs in front of you.',
    gm: 'The old priesthood\'s hunt-leaders, now wights, and the shades of those they ate. They rise only if the heroes come with blood on their hands (any cursed person who has killed), disturb the bones, or anger Ysra. The warden appears here first, as mist that gathers into a woman.',
  });
  b.door(52, 10, 'w', 'closed', 'door-iron');
  b.props_('ossuary-shelf', [[52, 3], [55, 3], [58, 3]]).props_('sarcophagus-row', [[53, 6], [58, 6]]).prop('coffin', 55, 8).prop('candles', 60, 4).props_('skull-pile', [[60, 9]]).prop('cobweb-corner', 52, 9);
  b.light(60, 4, 5, 10, '#a8c8ff');
  b.encounter("The first pack's crypt", [52, 3, 9, 8], [['wight', 4], ['specter', 3]], 'moderate');
  b.room('Moon-cup vault', 55, 11, 6, 3, {
    mat: 'dungeon-slab',
    read: 'A small round room. On a pedestal, under a skin of dust, stands a wide shallow cup of pale metal that drinks the light of your torches.',
    gm: 'The moon-cup: moon-silver, cold to the touch. It cures (filled at Moonfall pool with wolfsbane, drunk at the shrine altar under the blood moon, by one who has not killed) or binds (filled with the blood of the one who holds it). Only Ysra\'s leave or her defeat lets it leave the vault without her wailing following it.',
  });
  b.wallRun(55, 10, 6, 's').door(57, 10, 's', 'locked', 'door-iron');
  b.prop('orb-pedestal', 58, 12).prop('reliquary', 58, 12, 0, { gm: true }).prop('candle-ring', 56, 12).prop('chest', 60, 13, 0, { gm: true });
  b.door(61, 13, 'w', 'secret');
  b.tunnel([[61, 13], [66, 16]], 1, { mat: 'cave-floor' });
  b.area('Pack-run', [[61, 13, 5, 3]], { gm: 'The old priesthood\'s secret way between the den and the vault: a crawl through the rock, single file. From the vault side it is a hidden stone door (DC 16 Investigation); from the den side a crack anyone can see who knows to look.', label: [63, 14] });

  // ---------- the forest itself: trees along every path and clearing ----------
  scatter(b, r, ['tree-pine', 'tree-pine', 'tree-fir-snow', 'tree-dead', 'ferns', 'bush', 'stump', 'mushrooms'], 0, 0, 80, 80, 150, [[30, 4, 15, 18], [44, 1, 22, 16], [58, 43, 18, 14], [11, 41, 6, 10]]);
  scatter(b, r, ['log-fallen', 'boulder', 'brambles', 'thorn-bush'], 0, 48, 80, 32, 18);

  b.note(41, by, 'Fallen-log bridge: DC 12 Acrobatics, DC 16 in a fight.');
  b.note(61, 13, 'Hidden stone door into the moon-cup vault (DC 16 Investigation).');
  b.note(67, 22, 'Behind the falls: DC 13 Perception to see the cave mouth.');
  return b.build();
}

export const BLOOD_MOON_VARROW: Adventure = {
  id: 'blood-moon-varrow',
  title: 'Blood Moon over Varrow',
  tagline: 'Three nights of a red moon, a village that wants someone to burn, and a wolf curse running through its first family.',
  levels: '6',
  sessions: '2 sessions (3-4 hours each)',
  players: '3-5 players',
  tags: ['gothic horror', 'werewolves', 'mystery', 'forest', 'two-parter'],
  pitch:
    'Varrow is a logging village deep in the Blackroot pines, where the sawmill never stops and the forest never ends. This autumn the moon has risen red, and the old folk say it will stay red for three nights. A red moon is a hungry moon, they say, and they are right: the sheep have been dying for weeks, a drover vanished on the Fang Road, and last night the loggers heard something howl inside the stakes. The village council has sent word down the river road, offering silver to anyone who will stand the wall for three nights. You reach Varrow at dusk on the first night of the blood moon, just as the gates are closing.',
  secret:
    'For forty years Gunnar Vossmark ran the sawmill and ran Varrow. Last spring the council voted him out and gave both the mill and the council seat to his son Mattias. Gunnar smiled and said he was glad to rest. He was not. He walked into the deep wood to the ruined shrine of the Grey Mother, a wolf goddess whose priests once ran on four feet, and there he let the last starving werewolf of the old pack bite him, then killed it and took its place. Since midsummer he has bitten his own family one by one, in their sleep: his younger son Henrik (who learned the truth and welcomed it), Henrik\'s wife Sigrun, the twins Bror and Kel, and three nights ago his granddaughter Liesl, Mattias\'s girl, as his revenge on the son who took his place. Henrik and Bror have killed people; Sigrun, Kel and Liesl have not, yet. What he wants: on the third night of the blood moon, at the shrine altar, the old binding rite. Each of his pack drinks his blood from the moon-cup, a relic sealed in the crypt beneath the shrine, and is bound to him forever: no cure, no will of their own. Then Varrow\'s first family runs on four legs at his heel, Mattias dies, and the mill and the village are his again, held by fear. Why now: the rite only works under a blood moon, and three red nights in a row come once in a lifetime. The cure: kill Gunnar with silver or magic before the moon sets on the third night, and every one he cursed who has not killed a person is free. Or fill the moon-cup at the waterfall with wolfsbane and have the cursed one drink it at the altar under the moon. Henrik and Bror are beyond both.',
  hooks: [
    'Mattias Vossmark\'s notice, nailed up in every river town: 50 gp a head to stand the wall of Varrow for the three nights of the red moon, and 200 gp for the beast\'s hide.',
    'Orrin Gall, a hunter one of the heroes once tracked with, sends a short letter: "Come to Varrow before the moon turns. Bring silver. Tell nobody I asked. They would not like it."',
    'A temple scholar has read of a moon-silver cup kept at a ruined wolf shrine in the Blackroot, and pays well for anyone who will find it. Varrow is the last village before the deep wood.',
  ],
  tips: [
    'The clock is three nights. Night one: the mill and the pens (Part 1 opens with a fight). Day two: clues, the witch-hunter, the mob and the trial. Night two: the first hunt. Night three: the deep wood and the shrine (Part 2).',
    'Silver matters. Werewolves shrug off ordinary weapons; silvered or magic ones hurt them. Silver is everywhere if the heroes ask: Orrin\'s strongbox (20 arrows, 2 spears), the chapel candlesticks, Maud\'s spoons, the Vossmark plate, Crane\'s bolts. Maud silvers weapons at her forge during day two.',
    'Wolfsbane, this adventure\'s rule: a burning bundle (a bonus action to light from a torch) makes a 10-foot-radius cloud for 1 minute. Any wolf or werewolf that starts its turn in it makes a DC 13 Constitution save or is poisoned until its next turn, and ordinary wolves will not enter it. Wolfsbane tea keeps a cursed person from turning for one night, and makes them poisoned until dawn. Get it from Orrin\'s garden, the chapel vestry, or the hollow in the deep wood.',
    'Play the paranoia. Everyone suspects Orrin, who lives alone, grows poison and wears wolf skins. Give the players clues that point the other way: tracks that go IN through the south stakes, a red-bearded thing at the mill, Henrik\'s wounds that heal overnight, Liesl\'s scratched shutter, the empty kennels. Two clues make a case Crane and Mattias must listen to.',
    'A hero bitten by a werewolf makes a DC 12 Constitution save or is cursed. A cursed hero turns at the next moonrise unless cured; Gunnar\'s death, the moon-cup or a Remove Curse spell all free them, since they have killed no one.',
    'Captain Crane is sure, polite and wrong. He makes every scene worse until the heroes prove him wrong, then he becomes their best ally. Let the players win him over; never let him win by force.',
  ],
  npcs: [
    {
      id: 'pf_bvgunnar', name: 'Gunnar Vossmark', title: 'the old millmaster', kind: 'monster', art: 'werewolf', monsterId: 'werewolf',
      wants: 'His mill, his seat and his family back: all of them, on four legs and loyal to him forever.',
      knows: 'The binding rite, who he has bitten and when, the hidden gate in the south stakes, and that the moon-cup lies sealed beneath the shrine.',
      voice: 'Soft, slow and fond. Calls everyone "lad" or "lass", and chuckles before he says anything cruel.',
      appearance: 'A stooped old man with a white streak through his grey hair, a blackthorn cane and a heavy wool shawl. As a wolf he is huge and grey, with the same white streak down his spine.',
      backstory: 'Forty years master of the mill and the council, until the vote last spring. He has never forgiven Mattias for standing there and letting it happen.',
      gmNotes: 'Werewolf stat block. In Part 1 he joins the first hunt as the great grey wolf for two rounds only, then leaps the stakes and flees. At the shrine he is the alpha: give him 90 hit points, and wolves and werewolves within 30 feet of him add 2 to their attack rolls. If he dies before the moon sets on the third night, the curable ones fall to the ground human, sobbing. If he dies early in Part 1, Henrik takes his place at the altar, and the curable ones break free more easily (DC 12 instead of DC 15).',
    },
    {
      id: 'pf_bvmattias', name: 'Mattias Vossmark', title: 'head of the village council', kind: 'npc', art: 'noble', shared: true,
      wants: 'To keep Varrow together, his family safe and his name clean. He would sooner hang an outsider than look hard at his own house.',
      knows: 'That Liesl has been sick for three days, that Henrik heals too fast, and that his father went into the deep wood alone last spring. He has told nobody any of it.',
      voice: 'Clipped and formal, a man used to being obeyed. Turns his wedding ring when he lies.',
      appearance: 'A broad man of fifty with sawdust in his beard, a good blue coat and a silver chain of office.',
      gmNotes: 'Turned with proof (DC 14 Persuasion with two clues, DC 18 without), he hands over the family silver plate (300 gp of silver) for silvering, calls off the mob, and comes to the shrine. His voice calls Liesl back to herself once, automatically.',
    },
    {
      id: 'pf_bvliesl', name: 'Liesl Vossmark', title: "Mattias's daughter", kind: 'npc', art: 'commoner', monsterId: 'werewolf', shared: true,
      wants: 'For the dreams to stop, and for nobody to find out about the mud on her feet.',
      knows: 'She dreams of running through the pines with her cousins and a great grey wolf. Her grandfather sat by her bed the night she was "scratched by a dog".',
      voice: 'Sharp and funny by daylight, but goes quiet in the middle of a sentence and sniffs the air.',
      appearance: 'A tall girl of sixteen with a bandaged forearm, a sawyer\'s calloused hands, and pupils that stay a little too wide.',
      gmNotes: 'Bitten by Gunnar three nights ago. She has not killed, and can be cured. She turns for the first time at moonrise on the second night. A DC 13 Insight sees she is terrified, not guilty. In wolf shape, someone who loves her and calls her by name can bring her back to herself for a round (DC 15 Persuasion; her father succeeds once without a roll). Wolfsbane tea keeps her human for a night.',
    },
    {
      id: 'pf_bvhenrik', name: 'Henrik Vossmark', title: 'mill foreman', kind: 'npc', art: 'berserker', monsterId: 'werewolf', shared: true,
      wants: 'To be more than his brother\'s foreman. The wolf gave him that, and he will not give it back.',
      knows: 'All of his father\'s plan, the binding at the shrine on the third night, the hidden gate, and the den behind the falls.',
      voice: 'Loud and friendly, far too friendly. Laughs at his own jokes and cracks his knuckles.',
      appearance: 'A huge red-bearded man with a pink new scar on his neck that was a deep gash yesterday.',
      gmNotes: 'He has killed (Pim Hask on the first night, and a woodcutter in summer): no cure can save him. He is the werewolf at the millrace on night one; hurt by silver, he dives into the race and lets the current take him under the grate. At the shrine he guards the den behind the falls with his son Bror and fights to the death.',
    },
    {
      id: 'pf_bvkel', name: 'Kel Vossmark', title: "Henrik's son", kind: 'npc', art: 'commoner', monsterId: 'werewolf',
      wants: 'To confess before it is too late, and to stop his twin brother Bror from killing again.',
      knows: 'That his grandfather bit him in his sleep at midsummer, that Bror killed the drover last month, and where the hidden gate is.',
      voice: 'Mumbles and stammers and cannot meet anyone\'s eye. Speaks clearly only about trees.',
      appearance: 'A thin young man of nineteen with his hands pulled up into his sleeves to hide scabbed knuckles.',
      gmNotes: 'Has not killed: he can be cured. Caught alone and treated kindly (DC 14 Persuasion), he tells the heroes everything, then begs them not to tell his father. He cannot resist Gunnar\'s call at moonrise. At the shrine he is chained by the altar with Liesl, waiting to drink.',
    },
    {
      id: 'pf_bvorrin', name: 'Orrin Gall', title: 'the hunter outside the wall', kind: 'npc', art: 'hunter', monsterId: 'scout', shared: true,
      wants: 'To kill the grey wolf that killed his dogs, and for Varrow to leave him alone.',
      knows: 'Wolf sign better than anyone alive: the tracks come in through the south stakes and leave the same way. Where wolfsbane grows, and the way through the deep wood to the old shrine.',
      voice: 'Few words, low and dry. Answers questions with questions. Whistles for dogs that are not there any more.',
      appearance: 'A lean, weather-dark man with a grey braid, a longbow, and a coat of badly cured wolf hides that does him no favours.',
      gmNotes: 'Innocent, surly and easy to hate. He has 20 silvered arrows, wolfsbane, and his journal (handout). If the heroes save him from the mob or the stake, he guides them through the deep wood in Part 2 and knows all three ways across the ravine.',
    },
    {
      id: 'pf_bvcrane', name: 'Captain Hallam Crane', title: 'witch-hunter of the Ashen Lantern', kind: 'npc', art: 'knight', monsterId: 'knight', shared: true,
      wants: 'A guilty party and a fire before the third night, so he can write "cleansed" in his book and ride on.',
      knows: 'Monster lore from a book, not from life: silver, wolfsbane, "the beast hides in a man\'s skin". He has burned eleven "werewolves". Two of them were werewolves.',
      voice: 'Courteous and unhurried. Quotes his order\'s rules by number. Never raises his voice, and never changes his mind without proof.',
      appearance: 'A tall man in blackened plate with a lantern-shaped badge, iron-grey hair and kind, tired eyes.',
      gmNotes: 'Rides in on the second morning with three veterans and a chaplain (priest). He arrests Orrin, and when Liesl is exposed he wants to burn her too. Shown real proof (Orrin\'s journal plus one more clue) and a DC 15 Persuasion, he becomes an ally: 40 silvered crossbow bolts and a spell scroll of Remove Curse. If not, two of his men are bitten in the first hunt and turn in the forest (Part 2, the burned clearing).',
    },
    {
      id: 'pf_bvwenna', name: 'Sister Wenna Holt', title: 'keeper of the chapel', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'Nobody burned. Not the hunter, not the girl, not anyone.',
      knows: 'The chapel\'s old record of the Grey Mother\'s priests, what silver and wolfsbane do, and that the moon-cup can cure "one who has not tasted man".',
      voice: 'Warm and blunt; an old soldier. Swears, then apologises to the altar.',
      appearance: 'A broad grey-haired woman with a soldier\'s scar across her chin and a ring of chapel keys at her belt.',
      gmNotes: 'Gives the heroes the chapel\'s silver candlesticks for the forge, 3 flasks of holy water and four bundles of dried wolfsbane. She can heal the wounded after each night. She speaks up at the trial for anyone accused, and Crane respects her.',
    },
    {
      id: 'pf_bvmaud', name: 'Maud Brask', title: 'keeper of the Split Log', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'Her customers alive, and the truth, whoever it hangs.',
      knows: 'Every rumour in Varrow, and her late husband\'s trick for silvering a blade in a day.',
      voice: 'Loud and quick. Laughs like a saw biting wood.',
      appearance: 'A short, powerful woman with forge-burn scars up both forearms and her husband\'s leather apron over a good dress.',
      gmNotes: 'Runs the forge behind the tavern. Given silver (100 gp of silver per weapon, or per ten arrows or bolts), she silvers up to four weapons between dawn and dusk. She gives her own spoons if the heroes are straight with her.',
    },
    {
      id: 'pf_bvysra', name: 'Ysra', title: 'last warden of the Grey Mother', kind: 'monster', art: 'ghost', monsterId: 'ghost',
      wants: 'That the moon-cup is never again used to bind anyone, and to rest at last.',
      knows: 'Both rites of the cup, the cure and the binding, and that the binding breaks if the alpha dies before the moon sets.',
      voice: 'A whisper with a growl under it, in old words. Repeats the last word of each sentence, like an echo.',
      appearance: 'A tall woman of grey mist in a wolf-skin cloak, her face half wolf and half woman, her eyes two pale moons.',
      backstory: 'Three hundred years ago she was warden of the shrine. When the priests began using the cup to bind the faithful into a pack, she poisoned their rite, sealed the cup in the crypt, and died holding the door.',
      gmNotes: 'Not hostile unless the heroes come for the cup with blood on their hands or rob the dead. She asks one question: "Who would you cure?" A selfless answer earns the cup and stills the crypt\'s dead. Angered, she uses Horrifying Visage and wakes the wights. Once the cup has cured someone, she fades with a long sigh, and the shrine is only stone.',
    },
  ],
  handouts: [
    { id: 'bv-notice', title: 'A notice on the tavern door', text: 'BY ORDER OF THE COUNCIL OF VARROW\nCurfew at the bell. Gates shut at dusk.\n50 gp a head to any able sword who stands the wall for the three nights of the red moon.\n200 gp for the beast\'s hide.\nAny who shelter the beast, or the one who wears it, answer to the council.\n- M. Vossmark, Head of Council\n\n(scrawled underneath in charcoal: ASK THE HUNTER WHY HIS DOGS NEVER BARK)' },
    { id: 'bv-journal', title: "Pages from Orrin's journal", text: 'Day 3 of the red month. Big grey. Twice the size of any wolf. Stood on two feet at the stakes, then dropped to four. Never seen that.\nDay 9. Sheep at Hask\'s. Tracks IN by the south stakes behind the longhouse. OUT the same way. Not from the forest. From the village.\nDay 12. Dogs dead. Throats. The grey one stood and watched. White stripe down its back.\nDay 15. Three wolves now, not one. Younger. One limps the way Henrik limps.\nWolfsbane by the door. Silver on the string. Nobody listens.' },
    { id: 'bv-writ', title: "Captain Crane's writ", text: 'THE ORDER OF THE ASHEN LANTERN\nLet all know that Captain Hallam Crane, Lantern-bearer, may seek out, try and cleanse any who wear the beast.\nRule 4: The beast hides among the lowly and the strange.\nRule 9: A trial need not wait for the beast to confess.\nRule 17: Fire cleanses what silver cannot reach.\n\n(On the back, eleven names, each struck through in red ink.)' },
    { id: 'bv-chapel', title: 'From the Book of the Long Night', text: 'Before Varrow, these pines belonged to the Grey Mother, and her priests ran on four feet under the red moon.\nThey kept a cup of moon-silver. Filled at the falling water with wolf\'s-bane and drunk at her altar beneath the red moon, it gave back the human heart to one who had not tasted man.\nFilled with blood, it bound the drinker to the one who held the cup, forever.\nThe last warden hid the cup beneath the shrine, and the priests died out. Let it lie.' },
    { id: 'bv-gunnar', title: "A note in Gunnar's chest", text: 'They voted. Forty years I fed this village, and they voted, and the boy stood there and let them.\nHenrik understood. Sigrun will understand. The twins already do.\nThe girl last. Let him see it in her eyes.\nThird night. The cup. Then they are mine, and nothing will ever be taken from me again.' },
    { id: 'bv-stones', title: 'Words carved round the Weeping Stones', text: 'WHO MADE THE WOLF HOLDS THE WOLF.\nLET HIM FALL TO THE PALE METAL BEFORE THE MOON GOES DOWN, AND THE WOLF IS LOOSED.\nBUT ONE WHO HAS EATEN OF MAN IS WOLF FOREVER.' },
  ],
  chapters: [
    {
      id: 'village', title: 'Part 1: The village by day and night', level: 6,
      summary: 'Two nights and a day inside Varrow\'s stakes. Something takes a sawyer at the mill on the first night; by day the village turns on the hunter outside the wall, a witch-hunter rides in to light a fire, and the clues lead to the most respected house in the village. On the second night the pack hunts.',
      goal: 'Protect the villagers, find out who is really wearing the wolf, keep the innocent off the pyre, and survive the first hunt.',
      map: varrow,
      npcs: [
        { npc: 'pf_bvmattias', x: 51, y: 45 },
        { npc: 'pf_bvmaud', x: 28, y: 19 },
        { npc: 'pf_bvwenna', x: 22, y: 30 },
        { npc: 'pf_bvorrin', x: 8, y: 29 },
        { npc: 'pf_bvhenrik', x: 50, y: 28 },
        { npc: 'pf_bvgunnar', x: 30, y: 52 },
        { npc: 'pf_bvliesl', x: 41, y: 56 },
        { npc: 'pf_bvkel', x: 42, y: 52 },
        { npc: 'pf_bvcrane', x: 34, y: 36, hidden: true },
      ],
      scenes: [
        {
          room: 'River gate', title: 'The gates close',
          read: 'A broad man in a blue coat waves you over the bridge with a lantern. "Quickly. Quickly." The gates slam behind you, the bar drops, and up on the stakes someone starts ringing a bell. "That\'s the curfew," says the man. "Now nobody goes out until dawn. Nobody."',
          gm: 'Mattias Vossmark, head of the council, hires the heroes on the spot (50 gp each for the three nights) and puts them on the wall. He talks about wolves, the drover, the sheep, and "that hunter outside the stakes". He does not mention his family. Keep this short: the moon is rising.',
          treasure: 'Mattias pays 50 gp a head now, as promised.',
        },
        {
          room: 'The Split Log', title: 'Rumours by the fire',
          read: 'The loggers fall quiet when you come in, then go on muttering into their cups. A short woman with burned forearms bangs three mugs on the bar. "On the house, if you\'re here to kill it. Double price if you\'re here to talk about it."',
          gm: 'Maud Brask. Rumours (one each, roll or choose): the hunter grows poison and wears wolf skins; the drover was last seen drinking with the Vossmark twins; the Vossmarks\' dogs all ran away last month; old Gunnar walked into the deep wood in spring and came back "younger"; a witch-hunter is coming upriver; the sheep raids always start near the south stakes. The notice on the door is the council\'s.',
          handout: 'bv-notice',
        },
        {
          room: 'Sawmill', title: 'Screams at the mill', encounter: 'Blood in the millrace',
          read: 'A scream, cut short, from the sawmill. You reach the yard in time to see a shape the size of a bear dragging a man toward the roaring millrace by his leg. It turns its head. In the lantern light its muzzle is red, and it is standing on two legs.',
          gm: 'Henrik, in hybrid form, with three dire wolves. If the heroes reach Pim Hask within 2 rounds he is alive (bitten, cursed, 1 hit point); otherwise he goes under the wheel. Henrik flees into the millrace and through the grate once hurt by silver or reduced to half. Afterwards: red-grey fur on the saw guard, and Nell Hask saw "a beard". At the same moment the sheep start screaming (the pens).',
        },
        {
          room: 'Sheep pens', title: 'Wolves in the pens', encounter: 'Wolves in the pens', optional: true,
          read: 'On the other side of the village the sheep are screaming. Grey backs pour over the hurdles, and the watchers on the stakes are shooting at shadows.',
          gm: 'A diversion: ordinary wolves sent in through the broken stakes to pull the watch away from the mill. Run it at the same time as the mill if the party splits. Fire or a carcass thrown to them scatters the wolves; they do not fight to the death.',
        },
        {
          room: 'Chapel of the Long Night', title: 'What the body says',
          read: 'Sister Wenna lifts the sheet without a word. The bites are wide, far too wide. "No wolf did that," she says. "And no hunter either." She looks at you. "There are books in my vestry that nobody has opened in a hundred years. I think it is time."',
          gm: 'Morning of day two. A DC 13 Medicine on Pim (or his wounds, if he lives): a jaw too wide for a wolf, and hand-bruises on his arms. Wenna shares the Book of the Long Night, explains silver and wolfsbane, and gives the heroes her candlesticks, holy water and dried wolfsbane. If Pim lives, he is cursed; Wenna asks the heroes to save him too.',
          handout: 'bv-chapel',
          treasure: 'Two silver candlesticks (250 gp of silver for the forge), 3 flasks of holy water, 4 bundles of dried wolfsbane, and a potion of healing from the vestry.',
        },
        {
          room: 'Vossmark longhouse', title: 'Breakfast with the Vossmarks',
          read: 'The whole family is at the long table: the council head, his tired wife, a pale girl with a bandaged arm, a red-bearded giant laughing too loudly, twin sons who will not look at each other, and by the fire an old man in a shawl who smiles at you as if he has been waiting for you.',
          gm: 'Mattias insists the heroes eat with his family. Clues: Henrik\'s neck wound is half healed (DC 13 Medicine: impossible); Liesl flinches from the silver salt-cellar; Kel stares at his plate and leaves early (follow him to the graveyard to talk); Gunnar is charming and asks a lot of questions about silver. Ada pulls a hero aside, terrified, and almost confesses about the chain in the root cellar (DC 14 Insight or Persuasion). A sneaky hero can search Gunnar\'s alcove.',
          handout: 'bv-gunnar',
        },
        {
          room: "Orrin's cabin", title: 'The hunter outside the wall',
          read: 'The man at the cabin door has an arrow on the string before you are halfway across the field. "Come to hang me?" he says. "Get in line."',
          gm: 'Orrin Gall is rude, frightened and right. With a DC 13 Persuasion (or a straight question about the tracks) he shows them his journal, his silver and his wolfsbane, and offers to show them the bone hollow. He will not come into the village: they would kill him.',
          handout: 'bv-journal',
          treasure: '20 silvered arrows and two silver-headed spears (he lends them if trusted), 6 bundles of fresh wolfsbane, 2 potions of healing.',
        },
        {
          room: 'Bone hollow', title: 'The bone hollow', encounter: 'The bone hollow', optional: true,
          read: 'The trail from the back of the longhouse leads to a hollow full of bones. Something big has been sleeping here, and it has company: low shapes lift their heads from the bracken.',
          gm: 'Proof, if the heroes need it: the paw-trail runs straight from the hidden gate behind the Vossmark longhouse. Worgs and dire wolves den here and fight to defend it; burning wolfsbane drives them off. The drover\'s boot and pack are here.',
          treasure: 'In the drover\'s pack: 45 gp, a silver dagger and a potion of greater healing.',
        },
        {
          room: "Witch-hunters' camp", title: 'The witch-hunter rides in',
          read: 'Four riders come over the bridge at noon in blackened armour, a lantern burning on a pole at their head in broad daylight. Their captain doffs his helmet to Mattias and says, quite gently, "I am told you have a beast. Rule four: it will be hiding among the strange. Who here is strange?"',
          gm: 'Captain Crane, three veterans and a chaplain. Every villager points west at Orrin. Crane is courteous and certain, and he will hold a trial on the green at sunset "to give the people their answer before dark". The heroes can sneak into his camp for the writ, or argue with him now (he wants proof, not talk).',
          handout: 'bv-writ',
        },
        {
          room: "Orrin's cabin", title: 'The mob', encounter: 'The mob',
          read: 'Torches in the afternoon. Thirty villagers come out of the west gate with axes and rope, and at their head walks Big Ulla Rusk from the bunkhouse with a felling axe on her shoulder. "Stand aside," she says. "It\'s the hunter we want. Not you. Not yet."',
          gm: 'Ulla, her brother Tam and six loggers lead; the rest are commoners who run at the first real blood. Proof plus a DC 14 Persuasion turns Ulla; without proof, a DC 18 only delays her. Intimidation or a show of power scatters the commoners but not Ulla. If the heroes do nothing, the mob drags Orrin to the green for the trial. Killing villagers turns the whole village against the heroes.',
        },
        {
          room: 'Village green', title: 'The trial at sunset', encounter: "Crane's company",
          read: 'The whole village stands round the well. A stake rises beside it with firewood stacked to the waist, and Orrin is tied to it. Captain Crane opens his book. "Rule nine," he says. "A trial need not wait for the beast to confess. Does anyone speak for him?"',
          gm: 'The heroes\' chance to argue. Each solid clue presented gives advantage on the Persuasion against Crane (DC 15); Wenna speaks too. If Liesl has been exposed, Crane turns on her instead, and Mattias draws a sword on him. If the heroes free Orrin by force, Crane\'s company fights (they yield at half strength). Either way the moon rises halfway through: the trial ends in a howl from inside the stakes.',
        },
        {
          room: 'Vossmark longhouse', title: 'The first hunt', encounter: 'The first hunt',
          read: 'The howl comes from inside the village, from the Vossmark longhouse. The door bursts outward, and the family comes out of it, and they are not people any more. Behind them the stakes at the back swing open, and the wolves pour in.',
          gm: 'The pack: Gunnar (the great grey wolf, for two rounds only), Liesl and Kel from inside the longhouse, Sigrun, and Henrik (or Bror, if Henrik died at the millrace), with seven dire wolves. Liesl, Kel and Sigrun have not killed: they flee at half hit points, and a loved one can call them back for a round. Gunnar\'s goals are to take Liesl and Ada into the forest and to bite Mattias; Crane\'s men (if they are here) get bitten. When Gunnar flees, the whole pack follows him over the stakes, carrying Ada. The trail is plain: north, to the deep wood.',
          treasure: 'After the hunt, Mattias gives the family plate for silvering (300 gp of silver) and his father\'s woodsman\'s axe from the longhouse wall: a +1 handaxe. If Crane is an ally, his 40 silvered bolts and his spell scroll of Remove Curse.',
        },
      ],
      wrapUp: 'By dawn of the third day Varrow knows the truth: its first family is the pack, Gunnar leads it, and Ada and Liesl are gone into the deep wood. Orrin, Wenna, Mattias and perhaps Crane all know the shrine is where it ends. Maud works the forge all day. At dusk the heroes walk up the Old Fang Road.',
    },
    {
      id: 'deepwood', title: 'Part 2: The last night in the deep wood', level: 6,
      summary: 'The third night of the blood moon. Through the Blackroot by moonlight, across a ravine, past the weeping stones and the burned clearing, to the ruined shrine of the Grey Mother, where Gunnar means to bind his family to him forever.',
      goal: 'Reach the shrine before the moon is at its height, stop the binding, kill the alpha with silver or win the moon-cup from the crypt, and bring home everyone who can still be saved.',
      map: deepWood,
      npcs: [
        { npc: 'pf_bvorrin', x: 39, y: 74 },
        { npc: 'pf_bvmattias', x: 42, y: 74 },
        { npc: 'pf_bvcrane', x: 16, y: 29, hidden: true },
        { npc: 'pf_bvhenrik', x: 68, y: 17, hidden: true },
        { npc: 'pf_bvgunnar', x: 37, y: 8, hidden: true },
        { npc: 'pf_bvliesl', x: 36, y: 9, hidden: true },
        { npc: 'pf_bvkel', x: 38, y: 9, hidden: true },
        { npc: 'pf_bvysra', x: 56, y: 6, hidden: true },
      ],
      scenes: [
        {
          room: 'Edge of the deep wood', title: 'Into the Blackroot',
          read: 'The road ends. The forest begins. Orrin kneels, touches the needles, and shows you a print as wide as your spread hand. "They went in an hour ago. The old shrine is north, past the ravine. We have until the moon tops the trees."',
          gm: 'Four hours to the moon\'s height. Each route costs time: the log bridge is quickest (1 hour to the shrine), the goat trail slower (2 hours, past the burned clearing), the fen slowest (2 hours, but it leads to the den and the hidden way into the crypt). Every fight or long rest costs about half an hour. If the heroes arrive after the moon\'s height, the binding is done (see the binding scene).',
        },
        {
          room: 'Old Fang trail', title: 'Eyes in the pines', encounter: 'Wolves on the trail',
          read: 'Eyes catch the red light between the trunks: four pairs, then ten. The wolves do not rush you. They walk alongside you, just out of reach, waiting for someone to stumble.',
          gm: 'Gunnar\'s outrunners. Burning wolfsbane, a big fire, or Orrin\'s calls turn them aside. They fight in hit-and-run rushes and break when half are down; the survivors howl the news to the shrine.',
        },
        {
          room: 'Fallen-log bridge', title: 'The log over the ravine',
          read: 'A single fallen pine bridges the ravine, its far end lost in shadow. As the first of you steps onto it, the log shifts, and from the dark on the other side comes a low, amused growl.',
          gm: 'If the wolves on the trail howled, two dire wolves wait on the far side to shove the log (DC 14 Strength contest each round they push; on a win, everyone on the log makes a DC 16 Acrobatics or falls 60 feet, 6d6). A rope rigged first (DC 12 Athletics to throw and tie) catches anyone who falls.',
        },
        {
          room: 'The Drowning Fen', title: 'The thing in the reeds', encounter: 'The thing in the bog', optional: true,
          read: 'The log path sinks under your boots. Out in the black water, a heap of rotten weed lifts itself up, and keeps lifting, until it is taller than a man.',
          gm: 'The fen route. The shambling mound is slow and stupid: fire drives it back, and anyone who stays on the log path can usually outpace it. Stepping off the path means mud and a DC 12 Strength check each turn to keep moving.',
          treasure: 'In the mound\'s heap: a drowned traveller\'s satchel with 60 gp and a potion of resistance.',
        },
        {
          room: 'The burned clearing', title: "Crane's last stand", encounter: 'Ashes of the witch-hunters',
          read: 'A ring of torches burns among black stumps. Inside it a man in blackened armour stands over two dead soldiers, his greatsword up. Outside it, two things that wear his soldiers\' torn tabards circle and laugh.',
          gm: 'Crane\'s men turned in the night. If the heroes save him, Crane admits he was wrong ("Rule seventeen is a lie") and fights with them to the end. If he was killed in Part 1, the werewolves are two loggers bitten in the first hunt. These two have killed now: no cure.',
          treasure: 'Crane\'s saddlebags: a case of 20 silvered crossbow bolts, a spell scroll of Remove Curse (if it was not already given), and 2 potions of healing.',
        },
        {
          room: 'The Weeping Stones', title: 'The stones remember', encounter: 'The weeping stones', optional: true,
          read: 'Red sap runs down the faces of nine standing stones. When you step into the ring, the wet streaks begin to move, and pale shapes pull themselves out of the stone, mouths open in silent screams.',
          gm: 'The old pack\'s victims rise if blood is spilled or steel is drawn in the ring. Calming them (DC 14 Religion, or holy water on the centre stone) turns them from foes to guides: they point to the falls and whisper "behind the water, the way the wolves forgot". The carving round the stones is the key to the cure.',
          handout: 'bv-stones',
        },
        {
          room: 'The den behind the falls', title: 'Behind the falls', encounter: 'Behind the falls',
          read: 'Through the roar of water, into a cave of bones. A huge red-bearded wolf rises from a heap of skins, and beside him his son. In a cage of bent saplings at the back, Ada Vossmark presses her hands to her mouth.',
          gm: 'Henrik and Bror guard Ada and the pack\'s trophies. Henrik fights to the death; Bror flees deeper into the crack at a quarter of his hit points (follow him and he leads the heroes into the hidden way to the crypt). Freed, Ada can tell them where Liesl is chained and how the rite starts.',
          treasure: 'The pack\'s hoard: 160 gp, four moss agates (50 gp each), Pim Hask\'s wedding ring, and a +1 shield with a wolf\'s head boss, taken from a hunter long ago.',
        },
        {
          room: 'Crypt of the first pack', title: 'The warden', encounter: "The first pack's crypt",
          read: 'The cold gathers into a shape: a tall woman of grey mist in a wolf-skin cloak, with a face that is half a wolf\'s. Along the walls, the bones in their wolf skins turn their skulls to look at you. "You come for the cup," she whispers. "Cup. Who would you cure? Cure?"',
          gm: 'Ysra. Answer her honestly and selflessly and she gives the cup and keeps the dead asleep. Greed, lies, or a cursed killer among the party wakes the wights and shades, and she joins them if attacked. The heroes may arrive by the Stair of teeth (if they get past the shrine) or by the hidden way from the den.',
          treasure: 'The moon-cup. In the vault chest: 300 gp in ancient coin, a periapt of wound closure, and the warden\'s spear, a silvered +1 spear.',
        },
        {
          room: 'Shrine of the Grey Mother', title: 'The binding', encounter: 'The binding',
          read: 'A fire roars on the altar under the great stone wolf. Old Gunnar stands before it, naked to the waist and already half a wolf, holding up a knife. Liesl and Kel kneel in chains on either side of him. He sees you and laughs. "Lad. Lass. You\'re just in time to watch."',
          gm: 'Gunnar (the alpha), Sigrun, Liesl and Kel, plus Bror if he fled the den (otherwise one of Crane\'s turned men), and seven dire wolves. If the heroes skipped the den entirely, Henrik joins too: the fight becomes deadly, so let Ysra, Crane or Orrin even the odds. Liesl and Kel start chained and fight only if the rite completes (it needs the cup: if the heroes have it, Gunnar fights to take it; if not, he has broken in and the rite takes 3 rounds). The curable ones can be called back for a round each (DC 15 Persuasion by name; DC 12 if Gunnar is dead or bloodied). Ysra can appear once to blast Gunnar with Horrifying Visage if the heroes earned her trust. If the rite completes before the heroes arrive, Liesl, Kel and Sigrun fight at full fury and cannot be called back unless Gunnar dies first.',
          treasure: 'Gunnar\'s wolf-tooth torc of the old alphas (gold, 150 gp; wearing it gives advantage on Animal Handling with wolves) and his purse of 60 gp.',
        },
        {
          room: 'Moonfall pool', title: 'The cure at moonset', optional: true,
          read: 'The red moon sinks toward the trees. You kneel at the pool and dip the cold cup into the spray, and the wolfsbane turns the water dark and bitter. Up on the hill, a frightened girl is waiting to drink.',
          gm: 'If Gunnar is dead before moonset, the curable ones are already free and this is a farewell: Ysra fades when the cup is set back on the altar. If he escaped or lives, each cured person needs the cup filled here and drunk at the altar before the moon goes down (about ten minutes each). Henrik and Bror, if still alive, cannot be cured by anything.',
        },
      ],
      wrapUp: 'At dawn the moon is pale again. Whoever was saved walks home down the Fang Road with the heroes; whoever was not runs on four legs in the Blackroot. Varrow pays what it promised and more.',
    },
  ],
  ending:
    'Good ending: Gunnar dies by silver before moonset, and Liesl, Kel and Sigrun wake human, shaking and crying, in the ruins. Mattias carries his daughter home. Varrow pays the heroes 200 gp for the beast\'s hide on top of the wall-money, Maud names a beer after them, and Orrin is welcome inside the stakes for the first time in eleven years (he still sleeps outside). If Crane lived and learned, he burns his book of rules on the green. Bad ending: the binding completes. By winter the Vossmarks are rarely seen by day; the council meets in the longhouse with the shutters closed, the mill runs at night, and travellers stop coming up the river road. Orrin leaves a letter for the heroes, in case they ever come back with more silver. What next: Henrik or Bror may have escaped into the Blackroot, cursed forever and holding a grudge. The Order of the Ashen Lantern wants to know what happened to its captain. And the Book of the Long Night mentions two more shrines of the Grey Mother, much deeper in the wood.',
};
