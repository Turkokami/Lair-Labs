// The Ember Road: a five-part starter campaign for four brand-new heroes, levels 1 to 4.
// A frontier town, a haunted waystation, a kobold mine, a hidden monastery and the heart of a waking volcano.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// ---------- little helpers for outdoor and cave maps ----------
type Pt = [number, number];

/** Every square along a line of points. */
function along(pts: Pt[], f: (x: number, y: number) => void) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= n; s++) f(Math.round(ax + ((bx - ax) * s) / n), Math.round(ay + ((by - ay) * s) / n));
  }
}

/** A w-by-w brush walked along a line of points (roads, paths). */
function brush(pts: Pt[], w: number, f: (x: number, y: number) => void) {
  along(pts, (x, y) => { for (let j = 0; j < w; j++) for (let k = 0; k < w; k++) f(x + k, y + j); });
}

/** A river with shallow banks and a deep middle. 'ns' rivers run down the map, 'ew' rivers across it. */
function river(b: MapBuilder, pts: Pt[], half: number, deepHalf: number, dir: 'ns' | 'ew') {
  const span = (r: number, deep: boolean) => along(pts, (x, y) => {
    for (let i = -r; i <= r; i++) dir === 'ns' ? b.water(x + i, y, 1, 1, deep) : b.water(x, y + i, 1, 1, deep);
  });
  span(half, false);
  if (deepHalf >= 0) span(deepHalf, true);
}

/** A flow of lava, like a river but hotter. */
function lavaFlow(b: MapBuilder, pts: Pt[], half: number, dir: 'ns' | 'ew') {
  along(pts, (x, y) => { for (let i = -half; i <= half; i++) dir === 'ns' ? b.lava(x + i, y, 1, 1) : b.lava(x, y + i, 1, 1); });
}

/** Impassable rock in a rough oval: hills, cliffs, outcrops. */
function crag(b: MapBuilder, cx: number, cy: number, rx: number, ry: number, seed: number, wob = 0.2) {
  const r = rng(seed);
  const k = 2 + Math.floor(r() * 3), p = r() * 6.28, p2 = r() * 6.28;
  for (let y = Math.floor(cy - ry * 1.5); y <= cy + ry * 1.5; y++)
    for (let x = Math.floor(cx - rx * 1.5); x <= cx + rx * 1.5; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const a = Math.atan2(dy, dx);
      const lim = 1 + wob * Math.sin(k * a + p) + wob * 0.5 * Math.sin((k + 3) * a + p2);
      if (dx * dx + dy * dy <= lim * lim) b.rock(x, y, 1, 1);
    }
}

/** Scatter a prop over plain open floor in a rectangle. */
function scatter(b: MapBuilder, kind: string, x: number, y: number, w: number, h: number, n: number, seed: number) {
  const r = rng(seed);
  for (let i = 0, tries = 0; i < n && tries < n * 40; tries++) {
    const px = x + Math.floor(r() * w), py = y + Math.floor(r() * h);
    if (b.cellAt(px, py) === 1) { b.prop(kind, px, py, Math.floor(r() * 4) * 90); i++; }
  }
}

