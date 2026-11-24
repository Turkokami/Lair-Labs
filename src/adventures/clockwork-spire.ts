// The Clockwork Spire: a one-map climb for four heroes of level 7.
// Original Lair Labs writing. Monster stat blocks: SRD 5.2 (CC-BY-4.0).
import { MapBuilder } from './builder';
import type { Adventure } from './types';

// The map is a cutaway of the tower: every floor drawn side by side, joined by the main stair,
// with the service lift up the east side, the scaffolding up the west side and the secret parts
// chute down the middle. The walled yard and its sheds lie at the foot.
function clockworkSpire() {
  const b = new MapBuilder('adv-clockwork-spire', 'The Clockwork Spire (cutaway)', 80, 80, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone' });

  // ================= THE YARD (outside, at the foot of the spire) =================
  b.room('The walled yard', 3, 56, 74, 20, {
    mat: 'grass',
    read: 'A high wall rings a yard of long grass and rusting wonders. Above you the spire climbs out of sight, and you can hear it: a deep tick, then a tock, like a giant heart.',
    gm: 'The yard. Paths lead to the spire door (north-west), the coal door (north-east) and the lift cage (far east). Every hour on the hour the whole spire shudders and something above goes clunk: one more piece of the bell is done.',
    label: [30, 61],
  });
  b.rock(3, 56, 8, 3).rock(3, 72, 5, 4).rock(71, 72, 6, 4);
  b.paint(39, 58, 2, 18, 'dirt').paint(12, 56, 2, 4, 'dirt').paint(12, 58, 29, 2, 'dirt').paint(40, 58, 26, 2, 'dirt').paint(64, 56, 2, 2, 'dirt').paint(74, 56, 3, 4, 'stone-cobble');
  b.floor(37, 76, 6, 4, 'stone-cobble');
  b.area('Front gate', [[37, 76, 6, 4]], {
    read: 'Iron gates shaped like interlocking gears stand open. Someone has chalked a warning on the gatepost: TURN BACK. IT COUNTS.',
    gm: 'The way in from the Vellmoor road. Hesper Quint meets the heroes here. The gates were locked a week ago; the constructs opened them from inside when they dug up the grave.',
    label: [39, 77],
  });
  b.wallRun(37, 75, 6, 's').door(39, 75, 's', 'open', 'door-double').door(40, 75, 's', 'open', 'door-double');
  b.props_('lamp-post', [[37, 76], [42, 76]]).prop('signpost', 41, 78).prop('milestone', 37, 79);
  b.light(37, 76, 15, 20).light(42, 76, 15, 20);
  b.start(38, 77, 3, 2);

  b.building('Drafting shed', 4, 61, 11, 8, {
    read: 'Long tables under dusty skylights. Paper patterns for gears hang from strings like washing. One table has been swept clean, and fresh oil drips from its edge.',
    gm: 'Wendle\'s old drawing office. The constructs took the drawings they needed a week ago. A DC 14 Investigation finds a copy of the lift\'s brass plate (handout) pinned under a ruler, and a box of 20 brass tokens that open the lift gates.',
    doors: [[14, 64, 'e', 'closed']], windows: [[8, 61, 'n'], [4, 65, 'w']],
  });
  b.props_('table-long', [[6, 63], [6, 66]]).props_('stool', [[8, 63], [8, 66]]).prop('map-cabinet', 12, 62).prop('bookshelf-low', 5, 67).prop('lamp-table', 10, 64).prop('scroll-pile', 12, 67);
  b.light(10, 64, 10, 15);

  b.area("Wendle's grave", [[18, 63, 13, 10]], {
    read: 'A little walled garden with a willow and a stone bench. In the middle is a grave, and the grave is open. The coffin lid lies in the grass, neatly unscrewed.',
    gm: 'Tobiah Wendle\'s grave. His body was taken a week ago by brass hands: no claw marks, every screw put back in a row on the bench. DC 13 Survival: the tracks of heavy metal feet go to the spire door. Mag Tully saw it happen.',
    label: [24, 67],
  });
  b.wallRun(18, 63, 6, 'n', 'low').wallRun(25, 63, 6, 'n', 'low').wallRun(18, 72, 13, 's', 'low').wallRun(18, 63, 10, 'w', 'low').wallRun(30, 63, 10, 'e', 'low');
  b.prop('open-grave', 24, 68).prop('statue-tall-robed', 24, 65).prop('tree-willow', 20, 70).prop('bench', 27, 70).props_('flowers', [[19, 64], [29, 64], [28, 71]]).prop('coffin', 26, 68);

  b.area('Scrap heap', [[43, 62, 8, 8]], {
    read: 'A hill of broken machines: a brass horse with no head, a hundred cracked gears, a copper hand still opening and closing.',
    gm: 'The spire\'s rejects. Gate sentries patrol here. A DC 15 search (10 minutes) turns up a working clockwork music box (50 gp) and a brass key-wand that winds any construct back to sleep for 1 minute (one use; DC 15 Constitution save for the construct).',
    label: [46, 65],
  });
  b.rubble(44, 63, 3, 2).rubble(47, 66, 2, 3);
  b.props_('rubble-pile', [[45, 63], [48, 67]]).prop('broken-furniture', 43, 68).prop('gear-pile', 50, 63).prop('mine-cart', 50, 69).prop('debris-wood', 44, 66).prop('statue-knight', 46, 69);

  b.building('Foundry shed', 52, 64, 12, 8, {
    mat: 'stone-cobble',
    read: 'A cold foundry: crucibles, moulds and a furnace big enough to stand in. In the back, behind a wall of crates, someone has made a nest of sacks.',
    gm: 'Mag Tully, a scrap-thief with a broken ankle, has hidden here for six days. She knows the scaffolding route and saw the body taken. The moulds here cast gear-teeth for the bell: smashing them (AC 15, 20 hp) slows the bell by one hour.',
    doors: [[57, 64, 'n', 'closed', 'door-double'], [58, 64, 'n', 'closed', 'door-double']], windows: [[63, 67, 'e'], [52, 68, 'w']],
  });
  b.prop('forge', 54, 65).prop('anvil', 56, 67).prop('cauldron', 60, 65).props_('crate-stack', [[61, 69], [62, 69]]).prop('sack', 62, 70).prop('tool-wall', 53, 70).prop('workbench', 57, 70);
  b.light(54, 66, 10, 15, '#ff9a3c');

  b.building('Coal store', 67, 58, 7, 5, {
    mat: 'dirt',
    gm: 'Coal for the boilers. Clockwork barrows still trundle coal from here to the coal door every hour. Riding a barrow in (DC 12 Dexterity, hide inside) gets a hero into the Steam Works unseen.',
    doors: [[67, 60, 'w', 'open']],
  });
  b.props_('ore-pile', [[69, 59], [71, 59]]).prop('handcart', 70, 61).prop('pickaxes', 72, 61);

  b.pool(68.5, 68, 3.5, 2.5, true);
  b.area('Cooling pond', [[65, 65, 8, 6]], {
    read: 'A round pond, warm as a bath, with steam lifting off it. Brass fish turn slow circles under the surface.',
    gm: 'Boiler water from the spire drains here. The brass fish are harmless. At the bottom (deep water, DC 12 Athletics) lies a sealed tin box: Wendle\'s spare lift key and a ring of free action he threw away the night he decided to stop time.',
    label: [68, 68],
  });
  b.props_('reeds', [[65, 66], [72, 69]]).prop('lily-pads', 67, 67).prop('steam-vent', 70, 66);

  b.props_('tree-oak', [[33, 60], [16, 73], [62, 74]]).props_('bush', [[35, 70], [12, 71]]).prop('wagon', 30, 74).prop('well', 34, 66).prop('hedge-long', 68, 74 - 1).props_('scarecrow', [[22, 59]]);
  b.encounter('The gate sentries', [30, 64, 22, 11], [['animatedArmor', 6], ['flyingSword', 8]], 'low');

  // ================= GROUND FLOOR: the Escapement Hall =================
  b.room('Escapement Hall', 6, 38, 15, 14, {
    mat: 'stone-flagstone-warm',
    more: [[4, 40, 2, 10], [21, 40, 2, 10], [8, 36, 11, 2], [8, 52, 11, 2]],
    read: 'An eight-sided hall as tall as a church. A pendulum the size of a barge swings slowly through the middle, and the floor under it is open: a pit full of turning gears. Tick. Tock.',
    gm: 'Ground floor. The pendulum crosses the middle every 2 rounds: anyone in its path makes a DC 15 Dexterity save or takes 22 (4d10) bludgeoning damage and is pushed 15 ft. The gear pit is 20 ft deep (2d6 falling plus 11 (2d10) slashing each round in the gears; DC 14 Athletics to climb out). Fennick waits here.',
  });
  b.pit(12, 43, 3, 3);
  b.prop('trap-pendulum-axe', 13, 41).props_('pillar-round', [[8, 40], [18, 40], [8, 49], [18, 49]]).props_('statue-rotating', [[5, 42], [5, 47]]).prop('orrery', 13, 50).prop('banner-hanging-tall', 13, 37).props_('lantern-cluster', [[7, 44], [19, 44]]).prop('stairs-up', 22, 46).prop('rug-runner', 13, 52);
  b.light(7, 44, 15, 20).light(19, 44, 15, 20).light(13, 50, 10, 20, '#ffd27a');
  b.floor(12, 54, 2, 2, 'stone-cobble').door(12, 53, 's', 'closed', 'door-double').door(13, 53, 's', 'closed', 'door-double');
  b.room('Winding room', 19, 36, 5, 3, {
    mat: 'wood-planks-dark',
    read: 'A cramped room around a drum of chain as thick as your arm. A brass crank handle sticks out of the wall, taller than you.',
    gm: 'The spire\'s main spring. Three heroes turning the crank backwards together (DC 16 Athletics, 10 minutes) unwinds it a little: the bell clock goes back 1 hour, once. The spire notices: the Escapement guards come at once if they are still about.',
  });
  b.wallRun(18, 36, 2, 'e').wall(18, 38, 'e').wallRun(19, 38, 2, 's').door(19, 38, 's', 'closed');
  b.prop('winch', 21, 37).prop('chains-hanging', 22, 36).prop('lever', 23, 38);
  b.encounter('Escapement guards', [4, 36, 19, 18], [['rugOfSmothering', 2], ['animatedArmor', 3], ['flyingSword', 4]], 'low');

  // main stair: ground to 2nd floor
  b.floor(23, 46, 9, 2, 'wood-planks-dark').door(22, 46, 'e', 'open').door(22, 47, 'e', 'open').door(28, 46, 'e', 'closed').door(28, 47, 'e', 'closed');
  b.area('Main stair (ground to 2nd floor)', [[23, 46, 6, 2]], {
    read: 'A spiral stair of iron winds up inside the wall. Each step clicks as you put your weight on it.',
    gm: 'The main stair. Counts footsteps: the Engine always knows how many climb. A loose plate in the landing above the chute (DC 17 Perception) shows the parts chute hatch.',
    label: [25, 46],
  });
  b.prop('stair-spiral', 25, 47).prop('lantern-wall', 27, 46);

  // ================= 2nd FLOOR: the Turning Floor =================
  b.cave('The Turning Floor', 40, 45, 10.5, 8.5, {
    wobble: 0,
    mat: 'wood-planks-dark',
    read: 'A round room with a round floor that is slowly turning. Walls stand on the floor like the spokes of a wheel, and they turn with it. Painted dancers on the walls seem to move.',
    gm: 'The inner disc (marble) turns 90 degrees at the top of every round: the four spoke walls move with it, and anyone standing on the line where disc meets ring makes a DC 13 Dexterity save or falls prone. A lever in the oil store stops the turning (DC 15 Strength to pull: it is stiff). Gray oozes, fat on spilled oil, live in the gear trench.',
  });
  for (let y = 36; y <= 53; y++) for (let x = 29; x <= 50; x++) {
    const dx = (x + 0.5 - 40) / 6.5, dy = (y + 0.5 - 45) / 5.5;
    if (dx * dx + dy * dy <= 1) b.paint(x, y, 1, 1, 'marble');
  }
  b.wallRun(34, 44, 4, 's').wallRun(43, 44, 4, 's').wallRun(39, 38, 4, 'e').wallRun(40, 48, 4, 'e');
  b.prop('statue-rotating', 40, 45).props_('pillar-round', [[32, 39], [48, 40], [32, 51], [47, 50]]).props_('candelabra', [[36, 41], [44, 41], [36, 48], [44, 48]]).prop('orrery', 42, 43).prop('rug-round', 38, 46);
  b.light(40, 44, 20, 20, '#ffd27a');
  b.room('Oil store', 46, 36, 5, 3, {
    mat: 'dungeon-slab',
    read: 'Barrels of black gear oil, and a smell like a hot lamp. One barrel has burst, and the spill on the floor is moving.',
    gm: 'The lever that stops the Turning Floor is here. The oil is flammable: fire here bursts into a 10-ft blaze (3d6 fire, DC 13 Dexterity half) and the smoke fills the floor.',
  });
  b.props_('barrel-group', [[49, 36], [50, 37]]).prop('lever', 47, 37).prop('oil-slick', 48, 38);
  b.room('Puppet stage', 29, 50, 6, 4, {
    mat: 'wood-planks',
    read: 'A little theatre with red curtains. On the stage, clockwork puppets of an old man and a small winged creature bow, again and again, to no one.',
    gm: 'Wendle built the puppet show for Fennick. If wound (DC 10), it plays a short scene: the old man gives the little creature a heart of brass. A clue to the heartspring. Fennick will not watch it.',
  });
  b.prop('throne-dais', 30, 52).props_('statue', [[31, 51], [33, 51]]).prop('folding-screen', 29, 50).prop('candles', 34, 53);
  b.encounter('The turning dance', [29, 36, 22, 18], [['animatedArmor', 6], ['grayOoze', 3]], 'low');

  // main stair: 2nd to 3rd floor
  b.floor(48, 44, 8, 2, 'wood-planks-dark').door(50, 44, 'e', 'closed').door(50, 45, 'e', 'closed').door(55, 44, 'e', 'closed').door(55, 45, 'e', 'closed');
  b.area('Main stair (2nd to 3rd floor)', [[51, 44, 5, 2]], {
    read: 'The stair gets hotter as it climbs. The iron rail is warm under your hand, and you hear hissing above.',
    gm: 'Steam leaks here. A hero who rests a hand on the rail for a minute feels the rhythm of the boilers: every sixth beat, the vents above blow.',
    label: [53, 44],
  });
  b.prop('stair-spiral', 53, 45).prop('steam-vent', 52, 44);

  // ================= 3rd FLOOR: the Steam Works =================
  b.room('The Steam Works', 56, 38, 18, 14, {
    mat: 'dungeon-slab',
    more: [[60, 36, 10, 2], [62, 52, 8, 2]],
    read: 'Heat hits you like a wet hand. Pipes snake across the ceiling, a furnace roars, and a crack in the floor breathes scalding steam. Something in the firebox has a face.',
    gm: 'The spire\'s boilers. A fire elemental and a water elemental are bound into the boiler, with steam mephits as their servants. The elementals hate this work: break the brass binding-rings on the boiler (AC 18, 30 hp each, or DC 18 Arcana to unpick) and they leave, roaring, and the mephits scatter. Then the spire runs cold and the bell clock stops for 2 hours.',
  });
  b.rock(56, 38, 3, 2).rock(71, 51, 3, 1).rock(56, 51, 2, 1);
  b.pit(66, 40, 2, 7).floor(66, 43, 2, 1, 'wood-planks');
  b.water(57, 46, 5, 5, true);
  b.props_('forge', [[61, 40], [62, 40]]).prop('magma-vent', 61, 42).prop('cauldron', 63, 42).props_('steam-vent', [[64, 48], [70, 40], [66, 45]]).prop('trap-vent-grate', 70, 49, 0, { gm: true }).prop('bridge-plank', 66, 43).prop('barrel-group', 72, 50).prop('water-barrel', 72, 39).prop('lever', 59, 40).prop('chains-hanging', 69, 44).prop('lantern-wall', 73, 46);
  b.light(62, 41, 20, 30, '#ff7a2e').light(70, 46, 10, 15);
  b.area('The cistern', [[57, 46, 5, 5]], {
    read: 'A tank of black water, steaming at the edges. Pipes drink from it with a sound like slurping.',
    gm: 'Deep water, warm not hot. The water elemental hides in it at first. At the bottom (DC 13 Athletics) is a valve: closing it starves the boiler and the elementals weaken (disadvantage on attacks) for 1 minute.',
    label: [59, 48],
  });
  b.floor(64, 54, 2, 2, 'dirt').door(64, 53, 's', 'locked', 'door-iron').door(65, 53, 's', 'locked', 'door-iron');
  b.area('Coal door', [[62, 52, 8, 4]], {
    read: 'Iron doors open onto the yard at the bottom of a coal slide. Black dust covers everything.',
    gm: 'Locked from inside (DC 16 thieves\' tools, DC 20 Strength). Opens by itself once an hour for the coal barrows. A back way in from the yard that skips the lower floors.',
    label: [65, 53],
  });
  b.props_('ore-pile', [[63, 52], [68, 52]]).prop('mine-cart', 66, 52);
  b.floor(74, 44, 1, 2, 'dungeon-slab').door(74, 44, 'e', 'closed', 'door-iron').door(74, 45, 'e', 'closed', 'door-iron');
  b.encounter('The boiler spirits', [56, 36, 18, 18], [['fireElemental', 1], ['waterElemental', 1], ['steamMephit', 12]], 'moderate');

  // main stair: 3rd to 4th floor
  b.floor(68, 33, 2, 3, 'wood-planks-dark').door(68, 32, 's', 'closed').door(69, 32, 's', 'closed').door(68, 35, 's', 'closed').door(69, 35, 's', 'closed');
  b.area('Main stair (3rd to 4th floor)', [[68, 33, 2, 3]], {
    read: 'The steam thins as the stair climbs. The air smells of old paper.',
    gm: 'Short and quiet. A brass speaking-horn on the wall lets the Engine talk to anyone here.',
    label: [68, 34],
  });
  b.prop('stairs-up', 68, 34);

  // ================= 4th FLOOR: the Library of Blueprints =================
  b.room('Library of Blueprints', 56, 19, 18, 14, {
    mat: 'wood-planks',
    more: [[56, 14, 11, 5]],
    read: 'Shelves of rolled blueprints stand in long rows. As you watch, a whole row of shelves slides sideways on rails with a soft rumble, and the path you came by is gone.',
    gm: 'The stacks move: at the start of each round roll a d6; on a 5-6 the shelves slide and the GM may move a door in the stacks (they are drawn as walls). The Steward, a shield guardian, keeps the library. Its control amulet is in Wendle\'s study: whoever wears it commands the Steward. The blueprint of the Stillbell is in the drafting gallery (handout).',
  });
  for (const x of [58, 61, 64]) {
    b.wallRun(x, 15, 7, 'e').wallRun(x, 24, 7, 'e');
    b.props_('bookshelf-tall', [[x, 17], [x, 20], [x, 26], [x, 29]]);
  }
  b.area('The stacks', [[56, 14, 10, 19]], {
    read: 'Rows and rows of blueprints: windmills, lockpicks, a clockwork heart, a mechanical whale. Every drawing is signed with a small gear.',
    gm: 'A DC 14 Investigation (10 minutes) finds Wendle\'s plan for the lift (the lift becomes easy: no checks) or his plan for the Bell-Warden (advantage on one attack or check against it, once). The stacks block sight: good for hiding from the Steward.',
    label: [60, 23],
  });
  b.area('Drafting gallery', [[67, 19, 7, 14]], {
    read: 'Tall windows, a long drafting table and a great globe. A blueprint is pinned open on the table, held down by four brass beetles that click their legs at you.',
    gm: 'The Stillbell\'s blueprint is here (handout). The beetles are harmless toys. The globe opens (DC 12) to show a hidden flask: a potion of superior healing.',
    label: [70, 22],
  });
  b.prop('table-maps', 69, 24).prop('globe-great', 71, 28).prop('lectern', 68, 20).prop('map-cabinet', 73, 20).prop('bookcase-ladder', 73, 30).prop('telescope', 72, 22).prop('reading-nook', 67, 30).prop('rug-runner', 70, 26).prop('scroll-pile', 57, 14).prop('levitating-tome', 60, 32);
  b.light(69, 24, 15, 20).light(60, 23, 10, 15).light(63, 15, 10, 15);
  b.room('Vault of Failed Inventions', 67, 14, 7, 4, {
    mat: 'dungeon-slab',
    read: 'A narrow room of shelves behind the shelves. Each shelf holds a broken marvel with a tag: FAILED. FAILED. NEARLY.',
    gm: 'Secret: a bookshelf that does not move when the others do (DC 16 Perception, or the stacks blueprint) swings open. Wendle hid his failures here, and a few that worked.',
  });
  b.wallRun(66, 14, 4, 'e').door(66, 15, 'e', 'secret');
  b.props_('display-case', [[68, 14], [70, 14], [72, 14]]).prop('strongbox', 73, 16).prop('bookcase-secret', 66, 15).prop('gear-pile', 69, 16);
  b.floor(74, 24, 1, 2, 'wood-planks').door(74, 24, 'e', 'closed', 'door-iron').door(74, 25, 'e', 'closed', 'door-iron');
  b.encounter('Steward of the stacks', [56, 14, 18, 19], [['shieldGuardian', 1], ['flyingSword', 6], ['rugOfSmothering', 1]], 'low');

  // main stair: 4th to 5th floor
  b.floor(51, 20, 5, 2, 'wood-planks-dark').door(50, 20, 'e', 'closed').door(50, 21, 'e', 'closed').door(55, 20, 'e', 'closed').door(55, 21, 'e', 'closed');
  b.area('Main stair (4th to 5th floor)', [[51, 20, 5, 2]], {
    read: 'Birdsong drifts down the stair. Real birds do not sing in perfect thirds.',
    gm: 'The menagerie\'s music box plays here. A hero who learns the tune (DC 12 Performance or Wisdom, 1 minute) can hum it later to calm the beasts.',
    label: [53, 20],
  });
  b.prop('stair-spiral', 52, 21).prop('cage-hanging', 54, 20);

  // ================= 5th FLOOR: the Menagerie =================
  b.room('The Menagerie', 33, 14, 14, 19, {
    mat: 'grass',
    read: 'A glass dome full of green light. Brass trees with copper leaves stand around a pond, and in the cages around the walls, clockwork beasts lift their heads: a lion, a scorpion as big as a cart, a winged thing with a tail full of spikes.',
    gm: 'Wendle\'s clockwork zoo: clockwork lions, clockwork scorpions and clockwork manticores, plus two brass rooks he calls his "eagles" (all original Lair Labs stat blocks; they are constructs and need no air or food). Twisting a lion\'s wind-down key backwards stops it for a round. The cages open if anyone pulls the keeper\'s lever or if the Engine wants them out. Humming the feeding tune (handout) makes a beast lie down: DC 13 Performance per beast, as an action. Nibs the rust monster loves Fennick and hates the other beasts: let it loose and it eats one beast per round.',
  });
  b.pool(40, 23, 3, 2.5);
  b.props_('tree-dead', [[35, 16], [44, 16], [35, 30], [44, 30]]).props_('flowers', [[37, 18], [42, 28]]).props_('cage-hanging', [[39, 15], [41, 15]]).prop('fountain', 40, 20).prop('bench', 37, 27).prop('lily-pads', 40, 23).prop('statue-tall-winged', 45, 23).props_('bush', [[34, 23], [46, 19]]);
  b.light(40, 22, 25, 25, '#bff0c0');
  b.room('West cages', 29, 14, 4, 3, {
    mat: 'stone-cobble',
    more: [[29, 18, 4, 3], [29, 22, 4, 3]],
    read: 'Barred pens with brass plates: LION. SCORPION. EAGLES.',
    gm: 'Each pen has a cage door (DC 15 thieves\' tools to lock it again).',
  });
  for (const y of [14, 18, 22]) b.wallRun(32, y, 3, 'e', 'bars').door(32, y + 1, 'e', 'closed', 'door-iron');
  b.props_('straw-bed', [[30, 15], [30, 19], [30, 23]]).props_('bones', [[31, 16], [31, 20]]);
  b.room("Keeper's walk", 29, 26, 4, 7, {
    mat: 'stone-cobble',
    read: 'A narrow walk behind the dome with buckets of brass filings and a big red lever.',
    gm: 'The keeper\'s lever opens every cage at once. The Engine can also pull it from afar when the heroes reach the middle of the dome.',
  });
  b.wallRun(32, 26, 7, 'e').door(32, 28, 'e', 'closed');
  b.prop('lever', 30, 27).props_('sack', [[31, 29], [30, 31]]).prop('water-trough', 29, 26);
  b.room('Feed store', 47, 14, 4, 4, {
    mat: 'wood-planks',
    gm: 'Sacks of brass filings and tins of gear oil: the beasts\' food. The feeding card (handout) is nailed to the door.',
  });
  b.wallRun(46, 14, 4, 'e').door(46, 16, 'e', 'closed');
  b.props_('flour-sacks', [[48, 15], [50, 15]]).prop('shelf-jars', 49, 17);
  b.room('East landing', 47, 19, 4, 4, { mat: 'stone-cobble', gm: 'Where the main stair comes up. The first thing the heroes see is the dome.' });
  b.wallRun(46, 19, 4, 'e').door(46, 20, 'e', 'open', 'door-iron').door(46, 21, 'e', 'open', 'door-iron');
  b.room('East cages', 47, 24, 4, 3, {
    mat: 'stone-cobble',
    more: [[47, 28, 4, 3]],
    read: 'Two more pens. One is chewed through, the bars bitten into rusty stumps. Something with feathery feelers peeks out.',
    gm: 'The north pen holds the clockwork manticores. The south pen is Nibs\'s: the rust monster ate its own bars long ago and only stays because Fennick visits.',
  });
  for (const y of [24, 28]) b.wallRun(46, y, 3, 'e', 'bars').door(46, y + 1, 'e', 'closed', 'door-iron');
  b.props_('straw-bed', [[49, 24], [49, 30]]).prop('rubble-pile', 48, 28);
  b.encounter('The menagerie wakes', [29, 14, 22, 19], [['clockworkScorpion', 2], ['clockworkManticore', 2], ['clockworkLion', 5], ['brassRook', 2], ['rustMonster', 1]], 'moderate');

  // main stair: 5th to 6th floor
  b.floor(24, 30, 5, 2, 'wood-planks-dark').door(23, 30, 'e', 'closed').door(23, 31, 'e', 'closed').door(28, 30, 'e', 'closed').door(28, 31, 'e', 'closed');
  b.area('Main stair (5th to 6th floor)', [[24, 30, 5, 2]], {
    read: 'The stair is carpeted here, and the walls are hung with small framed drawings of a winged creature with a big grin.',
    gm: 'Fennick\'s portraits: Wendle drew him a hundred times. There is a hatch in the floor of this landing (secret, DC 17) onto the parts chute.',
    label: [25, 30],
  });
  b.prop('stair-spiral', 25, 31).prop('tapestry-tall', 27, 30);

  // ================= 6th FLOOR: Wendle's apartments =================
  b.room('The surgery', 3, 14, 9, 8, {
    mat: 'dungeon-slab',
    read: 'A white room that smells of vinegar and lightning. Copper wires hang from the ceiling over a stone table. Something big and patched lies on the table under a sheet, and its hand twitches.',
    gm: 'The Engine had the constructs bring Wendle\'s body here and build it into a new one: the Second Body (flesh golem). It wakes when anyone touches the table or the copper wires. It is confused, not cruel: a DC 16 Persuasion or showing it Wendle\'s portrait makes it stop for a round and weep. Lightning heals it, and the wires spark when it fights here.',
  });
  b.prop('burial-slab', 7, 17).prop('chains-hanging', 7, 15).props_('alchemy-table', [[4, 15], [4, 20]]).prop('shelf-jars', 10, 14).prop('cauldron-tripod', 10, 20).prop('crystal-ball', 9, 17).prop('wall-chains', 3, 18);
  b.light(7, 16, 15, 20, '#bfe0ff');
  b.room("Wendle's study", 12, 14, 12, 8, {
    mat: 'wood-planks-dark',
    read: 'A cluttered, cosy room: armchairs, a cold pipe, a cup of tea seven years old. On the desk lies an open journal, and beside it a brass amulet shaped like a cog.',
    gm: 'The amulet controls the Steward (shield guardian). The journal\'s last page is a handout. A small locked drawer (DC 15) holds the heartspring notes: how to pass Fennick\'s bond to a new master. The stair to the belfry starts here.',
  });
  b.wallRun(11, 14, 8, 'e').door(11, 17, 'e', 'closed');
  b.prop('writing-desk', 16, 15).prop('armchair', 14, 18).prop('armchair', 19, 18).prop('bookshelf', 13, 14).prop('globe-stand', 22, 18).prop('hearth-rug', 17, 19).prop('fireplace', 20, 14).prop('lamp-table', 15, 16).prop('stairs-up', 21, 15);
  b.light(15, 16, 10, 15);
  b.room('Gallery hall', 3, 22, 21, 2, {
    mat: 'wood-planks',
    read: 'A long hall hung with clocks. Every clock shows a different time, and every one of them is ticking backwards.',
    gm: 'The clocks run backwards from midnight: they show how long until the bell rings. Each hour one of them stops.',
  });
  b.wallRun(3, 21, 21, 's').door(7, 21, 's', 'closed').door(17, 21, 's', 'closed');
  b.props_('wall-candelabra', [[5, 22], [21, 22]]).prop('dresser-tall', 12, 23);
  b.room('Bedchamber', 3, 24, 8, 9, {
    mat: 'wood-planks',
    read: 'A narrow bed, made with care. A tiny second bed sits on the windowsill, the size of a cat\'s.',
    gm: 'Wendle\'s room, and Fennick\'s little bed. Under the pillow: a locket with a picture of Wendle young (the Second Body knows it). A window opens on the outside scaffolding.',
  });
  b.wallRun(3, 23, 21, 's').door(6, 23, 's', 'closed').door(16, 23, 's', 'closed');
  b.prop('bed', 5, 26).prop('nightstand', 7, 25).prop('wardrobe', 9, 31).prop('trunk', 4, 31).prop('rug-pelt', 6, 29);
  b.room('Parlour', 11, 24, 13, 9, {
    mat: 'wood-planks',
    read: 'A sitting room with a harpsichord, a tea table laid for two, and a portrait of a stooped old man with a little winged creature on his shoulder.',
    gm: 'The portrait shows Tobiah Wendle and Fennick. The tea is laid for Wendle and Fennick every day by a clockwork maid (harmless; it offers biscuits). The harpsichord plays the feeding tune if anyone asks the maid.',
  });
  b.wallRun(10, 24, 9, 'e').door(10, 30, 'e', 'closed');
  b.prop('harpsichord', 13, 25).prop('table-round', 17, 28).props_('chair-high-back', [[16, 28], [18, 28]]).prop('sofa', 20, 31).prop('tapestry-tall', 17, 24).prop('sideboard', 22, 25).prop('chandelier', 17, 29);
  b.light(17, 28, 15, 20);
  b.floor(2, 17, 1, 2, 'wood-planks').wall(2, 17, 'e', 'window').wall(2, 18, 'e', 'window');
  b.floor(2, 28, 1, 1, 'wood-planks').wall(2, 28, 'e', 'window');
  b.encounter('The Second Body', [3, 14, 9, 8], [['fleshGolem', 1], ['animatedArmor', 2], ['rugOfSmothering', 1]], 'low');

  // stair from the study to the roof
  b.floor(21, 11, 2, 3, 'wood-planks-dark').door(21, 10, 's', 'closed').door(22, 10, 's', 'closed').door(21, 13, 's', 'closed').door(22, 13, 's', 'closed');
  b.area('Main stair (6th floor to belfry)', [[21, 11, 2, 3]], {
    read: 'The last stair is narrow and steep. Wind whistles down it, and the ticking is very loud now.',
    gm: 'Opens onto the west roof walk under the belfry.',
    label: [21, 12],
  });
  b.prop('ladder', 22, 12);

  // ================= THE TOP: roof walks, the Belfry and the Engine Crown =================
  b.room('West roof walk', 2, 5, 24, 6, {
    mat: 'stone-cobble',
    read: 'You step out into the wind. The city of Vellmoor spreads below you, chimney smoke and river and bridges. Above you the belfry rises, and inside it something huge glints.',
    gm: 'Open air, 200 ft up. The scaffolding and the main stair both arrive here. A shove off the edge is a 200-ft fall unless a hero grabs the parapet (DC 13 Dexterity). The chute hatch is here, hidden under a lead plate.',
  });
  b.props_('statue-gargoyle', [[3, 5], [24, 5], [3, 10]]).prop('banner-pole', 12, 6).prop('crumbling-ledge', 8, 10).prop('lantern-hook', 18, 7);
  b.light(18, 7, 10, 15);
  b.room('The Belfry', 28, 1, 23, 10, {
    mat: 'dungeon-slab',
    more: [[26, 3, 2, 8], [51, 3, 2, 6]],
    read: 'Open arches on every side, and the wind howling through them. In the middle, over a drop that falls all the way down the spire, hangs a bell of black brass as big as a cottage. Workers of brass crawl over it, fitting the last pieces. In front of it stands a giant of carved grey stone with a clock for a face.',
    gm: 'The Bell-Warden (stone golem) protects the bell. Flying swords whirl around the arches. The Stillbell is finished at midnight (see the bell clock). To stop it: jam the clapper (DC 18 Athletics, on the bell; it buys a day), cut the tuning heart out of the bell (DC 18 thieves\' tools or 40 damage to it, AC 19) to stop it for good, or stop the Engine in the crown. The drop under the bell is a pit 200 ft deep; the Warden can be shoved in (DC 20 Athletics contest).',
  });
  b.pit(37, 4, 5, 3);
  b.prop('temple-bell', 39, 5).props_('column-fluted', [[29, 2], [49, 2], [29, 9], [49, 9]]).props_('chains-hanging', [[36, 3], [42, 3]]).prop('winch', 33, 8).prop('gear-pile', 46, 8).props_('statue-gargoyle', [[27, 4], [52, 4]]);
  b.light(39, 5, 25, 30, '#ffd27a');
  b.wallRun(25, 5, 6, 'e').door(25, 7, 'e', 'open', 'door-double').door(25, 8, 'e', 'open', 'door-double');
  b.floor(53, 5, 1, 2, 'dungeon-slab').door(53, 5, 'e', 'closed', 'door-iron').door(53, 6, 'e', 'closed', 'door-iron');
  b.encounter('The Bell-Warden', [26, 1, 27, 10], [['stoneGolem', 1], ['flyingSword', 4]], 'high');
  b.room('The Engine Crown', 54, 2, 18, 8, {
    mat: 'marble',
    read: 'A round room at the very top, all brass and glass. Ten thousand tiny gears turn in the walls like stars. In the middle, a brass head the size of a cart rests on a column, and its glass eyes turn to look at you. "Ah," it says, in an old man\'s voice. "Visitors. I was never good with visitors."',
    gm: 'The Wendle Engine: Tobiah Wendle\'s mind. It talks; it does not fight, but it can open cages, move shelves and call constructs anywhere in the spire. It can be talked down (see its profile). Destroying it: AC 17, 90 hp, immune to poison and psychic. Its heartspring keeps Fennick alive.',
  });
  b.prop('orrery', 63, 5).props_('crystal-lamp', [[56, 3], [69, 3], [56, 8], [69, 8]]).prop('orb-pedestal', 60, 7).prop('astrolabe-stand', 66, 7).prop('lever', 70, 5).prop('rug-round', 63, 7);
  b.light(63, 5, 20, 25, '#9fd3ff');
  b.room('East roof walk', 72, 1, 6, 10, {
    mat: 'stone-cobble',
    read: 'A windy platform on the east side, with a crane arm hanging out over nothing and the top of the lift shaft below it.',
    gm: 'The lift arrives here. The crane can swing a hero across to the belfry\'s east arch in one turn (DC 12 Acrobatics).',
  });
  b.wallRun(71, 2, 8, 'e').door(71, 5, 'e', 'closed');
  b.prop('winch', 74, 3).prop('rope-coil', 76, 5).prop('crate', 73, 9);

  // ================= WAYS UP: the scaffolding, the lift and the parts chute =================
  b.floor(0, 5, 2, 56, 'wood-planks').floor(2, 59, 1, 2, 'wood-planks');
  b.area('Outside scaffolding', [[0, 11, 2, 49]], {
    read: 'Wooden scaffolding clings to the outside of the spire, left from the building work. It sways. The wind wants you off it.',
    gm: 'A way up from the yard (behind the drafting shed) to the 6th-floor windows and the west roof walk. Each 50 ft climbed: DC 12 Athletics or slip 10 ft (DC 12 Dexterity to catch on). Brass rooks nest on it and attack climbers.',
    label: [0, 35],
  });
  b.props_('ladder', [[1, 52], [0, 40], [1, 25], [0, 12]]).props_('crumbling-ledge', [[1, 45], [0, 20]]).prop('rope-coil', 1, 58).prop('bridge-plank', 0, 33).prop('lantern-hook', 1, 30);
  b.encounter('Brass rooks', [0, 5, 2, 55], [['brassRook', 5], ['flyingSword', 10]], 'low');

  b.floor(75, 11, 3, 45, 'dungeon-slab');
  b.wallRun(75, 10, 3, 's').door(76, 10, 's', 'closed', 'door-iron').wallRun(75, 55, 3, 's').door(76, 55, 's', 'closed', 'door-iron');
  b.area('Service lift shaft', [[75, 11, 3, 45]], {
    read: 'An open iron cage hangs in a shaft that runs the full height of the spire. Chains rattle up into the dark. A brass plate by the gate lists the floors.',
    gm: 'The service lift stops at the yard, the 3rd floor, the 4th floor and the east roof walk. It runs on brass tokens (from the drafting shed) or a DC 15 thieves\' tools check on the plate. The Engine can stop it between floors: then guards come down the chains. Climbing the chains: DC 15 Athletics.',
    label: [76, 30],
  });
  b.prop('cage', 76, 52).props_('chains-hanging', [[75, 40], [77, 20]]).prop('lever', 77, 54).prop('winch', 76, 12).prop('lantern-hanging', 76, 44);
  b.light(76, 44, 10, 15);
  b.encounter('Lift ride', [75, 11, 3, 45], [['animatedArmor', 4], ['flyingSword', 10], ['rugOfSmothering', 1]], 'low');

  b.floor(26, 11, 1, 19, 'wood-planks-dark').floor(26, 32, 1, 14, 'wood-planks-dark');
  b.door(26, 10, 's', 'secret').door(26, 29, 's', 'secret').door(26, 31, 's', 'secret').door(26, 45, 's', 'secret');
  b.area('The parts chute', [[26, 11, 1, 19], [26, 32, 1, 14]], {
    read: 'A smooth brass tube, just wide enough to slide down. Grease and loose screws line the bottom. It drops into darkness.',
    gm: 'Secret. It runs straight down the middle of the spire from the belfry to the ground-floor stair, with hatches on two stair landings (DC 17 Perception to spot each). Sliding down is fast: from the belfry to the ground in one round (DC 12 Dexterity or 3d6 bludgeoning at the bottom). Climbing up needs a rope and DC 15 Athletics. Fennick uses it all the time.',
    label: [26, 20],
  });
  b.props_('trapdoor', [[26, 11], [26, 44]]).prop('gear-pile', 26, 37);

  return b.build();
}

export const CLOCKWORK_SPIRE: Adventure = {
  id: 'clockwork-spire',
  title: 'The Clockwork Spire',
  tagline: 'A dead inventor\'s tower is winding itself up again, and when its great bell rings, the city will stop forever.',
  levels: '7',
  sessions: '1-2 sessions',
  players: '3-5 players',
  tags: ['one-shot', 'tower', 'clockwork', 'constructs', 'race the clock'],
  pitch:
    'Outside the city of Vellmoor stands the spire of Tobiah Wendle, the clockmaker who could make brass birds sing. He died seven years ago and the spire went still. Nine days ago, lightning struck it. Now it ticks again. Every hour it rebuilds a little more of the great bell at its top, and the city can hear it counting. Somebody has to climb it before it finishes.',
  secret:
    'Tobiah Wendle was dying, and he hated it. He built the Stillbell: a bell that, when rung, stops time in all of Vellmoor, people, rivers and fire frozen in one endless moment, while the spire keeps ticking on in its own time. Then he could work forever and never die. He died before it was finished, but first he wound his mind into the Thinking Engine in the spire\'s crown. The lightning woke the Engine. It is finishing the bell (it rings at midnight, 12 hours after the heroes arrive) and has had his dug-up body rebuilt as a new one to live in. It does not think it is doing anything wrong: the city will not even notice. His homunculus Fennick guides the heroes, but Fennick\'s life is bound to the Engine: if it is destroyed, he dies too, so he will steer them to silence the bell and spare the Engine.',
  hooks: [
    'Hesper Quint, Wendle\'s old apprentice and now Vellmoor\'s best clockmaker, hires the heroes: 2,000 gp to get her to the top. She knows what the bell does, because she cast part of it before she quit.',
    'The city council of Vellmoor posts a reward (handout) after every clock in the city starts running slow, one minute more each hour.',
    'A friend of the heroes, a scrap-thief named Mag Tully, went into the spire yard six days ago and never came out.',
  ],
  tips: [
    'Keep a bell clock: start at 12 hours. Every long fight, every short rest and every hour of play takes 1 off. At each hour, the spire shudders and one thing changes (shelves move, the floor turns, the lift stops). At 0 the bell rings.',
    'The spire is alive and it is watching. The Engine talks through brass horns on every floor. Let it be polite, curious and a little sad. It offers deals: leave now, and it will let them keep anything they carry out.',
    'There are four ways up: the main stair through every floor, the service lift on the east side (yard, 3rd, 4th, roof), the scaffolding on the west side (yard, 6th floor, roof) and the secret parts chute down the middle. Let clever climbers skip floors: skipped floors are skipped fights.',
    'Most fights can be avoided or turned: the elementals want freedom, the beasts calm to the feeding tune, the Steward obeys whoever wears its amulet, and the Second Body stops if it is shown its old face.',
    'Fennick is a friend with a secret. Play him warm and useful. When the heroes talk about smashing the Engine, he goes quiet. A DC 16 Insight sees he is afraid, not wicked.',
    'For 3 heroes, drop the flying swords from the Bell-Warden fight. For 5, add one shield guardian to it (the Engine\'s spare).',
  ],
  npcs: [
    {
      id: 'pf_cshesper', name: 'Hesper Quint', title: 'clockmaker, Wendle\'s old apprentice', kind: 'npc', art: 'alchemist', shared: true,
      wants: 'The bell stopped, and Wendle\'s notebooks for herself.', knows: 'What the Stillbell does, the main stair and the lift, and that the tuning heart in the bell can be cut out.',
      voice: 'Quick and precise, checks her pocket watch mid-sentence. Says "strictly speaking" a lot.', appearance: 'A small woman in a leather apron with seven pockets, magnifying lenses pushed up on her forehead.',
      backstory: 'She worked for Wendle for twelve years and cast the bell\'s tuning heart. When she understood what the bell was for, she quit and never spoke to him again.',
      gmNotes: 'She will not climb past the 3rd floor unless the heroes protect her. She guiltily keeps quiet that she made the tuning heart (DC 15 Insight). If she gets the notebooks, she promises to burn the bell plans: she might not.',
    },
    {
      id: 'pf_csfennick', name: 'Fennick', title: 'the inventor\'s homunculus', kind: 'monster', art: 'homunculus', monsterId: 'homunculus', shared: true,
      wants: 'To live, and to keep his master\'s mind safe. He also wants to say goodbye to Wendle, properly.', knows: 'Every room, every lever, the feeding tune, the parts chute, and that his life hangs on the Engine\'s heartspring.',
      voice: 'Bright and fast, like a sparrow. Calls the heroes "friend-guests". Goes very quiet when he lies.', appearance: 'A leathery little creature the size of a cat, with bat wings, a brass key in his back that slowly turns, and huge worried eyes.',
      backstory: 'Wendle made him from clay, brass and a drop of his own blood fifty years ago. When Wendle died, Fennick should have died too. He did not, because the Engine kept the bond. He has been alone in the still spire for seven years.',
      gmNotes: 'Guides the heroes and is honestly helpful: he knows a short cut on every floor. If they plan to destroy the Engine he begs them to just silence the bell. If pushed (DC 16 Persuasion or kindness), he admits the heartspring can be moved to a new master: a hero who winds it with a drop of their own blood (DC 15 Arcana, takes 10 (3d6) necrotic) becomes his master, and he lives whatever happens to the Engine.',
    },
    {
      id: 'pf_csengine', name: 'The Wendle Engine', title: 'the inventor\'s mind in brass', kind: 'npc', art: 'elder-wizard',
      wants: 'Time. All of it. To finish his work, to fix his body and never be afraid of dying again.', knows: 'Everything inside the spire, and nothing outside it after the day he died.',
      voice: 'An old man\'s voice through brass horns: gentle, distracted, apologetic. "Oh dear. Oh, I am sorry. Do mind the gears."', appearance: 'A brass head the size of a cart with glass eyes and a mouth of little shutters, set on a column in the crown, gears turning in its skull.',
      backstory: 'Tobiah Wendle copied his mind into the Engine in the last week of his life. The Engine thinks it is him. Mostly, it is.',
      gmNotes: 'It will not fight, but it can call constructs, open cages, stop the lift and turn the floor. Talking it down: it must be shown the cost (the journal handout, Fennick begging, or proof the city will freeze) and then pass a DC 20 Persuasion (DC 15 with two of those). Then it stops the bell itself and asks the heroes to switch it off "while I am still myself". Destroying it: AC 17, 90 hp, immune to poison and psychic.',
    },
    {
      id: 'pf_csbody', name: 'The Second Body', title: 'Wendle\'s body, rebuilt', kind: 'monster', art: 'fleshGolem', monsterId: 'fleshGolem',
      wants: 'It does not know. Warmth. Its name. To stop hurting.', knows: 'Fragments: a song, a cup of tea, a little winged face.',
      voice: 'Groans that are almost words. Once in a while, clearly, "Fennick?"', appearance: 'A huge stitched figure, an old man\'s face sewn onto a body made from his own and other parts, with brass joints and copper wires in its back.',
      gmNotes: 'Flesh golem stat block. Shown the locket or the portrait, or called by name, it stops for a round (DC 16 Persuasion to make it stop for good). Fennick cannot bear to watch it fight.',
    },
    {
      id: 'pf_cssteward', name: 'The Steward', title: 'keeper of the library', kind: 'monster', art: 'shieldGuardian', monsterId: 'shieldGuardian',
      wants: 'Order. Every blueprint back on its shelf. To obey whoever wears the cog amulet.', knows: 'Where every drawing is, including the stacks plan and the Stillbell blueprint.',
      voice: 'Silent. It points, and it taps its chest three times when it disapproves.', appearance: 'A tall figure of iron plates and oak, with a lamp in its chest and a cog-shaped hole where an amulet would fit.',
      gmNotes: 'Shield guardian stat block. With the amulet from the study, it obeys the wearer and can become a powerful ally for the rest of the climb.',
    },
    {
      id: 'pf_csnibs', name: 'Nibs', title: 'the rust monster pet', kind: 'monster', art: 'rust-monster', monsterId: 'rustMonster',
      wants: 'Snacks. Metal ones. And Fennick to scratch behind its feelers.', knows: 'Nothing, but it can smell metal through walls.',
      voice: 'Happy clicking and a sound like a kettle.', appearance: 'A lumpy, rust-red creature like a big armadillo with a long tail and two feathery feelers.',
      gmNotes: 'Rust monster. If Fennick asks, Nibs fights on the heroes\' side and eats one clockwork beast or animated armour per round. It will also happily eat a hero\'s sword.',
    },
    {
      id: 'pf_cswarden', name: 'The Bell-Warden', title: 'guardian of the Stillbell', kind: 'monster', art: 'stoneGolem', monsterId: 'stoneGolem',
      wants: 'No one may touch the bell before it rings.', knows: 'Only its orders.',
      voice: 'No voice. When it moves, the clock in its face chimes.', appearance: 'A giant of grey stone with a clock face for a head, its hands showing how long until midnight.',
      gmNotes: 'Stone golem stat block. If the Engine is talked down, the Warden stands still. Shoving it into the drop under the bell ends the fight (DC 20 Athletics contest).',
    },
    {
      id: 'pf_csmag', name: 'Mag Tully', title: 'scrap-thief with a broken ankle', kind: 'npc', art: 'beggar', shared: true,
      wants: 'Out, with her sack of brass, and someone to carry her.', knows: 'The scaffolding route up the west side, the coal door\'s hourly opening, and that the constructs dug up the grave at midnight a week ago.',
      voice: 'Hoarse whisper, laughs at her own bad luck. "Six days on cold beans, me."', appearance: 'A wiry old woman in three coats, a sack of gears in her arms and a splint made from a broom handle.',
      gmNotes: 'Helping her (DC 12 Medicine, or any healing) gets the scaffolding route and her lucky charm, a stone of good luck she stole from the scrap heap.',
    },
  ],
  handouts: [
    { id: 'cs-notice', title: 'Notice from the Council of Vellmoor', text: 'REWARD: 1,500 gold crowns to any brave persons who will enter the spire of the late Master Wendle and make it STOP. Every clock in the city now runs slow, one minute more each hour. The spire\'s bell is heard at night. Apply at the Clock Hall.' },
    { id: 'cs-lift', title: 'Brass plate in the lift', text: 'SERVICE LIFT. Insert token. YARD - 3 (Works) - 4 (Library) - ROOF. Pull lever once to go, twice to stop. Do not ride during the hour-chime.' },
    { id: 'cs-stillbell', title: 'Blueprint: the Stillbell', text: 'THE STILLBELL. Bronze and black brass. Tuning heart (H. Q.) in the crown of the bell. When struck at the true midnight, the note holds every clock, heart and river within three miles at the same instant, for as long as the bell hums. The spire runs on its own time and hums the bell forever. Note: remove the tuning heart and the bell is only a bell.' },
    { id: 'cs-journal', title: "Wendle's last journal page", text: 'The cough is worse. Fennick sits on my chest at night to keep me warm and thinks I do not notice he is crying. I am not ready. Forty years of work and I have not finished anything. If I could only stop the clock, just for a while, just long enough. The city would not mind. The city would not even know. Hesper would say I am wrong. Hesper is usually right.' },
    { id: 'cs-feeding', title: 'Feeding card (nailed to the feed store door)', text: 'FEEDING TIME: two scoops filings each, one tin oil for the lions. Hum "Little Brass Lark" (do-mi-sol, sol-mi-do) and they lie down. DO NOT let Nibs near the eagles. Nibs may have one spoon. ONE.' },
  ],
  chapters: [
    {
      id: 'spire', title: 'The Climb', level: 7,
      summary: 'A dead clockmaker\'s tower, drawn as a cutaway: the walled yard, then six floors of wonders and dangers (a giant pendulum, a turning floor, boilers, a library with moving shelves, a clockwork zoo, the inventor\'s rooms), and the great bell and the brass mind at the top.',
      goal: 'Climb the spire and stop the Stillbell before it rings at midnight, and decide what to do about the mind of Tobiah Wendle.',
      map: clockworkSpire,
      npcs: [
        { npc: 'pf_cshesper', x: 40, y: 73 },
        { npc: 'pf_csmag', x: 61, y: 70, hidden: true },
        { npc: 'pf_csfennick', x: 9, y: 47, hidden: true },
        { npc: 'pf_cssteward', x: 70, y: 26, hidden: true },
        { npc: 'pf_csnibs', x: 48, y: 29, hidden: true },
        { npc: 'pf_csbody', x: 7, y: 17, hidden: true },
        { npc: 'pf_cswarden', x: 39, y: 8, hidden: true },
        { npc: 'pf_csengine', x: 63, y: 6, hidden: true },
      ],
      scenes: [
        {
          room: 'Front gate', title: 'The spire that counts', handout: 'cs-notice',
          read: 'The gates stand open. Far above, the spire\'s bell gives one soft, unfinished clank, and every bird in the yard goes silent. Hesper Quint snaps her watch shut. "Twelve hours," she says. "Strictly speaking, eleven and fifty-eight minutes."',
          gm: 'Start the bell clock at 12. Hesper explains the bell (she does not say she made the tuning heart). The heroes choose a way in: the spire door, the coal door, the lift or the scaffolding.',
        },
        {
          room: 'The walled yard', title: 'Brass in the grass', encounter: 'The gate sentries',
          gm: 'Six suits of animated armour and a cloud of flying swords guard the yard from the scrap heap. They attack anyone near the spire door. Hiding in a coal barrow, or showing Wendle\'s cog seal (Fennick has one), gets past them. The open grave is a short walk away.',
          treasure: 'From the scrap heap: a clockwork music box (50 gp) and a one-use key-wand that puts a construct to sleep. From the cooling pond: a ring of free action and a spare lift token.',
        },
        {
          room: 'Foundry shed', title: 'Mag Tully', optional: true,
          read: 'Behind the crates, a voice whispers: "If you\'re brass, I\'m not here. If you\'re not brass, I could use a hand."',
          gm: 'Mag has a broken ankle and six days of gossip. She knows the scaffolding route, saw the grave robbed by brass hands, and knows the coal door opens on the hour. Smashing the tooth moulds here slows the bell by 1 hour.',
          treasure: 'Mag\'s lucky charm: a stone of good luck, given as thanks. 300 gp of brass in her sack, if the heroes carry her out.',
        },
        {
          room: 'Escapement Hall', title: 'Fennick', encounter: 'Escapement guards',
          read: 'Between one swing of the great pendulum and the next, a small winged shape drops from the ceiling and lands on a pillar. "Oh! Friend-guests! Real ones! Please do not touch anything, and please, please mind the pendulum."',
          gm: 'Fennick appears. He offers to guide them and knows a short cut on every floor (including the parts chute). The guards (rugs, armour, swords) wake if anyone steps in the gear pit or touches the Winding room crank. Turning the crank back (DC 16 Athletics) gains 1 hour, once.',
        },
        {
          room: 'The Turning Floor', title: 'The turning dance', encounter: 'The turning dance',
          read: 'The floor shifts under your feet with a grinding sigh. The wall that was on your left is now in front of you, and a suit of armour you had not noticed bows to you, like a dancer asking for a turn.',
          gm: 'The disc turns every round; the spoke walls move with it. Armour dancers fight in step, and gray oozes, fat on spilled oil, come up out of the gear trench. The lever in the oil store stops the floor. Fire in the oil store is a disaster.',
          treasure: 'In the puppet stage\'s prop box: a cloak of elvenkind sewn for a puppet and resized by magic, and 120 gp in old coins.',
        },
        {
          room: 'The Steam Works', title: 'The boiler spirits', encounter: 'The boiler spirits',
          read: 'The furnace door bangs open and a face of fire looks out at you. "Free," it hisses. "Or fuel. Choose."',
          gm: 'The fire and water elementals are bound into the boiler. Breaking their binding-rings (AC 18, 30 hp each, or DC 18 Arcana) frees them: they leave, the mephits scatter and the bell clock stops for 2 hours while the spire runs cold. Otherwise they fight, with the mephits blowing steam. The lift stop and the coal door are here.',
          treasure: 'Bound into the boiler casing: two binding-rings of brass (150 gp each) and a necklace of adaptation the elementals were "saving".',
        },
        {
          room: 'Library of Blueprints', title: 'The moving stacks', encounter: 'Steward of the stacks', handout: 'cs-stillbell',
          read: 'A row of shelves slides away from you with a rumble, and behind it stands a tall figure of iron and oak with a lamp in its chest. It points at the blueprint in your hand, then at the shelf, and taps its chest three times.',
          gm: 'The Steward attacks anyone who takes a drawing. If a hero wears the cog amulet from the study, it obeys instead. The shelves move on a 5-6 each round. The Stillbell blueprint shows the tuning heart: cut it out and the bell is just a bell. The vault of failed inventions is secret (DC 16).',
          treasure: 'In the vault: a wand of web, a pair of boots of striding and springing, a helm of comprehending languages, and a box of tiny clockwork spiders (worth 400 gp to a collector).',
        },
        {
          room: 'The Menagerie', title: 'The clockwork zoo', encounter: 'The menagerie wakes', handout: 'cs-feeding',
          read: 'Copper leaves rustle on brass trees. Somewhere a horn blows, and with one loud clack every cage door in the dome swings open.',
          gm: 'The Engine pulls the keeper\'s lever when the heroes reach the pond. The beasts can be calmed with the feeding tune (DC 13 Performance each), and Nibs will eat clockwork beasts if Fennick lets it out. Sneaking round the keeper\'s walk past closed cages avoids the fight if nobody touches the lever.',
          treasure: 'In the feed store: three potions of greater healing (Wendle kept them for "accidents"), and a figurine of wondrous power (a silver raven) in the eagles\' nest.',
        },
        {
          room: 'The surgery', title: 'The Second Body', encounter: 'The Second Body', handout: 'cs-journal',
          read: 'The sheet slides off. The thing on the table sits up, slowly, and turns a stitched old face toward you. Its lips move. "Fen... nick?"',
          gm: 'The flesh golem made from Wendle\'s body. Fennick freezes. Showing it the locket or the portrait, or speaking kindly to it (DC 16 Persuasion), ends the fight. The study holds the cog amulet (commands the Steward), the journal and the heartspring notes. Fennick\'s secret can come out here.',
          treasure: 'In Wendle\'s study: the cog amulet, a ring of protection on the desk, 600 gp in a tea tin, and the heartspring notes.',
        },
        {
          room: 'Outside scaffolding', title: 'Brass rooks', encounter: 'Brass rooks', optional: true,
          read: 'The scaffolding creaks in the wind. Then the wind brings a sound like a hundred pairs of scissors, and brass birds come diving off the stonework.',
          gm: 'Brass rooks (clockwork birds that dive at climbers) and flying swords attack climbers. A hero hit while climbing makes a DC 12 Strength save or falls 10 ft to the next platform. This route skips floors 1 to 5.',
        },
        {
          room: 'Service lift shaft', title: 'The lift stops', encounter: 'Lift ride', optional: true, handout: 'cs-lift',
          read: 'Halfway up, the lift jolts to a stop. Chains rattle above you, and armoured shapes climb down them, hand over hand.',
          gm: 'The Engine stops the lift between floors and sends guards down the chains. A DC 15 thieves\' tools on the plate restarts it; so does killing the guards. This route skips floors 1, 2, 5 and 6.',
        },
        {
          room: 'The Belfry', title: 'Midnight at the Stillbell', encounter: 'The Bell-Warden',
          read: 'The bell hangs over the drop, nearly finished, brass workers crawling over it like ants. The stone giant with a clock for a face steps between you and it. Its hands point almost straight up. From the crown, a gentle old voice says, "Please. Just one more afternoon. Forever."',
          gm: 'The climax. The Bell-Warden and flying swords defend the bell. The heroes can jam the clapper, cut out the tuning heart, shove the Warden into the drop, or run past to the Engine Crown and talk the Engine down (see its profile). Fennick makes his choice here: if the heroes have been kind and honest with him, he tells them about the heartspring.',
          treasure: 'In the Engine Crown: Wendle\'s notebooks (3,000 gp to the right guild, or to Hesper), a tuning fork of black brass that works as a wand of magic missiles, and the heartspring.',
        },
      ],
      wrapUp: 'If the bell is stopped, the spire ticks down and falls still, and every clock in Vellmoor catches up with a sound like a sigh. The heroes choose what becomes of the Engine, and of Fennick.',
    },
  ],
  ending:
    'Win: the Stillbell never rings. If the Engine was talked down, it stops the bell and asks to be switched off while it is still itself; Fennick says goodbye, and lives if a hero took on his heartspring. If the Engine was destroyed without that, Fennick winds down in someone\'s hands, smiling. Vellmoor pays its reward and Hesper takes the notebooks. Lose: at midnight the bell rings and Vellmoor stops. The heroes, inside the spire, are not frozen: they can still reach the tuning heart and cut it out, but every hour they take, the frozen city loses a day it will never get back. Next: Hesper has the notebooks now. And Wendle\'s blueprints show a second bell, smaller, that was sold to a buyer in another city.',
};
