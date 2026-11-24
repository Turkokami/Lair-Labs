// The Velbrand Wedding: a three-part gothic horror mini-campaign for four heroes, levels 9 to 11.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// ---------- Part 1: Thornmere House, the night before the wedding ----------
function thornmereHouse() {
  const b = new MapBuilder('adv-vwd-thornmere', 'Thornmere House on the wedding eve', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  const r = rng(6131);

  // the River Lenn along the north edge, with a ragged bank of reeds
  b.water(0, 0, 80, 4, true).water(0, 4, 80, 2, false);
  for (let x = 0; x < 69; x++) if (r() < 0.45) b.water(x, 6, 1, 1);
  b.props_('reeds', [[2, 6], [9, 5], [17, 6], [27, 5], [35, 6], [56, 5], [66, 6]]);

  // ----- the river lawn, the terrace and the boathouse -----
  b.area('The river lawn', [[20, 8, 36, 9]], {
    read: 'Lanterns sway on strings between striped tents, and the tenants of Thornmere eat roast pork at long tables. Out on the river, the mist is so thick the far bank has vanished.',
    gm: 'The tenants\' feast: the village folk of the estate, fed by Lord Calloway before the wedding. A DC 14 Insight shows they are frightened, not festive. Talk here gives rumours (see the scene). A black barge with no lights is moored at the jetty to the east.',
    label: [37, 12],
  });
  b.props_('tent-bell', [[24, 10], [32, 9], [48, 10]]).props_('table-trestle', [[27, 13], [36, 13], [44, 13]]).props_('bench-long', [[27, 14], [36, 14], [44, 14]]);
  b.prop('campfire-spit', 40, 10).prop('barrel-group', 52, 13).prop('keg-rack', 22, 14).props_('lantern-standing', [[30, 15], [42, 15], [53, 10]]);
  b.light(40, 10, 15, 25).light(30, 15, 10, 20).light(42, 15, 10, 20);
  b.paint(28, 17, 24, 5, 'stone-flagstone');
  b.area('The terrace', [[28, 17, 24, 5]], {
    read: 'A broad stone terrace runs along the back of the house, its balustrade lined with urns of white roses. Through the tall ballroom windows you see dancers turning in candlelight.',
    gm: 'A quiet place to talk away from the ball. Seraphine Velbrand likes to stand here and look at the river she cannot cross on her own.',
  });
  b.props_('urn', [[29, 17], [34, 17], [45, 17], [50, 17]]).prop('stair-grand', 39, 17).props_('bench', [[31, 20], [48, 20]]).props_('fire-bowl', [[29, 21], [50, 21]]);
  b.light(29, 21, 10, 15).light(50, 21, 10, 15);

  b.building('The boathouse', 44, 3, 10, 6, {
    mat: 'wood-planks',
    read: 'A dark boathouse with the river lapping inside it. Oars hang on the walls. A rowing boat bumps gently against its moorings.',
    gm: 'Quiet. A DC 15 Perception finds fresh grave dirt trodden into the planks, leading from the jetty to the lawn and on toward the stables.',
    doors: [[48, 8, 's', 'closed'], [49, 8, 's', 'closed'], [47, 3, 'n', 'open', 'door-double'], [48, 3, 'n', 'open', 'door-double']],
    windows: [[44, 6, 'w'], [53, 6, 'e']],
  });
  b.water(46, 3, 4, 3, true);
  b.prop('rowboat', 47, 4).prop('rope-coil', 51, 7).prop('fishing-gear', 45, 7).prop('crate', 52, 4).prop('lantern-hook', 51, 5).light(51, 5, 5, 10);

  // the jetty and the Velbrands' black barge
  b.floor(58, 1, 2, 6, 'wood-planks').floor(60, 0, 13, 4, 'wood-planks-dark');
  b.area('The black barge', [[58, 0, 15, 7]], {
    read: 'A long black barge sits low in the water, heavy with cargo. No lamps, no crew, no sound but the creak of ropes and a soft scratching from below deck.',
    gm: 'The Velbrands\' barge. Under the tarpaulins: twelve long chests of grave earth from Lenford\'s Old Kirk (DC 12 Religion or Nature: graveyard soil, and old). Rats swarm in the hold, shadows cling under the deck, and the drowned boatman, now a wraith, guards the cargo. Tipping the chests into the river ruins them. The barge\'s log names its route: Lenford landing to the Gallowcrag, every week for a year.',
  });
  b.props_('coffin', [[62, 1], [64, 1], [66, 1]]).props_('cargo-crates', [[68, 2], [70, 1]]).prop('ship-mast', 65, 2).prop('cargo-hatch', 61, 2).prop('mooring-post', 58, 6).prop('rope-coil', 59, 3).prop('lantern-hook', 71, 3, 0, { off: true });
  b.encounter('Rats on the black barge', [58, 0, 15, 7], [['wraith', 1], ['swarm-of-rats', 8], ['shadow', 5]], 'low');

  // ----- the willow pond -----
  b.pool(11, 14, 8, 5, true);
  b.floor(10, 13, 3, 2, 'grass');
  b.area('Willow pond', [[2, 8, 19, 13]], {
    read: 'Willows trail their hair in a black pond. On a tiny island stands the statue of a weeping woman, her stone face turned toward the house.',
    gm: 'Margery Calloway put up the statue sixty years ago "for my sister". A DC 13 Investigation finds the name scratched off the base and a date: the night of the last Velbrand wedding. Perrin likes to meet people here, away from the house.',
    label: [6, 10],
  });
  b.props_('tree-willow', [[3, 9], [19, 10], [4, 19], [18, 19]]).prop('statue-tall-robed', 11, 13).props_('lily-pads', [[7, 15], [15, 13]]).prop('rowboat', 14, 17, 40).props_('reeds', [[5, 12], [17, 16]]);

  // ----- the rose garden -----
  b.paint(10, 24, 3, 21, 'dirt').paint(3, 33, 18, 3, 'dirt');
  b.area('Rose garden', [[3, 24, 17, 21]], {
    read: 'Paths of raked earth wind between beds of white roses, every bloom cut for the wedding except one bed of red ones nobody has touched. A sundial stands in the middle, its shadow a black finger in the moonlight.',
    gm: 'The red roses grow on the grave of Margery\'s old dog, who barked at Aurelien sixty years ago and was found dead next morning. Margery will tell this if asked. From here a gate leads south into the hedge maze, and a door into the library.',
    label: [11, 30],
  });
  b.prop('obelisk', 11, 34).props_('flowers', [[5, 26], [8, 27], [14, 26], [17, 28], [5, 38], [15, 39], [7, 42], [17, 43]]).props_('bush', [[4, 30], [18, 31], [4, 41], [18, 37]]).props_('thorn-bush', [[14, 41], [16, 41]]);
  b.props_('bench', [[8, 32], [14, 37]]).prop('statue', 4, 25).props_('pillar-round', [[9, 44], [13, 44]]).prop('lamp-post', 12, 32);
  b.light(12, 32, 10, 20);

  // ----- the hedge maze: 8 x 8 cells of 3 squares, walls of clipped yew, the lovers' folly in the middle -----
  const MX = 2, MY = 52, N = 8, C = 3;
  const mr = rng(7717);
  const open = new Set<string>();
  const key = (a: number, c: number) => (a < c ? `${a}|${c}` : `${c}|${a}`);
  const seen = new Set<number>([0]);
  const stack = [0];
  while (stack.length) {
    const c = stack[stack.length - 1];
    const cx = c % N, cy = Math.floor(c / N);
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N && !seen.has(y * N + x));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny] = nb[Math.floor(mr() * nb.length)];
    const n = ny * N + nx;
    open.add(key(c, n));
    seen.add(n);
    stack.push(n);
  }
  for (const [a, c] of [[27, 28], [35, 36], [27, 35], [28, 36]]) open.add(key(a, c));
  for (let i = 0; i < 10; i++) { const c = Math.floor(mr() * N * N); if (c % N < N - 1) open.add(key(c, c + 1)); else open.add(key(c, Math.min(c + N, N * N - 1))); }
  for (let i = 0; i < N * C; i++) {
    if (i < 3 || i > 5) b.wall(MX + i, MY, 'n'); // gate from the rose garden
    b.wall(MX + i, MY + N * C - 1, 's');
    b.wall(MX, MY + i, 'w');
    if (i < 18 || i > 20) b.wall(MX + N * C - 1, MY + i, 'e'); // gate from the drive
  }
  for (let cy = 0; cy < N; cy++)
    for (let cx = 0; cx < N; cx++) {
      const c = cy * N + cx;
      if (cx < N - 1 && !open.has(key(c, c + 1))) b.wallRun(MX + cx * C + C - 1, MY + cy * C, C, 'e');
      if (cy < N - 1 && !open.has(key(c, c + N))) b.wallRun(MX + cx * C, MY + cy * C + C - 1, C, 's');
    }
  b.area('Hedge maze', [[MX, MY, N * C, N * C]], {
    read: 'Walls of clipped yew, twice your height, close in around you. The gravel paths turn and turn again. Somewhere ahead, something large is panting.',
    gm: 'Two gates: north from the rose garden, east from the drive. The Velbrand huntsman (a vampire spawn) has loosed his dire wolves here to "guard the bride\'s walk". They hunt by scent: a DC 15 Survival lets the party move against the wind and pick their fight. A gardener\'s skeleton lies in one dead end, throat torn.',
    label: [MX + 4, MY + 4],
  });
  for (const [cx, cy, kind] of [[0, 7, 'statue-gargoyle'], [7, 0, 'urn'], [5, 6, 'bench'], [1, 2, 'hedge'], [6, 3, 'skeleton-lying'], [1, 5, 'stump'], [6, 7, 'statue'], [2, 0, 'lamp-post']] as [number, number, string][])
    b.prop(kind, MX + cx * C + 1, MY + cy * C + 1);
  b.light(MX + 2 * C + 1, MY + 1, 10, 15);
  b.area("The lovers' folly", [[11, 61, 6, 6]], {
    read: 'At the heart of the maze, four white pillars hold up a little domed roof. Initials are carved deep into one pillar, inside a heart: M and A.',
    gm: 'Margery and Aurelien met here sixty years ago. The carving is dated: sixty years ago this summer. A DC 14 Investigation of the bench finds a tin box with a pressed rose and a calling card in an old hand: "A. Velbrand. Until the third vow." (the same hand as the groom\'s invitation, DC 12 to notice).',
  });
  b.props_('pillar-round', [[11, 61], [16, 61], [11, 66], [16, 66]]).prop('bench', 13, 64).prop('flowers', 14, 62).prop('candles', 15, 65).light(13, 63, 5, 15, '#ffd8a8');
  b.encounter('Hounds in the maze', [MX, MY, N * C, N * C], [['dire-wolf', 8], ['vampire-spawn', 1]], 'low');

  // ----- Thornmere House -----
  b.building('Thornmere House', 22, 22, 36, 25, {
    mat: 'wood-planks-dark',
    read: 'Thornmere House is old money gone thin: grand rooms, worn carpets, and candles everywhere to hide the damp. Tonight every door stands open and music fills the halls.',
    gm: 'The bride\'s family home. See the rooms inside. The Velbrands have the east wing.',
    doors: [[38, 46, 's', 'closed', 'door-double'], [39, 46, 's', 'closed', 'door-double'], [37, 22, 'n', 'open', 'door-double'], [42, 22, 'n', 'open', 'door-double'], [57, 43, 'e', 'closed'], [22, 40, 'w', 'closed']],
    windows: [[33, 22, 'n'], [46, 22, 'n'], [22, 24, 'w'], [22, 32, 'w'], [57, 25, 'e'], [57, 32, 'e'], [25, 46, 's'], [29, 46, 's'], [35, 46, 's'], [42, 46, 's'], [48, 46, 's'], [54, 46, 's']],
  });
  b.wallRun(30, 22, 15, 'e').wallRun(48, 22, 15, 'e').wallRun(22, 28, 9, 's').wallRun(49, 28, 9, 's');
  b.wallRun(22, 36, 36, 's').wallRun(22, 38, 36, 's').wallRun(32, 39, 8, 'e').wallRun(44, 39, 8, 'e');
  b.wallRun(22, 43, 3, 's').wallRun(24, 44, 3, 'e');
  b.door(30, 25, 'e', 'closed').door(27, 28, 's', 'closed').door(53, 28, 's', 'closed');
  b.door(26, 36, 's', 'closed').door(39, 36, 's', 'open', 'door-double').door(40, 36, 's', 'open', 'door-double').door(53, 36, 's', 'closed');
  b.door(28, 38, 's', 'closed').door(38, 38, 's', 'open', 'door-double').door(39, 38, 's', 'open', 'door-double').door(50, 38, 's', 'closed');
  b.door(32, 42, 'e', 'closed').door(44, 43, 'e', 'closed').door(24, 45, 'e', 'secret');
  b.paint(31, 22, 18, 15, 'marble').paint(33, 39, 12, 8, 'stone-flagstone-warm').paint(45, 39, 13, 8, 'stone-flagstone').paint(22, 37, 36, 2, 'wood-planks');

  b.area("Lord Calloway's study", [[22, 22, 9, 7]], {
    read: 'A cramped study that smells of pipe smoke and panic. Bills are stacked on every surface, and a decanter stands empty beside a signed marriage contract.',
    gm: 'Humphrey\'s study. The contract (handout) has a clause in faded red ink. Under the bills (DC 13 Investigation): every one of Humphrey\'s debts was bought up this year by the same agent, "M. Grieve, for the House of Velbrand". The strongbox (DC 15 to pick, or Humphrey\'s key) holds the last of his money.',
  });
  b.prop('writing-desk', 25, 24).prop('chair-high-back', 25, 25).prop('fireplace', 23, 22).prop('bookshelf', 29, 22).prop('strongbox', 29, 27).prop('map-cabinet', 22, 27).prop('rug', 26, 26).prop('scroll-pile', 27, 23).light(23, 23, 10, 15);
  b.area("Celandine's chambers", [[22, 29, 9, 8]], {
    read: 'A pretty room drowned in white: the wedding gown on its stand, lace, roses, ribbons. The window is wide open to the cold, though a fire burns in the grate.',
    gm: 'Celandine opens the window every night "for the air". A DC 15 Perception finds two small scabbed marks under her lace collar, and mist-damp on the sill. Her diary pages describe a man at the window (DC 13 to find under the mattress).',
  });
  b.prop('bed-canopy', 24, 30).prop('vanity', 28, 30).prop('wardrobe', 29, 34).prop('dresser-mirror', 23, 35).prop('rug-round', 26, 33).prop('armor-stand', 27, 35).prop('fireplace', 22, 32).prop('flowers', 29, 31).light(23, 32, 10, 15);
  b.area('The ballroom', [[31, 22, 18, 15]], {
    read: 'Three chandeliers blaze over a floor of white marble. Musicians play a slow, sweet waltz, and couples turn beneath the lights. Along one wall, a mirror as tall as a door reflects the whole bright room.',
    gm: 'The wedding-eve ball. The mirror is the key clue: Aurelien, Seraphine and the four Velbrand "cousins" cast no reflection (DC 12 Perception to notice a dancer\'s empty arms in the glass). The cousins are vampire spawn. Exposing them in front of everyone starts a fight; doing it quietly gives the party a night\'s head start.',
  });
  b.prop('chandelier-great', 39, 29).props_('chandelier-crystal', [[34, 26], [44, 26]]).prop('harpsichord', 33, 24).props_('column-fluted', [[32, 25], [47, 25], [32, 34], [47, 34]]).prop('mirror', 35, 35).prop('sideboard', 45, 35).props_('chair', [[32, 28], [32, 31], [47, 28], [47, 31]]).prop('heraldic-crest', 39, 22).props_('banner-hanging-tall', [[35, 22], [44, 22]]);
  b.light(39, 29, 25, 30, '#ffd38a').light(34, 26, 15, 20, '#ffd38a').light(44, 26, 15, 20, '#ffd38a');
  b.encounter('Unmasked at the ball', [31, 22, 18, 15], [['vampire-spawn', 4]], 'moderate');
  b.area('The Velbrand suite', [[49, 22, 9, 7]], {
    read: 'Heavy curtains are nailed shut over the windows. A grand bed stands unused, its covers smooth. At its foot sits a long chest of black wood.',
    gm: 'The rooms given to Aurelien and Seraphine. Nobody has slept in the bed. The chest is full of grave earth (Aurelien rests in it by day while away from home). The dresser mirror is turned to the wall. A DC 16 Investigation finds Grieve\'s letter-book: the guest list for the wedding, with "for the larder" written beside six names of Lenford folk.',
  });
  b.prop('bed-four-poster', 55, 24).prop('armoire', 50, 23).prop('trunk', 55, 27).prop('dresser-mirror', 57, 22).prop('folding-screen', 52, 27).prop('writing-desk', 50, 26).prop('candelabra', 53, 23).light(53, 23, 5, 10, '#ff9a7a');
  b.area('Guest chambers', [[49, 29, 9, 8]], {
    read: 'Two plain guest rooms knocked into one. An old woman in black silk sits very upright in a wing chair, a cane across her knees, watching the door.',
    gm: 'Margery has been moved here "to make room for the Velbrands". After she recognises Aurelien (see the gallery scene), Grieve and four Velbrand footmen come at midnight to carry her away quietly. The footmen are charmed thralls with veteran stat blocks: they surrender if Grieve falls or flees.',
  });
  b.props_('bed', [[50, 30], [50, 34]]).prop('armchair', 55, 33).prop('wardrobe', 56, 30).props_('nightstand', [[51, 31], [51, 35]]).prop('rug-pelt', 53, 32).prop('washbasin', 56, 35).prop('candles', 54, 30).light(54, 30, 5, 15);
  b.encounter('The footmen come for Margery', [49, 29, 9, 8], [['assassin', 1], ['veteran', 4]], 'moderate');
  b.area('Portrait gallery', [[22, 37, 36, 2]], {
    read: 'A long gallery of family portraits, centuries of Calloways in fading oils. Near the end hangs a new gift from the groom: a portrait of a young man in an old-fashioned coat, with one white lock in his black hair.',
    gm: 'The Velbrand wedding gift, "my grandfather, also Aurelien, painted sixty years ago". It is the groom to the life, down to the white lock. Margery, seeing it beside the living man, screams "He has not aged a day!" and faints. Grieve notes it.',
  });
  b.props_('tapestry-tall', [[24, 37], [57, 38]]).props_('candle-stand-tall', [[30, 37], [46, 37]]).props_('bench-long', [[35, 37], [51, 37]]).prop('plinth-display', 55, 37).light(30, 37, 10, 15).light(46, 37, 10, 15);
  b.area('Library', [[25, 39, 7, 8], [22, 39, 3, 4]], {
    read: 'Shelves to the ceiling, ladders, and leather chairs gone shiny with age. A fire crackles. One tall bookcase in the corner is newer than the rest.',
    gm: 'The newer bookcase hides a priest hole (DC 16 Perception, or Margery shows it). The family chronicle on the reading table has its last sixty years of pages cut out.',
  });
  b.props_('bookshelf-tall', [[26, 39], [29, 39], [31, 41]]).prop('bookcase-secret', 25, 45).prop('table-reading', 28, 42).props_('armchair', [[27, 44], [30, 44]]).prop('globe-stand', 23, 40).prop('fireplace', 31, 45).prop('rug', 28, 43).light(31, 45, 10, 15);
  b.area('Priest hole', [[22, 44, 3, 3]], {
    read: 'A cramped, dusty hiding place, barely big enough to sit in. A candle stub, a blanket and a tin box.',
    gm: 'Margery hid here for three days sixty years ago after she fled the altar. The tin box holds her letter to her sister (handout), never sent.',
  });
  b.prop('trunk', 23, 45).prop('candles', 22, 44).prop('scroll-pile', 22, 46);
  b.area('Entrance hall', [[33, 39, 12, 8]], {
    read: 'A grand staircase sweeps up under a chandelier. Two suits of old armour stand guard by the doors, and a red runner leads from the door to the stair.',
    gm: 'Humphrey greets guests here. The suits of armour are only armour.',
  });
  b.prop('stair-grand', 38, 40).props_('armor-stand', [[34, 41], [43, 41]]).prop('chandelier-tiered', 38, 43).prop('rug-runner', 38, 44).prop('coat-rack', 34, 45).prop('lantern-standing', 43, 45).light(38, 43, 15, 20);
  b.area('Kitchens', [[45, 39, 13, 8]], {
    read: 'Steam, shouting and the smell of roasting meat. A wedding cake four tiers high stands under a cloth, and a cook is weeping into the soup.',
    gm: 'The cook, a big kind woman, is weeping because a kitchen maid went to fetch ice from the icehouse at dusk and has not come back.',
  });
  b.prop('hearth-oven', 46, 39).prop('stove', 49, 39).prop('table-trestle', 50, 43).prop('pot-rack', 52, 39).prop('butcher-block', 55, 41).prop('flour-sacks', 56, 45).prop('barrel-group', 46, 45).prop('table-long', 53, 44).prop('bread-rack', 56, 39).light(46, 40, 15, 20);

  // ----- forecourt, drive and gate -----
  b.paint(28, 47, 24, 7, 'stone-cobble').paint(37, 54, 5, 26, 'stone-cobble');
  b.area('Forecourt', [[28, 47, 24, 7]], {
    read: 'Carriages crowd the gravel around a great stone fountain. As the sun goes down, a black coach drawn by four black horses rolls in, and every horse in the forecourt shies.',
    gm: 'The Velbrands arrive at full dark: Aurelien, Seraphine and Grieve. The coach goes on to the coach house. Animals hate them (DC 10 Animal Handling to see the horses are terrified, not skittish).',
  });
  b.prop('fountain-grand', 40, 50).props_('cart', [[31, 49], [48, 51]], 90).props_('hitching-post', [[29, 52], [51, 48]]).props_('lamp-post', [[29, 48], [51, 52]]).light(29, 48, 15, 20).light(51, 52, 15, 20);
  b.area('Carriage drive', [[37, 54, 5, 20]], {
    read: 'An avenue of old oaks lines the drive. Their branches meet overhead and the lamps between them hiss in the damp.',
    gm: 'Mist rolls up the drive after midnight: it is Aurelien, coming and going. A DC 17 Arcana or Perception notices the mist moves against the wind.',
  });
  for (const y of [56, 60, 64, 68, 72]) b.prop('tree-oak', 35, y).prop('tree-oak', 44, y);
  b.props_('lamp-post', [[36, 58], [42, 66]]).light(36, 58, 10, 15).light(42, 66, 10, 15);
  b.building('Gate lodge', 30, 70, 6, 6, {
    read: 'A snug lodge with a cold hearth. The gatekeeper\'s supper sits half eaten on the table.',
    gm: 'The gatekeeper left his post to join the tenants\' feast. His logbook lists every carriage that came tonight, and a note: "black barge again, sixth time this month".',
    doors: [[35, 72, 'e', 'closed']], windows: [[32, 75, 's'], [35, 74, 'e']],
  });
  b.prop('bed', 31, 71).prop('table-round', 33, 73).prop('chair', 32, 73).prop('fireplace', 30, 74).prop('lantern-hook', 34, 71).light(34, 71, 5, 10);
  b.area('South gate', [[36, 74, 7, 6]], {
    read: 'Tall iron gates stand open between stone pillars topped with stone owls. Beyond them, the misty drive curves up toward a house blazing with candles.',
    gm: 'Where the heroes arrive, an hour before sunset on the wedding eve.',
  });
  b.prop('gate-iron-tall', 39, 76).props_('statue-gargoyle', [[37, 76], [41, 76]]).props_('wall-stone-low', [[27, 77], [30, 77], [33, 77], [45, 77], [48, 77], [51, 77]]);
  b.start(38, 77, 3, 3);

  b.building("Gardener's bothy", 50, 66, 6, 6, {
    read: 'A potting shed with a bed in it. Tools, seed trays and a smell of earth. A crude charm of hawthorn and garlic hangs over the door.',
    gm: 'The old gardener vanished three nights ago (his bones are in the maze). His diary: "the black dogs in the yew walk again. The tall lady walked the maze and the dogs licked her hand."',
    doors: [[52, 66, 'n', 'closed']], windows: [[55, 68, 'e']],
  });
  b.prop('cot', 51, 67).prop('workbench', 54, 70).prop('tool-wall', 51, 70).prop('herbs-drying', 54, 67).prop('sack', 53, 68);

  // ----- the orchard and the paddock -----
  b.area('Pear orchard', [[46, 54, 12, 10]], {
    read: 'Old pear trees in crooked rows, the fruit fallen and rotting in the grass. Wasps drone, slow and drunk, even at night.',
    gm: 'Quiet, and a good place to watch the stables and the drive unseen. Under one tree (DC 14 Perception) the grass is flattened in a long shape: someone rested here on a cloak in the shade all afternoon. Grieve, who keeps watch on Thornmere by day for his master.',
  });
  for (const [x, y] of [[47, 55], [51, 55], [55, 55], [49, 58], [53, 58], [57, 58], [47, 61], [51, 61], [55, 61]] as [number, number][]) b.prop(r() < 0.3 ? 'tree-dead' : 'tree-birch', x, y);
  b.props_('beehive', [[46, 63], [48, 63]]).prop('ladder', 52, 60).prop('sack', 54, 62);
  b.area('Paddock', [[60, 66, 18, 12]], {
    read: 'A fenced paddock under the moon. The horses have all crowded into the far corner and will not come to the fence.',
    gm: 'Something walked through here at dusk and the horses remember it. A DC 13 Survival finds a woman\'s small footprints in the mud that stop in the middle of the field, as if she flew away.',
    label: [68, 71],
  });
  b.mud(64, 70, 5, 3);
  b.props_('fence-wood', [[60, 66], [64, 66], [68, 66], [72, 66], [76, 66], [60, 77], [64, 77], [68, 77], [72, 77], [76, 77]]).prop('fence-gate', 60, 71, 90).prop('water-trough', 74, 73).prop('haystack', 75, 68).prop('tree-oak', 62, 75);

  // ----- kitchen yard, icehouse, stables -----
  b.paint(58, 38, 8, 13, 'dirt');
  b.area('Kitchen yard', [[58, 38, 8, 13]], {
    read: 'A muddy yard of woodpiles, washing lines and hens. Lantern light falls from the kitchen door. A trail of spilled ice chips leads off toward a low stone building.',
    gm: 'The missing maid\'s ice bucket lies by the icehouse door.',
  });
  b.prop('well', 61, 46).prop('firewood', 59, 39).prop('chicken-coop', 63, 49).prop('water-barrel', 59, 44).prop('handcart', 64, 41).prop('lantern-standing', 60, 42).light(60, 42, 10, 15);
  b.building('Icehouse', 66, 40, 10, 8, {
    mat: 'stone-flagstone',
    read: 'Bitter cold. Blocks of river ice packed in straw, hooks hanging from the beams, and the smell of old meat. Something crouched in the dark is eating.',
    gm: 'The Velbrands\' ghouls and ghasts came up the secret tunnel from the chapel crypt and took the maid. She is dead. Behind the straw at the back (DC 14 Perception, or follow the drag marks) a trapdoor-like door opens on a tunnel north to the crypt.',
    doors: [[66, 44, 'w', 'closed'], [72, 40, 'n', 'closed']],
  });
  b.ice(67, 41, 3, 2).ice(72, 45, 3, 2);
  b.props_('ice-block', [[68, 41], [73, 42], [74, 46]]).props_('chains-hanging', [[70, 43], [71, 43]]).prop('hay-bale', 67, 46).prop('bones', 70, 45).prop('blood-pool', 71, 44).prop('lantern-hook', 67, 43).light(67, 43, 5, 10, '#a8d0ff');
  b.encounter('Ghouls in the icehouse', [66, 40, 10, 8], [['ghast', 4], ['ghoul', 6]], 'low');
  b.building('Stables', 60, 54, 16, 10, {
    read: 'Warm horse smell and a dozen stalls. Every horse is pressed against the far wall, eyes rolling. The coach house beyond is dark.',
    gm: 'The guests\' horses. The Velbrand coach is in the coach house.',
    doors: [[60, 57, 'w', 'closed', 'door-double'], [60, 58, 'w', 'closed', 'door-double'], [66, 54, 'n', 'closed']],
    windows: [[63, 63, 's'], [72, 63, 's']],
  });
  b.wallRun(68, 54, 10, 'e').door(68, 58, 'e', 'closed');
  b.props_('hay-bale', [[61, 55], [61, 62]]).props_('horse-trough', [[64, 55], [64, 62]]).prop('water-trough', 67, 59).prop('haystack', 62, 59).prop('gear-pile', 66, 62).light(64, 58, 5, 10);
  b.area('Coach house', [[69, 54, 7, 10]], {
    read: 'The Velbrand coach stands here, black lacquer and silver. Its curtains are drawn. It is very cold beside it.',
    gm: 'Inside the coach: a coffin lined with grave earth, Seraphine\'s daytime bed. If the heroes wait here at dawn she comes to it, and she will talk rather than fight: see her profile.',
  });
  b.prop('wagon', 72, 58, 90).prop('coffin', 74, 56).prop('chest', 70, 62).prop('lantern-hook', 70, 55, 0, { off: true });

  // ----- the chapel and the crypt beneath -----
  b.building('Chapel of the Calloways', 57, 9, 12, 13, {
    mat: 'stone-flagstone',
    read: 'A little grey chapel, scrubbed and garlanded for tomorrow. Candles burn before the altar. Behind it, an iron door stands at the top of a stair going down.',
    gm: 'Sister Wilhelmina, up from Lenford to bless the couple, is preparing the chapel. She has noticed the Velbrands will not enter it. The iron door to the family crypt was locked, and someone has oiled the lock (DC 15 to pick; the Sister has the key).',
    doors: [[62, 21, 's', 'closed', 'door-double'], [63, 21, 's', 'closed', 'door-double'], [68, 14, 'e', 'locked', 'door-iron']],
    windows: [[57, 12, 'w'], [57, 17, 'w'], [60, 9, 'n'], [65, 9, 'n']],
  });
  b.prop('altar', 62, 10).props_('pew', [[59, 13], [59, 15], [59, 17], [65, 13], [65, 15], [65, 17]]).prop('font', 62, 19).props_('candelabra', [[60, 10], [64, 10]]).prop('pipe-organ', 67, 10).prop('prayer-kneeler', 62, 11).prop('flowers', 58, 19);
  b.light(62, 11, 15, 20, '#ffe3a8');
  b.rock(69, 7, 11, 33);
  b.hall(69, 14, 70, 14, 1, { mat: 'dungeon-slab' });
  b.prop('stairs-down', 69, 14);
  b.room('Calloway crypt', 71, 10, 8, 9, {
    mat: 'dungeon-slab',
    read: 'Stone Calloways lie in rows on their tombs, hands folded. The oldest tomb, at the far end, shows a knight with a mace on his chest and a sun on his shield.',
    gm: 'The founder of the line, who made the Lenn Compact. His tomb holds a mace of disruption (DC 18 Athletics to shift the lid, or two heroes together). A DC 14 Religion reads the inscription: "The river answers Thornmere\'s heir. Let no dead thing wed it."',
  });
  b.props_('sarcophagus-effigy', [[72, 11], [72, 14], [72, 17], [75, 11], [75, 17]]).prop('sarcophagus', 77, 14).props_('urn', [[78, 11], [78, 17]]).prop('candles', 76, 14).light(76, 14, 5, 15, '#ffe3a8');
  b.hall(74, 19, 74, 22, 2, { mat: 'dungeon-slab' });
  b.door(74, 19, 'n', 'closed', 'door-iron').door(75, 19, 'n', 'closed', 'door-iron');
  b.room('Coffins beneath the chapel', 70, 24, 9, 11, {
    mat: 'dungeon-slab',
    read: 'A newer vault, dug out this year: the walls are raw earth shored with beams. Six fine coffins lie on trestles, lids ajar. The air is thick and warm and smells of iron.',
    gm: 'The Velbrands hid their spawn under the Calloways\' own chapel. Five vampire spawn and a wight (the old Velbrand coachman) rest here; after midnight they are out hunting, so a daytime raid finds them asleep in their coffins (helpless for one round). On a lectern: the Velbrand ledger of brides (handout).',
  });
  b.props_('coffin', [[71, 26], [73, 26], [75, 26], [71, 30], [73, 30], [75, 30]]).prop('lectern', 77, 25).props_('mine-support', [[70, 28], [78, 28]]).prop('chest', 77, 33).prop('blood-pool', 74, 32).prop('candelabra', 77, 29).light(77, 29, 5, 15, '#ff9a7a');
  b.encounter('Coffins beneath the chapel', [70, 24, 9, 11], [['vampire-spawn', 5], ['wight', 1]], 'high');
  b.hall(72, 35, 72, 39, 1, { mat: 'cave-floor' });
  b.door(72, 35, 'n', 'secret');
  b.note(72, 37, 'Tunnel from the crypt to the icehouse. The ghouls use it.');
  return b.build();
}

