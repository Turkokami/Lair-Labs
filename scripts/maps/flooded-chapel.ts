// The Flooded Chapel, the big version: a whole sunken temple complex. The old chapel (the flooded nave with its
// pews, the dry altar dais, the west and east chapels and the stairs down) is still at the heart of it. Around it
// now lie a narthex and a broken porch, a bell tower base, a cloister round a drowned garden, the monks' dormitory,
// a scriptorium with a hidden reliquary behind a bookcase, the sacristy, a great cistern with a whirlpool, the
// drowned crypt under the east stairs (flooded tombs, a sluice winch, the abbot's tomb) and a smugglers' tunnel
// out to a sea cave. Three ways lead to the abbot: down the east stairs through the tombs, over the cistern and
// down the overflow culvert to the sluice, or round by the bell tower, the sea cave and the smugglers' tunnel.
// Run: npx vite-node scripts/maps/flooded-chapel.ts
import { MapBuilder } from '../mapkit';

const b = new MapBuilder('flooded-chapel', 'The Flooded Chapel', 56, 46, { theme: 'stone', wallStyle: 'stone', ambient: 'dim', floor: 'stone-flagstone', seed: 23 });
const SHALLOW = { tile: 2, mat: 'water-shallow' };
const DEEP = { tile: 2, mat: 'water-deep' };
const MUD = { tile: 3, mat: 'mud' };
const RUBBLE = { tile: 3 };
const SLAB = { mat: 'dungeon-slab' };

// =====================================================================================================
// South: the broken porch (start) and the narthex
// =====================================================================================================
b.room('Sunken porch', 24, 39, 8, 3, {
  mat: 'stone-cobble',
  readAloud: 'The causeway ends in cracked steps half swallowed by silt. Ahead, the temple\'s great doors lean open on rusted hinges, and the air smells of salt and rot.',
  gmNotes: 'The two lowest steps on the east side are rotten under the mud (collapsing floor, DC 12 Perception to notice; DC 12 Dex save or drop 10 ft into a silt pocket, 1d6 bludgeoning, restrained until a DC 12 Strength check frees you).',
  label: [27, 39],
});
b.paint(24, 41, 3, 1, MUD);
b.paint(30, 39, 2, 1, MUD);
b.start(26, 40, 4, 2);
b.prop('rubble-pile', 24, 39); b.prop('column-collapsed', 29, 41); b.prop('puddle', 25, 40); b.prop('statue-gargoyle', 31, 40);
b.prop('trap-collapsing-floor', 30, 39, { gm: true });
b.prop('torch-standing', 24, 40);

b.hall(27, 38, 28, 38);
b.room('Narthex', 22, 34, 12, 4, {
  readAloud: 'A long entry hall, its floor slick with a skin of seawater. Two stone fonts stand by the inner doors, one cracked, one still full and faintly glowing.',
  gmNotes: 'The glowing font holds holy water: 3 vials can be filled. Drinking from the cracked font (brackish) is harmless but foul. Double doors north open into the nave; a side door west leads to the bell tower passage.',
});
b.paint(22, 37, 4, 1, SHALLOW);
b.prop('font', 25, 34); b.prop('font', 30, 34, { v: 1 }); b.prop('torch-sconce', 23, 34); b.prop('torch-sconce', 32, 34);
b.prop('bench-long', 28, 37); b.prop('banner-hanging-tall', 33, 35); b.prop('puddle', 23, 37); b.prop('debris-wood', 33, 37);
b.hall(27, 32, 28, 33, { w: 2 });
b.door(27, 32, 'n', 'closed', 'door-double');
b.door(28, 32, 'n', 'closed', 'door-double');

// =====================================================================================================
// The heart: the nave, the altar dais, the west and east chapels (the old map)
// =====================================================================================================
b.room('Altar dais', 23, 13, 10, 3, {
  mat: 'marble',
  readAloud: 'Above the waterline, a marble dais stays stubbornly dry. Candles that should have died long ago burn before a carved altar screen, and a lectern holds a swollen hymnal.',
  gmNotes: 'The specter of the old cantor drifts out of the altar screen if anyone reads from the hymnal or takes a candle. The hymnal has the abbot\'s name and a verse that opens the crypt door: "Rise, and be counted" (spoken at the abbot\'s iron door, it unlocks). The altar holds an offering of 15 gp in a dish.',
  label: [27, 14],
});
b.prop('altar-reredos', 27, 13); b.prop('candelabra', 26, 13); b.prop('candelabra', 30, 13); b.prop('statue', 32, 13);
b.prop('lectern', 28, 15); b.prop('brazier-pedestal', 23, 15); b.prop('brazier-pedestal', 32, 15); b.prop('offering-bowl', 25, 15);
b.encounter('Choir of whispers', [23, 13, 10, 3], [['specter', 1]], 'medium', 'manual');

