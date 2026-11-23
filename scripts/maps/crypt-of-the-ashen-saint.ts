// Crypt of the Ashen Saint, grown into a full crypt complex under a ruined chapel.
// Run: npx vite-node scripts/maps/crypt-of-the-ashen-saint.ts
import { MapBuilder, type Rect } from '../mapkit';

const b = new MapBuilder('crypt-of-the-ashen-saint', 'Crypt of the Ashen Saint', 64, 50, {
  theme: 'stone', wallStyle: 'stone', ambient: 'dark', floor: 'dungeon-slab', seed: 31,
});

// ------------------------------------------------------------------ north: the way in

// 1. Ruined chapel stair (start)
b.room('Ruined chapel stair', 2, 2, 7, 6, {
  mat: 'stone-cobble',
  readAloud: 'Broken steps spill down from the chapel above. Grey ash sifts through cracks in the vault and settles like snow.',
  gmNotes: 'The stairs climb to the ruined chapel (another map). Rubble in the north-east corner is difficult terrain. The ash is cold: whatever burned here burned long ago.',
});
b.paint(7, 2, 2, 2, { tile: 3 });
b.prop('stairs-up', 2, 2);
b.prop('ceiling-rubble', 7, 2);
b.prop('torch-sconce', 5, 2);
b.prop('bones', 7, 6);
b.prop('cobweb-corner', 2, 7, { rot: 270 });
b.prop('debris-wood', 3, 6, { v: 3 });
b.note(2, 2, 'Stairs up to the ruined chapel (another map)');
b.start(4, 4, 2, 2);

// hall east to the entry hall
b.hall(9, 5, 11, 5);
b.door(9, 5, 'w', 'open', 'door-broken');

// 2. Entry hall
b.room('Entry hall', 12, 2, 10, 8, {
  readAloud: 'A pillared hall, its floor drifted with ash. A robed statue of the saint stands at the far end, its face chiselled away.',
  gmNotes: 'Ash rats nest under the statue plinth. The statue base bears a worn inscription: "She burned so the dead would sleep." A DC 12 Investigation of the ash finds old boot prints leading south (to the catacombs) and east.',
});
for (const [x, y] of [[14, 4], [19, 4], [14, 7], [19, 7]]) b.prop('pillar-square', x, y);
b.prop('statue-tall-robed', 16, 2);
b.prop('brazier-pedestal', 15, 2);
b.prop('brazier-pedestal', 18, 2);
b.prop('rug-runner', 16, 5, { v: 3 });
b.prop('bones', 13, 8);
b.prop('blood-pool', 20, 6, { v: 1 });
b.prop('rubble-pile', 21, 9);
b.encounter('Ash rats', [12, 2, 10, 8], [['swarm-of-rats', 2], ['giant-rat', 2]], 'easy');

// hall east to the hall of niches
b.hall(22, 5, 24, 5);
b.door(22, 5, 'w', 'closed', 'door-wood');

// 3. Hall of niches
b.room('Hall of niches', 25, 2, 15, 7, {
  mat: 'stone-flagstone',
  readAloud: 'Burial niches climb both walls, each with a shrouded shape. One stone coffin in the aisle has had its lid pushed aside from within.',
  gmNotes: 'The open coffin is empty: its sleeper is one of the zombies. A DC 13 Perception finds a coffin holding a silver chalice (25 gp). The south door leads down to the embalmers\' rooms.',
});
for (const x of [26, 28, 30, 32, 34, 36, 38]) b.prop('tomb-niche', x, 2, { v: x % 4 === 0 ? 1 : 0 });
for (const x of [26, 28, 30, 32, 34, 38]) b.prop('tomb-niche', x, 8, { rot: 180 });
b.prop('sarcophagus', 28, 4);
b.prop('sarcophagus-open', 31, 4);
b.prop('sarcophagus', 34, 4);
b.prop('sarcophagus', 37, 4);
b.prop('chalices', 37, 6, { v: 1 });
b.prop('candles', 30, 5);
b.prop('candles', 36, 5);
b.prop('torch-sconce', 25, 3);
b.encounter('Restless dead', [25, 2, 15, 7], [['zombie', 2], ['skeleton', 2]], 'medium');

