// The Ninth Seal: a five-part campaign for four heroes, levels 11 to 16.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// ---------- Part 1: Calvarre, the Lyceum quarter (level 11) ----------
function calvarre() {
  const b = new MapBuilder('adv-nsl-calvarre', 'The Lyceum quarter of Calvarre', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dim', wallStyle: 'stone' });
  const r = rng(9101);

  // ----- the Inkwater canal, its culvert and its bridges -----
  b.water(26, 44, 54, 4, false).water(26, 45, 54, 2, true);
  b.area('The Inkwater canal', [[26, 44, 40, 4]], {
    read: 'Black water slides between stone banks, stained dark by a century of the Lyceum\'s spilled ink. Barges of paper and firewood bump along it, poled by bored students.',
    gm: 'Deep in the middle. Swimming in armour is a DC 15 Athletics check. Anything thrown in here during the chase is lost unless someone dives (DC 15 Perception underwater).',
    label: [44, 45],
  });
  b.floor(30, 44, 3, 4, 'stone-flagstone');
  b.area('Scholars\' Bridge', [[30, 42, 3, 8]], {
    read: 'A humpbacked stone bridge, its parapet carved with the names of every Provost of the Lyceum. The newest name has fresh flowers on it.',
    gm: 'The main way across. Students loiter here at all hours. A DC 13 Persuasion (and a round of drinks) gets gossip: the Warden of the Tower never came down to dinner, and her apprentice Sabeth "went home" without saying goodbye.',
    label: [31, 43],
  });
  b.props_('lamp-post', [[29, 43], [33, 48]]).prop('flowers', 31, 42).light(29, 43, 10, 15).light(33, 48, 10, 15);
  b.floor(48, 44, 2, 4, 'wood-planks').prop('bridge-plank', 48, 45, 90).prop('bridge-plank', 49, 46, 90);
  b.area('Tanners\' footbridge', [[48, 44, 2, 4]], { read: 'A rickety plank footbridge, sticky with tar.', gm: 'Fine for walking. Running across it in the chase takes a DC 12 Acrobatics check or you go in.' });
  b.props_('rowboat', [[38, 46], [55, 45]], 90).prop('canoe', 61, 44, 90).props_('mooring-post', [[36, 43], [53, 48], [60, 43]]);

  // ----- the Lyceum walls and gates -----
  b.wallRun(35, 2, 20, 'n').wallRun(54, 2, 40, 'e').wallRun(4, 41, 51, 's').wallRun(4, 20, 22, 'w');
  b.door(30, 41, 's', 'open', 'door-double').door(31, 41, 's', 'open', 'door-double').door(32, 41, 's', 'open', 'door-double');
  b.door(54, 24, 'e', 'closed', 'door-iron').door(54, 25, 'e', 'closed', 'door-iron').door(4, 30, 'w', 'locked', 'door-wood');
  b.area('Lyceum south gate', [[26, 38, 11, 3]], {
    read: 'The great bronze gate of the Lyceum stands open under an arch carved with owls. In the porter\'s booth, an old man with ink on his chin guards an enormous ledger as if it were his child.',
    gm: 'The porter, Gully, writes down everyone who goes in or out after dark. His log for last night is the key to the locked room (handout). He is proud of it and shows it to anyone polite. He saw the Warden and her apprentice go up at nine bells; nobody came down.',
  });
  b.prop('desk', 27, 39).prop('lectern', 28, 39).prop('lantern-standing', 34, 39).prop('statue', 26, 40).prop('statue', 36, 40).light(34, 39, 10, 20);

  // ----- the Orrery Tower: the stacks below, the stair, and the Star Room at the top -----
  b.rock(4, 2, 31, 18);
  b.cave('The Orrery Tower stacks', 12, 11, 6, 6, {
    seed: 11, mat: 'marble', wobble: 0.05,
    read: 'A round, many-storied well of books. Galleries climb the walls on iron ladders, and in the middle, a brass orrery taller than a house turns slowly on its own, planets ticking past your head.',
    gm: 'The tower library, open to scholars by day. The orrery is clockwork, wound once a year. A DC 15 Investigation of the catalogue desk shows the Warden borrowed only one kind of book this year: anything about how to stay alive past your time (lichcraft disguised as "longevity"). The librarian thought it was an old woman\'s fear of dying.',
  });
  b.props_('library-stack', [[8, 7], [16, 7], [7, 14], [16, 14]]).props_('bookcase-ladder', [[8, 10], [16, 12]]).prop('orrery', 12, 11).prop('desk', 10, 15).prop('table-reading', 14, 15).prop('candelabra', 12, 7).light(12, 7, 15, 20);
  b.hall(15, 10, 21, 10, 1, { mat: 'stone-flagstone' });
  b.area('The tower stair', [[15, 10, 6, 1]], {
    read: 'A tight spiral stair climbs a hundred and twenty feet inside the tower wall. At the top, a black oak door. The Proctor\'s men have been hammering on it since dawn.',
    gm: 'The door is barred from the inside: an iron bar in iron brackets. Breaking it takes a DC 20 Athletics check or 40 slashing or bludgeoning damage (AC 15). A DC 18 Arcana check with detect magic notices a faint trace of conjuration magic on the far side.',
  });
  b.prop('stair-spiral', 15, 10).prop('torch-sconce', 18, 10).light(18, 10, 5, 10);
  b.door(20, 10, 'e', 'locked', 'door-iron');
  b.cave('The Star Room', 27, 10, 5, 5, {
    seed: 12, mat: 'wood-planks-dark', wobble: 0.05,
    read: 'A round study at the top of the tower, under a dome painted with stars. It is bitterly cold. A woman in a grey warden\'s coat lies on the rug by the desk, her face burned white with frost, a brass key clutched to her chest.',
    gm: 'The locked room. The body is NOT Aldreda: it is her apprentice Sabeth Strake, killed by a cone of cold and dressed in Aldreda\'s coat and ring. Clues: the ring slips off the finger (DC 12 Medicine: too big); ink stains and a writing callus on the RIGHT hand, but the Provost says Aldreda wrote left-handed; the only window is latched inside. Under the rug (lifting it wakes the guardians): a fresh permanent teleportation circle, scorched (DC 18 Arcana). Its destination sigils are scratched out; a DC 20 Arcana check reads the last two: they spell "the Still...".',
  });
  b.prop('rug-round', 27, 11).prop('desk', 29, 8).prop('chair-high-back', 29, 7).prop('telescope', 25, 6).prop('globe-stand', 31, 12).prop('bookshelf-tall', 23, 12).prop('blood-pool', 27, 12).prop('magic-circle', 27, 10, 0, { gm: true }).prop('candles', 30, 9).light(30, 9, 10, 10, '#bfe3ff');
  b.encounter('The Star Room watchers', [22, 5, 11, 11], [['invisible-stalker', 2]], 'low');
  b.note(27, 10, 'Teleportation circle under the rug. Lifting the rug sets the two invisible stalkers on whoever did it: Aldreda left them to destroy anyone who finds the circle.');
  b.hall(12, 17, 12, 21, 1, { mat: 'marble' });
  b.door(12, 19, 's', 'closed', 'door-double');

  // ----- inside the Lyceum -----
  b.building('Library Hall', 5, 21, 13, 9, {
    mat: 'wood-planks-dark',
    read: 'Long reading tables under green-shaded lamps, and a hundred students pretending not to stare at you. Everyone is whispering about the tower.',
    gm: 'Rumours (DC 12 Persuasion each): the Warden was "older than the Lyceum" and never seemed to age; her apprentice Sabeth was right-handed, clever and afraid of her; the Warden had a visitor last month, a man in sky-blue silks "from up there" (a Concord courier from Lumenreach).',
    doors: [[12, 21, 'n', 'open'], [17, 25, 'e', 'open', 'door-double'], [11, 29, 's', 'closed']],
    windows: [[5, 24, 'w'], [5, 27, 'w']],
  });
  b.props_('table-long', [[8, 24], [8, 27], [14, 24], [14, 27]], 90).props_('bookshelf-tall', [[6, 22], [16, 22], [6, 28], [16, 28]]).props_('lamp-table', [[8, 25], [14, 25]]).light(8, 25, 10, 15).light(14, 25, 10, 15);

  b.paint(20, 21, 21, 17, 'grass');
  b.area('The Great Quad', [[20, 21, 21, 17]], {
    read: 'A square of lawn ringed with gravel walks and old lime trees. In the middle, the bronze Founder of the Lyceum points at the sky with a quill. Somebody has hung a black ribbon on it.',
    gm: 'The heart of the Lyceum. The Provost meets the heroes here at dawn. At night, students drink and sing under the trees until the Proctor chases them off. Students swear the Founder\'s plinth hides a stair to the Undercroft. It does not: the real stair is behind the Provost\'s House.',
  });
  b.prop('statue-tall-robed', 30, 29).props_('tree-oak', [[22, 23], [38, 23], [22, 35], [38, 35], [26, 31], [35, 26]]).props_('bench', [[27, 26], [33, 33], [27, 33], [33, 26]]).props_('lamp-post', [[24, 29], [36, 29]]).prop('well', 30, 35).prop('flowers', 31, 30);
  b.light(24, 29, 10, 20).light(36, 29, 10, 20);

  b.building('Hall of Lectures', 36, 3, 18, 13, {
    mat: 'wood-planks',
    read: 'Tiered benches fall steeply to a lectern under a slate board covered in diagrams of the stars. The last lecture ended mid-sentence: "the Ninth is the only one that...".',
    gm: 'Aldreda gave a public lecture here every year on "the stars beneath the world". The slate is hers, unfinished. A DC 16 Arcana or History check recognises the nine-pointed diagram as a binding: nine locks around one sleeper.',
    doors: [[44, 15, 's', 'open', 'door-double'], [45, 15, 's', 'open', 'door-double']],
    windows: [[36, 7, 'w'], [36, 11, 'w']],
  });
  b.wallRun(47, 3, 13, 'e');
  b.door(47, 8, 'e', 'closed');
  b.area('Masters\' common room', [[48, 3, 6, 13]], {
    read: 'Deep armchairs, a cold fire, and decanters of something brown. The masters of the Lyceum have been arguing here all morning about whose fault this is.',
    gm: 'Three old masters. One (Master Vellow, of Astronomy) was Aldreda\'s friend and says she had been "frightened of something under the ground for thirty years, and then suddenly, this spring, not frightened at all".',
  });
  b.props_('bench-long', [[38, 5], [38, 8], [38, 11]], 90).prop('lectern-dais', 44, 13).prop('war-table', 41, 9).props_('armchair', [[50, 5], [52, 9]]).prop('fireplace', 51, 4).prop('sideboard', 49, 13).prop('chandelier', 41, 6).light(41, 6, 10, 20);

  b.building('Refectory', 44, 19, 10, 8, {
    mat: 'stone-flagstone',
    read: 'Benches, soup kettles and a smell of cabbage. A row of black-gowned students eats in silence under a portrait of the Warden of the Tower.',
    gm: 'The portrait was painted sixty years ago. The woman in it looks exactly as she did last week. A DC 14 Insight on the cooks: Sabeth ate here yesterday at noon and asked for "something to steady the nerves".',
    doors: [[44, 22, 'w', 'open'], [48, 26, 's', 'open']],
  });
  b.props_('table-long', [[47, 21], [47, 24], [51, 21], [51, 24]], 90).prop('hearth-oven', 52, 20).prop('cauldron', 50, 20).prop('tapestry-tall', 45, 19).light(52, 20, 10, 15);

  b.building('The glasshouse', 44, 29, 10, 9, {
    mat: 'dirt',
    read: 'Steam fogs the glass. Ferns as tall as trees, and things that should be ferns but move. Something drips from the vines, black and sweet-smelling.',
    gm: 'Master Okonedo the botanist bought "a jar of growing-ichor" from the Warden last year and watered his prize specimens with it. They are now monsters. The jar (label: "from the deep, with care. A.V.") is the first hint of the titan\'s dream-ichor. A DC 17 Arcana check: the black ichor is alive, and it dreams.',
    doors: [[44, 33, 'w', 'closed']],
    windows: [[46, 29, 'n'], [50, 29, 'n'], [53, 32, 'e'], [53, 35, 'e'], [47, 37, 's']],
  });
  b.props_('ferns', [[45, 30], [52, 30], [46, 36]]).props_('mushroom-giant', [[49, 31], [51, 35]]).props_('flowers', [[47, 34], [50, 33]]).prop('workbench', 52, 36).prop('shelf-jars', 45, 36).prop('potion-shelf', 52, 33);
  b.encounter('Glasshouse specimens', [44, 29, 10, 9], [['shambling-mound', 2], ['awakened-tree', 2]], 'low');

  b.building('Provost\'s House', 5, 32, 13, 8, {
    mat: 'wood-planks',
    read: 'A warm, cluttered house of books, cats and cold tea. A tall woman in an inky gown paces the parlour, a letter crumpled in her fist.',
    gm: 'Provost Edwina Langmoor\'s home. She hires the heroes here (300 gp each, plus the Lyceum\'s gratitude). In her desk: the Warden\'s last letter to her, a month old, asking her to "give my key to whoever finds me, if I am found" (Edwina thought it was an old woman\'s gloom).',
    doors: [[11, 32, 'n', 'open'], [17, 35, 'e', 'closed']],
    windows: [[5, 35, 'w'], [8, 39, 's']],
  });
  b.wallRun(11, 32, 8, 'e');
  b.door(11, 36, 'e', 'open');
  b.props_('armchair', [[7, 34], [9, 34]]).prop('hearth-rug', 8, 35).prop('fireplace', 8, 32).prop('writing-desk', 15, 33).prop('bookshelf-tall', 16, 38).prop('rug-pelt', 13, 37).prop('bed', 6, 38).light(8, 33, 10, 15);
  b.area('The Undercroft stair', [[6, 40, 8, 1]], {
    read: 'Behind the Provost\'s House a stone stair goes down under an iron grate, into the dark under the Lyceum.',
    gm: 'The Provost has the key. The Undercroft is the old Lyceum, buried when the new one was built on top. It runs under the canal to the town side.',
  });
  b.prop('stairs-down', 9, 40);
  b.door(9, 41, 's', 'locked', 'door-iron');

  // ----- the Undercroft: old tombs and the culvert under the canal -----
  b.rock(0, 42, 26, 22);
  b.tunnel([[9, 42], [9, 50], [12, 56], [20, 58], [24, 60]], 2, { seed: 13, mat: 'dungeon-slab' });
  b.cave('Founders\' Ossuary', 6, 52, 5, 4, {
    seed: 14, mat: 'dungeon-slab',
    read: 'The bones of three hundred years of Provosts and masters, stacked in patient patterns: skulls, then thighbones, then skulls. Their names are written on their foreheads in faded ink.',
    gm: 'The honoured dead do not like visitors. Wights rise from the stacks, led by a wraith in a Provost\'s chain. A DC 16 Religion check and a respectful word stops them for a round; speaking the names of the dead Provosts (the bridge parapet lists them) stops them for good.',
  });
  b.props_('ossuary-shelf', [[3, 50], [3, 54], [9, 49]]).props_('skull-pile', [[4, 53], [8, 50]]).prop('candles', 6, 52).prop('sarcophagus-effigy', 7, 53).light(6, 52, 5, 10, '#9fd4ff');
  b.encounter('Ossuary dead', [2, 48, 9, 8], [['wight', 4], ['wraith', 1]], 'low');
  b.tunnel([[11, 45], [18, 45], [25, 45]], 2, { seed: 15, mat: 'dungeon-slab' });
  b.water(15, 45, 11, 2, false, true);
  b.area('The Old Culvert', [[11, 44, 15, 4]], {
    read: 'The canal goes underground here, through a vaulted brick tunnel. The water is knee-deep and thick. Things bump against your legs.',
    gm: 'A short cut between the Lyceum and the canal, and a hiding place: chuul and black puddings have grown fat on the Lyceum\'s waste. Students dare each other to walk it.',
  });
  b.prop('sewer-outflow', 24, 45).prop('bones-mud', 18, 46).prop('chains-hanging', 13, 45);
  b.encounter('Things in the culvert', [11, 44, 15, 4], [['chuul', 2], ['black-pudding', 2]], 'low');
  b.area('The Undercroft', [[9, 42, 3, 10], [12, 56, 12, 4]], {
    read: 'Low, vaulted halls of the old Lyceum, buried under the new. Chalk graffiti from five centuries of students: names, dates, rude drawings, and once, scratched deep, NINE LOCKS, ONE DOOR.',
    gm: 'Dark and quiet. The scratched words were carved by a young Aldreda as a student, a century ago (DC 18 History: the style of letters is that old).',
  });
  b.props_('pillar-broken', [[10, 47], [16, 57]]).prop('debris-wood', 19, 58).prop('cobweb-corner', 10, 43).prop('rune-stone', 22, 59);
  b.door(25, 60, 'e', 'secret');
  b.prop('gm-secret-door', 25, 60, 0, { gm: true });

  // ----- the town side -----
  b.paint(38, 48, 4, 32, 'stone-flagstone');
  b.area('Lamp Street', [[38, 48, 4, 32]], {
    read: 'A steep street of booksellers, copyists and coffee houses climbs from the city gate to the canal. Lamplighters on ladders are lighting the first lamps.',
    gm: 'The main street. The heroes arrive here. At night it is the only busy street in the quarter: a good place to lose a pursuer (or be lost).',
  });
  b.props_('lamp-post', [[37, 52], [42, 58], [37, 64], [42, 70], [37, 76]]).props_('market-stall', [[36, 55], [43, 61]]).prop('signpost', 42, 50).prop('cart', 36, 68, 90).prop('notice-board', 43, 74);
  for (const [x, y] of [[37, 52], [42, 58], [37, 64], [42, 70], [37, 76]]) b.light(x, y, 10, 20);
  b.area('The city gate', [[36, 76, 8, 4]], { read: 'The south gate of the Lyceum quarter, a squat arch hung with scholars\' banners.', gm: 'Where the heroes arrive. The guards are bored and polite.' });
  b.prop('banner-pole', 36, 77).prop('banner-pole', 43, 77).prop('hitching-post', 44, 78);
  b.start(38, 76, 3, 3);

  b.paint(26, 49, 34, 3, 'stone-flagstone');
  b.area('Alchemists\' Row', [[26, 49, 34, 3]], {
    read: 'Along the canal bank, a row of reeking little shops: alchemists, ink-makers, a seller of glass eyes. Coloured smoke curls from every chimney.',
    gm: 'Shopping. Potions of healing at the usual prices; one potion of greater healing per hero is for sale. An ink-maker sold Sabeth a bottle of left-hand ink ("dries slower, no smudging") for her mistress last month: proof the Warden wrote left-handed.',
  });
  b.props_('market-stall', [[28, 50], [34, 50], [46, 50], [52, 50], [57, 50]]).props_('alchemy-table', [[30, 51], [54, 51]]).props_('barrel', [[44, 51], [59, 49]]).prop('potion-rack', 49, 50);

  b.building('Dissection Theatre', 27, 55, 12, 10, {
    mat: 'stone-flagstone',
    read: 'Steep wooden galleries look down on a stone table under a skylight. The smell of vinegar and something worse. Behind a curtain, big shapes stand perfectly still under sheets.',
    gm: 'Master Ferrable, the anatomist, has been building flesh golems from the unclaimed dead "for science". He fled when he heard the Proctor was asking questions; the golems stayed. A DC 15 Medicine check here gets a professional opinion on the body from the tower: a woman of about twenty-five, not a woman over a hundred.',
    doors: [[32, 55, 'n', 'open', 'door-double'], [27, 60, 'w', 'closed']],
  });
  b.props_('bench-long', [[29, 57], [29, 62], [36, 57], [36, 62]], 90).prop('butcher-block', 33, 60).prop('cage', 37, 63).prop('skeleton-lying', 33, 59).prop('chandelier-wheel', 33, 58);
  b.encounter('The anatomist\'s work', [27, 55, 12, 10], [['flesh-golem', 3]], 'low');

  b.building('The Inkpot', 44, 53, 10, 8, {
    mat: 'wood-planks-dark',
    read: 'A low, smoky tavern full of argument. Every table has an ink-stained scholar shouting at another one. The landlord keeps a slate of debts that covers a whole wall.',
    gm: 'Gossip central. A man was asking after "the old warden\'s hours" three days ago: thin, quiet, folding a paper bird as he talked (Ferrin Vasko). He paid in sky-marks, the square silver coins of Lumenreach. The landlord kept one (proof).',
    doors: [[44, 56, 'w', 'open'], [48, 53, 'n', 'closed']],
    windows: [[53, 56, 'e'], [49, 60, 's']],
  });
  b.prop('bar-counter', 50, 55, 90).prop('keg-rack', 52, 54).props_('table-round', [[46, 55], [46, 58], [49, 58]]).prop('fireplace', 51, 59).prop('dartboard', 44, 59).prop('tavern-sign', 45, 52).light(51, 59, 10, 15).light(46, 57, 5, 10);

  b.building('Widow Marrable\'s lodgings', 56, 62, 11, 8, {
    mat: 'wood-planks',
    read: 'A narrow boarding house for poor students. The widow who runs it is wringing her apron: "Sabeth never misses rent. Never."',
    gm: 'Sabeth Strake\'s room. Her travel bag is still under the bed, packed, with her purse in it: she did not "go home". Her letters to her mother speak of the Warden\'s "new coldness" and "the key she says I will carry for her one day". A DC 14 Investigation finds her diary: "She asked me to wear her coat for the portrait painter tomorrow. We are the same height, she says."',
    doors: [[56, 65, 'w', 'open']],
    windows: [[66, 64, 'e'], [60, 69, 's']],
  });
  b.wallRun(61, 62, 8, 'e');
  b.door(61, 66, 'e', 'closed');
  b.props_('bed', [[58, 63], [64, 63]]).prop('trunk', 65, 68).prop('writing-desk', 63, 66).prop('washbasin', 57, 68).prop('stool', 59, 66);

  b.building('Lock-keeper\'s house', 68, 50, 8, 6, {
    mat: 'wood-planks',
    read: 'A squat stone house beside the lock, with a winch-wheel bigger than its door.',
    gm: 'The lock-keeper is bound and gagged in his own cellar: Ferrin\'s hired men took the house as their bolt-hole. The winch opens and shuts the lock gates (an action each).',
    doors: [[71, 50, 'n', 'closed']],
    windows: [[75, 52, 'e']],
  });
  b.prop('winch', 70, 52).prop('bed', 74, 54).prop('table-square', 72, 53).prop('rope-coil', 69, 54);
  b.floor(66, 44, 1, 4, 'wood-planks').floor(72, 44, 1, 4, 'wood-planks');
  b.water(67, 44, 5, 4, true);
  b.area('The Inkwater Lock', [[64, 42, 12, 6]], {
    read: 'Two great wooden gates hold back the canal where it drops to the river. Narrow plank walks run along their tops. Below, the water churns white.',
    gm: 'Ferrin\'s escape route: a skiff waits below the far gate. Fighting on the gate walks: anyone hit by a push or a critical makes a DC 15 Strength save or falls into the lock (deep, churning: DC 16 Athletics to climb out). Opening the gates with the winch floods the lower basin and sweeps the skiff away.',
  });
  b.props_('portcullis', [[66, 45], [72, 46]]).prop('rowboat', 74, 46, 90).props_('mooring-post', [[73, 43], [65, 48]]).prop('lantern-standing', 64, 43).light(64, 43, 10, 20);
  b.encounter('The Inkwater Lock', [62, 42, 16, 14], [['assassin', 1], ['mage', 2], ['invisible-stalker', 2], ['veteran', 2]], 'high');

  b.building('Ropewalk warehouse', 60, 72, 19, 7, {
    mat: 'wood-planks-dark',
    read: 'A warehouse a hundred feet long, where rope is twisted on a long walk of spinning hooks. Coils of hemp hang everywhere like sleeping snakes.',
    gm: 'Ferrin\'s hideout, in the loft at the east end. His crew of hired blades lives here. In the loft: hundreds of folded paper birds, a sending stone (its partner is with Aldreda; she never speaks, only writes), 600 sky-marks, and his list of names.',
    doors: [[60, 75, 'w', 'closed'], [69, 72, 'n', 'closed']],
    windows: [[64, 78, 's'], [74, 78, 's']],
  });
  b.wallRun(73, 72, 7, 'w');
  b.door(73, 75, 'w', 'locked');
  b.props_('rope-coil', [[62, 74], [66, 76], [70, 73]]).props_('spinning-wheel', [[63, 76], [68, 74]]).props_('crate-stack', [[61, 77], [71, 77]]).prop('hammock', 76, 74).prop('desk', 75, 77).prop('strongbox', 77, 73).prop('lantern-hanging', 67, 75).light(67, 75, 10, 15);
  b.encounter('Ropewalk crew', [60, 72, 19, 7], [['gladiator', 4], ['veteran', 4]], 'moderate');

  b.building('Proctor\'s House', 6, 66, 13, 8, {
    mat: 'stone-flagstone',
    read: 'The Lyceum\'s own watch-house: a front office, a cell with one drunk student in it, and a wall of notices about curfew.',
    gm: 'Proctor Rosamel Fyle\'s office. She keeps the body here after it comes down from the tower. With her blessing the heroes can examine it at leisure (the Medicine clues), and she will lend six proctors (guards) for the chase.',
    doors: [[18, 69, 'e', 'open']],
    windows: [[10, 66, 'n']],
  });
  b.wallRun(6, 70, 6, 's');
  b.door(9, 70, 's', 'closed', 'door-iron');
  b.prop('desk', 14, 68).prop('notice-board', 17, 67).prop('cot', 8, 72).prop('weapon-rack', 7, 67).prop('coffin', 15, 72).light(14, 68, 10, 10);
  b.paint(20, 68, 16, 10, 'stone-flagstone');
  b.area('Candle Market', [[20, 68, 16, 10]], {
    read: 'A cramped square of candle sellers and paper merchants, quiet after dark except for the cats.',
    gm: 'A good place for the heroes to set a trap or to lose a tail. By day, a paper merchant remembers Ferrin buying "the good folding paper, the thin stuff".',
  });
  b.props_('market-stall', [[22, 70], [27, 70], [32, 70], [24, 75]]).prop('fountain', 28, 73).props_('candle-stand-tall', [[21, 77], [34, 77]]).prop('crate-pile', 33, 75).light(28, 73, 10, 15);

  // ----- the Clock Observatory and the slate roofs -----
  b.building('Clock Observatory', 58, 3, 16, 14, {
    mat: 'wood-planks',
    read: 'A dome of copper and glass over a telescope as long as a ship\'s mast. Every wall is clocks: hundreds of them, all ticking, all showing a different time.',
    gm: 'Home of Cuthwin Gaunt, the Bellwarden: another warden of the order, old and half-retired, keeper of the Seventh Key (now useless). He is murdered here at midnight on the first night, unless the heroes come first. His two shield guardians obey his amulet; Ferrin steals the amulet and orders them to kill whoever comes in.',
    doors: [[65, 16, 's', 'closed', 'door-double'], [58, 9, 'w', 'closed']],
    windows: [[73, 6, 'e'], [73, 12, 'e'], [61, 3, 'n'], [69, 3, 'n']],
  });
  b.prop('telescope', 66, 8).prop('orrery', 62, 12).prop('astrolabe-stand', 70, 11).prop('globe-great', 61, 6).props_('wall-shelves', [[71, 4], [59, 14]]).prop('desk', 68, 14).prop('crystal-lamp', 65, 10).light(65, 10, 15, 20, '#cfe8ff');
  b.encounter('The Bellwarden\'s guardians', [58, 3, 16, 14], [['shield-guardian', 2]], 'low');
  b.building('The Bellwarden\'s rooms', 74, 4, 5, 8, {
    mat: 'wood-planks',
    read: 'A tiny bedroom crammed with clock parts and bottles of cheap brandy.',
    gm: 'Cuthwin\'s papers: a letter from the Primarch, years old, telling him to "speak to no one about the Seventh. It is under control." And a map of the glacier road to the Stillhold.',
    doors: [[74, 7, 'w', 'closed']],
  });
  b.prop('bed', 77, 5).prop('workbench', 76, 10).prop('chest', 75, 9);

  b.area('Observatory Lane', [[55, 0, 2, 44]], { read: 'A dark lane between the Lyceum wall and the backs of tall houses.', gm: 'Ferrin\'s hired men watch it on the night of the second murder.' });
  b.props_('lamp-post', [[56, 18], [56, 35]]).prop('barrel-group', 55, 28).light(56, 18, 10, 15).light(56, 35, 10, 15);
  // roofs: blocks of slate with alleys (drops) between them and a few planks across
  for (const [x, y, w, h] of [[57, 19, 6, 6], [64, 19, 6, 6], [71, 19, 6, 6], [57, 26, 6, 6], [64, 26, 6, 6], [71, 26, 6, 6], [57, 33, 6, 6], [64, 33, 6, 6], [71, 33, 6, 6]]) b.floor(x, y, w, h, 'wood-planks-dark');
  b.pit(63, 19, 1, 21).pit(70, 19, 1, 21).pit(57, 25, 21, 1).pit(57, 32, 21, 1).pit(77, 19, 3, 21);
  for (const [x, y] of [[63, 21], [70, 23], [60, 25], [74, 25], [63, 29], [67, 32], [70, 35], [59, 32], [63, 37], [74, 32]]) b.floor(x, y, 1, 1, 'wood-planks');
  b.paint(57, 39, 20, 3, 'stone-cobble');
  b.area('The slate roofs', [[57, 19, 20, 20]], {
    read: 'Wet slate, chimney stacks and drops into black alleys. Moonlight on the roofs; far below, a dog barking. Somewhere ahead, a figure in grey runs light as a cat.',
    gm: 'The chase. Run it as a race of five rounds: each round each hero makes one check (Athletics to leap an alley, Acrobatics on wet slate, DC 15; Perception DC 15 to keep sight of him). Planks cross some alleys (no check). A failure loses ground or drops you 30 feet into the alley (3d6). Ferrin\'s hired mages and gladiators wait on the far roofs to slow pursuers.',
  });
  b.props_('crate', [[59, 21], [74, 28]]).props_('barrel', [[66, 35], [60, 29]]).props_('lantern-hook', [[67, 22], [73, 36]]).props_('banner-pole', [[58, 37]]).prop('crumbling-ledge', 68, 30).prop('ladder', 75, 37);
  b.encounter('Rooftop knives', [57, 19, 20, 20], [['mage', 3], ['gladiator', 2]], 'moderate');

  // street dressing all round
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(r() * 78) + 1, y = Math.floor(r() * 78) + 1;
    if (b.cellAt(x, y) === 1 && (y < 2 || (y > 41 && y < 44) || (x < 4 && y < 40) || (y > 60 && x < 5))) b.prop(r() < 0.5 ? 'barrel' : 'crate', x, y);
  }
  b.props_('lamp-post', [[2, 10], [2, 30], [20, 0], [45, 0], [60, 42], [75, 60]]).props_('tree-birch', [[2, 22], [40, 42], [76, 64]]).prop('cart', 77, 58);
  return b.build();
}