b.room('Nave', 19, 16, 18, 16, {
  readAloud: 'Cold water laps at the pews. Something pale drifts beneath the surface near the middle rows, and the pillars vanish into darkness overhead.',
  gmNotes: 'Shallow water (difficult terrain) from the third row down; the middle of the nave is deep (swim, Athletics DC 10 in armour heavier than light). The side aisles stay shallow, so you can wade round. Zombies of the drowned congregation rise from the deep section when anyone passes the third row of pews.',
  label: [27, 18],
});
b.paint(19, 19, 18, 11, SHALLOW);
b.paint(22, 23, 12, 4, DEEP);
b.paint(19, 16, 2, 2, { ...RUBBLE, mat: 'stone-flagstone' });
for (const y of [17, 20, 23, 26, 29]) { b.prop('column-fluted', 21, y); b.prop('column-fluted', 34, y); }
for (const y of [19, 21, 23, 25, 27, 29]) { b.prop('pew', 23, y); b.prop('pew', 31, y); }
b.prop('rubble-pile', 19, 16); b.prop('rubble-pile', 20, 17); b.prop('boulder', 35, 30); b.prop('skeleton-lying', 27, 24);
b.prop('brazier', 22, 16); b.prop('torch-sconce', 19, 30); b.prop('torch-sconce', 36, 30); b.prop('lily-pads', 25, 28);
b.encounter('The drowned congregation', [19, 19, 18, 11], [['zombie', 4]], 'medium');

b.room('West chapel', 13, 21, 5, 6, {
  mat: 'stone-flagstone-warm',
  readAloud: 'A narrow side chapel with a lidded coffin before a little shrine. Someone left a ring of bones in front of it, neatly arranged.',
  gmNotes: 'The coffin holds a dead pilgrim and a silver holy symbol (25 gp). Pressing the shrine\'s sun carving (DC 14 Investigation) opens a secret door in the south wall to the passage leading to the bell tower.',
});
b.hall(18, 23, 18, 23);
b.door(18, 23, 'w', 'open');
b.prop('coffin', 14, 22); b.prop('shrine', 15, 21); b.prop('bones', 16, 24); b.prop('candles', 13, 21); b.prop('prayer-kneeler', 16, 22);
b.prop('urn', 13, 26);

b.room('East chapel', 38, 21, 5, 6, {
  mat: 'stone-flagstone-warm',
  readAloud: 'Water trickles down worn steps in the floor of this chapel, falling away into the dark below. The saint\'s statue here has had its face chiselled off.',
  gmNotes: 'The stairs lead down to the drowned crypt. Faint scratching comes up from below. The faceless statue was defaced by the last abbot; a DC 13 Religion check names the saint as a patron of drowned sailors.',
});
b.hall(37, 23, 37, 23);
b.door(38, 23, 'w', 'closed');
b.prop('statue', 41, 21); b.prop('candles', 38, 21); b.prop('prayer-kneeler', 39, 24); b.prop('torch-sconce', 42, 25);
b.hall(40, 27, 40, 28, SLAB);
b.prop('stairs-down', 40, 27);

