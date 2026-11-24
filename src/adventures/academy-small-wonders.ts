// Trouble at the Academy of Small Wonders: a funny, warm one-session adventure for 3-5 heroes of level 1.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder, rng } from './builder';
import type { Adventure } from './types';

// One map: Thimble Isle at night. The school stands in the middle (a courtyard ringed by the great hall,
// the dormitories, the library, the potion classroom, the clock tower and the tutors' wing). The grounds
// run down to the lake: greenhouse, broom shed, topiary garden, menagerie, boathouse and the ferry landing.
// The cellars are cut into the crag to the north: laundry, wine cellar, chalk store and the summoning chamber,
// reached by the cellar steps, the laundry chute, a tutor's secret passage and the old drain from the shore.
function thimbleIsle() {
  const b = new MapBuilder('adv-academy-small-wonders', 'The Academy of Small Wonders, Thimble Isle', 80, 80, { open: true, floor: 'grass', ambient: 'dim', wallStyle: 'stone' });
  const r = rng(2611);

  // ---------- the crag (north) and the lake (east and south) ----------
  b.rock(0, 0, 80, 16);
  b.water(0, 66, 66, 3);
  b.water(66, 16, 2, 53);
  b.water(68, 16, 12, 53, true);
  b.water(0, 69, 80, 11, true);
  b.paint(0, 62, 66, 4, 'sand').paint(64, 16, 2, 50, 'sand');
  // a ragged shoreline: little inlets of shallow water
  for (let x = 1; x < 60; x += 4 + Math.floor(r() * 4)) if (x < 27 || x > 36) b.water(x, 65, 1 + Math.floor(r() * 3), 1);
  for (let y = 36; y < 60; y += 5 + Math.floor(r() * 4)) b.water(65, y, 1, 1 + Math.floor(r() * 2));

  // ---------- the ferry landing (start) ----------
  b.floor(30, 64, 3, 9, 'wood-planks');
  b.paint(33, 51, 2, 13, 'dirt').paint(35, 59, 12, 2, 'dirt').paint(22, 54, 11, 2, 'dirt').paint(35, 53, 10, 2, 'dirt').paint(45, 53, 2, 3, 'dirt');
  b.area('Ferry landing', [[28, 61, 8, 12]], {
    read: 'The ferry bumps a little wooden jetty. Up the hill, the windows of a crooked stone school glow pink, then green, then pink again. Somebody somewhere is shouting "Put me DOWN!"',
    gm: 'The heroes arrive here on the last ferry of the night. Old Mossop Hobb ties up, hands over the crate of newts, and refuses to go any further up the hill ("I only do boats"). He will wait until dawn to take the inspector back. A DC 10 Perception sees a broom carry a prefect out of an upper window and drop him in the lake (he swims ashore, furious, and fine).',
    label: [31, 66],
  });
  b.props_('mooring-post', [[30, 71], [32, 71], [30, 65]]).prop('lantern-standing', 32, 64).prop('signpost', 29, 62).props_('crate', [[34, 63], [35, 63]]).prop('sack', 29, 63).prop('rowboat', 29, 70, 90).prop('fishing-net', 28, 64);
  b.light(32, 64, 15, 20);
  b.start(30, 65, 3, 3);

  b.area('Lakeshore', [[0, 62, 28, 4]], {
    read: 'A pebbly beach runs along the lake. The water laps quietly. Every so often something in the reeds says "ribbit" in a voice that is far too deep.',
    gm: 'A pleasant walk. Three giant frogs from the menagerie have escaped to the boathouse (they croak at the heroes but do not leave it). A DC 12 Investigation along the tide line finds a soggy page of homework in Nettie\'s handwriting that blew out of a window.',
    label: [12, 63],
  });
  b.props_('reeds', [[4, 65], [15, 64], [22, 65], [55, 64]]).prop('log-fallen', 8, 63).prop('canoe', 18, 63, 90).prop('campfire-cold', 25, 62).props_('boulder', [[2, 62], [50, 63]]).prop('lily-pads', 10, 67);

  // ---------- the boathouse ----------
  b.building('Boathouse', 42, 61, 10, 9, {
    mat: 'wood-planks',
    read: 'A tarry old boathouse half over the water. Rowing boats bob in the wet dock, and on every bench sits a frog the size of a sheepdog, blinking at you.',
    gm: 'Three giant frogs (the menagerie\'s "Rowing Club") have moved in. They are not hungry, just sulky: a thrown bucket of fish from the crate makes them friends, and a DC 12 Animal Handling shoos them back to the menagerie. A rowboat here reaches the founder\'s islet in a few minutes.',
    doors: [[46, 61, 'n', 'closed'], [42, 65, 'w', 'closed'], [46, 69, 's', 'open', 'door-double'], [47, 69, 's', 'open', 'door-double']],
    windows: [[44, 61, 'n'], [51, 64, 'e']],
  });
  b.water(45, 64, 4, 6, true);
  b.prop('rowboat', 46, 66, 90).prop('canoe', 47, 64, 90).props_('bench', [[43, 63], [50, 63]]).prop('fish-crate', 43, 67).prop('rope-coil', 50, 66).prop('anchor', 50, 68).prop('fishing-gear', 43, 62).prop('lantern-hanging', 47, 62).prop('sails-pile', 44, 68);
  b.light(47, 62, 10, 15);
  b.encounter('Frogs in the boathouse', [42, 61, 10, 9], [['giantFrog', 3]], 'low');

  // ---------- the founder's islet ----------
  b.floor(71, 71, 6, 5, 'grass').paint(71, 75, 6, 1, 'sand').paint(71, 71, 1, 4, 'sand');
  b.area("Founder's islet", [[71, 71, 6, 5]], {
    read: 'A hump of grass in the dark water, with one willow and a mossy statue of a small wizard in a very large hat. Someone has hung a scarf on the statue.',
    gm: 'Founder Barnaby Wick, who started the school with three pupils and a goat. Every new pupil rows out to put a scarf on him. A loose stone in the plinth (DC 12 Investigation) hides the founder\'s Driftglobe and a note: "For whoever needs a light in a dark place. Put it back after."',
    label: [73, 73],
  });
  b.prop('statue-tall-robed', 73, 73).prop('tree-willow', 75, 72).prop('rowboat', 71, 74, 90).prop('gm-treasure', 74, 74, 0, { gm: true }).prop('flowers', 72, 72);

  // ---------- the gatehouse ----------
  b.building('Gatehouse', 30, 45, 8, 6, {
    mat: 'stone-flagstone',
    read: 'A squat stone gatehouse with the school crest over the arch: an owl wearing spectacles. The gates are barred on the inside, and a sign says LATE PUPILS KNOCK TWICE AND APOLOGISE.',
    gm: 'Knock twice and Nettie unbars the gate. The east room is the lost property cupboard: forty odd socks, a stuffed owl, a whistle that only cats can hear, and one Potion of Healing labelled "FOR EMERGENCIES (REAL ONES)".',
    doors: [[33, 45, 'n', 'open', 'door-double'], [34, 45, 'n', 'open', 'door-double'], [33, 50, 's', 'closed', 'door-double'], [34, 50, 's', 'closed', 'door-double'], [32, 47, 'e', 'closed'], [35, 48, 'w', 'closed']],
    windows: [[30, 47, 'w'], [37, 47, 'e']],
  });
  b.wallRun(32, 45, 6, 'e').wallRun(34, 45, 6, 'e');
  b.area("Porter's lodge", [[30, 45, 3, 6]], {
    read: 'A cosy little room with a kettle, a cot and a big brass key board. Under the desk, a girl in an inky robe is hugging a ginger cat. The cat glares at you as if you are late.',
    gm: 'Nettie Bramblecombe hides here with the headmistress (the cat). Nettie confesses at once and in tears: she tried the Grand Summons from the forbidden section because she is the only pupil without a familiar. She has her homework diagram (handout). The cat taps letters on Nettie\'s slate: N-O-T H-E-R F-A-U-L-T.',
    label: [31, 47],
  });
  b.prop('desk', 30, 46).prop('cot', 31, 49).prop('stove', 30, 50).prop('key-ring', 32, 46).prop('rug-round', 31, 48);
  b.props_('crate-stack', [[36, 46], [37, 49]]).prop('trunk', 36, 48).prop('coat-rack', 37, 46).prop('gm-treasure', 36, 50, 0, { gm: true });
  b.prop('lantern-hanging', 33, 47).light(33, 47, 10, 15).light(31, 48, 5, 10);

  // ---------- the courtyard ----------
  b.paint(25, 26, 18, 19, 'stone-cobble');
  b.pool(34, 35, 2.5, 2.5);
  b.area('Courtyard', [[25, 26, 18, 19]], {
    read: 'A cobbled courtyard with a fountain shaped like a frog spitting water at a fish. Brooms zip through the air in a tight squadron, sweeping everything they find. A dinner lady is stuck at the top of a lamp post, holding a ladle.',
    gm: 'Three runaway brooms sweep anything that moves "into a neat pile". Ways to win without fighting: shout "Brooms, REST!" in a teacher\'s voice (DC 12 Intimidation or Deception), tangle them in a net or a tablecloth (DC 12 Dexterity), or dump a sack of dust in the fountain so they all dive in to tidy it. Rescuing the dinner lady (DC 10 Athletics) earns three warm treacle tarts.',
    label: [29, 32],
  });
  b.wallRun(25, 44, 5, 's', 'low').wallRun(38, 44, 5, 's', 'low').wallRun(42, 34, 4, 'e', 'low').wallRun(42, 40, 5, 'e', 'low');
  b.prop('fountain-grand', 33, 34).props_('tree-oak', [[26, 28], [41, 28], [26, 43], [41, 43]]).props_('bench', [[29, 37], [39, 37]]).props_('lamp-post', [[30, 30], [38, 30], [30, 41], [38, 41]]);
  b.prop('notice-board', 25, 31).prop('statue', 26, 36).props_('flowers', [[28, 27], [36, 27], [27, 39]]).props_('debris-wood', [[31, 28], [37, 39]]).prop('broken-furniture', 40, 33).prop('sack', 35, 43).prop('handcart', 28, 43);
  b.light(30, 30, 15, 20).light(38, 30, 15, 20).light(30, 41, 15, 20).light(38, 41, 15, 20).light(33, 34, 5, 10, '#ff9adf');
  b.encounter('The broom brigade', [25, 26, 18, 19], [['runawayBroom', 3]], 'low');

  // ---------- the great hall ----------
  b.building('Great hall', 25, 16, 18, 10, {
    mat: 'stone-flagstone',
    read: 'Long tables are laid for an exam-night feast. The forks and spoons are fencing each other over the gravy. At the high table, an enormous suit of armour is carving the roast with great care, and telling everyone to sit up straight.',
    gm: 'Sir Clank, the school\'s ceremonial armour, has woken up believing he is the headmaster. Two carving knives hover at his sides like prefects. Calm him with a polish and a "Yes, sir" (DC 12 Persuasion), by reciting the school rules from the notice board, or by showing him the headmistress (he salutes the cat and sits back down). Master Sallowmere turns up here to "help" (see Sir Clank at supper). The cellar steps go down behind the high table. The portrait of the founder on the west wall is a secret door to the common room: say "please" to it.',
    doors: [[33, 25, 's', 'open', 'door-double'], [34, 25, 's', 'open', 'door-double'], [33, 16, 'n', 'closed', 'door-double'], [34, 16, 'n', 'closed', 'door-double'], [42, 20, 'e', 'closed'], [25, 24, 'w', 'secret']],
    windows: [[28, 25, 's'], [39, 25, 's']],
  });
  b.props_('table-long', [[28, 19], [28, 22], [39, 19], [39, 22]]).props_('bench-long', [[28, 20], [28, 23], [39, 20], [39, 23]]).prop('feast-hall-table', 33, 18).props_('chair-high-back', [[32, 17], [35, 17]]);
  b.prop('chandelier-great', 33, 21).props_('banner-hanging-tall', [[26, 17], [41, 17]]).prop('hearth-grand', 26, 20).prop('organ-cathedral', 41, 22).prop('armor-stand', 27, 17).prop('tapestry-tall', 26, 24).prop('lectern-dais', 30, 17).prop('candelabra-grand', 37, 17).prop('stairs-down', 34, 17);
  b.light(33, 21, 20, 20).light(26, 20, 10, 15, '#ff8c4a').light(37, 17, 10, 10);
  b.encounter('Sir Clank at supper', [25, 16, 18, 10], [['animatedArmor', 1], ['flyingSword', 2]], 'moderate');

  // ---------- the dormitories and common room ----------
  b.building('Dormitories', 14, 16, 11, 12, {
    mat: 'wood-planks',
    read: 'Two long dormitories under the eaves, every bed made into a pillow fort. Small squeaky voices come from inside the forts, and they are chanting.',
    gm: 'The pupils\' pet mice have woken up clever and built a pillow kingdom (two swarms of rats, really mice). They swarm anyone who knocks a fort down. A cheese, a song, or carefully crawling in to negotiate (DC 11 Persuasion while lying on the floor) sends them back to their cages. The hatch in the north wall is the laundry chute: it drops straight down to the laundry in the cellars (DC 12 Athletics to climb back up).',
    doors: [[17, 16, 'n', 'closed'], [24, 26, 'e', 'closed'], [14, 20, 'w', 'closed'], [21, 27, 's', 'secret']],
    windows: [[14, 18, 'w'], [14, 25, 'w']],
  });
  b.wallRun(14, 23, 11, 's').wallRun(19, 16, 7, 'e').door(16, 23, 's', 'closed').door(22, 23, 's', 'closed');
  b.area('Common room', [[14, 24, 11, 4]], {
    read: 'Squashy armchairs, a crackling fire and a hundred years of initials carved into the mantelpiece. A big portrait of a little old wizard hangs on the east wall, smiling politely.',
    gm: 'The portrait (Founder Wick) swings open into the great hall if anyone says "please". The bookcase by the south wall is a secret door (DC 13 Perception, or any pupil knows it) into the forbidden section: the pupils use it to read the scary books after lights out.',
    label: [17, 25],
  });
  b.props_('bunk-bed', [[15, 17], [15, 19], [15, 21], [18, 19], [18, 21], [21, 17], [23, 17], [21, 20], [23, 20]]).props_('footlocker', [[16, 18], [22, 18]]).prop('trapdoor', 17, 16).prop('sack', 18, 17).prop('rug-round', 21, 22).prop('wardrobe', 24, 22);
  b.prop('fireplace', 15, 24).prop('armchair', 16, 25).prop('sofa', 19, 26).prop('table-cards', 21, 25).prop('book-pile', 23, 25).prop('rug-pelt', 18, 25).prop('candles', 23, 24).prop('tapestry-tall', 24, 24).prop('bookcase-secret', 21, 27);
  b.light(15, 24, 10, 15, '#ff8c4a').light(21, 19, 5, 10);
  b.encounter('Mice in the pillow fort', [14, 16, 11, 8], [['swarmOfRats', 2]], 'low');

  // ---------- the library and the forbidden section ----------
  b.building('Library', 14, 28, 11, 20, {
    mat: 'wood-planks-dark',
    read: 'Tall stacks lean together like gossiping aunts. Books flap overhead in a dark, rustling flock, and every so often one swoops down and snaps at someone\'s ear.',
    gm: 'Three flocks of flapping books. They hate noise: shout "SHHHH!" together and they settle on the shelves (DC 12 group Charisma check). A lamp waved at them makes them flee too. The librarian\'s desk holds the lending log: Nettie\'s name is NOT on it, but "F.S." took out "Advanced Circles" last week.',
    doors: [[19, 33, 's', 'locked', 'door-iron'], [24, 38, 'e', 'closed', 'door-double'], [24, 39, 'e', 'closed', 'door-double'], [14, 42, 'w', 'closed']],
    windows: [[14, 36, 'w'], [14, 45, 'w'], [17, 47, 's'], [21, 47, 's']],
  });
  b.wallRun(14, 33, 11, 's');
  b.area('Forbidden section', [[14, 28, 11, 6]], {
    read: 'Behind an iron door, chained books grumble on their shelves. A single heavy book lies open on a lectern, as if someone wanted it found.',
    gm: 'The iron door is locked (DC 13 thieves\' tools; the key is in the headmistress\'s office) but the secret bookcase from the common room gets in easily. The open book is "Grand Summons of a Familiar". Its margin warns about an eighth rune (handout). A DC 13 Investigation notices the door was unlocked and relocked last night with a tutor\'s key: there are violet chalk smudges on the handle. A Spell Scroll of Magic Missile sits in a chained case marked "Not for pupils".',
    label: [19, 30],
  });
  b.props_('bookcase-grand', [[15, 29], [23, 29]]).prop('chains-hanging', 17, 30).prop('levitating-tome', 21, 31).prop('lectern', 19, 31).prop('scroll-rack', 15, 32).prop('cage-hanging', 23, 32).prop('candle-ring', 19, 29).prop('display-case', 17, 32).prop('gm-treasure', 17, 32, 0, { gm: true });
  for (const x of [16, 18, 20, 22]) for (const y of [35, 36, 37, 41, 42, 43]) b.prop('library-stack', x, y);
  b.prop('bookcase-ladder', 23, 36).prop('desk', 21, 39).prop('chair', 21, 40).prop('lectern', 16, 39).prop('table-reading', 17, 45).props_('chair', [[16, 45], [18, 45]]).prop('reading-nook', 15, 46).prop('globe-stand', 23, 45).props_('book-pile', [[20, 46], [19, 39]]);
  b.light(19, 31, 5, 15, '#9ad0ff').light(21, 39, 10, 15).light(17, 45, 10, 15);
  b.encounter('Flapping books', [14, 34, 11, 14], [['flappingBookFlock', 3]], 'low');

  // ---------- the potion classroom ----------
  b.building('Potion classroom', 43, 16, 11, 10, {
    mat: 'stone-flagstone',
    read: 'Cauldrons bubble on their own. Last week\'s homework has climbed out of them: one lumpy brown blob, one lumpy grey blob, and a cloud of steam with a very bad temper, all arguing about whose turn it is.',
    gm: 'Three bits of failed homework (two lumps of lumpy homework and a cross steam cloud). They want to be marked: give each a grade higher than a C (DC 11 Deception or Persuasion each) and they glow with pride and slop back into the cauldrons. A failing grade makes them attack. Nettie\'s cauldron still has half a batch of Un-Cat Tonic in it (see Homework with legs).',
    doors: [[46, 25, 's', 'closed'], [53, 23, 'e', 'closed']],
  });
  b.wallRun(49, 16, 5, 'e').wallRun(50, 20, 4, 's').door(49, 18, 'e', 'closed');
  b.area('Ingredient store', [[50, 16, 4, 5]], {
    read: 'Jars of eyes (newts\'), toes (frogs\'), and something labelled simply "BITEY" line the shelves.',
    gm: 'Everything for the Un-Cat Tonic except a moonbell flower, which grows in the greenhouse. Two Potions of Healing on the top shelf, in a box marked "Matron".',
    label: [51, 18],
  });
  b.props_('cauldron', [[45, 19], [48, 22], [45, 22]]).prop('cauldron-tripod', 47, 19).prop('alchemy-table', 44, 24).props_('desk', [[47, 24], [49, 24]]).prop('notice-board', 44, 17).prop('green-slime', 46, 21).prop('potion-shelf', 52, 22).prop('potion-rack', 52, 24);
  b.prop('shelf-jars', 51, 17).prop('herbs-drying', 53, 17).prop('wall-shelves', 50, 19).prop('potion-set', 53, 19);
  b.light(45, 19, 10, 15, '#7dff9a').light(48, 22, 10, 15, '#7dff9a').light(51, 18, 5, 10);
  b.encounter('Homework with legs', [43, 16, 7, 10], [['homeworkBlob', 2], ['homeworkSteamCloud', 1]], 'low');

  // ---------- the clock tower ----------
  b.building('Clock tower', 43, 26, 8, 8, {
    mat: 'stone-cobble',
    read: 'A spiral stair winds up into the ticking dark. The great bell is ringing all by itself, and the hands of the clock face are spinning backwards. From somewhere among the gears comes a small, tired voice: "Is anyone in charge here?"',
    gm: 'Grizzleworth, an imp pulled through the circle, has jammed the clock while trying to find a way home. He is cross, not cruel. Offer him a fair written deal (DC 12 Persuasion, or any signed contract) and he unjams the clock and tells what he saw: "Somebody drew an eighth rune. In grown-up handwriting. Violet chalk." If attacked, he turns invisible and stings from the rafters. The top of the stair opens onto the clock face, high over the courtyard.',
    doors: [[43, 30, 'w', 'closed'], [50, 29, 'e', 'closed']],
    windows: [[47, 33, 's']],
  });
  b.prop('stair-spiral', 46, 29).prop('temple-bell', 48, 27).prop('orrery', 44, 27).prop('winch', 49, 32).prop('lever', 44, 32).prop('chains-hanging', 47, 31).prop('rope-coil', 49, 27).prop('cobweb-corner', 43, 33).prop('lantern-hanging', 46, 31);
  b.light(46, 31, 10, 15);
  b.encounter('Grizzleworth in the clockworks', [43, 26, 8, 8], [['imp', 1]], 'low');
  b.area("Tutors' garden", [[51, 26, 3, 8]], {
    read: 'A narrow strip of lawn between the tower and the tutors\' wing, with a sundial stone and a bench nobody ever sits on.',
    gm: 'Quiet. A DC 12 Perception finds a trail of violet chalk dust from the tutors\' wing door toward the cellar side of the crag, and then nothing (it goes through the secret passage).',
    label: [52, 29],
  });
  b.prop('standing-stone', 52, 28).prop('bench', 52, 31).prop('bush', 51, 33).prop('flowers', 53, 26);

  // ---------- the tutors' wing ----------
  b.building("Tutors' wing", 54, 16, 10, 18, {
    mat: 'wood-planks',
    read: 'A hushed corridor of polished floors and closed doors with brass name plates. It smells of pipe smoke and peppermints.',
    gm: 'Three rooms off the corridor: Master Sallowmere\'s study (locked), the headmistress\'s office and the staff room. The other tutors are all out on the lake shore hunting for runaway pupils.',
    doors: [[55, 33, 's', 'closed'], [63, 31, 'e', 'closed'], [56, 19, 'w', 'locked'], [56, 24, 'w', 'closed'], [56, 30, 'w', 'closed'], [60, 16, 'n', 'secret']],
    windows: [[63, 18, 'e'], [63, 25, 'e'], [59, 33, 's']],
  });
  b.wallRun(56, 16, 6, 'w').wallRun(56, 21, 8, 's').wallRun(56, 22, 6, 'w').wallRun(56, 27, 8, 's').wallRun(56, 28, 6, 'w');
  b.area("Tutors' corridor", [[54, 16, 2, 18]], { gm: 'A rug runner and a row of name plates: PUDDINGSTONE, QUILL, SALLOWMERE, and a spare plate in a drawer that already reads "HEADMASTER SALLOWMERE".', label: [55, 22] });
  b.props_('rug-runner', [[54, 20], [54, 27]]).prop('armor-stand', 55, 29).prop('lantern-wall', 55, 18).prop('coat-rack', 55, 32);
  b.area("Master Sallowmere's study", [[56, 16, 8, 6]], {
    read: 'A neat, cold study. Every pencil is sharpened to the same length. On the desk lies a stack of exam papers, all marked F, and a sealed letter.',
    gm: 'The door is locked (DC 13 thieves\' tools, or DC 14 Athletics to shoulder it). Two letter openers guard the desk and fly at anyone who touches it. The letter is Corvin\'s report to the Board, dated yesterday (handout). His strongbox (DC 13 to open) holds 30 gp and two sticks of violet chalk. A DC 13 Investigation finds the secret door in the north wall: a bookshelf that swings back onto a stair down to the cellars.',
    label: [60, 18],
  });
  b.prop('writing-desk', 61, 18).prop('chair-high-back', 62, 18).prop('bookshelf-tall', 59, 16).prop('map-cabinet', 57, 17).prop('armchair', 57, 20).prop('rug', 60, 19).prop('strongbox', 63, 20).prop('scroll-pile', 62, 16).prop('gm-secret-door', 60, 16, 0, { gm: true }).prop('gm-treasure', 63, 20, 0, { gm: true });
  b.light(61, 17, 5, 10);
  b.encounter('The letter openers', [56, 16, 8, 6], [['flyingSword', 2]], 'low');
  b.area("Headmistress's office", [[56, 22, 8, 6]], {
    read: 'A cheerful clutter of a room: a tottering pile of books, a telescope pointed at the lake, and a cat basket with a tartan cushion, which seems a bit sad now.',
    gm: 'Dame Puddingstone\'s office. The key to the forbidden section hangs on a hook. Her spellbook lies open at "Closing a Circle". If the cat is here she curls up in the basket and points one paw at the page. Nettie can read the closing lines from it (or from her homework).',
    label: [60, 25],
  });
  b.prop('desk', 60, 23).prop('chair-high-back', 61, 23).prop('bookcase-grand', 63, 23).prop('globe-stand', 57, 23).prop('crystal-ball', 59, 23).prop('rug-round', 58, 26).prop('telescope', 62, 26).prop('book-pile', 57, 25).prop('key-ring', 63, 26);
  b.light(60, 24, 10, 15);
  b.area('Staff room', [[56, 28, 8, 6]], {
    read: 'Saggy chairs, a cold teapot, and a biscuit tin with a sign on it: THESE ARE COUNTED.',
    gm: 'The chalk ledger is pinned to the notice board (handout): Corvin signed out three sticks of violet tutors\' chalk on exam night. The biscuit tin really is counted. A DC 12 Perception finds his chalky gloves stuffed behind a cushion.',
    label: [59, 30],
  });
  b.prop('table-round-large', 59, 30).props_('chair', [[58, 30], [60, 30], [59, 31]]).prop('sofa', 62, 32).prop('cupboard', 57, 29).prop('stove', 62, 29).prop('notice-board', 57, 32);
  b.light(59, 30, 10, 15);

  // ---------- the menagerie and paddock ----------
  b.building('Menagerie', 45, 36, 16, 12, {
    mat: 'dirt',
    read: 'Every cage door hangs open. On an upturned crate in the middle, a tiny dragon in a red neckerchief is giving a speech to a crowd of cats, owls, rats and frogs: "...and we will NOT be turned into teacups for practice ANY MORE!" The crowd cheers.',
    gm: 'The Amalgamated Society of Familiars is on strike. The chair, Sorrel Brightscale (a pseudodragon), has a list of demands (handout). Hidden in the crowd is Tick, Corvin\'s homunculus, who saw everything and is too scared to say so. Agree to most of the demands and sign (DC 12 Persuasion; a bag of treats or sardines gives advantage), and the union goes back to work and lets Tick speak. Insult them and the whole meeting attacks. Nettie, if present, may be chosen by a familiar here at last.',
    doors: [[45, 41, 'w', 'open', 'door-double'], [45, 42, 'w', 'open', 'door-double'], [52, 47, 's', 'closed'], [60, 42, 'e', 'closed']],
    windows: [[47, 36, 'n'], [57, 36, 'n']],
  });
  b.wallRun(45, 39, 2, 's', 'bars').wallRun(48, 39, 4, 's', 'bars').wallRun(53, 39, 5, 's', 'bars').wallRun(59, 39, 2, 's', 'bars');
  b.wallRun(49, 36, 4, 'e', 'bars').wallRun(54, 36, 4, 'e', 'bars');
  b.wallRun(56, 43, 2, 'n', 'bars').wallRun(59, 43, 2, 'n', 'bars').wallRun(56, 43, 5, 'w', 'bars');
  b.area('Owl aviary', [[56, 43, 5, 5]], { gm: 'The owls\' corner, full of perches and pellets. The broken window the union complains about is up here. A DC 12 Investigation of the nests turns up a silver thimble (5 gp) and a lost exam ring.', label: [58, 45] });
  b.prop('haystack', 46, 37).prop('water-trough', 51, 37).prop('chicken-coop', 59, 37).prop('cage', 56, 37).prop('crate', 52, 42).props_('banner-pole', [[49, 42], [54, 44]]).prop('rug-pelt', 50, 44).prop('table-round', 48, 45).prop('notice-board', 46, 46).prop('hay-bale', 47, 46);
  b.props_('stump', [[57, 45], [59, 46]]).prop('tree-dead', 58, 44).prop('sack', 46, 44).prop('cage-hanging', 53, 46).prop('lantern-hanging', 52, 40);
  b.light(52, 40, 15, 20).light(48, 45, 5, 10);
  b.encounter("The Familiars' Union", [45, 36, 16, 12], [['pseudodragon', 1], ['giantOwl', 2], ['cat', 6], ['giantRat', 2], ['homunculus', 1]], 'moderate');
  b.area('Paddock', [[45, 48, 16, 8]], {
    read: 'A grassy paddock with a pond and a goat house. The school goat is the only animal not on strike. She is eating the strike banners.',
    gm: 'Bertha the goat is a loyal, ordinary goat. A crate of sardines sits in the feed shed here: perfect for bargaining with the union.',
    label: [52, 51],
  });
  b.pool(56, 52, 2, 1.5);
  b.props_('fence-wood', [[45, 55], [48, 55], [51, 55], [54, 55], [57, 55], [60, 55], [60, 50]], 90).prop('fence-gate', 45, 52).prop('hay-bale', 48, 50).prop('horse-trough', 50, 52).prop('lean-to', 59, 49).prop('fish-crate', 58, 49).prop('reeds', 57, 53).prop('lily-pads', 55, 52);

  // ---------- the greenhouse ----------
  b.building('Greenhouse', 2, 29, 10, 15, {
    mat: 'dirt',
    read: 'Warm, wet air fogs your glasses. Snapdragons snap, the creepers creep, and two tiny glowing people sit on a mushroom, giggling and pelting you with seeds.',
    gm: 'Two sprites live here and have joined in the mischief. Four snapdragon shrubs snap at ankles. The sprites love riddles and compliments: win a riddle contest (DC 12 Intelligence) or praise their garden properly (DC 11 Persuasion) and they call the plants off. The moonbell flower for the Un-Cat Tonic grows in the pond bed; the sprites will pick it if asked nicely.',
    doors: [[11, 36, 'e', 'closed'], [6, 43, 's', 'closed']],
    windows: [[2, 31, 'w'], [2, 34, 'w'], [2, 37, 'w'], [2, 40, 'w'], [4, 29, 'n'], [8, 29, 'n'], [11, 31, 'e'], [11, 40, 'e'], [9, 43, 's']],
  });
  b.mud(3, 31, 3, 3).mud(8, 31, 3, 3).mud(3, 37, 3, 3);
  b.pool(8.5, 39.5, 1.5, 1.5);
  b.props_('crop-rows', [[4, 32], [9, 32]]).prop('mushroom-giant', 4, 38).props_('flowers', [[6, 35], [9, 35]]).prop('thorn-bush', 10, 34).props_('ferns', [[3, 42], [10, 38]]).prop('tree-palm', 6, 30).prop('lily-pads', 8, 39).prop('reeds', 9, 40).prop('workbench', 10, 42).prop('pottery', 7, 42).prop('water-barrel', 10, 30);
  b.light(6, 36, 10, 15, '#b4ffb0');
  b.encounter('Snapdragons', [2, 29, 10, 15], [['sprite', 2], ['snapdragonShrub', 4]], 'low');

  // ---------- the broom shed and the west lawn ----------
  b.building('Broom shed', 3, 18, 7, 6, {
    mat: 'wood-planks',
    read: 'A shed of empty broom racks. Every hook is bare, and the door has been sprung outward, as if something burst out.',
    gm: 'Where the brooms woke up. The groundskeeper\'s first-aid box ("FOR FLYING LESSONS") holds two Potions of Healing and 5 gp in lost coins. A DC 12 Arcana on the racks: the brooms were woken by a wave of magic from under the crag, not by anything here.',
    doors: [[9, 21, 'e', 'open']],
    windows: [[5, 18, 'n']],
  });
  b.props_('staff-stand', [[4, 19], [5, 19], [6, 19]]).prop('tool-wall', 8, 19).prop('barrel', 4, 22).prop('workbench', 7, 22).prop('chest', 8, 22).prop('gm-treasure', 8, 22, 0, { gm: true });
  b.area('West lawn', [[0, 24, 13, 4]], {
    read: 'A wide lawn under the crag, marked out for broom lessons with little flags. A practice dummy lies face down, swept into a neat pile with some leaves.',
    gm: 'Open ground. From here you can see the greenhouse glowing green and the pink light pulsing from a grating at the foot of the crag (the summoning chamber, far below).',
    label: [6, 26],
  });
  b.props_('banner-pole', [[2, 25], [11, 25]]).prop('training-dummy', 6, 26).props_('tree-oak', [[1, 17], [11, 17], [12, 30], [1, 46]]).prop('beehive', 12, 44).prop('crop-rows', 4, 46);

  // ---------- the topiary garden (south-west) ----------
  b.paint(6, 50, 16, 10, 'grass');
  b.wallRun(6, 50, 6, 'n', 'low').wallRun(14, 50, 8, 'n', 'low').wallRun(6, 59, 11, 's', 'low').wallRun(19, 59, 3, 's', 'low').wallRun(6, 50, 10, 'w', 'low').wallRun(21, 50, 4, 'e', 'low').wallRun(21, 56, 4, 'e', 'low');
  b.wallRun(10, 53, 8, 'n', 'low').wallRun(10, 56, 3, 's', 'low').wallRun(15, 56, 3, 's', 'low').wallRun(10, 53, 4, 'w', 'low').wallRun(17, 53, 4, 'e', 'low');
  b.area('Topiary garden', [[6, 50, 16, 10]], {
    read: 'Hedges clipped into owls, toads and a very proud cat ring a little wishing well. One of the hedge owls turns its head to watch you go by.',
    gm: 'A small hedge maze. The hedges only move their heads; they are harmless gossips and, asked politely, tell the heroes they saw "the tall tutor with the purple fingers" walk to the tutors\' wing just before the bang. The wishing well holds 3d10 cp, 2 sp and a silver ring (10 gp).',
    label: [8, 57],
  });
  b.prop('well', 13, 54).props_('hedge', [[7, 51], [20, 51], [7, 58], [20, 58]]).props_('statue', [[12, 51], [15, 58]]).prop('bench', 18, 54).props_('flowers', [[11, 55], [16, 54]]).prop('gm-treasure', 14, 55, 0, { gm: true });

  // ---------- the east shore and the old drain mouth ----------
  b.area('Old drain mouth', [[63, 14, 5, 5]], {
    read: 'Where the crag meets the lake, a round brick drain mouth breathes out warm air that smells of chalk and smoke. Faint pink light flickers far inside.',
    gm: 'The old drain runs up under the crag to the summoning chamber. It is wet, low and long: heroes arrive damp and grumpy but unharmed. A back way in that Corvin does not expect.',
    label: [65, 16],
  });
  b.prop('sewer-outflow', 65, 17).props_('reeds', [[66, 19], [67, 24]]).prop('boulder', 64, 21).prop('rowboat', 64, 28, 90);

  // ================= THE CELLARS (cut into the crag) =================
  b.room('Laundry', 9, 4, 10, 7, {
    mat: 'stone-flagstone',
    read: 'A steamy laundry full of copper tubs and drying lines. A mountain of sheets sits under a hatch in the ceiling, and the irons are doing the ironing by themselves, quite nicely.',
    gm: 'The laundry chute from the dormitories drops onto the sheet pile (no damage). The irons are friendly and only want to press things: let them and your clothes come out crisp. A door east leads to the wine cellar.',
  });
  b.prop('washbasin', 10, 5).prop('bathtub', 11, 9).prop('water-barrel', 12, 5).props_('loot-sacks', [[15, 9], [16, 9]]).prop('flour-sacks', 17, 10).prop('cauldron', 13, 7).prop('stove', 10, 8).prop('table-trestle', 14, 5).prop('winch', 16, 6).prop('lantern-hanging', 13, 6);
  b.light(13, 6, 10, 15);
  b.floor(17, 11, 1, 5, 'stone-flagstone');
  b.area('Laundry chute', [[17, 11, 1, 5]], { gm: 'A steep, slippery stone chute. Sliding down takes one second and a shriek. Climbing up takes a DC 12 Athletics check.', label: [17, 13] });
  b.hall(19, 7, 21, 7, 1, { mat: 'dungeon-slab' }).door(22, 7, 'w', 'closed');
  b.room('Wine cellar', 22, 3, 9, 8, {
    mat: 'dungeon-slab',
    read: 'Barrels and dusty racks of bottles. Every cork has popped out at once, and the air is thick with the smell of old elderflower wine.',
    gm: 'Quiet, sticky and safe. A DC 12 Investigation behind the racks finds a forgotten purse (12 sp) and a bottle of 50-year-old Founder\'s Reserve (worth 10 gp, or one very happy headmistress).',
  });
  b.props_('barrel-stack', [[23, 4], [23, 9]]).props_('wine-rack', [[25, 3], [27, 3], [29, 3]]).prop('keg-rack', 29, 9).prop('barrel-group', 26, 9).prop('cobweb-corner', 30, 3).prop('puddle', 27, 6).prop('gm-treasure', 29, 4, 0, { gm: true });
  b.light(26, 6, 5, 10);
  b.hall(31, 8, 33, 8, 1, { mat: 'dungeon-slab' }).hall(33, 8, 33, 10, 1, { mat: 'dungeon-slab' }).door(31, 8, 'w', 'closed');
  b.floor(33, 11, 2, 5, 'stone-flagstone');
  b.area('Cellar steps', [[33, 11, 2, 5]], {
    read: 'Worn steps spiral down behind the high table. With every step the air gets warmer and a strange pink glow gets brighter.',
    gm: 'The main way down. From the bottom, the wine cellar is west and the chalk store is east.',
    label: [33, 13],
  });
  b.prop('stairs-up', 34, 14).prop('torch-sconce', 33, 12);
  b.light(33, 12, 10, 10);
  b.floor(35, 13, 1, 1, 'dungeon-slab');
  b.room('Chalk store', 36, 13, 4, 3, {
    mat: 'dungeon-slab',
    read: 'A cupboard of a room, stacked with boxes of chalk, candles and spare wands for beginners.',
    gm: 'White chalk is for pupils; the violet chalk box is empty and the label says TUTORS ONLY. A DC 11 Perception spots violet fingerprints on the door frame toward the chamber.',
  });
  b.door(36, 13, 'w', 'closed');
  b.prop('crate-stack', 36, 14).prop('candles', 38, 15).prop('wall-shelves', 39, 14);
  b.hall(39, 13, 39, 10, 1, { mat: 'dungeon-slab', downFirst: true }).hall(39, 10, 41, 10, 1, { mat: 'dungeon-slab' });
  b.cave('Summoning chamber', 45, 7, 7, 5, {
    seed: 77,
    wobble: 0.1,
    mat: 'dungeon-slab',
    read: 'A round vault under the crag. A great chalk circle burns pink on the floor, crackling like a fire made of sherbet. Over it floats a small grinning creature with bat ears, juggling three teacups and a candle.',
    gm: 'The open circle. Snibbet the quasit keeps the mischief going and loves it. Master Sallowmere waits in the shadows to stop anyone closing the circle (see The thing in the circle). To close it: rub out the eighth rune (violet chalk, on the north side) and read the closing lines. Each step takes an action. Once it shuts, every enchanted thing in the school drops still, Snibbet and Grizzleworth pop home, and the headmistress becomes herself again.',
  });
  b.prop('summoning-circle', 45, 7).prop('portal-arch', 45, 3).props_('candles', [[41, 6], [49, 6], [45, 11]]).prop('rune-stone', 41, 9).prop('brazier-pedestal', 49, 8).prop('rubble-pile', 48, 3).prop('scroll-pile', 43, 10).prop('rune-tiles', 47, 9).prop('gm-encounter', 45, 7, 0, { gm: true });
  b.rubble(39, 6, 1, 2);
  b.light(45, 7, 20, 20, '#ff6fd8').light(49, 8, 5, 10);
  b.encounter('The thing in the circle', [38, 2, 15, 11], [['quasit', 1], ['chalkTutor', 1], ['chalkPointer', 3]], 'high');
  b.tunnel([[60, 15], [60, 12], [56, 10], [50, 8]], 1, { mat: 'dungeon-slab', seed: 5 });
  b.area('Secret passage', [[54, 9, 7, 6]], {
    read: 'A narrow private stair with a handrail, a doormat and a little shelf for a lamp. Somebody has been using it a lot.',
    gm: 'Corvin\'s private way from his study to the cellars. Fresh violet chalk dust on every step.',
    label: [57, 10],
  });
  b.prop('lantern-wall', 60, 14).prop('rug-runner', 57, 10);
  b.tunnel([[50, 6], [55, 3], [61, 4], [65, 9], [65, 15]], 2, { mat: 'cave-floor', seed: 9 });
  b.mud(63, 8, 3, 3);
  b.area('Old drain', [[56, 2, 9, 11]], {
    read: 'A low, dripping brick tunnel. Your boots splash. Ahead, pink light; behind, the sound of the lake.',
    gm: 'Muddy and slow (difficult ground). Comes out on the east side of the summoning chamber, behind Corvin if he is facing the cellar steps.',
    label: [61, 5],
  });
  b.props_('puddle', [[58, 4], [65, 13]]).prop('bones-mud', 62, 6).prop('cobweb-corner', 56, 3);

  return b.build();
}