// hall east to the ossuary
b.hall(40, 6, 42, 6);
b.door(40, 6, 'w', 'closed', 'door-wood');

// 4. Ossuary (round, bone walls)
b.round('Ossuary', 47, 6, 4, {
  mat: 'stone-flagstone-warm',
  readAloud: 'The walls here are built of bones: skulls in neat rows, thigh bones stacked like firewood. A ring of black candles still smoulders in the middle.',
  gmNotes: 'Two ghouls feed among the shelves and drop from the bone walls when the party reaches the candles. Searching the shelves (10 minutes) turns up 3 coin stacks: 60 gp in old coin.',
});
b.prop('candle-ring', 46, 5);
b.prop('ossuary-shelf', 46, 2);
b.prop('ossuary-shelf', 50, 3, { rot: 90, v: 1 });
b.prop('ossuary-shelf', 46, 10, { rot: 180 });
b.prop('ossuary-shelf', 43, 5, { rot: 90 });
b.prop('skull-pile', 50, 4);
b.prop('skull-pile', 44, 8);
b.prop('bone-heap', 49, 8);
b.prop('coin-stacks', 51, 6);
b.encounter('Ossuary keepers', [43, 2, 9, 9], [['ghoul', 2]], 'medium');

// hall to the priests' cells
b.rect(51, 8, 2, 1);
b.door(53, 8, 'w', 'closed', 'door-wood');

// 5. Priests' cells: a corridor with small cells off it
b.rooms2('Priests\' cells', [[53, 8, 9, 2], [53, 2, 3, 4], [57, 2, 2, 4], [60, 2, 2, 4], [57, 11, 2, 3]], {
  mat: 'wood-planks-dark',
  readAloud: 'A low passage with narrow cells on either side, each with a straw pallet and a kneeler worn smooth by prayer.',
  gmNotes: 'Two specters of the old brothers drift along the passage and pass through cell walls. In the north-west cell, a hollow kneeler hides a spell scroll (bless). The east passage drops toward the collapsed transept.',
  label: [57, 8],
});
b.paint(53, 2, 3, 4, { mat: 'wood-planks' });
b.paint(57, 2, 2, 4, { mat: 'wood-planks' });
b.paint(60, 2, 2, 4, { mat: 'wood-planks' });
b.paint(57, 11, 2, 3, { mat: 'wood-planks' });
for (const x of [54, 57, 60]) { b.rect(x, 6, 1, 2); b.door(x, 6, 'n', x === 60 ? 'open' : 'closed', 'door-wood'); }
b.rect(57, 10, 1, 1);
b.door(57, 10, 's', 'closed', 'door-wood');
b.prop('straw-bed', 53, 2);
b.prop('prayer-kneeler', 55, 4);
b.prop('spell-scroll', 55, 2);
b.prop('cot', 58, 2);
b.prop('candles', 57, 4);
b.prop('straw-bed', 61, 2);
b.prop('broken-furniture', 60, 5);
b.prop('straw-bed', 58, 11);
b.prop('book-pile', 57, 13, { v: 1 });
b.prop('lantern-hanging', 55, 8);
b.prop('cobweb-corner', 61, 8, { rot: 90 });
b.encounter('The last brothers', [53, 2, 9, 12], [['specter', 2]], 'medium');

// 6. Prior's cell (holds the hinged bookcase to the reliquary)
b.rect(54, 10, 1, 1);
b.door(54, 10, 's', 'closed', 'door-wood');
b.room('Prior\'s cell', 53, 11, 3, 3, {
  mat: 'wood-planks',
  readAloud: 'A cell a little larger than the rest, with a writing desk and a shelf of mouldering prayer books.',
  gmNotes: 'The bookcase on the west wall is hinged: DC 14 Investigation (or pulling the red-bound book) swings it open onto the passage to the reliquary vault. The desk holds the prior\'s journal: "The Saint\'s Way runs from her relics to her bed. The lever in the sexton\'s room lifts the gate."',
});
b.prop('bookcase-secret', 53, 11, { rot: 90 });
b.prop('writing-desk', 54, 13);
b.prop('bed', 55, 11);
b.prop('candles', 55, 13);