// ---------- Part 1: Kettlebrook and Snagtooth Hollow ----------
function kettlebrook() {
  const b = new MapBuilder('adv-emr-kettlebrook', 'Kettlebrook and Snagtooth Hollow', 80, 64, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });

  // the goblin hill: a big lump of rock on the east side, with a crest of open ground on top
  b.rock(58, 12, 22, 52);
  crag(b, 58, 18, 2, 5, 101);
  crag(b, 57, 45, 2, 6, 102);
  crag(b, 59, 56, 2, 3, 103);
  crag(b, 55, 8, 2.5, 3, 104);

  // roads: the Ember Road comes in from the west, crosses the brook and turns north for the mountains
  brush([[0, 23], [12, 23], [30, 23], [40, 23], [40, 14], [39, 6], [40, 0]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[41, 24], [48, 29], [56, 32]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[20, 25], [21, 38], [25, 42]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.paint(6, 19, 18, 10, 'stone-cobble');

  // Kettle Brook runs down the middle of the map; a stone bridge on the road, a ford to the south
  river(b, [[34, 0], [33, 9], [35, 18], [34, 28], [36, 38], [35, 48], [37, 63]], 2, 0, 'ns');
  b.floor(31, 23, 9, 2, 'stone-cobble');
  b.water(31, 50, 9, 2, false);

  // the palisade: a low wooden fence round the town, with gaps for the gates
  b.wallRun(2, 5, 12, 'n', 'low').wallRun(16, 5, 7, 'n', 'low');
  b.wallRun(2, 5, 18, 'w', 'low').wallRun(2, 25, 22, 'w', 'low');
  b.wallRun(2, 46, 18, 's', 'low').wallRun(22, 46, 9, 's', 'low');
  b.props_('fence-gate', [[14, 5], [2, 23], [20, 46]]);
  b.area('West gate', [[0, 20, 5, 7]], {
    read: 'A gap in a fence of sharpened logs, a rope across the road, and a bored watchman on an upturned bucket. A painted board says KETTLEBROOK. MIND THE GEESE.',
    gm: 'The town is small and friendly. The watch is two old farmers and a bell. The geese are real and they bite (no damage, just pride).',
    label: [1, 23],
  });

  // ----- the town -----
  b.building('The Bent Horseshoe', 6, 8, 13, 10, {
    mat: 'wood-planks',
    read: 'A long, low inn with a crooked iron horseshoe nailed over the door. Inside: a crackling fire, a dog asleep under a table, and the smell of onion pie.',
    gm: 'The heart of Kettlebrook. Marigold Brisby runs it and knows everyone\'s business. Rooms are 5 sp a night, pie and ale 4 cp. The notice board by the door has the reward notice (handout). Stairs go up to six guest rooms (not mapped).',
    doors: [[12, 17, 's', 'closed', 'door-double'], [13, 17, 's', 'closed', 'door-double'], [6, 12, 'w', 'closed']],
    windows: [[8, 17, 's'], [16, 17, 's'], [6, 9, 'w'], [10, 8, 'n']],
  });
  b.wallRun(15, 8, 5, 'e').wallRun(16, 12, 3, 's');
  b.door(15, 10, 'e', 'closed');
  b.area('Inn kitchen', [[16, 8, 3, 5]], { gm: 'Pots, pies and Marigold\'s cat. A back door would be nice; there isn\'t one. The pantry shelf holds two potions of healing Marigold keeps "for heroes, and fools, which is mostly the same".' });
  b.prop('bar-counter', 9, 9).prop('keg-rack', 7, 9).props_('table-round', [[8, 13], [11, 14], [14, 13]]).props_('chair', [[7, 13], [9, 13], [10, 14], [12, 14], [13, 13], [14, 14]]);
  b.prop('fireplace', 12, 9).prop('notice-board', 14, 16).prop('stairs-up', 7, 16).prop('dartboard', 17, 15).prop('rug', 11, 12);
  b.prop('hearth-oven', 17, 9).prop('pot-rack', 18, 10).prop('kitchen-table', 17, 11).prop('barrel', 16, 9);
  b.light(12, 10, 15, 20).light(9, 9, 5, 10);
  b.building('Inn stable', 19, 12, 4, 5, { mat: 'dirt', gm: 'Two ponies, a mule with opinions, and a hayloft. Hobart\'s handcart lives here.', doors: [[20, 16, 's', 'open']] });
  b.props_('hay-bale', [[19, 12], [22, 13]]).prop('water-trough', 21, 14).prop('handcart', 20, 13);
  b.props_('hitching-post', [[10, 18], [16, 18]]).prop('tavern-sign', 13, 18);

  b.building('Shrine of the Old Stone', 23, 5, 7, 8, {
    mat: 'marble',
    read: 'A small white shrine with a mossy roof. In the middle of the floor is a round stone socket, polished by centuries of hands, and it is empty. Scratches and a broken rope show where something heavy was dragged out.',
    gm: 'For a thousand years a waist-high grey stone sat here, carved with a sleeping face. Townsfolk touched it for luck. Three nights ago goblins dug it out and dragged it away. The tracks are obvious (no check) and lead east over the bridge. A DC 12 Investigation finds a scrap of red cloth on a nail and a print of a man\'s boot among the goblin feet: someone tall was with them.',
    doors: [[25, 12, 's', 'closed', 'door-double'], [26, 12, 's', 'closed', 'door-double']],
    windows: [[23, 8, 'w'], [29, 8, 'e']],
  });
  b.prop('plinth-display', 26, 8).prop('rubble-pile', 25, 9).props_('candles', [[24, 6], [28, 6]]).props_('prayer-kneeler', [[25, 10], [27, 10]]).prop('rope-coil', 27, 9).prop('offering-bowl', 26, 6);
  b.light(26, 7, 10, 15, '#ffe6a0');

  b.building("Hobart's cottage", 24, 15, 6, 5, {
    mat: 'wood-planks-dark',
    read: 'A cottage so full of books that the books have started living outside it, under a tarp. A sign says HISTORIAN. KNOCK LOUDLY. THEN WAIT.',
    gm: 'Hobart Fawley, keeper of the shrine and the town\'s only scholar. His desk holds a rubbing of the Old Stone\'s carvings. In part 1 he cannot tell what the stone really is; once the heroes bring back the cult\'s letter, he digs out the old ward-song (handout) and works it out.',
    doors: [[24, 17, 'w', 'closed']], windows: [[29, 17, 'e'], [26, 19, 's']],
  });
  b.prop('desk', 27, 16).prop('bookshelf', 25, 15).prop('book-pile', 28, 18).prop('bed', 25, 18).prop('candles', 27, 17).light(27, 16, 5, 10);

  b.area('Kettlebrook green', [[6, 19, 18, 10]], {
    read: 'Cobbles round a well, a maypole with faded ribbons, and an oak so old its lowest branch is propped on a stick. Market stalls sell eggs, rope and very small pies.',
    gm: 'The town square. Everyone here has a rumour about the goblins (see the scene). The well bucket is a good place for kids to hide notes. On market day the green fills with farmers.',
    label: [14, 24],
  });
  b.prop('well', 14, 21).prop('banner-pole', 9, 26).props_('market-stall', [[7, 20], [18, 20], [7, 27]]).prop('produce-stall', 18, 27).prop('tree-oak', 22, 27).props_('bench', [[11, 21], [17, 22]]).prop('notice-board', 15, 20);
  b.props_('lamp-post', [[6, 22], [23, 21], [13, 28]]);
  for (const [x, y] of [[6, 22], [23, 21], [13, 28]] as Pt[]) b.light(x, y, 10, 15);

  b.building('West watch post', 2, 17, 4, 4, { gm: 'A shed with a bell and a rack of old spears. Borrow one, return it, and the watch is happy.', doors: [[4, 20, 's', 'closed']] });
  b.prop('temple-bell', 3, 18).prop('spear-rack', 4, 18);

  b.building('Smithy', 3, 30, 7, 6, {
    mat: 'stone-flagstone',
    read: 'Heat, sparks and a ringing anvil. Horseshoes hang from every beam like iron bats.',
    gm: 'The smith sells basic weapons and armor at book price and fixes things for free for anyone hunting goblins. She noticed the goblins carried new iron spearheads, "good work, not goblin work".',
    doors: [[9, 32, 'e', 'open']], windows: [[5, 30, 'n']],
  });
  b.prop('forge', 4, 31).prop('anvil', 6, 32).prop('weapon-rack', 8, 31).prop('tool-wall', 4, 34).prop('water-barrel', 7, 34).prop('grindstone', 10, 33).light(4, 31, 10, 15, '#ff8a3c');

  b.building("Weaver's cottage", 13, 31, 5, 4, { gm: 'A loom, a cat, and a weaver who swears she saw a man in a red cloak at the edge of the wood, the night before the theft.', doors: [[15, 31, 'n', 'closed']] });
  b.prop('loom', 14, 32).prop('spinning-wheel', 16, 33);
  b.building('Herb garden cottage', 13, 37, 5, 4, { gm: 'The town healer\'s house. Herbs for a copper; healing kits for 5 gp; a free cup of nettle tea and a lecture about wet feet.', doors: [[15, 37, 'n', 'closed']] });
  b.prop('herbs-drying', 14, 38).prop('apothecary-counter', 16, 39);
  b.building('Old barn', 4, 39, 6, 5, { gm: 'Empty apart from hay and a ladder to a loft where two children are pretending to be goblins.', doors: [[6, 39, 'n', 'open', 'door-double']] });
  b.props_('haystack', [[5, 41], [8, 42]]).prop('ladder', 4, 42);
  b.props_('crop-rows', [[22, 33], [24, 35], [22, 37]]).prop('scarecrow', 25, 33).prop('chicken-coop', 11, 44).prop('beehive', 18, 43);

  b.building('Kettlebrook mill', 26, 40, 6, 6, {
    mat: 'wood-planks',
    read: 'The mill wheel is still. Inside, flour dust hangs in the air, and something has chewed every sack open.',
    gm: 'The miller fled upstairs when the rats came: giant rats, driven out of the woods by the goblins\' wolves. Clearing them earns a free bag of flour (worthless) and the miller\'s gratitude (a boat on the brook, any time). A DC 12 Survival shows the rats came in from the brook.',
    doors: [[26, 42, 'w', 'closed'], [28, 45, 's', 'closed']], windows: [[31, 43, 'e']],
  });
  b.prop('grindstone', 28, 42).props_('flour-sacks', [[27, 41], [30, 44]]).prop('trapdoor', 30, 41).prop('sack', 27, 44).prop('winch', 32, 42);
  b.encounter('Rats in the mill', [26, 40, 6, 6], [['giantRat', 4]], 'low');

  // ----- east bank: the Brisby farm, the road north and Thornwick Wood -----
  b.building('Brisby farmhouse', 43, 5, 7, 6, {
    mat: 'wood-planks',
    read: 'A stout farmhouse with a smashed window and a door hanging by one hinge. Feathers everywhere.',
    gm: 'Marigold\'s brother Haddo Brisby farms here. Goblins raided last night for sheep and chickens. If the heroes come before noon, three goblin warriors are still here, looting the larder (see the fight).',
    doors: [[46, 10, 's', 'open', 'door-broken']], windows: [[49, 7, 'e'], [44, 5, 'n']],
  });
  b.prop('kitchen-table', 45, 7).prop('broken-furniture', 47, 8).prop('hearth-oven', 44, 6).prop('bed', 48, 6);
  b.building('Brisby barn', 51, 3, 6, 8, { gm: 'The barn the goblins could not open (Haddo barred it). Inside, a cow, a terrified dog and Haddo himself.', doors: [[51, 7, 'w', 'locked', 'door-double']] });
  b.props_('hay-bale', [[52, 4], [55, 9]]).prop('milk-churn', 54, 5);
  b.wallRun(43, 13, 12, 'n', 'low').wallRun(43, 19, 12, 's', 'low').wallRun(43, 13, 7, 'w', 'low').wallRun(54, 13, 3, 'e', 'low').wallRun(54, 17, 3, 'e', 'low');
  b.prop('fence-gate', 54, 16);
  b.area('Brisby farm', [[42, 3, 15, 17]], {
    read: 'A sheep pen with the gate kicked open, a trail of wool, and small muddy footprints going everywhere at once.',
    gm: 'Goblin tracks lead off south-east toward the hill (DC 10 Survival, or follow the wool). The goblins drove twelve sheep; four got loose and are in the wood.',
    label: [48, 16],
  });
  b.props_('water-trough', [[45, 15], [51, 17]]).prop('chicken-coop', 50, 13).prop('scarecrow', 47, 18).props_('bones', [[49, 15]]);
  b.encounter('Goblins at the Brisby farm', [42, 3, 15, 17], [['goblinWarrior', 3]], 'low');

  b.area('Thornwick Wood', [[38, 28, 18, 26]], {
    read: 'Old oaks, deep moss and a quiet that makes you whisper. Wolf prints in the mud are as big as your hand.',
    gm: 'The wood between town and the goblin hill. Two paths: the goblin track (straight to the cave mouth) and the deer trail (south, past the wolf den, to the stream mouth: the back way in). A DC 12 Survival finds the deer trail.',
    label: [46, 34],
  });
  b.area('Wolf den', [[42, 38, 10, 8]], {
    read: 'A hollow under a fallen oak, bones scattered round the entrance, and three pairs of yellow eyes.',
    gm: 'Three wolves the goblins feed and half-tame. They are hungry, not loyal: meat (a sheep, rations) and a DC 12 Animal Handling turns them away. A wolf that drops to half its hit points runs.',
    label: [46, 41],
  });
  b.prop('log-fallen', 46, 40).props_('bones', [[45, 42], [48, 41]]).prop('stump', 44, 39);
  b.encounter('Wolves of Thornwick Wood', [41, 37, 12, 10], [['wolf', 3]], 'low');
  b.building("Woodcutter's hut", 39, 54, 6, 5, {
    gm: 'Abandoned since the wolves came. A woodcutter\'s axe (handaxe), a lantern, and a map scratched on the table showing the stream mouth under the hill: "goblins come out here to fish".',
    doors: [[41, 54, 'n', 'closed']],
  });
  b.prop('table-trestle', 41, 56).prop('firewood', 43, 57).prop('lantern-standing', 40, 57).prop('log-pile', 45, 53);
  b.area('Wayside stone', [[48, 22, 6, 5]], {
    read: 'A knee-high stone by the track, carved with the same sleeping face as the Old Stone, worn almost smooth.',
    gm: 'A clue for curious heroes. A DC 13 History or Religion: an old marker, older than the town, "a boundary stone, or a warning". It faces the mountains to the north. Hobart will be thrilled to hear about it.',
  });
  b.prop('road-shrine', 50, 24).props_('flowers', [[49, 25], [52, 23]]);

  // ----- Snagtooth Hollow: the goblin caves -----
  b.area('Snagtooth crest', [[57, 0, 23, 11]], {
    read: 'The top of the hill is a tangle of thorn bushes and grey boulders, like broken teeth. Smoke drifts out of a crack in the ground.',
    gm: 'The back way in. Climbing up from the farm side is easy; from the wood it is a DC 10 Athletics scramble. The smoking crack is the chimney over Gutnab\'s den, hidden under brambles (DC 13 Perception to find the hole, then a tight, sooty 25-foot climb down). Heroes who come this way arrive behind Gutnab.',
    label: [66, 5],
  });
  b.props_('thorn-bush', [[60, 3], [64, 7], [70, 2], [75, 6], [72, 10]]).props_('boulder', [[62, 9], [68, 4], [77, 9]]).prop('boulder-large', 73, 3);
  b.hall(72, 9, 72, 16, 1, { mat: 'cave-floor' });
  b.door(72, 12, 'n', 'secret');
  b.prop('brambles', 72, 10).prop('gm-secret-door', 72, 11, 0, { gm: true });

  b.cave('Cave mouth', 61, 33, 4, 3, {
    seed: 111, mat: 'cave-floor',
    read: 'A dark mouth in the hillside, hung with goblin trophies: a saucepan, a scarecrow\'s head and a sign in bad Common: KEEP OWT. THIS MEENS YOU.',
    gm: 'Two goblin warriors and two goblin minions keep a lazy watch from a ledge. A tripwire across the mouth rings a string of pots (DC 12 Perception to spot it); if it rings, the common cave is ready for the heroes. Goblins who lose half their number run inside to warn Gutnab.',
  });
  b.prop('trap-tripwire', 59, 33).props_('torch-sconce', [[60, 31], [63, 35]]).prop('crate', 63, 31).prop('campfire', 62, 34).light(62, 34, 10, 15);
  b.encounter('Cave mouth guards', [56, 29, 9, 8], [['goblinWarrior', 2], ['goblinMinion', 2]], 'low');

  b.cave('Wolf pen', 64, 23, 4, 3, { seed: 112, mat: 'cave-floor', gm: 'Where the goblins keep two half-starved wolves and their minders. Feeding the wolves (DC 11 Animal Handling with food) makes them ignore the heroes. The wolves can also be set loose on the goblins.' });
  b.tunnel([[61, 31], [63, 26]], 2, { seed: 113 });
  b.props_('bones', [[63, 22], [66, 24]]).prop('water-trough', 65, 22).prop('cage', 62, 23);
  b.encounter('Goblin wolf-minders', [60, 20, 9, 7], [['wolf', 2], ['goblinMinion', 2]], 'low');

  b.cave("Gutnab's den", 73, 20, 4, 3.5, {
    seed: 114, mat: 'cave-floor',
    read: 'A cave hung with stolen curtains. A throne made of a rocking chair and three saddles. On it sprawls a big goblin with a cooking-pot helmet, counting red-glass coins.',
    gm: 'Gutnab, the goblin boss, and his bodyguards. He was paid in red-glass "ember coins" by a tall man in a red cloak to steal the Old Stone, and he is very proud of the deal. He will talk if it looks like he is losing: he swaps the location of the stone (and the red man\'s name, "the Kindler\'s man") for his life. The chimney from the crest comes down behind his throne.',
  });
  b.tunnel([[67, 22], [70, 20]], 2, { seed: 115 });
  b.hall(73, 23, 73, 30, 1, { mat: 'cave-floor' });
  b.prop('throne', 74, 19).props_('rug', [[72, 21]]).prop('treasure-pile', 75, 21).prop('chest', 71, 18).prop('brazier', 72, 18).prop('loot-sacks', 76, 20).light(72, 18, 10, 15);
  b.encounter("Gutnab's den", [69, 16, 9, 9], [['goblinBoss', 1], ['goblinWarrior', 2], ['goblinMinion', 2]], 'high');

  b.cave('Goblin common cave', 70, 34, 6, 4.5, {
    seed: 116, mat: 'cave-floor',
    read: 'A smoky cave full of goblins, sheep, and noise. A sheep is turning on a spit. Somebody is playing a drum made out of a stolen bucket.',
    gm: 'The main lair. Four goblin warriors and four minions, unless the alarm rang (then they wait in ambush behind the sheep). Sheep panic in a fight: any square with a sheep is difficult terrain. A loud distraction (DC 13 Performance or Deception, such as "the wolves are loose!") sends half of them running to the wolf pen.',
  });
  b.tunnel([[64, 33], [66, 34]], 2, { seed: 117 });
  b.prop('campfire-spit', 70, 34).props_('bedroll', [[66, 32], [74, 31], [71, 37]]).props_('sack', [[67, 37], [75, 35]]).prop('barrel', 68, 31).prop('bones', 72, 36).light(70, 34, 15, 20);
  b.encounter('Goblin common cave', [64, 29, 13, 11], [['goblinWarrior', 4], ['goblinMinion', 4]], 'moderate');

  b.cave('Sheep pen cave', 64, 44, 3.5, 3, {
    seed: 118, mat: 'cave-floor',
    gm: 'Eight stolen sheep, very unhappy, and Wat, the miller\'s boy (12), tied to a post. He went looking for his dog. He saw the "red man" pay Gutnab and heard him say the stone was "number one of seven". A crawl in the back wall, hidden behind a hay heap (DC 12 Investigation), leads to the fungus grotto.',
  });
  b.tunnel([[67, 38], [65, 41]], 2, { seed: 119 });
  b.props_('hay-bale', [[63, 43], [65, 46]]).prop('water-trough', 66, 43).prop('stocks', 62, 45);
  b.hall(64, 47, 64, 52, 1, { mat: 'cave-floor' });
  b.door(64, 48, 'n', 'secret');
  b.cave('Fungus grotto', 63, 55, 4, 3, {
    seed: 120, mat: 'cave-floor',
    read: 'Mushrooms as tall as children glow soft blue in the dark. In the middle lies a skeleton in rusted armor, one hand still on a sack.',
    gm: 'A secret the goblins never found. The skeleton was a town watchman who chased goblins here forty years ago. His sack: 35 gp, a silver whistle (5 gp) and a potion of healing. The glowing fungus is harmless; eating it makes your hair glow for an hour.',
  });
  b.props_('mushroom-giant', [[61, 54], [65, 56]]).props_('glowing-fungus', [[62, 57], [64, 53]]).prop('skeleton-lying', 63, 55).prop('gm-treasure', 64, 55, 0, { gm: true }).light(62, 55, 5, 10, '#6ad8ff');

  b.cave('Hall of the stolen stone', 73, 46, 4.5, 3.5, {
    seed: 121, mat: 'cave-floor',
    read: 'On a goblin cart in the middle of a damp cave sits a waist-high grey stone carved with a sleeping face. Three humans in red-hooded cloaks are hitching a mule to the cart.',
    gm: 'The Old Stone, and the cult\'s collectors: three cultists of the Waking Flame who came to fetch it tonight, with two goblin minions to push. They fight to drag it away through the stream tunnel. Beaten, the leader\'s satchel holds the collection order (handout). Touching the stone feels cool, like a hand on a fevered brow; a DC 12 Arcana senses old, sleepy magic.',
  });
  b.tunnel([[72, 38], [73, 43]], 2, { seed: 122 });
  b.prop('cart', 73, 46).prop('rune-stone', 74, 46).prop('hitching-post', 71, 47).prop('lantern-standing', 76, 45).light(76, 45, 10, 15);
  b.encounter('The red-hooded collectors', [68, 42, 11, 9], [['cultist', 3], ['goblinMinion', 2]], 'low');

  b.tunnel([[74, 49], [75, 55], [70, 60], [60, 61], [55, 61]], 2, { seed: 123 });
  b.area('Underground stream', [[60, 58, 16, 5]], {
    read: 'Cold water chatters over stones in a low tunnel. Fish bones and goblin footprints line the bank.',
    gm: 'The goblins\' fishing tunnel and the back way out to the wood (where the woodcutter\'s map points). It is a crouching walk; Medium heroes squeeze through at half speed. A DC 12 Stealth gets the whole party in unheard.',
    label: [67, 60],
  });
  b.area('Stream mouth', [[52, 58, 6, 6]], { gm: 'A low arch where the underground stream comes out of the hill into a reedy pool. Goblin fishing lines, a basket of trout, and footprints going in.' });
  b.pool(54, 61, 3, 2);
  b.props_('reeds', [[52, 60], [56, 59]]).prop('sewer-outflow', 57, 61).prop('fishing-gear', 55, 59);
  for (let x = 60; x < 75; x += 1) if (b.isFloor(x, 61)) b.water(x, 61, 1, 1, false);

  // trees, bushes and stones
  scatter(b, 'tree-oak', 38, 26, 19, 30, 22, 131);
  scatter(b, 'bush', 38, 26, 19, 30, 10, 132);
  scatter(b, 'tree-pine', 0, 48, 30, 16, 12, 133);
  scatter(b, 'tree-oak', 0, 0, 30, 5, 5, 134);
  scatter(b, 'boulder', 56, 0, 24, 11, 3, 135);
  scatter(b, 'flowers', 3, 47, 25, 16, 6, 136);
  scatter(b, 'reeds', 30, 0, 9, 64, 10, 137);
  scatter(b, 'tree-birch', 44, 20, 13, 8, 4, 138);
  b.start(10, 18, 3, 1);
  return b.build();
}

// ---------- Part 2: Hollowell Waystation and Greyfen Fort ----------
function emberRoad() {
  const b = new MapBuilder('adv-emr-greyfen', 'The Ember Road: Hollowell Waystation and Greyfen Fort', 80, 70, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });

  // the hill the fort stands on: cliffs to the east and south-east, a slope of rock under the west wall
  crag(b, 79, 36, 2, 14, 201, 0.15);
  crag(b, 79, 62, 6, 6, 202);
  crag(b, 72, 63, 4, 3, 203);
  crag(b, 53, 8, 3, 4, 204);
  crag(b, 58, 12, 3, 2.5, 205);
  b.rock(49, 43, 7, 9);
  b.rock(78, 44, 2, 14);
  // the cellar under the waystation is drawn to the north of it, under a low hill
  b.rock(4, 6, 26, 16);

  // the Ember Road
  brush([[0, 38], [30, 38], [38, 39], [50, 39], [56, 38]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[66, 0], [67, 10], [70, 18]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[63, 56], [60, 60], [52, 62], [46, 62]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));

  // Greyfen Water and the marsh round it
  river(b, [[44, 0], [43, 15], [45, 30], [44, 45], [46, 60], [45, 69]], 2, 1, 'ns');
  b.floor(39, 38, 11, 2, 'stone-cobble');
  b.rubble(44, 38, 2, 1);
  b.floor(38, 12, 11, 1, 'wood-planks');
  b.water(39, 61, 12, 3, false);
  b.mud(33, 28, 7, 6).mud(48, 22, 6, 5).mud(34, 47, 6, 6).mud(49, 54, 5, 4);
  b.pool(36, 18, 3, 2).pool(51, 30, 2, 2).pool(37, 57, 2.5, 2);
  b.area('Greyfen marsh', [[32, 14, 20, 46]], {
    read: 'Grey water, grey reeds, grey mist. Frogs go quiet as you pass. Out in the fen, a heron stands on one leg and watches you like a bored judge.',
    gm: 'Mud is difficult terrain. Three ways across Greyfen Water: the old stone bridge on the road (watched from the fort), a fallen tree to the north (DC 10 Acrobatics or fall in, wet and embarrassed), and the ford to the south (waist-deep, safe). The fort sees anyone on the bridge in daylight.',
    label: [38, 24],
  });
  b.area('Greyfen bridge', [[38, 37, 13, 4]], {
    read: 'An old stone bridge with a crack down the middle. Someone has stacked fresh bones on the parapet: a warning.',
    gm: 'In plain view of the fort gate 200 feet away. A DC 12 Perception spots a bandit lookout on the gatehouse roof. Crossing by night or in the mist (DC 11 Stealth as a group) avoids notice.',
    label: [44, 39],
  });
  b.props_('skull-pile', [[40, 37], [48, 40]]).prop('milestone', 37, 38);
  b.area('Fallen-tree crossing', [[37, 9, 13, 6]], { gm: 'A huge willow fell across the stream years ago. Wolves use it too; their tracks lead into the fen.' });
  b.prop('log-fallen', 43, 12, 90).prop('tree-willow', 37, 11);
  b.area('Southern ford', [[38, 59, 14, 6]], { gm: 'Waist-deep and slow. From here a goat track climbs to the breach in the fort\'s south wall.' });
  b.props_('boulder', [[41, 60], [48, 63]]);
  b.encounter('Fen wolves', [32, 24, 12, 12], [['wolf', 4]], 'low');

  b.area("Peddler's camp", [[50, 56, 8, 8]], {
    read: 'A tiny painted cart, a donkey wearing a hat, and a smoky fire. A woman with nine rings and one tooth waves a ladle at you. "Customers! Real ones, not dead ones!"',
    gm: 'Granny Pimm, a wandering peddler, is waiting for the road to be safe. She sells potions of healing (50 gp, haggle to 40 with DC 12 Persuasion), rope, oil and gossip. She saw the bandits let a red-cloaked rider through "like an old friend".',
    label: [53, 59],
  });
  b.prop('merchant-cart', 52, 58).prop('campfire', 54, 60).prop('tent', 51, 61).prop('cooking-pot-fire', 55, 59).light(54, 60, 10, 15);

  // ----- Hollowell Waystation -----
  b.paint(4, 22, 28, 30, 'dirt');
  b.wallRun(4, 22, 28, 'n').wallRun(4, 51, 8, 's').wallRun(14, 51, 18, 's');
  b.wallRun(4, 22, 16, 'w').wallRun(4, 40, 12, 'w').wallRun(31, 22, 16, 'e').wallRun(31, 40, 12, 'e');
  b.area('Hollowell yard', [[5, 32, 26, 18]], {
    read: 'A walled yard of trampled mud, a dry well, and a wagon tipped on its side. Nobody has lit a lamp here for a month. The gate creaks in a wind you cannot feel.',
    gm: 'Hollowell was the last safe stop before the fort. A month ago the cult broke the ward-stone in its cellar, and the old dead of the graveyard got up. Now the waystation is empty by day and busy by night. By day the dead stay in the dark (common room, cellar, tomb); after sunset they walk the yard.',
    label: [17, 38],
  });
  b.prop('well', 17, 35).prop('wagon', 25, 34, 30).props_('barrel', [[20, 33], [27, 37]]).prop('water-trough', 9, 36).prop('signpost', 2, 37).props_('lamp-post', [[5, 37], [5, 40], [30, 37], [30, 40]], 0);
  b.light(17, 35, 5, 10, '#9fc7ff');

  b.building('Hollowell common room', 7, 22, 14, 9, {
    mat: 'wood-planks-dark',
    read: 'Long tables still set for supper, plates furred with mould. Chairs knocked over. In the cold hearth, a lantern is somehow still burning with a pale green flame.',
    gm: 'Six zombies (travellers and staff, a month dead) shuffle here in the dark. They are slow and stupid: a hero who holds a burning brand at the door makes them hesitate. The green lantern is Cuthbert Lowe\'s ghost-light; if the heroes do not attack it, the ghost appears after the fight (see the scene). Stairs behind the bar go down to the cellar.',
    doors: [[13, 30, 's', 'closed', 'door-double'], [14, 30, 's', 'closed', 'door-double'], [7, 27, 'w', 'closed'], [12, 22, 'n', 'closed']],
    windows: [[9, 30, 's'], [18, 30, 's'], [7, 24, 'w']],
  });
  b.wallRun(16, 22, 5, 'e').wallRun(17, 26, 4, 's');
  b.door(16, 24, 'e', 'closed');
  b.area('Waystation kitchen', [[17, 22, 4, 5]], { gm: 'Black bread, broken crockery and a larder of pickles that are, amazingly, still good. A hidden shelf above the oven (DC 12 Investigation) holds the waystation cashbox: 28 gp.' });
  b.props_('table-long', [[10, 26], [13, 27]]).props_('bench', [[10, 25], [13, 28]]).prop('bar-counter', 9, 23).prop('stairs-down', 12, 23).prop('fireplace', 15, 23).props_('broken-furniture', [[18, 28], [8, 29]]).prop('lantern-hook', 15, 24);
  b.prop('hearth-oven', 19, 23).prop('pot-rack', 18, 23).prop('cupboard', 20, 25);
  b.light(15, 24, 10, 15, '#7dff9a');
  b.encounter('The restless common room', [7, 22, 14, 9], [['zombie', 6]], 'low');

  b.building('Guest wing', 22, 22, 9, 7, {
    mat: 'wood-planks',
    gm: 'Three small guest rooms, each with a bed and a chest. In the middle one a hero finds a merchant\'s diary (see the scene).',
    doors: [[23, 28, 's', 'closed'], [26, 28, 's', 'closed'], [29, 28, 's', 'closed']],
  });
  b.wallRun(24, 22, 7, 'e').wallRun(27, 22, 7, 'e');
  b.props_('bed', [[23, 23], [26, 23], [29, 23]]).props_('chest', [[22, 26], [25, 26], [30, 26]]).prop('writing-desk', 26, 25);

  b.building('Waystation stables', 22, 41, 9, 9, {
    mat: 'dirt',
    gm: 'Empty stalls and the bones of two horses. A skeleton horse (warhorse skeleton) stands in the last stall, perfectly still, and follows the heroes around the yard like a lost dog unless attacked. It was Cuthbert\'s horse. If the heroes lay the ward to rest, it lies down and is still.',
    doors: [[22, 44, 'w', 'open', 'door-double'], [22, 45, 'w', 'open', 'door-double']],
  });
  b.props_('hay-bale', [[23, 42], [29, 48]]).props_('bones', [[26, 43], [28, 46]]).prop('water-trough', 25, 48);

  b.building('Storehouse', 6, 42, 6, 7, { gm: 'Sacks of oats, a barrel of lamp oil (useful against zombies: 2 flasks of oil), rope and a crowbar.', doors: [[11, 45, 'e', 'closed']] });
  b.props_('sack', [[7, 43], [8, 47]]).prop('barrel-group', 9, 43).prop('rope-coil', 7, 45);

  b.area('The broken ward-shrine', [[13, 42, 7, 6]], {
    read: 'A ring of six little standing stones, and in the middle a seventh pillar snapped off at the knee. Its top half lies in the mud, carved with a sleeping face.',
    gm: 'Not the real ward: a road-shrine copy, the kind travellers touch for luck. The real ward-stone was in the cellar. A DC 12 Investigation: the break is fresh, and done with a sledgehammer; someone wanted it to look like the shrine was the target.',
    label: [16, 44],
  });
  b.props_('standing-stone', [[14, 43], [18, 43], [13, 45], [19, 45], [14, 47], [18, 47]]).prop('pillar-broken', 16, 45).prop('rubble-pile', 17, 46);

  // the cellar under the common room
  b.floor(12, 20, 1, 2, 'dungeon-slab');
  b.room('Waystation cellar', 8, 14, 10, 6, {
    mat: 'dungeon-slab',
    read: 'Damp stone, barrels, and the sweet, rotten smell of spilled wine. Wet footprints lead across the floor to a door that should not be standing open.',
    gm: 'Plain storage. The footprints are a month old and dried hard: heavy boots, four people (DC 13 Survival). The east door leads to the ward chamber. Behind the wine racks (DC 13 Investigation) a loose stone hides a smuggler\'s purse: 15 gp and a silver ring (25 gp).',
  });
  b.props_('barrel-stack', [[9, 15], [9, 18]]).props_('wine-rack', [[11, 14], [14, 14]]).prop('stairs-up', 12, 19).prop('crate-stack', 16, 18).prop('gm-treasure', 15, 14, 0, { gm: true });
  b.room('Collapsed storeroom', 8, 9, 6, 4, { mat: 'dungeon-slab', gm: 'Half fallen in. Rats, mushrooms and a stuck door into nothing.' });
  b.floor(10, 13, 1, 1, 'dungeon-slab');
  b.rubble(11, 9, 3, 2);
  b.props_('mushrooms', [[9, 10]]).prop('ceiling-rubble', 12, 11);
  b.floor(18, 15, 1, 1, 'dungeon-slab');
  b.door(17, 15, 'e', 'closed', 'door-iron');
  b.room('Ward chamber', 19, 10, 8, 7, {
    mat: 'stone-flagstone',
    read: 'A round room cut into living rock. Carved on every wall: sleeping faces, eyes closed, mouths open in a song. In the middle, an empty socket in the floor. The air is freezing, and something in the dark is singing the wrong song, high and angry.',
    gm: 'The real ward-stone sat here for a thousand years, and it kept the waystation\'s dead asleep along with the mountain. The cult took it a month ago. Its absence woke the dead, and the angriest is a specter, the shade of a cultist the others killed and left here to "guard" the room. With it: four skeletons and two zombies. If the heroes sing, hum or play anything calm (DC 12 Performance), the skeletons stop for one round. When the specter falls, the cold lifts. A crowbar left by the cult lies by the socket.',
  });
  b.prop('pit-deep', 22, 13).props_('candles', [[20, 11], [25, 15]]).props_('pillar-round', [[20, 15], [25, 11]]).prop('tool-crate', 24, 13);
  b.encounter('The broken ward', [19, 10, 8, 7], [['specter', 1], ['skeleton', 4], ['zombie', 2]], 'moderate');
  b.hall(22, 5, 22, 9, 1, { mat: 'cave-floor' });
  b.door(22, 10, 'n', 'secret');
  b.area("Smugglers' crawl", [[21, 5, 3, 5]], { gm: 'A secret crawl from the ward chamber up to the orchard, older than the waystation. The cult left this way. The cellar side is a sliding stone (DC 13 Investigation); from the orchard, a mossy slab under a stump (DC 14 Perception).' });

  b.area('Old orchard', [[2, 0, 30, 6]], {
    read: 'Gnarled apple trees run wild above the waystation. Windfalls rot in the grass. Wasps everywhere.',
    gm: 'A quiet way round the waystation. The mossy slab here hides the smugglers\' crawl. Apples are edible and good.',
    label: [15, 2],
  });
  scatter(b, 'tree-oak', 2, 0, 30, 6, 10, 211);
  b.prop('stump', 22, 4).prop('beehive', 9, 3);

  // the graveyard behind the waystation
  b.wallRun(2, 53, 9, 'n', 'low').wallRun(14, 53, 13, 'n', 'low').wallRun(2, 53, 15, 'w', 'low').wallRun(26, 53, 15, 'e', 'low');
  b.area('Hollowell graveyard', [[2, 53, 25, 16]], {
    read: 'Crooked headstones lean like drunk men. Half the graves are open, earth thrown outward. Something has scratched words on the inside of a coffin lid: WHY CAN\'T I SLEEP.',
    gm: 'Six skeletons rise from the open graves at night (or if anyone disturbs a grave). They are what is left of the waystation\'s first keepers. They stop and lie down at once if the heroes have already laid the ward chamber to rest. The tomb holds the waywarden\'s family.',
    label: [10, 60],
  });
  b.props_('open-grave', [[5, 56], [9, 57], [13, 60], [6, 63], [10, 65]]).props_('burial-slab', [[4, 60], [12, 55], [8, 66]]).props_('tree-dead', [[3, 54], [24, 66]]).prop('statue', 20, 56).prop('skull-pile', 15, 64);
  b.encounter('Hollowell graveyard', [2, 53, 25, 16], [['skeleton', 6]], 'low');
  b.building('Lowe family tomb', 17, 59, 7, 6, {
    mat: 'marble',
    gm: 'Cuthbert Lowe, the waywarden, is buried here with his wife. His sarcophagus is closed and undisturbed. A brass plaque: "He kept the road." If the heroes put his lantern on his tomb, he can rest (see the ending of part 2 scenes). His sword lies on the lid: a longsword with a pommel shaped like a lantern.',
    doors: [[20, 59, 'n', 'closed', 'door-iron']],
  });
  b.prop('sarcophagus-effigy', 20, 62).props_('candles', [[18, 60], [22, 60]]).prop('urn', 22, 63);

  // ----- Greyfen Fort -----
  b.paint(56, 20, 22, 36, 'stone-cobble');
  b.wallRun(56, 20, 22, 'n').wallRun(77, 20, 36, 'e');
  b.wallRun(56, 20, 18, 'w').wallRun(56, 40, 16, 'w');
  b.wallRun(56, 55, 6, 's').wallRun(65, 55, 13, 's');
  b.rubble(62, 54, 3, 3);
  b.door(70, 20, 'n', 'secret');
  b.door(56, 46, 'w', 'secret').wall(56, 46, 'n').wall(56, 46, 's').door(57, 46, 'w', 'closed', 'portcullis'); // culvert runs under the wall to the cistern grate
  b.hall(48, 46, 55, 46, 1, { mat: 'dungeon-slab' });
  b.water(48, 46, 3, 1, false);
  b.area('Culvert', [[48, 45, 8, 3]], { gm: 'An old drain from the fort\'s cistern to the stream, behind a curtain of hanging moss (DC 13 Perception from the bank). Rusted grate at the fort end: DC 12 Athletics to wrench open, quietly.' });

  b.building('Gatehouse', 56, 35, 5, 8, {
    mat: 'stone-flagstone',
    read: 'Two squat towers round an iron-studded gate. A painted sign hangs from the arch: TOLL 5 GOLD. ASK NICELY. Below it, in smaller letters: OR DON\'T.',
    gm: 'Four bandits and two scouts on watch. They charge a toll of 5 gp each to pass (they have no right to it). Paying gets the heroes into the courtyard as "guests" and lets them talk to Gideon. A DC 13 Deception (such as "we\'re here to join") does the same. The winch raises the portcullis.',
    doors: [[56, 38, 'w', 'closed', 'door-double'], [56, 39, 'w', 'closed', 'door-double'], [60, 38, 'e', 'open'], [60, 39, 'e', 'open']],
  });
  b.prop('portcullis', 57, 38).prop('winch', 59, 36).prop('weapon-rack', 57, 41).props_('torch-sconce', [[58, 35], [58, 42]]).light(58, 39, 10, 15);
  b.encounter('Fort gate watch', [55, 33, 8, 12], [['bandit', 4], ['scout', 2]], 'low');

  b.area('Fort courtyard', [[61, 29, 7, 16]], {
    read: 'The courtyard of Greyfen Fort is full of tents, cookfires, stolen wagons and loud people. A banner with a black thorn snaps from the keep. A dozen bandits stop what they are doing and look at you.',
    gm: 'Gideon Slade\'s Thorns, about a dozen bandits, rule the road from here. They are not all bad: half joined because they were hungry. A big fight here is a moderate one; but a hero who calls out "who wants to keep working for cultists?" (DC 13 Persuasion, after the heroes know about the cult) turns two bandits and the rest hesitate. The well has an iron ladder down into the cistern.',
    label: [64, 36],
  });
  b.props_('tent', [[63, 31], [66, 33], [63, 42], [75, 44]]).prop('campfire', 66, 38).props_('wagon', [[74, 43], [62, 46]]).props_('crate-stack', [[67, 30], [65, 45]]).prop('cart', 70, 44).prop('training-dummy', 75, 46).prop('war-banner', 67, 27);
  b.light(66, 38, 15, 20);
  b.encounter('Bandits in the courtyard', [61, 29, 16, 18], [['bandit', 6], ['thug', 3], ['scout', 1]], 'moderate');

  b.building('Barracks', 57, 21, 10, 7, {
    mat: 'wood-planks',
    gm: 'Bunks for twenty, a dice table and a lot of dirty socks. Under a loose board (DC 12 Investigation): the bandits\' kitty, 46 gp and a moonstone (50 gp).',
    doors: [[61, 27, 's', 'closed']], windows: [[66, 23, 'e']],
  });
  b.props_('bunk-bed', [[58, 22], [60, 22], [62, 22], [64, 22]]).prop('table-cards', 61, 25).props_('footlocker', [[58, 25], [65, 25]]);

  b.building('Old north tower', 73, 21, 5, 5, {
    mat: 'stone-flagstone',
    read: 'Webs fill the tower from floor to roof like grey curtains. Something has wrapped a bandit up like a parcel and left him hanging.',
    gm: 'A giant spider moved in when the fort was abandoned. The bandits avoid it and lock the door. The wrapped bandit is alive (Wib, a nervous boy who will tell the heroes everything, including where the postern door is). The tower stairs lead up to the wall walk.',
    doors: [[75, 25, 's', 'locked']],
  });
  b.props_('spider-web', [[74, 22], [76, 23], [74, 24]]).prop('cobweb-corner', 77, 21).prop('stairs-up', 76, 22);
  b.encounter('Spider in the north tower', [73, 21, 5, 5], [['giantSpider', 1]], 'low');

  b.building('Keep of Greyfen', 68, 28, 10, 14, {
    mat: 'stone-flagstone',
    read: 'The great hall of the keep has a long table, a fire, and a man with his boots on it. He has a black thorn tattooed on his cheek and a red-glass coin rolling over his knuckles.',
    gm: 'Gideon Slade and his two thugs, plus two cultists of the Waking Flame visiting to pay him. Gideon was hired by the cult to block the road and stop anyone going north "for a season". He is greedy, not stupid: if the heroes beat half his people or show him the cult will drop him once the mountain wakes (the letter in his strongroom says so), he takes his money and goes. The cultists fight to the end.',
    doors: [[68, 34, 'w', 'closed', 'door-double'], [68, 33, 'w', 'closed', 'door-double']],
    windows: [[77, 31, 'e'], [72, 28, 'n']],
  });
  b.wallRun(68, 35, 10, 's').wallRun(72, 36, 6, 'w');
  b.door(74, 35, 's', 'closed').door(72, 38, 'w', 'locked', 'door-iron');
  b.props_('table-long', [[72, 31]]).props_('chair-high-back', [[70, 31], [74, 31]]).prop('fireplace', 76, 29).prop('banner-hanging-tall', 72, 28).prop('rug-pelt', 72, 33).light(76, 30, 15, 20);
  b.area("Gideon's quarters", [[72, 36, 6, 6]], { gm: 'A bed with silk sheets (stolen), a wardrobe of fancy coats (stolen), and a parrot that says "pay the toll" (stolen).' });
  b.props_('bed-four-poster', [[75, 38]]).prop('wardrobe', 77, 40).prop('cage-hanging', 73, 37);
  b.area('Strongroom', [[68, 36, 4, 6]], {
    gm: 'Locked iron door (Gideon has the key; DC 13 thieves\' tools). Inside: the toll money (180 gp in a strongbox), a +1 shield with a thorn on it, the cult\'s contract letter (handout), and the Greyfen wardstone wrapped in sacking, taken from the fort chapel and waiting for the cult\'s cart. Behind a shelf, a narrow stair goes down to the cistern (no check: it is just behind the shelf).',
  });
  b.prop('stairs-down', 71, 41).prop('strongbox', 69, 37).prop('chest', 70, 40).prop('shield-wall', 68, 38).prop('gm-treasure', 69, 40, 0, { gm: true });
  b.encounter("Gideon's keep", [68, 28, 10, 8], [['banditCaptain', 1], ['thug', 2], ['cultist', 2]], 'high');

  b.building('Old cistern', 57, 44, 5, 5, {
    mat: 'dungeon-slab',
    read: 'Black water fills most of a low vault. A ladder climbs up toward a circle of daylight: the courtyard well.',
    gm: 'Under the courtyard. The culvert from the stream comes in through a rusted grate in the west wall; the well ladder goes up into the courtyard. A third way, a stair, leads to the keep strongroom (it is drawn here, under the courtyard). Heroes who come this way reach Gideon\'s strongroom or the courtyard unseen.',
    doors: [[61, 46, 'e', 'closed']],
  });
  b.water(58, 45, 3, 3, true);
  b.prop('ladder', 61, 44).prop('stairs-up', 57, 48).prop('well', 63, 44);

  b.building('South-west tower', 56, 50, 5, 5, { mat: 'stone-flagstone', gm: 'Half fallen. The bandits keep their stolen ale here (four barrels). A hero who opens one starts a party, or a riot.', doors: [[58, 50, 'n', 'closed']] });
  b.props_('barrel', [[57, 51], [59, 52], [57, 53]]).prop('ceiling-rubble', 59, 53);
  b.building('Fort stables', 68, 47, 9, 7, { mat: 'dirt', gm: 'Six stolen horses and a pony. Freeing them and driving them through the courtyard is a great distraction (DC 12 Animal Handling).', doors: [[68, 50, 'w', 'open', 'door-double']] });
  b.props_('hay-bale', [[70, 48], [75, 52]]).prop('water-trough', 73, 48).props_('hitching-post', [[71, 52]]);
  b.area('The breach', [[60, 53, 7, 8]], {
    read: 'Part of the south wall has fallen outward in a slope of rubble, wide enough for two to climb abreast.',
    gm: 'The quiet way in from the ford. A DC 12 Stealth climb gets the heroes into the courtyard behind the tents. The bandits keep no watch here because the giant spider sometimes comes out this way.',
    label: [63, 57],
  });
  b.area('Postern path', [[62, 0, 12, 19]], {
    read: 'A goat path zig-zags up the back of the fort hill between two crags. At the top, the wall looks solid.',
    gm: 'The fort\'s old postern is a secret door in the north wall (DC 13 Perception from outside, or ask Wib). It opens into the gap between the barracks and the north tower.',
    label: [66, 8],
  });
  b.props_('cairn', [[66, 2]]).props_('thorn-bush', [[64, 12], [70, 14]]);

  scatter(b, 'reeds', 32, 0, 22, 70, 28, 221);
  scatter(b, 'tree-swamp', 32, 0, 22, 70, 8, 222);
  scatter(b, 'tree-pine', 0, 54, 32, 16, 4, 223);
  scatter(b, 'tree-pine', 54, 0, 26, 18, 8, 224);
  scatter(b, 'bush', 0, 22, 4, 30, 5, 225);
  scatter(b, 'boulder', 54, 56, 26, 14, 5, 226);
  b.start(0, 38, 2, 2);
  return b.build();
}

