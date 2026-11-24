// The Silent Archive: a two-part epic for four heroes of level 17 to 18.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

const HUSH = '#b8c4d6';

/** Floor with thin walls all round, for buildings that are split into several named areas. */
function shell(b: MapBuilder, x: number, y: number, w: number, h: number, mat: string) {
  b.floor(x, y, w, h, mat);
  b.wallRun(x, y, w, 'n').wallRun(x, y + h - 1, w, 's').wallRun(x, y, h, 'w').wallRun(x + w - 1, y, h, 'e');
  return b;
}

// ---------- Part 1: Ringmere, the hushed city ----------
function ringmere() {
  const b = new MapBuilder('adv-silent-archive-city', 'Ringmere, the Hushed City', 80, 80, { open: true, floor: 'stone-cobble', ambient: 'dim', wallStyle: 'stone' });

  // the Lull: a slow grey river that bends through the city
  b.water(40, 0, 5, 30).water(41, 0, 3, 30, true);
  b.water(42, 30, 5, 20).water(43, 30, 3, 20, true);
  b.water(40, 50, 5, 30).water(41, 50, 3, 30, true);
  // grass on the cathedral hill and in the park
  b.paint(45, 0, 35, 30, 'grass').paint(47, 30, 33, 17, 'grass').paint(2, 54, 22, 16, 'grass');
  b.paint(2, 22, 17, 13, 'stone-flagstone').paint(16, 13, 22, 7, 'dirt');
  // three crossings
  b.floor(39, 11, 7, 3, 'wood-planks');
  b.area('Bellwright Bridge', [[39, 11, 7, 3]], { read: 'A wooden bridge hung with hundreds of little brass bells. The wind moves them. They make no sound at all.', gm: 'The quick way from the foundry to the cathedral close. Anyone who crosses at night is watched by one Hush-warden (DC 18 Perception to see the air ripple).', label: [42, 12] });
  b.props_('lantern-hook', [[39, 11], [45, 13]]).prop('bridge-plank', 42, 12, 90).light(39, 11, 10, 15);
  b.floor(40, 36, 8, 4, 'stone-flagstone');
  b.area('The Grand Bridge', [[40, 36, 8, 4]], { read: 'Stone saints line the great bridge, each with a bell in one hand. Someone has tied every bell\'s clapper with a strip of grey cloth.', gm: 'The main way east. The grey cloth is Archive-stuff: it feels like paper and cannot be cut (it can be untied, DC 15 Sleight of Hand). It does nothing but frighten people.', label: [44, 37] });
  b.props_('statue-tall-robed', [[40, 36], [47, 39]]).props_('lamp-post', [[40, 39], [47, 36]]).light(40, 39, 15, 20).light(47, 36, 15, 20);
  b.rubble(40, 67, 5, 2);
  b.area('The Stepping Ford', [[40, 67, 5, 2]], { read: 'Old millstones make a line of stepping stones across the river, slick with weed.', gm: 'Crossing takes DC 14 Acrobatics per hero, or fall in (swim DC 12 Athletics; the current is slow). It leads to the culvert bank and the secret way into the catacombs.', label: [42, 67] });

  // the hill east of the river is solid rock under the graveyard and the cathedral's east side
  b.rock(73, 12, 7, 35);
  b.rock(48, 47, 32, 33);

  // ----- the West Gate and the main street -----
  b.area('The West Gate', [[0, 34, 7, 8]], {
    read: 'Ringmere is the city of a hundred bell towers, and every one is still. Crowds pass you without a sound: no cart wheels, no dogs, no voices. A gate guard opens her mouth to greet you, and nothing comes out.',
    gm: 'Arrival. The townsfolk lost their voices over three weeks: names first, then songs, then bells, then speech. They talk with slates, chalk and pointing. DC 15 Insight: they are terrified, not hostile. DC 18 Arcana: no spell lies on the people; something is drawing sound out of the city the way a bucket draws water from a well.',
    label: [3, 36],
  });
  b.prop('gate-iron-tall', 0, 35).prop('signpost', 5, 35).prop('hitching-post', 5, 41).prop('water-trough', 3, 41).prop('notice-board', 6, 40).light(5, 35, 15, 20);
  b.wallRun(0, 34, 5, 'n').wallRun(0, 41, 5, 's');
  b.start(1, 37, 3, 3);
  b.props_('lamp-post', [[12, 36], [24, 36], [36, 40]]).prop('cart', 18, 39, 90).prop('well', 30, 39);
  for (const [x, y] of [[12, 36], [24, 36], [36, 40]]) b.light(x, y, 15, 20);

  // ----- the Bellfounders' Quarter -----
  b.building('Coldwell Bell Foundry', 2, 2, 14, 10, {
    mat: 'brick-floor',
    read: 'Heat and the smell of hot bronze. A big grey-haired woman is pouring a bell, alone, in total silence. She does not look up until you stamp on the floor. Then she grins and starts talking with her hands, very fast.',
    gm: 'Winifred Coldwell, deaf from birth, has spoken bell-hand all her life; the Hush has barely changed her world. She teaches the heroes bell-hand in ten minutes (handout). She knows Old Clamour, the cathedral\'s great bell, was cast "tuned to a door". DC 15 Investigation on her moulds: the old pattern for Old Clamour has a ring of closed mouths cast round its lip.',
    doors: [[8, 11, 's', 'closed', 'door-double'], [9, 11, 's', 'closed', 'door-double'], [15, 6, 'e', 'closed']], windows: [[2, 5, 'w'], [5, 2, 'n'], [12, 2, 'n']],
  });
  b.prop('forge', 3, 3).prop('anvil', 5, 4).prop('cauldron', 9, 4).props_('temple-bell', [[12, 5], [4, 8]]).prop('workbench', 13, 9).prop('tool-wall', 14, 3).prop('winch', 8, 6).prop('firewood', 3, 10).prop('rope-coil', 11, 9).prop('crate-pile', 14, 10).light(3, 3, 15, 25, '#ff8a3a').light(9, 4, 5, 15, '#ff8a3a');
  b.building("Ringers' Guildhall", 18, 2, 13, 9, {
    mat: 'wood-planks',
    read: 'The ringers\' hall: a long table, banners for every bell tower in the city, and a wall of bell ropes hanging from pegs, each with a name tag. Every name tag is blank.',
    gm: 'Empty. The peal-book on the table records the order the towers went quiet: from the cathedral outward, like ripples. DC 17 Investigation: the first silence was in the cathedral crypt, three weeks before any tower. A good place to rest; it is not near any lectern.',
    doors: [[24, 10, 's', 'closed', 'door-double'], [25, 10, 's', 'closed', 'door-double']], windows: [[18, 5, 'w'], [30, 5, 'e']],
  });
  b.prop('table-long', 24, 5).props_('banner-hanging-tall', [[20, 3], [28, 3]]).prop('bookshelf-tall', 19, 8).prop('notice-board', 29, 8).prop('temple-bell', 27, 8).props_('chair', [[22, 5], [26, 5]]).prop('rope-coil', 21, 9).light(24, 6, 10, 20);
  shell(b, 2, 14, 6, 6, 'wood-planks').door(4, 14, 'n', 'closed');
  shell(b, 9, 14, 6, 6, 'wood-planks').door(11, 14, 'n', 'closed');
  shell(b, 32, 2, 6, 7, 'wood-planks').door(34, 8, 's', 'closed');
  b.props_('bed', [[3, 17], [10, 17], [33, 3]]).props_('table-round', [[5, 16], [12, 16], [35, 5]]).props_('fireplace', [[6, 18], [13, 18], [36, 7]]);
  b.area('Bellwright Row', [[2, 12, 37, 2]], { read: 'A lane of bellwrights\' houses. Wind chimes hang over every door, swinging, silent. A dog sits in the street with its mouth open, barking at nothing you can hear.', gm: 'Dressing and rumours. A bellwright\'s slate on a door: "THE BELLS ARE NOT BROKEN. THEY ARE BEING HELD."', label: [20, 12] });
  b.props_('lamp-post', [[16, 12], [30, 13]]).light(16, 12, 15, 20).light(30, 13, 15, 20);
  b.area('Tuning Yard', [[16, 14, 22, 6]], { read: 'Half-finished bells hang from timber frames in a muddy yard. A boy is hitting one with a hammer, over and over, crying.', gm: 'If a hero lays a hand on a bell while the boy hits it, they feel it hum: the sound is still there, it just never reaches the air. DC 16 Arcana: the sound is being pulled away eastward, toward the cathedral hill.', label: [26, 16] });
  b.props_('temple-bell', [[19, 15], [23, 15], [27, 17]]).prop('winch', 31, 15).prop('hay-bale', 35, 18).prop('handcart', 21, 18).prop('well', 34, 15).prop('grindstone', 17, 18);

  // ----- the Silent Market and the Lectern of Songs -----
  b.area('Silent Market', [[2, 22, 17, 13]], {
    read: 'The market is full and utterly silent. Hands haggle; mouths move. At its heart, on the fountain steps, an iron lectern holds an open book whose pages turn by themselves, and the air around it ripples like heat.',
    gm: 'The Lectern of Songs. Within 120 ft of it, the Hush: as the Silence spell (Deafened, no Verbal components, no Thunder damage). Four invisible stalkers and an air elemental (the "Hush-wardens") herd people away from it and attack anyone who touches the book. The lectern is AC 19, 90 HP, immune to poison, psychic and thunder. Clever kill: write "this book" (or a description of the lectern) on one of its pages; it files itself away and vanishes. Breaking it brings back songs in this district (market folk start humming in tears) and turns the Hush Clock back by 1.',
    label: [10, 29],
  });
  b.prop('fountain-grand', 10, 28).prop('lectern-dais', 10, 25).props_('market-stall', [[3, 23], [3, 27], [3, 31], [16, 23], [16, 31]]).prop('produce-stall', 6, 33).prop('merchant-cart', 14, 33).prop('fish-crate', 5, 25).prop('barrel-group', 17, 27).prop('crate-pile', 13, 23).prop('notice-board', 8, 22).props_('bench', [[7, 30], [13, 30]]);
  b.light(10, 25, 10, 25, HUSH).light(3, 23, 10, 15).light(16, 31, 10, 15);
  b.encounter('Hush-wardens in the market', [2, 22, 17, 13], [['invisibleStalker', 4], ['airElemental', 1]], 'low');

  // ----- the Hall of Names and the Lectern of Names -----
  shell(b, 24, 21, 14, 13, 'marble');
  b.door(30, 33, 's', 'closed', 'door-double').door(31, 33, 's', 'closed', 'door-double').door(24, 27, 'w', 'closed');
  b.wall(37, 29, 'e', 'window').wall(27, 33, 's', 'window');
  b.wallRun(33, 21, 6, 'w').wallRun(33, 26, 5, 's').door(33, 24, 'w', 'locked', 'door-iron');
  b.area('Hall of Names', [[24, 21, 9, 13], [33, 27, 5, 7]], {
    read: 'Clerks sit at their desks with their quills raised, not moving. Their eyes follow you. Behind them, the city register lies open on an iron lectern, and names are vanishing from its pages one by one, as if an invisible hand were striking them out.',
    gm: 'The Lectern of Names (same stats and same trick as the market lectern; hushed within 120 ft). Two clay golems shaped like clerks, mouths sealed with grey wax, guard it; three bone devils "audit" the register and gloat telepathically. The devils serve only because their true names are filed in the Archive: promising, in writing, to tear their cards free (DC 20 Persuasion) makes them stand aside, leaving the golems alone. Breaking the lectern brings back names in the district: people suddenly remember each other. Hush Clock back by 1.',
    label: [28, 27],
  });
  b.area('Records vault', [[33, 21, 5, 6]], { gm: 'Iron door, locked (DC 22 Thieves\' Tools, or AC 19, 50 HP). The city\'s treasury and the oldest registers. The oldest register mentions a sealed door "beneath the house of bells, for the brothers and sisters who do not speak".' });
  b.prop('lectern-dais', 28, 22).props_('archive-stacks', [[25, 23], [25, 26], [25, 29]]).prop('bookshelf-tall', 32, 31).props_('desk', [[29, 28], [27, 25]]).props_('chair', [[29, 29], [27, 26]]).prop('scales', 27, 31).prop('banner-hanging-tall', 30, 22);
  b.props_('map-cabinet', [[34, 22], [36, 22]]).prop('strongbox', 36, 25).prop('scroll-pile', 34, 25).light(28, 23, 10, 20, HUSH);
  b.encounter('The Name-Takers', [24, 21, 14, 13], [['clayGolem', 2], ['boneDevil', 3]], 'moderate');

  // ----- Lower Town: the Mute Swan and Lantern Row -----
  b.building('The Mute Swan', 3, 42, 12, 9, {
    mat: 'wood-planks',
    read: 'Every table has a slate, and every slate is full. A barmaid chalks "SOUP 2c" and taps it twice. In the corner an old man writes the same name over and over, and each time, as you watch, it fades from the slate.',
    gm: 'A safe tavern, far from any lectern. Clues on the slates (DC 12 Investigation for each): "grey monks walk in Quietfield at night"; "the precentor\'s choir lost their voices first"; "the girl in the Green can still TALK"; "Coldwell says the bells are not broken". A long rest here moves the Hush Clock on by 1.',
    doors: [[8, 42, 'n', 'closed'], [9, 42, 'n', 'closed']], windows: [[3, 46, 'w'], [14, 46, 'e'], [6, 50, 's']],
  });
  b.prop('bar-counter', 12, 44).prop('keg-rack', 13, 43).prop('fireplace', 4, 49).props_('table-round', [[6, 45], [9, 47], [6, 48]]).props_('chair', [[5, 45], [7, 45], [8, 47], [10, 47], [5, 48], [7, 48]]).prop('notice-board', 11, 49).prop('dartboard', 14, 48).prop('stair-spiral', 13, 49).light(4, 49, 10, 20).light(9, 46, 10, 15);
  shell(b, 17, 42, 7, 7, 'wood-planks-dark').door(20, 42, 'n', 'closed');
  b.building('Number Nine, Lantern Row', 25, 42, 7, 7, {
    mat: 'wood-planks-dark',
    read: 'A family sits around a table. A mother points at her son, opens her mouth, and stops. She cannot remember his name. He is writing it on her hand in ink, again.',
    gm: 'A quiet scene of what the Hush costs. If the Lectern of Names is broken, the mother remembers, and the family presses a gift on the heroes: a grandmother\'s silver bell (50 gp) "for luck".',
    doors: [[28, 42, 'n', 'closed']],
  });
  shell(b, 33, 42, 6, 7, 'wood-planks-dark').door(35, 42, 'n', 'closed');
  b.props_('bunk-bed', [[18, 47], [34, 47]]).props_('kitchen-table', [[20, 45], [28, 45]]).prop('stove', 36, 44).prop('crib', 30, 47).prop('washbasin', 22, 47);
  b.area('Lantern Row', [[15, 49, 25, 4]], { read: 'A crooked street of tenements. The lamplighters stopped coming when the bells stopped; half the lamps are dark.', gm: 'Between Lower Town and the river. Mote runs messages along here for bread.', label: [27, 50] });
  b.props_('lamp-post', [[16, 50], [26, 52], [38, 50]]).prop('barrel-group', 32, 51).prop('handcart', 22, 50).light(16, 50, 10, 15);
  b.mud(30, 52, 6, 2);

  // ----- Lamplighters' Green -----
  b.area("Lamplighters' Green", [[2, 54, 22, 16]], {
    read: 'A park of willows round a pond, and a little bandstand. In a lean-to of old shop signs, a skinny girl in a huge coat is singing to herself. Out loud. It is the only voice you have heard all day.',
    gm: 'Mote. She can still talk because the Hush takes names first, and nobody ever gave her one. She is the heroes\' best messenger: she can carry words between the belfry and the catacombs. She has watched "the air-men" (invisible stalkers) and has seen grey figures go into the mausoleum in Quietfield.',
    label: [12, 58],
  });
  b.pool(12, 63, 4, 3).props_('tree-willow', [[8, 61], [16, 65]]).props_('tree-oak', [[4, 56], [21, 55], [3, 68]]).props_('bush', [[18, 60], [6, 66]]).prop('flowers', 14, 57).prop('lily-pads', 12, 63).prop('tent-round', 6, 57).props_('bench', [[10, 58], [18, 63]]).prop('statue', 18, 57).prop('lean-to', 20, 66).prop('bedroll', 21, 67).prop('campfire-cold', 19, 68).props_('lamp-post', [[2, 54], [23, 69]]).light(19, 68, 5, 10);

  // ----- Quaile & Daughter, dealers in rare words -----
  shell(b, 27, 56, 11, 9, 'wood-planks-dark');
  b.door(32, 56, 'n', 'closed').door(37, 62, 'e', 'locked').wall(29, 56, 'n', 'window').wall(35, 56, 'n', 'window');
  b.wallRun(27, 60, 11, 's').door(31, 60, 's', 'closed');
  b.area("Quaile's shop front", [[27, 56, 11, 5]], {
    read: 'A shop of glass cases. In each case, a tiny glass bottle with a paper label: "A Duke\'s Name", "First Word of a Child", "The Last Note of a Lark". A plump gentleman in a plum waistcoat looks up and says, warmly and aloud, "Customers! How lovely."',
    gm: 'Mister Peregrine Quaile, a rakshasa in human guise, is the only adult in Ringmere who can talk. He trades in words and names. He sells the way to the Hush Gate (the crypt stair, the Bonewalk, the culvert) and that Old Clamour opens it, and the true name of the ice devil Rimeshaw who guards it. His price: one name, freely given (the giver can never again say their own name or hear it said), or the promise of a fiend\'s card from the Archive\'s Index. DC 20 Insight: his gloves hide hands that are on backwards.',
    label: [32, 58],
  });
  b.area("Quaile's back room", [[27, 61, 11, 4]], { gm: 'Two oni bodyguards (in the shapes of two tall footmen) wait here. Shelves of bottled names: smashing a bottle (an action) gives one townsperson their name back.' });
  b.prop('shop-counter', 32, 59).props_('display-case', [[28, 57], [36, 57], [28, 59]]).prop('jewelry-box', 34, 58).prop('scales', 30, 58).prop('crystal-ball', 30, 62).prop('rug', 33, 62).prop('coffer', 36, 63).prop('armchair', 34, 63).prop('magic-mirror', 28, 63).prop('potion-shelf', 35, 61).light(32, 58, 10, 15, '#e0a8ff');
  b.encounter("Mister Quaile's back room", [27, 56, 11, 9], [['rakshasa', 1], ['oni', 2]], 'low');

  // ----- the Weir Steps and the culvert bank -----
  b.area('Weir Steps', [[26, 66, 14, 13]], { read: 'Wide stone steps run down to the river, where washerwomen used to sing. Now they scrub in silence.', gm: 'Look east across the ford: an old brick culvert mouth in the far bank, half under water (DC 15 Perception).', label: [32, 71] });
  b.props_('mooring-post', [[39, 70], [39, 76]]).prop('rowboat', 41, 72, 90).prop('dock-pier', 38, 73).props_('washbasin', [[30, 68], [33, 69]]);
  b.area('Culvert bank', [[45, 60, 3, 14]], { read: 'A strip of muddy bank under the cathedral hill. A rusted grate covers an old culvert.', gm: 'The grate is a secret door (DC 18 Perception to see it opens; Mote knows). Behind it, a crawlway leads into the flooded crypt of the catacombs.', label: [46, 64] });
  b.prop('sewer-outflow', 47, 66).prop('reeds', 45, 62).prop('mud-patch', 46, 70);
  b.mud(45, 68, 3, 4);
  b.door(48, 66, 'w', 'secret');

  // ----- the cathedral close -----
  shell(b, 50, 8, 23, 21, 'marble');
  b.door(60, 28, 's', 'closed', 'door-double').door(61, 28, 's', 'closed', 'door-double').door(50, 26, 'w', 'closed');
  b.wall(50, 15, 'w', 'window').wall(50, 20, 'w', 'window').wall(72, 12, 'e', 'window');
  b.wallRun(50, 24, 23, 's').door(60, 24, 's', 'open', 'door-double').door(61, 24, 's', 'open', 'door-double').door(69, 24, 's', 'locked', 'door-iron');
  b.wallRun(50, 12, 7, 's').wallRun(60, 12, 7, 's');
  b.wallRun(66, 8, 17, 'e').door(66, 10, 'e', 'closed').door(66, 20, 'e', 'closed');
  b.wallRun(67, 15, 6, 's');
  b.door(72, 22, 'e', 'locked', 'door-iron').door(72, 10, 'e', 'secret');
  b.area('Choir and high altar', [[50, 8, 17, 5]], { read: 'Choir stalls for a hundred singers face each other across the altar. The organ pipes are stuffed with grey paper.', gm: 'The door in the north wall leads up into the belfry. Pulling the paper from the organ does nothing: the pipes blow, silently.' });
  b.area('Nave of the Hundred Bells', [[50, 13, 17, 12]], {
    read: 'Ten thousand candle stubs and not one hymn. Above the pews hang a hundred small bells on chains, all still. In the choir, a thin old man in a cassock is conducting a choir of nobody, tears running down his face.',
    gm: 'Precentor Thaddeus Fenwright. Through gestures and writing he tells the heroes about the founding stone (handout) in the narthex, and that the crypt stair (key on his belt) leads to the old catacombs. DC 17 Religion: "the monks who do not speak" were the Order of the Closed Mouth, keepers of dangerous words, gone for three hundred years.',
  });
  b.area('Vestry', [[67, 8, 6, 8]], { gm: 'Robes, plate and a bookcase that is a secret door (DC 20 Perception) out onto the close. The plate chest holds 600 gp of silver.' });
  b.area('Crypt stair', [[67, 16, 6, 9]], { read: 'A narrow stair winds down into cold air that smells of old bones and wet stone.', gm: 'The locked iron door east (Thaddeus has the key, or DC 22 Thieves\' Tools) opens on the Bonewalk, the bishops\' road down to the catacombs.' });
  b.area('Narthex', [[50, 25, 23, 4]], { read: 'An entrance hall. Set into the floor is a worn slab carved with a bell and an old warning.', gm: 'The founding stone (handout).' });
  for (const y of [15, 17, 19, 21]) b.props_('pew', [[52, y], [54, y], [56, y], [60, y], [62, y], [64, y]]);
  b.props_('column-fluted', [[51, 14], [65, 14], [51, 23], [65, 23]]).prop('altar-reredos', 58, 9).prop('organ-cathedral', 52, 9).props_('candelabra-grand', [[56, 10], [61, 10]]).prop('prayer-kneeler', 58, 11).props_('chains-hanging', [[55, 18], [63, 18]]);
  b.prop('font', 58, 26).props_('statue-tall-robed', [[52, 26], [70, 26]]).prop('burial-slab', 63, 26).prop('wardrobe', 68, 9).prop('bookcase-secret', 71, 10).prop('chest', 70, 14).prop('censer-hanging', 68, 13).prop('stairs-down', 70, 18).prop('candle-stand-tall', 68, 17).prop('sarcophagus-effigy', 69, 21);
  b.light(58, 10, 15, 20, '#ffd9a0').light(58, 19, 10, 25, '#ffd9a0').light(60, 26, 10, 15).light(70, 18, 5, 10);
  shell(b, 56, 1, 9, 7, 'stone-flagstone');
  b.door(60, 7, 's', 'closed', 'door-double').door(56, 4, 'w', 'closed');
  b.area('Belfry of Old Clamour', [[56, 1, 9, 7]], {
    read: 'The greatest bell in Ringmere hangs here: black bronze, big enough to stable a horse in. Iron chains hold its clapper still. Below it, on an iron lectern, a book lies open at a page that says, in neat grey letters, "Bells."',
    gm: 'The Lectern of Bells (hushed within 120 ft; same stats and trick). Two stone golems hold the clapper chains; two horned devils circle the open arches. Freeing the clapper: four chains, AC 19, 30 HP each. Ring Old Clamour with the lectern broken and every bell in Ringmere rings with it, the Hush Gate opens for an hour, and the Keeper knows they are coming. Ring it with the lectern whole and there is no sound, only a shiver in the stone: the gate opens for 1 minute while the bell swings (DC 20 Athletics each round to keep it going).',
  });
  b.prop('temple-bell', 60, 3).prop('lectern-dais', 58, 5).prop('stair-spiral', 63, 2).prop('winch', 57, 2).prop('rope-coil', 62, 6).props_('wall-chains', [[59, 2], [61, 2]]).light(60, 4, 10, 20, HUSH);
  b.encounter('The belfry guard', [56, 1, 9, 12], [['stoneGolem', 2], ['hornedDevil', 2]], 'moderate');
  b.building("Precentor's house", 74, 2, 6, 8, { mat: 'wood-planks', gm: 'Thaddeus sleeps here, when he sleeps. His desk holds his choir list: every name struck out but his.', doors: [[74, 6, 'w', 'closed']], windows: [[79, 4, 'e']] });
  b.prop('bed', 78, 3).prop('writing-desk', 75, 3).prop('harpsichord', 77, 8).prop('bookshelf', 75, 8).prop('candles', 76, 5).light(76, 5, 5, 10);
  b.area('Garden of Fallen Bells', [[47, 30, 9, 7]], { read: 'Cracked bells too old to ring are planted in the grass like headstones, green with moss. One has been dug up and rolled aside.', gm: 'Under the dug-up bell: a hole, and grey footprints that walk toward the mausoleum and simply stop. DC 18 Survival: the walkers were very heavy (the clay golems).', label: [51, 33] });
  b.props_('temple-bell', [[48, 31], [52, 32], [49, 35], [54, 34]]).prop('tree-willow', 55, 31).prop('flowers', 51, 30).prop('bench', 47, 34).prop('open-grave', 52, 35);

  // ----- Quietfield and the mausoleum -----
  b.area('Quietfield', [[56, 30, 17, 10], [56, 40, 7, 7], [71, 40, 2, 7]], {
    read: 'Ringmere\'s old graveyard climbs the hill behind the cathedral, a field of leaning stones and dead trees. Mist lies on it in the shape of people standing very still.',
    gm: 'The mist-shapes are harmless echoes of voices taken by the Hush. A hero who touches one hears (in their head) a single word: a name. The mausoleum doors are not locked; the ringers\' dead have always had to be carried in easily.',
    label: [63, 34],
  });
  b.props_('cairn', [[58, 32], [66, 31], [70, 36]]).props_('tree-dead', [[60, 37], [71, 31], [57, 44]]).props_('burial-slab', [[62, 33], [68, 34]]).props_('obelisk', [[64, 37], [59, 41]]).props_('urn', [[60, 44], [72, 43]]).prop('statue-tall-winged', 64, 31).props_('lantern-standing', [[57, 30], [72, 39]]).light(57, 30, 5, 15, HUSH).light(72, 39, 5, 15, HUSH);
  b.building('Mausoleum of the Ringers', 63, 40, 8, 7, {
    mat: 'stone-flagstone',
    read: 'A squat marble house of the dead, its lintel carved with crossed bell ropes. Inside, stone shelves of coffins, and a stair going down.',
    gm: 'The front way into the catacombs. Frost on the stair: something cold came up here recently (Rimeshaw, checking on the Hush Lectern in the cathedral).',
    doors: [[66, 40, 'n', 'closed', 'door-iron'], [67, 40, 'n', 'closed', 'door-iron'], [66, 46, 's', 'closed']],
  });
  b.prop('sarcophagus-row', 64, 42).prop('stairs-down', 66, 45).prop('urn', 69, 41).prop('candles', 64, 45).light(64, 45, 5, 10);

  // ----- the catacombs under the hill -----
  b.room('Stair of the Quiet Dead', 63, 47, 6, 4, { mat: 'dungeon-slab', read: 'The stair ends in a low landing. Skulls line the walls in neat rows, every jaw tied shut with a strip of grey cloth.', gm: 'Two ways on: west to the ossuary, east to the old chapel. The cloth strips are the same Archive-stuff as on the bridge.' });
  b.prop('stairs-up', 66, 47).prop('skull-pile', 63, 50).prop('torch-sconce', 68, 48).light(66, 48, 5, 10);
  b.cave('Ossuary of the Ringers', 56, 57, 6, 4, {
    seed: 41, mat: 'dungeon-slab',
    read: 'Bones stacked to the ceiling in patterns: bells made of skulls, ropes made of arm bones. Pale shapes drift between the stacks, and where they pass, your breath stops making fog.',
    gm: 'Five wraiths and four specters: the old ringers, woken by the Archive leaking under the hill. They hate living breath. Turn them: sign the ringers\' blessing in bell-hand (Winifred taught it; DC 15 Performance) and they bow and part. A skull-bell on the north wall is a secret door (DC 20 Perception) to the founders\' vault.',
  });
  b.tunnel([[63, 49], [59, 53]], 2, { seed: 42, mat: 'dungeon-slab' });
  b.props_('ossuary-shelf', [[52, 56], [59, 56]]).props_('skull-pile', [[54, 58], [58, 54]]).prop('bone-heap', 56, 59).prop('candles', 56, 56).light(56, 56, 5, 10, HUSH);
  b.encounter('Ossuary wraiths', [50, 51, 13, 10], [['wraith', 5], ['specter', 4]], 'low');
  b.room('Vault of the Bellfounders', 49, 48, 7, 3, { mat: 'dungeon-slab', read: 'A small dry vault. Four bronze ingots, a cloak on a peg and a curled horn lie on a stone shelf, as if left for someone.', gm: 'The founders of Ringmere\'s foundry hid their best work here. Winifred\'s great-grandmother\'s mark is on the ingots; she will let the heroes keep everything.' });
  b.hall(52, 51, 52, 55, 1, { mat: 'dungeon-slab' }).door(52, 50, 's', 'secret');
  b.prop('wall-shelves', 50, 48).prop('coffer', 54, 49).prop('treasure-urn', 49, 50);
  b.room('Chapel of the Closed Mouth', 69, 53, 9, 7, {
    mat: 'marble',
    read: 'A hidden chapel, older than the cathedral above it. The walls are carved with hundreds of hands making signs. A statue of a monk stands at the altar with one finger to its lips. Frost letters form on the altar as you watch: WELCOME. QUIETLY.',
    gm: 'The Order of the Closed Mouth\'s last door in the world. The ghost of Sister Imogen Quennel writes in frost and taps finger-cant on the backs of hands. She explains the Archive, the Keeper and the Hollow Word (see the GM\'s secret) as briefly as she can, and warns: "He is not cruel. He is afraid." The carved hands teach the Order\'s finger-cant (DC 15 Investigation to learn it in 10 minutes).',
  });
  b.tunnel([[67, 50], [70, 53]], 2, { seed: 43, mat: 'dungeon-slab' });
  b.prop('altar', 73, 54).prop('statue-tall-robed', 75, 54).props_('prayer-kneeler', [[71, 56], [74, 56]]).prop('rune-stone', 70, 58).prop('wall-alcove-arch', 77, 57).prop('candle-ring', 73, 57).light(73, 55, 10, 15, '#d8e6ff');
  b.tunnel([[73, 22], [76, 27], [77, 36], [76, 44], [74, 52]], 2, { seed: 44, mat: 'dungeon-slab' });
  b.area('The Bonewalk', [[74, 28, 4, 16]], { read: 'A long sloping passage under the graveyard, its walls set with the bones of bishops. Every few yards a bone hand points the way down.', gm: 'The bishops\' road from the crypt stair to the chapel. The bones carry vibration well: a hand on the wall feels Old Clamour clearly, and a tap code (bell-hand) carries from the cathedral to the chapel.', label: [76, 34] });
  b.props_('ossuary-shelf', [[77, 31], [76, 40]]).prop('skeleton-seated', 75, 47).prop('sconce-witchfire', 77, 36).light(77, 36, 5, 10, HUSH);
  b.cave('Flooded crypt', 56, 70, 6, 5, {
    seed: 45,
    read: 'River water has broken into a crypt of old tombs. Coffins float. In the deepest part, something enormous stirs, and a voice that is not a sound says, very kindly, inside your head: "At last. Someone to talk to."',
    gm: 'The Listener: an aboleth that crept in from the river centuries ago and has listened at the Hush Gate ever since, with four chuul. Its telepathy works in the Hush, and it is lonely. It truly knows that the Keeper\'s phylactery is his own name card, hidden in the Index. It wants to be carried to the river; it will try to enslave a hero for the job (its stat block). DC 20 Insight: it lies about everything else.',
  });
  b.pool(56, 71, 4, 3, true);
  b.tunnel([[55, 61], [56, 65]], 2, { seed: 46 });
  b.tunnel([[48, 66], [51, 68]], 1, { seed: 47 });
  b.props_('coffin', [[53, 68], [59, 72]]).prop('sarcophagus-open', 52, 73).prop('skeleton-lying', 60, 67).prop('bones-mud', 54, 66).light(56, 71, 5, 15, '#7fd6c8');
  b.encounter('The Listener in the flooded crypt', [49, 63, 15, 13], [['aboleth', 1], ['chuul', 4]], 'low');
  b.cave('The Hush Gate', 70, 71, 7, 5, {
    seed: 48, mat: 'dungeon-slab',
    read: 'At the very bottom of the catacombs a door stands in the rock with no handle and no keyhole: a round slab of grey stone carved with a thousand closed mouths. Before it waits a great iron figure with its jaw riveted shut. Frost creeps across the floor toward you.',
    gm: 'The finale of part 1. The Doorkeeper (iron golem), Rimeshaw (ice devil) and two horned devils. The chamber is hushed. If a hero writes or thinks Rimeshaw\'s true name at him (bought from Quaile), he and the horned devils must stand aside, and only the golem fights. The gate opens only while Old Clamour tolls (see the belfry). Heroes in the belfry and heroes at the gate must coordinate without voices: Mote, bell-hand tapped down the Bonewalk, lanterns, anything clever.',
  });
  b.tunnel([[73, 59], [72, 66]], 2, { seed: 49, mat: 'dungeon-slab' });
  b.tunnel([[61, 70], [64, 71]], 2, { seed: 50 });
  b.prop('portal-arch', 70, 68).props_('brazier-pedestal', [[67, 69], [73, 69]]).prop('rune-tiles', 70, 71).props_('obelisk', [[66, 73], [74, 73]]).prop('ice-block', 72, 74).light(70, 69, 15, 25, HUSH);
  b.encounter('Wardens of the Hush Gate', [63, 65, 15, 12], [['ironGolem', 1], ['hornedDevil', 2], ['iceDevil', 1]], 'high');
  return b.build();
}