// 7. Reliquary vault (secret)
b.rect(49, 12, 4, 1);
b.door(53, 12, 'w', 'secret');
b.room('Reliquary vault', 43, 12, 6, 6, {
  mat: 'marble',
  readAloud: 'Gilded boxes rest on a white altar under a soft, steady glow. The air smells of old incense and warm metal.',
  gmNotes: 'Secret (from the Prior\'s cell). Treasure: 2 reliquaries (the saint\'s finger bones, 150 gp each to a temple), jewelled chalices (120 gp), coin stacks (90 gp), potion of greater healing. Glyph on the altar step: DC 14 Perception to spot, 3d8 radiant (DC 13 Dex half) to anyone who isn\'t a cleric or paladin. A secret trapdoor in the south floor (DC 15 Perception) opens onto the Saint\'s Way.',
});
b.prop('altar', 45, 12);
b.prop('reliquary', 45, 13);
b.prop('reliquary', 46, 13, { v: 1 });
b.prop('light-orb', 43, 12);
b.prop('light-orb', 48, 12);
b.prop('chalices', 47, 15, { v: 2 });
b.prop('coin-stacks', 43, 16);
b.prop('potion-healing', 48, 16);
b.prop('glyph-trap', 45, 14, { gm: true });
b.prop('censer-hanging', 44, 15);

// 8. The Saint's Way: a hidden passage from the relics to the tomb
b.rooms2('The Saint\'s Way', [[44, 18, 1, 21], [45, 38, 6, 1]], {
  mat: 'stone-cobble',
  gmNotes: 'Secret passage, 1 square wide, sloping down. A hidden pit at the bend (DC 13 Perception; 2d6 bludgeoning, 10 ft deep). It ends at a secret door in the tomb\'s west wall that opens only from this side; the saint\'s guardians do not notice who comes this way until they step out.',
  label: [44, 28],
});
b.door(44, 18, 'n', 'secret');
b.door(51, 38, 'w', 'secret');
b.prop('trap-pit-hidden', 44, 37, { gm: true });
b.prop('skeleton-lying', 44, 25);
b.prop('candles', 44, 31);

// ------------------------------------------------------------------ east: the collapsed transept and the lever

// passage from the cells down to the transept
b.rect(61, 10, 1, 6);

// 10. Collapsed transept: a pit with a crumbling ledge
b.room('Collapsed transept', 53, 16, 9, 11, {
  mat: 'stone-flagstone',
  readAloud: 'Half the floor has fallen into darkness. A ledge clings to the east wall above the drop, and leathery shapes stir in the broken vault.',
  gmNotes: 'The pit is 30 ft deep (3d6 falling damage). The east ledge is the short way down: each creature crossing makes a DC 12 Dexterity (Acrobatics) save or the edge crumbles and it falls. The safe way is the rubble slope on the west side (difficult terrain), which also leads to the sexton\'s winch room. Stirges roost in the vault and attack anyone on the ledge first.',
  label: [57, 17],
});
b.paint(54, 18, 7, 7, { tile: 4, mat: 'pit' });
b.paint(53, 18, 1, 7, { tile: 3, mat: 'stone-cobble' });
b.prop('crumbling-ledge', 61, 18, { rot: 90 });
b.prop('crumbling-ledge', 61, 21, { rot: 90 });
b.prop('crumbling-ledge', 61, 24, { rot: 90, v: 1 });
b.prop('ceiling-rubble', 54, 16);
b.prop('column-collapsed', 58, 25);
b.prop('rubble-pile', 53, 25);
b.prop('pillar-broken', 60, 16);
b.prop('stalactites', 57, 17);
b.prop('cresset', 61, 26);
b.encounter('Pit roost', [53, 16, 9, 11], [['stirge', 5]], 'easy');

