// The Tiger Masquerade: glamour, paranoia and a demon in a borrowed face, for four heroes of level 13.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

/** The hedge maze east of the palace: a real maze of 4 x 8 cells, 3 squares each, with a fountain clearing. */
function hedgeMaze(b: MapBuilder) {
  const X0 = 63, Y0 = 7, CS = 3, MW = 4, MH = 8;
  const r = rng(4417);
  const seen = new Set<number>([0]);
  const open = new Set<string>();
  const stack: [number, number][] = [[0, 0]];
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < MW && y < MH && !seen.has(y * MW + x));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nb[Math.floor(r() * nb.length)];
    open.add(dx === 1 ? `${cx},${cy},e` : dx === -1 ? `${nx},${ny},e` : dy === 1 ? `${cx},${cy},s` : `${nx},${ny},s`);
    seen.add(ny * MW + nx);
    stack.push([nx, ny]);
  }
  // a few extra gaps, so lovers and spies can lose each other in loops
  for (let i = 0; i < 4; i++) open.add(`${Math.floor(r() * (MW - 1))},${Math.floor(r() * (MH - 1))},${r() < 0.5 ? 'e' : 's'}`);
  const clearing = (cx: number, cy: number) => cx >= 1 && cx <= 2 && cy >= 3 && cy <= 4;
  for (let cy = 0; cy < MH; cy++)
    for (let cx = 0; cx < MW; cx++) {
      if (cx < MW - 1 && !open.has(`${cx},${cy},e`) && !(clearing(cx, cy) && clearing(cx + 1, cy))) b.wallRun(X0 + cx * CS + CS - 1, Y0 + cy * CS, CS, 'e');
      if (cy < MH - 1 && !open.has(`${cx},${cy},s`) && !(clearing(cx, cy) && clearing(cx, cy + 1))) b.wallRun(X0 + cx * CS, Y0 + cy * CS + CS - 1, CS, 's');
    }
  // the outer hedge, with a gate on the west path, one on the terrace and one into the fountain court
  for (let cx = 0; cx < MW; cx++) {
    if (cx !== 3) b.wallRun(X0 + cx * CS, Y0, CS, 'n');
    if (cx !== 1) b.wallRun(X0 + cx * CS, Y0 + MH * CS - 1, CS, 's');
  }
  for (let cy = 0; cy < MH; cy++) {
    if (cy !== 1 && cy !== 5) b.wallRun(X0, Y0 + cy * CS, CS, 'w');
    b.wallRun(X0 + MW * CS - 1, Y0 + cy * CS, CS, 'e');
  }
  // dressing in the corners of the cells
  const bits = ['hedge', 'bush', 'flowers', 'statue', 'bench', 'hedge-long', 'lantern-standing', 'statue-tall-winged', 'thorn-bush'];
  for (let cy = 0; cy < MH; cy++)
    for (let cx = 0; cx < MW; cx++) {
      if (clearing(cx, cy) || r() > 0.6) continue;
      const corner = Math.floor(r() * 4);
      const px = X0 + cx * CS + (corner % 2) * 2, py = Y0 + cy * CS + (corner > 1 ? 2 : 0);
      const kind = bits[Math.floor(r() * bits.length)];
      b.prop(kind, px, py, Math.floor(r() * 4) * 90);
    }
  b.prop('fountain', 69, 19).props_('bench', [[67, 17], [71, 21]]).props_('statue-tall-winged', [[66, 22], [72, 16]]).prop('flowers', 68, 21);
  b.light(69, 19, 10, 20, '#bfe3ff').light(64, 9, 5, 10).light(73, 28, 5, 10);
}