// ---------- Part 3: Ashwater Crossing and the Redvein Mine ----------
function ashwater() {
  const b = new MapBuilder('adv-emr-ashwater', 'Ashwater Crossing and the Redvein Mine', 80, 76, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });

  // the hills the mine is dug into, and the gorge cliffs to the east
  b.rock(0, 40, 80, 36);
  crag(b, 5, 38, 5, 2.5, 301);
  b.rock(0, 37, 3, 3);
  crag(b, 29, 37, 4, 2, 302);
  crag(b, 58, 37, 5, 2.5, 303);
  b.rock(60, 9, 20, 6).rock(60, 28, 20, 9);
  crag(b, 73, 4, 4, 3, 304);

  // the river Ashwater: grey with mountain ash, deep in the middle
  river(b, [[0, 21], [20, 22], [40, 20], [60, 22], [79, 21]], 5, 3, 'ew');
  b.water(1, 15, 9, 13, false);
  b.floor(46, 19, 9, 5, 'grass');
  b.floor(66, 9, 1, 28, 'wood-planks');
  b.paint(66, 9, 1, 6, 'dirt').paint(66, 28, 1, 9, 'dirt');

  // roads and tracks
  brush([[37, 0], [37, 8], [35, 13]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[35, 28], [38, 33], [40, 39]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[38, 6], [55, 6], [66, 8]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[30, 6], [12, 9], [6, 14]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));

  // ----- the north bank -----
  b.building("Tilda's ferry house", 26, 6, 7, 6, {
    mat: 'wood-planks',
    read: 'A tarred cottage on stilts with a bell on a post outside and a sign: FERRY 1 SP. NO GOATS. NO EXCEPTIONS. A heavy rope runs from a winch out across the grey water into the mist.',
    gm: 'Tilda Rushby has run the ferry for forty years. The cult cut her rope a week ago so nobody could follow their carts south; she has spliced it, but the raft is stuck on the far bank. Someone has to cross, untie it and haul it back (see the scene). She will feed anyone who helps, and she knows the mine.',
    doors: [[29, 11, 's', 'closed']], windows: [[26, 8, 'w'], [32, 8, 'e']],
  });
  b.prop('kitchen-table', 28, 8).prop('stove', 31, 7).prop('bed', 27, 7).prop('fishing-net', 31, 10).prop('shelf-jars', 30, 7).light(28, 8, 5, 10);
  b.floor(34, 12, 3, 5, 'wood-planks');
  b.area('Ferry landing', [[33, 11, 6, 6]], {
    read: 'A wooden jetty pokes out into the river. A thick rope stretches from a winch post across the water. On the far side, half hidden by mist, a flat raft sits on the mud.',
    gm: 'Crossing: swim the deep middle (DC 12 Athletics; failure means the current carries you 20 ft downstream and you try again), pull yourself along the ferry rope hand over hand (DC 10 Athletics), or go round by the island, the old ford or the gorge bridge.',
    label: [35, 13],
  });
  b.prop('winch', 34, 12).prop('mooring-post', 36, 15).prop('temple-bell', 33, 11).prop('rope-coil', 35, 12).prop('dock-pier', 35, 16);
  b.area("Travellers' camp", [[12, 0, 14, 8]], {
    read: 'A trampled clearing with old fire rings, a lean-to and a carved post where travellers leave messages.',
    gm: 'A safe place to rest. The message post has news: "Gone back. Mine full of little dragons. — J". And newer: "Red carts went south. Don\'t follow."',
    label: [18, 3],
  });
  b.prop('lean-to', 15, 2).prop('campfire', 18, 4).prop('signpost', 21, 2).prop('log-fallen', 17, 6).props_('bedroll', [[14, 5], [20, 5]]).light(18, 4, 10, 15);
  b.area('The old ford', [[0, 13, 12, 16]], {
    read: 'Upstream of the ferry, the river spreads wide and shallow over a bed of grey shingle. The water is only knee-deep, but it is fast, and something big moves under it.',
    gm: 'Wading across takes two rounds (difficult terrain, DC 10 Athletics or fall prone in the current). Two crocodiles hunt the shallows. Throwing them fish or meat buys a minute. The ford comes out on the mud flats by the cult camp.',
    label: [5, 20],
  });
  b.props_('rapids', [[3, 24], [7, 18]]).props_('boulder', [[2, 16], [9, 26]]).props_('reeds', [[0, 14], [11, 15], [0, 27]]);
  b.encounter('Crocodiles at the ford', [0, 13, 12, 16], [['crocodile', 2]], 'low');

  b.area('Toll island', [[45, 18, 11, 7]], {
    read: 'A low island in the middle of the river, with the stump of an old stone toll tower. Smoke rises from the tower. Somebody is watching the ferry.',
    gm: 'Cult lookouts: four cultists and four hired bandits with a signal horn. If they see the heroes cross, they blow the horn, and the mine mouth kobolds are ready. Reaching the island: wade from the south bank shallows (DC 10 Athletics), or swim. The bandits surrender fast; the cultists do not.',
    label: [50, 21],
  });
  b.building('Ruined toll tower', 49, 19, 4, 4, { mat: 'stone-flagstone', gm: 'A roofless tower with a ladder to a ledge. On a nail: the signal horn. In a crate: rations, rope and a sack with 22 gp of stolen tolls. In the tower floor, a fresh round hole: the socket where the Ashwater wardstone stood (it is on a cart in the cult camp).', doors: [[50, 22, 's', 'open', 'door-broken']] });
  b.prop('ladder', 51, 20).prop('crate', 49, 20).prop('campfire', 47, 21).prop('rowboat', 54, 23).light(47, 21, 10, 15);
  b.encounter('Lookouts on the toll island', [45, 18, 11, 7], [['cultist', 4], ['bandit', 4]], 'low');

  b.area('Gorge bridge', [[63, 9, 7, 28]], {
    read: 'Downstream the river roars through a narrow gorge. A rope bridge sways across it, forty feet above the white water. Half its planks are missing.',
    gm: 'The quiet way across. A DC 10 Acrobatics per hero to cross safely; failure means a dangling moment and a DC 12 Athletics to climb back up (or fall into the deep water and get swept to the gorge pool). From the south end, an old adit leads into the mine\'s spider gallery.',
    label: [66, 22],
  });
  b.props_('bridge-rope', [[66, 18], [66, 24]]).props_('mooring-post', [[66, 9], [66, 36]]);

  // ----- the south bank -----
  b.mud(10, 27, 24, 6);
  b.area('Mud flats', [[10, 26, 24, 7]], {
    read: 'Grey mud stretches along the south bank, cracked on top and sucking underneath. Bubbles rise in places, and the bubbles giggle.',
    gm: 'Difficult terrain. Four mud mephits live here and think it is hilarious to pull boots off. They can be bribed with anything shiny or a really good insult (DC 11 Performance). They know the mine: "little dragon-men inside, and a hot man who shouts".',
    label: [20, 29],
  });
  b.encounter('Mud mephits on the flats', [10, 26, 24, 7], [['mudMephit', 4]], 'low');
  b.area('Cult supply camp', [[10, 33, 18, 6]], {
    read: 'Three red tents behind a fence of stakes. Carts loaded with charcoal and iron bars. A cook stirs a pot and sings a hymn about fire.',
    gm: 'The cult\'s depot for the mine. Six cultists, an acolyte and a hired thug. By night most are asleep (DC 12 Stealth to sneak through). The carts hold charcoal, iron, and a crate of red-glass ember coins (the cult\'s pay, 30 "coins", worth 1 sp each as glass). Under a tarp on the biggest cart sits the Ashwater wardstone, dug out of the toll island a week ago and waiting to go north. A ladder in the far corner leads down a covered air shaft into the kobold warren (DC 13 Investigation to notice the planks are new).',
    label: [18, 35],
  });
  b.props_('tent', [[12, 34], [16, 34], [21, 34]]).props_('cart', [[24, 36], [13, 37]]).prop('cooking-pot-fire', 18, 37).prop('crate-stack', 23, 37).prop('barricade-wood', 11, 38).prop('war-banner', 19, 33).light(18, 37, 10, 15);
  b.encounter('Cult supply camp', [10, 33, 18, 6], [['cultist', 6], ['acolyte', 1], ['thug', 1]], 'low');
  b.area('Ferry raft', [[33, 27, 6, 5]], { gm: 'The ferry raft, beached and tied to a stake with a sneaky knot (DC 10 Sleight of Hand, or just cut it). Haul it back to Tilda and the whole river is open.', label: [35, 28] });
  b.prop('rowboat', 35, 27).prop('mooring-post', 34, 29);
  b.area('Kobold trap field', [[34, 32, 12, 7]], {
    read: 'The track to the mine is lined with little cairns topped with lizard skulls. The ground looks oddly soft in places.',
    gm: 'Kobold traps: three hidden pits (DC 12 Perception to spot; DC 12 Dexterity save or fall 10 ft, 1d6 damage) and a tripwire bell. The cairns mark the safe path, if anyone thinks to walk only next to them (DC 12 Investigation).',
    label: [40, 35],
  });
  b.props_('trap-pit-hidden', [[38, 33], [41, 36], [36, 37]], 0, { gm: true }).props_('cairn', [[37, 34], [40, 37], [43, 34]]).prop('trap-tripwire', 39, 38, 0, { gm: true });

  // ----- the Redvein Mine -----
  b.cave('Mine mouth', 40, 43, 5, 3, {
    seed: 311, mat: 'cave-floor',
    read: 'Timber props hold up a mouth in the hill. Old rails run inside. Somebody has painted a big red dragon on the rock above the entrance, badly, and written under it in Draconic: OURS.',
    gm: 'Eight kobolds guard the mouth from a ledge, with stones to roll down the rails. If the lookouts\' horn blew, they are hiding in ambush (heroes who enter without checking are surprised). Kobolds fight as a pack; when half are down, the rest run deeper to warn Yipwick.',
  });
  b.props_('mine-support', [[37, 41], [43, 41]]).props_('mine-rails', [[40, 42], [40, 44]]).prop('mine-cart', 41, 45).props_('torch-sconce', [[36, 43], [44, 43]]).light(40, 43, 10, 15);
  b.encounter('Kobolds at the mine mouth', [34, 39, 13, 8], [['kobold', 8]], 'low');

  b.hall(40, 46, 40, 53, 2, { mat: 'dirt' });
  b.props_('mine-rails', [[40, 48], [40, 50]]);
  b.room('Sorting gallery', 27, 50, 12, 6, {
    mat: 'dirt',
    read: 'A long gallery where ore was once sorted. Heaps of rock with red veins, broken carts, and a tally carved on the wall that stops abruptly.',
    gm: 'Empty, quiet and a good place to listen: from the west comes kobold chatter (the warren); from the east, the ringing of hammers across the crack (the forge). A side heap holds 2d6 chunks of good ore (5 sp each).',
  });
  b.hall(38, 52, 40, 52, 2, { mat: 'dirt' });
  b.props_('ore-pile', [[29, 51], [34, 54]]).props_('mine-cart', [[31, 53]]).prop('pickaxes', 36, 51).prop('mine-support', 33, 50).prop('tool-crate', 28, 54);

  b.cave('Kobold warren', 16, 50, 5, 3, {
    seed: 312, mat: 'cave-floor',
    read: 'A maze of little caves full of little beds, little cookpots and a lot of little kobolds, who all stop and stare at you with big yellow eyes.',
    gm: 'Home of the Redvein kobolds. Twelve kobolds are here, with Yipwick their chief. They were told by the cult that the mountain is a sleeping dragon and that helping wake it will make them its favourite children. A hero who speaks Draconic, or who shows proof the cult is lying (the cult letter, or the forge\'s "dragon fire" being a magmin), can turn the whole tribe (DC 12 Persuasion). Then Yipwick shows them the shrine, the cells and the back way to the forge.',
  });
  b.cave('Warren nursery', 12, 58, 4, 3, { seed: 313, mat: 'cave-floor', gm: 'Eggs in warm sand and an old kobold grandmother who throws pebbles at anyone who comes near. Do not fight here: if the heroes do, the whole tribe will never forgive them.' });
  b.cave('Warren larder', 21, 60, 3, 2.5, { seed: 314, mat: 'cave-floor', gm: 'Mushrooms, dried fish and a stolen wheel of cheese from Tilda\'s pantry (she will want it back).' });
  b.tunnel([[27, 52], [21, 51]], 2, { seed: 315 });
  b.tunnel([[15, 53], [13, 56]], 2, { seed: 316 });
  b.tunnel([[16, 59], [19, 60]], 2, { seed: 317 });
  b.props_('straw-bed', [[13, 49], [18, 48]]).prop('cauldron', 16, 51).props_('sack', [[12, 50]]).prop('mushrooms', 21, 61).prop('fish-crate', 22, 59).props_('bones', [[11, 59]]).prop('campfire', 13, 58).light(16, 51, 10, 15).light(13, 58, 5, 10);
  b.encounter('Kobold warren', [8, 46, 18, 18], [['kobold', 12]], 'low');
  b.floor(14, 40, 1, 1, 'dirt');
  b.hall(14, 41, 14, 47, 1, { mat: 'dirt' });
  b.door(14, 41, 'n', 'secret');
  b.prop('ladder', 14, 44);
  b.area('Air shaft', [[13, 40, 3, 7]], { gm: 'A narrow shaft with a ladder, from the warren up into the cult camp. The top is covered with planks and dirt. Kobolds use it to steal the cultists\' food.' });

  b.tunnel([[13, 61], [16, 65], [20, 67]], 2, { seed: 318 });
  b.cave('Shrine of the false dragon', 23, 69, 5, 3.5, {
    seed: 319, mat: 'cave-floor',
    read: 'Candles everywhere. On the wall, a huge dragon painted in red mud, with ruby-red glass eyes. Below it, offerings: shiny buttons, fish heads, and a small iron key, hot to the touch.',
    gm: 'The kobolds\' shrine to "the Mountain Dragon". The glass eyes are ember coins from the cult. The hot key is a reject from the forge: a copy of an old dwarven ward-key, badly made (keep it: it is evidence). If the tribe is friendly, Yipwick gives it to the heroes.',
  });
  b.props_('candles', [[20, 68], [26, 68], [23, 71]]).prop('idol', 23, 67).prop('offering-bowl', 23, 70).props_('treasure-pile', [[26, 70]]).light(23, 69, 10, 15, '#ffb35c');

  // the Deep Crack splits the mine in two; plank bridges cross it
  b.pit(44, 47, 3, 28);
  b.area('The Deep Crack', [[44, 47, 3, 28]], {
    read: 'The mine floor ends at a black crack in the earth, ten feet wide and too deep to see the bottom. Hot air breathes up out of it, smelling of eggs.',
    gm: 'A crack that goes all the way down to the mountain\'s fire. Two plank bridges cross it. A DC 12 Survival or Nature: the warm air is new; the mountain is heating up. Falling is not death (a ledge 30 ft down, 3d6 damage), but climbing back is a DC 13 Athletics.',
    label: [45, 58],
  });
  b.hall(41, 52, 50, 52, 1, { mat: 'dirt' });
  b.floor(44, 52, 3, 1, 'wood-planks');
  b.props_('bridge-plank', [[45, 52]], 90);

  b.hall(45, 44, 51, 44, 1, { mat: 'dirt' });
  b.room("Overseer's office", 52, 42, 9, 5, {
    mat: 'wood-planks',
    read: 'A cramped office cut into the rock: a desk, a bunk, a map of the mine pinned to a beam, and a strongbox chained to the floor.',
    gm: 'The forgemaster\'s office. On the desk: the forging orders (handout) and a wax mould of a dwarven key. The strongbox (DC 13 thieves\' tools, or the forgemaster\'s key) holds 75 gp, two potions of healing and a scroll of protection from evil and good. A tunnel east leads to the spider gallery.',
  });
  b.door(52, 44, 'w', 'closed');
  b.prop('desk', 55, 43).prop('bunk-bed', 59, 43).prop('strongbox', 58, 45).prop('table-maps', 54, 45).prop('lantern-standing', 53, 43).light(55, 43, 5, 10);

  b.cave('The Forge of Keys', 56, 58, 8, 5.5, {
    seed: 320, mat: 'stone-flagstone',
    read: 'Heat hits you like a wall. A forge roars at the heart of the cave, its fire pale yellow and alive: a little man made of magma squats in the coals, grinning. Kobolds pump bellows and hammer at glowing iron. Over it all a big bald man in a scorched leather apron shouts, "Faster! The Kindler wants seven!"',
    gm: 'The cult is forging copies of the dwarven ward-keys that unlock the sockets of the wardstones in the mountain\'s ward-hall. The forgemaster is a cult fanatic; the "dragon fire" is a magmin bound to the forge. Six kobolds work here, scared of the forgemaster. If Yipwick is with the heroes, the kobolds drop their hammers and the fight is just the forgemaster and the magmin. Knocking over the cooling trough (an action) fills the cave with steam: heavily obscured for a round.',
  });
  b.lava(55, 58, 3, 2);
  b.props_('anvil', [[52, 57], [60, 56], [59, 61]]).prop('forge', 56, 56).prop('cauldron-tripod', 51, 60).prop('workbench', 61, 59).prop('water-trough', 53, 61).prop('weapon-barrel', 62, 57).prop('mine-cart', 49, 58).props_('brazier', [[50, 55], [63, 60]]);
  b.light(56, 58, 20, 25, '#ff7a2c');
  b.encounter('The Forge of Keys', [48, 52, 17, 13], [['cultFanatic', 1], ['magmin', 1], ['kobold', 6]], 'high');
  b.tunnel([[50, 52], [52, 54]], 2, { seed: 321 });

  b.cave('Spider gallery', 70, 52, 6, 4, {
    seed: 322, mat: 'cave-floor',
    read: 'An old flooded gallery, thick with webs. Water drips into a black pool. Hanging from the roof are bundles that used to be rats, and one that used to be a kobold.',
    gm: 'Two giant spiders and the giant rats that feed them. The kobolds call this "the No Place" and never come here. The pool hides a dead miner\'s pack (DC 12 Investigation): a silvered dagger, 18 gp and a dwarf-made lantern. The collapsed adit to the north leads to the gorge bridge.',
  });
  b.pool(71, 54, 2.5, 1.5, true);
  b.props_('spider-web', [[67, 50], [73, 51], [68, 54]]).props_('bones', [[72, 50], [66, 53]]).prop('cobweb-corner', 75, 52);
  b.encounter('Spider gallery', [64, 47, 13, 10], [['giantSpider', 2], ['giantRat', 4]], 'moderate');
  b.tunnel([[60, 44], [64, 46], [67, 49]], 2, { seed: 323 });
  b.tunnel([[63, 57], [66, 54]], 2, { seed: 324 });
  b.tunnel([[71, 48], [70, 42], [67, 37]], 2, { seed: 325 });
  b.rubble(69, 41, 2, 3);
  b.area('Collapsed adit', [[66, 37, 6, 10]], { gm: 'An old side entrance, half fallen in. Squeezing through the rubble takes a minute and a DC 10 Athletics; failure is just bruises and noise.' });

  b.hall(58, 63, 58, 66, 2, { mat: 'dirt' });
  b.room('Cell block', 56, 66, 16, 6, {
    mat: 'dungeon-slab',
    read: 'A row of cells cut into the rock, fronted with iron bars. In the first, a stocky dwarf woman with a singed beard is sharpening a spoon on the wall, very slowly, looking straight at you.',
    gm: 'Two thugs and four cultists guard the prisoners. Thrana Ironbellow, a dwarf smith, is in the first cell: the cult made her teach them to copy the old ward-keys. In the other cells: two kobolds who refused to work, and a miner from Tilda\'s village. The guards\' keys open every cell. Thrana knows the ward-hall and its pass-song (see her profile).',
  });
  b.wallRun(56, 68, 16, 'n', 'bars').wallRun(59, 68, 4, 'e').wallRun(63, 68, 4, 'e').wallRun(67, 68, 4, 'e');
  b.door(57, 68, 'n', 'locked', 'door-iron').door(61, 68, 'n', 'locked', 'door-iron').door(65, 68, 'n', 'locked', 'door-iron').door(69, 68, 'n', 'locked', 'door-iron');
  b.props_('straw-bed', [[57, 70], [61, 70], [65, 70], [69, 70]]).prop('table-cards', 64, 66).prop('key-ring', 66, 67).prop('stool', 63, 67).prop('torch-sconce', 70, 66).light(68, 66, 10, 15);
  b.encounter('Cell block guards', [56, 64, 16, 8], [['thug', 2], ['cultist', 4]], 'low');
  b.hall(26, 69, 55, 69, 1, { mat: 'dirt' });
  b.door(30, 69, 'w', 'secret');
  b.floor(44, 69, 3, 1, 'wood-planks');
  b.area('Kobold back way', [[29, 68, 15, 3]], { gm: 'A kobold-sized crawl from the shrine to the cell block, crossing the crack on a single plank. Medium heroes squeeze through at half speed. The shrine end is hidden behind the painted dragon (DC 13 Investigation, or a kobold friend).' });

  scatter(b, 'tree-pine', 0, 0, 26, 12, 10, 331);
  scatter(b, 'tree-birch', 40, 0, 20, 8, 6, 332);
  scatter(b, 'reeds', 0, 14, 80, 15, 18, 333);
  scatter(b, 'bush', 28, 27, 34, 12, 6, 334);
  scatter(b, 'boulder', 44, 26, 20, 10, 4, 335);
  b.start(36, 0, 3, 2);
  return b.build();
}