// ---------- Part 2: the Silent Archive ----------
function silentArchive() {
  const b = new MapBuilder('adv-silent-archive-vault', 'The Silent Archive', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'marble' });
  // everything not built on is grey void
  b.pit(0, 0, 80, 80);
  b.area('The Grey Void', [[44, 20, 14, 10]], {
    read: 'Grey in every direction, without a horizon. Far off, other islands drift, carrying shelves, and loose pages float past like snow that never lands.',
    gm: 'A creature that steps off an island falls for 1d4 rounds, then lands in the Dead Letter Stacks, taking 6d10 force damage and gaining 1 Exhaustion level. Flying works, but the void has a pull: a flier ends each turn with a DC 18 Strength save or drops 30 ft.',
    label: [50, 25],
  });

  // ----- the Threshold -----
  b.cave('The Threshold', 7, 40, 6, 5, {
    seed: 61, mat: 'dungeon-slab',
    read: 'You step through and the world goes grey. Islands of floor hang in a colourless nothing, heavy with shelves, joined by bridges no wider than a plank. There is no sound at all. Not your heartbeat. Not your breath.',
    gm: 'The whole Archive is hushed (Silence) for everyone but its Keeper. When each hero crossed, their voice was filed: their name card is in the Index, and tearing it frees their voice here for good. Sister Imogen\'s ghost waits, writing WELCOME in frost and pointing to the Index. Outside time: short rests work, long rests give no benefit.',
  });
  b.start(5, 39, 3, 3);
  b.prop('portal-arch', 3, 40).prop('obelisk', 9, 38).prop('candle-ring', 7, 42).prop('crumbling-ledge', 8, 43).light(3, 40, 10, 20, HUSH).light(7, 42, 5, 10, '#d8e6ff');
  b.floor(12, 40, 7, 2, 'stone-flagstone');
  b.props_('bridge-plank', [[14, 40], [16, 41]]);

  // ----- the Long Stacks (north) -----
  b.room('The Long Stacks', 10, 6, 36, 10, {
    mat: 'wood-planks-dark',
    read: 'Shelves taller than towers march away into the grey, full of books with plain grey spines. Stone librarians walk the aisles, putting books back. One stops, turns its blank face toward you, and holds out its hand for your book.',
    gm: 'Three stone golems re-shelve forever. They ignore anyone not carrying a book, and attack anyone who carries one away. Put it back and they stop. DC 20 Stealth to slip through. A chunk of floor fell into the void here (the gap): jumping it is DC 15 Athletics. Each book holds a filed sound; most are ordinary (a dog, a door, a cough).',
  });
  b.pit(26, 7, 3, 2);
  for (const x of [14, 18, 22, 32, 36, 40]) b.wallRun(x, 7, 3, 'e').wallRun(x, 12, 3, 'e');
  b.props_('archive-stacks', [[13, 7], [17, 13], [21, 8], [33, 13], [37, 7], [41, 13]]).props_('bookcase-ladder', [[15, 8], [39, 12]]).props_('library-stack', [[19, 14], [35, 9]]).prop('bookshelf-fallen', 25, 9).prop('scroll-pile', 29, 9).prop('skeleton-seated', 43, 14).prop('cobweb-corner', 10, 6).prop('book-pile', 30, 13).prop('chasm-edge', 27, 9);
  b.light(20, 10, 10, 20, '#d8e6ff').light(36, 10, 10, 20, '#d8e6ff');
  b.encounter('Shelf-wardens', [10, 6, 36, 10], [['stoneGolem', 3]], 'low');
  b.floor(11, 16, 1, 22, 'wood-planks');
  b.props_('bridge-rope', [[11, 20], [11, 30]]);
  b.floor(26, 16, 1, 18, 'stone-flagstone');
  b.area('The Spine Stair', [[26, 17, 1, 14]], { read: 'A single line of floating stone steps, each one a book\'s width wide.', gm: 'The direct way between the Index and the Long Stacks. Fighting on it: DC 15 Acrobatics when hit or fall into the void.', label: [26, 24] });

  // ----- the Index: Hall of Unspoken Names (centre) -----
  b.cave(null, 26, 40, 10, 9, { seed: 62, mat: 'marble' });
  shell(b, 19, 34, 15, 13, 'marble');
  b.door(19, 40, 'w', 'open', 'door-double').door(19, 41, 'w', 'open', 'door-double').door(26, 34, 'n', 'closed').door(26, 46, 's', 'closed').door(33, 40, 'e', 'closed');
  b.wallRun(30, 37, 4, 's').wallRun(30, 34, 4, 'w').door(30, 36, 'w', 'secret');
  b.area('Hall of Unspoken Names', [[19, 34, 11, 13], [30, 38, 4, 9]], {
    read: 'A hall of little drawers, millions of them, each labelled in tiny grey script. A drawer slides open by itself, a card flutters in, it slides shut. At the reading desk, a woman with six arms and a serpent\'s tail sorts cards faster than you can follow.',
    gm: 'The Index: every name and voice the Hush has taken is a card here. Finding a hero\'s own card takes 1 minute and DC 18 Investigation; tearing it gives that hero back their voice in the Archive. Madam Catalogue (marilith) and two horned devils guard it; they are bound because their own names are filed. Finding the marilith\'s card (DC 22) and handing it to her frees her: she leaves at once, and the devils with her. Orisande\'s card and Rimeshaw\'s card are here too (DC 20 each).',
  });
  b.area('The Closed Drawer', [[30, 34, 4, 4]], { gm: 'Secret door (DC 22 Perception, or Imogen points it out). One drawer, one card: the Keeper\'s own name (handout). It is his phylactery. It cannot be harmed except by the Furnace of Pages, or by speaking his full name aloud while holding it.' });
  for (const x of [21, 24, 27]) b.props_('archive-stacks', [[x, 36], [x, 38], [x, 43], [x, 45]]);
  b.prop('lectern-dais', 31, 42).props_('map-cabinet', [[32, 44], [32, 39]]).prop('chandelier-great', 25, 40).prop('map-cabinet', 32, 35).prop('coffer', 31, 36).prop('crumbling-ledge', 22, 47).prop('globe-stand', 35, 37);
  b.light(25, 40, 15, 25, '#d8e6ff').light(32, 36, 3, 8, HUSH);
  b.encounter('Madam Catalogue', [19, 34, 11, 13], [['marilith', 1], ['hornedDevil', 2]], 'moderate');

  // ----- the Reading Room of Bells (north-east) -----
  b.cave(null, 63, 13, 10, 8, { seed: 63, mat: 'marble' });
  b.floor(46, 11, 8, 2, 'stone-flagstone');
  b.props_('bridge-plank', [[48, 11], [51, 12]]);
  shell(b, 56, 8, 15, 11, 'wood-planks');
  b.door(56, 11, 'w', 'closed', 'door-double').door(56, 12, 'w', 'closed', 'door-double').door(63, 18, 's', 'closed').door(70, 13, 'e', 'closed');
  b.area('Reading Room of Bells', [[56, 8, 15, 11]], {
    read: 'A long room of green lamps and leather chairs. Devils sit reading, turning pages without a sound. On a stand under glass, a single book is chained shut. Its spine says "Ringmere".',
    gm: 'Two ice devils and a horned devil, the Archive\'s readers. They ask, telepathically and politely, for quiet. Sitting and reading gets the heroes across unbothered (DC 18 Stealth for the group). Every book here holds a filed sound: opening one plays it in your head. The chained "Ringmere" book holds the whole city\'s bells: carrying it out of the Archive restores them, even if the Keeper wins.',
  });
  b.props_('table-reading', [[59, 10], [59, 15], [63, 10], [63, 15]]).props_('armchair', [[60, 10], [60, 15], [64, 10], [64, 15]]).props_('lamp-table', [[58, 12], [66, 12]]).prop('chandelier-crystal', 63, 13).prop('lectern', 67, 10).props_('bookshelf-tall', [[57, 9], [69, 9], [57, 17], [69, 17]]).prop('display-case', 67, 16).prop('globe-great', 72, 13).prop('astrolabe-stand', 55, 6);
  b.light(59, 12, 5, 15, '#7fe0a0').light(64, 12, 5, 15, '#7fe0a0').light(67, 16, 3, 8, HUSH);
  b.encounter('Silent readers', [56, 8, 15, 11], [['iceDevil', 2], ['hornedDevil', 1]], 'moderate');
  b.floor(66, 19, 2, 15, 'stone-flagstone');
  b.area('Bridge of Unrung Bells', [[66, 22, 2, 9]], { read: 'A bridge hung on both sides with bells of grey glass. They swing as you cross, and ring silently.', gm: 'The north way into the Keeper\'s Sanctum. A hero whose voice is free hears the bells: each one is a voice from Ringmere saying its own name.', label: [66, 26] });
  b.props_('temple-bell', [[67, 23], [66, 29]]);

  // ----- the Keeper's Sanctum (east) -----
  b.cave(null, 70, 40, 8, 9, { seed: 64, mat: 'dungeon-slab' });
  shell(b, 64, 34, 13, 13, 'marble');
  b.door(66, 34, 'n', 'closed', 'door-double').door(67, 34, 'n', 'closed', 'door-double').door(64, 40, 'w', 'closed').door(70, 46, 's', 'closed', 'door-double').door(71, 46, 's', 'closed', 'door-double');
  b.area("The Keeper's Sanctum", [[64, 34, 13, 13]], {
    read: 'A round hall of grey marble faces nothing. In the middle, a book as big as a house turns its pages on its own, drinking a thin grey stream of words that flows in from everywhere. Above it, in a cage of silver, hangs a small black book. A dead monk with his jaw wired shut lifts a bone finger and writes on the air in cold light: QUIET.',
    gm: 'The finale. Keeper Bastian Vellamy (lich), an iron golem and two wraiths. The Great Folio is the Hush Engine: closing it (two actions, DC 20 Athletics each) stops the drinking; tearing it open releases every filed voice in a roar. The black book is the Unread Book, holding the Hollow Word. Sealing it for good takes the Litany of Keeping (handout): five verses, each sung by a hero with a free voice as an action (DC 18 Performance or Religion). The Keeper is not bound by the Hush.',
  });
  b.prop('levitating-tome', 70, 40).prop('cage-hanging', 70, 37).prop('throne-dais', 73, 36).props_('statue-tall-robed', [[65, 35], [75, 35]]).props_('brazier-pedestal', [[66, 44], [74, 44]]).prop('summoning-circle', 70, 42).prop('bookcase-grand', 75, 40).prop('archive-stacks', 65, 44).prop('orb-pedestal', 67, 40);
  b.light(70, 40, 15, 30, HUSH).light(66, 44, 5, 15, '#9fb4ff').light(74, 44, 5, 15, '#9fb4ff');
  b.encounter('The Last Keeper', [64, 34, 13, 13], [['lich', 1], ['ironGolem', 1], ['wraith', 2]], 'high');

  // ----- the Dead Letter Stacks (middle of the void) -----
  b.cave('Dead Letter Stacks', 46, 40, 5, 4, {
    seed: 65, mat: 'wood-planks-dark',
    read: 'A heap of misfiled things on a raft of shelving: torn letters, odd shoes, a lute with no strings, a skeleton still holding a library ticket.',
    gm: 'Where the void drops those who fall. DC 16 Investigation finds something useful (treasure), and a letter from Bastian to Imogen, never sent, that says he is sorry and does not know how to stop.',
  });
  b.floor(34, 40, 9, 1, 'stone-flagstone');
  b.floor(50, 40, 14, 1, 'stone-flagstone');
  b.props_('book-pile', [[44, 38], [48, 42]]).prop('loot-sacks', 46, 41).prop('skeleton-lying', 43, 41).prop('broken-furniture', 48, 38).prop('scroll-pile', 46, 39).prop('bridge-plank', 56, 40);
  b.light(46, 40, 5, 10, '#d8e6ff');

  // ----- the Furnace of Pages (south-east) -----
  b.cave('Furnace of Pages', 56, 56, 7, 6, {
    seed: 66, mat: 'stone-flagstone-warm',
    read: 'Heat at last, and light: a great iron furnace roars without a sound, fed by pages that drift in from the void. Figures of living fire rake the coals, chained by brass rings to the grate.',
    gm: 'Three efreet and four fire elementals burn the overflow the Archive cannot shelve. Each efreeti is bound by a brass ring on the grate (AC 18, 20 HP); break a ring and that efreeti is free, and either leaves or turns on its fellows (DC 18 Persuasion by sign). The pool in the middle is molten (lava). This fire is the one thing that can burn the Keeper\'s card.',
  });
  b.lava(55, 55, 3, 2);
  b.floor(47, 44, 1, 11, 'stone-flagstone').floor(47, 54, 5, 1, 'stone-flagstone');
  b.floor(62, 55, 9, 2, 'stone-flagstone').floor(70, 47, 2, 10, 'stone-flagstone');
  b.prop('forge', 52, 54).prop('cauldron', 59, 58).props_('brazier-everburning', [[53, 59], [60, 53]]).prop('embers-ash', 57, 59).prop('book-pile', 51, 57).prop('lava-pool', 56, 55).prop('wall-chains', 58, 52);
  b.light(56, 55, 20, 30, '#ff7a2e');
  b.encounter('Fire that eats pages', [49, 50, 15, 13], [['efreeti', 3], ['fireElemental', 4]], 'moderate');

  // ----- the Bound Gallery (south) -----
  b.cave('The Bound Gallery', 36, 64, 9, 7, {
    seed: 67, mat: 'marble',
    read: 'Pillars of shelving rise from the island, and chained to the tallest is an angel: grey-green skin, wings of tarnished silver. It lifts its sword at you, and its mouth moves, and nothing comes out. It is weeping light.',
    gm: 'Orisande, the planetar who was the Archive\'s first guardian, with two shield guardians. The Keeper filed its name, so it guards the shelves without knowing why. It fights only if the heroes cross the gallery. Tear its card (from the Index) in front of it and it remembers itself: it kneels, joins the heroes for the last fight, and may offer to become the new Keeper.',
  });
  b.floor(20, 47, 12, 1, 'stone-flagstone').floor(31, 47, 1, 12, 'stone-flagstone');
  b.floor(44, 64, 7, 1, 'stone-flagstone').floor(50, 59, 1, 6, 'stone-flagstone');
  b.prop('archive-stacks', 33, 61).prop('column-cluster', 36, 62).props_('wall-chains', [[35, 63], [37, 63]]).prop('statue-tall-winged', 41, 66).prop('summoning-circle', 36, 66).prop('cage', 31, 67).prop('enchanted-shield', 39, 61);
  b.light(36, 63, 15, 25, '#fff1b0');
  b.encounter('The chained guardian', [27, 57, 19, 15], [['planetar', 1], ['shieldGuardian', 2]], 'low');

  // ----- the Scriptorium of the Closed Mouth (south-west) -----
  b.cave(null, 13, 63, 9, 8, { seed: 68, mat: 'wood-planks' });
  b.floor(6, 45, 1, 16, 'wood-planks');
  b.props_('bridge-rope', [[6, 49], [6, 54]]);
  b.floor(20, 63, 9, 1, 'stone-flagstone');
  shell(b, 7, 58, 13, 10, 'wood-planks');
  b.door(13, 58, 'n', 'closed').door(19, 63, 'e', 'closed').door(7, 63, 'w', 'closed');
  b.area('Scriptorium of the Closed Mouth', [[7, 58, 13, 10]], {
    read: 'Rows of desks, and at every desk a see-through monk copying a book, quill scratching without a sound. None of them looks up. On a lectern at the end lies a book bound in plain grey cloth, open at a page of verses.',
    gm: 'Four ghost monks and four wraiths: the Order\'s dead, still copying. They ignore the heroes unless someone touches the grey book: the Litany of Keeping (handout). Sign a request in the Order\'s finger-cant (learned in the chapel, or from Imogen) and they bow and let the heroes copy it. Otherwise they fight to keep it.',
  });
  b.props_('writing-desk', [[9, 60], [12, 60], [15, 60], [9, 64], [12, 64], [15, 64]]).prop('lectern', 17, 59).prop('scroll-rack', 8, 66).prop('bookshelf-tall', 18, 66).props_('candles', [[10, 62], [14, 62]]).prop('book-pile', 13, 66).prop('reading-nook', 5, 68);
  b.light(12, 62, 10, 20, '#ffe3a8');
  b.encounter('The copyists who stayed', [7, 58, 13, 10], [['ghost', 4], ['wraith', 4]], 'low');

  // ----- the Sealed Stack (far south-east) -----
  b.cave('The Sealed Stack', 68, 68, 7, 6, {
    seed: 69, mat: 'dungeon-slab',
    read: 'A whole island of shelves has been pushed over and chained down, as if to hold something under it. The shelves breathe. Two great four-armed fiends sit on top, reading aloud with mouths that make no sound, waiting for someone who can.',
    gm: 'Optional and dangerous. A balor is pinned under the shelves; its name is filed here, and two glabrezu try to trick a hero with a free voice into reading its card aloud ("it is only a list, read it for us"). If anyone does, the balor is free and fights with them. The fight as listed includes the balor. If nobody reads the card, the balor stays pinned and the two glabrezu fight alone, a much easier fight.',
  });
  b.floor(58, 61, 1, 6, 'stone-flagstone').floor(58, 66, 6, 1, 'stone-flagstone');
  b.prop('bookshelf-fallen', 68, 68).props_('chains-hanging', [[66, 66], [70, 70]]).prop('magic-circle', 68, 71).prop('gate-iron-tall', 64, 69).prop('glyph-trap', 71, 66).prop('magic-sword', 69, 69);
  b.light(68, 69, 10, 20, '#ff5a3a');
  b.encounter('What sleeps in the Sealed Stack', [61, 62, 15, 13], [['balor', 1], ['glabrezu', 2]], 'moderate');
  b.floor(74, 47, 1, 21, 'marble');
  b.area('The Unwritten Bridge', [[74, 50, 1, 12]], { gm: 'Secret: an invisible bridge from the Sealed Stack up to the Sanctum (DC 22 Perception, or throw dust or ink on it). The back way in, behind the Keeper.', label: [74, 56] });
  b.note(74, 56, 'Invisible bridge: only those who find it can see it.');
  return b.build();
}