// 9. Sexton's winch room (the lever)
b.rect(51, 22, 2, 1);
b.door(51, 22, 'w', 'closed', 'door-wood');
b.room('Sexton\'s winch room', 47, 20, 4, 5, {
  mat: 'wood-planks-dark',
  readAloud: 'Chains as thick as an arm run from a great winch up into the ceiling. A single iron lever stands beside it, rusted in the down position.',
  gmNotes: 'Pulling the lever (DC 13 Strength, or two people) winds the chains and lifts the portcullis between the antechamber and the tomb. It makes a terrible grinding noise: the wardens in the antechamber are ready for the party. A key ring on a hook opens the natron store.',
});
b.prop('winch', 48, 21);
b.prop('lever', 49, 20);
b.prop('chains-hanging', 47, 22);
b.prop('rope-coil', 47, 24);
b.prop('key-ring', 50, 24, { v: 2 });
b.prop('lantern-wall', 50, 20);

// 11. Antechamber of ash
b.rect(56, 27, 1, 2);
b.door(56, 29, 'n', 'closed', 'door-wood');
b.room('Antechamber of ash', 52, 29, 9, 5, {
  mat: 'stone-flagstone-warm',
  readAloud: 'Ash lies ankle-deep around two stone wardens with lowered spears. Beyond a heavy portcullis, pale fire flickers.',
  gmNotes: 'A ghast and two ghouls crouch under the ash and burst out when someone touches the portcullis or the lever is pulled. The portcullis is locked down: raise it with the lever in the sexton\'s winch room, or DC 22 Strength to lift it by hand.',
});
b.prop('statue-knight', 55, 33);
b.prop('statue-knight', 57, 33);
b.prop('embers-ash', 53, 30);
b.prop('embers-ash', 58, 30);
b.prop('brazier', 52, 29);
b.prop('brazier', 60, 29);
b.prop('bones', 56, 31);
b.encounter('The saint\'s wardens', [52, 29, 9, 5], [['ghast', 1], ['ghoul', 2]], 'hard');
b.rect(56, 34, 1, 2);
b.door(56, 36, 'n', 'locked', 'portcullis');

// ------------------------------------------------------------------ the tomb

// 12. Tomb of the Ashen Saint
b.room('Tomb of the Ashen Saint', 51, 36, 11, 12, {
  mat: 'marble',
  readAloud: 'Four braziers burn with pale fire around a circle of silver runes. In its heart lies a sealed sarcophagus, and the ash on its lid is moving.',
  gmNotes: 'The saint rises as a mummy wreathed in ash, with a wight (her last captain) and two shadows cast by the braziers. Three ways in: the portcullis (lever), the locked iron door from the processional hall (DC 15 thieves\' tools; the key is on the skeleton captain in the collapsed guardroom), or the secret door from the Saint\'s Way. Dousing a brazier (action) weakens the shadows: they lose 5 hp each. Treasure: the saint\'s blade (+1 longsword, sheds pale light), coin pile (400 gp), open chest with 2 potions of healing and a scroll of lesser restoration.',
  label: [56, 38],
});
b.fill(51, 36, 1, 1); b.fill(61, 36, 1, 1); b.fill(51, 47, 1, 1); b.fill(61, 47, 1, 1);
b.prop('magic-circle', 55, 40);
b.prop('sarcophagus-effigy', 56, 40);
b.prop('brazier-everburning', 54, 39);
b.prop('brazier-everburning', 58, 39);
b.prop('brazier-everburning', 54, 43);
b.prop('brazier-everburning', 58, 43);
b.prop('altar-reredos', 55, 45);
b.prop('magic-sword', 56, 44);
b.prop('statue-tall-winged', 52, 45);
b.prop('statue-tall-winged', 59, 45);
b.prop('treasure-pile', 60, 41, { v: 3 });
b.prop('chest-open', 60, 42);
b.prop('coin-stacks', 60, 40);
b.prop('candle-stand-tall', 52, 37);
b.prop('candle-stand-tall', 60, 37);
b.encounter('The Ashen Saint', [51, 36, 11, 12], [['mummy', 1], ['wight', 1], ['shadow', 2]], 'hard', 'on-door-open');