function isolaVascarra() {
  const b = new MapBuilder('adv-tiger-masquerade', 'Isola Vascarra on the Night of the Masquerade', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });

  // ----- the lagoon, and the island in it -----
  b.water(0, 0, 80, 80, true);
  b.pool(40, 40, 39, 39);
  b.floor(4, 4, 72, 70, 'grass');
  b.pool(76, 5, 3, 3).pool(77, 74, 4, 3).pool(4, 27, 1.5, 3);
  b.area('The Lagoon', [[0, 74, 80, 6]], {
    read: 'Black water stretches away to the lights of the city, a mile off. Gondolas slide across it in a long glittering line, every one carrying a lantern shaped like a beast.',
    gm: 'Deep water all round the island. Swimming more than a few hundred feet is a DC 15 Athletics check per 10 minutes. The lagoon is the long way round to the sea mouth of the grottoes (west of the cliffs) and to the Hydra Pool sluice.',
    label: [40, 77],
  });
  b.props_('rowboat', [[2, 60], [30, 76], [78, 40]]).props_('canoe', [[1, 30], [78, 66]]).props_('lily-pads', [[2, 48], [77, 50]]).prop('mooring-post', 3, 34);

  // ----- the sea terrace along the north wall -----
  b.paint(4, 4, 72, 2, 'stone-flagstone');
  b.area('Sea Terrace', [[4, 4, 72, 2]], {
    read: 'A promenade runs along the sea wall under the palace\'s north face, lit by lamps on iron posts. Couples lean on the balustrade to whisper. High above, the copper dome of the observatory glows like a second moon.',
    gm: 'A quiet way between the west lawn and the hedge garden that avoids the ballroom. An iron service ladder climbs from here to the Rooftop Observatory (DC 15 Athletics in a gown or armour; no check otherwise). After the eleventh bell, two vrocks perch on the dome and see anyone on this terrace.',
    label: [40, 4],
  });
  b.props_('lamp-post', [[8, 5], [20, 5], [32, 5], [52, 5], [64, 5], [74, 5]]).props_('bench', [[14, 4], [38, 4], [58, 4]]).props_('wall-stone-low', [[26, 4], [47, 4], [70, 4]]).prop('telescope', 44, 4);
  for (const x of [8, 20, 32, 52, 64, 74]) b.light(x, 5, 10, 15);

  // ----- the west lawn: quay, forecourt, boathouse, gondoliers -----
  b.water(4, 34, 4, 11);
  b.floor(1, 36, 7, 1, 'wood-planks').floor(1, 42, 7, 1, 'wood-planks');
  b.floor(8, 33, 4, 13, 'stone-cobble');
  b.area('Arrival Quay', [[4, 33, 8, 13]], {
    read: 'Your gondola slides into a basin of still water lit by a hundred floating candles. Footmen in tiger-striped livery hand guests up the steps, and every guest, without exception, wears the face of a beast: owls, foxes, herons, moths, a bear with ruby eyes.',
    gm: 'The heroes arrive at the eighth bell. Captain Mirela Sauvanne meets them as if they were ordinary guests and walks them up to the Hall of Masks, talking quietly. Anyone who arrives without a mask is politely sent to the Hall of Masks to be fitted. A footman (a doppelganger of the Baker\'s Dozen) reads the surface thoughts of anyone he helps from a boat: DC 15 Insight notices he holds a hand a moment too long.',
    label: [9, 39],
  });
  b.start(8, 38, 3, 3);
  b.props_('dock-pier', [[2, 36], [2, 42]]).props_('mooring-post', [[7, 36], [7, 42]]).prop('rowboat', 5, 39).prop('gangplank', 6, 36).props_('lamp-post', [[8, 33], [11, 45]]).prop('signpost', 11, 34).prop('crate-pile', 10, 44).prop('rope-coil', 8, 45);
  b.light(8, 33, 10, 20).light(11, 45, 10, 20).light(5, 39, 5, 15, '#ffd27a');

  b.paint(12, 26, 8, 20, 'stone-cobble');
  b.area('Forecourt of the Tiger', [[12, 26, 8, 20]], {
    read: 'A great court of pale stone stretches up to the palace doors. In its centre a bronze tiger the size of a horse rears out of a fountain, water pouring from its jaws. Lanterns hang from striped poles, and music drifts out through the open doors.',
    gm: 'Guests mingle here before going in. The bronze tiger is the House of Vascarra\'s sign. Gossip (DC 13 Persuasion while mingling) turns up: "Lady Ilaria has been so sweet since her boating accident", "the Countess of Ferrow came with a coffin in her luggage", "Madame Orpiment never loses at cards".',
  });
  b.prop('fountain-grand', 16, 35).props_('statue', [[13, 27], [19, 27], [13, 44], [19, 44]]).props_('lamp-post', [[12, 31], [12, 40], [19, 31], [19, 40]]).props_('bench', [[14, 30], [14, 41]]).props_('flowers', [[18, 29], [18, 42]]).prop('banner-pole', 17, 27).prop('handcart', 13, 37);
  b.light(16, 35, 15, 20, '#ffd27a').light(12, 31, 10, 15).light(19, 40, 10, 15);

  b.building('Boathouse', 5, 15, 9, 9, {
    mat: 'wood-planks',
    read: 'A long shed over the water, smelling of tar and wet rope. Gondolas painted gold and black bob in the slip. One has been dragged up onto the boards and covered with a sail.',
    gm: 'Under the sail lies the true majordomo, Corbel Gauge, three weeks dead and packed in salt (DC 12 Medicine: drowned, then kept). The thing running the household tonight wears his face. Mirela found his signet ring in the lagoon, which is why she hired the heroes. The slip opens to the lagoon through a water gate.',
    doors: [[13, 19, 'e'], [9, 23, 's'], [5, 18, 'w', 'open', 'door-wood'], [5, 19, 'w', 'open', 'door-wood']],
    windows: [[9, 15, 'n'], [13, 16, 'e']],
  });
  b.water(0, 18, 5, 2).water(6, 17, 3, 4);
  b.props_('rowboat', [[7, 18], [7, 20]]).prop('sails-pile', 11, 21).props_('rope-coil', [[12, 16], [10, 22]]).prop('fishing-gear', 12, 22).prop('workbench', 11, 16).prop('lantern-hook', 10, 18).prop('barrel', 12, 19);
  b.light(10, 18, 5, 10, '#ffd27a');

  b.area("Gondoliers' Lawn", [[4, 6, 16, 8]], {
    read: 'Behind the boathouse, the gondoliers have made a camp of their own: canvas awnings, a cookfire, a jug going round and a game of dice. They wear no masks, and laugh at the guests who do.',
    gm: 'The gondoliers see everything that comes and goes by water. For a round of drinks or 10 gp: Lady Ilaria\'s boat came back alone the night of her "accident", three weeks ago, and she rowed it herself, which she has never done in her life. And the majordomo has started carrying a covered silver cup down to the kitchens every hour.',
  });
  b.props_('tent', [[6, 8], [16, 8]]).prop('lean-to', 11, 7).prop('campfire', 11, 10).props_('stool', [[10, 11], [12, 11]]).prop('barrel-group', 18, 12).prop('rowboat', 5, 12).prop('fishing-net', 14, 12).prop('tree-willow', 19, 7);
  b.light(11, 10, 10, 20, '#ff9a3c');

  b.paint(4, 50, 16, 2, 'stone-cobble');
  b.area('Cypress Walk', [[4, 46, 16, 9]], {
    read: 'Black cypress trees stand in a double row along the cliff top, like guests who arrived early and never left. Below the cliff the lagoon sucks at the rocks. An iron gate in the ground is half hidden by ivy.',
    gm: 'The iron gate (DC 15 Thieves\' Tools, or the majordomo\'s keys) opens on the Smugglers\' Steps, cut in the cliff by the prince\'s grandfather, down to the Smugglers\' Landing in the grottoes. Lovers come here to be alone. Tonight, a fox-masked guest (Jessa Larrow) walks it twice to time the route.',
  });
  b.props_('tree-pine', [[5, 47], [9, 47], [13, 47], [17, 47], [5, 53], [9, 53], [13, 53], [17, 53]]).props_('bench', [[7, 49], [15, 49]]).prop('trapdoor', 10, 54).prop('statue-tall-robed', 19, 50).prop('lamp-post', 4, 51);
  b.light(4, 51, 10, 15);

  b.area('Lantern Lawn', [[6, 24, 6, 9]], {
    read: 'A striped marquee glows on the lawn between the boathouse and the quay, full of iced wine and sugared fruit. Behind it, fireworks wait in racks for midnight, and a boy in a mouse mask guards them with his life.',
    gm: 'Refreshments for guests who want air. The fireworks are set to go off at the twelfth stroke; a hero who lights them early (DC 12 Sleight of Hand to slip past the boy) makes every guest look out to sea for a full minute: a perfect distraction. A guest here tonight, a wine merchant, is looking for his son (he is in the crypt with the Countess).',
  });
  b.prop('tent-bell', 8, 26).prop('table-long', 9, 30).props_('tree-oak', [[7, 32], [11, 24]]).prop('lamp-post', 11, 28).prop('barrel-group', 10, 26).prop('weapon-rack', 6, 30).prop('crate-stack', 7, 29).props_('tree-oak', [[13, 46], [11, 46]]);
  b.light(8, 27, 10, 15, '#ffd27a').light(11, 28, 10, 15);

  // ----- the palace: one block of stone, its rooms carved from it, its walls full of passages -----
  b.rock(20, 6, 42, 49);
  b.rock(4, 55, 43, 19); // the cliffs the grottoes are cut into

  b.room('Hall of Masks', 21, 7, 7, 10, {
    mat: 'wood-planks-dark',
    read: 'Masks cover every wall: hundreds of them, beasts of lacquer and feather and gold leaf, all watching the door. A tiny old mask-maker with pins in her mouth sizes you up and reaches for a hare.',
    gm: 'Every guest is fitted or checked here, and the mask-maker, Old Pruella, keeps a ledger (handout: the mask list). Lady Ilaria never came to be fitted: she sent her own tiger-cub mask, with no maker\'s mark and no strings, "as if it stayed on by itself". It does not need strings. It is her face. DC 14 Investigation on the ledger spots that six servants have had no masks repaired in three weeks, though they used to wear through one a month.',
  });
  b.props_('display-case', [[21, 7], [24, 7], [27, 7]]).props_('mirror', [[21, 11], [27, 11]]).prop('workbench', 24, 12).prop('stool', 24, 13).prop('folding-screen', 22, 15).prop('wardrobe', 27, 15).prop('coat-rack', 21, 14).prop('shelf-jars', 26, 9).prop('candelabra', 23, 9);
  b.light(24, 11, 10, 15, '#ffd27a');

  b.room('Entrance Hall', 21, 20, 7, 19, {
    mat: 'marble',
    read: 'A tall hall of white marble. A grand stair sweeps up between two stone tigers, and a herald in a stag mask announces each guest by the beast they wear, never by name.',
    gm: 'The herald calls the heroes by their masks. Corbel Gauge, the majordomo (a doppelganger), stands at the foot of the stair with a silver tray, greeting each guest by name and reading their thoughts as he does. A DC 18 Insight check notices he answers a question one guest only thought.',
  });
  b.floor(20, 29, 1, 2).door(20, 29, 'w', 'open', 'door-double').door(20, 30, 'w', 'open', 'door-double');
  b.prop('stair-grand', 24, 21).props_('statue', [[22, 23], [26, 23]]).prop('chandelier-tiered', 24, 28).prop('rug-runner', 24, 33).props_('lantern-standing', [[21, 35], [27, 35]]).props_('banner-hanging-tall', [[21, 26], [27, 26]]).prop('coat-rack', 21, 37).prop('side-table', 27, 37);
  b.light(24, 28, 15, 20, '#ffd27a').light(21, 35, 5, 10).light(27, 35, 5, 10);

  b.room('Chapel of the Drowned Saints', 21, 42, 7, 12, {
    mat: 'stone-flagstone',
    read: 'A narrow chapel of sea-green stone. Saints carved with seaweed in their hair look down from the walls, each holding a lantern. The candles have all been snuffed except one.',
    gm: 'The Vascarra family chapel. A stair behind the altar leads down to the crypt, where the Countess of Ferrow has "asked for a cool place to rest". The plaque by the altar tells the Rite of the Tiger Lantern (handout). Ilaria found her summoning book down here, in an ancestor\'s tomb: DC 15 Religion notices fresh brimstone stains on the altar cloth.',
  });
  b.props_('pew', [[22, 45], [26, 45], [22, 47], [26, 47], [22, 49], [26, 49]]).prop('altar-reredos', 24, 52).props_('statue-tall-robed', [[21, 43], [27, 43]]).props_('candle-stand-tall', [[22, 52], [26, 52]]).prop('font', 24, 43).props_('window-stained-tall', [[21, 50], [27, 50]]).prop('prayer-kneeler', 24, 50);
  b.light(24, 52, 5, 15, '#ffd9a0');

  b.room('Rooftop Observatory', 31, 7, 19, 10, {
    mat: 'marble',
    read: 'You step out under the open sky. A great copper dome stands folded back like the petals of a flower, and the stars are very close. In the middle, under a telescope as long as a ship\'s mast, a lantern of gold and black glass waits on a plinth, unlit.',
    gm: 'The roof of the palace, high above the lagoon. The Tiger Lantern is lit at midnight by starlight through the telescope. Only a hand with Vascarra blood in it can lift the lit Lantern (anyone else takes 22 (4d10) radiant damage and drops it). Whoever holds it lit at the twelfth stroke holds the Tiger Chair for ten years. The dome edge is a sheer drop: a creature shoved off falls 80 ft into the lagoon (DC 15 Dexterity save to catch the gutter).',
  });
  b.prop('telescope', 40, 8).prop('lantern-standing', 40, 12).props_('rune-tiles', [[39, 13], [41, 13]]).prop('orrery', 35, 10).prop('astrolabe-stand', 45, 10).prop('globe-great', 33, 14).props_('column-twisted', [[32, 8], [48, 8], [32, 15], [48, 15]]).props_('statue-tall-winged', [[36, 15], [44, 15]]).prop('stair-spiral', 40, 16).prop('map-cabinet', 47, 13).prop('chair-high-back', 37, 12);
  b.light(40, 12, 10, 20, '#fff0b0').light(35, 10, 5, 10, '#bfe3ff').light(45, 10, 5, 10, '#bfe3ff');
  b.floor(45, 6, 1, 1).door(45, 6, 's', 'closed').prop('ladder', 45, 6);

  b.room('Mirrored Gallery', 31, 20, 19, 3, {
    mat: 'marble',
    read: 'A long gallery lined with mirrors in gilt frames, so that a hundred masked faces walk beside you. At the far end, a tall mirror stands veiled in black crepe. An owl-masked woman stands before it with her hand on the veil.',
    gm: 'Magister Ysmay Danthe (owl mask) is trying to unveil the Widow\'s Glass, an old mirror that shows true faces but is cracked. Mending it takes Mending plus a DC 17 Arcana check, or Ysmay\'s help. Mended, anyone looking into it sees the real shape of whoever stands in front of it, including a dragon in a peacock mask, which will cause trouble. Doppelgangers will not walk past it once it is mended.',
  });
  b.props_('magic-mirror', [[32, 20], [37, 20], [43, 20], [48, 20]]).props_('mirror', [[34, 22], [39, 22], [42, 22], [47, 22]]).prop('candelabra-grand', 31, 22).prop('wall-candelabra', 49, 22).prop('folding-screen', 46, 21).prop('chaise-longue', 41, 21);
  b.light(35, 21, 10, 15, '#ffd27a').light(45, 21, 10, 15, '#ffd27a');

  b.room('Grand Ballroom', 31, 24, 19, 15, {
    mat: 'marble',
    read: 'Three crystal chandeliers blaze over a floor of black and white marble, and two hundred beasts dance under them: wolves with herons, bears with doves. On a dais at the far end, a man in a magnificent golden tiger mask laughs louder than the orchestra.',
    gm: 'The heart of the party. Prince Massimo makes his toast at the ninth bell and explains the Rite. "Ilaria" (tiger-cub mask) is always near him, always eating. At the eleventh bell the prince retires to his apartments to be dressed for midnight, and at half past eleven the whole party processes up to the observatory. If the heroes unmask the impostor here, three doppelgangers and the cloaker (draped over a balcony rail as a velvet hanging) cover its escape: the Masks off fight.',
  });
  b.prop('chandelier-great', 40, 31).props_('chandelier-crystal', [[35, 28], [45, 28]]).props_('column-fluted', [[32, 26], [48, 26], [32, 36], [48, 36]]).prop('throne-dais', 40, 25).prop('gallery-balcony', 40, 37).prop('harpsichord', 34, 37).props_('feast-hall-table', [[46, 33], [34, 33]]).props_('banner-hanging-tall', [[37, 24], [43, 24]]).prop('statue', 31, 31).prop('statue', 49, 31);
  b.light(40, 31, 20, 30, '#ffe0a0').light(35, 28, 10, 20, '#ffe0a0').light(45, 28, 10, 20, '#ffe0a0');
  b.encounter('Masks off', [31, 24, 19, 15], [['doppelganger', 3], ['cloaker', 1]], 'low');

  b.room('Kitchens', 31, 42, 11, 12, {
    mat: 'brick-floor',
    read: 'Heat, steam and shouting. Ovens roar along one wall, a whole boar turns on a spit, and cooks run with silver platters held high. Strangely, nobody is tasting anything.',
    gm: 'Five of the cooks and porters are doppelgangers, the core of the Baker\'s Dozen. They cook for "Lady Ilaria", who has eaten like a whole regiment for three weeks (handout: the kitchen orders). The cellar stair in the corner goes down to the grottoes; the majordomo comes and goes on it every bell with a covered silver cup. An otyugh lives in the midden pit and eats the scraps: the doppelgangers throw intruders to it.',
  });
  b.props_('hearth-oven', [[32, 42], [35, 42]]).prop('campfire-spit', 38, 43).prop('pot-rack', 40, 42).props_('kitchen-table', [[34, 46], [38, 46]]).prop('butcher-block', 32, 49).prop('cauldron', 36, 50).prop('bread-rack', 41, 47).prop('flour-sacks', 40, 51).prop('water-barrel', 31, 46).prop('washbasin', 39, 49).prop('sewer-outflow', 40, 53).prop('barrel-group', 31, 52);
  b.light(33, 43, 10, 20, '#ff9a3c').light(38, 43, 10, 15, '#ff9a3c').light(36, 48, 5, 15);
  b.encounter("The Baker's Dozen", [31, 42, 11, 12], [['doppelganger', 5], ['otyugh', 1]], 'low');

  b.room('Wine Cellar', 43, 42, 7, 12, {
    mat: 'stone-flagstone',
    read: 'Cool, dim and quiet. Racks of dusty bottles run off into the dark, and the far end is packed with blocks of lake ice under straw.',
    gm: 'A good place to talk without being overheard: the doppelgangers avoid it because the ice house makes their thoughts sluggish (it doesn\'t, but they believe it). A DC 14 Perception check finds a hidden panel to the servants\' passage behind the third rack.',
  });
  b.floor(42, 47, 1, 1).door(42, 47, 'e', 'closed');
  b.props_('wine-rack', [[43, 43], [45, 43], [47, 43], [43, 47]]).prop('keg-rack', 49, 46).prop('barrel-stack', 48, 49).props_('ice-block', [[44, 52], [46, 52], [48, 52]]).prop('hay-bale', 45, 50).prop('cobweb-corner', 49, 42);
  b.light(46, 47, 5, 10, '#9fd3ff');

  b.room('Tiger Vault', 53, 7, 8, 4, {
    mat: 'marble',
    read: 'Gold glints behind an iron door: chests, coin stacks, a crown on a cushion. Crouched in the middle of it all is a tiger of black iron, larger than a horse, its eyes two lamps of red glass.',
    gm: 'The Vascarra treasury. The Iron Tiger (iron golem) attacks anyone who enters without the prince or the vault key from his writing desk. Saying the House motto ("We do not sleep") stops it for 1 minute (DC 16 History to know it, or the prince tells it). The demon has not come here: it wants the Chair, not the gold.',
  });
  b.props_('treasure-pile', [[54, 8], [59, 8]]).props_('coin-stacks', [[55, 10], [58, 10]]).prop('crown-cushion', 60, 7).prop('strongbox', 53, 10).prop('display-case', 53, 7).prop('gem-bowl', 60, 10).prop('statue', 56, 8);
  b.light(56, 9, 5, 10, '#ff5c5c');
  b.encounter('The Iron Tiger', [53, 7, 8, 4], [['ironGolem', 1]], 'moderate');

  b.room("Prince's Apartments", 53, 12, 8, 5, {
    mat: 'wood-planks-dark',
    read: 'A bedchamber hung with striped silk. A tiger skin lies before the hearth, its glass eyes catching the light, and the golden tiger mask of the House waits on a stand by the bed.',
    gm: 'At the eleventh bell the prince comes here to be dressed for the Rite, with only his valet. Jessa Larrow and a second blade of the Snuffers wait in the wardrobe and behind the curtains. Their contract (handout) is paid with Ilaria\'s seal. The vault key is in the writing desk (DC 15 Thieves\' Tools).',
  });
  b.prop('bed-canopy', 59, 13).prop('wardrobe', 53, 12).prop('vanity', 60, 16).prop('writing-desk', 54, 15).prop('rug-pelt', 57, 15).prop('fireplace', 56, 12).prop('armchair', 55, 14).prop('armor-stand', 60, 12);
  b.light(56, 13, 5, 15, '#ff9a3c');
  b.encounter('The eleventh bell', [53, 12, 8, 5], [['assassin', 2]], 'low');
  b.floor(56, 11, 1, 1).door(56, 11, 'n', 'locked', 'door-iron');

  b.room('Tiger Guard Antechamber', 53, 20, 8, 8, {
    mat: 'marble',
    read: 'Guards in striped half-plate stand stiffly beside a pair of doors carved with tigers. Above them, a painting of six generations of Vascarras, every one in the same golden mask.',
    gm: 'Four of the prince\'s guards (veterans, not hostile). They let no one through without the prince or Captain Sauvanne. A DC 16 Persuasion or Deception check, or a forged pass from the majordomo\'s desk, gets a hero past. One of the guards, the youngest, is in love with Ilaria and noticed she no longer remembers his name.',
  });
  b.props_('armor-stand', [[53, 20], [60, 20]]).prop('weapon-rack', 53, 24).prop('statue-tall-knight', 60, 24).prop('bench', 57, 26).prop('shield-wall', 56, 20).prop('banner-hanging-tall', 58, 22);
  b.light(56, 23, 10, 15, '#ffd27a');

  b.room('Card Room', 53, 29, 8, 10, {
    mat: 'wood-planks-dark',
    read: 'Smoke, candlelight and the soft click of chips. At the big table a peacock, a moth and a heron play for stakes that would buy a city street, and a star sapphire the size of a plum glows in a glass case on the sideboard.',
    gm: 'The Tiger\'s Wager, played once a decade: the winner takes the Tiger\'s Eye sapphire (5,000 gp). Madame Orpiment (peacock) and Countess Vey (moth) are playing. Buy-in 500 gp. Run three hands: each a contested Wisdom (Insight) or Charisma (Deception) check against Orpiment (+8) and Vey (+9). Cheating with magic is noticed by Orpiment on a DC 21 check. Whoever wins two hands takes the Eye, and everybody talks freely across a card table.',
  });
  b.props_('table-cards', [[55, 31], [58, 34]]).props_('chair', [[54, 31], [56, 31], [57, 34], [59, 34]]).prop('display-case', 60, 29).prop('sideboard', 53, 37).prop('chandelier-crystal', 57, 33).prop('armchair', 60, 37).prop('globe-stand', 53, 29).prop('wine-rack', 57, 38);
  b.light(57, 33, 10, 15, '#ffd27a');

  b.room("Servants' Hall", 53, 42, 8, 12, {
    mat: 'wood-planks',
    read: 'Long tables, a board of little brass bells, one for every room, and bunks stacked three high. A half-eaten supper sits on every plate, though nobody is here to eat it.',
    gm: 'The real servants who are left are frightened: friends have been "strange" for weeks. A DC 14 Persuasion check gets a list of the six who changed (cook, two porters, the menagerie keeper, a footman, the majordomo). The bell board rings whenever anyone in the palace pulls a bell: it shows "Lady Ilaria\'s rooms" rang for food eleven times today.',
  });
  b.props_('table-trestle', [[55, 45], [55, 49]]).props_('bench-long', [[57, 45], [57, 49]]).props_('bunk-bed', [[60, 42], [60, 44], [60, 46]]).prop('footlocker', 59, 52).prop('notice-board', 53, 43).prop('fireplace', 53, 51).prop('coat-rack', 60, 52);
  b.light(54, 51, 10, 15, '#ff9a3c');
  b.floor(56, 54, 1, 1).door(56, 54, 'n', 'closed');

  // public ways between the rooms
  b.floor(28, 30, 3, 3);
  for (const y of [30, 31, 32]) b.door(30, y, 'e', 'open', 'door-double');
  b.floor(28, 21, 3, 1).door(30, 21, 'e', 'closed', 'door-double');
  b.floor(35, 23, 2, 1).floor(44, 23, 2, 1);
  for (const x of [35, 36, 44, 45]) b.door(x, 23, 'n', 'open', 'door-double');
  b.floor(40, 17, 1, 3).door(40, 17, 'n', 'closed', 'door-double').door(40, 19, 's', 'open');
  b.floor(50, 33, 3, 2).door(52, 33, 'e', 'closed', 'door-double').door(52, 34, 'e', 'closed', 'door-double');
  b.floor(50, 21, 3, 1).door(52, 21, 'e', 'closed', 'door-double');
  b.floor(56, 17, 1, 3).door(56, 17, 'n', 'closed').door(56, 19, 's', 'closed', 'door-double');
  b.floor(57, 28, 1, 1).door(57, 28, 's', 'closed');
  b.floor(61, 34, 1, 2).door(61, 34, 'e', 'closed', 'door-double').door(61, 35, 'e', 'closed', 'door-double');
  b.floor(36, 39, 1, 3).door(36, 39, 'n', 'closed').door(36, 41, 's', 'closed');
  b.floor(24, 39, 1, 3).door(24, 39, 'n', 'closed').door(24, 41, 's', 'closed', 'door-double');
  b.floor(50, 48, 3, 1).door(52, 48, 'e', 'closed');

  // the servants' ways: two passages down, two across, secret doors into nearly every room
  b.floor(29, 7, 1, 47).floor(51, 7, 1, 47).floor(21, 18, 40, 1).floor(21, 40, 40, 1);
  // where a public way cuts a passage, the passage hides behind panels on both sides
  b.door(29, 29, 's', 'secret').door(29, 33, 'n', 'secret');
  b.door(29, 20, 's', 'secret').door(29, 22, 'n', 'secret');
  b.door(39, 18, 'e', 'secret').door(41, 18, 'w', 'secret');
  b.door(51, 32, 's', 'secret').door(51, 35, 'n', 'secret');
  b.door(51, 20, 's', 'secret').door(51, 22, 'n', 'secret');
  b.door(55, 18, 'e', 'secret').door(57, 18, 'w', 'secret');
  b.door(35, 40, 'e', 'secret').door(37, 40, 'w', 'secret');
  b.door(23, 40, 'e', 'secret').door(25, 40, 'w', 'secret');
  b.door(51, 47, 's', 'secret').door(51, 49, 'n', 'secret');
  // panels into the rooms
  const panel = (x: number, y: number, side: 'n' | 's' | 'e' | 'w') => b.floor(x, y, 1, 1).door(x, y, side, 'secret');
  panel(28, 11, 'w'); panel(30, 12, 'e'); panel(28, 25, 'w'); panel(30, 26, 'e'); panel(28, 48, 'w'); panel(30, 50, 'e');
  panel(50, 10, 'w'); panel(52, 8, 'e'); panel(52, 14, 'e'); panel(50, 27, 'w'); panel(52, 37, 'e'); panel(52, 44, 'e');
  panel(33, 19, 's'); panel(24, 17, 'n'); panel(46, 39, 'n'); panel(46, 41, 's');
  panel(20, 18, 'w'); panel(61, 40, 'e');
  b.area("The Servants' Ways", [[29, 7, 1, 47], [51, 7, 1, 47], [21, 18, 40, 1], [21, 40, 40, 1]], {
    read: 'Behind a hinged panel, a passage barely wide enough for a tray runs off into the dark. Bell wires hum along the ceiling, and through spy-holes you can see the ballroom, glittering, a foot from your nose.',
    gm: 'The palace is laced with servants\' passages: two running north to south, two east to west, with panels into almost every room, the observatory, the vault and out to the lawn and the garden. Finding a panel from the room side takes DC 15 Perception (DC 12 if you watch a servant use it). The Baker\'s Dozen know them all and use them to move unseen. Through the spy-holes a hero can watch any room the passage touches.',
    label: [29, 12],
  });
  b.props_('cobweb-corner', [[29, 8], [51, 52], [21, 40]]).props_('lantern-hook', [[29, 36], [51, 25], [45, 18], [33, 40]]).props_('crate', [[22, 18], [58, 40]]).prop('ladder', 29, 7).prop('stairs-down', 29, 53).prop('skeleton-seated', 51, 7).prop('candles', 26, 18).prop('barrel', 43, 40);
  b.light(29, 36, 3, 6).light(51, 25, 3, 6);

  // the stairs down
  b.floor(24, 54, 1, 3).door(24, 54, 'n', 'closed', 'door-iron').prop('stairs-down', 24, 55);
  b.floor(29, 54, 1, 3).door(29, 54, 'n', 'secret');
  b.floor(33, 54, 1, 10).door(33, 54, 'n', 'closed').prop('stairs-down', 33, 55);

  // ----- the hedge garden -----
  hedgeMaze(b);
  b.area('Hedge Maze', [[63, 7, 12, 24]], {
    read: 'Hedges ten feet high, clipped as sharp as stone walls, swallow the music behind you. Here and there a lantern hangs in the green, and somewhere ahead water splashes and someone laughs and stops laughing.',
    gm: 'A real maze, with loops. At its heart a fountain clearing where guests meet to trade secrets. Getting through without a map: three DC 14 Survival checks; each failure costs a quarter-hour of the night. Countess Vey likes to bring a guest here to "get lost" before taking them down to the crypt.',
    label: [64, 9],
  });
  b.area('Fountain Court', [[62, 31, 14, 24]], {
    read: 'Below the maze the garden opens into terraces of lawn and white gravel, with three fountains singing in the dark. A pavilion of thin white columns glows with lamplight, and from a domed cage of gold wire comes the drowsy murmur of birds.',
    gm: 'The garden doors of the Card Room open here. A good place for private talk: anyone in the court can see who leaves the card room.',
    label: [64, 44],
  });
  b.props_('fountain', [[64, 42], [64, 51], [70, 41]]).props_('flowers', [[62, 38], [66, 46], [74, 41]]).props_('bench', [[63, 45], [66, 52]]).props_('lamp-post', [[62, 32], [62, 54], [75, 31]]).props_('tree-oak', [[75, 43], [62, 48]]).prop('statue-tall-winged', 74, 32).prop('hedge-long', 66, 54);
  b.light(64, 42, 10, 15, '#bfe3ff').light(64, 51, 10, 15, '#bfe3ff').light(62, 32, 10, 15).light(75, 31, 10, 15);
  b.building('Moon Pavilion', 65, 33, 9, 6, {
    mat: 'marble',
    read: 'A round pavilion open to the night on every side, hung with lanterns of coloured paper. A lady in a magnificent peacock mask lounges on a couch here, eating candied figs and holding court over a ring of admirers.',
    gm: 'Madame Orpiment\'s court: she is an adult brass dragon in human shape, and has been coming to Vascarra masquerades for sixty years under five different names. She trades a secret for a secret. She smelled brimstone under "Ilaria\'s" jasmine perfume and thinks it delicious gossip. If anyone reveals her true nature in public or calls her a liar, she leaves in a rage, and if pressed, sheds her shape here.',
    doors: [[65, 35, 'w', 'open'], [73, 36, 'e', 'open'], [69, 38, 's', 'open'], [69, 33, 'n', 'open']],
    windows: [[66, 33, 'n'], [72, 33, 'n'], [66, 38, 's'], [72, 38, 's'], [65, 37, 'w'], [73, 34, 'e']],
  });
  b.prop('chaise-longue', 69, 35).props_('lantern-cluster', [[67, 34], [71, 34]]).prop('table-round', 69, 36).props_('armchair', [[67, 36], [71, 36]]).prop('rug-round', 69, 37);
  b.light(69, 35, 10, 15, '#ffc070');
  b.encounter('Madame Orpiment unveiled', [62, 31, 14, 16], [['adultBrassDragon', 1]], 'low');
  b.building('Aviary', 68, 46, 8, 8, {
    mat: 'grass',
    read: 'A dome of gold wire as tall as a house, full of sleeping birds: parrots, white peacocks, little green finches. They wake in a storm of colour as you open the gate.',
    gm: 'The prince\'s birds. They scream at anything that is not what it seems: a doppelganger or the demon entering makes the whole aviary shriek (the doppelgangers know this and avoid it). A useful test, if the heroes can lure a suspect here.',
    doors: [[68, 49, 'w', 'closed', 'door-iron']],
  });
  b.props_('tree-palm', [[70, 48], [73, 51]]).props_('cage-hanging', [[69, 47], [74, 47], [71, 52]]).prop('water-trough', 72, 49).prop('ferns', 70, 52).prop('flowers', 74, 50);
  b.light(71, 49, 5, 10, '#bfe3ff');
  for (let x = 68; x < 76; x += 2) { b.wall(x, 46, 'n', 'bars'); b.wall(x, 53, 's', 'bars'); }

  // ----- the menagerie -----
  b.paint(47, 55, 14, 9, 'dirt');
  b.area('Menagerie Yard', [[47, 55, 14, 9]], {
    read: 'A yard of packed earth behind the kitchens, full of cages, straw and the musky smell of big animals. Something huge and black leans on the bars of a cage and watches you with clever, angry eyes.',
    gm: 'The prince\'s pride and joy. At the tenth bell the keeper (a doppelganger) puts on a feeding show for the guests: he will open every cage at once if the heroes start asking questions about the household. A giant ape, five tigers and two doppelgangers make the Feeding time fight. DC 16 Animal Handling (or Speak with Animals and a kind word) turns one beast a round: the tigers knew Ilaria from a cub and growl at "her".',
  });
  b.props_('cage', [[48, 56], [51, 56], [54, 56]]).prop('cage', 50, 62).props_('hay-bale', [[58, 56], [59, 61]]).prop('water-trough', 55, 60).prop('butcher-block', 48, 60).prop('handcart', 57, 58).prop('haystack', 60, 55).prop('fence-wood', 52, 63).prop('wagon', 59, 58);
  b.light(54, 59, 10, 15, '#ff9a3c').light(48, 56, 5, 10);

  b.area('Tiger Run', [[63, 55, 13, 9]], {
    read: 'Behind tall bars, a slice of jungle: ferns, a fallen log, a pool. Five tigers pace it, orange in the lamplight, and stop to stare at you all at once.',
    gm: 'The tigers are the House\'s living sign and the prince loves them. Killing one in front of him ruins any chance of being believed. They are calm with the true Ilaria and cower and snarl at the false one: a great test if the heroes can get "her" close to the bars (she makes excuses).',
  });
  b.wallRun(63, 55, 13, 'n', 'bars').wallRun(63, 63, 13, 's', 'bars').wallRun(63, 55, 9, 'w', 'bars').wallRun(75, 55, 9, 'e', 'bars');
  b.door(63, 59, 'w', 'closed', 'door-iron');
  b.props_('ferns', [[65, 57], [72, 61]]).prop('log-fallen', 68, 59).props_('tree-palm', [[74, 56], [64, 62]]).prop('boulder', 71, 57).prop('bones', 66, 61).prop('grass-tall', 73, 59);
  b.pool(70, 61, 2, 1.5);
  b.light(69, 58, 5, 10, '#ffd27a');
  b.encounter('Feeding time', [47, 55, 29, 9], [['giantApe', 1], ['tiger', 5], ['doppelganger', 2]], 'low');

  b.building('Elephant House', 50, 65, 9, 8, {
    mat: 'dirt',
    read: 'A tall barn with doors big enough for a siege engine. Inside, an old elephant in a jewelled headdress sways from foot to foot, humming to herself.',
    gm: 'Old Duchess, the elephant, is gentle and very fond of the heroes if they bring fruit. She will carry a whole party across the menagerie at a run, or batter down a door. The hay loft hides a bundle of stolen servants\' clothes: thirteen uniforms, each one a little too big (DC 13 Investigation).',
    doors: [[54, 65, 'n', 'open', 'door-double'], [58, 69, 'e', 'closed']],
  });
  b.props_('hay-bale', [[51, 66], [57, 71]]).prop('haystack', 51, 71).prop('water-trough', 56, 67).prop('crown-cushion', 53, 70).prop('ladder', 50, 68);
  b.light(54, 68, 5, 10, '#ffd27a');

  b.pool(68, 69, 7, 4, true);
  b.floor(61, 69, 14, 1, 'wood-planks');
  b.area('Hydra Pool', [[60, 65, 16, 9]], {
    read: 'A sunken pool of dark water, its rim lined with statues of sea gods. A wooden walkway crosses it. Guests toss coins over the rail, and five long necks rise slowly out of the water to watch them fall.',
    gm: 'The prince\'s hydra and two giant crocodiles. They stay in the water unless someone falls in or the walkway is broken (AC 15, 30 HP). The old sluice under the cliff connects this side of the menagerie to the Glowing Grotto. Guests\' coins on the bottom: 800 gp, and a ring of swimming one of them threw in a rage.',
  });
  b.props_('bridge-plank', [[64, 69], [71, 69]]).props_('statue', [[61, 66], [75, 66], [61, 72], [75, 72]]).prop('lily-pads', 63, 67).prop('reeds', 73, 71);
  b.light(68, 69, 5, 10, '#9fd3ff');
  b.encounter('The Hydra Pool', [60, 65, 16, 9], [['hydra', 1], ['giantCrocodile', 2]], 'low');

  // ----- under the cliffs: the crypt and the lagoon grottoes -----

  b.room('Chapel Crypt', 18, 57, 12, 6, {
    mat: 'dungeon-slab',
    read: 'Cold air and the smell of old roses. Vascarra ancestors sleep in stone along the walls. In the middle of the crypt stands a coffin of black lacquer that is not theirs, its lid open, and a woman in a moth mask is kneeling over a dazed young man.',
    gm: 'Countess Ondrine Vey brings guests here to feed (the young man is a wine merchant\'s son; he lives if the heroes interrupt). Her two spawn guard the stair. She would rather bargain than fight: for a promise of "a friend in the Tiger Chair" she tells what she knows (she can smell that "Ilaria\'s" blood is not her own). One open tomb, an ancestor\'s, held the summoning book Ilaria used; its pages are torn out.',
  });
  b.props_('sarcophagus-row', [[19, 58], [28, 58]]).props_('tomb-niche', [[18, 61], [29, 61]]).prop('coffin', 24, 59).prop('sarcophagus-open', 21, 61).props_('candle-stand-tall', [[22, 58], [26, 58]]).prop('ossuary-shelf', 27, 62).prop('censer-hanging', 24, 61);
  b.light(24, 59, 5, 10, '#c06aff');
  b.encounter("The Envoy's supper", [18, 57, 12, 6], [['vampire', 1], ['vampireSpawn', 2], ['swarmOfBats', 2]], 'moderate');

  b.cave("Smugglers' Landing", 10, 60, 4.5, 3, {
    seed: 951, mat: 'cave-floor', wobble: 0.1,
    read: 'Damp steps end in a sea cave with an iron ring in the wall and the rotten ribs of a boat. Old crates are stacked by a niche, and the sound of the sea fills everything.',
    gm: 'Where the prince\'s grandfather landed things he did not want taxed. Steps up to the Cypress Walk. A chest in the niche holds three potions of healing (greater) and an old smuggler\'s map of the grottoes (shows the sluice and the sea mouth).',
  });
  b.floor(10, 55, 1, 3, 'cave-floor').prop('stairs-up', 10, 56);
  b.props_('crate-stack', [[7, 59], [13, 61]]).prop('rowboat', 9, 62).prop('chest', 13, 58).prop('mooring-post', 11, 62).prop('lantern-hook', 10, 58);
  b.light(10, 58, 5, 10, '#ffd27a');

  b.cave('Drowned Grotto', 13, 69, 8, 3.8, {
    seed: 952, mat: 'cave-floor', wobble: 0.1,
    read: 'A great cave half full of black seawater. The tide breathes in and out through a mouth to the west, and every breath makes the water slap and gurgle against the stone.',
    gm: 'The sea mouth opens to the lagoon: a boat or a swimmer can come in from outside (DC 13 Athletics against the swell). A collapsed wall links it to the crypt. Deep water in the middle; anyone in it at the full tide (every second bell) is pulled 10 ft toward the mouth each round.',
  });
  b.pool(13, 69, 5, 2.5, true);
  b.water(0, 68, 6, 2);
  b.tunnel([[10, 63], [9, 66]], 1, { seed: 953 });
  b.hall(20, 63, 20, 66);
  b.props_('stalactites', [[7, 67], [17, 71]]).prop('skeleton-lying', 18, 66).prop('rubble-pile', 20, 66).prop('anchor', 8, 71).prop('fishing-net', 15, 72);

  b.cave('Glowing Grotto', 34, 68, 9, 3.8, {
    seed: 954, mat: 'cave-floor', wobble: 0.1,
    read: 'Blue light. The walls of this cave are crusted with glowing crystals, and the water in its channels shines like a lamp. Three great toad-like shapes squat in the shallows, and something with pincers clicks in the dark.',
    gm: 'Gorgomand\'s wardens: three hezrou, demons the shape of swollen toads, and two chuuls that came up through the sluice and were bribed with meat. They guard the Salt Cage. They are lazy and greedy: a feast from the kitchens (the doppelgangers bring one every bell) distracts them for 1 minute.',
  });
  b.tunnel([[22, 69], [26, 68]], 2, { seed: 955 });
  b.water(28, 69, 12, 1).water(43, 69, 5, 1);
  b.props_('cave-crystals', [[28, 66], [40, 66], [30, 71]]).props_('crystal-cluster', [[36, 70], [26, 69]]).props_('glowing-fungus', [[37, 71], [32, 65]]).prop('bones-mud', 42, 68).prop('sewer-outflow', 44, 69);
  b.light(34, 68, 15, 20, '#6ab8ff').light(28, 66, 5, 10, '#6ab8ff').light(40, 66, 5, 10, '#6ab8ff');

  b.cave('Salt Cage', 40, 59, 3.5, 2.5, {
    seed: 956, mat: 'cave-floor', wobble: 0.08,
    read: 'A low cave white with salt. In the middle stands a cage of iron bars crusted with crystals, and inside it a young woman in a torn ball gown is sitting very straight, with a bandage on her arm.',
    gm: 'The real Lady Ilaria Vascarra, kept alive for her blood: each bell the majordomo draws a cup and carries it up, and the demon drinks it to keep her face. The cage lock is DC 18 Thieves\' Tools (the majordomo has the key). She scratched a note on the cage floor (handout). Freed, she is weak (1 HP, poisoned until a long rest) but furious, and she is the one thing that breaks the Rite for the demon.',
  });
  b.hall(40, 60, 40, 66);
  b.prop('cage', 40, 59).props_('chains-hanging', [[38, 58], [41, 60]]).prop('cave-crystals', 43, 59).prop('stool', 38, 60);
  b.light(40, 59, 5, 10, '#e0f0ff');
  b.encounter('Wardens of the salt cage', [24, 56, 21, 17], [['hezrou', 3], ['chuul', 2]], 'moderate');

  b.area('Cellar Stair', [[33, 54, 1, 10]], {
    read: 'Worn steps spiral down from the kitchen, sweating with damp. Halfway down, someone has dropped a silver cup and wiped it up badly. The stain is red.',
    gm: 'The majordomo\'s route to the Salt Cage. A DC 12 Perception check on the stain finds human blood. Watching the stair at any bell catches the Baker going down with an empty cup and up with a full one.',
    label: [33, 58],
  });

  // ----- the midnight climax on the roof -----
  b.encounter('Midnight on the roof', [31, 7, 19, 10], [['nalfeshnee', 1], ['vrock', 2], ['shieldGuardian', 1], ['doppelganger', 3]], 'high');
  b.encounter('The Magister loses patience', [31, 20, 19, 3], [['archmage', 1]], 'low');
  b.note(40, 12, 'The Tiger Lantern. Twelve strokes of midnight = twelve rounds. Whoever of Vascarra blood holds it lit at the twelfth stroke holds the Tiger Chair.');
  b.note(40, 59, 'The real Lady Ilaria. While she lives in the cage, the demon can drink her blood each bell and keep her face.');
  b.note(9, 20, 'The true majordomo\'s body, under the sail.');
  return b.build();
}

