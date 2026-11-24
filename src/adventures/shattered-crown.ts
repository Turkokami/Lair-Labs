// The Shattered Crown: a six-part campaign for four heroes, levels 5 to 10.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng, type Side } from './builder';
import type { Adventure } from './types';

type Pt = [number, number];

// ---------- little helpers ----------

/** Impassable ground in a rough oval: outcrops, thickets, cliffs, ramparts of rock. */
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

/** Walk a w-by-w brush along a line of points (roads, streams, ditches). */
function brush(pts: Pt[], w: number, f: (x: number, y: number) => void) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let s = 0; s <= n; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n);
      for (let j = 0; j < w; j++) for (let k = 0; k < w; k++) f(x + k, y + j);
    }
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

/** Thin walls all round the outside of a group of rectangles (a building of any shape). */
function enclose(b: MapBuilder, rects: number[][]) {
  const inside = new Set<string>();
  for (const [x, y, w, h] of rects) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) inside.add(`${i},${j}`);
  const sides: [Side, number, number][] = [['n', 0, -1], ['s', 0, 1], ['w', -1, 0], ['e', 1, 0]];
  for (const key of inside) {
    const [x, y] = key.split(',').map(Number);
    for (const [s, dx, dy] of sides) if (!inside.has(`${x + dx},${y + dy}`)) b.wall(x, y, s);
  }
}

/** A building of several rectangles: floor, walls round the outside, a name and notes. */
function hall(b: MapBuilder, name: string, rects: number[][], mat: string, o: { read?: string; gm?: string; label?: [number, number] } = {}) {
  for (const [x, y, w, h] of rects) b.floor(x, y, w, h, mat);
  enclose(b, rects);
  b.area(name, rects, o);
}

// =====================================================================
// Part 1: Lockhaven on the Amber (level 5)
// =====================================================================
function lockhaven() {
  const b = new MapBuilder('adv-shc-lockhaven', 'Lockhaven on the Amber', 80, 72, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'wood' });

  // the river Amber, widening into the Guild Pool around Guild Island
  b.water(0, 30, 80, 11, true).water(0, 30, 80, 1).water(0, 40, 80, 1);
  b.water(22, 23, 37, 25, true).water(22, 23, 37, 1).water(22, 47, 37, 1);
  b.floor(27, 28, 27, 15, 'dirt');

  // roads and the riverside walks
  b.paint(37, 0, 4, 23, 'stone-cobble');
  b.paint(0, 2, 37, 2, 'dirt').paint(41, 2, 39, 2, 'dirt');
  b.paint(10, 7, 3, 23, 'stone-cobble');
  b.paint(0, 26, 22, 4, 'stone-cobble').paint(59, 26, 21, 4, 'stone-cobble').paint(22, 19, 37, 4, 'stone-cobble');
  b.paint(35, 48, 3, 24, 'dirt').paint(10, 41, 3, 31, 'dirt').paint(13, 58, 22, 2, 'dirt').paint(38, 58, 42, 2, 'dirt');
  b.paint(59, 41, 21, 3, 'stone-cobble');

  // the crossings: Old Bridge, Guild Bridge, the drawbridge, and the weir-walks at the lock
  b.floor(10, 29, 3, 13, 'wood-planks');
  b.props_('bridge-plank', [[11, 31], [11, 35], [11, 39]], 90);
  b.area('Old Bridge', [[10, 29, 3, 13]], {
    read: 'A humped wooden bridge, older than the town, patched with a hundred colours of plank. It sags in the middle like a tired horse.',
    gm: 'The free crossing. Nobody guards it, because it does not go to the island. A DC 13 Perception from the middle spots the guild\'s water-gate on the island\'s south quay, and a rowboat tied under the bridge (the boat-house folk use it).',
    label: [11, 35],
  });
  b.prop('rowboat', 9, 37);
  b.floor(38, 22, 3, 6, 'stone-flagstone');
  b.props_('lamp-post', [[38, 22], [40, 27]]).light(38, 22, 15, 20).light(40, 27, 15, 20);
  b.area('Guild Bridge', [[38, 22, 3, 6]], {
    read: 'A proud stone bridge with amber lamps on iron posts. Every lamp has a little brass plaque: "Paid for by the Bargemen\'s Guild. You are welcome."',
    gm: 'The front way onto Guild Island. Two thugs in amber sashes lean on the rail and ask everyone their business. A guild token, a good lie (DC 13 Deception) or Garrick\'s summons gets the heroes waved through. Picking a fight here brings the Counting Floor guards out in 2 rounds.',
    label: [39, 25],
  });
  b.floor(35, 43, 3, 5, 'wood-planks');
  b.props_('chains-hanging', [[35, 47], [37, 47]]).prop('winch', 36, 47);
  b.floor(64, 29, 1, 13, 'stone-flagstone').floor(70, 29, 1, 13, 'stone-flagstone');
  b.floor(65, 31, 5, 1, 'wood-planks').floor(65, 39, 5, 1, 'wood-planks');
  b.water(65, 32, 5, 7, true);
  b.area('Amber Lock', [[64, 29, 7, 13]], {
    read: 'Two great stone weir-walks cross the river, with a lock chamber of black water between them. A barge sits in the lock, low with cargo, and a bored keeper turns a wheel.',
    gm: 'Every barge on the Amber passes through here and pays Garrick\'s new toll: one part in five of its cargo. The weir-walks and lock gates are a second way across the river (but not to the island). A barge captain, Breckon, is stuck in the lock because he cannot pay. Helping him (25 gp, or a DC 14 Persuasion on the keeper) earns a ride round to the island\'s water-gate at night.',
    label: [67, 35],
  });
  b.props_('lever', [[64, 30], [70, 40]]).props_('winch', [[64, 33], [70, 37]]).prop('cargo-crates', 67, 35).prop('mooring-post', 64, 40).prop('lantern-standing', 70, 30).light(70, 30, 15, 20);

  // the palisade along the north road, with the Toll Gate, a postern and the goat gap
  b.wallRun(0, 6, 72, 'n').wallRun(74, 6, 6, 'n');
  b.door(38, 6, 'n', 'closed', 'door-double').door(39, 6, 'n', 'closed', 'door-double').door(6, 6, 'n', 'locked');
  b.area('North Road', [[0, 0, 80, 6]], {
    read: 'The river road runs along a palisade of sharpened logs. Over the gate a new sign has been nailed above the old one. The old one says "Welcome to Lockhaven". The new one says "TOLL".',
    gm: 'The heroes arrive here. The Toll Gate is the front way in. The locked postern (DC 15 thieves\' tools) at the west end lets out behind the Drowsy Heron. Goats have pushed down two logs at the east end (the goat gap): a DC 12 Perception spots it, and nobody watches it.',
    label: [20, 3],
  });
  scatter(b, 'tree-oak', 0, 0, 34, 2, 5, 101);
  scatter(b, 'tree-oak', 44, 0, 36, 2, 5, 102);
  b.props_('signpost', [[36, 4], [70, 3]]).prop('milestone', 45, 4).prop('cart', 30, 3).prop('haystack', 74, 4);
  b.start(38, 1, 3, 2);

  b.building('Toll House', 30, 7, 6, 6, {
    mat: 'wood-planks-dark',
    read: 'A cramped guardhouse that smells of wet cloaks. A big ledger lies open on the counter. Behind it a list of tolls is chalked on the wall, and someone has crossed out every price and written a bigger one.',
    gm: 'Garrick\'s toll-men collect 2 gp a head "for the river\'s upkeep", 5 gp for a weapon and 10 gp for "anyone the Guildmaster might like to meet". Arguing gets the heroes told to wait for the Guildmaster\'s judgment. The ledger (DC 12 Investigation) shows the town has paid three times more toll this month than all last year, and that a "grey-cloaked lady" paid no toll at all.',
    doors: [[35, 9, 'e', 'open'], [32, 12, 's', 'closed']],
    windows: [[33, 7, 'n']],
  });
  b.prop('shop-counter', 32, 9).prop('strongbox', 31, 8).prop('notice-board', 34, 8).prop('weapon-rack', 31, 11).prop('stool', 33, 10).light(32, 9, 8, 12);
  b.area('Toll Gate', [[30, 6, 14, 7]], {
    read: 'Six toll-men in amber sashes block the road with a pike laid across two barrels. Their sergeant smiles with all his teeth. "Welcome to Lockhaven. That\'ll be twelve gold. Each."',
    gm: 'Sergeant Brem and his crew (a veteran, four thugs and two guards) are bullies, not fanatics. Paying is the easy way. A DC 15 Intimidation, or mentioning the Regent\'s warrant, makes Brem nervous: he lets them in but sends a runner to the island. A fight here is loud and the town watches. If the heroes use the goat gap or the postern, they skip this fight entirely.',
    label: [40, 9],
  });
  b.encounter('Toll at the gate', [30, 6, 14, 7], [['veteran', 1], ['thug', 4], ['guard', 2]], 'low');
  b.props_('barrel', [[37, 8], [40, 8]]).prop('spear-rack', 41, 10).prop('brazier', 42, 7).light(42, 7, 15, 20);

  b.building("Bargemen's Hall", 42, 7, 10, 7, {
    mat: 'wood-planks',
    read: 'A long hall full of hammocks, dice and the smell of boiled cabbage. Amber sashes hang on every peg.',
    gm: 'Where Garrick\'s bully-boys sleep. By day, three of them snore here. A DC 14 Stealth gets the heroes in and out; the footlocker under the sergeant\'s hammock holds the duty roster (who guards which bridge, and when the watch on the water-gate changes: midnight) and 30 gp.',
    doors: [[42, 10, 'w', 'closed'], [46, 13, 's', 'closed']],
    windows: [[48, 7, 'n']],
  });
  b.props_('hammock', [[43, 8], [45, 8], [47, 8], [49, 8]]).props_('bunk-bed', [[50, 11], [43, 11]]).prop('table-cards', 46, 10).prop('footlocker', 50, 8).prop('coat-rack', 44, 12).light(46, 10, 8, 12);

  b.building('The Drowsy Heron', 3, 8, 12, 9, {
    mat: 'wood-planks-dark',
    read: 'Low beams, a crackling hearth and a stuffed heron over the bar with one glass eye. The talk stops when you come in, then starts again, quieter.',
    gm: 'Run by Old Maggin Abberly, who hates the toll and loves gossip. For a round of drinks she tells the heroes: the guild used to be fair; Garrick changed overnight after "he bought a lump of amber off a dying man"; everyone who makes a deal with him keeps it, even when it ruins them; and a jester in motley has been hiding in Mudside for a week. A room costs 5 sp. The back room is a safe place to plan.',
    doors: [[14, 12, 'e', 'open'], [8, 16, 's', 'closed']],
    windows: [[3, 13, 'w'], [11, 8, 'n']],
  });
  b.wallRun(6, 8, 4, 'e').door(6, 10, 'e', 'closed');
  b.area('Heron back room', [[3, 8, 4, 4]], { gm: 'A private room with a round table and a door that locks. Reyna Sorrowind is waiting here when the heroes first visit the inn (see the scene).' });
  b.prop('bar-counter', 9, 9).prop('keg-rack', 8, 9).prop('fireplace', 13, 15).props_('table-round', [[9, 12], [12, 11], [10, 14]]).props_('chair', [[8, 12], [10, 12], [12, 12], [11, 14]]).prop('table-round', 4, 9).prop('chair-high-back', 5, 10).prop('dartboard', 3, 15).prop('candles', 4, 9);
  b.light(10, 12, 15, 20).light(13, 15, 10, 15).light(4, 9, 6, 10);

  b.area('Lantern Market', [[18, 14, 16, 8]], {
    read: 'Stalls under strings of paper lanterns, half of them empty. A fishwife shouts prices at nobody. Every stall has an amber ribbon tied to its post: the guild\'s mark that the stall has paid.',
    gm: 'Where the town\'s fear is easiest to see. Traders sell at a loss because they promised Garrick a share and cannot break the promise (the Amber Shard binds any bargain struck with its holder). A DC 13 Insight sees that people who mention the Guildmaster flinch as if remembering pain. Hidden among the crowd, a guild spy watches for the jester.',
    label: [25, 17],
  });
  b.paint(18, 14, 16, 8, 'stone-cobble');
  b.props_('market-stall', [[19, 15], [23, 15], [27, 15], [31, 15], [19, 20], [31, 20]]).props_('produce-stall', [[23, 19], [27, 19]]).prop('fish-crate', 21, 17).prop('well', 26, 17).props_('lamp-post', [[18, 14], [33, 14], [18, 21], [33, 21]]);
  for (const [x, y] of [[18, 14], [33, 14], [18, 21], [33, 21]] as Pt[]) b.light(x, y, 12, 18, '#ffc870');

  b.building('Shrine of the River Mother', 3, 19, 8, 8, {
    mat: 'stone-flagstone',
    read: 'Blue-painted walls, a basin of river water and a wooden carving of a smiling woman with fish in her hair. Candles float in the basin.',
    gm: 'Sister Ambrel, a gentle river priest (priest), has felt the Amber Shard "like a weight on the water". She knows the old crown\'s lore: each stone was a province\'s virtue, and a broken virtue turns into its own shadow. The Amber Stone was Plenty; broken, it is Greed: every bargain struck with its holder binds like iron. She can cast lesser restoration and break one hero\'s bargain with Garrick (once). Her one request: free the debtors on Pillory Green.',
    doors: [[10, 22, 'e', 'open']],
    windows: [[6, 19, 'n'], [3, 23, 'w']],
  });
  b.prop('font', 6, 22).prop('idol', 4, 20).props_('candles', [[5, 20], [8, 20]]).props_('prayer-kneeler', [[5, 24], [8, 24]]).prop('offering-bowl', 7, 23).light(6, 22, 12, 18, '#9fd0ff');

  b.building("Chandler's shop", 55, 7, 8, 5, {
    gm: 'Rope, oil, lamps and boat-tar. The chandler, Lisbet, sells at fair prices to anyone who hates the toll. She will sell a grappling hook, a hooded lantern and a small boat for 30 gp.',
    doors: [[58, 11, 's', 'closed']],
  });
  b.prop('shop-counter', 57, 8).props_('rope-coil', [[55, 9], [61, 8]]).prop('shelf-jars', 60, 8).prop('lantern-hanging', 58, 9).prop('barrel-group', 61, 10).light(58, 9, 8, 12);
  b.building("Wharf-reeve's house", 66, 8, 11, 7, {
    mat: 'wood-planks',
    read: 'A fine townhouse with its shutters closed. Inside, the furniture is covered in sheets, as if the owner meant to leave and never did.',
    gm: 'Reeve Allard Thursby was the town\'s elected head. He made one bargain with Garrick ("I will not oppose you") and now cannot oppose him, though it is killing him. He sits in the dark and weeps. Breaking the shard\'s hold (taking the shard, or Sister Ambrel\'s blessing) frees him; he then rouses the town against the guild. His desk holds the town charter and a map of the Guildhall drawn by its builder (shows the vault and the water-gate).',
    doors: [[66, 11, 'w', 'closed'], [71, 14, 's', 'closed']],
    windows: [[70, 8, 'n'], [76, 11, 'e']],
  });
  b.wallRun(70, 8, 7, 'w').door(70, 12, 'w', 'closed');
  b.prop('writing-desk', 72, 9).prop('chair-high-back', 72, 10).prop('bookshelf', 75, 9).prop('bed-four-poster', 74, 12).props_('folding-screen', [[68, 9]]).prop('armchair', 68, 12).prop('map-cabinet', 76, 13).light(72, 9, 6, 10);

  b.area('Pillory Green', [[52, 14, 12, 9]], {
    read: 'A town green turned into a punishment yard. People sit in the stocks and stand in iron cages in the rain, each with a wooden board around their neck: "DEBTOR". A captain in an amber coat strolls between them, eating an apple.',
    gm: 'Garrick\'s debtors: people who promised him money and could not pay, so the shard makes them stay put. Captain Corlan Varlow (bandit captain) and six thugs guard them. Corlan enjoys his job and talks too much. Freeing the debtors (the cage keys are on Corlan, or DC 13 thieves\' tools each) is the start of the town turning. One debtor, a lockwright named Noll, knows the vault door\'s secret (the keyhole is a fake; the real lock is under the third hinge).',
    label: [57, 18],
  });
  b.encounter('Pillory Green', [52, 14, 12, 9], [['banditCaptain', 1], ['thug', 6]], 'low');
  b.props_('cage', [[53, 15], [55, 15], [57, 15]]).props_('stocks', [[60, 16], [62, 16]]).prop('pillory', 54, 20).prop('gibbet-post', 62, 21).prop('notice-board', 59, 19).prop('brazier', 57, 21).light(57, 21, 15, 20);

  b.building("Lock-keeper's house", 65, 17, 8, 6, {
    gm: 'Old Hadley keeps the lock and keeps his head down. The lock wheel key hangs by his door. He will raise or drain the lock for 10 gp, which can sink or strand any boat in the chamber.',
    doors: [[68, 22, 's', 'closed']],
  });
  b.prop('bed', 66, 18).prop('kitchen-table', 69, 19).prop('fishing-net', 71, 18).prop('stove', 66, 21).prop('key-ring', 71, 21);

  // Guild Island
  b.paint(27, 28, 27, 2, 'stone-cobble').paint(27, 41, 27, 2, 'stone-cobble');
  b.area('Guild Island', [[27, 28, 27, 2], [27, 41, 27, 2]], {
    read: 'The island is all quays and clipped hedges, and the great Guildhall rises from the middle of it in red brick and amber glass. Every window is lit.',
    gm: 'Ways on: the Guild Bridge (north, guarded), the drawbridge (south, guarded and often raised), the water-gate (south quay, secret door into the vault; reached by boat at night) and the ferry steps on the east quay. Amber-sashed patrols walk the quays every 10 minutes (DC 13 Stealth to slip past).',
    label: [40, 29],
  });
  b.area('Guild gardens', [[27, 30, 4, 11], [50, 35, 4, 6]], { gm: 'Clipped hedges in the shapes of barges and coins. A good place to hide (advantage on Stealth). A gardener\'s ladder against the hall reaches a first-floor window over the Counting Floor (DC 12 Athletics).' });
  scatter(b, 'hedge', 27, 30, 4, 11, 5, 103);
  scatter(b, 'hedge', 50, 35, 4, 6, 3, 104);
  b.props_('flowers', [[28, 34], [52, 38]]).prop('ladder', 30, 33).prop('statue', 29, 38).props_('mooring-post', [[27, 42], [53, 42], [27, 28], [53, 28]]).props_('rowboat', [[46, 44], [55, 31]]);

  hall(b, 'Counting Floor', [[31, 30, 12, 8]], 'marble', {
    read: 'A great hall of counting desks under amber glass lamps. Clerks scratch in ledgers without looking up. At the far end hangs a painting of a broad, smiling man with a lump of amber on a chain.',
    gm: 'The guild\'s heart. Clerks (commoners) bolt at the first blade. The guards are Garrick\'s best: two bandit captains (his "collectors") and two veterans, with three thugs. If the heroes come with the Reeve, the freed debtors or a crowd, the clerks bar the doors behind the guards and half the thugs throw down their sashes. The ledgers prove every crime the guild has committed.',
  });
  b.floor(31, 38, 19, 3, 'wood-planks').floor(43, 30, 7, 8, 'wood-planks-dark');
  enclose(b, [[31, 30, 19, 11]]);
  b.wallRun(31, 37, 7, 's').wallRun(38, 37, 5, 's').wallRun(37, 38, 3, 'e').wallRun(42, 30, 8, 'e').wallRun(42, 38, 3, 'e').wallRun(43, 35, 7, 's');
  b.door(36, 30, 'n', 'closed', 'door-double').door(37, 30, 'n', 'closed', 'door-double').door(34, 37, 's', 'closed').door(40, 37, 's', 'closed').door(37, 39, 'e', 'closed');
  b.door(42, 32, 'e', 'locked').door(46, 35, 's', 'locked', 'door-iron').door(42, 39, 'e', 'secret').door(33, 40, 's', 'closed').door(47, 40, 's', 'secret');
  b.area('Guild kitchens', [[31, 38, 7, 3]], { gm: 'Cooks and scullions, all terrified. The back door opens on the south quay, near the drawbridge. A scullion boy, Tad, will lead the heroes through for a kind word and a coin.' });
  b.area('Back passage', [[38, 38, 5, 3]], { gm: 'A servants\' passage. A DC 14 Investigation finds the secret panel into the vault (the clerks use it to sneak coins out; Noll the lockwright knows it too).' });
  hall(b, "Guildmaster's chamber", [[43, 30, 7, 6]], 'wood-planks-dark', {
    read: 'Rich rugs, a desk the size of a barge, and a window over the river. A heavy man in an amber coat sits behind the desk. Around his neck, on a gold chain, a shard of honey-coloured crystal glows like a coal.',
    gm: 'Garrick Pellingham. He offers a bargain before anything else: he will give the heroes 500 gp and safe passage if they promise to leave Lockhaven and never return. Anyone who agrees and shakes his hand must keep that promise (DC 16 Wisdom save to resist, at disadvantage while touching him). He does not mean to fight unless cornered, and then fights like the prize-fighter he once was.',
  });
  b.encounter("The Guildmaster's judgment", [43, 30, 7, 5], [['gladiator', 1], ['veteran', 2], ['thug', 5]], 'high');
  b.encounter('The Counting Floor', [31, 30, 11, 7], [['banditCaptain', 2], ['veteran', 2], ['thug', 3]], 'moderate');
  hall(b, 'Guild vault', [[43, 36, 7, 5]], 'dungeon-slab', {
    read: 'An iron room with shelves of strongboxes, each marked with a family\'s name. In the middle, an empty velvet cushion on a stand, with a dent the shape of a crystal shard.',
    gm: 'The guild\'s savings and everything it squeezed out of the town. The real lock on the iron door hides under the third hinge (DC 18 thieves\' tools, or DC 12 if Noll told them). Opening the secret door onto the quay from inside is easy. A clerk\'s receipt here is the Chancellor\'s letter (handout).',
  });
  b.props_('desk', [[33, 31], [36, 31], [39, 31], [33, 34], [36, 34], [39, 34]]).props_('stool', [[33, 32], [36, 32], [39, 32], [33, 35], [36, 35], [39, 35]]).prop('archive-stacks', 41, 36).props_('chandelier', [[34, 33], [39, 33]]).prop('banner-hanging-tall', 41, 30);
  b.prop('hearth-oven', 31, 39).prop('pot-rack', 33, 38).prop('kitchen-table', 35, 39).prop('flour-sacks', 32, 40).prop('crate-stack', 39, 39).prop('coat-rack', 41, 38);
  b.prop('writing-desk', 46, 31).prop('chair-high-back', 46, 32).prop('rug', 45, 33).prop('globe-stand', 48, 31).prop('wine-rack', 43, 30).prop('safe', 49, 34);
  b.props_('strongbox', [[44, 37], [44, 39], [48, 37]]).prop('plinth-display', 46, 38).prop('coin-stacks', 48, 39).prop('gm-treasure', 47, 38, 0, { gm: true });
  b.light(36, 33, 20, 20, '#ffc870').light(46, 31, 10, 15).light(46, 38, 6, 10).light(33, 39, 8, 12);
  b.building('Guild watchtower', 50, 30, 4, 5, {
    mat: 'stone-flagstone',
    gm: 'A squat tower with a bell. A watcher here rings it if trouble starts; the bell brings every guard on the island to the Counting Floor. Silence the watcher (DC 14 Stealth to get close) and the bell stays quiet.',
    doors: [[50, 33, 'w', 'closed']],
  });
  b.prop('temple-bell', 52, 31).prop('ladder', 51, 33).prop('stool', 52, 33);
  b.area('South drawbridge', [[33, 43, 7, 6]], {
    read: 'A wooden drawbridge on chains, down for now. Three hard men in amber sit on crates at the island end, playing dice with a fourth who wears grey and watches the far bank, not the dice.',
    gm: 'The back way onto the island. Three veterans, four thugs and a guild spy. At dusk the bridge is raised (winch on the island side). A distraction on the far bank (a fire at the warehouses, say) draws half of them away. Swimming the 30 feet of the Guild Pool is a DC 12 Athletics check.',
    label: [36, 45],
  });
  b.encounter('South drawbridge', [33, 41, 7, 7], [['veteran', 3], ['thug', 4], ['spy', 1]], 'moderate');
  b.props_('crate', [[34, 42], [38, 42]]).prop('table-cards', 36, 42).prop('lantern-standing', 39, 41).light(39, 41, 12, 18);

  // the south bank: warehouses, Mudside, the tannery and the old mill
  b.building('Guild warehouse', 23, 49, 10, 7, {
    mat: 'wood-planks',
    read: 'Crates stamped with the amber seal, stacked to the rafters. Half of them are food the town paid for and never got.',
    gm: 'Proof of Garrick\'s hoarding: grain, salt fish and wine taken as toll. Two night watchmen (commoners) run at the sight of steel. Throwing the doors open for the town makes Lockhaven love the heroes (and draws half the drawbridge guards away).',
    doors: [[27, 49, 'n', 'closed', 'door-double'], [32, 52, 'e', 'closed']],
    windows: [[23, 52, 'w']],
  });
  b.props_('crate-stack', [[24, 50], [26, 51], [24, 54], [30, 50]]).props_('flour-sacks', [[28, 53], [30, 54]]).prop('barrel-stack', 31, 50).prop('fish-crate', 26, 54).prop('lantern-hanging', 28, 51).light(28, 51, 8, 12);
  b.building('Bonded warehouse', 40, 49, 11, 8, {
    mat: 'wood-planks-dark',
    read: 'A dark warehouse with a smell of wet fur and old wine. Something squeaks, and then something else answers it from under the floor.',
    gm: 'The guild\'s smugglers store their goods here, and a pair of wererats (Garrick\'s "rat-catchers") nest among the barrels with their giant rats. They spy for the guild in rat form. Captured, they trade: the water-gate opens at midnight for the guild\'s boat, and the password is "full measure".',
    doors: [[44, 49, 'n', 'closed', 'door-double'], [40, 53, 'w', 'closed'], [50, 51, 'e', 'closed']],
  });
  b.encounter('Rats in the bonded warehouse', [40, 49, 11, 8], [['wererat', 2], ['giantRat', 6]], 'low');
  b.props_('barrel-group', [[41, 50], [48, 50], [41, 55]]).props_('wine-rack', [[45, 50], [46, 50]]).props_('crate-pile', [[44, 54], [48, 54]]).prop('trapdoor', 46, 52).prop('bones', 43, 53).prop('cobweb-corner', 49, 55);
  b.building('Rat-docks', 51, 44, 7, 8, {
    mat: 'wood-planks-dark',
    read: 'A covered slip where the river laps under the boards. A long black boat with muffled oars rocks in the water.',
    gm: 'The guild\'s night boat, used to carry stolen goods to the island\'s water-gate. Taking it (and the password from the wererats) is the quiet way into the vault.',
    doors: [[51, 51, 'w', 'closed'], [54, 44, 'n', 'open']],
  });
  b.water(52, 44, 5, 4, true, true);
  b.prop('rowboat', 54, 45).props_('mooring-post', [[52, 48], [56, 48]]).prop('rope-coil', 53, 49).prop('oil-lamp-hanging', 55, 50).light(55, 50, 6, 10);

  b.area('Mudside', [[0, 44, 22, 18]], {
    read: 'Shacks on stilts, plank walks over stinking mud, and washing lines strung between them. Children stop playing to stare at you. Somewhere a fiddle plays, badly.',
    gm: 'The poor quarter. Mudsiders hate the guild and fear it more. They are hiding a stranger in the boat-house: a jester in motley who arrived on a barge a week ago, half-drowned. Guild thugs search the shacks every evening. A DC 14 Persuasion (or a kindness, like paying a family\'s toll debt) and a girl named Plover leads the heroes to him.',
    label: [8, 52],
  });
  b.mud(0, 44, 10, 3).mud(4, 49, 4, 4).mud(14, 50, 5, 3).mud(0, 58, 8, 3).mud(16, 56, 5, 2);
  b.paint(10, 44, 3, 18, 'wood-planks');
  b.building('Boat-house', 14, 41, 6, 5, {
    mat: 'wood-planks',
    read: 'A sagging boat-house half over the water. Nets hang from the beams, and in the corner, under a boat turned upside down, something in red and yellow is trying very hard not to breathe.',
    gm: 'Tobble Quillfeather, the late king\'s jester, hides here. He saw the High King murdered and knows who did it. He trusts nobody and pretends to be mad until the heroes show him the Regent\'s seal, or make him laugh (a good joke, DC 12 Performance). If guild thugs are on his trail (evening), four thugs and a bandit captain arrive while the heroes are talking: use the Pillory Green crew if they were not beaten.',
    doors: [[16, 45, 's', 'closed'], [16, 41, 'n', 'closed']],
  });
  b.prop('rowboat', 18, 43).prop('fishing-net', 15, 42).prop('fishing-gear', 18, 44).prop('lantern-hook', 15, 44).light(15, 44, 6, 10);
  b.building("Plover's shack", 2, 45, 5, 4, { gm: 'Plover\'s family (her mother and three little brothers). They owe the guild 12 gp. Paying it makes them friends for life.', doors: [[4, 48, 's', 'closed']] });
  b.prop('straw-bed', 3, 46).prop('cooking-pot-fire', 5, 46);
  b.building("Netmaker's shack", 6, 53, 5, 4, { gm: 'An old netmaker who sees everything from her porch. She tells the heroes the guild\'s black boat leaves the Rat-docks every midnight.', doors: [[10, 54, 'e', 'closed']] });
  b.prop('loom', 7, 54).prop('fishing-net', 9, 55);
  b.building("Fiddler's shack", 14, 52, 5, 4, { gm: 'A one-legged fiddler who was a bargeman until the guild broke his leg for a debt. He will play a tune to cover any noise.', doors: [[16, 52, 'n', 'closed']] });
  b.prop('stool', 15, 53).prop('bed', 17, 54);
  scatter(b, 'debris-wood', 0, 44, 22, 18, 5, 105);
  scatter(b, 'mud-patch', 0, 44, 22, 18, 4, 106);
  b.props_('campfire', [[7, 50]]).light(7, 50, 10, 15);

  b.building('Tannery', 60, 45, 11, 8, {
    mat: 'dirt',
    read: 'Vats of stinking brown liquor and hides hung like flags. Your eyes water at the door.',
    gm: 'The tanners work for the guild and hate it. The stink hides any scent (useful against the wererats). A tanner, Orla, will row the heroes to the island\'s ferry steps for 5 gp; the guild never searches a tanner\'s boat because nobody wants to.',
    doors: [[60, 48, 'w', 'closed'], [65, 52, 's', 'open']],
  });
  b.props_('cauldron', [[62, 46], [65, 46], [68, 46]]).props_('herbs-drying', [[62, 50], [68, 50]]).prop('workbench', 66, 49).prop('barrel-group', 69, 51);
  b.floor(61, 36, 2, 5, 'wood-planks').floor(75, 36, 2, 5, 'wood-planks');
  b.area('South wharf', [[59, 36, 21, 8]], {
    read: 'Wooden piers poke out into the brown river. Barges wait three deep for the lock, their crews idle and angry.',
    gm: 'Barge crews are a crowd waiting for a spark. A rousing speech (DC 14 Persuasion) gets twenty bargemen marching on the island with the heroes. Captain Breckon\'s cousin will lend a boat.',
    label: [68, 42],
  });
  b.props_('mooring-post', [[61, 36], [76, 36]]).props_('cargo-crates', [[63, 42], [72, 42]]).prop('fish-crate', 66, 42).prop('anchor', 78, 42);

  // the millrace and the old mill
  brush([[77, 71], [75, 64], [74, 56], [74, 48], [73, 44]], 2, (x, y) => b.water(x, y, 1, 1));
  b.pool(73, 63, 4.5, 3.5, true);
  b.building('Old mill', 62, 59, 8, 7, {
    mat: 'wood-planks',
    read: 'A tall mill with a broken wheel, leaning over a black millpond. The door hangs open. Flour lies thick on everything, marked with long, dragging tracks.',
    gm: 'Abandoned since the miller\'s debts drove him off. Garrick feeds his "pet" here: Old Snapjaw, a giant crocodile in the millpond. The guild drowns people here who will not bargain. A skeleton under the wheel wears a signet ring (the missing miller) and a purse of 40 gp.',
    doors: [[62, 62, 'w', 'closed'], [69, 61, 'e', 'open']],
  });
  b.props_('flour-sacks', [[63, 60], [65, 64]]).prop('grindstone', 66, 62).prop('debris-wood', 64, 60).prop('cobweb-corner', 68, 64).prop('skeleton-lying', 68, 60);
  b.encounter('Old Snapjaw', [69, 59, 9, 8], [['giantCrocodile', 1]], 'low');
  b.area('Millpond', [[69, 60, 8, 7]], { gm: 'Black, still water. Old Snapjaw lies under it. A haunch of meat thrown in the far end (DC 12 Animal Handling) keeps it busy long enough to search the mill.', label: [73, 63] });
  b.props_('reeds', [[70, 59], [77, 66]]).prop('lily-pads', 72, 61);

  b.area('Market gardens', [[38, 60, 22, 11]], { gm: 'Cabbage rows and bean frames. Gardeners pay the toll in vegetables. A good place to meet someone in secret: Reyna Sorrowind suggests it if the heroes want to talk away from the Heron.' });
  b.props_('crop-rows', [[40, 62], [44, 62], [48, 62], [40, 66], [44, 66], [48, 66]]).prop('scarecrow', 52, 64).prop('handcart', 55, 61).prop('beehive', 57, 68);
  scatter(b, 'tree-willow', 0, 63, 34, 9, 6, 107);
  scatter(b, 'tree-oak', 14, 7, 16, 6, 3, 108);
  scatter(b, 'bush', 52, 23, 10, 3, 3, 109);
  scatter(b, 'reeds', 0, 41, 9, 2, 3, 110);
  return b.build();
}