// ---------- Part 4: the Monastery of the Patient Vigil ----------
function monastery() {
  const b = new MapBuilder('adv-emr-vigil', 'The Monastery of the Patient Vigil', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });

  // cliffs: the mountain behind, the west crags with the goat path, the rock over the steam caves
  b.rock(0, 0, 20, 41).rock(18, 0, 62, 6).rock(62, 6, 18, 16);
  crag(b, 28, 48, 3, 2.5, 401);
  crag(b, 56, 70, 5, 3, 402);
  crag(b, 72, 74, 5, 4, 403);
  crag(b, 6, 50, 3, 3, 404);
  crag(b, 46, 76, 4, 2.5, 405);

  // the hidden path up the valley, and the cart track from the east
  brush([[1, 77], [10, 73], [20, 68], [30, 62], [37, 52], [40, 44], [40, 41]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[79, 62], [66, 52], [52, 46], [42, 42]], 1, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  river(b, [[73, 48], [58, 56], [44, 60], [34, 66], [20, 70], [0, 72]], 1, -1, 'ns');
  b.floor(13, 69, 3, 4, 'wood-planks');
  b.prop('bridge-plank', 14, 70, 90);

  // the goat path: a ledge that zig-zags up the west crags to the bell tower
  b.tunnel([[10, 41], [4, 36], [15, 30], [4, 22], [16, 14], [19, 8]], 1, { mat: 'dirt', seed: 406 });
  b.area('Goat path', [[3, 8, 17, 33]], {
    read: 'A ledge as wide as a boot climbs the cliff in zig-zags. Far below, the valley. Far above, a broken shutter in the side of a bell tower.',
    gm: 'The sneaky way in. Three DC 10 Athletics checks to climb; a failure costs 1d6 damage from a slip, not a fall (unless a 1 is rolled: then a DC 12 Dexterity save or fall 20 ft). The broken shutter opens into the bell tower. Tie a rope and the rest of the party climbs at advantage.',
    label: [10, 25],
  });
  b.props_('thorn-bush', [[5, 35]]).prop('rope-coil', 19, 8);

  // ----- the valley -----
  b.area('Valley of Bells', [[16, 42, 40, 30]], {
    read: 'A hidden valley of pine and rock, out of sight of any road. Prayer flags hang from the trees, red and orange, and far above you a bell rings once.',
    gm: 'The path from the Ember Road. Nobody finds it without help: the map from the mine (handout), Thrana, or a DC 15 Survival to follow the cult\'s cart tracks. The bell rings every hour; if it rings three times fast, the monastery is on alert (doors barred, all fights inside get +2 cultists).',
    label: [30, 56],
  });
  b.area('Lookout Rock', [[2, 54, 14, 10]], {
    read: 'A grey rock stands over the path like a fist. On top, a watch fire, and the glint of a spyglass.',
    gm: 'Two cult scouts and four mastiffs watch the valley path. If they spot the heroes (contest: their Perception against the party\'s Stealth), one runs up the valley to ring the alarm. Taking the cart track from the east avoids them, but costs half a day.',
    label: [8, 58],
  });
  b.prop('campfire', 9, 57).prop('telescope', 11, 56).props_('bedroll', [[7, 59], [12, 60]]).prop('lean-to', 5, 58).light(9, 57, 10, 20);
  b.encounter('Watchers on Lookout Rock', [2, 54, 14, 10], [['scout', 2], ['mastiff', 4]], 'low');
  b.area('Terraced fields', [[42, 43, 18, 9]], {
    read: 'Neat terraces of beans and barley step down the hillside. People in grey smocks are hoeing them, slowly, as if they are very tired. None of them looks up.',
    gm: 'The cult\'s converts: twelve villagers from the foothills, promised that the fire will "burn away their troubles". They are commoners, not fighters. A kind word and a DC 12 Persuasion (or proof of what the cult really plans) gets them talking: the Prior keeps "the cold stones" in a vault behind the altar, and a hound "made of fire" guards them. They will open the side gate (the kennel door) for the heroes if asked.',
    label: [50, 47],
  });
  b.props_('crop-rows', [[44, 45], [48, 45], [52, 47], [56, 47], [46, 49]]).prop('scarecrow', 54, 44).prop('handcart', 58, 49).prop('water-barrel', 43, 50);
  b.area("Old monks' graves", [[60, 56, 16, 10]], {
    read: 'Twenty little cairns in rows, each with a bell hung over it on a pole. The bells do not ring, even in the wind.',
    gm: 'The graves of the Patient Vigil, the monks who watched the mountain for a thousand years until the cult moved in and the last of them "died of old age" (poisoned, DC 13 Medicine on the newest grave). A loose stone in the biggest cairn hides the last abbot\'s note (handout). The silent bells ring all together when the heroes leave with the wardstones: the monks\' thanks.',
    label: [67, 60],
  });
  b.props_('cairn', [[62, 58], [65, 58], [68, 58], [71, 58], [62, 62], [65, 62], [68, 62], [71, 62]]).props_('banner-pole', [[74, 58], [74, 62]]).prop('gm-treasure', 70, 60, 0, { gm: true });

  // ----- hot springs and the Breath Caves -----
  b.paint(62, 22, 18, 28, 'stone-flagstone-warm');
  b.pool(68, 28, 4, 2.5, true).pool(75, 36, 3, 2).pool(67, 42, 3.5, 2).pool(76, 26, 2, 1.5);
  b.area('Hot spring terraces', [[62, 22, 18, 28]], {
    read: 'Steaming pools step down the mountainside in white stone basins. The water is hot enough to cook an egg, and the rocks around them hiss.',
    gm: 'The monks built these baths centuries ago. The water is getting hotter every month (DC 12 Nature: the mountain is waking). The kennel door in the monastery\'s east wall opens onto the top terrace. The Breath Caves above lead, through a long tunnel, to the back of the wardstone vault.',
    label: [70, 33],
  });
  b.props_('steam-vent', [[64, 24], [72, 31], [70, 45], [78, 40]]).props_('stair-grand', [[66, 35]]).prop('bench', 72, 39);
  b.cave('Breath caves', 70, 13, 6, 4, {
    seed: 411, mat: 'cave-floor',
    read: 'A cave that breathes. Every few seconds hot, wet air puffs out of cracks in the floor with a sound like a sigh. Little shapes of steam and coal-glow dance in the vapour.',
    gm: 'Four steam mephits and three magmins, drawn by the waking heat, play here. They are childish, not evil: a game (a riddle contest, DC 12 Intelligence; or a dare, walking through a steam vent for 1d6 fire damage) wins their respect and they let the heroes pass. A long tunnel north-west leads to the vault\'s back door (locked iron; DC 14 thieves\' tools or DC 16 Athletics).',
  });
  b.tunnel([[68, 16], [67, 22]], 2, { seed: 412 });
  b.cave('Steam chimney', 75, 9, 3, 2, { seed: 413, mat: 'cave-floor', gm: 'A hot little cave where the mephits hide their "treasures": 14 gp in mixed coins, a lost monk\'s prayer beads (25 gp) and a potion of fire resistance.' });
  b.tunnel([[72, 11], [74, 9]], 1, { seed: 414 });
  b.props_('steam-vent', [[68, 12], [72, 14]]).prop('crystal-cluster', 69, 15).prop('treasure-pile', 76, 9).light(70, 13, 10, 15, '#ff9a4a');
  b.encounter('Breath caves', [64, 8, 14, 11], [['steamMephit', 4], ['magmin', 3]], 'low');
  b.hall(45, 3, 64, 3, 1, { mat: 'cave-floor' });
  b.tunnel([[64, 3], [66, 9]], 1, { seed: 415 });
  b.area('Vault tunnel', [[46, 2, 19, 3]], { gm: 'A rough tunnel the monks cut long ago, so the vault could be reached if the monastery fell. The cult does not know it is here; they think the iron door is a cupboard.' });

  // ----- the monastery -----
  b.paint(20, 6, 42, 36, 'stone-flagstone');
  b.wallRun(20, 6, 42, 'n').wallRun(20, 6, 36, 'w').wallRun(61, 6, 36, 'e');
  b.wallRun(20, 41, 20, 's').wallRun(42, 41, 20, 's');
  b.door(40, 41, 's', 'closed', 'door-double').door(41, 41, 's', 'closed', 'door-double');
  b.area('Outer court', [[21, 35, 22, 6]], {
    read: 'The gate opens onto a court of worn flagstones. Red banners hang where the monks\' grey ones used to be. A row of braziers burns in front of a statue of a robed figure whose face has been chiselled off.',
    gm: 'The statue was the Patient Vigil\'s founder; the cult defaced her. Pilgrims\' hall to the west, gate lodge to the east, the cloister doors to the north. By day cultists cross the court every few minutes; by night it is empty but for the braziers.',
    label: [33, 38],
  });
  b.prop('statue-tall-robed', 40, 33).props_('brazier', [[36, 33], [44, 33], [32, 38], [48, 38]]).props_('banner-hanging-tall', [[30, 32], [50, 32]]).prop('well', 56, 37);
  for (const [x, y] of [[36, 33], [44, 33], [32, 38], [48, 38]] as Pt[]) b.light(x, y, 10, 15);
  b.building('Gate lodge', 43, 35, 6, 6, {
    mat: 'wood-planks',
    read: 'A guardroom by the gate: a bench, a rack of spears and a board of keys.',
    gm: 'Six cultists, two acolytes and a thug "keep the gate", which mostly means playing dice. The key board holds the kitchen key and the kennel key. Heroes disguised in grey converts\' smocks (from the fields) can walk past with a DC 12 Deception.',
    doors: [[43, 37, 'w', 'closed']], windows: [[48, 38, 'e']],
  });
  b.prop('spear-rack', 47, 36).prop('bench', 45, 39).prop('table-cards', 45, 37).prop('key-ring', 48, 36);
  b.encounter('Gate of the Vigil', [36, 33, 14, 9], [['cultist', 6], ['acolyte', 2], ['thug', 1]], 'low');
  b.building("Pilgrims' hall", 30, 35, 8, 6, { mat: 'wood-planks', gm: 'Where pilgrims once slept. Now the converts sleep here on straw. Under one mat: a child\'s drawing of a dragon made of fire, eating a mountain. "Mother says it will be pretty."', doors: [[33, 35, 'n', 'closed']] });
  b.props_('straw-bed', [[31, 37], [33, 39], [36, 37]]).prop('washbasin', 36, 39);

  b.building('Bell tower', 20, 6, 6, 6, {
    mat: 'wood-planks-dark',
    read: 'A square tower with a great bronze bell hanging in the dark above you, and a ladder up to it. Wind whistles through a broken shutter.',
    gm: 'Two scouts and four cultists ring the hours and watch the valley. If the heroes come up the goat path quietly (DC 12 Stealth), the watch is asleep or dicing. Ringing the bell three times fast calls the alarm; cutting the rope (an action) stops it. Muffled with a cloak, the bell can be rung to fool the cult ("all is well").',
    doors: [[22, 11, 's', 'closed'], [25, 8, 'e', 'closed']], windows: [[20, 8, 'w']],
  });
  b.prop('temple-bell', 23, 8).prop('ladder', 21, 7).prop('stair-spiral', 24, 10).prop('rope-coil', 21, 10);
  b.encounter('Bell tower watch', [20, 6, 6, 6], [['scout', 2], ['cultist', 4]], 'low');
  b.area('Ash garden', [[26, 6, 4, 6]], { gm: 'A tiny walled garden of black sand raked into circles, where the monks meditated on the mountain. The cult dumps ash from the great fire here.' });
  b.props_('rubble-pile', [[27, 9]]).prop('bench', 28, 7);

  b.building('Dormitory', 20, 12, 10, 8, {
    mat: 'wood-planks',
    gm: 'Monks\' cells, now cultists\' beds. Most are empty by day. In the corner cell, under a loose board, a cultist hides a letter home that says he wants to leave (he will help the heroes if they find him: Brother Wend, in the refectory).',
    doors: [[25, 19, 's', 'closed'], [29, 16, 'e', 'closed']],
  });
  b.wallRun(20, 14, 10, 's').wallRun(22, 12, 3, 'e').wallRun(25, 12, 3, 'e');
  b.door(21, 14, 's', 'closed').door(24, 14, 's', 'closed').door(27, 14, 's', 'closed');
  b.props_('cot', [[20, 12], [23, 12], [27, 12]]).props_('footlocker', [[22, 13], [25, 13], [29, 13]]).props_('bench-long', [[23, 17]]).prop('coat-rack', 28, 18);

  b.building('Refectory', 20, 20, 10, 10, {
    mat: 'wood-planks',
    read: 'Long tables, red candles, and a roaring fire. Cultists eat in silence while one reads aloud from a red book about the "Great Waking". A bowl of porridge steams in front of an empty place, as if waiting for you.',
    gm: 'Eight cultists, two acolytes and two thugs at supper. A big fight here is easy to start and hard to stop; but a cool head can bluff ("the Prior sent for you all, now!", DC 14 Deception) to empty the room. Brother Wend, the youngest, will drop his weapon the moment things turn bad and beg to help.',
    doors: [[29, 22, 'e', 'closed'], [25, 29, 's', 'closed']],
    windows: [[20, 24, 'w']],
  });
  b.props_('table-long', [[23, 23], [23, 26]]).props_('bench-long', [[23, 22], [23, 24], [23, 25], [23, 27]]).prop('fireplace', 21, 21).prop('lectern', 27, 21).props_('candles', [[26, 23], [26, 26]]).light(21, 21, 15, 20);
  b.encounter('Refectory', [20, 20, 10, 10], [['cultist', 8], ['acolyte', 2], ['thug', 2]], 'low');
  b.building('Kitchen', 20, 30, 10, 5, {
    mat: 'stone-flagstone',
    gm: 'Big pots and a cook who hates everyone. The larder has food for a siege. A bag of red peppers here is "fire seasoning" for the Waking feast, and very, very hot.',
    doors: [[25, 34, 's', 'closed'], [29, 32, 'e', 'closed']],
  });
  b.prop('hearth-oven', 21, 31).prop('cauldron', 23, 32).prop('butcher-block', 26, 31).prop('pot-rack', 28, 31).props_('flour-sacks', [[21, 33]]).light(21, 31, 10, 15);

  b.building('The cloister', 30, 14, 21, 17, {
    mat: 'marble',
    read: 'A square walk of pale stone pillars around a garden. Once it was green; now every plant has been pulled up and the beds are filled with red gravel. A fountain in the middle runs with steaming water.',
    gm: 'The heart of the monastery: every main room opens off it. A good place for a running fight with lots of pillars for cover. Heroes who walk round it counter-clockwise, as the monks did, notice the old carvings on the pillars (DC 12 History): the monks\' story of the mountain and the dwarves who sang it to sleep.',
    doors: [[40, 13, 's', 'closed', 'door-double'], [41, 13, 's', 'closed', 'door-double'], [50, 22, 'e', 'closed'], [40, 30, 's', 'closed', 'door-double'], [41, 30, 's', 'closed', 'door-double']],
  });
  b.paint(33, 17, 15, 11, 'grass');
  b.area('Cloister garden', [[33, 17, 15, 11]], { gm: 'Red gravel and a fountain of hot water. A DC 13 Investigation finds, among the pulled-up roots, a monk\'s bronze bell-shaped key hidden in a flowerpot: it opens the vault\'s iron back door.' });
  b.props_('pillar-round', [[32, 16], [36, 16], [40, 16], [44, 16], [48, 16], [32, 28], [36, 28], [44, 28], [48, 28], [32, 20], [32, 24], [48, 20], [48, 24]]);
  b.prop('fountain', 40, 22).props_('rubble-pile', [[35, 19], [45, 25]]).prop('pottery', 37, 26).prop('gm-treasure', 37, 26, 0, { gm: true });

  b.building('Hall of the Waking Flame', 30, 6, 21, 8, {
    mat: 'marble',
    read: 'A long hall with a fire burning in a pit in the floor, so hot the air shimmers. Behind it, a huge statue of a sleeping mountain with a face, and a red cloth draped over its eyes. Cultists kneel in rows, swaying, chanting one word over and over: "Wake. Wake. Wake."',
    gm: 'The cult\'s temple. Two flame-wardens (cult fanatics) lead six cultists in prayer, and two magmins dance in the fire pit. The magmins hate being bound here: a hero who calls to them in Ignan or splashes them with spring water from the cloister fountain (they take no damage but are insulted) may turn them on the wardens (DC 13 Persuasion). The vault is behind the statue: a secret door that opens when the red cloth is pulled from its eyes (DC 13 Investigation to work this out; the Prior knows).',
    doors: [[30, 9, 'w', 'closed'], [50, 9, 'e', 'closed']],
  });
  b.lava(39, 9, 3, 2);
  b.prop('idol-colossal', 40, 7).props_('pew', [[34, 11], [37, 11], [44, 11], [47, 11]]).props_('brazier-everburning', [[32, 7], [48, 7]]).props_('banner-hanging-tall', [[35, 7], [45, 7]]).prop('altar', 43, 9);
  b.light(40, 9, 20, 25, '#ff6a2c').light(32, 7, 10, 10).light(48, 7, 10, 10);
  b.encounter('Hall of the Waking Flame', [30, 6, 21, 8], [['cultFanatic', 2], ['magmin', 2], ['cultist', 6]], 'high');
  b.door(40, 6, 'n', 'secret');
  b.room('Wardstone vault', 36, 1, 9, 5, {
    mat: 'dungeon-slab',
    read: 'A cold room cut into the mountain. Three grey stones stand on a cart, each carved with a sleeping face, frost creeping out from their feet. Curled round the cart, a black hound with embers for eyes lifts its head and smiles.',
    gm: 'The cult\'s stolen wardstones: the one from Hollowell, one from a shrine in the hills, one from the monastery itself. A hell hound, a gift "from the mountain", guards them, with two cultists as keepers. It hates the cold of the stones and will not touch them: a hero who stands next to a stone has half cover from its breath (tell the players!). The iron door in the east wall opens on the vault tunnel. The cart can be pushed out along the tunnel (it fits) or through the hall.',
  });
  b.prop('cart', 40, 3).props_('rune-stone', [[39, 2], [41, 2], [40, 4]]).props_('chest', [[37, 4]]).prop('candle-stand-tall', 43, 2).light(43, 2, 5, 10, '#a6d8ff');
  b.door(45, 3, 'w', 'locked', 'door-iron');
  b.encounter('Wardstone vault', [36, 1, 9, 5], [['hellHound', 1], ['cultist', 2]], 'moderate');

  b.building("Prior's quarters", 51, 6, 11, 8, {
    mat: 'wood-planks-dark',
    read: 'A comfortable room, too comfortable for a monk: thick rugs, a soft bed, a writing desk, and a window with the best view of the smoking mountain.',
    gm: 'Prior Saredd Pyle\'s rooms. In the desk: letters from the High Kindler (handout) and 120 gp. Under the bed: a box of the monks\' silver bells (6, 10 gp each) he meant to melt down. A secret door behind a bookcase (DC 12 Investigation from this side) leads down into the scriptorium.',
    doors: [[55, 13, 's', 'secret']], windows: [[61, 8, 'e']],
  });
  b.prop('bed-canopy', 59, 7).prop('writing-desk', 53, 8).prop('rug-round', 56, 10).prop('bookcase-secret', 55, 12).prop('armchair', 58, 11).prop('telescope', 60, 10).light(53, 8, 5, 10);
  b.building('Scriptorium', 51, 14, 11, 10, {
    mat: 'wood-planks',
    read: 'Rows of slanted desks, pots of red ink, and shelves of old books. A thin, smiling man in red robes is copying a page, very carefully. "Ah. Visitors. Do sit down."',
    gm: 'Prior Saredd Pyle with three acolytes and six cultists who are copying the cult\'s book. Saredd talks first: he offers the heroes a place in the "new world" and tries to learn what they know. If they refuse, he fights; at half hit points he runs for his quarters (the secret stair) to reach the Hall and the vault. The monks\' oldest book is here: a history of the ward-hall (DC 12 Investigation to find it among the cult\'s copies).',
    doors: [[51, 18, 'w', 'closed']],
  });
  b.props_('writing-desk', [[53, 16], [56, 16], [53, 19], [56, 19]]).props_('bookshelf-tall', [[60, 15], [60, 18], [60, 21]]).prop('scroll-rack', 52, 22).prop('lectern', 58, 21).props_('candles', [[54, 17], [57, 20]]).light(55, 18, 10, 15);
  b.encounter("The Prior's scriptorium", [51, 14, 11, 10], [['cultFanatic', 1], ['acolyte', 3], ['cultist', 6]], 'moderate');
  b.building('Kennels', 51, 24, 11, 8, {
    mat: 'dirt',
    gm: 'Six mastiffs and two thugs who handle them. Dogs bark at strangers; feeding them the cook\'s meat (DC 12 Animal Handling) keeps them quiet. The east door opens onto the hot spring terraces: the converts can unbar it.',
    doors: [[55, 31, 's', 'closed'], [61, 28, 'e', 'locked']],
  });
  b.props_('cage', [[52, 25], [55, 25], [58, 25]]).props_('straw-bed', [[53, 29], [58, 29]]).prop('water-trough', 56, 27).prop('bones', 60, 26);
  b.encounter('Kennels', [51, 24, 11, 8], [['mastiff', 6], ['thug', 2]], 'low');

  scatter(b, 'tree-pine', 16, 42, 40, 38, 30, 421);
  scatter(b, 'tree-pine', 56, 50, 24, 30, 10, 422);
  scatter(b, 'boulder', 20, 42, 60, 38, 10, 423);
  scatter(b, 'ferns', 0, 42, 40, 38, 8, 424);
  scatter(b, 'banner-pole', 20, 42, 25, 25, 4, 425);
  b.start(1, 76, 2, 2);
  return b.build();
}