// ---------- Part 2: the Stillhold, the wardens' fortress inside a glacier (level 12) ----------
function stillhold() {
  const b = new MapBuilder('adv-nsl-stillhold', 'The Stillhold in the Greyfang glacier', 80, 80, { theme: 'cave', wallStyle: 'stone', ambient: 'dark', floor: 'ice' });
  const r = rng(9202);

  // ----- the glacier tongue outside, with crevasses -----
  b.cave('The glacier tongue', 40, 72, 34, 6, {
    seed: 21, mat: 'ice',
    read: 'A river of blue ice spills out of the mountain under a white sky. Wind screams over it, throwing snow like sand. Ahead, cut into the glacier\'s face, a gate the height of six men hangs open, one door torn off its hinges.',
    gm: 'Outside, in the open: the cold is extreme (SRD extreme cold). Crevasses cross the tongue under thin snow bridges: a DC 15 Survival check spots each one; a hero who falls takes 4d6 and needs a DC 15 Athletics check to climb out. Huge footprints and the drag-marks of a dragon\'s tail lead to the gate.',
  });
  b.pit(24, 70, 1, 5).pit(25, 74, 4, 1).pit(52, 68, 1, 4).pit(53, 71, 5, 1).pit(62, 73, 1, 4);
  b.props_('snowdrift', [[12, 73], [20, 74], [33, 75], [47, 76], [58, 69], [68, 74]]).props_('ice-block', [[17, 70], [44, 69], [64, 74]]).props_('boulder-large', [[30, 69], [56, 76]]).prop('skeleton-lying', 36, 73).prop('banner-pole', 37, 68).prop('campfire-cold', 15, 75);
  b.start(10, 72, 3, 3);

  // ----- the broken gate and the Hall of Nine Keys -----
  b.hall(39, 64, 39, 68, 2, { mat: 'dungeon-slab' });
  b.door(39, 64, 's', 'open', 'door-broken').door(40, 64, 's', 'open', 'door-broken');
  b.room('The Broken Gate', 34, 56, 12, 9, {
    mat: 'dungeon-slab',
    read: 'A gate-hall carved from the glacier and faced with black stone. The great doors were smashed inward. Frozen in the ice of the floor: blood, a warden\'s sword, and a footprint four feet long.',
    gm: 'The giants came in here a month ago. They did not break the gate from outside: the bar was lifted from inside first (DC 15 Investigation: the bar lies neatly on its brackets, undamaged). A frost giant and its wolves keep watch now; they are bored and cold and will trade passage for meat and gold (DC 17 Persuasion).',
  });
  b.props_('statue-knight', [[35, 57], [44, 57]]).props_('brazier', [[36, 62], [43, 62]]).prop('door-broken', 38, 60).prop('magic-sword', 41, 59).prop('blood-pool', 40, 58).prop('bones', 36, 59);
  b.light(36, 62, 10, 15).light(43, 62, 10, 15);
  b.encounter('Giants at the gate', [34, 56, 12, 9], [['frost-giant', 1], ['dire-wolf', 4]], 'low');
  b.hall(39, 50, 39, 55, 2, { mat: 'dungeon-slab' });
  b.door(39, 52, 's', 'open', 'door-double').door(40, 52, 's', 'open', 'door-double');
  b.cave('Hall of Nine Keys', 40, 45, 12, 7, {
    seed: 31, mat: 'stone-flagstone', wobble: 0.04,
    read: 'A vast hall with a vaulted roof of clear blue ice. Nine stone wardens stand in a ring, each holding out a stone key. Eight of the statues are cracked through from crown to foot. The ninth is whole.',
    gm: 'The heart of the order. Each statue cracked on the day its seal broke, and the order quietly repaired the cracks with plaster and paint (DC 13 Investigation: fresh plaster, painted to look like stone). The plaster has fallen off now. An ice devil sits on the Primarch\'s chair at the far end, holding the frost giants\' contract. It will happily talk: it wants the contract fulfilled or a better one.',
  });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.prop(i === 8 ? 'statue-tall-robed' : 'pillar-broken', Math.round(40 + Math.cos(a) * 8), Math.round(45 + Math.sin(a) * 5));
  }
  b.prop('throne', 40, 39).prop('magic-circle', 40, 45).props_('banner-hanging-tall', [[34, 40], [46, 40]]).props_('brazier-everburning', [[32, 49], [48, 49]]).prop('ice-block', 34, 49);
  b.light(32, 49, 15, 20, '#9fd4ff').light(48, 49, 15, 20, '#9fd4ff').light(40, 45, 10, 15, '#bfe3ff');
  b.encounter('The devil on the chair', [28, 38, 24, 15], [['ice-devil', 1], ['ice-mephit', 4]], 'moderate');

  // ----- the west wing: barracks, refectory, forge, and the ice crypts -----
  b.tunnel([[22, 45], [25, 46], [28, 45]], 1, { seed: 32, mat: 'ice' });
  b.rubble(31, 48, 2, 2).rubble(47, 41, 2, 2).rubble(9, 43, 2, 1).rubble(66, 47, 2, 2).rubble(18, 22, 2, 2);
  b.ice(20, 30, 2, 5).ice(56, 45, 2, 1);
  b.door(28, 45, 'w', 'closed').door(22, 45, 'w', 'closed');
  b.room('Barracks of the Watch', 8, 40, 14, 10, {
    mat: 'dungeon-slab',
    read: 'Rows of narrow bunks, every one stripped. Three frost giants have shoved the bunks against the walls and sleep on a mound of wardens\' cloaks, their polar bears curled at their feet.',
    gm: 'The giants sleep through quiet (Stealth DC 13 against their passive Perception). If woken they fight. A breach in the south wall (the giants\' own back way) leads down the Crevasse run to the Frozen falls.',
  });
  b.props_('bunk-bed', [[9, 41], [12, 41], [15, 41], [18, 41], [9, 48], [12, 48]]).props_('footlocker', [[20, 42], [20, 46]]).prop('rug-pelt', 14, 45).prop('weapon-rack', 21, 40).prop('fire-bowl', 16, 44).light(16, 44, 10, 15);
  b.encounter('Barracks of the Watch', [8, 40, 14, 10], [['frost-giant', 3], ['polar-bear', 2]], 'moderate');
  b.hall(14, 37, 14, 39, 1, { mat: 'dungeon-slab' });
  b.door(14, 36, 's', 'closed').door(14, 39, 's', 'closed');
  b.room('Refectory', 8, 28, 14, 9, {
    mat: 'stone-flagstone',
    read: 'Two frost giants sit on the wardens\' long tables as if they were benches, roasting a whole yak in the great hearth and arguing about who gets the head.',
    gm: 'The giants here are the jarl\'s cousins, sour that the jarl keeps the best plunder. Bribed (300 gp, or a good weapon) or flattered (DC 16 Persuasion), they tell the heroes the jarl was "let in by a little grey woman with a key who came out of the shining circle" and that the white wyrm sleeps in the gallery at the top.',
  });
  b.props_('table-long', [[11, 31], [11, 34]], 90).prop('hearth-grand', 15, 28).prop('campfire-spit', 15, 29).props_('barrel-group', [[20, 29], [20, 35]]).prop('bones', 18, 33).light(15, 29, 15, 25, '#ff9a4a');
  b.encounter('The feast in the refectory', [8, 28, 14, 9], [['frost-giant', 2]], 'low');
  b.hall(13, 25, 13, 27, 1, { mat: 'dungeon-slab' });
  b.door(13, 24, 's', 'closed').door(13, 27, 's', 'closed');
  b.room('The cold forge', 8, 16, 12, 9, {
    mat: 'dungeon-slab',
    read: 'An anvil of black iron stands on a dead forge. Racks of half-finished keys line the walls: thousands of them, every one a different shape.',
    gm: 'The order\'s key-smiths forged practice keys here for centuries, trying to make a tenth key that could re-forge a broken seal. They never managed. A DC 18 Arcana check on the smith\'s notes: "Only the Ninth can re-forge, by turning backward, and the turning would consume it." (Remember this for Part 5.)',
  });
  b.prop('anvil', 13, 20).prop('forge', 11, 17).props_('tool-wall', [[9, 16], [18, 16]]).props_('weapon-rack', [[9, 23], [18, 23]]).prop('grindstone', 16, 21).prop('workbench', 17, 18).prop('key-ring', 13, 21);
  b.hall(13, 12, 13, 15, 1, { mat: 'ice' });
  b.door(13, 15, 's', 'closed', 'door-iron');
  b.cave('The ice crypts', 14, 7, 9, 4, {
    seed: 22, mat: 'ice',
    read: 'Wardens of a thousand years lie frozen in the walls, each in a niche of clear ice, eyes open, keys on their chests. Your breath hangs in the air. Some of the eyes follow you.',
    gm: 'The honoured dead of the order. The cover-up woke the oldest of them: they rise as wights led by two wraiths, furious at "the shame of the Quiet". A hero who swears aloud to tell the truth of the broken seals (and means it: DC 15 Insight from the GM\'s side, or a paladin\'s oath) makes them stand aside and bow.',
  });
  b.props_('tomb-niche', [[7, 5], [10, 4], [18, 4], [21, 6], [8, 9], [20, 9]]).props_('sarcophagus', [[12, 8], [16, 8]]).prop('candle-ring', 14, 6).props_('ice-block', [[8, 6], [20, 7]]).light(14, 6, 10, 15, '#9fd4ff');
  b.encounter('The honoured dead', [5, 3, 19, 9], [['wraith', 2], ['wight', 6]], 'low');
  b.tunnel([[22, 6], [28, 5], [34, 8]], 2, { seed: 23, mat: 'ice' });

  // ----- the natural west side: frozen falls and the crevasse run -----
  b.cave('The frozen falls', 14, 58, 7, 5, {
    seed: 24, mat: 'ice',
    read: 'A waterfall froze mid-fall into a curtain of blue ice twenty feet high. Behind it, a cave glitters. Something big has been sliding down the ice for fun: the floor is polished and scored with claw marks.',
    gm: 'Two young white dragons, the white wyrm\'s brood, play here with their pet ice mephits. They are vain and greedy; flattering them or tossing them treasure (100 gp each) keeps them busy. Behind the frozen curtain, a dead warden\'s pack (see treasure).',
  });
  b.props_('ice-block', [[9, 56], [19, 60]]).prop('frozen-pond', 14, 59).prop('crystal-cluster', 11, 61).prop('backpack', 18, 55).prop('stalactites', 15, 55);
  b.encounter('Wyrmlings at the falls', [7, 53, 15, 11], [['young-white-dragon', 2], ['ice-mephit', 4]], 'low');
  b.tunnel([[14, 62], [13, 67]], 2, { seed: 25, mat: 'ice' });
  b.tunnel([[15, 54], [16, 51], [15, 49]], 2, { seed: 26, mat: 'ice' });
  b.area('The crevasse run', [[14, 50, 3, 4]], { read: 'A crack in the glacier, just wide enough to squeeze through sideways, climbing toward voices.', gm: 'The giants\' back door into the barracks. A DC 12 Athletics check per hero to climb; a failure makes noise.' });

  // ----- the north: the circle chamber, the Bell of Quiet -----
  b.room('The circle chamber', 32, 24, 16, 10, {
    mat: 'marble',
    read: 'A round chamber of white marble. In the floor, a teleportation circle glows faintly, its silver lines still warm. On a lectern beside it, a heavy book lies open.',
    gm: 'The order\'s permanent circle, linked to circles in the homes of every warden (including the Star Room). The lectern book is the arrivals log: every arrival writes itself in. The last entry, on the night of Aldreda\'s "murder": "Arrived: the Ninth Key." Nothing after. The Primarch believes the murderer stole the key and came through; sharp players may think otherwise.',
  });
  b.prop('magic-circle', 40, 28).prop('teleport-pad', 40, 29).prop('lectern', 36, 26).props_('sconce-magefire', [[33, 25], [46, 25], [33, 32], [46, 32]]).props_('column-fluted', [[34, 28], [45, 28]]);
  b.light(40, 28, 15, 20, '#bfe3ff');
  b.hall(39, 34, 39, 37, 2, { mat: 'dungeon-slab' });
  b.door(39, 37, 's', 'closed', 'door-double').door(40, 37, 's', 'closed', 'door-double');
  b.cave('The Bell of Quiet', 40, 9, 7, 6, {
    seed: 27, mat: 'dungeon-slab', wobble: 0.05,
    read: 'A round tower room under a bronze bell so big it fills the roof. The door was barricaded with tables. Behind them, a white-haired man in a tattered robe holds a staff, and a young novice holds a kitchen knife.',
    gm: 'The last of the Stillhold: Primarch Oswin Haverleigh and Novice Ebbe Brume, hiding for a month on stored food, kept safe by the bell (ringing it stuns creatures within 60 feet: DC 16 Constitution save or stunned until the end of their next turn; once per hour). Oswin confesses the cover-up here if pressed (DC 15 Intimidation or Persuasion, or the Book of Quiet in hand).',
  });
  b.prop('temple-bell', 40, 9).props_('barricade-wood', [[39, 13], [40, 13]]).props_('bedroll', [[36, 7], [44, 8]]).prop('supplies', 37, 12).prop('candles', 43, 11).light(43, 11, 10, 15);
  b.hall(39, 15, 39, 23, 2, { mat: 'dungeon-slab' });
  b.door(39, 23, 's', 'locked', 'door-iron').door(40, 23, 's', 'locked', 'door-iron');
  b.area('The bell stair', [[39, 16, 2, 7]], { read: 'A straight stair of worn steps up to the bell tower. The door at the top is barred, and someone has written on it in chalk: GO AWAY.', gm: 'Knocking and naming the order gets the door opened.' });

  // ----- the east wing: scriptorium, the Archive of Quiet, the Primarch's rooms, the golem vault -----
  b.hall(52, 45, 57, 45, 1, { mat: 'dungeon-slab' });
  b.door(52, 45, 'w', 'closed').door(57, 45, 'e', 'closed');
  b.room('Scriptorium', 58, 40, 13, 10, {
    mat: 'wood-planks-dark',
    read: 'Copying desks under frozen lamps. Ink has frozen in the pots. Every desk holds the same thing: a page of the same reassuring report, copied over and over. "The Seals stand. The Order watches. All is well."',
    gm: 'The order\'s propaganda mill: those reports went every year to the kingdoms and to the Concord of Lumenreach, which paid a great tithe for the order\'s watch. A DC 15 Investigation notices a cold draught from behind the tallest bookcase: a secret door to the Archive of Quiet. A glyph trap on the door (DC 16 Arcana to see): 6d8 cold, DC 16 Dexterity half.',
  });
  b.props_('writing-desk', [[60, 42], [63, 42], [66, 42], [60, 46], [63, 46], [66, 46]]).props_('bookshelf-tall', [[69, 41], [69, 44]]).prop('scroll-pile', 64, 48).prop('lamp-table', 62, 44).prop('glyph-trap', 70, 44, 0, { gm: true });
  b.hall(71, 44, 72, 44, 1, { mat: 'dungeon-slab' });
  b.door(71, 44, 'w', 'secret');
  b.room('The Archive of Quiet', 73, 40, 6, 10, {
    mat: 'dungeon-slab',
    read: 'A narrow room lined with iron cabinets, each locked, each labelled with a number from one to eight. A single book lies chained to a desk.',
    gm: 'The truth. Each cabinet holds the reports of one broken seal: dates, deaths, quakes, and the cover story told instead. The chained book is the Book of Quiet (handout). A hidden trapdoor in the floor (DC 15 Perception) drops to the under-ice lake: the order\'s emergency exit.',
  });
  b.props_('cabinet-glass', [[74, 41], [77, 41], [74, 45], [77, 45]]).prop('desk', 75, 47).prop('chains-hanging', 76, 47).prop('trapdoor', 75, 49).prop('gm-secret-door', 71, 44, 0, { gm: true });
  b.hall(75, 50, 75, 52, 1, { mat: 'ice' });
  b.room('Primarch\'s quarters', 58, 28, 12, 8, {
    mat: 'wood-planks',
    read: 'A comfortable study, ransacked. Letters everywhere. A portrait of nine wardens hangs crooked over the fireplace; someone has slashed out the face of one of them.',
    gm: 'Oswin\'s rooms. The giants were looking for the Primarch. The slashed face in the portrait is Aldreda\'s: Oswin did it himself in a rage years ago, after she called the Quiet "a lie that will drown the world". Letters from the Concord thank the order for its reports and ask, more and more sharply, for "the Ninth Warden\'s cooperation regarding the deep supply".',
  });
  b.prop('fireplace', 63, 28).prop('writing-desk', 60, 30).prop('bed-four-poster', 67, 33).prop('armchair', 64, 31).prop('tapestry-tall', 59, 34).props_('scroll-pile', [[61, 33], [66, 30]]).light(63, 29, 10, 15);
  b.hall(63, 36, 63, 39, 1, { mat: 'dungeon-slab' });
  b.door(63, 35, 's', 'closed').door(63, 39, 's', 'closed');
  b.hall(63, 23, 63, 27, 1, { mat: 'dungeon-slab' });
  b.door(63, 22, 's', 'closed', 'door-iron').door(63, 27, 's', 'closed');
  b.room('The golem vault', 58, 14, 12, 9, {
    mat: 'dungeon-slab',
    read: 'Two stone giants in warden grey stand in alcoves on either side of a sealed iron door. Their eyes open as you enter.',
    gm: 'The order\'s guardians, keyed to obey whoever holds a warden\'s key. The Ninth Key commands them... but Aldreda used it here first and gave them one standing order: "Kill anyone who comes looking for the Primarch." Holding up the key gives the golems pause for one round (no more). Behind the iron door: the order\'s treasury.',
  });
  b.props_('statue-tall-knight', [[59, 15], [68, 15]]).props_('chest', [[60, 21], [67, 21]]).prop('coin-stacks', 63, 15).prop('lantern-wall', 63, 18);
  b.encounter('The golem vault', [58, 14, 12, 9], [['stone-golem', 2]], 'moderate');
  b.hall(63, 10, 63, 13, 1, { mat: 'ice' });
  b.door(63, 13, 's', 'closed', 'door-iron');

  // ----- the white wyrm's gallery -----
  b.cave('The white wyrm\'s gallery', 64, 6, 13, 5, {
    seed: 28, mat: 'ice',
    read: 'The top of the fortress opens into a gallery of the glacier itself: a cathedral of ice, light falling blue through a roof as clear as glass. On a heap of frozen gold and broken keys lies a white dragon, and beside her stands a frost giant in a crown of icicles.',
    gm: 'The climax. Vhessrin, the white wyrm, and Jarl Ottar Skallgrim with his two housecarls. Aldreda promised them the Stillhold\'s treasure and "the warm lands below, when the old one wakes". The jarl talks first; the dragon does not. Shown the arrivals log or Aldreda\'s note and told they were used, the jarl may withdraw (DC 18 Persuasion), leaving the dragon alone (a moderate fight).',
  });
  b.prop('dragon-hoard', 66, 6).props_('ice-block', [[56, 4], [72, 8]]).props_('crystal-spire', [[56, 8], [74, 6]]).prop('throne', 60, 5).prop('treasure-pile', 69, 4).light(64, 6, 20, 30, '#cfe8ff');
  b.encounter('The white wyrm\'s gallery', [51, 1, 27, 11], [['adult-white-dragon', 1], ['frost-giant', 2]], 'high');
  b.hall(46, 8, 52, 8, 1, { mat: 'ice' });

  // ----- the under-ice lake, the order's back door -----
  b.cave('The under-ice lake', 66, 57, 11, 5, {
    seed: 29, mat: 'ice',
    read: 'A cave of black water under a roof of ice so thin you can see the sky through it as a pale blue glow. A narrow shelf runs round the edge. Something huge and clear moves under the surface.',
    gm: 'Water elementals guard the lake, set here by the order centuries ago. They attack anyone who does not show a warden\'s key or say the order\'s password ("Nine and one"). Oswin or Ebbe know it. The shelf is slippery: DC 12 Acrobatics or fall in (deep, freezing: 2d6 cold per round).',
  });
  b.pool(66, 57, 7, 3, true);
  b.props_('ice-thin', [[60, 55], [72, 59]]).props_('stalactites-tall', [[58, 56], [74, 56]]).prop('rowboat', 62, 59).prop('ladder', 70, 54);
  b.encounter('Under the ice', [55, 52, 23, 11], [['water-elemental', 3]], 'low');
  b.tunnel([[62, 61], [60, 66]], 2, { seed: 30, mat: 'ice' });

  for (let i = 0; i < 10; i++) {
    const x = Math.floor(r() * 70) + 5, y = 66 + Math.floor(r() * 12);
    if (b.cellAt(x, y) === 1) b.prop(r() < 0.6 ? 'snowdrift' : 'ice-block', x, y);
  }
  return b.build();
}