// =====================================================================================================
// North: the scriptorium, the hidden reliquary, the sacristy
// =====================================================================================================
b.hall(24, 11, 24, 12);
b.door(24, 11, 'n', 'closed');
b.room('Scriptorium', 21, 5, 14, 6, {
  mat: 'wood-planks',
  readAloud: 'Writing desks stand in rows under a ceiling of dripping vaults. Ruined pages paper the floor like fallen leaves, and the tall bookcases lean with the weight of swollen books.',
  gmNotes: 'Two shadows lurk in the bookcases and slide out when light falls on the north wall. The hinged bookcase in the middle of the north wall hides a secret door (DC 15 Perception to notice the scrape marks; pull the red-bound book to swing it). A dry page on the lectern-desk is a map of the crypt showing the sluice and "the abbot sleeps beyond the iron door".',
  label: [27, 8],
});
b.prop('bookcase-secret', 27, 5);
b.prop('bookcase-grand', 22, 5); b.prop('bookcase-grand', 31, 5);
b.prop('writing-desk', 22, 7); b.prop('writing-desk', 25, 7); b.prop('writing-desk', 29, 7); b.prop('writing-desk', 32, 7);
b.prop('stool', 23, 8); b.prop('stool', 26, 8); b.prop('stool', 30, 8); b.prop('stool', 33, 8);
b.prop('scroll-pile', 21, 10); b.prop('book-pile', 34, 10); b.prop('candles', 28, 9); b.prop('lamp-table', 32, 9); b.prop('bookshelf-fallen', 26, 10);
b.encounter('Ink-black shapes', [21, 5, 14, 6], [['shadow', 2]], 'medium');

b.hall(27, 4, 27, 4, { mat: 'marble' });
b.door(27, 5, 'n', 'secret');
b.room('Hidden reliquary', 25, 1, 6, 3, {
  mat: 'marble',
  readAloud: 'A tiny vault, bone dry. A gilded reliquary rests on a plinth between two hovering blades that turn slowly to face you.',
  gmNotes: 'Two flying swords guard the reliquary. The reliquary holds a saint\'s finger bone (300 gp to the right buyer). Beside it: a spell scroll (lesser restoration), a scroll case with a spell scroll of water breathing, and the iron key to the abbot\'s tomb. A poison dart plate sits in front of the plinth (DC 13 Perception; DC 13 Dex save or 1d4 piercing + 2d6 poison).',
});
b.prop('plinth-display', 27, 1); b.prop('reliquary', 28, 1); b.prop('spell-scroll', 25, 1); b.prop('key-ring', 30, 1);
b.prop('candle-stand-tall', 25, 3); b.prop('candle-stand-tall', 30, 3); b.prop('trap-darts', 28, 2, { gm: true });
b.prop('glyph-trap', 27, 4, { gm: true });
b.encounter('Reliquary guardians', [25, 1, 6, 3], [['flying-sword', 2]], 'easy');

b.hall(33, 14, 37, 14);
b.door(38, 14, 'w', 'locked');
b.room('Sacristy', 38, 12, 5, 6, {
  mat: 'wood-planks-dark',
  readAloud: 'Vestments hang rotting in an open wardrobe. On a side table sit silver chalices and a heavy offering box with a brass lock shaped like a praying hand.',
  gmNotes: 'Locked (DC 15 thieves\' tools; the key is on the ring in the prior\'s footlocker in the dormitory). The offering box\'s lock hides a poison needle (DC 14 Investigation to spot; DC 13 Con save or 2d6 poison and poisoned for 1 hour). Inside: 140 gp and an ivory pyx (50 gp). The chalices are worth 75 gp for the set.',
});
b.prop('wardrobe', 38, 12); b.prop('vanity', 41, 12); b.prop('chalices', 42, 15); b.prop('coffer', 42, 16); b.prop('trap-needle-lock', 42, 16, { gm: true });
b.prop('candles', 38, 17); b.prop('censer-hanging', 40, 14); b.prop('chest', 38, 15);

