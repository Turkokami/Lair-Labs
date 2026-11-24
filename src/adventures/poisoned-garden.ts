// The Poisoned Garden: a murder mystery that turns into botanical horror, for four heroes of level 8.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

function seetheGardens() {
  const b = new MapBuilder('adv-poisoned-garden', 'The Seethe Gardens on Midsummer Night', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'hedge' });
  const r = rng(8821);
  const GREEN = '#9fe07a', LANTERN = '#ffcf7a', STEAM = '#a8d8ff';

  // ================= the hill: solid ground in the north, with the grotto, the warren and the old terrace inside it =================
  b.rock(0, 0, 80, 23);

  b.cave('The Steaming Grotto', 13, 10, 10, 7, {
    seed: 811, mat: 'cave-floor',
    read: `Hot, wet air wraps around you like a towel. Pools of milky water steam under a ceiling dripping with ferns, and pale roots as thick as your arm hang down into every pool, drinking.`,
    gm: `The hot springs that heat the whole garden. Rose roots have reached down from the hill to drink here, and the water tastes faintly sweet (DC 13 Nature: sap in the water). A copper pipe runs out of the east pool toward the tea pavilion; this is how the rose's sap reached the tea kettle, though the tea was not what poisoned the heir. The springs are home to water spirits that the rose's roots have made angry. The grotto tunnel joins the root warren to the east.`,
  });
  b.pool(10, 8, 4, 3, true).pool(18, 12, 3, 2).pool(7, 13, 2, 2);
  b.tunnel([[13, 16], [12, 20], [12, 23]], 3, { seed: 812, mat: 'cave-floor' });
  b.props_('steam-vent', [[14, 6], [20, 9], [9, 15]]).props_('ferns', [[5, 8], [16, 5], [21, 14]]).prop('obscuring-cloud', 12, 11).props_('stalactites', [[8, 5], [19, 6]]).prop('glowing-fungus', 22, 10).prop('mushrooms', 4, 11).prop('sewer-outflow', 20, 13, 90).prop('urn', 15, 14);
  b.light(10, 8, 10, 20, STEAM).light(18, 12, 10, 15, STEAM).light(13, 15, 5, 15, STEAM);
  b.encounter('Scalding springs', [4, 4, 19, 13], [['waterElemental', 3], ['steamMephit', 4]], 'moderate');

  b.cave('The root warren', 30, 8, 6, 4, {
    seed: 813, mat: 'dirt',
    read: `Roots fill this hollow under the hill: a whole forest upside down, twisting from the ceiling and knotting across the floor. They pulse, slowly, like something breathing in its sleep.`,
    gm: `The rose's taproots run through here on their way to the springs. A thing like a rotten stump (a roper) guards the crossing, with two shambling mounds half-sunk in the root mass and violet fungi among them. Cutting the thickest root (AC 15, 60 hit points, vulnerable to fire) costs the Rose 30 hit points before the final fight and makes her children in the warren go still for a minute. A DC 15 Survival shows which roots lead to the old east terrace.`,
  });
  b.tunnel([[21, 9], [26, 8]], 2, { seed: 814, mat: 'dirt' });
  b.tunnel([[34, 10], [37, 13], [40, 16]], 2, { seed: 815, mat: 'dirt' });
  b.props_('log-fallen', [[27, 6], [33, 10]]).props_('mushroom-giant', [[29, 10], [34, 6]]).props_('mold-patch', [[26, 9], [32, 5]]).prop('skeleton-lying', 31, 9).prop('backpack', 30, 10).prop('glowing-fungus', 28, 7).prop('spider-web', 32, 7);
  b.light(28, 7, 5, 15, GREEN).light(34, 6, 5, 10, GREEN);
  b.encounter('The grafted dark', [24, 4, 13, 9], [['roper', 1], ['shamblingMound', 2], ['violetFungus', 2]], 'moderate');

  b.room('The root cellar', 38, 15, 10, 7, {
    mat: 'dirt',
    read: `Shelves of onions, wine and crocks of pickled lemons, the ordinary cellar of a busy garden. But the back wall has burst, and roots have pushed out of it and across the floor like fingers feeling for something.`,
    gm: `Reached by the cellar doors behind the summerhouse. The burst wall opens onto the tunnel to the root warren. A narrow passage east (once a drainage cut) runs to the old east terrace, and halfway along it, behind a loose panel, is the back door to the gardener's secret laboratory (DC 16 Perception or Investigation, or Emeric's key).`,
  });
  b.floor(43, 22, 2, 1, 'dirt').door(43, 22, 's', 'closed').door(44, 22, 's', 'closed');
  b.props_('wall-shelves', [[38, 15], [41, 15]]).prop('wine-rack', 47, 15).props_('barrel-group', [[46, 20]]).prop('produce-crates', 39, 20).prop('sack', 40, 19).prop('stairs-up', 43, 21).props_('log-fallen', [[39, 17]]).prop('lantern-hook', 45, 17);
  b.light(45, 17, 5, 15, LANTERN);

  // drainage cut from the cellar to the old terrace, with the lab's back door
  b.hall(48, 17, 49, 17, 1, { mat: 'dirt' }).hall(49, 17, 49, 9, 1, { mat: 'dirt' }).floor(50, 17, 1, 1, 'dirt');
  b.tunnel([[49, 9], [55, 6], [63, 6]], 2, { seed: 816, mat: 'dirt' });
  b.door(51, 17, 'w', 'secret');
  b.prop('rubble-pile', 49, 12).prop('bones', 56, 6);

  b.room('The secret laboratory', 51, 15, 10, 8, {
    mat: 'stone-flagstone',
    read: `Glass vessels bubble over spirit lamps. Rows of jars hold roses at every stage of growth, and in some of them the flowers turn slowly to follow your light. On a lectern lies a page of careful notes, and pressed between its leaves, a child's drawing of a rose.`,
    gm: `Emeric's real work. His lab notes (handout) give the recipe for graft-bane and the truth about the mother rose. Three doses of graft-bane sit ready on the rack: each one slows a Midsummer Rose's growth in one person for six hours (it buys the heir until noon). In the vats live the failures: oozes that were roses once. They stir if anyone opens a vat or breaks glass. The secret doors lead to the cottage (south) and the drainage cut (west).`,
  });
  b.props_('alchemy-table', [[53, 17], [57, 17]]).prop('potion-rack', 60, 16).props_('shelf-jars', [[51, 15], [54, 15]]).prop('lectern', 59, 21).props_('cauldron', [[52, 21], [55, 21]]).prop('herbs-drying', 58, 15).prop('acid-pool', 56, 20).prop('green-slime', 53, 20).prop('potion-shelf', 60, 19).prop('levitating-tome', 59, 20, 0, { gm: true });
  b.light(53, 17, 5, 15, GREEN).light(57, 17, 5, 15, GREEN);
  b.encounter('Failed experiments', [51, 15, 10, 8], [['ochreJelly', 2], ['blackPudding', 1], ['grayOoze', 3]], 'low');

  b.room('The Forsaken Terrace', 62, 1, 17, 20, {
    mat: 'grass',
    read: `Wild roses have eaten this terrace whole. They climb the broken pavilion, choke the dry fountain and arch overhead in tunnels of thorn, and every bloom, thousands of them, is turned toward you. In the middle, over a small grave, a briar the size of a house is slowly standing up.`,
    gm: `Closed by the Duchess twelve years ago, after Posy Greaves died here. This is where the mother rose grew from the girl's grave. She is the heart of everything: kill her or calm her and every Midsummer Rose in the garden withers within the hour, the heir's included. Paths in: the overgrown stair from the compost pits, the drainage cut from the cellar, and the warren's roots.`,
  });
  b.rock(62, 1, 3, 3).rock(76, 17, 3, 4).rock(77, 1, 2, 2);
  b.rubble(64, 5, 4, 3).mud(66, 15, 5, 3).mud(73, 12, 3, 2);
  b.floor(72, 21, 4, 2, 'dirt');
  b.area("Posy's grave", [[68, 8, 5, 4]], {
    read: `A child's headstone, worn smooth, half swallowed by a trunk of braided rose stems. Someone has kept the moss off the name: POSY. Fresh water stands in a cup at the foot of the grave.`,
    gm: `The taproot goes down through the grave. Emeric still brings water every night. The grave words are a handout. If the truth of Posy's death is spoken aloud here (see the final scene), the Rose may stop fighting.`,
    label: [70, 9],
  });
  b.prop('open-grave', 70, 10).prop('tomb-niche', 70, 8).prop('offering-bowl', 71, 10).props_('thorn-bush', [[66, 6], [74, 8], [68, 13], [64, 11], [75, 15]]).props_('brambles', [[67, 3], [72, 4], [63, 16], [70, 17], [74, 20]]).props_('flowers', [[69, 6], [72, 12], [66, 10]]).prop('fountain', 74, 4).props_('pillar-broken', [[65, 5], [67, 7]]).prop('column-fallen', 65, 8).prop('broken-furniture', 64, 7).prop('tree-dead', 76, 11).prop('stairs-down', 73, 21).prop('statue-tall-robed', 63, 13);
  b.light(70, 9, 15, 25, '#e0607a').light(65, 6, 5, 10, GREEN).light(74, 16, 5, 10, GREEN);
  b.area('Overgrown stair', [[72, 21, 4, 2]], {
    read: `Old stone steps climb into a wall of briars. Someone has hacked a narrow way through, again and again, the cut stems already growing back.`,
    gm: `Emeric's own path to the grave. Pushing through is difficult ground and every creature takes 3 (1d6) piercing damage from thorns unless it moves at half speed. A DC 14 Survival finds the gardener's footprints going up, alone, night after night.`,
    label: [73, 22],
  });
  b.encounter("The mother rose", [62, 1, 17, 20], [['motherRose', 1], ['shamblingMound', 2]], 'high');

  // ================= the cascade: hot water from the grotto runs down the whole west side to the canal =================
  b.water(5, 12, 2, 61);
  b.area('The Cascade', [[3, 23, 6, 22]], {
    read: `A warm stream tumbles down the west side of the garden in a stair of little falls, steaming in the night air. Ferns crowd its banks and stone frogs spit water into it.`,
    gm: `The springs' overflow, running from the grotto to the Grand Canal. Wading is easy (it is waist-deep and blood-warm). Three plank bridges cross it. Climbing up the cascade into the grotto mouth is a DC 12 Athletics check, a back way the guards forget.`,
    label: [5, 33],
  });
  for (const y of [40, 56, 69]) b.floor(5, y, 2, 2, 'wood-planks').prop('bridge-plank', 5, y, 90);
  b.props_('rapids', [[5, 26], [6, 48], [5, 63]]).props_('ferns', [[3, 30], [8, 36], [2, 52], [8, 60]]).props_('reeds', [[4, 44], [7, 24]]).props_('statue', [[3, 38], [8, 28]]).prop('tree-willow', 2, 34).prop('tree-birch', 1, 60).prop('flowers', 2, 64).prop('bench', 1, 47);

  // ================= upper terrace (y 23-44): hothouse, mirror canal, summerhouse, cottage, compost =================
  b.building('The hothouse', 9, 27, 16, 11, {
    mat: 'stone-flagstone',
    read: `The heat hits you at the door, wet and heavy with the smell of crushed green stems. Rows of seedling roses grow under the glass, hundreds of them, and the leaves of the nearest ones curl away from your lantern. Copper pipes knock and hiss along the walls.`,
    gm: `Where Emeric bred the Midsummer Roses from cuttings of the mother. The pipes carry spring water from the grotto. Labels on every tray say only "M." and a number. An empty tray marked "M. 1 (red)" held the heir's rose (DC 12 Investigation). The older stock has woken: trees and fungus that move when backs are turned, and two great snakes nesting in the warm pipes.`,
    doors: [[12, 27, 'n', 'closed'], [24, 32, 'e', 'closed', 'door-double'], [16, 37, 's', 'closed']],
    windows: [[9, 29, 'w'], [9, 32, 'w'], [9, 35, 'w'], [14, 27, 'n'], [18, 27, 'n'], [21, 27, 'n'], [12, 37, 's'], [20, 37, 's'], [24, 29, 'e'], [24, 35, 'e']],
  });
  b.props_('crop-rows', [[11, 29], [11, 33], [17, 29], [17, 33], [21, 30]]).props_('tree-palm', [[10, 36], [23, 28]]).prop('fountain', 16, 32).props_('pottery', [[22, 36], [13, 36]]).prop('workbench', 20, 34).props_('ferns', [[14, 31], [19, 31]]).prop('steam-vent', 10, 28).prop('cabinet-glass', 23, 34).props_('mushrooms', [[12, 35], [18, 35]]);
  b.light(16, 32, 10, 20, GREEN).light(11, 29, 5, 10, GREEN);
  b.encounter('The hothouse nursery', [9, 27, 16, 11], [['awakenedTree', 3], ['violetFungus', 4], ['giantConstrictorSnake', 2]], 'low');

  b.water(28, 28, 22, 2);
  b.area('The Mirror Canal', [[27, 24, 24, 9]], {
    read: `A long, still pool reflects the stars and a double row of marble statues. At the far end, the rose-red lamps of the summerhouse glow on the water.`,
    gm: `The quiet heart of the upper terrace, where guests stroll to be seen. A DC 13 Perception: the water lilies here have all closed tight, as if something frightened them. From the north end, a hero sees the cellar doors in the hillside behind the summerhouse.`,
    label: [38, 26],
  });
  b.props_('statue-tall-robed', [[29, 26], [35, 26], [41, 26], [47, 26]]).props_('statue-tall-winged', [[29, 31], [47, 31]]).props_('lily-pads', [[31, 28], [39, 29], [45, 28]]).props_('lamp-post', [[27, 30], [50, 30]]).props_('bench', [[33, 31], [43, 31]]).prop('flowers', 38, 31);
  b.light(27, 30, 10, 15, LANTERN).light(50, 30, 10, 15, LANTERN);

  b.building('The summerhouse', 32, 34, 12, 9, {
    mat: 'marble',
    read: `Rose-pink silk hangs from a painted ceiling, and the air smells of candle wax and lilies. A daybed waits under a crystal chandelier, and a tall harp leans in the corner beside a writing desk heaped with letters.`,
    gm: `The Duchess has the heir carried here once he collapses. The harpist is Thrush, the assassin Sir Leopold hired; she offered to play for the dying man, and she means to finish him before the rose does, so her client pays. Her two "footmen" and a page are her crew. She strikes when the heroes leave the heir alone, or when someone starts asking about Sir Leopold. A writing desk holds the Duchess's private papers.`,
    doors: [[37, 42, 's', 'closed', 'door-double'], [38, 42, 's', 'closed', 'door-double'], [37, 34, 'n', 'closed']],
    windows: [[32, 37, 'w'], [32, 40, 'w'], [43, 37, 'e'], [43, 40, 'e'], [34, 34, 'n'], [41, 34, 'n']],
  });
  b.prop('chaise-longue', 36, 37).prop('harpsichord', 33, 35).props_('candle-stand-tall', [[35, 36], [39, 36]]).prop('writing-desk', 42, 35).prop('folding-screen', 41, 39).props_('armchair', [[34, 40], [39, 40]]).prop('rug-round', 37, 39).prop('side-table', 38, 37).prop('washbasin', 42, 41).prop('chandelier-crystal', 37, 38);
  b.light(37, 38, 10, 15, '#ffb0a0');
  b.encounter('Knives at the summerhouse', [32, 34, 12, 9], [['assassin', 1], ['veteran', 2], ['spy', 1]], 'moderate');

  b.building("The gardener's cottage", 50, 23, 12, 9, {
    mat: 'wood-planks',
    read: `A neat, low cottage that smells of earth and lavender. Seed packets hang in rows from the beams. On the mantel stands a little girl's straw hat with a dried rose in the band, and beside it, a cup of fresh water.`,
    gm: `Emeric Greaves lives alone here. His journal (handout) is in the bedroom, under his pillow. In the workroom, the shelf of seed jars swings aside (DC 15 Investigation; Emeric carries the key) onto a stair down to the secret laboratory. The cupboard holds the coat Posy wore the night she died, kept folded and mended.`,
    doors: [[53, 31, 's', 'closed'], [61, 27, 'e', 'closed']],
    windows: [[50, 26, 'w'], [57, 31, 's'], [59, 23, 'n']],
  });
  b.wallRun(55, 23, 9, 'e').door(55, 28, 'e', 'closed').door(55, 23, 'n', 'secret');
  b.prop('bookcase-secret', 55, 24).prop('workbench', 51, 25).prop('herbs-drying', 52, 24).prop('tool-wall', 50, 29).prop('hearth-oven', 54, 30).prop('kitchen-table', 52, 28).props_('chair', [[51, 28], [53, 28]]).prop('bed', 60, 24).prop('nightstand', 59, 24).prop('cupboard', 57, 30).prop('rocking-chair', 58, 27).prop('shelf-jars', 54, 26).prop('trunk', 61, 30);
  b.light(54, 30, 10, 15, LANTERN);

  b.area('The compost pits', [[64, 24, 16, 15]], {
    read: `Steaming heaps of leaf mould and cut stems fill a row of brick pits, warm as bread ovens. The smell is enormous. Something under the nearest heap shifts, and an eye on a stalk rises out of the rot.`,
    gm: `The garden's waste goes here, and two otyughs the Duchess's grandfather bought as "rubbish keepers" still live in the pits. They are fat and sleepy and will let anyone pass who throws them food (the kitchens behind the potting yard have plenty); a DC 13 Animal Handling also works. They have eaten so many cut Midsummer Roses this week that they are irritable. Their pits hold what careless guests dropped over the years.`,
    label: [71, 31],
  });
  b.mud(66, 26, 4, 3).mud(72, 26, 4, 3).mud(66, 32, 4, 3).mud(72, 32, 4, 3).pit(77, 28, 2, 2);
  b.props_('wall-stone-low', [[65, 30], [71, 30], [76, 33]]).props_('bones-mud', [[67, 27], [73, 33]]).props_('debris-wood', [[70, 28], [64, 35]]).prop('log-pile', 78, 36).prop('handcart', 70, 36).props_('rubble-pile', [[75, 25]]).prop('mud-patch', 68, 37);
  b.encounter('The compost heaps', [64, 24, 16, 15], [['otyugh', 2]], 'low');

  b.area('Potting yard', [[64, 39, 16, 6]], {
    read: `Terracotta pots stand in towers. Barrows, rakes and sacks of bone meal line a long bench, and a row of beehives hums sleepily against the warm wall.`,
    gm: `The working heart of the garden. Under-gardeners slip out here to gossip: any of them will say (DC 12 Persuasion, or a coin) that Master Greaves sleeps on the old east terrace some nights, and that "Clover's been odd for weeks, talking to the roses like they answer".`,
    label: [71, 41],
  });
  b.props_('beehive', [[65, 43], [67, 43], [69, 43]]).props_('pottery', [[72, 40], [73, 42]]).prop('workbench', 76, 40).props_('sack', [[78, 42], [77, 43]]).prop('tool-crate', 75, 43).prop('water-barrel', 64, 40).prop('wagon', 70, 39, 90);
  b.light(76, 40, 5, 15, LANTERN);

  b.props_('lamp-post', [[30, 36], [46, 36], [20, 42], [56, 36]]).props_('hedge-long', [[26, 38], [48, 40]]).props_('flowers', [[28, 40], [47, 34], [62, 36]]).props_('tree-oak', [[3, 26], [25, 25]]).prop('signpost', 45, 23).prop('bench', 13, 41);
  b.light(30, 36, 10, 15, LANTERN).light(46, 36, 10, 15, LANTERN);

  // ================= the first retaining wall, with three ways down =================
  b.rock(0, 45, 80, 2).water(5, 45, 2, 2);
  b.floor(21, 45, 3, 2, 'stone-flagstone').prop('stairs-down', 22, 45);
  b.area('West stair', [[21, 45, 3, 2]], { read: `Narrow steps between two clipped yews.`, gm: `A quiet way between the maze and the hothouse. Used by servants and lovers.`, label: [22, 46] });
  b.floor(37, 45, 6, 2, 'stone-flagstone');
  b.area('The Grand Stair', [[37, 45, 6, 2], [37, 66, 6, 2]], {
    read: `Wide marble stairs climb the hill in two great flights, lined with urns of white roses and lit by lanterns on tall poles.`,
    gm: `The main way up and down. Captain Toller posts guards at the top flight after the heir falls: nobody leaves the party without her say. A DC 14 Persuasion or a word from the Duchess gets the heroes through.`,
    label: [39, 46],
  });
  b.props_('stairs-up', [[38, 46], [41, 46], [38, 67], [41, 67]]).props_('urn', [[37, 45], [42, 45], [37, 66], [42, 66]]);
  b.floor(70, 45, 3, 2, 'dirt').prop('stairs-down', 71, 45);
  b.area('Service ramp', [[70, 45, 3, 2]], { read: `A cart ramp of packed earth, rutted by barrows.`, gm: `Servants and supplies come up here from the kitchens by the canal.`, label: [71, 46] });

  // ================= middle terrace (y 47-65): the maze, the party lawn, the tea pavilion and the orchid house =================
  // the topiary maze: a perfect maze of 2x2 cells, with its heart opened up and a few extra gaps for loops
  const MX = 9, MY = 48, MC = 11, MR = 8;
  const open = new Set<string>();
  const key = (a: number, c: number, d: number, e: number) => (a * 100 + c < d * 100 + e ? `${a},${c}-${d},${e}` : `${d},${e}-${a},${c}`);
  const seen = new Set<number>([3 * MC + 5]);
  const stack: [number, number][] = [[5, 3]];
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const next = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][])
      .map(([dx, dy]) => [cx + dx, cy + dy] as [number, number])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < MC && ny < MR && !seen.has(ny * MC + nx));
    if (!next.length) { stack.pop(); continue; }
    const [nx, ny] = next[Math.floor(r() * next.length)];
    seen.add(ny * MC + nx);
    open.add(key(cx, cy, nx, ny));
    stack.push([nx, ny]);
  }
  for (const [a, c, d, e] of [[4, 3, 5, 3], [4, 4, 5, 4], [4, 3, 4, 4], [5, 3, 5, 4], [1, 1, 2, 1], [8, 5, 8, 6], [2, 6, 3, 6], [9, 2, 9, 3], [6, 0, 7, 0]]) open.add(key(a, c, d, e));
  for (let cy = 0; cy < MR; cy++)
    for (let cx = 0; cx < MC; cx++) {
      const x = MX + cx * 2, y = MY + cy * 2;
      if (cx < MC - 1 && !open.has(key(cx, cy, cx + 1, cy))) b.wallRun(x + 1, y, 2, 'e');
      if (cy < MR - 1 && !open.has(key(cx, cy, cx, cy + 1))) b.wallRun(x, y + 1, 2, 's');
    }
  // the maze's outer hedge, with four ways in (north, east, south, west)
  for (let i = 0; i < MC * 2; i++) {
    if (i !== 10 && i !== 11) b.wall(MX + i, MY, 'n');
    if (i !== 4 && i !== 5) b.wall(MX + i, MY + MR * 2 - 1, 's');
  }
  for (let j = 0; j < MR * 2; j++) {
    if (j !== 10 && j !== 11) b.wall(MX, MY + j, 'w');
    if (j !== 6 && j !== 7) b.wall(MX + MC * 2 - 1, MY + j, 'e');
  }
  b.area('The topiary maze', [[MX, MY, MC * 2, MR * 2]], {
    read: `Walls of clipped yew rise twice your height, shaped at every corner into swans, stags and dancing women. Paper lanterns hang at the turnings. Laughter from lost guests drifts over the hedges, and then, somewhere close, the sound of shears.`,
    gm: `A real maze: four ways in and many dead ends. The hedges are the rose's oldest servants after midnight. Once the heir has fallen, the topiary begins to move when no one is looking: a turning that was open is closed, a swan has turned its head. Lost guests wander here (DC 13 Survival to lead them out). Thrush hid a blowpipe and Sir Leopold's letter (handout) under a stone swan in a dead end (DC 15 Investigation): proof she came prepared to kill, and who paid her.`,
    label: [12, 50],
  });
  b.area('Maze heart', [[17, 54, 4, 4]], {
    read: `The paths open onto a round lawn with a marble fountain, where a stone girl holds up a stone rose. Her face has been chipped away.`,
    gm: `The statue was carved of Posy at the Duchess's order after the "accident", then defaced on the Duchess's order a year later when she could not bear to look at it. A DC 14 History or a word from Dame Verity tells this story.`,
    label: [18, 55],
  });
  b.prop('fountain', 19, 56).prop('statue', 18, 55).props_('bench', [[17, 57], [20, 54]]).props_('lantern-hanging', [[11, 49], [25, 51], [13, 61], [27, 59], [21, 49]]).props_('hedge', [[9, 52], [15, 48], [29, 56], [23, 62], [11, 58], [27, 50]]).props_('statue-tall-winged', [[13, 53], [25, 57]]).props_('flowers', [[15, 59], [29, 49]]).prop('gm-secret-door', 29, 62, 0, { gm: true });
  b.light(19, 56, 10, 15, LANTERN).light(11, 49, 5, 10, LANTERN).light(27, 59, 5, 10, LANTERN);
  b.encounter('The hedges close', [9, 48, 22, 16], [['livingTopiary', 6], ['awakenedShrub', 12]], 'low');

  b.area('Lantern Lawn', [[32, 47, 19, 16]], {
    read: `Hundreds of paper lanterns float over a lawn as smooth as green velvet. Musicians play under a striped marquee, footmen glide between tables of sugared fruit, and every guest wears the same white rose pinned over the heart.`,
    gm: `The midsummer party: about eighty of the city's elite. Everyone wears a Midsummer Rose (handout: the invitation) except the heroes, who arrived late, and the servants. Each white rose has a tiny thorn already under the skin. Nothing happens until the heir falls; after that, every hour the guests grow drowsier and more of them sit down in the grass and do not get up (see tips).`,
    label: [41, 54],
  });
  b.props_('table-round', [[34, 50], [38, 52], [46, 50], [44, 56], [36, 58], [48, 59]]).prop('table-feast', 41, 49).prop('tent-bell', 35, 54).prop('harpsichord', 34, 55).props_('lantern-cluster', [[37, 49], [45, 53], [40, 60], [49, 55]]).props_('chair', [[33, 50], [35, 50], [37, 52], [39, 52], [45, 50], [47, 50], [43, 56], [45, 56]]).prop('dining-set', 47, 62).props_('rug-round', [[40, 55]]).props_('banner-pole', [[32, 47], [50, 47]]).props_('flowers', [[33, 61], [50, 61]]).prop('chandelier-wheel', 41, 52);
  b.light(37, 49, 15, 20, LANTERN).light(45, 53, 15, 20, LANTERN).light(40, 60, 15, 20, LANTERN).light(49, 55, 10, 15, LANTERN);

  b.pool(57, 56, 6, 6);
  b.area('Lily pond', [[51, 50, 13, 13]], {
    read: `Water lilies the size of tea trays float on black water, and koi glide underneath like coins dropped in ink.`,
    gm: `Waist-deep. Two little bridges cross to the tea pavilion on its island. A DC 13 Perception at the pond's edge spots a copper pipe running into the pavilion from the north, under the water.`,
    label: [52, 52],
  });
  b.props_('lily-pads', [[53, 52], [61, 60], [55, 61], [62, 53]]).props_('reeds', [[52, 58], [60, 51]]);
  b.floor(50, 56, 4, 1, 'wood-planks').floor(61, 56, 4, 1, 'wood-planks').prop('bridge-plank', 52, 56).prop('bridge-plank', 62, 56);
  b.building('The tea pavilion', 54, 53, 7, 7, {
    mat: 'wood-planks-dark',
    read: `A little lacquered pavilion on an island, its doors open to the pond. Silver kettles steam on a brass stove fed by hot spring water. A cup lies on its side on the rug, and the tea that spilled from it is still warm.`,
    gm: `Where the heir collapses. The kettle water comes by pipe from the grotto and does taste sweet (DC 13 Nature or Medicine: sap), but there is not enough in it to hurt anyone: a red herring that points the heroes toward the springs. The real wound is the red rose pinned over Aurelian's heart: its stem has burrowed under his skin, and green veins spread from it (DC 15 Medicine). Clover, the girl who served the tea, is the obvious suspect.`,
    doors: [[54, 56, 'w', 'open', 'door-double'], [60, 56, 'e', 'open']],
    windows: [[57, 53, 'n'], [57, 59, 's']],
  });
  b.prop('stove', 59, 54).prop('table-round', 57, 56).props_('chair', [[56, 56], [58, 56], [57, 55]]).prop('rug-round', 57, 57).prop('sideboard', 55, 58).prop('chalices', 59, 58).prop('lantern-hanging', 57, 56);
  b.light(57, 56, 10, 15, LANTERN);

  b.building('The Orchid House', 65, 48, 14, 15, {
    mat: 'marble',
    read: `A palace of glass, silver-lit by the moon. Orchids, lilies and ferns fill every bed, and in the middle stands the Duchess's pride: a bower of white roses shaped like a wedding arch, its petals glowing faintly in the dark. Inside the arch, three slender figures stand as still as statues, their faces made of rose petals.`,
    gm: `The display where the Midsummer Roses were cut for the guests. The petal-figures are the rose's daughters, each grown with the face of an eight-year-old girl. They speak in one sweet voice: "You stepped on me. You all stepped on me." The bower itself is a shambling mound. They attack anyone who cuts a rose or threatens the gardener; otherwise they watch, and answer questions in riddles (they know the heir "must go first, because he went first"). Fire makes them flee.`,
    doors: [[65, 56, 'w', 'closed', 'door-double'], [71, 48, 'n', 'closed'], [71, 62, 's', 'closed']],
    windows: [[65, 50, 'w'], [65, 53, 'w'], [65, 59, 'w'], [68, 48, 'n'], [74, 48, 'n'], [77, 48, 'n'], [78, 51, 'e'], [78, 54, 'e'], [78, 57, 'e'], [78, 60, 'e'], [67, 62, 's'], [75, 62, 's']],
  });
  b.props_('flowers', [[67, 50], [76, 50], [67, 60], [76, 60], [72, 51]]).props_('ferns', [[66, 54], [77, 56]]).props_('tree-palm', [[67, 57], [76, 53]]).prop('archway-grand', 71, 55).prop('fountain-grand', 71, 58).props_('plinth-display', [[69, 52], [74, 52]]).props_('bench', [[68, 61], [74, 61]]).props_('crop-rows', [[73, 56], [68, 55]]).prop('mushrooms', 77, 61);
  b.light(71, 55, 15, 20, GREEN).light(67, 50, 5, 10, GREEN).light(76, 60, 5, 10, GREEN);
  b.encounter('Thorns in the Orchid House', [65, 48, 14, 15], [['roseDaughter', 4], ['shamblingMound', 1], ['violetFungus', 4]], 'low');

  b.props_('lamp-post', [[31, 64], [52, 64], [63, 47]]).props_('hedge-long', [[31, 50], [63, 64]]).props_('flowers', [[8, 47], [31, 59]]).prop('tree-birch', 8, 64);
  b.light(31, 64, 10, 15, LANTERN).light(52, 64, 10, 15, LANTERN);

  // ================= the second retaining wall =================
  b.rock(0, 66, 80, 2).water(5, 66, 2, 2).floor(37, 66, 6, 2, 'stone-flagstone');
  b.floor(13, 66, 2, 2, 'stone-flagstone').prop('stairs-down', 13, 66);
  b.area('Yew steps', [[13, 66, 2, 2]], { read: `Mossy steps squeeze between two yews shaped like sleeping dogs.`, gm: `From the maze's south gate down to the Fountain Walk.`, label: [14, 67] });
  b.floor(70, 66, 3, 2, 'dirt').prop('stairs-down', 71, 66);
  b.area('Kitchen ramp', [[70, 66, 3, 2]], { read: `Barrow ruts and spilled flour.`, gm: `The service way from the canal to the kitchens and the potting yard.`, label: [71, 67] });

  // ================= lower terrace (y 68-79): fountain walk, the Grand Canal, the landing =================
  b.area('Fountain Walk', [[8, 68, 62, 4]], {
    read: `A broad gravel walk runs the length of the garden above the canal. Fountains leap in the lantern light, and statues of the Duchess's ancestors watch the guests come and go.`,
    gm: `Late guests and gossiping servants linger here. If the heroes return to the lower terrace after the heir falls, they find guests asleep on the benches, roses blooming fat on their chests.`,
    label: [30, 69],
  });
  b.paint(8, 68, 62, 4, 'sand');
  b.props_('fountain', [[20, 69], [56, 69]]).props_('statue-tall-knight', [[12, 68], [28, 68], [48, 68], [64, 68]]).props_('lamp-post', [[16, 71], [33, 71], [46, 71], [62, 71]]).props_('bench', [[24, 70], [52, 70]]).props_('flowers', [[10, 70], [67, 70]]);
  b.light(16, 71, 10, 15, LANTERN).light(33, 71, 10, 15, LANTERN).light(46, 71, 10, 15, LANTERN).light(62, 71, 10, 15, LANTERN);

  b.water(0, 72, 80, 3).water(0, 73, 80, 1, true);
  b.floor(37, 72, 6, 3, 'wood-planks').floor(70, 72, 3, 3, 'wood-planks');
  b.area('The Grand Canal', [[0, 72, 80, 3]], {
    read: `Black water, swans asleep with their heads under their wings, and gondolas tied up under lanterns. The garden's reflection trembles on it, upside down.`,
    gm: `The canal runs across the whole foot of the garden. The middle is deep (swim with a DC 10 Athletics). The Swan Bridge crosses at the Grand Stair, a plain plank bridge by the kitchens.`,
    label: [20, 73],
  });
  b.props_('bridge-plank', [[39, 73], [71, 73]], 90).props_('rowboat', [[31, 73], [47, 73]]).prop('canoe', 60, 73).props_('mooring-post', [[34, 72], [44, 72]]).prop('lily-pads', 12, 72).prop('reeds', 2, 74);

  b.area('Swan Gate landing', [[30, 75, 21, 5]], {
    read: `Your gondola bumps against white stone steps. Above you, the Seethe climbs the dark hill in terrace after terrace of light: lanterns, glasshouses glowing like jewel boxes, and steam rising from the top like the breath of something asleep.`,
    gm: `The heroes arrive here, late. A steward checks their invitation and offers them a white rose from a basket; there are none left ("Master Greaves cut exactly enough"), which is lucky for them. Gondoliers wait here all night.`,
    label: [40, 77],
  });
  b.paint(30, 75, 21, 5, 'stone-flagstone');
  b.prop('gate-iron-tall', 40, 75).props_('statue', [[34, 76], [46, 76]]).props_('lamp-post', [[32, 75], [48, 75]]).prop('dock-pier', 38, 75).prop('flowers', 43, 77).props_('urn', [[36, 78], [44, 78]]);
  b.start(38, 76, 3, 3);
  b.light(32, 75, 10, 15, LANTERN).light(48, 75, 10, 15, LANTERN);

  b.building('The boathouse', 56, 75, 11, 5, {
    mat: 'wood-planks-dark',
    read: `Gondolas hang from the rafters of a long, damp shed. Oars, cushions and coils of rope crowd the walls.`,
    gm: `The gondoliers' shed. Thrush came in by boat with the musicians and stashed her escape bag under the floor of the last slip (DC 15 Investigation): a change of clothes, 40 gp, a forged pass out of the city and a list of the musicians' names with hers crossed out. Anyone who finds it knows the harpist is not what she seems, and can catch Thrush off guard.`,
    doors: [[60, 75, 'n', 'open', 'door-double'], [61, 75, 'n', 'open', 'door-double'], [56, 77, 'w', 'closed']],
    windows: [[63, 79, 's']],
  });
  b.props_('rowboat', [[58, 77], [62, 77]]).prop('rope-coil', 65, 76).prop('crate-stack', 65, 78).props_('barrel', [[57, 76]]).prop('fishing-gear', 64, 76).prop('trapdoor', 66, 78, 0, { gm: true });
  b.light(60, 77, 5, 15, LANTERN);

  b.area('Carriage court', [[1, 75, 27, 5]], {
    read: `Gilded carriages stand in a row while their drivers play dice by a brazier. Horses doze in the warm air.`,
    gm: `Guests who came by road leave their carriages here. Sir Leopold's coach is packed for a long journey (DC 12 Investigation): he planned to be out of the city by dawn. The drivers saw a woman with a harp case go up the West stair early in the evening, alone.`,
    label: [12, 77],
  });
  b.paint(1, 75, 27, 5, 'stone-cobble');
  b.props_('wagon', [[4, 76], [10, 76], [16, 76]], 90).props_('hitching-post', [[22, 75], [22, 78]]).prop('horse-trough', 25, 77).prop('brazier', 19, 78).prop('table-cards', 20, 77).props_('hay-bale', [[2, 79], [26, 79]]);
  b.light(19, 78, 10, 15, '#ff9a3c');

  b.area('Service gate', [[70, 68, 10, 4]], {
    read: `A plain gate in the garden wall, piled with crates of lemons and ice packed in straw.`,
    gm: `Deliveries for the party. The kitchen staff here gossip freely (DC 10 Persuasion): Clover carried a single red rose up the Grand Stair at dusk "like it was made of glass".`,
    label: [74, 69],
  });
  b.props_('produce-crates', [[72, 69], [76, 70]]).prop('crate-pile', 78, 68).prop('handcart', 74, 71).prop('fence-gate', 79, 70, 90);

  // scattered dressing so the open ground never feels empty
  for (let i = 0; i < 14; i++) {
    const x = 2 + Math.floor(r() * 76), y = 23 + Math.floor(r() * 22);
    if (b.isFloor(x, y) && b.cellAt(x, y) === 1 && !(x >= 9 && x <= 24 && y >= 27 && y <= 37) && !(x >= 32 && x <= 61 && y >= 23 && y <= 42)) b.prop(r() < 0.5 ? 'flowers' : 'bush', x, y);
  }
  b.note(70, 9, `The mother rose: Mother Rose stat block. She cannot leave the terrace (her roots hold her), but her thorns burst up anywhere on its soil. Minus 30 hit points if the warren's taproot was cut. If the truth is confessed at the grave, she does not fight.`);
  b.note(37, 38, `Thrush attacks when the heir is left alone with her, or when Sir Leopold is named. She flees by the cascade if reduced below half.`);
  return b.build();
}