// ------------------------------------------------------------------ west: guardroom, catacombs, the forgotten niche

// hall south to the guardroom
b.hall(5, 8, 5, 11);
b.door(5, 8, 'n', 'closed', 'door-wood');

// 13. Collapsed guardroom
b.rooms2('Collapsed guardroom', [[2, 12, 9, 9]], {
  mat: 'brick-floor',
  readAloud: 'Part of the ceiling has come down across a guard table. Bones in rusted mail lie where they fell, and one wears a captain\'s crested helm.',
  gmNotes: 'Four skeletons rise; the one in the crested helm is the skeleton captain (max hp 19) and carries the iron key to the tomb\'s processional door. The chest holds 40 gp and a potion of healing. A pressure plate in the east passage: DC 12 Perception to notice; 2d6 piercing darts, DC 12 Dex save halves. Broken stairs in the south-west corner go down to the flooded gallery.',
});
b.paint(8, 12, 3, 3, { tile: 3 });
b.prop('ceiling-rubble', 8, 12);
b.prop('table-long', 3, 14);
b.prop('chair', 3, 15);
b.prop('chair', 4, 13, { rot: 180 });
b.prop('weapon-rack', 7, 16, { rot: 90 });
b.prop('skeleton-lying', 5, 16);
b.prop('bones', 9, 18);
b.prop('chest', 9, 20);
b.prop('brazier', 2, 20);
b.prop('torch-sconce', 6, 12);
b.prop('key-ring', 5, 17);
b.encounter('Guardroom bones', [2, 12, 9, 9], [['skeleton', 4]], 'medium');
b.prop('pressure-plate', 12, 16, { gm: true });
b.rect(11, 16, 2, 1);
b.door(11, 16, 'w', 'closed', 'door-wood');

// broken stair down to the flooded gallery
b.rect(3, 21, 2, 1);
b.rect(4, 22, 1, 9);
b.prop('stairs-down', 4, 22);
b.prop('rubble-pile', 4, 27);

// 14. Catacombs: a maze of narrow niches with loops
const CAT = [
  '###.#############',
  '#.......#.......#',
  '#.#.###.#.#####.#',
  '#.#...#...#......',
  '..###.#####.###.#',
  '#...#...#...#...#',
  '###.#.#.#.#.#.###',
  '#...#.#...#.#...#',
  '#.###.#####.###.#',
  '#.....#ooo#.....#',
  '#.###.#ooo#.###.#',
  '#...#...o...#...#',
  '###.#####.#####.#',
  '....#.....#.....#',
  '#.###.###.#.###.#',
  '#.....#...#...#.#',
  '#.#####.#####.#.#',
  '#.###############',
];
const CX = 13, CY = 12;
const catRects: Rect[] = [];
CAT.forEach((row, j) => {
  let s = -1;
  for (let i = 0; i <= row.length; i++) {
    const open = i < row.length && row[i] !== '#';
    if (open && s < 0) s = i;
    if (!open && s >= 0) { catRects.push([CX + s, CY + j, i - s, 1]); s = -1; }
  }
});
b.rooms2('Catacombs', catRects, {
  mat: 'stone-cobble',
  readAloud: 'Narrow passages twist between walls of burial niches, each sealed with a crumbling plaster face. Somewhere ahead, a cold draught sighs.',
  gmNotes: 'A maze with several loops. Shadows slip along the niches and strike from behind. At the central bone crossing, a candle that never burns down marks a crossroads. A loose plaster face on the far west wall (DC 14 Perception) hides the way into the forgotten niche.',
  label: [21, 22],
});
b.paint(CX + 7, CY + 9, 3, 3, { mat: 'marble' });
b.prop('candles', CX + 8, CY + 10);
b.prop('skull-pile', CX + 7, CY + 9);
b.prop('urn', CX + 9, CY + 9, { v: 3 });
// dead-end niches and passage dressing
b.prop('tomb-niche', CX + 1, CY + 1);
b.prop('tomb-niche', CX + 15, CY + 1, { v: 1 });
b.prop('tomb-niche', CX + 3, CY + 3);
b.prop('treasure-urn', CX + 1, CY + 5, { v: 1 });
b.prop('tomb-niche', CX + 15, CY + 7);
b.prop('skeleton-seated', CX + 13, CY + 15);
b.prop('cobweb-corner', CX + 15, CY + 9);
b.prop('bones', CX + 5, CY + 13);
b.prop('tomb-niche', CX + 7, CY + 15, { rot: 180 });
b.prop('potion-healing', CX + 15, CY + 15);
b.prop('candles', CX + 3, CY + 7);
b.prop('candles', CX + 13, CY + 5);
b.prop('trap-darts', CX + 5, CY + 5, { gm: true });
b.encounter('Shadows in the niches', [13, 12, 17, 18], [['shadow', 3]], 'medium');
// joins: entry hall above, embalmers to the east, gallery below
b.rect(16, 10, 1, 2);
b.door(16, 10, 'n', 'closed', 'door-wood');
b.rect(30, 15, 2, 1);
b.door(32, 15, 'w', 'closed', 'door-wood');
b.rect(14, 30, 1, 1);