// =====================================================================================================
// West: the cloister and drowned garden, the dormitory, the bell tower base
// =====================================================================================================
b.rooms2('Cloister walk', [[2, 10, 15, 2], [2, 18, 15, 2], [2, 12, 2, 6], [15, 12, 2, 6]], {
  readAloud: 'A covered walk runs round a sunken garden. Half the arches have fallen, and the flagstones are green with weed where the sea has been in.',
  gmNotes: 'Doors: north to the dormitory, north-east to the scriptorium passage, east to the nave, south to the bell tower. The garden\'s low wall has four gaps.',
  label: [9, 10],
});
b.room('Drowned garden', 4, 12, 11, 6, {
  mat: 'grass',
  readAloud: 'What was a herb garden is now a brackish pond. Reeds and lily pads choke the water around an old well, and a dead willow leans over it all.',
  gmNotes: 'Shallow water and mud (difficult terrain). Giant frogs hide in the reeds. The well is a 40-ft shaft into seawater; a bucket on its chain holds a pouch with 12 gp and a moonstone (50 gp) a monk hid long ago.',
  label: [9, 15],
});
b.paint(5, 13, 9, 4, SHALLOW);
b.paint(4, 16, 3, 2, MUD);
b.paint(12, 12, 3, 2, MUD);
for (let x = 4; x <= 14; x++) { if (x !== 9) { b.wall(x, 12, 'n', 'low'); b.wall(x, 17, 's', 'low'); } }
for (let y = 12; y <= 17; y++) { if (y !== 14) { b.wall(4, y, 'w', 'low'); b.wall(14, y, 'e', 'low'); } }
b.prop('well', 8, 14); b.prop('tree-dead', 11, 13); b.prop('reeds', 5, 13); b.prop('reeds', 6, 16); b.prop('lily-pads', 7, 13);
b.prop('lily-pads', 12, 16); b.prop('mud-patch', 4, 16); b.prop('reeds', 13, 15);
b.prop('pillar-broken', 2, 10); b.prop('pillar-broken', 16, 19); b.prop('rubble-pile', 3, 19); b.prop('torch-sconce', 14, 10);
b.prop('ferns', 2, 14); b.prop('pillar-broken', 16, 12); b.prop('torch-sconce', 5, 18);
b.encounter('Reed lurkers', [4, 12, 11, 6], [['giant-frog', 3]], 'easy');
b.door(17, 17, 'w', 'closed');
b.hall(17, 17, 18, 17);

b.hall(7, 8, 7, 9);
b.door(7, 10, 'n', 'closed');
b.room("Monks' dormitory", 2, 2, 11, 6, {
  mat: 'wood-planks',
  readAloud: 'Narrow bunks line the walls, their straw ticks black with mould. At the far end, behind a moth-eaten screen, a single better bed stands beside a footlocker.',
  gmNotes: 'Three skeletal monks still lie in their bunks and rise when the screen is moved. The prior\'s footlocker (unlocked) holds the sacristy key on a ring, 2 potions of healing and a prayer book. Under a loose plank by the fire grate: 30 sp.',
});
b.prop('bunk-bed', 2, 2); b.prop('bunk-bed', 4, 2); b.prop('bunk-bed', 6, 2); b.prop('bunk-bed', 2, 5); b.prop('bunk-bed', 4, 5);
b.prop('footlocker', 3, 4); b.prop('footlocker', 5, 4); b.prop('folding-screen', 9, 3, { rot: 90 });
b.prop('bed', 11, 2); b.prop('footlocker', 12, 4); b.prop('key-ring', 11, 4); b.prop('potion-healing', 12, 5);
b.prop('fireplace', 7, 2); b.prop('washbasin', 10, 7); b.prop('candles', 12, 7);
b.encounter('The sleepers', [2, 2, 11, 6], [['skeleton', 3]], 'easy');

// passage from the cloister to the scriptorium
b.hall(15, 9, 20, 7, { vFirst: true, ...SLAB });
b.door(15, 10, 'n', 'closed');
b.door(21, 7, 'w', 'closed');
b.prop('torch-sconce', 17, 7);
b.prop('puddle', 38, 7); b.prop('trap-tripwire', 39, 7, { gm: true });

b.hall(8, 20, 8, 25, SLAB);
b.door(8, 20, 'n', 'closed');
b.round('Bell tower base', 8, 30, 4, {
  mat: 'brick-floor',
  readAloud: 'The bottom of a hollow tower. The great bell lies cracked on its side where it fell, and a spiral stair climbs into blackness, its upper turns long gone.',
  gmNotes: 'Stirges roost in the tower and swoop down at any light. A bell rope still hangs from the remaining beam: pulling it drops a loose block (DC 13 Dex save or 2d10 bludgeoning). Ringing the cracked bell (DC 15 Athletics to rock it) wakes every undead in the temple. A crumbling ledge to the south leads down a rope ladder to the sea cave.',
});
b.prop('temple-bell', 7, 30); b.prop('stair-spiral', 9, 27); b.prop('rubble-pile', 5, 31); b.prop('ceiling-rubble', 9, 31);
b.prop('chains-hanging', 6, 28); b.prop('trap-falling-block', 6, 29, { gm: true }); b.prop('brazier', 11, 30); b.prop('bones', 5, 29);
b.encounter('Bell tower roost', [4, 26, 9, 9], [['stirge', 4]], 'easy');