export const POISONED_GARDEN: Adventure = {
  id: 'poisoned-garden',
  title: 'The Poisoned Garden',
  tagline: 'At the Duchess\'s midsummer garden party her heir falls poisoned, and every guest is wearing the same white rose.',
  levels: '8',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['mystery', 'botanical horror', 'intrigue', 'outdoors', 'can be talked out'],
  pitch:
    'Every midsummer, the Duchess of Halvarre throws open the Seethe: her terraced pleasure garden on a hill of hot springs, where the steam keeps orchids blooming all year and the city\'s elite go to whisper, flirt and plot. Tonight the heroes have an invitation. There will be music, lanterns, sugared fruit, and a white rose for every guest, bred for the occasion by the famous head gardener. Then, a little after the ninth bell, the Duchess\'s heir sets down his teacup and falls over, and the Duchess turns to the only strangers in her garden and says: "Find who did this. You have until dawn."',
  secret:
    'Twelve years ago, at another midsummer party, fifteen-year-old Aurelian Arbrevaux raced a pony-trap along the east terrace for a bet and ran down Posy Greaves, the head gardener\'s eight-year-old daughter, who was picking wild roses. The Duchess hushed it up, paid the gardener, closed the terrace and let him bury the girl there, under her favourite rose. Emeric Greaves never stopped grieving. A brilliant alchemist, he fed that rose with spring water, his own blood and a decade of secret grafting, trying to keep something of his daughter alive. He succeeded. The mother rose has roots through the whole hill now, and something of Posy in it: a child\'s voice, and a child\'s pure, simple hatred of the people who trampled her. When the Duchess asked Emeric for a rose for every guest this midsummer, the Rose asked him for one more, a red one, for Aurelian. Emeric gave it, telling himself he did not know why. The red rose\'s thorn is growing toward the heir\'s heart and will reach it at dawn. And all eighty white roses are her cuttings too: once the heir dies, she means to take the rest. Meanwhile, by bad luck, an assassin hired by the heir\'s cousin is at the party as well.',
  hooks: [
    'The heroes are guests: a grateful noble, a patron or a past adventure earned them an invitation (handout). They arrive late, and so are the only people at the party not wearing a rose.',
    'Dame Verity Gallowglass, an old poison collector who once hired the heroes, writes: "Something is wrong with the Seethe this year. The roses look at me. Come as my guests."',
    'Captain Brannagh Toller of the ducal guard has heard a whisper that someone has been paid to kill at the party. She hires the heroes quietly to mingle and watch. She is right about the assassin, and wrong about everything else.',
  ],
  tips: [
    'The clock: the heir falls at the ninth bell, the rose reaches his heart at dawn (about eight hours). Every two hours, raise the stakes: guests doze off in the grass; the topiary moves; the roses on sleeping guests bloom fat and red; at the fourth bell before dawn the guests\' roses start putting out roots. Graft-bane from the laboratory buys the heir until noon.',
    'Run it as a mystery first. The obvious suspects are Clover (who served the tea), Sir Leopold (who wants the title and hired an assassin), Thrush (the assassin) and Dame Verity (who carries poison). None of them did it. The clues all point back to the roses: the thorn, the red tray in the hothouse, the gardener\'s journal.',
    'The heart of the story is the truth about Posy. Emeric can be turned (show him what the rose is doing to Clover: DC 15 Persuasion, or DC 10 with his journal in hand). The Duchess can be made to confess (DC 16 Persuasion, or DC 12 with the coroner\'s note from her desk). A confession at the grave can end the final fight without a blow.',
    'Many fights can be avoided: feed the otyughs, burn a path through the hedges, leave the vats alone, back away from the bower with a bow. The summerhouse fight with Thrush is the one most groups will want to have.',
    'Four ways onto the Forsaken Terrace: the overgrown stair from the compost pits (the obvious one), the drainage cut from the cellar, the lab\'s back door, and the warren\'s roots from the grotto. Cutting the taproot in the warren first makes the final fight easier.',
    'Play the rose as a child, never as a monster: sweet, sulky, utterly certain she is right. "He stepped on me. You all stepped on me. Now I step on you."',
  ],
  npcs: [
    {
      id: 'pf_pgdhonorine', name: 'Duchess Honorine Arbrevaux', title: 'Duchess of Halvarre, mistress of the Seethe', kind: 'npc', art: 'queen', monsterId: 'noble', shared: true,
      wants: 'Her son alive, the culprit hanged by dawn, and the night\'s scandal kept out of the broadsheets.', knows: 'The truth about Posy Greaves, which she has kept buried for twelve years. She does not connect it to tonight, because she will not let herself.',
      voice: 'Cool, clipped and very polite. Calls everyone "my dear". Her hands shake only when she thinks no one is looking.', appearance: 'A tall woman in silver-green silk, grey hair piled high and pinned with emerald roses. She wears no Midsummer Rose: "roses make me sneeze, my dear".',
      gmNotes: 'Proud but not cruel. If confronted with the coroner\'s note or Emeric\'s journal (DC 12 Persuasion; DC 16 without proof), she breaks and admits the truth, and will say it again at the grave if the heroes ask. She pays the heroes generously either way.',
    },
    {
      id: 'pf_pgdaurelian', name: 'Lord Aurelian Arbrevaux', title: 'the heir, poisoned', kind: 'npc', art: 'prince', monsterId: 'noble', shared: true,
      wants: 'To live. And, though he has never said it, to be forgiven for something.', knows: 'That he killed a little girl twelve years ago, and that his mother made it go away. He was drunk; he remembers the roses in her hands.',
      voice: 'Charming, lazy, a little too loud; in his fever, whispering, "I didn\'t see her, I didn\'t see her."', appearance: 'A handsome man of twenty-seven in a cream silk coat, now grey-faced, with a deep red rose over his heart and green veins spreading out from it under the skin.',
      gmNotes: 'Unconscious most of the night. A DC 15 Medicine check or any healing magic wakes him for a minute: he mumbles about the girl on the terrace. Lesser restoration or graft-bane slows the rose; nothing cures him except dealing with the mother rose. If he is carried to the grave and confesses himself, the Rose stops fighting at once.',
    },
    {
      id: 'pf_pgdemeric', name: 'Emeric Greaves', title: 'head gardener of the Seethe', kind: 'npc', art: 'alchemist', monsterId: 'druid', shared: true,
      wants: 'To keep what is left of his daughter. Under that, for someone to finally say out loud what happened to her.', knows: 'Everything: the grafting, the mother rose, what the red rose was for, and that the Rose withers if her taproot is cut or her anger is eased. He also knows the cure for the guests (destroy or calm the mother) and hates himself for knowing it.',
      voice: 'Soft, precise, a scholar\'s voice. Talks about roses as "she" without noticing. Goes very quiet when a guest laughs too loudly.', appearance: 'A thin man of sixty with earth under his nails, a gardener\'s apron over a fine old coat, and a girl\'s faded ribbon tied round his wrist.',
      backstory: 'A celebrated herbalist and alchemist who came to the Seethe as a young man and made it famous. His wife died young; Posy was all he had.',
      gmNotes: 'Not a villain, but complicit. He lies smoothly at first (DC 15 Insight to catch it). Turned (DC 15 Persuasion, DC 10 if the heroes show him Clover\'s eyes or his own journal), he leads them to the grave and speaks to the Rose for them. Accused or attacked, he flees by the overgrown stair and fights at the Rose\'s side (add him to the final fight; it stays high). If he survives and is forgiven, he gives the heroes his staff of the woodlands.',
    },
    {
      id: 'pf_pgdclover', name: 'Clover Tamsett', title: 'under-gardener, the obvious suspect', kind: 'npc', art: 'farmer', monsterId: 'commoner', shared: true,
      wants: 'To go home. To stop hearing the singing.', knows: 'That the roses talk to her, in a little girl\'s voice, and that the voice told her which rose to pin on the heir. She thinks she is going mad.',
      voice: 'Frightened and very polite, with a country accent. Stops mid-sentence to listen to something no one else can hear.', appearance: 'A freckled young woman of eighteen in a green apron, gold flecks in her brown eyes, and tiny pale rootlets in her hair that she keeps brushing away.',
      gmNotes: 'Innocent. Spore-touched from weeks in the hothouse: DC 13 Insight shows she is not lying; DC 15 Medicine finds green pollen in her breath and the gold flecks in her eyes. Captain Toller wants to hang her at dawn. The Rose can speak through her once, in the final hours, to bargain with the heroes. She recovers when the Rose is gone.',
    },
    {
      id: 'pf_pgdleopold', name: 'Sir Leopold Haverick', title: 'the Duchess\'s nephew, next in line', kind: 'npc', art: 'knight', monsterId: 'knight', shared: true,
      wants: 'The coronet. Failing that, to not be caught.', knows: 'That he hired an assassin called Thrush, and told her "not at the party". He is now terrified that she disobeyed him, and has no idea who she is in her disguise.',
      voice: 'Bluff and hearty, slaps backs, laughs at his own jokes. When frightened, he gets very formal.', appearance: 'A broad, ruddy man of forty with a waxed moustache, a duelling scar and a white rose in his buttonhole that he keeps touching as if it itches.',
      gmNotes: 'Guilty of conspiracy, not of this. A DC 14 Insight shows his shock at the poisoning is real but his grief is not. With his letter (hidden in the maze) or a DC 16 Intimidation, he confesses everything and begs the heroes to stop Thrush before she "makes it look like me". Captain Toller will gladly arrest him instead of Clover.',
    },
    {
      id: 'pf_pgdthrush', name: 'Thrush', title: 'the harpist, an assassin', kind: 'npc', art: 'bard', monsterId: 'assassin',
      wants: 'Her fee. The heir is dying anyway; if she finishes the job and lets the gardener girl hang for it, she gets paid.', knows: 'That someone else got to the heir first, and that it was not poison she recognises. She saw the gardener walking up the east steps alone at dusk, talking to someone who was not there.',
      voice: 'Low, kind and unhurried, a nurse\'s voice. Hums while she thinks.', appearance: 'A small woman in a musician\'s grey gown, hair in a neat crown of braids, with long clever fingers and a harp almost as tall as she is.',
      gmNotes: 'A professional. She offered to play for the dying heir and waits at his bedside. If she is caught out before the fight (her escape bag in the boathouse, the letter in the maze, a DC 17 Insight, Leopold\'s confession), she bargains: Leopold\'s name and what she saw of the gardener, for a boat and a head start. She flees by the cascade below half her hit points.',
    },
    {
      id: 'pf_pgdbrannagh', name: 'Captain Brannagh Toller', title: 'captain of the ducal guard', kind: 'npc', art: 'guard-captain', monsterId: 'veteran', shared: true,
      wants: 'Somebody in chains before the Duchess asks her a second time.', knows: 'Who came in and out of the garden tonight (a list, if asked), and that a hired killer was rumoured to be at the party.',
      voice: 'Gravel and short sentences. Ends every order with "Now."', appearance: 'A big, grey-cropped woman in green-lacquered armour, with a rose she refused to wear stuffed in her belt pouch.',
      gmNotes: 'An obstacle who can become an ally. She arrests Clover at once and plans to hang her at dawn. A DC 14 Persuasion (or real evidence) gets the heroes until dawn and the run of the garden; with Leopold\'s letter she happily arrests him instead. In a fight she stands with the heroes.',
    },
    {
      id: 'pf_pgdverity', name: 'Dame Verity Gallowglass', title: 'dowager, collector of poisons', kind: 'npc', art: 'noble', monsterId: 'noble', shared: true,
      wants: 'Gossip, a good puzzle, and to see the Duchess squirm.', knows: 'The old scandal: a gardener\'s child died on the east terrace at a party twelve years ago, the terrace was closed the next day, and nobody was ever named. She also knows every poison in the city, and that this is none of them.',
      voice: 'Cheerful and ghoulish, with a cane she points like a pistol. "Oh, how marvellous. Nightshade? No, no. Something alive."', appearance: 'A tiny, ancient woman in black lace and a great many rings, one of which opens to show a pinch of grey powder.',
      gmNotes: 'Red herring and best ally. Her poison ring and her open delight in the poisoning make her look guilty (Captain Toller suspects her second). Treat her as the heroes\' encyclopedia: with a DC 13 Persuasion she tells them the Posy story and suggests they "ask the gardener where his daughter is buried".',
    },
    {
      id: 'pf_pgdposy', name: 'The Rose', title: 'the mother rose, what is left of Posy Greaves', kind: 'monster', art: 'treant', monsterId: 'motherRose',
      wants: 'For the people who trampled her to know what it feels like. For her papa to stay.', knows: 'Everything her roots touch: every guest wearing her flowers, every word said in the garden. Not that she is dead; she thinks she has simply grown.',
      voice: 'A little girl\'s voice from a hundred blossoms at once, sweet and sulky. "You\'re treading on me."', appearance: 'A briar the size of a house that stands up out of a child\'s grave: braided stems for limbs, thorns as long as daggers, and at its heart a single white rose that never closes.',
      gmNotes: 'Mother Rose stat block; she cannot leave the Forsaken Terrace, but she can strike anyone standing on its soil. Fire does double harm to her and stops her regrowing. Minus 30 hit points if her taproot in the warren was cut. If the truth of Posy\'s death is confessed at the grave by the Duchess or Aurelian, and Emeric or a hero speaks kindly to her (DC 14 Persuasion; no roll if Emeric does it), she stops fighting and lets her roots go: only her two mindless guardians fight on. When she dies or lets go, every Midsummer Rose in the garden withers within the hour.',
    },
  ],
  handouts: [
    { id: 'invitation', title: 'An invitation, edged in green', text: 'Her Grace the Duchess of Halvarre\nrequests the pleasure of your company\nat MIDSUMMER IN THE SEETHE\nfrom sunset until dawn.\n\nEach guest will receive a Midsummer Rose, bred for the occasion by our Master Gardener, Emeric Greaves.\nWear it until sunrise, for luck.' },
    { id: 'leopold-letter', title: 'A letter under a stone swan', text: 'T.\nThe other half when the Seethe has a new heir. Make it look like a fever or a fall. NOT AT THE PARTY. I will be seen there all night and I will not have it laid at my door.\nBurn this.\nL.H.' },
    { id: 'journal', title: "From Emeric Greaves's journal", text: 'Year eleven. She turned toward me today when I said her name. Not the sun. Me.\n\nThe Duchess wants a rose for every guest this midsummer. Eighty cuttings. She will have them.\n\nPosy wants one more. A red one. "For the boy who drove the cart." I asked her what she meant to do. She only hummed.\n\nI cut it this morning. God forgive me, I cut it.' },
    { id: 'lab-notes', title: 'Notes on the laboratory lectern', text: 'GRAFT-BANE: crushed rue, copper salt from the east spring, three drops of the mother\'s sap. Slows a grafted bloom. Does not stop it.\n\nEvery cutting is still her. Only through the mother can the children be unmade: cut her taproot and she weakens; cut her down and they all wither.\n\nOr ease her. She is angry, not wicked. She wants it SAID.' },
    { id: 'coroner', title: "A coroner's note in the Duchess's desk", text: 'Midsummer night. Posy Greaves, aged eight, daughter of the head gardener. Trampled by a pony-trap on the east terrace. Driver: Lord A. (aged 15), in drink.\n\nBy order of Her Grace: no inquest. Father compensated. East terrace closed. This record not to be filed.' },
  ],
  chapters: [
    {
      id: 'midsummer', title: 'Midsummer in the Seethe', level: 8,
      summary: 'One night in the Duchess\'s terraced pleasure garden. The heir falls poisoned at the party, and the heroes have until dawn to find out why. Suspects, an assassin and a buried scandal lead them through the glasshouses and the gardener\'s secrets to the abandoned terrace where a dead girl\'s rose is waiting.',
      goal: 'Find out who poisoned the heir, stop the assassin, and deal with the mother rose before dawn, when the heir dies and every guest\'s rose takes root.',
      map: seetheGardens,
      npcs: [
        { npc: 'pf_pgdhonorine', x: 43, y: 52 },
        { npc: 'pf_pgdaurelian', x: 57, y: 57 },
        { npc: 'pf_pgdclover', x: 59, y: 55 },
        { npc: 'pf_pgdleopold', x: 36, y: 60 },
        { npc: 'pf_pgdverity', x: 47, y: 57 },
        { npc: 'pf_pgdbrannagh', x: 40, y: 47 },
        { npc: 'pf_pgdthrush', x: 34, y: 36 },
        { npc: 'pf_pgdemeric', x: 52, y: 26 },
        { npc: 'pf_pgdposy', x: 70, y: 10, hidden: true },
      ],
      scenes: [
        {
          room: 'Swan Gate landing', title: 'Midsummer in the Seethe',
          read: 'Your gondola slides out of the dark and bumps against white stone steps. Above you the garden climbs the hill in terrace after terrace of lanterns and glowing glass, and steam drifts off the top of it like breath. Music floats down to the water, and a steward in green bows and says, "You are late. I am afraid the roses are all gone."',
          gm: 'Set the mood: beauty, wealth, a little decadence. The steward explains the Midsummer Roses; none are left, which keeps the heroes safe. Let them walk up the Grand Stair past the Fountain Walk. If they ask, the steward points out the Duchess, Sir Leopold and Dame Verity on the lawn.',
          handout: 'invitation',
        },
        {
          room: 'Lantern Lawn', title: 'The party on the lawn',
          read: 'Hundreds of paper lanterns float above a lawn like green velvet. Every guest wears the same white rose over the heart, and as you pass, you could swear the flowers turn, very slightly, to follow you.',
          gm: 'Let the heroes mingle for twenty minutes of play. Dame Verity flirts with poison talk. Sir Leopold drinks too much and argues loudly with Aurelian about money (DC 12 Perception: he says "you won\'t have it long"). The harpist under the marquee (Thrush) plays beautifully; DC 17 Insight notices she watches the heir, not her strings. Aurelian, wearing a red rose, laughs too loudly and heads to the tea pavilion. Then a scream from the island.',
        },
        {
          room: 'The tea pavilion', title: 'The heir falls',
          read: 'Lord Aurelian lies on the pavilion rug among broken china, eyes open, breathing in tiny gasps. A gardener girl in a green apron backs away with her hands over her mouth. Over his heart, the red rose has opened wide, and its stem is not pinned to his coat anymore. It is pinned into him.',
          gm: 'The Duchess arrives and gives the heroes until dawn. Captain Toller arrests Clover. Clues: the tea tastes sweet (DC 13 Nature: plant sap, harmless in this amount: it came by pipe from the grotto); the rose stem has burrowed under the skin and green veins spread toward the heart (DC 15 Medicine: alive and growing, about eight hours until it reaches the heart; it cannot be cut out without killing him). Clover is not lying (DC 13 Insight) and says "the rose told me which one was his". The Duchess has Aurelian carried to the summerhouse.',
        },
        {
          room: 'The summerhouse', title: 'The harpist at the bedside', encounter: 'Knives at the summerhouse', handout: 'coroner',
          read: 'Candles burn low around the daybed. The Duchess holds her son\'s hand, and in the corner the harpist from the lawn plays something slow and sweet. "Her Grace asked for music," she says, without looking up. "It helps them, at the end."',
          gm: 'Thrush waits for a moment alone with the heir: if the heroes leave him with only her, she strikes; if they name Sir Leopold near her, she strikes at once, with her crew (two veterans in footmen\'s livery and a spy as a page). Caught out early, she bargains (see Thrush). The Duchess\'s writing desk holds the coroner\'s note (DC 13 Investigation, or the Duchess gives it up once confronted). Graft-bane or lesser restoration slows the rose here.',
          treasure: 'Thrush\'s kit: a cloak of elvenkind, three vials of poison, 250 gp in a purse, and a harp worth 100 gp with a garrotte wire hidden in its strings.',
        },
        {
          room: 'The Orchid House', title: 'Rose-daughters', encounter: 'Thorns in the Orchid House',
          read: 'In the glowing bower of white roses stand three slender figures, as still as statues, with faces made of petals. As you come closer, every face turns to you at once, and they are all the same face: a little girl\'s. "You\'re not wearing me," they say together. "Why aren\'t you wearing me?"',
          gm: 'The rose daughters and the bower (shambling mound) only fight if someone cuts a rose, threatens the gardener or attacks. They answer questions as a sulky child would: "He stepped on me first, so he goes first." "Papa grew me back." A DC 14 Nature check spots that the bower\'s roots run up the hill toward the east terrace. Fire makes the daughters flee.',
          treasure: 'On the gardener\'s hook by the north door: a wand of web he uses to train climbing vines.',
        },
        {
          room: 'The topiary maze', title: 'The hedges close', encounter: 'The hedges close', optional: true, handout: 'leopold-letter',
          read: 'A turning you walked through a minute ago is gone, filled with clipped yew. Ahead, a topiary stag that was facing away is now facing you. You hear the sound of shears, very close, and then the hedges lean in.',
          gm: 'After midnight the topiary is the Rose\'s. Run this if the heroes cut through the maze or go looking for lost guests. Fire or a DC 15 Survival to find the way at speed lets them escape instead. Thrush\'s blowpipe and Sir Leopold\'s letter are hidden under a stone swan in a dead end (DC 15 Investigation): proof she came to kill, and who paid her.',
          treasure: 'A lost guest\'s dropped purse (60 gp) and a diamond earring (100 gp). Rescued guests press another 50 gp on the heroes.',
        },
        {
          room: 'The hothouse', title: 'The nursery', encounter: 'The hothouse nursery',
          read: 'Hundreds of seedling roses grow in trays under steaming glass, and every one of them turns its leaves away from your light. At the end of the bench is an empty tray with a label in neat brown ink: "M. 1 (red)".',
          gm: 'The proof that the roses came from one source and that one was bred for the heir. The pipes carry spring water from the grotto. The old stock is awake: awakened trees, violet fungus and two constrictor snakes in the warm pipes. Burning the trays (a minute\'s work) draws the Rose\'s attention: the hothouse fight starts at once, but she loses 10 hit points for the final fight.',
          treasure: 'In the seed cabinet: a bag of beans, and two potions of superior healing Emeric keeps for burns.',
        },
        {
          room: "The gardener's cottage", title: 'The gardener at home', handout: 'journal',
          read: 'Emeric Greaves sits at his kitchen table with his hands wrapped round a cup of tea he has not touched. A child\'s straw hat hangs on the wall behind him, a dried rose in its band. "I wondered who would come," he says. "I hoped it would not be the Captain."',
          gm: 'Emeric lies first (DC 15 Insight). His journal is under his pillow. The seed-jar shelf hides the stair to his secret laboratory (DC 15 Investigation). Turned (DC 15 Persuasion, DC 10 with the journal or after seeing Clover\'s eyes), he tells the whole truth and offers to lead them to the grave. Accused, he slips away up the overgrown stair to the Rose.',
          treasure: 'Emeric\'s savings, 120 gp, in a tea tin. If he is turned, he gives the heroes the last three doses of graft-bane from the lab.',
        },
        {
          room: 'The secret laboratory', title: 'The laboratory', encounter: 'Failed experiments', handout: 'lab-notes',
          read: 'Roses in jars turn to follow your lamp. Vats of murky green liquid line the wall, and in one of them something presses against the glass, slow and shapeless, as if it heard you come in.',
          gm: 'The oozes in the vats are Emeric\'s failures. They only come out if a vat is opened or broken (DC 13 Dexterity check to search the shelves without knocking one). The lab notes explain the cure: cut the taproot, kill the mother or ease her anger. Graft-bane slows one victim\'s rose for six hours. A secret door west leads to the drainage cut and the root cellar.',
          treasure: 'Three doses of graft-bane, two potions of greater healing, an elixir of health (it clears Clover\'s spores, not the heir\'s rose), and Emeric\'s alchemist\'s supplies (50 gp).',
        },
        {
          room: 'The Steaming Grotto', title: 'The springs are angry', encounter: 'Scalding springs', optional: true,
          read: 'Steam rolls over milky pools, and pale roots as thick as your arm dangle into every one of them, drinking. The water heaves. A shape rises out of the biggest pool, all boiling foam and fury, and the steam around you begins to laugh.',
          gm: 'The water spirits of the springs are furious that the roots are drinking them dry. If the heroes cut or burn the roots dangling into the pools (a minute\'s work, or 20 fire damage), the elementals calm at once and sink back. Otherwise they lash out at anyone near the water. The grotto tunnel leads east to the root warren.',
          treasure: 'At the bottom of the east pool, generations of lucky coins: 400 gp in old silver, and a cap of water breathing someone lost long ago.',
        },
        {
          room: 'The root warren', title: 'Under the terraces', encounter: 'The grafted dark',
          read: 'The cellar wall has burst inward, and beyond it the hill is full of roots, a forest upside down. They pulse, slow and steady. Something shaped like an old stump opens one yellow eye.',
          gm: 'The taproot runs through here. Cutting it (AC 15, 60 hit points, vulnerable to fire) costs the Rose 30 hit points in the final fight; the warren\'s guardians fight to stop it. A DC 15 Survival shows the way east along the drainage cut to the Forsaken Terrace, past the lab\'s secret back door (DC 16 Perception).',
          treasure: 'The bones of a groundskeeper who went missing last spring: boots of elvenkind and a pouch of 60 gp.',
        },
        {
          room: 'The Forsaken Terrace', title: 'The mother rose', encounter: 'The mother rose',
          read: 'Thousands of roses turn toward you at once. Over a child\'s grave, a briar the size of a house unfolds itself and stands, thorns as long as swords, and from every blossom on the terrace a little girl\'s voice says: "You\'re treading on me."',
          gm: 'The climax. There are two ways to win. Fight: the Rose (Mother Rose stat block, minus 10 for burned trays and 30 for a cut taproot) and two shambling mounds; if Emeric sided with her, he fights too. Or talk: if the Duchess or Aurelian confesses the truth here, and Emeric or a hero speaks kindly to her (DC 14 Persuasion, no roll for Emeric), the Rose lets go and only the mindless mounds fight. Either way, when she dies or lets go, every Midsummer Rose in the garden withers within the hour and the heir wakes at dawn.',
          treasure: 'The Duchess\'s reward: 750 gp each and a ring of protection for whoever saved her son. If Emeric lives and is forgiven, his staff of the woodlands. Dame Verity gives the heroes a periapt of proof against poison, "because you\'ve earned a dull life for a while".',
        },
      ],
      wrapUp: 'At dawn the roses on eighty sleeping guests turn brown and drop off, and the heir opens his eyes. What happens next depends on what was said: a confession in the garden, an arrest on the stair, or a gardener weeping over a grave. The heroes have seen the worst-kept secret of the city\'s best house, and they are owed a great deal by everyone in it.',
    },
  ],
  ending:
    'Success: the heir lives, Thrush is caught or fled, and the Rose is dead or at peace. If the truth was spoken, the Duchess reopens the east terrace as Posy\'s Garden, Aurelian tends it himself, and Emeric lives out his days there; if not, the Duchess buries the scandal again and Emeric hangs or vanishes. Sir Leopold is exiled if the letter was found. Failure: at dawn the heir dies, the guests\' roses take root, and by noon the Seethe is a garden of eighty sleeping statues wrapped in thorns, growing up the hill toward the city. What next: the heroes have powerful friends (or enemies) at court; Thrush\'s guild wants its fee from someone; and the springs under the Seethe run down to the city\'s bathhouses, where a few white petals have started to appear on the water.',
};
