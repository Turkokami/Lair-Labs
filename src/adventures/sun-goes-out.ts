// The Sun Goes Out: a five-part epic campaign for four heroes, levels 17 to 20.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

const NIGHT = '#6f7fd8';
const SUNLIGHT = '#ffd27a';
const FROST = '#bfe3ff';
const EMBER = '#ff9a3c';
const SHADE = '#8a6fd8';
const FIRE = '#ffb35c';

/** Floor with thin walls all round, for buildings that are split into several named areas. */
function shell(b: MapBuilder, x: number, y: number, w: number, h: number, mat: string) {
  b.floor(x, y, w, h, mat);
  b.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e');
  return b;
}

/** Walks a line of points square by square (never corner to corner) and stamps a w-wide square at each step. */
function along(pts: [number, number][], w: number, put: (x: number, y: number, w: number) => void) {
  const o = Math.floor(w / 2);
  for (let p = 0; p < pts.length - 1; p++) {
    const [ax, ay] = pts[p], [bx, by] = pts[p + 1];
    const n = Math.max(1, Math.abs(bx - ax), Math.abs(by - ay));
    let px = ax, py = ay;
    put(px - o, py - o, w);
    for (let s = 1; s <= n; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n);
      while (px !== x) { px += Math.sign(x - px); put(px - o, py - o, w); }
      while (py !== y) { py += Math.sign(y - py); put(px - o, py - o, w); }
    }
  }
}

/** A rough oval of something (rock for icebergs and the titan's skull), with a wobbling edge. */
function blob(cx: number, cy: number, rx: number, ry: number, seed: number, put: (x: number, y: number) => void, wob = 0.1) {
  const r = rng(seed);
  const k1 = 2 + Math.floor(r() * 3), k2 = 4 + Math.floor(r() * 4), p1 = r() * 6.28, p2 = r() * 6.28;
  for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++)
    for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const a = Math.atan2(dy, dx);
      const lim = 1 + wob * Math.sin(k1 * a + p1) + wob * 0.6 * Math.sin(k2 * a + p2);
      if (dx * dx + dy * dy <= lim * lim && x >= 0 && y >= 0 && x < 80 && y < 80) put(x, y);
    }
}