// passage: bell tower east to the narthex, with the secret way up to the west chapel
b.hall(13, 30, 16, 30, SLAB);
b.hall(16, 31, 16, 36, SLAB);
b.hall(17, 36, 21, 36, SLAB);
b.door(22, 36, 'w', 'closed');
b.hall(15, 27, 15, 29, SLAB);
b.door(15, 27, 'n', 'secret');
b.prop('torch-sconce', 16, 33); b.prop('cobweb-corner', 15, 27);

// =====================================================================================================
// East: the great cistern and the overflow culvert
// =====================================================================================================
b.hall(35, 7, 41, 7, SLAB);
b.door(35, 7, 'w', 'closed');
b.door(42, 7, 'w', 'closed', 'door-iron');
b.round('Great cistern', 48, 8, 6, {
  mat: 'dungeon-slab',
  readAloud: 'A vaulted cistern the size of a church, filled almost to the brim with black water. In the middle the surface turns in a slow, sucking spiral, and frost rimes the north ledge where a cold spring seeps in.',
  gmNotes: 'Deep water: swim. The whirlpool pulls swimmers within 10 ft 5 ft toward its centre each turn (DC 13 Str save resists); in the centre, DC 13 Str save or pulled under and swept down the culvert to the sluice chamber, taking 2d6 bludgeoning. The north ledge is slick ice (DC 10 Dex save when moving more than half speed, or fall prone). Two crocodiles came in from the sea and lair here. A ledge runs round the rim to the overflow culvert on the south-east.',
  label: [48, 3],
});
b.paint(44, 5, 9, 8, DEEP);
b.paint(43, 7, 11, 4, DEEP);
b.paint(45, 2, 7, 2, { mat: 'ice' });
b.prop('whirlpool', 47, 7, { v: 1 });
b.prop('ice-thin', 46, 3, { v: 1 }); b.prop('deep-water', 49, 4, { v: 1 });
b.prop('sconce-witchfire', 43, 5); b.prop('sconce-witchfire', 53, 10); b.prop('mooring-post', 43, 11); b.prop('rowboat', 52, 6);
b.prop('chains-hanging', 45, 12);
b.encounter('Cistern lurkers', [42, 2, 13, 13], [['crocodile', 2]], 'medium');

b.room('Overflow culvert', 50, 14, 2, 8, {
  ...SHALLOW,
  readAloud: 'Water pours out of the cistern down a steep stone channel, roaring away into the dark.',
  gmNotes: 'A dangerous shortcut to the crypt. The rapids are difficult terrain and push anyone in them 10 ft downstream each turn (DC 13 Athletics to hold position). Riding them all the way: DC 12 Dex save or 2d6 bludgeoning from the stones, landing in the sluice chamber pool.',
  label: [50, 17],
});
b.prop('rapids', 50, 15, { rot: 90 }); b.prop('rapids', 51, 17, { rot: 90 });

// =====================================================================================================
// Below the east stairs: the drowned crypt
// =====================================================================================================
b.room('Crypt stair', 38, 29, 6, 3, {
  ...SLAB,
  readAloud: 'The stairs end in a low landing, ankle deep in water. Tomb-lamps of green fire still burn in niches along the walls.',
  gmNotes: 'The green lamps never go out (witchfire, cold to the touch). South: the flooded tombs. East: the sluice chamber.',
});
b.paint(38, 31, 6, 1, SHALLOW);
b.prop('stairs-up', 38, 29); b.prop('sconce-witchfire', 41, 29); b.prop('tomb-niche', 43, 29); b.prop('urn', 42, 31);

b.hall(40, 32, 40, 32, SHALLOW);
b.door(40, 32, 'n', 'closed');
b.room('Flooded tombs', 36, 33, 9, 7, {
  mat: 'water-shallow', tile: 2,
  readAloud: 'Rows of stone tombs stand up out of the water like islands. Lids have been pushed aside from within, and the water between them is very dark and very cold.',
  gmNotes: 'Shallow water, with a deep, frigid channel down the middle (swim; each minute in it, DC 10 Con save or a level of exhaustion). Ghouls and zombies wait in the open tombs. Turning the sluice winch drains this room to mud in 2 rounds, ending the swim and revealing a drowned smuggler with a pouch of 35 gp. The iron door east to the abbot\'s tomb is locked: the reliquary key, DC 18 thieves\' tools, or the verse from the hymnal opens it. A pendulum blade guards the approach (DC 14 Perception; DC 14 Dex save or 3d8 slashing).',
});
b.paint(39, 33, 3, 7, DEEP);
b.prop('deep-water', 39, 35, { v: 1 });
b.prop('sarcophagus-open', 36, 33); b.prop('sarcophagus', 37, 36); b.prop('sarcophagus-open', 43, 33); b.prop('sarcophagus-effigy', 43, 36);
b.prop('tomb-niche', 36, 39); b.prop('skull-pile', 44, 39); b.prop('sconce-witchfire', 38, 33); b.prop('glowing-fungus', 42, 39);
b.prop('trap-pendulum-axe', 42, 37, { gm: true });
b.encounter('The hungry dead', [36, 33, 9, 7], [['ghoul', 2], ['zombie', 2]], 'medium');