export const TIGER_MASQUERADE: Adventure = {
  id: 'tiger-masquerade',
  title: 'The Tiger Masquerade',
  tagline: 'Every guest wears the face of a beast. One of them is wearing a face that is not theirs, and at midnight it takes a seat on the council.',
  levels: '13',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['intrigue', 'high level', 'masquerade', 'demon', 'mystery'],
  pitch:
    'Once every ten years, Prince Massimo Vascarra, the Tiger of the Lagoon, throws open his island palace for one night. Two hundred guests, every one masked as a beast. Music, cards, a menagerie, fountains, a feast that lasts until dawn. At midnight, on the roof, under the stars, the prince lights the Tiger Lantern and his House keeps its chair on the Tidewater Council for another ten years. You have invitations. Someone made sure of it. Wear something you can fight in.',
  secret:
    'Three weeks ago Lady Ilaria Vascarra, the prince\'s sister and heir, tired of watching her careless brother gamble the city\'s business away, read a summoning from an ancestor\'s tomb and made a bargain: "Let me sit in the Tiger Chair." The demon that answered, Gorgomand, a nalfeshnee that hungers to sit in judgement over the living, said yes, and then did exactly what she asked, wearing her. It caged her in the grottoes under the palace and wears her face using a ring she stole as a girl from Magister Ysmay Danthe: the Ring of the Second Face, which gives its wearer the shape of anyone whose blood it drank within the hour. So every bell, the false majordomo carries a cup of Ilaria\'s blood up from the Salt Cage. The Baker\'s Dozen, a gang of doppelgangers Gorgomand hired with promises of a city to feed on, have replaced six servants. At the eleventh bell an assassin of the Snuffers, paid with Ilaria\'s seal, will kill the prince in his rooms. At midnight "Ilaria", the only heir, lights the Lantern (her stolen blood fools it) and the demon takes the Chair. The Tidewater Council is also the city\'s high court. Ten years of Gorgomand\'s sentences would feed it for a century.',
  hooks: [
    'Captain Mirela Sauvanne of the prince\'s guard found the majordomo\'s signet ring in the lagoon, then saw the majordomo wearing it the next morning. She cannot accuse anyone in the household without proof, so she has slipped the heroes invitations as "distant cousins" and asks them to find out who in the palace is not who they seem, before midnight.',
    'Magister Ysmay Danthe, an archmage of the city, had a ring stolen at the last masquerade ten years ago. Her divinations say it will be in the palace tonight, on a hand that should not have it. She hires the heroes as her "escort" for 3,000 gp and the right to keep anything else they find.',
    'The Snuffers, the city\'s guild of assassins, have taken a contract on someone at the masquerade. A rival guild wants it to fail, and pays the heroes 2,000 gp to find the target and keep them alive until dawn.',
  ],
  tips: [
    'Run a bell clock. The heroes arrive at the eighth bell. Each scene or fight takes about a quarter of an hour. Ninth bell: the prince\'s toast. Tenth: the feeding show and the card game. Eleventh: the assassins strike and the demon calls its vrocks. Half past eleven: the procession to the roof. Midnight: the Rite.',
    'Play up the paranoia. Doppelgangers read surface thoughts: if the heroes plot in the open, the Baker\'s Dozen knows. Hand players notes. Let them suspect everyone. The dragon, the vampire and the archmage all have secrets that look exactly like guilt.',
    'Truesight and similar magic shows the dragon in the peacock mask and the doppelgangers, but the ring hides the demon from any magic that reads a creature\'s true form or type while it has fresh blood in it. The mended Widow\'s Glass, the aviary birds and the menagerie tigers are the honest witnesses.',
    'The guests are not set pieces. Each powerful guest can be bargained with, turned or angered. Any of them who ends up an ally can turn up on the roof at midnight and take one enemy (or the shield guardian) out of the fight. Count a guest won over as a fight won.',
    'Freeing the real Ilaria is the key. If she is out of the cage before the next bell, the demon\'s face slips at that bell in front of everyone, and the Lantern burns it at midnight. If the heroes never find her, they must win the roof fight before the twelfth stroke.',
    'For a party of 5 or a level higher, add a third vrock to the roof fight. For a weaker party, leave the shield guardian on the heroes\' side by letting the prince keep his amulet.',
  ],
  npcs: [
    {
      id: 'pf_tgmmassimo', name: 'Prince Massimo Vascarra', title: 'the Tiger of the Lagoon', kind: 'npc', art: 'prince', monsterId: 'noble', shared: true,
      wants: 'A perfect party, a full card table, and to be adored by everyone for one more decade.', knows: 'The Rite of the Lantern, the vault motto ("We do not sleep"), and that his sister has been "lovely lately".',
      voice: 'Big, warm and loud. Laughs at his own jokes before he finishes them. Calls everyone "my dear beast".', appearance: 'A tall, soft-bellied man of fifty in black and gold, wearing a golden tiger mask with emerald eyes and claws on its chin.',
      backstory: 'Inherited the Chair at twenty and has never once read a council paper. He loves his tigers, his parties and his sister, in that order, and has no idea his sister knows it.',
      gmNotes: 'He believes nothing bad about Ilaria without proof he can see: the tigers snarling at her, the Widow\'s Glass, the real Ilaria, or the face slipping. He wears the amulet that commands the shield guardian and hands it to his heir at the start of the Rite.',
    },
    {
      id: 'pf_tgmilaria', name: 'Lady Ilaria Vascarra', title: 'the true heir, caged', kind: 'npc', art: 'princess', monsterId: 'noble',
      wants: 'To get out, to undo what she did, and (though she will not say it) still to sit in the Chair one day.', knows: 'The demon\'s name, the ring and how it works, that it drinks her blood every bell, and that the Lantern only burns for Vascarra blood.',
      voice: 'Clipped, proud, very tired. Never says sorry, but says "I was wrong" once and means it.', appearance: 'A sharp-faced woman of thirty in a ruined silver ball gown, hair full of salt, a bloody bandage on her arm.',
      backstory: 'Clever and ignored, she ran half her brother\'s business from behind his chair for ten years and got no credit. She stole the Magister\'s ring at sixteen on a dare and kept it as a curiosity.',
      gmNotes: 'Freeing her breaks the demon\'s disguise at the next bell. On the roof she can hold the Lantern herself. What the prince does with her afterwards is a good question for the ending.',
    },
    {
      id: 'pf_tgmgorgomand', name: 'Gorgomand', title: 'the Glutton-Judge, wearing Ilaria', kind: 'monster', art: 'nalfeshnee', monsterId: 'nalfeshnee',
      wants: 'The Tiger Chair, and ten years of sentencing a city: every hanging, every debtor\'s cell, every exile is a meal to it.', knows: 'Everything the doppelgangers have read in the guests\' minds tonight. Who the heroes are, if they have been careless.',
      voice: 'As Ilaria: sweet, gracious and always chewing. As itself: a slow, wet, magistrate\'s voice, "the court finds you... delicious".', appearance: 'As Ilaria: a smiling noblewoman in a tiger-cub mask with no strings, a plate always in her hand. As itself: a huge, bloated boar-faced demon with tiny useless wings and the ring sunk in the fat of one finger.',
      gmNotes: 'Nalfeshnee stat block. While it has drunk Ilaria\'s blood within the hour, it looks exactly like her and no magic shows otherwise. Teleports to the Lantern on the roof if exposed. Uses Horror Nimbus on the first round of the climax. Taking the ring (DC 20 Sleight of Hand, or cutting off the finger with a critical hit) ends the disguise for good.',
    },
    {
      id: 'pf_tgmysmay', name: 'Magister Ysmay Danthe', title: 'archmage of the Amber Tower', kind: 'npc', art: 'archmage', monsterId: 'archmage', shared: true,
      wants: 'Her stolen ring back, and the thief humiliated. She does not care about the Chair at all.', knows: 'What the Ring of the Second Face does and that it needs fresh blood every hour. That a fiend is on the island (she felt it arrive three weeks ago). She suspects the dragon.',
      voice: 'Dry and precise, never raises her voice, finishes other people\'s sentences for them.', appearance: 'A small, grey-haired woman in a tall owl mask of real feathers, wearing seven rings on her left hand and an empty space on the right.',
      gmNotes: 'Archmage stat block. If the heroes promise her the ring, she helps mend the Widow\'s Glass and casts one spell for them at midnight. If they insult her or meddle with her mirror, she loses patience (the Gallery fight). If she decides the dragon is the thief, she attacks Madame Orpiment in the ballroom at the tenth bell: two guests at war in the middle of the dancing.',
    },
    {
      id: 'pf_tgmorpiment', name: 'Madame Orpiment', title: 'a peacock with a secret (adult brass dragon)', kind: 'monster', art: 'dragon-brass-adult', monsterId: 'adultBrassDragon',
      wants: 'Gossip, the Tiger\'s Eye sapphire, and to stay the cleverest person at the party.', knows: 'Everyone\'s secrets for sixty years. That "Ilaria" smells of brimstone under her perfume. That the majordomo no longer tips the musicians.',
      voice: 'Lazy, delighted, purring. Calls the heroes "my darlings" and laughs behind her fan.', appearance: 'A tall, golden-skinned woman in a peacock mask and a gown of hammered brass scales, eating candied figs one after another.',
      gmNotes: 'Adult brass dragon stat block. Trades one secret for one secret. Won over (win the Tiger\'s Eye and give it to her, or share a real secret of your own), she comes to the roof and breathes sleep on the vrocks. Exposed in public, she rages, and may shed her human shape in the Moon Pavilion.',
    },
    {
      id: 'pf_tgmondrine', name: 'Countess Ondrine Vey', title: 'envoy of the Lord of Ferrow', kind: 'monster', art: 'vampire', monsterId: 'vampire', shared: true,
      wants: 'A treaty: the city\'s condemned prisoners sold to her master each year. The demon has promised it to her; she would take the same promise from anyone.', knows: 'That "Ilaria\'s" blood smells of salt and someone else. That six servants have no heartbeat she recognises.',
      voice: 'Soft, amused, old-fashioned. Never says no, only "not yet".', appearance: 'A pale young woman in a grey moth mask with feathery antennae, in a gown the colour of a bruise.',
      gmNotes: 'Vampire stat block. Openly a vampire: the city tolerates her master\'s envoys. Feeds on a guest in the crypt around the tenth bell. Would rather sell what she knows than fight. Betrays whichever side looks like losing.',
    },
    {
      id: 'pf_tgmjessa', name: 'Jessa Larrow', title: 'a blade of the Snuffers', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'To finish the contract clean and get paid. And to keep the guild\'s rules, which she believes in.', knows: 'The contract was paid with Ilaria\'s seal, by a man with the majordomo\'s face. The Snuffers\' first rule: the contract is void if the client is false.',
      voice: 'Quiet, polite, slightly bored, like a clerk. Never threatens. Apologises before she stabs.', appearance: 'A slight woman in a russet fox mask and a merchant\'s velvet coat, with very clean gloves.',
      gmNotes: 'Assassin stat block, working with one other blade. If the heroes show her that the client was not really Ilaria (the real Ilaria, or the face slipping), she voids the contract, bows, and tells them where the majordomo keeps the cage key.',
    },
    {
      id: 'pf_tgmmirela', name: 'Captain Mirela Sauvanne', title: 'captain of the Tiger Guard', kind: 'npc', art: 'guard-captain', monsterId: 'knight', shared: true,
      wants: 'The prince alive, the household clean and the truth, in that order.', knows: 'That the majordomo is not the majordomo. Where all the doors are, including the servants\' ways. Who has been acting strangely.',
      voice: 'Low and fast, says everything twice in different words, as if she expects not to be believed.', appearance: 'A broad, scarred woman in a hound mask and striped half-plate, a hand always on her sword.',
      gmNotes: 'Knight stat block. Cannot act against anyone in the household without proof. With proof, she brings four guards and the Tiger Guard to the roof.',
    },
    {
      id: 'pf_tgmcorbel', name: 'Corbel Gauge', title: 'the majordomo (the Baker)', kind: 'monster', art: 'doppelganger', monsterId: 'doppelganger',
      wants: 'A city full of faces to wear when the demon takes the Chair. His Dozen want houses, titles and lives of their own.', knows: 'Every corridor and panel of the palace, the cage key, the blood-cup route, and what every guest he greeted was thinking.',
      voice: 'Smooth, discreet, a tiny pause before every name, as if checking it.', appearance: 'An elegant grey-haired servant with a silver tray and white gloves, wearing the true majordomo\'s face and signet ring.',
      gmNotes: 'Doppelganger stat block. Leader of the Baker\'s Dozen. Carries the cage key and the silver cup. Captured and threatened, he sells out the demon in a heartbeat.',
    },
  ],
  handouts: [
    { id: 'invitation', title: 'The invitation', text: 'The House of Vascarra requests the pleasure of your company at the Tiger Masquerade, on the night of the tenth year, upon the Isola Vascarra.\nEvery guest shall come as a beast.\nNo face shall be bare until the Lantern is lit.\nGondolas from the Lion Steps from the seventh bell.' },
    { id: 'mask-list', title: "Old Pruella's mask ledger (tonight's page)", text: 'His Highness: the Tiger (gold, emeralds, re-gilded).\nLady Ilaria: the Tiger-Cub. DID NOT COME FOR FITTING. Sent her own. No maker\'s mark. No strings!!\nMagister Danthe: the Owl (real feathers, her own).\nMadame Orpiment: the Peacock. Same mask as 1st, 2nd, 3rd... she does not age?\nCountess Vey of Ferrow: the Moth.\nMistress J. Larrow, merchant: the Fox.\nCapt. Sauvanne: the Hound.\nServants: no repairs in three weeks. Odd.' },
    { id: 'lantern-rite', title: 'The plaque in the chapel', text: 'THE RITE OF THE TIGER LANTERN\nAt the first stroke of midnight in the tenth year, the Lantern is lit from the stars.\nIt burns only in a hand of Vascarra blood.\nWho holds it lit at the twelfth stroke holds the Tiger Chair for ten years more.\nWe do not sleep.' },
    { id: 'kitchen-orders', title: 'The kitchen orders for today', text: 'For Lady Ilaria\'s rooms:\nFirst bell: two suckling pigs, a tureen of eels.\nThird bell: the whole swan, a wheel of hard cheese.\nFifth bell: forty quail, a cask of honey.\nSeventh bell: "anything".\nNinth bell: as before, double.\n(For the grotto: the scraps, a barrel of fish, the usual cup.)' },
    { id: 'ilaria-note', title: 'Scratched into the salt on the cage floor', text: 'IT WEARS ME.\nIt eats as me. It takes a cup of my blood each bell.\nThe ring is Danthe\'s. Take the ring, the face goes.\nIf I die it needs Massimo\'s blood instead.\nDon\'t let it touch the Lantern.\n- I.' },
    { id: 'contract', title: 'A Snuffers\' contract slip', text: 'THE SNUFFERS. One lamp to be put out.\nThe lamp: the Tiger.\nThe hour: the eleventh bell, in his rooms.\nPaid: 3,000 gold crowns, in full.\nSealed: the Cub of Vascarra.\nThe Hand does not strike for the false.' },
  ],
  chapters: [
    {
      id: 'masquerade', title: 'One Night on the Isola Vascarra', level: 13,
      summary: 'A glittering masquerade on a palace island: ballroom, mirrored gallery, hedge maze, menagerie, card room, kitchens, vault, crypt, grottoes and a rooftop observatory, all laced together by servants\' secret passages. Somewhere in it, a demon wears the prince\'s sister.',
      goal: 'Find the guest who is not wearing a mask but a face, survive the other guests and stop the demon taking the Tiger Chair at midnight.',
      map: isolaVascarra,
      npcs: [
        { npc: 'pf_tgmmirela', x: 10, y: 37 },
        { npc: 'pf_tgmmassimo', x: 40, y: 26 },
        { npc: 'pf_tgmysmay', x: 47, y: 21 },
        { npc: 'pf_tgmorpiment', x: 69, y: 36, hidden: true },
        { npc: 'pf_tgmondrine', x: 24, y: 60, hidden: true },
        { npc: 'pf_tgmjessa', x: 54, y: 13, hidden: true },
        { npc: 'pf_tgmcorbel', x: 35, y: 46, hidden: true },
        { npc: 'pf_tgmilaria', x: 40, y: 59, hidden: true },
        { npc: 'pf_tgmgorgomand', x: 40, y: 11, hidden: true },
      ],
      scenes: [
        {
          room: 'Arrival Quay', title: 'Arrival by gondola',
          read: 'Lanterns shaped like beasts bob on the black water, and your gondola slides into a basin of floating candles. A woman in a hound mask and striped armour offers you her hand up the steps and does not let go of yours. "Cousins," she says loudly. Then, very quietly: "Not here. Walk with me."',
          gm: 'Captain Mirela walks the heroes to the Hall of Masks and tells them what she knows: the majordomo is not the majordomo, his body may be in the boathouse, and something will happen tonight. Start the bell clock at the eighth bell. The footman who helps them ashore is a doppelganger reading their thoughts: if they think about Mirela\'s warning, the Baker knows by the ninth bell.',
          handout: 'invitation',
        },
        {
          room: 'Hall of Masks', title: 'Choose your beast',
          read: 'Old Pruella circles you with pins in her mouth. "No, no, not a wolf. Everybody wants to be a wolf." She holds up masks one by one, squints, and throws them over her shoulder. "Tonight," she says, "you are what you wear. So wear something honest."',
          gm: 'Let each player pick their hero\'s beast; it is how the herald and every guest will address them all night. Pruella gossips freely while she works. Her ledger is the first real clue: Ilaria sent her own mask with no strings. DC 14 Investigation notices six servants have stopped wearing out their masks. The boathouse body (DC 12 Medicine) confirms a replacement.',
          handout: 'mask-list',
        },
        {
          room: 'Grand Ballroom', title: "The Tiger's welcome",
          read: 'The orchestra stops. A man in a golden tiger mask climbs onto a chair, glass high. "My dear beasts! Ten years ago you drank my cellar dry. Tonight we shall try harder!" Beside him a young woman in a tiger-cub mask laughs, and goes on eating.',
          gm: 'Ninth bell. The prince explains the Rite (give the plaque handout here or in the chapel). Introduce the guests: the owl at the mirror, the peacock heading for the garden, the moth looking at necks, the fox who never dances. "Ilaria" is gracious and asks the heroes, with real interest, what they are thinking about (she is hearing it from the doppelgangers). If the heroes accuse her in public without proof, the prince has them shown out by the guards, and the demon starts the Masks off fight to cover its escape upstairs.',
          handout: 'lantern-rite',
        },
        {
          room: 'Moon Pavilion', title: 'A secret for a secret', optional: true, encounter: 'Madame Orpiment unveiled',
          read: 'The peacock waves away her admirers with one jewelled hand. "Sit, my darlings. I know who you are, of course. The question is whether you know who I am." She offers you a candied fig. "A secret for a secret. You first."',
          gm: 'Each true personal secret a hero tells buys one answer. Her best ones: "Ilaria smells of brimstone under the jasmine", "the majordomo stopped tipping the musicians three weeks ago", "the Countess has been promised the prisoners". Detect magic or truesight shows she is a dragon; saying so in public, or calling her a liar, starts the fight here. Won over, she promises to "be on the roof at midnight, for the view".',
        },
        {
          room: 'Mirrored Gallery', title: "The Widow's Glass", optional: true, encounter: 'The Magister loses patience',
          read: 'The owl turns from the veiled mirror as you approach, and a hundred reflections turn with her. "You are the escort Mirela hired. Good. Then you can hold this." She hands you the edge of the black crepe. "Do not let go until I say. And do not look."',
          gm: 'Ysmay needs help mending the Widow\'s Glass (Mending plus a DC 17 Arcana check, three tries; each failure cracks it further and a hero who looked must make a DC 15 Wisdom save or be frightened of their own reflection for an hour). Mended, it shows any creature\'s true shape, except the demon while it has fresh blood in it. Ysmay tells the heroes about her ring and what it needs: fresh blood every hour. Insult her or break the glass and she loses patience.',
        },
        {
          room: 'Card Room', title: "The Tiger's Wager",
          read: 'Chips clatter. The moth smiles without showing her teeth. The peacock fans herself and says, "Deal them in, Countess. I do so love taking money from heroes." Behind them, in its glass case, the Tiger\'s Eye glows like a cat in the dark.',
          gm: 'Tenth bell. Three hands of the Tiger\'s Wager (contested checks, see the room notes). Across the table both Orpiment and Countess Vey talk: Vey lets slip that she has "an understanding with the future of this House" (DC 16 Insight: she means Ilaria). Win two hands to take the Tiger\'s Eye. The garden doors are a quick way to the Moon Pavilion and the hedge maze.',
          treasure: 'The Tiger\'s Eye, a star sapphire worth 5,000 gp, plus whatever the heroes win at the table (up to 1,500 gp).',
        },
        {
          room: 'Menagerie Yard', title: 'Feeding time', encounter: 'Feeding time',
          read: 'The keeper bows to the crowd, lifts a great ring of keys and smiles straight at you. "Ladies and gentlemen, beasts of every kind: dinner!" Then he turns every key at once.',
          gm: 'If the heroes have asked questions below stairs, the keeper (doppelganger) and one more from the Dozen make this an accident: the giant ape and five tigers loose among the guests. Saving guests matters to the prince. DC 16 Animal Handling turns a beast; the tigers can be turned on the doppelgangers, whom they hate. Afterwards the tigers flatten their ears at "Ilaria" if she comes near. The Hydra Pool is next door: the hydra and crocodiles stay in the water unless someone falls in.',
          treasure: 'On the keeper: a figurine of wondrous power (golden lions) the prince would happily give to whoever saved his tigers.',
        },
        {
          room: 'Kitchens', title: 'Below stairs', encounter: "The Baker's Dozen",
          read: 'The kitchen goes quiet as you come in. Six cooks look up at the same moment, with the same expression, and the boar on the spit keeps turning in the silence.',
          gm: 'The heart of the Baker\'s Dozen. They will try to bluff (they have read the heroes\' minds) and then fight, throwing anyone they can grab into the midden pit with the otyugh. Corbel Gauge, the Baker, may be here with the silver cup (if it is near a bell). Captured, a doppelganger tells everything to save its skin: the cage, the cup, the ring, the eleventh bell. The cellar stair leads to the grottoes.',
          treasure: 'Corbel\'s keys (the cage, the Cypress Walk gate), two potions of healing (supreme) in the larder, and the kitchen orders.',
          handout: 'kitchen-orders',
        },
        {
          room: 'Chapel Crypt', title: "The Envoy's supper", optional: true, encounter: "The Envoy's supper",
          read: 'The moth looks up from the young man\'s throat, and dabs her lips with a lace handkerchief. "How rude," she says, "to come down to a lady\'s rooms without knocking." Behind you, something closes the door.',
          gm: 'Countess Vey prefers a deal: for a promise of the next Chair-holder\'s friendship, she tells what she smells on "Ilaria" and that the girl\'s blood "is being kept somewhere cold and salty". Attack her and she fights with two spawn and bats, then flees as mist to her coffin. Destroying the coffin ends her for good. The collapsed tomb wall leads into the Drowned Grotto.',
          treasure: 'In the coffin\'s lining: a cloak of the bat and a purse of old jewels worth 2,000 gp.',
        },
        {
          room: 'Salt Cage', title: 'The salt cage', encounter: 'Wardens of the salt cage',
          read: 'Blue light from the crystals, white salt on every wall, and in the cage a woman in a ruined silver gown who looks up at you with your hostess\'s face, exactly, except that this one is furious.',
          gm: 'Three hezrou and two chuuls guard the cage. The heroes can come down the kitchen stair, the Smugglers\' Steps, the crypt, the sea mouth or the sluice. A feast from the kitchens distracts the hezrou. The cage lock is DC 18 (Corbel has the key). Ilaria tells everything, scratchily, and wants to come to the roof. Once she is free, the demon\'s face slips at the next bell, in front of whoever it is with.',
          treasure: 'The demon\'s offerings heaped in the grotto: a mantle of spell resistance, 1,200 gp in coins and Ilaria\'s own jewels (1,800 gp, she wants them back).',
          handout: 'ilaria-note',
        },
        {
          room: "Prince's Apartments", title: 'The eleventh bell', encounter: 'The eleventh bell',
          read: 'The prince is halfway into his ceremonial coat, laughing at something his valet said, when the wardrobe door opens very gently. A woman in a fox mask steps out with a knife in each hand and says, quite sincerely, "I am sorry, Your Highness."',
          gm: 'Jessa Larrow and a second Snuffer strike at the eleventh bell. If the heroes are not there, the prince dies unless Mirela was warned. Show Jessa proof that the client was false and she stops at once, voids the contract and hands it over. The Tiger Vault is next door (iron golem; the motto "We do not sleep" stops it). At the same bell, two vrocks land on the observatory dome: anyone on the Sea Terrace or in the garden sees them.',
          treasure: 'On the assassins: a dagger of venom and 600 gp. In the vault, if the prince opens it for his rescuers: a gem of seeing, a rod of rulership he is happy to lend for the night, and 4,000 gp.',
          handout: 'contract',
        },
        {
          room: 'Rooftop Observatory', title: 'Masks off at midnight', encounter: 'Midnight on the roof',
          read: 'The dome stands open. Two hundred masked guests crowd the roof under a sky full of stars, and the telescope swings down to pour a thread of starlight into the Lantern. It catches. The bell begins to toll. "Ilaria" steps forward, smiling, and reaches for it with both hands.',
          gm: 'Twelve strokes, twelve rounds. If the demon is still disguised, it lifts the Lantern; the prince (if alive) hands it his amulet, and the shield guardian guards it. Exposed, it sheds Ilaria\'s shape (Horror Nimbus at once), the vrocks drop from the dome and three of the Dozen draw knives in the crowd. If the real Ilaria is free, the Lantern burns black in the demon\'s hands (22 radiant) and it must kill a Vascarra and use their blood instead. Win by holding the lit Lantern in a true Vascarra hand at the twelfth stroke, or by destroying the demon. Grabbing the amulet (DC 18 Sleight of Hand or Athletics) turns the shield guardian. Guests won over join the fight. If the heroes unmasked it earlier, run Masks off in the ballroom first while it teleports up here to try the Rite by force.',
          treasure: 'The Ring of the Second Face (Ysmay\'s, by right), the demon\'s bloated purse of 3,000 gp in gems, and the Tiger Chair\'s thanks: the prince offers each hero a gift of 2,000 gp and a cloak of displacement from his own wardrobe.',
        },
      ],
      wrapUp: 'At the twelfth stroke the Lantern burns gold in a true Vascarra hand, the demon is dead or banished, and two hundred guests take off their masks at last to cheer, or to scream. By dawn, the whole city knows who saved the House of Vascarra.',
    },
  ],
  ending:
    'Win: the demon is destroyed or driven back to the Abyss, the Baker\'s Dozen are caught or scattered, and a Vascarra keeps the Tiger Chair. Who holds it is the last choice of the night: the careless prince, or his clever, guilty sister. The heroes are honoured guests of the House for life, and Magister Danthe owes them a favour. Lose: "Ilaria" holds the lit Lantern at the twelfth stroke, and the demon sits on the Tidewater Council. Within a month the city\'s courts turn cruel, hangings double, and the heroes are wanted for "attacking the Lady of the Chair". Next: Ilaria\'s summoning came from a book in an ancestor\'s tomb, and its torn-out pages are missing. Someone took them. And one of the Baker\'s Dozen was never caught: it is wearing a face on the Tidewater Council right now.',
};