// =====================================================================
// Part 2: Wrenhollow Abbey in the Greywold (level 6)
// =====================================================================
function wrenhollow() {
  const b = new MapBuilder('adv-shc-wrenhollow', 'Wrenhollow Abbey', 80, 80, { open: true, floor: 'grass', ambient: 'dark', wallStyle: 'stone' });

  // the forest: thickets, the stream, the paths
  crag(b, 52, 69, 8, 5, 201);
  crag(b, 29, 73, 5, 3.5, 202);
  crag(b, 3, 45, 3, 4, 203);
  crag(b, 33, 1, 6, 1.5, 204);
  b.rock(0, 56, 22, 24);
  brush([[74, 0], [72, 12], [71, 20], [73, 30], [77, 40], [77, 50], [72, 60], [70, 79]], 2, (x, y) => b.water(x, y, 1, 1));
  b.water(75, 40, 3, 10, true);
  brush([[40, 77], [38, 70], [42, 62], [40, 53]], 3, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[8, 42], [8, 18], [8, 3], [47, 3], [64, 3], [66, 12]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[47, 3], [47, 6]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[41, 66], [30, 66], [22, 64]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  brush([[43, 62], [55, 56], [64, 50], [66, 40]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.start(40, 76, 3, 3);
  b.area("Pilgrims' Road", [[36, 64, 9, 16]], {
    read: 'The old road climbs through grey trees hung with moss. Every hundred paces a little shrine holds a candle, and every candle is lit, though nobody has walked this road in two years.',
    gm: 'The dead monks still light the road candles at dusk, out of habit. The heroes see a hooded figure far ahead, trimming a wick, who turns and walks into the trees when called. It is a zombie that was once Brother Prosper; it does not attack unless touched. Fork west: the burned hostel. Fork east: the fishponds.',
    label: [40, 70],
  });
  b.props_('road-shrine', [[37, 72], [43, 66], [39, 58]]).props_('candles', [[38, 72], [44, 66], [40, 58]]);
  b.light(38, 72, 5, 10, '#ffd28a').light(44, 66, 5, 10, '#ffd28a').light(40, 58, 5, 10, '#ffd28a');

  b.building("Pilgrims' hostel", 26, 56, 10, 7, {
    mat: 'wood-planks-dark',
    read: 'A guesthouse for pilgrims, its roof half burned away. Ash drifts in through the holes. Bedrolls lie in rows, all empty, all neatly made.',
    gm: 'The monks burned the plague-dead here before they died themselves. One bedroll is new: a dead woman in a grey cloak with a silver hand brooch, killed by claws a week ago. She was one of Reyna Sorrowind\'s Silver Hand, sent ahead to steal the shard. Her satchel holds a sketch-map of the abbey (marks the chancel, "the Pale Stone is on the altar, she never leaves it") and 25 gp.',
    doors: [[35, 59, 'e', 'open'], [30, 62, 's', 'closed']],
  });
  b.props_('bedroll', [[27, 57], [29, 57], [31, 57], [33, 57], [27, 60], [29, 60]]).prop('skeleton-lying', 32, 60).prop('debris-wood', 34, 57).prop('embers-ash', 30, 58).prop('backpack', 33, 60);

  // the precinct wall, with the lychgate, Mill Gate, a postern and the broken west wall
  b.wallRun(19, 7, 44, 'n').wallRun(19, 52, 44, 's').wallRun(19, 7, 26, 'w').wallRun(19, 36, 17, 'w').wallRun(62, 7, 46, 'e');
  b.door(40, 52, 's', 'closed', 'door-double').door(41, 52, 's', 'closed', 'door-double').door(62, 24, 'e', 'closed').door(47, 7, 'n', 'locked');
  b.rubble(18, 33, 3, 3);
  b.area('Lychgate', [[38, 51, 6, 4]], {
    read: 'A roofed gate of black oak, carved with wrens. A bell hangs in it with no rope. As you pass under, it rings once, very softly, all by itself.',
    gm: 'The bell tells the dead that visitors have come. From now on, the abbey is aware of the heroes: the dead watch from windows but keep to their hours. Ringing the bell on purpose three times (the old signal for "the abbess is needed") brings Hildegrun\'s voice from the church: "Who calls at this hour?"',
    label: [41, 53],
  });
  b.prop('temple-bell', 41, 51);

  b.area('Graveyard', [[37, 44, 25, 8], [37, 38, 14, 6]], {
    read: 'Rows of graves, and every grave is open. The earth is pushed out from below, not dug in from above. Each headstone has a fresh name carved under the old one.',
    gm: 'The monks dug themselves out the night after they were buried. Not all came back right: two ghasts and two ghouls (the plague-dead from the village) still lie in open graves and rise when anyone walks between them, with four zombies. A DC 13 Religion check on the new names: they are the names the monks took when they joined the order, as if the dead were starting over.',
    label: [48, 47],
  });
  b.encounter('The restless graves', [37, 42, 25, 10], [['ghast', 2], ['ghoul', 2], ['zombie', 4]], 'low');
  scatter(b, 'open-grave', 37, 44, 25, 8, 9, 205);
  scatter(b, 'open-grave', 37, 38, 14, 6, 3, 206);
  b.props_('tree-dead', [[38, 50], [60, 45], [44, 39]]).prop('cairn', 58, 50).prop('statue-tall-robed', 55, 47).prop('urn', 50, 49);

  hall(b, 'Abbey church', [[36, 19, 11, 18], [38, 11, 7, 8], [30, 22, 23, 5]], 'stone-flagstone', {
    read: 'A tall grey church, cold as a well. Candles burn in every niche. Down the long nave, in rows, robed figures kneel with their backs to you, perfectly still.',
    gm: 'Forty dead monks kneel in the nave at prayer. They ignore anyone who is quiet and respectful. A drawn weapon, a shout or a spell makes every hooded head turn at once (no attack yet: it is a warning). Hildegrun prays in the chancel beyond the screen.',
    label: [41, 30],
  });
  b.wallRun(38, 18, 7, 's');
  b.door(41, 18, 's', 'open', 'door-double').door(41, 36, 's', 'closed', 'door-double').door(42, 36, 's', 'closed', 'door-double').door(30, 24, 'w', 'closed').door(52, 24, 'e', 'closed').door(36, 31, 'w', 'closed').door(41, 11, 'n', 'locked');
  b.paint(38, 11, 7, 8, 'marble');
  b.area('Chancel', [[38, 11, 7, 8]], {
    read: 'Behind the carved screen, a hundred candles. On the high altar a crystal reliquary holds a shard of white stone that glows like the moon. Before it kneels a woman in grey robes, and you can see the altar through her.',
    gm: 'Abbess Hildegrun Vos (wraith) and the Pale Shard. See the scene "Vespers for the dead". She believes her prayer saved her monks from death. She is not wrong, exactly, and that is the horror of it.',
  });
  b.encounter('Vespers for the dead', [36, 11, 11, 15], [['wraith', 1], ['wight', 2], ['ghost', 1], ['ghoul', 4]], 'high');
  b.prop('altar-reredos', 41, 12).prop('reliquary', 41, 13).props_('candelabra-grand', [[39, 12], [43, 12]]).prop('organ-cathedral', 39, 16).props_('prayer-kneeler', [[40, 15], [42, 15]]).prop('censer-hanging', 41, 17).prop('stairs-down', 44, 17);
  b.props_('pew', [[38, 28], [44, 28], [38, 30], [44, 30], [38, 32], [44, 32], [38, 34], [44, 34]]).props_('column-fluted', [[37, 22], [45, 22], [37, 26], [45, 26]]).prop('font', 41, 34).props_('window-stained-tall', [[36, 20], [46, 20]]);
  b.props_('statue-tall-robed', [[31, 23], [51, 23]]).props_('candle-stand-tall', [[33, 25], [49, 25]]).prop('sarcophagus-effigy', 34, 23).prop('shrine', 50, 25);
  b.light(41, 13, 20, 20, '#e8f0ff').light(41, 24, 20, 20, '#ffd28a').light(41, 32, 15, 20, '#ffd28a').light(32, 24, 8, 12, '#ffd28a').light(50, 24, 8, 12, '#ffd28a');

  hall(b, 'Bell tower', [[47, 31, 4, 6]], 'stone-flagstone', {
    read: 'A narrow tower full of ropes. High above, the great bell hangs silent, its rope tied off with a monk\'s belt.',
    gm: 'Ringing the great bell (DC 15 Athletics to haul the stiff rope) is the old call to the dead to "come to rest". Every undead in the abbey must make a DC 13 Wisdom save or stand still for 1 minute. It works once. The stair climbs to a gallery over the nave (good for an ambush, or a way to reach the chancel unseen).',
  });
  b.door(46, 33, 'e', 'closed').door(49, 36, 's', 'closed');
  b.props_('stair-spiral', [[49, 32]]).prop('rope-coil', 48, 35).prop('temple-bell', 48, 33);

  hall(b, 'Chapter house', [[21, 16, 8, 12]], 'stone-flagstone', {
    read: 'An eight-sided room with stone seats round the walls. Dead monks sit in every seat, robes rustling, while one reads aloud from a book with no words on its pages.',
    gm: 'The chapter meets every day to confess its faults. Four wights (the senior brothers, who know what they are and like it) and two ghoul novices. The wights want the abbey to stay as it is: "Death is a door, and the Mother Abbess has locked it." They fight to keep the shard. A clever hero can ask to confess: the dead listen, and a DC 15 Persuasion confession that names their death lets one wight lie down and rest (the others are shaken).',
  });
  b.door(28, 24, 'e', 'closed').door(25, 27, 's', 'closed');
  b.encounter('Chapter of the dead', [21, 16, 8, 12], [['wight', 4], ['ghoul', 2]], 'moderate');
  b.props_('bench-long', [[22, 18], [27, 18], [22, 22], [27, 22]]).prop('lectern', 25, 17).prop('chair-high-back', 25, 19).prop('candelabra', 24, 25).prop('book-pile', 26, 25).light(25, 20, 10, 15, '#ffd28a');

  hall(b, 'Cloister', [[22, 28, 14, 14]], 'dungeon-slab', {
    read: 'A square walk of arches around a little garden. The herbs are dead, but someone has watered them. A dead monk rakes the gravel, the same strip, over and over.',
    gm: 'The heart of the abbey\'s daily round. The dead walk the cloister between the hours. The well in the garth still has sweet water, and the stone by it is carved with the abbey rule (DC 12 Religion: "Mercy is the last gift; never the first refusal").',
    label: [28, 29],
  });
  b.paint(24, 30, 10, 10, 'grass');
  b.wallRun(24, 30, 10, 'n', 'low').wallRun(24, 39, 10, 's', 'low').wallRun(24, 30, 10, 'w', 'low').wallRun(33, 30, 10, 'e', 'low');
  b.door(35, 31, 'e', 'closed').door(22, 34, 'w', 'closed').door(28, 41, 's', 'closed');
  b.prop('well', 28, 34).props_('herbs-drying', [[25, 31], [31, 38]]).prop('statue-tall-robed', 31, 32).prop('bench', 26, 37).props_('column-fluted', [[23, 29], [34, 29], [23, 40], [34, 40]]).prop('prayer-kneeler', 29, 35);

  hall(b, 'Dormitory', [[19, 43, 17, 7]], 'wood-planks', {
    read: 'A long room of narrow beds. In each bed lies a grey shape under a blanket, hands folded. None of them breathe. All of them, as you pass, turn their heads.',
    gm: 'The monks "sleep" here between the night hours. They will not leave their beds unless someone harms one of them. A loose board under the abbess\'s old cell bed (DC 14 Investigation) hides the key to the north postern. At the west end a secret door (DC 15 Perception; a draft moves the candle) opens on the Dead Walk to the crypt.',
  });
  b.door(28, 43, 'n', 'closed').door(35, 46, 'e', 'closed').door(19, 47, 'w', 'secret');
  b.props_('cot', [[21, 44], [23, 44], [25, 44], [27, 44], [29, 44], [31, 44], [33, 44], [21, 48], [23, 48], [25, 48], [27, 48], [29, 48], [31, 48]]).prop('candles', 34, 48).prop('washbasin', 34, 44);

  hall(b, "Abbess's lodging", [[20, 8, 8, 7]], 'wood-planks-dark', {
    read: 'A plain room with a narrow bed, a prayer stool and a desk covered in letters. The ink in the well is still wet.',
    gm: 'Hildegrun still writes letters to the families of her dead brothers, telling them their sons are well. Her desk holds dozens, never sent. Her journal tells the story: the plague came, the star fell through the infirmary roof, she took up the white stone and prayed that "none of mine be taken". The last entry: "They came back. All of them. God forgive me, I was glad."',
  });
  b.door(24, 14, 's', 'closed');
  b.prop('bed', 21, 9).prop('writing-desk', 25, 9).prop('prayer-kneeler', 21, 12).prop('scroll-pile', 26, 10).prop('candles', 25, 10).prop('trunk', 26, 13).light(25, 10, 6, 10, '#ffd28a');

  hall(b, 'Scriptorium', [[29, 8, 7, 8]], 'wood-planks', {
    read: 'Copying desks under tall windows, each with a book open and a pen laid down mid-word. Shadows move across the pages, though nothing moves to cast them.',
    gm: 'The abbey\'s library. Brother Lammert, a ghost, still copies the great chronicle, and two specters (copyists) haunt the stacks. They attack anyone who removes a book. Brother Lammert can be talked to: he knows the crown\'s lore (each stone a virtue; the Pale Stone was Mercy) and that a wraith "can be asked to let go, but only by one who carries her own words". The chronicle\'s last page (handout) is Hildegrun\'s prayer.',
  });
  b.door(32, 15, 's', 'closed').door(29, 11, 'w', 'closed');
  b.encounter('Shadows in the scriptorium', [29, 8, 7, 8], [['ghost', 1], ['specter', 2]], 'low');
  b.props_('writing-desk', [[30, 9], [32, 9], [34, 9], [30, 12], [32, 12]]).prop('bookshelf-tall', 34, 13).prop('scroll-rack', 30, 14).prop('levitating-tome', 33, 11).light(32, 11, 8, 12, '#cfe0ff');

  b.area('Herb garden', [[46, 9, 5, 12]], { gm: 'Rows of healing herbs gone to seed. A DC 12 Medicine check gathers enough to make one potion of healing\'s worth of poultice (heals 2d4+2 once).' });
  b.props_('herbs-drying', [[47, 10], [49, 14]]).props_('flowers', [[47, 18], [49, 11]]).prop('beehive', 50, 19).prop('bush', 46, 16);

  hall(b, 'Infirmary', [[52, 9, 10, 12]], 'stone-flagstone', {
    read: 'Beds behind linen screens, a smell of vinegar and something worse. The roof has a ragged hole in it, and under the hole the floor is scorched in a star shape.',
    gm: 'Where the Pale Shard fell. The plague-dead lie here still: eight zombies in the beds and two wights who were the infirmarers, still tending them. They attack anyone who comes near the beds. A DC 13 Investigation of the scorch mark finds a splinter of white crystal: holding it, a hero hears Hildegrun\'s prayer whispered, which counts as "her own words" for the climax.',
  });
  b.door(52, 15, 'w', 'closed').door(56, 20, 's', 'closed');
  b.encounter('The infirmary', [52, 9, 10, 12], [['wight', 2], ['zombie', 8]], 'low');
  b.props_('cot', [[53, 10], [55, 10], [57, 10], [59, 10], [53, 14], [55, 14], [57, 14], [59, 14]]).props_('folding-screen', [[54, 12], [58, 12]]).prop('apothecary-counter', 60, 18).prop('potion-shelf', 61, 16).prop('burning-ground', 57, 17).prop('washbasin', 53, 18);

  hall(b, 'Refectory', [[52, 28, 10, 10]], 'wood-planks', {
    read: 'Long tables set for supper. Dead monks sit in rows before empty bowls, spoons raised, while one reads aloud from a lectern in a voice like dry leaves. Nobody eats. Nobody ever eats.',
    gm: 'Two ghasts and six ghouls: the monks who caught the plague last and were hungriest at the end. They are trying very hard to keep the rule of silence at meals. Any living hero who sits down and is served (a bowl of nothing) is safe here; one who speaks aloud breaks the silence and the hunger wins.',
  });
  b.door(52, 31, 'w', 'closed').door(56, 37, 's', 'closed');
  b.encounter('The silent refectory', [52, 28, 10, 10], [['ghast', 2], ['ghoul', 6]], 'low');
  b.props_('table-long', [[54, 30], [54, 34], [59, 30], [59, 34]]).props_('bench-long', [[54, 31], [54, 33], [59, 31], [59, 33]]).prop('lectern', 57, 36).light(57, 32, 10, 15, '#ffd28a');
  hall(b, 'Abbey kitchen', [[52, 38, 10, 6]], 'stone-flagstone', { gm: 'Cold ovens and a larder of rotten food. One loaf on the table is fresh: the hermit leaves bread here for the dead, every week. A DC 13 Survival follows his tracks out of the Mill Gate.' });
  b.door(56, 43, 's', 'closed').door(61, 40, 'e', 'closed');
  b.prop('hearth-oven', 53, 39).prop('kitchen-table', 56, 40).prop('bread-rack', 59, 39).prop('pot-rack', 55, 42).prop('flour-sacks', 60, 42);

  // the mill, the fishponds and the hermit across the stream
  b.building('Abbey mill', 63, 14, 6, 8, {
    read: 'A stone mill on the stream, its wheel still turning slowly. Inside, sacks of flour sit ready as if the miller stepped out a moment ago.',
    gm: 'The only living soul who comes here is the hermit, who grinds his flour and leaves bread for the dead. The mill\'s loft holds a spyglass and a monk\'s robe (good for walking among the dead: advantage on Deception to pass as one of them).',
    doors: [[65, 21, 's', 'closed'], [68, 17, 'e', 'closed']],
  });
  b.props_('flour-sacks', [[64, 15], [64, 19]]).prop('grindstone', 66, 17).prop('ladder', 67, 15).prop('sack', 65, 19);
  b.floor(69, 17, 6, 1, 'wood-planks');
  b.prop('bridge-plank', 72, 17, 90);
  b.area('Mill yard', [[63, 22, 8, 5]], { gm: 'Outside the Mill Gate. A cart with a broken wheel and the hermit\'s footprints going to and fro.' });
  b.prop('cart', 65, 24).prop('log-pile', 68, 23).prop('chicken-coop', 63, 25);

  b.pool(66, 32, 3.5, 2.5).pool(67, 40, 3.5, 3, true).pool(66, 47, 3, 2);
  b.area('Fishponds', [[62, 28, 10, 22]], {
    read: 'Three dark ponds in a row, mist curling off them. Little lights drift over the water, bobbing like lanterns carried by someone looking for something they lost.',
    gm: 'Three will-o\'-wisps, the souls of drowned plague-dead who were never buried. They lure the heroes onto the soft banks (DC 13 Wisdom save or walk toward the light into the deep pond). They can be laid to rest by pulling their bodies from the middle pond (DC 14 Athletics, three dives) and burying them: each body raised makes one wisp fade away in peace.',
  });
  b.encounter('Lights over the fishponds', [62, 28, 10, 22], [['willOWisp', 3]], 'low');
  b.props_('reeds', [[63, 30], [70, 34], [63, 43], [69, 49]]).props_('lily-pads', [[66, 32], [66, 47]]).prop('fishing-net', 64, 37).prop('rowboat', 69, 41).light(67, 40, 5, 15, '#9fe8ff');

  b.building("Hermit's cell", 74, 6, 5, 5, {
    mat: 'wood-planks',
    read: 'A hut of logs and moss on the far bank, with smoke curling from the roof. An old man in a patched habit sits outside, carving a wren from a stick.',
    gm: 'Brother Hennick, the only monk who lived: he was away at the market when the plague came, and the abbess sent word not to return. He knows everything about the abbey, the hours the dead keep, and the north postern key\'s hiding place. He begs the heroes to free his brothers, not destroy them. He knows Hildegrun\'s body lies in the Founder\'s tomb, and that the dead cannot rest while it lies unblessed.',
    doors: [[76, 10, 's', 'open']],
  });
  b.prop('straw-bed', 75, 7).prop('campfire', 76, 12).prop('workbench', 77, 8).prop('beehive', 78, 13).light(76, 12, 10, 15);
  b.area("Hermit's wood", [[73, 0, 7, 16]], { gm: 'A quiet patch of birches across the stream. The dead never cross running water: it is the one place in the Greywold where they never come.' });
  scatter(b, 'tree-birch', 73, 0, 7, 16, 6, 207);
  b.area('North woods', [[0, 0, 70, 6]], { gm: 'The old woodcutters\' path loops round the abbey from the orchard to the mill. It passes the north postern (locked; DC 16 thieves\' tools or the key from the dormitory).', label: [30, 4] });

  b.area('Orchard', [[2, 16, 16, 27]], {
    read: 'Apple trees run wild, branches heavy with fruit nobody picks. Bees hum in broken hives. At the end of the rows, the abbey wall has fallen in a slope of stones.',
    gm: 'The quiet way into the abbey: over the fallen wall into the cloister. The apples are good. Under the biggest tree, a ring of mushrooms marks where the hermit buried the abbey cat, with a little carved wren.',
  });
  scatter(b, 'tree-oak', 2, 16, 15, 27, 16, 208);
  b.props_('beehive', [[5, 20], [12, 38]]).props_('mushrooms', [[10, 28]]).prop('wall-stone-low', 17, 30).prop('handcart', 13, 24).prop('ladder', 15, 34);
  b.area('Broken wall', [[17, 32, 5, 5]], { gm: 'A slope of fallen stones (rough ground). Climbing it quietly is a DC 12 Stealth check; a failure clatters, and the raking monk in the cloister looks up.' });

  // the Dead Walk and the crypt under the barrow
  hall(b, 'The Dead Walk', [[12, 46, 7, 2], [12, 48, 2, 8]], 'dungeon-slab', {
    read: 'A low stone passage, roofed with turf, running from the abbey wall down into the hillside. The walls are lined with skulls set in niches, each with a name painted on its brow.',
    gm: 'The monks\' funeral path to the crypt. Quiet. A DC 13 Perception notices fresh scratches on the floor: something heavy was dragged down here recently (Hildegrun\'s body, carried by the dead).',
  });
  b.door(12, 55, 's', 'closed').door(13, 55, 's', 'closed');
  b.props_('skull-pile', [[14, 46], [17, 47]]).prop('candles', 12, 51).light(12, 51, 5, 8, '#ffd28a');
  b.room('Crypt stair', 11, 56, 4, 3, { mat: 'dungeon-slab', gm: 'Steps down into the dark. Cold air rises.' });
  b.prop('stairs-down', 12, 56);
  b.room('Ossuary', 3, 57, 8, 8, {
    mat: 'dungeon-slab',
    read: 'Bones, sorted and stacked: skulls here, long bones there, all in neat walls up to the ceiling. Something has taken bones from the walls and laid them out on the floor in the shape of a door.',
    gm: 'The monks kept their dead in tidy piles. The door-shape on the floor points to the locked tomb door (south). Nothing here attacks.',
  });
  b.props_('ossuary-shelf', [[3, 58], [3, 61], [10, 58]]).props_('skull-pile', [[5, 63], [8, 63]]).prop('bone-heap', 6, 60).light(6, 60, 5, 8, '#9fe8ff');
  b.room('Hall of Brothers', 11, 59, 9, 10, {
    mat: 'dungeon-slab',
    read: 'Burial shelves line the walls, four high. In each lies a linen-wrapped shape. Four of the wrappings have been torn open from inside.',
    gm: 'The oldest dead, wrapped in the founder\'s time, woke when the shard fell: four mummies and a ghast. They guard the way to the Founder\'s tomb. A hero who lays a hand on a shelf and speaks a dead monk\'s name from the Dead Walk skulls (DC 13 Religion) makes that mummy lie back down.',
  });
  b.encounter('The Hall of Brothers', [11, 59, 9, 10], [['mummy', 4], ['ghast', 1]], 'moderate');
  b.props_('tomb-niche', [[11, 60], [19, 60], [11, 64], [19, 64], [11, 67], [19, 67]]).props_('sarcophagus-row', [[15, 62]]).prop('candelabra', 15, 66).light(15, 64, 8, 10, '#9fe8ff');
  b.floor(6, 65, 2, 2, 'dungeon-slab').door(6, 66, 's', 'locked', 'door-iron').door(7, 66, 's', 'locked', 'door-iron');
  b.room("Founder's tomb", 3, 67, 8, 8, {
    mat: 'marble',
    read: 'A white tomb under a low dome. On the founder\'s stone coffin lies a second body, newer, in grey robes, its hands folded around nothing. A wren is carved over the door.',
    gm: 'Hildegrun\'s own body, carried here by her monks. Her hands once held the shard; now they are empty. Reading her prayer aloud over the body and adding "and now, Mother, let them go" (any hero, with the chronicle page or the infirmary splinter) blesses it: in the chancel, the wraith hesitates (see the climax). The door from the ossuary is locked (DC 15 thieves\' tools; the founder\'s ring in the plague pit fits it).',
  });
  b.prop('sarcophagus-effigy', 6, 70).props_('candle-ring', [[4, 68], [9, 68]]).prop('statue-tall-winged', 7, 73).prop('gm-treasure', 9, 73, 0, { gm: true }).light(6, 70, 8, 10, '#ffffff');
  b.floor(15, 69, 2, 1, 'dungeon-slab').floor(11, 72, 1, 2, 'dungeon-slab');
  b.room('Plague pit', 12, 70, 8, 7, {
    mat: 'cave-floor',
    read: 'A rough cave where the village plague-dead were laid in lime. The lime has cracked. Things move under it, slowly, like sleepers turning over.',
    gm: 'The village dead are only bones; they shift but cannot rise (the shard\'s mercy was only for "mine", the monks). A DC 12 Investigation finds the founder\'s iron ring on a skeleton\'s finger: it opens the tomb door. Sweet cold air comes from a crack in the east wall: the old barrow door.',
  });
  b.prop('bone-heap', 14, 72).prop('skeleton-lying', 17, 74).prop('open-grave', 15, 75).prop('mud-patch', 18, 71);
  b.floor(20, 63, 2, 2, 'cave-floor').door(21, 63, 'e', 'secret');
  b.area('Barrow door', [[19, 62, 5, 4]], { gm: 'A stone slab in the hillside, overgrown with ivy. From outside it is a secret (DC 16 Perception, or Brother Hennick shows them). From inside, it swings open easily.', label: [21, 64] });

  scatter(b, 'tree-pine', 0, 6, 18, 10, 10, 209);
  scatter(b, 'tree-pine', 22, 56, 50, 23, 30, 210);
  scatter(b, 'tree-dead', 44, 56, 26, 23, 8, 211);
  scatter(b, 'ferns', 22, 56, 50, 23, 10, 212);
  scatter(b, 'tree-pine', 63, 52, 8, 26, 8, 213);
  scatter(b, 'tree-pine', 0, 44, 18, 11, 8, 214);
  scatter(b, 'brambles', 0, 44, 18, 11, 4, 215);
  scatter(b, 'tree-pine', 20, 0, 50, 6, 10, 216);
  scatter(b, 'mushrooms', 22, 56, 50, 23, 5, 217);
  return b.build();
}

// =====================================================================
// The adventure
// =====================================================================
export const SHATTERED_CROWN: Adventure = {
  id: 'shattered-crown',
  title: 'The Shattered Crown',
  tagline: 'The high king is murdered and his crown lies in six cursed shards across six provinces: gather them before a charming usurper crowns himself.',
  levels: '5-10',
  sessions: '10-14 sessions',
  players: '3-5 players',
  tags: ['campaign', 'intrigue', 'epic', 'quest', 'kingdom'],
  pitch:
    'For thirty years the Concord Crown of High King Edwin Ostergard kept seven quarrelling provinces at peace. At the Midwinter feast someone murdered the king, and the crown burst into six shards that flew across the realm like falling stars. Each shard has found a hand to hold it, and every hand has gone wrong. The provinces are sharpening their swords. The king\'s Chancellor has named himself Protector and set a date for his coronation. And the Lady Regent, poisoned and dying in her tower, has sent for you.',
  secret:
    'Corwin Dunmallow, the Silver Chancellor, killed the king. For thirty years he was Edwin\'s friend, his court sorcerer and his voice in the council, and for thirty years he believed he would rule better. He learned the crown\'s secret: it binds the seven provinces\' virtues together, and a crown reforged by a new hand bends those virtues to that hand. Whoever wears it would be loved by every soul in the realm, and no one would ever refuse them again. Corwin struck the king down with a spell at the feast. The crown, which cannot pass by murder, shattered. Corwin caught one shard, the Keystone of Concord, and its broken power makes everyone who hears him want to agree. He blamed the Regent\'s Westmarch guards, poisons the Regent slowly, and has called the lords of all seven provinces to his coronation in the Cathedral of the Concord at midsummer, when the seven lamps are lit and a crown may be reforged. He needs the other five shards for the rite. His agent Reyna Sorrowind, the Silver Hand, hunts them across the realm. Why now: midsummer is eight weeks away, and every province is mustering for a civil war that only a crown can stop.',
  hooks: [
    'The Lady Regent Isveth Moorcroft summons the heroes to her sickbed in Westmarch and names them Shardwardens under her seal (handout: the Regent\'s warrant). She pays 500 gp now and promises lands and titles at the end.',
    'A hero\'s home province is about to march to war. Their lord asks them to find out the truth about the king\'s death before the first blood is spilled.',
    'Reyna Sorrowind, a smiling woman in grey, hires the heroes "for the Chancellor" to fetch a lump of amber from a river town. It is honest work, she says. It is not.',
  ],
  tips: [
    'The shards: anyone carrying a shard for an hour is drawn to use it. Each shard gives a gift and a twist (see each part). At each dawn, a hero carrying shards makes a DC 13 Wisdom save (+1 DC for each shard carried after the first); on a failure the twist takes hold for the day. Haldis Deepanvil can forge a casket in part 3 that stops the pull.',
    'Banners: keep a list of the seven provinces. Westmarch is with the heroes and the Crownlands are with Corwin. Each part, if the heroes heal the province instead of just grabbing the shard (free the town, rest the dead, save the city, spare the islands, win the hill fort\'s loyalty), that province sends its banner to the coronation. In part 6, each banner is a concrete ally and a vote in the Assembly.',
    'Reyna Sorrowind is the rival. She turns up in every part a step ahead or a step behind. Let her be clever, funny and fair. In part 5 she learns Corwin plans to kill her after the coronation, and she can be turned. She is worth more as a witness than as a corpse.',
    'Corwin is charming, not cackling. He sends polite letters, offers the heroes pardons and rewards, and is genuinely sorry about all this. Every part should have one "Chancellor\'s move": a letter, a bribe, a lie spread about the heroes, an envoy. Make the players almost like him.',
    'Tobble Quillfeather the jester saw the murder. He is the key witness for part 6. Keep him alive, keep him funny, and give him one moment of real courage each part.',
    'Level the heroes up at the end of each part: 5, 6, 7, 8, 9, then 10 for the coronation. Parts 2 to 5 can be played in any order if you adjust the foes; the levels given assume this order.',
  ],
  npcs: [
    {
      id: 'pf_shcisveth', name: 'Isveth Moorcroft', title: 'Lady Regent of the Seven Provinces', kind: 'npc', art: 'queen', shared: true,
      wants: 'To keep the peace one more summer, to see the murderer named, and to live long enough to see it.', knows: 'That the crown cannot pass by murder, that a rite at midsummer can reforge it, and that someone at court is poisoning her.',
      voice: 'Dry and calm, with a soldier\'s bluntness. Coughs, and refuses to mention it.', appearance: 'A grey-haired woman of sixty in a plain blue gown, propped on pillows, a sword across her knees that she can no longer lift.',
      backstory: 'Edwin\'s cousin and his commander for thirty years. She named the Chancellor to the council herself, and has not forgiven herself for it.',
      gmNotes: 'She dies before midsummer unless cured. The Pale Shard, freed from its curse in part 2, can heal her (a full night\'s vigil). If she lives, she can stand in the cathedral as the Assembly\'s choice.',
    },
    {
      id: 'pf_shccorwin', name: 'Corwin Dunmallow', title: 'the Silver Chancellor, Lord Protector', kind: 'monster', art: 'court-wizard', monsterId: 'archmage', shared: true,
      wants: 'To reforge the Concord Crown on his own head and be loved by every soul in the realm, forever.', knows: 'Everything about the crown, the rite, the shards and every lord\'s price.',
      voice: 'Warm, amused, unhurried. Uses your name often. Apologises sincerely while doing terrible things.', appearance: 'A tall, silver-haired man of fifty in dove-grey robes, with kind eyes and a shard of clear crystal set in a silver ring on his left hand.',
      backstory: 'A miller\'s son who rose by brilliance to be the king\'s best friend. He came to believe that only he understood how to rule, and that the realm\'s love was owed to him.',
      gmNotes: 'Archmage stat block. While he wears the Keystone ring, any creature that hears him speak must make a DC 17 Wisdom save at the start of its turn or be charmed until the end of that turn (it will not attack him, and wants to agree). Taking the ring or exposing his murder (see part 6) ends it. He prefers talk, bribes and letters to fights, until the coronation.',
    },
    {
      id: 'pf_shctobble', name: 'Tobble Quillfeather', title: 'the late king\'s jester', kind: 'npc', art: 'jester', shared: true,
      wants: 'To see the king\'s murderer hanged, and to never be brave again after that.', knows: 'He saw Corwin strike the king with a spell from behind a pillar at the feast. He also knows every secret passage in the Cathedral of the Concord (he hid in them as a boy).',
      voice: 'Rhymes when he is frightened, which is often. Jokes about everything except the king.', appearance: 'A small, bony man in faded red-and-yellow motley, bells cut off his cap so they will not give him away, eyes red from crying.',
      gmNotes: 'Found in part 1, he travels with the heroes. He is the witness the Assembly needs in part 6. Corwin wants him dead quietly; Reyna has orders to find him.',
    },
    {
      id: 'pf_shcreyna', name: 'Reyna Sorrowind', title: 'the Silver Hand, the Chancellor\'s agent', kind: 'monster', art: 'assassin', monsterId: 'assassin', shared: true,
      wants: 'Gold, a title and a quiet life; to win the race; and, though she will not say it, to have chosen the right side.', knows: 'Where each shard is going, who holds it, and the Chancellor\'s plans for each province (not his plans for her).',
      voice: 'Light and amused, calls the heroes "my rivals". Never lies outright; she is proud of that.', appearance: 'A lean woman in a grey travelling cloak with a silver hand-shaped brooch, a scar through one eyebrow and a habit of eating apples.',
      backstory: 'An orphan the king\'s spymaster trained. When Edwin died, Corwin took her into his service. She thinks the king died of Westmarch treachery.',
      gmNotes: 'Assassin stat block. She races the heroes for each shard, bargains, and fights only when she must. In part 5 she finds Corwin\'s order for her death after the coronation; shown proof that Corwin killed the king, she turns, and in part 6 she is a second witness and an inside blade.',
    },
    {
      id: 'pf_shcgarrick', name: 'Garrick Pellingham', title: 'Guildmaster of the Bargemen of Lockhaven', kind: 'monster', art: 'merchant', monsterId: 'gladiator',
      wants: 'More. More tolls, more debtors, more promises. He cannot remember what he wanted before the shard.', knows: 'That the "lump of amber" fell out of the sky into his barge, that a grey-cloaked lady offered 5,000 gp for it, and that every bargain he strikes now binds.',
      voice: 'Hearty, back-slapping, always offering a deal. Says "fair\'s fair" before every unfair thing.', appearance: 'A huge, broad-shouldered man gone soft, in an amber velvet coat, with a prize-fighter\'s broken nose and a shard of honey-gold crystal on a gold chain.',
      backstory: 'A barge-hand and prize-fighter who built the guild into the fairest in the river provinces. He was a good man until three months ago.',
      gmNotes: 'Gladiator stat block. The Amber Shard: any creature that shakes on a bargain with him must keep it (DC 16 Wisdom save to break it, once per day). Take the shard and he weeps, and remembers what he did, and offers to repay everything.',
    },
    {
      id: 'pf_shchildegrun', name: 'Hildegrun Vos', title: 'Mother Abbess of Wrenhollow', kind: 'monster', art: 'wraith', monsterId: 'wraith',
      wants: 'To keep her brothers safe from death forever, and to never have to bury another of them.', knows: 'Every soul in her abbey by name. That she is dead (she does not let herself think about it).',
      voice: 'Soft and motherly, then an icy whisper. Calls everyone "child".', appearance: 'A tall woman in grey robes, see-through as smoke, with a white glow where her heart should be and her hands always folded.',
      gmNotes: 'Wraith stat block. If her body in the Founder\'s tomb was blessed with her own prayer, she hesitates on her first turn and can be asked to let go (DC 15 Persuasion, advantage if Brother Hennick is there); if she agrees, the shard goes dark, every undead in the abbey lies down, and the fight ends.',
    },
    {
      id: 'pf_shchaldis', name: 'Haldis Deepanvil', title: 'Forgemaster of Brassholm', kind: 'npc', art: 'blacksmith', monsterId: 'veteran', shared: true,
      wants: 'To shut down the golem she woke, save her city, and never touch the Iron Shard again.', knows: 'How the old war golems work, the Heart Forge\'s secrets, and how to forge a casket that dulls a shard\'s pull.',
      voice: 'Gruff and fast, swears by her grandmother\'s beard, thinks out loud in measurements.', appearance: 'A stout dwarf woman with braided red hair singed short, leather apron, one hand bandaged from the burn the shard gave her.',
      gmNotes: 'Veteran stat block. She found the Iron Shard and set it into the old war golem Gallowmaul to "defend the city from the war that\'s coming". The golem now obeys only the shard. She knows the golem\'s shutdown word, but must reach its chest to speak it.',
    },
    {
      id: 'pf_shcmorwenna', name: 'Morwenna Saltreave', title: 'the Tide Queen of Scuttlehold', kind: 'monster', art: 'ship-captain', monsterId: 'mage', shared: true,
      wants: 'Freedom for the Saltreach Isles: no king, no tax, no navy, ever again. And the sea itself to obey her.', knows: 'Every current and reef in the isles, and that the Chancellor has offered her a duchy for the shard.',
      voice: 'Low and amused, with a sailor\'s swearing. Laughs at danger. Gets very quiet when she is truly angry.', appearance: 'A tall woman with salt-white braids and sea-green eyes, in a captain\'s coat over mail, the green shard set in the hilt of her cutlass.',
      backstory: 'The crown\'s navy hanged her father for smuggling. She has fought the crown ever since, and the isles love her for it.',
      gmNotes: 'Mage stat block (the shard\'s storm magic). The Tide Shard lets her command the sea within a mile: raise waves, call sharks, bind a water elemental. She can be bargained with: a promise of the isles\' freedom in writing, sealed by the Regent, is worth more to her than the shard.',
    },
    {
      id: 'pf_shcgrummox', name: 'Grummox', title: 'the Rightful, King of the Highfells', kind: 'monster', art: 'ogre', monsterId: 'oni',
      wants: 'To be crowned in the capital as the true heir of the High King, and for everyone to finally kneel.', knows: 'Nothing true about his ancestry. But since the Granite Shard fell into his stewpot, he is clever, and he knows it.',
      voice: 'Slow, booming, with long words he has only just learned and loves using ("Inde-fatigably!"). Refers to himself as "We, the Rightful".', appearance: 'A huge ogre in a patchwork royal cloak sewn from tapestries, a stone shard glowing in a crown of beaten cooking pots.',
      gmNotes: 'Oni stat block: the Granite Shard gives him the oni\'s magic (flight, invisibility, regeneration, a giant\'s cunning). Underneath he is lonely and wants respect more than a crown. A hero who kneels and gives him a real title (and a Regent\'s writ to go with it) can win him over.',
    },
  ],
  handouts: [
    {
      id: 'regents-warrant', title: 'The Regent\'s warrant',
      text: 'By the hand of Isveth Moorcroft, Lady Regent of the Seven Provinces, in the name of the late High King Edwin.\n\nThe bearers of this warrant are named SHARDWARDENS of the realm. All lords, reeves, captains and honest folk are bidden to aid them in the recovery of the six pieces of the Concord Crown.\n\nThey speak with my voice. Hinder them and you hinder me.\n\nSealed at Westmarch Tower. Midsummer is eight weeks off. Hurry.',
    },
    {
      id: 'chancellor-letter', title: 'A letter in the guild vault',
      text: 'Master Pellingham,\n\nThe Lord Protector thanks you for your loyal care of the amber piece. He offers five thousand crowns for it, and the Guild\'s charter in perpetuity. My colleague in grey will collect it on the first of the month.\n\nShould anyone else ask for it, especially anyone carrying the Regent\'s seal, you will of course strike them the most binding bargain you can.\n\nThe jester in motley is to be held, not harmed. The Lord Protector would like a word with him.\n\n- C.D., by his own hand',
    },
    {
      id: 'hildegrun-prayer', title: 'The last page of the Wrenhollow chronicle',
      text: 'In the second year of the plague, on the night the stars fell, a white stone came through the infirmary roof.\n\nThe Mother Abbess took it up, and it was cold as snow, and she wept and prayed:\n\n"Lord of the Last Door, I have buried eleven sons this month. Take no more of mine. Let none of mine be taken. I will keep them, I will keep them all."\n\nAnd the stone shone, and was glad.\n\n(Below, in a shaking hand:) We were not taken. God help us. We were not taken.',
    },
    {
      id: 'golem-orders', title: 'Haldis\'s notes, scrawled on a forge-slate',
      text: 'GALLOWMAUL - war-golem of the Second Clan War. Eighteen feet. Granite and iron.\nWakes to the heart-stone. Obeys the heart-stone. Nothing else.\n\nI set the Iron Shard in its chest at midnight. It woke. It knew me. It said: "WAR IS COMING. I WILL PREPARE."\n\nIt is not obeying me.\n\nShutdown word: carved inside the chest plate, under the stone. Someone has to be close enough to read it. God of the anvil, someone has to be close enough.',
    },
    {
      id: 'letter-of-marque', title: 'An offer to the Tide Queen',
      text: 'To Morwenna Saltreave, called the Tide Queen.\n\nThe Lord Protector offers you the Duchy of the Saltreach Isles, with no tax for twenty years and a seat at the Concord table, in exchange for the green stone you hold.\n\nShould you refuse, the royal fleet will be rebuilt by autumn, and the Lord Protector remembers what the old navy did to your father. He would hate to do the same.\n\nWith every warm regard,\nC. Dunmallow, Lord Protector',
    },
    {
      id: 'coronation-proclamation', title: 'Proclamation nailed to every door in Crownhallow',
      text: 'HEAR YE!\n\nOn Midsummer\'s Eve, when the Seven Lamps are lit, the Assembly of the Seven Provinces will gather in the Cathedral of the Concord to acclaim a new High King.\n\nThe Lord Protector, Corwin Dunmallow, will offer himself, humbly, for the people\'s love.\n\nThe traitors of Westmarch and their hired "Shardwardens" are outlaws. A reward of 1,000 crowns is offered for each, alive.\n\nLong live the Concord!',
    },
  ],
  chapters: [
    {
      id: 'lockhaven', title: 'Part 1: The Amber Shard', level: 5,
      summary: 'A river town on the Amber, where a shard of the crown has turned a fair guildmaster into a tyrant whose every bargain binds like iron. Tolls, debtors in cages, a jester in hiding, and the first move in the race against the Silver Hand.',
      goal: 'Take the Amber Shard from Guildmaster Garrick Pellingham, free Lockhaven, and find the jester who saw the king die.',
      map: lockhaven,
      npcs: [
        { npc: 'pf_shcreyna', x: 4, y: 9 },
        { npc: 'pf_shctobble', x: 15, y: 43, hidden: true },
        { npc: 'pf_shcgarrick', x: 46, y: 32 },
      ],
      scenes: [
        {
          room: 'North Road', title: 'The road to Lockhaven', handout: 'regents-warrant',
          read: 'The Regent\'s tower falls behind you, and the river road runs east through orchards toward a palisade of sharpened logs. Barges sit motionless on the water. Over the town gate, someone has nailed a new sign: "TOLL".',
          gm: 'Start with a short scene at the Regent\'s bedside if you like (see the hooks): she gives the warrant and names the first shard\'s place, Lockhaven, where "a merchant bought a lump of glowing amber from the sky". Then the arrival. The heroes can see the Toll Gate, and a DC 12 Perception spots the goat gap east and the postern west.',
        },
        {
          room: 'Toll Gate', title: 'Everything has a price', encounter: 'Toll at the gate',
          read: 'Six men in amber sashes lounge across the road. Their sergeant counts you twice, licking his thumb. "Twelve gold each for the river\'s upkeep, five for each blade, and ten for anyone the Guildmaster might want to meet. Which is you, I think."',
          gm: 'Sergeant Brem is a bully who wants coin, not a fight. Pay, bluff, threaten (DC 15 Intimidation) or show the warrant (he lets them in and sends a runner: Garrick knows they are here). A fight here is a low-difficulty brawl, and half the town watches from windows: the heroes are famous by nightfall, for better or worse.',
        },
        {
          room: 'The Drowsy Heron', title: 'Gossip and a grey cloak',
          read: 'A stuffed heron glares down from over the bar. The landlady pours without being asked. "You\'re not from here, and you\'re not wearing amber," she says. "So either you\'re very brave or very new."',
          gm: 'Maggin Abberly tells them about Garrick\'s change, the binding bargains, the debtors and the jester in Mudside (see the area notes). Then a serving girl says a lady in the back room would like a word.',
        },
        {
          room: 'Heron back room', title: 'The Silver Hand\'s offer',
          read: 'A woman in a grey travelling cloak sits with her boots on the table, eating an apple. A silver brooch shaped like a hand holds her cloak closed. "Ah. My rivals. Sit, sit. I\'m Reyna. Let\'s save each other a lot of trouble."',
          gm: 'Reyna Sorrowind, the Chancellor\'s agent. She is honest about who she serves and believes the Regent\'s people killed the king. Her offer: the heroes get the shard for her, she pays 1,000 gp and a pardon. Or they race. She also wants the jester ("the Lord Protector only wants to talk to him"). She will not fight here. If the heroes tell her what Tobble saw, she laughs it off, but a DC 16 Insight catches a flicker of doubt. Plant it; it pays off in part 5.',
        },
        {
          room: 'Pillory Green', title: 'The debtors\' cages', encounter: 'Pillory Green',
          read: 'In the rain, people stand in iron cages with boards around their necks: DEBTOR. A cheerful captain in an amber coat strolls between them, eating an apple. "Don\'t feed the debtors," he calls. "It only encourages them."',
          gm: 'Captain Corlan Varlow and six thugs. The debtors are bound by the shard to stay; the cages are just for show. Freeing them still matters to the town: it is the spark. Noll the lockwright, freed, knows the vault\'s real lock. Sister Ambrel asks for this.',
          treasure: 'Corlan\'s purse (35 gp) and the cage keys.',
        },
        {
          room: 'Boat-house', title: 'The jester under the boat',
          read: 'Under an upturned boat, a pair of red-and-yellow shoes twitch. A voice whispers, "There\'s no one here, there\'s no one here, just a heap of nets and a very damp bear."',
          gm: 'Tobble Quillfeather saw Corwin Dunmallow kill the king (see his profile). He tells it in rhyme at first, then plainly when he trusts them: "The Chancellor stood behind the pillar. Silver light. The king fell. The crown cracked like ice." He has no proof but his word. In the evening, guild thugs come searching: if the heroes are here, a short fight or a chase across the Mudside plank-walks.',
        },
        {
          room: "Wharf-reeve's house", title: 'The reeve who promised', optional: true,
          gm: 'Reeve Allard Thursby is bound by his promise not to oppose Garrick. He cannot help openly, but he can give the heroes the Guildhall plan "by accident" (leaving it on the table and turning away). If the shard is taken, he leads the town in clearing out the guild.',
          treasure: 'The Guildhall plan (shows the vault, the secret panel and the water-gate).',
        },
        {
          room: 'Bonded warehouse', title: 'Rat-catchers', optional: true, encounter: 'Rats in the bonded warehouse',
          gm: 'The guild\'s wererat spies nest among the smuggled wine. Beaten, they give up the midnight boat and the password "full measure". The black boat in the Rat-docks next door is the quiet way to the vault.',
          treasure: '60 gp of smuggled silver, a crate of fine wine (50 gp), a potion of healing.',
        },
        {
          room: 'Old mill', title: 'Old Snapjaw', optional: true, encounter: 'Old Snapjaw',
          gm: 'The guild drowns people who will not bargain in the millpond. Snapjaw the giant crocodile lives there. The missing miller\'s skeleton wears his signet ring: returning it to his widow in Mudside turns the poor quarter fully to the heroes\' side.',
          treasure: 'The miller\'s purse (40 gp) and signet ring.',
        },
        {
          room: 'South drawbridge', title: 'Onto Guild Island', encounter: 'South drawbridge',
          read: 'Lamps glitter on the water. Across the Guild Pool the Guildhall glows amber in every window, and a bell on its little tower waits to ring.',
          gm: 'Many ways on: the Guild Bridge (bluff or fight), the south drawbridge (fight, or draw the guards off with a fire at the warehouses), the black boat to the water-gate (needs the password), a tanner\'s boat to the ferry steps, or a swim. If the town is roused (debtors freed, warehouses opened, Reeve released, bargemen stirred), a crowd marches on the island and the guards are busy holding it back.',
        },
        {
          room: 'Counting Floor', title: 'The Counting Floor', encounter: 'The Counting Floor',
          read: 'Clerks look up from their ledgers, see your weapons and dive under their desks. Between the rows of desks, Garrick\'s collectors draw blades. "The Guildmaster will see you," one says. "When we\'re done with you."',
          gm: 'Garrick\'s best. If the watchtower bell rang, everyone on the island is here. The ledgers here list every debtor and every stolen barge-load: proof that can be read out to the town.',
          treasure: 'The guild ledgers (proof), 90 gp in the clerks\' drawers.',
        },
        {
          room: "Guildmaster's chamber", title: 'The Guildmaster\'s judgment', encounter: "The Guildmaster's judgment",
          read: 'The big man behind the desk stands up slowly. The shard on his chest burns like a coal. "Fair\'s fair," he says, holding out a hand the size of a shovel. "Five hundred gold, and you leave my town forever. Shake on it, friend. Go on. Shake."',
          gm: 'Garrick offers bargains: money to leave, the jester in exchange for safe passage, a duel for the shard. Anyone who shakes is bound (DC 16 Wisdom save). A duel he means honestly: he keeps his word, even under the shard. If it comes to blows, he fights with two veterans and five thugs. When the shard leaves his chest, he sits down and weeps. The Amber Shard: gift, advantage on Persuasion checks to strike a bargain; twist, the carrier cannot bring themselves to break any promise, however small.',
          treasure: 'The Amber Shard. Garrick\'s gold chain (150 gp).',
        },
        {
          room: 'Guild vault', title: 'What the guild took', handout: 'chancellor-letter',
          gm: 'The town\'s money, in boxes with family names. Returning it makes Lockhaven send its banner to the coronation (and its bargemen will open the Crownhallow canal for the heroes in part 6). The Chancellor\'s letter proves Corwin bought shards and wanted the jester "held".',
          treasure: '1,400 gp belonging to the town (and the town expects it back), 300 gp of the guild\'s own, a +1 longsword in a prize-fighter\'s case (Garrick\'s old trophy, he gives it gladly), a ring of protection, two potions of healing.',
        },
      ],
      wrapUp: 'With the shard gone from his chest, Garrick weeps and remembers, and offers to repay every copper. The town gathers on the quays to cheer, or just to stare. Reyna Sorrowind is already gone, leaving a polite note: "One to you. Five to go. The next is in the Greywold. - R." If the town\'s money went home, the bargemen of Lockhaven pledge their banner to the Regent. The heroes reach level 6.',
    },
    {
      id: 'wrenhollow', title: 'Part 2: The Pale Shard', level: 6,
      summary: 'A forest abbey where the abbess prayed during a plague that none of her monks be taken. The Pale Shard granted it. Now the dead keep the hours, light the road candles and kneel in the nave, and they do not want to be saved.',
      goal: 'Take the Pale Shard from the abbey\'s high altar, and if you can, let the dead of Wrenhollow rest.',
      map: wrenhollow,
      npcs: [
        { npc: 'pf_shctobble', x: 41, y: 77 },
        { npc: 'pf_shchildegrun', x: 41, y: 14 },
      ],
      scenes: [
        {
          room: "Pilgrims' Road", title: 'The candles on the road',
          read: 'Grey trees, grey moss, grey light. Every little shrine along the road holds a lit candle. Far ahead, a hooded figure trims a wick, turns its face toward you, and is not there any more.',
          gm: 'The heroes come to the Greywold with Tobble, who hates every step ("Forests are for wolves, and abbeys are for monks, and haunted abbeys are for nobody"). Let the dread build. No fights on the road unless the heroes attack the candle-lighter.',
        },
        {
          room: "Pilgrims' hostel", title: 'A Silver Hand, too slow', optional: true,
          gm: 'A dead agent of Reyna\'s lies in the burned hostel, killed by ghouls a week ago. Her sketch-map shows where the shard is. Reyna is not here: she lost one agent and is waiting to see if the heroes do better.',
          treasure: '25 gp, a silver hand brooch (the Silver Hand\'s token; useful for bluffing in part 3), a potion of healing.',
        },
        {
          room: 'Lychgate', title: 'The bell rings once',
          read: 'You step under the carved gate, and the bell above you rings once, softly, though no one touched it. Across the graveyard, in every window of the abbey, a pale face turns toward you.',
          gm: 'The dead now know the heroes are here. They keep their hours unless provoked. Run the abbey as a living place with a schedule: Vespers in the nave at dusk, supper in the refectory, sleep in the dormitory, chapter in the morning. The heroes can walk among the dead if they are quiet and respectful.',
        },
        {
          room: 'Graveyard', title: 'Open graves', encounter: 'The restless graves',
          gm: 'Not every grave held a monk. The village plague-dead were buried here too, and they did not come back right. Walking between the graves wakes them. Stay on the path and they only watch.',
        },
        {
          room: "Hermit's cell", title: 'The brother who lived', optional: true,
          read: 'An old man in a patched habit sits outside a moss-roofed hut on the far bank, carving a little wooden wren. He does not look up. "You\'ve come for the Mother\'s stone," he says. "Will you kill them, or let them go? There is a difference."',
          gm: 'Brother Hennick knows the abbey\'s hours, the postern key, the Barrow door and where Hildegrun\'s body lies. He wants his brothers freed, not hacked apart. He will come to the chancel for the end if asked: his presence gives advantage on the Persuasion to let Hildegrun let go.',
        },
        {
          room: 'Scriptorium', title: 'The chronicle', encounter: 'Shadows in the scriptorium', handout: 'hildegrun-prayer',
          gm: 'Brother Lammert (a ghost) still copies the chronicle. Talk, do not touch the books, and he shows the last page: Hildegrun\'s prayer. Take a book and the copyists attack. The page counts as "her own words".',
          treasure: 'A spell scroll of Remove Curse tucked in the chronicle, a wand of magic missiles in the master copyist\'s desk.',
        },
        {
          room: 'Refectory', title: 'Supper in silence', optional: true, encounter: 'The silent refectory',
          gm: 'A test of nerve: sit, keep silent, be served a bowl of nothing, and the dead accept the heroes as guests for the night (advantage on Stealth anywhere in the abbey until dawn). Speak, and the hungry dead remember they are hungry.',
        },
        {
          room: 'Infirmary', title: 'Where the star fell', encounter: 'The infirmary',
          gm: 'The scorch mark and the white splinter (see the area notes). The infirmarers still tend plague-dead in the beds and attack anyone who comes too close to their patients.',
          treasure: 'Infirmary stores: three potions of healing, a periapt of wound closure on the infirmarer\'s neck.',
        },
        {
          room: 'Chapter house', title: 'The chapter of faults', encounter: 'Chapter of the dead',
          read: 'Robed figures sit round the eight-sided room. One stands and reads from a blank page: "Brother Ebbet confesses he was afraid to die." The others murmur. Then every hood turns to you.',
          gm: 'The wights know what they are and like it. They want the abbey to stay as it is. A confession that names their death can lay one to rest (DC 15 Persuasion). Otherwise they fight to keep the shard where it is.',
        },
        {
          room: 'Hall of Brothers', title: 'Down the Dead Walk', encounter: 'The Hall of Brothers',
          gm: 'Through the dormitory\'s secret door, or the Barrow door from the forest. The founder\'s-era mummies guard the way to the Founder\'s tomb. Naming them from the skulls on the Dead Walk lays them down one by one.',
          treasure: 'Grave goods on the shelves: 220 gp in old silver, a silver censer (75 gp), a cloak of protection on the founder\'s first abbot.',
        },
        {
          room: "Founder's tomb", title: 'The Mother\'s body',
          read: 'On the founder\'s coffin lies a woman in grey, hands folded on her breast around nothing. Her face is peaceful. Someone has put fresh wildflowers in her hands every day.',
          gm: 'Read her prayer over her and add "now, Mother, let them go" (see the area notes). This is the key to the gentle ending. It costs the heroes nothing but the walk; let them find it if they explore.',
          treasure: 'Behind the coffin, the founder\'s gift: a mace of disruption.',
        },
        {
          room: 'Chancel', title: 'Vespers for the dead', encounter: 'Vespers for the dead',
          read: 'Forty dead monks kneel in the nave, singing without breath. Beyond the screen, the abbess turns from the altar, and the white shard blazes in its crystal box. "Children," she says. "You have come to take my mercy away."',
          gm: 'The climax. If her body was blessed, she hesitates and can be talked into letting go (see her profile): the shard dims, the monks lie down one by one where they knelt, and she smiles and is gone. Otherwise she fights with her two senior wights, the ghost of the cantor and four ghouls, while the kneeling dead in the nave watch and do not join in. Ringing the great bell helps (see the Bell tower). The Pale Shard: gift, once per day when the carrier would drop to 0 hit points, they drop to 1 instead; twist, the carrier cannot bear to let any creature die, and will spare even foes trying to kill them.',
          treasure: 'The Pale Shard. The abbey\'s plate: a gold chalice and paten (250 gp), the reliquary (100 gp).',
        },
      ],
      wrapUp: 'If the dead were let go, Wrenhollow falls silent at last, and Brother Hennick rings the bell for the first true funeral in two years. He gives the heroes his blessing and the abbey\'s banner (in part 6 he leads the Greywold\'s priests into the cathedral to bless the heroes, and the Pale Shard, used in a night\'s vigil, can cure the Regent\'s poison). If they were cut down, the abbey is quiet but nobody comes to thank them. Either way, a letter is waiting at the next inn, sealed in silver: Corwin Dunmallow, inviting the heroes to dine with him and "talk about all this like reasonable people". The heroes reach level 7.',
    },
    {
      id: "brassholm", title: "Part 3: The Iron Shard", level: 7,
      summary: "A dwarven foundry city inside a mountain, split by a river of lava. To defend her city from the coming war, Forgemaster Haldis set the Iron Shard into an ancient war golem. Gallowmaul woke, took the Heart Forge, and is casting an iron army one soldier a day.",
      goal: "Reach the Heart Forge, shut down the war golem Gallowmaul (or break it), and take the Iron Shard before the Silver Hand does.",
      map: brassholm,
      npcs: [
        { npc: "pf_shctobble", x: 3, y: 40 },
        { npc: "pf_shchaldis", x: 8, y: 7 },
        { npc: "pf_shcreyna", x: 75, y: 38 },
      ],
      scenes: [
        {
          room: "Mountain gate",
          title: "The hammer in the mountain",
          read: "The road climbs to a pair of bronze doors carved with kneeling giants, standing open. From deep inside the mountain comes a sound like a heartbeat: BOOM. A minute passes. BOOM. The air that breathes out of the gate is hot as an oven.",
          gm: "The heroes come with Tobble, who hums nervously in time with the boom. Brassholm is the heart of the Ironholds. Nobody greets them: the dwarves have pulled back to their clanhold. The map shows three crossings of the Lava Run (the Kingsbridge, the Chainbridge, the rail trestle) and one secret one (the Cold Way). Let the heroes hear the boom every minute of real play if you like.",
        },
        {
          room: "Gate Hall",
          title: "The ceremonial guard",
          encounter: "Gate wardens",
          read: "Suits of ancient dwarven armour line the hall, each with a sword in its gauntlets. As you step in, every helm turns, and swords lift off the walls and hang in the air, quivering.",
          gm: "Gallowmaul woke the hall's armour to keep the gate. A clan sigil, a DC 15 Deception in Dwarvish, or the Silver Hand brooch from part 2 (they were told to let the Chancellor's agents pass, a clue in itself) makes them stand down. A DC 16 Perception spots the hairline seam of the Ironwarden's vault in the north wall.",
        },
        {
          room: "Clanhold hearth",
          title: "The Forgemaster's confession",
          handout: "golem-orders",
          read: "Hundreds of dwarves crowd round a great hearth, children asleep on their parents' shields. A red-haired dwarf woman with a bandaged hand pushes through the crowd, looks at your weapons, and says, \"Good. Big ones. You'll do. It's my fault, and I need help putting it right.\"",
          gm: "Haldis tells all (see her profile) and gives the heroes her forge-slate. She wants to come with them; she is a capable veteran, and with her present the golem can be argued with. The Chancellor's move: old Thane Brunvald has written to Corwin offering Brassholm's loyalty for help, and the \"help\" is already here (Reyna, in the workshop). Talking the Thane round (DC 15 Persuasion, or simply ending the golem) means Brassholm's banner goes to the Regent instead.",
        },
        {
          room: "Temple of the Anvil",
          title: "The first Thane's hammer",
          optional: true,
          read: "Candles burn round an anvil the size of a cart. On it lies a warhammer of black iron, its head carved with a single closed eye. An old priest kneels in front of it, praying aloud for someone, anyone, to come.",
          gm: "Mother Gudrun tells the story of the hammer and the word (see the area notes). The oath to lift it is real: a hero who swears falsely cannot lift it, and knows why. Tolly the dwarf boy, if the heroes met him in the bunkrooms, shows them the secret door behind the altar onto the Cold Way.",
          treasure: "The first Thane's hammer (+1 warhammer; double damage against Gallowmaul). Gudrun's blessing: each hero gets one potion of fire resistance.",
        },
        {
          room: "Smelters' Row",
          title: "Metal for the army",
          optional: true,
          encounter: "Smelters' Row",
          read: "A line of fire-skinned dwarves with molten crucibles marches down the street, kicking in doors. One drags out a cooking pot, another a child's tin soldier. A salamander coils over them, hissing orders: \"All metal for the army. ALL.\"",
          gm: "The azers are slaves of the forge, not the golem's willing soldiers (see the area notes). Freed azers tell the heroes the golem's weak point (\"the stone in its chest sings, and when it sings, it does not see\") and walk away from the Heart Forge, so they are not there in the climax.",
          treasure: "A smelter's strongbox the salamander was guarding: 340 gp in dwarven bars.",
        },
        {
          room: "Deep cistern",
          title: "The cistern wheel",
          optional: true,
          encounter: "Deep cistern",
          gm: "Turning the sluice wheel (DC 15 Athletics, an action) floods the Cooling Halls' basins by the Cold Way, which sets up the steam trick against the Heart Forge without anyone needing to go to the Cooling Halls. The earth elemental only fights those who touch the water; the gray oozes go for anyone in armour.",
          treasure: "In the silt (DC 13 Investigation): a dwarven signet, a pouch of 6 garnets (50 gp each).",
        },
        {
          room: "The Old Seam",
          title: "The xorn's bargain",
          optional: true,
          encounter: "The Old Seam",
          read: "Something with three arms and a mouth in the top of its head rises from the floor like a swimmer, licks a rust monster's leavings off the wall, and says in a voice like grinding gravel, \"You smell of silver. Hello.\"",
          gm: "The xorn is reasonable and hungry. Paid 50 gp in coins or gems, it keeps the rust monsters off the heroes and points to the sealed Old Delve. Insulted, it lets the rust monsters at their armour.",
        },
        {
          room: "The Old Delve",
          title: "The lost king's camp",
          optional: true,
          read: "A collapsed tunnel opens on a tiny camp: a tent rotted to rags, a pick, and a dwarf skeleton sitting against a chest, wearing a crown of iron and garnets.",
          gm: "King Durvald the Lost, who sealed himself in rather than surrender to the giants in an older war. His last note: \"No war is worth the city.\" Returning the crown to the Thane turns Brassholm's banner to the heroes on the spot.",
          treasure: "Durvald's iron crown (750 gp, but worth much more as a gift), dwarven plate on his bones, 600 gp in old coin.",
        },
        {
          room: "Kingsbridge",
          title: "Crossing the Lava Run",
          encounter: "Lava bridge",
          read: "A stone bridge arches over a river of fire, its parapet carved with the faces of a hundred kings. Halfway across, the lava below bulges and a creature of living flame climbs onto the bridge, trailing smaller burning things like ducklings.",
          gm: "The open way across, and a fight in heat and smoke. The Cold Way (from the temple) skips it entirely; the Chainbridge and the rail trestle go round. Pushing a foe off the bridge: 10d10 fire damage.",
        },
        {
          room: "Forgemaster's workshop",
          title: "The Silver Hand at the drawing board",
          encounter: "The Silver Hand strikes",
          read: "Golem drawings cover every wall. A woman in grey sits on Haldis's workbench, swinging her legs, copying a plan with a stub of charcoal. \"My rivals!\" says Reyna Sorrowind. \"Good. I need somebody big to climb a golem. Shall we?\"",
          gm: "Reyna's truce (see the area notes). She is honest about it: help each other reach the golem's chest, then flip a coin for the shard. If the heroes agree, she and her two agents fight beside them in the Heart Forge, and she keeps the bargain even if she loses the toss. If they refuse, she wishes them luck and races them. If they attack, it is a moderate fight and she slips away bloodied. If the heroes tell her about Tobble again, she is quieter this time.",
        },
        {
          room: "Golem Gallery",
          title: "The golem's armoury",
          encounter: "Golem Gallery",
          read: "Giant armours from forgotten wars stand in alcoves down a long hall, each with a brass plaque. The largest alcove is empty, its plaque reading GALLOWMAUL. In front of it stands a faceless iron figure with a shield, and it raises the shield toward you.",
          gm: "The shield guardian obeys whoever wears its amulet (on a cushion two alcoves along; DC 14 Investigation). A hero who grabs the amulet mid-fight turns the guardian on the animated armour. A commanded shield guardian is a superb ally for the Heart Forge. This scene also collects the city's hidden treasures, found elsewhere.",
          treasure: "Here: a +1 shield from a war-armour's arm. In the Ironwarden's vault (secret, Gate Hall): 2,200 gp of toll-tithe, a belt of hill giant strength, a bag of holding. Behind the coal in the Ore stores: a flame tongue longsword in an oiled crate.",
        },
        {
          room: "Bellows Hall",
          title: "Starve the forge",
          optional: true,
          encounter: "Bellows Hall",
          gm: "Three levers (DC 13 Athletics, an action each) stop the great bellows. With the bellows stopped, the Heart Forge's lava ring dies down and Gallowmaul fights at half speed. Two fire elementals and five magmins dance in the wind and do not want it to stop.",
        },
        {
          room: "Heart Forge",
          title: "Gallowmaul",
          encounter: "Gallowmaul",
          read: "The forge is a cavern of red light. A ring of lava circles an anvil, and at the anvil stands a figure of granite and iron eighteen feet tall, hammering a breastplate as big as a door. In the middle of its chest, a grey shard glows like a coal. It turns its head. \"WAR IS COMING,\" it says. \"WILL YOU SERVE?\"",
          gm: "The climax (see the area notes). Steam from the Cooling Halls, stopped bellows, the Thane's hammer, the shield guardian and Reyna's help all make it easier. Speaking the shutdown word ends the fight at once: Gallowmaul sets down its hammer, says \"THEN WHO WILL PREPARE?\", and sleeps. A hero who answers \"We will\" earns the dwarves' love forever. The Iron Shard: gift, the carrier's Strength becomes 21 while they carry it; twist, the carrier sees every stranger as an enemy to be ready for, and cannot willingly put down a weapon.",
          treasure: "The Iron Shard. The forge's finished work: two suits of dwarven-made +1 chain mail, a +1 battleaxe, and an adamantine breastplate (adamantine armor).",
        },
      ],
      wrapUp: "Gallowmaul sleeps. The dwarves file back into Brassholm singing, and Haldis forges the heroes a casket of cold iron: shards inside it cannot work their twist on whoever carries the casket. If the Thane was won over, Brassholm sends its banner; if Reyna lost the coin-toss and kept her word, she leaves a note, \"Fair's fair. Three to you. I'll see you by the sea.\" The Chancellor's next move arrives soon after: a herald proclaims the heroes outlaws in every market of the realm, and posters with their faces go up from Brassholm to the coast. The heroes reach level 8.",
    },
    {
      id: "scuttlehold", title: "Part 4: The Tide Shard", level: 8,
      summary: "A pirate fortress on a crag in the Saltreach Isles. The Tide Shard fell into the hands of Morwenna Saltreave, the Tide Queen, and gave her the sea. She has used it to keep the crown's ships away, and to wreck the grain ships her own people need. The isles love her, and are starving.",
      goal: "Win the Tide Shard from the Tide Queen by bargain, by proof, or by storm, and free the isles from the shard's hunger.",
      map: scuttlehold,
      npcs: [
        { npc: "pf_shctobble", x: 10, y: 73 },
        { npc: "pf_shcmorwenna", x: 54, y: 15 },
        { npc: "pf_shcreyna", x: 49, y: 17 },
      ],
      scenes: [
        {
          room: "Smugglers' Cove",
          title: "Landing by night",
          read: "The smugglers' boat grinds onto black sand under a sky full of torn cloud. Across the water, the fortress of Scuttlehold squats on its rock like a crab, every window lit, and far out on the left a lighthouse burns a strange, warm red.",
          gm: "The heroes cross with a hired smuggler crew (the mainland ports are closed to outlaws now). Tobble is seasick and miserable. Note the tide: the sandbar to Stilt Town is open now and closes in 6 hours. The red light is the Wreckers' Light; a DC 13 Survival or anyone who knows the sea knows a true light is white.",
        },
        {
          room: "Smugglers' cave",
          title: "Mother Yarrow",
          optional: true,
          read: "An old woman sits on a barrel in the cave mouth, smoking a clay pipe and gutting a fish. \"Mainlanders,\" she says. \"And outlaws, by the look of you. Sit down. I knew the Queen when she was this high and stole my apples.\"",
          gm: "Yarrow gives the green glass bead (see the area notes) if the heroes are honest about why they came. Shown to Morwenna, the bead gives advantage on one Persuasion check with her.",
        },
        {
          room: "Stilt Town",
          title: "The hungry isles",
          read: "Shacks on stilts lean over the water, joined by rope bridges. Children with thin arms fish from every railing. A woman spits when the Chancellor's name is said, then cries when you ask about the Queen.",
          gm: "The isles' story (see the area notes): the Queen protects them from the crown and is starving them with the shard. Every islander has a cousin on a wrecked ship. If the heroes bought food on the mainland and give it away here, word reaches the fortress by noon.",
        },
        {
          room: "The Bilge Rat",
          title: "A brawl for the crews",
          optional: true,
          encounter: "Brawl at the Bilge Rat",
          gm: "Bastable's brawl (see the area notes). Keep it fists and chairs: anyone who draws steel loses the crowd. Winning without killing earns the crews' respect, and on the day of the storm, half of the Gull's Revenge's crew will not fight the heroes.",
        },
        {
          room: "Net-loft",
          title: "The widows' nets",
          optional: true,
          read: "Women mend nets in silence in a long loft that smells of tar. On the wall hang forty-one knots of black ribbon. An old woman follows your eyes. \"One for each ship,\" she says. \"My Davin was on the eleventh.\"",
          gm: "Elspet will speak at the Queen's court (see the area notes). Her words are worth more than any proof: when she speaks, Morwenna has disadvantage on her save against her own shard's twist for the rest of the day.",
        },
        {
          room: "Wreckers' Light",
          title: "The false light",
          optional: true,
          encounter: "Wreckers' light",
          read: "The lamp at the top of the tower burns red behind a lens of stained glass. On the gallery, women with wings and claws sing a slow song that makes you want to walk toward the sea.",
          gm: "Reach it by the causeway at low tide or by boat. Smash the red lens (the white lamp behind it is the true light) and the next grain ship, the Golden Wheat, comes safe into harbour that night. The whole of Stilt Town sees it. This is the turning point: the isles begin to doubt the shard.",
          treasure: "The wreckers' share: 480 gp, a spyglass (1,000 gp), a cap of water breathing.",
        },
        {
          room: "Golden Abundance",
          title: "The hulk and its crew",
          optional: true,
          encounter: "Sahuagin at the hulk",
          gm: "Thirty sailors in the hold of a wrecked grain ship (see the area notes). The sahuagin attack anyone boarding without the Queen's word. Freed sailors spread the truth through the harbour, and some of them are islanders' sons.",
          treasure: "The ship's purser's chest, still aboard: 300 gp and a potion of greater healing.",
        },
        {
          room: "Shark reef",
          title: "The wreck of the Brave Margit",
          optional: true,
          encounter: "Shark reef",
          gm: "The captain's strongbox (see the area notes). The sharks circle anyone in the water; a hero holding the Tide Shard (if the heroes already have it) can send them away.",
          treasure: "The strongbox: 900 gp in mixed coin, a ring of swimming, the Margit's log, which names the Queen's own cousin as one of the drowned.",
        },
        {
          room: "Sea Gate",
          title: "At the Queen's gate",
          encounter: "The Sea Gate",
          read: "The switchback road ends at a gate of black timber hung with shark jaws. A woman with a staff of driftwood looks you over. \"The Queen hears anyone who comes openly,\" she says. \"Do you?\"",
          gm: "The heroes can walk in to bargain with weapons peace-bonded, which is the easy way. Or come in through the gun battery's postern or up the Smugglers' stair from the sea caves. A fight at the gate is a moderate one on a steep slope, and makes the court a hostile one.",
        },
        {
          room: "Great Hall of Scuttlehold",
          title: "The Tide Queen's court",
          handout: "letter-of-marque",
          read: "Captains, fishwives and children fill the hall. On a throne made from a ship's figurehead sits a tall woman with salt-white braids, a cutlass across her knees, a green light in its hilt. Beside her, eating an apple, stands Reyna Sorrowind. \"Ah,\" says the Tide Queen. \"The Regent's dogs. Come to bid against the Chancellor's?\"",
          gm: "A bidding war. Reyna offers the Duchy (handout; Morwenna hands it to the heroes to read, with a laugh). The heroes must offer better: the Regent's promise of the isles' freedom, in writing, and the end of the wrecking. Elspet's testimony, the saved grain ship, the freed sailors, the Margit's log and Yarrow's bead each give advantage on one check. Persuading her takes three successes at DC 16 before three failures. On a win she gives up the shard, shaking, and Reyna bows and leaves (\"Still none for me, then. Hm.\"). On a loss, or if Reyna's offer wins, Morwenna flees to her flagship to call the storm.",
        },
        {
          room: "Drowned Shrine",
          title: "Where the Queen listens",
          optional: true,
          encounter: "The Drowned Shrine",
          read: "Steps go down into a sea-cave lit by a green glow. The water in the pool stands up in two tall columns, like people listening. Something with claws clicks in the dark.",
          gm: "Breaking the binding circle here (see the area notes) means Morwenna cannot call water elementals in the climax, so the climax fight loses its water elemental. A DC 14 Insight in the shrine: the shrine was never the Queen's; the shard wants the sea, and she is only its voice.",
          treasure: "Offerings in the pool: a trident of fish command, 4 pearls (100 gp each).",
        },
        {
          room: "Gull's Revenge",
          title: "Storm on the Gull's Revenge",
          encounter: "Storm on the Gull's Revenge",
          read: "The sky turns black in a heartbeat. Rain comes sideways. On the deck of her flagship the Tide Queen stands at the wheel with her cutlass raised, and the sea rises behind her in a wall of green water. \"Nobody takes the sea from me!\" she shouts. \"NOBODY!\"",
          gm: "The climax if the bargain failed. Morwenna (mage), her water elemental (none if the shrine was broken), Black Annet and her best crew. The deck pitches: DC 12 Dexterity save at the start of each turn or fall prone. The gun battery's cannon can crack the mast (see the area notes). At half hit points, Morwenna will still bargain: she is fighting the shard as much as the heroes. The Tide Shard: gift, the carrier can breathe water, has a swim speed of 40 feet and can cast Control Water once per day; twist, the carrier cannot bear any rule, order or wall, and must break any they are given.",
          treasure: "The Tide Shard. Morwenna's strongbox in the stern cabin: 1,600 gp, a necklace of adaptation, a cloak of the manta ray, and her father's pardon, signed by High King Edwin a week too late.",
        },
      ],
      wrapUp: "The storm breaks, and the sky over Saltreach goes blue for the first time in months. If Morwenna gave the shard freely or yielded in the end, she weeps for the forty-one ships and swears the isles will send grain to the mainland, and a fleet to the coronation. Reyna is gone by morning, and this time her note is short: \"Last one is in the hills. Ask your jester something for me. Ask him what the light looked like. - R.\" The heroes reach level 9.",
    },
    {
      id: "torgallan", title: "Part 5: The Granite Shard", level: 9,
      summary: "A giant's ruined hill fort in the Highfells, three rings of earth and stone. The Granite Shard fell into the stewpot of Grummox, the fort's ogre cook, and made him clever. Now he is the Rightful King, everyone must kneel, and an army of ogres and giants is about to march on Westmarch.",
      goal: "Stop Grummox's war, free the hill-folk, take or win the Granite Shard, and find out what happened to Reyna Sorrowind.",
      map: torGallan,
      npcs: [
        { npc: "pf_shctobble", x: 41, y: 77 },
        { npc: "pf_shcgrummox", x: 40, y: 28 },
        { npc: "pf_shcreyna", x: 48, y: 19 },
      ],
      scenes: [
        {
          room: "Highfell moor",
          title: "Tribute day",
          encounter: "Wolf-riders on the moor",
          read: "Grey hills roll under a huge sky. Ahead, three green rings of earth crown the highest hill, and a column of hill-folk winds toward them carrying sacks of grain and leading sheep. Ogres on wolves the size of horses ride up and down the line, cracking whips. On the top of the hill, a great hall smokes.",
          gm: "The approach (see the area notes). The wolf-riders challenge anyone not in the tribute line. Bluff, join the line, or fight; a fight out here is quick, but a rider that escapes warns the fort.",
        },
        {
          room: "Shepherd's hut",
          title: "Granny Aisling",
          read: "A tiny turf hut with a goat on the roof. An old woman opens the door with a shepherd's crook in her hand, looks at your weapons and says, \"About time somebody came. Sit. Eat. Then go and get my boys back.\"",
          gm: "Aisling knows the fort and its three ways in, and Grummox's past (see the area notes). She also tells the heroes about the Cairn of Gallan on the hilltop to the north-west: a rubbing of its carving (DC 14 History to understand) is a powerful tool with Grummox.",
        },
        {
          room: "Giant's Gate",
          title: "The front door",
          encounter: "The Giant's Gate",
          gm: "The way in with the tribute line (see the area notes). The giants count heads badly; a DC 12 Deception gets the heroes in as hill-folk with a sheep. Fighting here brings the lower ward running.",
        },
        {
          room: "West Breach",
          title: "The two-headed watch",
          optional: true,
          encounter: "West Breach",
          gm: "The back way (see the area notes). Siding with one of an ettin's heads sets the two arguing. The ogres in the lean-to are asleep if the heroes come at night.",
        },
        {
          room: "Troll den",
          title: "Up the Rift",
          optional: true,
          encounter: "Troll den",
          gm: "The third way (see the area notes). The trolls' bargain is real: promise them Grummox's cook (Master Tamworth, who would rather not) and they let the heroes pass. The heroes can of course just lie to trolls.",
          treasure: "Under the bones: 700 gp in mixed coin, a +1 shield, gauntlets of ogre power.",
        },
        {
          room: "Ogre camp",
          title: "A hundred ogres",
          optional: true,
          read: "Tents of hide and stolen sailcloth, fires, stewpots, and ogres everywhere: wrestling, eating, sleeping in heaps. One of them is reading. Slowly. Out loud. To a sheep.",
          gm: "The host (see the area notes). Not a fight: there are far too many. A shared meal and a DC 15 Persuasion learns that the ogres miss the old Grummox and fear the clever one. If the heroes win Grummox over, these ogres march to the coronation behind him.",
        },
        {
          room: "Giants' longhouse",
          title: "The Chancellor's move",
          optional: true,
          gm: "Big Thudd's story (see the area notes): the grey envoy and the promised bride and duke's chain. The Chancellor sent Grummox to burn Westmarch so the Regent's province would be in ashes before the Assembly met. Telling Grummox he was used (with Thudd as witness) shakes him.",
        },
        {
          room: "Barrow of the Giant Kings",
          title: "The heirs of Gallan",
          optional: true,
          encounter: "The Old Barrow",
          read: "Bones of men and ogres lie in the barrow's mouth. In the dark, something that was once a giant king's servant lifts its wrapped head, and cold eyes open in the walls.",
          gm: "Through the robbers' hole on the south side. The dead can be reasoned with (see the area notes). Past them, a secret door leads into the citadel, bypassing the Ogre Gate entirely.",
          treasure: "Grave goods of the giant kings: a gold torc (750 gp), 1,100 gp in ancient coin, a helm of the old kings (a helm of telepathy), a +2 greataxe.",
        },
        {
          room: "Tribute pens",
          title: "The Silver Hand in a cage",
          read: "Hill-folk kneel in the mud of the pens, unable to rise. In a separate iron cage, a woman in grey sits cross-legged eating a stolen apple. \"Oh, good,\" says Reyna Sorrowind. \"My rivals. You wouldn't have a key, I suppose?\"",
          gm: "Reyna was caught trying to steal the shard. She bargains for her freedom (the Silver Hand never begs). The real turn comes when the heroes bring her satchel from the Giant's Hall: in it is the Chancellor's sealed letter to his captain, ordering Reyna \"quietly retired after the crowning, with honour\". She reads it twice. Then ask Tobble, as she said: \"What did the light look like?\" \"Silver,\" says Tobble. \"Silver, like the Chancellor's spells.\" She is with the heroes from now on, and she is a second witness: she was at the feast, too, and she saw the Chancellor leave the pillar. The kneeling folk rise when Grummox is beaten or won over.",
        },
        {
          room: "Ogre Gate",
          title: "The Rightful King's guard",
          encounter: "The Ogre Gate",
          gm: "The main way into the citadel (see the area notes). Skipped entirely by the barrow's secret door or the Kings' Stair. A royal summons for \"an audience with the Rightful\" gets the heroes through: Grummox loves visitors.",
        },
        {
          room: "Giant's Hall",
          title: "The Court of the Rightful",
          encounter: "Court of the Rightful",
          read: "A hall of giant stones, smoky and hung with stolen tapestries. On a throne of stacked millstones sits an ogre in a crown of beaten cooking pots, a grey stone glowing at its brow. \"KNEEL,\" booms the Rightful King. \"We, the Rightful, will hear you inde-fatigably. But first: you KNEEL.\"",
          gm: "The kneel compulsion (see the area notes). Grummox wants respect more than war. Winning him: show the Gallan rubbing, tell him he was used (Big Thudd), kneel and give him a real title (a hero with the Regent's warrant can promise him a lordship of the Highfells). Three successes at DC 17 Persuasion before three failures, each tool giving advantage on one. On a win, he takes off the pot-crown and asks to swear in the Moot ring. On a loss, he fights, with his chiefs, his guard and his ettin herald (the oni, flying and invisible, regenerating). The Granite Shard: gift, the carrier cannot be knocked prone or moved against their will, and has advantage on saves against being charmed; twist, the carrier demands respect from everyone, and cannot let a slight pass.",
          treasure: "The Granite Shard. Reyna's satchel. The Rightful King's treasury, heaped by the throne: 2,400 gp in tribute, a stolen church's silver (500 gp), a ring of free action, a wand of binding.",
        },
        {
          room: "Moot ring",
          title: "An oath freely given",
          optional: true,
          read: "A ring of nine standing stones, older than the fort. Grummox steps into it and stands there, huge and awkward, holding his pot-crown in his hands like a boy holding his cap.",
          gm: "If Grummox was won over, he swears here (see the area notes), as Gallan did, and the Granite Shard comes out of his crown in his own hand. He gives it to the heroes, and from then on he is Lord Grummox of the Highfells, and very proud of it. The Highfells send their banner, and a hundred ogres, to the coronation.",
        },
      ],
      wrapUp: "Whether the Rightful King knelt or fell, the hill-folk stand up, and the ogre host goes home or marches with the heroes. The heroes have five shards, or most of them. Reyna, turned, tells them the Chancellor's plan for the coronation: the empty setting will pull every shard to it once the rite begins, and Corwin wears the sixth on his hand. Midsummer is days away. The heroes reach level 10.",
    },
    {
      id: "crownhallow", title: "Part 6: The Coronation", level: 10,
      summary: "The capital on Midsummer's Eve. Crownhallow is full of bunting and bells, every soul in it charmed by the Chancellor's Keystone, and the heroes' faces are on posters at every gate. The Assembly of the Seven Provinces meets at dusk, and Corwin Dunmallow will be crowned unless someone stops him in front of everyone.",
      goal: "Get into the city, win the lords, expose the Chancellor before the Assembly, and stop the reforging of the crown on his head.",
      map: crownhallow,
      npcs: [
        { npc: "pf_shctobble", x: 10, y: 63 },
        { npc: "pf_shcisveth", x: 8, y: 64 },
        { npc: "pf_shchaldis", x: 12, y: 64 },
        { npc: "pf_shcreyna", x: 30, y: 50, hidden: true },
        { npc: "pf_shccorwin", x: 40, y: 7 },
      ],
      scenes: [
        {
          room: "Westmarch Road",
          title: "The banners gather",
          handout: "coronation-proclamation",
          read: "The white walls of Crownhallow rise ahead, and seven spires stand over them gold in the evening sun. Behind you, on the road, your allies make camp: the banners you won, one by one, from the river to the hills. A herald on the walls is reading out your names, and the reward on your heads.",
          gm: "Count the banners: Westmarch always, plus each province the heroes healed (the Ambervale for Lockhaven, the Greywold for Wrenhollow, the Ironholds for Brassholm, the Saltreach Isles, the Highfells). Each banner is one concrete help in this part (bargemen open the culvert, priests bless, dwarves force a gate, ships hold the river, ogres lift the portcullis) and one vote in the Assembly. The Crownlands vote for Corwin, whatever happens. Let the players plan how to get in.",
        },
        {
          room: "City gate",
          title: "Shardwardens at the gate",
          encounter: "The city gate",
          gm: "The way in by force or face (see the area notes). Allies at the gate change everything. If the heroes come in through the culvert instead, this fight never happens.",
        },
        {
          room: "Old Culvert",
          title: "The jester's way",
          optional: true,
          encounter: "The Old Culvert",
          read: "Tobble pulls aside a mat of weed under the canal wall and grins. \"When I was a boy,\" he says, \"I hid from my father in here for three days. It smelled better then.\"",
          gm: "The secret way into the cathedral hill (see the area notes). It comes out in the Crypt of Kings, under the cathedral itself, avoiding the Silver Guard entirely.",
        },
        {
          room: "The Cracked Bell",
          title: "The night before",
          read: "The inn is full of quiet, hard-faced people in Westmarch blue. A grey-haired woman sits by the fire with a sword across her knees. She stands, slowly, when you come in, and you see that she can stand now.",
          gm: "The safehouse (see the area notes). If the heroes cured the Regent with the Pale Shard, Isveth is here, alive and furious: she can stand before the Assembly herself. If not, she is in the cellar sickbed, and can only send her blessing. Haldis, Tobble and the allies plan with the heroes. Hesk gives out forged invitations. Use this scene to let the players lay their plan: the evidence, the witnesses, the bells, the lords.",
        },
        {
          room: "Hall of the Seven Provinces",
          title: "The Assembly",
          read: "Seven banners hang over a long table. The lords and ladies of the realm look up from their wine: an old lord in amber, a dwarf in iron, a woman in sea-green, a priest in white, a soldier in blue, a silver-haired fop in silver, and an empty chair under the granite banner.",
          gm: "Lobbying. Each lord whose province the heroes healed is with them already. Each other lord can be won with proof (the Silver Hall's evidence), a witness (Tobble or Reyna, DC 15 Persuasion), or a favour. Lord Vaughn Kessick of the Crownlands cannot be won. The rule of the rite: if four of the seven lords refuse to acclaim Corwin, four lamps stay dark and the crown will not take, whatever shards are set. Keep score: it decides the climax.",
        },
        {
          room: "Silver Hall",
          title: "The Chancellor's house",
          optional: true,
          encounter: "The Silver Hall guard",
          read: "Everything here is white, silver and perfectly tidy. In the study, a chess game waits half-played: the white king has been knocked over, and a silver piece stands where he was.",
          gm: "The evidence (see the area notes): Corwin's journal, written in his own hand, describing the feast (\"I am sorry, Edwin. Someone had to.\"), and the grey powder and antidote in the stillroom, which proves the poisoning of the Regent. With these in hand, the Archprelate will ask her question, and any lord who reads them refuses Corwin.",
          treasure: "In the study: 1,800 gp, a wand of fireballs, a book of the king's own sayings with Corwin's notes in the margins. The antidote, which cures the Regent if the Pale Shard did not.",
        },
        {
          room: "Archprelate's lodge",
          title: "The deaf Archprelate",
          optional: true,
          read: "A tiny woman in white sits by the fire with two cats on her knees. She cups a hand to her ear, laughs, and pushes a slate and chalk toward you. \"Write it down, dear,\" she says, loudly. \"I haven't heard a word in twenty years.\"",
          gm: "Tamsy Marchbank (see the area notes). She is the one person in Crownhallow the Keystone cannot touch. Written proof convinces her; she will ask the Assembly her question at the moment of the crowning. That gives the heroes a turn in front of everyone, with Corwin unable to stop them without showing his hand.",
        },
        {
          room: "Crypt of Kings",
          title: "The king who was murdered",
          optional: true,
          encounter: "Guardians of the kings",
          read: "Rows of stone kings lie with their hands folded on their swords. At the far end, in a new tomb of white marble, a cold light gathers above the carving of an old man with a broken crown on his breast.",
          gm: "Kneel and give names, and the guardians let the heroes pass; otherwise they fight. In the Tomb of King Edwin beyond, the king's ghost tells the crown's last secret and gives his blessing (see the area notes). Edwin can also give the heroes one sentence to say in the cathedral, which only he and Corwin could know: \"Ask him what he said to me, the night he became Chancellor.\" (Corwin said: \"I will never be more than your friend.\")",
        },
        {
          room: "Crown Square",
          title: "The scaffold",
          encounter: "Crown Square riot",
          read: "Ten thousand people fill the square, cheering. On a scaffold before the cathedral doors, six men in Westmarch blue stand with nooses round their necks, and a herald calls them the king's murderers. One of them is looking straight at you.",
          gm: "The scapegoats (see the area notes). Reyna is in the crowd, hidden, and can cut ropes at the heroes' signal. Saving the guardsmen in front of the crowd breaks the city's charm a little: from now on, the crowd outside the cathedral is on nobody's side.",
        },
        {
          room: "Tower of the Lamb",
          title: "The Grey Knife",
          optional: true,
          encounter: "The bell tower",
          gm: "Corwin's second assassin and an invisible stalker watch the nave from the bell gallery (see the area notes). Clearing the tower first stops the crossbow bolt that starts the trouble in the nave, and gives the heroes the gallery: a view of the whole cathedral and a rope down to the crossing.",
        },
        {
          room: "Nave",
          title: "\"Does any here know a reason?\"",
          encounter: "The Silver Guard in the nave",
          read: "The Archprelate lifts the empty crown and her thin old voice fills the cathedral: \"Does any here know a reason this man may not be crowned?\" A thousand faces turn, smiling, to the Chancellor. He smiles back. And then, in the silence, somebody stands up.",
          gm: "The heroes' moment. Tobble testifies (DC 14 Performance to keep his nerve; his rhyme turns plain and terrible). Reyna testifies. The journal is read. Each piece of truth spoken lets every creature in the nave make a new save against the Keystone's charm, and lets each undecided lord change their vote. Corwin answers with warmth and charm, then with the Silver Guard: the guard closes on the heroes in the aisles, but lords whose banners stand with the heroes order their knights to stand between. If the heroes went in with violence instead of truth, the whole Assembly is against them; the guards fight at full strength and the lords hide.",
        },
        {
          room: "Coronation choir",
          title: "The reforging",
          encounter: "The Coronation",
          read: "Corwin Dunmallow walks up the seven steps, unhurried, and lays his hand on the empty crown. One by one the shards on your bodies grow warm, then hot, then tug like hooks. \"I am sorry,\" he says, and he means it. \"But someone has to.\"",
          gm: "The climax (see the area notes). Corwin fights with his archmage spells and the Keystone charm, his shield guardian taking his hurts, his two knights holding the stair. Each round, shard-carriers within 60 feet make the DC 17 Strength save (advantage for shards in Haldis's casket) or a shard flies into the setting. If all six are set and four or more lamps are lit, the crown takes, and Corwin is High King: go to the failure ending. If four lamps are dark, the crown will not take, whatever is set. Taking the Keystone ring from his hand (a grapple, then a DC 17 Strength or Sleight of Hand check) or knocking him to 0 hit points ends the rite: the setting drops the shards like stones. Corwin, beaten, does not beg. He asks only, \"Was I really so wrong?\"",
          treasure: "The Keystone of Concord, the sixth shard. Corwin's staff of power. The coronation regalia (5,000 gp, and it belongs to the realm). Whatever the grateful Assembly gives: the Regent promised lands and titles, and she keeps her promises.",
        },
      ],
      wrapUp: "The rite is broken. The lamps over the crossing burn for the provinces that stood with the heroes, and the crowd outside, free of the charm, does not know whether to cheer or weep, so it does both. What happens to the six shards, and to the crown, is the last choice of the campaign: see the ending.",
    },
  ],
  ending:
    "Success: Corwin Dunmallow is exposed before the Assembly, the Keystone is taken from his hand, and the rite is broken. He is tried by the Assembly, not by magic, and the Regent (or the heroes) decide his fate. Then the realm must choose what to do with the six shards, and the heroes have a strong voice in it. Reforged freely by the Assembly, the crown binds the virtues to the realm again, and the Assembly may crown Isveth, or someone new, or one of the heroes. Left broken, each province keeps its own shard, now quiet, and the realm learns to keep the peace by Justice alone, the virtue that was never set in stone. Either way, Lockhaven, Wrenhollow, Brassholm, the isles and the Highfells remember who healed them. Failure: if the crown takes on Corwin's head, every soul in the realm loves him at once, the heroes too (DC 20 Wisdom save each dawn to remember why they hate him). He is kind to them. He pardons them. He means it. The campaign does not end: it becomes a resistance, led by a deaf Archprelate, a jester, a turned assassin and whoever is still making their saves, to find the one thing the crown cannot bend, the seventh virtue, Justice, which the founders never set in the crown. What next: Reyna Sorrowind wants a quiet life, and is very bad at it. Lord Grummox of the Highfells has asked the heroes to his first feast as a lord, and is learning to cook again. Gallowmaul sleeps under Brassholm, and the war it was preparing for is still out there: the crown's shattering was heard across the sea, by people who have waited thirty years for the Seven Provinces to be weak.",
};

// =====================================================================
// Part 3: Brassholm, the Foundry City (level 7)
// =====================================================================
function brassholm() {
  const b = new MapBuilder('adv-shc-brassholm', 'Brassholm, the Foundry City', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'cave-floor' });

  // the Lava Run splits the city in two
  brush([[47, 0], [46, 10], [48, 20], [47, 30], [46, 40], [48, 50], [49, 60], [48, 70], [47, 76]], 4, (x, y) => b.lava(x, y, 1, 1));

  // west side: the gate, the hall, the market, the clanholds and the temple
  b.room('Mountain gate', 0, 35, 8, 10, {
    mat: 'dirt',
    read: 'The mountain road ends at two bronze doors forty feet tall, carved with hammers and stars. One stands ajar. Warm air breathes out of it, smelling of hot iron, and from deep inside comes a slow, enormous boom, like a heartbeat.',
    gm: 'The front door of Brassholm. Nobody guards it: the dwarves have pulled back to the clanholds. The boom is the Heart Forge, where Gallowmaul hammers. It sounds every minute, day and night.',
  });
  b.start(1, 38, 3, 3);
  b.props_('statue-tall-knight', [[1, 35], [1, 44]]).props_('boulder', [[5, 36], [6, 43]]).prop('cart', 3, 42).light(3, 40, 20, 20, '#cfd8ff');
  b.room('Gate Hall', 8, 32, 14, 16, {
    mat: 'dungeon-slab',
    read: 'A pillared hall where caravans once unloaded. Suits of dwarven plate stand along the walls on iron frames, and every helm has turned to face you.',
    gm: 'Gallowmaul has woken the hall\'s ceremonial armour to guard the gate: six animated armours and six flying swords from the weapon racks. They attack anything that is not a dwarf in clan colours. A dwarf\'s clan sigil (Haldis gives them out) or a DC 15 Deception in Dwarvish ("Clan Deepanvil, on the Forgemaster\'s business") makes them stand down.',
  });
  b.wallRun(8, 35, 10, 'w').door(8, 39, 'w', 'open', 'door-double').door(8, 40, 'w', 'open', 'door-double');
  b.encounter('Gate wardens', [8, 32, 14, 16], [['animatedArmor', 6], ['flyingSword', 6]], 'low');
  b.props_('pillar-square', [[11, 35], [18, 35], [11, 44], [18, 44]]).props_('armor-stand', [[9, 33], [12, 33], [15, 33], [9, 46], [12, 46], [15, 46]]).props_('weapon-rack', [[20, 34], [20, 45]]).prop('crate-stack', 19, 40).prop('mine-cart', 14, 46).props_('brazier-everburning', [[10, 39], [19, 39]]);
  b.light(10, 39, 15, 20).light(19, 39, 15, 20);
  b.room('Ironwarden\'s vault', 9, 28, 6, 4, {
    mat: 'dungeon-slab',
    gm: 'A tithe-vault behind a secret door in the Gate Hall\'s north wall (DC 16 Perception; Haldis knows of it). It holds the toll-tithe of a hundred years: see the treasure in the scene "The golem\'s armoury". A glyph on the inner door (DC 15 Arcana to spot) deals 22 (5d8) thunder damage to whoever opens it without the clan word ("Deepstone").',
  });
  b.wallRun(9, 31, 6, 's').door(11, 31, 's', 'secret');
  b.props_('strongbox', [[10, 29], [13, 29]]).prop('coin-stacks', 12, 30).prop('glyph-trap', 12, 31, 0, { gm: true });

  b.tunnel([[18, 32], [20, 28], [24, 26]], 2, { seed: 301 });
  b.cave('Lantern Market', 30, 21, 10, 8, {
    seed: 302,
    mat: 'stone-cobble',
    read: 'A huge cavern lit by a thousand lanterns hung on chains from the dark. Market stalls stand abandoned, goods still on them. A loaf of bread sits half cut on a counter. Everyone left in a hurry.',
    gm: 'Brassholm\'s market, empty since the golem woke. Looters (four dwarf thugs, cowardly) pick at the stalls and flee from anyone armed. A message chalked on a pillar in Dwarvish: "DEEPANVILS TO THE CLANHOLD. HOLD THE BARRICADE." Ways on: the clanholds (north-west), the temple (north), Smelters\' Row (south) and the Kingsbridge (east) to the foundries.',
  });
  b.props_('market-stall', [[24, 17], [28, 16], [32, 16], [36, 18], [24, 24], [36, 25]]).props_('lantern-cluster', [[27, 20], [33, 22]]).prop('fountain', 30, 21).props_('crate-pile', [[27, 25], [35, 15]]).prop('scales', 29, 25).prop('anvil', 33, 25);
  b.light(27, 20, 20, 20, '#ffb35c').light(33, 22, 20, 20, '#ffb35c').light(30, 15, 15, 20, '#ffb35c');

  b.room('Clanhold hearth', 4, 4, 11, 8, {
    mat: 'stone-flagstone-warm',
    read: 'A long hall round a hearth as big as a cottage. Two hundred dwarves are packed in here, children, grandmothers, smiths with bandaged hands. They fall silent as you come in, and a red-haired dwarf with a burned hand pushes through them.',
    gm: 'The refugees of Brassholm. Haldis Deepanvil confesses at once: she put the Iron Shard into the old war golem to defend the city, and it woke wrong. It took the Heart Forge, woke the old war machines and enslaved the forge\'s azers to cast an army. She knows the shutdown word is carved inside its chest, under the shard (handout). She will come with the heroes. The Thane of Brassholm, old and frightened, has already sent word to the Chancellor offering Brassholm\'s loyalty in exchange for help.',
  });
  b.props_('hearth-grand', [[9, 4]]).props_('feast-hall-table', [[6, 7], [12, 7]]).props_('bench-long', [[6, 9], [12, 9]]).props_('bedroll', [[5, 10], [7, 10], [10, 10], [13, 10]]).prop('heraldic-crest', 4, 5).prop('war-banner', 14, 5);
  b.light(9, 5, 20, 20, '#ff9a4a');
  b.room('Clan bunkrooms', 15, 4, 6, 6, { mat: 'stone-flagstone-warm', gm: 'Packed with sleeping families. A dwarf boy, Tolly, has slipped out three times to "spy on the golem". He knows a way along the Cold Way that the grown-ups have forgotten (see the temple).' });
  b.wallRun(15, 4, 6, 'w').door(15, 6, 'w', 'open');
  b.props_('bunk-bed', [[16, 5], [19, 5], [16, 8], [19, 8]]).prop('crib', 18, 7);
  b.floor(7, 12, 2, 1, 'stone-flagstone-warm');
  b.room('Brewhouse', 4, 13, 8, 6, { mat: 'stone-flagstone-warm', gm: 'Vats of black stout. The brewer gives every hero a mug: drinking it grants advantage on the next saving throw against fire. Dwarves swear by it; nobody knows if it really works.' });
  b.props_('keg-rack', [[5, 14], [5, 17]]).props_('cauldron', [[8, 15], [10, 17]]).prop('barrel-stack', 10, 14);
  b.floor(17, 10, 2, 1, 'stone-flagstone');
  b.room('The barricade', 15, 11, 6, 7, {
    mat: 'stone-flagstone',
    read: 'Mine carts, anvils and beer barrels piled into a wall across the tunnel. Six dwarves with crossbows crouch behind it, and one of them shouts, "Halt! Show us you\'re made of meat!"',
    gm: 'The clan\'s last line. The dwarves are jumpy but grateful. If the golem\'s constructs ever break through, they will make a heroic stand here.',
  });
  b.props_('barricade-wood', [[20, 13], [20, 15]]).props_('mine-cart', [[19, 12], [19, 16]]).prop('weapon-barrel', 16, 14).prop('cheval-de-frise', 18, 14);
  b.tunnel([[20, 14], [23, 16]], 2, { seed: 303 });

  b.room('Temple of the Anvil', 28, 2, 11, 9, {
    mat: 'stone-flagstone',
    read: 'A tall, cold temple. On the altar stands a black anvil, and on the anvil lies a hammer no dwarf has lifted in five hundred years. Candles burn round it. Someone has been praying here very hard.',
    gm: 'The priest of the Anvil, Mother Gudrun, stayed behind to pray. She tells the heroes the old story: Gallowmaul was built for the Second Clan War and put to sleep by the first Thane with "a word and a hammer". The hammer on the anvil is that hammer (+1 warhammer; in a hero\'s hand, it deals double damage to Gallowmaul). Lifting it needs a hero to swear to use it only to end a war, not to start one (any hero who swears truly can lift it). Behind the altar, a secret door (DC 15 Perception; Tolly knows it) opens on the Cold Way.',
  });
  b.floor(32, 11, 2, 3, 'stone-flagstone');
  b.prop('altar', 33, 3).prop('anvil', 33, 4).props_('candle-stand-tall', [[31, 3], [35, 3]]).props_('pew', [[30, 7], [36, 7], [30, 9], [36, 9]]).props_('statue-tall-robed', [[28, 2], [38, 2]]).prop('rune-stone', 37, 5);
  b.light(33, 4, 15, 20, '#ffd28a');
  b.floor(39, 6, 17, 2, 'dungeon-slab').door(38, 6, 'e', 'secret');
  b.area('The Cold Way', [[39, 6, 17, 2]], {
    read: 'A narrow stone channel, open on top, crosses the lava gorge on spindly arches. Icy water once ran here to cool the forges. Now it is dry, and the heat from below makes your eyes stream.',
    gm: 'The forgotten aqueduct, from the temple to the Cooling Halls. The secret way past the Kingsbridge. Crossing it in the heat: DC 12 Constitution save or 1 level of Exhaustion. A slip (DC 12 Acrobatics at the middle) leaves a hero hanging over lava.',
  });

  // the three bridges
  b.floor(40, 20, 16, 3, 'stone-flagstone');
  b.area('Kingsbridge', [[40, 20, 16, 3]], {
    read: 'A broad stone bridge spans the lava gorge, lined with statues of dwarf kings holding up lanterns. Below, the Lava Run glows orange and slow. On the far side, flames are walking.',
    gm: 'The main way to the foundries. Six magmins and a fire elemental, loosed from the forges, patrol it. Water from the Cold Way\'s sluice (in the Cooling Halls) poured onto the bridge makes them flee for 1 minute. Pushing a creature off the bridge into the lava: 10d10 fire damage.',
    label: [47, 21],
  });
  b.encounter('Lava bridge', [40, 18, 18, 7], [['magmin', 6], ['fireElemental', 1]], 'low');
  b.props_('statue-tall-knight', [[41, 20], [41, 22], [54, 20], [54, 22]]).props_('lantern-standing', [[44, 20], [51, 22]]).light(44, 20, 12, 18).light(51, 22, 12, 18);

  b.tunnel([[21, 40], [24, 42]], 2, { seed: 304 });
  b.floor(24, 42, 20, 4, 'stone-cobble');
  b.room('Smelters\' houses', 25, 37, 6, 5, { mat: 'wood-planks-dark', more: [[33, 37, 6, 5], [25, 46, 6, 5], [33, 46, 6, 5]] });
  b.area('Smelters\' Row', [[24, 42, 20, 4]], {
    read: 'A street carved through the rock, lined with little stone houses with brass doors. The doors are all open. Down the street come figures of living flame with beards of fire, carrying crucibles.',
    gm: 'The azers who serve the forge are bound to the Heart Forge, and the golem commands the forge. Four azers and a salamander overseer haul molten iron from house to house, searching for "metal for the army" (pots, hinges, a child\'s toy soldier). The azers hate it. A DC 14 Persuasion in Ignan or Dwarvish, or a promise to free them, makes the azers drop their crucibles and walk away; the salamander fights alone.',
    label: [33, 43],
  });
  b.encounter('Smelters\' Row', [24, 37, 20, 15], [['azer', 4], ['salamander', 1]], 'low');
  b.wallRun(25, 41, 6, 's').wallRun(33, 41, 6, 's').wallRun(25, 46, 6, 'n').wallRun(33, 46, 6, 'n');
  b.door(27, 41, 's', 'open').door(35, 41, 's', 'open').door(27, 46, 'n', 'open').door(35, 46, 'n', 'open');
  b.props_('kitchen-table', [[27, 38], [35, 38], [27, 48], [35, 48]]).props_('bed', [[29, 39], [37, 39], [29, 49], [37, 49]]).props_('stove', [[25, 38], [33, 49]]).props_('cauldron', [[30, 43], [39, 44]]).prop('anvil', 42, 43).props_('lamp-post', [[24, 44], [32, 42], [40, 45]]);
  b.light(24, 44, 12, 18).light(32, 42, 12, 18).light(40, 45, 12, 18);
  b.tunnel([[34, 29], [36, 35], [38, 42]], 2, { seed: 305 });

  b.floor(44, 45, 10, 2, 'wood-planks');
  b.area('Chainbridge', [[44, 45, 10, 2]], {
    read: 'A swaying bridge of iron plates hung on chains, ringing softly in the hot wind that rises from the lava.',
    gm: 'The second crossing. It holds two people at a time without trouble. More than four at once: it tilts (DC 13 Dexterity save or fall prone; a creature already prone slides toward the edge). The chains can be cut (AC 19, 30 hit points) to stop pursuit.',
    label: [48, 46],
  });
  b.props_('chains-hanging', [[44, 45], [53, 46]]);

  b.tunnel([[41, 46], [38, 53], [32, 56]], 2, { seed: 306 });
  b.cave('Deep cistern', 28, 58, 6, 5, {
    seed: 307,
    read: 'A cavern half full of black water, so still it looks like a hole in the world. The water is warm. Something grey slides off a rock and into it without a ripple.',
    gm: 'The city\'s water store. Gallowmaul woke an earth elemental bound into the cistern walls as a guard, and gray oozes live in the warm shallows (they eat metal; dwarves call them "rust-lickers"). The elemental only fights those who touch the water. A sluice wheel here can drain the cistern down the Cold Way, flooding the Cooling Halls\' basins (useful later: see the Heart Forge).',
  });
  b.pool(28, 59, 4, 3, true);
  b.encounter('Deep cistern', [22, 53, 13, 11], [['earthElemental', 1], ['grayOoze', 4]], 'low');
  b.prop('winch', 24, 56).prop('stalagmites', 33, 61).prop('crystal-cluster', 25, 62);

  // the mines, the Old Seam, and the rail out to the trestle
  b.tunnel([[14, 47], [13, 56], [16, 64], [24, 68], [34, 66], [41, 64]], 2, { seed: 308, mat: 'dirt' });
  b.tunnel([[26, 62], [24, 68]], 2, { seed: 309 });
  b.area('Ore rail', [[13, 48, 3, 14], [16, 64, 24, 5]], {
    gm: 'A mine-cart rail from the Gate Hall down to the deep seams and out over the Lava Run on a timber trestle. A cart still works: riding it (DC 12 Dexterity to steer at the junctions) gets the heroes from the Gate Hall to the trestle in 2 rounds, and makes a tremendous noise.',
    label: [14, 52],
  });
  b.props_('mine-rails', [[14, 50], [14, 55], [20, 66], [30, 67], [38, 65]]).props_('mine-cart', [[14, 49], [26, 68]]).props_('mine-support', [[13, 58], [33, 66]]).prop('lantern-hook', 16, 60).light(16, 60, 10, 15);
  b.cave('The Old Seam', 9, 63, 6, 5, {
    seed: 310,
    read: 'An old iron seam, worked out long ago. The walls glitter. Something has been eating the rails: they end in gnawed, rust-red stumps.',
    gm: 'Three rust monsters nest here, and a xorn has followed them for the scraps of silver in the rock. The xorn talks (Terran): it will leave the heroes alone for a gift of 50 gp in coins or gems, and it knows a way to the sealed Old Delve.',
  });
  b.encounter('The Old Seam', [3, 58, 13, 11], [['rustMonster', 3], ['xorn', 1]], 'low');
  b.props_('ore-pile', [[6, 61], [12, 66]]).prop('pickaxes', 8, 65).props_('mine-rails', [[10, 60]]).prop('cave-crystals', 5, 64).prop('debris-wood', 12, 61);
  b.floor(8, 66, 2, 7);
  b.door(8, 70, 'n', 'secret').door(9, 70, 'n', 'secret');
  b.cave('The Old Delve', 9, 75, 6, 3, {
    seed: 311,
    read: 'A tunnel sealed with a carved stone that reads, in Dwarvish, "Here we stopped. Here the deep was greedy." Beyond, a dead dwarf king\'s mining camp, untouched for three hundred years.',
    gm: 'A side area, found by the xorn\'s hint or a DC 17 Perception at the end of the Old Seam. The old king\'s camp holds his treasure (see the scene). The air is bad: after 10 minutes, DC 12 Constitution saves each minute or 1 level of Exhaustion.',
  });
  b.props_('skeleton-seated', [[7, 75]]).prop('chest', 12, 75).prop('pickaxes', 5, 76).prop('tent', 10, 74).prop('gm-treasure', 12, 76, 0, { gm: true });

  b.floor(41, 64, 16, 2, 'wood-planks');
  b.area('Rail trestle', [[41, 64, 16, 2]], {
    read: 'A timber trestle carries the ore rail over the Lava Run. The timbers smoke where the heat touches them. Halfway over, one plank is already burning.',
    gm: 'The third crossing, into the back of the Heart Forge. A fire elemental or an angry azer could set it alight (it collapses after 3 rounds burning). A DC 13 Acrobatics check crosses at a run.',
    label: [48, 64],
  });
  b.props_('mine-rails', [[43, 64], [53, 65]]).prop('burning-wreckage', 49, 65);

  // east side: the Cooling Halls, the Golem Gallery, the Great Foundry and the Heart Forge
  b.room('Cooling Halls', 56, 3, 13, 11, {
    mat: 'dungeon-slab',
    read: 'Stone basins in rows, each big enough to quench a ship\'s anchor. They are dry and cracked. A sluice gate at the end of the Cold Way is shut and rusted.',
    gm: 'Where hot castings were cooled. Opening the sluice (DC 15 Athletics, or turning the wheel at the Deep cistern) fills the basins and sends a river of steam through the foundries: for 1 minute, the magmins and fire elementals in the Great Foundry and Bellows Hall have disadvantage, and the Heart Forge\'s lava ring cools to rock for 10 minutes.',
  });
  b.water(58, 5, 4, 3, false, true).water(64, 5, 3, 3, false, true).water(58, 9, 4, 3, false, true).water(64, 9, 3, 3, false, true);
  b.prop('winch', 56, 6).prop('lever', 56, 8).props_('pillar-square', [[63, 4], [63, 12]]).prop('steam-vent', 62, 8).light(60, 8, 10, 15, '#cfe0ff');
  b.floor(58, 14, 2, 3, 'dungeon-slab');
  b.room('Foundry Gate', 56, 17, 6, 9, { mat: 'dungeon-slab', gm: 'A guard post at the east end of the Kingsbridge. The guards are gone; their crossbows lie where they dropped them. A board lists the day\'s castings, ending three weeks ago with "War golem Gallowmaul: heart-stone set. Glory to the clan." Below it, someone has scratched: "God help us."' });
  b.props_('weapon-rack', [[57, 18], [60, 18]]).prop('notice-board', 61, 21).prop('table-square', 58, 22).prop('stool', 59, 23);
  b.floor(57, 26, 3, 1, 'dungeon-slab');
  b.room('Great Foundry', 54, 27, 17, 17, {
    mat: 'dungeon-slab',
    read: 'A foundry the size of a cathedral, hot as a furnace and loud as a battle. Crucibles swing on chains, pouring white iron into moulds shaped like men. Rows of new iron soldiers stand cooling, faceless, waiting for their hearts.',
    gm: 'Gallowmaul\'s army in the making: a hundred iron soldiers, still empty shells (they cannot move until the golem sets a spark in each, one a day). Every day the heroes wait, three more march. Toppling the cooling rows (DC 15 Athletics, a lever by the north wall) wrecks a week\'s work. Two azers tend the crucibles and will help the heroes if freed. The casting pits are lava (10d10 fire if pushed in).',
  });
  b.lava(58, 33, 3, 3).lava(64, 33, 3, 3);
  b.props_('cauldron', [[59, 30], [65, 30]]).props_('chains-hanging', [[59, 32], [65, 32]]).props_('statue-tall-knight', [[56, 38], [58, 38], [60, 38], [62, 38], [64, 38], [66, 38], [68, 38]]).props_('forge', [[55, 28], [69, 28]]).prop('lever', 54, 33).props_('anvil', [[57, 41], [67, 41]]).prop('mine-rails', 62, 42);
  b.light(59, 34, 20, 20, '#ff7a2a').light(65, 34, 20, 20, '#ff7a2a').light(62, 29, 15, 20, '#ff9a4a');

  b.floor(69, 8, 2, 2, 'stone-flagstone');
  b.room('Golem Gallery', 71, 3, 8, 28, {
    mat: 'stone-flagstone',
    read: 'A long, high gallery lined with alcoves. In each stands a war machine of the clan wars: iron knights, a stone guardian with a lantern for a face, brass hounds with no eyes. Many alcoves are empty. One of them is eighteen feet tall.',
    gm: 'The museum of the clan wars. Gallowmaul\'s alcove is the empty giant one. Its shield guardian, bound to the golem\'s shard, now guards the gallery with six suits of animated armour. The shield guardian\'s amulet lies on a cushion in the next alcove: a hero who puts it on commands the guardian instead (DC 14 Investigation to realise what it is).',
  });
  b.encounter('Golem Gallery', [71, 3, 8, 28], [['shieldGuardian', 1], ['animatedArmor', 6]], 'moderate');
  b.props_('statue-tall-knight', [[71, 5], [78, 5], [71, 10], [78, 10], [71, 20], [78, 20], [71, 25]]).prop('wall-alcove-arch', 78, 15).prop('plinth-display', 78, 25).prop('crown-cushion', 77, 25).props_('banner-hanging-tall', [[74, 3], [75, 3]]).props_('torch-sconce', [[72, 12], [77, 18], [72, 28]]);
  b.light(72, 12, 12, 15).light(77, 18, 12, 15).light(72, 28, 12, 15);
  b.wallRun(71, 27, 4, 'w').door(71, 28, 'w', 'closed', 'door-iron');
  b.floor(75, 31, 2, 2, 'stone-flagstone');
  b.floor(71, 37, 1, 2, 'stone-flagstone');
  b.room('Forgemaster\'s workshop', 72, 33, 7, 10, {
    mat: 'wood-planks-dark',
    read: 'Benches crowded with half-built clockwork, drawings pinned on every wall, and a cold cup of tea. In the middle of it all, someone in a grey cloak is reading the drawings by a hooded lantern.',
    gm: 'Haldis\'s workshop, with all her golem drawings. Reyna Sorrowind is here first, with two Silver Hand agents (spies), copying the golem\'s plans. She knows the shutdown word is in the golem\'s chest. She proposes a truce: "Help me reach its chest, and we flip a coin for the shard." She keeps that bargain. If the heroes attack, she fights, and slips away at half hit points.',
  });
  b.door(72, 37, 'w', 'closed');
  b.encounter('The Silver Hand strikes', [72, 33, 7, 10], [['assassin', 1], ['spy', 2]], 'moderate');
  b.props_('workbench', [[73, 34], [77, 34]]).props_('table-maps', [[75, 37]]).prop('tool-wall', 78, 39).prop('bookshelf', 73, 41).prop('alchemy-table', 77, 41).prop('lantern-standing', 75, 38).light(75, 38, 8, 12);

  b.room('Chain landing', 53, 44, 10, 4, { mat: 'dungeon-slab', gm: 'Where the Chainbridge lands. Doors north into the Great Foundry and south into Bellows Hall.' });
  b.wallRun(54, 44, 9, 'n').door(58, 44, 'n', 'open', 'door-double').door(59, 44, 'n', 'open', 'door-double');
  b.prop('mine-cart', 56, 46).prop('crate', 61, 45);
  b.floor(58, 48, 2, 1, 'dungeon-slab');
  b.room('Bellows Hall', 54, 49, 15, 10, {
    mat: 'dungeon-slab',
    read: 'Bellows as big as houses heave up and down, and with every breath a roar of wind goes down great iron pipes toward the Heart Forge. Shapes of living fire dance in the gusts.',
    gm: 'The lungs of the Heart Forge. Two fire elementals and five magmins dance in the bellows-wind. Stopping the bellows (three levers, DC 13 Athletics each, an action) starves the Heart Forge: the golem loses its lava ring and fights at half speed until they restart.',
  });
  b.encounter('Bellows Hall', [54, 49, 15, 10], [['fireElemental', 2], ['magmin', 5]], 'moderate');
  b.props_('lever', [[55, 50], [61, 50], [67, 50]]).props_('pillar-round', [[57, 54], [65, 54]]).prop('magma-vent', 61, 55).prop('steam-vent', 58, 57).light(61, 54, 20, 20, '#ff7a2a');
  b.floor(69, 52, 2, 2);
  b.cave('Ore stores', 74, 52, 4, 4, { seed: 312, gm: 'Heaps of ore and coal. Behind the coal, a forgotten crate of the clan\'s best: see the treasure in the scene "The golem\'s armoury".' });
  b.props_('ore-pile', [[73, 51], [75, 53]]).prop('crate-stack', 75, 51).prop('gm-treasure', 74, 55, 0, { gm: true });

  b.tunnel([[61, 58], [62, 63]], 3, { seed: 313 });
  b.tunnel([[56, 64], [61, 68]], 2, { seed: 314 });
  b.cave('Heart Forge', 69, 70, 9, 8, {
    seed: 315,
    mat: 'stone-flagstone',
    read: 'A round chamber around a forge like a volcano\'s mouth, ringed by a moat of lava. Over the forge stands a giant of iron and granite, eighteen feet tall, hammering a red-hot blade as long as a boat. In the middle of its chest, a grey shard glows like a furnace eye. It turns its head. "WAR IS COMING," it says. "YOU ARE NOT READY."',
    gm: 'Gallowmaul (stone golem) with two azers bound to the forge. It is not cruel: it believes the war is coming (it is) and that only an army can save Brassholm. It can be argued with (DC 18 Persuasion, advantage with Haldis present) for one round: it pauses to listen, which is time to climb it. To reach the shutdown word: a hero must be on the golem (grapple, DC 16 Athletics or Acrobatics) and spend an action prying open the chest plate (DC 15 Strength), then another reading the word aloud. Or take the shard by force (destroy the golem). Stopping the bellows, cooling the lava ring and the hammer from the temple all help.',
  });
  b.lava(62, 66, 1, 8).lava(76, 66, 1, 8).lava(64, 64, 11, 1).lava(64, 76, 11, 1);
  b.encounter('Gallowmaul', [60, 62, 17, 16], [['stoneGolem', 1], ['azer', 2]], 'high');
  b.prop('forge', 69, 69).prop('anvil', 69, 72).props_('chains-hanging', [[66, 69], [72, 69]]).prop('magic-sword', 71, 72).props_('brazier-pedestal', [[65, 73], [73, 73]]).prop('magma-vent', 69, 67);
  b.light(69, 69, 30, 30, '#ff6a1a');

  scatter(b, 'stalagmites', 0, 50, 45, 30, 8, 316);
  scatter(b, 'rubble-pile', 0, 50, 45, 30, 5, 317);
  return b.build();
}

// =====================================================================
// Part 4: Scuttlehold in the Saltreach Isles (level 8)
// =====================================================================
function scuttlehold() {
  const b = new MapBuilder('adv-shc-scuttlehold', 'Scuttlehold, Fortress of the Tide Queen', 80, 80, { open: true, floor: 'sand', ambient: 'dim', wallStyle: 'stone' });
  b.water(0, 0, 80, 80, true);

  // Scuttle Rock, the Teeth cliffs and the fortress on top
  b.pool(57, 27, 23, 22);
  b.cave(null, 57, 27, 19, 18, { seed: 401, mat: 'dirt', wobble: 0.12 });
  crag(b, 56, 9, 10, 1.5, 402);
  b.rock(71, 18, 9, 40);
  b.paint(39, 20, 7, 13, 'stone-flagstone');
  b.floor(46, 12, 25, 22, 'stone-cobble');
  enclose(b, [[46, 12, 25, 22]]);
  b.door(57, 33, 's', 'closed', 'door-double').door(58, 33, 's', 'closed', 'door-double').door(46, 26, 'w', 'locked', 'door-iron');
  b.area('Sea Gate', [[53, 30, 10, 7]], {
    read: 'The road climbs to a gate of black timbers banded with iron, set in a wall of grey stone streaked with gull droppings. Over the gate, a flag: a white wave on green, and under it, a noose cut in half.',
    gm: 'The fortress gate. Four veterans, two bandit captains (the Queen\'s gate-wardens) and a sea-witch of the isles (mage). They let anyone in who comes to bargain openly, unarmed or with weapons peace-bonded. Come sneaking or shooting, and it is a hard fight on the slope. Reyna Sorrowind\'s Silver Hand token gets a smile and an open gate.',
    label: [57, 34],
  });
  b.encounter('The Sea Gate', [53, 30, 10, 7], [['veteran', 4], ['banditCaptain', 2], ['mage', 1]], 'moderate');
  b.props_('cannon', [[54, 34], [61, 34]]).props_('lantern-standing', [[55, 32], [60, 32]]).light(55, 32, 12, 18).light(60, 32, 12, 18);

  hall(b, 'Great Hall of Scuttlehold', [[47, 13, 15, 8]], 'wood-planks-dark', {
    read: 'A hall built from the timbers of captured warships: ribs of oak for rafters, figureheads for pillars. A throne of driftwood and whalebone stands at the end, and the sound of the sea is everywhere, though the windows are shut.',
    gm: 'Morwenna holds court here at noon: islanders bring disputes, captains bring plunder. The heroes may ask for an audience (see the scene "The Tide Queen\'s court"). Reyna Sorrowind is already here as the Chancellor\'s envoy, with the Duchy offer (handout). The hall\'s fifty pirates are no match for heroes, but a fight here is a fight against all the isles.',
  });
  b.door(54, 20, 's', 'closed', 'door-double').door(55, 20, 's', 'closed', 'door-double').door(61, 16, 'e', 'locked');
  b.prop('throne', 54, 14).props_('statue-tall-winged', [[49, 15], [59, 15], [49, 19], [59, 19]]).props_('table-feast', [[51, 17], [57, 17]]).props_('banner-hanging-tall', [[52, 13], [56, 13]]).prop('chandelier-wheel', 54, 17).prop('treasure-pile', 48, 14);
  b.light(54, 17, 20, 20).light(54, 14, 10, 15);
  hall(b, "Queen's tower", [[62, 13, 8, 8]], 'wood-planks', {
    read: 'Charts cover every wall, pinned with knives. A big brass telescope points out of the window toward the mainland. On the desk, an unfinished letter, and a portrait of a hanged man with Morwenna\'s eyes.',
    gm: 'Morwenna\'s quarters. Her desk holds the Chancellor\'s offer (handout), her half-written refusal ("I\'ve been a duke\'s prisoner, I\'ll not be a duke") and a chart of every ship she has wrecked: forty-one, most of them grain ships. A DC 14 Insight on the chart: she has marked each one with a tiny cross, as if counting sins.',
  });
  b.door(65, 20, 's', 'closed');
  b.prop('writing-desk', 64, 15).prop('telescope', 68, 14).prop('map-cabinet', 63, 18).prop('bed-canopy', 68, 18).prop('globe-stand', 66, 16).prop('footlocker', 66, 19);
  hall(b, 'Barracks', [[47, 23, 6, 10]], 'wood-planks', { gm: 'Hammocks and sea-chests for forty. The pirates are more sailors than soldiers; most of them are islanders who joined because the Queen feeds their families. A DC 13 Persuasion over a game of dice gets the story: the wrecking started when the shard came, and the crews hate it.' });
  b.door(52, 27, 'e', 'closed');
  b.props_('hammock', [[48, 24], [50, 24], [48, 27], [50, 27], [48, 30]]).prop('table-cards', 50, 31).prop('footlocker', 51, 25);
  hall(b, 'Armoury stores', [[63, 23, 8, 10]], 'stone-flagstone', { gm: 'Powder kegs, cutlasses, sailcloth and salt pork. A trapdoor under the powder kegs (DC 15 Perception) and a secret door in the east wall (DC 16) open onto the Smugglers\' stair down to the sea caves. A careless spark here: 6d6 fire in a 20-foot radius, and a hole in the wall.' });
  b.door(63, 27, 'w', 'closed').door(70, 28, 'e', 'secret');
  b.props_('barrel-stack', [[64, 24], [64, 31]]).props_('weapon-rack', [[69, 24], [69, 31]]).prop('sails-pile', 66, 26).prop('crate-stack', 67, 30).prop('trapdoor', 65, 29);
  b.area('Fortress courtyard', [[53, 22, 10, 9]], { read: 'A windy yard where washing snaps on lines between cannon. Children chase a goat. A woman sells fish-pies from a cart.', gm: 'Islanders live in the fortress: this is a town as much as a castle. Fighting here endangers them.' });
  b.prop('well', 57, 26).props_('cannon', [[54, 23], [61, 23]]).prop('merchant-cart', 59, 28).props_('barrel-group', [[53, 30], [62, 30]]).prop('rope-coil', 56, 29);
  b.area('Gun battery', [[39, 20, 7, 13]], {
    read: 'A stone terrace on the cliff-top, lined with old cannons pointing at the sea. Gulls sit on the barrels. A gunner sleeps in the sun with his hat over his face.',
    gm: 'The battery covers the causeway and the western channel. A locked iron postern (DC 16 thieves\' tools) leads into the fortress. The cannons can be turned on the harbour: a cannon shot (+6 to hit, 4d10 bludgeoning, three actions to reload) could crack the flagship\'s mast in the climax.',
  });
  b.props_('cannon', [[40, 21], [40, 25], [40, 29]]).props_('cannon', [[44, 21]], 90).props_('barrel-group', [[44, 31]]).prop('crate', 42, 27).prop('banner-pole', 43, 24);

  // the harbour, the ships and the road up
  brush([[57, 35], [55, 40], [52, 43]], 3, (x, y) => b.paint(x, y, 1, 1, 'stone-cobble'));
  b.props_('stairs-up', [[56, 37], [53, 42]]);
  b.area('Harbour road', [[51, 35, 9, 9]], { gm: 'A switchback stair-road from the docks to the Sea Gate, in full view of the walls. Coming up it unseen needs night, fog, or a disguise (DC 15 Deception).' });
  b.floor(40, 45, 27, 2, 'wood-planks');
  b.floor(44, 47, 2, 11, 'wood-planks').floor(58, 47, 2, 9, 'wood-planks').floor(66, 47, 2, 10, 'wood-planks');
  b.area('Harbour', [[40, 44, 28, 4]], {
    read: 'A busy harbour under the cliffs: three ships at the piers, gulls, nets, and the smell of tar. Men sing as they roll barrels. Nobody is unloading food.',
    gm: 'The isles\' only safe anchorage. The Tide Shard keeps every royal ship away with storms, but it also keeps away the grain ships from the mainland: the isles are going hungry. The dock-boss, a one-eyed woman called Peg, will tell the heroes so if they buy her a drink.',
    label: [52, 45],
  });
  b.props_('mooring-post', [[44, 57], [58, 55], [66, 56]]).props_('cargo-crates', [[41, 45], [62, 45]]).props_('barrel-group', [[48, 45], [64, 46]]).prop('fishing-net', 52, 46).prop('anchor', 60, 45).props_('lamp-post', [[46, 45], [56, 46]]);
  b.light(46, 45, 12, 18).light(56, 46, 12, 18);
  b.floor(46, 50, 11, 7, 'wood-planks-dark').floor(57, 52, 1, 3, 'wood-planks-dark');
  b.area("Gull's Revenge", [[46, 50, 12, 7]], {
    read: 'The Tide Queen\'s flagship: a long black frigate with a figurehead of a screaming gull and a green flag at every mast. Her deck is scrubbed white. Twenty cannons grin from her sides.',
    gm: 'Where the climax happens if Morwenna flees to sea. Her first mate, Black Annet (gladiator), sleeps aboard. The captain\'s cabin at the stern holds her strongbox.',
  });
  b.props_('ship-mast', [[49, 53], [54, 53]]).prop('ship-wheel', 47, 53).prop('crows-nest', 54, 52).props_('cannon', [[50, 50], [52, 50], [50, 56], [52, 56]]).prop('cargo-hatch', 51, 53).prop('sails-pile', 56, 54).prop('strongbox', 46, 51);
  b.encounter("Storm on the Gull's Revenge", [44, 49, 15, 9], [['mage', 1], ['waterElemental', 1], ['gladiator', 1], ['veteran', 2], ['banditCaptain', 1]], 'high');
  b.floor(61, 57, 13, 6, 'wood-planks');
  hall(b, 'Golden Abundance', [[64, 58, 7, 4]], 'wood-planks-dark', {
    read: 'A fat merchant galleon with her masts cut down, chained to the pier. From inside her hull comes the sound of many people trying to be quiet.',
    gm: 'A grain ship the Queen wrecked and dragged in. Her crew of thirty are prisoners in the hold, held for ransom. Sahuagin called by the shard guard the hulk from the water: they come up the sides when anyone boards without the Queen\'s word. Freeing the crew turns the harbour: half the dockhands are related to someone who was on a wrecked ship.',
  });
  b.door(67, 58, 'n', 'locked').door(64, 60, 'w', 'closed');
  b.area('Galleon deck', [[61, 57, 13, 6]], { gm: 'Her deck is bare, masts sawn off. The hatch is barred from outside.', label: [62, 59] });
  b.encounter('Sahuagin at the hulk', [60, 56, 15, 8], [['sahuagin', 10], ['hunterShark', 3]], 'low');
  b.props_('cage', [[65, 59], [69, 59]]).props_('flour-sacks', [[66, 61], [68, 61]]).prop('bedroll', 70, 60).prop('cargo-hatch', 62, 59).prop('ship-mast', 72, 60);
  b.floor(34, 52, 7, 4, 'wood-planks');
  b.area('Sloop', [[34, 52, 7, 4]], { gm: 'A small fast sloop, the Kittiwake, crewed by two old smugglers who would sail anyone anywhere for 50 gp. A good escape boat.' });
  b.prop('ship-mast', 37, 53).prop('rope-coil', 35, 54).prop('rowboat', 39, 57);

  // Stilt Town over the western shallows
  b.water(8, 36, 29, 26);
  b.floor(10, 44, 30, 2, 'wood-planks').floor(24, 34, 2, 25, 'wood-planks').floor(10, 46, 2, 13, 'wood-planks');
  b.area('Stilt Town', [[8, 36, 29, 26]], {
    read: 'A town of shacks on stilts over the shallows, joined by swaying plank-walks. Lanterns, washing, fish drying on lines, and everywhere the smell of rum and low tide.',
    gm: 'Where the isles\' poor live, and where the crews drink. Everybody here loves the Tide Queen and is slowly starving because of her. Gossip is cheap: the Queen has not slept since the shard came, she talks to the sea at night, and a grey-cloaked mainlander arrived three days ago with a letter.',
    label: [20, 50],
  });
  b.building('The Bilge Rat', 14, 39, 10, 8, {
    mat: 'wood-planks-dark',
    read: 'A tavern in the hull of an upside-down ship. A fiddler plays, pirates sing, and a huge woman behind the bar pours rum with one hand and holds a cudgel in the other.',
    gm: 'The drinking hole of the isles. A bosun called Bastable picks a fight with "mainland spies" (a bandit captain, two veterans and eight thugs, all drunk). Win the brawl without killing anyone and the crews cheer the heroes, and Bastable tells them the Queen holds audience at noon and "listens to anyone who doesn\'t bow".',
    doors: [[18, 46, 's', 'open'], [23, 42, 'e', 'closed']],
    windows: [[14, 42, 'w']],
  });
  b.encounter('Brawl at the Bilge Rat', [14, 39, 10, 8], [['banditCaptain', 1], ['veteran', 2], ['thug', 8]], 'low');
  b.prop('bar-counter', 16, 40).prop('keg-rack', 15, 40).props_('table-round', [[18, 42], [21, 43], [17, 44]]).props_('stool', [[19, 42], [20, 44]]).prop('dartboard', 22, 40).prop('lantern-hanging', 19, 43).light(19, 43, 12, 18);
  b.building("Fence's shack", 27, 37, 6, 5, {
    gm: 'Old Rendle the fence buys and sells anything. He sells a potion of water breathing (200 gp) and a map of the sea caves under the fortress (100 gp, or for the true story of a hero\'s worst day). He knows the Drowned Shrine is where the Queen "listens to the sea".',
    doors: [[27, 40, 'w', 'closed']],
  });
  b.prop('shop-counter', 29, 38).prop('display-case', 31, 39).prop('coffer', 31, 40).prop('treasure-map', 30, 40);
  b.building('Net-loft', 26, 50, 8, 6, {
    gm: 'The widows of the wrecked crews mend nets here. They have no love for the shard. A woman called Elspet lost a son on one of the grain ships the Queen wrecked: "He was an islander too. She didn\'t know he was aboard. She doesn\'t look anymore." Elspet will speak at the Queen\'s court if asked.',
    doors: [[26, 52, 'w', 'closed']],
  });
  b.props_('fishing-net', [[28, 51], [31, 53]]).prop('loom', 32, 51).prop('bench-long', 29, 54);
  b.props_('fish-crate', [[11, 45], [30, 45]]).props_('rope-coil', [[24, 36], [10, 52]]).props_('lantern-hook', [[25, 48], [12, 45]]).props_('rowboat', [[13, 50], [20, 56]]);
  b.light(25, 48, 8, 12).light(12, 45, 8, 12);

  // Smugglers' Cove (start) and the sandbar
  b.pool(10, 71, 12, 9);
  b.cave(null, 10, 71, 9, 7, { seed: 403, mat: 'sand' });
  b.rock(0, 66, 5, 14);
  b.cave("Smugglers' cave", 3, 72, 2.5, 3, { seed: 404, mat: 'cave-floor', gm: 'A dry cave above the tide line: the smugglers\' store. Old Mother Yarrow keeps it, and she remembers the Queen as a little girl. She gives the heroes a token (a green glass bead) that Morwenna will recognise: it means "I come from Yarrow, and you should listen".' });
  b.props_('crate-pile', [[2, 71], [3, 74]]).prop('lantern-standing', 3, 72).light(3, 72, 8, 12);
  b.area("Smugglers' Cove", [[5, 65, 14, 13]], {
    read: 'Your boat grinds onto pale sand under the cliffs. Ahead, across the shallows, Stilt Town\'s lanterns twinkle, and beyond it, black against the sunset, Scuttlehold sits on its rock like a crow on a fence post.',
    gm: 'The heroes arrive with a smuggler crew hired on the mainland. Nobody watches the cove. At low tide the sandbar runs to Stilt Town; at high tide it is a swim (DC 12 Athletics). The tide turns every 6 hours.',
    label: [11, 70],
  });
  b.start(9, 72, 3, 3);
  b.props_('rowboat', [[13, 76], [16, 74]]).prop('campfire', 9, 69).props_('tree-palm', [[7, 66], [16, 67], [6, 76]]).prop('fishing-gear', 12, 74).prop('anchor', 15, 77).light(9, 69, 10, 15);
  brush([[12, 64], [16, 61], [24, 58]], 2, (x, y) => b.floor(x, y, 1, 1, 'sand'));
  b.area('Sandbar', [[12, 58, 13, 7]], { gm: 'A ribbon of wet sand at low tide. Crabs scuttle. At high tide it vanishes.', label: [17, 61] });

  // the lighthouse islet and the causeway
  b.pool(12, 12, 11, 10);
  b.cave(null, 12, 12, 8, 7, { seed: 405, mat: 'cave-floor' });
  hall(b, "Wreckers' Light", [[10, 9, 5, 6], [9, 10, 7, 4]], 'stone-flagstone', {
    read: 'A white tower on a rock, its lamp burning green. Ships that see a green light think it marks the safe channel. It does not.',
    gm: 'The Queen\'s false light, which lures grain ships onto the reef. Harpies roost on the gallery and sing to steer ships in; two old wreckers (veterans) and their bully-boy keep the lamp. Putting out the light (or changing it back to white) saves the next ship, and that ship is carrying grain the isles desperately need: a turning point.',
  });
  b.door(12, 14, 's', 'closed');
  b.encounter("Wreckers' light", [4, 5, 17, 14], [['harpy', 4], ['veteran', 3]], 'low');
  b.prop('stair-spiral', 12, 11).prop('brazier-everburning', 11, 10).prop('oil-slick', 13, 12).light(11, 10, 30, 30, '#4cff8a');
  b.building("Keeper's hut", 15, 14, 4, 4, { gm: 'The wreckers\' hut: rum, rope and a ledger of what each wreck yielded.', doors: [[15, 15, 'w', 'closed']] });
  b.prop('bed', 16, 15).prop('table-square', 17, 16);
  b.area('Lighthouse islet', [[4, 5, 17, 14]], { gm: 'A bare rock with a tower on it. Gulls, wind and harpies.', label: [7, 16] });
  brush([[19, 13], [28, 17], [38, 23]], 2, (x, y) => b.floor(x, y, 1, 1, 'stone-cobble'));
  b.water(26, 16, 2, 2).water(33, 19, 2, 2);
  b.area('Causeway', [[19, 13, 20, 12]], { gm: 'A drowned road of stones from the lighthouse to the gun battery. Passable on foot at low tide; at high tide the gaps are 10-foot swims (DC 13 Athletics) and the battery guns cover it.', label: [28, 18] });

  // the sea caves inside the Teeth
  b.floor(71, 28, 2, 9, 'cave-floor');
  b.area("Smugglers' stair", [[71, 28, 2, 9]], { gm: 'Steps cut in the rock, slimy and steep, from the armoury down to the sea caves. The sound of the sea grows louder with every step.' });
  b.props_('stairs-down', [[71, 29], [72, 35]]);
  b.cave('Drowned Shrine', 74, 42, 4, 4, {
    seed: 406,
    read: 'A sea cave where the tide breathes in and out through a hole in the floor. On the walls, old islanders carved waves, ships and a woman with a crown of foam. In the pool, something enormous turns over, and the water stands up.',
    gm: 'The old shrine of the isles\' sea-spirit. Morwenna comes here each night to "listen". The shard\'s power pools here: two water elementals bound by it, and two chuuls that crawled in from the deep. Breaking the binding circle (DC 15 Arcana, or smashing the three tide-stones) frees the elementals, who simply leave. With the shrine broken, Morwenna cannot call water elementals in the climax.',
  });
  b.pool(74, 43, 2.5, 2, true);
  b.encounter('The Drowned Shrine', [69, 38, 9, 9], [['chuul', 2], ['waterElemental', 2]], 'moderate');
  b.props_('rune-stone', [[73, 43], [75, 43], [74, 42]]).prop('idol', 75, 39).light(74, 43, 10, 15, '#7fe0d0');
  b.tunnel([[72, 36], [73, 39]], 2, { seed: 407 });
  b.tunnel([[75, 46], [76, 51], [77, 57]], 2, { seed: 408 });
  b.area('Sea cave mouth', [[75, 48, 4, 10]], { gm: 'Where the sea comes into the caves. A rowboat can slip in at low tide (DC 14 Water Vehicles or Athletics to time the swell).' });

  // the reef and the wreck
  b.pool(70, 71, 9, 7);
  crag(b, 64, 66, 1.5, 1.2, 409);
  crag(b, 77, 64, 1.5, 1.5, 410);
  b.floor(70, 69, 7, 4, 'wood-planks-dark');
  b.area('Shark reef', [[62, 64, 18, 15]], {
    read: 'Black rocks just under the waves, and on them, the broken back of a ship. Fins circle it slowly, as if they are waiting for more.',
    gm: 'Where the false light sends ships. A giant shark and two hunter sharks, called by the shard, patrol the reef. The wreck of the Brave Margit still has her captain\'s strongbox in the stern (DC 14 Athletics to reach it underwater).',
    label: [72, 76],
  });
  b.encounter('Shark reef', [62, 64, 18, 15], [['giantShark', 1], ['hunterShark', 2]], 'low');
  b.props_('debris-wood', [[71, 70], [75, 71]]).prop('ship-mast', 73, 70, 45).prop('strongbox', 76, 72).prop('skeleton-lying', 72, 72);
  scatter(b, 'debris-wood', 60, 62, 20, 18, 4, 411);
  return b.build();
}

// =====================================================================
// Part 5: Tor Gallan, the giant's hill fort in the Highfells (level 9)
// =====================================================================
function torGallan() {
  const b = new MapBuilder('adv-shc-torgallan', 'Tor Gallan', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  const cx = 40, cy = 40;
  const near = (a: number, g: number, w: number) => Math.abs(((a - g + 540) % 360) - 180) < w;
  // the rings of the hill fort: citadel, inner rampart, lower ward, outer rampart, ditch, moor
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 80; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      const ar = (a * Math.PI) / 180;
      const d = Math.hypot(dx, dy) + 1.1 * Math.sin(3 * ar + 0.7) + 0.6 * Math.sin(7 * ar + 2.1);
      const outerGate = near(a, 90, 4.5) || near(a, 180, 4.5);
      const innerGate = near(a, 60, 7) || near(a, -90, 7);
      if (d < 15) b.paint(x, y, 1, 1, 'stone-flagstone');
      else if (d < 17) { if (innerGate) b.paint(x, y, 1, 1, 'stone-flagstone'); else b.rock(x, y, 1, 1); }
      else if (d < 28) b.paint(x, y, 1, 1, 'dirt');
      else if (d < 31) { if (outerGate) b.paint(x, y, 1, 1, 'stone-cobble'); else b.rock(x, y, 1, 1); }
      else if (d < 33.5) { if (outerGate) b.paint(x, y, 1, 1, 'dirt'); else b.mud(x, y, 1, 1); }
    }
  // the ravine cuts in from the north-east, with a stream at the bottom
  const rav: Pt[] = [[79, 1], [68, 10], [60, 18], [56, 22]];
  const distTo = (px: number, py: number) => {
    let best = 1e9;
    for (let i = 0; i < rav.length - 1; i++) {
      const [ax, ay] = rav[i], [bx, by] = rav[i + 1];
      const vx = bx - ax, vy = by - ay;
      const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
      best = Math.min(best, Math.hypot(px - (ax + vx * t), py - (ay + vy * t)));
    }
    return best;
  };
  for (let y = 0; y < 30; y++)
    for (let x = 45; x < 80; x++) {
      const e = distTo(x + 0.5, y + 0.5), d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (e < 2.3) b.floor(x, y, 1, 1, 'dirt');
      else if (e < 4.3 && d > 26.5) b.rock(x, y, 1, 1);
    }
  brush(rav, 1, (x, y) => b.water(x, y, 1, 1));

  // the moor and the road up
  brush([[40, 79], [40, 72]], 3, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.start(39, 76, 3, 3);
  b.area('Highfell moor', [[28, 72, 24, 8]], {
    read: 'Heather and wind, and a hill like a sleeping giant. Its top is crowned with walls of stones each the size of a cart, and smoke rises from inside. On the road ahead, a line of hill-folk shuffles toward the gate under ogre guards, carrying sacks of grain on their backs.',
    gm: 'Tribute day. Hill-folk carry grain and sheep to King Grummox. The heroes can fall in with the line (DC 13 Deception, or Disguise Self), scout round to the West Breach or the ravine, or simply march up. Wolf-riders patrol the moor.',
    label: [40, 75],
  });
  b.encounter('Wolf-riders on the moor', [28, 64, 24, 16], [['ogre', 4], ['worg', 6], ['direWolf', 2]], 'low');
  b.building("Shepherd's hut", 3, 66, 7, 6, {
    mat: 'dirt',
    read: 'A turf hut in a fold of the hill, dogs barking, and an old woman in the doorway with a crook held like a spear.',
    gm: 'Granny Aisling of the Fellwick clan. Her son and grandsons were taken to the tribute pens for "disrespect" (failing to kneel). She knows the hill fort well: the West Breach where the ettins sleep, the ravine with its trolls, and the Old Barrow, which has a robbers\' hole on the south side that "comes out somewhere it shouldn\'t". She also knows Grummox was once a lonely, gentle ogre who herded goats for the Fellwicks for bread.',
    doors: [[6, 71, 's', 'open']],
  });
  b.prop('straw-bed', 4, 67).prop('cooking-pot-fire', 7, 68).prop('spinning-wheel', 4, 70).light(7, 68, 8, 12);
  b.prop('stump', 11, 69).prop('log-pile', 2, 73);
  b.area('Cairn of Gallan', [[1, 1, 12, 12]], {
    read: 'A great cairn of white stones on the high moor, older than any kingdom. A worn carving on its capstone shows a giant handing a crown to a much smaller man.',
    gm: 'The grave of Gallan, the giant who built the hill fort and, in legend, swore the Highfells into the Concord. A DC 14 History: the Granite Stone of the crown was Loyalty, given by Gallan freely. Reading the carving to Grummox (or showing him a rubbing) shakes him: "Gallan GAVE the crown?" (advantage on the Persuasion to win him over).',
    label: [6, 6],
  });
  b.prop('cairn', 6, 6).props_('standing-stone', [[3, 3], [9, 3], [3, 9], [9, 9]]).prop('offering-bowl', 6, 8);

  // the outer gates and the ditch
  b.area("Giant's Gate", [[36, 66, 9, 8]], {
    read: 'A gate built for giants: two standing stones twenty feet tall with a lintel across them, and in the gap, a wall of sharpened tree-trunks on chains. Two hill giants lean on it, chewing.',
    gm: 'The front way in. Two hill giants and two ogres. On tribute days they wave the line through, counting heads badly. Questioned, they are easily confused (DC 12 Deception). A fight here alerts the whole fort.',
    label: [40, 69],
  });
  b.encounter("The Giant's Gate", [36, 64, 9, 10], [['hillGiant', 2], ['ogre', 2]], 'low');
  b.props_('standing-stone', [[38, 69], [41, 69]]).prop('cheval-de-frise', 40, 67).prop('campfire', 42, 65).prop('skull-pile', 38, 72).light(42, 65, 15, 20);
  b.area('West Breach', [[6, 35, 9, 10]], {
    read: 'The rampart has fallen in here, a slope of giant stones. Two two-headed giants sleep in the gap, back to back, snoring in two different rhythms. A bridge of lashed logs crosses the ditch.',
    gm: 'Two ettins guard the back way, with four ogres in a lean-to. The ettins argue about everything: a hero who sides with one head (DC 13 Persuasion) sets them arguing so hard the others slip past. Waking them is a fight.',
    label: [10, 40],
  });
  b.encounter('West Breach', [4, 34, 13, 13], [['ettin', 2], ['ogre', 4]], 'low');
  b.rubble(10, 37, 4, 6);
  b.props_('bridge-plank', [[7, 40]], 90).prop('lean-to', 14, 36).prop('campfire-cold', 15, 44).prop('bones', 12, 44);
  b.area('Outer ditch', [[4, 52, 10, 10]], { gm: 'The ditch round the fort is a moat of black mud. Crossing it anywhere but the gates: DC 14 Athletics or stuck (restrained until freed).', label: [9, 58] });

  // the ravine and the trolls
  b.area('The Rift', [[56, 4, 22, 20]], {
    read: 'A narrow gorge cut by a stream, deep in shadow. The stream runs red-brown. On a ledge, someone has hung sheep carcasses like washing.',
    gm: 'The third way in: up the gorge and into the lower ward behind the ogre camp. The trolls in the den above hear anything louder than a whisper (DC 15 Stealth for the group). Fire keeps them back.',
    label: [66, 13],
  });
  b.cave('Troll den', 63, 8, 3.5, 2.5, {
    seed: 504,
    read: 'A cave that stinks of rot. Bones crunch underfoot. Two huge, green, long-armed shapes look up from a meal.',
    gm: 'Two trolls and four worgs. The trolls hate the ogres ("too clever now, too clever") and would happily let the heroes pass for a promise to bring them Grummox\'s cook. Without fire or acid, they keep getting up.',
  });
  b.encounter('Troll den', [58, 4, 12, 10], [['troll', 2], ['worg', 4]], 'low');
  b.props_('bones', [[62, 8], [65, 9]]).prop('skeleton-lying', 61, 7).prop('bone-heap', 64, 7);

  // the lower ward: camps, longhouse, pens and spring
  b.area('Lower ward', [[18, 60, 12, 6]], { gm: 'The ring of ground between the two ramparts, where the ogre host camps. Smoke, shouting, and the smell of a hundred stewpots. Moving through it openly needs a disguise or a bold face (DC 14 Deception or Intimidation); at night it is easier (DC 11).', label: [24, 62] });
  b.area('Ogre camp', [[50, 50, 14, 12]], {
    read: 'Hide tents the size of houses, cookfires with whole oxen turning on them, and ogres everywhere: sharpening clubs, wrestling, singing. Banners of stolen tapestry show a crown of cooking pots.',
    gm: 'Grummox\'s host, mustering to march on Westmarch. Some hundred ogres, far too many to fight; the camp is a place to sneak, bluff or bargain. The ogres love Grummox but are frightened of how clever he has become. A DC 15 Persuasion over a shared meal: "King used to laugh. Now King only talks."',
  });
  b.props_('tent-round', [[52, 52], [58, 51], [59, 55], [53, 58]]).props_('campfire-spit', [[56, 55], [57, 58]]).props_('war-banner', [[55, 50], [61, 53]]).prop('weapon-barrel', 57, 58).props_('bedroll', [[51, 55], [54, 61]]).prop('hay-bale', 63, 52);
  b.light(56, 55, 15, 20).light(57, 58, 15, 20);
  b.building('Giants\' longhouse', 19, 21, 9, 7, {
    mat: 'wood-planks-dark',
    read: 'A longhouse with a roof of turf and whale ribs, so tall the doors are twice your height. Inside, hill giants sprawl round a fire, picking their teeth with spears.',
    gm: 'Grummox\'s hill giant chiefs, who are not sure an ogre should be king but like being fed. A DC 16 Persuasion (or a barrel of the stout from Brassholm) gets one of them, Big Thudd, to tell the truth: the envoy in grey from the capital told Grummox to march on Westmarch at the new moon, and promised him "a royal bride and a duke\'s chain".',
    doors: [[23, 27, 's', 'open', 'door-double'], [27, 24, 'e', 'closed']],
  });
  b.prop('fire-bowl', 23, 24).props_('rug-pelt', [[21, 23], [25, 23]]).prop('table-trestle', 22, 25).prop('keg-rack', 26, 22).light(23, 24, 15, 20);
  b.area('Tribute pens', [[44, 14, 9, 8]], {
    read: 'Pens of woven hurdles, the sort used for sheep. There are people in them. They are all kneeling, and they cannot seem to stop.',
    gm: 'Hill-folk who failed to kneel to the Rightful King, now made to kneel by the Granite Shard\'s power until he forgives them. Granny Aisling\'s family are here. In a separate iron cage sits a lean woman in grey eating a stolen apple: Reyna Sorrowind, caught trying to steal the shard. Her captors took her satchel to the Giant\'s Hall; in it is the Chancellor\'s order for her death (see the scene).',
  });
  b.props_('fence-wood', [[45, 15], [51, 16], [44, 21], [52, 21]]).props_('cage', [[46, 16], [50, 16]]).prop('cage', 48, 19).prop('water-trough', 46, 20).prop('hay-bale', 51, 19);
  b.pool(17, 34, 3, 2.5);
  b.area("Giant's Spring", [[13, 30, 8, 8]], { gm: 'A spring that bubbles up warm. Drinking from it cures one disease or poison (once per creature per day). The ogres wash socks in it.', label: [17, 34] });
  b.props_('reeds', [[15, 32], [19, 36]]).prop('washbasin', 14, 36);
  b.area("Kings' Stair", [[36, 21, 9, 5]], {
    read: 'A stair of huge stone blocks climbs the inner rampart, each step knee-high. At the top, a pair of ogres in pot helmets play knucklebones with real knuckles.',
    gm: 'The north way into the citadel, quiet and guarded only by two lazy ogres (easily bribed with food). From the stair you can see the whole citadel.',
    label: [40, 23],
  });
  b.props_('stairs-up', [[39, 23], [41, 23]]);
  b.area('Ogre Gate', [[45, 50, 8, 7]], {
    read: 'The south gate into the citadel: a tunnel through the inner rampart, closed by a cart full of rocks on chains. Three hill giants and a crowd of ogres guard it.',
    gm: 'The Rightful King\'s guard. Three hill giants and four ogres, alert. A royal summons, a convincing tribute (a gift fit for a king, DC 15 Persuasion) or a battle.',
    label: [48, 54],
  });
  b.encounter('The Ogre Gate', [44, 49, 10, 9], [['hillGiant', 3], ['ogre', 4]], 'moderate');
  b.props_('cart', [[48, 52]]).props_('chains-hanging', [[47, 52], [49, 53]]).prop('brazier', 46, 51).light(46, 51, 15, 20);

  // the Old Barrow, with a robbers' hole and a secret way into the citadel
  crag(b, 24, 55, 6, 4.5, 505, 0.12);
  b.cave('Barrow of the Giant Kings', 23, 56, 3.5, 2.5, {
    seed: 506,
    mat: 'dungeon-slab',
    read: 'A long stone chamber under the mound. Giant skeletons lie on slabs in rows, crowns of bronze on their skulls. Cold breath moves the dust. The bones are sitting up.',
    gm: 'Gallan\'s heirs, who will not let the hill fort be taken by a pretender. Two mummies (giant-kings\' servants), two wraiths and four ogre zombies (ogres who dug here for treasure). The dead can be reasoned with: a hero who swears that the heroes will "return the stone of loyalty to the crown" (DC 15 Religion or Persuasion) makes them stand aside, and the barrow-king points the way to the secret passage.',
  });
  b.encounter('The Old Barrow', [18, 52, 12, 9], [['mummy', 2], ['wraith', 2], ['ogreZombie', 4]], 'moderate');
  b.tunnel([[22, 55], [19, 51]], 2, { seed: 507, mat: 'cave-floor' });
  b.tunnel([[25, 57], [30, 60]], 2, { seed: 508, mat: 'cave-floor' });
  b.tunnel([[24, 55], [28, 52], [30, 51]], 1, { seed: 509, mat: 'cave-floor' });
  b.door(28, 52, 'e', 'secret');
  b.props_('burial-slab', [[21, 55], [25, 55], [21, 57], [25, 57]]).prop('sarcophagus-open', 23, 56).prop('treasure-urn', 24, 57).prop('gm-treasure', 22, 57, 0, { gm: true }).light(23, 56, 8, 12, '#9fe8ff');

  // the citadel
  hall(b, "Giant's Hall", [[32, 29, 17, 11], [37, 26, 7, 3]], 'stone-flagstone', {
    read: 'A roofless hall of giant stones, open to the clouds. Tapestries stolen from a dozen manors hang on the walls. At the far end, on a throne made from a toppled statue\'s head, sits an enormous ogre in a patchwork cloak, wearing a crown of beaten cooking pots. In the middle of the crown, a grey stone glows.',
    gm: 'The Court of the Rightful. Grummox receives visitors here with his hill giant chiefs, his guard of ogres and an ettin herald. He insists everyone kneel (the shard compels: DC 16 Wisdom save or kneel, prone, until the end of the next turn). See the climax scene.',
  });
  b.door(40, 39, 's', 'closed', 'door-double').door(41, 39, 's', 'closed', 'door-double').door(32, 34, 'w', 'closed').door(48, 34, 'e', 'closed');
  b.encounter('Court of the Rightful', [32, 26, 17, 14], [['oni', 1], ['hillGiant', 2], ['ogre', 4], ['ettin', 1]], 'high');
  b.prop('throne-dais', 40, 27).prop('throne', 40, 28).props_('tapestry-tall', [[33, 30], [47, 30], [33, 37], [47, 37]]).props_('column-collapsed', [[35, 32], [45, 36]]).prop('statue-tall-knight', 44, 31).prop('table-feast', 40, 34).props_('brazier-pedestal', [[37, 29], [43, 29]]).prop('crown-cushion', 42, 27).prop('loot-sacks', 34, 38).prop('backpack', 46, 38);
  b.light(37, 29, 15, 20).light(43, 29, 15, 20).light(40, 34, 15, 20);
  b.building('Royal stewpot', 28, 42, 7, 6, {
    mat: 'stone-flagstone',
    read: 'A kitchen with a cauldron you could swim in. A frightened human cook in an apron stirs it with an oar.',
    gm: 'Where the Granite Shard fell: into this pot, while Grummox was the fort\'s cook. He fished it out and put it on his head as a joke, and the joke became a crown. The cook, Master Tamworth, a captured innkeeper, who knows the King\'s habits and wants to go home.',
    doors: [[34, 44, 'e', 'closed'], [31, 42, 'n', 'closed']],
  });
  b.prop('cauldron', 31, 45).prop('butcher-block', 29, 43).prop('pot-rack', 33, 46).prop('firewood', 29, 47).light(31, 45, 10, 15);
  b.building('Royal kennels', 46, 41, 6, 7, { gm: 'Grummox\'s "royal hounds": worgs in collars of gold thread. Four of them, asleep unless woken. A pouch of bones keeps them quiet.', doors: [[46, 44, 'w', 'closed']] });
  b.props_('straw-bed', [[48, 43], [50, 46]]).prop('bones', 49, 42).prop('water-trough', 47, 46);
  b.area('Moot ring', [[36, 43, 9, 7]], {
    read: 'A ring of standing stones in the middle of the citadel, where giants once met to swear oaths. The grass inside it is greener than anywhere else.',
    gm: 'An oath sworn inside the ring cannot be broken by magic (the shard\'s compulsion cannot touch it). If the heroes bring Grummox here and offer him a true oath (a title from the Regent, freely given, for his loyalty freely given), he can accept it as Gallan once did.',
    label: [40, 46],
  });
  b.props_('standing-stone', [[37, 44], [43, 44], [36, 47], [44, 47], [40, 49]]).prop('stone-circle', 40, 46);
  b.props_('war-banner', [[38, 25], [42, 25]]).props_('campfire', [[35, 51]]).light(35, 51, 10, 15);
  scatter(b, 'rubble-pile', 18, 18, 44, 44, 10, 510);
  scatter(b, 'boulder', 0, 0, 80, 80, 22, 501);
  scatter(b, 'grass-tall', 0, 60, 80, 20, 14, 502);
  scatter(b, 'cairn', 0, 0, 80, 80, 4, 503);
  return b.build();
}

// =====================================================================
// Part 6: Crownhallow and the Cathedral of the Concord (level 10)
// =====================================================================
function crownhallow() {
  const b = new MapBuilder('adv-shc-crownhallow', 'Crownhallow and the Cathedral of the Concord', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dim', wallStyle: 'stone' });

  // the city wall, the road outside, the canal and its bridges
  b.paint(20, 0, 40, 44, 'grass').paint(58, 0, 22, 20, 'grass');
  b.rock(0, 72, 80, 2);
  b.paint(0, 74, 80, 6, 'grass');
  brush([[39, 79], [39, 74]], 2, (x, y) => b.paint(x, y, 1, 1, 'dirt'));
  b.water(0, 56, 80, 4, true);
  b.paint(0, 55, 80, 1, 'stone-flagstone').paint(0, 60, 80, 1, 'stone-flagstone');
  b.floor(37, 56, 6, 4, 'stone-flagstone').floor(12, 56, 2, 4, 'wood-planks').floor(66, 56, 2, 4, 'marble');
  b.props_('lamp-post', [[37, 56], [42, 59], [66, 56]]).props_('statue-tall-knight', [[37, 59], [42, 56]]);
  b.light(37, 56, 12, 18).light(42, 59, 12, 18).light(66, 56, 12, 18);
  b.area("King's Bridge", [[37, 56, 6, 4]], { gm: 'The great bridge from the lower town to Crown Square. On coronation day, the Silver Guard checks everyone crossing for the outlaw "Shardwardens" (their faces are on posters: DC 14 Deception with a disguise to pass).', label: [39, 57] });
  b.area('Grand Canal', [[0, 56, 36, 4], [44, 56, 36, 4]], {
    read: 'A broad green canal cuts the city in two, crowded with barges hung with coronation bunting.',
    gm: 'If Lockhaven\'s banner came, its bargemen are here: they ferry the heroes anywhere along the canal, and open the old culvert grate at the west end. The footbridge (west) and the Silver Bridge (east, to the Chancellor\'s house) are less watched than the King\'s Bridge.',
    label: [20, 57],
  });
  b.props_('rowboat', [[8, 57], [30, 58], [55, 57]]).props_('mooring-post', [[5, 55], [25, 60], [50, 55], [72, 60]]).prop('canoe', 74, 58);

  b.area('Westmarch Road', [[0, 74, 80, 6]], {
    read: 'The road from the west ends at the walls of Crownhallow: white stone, gold banners, and seven tall spires of the cathedral rising over everything. Bells ring for the coronation. Silver-armoured guards check every face at the gate.',
    gm: 'The heroes arrive on Midsummer\'s Eve. Whatever banners they won camp here outside the walls (see the scene "The banners gather"): Westmarch spears, Lockhaven barges on the canal, Wrenhollow\'s grey priests, Brassholm\'s dwarves, Saltreach ships in the river mouth, Grummox\'s ogres. They are a host, and Corwin knows it.',
    label: [20, 76],
  });
  b.start(38, 76, 3, 3);
  b.props_('tent-command', [[10, 76]]).props_('tent', [[16, 77], [62, 76], [70, 77]]).props_('war-banner', [[13, 75], [66, 75]]).props_('campfire', [[20, 77], [58, 77]]).prop('wagon', 28, 76).prop('signpost', 42, 75);
  b.light(20, 77, 10, 15).light(58, 77, 10, 15);

  hall(b, 'City gate', [[35, 69, 10, 5]], 'stone-flagstone', {
    read: 'A gatehouse with a portcullis of gilded iron. Silver Guards in winged helms stand under the arch with a sheaf of posters, and on each poster is your face.',
    gm: 'Two knights, four veterans and eight guards. They have orders to arrest the "Shardwardens" on sight. Ways past: disguises (DC 15 Deception), the canal (if the bargemen came), a host at the gate (if the ogres came, Grummox simply lifts the portcullis off its chains), or the Regent\'s warrant read aloud with a banner behind it (the guards waver: DC 16 Persuasion and half of them let the heroes pass).',
  });
  b.door(39, 73, 's', 'closed', 'door-double').door(40, 73, 's', 'closed', 'door-double').door(39, 69, 'n', 'open', 'door-double').door(40, 69, 'n', 'open', 'door-double');
  b.encounter('The city gate', [35, 66, 10, 8], [['knight', 2], ['veteran', 4], ['guard', 8]], 'low');
  b.props_('portcullis', [[39, 72], [40, 72]]).props_('weapon-rack', [[36, 70], [43, 70]]).prop('notice-board', 37, 71).props_('brazier', [[36, 72], [43, 72]]).light(36, 72, 12, 18).light(43, 72, 12, 18);

  // the lower town
  b.building('The Cracked Bell', 4, 61, 11, 8, {
    mat: 'wood-planks-dark',
    read: 'A crooked inn with a cracked bell over the door. Inside, the drinkers stop talking, look at your faces, look at the posters on the wall, and then go back to their ale very carefully.',
    gm: 'The Westmarch loyalists\' safehouse, run by a retired sergeant of the Regent\'s, Hesk Tamberlane. The heroes\' allies gather here: Haldis, freed Wrenhollow priests, the Regent herself if she was cured. Hesk has a coronation invitation forged for each hero (they pass at the cathedral doors unless a guard looks closely: DC 15 Deception).',
    doors: [[14, 64, 'e', 'closed'], [9, 61, 'n', 'closed']],
    windows: [[4, 64, 'w'], [11, 68, 's']],
  });
  b.wallRun(4, 66, 5, 'n').door(6, 66, 'n', 'closed');
  b.area('Safehouse cellar', [[4, 66, 5, 3]], { gm: 'A hidden room behind the beer barrels: maps of the cathedral, a list of the lords, and a sickbed.' });
  b.prop('bar-counter', 6, 62).prop('keg-rack', 5, 62).props_('table-round', [[9, 63], [12, 65], [11, 67]]).props_('chair', [[10, 63], [12, 64], [10, 67]]).prop('notice-board', 13, 62).prop('bed', 5, 67).prop('table-maps', 7, 67).light(9, 64, 12, 18).light(6, 67, 6, 10);
  b.area('Market of Seven Wells', [[22, 61, 34, 7]], {
    read: 'The great market is full for the coronation: ribbon-sellers, pie-men, a puppet show of the High King\'s death in which the villain wears Westmarch blue. Everybody is smiling. Everybody is saying how wonderful the Chancellor is.',
    gm: 'The Keystone\'s charm reaches far: the city loves Corwin already, and does not know why. A DC 15 Insight sees the smiles are fixed. Anyone who hears Tobble tell his story here (DC 14 Performance) shakes a little: rumours spread, and the crowd in Crown Square is less sure of itself later.',
    label: [38, 64],
  });
  b.props_('market-stall', [[24, 62], [28, 62], [32, 66], [45, 62], [49, 66], [53, 62]]).props_('well', [[26, 65], [40, 66], [52, 65]]).prop('produce-stall', 36, 62).prop('cart', 44, 66).props_('lamp-post', [[22, 61], [34, 67], [46, 61], [55, 67]]);
  for (const [x, y] of [[22, 61], [34, 67], [46, 61], [55, 67]] as Pt[]) b.light(x, y, 12, 18, '#ffd28a');
  b.building('Silver Guard barracks', 58, 61, 13, 8, {
    mat: 'stone-flagstone',
    gm: 'The Chancellor\'s new guard, raised from mercenaries and dressed in silver. Most are at the cathedral today. The duty sergeant\'s desk holds the coronation guard plan: who stands where, and that the bell towers hold "the Grey Knife and his unseen friend" (an assassin and an invisible stalker) watching the crowd.',
    doors: [[64, 61, 'n', 'closed'], [58, 65, 'w', 'closed']],
  });
  b.props_('bunk-bed', [[59, 62], [61, 62], [59, 67], [61, 67]]).prop('desk', 67, 63).prop('weapon-rack', 70, 62).prop('armor-stand', 70, 67).prop('table-cards', 65, 66);
  b.props_('crate-stack', [[16, 61], [20, 68]]).prop('barrel-group', 74, 62).prop('fish-crate', 2, 61);

  // the Old Culvert and the Crypt of Kings
  hall(b, 'Old Culvert', [[0, 22, 3, 34]], 'dungeon-slab', {
    read: 'A brick tunnel with a channel of black water down the middle, so low you must stoop. It smells of centuries.',
    gm: 'The old drain from the cathedral hill to the canal, forgotten by everyone but Tobble, who hid here as a boy. Its canal grate is rusted shut (DC 18 Athletics, or the bargemen\'s winch). Two otyughs and a black pudding live in the muck. At the top, a secret door opens into the Crypt of Kings.',
  });
  b.water(1, 22, 1, 34, false, true);
  b.door(1, 55, 's', 'locked', 'door-iron').door(1, 22, 'n', 'secret');
  b.encounter('The Old Culvert', [0, 22, 3, 34], [['otyugh', 2], ['blackPudding', 1]], 'low');
  b.props_('sewer-outflow', [[1, 54]]).props_('bones-mud', [[0, 40], [2, 30]]).prop('green-slime', 2, 46);
  b.rock(0, 0, 21, 22);
  b.room('Crypt of Kings', 4, 3, 12, 8, {
    mat: 'dungeon-slab',
    read: 'A long vault where the high kings lie in rows, each on a stone coffin carved with his face. Bronze guardians stand between them with swords reversed. As you enter, every guardian lifts its head.',
    gm: 'The guardians of the dead kings: a shield guardian, six animated armours and six flying swords from the tomb walls. They let anyone pass who kneels to the kings and gives their name (they remember it). The secret way up to the cathedral is the crypt stair (north transept).',
  });
  b.encounter('Guardians of the kings', [4, 3, 12, 8], [['shieldGuardian', 1], ['animatedArmor', 6], ['flyingSword', 6]], 'low');
  b.props_('sarcophagus-effigy', [[6, 5], [9, 5], [12, 5], [6, 8], [9, 8], [12, 8]]).props_('statue-tall-knight', [[4, 3], [15, 3], [4, 10], [15, 10]]).prop('candle-stand-tall', 14, 6).light(10, 6, 10, 15, '#cfe0ff');
  b.floor(9, 11, 2, 2, 'dungeon-slab');
  b.room('Tomb of King Edwin', 6, 13, 8, 6, {
    mat: 'marble',
    read: 'A new tomb, the stone still white. On it lies the carved figure of an old king with a broken crown on his breast. A cold light gathers above it, and a voice like a sigh says, "Who comes?"',
    gm: 'The ghost of High King Edwin cannot leave his tomb, but he can speak here. He confirms what Tobble saw, and he tells the heroes the crown\'s last secret: the founders set six stones, not seven, because they said Justice, the seventh virtue, must never be done by magic, only by people. A crown reforged by a murderer bends the realm\'s virtues to his will; a crown reforged freely by the Assembly binds the virtues to the realm; and a crown left broken leaves the realm free to choose without magic at all. He blesses the heroes (each gains 1 Heroic Inspiration).',
  });
  b.prop('sarcophagus-effigy', 9, 15).props_('candle-ring', [[7, 14], [12, 14]]).prop('crown-cushion', 10, 17).light(9, 15, 10, 15, '#e8f0ff');
  b.floor(1, 17, 5, 1, 'dungeon-slab').floor(1, 18, 1, 4, 'dungeon-slab');
  b.floor(16, 6, 3, 1, 'dungeon-slab').floor(18, 7, 1, 7, 'dungeon-slab');
  b.room('Crypt stair', 17, 14, 5, 4, { mat: 'dungeon-slab', gm: 'A spiral stair up to a locked door in the north transept of the cathedral (DC 17 thieves\' tools; the key hangs in the vestry).' });
  b.prop('stair-spiral', 19, 15);

  // the Cathedral of the Concord
  hall(b, 'Cathedral of the Concord', [[33, 22, 14, 22], [22, 14, 36, 8], [35, 4, 10, 10], [37, 2, 6, 2]], 'marble', {
    read: 'The greatest church in the realm: a forest of white pillars, windows of seven colours, and a thousand candles. Every pew is full: lords in velvet, guildmasters, priests, soldiers. Over the crossing, seven great lamps hang unlit, one for each province, and below them the choir glows like a stage.',
    gm: 'The coronation fills the nave. The lords of the seven provinces sit in the front pews under their banners. The Silver Guard lines the aisles. The Archprelate waits on the dais with the empty crown setting. Corwin enters last, to a storm of applause.',
    label: [39, 30],
  });
  b.wallRun(35, 13, 10, 's');
  b.door(39, 13, 's', 'open', 'door-double').door(40, 13, 's', 'open', 'door-double').door(39, 43, 's', 'closed', 'door-double').door(40, 43, 's', 'closed', 'door-double');
  b.door(22, 15, 'w', 'locked').door(24, 21, 's', 'closed').door(57, 18, 'e', 'closed');
  b.area('Nave', [[33, 22, 14, 22]], {
    gm: 'The Assembly sits here, province by province. The Silver Guard (two gladiators, five knights, two veterans) lines the aisles and blocks the way to the choir once trouble starts. Lords whose banners stand with the heroes order their household knights to stand aside, or to join the heroes.',
    label: [36, 36],
  });
  b.encounter('The Silver Guard in the nave', [33, 22, 14, 22], [['gladiator', 2], ['knight', 5], ['veteran', 2]], 'moderate');
  b.area('Crossing of the Seven Lamps', [[33, 14, 14, 8]], {
    gm: 'Seven great lamps hang over the crossing, one per province. During the rite, the Archprelate lights each lamp as its lord acclaims the new king. A lamp that stays dark is a province that refuses. A shard brought near its own lamp lights it (whoever carries it).',
    label: [40, 17],
  });
  b.props_('pew', [[35, 25], [44, 25], [35, 28], [44, 28], [35, 31], [44, 31], [35, 34], [44, 34], [35, 37], [44, 37], [35, 40], [44, 40]]).props_('column-cluster', [[33, 23], [46, 23], [33, 32], [46, 32], [33, 42], [46, 42]]);
  b.props_('brazier-pedestal', [[34, 15], [37, 15], [40, 15], [43, 15], [46, 15], [35, 20], [45, 20]]).props_('banner-hanging-tall', [[23, 14], [56, 14], [33, 21], [46, 21]]).props_('window-stained-tall', [[22, 17], [57, 17]]).prop('font', 40, 41).props_('statue-tall-robed', [[25, 16], [54, 16]]).prop('organ-cathedral', 52, 19).prop('sarcophagus-effigy', 27, 19);
  for (const [x, y] of [[34, 15], [37, 15], [40, 15], [43, 15], [46, 15], [35, 20], [45, 20]] as Pt[]) b.light(x, y, 10, 15, '#ffe6a0');
  b.light(39, 30, 25, 25, '#ffd28a').light(39, 39, 20, 20, '#ffd28a').light(28, 18, 15, 20, '#ffd28a').light(52, 18, 15, 20, '#ffd28a');
  b.area('Coronation choir', [[35, 2, 10, 12]], {
    read: 'Up seven steps, under a canopy of gold, stands the coronation throne. Before it, on a silver stand, rests the empty setting of the Concord Crown: a ring of gold with six empty sockets. Corwin Dunmallow kneels before it, and turns, and smiles at you as if you were old friends.',
    gm: 'The climax (see the scene "The reforging"). Corwin, his shield guardian (its amulet is on his wrist) and two knights of his household. The empty setting draws the shards: each round of the rite, every creature carrying a shard within 60 feet makes a DC 17 Strength save or its shard flies into a socket.',
  });
  b.encounter('The Coronation', [35, 2, 10, 12], [['archmage', 1], ['shieldGuardian', 1], ['knight', 2]], 'high');
  b.prop('throne-dais', 39, 5).prop('throne', 40, 4).prop('altar-reredos', 39, 2).prop('crown-cushion', 39, 8).props_('candelabra-grand', [[36, 6], [43, 6]]).props_('stair-grand', [[39, 12]]).props_('statue-tall-winged', [[35, 4], [44, 4]]).prop('lectern-dais', 42, 9);
  b.light(39, 6, 20, 20, '#fff2c0').light(39, 10, 15, 20, '#fff2c0');

  hall(b, 'Hall of Banners', [[28, 5, 7, 8]], 'wood-planks-dark', { gm: 'Where the lords robe before the rite. Their banners hang ready. A hero who swaps a banner (DC 14 Sleight of Hand) can make a lord walk in under the wrong colours, a small comedy that can matter. A servant\'s door opens on the close.' });
  b.door(34, 8, 'e', 'closed').door(31, 12, 's', 'closed');
  b.props_('banner-hanging-tall', [[29, 6], [31, 6], [33, 6]]).prop('coat-rack', 29, 10).prop('mirror', 33, 10).prop('wardrobe', 30, 11);
  hall(b, 'Vestry', [[45, 5, 7, 8]], 'wood-planks', {
    read: 'Robes, chalices and incense in a narrow room. A boy in white is polishing a silver box, and almost drops it when you come in.',
    gm: 'The silver box holds the Archprelate\'s coronation oil and the crypt key. The acolyte, Wilf, is terrified of the Chancellor ("he smiles at me and I feel happy and I don\'t want to"). A DC 13 Persuasion: he will ring the sanctus bell at the wrong moment as a signal.',
  });
  b.door(45, 8, 'w', 'closed').door(48, 12, 's', 'closed');
  b.props_('wardrobe', [[46, 6], [50, 6]]).prop('cabinet-glass', 50, 10).prop('chalices', 47, 9).prop('censer-hanging', 48, 7).prop('key-ring', 46, 11);
  hall(b, 'Tower of the Lamb', [[29, 37, 4, 7]], 'stone-flagstone', {
    gm: 'The west bell tower. Its stair climbs to a gallery over the nave. The Grey Knife, Corwin\'s second assassin, waits up here with an invisible stalker, watching the crowd for the heroes. A crossbow bolt from the gallery is the first sign of trouble.',
  });
  b.door(32, 40, 'e', 'closed').door(30, 43, 's', 'closed');
  b.encounter('The bell tower', [29, 37, 4, 7], [['invisibleStalker', 1], ['assassin', 1]], 'low');
  b.props_('stair-spiral', [[30, 38]]).prop('temple-bell', 31, 41).prop('rope-coil', 29, 42);
  hall(b, 'Tower of the Lion', [[47, 37, 4, 7]], 'stone-flagstone', { gm: 'The east bell tower. Ringing its great bell during the rite (DC 15 Athletics) breaks the hush: everyone in the cathedral is shaken, and Corwin\'s charm on the crowd falters for 1 round (the heroes can be heard).' });
  b.door(47, 40, 'w', 'closed').door(49, 43, 's', 'closed');
  b.props_('stair-spiral', [[49, 38]]).prop('temple-bell', 48, 41);
  hall(b, 'Cathedral cloister', [[47, 24, 11, 11]], 'dungeon-slab', { gm: 'A quiet cloister where priests walk. The Archprelate\'s secretary meets the heroes here if they ask for an audience (see the Archprelate\'s lodge).' });
  b.paint(49, 26, 7, 7, 'grass');
  b.wallRun(49, 26, 7, 'n', 'low').wallRun(49, 32, 7, 's', 'low').wallRun(49, 26, 7, 'w', 'low').wallRun(55, 26, 7, 'e', 'low');
  b.door(46, 29, 'e', 'closed').door(52, 34, 's', 'closed');
  b.prop('fountain', 52, 29).props_('bench', [[50, 25], [56, 33]]).prop('statue-tall-robed', 57, 25);

  b.area('Cathedral close', [[20, 22, 13, 15], [58, 14, 2, 20]], {
    read: 'Lawns and yew trees round the great church, full of carriages and grooms in a dozen lords\' colours.',
    gm: 'A good place to slip between the lords\' retinues. Grooms and servants gossip: who is wavering, who has been "persuaded", whose son has been promised what.',
    label: [26, 28],
  });
  scatter(b, 'tree-pine', 20, 22, 12, 15, 6, 601);
  b.props_('wagon', [[24, 33], [29, 25]]).props_('hitching-post', [[22, 30], [30, 34]]).prop('horse-trough', 27, 35);

  b.building("Archprelate's lodge", 61, 4, 12, 10, {
    mat: 'wood-planks',
    read: 'A comfortable house of books and old cats. The Archprelate, a tiny ancient woman in white, sits by the fire with a cat on each knee and a glass of wine.',
    gm: 'Archprelate Tamsy Marchbank will crown whomever the Assembly acclaims; that is the law. She is not charmed: she is deaf, and has never heard Corwin speak, only read his letters. Show her proof (written evidence, which she can read) and she agrees to ask the Assembly a question before the crowning: "Does any here know a reason this man may not be crowned?" That gives the heroes their moment.',
    doors: [[66, 13, 's', 'closed'], [61, 8, 'w', 'closed']],
    windows: [[66, 4, 'n']],
  });
  b.prop('fireplace', 64, 5).props_('armchair', [[64, 7], [66, 7]]).props_('bookshelf-tall', [[70, 5], [71, 5]]).prop('writing-desk', 70, 10).prop('bed-canopy', 62, 11).prop('rug-round', 65, 9).light(64, 6, 10, 15);

  // the Silver Hall, the Chancellor's house
  b.wallRun(60, 20, 18, 'n').wallRun(60, 44, 18, 's').wallRun(60, 20, 25, 'w').wallRun(77, 20, 25, 'e');
  b.door(68, 44, 's', 'closed', 'door-double').door(60, 36, 'w', 'locked');
  b.paint(60, 20, 18, 25, 'grass');
  b.area('Silver garden', [[60, 33, 18, 12]], {
    read: 'A walled garden of white roses and silver birches, so perfect it looks painted. A fountain plays. Peacocks.',
    gm: 'The grounds of the Chancellor\'s house. Empty today but for the gardeners. The locked postern on the west side opens onto the cathedral close.',
  });
  scatter(b, 'tree-birch', 60, 34, 18, 10, 6, 602);
  b.prop('fountain-grand', 68, 39).props_('hedge-long', [[62, 36], [74, 36]]).props_('flowers', [[64, 41], [72, 41]]);
  hall(b, 'Silver Hall', [[63, 23, 12, 10]], 'marble', {
    read: 'A white house with silver shutters. Inside, everything is grey and white and perfectly tidy, and every room smells faintly of lavender.',
    gm: 'Corwin\'s house in the capital, guarded today by four knights, two mages and two veterans of his household. The evidence the Assembly needs is here (see the scene).',
  });
  b.wallRun(69, 23, 10, 'w').wallRun(69, 28, 6, 'n');
  b.door(68, 32, 's', 'closed', 'door-double').door(69, 25, 'w', 'locked').door(69, 30, 'w', 'closed').door(71, 28, 'n', 'secret');
  b.encounter('The Silver Hall guard', [63, 23, 12, 10], [['knight', 4], ['mage', 2], ['veteran', 2]], 'moderate');
  b.area("Chancellor's study", [[69, 23, 6, 5]], { gm: 'A desk, a window, a chessboard mid-game. Corwin\'s journal is locked in the desk (DC 16): see the scene "The Chancellor\'s house".' });
  b.area('Stillroom', [[69, 28, 6, 5]], { gm: 'A small alchemist\'s room. Jars of a grey powder labelled "lavender": the poison he has been feeding the Regent in her tea, by way of a bribed maid. The antidote recipe is in his own hand.' });
  b.props_('table-long', [[65, 26]]).props_('chair-high-back', [[64, 28], [66, 28]]).prop('chandelier-crystal', 65, 27).prop('harpsichord', 64, 31).prop('writing-desk', 72, 24).prop('table-cards', 70, 26).prop('alchemy-table', 72, 30).prop('potion-shelf', 74, 31).prop('shelf-jars', 70, 31);
  b.light(65, 27, 12, 18, '#e8f0ff').light(72, 24, 6, 10);

  // the Hall of the Seven Provinces and Crown Square
  hall(b, 'Hall of the Seven Provinces', [[4, 25, 16, 9]], 'wood-planks-dark', {
    read: 'A long council hall hung with seven banners: amber, white, iron-grey, sea-green, granite, silver and Westmarch blue. Lords and their stewards argue in knots, and fall silent when they see who has come in.',
    gm: 'Where the lords of the Assembly lodge and bargain before the rite. This is where the heroes lobby: see the scene "The Assembly". Each lord present is a vote. The silver-banner lord of the Crownlands, Lord Vaughn Kessick, is Corwin\'s creature; the Westmarch lord is the heroes\' friend; the other five vote as their banners go.',
  });
  b.door(19, 29, 'e', 'closed', 'door-double').door(11, 33, 's', 'closed');
  b.props_('banner-hanging-tall', [[5, 25], [7, 25], [9, 25], [11, 25], [13, 25], [15, 25], [17, 25]]).prop('war-table', 11, 29).props_('chair-high-back', [[9, 28], [13, 28], [9, 30], [13, 30]]).prop('hearth-grand', 5, 29).prop('chandelier-great', 11, 27).light(11, 29, 15, 20);
  hall(b, "Lords' lodgings", [[4, 34, 16, 9]], 'wood-planks', { gm: 'Rooms for the provincial lords and their stewards. A steward will take a bribe or a message; a lord will receive the heroes privately if they come with a banner\'s token.' });
  b.wallRun(11, 34, 9, 'e').door(11, 38, 'e', 'closed').door(15, 42, 's', 'closed').door(7, 42, 's', 'closed');
  b.props_('bed-four-poster', [[5, 35], [17, 35]]).props_('writing-desk', [[9, 40], [13, 40]]).props_('wardrobe', [[5, 41], [18, 41]]).prop('trunk', 16, 38);

  b.paint(24, 44, 32, 11, 'stone-flagstone');
  b.area('Crown Square', [[24, 44, 32, 11]], {
    read: 'A square packed with ten thousand people under coronation bunting. Before the cathedral doors, a scaffold has been built, and on it stand six men in Westmarch blue with nooses round their necks. A herald reads: "The king\'s murderers, to hang at the crowning!"',
    gm: 'Corwin\'s scapegoats: Regent\'s guardsmen he framed. They hang when the crown touches his head. Freeing them before then (the scaffold guards are three knights, four veterans and a war-mage) turns the crowd: it is the first time anyone has seen the Silver Guard look like villains. Doing it openly brings a riot; doing it quietly (cutting ropes, a distraction) is harder but cleaner. Reyna, if turned, can be here in the crowd to help.',
    label: [40, 50],
  });
  b.encounter('Crown Square riot', [24, 44, 32, 11], [['knight', 3], ['veteran', 4], ['mage', 1]], 'low');
  b.props_('gallows', [[36, 46], [43, 46]]).prop('stair-grand', 39, 46).props_('war-banner', [[26, 45], [53, 45]]).props_('bench-long', [[27, 50], [31, 52], [48, 50], [52, 52]]).props_('lamp-post', [[24, 44], [55, 44], [24, 54], [55, 54]]).props_('market-stall', [[28, 53], [50, 53]]).prop('statue-tall-knight', 40, 52);
  for (const [x, y] of [[24, 44], [55, 44], [24, 54], [55, 54]] as Pt[]) b.light(x, y, 15, 20, '#ffd28a');
  b.props_('crate-stack', [[20, 46], [58, 50]]).props_('barrel-group', [[2, 45], [77, 50]]).props_('notice-board', [[21, 52], [57, 46]]);
  return b.build();
}