b.hall(44, 30, 46, 30, SLAB);
b.door(47, 30, 'w', 'closed');
b.room('Sluice chamber', 47, 22, 8, 9, {
  ...SLAB,
  readAloud: 'Water from the culvert crashes into a churning pool here. Beside it, a great chain winch and a rusted lever control a sluice gate set deep in the floor.',
  gmNotes: 'Turning the winch (action, DC 14 Athletics; two people can help) opens the sluice: the flooded tombs drain to mud and the abbot\'s tomb\'s outer ring drops to shallow water. The lever raises the portcullis south into the abbot\'s tomb. A sea-worn chest under the winch holds 2 potions of healing and 60 gp in coin stacks.',
  label: [50, 27],
});
b.paint(49, 22, 4, 4, DEEP);
b.paint(47, 28, 2, 2, SHALLOW);
b.prop('winch', 47, 25, { v: 2 }); b.prop('lever', 47, 23, { v: 3 }); b.prop('sewer-outflow', 53, 22, { v: 1 });
b.prop('chest', 48, 26); b.prop('coin-stacks', 49, 27); b.prop('potion-healing', 48, 27); b.prop('torch-sconce', 54, 27);
b.prop('chains-hanging', 53, 29); b.prop('barrel-stack', 52, 26); b.prop('debris-wood', 51, 29); b.prop('crate', 54, 24);

b.hall(50, 31, 50, 32, SLAB);
b.door(50, 33, 'n', 'locked', 'portcullis');
b.hall(45, 37, 45, 37, SLAB);
b.door(46, 37, 'w', 'locked', 'door-iron');
b.round("Abbot's tomb", 50, 37, 4, {
  mat: 'marble',
  readAloud: 'A round tomb with a moat of black water around a raised marble bier. On it lies a figure in a rotted abbot\'s robe, a shield across its chest, and water drips from its fingers as it sits up.',
  gmNotes: 'Boss fight. The abbot is a wight, attended by two ghouls that rise out of the moat. The moat is deep water (swim) until the sluice is opened, then shallow. The wight fights from the bier and uses the moat to drown foes (grappled targets dragged into deep water). Treasure on and around the bier: an enchanted shield (+1 shield), a gold chalice (150 gp), a treasure urn with 420 gp and 3 pearls (100 gp each), and coin stacks of 200 sp.',
  label: [50, 34],
});
for (let y = 33; y <= 41; y++) for (let x = 46; x <= 54; x++) if (b.floor(x, y) && ((x - 50) ** 2 + (y - 37) ** 2 > 5.5)) b.set(x, y, DEEP);
b.set(50, 33, { mat: 'marble' }); b.set(50, 34, { mat: 'marble' }); b.set(46, 37, { mat: 'marble' }); b.set(47, 37, { mat: 'marble' });
b.prop('burial-slab', 50, 36); b.prop('enchanted-shield', 51, 37); b.prop('chalices', 49, 36); b.prop('treasure-urn', 51, 36);
b.prop('coin-stacks', 49, 38); b.prop('candle-ring', 48, 35); b.prop('brazier-everburning', 52, 38);
b.encounter('The drowned abbot', [46, 33, 9, 9], [['wight', 1], ['ghoul', 2]], 'hard');