// ---------- Part 2: Lenford, the Old Kirk and the crypts below ----------
function lenford() {
  const b = new MapBuilder('adv-vwd-lenford', 'Lenford and the Old Kirk', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  const r = rng(2903);

  // the River Lenn on the west, the bridge, and the marsh south of the village
  b.water(0, 0, 6, 80, true).water(6, 0, 2, 80, false);
  for (let y = 0; y < 80; y++) if (r() < 0.4) b.water(8, y, 1, 1);
  b.floor(0, 29, 9, 3, 'stone-cobble');
  b.area('Lenn bridge', [[0, 29, 9, 3]], {
    read: 'An old humpbacked bridge crosses the Lenn into Lenford. The river runs fast and brown below, and a heron stands on the far bank, watching you.',
    gm: 'Where the heroes arrive, the morning after the ball. Running water: no vampire crosses here on its own (see the vampire\'s weaknesses). The Velbrands come and go by barge, landing at the mill.',
  });
  b.start(0, 29, 3, 3);
  b.paint(9, 29, 38, 3, 'stone-cobble').paint(20, 9, 3, 20, 'dirt').paint(43, 19, 3, 10, 'dirt');

  b.water(9, 2, 11, 3, false);
  b.building('The mill', 9, 6, 10, 10, {
    read: 'The waterwheel creaks round with nothing to grind. Flour dust hangs in the still air. Upstairs, through the boards, you hear slow breathing: lots of it.',
    gm: 'The barge lands here. Two vampire spawn keep eight bitten villagers in the loft as a "pantry"; the thralls defend their masters with kitchen knives and their bare hands (commoners). Kill the spawn and the thralls drop, dazed. Heroes who try not to kill thralls should be praised and given a chance: a thrall at 0 hit points is knocked out, not dead.',
    doors: [[18, 10, 'e', 'closed'], [13, 15, 's', 'closed']], windows: [[9, 9, 'w'], [14, 6, 'n']],
  });
  b.prop('grindstone', 12, 9).props_('flour-sacks', [[10, 7], [16, 7]]).props_('sack', [[11, 13], [16, 13]]).prop('ladder', 17, 8).prop('winch', 10, 11).props_('straw-bed', [[14, 11], [15, 12], [13, 13]]).prop('mooring-post', 8, 9).light(12, 12, 5, 10);
  b.encounter('Thralls at the mill', [9, 6, 10, 10], [['vampire-spawn', 2], ['commoner', 8]], 'low');

  b.building('The boarded house', 9, 18, 9, 8, {
    read: 'Every window is boarded from the inside. Garlic hangs over the door. Inside, a whole family lies asleep in one bed at noon, pale as candles.',
    gm: 'A family of four, bitten but not yet taken. They are weak (3 levels of exhaustion) and dream of "the lady in mourning lace". A DC 15 Medicine and a meal gets the father talking: his son walked to the Old Kirk two nights ago.',
    doors: [[13, 25, 's', 'closed']], windows: [[17, 21, 'e']],
  });
  b.prop('bed-double', 10, 19).prop('kitchen-table', 14, 22).props_('chair', [[13, 22], [15, 22]]).prop('herbs-drying', 16, 19).prop('hearth-oven', 9, 24).prop('crib', 12, 19);

  b.paint(18, 32, 14, 10, 'stone-cobble');
  b.area('Market square', [[18, 32, 14, 10]], {
    read: 'A cobbled square with a well and empty stalls. Shutters closed at midday. A notice board is papered over with "missing" notes, layer on layer, the oldest gone grey with rain.',
    gm: 'Twenty-three missing in a year (DC 12 Investigation to count). The newest note is Perrin\'s, for his sister. Villagers talk only behind closed doors; a DC 15 Persuasion or a coin gets the rumours (see the scene).',
  });
  b.prop('well', 24, 36).props_('market-stall', [[20, 33], [27, 33], [20, 39]]).prop('notice-board', 30, 34).prop('pillory', 29, 40).props_('lamp-post', [[19, 36], [31, 38]]).prop('handcart', 25, 40).light(19, 36, 10, 15).light(31, 38, 10, 15);

  b.building('The Heron and Hook', 9, 34, 9, 10, {
    read: 'A low inn with a fire and almost no customers. Strings of garlic, sprigs of hawthorn and little tin suns hang over every window.',
    gm: 'Perrin Sable has a room here and a map of the missing, pinned with string. Rooms are cheap: "no one comes to Lenford any more".',
    doors: [[17, 38, 'e', 'closed']], windows: [[13, 43, 's'], [9, 38, 'w']],
  });
  b.prop('bar-counter', 10, 35).prop('keg-rack', 10, 37).prop('fireplace', 13, 34).props_('table-round', [[13, 39], [15, 41]]).props_('chair', [[12, 39], [14, 39], [14, 41], [16, 41]]).prop('stair-spiral', 16, 35).prop('table-maps', 11, 42).light(13, 35, 15, 20);

  b.building('Smithy', 24, 21, 8, 7, {
    read: 'The forge is cold. The smith is sharpening stakes of ash wood instead of horseshoes.',
    gm: 'The smith sells stakes (1 sp) and will silver a weapon for 100 gp, though it won\'t help against these vampires. He knows the Velbrand barge brought "long boxes" to the mill all year.',
    doors: [[27, 27, 's', 'closed']], windows: [[24, 23, 'w']],
  });
  b.prop('forge', 25, 22).prop('anvil', 27, 23).prop('grindstone', 29, 22).prop('weapon-rack', 30, 25).prop('log-pile', 25, 26).light(25, 22, 5, 10, '#ff9a3c');

  b.building('Dawn shrine', 34, 33, 8, 9, {
    mat: 'stone-flagstone',
    read: 'A small, bright shrine with a round window facing east. Candles everywhere. A stone font of water stands under the window, and the light on it is gold.',
    gm: 'Sister Wilhelmina\'s shrine. Holy water from the font: she gives each hero two flasks. She can also bless a weapon for the wedding night (it counts as magical and deals an extra 1d6 radiant damage to undead until dawn; once per hero).',
    doors: [[37, 33, 'n', 'closed'], [38, 33, 'n', 'closed']], windows: [[41, 36, 'e'], [34, 38, 'w']],
  });
  b.prop('altar', 37, 40).prop('font', 40, 37).props_('pew', [[35, 35], [35, 37], [39, 35]]).props_('candles', [[36, 40], [39, 40]]).prop('prayer-kneeler', 37, 39).light(37, 39, 15, 20, '#ffe3a8');

  b.building("Sexton's cottage", 39, 11, 7, 7, {
    read: 'A cottage leaning against the graveyard wall. Spades by the door, mud on everything, and a bottle on the table.',
    gm: 'Agnes Mortlake lives here. She has been made to dig at night for the "Velbrand men" all year, and her grandson is in the thrall pens below. She has the keys to the kirk and knows all three ways down (see her profile).',
    doors: [[42, 17, 's', 'closed'], [45, 14, 'e', 'closed']], windows: [[39, 13, 'w']],
  });
  b.prop('bed', 40, 12).prop('kitchen-table', 42, 14).prop('chair', 41, 14).prop('tool-wall', 44, 12).prop('pickaxes', 44, 16).prop('lantern-hook', 40, 16).light(40, 16, 5, 10);

  // a few more cottages with their gardens
  for (const [x, y] of [[24, 9], [30, 13], [33, 22]] as [number, number][]) {
    b.building(`Cottage at ${x === 24 ? 'Mill Lane' : x === 30 ? 'the Green' : 'Smith\'s Row'}`, x, y, 6, 5, {
      read: 'A shuttered cottage. Someone inside is praying under their breath.',
      gm: 'Frightened villagers. A kind word and a DC 13 Persuasion gets a rumour; a cruel word gets the door slammed.',
      doors: [[x + 2, y + 4, 's', 'closed']], windows: [[x, y + 2, 'w']],
    });
    b.prop('bed', x + 1, y + 1).prop('table-round', x + 3, y + 2).prop('crop-rows', x + 2, y + 6);
  }

  // ----- the old graveyard on the hill -----
  for (let i = 0; i < 32; i++) b.wall(47 + i, 2, 'n', 'low');
  for (let y = 2; y < 46; y++) {
    if (!(y >= 14 && y <= 16) && !(y >= 29 && y <= 31)) b.wall(47, y, 'w', 'low');
    b.wall(78, y, 'e', 'low');
  }
  b.paint(47, 29, 17, 3, 'dirt').paint(61, 20, 3, 12, 'dirt').paint(47, 14, 8, 2, 'dirt');
  b.area('Old graveyard', [[47, 2, 32, 28]], {
    read: 'Leaning stones, crooked yews and grass grown knee-high between the graves. Many graves are open. The earth is heaped up beside them, as if whoever was buried here dug their way out.',
    gm: 'They did: the Velbrands\' ghouls and ghasts den among the graves and feed on the newly dead. Two gates: the lychgate on the main street and the sexton\'s gate by Agnes\'s cottage. The low wall is easy to climb. At dusk the ghouls come out.',
    label: [62, 12],
  });
  const graves = ['burial-slab', 'standing-stone', 'obelisk', 'tomb-niche', 'open-grave', 'burial-slab', 'standing-stone'];
  for (let gy = 4; gy < 28; gy += 3)
    for (let gx = 49; gx < 77; gx += 3) {
      if (gx >= 60 && gx <= 64) continue;
      if (r() < 0.7) b.prop(graves[Math.floor(r() * graves.length)], gx + (r() < 0.5 ? 0 : 1), gy);
    }
  b.props_('tree-dead', [[52, 9], [72, 6], [69, 22], [55, 24]]).props_('statue-tall-winged', [[62, 4], [74, 14]]).prop('fence-gate', 47, 30).prop('lamp-post', 48, 28).light(48, 28, 10, 15);
  b.encounter('Ghouls among the graves', [56, 4, 22, 22], [['ghast', 6], ['ghoul', 4]], 'low');
  b.area('Fresh graves', [[71, 33, 7, 12]], {
    read: 'A row of new graves, the earth still raw. The headboards are plain wood with names painted on. Every grave is empty.',
    gm: 'The year\'s dead. The bodies were taken below to feed the Velbrands\' ghouls, or to rise as spawn. Agnes dug every one of these and is ashamed.',
  });
  b.props_('open-grave', [[72, 35], [75, 35], [72, 39], [75, 39], [73, 43]]).prop('wagon', 76, 42, 90).prop('pickaxes', 74, 37);

  b.building('Velbrand mausoleum', 48, 36, 6, 10, {
    mat: 'marble',
    read: 'A black marble tomb, finer than anything else in the graveyard, with a bronze door and a carved V over it. The stone is warm to the touch.',
    gm: 'Older than the Velbrand family is supposed to be: the carving gives a date three hundred years ago and the name "Aurelien". The lid of the empty sarcophagus inside slides back (DC 15 Athletics, or find the catch with DC 16 Investigation) on a stair going down. Seraphine meets the heroes here at dusk if they sent word.',
    doors: [[50, 36, 'n', 'locked', 'door-iron'], [51, 36, 'n', 'locked', 'door-iron'], [50, 45, 's', 'secret']],
  });
  b.prop('sarcophagus-effigy', 50, 41).props_('candle-stand-tall', [[49, 38], [52, 38]]).prop('urn', 52, 43).prop('stairs-down', 50, 44).light(50, 39, 5, 10, '#ff9a7a');

  b.building('The Old Kirk', 56, 32, 15, 14, {
    mat: 'stone-flagstone',
    read: 'A roofless church. Moonlight falls on broken pews and an altar split in two. Bats pour out of the tower in a black stream.',
    gm: 'Three wights and a wraith keep the kirk: Lenford\'s old patrons, raised to guard their lord\'s rest. The vestry holds the burial register (handout). A stair behind the altar goes down to the undercroft.',
    doors: [[63, 32, 'n', 'closed', 'door-double'], [64, 32, 'n', 'closed', 'door-double'], [63, 45, 's', 'closed']],
    windows: [[56, 36, 'w'], [56, 41, 'w'], [70, 39, 'e']],
  });
  b.wallRun(66, 32, 5, 'w').wallRun(66, 36, 5, 's').door(66, 34, 'w', 'closed');
  b.area('Kirk vestry', [[66, 32, 5, 5]], {
    read: 'A small room of mildewed robes and a chest of mouldering books.',
    gm: 'The burial register (handout) is here. Its oldest page records the burial of a young lord, Aurelien Velbrand, "dead of the plague, laid in his vault beneath this kirk", three hundred years ago.',
  });
  b.prop('chest', 69, 33).prop('wardrobe', 67, 33).prop('book-pile', 69, 35);
  b.rubble(57, 34, 3, 2).rubble(67, 41, 3, 3);
  b.prop('altar-reredos', 63, 43).props_('pew', [[59, 37], [59, 39], [66, 39]]).props_('broken-furniture', [[61, 41], [58, 43]]).props_('pillar-broken', [[58, 36], [68, 43]]).prop('column-fallen', 61, 35).prop('font', 64, 35).prop('stairs-down', 63, 44);
  b.encounter('Wights in the Old Kirk', [56, 32, 15, 14], [['wight', 3], ['wraith', 1]], 'low');

  // ----- the marsh and the old culvert -----
  b.area('Willow marsh', [[9, 46, 11, 30]], {
    read: 'Reeds and willows and black water. A stone culvert mouth, big enough to walk into stooping, drains into the river under an old wall.',
    gm: 'The third way into the crypts, the oldest, and the smelliest. Agnes knows it. The grate rusted through long ago.',
    label: [13, 55],
  });
  b.mud(10, 50, 5, 4).mud(14, 66, 4, 3).mud(11, 72, 6, 3);
  b.props_('tree-willow', [[11, 48], [16, 58], [12, 70]]).props_('reeds', [[10, 56], [17, 52], [15, 75]]).prop('sewer-outflow', 18, 63).prop('log-fallen', 13, 61);

  // ----- the crypts below -----
  b.rock(20, 46, 60, 34);
  b.hall(63, 46, 63, 46, 1, { mat: 'dungeon-slab' }).hall(50, 46, 50, 49, 1, { mat: 'dungeon-slab' });
  b.room('Kirk undercroft', 58, 47, 11, 8, {
    mat: 'dungeon-slab',
    read: 'Squat pillars hold up a low vault. Coffins are stacked on shelves to the ceiling. Somebody has swept a clean path through the dust, toward an iron door in the south wall.',
    gm: 'The crossroads below. West to the ossuary, south to the catacomb walk and the vault. The iron door is locked (Agnes has no key; DC 18 to pick, or break it: AC 19, 30 hit points).',
  });
  b.prop('stairs-up', 63, 47).props_('ossuary-shelf', [[59, 48], [59, 52], [67, 48], [67, 52]]).props_('pillar-square', [[61, 50], [65, 50]]).prop('coffin', 60, 53).light(63, 48, 5, 10);
  b.hall(53, 51, 57, 51, 1, { mat: 'dungeon-slab' });
  b.door(57, 51, 'e', 'closed');
  b.room('The ossuary', 40, 50, 13, 8, {
    mat: 'dungeon-slab',
    read: 'Bones. Walls of skulls set in patterns, arches of thighbones, chandeliers wired together from ribs. In the middle of it all, pale shapes drift in a slow circle, whispering names.',
    gm: 'Two wraiths and six specters: the spirits of those the Velbrands drained, bound here. If a hero speaks one of the missing names from Perrin\'s list aloud (DC 14 Religion or Persuasion, as an action), one specter stops and fades in peace instead of fighting. A secret door in the west wall (DC 17 Perception, or a draught that makes candles lean) leads to the forgotten chantry.',
  });
  b.prop('stairs-up', 50, 50).props_('skull-pile', [[41, 51], [51, 56]]).props_('bone-heap', [[44, 56], [48, 51]]).props_('ossuary-shelf', [[42, 50], [46, 50]]).prop('chandelier-antler', 46, 53).prop('reliquary', 41, 56).light(46, 53, 5, 15, '#b8c8ff');
  b.encounter('The ossuary', [40, 50, 13, 8], [['wraith', 2], ['specter', 6]], 'low');
  b.hall(33, 52, 39, 52, 1, { mat: 'dungeon-slab' });
  b.door(39, 52, 'e', 'secret');
  b.room("Dawn-knight's chantry", 24, 49, 9, 7, {
    mat: 'marble',
    read: 'A tiny chapel, sealed for centuries and perfectly dry. Painted on the ceiling, a sunrise. On the altar lies a knight in armour, long dead, with a sword hilt in his folded hands and no blade.',
    gm: 'The knight who first fought Aurelien three hundred years ago and lost. Speak a prayer or the word "dawn" over him (DC 13 Religion to think of it) and a blade of sunlight springs from the hilt: a sun blade. His shield-bearer\'s bag holds a periapt of wound closure.',
  });
  b.prop('sarcophagus-effigy', 28, 50).prop('altar', 28, 54).props_('candle-stand-tall', [[25, 50], [31, 50]]).prop('window-stained-tall', 28, 49).light(28, 51, 10, 15, '#ffe3a8');

  b.tunnel([[17, 63], [24, 64]], 2, { seed: 31, mat: 'cave-floor' });
  b.cave('Culvert sump', 27, 64, 5, 4, {
    seed: 32,
    read: 'The culvert opens into a round brick sump half full of black water. The stink is unbearable. Something in the water opens one great yellow eye.',
    gm: 'An otyugh lives in the sump, fat on what the ghouls throw down. Rats swarm the ledges, and ghouls come to feed it. The otyugh can be bargained with (it is telepathic and very hungry): throw it food and it lets the party pass.',
  });
  b.water(25, 64, 5, 3, false, true);
  b.props_('bones-mud', [[24, 62], [30, 66]]).prop('mold-patch', 29, 61).prop('sewer-outflow', 23, 63);
  b.encounter('Things in the culvert', [21, 59, 12, 11], [['otyugh', 1], ['swarm-of-rats', 8], ['ghoul', 6]], 'low');
  b.tunnel([[31, 66], [37, 67]], 2, { seed: 33, mat: 'cave-floor' });
  b.tunnel([[44, 58], [44, 62]], 2, { seed: 34, mat: 'cave-floor' });
  b.cave('The thrall pens', 44, 68, 8, 6, {
    seed: 35,
    read: 'A wide cave lit by a brazier. Iron pens line the walls, and in them, people: villagers in nightclothes, pale and smiling, sitting very still. Some hold out their wrists to you.',
    gm: 'Fifteen charmed villagers, Perrin\'s sister and Agnes\'s grandson among them. Four vampire spawn and two ghasts keep them. Killing the spawn breaks the charm on the thralls they bit. Freed thralls are weak but can walk out by the culvert. Every thrall freed here is one fewer at the wedding (see part 3).',
  });
  b.props_('cage', [[39, 66], [49, 66], [41, 71], [48, 71]]).props_('cell-door', [[42, 64], [46, 64]]).prop('brazier', 44, 68).props_('wall-chains', [[42, 73], [46, 73]]).props_('straw-bed', [[40, 66], [48, 70]]).light(44, 68, 15, 20, '#ff9a5c');
  b.encounter('The thrall pens', [36, 62, 17, 13], [['vampire-spawn', 4], ['ghast', 2]], 'moderate');

  b.hall(66, 55, 66, 61, 2, { mat: 'dungeon-slab' });
  b.door(66, 54, 's', 'locked', 'door-iron').door(67, 54, 's', 'locked', 'door-iron');
  b.area('Catacomb walk', [[66, 55, 2, 8]], {
    read: 'A long, narrow passage lined floor to ceiling with burial niches. In some, the bodies have been pulled out and laid on the floor.',
    gm: 'A trap: the third flagstone from the vault door is a pressure plate (DC 16 Perception) that drops a block from the ceiling (DC 15 Dexterity save or 22 (4d10) bludgeoning) and rings a bell in the vault.',
  });
  b.props_('tomb-niche', [[66, 57], [67, 60]]).prop('trap-falling-block', 66, 61, 0, { gm: true }).prop('skeleton-lying', 67, 56);
  b.door(66, 62, 's', 'closed', 'door-double').door(67, 62, 's', 'closed', 'door-double');
  b.room("The elder's vault", 64, 63, 14, 14, {
    mat: 'marble',
    read: 'A round-feeling vault of black marble. In the middle, on a bier heaped with earth, lies a coffin of red-black wood, its lid carved with a young man\'s face. Around it, in alcoves, stand the old wedding gowns of a dozen brides.',
    gm: 'Aurelien\'s true resting place: the earth he was buried in three hundred years ago. While it lies here, a defeated Aurelien turns to mist and comes back. Destroy it: holy water on the earth and the coffin (a minute of work), or the sun blade\'s light, or burning the coffin. Four vampire spawn and two wraiths guard it, with bat swarms. The scroll of the rite (handout) is on the bier.',
  });
  b.prop('sarcophagus-open', 70, 69).prop('coffin', 71, 69).props_('armor-stand', [[65, 64], [76, 64], [65, 75], [76, 75]]).props_('candelabra-grand', [[67, 67], [74, 67], [67, 72], [74, 72]]).prop('blood-pool', 70, 73).prop('chest', 76, 70).prop('rug', 70, 66);
  b.light(70, 69, 10, 20, '#ff5a5a');
  b.encounter("The elder's vault", [64, 63, 14, 14], [['vampire-spawn', 4], ['wraith', 2], ['swarm-of-bats', 4]], 'high');
  b.tunnel([[52, 69], [60, 70]], 1, { seed: 36, mat: 'cave-floor' });
  b.hall(61, 70, 63, 70, 1, { mat: 'cave-floor' });
  b.door(63, 70, 'e', 'secret');
  b.tunnel([[44, 74], [48, 77], [60, 77]], 2, { seed: 37, mat: 'cave-floor' });
  b.hall(61, 76, 63, 76, 1, { mat: 'cave-floor' });
  b.water(46, 75, 16, 4, false, true);
  b.area('Flooded catacomb', [[46, 75, 16, 4]], {
    read: 'Black water to the waist, cold as a grave. Coffins float past, bumping softly.',
    gm: 'A wet back way from the thrall pens to the vault: it comes up under the vault floor through a grate (DC 14 Athletics to lift quietly). No guards, but the water is running: a vampire spawn that follows takes the running-water damage from its weaknesses.',
  });
  b.props_('coffin', [[50, 77], [56, 77]]).prop('debris-wood', 58, 78);
  b.door(63, 76, 'e', 'closed', 'door-iron');
  return b.build();
}

// ---------- Part 3: Castle Velbrand on the Gallowcrag ----------
function castleVelbrand() {
  const b = new MapBuilder('adv-vwd-castle', 'Castle Velbrand on the Gallowcrag', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dark', floor: 'stone-flagstone' });

  // the river in its gorge, and the landing
  b.cave('The boat-cave', 55, 66, 8, 4, {
    seed: 41,
    read: 'The river has carved a cave into the foot of the crag. Boats are tied along a stone quay. Above the water, a stair spirals up into the rock, and the ceiling is a hanging black curtain of bats.',
    gm: 'The Velbrands\' private landing, where the barge unloads. One of the "bats" is a cloaker that has served the castle for a century. The well stair climbs to the wine cellars.',
  });
  b.pool(55, 67, 4, 2, true);
  b.props_('dock-pier', [[50, 64], [51, 64]]).prop('rowboat', 57, 66, 90).props_('cargo-crates', [[49, 66], [59, 65]]).prop('stair-spiral', 55, 62).prop('mooring-post', 52, 68).light(52, 65, 5, 10);
  b.encounter('The cloaker in the boat-cave', [47, 62, 17, 8], [['cloaker', 1], ['swarm-of-bats', 2]], 'low');
  b.water(0, 70, 80, 2, false).water(0, 72, 80, 8, true);
  b.area('The Lenn gorge', [[0, 70, 80, 10]], {
    read: 'The Lenn roars through its gorge below the crag, white over black rocks. Swimming it is madness. Rowing it is only dangerous.',
    gm: 'Running water. A boat from the landing to the boat-cave takes a DC 13 Strength (Athletics) or Wisdom (Survival) check; on a failure the boat hits the rocks and everyone makes a DC 13 Dexterity save or goes in (DC 15 Athletics to get out).',
    label: [30, 75],
  });
  b.props_('rapids', [[20, 74], [40, 76], [66, 74]]).props_('boulder', [[10, 73], [33, 72], [72, 76]]);
  b.room('River landing', 2, 62, 14, 8, {
    mat: 'dirt',
    read: 'A muddy landing under the crag, crowded with village carts. High above, the castle\'s windows burn red, and a bell is tolling slowly, counting down to midnight.',
    gm: 'Where invited guests arrive on the wedding night: the villagers of Lenford come by cart, charmed and smiling. The heroes may come with them, as guests (they were invited), or row for the boat-cave.',
  });
  b.props_('cart', [[4, 64], [8, 66]], 90).prop('rowboat', 6, 70).props_('mooring-post', [[3, 69], [12, 69]]).prop('signpost', 13, 63).prop('lantern-standing', 10, 63).light(10, 63, 15, 20);
  b.start(3, 63, 3, 3);

  // the switchback road up the crag
  b.tunnel([[8, 62], [8, 52], [22, 52], [22, 44], [33, 44]], 3, { seed: 42, mat: 'dirt' });
  b.area('The switchback road', [[8, 52, 3, 10], [8, 52, 16, 3], [22, 44, 3, 10], [22, 44, 13, 3]], {
    read: 'The road climbs the crag in sharp switchbacks, cut into the cliff. Gibbets creak on the corners. Wolves howl on the slopes, close.',
    gm: 'The huntsman and his two sons, werewolves bound to the castle, run the road with their dire wolves. They let charmed guests pass and stop everyone else. A hero who pretends to be charmed passes with a DC 16 Deception. The huntsmen hate the Velbrands and can be turned with proof the curse could be lifted (DC 18 Persuasion).',
    label: [15, 53],
  });
  b.props_('gibbet-post', [[11, 56], [21, 53], [24, 48]]).props_('boulder', [[9, 58], [19, 52]]).props_('lamp-post', [[10, 54], [24, 49]]).prop('tree-dead', 30, 45).light(10, 54, 10, 15).light(24, 49, 10, 15);
  b.encounter('Wolves on the switchback', [8, 44, 28, 20], [['werewolf', 3], ['dire-wolf', 10]], 'low');
  b.hall(11, 57, 12, 57, 1, { mat: 'dirt' });
  b.cave('The gibbet ledge', 16, 57, 4, 3, {
    seed: 43, mat: 'dirt',
    read: 'A ledge off the road, with a view straight down to the river. Three iron gibbet cages hang from an old oak. One holds a skeleton still wearing good boots.',
    gm: 'A vampire hunter who came too close, years ago. In his boots: a map of the castle with the bride-path marked (from the vestry to the rookery) and a note "the chapel is the only way out of the vow". His pack: two flasks of holy water and a potion of heroism.',
  });
  b.props_('cage-hanging', [[15, 56], [17, 56], [16, 58]]).prop('tree-dead', 18, 58).prop('backpack', 14, 58);

  // the gatehouse
  b.hall(36, 44, 36, 45, 1);
  b.door(36, 44, 'e', 'closed', 'portcullis').door(36, 45, 'e', 'closed', 'portcullis');
  b.room('Gatehouse', 37, 40, 9, 8, {
    read: 'A tall gate-passage with murder holes overhead. Two black horses with eyes like coals stamp in the passage, harnessed to nothing. Grim knights in old armour stand along the walls.',
    gm: 'Four wights in Velbrand livery and the two nightmares that pull Aurelien\'s coach. Guests are waved through; strangers are "invited" to wait. If the party arrived with the villagers, the wights don\'t fight unless provoked.',
  });
  b.props_('weapon-rack', [[38, 41], [44, 41]]).props_('brazier', [[38, 46], [44, 46]]).prop('winch', 40, 46).prop('table-trestle', 43, 44).prop('portcullis', 41, 40).light(38, 46, 10, 15).light(44, 46, 10, 15);
  b.encounter('Gate of the crag', [37, 40, 9, 8], [['wight', 4], ['nightmare', 2]], 'low');
  b.hall(41, 39, 42, 39, 1);
  b.door(41, 40, 'n', 'open', 'portcullis').door(42, 40, 'n', 'open', 'portcullis');

  // the outer bailey
  b.room('Outer bailey', 26, 20, 33, 19, {
    mat: 'stone-cobble',
    read: 'A wide courtyard full of carriages and carts. Hundreds of villagers in their best clothes stand in neat rows, silent, smiling, all facing the great hall. Black banners hang from the walls, each stitched with a red V.',
    gm: 'The congregation: Lenford, charmed. Each thrall freed in part 2 means fewer here; with none freed, the bailey is packed and fighting here means fighting through innocents. They do nothing unless Aurelien commands. Freeing one here takes an action and a DC 15 Wisdom (Medicine or Insight) check, or holy water on the bite.',
  });
  b.props_('wagon', [[29, 22], [55, 22]], 90).props_('cart', [[30, 35], [54, 36]]).prop('well', 42, 29).props_('horse-trough', [[27, 30], [57, 30]]).props_('war-banner', [[33, 21], [51, 21]]).props_('brazier', [[35, 27], [49, 27], [35, 33], [49, 33]]).prop('statue-tall-winged', 42, 24).props_('bench-long', [[38, 31], [46, 31], [38, 34], [46, 34]]);
  for (const [x, y] of [[35, 27], [49, 27], [35, 33], [49, 33]]) b.light(x, y, 10, 20, '#ff7a5a');

  // the rookery tower
  b.hall(25, 27, 25, 27, 1);
  b.door(24, 27, 'e', 'closed');
  b.room('The rookery', 16, 22, 9, 12, {
    read: 'A hollow tower, open to the sky far above. Every ledge and beam is crusted with droppings, and the walls are moving: bats, thousands, hanging head down.',
    gm: 'Two vampire spawn roost among the bats. A stair winds up the inside wall. A secret door at its foot (DC 15 Perception, or the hunter\'s map from the gibbet ledge) opens on the bride-path: a narrow old passage that climbs to the chapel vestry. It is how Margery escaped sixty years ago.',
  });
  b.prop('stair-spiral', 17, 23).props_('chains-hanging', [[20, 26], [22, 30]]).props_('bones', [[18, 31], [23, 24]]).prop('ladder', 23, 32).prop('cage-hanging', 20, 29);
  b.encounter('The rookery', [16, 22, 9, 12], [['swarm-of-bats', 10], ['vampire-spawn', 2]], 'low');
  b.door(16, 30, 'w', 'secret');
  b.tunnel([[15, 30], [7, 30], [7, 18]], 1, { seed: 44, mat: 'stone-cobble' });
  b.area('The bride-path', [[7, 18, 1, 13], [7, 30, 9, 1]], {
    read: 'A passage barely wider than your shoulders, cut into the rock, climbing in rough steps. Scratched into the wall at shoulder height, over and over: M, M, M.',
    gm: 'Margery\'s escape route sixty years ago, and the best way to reach the chapel without crossing the sky bridge. It ends at a secret door into the vestry.',
  });
  b.prop('candles', 7, 24);

  // the great hall
  b.hall(39, 17, 39, 19, 2);
  b.door(39, 17, 'n', 'open', 'door-double').door(40, 17, 'n', 'open', 'door-double');
  b.prop('stair-grand', 39, 18);
  b.room('Great hall', 30, 4, 20, 13, {
    mat: 'wood-planks-dark',
    read: 'A hall built for giants, hung with red silk. Long tables groan with a wedding feast nobody is eating. On the dais, the groom in red velvet bows to you, and the musicians strike up the last dance before midnight.',
    gm: 'The last dance. Six Velbrand "kinsmen" (vampire spawn) dance with charmed guests. Aurelien invites the heroes to dance: each dance is a DC 16 Wisdom save against his charm, or a DC 16 Insight to read him. He talks freely: he believes he is giving the valley peace. At 11:30 he leaves for the chapel by the west doors and the sky bridge. Attack here and the six spawn fight while he goes.',
  });
  b.props_('feast-hall-table', [[34, 8], [44, 8]]).prop('throne-dais', 40, 5).props_('chandelier-great', [[35, 10], [45, 10]]).prop('hearth-grand', 31, 13).props_('banner-hanging-tall', [[33, 4], [47, 4]]).prop('harpsichord', 47, 14).prop('organ-cathedral', 33, 15).prop('table-feast', 40, 12).props_('candelabra-grand', [[38, 5], [42, 5]]);
  b.light(35, 10, 20, 25, '#ff9a6a').light(45, 10, 20, 25, '#ff9a6a').light(31, 13, 10, 15);
  b.encounter('The last dance', [30, 4, 20, 13], [['vampire-spawn', 6]], 'moderate');

  // the gallery of brides and Seraphine's tower
  b.hall(50, 9, 50, 10, 1);
  b.door(49, 9, 'e', 'closed', 'door-double').door(49, 10, 'e', 'closed', 'door-double');
  b.room('Gallery of brides', 51, 8, 11, 4, {
    mat: 'wood-planks',
    read: 'A narrow gallery hung with portraits of brides, a dozen of them, in the dresses of a dozen ages. The candles in front of each one burn blue. A woman\'s voice is weeping.',
    gm: 'The brides of three centuries, all Calloway cousins and daughters, none of them the heir. Their ghosts linger: four of them rise to stop anyone in Velbrand colours, or anyone who mocks them. Telling them the rite will be broken (DC 15 Persuasion) lays them to rest, and each gives a blessing: advantage on one save against Aurelien tonight.',
  });
  b.props_('candle-stand-tall', [[52, 8], [55, 8], [58, 8]]).props_('tapestry-tall', [[53, 11], [57, 11]]).prop('bench-long', 60, 10).light(55, 9, 10, 15, '#8fb0ff');
  b.encounter('Brides in the gallery', [51, 8, 11, 4], [['ghost', 4]], 'low');
  b.wallRun(61, 8, 4, 'e').door(61, 10, 'e', 'locked');
  b.room("Seraphine's tower", 62, 3, 13, 12, {
    mat: 'wood-planks',
    read: 'A round lady\'s chamber, all grey silk and dead flowers. In front of a covered mirror, Celandine stands in her wedding gown, eyes glassy, while a woman in mourning lace pins up her hair. Two pale maids hold the veil.',
    gm: 'Seraphine dresses the bride, with two spawn maids. If the heroes showed her kindness, or bring Margery, she turns: she leaves the door unlocked, tells them the order of the vows, and fights beside them in the chapel (the maids too, if she orders it). Otherwise she must obey Aurelien and fights. Celandine is charmed (see her profile).',
  });
  b.prop('bed-canopy', 72, 4).prop('vanity', 64, 4).prop('mirror', 66, 4).prop('wardrobe', 73, 12).prop('armor-stand', 68, 8).prop('chaise-longue', 64, 12).prop('flowers', 70, 6).prop('stair-spiral', 68, 13).light(65, 5, 5, 15, '#ffb8d8');
  b.encounter("Seraphine's handmaidens", [62, 3, 13, 12], [['vampire-spawn', 3]], 'low');
  b.hall(68, 15, 68, 21, 1);
  b.door(68, 14, 's', 'closed');

  // kitchens, cellars, the decoy crypt and the bride-price vault
  b.hall(59, 28, 60, 28, 1);
  b.door(58, 28, 'e', 'closed');
  b.room('Castle kitchens', 61, 22, 12, 12, {
    read: 'A huge kitchen, every oven cold. On the tables, the wedding feast: whole roast boar, cakes, jellies, all cold and all untouched. Rats are eating it.',
    gm: 'No living cook works here. Grieve hired Lenford women to cook it, then sent them home by the barge, charmed. The pantry stair goes down to the wine cellars; the spiral stair goes up to Seraphine\'s tower.',
  });
  b.prop('hearth-oven', 62, 23).prop('stove', 66, 23).props_('table-long', [[64, 27], [69, 27]]).prop('pot-rack', 71, 23).prop('butcher-block', 62, 31).props_('barrel-group', [[71, 32], [62, 28]]).prop('flour-sacks', 70, 30).prop('stair-spiral', 68, 22).light(66, 27, 5, 10);
  b.hall(62, 34, 62, 40, 1).hall(62, 40, 55, 40, 1).hall(55, 40, 55, 41, 1);
  b.prop('stairs-down', 62, 35);
  b.room('Wine cellars', 50, 42, 11, 13, {
    mat: 'dungeon-slab',
    read: 'Racks of dusty bottles run into the dark. Some racks hold wine. Others hold long glass jars of something darker, labelled with names and dates.',
    gm: 'Blood, bottled, from Lenford\'s missing (the labels match Perrin\'s list). The well stair goes down to the boat-cave; an iron door leads east to the family crypt.',
  });
  b.props_('wine-rack', [[51, 43], [51, 47], [51, 51], [58, 43], [58, 47]]).props_('barrel-stack', [[55, 44], [56, 52]]).prop('shelf-jars', 58, 51).prop('table-trestle', 54, 48).light(54, 48, 5, 10);
  b.tunnel([[55, 62], [55, 55]], 1, { seed: 45, mat: 'cave-floor' });
  b.area('The well stair', [[55, 55, 1, 7]], {
    read: 'A tight spiral stair, slick with river damp, climbs through the living rock.',
    gm: 'From the boat-cave to the wine cellars. Anyone climbing in armour makes noise: the cellars hear them unless they succeed on a DC 13 Dexterity (Stealth) check.',
  });
  b.hall(61, 48, 63, 48, 1, { mat: 'dungeon-slab' });
  b.door(60, 48, 'e', 'locked', 'door-iron');
  b.room('Velbrand family crypt', 64, 43, 13, 12, {
    mat: 'dungeon-slab',
    read: 'A grand crypt of marble tombs, each carved with the face of a Velbrand lord: grandfather, father, son. All the faces are the same face.',
    gm: 'A decoy: every tomb is Aurelien under another name, all empty. The coffin on the central bier is the one he wants hunters to find. Three wraiths and four wights guard it. If Aurelien\'s true coffin in Lenford was not destroyed, the heroes may waste time here. A secret door behind the bier (DC 16 Perception) hides the bride-price vault.',
  });
  b.props_('sarcophagus-effigy', [[66, 45], [70, 45], [74, 45], [66, 52], [74, 52]]).prop('coffin', 70, 49).props_('candle-stand-tall', [[68, 49], [72, 49]]).prop('statue-tall-robed', 70, 53).light(70, 49, 5, 15, '#ff7a7a');
  b.encounter('The decoy crypt', [64, 43, 13, 12], [['wraith', 3], ['wight', 4]], 'low');
  b.hall(70, 55, 70, 56, 1);
  b.door(70, 54, 's', 'secret');
  b.room('Bride-price vault', 66, 57, 10, 6, {
    mat: 'dungeon-slab',
    read: 'Chests and coffers, stacked high. Jewellery spills out of an open box: necklaces, tiaras, wedding rings, hundreds of wedding rings.',
    gm: 'Three centuries of Velbrand money, and the rings of every bride. See the treasure in the scene. Returning the rings to Lenford\'s families is worth more than gold to them.',
  });
  b.props_('chest', [[67, 58], [74, 58]]).prop('coin-stacks', 70, 59).prop('jewelry-box', 72, 61).prop('strongbox', 67, 61).prop('crown-cushion', 74, 61).light(70, 59, 5, 10, '#ffd27a');

  // the chasm, the sky bridge and the bridal chapel
  b.pit(20, 2, 7, 16);
  b.floor(20, 9, 10, 2, 'stone-cobble');
  b.door(30, 9, 'w', 'closed', 'door-double').door(30, 10, 'w', 'closed', 'door-double');
  b.area('The sky bridge', [[20, 9, 10, 2]], {
    read: 'A stone bridge with no rail, a single span over a black chasm. Wind howls up out of the dark and tugs at your clothes. Ahead, the chapel\'s great round window glows red.',
    gm: 'Fighting on the bridge: anyone shoved or knocked prone makes a DC 14 Dexterity save or falls (the chasm is 200 feet deep; a fall is death unless someone can fly or catch them). Aurelien crosses as a cloud of bats if he must.',
  });
  b.props_('lantern-standing', [[22, 9], [27, 10]]).light(22, 9, 5, 10).light(27, 10, 5, 10);
  b.wallRun(19, 2, 16, 'e');
  b.door(19, 9, 'e', 'closed', 'door-double').door(19, 10, 'e', 'closed', 'door-double');
  b.room('Bridal chapel', 4, 2, 16, 16, {
    mat: 'marble',
    read: 'A tall chapel at the very top of the crag. A round window of red glass glows behind the altar like a rising sun. A circle of red runes is set into the floor before it, and the groom waits inside it, smiling, holding a silver cup.',
    gm: 'The rite of three vows, at midnight. See the scene. The east doors open to the sky bridge; the vestry\'s secret door leads to the bride-path.',
  });
  b.wallRun(4, 13, 6, 's').wallRun(9, 14, 4, 'e').door(7, 13, 's', 'closed');
  b.area('Vestry', [[4, 14, 6, 4]], {
    read: 'A cramped room of robes and candles. A wedding veil sixty years old hangs on a hook, yellow with age.',
    gm: 'Margery\'s veil: she tore it off here and ran. The secret door in the floor-level panel (DC 14 to find from inside) opens on the bride-path.',
  });
  b.prop('wardrobe', 5, 15).prop('candles', 8, 16).prop('coat-rack', 4, 17);
  b.door(7, 17, 's', 'secret');
  b.prop('altar-reredos', 5, 8).prop('window-stained-tall', 4, 9).prop('magic-circle', 9, 9).props_('pew', [[13, 4], [13, 6], [13, 12], [16, 4], [16, 6], [16, 12]]).props_('candelabra-grand', [[6, 4], [6, 12]]).prop('font', 9, 5).prop('statue-tall-winged', 18, 3).prop('organ-cathedral', 18, 15).prop('rug-runner', 14, 9);
  b.light(6, 9, 15, 25, '#ff4a4a').light(14, 9, 10, 15, '#ff9a6a');
  b.encounter('The wedding at midnight', [4, 2, 16, 12], [['vampire', 1], ['vampire-spawn', 2], ['wight', 2]], 'high');
  return b.build();
}

export const VAMPIRE_WEDDING: Adventure = {
  id: 'vampire-wedding',
  title: 'The Velbrand Wedding',
  tagline: 'A gothic wedding in a misty river valley, where the groom has not aged in sixty years and the vows are written in blood.',
  levels: '9-11',
  sessions: '3-4 sessions',
  players: '3-5 players',
  tags: ['mini-campaign', 'gothic horror', 'vampires', 'intrigue', 'wedding'],
  pitch:
    'The Lenn runs through a valley so misty that the castle on the Gallowcrag seems to float. Its lord, the young and handsome Aurelien Velbrand, is to marry Celandine Calloway, heir of old Thornmere House, and the whole valley is invited. So are you. There will be a ball on the eve, a feast in the village, and a midnight wedding in the castle chapel. The invitation is written in a beautiful hand, in ink the colour of dried roses.',
  secret:
    'Aurelien Velbrand is a vampire, three hundred years old. He has been his own grandson, son and nephew for centuries, and lord of the Gallowcrag the whole time. The first Calloway made a compact with the River Lenn: the river answers Thornmere\'s heir, and all who drink from it belong to the valley. If a vampire weds the heir by the Rite of Three Vows, blood for blood at midnight in his chapel, every soul who drinks the Lenn becomes his thrall and the valley\'s mist becomes his eyes. Sixty years ago he courted the heir, Margery Calloway. She fled the altar on her wedding night and gave up her claim; he took her younger sister Seraphine instead, the rite failed, and Seraphine became his spawn, now posing as his mother. The heir\'s blood passed down to Celandine, and this year Aurelien bought up all of her father\'s debts. The wedding is in two nights. His true coffin lies in the vault under Lenford\'s Old Kirk, where he was buried as a mortal; unless it is destroyed, he cannot truly die.',
  hooks: [
    'Lord Humphrey Calloway invites the heroes as honoured guests: famous names at the wedding prove Thornmere is still somebody. (In truth Margery added their names to the list. She wants protectors and won\'t say why.)',
    'Perrin Sable, a minstrel hired for the ball, writes to the heroes: his sister vanished from Lenford last spring, along with twenty other people, and the trail leads to the Velbrands. He can pay 500 gp, all he has.',
    'Sister Wilhelmina of Lenford\'s Dawn shrine asks the heroes to come to the wedding as her guards: the dead in Lenford\'s graveyard are not staying buried, and she will be at Thornmere to bless the couple.',
  ],
  tips: [
    'Three nights, three parts: the ball at Thornmere (night 1), Lenford and the crypts (day and night 2), the wedding at the Gallowcrag (night 3, midnight). Say the time often. Midnight on night 3 is the deadline.',
    'Part 1 is a party first and a horror story second. Let the players dance, gossip and snoop. Reveal the truth in layers: the mirror, the portrait, Margery\'s scream, the bite marks, the coffins under the chapel.',
    'Aurelien does not fight before the wedding. If cornered in part 1 or 2 he becomes mist, laughs and leaves. He wants the heroes at the wedding: he thinks they will make fine thralls.',
    'Use the vampire\'s weaknesses from its stat block (sunlight, running water, invitations, a stake in the heart). Holy water, the sun blade and daylight are the players\' best friends: let them plan raids by day.',
    'Keep two counts the players can see: thralls freed (the fewer charmed guests in part 3, the better) and whether the true coffin in Lenford is destroyed (if not, Aurelien escapes as mist when beaten).',
    'Level up between parts: 10 for Lenford, 11 for the castle. A short rest is easy to find between scenes; a long rest costs a night the heroes do not have.',
  ],
  npcs: [
    {
      id: 'pf_vwdcelandine', name: 'Celandine Calloway', title: 'the bride', kind: 'npc', art: 'princess', monsterId: 'noble', shared: true,
      wants: 'To save her father from ruin without losing herself. And, though she will not say it, to run.',
      knows: 'She has dreamed of a man at her window every night for a month. She remembers inviting him in.',
      voice: 'Bright and quick, a little too cheerful. Goes very still and quiet when frightened.',
      appearance: 'Nineteen, freckled, chestnut hair pinned with white roses, and a high lace collar she never takes off.',
      backstory: 'The last of the Calloway heirs. Raised on her great-aunt Margery\'s stories, never told the one that mattered.',
      gmNotes: 'Bitten twice. When Aurelien is within 60 feet she is charmed (his stat block) and defends him with words. A hero who reminds her of something true and hers (her mother, the river, Margery) lets her make a new DC 15 Wisdom save. In the chapel, her refusal of the third vow breaks the rite.',
    },
    {
      id: 'pf_vwdaurelien', name: 'Aurelien Velbrand', title: 'the groom, lord of the Gallowcrag', kind: 'monster', art: 'vampire', monsterId: 'vampire',
      wants: 'The heir\'s blood vow, and with it the river and every soul who drinks it.',
      knows: 'Every secret the mist has overheard in three hundred years. Margery\'s face, which he still loves in his way.',
      voice: 'Warm, slow baritone. Always says your name back to you. Never raises his voice.',
      appearance: 'Looks thirty: black hair with one white lock, grey eyes, a wedding coat of deep red velvet.',
      backstory: 'Three hundred years ago he was the young lord of Lenford. Dying of plague, he drank the blood of a stranger who promised he would never die. He was buried under the Old Kirk and rose a week later.',
      gmNotes: 'SRD vampire. Won\'t fight before the wedding: he leaves as mist or bats. In the chapel he fights to finish the rite. If his true coffin under the Old Kirk still exists, at 0 hit points he becomes mist and flees there; otherwise he is destroyed. He truly believes his rule would bring the valley peace.',
    },
    {
      id: 'pf_vwdseraphine', name: 'Seraphine Velbrand', title: '"the groom\'s mother"', kind: 'monster', art: 'vampire-spawn', monsterId: 'vampireSpawn',
      wants: 'Rest, at last. And to see her sister Margery once more before the end.',
      knows: 'Where Aurelien\'s true coffin lies, the order of the three vows, and that the bride\'s refusal breaks the rite.',
      voice: 'Soft and formal, with sudden flashes of a girl\'s laughter that she cuts off.',
      appearance: 'Looks forty: ash-blonde, mourning lace, eyes always red-rimmed as if about to cry. She never stands near a mirror.',
      backstory: 'Margery\'s younger sister. Sixty years ago she married Aurelien in Margery\'s place to save her family\'s honour. The rite failed, and he made her his spawn.',
      gmNotes: 'She cannot disobey a direct order from Aurelien, but she can leave doors unlocked and say things "by accident". Kindness, or a meeting with Margery, turns her. Destroying Aurelien frees her; she then asks the heroes to let her see one sunrise.',
    },
    {
      id: 'pf_vwdhumphrey', name: 'Humphrey Calloway', title: 'Lord of Thornmere, father of the bride', kind: 'npc', art: 'noble', shared: true,
      wants: 'His debts gone and his house saved. Deep down, his daughter safe.',
      knows: 'Velbrand\'s steward bought every one of his debts. The contract has a clause he did not understand. His aunt Margery will not speak of the Velbrands.',
      voice: 'Blustering and jolly, then a sudden ashamed whisper.',
      appearance: 'A big red-faced man of fifty in a coat a size too small, a white rose in his buttonhole.',
      gmNotes: 'Shown the truth (the coffins, the ledger), he breaks down and offers the heroes everything left in his strongbox to save Celandine. In part 3 he comes to the wedding anyway, half charmed, and can be woken to help.',
    },
    {
      id: 'pf_vwdmargery', name: 'Margery Calloway', title: 'dowager of Thornmere, the bride\'s great-aunt', kind: 'npc', art: 'sage', shared: true,
      wants: 'To stop the wedding without having to confess what she did sixty years ago.',
      knows: 'Aurelien has not aged a day. She fled him at the altar, and her sister took her place and never came home.',
      voice: 'Sharp, dry and very old. Taps her cane on every point she makes.',
      appearance: 'A tiny woman of eighty in black silk, half blind, with a silver sun pendant at her throat.',
      gmNotes: 'Grieve tries to carry her off on the first night. If she survives, she can come to the castle in part 3: Seraphine will turn at the sight of her, and Aurelien hesitates for one round when he sees her (he loses his first turn).',
    },
    {
      id: 'pf_vwdgrieve', name: 'Master Grieve', title: 'steward of House Velbrand', kind: 'npc', art: 'spy', monsterId: 'assassin',
      wants: 'To be made immortal, as he has been promised for twenty years.',
      knows: 'Everything practical: the debts, the barge, the guest list, the larder, the order of the wedding night.',
      voice: 'Precise and whispery. Calls everyone "honoured guest". Never blinks enough.',
      appearance: 'A thin grey man in black silk and grey gloves, with a smile that shows too many teeth.',
      gmNotes: 'A living man (assassin stat block). A coward without his master near: at half hit points he surrenders and sells secrets to save himself (DC 16 Intimidation gets the truth about Lenford\'s crypts and the true coffin).',
    },
    {
      id: 'pf_vwdperrin', name: 'Perrin Sable', title: 'a hired minstrel', kind: 'npc', art: 'bard', monsterId: 'spy', shared: true,
      wants: 'His sister Rosamund back from Lenford\'s missing, alive or laid to rest.',
      knows: 'Twenty-three people have gone missing in Lenford in a year. His sister was seen walking toward the Old Kirk at night. The Velbrand barge comes and goes from Lenford\'s mill.',
      voice: 'Quick patter and bad jokes, then suddenly raw and serious.',
      appearance: 'A lanky young man with a lute, mismatched earrings, and a sharpened ash stake hidden in his lute case.',
      gmNotes: 'Brave and reckless: he will try to stake a vampire alone at the ball unless stopped. Rosamund is in the thrall pens in part 2.',
    },
    {
      id: 'pf_vwdwilhelmina', name: 'Sister Wilhelmina Ashcroft', title: 'keeper of Lenford\'s Dawn shrine', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'Lenford\'s dead to stay buried and its living to wake up.',
      knows: 'The burial register, the old stories of a lord buried under the kirk, and how to bless water and weapons.',
      voice: 'Brisk and practical. Rolls up her sleeves before every hard job.',
      appearance: 'A stout woman of sixty with cropped grey hair, smelling of candle smoke.',
      gmNotes: 'Priest stat block. Gives holy water and blessings (see the Dawn shrine). She will come to the wedding to "perform the blessing", and can try to hold the doors of the chapel against the spawn.',
    },
    {
      id: 'pf_vwdagnes', name: 'Agnes Mortlake', title: 'sexton of Lenford', kind: 'npc', art: 'commoner', shared: true,
      wants: 'Her grandson Corwyn freed from the thrall pens, and never to dig another grave by night.',
      knows: 'The three ways down to the crypts: the kirk stair, the mausoleum\'s hidden stair, and the old culvert from the marsh.',
      voice: 'Gravel and mumbles. Swears at the dead like old friends.',
      appearance: 'A wiry old woman with earth under every nail, leaning on a spade like a staff.',
      gmNotes: 'Ashamed and angry. She guides the heroes as far as the crypt door and no further, unless they promise to bring Corwyn out.',
    },
  ],
  handouts: [
    { id: 'invitation', title: 'An invitation in rose-coloured ink', text: 'The House of Velbrand and the House of Calloway request the honour of your presence at the marriage of\nAurelien Velbrand, Lord of the Gallowcrag,\nand Celandine Calloway, heir of Thornmere.\nA ball at Thornmere House on the eve.\nThe vows at midnight, in the chapel of the Gallowcrag.\nCome as you are. Stay as long as you like.' },
    { id: 'marriage-contract', title: 'The marriage contract (clause the ninth)', text: 'IX. The bride shall bring to the marriage her blood and her name, and the waters of the Lenn that answer to them, and shall speak the three vows of the House of Velbrand freely and at midnight. In return all debts of Thornmere are forgiven, now and for ever, and the House of Calloway shall want for nothing so long as the river runs.' },
    { id: 'margery-letter', title: 'A letter never sent, found in the priest hole', text: 'Sera, forgive me. He asked for blood and I saw his teeth. I ran from the chapel down the bride-path in my veil and I have been hiding in the wall for three days. They tell me you went up the crag in my place. Do not drink from his cup. Do not say the third vow. Whatever he has promised, do not say it. Your sister, M.' },
    { id: 'brides-ledger', title: 'The Velbrand ledger of brides', text: 'Brides of the Gallowcrag:\nAmice, of the Calloway cousins. Not the heir. Kept.\nJoan, of the Calloway cousins. Not the heir. Died.\nEleanor, second daughter. Not the heir. Kept.\n... (nine more names)\nSeraphine, second daughter. Not the heir. Kept.\nCelandine, THE HEIR. Midnight, at the dark of the moon.' },
    { id: 'kirk-register', title: 'From the Old Kirk\'s burial register', text: 'This day was buried young Lord Aurelien Velbrand, dead of the plague, in his own vault beneath this kirk, in the earth of his fathers. He was fair and young and much mourned.\n(In another hand, a week later:) The vault is open and the lord is gone. God keep Lenford.' },
    { id: 'rite-of-vows', title: 'The Rite of Three Vows', text: 'At midnight, within the circle, the cup between them.\nThe first vow: I give you my name.\nThe second vow: I give you my blood.\nThe third vow: I give you my river.\nThe bride must speak each vow freely. If she is silent or refuses, the circle breaks and the cup is spilled. If all three are spoken, the river is his for as long as it runs.' },
  ],
  chapters: [
    {
      id: 'thornmere', title: 'Part 1: The Wedding Eve', level: 9,
      summary: 'A grand ball at Thornmere House the night before the wedding: gardens, a hedge maze, a black barge, and slowly revealed horror as the groom\'s family show what they are.',
      goal: 'Find out what the Velbrands really are, protect Margery, and learn where their power lies.',
      map: thornmereHouse,
      npcs: [
        { npc: 'pf_vwdhumphrey', x: 38, y: 44 },
        { npc: 'pf_vwdcelandine', x: 26, y: 33 },
        { npc: 'pf_vwdaurelien', x: 40, y: 30 },
        { npc: 'pf_vwdseraphine', x: 40, y: 19 },
        { npc: 'pf_vwdmargery', x: 55, y: 33 },
        { npc: 'pf_vwdgrieve', x: 52, y: 32, hidden: true },
        { npc: 'pf_vwdperrin', x: 34, y: 24 },
        { npc: 'pf_vwdwilhelmina', x: 62, y: 12 },
      ],
      scenes: [
        { room: 'South gate', title: 'Arrival at Thornmere', read: 'The iron gates stand open, and the drive curves up through old oaks toward a house blazing with candles. Mist is rising off the river behind it. Somewhere a string quartet is tuning up.', gm: 'Open an hour before sunset. Humphrey greets the heroes in the entrance hall, nervous and loud. Hand out the invitation. Let them settle, meet Celandine and Perrin, and hear rumours on the river lawn: the barge, the missing in Lenford, the maid who went for ice.', handout: 'invitation' },
        { room: 'Forecourt', title: 'The black coach', read: 'At the last light, a black coach rolls up the drive behind four black horses, and every other horse in the forecourt screams. A grey steward opens the door. Out steps the groom, handsome and smiling, and a lady in mourning lace who will not look at the house.', gm: 'Aurelien, Seraphine and Grieve. Aurelien waits at the door to be asked in; Humphrey does it without thinking (a DC 13 Insight notices the pause). Dogs bark, then whimper and hide.' },
        { room: 'Portrait gallery', title: 'He has not aged a day', gm: 'The guests admire the groom\'s gift: a portrait of "his grandfather". Margery is wheeled past, sees portrait and man side by side, and screams. Humphrey hurries her away, mortified. Grieve watches her go. This sets the abduction at midnight in motion.' },
        { room: 'The ballroom', title: 'The wedding-eve ball', read: 'The chandeliers blaze, the waltz begins, and the groom offers his hand to whoever is nearest. His fingers are cold through his glove. Behind him, in the tall mirror, the dancers turn in an empty room.', gm: 'The heart of part 1. Each hero picks someone to dance with: Aurelien (DC 16 Wisdom save or charmed until the dance ends; on a success they feel the pull and know it for magic), Seraphine (she whispers "do not let her drink from the cup"), a Velbrand cousin (cold, hungry, asks where Margery sleeps), or Celandine (she is happy, too happy, and her collar slips). Exposing the cousins publicly starts the fight; quietly telling Humphrey or the Sister is smarter.', encounter: 'Unmasked at the ball' },
        { room: "Celandine's chambers", title: 'The bride\'s window', gm: 'If the heroes talk to Celandine alone. She laughs off the bite marks, then cries. She will not call off the wedding: the debts would ruin her father. If shown proof (the ledger, the coffins) she asks the heroes to stop it without shaming her family.', optional: true },
        { room: "Lord Calloway's study", title: 'Clause the ninth', gm: 'The contract and the debts. Humphrey, confronted, admits Grieve bought everything. A DC 14 Arcana sees the contract is also a binding: signing it gave the Velbrands welcome in Thornmere forever.', handout: 'marriage-contract', treasure: 'Humphrey\'s strongbox: 180 gp and his late wife\'s pearl necklace (250 gp), which he will give the heroes if they save Celandine.' },
        { room: 'Priest hole', title: 'Sixty years in the wall', optional: true, gm: 'Found by searching the library or shown by Margery after the abduction. Her letter tells the whole old story in a few lines.', handout: 'margery-letter' },
        { room: 'Hedge maze', title: 'The bride\'s walk', encounter: 'Hounds in the maze', gm: 'Celandine wants to walk the maze to the folly ("my aunt\'s favourite place"); Seraphine suggested it. The huntsman spawn and his dire wolves wait to take the bride\'s companions apart. At the folly: the carved initials and the old calling card.' },
        { room: 'The black barge', title: 'The black barge', optional: true, encounter: 'Rats on the black barge', gm: 'The barge\'s cargo of grave earth and its log point to Lenford\'s Old Kirk.', treasure: 'A purse of 240 gp in old Velbrand crowns, and the barge\'s log.' },
        { room: 'Guest chambers', title: 'Midnight: the footmen come for Margery', encounter: 'The footmen come for Margery', gm: 'At the stroke of midnight Grieve and four charmed footmen try to carry Margery off down the back stair to the coach. If the heroes are elsewhere, have a terrified maid run to fetch them. Saved, Margery tells them everything she knows.', treasure: 'Grieve\'s purse (120 gp), a vial of poison, and his keys, including one to the chapel crypt.' },
        { room: 'Icehouse', title: 'The maid who went for ice', encounter: 'Ghouls in the icehouse', gm: 'The kitchen maid is dead. Her killers came up the hidden tunnel from the chapel crypt, which the heroes can follow north.', treasure: 'The maid\'s locket, to return to the cook.' },
        { room: 'Coffins beneath the chapel', title: 'Coffins beneath the chapel', encounter: 'Coffins beneath the chapel', gm: 'The climax of the night. By day the spawn are helpless in their coffins; by night they fight to the end. The ledger names every bride and the deadline. The founder\'s tomb in the next crypt holds the mace.', handout: 'brides-ledger', treasure: 'A mace of disruption (the founder\'s tomb), 2 potions of superior healing, a cloak of protection on the wight, and 400 gp of jewellery from the Velbrands\' victims.' },
      ],
      wrapUp: 'By dawn the heroes know what the Velbrands are, Margery is safe (or taken), and the trail of grave earth leads to Lenford\'s Old Kirk. Aurelien departs at first light, unhurried, and the wedding is still on: Humphrey is too deep in debt to call it off, and Celandine is too charmed to want to. The heroes reach level 10.',
    },
    {
      id: 'lenford', title: 'Part 2: The Village of the Missing', level: 10,
      summary: 'Lenford by day and by night: a frightened village, bitten thralls, a graveyard dug up from below, and the crypts under the Old Kirk where the elder lies.',
      goal: 'Free the thralls and find and destroy Aurelien\'s true resting place before the wedding night.',
      map: lenford,
      npcs: [
        { npc: 'pf_vwdperrin', x: 12, y: 38 },
        { npc: 'pf_vwdwilhelmina', x: 37, y: 37 },
        { npc: 'pf_vwdagnes', x: 42, y: 15 },
        { npc: 'pf_vwdseraphine', x: 51, y: 40, hidden: true },
      ],
      scenes: [
        { room: 'Market square', title: 'Shutters at noon', read: 'Lenford is silent at midday. Every shutter is closed, every door hung with garlic. On the notice board, paper after paper says the same word: missing.', gm: 'Rumours (one per villager won over): the Velbrand barge lands at the mill; the dead dig out of their graves; "the lady in lace" walks the street at night and knocks; Agnes the sexton digs graves after dark; the Old Kirk was built over an older tomb. Perrin is at the inn.' },
        { room: 'Dawn shrine', title: 'Holy water and blessings', gm: 'Sister Wilhelmina arms the heroes: holy water and a blessing for the wedding night. She sends them to Agnes for the keys.', treasure: 'Two flasks of holy water per hero and a potion of greater healing each from the shrine\'s stores.' },
        { room: "Sexton's cottage", title: 'The sexton\'s shame', gm: 'Agnes confesses: she has dug for the Velbrand men all year. She knows the three ways down and draws them on the table in spilled ale. Her price: bring out her grandson Corwyn.' },
        { room: 'The mill', title: 'The pantry', encounter: 'Thralls at the mill', gm: 'A daytime raid is easier: the two spawn hide from the sun in the dark loft, and light through a torn shutter burns them. The eight thralls fight for their masters. Freed thralls remember the pens below the kirk.' },
        { room: 'Old graveyard', title: 'Graves dug from below', encounter: 'Ghouls among the graves', read: 'The sun goes down behind the hills, and in the graveyard the earth of an open grave shifts. A grey hand reaches up and grips the edge.', gm: 'At dusk the ghouls rise. Fighting them here alerts the kirk\'s wights unless the party is quick (three rounds).' },
        { room: 'Velbrand mausoleum', title: 'The lady in lace', optional: true, gm: 'If the heroes spoke kindly to Seraphine or sent word, she waits here at dusk. She cannot betray Aurelien outright, but she says "his bed is very old and very deep, beneath the stair he built" and shows them the mausoleum\'s hidden catch. She asks after Margery.' },
        { room: 'The Old Kirk', title: 'The patrons of the kirk', encounter: 'Wights in the Old Kirk', gm: 'Old Lenford lords, raised as wights, and a wraith in a bishop\'s mitre. The vestry holds the burial register.', handout: 'kirk-register', treasure: 'A silver censer (150 gp) and the kirk\'s old plate (200 gp).' },
        { room: 'The ossuary', title: 'Names in the bones', encounter: 'The ossuary', gm: 'Speaking the names of the missing lays specters to rest. Perrin\'s list makes this easy. The secret door to the chantry is here.', treasure: 'A gem-set reliquary (250 gp).' },
        { room: 'Culvert sump', title: 'The culvert', optional: true, encounter: 'Things in the culvert', gm: 'The back way in, from the marsh to the thrall pens. Good for sneaking or for getting freed thralls out.' },
        { room: "Dawn-knight's chantry", title: 'The blade of dawn', optional: true, gm: 'The knight\'s sealed chapel. A hero who wakes the hilt gets the sun blade: the best weapon in this adventure against Aurelien.', treasure: 'A sun blade and a periapt of wound closure.' },
        { room: 'The thrall pens', title: 'The thrall pens', encounter: 'The thrall pens', gm: 'Free the villagers. Rosamund and Corwyn are here, alive and smiling. Charmed thralls step in front of the heroes\' attacks: a hero who wants to avoid hitting them can take disadvantage instead.' },
        { room: "The elder's vault", title: 'The elder\'s bed', encounter: "The elder's vault", gm: 'The climax of part 2. Destroy the earth and the coffin and Aurelien can be killed for good. A bell rings in the castle when it happens: he knows, and is afraid for the first time in three hundred years.', handout: 'rite-of-vows', treasure: '1,200 gp in grave goods, bracers of defense, and the wedding rings of the twelve earlier brides (return them in part 3 to lay the ghosts in the gallery).' },
      ],
      wrapUp: 'With the thralls freed and the true coffin destroyed, Aurelien is mortal in the only way that matters. But Celandine is already on her way to the Gallowcrag, and the wedding is tonight. The heroes reach level 11.',
    },
    {
      id: 'gallowcrag', title: 'Part 3: Midnight on the Gallowcrag', level: 11,
      summary: 'The wedding night at Castle Velbrand: a road of wolves, a courtyard of charmed guests, the last dance, the gallery of brides, and the rite of three vows in a chapel on the top of the crag.',
      goal: 'Reach the chapel before midnight, stop the third vow, and destroy Aurelien Velbrand.',
      map: castleVelbrand,
      npcs: [
        { npc: 'pf_vwdaurelien', x: 9, y: 9 },
        { npc: 'pf_vwdseraphine', x: 66, y: 6 },
        { npc: 'pf_vwdcelandine', x: 65, y: 5 },
        { npc: 'pf_vwdgrieve', x: 40, y: 14, hidden: true },
        { npc: 'pf_vwdhumphrey', x: 36, y: 12 },
        { npc: 'pf_vwdperrin', x: 46, y: 14 },
        { npc: 'pf_vwdwilhelmina', x: 6, y: 64 },
      ],
      scenes: [
        { room: 'River landing', title: 'Guests of the Gallowcrag', read: 'Carts of villagers creak up to the landing, every face smiling in the lantern light, every eye glassy. A bell tolls on the crag above. It is eleven o\'clock.', gm: 'One hour to midnight. Three ways up: walk the road with the guests (easiest, watched), row to the boat-cave (wet, quiet), or climb (DC 18 Athletics, three checks, no). The Sister comes with them if alive.' },
        { room: 'The switchback road', title: 'The huntsmen', encounter: 'Wolves on the switchback', gm: 'The werewolf huntsmen check every face. Pretending to be charmed works (DC 16 Deception per hero, or one hero\'s check with advantage if the Sister blesses them). The gibbet ledge holds a dead hunter\'s map.' },
        { room: 'Gatehouse', title: 'The gate wardens', encounter: 'Gate of the crag', gm: 'Wights in livery. Guests pass; troublemakers do not. Grieve (if alive) checks names at the gate and knows the heroes\' faces.' },
        { room: 'Outer bailey', title: 'The silent congregation', read: 'The courtyard is full of people in their wedding best, standing in rows, smiling at nothing. Not one of them speaks. From the great hall comes music, and laughter that is not quite human.', gm: 'Count the thralls: fewer if the heroes freed them in part 2. Freeing one here takes an action. The rookery tower on the west hides the bride-path.' },
        { room: 'Great hall', title: 'The last dance', encounter: 'The last dance', gm: 'Aurelien asks the heroes to dance before he goes to his bride. He offers them a bargain: serve him and he will spare Thornmere and its people. If the true coffin was destroyed, he knows, and his smile is thin. At half past eleven he leaves by the sky bridge.' },
        { room: 'Gallery of brides', title: 'The brides who came before', optional: true, encounter: 'Brides in the gallery', gm: 'Return the rings from the elder\'s vault and the ghosts bless the heroes instead of fighting.' },
        { room: "Seraphine's tower", title: 'Dressing the bride', encounter: "Seraphine's handmaidens", gm: 'Celandine, charmed, is dressed for the altar. Seraphine turns if shown kindness or Margery. Whether she turns or not, the bride is taken over the sky bridge at a quarter to midnight.', treasure: 'A gem of brightness in Seraphine\'s jewel case (she gives it freely if she turns: "it was a wedding present, from my sister").' },
        { room: 'The rookery', title: 'The bride-path', optional: true, encounter: 'The rookery', gm: 'The secret way to the chapel vestry. Margery\'s M\'s mark the walls all the way up.' },
        { room: 'The boat-cave', title: 'Up through the rock', optional: true, encounter: 'The cloaker in the boat-cave', gm: 'The quiet way in from the river, up the well stair to the cellars.' },
        { room: 'Velbrand family crypt', title: 'The decoy crypt', optional: true, encounter: 'The decoy crypt', gm: 'A trap for hunters. If the true coffin is still in Lenford, a hero who thinks to ask (DC 15 Religion or Arcana) realises these tombs have never held earth.', treasure: 'Behind the secret door, the bride-price vault: 3,000 gp in coin and jewellery, a ring of free action, and three centuries of wedding rings.' },
        { room: 'The sky bridge', title: 'The bridge in the wind', gm: 'The bride\'s procession crosses at a quarter to midnight with two spawn. Fighting on the bridge is deadly for everyone. Aurelien does not wait.' },
        { room: 'Bridal chapel', title: 'The wedding at midnight', read: 'The bell strikes twelve. In the circle of red runes, the groom raises the silver cup and speaks in a voice that fills the chapel: "Celandine Calloway. Will you give me your name?"', encounter: 'The wedding at midnight', gm: 'The rite takes three rounds: on initiative 20 of each round Aurelien asks one vow and Celandine, if still charmed, answers. Breaking her charm (a DC 15 Wisdom save she makes when a hero spends an action reminding her who she is; advantage if Margery or Humphrey does it), dragging her out of the circle, or spilling the cup (AC 15, a DC 15 Dexterity check, or 10 damage to Aurelien\'s hand) breaks the rite. If the third vow is spoken, every charmed thrall in the castle fights for him and the mist rolls in. Then it is a fight to the end.', treasure: 'Aurelien\'s silver wedding cup (500 gp) and his signet, which opens the bride-price vault.' },
      ],
      wrapUp: 'If the rite is broken and Aurelien destroyed, the red window goes dark, the mist lifts off the Lenn for the first time in living memory, and the villagers in the bailey wake up confused in their best clothes. Seraphine asks to see the sunrise. The wedding guests go home.',
    },
  ],
  ending:
    'Good ending: the rite is broken, Aurelien is destroyed (his true coffin gone), Seraphine sees the sunrise from the chapel and turns to ash with Margery holding her hand, and Celandine, free, calls off the wedding herself. The valley forgives Thornmere\'s debts on its own: the bride-price vault pays them all. Bad ending: if the third vow is spoken, the valley is Aurelien\'s. Every soul who drinks the Lenn is his, and the heroes must flee the valley before they drink. They can come back, but now the river itself is against them. Half ending: if the true coffin survived, Aurelien escapes as mist to Lenford, and the heroes have two hours to beat him there. Next: Aurelien was not the first vampire to drink a stranger\'s blood in this valley. Who was the stranger?',
};