// ---------- Part 3: the Hushdeep, where the titan's dreams leak into the dark (level 13-14) ----------
function hushdeep() {
  const b = new MapBuilder('adv-nsl-hushdeep', 'The Hushdeep', 80, 80, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor' });
  const r = rng(9303);

  // ----- the Long Stair and the dead warden outpost -----
  b.cave('The Long Stair', 5, 6, 3, 4, {
    seed: 31, mat: 'dungeon-slab',
    read: 'The warden stair ends after three days of steps, at a landing worn smooth by a thousand years of boots. Below, the dark is warm, and it hums: a sound too low to hear, that you feel in your teeth.',
    gm: 'The order\'s secret way down to the Eighth Seal. The hum is the titan\'s dreaming. Each long rest in the Hushdeep, every hero makes a DC 15 Wisdom save or dreams the titan\'s dream (see the scene "The dream of the key").',
  });
  b.prop('stairs-up', 4, 3).prop('lantern-standing', 6, 7).prop('supplies', 3, 8).light(6, 7, 10, 15);
  b.start(4, 5, 2, 3);
  b.hall(7, 6, 10, 6, 1, { mat: 'dungeon-slab' });
  b.room('The dead outpost', 10, 3, 10, 7, {
    mat: 'dungeon-slab',
    read: 'A warden watch-post built into the rock: bunks, a cold stove, a signal mirror pointing down the dark. The wardens are still here. They sit at their posts, grey and dry, and when you step in, they turn their heads.',
    gm: 'The six wardens of the Eighth Seal died here a year ago, when their seal broke. The order never came. Three of them rose as wraiths, bitter at being forgotten. Telling them the Primarch hid their deaths (or showing the Book of Quiet) turns their anger elsewhere: they let the heroes pass and whisper "find the one with the key in her heart".',
  });
  b.props_('bunk-bed', [[11, 4], [11, 8]]).prop('stove', 15, 4).prop('table-square', 15, 6).props_('skeleton-seated', [[14, 6], [16, 6], [18, 8]]).prop('magic-mirror', 18, 4).prop('weapon-rack', 12, 9);
  b.encounter('The dead watch', [10, 3, 16, 7], [['wraith', 3]], 'low');
  b.door(20, 6, 'w', 'closed');
  b.room('The outpost records', 20, 3, 6, 7, {
    mat: 'dungeon-slab',
    read: 'A tiny office. The captain\'s log lies open on the desk, the ink of the last line smeared where her hand slid off the page.',
    gm: 'The last entries: the Hushfolk getting "strange in their sleep", a Concord barge-party come down "with writs from the Primarch himself" to buy black ichor from the cave-folk, and on the last day: "The seal is singing. Wardens, to your posts." Treasure in the strongbox.',
  });
  b.prop('desk', 22, 5).prop('chair', 22, 4).prop('strongbox', 24, 8).prop('map-cabinet', 25, 4).prop('candles', 23, 5);

  // ----- the Glimmerwood: a forest of giant fungus -----
  b.tunnel([[16, 10], [20, 14], [24, 15]], 2, { seed: 32 });
  b.cave('The Glimmerwood', 34, 16, 12, 8, {
    seed: 33, mat: 'dirt',
    read: 'A forest under the earth: mushrooms as tall as oaks, their caps glowing green and violet, dropping spores like slow snow. The stems have faces. Not carved faces. Grown ones.',
    gm: 'The titan\'s dreams have reached the fungus, which grows in the shapes of what it overhears. The "stalagmites" among the stems are ropers; violet fungus lurks in the undergrowth. Walking quietly on the soft path (DC 15 Stealth as a group) slips past. The faces in the stems whisper fragments of the Hushfolk\'s dreams: "the grey lady sells our sleep", "the sky-men drink it".',
  });
  b.props_('mushroom-giant', [[26, 12], [30, 20], [38, 10], [42, 19], [34, 22], [28, 15]]).props_('glowing-fungus', [[32, 13], [37, 17], [40, 14], [27, 18]]).props_('mushrooms', [[33, 19], [44, 15], [29, 11]]).props_('stalagmites', [[36, 13], [31, 17], [38, 20]]).prop('ferns', 35, 15);
  for (const [x, y] of [[32, 13], [37, 17], [40, 14], [27, 18]]) b.light(x, y, 5, 15, '#7dff9a');
  b.encounter('Glimmerwood ropers', [24, 10, 20, 12], [['roper', 3], ['violet-fungus', 4]], 'low');

  // ----- the hall of stone sleepers, between the wood, the choir and the lake -----
  b.tunnel([[30, 22], [29, 26]], 2, { seed: 54 });
  b.cave('The hall of stone sleepers', 28, 31, 8, 5, {
    seed: 55, mat: 'cave-floor',
    read: 'Dozens of Hushfolk stand in this cave, turned to grey stone, every one with eyes closed and arms raised as if reaching for something above them. Their stone faces are smiling.',
    gm: 'Villagers who dreamed of the titan waking and were turned to stone by the joy of it. Touching one gives a flash of the dream: a grey woman with a brass key standing in a vast round vault, and a voice saying "come home, little heart". A DC 15 Arcana check: the stone is the titan\'s own substance. A cleric\'s greater restoration frees one (a grateful villager who knows the worm roads).',
  });
  b.props_('statue', [[24, 29], [27, 28], [31, 29], [33, 32], [25, 33], [29, 34], [30, 31]]).props_('rubble-pile', [[22, 31], [34, 30]]).prop('crystal-cluster', 28, 31).light(28, 31, 5, 10, '#d8c8ff');
  b.tunnel([[22, 33], [18, 37]], 2, { seed: 56 });
  b.tunnel([[35, 33], [40, 37]], 2, { seed: 57 });

  // ----- the black seep, where ichor bleeds from the seal toward the lake -----
  b.cave('The black seep', 72, 28, 5, 4, {
    seed: 58, mat: 'mud',
    read: 'A side cave where the walls weep black. The ichor pools in the hollows, slowly turning, and when you look into it you see somebody else\'s memories: a sky full of floating towers, a coin changing hands, a key.',
    gm: 'Raw dream-ichor. Touching it bare-handed: DC 15 Constitution save or 3d10 psychic and a vision of Lumenreach (the floating city the ichor is sold to). A sealed flask of it is worth 500 gp to any wizard (and is evidence).',
  });
  b.tunnel([[66, 28], [69, 28]], 2, { seed: 59 });
  b.props_('acid-pool', [[71, 27], [74, 29]]).prop('oil-slick', 72, 30).prop('stalagmites', 75, 26).light(72, 28, 5, 10, '#8a6aff');

  // ----- the Choir of Mouths -----
  b.tunnel([[12, 9], [9, 18], [10, 26], [12, 31]], 2, { seed: 34 });
  b.cave('The Choir of Mouths', 12, 37, 7, 6, {
    seed: 35, mat: 'cave-floor',
    read: 'Singing. Dozens of voices, none of them in tune, all of them coming from the walls. The walls are wet and moving, and they are full of mouths.',
    gm: 'Hushfolk who dreamed too long and melted into gibbering mouthers, singing the titan\'s waking song. A cloaker roosts on the ceiling and hunts whoever the mouthers stun. Anyone who listens for a full minute (DC 16 Wisdom save) hears words in the song: "nine and one, and the one is the key, and the key is a heart".',
  });
  b.props_('blood-pool', [[10, 36], [15, 39]]).props_('bones', [[8, 34], [16, 34]]).prop('stalactites-tall', 12, 33).prop('mold-patch', 13, 40);
  b.encounter('The Choir of Mouths', [6, 31, 13, 11], [['gibbering-mouther', 6], ['cloaker', 1]], 'low');

  // ----- the Sunless Lake, the Murmuring Stilts, and the Listener's isle -----
  b.tunnel([[42, 22], [44, 28], [46, 33]], 2, { seed: 36 });
  b.tunnel([[18, 39], [28, 41], [37, 43]], 2, { seed: 37 });
  b.cave('The Sunless Lake', 54, 44, 16, 11, {
    seed: 38, mat: 'cave-floor',
    read: 'The cave opens into a lake so wide your light does not reach the far side. The water is still and black, and perfectly silent. Far out, on an island, something pale glows like a drowned moon.',
    gm: 'The water carries the titan\'s dreams. Anyone who drinks it or swims in it makes a DC 16 Wisdom save or is charmed by the Listener for an hour. The Listener, an ancient aboleth, has lain here since before the seals, and it has been dreaming with the titan.',
  });
  b.pool(56, 44, 12, 8, true);
  b.floor(38, 38, 9, 13, 'wood-planks');
  b.water(38, 50, 9, 2, false, true);
  b.area('The Murmuring Stilts', [[38, 38, 9, 13]], {
    read: 'A village of huts on stilts over the shallows, joined by rope walks. Hushfolk in grey sit on the platforms, eyes shut, rocking and murmuring in their sleep. A few are awake. Their skin has scales, or too many fingers, or a second mouth that does not speak.',
    gm: 'The cave-folk, changed by the titan\'s dreams: some into dream-trolls that heal unless burned, and two into great two-headed twin-sleepers (each grown from two dreamers; Mother Quorra knows their names, and calling both makes one hesitate). They are not evil, only half asleep and frightened. Mother Quorra can calm them; without her, they attack strangers who carry light (they think the light will wake the dreamer).',
  });
  b.building('Mother Quorra\'s hut', 39, 39, 5, 4, { mat: 'wood-planks', read: 'A hut hung with bundles of grey moss and little clay dolls, one for every villager, each with its eyes stitched shut.', gm: 'Quorra\'s home. The dolls are dream-charms: she stitches the eyes of each to keep its owner from dreaming too deep. It works, a little.', doors: [[41, 42, 's', 'open']] });
  b.building('Hut of the sleepers', 39, 45, 5, 4, { mat: 'wood-planks', read: 'Six Hushfolk lie on reed mats, breathing in perfect time. Their eyes move under the lids. All in the same direction.', gm: 'The deepest sleepers. Waking one (DC 15 Medicine) makes them scream the same words: "the key is coming home".', doors: [[41, 45, 'n', 'open']] });
  b.props_('herbs-drying', [[40, 40], [42, 40]]).props_('hammock', [[45, 39], [45, 47]]).props_('fishing-net', [[38, 49], [46, 43]]).prop('cooking-pot-fire', 45, 44).prop('canoe', 42, 50, 90).prop('reeds', 39, 50).light(45, 44, 10, 15);
  b.encounter('The Murmuring Stilts', [37, 37, 10, 14], [['dreamTroll', 4], ['twinSleeper', 2]], 'low');
  b.floor(47, 44, 8, 1, 'wood-planks');
  b.area('The rope walk', [[47, 44, 8, 1]], { read: 'A rope bridge on floats, swaying over the black water toward the island.', gm: 'Forty feet of bridge. The Listener knows the moment anyone steps on it.' });
  b.cave('The Listener\'s isle', 58, 44, 4, 3, {
    seed: 39, mat: 'cave-floor',
    read: 'A low island of white stone, like a skull. A great pale shape lies half out of the water on its far side, three red eyes opening one after another.',
    gm: 'The Listener (aboleth) with its chuul servants and a cloaker. It speaks into minds, gently: it does not want the titan awake either ("We were here before the seals, little ones. We will not be its food"). It knows Aldreda: "the grey one who has made her heart a key". It will trade that knowledge for a promise to re-seal the titan, or fight to defend its lake. Telepathic, tricky, honest in its fashion.',
  });
  b.prop('obelisk', 58, 43).props_('bones', [[56, 45], [60, 45]]).prop('crystal-cluster', 59, 42).light(58, 43, 10, 20, '#d0f0ff');
  b.encounter('The Listener', [46, 38, 18, 12], [['aboleth', 1], ['chuul', 4], ['cloaker', 1]], 'moderate');

  // ----- the crystal grotto (secret) -----
  b.tunnel([[69, 44], [72, 41]], 1, { seed: 40 });
  b.cave('The crystal grotto', 76, 40, 3, 6, {
    seed: 41, mat: 'cave-floor',
    read: 'A slit in the rock opens on a grotto of violet crystal, humming in tune with the dark. In the middle, a warden\'s skeleton sits cross-legged, a lantern in its lap.',
    gm: 'The hiding place of the Eighth Warden, who fled here as the seal broke and died writing. Her notes say the seal did not crack by itself: "a grey woman with the Ninth Key came down a month before, and turned something in the lock". Her lantern is a lantern of revealing.',
  });
  b.props_('crystal-cluster', [[75, 37], [77, 43]]).prop('cave-crystals', 76, 40).prop('skeleton-seated', 76, 41).prop('lantern-standing', 75, 42).light(76, 40, 10, 15, '#c08bff');
  b.door(72, 41, 'e', 'secret');
  b.prop('gm-secret-door', 72, 41, 0, { gm: true });

  // ----- the Broken Eighth Seal -----
  b.tunnel([[45, 14], [50, 13], [56, 16]], 2, { seed: 42 });
  b.tunnel([[62, 34], [64, 28], [66, 23]], 2, { seed: 43 });
  b.cave('The Broken Eighth Seal', 66, 15, 10, 7, {
    seed: 44, mat: 'dungeon-slab',
    read: 'A round chamber of fitted black stone, cracked across like a dropped plate. In the middle, where a great stone seal once lay, there is a hole. Out of the hole comes warmth, a red glow, and a slow, enormous breathing.',
    gm: 'The Eighth Seal. Below the hole, a hundred feet down, is the titan\'s skin: grey-red rock that rises and falls. Do not let anyone climb down. Approaching the hole draws earth elementals and xorns out of the titan\'s dreaming stone, with mouthers and a cloaker drawn by the noise. A DC 18 Arcana check on the shattered seal-stone finds a keyhole, turned once from outside: this seal was opened, not broken.',
  });
  b.pit(64, 13, 5, 4);
  b.props_('pillar-broken', [[59, 12], [73, 18]]).props_('rubble-pile', [[61, 18], [71, 11]]).prop('rune-stone', 66, 19).props_('magma-vent', [[63, 15], [69, 14]]).prop('steam-vent', 66, 12).light(66, 15, 15, 30, '#ff6a3a');
  b.encounter('The seal-wound wakes', [57, 9, 19, 14], [['earth-elemental', 4], ['xorn', 4], ['gibbering-mouther', 4], ['cloaker', 1]], 'high');
  b.note(66, 15, 'Climbing down to the titan: each round within 30 feet of its skin, DC 18 Wisdom save or take 4d10 psychic and lose the round staring. Keep the heroes out; this is a sight, not a dungeon.');

  // ----- the bone bridge and the worm roads -----
  b.tunnel([[44, 52], [38, 56], [34, 58]], 2, { seed: 45 });
  b.cave('The bone bridge', 34, 66, 7, 9, {
    seed: 46, mat: 'cave-floor',
    read: 'A chasm splits the cave, falling away into a red glow. Across it lies a bridge made of a single enormous rib, yellow and smooth, wide enough for a cart.',
    gm: 'The rib of something the titan ate when the world was young. Cloakers hang beneath it like bats and rise when anyone is halfway across. A hero knocked off the bridge falls 60 feet onto a ledge (6d6) and must climb back (DC 16 Athletics).',
  });
  b.pit(31, 58, 6, 17);
  b.floor(27, 66, 14, 2, 'cave-floor');
  b.prop('giant-ribcage', 33, 66).props_('bones', [[29, 62], [38, 68]]).prop('chasm-edge', 30, 60).prop('chasm-edge', 37, 72);
  b.encounter('Bone bridge cloakers', [28, 58, 14, 16], [['cloaker', 2]], 'low');
  b.tunnel([[11, 42], [10, 50], [11, 58]], 2, { seed: 47 });
  b.cave('The worm roads', 12, 65, 8, 6, {
    seed: 48, mat: 'cave-floor',
    read: 'Perfectly round tunnels, smooth as glass, cross and re-cross here like the inside of a sponge. The floor trembles. Somewhere close, rock is being eaten.',
    gm: 'A purple worm, grown huge on dream-soaked stone, hunts by vibration. Moving at half speed and making a DC 14 group Stealth check avoids it. Its roads loop under the chasm to the harvesters\' camp: the quiet way to the Concord camp.',
  });
  b.props_('rubble-pile', [[9, 62], [16, 68]]).props_('bones', [[12, 66], [7, 66]]).prop('sinkhole', 14, 63);
  b.encounter('The worm', [4, 58, 18, 14], [['purple-worm', 1]], 'low');
  b.tunnel([[20, 65], [25, 66], [28, 66]], 2, { seed: 49 });
  b.tunnel([[12, 70], [18, 76], [32, 77], [46, 75], [54, 71]], 3, { seed: 50 });
  b.area('Under the chasm', [[18, 75, 30, 3]], { read: 'The worm road dives under the chasm. The rock overhead is hot and sweating.', gm: 'A loop round the bone bridge. Quiet unless the worm is still alive and hunting.' });

  // ----- the Concord ichor harvesters -----
  b.tunnel([[40, 67], [46, 68], [52, 68]], 2, { seed: 51 });
  b.tunnel([[56, 54], [58, 59], [60, 62]], 2, { seed: 52 });
  b.cave('The harvesters\' camp', 64, 68, 12, 7, {
    seed: 53, mat: 'dirt',
    read: 'Bright white tents, a crackle of blue mage-light, and the smell of hot copper. Pipes of glass run from a crack in the cave wall into great sealed vats, and the stuff in the pipes is black and slowly turning, like a dream seen through ink.',
    gm: 'The Concord of Lumenreach\'s ichor harvest: a magus of the Concord, two journeymen mages and their shield guardian, tapping the titan\'s dream-ichor where it seeps through the broken seal. They have writs signed by the Concord\'s Treasurer (handout) and orders to "discourage" visitors. They genuinely think the ichor is just a rare reagent; the magus knows better and is frightened. Talked to (DC 17 Persuasion), she surrenders the writs and her ledger and asks the heroes to shut the pipes.',
  });
  b.props_('tent-command', [[58, 66], [68, 72]]).props_('tent', [[62, 72], [72, 65]]).props_('cauldron', [[66, 65], [70, 68]]).props_('alchemy-table', [[60, 69], [64, 64]]).props_('crate-stack', [[57, 70], [74, 70]]).prop('magic-circle', 66, 68).prop('barrel-group', 72, 72).props_('lamp-post', [[60, 66], [70, 70]]);
  b.light(60, 66, 10, 20, '#a8d8ff').light(70, 70, 10, 20, '#a8d8ff').light(66, 68, 5, 10, '#6aa0ff');
  b.encounter('The ichor harvesters', [53, 62, 22, 12], [['archmage', 1], ['mage', 2], ['shield-guardian', 1]], 'moderate');

  for (let i = 0; i < 24; i++) {
    const x = Math.floor(r() * 78) + 1, y = Math.floor(r() * 78) + 1;
    if (b.cellAt(x, y) === 1 && !(x > 36 && x < 48 && y > 36 && y < 52)) b.prop(['stalagmites', 'mushrooms', 'glowing-fungus', 'boulder', 'bones'][Math.floor(r() * 5)], x, y);
  }
  return b.build();
}

// ---------- Part 4: Lumenreach, the floating city of the Concord (level 15) ----------
function lumenreach() {
  const b = new MapBuilder('adv-nsl-lumenreach', 'Lumenreach, the city above the clouds', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'bright', floor: 'marble' });
  const r = rng(9404);
  // the islands float on nothing: everything that is not island or bridge is a mile of empty air
  const edges = (pts: [number, number][]) => { for (const [x, y] of pts) b.prop('chasm-edge', x, y); };

  // ----- the Mooring Spires, where skyships dock -----
  b.cave('The Mooring Spires', 13, 67, 10, 8, {
    seed: 61, mat: 'stone-flagstone',
    read: 'Your skyship noses in between white spires hung with chains and lanterns. Below the edge of the dock there is nothing at all: cloud, and far under the cloud, the green world. The air is thin, cold and smells of ozone.',
    gm: 'The docks. Every visitor is met by a cloud giant dock-warden with two bound air elementals, who checks papers (the Concord writs from the Hushdeep work beautifully as papers, until someone reads them closely: DC 16 Deception). A fall from the edge is a fall of a mile, unless someone catches you: the city\'s wind-wards slow falls to a feather for the first 60 feet only.',
  });
  b.props_('dock-pier', [[6, 64], [6, 70], [19, 70]], 90).props_('mooring-post', [[6, 62], [6, 73], [16, 71]]).props_('ship-mast', [[4, 67]]).props_('cargo-crates', [[10, 63], [16, 71]]).prop('gangplank', 7, 67, 90).props_('lantern-cluster', [[12, 61], [17, 66]]).prop('signpost', 14, 68).prop('crows-nest', 19, 63);
  b.light(12, 61, 10, 20).light(17, 66, 10, 20);
  edges([[4, 67], [15, 73], [13, 74]]);
  b.start(11, 67, 3, 3);
  b.encounter('Dock wardens', [4, 60, 18, 14], [['cloud-giant', 1], ['air-elemental', 2]], 'low');

  // ----- the Lantern Market -----
  b.hall(22, 66, 31, 66, 2, { mat: 'wood-planks' });
  b.area('The Silver Span', [[22, 66, 9, 2]], { read: 'A bridge of white planks and silver chain, with no rail. The wind leans on you.', gm: 'A DC 10 Acrobatics check to run it in a fight; a creature shoved off falls.' });
  b.cave('The Lantern Market', 42, 64, 12, 8, {
    seed: 62, mat: 'stone-cobble',
    read: 'A market under a sky of floating lanterns. Stalls sell bottled weather, maps that update themselves, songs in glass jars. Every price is in sky-marks, and everything costs too much.',
    gm: 'Buy and listen. Rumours: the Concord votes tonight on "the Root Contract"; the Treasurer has never been seen to eat; the Aether Engine "drinks black" and the city sank forty feet last winter when a shipment was late. Two Concord knives (assassins) and their mages shadow the heroes from here once their writs are noticed.',
  });
  b.props_('market-stall', [[35, 60], [40, 59], [47, 60], [36, 67], [45, 68], [50, 65]]).props_('produce-stall', [[38, 63], [48, 63]]).prop('fountain', 42, 64).props_('lantern-cluster', [[39, 61], [46, 66]]).prop('display-case', 33, 64).prop('crystal-ball', 51, 62).prop('globe-stand', 43, 69);
  b.light(42, 64, 10, 20).light(39, 61, 10, 20, '#ffd27a').light(46, 66, 10, 20, '#ffd27a');
  b.encounter('Quiet knives in the market', [31, 57, 22, 14], [['assassin', 2], ['mage', 2]], 'low');

  // ----- the Gardens of the Wind -----
  b.hall(11, 47, 11, 59, 2, { mat: 'wood-planks' });
  b.cave('The Gardens of the Wind', 12, 38, 9, 9, {
    seed: 63, mat: 'grass',
    read: 'A hanging garden on a floating rock, trees bent all one way by a wind that never stops. In the middle, a fountain throws water straight up into the sky, and the water never comes down.',
    gm: 'The fountain is a prison: a djinni bound by the Concord three hundred years ago to keep the city\'s winds. It is furious and bored. It will trade: freed (break the four binding stones around the fountain, AC 17, 30 hp each, or a DC 20 Arcana check on each), it fights with the heroes once and tells them the Engine runs on "something that is dreaming, little mortals, and it is dreaming of you". Attacked, it fights with its air elementals.',
  });
  b.prop('fountain-grand', 12, 38).props_('rune-stone', [[9, 35], [15, 35], [9, 41], [15, 41]]).props_('tree-willow', [[6, 34], [18, 33], [7, 43], [17, 44]]).props_('flowers', [[10, 31], [14, 45]]).prop('bench', 12, 33).prop('hedge', 5, 38);
  b.light(12, 38, 10, 20, '#cfeaff');
  edges([[3, 38], [21, 38]]);
  b.encounter('The bound djinni', [4, 30, 16, 16], [['djinni', 1], ['air-elemental', 4]], 'low');

  // ----- the cloud giants' terrace -----
  b.hall(12, 19, 12, 29, 2, { mat: 'stone-flagstone' });
  b.cave('The cloud giants\' terrace', 13, 12, 9, 7, {
    seed: 64, mat: 'stone-flagstone',
    read: 'A terrace built to a giant\'s scale: steps you have to climb like walls, a table the size of a barn, wine cups like bathtubs. Four cloud giants in silk lounge here, bored, rolling dice the size of your head.',
    gm: 'The Concord\'s muscle: cloud giant families paid in ichor-wine to guard the city. They despise the mages and love a wager. Beat one at dice (contested DC 18 Insight to read them) or at a feat of strength and they owe a favour: they can carry the heroes to any island, or hold the bridges shut. Insulted, they fight.',
  });
  b.prop('feast-hall-table', 13, 12, 90).props_('chair-high-back', [[10, 10], [16, 10]]).props_('barrel-stack', [[6, 9], [18, 15]]).props_('table-cards', [[9, 15]]).props_('tent-command', [[18, 8]]).prop('wine-rack', 7, 14).prop('statue-tall-winged', 13, 7);
  b.light(13, 12, 15, 25);
  edges([[6, 12], [20, 12]]);
  b.encounter('The cloud giants\' terrace', [5, 6, 16, 12], [['cloud-giant', 4]], 'moderate');

  // ----- the Hall of the Concord -----
  b.hall(21, 38, 28, 38, 2, { mat: 'marble' });
  b.hall(41, 46, 41, 57, 2, { mat: 'marble' });
  b.area('The Stair of Petitions', [[41, 47, 2, 9]], { read: 'A floating stair of separate marble steps, each hanging in the air a hand\'s breadth from the next.', gm: 'Perfectly safe. Petitioners climb it on their knees; the heroes need not.' });
  b.cave('The Concord island', 40, 36, 13, 10, {
    seed: 65, mat: 'marble',
    read: 'The greatest of the islands: white colonnades, pools of still water, robed mages walking in pairs, and in the middle a hall with a roof of beaten gold.',
    gm: 'Public, busy by day, watched by the Concord\'s shield guardians. A DC 15 Insight on passing mages: they are afraid of the Treasurer, not of the Archon.',
  });
  b.props_('column-fluted', [[29, 32], [29, 40], [51, 32], [51, 40]]).props_('fountain', [[30, 36], [50, 36]]).props_('tree-palm', [[30, 30], [44, 42]]).props_('statue-tall-robed', [[40, 27], [38, 44]]);
  b.building('Hall of the Concord', 32, 30, 17, 12, {
    mat: 'marble',
    read: 'Nine thrones in a crescent under a golden dome, and in the middle a map of the world made of light, turning slowly. Eight of the thrones are filled with mages in sky-blue. The ninth, the Archon\'s, is empty.',
    gm: 'The Concord in session (by day). Speaking here is legal for any visitor with a writ. Presenting the harvesters\' writs and the Book of Quiet causes uproar: half the Concord did not know where the ichor came from. The Treasurer calls for the heroes\' arrest. If they fight here, four mages and two shield guardians defend the hall; most councillors flee.',
    doors: [[40, 41, 's', 'open', 'door-double'], [41, 41, 's', 'open', 'door-double'], [40, 30, 'n', 'closed', 'door-double'], [32, 36, 'w', 'closed'], [48, 36, 'e', 'closed']],
    windows: [[35, 30, 'n'], [45, 30, 'n'], [32, 33, 'w'], [48, 33, 'e']],
  });
  b.props_('throne', [[35, 33], [37, 32], [39, 32], [41, 32], [43, 32], [45, 33], [36, 35], [44, 35]]).prop('throne-dais', 40, 31).prop('globe-great', 40, 36).props_('chandelier-crystal', [[36, 37], [44, 37]]).props_('pew', [[37, 39], [43, 39]]);
  b.light(40, 36, 15, 25, '#cfe8ff');
  b.encounter('The Concord in session', [32, 30, 17, 12], [['mage', 4], ['shield-guardian', 2]], 'low');

  // ----- the Archon's Spire -----
  b.hall(40, 15, 40, 26, 2, { mat: 'marble' });
  b.hall(22, 9, 31, 9, 2, { mat: 'wood-planks' });
  b.cave('The Archon\'s Spire', 40, 9, 9, 6, {
    seed: 66, mat: 'marble',
    read: 'The highest island, crowned with a slim white tower. The wind up here sings in the tower\'s fluting. Every window is lit.',
    gm: 'The Archon\'s home and workshop, guarded by his shield guardians and a stone golem. He is not the villain: he signed the ichor contracts the Treasurer drafted, believing they bought a rare reagent "with the Primarch\'s blessing". Confronted with proof he is horrified, then frightened, then useful. If the heroes storm in, he defends himself.',
  });
  b.building('The Archon\'s study', 35, 5, 10, 8, {
    mat: 'wood-planks-dark',
    read: 'A study crammed with orreries, wind-charts and half-built flying machines. A tall man in sky-blue robes looks up from a desk covered in ledgers, a pen still in his hand.',
    gm: 'Archon Valentin Corrique. His ledgers show the city\'s fall rate: without ichor, Lumenreach sinks a hundred feet a year. In a locked drawer (DC 18 Thieves\' Tools): the Treasurer\'s private letters, which mention "our grey friend below" and "the courier arrangements".',
    doors: [[40, 12, 's', 'closed', 'door-double'], [35, 8, 'w', 'closed']],
    windows: [[38, 5, 'n'], [42, 5, 'n'], [44, 9, 'e']],
  });
  b.prop('writing-desk', 40, 7).prop('orrery', 37, 10).prop('astrolabe-stand', 43, 7).props_('bookshelf-tall', [[36, 6], [43, 11]]).prop('map-cabinet', 38, 11).prop('telescope', 42, 10).light(40, 7, 10, 15);
  edges([[32, 9], [48, 10]]);
  b.encounter('The Archon\'s wards', [33, 4, 14, 10], [['archmage', 1], ['shield-guardian', 2], ['stone-golem', 1]], 'moderate');

  // ----- the Aether Engine -----
  b.hall(49, 10, 58, 10, 2, { mat: 'dungeon-slab' });
  b.cave('The engine island', 68, 18, 10, 10, {
    seed: 67, mat: 'dungeon-slab',
    read: 'A black iron island, humming. Great chains run from it to every other island in the city, taut as harp strings. Steam vents from grilles in the ground, and the steam smells of nothing you know.',
    gm: 'The machine that holds Lumenreach in the sky. The steam is ichor-vapour: a hero who breathes it for a minute dreams for an instant of the titan\'s vault (a glimpse of a grey woman waiting there).',
  });
  b.props_('steam-vent', [[60, 14], [74, 21], [64, 26]]).props_('chains-hanging', [[60, 18], [75, 17]]).props_('crate-stack', [[61, 22], [74, 11]]).prop('winch', 68, 26);
  b.building('The Aether Engine', 62, 12, 12, 12, {
    mat: 'dungeon-slab',
    read: 'Inside the iron housing, a sphere of glass as big as a house turns in a cage of rings. It is full of black liquid that moves like a sleeper turning over. Pipes feed it from sealed vats along the walls.',
    gm: 'The heart of the city: titan ichor, burning slowly to lift a city. The climax of Part 4: the Treasurer, exposed, comes here to wreck the evidence by venting the vats (the city drops 500 feet in a minute and every island shakes: DC 15 Dexterity saves). Her iron golem guards the sphere. Closing the valves takes three actions at three different vats (DC 15 Strength each).',
    doors: [[67, 23, 's', 'closed', 'door-iron'], [68, 23, 's', 'closed', 'door-iron'], [62, 17, 'w', 'closed', 'door-iron']],
  });
  b.prop('crystal-ball', 67, 17).prop('magic-circle', 68, 18).props_('cauldron', [[63, 13], [72, 13], [63, 22], [72, 22]]).props_('alchemy-table', [[64, 15], [71, 20]]).prop('lever', 70, 15).prop('orb-pedestal', 66, 20);
  b.light(67, 17, 15, 25, '#8a6aff');
  b.encounter('The engine heart', [62, 12, 12, 12], [['rakshasa', 1], ['iron-golem', 1], ['mage', 2]], 'high');

  // ----- the Vault of Accounts -----
  b.hall(70, 28, 70, 47, 1, { mat: 'wood-planks' });
  b.area('The Chain Walk', [[70, 28, 1, 19]], { read: 'A walkway one plank wide, slung along the great chain from the Engine to the Vault. The chain hums under your feet.', gm: 'The back way to the Vault. Single file. Each hero makes a DC 12 Acrobatics check; on a failure they hang on by their hands (DC 14 Athletics to climb back).' });
  b.hall(53, 62, 60, 62, 2, { mat: 'wood-planks' });
  b.cave('The Vault island', 68, 56, 9, 9, {
    seed: 68, mat: 'marble',
    read: 'A squat island of grey stone with one building on it: a vault with no windows and a door like a coin, six feet across.',
    gm: 'The Concord\'s treasury and its records. Every coin that comes into the city is written down here, by law. The coin-door opens to the Treasurer\'s seal or to a DC 22 Thieves\' Tools check.',
  });
  b.props_('statue-tall-knight', [[62, 55], [74, 57]]).prop('coin-stacks', 66, 62).props_('lamp-post', [[63, 61], [73, 50]]).light(63, 61, 10, 15).light(73, 50, 10, 15);
  b.building('The Vault of Accounts', 63, 51, 11, 10, {
    mat: 'marble',
    read: 'Row after row of iron ledger-cases, and the scratching of a hundred enchanted pens writing on their own, recording every coin in the city as it moves.',
    gm: 'The proof is here: the ichor accounts. Two stone golems and two invisible stalkers guard the cases. The secret back room (DC 18 Investigation: one ledger-case is a door) holds the Treasurer\'s private ledger (handout): payments to "A.V." month after month, including three months AFTER Aldreda\'s death. Her last letter is pinned inside the cover.',
    doors: [[68, 60, 's', 'locked', 'door-iron'], [69, 60, 's', 'locked', 'door-iron'], [70, 51, 'n', 'closed', 'door-iron']],
  });
  b.wallRun(63, 54, 4, 's');
  b.props_('archive-stacks', [[65, 57], [68, 57], [71, 57], [71, 53]]).props_('safe', [[72, 59], [64, 59]]).prop('scroll-rack', 68, 54).prop('bookcase-secret', 65, 54);
  b.door(65, 54, 's', 'secret');
  b.area('The Treasurer\'s private room', [[63, 51, 4, 4]], { read: 'A cramped room that smells of musk and pepper. On the desk, a ledger bound in striped hide.', gm: 'The Treasurer\'s secret office. Her private ledger and a sending stone (its partner is Aldreda\'s).' });
  b.prop('desk', 64, 52).prop('rug-pelt', 65, 53);
  b.encounter('Vault guardians', [63, 51, 11, 10], [['stone-golem', 2], ['invisible-stalker', 2]], 'low');

  // the low market-to-concord way round, and scattered dressing
  b.hall(51, 40, 57, 50, 1, { mat: 'wood-planks', downFirst: false });
  b.hall(57, 50, 61, 50, 1, { mat: 'wood-planks' });
  b.area('The Gardener\'s Rope', [[51, 40, 7, 1], [57, 40, 1, 11]], { read: 'A maintenance rope-walk, swaying and narrow, that the city\'s gardeners use to tend the hanging vines.', gm: 'A quiet way from the Concord island to the Vault. Nobody watches it.' });
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(r() * 78) + 1, y = Math.floor(r() * 78) + 1;
    if (b.cellAt(x, y) === 1) b.prop(['flowers', 'lantern-standing', 'bench', 'potted', 'crate'][Math.floor(r() * 5)].replace('potted', 'urn'), x, y);
  }
  return b.build();
}