// =====================================================================================================
// South: the smugglers' tunnel, their cache and the sea cave
// =====================================================================================================
b.hall(37, 40, 37, 42, { mat: 'dirt' });
b.door(37, 40, 'n', 'closed');
b.rooms2("Smugglers' tunnel", [[11, 43, 27, 2]], {
  mat: 'dirt',
  readAloud: 'A low tunnel hacked through the rock, its floor a sucking mire. Old lantern hooks line the walls, and a rope is strung along one side as a handhold.',
  gmNotes: 'Mud: difficult terrain most of the way. A gray ooze sits in a dip pretending to be a puddle. Halfway along, a hidden pit (DC 13 Perception; 10 ft, 1d6) and a swinging log the smugglers rigged against pursuers (DC 13 Dex save or 2d6 bludgeoning and prone). A secret door in the north wall near the west end opens into their cache.',
  label: [24, 43],
});
b.paint(14, 43, 5, 2, MUD); b.paint(26, 43, 6, 2, MUD); b.paint(33, 44, 4, 1, MUD);
b.prop('lantern-hook', 21, 43); b.prop('lantern-hook', 34, 43); b.prop('rope-coil', 36, 44); b.prop('bones-mud', 28, 44);
b.prop('trap-pit-hidden', 24, 44, { gm: true }); b.prop('trap-swinging-log', 29, 43, { gm: true }); b.prop('skeleton-seated', 34, 41); b.prop('loot-sacks', 35, 42);
b.encounter('Living mire', [22, 43, 8, 2], [['gray-ooze', 1]], 'easy');

b.hall(18, 42, 18, 42, { mat: 'dirt' });
b.door(18, 42, 'n', 'secret');
b.room("Smugglers' cache", 16, 39, 5, 3, {
  mat: 'dirt',
  readAloud: 'A cramped hollow stacked with crates and casks, all stamped with marks of a dozen ports. A strongbox sits under a tarp.',
  gmNotes: 'Secret door (DC 14 Perception: a draft through the rock). Crates of brandy (6 casks, 10 gp each), bolts of fine cloth (40 gp). The strongbox has a poison needle lock (DC 13 Investigation; DC 12 Con save or 1d10 poison) and holds 180 gp in coin stacks and a potion set (2 potions of healing, 1 potion of water breathing).',
});
b.prop('crate-stack', 16, 39); b.prop('barrel-stack', 17, 39); b.prop('cargo-crates', 19, 39); b.prop('strongbox', 20, 41);
b.prop('trap-needle-lock', 20, 41, { gm: true }); b.prop('coin-stacks', 19, 41); b.prop('potion-set', 16, 41); b.prop('lantern-hook', 16, 40);

b.hall(8, 35, 8, 37, { mat: 'stone-cobble' });
b.cave('Sea cave', 8, 41, 5, 3, {
  mat: 'sand',
  readAloud: 'Grey daylight and the boom of surf fill a sea cave. A smugglers\' boat lies wrecked on the sand, and fish-scaled shapes are picking through the wreck.',
  gmNotes: 'Sahuagin raiders killed the smugglers and are looting their boat. The deep water to the west is open sea at high tide (a way out by boat or swimming, DC 12 Athletics). The ironbound chest by the wreck is a mimic. A rope ladder and a crumbling ledge climb north to the bell tower (DC 12 Athletics; the ledge collapses under more than 2 people at once, 2d6 falling).',
});
b.paint(1, 38, 3, 6, DEEP);
b.paint(4, 39, 2, 4, SHALLOW);
b.prop('rowboat', 6, 40); b.prop('mimic-chest', 10, 42, { v: 2 }); b.prop('fishing-net', 8, 38); b.prop('mooring-post', 5, 43);
b.prop('crumbling-ledge', 8, 37); b.prop('glowing-fungus', 12, 40); b.prop('campfire-cold', 9, 41); b.prop('anchor', 10, 40);
b.prop('coin-stacks', 7, 43); b.prop('ladder', 8, 36);
b.encounter('Sahuagin wreckers', [3, 37, 11, 8], [['sahuagin', 3]], 'medium');

// pockets off the smugglers' tunnel (carved last so the sea cave keeps its shape)
b.blob(34, 41.5, 1.6, 1.2, { mat: 'mud', tile: 3 });
b.blob(20, 44, 2.2, 1, { mat: 'dirt' });

b.save({
  description: 'A whole temple complex swallowed by the sea: wade the flooded nave, search the scriptorium, cloister and drowned garden, brave the whirlpool cistern or the smugglers\' tunnel, and go down into the drowned crypt where the abbot waits.',
  setting: 'dungeon',
  tags: ['dungeon', 'temple', 'water', 'undead', 'large'],
});