// 15. Forgotten niche (secret)
b.rect(12, 25, 1, 1);
b.door(12, 25, 'w', 'secret');
b.room('Forgotten niche', 7, 23, 5, 5, {
  mat: 'dungeon-slab',
  readAloud: 'A tiny sealed chapel. A stone knight lies on a tomb lid with a shield across its chest that still gleams as if newly polished.',
  gmNotes: 'Secret (from the catacombs). The shield is a +1 shield; lifting it without first saying a prayer for the knight sets off the glyph (DC 13 Perception; 2d8 necrotic, DC 13 Con half). A scroll case holds a spell scroll of protection from evil and good.',
});
b.prop('sarcophagus-effigy', 9, 24);
b.prop('enchanted-shield', 9, 26);
b.prop('glyph-trap', 10, 26, { gm: true });
b.prop('sconce-witchfire', 7, 23);
b.prop('spell-scroll', 7, 27);
b.prop('skeleton-seated', 11, 23);

// ------------------------------------------------------------------ centre: the embalmers

// hall from the hall of niches down to the workroom
b.rect(36, 9, 1, 3);
b.door(36, 9, 'n', 'closed', 'door-wood');

// 16. Embalmers' workroom
b.room('Embalmers\' workroom', 32, 12, 10, 7, {
  mat: 'brick-floor',
  readAloud: 'Stone slabs with drains, hooks and dried herbs. On one slab a wrapped body lies half finished, and it turns its head toward you.',
  gmNotes: 'Three zombies (the unfinished dead) and a ghoul that was once an embalmer. On the shelf: 2 potions of healing and a jar of embalming salts (counts as holy water once, if blessed). The south door to the natron store is locked (DC 13 thieves\' tools; key ring in the sexton\'s winch room).',
});
b.prop('burial-slab', 33, 13);
b.prop('burial-slab', 35, 13);
b.prop('burial-slab', 37, 13, { v: 1 });
b.prop('alchemy-table', 39, 16);
b.prop('cauldron', 40, 13, { v: 1 });
b.prop('potion-shelf', 32, 17);
b.prop('herbs-drying', 38, 12);
b.prop('urn', 34, 16);
b.prop('urn', 35, 16, { v: 2 });
b.prop('potion-set', 41, 18);
b.prop('oil-lamp-hanging', 36, 15);
b.prop('butcher-block', 41, 12, { v: 1 });
b.encounter('Unfinished work', [32, 12, 10, 7], [['zombie', 3], ['ghoul', 1]], 'medium');