// ---------- Part 1: Solmere, the City of Noon ----------
function solmere() {
  const b = new MapBuilder('adv-sgo-solmere', 'Solmere, the City of Noon', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dim', wallStyle: 'stone' });

  // the old city wall on the west, and Crownhill's rock under the Heliodrome
  b.rock(0, 0, 1, 34).rock(0, 46, 1, 34);
  b.rock(49, 50, 31, 30).rock(45, 48, 11, 2);
  b.paint(44, 25, 36, 25, 'grass').paint(2, 59, 38, 21, 'grass').paint(2, 16, 18, 7, 'stone-flagstone').paint(48, 19, 31, 6, 'stone-flagstone');
  b.paint(18, 44, 18, 14, 'dirt').paint(2, 34, 6, 12, 'stone-flagstone');
  // the Sunwater, frozen hard in midsummer, with the fishers' holes broken in it
  along([[30, 0], [31, 14], [36, 26], [38, 40], [44, 54], [46, 66], [44, 79]], 5, (x, y, w) => b.floor(x, y, w, w, 'ice'));
  b.water(30, 5, 2, 2, true).water(35, 30, 2, 2, true).water(44, 60, 2, 2, true).water(43, 73, 2, 1, true);

  // ----- the West Gate and the Kingsway -----
  b.area('The West Gate', [[1, 34, 6, 12]], {
    read: 'It is midsummer, and your breath smokes. Frost furs the gate of Solmere, the City of Noon. The sun hangs low and copper-coloured over the roofs at what should be high noon, and it gives no warmth at all. Two guards stamp their feet by a brazier and stare at you as if you were the answer to a prayer.',
    gm: 'Arrival. Start the Daylight track at 8 hours. The guards know the heroes by reputation. Rumours (one per guard, or DC 12 Persuasion for more): the day is an hour shorter every day; the crops froze in the fields; the Royal Astronomer has not been seen for a week; the queen is in the palace "doing sums with the generals"; there is a white dragon sleeping on the Coldbridge.',
    label: [3, 39],
  });
  b.wallRun(1, 34, 5, 'n').wallRun(1, 45, 5, 's');
  b.start(2, 38, 3, 3);
  b.prop('gate-iron-tall', 1, 40).prop('brazier', 4, 36).prop('water-trough', 5, 35).prop('hitching-post', 5, 44).prop('barricade-wood', 3, 43).prop('notice-board', 6, 41).light(4, 36, 10, 20, FIRE);
  b.area('The Kingsway', [[7, 37, 25, 4]], { read: 'The broad main street is lined with shuttered shops. A line of carts piled with frozen cabbages waits for buyers who will never come.', gm: 'The main road east to the Kingsbridge. A town crier reads the queen\'s proclamation here every hour (handout).', label: [18, 38] });
  b.props_('lamp-post', [[10, 37], [18, 40], [26, 37]]).props_('cart', [[13, 39], [21, 38]], 90).prop('signpost', 30, 39).prop('produce-crates', 14, 37);
  for (const [x, y] of [[10, 37], [18, 40], [26, 37]]) b.light(x, y, 10, 20, FIRE);

  // ----- the Temple of the Morning -----
  shell(b, 3, 3, 18, 13, 'marble');
  b.wallRun(7, 3, 13, 'e').wallRun(3, 8, 5, 's');
  b.door(11, 15, 's', 'closed', 'door-double').door(12, 15, 's', 'closed', 'door-double').door(7, 5, 'e', 'closed').door(7, 12, 'e', 'secret').door(5, 8, 's', 'closed').door(20, 9, 'e', 'closed');
  b.wall(13, 3, 'n', 'window').wall(17, 3, 'n', 'window').wall(20, 5, 'e', 'window');
  b.area('Temple of the Morning', [[8, 3, 13, 13]], {
    read: 'The great sun-temple of Solmere is dark. Ten thousand candles stand unlit. The golden sun-disc above the altar has gone the grey of a dead coal, and the cold in here is deeper than outside. Something moves along the ceiling, like a cloak drifting in water.',
    gm: 'The temple\'s eternal flame went out nine days ago and the dark crept in to fill it. Six wraiths (sun-priests who froze at their prayers) and two cloakers nest here. Relighting the eternal flame on the altar (a fire spell or any flame, then DC 18 Religion to say the dawn-prayer right) fills the temple with gold light: the wraiths flee, and the cloakers take 4d8 radiant damage and fall from the ceiling. The high priest\'s body sits in the front pew, frozen, holding a half-written letter to the queen.',
    label: [14, 9],
  });
  b.area('Vestry of Candles', [[3, 3, 5, 6]], { gm: 'Vestments, ten thousand spare candles and the temple\'s alms chest (1,200 gp). The priests\' daybook: "The flame dimmed every dusk this month. Brother Gerent says the stars over the Heliodrome have moved."' });
  b.area('Reliquary of the First Dawn', [[3, 9, 5, 7]], { read: 'A tiny vault behind a hidden door. On a velvet cushion lies a sword whose blade is not there: only a golden hilt, warm to the touch.', gm: 'Found by DC 20 Perception (a draught at the panel) or by a priest of the sun. The relic is a sun blade, kept since the founding of Solmere "until the morning needs a hand". The temple will gladly give it to the heroes.' });
  for (const y of [8, 10, 12]) b.props_('pew', [[10, y], [12, y], [16, y], [18, y]]);
  b.prop('altar-reredos', 14, 4).prop('altar', 14, 5).props_('candelabra-grand', [[11, 5], [17, 5]]).props_('column-fluted', [[9, 4], [19, 4], [9, 14], [19, 14]]).prop('brazier-everburning', 14, 7, 0, { off: true }).prop('skeleton-seated', 13, 8);
  b.prop('wardrobe', 4, 4).prop('candles', 6, 4).prop('chest', 4, 7).prop('coat-rack', 6, 7);
  b.prop('reliquary', 5, 11).prop('plinth-display', 4, 14).prop('prayer-kneeler', 5, 13).prop('sconce-witchfire', 6, 10);
  b.light(14, 6, 5, 15, NIGHT).light(5, 12, 5, 10, SUNLIGHT);
  b.encounter('Shadows in the temple', [8, 3, 13, 13], [['wraith', 6], ['cloaker', 2]], 'low');
  b.area('Temple Close', [[3, 16, 16, 7]], { read: 'A paved square in front of the temple. The fountain has frozen in mid-splash into a lace of ice. People kneel on the stones and pray to a sun that does not answer.', gm: 'A crowd of worshippers. A child asks the heroes if the sun is dying "because we were bad". How the heroes answer sets the city\'s mood (and gives Inspiration for a good answer).', label: [10, 19] });
  b.prop('fountain', 11, 19).props_('bench', [[5, 18], [16, 18]]).prop('statue-tall-robed', 4, 21).prop('road-shrine', 17, 21).props_('candles', [[7, 20], [14, 21]]).light(11, 19, 10, 15, FIRE);

  // ----- the Last Granary and Bread Square -----
  b.building('The Last Granary', 20, 16, 8, 7, {
    mat: 'wood-planks',
    read: 'The city granary. Its doors are chained and a line of soldiers stands in front of them. Behind the soldiers, a crowd. Behind the crowd, more crowd.',
    gm: 'Half full, and the queen has ordered it opened only on her word. The guard sergeant will open it for the heroes if they carry the queen\'s seal. DC 17 Investigation of the sacks: someone has been stealing grain out of the back and leaving cult tokens (a black disc with a hole in it) in the empty sacks.',
    doors: [[23, 22, 's', 'locked'], [27, 18, 'e', 'closed']], windows: [[20, 19, 'w']],
  });
  b.props_('flour-sacks', [[21, 17], [22, 17]]).prop('produce-crates', 26, 17).prop('sack', 21, 21).prop('scales', 24, 19).prop('barrel-group', 26, 21).prop('handcart', 24, 23).light(24, 19, 5, 10, FIRE);
  b.building('Hearthloaf Bakery', 2, 24, 6, 8, {
    mat: 'brick-floor',
    read: 'The ovens are hot and the shelves are empty. The baker sits on a flour sack with a cleaver in her lap, watching the door.',
    gm: 'Bakes the last of the flour. She has been threatened twice. She saw "lamplighters in black" handing out bread with tokens baked in it to the angriest men in the square.',
    doors: [[7, 27, 'e', 'closed']], windows: [[4, 24, 'n']],
  });
  b.prop('hearth-oven', 3, 25).prop('bread-rack', 5, 25).prop('kitchen-table', 4, 28).prop('flour-sacks', 3, 30).light(3, 25, 5, 15, FIRE);
  b.area('Bread Square', [[8, 24, 16, 12]], {
    read: 'Hundreds of people pack the market square, shouting for bread. Someone has dragged a cart across the granary road as a barricade. A man in a lamplighter\'s black coat stands on it and yells that the queen is hoarding the grain and the sun has turned its back on the crown.',
    gm: 'The cult of the Unlit is turning hunger into a riot. The "lamplighters" are two assassins, two mages and four cult fanatics. If the heroes fight in the crowd, every area spell hits townsfolk. Better ways: open the granary with the queen\'s word, out-speak the agitator (DC 20 Persuasion or Intimidation; advantage if the heroes have food to give), or spot the bread tokens (DC 16 Insight on the agitator) and show the crowd. Exposed, the cultists flee toward the river and fight only if cornered.',
    label: [15, 30],
  });
  b.props_('market-stall', [[10, 25], [14, 25], [20, 25], [10, 34], [20, 34]]).prop('produce-stall', 17, 31).prop('well', 15, 28).prop('barricade-wood', 13, 34).prop('cart', 22, 29).prop('notice-board', 9, 30).prop('crate-pile', 22, 27).prop('fire-bowl', 12, 28).prop('banner-pole', 17, 24);
  b.light(12, 28, 10, 20, FIRE).light(20, 33, 5, 15, FIRE);
  b.encounter('The Unlit in Bread Square', [8, 24, 16, 12], [['assassin', 2], ['mage', 2], ['cultFanatic', 4]], 'low');
  b.building('The Last Candle', 24, 26, 8, 9, {
    mat: 'wood-planks-dark',
    read: 'A low tavern crammed with people wearing every coat they own. The innkeeper has lit one candle in the window, "so the sun can see we are still here".',
    gm: 'A safe place to rest and hear rumours. A drunk lamplighter (a real one) says the Lamplighters\' Guild has new members who never come to the hall in daylight. A sailor from the north says the sea has frozen "all the way out", and that the frost giants are walking on it.',
    doors: [[27, 34, 's', 'closed'], [24, 30, 'w', 'closed']], windows: [[31, 28, 'e'], [26, 26, 'n']],
  });
  b.prop('bar-counter', 29, 28).prop('keg-rack', 30, 27).props_('table-round', [[26, 29], [26, 32]]).props_('chair', [[25, 29], [27, 29], [25, 32], [27, 32]]).prop('fireplace', 25, 27).prop('dartboard', 31, 32).prop('stair-spiral', 30, 33).prop('candles', 31, 30).light(25, 27, 10, 20, FIRE);

  // ----- the frozen Sunwater and its bridges -----
  b.floor(26, 11, 11, 3, 'stone-flagstone');
  b.area('The Coldbridge', [[26, 10, 11, 5]], {
    read: 'The old stone bridge is buried under a white drift that rises and falls, slowly. Then the drift opens one blue eye.',
    gm: 'An adult white dragon came south following the cold, and likes it here. It is no servant of the night: it is a beast enjoying the weather. It can be talked away (it speaks Common and Draconic): tell it the coldest place in the world is the Whitewake in the north (true), or feed it (a whole cow, from the palace kitchens) and it simply leaves. If fought, it fights to half its hit points then flies north.',
    label: [31, 12],
  });
  b.props_('statue-tall-knight', [[26, 11], [36, 13]]).props_('snowdrift', [[29, 11], [33, 13]]).prop('skull-bleached', 31, 13).light(26, 11, 5, 10, FROST);
  b.encounter('The white wyrm on the Coldbridge', [26, 9, 11, 7], [['adultWhiteDragon', 1]], 'low');
  b.floor(32, 38, 11, 4, 'stone-flagstone');
  b.area('The Kingsbridge', [[32, 38, 11, 4]], { read: 'A wide bridge of white stone carved with suns. Below it the Sunwater is frozen so hard that children have cut a slide down the middle.', gm: 'The main way to Crownhill, guarded by the queen\'s soldiers at the east end. The heroes are waved through.', label: [37, 39] });
  b.props_('lamp-post', [[32, 38], [42, 41]]).prop('statue-tall-winged', 37, 41).light(32, 38, 10, 20, FIRE).light(42, 41, 10, 20, FIRE);
  b.area('The Frozen Sunwater', [[33, 18, 5, 18]], { read: 'The river has frozen solid in midsummer. Fishers squat by holes in the ice. Down the middle, a few brave souls hold a sad little ice fair: roasted chestnuts and a fiddler with no gloves.', gm: 'The ice holds a horse anywhere except at the holes (DC 12 Perception to spot thin ice). The fishers say the fish under the ice all swim south, toward Crownhill, "as if something calls them". DC 18 Arcana on the water: it is cold because something under the hill is drinking warmth.', label: [35, 24] });
  b.props_('ice-thin', [[31, 7], [34, 29]]).props_('fishing-gear', [[33, 22], [36, 32]]).prop('rowboat', 34, 19, 90).prop('campfire', 36, 26).light(36, 26, 5, 15, FIRE);

  // ----- Goldsmiths' Row and House Kestrane -----
  b.building('The Gilded Hour', 38, 2, 10, 7, {
    mat: 'wood-planks',
    read: 'The finest inn in Solmere is full of nobles in fur, drinking hot wine and pretending nothing is wrong. A harpist plays. Nobody listens.',
    gm: 'The rich are packing to flee south. Lady Vantreuil, the astronomer\'s neighbour, mentions over wine that Isaura Kestrane "has been strange since her little boy died last winter", and that lights burn in House Kestrane at night though it is meant to be empty.',
    doors: [[42, 8, 's', 'closed', 'door-double'], [43, 8, 's', 'closed', 'door-double']], windows: [[38, 5, 'w'], [47, 5, 'e']],
  });
  b.prop('bar-counter', 45, 3).prop('harpsichord', 39, 3).props_('table-round', [[41, 5], [44, 6]]).prop('fireplace', 46, 7).prop('chandelier', 42, 4).prop('sofa', 39, 6).light(46, 7, 10, 20, FIRE);
  b.building('House Kestrane', 43, 11, 6, 6, {
    mat: 'wood-planks-dark',
    read: 'A narrow, tall house with star-shaped windows. Inside, every mirror is covered with black cloth. In the nursery the bed is made, the toys are put away, and a candle burns beside a small portrait of a smiling boy.',
    gm: 'Isaura\'s home. Locked (DC 20 Thieves\' Tools). On her desk, a letter in a beautiful hand that is not hers (handout: the Lampwarden\'s promise). The boy, Cael, died of a winter fever. DC 15 Insight: this is not a villain\'s house, it is a grieving mother\'s. That knowledge can end the last fight of this part without blood.',
    doors: [[45, 11, 'n', 'locked']], windows: [[48, 13, 'e']],
  });
  b.prop('writing-desk', 44, 12).prop('bed', 47, 15).prop('crib', 44, 15).prop('candles', 46, 15).prop('mirror', 47, 12).prop('bookshelf', 44, 14).light(46, 15, 5, 10, FIRE);
  b.area("Goldsmiths' Row", [[36, 10, 7, 9]], { read: 'Rich houses with gilded gutters. Half have their shutters nailed shut; carts are being loaded in the street by servants with blue fingers.', gm: 'Where the Coldbridge lands. Quiet. Footprints in the frost lead from House Kestrane toward the Heliodrome, every night (DC 14 Survival).', label: [39, 14] });
  b.props_('wagon', [[38, 16]], 90).prop('trunk', 40, 11).prop('lamp-post', 41, 17).light(41, 17, 10, 15, FIRE);

  // ----- the Palace of Noon -----
  shell(b, 51, 1, 28, 18, 'marble');
  b.wallRun(51, 11, 28, 's').wallRun(57, 1, 11, 'e').wallRun(71, 1, 11, 'e');
  b.door(64, 18, 's', 'closed', 'door-double').door(65, 18, 's', 'closed', 'door-double').door(64, 11, 's', 'closed', 'door-double').door(65, 11, 's', 'closed', 'door-double');
  b.door(57, 6, 'e', 'closed').door(71, 6, 'e', 'closed').door(54, 11, 's', 'closed').door(75, 11, 's', 'closed').door(51, 4, 'w', 'secret');
  b.wall(60, 1, 'n', 'window').wall(68, 1, 'n', 'window').wall(78, 14, 'e', 'window');
  b.area('Throne Room of Noon', [[58, 1, 14, 11]], {
    read: 'The throne room was built to catch the sun: a hundred tall windows, a floor of gold-veined marble. Today the light through the windows is weak and grey, and a young queen in a fur cloak sits not on the throne but on its steps, surrounded by maps.',
    gm: 'Queen Elowen and her generals. She asks the heroes plainly for help: the day is shorter every dawn, the harvest is gone, and the Royal Astronomer, who should have answers, has vanished. She gives them her seal (opens any door in Solmere) and asks them to search the Heliodrome. Her proclamation (handout) is read here.',
    label: [64, 6],
  });
  b.area("The Queen's Solar", [[51, 1, 7, 11]], { gm: 'Elowen\'s private rooms. A secret door in the west wall opens on a private stair to the gardens. Her father\'s crown sits on a cushion: she has not worn it since he died. A painting of King Odran watches the room.' });
  b.area('The War Room', [[72, 1, 7, 11]], { gm: 'A table map of the kingdom with frost-white pins creeping south. Reports: the northern sea frozen, frost giants seen on the ice; a monastery in the mountains, Larkspire, has stopped ringing its bells.' });
  b.area('Hall of Petitions', [[51, 12, 28, 7]], { read: 'A long hall crowded with petitioners: farmers, merchants, priests. Everyone has the same question.', gm: 'If the heroes stop to listen, they hear how bad it is: whole villages walking south, wolves in the streets of the hill towns, the old dying of cold in their beds.', label: [64, 15] });
  b.prop('throne', 64, 2).prop('throne-dais', 64, 3).prop('war-table', 66, 6).props_('column-fluted', [[59, 2], [70, 2], [59, 10], [70, 10]]).props_('banner-hanging-tall', [[61, 1], [67, 1]]).prop('brazier-pedestal', 62, 8).prop('brazier-pedestal', 67, 8).light(62, 8, 10, 20, FIRE).light(67, 8, 10, 20, FIRE);
  b.prop('bed-canopy', 53, 2).prop('crown-cushion', 55, 5).prop('vanity', 52, 8).prop('fireplace', 56, 9).prop('rug', 54, 6).light(56, 9, 5, 15, FIRE);
  b.prop('table-maps', 75, 5).prop('map-cabinet', 77, 2).props_('chair', [[74, 4], [76, 7]]).prop('weapon-rack', 73, 10).prop('candles', 75, 7).light(75, 5, 5, 15, FIRE);
  b.props_('bench-long', [[54, 14], [60, 16], [70, 14], [75, 16]]).props_('statue-tall-knight', [[52, 13], [77, 13]]).prop('tapestry-tall', 65, 13).light(58, 15, 10, 15, FIRE).light(72, 15, 10, 15, FIRE);
  b.area('Palace Court', [[48, 19, 31, 6]], { read: 'A parade ground in front of the palace, where the queen\'s guard huddle round braziers in their gold-and-white cloaks. The great fountain has frozen into a pillar of ice.', gm: 'From here a gate leads south into the Sundial Gardens and the Heliodrome. The guard captain says the astronomer\'s apprentices fled a week ago, "white as milk", and nobody has gone in since.', label: [62, 21] });
  b.props_('statue-tall-knight', [[50, 20], [77, 20]]).prop('fountain-grand', 64, 21).prop('war-banner', 58, 23).prop('tent-command', 72, 22).props_('brazier', [[55, 22], [69, 23]]).light(55, 22, 10, 15, FIRE).light(69, 23, 10, 15, FIRE);

  // ----- the Sundial Gardens and the Heliodrome -----
  b.area('Sundial Gardens', [[44, 25, 12, 17], [56, 25, 18, 3], [74, 25, 6, 25]], {
    read: 'Formal gardens climb Crownhill round the dome of the Heliodrome. Every hedge is white with frost and every rose has frozen in bud. At the centre stands the Great Gnomon, a bronze obelisk whose shadow is supposed to mark the hours. It casts no shadow at all.',
    gm: 'The Gnomon has no shadow because the sunlight here is being drunk before it lands (DC 18 Arcana). The Mausoleum of the Sun-Kings stands at the garden\'s south-west corner, by the river.',
    label: [49, 31],
  });
  b.prop('obelisk', 48, 30).props_('hedge', [[45, 27], [46, 36], [53, 38], [76, 32]]).props_('tree-oak', [[53, 26], [77, 29], [76, 45]]).props_('flowers', [[50, 34], [75, 40]]).prop('frozen-pond', 50, 39).props_('bench', [[46, 33], [75, 37]]).prop('statue', 75, 27).prop('hedge-long', 77, 47).prop('lamp-post', 55, 26).light(55, 26, 10, 15, FIRE);
  b.building('Mausoleum of the Sun-Kings', 46, 42, 7, 6, {
    mat: 'stone-flagstone',
    read: 'A small marble tomb with a sun carved over its iron door. Inside, the effigy of the first king of Solmere lies with his hands folded on a stone sword. Candles burn at his feet. Someone has been lighting them.',
    gm: 'The cult uses this as a back door. A secret panel in the south wall (DC 18 Perception, or follow the wax drips) opens on a stair down to the Crypt of the Sun-Kings under the hill.',
    doors: [[49, 42, 'n', 'closed', 'door-iron'], [49, 47, 's', 'secret']],
  });
  b.prop('sarcophagus-effigy', 49, 44).props_('urn', [[47, 43], [51, 43]]).prop('candles', 47, 46).prop('statue-tall-robed', 51, 46).light(47, 46, 5, 10, FIRE);

  shell(b, 56, 28, 18, 22, 'marble');
  b.wallRun(56, 39, 18, 's').wallRun(63, 40, 10, 'e').wallRun(67, 40, 10, 'e');
  b.door(64, 28, 'n', 'closed', 'door-double').door(65, 28, 'n', 'closed', 'door-double').door(56, 34, 'w', 'closed').door(73, 34, 'e', 'closed');
  b.door(59, 39, 's', 'closed').door(65, 39, 's', 'open', 'door-double').door(70, 39, 's', 'closed').door(63, 46, 'e', 'secret').door(67, 44, 'e', 'locked', 'door-iron');
  b.door(65, 49, 's', 'open').door(66, 49, 's', 'open');
  b.wall(56, 30, 'w', 'window').wall(73, 30, 'e', 'window').wall(73, 46, 'e', 'window');
  b.area('The Orrery Hall', [[56, 28, 18, 12]], {
    read: 'Under the great dome of the Heliodrome turns the royal orrery: a brass sun the size of a cart, ringed by planets on long arms. The brass sun is black. As you watch, its arms swing round to point at you, and the floor shakes with heavy footsteps.',
    gm: 'The orrery\'s keepers: an iron golem shaped like an armillary sphere and two stone golems carved as star-saints. They obey Isaura\'s last order: "let no one reach the Star Well". Speaking the astronomer\'s password ("Cael", learned in House Kestrane) stops them dead. On the star-table: the chart of the five spires (handout).',
    label: [64, 33],
  });
  b.area('Library of Hours', [[56, 40, 8, 10]], { gm: 'Records of every sunrise for three hundred years, kept to the minute. The last forty pages show the day shrinking by exactly one hour a dawn. A bookcase in the east wall is a secret door to the Star Well (DC 18 Investigation: the book "On Eclipses" is a lever).' });
  b.area('The Star Well', [[64, 40, 4, 10]], { read: 'A round shaft with a spiral stair, cut down into the hill. Cold air breathes up out of it, and with it a sound like a choir humming one very low note.', gm: 'The main way down to the Undercroft. The stair goes far deeper than the hill should allow.' });
  b.area("Astronomer's Tower", [[68, 40, 6, 10]], { gm: 'Isaura\'s rooms. A bed she has not slept in. A crib with a folded blanket. Her journal, last entry: "The Lampwarden promised: when the long night comes, nothing will ever die again. Not one more child. I will hold the door until it comes."' });
  b.prop('orrery', 64, 33).prop('globe-great', 60, 31).prop('telescope', 70, 30).prop('astrolabe-stand', 58, 36).prop('table-maps', 68, 36).props_('pillar-round', [[58, 29], [71, 29], [58, 37], [71, 37]]).prop('lectern', 61, 35).prop('chandelier-great', 64, 30);
  b.props_('bookshelf-tall', [[57, 41], [57, 44], [57, 47]]).prop('library-stack', 60, 43).prop('table-reading', 61, 46).prop('scroll-rack', 62, 41).prop('globe-stand', 59, 48).prop('book-pile', 62, 48);
  b.prop('stairs-down', 65, 47).prop('magic-circle', 65, 42).prop('light-orb', 66, 44);
  b.prop('bed', 72, 41).prop('writing-desk', 69, 41).prop('telescope', 71, 45).prop('alchemy-table', 72, 47).prop('potion-shelf', 69, 48).prop('crib', 72, 44);
  b.light(64, 33, 10, 25, NIGHT).light(61, 46, 5, 10, FIRE).light(65, 44, 5, 15, NIGHT).light(69, 41, 5, 10, FIRE);
  b.encounter('The orrery guardians', [56, 28, 18, 12], [['ironGolem', 1], ['stoneGolem', 2]], 'moderate');

  // ----- under Crownhill -----
  b.hall(65, 50, 65, 55, 2, { mat: 'dungeon-slab' });
  b.room('Undercroft of the Unlit', 58, 56, 14, 8, {
    mat: 'dungeon-slab',
    read: 'A vaulted hall under the hill, hung with banners of black cloth that each have a hole cut in the middle, like an eclipse. Benches face an altar of night-glass. In iron cages along the wall, people in nightclothes look up at you without hope.',
    gm: 'The cult of the Unlit meets here. The prisoners are eight townsfolk taken to be "given to the dark" when the spire wakes fully. Freeing the cages: DC 18 Thieves\' Tools or AC 19, 30 HP each. The tunnel south-east leads to the spire; the iron door east to Isaura\'s reliquary.',
  });
  b.props_('pillar-square', [[60, 57], [69, 57], [60, 62], [69, 62]]).prop('altar', 70, 59).props_('banner-hanging-tall', [[63, 56], [67, 56]]).props_('bench', [[62, 59], [65, 59], [62, 61], [65, 61]]).props_('cage', [[59, 59], [59, 61]]).prop('chains-hanging', 68, 60).prop('table-long', 63, 57).prop('sconce-witchfire', 71, 57);
  b.light(70, 59, 5, 15, NIGHT).light(62, 57, 5, 10, NIGHT);
  b.room("Kestrane's Reliquary", 74, 56, 5, 5, { mat: 'marble', gm: 'Behind an iron door (DC 22 Thieves\' Tools; Isaura carries the key). Her treasures and her research: the true nature of the spires and the Lampwarden\'s name. Everything here is hers to give or the heroes\' to take.' });
  b.hall(72, 58, 73, 58, 1, { mat: 'dungeon-slab' }).door(73, 58, 'e', 'locked', 'door-iron');
  b.prop('strongbox', 75, 57).prop('coffer', 77, 57).prop('treasure-urn', 77, 59).prop('staff-stand', 75, 60).prop('scroll-pile', 76, 58).light(76, 58, 5, 10, NIGHT);
  b.room('Crypt of the Sun-Kings', 50, 55, 6, 10, {
    mat: 'dungeon-slab',
    read: 'Rows of stone kings sleep under carved suns. The air is so cold the sarcophagi are rimed white. Fresh footprints in the frost lead between them.',
    gm: 'Reached from the mausoleum. A secret door in the east wall (DC 18 Perception: the frost is thinner on one block) leads into the Undercroft. A hole in the south floor drops into the Worm Galleries.',
  });
  b.tunnel([[49, 48], [50, 51], [52, 55]], 2, { mat: 'dungeon-slab', seed: 11 });
  b.hall(56, 60, 57, 60, 1, { mat: 'dungeon-slab' }).door(55, 60, 'e', 'secret');
  b.props_('sarcophagus-row', [[51, 57], [51, 61]]).prop('sarcophagus-effigy', 54, 58).props_('urn', [[54, 56], [54, 63]]).prop('candles', 53, 62).prop('stairs-up', 50, 55).prop('pit-deep', 52, 63).light(53, 62, 5, 10, FIRE);
  b.cave('The Worm Galleries', 55, 71, 5, 5, {
    seed: 23,
    read: 'Round tunnels as wide as a house, their walls glassy and ridged, wind through the roots of the hill. Something enormous has been eating its way toward the cold.',
    gm: 'A purple worm, woken by the spire\'s chill, hunts in these galleries. It is mindless and drawn to warmth: a lit fire or a fire spell thrown down a side tunnel lures it away for 10 minutes. Its tunnels link the crypt, the river culvert and the spire cave.',
  });
  b.water(56, 73, 2, 2).props_('bones', [[53, 69], [54, 70]]).prop('rubble-pile', 51, 72).prop('boulder', 59, 68);
  b.encounter('The worm under the hill', [50, 66, 11, 10], [['purpleWorm', 1]], 'low');
  b.tunnel([[52, 64], [53, 67]], 2, { seed: 12 });
  b.tunnel([[48, 62], [50, 66], [52, 68]], 2, { seed: 13 });
  b.tunnel([[60, 72], [65, 71]], 2, { seed: 14 });
  b.tunnel([[69, 63], [71, 66]], 2, { seed: 15, mat: 'dungeon-slab' });
  b.area('The Undercliff Bank', [[47, 56, 2, 14]], { read: 'A strip of frozen mud under the cliff of Crownhill. A brick culvert mouth, its grate torn open, breathes cold.', gm: 'The river way in: walk south on the ice and in through the culvert (the grate was torn off from inside, by the worm). It comes out in the Worm Galleries.', label: [48, 62] });
  b.prop('sewer-outflow', 48, 63).prop('reeds', 47, 58).prop('mud-patch', 48, 67);
  b.cave('The First Night Spire', 71, 71, 7, 6, {
    seed: 29, mat: 'cave-floor',
    read: 'In a great cavern under the hill stands a needle of black glass, taller than a tower, its tip lost in the roof. Light is crawling up it. Real sunlight, thin and gold, seeping down out of the rock and up the spire like water up a wick, and vanishing at the top. At its foot a woman in a starry robe is singing to it.',
    gm: 'The first Night Spire. Isaura Kestrane guards it with two fallen devas (their wings grey as ash), two invisible stalkers, four wraiths and two assassins. The spire: AC 20, 200 HP, immune to everything but radiant, force and thunder damage; it regains 20 HP at the start of each round while it can drink light. Daylight (the spell) or any radiant damage of 30 or more in one hit cracks it badly (double damage that round). Isaura can be talked down (see her notes). When it falls, a beam of gold light shoots up through the hill and the sun flares, just for a moment.',
  });
  b.prop('crystal-spire', 71, 70).prop('summoning-circle', 71, 73).prop('altar', 68, 68).props_('rune-stone', [[66, 72], [76, 70]]).prop('candle-ring', 74, 74).prop('brazier-everburning', 67, 75, 0, { off: true }).prop('stalagmites', 75, 67);
  b.light(71, 70, 15, 30, NIGHT).light(68, 68, 5, 10, NIGHT);
  b.encounter('Kestrane at the First Spire', [64, 65, 15, 13], [['archmage', 1], ['deva', 2], ['invisibleStalker', 2], ['wraith', 4], ['assassin', 2]], 'high');

  // ----- Lower Solmere: Lamplighters, Candle Row and the Frostfield camp -----
  b.building("Lamplighters' Hall", 6, 46, 11, 8, {
    mat: 'wood-planks',
    read: 'The guild hall of the city\'s lamplighters. Ladders and oil drums everywhere. It is cold and dark, and nobody has lit a lamp here in days.',
    gm: 'The cult took over the guild: its black coats are perfect cover. Under the floorboards (DC 16 Investigation): black robes, a list of eight names with addresses (the Undercroft prisoners) and a map showing the culvert under Crownhill. The real guildmaster is one of the prisoners.',
    doors: [[11, 46, 'n', 'closed', 'door-double'], [12, 46, 'n', 'closed', 'door-double'], [16, 50, 'e', 'closed']], windows: [[6, 49, 'w'], [9, 53, 's']],
  });
  b.prop('workbench', 8, 47).prop('wall-shelves', 15, 47).prop('barrel-stack', 7, 52).prop('lantern-cluster', 10, 49).prop('ladder', 15, 52).prop('table-long', 12, 50).prop('trapdoor', 13, 52).light(10, 49, 5, 10, FIRE);
  shell(b, 19, 46, 6, 5, 'wood-planks-dark').door(21, 46, 'n', 'closed');
  shell(b, 27, 46, 6, 5, 'wood-planks-dark').door(29, 46, 'n', 'closed');
  shell(b, 19, 53, 6, 5, 'wood-planks-dark').door(21, 57, 's', 'closed');
  shell(b, 27, 53, 6, 5, 'wood-planks-dark').door(29, 53, 'n', 'closed');
  b.props_('bunk-bed', [[20, 47], [28, 47], [20, 56]]).props_('stove', [[23, 49], [31, 49], [31, 56]]).prop('kitchen-table', 22, 55).prop('crib', 29, 55).prop('washbasin', 30, 48).props_('firewood', [[25, 51], [33, 47]]).prop('handcart', 26, 52).prop('lamp-post', 26, 45).light(26, 45, 5, 10, FIRE);
  b.area('Candle Row', [[18, 44, 18, 14]], { read: 'A lane of tenements where every window shows one candle. People have boarded up their doors with the wood of their own furniture to burn.', gm: 'Poor families who cannot flee. A grandmother here is the mother of one of the Undercroft prisoners: she knows her son "went to a lamplighters\' meeting" and never came home.', label: [26, 51] });
  b.area('Frostfield Camp', [[2, 60, 36, 19]], {
    read: 'Outside the tenements, the city park has become a camp for farmers who walked in from the frozen countryside. Tents, carts, cows with frost on their backs. A sun-priest is ladling soup to a line that never seems to get shorter.',
    gm: 'Thousands of refugees. If the heroes spend a few hours helping (DC 15 Medicine or Survival, or any heat-making magic), they earn the camp\'s love and hear that strange "grey angels" were seen flying over the farms at dusk, toward the city. A long rest here costs 1 hour of Daylight like anywhere else.',
    label: [18, 68],
  });
  b.props_('tent', [[5, 63], [10, 62], [16, 64], [22, 62], [8, 70], [14, 72], [28, 66]]).prop('tent-bell', 20, 70).props_('campfire', [[7, 66], [18, 67], [25, 72]]).prop('cooking-pot-fire', 21, 69).props_('crop-rows', [[4, 75], [8, 75]]).prop('scarecrow', 30, 74).props_('tree-dead', [[34, 62], [33, 76]]).prop('frozen-pond', 12, 76).prop('haystack', 36, 70).prop('wagon', 26, 61).props_('bedroll', [[6, 67], [17, 66]]);
  for (const [x, y] of [[7, 66], [18, 67], [25, 72]]) b.light(x, y, 5, 15, FIRE);
  return b.build();
}

// ---------- Part 2: the Whitewake, the frozen sea ----------
function whitewake() {
  const b = new MapBuilder('adv-sgo-whitewake', 'The Whitewake and the Skull of Oruvald', 80, 80, { open: true, floor: 'ice', theme: 'cave', wallStyle: 'cave', ambient: 'dim' });

  // the skull of the titan Oruvald, frozen into the sea ice
  blob(62, 21, 17, 18, 501, (x, y) => b.rock(x, y, 1, 1), 0.06);
  // icebergs
  blob(14, 36, 8, 6, 502, (x, y) => b.rock(x, y, 1, 1));
  blob(66, 64, 10, 8, 503, (x, y) => b.rock(x, y, 1, 1));
  blob(8, 46, 3, 2, 504, (x, y) => b.rock(x, y, 1, 1));
  blob(29, 42, 3, 2, 505, (x, y) => b.rock(x, y, 1, 1));
  blob(26, 74, 4, 3, 506, (x, y) => b.rock(x, y, 1, 1));
  blob(52, 76, 3, 2, 507, (x, y) => b.rock(x, y, 1, 1));
  blob(43, 6, 2, 2, 508, (x, y) => b.rock(x, y, 1, 1));
  // the leads: cracks of black open water in the ice
  along([[0, 52], [16, 49], [28, 53], [40, 48], [52, 50], [64, 47], [79, 49]], 2, (x, y, w) => b.water(x, y, w, w, true));
  along([[34, 0], [37, 12], [33, 26], [36, 40], [40, 48]], 2, (x, y, w) => b.water(x, y, w, w, true));
  // pressure ridges: broken, heaped ice
  along([[4, 26], [12, 29], [26, 27]], 1, (x, y) => b.rubble(x, y, 1, 1));
  along([[40, 56], [50, 58], [58, 55]], 1, (x, y) => b.rubble(x, y, 1, 1));
  along([[6, 60], [14, 63]], 1, (x, y) => b.rubble(x, y, 1, 1));

  // ----- Saltfrost Landing -----
  b.area('Saltfrost Landing', [[2, 66, 16, 12]], {
    read: 'Your ship froze into the ice a mile from where the sea should be. Ahead, the Whitewake runs flat and white to the end of the world, under a sun no brighter than the moon. Far off, a dome of yellowed bone the size of a hill rises out of the ice.',
    gm: 'Arrival. Skarra Tidewife meets the heroes here (or her raven-messenger does): she offers to guide them to the skull of Oruvald. Cold here is extreme: without cold-weather gear, DC 10 Constitution save each hour or gain a level of Exhaustion (SRD extreme cold).',
    label: [9, 71],
  });
  b.start(4, 70, 3, 3);
  b.prop('ship-mast', 4, 76).prop('sails-pile', 6, 75).props_('cargo-crates', [[9, 76], [11, 75]]).prop('anchor', 2, 74).props_('tent', [[11, 68], [14, 71]]).prop('campfire', 9, 70).prop('banner-pole', 7, 67).prop('rowboat', 15, 76, 90);
  b.light(9, 70, 10, 20, FIRE);
  b.area("Whalers' Graveyard", [[2, 54, 14, 10]], { read: 'The bones of whales stand out of the ice like the ribs of sunken ships. Among them, a whaling crew stands frozen mid-stride, still hauling on a rope that runs down into the ice.', gm: 'The sea froze in one night. Under the third whaler\'s coat (DC 14 Investigation): a ship\'s log that says the ice "came from the north like a white tide, out of the skull". A cache of whale oil and harpoons in the ribs: good fuel (a fire here keeps the party warm for a long rest).', label: [8, 58] });
  b.props_('giant-ribcage', [[5, 56], [11, 59]]).prop('skull-bleached', 9, 55).props_('statue', [[4, 61], [7, 62], [13, 56]]).prop('rope-coil', 8, 62).prop('cairn', 14, 61).prop('spear-rack', 3, 58);

  // ----- the icebound ship -----
  shell(b, 17, 58, 18, 7, 'wood-planks');
  b.wallRun(25, 58, 7, 'e').door(25, 61, 'e', 'closed').door(17, 61, 'w', 'open').door(30, 64, 's', 'open').door(34, 61, 'e', 'closed');
  b.area('Wreck of the Constant Dawn', [[17, 58, 18, 7]], {
    read: 'A three-masted ship lies frozen in the ice, tilted, her sails stiff as boards. She flies the queen\'s colours. Her name is painted on the bow: CONSTANT DAWN. A lantern burns in her cabin window, blue and cold.',
    gm: 'The queen\'s first expedition, sent north a month ago. The crew drank something they should not have from "a priest who walked on the ice" and became vampire spawn. Their new captain is an ice devil, sent by the Lampwarden to keep the ice whole. The devil can be bargained with: it hates this posting and will leave in exchange for being told the truth of where its master\'s power comes from (it does not know about the spires). The ship\'s log is in the stern cabin.',
    label: [26, 61],
  });
  b.prop('ship-wheel', 19, 61).prop('table-maps', 21, 59).prop('chest', 23, 63).prop('lantern-hanging', 22, 60).props_('cargo-hatch', [[28, 61]]).props_('barrel-group', [[31, 59], [33, 63]]).prop('cannon', 29, 59).prop('hammock', 27, 63).prop('ship-mast', 30, 61);
  b.light(22, 60, 5, 15, NIGHT);
  b.encounter('The icebound ship', [17, 58, 18, 7], [['iceDevil', 1], ['vampireSpawn', 4]], 'low');
  b.floor(20, 48, 4, 6, 'ice');
  b.area('The Whitebridge', [[19, 47, 6, 8]], { read: 'An arch of blue ice spans the open lead, smooth as glass and only as wide as a cart.', gm: 'DC 14 Acrobatics to cross without slipping toward the black water (falling in: DC 15 Constitution save or a level of Exhaustion, and the current pulls under the ice). Seals watch from the water.', label: [21, 50] });
  b.props_('ice-block', [[19, 48], [24, 53]]);

  // ----- the Rime-Mother's den -----
  b.cave("The Rime-Mother's Den", 14, 36, 5, 3.5, {
    seed: 511, mat: 'ice',
    read: 'Inside the iceberg, a cave of blue glass. The floor is a frozen pond, and frozen in it are things the dragons liked: a sleigh, a bronze bell, a whole sea-serpent. Two white shapes uncoil from the ice.',
    gm: 'The Rime-Mother and her mate, adult white dragons. Hrimmora the jarl feeds them; they are her war-beasts, not the Lampwarden\'s. If the heroes have made peace with Hrimmora, the dragons stay coiled and only hiss. Their hoard is frozen into the floor (an hour of fire to free it).',
  });
  b.tunnel([[16, 36], [25, 36]], 3, { mat: 'ice', seed: 512 });
  b.prop('dragon-hoard', 13, 37).prop('frozen-pond', 15, 35).prop('temple-bell', 11, 35).prop('wagon', 17, 38).prop('ice-block', 12, 38).light(14, 36, 5, 15, FROST);
  b.encounter('The Rime-Mother', [8, 32, 14, 9], [['adultWhiteDragon', 2]], 'low');

  // ----- Hrimmora's Steading -----
  shell(b, 3, 3, 22, 11, 'wood-planks-dark');
  b.wallRun(18, 3, 11, 'e').door(18, 8, 'e', 'closed');
  b.door(10, 13, 's', 'closed', 'door-double').door(11, 13, 's', 'closed', 'door-double').door(24, 10, 'e', 'closed').door(3, 6, 'w', 'secret');
  b.area("Hrimmora's Mead-Hall", [[3, 3, 16, 11]], {
    read: 'A hall built of whale ribs and black driftwood, so tall that clouds of breath drift under its roof. Giants feast on long benches. At the end, on a throne of narwhal tusks, sits a frost giant queen with a crown of icicles, laughing.',
    gm: 'Jarl Hrimmora and six of her huscarls, with two war-bears. The giants are loving the endless winter. They are not cultists: the Lampwarden promised them "the world as a frozen hall forever". Hrimmora respects strength and honesty. She can be turned (DC 22 Persuasion, advantage with Skarra present or with the ship\'s log): show her that endless night means the sea freezes to the bottom, the whales and seals die, and her people starve in the dark within a year. Turned, she gives the heroes the way into the skull (the ear) and her warriors guard the jaw.',
    label: [10, 8],
  });
  b.area("The Jarl's Chamber", [[19, 3, 6, 11]], { gm: 'Hrimmora\'s sleeping furs and her treasures. A secret door in the hall\'s west wall leads out onto the ice (DC 18 Perception): the jarl\'s escape way.' });
  b.props_('feast-hall-table', [[8, 6], [8, 10], [14, 6], [14, 10]]).prop('throne', 4, 8).prop('hearth-grand', 11, 8).props_('banner-hanging-tall', [[6, 3], [16, 3]]).props_('rug-pelt', [[5, 5], [5, 11]]).prop('weapon-rack', 17, 12).prop('keg-rack', 17, 4).light(11, 8, 15, 25, FIRE);
  b.prop('bed', 22, 4).prop('chest', 23, 7).prop('coin-stacks', 20, 11).prop('armor-stand', 23, 12).prop('rug-pelt', 21, 8).light(21, 6, 5, 10, FIRE);
  b.encounter("Hrimmora's hall", [3, 3, 22, 11], [['frostGiant', 7], ['polarBear', 2]], 'moderate');
  b.area('Steading Yard', [[3, 14, 26, 9]], { read: 'A yard of trampled snow round the hall: a whale carcass being butchered, drying racks of fish, cages of growling bears, and a huge sledge loaded with treasure taken from the ships.', gm: 'Giant children throw snowballs the size of barrels at each other. Walking in openly (not sneaking) earns an audience with the jarl; sneaking and being caught means a fight.', label: [14, 18] });
  b.prop('giant-ribcage', 9, 17).prop('campfire-spit', 16, 16).props_('cage', [[23, 17], [26, 17]]).prop('log-pile', 4, 20).props_('fish-crate', [[12, 20], [14, 20]]).prop('wagon', 20, 21, 90).prop('snowman', 6, 16).prop('banner-pole', 27, 15).light(16, 16, 10, 20, FIRE);

  // ----- the open ice in the middle -----
  b.area('Field of Frozen Whalers', [[40, 26, 6, 18]], { read: 'Dozens of figures stand on the ice: fishers, sailors, a dog, a boy with a kite. All frozen solid, all looking up at the sky.', gm: 'People caught when the ice came in a single night. A frost giant hunting party patrols between the statues. DC 18 Medicine: they are not dead, only frozen in time. Breaking the spire in the skull will thaw them (alive).', label: [42, 33] });
  b.props_('statue', [[41, 28], [43, 31], [40, 36], [44, 39], [42, 42], [38, 30]]).prop('skull-bleached', 39, 41).prop('ice-block', 45, 34);
  b.encounter('Giant raiders on the ice', [36, 26, 10, 18], [['frostGiant', 4]], 'low');
  b.floor(32, 19, 7, 3, 'ice');
  b.area('The Narwhal Steps', [[32, 18, 7, 5]], { read: 'Floes of ice the size of rooms have jammed across the lead, rocking gently. Narwhals surface between them and look at you.', gm: 'Jumping floe to floe: DC 13 Athletics or Acrobatics each. The narwhals are curious and harmless.', label: [35, 20] });
  b.props_('ice-block', [[33, 19], [37, 21]]);
  b.floor(58, 45, 4, 5, 'ice');
  b.area('The Thin Ice', [[57, 44, 6, 7]], { read: 'Here the lead has frozen over with ice as thin and clear as a window. Under it, something enormous slides past.', gm: 'Each hero crossing: DC 15 Dexterity save or the ice breaks (fall in; see the Whitebridge). Spreading out or crawling gives advantage.', label: [59, 47] });
  b.props_('ice-thin', [[58, 46], [60, 48]]);
  b.area('The Jaw Approach', [[44, 40, 34, 4]], { read: 'The skull rises above you, a dome of yellow bone a quarter of a mile across. Its jaw hangs open at the level of the ice, teeth like standing stones. Black light leaks from its empty eye sockets.', gm: 'Three ways in: the jaw (guarded), the eye sockets (a climb up the cheek-ice, roc nest), or the ear on the west side (secret, Hrimmora or Skarra knows it).', label: [61, 41] });
  b.props_('standing-stone', [[47, 41], [75, 42]]).prop('cairn', 70, 41);

  // ----- inside the skull of Oruvald -----
  b.floor(55, 32, 13, 9, 'marble');
  b.rock(56, 37, 1, 1).rock(58, 37, 1, 1).rock(60, 38, 1, 1).rock(64, 38, 1, 1).rock(66, 37, 1, 1);
  b.area('The Jaw Gate', [[55, 32, 13, 9]], {
    read: 'You walk between teeth taller than houses into the titan\'s mouth. The roof of the mouth is a vault of bone, furred with frost, and the cold here burns.',
    gm: 'The main way in. A frozen tongue of ice leads up into the throat. If Hrimmora has turned, her giants hold the jaw for the heroes against anything that comes out.',
    label: [61, 35],
  });
  b.props_('stalagmites', [[57, 33], [65, 33]]).props_('bones', [[59, 35], [63, 34]]).prop('ice-block', 61, 32);
  b.cave('The Frozen Throat', 61, 27, 4, 3, { seed: 521, mat: 'marble', read: 'A ridged tunnel of bone climbs into the dark, its walls hung with icicles as thick as tree trunks.', gm: 'Icicles fall when anything loud happens here: DC 16 Dexterity save, 4d10 piercing damage.' });
  b.floor(60, 29, 3, 4, 'marble');
  b.tunnel([[61, 24], [61, 17]], 2, { mat: 'marble', seed: 522 });
  b.props_('stalactites', [[59, 27], [63, 26]]).prop('ice-block', 62, 28);
  b.cave('The Left Eye', 51, 24, 4, 4, {
    seed: 523, mat: 'ice',
    read: 'The empty eye socket of the titan, a bowl of bone open to the sky, heaped with sticks and whale bones. A nest. Two shapes like thunderclouds with beaks rise from it.',
    gm: 'Two rocs nest here, starving: the fish are gone. Throw them food (a whale carcass from the steading, or a lot of magic) and they let the heroes pass. The optic channel behind the nest leads straight to the Brain Vault.',
  });
  b.tunnel([[48, 25], [40, 26]], 3, { mat: 'ice', seed: 524 });
  b.tunnel([[52, 21], [56, 15]], 2, { mat: 'marble', seed: 525 });
  b.prop('bones', 51, 25);
  b.encounter('The roc eyrie', [46, 20, 10, 9], [['roc', 2]], 'low');
  b.cave('The Right Eye', 72, 24, 4, 4, { seed: 526, mat: 'ice', read: 'The other eye socket, cracked open by some ancient blow. Black frost grows in it like moss, glittering.', gm: 'The black frost is the spire\'s light-drinking leaking out. Touching it: DC 17 Constitution save or 3d10 cold damage. A crack leads down the brow to the ice outside.' });
  b.tunnel([[73, 27], [75, 36], [76, 42]], 2, { mat: 'ice', seed: 527 });
  b.tunnel([[71, 21], [68, 15]], 2, { mat: 'marble', seed: 528 });
  b.prop('mold-patch', 72, 25).prop('crystal-cluster', 70, 23).light(72, 24, 5, 10, NIGHT);
  b.cave('The Brain Vault', 62, 11, 9, 6, {
    seed: 529, mat: 'marble',
    read: 'The inside of the titan\'s skull, a dome of bone as big as a cathedral. In the middle, where the titan\'s mind once was, stands a needle of black glass, drinking. Pale sunlight crawls down through the bone of the dome, into the spire, and is gone. Before it waits an angel with grey wings and a burned-out face.',
    gm: 'The second Night Spire (same stats as the first). Its keeper is a fallen planetar, the Lampwarden\'s herald, with two ice devils and three frost giants who chose the night over their jarl. The planetar will not bargain: it believes. But it can be shamed: a hero who reads aloud the Lampwarden\'s Oath (if they have it) makes it hesitate for 1 round. When the spire falls, the skull groans, the ice for miles around cracks, and the frozen whalers outside wake up.',
  });
  b.prop('crystal-spire', 62, 11).prop('summoning-circle', 62, 14).props_('stalagmites', [[56, 9], [68, 13]]).props_('bones', [[58, 14], [66, 8]]).prop('rune-stone', 57, 12);
  b.light(62, 11, 15, 30, NIGHT);
  b.encounter('The Brain Vault', [52, 5, 19, 13], [['planetar', 1], ['iceDevil', 2], ['frostGiant', 3]], 'high');
  b.tunnel([[38, 11], [55, 11]], 2, { mat: 'ice', seed: 530 });
  b.wallRun(51, 8, 7, 'e').door(51, 11, 'e', 'secret');
  b.area('The Ear of Oruvald', [[38, 10, 13, 4]], { read: 'A round tunnel spirals into the side of the skull, ridged like a seashell. At its end, a wall of solid ice.', gm: 'The secret way in. The ice wall at the end is a plug: Hrimmora\'s giants know to strike it three times and it swings aside (otherwise DC 22 Perception to spot the seam, or 60 damage to smash it, which wakes the Brain Vault).', label: [44, 11] });
  b.prop('ice-block', 39, 12);
  b.cave("The Titan's Crown", 75, 6, 3, 2, { seed: 531, mat: 'marble', read: 'A small hollow in the bone, where the titan\'s crown fell when it died. It is still here: a ring of gold as wide as a cart wheel.', gm: 'Oruvald\'s crown. Too big to carry, but set with twelve storm-sapphires (5,000 gp each). Skarra will weep to see it. Taking a single stone for her as a keepsake earns her undying friendship.' });
  b.hall(69, 8, 72, 8, 1, { mat: 'marble' });
  b.prop('crown-cushion', 75, 6).prop('treasure-urn', 76, 7).light(75, 6, 5, 10, SUNLIGHT);

  // ----- the Breathing Hole and Skarra's berg -----
  b.pool(42, 67, 6, 5, true);
  b.area('The Breathing Hole', [[34, 60, 16, 14]], {
    read: 'A great round hole in the ice, a lake of black water steaming in the cold. The ice around it is scarred by something that has dragged itself out and back again. A long, long shadow turns under the surface.',
    gm: 'A kraken, old beyond counting, trapped under the new ice and slowly freezing. It is not evil, only enraged and afraid; it attacks anything on the ice within 30 ft of the hole. The heroes can go round it (the ice is safe 40 ft out). Or they can talk to it (telepathy, Comprehend Languages): promise to break the ice and set it free, and when the spire falls it will rise and smash the frost giants\' ships, or carry the heroes anywhere by sea, once.',
    label: [42, 63],
  });
  b.props_('ice-block', [[35, 62], [48, 64], [37, 72]]).prop('skull-bleached', 47, 71).prop('whirlpool', 42, 67);
  b.encounter('The Breathing Hole', [34, 60, 16, 14], [['kraken', 1]], 'high');
  b.cave("The Oracle's Hollow", 66, 64, 5, 4, {
    seed: 541, mat: 'cave-floor',
    read: 'A cave in a blue iceberg, warm with a fire of driftwood. Storm-coloured tapestries cover the ice walls. A giantess as tall as a ship\'s mast sits stirring a cauldron, and the steam from it shows pictures.',
    gm: 'Skarra Tidewife\'s home. Here she tells the heroes the song of Oruvald (handout) and scries the other spires in her cauldron: a sky-island monastery, and a city that looks like Solmere but black and wrong. A long rest here is safe.',
  });
  b.tunnel([[61, 64], [52, 64]], 2, { mat: 'ice', seed: 542 });
  b.tunnel([[66, 60], [66, 51]], 2, { mat: 'ice', seed: 543 });
  b.prop('cauldron', 66, 64).prop('throne', 69, 63).prop('rug-pelt', 65, 66).props_('tapestry-tall', [[63, 62], [69, 66]]).prop('crystal-ball', 68, 61).prop('firewood', 63, 66).prop('rune-stone', 64, 61).light(66, 64, 10, 20, FIRE);
  return b.build();
}

// ---------- Part 3: Larkspire, the monastery in the sky ----------
function larkspire() {
  const b = new MapBuilder('adv-sgo-larkspire', 'Larkspire, the Monastery in the Sky', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'grass' });

  // the islands
  b.cave("The Pilgrims' Landing", 11, 70, 8, 6, {
    seed: 301, mat: 'grass', wobble: 0.1,
    read: 'You step off onto a floating island of grass a few hundred feet across. Below your feet, through gaps in the clouds, the mountains are tiny and very far down. Above you, other islands drift, joined by swaying bridges. On the highest one, a white tower. No bell rings. No bird sings. Three angels stand at the head of the bridge, swords drawn, utterly still.',
    gm: 'Arrival by flight, roc, Skarra\'s storm or teleportation (a pilgrim\'s waystone stands here). The three devas are Larkspire\'s gatekeepers. They have not spoken, sung or moved in three weeks; they attack anyone who tries to cross the bridges. Singing the Hymn of Matins (handout, from Brother Pellam) makes them lower their swords and weep. The Hush is the spire\'s doing: it drinks song as well as light here.',
  });
  b.cave('The Isle of Winds', 11, 33, 7, 8, { seed: 302, mat: 'grass', wobble: 0.1 });
  b.cave(null, 41, 46, 15, 12, { seed: 303, mat: 'stone-flagstone', wobble: 0.08 });
  b.cave(null, 40, 11, 12, 8, { seed: 304, mat: 'stone-flagstone', wobble: 0.08 });
  b.rock(33, 0, 16, 4);
  b.cave('The Hanging Gardens', 71, 38, 7, 10, {
    seed: 305, mat: 'grass', wobble: 0.1,
    read: 'An island of orchards and terraced flower beds, watered by a spring that rises from nowhere and falls off the island\'s edge in a long silver thread. Every flower has closed. The trees are walking, slowly, toward the edge.',
    gm: 'The gardens grieve for the silenced angels. Two treants and four awakened trees, once tended by the angel-gardener, mean to throw themselves off the island. Stopping them (DC 18 Nature or Persuasion, or simply singing to them) turns a fight into a friendship: the treants give the heroes fruit of the Larkspire tree (each heals 6d8 and ends one level of Exhaustion; 6 fruit). Fighting them is optional and sad.',
  });
  b.cave(null, 65, 69, 11, 6, { seed: 306, mat: 'dirt', wobble: 0.1 });
  b.cave('The Rock of Wings', 71, 11, 6, 5, {
    seed: 307, mat: 'stone-flagstone', wobble: 0.1,
    read: 'A small, bare island of white rock covered in graves. Every headstone is a carved pair of folded wings.',
    gm: 'The graveyard of Larkspire\'s angels, the few who ever died. The invisible bridge from here to the Bell Isle is the Angel\'s Step (see there).',
  });
  // the bridges between them
  const plank = (pts: [number, number][], w: number) => along(pts, w, (x, y, ww) => b.floor(x, y, ww, ww, 'wood-planks'));
  plank([[17, 67], [31, 54]], 2);
  plank([[10, 64], [10, 41]], 1);
  plank([[17, 36], [29, 43]], 1);
  plank([[14, 26], [30, 12]], 1);
  plank([[55, 44], [66, 39]], 2);
  plank([[71, 29], [71, 15]], 1);
  plank([[51, 55], [58, 64]], 1);
  plank([[70, 63], [70, 47]], 1);
  along([[40, 35], [40, 18]], 3, (x, y, w) => b.floor(x, y, w, w, 'stone-flagstone'));
  along([[66, 10], [52, 10]], 1, (x, y, w) => b.floor(x, y, w, w, 'marble'));

  b.area('Bridge of Pilgrims', [[18, 55, 13, 12]], { read: 'A long bridge of planks and white rope sways over nothing. Prayer-ribbons tied to its rails hang limp; there is no wind at all.', gm: 'The main way to the cloister. Safe unless fought on: anyone knocked prone on it must make a DC 15 Dexterity save or go over the rail (a long, long fall; Feather Fall exists for a reason).', label: [24, 61] });
  b.props_('bridge-rope', [[20, 64], [27, 57]]).props_('lantern-hook', [[18, 66], [30, 55]]);
  b.area('The Long Rope', [[9, 42, 3, 22]], { gm: 'A single-plank bridge north to the Isle of Winds. In a storm, DC 15 Acrobatics or fall.', label: [10, 52] });
  b.prop('bridge-plank', 10, 52, 90);
  b.area("Pilgrims' Stair", [[14, 12, 16, 14]], { read: 'A bridge that climbs like a stair, each plank a step, high over the drop to the Bell Isle.', gm: 'The back way to the bell tower, avoiding the cloister entirely. Long and exposed: anything flying sees the heroes on it.', label: [22, 19] });
  b.prop('bridge-rope', 22, 19);
  b.area('Stair of Matins', [[39, 19, 3, 16]], { read: 'A grand stair of white stone climbs from the cloister to the Bell Isle, hanging in the air without support. Statues of angels with trumpets line it, every trumpet lowered.', gm: 'The front way up to the bell tower. The statues are only statues. Halfway up, the heroes can see into the ringing chamber: the bells are bound with black chains.', label: [40, 27] });
  b.props_('statue-tall-winged', [[39, 22], [41, 25], [39, 29], [41, 32]]).props_('stairs-up', [[40, 33], [40, 21]]);
  b.area("The Angel's Step", [[52, 9, 14, 3]], { read: 'Between the Rock of Wings and the Bell Isle there seems to be only air.', gm: 'An invisible bridge of hardened light, the angels\' own path. DC 20 Perception or Detect Magic to see it; anyone can walk it once they know. It leads to the back of the bell tower, unseen from the cloister.', label: [59, 10] });
  b.prop('gm-secret-door', 58, 10, 0, { gm: true });
  b.area('Garden Bridge', [[55, 38, 11, 7]], { gm: 'A wide bridge under a pergola of frozen roses.', label: [60, 41] });
  b.props_('flowers', [[57, 43], [63, 40]]);
  b.area('Chain Bridge', [[70, 16, 3, 13]], { gm: 'A bridge of iron chains to the Rock of Wings. It sings when crossed, even now: the only sound on Larkspire. Anything in the bell tower hears it.', label: [71, 22] });
  b.area('Broken Bridge', [[69, 48, 3, 15]], { gm: 'Half its planks are missing: DC 14 Acrobatics, or 2 rounds of careful climbing on the ropes.', label: [70, 55] });
  b.prop('debris-wood', 70, 56);

  // ----- the Landing -----
  b.start(7, 69, 3, 3);
  b.prop('standing-stone', 6, 72).prop('road-shrine', 12, 66).props_('statue-tall-winged', [[15, 67], [16, 70]]).prop('bench', 9, 74).prop('signpost', 14, 72).props_('flowers', [[5, 67], [13, 75]]).light(12, 66, 5, 15, SUNLIGHT);
  b.encounter('Silent sentinels', [3, 63, 16, 13], [['deva', 3]], 'low');

  // ----- the Isle of Winds -----
  b.building('The Weather Mill', 7, 27, 5, 5, {
    mat: 'wood-planks',
    read: 'A windmill whose sails turn although there is no wind. Inside, the millstones grind clouds into rain.',
    gm: 'The monks\' weather-engine. Brother Pellam has been hiding here for three weeks, living on rainwater and dried apricots. He is the only mortal left on Larkspire.',
    doors: [[9, 31, 's', 'closed']], windows: [[11, 29, 'e']],
  });
  b.prop('winch', 9, 28).prop('grindstone', 8, 30).prop('sack', 10, 30).prop('bedroll', 10, 28).light(9, 29, 5, 10, FIRE);
  b.area('Storm Altar', [[6, 33, 11, 8]], { read: 'An altar of blue stone ringed by standing stones, under a sky that churns in a tight knot just above it. Wind screams out of the knot in gusts, then stops dead.', gm: 'The angels used it to call the weather. The spire\'s Hush has driven its air spirits mad: four air elementals and a roc caught in the storm-knot attack anything that comes near. Singing the Hymn here calms the elementals; the roc then flies off. Pellam knows the hymn but is too afraid to sing it alone.', label: [11, 36] });
  b.prop('altar', 11, 36).props_('standing-stone', [[7, 34], [15, 34], [8, 39], [14, 39]]).prop('banner-pole', 11, 33).light(11, 36, 5, 15, FROST);
  b.encounter('Storm-spirits', [4, 26, 15, 16], [['roc', 1], ['airElemental', 4]], 'low');

  // ----- the Cloister Isle -----
  b.area('The Lark Gate', [[27, 50, 7, 7]], { read: 'An arch of white stone carved with larks in flight marks the end of the pilgrims\' bridge. Through it, the monastery: cloisters, a refectory, a scriptorium, all silent.', gm: 'The arrival point on the Cloister Isle. A pilgrims\' poor-box (60 gp in coins from all over the world).', label: [30, 53] });
  b.prop('archway-grand', 30, 52).prop('offering-bowl', 29, 54).props_('statue-tall-robed', [[29, 52], [32, 55]]);
  shell(b, 33, 40, 16, 12, 'marble');
  b.paint(36, 43, 10, 6, 'grass');
  b.door(40, 40, 'n', 'open', 'door-double').door(41, 40, 'n', 'open', 'door-double').door(40, 51, 's', 'closed').door(33, 45, 'w', 'closed').door(48, 45, 'e', 'closed');
  b.area('The Cloister Garth', [[33, 40, 16, 12]], {
    read: 'A square garden inside an arcade of white columns. In the centre grows a tree of silver leaves, its branches full of larks frozen in mid-song. Under it kneels an angel of shining bronze, tall as two men, his mouth stitched shut with black thread, his hands on a greatsword.',
    gm: 'Anthiel, the planetar warden of Larkspire, and three devas of his choir. The Hush binds them: they guard the garth without knowing why. Cutting the black thread from Anthiel\'s mouth (a hero within reach, DC 20 Sleight of Hand as an action, or 30 radiant damage to the thread) while someone sings the Hymn breaks the Hush on him: he wakes, and his devas with him. Otherwise this is a hard fight against friends. Woken, Anthiel tells the heroes the spire is "in the throat of our tower", and that the fallen choir there were his brothers.',
    label: [41, 46],
  });
  b.prop('tree-oak', 41, 45).props_('column-fluted', [[34, 41], [47, 41], [34, 50], [47, 50], [40, 41], [40, 50]]).prop('well', 38, 47).props_('bench', [[36, 49], [45, 43]]).props_('flowers', [[37, 44], [44, 48]]).light(41, 45, 10, 25, SUNLIGHT);
  b.encounter('The choir garth', [33, 40, 16, 12], [['planetar', 1], ['deva', 3]], 'moderate');
  b.building('Refectory', 26, 42, 6, 8, {
    mat: 'wood-planks',
    read: 'A long dining hall. Bowls of soup sit on the tables, three weeks old and frozen. Every bench is pushed back as if everyone stood up at once.',
    gm: 'The monks were eating when the Hush fell. They fled down the bridges, all but Pellam. A kitchen cellar holds food enough for a month.',
    doors: [[31, 45, 'e', 'closed'], [28, 49, 's', 'closed']], windows: [[26, 45, 'w']],
  });
  b.prop('table-long', 28, 45).props_('bench-long', [[27, 44], [29, 46]]).prop('hearth-oven', 27, 48).prop('pot-rack', 30, 43).light(27, 48, 5, 10, FIRE);
  b.building('Dormitory of the Larks', 50, 37, 6, 8, {
    mat: 'wood-planks',
    read: 'Rows of narrow beds on a floor that juts out over the drop on timber struts. A window at the end shows nothing but cloud.',
    gm: 'In the abbot\'s locked chest (DC 18 Thieves\' Tools): the abbot\'s diary. "A grey angel came to the Bell Isle and asked to pray. We let it in. God forgive us."',
    doors: [[50, 40, 'w', 'closed']], windows: [[55, 42, 'e']],
  });
  b.props_('cot', [[51, 38], [53, 38], [51, 43], [53, 43]]).prop('footlocker', 54, 40).prop('chest', 54, 44).prop('washbasin', 52, 41);
  b.building('Chapter House', 50, 47, 6, 7, {
    mat: 'marble',
    read: 'An eight-sided hall with a ring of stone seats, where the monks met each morning. On the lectern lies a great book of hymns, open.',
    gm: 'The Book of Matins. The page it lies open at holds the Hymn of Matins in full, with the music (handout if Pellam is not with them). A secret trapdoor under the lectern (DC 18 Perception) leads to a tiny reliquary.',
    doors: [[50, 50, 'w', 'closed']],
  });
  b.prop('lectern-dais', 53, 49).props_('bench-long', [[51, 48], [51, 52], [54, 51]]).prop('reliquary', 54, 52).prop('candle-stand-tall', 52, 50).prop('trapdoor', 54, 49, 0, { gm: true }).light(53, 50, 5, 15, SUNLIGHT);
  b.building('Scriptorium', 33, 53, 14, 5, {
    mat: 'wood-planks',
    read: 'Long desks, inkpots frozen solid, pages of illuminated manuscript scattered by a wind that has stopped blowing. At the end of the room, two figures of clay and two of iron stand guard over a locked case.',
    gm: 'Two clay golems and two shield guardians protect the monastery\'s treasures. They obey whoever holds the abbot\'s amulet (in the Dormitory chest) or anyone who sings the Hymn. The locked case holds the monks\' great work: an illuminated star-map that shows all five Night Spires lit like black candles, and the fifth at the very edge of the world.',
    doors: [[39, 53, 'n', 'closed'], [44, 53, 'n', 'closed']], windows: [[33, 55, 'w'], [46, 55, 'e']],
  });
  b.props_('desk', [[35, 54], [37, 54], [35, 56], [37, 56]]).prop('display-case', 44, 56).prop('scroll-rack', 41, 54).prop('book-pile', 40, 56).prop('lectern', 42, 55).light(40, 55, 5, 15, FIRE);
  b.encounter('The scriptorium wardens', [33, 53, 14, 5], [['clayGolem', 2], ['shieldGuardian', 2]], 'low');
  b.props_('lamp-post', [[32, 39], [49, 52]]).light(32, 39, 5, 15, FIRE).light(49, 52, 5, 15, FIRE);

  // ----- the Hanging Gardens -----
  b.pool(70, 42, 2, 2);
  b.building("Gardener's Lodge", 73, 30, 5, 4, { mat: 'wood-planks', gm: 'The angel-gardener\'s tools, too big for a human, and a bed of moss. A packet of seeds labelled "for after the long night".', doors: [[75, 33, 's', 'closed']] });
  b.props_('tree-oak', [[67, 32], [74, 40], [68, 46]]).props_('tree-birch', [[66, 37], [74, 44]]).props_('beehive', [[69, 35], [73, 36]]).props_('flowers', [[66, 42], [72, 46]]).prop('statue-tall-winged', 70, 39).prop('lily-pads', 71, 42).prop('bench', 67, 40).prop('workbench', 75, 31);
  b.light(70, 39, 5, 15, SUNLIGHT);
  b.encounter('The grieving garden', [62, 28, 16, 21], [['treant', 2], ['awakenedTree', 4]], 'low');

  // ----- the Giants' Wreck -----
  shell(b, 59, 65, 11, 6, 'stone-flagstone');
  b.door(59, 67, 'w', 'open').door(64, 70, 's', 'closed').door(69, 66, 'e', 'closed');
  b.area("The Giants' Wreck", [[54, 62, 23, 14]], {
    read: 'Half of a castle made of cloud-stone lies tilted on a rocky island, as if it fell out of the sky. Smoke rises from its chimney. A giant\'s voice, enormous and cheerful, is singing out of tune. It is the only singing on Larkspire.',
    gm: 'Three cloud giants whose floating castle broke apart in the spire\'s cold. They took the monastery\'s food and want more: a toll for using "their" bridges. They are greedy, not wicked. They can be bargained with (a magic item, or 5,000 gp, or a really good song: the Hush does not touch them, because they arrived after it fell). Fought, they surrender at half hit points. As friends, they lend a cloud-skiff that flies anywhere on Larkspire in a round.',
    label: [64, 67],
  });
  b.prop('table-feast', 63, 67).prop('throne', 67, 68).prop('hearth-grand', 60, 66).prop('treasure-pile', 68, 69).props_('column-collapsed', [[56, 71], [70, 64]]).props_('rubble-pile', [[57, 65], [72, 72]]).prop('boulder-large', 62, 73).light(60, 66, 10, 20, FIRE);
  b.encounter("The giants' toll", [54, 62, 23, 14], [['cloudGiant', 3]], 'low');

  // ----- the Rock of Wings -----
  b.building('Tomb of the First Lark', 68, 7, 5, 4, { mat: 'marble', read: 'A tiny marble tomb. On the lid of the coffin lies a trumpet of white gold.', gm: 'The first angel of Larkspire. Her trumpet is a horn of valhalla, but the warriors it calls are angelic shades of light. Pellam says it may be taken "if the morning needs it".', doors: [[70, 10, 's', 'closed']] });
  b.prop('sarcophagus-effigy', 70, 8).light(70, 8, 5, 10, SUNLIGHT);
  b.props_('statue-tall-winged', [[66, 12], [75, 13]]).props_('burial-slab', [[68, 13], [73, 14], [75, 9]]).prop('cairn', 67, 9);

  // ----- the Bell Isle -----
  shell(b, 34, 4, 13, 12, 'marble');
  b.wallRun(34, 10, 13, 's').wallRun(39, 11, 5, 'e');
  b.door(36, 15, 's', 'closed', 'door-double').door(36, 10, 's', 'closed').door(34, 7, 'w', 'closed').door(46, 7, 'e', 'closed').door(39, 13, 'e', 'secret').door(44, 10, 's', 'locked', 'door-iron');
  b.area('Terrace of Matins', [[28, 4, 6, 14], [47, 4, 6, 14], [34, 16, 13, 3]], { read: 'A terrace round the white bell tower, its edge open to a drop of miles. The black chains on the bells above you creak in a wind you cannot feel.', gm: 'Fallen devas wheel round the tower like crows. The heroes can enter by the front (Sacristy), the side doors into the Ringing Chamber, or the Angel\'s Step at the back.', label: [31, 11] });
  b.props_('statue-tall-winged', [[31, 7], [48, 7], [31, 14], [48, 13]]).props_('lantern-standing', [[33, 17], [47, 17]]).light(33, 17, 5, 15, FIRE).light(47, 17, 5, 15, FIRE);
  b.area('The Ringing Chamber', [[34, 4, 13, 7]], {
    read: 'The bell chamber of Larkspire: twelve bells of white bronze, each bound in black chain. Around them, in a ring, angels hang in the air like dead birds on strings, their wings grey and their eyes empty. Then, together, every head turns toward you.',
    gm: 'The Hollow Choir: two fallen planetars and three fallen devas, once Anthiel\'s brothers. The Lampwarden turned them by drinking the song out of them. Anthiel, if woken, fights beside the heroes and begs them to spare whoever can be spared: a fallen angel brought to 0 hit points with radiant damage is not killed but healed of its fall (it wakes, weeping, and leaves the fight). Breaking the bells\' chains (AC 18, 40 HP each) and ringing them: each bell rung deals 3d10 radiant damage to every fallen angel in the tower.',
  });
  b.area('Sacristy', [[34, 11, 6, 5]], { gm: 'Vestments, incense, the bell-ropes\' spare coils. A cupboard in the east wall is a secret door to the Hollow Spire (DC 20 Perception: it is warm to the touch on the far side).' });
  b.area('The Hollow Spire', [[40, 11, 7, 5]], { read: 'A small round room at the heart of the tower. A needle of black glass grows up from the floor and through the ceiling, into the bells. The air around it is perfectly silent: not even your heartbeat makes a sound.', gm: 'The third Night Spire (same stats). Within 30 ft of it, Silence (as the spell). It drinks the bells\' song and the sun\'s light together. When it falls, all twelve bells ring at once, and every angel left on Larkspire sings.' });
  b.props_('temple-bell', [[36, 5], [40, 5], [44, 5], [38, 8], [42, 8]]).props_('chains-hanging', [[35, 7], [45, 7]]).prop('winch', 45, 9);
  b.prop('wardrobe', 35, 12).prop('censer-hanging', 37, 13).prop('rope-coil', 38, 14).prop('cupboard', 38, 12);
  b.prop('crystal-spire', 43, 13).prop('rune-tiles', 41, 14);
  b.light(40, 7, 10, 25, NIGHT).light(43, 13, 5, 15, NIGHT).light(36, 13, 5, 10, FIRE);
  b.encounter('The Hollow Choir', [34, 4, 13, 12], [['planetar', 2], ['deva', 3]], 'high');
  return b.build();
}