// ---------- Part 5: the Ninth Seal, the vault at the root of the world (level 16) ----------
function ninthVault() {
  const b = new MapBuilder('adv-nsl-ninthvault', 'The vault of the Ninth Seal', 80, 80, { theme: 'cave', wallStyle: 'cave', ambient: 'dark', floor: 'cave-floor' });
  const r = rng(9505);

  // ----- the chain's foot, where Lumenreach is anchored -----
  b.cave('The Chain\'s Foot', 40, 6, 10, 4, {
    seed: 71, mat: 'dungeon-slab',
    read: 'The great chain of Lumenreach comes down out of the dark above, each link as tall as a house, and ends in a bolt driven into the living rock. The rock is warm. It has a pulse.',
    gm: 'The city is anchored to the titan itself. (The Concord never knew; Aldreda chose the spot.) Two stone golems in warden grey guard the foot of the chain. They answer to the Ninth Key, but Aldreda has ordered them to let only "the key and its bearers" pass: they test the heroes by attacking, and stop if the bearer orders them in the key\'s name (DC 15 Charisma check, advantage if Ebbe or Oswin coaches the words).',
  });
  b.props_('chains-hanging', [[38, 4], [42, 4]]).prop('anchor', 40, 6).props_('statue-tall-knight', [[33, 6], [47, 6]]).props_('cresset', [[35, 8], [45, 8]]).prop('stairs-up', 40, 3);
  b.light(35, 8, 10, 20).light(45, 8, 10, 20);
  b.start(39, 7, 3, 2);
  b.encounter('Chain wardens', [30, 2, 20, 8], [['stone-golem', 2]], 'low');

  // ----- the Eight Echoes: the ring of the broken seals -----
  b.tunnel([[40, 9], [39, 14], [40, 18]], 3, { seed: 72, mat: 'dungeon-slab' });
  b.area('The Root Stair', [[39, 10, 3, 8]], { read: 'A stair cut by giants, each step knee-high, going down and down.', gm: 'The central way. Halfway down, the air begins to taste of iron and honey: the titan\'s breath.' });
  b.prop('stairs-down', 40, 12);
  b.cave('The Eight Echoes', 40, 26, 12, 8, {
    seed: 73, mat: 'dungeon-slab', wobble: 0.06,
    read: 'A ring-shaped hall around a central pillar of black stone. Eight great keyholes are carved into the pillar, and all eight are cracked and dark. A ninth keyhole, at the bottom, glows faintly gold.',
    gm: 'The echo-chamber of the seals: the founders built it so the wardens could check the seals from one place. Touching a dark keyhole shows its seal breaking, and in six of the eight visions the same grey woman stands nearby with a key (Aldreda opened them, one by one, over thirty years; the first two truly failed by age). A DC 20 Arcana check on the glowing ninth keyhole: turning the Ninth Key BACKWARD in the true lock re-forges all nine seals at once, and burns the key to nothing.',
  });
  b.prop('obelisk', 40, 26).props_('rune-stone', [[30, 26], [50, 26], [40, 19], [40, 33], [33, 21], [47, 21], [33, 31], [47, 31]]).prop('magic-circle', 40, 29).light(40, 26, 10, 20, '#ffd27a');

  // ----- the west way: the hall of the first wardens, the Seal-Angel -----
  b.tunnel([[31, 7], [22, 11], [14, 18], [12, 24]], 2, { seed: 74, mat: 'dungeon-slab' });
  b.tunnel([[28, 27], [20, 29]], 2, { seed: 75, mat: 'dungeon-slab' });
  b.room('Hall of the First Wardens', 4, 24, 16, 12, {
    mat: 'dungeon-slab',
    read: 'Nine stone coffins in a row, their lids carved with wardens holding keys. Eight of the lids have cracked. The air is full of whispering, like a crowd in another room.',
    gm: 'The founders of the order, who chose to lie at the root forever. Their ghosts and wraiths are bound to guard the way. They attack the key-bearer at first (they feel Aldreda\'s soul in the key and think the bearer is her). A DC 18 Religion or Arcana check, or Oswin\'s confession spoken aloud here, makes them see the truth: they ask the heroes to "turn it back, and let her go with it".',
  });
  b.props_('sarcophagus-row', [[7, 26], [11, 26], [15, 26]]).props_('sarcophagus-effigy', [[7, 30], [11, 30], [15, 30], [7, 34], [11, 34], [15, 34]]).props_('candle-stand-tall', [[5, 25], [18, 25], [5, 34], [18, 34]]).prop('banner-hanging-tall', 11, 24);
  b.light(5, 25, 5, 15, '#9fd4ff').light(18, 34, 5, 15, '#9fd4ff');
  b.encounter('The honoured founders', [4, 24, 16, 12], [['wraith', 4], ['ghost', 4]], 'low');
  b.tunnel([[12, 36], [12, 42], [13, 46]], 2, { seed: 76 });
  b.cave('The Angel\'s Watch', 14, 52, 9, 6, {
    seed: 77, mat: 'marble',
    read: 'A bright cave in the dark, lit by a figure of light with wide grey wings and a sword that drips fire. She stands before a sealed gate and says, without turning: "Thief. You bring her heart back to her."',
    gm: 'Aurienne, the Seal-Angel, set here by the founders to guard the last approach. Aldreda told her the heroes stole the Ninth Key and murdered its warden; she believes it, and she is half right about the key. She fights the bearer, and stops the moment she learns what the key truly is (DC 18 Persuasion with proof: the ledger, the Book of Quiet, the arrivals log, or Sabeth\'s diary). Turned, she fights at the heroes\' side in the vault.',
  });
  b.props_('crystal-spire', [[8, 50], [19, 53]]).prop('statue-tall-winged', 14, 48).props_('candle-ring', [[11, 55], [17, 55]]).prop('gate-iron-tall', 17, 56).light(14, 52, 20, 30, '#fff3c0');
  b.encounter('The Seal-Angel', [6, 47, 17, 11], [['planetar', 1]], 'low');

  // ----- the east way: the warden gate, the demon breach, Aldreda's workshop -----
  b.tunnel([[49, 7], [58, 10], [64, 15], [66, 20]], 2, { seed: 78, mat: 'dungeon-slab' });
  b.tunnel([[52, 26], [58, 25]], 2, { seed: 79, mat: 'dungeon-slab' });
  b.room('The Warden Gate', 58, 20, 16, 10, {
    mat: 'stone-flagstone',
    read: 'A wall of iron plates fills the cave from side to side, riveted, rusted, and fifty feet high. In the middle, a door. Before the door stand two figures of iron and stone, three times the height of a man.',
    gm: 'The founders\' guardians: an iron golem and a stone golem. They let the key-bearer through only if the key is shown and the old password spoken ("Nine and one"); anyone else is attacked. Aldreda has fed the iron golem a new order: "the bearer passes alone". If the heroes stay together, it attacks the rest.',
  });
  b.props_('gate-iron-tall', [[64, 21], [68, 21]]).props_('portcullis', [[66, 29]]).props_('brazier-pedestal', [[60, 24], [72, 24]]).props_('chains-hanging', [[61, 21], [71, 21]]).prop('lock-plate', 66, 22);
  b.light(60, 24, 10, 20).light(72, 24, 10, 20);
  b.encounter('The Warden Gate', [58, 20, 16, 10], [['iron-golem', 1], ['stone-golem', 1]], 'moderate');
  b.tunnel([[66, 30], [65, 35], [66, 40]], 2, { seed: 80 });
  b.cave('The demon breach', 66, 47, 10, 7, {
    seed: 81, mat: 'cave-floor',
    read: 'The floor here is torn open, and through the tear you see red sky and black wings. Demons are climbing up out of the titan\'s nightmares, slick with ichor, laughing.',
    gm: 'Where the titan\'s dreaming has worn the world thin. A marilith and two hezrou have come through; more follow every hour the seal stays open. Closing the tear (a DC 20 Arcana check as an action, three successes, or a cast of dispel evil and good) stops reinforcements. The demons want the titan awake and will even help the heroes reach Aldreda, if they think the heroes will open the seal (they will not keep any bargain).',
  });
  b.lava(64, 45, 4, 2);
  b.props_('lava-crack', [[60, 44], [71, 50]]).props_('burning-ground', [[62, 49], [70, 43]]).prop('portal-arch', 66, 46).props_('bone-heap', [[59, 47], [73, 46]]).light(66, 46, 15, 30, '#ff4a2a');
  b.encounter('The demon breach', [57, 41, 19, 12], [['marilith', 1], ['hezrou', 2]], 'moderate');
  b.tunnel([[70, 53], [72, 58], [72, 60]], 2, { seed: 82 });
  b.door(72, 60, 'n', 'secret');
  b.prop('gm-secret-door', 72, 60, 0, { gm: true });
  b.room('Aldreda\'s workshop', 66, 60, 12, 10, {
    mat: 'wood-planks-dark',
    read: 'A study, neat as a pin, built in a crack of the deep. Shelves of books. A cot never slept in. On the desk, a portrait of a young woman with ink-stained right fingers, and a brass key drawn over and over in the margins of every page.',
    gm: 'Aldreda\'s lair for thirty years, guarded by clay golems and invisible stalkers. Her journal (DC 15 Investigation to find the key passage): "My heart is in the key and the key is in their hands, where no one will think to break it, because it is the only thing that can hold the seal. Let them carry it home." The portrait is Sabeth. A narrow private passage runs from the back of the workshop into the vault of the Ninth Seal.',
  });
  b.props_('bookshelf-tall', [[67, 61], [76, 61], [67, 68]]).prop('writing-desk', 72, 63).prop('cot', 76, 67).prop('alchemy-table', 69, 65).prop('summoning-circle', 73, 67).prop('book-pile', 70, 62).prop('crystal-ball', 74, 64).light(72, 63, 10, 15, '#bfe3ff');
  b.encounter('Workshop wards', [66, 60, 12, 10], [['clay-golem', 2], ['invisible-stalker', 2]], 'low');
  b.tunnel([[66, 66], [60, 67], [54, 66]], 1, { seed: 83, mat: 'dungeon-slab' });
  b.area('Aldreda\'s private way', [[55, 66, 11, 1]], { read: 'A crack in the rock, smoothed by thirty years of one woman\'s footsteps.', gm: 'Comes out behind the seal-stone in the vault: the heroes can take Aldreda from behind.' });

  // ----- the Wound: where the titan's flesh shows through -----
  b.tunnel([[40, 33], [40, 39]], 3, { seed: 84 });
  b.cave('The Wound', 40, 46, 12, 7, {
    seed: 85, mat: 'mud',
    read: 'The rock ends. The floor here is skin: grey-red, ridged, warm, rising and falling slowly under your boots. Rivers of molten stone run in its folds. On a ridge of it, coiled in the heat, sleeps a red dragon.',
    gm: 'The titan\'s hide, exposed where the eighth seal\'s failure tore the root. Any hero who stands still here for a full minute hears its dream (DC 17 Wisdom save or 4d10 psychic and a vision of Aldreda, waiting). The dragon, Calyxa Embersleep, came for the heat and stayed for the dreams; she wants the titan to wake "to see what it does". Clever talk (DC 19 Persuasion) can set her against Aldreda: "she means to rule it, and you". Otherwise she defends her warm bed.',
  });
  b.lava(31, 44, 6, 1).lava(44, 49, 7, 1).lava(38, 41, 1, 3);
  b.props_('magma-vent', [[34, 47], [47, 44]]).props_('steam-vent', [[37, 50], [44, 42]]).prop('dragon-hoard', 42, 46).prop('giant-ribcage', 33, 42).light(42, 46, 15, 30, '#ff7a3a').light(34, 47, 10, 20, '#ff6a2a');
  b.encounter('The red wyrm in the Wound', [29, 40, 23, 12], [['adult-red-dragon', 1]], 'low');
  b.tunnel([[40, 52], [40, 56]], 3, { seed: 86 });
  b.tunnel([[50, 49], [56, 54], [60, 52]], 2, { seed: 87 });

  // ----- the dreaming pool -----
  b.tunnel([[12, 58], [11, 64]], 2, { seed: 88 });
  b.cave('The dreaming pool', 10, 70, 7, 6, {
    seed: 89, mat: 'cave-floor',
    read: 'A still pool of water so clear it seems not to be there, in a cave ringed with crystals. In the water you do not see your reflection. You see the vault, and a grey woman in it, turning to look at you.',
    gm: 'The founders\' scrying pool. Looking in shows the vault as it is now (the heroes can see Aldreda, her wraiths and the layout: advantage on initiative in the final fight). Aldreda can see them too: she speaks through the water, kindly, offering them a share of the world to come if they simply walk in and turn the key forward. Drinking from the pool restores a spent spell slot of 5th level or lower to one caster, once.',
  });
  b.pool(10, 71, 4, 3, false);
  b.props_('cave-crystals', [[5, 67], [13, 74], [7, 74]]).prop('crystal-spire', 14, 66).light(10, 71, 10, 15, '#bfe3ff');
  b.tunnel([[16, 70], [22, 69], [27, 67]], 2, { seed: 90 });

  // ----- the vault of the Ninth Seal -----
  b.tunnel([[21, 56], [27, 61]], 2, { seed: 91 });
  b.cave('The Ninth Seal', 40, 66, 14, 10, {
    seed: 92, mat: 'marble', wobble: 0.05,
    read: 'A round vault so vast your light does not reach the dome. In the middle, set into the floor, a disc of gold and black stone fifty feet across: the Ninth Seal, the last lock on the world\'s oldest prisoner. A keyhole glows at its centre. Beside it stands the woman you buried in Calvarre.',
    gm: 'The climax. Aldreda Varrenhall, a lich, with two wraiths (the last wardens she murdered, bound to her). She is gracious, sad and certain: the seal will fail in ten years anyway; better the titan wake to a will than wake wild. She asks the bearer to turn the key forward ("you need only open your hand"). Turned BACKWARD, by any hand, the key re-forges all nine seals and destroys the key, and her with it. Turning takes three actions in a row by the same hero, standing on the seal; Aldreda knows, and will do anything to stop it. While the key exists she cannot truly die: drop her to 0 hit points and she rises again in 1 minute beside it.',
  });
  b.prop('magic-circle', 40, 66).prop('lock-plate', 40, 66).props_('rune-tiles', [[34, 62], [46, 62], [34, 70], [46, 70]]).props_('column-cluster', [[30, 60], [50, 60], [30, 72], [49, 71]]).props_('brazier-everburning', [[28, 66], [52, 66]]).prop('altar-reredos', 40, 57).prop('giant-ribcage', 40, 74);
  b.light(40, 66, 20, 40, '#ffd27a').light(28, 66, 10, 20, '#9fd4ff').light(52, 66, 10, 20, '#9fd4ff');
  b.encounter('The Ninth Seal', [28, 57, 24, 18], [['lich', 1], ['wraith', 2]], 'high');

  for (let i = 0; i < 20; i++) {
    const x = Math.floor(r() * 78) + 1, y = Math.floor(r() * 78) + 1;
    if (b.cellAt(x, y) === 1) b.prop(['stalagmites', 'rubble-pile', 'bones', 'crystal-cluster'][Math.floor(r() * 4)], x, y);
  }
  return b.build();
}