// 17. Natron store
b.rect(35, 19, 1, 2);
b.door(35, 21, 'n', 'locked', 'door-wood');
b.room('Natron store', 32, 21, 7, 6, {
  mat: 'dirt',
  readAloud: 'Sacks of grey salt and stacked jars fill a low storeroom. An iron-bound chest sits invitingly in the corner.',
  gmNotes: 'The chest is a mimic (adhesive; DC 13 Perception notices the "wood" breathing). The real loot is in the jars: 30 gp in a false-bottomed one and a wand of magic missiles (3 charges) wrapped in linen. Stairs in the south lead down to the mourners\' chapel.',
});
b.prop('mimic-chest', 38, 26);
b.prop('flour-sacks', 32, 21, { v: 2 });
b.prop('sack', 32, 23);
b.prop('crate-stack', 37, 21);
b.prop('shelf-jars', 36, 23, { rot: 90 });
b.prop('pottery', 33, 26);
b.prop('wand', 32, 25);
b.prop('lantern-hook', 34, 21);
b.encounter('Hungry chest', [36, 24, 3, 3], [['mimic', 1]], 'medium');

// down to the mourners' chapel
b.rect(35, 27, 1, 5);
b.door(35, 32, 'n', 'closed', 'door-wood');

// 18. Mourners' chapel
b.room('Mourners\' chapel', 24, 32, 12, 6, {
  mat: 'stone-flagstone-warm',
  readAloud: 'Rows of pews face a plain altar under a cracked stained-glass lamp. Candles left by long-dead mourners have melted into pale puddles.',
  gmNotes: 'A safe place to rest: undead will not cross the threshold while a candle burns on the altar. The offering bowl holds 25 gp. A short stair in the south wall leads to the processional hall.',
});
b.prop('altar', 29, 32);
b.prop('candelabra', 28, 32);
b.prop('candelabra', 31, 32);
for (const y of [34, 36]) { b.prop('pew', 25, y); b.prop('pew', 28, y); b.prop('pew', 32, y); }
b.prop('offering-bowl', 30, 33);
b.prop('font', 34, 33);
b.prop('spell-scroll', 24, 32);
b.rect(30, 38, 1, 3);
b.door(30, 38, 'n', 'closed', 'door-wood');

// ------------------------------------------------------------------ south: gallery and processional

// 19. Flooded lower gallery
b.rooms2('Flooded lower gallery', [[2, 35, 18, 10], [2, 31, 14, 4], [5, 45, 15, 2]], {
  label: [10, 39],
  mat: 'stone-flagstone',
  readAloud: 'Black water covers the floor of a long colonnade. Something pale bobs against a pillar, and a rotted boat drifts at its tether.',
  gmNotes: 'Shallow water everywhere is difficult terrain. The deep channel through the middle needs swimming (DC 10 Athletics) unless you use the rope bridge. Four drowned zombies lie under the surface and rise when someone reaches the channel. A strongbox sunk by the north pillar holds 50 gp and a potion of water breathing.',
});
b.paint(2, 31, 18, 16, { tile: 2, mat: 'water-shallow' });
b.paint(9, 31, 4, 16, { tile: 2, mat: 'water-deep' });
b.paint(2, 31, 4, 3, { tile: 1, mat: 'stone-flagstone' });
b.paint(13, 31, 3, 2, { tile: 1, mat: 'stone-flagstone' });
b.paint(16, 42, 4, 3, { tile: 1, mat: 'stone-flagstone' });
for (const [x, y] of [[6, 35], [6, 40], [15, 35], [15, 40], [6, 45], [15, 45]]) b.prop('column-fluted', x, y, { v: 1 });
b.prop('bridge-rope', 9, 38, { rot: 90, v: 1 });
b.prop('rowboat', 4, 41);
b.prop('mooring-post', 5, 40);
b.prop('coffin', 17, 36, { v: 2 });
b.prop('debris-wood', 13, 43);
b.prop('strongbox', 14, 32);
b.prop('glowing-fungus', 3, 31);
b.prop('glowing-fungus', 18, 46);
b.prop('glowing-fungus', 13, 31);
b.prop('torch-sconce', 19, 42);
b.encounter('Drowned dead', [2, 31, 18, 16], [['zombie', 4]], 'medium');

// hall east to the processional hall
b.rect(20, 43, 2, 1);
b.door(22, 43, 'w', 'closed', 'door-double');