// ---------- Part 4: Unsolmere, the shadow of the capital ----------
function unsolmere() {
  const b = new MapBuilder('adv-sgo-unsolmere', 'Unsolmere, the Shadow of the City', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dark', wallStyle: 'stone' });

  b.rock(79, 0, 1, 34).rock(79, 46, 1, 34);
  b.rock(0, 50, 31, 30).rock(24, 48, 11, 2);
  b.paint(0, 25, 36, 25, 'dirt').paint(42, 59, 38, 21, 'dirt').paint(1, 19, 31, 6, 'stone-flagstone');
  // the Rift: where Solmere has its river, its shadow has a crack in the world
  along([[49, 0], [48, 14], [43, 26], [41, 40], [35, 54], [33, 66], [35, 79]], 5, (x, y, w) => b.pit(x, y, w, w));
  // streets that fell into the dark
  b.pit(63, 38, 4, 3).pit(29, 30, 3, 3).pit(61, 57, 5, 2).pit(52, 6, 3, 3);
  b.pool(66, 70, 3, 2);

  // ----- the Looking-Glass Gate and the Kingsway Reversed -----
  b.area('The Looking-Glass Gate', [[73, 34, 6, 12]], {
    read: 'You step through the mirror and come out of a gate you know: the West Gate of Solmere, except it is on the east, and the city behind it is black. Black stone, black frost, a black sun overhead that gives off a cold, violet dark. The streets are full of grey shapes, queuing for something.',
    gm: 'Arrival in Unsolmere, the shadow cast by Solmere since the Lampwarden began to drink its light. Everything is reversed: left is right, the river is a rift, the palace is where the Heliodrome should be. King Odran\'s ghost waits here (he died in the cold last winter and his shadow never left). He guides the heroes: the fourth spire is beneath the Inverted Observatory, and the Unqueen guards it.',
    label: [76, 39],
  });
  b.wallRun(74, 34, 5, 'n').wallRun(74, 45, 5, 's');
  b.start(75, 38, 3, 3);
  b.prop('gate-iron-tall', 78, 40).prop('magic-mirror', 77, 36).prop('brazier', 75, 43).prop('notice-board', 73, 41).light(75, 43, 10, 15, SHADE).light(77, 36, 5, 10, SUNLIGHT);
  b.area('The Kingsway Reversed', [[48, 37, 25, 4]], { read: 'The main street runs the wrong way. Shop signs are written backward. A long queue of grey figures shuffles toward the Bone Bridge, each holding out empty hands.', gm: 'The grey figures are shades: echoes of the hours stolen from Solmere\'s people. They are harmless and very sad. A shadow watch patrols the street. Halfway along, a whole block of the road has fallen into the dark.', label: [56, 38] });
  b.props_('lamp-post', [[69, 37], [61, 40], [53, 37]]).props_('cart', [[66, 39], [58, 38]], 90).prop('signpost', 49, 39);
  for (const [x, y] of [[69, 37], [61, 40], [53, 37]]) b.light(x, y, 5, 15, SHADE);
  b.encounter('The shadow watch', [48, 36, 25, 6], [['wraith', 6], ['nightmare', 4], ['shadow', 10]], 'low');

  // ----- the Temple of the Unmorning -----
  shell(b, 59, 3, 18, 13, 'marble');
  b.wallRun(71, 3, 13, 'e').wallRun(72, 8, 5, 's');
  b.door(67, 15, 's', 'closed', 'door-double').door(68, 15, 's', 'closed', 'door-double').door(71, 5, 'e', 'closed').door(71, 12, 'e', 'secret').door(74, 8, 's', 'closed').door(59, 9, 'w', 'closed');
  b.area('Temple of the Unmorning', [[59, 3, 13, 13]], {
    read: 'The shadow of the sun-temple. Where the golden sun-disc should hang there is a black sun, and chained beneath it, on its knees, a demon of fire and shadow twice the height of a man. Its flames are black. It is being used as a lamp.',
    gm: 'A balor, bound here by the Lampwarden as a lamp of black fire to light Unsolmere, with two vrocks as its jailers. It hates its chains more than it hates the heroes. It will bargain: free it (the chains, AC 20, 60 HP, or a Dispel Magic at 9th level) and it fights the vrocks, then goes home and swears to stay out of the war of light and dark. Of course, it is a balor: DC 22 Insight to see it means to keep its word only until it is home. Freed or killed, the black sun goes out and Unsolmere gets darker, which helps stealth (advantage on Stealth checks for the rest of the part).',
    label: [65, 9],
  });
  b.area('Vestry of Ash', [[72, 3, 5, 6]], { gm: 'Robes of grey ash that crumble at a touch. A hidden pocket in one holds a key of black glass: it opens the Vault of Stolen Hours.' });
  b.area('Reliquary of the Last Dusk', [[72, 9, 5, 7]], { read: 'Behind a hidden door, a tiny vault. On a velvet cushion lies a sword-hilt with no blade, and it is cold.', gm: 'The shadow of the sun blade from the Temple of the Morning. If a hero carries the real sun blade, holding both together fuses them: the sun blade becomes a holy avenger that sheds sunlight. Otherwise, a curiosity worth 5,000 gp to a collector of strange things.' });
  for (const y of [8, 10, 12]) b.props_('pew', [[61, y], [63, y], [67, y], [69, y]]);
  b.prop('altar', 65, 5).prop('idol-colossal', 65, 4).props_('wall-chains', [[63, 6], [67, 6]]).props_('column-twisted', [[60, 4], [70, 4], [60, 14], [70, 14]]).prop('brazier-everburning', 65, 7);
  b.prop('wardrobe', 75, 4).prop('candles', 73, 5).prop('reliquary', 74, 12).prop('plinth-display', 75, 14);
  b.light(65, 6, 15, 25, SHADE).light(74, 12, 5, 10, NIGHT);
  b.encounter('The chained lamp', [59, 3, 13, 13], [['balor', 1], ['vrock', 2]], 'low');
  b.area('Close of Ashes', [[61, 16, 16, 7]], { read: 'A square of grey ash in front of the temple. Shades kneel here and pray to the black sun, which does not answer either.', gm: 'King Odran comes here sometimes to sit. A frozen fountain runs backward, its water climbing up into the bowl.', label: [69, 19] });
  b.prop('fountain', 68, 19).props_('bench', [[63, 18], [74, 18]]).prop('statue-tall-robed', 75, 21);

  // ----- the Granary of Hours and the Hag Market -----
  b.building('Granary of Hours', 52, 16, 8, 7, {
    mat: 'wood-planks-dark',
    read: 'Where Solmere has its granary, Unsolmere has a storehouse of hourglasses: thousands of them, stacked to the roof, every one running backward. Each has a little paper label: a name, and a time. "Rhoswen Tamber, the hour she was meant to spend with her son."',
    gm: 'The stolen hours of Solmere. Smashing a shelf of hourglasses (an action) frees some: they fly back through the mirror as motes of gold. If the heroes spend 10 minutes smashing them all, add 2 hours to the Daylight track. A shadow clerk (a harmless shade) begs them not to: "the master will count them."',
    doors: [[55, 16, 'n', 'locked'], [52, 19, 'w', 'closed']], windows: [[59, 19, 'e']],
  });
  b.props_('wall-shelves', [[53, 17], [57, 17], [53, 21]]).prop('scales', 56, 19).prop('crate-stack', 58, 21).prop('book-pile', 55, 21).light(56, 19, 5, 10, SUNLIGHT);
  b.area('The Hag Market', [[56, 24, 16, 12]], {
    read: 'A night market where Bread Square should be. Stalls sell things in bottles: a laugh, a summer, a first kiss. Three old women in shawls run it, calling out prices in sweet voices. Horses with burning manes wait by their stalls.',
    gm: 'Three night hags trade in what the shadow city steals. They know everything about Unsolmere and sell it: the Unqueen\'s weakness (her shadow is her real self: show her the real queen\'s face in a mirror and she is stunned for 1 round), the way through the Tomb of the Unkings, the Falling Stair. Price: a memory each (the hero forgets one thing the player chooses, for good). Fighting them in their market brings their three nightmares and three wraith bodyguards.',
    label: [63, 30],
  });
  b.props_('market-stall', [[58, 25], [62, 25], [68, 25], [58, 34], [68, 34]]).prop('potion-shelf', 65, 31).prop('cauldron-tripod', 63, 28).prop('cage-hanging', 60, 29).prop('shelf-jars', 70, 29).prop('fire-bowl', 66, 27).prop('scales', 61, 32);
  b.light(66, 27, 10, 20, SHADE).light(58, 34, 5, 10, SHADE);
  b.encounter('The Hag Market', [56, 24, 16, 12], [['nightHag', 3], ['nightmare', 3], ['wraith', 3]], 'low');
  b.building('Bakery of Ashes', 73, 24, 6, 8, { mat: 'brick-floor', read: 'The ovens are cold and full of grey bread that crumbles into ash.', gm: 'A shade of the baker from Bread Square bakes here forever. If the heroes have met her living self, she smiles and gives them a loaf of real bread from nowhere: it heals 4d10 and ends the frightened condition.', doors: [[73, 27, 'w', 'closed']] });
  b.prop('hearth-oven', 77, 25).prop('bread-rack', 75, 25).prop('flour-sacks', 77, 30).light(77, 25, 5, 10, SHADE);
  b.building('The Snuffed Candle', 48, 26, 8, 9, {
    mat: 'wood-planks-dark',
    read: 'The shadow of the tavern. Grey drinkers sit in silence over empty mugs. In the window, where the living innkeeper keeps one candle burning, there is a candle of black wax burning with a cold violet flame.',
    gm: 'Safe ground: the shades leave the heroes alone here. A short rest here is safe; a long rest costs 1 Daylight as usual. The shade of the drunk lamplighter knows the Falling Stair goes down into "the Mouth", a cave in the side of the Rift.',
    doors: [[52, 34, 's', 'closed'], [55, 30, 'e', 'closed']], windows: [[48, 28, 'w']],
  });
  b.prop('bar-counter', 50, 28).props_('table-round', [[53, 29], [53, 32]]).props_('chair', [[52, 29], [54, 32]]).prop('fireplace', 54, 27).prop('candles', 48, 30).light(48, 30, 5, 10, SHADE);

  // ----- bridges over the Rift -----
  b.floor(43, 11, 11, 3, 'wood-planks-dark');
  b.area('The Chain Bridge', [[43, 10, 11, 5]], { read: 'A bridge of hanging chains crosses the Rift, swinging over a drop with no bottom. The dark below breathes in and out.', gm: 'DC 14 Acrobatics to cross at speed. Leads to the Court of Hanged Lanterns.', label: [48, 12] });
  b.props_('chains-hanging', [[44, 11], [52, 13]]);
  b.floor(37, 38, 11, 4, 'marble');
  b.area('The Bone Bridge', [[37, 38, 11, 4]], { read: 'A bridge of white bone, carved with suns that are all eclipsed. The queue of shades crosses it toward the palace and does not come back.', gm: 'Four cloakers hang under it like bats. They strike at anyone who crosses who is not a shade (DC 18 Perception to see them; disguise as a shade, DC 16 Deception, and they let you pass).', label: [42, 39] });
  b.props_('lamp-post', [[37, 38], [47, 41]]).prop('statue-tall-winged', 42, 41).light(37, 38, 5, 15, SHADE).light(47, 41, 5, 15, SHADE);
  b.encounter('Under the Bone Bridge', [36, 35, 12, 10], [['cloaker', 4]], 'low');
  b.area('The Rift', [[38, 22, 6, 14]], { read: 'Where Solmere\'s river runs, its shadow has a crack in the world. Look down and there is no bottom: only a violet dark that moves, slowly, like something breathing.', gm: 'A fall into the Rift lasts forever unless the hero can fly or teleport out (or is caught: a Dex save DC 15 to grab the edge). Halfway down the south end, the Falling Stair: a line of stones that hang in the air and lead to the Mouth, a cave in the Rift\'s west wall.', label: [40, 28] });
  b.floor(30, 63, 1, 1, 'stone-flagstone');
  b.area('The Falling Stair', [[30, 58, 8, 10]], { read: 'Stones hang in the dark of the Rift like a stair someone kicked over. Each one sinks a little when you step on it.', gm: 'DC 15 Acrobatics per hero to cross; failure means a fall (DC 15 Dex save to catch the next stone). Leads to the Mouth, the back way into the caves under the Inverted Observatory.', label: [33, 62] });
  b.props_('crumbling-ledge', [[33, 60], [32, 64]]);

  // ----- the Palace of Midnight -----
  shell(b, 1, 1, 28, 18, 'marble');
  b.wallRun(1, 11, 28, 's').wallRun(7, 1, 11, 'e').wallRun(21, 1, 11, 'e');
  b.door(14, 18, 's', 'closed', 'door-double').door(15, 18, 's', 'closed', 'door-double').door(14, 11, 's', 'closed', 'door-double').door(15, 11, 's', 'closed', 'door-double');
  b.door(7, 6, 'e', 'closed').door(21, 6, 'e', 'closed').door(4, 11, 's', 'closed').door(25, 11, 's', 'closed').door(28, 4, 'e', 'secret');
  b.area('Throne of Midnight', [[8, 1, 14, 11]], {
    read: 'The palace stands upside down. Chandeliers stand on the floor like iron trees; the throne hangs from the ceiling, empty. Beneath it, at a table of bone, a vast red devil in a judge\'s robe signs papers, and a line of shades waits to be signed.',
    gm: 'The Midnight Chancellor, a pit fiend, runs Unsolmere for the Lampwarden: he is a clerk of the dark, counting stolen hours, with six vampire spawn as his ushers. He is lawful and loves the rules. He can be beaten by them: the shadow city\'s charter (in the Chancellery) says the Unqueen rules only while the true queen does not walk here. If Queen Elowen (or her signet ring and her blood on a page) comes to his table, he must stamp her claim, and the spawn must step aside. Otherwise he fights.',
    label: [14, 6],
  });
  b.area('Hall of Mirrors', [[1, 1, 7, 11]], { gm: 'Mirrors that show Solmere, the real city, in daylight. Through them the heroes can watch the living queen and her people. A hero who steps into one is pulled back to the real Solmere (and can come back through the Looking-Glass Gate).' });
  b.area('The Chancellery', [[22, 1, 7, 11]], { gm: 'The charter of Unsolmere (see the Chancellor), and ledgers of stolen hours. A secret door in the east wall opens on the Court of Hanged Lanterns.' });
  b.area('Hall of Whispers', [[1, 12, 28, 7]], { read: 'A long hall where shades stand in rows, whispering their names so they do not forget them.', gm: 'King Odran\'s shade will not come in here: "my daughter\'s shadow sits on my throne".', label: [14, 15] });
  b.props_('chandelier-great', [[10, 3], [19, 3], [10, 9], [19, 9]]).prop('table-trestle', 14, 6).prop('throne', 14, 2).prop('scroll-pile', 16, 6).prop('chair-high-back', 14, 7).light(14, 6, 10, 20, SHADE);
  b.props_('magic-mirror', [[2, 2], [2, 6], [5, 10]]).prop('rug-runner', 4, 6).light(3, 6, 5, 10, SUNLIGHT);
  b.prop('writing-desk', 25, 3).props_('archive-stacks', [[23, 7], [27, 7]]).prop('strongbox', 27, 10).light(25, 3, 5, 10, SHADE);
  b.props_('statue-tall-knight', [[3, 13], [26, 13]]).prop('tapestry-tall', 14, 13).props_('bench-long', [[7, 16], [21, 16]]).light(9, 15, 5, 10, SHADE).light(20, 15, 5, 10, SHADE);
  b.encounter('The Midnight Chancellor', [1, 1, 28, 18], [['pitFiend', 1], ['vampireSpawn', 6]], 'moderate');
  b.area('Court of Hanged Lanterns', [[1, 19, 31, 6]], { read: 'A parade ground in front of the palace, where lanterns hang from gibbets, each burning with a stolen sliver of daylight.', gm: 'Each lantern holds about a minute of real sun. Breaking them all (twenty of them) adds 1 hour to the Daylight track and alerts the palace.', label: [15, 21] });
  b.props_('gibbet-post', [[4, 20], [10, 22], [20, 20], [26, 22]]).props_('lantern-hanging', [[5, 20], [21, 20]]).prop('fountain-grand', 15, 22);
  b.light(5, 20, 5, 10, SUNLIGHT).light(21, 20, 5, 10, SUNLIGHT);

  // ----- the Gardens of Ash and the Inverted Observatory -----
  b.area('Gardens of Ash', [[0, 25, 6, 23], [24, 25, 12, 17], [6, 25, 18, 3]], { read: 'The shadow of the Sundial Gardens: hedges of black glass, roses of ash, a gnomon of iron that throws a long shadow even though there is no light to cast it.', gm: 'The iron gnomon\'s shadow points at the Tomb of the Unkings: the shadow city\'s back door down.', label: [29, 34] });
  b.prop('obelisk', 30, 36).props_('hedge', [[2, 30], [33, 27], [26, 40]]).props_('tree-dead', [[3, 44], [34, 41], [25, 28]]).props_('thorn-bush', [[1, 37], [27, 33]]).prop('statue', 3, 26);
  b.building('Tomb of the Unkings', 27, 42, 7, 6, {
    mat: 'stone-flagstone',
    read: 'A tomb of black marble with an eclipsed sun over the door. The stone king on its lid has no face.',
    gm: 'The shadow of the Mausoleum. A secret door in the south wall (DC 18 Perception) leads down to the Crypt of Shadows. The hags know it.',
    doors: [[30, 42, 'n', 'closed', 'door-iron'], [30, 47, 's', 'secret']],
  });
  b.prop('sarcophagus-effigy', 30, 44).props_('urn', [[28, 43], [32, 43]]).prop('candles', 32, 46).light(32, 46, 5, 10, SHADE);
  shell(b, 6, 28, 18, 22, 'marble');
  b.pit(12, 31, 6, 5);
  b.wallRun(6, 39, 18, 's').wallRun(13, 40, 10, 'e').wallRun(17, 40, 10, 'e');
  b.door(14, 28, 'n', 'closed', 'door-double').door(15, 28, 'n', 'closed', 'door-double').door(6, 34, 'w', 'closed').door(23, 34, 'e', 'closed');
  b.door(9, 39, 's', 'closed').door(15, 39, 's', 'open', 'door-double').door(20, 39, 's', 'closed').door(13, 46, 'e', 'secret').door(17, 44, 'e', 'locked', 'door-iron');
  b.door(14, 49, 's', 'open').door(15, 49, 's', 'open');
  b.area('The Inverted Observatory', [[6, 28, 18, 12]], {
    read: 'The shadow of the Heliodrome. Its dome hangs down instead of up: a great bowl of black glass sunk into the floor, and in it, far below, the stars of a night that has never had a day.',
    gm: 'The bowl in the middle is a pit into the dark (a fall lands in the Hall of Echoes far below, 10d6 bludgeoning). The orrery here is black and turns backward. Standing on the bowl\'s rim, a hero can see straight down to the Shadow Spire, and the Unqueen waiting by it.',
    label: [10, 33],
  });
  b.area('Library of Lost Hours', [[6, 40, 8, 10]], { gm: 'Shadow-books of every sunset that did not happen. A bookcase in the east wall is a secret door to the Well of Night (DC 18 Investigation).' });
  b.area('The Well of Night', [[14, 40, 4, 10]], { read: 'A spiral stair goes down into the dark, and the dark comes up it to meet you.', gm: 'The main way down to the Hall of Echoes.' });
  b.area("The Astronomer's Shadow", [[18, 40, 6, 10]], { gm: 'A shadow of Isaura\'s rooms, with the crib full. A boy made of shadow sleeps in it, peaceful. If Isaura is with the heroes, she sees him and understands what the Lampwarden\'s promise really means: forever, but never alive. It breaks the last of her faith in the night.' });
  b.prop('orrery', 20, 31).prop('telescope', 8, 30).props_('pillar-round', [[8, 29], [21, 29], [8, 37], [21, 37]]).prop('astrolabe-stand', 21, 36).prop('chasm-edge', 11, 35);
  b.props_('bookshelf-tall', [[7, 41], [7, 44], [7, 47]]).prop('library-stack', 10, 43).prop('table-reading', 11, 46);
  b.prop('stairs-down', 15, 47).prop('magic-circle', 15, 42);
  b.prop('crib', 22, 44).prop('bed', 22, 41).prop('writing-desk', 19, 41).light(22, 44, 5, 10, SHADE);
  b.light(15, 33, 10, 20, SHADE).light(15, 44, 5, 10, SHADE);

  // ----- under the Inverted Observatory -----
  b.hall(14, 50, 14, 55, 2, { mat: 'dungeon-slab' });
  b.room('Hall of Echoes', 8, 56, 14, 8, {
    mat: 'dungeon-slab',
    read: 'A vaulted hall under the shadow city. Every word you say comes back a moment later in someone else\'s voice, saying something else.',
    gm: 'The echoes say what the heroes are afraid of (DC 16 Wisdom save or frightened for 1 minute; a hero who says aloud why they keep going is immune). Ways on: south to the Shadow Spire, west to the Vault of Stolen Hours, and a secret door east to the Crypt of Shadows.',
  });
  b.props_('pillar-square', [[10, 57], [19, 57], [10, 62], [19, 62]]).prop('altar', 9, 59).props_('banner-hanging-tall', [[12, 56], [16, 56]]).prop('skull-pile', 18, 60).light(9, 59, 5, 10, SHADE);
  b.room('Vault of Stolen Hours', 1, 56, 5, 5, { mat: 'marble', read: 'A small vault full of light. Real light: gold and warm. Hourglasses of crystal line the shelves, every one full of sunshine instead of sand.', gm: 'Locked (the black glass key from the Vestry of Ash, or DC 24 Thieves\' Tools). The Lampwarden\'s private store of the best hours. Opening them all adds 3 hours to the Daylight track. One hourglass is labelled "Odran, King: his last summer": it can be given to his ghost, and lets him rest.' });
  b.hall(6, 58, 7, 58, 1, { mat: 'dungeon-slab' }).door(5, 58, 'e', 'locked', 'door-iron');
  b.props_('wall-shelves', [[2, 57], [4, 57]]).prop('treasure-urn', 2, 59).prop('coffer', 4, 60).light(3, 58, 10, 15, SUNLIGHT);
  b.room('Crypt of Shadows', 24, 55, 6, 10, { mat: 'dungeon-slab', read: 'Stone kings lie in rows, each with a shadow lying beside it that is not quite the same shape.', gm: 'The shadows sit up when the heroes pass, then lie down again. Harmless, unless someone damages a tomb (then 4 shadows per tomb). A secret door in the west wall leads into the Hall of Echoes.' });
  b.tunnel([[30, 48], [29, 51], [27, 55]], 2, { mat: 'dungeon-slab', seed: 41 });
  b.hall(22, 60, 23, 60, 1, { mat: 'dungeon-slab' }).door(23, 60, 'e', 'secret');
  b.props_('sarcophagus-row', [[25, 57], [25, 61]]).prop('sarcophagus-effigy', 28, 59).prop('stairs-up', 29, 55);
  b.cave('The Drowned Mirror', 24, 71, 5, 5, {
    seed: 43,
    read: 'A cave around a still black lake. The water is a perfect mirror, and it does not show you. It shows the real Solmere, upside down, and a young queen asleep at her desk.',
    gm: 'Speaking to the reflection reaches the real Queen Elowen in a dream: she can be asked to come (if she comes through the Looking-Glass Gate, the Chancellor must bow to her and the Unqueen weakens; see the Unqueen\'s notes). The Mouth, from the Falling Stair, opens into this cave.',
  });
  b.water(22, 70, 4, 3, true).props_('stalagmites', [[21, 67], [22, 74]]).prop('reeds', 26, 69);
  b.tunnel([[27, 64], [26, 67]], 2, { seed: 44 });
  b.tunnel([[30, 63], [28, 67]], 2, { seed: 45 });
  b.tunnel([[19, 72], [14, 71]], 2, { seed: 46 });
  b.tunnel([[11, 63], [9, 66]], 2, { seed: 47, mat: 'dungeon-slab' });
  b.area('The Mouth', [[27, 62, 4, 5]], { gm: 'A crack in the Rift\'s wall, at the bottom of the Falling Stair. It opens into the Drowned Mirror.', label: [29, 64] });
  b.cave('The Shadow Spire', 9, 71, 7, 6, {
    seed: 49,
    read: 'A cavern under the shadow city, where a spire of black glass grows downward from the roof like a fang, its tip a hand\'s width from the floor. Light drips from it, gold, and the drops vanish before they land. Beneath it, on a throne of black ice, sits Queen Elowen. Her eyes are black from edge to edge. Beside her, a robed skeleton turns the pages of a star-chart.',
    gm: 'The fourth Night Spire (same stats), guarded by the Unqueen, the Umbral Astronomer (Isaura\'s shadow, or Isaura herself if she died in Part 1 and the dark took her), four vampire spawn and two cloakers. See the Unqueen\'s notes for how she can be broken. When this spire falls, Unsolmere starts to fade, and the shades walk home; the Dark Meridian appears, a black road in the air, leading to the edge of the world.',
  });
  b.prop('crystal-spire', 9, 70).prop('throne', 6, 72).prop('summoning-circle', 10, 73).prop('lectern', 12, 69).props_('stalactites-tall', [[4, 68], [11, 74]]).prop('candle-ring', 7, 75);
  b.light(9, 70, 15, 25, NIGHT).light(6, 72, 5, 10, SHADE);
  b.encounter('The Unqueen at the Shadow Spire', [2, 65, 15, 13], [['unqueen', 1], ['umbralAstronomer', 1], ['vampireSpawn', 4], ['cloaker', 2]], 'high');

  // ----- the eastern shadow-town -----
  b.building('Hall of Snuffed Lamps', 63, 46, 11, 8, {
    mat: 'wood-planks-dark',
    read: 'The shadow of the lamplighters\' hall. Every lamp in it is lit, with flames of black.',
    gm: 'A good hiding place. Under the floor (DC 16 Investigation), a shadow-copy of the cult\'s list of names; here the names are struck through and beside each is written an hour, "redeemed". The cult has been paying its members in other people\'s time.',
    doors: [[67, 46, 'n', 'closed', 'door-double'], [63, 50, 'w', 'closed']], windows: [[73, 49, 'e']],
  });
  b.prop('workbench', 71, 47).prop('lantern-cluster', 68, 49).prop('table-long', 66, 50).prop('barrel-stack', 72, 52).light(68, 49, 5, 10, SHADE);
  shell(b, 55, 46, 6, 5, 'wood-planks-dark').door(57, 46, 'n', 'closed');
  shell(b, 47, 46, 6, 5, 'wood-planks-dark').door(49, 46, 'n', 'closed');
  shell(b, 55, 53, 6, 5, 'wood-planks-dark').door(57, 57, 's', 'closed');
  shell(b, 47, 53, 6, 5, 'wood-planks-dark').door(49, 53, 'n', 'closed');
  b.props_('bunk-bed', [[56, 47], [48, 47], [56, 56]]).prop('crib', 49, 55).prop('stove', 51, 49).prop('kitchen-table', 58, 55);
  b.area('Candle Row Unlit', [[44, 44, 18, 14]], { read: 'Tenements with black candles in every window, and grey families sitting at grey tables, eating nothing.', gm: 'The shades of Candle Row\'s people. Each family here is missing hours from its life in Solmere. A shade-child follows the heroes and will not leave; she can show them the way to anywhere in Unsolmere.', label: [53, 51] });
  b.area('The Weeping Camp', [[42, 60, 36, 19]], {
    read: 'A field of grey tents where the shadows of the dead from the long winter wait in line, holding out their hands for warmth that never comes. Among them walks a tall shade in a crown, speaking to each one by name.',
    gm: 'The shades of those who died of the cold. King Odran walks among them; he chose to stay with his people. He knows the Unqueen\'s secret (see her notes) and asks one thing: tell his daughter he was proud of her. A mirror-pool here shows the real Frostfield Camp.',
    label: [58, 68],
  });
  b.props_('tent', [[45, 63], [50, 62], [56, 64], [62, 62], [48, 70], [54, 72], [70, 64]]).props_('campfire-cold', [[47, 66], [58, 67], [65, 72]]).props_('tree-dead', [[74, 62], [73, 76]]).prop('scarecrow', 44, 75).props_('crop-rows', [[60, 76], [64, 76]]).prop('lily-pads', 66, 70);
  b.light(66, 70, 5, 10, SUNLIGHT).light(58, 67, 5, 10, SHADE);
  return b.build();
}

// ---------- Part 5: the Worldrim and the Last Spire ----------
function worldrim() {
  const b = new MapBuilder('adv-sgo-worldrim', 'The Worldrim and the Last Spire', 80, 80, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor' });
  const CX = 51, CY = 40;
  const deg = (x: number, y: number) => (Math.atan2(y + 0.5 - CY, x + 0.5 - CX) * 180) / Math.PI;
  const inArc = (a: number, a0: number, a1: number) => (a1 > 180 ? a >= a0 || a <= a1 - 360 : a >= a0 && a <= a1);
  const ring = (r0: number, r1: number, put: (x: number, y: number) => void, a0 = -180, a1 = 180) => {
    for (let y = 0; y < 80; y++)
      for (let x = 0; x < 80; x++) {
        const d = Math.hypot(x + 0.5 - CX, y + 0.5 - CY);
        if (d >= r0 && d < r1 && inArc(deg(x, y), a0, a1)) put(x, y);
      }
  };
  const polar = (a: number, r: number): [number, number] => [Math.round(CX - 0.5 + r * Math.cos((a * Math.PI) / 180)), Math.round(CY - 0.5 + r * Math.sin((a * Math.PI) / 180))];
  const radial = (a: number, r0: number, r1: number, w: number, mat: string) => along([polar(a, r0), polar(a, r1)], w, (x, y, ww) => b.floor(x, y, ww, ww, mat));

  // the Last Spire seen from above: three rings of terrace round the Cage of Noon
  ring(22, 28, (x, y) => b.floor(x, y, 1, 1, 'dungeon-slab'));
  ring(15, 20, (x, y) => b.floor(x, y, 1, 1, 'stone-flagstone'));
  ring(9, 13, (x, y) => b.floor(x, y, 1, 1, 'marble'));
  ring(0, 7, (x, y) => b.floor(x, y, 1, 1, 'marble'));
  // the Brink: the east of the outer terrace hangs over the end of the world
  ring(22, 28, (x, y) => b.pit(x, y, 1, 1), -38, 38);
  for (let y = 0; y < 80; y++) for (let x = 76; x < 80; x++) if (y > 18 && y < 62) b.pit(x, y, 1, 1);
  // the second terrace is walled off in the west
  ring(14, 21, (x, y) => b.rock(x, y, 1, 1), 166, 194);
  // stairs between the terraces
  radial(-90, 19, 23, 2, 'stone-flagstone');
  radial(90, 19, 23, 2, 'stone-flagstone');
  radial(0, 12, 16, 2, 'marble');
  radial(180, 6, 10, 2, 'marble');

  // ----- the approach: the far side of the Cinder Rift -----
  b.cave('The Last Camp of Dawn', 9, 70, 7, 6, {
    seed: 61, mat: 'dirt',
    read: 'The black road of the Dark Meridian sets you down at the end of the world. The ground is glass. The sky is empty: no stars, no moon, and low on the horizon a sun the colour of a dying coal. Ahead, across a river of fire, a spire of black glass climbs to the top of the sky, and at its peak something gold flickers in a cage.',
    gm: 'Arrival. The camp of the last sun-priests, a handful of pilgrims who walked here following the light, frozen and starving. They have a fire. Their leader says the cage at the top holds "the sun\'s own child" and that the Lampwarden sits beside it, singing to it. Check the Daylight track: see the tips for what it changes here.',
  });
  b.start(6, 69, 3, 3);
  b.props_('tent', [[5, 66], [12, 67]]).prop('campfire', 9, 71).prop('bedroll', 7, 73).prop('road-shrine', 12, 73).prop('banner-pole', 9, 65).light(9, 71, 10, 20, FIRE);
  b.cave('The Glass Waste', 10, 46, 7, 11, {
    seed: 62, mat: 'dungeon-slab',
    read: 'A plain of black glass, cracked into plates. Under the glass, deep down, you can see the shapes of mountains, forests and towns, as if the world had been poured over with night and set hard.',
    gm: 'The glass rings like a bell under footsteps. Two purple worms swim through the stone under it, drawn by the ringing: walking softly (DC 16 Stealth for the group) avoids them. A worm that bursts up shatters the glass in a 20-ft radius (difficult terrain).',
  });
  b.tunnel([[9, 66], [9, 52]], 3, { seed: 63, mat: 'dirt' });
  b.props_('crystal-cluster', [[7, 42], [13, 51]]).props_('rubble-pile', [[6, 49], [12, 38]]).prop('skull-bleached', 9, 52);
  b.encounter('Worms of the Glass Waste', [3, 36, 15, 22], [['purpleWorm', 2]], 'low');
  b.cave('Field of Fallen Stars', 10, 18, 7, 10, {
    seed: 64, mat: 'sand',
    read: 'Stars lie on the ground here, fallen: lumps of white crystal the size of houses, cracked and dim, some still faintly singing. Two dragons coil among them, licking at the light.',
    gm: 'The stars the Lampwarden ate first. An adult blue and an adult black dragon, drawn by the last scraps of starlight, gorge on them. They serve no one. Clever heroes can set them against each other (DC 18 Deception: each is easily convinced the other is hoarding the best star). A star that still sings can be carried (a large crystal, 200 lb): set it in the Cage of Noon and the Dawnling grows stronger.',
  });
  b.tunnel([[10, 35], [10, 28]], 3, { seed: 65, mat: 'sand' });
  b.props_('crystal-spire', [[7, 14], [13, 22]]).props_('crystal-cluster', [[12, 12], [6, 23]]).prop('cave-crystals', 9, 19).prop('skull-bleached', 13, 16).light(7, 14, 10, 20, FROST).light(13, 22, 5, 15, FROST);
  b.encounter('The starless wyrms', [3, 8, 15, 21], [['adultBlueDragon', 1], ['adultBlackDragon', 1]], 'low');
  // the Cinder Rift: the sun's spilled fire, between the waste and the spire
  b.lava(19, 0, 3, 80);
  b.floor(14, 39, 11, 3, 'stone-flagstone');
  b.area('The Cinder Bridge', [[14, 38, 11, 5]], {
    read: 'A narrow bridge of black stone crosses a river of slow gold fire: the sun\'s blood, leaking out of the spire\'s roots. Chained at either end, figures of living flame stand guard, heads bowed.',
    gm: 'Two efreet and four salamanders, the sun\'s own fire-folk, enslaved by the Lampwarden with chains of night (AC 19, 30 HP each). They attack because they must. A hero who breaks a creature\'s chain frees it: it stops fighting and, freed, every fire creature here fights for the heroes until the end of this part. Lava: 10d10 fire damage on entering or starting a turn in it.',
    label: [19, 40],
  });
  b.props_('wall-chains', [[15, 39], [23, 41]]).prop('lava-crack', 17, 41).light(19, 40, 15, 25, EMBER);
  b.encounter('Wardens of the Cinder Bridge', [13, 36, 12, 9], [['efreeti', 2], ['salamander', 4]], 'low');
  b.tunnel([[16, 16], [24, 16], [31, 21]], 2, { seed: 66, mat: 'stone-flagstone' });
  b.floor(18, 15, 5, 3, 'stone-flagstone');
  b.area('The Moth Stair', [[16, 14, 15, 8]], { read: 'A natural arch of stone bridges the fire. Pale moths as big as hands cover it, drinking the heat.', gm: 'The second way onto the spire, round the north. The moths fly up in a cloud when anyone crosses (heavily obscured for 1 round) and the noise wakes the Field of Fallen Stars.', label: [23, 16] });
  b.prop('mushrooms', 26, 18).light(20, 16, 10, 20, EMBER);

  // ----- the outer terrace -----
  b.area('Gate of Dusk', [[23, 36, 7, 9]], {
    read: 'The foot of the Last Spire is a terrace of black glass a mile around. A gate stands here with no wall either side of it, two pillars and a lintel carved with a setting sun. Beyond it, the terrace curves away into the dark.',
    gm: 'Where the Cinder Bridge lands. The gate is only a gate. The Lampwarden knows when it is passed (and says the heroes\' names, gently, out of the air).',
    label: [26, 40],
  });
  b.prop('archway-grand', 25, 40).props_('obelisk', [[24, 37], [24, 43]]).light(25, 40, 5, 15, EMBER);
  b.area('Terrace of Cinders', [[30, 12, 42, 6], [24, 18, 8, 16], [24, 46, 8, 16], [30, 62, 42, 6]], { read: 'The outer terrace runs round the spire, a road of black glass under a wall of black glass. Statues of every sunrise god anyone ever prayed to line it, all with their faces turned to the wall.', gm: 'Two stairs lead up to the second terrace, north and south. The garrison of fiends holds the south side.', label: [29, 27] });
  b.props_('statue-tall-robed', [[30, 22], [27, 32], [27, 49], [33, 58], [45, 14], [58, 14], [45, 66], [58, 66]]).props_('lava-crack', [[38, 15], [40, 64]]);
  b.light(30, 22, 5, 10, EMBER).light(33, 58, 5, 10, EMBER);
  b.area('The Brink', [[68, 22, 11, 36]], {
    read: 'The terrace simply stops. Past its broken edge there is nothing: not dark, not sky, not void. Nothing. Looking at it too long makes your eyes water and your thoughts slide.',
    gm: 'The end of the world. Anything that goes over the Brink is gone (no save beyond the first DC 15 Dexterity save to catch the edge; a Wish could bring it back). The Lampwarden will not fight near it: even she is afraid of it.',
    label: [74, 40],
  });
  b.props_('chasm-edge', [[68, 33], [73, 46]]);
  b.cave('The Starwell', 72, 8, 4, 3, { seed: 67, mat: 'marble', read: 'A round chamber cut into the rock, open to the empty sky. In its middle a well holds water so still and dark it shows stars that are not in the sky above.', gm: 'The stars the Lampwarden has not yet eaten are hidden here, reflected. Drinking from it: a hero regains all expended spell slots of 5th level and lower, once. A Wish cast here costs nothing (no stress).' });
  b.tunnel([[64, 18], [70, 10]], 2, { seed: 68, mat: 'marble' });
  b.prop('well', 72, 8).prop('crystal-lamp', 74, 9).light(72, 8, 5, 15, FROST);
  b.cave('Ossuary of Suns', 72, 71, 4, 3, { seed: 69, mat: 'marble', read: 'A tomb full of golden skulls, each the size of a fist, each faintly warm. The bones of dead suns, kept by someone who loved them.', gm: 'The Lampwarden\'s secret grief: she has kept the remains of every sun she ever tended. A hero who brings one golden skull before her in the last fight gives advantage on any check to talk her down. The skulls are worth a fortune (100 of them, 500 gp each), but taking more than one feels very wrong.' });
  b.tunnel([[64, 62], [70, 70]], 2, { seed: 70, mat: 'marble' });
  b.props_('skull-pile', [[71, 70], [74, 72]]).prop('ossuary-shelf', 73, 69).light(72, 71, 5, 10, SUNLIGHT);
  b.room('Garrison Barracks', 23, 66, 11, 7, { mat: 'dungeon-slab', read: 'A long cave of bunks and weapon racks, made for things much bigger than people.', gm: 'The fiends\' barracks. A strongbox of tribute: everything the cult sent its master.' });
  b.tunnel([[33, 59], [29, 66]], 2, { seed: 71, mat: 'dungeon-slab' });
  b.props_('bunk-bed', [[24, 67], [27, 67], [30, 67]]).prop('weapon-rack', 32, 70).prop('strongbox', 25, 71).prop('brazier', 29, 70).light(29, 70, 5, 15, EMBER);
  b.encounter('The garrison of the terrace', [23, 56, 22, 17], [['marilith', 1], ['nalfeshnee', 2]], 'low');
  b.room('Hall of Stolen Dawns', 40, 2, 22, 7, {
    mat: 'marble',
    read: 'A long hall cut into the cliff above the terrace, lined with shelves. On every shelf stands a jar, and in every jar a sunrise: a little gold-pink sky, with tiny clouds, turning slowly.',
    gm: 'Every dawn stolen from the world since the spires were raised. Opening a jar releases a dawn: a burst of sunlight in a 30-ft radius (as the Daylight spell, plus 2d10 radiant damage to fiends and fallen angels in it). There are 40 jars: if the heroes carry them out and open them all at once outside, add 4 hours to the Daylight track.',
  });
  b.hall(51, 9, 51, 11, 2, { mat: 'marble' });
  b.props_('wall-shelves', [[42, 3], [46, 3], [50, 3], [54, 3], [58, 3]]).props_('shelf-jars', [[44, 7], [48, 7], [56, 7]]).prop('lectern', 60, 5).light(51, 5, 10, 25, SUNLIGHT);

  // ----- the second terrace -----
  b.area('North Stair', [[49, 17, 4, 6]], { gm: 'A stair cut through the inner wall. Wind howls up it from the Brink.', label: [51, 19] });
  b.area('South Stair', [[49, 58, 4, 6]], { gm: 'A stair cut through the inner wall, its steps worn by hooves.', label: [51, 60] });
  b.props_('stairs-up', [[51, 18], [51, 61]]);
  b.area('Gallery of the Fallen', [[34, 20, 34, 5], [64, 24, 8, 32], [34, 55, 34, 5]], {
    read: 'The second terrace climbs in a slow curve. Its wall is carved with angels, thousands of them, all with their wings folded and their faces covered. Some of the carvings are not carvings: they open their eyes.',
    gm: 'The Lampwarden\'s own host waits on the east side, where the terrace looks out over the Brink: two fallen planetars and four fallen devas. They are tired and frightened; they fell because they loved her. Any hero who has freed Anthiel or the Hollow Choir and says so makes them hesitate; the Hymn of Matins sung here gives each one a DC 18 Wisdom save: on a failure, it lays down its sword and weeps. The way in to the third terrace is the Brink Stair on the east.',
    label: [68, 40],
  });
  b.props_('statue-tall-winged', [[40, 23], [60, 23], [66, 30], [66, 50], [41, 56], [60, 57]]).prop('candle-stand-tall', 68, 36);
  b.light(66, 30, 5, 15, NIGHT).light(66, 50, 5, 15, NIGHT).light(40, 23, 5, 10, NIGHT);
  b.encounter('The fallen host', [62, 24, 10, 32], [['planetar', 2], ['deva', 4]], 'moderate');
  b.floor(37, 34, 2, 1, 'dungeon-slab').door(37, 34, 'w', 'secret');
  b.area("The Traitor's Niche", [[34, 33, 6, 3]], { gm: 'Where the second terrace runs into the wall that closes off its west side. Graffiti in Celestial, scratched with a sword point: "She was right about the dying. She was wrong about the cure." A secret door (DC 22 Perception) opens on a crawl that leads straight up to the third terrace.' });
  b.prop('rubble-pile', 36, 33);

  // ----- the third terrace and the Cage of Noon -----
  b.area('Brink Stair', [[61, 38, 5, 4]], { gm: 'Steep steps cut through the inner wall, right on the edge of the Brink. DC 12 Acrobatics or slip (DC 15 Dex save to catch yourself).', label: [63, 40] });
  b.area("The Gaoler's Walk", [[40, 27, 22, 4], [40, 49, 22, 4], [39, 31, 4, 18], [58, 31, 4, 18]], {
    read: 'The top terrace is a narrow ring of white stone round the summit. From here you can see the whole dead world, black glass to every horizon. And above you, on the summit, the cage.',
    gm: 'The Gaoler of Noon, a pit fiend with the keys of the cage on a chain round its neck, walks the ring with an iron golem. The Gaoler is a bureaucrat of the dark and keeps exact hours: it can be tricked by anyone who rings a bell or sounds a horn and shouts "Noon!" (DC 20 Deception), because it must then unlock the cage for the noon inspection. The Last Stair is on the west side.',
    label: [51, 29],
  });
  b.props_('lantern-standing', [[42, 30], [59, 30], [43, 49], [58, 49]]).prop('lever', 40, 40);
  b.light(42, 30, 5, 15, NIGHT).light(58, 49, 5, 15, NIGHT);
  b.encounter('The Gaoler of Noon', [40, 26, 22, 6], [['pitFiend', 1], ['ironGolem', 1]], 'moderate');
  b.area('The Last Stair', [[42, 38, 4, 4]], { gm: 'Twelve white steps up to the summit. On each step, carved: an hour.', label: [44, 40] });
  b.props_('stairs-up', [[44, 40]]);
  b.area('The Cage of Noon', [[46, 35, 11, 11]], {
    read: 'The top of the world. In the middle of a round floor of white stone stands a cage of black iron, and in the cage, a child made of light, curled up, flickering like a candle in a draught. Beside the cage, a tall woman with six wings of ash-grey sits on the floor with her arms through the bars, holding the child\'s hand. She looks up at you, and her face is the kindest, saddest thing you have ever seen. "You came all this way," says Ombrael, the Lampwarden. "I am so sorry."',
    gm: 'The last Night Spire is the cage itself: its bars drink the sun-child\'s light and pour it into Ombrael. The cage: AC 22, 300 HP, immune to everything but radiant and force; the Gaoler\'s keys open it. Ombrael (solar) fights with two fallen planetars and two fallen devas of her inner choir; she would much rather talk (see her notes). The Daylight track changes this fight: see the tips. Opening the cage ends it either way: the Dawnling rises, and the sun comes back.',
    label: [51, 40],
  });
  b.prop('cage', 51, 39).prop('magic-circle', 51, 42).props_('column-fluted', [[47, 37], [55, 37], [47, 43], [55, 43]]).prop('crystal-spire', 54, 40);
  b.light(51, 39, 20, 30, SUNLIGHT).light(54, 40, 5, 10, NIGHT);
  b.encounter('Ombrael at the Cage of Noon', [45, 34, 13, 13], [['solar', 1], ['planetar', 2], ['deva', 2]], 'high');
  return b.build();
}

export const SUN_GOES_OUT: Adventure = {
  id: 'sun-goes-out',
  title: 'The Sun Goes Out',
  tagline: 'Every day is an hour shorter than the last. Topple five spires of night and climb to the end of the world to bring back the sun.',
  levels: '17-20',
  sessions: '8-12 sessions',
  players: '3-5 players',
  tags: ['epic', 'campaign', 'angels', 'apocalypse', 'five-part'],
  pitch:
    'It is midsummer, and there is frost on the roses. A month ago the people of Solmere noticed the sun rising late. Now every day is an hour shorter than the last. The harvest froze in the fields; the northern sea has frozen solid; the angels of the mountain monastery have stopped singing. At this rate, in eight days the sun will not rise at all. The Queen of Solmere has sent for the greatest heroes in the land. That is you.',
  secret:
    'Ombrael the Lampwarden is a solar, the angel who has lit the sun every morning since the world began. Ten thousand years of dawns taught her one terrible fact: every sunrise is a clock, and the sun is counting down every mortal life to its end. She has watched too many die. So she decided to stop the clock. In secret she raised five Night Spires across the world, needles of black glass that drink sunlight and pour it along a road of darkness, the Dark Meridian, to the Last Spire at the edge of the world, where the sun\'s own living spark, the Dawnling, sits in a cage. When the last light is drunk, the world will freeze in an endless night where nothing grows, nothing changes and nothing ever dies again. She believes this is mercy. Her servants are angels who fell for love of her, a royal astronomer she promised would never lose another child, frost giants she promised an eternal winter, and a shadow of the capital itself. Why now: the sun was due to be relit for its next ten-thousand-year age this summer, and she simply did not light it.',
  hooks: [
    'Queen Elowen of Solmere sends a royal summons sealed with black wax: "The sun is going out. I am told you are the best there is. Come now."',
    'A hero\'s mentor, a sun-priest, dies in their arms in the cold, whispering: "the Lampwarden... she has stopped the dawn."',
    'The heroes see the sunrise come an hour late three days running, then find a black glass needle on their map, drawn there overnight by an invisible hand. It is under the royal observatory.',
  ],
  tips: [
    'Keep the Daylight track in view. It starts at 8 hours. Each long rest anywhere costs 1 hour. Each Night Spire toppled adds 2 hours (up to 16). Some side areas add more. Describe the light every scene: the players should feel every hour.',
    'At the final fight, the Daylight track matters. At 0 hours Ombrael has advantage on all saving throws and the Dawnling cannot help. At 6 or more, the Dawnling can act once per round to give one hero advantage on an attack or save. At 10 or more, Ombrael starts the fight with half her hit points.',
    'Many fights can be turned instead of fought: the white dragon, the ice devil, Hrimmora, the kraken, Anthiel, the cloud giants, the balor, the Chancellor, the fire-folk, the fallen host. Reward clever talk with the same experience as a fight. Several of these become allies who can show up in Part 5.',
    'Radiant damage is king against the spires and fallen angels. Hand out the sun blade (Part 1) and the trumpet of the First Lark (Part 3) early, so radiant-poor parties can still hurt the spires.',
    'Each part is a complete chapter of one to three sessions. If time is short, run only the main scenes and let the heroes ride a beam of the falling spire\'s light to the next place.',
    'Ombrael is not a monster. Let her be kind, tired and sure she is right. The best ending is the one where the heroes convince her to let the sun go on dying, a little every day, because that is what makes a day worth anything.',
  ],
  npcs: [
    {
      id: 'pf_sgoombrael', name: 'Ombrael the Lampwarden', title: 'the angel who stopped the dawn', kind: 'monster', art: 'solar', monsterId: 'solar',
      wants: 'To hold the world in one endless, unchanging night, so that no mortal ever dies again. She wants the heroes to agree with her.',
      knows: 'Everything about the sun: how it is lit, how it will one day go out, the name of every sun before it. Every spire, every servant, every hour she has taken.',
      voice: 'Soft, warm, slow, like someone sitting up all night with a sick friend. She never raises her voice. She apologises before every blow.',
      appearance: 'A towering woman with six wings the grey of cold ash, a face of terrible kindness and hands blackened as if she held a coal for ten thousand years.',
      backstory: 'The Lampwarden lit the sun every dawn of the world. She knew every mortal she shone on, and watched every one of them die. When the sun was due to be relit for a new age, she could not bear to start the clock again.',
      gmNotes: 'Solar stat block. She can be talked down, and the game should reward trying: DC 25 Persuasion (Wisdom or Charisma based), with advantage for each of: reading her own oath to her (handout), showing her a golden skull from the Ossuary of Suns, Isaura or Anthiel speaking for the heroes, the Dawnling being freed first. Persuaded, she opens the cage herself, and asks to be allowed to light the sun one last time. If killed, the sun still returns, but someone must take her place as Lampwarden.',
    },
    {
      id: 'pf_sgoisaura', name: 'Isaura Kestrane', title: 'Royal Astronomer of Solmere', kind: 'monster', art: 'archmage', monsterId: 'archmage',
      wants: 'For no child to ever die again. Most of all, for it to have meant something that hers did.',
      knows: 'The five spires and where they stand, the Dark Meridian, the Lampwarden\'s name and promise, and the password to the Heliodrome\'s golems.',
      voice: 'Precise and quiet, like someone reading measurements. When she talks about her son, her voice goes very flat.',
      appearance: 'A tall woman of fifty in a midnight-blue robe sewn with silver stars, with ink-stained fingers and a lock of a child\'s hair in a locket at her throat.',
      backstory: 'Her son Cael died of a winter fever a year ago. A month later, an angel with grey wings came to her observatory and offered her a world where no one would ever lose a child again.',
      gmNotes: 'Archmage stat block. She can be talked down at the First Spire (DC 22 Persuasion; automatic if the heroes have been to House Kestrane and speak of Cael with honesty). Spared, she becomes a priceless ally: she knows where every spire stands, and can come to the Shadow Spire in Part 4, where seeing her son\'s shadow ends her faith in the night for good. If she dies, the dark remakes her as the Umbral Astronomer in Part 4.',
      shared: true,
    },
    {
      id: 'pf_sgoelowen', name: 'Queen Elowen', title: 'the young queen of Solmere', kind: 'npc', art: 'queen', monsterId: 'noble',
      wants: 'To keep her people alive through the dark, and to be the queen her father was.',
      knows: 'Every report from every corner of the kingdom; that the Royal Astronomer vanished a week ago; that her father\'s ghost has been seen in mirrors since the cold began.',
      voice: 'Brisk and practical, too fast, a girl doing a woman\'s job. She says "right" before she decides anything.',
      appearance: 'A small woman of twenty-two in a fur cloak over plain armour, with ink on her fingers and her father\'s signet ring on a string round her neck.',
      gmNotes: 'Brave and smart, and out of her depth. She gives the heroes her seal (opens any door in Solmere). In Part 4 she can be reached through the Drowned Mirror and asked to walk into Unsolmere herself: if she does, the Chancellor must bow to her, and the Unqueen loses her regeneration.',
      shared: true,
    },
    {
      id: 'pf_sgounqueen', name: 'The Unqueen', title: 'the shadow of Queen Elowen', kind: 'monster', art: 'vampire', monsterId: 'unqueen',
      wants: 'To be the only queen: to rule a city where no one is ever hungry or cold again, because no one ever feels anything again.',
      knows: 'Everything Elowen knows, and everything she fears. The way to the Dark Meridian, which opens when the Shadow Spire falls.',
      voice: 'Elowen\'s voice, slowed down, with all the hurry taken out. Calm, tender and terrible. She says "right" after she decides, not before.',
      appearance: 'Elowen, exactly, but in a gown of black frost, with eyes black from edge to edge and her father\'s crown on her head.',
      backstory: 'Every fear the young queen has had since her father died, given a body by the long night: the fear of failing her people, and the wish to stop feeling it.',
      gmNotes: 'Unqueen stat block (her own: frost, regeneration and royal commands). She is broken by the truth: if the heroes give her Odran\'s message ("he was proud of her"), or the real Elowen looks her in the face, she must make a DC 18 Wisdom save at the start of each of her turns or do nothing that turn but weep. Reduced to 0 hit points she does not die; she fades, and the real Elowen in Solmere wakes feeling lighter than she has in a year.',
    },
    {
      id: 'pf_sgoskarra', name: 'Skarra Tidewife', title: 'storm giant oracle of the Whitewake', kind: 'npc', art: 'stormGiant', monsterId: 'stormGiant', shared: true,
      wants: 'The sea to move again. The ice is killing everything she loves, and her ancestor\'s skull has been made a weapon.',
      knows: 'The song of Oruvald, the titan whose skull lies in the ice; the three ways into the skull; that the frost giants were promised an eternal winter. Her cauldron can show the other spires.',
      voice: 'Deep and rolling like surf. She sings when she is thinking and laughs like thunder at her own jokes.',
      appearance: 'A giantess thirty feet tall, with sea-green skin, white hair braided with shells and fishing floats, and a harpoon as long as a ship.',
      gmNotes: 'Storm giant stat block. An ally: she fights beside the heroes against frost giants but will not enter the skull ("it is a grave"). She can carry them to Larkspire in a thunderstorm after the second spire falls.',
    },
    {
      id: 'pf_sgohrimmora', name: 'Jarl Hrimmora', title: 'frost giant queen of the Whitewake', kind: 'monster', art: 'frostGiant', monsterId: 'frostGiant',
      wants: 'Winter forever: the sea frozen, the south weak, her people kings of the ice. She also wants to be no one\'s servant.',
      knows: 'The ear-way into the skull and how to open its ice plug; that a grey angel promised her the world as a frozen hall; that some of her warriors have started to worship it.',
      voice: 'A roar that always sounds amused. She calls everyone "little one", even other giants.',
      appearance: 'A blue-white giantess in a cloak of polar bear pelts, a crown of icicles on her head and a greataxe of black ice across her knees.',
      gmNotes: 'Frost giant stat block (the strongest of her clan; give her max hit points). She can be turned: see the Mead-Hall. Turned, she fights beside the heroes in the skull, and her giants hold the jaw. Her warriors in the Brain Vault are the ones who turned against her: she wants them punished.',
    },
    {
      id: 'pf_sgoanthiel', name: 'Anthiel', title: 'planetar warden of Larkspire', kind: 'monster', art: 'planetar', monsterId: 'planetar', shared: true,
      wants: 'His voice back, his brothers saved, and the bells of Larkspire ringing again.',
      knows: 'That a grey angel came to pray and stayed; that his brothers of the choir fell to her; that she was once the greatest of them all, and his teacher.',
      voice: 'Silent at first, his mouth sewn shut. Woken, a voice like a cathedral organ, very gentle, that cracks when he speaks of Ombrael.',
      appearance: 'An angel of bronze skin and white wings, nine feet tall, with a greatsword and black thread stitched through his lips.',
      gmNotes: 'Planetar stat block. A foe in the Choir Garth until woken (see there), then a powerful ally for the rest of Part 3. He will come to the Worldrim if called, and his word makes the fallen host hesitate. He cannot fight Ombrael himself: he loves her too much.',
    },
    {
      id: 'pf_sgopellam', name: 'Brother Pellam', title: 'last novice of Larkspire', kind: 'npc', art: 'monk', monsterId: 'acolyte', shared: true,
      wants: 'To not be alone, and to be brave enough to sing.',
      knows: 'The Hymn of Matins by heart, every bridge on Larkspire, and where the abbot hid his amulet. He saw the grey angel go into the bell tower.',
      voice: 'A whisper that keeps cracking into a squeak. He apologises constantly. When he finally sings, his voice is astonishing.',
      appearance: 'A skinny boy of sixteen in a habit three sizes too big, with a shaved head growing back in fuzz and a lark feather behind his ear.',
      gmNotes: 'Acolyte stat block. He has hidden in the Weather Mill for three weeks. The Hymn of Matins needs one true singer: if Pellam sings it, not a hero, it always works. Getting him to the Choir Garth and the bell tower alive is a quest of its own.',
    },
    {
      id: 'pf_sgoodran', name: 'King Odran', title: 'ghost of the old king of Solmere', kind: 'npc', art: 'ghost', monsterId: 'ghost', shared: true,
      wants: 'For his daughter to know he was proud of her. For his people\'s shades to go home.',
      knows: 'Every street of Unsolmere; the Unqueen\'s weakness; the Falling Stair and the Tomb of the Unkings; that the Vault of Stolen Hours holds his own last summer.',
      voice: 'A big, warm voice made thin, like a shout heard from far away. He tells bad jokes on purpose to make the shades smile.',
      appearance: 'A broad grey shade of an old man with a beard to his belt and a crown of frost, wearing a soldier\'s coat instead of royal robes.',
      gmNotes: 'Ghost stat block, but he will not fight. He died in the cold last winter, the first of many. Giving him his hourglass from the Vault of Stolen Hours lets him rest: he fades smiling, and leaves his crown behind (see treasure).',
    },
    {
      id: 'pf_sgodawnling', name: 'The Dawnling', title: 'the living spark of the sun', kind: 'npc', art: 'lantern-spirit',
      wants: 'To be let out. To rise.',
      knows: 'Only light and warmth and the names of every flower that has ever opened toward it.',
      voice: 'No words: it hums, like a summer afternoon full of bees. When happy it laughs, and the laugh is warm on your skin.',
      appearance: 'A small child made of gold light, curled up, flickering like a candle in a draught. The brighter the day, the clearer its face.',
      gmNotes: 'Not a fighter. The sun\'s own living spark, caged in the Last Spire. How strong it is depends on the Daylight track (see the tips). Freed, it rises through the top of the cage and the sky, and the sun comes back.',
    },
  ],
  handouts: [
    { id: 'proclamation', title: 'Proclamation of the Queen', text: 'BY ORDER OF ELOWEN, QUEEN OF SOLMERE:\nThe granaries are closed save by my word.\nNo one shall burn furniture of the temples or the poor.\nAll who can make fire or light by any art are called to the palace.\nThe day is shorter by one hour each dawn. Today it is eight hours long.\nWe will not be afraid of the dark. — E.' },
    { id: 'lampwarden-promise', title: 'A letter on Isaura Kestrane\'s desk', text: 'Dear Isaura,\nYou have measured the sky for thirty years. You know as well as I do that every sunrise takes a day from someone. I have counted them all. I will not count Cael\'s again for any other child.\nHold the first door. When the long night comes, no one will ever lose a child again. I promise you.\n— O., Lampwarden' },
    { id: 'spire-chart', title: 'The star-chart in the Orrery Hall', text: 'A chart of the world with five black needles drawn on it in silver ink:\nI. Under the Heliodrome. (Solmere)\nII. In the skull of the titan, on the Whitewake. (north)\nIII. In the bell tower of Larkspire. (the sky)\nIV. "In the city\'s shadow." (??)\nV. At the edge of the world, where the Meridian ends.\nA dotted line joins them all: "the Dark Meridian."' },
    { id: 'song-of-oruvald', title: 'The song of Oruvald (sung by Skarra)', text: 'Oruvald walked on the sea and the sea was his road,\nhe fought the cold until the cold forgot his name.\nHe lay down on the water when his long day was done:\nhis eyes still watch the sky, his mouth still sings the sun.\nThree doors he left for his grandchildren: the mouth that sang,\nthe eyes that watched, and the ear that listened to the sea.' },
    { id: 'hymn-of-matins', title: 'The Hymn of Matins', text: 'Wake, you who keep the morning,\nthe night was long, the night is done.\nLift up your wings, lift up your voices,\nthe lark is singing for the sun.\nNo dark so deep it holds the dawning,\nno sleep so long the day won\'t come.\n(Sung to the old tune. One true voice is enough.)' },
    { id: 'lampwarden-oath', title: 'The Oath of the Lampwarden (carved on the Cage of Noon)', text: 'I will light the sun each morning,\nand I will not ask who it shines on.\nI will light it for the newborn and the dying,\nfor the wheat that grows and the frost that kills.\nI will not keep the day. I will give it away.\nAnd when my own day ends, another will light it,\nand the morning will not miss me.' },
  ],
  chapters: [
    {
      id: 'solmere', title: 'Part 1: The City of Noon', level: 17,
      summary: 'A great capital in midsummer frost: bread riots stirred by a cult in lamplighters\' coats, a dark temple full of shadows, a white dragon on a bridge, and under the royal observatory, the first Night Spire and the grieving astronomer who guards it.',
      goal: 'Find out why the sun is dying, find the Royal Astronomer, and topple the first Night Spire under the Heliodrome.',
      map: solmere,
      npcs: [
        { npc: 'pf_sgoelowen', x: 64, y: 4 },
        { npc: 'pf_sgoisaura', x: 70, y: 72 },
      ],
      scenes: [
        { room: 'The West Gate', title: 'Frost at midsummer', read: 'Frost furs the gate of Solmere in the middle of summer. The sun hangs low and copper-coloured over the roofs at what should be noon, and gives no warmth at all. The guards look at you as if you were the answer to a prayer.', gm: 'Start the Daylight track at 8 hours. The guards point the heroes to the palace. On the way, the Kingsway: carts of frozen food, shuttered shops, a crier reading the proclamation (handout).', handout: 'proclamation' },
        { room: 'Bread Square', title: 'The bread riot', encounter: 'The Unlit in Bread Square', read: 'Hundreds of people pack the square, shouting for bread. A man in a lamplighter\'s black coat stands on a barricade and yells that the queen is hoarding grain and the sun has turned its back on the crown. Someone throws the first stone.', gm: 'The cult stirs the crowd. See the area notes for ways to end it without a massacre. Capturing a cultist alive gives the first lead: "the Astronomer holds the door; the Lampwarden comes."', treasure: 'On the assassins: 600 gp, two potions of superior healing, and black disc tokens of the Unlit.' },
        { room: 'Throne Room of Noon', title: 'The queen on the steps', read: 'The throne room was built to catch the sun. Today the light through its hundred windows is grey. A young queen in a fur cloak sits on the steps of her own throne, surrounded by maps, and stands up when she sees you.', gm: 'Elowen asks for help, plainly. She gives her seal and points them at the Heliodrome: the Royal Astronomer has vanished. If asked, she admits her father\'s face has been appearing in her mirrors. The War Room reports set up Parts 2 and 3.' },
        { room: 'Temple of the Morning', title: 'The dark temple', encounter: 'Shadows in the temple', optional: true, read: 'Ten thousand candles stand unlit. The golden sun-disc above the altar has gone the grey of a dead coal. Something moves along the ceiling like a cloak drifting in water.', gm: 'Relighting the eternal flame wins the fight in one move (see the area). The temple\'s grateful priests give the heroes the sun blade from the hidden reliquary.', treasure: 'Sun blade (from the Reliquary of the First Dawn), the alms chest (1,200 gp, which the priests ask the heroes to spend on the camp).' },
        { room: 'The Coldbridge', title: 'The white wyrm', encounter: 'The white wyrm on the Coldbridge', optional: true, read: 'The drift on the old bridge rises and falls, slowly. Then it opens one blue eye.', gm: 'An adult white dragon enjoying the weather, not a servant of the night. Talk, bribe with a cow, or point it north to the Whitewake. Fought, it flees at half hit points: it may turn up again in Part 2.' },
        { room: 'House Kestrane', title: 'A mother\'s house', optional: true, handout: 'lampwarden-promise', read: 'Every mirror is covered with black cloth. In the nursery the bed is made and a candle burns beside a small portrait of a smiling boy.', gm: 'The key to Isaura. The letter (handout) names the Lampwarden. The boy\'s name, Cael, is also the password that stops the orrery golems.', treasure: 'A ring of spell storing on Isaura\'s dresser, holding Counterspell and Greater Restoration.' },
        { room: 'The Orrery Hall', title: 'The black orrery', encounter: 'The orrery guardians', handout: 'spire-chart', read: 'Under the great dome turns the royal orrery, its brass sun as black as soot. As you watch, its arms swing round to point at you, and the floor shakes with heavy footsteps.', gm: 'The golems guard the way to the Star Well. "Cael" stops them. The star-chart of the five spires lies on the star-table: the whole campaign in one picture.', treasure: 'In the Astronomer\'s Tower: a crystal ball and a robe of stars.' },
        { room: 'Crypt of the Sun-Kings', title: 'The back ways', optional: true, gm: 'Three ways reach the spire: the Star Well stair (front door, into the Undercroft), the Mausoleum and crypt (secret, via the garden), or the river culvert and the Worm Galleries. Whichever they take, the cult in the Undercroft knows they are coming unless they use the culvert.' },
        { room: 'Undercroft of the Unlit', title: 'The prisoners', read: 'Black banners with a hole in the middle, like an eclipse. Benches facing an altar of night-glass. In iron cages, people in nightclothes look up at you without hope.', gm: 'Eight prisoners to free, including the real guildmaster of the lamplighters. Freed, they swear the heroes will never pay for a drink in Solmere again. The iron door to Kestrane\'s Reliquary is here.', treasure: 'Kestrane\'s Reliquary: 8,000 gp in gold and gems, a staff of power, and her notes on the spires (+5 to any check to understand or harm them).' },
        { room: 'The Worm Galleries', title: 'The worm under the hill', encounter: 'The worm under the hill', optional: true, gm: 'A purple worm, drawn to warmth. Lure it with fire. It may burst into the spire fight if that fight is loud and long.' },
        { room: 'The First Night Spire', title: 'The first spire', encounter: 'Kestrane at the First Spire', read: 'A needle of black glass, taller than a tower, drinks gold light out of the rock like water up a wick. At its foot a woman in a starry robe is singing to it. She stops when she sees you and says, very quietly, "Please. Just let it finish."', gm: 'The climax. Isaura can be talked down (see her notes); if she is, the devas and stalkers fight on alone. The spire must be broken (see the area). When it falls, the sun flares for a moment and the Daylight track gains 2 hours. Through the broken spire, a beam of black light points north, toward the frozen sea.', treasure: 'The devas\' swords (two +2 longswords that shine with faint sunlight when drawn by a good creature).' },
      ],
      wrapUp: 'The first spire shatters and the sun over Solmere flares gold for one heartbeat. Isaura, alive or not, has given up the secret: five spires, the Lampwarden, the Dark Meridian. The broken spire\'s beam points north to the Whitewake. Queen Elowen gives the heroes a ship. The heroes reach level 18.',
    },
    {
      id: 'whitewake', title: 'Part 2: The Frozen Sea', level: 18,
      summary: 'The northern sea has frozen solid in a single night. Across a mile of ice, past an icebound ship of vampire sailors, a frost giant queen\'s mead-hall and a kraken trapped under the ice, the second spire stands in the skull of a dead titan.',
      goal: 'Cross the Whitewake, win or beat the frost giants, and topple the spire in the skull of Oruvald.',
      map: whitewake,
      npcs: [
        { npc: 'pf_sgoskarra', x: 67, y: 65 },
        { npc: 'pf_sgohrimmora', x: 5, y: 8 },
      ],
      scenes: [
        { room: 'Saltfrost Landing', title: 'Frozen in', read: 'Your ship froze into the ice a mile from where the sea should be. Ahead, the Whitewake runs flat and white to the end of the world, under a sun no brighter than the moon. Far off, a dome of yellowed bone the size of a hill rises out of the ice.', gm: 'Extreme cold rules apply. Skarra\'s raven arrives with a message: "Come to the blue berg, little heroes. Walk round the hole that breathes." Point out the three big landmarks: the hall, the skull, the berg.' },
        { room: "Whalers' Graveyard", title: 'The white tide', optional: true, gm: 'The frozen whalers, the log that says the ice came out of the skull, and fuel for a warm long rest.' },
        { room: 'Wreck of the Constant Dawn', title: 'The queen\'s lost ship', encounter: 'The icebound ship', read: 'A three-masted ship lies frozen in the ice, tilted, her sails stiff as boards. She flies the queen\'s colours. A lantern burns blue and cold in her cabin window.', gm: 'Vampire-spawn sailors and an ice devil captain. The devil can be bargained away (see the area). The log names "a priest who walked on the ice" who gave the crew a drink "to keep out the cold".', treasure: 'The captain\'s chest: 3,000 gp of the queen\'s silver, a frost brand longsword, and the ship\'s log.' },
        { room: "The Oracle's Hollow", title: 'Skarra\'s cauldron', handout: 'song-of-oruvald', read: 'A giantess as tall as a ship\'s mast sits stirring a cauldron in a cave of blue ice, and the steam rising from it shows pictures.', gm: 'Skarra sings the song of Oruvald (handout): the three ways into the skull. Her cauldron shows Larkspire and a black mirror of Solmere. She warns them not to fight the thing in the Breathing Hole: "it is older than all of us, and frightened."' },
        { room: 'The Breathing Hole', title: 'The thing under the ice', encounter: 'The Breathing Hole', optional: true, read: 'A great round hole in the ice steams in the cold. The ice around it is scarred by something that has dragged itself out and back again. A long, long shadow turns under the black water.', gm: 'A kraken, trapped and terrified. Avoid it, or make a pact with it (see the area). Fighting it is a deadly side quest for heroes who want one.' },
        { room: "Hrimmora's Mead-Hall", title: 'The jarl\'s welcome', encounter: "Hrimmora's hall", read: 'Giants feast on benches as long as ships. At the end of the hall, on a throne of narwhal tusks, a frost giant queen with a crown of icicles laughs, and the laugh shakes snow from the roof.', gm: 'Walk in openly and Hrimmora listens. Turn her (see the area); bargain for the ear-way; or fight. A fight here is hard, and the whole steading joins in.', treasure: 'The jarl\'s treasure: 12,000 gp in looted silver and amber, a belt of frost giant strength (Hrimmora\'s gift if turned, or taken from her chest).' },
        { room: "The Rime-Mother's Den", title: 'The jarl\'s dragons', encounter: 'The Rime-Mother', optional: true, gm: 'Hrimmora\'s two white dragons. If she has turned, they ignore the heroes. Otherwise, a fight in a cave of slippery ice.', treasure: 'The frozen hoard: 7,000 gp in coins, a bronze bell that rings warm (as a decanter of endless water for hot water), and a potion of supreme healing.' },
        { room: 'The Left Eye', title: 'The way in', encounter: 'The roc eyrie', gm: 'Three ways in: the Jaw Gate (fight past whatever comes out, or let Hrimmora\'s giants hold it), the Left Eye (rocs: feed them), the Ear (secret, needs the jarl or Skarra). The Right Eye\'s crack is a fourth way for climbers.' },
        { room: "The Titan's Crown", title: 'The crown of Oruvald', optional: true, gm: 'Twelve storm-sapphires in a crown as big as a cart wheel. Take one to Skarra.', treasure: 'Up to twelve storm-sapphires (5,000 gp each), though Skarra asks that they take only what they need.' },
        { room: 'The Brain Vault', title: 'The second spire', encounter: 'The Brain Vault', read: 'Inside the titan\'s skull, a dome of bone as big as a cathedral. In the middle, where Oruvald\'s mind once was, a needle of black glass drinks pale sunlight down through the bone. Before it waits an angel with grey wings and a burned-out face.', gm: 'The herald of the Lampwarden, two ice devils and three frost giant traitors. When the spire falls, the skull groans, the ice cracks for miles, the frozen whalers wake, and (if it was befriended) the kraken rises and roars. Daylight +2 hours.', treasure: 'The herald\'s greatsword (a +3 greatsword) and, around its neck, a key of white light that opens the Tomb of the First Lark on Larkspire.' },
      ],
      wrapUp: 'The skull of Oruvald splits, and the Whitewake starts to thaw: first a crack, then a roar of breaking ice, and the sea moves again. Skarra sings over her ancestor. The beam of the falling spire points up, into the clouds over the mountains: to Larkspire. Skarra calls a storm to carry them. The heroes reach level 19 at the end of Part 3, or now if the table is moving fast.',
    },
    {
      id: 'larkspire', title: 'Part 3: The Silent Angels', level: 18,
      summary: 'A monastery on floating islands in the sky, joined by rope bridges, where the angels have fallen silent and stand guard like statues. A last frightened novice knows the hymn that wakes them. In the bell tower, the third spire drinks song as well as light.',
      goal: 'Wake the angels of Larkspire, free Anthiel, and topple the spire in the bell tower.',
      map: larkspire,
      npcs: [
        { npc: 'pf_sgopellam', x: 9, y: 29 },
        { npc: 'pf_sgoanthiel', x: 41, y: 47 },
      ],
      scenes: [
        { room: "The Pilgrims' Landing", title: 'Islands in the sky', encounter: 'Silent sentinels', read: 'You step off onto a floating island of grass. Far below, through gaps in the cloud, the mountains are tiny. Above you other islands drift, joined by swaying bridges, and on the highest one stands a white tower. No bell rings. No bird sings. Three angels stand at the head of the bridge with their swords drawn, perfectly still.', gm: 'The devas attack anyone who steps on the bridge. The Hymn calms them, but the heroes do not have it yet: go round by the Long Rope to the Isle of Winds, or fight.' },
        { room: 'The Weather Mill', title: 'The last novice', read: 'In a windmill whose sails turn without wind, a skinny boy in a huge habit points a bread knife at you with both hands, shaking.', gm: 'Brother Pellam. He knows the Hymn of Matins (handout) but has never sung it alone. Earning his trust (DC 14 Persuasion, or just feeding him) gets a guide to every bridge on Larkspire.', handout: 'hymn-of-matins' },
        { room: 'Storm Altar', title: 'The storm-knot', encounter: 'Storm-spirits', optional: true, gm: 'Air elementals driven mad by the silence, and a roc caught in the knot. Pellam\'s first song: if he sings here and it works, he finds his courage.' },
        { room: 'The Cloister Garth', title: 'The angel with the stitched mouth', encounter: 'The choir garth', read: 'In a garden inside an arcade of white columns, a tree of silver leaves holds larks frozen in mid-song. Under it kneels an angel of bronze, tall as two men, his mouth stitched shut with black thread. He rises, and lifts his sword.', gm: 'Anthiel and three devas. Cut the thread while someone sings the Hymn and he wakes (see the area). The hardest choice of the part: fight a friend, or take the risk of getting close enough to cut.' },
        { room: 'Chapter House', title: 'The Book of Matins', optional: true, gm: 'The full Hymn with its music, for parties without Pellam. A secret trapdoor under the lectern hides a small reliquary.', treasure: 'In the reliquary: an ioun stone of mastery and three potions of supreme healing.' },
        { room: 'Scriptorium', title: 'The great work', encounter: 'The scriptorium wardens', optional: true, gm: 'Golems obey the abbot\'s amulet or the Hymn. The monks\' star-map shows the fifth spire at the edge of the world, and the fourth "in the shadow of the City of Noon".', treasure: 'The illuminated star-map (priceless; 10,000 gp to any temple), and a manual of gainful exercise.' },
        { room: "The Giants' Wreck", title: 'The only singing on Larkspire', encounter: "The giants' toll", optional: true, read: 'Half of a castle of cloud-stone lies tilted on a rocky island, smoking. A giant\'s voice, enormous and cheerful and out of tune, is singing. It is the only singing on Larkspire.', gm: 'Greedy cloud giants. Bargain, sing them a better song, or fight. As friends they lend a cloud-skiff.', treasure: 'Their loot: 4,000 gp in monastery silver (which they will give back if asked nicely), and a carpet of flying they do not know how to use.' },
        { room: 'The Hanging Gardens', title: 'The trees that walk', encounter: 'The grieving garden', optional: true, gm: 'Treants grieving for the angel-gardener. Stop them; get the fruit of Larkspire.' },
        { room: 'Tomb of the First Lark', title: 'The white gold trumpet', optional: true, gm: 'On the Rock of Wings, by the Chain Bridge. The herald\'s key from Part 2 opens the tomb (or DC 22 Thieves\' Tools).', treasure: 'A horn of valhalla (white gold): its warriors are shades of light that deal radiant damage.' },
        { room: 'The Ringing Chamber', title: 'The Hollow Choir', encounter: 'The Hollow Choir', read: 'Twelve bells of white bronze, each bound in black chain. Around them in a ring, angels hang in the air like dead birds on strings, their wings grey and their eyes empty. Then, together, every head turns toward you.', gm: 'Two fallen planetars and three fallen devas. Radiant damage at 0 hit points saves them instead of killing them. Ringing the freed bells hurts them. Anthiel fights at the heroes\' side if woken. Then the spire: in the Hollow Spire chamber behind a secret door or a locked iron one.' },
        { room: 'The Hollow Spire', title: 'The third spire', gm: 'Silence within 30 ft. When it falls, all twelve bells ring at once, every angel on Larkspire sings, and the Daylight track gains 2 hours. The sound of it is heard all over the world. In the silence afterward, Anthiel says: "The fourth is not in any place on the map. It is in the shadow of the city you came from."', treasure: 'Anthiel\'s gift: a holy symbol of white bronze that works as a talisman of pure good for a cleric or paladin, or a set of wings of flying for anyone else.' },
      ],
      wrapUp: 'Larkspire rings again, and the angels sing the sun up the sky for the first time in a month: the dawn comes ten minutes early. Anthiel tells the heroes that the fourth spire stands in the capital\'s shadow, a mirror-city on the far side of the night, and that the way in is through a mirror in the queen\'s own palace. The heroes reach level 19.',
    },
    {
      id: 'unsolmere', title: 'Part 4: The Shadow of the City', level: 19,
      summary: 'Through a mirror in the palace lies Unsolmere, the shadow of the capital: everything reversed, a crack in the world where the river should be, a market of hags, a balor chained as a lamp, a pit fiend clerk counting stolen hours, and the queen\'s own shadow guarding the fourth spire.',
      goal: 'Find the fourth spire in the shadow city, break the Unqueen\'s hold, and open the road to the edge of the world.',
      map: unsolmere,
      npcs: [
        { npc: 'pf_sgoodran', x: 75, y: 42 },
        { npc: 'pf_sgounqueen', x: 6, y: 71 },
      ],
      scenes: [
        { room: 'The Looking-Glass Gate', title: 'Through the mirror', read: 'You step through the mirror and come out of a gate you know: the West Gate of Solmere, except that it is in the east, and the city is black. Black stone, black frost, and overhead a black sun that sheds a cold, violet dark. A tall grey shade in a crown stands by the gate, smiling sadly.', gm: 'King Odran meets them. He explains Unsolmere and points the way: the spire is under the Inverted Observatory, west, past the Rift. He asks the heroes to tell Elowen he was proud of her.' },
        { room: 'The Kingsway Reversed', title: 'The queue of shades', encounter: 'The shadow watch', read: 'The main street runs the wrong way. Shop signs are written backward. A long queue of grey figures shuffles toward the bridge, each holding out empty hands.', gm: 'The shadow watch. Hide among the shades (DC 18 Stealth for the group, or a disguise), or fight in the street.' },
        { room: 'The Hag Market', title: 'Memories for sale', encounter: 'The Hag Market', read: 'Stalls sell things in bottles: a laugh, a summer, a first kiss. Three old women in shawls call out prices in sweet voices, and their horses have manes of fire.', gm: 'The hags sell information for memories. Their best secret is the Unqueen\'s weakness. Fighting them is optional and makes the city hunt the heroes.' },
        { room: 'Granary of Hours', title: 'The stolen hours', optional: true, read: 'Thousands of hourglasses, stacked to the roof, all running backward. Each has a paper label: a name and a time.', gm: 'Smash them all: Daylight +2 hours.' },
        { room: 'Temple of the Unmorning', title: 'The chained lamp', encounter: 'The chained lamp', optional: true, read: 'Chained beneath a black sun, on its knees, a demon of fire and shadow twice the height of a man burns with black flames. It is being used as a lamp. It looks up at you and smiles.', gm: 'A balor that would love to be freed. A dangerous bargain or a fight.', treasure: 'In the Reliquary of the Last Dusk: the shadow sun-hilt (fuses with a sun blade into a holy avenger).' },
        { room: 'The Bone Bridge', title: 'Over the Rift', encounter: 'Under the Bone Bridge', gm: 'Cloakers under the bridge. Or take the Chain Bridge to the north, or the Falling Stair in the south straight down to the Mouth.' },
        { room: 'Throne of Midnight', title: 'The Midnight Chancellor', encounter: 'The Midnight Chancellor', read: 'The palace stands upside down. Chandeliers grow from the floor like iron trees; the throne hangs from the ceiling. Beneath it, at a table of bone, a vast red devil in a judge\'s robe signs papers, and a line of grey shades waits to be signed.', gm: 'A pit fiend clerk. Beat him with his own charter (the true queen\'s claim), or fight. Avoidable entirely by going round through the gardens.', treasure: 'In the Chancellery strongbox: 15,000 gp in black gold coins (they turn to real gold in sunlight) and a mantle of spell resistance.' },
        { room: 'The Drowned Mirror', title: 'A message to the queen', optional: true, read: 'The black lake shows the real Solmere upside down, and a young queen asleep at her desk with her cheek on a map.', gm: 'Speak to Elowen in her dream. If she comes through the Looking-Glass Gate, the Chancellor must bow and the Unqueen is weakened. It is a real risk for her: the heroes must keep her alive in Unsolmere.' },
        { room: 'Vault of Stolen Hours', title: 'The king\'s last summer', optional: true, gm: 'Real sunlight in hourglasses. Daylight +3 hours, and Odran\'s hourglass lets him rest.', treasure: 'Odran\'s frost crown, left behind when he fades: while worn, the wearer has resistance to cold and necrotic damage and can\'t be frightened (attunement).' },
        { room: 'The Shadow Spire', title: 'The fourth spire', encounter: 'The Unqueen at the Shadow Spire', read: 'A spire of black glass grows down from the roof like a fang, dripping gold light that vanishes before it lands. Beneath it, on a throne of black ice, sits Queen Elowen, with eyes black from edge to edge. Beside her, a robed skeleton turns the pages of a star-chart.', gm: 'The Unqueen, the Umbral Astronomer and their guards. Odran\'s message or the real Elowen breaks the Unqueen (see her notes). When the spire falls, Daylight +2 hours, Unsolmere begins to fade, and a black road opens in the air: the Dark Meridian, running to the edge of the world.', treasure: 'The Umbral Astronomer\'s staff (a staff of the magi if it was Isaura herself, remade by the dark; if it was only her shadow, Isaura\'s own staff of power returns to her).' },
      ],
      wrapUp: 'The fourth spire falls upward into the dark, and the shadow city starts to fade like a dream at morning. The shades go home, each carrying an hour of light. In the real Solmere, Queen Elowen wakes and, for the first time in a year, cries for her father. Above the ruins, the Dark Meridian unrolls: a road of black light to the end of the world. The heroes reach level 20.',
    },
    {
      id: 'worldrim', title: 'Part 5: The Last Spire', level: 20,
      summary: 'At the end of the world, across a river of the sun\'s spilled fire, the Last Spire climbs in three terraces to a cage where the sun\'s own spark is held. Fallen stars, fire-folk in chains, a garrison of fiends, a fallen host, the Gaoler of Noon, and at the top, the Lampwarden herself.',
      goal: 'Climb the Last Spire, open the Cage of Noon, and stop the Lampwarden, by sword or by word.',
      map: worldrim,
      npcs: [
        { npc: 'pf_sgoombrael', x: 50, y: 39 },
        { npc: 'pf_sgodawnling', x: 51, y: 40 },
      ],
      scenes: [
        { room: 'The Last Camp of Dawn', title: 'The end of the world', read: 'The black road sets you down where the world ends. The ground is glass. The sky is empty: no stars, no moon, and low on the horizon a sun the colour of a dying coal. Across a river of fire, a spire of black glass climbs to the top of the sky, and at its peak something gold flickers in a cage.', gm: 'Check the Daylight track. Allies made earlier can arrive now, one per scene, if the heroes called them: Anthiel, Skarra\'s storm, the kraken (no sea here, but Skarra brings a wave), Hrimmora\'s giants, Isaura, the cloud giants.' },
        { room: 'Field of Fallen Stars', title: 'The star-eaters', encounter: 'The starless wyrms', optional: true, gm: 'Two dragons gorging on fallen stars. Set them on each other, or fight. A singing star carried to the cage helps the Dawnling.', treasure: 'A star still singing (see the area), and the dragons\' gleanings: 20,000 gp in gems that were once starlight.' },
        { room: 'The Glass Waste', title: 'The ringing glass', encounter: 'Worms of the Glass Waste', optional: true, gm: 'Walk softly or meet two purple worms.' },
        { room: 'The Cinder Bridge', title: 'The sun\'s fire-folk', encounter: 'Wardens of the Cinder Bridge', read: 'A narrow bridge of black stone crosses a river of slow gold fire: the sun\'s blood, leaking out of the spire\'s roots. Chained at either end, figures of living flame stand guard, heads bowed.', gm: 'Break their chains and they become allies. Or take the Moth Stair round the north.' },
        { room: 'Terrace of Cinders', title: 'The garrison', encounter: 'The garrison of the terrace', gm: 'A marilith and two nalfeshnees hold the south side and the barracks. The north side is quieter, but the Hall of Stolen Dawns above it is worth the climb.', treasure: 'In the barracks strongbox: everything the cult ever sent: 25,000 gp, a scarab of protection, and a ring of regeneration.' },
        { room: 'Hall of Stolen Dawns', title: 'Forty sunrises in jars', optional: true, read: 'On every shelf stands a jar, and in every jar a sunrise: a little gold-pink sky with tiny clouds, turning slowly.', gm: 'Each jar is a weapon (a burst of daylight). All of them opened at once: Daylight +4 hours.' },
        { room: 'Gallery of the Fallen', title: 'The angels who fell for love', encounter: 'The fallen host', read: 'The wall of the second terrace is carved with thousands of angels, wings folded, faces covered. Some of the carvings open their eyes.', gm: 'The fallen host. The Hymn, or Anthiel\'s name, can make them lay down their swords. The Traitor\'s Niche in the west hides a secret shortcut up.' },
        { room: 'The Starwell', title: 'The hidden stars', optional: true, gm: 'A last rest of sorts: drink to recover spell slots. A Wish here is free.' },
        { room: 'Ossuary of Suns', title: 'The bones of old suns', optional: true, gm: 'The Lampwarden\'s secret grief. One golden skull, shown to her, makes talking her down far easier.' },
        { room: "The Gaoler's Walk", title: 'The Gaoler of Noon', encounter: 'The Gaoler of Noon', gm: 'A pit fiend with the keys and an iron golem. Trick it with a fake noon, or take the keys by force. The keys open the cage.' },
        { room: 'The Cage of Noon', title: 'The Lampwarden', encounter: 'Ombrael at the Cage of Noon', handout: 'lampwarden-oath', read: 'A cage of black iron stands on the summit of the world, and in it a child made of light flickers like a candle in a draught. Beside it a tall woman with six wings of ash sits with her arms through the bars, holding the child\'s hand. She looks up at you. "You came all this way," says Ombrael, the Lampwarden. "I am so sorry."', gm: 'Let her talk first. She explains, kindly and truly, why she did it. The heroes can argue with her (see her notes), and the oath carved on the cage (handout) is their best weapon. Fight if they must: she, two fallen planetars and two fallen devas. Open the cage with the Gaoler\'s keys, or break it.' },
        { room: 'The Cage of Noon', title: 'Sunrise', read: 'The cage opens. The child of light stands up, stretches like a cat in a warm window, and laughs. Then it rises: up past the spire\'s tip, up into the empty sky, getting bigger and brighter, until you cannot look at it, until the black glass of the whole world is blazing gold, until it is the sun.', gm: 'The ending. If Ombrael lives, she asks to light it one last time, and then gives her lamp to whoever will take it: Anthiel, a hero, or the Dawnling itself. The Last Spire melts. The heroes walk home on a road of morning.' },
      ],
      wrapUp: 'The sun rises over the end of the world, and over every land on the way home. In Solmere it comes up at dawn exactly on time, and the whole city stands in the streets in silence to watch it. The frost melts off the roses by noon.',
    },
  ],
  ending:
    'Success: the Dawnling rises and the sun returns. The days grow an hour longer each morning until they are whole again, and the late harvest is the best anyone remembers. If Ombrael was talked down, she lights the sun for the new age with her own hands, then lays down her lamp and goes to sleep in the Ossuary of Suns, and the morning does not miss her. If she was slain, someone must become the new Lampwarden: Anthiel offers, or a hero may. Queen Elowen raises statues of the heroes in the Sundial Gardens, and their shadows mark the hours. Failure: if the heroes fall, or the Daylight track reaches 0 before they reach the cage, the Long Night comes. The world freezes. Nothing dies, and nothing lives. But somewhere in the dark the Dawnling is still flickering, and a new party of heroes, years from now, might yet climb to it. What next: the sun has been relit, but the Lampwarden\'s question stays. Every dawn still counts down every life. A hero who became the new Lampwarden has to decide, every morning, to light it anyway.',
};