// ---------- Part 5: the Heart of the Ashmother ----------
function heart() {
  const b = new MapBuilder('adv-emr-heart', 'The Heart of the Ashmother', 80, 80, { theme: 'cave', wallStyle: 'cave', floor: 'cave-floor', ambient: 'dim' });

  // ----- the way in: a lava tube up the mountain's flank -----
  b.cave('The Ash Stair', 12, 68, 10, 8, {
    seed: 501, mat: 'cave-floor',
    read: 'A tunnel of black glass winds up into the mountain, its floor deep in grey ash that puffs up at every step. The air tastes of struck matches. Far above, something rumbles like a giant turning over in its sleep.',
    gm: 'An old lava tube, and the dwarves\' road into the mountain: worn steps cut into the glass every few yards. The cult\'s outriders patrol here with a hell hound. Ash muffles footsteps (advantage on Stealth), but every hero leaves tracks. Three ways on: the dwarven gate (north-east), the old crypt stair (north, a tight climb), and a hidden door to the ward tunnel (east wall, DC 14 Perception, or Thrana knows it).',
  });
  b.paint(4, 62, 16, 12, 'dirt');
  b.props_('stairs-up', [[10, 64], [16, 63]]).props_('embers-ash', [[6, 66], [14, 71], [18, 66]]).props_('skeleton-lying', [[8, 70]]).prop('campfire-cold', 13, 67).props_('stalagmites', [[4, 68], [20, 70]]);
  b.light(13, 67, 5, 10, '#ff8a3c');
  b.encounter('Outriders on the Ash Stair', [4, 62, 16, 12], [['hellHound', 1], ['cultist', 4]], 'low');

  b.tunnel([[17, 62], [22, 58], [25, 55]], 3, { seed: 502 });
  b.room('Gate of the Wardens', 20, 48, 12, 8, {
    mat: 'dungeon-slab',
    read: 'Two dwarf statues as tall as houses guard a pair of bronze doors, green with age. Carved across the doors: a mountain with a sleeping face, and seven little figures singing to it. In front of the doors stand four suits of dwarven armor, very still.',
    gm: 'The armor is animated: four suits and two flying swords. They attack anyone who comes within 10 ft of the doors without singing the pass-song (Thrana taught it to the heroes, or it is on the monks\' handout). Singing even badly makes them kneel. Fighting them is a low fight; the doors open with a push once they are still. The cult never opened these doors: they found the dwarves\' ward tunnel instead.',
  });
  b.wallRun(20, 48, 12, 'n');
  b.door(25, 48, 'n', 'closed', 'door-double').door(26, 48, 'n', 'closed', 'door-double');
  b.props_('statue-tall-knight', [[21, 49], [30, 49]]).props_('armor-stand', [[23, 51], [28, 51]]).props_('brazier-pedestal', [[22, 54], [29, 54]]).prop('doors-grand-frame', 25, 49);
  b.light(22, 54, 10, 15).light(29, 54, 10, 15);
  b.encounter('Guardians of the gate', [20, 48, 12, 8], [['animatedArmor', 4], ['flyingSword', 2]], 'low');
  b.floor(32, 52, 1, 2, 'dungeon-slab');
  b.room("Wardens' barracks", 33, 50, 8, 6, {
    mat: 'dungeon-slab',
    gm: 'Stone bunks for forty dwarves, all empty for a thousand years. A heap of fallen stone in the corner hides nothing but rats. In a footlocker under the last bunk (DC 12 Investigation): a dwarven +1 battleaxe and a horn that sounds like a lullaby.',
  });
  b.door(33, 52, 'w', 'closed');
  b.props_('bunk-bed', [[34, 51], [36, 51], [38, 51], [34, 54], [36, 54]]).prop('footlocker', 39, 54).prop('rubble-pile', 40, 52).prop('weapon-rack', 39, 50);

  // ----- the Ward-Hall -----
  b.room('The Ward-Hall', 14, 28, 24, 20, {
    mat: 'dungeon-slab',
    read: 'A hall so big your torchlight does not reach the roof. Pillars carved like dwarves holding up the mountain. In the middle, seven stone sockets stand in a ring around a cold blue fire. In one of them a big grey stone still sits, humming a low, sleepy note. The other six are empty.',
    gm: 'The dwarves\' tuning ring. The big stone is the keystone, the last ward still in place; the cult means to tear it out during the rite. A stone set in one of the empty sockets sings seven times louder than it did down on the road. The heroes can set every stone they carried up (an action each; the socket clamps need Thrana\'s real key or one of the forged keys). Each stone set here adds a round to the Waking Rite. If all six empty sockets are filled, the rite cannot succeed at all.',
  });
  b.props_('plinth-display', [[26, 31], [31, 33], [32, 38], [29, 43], [23, 43], [20, 38], [21, 33]]).prop('rune-stone', 26, 31).prop('fire-bowl', 26, 37);
  b.props_('column-fluted', [[16, 30], [16, 45], [35, 30], [35, 45], [16, 37], [35, 37]]).props_('statue-tall-knight', [[15, 29], [36, 29]]).prop('rune-tiles', 26, 40).props_('banner-hanging-tall', [[20, 28], [32, 28]]);
  b.light(26, 37, 20, 25, '#8fd0ff');
  b.room('Tombs of the Wardens', 2, 26, 10, 18, {
    mat: 'dungeon-slab',
    read: 'Rows of stone coffins, each lid carved with a dwarf asleep, hands folded on a hammer. At the far end, one lid lies smashed on the floor. Something tall stands in the dark where it was, very still.',
    gm: 'The last ward-keeper, made a wight by the mountain\'s waking fury, with six dwarf skeletons. It is not evil so much as furious: it thinks the heroes are the thieves. Showing it a recovered wardstone, or singing the pass-song (DC 12 Performance), makes it hesitate for a round, and a DC 14 Persuasion turns it: it lies down again and the skeletons with it. Its tomb holds a +1 shield and 200 gp in old dwarven coin.',
  });
  b.props_('sarcophagus-row', [[4, 28], [8, 28], [4, 33], [8, 33], [4, 38], [8, 38]]).prop('sarcophagus-open', 6, 42).props_('urn', [[2, 26], [11, 26]]).prop('gm-treasure', 6, 42, 0, { gm: true }).prop('candle-stand-tall', 10, 41);
  b.light(10, 41, 5, 10, '#8fd0ff');
  b.encounter("Wardens' tombs", [2, 26, 10, 18], [['wight', 1], ['skeleton', 6]], 'low');
  b.floor(12, 35, 2, 1, 'dungeon-slab');
  b.door(14, 35, 'w', 'closed', 'door-iron');
  b.tunnel([[6, 43], [5, 52], [7, 61]], 2, { seed: 503 });
  b.rubble(4, 50, 3, 3);
  b.area('Crypt stair', [[3, 44, 6, 16]], { gm: 'A collapsed stair from the tombs down to the Ash Stair. Climbing the rubble is a DC 12 Athletics (or slow and noisy). The quiet way into the Ward-Hall, through the tombs.' });

  b.floor(22, 24, 1, 4, 'dungeon-slab');
  b.door(22, 24, 'n', 'closed', 'door-iron').door(22, 28, 'n', 'closed', 'door-iron');
  b.room('The Quenching Forge', 14, 10, 16, 14, {
    mat: 'stone-flagstone',
    read: 'A dwarven forge as big as a barn, cold for a thousand years. A channel of icy water runs across the floor from a spring in the wall, and two deep pools steam faintly where the water meets the warm stone.',
    gm: 'Where the dwarves forged the wardstones, cooling them in spring water from deep under the glaciers. The water is still magically cold: a hero who dips a weapon here deals an extra 1d4 cold damage with it for the next hour, and a flask of it splashed on a magmin or hell hound deals 1d6 cold damage. The great anvil bears the dwarves\' ward-song carved round its rim (the same as Hobart\'s handout).',
  });
  b.water(14, 17, 16, 1, false);
  b.pool(18, 13, 2, 1.5, true).pool(26, 20, 2, 1.5, true);
  b.props_('anvil', [[21, 12], [24, 21]]).prop('forge', 15, 11).prop('hearth-grand', 27, 11).props_('tool-wall', [[29, 14]]).prop('grindstone', 16, 21).props_('weapon-rack', [[28, 22]]).prop('water-barrel', 15, 15);

  b.floor(30, 15, 2, 1, 'dungeon-slab');
  b.door(32, 15, 'w', 'closed');
  b.floor(36, 20, 1, 8, 'dungeon-slab');
  b.door(36, 20, 'n', 'closed').door(36, 28, 'n', 'closed');
  b.room('The Ember Cloister', 32, 6, 14, 14, {
    mat: 'stone-flagstone',
    read: 'A square room ringed with braziers. Three figures with skin like polished bronze and beards of living flame stand guard, hammers raised. "No further, thief," says one. "We keep the hall."',
    gm: 'Three azers, bound by the dwarves long ago to tend the ward-hall\'s fires. They are not enemies of the heroes: they think everyone is a thief. Proof that the heroes are restoring the wards (a recovered wardstone, Thrana, or the pass-song) and a DC 13 Persuasion makes them allies: they will not leave the hall, but they hold the Long Gallery against the cult so the heroes can go round by the chain bridge. Fought, it is a moderate fight.',
  });
  b.props_('brazier-everburning', [[33, 7], [44, 7], [33, 18], [44, 18]]).props_('anvil', [[38, 12]]).props_('weapon-rack', [[35, 9], [42, 16]]).prop('statue-tall-robed', 38, 7).prop('rug', 38, 14);
  for (const [x, y] of [[33, 7], [44, 7], [33, 18], [44, 18]] as Pt[]) b.light(x, y, 10, 15, '#ff7a2c');
  b.encounter('Azers of the Ember Cloister', [32, 6, 14, 14], [['azer', 3]], 'moderate');

  // ----- the river of fire -----
  lavaFlow(b, [[50, 0], [49, 20], [51, 40], [50, 60], [52, 79]], 2, 'ns');
  lavaFlow(b, [[52, 22], [60, 22]], 1, 'ew');

  // the Long Gallery and the Great Bridge
  b.floor(38, 30, 20, 3, 'dungeon-slab');
  b.door(38, 31, 'w', 'closed', 'door-double').wall(38, 30, 'w').wall(38, 32, 'w');
  b.area('The Long Gallery', [[38, 30, 9, 3]], {
    read: 'A straight gallery runs east from the Ward-Hall, lined with carved dwarves holding lanterns that went out long ago. At its end, red light, heat, and the roar of the river of fire.',
    gm: 'The direct way to the Heart, and the cult knows it: a flame-warden (cult fanatic), eight cultists and a hell hound hold the gallery and the bridge. The gallery is only 15 ft wide: one hero with a shield can hold it. If the azers are allies, they take this fight off the heroes\' hands.',
  });
  b.props_('statue-knight', [[40, 30], [43, 32], [46, 30]]).prop('barricade-wood', 46, 31);
  b.area('The Great Bridge', [[47, 29, 8, 5]], {
    read: 'A stone bridge with no rail crosses a river of moving fire. The heat makes your eyes water. On the far side, the cavern opens into a red glow.',
    gm: 'Anyone knocked prone on the bridge must make a DC 12 Dexterity save or slide toward the edge (an ally can grab them as a reaction). Falling in the lava is 10d10 fire damage: warn the players clearly before anyone risks it, and let them know a shove is possible both ways.',
    label: [50, 31],
  });
  b.encounter('Battle of the Long Gallery', [38, 29, 20, 5], [['cultFanatic', 1], ['cultist', 8], ['hellHound', 1]], 'moderate');
  b.light(50, 31, 20, 25, '#ff5a1c');

  // the chain bridge to the north
  b.floor(46, 8, 13, 1, 'wood-planks');
  b.door(45, 8, 'e', 'closed');
  b.area('Chain bridge', [[46, 7, 12, 3]], {
    read: 'A narrow bridge of iron chains and wooden slats sways over the fire river. Some slats are charred through.',
    gm: 'The back way to the Heart, from the Ember Cloister. Crossing needs a DC 11 Acrobatics per hero (failure: a burnt slat gives way, 2d6 fire damage from the heat while you scramble on). Nobody guards it: the cult thinks the azers make it impossible.',
    label: [52, 8],
  });
  b.props_('chains-hanging', [[46, 8], [58, 8]]);
  b.cave('Obsidian galleries', 62, 9, 6, 4, {
    seed: 504, mat: 'cave-floor',
    read: 'Black glass walls, polished like mirrors, throw your reflection back at you a hundred times, all of them red. Steam hisses from cracks.',
    gm: 'Six steam mephits and two magmins play hide-and-seek among the reflections. They are bored, not bound. Mirrors give them advantage on Stealth here. They will trade the way to the Heart for a good story or a shiny thing (DC 12 Persuasion or Performance). A crack in the south wall leads down to the Heart\'s north causeway.',
  });
  b.props_('crystal-spire', [[58, 8], [65, 11]]).props_('steam-vent', [[61, 7], [66, 10]]).prop('cave-crystals', 60, 10).light(62, 9, 10, 15, '#ff7a4a');
  b.encounter('Obsidian galleries', [56, 5, 13, 9], [['steamMephit', 6], ['magmin', 2]], 'low');
  b.tunnel([[64, 12], [67, 17]], 2, { seed: 505 });

  // ----- the Heart -----
  b.cave('The Heart of the Mountain', 67, 27, 11, 11, {
    seed: 506, mat: 'cave-floor',
    read: 'The heart of the Ashmother: a cavern lit red from below by a lake of molten rock. In the middle of the lake, on an island of black stone, a woman in a robe of red feathers stands in a ring of fire, arms raised. Around her, cultists chant. The whole mountain shakes in time with them.',
    gm: 'Maudra Vesh, the High Kindler, is performing the Waking Rite. Three stone causeways reach the island: from the Great Bridge (west), from the obsidian galleries (north), and from the steam caves (south). The rite takes 6 rounds once the heroes arrive (see the scene). Each wardstone set back in the Ward-Hall adds a round. At the end of round 6, if Maudra is still chanting, the mountain wakes and a fire elemental rises from the lake.',
  });
  for (let y = 18; y <= 36; y++) for (let x = 59; x <= 78; x++) {
    const dx = (x + 0.5 - 68) / 8, dy = (y + 0.5 - 26) / 7;
    if (dx * dx + dy * dy <= 1 && b.isFloor(x, y)) b.lava(x, y, 1, 1);
  }
  for (let y = 22; y <= 30; y++) for (let x = 64; x <= 74; x++) {
    const dx = (x + 0.5 - 69) / 3.5, dy = (y + 0.5 - 26) / 3;
    if (dx * dx + dy * dy <= 1) b.floor(x, y, 1, 1, 'stone-flagstone');
  }
  brush([[57, 30], [61, 29], [66, 27]], 2, (x, y) => b.floor(x, y, 1, 1, 'stone-flagstone'));
  brush([[68, 16], [68, 20], [69, 23]], 2, (x, y) => b.floor(x, y, 1, 1, 'stone-flagstone'));
  brush([[70, 37], [70, 33], [69, 29]], 2, (x, y) => b.floor(x, y, 1, 1, 'stone-flagstone'));
  b.area('Island of the rite', [[65, 23, 8, 6]], { gm: 'The ritual circle. Three braziers feed the rite; knocking one into the lava (an action, DC 12 Athletics) costs Maudra a round of the rite. A forged ward-key glows on the altar: Maudra needs it to tear the keystone loose from afar. Snatching it (DC 12 Sleight of Hand or Athletics, she notices) costs her two rounds.' });
  b.prop('summoning-circle', 69, 26).prop('altar', 70, 25).props_('brazier-pedestal', [[67, 24], [71, 28], [66, 28]]).prop('rune-stone', 69, 24);
  b.props_('lava-pool', [[62, 20]]).props_('magma-vent', [[60, 25], [76, 24]]);
  b.light(69, 26, 25, 30, '#ff4a1c').light(62, 33, 15, 20, '#ff5a1c').light(63, 19, 15, 20, '#ff5a1c');
  b.encounter('The Waking Rite', [57, 17, 22, 21], [['highKindler', 1], ['hellHound', 2], ['cultist', 4]], 'high');
  b.encounter("The Mountain's Wrath", [60, 18, 18, 16], [['fireElemental', 1]], 'high');

  b.tunnel([[70, 37], [72, 43]], 2, { seed: 507 });
  b.cave('Magmin nest', 73, 46, 5, 4, {
    seed: 508, mat: 'cave-floor',
    read: 'A cave like the inside of an oven, full of giggling. Little figures of living magma roll and tumble in pools of glowing rock, and the steam is thick enough to chew.',
    gm: 'Six magmins and four steam mephits, born from the mountain\'s waking. Pure mischief. They explode when they die (warn the players after the first one), which is a great reason to fight them at range or go round. Cold spring water from the forge scares them off.',
  });
  b.lava(72, 45, 2, 2).lava(75, 48, 1, 1);
  b.props_('steam-vent', [[70, 44], [76, 45]]).prop('embers-ash', 71, 48).light(73, 46, 15, 20, '#ff6a2c');
  b.encounter('Magmin nest', [68, 42, 11, 9], [['magmin', 6], ['steamMephit', 4]], 'low');
  b.tunnel([[72, 49], [69, 57]], 2, { seed: 509 });

  b.cave("The Kindlers' camp", 66, 62, 8, 6, {
    seed: 510, mat: 'cave-floor',
    read: 'Red tents in a cave lit by lava cracks. Supply crates, bedrolls, a cook-fire with nothing on it, and a pile of chains. Somebody has written on a crate in chalk: AFTER THE WAKING, NO MORE WINTER.',
    gm: 'The cult\'s camp in the mountain, held by four thugs, six cultists and two acolytes. Most are tired and scared of the shaking. The thugs are paid help: if the heroes show them what the Waking really means (the whole valley under ash, including their own homes), they leave (DC 13 Persuasion). In the High Kindler\'s tent: her journal (handout) and 150 gp. The ward tunnel comes in from the west.',
  });
  b.props_('tent-command', [[63, 59]]).props_('tent', [[69, 58], [70, 65], [61, 65]]).prop('campfire', 66, 62).props_('crate-stack', [[72, 61], [60, 60]]).prop('chains-hanging', 64, 66).props_('bedroll', [[67, 60], [64, 64]]).light(66, 62, 15, 20);
  b.encounter("The Kindlers' camp", [58, 56, 17, 13], [['thug', 4], ['cultist', 6], ['acolyte', 2]], 'low');

  // the dwarves' secret ward tunnel, running under the river of fire
  b.hall(20, 66, 61, 66, 1, { mat: 'dungeon-slab' });
  b.floor(46, 66, 9, 1, 'dungeon-slab');
  b.door(25, 66, 'w', 'secret');
  b.area('The ward tunnel', [[24, 65, 36, 3]], {
    read: 'A low, perfect tunnel of dressed stone, so straight you can see the far end as a pinprick of red light. Halfway along, the ceiling is hot to the touch: the river of fire runs right over your head.',
    gm: 'The dwarves\' secret way from the Ash Stair to the Heart, passing under the lava river (drawn here where it passes beneath). The cult found it from the far end and uses it to bring supplies to their camp. The Ash Stair end is a secret door (DC 14 Perception). Halfway, a carved panel of seven sleeping faces: pressing them in the order of the ward-song (handout) opens a niche with three potions of healing and a potion of fire resistance.',
    label: [40, 66],
  });
  b.prop('wall-alcove-arch', 40, 66).prop('gm-treasure', 41, 66, 0, { gm: true });

  scatter(b, 'stalagmites', 0, 0, 80, 80, 14, 521);
  scatter(b, 'embers-ash', 0, 44, 46, 36, 8, 522);
  scatter(b, 'rubble-pile', 0, 0, 46, 60, 6, 523);
  scatter(b, 'burning-ground', 54, 40, 26, 30, 5, 524);
  scatter(b, 'steam-vent', 54, 0, 26, 20, 3, 525);
  b.start(8, 70, 3, 2);
  return b.build();
}
export const EMBER_ROAD: Adventure = {
  id: 'ember-road',
  title: 'The Ember Road',
  tagline: 'A sleeping volcano has started to smoke: follow the old road from a frontier town to the mountain\'s heart and bring back the stolen stones that keep it dreaming.',
  levels: '1-4',
  sessions: '5-8 sessions',
  players: '3-5 players',
  tags: ['starter', 'campaign', 'volcano', 'cult', 'road trip'],
  pitch:
    'Kettlebrook is a small, friendly town at the end of the Ember Road: geese, pie, a market on Thursdays, and on the northern skyline the Ashmother, a mountain that has slept for a thousand years. Nobody thinks about the Ashmother much. Then one morning it starts to smoke. The same night, goblins steal the Old Stone from the town shrine, the lucky stone everybody touches on their way to market. You are ordinary folk of Kettlebrook. Somebody has to go and get it back. Nobody guessed it would take you all the way up the Ember Road and into the mountain\'s heart.',
  secret:
    'A thousand years ago, dwarven ward-smiths sang the Ashmother to sleep and cut seven wardstones to keep her dreaming. One, the keystone, they left in the Ward-Hall deep inside the mountain. The other six they set along the road below, a day\'s walk apart, so the lullaby would carry over the land like bells (the Ember Road follows their line). Most folk forgot what they were: Kettlebrook\'s is the "Old Stone" in the shrine. The Waking Flame is a cult that believes the fire under the mountain is a mother who will burn away the old, cold, unfair world and give a warm new one to her faithful. Its leader, Maudra Vesh, the High Kindler, lost her family to a hard winter and a lord who would not open his granary; she wants a world without winter, or lords, and does not care who burns. Six months ago she found the monks\' records of the wardstones in the Monastery of the Patient Vigil, poisoned the last monks and took it over. Now her cult is stealing the six road stones one by one (paying goblins, bandits and kobolds to do the dirty work), forging copies of the dwarven ward-keys in an old mine, and getting ready to tear out the keystone in a Waking Rite at the mountain\'s heart. Every stone taken lets the mountain stir a little more: that is why it is smoking now. If the rite succeeds, the Ashmother wakes, and every town on the Ember Road is under ash within a week.',
  hooks: [
    'The town council offers 50 gp (and free pie for a year, says Marigold) to whoever brings back the Old Stone from the goblins.',
    'A hero is the grandchild of Hobart Fawley, the shrine-keeper, who is far too old to chase goblins and asks, very politely, if they would mind.',
    'A hero\'s family farm is the Brisby farm: goblins raided it last night, took the sheep and smashed the door. It is personal.',
  ],
  tips: [
    'New GM? You only need three things: read the boxed text out loud, ask "What do you do?", and call for a roll only when failing would be interesting. Easy checks are DC 10, normal ones DC 12 or 13, hard ones DC 15. If the players have a clever idea, let it work.',
    'Almost every fight has another way through: goblins bargain, wolves take meat, bandits can be bluffed, kobolds can be turned, mephits like games, azers want proof, and many monsters run at half strength. Reward talking and sneaking just as much as fighting; the heroes level up by milestone, not by kills.',
    'Levelling: heroes start at level 1, reach level 2 at the end of part 1, level 3 at the end of part 3, and level 4 at the end of part 4. Part 3 is built for level 2 heroes; if they are already level 3, add two kobolds or two cultists to each fight there.',
    'Keep a Wardstone tally on a card in the middle of the table, where the players can see it. There are six road stones to recover (Kettlebrook, Greyfen, Ashwater, and three in the monastery vault). Every stone the heroes bring home or carry up to the Ward-Hall makes the final rite one round longer. It is their score, and it makes every side trip matter.',
    'If a fight goes badly, the cult takes prisoners rather than killing: they want sacrifices for the rite. A captured party wakes in the mine\'s cell block or the Kindlers\' camp, with a chance to escape. Nobody has to make new characters on their first night.',
    'Each part is a complete chapter with its own ending, about one or two sessions long. Give the heroes a short rest in a safe corner of each map and a long rest between parts. Skip scenes marked optional when time runs short.',
  ],
  npcs: [
    {
      id: 'pf_emrmarigold', name: 'Marigold Brisby', title: 'innkeeper of the Bent Horseshoe', kind: 'npc', art: 'innkeeper', shared: true,
      wants: 'Her town safe, her brother\'s sheep back, and everyone fed whether they like it or not.', knows: 'Every rumour in Kettlebrook, who saw what on the night of the theft, and that a tall stranger in a red cloak paid for a room in silver and left before dawn.',
      voice: 'Brisk and warm. Calls everyone "pet". Answers questions with questions ("Have you eaten?").', appearance: 'A round, red-cheeked woman with flour to the elbows, a striped apron and a wooden spoon she points like a sword.',
      gmNotes: 'Use her to start the adventure and to welcome the heroes home after each part. She keeps two potions of healing "for heroes" and gives them away at the first excuse.',
    },
    {
      id: 'pf_emrhobart', name: 'Hobart Fawley', title: 'keeper of the Old Stone and town historian', kind: 'npc', art: 'sage', shared: true,
      wants: 'To understand the Old Stone at last, and to be right about it in front of everybody.', knows: 'Old stories about dwarves on the mountain, the ward-song carved on the stone (he has a rubbing), and that the stone is "older than the town by a long way".',
      voice: 'Slow, kind and very long-winded. Starts every answer with "Ah, now, that is interesting." Loses his glasses on his head.', appearance: 'A tall, stooped old man with a cloud of white hair, ink on his fingers and three pairs of spectacles.',
      gmNotes: 'He is the heroes\' lore-book. After part 1 he works out what the stone is and gives them the ward-song (handout). Later, a letter or a visit home lets him explain the next clue whenever the players are stuck.',
    },
    {
      id: 'pf_emrgutnab', name: 'Gutnab', title: 'the Magnificent, boss of the Snagtooth goblins', kind: 'monster', art: 'goblin-boss', monsterId: 'goblinBoss', shared: true,
      wants: 'Shiny things, respect, and to be called "the Magnificent".', knows: 'That a tall man in a red cloak paid him in red-glass coins to steal the stone, and that the man called his master "the Kindler".',
      voice: 'Grand and squeaky. Talks about himself in the third person. Loves long words he gets slightly wrong.', appearance: 'A big goblin with a cooking-pot helmet, a curtain for a cape and a necklace of spoons.',
      gmNotes: 'Goblin boss stat block. A coward at heart: he offers a deal when he drops below half hit points. If the heroes spare him, he turns up later in the campaign with a useful rumour, and possibly a new hat.',
    },
    {
      id: 'pf_emrcuthbert', name: 'Cuthbert Lowe', title: 'ghost of the waywarden of Hollowell', kind: 'npc', art: 'ghost',
      wants: 'To keep the road safe for travellers, as he did for forty years, and then to rest.', knows: 'That four people in red came through the cellar a month ago and "took the singing stone", and every inch of the waystation.',
      voice: 'Polite and old-fashioned. Says "Welcome to Hollowell, travellers, mind the step." Fades out mid-sentence when upset.', appearance: 'A faint grey old man with a lantern that burns green, a warden\'s cap and a ring of keys that make no sound.',
      gmNotes: 'Not a fighter, and not a threat. He appears after the common room fight if the heroes did not attack his lantern. He asks them to lay the ward chamber to rest, then to set his lantern on his tomb. When they do, he fades with a smile and the graveyard is quiet. His thanks: his lantern-pommelled longsword in the tomb.',
    },
    {
      id: 'pf_emrgideon', name: 'Gideon Slade', title: 'captain of the Thorns, the bandits of Greyfen Fort', kind: 'monster', art: 'bandit-captain', monsterId: 'banditCaptain', shared: true,
      wants: 'Gold, a warm fort and no trouble. He would like to retire rich by thirty-five.', knows: 'That the Waking Flame paid him to block the Ember Road "for a season", that their monastery is in the foothills, and that their leader is a woman called Maudra.',
      voice: 'Lazy and charming. Calls everyone "friend". Never raises his voice; flips a red-glass coin while he thinks.', appearance: 'A lean young man with a black thorn tattooed on one cheek, a good coat that is not his and a very sharp smile.',
      gmNotes: 'Bandit captain stat block. A businessman, not a fanatic. Show him the contract letter (the cult plans to drop him) or beat half his crew and he takes his money and goes. If the heroes treat him fairly, his Thorns guard the road behind them for the rest of the campaign.',
    },
    {
      id: 'pf_emrtilda', name: 'Tilda Rushby', title: 'ferry-keeper of the Ashwater crossing', kind: 'npc', art: 'farmer', shared: true,
      wants: 'Her ferry working, her cheese back from the kobolds, and the "red fools" off her river.', knows: 'The river\'s every trick, the old ford, the gorge bridge, and that the cult\'s carts go into the Redvein Mine full of charcoal and come out with nothing.',
      voice: 'Gruff and short. Says "Hm." a lot. Laughs like a gate creaking, once a year.', appearance: 'A tiny, leathery old woman in a fisherman\'s jersey and huge boots, with forearms like a blacksmith.',
      gmNotes: 'A grumpy friend. If the heroes fetch her raft, she ferries them free forever and lends them a handcart for carrying wardstones. She knew Thrana\'s grandfather.',
    },
    {
      id: 'pf_emryipwick', name: 'Yipwick', title: 'chief of the Redvein kobolds', kind: 'npc', art: 'kobold', monsterId: 'kobold',
      wants: 'For his tribe to be safe, warm and important, and for the Mountain Dragon to love them best.', knows: 'Every tunnel of the Redvein Mine, the back way to the cells, and that the "dragon fire" in the forge is a little fire-man in chains.',
      voice: 'Fast, high and anxious. Repeats the last word of every sentence, sentence. Bows constantly.', appearance: 'A small kobold with rust-red scales, a crown made from a bent tin cup and a very big spear he keeps dropping.',
      gmNotes: 'Kobold stat block. The cult told his tribe the mountain is a sleeping dragon who will make them her favourite children. He is not evil, just lied to. Shown the truth (the magmin in the forge, the forging orders, or a Draconic speaker\'s honest word), he turns his whole tribe against the cult and helps the heroes.',
    },
    {
      id: 'pf_emrthrana', name: 'Thrana Ironbellow', title: 'dwarf smith, last of the ward-keepers\' line', kind: 'npc', art: 'dwarf-miner', shared: true,
      wants: 'To undo the harm the cult forced her to do, and to see the Ward-Hall her ancestors built.', knows: 'How the ward-keys and sockets work, the pass-song that calms the hall\'s guardians, the hidden ward tunnel under the river of fire, and the way to the monastery.',
      voice: 'Deep, slow and dry. Short sentences. Hums while she works. Calls the heroes "lads", whatever they are.', appearance: 'A stocky dwarf woman with a singed red beard in two braids, a leather apron and hands covered in burn scars.',
      backstory: 'Her family kept the old ward-key for generations without knowing why. The cult stole it, captured her, and made her teach them to copy it.',
      gmNotes: 'Rescued in part 3, she travels with the heroes for parts 4 and 5 as a guide (use the veteran stat block if you want her to fight, but let the heroes be the heroes: she prefers to hold doors and hand out cold water). She carries the one real ward-key.',
    },
    {
      id: 'pf_emrsaredd', name: 'Saredd Pyle', title: 'Prior of the Waking Flame at the Patient Vigil', kind: 'monster', art: 'cult-fanatic', monsterId: 'cultFanatic', shared: true,
      wants: 'To be the High Kindler\'s right hand in the new world, with a comfortable chair.', knows: 'Where the stolen wardstones are kept, how to open the vault, when the Waking Rite will be held, and every one of his followers\' weaknesses.',
      voice: 'Soft, smiling and reasonable. Offers tea. Says "my friend" right before saying something terrible.', appearance: 'A thin man with a shaved head, red robes and long, ink-stained fingers. His smile never reaches his eyes.',
      gmNotes: 'Cult fanatic stat block. He poisoned the last of the real monks. He would rather talk than fight and rather run than die. Captured, he bargains: the date of the rite and the way into the Heart in exchange for his freedom.',
    },
    {
      id: 'pf_emrmaudra', name: 'Maudra Vesh', title: 'High Kindler of the Waking Flame', kind: 'monster', art: 'fire-mage', monsterId: 'highKindler', shared: true,
      wants: 'To wake the Ashmother and burn away the cold, cruel world, so that no child ever freezes again.', knows: 'The whole plan, the rite, the stones, and a great deal about grief.',
      voice: 'Quiet, certain and sad. Never shouts. Speaks to the mountain as "Mother".', appearance: 'A tall woman in a cloak of red feathers, grey-streaked black hair, and burn scars on both hands she is proud of.',
      backstory: 'Her village starved in a hard winter while a lord kept his granary locked. Her husband and son died. She found the fire under the mountain in the monks\' books and decided it was the answer.',
      gmNotes: 'High Kindler stat block. She is the villain, but not a monster: a hero who truly listens and offers her a better way (DC 16 Persuasion, only after a round of real talk) can make her falter and stop the rite. Defeated, she does not run. What happens to her is the heroes\' choice.',
    },
  ],
  handouts: [
    { id: 'reward-notice', title: 'Nailed to the notice board on Kettlebrook green', text: 'STOLEN! From the Shrine, on Tuesday night:\nTHE OLD STONE\n(grey, about so high, has a face, you know the one)\nTaken by GOBLINS (the smell is a clue).\nREWARD: 50 gold pieces from the Council,\nfor the stone brought home whole.\nAlso wanted: Haddo Brisby\'s sheep (12). They have names.\n— by order of the Kettlebrook Council\nP.S. Free pie. — M. Brisby' },
    { id: 'collection-order', title: 'A letter in the red-hooded collector\'s satchel', text: 'Brother,\nThe first of the six lies in the goblin hole east of Kettlebrook. The goblin is paid in embers; do not give him more.\nCollect the stone by the new moon. Do not let it touch running water on the way, and do not listen to it hum.\nCarry it to the Vigil by the Ember Road. The Thorns at Greyfen will let you pass. Say the word: KINDLE.\nWhen all six sleep in the cold vault and the keys are forged, Mother wakes, and the long winter ends forever.\n— M.V., High Kindler of the Waking Flame' },
    { id: 'ward-song', title: 'Hobart\'s rubbing of the carving on the Old Stone', text: 'Hush now, Mother, under stone,\nSeven of us sing you down.\nOne within and six along,\nRoad of stones and road of song.\nSleep while snow is on the hill,\nSleep while hearth-fires burn, and still\nSleep when we are dust and gone.\nSleep, and let the world go on.\n\n(Under it, in Hobart\'s hand: "Dwarvish, very old. "Mother" = the mountain?? SIX ALONG = six stones along the road? Ours is one. Where are the others?")' },
    { id: 'gideon-contract', title: 'A letter in Gideon\'s strongroom', text: 'To Gideon Slade, of the Thorns.\nFor 300 gold, paid half now in true coin and half in embers:\nHold Greyfen and close the Ember Road to all travellers north, for one season.\nLet pass any who say KINDLE.\nKeep the stone from the fort chapel safe until our cart comes.\n\n(A second note, folded inside, not meant for Gideon:)\nPrior Saredd: once the stones are home, the Thorns are of no more use to us. Mother will take them with the rest.\n— M.V.' },
    { id: 'forging-orders', title: 'Orders pinned in the overseer\'s office at Redvein', text: 'FORGEMASTER.\nSEVEN keys. The dwarf\'s key is the pattern. The dwarf stays alive until the seventh is cooled and tested.\nStones taken so far: Kettlebrook (lost to meddlers — find out who), Hollowell, Brackenfold shrine, the Vigil\'s own. Greyfen waits with the Thorns. Ashwater is on the cart by the river.\nWhen the keys are done, bring them up the valley path to the Vigil. Ring the bell twice at the gate.\nThe little ones think they serve a dragon. Let them.\n— Prior S.' },
    { id: 'abbot-note', title: 'Hidden under the biggest cairn by the old monks\' graves', text: 'If anyone finds this: we are being poisoned. The red woman smiles and pours the tea.\nWe watched the mountain for a thousand years and we were not watchful enough.\nThe cold stones she steals lie in our vault behind the altar. Pull the red cloth from the Sleeper\'s eyes and it opens.\nThe old back way runs from the vault to the Breath Caves. My bell-key is in the cloister garden, in the blue pot.\nAt the dwarves\' gate in the mountain, sing the song from the stones and the iron guards will kneel.\nForgive us. Finish our watch.\n— Brother Orlo, last abbot of the Patient Vigil' },
  ],
  chapters: [
    {
      id: 'kettlebrook', title: 'Part 1: Goblins in Kettlebrook', level: 1,
      summary: 'Ordinary folk of a frontier town chase goblins who stole the shrine\'s lucky stone. In the goblin caves of Snagtooth Hollow they find the stone, and red-hooded strangers come to collect it: the first sign of a cult, and of what the stone really is.',
      goal: 'Find out who took the Old Stone, follow the goblins to Snagtooth Hollow, and bring the stone home.',
      map: kettlebrook,
      npcs: [
        { npc: 'pf_emrmarigold', x: 10, y: 11 },
        { npc: 'pf_emrhobart', x: 27, y: 17 },
        { npc: 'pf_emrgutnab', x: 74, y: 21, hidden: true },
      ],
      scenes: [
        {
          room: 'Kettlebrook green', title: 'Market day, and a missing stone', handout: 'reward-notice',
          read: 'Thursday market on Kettlebrook green: eggs, rope, very small pies, and geese everywhere. But nobody is shopping. Everyone is crowded round the notice board, and on the skyline to the north, the Ashmother is wearing a thin grey plume of smoke like a feather in a hat.',
          gm: 'The opening. Let each hero say who they are in town (a baker, a farmhand, the smith\'s apprentice...). Then the rumours, one per hero who asks around: goblins came over the bridge on Tuesday night; the Brisby farm was raided too; a tall stranger in a red cloak stayed at the inn; the mountain started smoking the same night; Hobart is "beside himself". The notice offers 50 gp.',
        },
        {
          room: 'The Bent Horseshoe', title: 'Pie, gossip and a job',
          read: 'The inn smells of onion pie and woodsmoke. Marigold Brisby wipes her hands, looks you up and down, and puts a plate in front of each of you before you can say a word. "Eat. Then you can go and get my brother\'s sheep back."',
          gm: 'Marigold is the quest-giver. She tells the heroes about the raid on her brother Haddo\'s farm and the red-cloaked guest (paid in silver, asked about the shrine, left before dawn, tall, a burn scar on his wrist). She gives them a packed lunch and the two potions of healing from the kitchen shelf. This is a good moment to explain how potions and short rests work.',
          treasure: '2 potions of healing, a packed lunch, and Marigold\'s blessing.',
        },
        {
          room: 'Shrine of the Old Stone', title: 'The empty socket',
          read: 'The little white shrine is cold inside. Where the Old Stone stood for a thousand years there is only a round hole in the floor, scratched and muddy. A broken rope trails out of the door like a tail.',
          gm: 'A simple first investigation. The drag marks lead east over the bridge (no check needed: never hide the main path behind a roll). A DC 12 Investigation finds the red cloth and the tall man\'s boot print. A DC 12 Arcana: the socket is faintly cold, as if the stone was "doing something". Hobart arrives, flustered, and asks the heroes to bring it back "whole, please, whole".',
        },
        {
          room: "Hobart's cottage", title: 'The historian', optional: true,
          read: 'Books on the chairs, books on the bed, a book holding the door open. Hobart peers at you over two pairs of spectacles. "Ah, now. That is interesting. You want to know about the stone."',
          gm: 'Hobart shares what he knows: the stone is older than the town, carved with Dwarvish, and the old folk said "while the stone sleeps, the mountain sleeps". He thought it was a saying. He looks nervously at the smoke. He lends the heroes a lantern and a map of the hill ("goblins have used Snagtooth Hollow since my grandfather\'s day").',
        },
        {
          room: 'Kettlebrook mill', title: 'Rats in the mill', optional: true, encounter: 'Rats in the mill',
          read: 'The mill wheel is not turning. From inside comes a squeaking, scrabbling noise, and the miller\'s voice from an upstairs window: "Don\'t just stand there! They\'ve eaten my hat!"',
          gm: 'A gentle first fight, perfect for teaching initiative and attacks. Four giant rats. They flee if two die. The miller rewards the heroes with a ride downstream any time and the news that his boy Wat went after the goblins to find his dog.',
        },
        {
          room: 'Brisby farm', title: 'The raided farm', encounter: 'Goblins at the Brisby farm',
          read: 'Feathers drift across the farmyard. The sheep pen gate hangs open, and from the farmhouse comes the crash of crockery and a high voice singing, very badly, about pie.',
          gm: 'Three goblin warriors stayed behind to loot Haddo\'s larder. They are greedy and careless (the heroes can easily surprise them with a DC 10 Stealth). A goblin who is losing drops his loot and runs toward the hill: let him go, and the heroes can follow his trail. Haddo Brisby is barred in the barn and comes out once it is safe.',
          treasure: 'A sack of the goblins\' loot: 8 sp, a silver spoon (1 gp) and a whole pie, slightly sat on.',
        },
        {
          room: 'Wolf den', title: 'Wolves in Thornwick Wood', optional: true, encounter: 'Wolves of Thornwick Wood',
          read: 'The deer trail dips into a hollow under a fallen oak. Bones crunch underfoot. Three wolves rise out of the shadows, heads low, lips pulled back.',
          gm: 'Only if the heroes take the deer trail toward the stream mouth. The wolves are hungry: meat and a DC 12 Animal Handling sends them off. Otherwise they fight, and each runs when hurt badly. Past the den is the woodcutter\'s hut, whose scratched map shows the goblins\' back door.',
        },
        {
          room: 'Cave mouth', title: 'Snagtooth Hollow', encounter: 'Cave mouth guards',
          read: 'A dark mouth in the hillside, hung with goblin trophies. A painted sign: KEEP OWT. THIS MEENS YOU. From inside, you hear drums, bleating, and somebody laughing.',
          gm: 'Three ways in: the front (here), the chimney on the crest (into Gutnab\'s den), and the stream mouth (into the stolen stone\'s cave). Teach the players that scouting pays: a hero who looks around first spots the other ways (DC 12 Perception or Survival). Front guards: see the area notes for the tripwire.',
        },
        {
          room: 'Goblin common cave', title: 'Sheep, smoke and goblins', encounter: 'Goblin common cave',
          read: 'A smoky cave crammed with goblins, stolen sheep and stolen everything. A sheep turns on a spit. A goblin is banging a bucket drum. All of them stop and look at you.',
          gm: 'The biggest fight of part 1, but it does not have to be a fight: the sheep, a distraction or a good bluff can split the goblins (see the area notes). If the alarm rang, they wait in ambush. Wat, the miller\'s boy, is tied up in the sheep pen cave next door.',
        },
        {
          room: "Gutnab's den", title: 'Gutnab the Magnificent', encounter: "Gutnab's den",
          read: 'On a throne of saddles and a rocking chair, a big goblin in a cooking-pot helmet counts red-glass coins. "WHO DARES disturb Gutnab the Magnificent, in his magnificent... den?"',
          gm: 'Gutnab blusters, then bargains. He will sell the stone\'s location ("the red hoods are taking it TONIGHT, through the fishing tunnel!") and the name "the Kindler" for his life and his throne. He has been paid in ember coins: red glass, worthless. Pointing this out (DC 11 Persuasion) makes him furious with the cult and very friendly with the heroes.',
          treasure: 'Gutnab\'s hoard: 64 sp, 12 gp, a brass candlestick (2 gp), Haddo\'s good boots, and 20 red-glass ember coins (worthless, but evidence).',
        },
        {
          room: 'Hall of the stolen stone', title: 'The red-hooded collectors', encounter: 'The red-hooded collectors', handout: 'collection-order',
          read: 'On a goblin cart in a damp cave sits the Old Stone, its carved face calm and sleeping. Three strangers in red hoods are hitching a mule to the cart. One of them turns, sees you, and draws a curved knife. "The Flame wakes," she says. "And you are too late to stop it."',
          gm: 'The climax of part 1. Three cultists of the Waking Flame and two goblin pushers. The cultists fight hard; the goblins run at the first chance. The leader\'s satchel holds the collection order (handout): the first real clue to the cult. The stone is heavy (two heroes, or the cart and mule) but the stream tunnel leads straight out to the wood.',
          treasure: 'The cultists carry 15 gp, three red hooded cloaks (useful disguises later), and the satchel. The mule, Parsnip, is now the heroes\' mule.',
        },
        {
          room: 'Shrine of the Old Stone', title: 'Home with the stone', handout: 'ward-song',
          read: 'The whole town turns out to watch the Old Stone rolled back over the bridge on a goblin cart. Hobart weeps openly. As the stone settles into its socket there is a sound like a deep, sleepy hum, and on the skyline, very slowly, the plume of smoke over the Ashmother thins.',
          gm: 'The ending of part 1. The council pays the reward. Hobart reads the collection order and turns pale: he fetches his rubbing of the stone\'s carving (handout) and explains what he now believes: the stone is one of seven that keep the mountain asleep, and somebody is stealing the rest. "Six along. Six along the road." The Ember Road runs north toward the mountain. Will the heroes go?',
          treasure: '50 gp reward from the council, split among the heroes. Free pie for a year.',
        },
      ],
      wrapUp: 'The Old Stone is home and the smoke thins, a little. But the cult has the other road stones, and the collection order points north up the Ember Road, past Hollowell and Greyfen Fort. The heroes reach level 2. Marigold packs them a bag of food; Hobart gives them his notes and a promise to read every book he has.',
    },
    {
      id: 'greyfen', title: 'Part 2: The Haunted Road', level: 2,
      summary: 'Two days up the Ember Road, the waystation at Hollowell has gone silent and its dead walk at night; beyond the marsh, bandits paid by the cult hold the old border fort and close the road. The heroes lay the dead to rest, learn how the wards work, and break the cult\'s grip on the road.',
      goal: 'Find out what happened at Hollowell, lay its dead to rest, and get past (or through) Greyfen Fort.',
      map: emberRoad,
      npcs: [
        { npc: 'pf_emrcuthbert', x: 14, y: 25, hidden: true },
        { npc: 'pf_emrgideon', x: 72, y: 31, hidden: true },
      ],
      scenes: [
        {
          room: 'Hollowell yard', title: 'The silent waystation',
          read: 'Hollowell should be loud: wagons, horses, the smell of supper. Instead the gate is open, the yard is empty, and a dry well creaks in a wind you cannot feel. The sun is going down behind you.',
          gm: 'The heroes arrive near dusk. Let them explore. By day the dead hide in the dark; at night they walk the yard. A DC 12 Survival reads the yard: no living soul for a month, but plenty of shuffling footprints going in circles. This is a good place to teach new players about light: who has a torch?',
        },
        {
          room: 'Hollowell common room', title: 'Supper for the dead', encounter: 'The restless common room',
          read: 'Tables still set for supper, a month old. Chairs knocked over. And in the dark between them, figures standing very still, facing the cold hearth, where a lantern burns with a pale green flame.',
          gm: 'Six zombies. Slow, stupid and tough: teach the players that fire and clever moves beat hitting. If no hero attacks the green lantern, Cuthbert Lowe\'s ghost appears when the last zombie falls: "Thank you, travellers. Mind the step. I am afraid we have had some trouble." He tells them about the people in red and the stone in the cellar, and asks for their help.',
        },
        {
          room: 'Guest wing', title: 'The last guest', optional: true,
          gm: 'In the middle room, a merchant\'s writing desk holds her travel diary. Its last entry: "Four people in red came at midnight and went down to the cellar with a crowbar. The keeper went down to stop them. He did not come back up. Then the singing stopped, and the knocking started." Under the bed, her purse: 22 gp.',
          treasure: '22 gp.',
        },
        {
          room: 'Ward chamber', title: 'The broken ward', encounter: 'The broken ward',
          read: 'The cellar door at the end stands open onto a round room of carved sleeping faces. In the middle, an empty socket in the floor. The air is so cold your breath hangs in clouds. Something in the dark is singing the wrong song, high and furious.',
          gm: 'The heart of Hollowell\'s haunting. The specter is the cultist the others killed and left to guard the room. Remind the players of the ward-song from part 1: singing or humming it (DC 12 Performance) freezes the skeletons for a round, and the specter screams at the sound. When the specter falls, the cold lifts, and every dead thing in Hollowell lies down. The secret crawl in the north wall is how the cult left.',
          treasure: 'A cult crowbar, and under the dust a red-glass ember coin stamped with a flame. In the crawl, a dropped pouch: 30 gp and a potion of healing.',
        },
        {
          room: 'Lowe family tomb', title: 'Laying Cuthbert to rest',
          read: 'The graveyard is quiet now. Inside the little marble tomb, a carved old man lies with his hands folded. Cuthbert\'s ghost hovers at the door, his green lantern in his hand. "Would you?" he asks. "I am so very tired."',
          gm: 'If the heroes set the lantern on his tomb, Cuthbert smiles, thanks them, and fades. The lantern goes out. If the graveyard is still restless (the heroes came here before the ward chamber), the skeletons rise first (see the Hollowell graveyard fight). Before he goes, Cuthbert warns them: "Greyfen has a new master. He lets the red ones pass."',
          treasure: 'Cuthbert\'s longsword with a lantern pommel: a +1 longsword that sheds dim light in a 10-foot radius when drawn.',
        },
        {
          room: 'Hollowell graveyard', title: 'The restless graveyard', optional: true, encounter: 'Hollowell graveyard',
          gm: 'Only if the heroes disturb the graves or walk through at night before laying the ward chamber to rest. Six skeletons claw up out of the open graves. If the ward chamber is already quiet, they simply lie still and the heroes never need to fight.',
        },
        {
          room: 'Greyfen marsh', title: 'Across the fen', optional: true, encounter: 'Fen wolves',
          read: 'Grey reeds, grey water, grey mist. Somewhere in the fog, a wolf howls, and another answers from the other side of you.',
          gm: 'Four fen wolves hunt the marsh. They are wary of fire and of anyone who stands their ground. The heroes must choose how to cross Greyfen Water: the watched bridge, the fallen tree, or the southern ford (see the area notes). Each crossing leads to a different way into the fort.',
        },
        {
          room: "Peddler's camp", title: 'Granny Pimm', optional: true,
          read: 'A painted cart, a donkey in a hat, a smoky fire. A tiny woman waves a ladle at you. "Customers! Real ones! Sit, sit."',
          gm: 'A friendly face and a shop. She sells potions of healing and knows the fort: the gate charges a toll, the south wall has a breach "the spider uses", and the Thorns let a red-cloaked rider through "like an old friend". A good place for the heroes to plan.',
        },
        {
          room: 'Gatehouse', title: 'Toll: 5 gold', encounter: 'Fort gate watch',
          read: 'Greyfen Fort squats on its hill over the road, a black thorn banner snapping above the keep. At the gate, a bandit with a crossbow leans on the arch. "Toll\'s five gold a head, friends. Or turn round. Or don\'t, and find out."',
          gm: 'Choices: pay (and walk in as guests to meet Gideon), bluff (DC 13 Deception, or say "KINDLE", the cult\'s password from the collection order: they wave the heroes through at once), sneak in another way, or fight. A fight at the gate alerts the courtyard.',
        },
        {
          room: 'Old north tower', title: 'Something in the north tower', optional: true, encounter: 'Spider in the north tower',
          gm: 'The locked tower holds a giant spider and a wrapped-up bandit, Wib. Freeing him makes a friend inside the fort: he tells the heroes everything (the postern, the strongroom, that Gideon is "all right, really, just greedy").',
        },
        {
          room: 'Fort courtyard', title: 'The Thorns', encounter: 'Bandits in the courtyard',
          read: 'Tents, cookfires, stolen wagons and a dozen hard faces turning toward you. Someone stops sharpening a sword. Someone else starts.',
          gm: 'A moderate fight, or a moment to talk. Many of the Thorns joined because they were hungry. Once the heroes know about the cult, a speech about who the Thorns are really working for (DC 13 Persuasion) turns two bandits and makes the rest hesitate. Driving the stolen horses through the courtyard is a great distraction.',
        },
        {
          room: 'Keep of Greyfen', title: 'Gideon Slade', encounter: "Gideon's keep", handout: 'gideon-contract',
          read: 'A long table, a fire, and a young man with his boots up, flipping a red-glass coin over his knuckles. Two red-robed visitors sit stiffly beside him. "Friends," says Gideon Slade, "you have cost me a lot of money. Talk fast."',
          gm: 'Gideon will talk. Two cultists are here to pay him. If the heroes show Gideon the contract letter with its hidden note (from the strongroom, if they went there first) or simply beat his crew, he takes his gold and leaves, and the cultists fight alone. If they fight Gideon, he surrenders at a quarter of his hit points. In the strongroom: the Greyfen wardstone, the contract, and the toll money.',
          treasure: 'Strongroom: 180 gp, a +1 shield with a thorn on it, the Greyfen wardstone. Gideon\'s purse: 40 gp. The cultists: 10 gp and ember coins.',
        },
      ],
      wrapUp: 'Hollowell sleeps again, and the road is open. The heroes have a second wardstone (Greyfen\'s) and a contract that names Maudra Vesh and her monastery in the foothills. But north of the fort the Ember Road reaches the Ashwater, and the cult\'s carts have been crossing it all month. Freed travellers can carry the Greyfen stone back to its chapel, or the heroes can take it with them. The heroes stay level 2 for part 3.',
    },
    {
      id: 'ashwater', title: 'Part 3: The Mine of Keys', level: 2,
      summary: 'At the grey Ashwater river, the ferry has been sabotaged and the cult runs an old mine on the far bank, where captive kobolds and a captured dwarf smith forge copies of the ancient ward-keys. The heroes cross the river, win over the kobolds and destroy the Forge of Keys.',
      goal: 'Cross the Ashwater, recover the river\'s wardstone, free the prisoners and stop the cult forging ward-keys.',
      map: ashwater,
      npcs: [
        { npc: 'pf_emrtilda', x: 28, y: 9 },
        { npc: 'pf_emryipwick', x: 16, y: 50, hidden: true },
        { npc: 'pf_emrthrana', x: 58, y: 70 },
      ],
      scenes: [
        {
          room: "Tilda's ferry house", title: 'The ferry is on the wrong side',
          read: 'A tarred cottage on stilts, a bell on a post, and a sign: FERRY 1 SP. NO GOATS. A tiny old woman in enormous boots is splicing a rope with her teeth. "Hm. Raft\'s on the far bank. Red fools cut my rope. You want across, you fetch it."',
          gm: 'Tilda is grumpy, honest and useful. She tells the heroes: the cult\'s carts went south into the Redvein Mine; there are "little dragon-men" in the mine; there is a lookout on the toll island; and her cheese has been stolen. She lends them a rope and feeds them fish stew.',
        },
        {
          room: 'Ferry landing', title: 'Crossing the Ashwater',
          read: 'The river is wide, grey and fast, clouded with ash from the mountain. Through the mist, on the far bank, the raft sits on the mud like a sleeping dog.',
          gm: 'A puzzle with many answers: swim (DC 12 Athletics), haul along the rope (DC 10 Athletics), wade the old ford upstream, sneak by the toll island, or cross the gorge bridge downstream. Let the players choose and plan. Once one hero is across, the raft comes back easily (untie the knot, haul) and the whole party crosses safely. Where they land decides how they reach the mine.',
        },
        {
          room: 'The old ford', title: 'Something big in the shallows', optional: true, encounter: 'Crocodiles at the ford',
          gm: 'Two crocodiles hunt the shallows of the old ford. Throwing them fish from Tilda\'s smokehouse buys a minute to cross. Beyond the ford are the mud flats, where four mud mephits want to play (see the area notes).',
        },
        {
          room: 'Toll island', title: 'The lookouts', encounter: 'Lookouts on the toll island',
          read: 'Smoke drifts from the stump of an old stone tower on the island. A figure on top lifts something to its lips: a horn.',
          gm: 'Four cultists and four hired bandits watch the ferry. If they blow the horn, the mine mouth kobolds are ready for the heroes. Stopping the horn (a ranged attack against the horn-blower, or a sneaky approach) keeps the mine quiet. The bandits surrender quickly. In the tower floor, the empty socket of the Ashwater stone.',
          treasure: '22 gp of stolen tolls, rope, rations.',
        },
        {
          room: 'Cult supply camp', title: 'The cult camp', encounter: 'Cult supply camp',
          read: 'Red tents behind a fence of stakes, carts of charcoal and iron, and a cook stirring a pot while singing a hymn about fire. Under a tarp on the biggest cart, something grey and round is roped down tight.',
          gm: 'Six cultists, an acolyte and a thug. By night most are asleep. Under the tarp: the Ashwater wardstone. Tilda will hide it at her house if the heroes ask. The covered air shaft in the corner is a back way into the kobold warren. The red hooded cloaks from part 1 work as disguises here (DC 11 Deception to walk through by day).',
          treasure: 'The Ashwater wardstone; 20 gp and 30 worthless ember coins.',
        },
        {
          room: 'Mine mouth', title: 'Little dragons', encounter: 'Kobolds at the mine mouth',
          read: 'A painted red dragon sprawls across the rock over the mine mouth, with the word OURS under it. Little yellow eyes blink at you from a ledge. A rock rattles down the old cart rails toward your feet.',
          gm: 'Eight kobolds and a trap field. Kobolds are weak alone and dangerous in a pack: teach the players to spread out. Rolling stones down the rails is their favourite trick (DC 12 Dexterity save or 1d6 bludgeoning and knocked prone). When half are down, the rest run to warn Yipwick. A hero who calls out in Draconic gets them to stop and listen.',
        },
        {
          room: 'Kobold warren', title: 'Yipwick\'s tribe', encounter: 'Kobold warren',
          read: 'A maze of little caves full of little beds, little cookpots and little kobolds. They freeze. A kobold in a tin-cup crown points a big spear at you, and drops it. "Intruders! Intruders, intruders!"',
          gm: 'The kobolds can be a fight or a friendship. They believe the mountain is a sleeping dragon who will love them for helping wake it. Truth turns them: the forging orders ("the little ones think they serve a dragon. Let them."), or the heroes describing the magmin chained in the forge. A DC 12 Persuasion after showing proof wins Yipwick, and his tribe joins the heroes. Do not let the heroes fight in the nursery: if they do, the tribe never forgives them. Yipwick returns Tilda\'s cheese and shows them the back way.',
        },
        {
          room: 'Shrine of the false dragon', title: 'The Mountain Dragon', optional: true,
          gm: 'Candles, a mud-painted dragon with glass eyes, and offerings. Yipwick (if friendly) gives the heroes the hot key: a reject copy of the dwarven ward-key. Behind the painting, the kobold back way leads to the cell block.',
          treasure: 'The hot key; offerings worth 15 gp in buttons and trinkets.',
        },
        {
          room: 'Spider gallery', title: 'The No Place', optional: true, encounter: 'Spider gallery',
          gm: 'Two giant spiders and their rats. Heroes who came in from the gorge bridge arrive here first. The dead miner\'s pack in the pool is worth finding (see the area notes).',
          treasure: 'A silvered dagger, 18 gp, and a dwarf-made lantern.',
        },
        {
          room: "Overseer's office", title: 'Seven keys', handout: 'forging-orders',
          gm: 'The forgemaster\'s office. The orders (handout) explain the plan: keys for the sockets, stones taken so far, the way to the Vigil. The strongbox holds supplies the heroes will need. A good moment to pause and let the players piece the plot together.',
          treasure: '75 gp, two potions of healing, a scroll of protection from evil and good.',
        },
        {
          room: 'Cell block', title: 'The dwarf in the cell', encounter: 'Cell block guards',
          read: 'Iron bars, straw, and a smell of old soup. In the first cell, a stocky dwarf woman with a singed beard is sharpening a spoon against the wall. She looks up. "Took your time, lads."',
          gm: 'Two thugs and four cultists guard the cells. Thrana Ironbellow is the cult\'s captive smith: she was forced to teach them to copy her family\'s ward-key. Freed, she wants to wreck the forge, and she knows the forgemaster\'s weakness: "he\'s scared of the little fire-man. He keeps it chained with a cold-iron key. Get the key, the fire-man\'s free."',
        },
        {
          room: 'The Forge of Keys', title: 'The Forge of Keys', encounter: 'The Forge of Keys',
          read: 'Heat hits you like a wall. Kobolds hammer at glowing iron while a little man of magma grins in the coals. A bald man in a scorched apron spins round, hammer raised. "The Kindler wants seven keys. I have six. You are not going to stop me now."',
          gm: 'The climax of part 3. The forgemaster (cult fanatic), a magmin and six kobolds. If Yipwick is with the heroes, the kobolds drop their tools and only the forgemaster and the magmin fight. Freeing the magmin (the forgemaster\'s cold-iron key, or Thrana smashing its chain, an action) makes it flee down the Deep Crack, laughing. Smashing the forge (Thrana knows how: a few minutes) ends the key-making for good. Five forged keys have already gone north; the sixth is here, half-finished.',
          treasure: 'The forgemaster\'s purse: 35 gp, the cold-iron key, and the half-made sixth ward-key (it can still unlock a socket). Thrana\'s family ward-key, the real one, in his apron.',
        },
      ],
      wrapUp: 'The Forge of Keys is cold, the kobolds are free (and may become Tilda\'s noisy neighbours), and Thrana Ironbellow joins the heroes to see her ancestors\' work through. The forging orders name the monastery up the valley path, where three more stolen stones lie in a vault. The heroes reach level 3.',
    },
    {
      id: 'vigil', title: 'Part 4: The Monastery of the Patient Vigil', level: 3,
      summary: 'In a hidden valley in the foothills, the cult has taken over an ancient monastery whose monks once watched the mountain. The heroes find a way in, free the cult\'s duped converts, defeat the Prior and recover three stolen wardstones from the vault behind the altar of the Waking Flame.',
      goal: 'Get into the monastery, recover the wardstones from the vault, and learn when and where the Waking Rite will happen.',
      map: monastery,
      npcs: [
        { npc: 'pf_emrthrana', x: 3, y: 77 },
        { npc: 'pf_emrsaredd', x: 55, y: 16, hidden: true },
      ],
      scenes: [
        {
          room: 'Valley of Bells', title: 'The hidden valley',
          read: 'The valley path climbs through pines strung with red and orange prayer flags. Far above, on a terrace below the cliffs, a walled monastery clings to the mountainside. A bell rings once. The Ashmother looms behind it, smoking hard now.',
          gm: 'Arrival. Let the heroes plan: the front gate, the goat path to the bell tower, the hot springs and the kennel door, or the Breath Caves and the vault tunnel. Thrana remembers the monks\' bell code from her grandfather\'s stories: one ring is the hour, three fast rings means alarm.',
        },
        {
          room: 'Lookout Rock', title: 'Watchers on the rock', optional: true, encounter: 'Watchers on Lookout Rock',
          gm: 'Two scouts and four mastiffs watch the valley path. If spotted, one scout runs for the bell. Stopping the runner (ranged attacks, a fast hero, or a clever trick) keeps the monastery calm. Going round by the cart track avoids them.',
        },
        {
          room: 'Terraced fields', title: 'The tired converts',
          read: 'People in grey smocks hoe the bean terraces, slowly. A woman looks up at you, and quickly back down. "Don\'t," she whispers. "They\'ll see."',
          gm: 'The converts are villagers the cult tricked with promises of warmth and plenty. They are not fighters. Kindness and the truth about the Waking (DC 12 Persuasion, or show them the contract\'s note about the Thorns) wins their help: grey smocks as disguises, the kennel door unbarred, and the warning about the fire-hound in the vault.',
        },
        {
          room: "Old monks' graves", title: 'The silent bells', optional: true, handout: 'abbot-note',
          read: 'Twenty little cairns, each with a bell on a pole above it. The wind blows. The bells do not ring.',
          gm: 'The newest grave shows signs of poison (DC 13 Medicine). Under the biggest cairn: the last abbot\'s note (handout), with the vault\'s secrets, the bell-key\'s hiding place and the pass-song tip for part 5.',
        },
        {
          room: 'Bell tower', title: 'Up the goat path', optional: true, encounter: 'Bell tower watch',
          read: 'You haul yourself through a broken shutter into a dim tower. Above you hangs a great bronze bell. Below you, two scouts are playing dice by a lantern, and four cultists are asleep on sacks.',
          gm: 'The sneaky way in. Keep the bell quiet: cut the rope or hold it. Ringing it once, calmly, tells the monastery "all is well" and buys the heroes an hour. Through the dormitory and refectory the heroes reach the cloister unseen.',
        },
        {
          room: 'Gate lodge', title: 'Gate of the Vigil', encounter: 'Gate of the Vigil',
          read: 'A heavy gate in a high wall, red banners hanging where grey ones used to be. Cultists dice in a lodge by the gate. One looks up. "Bell twice for the forge carts. You\'re not a forge cart."',
          gm: 'The front way. The forging orders say: ring twice at the gate. A hero who does, in a red hood, with a cart, walks straight in (DC 11 Deception). Otherwise six cultists, two acolytes and a thug guard the gate, and a fight here may ring the alarm.',
        },
        {
          room: 'Breath caves', title: 'The breathing cave', optional: true, encounter: 'Breath caves',
          read: 'The cave sighs. Hot steam puffs from cracks in the floor, and in the vapour little shapes of steam and coal-glow dance and giggle. "Visitors! Play with us!"',
          gm: 'Steam mephits and magmins, childish and bored. Win their game (see the area notes) and they let the heroes pass to the vault tunnel. The back door to the vault needs the bell-key from the cloister garden, thieves\' tools or brute force.',
        },
        {
          room: 'Refectory', title: 'Supper with the Waking Flame', encounter: 'Refectory',
          read: 'Long tables, red candles, a roaring fire. Cultists eat in silence while one reads aloud about the "Great Waking". Every head turns toward the door.',
          gm: 'Eight cultists, two acolytes and two thugs. Heroes in disguise can bluff through (DC 14 Deception to send them all away). Brother Wend, the youngest, will surrender and help: he knows the rite is "at the next new moon, in the mountain\'s heart" and that the Kindler left four days ago.',
        },
        {
          room: 'The cloister', title: 'The monks\' story', optional: true,
          read: 'Pale pillars around a garden of red gravel. On each pillar, faded carvings: dwarves singing to a mountain with a sleeping face, and robed monks watching from below.',
          gm: 'Walking the cloister reveals the monks\' history (DC 12 History): the dwarves built the Ward-Hall and the stones, the monks were set to watch, and "the song opens the gate". In the garden, the bell-key in the blue pot.',
          treasure: 'The bell-key (opens the vault\'s iron back door).',
        },
        {
          room: 'Scriptorium', title: 'The Prior', encounter: "The Prior's scriptorium",
          read: 'A thin man in red robes looks up from a page of beautiful red writing and smiles. "Visitors! Do sit down. Tea? I would so like to know who you are, before we begin."',
          gm: 'Saredd Pyle talks first, offering the heroes "a place in the warm world" and fishing for what they know. When talk ends, he and his acolytes and cultists fight. At half hit points he runs for the secret stair to his quarters, then the Hall. Captured, he trades the rite\'s place and time for his freedom. His desk upstairs holds Maudra\'s letters.',
          treasure: 'Prior\'s quarters: 120 gp, six silver monks\' bells (10 gp each), Maudra\'s letters (the rite is at the new moon, in the Heart).',
        },
        {
          room: 'Hall of the Waking Flame', title: 'Wake. Wake. Wake.', encounter: 'Hall of the Waking Flame',
          read: 'Rows of cultists kneel before a fire pit and a great statue of a sleeping mountain with a red cloth over its eyes. Two wardens in feathered masks lead the chant, and in the fire, two little magma-men dance. The chant stops. Every head turns.',
          gm: 'The big fight of part 4: two flame-wardens (cult fanatics), two magmins and six cultists. The magmins can be turned (see the area notes). Pulling the red cloth from the statue\'s eyes opens the vault behind it. The abbot\'s note tells the heroes this; so does Saredd if captured.',
        },
        {
          room: 'Wardstone vault', title: 'The cold stones', encounter: 'Wardstone vault',
          read: 'Frost creeps across the floor from three grey stones on a cart. Curled round them, a black hound with embers for eyes lifts its head, and smiles.',
          gm: 'A hell hound and two cultist keepers. Tell the players the hound will not go near the cold stones: standing beside one is good cover. When it falls, the heroes have three wardstones: Hollowell\'s, Brackenfold shrine\'s, and the Vigil\'s own. The cart fits the vault tunnel. As the heroes leave, the silent bells on the monks\' graves ring all together.',
          treasure: 'Three wardstones; a chest with 140 gp, a potion of fire resistance and two potions of healing; the cult\'s map of the mountain showing the Ash Stair.',
        },
      ],
      wrapUp: 'The monastery is free, its converts going home, and the heroes hold three more wardstones. Maudra\'s letters say the Waking Rite is at the new moon, in the Heart of the Ashmother, and the new moon is three days away. Thrana leads the way up the Ash Stair, and Tilda\'s handcart (or Parsnip the mule) carries the stones. The heroes reach level 4.',
    },
    {
      id: 'heart', title: 'Part 5: The Heart of the Ashmother', level: 4,
      summary: 'Inside the waking volcano, the heroes climb to the dwarves\' ancient Ward-Hall beside a river of fire, set the recovered wardstones back in their sockets, and race to the Heart of the Mountain to stop the High Kindler\'s Waking Rite before the mountain wakes.',
      goal: 'Reach the Ward-Hall, restore as many wardstones as possible, and stop Maudra Vesh\'s Waking Rite.',
      map: heart,
      npcs: [
        { npc: 'pf_emrthrana', x: 9, y: 71 },
        { npc: 'pf_emrmaudra', x: 69, y: 26, hidden: true },
      ],
      scenes: [
        {
          room: 'The Ash Stair', title: 'Into the mountain', encounter: 'Outriders on the Ash Stair',
          read: 'The mountain shakes under your feet. Ash falls like grey snow. Ahead, a tunnel of black glass leads up into the dark, worn steps cut into its floor, and something with burning eyes is coming down them, sniffing.',
          gm: 'A hell hound and four cultist outriders patrol the Ash Stair. This is a good moment to remind the players of the cold spring water idea (it hurts fire creatures) and of their Wardstone tally. Then the choice of ways: the gate, the crypt stair, or the hidden ward tunnel (Thrana knows where to look).',
        },
        {
          room: 'Gate of the Wardens', title: 'The kneeling guardians', encounter: 'Guardians of the gate',
          read: 'Bronze doors green with age, two dwarf statues as tall as houses, and four suits of armor standing before the doors, perfectly still. As you step closer, every helmet turns toward you at once.',
          gm: 'Sing the ward-song (any hero; no check needed, it is the password) and the armor kneels. Forget it and it is a fight. A great payoff for players who kept the handouts.',
        },
        {
          room: 'Tombs of the Wardens', title: 'The last ward-keeper', optional: true, encounter: "Wardens' tombs",
          gm: 'The wight of the last ward-keeper and six skeletons, woken by the mountain\'s fury. It thinks the heroes are thieves. A wardstone or the song makes it hesitate; a DC 14 Persuasion lays it back to rest. Thrana can speak to it in old Dwarvish, giving advantage.',
          treasure: 'A +1 shield and 200 gp in old dwarven coins.',
        },
        {
          room: 'The Ward-Hall', title: 'Seven sockets',
          read: 'Pillars carved as dwarves hold up the dark. In the middle of the hall, seven sockets ring a cold blue fire. In one, a great grey stone hums. As you carry your stones into the hall, they begin to hum too, softly, as if they recognise home.',
          gm: 'The heart of the campaign\'s "score". Setting each recovered stone in a socket takes an action and a key (Thrana\'s real key or a forged one). Each stone set here adds one round to the Waking Rite (keep count on the tally). If all six empty sockets are filled, the rite cannot succeed: Maudra can still be fought or talked to, but the mountain will not wake. Stones the heroes returned home along the road (like Kettlebrook\'s) count too: they add a round each from afar.',
        },
        {
          room: 'The Quenching Forge', title: 'Cold water', optional: true,
          gm: 'The dwarves\' forge with its icy spring. Weapons dipped here deal an extra 1d4 cold damage for an hour; flasks of the water deal 1d6 cold damage to fire creatures. Thrana fills every flask she can find. A short rest here is safe.',
        },
        {
          room: 'The Ember Cloister', title: 'The bronze keepers', encounter: 'Azers of the Ember Cloister',
          read: 'Braziers ring the room. Three figures of polished bronze with beards of living flame raise their hammers. "No further, thief. We keep the hall."',
          gm: 'Three azers, bound long ago to tend the hall. Proof that the heroes are restoring the wards (a stone, Thrana, the song) and a DC 13 Persuasion makes them allies. Allied, they hold the Long Gallery so the heroes can go by the chain bridge. Fought, they are tough: avoid this fight if you can.',
        },
        {
          room: 'The Long Gallery', title: 'Battle of the Great Bridge', encounter: 'Battle of the Long Gallery',
          read: 'At the end of the gallery, red light and a roar like a furnace. Cultists have built a barricade where the gallery meets the bridge, and behind it a woman in a feathered mask is pointing at you, and a black hound is already running.',
          gm: 'A flame-warden (cult fanatic), eight cultists and a hell hound hold the way to the Heart. Narrow ground: a hero with a shield can hold the gallery. Shoves near the bridge edge are deadly; say so before anyone tries. If the azers are allies, they fight here instead and the heroes can take the chain bridge.',
        },
        {
          room: 'Obsidian galleries', title: 'The hall of mirrors', optional: true, encounter: 'Obsidian galleries',
          gm: 'Over the chain bridge, steam mephits and magmins play among black mirrors. A story or a shiny thing buys passage. The crack in the south wall leads to the Heart\'s north causeway: the heroes arrive behind the rite.',
        },
        {
          room: "The Kindlers' camp", title: 'The cult\'s camp', optional: true, encounter: "The Kindlers' camp",
          gm: 'Through the ward tunnel under the lava river, the heroes reach the cult\'s camp. The thugs can be talked into leaving (DC 13 Persuasion). Maudra\'s tent holds her journal and gold; the tunnel past the magmin nest leads to the Heart\'s south causeway.',
          treasure: '150 gp, Maudra\'s journal, two potions of healing.',
        },
        {
          room: 'The Heart of the Mountain', title: 'The Waking Rite', encounter: 'The Waking Rite',
          read: 'A lake of fire, and in the middle, on an island of black stone, Maudra Vesh in her cloak of red feathers, arms raised in a ring of flame. Two hell hounds pace the causeways. The mountain shudders with every word she speaks. She sees you, and she does not stop. "You are too late, children. Mother is already listening."',
          gm: 'The finale. The rite lasts 6 rounds, plus one for every wardstone restored (count the tally aloud!). Maudra chants each round instead of attacking unless she is attacked in melee. Ways to win: defeat her; knock the braziers into the lava (each costs her a round); snatch the forged key from the altar (two rounds); or reach her heart (see her profile: DC 16 Persuasion after real talk). If the rite ends with her still chanting, the mountain\'s fire rises (see the next scene).',
          treasure: 'Maudra\'s feather cloak (a cloak of protection), her staff, and the last forged ward-keys.',
        },
        {
          room: 'The Heart of the Mountain', title: "The Mountain's Wrath", optional: true, encounter: "The Mountain's Wrath",
          read: 'The lake heaves. A shape of living fire rises out of it, taller than a house, and roars with a voice like a forest burning.',
          gm: 'Only if the rite completes. A fire elemental, the mountain\'s first breath. It is a high fight on its own. Every wardstone set in the Ward-Hall during this fight (a hero can run back: two rounds each way, or the azers can do it) makes it lose 20 hit points as the lullaby grows. When it falls, or when all six sockets are filled, it sinks back into the lake, and the mountain sighs back to sleep.',
        },
        {
          room: 'The Ward-Hall', title: 'The lullaby',
          read: 'One by one, the stones begin to sing. The sound fills the hall, low and slow and sleepy, and the shaking under your feet fades to a gentle rumble, like a giant snoring. Far below, the lake of fire settles and dims. Thrana is crying into her beard. "There," she says. "There. Go to sleep, old Mother."',
          gm: 'The epilogue in the mountain. Let each hero say one thing they do now. Then the walk home down the Ember Road, past every place they saved: the kobolds, Tilda, the Thorns, Cuthbert\'s quiet grave, and finally Kettlebrook, where Marigold has made enough pie for an army. See the adventure ending.',
        },
      ],
      wrapUp: 'The Ashmother sleeps again, her lullaby stronger than it has been in a thousand years. The heroes walk home down the Ember Road as the people who sang a mountain to sleep.',
    },
  ],
  ending:
    'Success: the rite is stopped and the stones sing. The smoke over the Ashmother thins to nothing within a month. The Waking Flame breaks apart; its converts go home, ashamed and grateful. If Maudra lives, she is the heroes\' to judge: a trial in Kettlebrook, exile, or a chance to make amends by tending the Ward-Hall with Thrana and the azers. Kettlebrook throws a feast; Hobart writes a very long book about the heroes (with several mistakes); Thrana stays in the mountain as the first new ward-keeper in a thousand years. Failure: if the rite completes and the fire elemental is not stopped, the Ashmother wakes. She does not explode at once: ash falls on the whole valley, the river chokes, and every town on the Ember Road must flee south. The heroes have one last chance: fill the sockets while the mountain is still waking, a desperate climb back up the Ash Stair through fire and smoke. What next: Maudra\'s journal counts six forged keys, but only five were found on the island. Somebody else in the cult kept one. And Hobart has found a second ward-song in his books, about another mountain, far to the east, that also sleeps.',
};