export const SILENT_ARCHIVE: Adventure = {
  id: 'silent-archive',
  title: 'The Silent Archive',
  tagline: 'Every bell, song and name in the world is going quiet, one city at a time, and something is filing them away.',
  levels: '17-18',
  sessions: '2-3 sessions',
  players: '3-5 players',
  tags: ['two-part', 'city', 'planar', 'lich', 'silence', 'epic'],
  pitch:
    'Ringmere is the city of a hundred bell towers. Three weeks ago its people forgot each other\'s names. Then they forgot their songs. Then the bells stopped. Now nobody in Ringmere can say a word. And yesterday, a hundred miles away, the next city woke up unable to remember its own name.',
  secret:
    'Long ago the Order of the Closed Mouth built the Silent Archive, a vault outside time, to keep words too dangerous to say: curses, the true names of fiends and angels, and the Hollow Word, a word that unmakes whatever it names. The seal on the Word holds only while living voices sing the Litany of Keeping. The monks died out. The last of them, Keeper Bastian Vellamy, became a lich so someone would always watch, but dead lungs cannot sing, and the seal began to crack. Last month the Hollow Word started leaking into dreams in Ringmere, nearest to the Archive\'s gate. Bastian panicked. If nobody can speak, nobody can ever speak the Word. His Hush Engine, the Great Folio, is filing away all speech: Ringmere first, the next city now, the world within the year. He is not cruel. He is terrified.',
  hooks: [
    'Precentor Thaddeus Fenwright of Ringmere sent a letter in his own shaking hand, the only way he can still talk: "We have lost our voices. Please. Come quickly."',
    'A hero wakes one morning unable to say the name of someone they love. A sage tells them it started in Ringmere.',
    'A planetar appears in a hero\'s dream, mouth moving without sound, and shows them a door of grey stone carved with closed mouths.',
  ],
  tips: [
    'Play the silence at the table. In a hushed area, players may not talk in character: they mime, point at the map, write on scraps of paper, or use the bell-hand handout. Give Inspiration for the cleverest ways to be understood.',
    'Hushed areas work like the Silence spell: Deafened, no Verbal components, immune to Thunder. Warn casters before they walk in. Telepathy works, so devils, the aboleth and the Keeper\'s other servants can still "talk" in the heroes\' heads.',
    'Keep a Hush Clock in view, starting at 2. It goes up by 1 each long rest in Ringmere and down by 1 each lectern broken. At 4 the heroes forget their own names. At 6 Ringmere is lost for good and the Hush jumps to the next city.',
    'Part 2 is a ring of floating islands. The Index in the middle gives back the heroes\' voices; send them there first if your party leans on spells. Imogen can point the way.',
    'Many fights can be turned: devils and angels serve only because their names are filed. Finding a card in the Index is a key that opens a lot of locks.',
    'The Keeper can be talked down (DC 25 Persuasion, by writing or sign, with advantage if the heroes have sung a verse of the Litany in front of him). Let a clever party end it without a final fight.',
  ],
  npcs: [
    {
      id: 'pf_slabastian', name: 'Keeper Bastian Vellamy', title: 'last Keeper of the Silent Archive', kind: 'monster', art: 'lich', monsterId: 'lich',
      wants: 'Silence everywhere, forever, so that the Hollow Word can never be spoken again.',
      knows: 'The Hollow Word itself; every name in the Index; that his phylactery is his own name card, hidden in the Closed Drawer.',
      voice: 'He has none. He writes on the air with a bone finger, letters of cold light in a neat librarian\'s hand. When he is angry, the letters get very small.',
      appearance: 'A tall, thin dead monk in a grey habit, his jaw bound shut with silver wire. Paper tags hang from his belt like keys.',
      backstory: 'Last of the Order of the Closed Mouth. When the others died he became a lich so someone would always keep watch. Undead lungs cannot sing the Litany, and he has known for a hundred years that his watch was failing.',
      gmNotes: 'Lich stat block; the Archive\'s Hush does not bind him. His phylactery is his name card: burn it in the Furnace of Pages, or speak his full name aloud while holding it. If the heroes seal the Word with the Litany in front of him, he stops fighting, writes THANK YOU, and lets himself crumble.',
    },
    {
      id: 'pf_slawinifred', name: 'Winifred Coldwell', title: 'bellfounder of Ringmere', kind: 'npc', art: 'blacksmith', shared: true,
      wants: 'Her bells back. She has always felt them through her feet and teeth, and the city has gone dead still.',
      knows: 'Bell-hand, the ringers\' sign speech; that Old Clamour was cast "tuned to a door"; the ringers\' blessing that calms their dead.',
      voice: 'Talks with her hands, fast and funny, and signs swear words with relish. Taps people on the shoulder twice to mean "listen".',
      appearance: 'A broad woman of sixty with burn-scarred forearms, a leather apron and copper filings in her grey hair. She lays a hand on every bell she passes.',
      gmNotes: 'Deaf from birth, so the Hush barely changes her life, which makes her the most useful person in Ringmere. She can ring Old Clamour alone, by feel, if someone gets her to the belfry safely.',
    },
    {
      id: 'pf_slathaddeus', name: 'Thaddeus Fenwright', title: 'precentor of the Cathedral of the Hundred Bells', kind: 'npc', art: 'priest', monsterId: 'priest', shared: true,
      wants: 'To sing again. He will do anything for it, including foolish things.',
      knows: 'The founding stone\'s warning, the crypt stair key, and that the Bonewalk leads down to "the door the bishops sealed".',
      voice: 'None now. He conducts what he means: a raised finger for "wait", a fist closing for "stop", great sweeping arms for "this way".',
      appearance: 'A gangly old man in a crumpled cassock, with ink on his cuffs and a tuning fork on a ribbon round his neck.',
    },
    {
      id: 'pf_slamote', name: 'Mote', title: 'the child nobody named', kind: 'npc', art: 'child', shared: true,
      wants: 'Food, a coat that fits, and for someone to keep asking her name so she can keep saying she has not got one.',
      knows: 'She can still talk because the Hush takes names first and she never had one. Where the "air-men" gather, and that grey figures walk into the mausoleum at night.',
      voice: 'Fast, cheeky and hoarse. She talks all the time now, because nobody else can.',
      appearance: 'A small, sharp-faced girl of about nine in a lamplighter\'s coat three sizes too big, with a stub of chalk behind one ear.',
      gmNotes: 'The heroes\' messenger and translator. If anyone gives her a name, she loses her voice within the hour. Let Winifred give a warning look before a kind player does it by accident.',
    },
    {
      id: 'pf_slaquaile', name: 'Peregrine Quaile', title: 'dealer in rare words', kind: 'monster', art: 'rakshasa', monsterId: 'rakshasa',
      wants: 'Names, true names most of all: one freely given, or a fiend\'s card from the Archive.',
      knows: 'Where the Hush Gate is, that Old Clamour opens it, and the true name of the ice devil Rimeshaw who guards it.',
      voice: 'The only grown-up voice left in Ringmere, and he loves using it: warm, purring, every sentence a small gift wrapped in ribbon.',
      appearance: 'In human shape, a plump gentleman in a plum waistcoat with very clean grey gloves. Under the gloves his hands are on backwards.',
      gmNotes: 'Rakshasa stat block. Keeps every bargain to the letter and no further. Fights only if robbed or exposed, with two oni footmen from the back room.',
    },
    {
      id: 'pf_slarimeshaw', name: 'Rimeshaw', title: 'ice devil, warden of the Hush Gate', kind: 'monster', art: 'iceDevil', monsterId: 'iceDevil',
      wants: 'To be free of a contract older than Ringmere. His true name is filed in the Index, so he must obey the Keeper.',
      knows: 'The Archive\'s layout: the Index in the middle, the Sanctum at the far edge, and that the Keeper\'s own card is "somewhere in the drawers".',
      voice: 'Telepathic only, like frost forming on the inside of your skull. Clipped and bored, like a clerk at closing time.',
      appearance: 'A tall insect-like devil of blue ice, with a ledger chained to one wrist.',
      gmNotes: 'Ice devil stat block. Written or thought at him, his true name makes him stand aside and even point the way. Freed in part 2 (tear his card in the Index), he leaves grateful and owes the heroes one favour.',
    },
    {
      id: 'pf_slaimogen', name: 'Sister Imogen Quennel', title: 'ghost of the Order of the Closed Mouth', kind: 'npc', art: 'ghost', monsterId: 'ghost', shared: true,
      wants: 'The Litany sung again by living voices, and her old friend Bastian at rest.',
      knows: 'The Litany of Keeping, the Order\'s finger-cant, where the Closed Drawer is, and that Bastian filed his own name so he could not die.',
      voice: 'No voice. She writes in frost on any cold surface and taps finger-cant on the backs of people\'s hands. Her frost letters are round and kind.',
      appearance: 'A small, round nun in a grey habit, see-through, with ghostly ink stains on her fingers and one finger always near her lips.',
      gmNotes: 'An ally. She can appear in the Chapel of the Closed Mouth and anywhere in the Archive. She will not fight Bastian, but she will stand between him and a fallen hero.',
    },
    {
      id: 'pf_slaorisande', name: 'Orisande', title: 'the Archive\'s first guardian', kind: 'monster', art: 'planetar', monsterId: 'planetar',
      wants: 'Its name back. Without it, it guards the shelves without knowing why or for whom.',
      knows: 'That the Archive was built to protect the world, not to silence it; the history of the Hollow Word; how the bound outsiders can be freed.',
      voice: 'Its mouth moves; nothing comes out. When it cannot make itself understood, it weeps light.',
      appearance: 'A nine-foot angel with grey-green skin and wings of tarnished silver, chained to a pillar of shelves.',
      gmNotes: 'Planetar stat block. Freed by tearing its card in front of it. Afterward it fights beside the heroes, and offers to become the new Keeper so that no mortal has to.',
    },
  ],
  handouts: [
    { id: 'bell-hand', title: "Bell-hand: the ringers' signs", text: 'Flat palm down: quiet / wait.\nFist: stop.\nTwo taps on the wrist: danger.\nHand cupped behind ear: listen.\nPoint, then pull: come here.\nTaps on stone: 1 yes, 2 no, 3 come, 4 run, a long roll: ring now!\nThe ringers\' blessing: both palms up, then slowly closed, like a bell going still.' },
    { id: 'struck-register', title: 'A page of the Register of Names', text: 'Abel Cotter, cooper. ~~Struck.~~\nMarta Cotter, his wife. ~~Struck.~~\nLina Cotter, their daughter. ~~Struck.~~\n... in the margin, in tiny grey script that was not there a moment ago: "Filed. With regret. — B.V."' },
    { id: 'founding-stone', title: 'The founding stone of the cathedral', text: 'HERE THE HOUSE OF BELLS IS RAISED\nABOVE THE DOOR OF THOSE WHO DO NOT SPEAK.\nWHEN OLD CLAMOUR TOLLS, THE CLOSED DOOR LISTENS.\nRING HER NOT UNLESS THE KEEPERS CALL.' },
    { id: 'quaile-offer', title: "Mister Quaile's card", text: 'QUAILE & DAUGHTER — Dealers in Rare Words.\nFor sale today: the way to the Closed Door. The name of the cold thing that guards it.\nPrice: one name, freely given. Or one card from the great Index (any fiend will do).\nAll sales final. No refunds. No echoes.' },
    { id: 'litany', title: 'The Litany of Keeping', text: 'I. We have a word we will not say.\nII. We hold it in a book no eye shall read.\nIII. We give it no breath, no name, no door.\nIV. We sing, so that the silence need not.\nV. Let it sleep, and let the world keep talking.\n(To be sung by living voices. If no voice lives, the seal fails.)' },
    { id: 'keeper-card', title: 'A card from the Closed Drawer', text: 'VELLAMY, Bastian.\nKeeper. Last of the Order.\nFiled by his own hand, so that he may not leave his post.\nDO NOT READ ALOUD.' },
  ],
  chapters: [
    {
      id: 'ringmere', title: 'Part 1: The Hushed City', level: 17,
      summary: 'A great city that has lost its voice: invisible wardens in the market, devils auditing the register of names, a great bell in chains, and catacombs that lead to a door carved with closed mouths.',
      goal: 'Find out what is drinking Ringmere\'s voice, break its lecterns if you can, and open the Hush Gate.',
      map: ringmere,
      npcs: [
        { npc: 'pf_slawinifred', x: 6, y: 6 },
        { npc: 'pf_slathaddeus', x: 58, y: 11 },
        { npc: 'pf_slamote', x: 20, y: 67 },
        { npc: 'pf_slaquaile', x: 32, y: 58 },
        { npc: 'pf_slaimogen', x: 73, y: 56 },
        { npc: 'pf_slarimeshaw', x: 70, y: 72, hidden: true },
      ],
      scenes: [
        { room: 'The West Gate', title: 'A city with its mouth shut', read: 'A hundred bell towers rise over the roofs, and not one of them rings. People pass you in the street without a sound. A guard opens her mouth to say welcome, and nothing at all comes out.', gm: 'Start the Hush Clock at 2. Let the players feel the quiet for a minute of real time. Mote finds them soon: hers is the only voice in the street.' },
        { room: 'Silent Market', title: 'The Lectern of Songs', encounter: 'Hush-wardens in the market', read: 'The market is crowded and silent, like a painting. The air around an iron lectern on the fountain steps ripples, as if something unseen is pacing round it.', gm: 'The first hushed area. The stalkers only attack those who go for the lectern; a careful party can watch first (DC 18 Perception to spot the ripples). Breaking or "filing" the lectern brings back songs here.' },
        { room: 'The Mute Swan', title: 'Slates and chalk', read: 'Every table has a slate, and every slate is full of chalk. The barmaid taps a slate twice: SOUP 2c. In the corner, an old man writes the same name over and over, and you watch it fade each time.', gm: 'Clues on the slates. A safe place to talk aloud, rest and plan.' },
        { room: 'Coldwell Bell Foundry', title: 'Bell-hand', handout: 'bell-hand', read: 'A big grey-haired woman pours bronze in total silence. When you stamp, she looks up, grins, and starts talking with her hands, very fast.', gm: 'Winifred teaches bell-hand. Hand the players the handout for real: from now on, in hushed areas, they can use these signs at the table.' },
        { room: "Lamplighters' Green", title: 'The girl who can still talk', read: 'Under the willows a skinny girl in an enormous coat is singing to herself, out loud. Every head in the park turns to stare at her, hungry.', gm: 'Mote. She can carry messages, translate slates, and tell the heroes about the air-men and the grey figures in Quietfield. Warn by look, not word, if a player tries to name her.' },
        { room: 'Hall of Names', title: 'The Name-Takers', encounter: 'The Name-Takers', handout: 'struck-register', gm: 'The register is hushed and guarded. Turn the bone devils with a written promise, or fight. Breaking the lectern brings names back to the district.', treasure: 'In the records vault: 2,400 gp in city silver and a Ring of Mind Shielding. The oldest register mentions the sealed door under the cathedral.' },
        { room: "Quaile's shop front", title: 'A dealer in rare words', encounter: "Mister Quaile's back room", handout: 'quaile-offer', optional: true, gm: 'Bargain or brawl. Quaile sells the gate\'s secret and Rimeshaw\'s true name. He keeps every deal to the letter. Exposed or robbed, he fights with his oni.', treasure: 'If he is defeated: gems worth 3,000 gp, a Cloak of Displacement, and a shelf of bottled names (each smashed bottle gives a townsperson their name back).' },
        { room: 'Nave of the Hundred Bells', title: "The precentor's warning", handout: 'founding-stone', read: 'Ten thousand candle stubs and not one hymn. In the choir, a thin old man conducts a choir of nobody, with tears on his face.', gm: 'Thaddeus shows them the founding stone in the narthex and gives them the crypt stair key. The vestry secret door (DC 20 Perception) is a way out if the belfry fight goes badly.', treasure: 'The vestry plate chest: 600 gp of silver, which Thaddeus offers freely.' },
        { room: 'Belfry of Old Clamour', title: 'Old Clamour in chains', encounter: 'The belfry guard', gm: 'Free the clapper, then decide: break the lectern (loud, the gate opens for an hour, the Keeper is warned) or ring silently (the gate opens for 1 minute only, while the bell swings). Winifred can ring it alone.', treasure: 'A dead bell-captain\'s satchel: a Potion of Supreme Healing and the belfry keys.' },
        { room: 'Ossuary of the Ringers', title: "The ringers' bones", encounter: 'Ossuary wraiths', gm: 'Old ringers\' ghosts. The ringers\' blessing in bell-hand turns them. The secret door to the founders\' vault is in the north wall.', treasure: 'In the Vault of the Bellfounders: four bell-metal ingots (750 gp each), a Mantle of Spell Resistance and a Horn of Blasting (it makes no sound in a hushed area).' },
        { room: 'Flooded crypt', title: 'The Listener', encounter: 'The Listener in the flooded crypt', optional: true, gm: 'A lonely aboleth that can "talk" in the silence. It tells one important truth (the phylactery is the Keeper\'s name card) and many lies. Reached by the culvert from the river, or from the ossuary.', treasure: 'Six black pearls (500 gp each) and a Ring of Free Action among the floating coffins.' },
        { room: 'The Hush Gate', title: 'The door that listens for bells', encounter: 'Wardens of the Hush Gate', read: 'A round door of grey stone, carved with a thousand closed mouths. Before it, an iron giant with its jaw riveted shut. The cold reaches you before the devil does.', gm: 'The climax. Rimeshaw\'s true name can halve this fight. The gate opens only while Old Clamour tolls: the heroes must coordinate the bell above and the door below without voices. When it opens, the mouths carved on it all open too.', treasure: 'An Amulet of the Planes hangs on the Doorkeeper\'s chest.' },
      ],
      wrapUp: 'The grey door opens on nothing at all, and the heroes step through. If they broke all three lecterns, Ringmere can speak again: the whole city shouts their names from the rooftops as they go. If not, the silence follows them in. The heroes reach level 18.',
    },
    {
      id: 'archive', title: 'Part 2: The Silent Archive', level: 18,
      summary: 'A library of floating islands in grey void, outside time: stone librarians, devil readers, a chained angel, a furnace that eats pages, and the Keeper\'s sanctum where the world\'s speech is being filed away.',
      goal: 'Free your voices, find the Keeper\'s name, and stop the Hush, by sealing the Hollow Word for good.',
      map: silentArchive,
      npcs: [
        { npc: 'pf_slaimogen', x: 8, y: 41 },
        { npc: 'pf_slaorisande', x: 36, y: 64 },
        { npc: 'pf_slabastian', x: 70, y: 38 },
      ],
      scenes: [
        { room: 'The Threshold', title: 'Outside time', read: 'The door closes behind you, and the world is grey. Islands of floor drift in nothing, heavy with shelves, joined by bridges a plank wide. You cannot hear your own heartbeat.', gm: 'Everyone is hushed. Imogen writes WELCOME in frost and points toward the Index. Remind the players of the void rule before anyone jumps.' },
        { room: 'The Long Stacks', title: 'Stacks that walk', encounter: 'Shelf-wardens', gm: 'Stone golems re-shelve forever and only attack book thieves. The gap in the floor is a good place to fight or flee.', treasure: 'A Tome of Clear Thought misfiled among cookery books (DC 20 Investigation).' },
        { room: 'Hall of Unspoken Names', title: 'The Index', encounter: 'Madam Catalogue', read: 'A hall of little drawers, millions of them. A drawer slides open by itself, a card flutters in, it slides shut. At the reading desk, a six-armed serpent-woman sorts cards faster than you can follow.', gm: 'The heart of part 2. Each hero can find and tear their own card (DC 18 Investigation) to get their voice back. Find the marilith\'s card (DC 22) and she leaves. Orisande\'s and Rimeshaw\'s cards are here too.', treasure: 'On the reading desk: an Ioun Stone (Mastery) the marilith used as a paperweight.' },
        { room: 'The Closed Drawer', title: "The Keeper's own card", handout: 'keeper-card', optional: true, gm: 'The secret room (DC 22 Perception, or Imogen shows them). The card is the Keeper\'s phylactery. Burn it in the Furnace of Pages, or speak his full name aloud while holding it, and he cannot return.' },
        { room: 'Scriptorium of the Closed Mouth', title: 'The copyists who stayed', encounter: 'The copyists who stayed', handout: 'litany', gm: 'Ask in finger-cant and the ghost monks let the heroes copy the Litany. Grab the book and they fight for it.', treasure: 'In a copyist\'s desk: a Ring of Spell Storing, its stored spell a Dispel Magic.' },
        { room: 'The Bound Gallery', title: 'The chained guardian', encounter: 'The chained guardian', gm: 'Fight Orisande, or bring its card from the Index and free it. Freed, it fights beside the heroes in the Sanctum.', treasure: 'A +3 Shield hung on the gallery\'s tallest pillar, which Orisande gives the heroes once freed.' },
        { room: 'Reading Room of Bells', title: 'The silent readers', encounter: 'Silent readers', gm: 'Sit and read to pass in peace, or fight. The chained "Ringmere" book holds the city\'s bells: carry it home and they ring again whatever else happens.', treasure: 'A Crystal Ball on the head reader\'s desk.' },
        { room: 'Dead Letter Stacks', title: 'Misfiled', optional: true, gm: 'Where fallers land. Bastian\'s unsent letter to Imogen shows he wants to be stopped: it gives advantage on any attempt to talk him down.', treasure: 'Among the lost things: a Bag of Holding full of letters never delivered, and an Ioun Stone (Protection).' },
        { room: 'Furnace of Pages', title: 'Fire that eats pages', encounter: 'Fire that eats pages', gm: 'Break the brass rings to free the efreet, or fight them all. This fire is the only fire that burns the Keeper\'s card.', treasure: 'One brass ring, once broken, is an Efreeti Bottle.' },
        { room: 'The Sealed Stack', title: 'What sleeps in the Sealed Stack', encounter: 'What sleeps in the Sealed Stack', optional: true, gm: 'A trap for heroes who just got their voices back. Never read the balor\'s card aloud. The invisible Unwritten Bridge leads from here up behind the Keeper.', treasure: 'The pin that holds the shelves down is a Vorpal Sword (pulling it out loosens the balor: DC 20 Strength to do it carefully).' },
        { room: "The Keeper's Sanctum", title: 'The Last Keeper', encounter: 'The Last Keeper', read: 'A book as big as a house turns its own pages, drinking a grey stream of words from everywhere. Above it hangs a small black book in a silver cage. A dead monk lifts a bone finger and writes on the air: QUIET.', gm: 'Three things at once: fight the Keeper, close or open the Great Folio, and sing the five verses of the Litany around the black book. Sing all five and the Word is sealed: Bastian stops, writes THANK YOU, and lets himself go. Kill him without the phylactery and he comes back in days.', treasure: 'The Keeper\'s hoard: a Staff of Power, a Manual of Golems (stone), and 12,000 gp in coins of a hundred lost kingdoms.' },
      ],
      wrapUp: 'The Great Folio bursts open or is gently closed, and every filed voice goes home in a roar of names, songs and bells. Someone must stay to keep the Word: Orisande, Imogen, or a hero who chooses it. The grey door opens one last time and sets the heroes down in the bell tower of Ringmere, where Old Clamour is ringing all by itself.',
    },
  ],
  ending:
    'Good ending: the Litany is sung, the Hollow Word sleeps, every voice comes home, and a new Keeper (Orisande, Imogen or a hero) takes the watch willingly. Ringmere names its next great bell after the heroes and rings it every year on the day it found its voice. Bad ending: if the Keeper wins, or the Hush Clock reaches 6 before the gate opens, the Hush spreads city by city; the heroes keep their own voices only inside the Archive, and must find a way back in before the world forgets how to talk. Next: Rimeshaw owes a favour, Quaile still has a shelf of names, and the Archive holds other dangerous words. One of them has just gone missing.',
};