// 20. Processional hall (trapped)
b.rooms2('Processional hall', [[22, 41, 27, 5], [26, 40, 1, 1], [34, 40, 1, 1], [42, 40, 1, 1], [26, 46, 1, 1], [32, 46, 1, 1], [38, 46, 1, 1], [44, 46, 1, 1]], {
  mat: 'marble',
  readAloud: 'A grand hall runs east between statues of armoured mourners, a faded runner down its middle. Thin slits pierce the north wall, and the air smells of oil.',
  gmNotes: 'Trapped (all DC 13 Perception to spot, DC 13 Investigation to disarm). West to east: pendulum axes across the hall (2d10 slashing, DC 13 Dex half); a pressure plate that fires the arrow slits (3 attacks at +5, 1d8 piercing); scything blades under the runner (2d8 slashing); a second plate that drops the portcullis-style bars on the side alcoves; a rune threshold before the iron door (3d6 fire, DC 13 Dex half; speaking the saint\'s name, carved in the mourners\' chapel, makes it safe). Four skeletons stand in the alcoves as the honour guard. The iron door at the east end is locked: key on the skeleton captain, or DC 15 thieves\' tools.',
  label: [35, 43],
});
b.prop('rug-runner', 24, 43, { rot: 90, v: 0 });
b.prop('rug-runner', 30, 43, { rot: 90, v: 0 });
b.prop('rug-runner', 36, 43, { rot: 90, v: 0 });
for (const [x, y] of [[26, 40], [34, 40], [42, 40]]) b.prop('statue-knight', x, y);
for (const [x, y] of [[26, 46], [32, 46], [38, 46], [44, 46]]) b.prop('statue-knight', x, y, { rot: 180 });
b.prop('trap-pendulum-axe', 28, 42, { rot: 90, gm: true });
b.prop('pressure-plate', 33, 43, { gm: true });
b.prop('trap-arrow-slits', 34, 41, { gm: true });
b.prop('trap-floor-scythe', 38, 43, { gm: true });
b.prop('pressure-plate', 43, 42, { gm: true });
b.prop('trap-rune-threshold', 49, 43, { gm: true });
b.prop('brazier-pedestal', 23, 41);
b.prop('brazier-pedestal', 23, 45);
b.prop('sconce-witchfire', 31, 41);
b.prop('sconce-witchfire', 40, 41);
b.prop('sconce-witchfire', 47, 41);
b.prop('bones', 29, 44);
b.prop('skeleton-lying', 40, 44);
b.encounter('Honour guard', [22, 40, 27, 7], [['skeleton', 4]], 'medium');

// locked iron door into the tomb
b.rect(49, 43, 2, 1);
b.door(51, 43, 'w', 'locked', 'door-iron');

// 21. Knights' sepulchre (dead end off the processional hall)
b.rect(40, 37, 1, 4);
b.door(40, 37, 'n', 'closed', 'door-iron');
b.room('Knights\' sepulchre', 37, 30, 6, 7, {
  mat: 'dungeon-slab',
  readAloud: 'Eight stone knights lie in two rows, their swords laid on their chests. At the far end, a bronze statue holds out a cup.',
  gmNotes: 'Dead end with a reward. The bronze statue is a fire trap: taking the cup without filling it with water first breathes fire down the aisle (3d6 fire, DC 13 Dex half). The cup is a gold chalice (75 gp); the effigies hold 2 coin stacks (40 gp) and a potion of heroism.',
});
b.prop('sarcophagus-row', 37, 33);
b.prop('sarcophagus-row', 37, 31);
b.prop('trap-fire-statue', 42, 30, { gm: true });
b.prop('chalices', 41, 30);
b.prop('coin-stacks', 42, 33);
b.prop('potion-healing', 42, 35);
b.prop('brazier-hanging', 39, 35);

b.save({
  description: 'A sprawling crypt under a ruined chapel: catacombs, ossuary, flooded gallery, trapped processional, hidden reliquary and the saint\'s warded tomb.',
  setting: 'dungeon',
  tags: ['dungeon', 'crypt', 'undead', 'one-shot', 'large'],
});