export const ACADEMY_SMALL_WONDERS: Adventure = {
  id: 'academy-small-wonders',
  title: 'Trouble at the Academy of Small Wonders',
  tagline: 'Exam night at a school for young wizards: the brooms are sweeping people out of windows, the books bite, the familiars are on strike and the headmistress is a cat.',
  levels: '1',
  sessions: '1',
  players: '3-5',
  tags: ['funny', 'school', 'magic', 'mystery', 'family'],
  pitch:
    'Thimble Isle sits in the middle of Lake Gilliwater, and on it stands the Academy of Small Wonders, where children learn to light candles without matches and turn teacups into tortoises (and back, mostly). Tonight is exam night. You have come over on the last ferry. As the boat bumps the jetty, a window bursts open, a broom sweeps a shrieking prefect out into the lake, and every light in the school turns pink. The school inspector arrives on the dawn ferry. Somebody has to sort this out before then.',
  secret:
    'Master Corvin Sallowmere, Tutor of Deportment and Sums, has wanted to be headmaster for nineteen years. The Board of Governors is sending Inspector Hortensia Plumb on the dawn ferry: one more disaster and Headmistress Oriel Puddingstone is out, and Corvin, as senior tutor, is in. So he left the forbidden section unlocked with "Grand Summons of a Familiar" open on the lectern, knowing that Nettie Bramblecombe, the only pupil without a familiar, would try it. Then he crept into the cellars and chalked an eighth rune, the Rune of Muddle, into her circle in violet tutors\' chalk. When Nettie spoke the words, the spell went wrong in every direction at once: it woke every enchanted object, gave every animal opinions, and pulled through a quasit (Snibbet) and an imp (Grizzleworth). The headmistress ran down to shut it, caught the backlash and became a cat. The circle is still open, and while it is, the chaos goes on and she stays a cat. To close it, rub out the eighth rune and say the closing lines. Corvin is waiting by the circle to make sure nobody does, at least until the inspector has seen the mess.',
  hooks: [
    'New hires: the Academy advertised for "a porter, a groundskeeper\'s helper and someone not afraid of geese". You start tomorrow. Your first shift starts now.',
    'Visiting students: you are here to sit the entrance exam (or you are transfer pupils from a rival school). Your exam has just become very practical.',
    'Delivery folk: old Mossop Hobb has ferried you over with a crate of newts and a birthday cake for the headmistress. Payment of 10 gp each on delivery, signed for by the headmistress herself. She is a cat.',
  ],
  tips: [
    'Keep it gentle. Nothing here wants to kill anyone. A hero who drops to 0 hit points is "tidied away": swept into a laundry basket, tucked into a bed or stuck to a ceiling, and wakes at 1 hit point when the fight ends. Only Snibbet and Corvin fight for real.',
    'Almost every trouble can be ended without a fight: a teacher\'s voice for the brooms, a polish for Sir Clank, "SHHH!" for the books, good grades for the homework, compliments for the sprites, sardines for the union, cheese for the mice, a contract for the imp. Reward clever ideas with advantage or an automatic success.',
    'The clock: the bell in the clock tower bongs once for every scene the heroes finish. After six bongs, the dawn ferry is in sight. If the circle is still open then, the inspector steps off the boat into chaos.',
    'Count troubles put right (brooms, Sir Clank, books, homework, snapdragons, union, mice, imp). With the circle closed and five or more fixed, the inspector is delighted. Fewer, and she is merely satisfied.',
    'There are four clues that Corvin did it: Tick the homunculus (at the union meeting), Grizzleworth (clock tower), the chalk ledger (staff room) and the draft letter (his study). Any two make a case the headmistress can act on. Let the players work it out; Corvin never confesses unless cornered.',
    'Shortcuts reward exploring: the laundry chute (dormitories to laundry), the secret bookcase (common room to forbidden section), the portrait door (common room to great hall, say "please"), Corvin\'s secret passage (study to cellars) and the old drain (lake shore to the summoning chamber).',
  ],
  npcs: [
    {
      id: 'pf_aworiel', name: 'Dame Oriel Puddingstone', title: 'headmistress (currently a cat)', kind: 'npc', art: 'witch-cat', monsterId: 'cat', shared: true,
      wants: 'Her school in order by dawn, her pupils safe, and her thumbs back.', knows: 'How to close a circle (the lines are in her spellbook), that only tutors have violet chalk, and that Corvin has been "far too helpful" lately.',
      voice: 'Cannot talk. Glares, swishes her tail, and taps letters on a slate with one paw, one short word per round, with impeccable spelling.', appearance: 'A plump ginger cat wearing a pair of half-moon spectacles on a chain, which keep sliding off.',
      backstory: 'Forty years headmistress. Once turned a whole invading army\'s boots into geese. She is very fond of Nettie.',
      gmNotes: 'Uses the cat stat block. She will not leave Nettie. She can lead the heroes to her office and to the cellar steps. Restored when the circle closes, or for one hour early with the Un-Cat Tonic. As a human she is a kindly, unflappable old wizard.',
    },
    {
      id: 'pf_awnettie', name: 'Nettie Bramblecombe', title: 'second-year pupil', kind: 'npc', art: 'young-witch', shared: true,
      wants: 'To put everything right, not to be expelled, and (very secretly) a familiar of her own.', knows: 'Exactly what she did and the closing lines by heart. She found the forbidden section unlocked and the book open, "like it was waiting for me".',
      voice: 'Fast, apologetic and very precise. Says "technically" a lot, then bursts into tears, then pulls herself together.', appearance: 'A small twelve-year-old with ink to the elbows, a robe two sizes too big and frizzy hair full of pencils.',
      backstory: 'Top of her class in theory, bottom in practice. Every other pupil has a cat, owl or toad; Nettie has a pet rock called Gerald.',
      gmNotes: 'A great guide: she knows every room, the portrait password and the secret bookcase. In the final scene she can close the circle herself if the heroes keep Corvin and Snibbet off her. At the end, one of the union familiars may choose her.',
    },
    {
      id: 'pf_awcorvin', name: 'Master Corvin Sallowmere', title: 'tutor of deportment and sums', kind: 'npc', art: 'court-wizard', monsterId: 'chalkTutor', shared: true,
      wants: 'To be headmaster. He has already had the name plate made.', knows: 'Everything about the sabotage, and the inspector\'s exact arrival time.',
      voice: 'Silky, slow and terribly polite. Says "dear me" and "how unfortunate" while smiling. Sniffs when anyone mentions the headmistress.', appearance: 'A tall, thin man in a spotless grey robe, with violet chalk dust on his fingertips that he keeps trying to wipe off.',
      backstory: 'Passed over for headship twice. Has marked every exam paper in the school F tonight "to be on the safe side".',
      gmNotes: 'Early on he appears in the great hall to "help" (move his token there), sends the heroes off on errands that keep them busy, then slips away to the cellars by his secret passage. In the chamber he fights with his conducting baton and violet chalk bolts (Scheming Tutor stat block), and conjures three chalk pointers to rap knuckles. He gives up at half hit points ("Oh, very well."). If confronted with two clues before the fight, he may bolt down the old drain.',
    },
    {
      id: 'pf_awsnibbet', name: 'Snibbet', title: 'a quasit who came through the circle', kind: 'monster', art: 'quasit', monsterId: 'quasit',
      wants: 'More chaos, more fun and a souvenir before he goes home. He secretly does want to go home; it is past his bedtime.', knows: 'That "the tall one with purple hands" drew the extra rune and promised him a whole school to play with.',
      voice: 'Giggly and shrill, talks in rhymes when excited, calls everyone "pudding".', appearance: 'A knee-high, bat-eared imp-thing with green skin, a grin far too wide and a teacup on his head like a hat.',
      gmNotes: 'Uses the quasit stat block. Turns into a toad or a bat to dodge. Bargainable: offer him a good souvenir (the headmistress\'s spectacles, a broom, a cake) and win a DC 13 Persuasion, and he turns on Corvin for the fun of it. When the circle closes he pops home with a cheery "Ta-ra!".',
    },
    {
      id: 'pf_awgrizzle', name: 'Grizzleworth', title: 'an imp who would like to go home now', kind: 'monster', art: 'imp', monsterId: 'imp',
      wants: 'A proper, signed return contract, and a cup of tea.', knows: 'That there were eight runes, not seven, and the eighth was in violet chalk and grown-up handwriting.',
      voice: 'Weary and fussy, like a clerk at the end of a long day. "Form, please. In triplicate."', appearance: 'A red, hand-sized imp in tiny half-moon spectacles, with a quill tucked behind one horn.',
      gmNotes: 'Uses the imp stat block. Hiding in the clock tower, jamming the clock by accident. Fights only if attacked, and turns invisible to escape. Any signed contract (even a silly one) wins him over; he then fixes the clock and testifies.',
    },
    {
      id: 'pf_awsorrel', name: 'Sorrel Brightscale', title: 'chair of the Amalgamated Society of Familiars', kind: 'monster', art: 'pseudodragon', monsterId: 'pseudodragon', shared: true,
      wants: 'Fair treatment for familiars, proper names, and tuna.', knows: 'That Tick the homunculus is hiding in the meeting and has seen something dreadful.',
      voice: 'A firm, loud little voice made for speeches. Bangs a teaspoon on the crate for order.', appearance: 'A cat-sized red dragon with a neckerchief and a tiny gavel made from a teaspoon.',
      gmNotes: 'Uses the pseudodragon stat block. Reasonable if treated as an equal. Agree to three of the five demands and sign, and the union returns to work and protects Tick while he speaks. Mock her and she calls the meeting to "direct action".',
    },
    {
      id: 'pf_awtick', name: 'Tick', title: 'Master Sallowmere\'s homunculus', kind: 'monster', art: 'homunculus', monsterId: 'homunculus',
      wants: 'Never to go back to Corvin, and a name that is not "Thing".', knows: 'Everything: it held the lamp while Corvin chalked the eighth rune, and it saw him write the letter to the Board the day before.',
      voice: 'A tiny, croaky whisper. Hides behind its own hands.', appearance: 'A grey clay creature the size of a teacup with leathery wings, a nervous blink and violet chalk dust on its back.',
      gmNotes: 'Uses the homunculus stat block. Linked to Corvin: if it speaks against him it is terrified he will feel it. With the union\'s protection, it tells all. It does not fight unless the union does.',
    },
    {
      id: 'pf_awclank', name: 'Sir Clank', title: 'the school\'s ceremonial armour', kind: 'monster', art: 'animatedArmor', monsterId: 'animatedArmor',
      wants: 'Good manners at supper, elbows off the table, and someone in charge.', knows: 'The school rules by heart (all 214 of them) and that the cellar steps are behind the high table.',
      voice: 'Booming, echoing and very proper. "SIT UP STRAIGHT. NO RUNNING IN THE HALL."', appearance: 'A tall, dented suit of plate armour with a feather plume and a napkin tucked into its gorget.',
      gmNotes: 'Uses the animated armor stat block. Believes he is headmaster until he sees the headmistress or is soothed (see Great hall). Once calm he becomes a loyal escort and will clank down the cellar steps to help in the final fight (give him to the players to move).',
    },
    {
      id: 'pf_awmossop', name: 'Mossop Hobb', title: 'ferryman and groundskeeper', kind: 'npc', art: 'sailor', shared: true,
      wants: 'A quiet life, his boat, and his supper, which is somewhere in the great hall.', knows: 'The island\'s back ways: the old drain on the east shore and the boathouse boats. Saw Master Sallowmere "skulking about with a box of chalk" at sunset.',
      voice: 'Slow, gravelly, says "aye" and "mind the frogs".', appearance: 'A weathered old man in oilskins with a pipe that is never lit and a cat-hair-covered jumper.',
      gmNotes: 'Stays at the landing. Waits for the dawn ferry run with Inspector Plumb. Uses the commoner stat block if it ever matters.',
    },
  ],
  handouts: [
    { id: 'homework', title: "Nettie's homework diagram", text: 'GRAND SUMMONS OF A FAMILIAR (practice diagram) by N. Bramblecombe, Year Two.\n\nSEVEN runes round the edge: Come, Kind, Small, Friend, Stay, Home, Shut. White chalk ONLY.\n\nOpening words: say them with feeling.\nClosing words: "Small friend, kind friend, here you stay; all the rest, go home, away!" Then rub out the extra rune if you drew one (I did not draw one).\n\n(In red ink at the bottom:) Most promising. Do try the real thing. - F.S.' },
    { id: 'forbidden', title: 'A margin note in "Grand Summons of a Familiar"', text: 'NEVER draw an eighth rune.\n\nSeven is a circle. Eight is a muddle.\n\nA muddled circle wakes all things that might be woken, calls all things that might be called, and will not shut until the eighth is wiped away and the closing said.\n\n(Someone has underlined "eighth" twice, in violet.)' },
    { id: 'union', title: 'Demands of the Amalgamated Society of Familiars', text: 'AMALGAMATED SOCIETY OF FAMILIARS, THIMBLE ISLE BRANCH\n\nWE DEMAND:\n1. Tuna on Tuesdays. (And on the other days.)\n2. No more being turned into teacups for practice.\n3. Proper names. Not "Familiar Seven".\n4. The owlery window FIXED.\n5. Protection for Brother Tick, who has Seen Things.\n\nSigned: Sorrel Brightscale, Chair. (Also: three paw prints, a beak mark, and something sticky.)' },
    { id: 'chalk', title: 'The staff room chalk ledger', text: 'VIOLET CHALK - TUTORS ONLY - NOT FOR PUPILS\n\nMonday: O.P., 1 stick (signs)\nWednesday: B.Q., 1 stick (blackboard)\nExam night, sixth bell: F.S., 3 sticks (marking)\n\n(Under it, someone has written: "Who needs THREE sticks for marking?")' },
    { id: 'letter', title: "Master Sallowmere's letter to the Board", text: 'To the Most Honourable Board of Governors,\n\nIt pains me to report that on exam night the Academy fell into utter chaos under Dame Puddingstone: brooms, books, beasts, and a summoning, no less! Clearly she is no longer fit to lead.\n\nI humbly offer to take up the burden of headship at once.\n\nYour servant, Corvin Sallowmere\n\n(The ink is quite dry. The date at the top is yesterday\'s.)' },
  ],
  chapters: [
    {
      id: 'exam-night', title: 'Exam Night on Thimble Isle', level: 1,
      summary: 'One wild night at a school for young wizards: calm the brooms, the armour, the books and the striking familiars, follow the clues to the jealous tutor, and close the summoning circle under the crag before the inspector\'s ferry lands at dawn.',
      goal: 'Restore order at the Academy, uncover who sabotaged the spell, and close the summoning circle so the headmistress stops being a cat.',
      map: thimbleIsle,
      npcs: [
        { npc: 'pf_awmossop', x: 32, y: 63 },
        { npc: 'pf_awnettie', x: 31, y: 47 },
        { npc: 'pf_aworiel', x: 31, y: 48 },
        { npc: 'pf_awclank', x: 33, y: 19 },
        { npc: 'pf_awsorrel', x: 52, y: 41 },
        { npc: 'pf_awtick', x: 53, y: 44 },
        { npc: 'pf_awgrizzle', x: 48, y: 30 },
        { npc: 'pf_awsnibbet', x: 45, y: 5 },
        { npc: 'pf_awcorvin', x: 43, y: 9, hidden: true },
      ],
      scenes: [
        {
          room: 'Ferry landing', title: 'The last ferry',
          read: 'The ferry noses up to a creaky jetty. Up on the hill, a crooked stone school flashes pink and green like a firework that cannot make up its mind. A broom whizzes past overhead with a boy in a prefect\'s badge dangling from it, and drops him neatly into the lake.',
          gm: 'Set the tone: silly, not scary. Mossop Hobb explains: exam night, something went "bang" in the cellars at sundown, and "the headmistress was last seen running toward it with her sleeves rolled up". He tells them to knock twice at the gate. If the heroes poke about the boathouse first, three giant frogs have taken it over (see the Boathouse area); a fish from the crate makes friends of them. Ring the clock tower bell once when they set off up the hill.',
        },
        {
          room: "Porter's lodge", title: 'A girl and her headmistress',
          read: 'Behind the gate, a small girl with ink to her elbows peers out of the porter\'s lodge, clutching a large ginger cat in spectacles. "Please don\'t tell anyone," she says. "Technically, this is all my fault. And this," she adds, holding up the cat, "is the headmistress."',
          gm: 'Nettie tells all: she took the Grand Summons from the forbidden section (it was unlocked and lying open), drew the circle in the cellar, said the words, and everything went bang. Give the homework handout. The cat taps out O-P-E-N on the slate, then C-E-L-L-A-R. A DC 12 Arcana on the diagram: a seven-rune circle cannot go wrong like this; something extra must have been added. Nettie and the cat tag along from here on (or wait in the lodge if the players prefer).',
          handout: 'homework',
          treasure: 'Lost property cupboard: one Potion of Healing, a whistle only cats can hear, and a very nice hat (mundane).',
        },
        {
          room: 'Courtyard', title: 'The broom brigade',
          read: 'The moment you step into the courtyard, three brooms peel out of formation and swoop toward you, bristles first. "Tidy," they seem to hiss. "Tidy, tidy, TIDY."',
          gm: 'Three runaway brooms (they bludgeon, they do not cut). They try to sweep heroes into a pile by the fountain. End it with a teacher\'s command (DC 12 Intimidation or Deception: "Brooms, REST!"), a tablecloth or net (DC 12 Dexterity to tangle one), or by giving them something better to tidy (a burst sack, a pile of leaves). Calmed brooms lean themselves neatly against the wall. One trouble fixed.',
          encounter: 'The broom brigade',
          treasure: 'Three treacle tarts from the grateful dinner lady (each restores 1 hit point and a great deal of morale).',
        },
        {
          room: 'Great hall', title: 'Sir Clank at supper',
          read: 'At the high table, a huge suit of armour in a feathered helmet is carving the roast. Two carving knives hover at its shoulders like prefects. "LATE FOR SUPPER," it booms. "SIT DOWN. ELBOWS OFF THE TABLE."',
          gm: 'Sir Clank thinks he is headmaster. Play along (sit down and eat politely) and he is happy; argue or run and he and the knives attack. Calm him with a DC 12 Persuasion, by reciting the school rules from the notice board, or by presenting the headmistress (he salutes and goes still). Then Master Sallowmere sweeps in, all concern: "Dear me, how unfortunate. The cellars are far too dangerous. Do see to the menagerie, and the library, and the clock, while I find the counter-charm." A DC 13 Insight: he is pleased about something, and there is violet chalk on his fingers. He leaves by the east door and is not seen again until the cellars. One trouble fixed if Sir Clank is calmed.',
          encounter: 'Sir Clank at supper',
        },
        {
          room: 'Menagerie', title: "The Familiars' Union",
          read: 'A crowd of cats, owls, rats and frogs fills the menagerie, all facing a tiny red dragon on an upturned crate. "And WHAT do we want?" it cries. "TUNA!" yowls the crowd. "And WHEN do we want it?" "NOW!"',
          gm: 'Sorrel Brightscale chairs the meeting. Give the demands handout. The heroes can negotiate (DC 12 Persuasion, advantage with the sardines from the paddock or a promise signed by the headmistress\'s paw). Agree to three of the five and the union goes back to work. Then Tick creeps out and, with the union around it, whispers the truth: Corvin drew the eighth rune, and wrote to the Board the day before. Insulting the union starts a fight; any hero who offers a familiar a proper name gets advantage. One trouble fixed.',
          encounter: "The Familiars' Union",
          handout: 'union',
          treasure: 'The union\'s strike fund: 4 gp in mixed coins and a silver thimble (5 gp), offered as "dues refunded".',
        },
        {
          room: 'Library', title: 'Flapping books', optional: true,
          read: 'Books flap overhead in a rustling black flock, snapping their covers like beaks. Somewhere among the stacks an iron door stands shut, and behind it something heavy grumbles in its chains.',
          gm: 'Three flocks of flapping books. A group "SHHHH!" (DC 12, group Charisma) or bright light drives them back to the shelves. The forbidden section holds the open Grand Summons with its margin note (handout) and violet smudges on the door handle (DC 13 Investigation). The lending log on the desk shows "F.S." took out "Advanced Circles" last week. One trouble fixed.',
          encounter: 'Flapping books',
          handout: 'forbidden',
          treasure: 'A Spell Scroll of Magic Missile in the forbidden section\'s chained case (DC 12 thieves\' tools, or the headmistress\'s nod).',
        },
        {
          room: 'Potion classroom', title: 'Homework with legs', optional: true,
          read: 'Two lumpy brown blobs and an angry puff of steam have climbed out of the cauldrons and are holding up their own homework labels. "MARK US," gurgles the biggest. "MARK US NOW."',
          gm: 'Failed homework come to life (two lumps of lumpy homework and a cross steam cloud). Give each a grade of B or better with a straight face (DC 11 Deception or Persuasion each) and they slop happily back in. Nettie\'s cauldron holds half a batch of Un-Cat Tonic: add a moonbell flower from the greenhouse and stir (DC 12 Arcana or alchemist\'s supplies) and the headmistress can be human for one hour, enough to talk, cast a spell or two and boss everyone about. One trouble fixed.',
          encounter: 'Homework with legs',
          treasure: 'Two Potions of Healing in the ingredient store ("Matron\'s").',
        },
        {
          room: 'Greenhouse', title: 'Snapdragons', optional: true,
          read: 'Warm, wet air fogs the glass. A row of potted snapdragons swings toward you, jaws clacking, and two tiny glowing people on a mushroom fall about laughing.',
          gm: 'Two sprites and four snapdragon shrubs. The sprites will call the plants off for a won riddle contest (DC 12 Intelligence, best of three) or a heartfelt compliment about their garden (DC 11 Persuasion). They pick the moonbell flower for the Un-Cat Tonic as a present. Fire makes the snapdragons wilt and the sprites furious. One trouble fixed.',
          encounter: 'Snapdragons',
        },
        {
          room: 'Clock tower', title: 'Grizzleworth in the clockworks',
          read: 'The great bell bongs over and over while the clock hands spin backwards. A little red imp in spectacles is wedged between two gears, holding a quill. "Finally," it sighs. "Someone official. I wish to lodge a complaint."',
          gm: 'Grizzleworth wants to go home properly, with paperwork. Write him any contract and sign it (or win a DC 12 Persuasion) and he unjams the clock and testifies: eight runes, the eighth in violet chalk, "in grown-up handwriting, with a flourish on the tail". Attack him and he turns invisible and stings from the rafters, then flees to the cellars to hide behind Snibbet. One trouble fixed. Ring the bell properly now: it is later than they think.',
          encounter: 'Grizzleworth in the clockworks',
        },
        {
          room: "Master Sallowmere's study", title: "The tutor's study",
          read: 'Every pencil in the room is sharpened to exactly the same length. A stack of exam papers on the desk is all marked F. On top lies a sealed letter, and two silver letter openers rise from the blotter like snakes.',
          gm: 'The door is locked (DC 13 thieves\' tools or DC 14 Athletics). The letter openers (flying swords) attack anyone who touches the desk; a DC 12 Sleight of Hand slips the letter out without waking them. The letter is the clincher (handout). The staff room next door has the chalk ledger (give that handout too if they look). A DC 13 Investigation finds the secret bookshelf door in the north wall and the private stair down to the cellars.',
          encounter: 'The letter openers',
          handout: 'letter',
          treasure: 'Corvin\'s strongbox (DC 13): 30 gp and two sticks of violet chalk. The staff room biscuit tin: eleven biscuits (they are counted).',
        },
        {
          room: 'Dormitories', title: 'Mice in the pillow fort', optional: true,
          read: 'Every bed has become a pillow castle, with sock flags and a drawbridge made of a slipper. From the battlements, a hundred tiny mouse voices squeak a war song.',
          gm: 'The pupils\' pet mice have founded a kingdom (two swarms of rats). Knock a fort down and they swarm. A chunk of cheese, a mouse-sized song, or lying flat to parley (DC 11 Persuasion) ends it. The mice know the laundry chute "goes down to the warm place where the pink light is". One trouble fixed.',
          encounter: 'Mice in the pillow fort',
        },
        {
          room: 'Summoning chamber', title: 'The thing in the circle',
          read: 'Pink light crackles from a great chalk circle like a fire made of sherbet. A grinning, bat-eared creature with a teacup for a hat floats over it, juggling candles. From the shadows steps Master Sallowmere, dusting his hands. "Dear me," he says. "You really should have stayed in the menagerie."',
          gm: 'The climax. Corvin (Scheming Tutor) and Snibbet (quasit) fight together, with three conjured chalk pointers. Closing the circle takes two actions: rub out the eighth rune on the north side, then read the closing lines (Nettie can do it if protected; anyone with the homework or the spellbook can too). Snibbet can be bought off with a good souvenir and a DC 13 Persuasion. Showing Corvin two clues, or having the headmistress (cat or human) stare him down, gives advantage on any check to make him surrender; he gives up at half hit points anyway. When the circle shuts: every enchanted thing in the school drops still, Snibbet and Grizzleworth pop home, and a very cross headmistress is standing where the cat was.',
          encounter: 'The thing in the circle',
          treasure: 'From the grateful headmistress: 25 gp each, an honorary staff badge, and the school\'s old lost-property bag (a Bag of Holding) for the group. The founder\'s Driftglobe is still on the islet for those who find it.',
        },
      ],
      wrapUp: 'With the circle shut, the school falls quiet: brooms lean against walls, books settle on their shelves, and somewhere a cat is very glad to have thumbs again. The dawn ferry brings Inspector Plumb. If the troubles are mostly fixed and Corvin is caught, she writes a glowing report and Corvin goes back on the ferry, in handcuffs and a mood. The heroes reach level 2.',
    },
  ],
  ending:
    'Good ending: the circle is closed, the school is calm, and Corvin is unmasked. Inspector Plumb steps off the ferry into a tidy school and a breakfast laid by Sir Clank himself. She praises the headmistress, the heroes are offered jobs (or places) at the Academy, and Nettie is chosen at last by a familiar: Tick, or one of the union cats, who insists on a proper name. Bad ending: the circle is still open at dawn, or Corvin talks his way out. The inspector meets brooms and biting books, the headmistress is suspended, and "Headmaster Sallowmere" takes over, starting with detentions for everyone. The heroes can still win it back by bringing the clues to the Board. What next: Grizzleworth sends a thank-you card from home, with a contract for a "small favour"; and the forbidden book had more than one page bookmarked in violet.',
};