export const NINTH_SEAL: Adventure = {
  id: 'ninth-seal',
  title: 'The Ninth Seal',
  tagline: 'Eight seals under the world have already broken, someone is murdering the wardens who hid it, and the last key is in your pocket.',
  levels: '11-16',
  sessions: '8-12 sessions',
  players: '3-5',
  tags: ['investigation', 'epic', 'mystery', 'campaign', 'twist'],
  pitch:
    'Under the world sleeps something older than the gods: Ossuvar the Unmade, a titan of living stone. A thousand years ago a secret order of wardens bound it with nine seals and nine keys, and the world forgot it was ever there. Now the wardens are dying. The Warden of the Ninth Key has been found frozen to death in a tower locked from the inside, and in her dead hand is a brass key and a note addressed to whoever finds her. That is you. The key will not let you put it down.',
  secret:
    'Eight of the nine seals have broken over the last century, and the order hid every failure: Primarch Oswin Haverleigh feared that if the world knew, the order would lose its power and the Concord of Lumenreach its faith (and its great tithe). Aldreda Varrenhall, Warden of the Ninth Key, learned the truth thirty years ago and did the arithmetic: the last seal will fail within ten years whatever anyone does. She decided the titan should wake to a will, not wake wild, and that the will should be hers. A key turned FORWARD in the Ninth Seal by an unsworn hand opens it, and whoever stands at the lock becomes the titan\'s first dream: its master. Since then she has quietly opened six seals with her key, sold the dream-ichor that leaks from them to the floating city of Lumenreach (whose Treasurer, a rakshasa, brokered the deal and keeps the city aloft on it), and made herself a lich. Her phylactery is the Ninth Key itself. Why now: the Eighth Seal broke a year ago, and only hers is left. She killed her apprentice Sabeth, dressed the body as herself, and left the key "to whoever finds me", so that unsworn heroes would carry her heart, safe and unbroken, all the way down to the lock. Then she hired killers and giants to murder every warden who could stop her. The heroes are not her hunters. They are her couriers. The twist: the only thing that can re-forge all nine seals is the Ninth Key turned BACKWARD, which burns the key away, and her with it.',
  hooks: [
    'The Provost of the Lyceum of Calvarre, an old friend of one of the heroes, writes in a hurry: "Something terrible in the Orrery Tower. I need people who are not afraid and not from here. Come today."',
    'A letter in grey ink reaches the heroes a week late, from a woman they have never met: "If I am found dead, take what I leave you and do not let go of it. Aldreda Varrenhall, Warden." When they reach Calvarre, she is.',
    'The heroes are in Calvarre for other reasons (a lecture, a sage, a stolen book) when the Proctor of the Lyceum needs outsiders to break a locked door, because she does not trust anyone inside the walls.',
  ],
  tips: [
    'Five parts, one level each (Part 3 spans 13-14: level up after the Listener). Each part is a complete chapter with its own climax. Two sessions per part is about right; Part 3 may take three.',
    'The twist is fair. Plant the clues and let sharp players solve it early: the body\'s right-handed ink, the loose ring, the teleportation circle, Sabeth\'s packed bag, the arrivals log ("Arrived: the Ninth Key"), the visions of a grey woman, and finally the Treasurer\'s ledger. If they guess in Part 1, nothing breaks: they still need to follow her trail to the root.',
    'Aldreda\'s note frames the Primarch. Let the players suspect Oswin through Part 2. He is guilty, just not of murder: he hid the broken seals. That lie is what let her work.',
    'The key is bound to its finder: left behind, it is back in their pocket at dawn. It feels warm, like a heartbeat (a DC 20 Arcana check in Part 3 or later reveals it as a phylactery). Aldreda\'s servants never harm the bearer: watch for players noticing that.',
    'Give the big monsters choices. The ice devil, the frost giants, the Listener, the cloud giants, the djinni, the red dragon and the Seal-Angel can all be talked to, bargained with or turned. The best runs win half their fights with words.',
    'Ebbe Brume, the novice, is the heroes\' companion from Part 2 on: a guide, a conscience and a voice for the order\'s rules. Oswin can come too if he survives his confession; he has his own reckoning in Part 5.',
  ],
  npcs: [
    {
      id: 'pf_nslaldreda', name: 'Aldreda Varrenhall', title: 'Warden of the Ninth Key', kind: 'monster', art: 'wizard', monsterId: 'lich',
      wants: 'To stand at the Ninth Seal when it opens and become the will the titan wakes to. To be, at last, not afraid.',
      knows: 'Everything: the seals, the keys, the cover-up, the Concord\'s greed, and exactly how the heroes think, because she has watched them through the key since Calvarre.',
      voice: 'Low, warm and patient, like a favourite teacher. Never raises her voice. Says "my dears".',
      appearance: 'Once a small grey-haired woman in a warden\'s coat. Now grey skin over fine bones, eyes like cold gold coins, the same coat, and a hollow in her chest where a heart should be.',
      backstory: 'A brilliant warden who discovered, a century into her service, that the seals were failing and the order was lying. She begged the Primarch to tell the world. He slashed her face from the order\'s portrait instead.',
      gmNotes: 'SRD lich. Dead to the world from Part 1 to Part 5. Her phylactery is the Ninth Key: while it exists she rises again 1 minute after being destroyed, beside it. She never harms the bearer if she can help it. Turning the key backward on the seal destroys her for ever. She is not cruel for its own sake; offer her a way to be heard and she will talk a long time.',
    },
    {
      id: 'pf_nslferrin', name: 'Ferrin Vasko', title: 'a hired blade who folds paper birds', kind: 'monster', art: 'assassin', monsterId: 'assassin',
      wants: 'To finish the job, get paid, and never, ever be in the same room as his employer.',
      knows: 'He was hired by a voice through a sending stone, paid in Lumenreach silver. His list of targets. That he must "never touch the key or whoever carries it".',
      voice: 'Soft and courteous, like a barber. Folds paper while he talks and never looks up.',
      appearance: 'A thin, neat man in grey with ink-stained fingers and a pocket full of paper cranes.',
      gmNotes: 'Assassin stat block. Leaves a paper crane at every killing. Caught, he talks to save his neck (DC 15 Intimidation, or a fair deal). He has never seen his employer and assumes it is the Concord.',
    },
    {
      id: 'pf_nsledwina', name: 'Provost Edwina Langmoor', title: 'head of the Lyceum of Calvarre', kind: 'npc', art: 'sage', shared: true,
      wants: 'The truth about her friend\'s death, and the Lyceum\'s name kept out of the gutter.',
      knows: 'Aldreda wrote left-handed. She had been "lecturing about the stars under the world" for decades. She was not afraid this spring, for the first time in thirty years.',
      voice: 'Brisk and dry, with long words and short patience. Taps her spectacles on things.',
      appearance: 'A tall woman of seventy in an inky black gown, spectacles on a ribbon, hair in a fierce white knot.',
      gmNotes: 'Pays 300 gp per hero for the investigation and opens every door in the Lyceum. Her eyes fill with tears when shown proof that Aldreda is alive; then she is very, very angry.',
    },
    {
      id: 'pf_nslrosamel', name: 'Proctor Rosamel Fyle', title: 'keeper of the Lyceum\'s peace', kind: 'npc', art: 'guard-captain', monsterId: 'veteran', shared: true,
      wants: 'A culprit she can hang, by the end of the week, before the city watch takes the case away from her.',
      knows: 'The door was barred from inside; she broke it herself (or the heroes do). The window was latched. The porter saw nobody come down.',
      voice: 'Clipped and loud, used to shouting at students. Calls everyone "you there".',
      appearance: 'A broad, weathered woman of fifty with a proctor\'s staff and a red sash, and a broken nose she is proud of.',
      gmNotes: 'Suspicious of the heroes at first (they have the key). Won over by honest work. She lends six proctors (guard stat blocks) for the chase.',
    },
    {
      id: 'pf_nsloswin', name: 'Primarch Oswin Haverleigh', title: 'head of the Order of the Nine Keys', kind: 'npc', art: 'elder-wizard', monsterId: 'mage', shared: true,
      wants: 'To survive, and for the Quiet to stay quiet. Later, to be forgiven, though he will not ask.',
      knows: 'Every broken seal, every lie told to cover it, the order\'s passwords ("Nine and one"), and the way to the root.',
      voice: 'A grand, trained voice gone hoarse. Speaks of the order as "we" even when he is the only one left.',
      appearance: 'A big white-haired man in a tattered warden\'s robe with gold keys embroidered on the cuffs, gaunt from a month of hiding.',
      backstory: 'Primarch for sixty years. When the first seal failed he told himself it was a single accident. By the fourth he could not stop lying.',
      gmNotes: 'Not the murderer. Aldreda\'s note blames him, and he looks guilty because he is guilty of something. Confesses in the Bell of Quiet. In Part 5 he can offer to turn the key backward himself (taking its damage instead of a hero). If he does, he dies on the seal.',
    },
    {
      id: 'pf_nslebbe', name: 'Ebbe Brume', title: 'novice of the order', kind: 'npc', art: 'apprentice-wizard', monsterId: 'priest', shared: true,
      wants: 'To be a real warden, of a real order that tells the truth.',
      knows: 'The order\'s rules, songs and stories, and the warden stair down to the Hushdeep. Not one secret worth anything, which is why the Primarch kept her.',
      voice: 'Earnest and fast, apologises too much, then says something devastatingly blunt.',
      appearance: 'A freckled young woman of eighteen in a novice\'s grey, with a kitchen knife she has named and a satchel of the order\'s songbooks.',
      gmNotes: 'Priest stat block. The heroes\' companion from Part 2. If the players need a nudge, she remembers an old rule: "A key is for locking. The Founders never made one for opening."',
    },
    {
      id: 'pf_nslquorra', name: 'Mother Quorra', title: 'dream-keeper of the Hushfolk', kind: 'npc', art: 'hedge-witch', monsterId: 'druid', shared: true,
      wants: 'Her people to sleep without dreaming, and the sky-folk\'s pipes pulled out of the stone.',
      knows: 'The Hushfolk\'s dreams: a grey woman came down a year ago with a key and turned it in the Eighth Seal. The sky-folk buy "the black" from the stone. The Listener in the lake is older than all of it.',
      voice: 'Slow and sleepy, every sentence trailing off. Wide awake and sharp when angry.',
      appearance: 'A tiny, ancient cave-woman with a second pair of eyes, always closed, on her brow, and clay dolls hanging from her belt.',
      gmNotes: 'Druid stat block. Calms the village (no fight) if the heroes promise to shut the harvesters\' pipes. Knows the worm roads and the secret grotto.',
    },
    {
      id: 'pf_nslvalentin', name: 'Archon Valentin Corrique', title: 'first of the Concord of Lumenreach', kind: 'npc', art: 'archmage', monsterId: 'archmage', shared: true,
      wants: 'To keep his city in the sky. Everything else comes second, including his conscience.',
      knows: 'Lumenreach sinks a hundred feet a year without ichor. The contracts came through the Treasurer, "with the Primarch\'s blessing". He never asked where the ichor came from.',
      voice: 'Silky and reasonable, a man used to being the cleverest in the room. Cracks when frightened.',
      appearance: 'A tall man of sixty in sky-blue robes, silver-bearded, ink on one cuff, always holding a pen.',
      gmNotes: 'Archmage. Not the villain, but a coward. Shown the truth, he turns on the Treasurer and offers the heroes the Concord\'s help: passage down the Anchor chain to the root, and the city\'s gratitude (see Part 4 treasure).',
    },
    {
      id: 'pf_nslibbet', name: 'Treasurer Ibbet Solenne', title: 'keeper of the Concord\'s accounts', kind: 'monster', art: 'rakshasa', monsterId: 'rakshasa',
      wants: 'The titan awake and the world in chaos, so that she can feast on the fear for a thousand years.',
      knows: 'That "A.V." is alive and waiting at the root. Every coin in Lumenreach. Every councillor\'s secret.',
      voice: 'A purr. Laughs at her own jokes before she finishes them. Never says no; says "how interesting".',
      appearance: 'In disguise, a plump, motherly woman in striped silks with many rings. Truly, a tiger-headed fiend whose hands bend backward.',
      gmNotes: 'Rakshasa. Brokered the ichor trade for twenty years. When exposed she runs to the Aether Engine to vent the vats (wreck the evidence, and drop the city). Can only be harmed properly by magic of high level (see her stat block); plan accordingly.',
    },
    {
      id: 'pf_nslaurienne', name: 'Aurienne', title: 'the Seal-Angel', kind: 'monster', art: 'planetar', monsterId: 'planetar',
      wants: 'To keep the last seal, as the founders asked, until the end of the world.',
      knows: 'The founders\' purpose, the true lock, and that the key she feels coming is full of a stolen soul.',
      voice: 'Calm and huge, like a bell heard underwater. Speaks only in the present tense.',
      appearance: 'A towering woman of light with grey wings and a sword that drips fire, eyes closed, always.',
      gmNotes: 'Planetar. Deceived by Aldreda into thinking the heroes are thieves. Turned by proof, she fights at the heroes\' side in the vault and can shield the hero turning the key (they take half its damage).',
    },
  ],
  handouts: [
    { id: 'warden-note', title: 'The note in the dead woman\'s hand', text: 'To whoever finds me:\nThe key is yours now. It will not let you put it down, so do not try.\nIf I am found like this, it was the Primarch\'s doing. He has hidden a great failure, and he will kill every one of us to keep it hidden.\nGo to the Stillhold. Find the truth. Trust no warden.\nTrust the key.\nA. V.' },
    { id: 'porters-log', title: 'The porter\'s night book, Lyceum south gate', text: 'Ninth bell. The Warden of the Tower and her girl Sabeth, in. Warden very cheerful. Girl carrying a big bundle (laundry?).\nTenth bell. Master Vellow, out, drunk.\nEleventh bell. Bright flash at the top of the tower. Thought it was the stars.\nMidnight. Nobody.\nDawn. Nobody came down. Nobody came down. I would swear it on my mother.\nGully, porter' },
    { id: 'crane-list', title: 'A list folded into a paper crane', text: 'Gaunt. Calvarre. The observatory, midnight after the tower.\nThe Stillhold. The giants will see to it.\nThe Eighth post. Already dead. Lucky.\nHaverleigh. If he lives, he is yours.\nPayment in sky-marks, stall of the blue lamp, Lantern Market, Lumenreach.\nUnder no circumstances touch the key or whoever carries it.' },
    { id: 'book-of-quiet', title: 'From the Book of Quiet', text: 'The First Seal. Broke in the year of the long winter. Told: an earthquake.\nThe Second. Broke the year after. Told: a plague of dreams, a fever.\nThe Third. Told: nothing; no one lived near enough to notice.\nThe Fourth, Fifth, Sixth, Seventh: told, told, told, told.\nThe Eighth. Broke last spring. Its wardens are not answering. Told: all is well.\nOne remains. The Ninth Warden insists the breaks are not natural. She is hysterical. She is to be watched.\nO. H., Primarch' },
    { id: 'concord-writ', title: 'A writ of the Concord of Lumenreach', text: 'By the authority of the Concord, the bearer and their company are licensed to harvest the reagent known as Deep Black at the Hushdeep site, by private agreement with the Ninth Warden, who guarantees the supply.\nAll wardens and officers of the Order are asked to give every assistance.\nNot to be shown to the Archon.\nIbbet Solenne, Treasurer' },
    { id: 'treasurer-ledger', title: 'The Treasurer\'s private ledger, last page', text: 'To A.V., for the Deep Black, as agreed: 4,000 marks. (Third month after the tower.)\nTo A.V., for the giants\' fee: 9,000 marks.\nTo A.V., for the folded man: 2,000 marks.\nPinned inside the cover, in grey ink:\nIbbet. The couriers are on their way, and they carry my heart without knowing it. Do not harm them. Let them find this, if they must. Let them come down to the root. I will be waiting. A.' },
  ],
  chapters: [
    {
      id: 'calvarre', title: 'Part 1: The Locked Tower', level: 11,
      summary: 'In the university quarter of Calvarre, a warden lies dead in a tower locked from the inside. The heroes inherit her key, investigate the impossible murder, and chase a killer across the roofs when a second warden dies.',
      goal: 'Solve (or half-solve) the locked room, catch the folded man before he kills again, and learn who paid him.',
      map: calvarre,
      npcs: [
        { npc: 'pf_nsledwina', x: 9, y: 36 },
        { npc: 'pf_nslrosamel', x: 16, y: 10 },
        { npc: 'pf_nslferrin', x: 72, y: 45, hidden: true },
      ],
      scenes: [
        { room: 'Lyceum south gate', title: 'Nobody came down', read: 'The Lyceum\'s bronze gate stands open in the grey dawn. Students cluster in whispering knots. The Provost strides out to meet you, her gown flapping, and says only: "The tower. Now. Please."', gm: 'Provost Edwina hires the heroes (300 gp each) and walks them across the Quad. On the way, Gully the porter insists on showing them his night book: nobody came down.', handout: 'porters-log' },
        { room: 'The tower stair', title: 'The barred door', gm: 'Proctor Rosamel and her men have failed to break the door. The heroes can (DC 20 Athletics or 40 damage; a knock spell works). Rosamel watches the heroes the whole time: whoever opens this door, she suspects.' },
        { room: 'The Star Room', title: 'The locked room', read: 'Frost on the inside of the window. A brass orrery stopped mid-turn. On the rug, a woman in a warden\'s grey coat, her face burned white, a brass key held to her chest in both hands. Tied to the key with a grey ribbon is a note.', gm: 'The key "chooses" whoever first touches it: it is warm, it hums, and it is in their pocket again every dawn however they try to leave it. Give out the note. Then let the players investigate: the loose ring, the right-handed ink, the latched window, the scorched circle under the rug (lifting the rug sets the invisible stalkers on the lifter). Do not confirm or deny any theory.', encounter: 'The Star Room watchers', handout: 'warden-note', treasure: 'The Ninth Key. In the desk: Aldreda\'s lecture notes on the nine seals, and 200 gp in old coins.' },
        { room: 'Proctor\'s House', title: 'Who is the dead woman?', optional: true, gm: 'The body is laid out here. A DC 15 Medicine check: the dead woman is about twenty-five, not over a hundred. Rosamel refuses to believe it ("the frost does strange things"). If the heroes press, the Provost sends for Sabeth\'s family. Sabeth never went home.' },
        { room: 'Widow Marrable\'s lodgings', title: 'The apprentice\'s room', gm: 'Sabeth\'s packed bag, her purse, her diary ("She asked me to wear her coat for the portrait painter tomorrow"). The players now have everything they need to guess. Most will not, yet.', treasure: 'Sabeth\'s purse: 14 gp and a silver locket with a portrait of her mother.' },
        { room: 'The glasshouse', title: 'The black jar', optional: true, encounter: 'Glasshouse specimens', gm: 'The botanist\'s monsters, fed on ichor. The jar labelled "from the deep, with care. A.V." is the first sight of the titan\'s dream-ichor.', treasure: 'In the botanist\'s cabinet: a periapt of health he was too frightened to wear, and 3 potions of greater healing.' },
        { room: 'The Inkpot', title: 'The man with the paper birds', gm: 'Gossip leads here. The landlord describes Ferrin and shows his sky-mark coin. The heroes learn the folded man asked about "the old clock-man at the observatory" too: the next victim.', optional: true },
        { room: 'Clock Observatory', title: 'Midnight at the observatory', read: 'A thousand clocks strike midnight at once, all slightly out of time. Under the copper dome, an old man in a nightshirt lies across his telescope. A paper crane sits on his chest. On the balcony, a figure in grey steps up onto the rail, salutes you, and drops out of sight.', encounter: 'The Bellwarden\'s guardians', gm: 'Cuthwin Gaunt, keeper of the useless Seventh Key, is dead. If the heroes arrived before midnight, they can save him: he then tells them about the Quiet himself and the Part 2 confession is shorter. Ferrin has the guardians\' amulet and orders them to attack. Breaking off to chase him is the right call.', treasure: 'Cuthwin\'s papers (the glacier road to the Stillhold) and a ring of protection on his hand.' },
        { room: 'The slate roofs', title: 'The rooftop chase', encounter: 'Rooftop knives', gm: 'Five rounds of chase across the roofs (see the area notes). His hired mages hold the far roofs. If the heroes lose him, they can still guess where he runs: the canal, where a skiff waits.' },
        { room: 'The Inkwater Lock', title: 'Showdown at the lock', read: 'The canal drops through the lock in a roar of white water. On the far gate-walk, Ferrin turns, still folding a paper bird, and sighs. "You are very persistent. I was told not to hurt you. I was not told why." His hired men step out of the lock-keeper\'s house.', encounter: 'The Inkwater Lock', gm: 'The climax of Part 1. Ferrin fights to escape, not to kill (he will not target the key-bearer). Captured, he trades everything for his life: the sending stone, the voice that never speaks, the payment in sky-marks, and his list.', handout: 'crane-list', treasure: 'Ferrin\'s purse: 300 sky-marks (each worth a gold piece) and a cloak of elvenkind.' },
        { room: 'Ropewalk warehouse', title: 'The folded man\'s loft', optional: true, encounter: 'Ropewalk crew', gm: 'His hideout and his crew. The sending stone here is the partner of one Aldreda carries: anyone who uses it gets no answer, only a feeling of being watched, kindly.', treasure: '600 sky-marks, a sending stone, a +2 shortsword, and a bag of 300 folded paper cranes.' },
        { room: 'The Undercroft', title: 'Beneath the Lyceum', optional: true, encounter: 'Ossuary dead', gm: 'The old Lyceum under the new. Aldreda\'s student carving, NINE LOCKS, ONE DOOR. The culvert and the secret grate lead to the town side.', treasure: 'On the wraith\'s Provost chain: an amulet of proof against detection and location.' },
      ],
      wrapUp: 'Ferrin is caught or fled, and the trail leads two ways: to the Stillhold, where the note says the truth is, and up to Lumenreach, where the money came from. The heroes take the glacier road first. The key is warm in the bearer\'s pocket, like a sleeping animal. The heroes reach level 12.',
    },
    {
      id: 'stillhold', title: 'Part 2: The Stillhold', level: 12,
      summary: 'The order\'s secret fortress inside a glacier has been overrun by frost giants and a white dragon. Inside are the last survivors, the order\'s records, and the truth about the broken seals.',
      goal: 'Get inside, find the survivors and the Book of Quiet, and learn what the order has been hiding.',
      map: stillhold,
      npcs: [
        { npc: 'pf_nsloswin', x: 38, y: 10 },
        { npc: 'pf_nslebbe', x: 42, y: 10 },
      ],
      scenes: [
        { room: 'The glacier tongue', title: 'The road ends in ice', read: 'For two days the road climbs into the white. Then it ends, at a river of blue ice spilling out of the mountain, and a gate in the ice standing open like a broken mouth. A frozen body lies in the snow before it, still holding a horn to its lips.', gm: 'Crevasses and cold. The dead warden blew the warning horn a month ago; nobody came. Two ways in: the broken gate, or the frozen falls on the west (the giants\' back way).' },
        { room: 'The Broken Gate', title: 'Lifted from inside', encounter: 'Giants at the gate', gm: 'A bored frost giant and its wolves. Clue: the bar of the gate was lifted from inside, neatly. Someone let them in.' },
        { room: 'The frozen falls', title: 'The brood', optional: true, encounter: 'Wyrmlings at the falls', gm: 'Two young white dragons, vain and greedy. The back way up the crevasse run into the barracks.', treasure: 'A dead warden\'s pack behind the ice curtain: a staff of frost (four charges left) and 2 potions of superior healing.' },
        { room: 'Hall of Nine Keys', title: 'The devil on the chair', read: 'Nine stone wardens, eight cracked through, and a crust of fallen plaster around their feet. On the Primarch\'s chair at the end of the hall sits a pale, insect-like devil, reading a contract and humming.', encounter: 'The devil on the chair', gm: 'The ice devil holds the giants\' contract (signed by the jarl, witnessed by a hand marked only "the Ninth"). It is willing to deal: it will tear up the contract and leave if the heroes fulfil one clause for it, "deliver the Primarch, alive" (it does not care what happens to him after). Or fight. The plaster on the statues proves the cover-up.' },
        { room: 'Refectory', title: 'Cousins at the feast', optional: true, encounter: 'The feast in the refectory', gm: 'Two sour giant cousins who can be bribed or flattered into talking: "a little grey woman with a key came out of the shining circle and opened the gate for us".' },
        { room: 'Barracks of the Watch', title: 'The sleeping giants', encounter: 'Barracks of the Watch', gm: 'Sneak past or fight. The jarl\'s best warriors and their bears.' },
        { room: 'The circle chamber', title: 'The arrivals log', gm: 'The last entry: "Arrived: the Ninth Key", on the night of the tower. Oswin will say the murderer stole the key and came through. Ask the players: then why did the key end up in the dead woman\'s hand back in Calvarre?' },
        { room: 'The Archive of Quiet', title: 'The Book of Quiet', read: 'The book is chained to the desk as if it might run away. Its pages are written in one tidy hand, year after year, the same words over and over: told, told, told.', handout: 'book-of-quiet', gm: 'Behind the glyph-trapped secret door in the scriptorium. Eight broken seals and eight lies. The heroes now have the truth the note promised, and it damns the Primarch. The trapdoor drops to the under-ice lake.', treasure: 'In cabinet eight: the Eighth Warden\'s spare key (useless now) and the warden stair\'s map to the Hushdeep.' },
        { room: 'The golem vault', title: 'The treasury of the order', optional: true, encounter: 'The golem vault', gm: 'Golems under Aldreda\'s standing order. Clue: the Ninth Key gives them pause but no more; somebody holding a key told them otherwise before.', treasure: 'The order\'s treasury: 4,000 gp in coin and plate, a +2 shield and a mantle of spell resistance.' },
        { room: 'The ice crypts', title: 'The honoured dead', optional: true, encounter: 'The honoured dead', gm: 'Swear to tell the truth and they bow. Fight, and they fight.', treasure: 'A dead Primarch\'s ring of warmth and a +2 longsword frozen into a niche (DC 16 Strength to pull free).' },
        { room: 'The Bell of Quiet', title: 'The last of the order', read: 'The bell hangs over you like a held breath. The old man lowers his staff and laughs, a dreadful dry sound. "So she sent you. Of course she sent you. She always said someone would come with the key and ask me why."', gm: 'Oswin confesses the Quiet (with the book in hand, at once; otherwise DC 15 Intimidation or Persuasion). He swears he killed no one, and is telling the truth (DC 14 Insight). He says the Eighth Seal is in the Hushdeep, and only the warden stair goes there. Ebbe asks to come: "Somebody has to be a warden who doesn\'t lie."' },
        { room: 'The white wyrm\'s gallery', title: 'The jarl and the wyrm', encounter: 'The white wyrm\'s gallery', gm: 'The climax. Jarl Ottar Skallgrim and the white wyrm Vhessrin on the order\'s plundered hoard. The jarl can be talked into leaving with proof he was used ("the little grey woman promised you the warm lands below; what is below is a titan that eats giants"). The dragon cannot.', treasure: 'Vhessrin\'s hoard: 6,000 gp in coin and keys of gold, a frost brand greatsword, a ring of resistance (fire), and a crystal ball the order used to watch the roads.' },
      ],
      wrapUp: 'The Stillhold is free, the order\'s lie is out, and the order is three people: a disgraced Primarch, a novice, and the heroes holding a key. The murderer is still unknown; the note blamed Oswin, and Oswin blames "whoever has a key". The trail goes down the warden stair to the Eighth Seal. The heroes reach level 13.',
    },
    {
      id: 'hushdeep', title: 'Part 3: The Hushdeep', level: 13,
      summary: 'Three days down the warden stair, the titan\'s dreams have changed everything: fungus with faces, cave-folk who sleepwalk into monsters, a lake ruled by an ancient Listener, and sky-mages pumping black ichor out of the broken Eighth Seal.',
      goal: 'Reach the broken Eighth Seal, learn how it really broke, and find out who is buying the titan\'s dreams.',
      map: hushdeep,
      npcs: [
        { npc: 'pf_nslebbe', x: 5, y: 7 },
        { npc: 'pf_nslquorra', x: 41, y: 40 },
      ],
      scenes: [
        { room: 'The Long Stair', title: 'The hum in your teeth', read: 'Three days of stairs end at a landing worn smooth. The air is warm and wet. Something too low to hear is humming, and your teeth ache with it. Ebbe whispers: "That\'s it. That\'s it breathing."', gm: 'Explain the dreaming (Wisdom saves on long rests). From here the Hushdeep loops: the outpost, the Glimmerwood, the Choir, the lake, the worm roads. There is no single road to the seal.' },
        { room: 'The dead outpost', title: 'The forgotten watch', encounter: 'The dead watch', gm: 'The Eighth Seal\'s wardens, dead a year and furious. Truth (or the Book of Quiet) turns them. The records name a Concord barge-party "with writs from the Primarch himself".', treasure: 'The captain\'s strongbox: 900 gp and a wand of web.' },
        { room: 'The Glimmerwood', title: 'Faces in the fungus', encounter: 'Glimmerwood ropers', gm: 'The fungus whispers the Hushfolk\'s dreams. Ropers among the stems. Sneak through, or fight.' },
        { room: 'The hall of stone sleepers', title: 'Come home, little heart', optional: true, gm: 'The petrified dreamers. A touch shows the grey woman in the vault and the words "come home, little heart". Let a player ask "whose heart?"' },
        { room: 'The Murmuring Stilts', title: 'The Hushfolk', read: 'A village of stilt-huts over black water. Grey-skinned people sit rocking in their sleep. One by one, without opening their eyes, they turn their faces toward the key in your pocket.', encounter: 'The Murmuring Stilts', gm: 'Mother Quorra can stop the dream-trolls and twin-sleepers attacking if the heroes douse their lights and promise to shut the sky-folk\'s pipes. She tells them about the grey woman who turned a key in the Eighth Seal a year ago. Ebbe goes pale.' },
        { room: 'The Listener\'s isle', title: 'The Listener', encounter: 'The Listener', gm: 'The aboleth speaks first, in every mind at once. It wants the titan re-sealed and will tell the heroes the truth for a promise: "The grey one has made her heart into a key, and you carry it." It will not say more ("you would not believe me; go and see"). Fight it, and it fights to the death for its lake. Either way, the heroes reach level 14 after this scene.', treasure: 'On the isle: the Listener\'s hoard of drowned things, 2,500 gp of old coin, a trident of fish command and a robe of eyes.' },
        { room: 'The crystal grotto', title: 'The Eighth Warden\'s last pages', optional: true, gm: 'Secret door off the lake shore (DC 18 Perception, or Quorra shows it). The Eighth Warden\'s notes say the seal was opened, not broken, by a grey woman with the Ninth Key.', treasure: 'The warden\'s lantern of revealing and a spell scroll of greater restoration.' },
        { room: 'The worm roads', title: 'The quiet way', optional: true, encounter: 'The worm', gm: 'A purple worm hunting by vibration. The loop under the chasm reaches the harvesters\' camp from behind.' },
        { room: 'The bone bridge', title: 'The bone bridge', encounter: 'Bone bridge cloakers', gm: 'The direct way to the camp, over a chasm on a titan-eaten rib, with cloakers beneath.' },
        { room: 'The harvesters\' camp', title: 'The sky-folk\'s pipes', read: 'White tents, blue mage-light and glass pipes full of slow black dreams. A woman in sky-blue robes turns from a vat, sees the key in your hand, and her face goes grey. "Oh no," she says. "She told us you would come. She said to let you pass."', encounter: 'The ichor harvesters', gm: 'Magus Lettice Mallory of the Concord and her guards. She was told by the Treasurer to let "the key and its bearers" pass. She is frightened enough to surrender to a firm word (DC 17 Persuasion or Intimidation). Her writ points to Lumenreach and the Treasurer. Smash the pipes and the Hushfolk sleep easier.', handout: 'concord-writ', treasure: 'The Concord camp: 1,500 gp in sky-marks, a staff of power, 4 flasks of sealed ichor (500 gp each to a wizard; evidence), and a Concord skyship passage token.' },
        { room: 'The black seep', title: 'Visions in the black', optional: true, gm: 'Raw ichor in the walls. A vision of a floating city and coins changing hands. A vivid hint for players who missed the writ.' },
        { room: 'The Broken Eighth Seal', title: 'The breathing hole', read: 'The great seal-stone lies in pieces around a hole, and out of the hole comes heat and a red glow and a breath so slow you could count a hundred between them. Something under the world is turning in its sleep. The pieces of the seal begin to move.', encounter: 'The seal-wound wakes', gm: 'The climax. The titan\'s dreaming stone sends earth elementals and xorns to guard its wound. Afterward, a DC 18 Arcana check on the seal-stone finds the keyhole turned once from outside. Holding the Ninth Key near it, the key grows hot, and for a moment the bearer hears a woman\'s voice, close and fond: "Not here, my dear. Not yet. Further down."', treasure: 'In the rubble: the Eighth Key, cracked (proof for the Concord), and a belt of stone giant strength the founders left as a ward-gift.' },
      ],
      wrapUp: 'The Eighth Seal was opened with a key. The ichor is being sold to Lumenreach. The Treasurer of the Concord signed the writs "by agreement with the Ninth Warden", who is supposed to be dead. Lettice Mallory\'s passage token (or a climb back up and a skyship) takes the heroes to the floating city. The heroes reach level 15.',
    },
    {
      id: 'lumenreach', title: 'Part 4: The City Above the Clouds', level: 15,
      summary: 'The floating city of Lumenreach has kept itself in the sky for twenty years on the titan\'s ichor. The heroes come to expose the trade, and find the Concord full of fools, the Treasurer a fiend, and a ledger that proves the dead woman is alive.',
      goal: 'Find proof of who has been selling the titan\'s dreams, unmask the Treasurer, and win passage down to the root.',
      map: lumenreach,
      npcs: [
        { npc: 'pf_nslebbe', x: 12, y: 68 },
        { npc: 'pf_nslvalentin', x: 40, y: 8 },
        { npc: 'pf_nslibbet', x: 66, y: 18, hidden: true },
      ],
      scenes: [
        { room: 'The Mooring Spires', title: 'Papers, please', read: 'The skyship slides in between the spires, and a giant in silver silks leans down to look at you, her face as big as a door. "Papers," she says. Two little whirlwinds spin at her heels.', encounter: 'Dock wardens', gm: 'The writ from the Hushdeep gets them in (DC 16 Deception to keep the dock-warden from reading the bottom line). Or fight, and the whole city knows they are here.' },
        { room: 'The Lantern Market', title: 'Quiet knives', encounter: 'Quiet knives in the market', gm: 'Shopping and rumours, then the Treasurer\'s knives. They have orders not to touch the key-bearer, only "the others". A captured knife says so. Clue!', treasure: 'Market goods are for sale here: any uncommon or rare consumable at book prices.' },
        { room: 'Hall of the Concord', title: 'The Concord in session', read: 'Eight mages in sky-blue sit in a crescent under a golden dome. The ninth throne is empty. A plump woman in striped silks at the end of the row smiles at you warmly, and somewhere behind your eyes a tiger yawns.', encounter: 'The Concord in session', gm: 'The heroes can accuse the Concord publicly (writs, ichor, Book of Quiet). Uproar. The Treasurer calls for their arrest, gently. If they fight, most councillors flee. Better to leave with half the Concord wavering and go after proof.' },
        { room: 'The Gardens of the Wind', title: 'The bound djinni', optional: true, encounter: 'The bound djinni', gm: 'Free the djinni and it owes one service: a fight, a flight, or a truth ("the Engine dreams of you").' },
        { room: 'The cloud giants\' terrace', title: 'The dice of the giants', optional: true, encounter: 'The cloud giants\' terrace', gm: 'Win a wager and the giants hold the bridges for the heroes during the climax, or carry them anywhere.', treasure: 'A won wager: 2,000 gp in giant-sized coins and a potion of cloud giant strength.' },
        { room: 'The Vault of Accounts', title: 'Payments to a dead woman', read: 'The pens scratch on in the dark of the vault, writing down every coin in the city. In the Treasurer\'s little back room, the ledger lies open on the desk, as if left for you. A letter in grey ink is pinned inside its cover.', encounter: 'Vault guardians', handout: 'treasurer-ledger', gm: 'The twist lands here. Payments to A.V. for months after the tower. And the letter: "they carry my heart without knowing it". Give the players a moment. The key in the bearer\'s pocket is warm, and for the first time they can feel it beating. (Now a DC 20 Arcana check identifies it as a phylactery.)', treasure: 'In the Treasurer\'s safe: 5,000 gp in gems and a rod of absorption.' },
        { room: 'The Archon\'s study', title: 'The Archon\'s choice', encounter: 'The Archon\'s wards', gm: 'Corrique, shown the ledger, turns on the Treasurer (DC 15 Persuasion, or automatic with the ledger in hand). Storm in without talking and he defends himself. Turned, he tells them the city is chained to "an anchor of unknown nature" far below: the Anchor chain leads straight down to the root.' },
        { room: 'The Aether Engine', title: 'The engine heart', read: 'The great black sphere shudders. Every chain in the city groans. The plump Treasurer stands at the valves with her hands on the wheel, and as you come in she lets the disguise fall away like a shawl: a tiger\'s head, smiling. "How interesting," she purrs. "Shall we see how far the city falls?"', encounter: 'The engine heart', gm: 'The climax of Part 4. Ibbet vents the vats: each round the city drops 100 feet and every creature makes a DC 15 Dexterity save or falls prone. Closing three valves (DC 15 Strength each, an action) stops it. Kill or banish her. The Archon (if turned) and the cloud giants (if won) arrive on round three.', treasure: 'The Concord\'s gratitude from the Archon: 8,000 gp, a +3 weapon of the heroes\' choice from the Concord armoury, and a ring of feather falling for each hero. And passage down the Anchor chain.' },
        { room: 'The Chain Walk', title: 'The back way', optional: true, gm: 'A one-plank walk along the great chain from the Engine to the Vault: the secret way in to steal the ledger without a fight at the coin-door.' },
      ],
      wrapUp: 'Lumenreach knows. The Treasurer is dead or banished, the Archon is ashamed and helpful, and the city will have to learn to sink slowly while its mages find another way. Aldreda Varrenhall is alive, undead, waiting at the root of the world, and the heroes have been carrying her heart in their pocket all along. The Concord lowers them down the Anchor chain. The heroes reach level 16.',
    },
    {
      id: 'ninth-vault', title: 'Part 5: The Ninth Seal', level: 16,
      summary: 'At the root of the world, where the Anchor chain is bolted into the titan\'s own hide, the founders\' vault holds the last seal. Aldreda waits there for her heart to come home.',
      goal: 'Reach the Ninth Seal, defeat Aldreda, and turn the key backward to re-forge the seals, whatever it costs.',
      map: ninthVault,
      npcs: [
        { npc: 'pf_nslebbe', x: 38, y: 6 },
        { npc: 'pf_nsloswin', x: 43, y: 6 },
        { npc: 'pf_nslaurienne', x: 14, y: 51 },
        { npc: 'pf_nslaldreda', x: 40, y: 63 },
      ],
      scenes: [
        { room: 'The Chain\'s Foot', title: 'The bolt in the titan', read: 'The chain\'s last link is driven into rock that is warm and faintly, slowly, rising and falling. Two stone wardens step out of the dark. Their eyes go to the key, and they speak together in Aldreda\'s voice: "Welcome home."', encounter: 'Chain wardens', gm: 'The golems test the bearer. Ordered in the key\'s name (DC 15 Charisma), they stop.' },
        { room: 'The Eight Echoes', title: 'The ring of broken locks', gm: 'The visions show Aldreda opening six seals. The glowing ninth keyhole reveals the backward turn (DC 20 Arcana; or Ebbe recalls the founders\' song "a key is for locking"; or the forge notes from the Stillhold). Make sure the players leave this room knowing the choice.' },
        { room: 'Hall of the First Wardens', title: 'The founders', optional: true, encounter: 'The honoured founders', gm: 'They mistake the bearer for Aldreda. Oswin\'s confession here turns them, and they ask the heroes to "turn it back and let her go with it".', treasure: 'In the ninth coffin, empty: a founder\'s holy avenger, left for "the one who comes to lock the last door".' },
        { room: 'The Angel\'s Watch', title: 'The Seal-Angel', encounter: 'The Seal-Angel', gm: 'Aurienne believes Aldreda\'s lie. Proof turns her (DC 18 Persuasion). Turned, she joins the final fight and can shield the hero turning the key.' },
        { room: 'The Warden Gate', title: 'Nine and one', encounter: 'The Warden Gate', gm: 'The password ("Nine and one") opens it for the bearer alone. The iron golem attacks anyone who follows. The heroes can split up, or fight through together.' },
        { room: 'The demon breach', title: 'The tear in the dream', encounter: 'The demon breach', gm: 'Demons climbing out of the titan\'s nightmares. Closing the tear stops more coming (three DC 20 Arcana successes). The secret door to Aldreda\'s workshop is behind the breach.' },
        { room: 'Aldreda\'s workshop', title: 'Thirty years alone', optional: true, encounter: 'Workshop wards', gm: 'Her journal confirms the phylactery. The portrait of Sabeth is the saddest thing in the campaign. The private way leads into the vault behind Aldreda.', treasure: 'Her spellbook (every wizard spell of 7th level or lower that a lich would know), a cloak of displacement, and Sabeth\'s ring, to return to her mother.' },
        { room: 'The Wound', title: 'The dragon on the titan\'s skin', encounter: 'The red wyrm in the Wound', gm: 'Calyxa Embersleep basks on living hide. She can be turned against Aldreda (DC 19 Persuasion) or fought. Psychic dreams for anyone who lingers.', treasure: 'Calyxa\'s hoard: 12,000 gp in coin and gems and a dragon slayer longsword.' },
        { room: 'The dreaming pool', title: 'She can see you too', optional: true, gm: 'Scry the vault (advantage on initiative in the final fight). Aldreda speaks through the water, warmly: "Come in, my dears. You need only open your hand."' },
        { room: 'The Ninth Seal', title: 'The last lock', read: 'She is smaller than you remembered, and greyer, and there is a hole in her chest where her heart should be. She smiles at you the way a teacher smiles at a favourite student. "You have carried it so far," Aldreda says. "Only a little further now. Turn it forward, and the world wakes up with a mind. Mine. Better me than nothing, surely?"', encounter: 'The Ninth Seal', gm: 'The final fight. Aldreda tries charm, bargain and threat on the bearer, never lethal force while the key lives. Turning the key backward takes three consecutive actions by one creature standing on the seal; each action deals 6d10 force damage to the turner (halved if Aurienne shields them). Oswin can volunteer, and dies doing it. When the key turns the third time it burns to ash, every seal re-forms with a sound like a great door closing, and Aldreda comes apart into grey dust with a look of surprise. If the heroes destroy her body first, she rises beside the key in 1 minute: the key is the only end.', treasure: 'When the seals re-form, the vault fills with light and the founders\' last gifts appear on the altar: a ring of three wishes with one wish left, and the Founders\' Charter of the order, blank, waiting for new names.' },
      ],
      wrapUp: 'With the key turned backward, Ossuvar the Unmade sleeps again under nine new seals, stronger than the first. The key is ash, and Aldreda with it. The world never knew how close it came, unless the heroes tell it.',
    },
  ],
  ending:
    'Good ending: the key turns backward, the nine seals re-forge, and Aldreda is destroyed with her phylactery. The heroes climb the Anchor chain into the sky to find Lumenreach sinking gently but safely, the Concord in disgrace, and the Lyceum holding a funeral for Sabeth Strake under her own name. Ebbe Brume asks the heroes to be the first names in the new order\'s charter, an order that tells the truth. If Oswin died on the seal, the order remembers him as the Primarch who paid for the Quiet. Bad ending: the key turns forward. The titan wakes, and its first thought is Aldreda\'s. Earthquakes shake every kingdom, the Hushdeep floods upward, and Lumenreach falls out of the sky. The heroes survive the vault (she lets them; she is fond of them) and must start a desperate campaign to bind a waking god with nothing but the eight cracked keys. Middle ending: Aldreda is beaten but the key survives (the heroes refused to turn it). The seal holds for now; she will rise again beside it, and she has all the time in the world. Next: who opened the first two seals, the ones Aldreda did not touch? Something else down there has been awake for a long time.',
};
